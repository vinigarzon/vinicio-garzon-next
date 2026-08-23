import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionValue,
  isAdmin,
  MAX_AGE_SECONDS,
  passwordMatches,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/book/auth';
import { bookEnv, missingEnv } from '@/lib/book/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ authenticated: isAdmin(), missingEnv: missingEnv() });
}

export async function POST(req: NextRequest) {
  if (!bookEnv.adminPassword || !bookEnv.sessionSecret) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  if (!passwordMatches(String(body.password ?? ''))) {
    // Pequeño retardo para que probar contraseñas a ciegas sea aburrido.
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'bad_password' }, { status: 401 });
  }

  cookies().set(SESSION_COOKIE, createSessionValue(), sessionCookieOptions(MAX_AGE_SECONDS));
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  cookies().set(SESSION_COOKIE, '', sessionCookieOptions(0));
  return NextResponse.json({ ok: true });
}
