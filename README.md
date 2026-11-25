# Maryam's Life 🏡💖

*The Little World of Maryam*: a cozy 3D life-simulation game built with React, Vite, Three.js / React Three Fiber, Drei, Tailwind, Framer Motion, Lucide and Howler.js.

**Play it live:** https://maryams-life.vercel.app

Every push to `main` deploys automatically to Vercel.

## Run it

```bash
npm install
npm run dev      # play at http://localhost:5173
npm run build    # static site in dist/ (host on Netlify, Vercel, GitHub Pages…)
```

## Personalise it

Everything Maryam reads lives in **`src/config/gameConfig.js`**. That includes her name, the title, every dialogue line, the cafe menu, heart and key messages, NPC lines, easter eggs, achievements, customisation options and the final letter. Edit that file only; the engine doesn't need to change.

## Controls

| Desktop | Mobile |
|---|---|
| WASD / arrows to walk, Shift to run, Space to jump | Virtual joystick + ⤒ jump button |
| E to interact, drag the mouse to look, mouse wheel to zoom | ★ button to interact, drag the screen to look |
| Esc for the pause menu (achievements, settings, restart) | Pause button (top right) |

## Map of the code

- `src/config/gameConfig.js`: all text and options
- `src/store/useGame.js`: progression, quests, achievements (zustand)
- `src/game/layout.js`: world positions, colliders, interactables, collectibles
- `src/game/collision.js`: circle-vs-box collision + camera ray clipping
- `src/audio/sound.js`: every sound and both music loops are synthesised at runtime (no audio files)
- `src/components/scene/*`: 3D world (Town, Bedroom/Cafe, Park, Shops, SecretHouse, SecretRoom, Character, Player, CameraRig)
- `src/components/ui/*`: intro, HUD, minimap, dialogs, cafe and shop panels, pause menu, mobile controls, finale

Graphics automatically drop to a lighter mode on slow devices. You can also toggle it under Pause → Settings.
