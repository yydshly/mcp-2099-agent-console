import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector2, type Mesh } from 'three'
import { createCoreMaterial } from './CoreMaterial'
import { useThemeTransitionSignal } from './theme-transition-context'

interface SentientCoreProps {
  mode: 'baseline' | 'enhanced' | 'feral'
  lowPower: boolean
  initializing: boolean
}

export function SentientCore({ mode, lowPower, initializing }: SentientCoreProps) {
  const meshRef = useRef<Mesh>(null)
  const pointerTarget = useRef(new Vector2())
  const material = useMemo(createCoreMaterial, [])
  const themeSignal = useThemeTransitionSignal()

  useEffect(() => () => material.dispose(), [material])

  useFrame((state, delta) => {
    if (document.hidden) return
    material.uniforms.uTime.value += Math.min(delta, 0.05)
    const intensityTarget = mode === 'baseline' ? 0 : mode === 'enhanced' ? 1 : 1.25
    const feralTarget = mode === 'feral' ? 1 : 0
    material.uniforms.uIntensity.value += (intensityTarget - material.uniforms.uIntensity.value) * Math.min(delta * 2.6, 1)
    material.uniforms.uFeral.value += (feralTarget - material.uniforms.uFeral.value) * Math.min(delta * 2.1, 1)
    material.uniforms.uBoot.value += ((initializing ? 1 : 0) - material.uniforms.uBoot.value) * Math.min(delta * 5.8, 1)
    const { blend, pulse, lightArrival } = themeSignal.current
    material.uniforms.uLightTheme.value = blend
    material.uniforms.uThemeShift.value = pulse
    material.uniforms.uThemeRise.value = lightArrival
    pointerTarget.current.set(state.pointer.x, state.pointer.y)
    material.uniforms.uPointer.value.lerp(pointerTarget.current, 0.035)
    material.uniforms.uCameraPosition.value.copy(state.camera.position)
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.085
      meshRef.current.rotation.x = state.pointer.y * 0.045
      meshRef.current.rotation.z = state.pointer.x * 0.025
      const scaleTarget = 1 + blend * 0.02 + pulse * 0.018
      const scale = meshRef.current.scale.x + (scaleTarget - meshRef.current.scale.x) * Math.min(delta * 3.2, 1)
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={meshRef} position={[0.36, 0.04, 0]} scale={1}>
      <sphereGeometry args={[1.35, mode === 'baseline' ? (lowPower ? 72 : 96) : (lowPower ? 96 : 128), mode === 'baseline' ? (lowPower ? 54 : 72) : (lowPower ? 72 : 96)]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
