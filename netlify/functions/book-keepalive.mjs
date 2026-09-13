/**
 * Latido diario del módulo de reservas.
 *
 * Hace dos trabajos:
 *  1. Llama a /api/book/ping, que toca la base y verifica el token de Google
 *     contra Google. Los proyectos gratuitos de Supabase se pausan tras ~7 días
 *     sin actividad, y sin esto el link de reservas amanecería caído sin aviso.
 *  2. Si algo viene mal, avisa por correo. La lección del 26 de agosto fue que
 *     un fallo silencioso se descubre días tarde y por casualidad.
 *
 * Un solo chequeo fallido no basta para avisar: Google tiene parpadeos de
 * segundos, y el 12 de septiembre uno de esos disparó un correo por nada.
 * Ahora, si el primer intento falla, espera y vuelve a preguntar; solo avisa
 * si el problema persiste.
 *
 * Netlify solo ejecuta funciones programadas en deploys publicados y les da
 * 30 s en total, así que la espera entre intentos es corta.
 */

const PING_PATH = '/api/book/ping';
const RETRY_DELAY_MS = 8_000;

export default async () => {
  const base = (process.env.URL || 'https://www.viniciogarzon.com').replace(/\/$/, '');

  let check = await ping(base);
  if (!check.healthy) {
    console.log(`[book] keepalive primer intento falló (${describe(check)}); reintento en ${RETRY_DELAY_MS / 1000}s`);
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    check = await ping(base);
  }

  console.log(`[book] keepalive status=${check.status} healthy=${check.healthy} ${JSON.stringify(check.body)}`);

  if (!check.healthy) await alert(base, check);

  return new Response(JSON.stringify({ healthy: check.healthy, status: check.status, ...check.body }), {
    status: check.healthy ? 200 : 500,
    headers: { 'content-type': 'application/json' },
  });
};

async function ping(base) {
  let status = 0;
  let body = {};
  try {
    const res = await fetch(`${base}${PING_PATH}`, { headers: { 'user-agent': 'book-keepalive' } });
    status = res.status;
    body = await res.json().catch(() => ({}));
  } catch (e) {
    body = { ok: false, fetchError: String(e).slice(0, 300) };
  }
  return { status, body, healthy: status === 200 && body.ok === true };
}

/** Cualquier valor a texto legible: objetos a JSON, nunca "[object Object]". */
function text(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function describe(check) {
  const b = check.body || {};
  return `db=${b.db} google=${b.google}${b.googleError ? ' ' + text(b.googleError) : ''}`;
}

/** Correo de aviso, en texto plano y directo al grano. */
async function alert(base, check) {
  const key = process.env.BOOK_RESEND_API_KEY;
  const from = process.env.BOOK_FROM_EMAIL;
  const to = process.env.BOOK_HOST_EMAIL;
  if (!key || !from || !to) {
    console.error('[book] keepalive: no puedo avisar, falta configuración de Resend');
    return;
  }

  const { status, body } = check;
  const lines = [
    'El chequeo diario de la página de reservas falló dos veces seguidas.',
    '',
    `Respuesta HTTP: ${status}`,
    `Base de datos:  ${body.db === true ? 'ok' : 'FALLA'}`,
    `Google Calendar: ${text(body.google) || 'desconocido'}`,
    body.googleStatus ? `Código de Google: ${text(body.googleStatus)}` : null,
    body.googleError ? `Error: ${text(body.googleError)}` : null,
    body.googleErrorDescription ? `Detalle: ${text(body.googleErrorDescription)}` : null,
    body.fetchError ? `Error de red: ${text(body.fetchError)}` : null,
    '',
    'Qué suele significar:',
    '  · db en FALLA → el proyecto de Supabase se pausó o está caído.',
    '  · google invalid_grant → hay que reconectar el calendario en /book/admin.',
    '  · google not_connected → no hay calendario conectado.',
    '  · google UNAUTHENTICATED o 401 persistente → reconectar el calendario en /book/admin.',
    '  · google 5xx → Google está caído; suele resolverse solo, revisa en una hora.',
    '',
    `Diagnóstico completo: ${base}${PING_PATH}`,
    `Admin: ${base}/book/admin`,
    '',
    'Mientras tanto la página de reservas puede no ofrecer horarios.',
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
