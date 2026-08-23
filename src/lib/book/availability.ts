// Motor de disponibilidad. Función pura: recibe todo lo que necesita y no toca red
// ni base de datos, para poder razonarla y probarla sin infraestructura.

import type { AvailabilityRule, Blackout, BookSettings, Interval } from './types';
import { addDaysToKey, compareKeys, dateKeyInTz, weekdayOfKey, zonedToUtc } from './time';

export interface ComputeInput {
  settings: BookSettings;
  rules: AvailabilityRule[];
  blackouts: Blackout[];
  /** Reservas confirmadas propias, ya en epoch ms. */
  bookings: Interval[];
  /** Bloques ocupados según Google Calendar, en epoch ms. */
  busy: Interval[];
  duration: number;
  /** Rango pedido, en claves YYYY-MM-DD de la timezone del invitado. */
  fromKey: string;
  toKey: string;
  guestTz: string;
  now: Date;
}

/** Slots disponibles como instantes ISO, agrupados por fecha local del invitado. */
export function computeSlots(input: ComputeInput): Record<string, string[]> {
  const { settings, rules, blackouts, bookings, busy, duration, guestTz, now } = input;

  if (!settings.active) return {};
  if (!duration || duration <= 0) return {};

  const hostTz = settings.timezone;
  const nowMs = now.getTime();
  const earliest = nowMs + settings.min_notice_minutes * 60_000;
  const latest = nowMs + settings.max_days_ahead * 86_400_000;

  // Trabajamos sobre días del host, con un día de colchón a cada lado para no
  // perder slots que en la timezone del invitado caen dentro del rango pedido.
  const startHostKey = addDaysToKey(input.fromKey, -1);
  const endHostKey = addDaysToKey(input.toKey, 1);

  const blocked = expandBlackouts(blackouts);
  const activeRules = rules.filter((r) => r.active && r.end_min > r.start_min);

  // Ocupado = reservas propias con sus buffers + lo que diga Google.
  const occupied: Interval[] = [
    ...bookings.map((b) => ({
      start: b.start - settings.buffer_before * 60_000,
      end: b.end + settings.buffer_after * 60_000,
    })),
    ...busy,
  ];

  // Cuántas reservas ya existen por día del host (para el tope diario).
  const perHostDay = new Map<string, number>();
  for (const b of bookings) {
    const key = dateKeyInTz(new Date(b.start), hostTz);
    perHostDay.set(key, (perHostDay.get(key) ?? 0) + 1);
  }

  const out: Record<string, string[]> = {};

  for (let key = startHostKey; compareKeys(key, endHostKey) <= 0; key = addDaysToKey(key, 1)) {
    if (blocked.has(key)) continue;
    if (settings.daily_limit > 0 && (perHostDay.get(key) ?? 0) >= settings.daily_limit) continue;

    const weekday = weekdayOfKey(key);
    const [y, m, d] = key.split('-').map(Number);

    for (const rule of activeRules) {
      if (rule.weekday !== weekday) continue;

      // El slot debe caber completo dentro de la ventana de la regla.
      for (let mins = rule.start_min; mins + duration <= rule.end_min; mins += settings.slot_increment) {
        const startDate = zonedToUtc(y, m, d, Math.floor(mins / 60), mins % 60, hostTz);
        const start = startDate.getTime();
        const end = start + duration * 60_000;

        if (start < earliest || start > latest) continue;

        const guardStart = start - settings.buffer_before * 60_000;
        const guardEnd = end + settings.buffer_after * 60_000;
        if (occupied.some((o) => guardStart < o.end && guardEnd > o.start)) continue;

        const guestKey = dateKeyInTz(startDate, guestTz);
        if (compareKeys(guestKey, input.fromKey) < 0 || compareKeys(guestKey, input.toKey) > 0) continue;

        (out[guestKey] ||= []).push(startDate.toISOString());
      }
    }
  }

  for (const key of Object.keys(out)) {
    out[key] = Array.from(new Set(out[key])).sort();
  }
  return out;
}

/** ¿Ese instante exacto es un slot válido? Se usa al confirmar, del lado del servidor. */
export function isSlotBookable(input: Omit<ComputeInput, 'fromKey' | 'toKey'> & { startIso: string }): boolean {
  const start = new Date(input.startIso);
  if (Number.isNaN(start.getTime())) return false;
  const key = dateKeyInTz(start, input.guestTz);
  const slots = computeSlots({ ...input, fromKey: key, toKey: key });
  return (slots[key] ?? []).includes(start.toISOString());
}

function expandBlackouts(blackouts: Blackout[]): Set<string> {
  const set = new Set<string>();
  for (const b of blackouts) {
    if (!b.start_date) continue;
    const end = b.end_date || b.start_date;
    let cursor = b.start_date;
    let guard = 0;
    while (compareKeys(cursor, end) <= 0 && guard++ < 800) {
      set.add(cursor);
      cursor = addDaysToKey(cursor, 1);
    }
  }
  return set;
}
