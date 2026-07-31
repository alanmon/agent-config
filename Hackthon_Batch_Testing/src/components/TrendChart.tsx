import type { Metric } from '../data';

const W = 700;
const H = 300;
const PAD_T = 16;
const PAD_B = 8;

/** Catmull-Rom → cubic Bézier, so the series reads as the smooth curve in Figma. */
function smoothPath(series: number[]): string {
  const pts = series.map((v, i) => ({
    x: (i / (series.length - 1)) * W,
    y: PAD_T + (1 - v) * (H - PAD_T - PAD_B),
  }));

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

interface Props {
  metrics: Metric[];
  ticks: string[];
}

export default function TrendChart({ metrics, ticks }: Props) {
  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Performance trend">
        {/* Horizontal gridlines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="0"
            x2={W}
            y1={PAD_T + (i / 4) * (H - PAD_T - PAD_B)}
            y2={PAD_T + (i / 4) * (H - PAD_T - PAD_B)}
            stroke="var(--line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {metrics.map((m) => (
          <path
            key={m.id}
            d={smoothPath(m.series)}
            fill="none"
            stroke={m.color}
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="trend-ticks">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
