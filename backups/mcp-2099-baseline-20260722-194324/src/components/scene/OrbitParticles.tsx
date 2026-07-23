import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type BufferAttribute, type Points } from 'three'

const particleCount = 420

export function OrbitParticles() {
  const pointsRef = useRef<Points>(null)
  const geometry = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const baseColors = new Float32Array(particleCount * 3)
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.45 + Math.random() * 1.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[index * 3] = Math.sin(phi) * Math.cos(theta) * radius + 0.36
      positions[index * 3 + 1] = Math.cos(phi) * radius
      positions[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
      const warmth = Math.random() > 0.9
      colors[index * 3] = warmth ? 1 : 0.72
      colors[index * 3 + 1] = warmth ? 0.3 : 0.72
      colors[index * 3 + 2] = warmth ? 0.02 : 0.72
      baseColors[index * 3] = colors[index * 3]
      baseColors[index * 3 + 1] = colors[index * 3 + 1]
      baseColors[index * 3 + 2] = colors[index * 3 + 2]
    }
    return { positions, colors, baseColors }
  }, [])

  useFrame((state, delta) => {
    if (!document.hidden && pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.018
      pointsRef.current.rotation.x -= delta * 0.006
      const pointerX = state.pointer.x * 3 + 0.36
      const pointerY = state.pointer.y * 2.2
      const colorAttribute = pointsRef.current.geometry.getAttribute('color') as BufferAttribute
      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3
        const distance = Math.hypot(geometry.positions[offset] - pointerX, geometry.positions[offset + 1] - pointerY)
        const activation = Math.max(0, 1 - distance / 1.55) ** 2
        geometry.colors[offset] = Math.min(1, geometry.baseColors[offset] + activation * 0.28)
        geometry.colors[offset + 1] = Math.min(1, geometry.baseColors[offset + 1] + activation * 0.37)
        geometry.colors[offset + 2] = Math.min(1, geometry.baseColors[offset + 2] + activation * 0.32)
      }
      colorAttribute.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geometry.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[geometry.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.024} vertexColors transparent opacity={0.72} sizeAttenuation depthWrite={false} />
    </points>
  )
}
