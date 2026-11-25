import { useRef, useState } from 'react'
import { Star, ArrowUp } from 'lucide-react'
import { input } from '../../game/input'
import { useGame } from '../../store/useGame'

export default function MobileControls() {
  const base = useRef()
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const active = useRef(null)
  const nearby = useGame((s) => s.nearby)
  const dialog = useGame((s) => s.dialog)
  const R = 50

  const update = (e) => {
    const r = base.current.getBoundingClientRect()
    let dx = e.clientX - (r.left + r.width / 2)
    let dy = e.clientY - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy)
    if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R }
    setKnob({ x: dx, y: dy })
    input.joy.x = dx / R
    input.joy.y = -dy / R
    input.joy.active = true
  }
  const end = () => {
    active.current = null
    setKnob({ x: 0, y: 0 })
    input.joy.x = input.joy.y = 0
    input.joy.active = false
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div
        ref={base}
        className="pointer-events-auto absolute bottom-8 left-6 h-32 w-32 rounded-full border-4 border-white/80 bg-white/35 shadow-lg backdrop-blur-sm"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => { e.stopPropagation(); active.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); update(e) }}
        onPointerMove={(e) => { if (active.current === e.pointerId) update(e) }}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full bg-gradient-to-b from-[#ffb3cf] to-[#f07aa8] shadow-[0_4px_0_#c9567f]" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
      </div>
      <div className="pointer-events-auto absolute bottom-8 right-6 flex items-end gap-3" style={{ touchAction: 'none' }}>
        <button
          onPointerDown={(e) => { e.stopPropagation(); input.jumpQueued = true }}
          className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-b from-[#c9b8f5] to-[#a48ae6] text-white shadow-[0_5px_0_#7c62c4]"
          aria-label="Jump"
        >
          <ArrowUp size={28} />
        </button>
        <button
          onPointerDown={(e) => { e.stopPropagation(); input.interactQueued = true }}
          className={`grid h-20 w-20 place-items-center rounded-full text-white shadow-[0_5px_0_#c9567f] transition-transform ${nearby || dialog ? 'scale-110 bg-gradient-to-b from-[#ff9cc2] to-[#f07aa8] animate-pulse' : 'bg-gradient-to-b from-[#ffc6dd] to-[#f7a8c4] opacity-80'}`}
          aria-label="Interact"
        >
          <Star size={32} fill="white" />
        </button>
      </div>
    </div>
  )
}
