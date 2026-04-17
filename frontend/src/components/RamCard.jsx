import { MetricCard } from './MetricCard'
import { SparklineChart } from './SparklineChart'
import { CircularGauge } from './CircularGauge'
import styles from './RamCard.module.css'

export function RamCard({ ram, history }) {
  if (!ram) return null
  return (
    <MetricCard title="Memória RAM" accent="green">
      <div className={styles.top}>
        <CircularGauge
          percent={ram.percent}
          color="var(--green)"
          label="Uso"
          sublabel={`${ram.total_gb} GB total`}
        />
        <div className={styles.info}>
          <div className={styles.bar}>
            <div className={styles.barLabel}>
              <span>Em uso</span>
              <span style={{ color: 'var(--green)' }}>{ram.used_gb} GB</span>
            </div>
            <div className={styles.track}>
              <div className={styles.fill} style={{ width: `${ram.percent}%` }} />
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Disponível</span>
              <span className={styles.statVal}>{ram.available_gb} <small>GB</small></span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total</span>
              <span className={styles.statVal}>{ram.total_gb} <small>GB</small></span>
            </div>
          </div>
        </div>
      </div>
      <SparklineChart data={history} color="#22c55e" />
    </MetricCard>
  )
}
