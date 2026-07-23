import { AgentGatewayError } from './agent-gateway'

export async function runGatewayRequest<T>(request: () => Promise<T>, operation: string, timeoutMs = 12_000): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new AgentGatewayError('TIMEOUT', `${operation} timed out after ${timeoutMs}ms`)), timeoutMs)
  })

  try {
    return await Promise.race([request(), deadline])
  } catch (error) {
    if (error instanceof AgentGatewayError) throw error
    if (error instanceof TypeError) throw new AgentGatewayError('NETWORK_UNAVAILABLE', `${operation} could not reach the Agent runtime`)
    throw new AgentGatewayError('UNAVAILABLE', error instanceof Error ? error.message : `${operation} failed`)
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}
