// Correos con Resend. Ningún fallo aquí puede tumbar una reserva: si el envío
// falla se registra en consola y seguimos — la invitación de Google ya salió.
//
// Nota de diseño: el cuerpo del correo es claro a propósito. Un correo
// completamente oscuro se ve "cortado" en casi todos los clientes, porque el
// área que rodea al mensaje la pinta el cliente (blanca) y no el correo. La
// marca vive en la cabecera oscura con el logo y en el acento lima.

import { bookEnv } from './env';
import { formatDateTime, tzLabel } from './time';
import type { Lang } from './i18n';
import type { Booking, BookSettings } from './types';

const ACCENT = '#c9f31d';
const DARK = '#0a0a0a';
const INK = '#101012';
const MUTED = '#6f6f76';
const LINE = '#e7e7ea';
const PAGE = '#f4f4f5';
const CARD = '#ffffff';

// Las imágenes de un correo necesitan URL absoluta y pública: apuntamos siempre
// al dominio de producción, también en desarrollo, para poder revisar el diseño.
const ASSET_BASE = (process.env.BOOK_EMAIL_ASSET_BASE || 'https://www.viniciogarzon.com').replace(/\/$/, '');
const LOGO = `${ASSET_BASE}/images/email-logo.png`;
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

interface LayoutOpts {
  title: string;
  preheader: string;
  body: string;
  footer: string;
  eyebrow?: string;
}

function layout({ title, preheader, body, footer, eyebrow }: LayoutOpts): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(title)}</title>
<style>
  /* Evita que iOS pinte de azul las fechas y dominios que detecta solo */
  a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}
  @media (max-width:620px){
    .wrap{padding:16px 12px!important}
    .pad{padding:24px 22px!important}
    .h1{font-size:24px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${PAGE};">
  <!-- línea de vista previa en la bandeja, invisible en el cuerpo -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0;">${escapeHtml(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE};">
    <tr><td align="center" class="wrap" style="padding:32px 16px;">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${CARD};border:1px solid ${LINE};border-radius:18px;overflow:hidden;">

        <!-- cabecera oscura con el logo -->
        <tr><td style="background:${DARK};padding:22px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:middle;padding-right:12px;">
                <img src="${LOGO}" width="34" height="34" alt="VG"
                     style="display:block;width:34px;height:34px;border:0;outline:none;">
              </td>
              <td style="vertical-align:middle;">
                <span style="font:600 12px/1.2 ${FONT};letter-spacing:.22em;text-transform:uppercase;color:#ffffff;">Vinicio&nbsp;Garzón</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- contenido -->
        <tr><td class="pad" style="padding:32px 28px;">
          ${eyebrow ? `<p style="margin:0 0 10px 0;font:600 11px/1.2 ${FONT};letter-spacing:.2em;text-transform:uppercase;color:#6e7d10;">${escapeHtml(eyebrow)}</p>` : ''}
          <h1 class="h1" style="margin:0 0 18px 0;font:700 27px/1.2 ${FONT};color:${INK};letter-spacing:-0.02em;">${escapeHtml(title)}</h1>
          ${body}
        </td></tr>
      </table>

      <p style="max-width:560px;margin:18px auto 0;font:400 12px/1.7 ${FONT};color:${MUTED};text-align:center;">${footer}</p>

    </td></tr>
  </table>
</body>
</html>`;
}

function paragraph(html: string, marginBottom = 18): string {
  return `<p style="margin:0 0 ${marginBottom}px 0;font:400 15px/1.65 ${FONT};color:#3a3a41;">${html}</p>`;
}

/** Bloque de datos de la cita: etiqueta a la izquierda, valor a la derecha. */
function details(rows: Array<[string, string]>): string {
  const cells = rows
    .map(
      ([label, value], i) => `<tr>
        <td style="padding:${i === 0 ? '0' : '12px'} 16px 12px 0;font:400 13px/1.5 ${FONT};color:${MUTED};white-space:nowrap;vertical-align:top;width:96px;">${escapeHtml(label)}</td>
        <td style="padding:${i === 0 ? '0' : '12px'} 0 12px 0;font:600 15px/1.5 ${FONT};color:${INK};vertical-align:top;">${value}</td>
      </tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="margin:0 0 26px 0;padding:20px;background:#fafafb;border:1px solid ${LINE};border-radius:12px;">
      ${cells}
    </table>`;
}

/** Botón sólido. Se dibuja con tabla para que Outlook no lo destroce. */
function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 4px 0;">
    <tr><td align="center" bgcolor="${ACCENT}" style="border-radius:999px;">
      <a href="${escapeAttr(href)}" target="_blank"
         style="display:inline-block;padding:14px 30px;font:700 15px/1 ${FONT};color:${DARK};text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;
}

function link(href: string, label: string, color = '#5b6b0c'): string {
  return `<a href="${escapeAttr(href)}" target="_blank" style="color:${color};text-decoration:underline;">${escapeHtml(label)}</a>`;
}

/** El dominio en el pie: enlace discreto, nunca el azul por defecto. */
function siteFooter(text: string): string {
  return `${escapeHtml(text)} <a href="${escapeAttr(bookEnv.siteUrl)}" target="_blank" style="color:${MUTED};text-decoration:underline;">viniciogarzon.com</a>`;
}

export function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

async function send(to: string, subject: string, html: string, replyTo?: string): Promise<boolean> {
  if (!bookEnv.resendKey || !bookEnv.fromEmail || !to) return false;
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(bookEnv.resendKey);
    const { error } = await resend.emails.send({
      from: bookEnv.fromEmail,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error('[book] Resend error', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[book] Resend threw', e);
    return false;
  }
}

interface Ctx {
  booking: Booking;
  settings: BookSettings;
  lang: Lang;
}

function guestWhen({ booking, lang }: Ctx): string {
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  return `${escapeHtml(formatDateTime(booking.start_utc, booking.guest_tz, locale))}<br><span style="font-weight:400;color:${MUTED};font-size:13px;">${escapeHtml(
    tzLabel(booking.guest_tz, locale)
  )} · ${escapeHtml(booking.guest_tz.replace(/_/g, ' '))}</span>`;
}

function hostWhen({ booking, settings }: Ctx): string {
  return `${escapeHtml(formatDateTime(booking.start_utc, settings.timezone, 'en-US'))}<br><span style="font-weight:400;color:${MUTED};font-size:13px;">${escapeHtml(
    settings.timezone.replace(/_/g, ' ')
  )}</span>`;
}

function manageUrl(booking: Booking, lang: Lang): string {
  return `${bookEnv.siteUrl}/book/manage/${booking.manage_token}?lang=${lang}`;
}

function firstName(name: string): string {
  return escapeHtml((name || '').trim().split(/\s+/)[0] || '');
}

/* ------------------------------------------------------ al invitado ------ */

export async function sendGuestConfirmation(ctx: Ctx) {
  const { booking, settings, lang } = ctx;
  const es = lang === 'es';

  const zoom = settings.zoom_link
    ? button(settings.zoom_link, es ? 'Entrar por Zoom' : 'Join on Zoom') +
      (settings.zoom_note
        ? `<p style="margin:10px 0 0 0;font:400 13px/1.6 ${FONT};color:${MUTED};">${escapeHtml(settings.zoom_note)}</p>`
        : '')
    : '';

  const html = layout({
    eyebrow: es ? 'Reunión confirmada' : 'Meeting confirmed',
    title: es ? `Nos vemos, ${firstName(booking.name)}` : `See you then, ${firstName(booking.name)}`,
    preheader: es
      ? `${formatDateTime(booking.start_utc, booking.guest_tz, 'es-ES')} · ${booking.duration_min} min`
      : `${formatDateTime(booking.start_utc, booking.guest_tz, 'en-US')} · ${booking.duration_min} min`,
    body:
      paragraph(
        es
          ? 'Tu reunión quedó agendada. En un momento te llega también la invitación de Google Calendar, así no se te pasa.'
          : "Your meeting is on the calendar. A Google Calendar invite is on its way too, so it won't slip past you."
      ) +
      details([
        [es ? 'Con' : 'With', escapeHtml(settings.host_name)],
        [es ? 'Cuándo' : 'When', guestWhen(ctx)],
        [es ? 'Duración' : 'Duration', `${booking.duration_min} min`],
      ]) +
      zoom +
      `<p style="margin:26px 0 0 0;padding-top:20px;border-top:1px solid ${LINE};font:400 13px/1.6 ${FONT};color:${MUTED};">
        ${es ? '¿Necesitas cancelar o cambiar la hora?' : 'Need to cancel or move it?'}
        ${link(manageUrl(booking, lang), es ? 'Gestiona tu reunión aquí' : 'Manage your meeting here')}.
      </p>`,
    footer: siteFooter(
      es ? 'Te llegó este correo porque agendaste en' : 'You got this because you booked a time at'
    ),
  });

  return send(
    booking.email,
    es ? `Confirmado: reunión con ${settings.host_name}` : `Confirmed: meeting with ${settings.host_name}`,
    html,
    settings.host_email
  );
}

export async function sendGuestCancelled(ctx: Ctx) {
  const { booking, settings, lang } = ctx;
  const es = lang === 'es';
  const locale = es ? 'es-ES' : 'en-US';

  const html = layout({
    eyebrow: es ? 'Cancelada' : 'Cancelled',
    title: es ? 'Reunión cancelada' : 'Meeting cancelled',
    preheader: es ? 'La reunión salió del calendario.' : 'The meeting is off the calendar.',
    body:
      paragraph(
        es
          ? 'Esta reunión se canceló y ya salió del calendario. Si fue un error, puedes agendar otro horario cuando quieras.'
          : 'This meeting was cancelled and is off the calendar. If that was a mistake, you can grab another time whenever you like.'
      ) +
      details([
        [es ? 'Era' : 'Was', `<span style="color:${MUTED};text-decoration:line-through;">${escapeHtml(formatDateTime(booking.start_utc, booking.guest_tz, locale))}</span>`],
        [es ? 'Con' : 'With', escapeHtml(settings.host_name)],
      ]) +
      button(`${bookEnv.siteUrl}/book?lang=${lang}`, es ? 'Agendar otro horario' : 'Book another time'),
    footer: siteFooter(es ? 'Agenda cuando quieras en' : 'Book any time at'),
  });

  return send(booking.email, es ? 'Reunión cancelada' : 'Meeting cancelled', html, settings.host_email);
}

export async function sendGuestRescheduled(ctx: Ctx & { previousIso: string }) {
  const { booking, settings, lang, previousIso } = ctx;
  const es = lang === 'es';
  const locale = es ? 'es-ES' : 'en-US';

  const html = layout({
    eyebrow: es ? 'Nueva hora' : 'New time',
    title: es ? 'Movimos la reunión' : 'Your meeting moved',
    preheader: `${formatDateTime(booking.start_utc, booking.guest_tz, locale)}`,
    body:
      paragraph(
        es
          ? 'Listo, quedó en el nuevo horario. La invitación de calendario ya se actualizó sola.'
          : "Done — it's set for the new time, and your calendar invite already updated itself."
      ) +
      details([
        [es ? 'Antes' : 'Was', `<span style="color:${MUTED};text-decoration:line-through;font-weight:400;">${escapeHtml(formatDateTime(previousIso, booking.guest_tz, locale))}</span>`],
        [es ? 'Ahora' : 'Now', guestWhen(ctx)],
        [es ? 'Duración' : 'Duration', `${booking.duration_min} min`],
      ]) +
      (settings.zoom_link ? button(settings.zoom_link, es ? 'Entrar por Zoom' : 'Join on Zoom') : '') +
      `<p style="margin:26px 0 0 0;padding-top:20px;border-top:1px solid ${LINE};font:400 13px/1.6 ${FONT};color:${MUTED};">
        ${link(manageUrl(booking, lang), es ? 'Gestionar la reunión' : 'Manage this meeting')}
      </p>`,
    footer: siteFooter(es ? 'Agendaste en' : 'You booked at'),
  });

  return send(booking.email, es ? 'Tu reunión se movió' : 'Your meeting moved', html, settings.host_email);
}

/* --------------------------------------------------------- a Vinicio ----- */

function hostDetails(ctx: Ctx, extra: Array<[string, string]> = []): string {
  const { booking } = ctx;
  const rows: Array<[string, string]> = [
    [
      'Who',
      `${escapeHtml(booking.name)}<br><a href="mailto:${escapeAttr(booking.email)}" style="font-weight:400;font-size:13px;color:#5b6b0c;text-decoration:underline;">${escapeHtml(booking.email)}</a>`,
    ],
    ['Your time', hostWhen(ctx)],
    [
      'Their time',
      `${escapeHtml(formatDateTime(booking.start_utc, booking.guest_tz, 'en-US'))}<br><span style="font-weight:400;color:${MUTED};font-size:13px;">${escapeHtml(booking.guest_tz.replace(/_/g, ' '))}</span>`,
    ],
    ['Duration', `${booking.duration_min} min`],
  ];
  if (booking.notes) rows.push(['Notes', `<span style="font-weight:400;">${escapeHtml(booking.notes).replace(/\n/g, '<br>')}</span>`]);
  return details([...rows, ...extra]);
}

export async function sendHostNewBooking(ctx: Ctx) {
  const to = bookEnv.hostEmail || ctx.settings.host_email;
  const html = layout({
    eyebrow: 'New booking',
    title: `${ctx.booking.name} booked you`,
    preheader: `${formatDateTime(ctx.booking.start_utc, ctx.settings.timezone, 'en-US')} · ${ctx.booking.duration_min} min`,
    body:
      hostDetails(ctx) +
      button(`${bookEnv.siteUrl}/book/admin`, 'Open admin') +
      `<p style="margin:18px 0 0 0;font:400 13px/1.6 ${FONT};color:${MUTED};">Reply to this email to reach ${escapeHtml(ctx.booking.name.split(' ')[0])} directly.</p>`,
    footer: siteFooter('Automatic notice from'),
  });
  return send(to, `New booking · ${ctx.booking.name}`, html, ctx.booking.email);
}

export async function sendHostCancelled(ctx: Ctx & { by: string }) {
  const to = bookEnv.hostEmail || ctx.settings.host_email;
  const who = ctx.by === 'guest' ? ctx.booking.name : ctx.by === 'host' ? 'you' : 'the system';
  const html = layout({
    eyebrow: 'Cancelled',
    title: 'A booking was cancelled',
    preheader: `Cancelled by ${who}`,
    body: paragraph(`Cancelled by <strong>${escapeHtml(who)}</strong>. The slot is free again.`) + hostDetails(ctx),
    footer: siteFooter('Automatic notice from'),
  });
  return send(to, `Cancelled · ${ctx.booking.name}`, html);
}

export async function sendHostRescheduled(ctx: Ctx & { previousIso: string }) {
  const to = bookEnv.hostEmail || ctx.settings.host_email;
  const previous = formatDateTime(ctx.previousIso, ctx.settings.timezone, 'en-US');
  const html = layout({
    eyebrow: 'Moved',
    title: `${ctx.booking.name} moved your meeting`,
    preheader: `Now ${formatDateTime(ctx.booking.start_utc, ctx.settings.timezone, 'en-US')}`,
    body: hostDetails(ctx, [
      ['Previously', `<span style="color:${MUTED};text-decoration:line-through;font-weight:400;">${escapeHtml(previous)}</span>`],
    ]),
    footer: siteFooter('Automatic notice from'),
  });
  return send(to, `Moved · ${ctx.booking.name}`, html, ctx.booking.email);
}
