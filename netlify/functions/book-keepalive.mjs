/**
 * Latido diario del módulo de reservas.
 *
 * Hace dos trabajos:
 *  1. Llama a /api/book/ping, que toca la base y refresca el token de Google.
 *     Los proyectos gratuitos de Supabase se pausan tras ~7 días sin actividad,
 *     y sin esto el link de reservas amanecería caído sin aviso.
 *  2. Si algo viene mal, avisa por correo. La lección del 26 de agosto fue que
 *     un fallo silencioso se descubre días tarde y por casualidad.
 *
 * Netlify solo ejecuta funciones programadas en deploys publicados.
 */

const PING_PATH = '/api/book/ping';

export default async () => {
  const base = (process.env.URL || 'https://www.viniciogarzon.com').replace(/\/$/, '');
  let status = 0;
  let body = {};

  try {
    const res = await fetch(`${base}${PING_PATH}`, { headers: { 'user-agent': 'book-keepalive' } });
    status = res.status;
    body = await res.json().catch(() => ({}));
  } catch (e) {
    body = { ok: false, fetchError: String(e).slice(0, 300) };
  }

  const healthy = status === 200 && body.ok === true;
  console.log(`[book] keepalive status=${status} healthy=${healthy} ${JSON.stringify(body)}`);

  if (!healthy) await alert(base, status, body);

  return new Response(JSON.stringify({ healthy, status, ...body }), {
    status: healthy ? 200 : 500,
    headers: { 'content-type': 'application/json' },
  });
};

/** Correo de aviso, en texto plano y directo al grano. */
async function alert(base, status, body) {
  const key = process.env.BOOK_RESEND_API_KEY;
  const from = process.env.BOOK_FROM_EMAIL;
  const to = process.env.BOOK_HOST_EMAIL;
  if (!key || !from || !to) {
    console.error('[book] keepalive: no puedo avisar, falta configuración de Resend');
    return;
  }

  const lines = [
    'El chequeo diario de la página de reservas falló.',
    '',
    `Respuesta HTTP: ${status}`,
    `Base de datos:  ${body.db === true ? 'ok' : 'FALLA'}`,
    `Google Calendar: ${body.google ?? 'desconocido'}`,
    body.googleError ? `Detalle: ${body.googleError}` : null,
    body.googleErrorDescription ? `           ${body.googleErrorDescription}` : null,
    body.fetchError ? `Error de red: ${body.fetchError}` : null,
    '',
    'Qué suele significar:',
    '  · db en FALLA → el proyecto de Supabase se pausó o está caído.',
    '  · google invalid_grant → hay que reconectar el calendario en /book/admin.',
    '  · google not_connected → no hay calendario conectado.',
    '',
    `Diagnóstico completo: ${base}${PING_PATH}`,
    `Admin: ${base}/book/admin`,
    '',
    'Mientras tanto la página de reservas no puede ofrecer horarios.',
  ].filter(Boolean);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        subject: '⚠️ La página de reservas no está respondiendo',
        text: lines.join('\n'),
      }),
    });
    if (!res.ok) console.error('[book] keepalive: Resend respondió', res.status, await res.text());
  } catch (e) {
    console.error('[book] keepalive: no se pudo enviar el aviso', e);
  }
}

export const config = {
  schedule: '@daily',
};
