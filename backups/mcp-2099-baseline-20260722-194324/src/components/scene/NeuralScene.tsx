import { Canvas } from '@react-three/fiber'
import { DataFragments } from './DataFragments'
import { BackgroundField } from './BackgroundField'
import { OrbitParticles } from './OrbitParticles'
import { SentientCore } from './SentientCore'
import { WireSphere } from './WireSphere'

export function NeuralScene() {
  return (
    <div className="neural-scene" aria-label="Animated three dimensional sentient core">
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 7.1], fov: 42 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#050505']} />
        <BackgroundField />
        <DataFragments />
        <WireSphere />
        <OrbitParticles />
        <SentientCore />
      </Canvas>
    </div>
  )
}
