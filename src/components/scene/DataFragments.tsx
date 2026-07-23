import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, type InstancedMesh } from 'three'
import { useThemeTransitionSignal } from './theme-transition-context'

const fragmentCount = 94
const neutralDark = new Color('#d0d0d0')
const neutralLight = new Color('#8a776a')
const orangeDark = new Color('#ff6c00')
const orangeLight = new Color('#e45a13')

export function DataFragments({ lowPower }: { lowPower: boolean }) {
  const meshRef = useRef<InstancedMesh>(null)
  const themeSignal = useThemeTransitionSignal()
  const previousColorBlend = useRef(Number.NaN)
  const neutralColor = useRef(new Color())
  const orangeColor = useRef(new Color())
  const count = lowPower ? 56 : fragmentCount
  const instances = useMemo(() => {
    const records = Array.from({ length: count }, (_, index) => {
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
  }, [count])

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
      mesh.setColorAt(index, instance.orange ? orangeDark : neutralDark)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [instances])

  useFrame((state) => {
    if (document.hidden || !meshRef.current) return
    const { blend, pulse } = themeSignal.current
    const neutral = neutralColor.current.lerpColors(neutralDark, neutralLight, blend)
    const orange = orangeColor.current.lerpColors(orangeDark, orangeLight, blend)
    const colorsChanged = !Number.isFinite(previousColorBlend.current) || Math.abs(blend - previousColorBlend.current) > 0.0005
    if (colorsChanged) {
      instances.forEach((instance, index) => meshRef.current?.setColorAt(index, instance.orange ? orange : neutral))
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
      previousColorBlend.current = blend
    }
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.05 + pulse * Math.sin(state.clock.elapsedTime * 3.6) * 0.045
    meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.06) * 0.025 + pulse * Math.cos(state.clock.elapsedTime * 2.8) * 0.025
    meshRef.current.scale.setScalar(1 + pulse * (0.014 + Math.sin(state.clock.elapsedTime * 4.0) * 0.008))
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 0.2]} />
      <meshBasicMaterial color="#ffffff" vertexColors transparent opacity={0.42} toneMapped={false} />
    </instancedMesh>
  )
}
