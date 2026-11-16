import type { Metadata } from 'next';
import { LANGS, NAV_KEY, SITE, S, dict, pagePath, siteUrl, type Lang, type PageKey } from '@/content/i18n';

export function pageMetadata(page: PageKey, lang: Lang): Metadata {
  const meta = SITE.pages[page];
  const title = meta.title[lang];
  const description = meta.desc[lang] || undefined;
  const languages: Record<string, string> = Object.fromEntries(LANGS.map((l) => [SITE.html_lang[l], pagePath(page, l)]));
  languages['x-default'] = pagePath(page, 'uz');
  return {
    metadataBase: new URL(siteUrl()),
    title: { absolute: title },
    description,
    alternates: meta.noindex ? undefined : { canonical: pagePath(page, lang), languages },
    robots: meta.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      siteName: 'Oral Dent',
      title,
      description,
      locale: SITE.og_locale[lang],
      url: pagePath(page, lang),
      images: [{ url: `/og/og-${lang}.jpg`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    formatDetection: { telephone: false },
    icons: {
      icon: [{ url: '/brand/favicon.svg', type: 'image/svg+xml' }, { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' }],
      apple: '/brand/apple-touch-icon.png',
    },
  };
}

/** schema.org: the clinic (home, contacts), the dentist (doctor page), breadcrumbs (inner pages). */
export function jsonLd(page: PageKey, lang: Lang): object[] {
  const t = dict(lang);
  const base = siteUrl();
  const clinic = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': `${base}/#clinic`,
    name: S.name,
    legalName: S.legal_name,
    url: base + pagePath('home', lang),
    telephone: S.phone,
    logo: `${base}/brand/icon-512.png`,
    image: `${base}/og/og-${lang}.jpg`,
    address: { '@type': 'PostalAddress', streetAddress: t.cAddr, addressLocality: 'Tashkent', addressCountry: 'UZ' },
    geo: { '@type': 'GeoCoordinates', latitude: S.geo[0], longitude: S.geo[1] },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: S.hours.open,
      closes: S.hours.close,
    }],
    currenciesAccepted: 'UZS',
    priceRange: '$$',
    sameAs: [S.yandex_org, `https://t.me/${S.telegram}`],
    availableLanguage: ['uz', 'ru'],
  };
  const out: object[] = [];
  if (page === 'home' || page === 'contacts') out.push(clinic);
  if (page === 'doctor') {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: t.docName,
      jobTitle: (t.docRole ?? '').split('·')[0]?.trim(),
      image: `${base}/brand/doctor.jpg`,
      worksFor: { '@id': `${base}/#clinic` },
    });
  }
  if (page !== 'home' && page !== 'thanks') {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t.navHome, item: base + pagePath('home', lang) },
        { '@type': 'ListItem', position: 2, name: t[NAV_KEY[page]], item: base + pagePath(page, lang) },
      ],
    });
  }
  return out;
}
