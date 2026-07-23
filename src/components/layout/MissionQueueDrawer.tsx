import { ChevronDown, ChevronUp, ListOrdered, Pause, Play, Trash2, X } from 'lucide-react'
import type { TaskSnapshot } from '../../domain/agent-contract'
import { useLocaleText } from '../../ui/locale'

interface MissionQueueDrawerProps {
  open: boolean
  queue: TaskSnapshot[]
  paused: boolean
  onRemove: (taskId: string) => void
  onMove: (taskId: string, queuePosition: number) => void
  onTogglePaused: () => void
  onClose: () => void
}

export function MissionQueueDrawer({ open, queue, paused, onRemove, onMove, onTogglePaused, onClose }: MissionQueueDrawerProps) {
  const { t } = useLocaleText()
  const priorityLabel = (priority: TaskSnapshot['options']['priority']) => priority === 'urgent' ? t('dispatch.critical') : priority === 'high' ? t('dispatch.priorityOption') : t('dispatch.standard')
  return (
    <aside className={`mission-queue ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="queue-heading"><span><ListOrdered size={15} /> {t('queue.title')}</span><button className="queue-close" type="button" onClick={onClose}><X size={14} /> {t('queue.close')}</button></div>
      <p className="queue-subtitle">{t('queue.subtitle')}</p>
      <button className={`queue-hold ${paused ? 'is-paused' : ''}`} type="button" onClick={onTogglePaused}>{paused ? <Play size={13} /> : <Pause size={13} />}{paused ? t('queue.resume') : t('queue.hold')}</button>
      <div className="queue-list">
        {queue.length === 0 ? <div className="queue-empty"><strong className="empty-state-kicker">{t('queue.emptyKicker')}</strong>{t('queue.empty')}<br />{t('queue.emptyDetail')}</div> : queue.map((task, index) => (
          <article className="queue-record" key={task.id}>
            <span className="queue-position">{(index + 1).toString().padStart(2, '0')}</span>
            <div><strong>{task.profileId.replace(/-/g, ' ').toUpperCase()}</strong><p>{typeof task.input.objective === 'string' ? task.input.objective : t('history.fallbackObjective')}</p><small>{priorityLabel(task.options.priority)} {t('dispatch.priority')}</small></div>
            <div className="queue-controls"><button className="instant-tooltip" type="button" onClick={() => onMove(task.id, index - 1)} disabled={index === 0} aria-label={t('queue.moveUp')} data-tooltip={t('queue.moveUp')}><ChevronUp size={13} /></button><button className="instant-tooltip" type="button" onClick={() => onMove(task.id, index + 1)} disabled={index === queue.length - 1} aria-label={t('queue.moveDown')} data-tooltip={t('queue.moveDown')}><ChevronDown size={13} /></button><button className="queue-remove instant-tooltip" type="button" onClick={() => onRemove(task.id)} aria-label={t('queue.remove')} data-tooltip={t('queue.remove')}><Trash2 size={13} /></button></div>
          </article>
        ))}
      </div>
    </aside>
  )
}
