// Shared, non-React input state (read every frame by the player + camera)
export const input = {
  keys: new Set(),
  joy: { x: 0, y: 0, active: false }, // virtual joystick (-1..1)
  jumpQueued: false,
  interactQueued: false,
  look: { dx: 0, dy: 0, lastDrag: 0 }, // accumulated camera drag
}

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']

export function attachKeyboard(onEscape) {
  const down = (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return
    if (MOVE_KEYS.includes(e.code) || e.code === 'Space') e.preventDefault()
    input.keys.add(e.code)
    if (e.code === 'Space' && !e.repeat) input.jumpQueued = true
    if ((e.code === 'KeyE' || e.code === 'Enter') && !e.repeat) input.interactQueued = true
    if (e.code === 'Escape' || e.code === 'KeyP') onEscape?.()
  }
  const up = (e) => input.keys.delete(e.code)
  const blur = () => input.keys.clear()
  window.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  window.addEventListener('blur', blur)
  return () => {
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
    window.removeEventListener('blur', blur)
  }
}

export function moveVector() {
  const k = input.keys
  let x = 0, y = 0
  if (k.has('KeyW') || k.has('ArrowUp')) y += 1
  if (k.has('KeyS') || k.has('ArrowDown')) y -= 1
  if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1
  if (k.has('KeyD') || k.has('ArrowRight')) x += 1
  let run = k.has('ShiftLeft') || k.has('ShiftRight')
  if (input.joy.active) {
    x = input.joy.x
    y = input.joy.y
    const m = Math.hypot(x, y)
    run = m > 0.85
  }
  const len = Math.hypot(x, y)
  if (len > 1) { x /= len; y /= len }
  return { x, y, run }
}

export function clearInput() {
  input.keys.clear()
  input.joy.x = input.joy.y = 0
  input.joy.active = false
  input.jumpQueued = input.interactQueued = false
}
