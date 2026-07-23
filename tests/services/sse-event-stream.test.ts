import { describe, expect, it } from 'vitest'
import type { AgentEvent } from '../../src/domain/agent-contract'
import { SseEventStream } from '../../src/services/sse-event-stream'

describe('SseEventStream', () => {
  it('orders events, ignores duplicates, and reports sequence gaps', () => {
    let source: { close: () => void; onmessage: ((event: MessageEvent<string>) => void) | null } | undefined
    const stream = new SseEventStream('https://agent.example', () => (source = { close: () => undefined, onmessage: null }))
    const events: AgentEvent[] = []
    const gaps: number[] = []
    stream.subscribe('task-1', (event) => events.push(event), (gap) => gaps.push(gap.receivedSequence))
    const send = (sequence: number) => source?.onmessage?.({ data: JSON.stringify({ id: `event-${sequence}`, sequence, taskId: 'task-1', occurredAt: '2026-01-01T00:00:00Z', type: 'task.status_changed', payload: {} }) } as MessageEvent<string>)
    send(1); send(1); send(3)
    expect(events.map((event) => event.sequence)).toEqual([1, 3])
    expect(gaps).toEqual([3])
  })
})
