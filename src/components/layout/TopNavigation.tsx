import { ChevronDown, ClipboardList, Command, Gauge, Languages, LayoutPanelTop, Moon, Sparkles, Sun, Terminal } from 'lucide-react'
import { useState } from 'react'
import type { SceneQuality } from '../../domain/scene-quality'
import type { ThemeMode } from '../../hooks/useThemeMode'
import { ScrambleText } from '../../ui/ScrambleText'
import { useLocaleText } from '../../ui/locale'
import { getSceneQualityLabelKey } from '../../ui/display-labels'
import type { WorkspaceView } from './WorkspacePanel'

const navigationItems: Array<{ id: WorkspaceView }> = [
  { id: 'interface' }, { id: 'neural-net' }, { id: 'protocol' }, { id: 'logs' },
]

interface TopNavigationProps {
  mode: 'baseline' | 'enhanced' | 'feral'
  sceneQuality: SceneQuality
  performanceConstrained: boolean
  consoleOpen: boolean
  themeMode: ThemeMode
  onCycleMode: () => void
  onCycleQuality: () => void
  onOpenDispatch: () => void
  onToggleConsole: () => void
  onCycleTheme: () => void
  onOpenCommands: () => void
  activeWorkspace: WorkspaceView
  onSelectWorkspace: (view: WorkspaceView) => void
}

export function TopNavigation({ mode, sceneQuality, performanceConstrained, consoleOpen, themeMode, onCycleMode, onCycleQuality, onOpenDispatch, onToggleConsole, onCycleTheme, onOpenCommands, activeWorkspace, onSelectWorkspace }: TopNavigationProps) {
  const { locale, setLocale, t } = useLocaleText()
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const navigationLabel = (view: WorkspaceView) => view === 'interface' ? t('nav.interface') : view === 'protocol' ? t('nav.protocol') : view === 'logs' ? t('nav.logs') : 'NEURAL_NET'
  const modeLabel = mode === 'baseline' ? t('nav.modeBaseline') : mode === 'enhanced' ? t('nav.modeEnhanced') : t('nav.modeFeral')
  const qualityLabel = t(getSceneQualityLabelKey(sceneQuality))
  const qualityUsingEcoProfile = sceneQuality === 'auto' && performanceConstrained
  const qualityDisplayLabel = qualityUsingEcoProfile ? t('nav.qualityAutoEco') : qualityLabel
  const qualityTooltip = qualityUsingEcoProfile ? t('nav.qualityAutoEcoDetail') : t('nav.qualityTitle')
  const closeWorkspaceMenu = () => setWorkspaceMenuOpen(false)
  return (
    <header className="top-navigation" data-reveal="navigation">
      <div className="brand-cluster">
        <span className="terminal-mark"><Terminal size={15} strokeWidth={1.6} /></span>
        <span className="brand-name">MCP 2099</span>
        <span className="admin-label">SYS_ADMIN_VIEW</span>
      </div>
      <nav className="main-navigation" aria-label="Primary navigation">
        {navigationItems.map((item) => (
          <button className={item.id === activeWorkspace ? 'nav-item active' : 'nav-item'} key={item.id} type="button" onClick={() => onSelectWorkspace(item.id)} aria-current={item.id === activeWorkspace ? 'page' : undefined}>
            <ScrambleText enabled={locale === 'en'}>{item.id === activeWorkspace ? `> ${navigationLabel(item.id)}` : navigationLabel(item.id)}</ScrambleText>
          </button>
        ))}
      </nav>
      <div className="nav-actions">
        <div className="workspace-menu" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setWorkspaceMenuOpen(false) }} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeWorkspaceMenu() } }}>
          <button className="workspace-menu-trigger instant-tooltip" type="button" onClick={() => setWorkspaceMenuOpen((current) => !current)} aria-expanded={workspaceMenuOpen} aria-haspopup="menu" data-tooltip={t('nav.workspaces')}><LayoutPanelTop size={13} /><span>{t('nav.workspaces')}</span><ChevronDown size={12} /></button>
          {workspaceMenuOpen && <div className="workspace-menu-list" role="menu">{navigationItems.map((item) => <button className={item.id === activeWorkspace ? 'is-active' : ''} key={item.id} type="button" role="menuitem" onClick={() => { onSelectWorkspace(item.id); closeWorkspaceMenu() }}>{navigationLabel(item.id)}</button>)}</div>}
        </div>
        <button className="icon-control instant-tooltip" type="button" onClick={() => { closeWorkspaceMenu(); onCycleTheme() }} aria-label={t('nav.dayNight')} data-tooltip={t('nav.dayNight')}><span className="theme-icon">{themeMode === 'light' ? <Sun size={15} /> : <Moon size={15} />}</span></button>
        <button className="command-hint instant-tooltip" type="button" onClick={() => { closeWorkspaceMenu(); onOpenCommands() }} aria-label={t('nav.commands')} data-tooltip={t('nav.commands')}><Command size={12} /><span>{t('nav.commands')}</span><kbd>K</kbd></button>
        <button className={`quality-toggle quality-${sceneQuality} ${qualityUsingEcoProfile ? 'is-constrained' : ''} instant-tooltip`} type="button" onClick={() => { closeWorkspaceMenu(); onCycleQuality() }} aria-label={qualityTooltip} data-tooltip={qualityTooltip}><Gauge size={12} /><span>{t('nav.fx')} / {qualityDisplayLabel}</span></button>
        <button className={`${mode === 'baseline' ? 'visual-toggle' : 'visual-toggle enabled'} instant-tooltip`} type="button" onClick={() => { closeWorkspaceMenu(); onCycleMode() }} aria-label={t('nav.modeTitle')} data-tooltip={t('nav.modeTitle')}>
          <Sparkles size={12} /><span>{modeLabel}</span>
        </button>
        <button className="locale-toggle" type="button" onClick={() => { closeWorkspaceMenu(); setLocale((current) => current === 'en' ? 'zh-CN' : 'en') }} aria-label={locale === 'en' ? '切换为中文' : 'Switch to English'}><Languages size={12} /><span>{locale === 'en' ? '中文' : 'EN'}</span></button>
        <button className={consoleOpen ? 'console-trigger enabled' : 'console-trigger'} type="button" onClick={() => { closeWorkspaceMenu(); onToggleConsole() }} aria-expanded={consoleOpen}><ClipboardList size={12} /><span>{t('nav.taskLog')}</span></button>
        <button className="initialize-control" type="button" onClick={() => { closeWorkspaceMenu(); onOpenDispatch() }}>{t('nav.newTask')}</button>
      </div>
    </header>
  )
}

