import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type Mesh, type MeshBasicMaterial } from 'three'
import { useThemeTransitionSignal } from './theme-transition-context'

const darkWireColor = new Color('#8b8b8b')
const lightWireColor = new Color('#8c7665')

export function WireSphere({ lowPower }: { lowPower: boolean }) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  const themeSignal = useThemeTransitionSignal()
  const targetColor = useRef(new Color())
  useFrame((_, delta) => {
    if (!document.hidden && meshRef.current) {
      meshRef.current.rotation.y -= delta * 0.04
      if (materialRef.current) {
        const { blend, pulse } = themeSignal.current
        materialRef.current.color.copy(targetColor.current.lerpColors(darkWireColor, lightWireColor, blend))
        materialRef.current.opacity = 0.13 - blend * 0.01 + pulse * 0.055
        meshRef.current.scale.setScalar(1 + pulse * 0.018)
      }
    }
  })
  return (
    <mesh ref={meshRef} position={[0.36, 0.04, 0]} rotation={[0.16, 0.2, 0.08]}>
      <sphereGeometry args={[2.34, lowPower ? 30 : 42, lowPower ? 22 : 30]} />
      <meshBasicMaterial ref={materialRef} color="#8b8b8b" transparent opacity={0.13} wireframe />
    </mesh>
  )
}
