import type { TaskSnapshot } from '../../domain/agent-contract'
import type { AgentTask } from '../../hooks/useAgentSimulation'
import { getTaskStatePresentation } from '../../domain/task-view-model'
import { useLocaleText } from '../../ui/locale'

const stages = [
  { id: 'calibrating', label: 'timeline.parse', detail: 'timeline.parseDetail' },
  { id: 'routing', label: 'timeline.route', detail: 'timeline.routeDetail' },
  { id: 'executing', label: 'timeline.execute', detail: 'timeline.executeDetail' },
  { id: 'synthesizing', label: 'timeline.synthesis', detail: 'timeline.synthesisDetail' },
  { id: 'complete', label: 'timeline.complete', detail: 'timeline.completeDetail' },
] as const

const stageIndex: Record<AgentTask['phase'], number> = { idle: -1, calibrating: 0, routing: 1, executing: 2, synthesizing: 3, complete: 4, paused: 2, failed: -1, cancelled: -1 }
const eventState = (status: string) => status === 'completed' ? 'is-complete' : status === 'running' ? 'is-active' : status === 'waiting' ? 'is-held' : status === 'failed' || status === 'cancelled' ? 'is-failed' : 'is-pending'
type TimelineStatus = 'ok' | 'live' | 'hold' | 'ready' | 'fail' | 'stop' | 'pending'
const eventStatus = (status: string): TimelineStatus => status === 'completed' ? 'ok' : status === 'running' ? 'live' : status === 'waiting' ? 'hold' : status === 'failed' ? 'fail' : status === 'cancelled' ? 'stop' : 'pending'
const timelineStatusKey = { ok: 'timeline.statusOk', live: 'timeline.statusLive', hold: 'timeline.statusHold', ready: 'timeline.statusReady', fail: 'timeline.statusFail', stop: 'timeline.statusStop', pending: 'timeline.statusPending' } as const

interface MissionTimelineProps { task: AgentTask; snapshot: TaskSnapshot | null; hidden?: boolean; onClose: () => void }

export function MissionTimeline({ task, snapshot, hidden = false, onClose }: MissionTimelineProps) {
  const { t } = useLocaleText()
  const timelinePhase = task.phase === 'paused' ? task.checkpointPhase ?? 'executing' : task.phase
  const currentStage = stageIndex[timelinePhase]
  const isCancelled = task.phase === 'cancelled'
  const isFailed = task.phase === 'failed'
  const dynamicAgents = snapshot?.agents ?? []
  const presentation = getTaskStatePresentation(snapshot)

  return <aside className={`mission-timeline ${task.phase === 'idle' ? 'is-idle' : ''} ${hidden ? 'is-suppressed' : ''}`} aria-label={t('timeline.title')} aria-hidden={hidden}>
    <div className="timeline-heading"><span>{t('timeline.title')}</span><span className="timeline-heading-actions"><span className={`timeline-phase phase-${presentation.state}`}>{presentation.traceLabel}</span><button type="button" onClick={onClose}>{t('timeline.close')}</button></span></div>
    {task.phase === 'idle' ? <p className="timeline-idle-copy">{t('timeline.idle')}</p> : isCancelled ? <p className="timeline-idle-copy is-cancelled">{t('timeline.cancelled')}</p> : isFailed && dynamicAgents.length === 0 ? <p className="timeline-idle-copy is-failed">{t('timeline.failed')}</p> : dynamicAgents.length > 0 ? <ol className="timeline-stages">{dynamicAgents.map((agent) => { const status = eventStatus(agent.status); return <li className={`timeline-stage ${eventState(agent.status)}`} key={agent.id}><span className="timeline-marker" aria-hidden="true" /><span className="timeline-copy"><strong>{agent.label}</strong><small>{agent.summary ?? agent.role.replace(/[_-]/g, ' ')}</small></span><span className={`timeline-state status-${status}`}>{t(timelineStatusKey[status])}</span></li> })}</ol> : <ol className="timeline-stages">{stages.map((stage, index) => {
      const state = task.phase === 'complete' ? 'is-complete' : index < currentStage ? 'is-complete' : index === currentStage ? 'is-active' : 'is-pending'
      const currentComplete = task.phase === 'complete' && stage.id === 'complete'
      const currentPaused = task.phase === 'paused' && index === currentStage
      const status: TimelineStatus = currentComplete ? 'ready' : currentPaused ? 'hold' : index < currentStage ? 'ok' : index === currentStage ? 'live' : 'pending'
      return <li className={`timeline-stage ${state}`} key={stage.id}><span className="timeline-marker" aria-hidden="true" /><span className="timeline-copy"><strong>{t(stage.label)}</strong><small>{currentPaused ? t('timeline.checkpoint') : index === currentStage ? t(stage.detail) : index < currentStage ? t('timeline.verified') : t('timeline.queued')}</small></span><span className={`timeline-state status-${status}`}>{t(timelineStatusKey[status])}</span></li>
    })}</ol>}
  </aside>
}
