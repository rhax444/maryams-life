import { motion } from 'framer-motion'
import { Heart, Sparkles, Headphones } from 'lucide-react'
import { useGame } from '../../store/useGame'
import { GAME_TITLE, GAME_SUBTITLE, INTRO, TAGLINE, TUTORIAL } from '../../config/gameConfig'

const float = (i) => ({
  animate: { y: [0, -14, 0], rotate: [0, i % 2 ? 8 : -8, 0] },
  transition: { duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 },
})

export function Loader() {
  return (
    <motion.div className="absolute inset-0 z-[60] grid place-items-center" style={{ background: 'linear-gradient(180deg,#bfe0ff 0%,#fbe3ee 100%)' }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <div className="flex flex-col items-center gap-4">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>
          <Heart size={54} className="text-[#f07aa8]" fill="#ff9cc2" />
        </motion.div>
        <p className="text-lg font-medium text-[#8f74d6]">Building your little world…</p>
      </div>
    </motion.div>
  )
}

export function IntroScreen() {
  const start = useGame((s) => s.startGame)
  const title = GAME_TITLE.toUpperCase()
  return (
    <motion.div className="safe-pad scroll-soft absolute inset-0 z-30 flex flex-col items-center overflow-y-auto overflow-x-hidden px-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.08, filter: 'blur(6px)' }} transition={{ duration: 0.8 }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(255,246,233,0.15) 0%, rgba(249,196,217,0.25) 60%, rgba(143,116,214,0.35) 100%)' }} />
      {['💖', '🌸', '✨', '☁️', '🦋', '⭐'].map((e, i) => (
        <motion.span key={i} className="absolute text-3xl sm:text-4xl pointer-events-none" style={{ left: `${8 + i * 16}%`, top: `${i % 2 ? 14 : 78}%` }} {...float(i)}>
          {e}
        </motion.span>
      ))}
      <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 120 }} className="relative mt-auto max-w-full">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-sm font-semibold text-[#8f74d6] shadow">
          <Sparkles size={16} /> a cozy life simulation <Sparkles size={16} />
        </div>
        <h1 className="title-text text-[clamp(40px,13vw,64px)] sm:text-7xl md:text-8xl font-bold leading-none">{title}</h1>
        <p className="mt-3 text-xl sm:text-3xl font-semibold text-white drop-shadow-[0_2px_0_#8f74d6]">{GAME_SUBTITLE}</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="game-panel mt-6 max-w-md px-6 py-4">
        <p className="text-lg font-semibold text-[#e5739d]">{INTRO.greeting}</p>
        <p className="mt-1 text-[#6b5b7b]">{INTRO.joke}</p>
        <p className="mt-2 text-sm italic text-[#8f74d6]">“{TAGLINE}”</p>
      </motion.div>
      <motion.button
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
        onClick={start}
        className="game-btn mt-7 px-10 py-4 text-xl sm:text-2xl tracking-wide"
      >
        <motion.span className="inline-block" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
          {INTRO.startButton}
        </motion.span>
      </motion.button>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 1.6 }} className="mb-auto mt-5 flex items-center gap-2 text-sm font-medium text-white drop-shadow-[0_1px_0_#8f74d6]">
        <Headphones size={16} /> Sound on for the full experience
      </motion.p>
    </motion.div>
  )
}

export function Tutorial() {
  const finish = useGame((s) => s.finishTutorial)
  const isTouch = useGame((s) => s.isTouch)
  const rows = isTouch ? TUTORIAL.mobile : TUTORIAL.desktop
  return (
    <motion.div className="safe-pad scroll-soft absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-[#4a3b5c]/25 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="game-panel w-full max-w-md p-6" initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 16 }}>
        <div className="mb-1 text-center text-3xl">🎮</div>
        <h2 className="text-center text-2xl font-bold text-[#e5739d]">{TUTORIAL.title}</h2>
        <div className="mt-4 space-y-2">
          {rows.map((r, i) => (
            <motion.div key={r.keys} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.08 }} className="flex items-center gap-3 rounded-2xl bg-[#fdf1f6] px-3 py-2">
              <span className="min-w-[128px] rounded-xl bg-white px-2 py-1 text-center text-sm font-bold text-[#8f74d6] shadow-[0_3px_0_#e3d8fb]">{r.keys}</span>
              <span className="text-[#5b4a6c]">{r.text}</span>
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-[#7a6a8c]">{TUTORIAL.footer}</p>
        <div className="mt-5 flex justify-center">
          <button onClick={finish} className="game-btn px-8 py-3 text-lg">{TUTORIAL.button}</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
