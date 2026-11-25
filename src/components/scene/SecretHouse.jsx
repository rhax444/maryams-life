import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Mat, Sign, FenceLine, Glow, Bush } from './Props'
import { useGame } from '../../store/useGame'

const GOLD = { color: '#ffd54a', metal: 0.7, rough: 0.25 }

function GateLeaf({ hingeZ, dir, open }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (!ref.current) return
    const target = open ? dir * -1.7 : 0
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, target, Math.min(1, dt * 1.6))
  })
  return (
    <group ref={ref} position={[-18, 0, hingeZ]}>
      <group position={[0, 0, dir * 0.5]}>
        <mesh castShadow position={[0, 1.55, 0]}><boxGeometry args={[0.1, 0.1, 1]} /><Mat {...GOLD} /></mesh>
        <mesh castShadow position={[0, 0.2, 0]}><boxGeometry args={[0.1, 0.1, 1]} /><Mat {...GOLD} /></mesh>
        {[-0.35, -0.12, 0.12, 0.35].map((z) => (
          <mesh key={z} castShadow position={[0, 0.9, z]}><cylinderGeometry args={[0.035, 0.035, 1.4, 6]} /><Mat {...GOLD} /></mesh>
        ))}
        <mesh position={[0, 1.8, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.3, 0.04, 8, 16, Math.PI]} /><Mat {...GOLD} /></mesh>
        <mesh position={[0, 0.95, -dir * 0.1]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.18, 0.03, 8, 16]} /><Mat color="#ff9cc2" /></mesh>
      </group>
    </group>
  )
}

function Padlock({ keys, unlocked }) {
  const ref = useRef()
  useFrame(({ clock }, dt) => {
    if (!ref.current) return
    if (unlocked) {
      ref.current.position.y += dt * 1.5
      ref.current.rotation.x += dt * 4
      ref.current.scale.multiplyScalar(Math.max(0, 1 - dt * 1.2))
    } else {
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.08
    }
  })
  return (
    <group ref={ref} position={[-17.8, 1.0, -26]}>
      <mesh castShadow><boxGeometry args={[0.2, 0.5, 0.55]} /><Mat {...GOLD} /></mesh>
      <mesh position={[0, 0.33, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.17, 0.045, 8, 16, Math.PI]} /><Mat color="#d8d8e0" metal={0.8} rough={0.2} /></mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.11, -0.05, -0.15 + i * 0.15]}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshStandardMaterial color={keys[i] ? '#fff27a' : '#6b5bb5'} emissive={keys[i] ? '#ffcf33' : '#000'} emissiveIntensity={keys[i] ? 1.5 : 0} />
        </mesh>
      ))}
    </group>
  )
}

function GlowPath({ unlocked }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.children.forEach((m, i) => {
      m.material.emissiveIntensity = unlocked ? 0.6 + Math.max(0, Math.sin(t * 4 - i * 0.8)) * 1.6 : 0.05
    })
  })
  return (
    <group ref={ref}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-18.9 - i * 0.82, 0.04, -26 + Math.sin(i * 0.9) * 0.15]}>
          <circleGeometry args={[0.34, 6]} />
          <meshStandardMaterial color="#fff6d6" emissive="#ffcf6b" emissiveIntensity={0.05} />
        </mesh>
      ))}
    </group>
  )
}

function Door({ open }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, open ? 1.9 : 0, Math.min(1, dt * 1.2))
  })
  return (
    <group position={[-24.95, 0, -25.4]}>
      <group ref={ref}>
        <mesh castShadow position={[0.04, 1.1, -0.6]}>
          <boxGeometry args={[0.1, 2.2, 1.2]} />
          <Mat color="#f07aa8" />
        </mesh>
        <mesh position={[0.1, 1.1, -1.0]}><sphereGeometry args={[0.07, 8, 6]} /><Mat {...GOLD} /></mesh>
        <mesh position={[0.1, 1.65, -0.6]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.2, 16]} />
          <meshStandardMaterial color="#fff6d6" emissive="#ffcf6b" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  )
}

export default function SecretHouse() {
  const keys = useGame((s) => s.keys)
  const unlocked = useGame((s) => s.unlocked)
  const fence = '#c8b6f2'
  return (
    <group>
      {/* fence */}
      <FenceLine from={[-36, -36]} to={[-18, -36]} color={fence} />
      <FenceLine from={[-36, -16]} to={[-18, -16]} color={fence} />
      <FenceLine from={[-36, -36]} to={[-36, -16]} color={fence} />
      <FenceLine from={[-18, -36]} to={[-18, -27]} color={fence} />
      <FenceLine from={[-18, -25]} to={[-18, -16]} color={fence} />
      {/* gate pillars */}
      {[-27.2, -24.8].map((z) => (
        <group key={z} position={[-18, 0, z]}>
          <mesh castShadow position={[0, 1.1, 0]}><boxGeometry args={[0.4, 2.2, 0.4]} /><Mat color="#e6dcff" /></mesh>
          <mesh position={[0, 2.35, 0]}><sphereGeometry args={[0.22, 12, 10]} /><meshStandardMaterial color="#fff6d6" emissive="#ffcf6b" emissiveIntensity={1} /></mesh>
        </group>
      ))}
      <GateLeaf hingeZ={-27} dir={1} open={unlocked} />
      <GateLeaf hingeZ={-25} dir={-1} open={unlocked} />
      <Padlock keys={keys} unlocked={unlocked} />
      <GlowPath unlocked={unlocked} />
      {/* the house */}
      <group position={[-29, 0, -26]}>
        <mesh castShadow receiveShadow position={[0, 2.1, 0]}>
          <boxGeometry args={[8, 4.2, 10]} />
          <Mat color="#e6dcff" />
        </mesh>
        <mesh position={[0, 0.2, 0]}><boxGeometry args={[8.3, 0.4, 10.3]} /><Mat color="#fff6e9" /></mesh>
        <group position={[0, 5.6, 0]} scale={[6.6, 1, 8.1]}>
          <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1, 2.8, 4, 1]} />
            <Mat color="#6b5bb5" flat />
          </mesh>
        </group>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i} position={[Math.cos(i * 2.4) * (1 + (i % 4) * 0.9), 4.6 + (i % 3) * 0.45, Math.sin(i * 2.4) * (1.2 + (i % 4) * 1.1)]}>
            <octahedronGeometry args={[0.08]} />
            <meshStandardMaterial color="#fff6a8" emissive="#ffe27a" emissiveIntensity={1.4} />
          </mesh>
        ))}
        <mesh castShadow position={[-2, 5.5, 2.5]}><cylinderGeometry args={[0.35, 0.4, 1.6, 10]} /><Mat color="#f7a8c4" /></mesh>
        {/* round glowing windows (east face) */}
        {[-3, 3].map((z) => (
          <group key={z} position={[4.02, 2.4, z]} rotation={[0, Math.PI / 2, 0]}>
            <mesh><torusGeometry args={[0.55, 0.08, 8, 24]} /><Mat color="#fff6e9" /></mesh>
            <mesh><circleGeometry args={[0.52, 24]} /><meshStandardMaterial color="#ffe9a8" emissive="#ffc46b" emissiveIntensity={unlocked ? 1.2 : 0.35} /></mesh>
          </group>
        ))}
        {/* door frame */}
        <mesh position={[4.02, 1.2, 0]}><boxGeometry args={[0.1, 2.5, 1.5]} /><Mat color="#fff6e9" /></mesh>
        <mesh position={[4.06, 1.1, 0]}><boxGeometry args={[0.04, 2.2, 1.2]} /><meshStandardMaterial color="#3a2a4a" emissive="#ffcf6b" emissiveIntensity={unlocked ? 0.9 : 0} /></mesh>
        <mesh position={[4.04, 2.6, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.65, 0.08, 8, 20, Math.PI]} /><Mat color="#fff6e9" /></mesh>
      </group>
      <Door open={unlocked} />
      {unlocked && <Glow position={[-24.4, 1.2, -26]} color="#ffcf6b" size={3.5} opacity={0.7} />}
      <Sparkles count={30} scale={[10, 6, 12]} position={[-29, 4, -26]} size={6} speed={0.3} color="#fff3b0" />
      <Sign position={[-15.8, 0, -23.4]} rotation={[0, Math.PI / 2, 0]} text="Secret House" emoji={unlocked ? '🔓' : '🔒'} sub={unlocked ? 'come in!' : 'needs 3 golden keys'} width={2.4} height={0.9} border="#8f74d6" />
      {[[-34, -18], [-20, -34], [-34, -34], [-21, -18.5]].map(([x, z], i) => <Bush key={i} position={[x, 0, z]} color="#cbb9f2" flowers="#fff6a8" />)}
    </group>
  )
}
