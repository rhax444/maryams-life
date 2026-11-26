import { create } from 'zustand'
import {
  FRIEND_NAME, BEDROOM_LINES, CAFE, HEARTS, KEYS, SHOPS, NPCS, EASTER_EGGS, SECRET_HOUSE,
  ACHIEVEMENTS, DEFAULT_LOOK, LOCATIONS, QUESTS,
} from '../config/gameConfig'
import { audio } from '../audio/sound'
import { resetPlayer, playAction, player, cam } from '../game/playerState'
import { SECRET_SPAWN, SPAWN, COLLIDERS_TOWN, COLLIDERS_SECRET } from '../game/layout'
import { raycastBoxes } from '../game/collision'
import { clearInput } from '../game/input'

let noteId = 0
const SOCIAL_IDS = ['mayor', 'gardener', 'kid', 'barista', 'clothing', 'accessories', 'gifts']

const initial = () => ({
  phase: 'intro', // intro | entering | tutorial | playing | finale
  paused: false,
  scene: 'town', // town | secret
  fading: false,
  look: { ...DEFAULT_LOOK },
  location: 'bedroom',
  discovered: { bedroom: true },
  hearts: [false, false, false],
  keys: [false, false, false],
  unlocked: false,
  giftStage: 'closed', // closed | opening | letter
  eggs: {},
  talked: {},
  bedroomSeen: {},
  drinks: {},
  heldDrink: null,
  brewing: null, // { id, step }
  achievements: {},
  dialog: null, // { speaker, emoji, lines, index }
  panel: null, // 'cafe' | 'shop' | 'customize'
  shopTab: 'outfit',
  reveal: null, // { type: 'heart' | 'key', index }
  banner: null, // { title, subtitle, emoji }
  notifications: [],
  nearby: null,
  showMap: !(typeof window !== 'undefined' && window.innerWidth < 640),
})

export const useGame = create((set, get) => ({
  ...initial(),
  musicOn: true,
  muted: false,
  quality: 'high',
  // Touch UI for phones/tablets (coarse pointer). Touchscreen laptops with a mouse keep the desktop UI.
  isTouch: typeof window !== 'undefined' && (
    window.matchMedia?.('(pointer: coarse)').matches ||
    (navigator.maxTouchPoints > 0 && !window.matchMedia?.('(any-pointer: fine)').matches)
  ),

  // ---------- flow ----------
  startGame: () => {
    audio.init()
    audio.play('start')
    audio.play('whoosh')
    audio.startMusic()
    set({ phase: 'entering' })
  },
  finishEntering: () => set({ phase: 'tutorial' }),
  finishTutorial: () => {
    audio.play('click')
    clearInput()
    set({ phase: 'playing' })
    get().unlockAchievement('firstSteps')
    setTimeout(() => get().showBanner(LOCATIONS.bedroom.name, 'Home sweet chaotic home', LOCATIONS.bedroom.emoji), 400)
  },
  togglePause: () => {
    const s = get()
    if (s.phase !== 'playing' && s.phase !== 'finale') return
    if (s.panel) return set({ panel: null })
    if (s.dialog) return set({ dialog: null })
    audio.play('click')
    clearInput()
    set({ paused: !s.paused })
  },
  restart: () => {
    audio.play('click')
    resetPlayer(SPAWN)
    clearInput()
    audio.resetMusic()
    set({ ...initial(), phase: 'intro' })
  },

  // ---------- settings ----------
  toggleMusic: () => { const on = !get().musicOn; audio.setMusic(on); set({ musicOn: on }) },
  toggleMute: () => { const m = !get().muted; audio.setMuted(m); set({ muted: m }) },
  setQuality: (q) => set({ quality: q }),
  toggleMap: () => set({ showMap: !get().showMap }),

  // ---------- UI helpers ----------
  notify: (title, text, emoji = '✨') => {
    const id = ++noteId
    set((s) => ({ notifications: [...s.notifications.slice(-3), { id, title, text, emoji }] }))
    setTimeout(() => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })), 3800)
  },
  showBanner: (title, subtitle, emoji) => {
    set({ banner: { title, subtitle, emoji, id: ++noteId } })
    const id = noteId
    setTimeout(() => { if (get().banner?.id === id) set({ banner: null }) }, 3200)
  },
  unlockAchievement: (key) => {
    if (get().achievements[key]) return
    const a = ACHIEVEMENTS[key]
    set((s) => ({ achievements: { ...s.achievements, [key]: true } }))
    setTimeout(() => audio.play('achievement'), 250)
    get().notify(`Achievement: ${a.name}`, a.desc, a.emoji)
  },
  say: (speaker, lines, emoji = '💬', onClose = null) => {
    audio.talk()
    set({ dialog: { speaker, emoji, lines: Array.isArray(lines) ? lines : [lines], index: 0, onClose } })
  },
  advanceDialog: () => {
    const d = get().dialog
    if (!d) return
    audio.play('click')
    if (d.index < d.lines.length - 1) { audio.talk(); set({ dialog: { ...d, index: d.index + 1 } }) }
    else { set({ dialog: null }); d.onClose?.() }
  },
  closeDialog: () => { const d = get().dialog; set({ dialog: null }); d?.onClose?.() },
  openPanel: (panel, shopTab) => {
    audio.play('pop')
    clearInput()
    if (panel === 'shop' || panel === 'customize') {
      // pose for the camera: keep the current angle if it's clear, otherwise turn to the nearest clear one
      const colliders = get().scene === 'town' ? COLLIDERS_TOWN : COLLIDERS_SECRET
      const active = (c) => (c === 'locked' ? !get().unlocked : true)
      const o = { x: player.x, y: 1.0, z: player.z }
      let bestYaw = cam.yaw, bestDist = -1
      for (const off of [0, 0.5, -0.5, 1, -1, 1.5, -1.5, 2, -2, 2.6, -2.6, Math.PI]) {
        const y = cam.yaw + off
        const d = { x: Math.sin(y + 0.3) * Math.cos(0.14), y: Math.sin(0.14), z: Math.cos(y + 0.3) * Math.cos(0.14) } // close-up sits at +0.3
        const free = raycastBoxes(o, d, 4.5, colliders, active)
        if (free > bestDist + 0.01) { bestDist = free; bestYaw = y }
        if (free >= 4.5) break
      }
      cam.yaw = bestYaw
      player.facing = bestYaw
      playAction('wave', 1)
    }
    set({ panel, shopTab: shopTab || get().shopTab })
  },
  closePanel: () => { audio.play('click'); set({ panel: null }) },
  setShopTab: (t) => { audio.play('click'); set({ shopTab: t }) },
  closeReveal: () => {
    audio.play('click')
    const r = get().reveal
    set({ reveal: null })
    if (r?.type === 'key' && get().keys.every(Boolean)) {
      get().notify('All keys found!', 'The Secret House gate is waiting for you…', '🗝️')
    }
  },
  setNearby: (id) => { if (get().nearby !== id) set({ nearby: id }) },

  // ---------- world ----------
  setLocation: (loc) => {
    const s = get()
    if (s.location === loc) return
    set({ location: loc })
    if (loc !== 'town' && !s.discovered[loc]) {
      const discovered = { ...s.discovered, [loc]: true }
      set({ discovered })
      audio.play('discover')
      const subs = { cafe: 'Smells like caffeine and gossip', park: 'Fresh air, flowers and hidden things', shops: 'Your wallet is already nervous', secret: 'Something magical is locked in here…' }
      get().showBanner(LOCATIONS[loc].name, subs[loc] || 'New location discovered', LOCATIONS[loc].emoji)
      if (Object.keys(discovered).length >= 5) get().unlockAchievement('explorer')
    }
  },

  collect: (type, index) => {
    const s = get()
    const arr = type === 'heart' ? [...s.hearts] : [...s.keys]
    if (arr[index]) return
    arr[index] = true
    audio.play(type === 'heart' ? 'heart' : 'key')
    playAction('cheer', 1.4)
    set({ [type === 'heart' ? 'hearts' : 'keys']: arr, reveal: { type, index } })
    if (arr.every(Boolean)) get().unlockAchievement(type === 'heart' ? 'heartCollector' : 'keyMaster')
  },

  markTalked: (id) => {
    const talked = { ...get().talked, [id]: true }
    set({ talked })
    if (SOCIAL_IDS.every((k) => talked[k])) get().unlockAchievement('social')
  },

  interact: (it) => {
    const s = get()
    playAction('wave', 1)
    switch (it.kind) {
      case 'line': {
        const seen = { ...s.bedroomSeen, [it.id]: true }
        set({ bedroomSeen: seen })
        if (Object.keys(BEDROOM_LINES).every((k) => seen[k])) get().unlockAchievement('nosy')
        get().say(`${FRIEND_NAME}'s inner voice`, BEDROOM_LINES[it.id], '💭', it.id === 'wardrobe' ? () => get().openPanel('customize', 'outfit') : null)
        break
      }
      case 'npc':
        get().markTalked(it.id)
        get().say(NPCS[it.id].name, NPCS[it.id].line, '🙂')
        break
      case 'barista':
        get().markTalked('barista')
        get().say(CAFE.baristaName, CAFE.baristaGreeting, '🐰', () => get().openPanel('cafe'))
        break
      case 'shop': {
        const shop = SHOPS[it.id]
        get().markTalked(it.id)
        const tab = { clothing: 'outfit', accessories: 'hat', gifts: 'bag' }[it.id]
        get().say(`${shop.keeper} · ${shop.name}`, shop.line, '🛍️', () => get().openPanel('shop', tab))
        break
      }
      case 'egg': {
        const egg = EASTER_EGGS[it.id]
        const first = !s.eggs[it.id]
        const eggs = { ...s.eggs, [it.id]: true }
        set({ eggs })
        if (first) {
          audio.play('discover')
          get().notify('Secret found!', `${Object.keys(eggs).length} hidden secrets discovered`, '🥚')
          if (Object.keys(eggs).length >= 5) get().unlockAchievement('eggHunter')
        }
        get().say(egg.title, egg.text, '🤫')
        break
      }
      case 'gate': {
        const count = s.keys.filter(Boolean).length
        if (s.unlocked) get().say('Secret House', 'The gate is wide open. Follow the glowing path!', '✨')
        else if (count < 3) { audio.play('pop', { rate: 0.6 }); get().say('Secret House', SECRET_HOUSE.lockedLine(count), '🔒') }
        else {
          audio.play('unlock')
          playAction('cheer', 1.6)
          set({ unlocked: true })
          get().say('Secret House', SECRET_HOUSE.unlockLine, '🔓')
          get().notify('Secret House unlocked!', 'Follow the glowing path to the door', '🔓')
        }
        break
      }
      case 'door':
        if (!s.unlocked) get().say('Secret House', SECRET_HOUSE.lockedLine(s.keys.filter(Boolean).length), '🔒')
        else get().enterSecret()
        break
      case 'gift':
        if (s.giftStage === 'closed') get().openGift()
        break
      default:
    }
  },

  // ---------- cafe ----------
  orderDrink: (id) => {
    if (get().brewing) return
    audio.play('ding')
    set({ brewing: { id, step: 0 } })
    setTimeout(() => audio.play('brew'), 300)
    CAFE.preparingSteps.forEach((_, i) => setTimeout(() => {
      const b = get().brewing
      if (b) set({ brewing: { ...b, step: i } })
    }, i * 800))
    setTimeout(() => {
      const drink = CAFE.menu.find((d) => d.id === id)
      const drinks = { ...get().drinks, [id]: true }
      audio.play('ding')
      playAction('drink', 1.8)
      set({ brewing: null, panel: null, heldDrink: id, drinks })
      get().notify(`You got a ${drink.name}!`, drink.description, '☕')
      get().unlockAchievement('caffeinated')
      if (CAFE.menu.every((d) => drinks[d.id])) get().unlockAchievement('connoisseur')
      get().say(CAFE.baristaName, CAFE.served, '🐰')
    }, CAFE.preparingSteps.length * 800 + 400)
  },

  // ---------- customisation ----------
  setLook: (patch) => {
    audio.play('pop', { rate: 1 + Math.random() * 0.3 })
    set((s) => ({ look: { ...s.look, ...patch } }))
    if (get().panel === 'shop') get().unlockAchievement('fashionista')
  },

  // ---------- secret house ----------
  enterSecret: () => {
    audio.play('whoosh')
    clearInput()
    set({ fading: true })
    setTimeout(() => {
      resetPlayer(SECRET_SPAWN)
      set({ scene: 'secret', location: 'secret', nearby: null })
      audio.play('magic')
      setTimeout(() => set({ fading: false }), 300)
    }, 900)
  },

  openGift: () => {
    audio.play('magic')
    audio.playFinaleMusic()
    clearInput()
    player.x = -1.7; player.z = -1.2; player.facing = Math.atan2(1.7, -1.3)
    playAction('cheer', 3)
    set({ phase: 'finale', giftStage: 'opening', dialog: null, panel: null, nearby: null })
    setTimeout(() => audio.play('reward'), 1200)
    setTimeout(() => {
      set({ giftStage: 'letter' })
      get().unlockAchievement('theEnd')
    }, 4200)
  },
}))

// Derived helpers ------------------------------------------------------------
export function getQuests(s) {
  const discoveredCount = Object.keys(s.discovered).length
  const list = [
    { id: 'explore', text: QUESTS.explore, done: discoveredCount >= 3 },
    { id: 'cafe', text: QUESTS.cafe, done: Object.keys(s.drinks).length > 0 },
    { id: 'keys', text: `${QUESTS.keys} (${s.keys.filter(Boolean).length}/3)`, done: s.keys.every(Boolean) },
    { id: 'unlock', text: QUESTS.unlock, done: s.unlocked },
    { id: 'enter', text: QUESTS.enter, done: s.scene === 'secret' },
    { id: 'gift', text: QUESTS.gift, done: s.giftStage !== 'closed' },
  ]
  const current = list.find((q) => !q.done) || { id: 'done', text: QUESTS.done, done: true }
  return { list, current }
}

export const isBusy = (s) => s.paused || !!s.dialog || !!s.panel || !!s.reveal || s.fading || s.phase !== 'playing'
