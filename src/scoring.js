// Pure scoring functions over resolved predictions. No React, no I/O.
// Each function takes an array of { p, o } where p is the stated probability
// and o is the boolean outcome. Empty input returns null (not NaN), so the UI
// can show an empty state rather than a broken number.

const EPS = 1e-9;

// Keep p strictly inside (0, 1) so log loss never hits log(0) = -Infinity.
const clampP = (p) => Math.min(1 - EPS, Math.max(EPS, p));

const toBit = (o) => (o ? 1 : 0);

// Mean of (p - o)^2. 0 = perfect, 0.25 = always-0.5 baseline, 1 = worst.
export function brierScore(items) {
  if (!items.length) return null;
  const sum = items.reduce((acc, { p, o }) => {
    const d = clampP(p) - toBit(o);
    return acc + d * d;
  }, 0);
  return sum / items.length;
}

// Mean of -(o*ln(p) + (1-o)*ln(1-p)). Clamped so it stays finite.
export function logLoss(items) {
  if (!items.length) return null;
  const sum = items.reduce((acc, { p, o }) => {
    const cp = clampP(p);
    const bit = toBit(o);
    return acc - (bit * Math.log(cp) + (1 - bit) * Math.log(1 - cp));
  }, 0);
  return sum / items.length;
}

// Bias: mean(stated - observed). >0 overconfident, <0 underconfident.
export function confidenceGap(items) {
  if (!items.length) return null;
  const sum = items.reduce((acc, { p, o }) => acc + (p - toBit(o)), 0);
  return sum / items.length;
}

// Five bins across [0,1]. Per bin: mean stated prob (x), hit rate (y), count.
// Always returns 5 bins; empty bins carry meanProb/hitRate = null.
export function reliabilityBins(items) {
  const bins = Array.from({ length: 5 }, (_, i) => ({
    lower: i * 0.2,
    upper: (i + 1) * 0.2,
    sumP: 0,
    hits: 0,
    count: 0,
  }));
  for (const { p, o } of items) {
    const idx = Math.min(4, Math.max(0, Math.floor(p / 0.2)));
    bins[idx].sumP += p;
    bins[idx].hits += toBit(o);
    bins[idx].count += 1;
  }
  return bins.map((b) => ({
    lower: b.lower,
    upper: b.upper,
    count: b.count,
    meanProb: b.count ? b.sumP / b.count : null,
    hitRate: b.count ? b.hits / b.count : null,
  }));
}
