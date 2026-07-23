import { useEffect, useState } from 'react'
import type { AgentTask } from '../../hooks/useAgentSimulation'
import type { TaskSnapshot } from '../../domain/agent-contract'
import { getTaskStatePresentation } from '../../domain/task-view-model'
import { useLocaleText } from '../../ui/locale'
import { getTransportLabelKey } from '../../ui/display-labels'

interface BottomStatusBarProps {
  task: AgentTask
  snapshot: TaskSnapshot | null
  queueCount: number
  queuePaused: boolean
  approvalPending: boolean
  transport: 'local-mock' | 'remote'
}

const activePhases = new Set<AgentTask['phase']>(['calibrating', 'routing', 'executing', 'synthesizing'])

export function BottomStatusBar({ task, snapshot, queueCount, queuePaused, approvalPending, transport }: BottomStatusBarProps) {
  const { t } = useLocaleText()
  const [sessionElapsed, setSessionElapsed] = useState(0)
  const [taskElapsed, setTaskElapsed] = useState(0)

  useEffect(() => {
    const startedAt = performance.now()
    const interval = window.setInterval(() => setSessionElapsed(Math.floor((performance.now() - startedAt) / 1000)), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (task.phase === 'calibrating') setTaskElapsed(0)
  }, [task.phase])

  useEffect(() => {
    if (!activePhases.has(task.phase)) return
    const interval = window.setInterval(() => setTaskElapsed((elapsed) => elapsed + 1), 1000)
    return () => window.clearInterval(interval)
  }, [task.phase])

  const formatElapsed = (elapsed: number) => `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
  const presentation = getTaskStatePresentation(snapshot)
  const status = approvalPending ? t('status.approvalHold') : queuePaused && queueCount > 0 ? t('status.queueHold') : presentation.traceLabel
  const stateClass = approvalPending ? 'approval' : queuePaused && queueCount > 0 ? 'queue-hold' : presentation.state

  return (
    <footer className="bottom-status-bar" data-reveal="status-bar" data-state={stateClass}>
      <span className="live-status"><i className={stateClass} /> {status}</span>
      <span className="simulation-time">{t('status.session')} / {formatElapsed(sessionElapsed)}</span>
      <span className="status-detail">{t('status.taskTime')} / {task.request ? formatElapsed(taskElapsed) : '--:--'}</span>
      <span className="status-detail mobile-hidden">{t('status.queue')} / {queueCount.toString().padStart(2, '0')}{queuePaused ? ` ${t('status.hold')}` : ` ${t('status.ready')}`}</span>
      <span className="status-detail data-source mobile-hidden">{t('status.link')} / {t(getTransportLabelKey(transport))}</span>
    </footer>
  )
}
