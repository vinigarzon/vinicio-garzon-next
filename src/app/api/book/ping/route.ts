import { NextResponse } from 'next/server';
import { isConfigured, ping } from '@/lib/book/store';
import { getAccessToken, GoogleNotConnectedError } from '@/lib/book/google';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Toque de vida diario. Hace dos cosas:
 *
 * 1. Toca la base. Los proyectos gratuitos de Supabase se pausan tras ~7 días
 *    sin actividad, y el link de reservas amanecería caído.
 * 2. Refresca el token de Google. Un refresh token que no se usa en 6 meses
 *    queda revocado; usarlo a diario lo mantiene vivo para siempre y además
 *    delata el problema aquí, no delante de alguien intentando agendar.
 */
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  const result: Record<string, unknown> = { at: new Date().toISOString() };

  try {
    result.db = await ping();
  } catch (e) {
    console.error('[book] ping db', e);
    result.db = false;
  }

  try {
    await getAccessToken();
    result.google = 'ok';
  } catch (e) {
    if (e instanceof GoogleNotConnectedError) {
      result.google = 'not_connected';
    } else {
      console.error('[book] ping google', e);
      result.google = 'error';
    }
  }

  const ok = result.db === true && result.google !== 'error';
  return NextResponse.json({ ok, ...result }, {
    status: ok ? 200 : 500,
    headers: { 'Cache-Control': 'no-store' },
  });
}
