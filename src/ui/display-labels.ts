import type { SceneQuality } from '../domain/scene-quality'
import type { TranslationKey } from './locale-core'

export type VisualMode = 'baseline' | 'enhanced' | 'feral'
export type TransportKind = 'local-mock' | 'remote'

const qualityKeys: Record<SceneQuality, TranslationKey> = { auto: 'nav.qualityAuto', eco: 'nav.qualityEco', cinema: 'nav.qualityCinema' }
const visualModeKeys: Record<VisualMode, TranslationKey> = { baseline: 'nav.modeBaseline', enhanced: 'nav.modeEnhanced', feral: 'nav.modeFeral' }
const transportKeys: Record<TransportKind, TranslationKey> = { remote: 'display.remote', 'local-mock': 'display.localMock' }

export const getSceneQualityLabelKey = (quality: SceneQuality) => qualityKeys[quality]
export const getVisualModeLabelKey = (mode: VisualMode) => visualModeKeys[mode]
export const getTransportLabelKey = (transport: TransportKind) => transportKeys[transport]
