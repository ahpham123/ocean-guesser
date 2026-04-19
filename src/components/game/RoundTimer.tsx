// src/components/game/RoundTimer.tsx
'use client'

import { useEffect, useState } from 'react'

type Props = {
  duration: number        // seconds
  onExpire: () => void
  paused?: boolean
}

export default function RoundTimer({ duration, onExpire, paused = false }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    if (paused) return

    if (timeLeft <= 0) {
      onExpire()
      return
    }

    const tick = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)

    return () => clearInterval(tick)
  }, [timeLeft, paused])

  const pct = (timeLeft / duration) * 100
  const color = pct > 50 ? '#14b8a6' : pct > 25 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-white font-mono text-sm w-8 text-right">{timeLeft}s</span>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}