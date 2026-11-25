import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Mat, Sign, Bench, Bush, Glow } from './Props'
import NPC, { NPC_LOOKS } from './NPC'
import { BENCHES } from '../../game/layout'
import { LOCATIONS } from '../../config/gameConfig'

function Water({ radius, position, color = '#8fd3f4', shape = 'circle', size }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.material.emissiveIntensity = 0.18 + Math.sin(clock.elapsedTime * 1.5) * 0.06
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      {shape === 'circle' ? <circleGeometry args={[radius, 40]} /> : <planeGeometry args={size} />}
      <meshStandardMaterial color={color} emissive="#c9f1ff" emissiveIntensity={0.2} roughness={0.15} metalness={0.1} transparent opacity={0.92} />
    </mesh>
  )
}

function Ripples({ position, count = 3, max = 2 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.children.forEach((m, i) => {
      const t = (clock.elapsedTime * 0.35 + i / count) % 1
      m.scale.setScalar(0.2 + t * max)
      m.material.opacity = (1 - t) * 0.5
    })
  })
  return (
    <group ref={ref} position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function Fountain({ position }) {
  const drops = useRef()
  const N = 60
  const seeds = useMemo(() => Array.from({ length: N }).map((_, i) => ({ a: (i / N) * Math.PI * 2, ph: Math.random(), sp: 0.8 + Math.random() * 0.4 })), [])
  const m = useMemo(() => new THREE.Matrix4(), [])
  useFrame(({ clock }) => {
    if (!drops.current) return
    const t = clock.elapsedTime
    seeds.forEach((s, i) => {
      const k = (t * 0.7 * s.sp + s.ph) % 1
      const r = k * 1.15
      const y = 2.35 + k * 1.6 - k * k * 3.4
      m.makeTranslation(Math.cos(s.a) * r, Math.max(y, 0.55), Math.sin(s.a) * r)
      drops.current.setMatrixAt(i, m)
    })
    drops.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[2.5, 2.6, 0.6, 28]} />
        <Mat color="#fff6e9" />
      </mesh>
      <mesh position={[0, 0.61, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.45, 0.12, 8, 36]} />
        <Mat color="#f7c6d9" />
      </mesh>
      <Water radius={2.3} position={[0, 0.55, 0]} />
      <Ripples position={[0, 0.57, 0]} max={2} />
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 1.4, 14]} />
        <Mat color="#fff6e9" />
      </mesh>
      <mesh castShadow position={[0, 1.95, 0]}>
        <cylinderGeometry args={[1.0, 0.5, 0.3, 20]} />
        <Mat color="#c8b6f2" />
      </mesh>
      <mesh position={[0, 2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.92, 24]} />
        <meshStandardMaterial color="#8fd3f4" emissive="#c9f1ff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <sphereGeometry args={[0.2, 12, 10]} />
        <Mat color="#f7a8c4" />
      </mesh>
      <instancedMesh ref={drops} args={[null, null, N]}>
        <sphereGeometry args={[0.06, 6, 5]} />
        <meshStandardMaterial color="#d9f4ff" emissive="#bfeaff" emissiveIntensity={0.5} transparent opacity={0.85} />
      </instancedMesh>
    </group>
  )
}

function Duck({ position }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.position.y = 0.12 + Math.sin(t * 2) * 0.03
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.6
  })
  return (
    <group ref={ref} position={position}>
      <mesh castShadow scale={[1, 0.75, 1.3]}><sphereGeometry args={[0.28, 14, 12]} /><Mat color="#ffe14d" rough={0.4} /></mesh>
      <mesh castShadow position={[0, 0.3, 0.2]}><sphereGeometry args={[0.18, 14, 12]} /><Mat color="#ffe14d" rough={0.4} /></mesh>
      <mesh position={[0, 0.28, 0.38]} scale={[1, 0.4, 1]}><sphereGeometry args={[0.08, 8, 6]} /><Mat color="#ff9a3c" /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.08, 0.35, 0.34]}><sphereGeometry args={[0.025, 6, 5]} /><meshBasicMaterial color="#2b2030" /></mesh>)}
    </group>
  )
}

function Pond({ position, radius }) {
  const rocks = useMemo(() => Array.from({ length: 26 }).map((_, i) => {
    const a = (i / 26) * Math.PI * 2
    return [Math.cos(a) * (radius + 0.15), Math.sin(a) * (radius + 0.15), 0.22 + ((i * 7) % 5) * 0.05, i]
  }), [radius])
  return (
    <group position={position}>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius + 0.3, 40]} />
        <Mat color="#e8d6b8" />
      </mesh>
      <Water radius={radius} position={[0, 0.06, 0]} color="#88cdf0" />
      <Ripples position={[1.2, 0.08, -0.8]} max={1.2} />
      {rocks.map(([x, z, s, i]) => (
        <mesh key={i} castShadow position={[x, 0.08, z]} scale={[s * 1.4, s, s * 1.2]} rotation={[0, i, 0]}>
          <dodecahedronGeometry args={[1, 0]} />
          <Mat color={i % 3 ? '#e7e1ee' : '#d6cde3'} flat />
        </mesh>
      ))}
      {[[-1.5, 0.5], [1.4, 1.2], [0.4, -1.8], [-0.8, -1.1], [2, -0.5]].map(([x, z], i) => (
        <group key={i} position={[x, 0.08, z]}>
          <mesh rotation={[-Math.PI / 2, 0, i]}><circleGeometry args={[0.35, 12, 0, Math.PI * 1.8]} /><Mat color="#7cc98f" side={THREE.DoubleSide} /></mesh>
          {i % 2 === 0 && <mesh position={[0.05, 0.08, 0]}><sphereGeometry args={[0.09, 8, 6]} /><Mat color="#ff9cc2" /></mesh>}
        </group>
      ))}
      {[[-3.2, 2.6], [-3.6, 1.8], [3.3, -2.4]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[k * 0.12 - 0.12, 0.45, (k % 2) * 0.1]} rotation={[0, 0, (k - 1) * 0.15]}>
              <cylinderGeometry args={[0.025, 0.03, 0.9, 5]} />
              <Mat color="#7cc98f" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Creek() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0.005, -27]}>
        <planeGeometry args={[27.5, 3.2]} />
        <Mat color="#e8d6b8" />
      </mesh>
      <Water shape="plane" size={[27, 2.5]} position={[1, 0.03, -27]} color="#8fd3f4" />
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={i} castShadow position={[-12 + i * 1.5 + (i % 3) * 0.3, 0.08, -27 + (i % 2 ? 1.35 : -1.35)]} scale={[0.35, 0.2, 0.3]}>
          <dodecahedronGeometry args={[1, 0]} />
          <Mat color="#e7e1ee" flat />
        </mesh>
      ))}
    </group>
  )
}

export function Bridge({ x = 1, z = -27 }) {
  const planks = 11
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: planks }).map((_, i) => {
        const k = i / (planks - 1)
        const zz = -2.2 + k * 4.4
        const y = Math.sin(k * Math.PI) * 0.55
        return (
          <mesh key={i} castShadow receiveShadow position={[0, y + 0.05, zz]} rotation={[Math.cos(k * Math.PI) * -0.35, 0, 0]}>
            <boxGeometry args={[2.4, 0.1, 0.42]} />
            <Mat color={i % 2 ? '#e8b98f' : '#dca97d'} />
          </mesh>
        )
      })}
      {[-1.2, 1.2].map((sx) => (
        <group key={sx}>
          {Array.from({ length: 5 }).map((_, i) => {
            const k = i / 4
            return (
              <mesh key={i} castShadow position={[sx, Math.sin(k * Math.PI) * 0.55 + 0.45, -2.2 + k * 4.4]}>
                <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
                <Mat color="#fff6e9" />
              </mesh>
            )
          })}
          {Array.from({ length: 4 }).map((_, i) => {
            const k1 = i / 4, k2 = (i + 1) / 4
            const y1 = Math.sin(k1 * Math.PI) * 0.55 + 0.85, y2 = Math.sin(k2 * Math.PI) * 0.55 + 0.85
            const z1 = -2.2 + k1 * 4.4, z2 = -2.2 + k2 * 4.4
            return (
              <mesh key={i} position={[sx, (y1 + y2) / 2, (z1 + z2) / 2]} rotation={[-Math.atan2(y2 - y1, z2 - z1), 0, 0]}>
                <boxGeometry args={[0.08, 0.08, Math.hypot(y2 - y1, z2 - z1) + 0.05]} />
                <Mat color="#f7a8c4" />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

function Picnic({ position }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')
    g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 64)
    g.fillStyle = '#ff9cc2'
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) g.fillRect(i * 8, j * 8, 8, 8)
    const t = new THREE.CanvasTexture(c)
    t.magFilter = THREE.NearestFilter
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <group position={position} rotation={[0, 0.3, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[2.6, 2.2]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      <group position={[0.6, 0, -0.4]}>
        <mesh castShadow position={[0, 0.22, 0]}><cylinderGeometry args={[0.3, 0.25, 0.4, 12]} /><Mat color="#d9a982" /></mesh>
        <mesh position={[0, 0.48, 0]} rotation={[0, 0, 0]}><torusGeometry args={[0.24, 0.03, 6, 16, Math.PI]} /><Mat color="#b88a6a" /></mesh>
      </group>
      <mesh position={[-0.5, 0.08, 0.3]}><cylinderGeometry args={[0.25, 0.25, 0.04, 16]} /><Mat color="#fff" /></mesh>
      <mesh position={[-0.5, 0.14, 0.3]} rotation={[0, 0.5, 0]}><boxGeometry args={[0.25, 0.08, 0.25]} /><Mat color="#ffe7a0" /></mesh>
      <mesh position={[0.1, 0.12, 0.5]}><sphereGeometry args={[0.1, 10, 8]} /><Mat color="#ff6b7a" /></mesh>
      <mesh position={[-0.1, 0.2, -0.5]}><cylinderGeometry args={[0.06, 0.07, 0.3, 10]} /><Mat color="#b5ead7" /></mesh>
    </group>
  )
}

function Balloon({ position, color = '#ff9cc2' }) {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) { ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.5) * 0.1; ref.current.rotation.z = Math.sin(clock.elapsedTime) * 0.08 } })
  return (
    <group ref={ref} position={position}>
      <mesh castShadow position={[0, 0.9, 0]} scale={[1, 1.15, 1]}><sphereGeometry args={[0.3, 16, 12]} /><Mat color={color} rough={0.3} /></mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.005, 0.005, 1.0]} /><meshBasicMaterial color="#fff" /></mesh>
    </group>
  )
}

export default function Park() {
  return (
    <group>
      <Fountain position={[1, 0, -8]} />
      <Pond position={[-6, 0, -18]} radius={3.8} />
      <Duck position={[-5, 0.12, -15.6]} />
      <Creek />
      <Bridge />
      <Picnic position={[-8, 0, -4]} />
      {BENCHES.map(([x, z, r], i) => <Bench key={i} position={[x, 0, z]} rotation={r} color={['#f7a8c4', '#c8b6f2', '#a9d6f5'][i]} />)}
      {/* flower beds around fountain */}
      {[[-3.2, -8], [5.2, -8]].map(([x, z]) => (
        <group key={x} position={[x, 0, z - 2.6]}>
          <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.9, 0.95, 0.24, 16]} /><Mat color="#fff6e9" /></mesh>
          <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.8, 0.8, 0.04, 16]} /><Mat color="#b48a6a" /></mesh>
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} position={[Math.cos(i * 0.7) * 0.5 * ((i % 3) / 2 + 0.3), 0.4, Math.sin(i * 0.7) * 0.5 * ((i % 3) / 2 + 0.3)]}>
              <sphereGeometry args={[0.12, 8, 6]} />
              <Mat color={['#ff9cc2', '#ffd36b', '#c8b6f2'][i % 3]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* hedges hiding heart #1 */}
      <Bush position={[9.4, 0, -15.6]} scale={1.2} color="#9fdcbc" />
      <Bush position={[11.7, 0, -13.4]} scale={1.1} color="#9fdcbc" flowers="#c8b6f2" />
      <Bush position={[11.9, 0, -15.8]} scale={1.0} color="#b8e6c9" />
      {/* flowers around key #2 */}
      <Bush position={[-11.6, 0, -19.6]} scale={0.9} flowers="#ffd36b" />
      <Bush position={[-10, 0, -21.8]} scale={0.8} flowers="#ff9cc2" />
      <Bush position={[8.2, 0, -28.6]} scale={0.7} color="#b8e6c9" flowers="#9fd8ff" />
      {/* signs */}
      <Sign position={[3.4, 0, 8]} text={LOCATIONS.park.sign} sub="no frowning allowed" width={2.6} height={0.9} border="#7cc9a6" />
      <Sign position={[-12.4, 0, 4.3]} text="✨ ???" width={1.0} height={0.5} post={0.7} border="#c8b6f2" />
      <Bush position={[-11.8, 0, 5.7]} scale={0.9} />
      <Sign position={[-11.2, 0, -24.7]} rotation={[0, Math.PI, 0]} text="Overthinking HQ" width={1.6} height={0.5} post={0.8} border="#8f74d6" />
      {/* NPCs */}
      <group position={[7, 0, -20]}>
        <NPC id="gardener" position={[0, 0, 0]} rotation={-0.8} {...NPC_LOOKS.gardener} />
        <group position={[0.6, 0, 0.5]}>
          <mesh castShadow position={[0, 0.2, 0]}><cylinderGeometry args={[0.18, 0.2, 0.35, 12]} /><Mat color="#9fd8ff" metal={0.3} rough={0.4} /></mesh>
          <mesh position={[0.22, 0.32, 0]} rotation={[0, 0, -0.9]}><cylinderGeometry args={[0.03, 0.04, 0.35]} /><Mat color="#9fd8ff" /></mesh>
        </group>
      </group>
      <NPC id="kid" position={[-9, 0, 7]} rotation={0.4} {...NPC_LOOKS.kid} />
      <Balloon position={[-8.6, 0.8, 7.2]} />
      <Glow position={[1, 2.6, -8]} color="#bfeaff" size={3} opacity={0.35} />
    </group>
  )
}
