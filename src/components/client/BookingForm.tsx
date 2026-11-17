'use client';

import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { formatPhone, isValidPhone } from '@/lib/phone';

/* ---------- tooth chart (FDI numbering, dentist's view: patient's right on the left) ---------- */

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
type Kind = 'm' | 'p' | 'c' | 'i1' | 'i2';
const WID: Record<Kind, number> = { m: 30, p: 22, c: 20, i1: 20, i2: 17 };
const HEI: Record<Kind, number> = { m: 27, p: 24, c: 25, i1: 21, i2: 19 };
const kind = (n: number): Kind => {
  const d = n % 10;
  if (d >= 6) return 'm';
  if (d >= 4) return 'p';
  if (d === 3) return 'c';
  return d === 1 ? 'i1' : 'i2';
};

interface ToothShape { n: number; x: number; y: number; ang: number; w: number; h: number; tx: number; ty: number }

function arch(teeth: number[], cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): ToothShape[] {
  const N = 600;
  const pts: { x: number; y: number }[] = [];
  const cum: number[] = [];
  let len = 0;
  let prev: { x: number; y: number } | null = null;
  for (let j = 0; j <= N; j++) {
    const t = a0 + ((a1 - a0) * j) / N;
    const p = { x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t) };
    if (prev) len += Math.hypot(p.x - prev.x, p.y - prev.y);
    cum.push(len);
    pts.push(p);
    prev = p;
  }
  const ws = teeth.map((n) => WID[kind(n)] + 4);
  const k = len / ws.reduce((a, b) => a + b, 0);
  let acc = 0;
  return teeth.map((n, i) => {
    const s = (acc + (ws[i] ?? 0) / 2) * k;
    acc += ws[i] ?? 0;
    let j = 0;
    while (j < N && (cum[j] ?? 0) < s) j++;
    const p = pts[j]!;
    const q = pts[Math.min(j + 2, N)]!;
    const o = pts[Math.max(j - 2, 0)]!;
    const ang = (Math.atan2(q.y - o.y, q.x - o.x) * 180) / Math.PI;
    const w = WID[kind(n)] * k;
    const h = HEI[kind(n)] * Math.min(k, 1.1);
    const dx = cx - p.x;
    const dy = cy - p.y;
    const dl = Math.hypot(dx, dy) || 1;
    const off = h / 2 + 11;
    return { n, x: p.x, y: p.y, ang, w, h, tx: p.x + (dx / dl) * off, ty: p.y + (dy / dl) * off };
  });
}

const TEETH: ToothShape[] = [
  ...arch(UPPER, 220, 162, 192, 138, Math.PI + 0.13, 2 * Math.PI - 0.13),
  ...arch(LOWER, 220, 178, 182, 128, Math.PI - 0.13, 0.13),
];

/* ---------- form ---------- */

export interface BookingStrings {
  [k: string]: string;
}

interface Props {
  s: BookingStrings;
  lang: string;
  services: { id: string; label: string }[];
  phone: string;
  phoneDisplay: string;
  tgUrl: string;
  privacyHref: string;
  metrikaId: number;
}

type State = 'form' | 'sending' | 'done';

export default function BookingForm({ s, lang, services, phone, phoneDisplay, tgUrl, privacyHref, metrikaId }: Props) {
  const [picked, setPicked] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [service, setService] = useState(services[0]?.id ?? 'other');
  const [time, setTime] = useState<'t1' | 't2' | 't3'>('t1');
  const [bad, setBad] = useState({ name: false, phone: false });
  const [state, setState] = useState<State>('form');
  const [failed, setFailed] = useState(false);
  const startedAt = useRef(0); // set after hydration so the server-rendered markup stays identical
  const tsRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const errRef = useRef<HTMLDivElement>(null);

  /* a price card sent the visitor here with ?s=<service>: preselect it and put the cursor in the name field */
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('s');
    if (!wanted || !services.some((x) => x.id === wanted)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the query string is only readable after hydration
    setService(wanted);
    const id = window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(id);
  }, [services]);

  useEffect(() => {
    startedAt.current = Date.now();
    if (tsRef.current) tsRef.current.value = String(startedAt.current);
  }, []);

  useEffect(() => { if (state === 'done') doneRef.current?.focus(); }, [state]);
  useEffect(() => { if (failed) errRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, [failed]);

  const toggle = (n: number) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n].sort((a, b) => a - b)));
  const onToothKey = (e: KeyboardEvent<SVGGElement>, n: number) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(n); }
  };

  const serviceLabel = services.find((x) => x.id === service)?.label ?? s.o_other;
  const timeRange = { t1: '8–12', t2: '12–16', t3: '16–20' }[time];

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const badName = name.trim().length < 2;
    const badPhone = !isValidPhone(tel);
    setBad({ name: badName, phone: badPhone });
    if (badName) { nameRef.current?.focus(); return; }
    if (badPhone) { phoneRef.current?.focus(); return; }
    setFailed(false);
    setState('sending');
    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem('website') as HTMLInputElement | null)?.value ?? '';
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 15000);
    try {
      const r = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: tel, service, time, teeth: picked, lang, page: location.pathname, website: honeypot, ts: startedAt.current }),
        signal: ctrl.signal,
      });
      const j = (await r.json().catch(() => ({ ok: false }))) as { ok?: boolean };
      if (!r.ok || !j.ok) throw new Error(String(r.status));
      if (metrikaId && window.ym) window.ym(metrikaId, 'reachGoal', 'lead');
      setState('done');
    } catch {
      setFailed(true);
      setState('form');
    } finally {
      window.clearTimeout(timer);
    }
  }

  return (
    <div className="book">
      <div className="jaw-col">
        <h2 className="h3"><span>{s.jawTitle}</span> <span className="muted" style={{ fontWeight: 500, fontSize: 14 }}>{s.optional}</span></h2>
        <svg id="jaw" viewBox="0 0 440 340" role="group" aria-label={s.jawTitle}>
          {TEETH.map((t) => {
            const on = picked.includes(t.n);
            return (
              <g key={t.n} className={`tooth${on ? ' on' : ''}`} tabIndex={0} role="button" aria-pressed={on}
                aria-label={`${s.tooth} ${t.n}`} onClick={() => toggle(t.n)} onKeyDown={(e) => onToothKey(e, t.n)}>
                <g transform={`translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) rotate(${t.ang.toFixed(1)})`}>
                  <rect x={(-t.w / 2).toFixed(1)} y={(-t.h / 2).toFixed(1)} width={t.w.toFixed(1)} height={t.h.toFixed(1)} rx={(Math.min(t.w, t.h) * 0.34).toFixed(1)} />
                </g>
                <text x={t.tx.toFixed(1)} y={t.ty.toFixed(1)}>{t.n}</text>
              </g>
            );
          })}
          <text x={220} y={118} className="jaw-lbl" aria-hidden="true">{s.jawUp}</text>
          <text x={220} y={230} className="jaw-lbl" aria-hidden="true">{s.jawLow}</text>
          <text x={220} y={174} className="jaw-hint" aria-hidden="true">{s.jawHint}</text>
          <text x={14} y={174} className="jaw-lbl" aria-hidden="true">{s.sideR}</text>
          <text x={426} y={174} className="jaw-lbl" aria-hidden="true">{s.sideL}</text>
        </svg>
        <div className="picked">
          <span>{s.picked}</span>{' '}
          <output htmlFor="jaw">{picked.length ? picked.map((n) => `${s.tooth} ${n}`).join(', ') : s.none}</output>{' '}
          {picked.length ? <button type="button" className="linkbtn" onClick={() => setPicked([])}>{s.clear}</button> : null}
        </div>
        <p className="jaw-cap">{s.jawCap}</p>
      </div>

      <div className="form-col">
        {state !== 'done' ? (
          <form action="/api/lead/" method="post" noValidate onSubmit={submit}>
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="teeth" value={picked.join(',')} />
            <input type="hidden" name="ts" ref={tsRef} defaultValue="" />
            <div className="hp" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="fstack">
              <div className={`field${bad.name ? ' bad' : ''}`}>
                <label htmlFor="name">{s.fName}</label>
                <input ref={nameRef} id="name" name="name" autoComplete="given-name" placeholder={s.fNamePh} maxLength={60} required
                  aria-invalid={bad.name} value={name} onChange={(e) => setName(e.target.value)} />
                <span className="err" hidden={!bad.name}>{s.errName}</span>
              </div>
              <div className={`field${bad.phone ? ' bad' : ''}`}>
                <label htmlFor="phone">{s.fPhone}</label>
                <input ref={phoneRef} id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67"
                  maxLength={22} required aria-invalid={bad.phone} value={tel}
                  onFocus={() => { if (!tel) setTel('+998 '); }}
                  onBlur={() => { if (tel.replace(/\D/g, '') === '998' || tel.trim() === '+') setTel(''); }}
                  onChange={(e) => setTel(formatPhone(e.target.value))} />
                <span className="err" hidden={!bad.phone}>{s.errPhone}</span>
              </div>
              <div className="field">
                <label htmlFor="service">{s.fService}</label>
                <select id="service" name="service" value={service} onChange={(e) => setService(e.target.value)}>
                  {services.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                  <option value="other">{s.o_other}</option>
                </select>
              </div>
              <fieldset className="field">
                <legend>{s.fTime}</legend>
                <div className="seg">
                  {(['t1', 't2', 't3'] as const).map((k, i) => (
                    <Fragment key={k}>
                      <input type="radio" name="time" id={k} value={k} checked={time === k} onChange={() => setTime(k)} />
                      <label htmlFor={k}><span>{s[k]}</span><small>{['8–12', '12–16', '16–20'][i]}</small></label>
                    </Fragment>
                  ))}
                </div>
              </fieldset>
              <div className="form-err" role="alert" hidden={!failed} ref={errRef}>
                <span>{s.errSend}</span>
                <div className="btn-row">
                  <a className="btn btn-ghost btn-sm" href={`tel:${phone}`} data-goal="tel">{phoneDisplay}</a>
                  <a className="btn btn-tg btn-sm" href={tgUrl} target="_blank" rel="noopener" data-goal="tg">
                    <svg className="ico" aria-hidden="true"><use href="#i-send" /></svg><span>Telegram</span>
                  </a>
                </div>
              </div>
              <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={state === 'sending'}>
                {state === 'sending' ? s.sending : s.submit}
              </button>
              <p className="form-foot">{s.consent} <a href={privacyHref}>{s.consentL}</a></p>
            </div>
          </form>
        ) : (
          <div className="done" tabIndex={-1} ref={doneRef}>
            <span className="kicker">{s.doneEyebrow}</span>
            <h2>{(s.thanks ?? '').replace('{n}', name.trim())}</h2>
            <dl>
              <dt>{s.fPhone}</dt><dd>{formatPhone(tel)}</dd>
              <dt>{s.fService}</dt><dd>{serviceLabel}</dd>
              <dt>{s.fTime}</dt><dd>{s[time]}, {timeRange}</dd>
              <dt>{s.dTeeth}</dt><dd>{picked.length ? picked.join(', ') : s.noTeeth}</dd>
            </dl>
            <p>{s.doneP}</p>
          </div>
        )}
        <div className="tg-alt">
          <div><b>{s.tgAltT}</b><span>{s.tgAltP}</span></div>
          <a className="btn btn-tg btn-sm" href={tgUrl} target="_blank" rel="noopener" data-goal="tg">
            <svg className="ico" aria-hidden="true"><use href="#i-send" /></svg><span>Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
