import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// A cute stylised chibi character built entirely from primitives.
// `anim` is a mutable object read every frame: { speed, grounded, action, actionT, walkPhase }

const Std = ({ color, rough = 0.75, metal = 0, emissive, ei = 0, transparent, opacity }) => (
  <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={emissive || '#000'} emissiveIntensity={ei} transparent={transparent} opacity={opacity ?? 1} />
)

function lighten(hex, amt) {
  const c = new THREE.Color(hex)
  c.lerp(new THREE.Color('#ffffff'), amt)
  return '#' + c.getHexString()
}
function darken(hex, amt) {
  const c = new THREE.Color(hex)
  c.lerp(new THREE.Color('#2a1a2e'), amt)
  return '#' + c.getHexString()
}

function Hair({ style, color }) {
  const dark = darken(color, 0.15)
  return (
    <group>
      {/* base cap behind face */}
      <mesh castShadow position={[0, 0.31, -0.06]} scale={style === 'bob' ? [1.12, 1.0, 1.06] : [1.06, 1.03, 1.0]}>
        <sphereGeometry args={[0.36, 24, 18]} />
        <Std color={color} rough={0.6} />
      </mesh>
      {/* bangs */}
      {[-0.17, -0.06, 0.06, 0.17].map((x, i) => (
        <mesh key={i} position={[x, 0.53 - Math.abs(x) * 0.35, 0.23 - Math.abs(x) * 0.25]} rotation={[0.5, 0, -x * 1.6]} scale={[1, 0.62, 0.6]}>
          <sphereGeometry args={[0.12, 12, 10]} />
          <Std color={i % 2 ? color : dark} rough={0.6} />
        </mesh>
      ))}
      {style === 'long' && (
        <>
          <mesh castShadow position={[0, 0.02, -0.17]} scale={[1.18, 1, 0.6]}>
            <capsuleGeometry args={[0.28, 0.42, 6, 16]} />
            <Std color={color} rough={0.6} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.29, 0.1, 0.04]} rotation={[0.1, 0, s * 0.08]}>
              <capsuleGeometry args={[0.085, 0.34, 6, 10]} />
              <Std color={dark} rough={0.6} />
            </mesh>
          ))}
        </>
      )}
      {style === 'buns' &&
        [-1, 1].map((s) => (
          <group key={s}>
            <mesh castShadow position={[s * 0.22, 0.63, -0.04]}>
              <sphereGeometry args={[0.14, 16, 12]} />
              <Std color={color} rough={0.6} />
            </mesh>
            <mesh position={[s * 0.27, 0.2, 0.05]}>
              <capsuleGeometry args={[0.06, 0.18, 4, 8]} />
              <Std color={dark} rough={0.6} />
            </mesh>
          </group>
        ))}
      {style === 'ponytail' && (
        <group name="ponytail" position={[0, 0.5, -0.33]}>
          <mesh>
            <sphereGeometry args={[0.1, 12, 10]} />
            <Std color={dark} />
          </mesh>
          <mesh castShadow position={[0, -0.22, -0.1]} rotation={[0.45, 0, 0]}>
            <capsuleGeometry args={[0.11, 0.32, 6, 12]} />
            <Std color={color} rough={0.6} />
          </mesh>
        </group>
      )}
      {style === 'bob' &&
        [-1, 1].map((s) => (
          <mesh key={s} castShadow position={[s * 0.29, 0.16, 0.06]} scale={[0.6, 1, 0.8]}>
            <sphereGeometry args={[0.16, 12, 10]} />
            <Std color={color} rough={0.6} />
          </mesh>
        ))}
    </group>
  )
}

function HairAccessory({ type }) {
  if (type === 'bow')
    return (
      <group position={[0.24, 0.6, 0.06]} rotation={[0, 0.3, -0.5]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.08, 0, 0]} rotation={[0, 0, (s * Math.PI) / 2]}>
            <coneGeometry args={[0.075, 0.15, 12]} />
            <Std color="#ff6fa3" rough={0.5} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.045, 10, 8]} />
          <Std color="#ff4f8f" />
        </mesh>
      </group>
    )
  if (type === 'flower')
    return (
      <group position={[0.27, 0.5, 0.13]} rotation={[0, 0.9, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.05, Math.sin((i / 5) * Math.PI * 2) * 0.05, 0]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <Std color="#fff" />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.03, 8, 6]} />
          <Std color="#ffd23f" />
        </mesh>
      </group>
    )
  if (type === 'clips')
    return (
      <group>
        {[[0.21, 0.52, 0.22], [0.28, 0.42, 0.18], [-0.24, 0.48, 0.2]].map((p, i) => (
          <mesh key={i} position={p} rotation={[0.3, 0.5, i]}>
            <octahedronGeometry args={[0.045]} />
            <Std color="#ffd84d" emissive="#ffcc33" ei={0.4} metal={0.3} rough={0.3} />
          </mesh>
        ))}
      </group>
    )
  return null
}

function Hat({ type, color }) {
  if (type === 'beret')
    return (
      <group position={[0.02, 0.63, -0.02]} rotation={[0, 0, 0.25]}>
        <mesh castShadow scale={[1.15, 0.36, 1.15]}>
          <sphereGeometry args={[0.32, 20, 12]} />
          <Std color="#e5739d" />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.015, 0.02, 0.06]} />
          <Std color="#c9567f" />
        </mesh>
      </group>
    )
  if (type === 'sunhat')
    return (
      <group position={[0, 0.6, -0.02]} rotation={[-0.12, 0, 0.06]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.62, 0.03, 28]} />
          <Std color="#ffe9b8" />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.32, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Std color="#ffe9b8" />
        </mesh>
        <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.31, 0.03, 8, 28]} />
          <Std color={color} />
        </mesh>
      </group>
    )
  if (type === 'crown')
    return (
      <group position={[0, 0.7, 0]} rotation={[-0.1, 0, 0.12]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.16, 0.15, 0.1, 16, 1, true]} />
          <meshStandardMaterial color="#ffd54a" metalness={0.7} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2
          return (
            <group key={i}>
              <mesh position={[Math.cos(a) * 0.15, 0.09, Math.sin(a) * 0.15]}>
                <coneGeometry args={[0.04, 0.09, 6]} />
                <meshStandardMaterial color="#ffd54a" metalness={0.7} roughness={0.25} />
              </mesh>
              <mesh position={[Math.cos(a) * 0.16, 0, Math.sin(a) * 0.16]}>
                <sphereGeometry args={[0.022, 8, 6]} />
                <Std color={['#ff6fa3', '#8fd1ff', '#b98cff'][i % 3]} emissive="#fff" ei={0.2} />
              </mesh>
            </group>
          )
        })}
      </group>
    )
  if (type === 'cat')
    return (
      <group>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.2, 0.64, 0]} rotation={[0, 0, -s * 0.35]}>
            <mesh castShadow>
              <coneGeometry args={[0.1, 0.2, 4]} />
              <Std color={color} />
            </mesh>
            <mesh position={[0, -0.01, 0.03]} scale={0.6}>
              <coneGeometry args={[0.1, 0.2, 4]} />
              <Std color="#ffc2d8" />
            </mesh>
          </group>
        ))}
      </group>
    )
  if (type === 'bunny')
    return (
      <group>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.13, 0.75, -0.02]} rotation={[0, 0, -s * 0.18]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.07, 0.32, 6, 10]} />
              <Std color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, 0.045]} scale={[0.55, 0.8, 0.4]}>
              <capsuleGeometry args={[0.07, 0.32, 6, 10]} />
              <Std color="#ffc2d8" />
            </mesh>
          </group>
        ))}
      </group>
    )
  if (type === 'tophat')
    return (
      <group position={[0, 0.66, 0]} rotation={[0, 0, 0.1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.03, 20]} />
          <Std color="#4a3b5c" />
        </mesh>
        <mesh position={[0, 0.17, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.22, 0.32, 20]} />
          <Std color="#4a3b5c" />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.225, 0.225, 0.06, 20]} />
          <Std color="#f7a8c4" />
        </mesh>
      </group>
    )
  if (type === 'gardener')
    return (
      <group position={[0, 0.62, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.52, 0.03, 20]} />
          <Std color="#e8c27a" />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.24, 0.3, 0.2, 20]} />
          <Std color="#e8c27a" />
        </mesh>
      </group>
    )
  return null
}

function Bag({ type, color }) {
  if (type === 'purse')
    return (
      <group>
        <mesh position={[0.02, 0.36, 0.2]} rotation={[0, 0, -0.95]}>
          <boxGeometry args={[0.62, 0.025, 0.02]} />
          <Std color="#c9567f" />
        </mesh>
        <mesh castShadow position={[0.27, 0.12, 0.12]} rotation={[0, 0, 0.785]} scale={[1, 1, 0.5]}>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <Std color="#ff6fa3" rough={0.4} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.27 + s * 0.05, 0.17, 0.12]} scale={[1, 1, 0.5]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <Std color="#ff6fa3" rough={0.4} />
          </mesh>
        ))}
      </group>
    )
  if (type === 'backpack')
    return (
      <group position={[0, 0.38, -0.25]}>
        <mesh castShadow>
          <boxGeometry args={[0.36, 0.38, 0.16]} />
          <Std color="#fff4fa" />
        </mesh>
        <mesh position={[0, -0.06, -0.09]}>
          <boxGeometry args={[0.24, 0.16, 0.04]} />
          <Std color={color} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.09, 0.29, 0]} rotation={[0, 0, s * -0.15]}>
            <capsuleGeometry args={[0.045, 0.16, 4, 8]} />
            <Std color="#fff4fa" />
          </mesh>
        ))}
        <mesh position={[0, 0.02, -0.085]}>
          <sphereGeometry args={[0.03, 8, 6]} />
          <Std color="#4a3b5c" />
        </mesh>
      </group>
    )
  if (type === 'tote')
    return (
      <group position={[-0.31, 0.16, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.06, 0.28, 0.26]} />
          <Std color="#b5ead7" />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.09, 0.012, 6, 16, Math.PI]} />
          <Std color="#7cc9a6" />
        </mesh>
        <mesh position={[-0.035, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <Std color="#ff8fb8" />
        </mesh>
      </group>
    )
  return null
}

export function DrinkCup({ color = '#c89b7b' }) {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.065, 0.05, 0.16, 14]} />
        <Std color="#fffaf3" />
      </mesh>
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.067, 0.058, 0.07, 14]} />
        <Std color={color} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.025, 14]} />
        <Std color="#f7a8c4" />
      </mesh>
      <mesh position={[0.02, 0.16, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.14]} />
        <Std color="#ff6fa3" />
      </mesh>
    </group>
  )
}

export default function Character({ look, anim, extras = {}, drinkColor = null }) {
  const root = useRef()
  const legL = useRef(), legR = useRef(), armL = useRef(), armR = useRef()
  const torso = useRef(), head = useRef(), eyes = useRef(), tail = useRef()
  const blink = useRef({ next: 2 + Math.random() * 3, t: 0 })
  const skin = look.skin || '#f6d2bd'
  const outfit = look.outfitColor
  const outfitLight = useMemo(() => lighten(outfit, 0.35), [outfit])
  const outfitDark = useMemo(() => darken(outfit, 0.18), [outfit])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const a = anim
    const spd = a.speed || 0
    const moving = spd > 0.2
    if (moving) a.walkPhase = (a.walkPhase || 0) + dt * (4 + spd * 1.5)
    const ph = a.walkPhase || 0
    const amp = moving ? Math.min(spd / 4.5, 1.4) * 0.65 : 0
    const sw = Math.sin(ph) * amp
    const lerp = (ref, axis, v, k = 12) => { if (ref.current) ref.current.rotation[axis] = THREE.MathUtils.lerp(ref.current.rotation[axis], v, Math.min(1, dt * k)) }

    let lx = sw, rx = -sw, alx = -sw * 0.9, arx = sw * 0.9, alz = 0.14, arz = -0.14
    if (!a.grounded) { lx = -0.5; rx = 0.3; alz = 2.3; arz = -2.3; alx = 0; arx = 0 }
    const act = a.actionT > 0 ? a.action : null
    if (act === 'wave') { arz = -2.5; arx = Math.sin(t * 14) * 0.3 }
    if (act === 'cheer') { alz = 2.6 + Math.sin(t * 16) * 0.2; arz = -2.6 - Math.sin(t * 16) * 0.2; alx = arx = 0 }
    if (act === 'drink' || (drinkColor && !moving && !act)) { arx = act === 'drink' ? -2.1 : -0.9; arz = act === 'drink' ? -0.3 : -0.2 }
    else if (drinkColor && moving) { arx = -0.8 + sw * 0.2 }
    lerp(legL, 'x', lx); lerp(legR, 'x', rx)
    lerp(armL, 'x', alx); lerp(armR, 'x', arx)
    lerp(armL, 'z', alz); lerp(armR, 'z', arz)

    if (root.current) {
      const bob = moving ? Math.abs(Math.sin(ph)) * 0.07 * Math.min(amp * 1.6, 1) : 0
      const hop = act === 'cheer' ? Math.abs(Math.sin(t * 9)) * 0.12 : 0
      root.current.position.y = bob + hop
      root.current.rotation.z = moving ? Math.sin(ph) * 0.04 : 0
      root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, moving ? Math.min(spd / 30, 0.2) : 0, dt * 6)
    }
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 2.2) * 0.015
    if (head.current) {
      head.current.rotation.z = moving ? 0 : Math.sin(t * 0.8) * 0.06
      head.current.rotation.x = moving ? 0.05 : Math.sin(t * 0.5) * 0.04
    }
    if (tail.current) tail.current.rotation.x = Math.sin(ph * 2) * 0.05 * (moving ? 1 : 0.2)
    // blink
    const b = blink.current
    b.t += dt
    if (eyes.current) {
      if (b.t > b.next) {
        eyes.current.scale.y = 0.1
        if (b.t > b.next + 0.12) { b.t = 0; b.next = 2 + Math.random() * 3.5 }
      } else eyes.current.scale.y = act === 'cheer' ? 0.5 : 1
    }
  })

  return (
    <group ref={root}>
      {/* legs */}
      {[[legL, 0.11], [legR, -0.11]].map(([ref, x], i) => (
        <group key={i} ref={ref} position={[x, 0.47, 0]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.07, 0.06, 0.38, 10]} />
            <Std color={skin} />
          </mesh>
          <mesh castShadow position={[0, -0.42, 0.04]} scale={[1, 0.7, 1.35]}>
            <sphereGeometry args={[0.085, 12, 10]} />
            <Std color={extras.shoes || '#fff4fa'} rough={0.4} />
          </mesh>
        </group>
      ))}
      <group ref={torso} position={[0, 0.45, 0]}>
        {/* skirt / dress */}
        <mesh castShadow position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.2, 0.36, 0.36, 20]} />
          <Std color={outfit} />
        </mesh>
        <mesh position={[0, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.355, 0.03, 8, 28]} />
          <Std color={outfitLight} />
        </mesh>
        <mesh castShadow position={[0, 0.47, 0]}>
          <cylinderGeometry args={[0.16, 0.2, 0.28, 18]} />
          <Std color={extras.top || outfit} />
        </mesh>
        {extras.apron && (
          <mesh position={[0, 0.25, 0.2]} rotation={[-0.25, 0, 0]}>
            <boxGeometry args={[0.3, 0.42, 0.02]} />
            <Std color={extras.apron} />
          </mesh>
        )}
        {/* collar */}
        <mesh position={[0, 0.61, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.13, 0.035, 8, 20]} />
          <Std color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.5, 0.17]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <Std color={outfitDark} />
        </mesh>
        {/* arms */}
        {[[armL, 0.22], [armR, -0.22]].map(([ref, x], i) => (
          <group key={i} ref={ref} position={[x, 0.56, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.09, 12, 10]} />
              <Std color={extras.top || outfit} />
            </mesh>
            <mesh castShadow position={[0, -0.19, 0]}>
              <cylinderGeometry args={[0.05, 0.045, 0.3, 8]} />
              <Std color={skin} />
            </mesh>
            <mesh position={[0, -0.36, 0]}>
              <sphereGeometry args={[0.062, 10, 8]} />
              <Std color={skin} />
            </mesh>
            {i === 1 && drinkColor && (
              <group position={[0, -0.42, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                  <DrinkCup color={drinkColor} />
                </group>
              </group>
            )}
          </group>
        ))}
        <Bag type={look.bag} color={outfit} />
        {/* head */}
        <group ref={head} position={[0, 0.64, 0]}>
          <mesh castShadow position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.34, 28, 22]} />
            <Std color={skin} rough={0.85} />
          </mesh>
          {/* ears */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.33, 0.27, 0]} scale={[0.5, 1, 0.8]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <Std color={skin} />
            </mesh>
          ))}
          <group ref={eyes} position={[0, 0.28, 0]}>
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.12, 0, 0.29]}>
                <mesh scale={[1, 1.35, 0.6]}>
                  <sphereGeometry args={[0.055, 14, 12]} />
                  <meshStandardMaterial color="#3b2a3f" roughness={0.2} />
                </mesh>
                <mesh position={[-0.018, 0.03, 0.03]}>
                  <sphereGeometry args={[0.018, 8, 6]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                {extras.lashes !== false && (
                  <mesh position={[s * 0.045, 0.06, 0.01]} rotation={[0, 0, s * -0.6]}>
                    <boxGeometry args={[0.04, 0.012, 0.01]} />
                    <meshBasicMaterial color="#3b2a3f" />
                  </mesh>
                )}
              </group>
            ))}
          </group>
          {/* blush */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.2, 0.19, 0.265]} scale={[1.4, 0.7, 0.4]}>
              <sphereGeometry args={[0.05, 10, 8]} />
              <meshBasicMaterial color="#ff9fbf" transparent opacity={0.75} />
            </mesh>
          ))}
          {/* smile */}
          <mesh position={[0, 0.17, 0.322]} rotation={[0.25, 0, Math.PI]}>
            <torusGeometry args={[0.04, 0.011, 6, 14, Math.PI]} />
            <meshBasicMaterial color="#9b3d5c" />
          </mesh>
          {extras.mustache && (
            <group position={[0, 0.2, 0.32]}>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 0.05, 0, 0]} scale={[1.3, 0.55, 0.6]}>
                  <sphereGeometry args={[0.04, 8, 6]} />
                  <Std color="#6b4a3a" />
                </mesh>
              ))}
            </group>
          )}
          {extras.glasses && (
            <group position={[0, 0.28, 0.33]}>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 0.12, 0, 0]}>
                  <torusGeometry args={[0.075, 0.012, 6, 18]} />
                  <Std color="#6b4a3a" />
                </mesh>
              ))}
            </group>
          )}
          <group ref={tail}>
            <Hair style={look.hairStyle} color={look.hairColor} />
          </group>
          <HairAccessory type={look.hat === 'sunhat' ? 'none' : look.hairAccessory} />
          <Hat type={look.hat} color={outfit} />
        </group>
      </group>
    </group>
  )
}
