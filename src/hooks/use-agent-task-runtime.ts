import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AgentEvent, AgentProfile, AuditRecord, CreateAuditRecordCommand, CreateTaskCommand, QueueActionCommand, QueueSnapshot, TaskActionCommand, TaskEventGap, TaskProjection, TaskSnapshot } from '../domain/agent-contract'
import { applyTaskEvent, getTaskEventGap, replaceTaskSnapshot } from '../domain/task-reducer'
import type { AgentGateway } from '../services/agent-gateway'
import type { EventStream } from '../services/event-stream'
import { AgentGatewayError } from '../services/agent-gateway'
import { runGatewayRequest } from '../services/gateway-request'
import { getLocalMockScenarioCapability } from '../services/local-mock-scenario-capability'
import type { LocalMockScenario } from '../services/local-mock-scenarios'

export type ConnectionState = 'idle' | 'connected' | 'recovering' | 'offline' | 'error'

interface AgentTaskRuntimeOptions {
  gateway: AgentGateway
  eventStream: EventStream
}

export function useAgentTaskRuntime({ gateway, eventStream }: AgentTaskRuntimeOptions) {
  const projections = useRef(new Map<string, TaskProjection>())
  const [tasks, setTasks] = useState<TaskSnapshot[]>([])
  const [profiles, setProfiles] = useState<AgentProfile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [queue, setQueue] = useState<QueueSnapshot>({ paused: false, tasks: [], updatedAt: new Date(0).toISOString() })
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([])
  const [taskEvents, setTaskEvents] = useState<AgentEvent[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [lastError, setLastError] = useState<Error | null>(null)

  const replaceSnapshot = useCallback((snapshot: TaskSnapshot) => {
    projections.current.set(snapshot.id, replaceTaskSnapshot(snapshot))
    setTasks((current) => {
      const exists = current.some((task) => task.id === snapshot.id)
      return exists ? current.map((task) => task.id === snapshot.id ? snapshot : task) : [snapshot, ...current]
    })
  }, [])

  const refreshQueue = useCallback(async () => {
    const snapshot = await runGatewayRequest(() => gateway.getQueue(), 'Queue refresh')
    setQueue(snapshot)
    return snapshot
  }, [gateway])

  const refreshTask = useCallback(async (taskId: string) => {
    setConnectionState('recovering')
    try {
      replaceSnapshot(await runGatewayRequest(() => gateway.getTask(taskId), 'Task refresh'))
      setLastError(null)
      setConnectionState('connected')
    } catch (error) {
      setLastError(error instanceof Error ? error : new Error('Unable to refresh task'))
      setConnectionState('error')
    }
  }, [gateway, replaceSnapshot])

  const recover = useCallback(async () => {
    setConnectionState('recovering')
    try {
      const [snapshots, availableProfiles, queueSnapshot, auditSnapshot] = await runGatewayRequest(() => Promise.all([gateway.listTasks(), gateway.listProfiles(), gateway.getQueue(), gateway.listAuditRecords()]), 'Runtime recovery')
      snapshots.forEach(replaceSnapshot)
      setProfiles(availableProfiles)
      setQueue(queueSnapshot)
      setAuditRecords(auditSnapshot)
      setLastError(null)
      setConnectionState('connected')
    } catch (error) {
      setLastError(error instanceof Error ? error : new Error('Unable to restore agent runtime'))
      setConnectionState('error')
    }
  }, [gateway, replaceSnapshot])

  const clearError = useCallback(() => setLastError(null), [])

  const handleEvent = useCallback((event: AgentEvent) => {
    const projection = projections.current.get(event.taskId)
    if (!projection) return
    const gap = getTaskEventGap(projection, event)
    if (gap) {
      void refreshTask(gap.taskId)
      return
    }
    const updated = applyTaskEvent(projection, event)
    if (updated === projection) return
    projections.current.set(event.taskId, updated)
    setTaskEvents((current) => current.some((entry) => entry.id === event.id) ? current : [...current, event])
    setTasks((current) => current.map((task) => task.id === event.taskId ? updated.snapshot : task))
    if (updated.snapshot.status === 'running') setActiveTaskId(event.taskId)
    if (event.type === 'task.status_changed' || event.type === 'result.ready') void refreshQueue()
  }, [refreshQueue, refreshTask])

  const handleGap = useCallback((gap: TaskEventGap) => { void refreshTask(gap.taskId) }, [refreshTask])

  const createTask = useCallback(async (command: CreateTaskCommand) => {
    try {
      const snapshot = await runGatewayRequest(() => gateway.createTask(command), 'Task dispatch')
      replaceSnapshot(snapshot)
      if (snapshot.status !== 'queued') setActiveTaskId(snapshot.id)
      await refreshQueue()
      setConnectionState('connected')
      return snapshot
    } catch (error) {
      const failure = error instanceof Error ? error : new Error('Unable to create task')
      setLastError(failure)
      setConnectionState('error')
      throw failure
    }
  }, [gateway, refreshQueue, replaceSnapshot])

  const actOnTask = useCallback(async (taskId: string, command: TaskActionCommand) => {
    try {
      const snapshot = await runGatewayRequest(() => gateway.actOnTask(taskId, command), `Task ${command.action}`)
      replaceSnapshot(snapshot)
      if (snapshot.status === 'running') setActiveTaskId(snapshot.id)
      await refreshQueue()
      return snapshot
    } catch (error) {
      const failure = error instanceof Error ? error : new Error('Unable to update task')
      setLastError(failure)
      throw failure
    }
  }, [gateway, refreshQueue, replaceSnapshot])

  const actOnQueue = useCallback(async (command: QueueActionCommand) => {
    try {
      const snapshot = await runGatewayRequest(() => gateway.actOnQueue(command), `Queue ${command.action}`)
      setQueue(snapshot)
      return snapshot
    } catch (error) {
      const failure = error instanceof Error ? error : new Error('Unable to update queue')
      setLastError(failure)
      throw failure
    }
  }, [gateway])

  const recordAudit = useCallback(async (command: CreateAuditRecordCommand) => {
    const record = await runGatewayRequest(() => gateway.recordAudit(command), 'Audit write')
    setAuditRecords((current) => [record, ...current.filter((entry) => entry.id !== record.id)].slice(0, 100))
    return record
  }, [gateway])

  const scenarioCapability = useMemo(() => getLocalMockScenarioCapability(gateway), [gateway])
  const loadScenario = useCallback(async (scenario: LocalMockScenario) => {
    if (!scenarioCapability) return
    setConnectionState('recovering')
    try {
      const activeSnapshot = await scenarioCapability.loadScenario(scenario)
      const [snapshots, queueSnapshot, auditSnapshot, events] = await Promise.all([
        gateway.listTasks(),
        gateway.getQueue(),
        gateway.listAuditRecords(),
        gateway.listTaskEvents(activeSnapshot.id),
      ])
      projections.current.clear()
      snapshots.forEach((snapshot) => projections.current.set(snapshot.id, replaceTaskSnapshot(snapshot)))
      setTasks(snapshots)
      setQueue(queueSnapshot)
      setAuditRecords(auditSnapshot)
      setTaskEvents(events)
      setActiveTaskId(activeSnapshot.id)
      setLastError(null)
      setConnectionState('connected')
    } catch (error) {
      setLastError(error instanceof Error ? error : new Error('Unable to load local scenario'))
      setConnectionState('error')
      throw error
    }
  }, [gateway, scenarioCapability])

  useEffect(() => {
    let active = true
    runGatewayRequest(() => Promise.all([gateway.listTasks(), gateway.listProfiles(), gateway.getQueue(), gateway.listAuditRecords()]), 'Runtime bootstrap').then(([snapshots, availableProfiles, queueSnapshot, auditSnapshot]) => {
      if (!active) return
      snapshots.forEach(replaceSnapshot)
      setProfiles(availableProfiles)
      setQueue(queueSnapshot)
      setAuditRecords(auditSnapshot)
      setProfilesLoading(false)
      if (navigator.onLine) {
        setLastError(null)
        setConnectionState('connected')
      } else {
        setLastError(new AgentGatewayError('NETWORK_UNAVAILABLE', 'Browser is offline. The last valid task snapshot remains available.'))
        setConnectionState('offline')
      }
    }).catch((error) => {
      if (!active) return
      setProfilesLoading(false)
      setLastError(error instanceof Error ? error : new Error('Unable to load tasks'))
      setConnectionState('error')
    })
    return () => { active = false }
  }, [gateway, replaceSnapshot])

  useEffect(() => {
    const markOffline = () => {
      setLastError(new AgentGatewayError('NETWORK_UNAVAILABLE', 'Browser is offline. The last valid task snapshot remains available.'))
      setConnectionState('offline')
    }
    const restoreOnline = () => { void recover() }
    window.addEventListener('offline', markOffline)
    window.addEventListener('online', restoreOnline)
    if (!navigator.onLine) markOffline()
    return () => {
      window.removeEventListener('offline', markOffline)
      window.removeEventListener('online', restoreOnline)
    }
  }, [recover])

  useEffect(() => {
    const unsubscribers = tasks.map((task) => eventStream.subscribe(task.id, handleEvent, handleGap))
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [eventStream, handleEvent, handleGap, tasks])

  useEffect(() => {
    if (!activeTaskId) { setTaskEvents([]); return }
    let active = true
    runGatewayRequest(() => gateway.listTaskEvents(activeTaskId), 'Task event history').then((events) => { if (active) setTaskEvents(events) }).catch((error) => { if (active) setLastError(error instanceof Error ? error : new Error('Unable to load task events')) })
    return () => { active = false }
  }, [activeTaskId, gateway])

  const activeTask = useMemo(() => tasks.find((task) => task.id === activeTaskId) ?? null, [activeTaskId, tasks])
  return { profiles, profilesLoading, queue, tasks, taskEvents, auditRecords, activeTask, activeTaskId, setActiveTaskId, createTask, actOnTask, actOnQueue, recordAudit, refreshTask, refreshQueue, recover, clearError, connectionState, lastError, loadScenario: scenarioCapability ? loadScenario : null }
}
