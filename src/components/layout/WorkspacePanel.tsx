import { Activity, Cable, ClipboardList, Database, FileClock, FlaskConical, Play, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import type { AgentTask } from '../../hooks/useAgentSimulation'
import type { AgentEvent, AuditRecord } from '../../domain/agent-contract'
import { localMockAgentAdapter } from '../../services/agentAdapter'
import { localMockScenarioOptions, type LocalMockScenario } from '../../services/local-mock-scenarios'
import { useLocaleText } from '../../ui/locale'
import { getAgentPhaseLabelKey, getLocalScenarioCopyKeys } from '../../ui/runtime-state-presentation'
import { getTransportLabelKey } from '../../ui/display-labels'

export type WorkspaceView = 'interface' | 'neural-net' | 'protocol' | 'logs'

interface WorkspacePanelProps {
  view: WorkspaceView
  task: AgentTask
  queueCount: number
  queuePaused: boolean
  auditEvents: AuditRecord[]
  taskEvents: AgentEvent[]
  transport: 'local-mock' | 'remote'
  onClose: () => void
  onCreateTask: () => void
  onOpenTaskLog: () => void
  onOpenQueue: () => void
  onOpenHistory: () => void
  onLoadScenario: ((scenario: LocalMockScenario) => Promise<void>) | null
}

export function WorkspacePanel({ view, task, queueCount, queuePaused, auditEvents, taskEvents, transport, onClose, onCreateTask, onOpenTaskLog, onOpenQueue, onOpenHistory, onLoadScenario }: WorkspacePanelProps) {
  const { t } = useLocaleText()
  const [loadingScenario, setLoadingScenario] = useState<LocalMockScenario | null>(null)
  const [loadedScenario, setLoadedScenario] = useState<LocalMockScenario | null>(null)
  if (view === 'neural-net') return null
  const executionMultiplier = task.request?.priority === 'critical' ? '1.39x' : task.request?.priority === 'priority' ? '1.16x' : '1.00x'
  const loadScenario = async (scenario: LocalMockScenario) => {
    if (!onLoadScenario) return
    setLoadingScenario(scenario)
    try {
      await onLoadScenario(scenario)
      setLoadedScenario(scenario)
    } finally {
      setLoadingScenario(null)
    }
  }

  return (
    <section className={`workspace-panel workspace-${view}`} aria-label={`${view} workspace`}>
      <header className="workspace-heading">
        <div><span>{view.toUpperCase()} {t('workspace.title')}</span><small>{transport === 'remote' ? t('workspace.remote') : t('workspace.local')}</small></div>
        <button className="workspace-close" type="button" onClick={onClose} aria-label={t('workspace.close')}><X size={14} /> {t('workspace.close')}</button>
      </header>

      {view === 'interface' && <div className="workspace-interface">
        <div className="workspace-hero"><p>{t('workspace.overview')}</p><h2>{task.request ? t(getAgentPhaseLabelKey(task.phase)) : t('workspace.intake')}</h2><span>{task.request?.objective || t('workspace.create')}</span></div>
        <div className="interface-cards">
          <article><Activity size={16} /><span>{t('workspace.active')}</span><strong>{task.request ? t(getAgentPhaseLabelKey(task.phase)) : t('workspace.none')}</strong><small>{task.request?.profile.replace(/-/g, ' ').toUpperCase() || t('workspace.noProfile')}</small><button type="button" onClick={onOpenTaskLog}>{t('workspace.openLog')}</button></article>
          <article><ClipboardList size={16} /><span>{t('workspace.waiting')}</span><strong>{queueCount.toString().padStart(2, '0')}</strong><small>{queuePaused ? t('workspace.held') : t('workspace.autoReady')}</small><button type="button" onClick={onOpenQueue}>{t('workspace.manageQueue')}</button></article>
          <article><FileClock size={16} /><span>{t('workspace.ledger')}</span><strong>LOCAL</strong><small>{t('workspace.sessionHistory')}</small><button type="button" onClick={onOpenHistory}>{t('workspace.openHistory')}</button></article>
        </div>
        <button className="workspace-primary-action" type="button" onClick={onCreateTask}><Play size={14} /> {t('workspace.create')}</button>
      </div>}

      {view === 'protocol' && <div className="workspace-protocol">
        <div className="protocol-intro"><Cable size={18} /><div><p>{t('workspace.protocol')}</p><h2>{t('workspace.protocolTitle')}</h2><span>{t('workspace.protocolCopy')}</span></div></div>
        <div className="protocol-runtime"><div><span>{t('workspace.adapter')}</span><strong>{transport === 'remote' ? 'AGENT-HTTP-V1' : localMockAgentAdapter.id.toUpperCase()}</strong></div><div><span>{t('workspace.transport')}</span><strong>{transport === 'remote' ? 'HTTP + SSE' : localMockAgentAdapter.transport.toUpperCase()}</strong></div><div><span>{t('workspace.speed')}</span><strong>{executionMultiplier}</strong></div><div><span>{t('workspace.externalData')}</span><strong>{transport === 'remote' ? t('display.backendManaged') : t('display.notUsed')}</strong></div></div>
        <div className="protocol-list">
          <article><Database size={16} /><div><strong>{transport === 'remote' ? t('display.agentPlatformApi') : t('display.localAdapter')}</strong><span>{t('workspace.gatewayCopy')}</span></div><em>{t(getTransportLabelKey(transport))}</em></article>
          <article><ShieldCheck size={16} /><div><strong>{t('workspace.approvalGate')}</strong><span>{t('workspace.approvalCopy')}</span></div><em>{t(getTransportLabelKey(transport))}</em></article>
          <article><Cable size={16} /><div><strong>{t('workspace.connectors')}</strong><span>{t('workspace.connectorCopy')}</span></div><em className="not-connected">{t('workspace.notConnected')}</em></article>
        </div>
        <p className="protocol-note">{transport === 'remote' ? t('workspace.remoteNote') : t('workspace.localNote')}</p>
        {transport === 'local-mock' && onLoadScenario && <section className="scenario-lab" aria-labelledby="scenario-lab-title">
          <header><span><FlaskConical size={15} /> <strong id="scenario-lab-title">{t('workspace.scenario')}</strong></span><small>{t('workspace.acceptance')}</small></header>
          <p>{t('workspace.loadScenario')}</p>
          <div className="scenario-lab-actions">{localMockScenarioOptions.map((scenario) => { const copy = getLocalScenarioCopyKeys(scenario.id); return <button className={`instant-tooltip ${loadedScenario === scenario.id ? 'is-active' : ''}`} disabled={loadingScenario !== null} type="button" key={scenario.id} onClick={() => { void loadScenario(scenario.id) }} data-tooltip={t(copy.detail)}>{loadingScenario === scenario.id ? t('scenario.loading') : t(copy.label)}</button> })}</div>
          <span className="scenario-lab-status" aria-live="polite">{loadingScenario ? `${t('scenario.loading')} ${t(getLocalScenarioCopyKeys(loadingScenario).label)}` : loadedScenario ? `${t(getLocalScenarioCopyKeys(loadedScenario).label)} ${t('scenario.active')} / ${t(getLocalScenarioCopyKeys(loadedScenario).detail)}` : t('scenario.select')}</span>
        </section>}
      </div>}

      {view === 'logs' && <div className="workspace-logs">
        <div className="logs-summary"><div><span>{t('workspace.currentState')}</span><strong>{t(getAgentPhaseLabelKey(task.phase))}</strong></div><div><span>{t('workspace.source')}</span><strong>AGENT GATEWAY</strong></div></div>
        <p className="logs-section-label">{t('workspace.audit')}</p>
        <div className="logs-list">
          {auditEvents.length === 0 ? <div className="logs-empty">{t('workspace.noAudit')}</div> : auditEvents.map((event) => <article key={event.id} className={event.tone}><time>{new Date(event.occurredAt).toLocaleTimeString()}</time><strong>{event.type}</strong><p>{event.message}</p></article>)}
        </div>
        <p className="logs-section-label">{t('workspace.telemetry')}</p>
        <div className="logs-list">{taskEvents.length === 0 ? <div className="logs-empty">{t('workspace.noEvents')}<br />{t('workspace.noEventsDetail')}</div> : [...taskEvents].reverse().map((event) => <article key={event.id} className={event.type.includes('failed') ? 'danger' : event.type.includes('completed') || event.type === 'result.ready' ? 'success' : 'info'}><time>{new Date(event.occurredAt).toLocaleTimeString()}</time><strong>{event.type.toUpperCase()}</strong><p>Sequence {event.sequence.toString().padStart(3, '0')} / {event.taskId}</p></article>)}</div>
        <p className="logs-note">{t('workspace.logsNote')}</p>
      </div>}
    </section>
  )
}
