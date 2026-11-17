import type { CSSProperties } from 'react';
import { dict, type Lang } from '@/content/i18n';

export function statusLabels(lang: Lang) {
  const t = dict(lang);
  return {
    trust2: t.trust2 ?? '',
    stOpen: t.stOpen ?? '',
    stSun: t.stSun ?? '',
    stEarly: t.stEarly ?? '',
    stSat: t.stSat ?? '',
    stNight: t.stNight ?? '',
  };
}

/** entrance order inside a slide: elements marked .a rise one after another when their slide becomes current */
export const a = (n: number): CSSProperties => ({ ['--a' as string]: n });
