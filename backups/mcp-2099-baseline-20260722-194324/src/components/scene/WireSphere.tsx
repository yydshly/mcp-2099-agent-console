import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Mesh } from 'three'

export function WireSphere() {
  const meshRef = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (!document.hidden && meshRef.current) meshRef.current.rotation.y -= delta * 0.04
  })
  return (
    <mesh ref={meshRef} position={[0.36, 0.04, 0]} rotation={[0.16, 0.2, 0.08]}>
      <sphereGeometry args={[2.34, 42, 30]} />
      <meshBasicMaterial color="#8b8b8b" transparent opacity={0.13} wireframe />
    </mesh>
  )
}
