// Procedurally synthesised sound effects + music, played through Howler.js.
// No audio files to download: every sound is rendered to a tiny WAV at startup.
import { Howl, Howler } from 'howler'

const SR = 22050
const TAU = Math.PI * 2

function toWavUrl(data) {
  let peak = 0
  for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]))
  const gain = peak > 0.95 ? 0.95 / peak : 1
  const buf = new ArrayBuffer(44 + data.length * 2)
  const v = new DataView(buf)
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)))
  w(0, 'RIFF'); v.setUint32(4, 36 + data.length * 2, true); w(8, 'WAVE'); w(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, SR, true); v.setUint32(28, SR * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  w(36, 'data'); v.setUint32(40, data.length * 2, true)
  for (let i = 0; i < data.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i] * gain)) * 32767, true)
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
}

const osc = {
  sine: (p) => Math.sin(TAU * p),
  tri: (p) => 1 - 4 * Math.abs(Math.round(p - 0.25) - (p - 0.25)),
  square: (p) => (p % 1 < 0.5 ? 0.6 : -0.6),
  saw: (p) => 2 * (p % 1) - 1,
}

// Add a note into a buffer
function tone(buf, start, dur, freq, o = {}) {
  const { type = 'sine', vol = 0.3, attack = 0.005, release = dur * 0.8, slide = 0, vibrato = 0, harmonics = null } = o
  const s0 = Math.floor(start * SR), n = Math.floor(dur * SR)
  let phase = 0
  for (let i = 0; i < n && s0 + i < buf.length; i++) {
    const t = i / SR
    const f = freq + slide * (t / dur) + (vibrato ? Math.sin(TAU * 5.5 * t) * vibrato : 0)
    phase += f / SR
    let env = t < attack ? t / attack : 1
    const relStart = dur - release
    if (t > relStart) env *= Math.max(0, 1 - (t - relStart) / release) ** 2
    let s = osc[type](phase)
    if (harmonics) harmonics.forEach(([mul, amp]) => { s += Math.sin(TAU * phase * mul) * amp * Math.exp(-t * 6) })
    buf[s0 + i] += s * env * vol
  }
}

function noise(buf, start, dur, o = {}) {
  const { vol = 0.2, cutoffStart = 0.3, cutoffEnd = 0.05, attack = 0.005 } = o
  const s0 = Math.floor(start * SR), n = Math.floor(dur * SR)
  let lp = 0
  for (let i = 0; i < n && s0 + i < buf.length; i++) {
    const t = i / SR, k = i / n
    const a = cutoffStart + (cutoffEnd - cutoffStart) * k
    lp += a * (Math.random() * 2 - 1 - lp)
    const env = (t < attack ? t / attack : 1) * (1 - k) ** 2
    buf[s0 + i] += lp * env * vol * 3
  }
}

const N = (semi) => 440 * Math.pow(2, (semi - 9) / 12) // semitones from C4 (0 = C4)

function render(seconds, fn) {
  const buf = new Float32Array(Math.ceil(seconds * SR))
  fn(buf)
  return toWavUrl(buf)
}

const BELL = [[2.76, 0.35], [5.4, 0.15]]

const recipes = {
  click: () => render(0.1, (b) => tone(b, 0, 0.08, 880, { type: 'tri', vol: 0.35, slide: 500 })),
  pop: () => render(0.14, (b) => tone(b, 0, 0.12, 520, { vol: 0.45, slide: 700 })),
  step: () => render(0.08, (b) => { noise(b, 0, 0.06, { vol: 0.25, cutoffStart: 0.15, cutoffEnd: 0.02 }); tone(b, 0, 0.05, 130, { vol: 0.15 }) }),
  jump: () => render(0.18, (b) => tone(b, 0, 0.16, 330, { vol: 0.3, slide: 380, type: 'tri' })),
  talk: () => render(0.07, (b) => tone(b, 0, 0.06, 620, { type: 'tri', vol: 0.25, slide: 80 })),
  heart: () => render(1.1, (b) => {
    [12, 16, 19, 24, 28].forEach((s, i) => tone(b, i * 0.07, 0.6, N(s + 12), { vol: 0.22, harmonics: BELL }))
    noise(b, 0, 0.6, { vol: 0.05, cutoffStart: 0.9, cutoffEnd: 0.6 })
  }),
  key: () => render(1.4, (b) => {
    tone(b, 0, 1.2, N(28), { vol: 0.25, harmonics: BELL })
    tone(b, 0.12, 1.2, N(35), { vol: 0.2, harmonics: BELL })
    tone(b, 0.24, 1.1, N(40), { vol: 0.18, harmonics: BELL })
  }),
  ding: () => render(0.9, (b) => { tone(b, 0, 0.7, N(31), { vol: 0.3, harmonics: BELL }); tone(b, 0.14, 0.7, N(36), { vol: 0.3, harmonics: BELL }) }),
  brew: () => render(2.2, (b) => {
    noise(b, 0, 1.6, { vol: 0.12, cutoffStart: 0.05, cutoffEnd: 0.5, attack: 0.3 })
    for (let i = 0; i < 14; i++) tone(b, 0.4 + Math.random() * 1.5, 0.05, 500 + Math.random() * 500, { vol: 0.08, slide: 300 })
  }),
  unlock: () => render(1.8, (b) => {
    noise(b, 0, 0.12, { vol: 0.5, cutoffStart: 0.2, cutoffEnd: 0.05 }); tone(b, 0, 0.15, 90, { vol: 0.5 })
    noise(b, 0.25, 0.15, { vol: 0.5, cutoffStart: 0.2, cutoffEnd: 0.05 }); tone(b, 0.25, 0.2, 70, { vol: 0.5 })
    ;[0, 4, 7, 12, 16].forEach((s, i) => tone(b, 0.55 + i * 0.09, 0.9, N(s + 12), { vol: 0.2, harmonics: BELL }))
  }),
  discover: () => render(1.0, (b) => { tone(b, 0, 0.5, N(19), { vol: 0.25, type: 'tri' }); tone(b, 0.15, 0.7, N(24), { vol: 0.25, type: 'tri' }) }),
  whoosh: () => render(0.8, (b) => noise(b, 0, 0.75, { vol: 0.25, cutoffStart: 0.02, cutoffEnd: 0.4, attack: 0.3 })),
  achievement: () => render(1.2, (b) => {
    ;[[0, 0], [4, 0.1], [7, 0.2], [12, 0.3]].forEach(([s, t]) => tone(b, t, 0.7, N(s + 12), { type: 'tri', vol: 0.2 }))
    ;[0, 4, 7].forEach((s) => tone(b, 0.4, 0.8, N(s + 12), { type: 'tri', vol: 0.12 }))
  }),
  magic: () => render(3.2, (b) => {
    for (let i = 0; i < 18; i++) tone(b, i * 0.1, 1.2, N([0, 4, 7, 11, 14, 16][i % 6] + 12 + 12 * Math.floor(i / 6)), { vol: 0.12, harmonics: BELL })
    noise(b, 0, 2.5, { vol: 0.06, cutoffStart: 0.9, cutoffEnd: 0.8, attack: 0.8 })
  }),
  reward: () => render(2.6, (b) => {
    ;[[0, 4, 7], [5, 9, 12], [7, 11, 14], [12, 16, 19]].forEach((ch, i) => ch.forEach((s) => tone(b, i * 0.32, i === 3 ? 1.6 : 0.4, N(s), { type: 'tri', vol: 0.14, vibrato: i === 3 ? 3 : 0 })))
  }),
  start: () => render(1.2, (b) => {
    ;[0, 7, 12, 16, 19, 24].forEach((s, i) => tone(b, i * 0.06, 0.7, N(s + 12), { vol: 0.18, harmonics: BELL }))
  }),
}

// Cozy looping town music: C – Am – F – G, gentle plucks
function renderMusic() {
  const bpm = 96, beat = 60 / bpm, bars = 8
  return render(bars * 4 * beat, (b) => {
    const prog = [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]]
    const melody = [
      [12, 14, 16, 19, 16, 14, 12, 9], [12, 9, 7, 9, 12, null, 9, 7], [5, 9, 12, 14, 12, 9, 5, 7], [7, 11, 14, 11, 19, 17, 16, 14],
      [16, 19, 21, 19, 16, 14, 12, 14], [12, 16, 9, 12, 7, null, 9, 12], [9, 12, 14, 17, 16, 14, 12, 9], [11, 14, 12, 11, 12, null, null, null],
    ]
    for (let bar = 0; bar < bars; bar++) {
      const ch = prog[bar % 4]
      const t0 = bar * 4 * beat
      tone(b, t0, beat * 1.9, N(ch[0] - 12), { vol: 0.16, type: 'tri' })
      tone(b, t0 + 2 * beat, beat * 1.9, N(ch[0] - 12 + 7), { vol: 0.12, type: 'tri' })
      ch.forEach((s) => tone(b, t0, 4 * beat, N(s), { vol: 0.035, attack: 0.4, release: 1.2, vibrato: 1.5 }))
      for (let i = 0; i < 4; i++) ch.forEach((s, k) => tone(b, t0 + i * beat + k * 0.04 + beat * 0.5, 0.25, N(s + 12), { vol: 0.03 }))
      melody[bar].forEach((s, i) => {
        if (s === null) return
        tone(b, t0 + i * beat * 0.5, beat * 0.9, N(s), { vol: 0.11, harmonics: [[2, 0.3], [3, 0.1]] })
      })
      for (let i = 0; i < 8; i++) noise(b, t0 + i * beat * 0.5, 0.04, { vol: i % 2 ? 0.025 : 0.012, cutoffStart: 0.9, cutoffEnd: 0.9 })
    }
  })
}

// Gentle music-box loop for the finale
function renderFinaleMusic() {
  const bpm = 70, beat = 60 / bpm, bars = 8
  return render(bars * 3 * beat, (b) => {
    const prog = [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]]
    const tune = [[19, 16, 12], [17, 14, 11], [16, 12, 9], [14, 12, 9], [19, 21, 19], [17, 19, 14], [16, 14, 12], [12, null, null]]
    for (let bar = 0; bar < bars; bar++) {
      const ch = prog[bar % 4], t0 = bar * 3 * beat
      ch.forEach((s, i) => tone(b, t0 + i * beat, beat * 2.5, N(s), { vol: 0.07, harmonics: BELL }))
      ch.forEach((s) => tone(b, t0, 3 * beat, N(s - 12), { vol: 0.03, attack: 0.5, release: 1.5 }))
      tune[bar].forEach((s, i) => s !== null && tone(b, t0 + i * beat, beat * 2, N(s + 12), { vol: 0.12, harmonics: BELL }))
    }
  })
}

class AudioManager {
  sounds = {}
  music = null
  finale = null
  ready = false
  musicOn = true
  lastStep = 0

  init() {
    if (this.ready) return
    for (const [name, make] of Object.entries(recipes)) {
      this.sounds[name] = new Howl({ src: [make()], format: ['wav'], volume: name === 'step' ? 0.35 : 0.8 })
    }
    this.music = new Howl({ src: [renderMusic()], format: ['wav'], loop: true, volume: 0 })
    this.ready = true
  }

  play(name, opts = {}) {
    if (!this.ready) return
    const s = this.sounds[name]
    if (!s) return
    const id = s.play()
    if (opts.rate) s.rate(opts.rate, id)
    if (opts.volume !== undefined) s.volume(opts.volume, id)
  }

  step() {
    const now = performance.now()
    if (now - this.lastStep < 120) return
    this.lastStep = now
    this.play('step', { rate: 0.85 + Math.random() * 0.4 })
  }

  talk() {
    this.play('talk', { rate: 0.8 + Math.random() * 0.6, volume: 0.5 })
  }

  startMusic() {
    if (!this.ready || !this.musicOn) return
    const m = this.finale && this.finale.playing() ? null : this.music
    if (m && !m.playing()) { m.play(); m.fade(0, 0.5, 1500) }
  }

  setMusic(on) {
    this.musicOn = on
    if (!this.ready) return
    const active = this.finale && this.finaleActive ? this.finale : this.music
    if (on) { if (!active.playing()) active.play(); active.fade(active.volume(), 0.5, 600) }
    else active.pause()
  }

  playFinaleMusic() {
    if (!this.ready) return
    if (!this.finale) this.finale = new Howl({ src: [renderFinaleMusic()], format: ['wav'], loop: true, volume: 0 })
    this.finaleActive = true
    this.music.fade(this.music.volume(), 0, 1200)
    setTimeout(() => this.music.pause(), 1300)
    if (this.musicOn) { this.finale.play(); this.finale.fade(0, 0.55, 2000) }
  }

  resetMusic() {
    if (!this.ready) return
    this.finaleActive = false
    if (this.finale) this.finale.stop()
    if (this.musicOn) { if (!this.music.playing()) this.music.play(); this.music.fade(0, 0.5, 1500) }
  }

  setMuted(m) {
    Howler.mute(m)
  }
}

export const audio = new AudioManager()
