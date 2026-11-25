import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '../../store/useGame'
import { HEART_SPOTS, KEY_SPOTS, INTERACTABLES_TOWN, INTERACTABLES_SECRET } from '../../game/layout'
import { Glow, useTextTexture } from './Props'

export function useHeartGeometry(depth = 0.25) {
  return useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, -0.5)
    s.bezierCurveTo(-0.1, -0.35, -0.6, -0.1, -0.6, 0.2)
    s.bezierCurveTo(-0.6, 0.5, -0.25, 0.65, 0, 0.38)
    s.bezierCurveTo(0.25, 0.65, 0.6, 0.5, 0.6, 0.2)
    s.bezierCurveTo(0.6, -0.1, 0.1, -0.35, 0, -0.5)
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4, curveSegments: 16 })
    g.center()
    return g
  }, [depth])
}

function Burst({ color, onDone }) {
  const ref = useRef()
  const ring = useRef()
  const t = useRef(0)
  const parts = useMemo(() => Array.from({ length: 22 }).map(() => {
    const a = Math.random() * Math.PI * 2
    return new THREE.Vector3(Math.cos(a) * (1 + Math.random() * 2), 2 + Math.random() * 3, Math.sin(a) * (1 + Math.random() * 2))
  }), [])
  useFrame((_, dt) => {
    t.current += dt
    const k = t.current
    if (ref.current) ref.current.children.forEach((m, i) => {
      const v = parts[i]
      m.position.set(v.x * k, 1 + v.y * k - 4 * k * k, v.z * k)
      m.scale.setScalar(Math.max(0.001, 1 - k / 1.3))
    })
    if (ring.current) { ring.current.scale.setScalar(1 + k * 5); ring.current.material.opacity = Math.max(0, 0.8 - k) }
    if (k > 1.3) onDone()
  })
  return (
    <group>
      <group ref={ref}>
        {parts.map((_, i) => (
          <mesh key={i}>
            <octahedronGeometry args={[0.09]} />
            <meshStandardMaterial color={i % 2 ? color : '#ffffff'} emissive={color} emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Heart({ position, collected }) {
  const ref = useRef()
  const geo = useHeartGeometry()
  const [burst, setBurst] = useState(false)
  const was = useRef(collected)
  useEffect(() => { if (collected && !was.current) setBurst(true); was.current = collected }, [collected])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.rotation.y = t * 1.6
    ref.current.position.y = 1 + Math.sin(t * 2.2) * 0.15
  })
  return (
    <group position={[position.x, 0, position.z]}>
      {!collected && (
        <>
          <group ref={ref}>
            <mesh geometry={geo} scale={0.55} rotation={[0, 0, 0]} castShadow>
              <meshStandardMaterial color="#ff6fa3" emissive="#ff3d86" emissiveIntensity={0.6} roughness={0.3} />
            </mesh>
          </group>
          <Glow position={[0, 1, 0]} color="#ff9cc2" size={2.2} opacity={0.55} />
          <Sparkles count={12} scale={[1.6, 2, 1.6]} position={[0, 1, 0]} size={4} speed={0.6} color="#ffd6e6" />
        </>
      )}
      {burst && <Burst color="#ff6fa3" onDone={() => setBurst(false)} />}
    </group>
  )
}

export function KeyModel() {
  const gold = <meshStandardMaterial color="#ffd54a" metalness={0.8} roughness={0.22} emissive="#ffb300" emissiveIntensity={0.35} />
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow position={[0, 0.32, 0]}>
        <torusGeometry args={[0.17, 0.06, 10, 24]} />
        {gold}
      </mesh>
      <mesh position={[0, 0.32, 0]}><sphereGeometry args={[0.07, 10, 8]} /><meshStandardMaterial color="#ff9cc2" emissive="#ff6fa3" emissiveIntensity={0.5} /></mesh>
      <mesh castShadow position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.6, 10]} />
        {gold}
      </mesh>
      <mesh castShadow position={[0.09, -0.25, 0]}><boxGeometry args={[0.14, 0.06, 0.06]} />{gold}</mesh>
      <mesh castShadow position={[0.07, -0.13, 0]}><boxGeometry args={[0.1, 0.06, 0.06]} />{gold}</mesh>
    </group>
  )
}

function GoldenKey({ position, collected }) {
  const ref = useRef()
  const beam = useRef()
  const [burst, setBurst] = useState(false)
  const was = useRef(collected)
  useEffect(() => { if (collected && !was.current) setBurst(true); was.current = collected }, [collected])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ref.current) {
      ref.current.rotation.y = t * 2
      ref.current.position.y = 1 + Math.sin(t * 2.6) * 0.12
    }
    if (beam.current) beam.current.material.opacity = 0.1 + Math.sin(t * 2) * 0.04
  })
  return (
    <group position={[position.x, 0, position.z]}>
      {!collected && (
        <>
          <group ref={ref} scale={1.3}>
            <KeyModel />
          </group>
          <mesh ref={beam} position={[0, 4, 0]}>
            <cylinderGeometry args={[0.25, 0.45, 8, 16, 1, true]} />
            <meshBasicMaterial color="#ffe27a" transparent opacity={0.12} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
          <Glow position={[0, 1, 0]} color="#ffd54a" size={2} opacity={0.6} />
          <Sparkles count={14} scale={[1.4, 2.4, 1.4]} position={[0, 1.1, 0]} size={4} speed={0.5} color="#fff3b0" />
        </>
      )}
      {burst && <Burst color="#ffd54a" onDone={() => setBurst(false)} />}
    </group>
  )
}

export default function Collectibles() {
  const hearts = useGame((s) => s.hearts)
  const keys = useGame((s) => s.keys)
  return (
    <group>
      {HEART_SPOTS.map((p, i) => <Heart key={'h' + i} position={p} collected={hearts[i]} />)}
      {KEY_SPOTS.map((p, i) => <GoldenKey key={'k' + i} position={p} collected={keys[i]} />)}
    </group>
  )
}

// Bouncing "E" marker over whatever the player can interact with
export function InteractMarker() {
  const nearby = useGame((s) => s.nearby)
  const scene = useGame((s) => s.scene)
  const busy = useGame((s) => !!s.dialog || !!s.panel || s.phase !== 'playing')
  const ref = useRef()
  const tex = useTextTexture('E', { w: 128, h: 128, size: 76, bg: '#ffffff', border: '#8f74d6', color: '#8f74d6' })
  const it = useMemo(() => [...INTERACTABLES_TOWN, ...INTERACTABLES_SECRET].find((i) => i.id === nearby), [nearby])
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = (it?.kind === 'gift' ? 2.4 : 2.5) + Math.sin(clock.elapsedTime * 4) * 0.1
    }
  })
  if (!it || busy) return null
  if ((scene === 'secret') !== (it.kind === 'gift')) return null
  const pos = it.kind === 'gift' ? [0, 0, -2.5] : [it.x, 0, it.z]
  return (
    <group position={pos}>
      <sprite ref={ref} scale={[0.5, 0.5, 0.5]} position={[0, 2.5, 0]}>
        <spriteMaterial map={tex} transparent depthTest={false} />
      </sprite>
    </group>
  )
}
