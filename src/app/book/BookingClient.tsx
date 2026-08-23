'use client';

import { useEffect, useMemo, useState } from 'react';
import { t, type Lang } from '@/lib/book/i18n';
import { dateKeyInTz, pad, tzLabel } from '@/lib/book/time';

const INPUT =
  'w-full bg-primary-light border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition';

interface Props {
  lang: Lang;
  ready: boolean;
  title: string;
  intro: string;
  hostName: string;
  durations: number[];
}

interface Confirmed {
  start: string;
  duration: number;
  email: string;
  manageToken: string;
  zoomLink: string;
  hostName: string;
}

export default function BookingClient({ lang, ready, title, intro, hostName, durations }: Props) {
  const T = t(lang);
  const locale = T.locale;

  const [tz, setTz] = useState('UTC');
  const [zones, setZones] = useState<string[]>([]);
  const [today, setToday] = useState<string | null>(null);
  const [duration, setDuration] = useState(durations[0] ?? 30);
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  const [days, setDays] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', notes: '', company: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Confirmed | null>(null);

  // Timezone del visitante: la detectamos, pero puede cambiarla.
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    setTz(detected);
    const key = dateKeyInTz(new Date(), detected);
    setToday(key);
    const [y, m] = key.split('-').map(Number);
    setCursor({ y, m });
    try {
      const supported = (Intl as any).supportedValuesOf?.('timeZone') as string[] | undefined;
      setZones(supported?.length ? supported : [detected]);
    } catch {
      setZones([detected]);
    }
  }, []);

  // Disponibilidad del mes visible.
  useEffect(() => {
    if (!cursor || !ready || !today) return;
    const controller = new AbortController();
    const last = daysInMonth(cursor.y, cursor.m);
    const from = `${cursor.y}-${pad(cursor.m)}-01`;
    const to = `${cursor.y}-${pad(cursor.m)}-${pad(last)}`;

    setLoading(true);
    fetch(
      `/api/book/availability?duration=${duration}&tz=${encodeURIComponent(tz)}&from=${from}&to=${to}`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((data) => {
        setDays(data.days ?? {});
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setDays({});
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [cursor, duration, tz, ready, today]);

  // Si cambia el mes o la duración, la selección previa deja de ser válida.
  useEffect(() => {
    setSelectedDay(null);
    setSlot(null);
  }, [duration, cursor?.y, cursor?.m, tz]);

  const monthLabel = useMemo(() => {
    if (!cursor) return '';
    const d = new Date(Date.UTC(cursor.y, cursor.m - 1, 1));
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
  }, [cursor, locale]);

  const weekStart = lang === 'es' ? 1 : 0;
  const weekdayLabels = useMemo(() => {
    const base = new Date(Date.UTC(2024, 0, 7)); // domingo
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setUTCDate(base.getUTCDate() + ((i + weekStart) % 7));
      return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(d);
    });
  }, [locale, weekStart]);

  const grid = useMemo(() => {
    if (!cursor) return [];
    const total = daysInMonth(cursor.y, cursor.m);
    const firstWeekday = new Date(Date.UTC(cursor.y, cursor.m - 1, 1)).getUTCDay();
    const leading = (firstWeekday - weekStart + 7) % 7;
    const cells: Array<{ key: string; day: number } | null> = Array(leading).fill(null);
    for (let d = 1; d <= total; d++) {
      cells.push({ key: `${cursor.y}-${pad(cursor.m)}-${pad(d)}`, day: d });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor, weekStart]);

  const canGoBack = useMemo(() => {
    if (!cursor || !today) return false;
    const [ty, tm] = today.split('-').map(Number);
    return cursor.y > ty || (cursor.y === ty && cursor.m > tm);
  }, [cursor, today]);

  const monthHasSlots = Object.values(days).some((s) => s.length > 0);
  const daySlots = selectedDay ? days[selectedDay] ?? [] : [];

  const fmtTime = (iso: string) =>
    new Intl.DateTimeFormat(locale, { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  const fmtLongDate = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(y, m - 1, d)));
  };

  function shiftMonth(delta: number) {
    setCursor((c) => {
      if (!c) return c;
      const d = new Date(Date.UTC(c.y, c.m - 1 + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) return;
    if (!form.name.trim() || !form.email.trim()) return setError(T.errRequired);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return setError(T.errEmail);

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/book/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          notes: form.notes,
          company: form.company, // honeypot
          start: slot,
          duration,
          tz,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(errorMessage(data.error, T));
        if (data.error === 'slot') {
          setSlot(null);
          refreshMonth();
        }
        return;
      }
      setDone(data.booking as Confirmed);
    } catch {
      setError(T.errGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  function refreshMonth() {
    setCursor((c) => (c ? { ...c } : c));
  }

  /* ------------------------------------------------------------------ */

  if (done) {
    return (
      <Shell lang={lang}>
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="!text-3xl md:!text-4xl font-display font-bold mb-4">{T.confirmedTitle}</h1>
          <p className="text-text-muted mb-8">{T.confirmedBody.replace('{email}', done.email)}</p>

          <div className="bg-secondary border border-border rounded-2xl p-6 text-left space-y-3 mb-8">
            <Row label={T.withHost} value={done.hostName} />
            <Row
              label={T.when}
              value={`${new Intl.DateTimeFormat(locale, {
                timeZone: tz,
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: 'numeric',
                minute: '2-digit',
              }).format(new Date(done.start))} · ${tzLabel(tz, locale)}`}
            />
            <Row label={T.duration} value={`${done.duration} ${T.minutesShort}`} />
          </div>

          {done.zoomLink && (
            <a href={done.zoomLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
              {T.joinZoom}
            </a>
          )}
          <p className="text-text-dim text-sm mt-6">
            <a href={`/book/manage/${done.manageToken}?lang=${lang}`} className="text-accent hover:underline">
              {T.manageTitle}
            </a>
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell lang={lang}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="section-label justify-center">{hostName}</p>
          <h1 className="!text-4xl md:!text-5xl font-display font-bold mb-4">{title}</h1>
          <p className="text-text-muted max-w-xl mx-auto">{intro}</p>
        </div>

        {!ready ? (
          <div className="bg-secondary border border-border rounded-2xl p-10 text-center text-text-muted">
            {T.errClosed}
          </div>
        ) : (
          <div className="bg-secondary border border-border rounded-3xl overflow-hidden grid md:grid-cols-[260px_1fr]">
            {/* Columna de resumen */}
            <aside className="p-6 md:p-7 border-b md:border-b-0 md:border-r border-border bg-primary-light">
              <p className="text-xs uppercase tracking-[0.2em] text-text-dim mb-3">{T.duration}</p>
              <div className="flex md:flex-col gap-2 mb-7">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition text-left ${
                      d === duration
                        ? 'bg-accent text-primary border-accent'
                        : 'border-border text-text-muted hover:border-accent hover:text-accent'
                    }`}
                  >
                    {d} {T.minutesShort}
                  </button>
                ))}
              </div>

              <p className="text-xs uppercase tracking-[0.2em] text-text-dim mb-2">{T.timezoneLabel}</p>
              <select
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition"
              >
                {(zones.includes(tz) ? zones : [tz, ...zones]).map((z) => (
                  <option key={z} value={z}>
                    {z.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <p className="text-text-dim text-xs mt-2">{tzLabel(tz, locale)}</p>

              {slot && (
                <div className="mt-7 pt-6 border-t border-border">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-dim mb-2">{T.when}</p>
                  <p className="text-text font-semibold leading-snug">
                    {selectedDay && fmtLongDate(selectedDay)}
                  </p>
                  <p className="text-accent font-display text-lg">{fmtTime(slot)}</p>
                </div>
              )}
            </aside>

            {/* Columna principal */}
            <div className="p-6 md:p-8">
              {!slot ? (
                <div className="grid sm:grid-cols-[1fr_190px] gap-8">
                  {/* Calendario */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="!text-lg font-display font-semibold capitalize">{monthLabel}</h2>
                      <div className="flex gap-1">
                        <IconButton onClick={() => shiftMonth(-1)} disabled={!canGoBack} label={T.prevMonth} dir="left" />
                        <IconButton onClick={() => shiftMonth(1)} label={T.nextMonth} dir="right" />
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {weekdayLabels.map((w, i) => (
                        <div key={i} className="text-center text-[11px] uppercase tracking-wider text-text-dim py-1">
                          {w.slice(0, 2)}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {grid.map((cell, i) => {
                        if (!cell) return <div key={`e${i}`} />;
                        const has = (days[cell.key] ?? []).length > 0;
                        const isSelected = selectedDay === cell.key;
                        const isToday = today === cell.key;
                        return (
                          <button
                            key={cell.key}
                            disabled={!has}
                            onClick={() => setSelectedDay(cell.key)}
                            className={`aspect-square rounded-xl text-sm font-medium transition relative ${
                              isSelected
                                ? 'bg-accent text-primary'
                                : has
                                ? 'bg-secondary-light text-text hover:bg-accent/20 hover:text-accent'
                                : 'text-text-dim/50 cursor-default'
                            }`}
                          >
                            {cell.day}
                            {isToday && !isSelected && (
                              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {loading && <p className="text-text-dim text-sm mt-4">{T.loading}</p>}
                    {!loading && !monthHasSlots && <p className="text-text-dim text-sm mt-4">{T.noSlotsMonth}</p>}
                  </div>

                  {/* Horarios */}
                  <div className="sm:border-l sm:border-border sm:pl-6">
                    {selectedDay ? (
                      <>
                        <h3 className="!text-sm font-semibold text-text-muted mb-4 capitalize">
                          {fmtLongDate(selectedDay)}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
                          {daySlots.map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setSlot(s);
                                setError(null);
                              }}
                              className="w-full px-4 py-3 rounded-xl border border-border text-text font-medium text-sm hover:border-accent hover:text-accent transition"
                            >
                              {fmtTime(s)}
                            </button>
                          ))}
                          {daySlots.length === 0 && <p className="text-text-dim text-sm">{T.noSlotsDay}</p>}
                        </div>
                      </>
                    ) : (
                      <p className="text-text-dim text-sm">{T.stepDate}</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Formulario */
                <form onSubmit={submit} className="max-w-md">
                  <button
                    type="button"
                    onClick={() => setSlot(null)}
                    className="text-text-muted hover:text-accent text-sm mb-6 inline-flex items-center gap-2 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {T.back}
                  </button>

                  <h2 className="!text-xl font-display font-semibold mb-6">{T.stepDetails}</h2>

                  <Field label={T.name}>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      autoComplete="name"
                      className={INPUT}
                    />
                  </Field>
                  <Field label={T.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      autoComplete="email"
                      className={INPUT}
                    />
                  </Field>
                  <Field label={`${T.notes} (${T.optional})`}>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={3}
                      placeholder={T.notesPlaceholder}
                      className={`${INPUT} resize-none`}
                    />
                  </Field>

                  {/* Honeypot: invisible para personas, irresistible para bots */}
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="absolute left-[-9999px] w-px h-px opacity-0"
                    aria-hidden="true"
                  />

                  {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                  <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-50">
                    {submitting ? T.booking : T.confirm}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------- piezas UI */

function Shell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const other: Lang = lang === 'es' ? 'en' : 'es';
  return (
    <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto flex justify-end mb-4">
        <a
          href={`?lang=${other}`}
          className="text-xs uppercase tracking-[0.2em] text-text-dim hover:text-accent transition"
        >
          {other === 'es' ? 'Español' : 'English'}
        </a>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs uppercase tracking-[0.18em] text-text-dim mb-2">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-text-dim capitalize">{label}</span>
      <span className="text-text font-medium text-right">{value}</span>
    </div>
  );
}

function IconButton({
  onClick,
  disabled,
  label,
  dir,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  dir: 'left' | 'right';
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:border-accent hover:text-accent transition disabled:opacity-30 disabled:hover:border-border disabled:hover:text-text-muted"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
        />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------- utilidades */

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function errorMessage(code: string, T: ReturnType<typeof t>): string {
  switch (code) {
    case 'slot':
      return T.errSlot;
    case 'required':
      return T.errRequired;
    case 'email':
      return T.errEmail;
    case 'closed':
    case 'calendar':
      return T.errClosed;
    default:
      return T.errGeneric;
  }
}
