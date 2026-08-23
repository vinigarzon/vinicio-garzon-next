import { NextResponse } from 'next/server';
import { isConfigured, ping } from '@/lib/book/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Toque de vida para la base. Los proyectos gratuitos de Supabase se pausan tras
 * ~7 días sin actividad; un cron externo llamando a esta ruta a diario evita que
 * el link de reservas amanezca caído.
 */
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }
  try {
    const ok = await ping();
    return NextResponse.json({ ok, at: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[book] ping', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
