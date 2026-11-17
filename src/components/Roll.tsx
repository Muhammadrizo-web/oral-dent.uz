import type { CSSProperties } from 'react';

const STRIP = '0123456789';

/**
 * A number that rolls into place like a mechanical counter when its home-page screen becomes current.
 * Pure markup + CSS: each digit is a column of 0–9 that slides to its value; the full value is the label.
 * Without scripts (or outside the home page) it simply shows the number.
 */
export default function Roll({ value, className = '' }: { value: string; className?: string }) {
  const chars = Array.from(value);
  const digits = chars.filter((c) => /\d/.test(c)).length;
  let k = 0;
  return (
    <span className={`roll ${className}`} role="img" aria-label={value}>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i} className="roll-c" aria-hidden="true">{c}</span>;
        const order = digits - 1 - k++; // the last digit spins longest
        const style = { ['--n' as string]: Number(c) + 10, ['--o' as string]: order } as CSSProperties;
        return (
          <span key={i} className="roll-d" aria-hidden="true">
            <span className="roll-s" style={style}>{Array.from(STRIP + STRIP).map((d, j) => <i key={j}>{d}</i>)}</span>
          </span>
        );
      })}
    </span>
  );
}
