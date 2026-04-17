import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts'

const ChartTooltip = ({ active, payload, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(8,11,20,0.95)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '4px 10px',
      fontSize: 12,
      color: 'var(--text)',
    }}>
      {payload[0].value.toFixed(1)}{unit}
    </div>
  )
}

export function SparklineChart({ data, color = '#3b82f6', domain = [0, 100], unit = '%' }) {
  const points = data.map((v, i) => ({ i, v }))
  const gradId = `grad${color.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <ResponsiveContainer width="100%" height={56}>
      <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={domain} hide />
        <Tooltip content={<ChartTooltip unit={unit} />} />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
