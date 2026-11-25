import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Mat, Sign, useTextTexture, Glow, Bush } from './Props'
import NPC, { NPC_LOOKS } from './NPC'
import { DrinkCup } from './Character'
import { useGame } from '../../store/useGame'
import { CAFE, LOCATIONS } from '../../config/gameConfig'

function useCheckerTex(a, b, repeat = 6) {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')
    g.fillStyle = a; g.fillRect(0, 0, 64, 64)
    g.fillStyle = b; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32)
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat, repeat)
    t.magFilter = THREE.NearestFilter
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [a, b, repeat])
}

function usePlankTex(base = '#e8c9a8') {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128; c.height = 128
    const g = c.getContext('2d')
    g.fillStyle = base; g.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? 'rgba(255,255,255,0.12)' : 'rgba(150,100,70,0.08)'
      g.fillRect(0, i * 16, 128, 16)
      g.fillStyle = 'rgba(120,80,60,0.25)'
      g.fillRect(0, i * 16, 128, 1)
      g.fillRect(((i * 37) % 128), i * 16, 1, 16)
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(3, 3)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [base])
}

// An open-front "dollhouse" room: back wall, side walls, low railing with entrance
export function RoomShell({ minX, maxX, minZ, maxZ, gapMin, gapMax, wall, trim, roof, floorTex, title, signBg, signBorder }) {
  const w = maxX - minX, d = maxZ - minZ, cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2
  const H = 3.4, t = 0.3
  return (
    <group>
      <mesh receiveShadow position={[cx, 0.06, cz]}>
        <boxGeometry args={[w + 0.6, 0.12, d + 0.6]} />
        <meshStandardMaterial map={floorTex} roughness={0.85} />
      </mesh>
      {/* back wall */}
      <mesh castShadow receiveShadow position={[cx, H / 2, maxZ + t / 2]}>
        <boxGeometry args={[w + 2 * t, H, t]} />
        <Mat color={wall} />
      </mesh>
      <mesh position={[cx, 0.5, maxZ - 0.02]}>
        <boxGeometry args={[w, 1, 0.04]} />
        <Mat color={trim} />
      </mesh>
      {/* side walls */}
      {[minX - t / 2, maxX + t / 2].map((x, i) => (
        <group key={i}>
          <mesh castShadow receiveShadow position={[x, H / 2, cz]}>
            <boxGeometry args={[t, H, d + 2 * t]} />
            <Mat color={wall} />
          </mesh>
          <mesh position={[x + (i ? -0.17 : 0.17), 0.5, cz]}>
            <boxGeometry args={[0.04, 1, d]} />
            <Mat color={trim} />
          </mesh>
          {/* roof lip on top of walls */}
          <mesh castShadow position={[x, H + 0.1, cz]}>
            <boxGeometry args={[0.6, 0.2, d + 0.9]} />
            <Mat color={roof} />
          </mesh>
        </group>
      ))}
      <mesh castShadow position={[cx, H + 0.1, maxZ + t / 2]}>
        <boxGeometry args={[w + 0.9, 0.2, 0.6]} />
        <Mat color={roof} />
      </mesh>
      {/* front railing */}
      {[[minX - t, gapMin], [gapMax, maxX + t]].map(([a, b], i) => (
        <group key={i}>
          <mesh castShadow position={[(a + b) / 2, 0.66, minZ - t / 2]}>
            <boxGeometry args={[b - a, 0.1, 0.22]} />
            <Mat color={trim} />
          </mesh>
          <mesh castShadow position={[(a + b) / 2, 0.3, minZ - t / 2]}>
            <boxGeometry args={[b - a, 0.6, 0.12]} />
            <Mat color={wall} />
          </mesh>
        </group>
      ))}
      {/* entrance arch with sign */}
      {[gapMin, gapMax].map((x) => (
        <mesh key={x} castShadow position={[x, H / 2, minZ - t / 2]}>
          <boxGeometry args={[0.22, H, 0.22]} />
          <Mat color={trim} />
        </mesh>
      ))}
      <mesh castShadow position={[(gapMin + gapMax) / 2, H, minZ - t / 2]}>
        <boxGeometry args={[gapMax - gapMin + 0.6, 0.3, 0.3]} />
        <Mat color={roof} />
      </mesh>
      <Sign position={[(gapMin + gapMax) / 2, H + 0.15, minZ - 0.35]} rotation={[0, Math.PI, 0]} text={title} post={0} width={3.2} height={0.75} bg={signBg} border={signBorder} />
    </group>
  )
}

// ============================ BEDROOM ============================
function FairyLights({ from, to, y, z, count = 14, sag = 0.35 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.children.forEach((m, i) => { m.material.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 3 + i) * 0.5 })
  })
  const cols = ['#ffd36b', '#ff9cc2', '#c8b6f2', '#9fd8ff']
  return (
    <group ref={ref}>
      {Array.from({ length: count }).map((_, i) => {
        const k = i / (count - 1)
        const x = from + (to - from) * k
        return (
          <mesh key={i} position={[x, y - Math.sin(k * Math.PI) * sag, z]}>
            <sphereGeometry args={[0.06, 8, 6]} />
            <meshStandardMaterial color={cols[i % 4]} emissive={cols[i % 4]} emissiveIntensity={1} />
          </mesh>
        )
      })}
    </group>
  )
}

function Book({ position, color, h = 0.32, tilt = 0 }) {
  return (
    <mesh position={position} rotation={[tilt, 0, 0]}>
      <boxGeometry args={[0.26, h, 0.07]} />
      <Mat color={color} />
    </mesh>
  )
}

export function Bedroom() {
  const floor = usePlankTex('#f0d4b8')
  const phoneRef = useRef()
  useFrame(({ clock }) => {
    if (phoneRef.current) phoneRef.current.material.emissiveIntensity = 0.6 + Math.max(0, Math.sin(clock.elapsedTime * 4)) * 0.8
  })
  return (
    <group>
      <RoomShell minX={-25} maxX={-15} minZ={20} maxZ={28} gapMin={-22} gapMax={-18} wall="#ffd6e6" trim="#fff6e9" roof="#e5739d" floorTex={floor} title={LOCATIONS.bedroom.sign} signBorder="#e5739d" />
      {/* wallpaper hearts on back wall */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[-24.3 + i * 1.1, 2.4 + (i % 2) * 0.4, 27.97]} rotation={[0, Math.PI, Math.PI / 4]}>
          <planeGeometry args={[0.14, 0.14]} />
          <meshBasicMaterial color="#ffb3cf" />
        </mesh>
      ))}
      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, 0.13, 23.8]}>
        <circleGeometry args={[1.8, 32]} />
        <Mat color="#c8b6f2" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, 0.135, 23.8]}>
        <ringGeometry args={[1.3, 1.5, 32]} />
        <Mat color="#fff6e9" />
      </mesh>
      {/* bed */}
      <group position={[-23.75, 0, 26.4]}>
        <mesh castShadow position={[0, 0.25, 0]}>
          <boxGeometry args={[2.2, 0.3, 3.1]} />
          <Mat color="#d9a982" />
        </mesh>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[2.05, 0.25, 3.0]} />
          <Mat color="#ffffff" />
        </mesh>
        <mesh castShadow position={[0, 0.66, -0.55]}>
          <boxGeometry args={[2.12, 0.1, 1.95]} />
          <Mat color="#f7a8c4" />
        </mesh>
        <mesh castShadow position={[0, 0.72, 1.05]} scale={[1, 0.4, 0.6]}>
          <sphereGeometry args={[0.5, 16, 10]} />
          <Mat color="#fff6e9" />
        </mesh>
        <mesh castShadow position={[0, 0.9, 1.5]}>
          <boxGeometry args={[2.25, 1.3, 0.14]} />
          <Mat color="#c8b6f2" />
        </mesh>
        <mesh position={[0, 1.4, 1.42]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.3, 20]} />
          <Mat color="#ffd6e6" />
        </mesh>
        {/* plushie */}
        <group position={[0.55, 0.82, 0.6]}>
          <mesh><sphereGeometry args={[0.16, 12, 10]} /><Mat color="#fff4c2" /></mesh>
          <mesh position={[0, 0.2, 0]}><sphereGeometry args={[0.13, 12, 10]} /><Mat color="#fff4c2" /></mesh>
          {[-1, 1].map((s) => <mesh key={s} position={[s * 0.08, 0.32, 0]}><sphereGeometry args={[0.05, 8, 6]} /><Mat color="#fff4c2" /></mesh>)}
        </group>
      </group>
      {/* nightstand + phone + lamp */}
      <group position={[-22.1, 0, 27.6]}>
        <mesh castShadow position={[0, 0.32, 0]}>
          <boxGeometry args={[0.75, 0.64, 0.7]} />
          <Mat color="#fff6e9" />
        </mesh>
        <mesh position={[0, 0.66, -0.05]} rotation={[-Math.PI / 2, 0, 0.4]}>
          <boxGeometry args={[0.16, 0.28, 0.02]} />
          <Mat color="#4a3b5c" />
        </mesh>
        <mesh ref={phoneRef} position={[0, 0.672, -0.05]} rotation={[-Math.PI / 2, 0, 0.4]}>
          <planeGeometry args={[0.13, 0.24]} />
          <meshStandardMaterial color="#9fd8ff" emissive="#9fd8ff" emissiveIntensity={1} />
        </mesh>
        <mesh position={[0.2, 0.8, 0.15]}>
          <cylinderGeometry args={[0.03, 0.05, 0.3]} />
          <Mat color="#c8b6f2" />
        </mesh>
        <mesh position={[0.2, 1.0, 0.15]}>
          <coneGeometry args={[0.16, 0.2, 12, 1, true]} />
          <meshStandardMaterial color="#fff2c4" emissive="#ffd98a" emissiveIntensity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* window on back wall */}
      <group position={[-19.5, 1.9, 27.96]} rotation={[0, Math.PI, 0]}>
        <mesh><boxGeometry args={[1.9, 1.5, 0.06]} /><Mat color="#ffffff" /></mesh>
        <mesh position={[0, 0, 0.035]}><planeGeometry args={[1.65, 1.25]} /><meshStandardMaterial color="#aee0ff" emissive="#cfeeff" emissiveIntensity={0.6} /></mesh>
        <mesh position={[0, 0, 0.05]}><boxGeometry args={[0.06, 1.3, 0.03]} /><Mat color="#fff" /></mesh>
        <mesh position={[0, 0, 0.05]}><boxGeometry args={[1.7, 0.06, 0.03]} /><Mat color="#fff" /></mesh>
        {/* little sun + cloud in the window */}
        <mesh position={[0.45, 0.3, 0.04]}><circleGeometry args={[0.16, 16]} /><meshBasicMaterial color="#ffe27a" /></mesh>
        <mesh position={[-0.35, 0.25, 0.04]} scale={[1.8, 1, 1]}><circleGeometry args={[0.12, 16]} /><meshBasicMaterial color="#fff" /></mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.05, -0.05, 0.12]}>
            <boxGeometry args={[0.35, 1.75, 0.05]} />
            <Mat color="#f7a8c4" />
          </mesh>
        ))}
        <mesh position={[0, -0.8, 0.15]}><boxGeometry args={[2.0, 0.08, 0.3]} /><Mat color="#fff6e9" /></mesh>
        <mesh position={[0.5, -0.65, 0.15]}><cylinderGeometry args={[0.07, 0.06, 0.15]} /><Mat color="#ffb98a" /></mesh>
        <mesh position={[0.5, -0.5, 0.15]}><capsuleGeometry args={[0.05, 0.12, 4, 8]} /><Mat color="#7cc98f" /></mesh>
      </group>
      {/* wardrobe */}
      <group position={[-16.3, 0, 27.55]}>
        <mesh castShadow position={[0, 1.2, 0]}>
          <boxGeometry args={[2.1, 2.4, 0.85]} />
          <Mat color="#c8b6f2" />
        </mesh>
        <mesh position={[0, 1.2, -0.43]}><boxGeometry args={[0.03, 2.2, 0.02]} /><Mat color="#8f74d6" /></mesh>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.15, 1.25, -0.46]}><sphereGeometry args={[0.05, 8, 6]} /><Mat color="#ffd54a" metal={0.6} rough={0.3} /></mesh>
            <mesh position={[s * 0.52, 1.5, -0.44]}><boxGeometry args={[0.7, 1.4, 0.02]} /><Mat color="#d9ccf7" /></mesh>
          </group>
        ))}
        <mesh position={[0, 2.5, 0]}><boxGeometry args={[2.2, 0.15, 0.9]} /><Mat color="#a48ae6" /></mesh>
        <mesh position={[0.6, 2.75, 0]}><boxGeometry args={[0.5, 0.35, 0.4]} /><Mat color="#ffd6e6" /></mesh>
      </group>
      {/* standing mirror on east wall */}
      <group position={[-15.3, 0, 24.5]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow position={[0, 1.25, 0]} scale={[0.75, 1.25, 1]}>
          <torusGeometry args={[0.55, 0.06, 10, 32]} />
          <Mat color="#ffd54a" metal={0.6} rough={0.3} />
        </mesh>
        <mesh position={[0, 1.25, -0.01]} scale={[0.75, 1.25, 1]}>
          <circleGeometry args={[0.55, 32]} />
          <meshStandardMaterial color="#e6f4ff" metalness={0.4} roughness={0.08} emissive="#d8ecff" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0.18, 1.45, 0.0]} rotation={[0, 0, 0.6]}>
          <planeGeometry args={[0.06, 0.6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.04, 0.05, 0.5]} /><Mat color="#ffd54a" metal={0.6} /></mesh>
        <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.3, 0.35, 0.06, 16]} /><Mat color="#ffd54a" metal={0.6} /></mesh>
      </group>
      {/* dressing table */}
      <group position={[-15.45, 0, 22]}>
        <mesh castShadow position={[0, 0.78, 0]}><boxGeometry args={[0.85, 0.08, 1.6]} /><Mat color="#fff6e9" /></mesh>
        {[[-0.35, -0.7], [-0.35, 0.7], [0.35, -0.7], [0.35, 0.7]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.38, z]}><cylinderGeometry args={[0.04, 0.03, 0.76]} /><Mat color="#f7a8c4" /></mesh>
        ))}
        <mesh position={[0.4, 1.55, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <torusGeometry args={[0.45, 0.05, 8, 28]} />
          <Mat color="#f7a8c4" />
        </mesh>
        <mesh position={[0.38, 1.55, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[0.45, 28]} />
          <meshStandardMaterial color="#e6f4ff" metalness={0.4} roughness={0.1} emissive="#d8ecff" emissiveIntensity={0.3} />
        </mesh>
        {[['#ff7eb3', -0.5], ['#c8b6f2', -0.3], ['#9fd8ff', 0.4], ['#ffd36b', 0.55]].map(([c, z], i) => (
          <mesh key={i} position={[-0.1, 0.92, z]}><cylinderGeometry args={[0.05, 0.06, 0.2 + i * 0.03, 10]} /><Mat color={c} rough={0.3} /></mesh>
        ))}
        <mesh position={[-0.85, 0.3, 0]}><cylinderGeometry args={[0.25, 0.22, 0.5, 14]} /><Mat color="#c8b6f2" /></mesh>
      </group>
      {/* bookshelf */}
      <group position={[-24.65, 0, 22]}>
        <mesh castShadow position={[0, 1.1, 0]}><boxGeometry args={[0.6, 2.2, 2]} /><Mat color="#e8c9a8" /></mesh>
        {[0.45, 1.05, 1.65].map((y, r) => (
          <group key={y}>
            <mesh position={[0.05, y - 0.2, 0]}><boxGeometry args={[0.55, 0.05, 1.9]} /><Mat color="#d9a982" /></mesh>
            {Array.from({ length: 6 }).map((_, i) => (
              <group key={i} rotation={[0, Math.PI / 2, 0]}>
                <Book position={[-0.75 + i * 0.25 + r * 0.04, y, 0.16]} color={['#ff9cc2', '#c8b6f2', '#9fd8ff', '#ffd36b', '#b5ead7', '#ffb98a'][(i + r) % 6]} h={0.3 + ((i * 7 + r) % 3) * 0.05} tilt={i === 5 ? 0.2 : 0} />
              </group>
            ))}
          </group>
        ))}
      </group>
      {/* plant */}
      <group position={[-24.4, 0, 20.6]}>
        <mesh castShadow position={[0, 0.25, 0]}><cylinderGeometry args={[0.25, 0.2, 0.5, 12]} /><Mat color="#ffb98a" /></mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} castShadow position={[Math.cos(i * 1.3) * 0.15, 0.75 + i * 0.06, Math.sin(i * 1.3) * 0.15]} rotation={[Math.cos(i) * 0.5, 0, Math.sin(i) * 0.5]} scale={[0.6, 1.4, 0.3]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <Mat color="#7cc98f" />
          </mesh>
        ))}
      </group>
      {/* hidden button */}
      <group position={[-24.7, 0.12, 24.1]}>
        <mesh><cylinderGeometry args={[0.1, 0.12, 0.05, 14]} /><Mat color="#fff6e9" /></mesh>
        <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.07, 0.07, 0.05, 14]} /><Mat color="#ff4f6f" emissive="#ff4f6f" ei={0.3} /></mesh>
      </group>
      {/* posters on west wall */}
      {[[21.0, '#ffe7a0', 2.4], [26.5, '#b5ead7', 2.2]].map(([z, c, y], i) => (
        <group key={i} position={[-24.97, y, z]} rotation={[0, Math.PI / 2, 0]}>
          <mesh><planeGeometry args={[0.8, 1]} /><Mat color={c} /></mesh>
          <mesh position={[0, 0.05, 0.01]} rotation={[0, 0, Math.PI / 4]}><planeGeometry args={[0.3, 0.3]} /><meshBasicMaterial color="#ff7eb3" /></mesh>
        </group>
      ))}
      <FairyLights from={-24.8} to={-15.2} y={3.1} z={27.85} />
      <Glow position={[-21.9, 1.0, 27.75]} color="#ffd98a" size={1.4} opacity={0.5} />
      {/* garden behind the house (key #1 is hiding here) */}
      <Bush position={[-21.6, 0, 29.4]} scale={1.1} />
      <Bush position={[-18.2, 0, 29.6]} flowers="#c8b6f2" />
      <Bush position={[-24.5, 0, 29.3]} color="#b8e6c9" flowers="#ffd36b" />
    </group>
  )
}

// ============================ CAFE ============================
function MenuBoard() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 300
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    const draw = () => {
      const g = c.getContext('2d')
      g.fillStyle = '#3d4a45'; g.fillRect(0, 0, 512, 300)
      g.strokeStyle = '#e8c9a8'; g.lineWidth = 12; g.strokeRect(6, 6, 500, 288)
      g.fillStyle = '#ffd6e6'; g.font = '600 38px Fredoka, sans-serif'; g.textAlign = 'center'
      g.fillText('✿ MENU ✿', 256, 50)
      g.font = '500 25px Fredoka, sans-serif'; g.textAlign = 'left'
      CAFE.menu.forEach((m, i) => {
        g.fillStyle = ['#ffd6e6', '#fff2c4', '#cfeeff', '#d8f5e8', '#e6dcff'][i]
        g.fillText(m.name, 30, 100 + i * 42)
        g.textAlign = 'right'; g.fillStyle = '#ffffff99'; g.fillText(m.price, 484, 100 + i * 42); g.textAlign = 'left'
      })
      t.needsUpdate = true
    }
    draw()
    document.fonts?.ready.then(draw)
    return t
  }, [])
  return (
    <group position={[19, 2.45, 27.97]} rotation={[0, Math.PI, 0]}>
      <mesh><boxGeometry args={[3.0, 1.8, 0.05]} /><Mat color="#b88a6a" /></mesh>
      <mesh position={[0, 0, 0.03]}><planeGeometry args={[2.9, 1.7]} /><meshStandardMaterial map={tex} roughness={0.9} /></mesh>
    </group>
  )
}

function CafeTable({ position, umbrella }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.75, 0]}><cylinderGeometry args={[0.6, 0.6, 0.06, 20]} /><Mat color="#fff6e9" /></mesh>
      <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.05, 0.08, 0.75]} /><Mat color="#8f74d6" /></mesh>
      <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.3, 0.3, 0.04, 14]} /><Mat color="#8f74d6" /></mesh>
      {[0, Math.PI].map((a) => (
        <group key={a} position={[Math.sin(a) * 0.95, 0, Math.cos(a) * 0.95]} rotation={[0, a, 0]}>
          <mesh castShadow position={[0, 0.45, 0]}><cylinderGeometry args={[0.25, 0.25, 0.06, 14]} /><Mat color="#f7a8c4" /></mesh>
          <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.03, 0.03, 0.45]} /><Mat color="#8f74d6" /></mesh>
          <mesh castShadow position={[0, 0.75, 0.22]}><boxGeometry args={[0.45, 0.5, 0.05]} /><Mat color="#f7a8c4" /></mesh>
        </group>
      ))}
      <mesh position={[0.15, 0.85, 0.1]}><cylinderGeometry args={[0.07, 0.06, 0.12, 12]} /><Mat color="#ffffff" /></mesh>
      <mesh position={[-0.2, 0.84, -0.1]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.08, 0.035, 8, 14]} /><Mat color="#ff9cc2" /></mesh>
      {umbrella && (
        <group>
          <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.03, 0.03, 1.8]} /><Mat color="#fff" /></mesh>
          <mesh castShadow position={[0, 2.5, 0]}><coneGeometry args={[1.5, 0.6, 8]} /><Mat color={umbrella} flat /></mesh>
          <mesh position={[0, 2.82, 0]}><sphereGeometry args={[0.08, 8, 6]} /><Mat color="#fff" /></mesh>
        </group>
      )}
    </group>
  )
}

function Steam({ position, active }) {
  const ref = useRef()
  useFrame(({ clock }, dt) => {
    if (!ref.current) return
    ref.current.children.forEach((m, i) => {
      const t = (clock.elapsedTime * 0.8 + i / 6) % 1
      m.position.set(Math.sin(t * 6 + i) * 0.06, t * 0.9, 0)
      m.scale.setScalar(active ? 0.5 + t * 1.2 : 0.001)
      m.material.opacity = (1 - t) * 0.6
    })
  })
  return (
    <group ref={ref} position={position}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

export function Cafe() {
  const floor = useCheckerTex('#fff6e9', '#ffd6e6', 5)
  const brewing = useGame((s) => s.brewing)
  const drink = brewing ? CAFE.menu.find((m) => m.id === brewing.id) : null
  return (
    <group>
      <RoomShell minX={15} maxX={25} minZ={20} maxZ={28} gapMin={18} gapMax={22} wall="#c9f0de" trim="#fff6e9" roof="#f07aa8" floorTex={floor} title={LOCATIONS.cafe.sign} signBg="#fff0f6" signBorder="#7cc9a6" />
      {/* striped awning over the entrance */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} castShadow position={[15.2 + i * 1.25 + 0.6, 3.05, 19.35]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[1.25, 0.06, 1.3]} />
          <Mat color={i % 2 ? '#ffffff' : '#f7a8c4'} />
        </mesh>
      ))}
      {/* counter */}
      <group position={[20, 0, 25.45]}>
        <mesh castShadow position={[0, 0.5, 0]}><boxGeometry args={[6, 1.0, 0.9]} /><Mat color="#f7a8c4" /></mesh>
        <mesh castShadow position={[0, 1.04, 0]}><boxGeometry args={[6.15, 0.08, 1.0]} /><Mat color="#fff6e9" /></mesh>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[-2.5 + i, 0.5, -0.46]}><boxGeometry args={[0.05, 0.8, 0.02]} /><Mat color="#fff6e9" /></mesh>
        ))}
        {/* pastry case */}
        <group position={[-1.9, 1.08, 0]}>
          <mesh position={[0, 0.25, 0]}><boxGeometry args={[1.4, 0.5, 0.7]} /><meshStandardMaterial color="#e6f7ff" transparent opacity={0.35} roughness={0.1} /></mesh>
          {[['#ff9cc2', -0.45], ['#ffd36b', -0.15], ['#c8b6f2', 0.15], ['#b5ead7', 0.45]].map(([c, x], i) => (
            <mesh key={i} position={[x, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.1, 0.05, 8, 14]} /><Mat color={c} /></mesh>
          ))}
          {[-0.3, 0.3].map((x) => <mesh key={x} position={[x, 0.32, 0]}><sphereGeometry args={[0.1, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><Mat color="#e8b07a" /></mesh>)}
        </group>
        {/* register */}
        <group position={[1.9, 1.08, 0]}>
          <mesh position={[0, 0.15, 0]}><boxGeometry args={[0.5, 0.3, 0.4]} /><Mat color="#c8b6f2" /></mesh>
          <mesh position={[0, 0.38, 0.1]} rotation={[-0.4, 0, 0]}><boxGeometry args={[0.4, 0.22, 0.05]} /><Mat color="#8f74d6" /></mesh>
        </group>
        {brewing && (
          <group position={[0.3, 1.16, -0.1]}>
            <DrinkCup color={drink?.color} />
          </group>
        )}
      </group>
      {/* back counter + coffee machine */}
      <group position={[20, 0, 27.65]}>
        <mesh castShadow position={[0, 0.47, 0]}><boxGeometry args={[8, 0.94, 0.7]} /><Mat color="#fff6e9" /></mesh>
        <mesh position={[0, 0.98, 0]}><boxGeometry args={[8.05, 0.06, 0.75]} /><Mat color="#b5ead7" /></mesh>
        <group position={[1.8, 1.0, 0]}>
          <mesh castShadow position={[0, 0.45, 0]}><boxGeometry args={[1.1, 0.9, 0.6]} /><Mat color="#ff9cc2" metal={0.3} rough={0.35} /></mesh>
          <mesh position={[0, 0.95, 0]}><boxGeometry args={[1.15, 0.1, 0.65]} /><Mat color="#e5739d" /></mesh>
          {[-0.25, 0.25].map((x) => <mesh key={x} position={[x, 0.3, -0.33]}><cylinderGeometry args={[0.05, 0.04, 0.15]} /><Mat color="#c0c0c8" metal={0.8} rough={0.2} /></mesh>)}
          <mesh position={[0, 0.65, -0.31]}><circleGeometry args={[0.1, 16]} /><meshStandardMaterial color="#fff" emissive="#9fffcf" emissiveIntensity={0.6} /></mesh>
          <Steam position={[0, 1.0, 0]} active={!!brewing} />
        </group>
        {/* syrup bottles */}
        {['#ff7eb3', '#ffd36b', '#c8b6f2', '#9fd8ff', '#b5ead7'].map((c, i) => (
          <mesh key={c} position={[-3.3 + i * 0.3, 1.2, 0]}><cylinderGeometry args={[0.07, 0.08, 0.38, 10]} /><Mat color={c} rough={0.25} /></mesh>
        ))}
        {/* cup stack */}
        {[0, 1, 2, 3].map((i) => <mesh key={i} position={[-1.2, 1.08 + i * 0.12, 0]}><cylinderGeometry args={[0.09, 0.07, 0.12, 12]} /><Mat color="#ffffff" /></mesh>)}
      </group>
      <MenuBoard />
      <NPC id="barista" position={[20, 0, 26.65]} rotation={Math.PI} {...NPC_LOOKS.barista} busy={!!brewing} bubbleY={2.6} />
      {/* tables inside */}
      <CafeTable position={[16.9, 0, 22.2]} />
      <CafeTable position={[23.1, 0, 22.2]} />
      {/* mug shelf (easter egg) */}
      <group position={[24.75, 1.25, 23.4]}>
        <mesh><boxGeometry args={[0.4, 0.06, 1.4]} /><Mat color="#d9a982" /></mesh>
        <group position={[0, 0.12, 0]}>
          <mesh><cylinderGeometry args={[0.1, 0.09, 0.18, 12]} /><Mat color="#c8b6f2" /></mesh>
          <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.05, 0.015, 6, 10]} /><Mat color="#c8b6f2" /></mesh>
        </group>
        <mesh position={[0, 0.12, 0.45]}><cylinderGeometry args={[0.07, 0.07, 0.18, 10]} /><Mat color="#7cc98f" /></mesh>
        <mesh position={[0, 0.12, -0.45]}><sphereGeometry args={[0.1, 10, 8]} /><Mat color="#ffd36b" /></mesh>
      </group>
      {/* outdoor seating */}
      <CafeTable position={[16.5, 0, 16.8]} umbrella="#f7a8c4" />
      <CafeTable position={[23.5, 0, 16.8]} umbrella="#b5ead7" />
      <Sign position={[22.9, 0, 18.9]} rotation={[0, Math.PI, 0]} text="Today: Drama ☕" post={0.6} width={1.3} height={0.6} bg="#3d4a45" color="#fff6e9" border="#e8c9a8" />
      {[15.3, 24.7].map((x) => <Bush key={x} position={[x, 0, 19.2]} scale={0.8} />)}
      <Glow position={[21.8, 2.1, 27.4]} color="#ffb3cf" size={1.6} opacity={0.4} />
    </group>
  )
}
