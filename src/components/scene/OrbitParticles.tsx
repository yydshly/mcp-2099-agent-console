import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type BufferAttribute, type Points, type PointsMaterial } from 'three'
import { useThemeTransitionSignal } from './theme-transition-context'

interface OrbitParticlesProps {
  mode: 'baseline' | 'enhanced' | 'feral'
  lowPower: boolean
}

export function OrbitParticles({ mode, lowPower }: OrbitParticlesProps) {
  const pointsRef = useRef<Points>(null)
  const materialRef = useRef<PointsMaterial>(null)
  const themeSignal = useThemeTransitionSignal()
  const initialLightTheme = themeSignal.current.blend === 1
  const previousPointer = useRef({ x: Number.NaN, y: Number.NaN })
  const previousBlend = useRef(themeSignal.current.blend)
  const coloredParticleCount = useRef(0)
  const particleCount = lowPower ? (mode === 'baseline' ? 300 : mode === 'enhanced' ? 430 : 560) : (mode === 'baseline' ? 420 : mode === 'enhanced' ? 620 : 820)
  const geometry = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const darkColors = new Float32Array(particleCount * 3)
    const dayColors = new Float32Array(particleCount * 3)
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.45 + Math.random() * 1.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[index * 3] = Math.sin(phi) * Math.cos(theta) * radius + 0.36
      positions[index * 3 + 1] = Math.cos(phi) * radius
      positions[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
      const warmth = Math.random() > 0.9
      darkColors[index * 3] = warmth ? 1 : 0.72
      darkColors[index * 3 + 1] = warmth ? 0.3 : 0.72
      darkColors[index * 3 + 2] = warmth ? 0.02 : 0.72
      dayColors[index * 3] = warmth ? 0.78 : 0.31
      dayColors[index * 3 + 1] = warmth ? 0.19 : 0.25
      dayColors[index * 3 + 2] = warmth ? 0.025 : 0.2
      const initialBlend = initialLightTheme ? 1 : 0
      colors[index * 3] = darkColors[index * 3] + (dayColors[index * 3] - darkColors[index * 3]) * initialBlend
      colors[index * 3 + 1] = darkColors[index * 3 + 1] + (dayColors[index * 3 + 1] - darkColors[index * 3 + 1]) * initialBlend
      colors[index * 3 + 2] = darkColors[index * 3 + 2] + (dayColors[index * 3 + 2] - darkColors[index * 3 + 2]) * initialBlend
    }
    return { positions, colors, darkColors, dayColors }
  }, [initialLightTheme, particleCount])

  useFrame((state, delta) => {
    if (!document.hidden && pointsRef.current) {
      const { blend, pulse, lightArrival } = themeSignal.current
      if (materialRef.current) {
        const darkOpacity = mode === 'baseline' ? 0.72 : 0.84
        const lightOpacity = mode === 'baseline' ? 0.82 : 0.9
        const opacityTarget = darkOpacity + (lightOpacity - darkOpacity) * blend + pulse * 0.035
        materialRef.current.opacity += (opacityTarget - materialRef.current.opacity) * Math.min(delta * 1.6, 1)
      }
      pointsRef.current.rotation.y += delta * (0.018 + pulse * 0.075)
      pointsRef.current.rotation.x -= delta * (0.006 + pulse * 0.022)
      const pointerX = state.pointer.x * 3 + 0.36
      const pointerY = state.pointer.y * 2.2
      const pointerChanged = Math.abs(pointerX - previousPointer.current.x) > 0.002 || Math.abs(pointerY - previousPointer.current.y) > 0.002
      const blendChanged = Math.abs(blend - previousBlend.current) > 0.0005
      const shouldUpdateColors = pulse > 0.001 || pointerChanged || blendChanged || coloredParticleCount.current !== particleCount
      if (!shouldUpdateColors) return
      const colorAttribute = pointsRef.current.geometry.getAttribute('color') as BufferAttribute
      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3
        const distance = Math.hypot(geometry.positions[offset] - pointerX, geometry.positions[offset + 1] - pointerY)
        const activation = Math.max(0, 1 - distance / 1.55) ** 2
        const burst = pulse * (0.05 + 0.1 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 8 + index * 0.37))) + lightArrival * (0.04 + 0.08 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 4.2 + index * 0.17)))
        const baseRed = geometry.darkColors[offset] + (geometry.dayColors[offset] - geometry.darkColors[offset]) * blend
        const baseGreen = geometry.darkColors[offset + 1] + (geometry.dayColors[offset + 1] - geometry.darkColors[offset + 1]) * blend
        const baseBlue = geometry.darkColors[offset + 2] + (geometry.dayColors[offset + 2] - geometry.darkColors[offset + 2]) * blend
        geometry.colors[offset] = Math.min(1, baseRed + activation * 0.28 + burst)
        geometry.colors[offset + 1] = Math.min(1, baseGreen + activation * 0.37 + burst * 0.46)
        geometry.colors[offset + 2] = Math.min(1, baseBlue + activation * 0.32)
      }
      colorAttribute.needsUpdate = true
      previousPointer.current = { x: pointerX, y: pointerY }
      previousBlend.current = blend
      coloredParticleCount.current = particleCount
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geometry.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[geometry.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={materialRef} size={mode === 'feral' ? 0.036 : mode === 'enhanced' ? 0.03 : 0.024} vertexColors transparent opacity={initialLightTheme ? (mode === 'baseline' ? 0.82 : 0.9) : (mode === 'baseline' ? 0.72 : 0.84)} sizeAttenuation depthWrite={false} />
    </points>
  )
}
