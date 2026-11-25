import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Character from './Character'
import { player } from '../../game/playerState'
import { useGame } from '../../store/useGame'
import { useTextTexture } from './Props'

const BASE = { skin: '#f6d2bd', hairStyle: 'bob', hairAccessory: 'none', hat: 'none', bag: 'none' }

export function TalkBubble({ y = 2.3, text = '!' }) {
  const ref = useRef()
  const tex = useTextTexture(text, { w: 128, h: 128, size: 80, bg: '#ffffff', border: '#f07aa8', color: '#e5739d' })
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = y + Math.sin(clock.elapsedTime * 3) * 0.08
  })
  return (
    <sprite ref={ref} position={[0, y, 0]} scale={[0.45, 0.45, 0.45]}>
      <spriteMaterial map={tex} transparent depthWrite={false} />
    </sprite>
  )
}

export default function NPC({ id, position, rotation = 0, look, extras, scale = 1, bubbleY = 2.1, busy = false, faceRange = 6 }) {
  const group = useRef()
  const anim = useMemo(() => ({ speed: 0, grounded: true, action: null, actionT: 0, walkPhase: 0 }), [])
  const talked = useGame((s) => !!s.talked[id])
  const fullLook = useMemo(() => ({ ...BASE, ...look }), [look])

  useFrame((_, dt) => {
    if (!group.current) return
    const dx = player.x - position[0], dz = player.z - position[2]
    const d = Math.hypot(dx, dz)
    const target = d < faceRange ? Math.atan2(dx, dz) : rotation
    let diff = ((target - group.current.rotation.y + Math.PI) % (Math.PI * 2)) - Math.PI
    if (diff < -Math.PI) diff += Math.PI * 2
    group.current.rotation.y += diff * Math.min(1, dt * 4)
    if (busy) { anim.action = 'wave'; anim.actionT = 0.2 }
    else if (d < 2.4 && anim.actionT <= 0 && Math.random() < 0.004) { anim.action = 'wave'; anim.actionT = 1 }
    if (anim.actionT > 0) anim.actionT -= dt
  })

  return (
    <group position={position}>
      <group ref={group} rotation={[0, rotation, 0]} scale={scale}>
        <Character look={fullLook} anim={anim} extras={extras} />
      </group>
      {!talked && <TalkBubble y={bubbleY * scale + 0.1} />}
    </group>
  )
}

export const NPC_LOOKS = {
  barista: { look: { hairColor: '#f2e6d8', outfitColor: '#b5ead7', hairStyle: 'buns', hat: 'bunny' }, extras: { apron: '#fff6e9', top: '#ffffff' } },
  mayor: { look: { hairColor: '#8a8a9a', outfitColor: '#8f74d6', hat: 'tophat', skin: '#f2c9a8' }, extras: { mustache: true, glasses: true, lashes: false, top: '#c8b6f2' } },
  gardener: { look: { hairColor: '#c98b5a', outfitColor: '#9fdcbc', hat: 'gardener', hairStyle: 'ponytail', skin: '#e9b896' }, extras: { apron: '#a7795a' } },
  kid: { look: { hairColor: '#2b2030', outfitColor: '#ffe7a0', hairStyle: 'bob', hat: 'cat' }, extras: {} },
  clothing: { look: { hairColor: '#d46a8c', outfitColor: '#ff9cc2', hairStyle: 'long', hairAccessory: 'flower' }, extras: { glasses: true } },
  accessories: { look: { hairColor: '#e8c27a', outfitColor: '#a9d6f5', hairStyle: 'bob', hat: 'crown' }, extras: { lashes: false, mustache: true } },
  gifts: { look: { hairColor: '#e6e1ec', outfitColor: '#c8b6f2', hairStyle: 'buns', skin: '#f2c9a8' }, extras: { glasses: true, apron: '#ffe7a0' } },
  tiny: { look: { hairColor: '#7ab8e0', outfitColor: '#ffb98a', hairStyle: 'buns', hat: 'cat' }, extras: {} },
}

export { THREE }
