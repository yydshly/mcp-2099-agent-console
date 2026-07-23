import { Archive, Clock3, Download, FileText, Search, X } from 'lucide-react'
import { useState } from 'react'
import type { TaskSnapshot } from '../../domain/agent-contract'
import { useLocaleText } from '../../ui/locale'

type HistoryStatus = 'completed' | 'cancelled' | 'failed'

interface MissionHistoryDrawerProps {
  open: boolean
  records: TaskSnapshot[]
  onClose: () => void
}

export function MissionHistoryDrawer({ open, records, onClose }: MissionHistoryDrawerProps) {
  const { t } = useLocaleText()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | HistoryStatus>('all')
  const selectedRecord = records.find((record) => record.id === selectedId) ?? null
  const filteredRecords = records.filter((record) => {
    const matchesFilter = filter === 'all' || record.status === filter
    const searchable = `${record.profileId} ${typeof record.input.objective === 'string' ? record.input.objective : ''}`.toLowerCase()
    return matchesFilter && searchable.includes(query.trim().toLowerCase())
  })
  const exportRecord = () => {
    if (!selectedRecord) return
    const archive = [
      'MCP-2099 / MISSION ARCHIVE',
      `STATUS: ${selectedRecord.status.toUpperCase()}`,
      `TIME: ${new Date(selectedRecord.updatedAt).toLocaleString()}`,
      `PROFILE: ${selectedRecord.profileId.replace(/-/g, ' ').toUpperCase()}`,
      `OBJECTIVE: ${typeof selectedRecord.input.objective === 'string' ? selectedRecord.input.objective : 'Bounded agent task'}`,
      ...Object.entries(selectedRecord.input).filter(([key]) => key !== 'objective').flatMap(([key, value]) => typeof value === 'string' ? [`${key.toUpperCase()}: ${value}`] : []),
    ].join('\n')
    const url = URL.createObjectURL(new Blob([archive], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `mcp-2099-${selectedRecord.status}-archive.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside className={`mission-history ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="history-heading"><span><Archive size={15} /> {t('history.title')}</span><button className="history-close" type="button" onClick={onClose}><X size={14} /> {t('history.close')}</button></div>
      <p className="history-subtitle">{t('history.subtitle')}</p>
      <div className="history-search"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('history.search')} aria-label={t('history.search')} />{query && <button className="history-search-clear" type="button" onClick={() => setQuery('')} aria-label={t('history.search')}><X size={12} /></button>}</div>
      <div className="history-filters"><button className={filter === 'all' ? 'is-active' : ''} type="button" onClick={() => setFilter('all')}>{t('history.all')}</button><button className={filter === 'completed' ? 'is-active' : ''} type="button" onClick={() => setFilter('completed')}>{t('history.complete')}</button><button className={filter === 'cancelled' ? 'is-active' : ''} type="button" onClick={() => setFilter('cancelled')}>{t('history.cancelled')}</button><button className={filter === 'failed' ? 'is-active' : ''} type="button" onClick={() => setFilter('failed')}>{t('history.failed')}</button></div>
      <div className="history-list">
        {records.length === 0 ? <div className="history-empty">{t('history.empty')}<br />{t('history.emptyDetail')}</div> : filteredRecords.length === 0 ? <div className="history-empty">{t('history.noMatch')}</div> : filteredRecords.map((record) => (
          <button className={`history-record ${selectedId === record.id ? 'is-selected' : ''}`} type="button" key={record.id} onClick={() => setSelectedId(record.id)}>
            <div><span className={`history-status ${record.status === 'completed' ? 'complete' : record.status}`}>{record.status === 'completed' ? t('history.complete') : record.status === 'cancelled' ? t('history.cancelled') : t('history.failed')}</span><time><Clock3 size={10} /> {new Date(record.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div>
            <strong>{record.profileId.replace(/-/g, ' ').toUpperCase()}</strong>
            <p>{typeof record.input.objective === 'string' ? record.input.objective : 'Bounded agent task'}</p>
          </button>
        ))}
      </div>
      {selectedRecord && <section className="history-detail">
        <div><span><FileText size={13} /> {t('history.review')}</span><button type="button" onClick={() => setSelectedId(null)}>{t('history.close')}</button></div>
        <strong>{selectedRecord.profileId.replace(/-/g, ' ').toUpperCase()}</strong>
        <p>{typeof selectedRecord.input.objective === 'string' ? selectedRecord.input.objective : 'Bounded agent task'}</p>
        {Object.entries(selectedRecord.input).some(([key, value]) => key !== 'objective' && typeof value === 'string') && <ul>{Object.entries(selectedRecord.input).filter(([key, value]) => key !== 'objective' && typeof value === 'string').map(([key, value]) => <li key={key}>{key.toUpperCase()}: {String(value)}</li>)}</ul>}
        <button className="history-export" type="button" onClick={exportRecord}><Download size={13} /> {t('history.export')}</button>
      </section>}
    </aside>
  )
}
