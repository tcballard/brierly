/* ============================================================
   ScoreSummary — headline calibration read + Health-style stat
   cards. Brier, log loss, bias, and track record with plain-
   language context. All numbers come from scoring.js (via lib).
   ============================================================ */
import { I } from '../icons';
import { brierScore, logLoss, confidenceGap } from '../scoring';
import { resolvedItems, verdict, calScore } from '../lib';

const READ_COLOR = { good: '--pos', over: '--due', under: '--cat-work', new: '--label-3' };

function CalRing({ score, color, size = 78 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const off = score == null ? circ : circ * (1 - score / 100);
  return (
    <svg className="read-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--fill)" strokeWidth="9" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={`var(${color})`} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="ring-anim"
        style={{ '--circ': circ }}
      />
      {score != null && (
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          style={{ fontFamily: 'var(--num)', fontWeight: 700, fontSize: 21, fill: 'var(--label)' }}
          className="tnum">{score}</text>
      )}
    </svg>
  );
}

function StatCard({ icon, label, value, unit, ctx, arrow }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span className="stat-ico">{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-val tnum">
        {value}{unit && <span className="unit">{unit}</span>}
        {arrow}
      </div>
      <div className="stat-ctx">{ctx}</div>
    </div>
  );
}

function ScoreSummary({ predictions }) {
  const items = resolvedItems(predictions);
  const openCount = predictions.length - items.length;
  const brier = brierScore(items);
  const ll = logLoss(items);
  const b = confidenceGap(items);
  const v = verdict(predictions);

  const score = calScore(brier);
  const color = READ_COLOR[v.key];

  const biasPts = b == null ? null : Math.round(b * 100);
  const biasWord = biasPts == null ? '—' : biasPts > 4 ? 'Overconfident' : biasPts < -4 ? 'Underconfident' : 'Balanced';
  const biasArrow = biasPts == null ? null : (
    <span className="stat-arrow" style={{ color: `var(${biasPts > 4 ? '--due' : biasPts < -4 ? '--cat-work' : '--pos'})`, marginLeft: 6 }}>
      {biasPts > 0 ? '▲' : biasPts < 0 ? '▼' : '●'}
    </span>
  );

  return (
    <div>
      <div className="card read anim-in">
        <CalRing score={score} color={color} />
        <div className="read-body">
          <div className="read-verdict" style={{ color: `var(${color})` }}>{v.title}</div>
          <div className="read-detail">{v.detail}</div>
        </div>
      </div>

      <div className="stat-grid" style={{ marginTop: 12 }}>
        <StatCard
          icon={I.target}
          label="Brier score"
          value={brier == null ? '—' : brier.toFixed(2)}
          ctx="Lower is better · 0.25 = coin-flip baseline"
        />
        <StatCard
          icon={I.scale}
          label="Log loss"
          value={ll == null ? '—' : ll.toFixed(2)}
          ctx="Lower is better · punishes confident misses"
        />
        <StatCard
          icon={I.gauge}
          label="Bias"
          value={biasPts == null ? '—' : (biasPts > 0 ? '+' : '') + biasPts}
          unit={biasPts == null ? '' : 'pts'}
          arrow={biasArrow}
          ctx={biasPts == null ? 'Resolve predictions to measure' : `${biasWord} · + means above outcomes`}
        />
        <StatCard
          icon={I.layers}
          label="Track record"
          value={items.length}
          unit={`/ ${openCount + items.length}`}
          ctx={`${openCount} open · ${items.length} resolved`}
        />
      </div>
    </div>
  );
}

export default ScoreSummary;
