import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/book/auth';
import { GoogleNotConnectedError, listCalendars } from '@/lib/book/google';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ calendars: await listCalendars() });
  } catch (e) {
    if (e instanceof GoogleNotConnectedError) {
      return NextResponse.json({ calendars: [], error: 'not_connected' });
    }
    console.error('[book] calendars', e);
    return NextResponse.json({ calendars: [], error: 'server_error' }, { status: 500 });
  }
}
