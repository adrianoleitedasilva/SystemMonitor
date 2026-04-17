const SIZE = 120
const STROKE = 10
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

function colorForPercent(pct) {
  if (pct >= 90) return 'var(--red)'
  if (pct >= 70) return 'var(--yellow)'
  return null
}

export function CircularGauge({ percent, color, label, sublabel }) {
  const clamped = Math.min(100, Math.max(0, percent))
  const offset = CIRC * (1 - clamped / 100)
  const fill = colorForPercent(clamped) || color

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke={fill}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s ease' }}
        />
        <text
          x={SIZE / 2} y={SIZE / 2}
          textAnchor="middle" dominantBaseline="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${SIZE/2}px ${SIZE/2}px`, fill: fill, fontSize: 22, fontWeight: 700, fontFamily: 'inherit', transition: 'fill 0.4s ease' }}
        >
          {clamped.toFixed(0)}%
        </text>
      </svg>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginTop: 4 }}>{label}</div>
      )}
      {sublabel && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sublabel}</div>
      )}
    </div>
  )
}
