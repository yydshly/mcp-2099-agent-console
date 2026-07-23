import { lazy, Suspense } from 'react'
import { SceneErrorBoundary } from './SceneErrorBoundary'
import type { SceneQuality } from '../../domain/scene-quality'
import { useLocaleText } from '../../ui/locale'

interface NeuralSceneProps {
  mode: 'baseline' | 'enhanced' | 'feral'
  quality: SceneQuality
  initializing: boolean
  theme: 'dark' | 'light'
  themeTransitioning: boolean
  themeDirection: 'to-light' | 'to-dark' | null
}

const NeuralSceneRuntime = lazy(() => import('./NeuralSceneRuntime'))

export function NeuralScene(props: NeuralSceneProps) {
  const { t } = useLocaleText()
  return (
    <SceneErrorBoundary>
      <Suspense fallback={<div className="neural-scene scene-loading" aria-label={t('scene.loading')} aria-busy="true"><span>{t('scene.loading')}</span><i /></div>}>
        <NeuralSceneRuntime {...props} />
      </Suspense>
    </SceneErrorBoundary>
  )
}
