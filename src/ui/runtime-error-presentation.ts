import { AgentGatewayError } from '../services/agent-gateway'
import type { TranslationKey } from './locale-core'

export interface RuntimeErrorPresentation {
  title: TranslationKey
  detail: TranslationKey
}

const presentations: Partial<Record<AgentGatewayError['code'], RuntimeErrorPresentation>> = {
  TIMEOUT: { title: 'runtime.timeout', detail: 'runtime.timeoutDetail' },
  NETWORK_UNAVAILABLE: { title: 'runtime.network', detail: 'runtime.networkDetail' },
  PERMISSION_DENIED: { title: 'runtime.permission', detail: 'runtime.permissionDetail' },
  TASK_FAILED: { title: 'runtime.taskFailed', detail: 'runtime.taskFailedDetail' },
}

const fallback: RuntimeErrorPresentation = { title: 'runtime.interrupted', detail: 'runtime.unavailableDetail' }

export function getRuntimeErrorPresentation(error: Error | null): RuntimeErrorPresentation {
  if (!(error instanceof AgentGatewayError)) return fallback
  return presentations[error.code] ?? fallback
}
