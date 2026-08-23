// Utilidades de fecha/hora con timezones reales, sin dependencias externas.
// Todo se apoya en Intl, que en Node 20+ trae la base ICU completa.

/** Offset (local - UTC) en ms que tiene `timeZone` en el instante `date`. */
export function tzOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0');
  const hour = get('hour') === 24 ? 0 : get('hour');
  const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'));
  return asUTC - date.getTime();
}

/**
 * Convierte una hora de pared (año/mes/día/hora/minuto) en una timezone
 * al instante UTC correspondiente. Doble pasada para clavar los saltos de DST.
 */
export function zonedToUtc(
  y: number,
  m: number,
  d: number,
  hh: number,
  mm: number,
  timeZone: string
): Date {
  const wall = Date.UTC(y, m - 1, d, hh, mm, 0, 0);
  let ts = wall - tzOffsetMs(new Date(wall), timeZone);
  ts = wall - tzOffsetMs(new Date(ts), timeZone);
  return new Date(ts);
}

/** Partes de la hora de pared que marca `timeZone` en el instante dado. */
export function utcToZonedParts(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const hour = Number(get('hour')) === 24 ? 0 : Number(get('hour'));
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour,
    minute: Number(get('minute')),
    weekday: weekdayMap[get('weekday')] ?? 0,
  };
}

/** 'YYYY-MM-DD' de un instante, leído en la timezone dada. */
export function dateKeyInTz(date: Date, timeZone: string): string {
  const p = utcToZonedParts(date, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Parte 'YYYY-MM-DD' en números. */
export function parseDateKey(key: string): { y: number; m: number; d: number } {
  const [y, m, d] = key.split('-').map(Number);
  return { y, m, d };
}

/** Avanza n días sobre una clave YYYY-MM-DD (aritmética de calendario pura). */
export function addDaysToKey(key: string, n: number): string {
  const { y, m, d } = parseDateKey(key);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/** Día de la semana (0=domingo) de una clave YYYY-MM-DD. */
export function weekdayOfKey(key: string): number {
  const { y, m, d } = parseDateKey(key);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function compareKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Etiqueta legible del offset, ej. 'GMT-5'. */
export function tzLabel(timeZone: string, locale = 'en'): string {
  try {
    const dtf = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'shortOffset' });
    return dtf.formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

export function formatDateTime(
  iso: string,
  timeZone: string,
  locale: string,
  opts: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...opts,
  }).format(new Date(iso));
}

/** Valida un identificador IANA antes de pasarlo a Intl. */
export function isValidTimeZone(tz: string): boolean {
  if (!tz || typeof tz !== 'string' || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date());
    return true;
  } catch {
    return false;
  }
}
