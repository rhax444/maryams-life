import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Mat = ({ color, rough = 0.8, metal = 0, emissive, ei = 0, flat = false, transparent, opacity, side }) => (
  <meshStandardMaterial
    color={color} roughness={rough} metalness={metal} flatShading={flat}
    emissive={emissive || '#000000'} emissiveIntensity={ei}
    transparent={transparent} opacity={opacity ?? 1} side={side}
  />
)

// ---------- Canvas text textures (uses the game font) ----------
const texCache = new Map()
export function useTextTexture(text, { w = 512, h = 160, bg = '#fff6e9', color = '#4a3b5c', size = 72, border = '#e5739d', sub = null, emoji = null } = {}) {
  const key = [text, w, h, bg, color, size, border, sub, emoji].join('|')
  const tex = useMemo(() => {
    if (texCache.has(key)) return texCache.get(key)
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    const draw = () => {
      const g = canvas.getContext('2d')
      g.clearRect(0, 0, w, h)
      const r = Math.min(w, h) * 0.18
      g.fillStyle = bg
      g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, r); g.fill()
      if (border) { g.lineWidth = 10; g.strokeStyle = border; g.stroke() }
      g.fillStyle = color
      g.textAlign = 'center'; g.textBaseline = 'middle'
      let fs = size
      g.font = `600 ${fs}px Fredoka, sans-serif`
      const label = emoji ? `${emoji} ${text}` : text
      while (g.measureText(label).width > w - 50 && fs > 14) { fs -= 2; g.font = `600 ${fs}px Fredoka, sans-serif` }
      g.fillText(label, w / 2, sub ? h * 0.4 : h / 2 + 4)
      if (sub) {
        g.font = `500 ${Math.round(size * 0.45)}px Fredoka, sans-serif`
        g.globalAlpha = 0.75
        g.fillText(sub, w / 2, h * 0.74)
        g.globalAlpha = 1
      }
      t.needsUpdate = true
    }
    draw()
    document.fonts?.ready.then(draw)
    texCache.set(key, t)
    return t
  }, [key])
  return tex
}

export function Sign({ position, rotation = [0, 0, 0], text, sub, width = 2.2, height = 0.7, post = 1.3, bg, color, border, emoji }) {
  const tex = useTextTexture(text, { bg, color, border, sub, emoji, w: 512, h: Math.round((512 * height) / width) })
  return (
    <group position={position} rotation={rotation}>
      {post > 0 && (
        <mesh castShadow position={[0, post / 2, 0]}>
          <cylinderGeometry args={[0.06, 0.07, post, 8]} />
          <Mat color="#b88a6a" />
        </mesh>
      )}
      <mesh castShadow position={[0, post + height / 2, 0]}>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.08]} />
        <Mat color="#d9a982" />
      </mesh>
      <mesh position={[0, post + height / 2, 0.045]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  )
}

// ---------- Trees ----------
function TreeModel({ type, color }) {
  const trunk = (
    <mesh castShadow position={[0, 0.8, 0]}>
      <cylinderGeometry args={[0.16, 0.24, 1.6, 7]} />
      <Mat color="#a7795a" flat />
    </mesh>
  )
  if (type === 'pine')
    return (
      <>
        {trunk}
        <group name="foliage">
          {[0, 1, 2].map((i) => (
            <mesh key={i} castShadow position={[0, 1.6 + i * 0.85, 0]}>
              <coneGeometry args={[1.4 - i * 0.35, 1.5, 7]} />
              <Mat color={color} flat rough={0.9} />
            </mesh>
          ))}
        </group>
      </>
    )
  return (
    <>
      {trunk}
      <group name="foliage">
        <mesh castShadow position={[0, 2.4, 0]}>
          <icosahedronGeometry args={[1.25, 1]} />
          <Mat color={color} flat rough={0.9} />
        </mesh>
        <mesh castShadow position={[0.7, 2.0, 0.3]}>
          <icosahedronGeometry args={[0.8, 1]} />
          <Mat color={color} flat rough={0.9} />
        </mesh>
        <mesh castShadow position={[-0.6, 2.1, -0.35]}>
          <icosahedronGeometry args={[0.85, 1]} />
          <Mat color={color} flat rough={0.9} />
        </mesh>
        {type === 'cherry' &&
          [[0.5, 3.1, 0.6], [-0.7, 2.7, 0.6], [0.2, 2.2, 1.1], [0.9, 2.6, -0.4]].map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.12, 6, 5]} />
              <Mat color="#ffffff" />
            </mesh>
          ))}
      </group>
    </>
  )
}

export function Trees({ list }) {
  const refs = useRef([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    refs.current.forEach((g, i) => {
      if (!g) return
      g.rotation.z = Math.sin(t * 0.9 + i * 1.7) * 0.025
      g.rotation.x = Math.cos(t * 0.7 + i) * 0.02
    })
  })
  return list.map(([x, z, type, color, s = 1], i) => (
    <group key={i} position={[x, 0, z]} scale={s} rotation={[0, i * 1.3, 0]} ref={(el) => (refs.current[i] = el)}>
      <TreeModel type={type} color={color} />
    </group>
  ))
}

export function Bush({ position, color = '#a7dcb5', scale = 1, flowers = '#ffb3cf' }) {
  return (
    <group position={position} scale={scale}>
      {[[0, 0.35, 0, 0.5], [0.4, 0.28, 0.1, 0.38], [-0.38, 0.27, -0.05, 0.36]].map(([x, y, z, r], i) => (
        <mesh key={i} castShadow position={[x, y, z]}>
          <icosahedronGeometry args={[r, 1]} />
          <Mat color={color} flat />
        </mesh>
      ))}
      {flowers && [[0.2, 0.75, 0.25], [-0.3, 0.6, 0.3], [0.5, 0.5, -0.1]].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.07, 6, 5]} />
          <Mat color={flowers} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- Lamps / benches / fences ----------
export function Lamp({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 2.8, 8]} />
        <Mat color="#8f74d6" metal={0.3} rough={0.5} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.16, 10]} />
        <Mat color="#8f74d6" />
      </mesh>
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[0.24, 14, 12]} />
        <meshStandardMaterial color="#fff6d6" emissive="#ffd98a" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 3.24, 0]}>
        <coneGeometry args={[0.26, 0.2, 10]} />
        <Mat color="#8f74d6" />
      </mesh>
    </group>
  )
}

export function Bench({ position, rotation = 0, color = '#f7a8c4' }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} castShadow position={[0, 0.45, -0.18 + i * 0.16]}>
          <boxGeometry args={[1.9, 0.06, 0.13]} />
          <Mat color={color} />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <mesh key={i} castShadow position={[0, 0.72 + i * 0.18, -0.3]}>
          <boxGeometry args={[1.9, 0.12, 0.05]} />
          <Mat color={color} />
        </mesh>
      ))}
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} castShadow position={[x, 0.3, -0.05]}>
          <boxGeometry args={[0.08, 0.6, 0.5]} />
          <Mat color="#7a6390" />
        </mesh>
      ))}
    </group>
  )
}

export function FenceLine({ from, to, color = '#fff6e9', h = 0.9, spacing = 1.1 }) {
  const items = useMemo(() => {
    const [x1, z1] = from, [x2, z2] = to
    const len = Math.hypot(x2 - x1, z2 - z1)
    const n = Math.max(1, Math.round(len / spacing))
    const posts = []
    for (let i = 0; i <= n; i++) posts.push([x1 + ((x2 - x1) * i) / n, z1 + ((z2 - z1) * i) / n])
    return { posts, len, mid: [(x1 + x2) / 2, (z1 + z2) / 2], ang: Math.atan2(x2 - x1, z2 - z1) }
  }, [from, to, spacing])
  return (
    <group>
      {items.posts.map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, h / 2, z]}>
          <boxGeometry args={[0.12, h, 0.12]} />
          <Mat color={color} />
        </mesh>
      ))}
      {[0.35, 0.7].map((y) => (
        <mesh key={y} castShadow position={[items.mid[0], y * h, items.mid[1]]} rotation={[0, items.ang, 0]}>
          <boxGeometry args={[0.06, 0.08, items.len]} />
          <Mat color={color} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- Decorative houses ----------
export function House({ x, z, w, d, wall, roof, rot = 0, label }) {
  const h = 3.2
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <Mat color={wall} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[w + 0.15, 0.3, d + 0.15]} />
        <Mat color="#fff6e9" />
      </mesh>
      {/* roof */}
      <group position={[0, h + 1.1, 0]} scale={[w * 0.8, 1, d * 0.8]}>
        <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1, 2.2, 4]} />
          <Mat color={roof} flat />
        </mesh>
      </group>
      <mesh castShadow position={[w * 0.25, h + 1.2, d * 0.1]}>
        <boxGeometry args={[0.5, 1.4, 0.5]} />
        <Mat color="#e8d9c8" />
      </mesh>
      {/* door + windows on both long sides */}
      {[1, -1].map((s) => (
        <group key={s} rotation={[0, s === 1 ? 0 : Math.PI, 0]}>
          <mesh position={[0, 0.85, d / 2 + 0.02]}>
            <boxGeometry args={[0.9, 1.6, 0.06]} />
            <Mat color="#b88a6a" />
          </mesh>
          <mesh position={[0.3, 0.85, d / 2 + 0.06]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <Mat color="#ffd54a" metal={0.6} rough={0.3} />
          </mesh>
          {[-1, 1].map((k) => (
            <group key={k} position={[k * w * 0.3, 1.9, d / 2 + 0.02]}>
              <mesh>
                <boxGeometry args={[0.85, 0.85, 0.06]} />
                <Mat color="#fff" />
              </mesh>
              <mesh position={[0, 0, 0.035]}>
                <planeGeometry args={[0.7, 0.7]} />
                <meshStandardMaterial color="#bfe6ff" emissive="#fff2c4" emissiveIntensity={0.35} />
              </mesh>
              <mesh position={[0, -0.5, 0.12]}>
                <boxGeometry args={[0.95, 0.18, 0.25]} />
                <Mat color="#c98b5a" />
              </mesh>
              {[-0.3, 0, 0.3].map((fx) => (
                <mesh key={fx} position={[fx, -0.35, 0.14]}>
                  <sphereGeometry args={[0.09, 6, 5]} />
                  <Mat color={['#ff8fb8', '#ffe066', '#c8b6f2'][Math.abs(Math.round(fx * 10)) % 3]} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
      {label && <Sign position={[0, 0, d / 2 + 0.8]} text={label} post={0.9} width={1.8} height={0.5} />}
    </group>
  )
}

// A soft glow sprite (cheap fake light)
export function Glow({ color = '#ffd98a', size = 1.5, opacity = 0.6, position }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grd.addColorStop(0, 'rgba(255,255,255,1)')
    grd.addColorStop(0.4, 'rgba(255,255,255,0.35)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <sprite position={position} scale={[size, size, size]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  )
}

export function useDisposeOnUnmount(obj) {
  useEffect(() => () => obj?.dispose?.(), [obj])
}
