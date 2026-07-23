import { History, Layers3, PanelBottomClose } from 'lucide-react'
import { useLocaleText } from '../../ui/locale'

interface PanelIndexProps {
  open: boolean
  timelineVisible: boolean
  resultAvailable: boolean
  resultVisible: boolean
  historyCount: number
  queueCount: number
  queuePaused: boolean
  queueOpen: boolean
  onToggle: () => void
  onShowTimeline: () => void
  onShowResult: () => void
  onOpenHistory: () => void
  onOpenQueue: () => void
}

export function PanelIndex({ open, timelineVisible, resultAvailable, resultVisible, historyCount, queueCount, queuePaused, queueOpen, onToggle, onShowTimeline, onShowResult, onOpenHistory, onOpenQueue }: PanelIndexProps) {
  const { t } = useLocaleText()
  return (
    <div className={`panel-index ${open ? 'is-open' : ''}`}>
      <button className="panel-index-trigger" type="button" onClick={onToggle} aria-expanded={open}>
        <Layers3 size={13} /> {t('panels.trigger')}
      </button>
      {open && <section className="panel-index-menu" aria-label={t('panels.title')}>
        <div className="panel-index-heading"><span>{t('panels.title')}</span><button type="button" onClick={onToggle}>{t('panels.close')}</button></div>
        <button type="button" className={timelineVisible ? 'is-current' : ''} onClick={onShowTimeline}><PanelBottomClose size={13} /><span>{t('panels.trace')}</span><small>{timelineVisible ? t('panels.open') : t('panels.restore')}</small></button>
        <button type="button" className={`instant-tooltip ${!resultAvailable ? 'is-disabled' : resultVisible ? 'is-current' : ''}`} onClick={onShowResult} disabled={!resultAvailable} data-tooltip={!resultAvailable ? t('panels.resultUnavailable') : resultVisible ? t('panels.hideResult') : t('panels.openResult')}><PanelBottomClose size={13} /><span>{t('panels.result')}</span><small>{!resultAvailable ? t('panels.wait') : resultVisible ? t('panels.open') : t('panels.restore')}</small></button>
        <button type="button" onClick={onOpenHistory}><History size={13} /><span>{t('panels.history')}</span><small>{historyCount.toString().padStart(2, '0')}</small></button>
        <button className={`panel-index-queue ${queueOpen ? 'is-current' : ''}`} type="button" onClick={onOpenQueue}><span>{t('panels.queue')}</span><strong>{queueOpen ? t('panels.open') : queuePaused ? t('status.hold') : `${queueCount.toString().padStart(2, '0')} ${t('panels.waiting')}`}</strong></button>
      </section>}
    </div>
  )
}
