import { useNeuralMetrics } from '../../hooks/neuralMetrics'
import { AnimatedMetric } from '../../ui/AnimatedMetric'
import type { CSSProperties } from 'react'

export function RightMetricsPanel() {
  const metrics = useNeuralMetrics()
  return (
    <aside className="right-metrics-panel" data-reveal="metrics">
      <div className="metrics-heading"><span>NEURAL TELEMETRY</span><i /></div>
      {metrics.map((metric, index) => (
        <section className="metric-block" key={metric.label} style={{ '--metric-index': index } as CSSProperties}>
          <p>{metric.label}</p>
          <AnimatedMetric value={metric.value} unit={metric.unit} />
          <span className="metric-rule" />
        </section>
      ))}
    </aside>
  )
}
