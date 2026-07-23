import { useCallback, useMemo, useRef } from 'react'
import type { CreateTaskCommand } from '../domain/agent-contract'
import type { DispatchRequest } from '../domain/agent'
import { useAgentTaskRuntime } from './use-agent-task-runtime'
import { createLegacyAgentTask } from '../services/legacy-task-bridge'
import { createAgentRuntimeAdapters, type AgentRuntimeAdapters } from '../services/agent-runtime-factory'

export type { AgentActivity, AgentPhase, AgentProfile, AgentTask, DispatchRequest, TaskPriority } from '../domain/agent'
export { profileLabels } from '../domain/agent'

const requestId = () => crypto.randomUUID()

export function useAgentSimulation() {
  const adaptersRef = useRef<AgentRuntimeAdapters | null>(null)
  if (!adaptersRef.current) adaptersRef.current = createAgentRuntimeAdapters()
  const adapters = adaptersRef.current
  const runtime = useAgentTaskRuntime({ gateway: adapters.gateway, eventStream: adapters.eventStream })
  const task = useMemo(() => createLegacyAgentTask(runtime.activeTask), [runtime.activeTask])

  const startTask = useCallback((request: DispatchRequest) => {
    const command: CreateTaskCommand = {
      requestId: requestId(),
      profileId: request.profile,
      input: { objective: request.objective, ...request.context },
      options: { priority: request.priority === 'critical' ? 'urgent' : request.priority === 'priority' ? 'high' : 'standard', approvalPolicy: 'auto' },
    }
    void runtime.createTask(command)
  }, [runtime])

  const retryTask = useCallback(() => {
    if (runtime.activeTask) void runtime.actOnTask(runtime.activeTask.id, { requestId: requestId(), action: 'retry' })
  }, [runtime])

  const approveTask = useCallback((taskId: string) => {
    void runtime.actOnTask(taskId, { requestId: requestId(), action: 'approve' })
  }, [runtime])

  const rejectTask = useCallback((taskId: string) => {
    void runtime.actOnTask(taskId, { requestId: requestId(), action: 'reject' })
  }, [runtime])

  const pauseTask = useCallback(() => {
    if (runtime.activeTask) void runtime.actOnTask(runtime.activeTask.id, { requestId: requestId(), action: 'pause' })
  }, [runtime])

  const resumeTask = useCallback(() => {
    if (runtime.activeTask) void runtime.actOnTask(runtime.activeTask.id, { requestId: requestId(), action: 'resume' })
  }, [runtime])

  const cancelTask = useCallback(() => {
    if (!runtime.activeTask) return Promise.resolve()
    return runtime.actOnTask(runtime.activeTask.id, { requestId: requestId(), action: 'cancel' })
  }, [runtime])

  const isActive = task.phase === 'calibrating' || task.phase === 'routing' || task.phase === 'executing' || task.phase === 'synthesizing'
  const recordAudit = useCallback((type: string, message: string, tone: import('../domain/agent-contract').AuditTone = 'info') => {
    void runtime.recordAudit({ requestId: requestId(), type, message, tone, taskId: runtime.activeTask?.id })
  }, [runtime])
  const recordAuditAsync = useCallback((type: string, message: string, tone: import('../domain/agent-contract').AuditTone = 'info') => (
    runtime.recordAudit({ requestId: requestId(), type, message, tone, taskId: runtime.activeTask?.id })
  ), [runtime])
  return { task, snapshot: runtime.activeTask, tasks: runtime.tasks, taskEvents: runtime.taskEvents, auditRecords: runtime.auditRecords, profiles: runtime.profiles, profilesLoading: runtime.profilesLoading, queue: runtime.queue, transport: adapters.transport, startTask, retryTask, pauseTask, resumeTask, cancelTask, approveTask, rejectTask, submitTask: runtime.createTask, actOnTask: runtime.actOnTask, actOnQueue: runtime.actOnQueue, recordAudit, recordAuditAsync, recoverRuntime: runtime.recover, clearRuntimeError: runtime.clearError, isActive, connectionState: runtime.connectionState, lastError: runtime.lastError, loadScenario: runtime.loadScenario }
}
