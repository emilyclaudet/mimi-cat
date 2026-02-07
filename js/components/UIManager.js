import { CONFIG } from '../constants.js';

export class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.foodPopupVisible = false;

    this.createStatBars();
    this.createActionButtons();
    this.createFoodPopup();
    this.createSleepMessage();

    // Listen to stats updates
    this.scene.events.on('stats-updated', this.updateStatBars, this);
    this.scene.events.on('sleep-state-changed', this.updateSleepMessage, this);
  }

  createStatBars() {
    const barWidth = 110;
    const barHeight = 16;
    const startX = 30;
    const startY = 30;
    const spacing = 125;

    const stats = ['hunger', 'happiness', 'cleanliness'];
    const labels = ['Hunger', 'Happy', 'Clean'];
    const colors = [0xFF6B6B, 0xFFD93D, 0x6BCF7F];

    this.statBars = {};

    stats.forEach((stat, index) => {
      const x = startX + (index * spacing);

      // Label
      this.scene.add.text(x, startY - 15, labels[index], {
        fontSize: '14px',
        fontFamily: CONFIG.FONT_FAMILY,
        color: '#333'
      });

      // Background bar
      const bg = this.scene.add.rectangle(x, startY, barWidth, barHeight, 0xCCCCCC)
        .setOrigin(0, 0);

      // Filled bar
      const fill = this.scene.add.rectangle(x, startY, barWidth, barHeight, colors[index])
        .setOrigin(0, 0);

      this.statBars[stat] = { fill, bg, maxWidth: barWidth };
    });
  }

  updateStatBars(stats) {
    Object.keys(stats).forEach(stat => {
      if (this.statBars[stat]) {
        const percentage = stats[stat] / CONFIG.STAT_MAX;
        const newWidth = this.statBars[stat].maxWidth * percentage;
        this.statBars[stat].fill.width = newWidth;
      }
    });
  }

  createActionButtons() {
    const buttonWidth = 100;
    const buttonHeight = 40;
    const buttonY = 540;
    const gap = 15; // Gap between buttons

    // Calculate centered positions
    const totalWidth = (buttonWidth * 3) + (gap * 2);
    const startX = (CONFIG.CANVAS_WIDTH - totalWidth) / 2;

    const buttons = [
      { label: 'Feed', action: () => this.toggleFoodPopup() },
      { label: 'Pet', action: () => this.scene.events.emit('pet-button-clicked') },
      { label: 'Clean', action: () => this.scene.events.emit('clean-button-clicked') }
    ];

    this.buttons = buttons.map((btn, index) => {
      const x = startX + buttonWidth / 2 + (index * (buttonWidth + gap));

      // Button background (centered)
      const bg = this.scene.add.rectangle(x, buttonY, buttonWidth, buttonHeight, 0x4ECDC4)
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', btn.action)
        .on('pointerover', function() { this.setFillStyle(0x45B7AF); })
        .on('pointerout', function() { this.setFillStyle(0x4ECDC4); });

      // Button text
      const text = this.scene.add.text(
        x,
        buttonY,
        btn.label,
        {
          fontSize: '18px',
          fontFamily: CONFIG.FONT_FAMILY,
          color: '#FFF',
          fontStyle: '600'
        }
      ).setOrigin(0.5);

      return { bg, text };
    });
  }

  createFoodPopup() {
    const popupWidth = 300;
    const popupHeight = 200;
    const centerX = CONFIG.CANVAS_WIDTH / 2;
    const centerY = CONFIG.CANVAS_HEIGHT / 2;

    // Dark overlay
    this.foodPopupOverlay = this.scene.add.rectangle(
      0, 0,
      CONFIG.CANVAS_WIDTH,
      CONFIG.CANVAS_HEIGHT,
      0x000000,
      0.7
    ).setOrigin(0, 0).setVisible(false).setInteractive();

    // Popup background
    this.foodPopupBg = this.scene.add.rectangle(
      centerX, centerY,
      popupWidth, popupHeight,
      0xFFFFFF
    ).setVisible(false);

    // Title
    this.foodPopupTitle = this.scene.add.text(
      centerX, centerY - 70,
      'Choose Food',
      {
        fontSize: '24px',
        fontFamily: CONFIG.FONT_FAMILY,
        color: '#333',
        fontStyle: '600'
      }
    ).setOrigin(0.5).setVisible(false);

    // Food options
    const foods = [
      { type: 'kibble', label: 'Kibble\n+20 hunger', color: 0x8B4513 },
      { type: 'fish', label: 'Fish\n+35 hunger', color: 0xFF6347 },
      { type: 'treat', label: 'Treat\n+15 hunger\n+10 happy', color: 0xFFB6C1 }
    ];

    this.foodButtons = foods.map((food, index) => {
      const x = centerX - 80 + (index * 80);
      const y = centerY;

      // Food button
      const bg = this.scene.add.rectangle(x, y, 60, 60, food.color)
        .setVisible(false)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.selectFood(food.type))
        .on('pointerover', function() { this.setScale(1.1); })
        .on('pointerout', function() { this.setScale(1); });

      // Label
      const text = this.scene.add.text(x, y + 50, food.label, {
        fontSize: '12px',
        fontFamily: CONFIG.FONT_FAMILY,
        color: '#333',
        align: 'center'
      }).setOrigin(0.5).setVisible(false);

      return { bg, text };
    });

    // Close button
    this.closeButton = this.scene.add.text(
      centerX, centerY + 70,
      'Close',
      {
        fontSize: '16px',
        fontFamily: CONFIG.FONT_FAMILY,
        color: '#FF6B6B',
        fontStyle: '600'
      }
    ).setOrigin(0.5)
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleFoodPopup());
  }

  toggleFoodPopup() {
    this.foodPopupVisible = !this.foodPopupVisible;

    this.foodPopupOverlay.setVisible(this.foodPopupVisible);
    this.foodPopupBg.setVisible(this.foodPopupVisible);
    this.foodPopupTitle.setVisible(this.foodPopupVisible);
    this.closeButton.setVisible(this.foodPopupVisible);

    this.foodButtons.forEach(btn => {
      btn.bg.setVisible(this.foodPopupVisible);
      btn.text.setVisible(this.foodPopupVisible);
    });
  }

  selectFood(foodType) {
    this.scene.events.emit('food-selected', foodType);
    this.toggleFoodPopup();
  }

  createSleepMessage() {
    this.sleepMessage = this.scene.add.text(
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 + 80,
      'Mimi is sleeping...\nfeed them to wake up!',
      {
        fontSize: '18px',
        fontFamily: CONFIG.FONT_FAMILY,
        color: '#9370DB',
        align: 'center',
        fontStyle: '600'
      }
    ).setOrigin(0.5).setVisible(false);
  }

  updateSleepMessage(isSleeping) {
    this.sleepMessage.setVisible(isSleeping);
  }

  destroy() {
    this.scene.events.off('stats-updated', this.updateStatBars, this);
    this.scene.events.off('sleep-state-changed', this.updateSleepMessage, this);
  }
}
