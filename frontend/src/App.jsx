import { useState, useEffect } from 'react'
import { useSystemMetrics } from './hooks/useSystemMetrics'
import { CpuCard } from './components/CpuCard'
import { RamCard } from './components/RamCard'
import { DiskCard } from './components/DiskCard'
import { NetworkCard } from './components/NetworkCard'
import { ProcessTable } from './components/ProcessTable'
import { GpuCard } from './components/GpuCard'
import styles from './App.module.css'

const STATUS_COLOR = {
  connected: 'var(--green)',
  connecting: 'var(--yellow)',
  reconnecting: 'var(--yellow)',
  error: 'var(--red)',
}

const STATUS_LABEL = {
  connected: 'Ao vivo',
  connecting: 'Conectando...',
  reconnecting: 'Reconectando...',
  error: 'Erro de conexão',
}

function useUptime() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function useClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return time.toLocaleTimeString('pt-BR')
}

export default function App() {
  const { metrics, history, status } = useSystemMetrics()
  const uptime = useUptime()
  const clock = useClock()

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
              <path d="M7 8h2v4H7zM11 10h2v2h-2zM15 7h2v5h-2z"/>
            </svg>
            <span>SysMonitor</span>
          </div>
        </div>
        <div className={styles.headerCenter}>
          <div className={styles.clock}>{clock}</div>
          <div className={styles.uptimeLabel}>uptime <span>{uptime}</span></div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.statusBadge} data-status={status}>
            <span className={styles.dot} style={{ background: STATUS_COLOR[status] }} />
            <span>{STATUS_LABEL[status]}</span>
          </div>
        </div>
      </header>

      {!metrics ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Aguardando dados do backend...</span>
        </div>
      ) : (
        <main className={styles.grid}>
          <div className={styles.col}>
            <CpuCard cpu={metrics.cpu} history={history.cpu} />
          </div>
          <div className={styles.col}>
            <RamCard ram={metrics.ram} history={history.ram} />
          </div>
          {metrics.gpu?.length > 0 ? (
            <div className={styles.col}>
              <GpuCard gpus={metrics.gpu} />
            </div>
          ) : (
            <div className={styles.col}>
              <DiskCard disk={metrics.disk} compact />
            </div>
          )}
          <div className={styles.wide}>
            <NetworkCard
              network={metrics.network}
              sentHistory={history.net_sent}
              recvHistory={history.net_recv}
            />
          </div>
          {metrics.gpu?.length > 0 && (
            <div className={styles.wide}>
              <DiskCard disk={metrics.disk} />
            </div>
          )}
          <div className={styles.full}>
            <ProcessTable processes={metrics.processes} />
          </div>
        </main>
      )}
    </div>
  )
}
