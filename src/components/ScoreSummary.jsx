import { brierScore, logLoss, confidenceGap } from '../scoring';

// null (no resolved predictions yet) renders as an em-dash, not NaN.
const fmt = (v) => (v === null ? '—' : v.toFixed(3));

function ScoreSummary({ predictions }) {
  const resolved = predictions.filter((p) => p.outcome !== null);
  const items = resolved.map((p) => ({ p: p.probability, o: p.outcome }));
  const openCount = predictions.length - resolved.length;

  return (
    <section>
      <h2>Score</h2>
      <dl>
        <div>
          <dt>Brier</dt>
          <dd>{fmt(brierScore(items))}</dd>
        </div>
        <div>
          <dt>Log loss</dt>
          <dd>{fmt(logLoss(items))}</dd>
        </div>
        <div>
          <dt>Bias</dt>
          <dd>{fmt(confidenceGap(items))}</dd>
        </div>
        <div>
          <dt>Open</dt>
          <dd>{openCount}</dd>
        </div>
        <div>
          <dt>Resolved</dt>
          <dd>{resolved.length}</dd>
        </div>
      </dl>
    </section>
  );
}

export default ScoreSummary;
