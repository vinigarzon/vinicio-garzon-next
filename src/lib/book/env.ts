// Variables de entorno del módulo. Todas con prefijo BOOK_ para que no colisionen
// con nada del blog. Ninguna es NEXT_PUBLIC: todas viven solo en el servidor.

export const bookEnv = {
  supabaseUrl: process.env.BOOK_SUPABASE_URL || '',
  supabaseKey: process.env.BOOK_SUPABASE_SERVICE_ROLE_KEY || '',
  googleClientId: process.env.BOOK_GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.BOOK_GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.BOOK_GOOGLE_REDIRECT_URI || '',
  adminPassword: process.env.BOOK_ADMIN_PASSWORD || '',
  sessionSecret: process.env.BOOK_SESSION_SECRET || '',
  resendKey: process.env.BOOK_RESEND_API_KEY || '',
  fromEmail: process.env.BOOK_FROM_EMAIL || '',
  hostEmail: process.env.BOOK_HOST_EMAIL || '',
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viniciogarzon.com').replace(/\/$/, ''),
};

export function missingEnv(): string[] {
  const required: Array<[string, string]> = [
    ['BOOK_SUPABASE_URL', bookEnv.supabaseUrl],
    ['BOOK_SUPABASE_SERVICE_ROLE_KEY', bookEnv.supabaseKey],
    ['BOOK_GOOGLE_CLIENT_ID', bookEnv.googleClientId],
    ['BOOK_GOOGLE_CLIENT_SECRET', bookEnv.googleClientSecret],
    ['BOOK_ADMIN_PASSWORD', bookEnv.adminPassword],
    ['BOOK_SESSION_SECRET', bookEnv.sessionSecret],
  ];
  return required.filter(([, v]) => !v).map(([k]) => k);
}

export function googleRedirectUri(): string {
  return bookEnv.googleRedirectUri || `${bookEnv.siteUrl}/api/book/google/callback`;
}
