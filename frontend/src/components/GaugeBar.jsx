import styles from './GaugeBar.module.css'

function colorForPercent(pct) {
  if (pct >= 90) return 'var(--red)'
  if (pct >= 70) return 'var(--yellow)'
  return 'var(--green)'
}

export function GaugeBar({ percent, label, sublabel }) {
  const color = colorForPercent(percent)
  return (
    <div className={styles.wrapper}>
      <div className={styles.labels}>
        <span>{label}</span>
        <span style={{ color }}>{percent.toFixed(1)}%</span>
      </div>
      {sublabel && <div className={styles.sublabel}>{sublabel}</div>}
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  )
}
