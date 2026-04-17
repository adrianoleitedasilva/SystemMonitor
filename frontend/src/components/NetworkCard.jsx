import { AreaChart, Area, LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts'
import { MetricCard } from './MetricCard'
import styles from './NetworkCard.module.css'

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(8,11,20,0.95)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', gap: 8 }}>
          <span>{p.name}</span>
          <strong>{p.value.toFixed(3)} MB/s</strong>
        </div>
      ))}
    </div>
  )
}

function StatBox({ label, value, unit, color, icon }) {
  return (
    <div className={styles.statBox}>
      <div className={styles.statIcon} style={{ color, background: `${color}18` }}>{icon}</div>
      <div>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statVal} style={{ color }}>
          {value} <small>{unit}</small>
        </div>
      </div>
    </div>
  )
}

export function NetworkCard({ network, sentHistory, recvHistory }) {
  if (!network) return null

  const data = sentHistory.map((v, i) => ({ i, sent: v, recv: recvHistory[i] ?? 0 }))

  return (
    <MetricCard title="Rede" accent="cyan">
      <div className={styles.layout}>
        <div className={styles.stats}>
          <StatBox label="Download" value={network.recv_mb_s.toFixed(3)} unit="MB/s" color="var(--cyan)" icon="↓" />
          <StatBox label="Upload"   value={network.sent_mb_s.toFixed(3)} unit="MB/s" color="var(--purple)" icon="↑" />
          <StatBox label="Total Recv" value={network.total_recv_gb.toFixed(2)} unit="GB" color="var(--text-dim)" icon="⇣" />
          <StatBox label="Total Sent" value={network.total_sent_gb.toFixed(2)} unit="GB" color="var(--text-dim)" icon="⇡" />
        </div>
        <div className={styles.chart}>
          <div className={styles.chartLegend}>
            <span style={{ color: 'var(--cyan)' }}>↓ Down</span>
            <span style={{ color: 'var(--purple)' }}>↑ Up</span>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="netRecv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--cyan)"   stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--cyan)"   stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="netSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--purple)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--purple)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={[0, 'auto']} hide />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="recv" stroke="var(--cyan)"   strokeWidth={2} fill="url(#netRecv)" dot={false} name="Down" isAnimationActive={false} />
              <Area type="monotone" dataKey="sent" stroke="var(--purple)" strokeWidth={2} fill="url(#netSent)" dot={false} name="Up"   isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MetricCard>
  )
}
