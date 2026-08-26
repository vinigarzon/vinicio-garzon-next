// Acceso a datos. Solo servidor: usa la service role key de Supabase, nunca se
// importa desde un componente cliente.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { bookEnv } from './env';
import {
  AvailabilityRule,
  Blackout,
  Booking,
  BookSettings,
  DEFAULT_SETTINGS,
  GoogleAccount,
} from './types';

export class BookConfigError extends Error {}
export class SlotTakenError extends Error {}

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!bookEnv.supabaseUrl || !bookEnv.supabaseKey) {
    throw new BookConfigError('Faltan BOOK_SUPABASE_URL o BOOK_SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!client) {
    client = createClient(bookEnv.supabaseUrl, bookEnv.supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export function isConfigured(): boolean {
  return Boolean(bookEnv.supabaseUrl && bookEnv.supabaseKey);
}

/* ---------- settings ---------- */

export async function getSettings(): Promise<BookSettings> {
  const { data, error } = await db().from('book_settings').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  if (!data) return { ...DEFAULT_SETTINGS };
  const { id, updated_at, ...rest } = data as Record<string, unknown>;
  return { ...DEFAULT_SETTINGS, ...(rest as Partial<BookSettings>) };
}

export async function saveSettings(patch: Partial<BookSettings>): Promise<BookSettings> {
  const current = await getSettings();
  const next = sanitizeSettings({ ...current, ...patch });
  const { error } = await db()
    .from('book_settings')
    .upsert({ id: 1, ...next, updated_at: new Date().toISOString() });
  if (error) throw error;
  return next;
}

function sanitizeSettings(s: BookSettings): BookSettings {
  const num = (v: unknown, min: number, max: number, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
  };
  const durations = Array.from(
    new Set((Array.isArray(s.durations) ? s.durations : []).map((d) => num(d, 5, 480, 30)))
  ).sort((a, b) => a - b);
  return {
    ...s,
    durations: durations.length ? durations : [30],
    slot_increment: num(s.slot_increment, 5, 240, 30),
    buffer_before: num(s.buffer_before, 0, 240, 0),
    buffer_after: num(s.buffer_after, 0, 240, 0),
    min_notice_minutes: num(s.min_notice_minutes, 0, 43200, 720),
    max_days_ahead: num(s.max_days_ahead, 1, 365, 45),
    daily_limit: num(s.daily_limit, 0, 50, 0),
    cancel_cutoff_hours: num(s.cancel_cutoff_hours, 0, 720, 12),
    reschedule_cutoff_hours: num(s.reschedule_cutoff_hours, 0, 720, 12),
    calendar_id: (s.calendar_id || 'primary').slice(0, 200),
    zoom_link: (s.zoom_link || '').trim().slice(0, 500),
  };
}

/* ---------- reglas de disponibilidad ---------- */

export async function getRules(): Promise<AvailabilityRule[]> {
  const { data, error } = await db()
    .from('book_availability_rules')
    .select('*')
    .order('weekday')
    .order('start_min');
  if (error) throw error;
  return (data ?? []) as AvailabilityRule[];
}

/** Reemplaza el set completo de reglas: el admin manda la semana entera. */
export async function replaceRules(rules: Array<Omit<AvailabilityRule, 'id'>>): Promise<void> {
  const clean = rules
    .map((r) => ({
      weekday: Math.min(6, Math.max(0, Math.round(Number(r.weekday)))),
      start_min: Math.min(1440, Math.max(0, Math.round(Number(r.start_min)))),
      end_min: Math.min(1440, Math.max(0, Math.round(Number(r.end_min)))),
      active: r.active !== false,
    }))
    .filter((r) => Number.isFinite(r.weekday) && r.end_min > r.start_min);

  const supabase = db();
  const { error: delError } = await supabase
    .from('book_availability_rules')
    .delete()
    .not('id', 'is', null);
  if (delError) throw delError;
  if (clean.length) {
    const { error } = await supabase.from('book_availability_rules').insert(clean);
    if (error) throw error;
  }
}

/* ---------- bloqueos de fechas ---------- */

export async function getBlackouts(): Promise<Blackout[]> {
  const { data, error } = await db().from('book_blackouts').select('*').order('start_date');
  if (error) throw error;
  return (data ?? []) as Blackout[];
}

export async function addBlackout(start_date: string, end_date: string, reason: string | null) {
  const { error } = await db()
    .from('book_blackouts')
    .insert({ start_date, end_date: end_date || start_date, reason });
  if (error) throw error;
}

export async function deleteBlackout(id: string) {
  const { error } = await db().from('book_blackouts').delete().eq('id', id);
  if (error) throw error;
}

/* ---------- reservas ---------- */

export async function getConfirmedBetween(fromIso: string, toIso: string): Promise<Booking[]> {
  const { data, error } = await db()
    .from('book_bookings')
    .select('*')
    .eq('status', 'confirmed')
    .gte('start_utc', fromIso)
    .lte('start_utc', toIso)
    .order('start_utc');
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function listBookings(limit = 200): Promise<Booking[]> {
  const { data, error } = await db()
    .from('book_bookings')
    .select('*')
    .order('start_utc', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function getBookingByToken(token: string): Promise<Booking | null> {
  const { data, error } = await db()
    .from('book_bookings')
    .select('*')
    .eq('manage_token', token)
    .maybeSingle();
  if (error) throw error;
  return (data as Booking) ?? null;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await db().from('book_bookings').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Booking) ?? null;
}

export async function insertBooking(row: {
  manage_token: string;
  name: string;
  email: string;
  notes: string | null;
  start_utc: string;
  end_utc: string;
  duration_min: number;
  guest_tz: string;
  guest_lang: string;
  ip: string | null;
}): Promise<Booking> {
  const { data, error } = await db()
    .from('book_bookings')
    .insert({ ...row, status: 'confirmed' })
    .select()
    .single();
  if (error) {
    // 23P01 = exclusion_violation (solape), 23505 = unique_violation.
    if (error.code === '23P01' || error.code === '23505') {
      throw new SlotTakenError('El horario acaba de ser tomado');
    }
    throw error;
  }
  return data as Booking;
}

export async function attachGoogleEvent(id: string, eventId: string | null) {
  const { error } = await db().from('book_bookings').update({ google_event_id: eventId }).eq('id', id);
  if (error) throw error;
}

export async function markCancelled(id: string, by: string) {
  const { error } = await db()
    .from('book_bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancelled_by: by })
    .eq('id', id);
  if (error) throw error;
}

export async function moveBooking(id: string, startIso: string, endIso: string): Promise<Booking> {
  const { data, error } = await db()
    .from('book_bookings')
    .update({ start_utc: startIso, end_utc: endIso })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (error.code === '23P01' || error.code === '23505') {
      throw new SlotTakenError('El horario acaba de ser tomado');
    }
    throw error;
  }
  return data as Booking;
}

/** Anti-abuso simple: cuántas reservas hizo esa IP en las últimas 24 h. */
export async function countRecentByIp(ip: string): Promise<number> {
  if (!ip) return 0;
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count, error } = await db()
    .from('book_bookings')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since);
  if (error) return 0;
  return count ?? 0;
}

/* ---------- cuenta de Google ---------- */

export async function getGoogleAccount(): Promise<GoogleAccount | null> {
  const { data, error } = await db().from('book_google_account').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return (data as GoogleAccount) ?? null;
}

/**
 * Guarda la cuenta completa. Solo para el callback de OAuth, que sí tiene todos
 * los campos: un upsert de PostgREST escribe la fila entera, así que cualquier
 * columna ausente se iría a NULL.
 */
export async function saveGoogleAccount(acc: Partial<GoogleAccount> & { refresh_token: string }) {
  const { error } = await db()
    .from('book_google_account')
    .upsert({ id: 1, ...acc });
  if (error) throw error;
}

/**
 * Actualiza solo el access token y su vencimiento. Tiene que ser UPDATE y no
 * upsert: con upsert, las columnas que no van en el payload —refresh_token
 * entre ellas— se reescriben a NULL y la fila deja de ser válida.
 */
export async function updateGoogleTokens(patch: { access_token: string; expires_at: string }) {
  const { error } = await db().from('book_google_account').update(patch).eq('id', 1);
  if (error) throw error;
}

/** Mantiene sincronizado el calendario elegido en settings con el de la cuenta. */
export async function setCalendarId(calendarId: string) {
  const { error } = await db()
    .from('book_google_account')
    .update({ calendar_id: calendarId })
    .eq('id', 1);
  if (error) throw error;
}

export async function deleteGoogleAccount() {
  const { error } = await db().from('book_google_account').delete().eq('id', 1);
  if (error) throw error;
}

/** Toque mínimo a la base para que Supabase no la considere inactiva. */
export async function ping(): Promise<boolean> {
  const { error } = await db().from('book_settings').select('id').limit(1);
  return !error;
}
