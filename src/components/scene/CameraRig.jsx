import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../../store/useGame'
import { player, cam } from '../../game/playerState'
import { input } from '../../game/input'
import { raycastBoxes } from '../../game/collision'
import { COLLIDERS_TOWN, COLLIDERS_SECRET, interiorAt } from '../../game/layout'

const tmpTarget = new THREE.Vector3()
const smoothTarget = new THREE.Vector3(player.x, 1.3, player.z)
const lookAtV = new THREE.Vector3()
const desired = new THREE.Vector3()
const dir = new THREE.Vector3()

function angleDiff(a, b) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

export default function CameraRig() {
  const { camera, gl } = useThree()
  if (import.meta.env.DEV) window.__camera = camera
  const enter = useRef(null)
  const curDist = useRef(cam.dist)
  const finaleT = useRef(0)
  const lookCur = useRef(new THREE.Vector3(0, 0, 0))
  const lastScene = useRef('town')

  // mouse / touch drag to look around, wheel to zoom
  useEffect(() => {
    const el = gl.domElement
    const pointers = new Map()
    const down = (e) => { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }) }
    const move = (e) => {
      const p = pointers.get(e.pointerId)
      if (!p) return
      input.look.dx += e.clientX - p.x
      input.look.dy += e.clientY - p.y
      input.look.lastDrag = performance.now()
      p.x = e.clientX; p.y = e.clientY
    }
    const up = (e) => pointers.delete(e.pointerId)
    const wheel = (e) => { cam.dist = THREE.MathUtils.clamp(cam.dist + e.deltaY * 0.006, 4.5, 12) }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: true })
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [gl])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const s = useGame.getState()
    const t = state.clock.elapsedTime

    // --- intro orbit ---
    if (s.phase === 'intro') {
      const a = t * 0.07
      camera.position.set(Math.sin(a) * 58, 34 + Math.sin(t * 0.2) * 3, Math.cos(a) * 58)
      lookCur.current.set(0, 0, -2)
      camera.lookAt(lookCur.current)
      enter.current = null
      smoothTarget.set(player.x, 1.3, player.z)
      curDist.current = cam.dist
      finaleT.current = 0
      return
    }

    // snap when changing scenes (teleport)
    if (lastScene.current !== s.scene) {
      lastScene.current = s.scene
      smoothTarget.set(player.x, 1.3, player.z)
      curDist.current = cam.dist
      dir.set(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch))
      camera.position.copy(smoothTarget).addScaledVector(dir, cam.dist)
      lookCur.current.copy(smoothTarget)
    }

    // --- look input ---
    const dragging = performance.now() - input.look.lastDrag < 1800
    if (!s.paused && s.phase !== 'finale') {
      cam.yaw -= input.look.dx * 0.006
      cam.pitch = THREE.MathUtils.clamp(cam.pitch + input.look.dy * 0.004, 0.12, 1.15)
    }
    input.look.dx = input.look.dy = 0

    // interiors: swing camera to look through the open side
    const interior = s.scene === 'secret' ? { yaw: 0 } : interiorAt(player.x, player.z)
    if (!dragging && s.phase === 'playing') {
      if (interior) cam.yaw += angleDiff(cam.yaw, interior.yaw) * Math.min(1, dt * 2.2)
      else if (player.speed > 1.5) {
        const behind = player.facing + Math.PI
        const d = angleDiff(cam.yaw, behind)
        if (Math.abs(d) < 2.2) cam.yaw += d * Math.min(1, dt * 0.9)
      }
    }

    // --- follow target ---
    const closeup = s.panel === 'shop' || s.panel === 'customize'
    let pitch = cam.pitch, yaw = cam.yaw, dist = cam.dist
    // narrow touch screens show the shop as a bottom sheet: frame Maryam in the top half instead
    const sheet = closeup && state.size.width <= 640
    if (closeup) { yaw = cam.yaw + 0.3; pitch = 0.14; dist = sheet ? 4.8 : 3.6 }
    tmpTarget.set(player.x, player.y * 0.6 + (closeup ? 1.0 : 1.3), player.z)
    // close-up: aim right of Maryam so she sits left of the side panel (desktop only)
    if (closeup && state.size.width > 640) tmpTarget.addScaledVector(dir.set(Math.cos(yaw), 0, -Math.sin(yaw)), 0.9)
    smoothTarget.lerp(tmpTarget, 1 - Math.exp(-dt * 10))
    dir.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch))

    const colliders = s.scene === 'town' ? COLLIDERS_TOWN : COLLIDERS_SECRET
    const hit = raycastBoxes(smoothTarget, dir, dist, colliders, (c) => (c === 'locked' ? !s.unlocked : true))
    const allowed = Math.max(1.2, hit < dist ? hit - 0.35 : dist)
    curDist.current = allowed < curDist.current ? allowed : THREE.MathUtils.lerp(curDist.current, allowed, 1 - Math.exp(-dt * 3))
    desired.copy(smoothTarget).addScaledVector(dir, curDist.current)

    // --- finale: slowly push in on the gift ---
    if (s.phase === 'finale') {
      finaleT.current += dt
      const k = Math.min(finaleT.current / 6, 1)
      const e = k * k * (3 - 2 * k)
      desired.set(0, THREE.MathUtils.lerp(3.4, 2.2, e), THREE.MathUtils.lerp(3.6, 0.9, e))
      camera.position.lerp(desired, 1 - Math.exp(-dt * 2))
      lookAtV.set(0, 1.3, -2.5)
      lookCur.current.lerp(lookAtV, 1 - Math.exp(-dt * 3))
      camera.lookAt(lookCur.current)
      return
    }

    // --- entering: fly from aerial view down to the player ---
    if (s.phase === 'entering') {
      if (!enter.current) enter.current = { from: camera.position.clone(), look: lookCur.current.clone(), t: 0 }
      const en = enter.current
      en.t += dt / 2.8
      const k = Math.min(en.t, 1)
      const e = 1 - Math.pow(1 - k, 3)
      camera.position.lerpVectors(en.from, desired, e)
      camera.position.y += Math.sin(k * Math.PI) * 6
      lookCur.current.lerpVectors(en.look, smoothTarget, e)
      camera.lookAt(lookCur.current)
      if (k >= 1) s.finishEntering()
      return
    }

    camera.position.lerp(desired, 1 - Math.exp(-dt * (closeup ? 5 : 18)))
    // bottom-sheet close-up: tilt the view down so Maryam sits in the visible top half
    lookAtV.copy(smoothTarget)
    // aim ~24° below horizontal: with a 50° vertical FOV her whole body lands in the top ~40% of the screen
    if (sheet) lookAtV.y = camera.position.y - curDist.current * Math.cos(pitch) * Math.tan(0.40)
    lookCur.current.lerp(lookAtV, 1 - Math.exp(-dt * 18))
    camera.lookAt(lookCur.current)
  })

  return null
}
