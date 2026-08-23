import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/book/auth';
import { getBookingById, getSettings, listBookings, markCancelled } from '@/lib/book/store';
import { deleteEvent } from '@/lib/book/google';
import { sendGuestCancelled, sendHostCancelled } from '@/lib/book/email';
import type { Lang } from '@/lib/book/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ bookings: await listBookings(300) });
  } catch (e) {
    console.error('[book] admin bookings GET', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    if (body.action !== 'cancel') return NextResponse.json({ error: 'invalid' }, { status: 400 });

    const booking = await getBookingById(String(body.id ?? ''));
    if (!booking) return NextResponse.json({ error: 'notfound' }, { status: 404 });
    if (booking.status !== 'confirmed') return NextResponse.json({ ok: true });

    if (booking.google_event_id) {
      try {
        await deleteEvent(booking.google_event_id);
      } catch (err) {
        console.error('[book] admin cancel deleteEvent', err);
      }
    }
    await markCancelled(booking.id, 'host');

    const settings = await getSettings();
    const lang: Lang = booking.guest_lang === 'es' ? 'es' : 'en';
    const cancelled = { ...booking, status: 'cancelled' as const };
    await Promise.allSettled([
      sendGuestCancelled({ booking: cancelled, settings, lang }),
      sendHostCancelled({ booking: cancelled, settings, lang, by: 'host' }),
    ]);

    return NextResponse.json({ ok: true, bookings: await listBookings(300) });
  } catch (e) {
    console.error('[book] admin bookings POST', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
