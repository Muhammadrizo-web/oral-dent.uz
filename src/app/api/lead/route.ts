/**
 * POST /api/lead — booking form → one message in the administrators' Telegram group.
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   TELEGRAM_BOT_TOKEN  token from @BotFather
 *   TELEGRAM_CHAT_ID    id of the administrators' group (negative number, e.g. -1001234567890)
 *
 * Nothing is stored: the request is checked, turned into one message and forgotten.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { LANGS, SITE, S, dict, isLang, pagePath, type Lang } from '@/content/i18n';
import { displayPhone, isValidPhone } from '@/lib/phone';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_TEETH = new Set([11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48]);
const MIN_FILL_MS = 2500; // a person needs longer than this to fill the form
const MAX_BODY = 8 * 1024;
const TIMES: Record<string, string> = { t1: '8–12', t2: '12–16', t3: '16–20' };

type Body = Record<string, unknown>;

const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function tashkentNow(): string {
  const d = new Date(Date.now() + 5 * 3600 * 1000); // UTC+5, no daylight saving
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

function message(body: Body, lang: Lang) {
  const ru = dict('ru');
  const service = typeof body.service === 'string' && SITE.services.some((s) => s.id === body.service) ? body.service : 'other';
  const time = typeof body.time === 'string' && body.time in TIMES ? body.time : 't1';
  const teethRaw = Array.isArray(body.teeth) ? body.teeth : String(body.teeth ?? '').split(',');
  const teeth = [...new Set(teethRaw.map(Number).filter((n) => VALID_TEETH.has(n)))].sort((a, b) => a - b);
  return [
    '🦷 <b>Заявка с сайта Oral Dent</b>',
    '',
    `<b>Имя:</b> ${esc(str(body.name, 60))}`,
    `<b>Телефон:</b> ${esc(displayPhone(str(body.phone, 30)))}`,
    `<b>Услуга:</b> ${esc((service === 'other' ? ru.o_other : ru[`s_${service}`]) ?? service)}`,
    `<b>Когда удобно:</b> ${esc(`${ru[time] ?? time}, ${TIMES[time]}`)}`,
    `<b>Зубы:</b> ${teeth.length ? teeth.join(', ') : '—'}`,
    `<b>Язык сайта:</b> ${lang.toUpperCase()}`,
    '',
    `🕒 ${tashkentNow()} (Ташкент)`,
  ].join('\n');
}

async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  const api = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`${api}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: ctrl.signal,
      cache: 'no-store',
    });
    if (!r.ok) console.error('lead: telegram', r.status, (await r.text()).slice(0, 300));
    return r.ok;
  } catch (err) {
    console.error('lead: telegram fetch failed', String(err));
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** JSON for the site's script; for a plain HTML form (no JavaScript) a redirect or a short page. */
function reply(req: NextRequest, lang: Lang, status: number, body: { ok: boolean; error?: string; fields?: string[] }) {
  const wantsJson = (req.headers.get('accept') ?? '').includes('application/json') ||
    (req.headers.get('content-type') ?? '').includes('application/json');
  if (wantsJson) return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  // relative Location: correct behind any proxy or domain
  if (body.ok) return new NextResponse(null, { status: 303, headers: { Location: pagePath('thanks', lang), 'Cache-Control': 'no-store' } });
  const t = dict(lang);
  const html = `<!DOCTYPE html><html lang="${SITE.html_lang[lang]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Oral Dent</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:560px;margin:12vh auto;padding:0 20px;color:#14211F}a{color:#A64E08;font-weight:700}p{margin:0 0 16px}</style></head>
<body><p>${esc(t.errSend ?? '')}</p><p><a href="tel:${S.phone}">${esc(S.phone_display)}</a> · <a href="https://t.me/${S.telegram}">Telegram</a></p><p><a href="${pagePath('booking', lang)}">← ${esc(t.bookH1 ?? '')}</a></p></body></html>`;
  return new NextResponse(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  // same site only: browsers always send Origin on POST
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get('host')) return NextResponse.json({ ok: false, error: 'origin' }, { status: 403 });
    } catch {
      return NextResponse.json({ ok: false, error: 'origin' }, { status: 403 });
    }
  }
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY) return NextResponse.json({ ok: false, error: 'size' }, { status: 413 });

  const ctype = (req.headers.get('content-type') ?? '').toLowerCase();
  let body: Body = {};
  try {
    if (ctype.includes('application/json')) {
      const text = await req.text();
      if (text.length > MAX_BODY) return NextResponse.json({ ok: false, error: 'size' }, { status: 413 });
      body = (JSON.parse(text) as Body) ?? {};
    } else if (ctype.includes('form')) {
      const fd = await req.formData();
      fd.forEach((v, k) => { if (typeof v === 'string') body[k] = v; });
    } else {
      return NextResponse.json({ ok: false, error: 'type' }, { status: 415 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'body' }, { status: 400 });
  }

  const lang: Lang = typeof body.lang === 'string' && isLang(body.lang) ? body.lang : LANGS[0];

  // bots: the hidden field is filled in, or the form was sent faster than a person can type
  const ts = Number(body.ts) || 0;
  if (str(body.website, 200) || (ts > 0 && Date.now() - ts < MIN_FILL_MS)) return reply(req, lang, 200, { ok: true });

  const fields: string[] = [];
  if (str(body.name, 60).length < 2) fields.push('name');
  if (!isValidPhone(str(body.phone, 30))) fields.push('phone');
  if (fields.length) return reply(req, lang, 422, { ok: false, error: 'invalid', fields });

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.error('lead: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not set');
    return reply(req, lang, 503, { ok: false, error: 'not_configured' });
  }

  const sent = await sendTelegram(message(body, lang));
  return sent ? reply(req, lang, 200, { ok: true }) : reply(req, lang, 502, { ok: false, error: 'telegram' });
}

export function GET() {
  return NextResponse.json({ ok: false, error: 'method' }, { status: 405, headers: { Allow: 'POST' } });
}
