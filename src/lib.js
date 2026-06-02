/* ============================================================
   lib.js — presentation + calibration helpers.
   The pure scoring math lives in scoring.js (tested, untouched).
   This layer maps our data model — probability stored 0.01–0.99,
   resolveBy as 'YYYY-MM-DD', createdAt/resolvedAt as ISO strings —
   onto it, plus category/anchor/date formatting for the UI.
   ============================================================ */
import { brierScore, confidenceGap } from './scoring';

export const CATS = {
  work: { label: 'Work', v: '--cat-work' },
  markets: { label: 'Markets', v: '--cat-markets' },
  personal: { label: 'Personal', v: '--cat-personal' },
};
export const CAT_ORDER = ['work', 'markets', 'personal'];

// verbal anchor for a probability percent (1–99)
export function anchorFor(pct) {
  if (pct <= 5) return 'Almost no chance';
  if (pct <= 15) return 'Very unlikely';
  if (pct <= 30) return 'Unlikely';
  if (pct <= 42) return 'Probably not';
  if (pct <= 46) return 'Leaning no';
  if (pct <= 54) return 'Coin flip';
  if (pct <= 58) return 'Leaning yes';
  if (pct <= 70) return 'Probably';
  if (pct <= 85) return 'Likely';
  if (pct <= 95) return 'Very likely';
  return 'Almost certain';
}

// ---- dates -------------------------------------------------
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// add N days from today → 'YYYY-MM-DD'
export function addDaysStr(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// 'YYYY-MM-DD' → local Date (noon, to dodge timezone edges)
function parseDay(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export const isOpen = (p) => p.outcome === null || p.outcome === undefined;
export function isDue(p) {
  return isOpen(p) && p.resolveBy && p.resolveBy <= todayStr();
}

export function relDay(dayStr) {
  const MS = 86400000;
  const d0 = new Date();
  d0.setHours(0, 0, 0, 0);
  const d1 = parseDay(dayStr);
  d1.setHours(0, 0, 0, 0);
  const diff = Math.round((d1 - d0) / MS);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${-diff}d ago`;
  if (diff < 7) return `${diff}d`;
  if (diff < 14) return '1 week';
  if (diff < 31) return `${Math.round(diff / 7)} weeks`;
  if (diff < 60) return '1 month';
  return `${Math.round(diff / 30)} months`;
}

// accepts 'YYYY-MM-DD' or a full ISO timestamp
export function fmtDate(value) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDay(value) : new Date(value);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ---- calibration (built on scoring.js) ---------------------
// map resolved predictions onto the scoring { p, o } shape
export function resolvedItems(predictions) {
  return predictions
    .filter((p) => !isOpen(p))
    .map((p) => ({ p: p.probability, o: p.outcome }));
}

// single-prediction Brier (mean over one item)
export const brierOne = (probability, outcome) =>
  brierScore([{ p: probability, o: outcome }]);

// 0–100 calibration score from Brier (0 → 100, 0.5 → 0)
export function calScore(brier) {
  return brier == null ? null : Math.max(0, Math.round((1 - brier * 2) * 100));
}

// plain-language verdict from bias (confidenceGap) + sample size
export function verdict(predictions) {
  const items = resolvedItems(predictions);
  const n = items.length;
  if (n < 3) {
    return { key: 'new', title: 'Just getting started', detail: 'Resolve a few more predictions to see how calibrated you are.' };
  }
  const b = confidenceGap(items);
  const ab = Math.abs(b);
  if (ab < 0.05) return { key: 'good', title: 'Well calibrated', detail: "Your confidence closely matches how often you're right. Keep it up." };
  if (b >= 0.15) return { key: 'over', title: 'Notably overconfident', detail: `You're landing about ${Math.round(ab * 100)} points below your stated confidence. Try dialling certainty back.` };
  if (b >= 0.05) return { key: 'over', title: 'Slightly overconfident', detail: `Outcomes trail your confidence by ~${Math.round(ab * 100)} points. A touch more humility helps.` };
  if (b <= -0.15) return { key: 'under', title: 'Notably underconfident', detail: `You're right ${Math.round(ab * 100)} points more often than you claim. Trust yourself more.` };
  return { key: 'under', title: 'Slightly underconfident', detail: `You beat your stated confidence by ~${Math.round(ab * 100)} points. You can commit harder.` };
}
