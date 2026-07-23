import { useMemo } from 'react'

export function BackgroundField() {
  const positions = useMemo(() => {
    const values = new Float32Array(180 * 3)
    for (let index = 0; index < 180; index += 1) {
      values[index * 3] = (Math.random() - 0.5) * 20
      values[index * 3 + 1] = (Math.random() - 0.5) * 12
      values[index * 3 + 2] = -5 - Math.random() * 7
    }
    return values
  }, [])
  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color="#706b68" size={0.018} transparent opacity={0.32} depthWrite={false} />
    </points>
  )
}
