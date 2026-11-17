import Script from 'next/script';
import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import { LANGS, ROUTES, SITE, S, dict, pagePath, resolveRoute, type Lang } from '@/content/i18n';
import { SPRITE } from '@/content/sprite';
import { MobileBar, SiteFooter, SiteHeader } from '@/components/Chrome';
import Motion from '@/components/client/Motion';
import Cursor from '@/components/client/Cursor';
import { THEME_BOOT } from '@/components/client/Theme';
import '../globals.css';

/* every page is pre-rendered at build time; unknown URLs get the 404 page */
export const dynamicParams = false;
export function generateStaticParams() {
  return ROUTES.map((r) => ({ slug: r.slug }));
}

const FONTS: Record<Lang, string[]> = {
  uz: ['manrope-latin-400-normal', 'manrope-latin-500-normal'],
  en: ['manrope-latin-400-normal', 'manrope-latin-500-normal'],
  ru: ['manrope-cyrillic-400-normal', 'manrope-cyrillic-500-normal'],
  zh: ['manrope-latin-500-normal'],
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
    <html lang={SITE.html_lang[lang]} data-page={page} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        {/* first visit of the session: the brand mark draws itself, then the curtain lifts (pure CSS, removes itself) */}
        <div className="intro-veil" aria-hidden="true">
          <svg viewBox="-110 -110 220 220"><path className="a" d="M45.47 -62.58A77.35 77.35 0 0 1 -45.47 62.58" /><circle className="d" r="40" /></svg>
        </div>
        {/* without JavaScript the tooth chart can't work, so it is hidden; the form below still posts */}
        <noscript><style>{'.jaw-col{display:none}'}</style></noscript>
        <a className="skip" href="#main">{t.skip}</a>
        <span className="page-prog" aria-hidden="true" />
        <div aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: SPRITE }} />
        <SiteHeader lang={lang} page={page} />
        <main id="main" key={`${lang}-${page}`}>{children}</main>
        <SiteFooter lang={lang} page={page} />
        <MobileBar lang={lang} />
        <Cursor />
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
