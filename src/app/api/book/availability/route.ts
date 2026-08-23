import { NextRequest, NextResponse } from 'next/server';
import { loadContext, slotsFor } from '@/lib/book/service';
import { isValidTimeZone } from '@/lib/book/time';
import { BookConfigError } from '@/lib/book/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const duration = Number(params.get('duration'));
  const tz = params.get('tz') || 'UTC';
  const from = params.get('from') || '';
  const to = params.get('to') || '';

  if (!DATE_RE.test(from) || !DATE_RE.test(to) || from > to) {
    return NextResponse.json({ error: 'Rango inválido' }, { status: 400 });
  }
  if (!Number.isFinite(duration) || duration <= 0) {
    return NextResponse.json({ error: 'Duración inválida' }, { status: 400 });
  }
  const guestTz = isValidTimeZone(tz) ? tz : 'UTC';

  try {
    const ctx = await loadContext(from, to);
    const ready = ctx.settings.active && ctx.googleConnected;
    const days = ready ? slotsFor(ctx, { duration, guestTz, fromKey: from, toKey: to }) : {};
    return NextResponse.json(
      { ready, days, timezone: guestTz, hostTimezone: ctx.settings.timezone },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    if (e instanceof BookConfigError) {
      return NextResponse.json({ ready: false, days: {}, error: 'not_configured' }, { status: 200 });
    }
    console.error('[book] availability', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
