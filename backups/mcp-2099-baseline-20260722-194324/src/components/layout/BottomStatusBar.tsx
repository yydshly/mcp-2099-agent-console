import { useEffect, useState } from 'react'

export function BottomStatusBar() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const startedAt = performance.now()
    const interval = window.setInterval(() => setElapsed(Math.floor((performance.now() - startedAt) / 1000)), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')
  return (
    <footer className="bottom-status-bar" data-reveal="status-bar">
      <span className="live-status"><i /> LIVE SIMULATION</span>
      <span className="simulation-time">UPTIME / 00:{minutes}:{seconds}</span>
      <span className="status-detail">THOUGHT TREE / STABLE</span>
      <span className="status-detail mobile-hidden">MEMORY PARTITIONS / 42</span>
    </footer>
  )
}
