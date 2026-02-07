import { CONFIG } from '../constants.js';
import { StatsManager } from '../components/StatsManager.js';
import { Pet } from '../components/Pet.js';
import { UIManager } from '../components/UIManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.isNewGame = data.isNewGame !== undefined ? data.isNewGame : true;
  }

  create() {
    // Background
    this.add.rectangle(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, 0xF0E6D2)
      .setOrigin(0, 0);

    // Initialize managers
    this.statsManager = new StatsManager(this);

    if (this.isNewGame) {
      this.statsManager.reset();
    }

    // Create pet sprite
    this.pet = new Pet(this, CONFIG.CANVAS_WIDTH / 2, 300);

    // Initialize pet to current stage and state
    this.pet.currentStage = this.statsManager.stage;
    this.pet.updateSize();

    if (this.statsManager.isSleeping) {
      this.pet.setState(CONFIG.PET_STATES.SLEEPING);
      this.pet.showZzz();
    }

    // Create UI
    this.uiManager = new UIManager(this);

    // Update UI to current stats
    this.uiManager.updateStatBars(this.statsManager.stats);
    this.uiManager.updateSleepMessage(this.statsManager.isSleeping);

    // Set up event listeners
    this.events.on('pet-clicked', () => {
      this.statsManager.pet();
    });

    this.events.on('pet-button-clicked', () => {
      // Pet button does same as clicking sprite
      this.pet.onPetClick();
    });

    this.events.on('clean-button-clicked', () => {
      if (this.statsManager.isSleeping) return;

      this.statsManager.clean();
      this.pet.playCleaningAnimation();
    });

    this.events.on('food-selected', (foodType) => {
      const wasSleeping = this.statsManager.isSleeping;

      this.statsManager.feed(foodType);
      this.pet.playEatingAnimation();

      // If waking from sleep, the pet will auto-transition to eating state
    });

    this.events.on('sleep-state-changed', (isSleeping) => {
      if (isSleeping) {
        this.pet.showZzz();
      }
    });

    // Auto-save timer
    this.autoSaveTimer = this.time.addEvent({
      delay: CONFIG.SAVE_INTERVAL_MS,
      callback: () => this.saveGame(),
      loop: true
    });

    // Debug display
    this.debugText = this.add.text(10, 60, '', {
      fontSize: '11px',
      fontFamily: CONFIG.FONT_FAMILY,
      color: '#666'
    });
  }

  update(time, delta) {
    // Update stats manager (handles decay and evolution)
    this.statsManager.update(time, delta);

    // Update debug text
    this.debugText.setText([
      `Play Time: ${Math.floor(this.statsManager.totalPlayTimeMs / 1000)}s`,
      `Stage: ${this.statsManager.stage}`,
      `Sleeping: ${this.statsManager.isSleeping}`,
      `H:${Math.floor(this.statsManager.stats.hunger)} ` +
      `Ha:${Math.floor(this.statsManager.stats.happiness)} ` +
      `C:${Math.floor(this.statsManager.stats.cleanliness)}`
    ]);
  }

  saveGame() {
    this.statsManager.save();
    console.log('Game auto-saved');
  }

  shutdown() {
    // Clean up
    this.saveGame();
    if (this.autoSaveTimer) {
      this.autoSaveTimer.remove();
    }
    if (this.pet) {
      this.pet.destroy();
    }
    if (this.uiManager) {
      this.uiManager.destroy();
    }
    this.events.removeAllListeners();
  }
}
