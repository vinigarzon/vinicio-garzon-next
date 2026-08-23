// Sesión del admin del módulo: cookie httpOnly firmada con HMAC.
// A diferencia de /admin (blog), la contraseña nunca llega al navegador.

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { bookEnv } from './env';

export const SESSION_COOKIE = 'vg_book_session';
export const OAUTH_STATE_COOKIE = 'vg_book_oauth_state';
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 horas

function sign(payload: string): string {
  return crypto.createHmac('sha256', bookEnv.sessionSecret).update(payload).digest('base64url');
}

export function createSessionValue(): string {
  const payload = JSON.stringify({ exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  const encoded = Buffer.from(payload).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionValue(value: string | undefined): boolean {
  if (!value || !bookEnv.sessionSecret) return false;
  const [encoded, signature] = value.split('.');
  if (!encoded || !signature) return false;

  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

/** Comparación de contraseña en tiempo constante. */
export function passwordMatches(input: string): boolean {
  if (!bookEnv.adminPassword || typeof input !== 'string') return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(bookEnv.adminPassword).digest();
  return crypto.timingSafeEqual(a, b);
}

export function isAdmin(): boolean {
  return verifySessionValue(cookies().get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export { MAX_AGE_SECONDS };
