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

  useEffect(() => attachKeyboard(() => togglePause()), [togglePause])

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
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
      {isTouch && phase === 'playing' && <MobileControls />}

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
