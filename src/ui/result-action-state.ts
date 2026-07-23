export type ResultActionStatus = 'idle' | 'requesting' | 'requested' | 'failed'

export function getResultActionStatus(
  state: ReadonlyMap<string, ResultActionStatus>,
  actionId: string,
): ResultActionStatus {
  return state.get(actionId) ?? 'idle'
}

export function setResultActionStatus(
  state: ReadonlyMap<string, ResultActionStatus>,
  actionId: string,
  status: ResultActionStatus,
): Map<string, ResultActionStatus> {
  const next = new Map(state)
  next.set(actionId, status)
  return next
}
