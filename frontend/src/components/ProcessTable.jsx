import { MetricCard } from './MetricCard'
import styles from './ProcessTable.module.css'

function cpuColor(pct) {
  if (pct >= 30) return 'var(--red)'
  if (pct >= 10) return 'var(--yellow)'
  return 'var(--blue)'
}

function statusDot(s) {
  if (s === 'running') return 'var(--green)'
  if (s === 'sleeping') return 'var(--text-muted)'
  return 'var(--yellow)'
}

export function ProcessTable({ processes }) {
  if (!processes) return null
  return (
    <MetricCard title="Top Processos — CPU" accent="red">
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>PID</th>
              <th>Processo</th>
              <th>CPU</th>
              <th style={{ minWidth: 120 }}></th>
              <th>RAM</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, idx) => {
              const color = cpuColor(p.cpu_percent)
              return (
                <tr key={p.pid} style={{ animationDelay: `${idx * 30}ms` }}>
                  <td className={styles.pid}>{p.pid}</td>
                  <td className={styles.name} title={p.name}>{p.name}</td>
                  <td className={styles.cpuVal} style={{ color }}>{p.cpu_percent.toFixed(1)}%</td>
                  <td className={styles.barCell}>
                    <div className={styles.miniTrack}>
                      <div
                        className={styles.miniFill}
                        style={{
                          width: `${Math.min(100, p.cpu_percent * 2)}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </td>
                  <td className={styles.ram}>{p.memory_mb.toFixed(0)} <span>MB</span></td>
                  <td>
                    <span className={styles.statusChip} style={{ '--dot': statusDot(p.status) }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </MetricCard>
  )
}
