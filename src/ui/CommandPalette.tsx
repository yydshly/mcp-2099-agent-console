import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocaleText } from './locale'

export interface CommandAction {
  id: string
  label: string
  detail: string
  shortcut?: string
  run: () => void
}

interface CommandPaletteProps {
  open: boolean
  actions: ReadonlyArray<CommandAction>
  onClose: () => void
}

export function CommandPalette({ open, actions, onClose }: CommandPaletteProps) {
  const { t } = useLocaleText()
  const [query, setQuery] = useState('')
  const visibleActions = useMemo(() => actions.filter((action) => `${action.label} ${action.detail}`.toLowerCase().includes(query.toLowerCase())), [actions, query])
  if (!open) return null

  return (
    <div className="command-overlay" role="dialog" aria-modal="true" aria-label={t('nav.commands')}>
      <div className="command-palette">
        <div className="command-search"><Search size={15} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('command.search')} /><button type="button" onClick={onClose} aria-label={t('command.close')}><X size={14} /></button></div>
        <div className="command-results">
          {visibleActions.map((action) => <button key={action.id} type="button" onClick={() => { action.run(); onClose() }}><span><strong>{action.label}</strong><small>{action.detail}</small></span>{action.shortcut && <kbd>{action.shortcut}</kbd>}</button>)}
          {visibleActions.length === 0 && <p>{t('command.empty')}</p>}
        </div>
        <p className="command-footer"><kbd>ESC</kbd> {t('command.close')} <span><kbd>ENTER</kbd> {t('command.execute')}</span></p>
      </div>
    </div>
  )
}
