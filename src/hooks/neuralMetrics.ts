import { useEffect, useState } from 'react'

export type MetricUnit = 'percentage' | 'frequency' | 'millions'

export interface NeuralMetric {
  label: string
  value: number
  unit: MetricUnit
}

const metricBlueprints: ReadonlyArray<Omit<NeuralMetric, 'value'> & { base: number; variance: number }> = [
  { label: 'PROCESSING LOAD', unit: 'percentage', base: 94.2, variance: 1.1 },
  { label: 'SYNAPTIC FIRING RATE', unit: 'frequency', base: 402, variance: 7 },
  { label: 'ACTIVE THOUGHTS', unit: 'millions', base: 8.2, variance: 0.18 },
]

export function formatMetricValue(value: number, unit: MetricUnit): string {
  if (unit === 'percentage') return `${value.toFixed(1)}%`
  if (unit === 'frequency') return `${Math.round(value)} THz`
  return `${value.toFixed(1)}M`
}

function createMetricSnapshot(phase: number): NeuralMetric[] {
  return metricBlueprints.map((metric, index) => ({
    label: metric.label,
    unit: metric.unit,
    value: metric.base + Math.sin(phase + index * 1.71) * metric.variance,
  }))
}

export function useNeuralMetrics(): NeuralMetric[] {
  const [metrics, setMetrics] = useState<NeuralMetric[]>(() => createMetricSnapshot(0))

  useEffect(() => {
    let phase = 0
    const interval = window.setInterval(() => {
      phase += 0.28
      setMetrics(createMetricSnapshot(phase))
    }, 1800)

    return () => window.clearInterval(interval)
  }, [])

  return metrics
}
