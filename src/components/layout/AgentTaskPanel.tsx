import { profileLabels, type AgentTask } from '../../hooks/useAgentSimulation'
import type { TaskSnapshot } from '../../domain/agent-contract'
import { getTaskStatePresentation } from '../../domain/task-view-model'
import { useLocaleText } from '../../ui/locale'
import { getTaskStateLabelKey } from '../../ui/runtime-state-presentation'

interface AgentTaskPanelProps {
  open: boolean
  task: AgentTask
  snapshot: TaskSnapshot | null
  onRetryTask: () => void
  onPauseTask: () => void
  onResumeTask: () => void
  onCancelTask: () => void
  onClose: () => void
  isActive: boolean
}

export function AgentTaskPanel({ open, task, snapshot, onRetryTask, onPauseTask, onResumeTask, onCancelTask, onClose, isActive: _isActive }: AgentTaskPanelProps) {
  const { t } = useLocaleText()
  const phaseLabels = {
    idle: t('task.idle'), calibrating: t('task.calibrating'), routing: t('task.routing'), executing: t('task.executing'), synthesizing: t('task.synthesizing'), complete: t('task.complete'), paused: t('task.paused'), failed: t('task.failed'), cancelled: t('task.cancelled'),
  } as const
  if (!open) return null
  const presentation = getTaskStatePresentation(snapshot)

  return (
    <aside className="agent-task-panel open">
      <div className="task-panel-heading"><span>AGENT TASK STREAM</span><span className="task-heading-actions"><b>{task.progress.toString().padStart(3, '0')}%</b><button className="task-panel-close" type="button" onClick={onClose}>{t('task.close')}</button></span></div>
      <div className="task-phase"><i className={presentation.state === 'complete' ? 'complete' : undefined} /> {snapshot ? t(getTaskStateLabelKey(presentation.state)) : phaseLabels[task.phase]}</div>
      {task.request && <p className="task-request"><strong>{profileLabels[task.request.profile] ?? task.request.profile.replace(/[_-]/g, ' ').toUpperCase()}</strong><span>{task.request.objective}</span></p>}
      {task.request && Object.values(task.request.context).filter(Boolean).length > 0 && <p className="task-context">{Object.values(task.request.context).filter(Boolean).join(' / ')}</p>}
      <div className="task-progress"><span style={{ width: `${task.progress}%` }} /></div>
      <div className="task-activity-list">
        {task.activities.length === 0 ? <p className="empty-activity">No active agent task. Initialize a bounded run to inspect telemetry.</p> : task.activities.map((activity) => (
          <div className={`task-activity ${activity.tone}`} key={activity.id}>
            <time>{activity.time}</time>
            <strong>{activity.label}</strong>
            <span>{activity.detail}</span>
          </div>
        ))}
      </div>
      <div className="task-controls">
        {presentation.canPause && <button type="button" onClick={onPauseTask}>{t('task.pause')}</button>}
        {presentation.canResume && <button type="button" onClick={onResumeTask}>{t('task.resume')}</button>}
        {presentation.canCancel && <button className="danger" type="button" onClick={onCancelTask}>{t('task.cancel')}</button>}
        {presentation.canRetry && task.request && <button className="spawn-task" type="button" onClick={onRetryTask}>{t('task.retry')}</button>}
      </div>
    </aside>
  )
}
