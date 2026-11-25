import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Shirt, Trophy, Settings, Gamepad2, RotateCcw, Check, Coffee } from 'lucide-react'
import { useGame } from '../../store/useGame'
import { CAFE, CUSTOMIZE, SHOPS, ACHIEVEMENTS, TUTORIAL, MISC, FRIEND_NAME } from '../../config/gameConfig'

const Backdrop = ({ children, onClose, align = 'center' }) => (
  <motion.div
    className={`absolute inset-0 z-30 flex px-3 py-4 ${align === 'right' ? 'items-center justify-end sm:pr-8' : 'items-center justify-center'} ${align === 'right' ? 'bg-transparent' : 'bg-[#4a3b5c]/30'}`}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose}
  >
    {children}
  </motion.div>
)

const Card = ({ children, className = '' }) => (
  <motion.div
    className={`game-panel relative max-h-full overflow-y-auto scroll-soft ${className}`}
    initial={{ scale: 0.8, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.85, y: 20, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 240, damping: 20 }}
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </motion.div>
)

const CloseBtn = ({ onClick }) => (
  <button onClick={onClick} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#fdf1f6] text-[#e5739d] hover:bg-[#ffe3ef]"><X size={18} /></button>
)

// ======================= CAFE =======================
export function CafeMenu() {
  const panel = useGame((s) => s.panel)
  const brewing = useGame((s) => s.brewing)
  const drinks = useGame((s) => s.drinks)
  const { orderDrink, closePanel } = useGame.getState()
  const open = panel === 'cafe'
  const brewingDrink = brewing && CAFE.menu.find((d) => d.id === brewing.id)
  return (
    <AnimatePresence>
      {open && (
        <Backdrop key="cafe" onClose={() => !brewing && closePanel()}>
          <Card className="w-full max-w-lg p-5 sm:p-6">
            {!brewing && <CloseBtn onClick={closePanel} />}
            <div className="flex items-center gap-2 text-[#e5739d]"><Coffee size={22} /><h2 className="text-2xl font-bold">Café Sugarcloud</h2></div>
            <p className="text-sm text-[#8a7b9a]">Pick your poison (it's sugar). Everything is free for {FRIEND_NAME}.</p>
            <AnimatePresence mode="wait">
              {!brewing ? (
                <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }} className="mt-4 space-y-2">
                  {CAFE.menu.map((d, i) => (
                    <motion.button
                      key={d.id}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => orderDrink(d.id)}
                      className="flex w-full items-center gap-3 rounded-2xl border-2 border-[#f6e8f3] bg-white p-3 text-left hover:border-[#ffb3cf]"
                    >
                      <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: d.color + '55' }}>
                        <div className="h-7 w-6 rounded-b-xl rounded-t-sm border-2 border-white" style={{ background: d.color }} />
                        {drinks[d.id] && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#7cc9a6] text-white"><Check size={12} /></span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-bold text-[#4a3b5c]">{d.name}</span>
                          <span className="shrink-0 text-xs font-semibold text-[#b9a7e6]">{d.price}</span>
                        </div>
                        <div className="text-sm text-[#7a6a8c]">{d.description}</div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="brew" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="mt-6 flex flex-col items-center pb-2 text-center">
                  <div className="relative h-32 w-28">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} className="absolute left-1/2 top-0 h-6 w-3 rounded-full bg-white/90" style={{ marginLeft: (i - 1) * 14 }} animate={{ y: [-0, -26], opacity: [0, 0.9, 0], scale: [0.6, 1.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.35 }} />
                    ))}
                    <div className="absolute bottom-0 left-1/2 h-24 w-20 -translate-x-1/2 overflow-hidden rounded-b-[28px] rounded-t-lg border-4 border-white bg-[#fffaf3] shadow-lg">
                      <motion.div className="absolute bottom-0 w-full" style={{ background: brewingDrink.color }} initial={{ height: '0%' }} animate={{ height: '85%' }} transition={{ duration: CAFE.preparingSteps.length * 0.8, ease: 'easeInOut' }} />
                      <motion.div className="absolute left-1/2 top-3 -translate-x-1/2 text-xl" animate={{ opacity: brewing.step >= CAFE.preparingSteps.length - 1 ? 1 : 0, scale: brewing.step >= CAFE.preparingSteps.length - 1 ? 1 : 0.3 }}>💗</motion.div>
                    </div>
                    <div className="absolute -right-3 bottom-8 h-10 w-6 rounded-r-full border-4 border-l-0 border-white" />
                  </div>
                  <div className="mt-4 text-lg font-bold text-[#e5739d]">{brewingDrink.name}</div>
                  <AnimatePresence mode="wait">
                    <motion.div key={brewing.step} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="mt-1 text-sm text-[#7a6a8c]">
                      {CAFE.preparingSteps[brewing.step]}
                    </motion.div>
                  </AnimatePresence>
                  <div className="mt-4 h-2.5 w-56 overflow-hidden rounded-full bg-[#f6e8f3]">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-[#ff9cc2] to-[#c8b6f2]" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: CAFE.preparingSteps.length * 0.8 + 0.4, ease: 'linear' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>
  )
}

// ======================= SHOP / CUSTOMIZE =======================
const TABS = [
  { id: 'outfit', label: 'Outfit' },
  { id: 'hair', label: 'Hair Color' },
  { id: 'style', label: 'Hairstyle' },
  { id: 'acc', label: 'Hair Bits' },
  { id: 'hat', label: 'Hats' },
  { id: 'bag', label: 'Bags' },
]

function Swatches({ colors, value, onPick }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {colors.map((c) => (
        <motion.button key={c} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={() => onPick(c)} className={`h-11 w-11 rounded-full border-4 shadow ${value === c ? 'border-[#8f74d6] ring-4 ring-[#e6dcff]' : 'border-white'}`} style={{ background: c }} aria-label={c} />
      ))}
    </div>
  )
}

function Options({ items, value, onPick }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => (
        <motion.button key={it.id} whileTap={{ scale: 0.95 }} onClick={() => onPick(it.id)} className={`rounded-2xl border-2 px-3 py-2.5 text-sm font-semibold ${value === it.id ? 'border-[#f07aa8] bg-[#fff0f6] text-[#e5739d]' : 'border-[#f1e8fb] bg-white text-[#6b5b7b] hover:border-[#ffc6dd]'}`}>
          {value === it.id && '✓ '}{it.label}
        </motion.button>
      ))}
    </div>
  )
}

export function ShopPanel() {
  const panel = useGame((s) => s.panel)
  const tab = useGame((s) => s.shopTab)
  const look = useGame((s) => s.look)
  const { setLook, setShopTab, closePanel } = useGame.getState()
  const open = panel === 'shop' || panel === 'customize'
  const title = panel === 'shop' ? 'Shopping Street Boutique' : `${FRIEND_NAME}'s Wardrobe`
  const sub = panel === 'shop' ? SHOPS.clothing.line : 'You have nothing to wear. Here are 40 options.'
  return (
    <AnimatePresence>
      {open && (
        <Backdrop key="shop" align="right" onClose={closePanel}>
          <Card className="w-full max-w-sm p-5 self-end sm:self-center">
            <CloseBtn onClick={closePanel} />
            <div className="flex items-center gap-2 text-[#e5739d]"><Shirt size={22} /><h2 className="pr-8 text-xl font-bold">{title}</h2></div>
            <p className="mt-0.5 text-sm text-[#8a7b9a]">{sub}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setShopTab(t.id)} className={`rounded-full px-3 py-1 text-xs font-bold ${tab === t.id ? 'bg-[#8f74d6] text-white shadow-[0_3px_0_#6a52b0]' : 'bg-[#f4effc] text-[#8f74d6]'}`}>{t.label}</button>
              ))}
            </div>
            <div className="mt-4 min-h-[110px]">
              {tab === 'outfit' && <Swatches colors={CUSTOMIZE.outfitColors} value={look.outfitColor} onPick={(c) => setLook({ outfitColor: c })} />}
              {tab === 'hair' && <Swatches colors={CUSTOMIZE.hairColors} value={look.hairColor} onPick={(c) => setLook({ hairColor: c })} />}
              {tab === 'style' && <Options items={CUSTOMIZE.hairStyles} value={look.hairStyle} onPick={(v) => setLook({ hairStyle: v })} />}
              {tab === 'acc' && <Options items={CUSTOMIZE.hairAccessories} value={look.hairAccessory} onPick={(v) => setLook({ hairAccessory: v })} />}
              {tab === 'hat' && <Options items={CUSTOMIZE.hats} value={look.hat} onPick={(v) => setLook({ hat: v })} />}
              {tab === 'bag' && <Options items={CUSTOMIZE.bags} value={look.bag} onPick={(v) => setLook({ bag: v })} />}
            </div>
            <button onClick={closePanel} className="game-btn mt-5 w-full py-3">Looking cute — done!</button>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>
  )
}

// ======================= PAUSE =======================
export function PauseMenu() {
  const paused = useGame((s) => s.paused)
  const achievements = useGame((s) => s.achievements)
  const musicOn = useGame((s) => s.musicOn)
  const muted = useGame((s) => s.muted)
  const quality = useGame((s) => s.quality)
  const isTouch = useGame((s) => s.isTouch)
  const eggs = useGame((s) => Object.keys(s.eggs).length)
  const { togglePause, restart, toggleMusic, toggleMute, setQuality, openPanel } = useGame.getState()
  const [view, setView] = useState('main')
  const [confirm, setConfirm] = useState(false)
  const unlocked = Object.keys(achievements).length
  const total = Object.keys(ACHIEVEMENTS).length

  const close = () => { setView('main'); setConfirm(false); togglePause() }

  const Item = ({ icon, label, onClick, accent }) => (
    <motion.button whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }} onClick={onClick} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold ${accent ? 'bg-[#fff0f6] text-[#e5739d]' : 'bg-[#f7f2fd] text-[#6b5b7b] hover:bg-[#efe7fc]'}`}>
      {icon} {label}
    </motion.button>
  )
  const Toggle = ({ label, on, onClick }) => (
    <button onClick={onClick} className="flex w-full items-center justify-between rounded-2xl bg-[#f7f2fd] px-4 py-3 font-semibold text-[#6b5b7b]">
      {label}
      <span className={`relative h-7 w-12 rounded-full transition-colors ${on ? 'bg-[#f07aa8]' : 'bg-[#d9d0e6]'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  )

  return (
    <AnimatePresence>
      {paused && (
        <Backdrop key="pause" onClose={close}>
          <Card className="w-full max-w-md p-6">
            <CloseBtn onClick={close} />
            {view === 'main' && (
              <div>
                <h2 className="text-3xl font-bold text-[#e5739d]">{MISC.pauseTitle}</h2>
                <p className="text-sm text-[#8a7b9a]">{MISC.pauseJoke}</p>
                <div className="mt-5 space-y-2">
                  <Item icon={<Play size={20} />} label="Resume" onClick={close} accent />
                  <Item icon={<Shirt size={20} />} label="Change my look" onClick={() => { close(); setTimeout(() => openPanel('customize', 'outfit'), 50) }} />
                  <Item icon={<Trophy size={20} />} label={`Achievements (${unlocked}/${total})`} onClick={() => setView('ach')} />
                  <Item icon={<Settings size={20} />} label="Settings" onClick={() => setView('settings')} />
                  <Item icon={<Gamepad2 size={20} />} label="Controls" onClick={() => setView('controls')} />
                  {!confirm ? (
                    <Item icon={<RotateCcw size={20} />} label="Restart game" onClick={() => setConfirm(true)} />
                  ) : (
                    <div className="rounded-2xl bg-[#fff0f6] p-3 text-sm text-[#6b5b7b]">
                      Start over? All progress will be lost (the drama remains).
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => { setConfirm(false); restart() }} className="game-btn px-4 py-1.5 text-sm">Yes, restart</button>
                        <button onClick={() => setConfirm(false)} className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#8f74d6]">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {view === 'ach' && (
              <div>
                <button onClick={() => setView('main')} className="text-sm font-semibold text-[#8f74d6]">‹ Back</button>
                <h2 className="mt-1 text-2xl font-bold text-[#e5739d]">Achievements</h2>
                <p className="text-sm text-[#8a7b9a]">{unlocked}/{total} unlocked · {eggs} hidden secrets found</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {Object.entries(ACHIEVEMENTS).map(([k, a]) => (
                    <div key={k} className={`rounded-2xl border-2 p-2.5 ${achievements[k] ? 'border-[#ffc6dd] bg-[#fff6fa]' : 'border-[#f1e8fb] bg-[#faf8fc] opacity-60'}`}>
                      <div className="text-2xl">{achievements[k] ? a.emoji : '🔒'}</div>
                      <div className="text-sm font-bold text-[#4a3b5c]">{a.name}</div>
                      <div className="text-xs text-[#8a7b9a]">{a.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {view === 'settings' && (
              <div>
                <button onClick={() => setView('main')} className="text-sm font-semibold text-[#8f74d6]">‹ Back</button>
                <h2 className="mt-1 text-2xl font-bold text-[#e5739d]">Settings</h2>
                <div className="mt-4 space-y-2">
                  <Toggle label="Music" on={musicOn} onClick={toggleMusic} />
                  <Toggle label="Sound effects" on={!muted} onClick={toggleMute} />
                  <Toggle label="Fancy graphics (shadows, sparkles)" on={quality === 'high'} onClick={() => setQuality(quality === 'high' ? 'low' : 'high')} />
                </div>
                <p className="mt-3 text-xs text-[#8a7b9a]">Turn off fancy graphics if things feel slow on your device.</p>
              </div>
            )}
            {view === 'controls' && (
              <div>
                <button onClick={() => setView('main')} className="text-sm font-semibold text-[#8f74d6]">‹ Back</button>
                <h2 className="mt-1 text-2xl font-bold text-[#e5739d]">Controls</h2>
                <div className="mt-4 space-y-2">
                  {(isTouch ? TUTORIAL.mobile : TUTORIAL.desktop).map((r) => (
                    <div key={r.keys} className="flex items-center gap-3 rounded-2xl bg-[#f7f2fd] px-3 py-2">
                      <span className="min-w-[120px] rounded-xl bg-white px-2 py-1 text-center text-sm font-bold text-[#8f74d6]">{r.keys}</span>
                      <span className="text-sm text-[#5b4a6c]">{r.text}</span>
                    </div>
                  ))}
                  {!isTouch && <div className="rounded-2xl bg-[#f7f2fd] px-3 py-2 text-sm text-[#5b4a6c]"><b className="text-[#8f74d6]">Mouse wheel</b> — zoom the camera</div>}
                </div>
              </div>
            )}
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>
  )
}
