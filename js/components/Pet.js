import { CONFIG } from '../constants.js';

export class Pet {
  constructor(scene, x, y) {
    this.scene = scene;
    this.currentState = CONFIG.PET_STATES.IDLE;
    this.currentStage = CONFIG.LIFE_STAGES.EGG;
    this.lastPetTime = 0;

    // Create placeholder sprite (colored circle)
    this.sprite = scene.add.circle(x, y, 16, 0xFFB6C1); // Pink circle
    this.sprite.setInteractive({ useHandCursor: true });

    // Size text for debugging
    this.stageText = scene.add.text(x, y + 30, this.currentStage, {
      fontSize: '13px',
      fontFamily: CONFIG.FONT_FAMILY,
      color: '#000'
    }).setOrigin(0.5);

    // State text for debugging
    this.stateText = scene.add.text(x, y + 45, this.currentState, {
      fontSize: '11px',
      fontFamily: CONFIG.FONT_FAMILY,
      color: '#666'
    }).setOrigin(0.5);

    // Handle clicking sprite for petting
    this.sprite.on('pointerdown', () => this.onPetClick());

    // Listen to StatsManager events
    this.scene.events.on('sleep-state-changed', this.handleSleepChange, this);
    this.scene.events.on('evolution-triggered', this.handleEvolution, this);
  }

  onPetClick() {
    const now = Date.now();

    // Cooldown check
    if (now - this.lastPetTime < CONFIG.PET_CLICK_COOLDOWN_MS) {
      return;
    }

    // Can't pet while sleeping
    if (this.currentState === CONFIG.PET_STATES.SLEEPING) {
      return;
    }

    this.lastPetTime = now;
    this.scene.events.emit('pet-clicked');
    this.setState(CONFIG.PET_STATES.HAPPY);

    // Show heart particle effect
    this.showHearts();

    // Return to idle after animation
    this.scene.time.delayedCall(800, () => {
      if (this.currentState === CONFIG.PET_STATES.HAPPY) {
        this.setState(CONFIG.PET_STATES.IDLE);
      }
    });
  }

  setState(newState) {
    this.currentState = newState;
    this.updateVisuals();
  }

  handleSleepChange(isSleeping) {
    if (isSleeping) {
      this.setState(CONFIG.PET_STATES.SLEEPING);
    } else {
      this.setState(CONFIG.PET_STATES.IDLE);
    }
  }

  handleEvolution(newStage) {
    this.currentStage = newStage;
    this.updateSize();
    this.showSparkles();
  }

  updateVisuals() {
    // Update color based on state (placeholder behavior)
    const colors = {
      [CONFIG.PET_STATES.IDLE]: 0xFFB6C1,      // Pink
      [CONFIG.PET_STATES.EATING]: 0xFFD700,    // Gold
      [CONFIG.PET_STATES.HAPPY]: 0xFF69B4,     // Hot pink
      [CONFIG.PET_STATES.CLEANING]: 0x87CEEB,  // Sky blue
      [CONFIG.PET_STATES.SLEEPING]: 0x9370DB   // Medium purple
    };

    this.sprite.setFillStyle(colors[this.currentState] || 0xFFB6C1);
    this.stateText.setText(this.currentState);
  }

  updateSize() {
    const sizes = {
      [CONFIG.LIFE_STAGES.EGG]: 16,
      [CONFIG.LIFE_STAGES.KITTEN]: 24,
      [CONFIG.LIFE_STAGES.ADULT]: 32
    };

    this.sprite.setRadius(sizes[this.currentStage]);
    this.stageText.setText(this.currentStage);
  }

  showHearts() {
    // Create simple heart particle (placeholder: small pink circles)
    for (let i = 0; i < 3; i++) {
      const heart = this.scene.add.circle(
        this.sprite.x + (Math.random() - 0.5) * 20,
        this.sprite.y,
        4,
        0xFF1493
      );

      this.scene.tweens.add({
        targets: heart,
        y: heart.y - 50,
        alpha: 0,
        duration: 1000,
        ease: 'Cubic.easeOut',
        onComplete: () => heart.destroy()
      });
    }
  }

  showSparkles() {
    // Evolution sparkle effect (placeholder: yellow circles)
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const sparkle = this.scene.add.circle(
        this.sprite.x,
        this.sprite.y,
        6,
        0xFFFF00
      );

      this.scene.tweens.add({
        targets: sparkle,
        x: sparkle.x + Math.cos(angle) * 40,
        y: sparkle.y + Math.sin(angle) * 40,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => sparkle.destroy()
      });
    }

    // Bounce animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
  }

  playEatingAnimation() {
    this.setState(CONFIG.PET_STATES.EATING);

    // Simple eating animation (bob up and down)
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 5,
      duration: 200,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.setState(CONFIG.PET_STATES.IDLE);
      }
    });
  }

  playCleaningAnimation() {
    this.setState(CONFIG.PET_STATES.CLEANING);

    // Show bubbles
    this.showBubbles();

    // Shake animation
    const originalX = this.sprite.x;
    this.scene.tweens.add({
      targets: this.sprite,
      x: originalX - 3,
      duration: 50,
      yoyo: true,
      repeat: 20,
      onComplete: () => {
        this.sprite.x = originalX; // Reset to original position
        this.setState(CONFIG.PET_STATES.IDLE);
      }
    });
  }

  showBubbles() {
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        const bubble = this.scene.add.circle(
          this.sprite.x + (Math.random() - 0.5) * 30,
          this.sprite.y + 20,
          8,
          0xADD8E6,
          0.6
        );

        this.scene.tweens.add({
          targets: bubble,
          y: bubble.y - 60,
          alpha: 0,
          duration: 1500,
          ease: 'Sine.easeOut',
          onComplete: () => bubble.destroy()
        });
      });
    }
  }

  showZzz() {
    // Show Zzz when sleeping
    const zzz = this.scene.add.text(
      this.sprite.x + 25,
      this.sprite.y - 25,
      'Zzz',
      {
        fontSize: '24px',
        fontFamily: CONFIG.FONT_FAMILY,
        color: '#666'
      }
    );

    this.scene.tweens.add({
      targets: zzz,
      y: zzz.y - 20,
      alpha: 0,
      duration: 2000,
      ease: 'Linear',
      onComplete: () => {
        zzz.destroy();
        // Loop if still sleeping
        if (this.currentState === CONFIG.PET_STATES.SLEEPING) {
          this.scene.time.delayedCall(1000, () => this.showZzz());
        }
      }
    });
  }

  destroy() {
    this.sprite.destroy();
    this.stageText.destroy();
    this.stateText.destroy();
    this.scene.events.off('sleep-state-changed', this.handleSleepChange, this);
    this.scene.events.off('evolution-triggered', this.handleEvolution, this);
  }
}
