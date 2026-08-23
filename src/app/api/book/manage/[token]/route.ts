import { NextRequest, NextResponse } from 'next/server';
import { assertBookable, BookingRejected } from '@/lib/book/service';
import { getBookingByToken, getSettings, markCancelled, moveBooking, SlotTakenError } from '@/lib/book/store';
import { deleteEvent, moveEvent } from '@/lib/book/google';
import {
  sendGuestCancelled,
  sendGuestRescheduled,
  sendHostCancelled,
  sendHostRescheduled,
} from '@/lib/book/email';
import type { Lang } from '@/lib/book/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { token: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const booking = await getBookingByToken(params.token);
    if (!booking) return NextResponse.json({ error: 'notfound' }, { status: 404 });
    const settings = await getSettings();
    return NextResponse.json({ booking: publicView(booking), policy: policyFor(booking, settings) });
  } catch (e) {
    console.error('[book] manage GET', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  try {
    const booking = await getBookingByToken(params.token);
    if (!booking) return NextResponse.json({ error: 'notfound' }, { status: 404 });
    if (booking.status !== 'confirmed') return NextResponse.json({ error: 'cancelled' }, { status: 409 });

    const settings = await getSettings();
    const policy = policyFor(booking, settings);
    const lang: Lang = (booking.guest_lang === 'es' ? 'es' : 'en') as Lang;

    if (body.action === 'cancel') {
      if (!policy.canCancel) return NextResponse.json({ error: 'cutoff' }, { status: 403 });
      if (booking.google_event_id) {
        try {
          await deleteEvent(booking.google_event_id);
        } catch (err) {
          console.error('[book] deleteEvent', err);
          return NextResponse.json({ error: 'calendar' }, { status: 502 });
        }
      }
      await markCancelled(booking.id, 'guest');
      const cancelled = { ...booking, status: 'cancelled' as const };
      await Promise.allSettled([
        sendGuestCancelled({ booking: cancelled, settings, lang }),
        sendHostCancelled({ booking: cancelled, settings, lang, by: 'guest' }),
      ]);
      return NextResponse.json({ ok: true, status: 'cancelled' });
    }

    if (body.action === 'reschedule') {
      if (!policy.canReschedule) return NextResponse.json({ error: 'cutoff' }, { status: 403 });

      const startIso = String(body.start ?? '');
      const { endIso } = await assertBookable(startIso, booking.duration_min, booking.guest_tz, booking.id);
      const previousIso = booking.start_utc;

      const moved = await moveBooking(booking.id, new Date(startIso).toISOString(), endIso);
      if (booking.google_event_id) {
        try {
          await moveEvent(booking.google_event_id, moved.start_utc, moved.end_utc, settings.timezone);
        } catch (err) {
          // Deshacemos para que base y calendario no queden desalineados.
          await moveBooking(booking.id, previousIso, booking.end_utc);
          console.error('[book] moveEvent', err);
          return NextResponse.json({ error: 'calendar' }, { status: 502 });
        }
      }

      await Promise.allSettled([
        sendGuestRescheduled({ booking: moved, settings, lang, previousIso }),
        sendHostRescheduled({ booking: moved, settings, lang, previousIso }),
      ]);
      return NextResponse.json({ ok: true, booking: publicView(moved) });
    }

    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  } catch (e) {
    if (e instanceof SlotTakenError) return NextResponse.json({ error: 'slot' }, { status: 409 });
    if (e instanceof BookingRejected) {
      const status = e.reason === 'slot' ? 409 : e.reason === 'closed' ? 503 : 400;
      return NextResponse.json({ error: e.reason }, { status });
    }
    console.error('[book] manage POST', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

function publicView(b: Awaited<ReturnType<typeof getBookingByToken>>) {
  if (!b) return null;
  return {
    name: b.name,
    email: b.email,
    notes: b.notes,
    start: b.start_utc,
    end: b.end_utc,
    duration: b.duration_min,
    tz: b.guest_tz,
    lang: b.guest_lang,
    status: b.status,
  };
}

function policyFor(
  b: NonNullable<Awaited<ReturnType<typeof getBookingByToken>>>,
  s: Awaited<ReturnType<typeof getSettings>>
) {
  const hoursUntil = (new Date(b.start_utc).getTime() - Date.now()) / 3_600_000;
  const active = b.status === 'confirmed' && hoursUntil > 0;
  return {
    hoursUntil,
    isPast: hoursUntil <= 0,
    canCancel: active && s.allow_cancel && hoursUntil >= s.cancel_cutoff_hours,
    canReschedule: active && s.allow_reschedule && hoursUntil >= s.reschedule_cutoff_hours,
    allowCancel: s.allow_cancel,
    allowReschedule: s.allow_reschedule,
    hostName: s.host_name,
    zoomLink: s.zoom_link,
    zoomNote: s.zoom_note,
    durations: s.durations,
  };
}
