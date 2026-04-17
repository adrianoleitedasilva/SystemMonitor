import { MetricCard } from './MetricCard'
import styles from './DiskCard.module.css'

function colorForPercent(pct) {
  if (pct >= 90) return 'var(--red)'
  if (pct >= 70) return 'var(--yellow)'
  return 'var(--cyan)'
}

export function DiskCard({ disk, compact }) {
  if (!disk) return null
  return (
    <MetricCard title="Disco" accent="yellow">
      <div className={styles.ioRow}>
        <div className={styles.ioItem}>
          <div className={styles.ioIcon} style={{ color: 'var(--cyan)', background: 'var(--cyan-glow)' }}>↓</div>
          <div>
            <div className={styles.ioLabel}>Leitura</div>
            <div className={styles.ioVal} style={{ color: 'var(--cyan)' }}>
              {disk.read_mb_s} <small>MB/s</small>
            </div>
          </div>
        </div>
        <div className={styles.ioDivider} />
        <div className={styles.ioItem}>
          <div className={styles.ioIcon} style={{ color: 'var(--yellow)', background: 'var(--yellow-glow)' }}>↑</div>
          <div>
            <div className={styles.ioLabel}>Escrita</div>
            <div className={styles.ioVal} style={{ color: 'var(--yellow)' }}>
              {disk.write_mb_s} <small>MB/s</small>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.partitions}>
        {disk.partitions.map(p => {
          const color = colorForPercent(p.percent)
          return (
            <div key={p.mountpoint} className={styles.partition}>
              <div className={styles.partTop}>
                <div className={styles.partMount}>{p.mountpoint}</div>
                <div className={styles.partPct} style={{ color }}>{p.percent.toFixed(0)}%</div>
              </div>
              <div className={styles.partSub}>
                {p.used_gb} GB usados &nbsp;·&nbsp; {p.free_gb} GB livres &nbsp;·&nbsp; {p.total_gb} GB total
              </div>
              <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${p.percent}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
              </div>
            </div>
          )
        })}
      </div>
    </MetricCard>
  )
}
