import Script from 'next/script';
import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import { LANGS, ROUTES, SITE, S, dict, pagePath, resolveRoute, type Lang } from '@/content/i18n';
import { SPRITE } from '@/content/sprite';
import { MobileBar, SiteFooter, SiteHeader } from '@/components/Chrome';
import Motion from '@/components/client/Motion';
import '../globals.css';

/* every page is pre-rendered at build time; unknown URLs get the 404 page */
export const dynamicParams = false;
export function generateStaticParams() {
  return ROUTES.map((r) => ({ slug: r.slug }));
}

const FONTS: Record<Lang, string[]> = {
  uz: ['montserrat-latin-800-normal', 'manrope-latin-400-normal'],
  en: ['montserrat-latin-800-normal', 'manrope-latin-400-normal'],
  ru: ['montserrat-cyrillic-800-normal', 'manrope-cyrillic-400-normal'],
  zh: ['montserrat-latin-800-normal'],
};

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const route = resolveRoute(slug);
  const lang: Lang = route?.lang ?? 'uz';
  const page = route?.page ?? 'home';
  const t = dict(lang);
  const metrika = /^\d+$/.test(S.metrika_id) ? Number(S.metrika_id) : 0;
  for (const f of FONTS[lang]) preload(`/fonts/${f}.woff2`, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });

  return (
    <html lang={SITE.html_lang[lang]} data-page={page} suppressHydrationWarning>
      <body>
        {/* without JavaScript the tooth chart can't work, so it is hidden; the form below still posts */}
        <noscript><style>{'.jaw-col{display:none}'}</style></noscript>
        <a className="skip" href="#main">{t.skip}</a>
        <div aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: SPRITE }} />
        <SiteHeader lang={lang} page={page} />
        <main id="main" key={`${lang}-${page}`}>{children}</main>
        <SiteFooter lang={lang} page={page} />
        <MobileBar lang={lang} />
        <Motion lang={lang} isHome={page === 'home'} metrikaId={metrika}
          homes={Object.fromEntries(LANGS.map((l) => [l, pagePath('home', l)]))} />
        {metrika ? (
          <Script id="metrika" strategy="afterInteractive">{`
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
ym(${metrika},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}</Script>
        ) : null}
      </body>
    </html>
  );
}
