import { CheckCircle2, X } from 'lucide-react'
import { useLocaleText } from '../../ui/locale'

interface OperationNoticeProps {
  title: string
  detail: string
  onDismiss: () => void
}

export function OperationNotice({ title, detail, onDismiss }: OperationNoticeProps) {
  const { t } = useLocaleText()
  return <section className="operation-notice" role="status" aria-live="polite">
    <CheckCircle2 size={15} aria-hidden="true" />
    <span><strong>{title}</strong><small>{detail}</small></span>
    <button type="button" onClick={onDismiss} aria-label={t('notice.dismiss')}><X size={13} /></button>
  </section>
}
