import { MetricCard } from './MetricCard'
import { CircularGauge } from './CircularGauge'
import { GaugeBar } from './GaugeBar'
import styles from './GpuCard.module.css'

function tempColor(t) {
  if (t >= 85) return 'var(--red)'
  if (t >= 70) return 'var(--yellow)'
  return 'var(--green)'
}

export function GpuCard({ gpus }) {
  if (!gpus || gpus.length === 0) return null
  return (
    <MetricCard title="GPU" accent="purple">
      {gpus.map((g, i) => (
        <div key={i} className={styles.gpu}>
          <div className={styles.name}>{g.name}</div>
          <div className={styles.top}>
            <CircularGauge percent={g.load_percent} color="var(--purple)" label="Load" />
            <div className={styles.info}>
              <div className={styles.tempRow}>
                <span className={styles.tempLabel}>Temperatura</span>
                <span className={styles.tempVal} style={{ color: tempColor(g.temperature_c) }}>
                  {g.temperature_c}°C
                </span>
              </div>
              <GaugeBar
                percent={(g.memory_used_mb / g.memory_total_mb) * 100}
                label="VRAM"
                sublabel={`${g.memory_used_mb} / ${g.memory_total_mb} MB`}
              />
            </div>
          </div>
        </div>
      ))}
    </MetricCard>
  )
}
