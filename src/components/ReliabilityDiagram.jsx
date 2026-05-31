import { reliabilityBins } from '../scoring';

// Square plot in a 0..1 x 0..1 space. SVG y grows downward, so mapY inverts.
const SIZE = 220;
const PAD = 30;
const INNER = SIZE - 2 * PAD;
const mapX = (v) => PAD + v * INNER;
const mapY = (v) => SIZE - PAD - v * INNER;

// x = mean stated probability, y = observed hit rate. Points below the 45-line
// at high probability = overconfidence. At personal scale this is directional.
function ReliabilityDiagram({ predictions }) {
  const items = predictions
    .filter((p) => p.outcome !== null)
    .map((p) => ({ p: p.probability, o: p.outcome }));

  if (items.length === 0) {
    return (
      <section>
        <h2>Reliability</h2>
        <p>Resolve some predictions to see your reliability curve.</p>
      </section>
    );
  }

  const bins = reliabilityBins(items).filter((b) => b.count > 0);

  return (
    <section>
      <h2>Reliability</h2>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Reliability diagram: stated probability versus observed hit rate"
      >
        <rect
          x={PAD}
          y={PAD}
          width={INNER}
          height={INNER}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <line
          x1={mapX(0)}
          y1={mapY(0)}
          x2={mapX(1)}
          y2={mapY(1)}
          stroke="currentColor"
          strokeDasharray="4 3"
        />
        {bins.map((b) => (
          <g key={b.lower}>
            <circle
              cx={mapX(b.meanProb)}
              cy={mapY(b.hitRate)}
              r={3 + b.count}
              fill="currentColor"
            />
            <text
              x={mapX(b.meanProb) + 5 + b.count}
              y={mapY(b.hitRate) + 3}
              fontSize="10"
              fill="currentColor"
            >
              {b.count}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}

export default ReliabilityDiagram;
