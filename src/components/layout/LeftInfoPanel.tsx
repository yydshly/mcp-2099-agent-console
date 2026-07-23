import type { AgentTask } from '../../hooks/useAgentSimulation'
import type { TaskSnapshot } from '../../domain/agent-contract'
import { getTaskStatePresentation } from '../../domain/task-view-model'
import { useLocaleText } from '../../ui/locale'
import { getTaskStateLabelKey } from '../../ui/runtime-state-presentation'

interface LeftInfoPanelProps {
  task: AgentTask
  snapshot: TaskSnapshot | null
  queueCount: number
  approvalPending: boolean
}

export function LeftInfoPanel({ task: _task, snapshot, queueCount, approvalPending }: LeftInfoPanelProps) {
  const { t } = useLocaleText()
  const presentation = getTaskStatePresentation(snapshot)
  const status = approvalPending ? { label: t('left.approval'), tone: 'approval' } : { ...presentation, label: t(getTaskStateLabelKey(presentation.state)) }

  return (
    <aside className="left-info-panel" data-reveal="left-panel">
      <p className="panel-kicker">{t('left.kicker')}</p>
      <h1>Sentient<br /><em>Core v9</em></h1>
      <p className="panel-description">{t('left.description')}</p>
      <div className="status-line">
        <span>{t('left.state')}</span>
        <strong className={`status-${status.tone}`}><i /> {status.label}</strong>
      </div>
      <div className="left-panel-footer">
        <span>NODE: SC-2099-NEU</span>
        <span>{t('left.queue')}: {queueCount.toString().padStart(2, '0')}</span>
      </div>
    </aside>
  )
}
