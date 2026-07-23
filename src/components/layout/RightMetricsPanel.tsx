import { AnimatedMetric } from '../../ui/AnimatedMetric'
import type { CSSProperties } from 'react'
import type { AgentTask } from '../../hooks/useAgentSimulation'
import type { MetricUnit } from '../../hooks/neuralMetrics'
import { useLocaleText } from '../../ui/locale'
import { getAgentPhaseLabelKey } from '../../ui/runtime-state-presentation'

interface RightMetricsPanelProps {
  task: AgentTask
}

const phaseBaseLoad: Record<AgentTask['phase'], number> = {
  idle: 18.6,
  calibrating: 41.2,
  routing: 56.8,
  executing: 67.5,
  synthesizing: 52.4,
  complete: 22.8,
  paused: 29.4,
  failed: 12.8,
  cancelled: 9.6,
}

export function RightMetricsPanel({ task }: RightMetricsPanelProps) {
  const { t } = useLocaleText()
  const priorityBoost = task.request?.priority === 'critical' ? 10 : task.request?.priority === 'priority' ? 5 : 0
  const load = Math.min(99.8, phaseBaseLoad[task.phase] + priorityBoost + (task.phase === 'executing' ? task.progress * 0.18 : 0))
  const firingRate = Math.round(118 + load * 3.08 + (task.phase === 'executing' ? task.progress * 1.2 : 0))
  const activeThoughts = Number((1.2 + load / 15.4).toFixed(1))
  const metrics: ReadonlyArray<{ label: string; value: number; unit: MetricUnit }> = [
    { label: t('metrics.load'), value: load, unit: 'percentage' },
    { label: t('metrics.firing'), value: firingRate, unit: 'frequency' },
    { label: t('metrics.thoughts'), value: activeThoughts, unit: 'millions' },
  ]

  return (
    <aside className="right-metrics-panel" data-reveal="metrics" data-phase={task.phase}>
      <div className="metrics-heading"><span>{t('metrics.title')}</span><span className="metrics-live-state">{t(getAgentPhaseLabelKey(task.phase))}</span><i /></div>
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
