/*
 * "Did you mean …@gmail.com?" for the checkout email (owner, 2026-11-24, after a
 * gamil.com typo lost an order alert). Compares the part after @ with the
 * domains people in Israel actually use and suggests the closest one when it's
 * one or two letters off. Never changes anything by itself: the customer taps
 * the suggestion to accept it.
 */

const COMMON_DOMAINS = [
  "gmail.com", "walla.co.il", "walla.com", "hotmail.com", "hotmail.co.il", "outlook.com", "outlook.co.il",
  "yahoo.com", "icloud.com", "me.com", "live.com", "msn.com", "aol.com", "protonmail.com", "proton.me",
  "012.net.il", "bezeqint.net", "netvision.net.il", "zahav.net.il", "smile.net.il",
];

/** Edit distance with adjacent swaps counted as one change (gmial → gmail) */
function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** The corrected address, or null when the domain looks fine (or unknown and not close to a common one). */
export function suggestEmail(email: string): string | null {
  const value = email.trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1 || at === value.length - 1) return null;
  const domain = value.slice(at + 1);
  if (COMMON_DOMAINS.includes(domain)) return null;
  let best: string | null = null;
  let bestScore = Infinity;
  for (const known of COMMON_DOMAINS) {
    const score = distance(domain, known);
    if (score < bestScore) { bestScore = score; best = known; }
  }
  // gmail.co / gmail.con / gamil.com / gmial.com / gmal.com → gmail.com; leave real custom domains alone
  if (!best || bestScore > 2 || bestScore >= domain.length / 2) return null;
  return `${email.trim().slice(0, at)}@${best}`;
}
