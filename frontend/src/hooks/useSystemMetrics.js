import { useState, useEffect, useRef, useCallback } from 'react'

const MAX_HISTORY = 60

export function useSystemMetrics(url = 'ws://localhost:8000/ws/metrics') {
  const [metrics, setMetrics] = useState(null)
  const [history, setHistory] = useState({ cpu: [], ram: [], net_sent: [], net_recv: [] })
  const [status, setStatus] = useState('connecting')
  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setStatus('connected')

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setMetrics(data)
      setHistory(prev => ({
        cpu: [...prev.cpu.slice(-MAX_HISTORY + 1), data.cpu.percent],
        ram: [...prev.ram.slice(-MAX_HISTORY + 1), data.ram.percent],
        net_sent: [...prev.net_sent.slice(-MAX_HISTORY + 1), data.network.sent_mb_s],
        net_recv: [...prev.net_recv.slice(-MAX_HISTORY + 1), data.network.recv_mb_s],
      }))
    }

    ws.onerror = () => setStatus('error')

    ws.onclose = () => {
      setStatus('reconnecting')
      reconnectTimer.current = setTimeout(connect, 3000)
    }
  }, [url])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { metrics, history, status }
}
