import { headers } from 'next/headers';
import ManageClient from './ManageClient';
import { pickLang } from '@/lib/book/i18n';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function ManagePage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { lang?: string };
}) {
  const lang = pickLang(headers().get('accept-language'), searchParams.lang);
  return <ManageClient token={params.token} lang={lang} />;
}
