import type { AgentEvent, TaskEventGap } from '../domain/agent-contract'

type Listener = { onEvent: (event: AgentEvent) => void; onGap: (gap: TaskEventGap) => void }

export interface EventStream {
  subscribe(taskId: string, onEvent: (event: AgentEvent) => void, onGap: (gap: TaskEventGap) => void): () => void
}

export class InMemoryEventStream implements EventStream {
  private readonly listeners = new Map<string, Set<Listener>>()

  subscribe(taskId: string, onEvent: Listener['onEvent'], onGap: Listener['onGap']): () => void {
    const listener = { onEvent, onGap }
    const listeners = this.listeners.get(taskId) ?? new Set<Listener>()
    listeners.add(listener)
    this.listeners.set(taskId, listeners)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) this.listeners.delete(taskId)
    }
  }

  publish(event: AgentEvent): void {
    this.listeners.get(event.taskId)?.forEach((listener) => listener.onEvent(event))
  }

  notifyGap(gap: TaskEventGap): void {
    this.listeners.get(gap.taskId)?.forEach((listener) => listener.onGap(gap))
  }
}
