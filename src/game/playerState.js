import { SPAWN } from './layout'

// Mutable per-frame player/camera state shared outside React
export const player = {
  x: SPAWN.x, y: 0, z: SPAWN.z,
  vy: 0,
  facing: SPAWN.facing,
  speed: 0, // horizontal speed (for animation)
  grounded: true,
  actionT: 0, // seconds left of "interaction" animation
  action: null, // 'wave' | 'cheer' | 'drink'
  walkPhase: 0,
}

export const cam = { yaw: SPAWN.yaw, pitch: 0.42, dist: 7.5 }

export function resetPlayer(spawn = SPAWN) {
  player.x = spawn.x; player.z = spawn.z; player.y = 0; player.vy = 0
  player.facing = spawn.facing; player.speed = 0; player.grounded = true
  player.actionT = 0; player.action = null
  cam.yaw = spawn.yaw; cam.pitch = 0.42
}

export function playAction(action, t = 1.2) {
  player.action = action
  player.actionT = t
}
