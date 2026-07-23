import type { AgentEvent, TaskEventGap } from '../domain/agent-contract'
import type { EventStream } from './event-stream'

interface EventSourceLike { close(): void; onmessage: ((event: MessageEvent<string>) => void) | null }
type EventSourceFactory = (url: string) => EventSourceLike

export class SseEventStream implements EventStream {
  private readonly lastSequences = new Map<string, number>()
  private readonly baseUrl: string
  private readonly createEventSource: EventSourceFactory

  constructor(baseUrl: string, createEventSource: EventSourceFactory = (url) => new EventSource(url, { withCredentials: true })) {
    this.baseUrl = baseUrl
    this.createEventSource = createEventSource
  }

  subscribe(taskId: string, onEvent: (event: AgentEvent) => void, onGap: (gap: TaskEventGap) => void): () => void {
    const lastSequence = this.lastSequences.get(taskId)
    const query = lastSequence ? `?afterSequence=${lastSequence}` : ''
    const source = this.createEventSource(`${this.baseUrl.replace(/\/$/, '')}/v1/tasks/${encodeURIComponent(taskId)}/events${query}`)
    source.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as AgentEvent
        if (!event.id || event.taskId !== taskId || typeof event.sequence !== 'number') return
        const previous = this.lastSequences.get(taskId) ?? 0
        if (previous > 0 && event.sequence > previous + 1) onGap({ taskId, expectedSequence: previous + 1, receivedSequence: event.sequence })
        if (event.sequence <= previous) return
        this.lastSequences.set(taskId, event.sequence)
        onEvent(event)
      } catch {
        // Malformed transport frames are ignored; snapshot recovery handles valid sequence gaps.
      }
    }
    return () => source.close()
  }
}
