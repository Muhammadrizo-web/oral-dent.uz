#!/usr/bin/env node
// What is still missing before Oral Dent goes live.   npm run check:launch
import { readFileSync, existsSync } from 'node:fs';

const site = JSON.parse(readFileSync(new URL('../src/content/site.json', import.meta.url), 'utf8'));
const st = site.settings;
const env = (k) => (process.env[k] ?? '').trim();
const ok = [];
const todo = [];
const check = (cond, text) => (cond ? ok : todo).push(text);

const sp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

check(st.url || env('NEXT_PUBLIC_SITE_URL'),
  'Адрес сайта: settings.url в src/content/site.json или NEXT_PUBLIC_SITE_URL на Vercel. Без домена Vercel подставит *.vercel.app — для canonical и sitemap лучше свой домен');
check(String(st.metrika_id ?? '').trim(), 'Номер счётчика Яндекс Метрики в settings.metrika_id');
check(env('TELEGRAM_BOT_TOKEN') && env('TELEGRAM_CHAT_ID'),
  'Vercel → Settings → Environment Variables: TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID (Production), затем Redeploy и тестовая заявка');
todo.push(`Клиника подтверждает цены «от» в services[].p (сейчас: ${site.services.filter((s) => s.p).map((s) => `${s.id} ${sp(s.p)}`).join(', ')})`);
todo.push(`Число отзывов «${st.rev_count}+» сверено с Яндекс Картами и 2GIS`);
todo.push(`Клиника согласна удалять заявки из чата за ${st.privacy_retention_days} дней (текст политики данных); юрист смотрит политику`);
todo.push('Носитель вычитывает EN и 中文 (и UZ, если писал не носитель)');
todo.push('Тариф Vercel: Hobby только для некоммерческих сайтов — для сайта клиники нужен Pro (или другой хостинг)');
if (!existsSync(new URL('../.next/BUILD_ID', import.meta.url))) todo.push('Проверить сборку: npm run build');

console.log('Готово:');
for (const x of ok) console.log('  ✓', x);
console.log('Осталось:');
todo.forEach((x, i) => console.log(`  ${i + 1}. ${x}`));
