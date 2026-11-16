/** Phone input helpers shared by the form (client) and the lead API (server). */

export const digits = (v: string): string => v.replace(/\D/g, '');

/**
 * Format while typing: Uzbek numbers as +998 XX XXX XX XX, anything that starts
 * with + and another country code is kept as typed (spaces allowed, max 15 digits).
 * A number typed without + is treated as Uzbek.
 */
export function formatPhone(value: string): string {
  const raw = value.replace(/^\s+/, '');
  let d = digits(raw);
  if (!d) return raw.charAt(0) === '+' ? '+' : '';
  if (raw.charAt(0) !== '+' && !d.startsWith('998')) d = '998' + d;
  if (d.startsWith('998') || '998'.startsWith(d)) {
    if (d.length <= 3) return '+' + d;
    const n = d.slice(3, 12);
    let out = '+998 ' + n.slice(0, 2);
    if (n.length > 2) out += ' ' + n.slice(2, 5);
    if (n.length > 5) out += ' ' + n.slice(5, 7);
    if (n.length > 7) out += ' ' + n.slice(7, 9);
    return out;
  }
  const spaced = raw.replace(/[^\d ]/g, '').replace(/\s+/g, ' ').replace(/^ /, '');
  let count = 0;
  let out = '';
  for (const ch of spaced) {
    if (count >= 15) break;
    out += ch;
    if (ch !== ' ') count++;
  }
  return '+' + out;
}

export function isValidPhone(value: string): boolean {
  let d = digits(value);
  if (d.length === 9) d = '998' + d;
  return d.startsWith('998') ? d.length === 12 : d.length >= 8 && d.length <= 15;
}

/** Normalised number for the clinic's chat. */
export function displayPhone(value: string): string {
  let d = digits(value);
  if (d.length === 9) d = '998' + d;
  if (d.startsWith('998') && d.length === 12) {
    return `+998 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
  }
  return '+' + d;
}
