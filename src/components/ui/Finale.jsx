import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift } from 'lucide-react'
import { useGame } from '../../store/useGame'
import { FINALE, FRIEND_NAME } from '../../config/gameConfig'

function FallingHearts() {
  const items = Array.from({ length: 18 })
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-xl"
          style={{ left: `${(i * 53) % 100}%`, top: '-5%' }}
          animate={{ y: ['0vh', '110vh'], x: [0, (i % 2 ? 30 : -30), 0], rotate: [0, 180] }}
          transition={{ duration: 8 + (i % 5), repeat: Infinity, delay: i * 0.6, ease: 'linear' }}
        >
          {['💗', '✨', '💖', '🌸', '⭐'][i % 5]}
        </motion.span>
      ))}
    </div>
  )
}

function Letter() {
  const restart = useGame((s) => s.restart)
  const [showEnd, setShowEnd] = useState(false)
  const paper = useRef()
  const n = FINALE.letterParagraphs.length
  useEffect(() => {
    const id = setInterval(() => paper.current?.scrollTo({ top: paper.current.scrollHeight, behavior: 'smooth' }), 900)
    const stop = setTimeout(() => clearInterval(id), 1400 + n * 900 + 1500)
    return () => { clearInterval(id); clearTimeout(stop) }
  }, [n])
  useEffect(() => {
    const t = setTimeout(() => setShowEnd(true), 1400 + n * 900 + 800)
    return () => clearTimeout(t)
  }, [n])
  return (
    <motion.div className="safe-pad absolute inset-0 z-40 flex items-center justify-center px-3 py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'radial-gradient(ellipse at center, rgba(255,214,230,0.35), rgba(58,42,79,0.55))' }}>
      <FallingHearts />
      <motion.div
        className="relative flex max-h-full w-full max-w-xl flex-col"
        initial={{ scaleY: 0.05, scaleX: 0.6, y: 120, opacity: 0, rotate: -3 }}
        animate={{ scaleY: 1, scaleX: 1, y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 1.1, ease: [0.2, 0.9, 0.3, 1.1] }}
        style={{ transformOrigin: 'bottom center' }}
      >
        <div ref={paper} className="letter-paper scroll-soft relative min-h-0 overflow-y-auto rounded-[28px] border-4 border-white px-6 pb-6 pt-8 shadow-[0_10px_0_rgba(143,116,214,0.3),0_30px_60px_rgba(58,42,79,0.4)] sm:px-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 grid h-14 w-14 place-items-center rounded-full bg-[#f07aa8] text-2xl shadow-[0_4px_0_#c9567f]">💌</div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} className="text-3xl font-bold text-[#e5739d]" style={{ fontFamily: 'Caveat, cursive' }}>
            {FINALE.letterGreeting}
          </motion.p>
          <div className="mt-2 space-y-2.5">
            {FINALE.letterParagraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 1.4 + i * 0.9, duration: 0.8 }}
                className="text-[22px] leading-[1.35] text-[#4a3b5c] sm:text-2xl"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                {p}
              </motion.p>
            ))}
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 + n * 0.9 }} className="mt-4 text-right text-2xl text-[#8f74d6]" style={{ fontFamily: 'Caveat, cursive' }}>
            — Hamza Ali (Tipu) 💕
          </motion.p>
        </div>
        <AnimatePresence>
          {showEnd && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex shrink-0 flex-col items-center gap-3 text-center">
              <div className="title-text text-xl font-bold sm:text-2xl">{FINALE.theEnd}</div>
              <button onClick={restart} className="game-btn px-8 py-3 text-lg">{FINALE.playAgain}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function Finale() {
  const scene = useGame((s) => s.scene)
  const stage = useGame((s) => s.giftStage)
  const phase = useGame((s) => s.phase)
  const fading = useGame((s) => s.fading)
  const paused = useGame((s) => s.paused)
  const openGift = useGame((s) => s.openGift)
  const isTouch = useGame((s) => s.isTouch)
  const show = scene === 'secret' && !fading && phase === 'playing' && stage === 'closed' && !paused
  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div key="found" className="pointer-events-none absolute inset-x-0 top-[13%] z-20 flex flex-col items-center px-4 text-center max-sm:top-[calc(var(--sat)+120px)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -30 }}>
            <motion.h2 initial={{ scale: 0.3 }} animate={{ scale: [0.3, 1.15, 1] }} transition={{ duration: 0.9, delay: 0.4 }} className="title-text text-4xl font-bold sm:text-6xl">
              {FINALE.foundTitle}
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-2 rounded-full bg-white/85 px-4 py-1 text-sm font-semibold text-[#8f74d6]">
              A little something, just for {FRIEND_NAME}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {show && (
          <motion.div key="btn" className={`absolute inset-x-0 bottom-28 z-20 flex justify-center sm:bottom-16 ${isTouch ? 'touch-text-bottom' : ''}`} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.3 }} transition={{ delay: 1.6, type: 'spring' }}>
            <motion.button onClick={openGift} className="game-btn flex items-center gap-2 px-8 py-4 text-xl" animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.3 }}>
              <Gift size={24} /> {FINALE.openButton}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{scene === 'secret' && stage === 'letter' && <Letter key="letter" />}</AnimatePresence>
    </>
  )
}
