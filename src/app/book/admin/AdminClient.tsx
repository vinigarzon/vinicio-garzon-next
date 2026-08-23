'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AvailabilityRule, Blackout, Booking, BookSettings } from '@/lib/book/types';

type Tab = 'calendar' | 'hours' | 'rules' | 'bookings' | 'content';

interface Config {
  settings: BookSettings;
  rules: AvailabilityRule[];
  blackouts: Blackout[];
  google: { connected: boolean; email: string | null; calendarId: string; connectedAt: string | null };
  env: { missing: string[]; emailReady: boolean; siteUrl: string };
}

interface Block {
  start: number;
  end: number;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORDER = [1, 2, 3, 4, 5, 6, 0]; // lunes primero

export default function AdminClient() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [config, setConfig] = useState<Config | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [calendars, setCalendars] = useState<Array<{ id: string; summary: string; primary: boolean }>>([]);
  const [tab, setTab] = useState<Tab>('calendar');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // Estado editable
  const [draft, setDraft] = useState<BookSettings | null>(null);
  const [week, setWeek] = useState<Record<number, Block[]>>({});
  const [newBlackout, setNewBlackout] = useState({ start_date: '', end_date: '', reason: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) setBanner('Google Calendar conectado.');
    if (params.get('error')) setBanner(`No se pudo conectar Google (${params.get('error')}).`);
    if (params.toString()) window.history.replaceState({}, '', '/book/admin');
  }, []);

  useEffect(() => {
    fetch('/api/book/admin/session')
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authenticated)))
      .catch(() => setAuthed(false));
  }, []);

  const loadAll = useCallback(async () => {
    const [cfgRes, bkRes] = await Promise.all([
      fetch('/api/book/admin/config'),
      fetch('/api/book/admin/bookings'),
    ]);
    if (cfgRes.ok) {
      const cfg: Config = await cfgRes.json();
      setConfig(cfg);
      setDraft(cfg.settings);
      setWeek(rulesToWeek(cfg.rules));
    } else {
      const err = await cfgRes.json().catch(() => ({}));
      setBanner(
        err.error === 'not_configured'
          ? `Faltan variables de entorno: ${(err.missing ?? []).join(', ')}`
          : 'No se pudo cargar la configuración.'
      );
    }
    if (bkRes.ok) setBookings((await bkRes.json()).bookings ?? []);
  }, []);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed, loadAll]);

  useEffect(() => {
    if (authed && config?.google.connected) {
      fetch('/api/book/admin/calendars')
        .then((r) => r.json())
        .then((d) => setCalendars(d.calendars ?? []))
        .catch(() => setCalendars([]));
    }
  }, [authed, config?.google.connected]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/book/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      setPassword('');
    } else {
      const d = await res.json().catch(() => ({}));
      setLoginError(d.error === 'not_configured' ? 'Falta configurar BOOK_ADMIN_PASSWORD.' : 'Contraseña incorrecta');
    }
  }

  async function saveSettings(patch: Partial<BookSettings>) {
    setSaving(true);
    const res = await fetch('/api/book/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (res.ok) {
      const d = await res.json();
      setDraft(d.settings);
      setConfig((c) => (c ? { ...c, settings: d.settings } : c));
      flash('Guardado');
    } else flash('No se pudo guardar');
  }

  async function saveWeek() {
    setSaving(true);
    const rules = ORDER.flatMap((wd) =>
      (week[wd] ?? []).map((b) => ({ weekday: wd, start_min: b.start, end_min: b.end, active: true }))
    );
    const res = await fetch('/api/book/admin/rules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules }),
    });
    setSaving(false);
    if (res.ok) {
      const d = await res.json();
      setWeek(rulesToWeek(d.rules));
      flash('Horarios guardados');
    } else flash('No se pudo guardar');
  }

  async function addBlackout() {
    if (!newBlackout.start_date) return;
    const res = await fetch('/api/book/admin/blackouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newBlackout, end_date: newBlackout.end_date || newBlackout.start_date }),
    });
    if (res.ok) {
      const d = await res.json();
      setConfig((c) => (c ? { ...c, blackouts: d.blackouts } : c));
      setNewBlackout({ start_date: '', end_date: '', reason: '' });
      flash('Bloqueo agregado');
    }
  }

  async function removeBlackout(id: string) {
    const res = await fetch(`/api/book/admin/blackouts?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      const d = await res.json();
      setConfig((c) => (c ? { ...c, blackouts: d.blackouts } : c));
    }
  }

  async function cancelBooking(id: string) {
    const res = await fetch('/api/book/admin/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', id }),
    });
    if (res.ok) {
      const d = await res.json();
      if (d.bookings) setBookings(d.bookings);
      flash('Reserva cancelada');
    } else flash('No se pudo cancelar');
  }

  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'confirmed' && new Date(b.start_utc).getTime() > Date.now())
        .sort((a, b) => a.start_utc.localeCompare(b.start_utc)),
    [bookings]
  );
  const rest = useMemo(() => bookings.filter((b) => !upcoming.includes(b)), [bookings, upcoming]);

  /* ---------------------------------------------------------------- login */

  if (authed === null) {
    return <div className="pt-40 pb-32 text-center text-text-muted">Cargando…</div>;
  }

  if (!authed) {
    return (
      <div className="pt-40 pb-32 px-4">
        <form onSubmit={login} className="max-w-sm mx-auto">
          <p className="section-label">Booking</p>
          <h1 className="!text-3xl font-display font-bold mb-8">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-accent transition mb-3"
          />
          {loginError && <p className="text-red-400 text-sm mb-3">{loginError}</p>}
          <button type="submit" className="btn-primary w-full justify-center">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  /* ----------------------------------------------------------------- panel */

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="section-label">Booking</p>
            <h1 className="!text-3xl md:!text-4xl font-display font-bold">Admin</h1>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/book/admin/session', { method: 'DELETE' });
              setAuthed(false);
            }}
            className="text-text-dim hover:text-red-400 text-sm transition mt-2"
          >
            Salir
          </button>
        </div>

        {banner && (
          <div className="mb-6 px-4 py-3 rounded-xl border border-border bg-secondary text-sm text-text-muted flex justify-between gap-4">
            <span>{banner}</span>
            <button onClick={() => setBanner(null)} className="text-text-dim hover:text-text">
              ✕
            </button>
          </div>
        )}

        <nav className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
          {(
            [
              ['calendar', 'Google Calendar'],
              ['hours', 'Disponibilidad'],
              ['rules', 'Reglas'],
              ['bookings', `Reservas${upcoming.length ? ` (${upcoming.length})` : ''}`],
              ['content', 'Zoom y textos'],
            ] as Array<[Tab, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                tab === id ? 'bg-accent text-primary' : 'text-text-muted hover:text-accent'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {!config || !draft ? (
          <p className="text-text-muted">Cargando configuración…</p>
        ) : (
          <>
            {/* ------------------------------------------------ Google */}
            {tab === 'calendar' && (
              <Card title="Conexión con Google Calendar">
                {config.google.connected ? (
                  <>
                    <p className="text-text mb-1">
                      Conectado como <span className="text-accent">{config.google.email ?? '—'}</span>
                    </p>
                    <p className="text-text-dim text-sm mb-6">
                      Las reuniones se crean en el calendario <strong>{config.google.calendarId}</strong>.
                    </p>

                    {calendars.length > 0 && (
                      <LabeledSelect
                        label="Calendario donde se escriben las citas"
                        value={draft.calendar_id}
                        onChange={(v) => setDraft({ ...draft, calendar_id: v })}
                        options={calendars.map((c) => ({
                          value: c.id,
                          label: `${c.summary}${c.primary ? ' (principal)' : ''}`,
                        }))}
                      />
                    )}

                    <div className="flex flex-wrap gap-3 mt-6">
                      <button
                        onClick={() => saveSettings({ calendar_id: draft.calendar_id })}
                        disabled={saving}
                        className="btn-primary"
                      >
                        Guardar
                      </button>
                      <a href="/api/book/google/connect" className="btn-outline">
                        Reconectar
                      </a>
                      <button
                        onClick={async () => {
                          await fetch('/api/book/google/disconnect', { method: 'POST' });
                          loadAll();
                        }}
                        className="btn-outline hover:!border-red-400 hover:!text-red-400"
                      >
                        Desconectar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-text-muted mb-6">
                      Sin esta conexión la página de reservas queda cerrada: no se puede leer tu disponibilidad ni
                      crear los eventos.
                    </p>
                    <a href="/api/book/google/connect" className="btn-primary">
                      Conectar Google Calendar
                    </a>
                  </>
                )}

                <div className="mt-8 pt-6 border-t border-border space-y-2 text-sm">
                  <StatusLine ok={config.env.missing.length === 0}>
                    {config.env.missing.length === 0
                      ? 'Variables de entorno completas'
                      : `Faltan: ${config.env.missing.join(', ')}`}
                  </StatusLine>
                  <StatusLine ok={config.env.emailReady}>
                    {config.env.emailReady ? 'Correos con Resend activos' : 'Resend sin configurar (no saldrán correos propios)'}
                  </StatusLine>
                  <StatusLine ok={Boolean(draft.zoom_link)}>
                    {draft.zoom_link ? 'Link de Zoom configurado' : 'Falta tu link de Zoom'}
                  </StatusLine>
                  <StatusLine ok={draft.active}>
                    {draft.active ? 'Página de reservas abierta' : 'Página de reservas cerrada'}
                  </StatusLine>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-text-dim text-xs mb-2">Tu link para compartir</p>
                  <code className="text-accent text-sm break-all">{config.env.siteUrl}/book</code>
                </div>
              </Card>
            )}

            {/* ------------------------------------------- disponibilidad */}
            {tab === 'hours' && (
              <>
                <Card title="Horario semanal" subtitle={`Horas en ${draft.timezone}`}>
                  <div className="space-y-4">
                    {ORDER.map((wd) => (
                      <div key={wd} className="flex flex-col sm:flex-row sm:items-start gap-3 py-3 border-b border-border last:border-0">
                        <span className="w-28 shrink-0 text-text font-medium text-sm pt-2">{WEEKDAYS[wd]}</span>
                        <div className="flex-1 space-y-2">
                          {(week[wd] ?? []).map((block, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <TimeInput
                                value={block.start}
                                onChange={(v) => updateBlock(setWeek, wd, i, { ...block, start: v })}
                              />
                              <span className="text-text-dim">→</span>
                              <TimeInput
                                value={block.end}
                                onChange={(v) => updateBlock(setWeek, wd, i, { ...block, end: v })}
                              />
                              <button
                                onClick={() =>
                                  setWeek((w) => ({ ...w, [wd]: (w[wd] ?? []).filter((_, j) => j !== i) }))
                                }
                                className="text-text-dim hover:text-red-400 px-2 transition"
                                aria-label="Quitar bloque"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() =>
                              setWeek((w) => ({ ...w, [wd]: [...(w[wd] ?? []), { start: 540, end: 1020 }] }))
                            }
                            className="text-accent text-sm hover:underline"
                          >
                            + agregar bloque
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={saveWeek} disabled={saving} className="btn-primary mt-6">
                    {saving ? 'Guardando…' : 'Guardar horario'}
                  </button>
                </Card>

                <Card title="Fechas bloqueadas" subtitle="Vacaciones, viajes, días que no quieres ofrecer">
                  <div className="flex flex-wrap gap-2 mb-5">
                    <input
                      type="date"
                      value={newBlackout.start_date}
                      onChange={(e) => setNewBlackout({ ...newBlackout, start_date: e.target.value })}
                      className={INPUT + ' w-auto'}
                    />
                    <input
                      type="date"
                      value={newBlackout.end_date}
                      onChange={(e) => setNewBlackout({ ...newBlackout, end_date: e.target.value })}
                      className={INPUT + ' w-auto'}
                    />
                    <input
                      placeholder="Motivo (opcional)"
                      value={newBlackout.reason}
                      onChange={(e) => setNewBlackout({ ...newBlackout, reason: e.target.value })}
                      className={INPUT + ' w-auto flex-1 min-w-[160px]'}
                    />
                    <button onClick={addBlackout} className="btn-outline !py-3 !px-6">
                      Agregar
                    </button>
                  </div>
                  {config.blackouts.length === 0 ? (
                    <p className="text-text-dim text-sm">Ninguna fecha bloqueada.</p>
                  ) : (
                    <ul className="space-y-2">
                      {config.blackouts.map((b) => (
                        <li
                          key={b.id}
                          className="flex items-center justify-between gap-4 text-sm bg-primary-light border border-border rounded-xl px-4 py-3"
                        >
                          <span className="text-text">
                            {b.start_date}
                            {b.end_date !== b.start_date ? ` → ${b.end_date}` : ''}
                            {b.reason ? <span className="text-text-dim"> · {b.reason}</span> : null}
                          </span>
                          <button
                            onClick={() => removeBlackout(b.id)}
                            className="text-text-dim hover:text-red-400 transition"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </>
            )}

            {/* -------------------------------------------------- reglas */}
            {tab === 'rules' && (
              <Card title="Reglas de agendamiento">
                <div className="grid sm:grid-cols-2 gap-5">
                  <LabeledInput
                    label="Timezone (IANA)"
                    value={draft.timezone}
                    onChange={(v) => setDraft({ ...draft, timezone: v })}
                    hint="Ej. America/Chicago"
                  />
                  <LabeledInput
                    label="Duraciones ofrecidas (min)"
                    value={draft.durations.join(', ')}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        durations: v
                          .split(',')
                          .map((x) => Number(x.trim()))
                          .filter((n) => Number.isFinite(n) && n > 0),
                      })
                    }
                    hint="Separadas por coma. Ej. 30, 60"
                  />
                  <LabeledNumber
                    label="Cada cuántos minutos empieza un slot"
                    value={draft.slot_increment}
                    onChange={(v) => setDraft({ ...draft, slot_increment: v })}
                  />
                  <LabeledNumber
                    label="Anticipación mínima (horas)"
                    value={Math.round(draft.min_notice_minutes / 60)}
                    onChange={(v) => setDraft({ ...draft, min_notice_minutes: v * 60 })}
                    hint="Nadie puede agendar dentro de esta ventana"
                  />
                  <LabeledNumber
                    label="Colchón antes (min)"
                    value={draft.buffer_before}
                    onChange={(v) => setDraft({ ...draft, buffer_before: v })}
                  />
                  <LabeledNumber
                    label="Colchón después (min)"
                    value={draft.buffer_after}
                    onChange={(v) => setDraft({ ...draft, buffer_after: v })}
                  />
                  <LabeledNumber
                    label="Ventana máxima a futuro (días)"
                    value={draft.max_days_ahead}
                    onChange={(v) => setDraft({ ...draft, max_days_ahead: v })}
                  />
                  <LabeledNumber
                    label="Máximo de reuniones por día"
                    value={draft.daily_limit}
                    onChange={(v) => setDraft({ ...draft, daily_limit: v })}
                    hint="0 = sin límite"
                  />
                </div>

                <div className="mt-8 pt-6 border-t border-border space-y-4">
                  <Toggle
                    label="Permitir cancelar en línea"
                    checked={draft.allow_cancel}
                    onChange={(v) => setDraft({ ...draft, allow_cancel: v })}
                  />
                  {draft.allow_cancel && (
                    <LabeledNumber
                      label="Hasta cuántas horas antes se puede cancelar"
                      value={draft.cancel_cutoff_hours}
                      onChange={(v) => setDraft({ ...draft, cancel_cutoff_hours: v })}
                    />
                  )}
                  <Toggle
                    label="Permitir reagendar en línea"
                    checked={draft.allow_reschedule}
                    onChange={(v) => setDraft({ ...draft, allow_reschedule: v })}
                  />
                  {draft.allow_reschedule && (
                    <LabeledNumber
                      label="Hasta cuántas horas antes se puede reagendar"
                      value={draft.reschedule_cutoff_hours}
                      onChange={(v) => setDraft({ ...draft, reschedule_cutoff_hours: v })}
                    />
                  )}
                  <Toggle
                    label="Página de reservas abierta"
                    checked={draft.active}
                    onChange={(v) => setDraft({ ...draft, active: v })}
                  />
                </div>

                <button onClick={() => saveSettings(draft)} disabled={saving} className="btn-primary mt-8">
                  {saving ? 'Guardando…' : 'Guardar reglas'}
                </button>
              </Card>
            )}

            {/* ------------------------------------------------ reservas */}
            {tab === 'bookings' && (
              <>
                <Card title={`Próximas (${upcoming.length})`}>
                  {upcoming.length === 0 ? (
                    <p className="text-text-dim text-sm">Nada agendado por ahora.</p>
                  ) : (
                    <ul className="space-y-3">
                      {upcoming.map((b) => (
                        <BookingRow key={b.id} b={b} tz={draft.timezone} onCancel={() => cancelBooking(b.id)} />
                      ))}
                    </ul>
                  )}
                </Card>
                <Card title="Historial">
                  {rest.length === 0 ? (
                    <p className="text-text-dim text-sm">Sin historial todavía.</p>
                  ) : (
                    <ul className="space-y-3">
                      {rest.slice(0, 50).map((b) => (
                        <BookingRow key={b.id} b={b} tz={draft.timezone} />
                      ))}
                    </ul>
                  )}
                </Card>
              </>
            )}

            {/* -------------------------------------------- Zoom y textos */}
            {tab === 'content' && (
              <Card title="Zoom, evento y textos de la página">
                <div className="space-y-5">
                  <LabeledInput
                    label="Link de tu sala personal de Zoom"
                    value={draft.zoom_link}
                    onChange={(v) => setDraft({ ...draft, zoom_link: v })}
                    hint="Aparece en el evento del calendario y en los correos"
                  />
                  <LabeledInput
                    label="Nota del Zoom (passcode, instrucciones)"
                    value={draft.zoom_note}
                    onChange={(v) => setDraft({ ...draft, zoom_note: v })}
                  />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <LabeledInput
                      label="Tu nombre"
                      value={draft.host_name}
                      onChange={(v) => setDraft({ ...draft, host_name: v })}
                    />
                    <LabeledInput
                      label="Tu correo"
                      value={draft.host_email}
                      onChange={(v) => setDraft({ ...draft, host_email: v })}
                    />
                  </div>
                  <LabeledInput
                    label="Título del evento en el calendario"
                    value={draft.event_title}
                    onChange={(v) => setDraft({ ...draft, event_title: v })}
                    hint="Puedes usar {name} y {host}"
                  />
                  <LabeledTextarea
                    label="Descripción del evento"
                    value={draft.event_description}
                    onChange={(v) => setDraft({ ...draft, event_description: v })}
                    hint="Puedes usar {name}, {host}, {zoom} y {notes}"
                  />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <LabeledInput
                      label="Título de la página (EN)"
                      value={draft.page_title_en}
                      onChange={(v) => setDraft({ ...draft, page_title_en: v })}
                    />
                    <LabeledInput
                      label="Título de la página (ES)"
                      value={draft.page_title_es}
                      onChange={(v) => setDraft({ ...draft, page_title_es: v })}
                    />
                  </div>
                  <LabeledTextarea
                    label="Intro (EN)"
                    value={draft.page_intro_en}
                    onChange={(v) => setDraft({ ...draft, page_intro_en: v })}
                  />
                  <LabeledTextarea
                    label="Intro (ES)"
                    value={draft.page_intro_es}
                    onChange={(v) => setDraft({ ...draft, page_intro_es: v })}
                  />
                </div>
                <button onClick={() => saveSettings(draft)} disabled={saving} className="btn-primary mt-8">
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </Card>
            )}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent text-primary px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- piezas UI */

const INPUT =
  'w-full bg-primary-light border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition';

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-secondary border border-border rounded-2xl p-6 md:p-8 mb-6">
      <h2 className="!text-lg font-display font-semibold mb-1">{title}</h2>
      {subtitle && <p className="text-text-dim text-sm mb-6">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      {children}
    </section>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-text-dim mb-2">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={INPUT} />
      {hint && <span className="block text-text-dim text-xs mt-1.5">{hint}</span>}
    </label>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-text-dim mb-2">{label}</span>
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT} resize-none`} />
      {hint && <span className="block text-text-dim text-xs mt-1.5">{hint}</span>}
    </label>
  );
}

function LabeledNumber({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-text-dim mb-2">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={INPUT}
      />
      {hint && <span className="block text-text-dim text-xs mt-1.5">{hint}</span>}
    </label>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-text-dim mb-2">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition relative shrink-0 ${checked ? 'bg-accent' : 'bg-border'}`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-primary transition-all ${checked ? 'left-6' : 'left-1'}`}
        />
      </button>
      <span className="text-text text-sm">{label}</span>
    </label>
  );
}

function TimeInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="time"
      value={minutesToTime(value)}
      onChange={(e) => onChange(timeToMinutes(e.target.value))}
      className="bg-primary-light border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:border-accent transition"
    />
  );
}

function StatusLine({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p className={ok ? 'text-text-muted' : 'text-amber-400'}>
      <span className="mr-2">{ok ? '●' : '○'}</span>
      {children}
    </p>
  );
}

function BookingRow({ b, tz, onCancel }: { b: Booking; tz: string; onCancel?: () => void }) {
  const when = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(b.start_utc));

  return (
    <li className="bg-primary-light border border-border rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-text font-medium text-sm">
          {b.name}
          {b.status === 'cancelled' && <span className="text-text-dim font-normal"> · cancelada</span>}
        </p>
        <p className="text-text-dim text-xs truncate">
          {when} · {b.duration_min} min · {b.email}
        </p>
        {b.notes && <p className="text-text-muted text-xs mt-1 line-clamp-2">{b.notes}</p>}
      </div>
      {onCancel && (
        <button onClick={onCancel} className="text-text-dim hover:text-red-400 text-xs transition shrink-0">
          Cancelar
        </button>
      )}
    </li>
  );
}

/* ------------------------------------------------------------ utilidades */

function rulesToWeek(rules: AvailabilityRule[]): Record<number, Block[]> {
  const week: Record<number, Block[]> = {};
  for (const r of rules) {
    if (!r.active) continue;
    (week[r.weekday] ||= []).push({ start: r.start_min, end: r.end_min });
  }
  for (const k of Object.keys(week)) week[Number(k)].sort((a, b) => a.start - b.start);
  return week;
}

function updateBlock(
  setWeek: React.Dispatch<React.SetStateAction<Record<number, Block[]>>>,
  weekday: number,
  index: number,
  block: Block
) {
  setWeek((w) => ({
    ...w,
    [weekday]: (w[weekday] ?? []).map((b, i) => (i === index ? block : b)),
  }));
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function timeToMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  if (!Number.isFinite(h)) return 0;
  return h * 60 + (Number.isFinite(m) ? m : 0);
}
