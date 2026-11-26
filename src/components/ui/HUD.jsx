import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Music2, Volume2, VolumeX, Pause, Map as MapIcon, ChevronDown, CheckCircle2, Circle, Heart, KeyRound, MapPin } from 'lucide-react'
import { useGame, getQuests } from '../../store/useGame'
import { FRIEND_NAME, LOCATIONS, MISC } from '../../config/gameConfig'
import { MAP_MARKERS, ROADS, INTERACTABLES_TOWN, INTERACTABLES_SECRET } from '../../game/layout'
import { player } from '../../game/playerState'

// Re-render on resize / rotation so phone layouts adapt immediately
function useScreen() {
  const get = () => ({ w: typeof window !== 'undefined' ? window.innerWidth : 1024, h: typeof window !== 'undefined' ? window.innerHeight : 768 })
  const [size, setSize] = useState(get)
  useEffect(() => {
    const on = () => setSize(get())
    window.addEventListener('resize', on)
    window.addEventListener('orientationchange', on)
    return () => { window.removeEventListener('resize', on); window.removeEventListener('orientationchange', on) }
  }, [])
  return size
}

function Stat({ icon, value, color, label }) {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl bg-white/90 px-2.5 py-1.5 shadow-[0_3px_0_rgba(143,116,214,0.2)]" title={label}>
      {icon}
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

function QuestTracker() {
  const s = useGame()
  const { list, current } = getQuests(s)
  const [open, setOpen] = useState(typeof window !== 'undefined' && window.innerWidth > 640 && !s.isTouch)
  return (
    <motion.div layout className={`game-panel mt-2 overflow-hidden px-3 py-2 !rounded-2xl ${s.isTouch ? 'w-[min(240px,calc(100vw-150px))] sm:w-[260px]' : 'w-[230px] sm:w-[260px]'}`}>
      <button className="flex w-full items-center justify-between text-left" onClick={() => setOpen(!open)}>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#b9a7e6]">Current goal</div>
          <AnimatePresence mode="wait">
            <motion.div key={current.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-sm font-semibold text-[#4a3b5c]">
              {current.text}
            </motion.div>
          </AnimatePresence>
        </div>
        <ChevronDown size={18} className={`text-[#b9a7e6] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 space-y-1 border-t border-[#f1e8fb] pt-2">
            {list.map((q) => (
              <li key={q.id} className={`flex items-center gap-2 text-xs ${q.done ? 'text-[#9ac9b0] line-through' : q.id === current.id ? 'font-semibold text-[#e5739d]' : 'text-[#8a7b9a]'}`}>
                {q.done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                {q.text}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const WORLD = 84
function Minimap({ size = 150 }) {
  const MAP = size
  const mx = (x) => ((x + WORLD / 2) / WORLD) * MAP
  const discovered = useGame((s) => s.discovered)
  const unlocked = useGame((s) => s.unlocked)
  const arrow = useRef()
  useEffect(() => {
    let raf
    const loop = () => {
      if (arrow.current) arrow.current.setAttribute('transform', `translate(${mx(player.x)} ${mx(player.z)}) rotate(${180 - (player.facing * 180) / Math.PI})`)
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [MAP])
  return (
    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="rounded-full border-4 border-white bg-[#cfeec0] shadow-[0_6px_0_rgba(143,116,214,0.25),0_12px_30px_rgba(74,59,92,0.2)] overflow-hidden" style={{ width: MAP, height: MAP }}>
      <svg width={MAP} height={MAP}>
        <circle cx={MAP / 2} cy={MAP / 2} r={MAP / 2} fill="#cfeec0" />
        {ROADS.map((r, i) => (
          <rect key={i} x={mx(r.x - r.w / 2)} y={mx(r.z - r.d / 2)} width={(r.w / WORLD) * MAP} height={(r.d / WORLD) * MAP} fill={r.kind === 'path' ? '#f3dcc1' : '#fff4e6'} rx={1} />
        ))}
        <circle cx={mx(1)} cy={mx(-8)} r={4} fill="#9fd8ff" />
        <circle cx={mx(-6)} cy={mx(-18)} r={6.5} fill="#9fd8ff" />
        <rect x={mx(-12.5)} y={mx(-28.2)} width={(27 / WORLD) * MAP} height={(2.5 / WORLD) * MAP} fill="#9fd8ff" />
        {MAP_MARKERS.map((m) => {
          const known = discovered[m.id]
          const emoji = m.id === 'secret' ? (unlocked ? '🔓' : '🔒') : LOCATIONS[m.id].emoji
          return (
            <g key={m.id} transform={`translate(${mx(m.x)} ${mx(m.z)})`}>
              <circle r={MAP < 130 ? 8.5 : 10} fill={known ? '#ffffff' : '#ffffffaa'} stroke={known ? '#f07aa8' : '#c8b6f2'} strokeWidth={2} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={MAP < 130 ? 9 : known ? 11 : 10} fill="#8f74d6" fontWeight="700">{known ? emoji : '?'}</text>
            </g>
          )
        })}
        <g ref={arrow}>
          <circle r={7} fill="#ff6fa3" opacity={0.25} />
          <path d="M0,-7 L5,5 L0,2.5 L-5,5 Z" fill="#e5739d" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
        </g>
      </svg>
    </motion.div>
  )
}

function InteractPrompt() {
  const nearby = useGame((s) => s.nearby)
  const blocked = useGame((s) => !!s.dialog || !!s.panel || !!s.reveal || s.paused || s.phase !== 'playing')
  const isTouch = useGame((s) => s.isTouch)
  const unlocked = useGame((s) => s.unlocked)
  const it = nearby ? [...INTERACTABLES_TOWN, ...INTERACTABLES_SECRET].find((i) => i.id === nearby) : null
  const label = it?.id === 'gate' && unlocked ? 'Open gate' : it?.label
  const show = it && !blocked
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-28 sm:bottom-10 flex justify-center px-3 ${isTouch ? 'touch-text-bottom' : ''}`}>
      <AnimatePresence>
        {show && (
          <motion.div key={it.id} initial={{ y: 20, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 10, opacity: 0 }} className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-[0_4px_0_rgba(143,116,214,0.3),0_10px_24px_rgba(74,59,92,0.18)]">
            {!isTouch && <kbd className="grid h-7 w-7 place-items-center rounded-lg bg-[#8f74d6] text-sm font-bold text-white shadow-[0_3px_0_#6a52b0]">E</kbd>}
            <span className="text-sm sm:text-sm font-semibold text-[#4a3b5c] text-center">{isTouch ? `Tap ★ · ${label}` : label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Notifications() {
  const allNotes = useGame((s) => s.notifications)
  const isTouch = useGame((s) => s.isTouch)
  // short landscape phones: one toast at a time so it never reaches the HUD
  const screen = useScreen()
  const notes = isTouch && screen.h < 540 ? allNotes.slice(-1) : allNotes
  const pos = isTouch
    ? 'touch-above-text left-1/2 -translate-x-1/2 w-[min(300px,calc(100vw-24px))] items-center'
    : 'bottom-[190px] left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:bottom-auto sm:right-3 sm:top-[72px] w-[260px] items-end'
  return (
    <div className={`pointer-events-none absolute z-20 flex flex-col gap-2 ${pos}`}>
      <AnimatePresence>
        {notes.map((n) => (
          <motion.div key={n.id} layout initial={isTouch ? { y: 16, opacity: 0 } : { x: 120, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }} exit={isTouch ? { y: -10, opacity: 0 } : { x: 120, opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="game-panel flex w-full items-start gap-2 !rounded-2xl px-3 py-2">
            <span className="text-2xl leading-none">{n.emoji}</span>
            <div>
              <div className="text-sm font-bold text-[#e5739d]">{n.title}</div>
              <div className="text-xs text-[#6b5b7b]">{n.text}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function Banner() {
  const banner = useGame((s) => s.banner)
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[30%] sm:top-[22%] flex justify-center px-4">
      <AnimatePresence>
        {banner && (
          <motion.div key={banner.id} initial={{ scale: 0.4, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 1.1, opacity: 0, y: -20 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="text-center">
            <div className="text-5xl">{banner.emoji}</div>
            <div className="title-text text-3xl sm:text-5xl font-bold max-w-[92vw] break-words">{banner.title}</div>
            <div className="mt-1 inline-block rounded-full bg-white/85 px-4 py-1 text-sm font-semibold text-[#8f74d6]">{banner.subtitle}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HUD() {
  const location = useGame((s) => s.location)
  const scene = useGame((s) => s.scene)
  const hearts = useGame((s) => s.hearts.filter(Boolean).length)
  const keys = useGame((s) => s.keys.filter(Boolean).length)
  const found = useGame((s) => Object.keys(s.discovered).length)
  const musicOn = useGame((s) => s.musicOn)
  const muted = useGame((s) => s.muted)
  const showMap = useGame((s) => s.showMap)
  const look = useGame((s) => s.look)
  const phase = useGame((s) => s.phase)
  const isTouch = useGame((s) => s.isTouch)
  const dressing = useGame((s) => s.panel === 'shop' || s.panel === 'customize')
  const screen = useScreen()
  const shortScreen = screen.h < 540 && screen.w > screen.h
  const { toggleMusic, toggleMute, togglePause, toggleMap } = useGame.getState()
  const loc = LOCATIONS[location] || LOCATIONS.town
  if (phase === 'finale') return null
  // phones: the wardrobe sheet + Maryam close-up need the whole screen
  if (isTouch && dressing && screen.w < 640) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* top-left: profile + location + quest */}
      <div className={`pointer-events-auto absolute left-3 top-3 ${isTouch ? 'safe-top safe-left' : ''}`}>
        <div className="game-panel flex items-center gap-3 !rounded-2xl px-3 py-2">
          <div className="grid h-11 w-11 place-items-center rounded-full text-xl font-bold text-white shadow-inner" style={{ background: `linear-gradient(135deg, ${look.outfitColor}, ${look.hairColor})` }}>
            {FRIEND_NAME[0]}
          </div>
          <div>
            <div className="text-base font-bold leading-tight text-[#4a3b5c]">{FRIEND_NAME}</div>
            <AnimatePresence mode="wait">
              <motion.div key={loc.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-xs font-medium text-[#8f74d6]">
                <MapPin size={12} /> {loc.emoji} {loc.name}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <QuestTracker />
        <div className="mt-2 flex gap-1.5 sm:hidden">
          <Stat label="Hearts" icon={<Heart size={16} className="text-[#ff6fa3]" fill="#ff9cc2" />} value={`${hearts}/3`} color="#e5739d" />
          <Stat label="Golden keys" icon={<KeyRound size={16} className="text-[#e0a800]" />} value={`${keys}/3`} color="#c99400" />
          <Stat label="Locations" icon={<MapPin size={16} className="text-[#8f74d6]" />} value={`${found}/5`} color="#8f74d6" />
        </div>
      </div>

      {/* top-right: stats + buttons */}
      <div className={`pointer-events-auto absolute right-3 top-3 flex flex-col items-end gap-2 ${isTouch ? 'safe-top safe-right' : 'sm:flex-row sm:items-center'}`}>
        <div className="hidden gap-1.5 sm:flex">
          <Stat label="Hearts" icon={<Heart size={16} className="text-[#ff6fa3]" fill="#ff9cc2" />} value={`${hearts}/3`} color="#e5739d" />
          <Stat label="Golden keys" icon={<KeyRound size={16} className="text-[#e0a800]" />} value={`${keys}/3`} color="#c99400" />
          <Stat label="Locations" icon={<MapPin size={16} className="text-[#8f74d6]" />} value={`${found}/5`} color="#8f74d6" />
        </div>
        <div className={isTouch ? 'grid grid-cols-2 gap-1.5 sm:flex sm:flex-row' : 'flex flex-col gap-1.5 sm:flex-row'}>
          <button className="icon-btn" onClick={toggleMusic} title="Music">{musicOn ? <Music size={20} /> : <Music2 size={20} className="opacity-40" />}</button>
          <button className="icon-btn" onClick={toggleMute} title="Sound">{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
          <button className="icon-btn" onClick={toggleMap} title="Map">{<MapIcon size={20} className={showMap ? '' : 'opacity-40'} />}</button>
          <button className="icon-btn" onClick={togglePause} title="Pause (Esc)"><Pause size={20} /></button>
        </div>
        {/* touch devices: minimap lives under the buttons, away from the action-button corner */}
        {isTouch && !shortScreen && (
          <AnimatePresence>{showMap && scene === 'town' && <Minimap size={screen.w < 640 ? 112 : 140} />}</AnimatePresence>
        )}
      </div>

      {isTouch && shortScreen && (
        <div className="absolute left-1/2 -translate-x-1/2 safe-top">
          <AnimatePresence>{showMap && scene === 'town' && <Minimap size={92} />}</AnimatePresence>
        </div>
      )}

      {/* desktop minimap (bottom-right) */}
      {!isTouch && (
        <>
          <div className="absolute bottom-3 right-3 hidden sm:block">
            <AnimatePresence>{showMap && scene === 'town' && <Minimap />}</AnimatePresence>
          </div>
          <div className="absolute right-3 top-[220px] sm:hidden scale-75 origin-top-right">
            <AnimatePresence>{showMap && scene === 'town' && <Minimap />}</AnimatePresence>
          </div>
        </>
      )}

      <InteractPrompt />
      <Notifications />
      <Banner />
    </div>
  )
}
