// Orquestación: junta configuración, reglas, reservas y el calendario de Google
// para calcular disponibilidad y validar una reserva. Solo servidor.

import { computeSlots } from './availability';
import { fetchBusy, GoogleNotConnectedError } from './google';
import { getBlackouts, getConfirmedBetween, getGoogleAccount, getRules, getSettings } from './store';
import { addDaysToKey, dateKeyInTz, parseDateKey, zonedToUtc } from './time';
import type { AvailabilityRule, Blackout, BookSettings, Interval } from './types';

export interface BookContext {
  settings: BookSettings;
  rules: AvailabilityRule[];
  blackouts: Blackout[];
  bookings: Interval[];
  busy: Interval[];
  googleConnected: boolean;
  excludedBookingId?: string;
}

/**
 * Carga todo lo necesario para un rango de fechas.
 * `excludeBookingId` sirve al reagendar: la reserva que se está moviendo no debe
 * bloquearse a sí misma.
 */
export async function loadContext(
  fromKey: string,
  toKey: string,
  excludeBookingId?: string
): Promise<BookContext> {
  const [settings, rules, blackouts] = await Promise.all([getSettings(), getRules(), getBlackouts()]);

  // Colchón de 2 días a cada lado para cubrir diferencias de timezone.
  const from = keyToIsoStart(addDaysToKey(fromKey, -2), settings.timezone);
  const to = keyToIsoStart(addDaysToKey(toKey, 2), settings.timezone);

  const rows = await getConfirmedBetween(from, to);
  const bookings: Interval[] = rows
    .filter((b) => b.id !== excludeBookingId)
    .map((b) => ({ start: new Date(b.start_utc).getTime(), end: new Date(b.end_utc).getTime() }));

  const account = await getGoogleAccount();
  let busy: Interval[] = [];
  let googleConnected = Boolean(account?.refresh_token);
  if (googleConnected) {
    try {
      busy = await fetchBusy(from, to);
    } catch (e) {
      if (e instanceof GoogleNotConnectedError) googleConnected = false;
      // Si Google falla por otra razón preferimos no ofrecer horarios a ciegas.
      else throw e;
    }
  }

  return { settings, rules, blackouts, bookings, busy, googleConnected, excludedBookingId: excludeBookingId };
}

export function slotsFor(
  ctx: BookContext,
  opts: { duration: number; guestTz: string; fromKey: string; toKey: string; now?: Date }
): Record<string, string[]> {
  return computeSlots({
    settings: ctx.settings,
    rules: ctx.rules,
    blackouts: ctx.blackouts,
    bookings: ctx.bookings,
    busy: ctx.busy,
    duration: opts.duration,
    guestTz: opts.guestTz,
    fromKey: opts.fromKey,
    toKey: opts.toKey,
    now: opts.now ?? new Date(),
  });
}

/** Revalidación del lado del servidor: nunca confiamos en el slot que manda el navegador. */
export async function assertBookable(
  startIso: string,
  duration: number,
  guestTz: string,
  excludeBookingId?: string
): Promise<{ ctx: BookContext; endIso: string }> {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) throw new BookingRejected('invalid');

  const settings = await getSettings();
  if (!settings.active) throw new BookingRejected('closed');
  if (!settings.durations.includes(duration)) throw new BookingRejected('invalid');

  const key = dateKeyInTz(start, guestTz);
  const ctx = await loadContext(key, key, excludeBookingId);
  if (!ctx.googleConnected) throw new BookingRejected('closed');

  const slots = slotsFor(ctx, { duration, guestTz, fromKey: key, toKey: key });
  if (!(slots[key] ?? []).includes(start.toISOString())) throw new BookingRejected('slot');

  return { ctx, endIso: new Date(start.getTime() + duration * 60_000).toISOString() };
}

export class BookingRejected extends Error {
  constructor(public reason: 'invalid' | 'closed' | 'slot' | 'cutoff' | 'notfound') {
    super(reason);
  }
}

function keyToIsoStart(key: string, tz: string): string {
  const { y, m, d } = parseDateKey(key);
  return zonedToUtc(y, m, d, 0, 0, tz).toISOString();
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
}
