import { useEffect, useRef } from 'react'
import { formatMetricValue, type MetricUnit } from '../hooks/neuralMetrics'

interface AnimatedMetricProps {
  value: number
  unit: MetricUnit
}

export function AnimatedMetric({ value, unit }: AnimatedMetricProps) {
  const valueRef = useRef<HTMLSpanElement>(null)
  const previousValue = useRef(0)

  useEffect(() => {
    const node = valueRef.current
    if (!node) return

    const start = previousValue.current
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 850
    const startedAt = performance.now()
    let frame = 0

    const update = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min((now - startedAt) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      const current = start + (value - start) * eased
      node.textContent = formatMetricValue(current, unit)
      if (progress < 1) frame = requestAnimationFrame(update)
    }

    frame = requestAnimationFrame(update)
    previousValue.current = value
    return () => cancelAnimationFrame(frame)
  }, [unit, value])

  return <span ref={valueRef} className="metric-value" aria-live="polite" />
}
