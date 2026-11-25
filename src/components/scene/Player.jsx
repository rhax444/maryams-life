import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Character from './Character'
import { useGame, isBusy } from '../../store/useGame'
import { player, cam } from '../../game/playerState'
import { input, moveVector } from '../../game/input'
import { resolveCollisions } from '../../game/collision'
import {
  COLLIDERS_TOWN, COLLIDERS_SECRET, INTERACTABLES_TOWN, INTERACTABLES_SECRET,
  HEART_SPOTS, KEY_SPOTS, BOUNDS, regionAt, groundHeight,
} from '../../game/layout'
import { CAFE } from '../../config/gameConfig'
import { audio } from '../../audio/sound'

const WALK = 4.2, RUN = 7.6, GRAVITY = -20, JUMP = 7, RADIUS = 0.38
const vel = { x: 0, z: 0 }
const pos = { x: 0, z: 0 }

function angleLerp(a, b, k) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * k
}

export default function Player() {
  const group = useRef()
  const lastStep = useRef(0)
  const look = useGame((s) => s.look)
  const held = useGame((s) => s.heldDrink)
  const drinkColor = held ? CAFE.menu.find((d) => d.id === held)?.color : null

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const s = useGame.getState()
    const busy = isBusy(s)
    const town = s.scene === 'town'
    const colliders = town ? COLLIDERS_TOWN : COLLIDERS_SECRET
    const active = (cond) => (cond === 'locked' ? !s.unlocked : true)

    // --- movement ---
    let tx = 0, tz = 0
    if (!busy) {
      const mv = moveVector()
      const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw)
      const rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw)
      const sp = mv.run ? RUN : WALK
      tx = (fx * mv.y + rx * mv.x) * sp
      tz = (fz * mv.y + rz * mv.x) * sp
    }
    const accel = Math.min(1, dt * (busy ? 14 : 9))
    vel.x += (tx - vel.x) * accel
    vel.z += (tz - vel.z) * accel
    pos.x = player.x + vel.x * dt
    pos.z = player.z + vel.z * dt
    resolveCollisions(pos, RADIUS, colliders, active)
    if (town) {
      pos.x = Math.max(-BOUNDS, Math.min(BOUNDS, pos.x))
      pos.z = Math.max(-BOUNDS, Math.min(BOUNDS, pos.z))
    }
    const evx = (pos.x - player.x) / Math.max(dt, 1e-4)
    const evz = (pos.z - player.z) / Math.max(dt, 1e-4)
    player.x = pos.x
    player.z = pos.z
    player.speed = Math.min(Math.hypot(evx, evz), RUN + 1)
    if (Math.hypot(tx, tz) > 0.3) player.facing = angleLerp(player.facing, Math.atan2(tx, tz), Math.min(1, dt * 12))

    // --- jumping ---
    if (input.jumpQueued && !busy && player.grounded) {
      player.vy = JUMP
      player.grounded = false
      audio.play('jump')
    }
    input.jumpQueued = false
    const ground = town ? groundHeight(player.x, player.z) : 0
    if (player.grounded) {
      if (player.y - ground > 0.12) player.grounded = false
      else player.y = ground
    }
    if (!player.grounded) {
      player.vy += GRAVITY * dt
      player.y += player.vy * dt
      if (player.y <= ground) {
        player.y = ground; player.vy = 0; player.grounded = true
        audio.play('step', { volume: 0.6 })
      }
    }
    if (player.actionT > 0) player.actionT -= dt

    // footsteps
    if (player.grounded && player.speed > 1) {
      const stepIdx = Math.floor((player.walkPhase || 0) / Math.PI)
      if (stepIdx !== lastStep.current) { lastStep.current = stepIdx; audio.step() }
    }

    if (group.current) {
      group.current.position.set(player.x, player.y, player.z)
      group.current.rotation.y = player.facing
    }

    if (s.phase !== 'playing') { input.interactQueued = false; return }

    // --- interactables ---
    const list = town ? INTERACTABLES_TOWN : INTERACTABLES_SECRET
    let nearest = null, best = Infinity
    for (const it of list) {
      if (it.kind === 'door' && !s.unlocked) continue
      if (it.kind === 'gift' && s.giftStage !== 'closed') continue
      const d = Math.hypot(player.x - it.x, player.z - it.z)
      if (d < it.r && d < best) { best = d; nearest = it }
    }
    if (!s.paused) s.setNearby(nearest ? nearest.id : null)

    if (input.interactQueued) {
      input.interactQueued = false
      if (s.paused || s.panel) {
        // ignored while menus are open
      } else if (s.dialog) s.advanceDialog()
      else if (s.reveal) s.closeReveal()
      else if (!busy && nearest) {
        player.facing = Math.atan2(nearest.x - player.x, nearest.z - player.z)
        s.interact(nearest)
      }
    }

    if (busy) return
    // --- collectibles + location ---
    if (town) {
      HEART_SPOTS.forEach((h, i) => {
        if (!s.hearts[i] && Math.hypot(player.x - h.x, player.z - h.z) < 1.2) s.collect('heart', i)
      })
      KEY_SPOTS.forEach((k, i) => {
        if (!s.keys[i] && Math.hypot(player.x - k.x, player.z - k.z) < 1.2) s.collect('key', i)
      })
      s.setLocation(regionAt(player.x, player.z))
    }
  })

  return (
    <group ref={group}>
      <group scale={0.9}>
        <Character look={look} anim={player} drinkColor={drinkColor} />
      </group>
    </group>
  )
}
