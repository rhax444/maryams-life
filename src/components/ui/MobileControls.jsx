import { useEffect, useRef, useState } from 'react'
import { Star, ArrowUp } from 'lucide-react'
import { input } from '../../game/input'
import { useGame } from '../../store/useGame'

// Touch controls. All sizes come from CSS variables in index.css (--joy, --act,
// --ctrl-pad, safe-area insets) so they scale with the screen, and the whole
// control zone stays below --text-bottom, where dialogue and notes begin.
export default function MobileControls() {
  const zone = useRef()
  const base = useRef()
  const active = useRef(null)
  const origin = useRef({ x: 0, y: 0 })
  const [drag, setDrag] = useState(null) // { ox, oy, kx, ky } in zone-local px while a thumb is down
  const nearby = useGame((s) => s.nearby)
  const dialog = useGame((s) => s.dialog)

  const setJoy = (dx, dy, R) => {
    input.joy.x = dx / R
    input.joy.y = -dy / R
    input.joy.active = true
  }

  const start = (e) => {
    if (active.current !== null) return
    e.preventDefault()
    e.stopPropagation()
    active.current = e.pointerId
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* capture is optional */ }
    const z = zone.current.getBoundingClientRect()
    const size = base.current?.offsetWidth || 130
    const half = size / 2
    // floating joystick: centre it under the thumb, but keep it fully inside the zone
    const ox = Math.min(Math.max(e.clientX - z.left, half), z.width - half)
    const pad = Math.max(0, z.height - size) // bottom safe padding (gesture bar)
    const oy = Math.min(Math.max(e.clientY - z.top, half), z.height - half - pad * 0.6)
    origin.current = { x: z.left + ox, y: z.top + oy, R: size * 0.42, ox, oy }
    move(e, true)
  }

  const move = (e, force = false) => {
    if (!force && active.current !== e.pointerId) return
    e.preventDefault?.()
    const o = origin.current
    let dx = e.clientX - o.x
    let dy = e.clientY - o.y
    const d = Math.hypot(dx, dy)
    if (d > o.R) { dx = (dx / d) * o.R; dy = (dy / d) * o.R }
    // small dead-zone so resting thumbs don't drift
    if (d < o.R * 0.12) { dx = 0; dy = 0 }
    setDrag({ ox: o.ox, oy: o.oy, kx: dx, ky: dy })
    setJoy(dx, dy, o.R)
  }

  const end = (e) => {
    if (e && active.current !== e.pointerId) return
    active.current = null
    setDrag(null)
    input.joy.x = input.joy.y = 0
    input.joy.active = false
  }

  const press = (fn) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    fn()
  }

  // if the controls unmount mid-drag (a menu opened), never leave Maryam walking
  useEffect(() => () => { input.joy.x = input.joy.y = 0; input.joy.active = false }, [])

  const hot = nearby || dialog

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none" style={{ touchAction: 'none' }}>
      {/* joystick zone: bottom-left, exactly as tall as the control area */}
      <div
        ref={zone}
        className="pointer-events-auto absolute bottom-0 left-0"
        style={{
          width: 'min(55vw, calc(var(--joy) * 2.4))',
          height: 'calc(var(--ctrl-pad) + var(--joy))',
          touchAction: 'none',
        }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
        aria-label="Movement joystick"
      >
        <div
          ref={base}
          className="absolute rounded-full border-4 border-white/85 bg-white/35 shadow-lg backdrop-blur-sm transition-opacity"
          style={
            drag
              ? { width: 'var(--joy)', height: 'var(--joy)', left: drag.ox, top: drag.oy, transform: 'translate(-50%, -50%)', opacity: 1 }
              : { width: 'var(--joy)', height: 'var(--joy)', left: 'var(--ctrl-side)', bottom: 'var(--ctrl-pad)', opacity: 0.85 }
          }
        >
          <div
            className="absolute left-1/2 top-1/2 rounded-full bg-gradient-to-b from-[#ffb3cf] to-[#f07aa8] shadow-[0_4px_0_#c9567f]"
            style={{
              width: 'calc(var(--joy) * 0.44)',
              height: 'calc(var(--joy) * 0.44)',
              transform: `translate(calc(-50% + ${drag?.kx || 0}px), calc(-50% + ${drag?.ky || 0}px))`,
            }}
          />
        </div>
      </div>

      {/* action cluster: bottom-right; jump sits diagonally above-left of the main button */}
      <div
        className="pointer-events-none absolute"
        style={{ right: 'var(--ctrl-side-r)', bottom: 'var(--ctrl-pad)', width: 'calc(var(--joy) * 1.05)', height: 'var(--joy)' }}
      >
        <button
          onPointerDown={press(() => { input.interactQueued = true })}
          className={`pointer-events-auto absolute bottom-0 right-0 grid place-items-center rounded-full text-white shadow-[0_5px_0_#c9567f] transition-transform active:translate-y-[3px] ${hot ? 'scale-105 bg-gradient-to-b from-[#ff9cc2] to-[#f07aa8] animate-pulse' : 'bg-gradient-to-b from-[#ffc6dd] to-[#f7a8c4] opacity-90'}`}
          style={{ width: 'var(--act)', height: 'var(--act)', touchAction: 'none' }}
          aria-label="Interact"
        >
          <Star style={{ width: 'calc(var(--act) * 0.4)', height: 'calc(var(--act) * 0.4)' }} fill="white" />
        </button>
        <button
          onPointerDown={press(() => { input.jumpQueued = true })}
          className="pointer-events-auto absolute left-0 top-0 grid place-items-center rounded-full bg-gradient-to-b from-[#c9b8f5] to-[#a48ae6] text-white shadow-[0_5px_0_#7c62c4] active:translate-y-[3px]"
          style={{ width: 'calc(var(--act) * 0.74)', height: 'calc(var(--act) * 0.74)', touchAction: 'none' }}
          aria-label="Jump"
        >
          <ArrowUp style={{ width: 'calc(var(--act) * 0.34)', height: 'calc(var(--act) * 0.34)' }} />
        </button>
      </div>
    </div>
  )
}
