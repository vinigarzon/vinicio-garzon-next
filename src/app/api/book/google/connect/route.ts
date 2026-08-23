import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAdmin, OAUTH_STATE_COOKIE, sessionCookieOptions } from '@/lib/book/auth';
import { bookEnv } from '@/lib/book/env';
import { buildAuthUrl } from '@/lib/book/google';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdmin()) return NextResponse.redirect(`${bookEnv.siteUrl}/book/admin`);
  if (!bookEnv.googleClientId || !bookEnv.googleClientSecret) {
    return NextResponse.redirect(`${bookEnv.siteUrl}/book/admin?error=google_env`);
  }

  const state = crypto.randomBytes(16).toString('base64url');
  cookies().set(OAUTH_STATE_COOKIE, state, sessionCookieOptions(600));
  return NextResponse.redirect(buildAuthUrl(state));
}
