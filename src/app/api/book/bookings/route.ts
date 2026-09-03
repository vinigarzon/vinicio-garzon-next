import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { assertBookable, BookingRejected, renderTemplate } from '@/lib/book/service';
import { attachGoogleEvent, countRecentByIp, insertBooking, markCancelled, SlotTakenError } from '@/lib/book/store';
import { createEvent, GoogleApiError, GoogleNotConnectedError } from '@/lib/book/google';
import { sendGuestConfirmation, sendHostNewBooking } from '@/lib/book/email';
import { isValidTimeZone } from '@/lib/book/time';
import type { Lang } from '@/lib/book/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_PER_IP_PER_DAY = 5;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  // Honeypot: un bot rellena todos los campos, una persona no ve este.
  if (body.company) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const name = String(body.name ?? '').trim().slice(0, 120);
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 200);
  const notes = String(body.notes ?? '').trim().slice(0, 2000) || null;
  const duration = Number(body.duration);
  const startIso = String(body.start ?? '');
  const guestTz = isValidTimeZone(String(body.tz ?? '')) ? String(body.tz) : 'UTC';
  const lang: Lang = body.lang === 'es' ? 'es' : 'en';

  if (!name || !email) return NextResponse.json({ error: 'required' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'email' }, { status: 400 });

  const ip = clientIp(req);

  try {
    if (ip && (await countRecentByIp(ip)) >= MAX_PER_IP_PER_DAY) {
      return NextResponse.json({ error: 'rate_limit' }, { status: 429 });
    }

    const { ctx, endIso } = await assertBookable(startIso, duration, guestTz);
    const settings = ctx.settings;

    const booking = await insertBooking({
      manage_token: crypto.randomBytes(24).toString('base64url'),
      name,
      email,
      notes,
      start_utc: new Date(startIso).toISOString(),
      end_utc: endIso,
      duration_min: duration,
      guest_tz: guestTz,
      guest_lang: lang,
      ip,
    });

    // El evento de Google es la fuente de verdad del calendario. Si falla, la
    // reserva se revierte para no dejar una cita fantasma en la base.
    let eventId: string;
    try {
      eventId = await createEvent({
        summary: renderTemplate(settings.event_title, { name, host: settings.host_name }),
        description: renderTemplate(settings.event_description, {
          name,
          host: settings.host_name,
          zoom: settings.zoom_link,
          notes: notes ?? '',
        }),
        location: settings.zoom_link || '',
        startIso: new Date(startIso).toISOString(),
        endIso,
        timeZone: settings.timezone,
        guestName: name,
        guestEmail: email,
      });
    } catch (err) {
      await markCancelled(booking.id, 'system');
      console.error('[book] createEvent falló, reserva revertida', err);
      const status = err instanceof GoogleNotConnectedError ? 503 : 502;
      return NextResponse.json({ error: 'calendar' }, { status });
    }

    await attachGoogleEvent(booking.id, eventId);
    const full = { ...booking, google_event_id: eventId };

    // Los correos no bloquean la respuesta ni pueden romper la reserva.
    await Promise.allSettled([
      sendGuestConfirmation({ booking: full, settings, lang }),
      sendHostNewBooking({ booking: full, settings, lang }),
    ]);

    return NextResponse.json({
      ok: true,
      booking: {
        start: full.start_utc,
        end: full.end_utc,
        duration: full.duration_min,
        email: full.email,
        manageToken: full.manage_token,
        zoomLink: settings.zoom_link,
        hostName: settings.host_name,
      },
    });
  } catch (e) {
    if (e instanceof SlotTakenError) return NextResponse.json({ error: 'slot' }, { status: 409 });
    if (e instanceof BookingRejected) {
      const status = e.reason === 'slot' ? 409 : e.reason === 'closed' ? 503 : 400;
      return NextResponse.json({ error: e.reason }, { status });
    }
    // Google falló al comprobar la disponibilidad (antes de crear nada).
    // Mismo trato que en /availability: decirlo con claridad, no un 500 mudo.
    if (e instanceof GoogleApiError || e instanceof GoogleNotConnectedError) {
      console.error('[book] create booking: Google rechazó la comprobación de disponibilidad', e);
      return NextResponse.json({ error: 'calendar' }, { status: 503 });
    }
    console.error('[book] create booking', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for');
  if (!fwd) return null;
  return fwd.split(',')[0].trim().slice(0, 60) || null;
}
