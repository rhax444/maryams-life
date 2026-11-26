import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import GameCanvas from './components/scene/GameCanvas'
import { IntroScreen, Tutorial, Loader } from './components/ui/Intro'
import HUD from './components/ui/HUD'
import { DialogBox, RevealModal } from './components/ui/Dialog'
import { CafeMenu, ShopPanel, PauseMenu } from './components/ui/Panels'
import MobileControls from './components/ui/MobileControls'
import Finale from './components/ui/Finale'
import { useGame } from './store/useGame'
import { attachKeyboard } from './game/input'

export default function App() {
  const [ready, setReady] = useState(false)
  const phase = useGame((s) => s.phase)
  const fading = useGame((s) => s.fading)
  const isTouch = useGame((s) => s.isTouch)
  const togglePause = useGame((s) => s.togglePause)
  const modalOpen = useGame((s) => !!s.panel || !!s.reveal || s.paused || s.fading)

  useEffect(() => attachKeyboard(() => togglePause()), [togglePause])

  // Touch devices: block page scroll / pull-to-refresh / pinch-zoom while playing,
  // but still let scrollable panels (menus, the letter) scroll.
  useEffect(() => {
    if (!isTouch) return
    const onMove = (e) => {
      if (e.touches.length > 1) return e.preventDefault()
      const scroller = e.target.closest?.('.scroll-soft')
      if (!scroller || scroller.scrollHeight <= scroller.clientHeight) e.preventDefault()
    }
    const stop = (e) => e.preventDefault()
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('gesturestart', stop)
    document.addEventListener('contextmenu', stop)
    return () => {
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('gesturestart', stop)
      document.removeEventListener('contextmenu', stop)
    }
  }, [isTouch])

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${isTouch ? 'touch-ui' : ''}`}>
      <GameCanvas onReady={() => setTimeout(() => setReady(true), 400)} />

      <AnimatePresence>{phase === 'intro' && ready && <IntroScreen key="intro" />}</AnimatePresence>
      <AnimatePresence>{phase === 'tutorial' && <Tutorial key="tut" />}</AnimatePresence>

      {(phase === 'playing' || phase === 'finale') && <HUD />}
      <DialogBox />
      <RevealModal />
      <CafeMenu />
      <ShopPanel />
      <PauseMenu />
      <Finale />
      {isTouch && phase === 'playing' && !modalOpen && <MobileControls />}

      <AnimatePresence>
        {fading && (
          <motion.div
            key="fade"
            className="absolute inset-0 z-50 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #fff6e9 0%, #f9c4d9 60%, #c8b6f2 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{!ready && <Loader key="loader" />}</AnimatePresence>
    </div>
  )
}
