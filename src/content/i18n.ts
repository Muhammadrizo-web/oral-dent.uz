/**
 * Content layer: everything the pages show comes from site.json.
 * Edit texts, prices and contacts there; this file only types it, fixes Uzbek
 * typography and maps URLs to pages.
 */
import raw from './site.json';

export const LANGS = ['uz', 'ru', 'en', 'zh'] as const;
export type Lang = (typeof LANGS)[number];

export const PAGES = ['home', 'services', 'doctor', 'clinic', 'reviews', 'booking', 'contacts', 'privacy', 'thanks'] as const;
export type PageKey = (typeof PAGES)[number];

export type Dict = Record<string, string>;
type PerLang<T> = Record<Lang, T>;

export interface Service { id: string; p: number | null; ill: string }
export interface Cert { f: string; org: PerLang<string>; ti: PerLang<string>; dt: PerLang<string> }
export interface Review { text: string; author: string; source: string; date: string }
export interface PageMeta { slug: PerLang<string>; title: PerLang<string>; desc: PerLang<string>; noindex?: boolean }

export interface Settings {
  name: string;
  legal_name: string;
  url: string;
  phone: string;
  phone_display: string;
  telegram: string;
  geo: [number, number];
  hours: { days: string; open: string; close: string };
  yandex_org: string;
  yandex_reviews: string;
  gis: string;
  rev_count: number;
  metrika_id: string;
  privacy_retention_days: number;
  privacy_updated: string;
  lic_until: string;
}

interface SiteData {
  settings: Settings;
  lang_names: PerLang<string>;
  html_lang: PerLang<string>;
  og_locale: PerLang<string>;
  pages: Record<PageKey, PageMeta>;
  services: Service[];
  featured: string[];
  plan: string[];
  after: string[];
  videos: [string, string][];
  home_videos: string[];
  certs: Cert[];
  reviews: Review[];
  privacy: PerLang<[string, string][]>;
  privacy_metrika: PerLang<[string, string]>;
  t: PerLang<Dict>;
}

/** Uzbek Latin typography: o' g' -> o‘ g‘, any other apostrophe -> ’ (authors may type a plain '). */
export function uzq(v: string): string {
  return v.replace(/([oOgG])'/g, '$1‘').replace(/'/g, '’');
}

function fixUz(data: SiteData): SiteData {
  const d = structuredClone(data);
  d.t.uz = Object.fromEntries(Object.entries(d.t.uz).map(([k, v]) => [k, uzq(v)]));
  for (const p of Object.values(d.pages)) {
    p.title.uz = uzq(p.title.uz);
    p.desc.uz = uzq(p.desc.uz);
  }
  for (const c of d.certs) {
    c.org.uz = uzq(c.org.uz);
    c.ti.uz = uzq(c.ti.uz);
    c.dt.uz = uzq(c.dt.uz);
  }
  d.privacy.uz = d.privacy.uz.map(([h, p]) => [uzq(h), uzq(p)] as [string, string]);
  d.privacy_metrika.uz = [uzq(d.privacy_metrika.uz[0]), uzq(d.privacy_metrika.uz[1])];
  return d;
}

export const SITE: SiteData = fixUz(raw as unknown as SiteData);
export const S = SITE.settings;

export const dict = (lang: Lang): Dict => SITE.t[lang];
export const isLang = (v: string | undefined): v is Lang => !!v && (LANGS as readonly string[]).includes(v);

/** '/ru/uslugi/' — the URL of a page in a language (Uzbek has no prefix). */
export function pagePath(page: PageKey, lang: Lang): string {
  const slug = SITE.pages[page].slug[lang];
  const prefix = lang === 'uz' ? '' : `/${lang}`;
  return `${prefix}/${slug ? slug + '/' : ''}`.replace(/^\/\//, '/');
}

export interface Route { lang: Lang; page: PageKey; slug: string[] }

export const ROUTES: Route[] = LANGS.flatMap((lang) =>
  PAGES.map((page) => ({
    lang,
    page,
    slug: pagePath(page, lang).split('/').filter(Boolean),
  })),
);

export function resolveRoute(slug: string[] | undefined): Route | undefined {
  const key = (slug ?? []).map(decodeURIComponent).join('/');
  return ROUTES.find((r) => r.slug.join('/') === key);
}

/** 1500000 -> '1 500 000' (uz/ru) or '1,500,000' (en/zh). */
export function num(p: number, lang: Lang): string {
  const sep = lang === 'en' || lang === 'zh' ? ',' : ' ';
  return Math.round(p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

export const SERVICE = (id: string): Service => {
  const s = SITE.services.find((x) => x.id === id);
  if (!s) throw new Error(`unknown service ${id}`);
  return s;
};

export const TG_URL = `https://t.me/${S.telegram}`;

/** Absolute site address: settings.url, NEXT_PUBLIC_SITE_URL, or the Vercel production URL. */
export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || S.url;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

export const NAV: PageKey[] = ['home', 'services', 'doctor', 'clinic', 'reviews', 'contacts'];
export const NAV_KEY: Record<PageKey, string> = {
  home: 'navHome', services: 'navServices', doctor: 'navDoctor', clinic: 'navClinic', reviews: 'navReviews',
  booking: 'ctaShort', contacts: 'navContacts', privacy: 'footPrivacy', thanks: 'tyH1',
};
