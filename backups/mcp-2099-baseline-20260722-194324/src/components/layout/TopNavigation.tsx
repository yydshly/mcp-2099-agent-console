import { Command, Moon, Terminal } from 'lucide-react'
import { ScrambleText } from '../../ui/ScrambleText'

const navigationItems = ['INTERFACE', 'NEURAL_NET', 'PROTOCOL', 'LOGS']

export function TopNavigation() {
  return (
    <header className="top-navigation" data-reveal="navigation">
      <div className="brand-cluster">
        <span className="terminal-mark"><Terminal size={15} strokeWidth={1.6} /></span>
        <span className="brand-name">MCP 2099</span>
        <span className="admin-label">SYS_ADMIN_VIEW</span>
      </div>
      <nav className="main-navigation" aria-label="Primary navigation">
        {navigationItems.map((item) => (
          <button className={item === 'NEURAL_NET' ? 'nav-item active' : 'nav-item'} key={item} type="button">
            <ScrambleText>{item === 'NEURAL_NET' ? `> ${item}` : item}</ScrambleText>
          </button>
        ))}
      </nav>
      <div className="nav-actions">
        <button className="icon-control" type="button" aria-label="Toggle display illumination"><Moon size={15} /></button>
        <span className="command-hint"><Command size={12} /> K</span>
        <button className="initialize-control" type="button">INITIALIZE</button>
      </div>
    </header>
  )
}
