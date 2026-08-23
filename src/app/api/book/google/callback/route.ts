import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, OAUTH_STATE_COOKIE } from '@/lib/book/auth';
import { bookEnv } from '@/lib/book/env';
import { exchangeCode, fetchUserEmail } from '@/lib/book/google';
import { getGoogleAccount, getSettings, saveGoogleAccount } from '@/lib/book/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = `${bookEnv.siteUrl}/book/admin`;
  const params = req.nextUrl.searchParams;

  if (!isAdmin()) return NextResponse.redirect(admin);
  if (params.get('error')) return NextResponse.redirect(`${admin}?error=google_denied`);

  const expected = cookies().get(OAUTH_STATE_COOKIE)?.value;
  cookies().delete(OAUTH_STATE_COOKIE);
  if (!expected || params.get('state') !== expected) {
    return NextResponse.redirect(`${admin}?error=google_state`);
  }

  const code = params.get('code');
  if (!code) return NextResponse.redirect(`${admin}?error=google_code`);

  try {
    const tokens = await exchangeCode(code);
    const existing = await getGoogleAccount();
    const refresh_token = tokens.refresh_token || existing?.refresh_token;
    if (!refresh_token) return NextResponse.redirect(`${admin}?error=google_norefresh`);

    const email = await fetchUserEmail(tokens.access_token);
    const settings = await getSettings();

    await saveGoogleAccount({
      email,
      refresh_token,
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      calendar_id: existing?.calendar_id || settings.calendar_id || 'primary',
      scope: tokens.scope,
      connected_at: new Date().toISOString(),
    });

    return NextResponse.redirect(`${admin}?connected=1`);
  } catch (e) {
    console.error('[book] google callback', e);
    return NextResponse.redirect(`${admin}?error=google_exchange`);
  }
}
