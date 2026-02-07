import { StatsManager } from '../components/StatsManager.js';
import { CONFIG } from '../constants.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(0, 0, width, height, 0xF0E6D2).setOrigin(0, 0);

    // Title
    this.add.text(width / 2, 100, 'MIMI PETS', {
      fontSize: '56px',
      fontFamily: CONFIG.FONT_FAMILY,
      color: '#FF69B4',
      fontStyle: '700'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 150, 'A Virtual Pet Game', {
      fontSize: '24px',
      fontFamily: CONFIG.FONT_FAMILY,
      color: '#666'
    }).setOrigin(0.5);

    // Decorative pet preview (placeholder circle)
    const previewPet = this.add.circle(width / 2, 280, 32, 0xFFB6C1);

    // Idle animation for preview
    this.tweens.add({
      targets: previewPet,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Buttons
    const buttonY = 400;
    const buttonWidth = 180;
    const buttonHeight = 50;

    // New Game button
    this.createButton(
      width / 2,
      buttonY,
      buttonWidth,
      buttonHeight,
      'New Game',
      () => this.startNewGame()
    );

    // Continue button (only if save exists)
    if (StatsManager.hasSaveData()) {
      this.createButton(
        width / 2,
        buttonY + 70,
        buttonWidth,
        buttonHeight,
        'Continue',
        () => this.continueGame(),
        0x6BCF7F
      );
    }

    // Footer text
    this.add.text(width / 2, height - 30, 'Made with Phaser 3', {
      fontSize: '13px',
      fontFamily: CONFIG.FONT_FAMILY,
      color: '#999'
    }).setOrigin(0.5);
  }

  createButton(x, y, width, height, label, callback, color = 0x4ECDC4) {
    const bg = this.add.rectangle(x, y, width, height, color)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', callback)
      .on('pointerover', function() {
        this.setScale(1.05);
      })
      .on('pointerout', function() {
        this.setScale(1);
      });

    const text = this.add.text(x, y, label, {
      fontSize: '22px',
      fontFamily: CONFIG.FONT_FAMILY,
      color: '#FFF',
      fontStyle: '600'
    }).setOrigin(0.5);

    return { bg, text };
  }

  startNewGame() {
    // Clear any existing save
    localStorage.removeItem('mimi-pets-save');
    this.scene.start('GameScene', { isNewGame: true });
  }

  continueGame() {
    this.scene.start('GameScene', { isNewGame: false });
  }
}
