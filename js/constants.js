export const CONFIG = {
  STAT_MAX: 100,
  STAT_MIN: 0,

  DECAY_INTERVAL_MS: 10000, // 10 seconds
  CLEANLINESS_DECAY_INTERVAL_MS: 15000, // 15 seconds (different from hunger/happiness)

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
  CANVAS_HEIGHT: 600,

  SAVE_INTERVAL_MS: 30000, // Auto-save every 30 seconds

  // Pet states
  PET_STATES: {
    IDLE: 'idle',
    EATING: 'eating',
    HAPPY: 'happy',
    CLEANING: 'cleaning',
    SLEEPING: 'sleeping'
  },

  // Life stages
  LIFE_STAGES: {
    EGG: 'egg',
    KITTEN: 'kitten',
    ADULT: 'adult'
  },

  // Starting stats
  DEFAULT_STATS: {
    hunger: 80,
    happiness: 80,
    cleanliness: 80
  },

  // Font configuration
  FONT_FAMILY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
};
