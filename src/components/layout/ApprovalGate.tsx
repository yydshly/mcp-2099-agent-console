import { ShieldCheck } from 'lucide-react'
import type { DispatchRequest } from '../../hooks/useAgentSimulation'
import { useLocaleText } from '../../ui/locale'

interface ApprovalGateProps {
  request: DispatchRequest | null
  onApprove: () => void
  onDecline: () => void
}

export function ApprovalGate({ request, onApprove, onDecline }: ApprovalGateProps) {
  const { t } = useLocaleText()
  if (!request) return null

  const context = Object.values(request.context).filter(Boolean)
  return (
    <div className="approval-gate-backdrop" role="presentation">
      <section className="approval-gate" role="dialog" aria-modal="true" aria-labelledby="approval-title">
        <div className="approval-heading"><span><ShieldCheck size={15} /> {t('approval.heading')}</span><span>{t('status.hold')}</span></div>
        <p className="approval-kicker">{t('approval.kicker')}</p>
        <h2 id="approval-title">{t('approval.title')}</h2>
        <dl>
          <div><dt>{t('approval.profile')}</dt><dd>{request.profile.replace(/-/g, ' ').toUpperCase()}</dd></div>
          <div><dt>{t('approval.priority')}</dt><dd>{request.priority.toUpperCase()}</dd></div>
          <div className="approval-objective"><dt>{t('approval.objective')}</dt><dd>{request.objective}</dd></div>
        </dl>
        {context.length > 0 && <div className="approval-context">{context.map((item) => <span key={item}>{item}</span>)}</div>}
        <div className="approval-actions"><button className="approval-decline" type="button" onClick={onDecline}>{t('approval.decline')}</button><button className="approval-approve" type="button" onClick={onApprove}><ShieldCheck size={14} /> {t('approval.approve')}</button></div>
      </section>
    </div>
  )
}
