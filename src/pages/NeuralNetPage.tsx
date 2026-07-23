import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AgentTaskPanel } from '../components/layout/AgentTaskPanel'
import { ApprovalGate } from '../components/layout/ApprovalGate'
import { BottomStatusBar } from '../components/layout/BottomStatusBar'
import { LeftInfoPanel } from '../components/layout/LeftInfoPanel'
import { MissionHistoryDrawer } from '../components/layout/MissionHistoryDrawer'
import { MissionQueueDrawer } from '../components/layout/MissionQueueDrawer'
import { MissionTimeline } from '../components/layout/MissionTimeline'
import { MissionResultPanel } from '../components/layout/MissionResultPanel'
import { OperationConfirmGate } from '../components/layout/OperationConfirmGate'
import { OperationNotice } from '../components/layout/OperationNotice'
import { PanelIndex } from '../components/layout/PanelIndex'
import { RightMetricsPanel } from '../components/layout/RightMetricsPanel'
import { RuntimeStatusBanner } from '../components/layout/RuntimeStatusBanner'
import { TaskDispatchDrawer } from '../components/layout/TaskDispatchDrawer'
import { TopNavigation } from '../components/layout/TopNavigation'
import { WorkspacePanel, type WorkspaceView } from '../components/layout/WorkspacePanel'
import { NeuralScene } from '../components/scene/NeuralScene'
import type { CreateTaskCommand } from '../domain/agent-contract'
import { cycleSceneQuality, isSceneQuality, resolveScenePerformanceProfile, type SceneQuality } from '../domain/scene-quality'
import { useAgentSimulation, type DispatchRequest } from '../hooks/useAgentSimulation'
import { useThemeMode } from '../hooks/useThemeMode'
import { createLegacyDispatchRequest } from '../services/legacy-dispatch-bridge'
import { CommandPalette, type CommandAction } from '../ui/CommandPalette'
import type { ConfirmOperation } from '../ui/operation-confirmation'
import { LocaleProvider, translate, useLocaleState } from '../ui/locale'
import { getSceneQualityLabelKey, getVisualModeLabelKey } from '../ui/display-labels'

interface PendingApproval { request: DispatchRequest; taskId: string }
type OperationNoticeKey = 'notice.dispatched' | 'notice.retry' | 'notice.paused' | 'notice.resumed' | 'notice.cancelled' | 'notice.queueUpdated' | 'notice.queuePaused' | 'notice.queueResumed' | 'notice.approved' | 'notice.declined' | 'notice.recovered'

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function NeuralNetPage() {
  const localeState = useLocaleState()
  const [webglAvailable] = useState(supportsWebGL)
  const [sceneQuality, setSceneQuality] = useState<SceneQuality>(() => {
    const stored = window.localStorage.getItem('mcp2099.scene-quality')
    return isSceneQuality(stored) ? stored : 'auto'
  })
  const [mode, setMode] = useState<'baseline' | 'enhanced' | 'feral'>('baseline')
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [dispatchOpen, setDispatchOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [themeTransition, setThemeTransition] = useState(false)
  const [themeDirection, setThemeDirection] = useState<'to-light' | 'to-dark' | null>(null)
  const [timelineDismissed, setTimelineDismissed] = useState(false)
  const [resultDismissed, setResultDismissed] = useState(false)
  const [panelIndexOpen, setPanelIndexOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [queueOpen, setQueueOpen] = useState(false)
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null)
  const [pendingOperation, setPendingOperation] = useState<ConfirmOperation | null>(null)
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceView>('neural-net')
  const [operationNotice, setOperationNotice] = useState<OperationNoticeKey | null>(null)
  const themeTimers = useRef<number[]>([])
  const operationNoticeTimer = useRef<number | null>(null)
  const foregroundTrigger = useRef<HTMLElement | null>(null)
  const { task, snapshot, tasks, taskEvents, auditRecords, profiles, profilesLoading, queue, transport, retryTask, pauseTask, resumeTask, cancelTask, approveTask, rejectTask, submitTask, actOnTask, actOnQueue, recordAudit, recordAuditAsync, recoverRuntime, clearRuntimeError, isActive, connectionState, lastError, loadScenario } = useAgentSimulation()
  const taskQueue = queue.tasks
  const queuePaused = queue.paused
  const missionHistory = useMemo(() => tasks.filter((entry) => entry.status === 'completed' || entry.status === 'cancelled' || entry.status === 'failed'), [tasks])
  const scenePerformance = useMemo(() => {
    const connection = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    return resolveScenePerformanceProfile(sceneQuality, { hardwareConcurrency: navigator.hardwareConcurrency, deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory, saveData: connection.connection?.saveData, effectiveType: connection.connection?.effectiveType })
  }, [sceneQuality])
  const { mode: themeMode, theme, cycleTheme } = useThemeMode()
  const initializing = task.phase === 'calibrating'
  const foregroundLayerOpen = commandOpen || dispatchOpen || consoleOpen || panelIndexOpen || historyOpen || queueOpen || activeWorkspace !== 'neural-net' || Boolean(pendingApproval) || Boolean(pendingOperation)
  const showPanelIndex = !commandOpen && !dispatchOpen && !consoleOpen && !historyOpen && !queueOpen && activeWorkspace === 'neural-net' && !pendingApproval
  useEffect(() => {
    document.documentElement.lang = localeState.locale
  }, [localeState.locale])
  useEffect(() => {
    const selector = pendingOperation ? '.operation-confirm-gate' : pendingApproval ? '.approval-gate' : commandOpen ? '.command-palette' : dispatchOpen ? '.task-dispatch-drawer.open' : historyOpen ? '.mission-history.is-open' : queueOpen ? '.mission-queue.is-open' : consoleOpen ? '.agent-task-panel.open' : null
    if (!selector) return
    const scope = document.querySelector<HTMLElement>(selector)
    const focusTarget = scope?.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
    if (!focusTarget) return
    const frame = window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }))
    return () => window.cancelAnimationFrame(frame)
  }, [commandOpen, consoleOpen, dispatchOpen, historyOpen, pendingApproval, pendingOperation, queueOpen])
  const closeForegroundLayers = () => {
    setCommandOpen(false)
    setDispatchOpen(false)
    setConsoleOpen(false)
    setPanelIndexOpen(false)
    setHistoryOpen(false)
    setQueueOpen(false)
    setActiveWorkspace('neural-net')
  }
  const rememberForegroundTrigger = () => {
    foregroundTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }
  const restoreForegroundTrigger = () => {
    window.setTimeout(() => foregroundTrigger.current?.focus(), 0)
  }
  const showOperationNotice = (key: OperationNoticeKey) => {
    if (operationNoticeTimer.current !== null) window.clearTimeout(operationNoticeTimer.current)
    setOperationNotice(key)
    operationNoticeTimer.current = window.setTimeout(() => { setOperationNotice(null); operationNoticeTimer.current = null }, 3400)
  }
  const openCommands = () => {
    rememberForegroundTrigger()
    closeForegroundLayers()
    setCommandOpen(true)
  }
  const openDispatch = () => {
    rememberForegroundTrigger()
    closeForegroundLayers()
    setDispatchOpen(true)
  }
  const openTaskLog = () => {
    rememberForegroundTrigger()
    closeForegroundLayers()
    setConsoleOpen(true)
  }
  const toggleTaskLog = () => {
    if (consoleOpen) { setConsoleOpen(false); restoreForegroundTrigger(); return }
    openTaskLog()
  }
  const togglePanelIndex = () => {
    if (panelIndexOpen) { setPanelIndexOpen(false); restoreForegroundTrigger(); return }
    rememberForegroundTrigger()
    closeForegroundLayers()
    setPanelIndexOpen(true)
  }
  const openHistory = () => {
    rememberForegroundTrigger()
    closeForegroundLayers()
    setHistoryOpen(true)
  }
  const openQueue = () => {
    rememberForegroundTrigger()
    closeForegroundLayers()
    setQueueOpen(true)
  }
  const toggleQueue = () => {
    if (queueOpen) { setQueueOpen(false); restoreForegroundTrigger(); return }
    openQueue()
  }
  const requestTaskCancellation = () => {
    rememberForegroundTrigger()
    setPendingOperation({
      title: translate(localeState.locale, 'confirm.cancelTitle'),
      message: translate(localeState.locale, 'confirm.cancelMessage'),
      confirmLabel: translate(localeState.locale, 'confirm.cancelAction'),
      execute: async () => {
        await cancelTask()
        recordAudit('TASK CANCELLED', 'Operator cancelled the active mission.', 'danger')
        showOperationNotice('notice.cancelled')
      },
    })
  }
  const requestQueueRemoval = (taskId: string) => {
    const queuedTask = taskQueue.find((candidate) => candidate.id === taskId)
    if (!queuedTask) return
    rememberForegroundTrigger()
    setPendingOperation({
      title: translate(localeState.locale, 'confirm.removeTitle'),
      message: `${queuedTask.profileId.replace(/-/g, ' ')} ${translate(localeState.locale, 'confirm.removeMessage')}`,
      confirmLabel: translate(localeState.locale, 'confirm.removeAction'),
      execute: async () => {
        await actOnTask(queuedTask.id, { requestId: crypto.randomUUID(), action: 'cancel' })
        recordAudit('QUEUED TASK REMOVED', `${queuedTask.profileId.replace(/-/g, ' ')} removed before launch.`, 'warning')
        showOperationNotice('notice.queueUpdated')
      },
    })
  }
  const selectWorkspace = (view: WorkspaceView) => {
    closeForegroundLayers()
    setActiveWorkspace(view)
  }
  const sceneMode = useMemo(() => {
    if (task.phase === 'executing') return task.request?.priority === 'critical' ? 'feral' : 'enhanced'
    if (task.phase === 'routing' || task.phase === 'synthesizing') return 'enhanced'
    if (task.phase === 'failed' || task.phase === 'cancelled') return 'feral'
    return mode
  }, [mode, task.phase, task.request?.priority])

  const cycleMode = () => setMode((current) => current === 'baseline' ? 'enhanced' : current === 'enhanced' ? 'feral' : 'baseline')
  const cycleQuality = () => setSceneQuality((current) => cycleSceneQuality(current))
  const dispatchTask = (command: CreateTaskCommand) => {
    const request = createLegacyDispatchRequest(command)
    setDispatchOpen(false)
    if (request.requiresApproval) {
      setConsoleOpen(false)
      recordAudit('APPROVAL REQUESTED', `${request.profile.replace(/-/g, ' ')} is awaiting operator approval.`, 'warning')
      void submitTask(command).then((snapshot) => setPendingApproval({ request, taskId: snapshot.id })).catch(() => recordAudit('TASK REJECTED', 'Local task runtime rejected the submitted command.', 'danger'))
      return
    }
    void submitTask(command).then((created) => {
      setConsoleOpen(created.status === 'running')
      setMode(request.priority === 'critical' ? 'feral' : 'enhanced')
      recordAudit(created.status === 'queued' ? 'TASK QUEUED' : 'TASK LAUNCHED', `${request.profile.replace(/-/g, ' ')} / ${request.priority} priority`, created.status === 'queued' ? 'info' : 'success')
      showOperationNotice('notice.dispatched')
    }).catch(() => recordAudit('TASK REJECTED', 'Agent runtime rejected the submitted command.', 'danger'))
  }

  const transitionTheme = () => {
    themeTimers.current.forEach((timer) => window.clearTimeout(timer))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setThemeTransition(false)
      setThemeDirection(null)
      cycleTheme()
      return
    }
    const nextDirection = theme === 'dark' ? 'to-light' : 'to-dark'
    setThemeTransition(true)
    setThemeDirection(nextDirection)
    themeTimers.current = [
      window.setTimeout(cycleTheme, 460),
      window.setTimeout(() => { setThemeTransition(false); setThemeDirection(null) }, 1450),
    ]
  }

  const commands: CommandAction[] = [
    { id: 'dispatch', label: translate(localeState.locale, 'command.create'), detail: translate(localeState.locale, 'command.createDetail'), shortcut: 'ENTER', run: openDispatch },
    { id: 'interface', label: translate(localeState.locale, 'command.interface'), detail: translate(localeState.locale, 'command.interfaceDetail'), run: () => selectWorkspace('interface') },
    { id: 'protocol', label: translate(localeState.locale, 'command.protocol'), detail: translate(localeState.locale, 'command.protocolDetail'), run: () => selectWorkspace('protocol') },
    { id: 'audit', label: translate(localeState.locale, 'command.audit'), detail: translate(localeState.locale, 'command.auditDetail'), run: () => selectWorkspace('logs') },
    { id: 'queue', label: translate(localeState.locale, 'command.queue'), detail: translate(localeState.locale, 'command.queueDetail'), run: openQueue },
    { id: 'history', label: translate(localeState.locale, 'command.history'), detail: translate(localeState.locale, 'command.historyDetail'), run: openHistory },
    { id: 'visual', label: translate(localeState.locale, 'command.visual'), detail: translate(localeState.locale, getVisualModeLabelKey(mode)), run: cycleMode },
    { id: 'quality', label: translate(localeState.locale, 'command.quality'), detail: translate(localeState.locale, getSceneQualityLabelKey(sceneQuality)), run: cycleQuality },
    { id: 'task-log', label: translate(localeState.locale, 'command.taskLog'), detail: translate(localeState.locale, 'command.taskLogDetail'), run: toggleTaskLog },
    { id: 'theme', label: translate(localeState.locale, 'command.theme'), detail: `${themeMode.toUpperCase()}`, run: transitionTheme },
    { id: 'reset', label: translate(localeState.locale, 'command.reset'), detail: translate(localeState.locale, 'command.resetDetail'), run: () => setMode('baseline') },
  ]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); closeForegroundLayers(); setCommandOpen(true) }
      if (event.key === 'Tab') {
        const app = document.querySelector('.neural-page')
        if (!app) return
        const activeScope = ['.operation-confirm-gate', '.approval-gate', '.task-dispatch-drawer.open', '.mission-queue.is-open', '.mission-history.is-open', '.workspace-panel', '.agent-task-panel.open'].map((selector) => app.querySelector<HTMLElement>(selector)).find(Boolean) ?? app
        const focusable = Array.from(activeScope.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')).filter((element) => {
          const style = window.getComputedStyle(element)
          return element.getClientRects().length > 0 && style.visibility !== 'hidden' && !element.closest('[aria-hidden="true"]')
        })
        if (focusable.length === 0) return
        const currentIndex = focusable.indexOf(document.activeElement as HTMLElement)
        const lastIndex = focusable.length - 1
        if (event.shiftKey && (currentIndex <= 0 || currentIndex === -1)) {
          event.preventDefault()
          focusable[lastIndex].focus()
        } else if (!event.shiftKey && currentIndex === lastIndex) {
          event.preventDefault()
          focusable[0].focus()
        }
      }
      if (event.key === 'Escape') {
        if (pendingApproval) return
        event.preventDefault()
        if (pendingOperation) { setPendingOperation(null); restoreForegroundTrigger(); return }
        if (commandOpen) { setCommandOpen(false); restoreForegroundTrigger(); return }
        if (dispatchOpen) { setDispatchOpen(false); restoreForegroundTrigger(); return }
        if (historyOpen) { setHistoryOpen(false); restoreForegroundTrigger(); return }
        if (queueOpen) { setQueueOpen(false); restoreForegroundTrigger(); return }
        if (consoleOpen) { setConsoleOpen(false); restoreForegroundTrigger(); return }
        if (panelIndexOpen) { setPanelIndexOpen(false); restoreForegroundTrigger(); return }
        if (activeWorkspace !== 'neural-net') { setActiveWorkspace('neural-net'); restoreForegroundTrigger() }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeWorkspace, commandOpen, consoleOpen, dispatchOpen, historyOpen, panelIndexOpen, pendingApproval, pendingOperation, queueOpen])

  useEffect(() => () => {
    themeTimers.current.forEach((timer) => window.clearTimeout(timer))
    if (operationNoticeTimer.current !== null) window.clearTimeout(operationNoticeTimer.current)
  }, [])

  useEffect(() => window.localStorage.setItem('mcp2099.scene-quality', sceneQuality), [sceneQuality])

  useEffect(() => {
    if (task.phase === 'calibrating') {
      setTimelineDismissed(false)
      setResultDismissed(false)
    }
  }, [task.phase])

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let active = true
    let context: { revert: () => void } | undefined
    void import('gsap').then(({ gsap }) => {
      if (!active) return
      context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .from('[data-reveal="navigation"]', { opacity: 0, y: -14, duration: 0.55 })
        .from('[data-reveal="left-panel"] > *', { opacity: 0, y: 18, duration: 0.48, stagger: 0.1 }, '-=0.16')
        .from('.neural-scene', { opacity: 0, scale: 0.94, duration: 1.25 }, '-=0.55')
        .from('[data-reveal="metrics"] > *', { opacity: 0, x: 18, duration: 0.42, stagger: 0.11 }, '-=0.9')
        .from('[data-reveal="status-bar"]', { opacity: 0, y: 10, duration: 0.4 }, '-=0.42')
      })
    })
    return () => { active = false; context?.revert() }
  }, [])

  return (
    <LocaleProvider value={localeState}><main className={`neural-page ${mode !== 'baseline' ? 'enhanced' : ''} ${mode === 'feral' ? 'feral' : ''} ${initializing ? 'initializing' : ''} ${themeTransition ? 'theme-transition' : ''} ${themeDirection ? `theme-${themeDirection}` : ''}`} data-theme={theme}>
      <div className="hud-grid" aria-hidden="true" />
      <div className="theme-calibration" aria-hidden="true" />
      <TopNavigation mode={mode} sceneQuality={sceneQuality} performanceConstrained={scenePerformance.lowPower} consoleOpen={consoleOpen} themeMode={themeMode} onCycleMode={cycleMode} onCycleQuality={cycleQuality} onOpenDispatch={openDispatch} onToggleConsole={toggleTaskLog} onCycleTheme={transitionTheme} onOpenCommands={openCommands} activeWorkspace={activeWorkspace} onSelectWorkspace={selectWorkspace} />
      <RuntimeStatusBanner state={connectionState} error={lastError} onRetry={() => { void recoverRuntime().then(() => showOperationNotice('notice.recovered')).catch(() => undefined) }} onDismiss={clearRuntimeError} />
      {operationNotice && <OperationNotice title={translate(localeState.locale, 'notice.title')} detail={translate(localeState.locale, operationNotice)} onDismiss={() => setOperationNotice(null)} />}
      <WorkspacePanel view={activeWorkspace} task={task} queueCount={taskQueue.length} queuePaused={queuePaused} auditEvents={auditRecords} taskEvents={taskEvents} transport={transport} onClose={() => setActiveWorkspace('neural-net')} onCreateTask={openDispatch} onOpenTaskLog={openTaskLog} onOpenQueue={openQueue} onOpenHistory={openHistory} onLoadScenario={transport === 'local-mock' ? loadScenario : null} />
      {showPanelIndex && <PanelIndex open={panelIndexOpen} timelineVisible={!timelineDismissed && !consoleOpen} resultAvailable={task.phase === 'complete'} resultVisible={!resultDismissed && task.phase === 'complete'} historyCount={missionHistory.length} queueCount={taskQueue.length} queuePaused={queuePaused} queueOpen={queueOpen} onToggle={togglePanelIndex} onShowTimeline={() => { closeForegroundLayers(); setTimelineDismissed(false) }} onShowResult={() => { closeForegroundLayers(); setResultDismissed(false) }} onOpenHistory={openHistory} onOpenQueue={toggleQueue} />}
      <LeftInfoPanel task={task} snapshot={snapshot} queueCount={taskQueue.length} approvalPending={Boolean(pendingApproval)} />
      {webglAvailable ? <NeuralScene mode={sceneMode} quality={sceneQuality} initializing={initializing} theme={theme} themeTransitioning={themeTransition} themeDirection={themeDirection} /> : <div className="webgl-fallback">{translate(localeState.locale, 'scene.unavailable')}<br /><span>{translate(localeState.locale, 'scene.unavailableDetail')}</span></div>}
      <RightMetricsPanel task={task} />
      <AgentTaskPanel open={consoleOpen} task={task} snapshot={snapshot} onRetryTask={() => { void retryTask().then(() => { recordAudit('TASK RETRIED', 'A completed or cancelled mission was restarted.', 'info'); showOperationNotice('notice.retry') }).catch(() => undefined) }} onPauseTask={() => { void pauseTask().then(() => { recordAudit('TASK PAUSED', 'Operator paused the active mission.', 'warning'); showOperationNotice('notice.paused') }).catch(() => undefined) }} onResumeTask={() => { void resumeTask().then(() => { recordAudit('TASK RESUMED', 'Operator resumed the active mission.', 'success'); showOperationNotice('notice.resumed') }).catch(() => undefined) }} onCancelTask={requestTaskCancellation} onClose={() => { setConsoleOpen(false); restoreForegroundTrigger() }} isActive={isActive} />
      <MissionTimeline task={task} snapshot={snapshot} hidden={foregroundLayerOpen || timelineDismissed} onClose={() => setTimelineDismissed(true)} />
      {!resultDismissed && <MissionResultPanel snapshot={snapshot} profiles={profiles} hidden={foregroundLayerOpen} onAction={async (actionId, label) => { const message = transport === 'local-mock' ? `${label} (${actionId}) was accepted by the Local Mock adapter.` : `${label} (${actionId}) request was submitted to the active adapter.`; await recordAuditAsync('RESULT ACTION REQUESTED', message, 'info') }} onClose={() => setResultDismissed(true)} />}
      {historyOpen && <MissionHistoryDrawer open records={missionHistory} onClose={() => { setHistoryOpen(false); restoreForegroundTrigger() }} />}
      {queueOpen && <MissionQueueDrawer open queue={taskQueue} paused={queuePaused} onRemove={requestQueueRemoval} onMove={(taskId, queuePosition) => { const queuedTask = taskQueue.find((candidate) => candidate.id === taskId); void actOnTask(taskId, { requestId: crypto.randomUUID(), action: 'reprioritize', queuePosition }).then(() => { if (queuedTask) recordAudit('QUEUE REORDERED', `${queuedTask.profileId.replace(/-/g, ' ')} moved to position ${queuePosition + 1}.`, 'info'); showOperationNotice('notice.queueUpdated') }).catch(() => undefined) }} onTogglePaused={() => { const nextState = !queuePaused; void actOnQueue({ requestId: crypto.randomUUID(), action: nextState ? 'pause' : 'resume' }).then(() => { recordAudit(nextState ? 'QUEUE HELD' : 'QUEUE RESUMED', nextState ? 'Automatic dispatch paused by operator.' : 'success'); showOperationNotice(nextState ? 'notice.queuePaused' : 'notice.queueResumed') }).catch(() => undefined) }} onClose={() => { setQueueOpen(false); restoreForegroundTrigger() }} />}
      <BottomStatusBar task={task} snapshot={snapshot} queueCount={taskQueue.length} queuePaused={queuePaused} approvalPending={Boolean(pendingApproval)} transport={transport} />
      <TaskDispatchDrawer open={dispatchOpen} profiles={profiles} profilesLoading={profilesLoading} onClose={() => { setDispatchOpen(false); restoreForegroundTrigger() }} onDispatch={dispatchTask} />
      <ApprovalGate request={pendingApproval?.request ?? null} onApprove={() => { if (!pendingApproval) return; const approval = pendingApproval; setPendingApproval(null); void approveTask(approval.taskId).then(() => { recordAudit('APPROVAL GRANTED', `${approval.request.profile.replace(/-/g, ' ')} approved for launch.`, 'success'); setConsoleOpen(true); setMode(approval.request.priority === 'critical' ? 'feral' : 'enhanced'); showOperationNotice('notice.approved') }).catch(() => undefined) }} onDecline={() => { if (!pendingApproval) return; const approval = pendingApproval; setPendingApproval(null); void rejectTask(approval.taskId).then(() => { recordAudit('APPROVAL DECLINED', `${approval.request.profile.replace(/-/g, ' ')} was not launched.`, 'danger'); showOperationNotice('notice.declined') }).catch(() => undefined) }} />
      <OperationConfirmGate operation={pendingOperation} onDismiss={() => { setPendingOperation(null); restoreForegroundTrigger() }} onComplete={() => { setPendingOperation(null); restoreForegroundTrigger() }} />
      <CommandPalette open={commandOpen} actions={commands} onClose={() => { setCommandOpen(false); restoreForegroundTrigger() }} />
    </main></LocaleProvider>
  )
}
