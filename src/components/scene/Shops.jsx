import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mat, Sign, Bush, Glow, useTextTexture } from './Props'
import NPC, { NPC_LOOKS } from './NPC'
import { SHOPS, LOCATIONS } from '../../config/gameConfig'

// Shop fronts face west (-x). Body spans x 31..37.
function Shop({ z, id, wall, awning, trim, display }) {
  const shop = SHOPS[id]
  const tex = useTextTexture(shop.name, { w: 512, h: 128, bg: '#fffaf3', border: awning, color: '#4a3b5c', size: 64 })
  return (
    <group position={[34, 0, z]}>
      <mesh castShadow receiveShadow position={[0, 2.25, 0]}>
        <boxGeometry args={[6, 4.5, 6]} />
        <Mat color={wall} />
      </mesh>
      {/* roof */}
      <mesh castShadow position={[0, 4.75, 0]}>
        <boxGeometry args={[6.5, 0.5, 6.5]} />
        <Mat color={trim} />
      </mesh>
      <mesh castShadow position={[0.4, 5.6, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]}>
        <boxGeometry args={[4.5, 1.2, 5.6]} />
        <Mat color={awning} />
      </mesh>
      {/* sign board on facade */}
      <mesh position={[-3.02, 3.9, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[4.4, 1.1]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      {/* striped awning */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} castShadow position={[-3.5, 3.05, -2.5 + i * 1]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[1.3, 0.06, 1]} />
          <Mat color={i % 2 ? '#ffffff' : awning} />
        </mesh>
      ))}
      {/* scalloped edge */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-4.08, 2.68, -2.75 + i * 0.5]}>
          <sphereGeometry args={[0.14, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Mat color={i % 2 ? awning : '#ffffff'} />
        </mesh>
      ))}
      {/* door */}
      <mesh position={[-3.02, 1.1, 1.6]}>
        <boxGeometry args={[0.06, 2.2, 1.2]} />
        <Mat color={trim} />
      </mesh>
      <mesh position={[-3.07, 1.4, 1.6]}>
        <boxGeometry args={[0.04, 0.9, 0.8]} />
        <meshStandardMaterial color="#dff3ff" emissive="#fff2c4" emissiveIntensity={0.4} />
      </mesh>
      {/* display window */}
      <mesh position={[-3.02, 1.5, -1.0]}>
        <boxGeometry args={[0.08, 2.0, 3.0]} />
        <Mat color="#ffffff" />
      </mesh>
      <mesh position={[-3.07, 1.5, -1.0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 1.8]} />
        <meshStandardMaterial color="#fff7fb" emissive="#ffe9f2" emissiveIntensity={0.5} />
      </mesh>
      {display}
      {/* planter */}
      <mesh position={[-3.3, 0.25, -1.0]}>
        <boxGeometry args={[0.4, 0.5, 3.0]} />
        <Mat color={trim} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-3.3, 0.6, -2.2 + i * 0.48]}>
          <sphereGeometry args={[0.15, 8, 6]} />
          <Mat color={['#ff9cc2', '#ffd36b', '#c8b6f2'][i % 3]} />
        </mesh>
      ))}
      {/* keeper outside + little stall */}
      <group position={[-4.1, 0, -0.5]}>
        <mesh castShadow position={[-0.2, 0.5, 1.3]}>
          <boxGeometry args={[0.8, 1.0, 1.0]} />
          <Mat color={awning} />
        </mesh>
        <mesh position={[-0.2, 1.03, 1.3]}>
          <boxGeometry args={[0.9, 0.06, 1.1]} />
          <Mat color="#fffaf3" />
        </mesh>
      </group>
      <NPC id={id} position={[-4.6, 0, -0.9]} rotation={-Math.PI / 2} {...NPC_LOOKS[id]} />
    </group>
  )
}

function Mannequin({ position, color }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.15, 0.3, 0.6, 12]} /><Mat color={color} /></mesh>
      <mesh position={[0, 0.95, 0]}><sphereGeometry args={[0.13, 10, 8]} /><Mat color="#fff6e9" /></mesh>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.02, 0.02, 0.4]} /><Mat color="#8f74d6" /></mesh>
    </group>
  )
}

function Bunting({ from, to, y = 4.2 }) {
  const n = 14
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.children.forEach((m, i) => { m.rotation.x = Math.sin(clock.elapsedTime * 2 + i) * 0.15 })
  })
  return (
    <group ref={ref}>
      {Array.from({ length: n }).map((_, i) => {
        const k = (i + 0.5) / n
        const x = from[0] + (to[0] - from[0]) * k
        const z = from[1] + (to[1] - from[1]) * k
        return (
          <mesh key={i} position={[x, y - Math.sin(k * Math.PI) * 0.6, z]} rotation={[0, Math.atan2(to[0] - from[0], to[1] - from[1]) + Math.PI / 2, Math.PI]}>
            <coneGeometry args={[0.18, 0.4, 3]} />
            <Mat color={['#ff9cc2', '#ffd36b', '#a9d6f5', '#c8b6f2', '#b5ead7'][i % 5]} />
          </mesh>
        )
      })}
    </group>
  )
}

function TinyVillager() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.max(0, Math.sin(clock.elapsedTime * 1.3) * 0.25)
  })
  return (
    <group position={[21.8, 0, -20.5]}>
      <group ref={ref}>
        <NPC id="tinyNpc" position={[0, 0, 0]} rotation={Math.PI / 2} scale={0.42} faceRange={4} {...NPC_LOOKS.tiny} />
      </group>
    </group>
  )
}

export default function Shops() {
  return (
    <group>
      <Shop
        id="clothing" z={-19} wall="#ffe3ef" awning="#f07aa8" trim="#fff6e9"
        display={<group>{['#f7a8c4', '#c8b6f2', '#a9d6f5'].map((c, i) => <Mannequin key={c} position={[-2.7, 0.4, -2 + i]} color={c} />)}</group>}
      />
      <Shop
        id="accessories" z={-11} wall="#e6dcff" awning="#8f74d6" trim="#fff6e9"
        display={
          <group>
            {[['#ff6fa3', -2], ['#ffd54a', -1.3], ['#9fd8ff', -0.6], ['#b5ead7', 0.1]].map(([c, z], i) => (
              <group key={i} position={[-2.7, 1.4 + (i % 2) * 0.4, z]}>
                {[-1, 1].map((s) => <mesh key={s} position={[0, 0, s * 0.1]} rotation={[s * Math.PI / 2, 0, 0]}><coneGeometry args={[0.1, 0.18, 10]} /><Mat color={c} /></mesh>)}
              </group>
            ))}
          </group>
        }
      />
      <Shop
        id="gifts" z={-3} wall="#d8f5e8" awning="#5fbf98" trim="#fff6e9"
        display={
          <group>
            {[['#ff9cc2', -2], ['#ffd36b', -1.2], ['#c8b6f2', -0.4]].map(([c, z], i) => (
              <group key={i} position={[-2.7, 0.8 + i * 0.15, z]}>
                <mesh><boxGeometry args={[0.45, 0.45, 0.45]} /><Mat color={c} /></mesh>
                <mesh><boxGeometry args={[0.47, 0.1, 0.47]} /><Mat color="#fff" /></mesh>
              </group>
            ))}
          </group>
        }
      />
      {/* street decor */}
      <Sign position={[24.2, 0, 6]} rotation={[0, -0.4, 0]} text={LOCATIONS.shops.sign} sub="wallets beware" width={2.6} height={0.9} border="#f07aa8" />
      {[[23.6, 30.2, -24], [23.6, 30.2, -8.5]].map(([x1, x2, z], i) => <Bunting key={i} from={[x1, z]} to={[x2, z + 0.2]} />)}
      {[[23.6, -24], [30.2, -24], [23.6, -8.5], [30.2, -8.5]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 2.1, z]}><cylinderGeometry args={[0.07, 0.08, 4.2, 8]} /><Mat color="#fff6e9" /></mesh>
      ))}
      {/* flower stall */}
      <group position={[23.2, 0, -10]}>
        <mesh castShadow position={[0, 0.45, 0]}><boxGeometry args={[1.2, 0.9, 1.8]} /><Mat color="#d9a982" /></mesh>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[(i % 3) * 0.35 - 0.35, 1.05, Math.floor(i / 3) * 0.4 - 0.6]}>
            <sphereGeometry args={[0.16, 8, 6]} />
            <Mat color={['#ff9cc2', '#ffd36b', '#c8b6f2', '#ffffff', '#ffb98a'][i % 5]} />
          </mesh>
        ))}
        <mesh position={[0, 2.2, 0]}><coneGeometry args={[1.4, 0.5, 4]} /><Mat color="#f7a8c4" flat /></mesh>
        {[-0.5, 0.5].map((z) => <mesh key={z} position={[0, 1.4, z * 1.4]}><cylinderGeometry args={[0.04, 0.04, 1.2]} /><Mat color="#fff" /></mesh>)}
      </group>
      {/* barrel + tiny villager easter egg */}
      <group position={[22.6, 0, -20.5]}>
        <mesh castShadow position={[0, 0.5, 0]}><cylinderGeometry args={[0.42, 0.42, 1, 14]} /><Mat color="#c48f6a" /></mesh>
        {[0.2, 0.8].map((y) => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.43, 0.03, 6, 20]} /><Mat color="#8f74d6" /></mesh>)}
      </group>
      <TinyVillager />
      <Bush position={[37.8, 0, -15]} scale={0.8} />
      <Glow position={[34, 0.8, -15]} color="#ffe27a" size={1.5} opacity={0.3} />
    </group>
  )
}
