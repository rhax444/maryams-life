import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../../store/useGame'
import { HEARTS, KEYS } from '../../config/gameConfig'

function useTypewriter(text, speed = 22) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    if (!text) return
    const id = setInterval(() => setN((v) => { if (v >= text.length) { clearInterval(id); return v } return v + 1 }), speed)
    return () => clearInterval(id)
  }, [text, speed])
  return [text ? text.slice(0, n) : '', n >= (text?.length || 0), () => setN(text.length)]
}

export function DialogBox() {
  const dialog = useGame((s) => s.dialog)
  const advance = useGame((s) => s.advanceDialog)
  const line = dialog ? dialog.lines[dialog.index] : ''
  const [shown, done, skip] = useTypewriter(line)
  const isTouch = useGame((s) => s.isTouch)
  const box = useRef()
  const onClick = () => (done ? advance() : skip())
  // Publish the dialog's height so toasts can stack above it instead of on top of it
  useLayoutEffect(() => {
    const root = document.documentElement
    if (!dialog || !box.current) { root.style.setProperty('--dialog-h', '0px'); return }
    const ro = new ResizeObserver(() => root.style.setProperty('--dialog-h', `${box.current?.offsetHeight || 0}px`))
    ro.observe(box.current)
    return () => { ro.disconnect(); root.style.setProperty('--dialog-h', '0px') }
  }, [dialog])
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-4 sm:bottom-8 z-20 flex justify-center px-3 ${isTouch ? 'touch-text-bottom safe-left safe-right' : ''}`}>
      <AnimatePresence>
        {dialog && (
          <motion.div
            key={dialog.speaker + dialog.lines[0]}
            initial={{ y: 60, opacity: 0, scale: 0.85 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            ref={box}
            className="pointer-events-auto relative w-full max-w-xl cursor-pointer"
            onClick={onClick}
          >
            <div className="absolute -top-4 left-6 z-10 flex items-center gap-1.5 rounded-full bg-[#8f74d6] px-4 py-1 text-sm font-bold text-white shadow-[0_3px_0_#6a52b0]">
              <span>{dialog.emoji}</span> {dialog.speaker}
            </div>
            <div className={`game-panel relative px-6 pb-5 pt-6 ${isTouch ? 'max-h-[34dvh] overflow-y-auto scroll-soft !px-5' : ''}`}>
              <p className="min-h-[3.2em] text-[17px] leading-snug text-[#4a3b5c]">{shown}</p>
              <motion.div className="absolute bottom-2 right-4 text-xs font-semibold text-[#b9a7e6]" animate={{ opacity: done ? [0.4, 1, 0.4] : 0 }} transition={{ repeat: Infinity, duration: 1.2 }}>
                {dialog.index < dialog.lines.length - 1 ? 'next ▸' : 'tap / E ▸'}
              </motion.div>
            </div>
            {/* speech bubble tail */}
            <div className="absolute -bottom-2 left-12 h-5 w-5 rotate-45 border-b-[3px] border-r-[3px] border-white bg-[#fffaf3]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function RevealModal() {
  const reveal = useGame((s) => s.reveal)
  const close = useGame((s) => s.closeReveal)
  const keys = useGame((s) => s.keys.filter(Boolean).length)
  const hearts = useGame((s) => s.hearts.filter(Boolean).length)
  const isHeart = reveal?.type === 'heart'
  return (
    <AnimatePresence>
      {reveal && (
        <motion.div key={reveal.type + reveal.index} className="safe-pad absolute inset-0 z-30 grid place-items-center bg-[#4a3b5c]/30 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div
            className="game-panel scroll-soft relative w-full max-w-sm max-h-full overflow-x-hidden overflow-y-auto px-6 pb-6 pt-4 text-center"
            initial={{ scale: 0.3, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div className="absolute inset-0 -z-0 opacity-60" style={{ background: isHeart ? 'radial-gradient(circle at 50% 25%, #ffd6e6, transparent 60%)' : 'radial-gradient(circle at 50% 25%, #fff2b8, transparent 60%)' }} animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.span key={i} className="absolute text-lg" style={{ left: '50%', top: '28%' }} initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: Math.cos(i * 0.63) * 140, y: Math.sin(i * 0.63) * 110, opacity: 0, rotate: 180 }} transition={{ duration: 1.3, delay: 0.1 }}>
                {isHeart ? '💗' : '✨'}
              </motion.span>
            ))}
            <motion.div className="relative text-7xl" initial={{ y: -20, scale: 0.4 }} animate={{ y: [0, -8, 0], scale: 1 }} transition={{ y: { repeat: Infinity, duration: 1.8 }, scale: { type: 'spring', stiffness: 300 } }}>
              {isHeart ? '💖' : '🗝️'}
            </motion.div>
            <div className="relative mt-2 text-xs font-bold uppercase tracking-widest text-[#b9a7e6]">
              {isHeart ? `Heart ${hearts}/3 found` : `Secret House Keys: ${keys}/3`}
            </div>
            <h3 className="relative mt-1 text-2xl font-bold text-[#e5739d]">{isHeart ? 'A hidden heart!' : KEYS[reveal.index].title}</h3>
            <p className={`relative mt-3 ${isHeart ? 'font-[var(--font-hand)] text-2xl leading-tight' : 'text-base'} text-[#4a3b5c]`} style={isHeart ? { fontFamily: 'Caveat, cursive' } : undefined}>
              {isHeart ? `“${HEARTS[reveal.index]}”` : KEYS[reveal.index].text}
            </p>
            <button onClick={close} className="game-btn relative mt-5 px-7 py-2.5">{isHeart ? 'Aww 💕' : keys === 3 ? 'To the Secret House!' : 'Keep looking'}</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
