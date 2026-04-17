import { MetricCard } from './MetricCard'
import { SparklineChart } from './SparklineChart'
import { GaugeBar } from './GaugeBar'
import { CircularGauge } from './CircularGauge'
import styles from './CpuCard.module.css'

export function CpuCard({ cpu, history }) {
  if (!cpu) return null
  return (
    <MetricCard title="CPU" accent="blue">
      <div className={styles.top}>
        <CircularGauge percent={cpu.percent} color="var(--blue)" label="Uso Total" sublabel={`${cpu.freq_mhz} MHz`} />
        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Núcleos Físicos</span>
            <span className={styles.infoVal}>{cpu.count_physical}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Threads Lógicas</span>
            <span className={styles.infoVal}>{cpu.count_logical}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Frequência</span>
            <span className={styles.infoVal}>{cpu.freq_mhz} <small>MHz</small></span>
          </div>
        </div>
      </div>
      <SparklineChart data={history} color="#3b82f6" />
      <div className={styles.cores}>
        {cpu.per_core.map((pct, i) => (
          <GaugeBar key={i} percent={pct} label={`C${i}`} />
        ))}
      </div>
    </MetricCard>
  )
}
