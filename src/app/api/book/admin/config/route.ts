import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/book/auth';
import { bookEnv, missingEnv } from '@/lib/book/env';
import {
  BookConfigError,
  getBlackouts,
  getGoogleAccount,
  getRules,
  getSettings,
  saveSettings,
  setCalendarId,
} from '@/lib/book/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const [settings, rules, blackouts, account] = await Promise.all([
      getSettings(),
      getRules(),
      getBlackouts(),
      getGoogleAccount(),
    ]);
    return NextResponse.json({
      settings,
      rules,
      blackouts,
      google: {
        connected: Boolean(account?.refresh_token),
        email: account?.email ?? null,
        calendarId: account?.calendar_id ?? 'primary',
        connectedAt: account?.connected_at ?? null,
      },
      env: {
        missing: missingEnv(),
        emailReady: Boolean(bookEnv.resendKey && bookEnv.fromEmail),
        siteUrl: bookEnv.siteUrl,
      },
    });
  } catch (e) {
    if (e instanceof BookConfigError) {
      return NextResponse.json({ error: 'not_configured', missing: missingEnv() }, { status: 503 });
    }
    console.error('[book] admin config GET', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const patch = await req.json();
    const settings = await saveSettings(patch);
    // El calendario destino vive en dos sitios; que no se desincronicen.
    if (typeof patch.calendar_id === 'string' && patch.calendar_id) {
      try {
        await setCalendarId(settings.calendar_id);
      } catch (err) {
        console.error('[book] setCalendarId', err);
      }
    }
    return NextResponse.json({ ok: true, settings });
  } catch (e) {
    console.error('[book] admin config PUT', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
