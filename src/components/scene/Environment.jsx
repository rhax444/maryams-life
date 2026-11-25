import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Mat, Trees } from './Props'
import { ROADS, isFree, rng } from '../../game/layout'
import { player } from '../../game/playerState'
import { useGame } from '../../store/useGame'

// ---------- Sky dome with pastel gradient ----------
export function Sky({ top = '#9fd0f5', mid = '#d9e8ff', bottom = '#ffdbe9' }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { top: { value: new THREE.Color(top) }, mid: { value: new THREE.Color(mid) }, bottom: { value: new THREE.Color(bottom) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = h > 0.15 ? mix(mid, top, smoothstep(0.15, 0.7, h)) : mix(bottom, mid, smoothstep(-0.2, 0.15, h)); gl_FragColor = vec4(c,1.0); }`,
  }), [top, mid, bottom])
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  )
}

// ---------- Lighting (sun follows the player for crisp shadows) ----------
export function Lighting({ interior = false }) {
  const sun = useRef()
  const quality = useGame((s) => s.quality)
  useFrame(() => {
    if (!sun.current) return
    const phase = useGame.getState().phase
    const cx = phase === 'intro' ? 0 : player.x, cz = phase === 'intro' ? 0 : player.z
    sun.current.position.set(cx + 18, 32, cz - 14)
    sun.current.target.position.set(cx, 0, cz)
    sun.current.target.updateMatrixWorld()
  })
  const intro = useGame((s) => s.phase === 'intro')
  const ext = intro ? 50 : 26
  return (
    <>
      <hemisphereLight args={[interior ? '#ffd9f0' : '#d6ecff', interior ? '#6a4b7a' : '#ffd6e4', interior ? 0.6 : 1.0]} />
      <ambientLight intensity={interior ? 0.25 : 0.3} color="#fff4fb" />
      {!interior && (
        <directionalLight
          ref={sun}
          castShadow={quality === 'high'}
          intensity={2.1}
          color="#fff1dc"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-ext}
          shadow-camera-right={ext}
          shadow-camera-top={ext}
          shadow-camera-bottom={-ext}
          shadow-camera-near={1}
          shadow-camera-far={90}
          shadow-bias={-0.0004}
          shadow-normalBias={0.04}
        />
      )}
    </>
  )
}

// ---------- Floating island ground ----------
export function Ground() {
  const grassTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')
    g.fillStyle = '#bfe8a6'
    g.fillRect(0, 0, 256, 256)
    const r = rng(7)
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = r() > 0.5 ? 'rgba(160,214,140,0.5)' : 'rgba(214,244,190,0.55)'
      g.beginPath()
      g.arc(r() * 256, r() * 256, 1 + r() * 3, 0, Math.PI * 2)
      g.fill()
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(18, 18)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[50, 64]} />
        <meshStandardMaterial map={grassTex} roughness={1} />
      </mesh>
      {/* island rim + soil */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[50, 50, 1.2, 64, 1, true]} />
        <Mat color="#a7dc8e" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -4.6, 0]}>
        <cylinderGeometry args={[50, 34, 6.8, 64, 1, true]} />
        <Mat color="#d7a98a" flat side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -10.5, 0]}>
        <coneGeometry args={[34, 14, 32]} />
        <Mat color="#c48f74" flat />
      </mesh>
      {/* cloud skirt below the island */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 46, -7 + (i % 3), Math.sin(a) * 46]} scale={[1.6, 0.8, 1.6]}>
            <sphereGeometry args={[5, 12, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.92} />
          </mesh>
        )
      })}
    </group>
  )
}

export function Roads() {
  const colors = { road: '#f6e6d2', street: '#fbe3ec', path: '#f3dcc1' }
  return (
    <group>
      {ROADS.map((r, i) => (
        <group key={i}>
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[r.x, 0.012 + i * 0.001, r.z]}>
            <planeGeometry args={[r.w, r.d]} />
            <Mat color={colors[r.kind]} rough={0.95} />
          </mesh>
          {r.kind === 'road' && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[r.x, 0.03, r.z]}>
              <planeGeometry args={r.w > r.d ? [r.w - 1, 0.12] : [0.12, r.d - 1]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
            </mesh>
          )}
        </group>
      ))}
      {/* stepping stones on the street */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[26.5 + ((i % 2) - 0.5) * 2.2, 0.04, -24 + i * 2.6]}>
          <circleGeometry args={[0.35, 12]} />
          <Mat color="#f7c6d9" />
        </mesh>
      ))}
    </group>
  )
}

// ---------- Instanced flowers + grass tufts ----------
const FLOWER_COLORS = ['#ff9cc2', '#ffd36b', '#c8b6f2', '#ffffff', '#ffb98a', '#9fd8ff', '#ff7eb3']
export function Flowers({ count = 420 }) {
  const heads = useRef(), stems = useRef(), tufts = useRef()
  const data = useMemo(() => {
    const r = rng(42)
    const flowers = [], grass = []
    let guard = 0
    while (flowers.length < count && guard++ < 20000) {
      // cluster flowers in patches
      const cx = (r() * 2 - 1) * 40, cz = (r() * 2 - 1) * 40
      const n = 3 + Math.floor(r() * 6)
      for (let k = 0; k < n; k++) {
        const x = cx + (r() - 0.5) * 2.6, z = cz + (r() - 0.5) * 2.6
        if (Math.hypot(x, z) < 47 && isFree(x, z, 0.5)) flowers.push([x, z, FLOWER_COLORS[Math.floor(r() * FLOWER_COLORS.length)], 0.7 + r() * 0.6])
      }
    }
    guard = 0
    while (grass.length < count * 1.3 && guard++ < 20000) {
      const x = (r() * 2 - 1) * 47, z = (r() * 2 - 1) * 47
      if (Math.hypot(x, z) < 48 && isFree(x, z, 0.3)) grass.push([x, z, 0.6 + r() * 0.7, r() * Math.PI])
    }
    return { flowers, grass }
  }, [count])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color()
    data.flowers.forEach(([x, z, col, sc], i) => {
      p.set(x, 0.36 * sc, z); s.setScalar(sc); q.identity()
      m.compose(p, q, s); heads.current.setMatrixAt(i, m)
      heads.current.setColorAt(i, c.set(col))
      p.set(x, 0.18 * sc, z); m.compose(p, q, s); stems.current.setMatrixAt(i, m)
    })
    heads.current.instanceMatrix.needsUpdate = true
    heads.current.instanceColor.needsUpdate = true
    stems.current.instanceMatrix.needsUpdate = true
    data.grass.forEach(([x, z, sc, rot], i) => {
      p.set(x, 0.12 * sc, z); s.set(sc, sc, sc); q.setFromEuler(new THREE.Euler(0, rot, 0))
      m.compose(p, q, s); tufts.current.setMatrixAt(i, m)
    })
    tufts.current.instanceMatrix.needsUpdate = true
  }, [data])

  return (
    <group>
      <instancedMesh ref={heads} args={[null, null, data.flowers.length]} castShadow>
        <dodecahedronGeometry args={[0.11, 0]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={stems} args={[null, null, data.flowers.length]}>
        <cylinderGeometry args={[0.015, 0.02, 0.36, 4]} />
        <meshStandardMaterial color="#7cc98f" />
      </instancedMesh>
      <instancedMesh ref={tufts} args={[null, null, data.grass.length]}>
        <coneGeometry args={[0.12, 0.26, 4]} />
        <meshStandardMaterial color="#93d38a" flatShading />
      </instancedMesh>
    </group>
  )
}

// ---------- Outer forest ring ----------
export function EdgeForest() {
  const list = useMemo(() => {
    const r = rng(99)
    const out = []
    const types = [['round', '#9be3c4'], ['pine', '#86cfa6'], ['cherry', '#f6b5cf'], ['lav', '#d3c2f5'], ['round', '#b8e6c9'], ['pine', '#8fd1ab']]
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * Math.PI * 2 + r() * 0.05
      const rad = 41.5 + r() * 6
      const [t, c] = types[Math.floor(r() * types.length)]
      out.push([Math.cos(a) * rad, Math.sin(a) * rad, t, c, 0.9 + r() * 0.6])
    }
    return out
  }, [])
  return <Trees list={list} />
}

// ---------- Clouds ----------
export function Clouds({ count = 9 }) {
  const refs = useRef([])
  const clouds = useMemo(() => {
    const r = rng(5)
    return Array.from({ length: count }).map(() => ({
      x: (r() * 2 - 1) * 70, y: 20 + r() * 12, z: (r() * 2 - 1) * 70, s: 1 + r() * 1.4, speed: 0.6 + r() * 0.8,
      puffs: Array.from({ length: 5 }).map((_, k) => [k * 1.3 - 2.6, r() * 0.8, (r() - 0.5) * 1.4, 1.1 + r() * 0.8]),
    }))
  }, [count])
  useFrame((_, dt) => {
    refs.current.forEach((g, i) => {
      if (!g) return
      g.position.x += clouds[i].speed * dt
      if (g.position.x > 80) g.position.x = -80
    })
  })
  return clouds.map((c, i) => (
    <group key={i} ref={(el) => (refs.current[i] = el)} position={[c.x, c.y, c.z]} scale={c.s}>
      {c.puffs.map(([x, y, z, r], k) => (
        <mesh key={k} position={[x, y, z]}>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={1} emissive="#fff0f6" emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  ))
}

// ---------- Butterflies ----------
export function Butterflies({ count = 12, center = [0, 0, 0], spread = 30 }) {
  const refs = useRef([])
  const data = useMemo(() => {
    const r = rng(11)
    return Array.from({ length: count }).map(() => ({
      x: center[0] + (r() * 2 - 1) * spread, z: center[2] + (r() * 2 - 1) * spread, y: 0.8 + r() * 1.5,
      ph: r() * 10, sp: 0.4 + r() * 0.5, rad: 1.5 + r() * 3, col: ['#ff9cc2', '#c8b6f2', '#ffd36b', '#9fd8ff', '#ffffff'][Math.floor(r() * 5)],
    }))
  }, [count, spread, center])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    refs.current.forEach((g, i) => {
      if (!g) return
      const d = data[i], a = t * d.sp + d.ph
      g.position.set(d.x + Math.cos(a) * d.rad, d.y + Math.sin(t * 2 + d.ph) * 0.3, d.z + Math.sin(a * 1.3) * d.rad)
      g.rotation.y = -a + Math.PI
      const flap = Math.sin(t * 18 + d.ph) * 0.9
      g.children[0].rotation.z = flap
      g.children[1].rotation.z = -flap
    })
  })
  return data.map((d, i) => (
    <group key={i} ref={(el) => (refs.current[i] = el)} scale={0.9}>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.11, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 8]} />
            <meshStandardMaterial color={d.col} side={THREE.DoubleSide} emissive={d.col} emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.02, 0.12, 3, 6]} />
        <meshStandardMaterial color="#4a3b5c" />
      </mesh>
    </group>
  ))
}

// ---------- Birds circling overhead ----------
export function Birds({ count = 6 }) {
  const refs = useRef([])
  const data = useMemo(() => Array.from({ length: count }).map((_, i) => ({ r: 14 + i * 3, y: 16 + (i % 3) * 2, sp: 0.15 + (i % 3) * 0.04, ph: i * 1.1 })), [count])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    refs.current.forEach((g, i) => {
      if (!g) return
      const d = data[i], a = t * d.sp + d.ph
      g.position.set(Math.cos(a) * d.r, d.y + Math.sin(t + i) * 0.6, Math.sin(a) * d.r - 4)
      g.rotation.y = -a
      const f = Math.sin(t * 8 + i) * 0.6
      g.children[0].rotation.x = f
      g.children[1].rotation.x = -f
    })
  })
  return data.map((_, i) => (
    <group key={i} ref={(el) => (refs.current[i] = el)}>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[0, 0, s * 0.35]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.25, 0.03, 0.7]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
      <mesh>
        <sphereGeometry args={[0.13, 8, 6]} />
        <meshStandardMaterial color="#fff6e9" />
      </mesh>
    </group>
  ))
}

export function Pollen({ quality }) {
  if (quality === 'low') return null
  return (
    <>
      <Sparkles count={90} scale={[80, 8, 80]} position={[0, 4, 0]} size={4} speed={0.3} color="#fff3b0" opacity={0.7} />
      <Sparkles count={40} scale={[30, 5, 30]} position={[1, 2.5, -10]} size={5} speed={0.4} color="#ffc6dd" opacity={0.8} />
    </>
  )
}
