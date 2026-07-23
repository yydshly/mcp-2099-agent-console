import { AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ConfirmOperation } from '../../ui/operation-confirmation'
import { useLocaleText } from '../../ui/locale'

interface OperationConfirmGateProps {
  operation: ConfirmOperation | null
  onDismiss: () => void
  onComplete: () => void
}

export function OperationConfirmGate({ operation, onDismiss, onComplete }: OperationConfirmGateProps) {
  const { t } = useLocaleText()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    setSubmitting(false)
    setError(null)
  }, [operation])
  if (!operation) return null

  const confirm = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await operation.execute()
      onComplete()
    } catch {
      setError(t('confirm.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="operation-confirm-backdrop" role="presentation"><section className="operation-confirm-gate" role="dialog" aria-modal="true" aria-labelledby="operation-confirm-title"><div className="operation-confirm-heading"><span><AlertTriangle size={14} /> {t('confirm.heading')}</span><span>{t('status.hold')}</span></div><p className="operation-confirm-kicker">{t('confirm.kicker')}</p><h2 id="operation-confirm-title">{operation.title}</h2><p>{operation.message}</p>{error && <p className="operation-confirm-error" role="status">{error}</p>}<div className="operation-confirm-actions"><button type="button" autoFocus disabled={submitting} onClick={onDismiss}>{t('confirm.keep')}</button><button className="operation-confirm-submit" type="button" disabled={submitting} onClick={() => { void confirm() }}><AlertTriangle size={13} /> {submitting ? t('confirm.requesting') : operation.confirmLabel}</button></div></section></div>
}
