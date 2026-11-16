import type { MetadataRoute } from 'next';
import { LANGS, PAGES, SITE, pagePath, siteUrl } from '@/content/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return PAGES.filter((p) => !SITE.pages[p].noindex).flatMap((page) =>
    LANGS.map((lang) => ({
      url: base + pagePath(page, lang),
      lastModified: now,
      alternates: {
        languages: {
          ...Object.fromEntries(LANGS.map((l) => [SITE.html_lang[l], base + pagePath(page, l)])),
          'x-default': base + pagePath(page, 'uz'),
        },
      },
    })),
  );
}
