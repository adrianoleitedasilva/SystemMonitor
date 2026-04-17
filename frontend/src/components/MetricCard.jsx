import styles from './MetricCard.module.css'

export function MetricCard({ title, children, accent = 'blue' }) {
  return (
    <div className={styles.card} data-accent={accent}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.body}>{children}</div>
    </div>
  )
}
