import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import type { ConnectionState } from '../../hooks/use-agent-task-runtime'
import { useLocaleText } from '../../ui/locale'
import { getRuntimeErrorPresentation } from '../../ui/runtime-error-presentation'

interface RuntimeStatusBannerProps {
  state: ConnectionState
  error: Error | null
  onRetry: () => void
  onDismiss: () => void
}

export function RuntimeStatusBanner({ state, error, onRetry, onDismiss }: RuntimeStatusBannerProps) {
  const { t } = useLocaleText()
  if (state !== 'recovering' && state !== 'offline' && !error) return null
  const recovering = state === 'recovering'
  const offline = state === 'offline'
  const presentation = getRuntimeErrorPresentation(error)

  return <section className={`runtime-status-banner ${recovering ? 'is-recovering' : 'is-error'}`} role={recovering ? 'status' : 'alert'} aria-live="polite">
    {recovering ? <RefreshCw className="runtime-status-icon is-spinning" size={14} /> : <AlertTriangle className="runtime-status-icon" size={14} />}
    <span><strong>{recovering ? t('runtime.restoring') : offline ? t('runtime.offline') : t(presentation.title)}</strong><small>{recovering ? t('runtime.refreshing') : offline ? t('runtime.offlineDetail') : t(presentation.detail)}</small></span>
    {!recovering && <button type="button" onClick={onRetry} disabled={offline}><RefreshCw size={12} /> {offline ? t('runtime.waiting') : t('runtime.retry')}</button>}
    {!recovering && <button className="runtime-status-dismiss" type="button" onClick={onDismiss} aria-label={t('runtime.dismiss')}><X size={13} /></button>}
  </section>
}
