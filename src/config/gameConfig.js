// ============================================================================
//  MARYAM'S LIFE — GAME CONFIGURATION
//  Edit anything in this file to personalise the game. No engine code needed.
// ============================================================================

export const FRIEND_NAME = 'Maryam'
export const GAME_TITLE = "Maryam's Life"
export const GAME_SUBTITLE = 'The Little World of Maryam'
export const TAGLINE = 'Your life. Your rules. Your questionable decisions.'

export const INTRO = {
  greeting: `Welcome, ${FRIEND_NAME}! Your little world is waiting.`,
  joke: "Today, you're the main character. As usual, actually.",
  startButton: 'START MY LIFE',
}

export const TUTORIAL = {
  title: 'How to live your best life',
  desktop: [
    { keys: 'W A S D / Arrows', text: 'Walk around town' },
    { keys: 'Shift', text: 'Run (dramatically)' },
    { keys: 'Space', text: 'Jump' },
    { keys: 'E', text: 'Interact with things & people' },
    { keys: 'Drag mouse', text: 'Look around' },
    { keys: 'Esc', text: 'Pause menu' },
  ],
  mobile: [
    { keys: 'Joystick', text: 'Walk around town' },
    { keys: '★ button', text: 'Interact' },
    { keys: '⤒ button', text: 'Jump' },
    { keys: 'Drag screen', text: 'Look around' },
  ],
  footer: 'Explore, poke everything, and find the secrets hidden around town.',
  button: "Let's go!",
}

// Names of the five locations (also shown on signs and the HUD)
export const LOCATIONS = {
  bedroom: { name: `${FRIEND_NAME}'s Bedroom`, sign: `${FRIEND_NAME}'s Room`, emoji: '🛏️' },
  cafe: { name: 'The Cafe', sign: 'Café Sugarcloud', emoji: '☕' },
  park: { name: 'Friendship Park', sign: 'Friendship Park', emoji: '🌳' },
  shops: { name: 'Shopping Street', sign: 'Shopping Street', emoji: '🛍️' },
  secret: { name: 'The Secret House', sign: '???', emoji: '🔒' },
  town: { name: 'Town Square', emoji: '🏡' },
}

// Bedroom object interactions
export const BEDROOM_LINES = {
  mirror: 'Looking fabulous, Maryam. Confidence level: 100%. Humility level: still loading.',
  phone: 'Breaking news: Maryam has 47 unread messages and absolutely no intention of replying.',
  wardrobe: 'Another outfit? Obviously. You have nothing to wear.',
  bed: 'Productivity status: Currently unavailable.',
  window: 'Beautiful weather outside. Unfortunately, your laziness is also beautiful.',
  bookshelf: "A whole shelf of books you're 'definitely going to read next week'.",
  dresser: 'Seventeen lip balms. All of them essential. None of them can be found when needed.',
  plant: "Your plant is thriving. It's the only one here with a consistent routine.",
}

// Cafe
export const CAFE = {
  baristaName: 'Barista Bun',
  baristaGreeting: "Hi hi! Welcome to Café Sugarcloud. What are we feeling today? Don't say 'just water'.",
  preparingSteps: ['Grinding beans with feelings…', 'Steaming the milk dramatically…', 'Adding a pinch of sparkle…', 'Drawing a tiny heart on top…'],
  served: 'Here you go! Made with love and a concerning amount of sugar.',
  menu: [
    { id: 'latte', name: 'Overthinking Latte', price: '3 sighs', color: '#c89b7b', description: "For people who think about things that haven't even happened." },
    { id: 'cappuccino', name: 'Drama Cappuccino', price: '1 plot twist', color: '#a8785a', description: 'Extra drama, zero solutions.' },
    { id: 'mocha', name: 'Main Character Mocha', price: '1 spotlight', color: '#7b4f3a', description: 'Comes with background music and a slow-motion entrance.' },
    { id: 'milkshake', name: 'Happiness Milkshake', price: '2 giggles', color: '#ffb3cf', description: 'Pink, fluffy, and guaranteed to fix at least one bad mood.' },
    { id: 'special', name: 'Maryam Special', price: 'Priceless', color: '#c8b6f2', description: 'One part cuteness, two parts chaos, unlimited attitude.' },
  ],
}

// Friendship Park — collectible hearts
export const HEARTS = [
  "You're genuinely one of those people who make ordinary days more interesting.",
  'Your weird personality is honestly one of your best features. Never lose it.',
  "Just a little reminder that you're appreciated more than you probably realize.",
]

// Golden keys for the Secret House
export const KEYS = [
  { title: 'Golden Key #1', text: 'Found behind your own house. Classic. The answer was home all along.' },
  { title: 'Golden Key #2', text: 'Tucked in the flowers by the pond. Even the ducks were keeping secrets.' },
  { title: 'Golden Key #3', text: 'Hidden between the shops. Of course you found it while shopping.' },
]

// Shopping Street
export const SHOPS = {
  clothing: {
    name: 'Pastel Threads',
    keeper: 'Miss Stitch',
    line: "Welcome! You don't need anything, but I know you'll buy something anyway.",
  },
  accessories: {
    name: 'Bows & Bobs',
    keeper: 'Mr. Sparkle',
    line: "Fashion is temporary. Maryam's shopping decisions are permanent.",
  },
  gifts: {
    name: 'Tiny Treasures',
    keeper: 'Granny Gift',
    line: "Ah, a bag! Because where else would you keep 14 receipts and a single mint?",
  },
}

// Town NPCs (wandering / standing characters)
export const NPCS = {
  mayor: { name: 'Mayor Muffin', line: "Ah, Maryam! The town's been unusually calm. Please fix that." },
  gardener: { name: 'Gardener Fern', line: "These flowers bloom every time you walk past. Coincidence? I think not." },
  kid: { name: 'Pip', line: 'Are you THE Maryam? My mom says you are "a lot". I think that means awesome.' },
}

// Optional hidden easter eggs (press E on them)
export const EASTER_EGGS = {
  treeSign: { title: 'Secret Sign', text: "Maryam's official overthinking headquarters." },
  tinyNpc: { title: 'Tiny Villager', text: 'I heard Maryam was coming. Everyone hide!' },
  bedroomButton: { title: 'Mysterious Button', text: 'Congratulations! You found absolutely nothing useful.' },
  cafeMug: { title: 'Forgotten Mug', text: "Coffee cannot fix everything. But it's worth trying." },
  parkSign: { title: 'Suspicious Sign', text: 'Main character energy detected.' },
  duck: { title: 'Rubber Duck', text: "Quack. (Translation: you're doing great, sweetie.)" },
  bench: { title: 'Lonely Bench', text: 'You sat down for 3 seconds. Personal record for rest without a phone.' },
}

// Locked house
export const SECRET_HOUSE = {
  lockedLine: (keys) => `It's locked tight. Secret House Keys: ${keys}/3. Maybe they're hidden around town…`,
  unlockLine: 'Click… clack… *CLUNK*! The Secret House is open!',
  enterPrompt: 'Enter the Secret House',
}

// Quests (shown in the tracker in order)
export const QUESTS = {
  explore: 'Explore the town',
  cafe: 'Visit the cafe',
  keys: 'Find three golden keys',
  unlock: 'Unlock the secret house',
  enter: 'Enter the secret house',
  gift: 'Open your gift',
  done: 'Live happily ever after',
}

// Achievement badges
export const ACHIEVEMENTS = {
  firstSteps: { name: 'First Steps', desc: 'Started your little life.', emoji: '👣' },
  explorer: { name: 'Town Explorer', desc: 'Discovered all five locations.', emoji: '🗺️' },
  caffeinated: { name: 'Caffeinated', desc: 'Ordered a drink at the cafe.', emoji: '☕' },
  connoisseur: { name: 'Drink Connoisseur', desc: 'Tried every drink on the menu.', emoji: '🧋' },
  heartCollector: { name: 'Full Heart', desc: 'Found all three hearts in the park.', emoji: '💖' },
  keyMaster: { name: 'Key Master', desc: 'Collected all three golden keys.', emoji: '🗝️' },
  fashionista: { name: 'Fashionista', desc: 'Changed your look at the shops.', emoji: '👗' },
  nosy: { name: 'Professionally Nosy', desc: 'Interacted with every bedroom object.', emoji: '🔍' },
  eggHunter: { name: 'Easter Egg Hunter', desc: 'Found 5 hidden secrets.', emoji: '🥚' },
  social: { name: 'Social Butterfly', desc: 'Talked to every townsperson.', emoji: '🦋' },
  theEnd: { name: 'Gift Opened', desc: 'Found the secret at the end of it all.', emoji: '🎁' },
}

// Customisation options
export const CUSTOMIZE = {
  hairColors: ['#5a3a2e', '#2b2030', '#c98b5a', '#e8c27a', '#d46a8c', '#9b7fd9', '#7ab8e0'],
  outfitColors: ['#f7a8c4', '#c8b6f2', '#a9d6f5', '#b5ead7', '#ffe7a0', '#ffffff', '#ffb98a'],
  hairAccessories: [
    { id: 'bow', label: 'Big Bow' },
    { id: 'flower', label: 'Flower Clip' },
    { id: 'clips', label: 'Star Clips' },
    { id: 'none', label: 'None' },
  ],
  hats: [
    { id: 'none', label: 'No Hat' },
    { id: 'beret', label: 'Beret' },
    { id: 'sunhat', label: 'Sun Hat' },
    { id: 'crown', label: 'Tiny Crown' },
    { id: 'cat', label: 'Cat Ears' },
  ],
  bags: [
    { id: 'none', label: 'No Bag' },
    { id: 'purse', label: 'Heart Purse' },
    { id: 'backpack', label: 'Bunny Backpack' },
    { id: 'tote', label: 'Tote Bag' },
  ],
  hairStyles: [
    { id: 'buns', label: 'Space Buns' },
    { id: 'long', label: 'Long & Wavy' },
    { id: 'ponytail', label: 'Ponytail' },
    { id: 'bob', label: 'Cute Bob' },
  ],
}

export const DEFAULT_LOOK = {
  hairColor: '#5a3a2e',
  outfitColor: '#f7a8c4',
  hairStyle: 'long',
  hairAccessory: 'bow',
  hat: 'none',
  bag: 'none',
  skin: '#f6d2bd',
}

// Final surprise
export const FINALE = {
  foundTitle: 'YOU FOUND THE SECRET!',
  openButton: 'OPEN YOUR GIFT',
  letterGreeting: `Dear ${FRIEND_NAME},`,
  letterParagraphs: [
    'Okay, jokes aside...',
    'I made this little world just for you.',
    'I wanted to create something different, something that would hopefully make you smile.',
    "You're genuinely a wonderful person, and I hope you never forget how special you are.",
    'Never stop being your funny, dramatic, slightly crazy self.',
    "You make ordinary moments a little more interesting, and I'm genuinely glad to have you in my life.",
    "You deserve your own little world. So here's one.",
    'Keep smiling, keep being yourself, and never lose that beautiful personality.',
    "And please, don't let this website make you think you're any less annoying. 😂❤️",
  ],
  theEnd: 'THE END... OR MAYBE JUST ANOTHER ADVENTURE.',
  playAgain: 'PLAY AGAIN',
}

export const MISC = {
  interactPrompt: 'Press E to interact',
  pauseTitle: 'Paused',
  pauseJoke: 'Life paused. If only it were this easy in real life.',
}
