// World layout: positions of every location, collider and interactable.
// Coordinates: x = east/west, z = north/south (-z is "up" on the minimap). Ground is y = 0.

export const BOUNDS = 38

export const SPAWN = { x: -20, z: 24, facing: Math.PI, yaw: Math.PI }
export const SECRET_SPAWN = { x: 0, z: 3, facing: Math.PI, yaw: 0 }

// --- Location regions (for "current location" + discovery) -------------------
export const REGIONS = [
  { id: 'bedroom', minX: -25.5, maxX: -14.5, minZ: 19.6, maxZ: 28.5 },
  { id: 'cafe', minX: 14, maxX: 26, minZ: 14, maxZ: 28.5 },
  { id: 'shops', minX: 22, maxX: 39, minZ: -26, maxZ: 4 },
  { id: 'secret', minX: -37, maxX: -15.5, minZ: -37, maxZ: -15 },
  { id: 'park', minX: -12.5, maxX: 15, minZ: -29, maxZ: 7 },
]

// Interior rooms where the camera gently swings to look through the open side
export const INTERIORS = [
  { minX: -25, maxX: -15, minZ: 20, maxZ: 28, yaw: Math.PI },
  { minX: 15, maxX: 25, minZ: 20, maxZ: 28, yaw: Math.PI },
]

// Minimap markers
export const MAP_MARKERS = [
  { id: 'bedroom', x: -20, z: 24 },
  { id: 'cafe', x: 20, z: 24 },
  { id: 'park', x: 1, z: -10 },
  { id: 'shops', x: 32, z: -11 },
  { id: 'secret', x: -29, z: -26 },
]

// --- Roads & paths (purely visual + used to keep flowers off them) ----------
export const ROADS = [
  { x: 0, z: 12, w: 78, d: 4.2, kind: 'road' }, // main east-west road
  { x: -14, z: -11, w: 3.6, d: 46, kind: 'road' }, // west road
  { x: 26.5, z: -7, w: 5, d: 38, kind: 'street' }, // shopping street
  { x: -20, z: 17, w: 3, d: 6, kind: 'path' }, // bedroom path
  { x: 20, z: 17, w: 3, d: 6, kind: 'path' }, // cafe path
  { x: 1, z: -8.5, w: 2.6, d: 37, kind: 'path' }, // park north-south
  { x: 5, z: -8, w: 38, d: 2.6, kind: 'path' }, // park east-west
  { x: -16.5, z: -26, w: 4, d: 2.6, kind: 'path' }, // to secret gate
  { x: 0, z: 22, w: 3, d: 6, kind: 'path' }, // town hall
]

// --- Colliders --------------------------------------------------------------
const box = (minX, maxX, minZ, maxZ, h = 3, extra = {}) => ({ type: 'box', minX, maxX, minZ, maxZ, h, ...extra })
const circle = (x, z, r, h = 3, extra = {}) => ({ type: 'circle', x, z, r, h, ...extra })

// Open-front room: back wall (south), side walls, low front railing with entrance gap
function roomWalls(minX, maxX, minZ, maxZ, gapMin, gapMax) {
  const t = 0.3
  return [
    box(minX - t, maxX + t, maxZ, maxZ + t, 3.4), // back wall
    box(minX - t, minX, minZ - t, maxZ + t, 3.4), // west
    box(maxX, maxX + t, minZ - t, maxZ + t, 3.4), // east
    box(minX - t, gapMin, minZ - t, minZ, 0.7), // railing left
    box(gapMax, maxX + t, minZ - t, minZ, 0.7), // railing right
  ]
}

export const TREES = [
  // park
  [-10, -12, 'round', '#9be3c4'], [12, -2, 'cherry', '#f6b5cf'], [-11, -23.5, 'round', '#a7dcb5'],
  [13, -20, 'pine', '#86cfa6'], [-3, -23.5, 'cherry', '#f9c4d9'], [8.5, -12, 'round', '#b8e6c9'],
  [-9.5, 2, 'cherry', '#f3a8c8'], [11, 4, 'lav', '#d3c2f5'], [-6, -9, 'lav', '#cbb9f2'], [6, -26.5, 'round', '#9fdcbc'],
  [-11.6, -0.6, 'round', '#a2dfbf'],
  // town
  [-28, 8, 'round', '#9fdcbc'], [-8, 16, 'cherry', '#f6b5cf'], [8, 16, 'cherry', '#f6b5cf'], [30, 16, 'round', '#b0e3c8'],
  [-36, 15, 'pine', '#8fd1ab'], [36, 15, 'pine', '#8fd1ab'], [-20, 4, 'lav', '#d3c2f5'], [-24, -8, 'round', '#a7dcb5'],
  [-6, -33, 'pine', '#86cfa6'], [10, -33, 'round', '#9be3c4'], [21, -31, 'cherry', '#f9c4d9'], [37, -13, 'pine', '#8fd1ab'],
  [-2, 31, 'round', '#a7dcb5'], [10, 31, 'lav', '#d3c2f5'], [-10, 31, 'cherry', '#f6b5cf'], [30, 31, 'round', '#9fdcbc'],
  [-32, 31, 'lav', '#cbb9f2'], [-28, -2, 'cherry', '#f3a8c8'], [17, -16, 'round', '#b8e6c9'], [-20, -34, 'pine', '#86cfa6'],
  [36, 4, 'cherry', '#f9c4d9'], [-37, -10, 'round', '#9be3c4'], [22, 2, 'round', '#a7dcb5'], [-6, 26, 'pine', '#8fd1ab'],
  [7, 26, 'round', '#9fdcbc'], [-28, 28.5, 'round', '#b0e3c8'], [28, 28.5, 'cherry', '#f6b5cf'],
]

// Decorative houses around town: [x, z, w, d, wallColor, roofColor, rotation]
export const HOUSES = [
  [-33, 22, 6, 6, '#bfe0f7', '#8fa8e8', 0],
  [0, 24, 8, 6, '#e3d6fb', '#a48ae6', 0],
  [33, 22, 6, 6, '#c9f0de', '#7cc9a6', 0],
  [-32, 2, 6, 6, '#fff0b8', '#f0a868', Math.PI / 2],
]

export const BENCHES = [
  [-2.6, -4.1, 0], // [x, z, rotationY]
  [6.3, -11.3, Math.PI],
  [-2.6, -11.9, Math.PI],
]

export const LAMPS = [-34, -24, -9, 6, 14, 32].flatMap((x) => [[x, 9.4], [x, 14.6]])
  .concat([[-16.2, -4], [-16.2, -18], [23.2, -18], [23.2, -4], [30, -24.5], [4, -1.5], [-2, -14]])

export const COLLIDERS_TOWN = [
  // Maryam's bedroom
  ...roomWalls(-25, -15, 20, 28, -22, -18),
  box(-24.9, -22.6, 24.8, 28, 0.8), // bed
  box(-22.5, -21.7, 27.2, 28, 0.7), // nightstand
  box(-17.4, -15.2, 27.1, 28, 2.4), // wardrobe
  box(-15.4, -15, 24, 25, 2), // mirror
  box(-15.9, -15, 21.2, 22.8, 0.9), // dressing table
  box(-25, -24.3, 21, 23, 2.2), // bookshelf
  circle(-24.4, 20.6, 0.35, 1), // plant
  // Cafe
  ...roomWalls(15, 25, 20, 28, 18, 22),
  box(17, 23, 25, 25.9, 1.1), // counter
  box(16, 24, 27.3, 28, 1), // back counter
  circle(16.9, 22.2, 0.7, 1), circle(23.1, 22.2, 0.7, 1),
  circle(16.5, 16.8, 0.75, 1), circle(23.5, 16.8, 0.75, 1), // outdoor tables
  // Decorative houses
  ...HOUSES.map(([x, z, w, d, , , rot]) => {
    const [hw, hd] = rot ? [d / 2, w / 2] : [w / 2, d / 2]
    return box(x - hw, x + hw, z - hd, z + hd, 5)
  }),
  // Park
  circle(1, -8, 2.5, 1.2), // fountain
  circle(-6, -18, 3.8, 0.2), // pond
  ...BENCHES.map(([x, z]) => box(x - 1, x + 1, z - 0.32, z + 0.32, 0.8)),
  // Shops
  box(31, 37, -22, -16, 5), box(31, 37, -14, -8, 5), box(31, 37, -6, 0, 5),
  circle(23.2, -10, 1, 1.4), // flower stall
  circle(22.6, -20.5, 0.45, 1), // barrel
  // Secret house fence + house
  box(-36, -18, -36.2, -35.8, 1.2),
  box(-36, -18, -16.2, -15.8, 1.2),
  box(-36.2, -35.8, -36, -16, 1.2),
  box(-18.2, -17.8, -36, -27, 1.2),
  box(-18.2, -17.8, -25, -16, 1.2),
  box(-18.2, -17.8, -27, -25, 1.2, { cond: 'locked' }), // the gate
  box(-33, -25, -31, -21, 6), // the house
  // NPCs + shop stalls
  circle(-4, 15.6, 0.45, 2), circle(7, -20, 0.45, 2), circle(-9, 7, 0.4, 2),
  ...[-19, -11, -3].flatMap((z) => [circle(29.4, z - 0.9, 0.45, 2), box(29.2, 30.2, z - 0.2, z + 0.8, 1.1)]),
  // Trees
  ...TREES.map(([x, z]) => circle(x, z, 0.6, 4)),
  // Lamps
  ...LAMPS.map(([x, z]) => circle(x, z, 0.22, 3)),
]

export const COLLIDERS_SECRET = [
  box(-7.3, 7.3, -7.3, -7, 4), // back
  box(-7.3, -7, -7.3, 5.3, 4),
  box(7, 7.3, -7.3, 5.3, 4),
  box(-7.3, 7.3, 5, 5.3, 0.8), // front railing (closed)
  circle(0, -2.5, 1.3, 1), // gift table
  circle(-5.6, -5.6, 0.6, 1), circle(5.6, -5.6, 0.6, 1),
]

// --- Interactables -----------------------------------------------------------
// kind: line (inner voice), npc, egg, barista, shop, gate, door
export const INTERACTABLES_TOWN = [
  // Bedroom
  { id: 'bed', kind: 'line', x: -22.2, z: 26, r: 1.7, label: 'Bed' },
  { id: 'phone', kind: 'line', x: -22.1, z: 26.9, r: 1.1, label: 'Phone' },
  { id: 'window', kind: 'line', x: -19.5, z: 27.1, r: 1.4, label: 'Window' },
  { id: 'wardrobe', kind: 'line', x: -16.3, z: 26.4, r: 1.4, label: 'Wardrobe' },
  { id: 'mirror', kind: 'line', x: -15.9, z: 24.5, r: 1.3, label: 'Mirror' },
  { id: 'dresser', kind: 'line', x: -16.4, z: 22, r: 1.2, label: 'Dressing Table' },
  { id: 'bookshelf', kind: 'line', x: -23.8, z: 22, r: 1.3, label: 'Bookshelf' },
  { id: 'plant', kind: 'line', x: -24.1, z: 21.1, r: 0.9, label: 'Plant' },
  { id: 'bedroomButton', kind: 'egg', x: -24.6, z: 24.1, r: 0.9, label: 'Tiny button?' },
  // Cafe
  { id: 'barista', kind: 'barista', x: 20, z: 24.2, r: 1.9, label: 'Order a drink' },
  { id: 'cafeMug', kind: 'egg', x: 24.4, z: 23.4, r: 1.2, label: 'A lonely mug' },
  // NPCs
  { id: 'mayor', kind: 'npc', x: -4, z: 15.6, r: 1.8, label: 'Talk' },
  { id: 'gardener', kind: 'npc', x: 7, z: -20, r: 1.8, label: 'Talk' },
  { id: 'kid', kind: 'npc', x: -9, z: 7, r: 1.7, label: 'Talk' },
  // Shops (keepers stand outside their stores)
  { id: 'clothing', kind: 'shop', x: 28.6, z: -19.6, r: 2.2, label: 'Pastel Threads' },
  { id: 'accessories', kind: 'shop', x: 28.6, z: -11.6, r: 2.2, label: 'Bows & Bobs' },
  { id: 'gifts', kind: 'shop', x: 28.6, z: -3.6, r: 2.2, label: 'Tiny Treasures' },
  // Easter eggs
  { id: 'treeSign', kind: 'egg', x: -11.2, z: -25, r: 1.2, label: 'A sign?' },
  { id: 'tinyNpc', kind: 'egg', x: 22.2, z: -21.6, r: 1.6, label: 'Something rustles…' },
  { id: 'parkSign', kind: 'egg', x: -12, z: 5, r: 1.2, label: 'A suspicious sign' },
  { id: 'duck', kind: 'egg', x: -5, z: -15.2, r: 1.8, label: 'Rubber duck' },
  { id: 'bench', kind: 'egg', x: 6.3, z: -10.4, r: 1.3, label: 'Sit on bench' },
  // Secret house
  { id: 'gate', kind: 'gate', x: -16.8, z: -26, r: 2, label: 'Locked gate' },
  { id: 'door', kind: 'door', x: -24.2, z: -26, r: 1.6, label: 'Enter the Secret House' },
]

export const INTERACTABLES_SECRET = [
  { id: 'gift', kind: 'gift', x: 0, z: -1, r: 2.4, label: 'Open your gift' },
]

// --- Collectibles ------------------------------------------------------------
export const HEART_SPOTS = [
  { x: 10.5, z: -14.5 }, // between hedges by the round tree
  { x: -10.4, z: -3.2 }, // behind the picnic tree
  { x: 9, z: -27.4 }, // by the creek, near the bridge
]

export const KEY_SPOTS = [
  { x: -20, z: 29.6 }, // behind Maryam's house
  { x: -10.8, z: -20.6 }, // flowers by the pond
  { x: 34, z: -15 }, // alley between shops
]

// Height of the walkable ground (the arched bridge over the creek)
export function groundHeight(x, z) {
  if (Math.abs(x - 1) < 1.25 && Math.abs(z + 27) < 2.2) {
    const k = (z + 27 + 2.2) / 4.4
    return Math.sin(k * Math.PI) * 0.55 + 0.08
  }
  return 0
}

export function regionAt(x, z) {
  for (const r of REGIONS) if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) return r.id
  return 'town'
}

export function interiorAt(x, z) {
  return INTERIORS.find((r) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) || null
}

// Is a point free for decoration (not on roads, buildings or water)?
export function isFree(x, z, pad = 0.6) {
  if (Math.abs(x) > BOUNDS + 4 || Math.abs(z) > BOUNDS + 4) return false
  for (const r of ROADS) if (Math.abs(x - r.x) < r.w / 2 + pad && Math.abs(z - r.z) < r.d / 2 + pad) return false
  for (const c of COLLIDERS_TOWN) {
    if (c.type === 'box' && x > c.minX - pad && x < c.maxX + pad && z > c.minZ - pad && z < c.maxZ + pad) return false
    if (c.type === 'circle' && (x - c.x) ** 2 + (z - c.z) ** 2 < (c.r + pad) ** 2) return false
  }
  for (const r of INTERIORS) if (x > r.minX - 0.6 && x < r.maxX + 0.6 && z > r.minZ - 0.6 && z < r.maxZ + 0.6) return false
  if (z > -28.5 && z < -25.5 && x > -12.5 && x < 14.5) return false // creek
  for (const s of [...HEART_SPOTS, ...KEY_SPOTS]) if ((x - s.x) ** 2 + (z - s.z) ** 2 < 0.8) return false
  return true
}

// deterministic random
export function rng(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
