import { Check, Download, FileCheck2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { AgentProfile, TaskSnapshot } from '../../domain/agent-contract'
import { profileExtensionRegistry, type ProfileExtensionRegistry } from '../../ui/profile-extension-registry'
import { getResultActionStatus, setResultActionStatus, type ResultActionStatus } from '../../ui/result-action-state'
import { useLocaleText } from '../../ui/locale'

interface MissionResultPanelProps { snapshot: TaskSnapshot | null; profiles?: AgentProfile[]; extensionRegistry?: ProfileExtensionRegistry; onAction?: (actionId: string, label: string) => Promise<void>; onClose: () => void; hidden?: boolean }

export function MissionResultPanel({ snapshot, profiles = [], extensionRegistry = profileExtensionRegistry, onAction, onClose, hidden = false }: MissionResultPanelProps) {
  const { t } = useLocaleText()
  const [actionStates, setActionStates] = useState<Map<string, ResultActionStatus>>(() => new Map())
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const result = snapshot?.result
  const details = useMemo(() => result ? [
    ...Object.entries(result.data).flatMap(([key, value]) => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? [`${key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toUpperCase()}: ${String(value)}`] : []),
    ...result.evidence.map((item) => item.label),
    ...result.artifacts.map((item) => item.name),
    ...snapshot.agents.filter((agent) => agent.status === 'completed').map((agent) => agent.summary ?? `${agent.label} completed`),
  ].slice(0, 4) : [], [result, snapshot])

  useEffect(() => {
    setActionStates(new Map())
    setActionFeedback(null)
  }, [snapshot?.id, result?.summary])
  if (hidden || !snapshot || snapshot.status !== 'completed' || !result) return null

  const extension = extensionRegistry.get(snapshot.profileId)
  const profile = profiles.find((candidate) => candidate.id === snapshot.profileId)
  const title = `${snapshot.profileId.replace(/[_-]/g, ' ').toUpperCase()} ${t('result.packet')}`
  const exportResult = () => {
    const file = [t('result.fileTitle'), `TASK: ${snapshot.id}`, t('result.fileStatus'), '', result.summary, ...details.map((detail) => `- ${detail}`)].join('\n')
    const url = URL.createObjectURL(new Blob([file], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url; link.download = 'mcp-2099-mission-result.txt'; link.click(); URL.revokeObjectURL(url)
  }
  const requestAction = async (actionId: string, label: string) => {
    setActionStates((current) => setResultActionStatus(current, actionId, 'requesting'))
    setActionFeedback(null)
    try {
      await onAction?.(actionId, label)
      setActionStates((current) => setResultActionStatus(current, actionId, 'requested'))
    } catch {
      setActionStates((current) => setResultActionStatus(current, actionId, 'failed'))
      setActionFeedback(`${label.toUpperCase()} / ${t('confirm.error')}`)
    }
  }

  return <aside className="mission-result" aria-label={t('result.ready')}><div className="result-heading"><span><FileCheck2 size={13} /> {t('result.ready')}</span><span className="result-heading-actions"><span className="result-stamp">{t('result.verified')}</span><button type="button" onClick={onClose}>{t('result.close')}</button></span></div><h2>{title}</h2><p>{result.summary}</p><ul>{details.map((detail) => <li key={detail}><Check size={11} />{detail}</li>)}</ul>{extension?.renderResult?.({ profile, snapshot })}<div className="result-actions"><div className="result-contract-actions">{result.actions.map((action) => { const status = getResultActionStatus(actionStates, action.id); const label = status === 'requesting' ? t('result.requesting') : status === 'requested' ? t('result.requested') : status === 'failed' ? t('result.retry') : action.label.toUpperCase(); return <button className={`${action.kind === 'primary' ? 'result-acknowledge' : 'result-contract-action'} action-${action.kind ?? 'secondary'} is-${status}`} type="button" key={action.id} disabled={status === 'requesting' || status === 'requested'} onClick={() => { void requestAction(action.id, action.label) }}><Check size={13} /> {label}</button> })}</div><button className="result-export" type="button" onClick={exportResult}><Download size={14} /> {t('result.export')}</button>{actionFeedback && <p className="result-action-feedback" role="status">{actionFeedback}</p>}</div></aside>
}
