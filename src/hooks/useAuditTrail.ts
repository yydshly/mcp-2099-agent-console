import { useCallback } from 'react'
import { usePersistentState } from './usePersistentState'

export type AuditTone = 'info' | 'success' | 'warning' | 'danger'

export interface AuditEvent {
  id: string
  time: string
  label: string
  detail: string
  tone: AuditTone
}

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export function useAuditTrail() {
  const [auditEvents, setAuditEvents] = usePersistentState<AuditEvent[]>('mcp-2099.audit-events', [{ id: 'console-online', time: now(), label: 'CONSOLE ONLINE', detail: 'Local audit ledger initialized in this browser.', tone: 'info' }])

  const recordAudit = useCallback((label: string, detail: string, tone: AuditTone = 'info') => {
    setAuditEvents((events) => [{ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, time: now(), label, detail, tone }, ...events].slice(0, 40))
  }, [setAuditEvents])

  return { auditEvents, recordAudit }
}
