import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveRoute, type Lang, type PageKey } from '@/content/i18n';
import { jsonLd, pageMetadata } from '@/lib/seo';
import Home from '@/components/pages/Home';
import { Booking, Clinic, Contacts, Doctor, Privacy, ReviewsPage, Services, Thanks } from '@/components/pages/Inner';

type Props = { params: Promise<{ slug?: string[] }> };

const VIEWS: Record<PageKey, (p: { lang: Lang }) => React.ReactNode> = {
  home: Home,
  services: Services,
  doctor: Doctor,
  clinic: Clinic,
  reviews: ReviewsPage,
  booking: Booking,
  contacts: Contacts,
  privacy: Privacy,
  thanks: Thanks,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = resolveRoute((await params).slug);
  return route ? pageMetadata(route.page, route.lang) : {};
}

export default async function Page({ params }: Props) {
  const route = resolveRoute((await params).slug);
  if (!route) notFound();
  const View = VIEWS[route.page];
  return (
    <>
      {jsonLd(route.page, route.lang).map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
      ))}
      <View lang={route.lang} />
    </>
  );
}
