import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/book/auth';
import { deleteGoogleAccount } from '@/lib/book/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    await deleteGoogleAccount();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[book] disconnect', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
