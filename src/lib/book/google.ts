// Cliente de Google Calendar con `fetch` directo. Evitamos la librería oficial
// `googleapis` a propósito: pesa decenas de MB y esto corre en funciones serverless.

import { bookEnv, googleRedirectUri } from './env';
import { getGoogleAccount, saveGoogleAccount } from './store';
import type { Interval } from './types';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

export class GoogleNotConnectedError extends Error {}
export class GoogleApiError extends Error {
  constructor(message: string, public status: number, public body: string) {
    super(message);
  }
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: bookEnv.googleClientId,
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent', // fuerza que Google devuelva refresh_token
    include_granted_scopes: 'true',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCode(code: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: bookEnv.googleClientId,
      client_secret: bookEnv.googleClientSecret,
      redirect_uri: googleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new GoogleApiError('No se pudo canjear el código de Google', res.status, body);
  return JSON.parse(body) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };
}

async function refresh(refreshToken: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: bookEnv.googleClientId,
      client_secret: bookEnv.googleClientSecret,
      grant_type: 'refresh_token',
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new GoogleApiError('No se pudo refrescar el token de Google', res.status, body);
  return JSON.parse(body) as { access_token: string; expires_in: number };
}

/** Access token vigente, refrescando y persistiendo si hace falta. */
export async function getAccessToken(): Promise<{ token: string; calendarId: string }> {
  const acc = await getGoogleAccount();
  if (!acc?.refresh_token) throw new GoogleNotConnectedError('Google Calendar no está conectado');

  const stillValid =
    acc.access_token && acc.expires_at && new Date(acc.expires_at).getTime() - Date.now() > 90_000;
  if (stillValid) return { token: acc.access_token as string, calendarId: acc.calendar_id || 'primary' };

  const fresh = await refresh(acc.refresh_token);
  const expires_at = new Date(Date.now() + fresh.expires_in * 1000).toISOString();
  await saveGoogleAccount({ access_token: fresh.access_token, expires_at });
  return { token: fresh.access_token, calendarId: acc.calendar_id || 'primary' };
}

async function api(path: string, init: RequestInit & { token: string }) {
  const { token, ...rest } = init;
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(rest.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new GoogleApiError(`Google Calendar respondió ${res.status}`, res.status, text);
  return text ? JSON.parse(text) : null;
}

export async function fetchUserEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { email?: string };
    return json.email ?? null;
  } catch {
    return null;
  }
}

export async function listCalendars() {
  const { token } = await getAccessToken();
  const json = await api('/users/me/calendarList?minAccessRole=writer&maxResults=100', {
    method: 'GET',
    token,
  });
  return ((json?.items ?? []) as any[]).map((c) => ({
    id: c.id as string,
    summary: (c.summaryOverride || c.summary) as string,
    primary: Boolean(c.primary),
  }));
}

/** Bloques ocupados del calendario del host en el rango dado. */
export async function fetchBusy(fromIso: string, toIso: string): Promise<Interval[]> {
  const { token, calendarId } = await getAccessToken();
  const json = await api('/freeBusy', {
    method: 'POST',
    token,
    body: JSON.stringify({
      timeMin: fromIso,
      timeMax: toIso,
      items: [{ id: calendarId }],
    }),
  });
  const cal = json?.calendars?.[calendarId];
  const busy = (cal?.busy ?? []) as Array<{ start: string; end: string }>;
  return busy.map((b) => ({ start: new Date(b.start).getTime(), end: new Date(b.end).getTime() }));
}

export interface EventInput {
  summary: string;
  description: string;
  location: string;
  startIso: string;
  endIso: string;
  timeZone: string;
  guestName: string;
  guestEmail: string;
}

export async function createEvent(ev: EventInput): Promise<string> {
  const { token, calendarId } = await getAccessToken();
  const json = await api(
    `/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({
        summary: ev.summary,
        description: ev.description,
        location: ev.location,
        start: { dateTime: ev.startIso, timeZone: ev.timeZone },
        end: { dateTime: ev.endIso, timeZone: ev.timeZone },
        attendees: [{ email: ev.guestEmail, displayName: ev.guestName }],
        guestsCanModify: false,
        guestsCanInviteOthers: false,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 10 },
          ],
        },
      }),
    }
  );
  return json.id as string;
}

export async function moveEvent(eventId: string, startIso: string, endIso: string, timeZone: string) {
  const { token, calendarId } = await getAccessToken();
  await api(
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify({
        start: { dateTime: startIso, timeZone },
        end: { dateTime: endIso, timeZone },
      }),
    }
  );
}

export async function deleteEvent(eventId: string) {
  const { token, calendarId } = await getAccessToken();
  try {
    await api(
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
      { method: 'DELETE', token }
    );
  } catch (e) {
    // 404/410 = ya no existe; para nosotros el resultado es el mismo.
    if (e instanceof GoogleApiError && (e.status === 404 || e.status === 410)) return;
    throw e;
  }
}
