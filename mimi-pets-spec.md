# Mimi Pets — Technical Specification

## Overview

A browser-based Tamagotchi-style pet game built with Phaser 3. Players care for a small cat-like creature called "Mimi" through three interactions: feeding, petting, and cleaning. The game uses a cute low-res pixel art style and is designed to be child-friendly with no punishment mechanics.

## Technology Stack

- **Framework**: Phaser 3 (loaded via CDN)
- **Language**: JavaScript (ES6 modules)
- **Build**: None required — plain HTML + JS files
- **Storage**: Browser LocalStorage for save data
- **Target**: Modern browsers, responsive to desktop and mobile

## Game Design

### Pet Stats

Three core stats, each ranging from 0–100:

| Stat | Starting Value | Decay Rate | Restored By |
|------|---------------|------------|-------------|
| Hunger | 80 | -2 per 10 seconds | Feed |
| Happiness | 80 | -1 per 10 seconds | Pet/Love |
| Cleanliness | 80 | -1 per 15 seconds | Clean |

### Sleep Mechanic (No Punishment)

When hunger reaches 0, Mimi falls asleep and all stat decay stops. Mimi remains asleep until fed. Display message: "Mimi is sleeping... feed them to wake up!"

### Life Stages

Mimi evolves based on cumulative play time (tracked only while game is open):

| Stage | Play Time Required | Sprite Size |
|-------|-------------------|-------------|
| Egg | 0–2 minutes | 32×32 |
| Kitten | 2–10 minutes | 48×48 |
| Adult | 10+ minutes | 64×64 |

Evolution triggers a brief celebration animation (sparkles/bounce).

## Interactions

### Feed
- Button opens a simple food selector (3 options)
- Each food restores different hunger amounts:
  - Kibble: +20 hunger
  - Fish: +35 hunger
  - Treat: +15 hunger, +10 happiness
- Play eating animation, then return to idle
- If Mimi is asleep, feeding wakes them up

### Pet/Love
- Player clicks directly on the Mimi sprite
- Hearts particle effect floats upward
- Each click: +5 happiness
- Brief happy animation (bounce/wiggle)
- Cooldown: 1 second between effective clicks (prevent spam)

### Clean
- Button triggers bathing sequence
- Simple animation: bubbles appear around Mimi, Mimi shakes off
- Restores cleanliness to 100
- Duration: ~2 seconds

## Visual Design

### Art Style
- Low-res pixel art (base canvas 400×600, scaled up with nearest-neighbor)
- Limited color palette (16–32 colors suggested, e.g., PICO-8 palette)
- Clean, rounded shapes suitable for children

### Required Sprites

**Mimi (for each life stage: egg, kitten, adult)**
- Idle animation (2–4 frames, looping)
- Happy animation (2–3 frames)
- Eating animation (3–4 frames)
- Sleeping animation (2 frames, looping)
- Cleaning/wet animation (2–3 frames)

**UI Elements**
- Three action buttons: Feed, Pet, Clean
- Food selection popup with three food icons
- Stat bars (hunger, happiness, cleanliness)
- Background scene (simple room or outdoor setting)

**Effects**
- Heart particles (for petting)
- Bubble particles (for cleaning)
- Sparkle particles (for evolution)
- Zzz floating text (for sleeping)

### Placeholder Art
For initial development, use colored rectangles and basic shapes:
- Mimi: Colored circle/square with different colors per state
- Buttons: Rectangles with text labels
- Stat bars: Simple filled rectangles

## Project Structure

```
mimi-pets/
├── index.html
├── js/
│   ├── main.js              # Phaser game config and entry point
│   ├── constants.js         # Config values (decay rates, etc.)
│   ├── scenes/
│   │   ├── BootScene.js     # Asset loading
│   │   ├── TitleScene.js    # Start screen with "New Game" / "Continue"
│   │   └── GameScene.js     # Main gameplay
│   └── components/
│       ├── Pet.js           # Pet sprite, animations, state rendering
│       ├── StatsManager.js  # Stat values, decay logic, save/load
│       └── UIManager.js     # Buttons, stat bars, popups
└── assets/
    ├── sprites/             # Pet and UI sprites
    ├── audio/               # Optional: sound effects
    └── fonts/               # Optional: pixel font
```

## Scene Specifications

### BootScene
- Load all assets (sprites, audio if any)
- Display simple loading bar
- Transition to TitleScene when complete

### TitleScene
- Display game title "Mimi Pets"
- Show Mimi sprite (idle animation)
- Two buttons:
  - "New Game" — clears save data, starts fresh
  - "Continue" — loads existing save (only shown if save exists)
- Transition to GameScene on button press

### GameScene

**Layout (portrait orientation, 400×600)**
```
┌─────────────────────────┐
│      Stat Bars          │  ← Top area
│  [Hunger] [Happy] [Clean]│
├─────────────────────────┤
│                         │
│                         │
│        Mimi Sprite      │  ← Center area (clickable for petting)
│                         │
│                         │
├─────────────────────────┤
│  [Feed]  [Pet]  [Clean] │  ← Bottom action buttons
└─────────────────────────┘
```

**Game Loop**
1. On scene start: Load saved stats or initialize defaults
2. Every 100ms: Update stat decay timers
3. Every 10 seconds: Apply stat decay (unless sleeping)
4. Check for sleep condition (hunger === 0)
5. Check for evolution (play time thresholds)
6. Render Mimi's state based on current stats and activity
7. On interaction: Play animation, update stats, save to LocalStorage

## Data Persistence

### Save Data Structure
```javascript
{
  version: 1,
  petName: "Mimi",
  stage: "kitten",        // "egg" | "kitten" | "adult"
  stats: {
    hunger: 75,
    happiness: 80,
    cleanliness: 60
  },
  totalPlayTimeMs: 480000, // Milliseconds of total play time
  isSleeping: false,
  lastSaved: "2025-01-06T12:00:00Z"
}
```

### Save Triggers
- After any interaction (feed, pet, clean)
- Every 30 seconds during gameplay
- On page visibility change (when user switches tabs)
- On window beforeunload event

## Configuration Constants

```javascript
export const CONFIG = {
  STAT_MAX: 100,
  STAT_MIN: 0,
  
  DECAY_INTERVAL_MS: 10000, // 10 seconds
  
  DECAY_RATES: {
    hunger: 2,
    happiness: 1,
    cleanliness: 1
  },
  
  FOOD_VALUES: {
    kibble: { hunger: 20 },
    fish: { hunger: 35 },
    treat: { hunger: 15, happiness: 10 }
  },
  
  PET_CLICK_VALUE: 5,
  PET_CLICK_COOLDOWN_MS: 1000,
  
  EVOLUTION_THRESHOLDS_MS: {
    kitten: 2 * 60 * 1000,   // 2 minutes
    adult: 10 * 60 * 1000    // 10 minutes
  },
  
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600
};
```

## Mimi State Machine

Mimi displays different animations based on current state:

```
States:
  IDLE       → Default state, plays idle animation
  EATING     → Triggered by feed, plays eat animation, returns to IDLE
  HAPPY      → Triggered by petting, plays happy animation, returns to IDLE
  CLEANING   → Triggered by clean, plays clean animation, returns to IDLE
  SLEEPING   → Entered when hunger=0, plays sleep animation, exits on feed

Transitions:
  IDLE → EATING (on feed action)
  IDLE → HAPPY (on pet click)
  IDLE → CLEANING (on clean action)
  IDLE → SLEEPING (when hunger reaches 0)
  EATING → IDLE (when animation completes)
  HAPPY → IDLE (when animation completes)
  CLEANING → IDLE (when animation completes)
  SLEEPING → EATING (on feed action, then to IDLE)
```

## Implementation Notes

### Phaser Configuration
```javascript
const config = {
  type: Phaser.AUTO,
  width: CONFIG.CANVAS_WIDTH,
  height: CONFIG.CANVAS_HEIGHT,
  parent: 'game-container',
  pixelArt: true,  // Ensures crisp pixel scaling
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, TitleScene, GameScene]
};
```

### Responsive Scaling
- Use Phaser's scale manager to fit the game in the viewport
- Maintain aspect ratio (2:3 portrait)
- Enable touch input for mobile

### Accessibility Considerations
- Buttons should be large enough for touch (minimum 44×44 pixels)
- Include text labels on buttons, not just icons
- Ensure sufficient color contrast for stat bars

## Deployment

To publish to your web domain:
1. Upload all files maintaining the folder structure
2. Ensure your web server serves `index.html` as the default
3. No build step required — files run directly in the browser

## Future Expansion (Not in Initial Build)

These features are intentionally excluded from v1 but designed to be easy to add:

- Mini-games (new scenes, rewards affect stats)
- Additional food types (extend FOOD_VALUES)
- Pet customization (accessories, colors)
- Sound effects and music
- Multiple save slots / multiple pets

---

## Deliverables for Initial Build

1. Working Phaser 3 project (plain HTML + JS, no build tools)
2. Three functional scenes (Boot, Title, Game)
3. Placeholder graphics for all elements
4. Three working interactions (Feed, Pet, Clean)
5. Stat decay system with sleep mechanic
6. Life stage evolution (egg → kitten → adult)
7. LocalStorage save/load functionality
8. Responsive scaling for desktop and mobile
