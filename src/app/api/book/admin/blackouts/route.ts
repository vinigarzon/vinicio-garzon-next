import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/book/auth';
import { addBlackout, deleteBlackout, getBlackouts } from '@/lib/book/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const start = String(body.start_date ?? '');
    const end = String(body.end_date ?? start);
    if (!DATE_RE.test(start) || !DATE_RE.test(end) || end < start) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }
    await addBlackout(start, end, String(body.reason ?? '').slice(0, 200) || null);
    return NextResponse.json({ ok: true, blackouts: await getBlackouts() });
  } catch (e) {
    console.error('[book] blackouts POST', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  try {
    await deleteBlackout(id);
    return NextResponse.json({ ok: true, blackouts: await getBlackouts() });
  } catch (e) {
    console.error('[book] blackouts DELETE', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
