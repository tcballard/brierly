import { brierScore, logLoss, confidenceGap } from '../scoring';

const fmt = (v) => (v === null ? '—' : v.toFixed(3));

function ScoreSummary({ resolvedItems, openCount }) {
  return (
    <section>
      <h2>Score</h2>
      <dl>
        <div>
          <dt>Brier</dt>
          <dd>{fmt(brierScore(resolvedItems))}</dd>
        </div>
        <div>
          <dt>Log loss</dt>
          <dd>{fmt(logLoss(resolvedItems))}</dd>
        </div>
        <div>
          <dt>Bias</dt>
          <dd>{fmt(confidenceGap(resolvedItems))}</dd>
        </div>
        <div>
          <dt>Open</dt>
          <dd>{openCount}</dd>
        </div>
        <div>
          <dt>Resolved</dt>
          <dd>{resolvedItems.length}</dd>
        </div>
      </dl>
    </section>
  );
}

export default ScoreSummary;
