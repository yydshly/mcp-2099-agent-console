import { useLayoutEffect, useState } from 'react'
import { gsap } from 'gsap'
import { BottomStatusBar } from '../components/layout/BottomStatusBar'
import { LeftInfoPanel } from '../components/layout/LeftInfoPanel'
import { RightMetricsPanel } from '../components/layout/RightMetricsPanel'
import { TopNavigation } from '../components/layout/TopNavigation'
import { NeuralScene } from '../components/scene/NeuralScene'

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function NeuralNetPage() {
  const [webglAvailable] = useState(supportsWebGL)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .from('[data-reveal="navigation"]', { opacity: 0, y: -14, duration: 0.55 })
        .from('[data-reveal="left-panel"] > *', { opacity: 0, y: 18, duration: 0.48, stagger: 0.1 }, '-=0.16')
        .from('.neural-scene', { opacity: 0, scale: 0.94, duration: 1.25 }, '-=0.55')
        .from('[data-reveal="metrics"] > *', { opacity: 0, x: 18, duration: 0.42, stagger: 0.11 }, '-=0.9')
        .from('[data-reveal="status-bar"]', { opacity: 0, y: 10, duration: 0.4 }, '-=0.42')
    })
    return () => context.revert()
  }, [])

  return (
    <main className="neural-page">
      <div className="hud-grid" aria-hidden="true" />
      <TopNavigation />
      <LeftInfoPanel />
      {webglAvailable ? <NeuralScene /> : <div className="webgl-fallback">CORE VISUALIZER OFFLINE<br /><span>WebGL rendering is unavailable in this environment.</span></div>}
      <RightMetricsPanel />
      <BottomStatusBar />
    </main>
  )
}
