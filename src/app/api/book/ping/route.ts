import { NextResponse } from 'next/server';
import { isConfigured, ping } from '@/lib/book/store';
import { getAccessToken, GoogleApiError, GoogleNotConnectedError } from '@/lib/book/google';

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
      // El detalle importa: 'invalid_grant' significa que hay que reconectar el
      // calendario, 'invalid_client' que las credenciales de este entorno no son
      // las que autorizaron el token. Son problemas distintos.
      if (e instanceof GoogleApiError) {
        result.googleStatus = e.status;
        try {
          const parsed = JSON.parse(e.body);
          result.googleError = parsed.error ?? null;
          result.googleErrorDescription = parsed.error_description ?? null;
        } catch {
          result.googleError = e.body.slice(0, 200);
        }
      } else {
        // No todo lo que revienta aquí viene de Google: un fallo al guardar el
        // token también cae en este catch, y confundirlos cuesta horas.
        result.googleError = e instanceof Error ? e.message.slice(0, 300) : String(e).slice(0, 300);
      }
    }
  }

  // El 500 se reserva para la base: es lo que el cron viene a mantener despierto.
  // Un problema con Google se reporta en el cuerpo, con 200, para poder leerlo.
  const ok = result.db === true && result.google === 'ok';
  return NextResponse.json({ ok, ...result }, {
    status: result.db === true ? 200 : 500,
    headers: { 'Cache-Control': 'no-store' },
  });
}
