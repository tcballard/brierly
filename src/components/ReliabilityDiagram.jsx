import { reliabilityBins } from '../scoring';

const SIZE = 220;
const PAD = 30;
const INNER = SIZE - 2 * PAD;
const mapX = (v) => PAD + v * INNER;
const mapY = (v) => SIZE - PAD - v * INNER;

function ReliabilityDiagram({ resolvedItems }) {
  if (resolvedItems.length === 0) {
    return (
      <section>
        <h2>Reliability</h2>
        <p>Resolve some predictions to see your reliability curve.</p>
      </section>
    );
  }

  const bins = reliabilityBins(resolvedItems).filter((b) => b.count > 0);

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
