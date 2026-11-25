import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '../../store/useGame'
import { Sky, Lighting } from './Environment'
import Town from './Town'
import SecretRoom from './SecretRoom'
import Player from './Player'
import CameraRig from './CameraRig'

export default function GameCanvas({ onReady }) {
  const quality = useGame((s) => s.quality)
  const scene = useGame((s) => s.scene)
  const setQuality = useGame((s) => s.setQuality)
  const notify = useGame((s) => s.notify)
  const high = quality === 'high'
  const secret = scene === 'secret'

  return (
    <Canvas
      shadows={high}
      dpr={high ? [1, 1.75] : [0.75, 1]}
      camera={{ fov: 50, near: 0.1, far: 900, position: [50, 36, 50] }}
      gl={{ antialias: high, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1.0 }}
      onCreated={() => onReady?.()}
      style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
    >
      <PerformanceMonitor
        flipflops={3}
        onFallback={() => {
          if (useGame.getState().quality === 'high') {
            setQuality('low')
            notify('Performance mode on', 'Switched to lighter graphics for smoother play', '⚡')
          }
        }}
      />
      <AdaptiveDpr pixelated={false} />
      {secret ? <fog attach="fog" args={['#3a2a4f', 14, 60]} /> : <fog attach="fog" args={['#fbe3ee', 95, 230]} />}
      {secret ? <Sky top="#2b2148" mid="#4a3366" bottom="#6b4a7a" /> : <Sky />}
      <Lighting interior={secret} />
      <Suspense fallback={null}>{secret ? <SecretRoom /> : <Town />}</Suspense>
      <Player />
      <CameraRig />
    </Canvas>
  )
}
