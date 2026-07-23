import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type PointsMaterial } from 'three'
import { useThemeTransitionSignal } from './theme-transition-context'

const darkFieldColor = new Color('#706b68')
const lightFieldColor = new Color('#9a8270')

export function BackgroundField({ lowPower }: { lowPower: boolean }) {
  const materialRef = useRef<PointsMaterial>(null)
  const themeSignal = useThemeTransitionSignal()
  const targetColor = useRef(new Color())
  const count = lowPower ? 96 : 180
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) {
      values[index * 3] = (Math.random() - 0.5) * 20
      values[index * 3 + 1] = (Math.random() - 0.5) * 12
      values[index * 3 + 2] = -5 - Math.random() * 7
    }
    return values
  }, [count])
  useFrame(() => {
    if (document.hidden) return
    if (materialRef.current) {
      const { blend, pulse } = themeSignal.current
      materialRef.current.color.copy(targetColor.current.lerpColors(darkFieldColor, lightFieldColor, blend))
      materialRef.current.opacity = 0.32 - blend * 0.02 + pulse * 0.035
      materialRef.current.size = 0.018 - blend * 0.002 + pulse * 0.003
    }
  })
  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial ref={materialRef} color="#706b68" size={0.018} transparent opacity={0.32} depthWrite={false} />
    </points>
  )
}
