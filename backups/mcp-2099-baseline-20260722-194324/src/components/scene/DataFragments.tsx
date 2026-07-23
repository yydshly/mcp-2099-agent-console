import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, type InstancedMesh } from 'three'

const fragmentCount = 94

export function DataFragments() {
  const meshRef = useRef<InstancedMesh>(null)
  const instances = useMemo(() => {
    const records = Array.from({ length: fragmentCount }, (_, index) => {
      const depth = -4 + Math.random() * 7
      const size = 0.012 + Math.random() * (depth > 0 ? 0.1 : 0.05)
      return {
        position: [(Math.random() - 0.5) * 13, (Math.random() - 0.5) * 8, depth] as const,
        scale: [size * (1 + Math.random() * 3), size, size * 0.35] as const,
        rotation: [Math.random() * 2, Math.random() * 2, Math.random() * 2] as const,
        orange: index % 9 === 0,
      }
    })
    return records
  }, [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = new Object3D()
    instances.forEach((instance, index) => {
      dummy.position.set(...instance.position)
      dummy.scale.set(...instance.scale)
      dummy.rotation.set(...instance.rotation)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
      mesh.setColorAt(index, new Color(instance.orange ? '#ff6c00' : '#d0d0d0'))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [instances])

  useFrame((state) => {
    if (document.hidden || !meshRef.current) return
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.05
    meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.06) * 0.025
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, fragmentCount]}>
      <boxGeometry args={[1, 1, 0.2]} />
      <meshBasicMaterial vertexColors transparent opacity={0.42} toneMapped={false} />
    </instancedMesh>
  )
}
