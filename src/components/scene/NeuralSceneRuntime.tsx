import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Color } from 'three'
import { resolveScenePerformanceProfile, type SceneQuality } from '../../domain/scene-quality'
import { DataFragments } from './DataFragments'
import { BackgroundField } from './BackgroundField'
import { OrbitParticles } from './OrbitParticles'
import { SentientCore } from './SentientCore'
import { WireSphere } from './WireSphere'
import { ThemeTransitionSystem } from './ThemeTransitionSystem'
import { useThemeTransitionSignal } from './theme-transition-context'
import { useLocaleText } from '../../ui/locale'

const darkSceneColor = new Color('#050505')
const lightSceneColor = new Color('#f7f0e2')

interface NeuralSceneRuntimeProps {
  mode: 'baseline' | 'enhanced' | 'feral'
  quality: SceneQuality
  initializing: boolean
  theme: 'dark' | 'light'
  themeTransitioning: boolean
  themeDirection: 'to-light' | 'to-dark' | null
}

function SceneBackground() {
  const { scene } = useThree()
  const themeSignal = useThemeTransitionSignal()
  const targetColor = useRef(new Color())

  useFrame(() => {
    if (document.hidden) return
    const target = targetColor.current.lerpColors(darkSceneColor, lightSceneColor, themeSignal.current.blend)
    if (scene.background instanceof Color) scene.background.copy(target)
    else scene.background = target.clone()
  })

  return null
}

function AdaptivePixelRatio({ maxDpr, onChange }: { maxDpr: number; onChange: (updater: (value: number) => number) => void }) {
  const elapsed = useRef(0)
  const frames = useRef(0)

  useFrame((_, delta) => {
    elapsed.current += delta
    frames.current += 1

    if (elapsed.current < 2.5) return

    const fps = frames.current / elapsed.current
    elapsed.current = 0
    frames.current = 0

    onChange((current) => {
      if (fps < 42) return Math.max(1, Number((current - 0.15).toFixed(2)))
      if (fps > 57) return Math.min(maxDpr, Number((current + 0.1).toFixed(2)))
      return current
    })
  })

  return null
}

export default function NeuralSceneRuntime({ mode, quality, initializing, theme, themeTransitioning, themeDirection }: NeuralSceneRuntimeProps) {
  const { t } = useLocaleText()
  const lightTheme = theme === 'light'
  const deviceMemory = typeof navigator !== 'undefined' ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory : undefined
  const connection = typeof navigator !== 'undefined' ? (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection : undefined
  const performanceProfile = resolveScenePerformanceProfile(quality, { hardwareConcurrency: navigator.hardwareConcurrency, deviceMemory, saveData: connection?.saveData, effectiveType: connection?.effectiveType })
  const { lowPower, maxDpr } = performanceProfile
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const [pixelRatio, setPixelRatio] = useState(maxDpr)
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [contextLost, setContextLost] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const animatedThemeTransition = themeTransitioning && !reducedMotion
  const animatedThemeDirection = reducedMotion ? null : themeDirection

  const captureCanvas = useCallback(({ gl }: { gl: { domElement: HTMLCanvasElement } }) => {
    setCanvas(gl.domElement)
  }, [])

  useEffect(() => {
    const syncVisibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', syncVisibility)
    return () => document.removeEventListener('visibilitychange', syncVisibility)
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => setReducedMotion(query.matches)
    query.addEventListener('change', syncMotionPreference)
    return () => query.removeEventListener('change', syncMotionPreference)
  }, [])

  useEffect(() => {
    if (!canvas) return

    const handleContextLost = (event: Event) => {
      event.preventDefault()
      setContextLost(true)
    }
    const handleContextRestored = () => setContextLost(false)

    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [canvas])

  useEffect(() => setPixelRatio(maxDpr), [maxDpr])

  return (
    <div className="neural-scene" aria-label={t('scene.core')}>
      {contextLost && <div className="scene-unavailable" role="status">{t('scene.recovering')}</div>}
      <Canvas key={quality} onCreated={captureCanvas} frameloop={pageVisible && !contextLost ? 'always' : 'never'} dpr={[1, pixelRatio]} camera={{ position: [0, 0, 7.1], fov: 42 }} gl={{ antialias: performanceProfile.antialias, alpha: true, depth: true, stencil: false, preserveDrawingBuffer: false, powerPreference: performanceProfile.powerPreference }}>
        <ThemeTransitionSystem lightTheme={lightTheme} transitioning={animatedThemeTransition} direction={animatedThemeDirection} reducedMotion={reducedMotion}>
          <SceneBackground />
          <AdaptivePixelRatio maxDpr={maxDpr} onChange={setPixelRatio} />
          <BackgroundField lowPower={lowPower} />
          <DataFragments lowPower={lowPower} />
          <WireSphere lowPower={lowPower} />
          <OrbitParticles mode={mode} lowPower={lowPower} />
          <SentientCore mode={mode} lowPower={lowPower} initializing={initializing} />
        </ThemeTransitionSystem>
      </Canvas>
    </div>
  )
}
