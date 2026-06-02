/* ============================================================
   ReliabilityDiagram — stated probability (x) vs observed hit
   rate (y) against a 45° reference. Points sized by count.
   Themable via tokens. Has an empty state.
   ============================================================ */
import { I } from '../icons';
import { reliabilityBins } from '../scoring';
import { resolvedItems } from '../lib';

function ReliabilityDiagram({ predictions }) {
  const items = resolvedItems(predictions);
  const bins = reliabilityBins(items)
    .filter((b) => b.count > 0)
    .map((b) => ({ mid: b.meanProb, hit: b.hitRate, count: b.count }));
  const total = bins.reduce((s, b) => s + b.count, 0);

  if (total < 2) {
    return (
      <div className="card empty">
        <div className="empty-ico">{I.summary}</div>
        <div className="empty-t">Not enough data yet</div>
        <div className="empty-d">Resolve a handful of predictions and your calibration curve will appear here.</div>
      </div>
    );
  }

  const W = 320, H = 300;
  const ml = 36, mr = 14, mt = 14, mb = 32;
  const pw = W - ml - mr, ph = H - mt - mb;
  const X = (v) => ml + v * pw;
  const Y = (v) => mt + (1 - v) * ph;
  const maxC = Math.max(...bins.map((b) => b.count));
  const rFor = (c) => 6 + (Math.sqrt(c) / Math.sqrt(maxC)) * 12;

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const sorted = [...bins].sort((a, b) => a.mid - b.mid);
  const curve = sorted.map((b) => `${X(b.mid).toFixed(1)},${Y(b.hit).toFixed(1)}`).join(' ');

  return (
    <div className="card diagram">
      <svg className="diagram-svg" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Reliability diagram across ${total} resolved predictions. Points above the diagonal mean underconfidence, below mean overconfidence.`}>
        {ticks.map((t) => (
          <g key={'g' + t}>
            <line x1={X(t)} y1={mt} x2={X(t)} y2={mt + ph} stroke="var(--grid)" strokeWidth="1" />
            <line x1={ml} y1={Y(t)} x2={ml + pw} y2={Y(t)} stroke="var(--grid)" strokeWidth="1" />
          </g>
        ))}
        {ticks.map((t) => (
          <text key={'xl' + t} x={X(t)} y={H - 10} textAnchor="middle"
            style={{ fontSize: 10.5, fill: 'var(--label-3)', fontFamily: 'var(--num)' }}>{Math.round(t * 100)}</text>
        ))}
        {ticks.filter((t) => t > 0).map((t) => (
          <text key={'yl' + t} x={ml - 8} y={Y(t) + 3} textAnchor="end"
            style={{ fontSize: 10.5, fill: 'var(--label-3)', fontFamily: 'var(--num)' }}>{Math.round(t * 100)}</text>
        ))}

        {/* 45° reference */}
        <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke="var(--diag)" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />

        {/* calibration curve */}
        <polyline points={curve} fill="none" stroke="var(--tint)" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" opacity="0.5" />

        {/* points */}
        {sorted.map((b, i) => {
          const r = rFor(b.count);
          return (
            <g key={i}>
              <circle cx={X(b.mid)} cy={Y(b.hit)} r={r} fill="var(--tint)" fillOpacity="0.18" />
              <circle cx={X(b.mid)} cy={Y(b.hit)} r={r} fill="none" stroke="var(--tint)" strokeWidth="2.5" />
              <text x={X(b.mid)} y={Y(b.hit) + 3.5} textAnchor="middle"
                style={{ fontSize: 11, fontWeight: 700, fill: 'var(--tint)', fontFamily: 'var(--num)' }}
                className="tnum">{b.count}</text>
            </g>
          );
        })}
      </svg>
      <div className="diagram-legend">
        <span><span className="lg-line" /> Perfect calibration</span>
        <span><span className="lg-swatch" style={{ background: 'var(--tint)', opacity: 0.5 }} /> Your bins · size = count</span>
      </div>
      <div className="diagram-legend" style={{ marginTop: 2, color: 'var(--label-3)' }}>
        <span>Stated confidence (x) → observed hit rate (y)</span>
      </div>
    </div>
  );
}

export default ReliabilityDiagram;
