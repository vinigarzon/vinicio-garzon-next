import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/book/auth';
import { getRules, replaceRules } from '@/lib/book/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    if (!Array.isArray(body.rules)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    await replaceRules(body.rules);
    return NextResponse.json({ ok: true, rules: await getRules() });
  } catch (e) {
    console.error('[book] admin rules PUT', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
