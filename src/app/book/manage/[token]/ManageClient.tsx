'use client';

import { useCallback, useEffect, useState } from 'react';
import { t, type Lang } from '@/lib/book/i18n';
import { dateKeyInTz, addDaysToKey, tzLabel } from '@/lib/book/time';

interface BookingView {
  name: string;
  email: string;
  notes: string | null;
  start: string;
  end: string;
  duration: number;
  tz: string;
  lang: string;
  status: 'confirmed' | 'cancelled';
}

interface Policy {
  hoursUntil: number;
  isPast: boolean;
  canCancel: boolean;
  canReschedule: boolean;
  allowCancel: boolean;
  allowReschedule: boolean;
  hostName: string;
  zoomLink: string;
  zoomNote: string;
}

type View = 'loading' | 'notfound' | 'detail' | 'confirmCancel' | 'cancelled' | 'reschedule' | 'moved';

export default function ManageClient({ token, lang }: { token: string; lang: Lang }) {
  const T = t(lang);
  const locale = T.locale;

  const [view, setView] = useState<View>('loading');
  const [booking, setBooking] = useState<BookingView | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [slots, setSlots] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/book/manage/${token}`, { cache: 'no-store' });
      if (!res.ok) return setView('notfound');
      const data = await res.json();
      setBooking(data.booking);
      setPolicy(data.policy);
      setView(data.booking.status === 'cancelled' ? 'cancelled' : 'detail');
    } catch {
      setView('notfound');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function openReschedule() {
    if (!booking) return;
    setView('reschedule');
    setLoadingSlots(true);
    const tz = booking.tz;
    const from = dateKeyInTz(new Date(), tz);
    const to = addDaysToKey(from, 45);
    try {
      const res = await fetch(
        `/api/book/availability?duration=${booking.duration}&tz=${encodeURIComponent(tz)}&from=${from}&to=${to}`
      );
      const data = await res.json();
      setSlots(data.days ?? {});
    } catch {
      setSlots({});
    } finally {
      setLoadingSlots(false);
    }
  }

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/book/manage/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === 'slot'
            ? T.errSlot
            : data.error === 'cutoff'
            ? body.action === 'cancel'
              ? T.cutoffCancel
              : T.cutoffReschedule
            : T.errGeneric
        );
        return false;
      }
      return true;
    } catch {
      setError(T.errGeneric);
      return false;
    } finally {
      setBusy(false);
    }
  }

  const fmtFull = (iso: string, tz: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));

  const fmtTime = (iso: string, tz: string) =>
    new Intl.DateTimeFormat(locale, { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date(iso));

  const fmtDayHeading = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(y, m - 1, d)));
  };

  /* ------------------------------------------------------------------ */

  return (
    <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-lg mx-auto">
        {view === 'loading' && <p className="text-text-muted text-center">{T.loading}</p>}

        {view === 'notfound' && (
          <div className="text-center">
            <h1 className="!text-3xl font-display font-bold mb-4">{T.notFound}</h1>
            <a href={`/book?lang=${lang}`} className="btn-primary mt-4">
              {T.bookAnother}
            </a>
          </div>
        )}

        {booking && policy && (view === 'detail' || view === 'confirmCancel') && (
          <>
            <p className="section-label">{T.manageTitle}</p>
            <h1 className="!text-3xl md:!text-4xl font-display font-bold mb-8">
              {T.manageWith} {policy.hostName}
            </h1>

            <div className="bg-secondary border border-border rounded-2xl p-6 mb-6">
              <p className="text-text text-lg font-semibold capitalize leading-snug">
                {fmtFull(booking.start, booking.tz)}
              </p>
              <p className="text-text-dim text-sm mt-1">
                {booking.duration} {T.minutesShort} · {tzLabel(booking.tz, locale)}
              </p>
              {policy.zoomLink && !policy.isPast && (
                <a
                  href={policy.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-6 w-full justify-center"
                >
                  {T.joinZoom}
                </a>
              )}
              {policy.zoomNote && <p className="text-text-dim text-xs mt-3">{policy.zoomNote}</p>}
            </div>

            {policy.isPast && <p className="text-text-muted text-sm mb-6">{T.statusPast}</p>}

            {view === 'detail' && !policy.isPast && (
              <div className="flex flex-col sm:flex-row gap-3">
                {policy.allowReschedule && (
                  <button
                    onClick={openReschedule}
                    disabled={!policy.canReschedule}
                    className="btn-outline flex-1 justify-center disabled:opacity-40"
                  >
                    {T.rescheduleCta}
                  </button>
                )}
                {policy.allowCancel && (
                  <button
                    onClick={() => setView('confirmCancel')}
                    disabled={!policy.canCancel}
                    className="btn-outline flex-1 justify-center hover:!border-red-400 hover:!text-red-400 disabled:opacity-40"
                  >
                    {T.cancelCta}
                  </button>
                )}
              </div>
            )}

            {view === 'detail' && !policy.isPast && policy.allowCancel && !policy.canCancel && (
              <p className="text-text-dim text-xs mt-4">{T.cutoffCancel}</p>
            )}

            {view === 'confirmCancel' && (
              <div className="bg-secondary border border-border rounded-2xl p-6">
                <h2 className="!text-lg font-display font-semibold mb-2">{T.cancelConfirmTitle}</h2>
                <p className="text-text-muted text-sm mb-6">{T.cancelConfirmBody}</p>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (await act({ action: 'cancel' })) setView('cancelled');
                    }}
                    disabled={busy}
                    className="flex-1 px-5 py-3 rounded-full bg-red-500/90 text-white font-semibold text-sm hover:bg-red-500 transition disabled:opacity-50"
                  >
                    {T.cancelYes}
                  </button>
                  <button
                    onClick={() => {
                      setView('detail');
                      setError(null);
                    }}
                    className="flex-1 px-5 py-3 rounded-full border border-border text-text font-semibold text-sm hover:border-accent hover:text-accent transition"
                  >
                    {T.cancelNo}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {view === 'cancelled' && (
          <div className="text-center">
            <h1 className="!text-3xl font-display font-bold mb-4">{T.cancelledTitle}</h1>
            <p className="text-text-muted mb-8">{T.cancelledBody}</p>
            <a href={`/book?lang=${lang}`} className="btn-primary">
              {T.bookAnother}
            </a>
          </div>
        )}

        {view === 'moved' && booking && (
          <div className="text-center">
            <h1 className="!text-3xl font-display font-bold mb-4">{T.rescheduledTitle}</h1>
            <p className="text-text-muted mb-2">{T.rescheduledBody}</p>
            <p className="text-accent font-display text-lg capitalize mb-8">
              {fmtFull(booking.start, booking.tz)}
            </p>
            <button onClick={() => load()} className="btn-outline">
              {T.manageTitle}
            </button>
          </div>
        )}

        {view === 'reschedule' && booking && (
          <>
            <button
              onClick={() => setView('detail')}
              className="text-text-muted hover:text-accent text-sm mb-6 inline-flex items-center gap-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {T.back}
            </button>
            <h1 className="!text-2xl md:!text-3xl font-display font-bold mb-2">{T.rescheduleTitle}</h1>
            <p className="text-text-dim text-sm mb-8">{tzLabel(booking.tz, locale)}</p>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            {loadingSlots && <p className="text-text-muted">{T.loading}</p>}
            {!loadingSlots && Object.keys(slots).length === 0 && (
              <p className="text-text-muted">{T.noSlotsMonth}</p>
            )}

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              {Object.keys(slots)
                .sort()
                .map((day) => (
                  <div key={day}>
                    <h3 className="!text-sm font-semibold text-text-muted mb-3 capitalize">{fmtDayHeading(day)}</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots[day].map((s) => (
                        <button
                          key={s}
                          disabled={busy}
                          onClick={async () => {
                            if (await act({ action: 'reschedule', start: s })) {
                              setBooking((b) => (b ? { ...b, start: s } : b));
                              setView('moved');
                            } else {
                              openReschedule();
                            }
                          }}
                          className="px-2 py-2.5 rounded-xl border border-border text-text text-sm font-medium hover:border-accent hover:text-accent transition disabled:opacity-40"
                        >
                          {fmtTime(s, booking.tz)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
