import { headers } from 'next/headers';
import BookingClient from './BookingClient';
import { pickLang } from '@/lib/book/i18n';
import { getGoogleAccount, getSettings, isConfigured } from '@/lib/book/store';
import { DEFAULT_SETTINGS } from '@/lib/book/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function BookPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const lang = pickLang(headers().get('accept-language'), searchParams.lang);

  let settings = DEFAULT_SETTINGS;
  let ready = false;
  if (isConfigured()) {
    try {
      const [s, account] = await Promise.all([getSettings(), getGoogleAccount()]);
      settings = s;
      ready = s.active && Boolean(account?.refresh_token);
    } catch {
      ready = false;
    }
  }

  return (
    <BookingClient
      lang={lang}
      ready={ready}
      title={lang === 'es' ? settings.page_title_es : settings.page_title_en}
      intro={lang === 'es' ? settings.page_intro_es : settings.page_intro_en}
      hostName={settings.host_name}
      durations={settings.durations}
    />
  );
}
