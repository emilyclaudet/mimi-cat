import { CONFIG } from '../constants.js';

export class StatsManager {
  constructor(scene) {
    this.scene = scene;
    this.stats = { ...CONFIG.DEFAULT_STATS };
    this.stage = CONFIG.LIFE_STAGES.EGG;
    this.totalPlayTimeMs = 0;
    this.isSleeping = false;
    this.lastDecayTime = 0;
    this.lastCleanlinessDecayTime = 0;

    // Load from storage if exists
    this.load();
  }

  update(time, delta) {
    if (this.isSleeping) return;

    this.totalPlayTimeMs += delta;

    // Hunger and happiness decay every 10s
    if (time - this.lastDecayTime >= CONFIG.DECAY_INTERVAL_MS) {
      this.applyDecay('hunger', CONFIG.DECAY_RATES.hunger);
      this.applyDecay('happiness', CONFIG.DECAY_RATES.happiness);
      this.lastDecayTime = time;
    }

    // Cleanliness decays every 15s
    if (time - this.lastCleanlinessDecayTime >= CONFIG.CLEANLINESS_DECAY_INTERVAL_MS) {
      this.applyDecay('cleanliness', CONFIG.DECAY_RATES.cleanliness);
      this.lastCleanlinessDecayTime = time;
    }

    // Check sleep condition
    if (this.stats.hunger <= 0 && !this.isSleeping) {
      this.enterSleep();
    }

    // Check evolution
    this.checkEvolution();
  }

  applyDecay(stat, amount) {
    this.stats[stat] = Math.max(CONFIG.STAT_MIN, this.stats[stat] - amount);
    this.scene.events.emit('stats-updated', this.stats);
  }

  feed(foodType) {
    const food = CONFIG.FOOD_VALUES[foodType];

    if (this.isSleeping) {
      this.exitSleep();
    }

    this.stats.hunger = Math.min(CONFIG.STAT_MAX, this.stats.hunger + food.hunger);
    if (food.happiness) {
      this.stats.happiness = Math.min(CONFIG.STAT_MAX, this.stats.happiness + food.happiness);
    }

    this.scene.events.emit('stats-updated', this.stats);
    this.save();
  }

  pet() {
    this.stats.happiness = Math.min(CONFIG.STAT_MAX, this.stats.happiness + CONFIG.PET_CLICK_VALUE);
    this.scene.events.emit('stats-updated', this.stats);
    this.save();
  }

  clean() {
    this.stats.cleanliness = CONFIG.STAT_MAX;
    this.scene.events.emit('stats-updated', this.stats);
    this.save();
  }

  enterSleep() {
    this.isSleeping = true;
    this.stats.hunger = 0;
    this.scene.events.emit('sleep-state-changed', true);
  }

  exitSleep() {
    this.isSleeping = false;
    this.scene.events.emit('sleep-state-changed', false);
  }

  checkEvolution() {
    let newStage = this.stage;

    if (this.totalPlayTimeMs >= CONFIG.EVOLUTION_THRESHOLDS_MS.adult) {
      newStage = CONFIG.LIFE_STAGES.ADULT;
    } else if (this.totalPlayTimeMs >= CONFIG.EVOLUTION_THRESHOLDS_MS.kitten) {
      newStage = CONFIG.LIFE_STAGES.KITTEN;
    }

    if (newStage !== this.stage) {
      this.stage = newStage;
      this.scene.events.emit('evolution-triggered', newStage);
      this.save();
    }
  }

  save() {
    const saveData = {
      version: 1,
      petName: "Mimi",
      stage: this.stage,
      stats: { ...this.stats },
      totalPlayTimeMs: this.totalPlayTimeMs,
      isSleeping: this.isSleeping,
      lastSaved: new Date().toISOString()
    };

    try {
      localStorage.setItem('mimi-pets-save', JSON.stringify(saveData));
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  }

  load() {
    const saved = localStorage.getItem('mimi-pets-save');
    if (!saved) return false;

    try {
      const data = JSON.parse(saved);
      this.stats = data.stats;
      this.stage = data.stage;
      this.totalPlayTimeMs = data.totalPlayTimeMs;
      this.isSleeping = data.isSleeping;
      return true;
    } catch (e) {
      console.error('Failed to load save data:', e);
      return false;
    }
  }

  reset() {
    localStorage.removeItem('mimi-pets-save');
    this.stats = { ...CONFIG.DEFAULT_STATS };
    this.stage = CONFIG.LIFE_STAGES.EGG;
    this.totalPlayTimeMs = 0;
    this.isSleeping = false;
  }

  static hasSaveData() {
    return localStorage.getItem('mimi-pets-save') !== null;
  }
}
