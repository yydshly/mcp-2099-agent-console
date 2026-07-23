import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector2, type Mesh } from 'three'
import { createCoreMaterial } from './CoreMaterial'

export function SentientCore() {
  const meshRef = useRef<Mesh>(null)
  const material = useMemo(createCoreMaterial, [])

  useEffect(() => () => material.dispose(), [material])

  useFrame((state, delta) => {
    if (document.hidden) return
    material.uniforms.uTime.value += Math.min(delta, 0.05)
    material.uniforms.uPointer.value.lerp(new Vector2(state.pointer.x, state.pointer.y), 0.035)
    material.uniforms.uCameraPosition.value.copy(state.camera.position)
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.085
      meshRef.current.rotation.x = state.pointer.y * 0.045
      meshRef.current.rotation.z = state.pointer.x * 0.025
    }
  })

  return (
    <mesh ref={meshRef} position={[0.36, 0.04, 0]}>
      <sphereGeometry args={[1.35, 96, 72]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
