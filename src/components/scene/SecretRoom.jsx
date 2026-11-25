import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Mat, Glow, useTextTexture } from './Props'
import { useHeartGeometry, InteractMarker } from './Collectibles'
import { useGame } from '../../store/useGame'
import { FRIEND_NAME } from '../../config/gameConfig'

const PASTELS = ['#ff9cc2', '#ffd36b', '#c8b6f2', '#9fd8ff', '#b5ead7', '#ffffff', '#ffb98a']

function FloatingHearts({ count = 26, area = 6, burst = false }) {
  const ref = useRef()
  const geo = useHeartGeometry(0.15)
  const data = useMemo(() => Array.from({ length: count }).map(() => ({
    x: (Math.random() * 2 - 1) * area, z: (Math.random() * 2 - 1) * area - 1, ph: Math.random(), sp: 0.05 + Math.random() * 0.07, s: 0.12 + Math.random() * 0.18, rot: Math.random() * 6,
  })), [count, area])
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const e = useMemo(() => new THREE.Euler(), [])
  const p = useMemo(() => new THREE.Vector3(), [])
  const sc = useMemo(() => new THREE.Vector3(), [])
  useLayoutEffect(() => {
    const c = new THREE.Color()
    data.forEach((_, i) => ref.current.setColorAt(i, c.set(['#ff6fa3', '#ff9cc2', '#ffb3cf', '#e5739d'][i % 4])))
    ref.current.instanceColor.needsUpdate = true
  }, [data])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    data.forEach((d, i) => {
      const k = (t * d.sp + d.ph) % 1
      p.set(d.x + Math.sin(t + i) * 0.3, 0.3 + k * 5, d.z)
      e.set(0, t * 0.8 + d.rot, Math.sin(t + i) * 0.2)
      q.setFromEuler(e)
      const fade = Math.sin(k * Math.PI)
      sc.setScalar(d.s * fade)
      m.compose(p, q, sc)
      ref.current.setMatrixAt(i, m)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[geo, null, count]}>
      <meshStandardMaterial emissive="#ff3d86" emissiveIntensity={0.5} roughness={0.4} />
    </instancedMesh>
  )
}

// Hearts + confetti that explode out of the gift
function GiftBurst() {
  const confetti = useRef()
  const hearts = useRef()
  const t0 = useRef(null)
  const heartGeo = useHeartGeometry(0.15)
  const N = 160, H = 30
  const parts = useMemo(() => Array.from({ length: N }).map(() => {
    const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3.2
    return { v: new THREE.Vector3(Math.cos(a) * s, 4 + Math.random() * 5, Math.sin(a) * s), r: new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8) }
  }), [])
  const hp = useMemo(() => Array.from({ length: H }).map(() => {
    const a = Math.random() * Math.PI * 2
    return { v: new THREE.Vector3(Math.cos(a) * (0.5 + Math.random()), 1 + Math.random() * 1.2, Math.sin(a) * (0.5 + Math.random())), ph: Math.random() * 6, s: 0.18 + Math.random() * 0.2 }
  }), [])
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const e = useMemo(() => new THREE.Euler(), [])
  const p = useMemo(() => new THREE.Vector3(), [])
  const sc = useMemo(() => new THREE.Vector3(), [])
  useLayoutEffect(() => {
    const c = new THREE.Color()
    parts.forEach((_, i) => confetti.current.setColorAt(i, c.set(PASTELS[i % PASTELS.length])))
    confetti.current.instanceColor.needsUpdate = true
  }, [parts])
  useFrame(({ clock }) => {
    if (t0.current === null) t0.current = clock.elapsedTime
    const t = clock.elapsedTime - t0.current - 0.8
    parts.forEach((d, i) => {
      const k = Math.max(0, t)
      const y = 1.2 + d.v.y * k - 4.5 * k * k
      // after landing, confetti flutters down slowly
      const slow = Math.max(0, y)
      p.set(d.v.x * Math.min(k, 2.2) * 0.8, k === 0 ? 1.2 : Math.max(0.15, slow > 0.15 ? y : 0.15), -2.5 + d.v.z * Math.min(k, 2.2) * 0.8)
      e.set(d.r.x * k, d.r.y * k, d.r.z * k)
      q.setFromEuler(e)
      sc.set(1, 1, 1).multiplyScalar(k === 0 ? 0.001 : 1)
      m.compose(p, q, sc)
      confetti.current.setMatrixAt(i, m)
    })
    confetti.current.instanceMatrix.needsUpdate = true
    hp.forEach((d, i) => {
      const k = Math.max(0, t)
      const loop = (k * 0.35 + d.ph / 6) % 1
      p.set(d.v.x * (1 + loop * 3), 1.3 + loop * 4.5, -2.5 + d.v.z * (1 + loop * 3))
      e.set(0, k * 1.5 + d.ph, 0)
      q.setFromEuler(e)
      sc.setScalar(k === 0 ? 0.001 : d.s * Math.sin(loop * Math.PI))
      m.compose(p, q, sc)
      hearts.current.setMatrixAt(i, m)
    })
    hearts.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group>
      <instancedMesh ref={confetti} args={[null, null, N]}>
        <planeGeometry args={[0.09, 0.14]} />
        <meshStandardMaterial side={THREE.DoubleSide} emissive="#ffffff" emissiveIntensity={0.15} />
      </instancedMesh>
      <instancedMesh ref={hearts} args={[heartGeo, null, H]}>
        <meshStandardMaterial color="#ff6fa3" emissive="#ff3d86" emissiveIntensity={0.8} />
      </instancedMesh>
    </group>
  )
}

function Gift() {
  const stage = useGame((s) => s.giftStage)
  const opening = stage !== 'closed'
  const lid = useRef(), box = useRef(), beam = useRef(), light = useRef(), glowRef = useRef()
  const t = useRef(0)
  useFrame(({ clock }, dt) => {
    const time = clock.elapsedTime
    if (opening) t.current += dt
    const k = t.current
    if (box.current) {
      // anticipation wiggle, then settle
      const wiggle = opening && k < 0.9 ? Math.sin(k * 40) * 0.08 * (1 - k / 0.9) : 0
      box.current.rotation.z = wiggle
      box.current.position.y = opening ? 0 : Math.sin(time * 2) * 0.04
      if (!opening) box.current.rotation.y = Math.sin(time * 0.6) * 0.15
    }
    if (lid.current && opening && k > 0.8) {
      const u = Math.min((k - 0.8) / 1.4, 1)
      const ease = 1 - Math.pow(1 - u, 3)
      lid.current.position.y = 0.52 + ease * 2.2
      lid.current.position.x = ease * 1.2
      lid.current.rotation.z = -ease * 1.1
      lid.current.rotation.y = ease * 2
    }
    if (beam.current) {
      const u = opening ? Math.min(Math.max((k - 0.8) / 1.2, 0), 1) : 0
      beam.current.scale.set(u, u, u)
      beam.current.material.opacity = 0.35 * u + Math.sin(time * 3) * 0.04 * u
    }
    if (light.current) light.current.intensity = opening ? Math.min(Math.max((k - 0.8) * 8, 0), 14) : 2 + Math.sin(time * 2) * 0.6
  })
  const ribbon = '#c8b6f2'
  return (
    <group position={[0, 0.86, -2.5]}>
      <pointLight ref={light} position={[0, 1.2, 0]} color="#ffd9a8" intensity={2} distance={9} decay={1.5} />
      <group ref={box}>
        <mesh castShadow>
          <boxGeometry args={[0.95, 0.85, 0.95]} />
          <meshStandardMaterial color="#ff8fb8" roughness={0.45} emissive="#ff6fa3" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 0, 0]}><boxGeometry args={[0.2, 0.86, 0.96]} /><Mat color={ribbon} /></mesh>
        <mesh position={[0, 0, 0]}><boxGeometry args={[0.96, 0.86, 0.2]} /><Mat color={ribbon} /></mesh>
        <group ref={lid} position={[0, 0.52, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.07, 0.22, 1.07]} />
            <meshStandardMaterial color="#ff8fb8" roughness={0.45} emissive="#ff6fa3" emissiveIntensity={0.25} />
          </mesh>
          <mesh><boxGeometry args={[0.2, 0.23, 1.08]} /><Mat color={ribbon} /></mesh>
          <mesh><boxGeometry args={[1.08, 0.23, 0.2]} /><Mat color={ribbon} /></mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.18, 0.22, 0]} rotation={[0, 0, (s * Math.PI) / 2.6]}>
              <torusGeometry args={[0.15, 0.06, 8, 18]} />
              <Mat color={ribbon} />
            </mesh>
          ))}
          <mesh position={[0, 0.17, 0]}><sphereGeometry args={[0.08, 10, 8]} /><Mat color="#a48ae6" /></mesh>
        </group>
      </group>
      <mesh ref={beam} position={[0, 3.4, 0]} scale={0.001}>
        <cylinderGeometry args={[1.4, 0.45, 6, 24, 1, true]} />
        <meshBasicMaterial color="#fff3c4" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <group ref={glowRef}>
        <Glow position={[0, 0.3, 0]} color={opening ? '#fff3c4' : '#ffb3cf'} size={opening ? 5 : 2.8} opacity={opening ? 0.9 : 0.5} />
      </group>
      {opening && <Sparkles count={60} scale={[3, 4, 3]} position={[0, 1.8, 0]} size={8} speed={1.2} color="#fff3b0" />}
    </group>
  )
}

function Candle({ position }) {
  const flame = useRef()
  useFrame(({ clock }) => {
    if (flame.current) {
      const t = clock.elapsedTime + position[0] * 3
      flame.current.scale.set(1, 1 + Math.sin(t * 13) * 0.15 + Math.sin(t * 7) * 0.1, 1)
    }
  })
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.15, 0]}><cylinderGeometry args={[0.07, 0.07, 0.3, 10]} /><Mat color="#fff6e9" /></mesh>
      <mesh ref={flame} position={[0, 0.36, 0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color="#ffd27a" />
      </mesh>
      <Glow position={[0, 0.38, 0]} color="#ffbf6b" size={0.7} opacity={0.8} />
    </group>
  )
}

function Frame({ position, rotation, text, sub, color }) {
  const tex = useTextTexture(text, { w: 320, h: 256, size: 40, sub, bg: '#fffaf3', border: color })
  return (
    <group position={position} rotation={rotation}>
      <mesh><boxGeometry args={[1.35, 1.1, 0.06]} /><Mat color="#e8c9a8" /></mesh>
      <mesh position={[0, 0, 0.035]}><planeGeometry args={[1.2, 0.95]} /><meshStandardMaterial map={tex} /></mesh>
    </group>
  )
}

function Bouquet({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.45, 0]}><cylinderGeometry args={[0.45, 0.4, 0.9, 14]} /><Mat color="#fff6e9" /></mesh>
      <mesh position={[0, 1.05, 0]}><cylinderGeometry args={[0.12, 0.18, 0.35, 12]} /><meshStandardMaterial color="#cfeeff" transparent opacity={0.7} /></mesh>
      {Array.from({ length: 9 }).map((_, i) => {
        const a = i * 0.7
        return (
          <mesh key={i} position={[Math.cos(a) * 0.2 * (i % 3), 1.4 + (i % 3) * 0.1, Math.sin(a) * 0.2 * (i % 3)]}>
            <dodecahedronGeometry args={[0.12, 0]} />
            <Mat color={['#ff6fa3', '#ffffff', '#ffb3cf', '#c8b6f2'][i % 4]} />
          </mesh>
        )
      })}
    </group>
  )
}

export default function SecretRoom() {
  const stage = useGame((s) => s.giftStage)
  const plank = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')
    g.fillStyle = '#e9c4c8'; g.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,0.1)' : 'rgba(120,60,90,0.08)'; g.fillRect(0, i * 16, 128, 16); g.fillStyle = 'rgba(120,60,90,0.2)'; g.fillRect(0, i * 16, 128, 1) }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(4, 4)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  const W = '#ffd6e6'
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <planeGeometry args={[14.6, 12.6]} />
        <meshStandardMaterial map={plank} roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -2.5]}>
        <circleGeometry args={[3.2, 40]} />
        <Mat color="#e6dcff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -2.5]}>
        <ringGeometry args={[2.7, 2.95, 40]} />
        <Mat color="#ffffff" />
      </mesh>
      {/* walls */}
      <mesh receiveShadow position={[0, 2, -7.15]}><boxGeometry args={[14.6, 4, 0.3]} /><Mat color={W} /></mesh>
      {[-7.15, 7.15].map((x) => <mesh key={x} receiveShadow position={[x, 2, -1]}><boxGeometry args={[0.3, 4, 12.6]} /><Mat color="#e6dcff" /></mesh>)}
      <mesh position={[0, 0.4, 5.15]}><boxGeometry args={[14.6, 0.8, 0.3]} /><Mat color="#e6dcff" /></mesh>
      {/* night window */}
      <group position={[0, 2.3, -6.98]}>
        <mesh><boxGeometry args={[3.4, 2.2, 0.06]} /><Mat color="#fff6e9" /></mesh>
        <mesh position={[0, 0, 0.04]}><planeGeometry args={[3.1, 1.9]} /><meshBasicMaterial color="#3b2f6b" /></mesh>
        <mesh position={[0.9, 0.4, 0.05]}><circleGeometry args={[0.28, 24]} /><meshBasicMaterial color="#fff6c4" /></mesh>
        <mesh position={[1.0, 0.48, 0.055]}><circleGeometry args={[0.24, 24]} /><meshBasicMaterial color="#3b2f6b" /></mesh>
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh key={i} position={[-1.4 + ((i * 37) % 28) / 10, -0.8 + ((i * 53) % 16) / 10, 0.05]}><circleGeometry args={[0.025 + (i % 3) * 0.012, 6]} /><meshBasicMaterial color="#fff" /></mesh>
        ))}
        <mesh position={[0, 0, 0.06]}><boxGeometry args={[0.06, 1.9, 0.03]} /><Mat color="#fff6e9" /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[s * 1.85, 0, 0.12]}><boxGeometry args={[0.4, 2.4, 0.05]} /><Mat color="#f7a8c4" /></mesh>)}
      </group>
      {/* fairy light strings */}
      {[[-7, 7, -6.95, 3.6], [-7, 7, -6.95, 3.0]].map(([a, b, z, y], r) => (
        <group key={r}>
          {Array.from({ length: 20 }).map((_, i) => {
            const k = i / 19
            return (
              <mesh key={i} position={[a + (b - a) * k, y - Math.sin(k * Math.PI) * 0.5, z + 0.1]}>
                <sphereGeometry args={[0.06, 8, 6]} />
                <meshStandardMaterial color={PASTELS[(i + r) % 5]} emissive={PASTELS[(i + r) % 5]} emissiveIntensity={1.4} />
              </mesh>
            )
          })}
        </group>
      ))}
      {/* table */}
      <group position={[0, 0, -2.5]}>
        <mesh castShadow receiveShadow position={[0, 0.42, 0]}><cylinderGeometry args={[1.25, 1.35, 0.84, 28]} /><Mat color="#ffffff" /></mesh>
        <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[1.4, 1.42, 0.12, 28]} /><Mat color="#ffd6e6" /></mesh>
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2
          return <mesh key={i} position={[Math.cos(a) * 1.3, 0.75, Math.sin(a) * 1.3]}><sphereGeometry args={[0.08, 8, 6]} /><Mat color={i % 2 ? '#ffb3cf' : '#ffffff'} /></mesh>
        })}
        {[0.9, 2.3, 3.7, 5.1].map((a) => (
          <mesh key={a} position={[Math.cos(a) * 1.0, 0.88, Math.sin(a) * 1.0]}><dodecahedronGeometry args={[0.07, 0]} /><Mat color="#ff6fa3" /></mesh>
        ))}
      </group>
      <Gift />
      {stage !== 'closed' && <GiftBurst />}
      <Bouquet position={[-5.6, 0, -5.6]} />
      <Bouquet position={[5.6, 0, -5.6]} />
      {[[-3, -6.4], [3, -6.4], [-6.4, -2], [6.4, -2], [-6.4, 1.5], [6.4, 1.5], [-1.5, -5.5], [1.5, -5.5]].map(([x, z], i) => <Candle key={i} position={[x, 0, z]} />)}
      <Frame position={[-6.98, 2.3, -3]} rotation={[0, Math.PI / 2, 0]} text="Best Friend" sub="certified ✓" color="#f07aa8" />
      <Frame position={[6.98, 2.3, -3]} rotation={[0, -Math.PI / 2, 0]} text={FRIEND_NAME} sub="main character" color="#8f74d6" />
      <Frame position={[-6.98, 2.1, 1.5]} rotation={[0, Math.PI / 2, 0]} text="☆ ☆ ☆" sub="5-star human" color="#ffd36b" />
      <Frame position={[6.98, 2.1, 1.5]} rotation={[0, -Math.PI / 2, 0]} text="♥" sub="always" color="#7cc9a6" />
      <FloatingHearts />
      <Sparkles count={80} scale={[13, 5, 11]} position={[0, 2.5, -1]} size={5} speed={0.25} color="#fff3b0" />
      <pointLight position={[-4, 3, -4]} color="#ffb3cf" intensity={6} distance={12} decay={1.5} />
      <pointLight position={[4, 3, -4]} color="#c8b6f2" intensity={6} distance={12} decay={1.5} />
      <pointLight position={[0, 3.5, 3]} color="#ffe0b0" intensity={5} distance={12} decay={1.5} />
      <InteractMarker />
    </group>
  )
}
