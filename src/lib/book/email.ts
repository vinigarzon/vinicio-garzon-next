// Correos con Resend. Ningún fallo aquí puede tumbar una reserva: si el envío
// falla se registra en consola y seguimos — la invitación de Google ya salió.

import { bookEnv } from './env';
import { formatDateTime, tzLabel } from './time';
import type { Lang } from './i18n';
import type { Booking, BookSettings } from './types';

const ACCENT = '#c9f31d';
const BG = '#0a0a0a';
const CARD = '#151515';
const BORDER = '#2a2a2a';
const TEXT = '#ffffff';
const MUTED = '#9a9a9a';

function layout(title: string, bodyHtml: string, footerNote: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${CARD};border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 32px 8px 32px;">
          <p style="margin:0 0 4px 0;font:600 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:${ACCENT};">viniciogarzon.com</p>
          <h1 style="margin:0;font:700 24px/1.25 Helvetica,Arial,sans-serif;color:${TEXT};">${escapeHtml(title)}</h1>
        </td></tr>
        <tr><td style="padding:16px 32px 32px 32px;font:400 15px/1.6 Helvetica,Arial,sans-serif;color:${TEXT};">
          ${bodyHtml}
        </td></tr>
      </table>
      <p style="max-width:560px;margin:16px auto 0;font:400 12px/1.6 Helvetica,Arial,sans-serif;color:${MUTED};text-align:center;">${escapeHtml(footerNote)}</p>
    </td></tr>
  </table>
</body></html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font:400 13px/1.5 Helvetica,Arial,sans-serif;color:${MUTED};width:110px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;font:500 15px/1.5 Helvetica,Arial,sans-serif;color:${TEXT};">${value}</td>
  </tr>`;
}

function button(href: string, label: string): string {
  return `<a href="${escapeAttr(href)}" style="display:inline-block;background:${ACCENT};color:#0a0a0a;text-decoration:none;font:700 14px/1 Helvetica,Arial,sans-serif;padding:14px 24px;border-radius:999px;">${escapeHtml(label)}</a>`;
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
  return `${formatDateTime(booking.start_utc, booking.guest_tz, locale)} <span style="color:${MUTED};">(${escapeHtml(
    tzLabel(booking.guest_tz, locale)
  )})</span>`;
}

function hostWhen({ booking, settings }: Ctx): string {
  return `${formatDateTime(booking.start_utc, settings.timezone, 'en-US')} <span style="color:${MUTED};">(${escapeHtml(
    settings.timezone
  )})</span>`;
}

function manageUrl(booking: Booking, lang: Lang): string {
  return `${bookEnv.siteUrl}/book/manage/${booking.manage_token}?lang=${lang}`;
}

/* ---------- al invitado ---------- */

export async function sendGuestConfirmation(ctx: Ctx) {
  const { booking, settings, lang } = ctx;
  const es = lang === 'es';
  const zoom = settings.zoom_link
    ? `<p style="margin:24px 0 0 0;">${button(settings.zoom_link, es ? 'Entrar por Zoom' : 'Join on Zoom')}</p>
       ${settings.zoom_note ? `<p style="margin:12px 0 0 0;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:${MUTED};">${escapeHtml(settings.zoom_note)}</p>` : ''}`
    : '';

  const html = layout(
    es ? '¡Reunión confirmada!' : 'Your meeting is confirmed',
    `<p style="margin:0 0 20px 0;">${
      es
        ? `Hola ${escapeHtml(booking.name.split(' ')[0])}, quedó agendada nuestra reunión. También te llegará la invitación de Google Calendar.`
        : `Hi ${escapeHtml(booking.name.split(' ')[0])}, we're on. A Google Calendar invite is on its way too.`
    }</p>
     <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};margin:0 0 4px 0;">
       ${detailRow(es ? 'Con' : 'With', escapeHtml(settings.host_name))}
       ${detailRow(es ? 'Cuándo' : 'When', guestWhen(ctx))}
       ${detailRow(es ? 'Duración' : 'Duration', `${booking.duration_min} min`)}
     </table>
     ${zoom}
     <p style="margin:28px 0 0 0;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:${MUTED};">
       ${es ? '¿Necesitas cancelar o cambiar la hora?' : 'Need to cancel or move it?'}
       <a href="${escapeAttr(manageUrl(booking, lang))}" style="color:${ACCENT};">${
         es ? 'Gestiona tu reunión aquí' : 'Manage your meeting here'
       }</a>.
     </p>`,
    es ? 'Te llegó este correo porque agendaste en viniciogarzon.com' : 'You got this because you booked a time at viniciogarzon.com'
  );

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
  const html = layout(
    es ? 'Reunión cancelada' : 'Meeting cancelled',
    `<p style="margin:0 0 20px 0;">${
      es
        ? 'Esta reunión se canceló y ya salió del calendario.'
        : 'This meeting was cancelled and is off the calendar.'
    }</p>
     <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
       ${detailRow(es ? 'Era' : 'Was', guestWhen(ctx))}
     </table>
     <p style="margin:24px 0 0 0;">${button(`${bookEnv.siteUrl}/book?lang=${lang}`, es ? 'Agendar otro horario' : 'Book another time')}</p>`,
    es ? 'viniciogarzon.com' : 'viniciogarzon.com'
  );
  return send(booking.email, es ? 'Reunión cancelada' : 'Meeting cancelled', html, settings.host_email);
}

export async function sendGuestRescheduled(ctx: Ctx & { previousIso: string }) {
  const { booking, settings, lang, previousIso } = ctx;
  const es = lang === 'es';
  const locale = es ? 'es-ES' : 'en-US';
  const html = layout(
    es ? 'Nueva hora confirmada' : 'New time confirmed',
    `<p style="margin:0 0 20px 0;">${
      es ? 'Movimos la reunión. La invitación de calendario ya se actualizó.' : 'We moved the meeting. Your calendar invite is already updated.'
    }</p>
     <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
       ${detailRow(es ? 'Antes' : 'Was', `<span style="color:${MUTED};text-decoration:line-through;">${escapeHtml(formatDateTime(previousIso, booking.guest_tz, locale))}</span>`)}
       ${detailRow(es ? 'Ahora' : 'Now', guestWhen(ctx))}
     </table>
     ${settings.zoom_link ? `<p style="margin:24px 0 0 0;">${button(settings.zoom_link, es ? 'Entrar por Zoom' : 'Join on Zoom')}</p>` : ''}
     <p style="margin:28px 0 0 0;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:${MUTED};">
       <a href="${escapeAttr(manageUrl(booking, lang))}" style="color:${ACCENT};">${es ? 'Gestionar la reunión' : 'Manage this meeting'}</a>
     </p>`,
    'viniciogarzon.com'
  );
  return send(booking.email, es ? 'Tu reunión se movió' : 'Your meeting moved', html, settings.host_email);
}

/* ---------- a Vinicio ---------- */

function hostBlock(ctx: Ctx, extra = ''): string {
  const { booking } = ctx;
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
      ${detailRow('Who', `${escapeHtml(booking.name)}<br><a href="mailto:${escapeAttr(booking.email)}" style="color:${ACCENT};font-weight:400;">${escapeHtml(booking.email)}</a>`)}
      ${detailRow('When', hostWhen(ctx))}
      ${detailRow('Their time', `${escapeHtml(formatDateTime(booking.start_utc, booking.guest_tz, 'en-US'))} <span style="color:${MUTED};">(${escapeHtml(booking.guest_tz)})</span>`)}
      ${detailRow('Duration', `${booking.duration_min} min`)}
      ${booking.notes ? detailRow('Notes', escapeHtml(booking.notes).replace(/\n/g, '<br>')) : ''}
      ${extra}
    </table>`;
}

export async function sendHostNewBooking(ctx: Ctx) {
  const to = bookEnv.hostEmail || ctx.settings.host_email;
  const html = layout(
    'New booking',
    `<p style="margin:0 0 20px 0;">${escapeHtml(ctx.booking.name)} booked time with you.</p>
     ${hostBlock(ctx)}
     <p style="margin:24px 0 0 0;">${button(`${bookEnv.siteUrl}/book/admin`, 'Open admin')}</p>`,
    'Automatic notice from viniciogarzon.com/book'
  );
  return send(to, `New booking — ${ctx.booking.name}`, html, ctx.booking.email);
}

export async function sendHostCancelled(ctx: Ctx & { by: string }) {
  const to = bookEnv.hostEmail || ctx.settings.host_email;
  const html = layout(
    'Booking cancelled',
    `<p style="margin:0 0 20px 0;">Cancelled by ${escapeHtml(ctx.by === 'guest' ? ctx.booking.name : 'you')}.</p>
     ${hostBlock(ctx)}`,
    'Automatic notice from viniciogarzon.com/book'
  );
  return send(to, `Cancelled — ${ctx.booking.name}`, html);
}

export async function sendHostRescheduled(ctx: Ctx & { previousIso: string }) {
  const to = bookEnv.hostEmail || ctx.settings.host_email;
  const previous = `${formatDateTime(ctx.previousIso, ctx.settings.timezone, 'en-US')}`;
  const html = layout(
    'Booking moved',
    `<p style="margin:0 0 20px 0;">${escapeHtml(ctx.booking.name)} moved your meeting.</p>
     ${hostBlock(ctx, detailRow('Previously', `<span style="color:${MUTED};text-decoration:line-through;">${escapeHtml(previous)}</span>`))}`,
    'Automatic notice from viniciogarzon.com/book'
  );
  return send(to, `Moved — ${ctx.booking.name}`, html, ctx.booking.email);
}
