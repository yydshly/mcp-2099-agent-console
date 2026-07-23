import { Command, Gauge, Moon, Sun, Terminal } from 'lucide-react'
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

export function TopNavigation({ mode, sceneQuality, consoleOpen, themeMode, onCycleMode, onCycleQuality, onOpenDispatch, onToggleConsole, onCycleTheme, onOpenCommands, activeWorkspace, onSelectWorkspace }: TopNavigationProps) {
  const { locale, setLocale, t } = useLocaleText()
  const navigationLabel = (view: WorkspaceView) => view === 'interface' ? t('nav.interface') : view === 'protocol' ? t('nav.protocol') : view === 'logs' ? t('nav.logs') : 'NEURAL_NET'
  const modeLabel = mode === 'baseline' ? t('nav.modeBaseline') : mode === 'enhanced' ? t('nav.modeEnhanced') : t('nav.modeFeral')
  const qualityLabel = t(getSceneQualityLabelKey(sceneQuality))
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
        <button className="icon-control instant-tooltip" type="button" onClick={onCycleTheme} aria-label={t('nav.dayNight')} data-tooltip={t('nav.dayNight')}><span className="theme-icon">{themeMode === 'light' ? <Sun size={15} /> : <Moon size={15} />}</span></button>
        <button className="command-hint instant-tooltip" type="button" onClick={onOpenCommands} aria-label={t('nav.commands')} data-tooltip={t('nav.commands')}><Command size={12} /><span>{t('nav.commands')}</span><kbd>K</kbd></button>
        <button className={`quality-toggle quality-${sceneQuality} instant-tooltip`} type="button" onClick={onCycleQuality} aria-label={t('nav.qualityTitle')} data-tooltip={t('nav.qualityTitle')}><Gauge size={12} /> {t('nav.fx')} / {qualityLabel}</button>
        <button className={`${mode === 'baseline' ? 'visual-toggle' : 'visual-toggle enabled'} instant-tooltip`} type="button" onClick={onCycleMode} aria-label={t('nav.modeTitle')} data-tooltip={t('nav.modeTitle')}>
          {modeLabel}
        </button>
        <button className="locale-toggle" type="button" onClick={() => setLocale((current) => current === 'en' ? 'zh-CN' : 'en')} aria-label={locale === 'en' ? '切换为中文' : 'Switch to English'}>{locale === 'en' ? '中文' : 'EN'}</button>
        <button className={consoleOpen ? 'console-trigger enabled' : 'console-trigger'} type="button" onClick={onToggleConsole} aria-expanded={consoleOpen}>{t('nav.taskLog')}</button>
        <button className="initialize-control" type="button" onClick={onOpenDispatch}>{t('nav.newTask')}</button>
      </div>
    </header>
  )
}
