import { CONFIG } from './constants.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  width: CONFIG.CANVAS_WIDTH,
  height: CONFIG.CANVAS_HEIGHT,
  parent: 'game-container',
  pixelArt: false,
  antialias: true,
  backgroundColor: '#f0e6d2',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, TitleScene, GameScene]
};

const game = new Phaser.Game(config);

// Handle page visibility for auto-save
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    const gameScene = game.scene.getScene('GameScene');
    if (gameScene && gameScene.scene.isActive()) {
      gameScene.saveGame();
    }
  }
});

// Handle before unload
window.addEventListener('beforeunload', () => {
  const gameScene = game.scene.getScene('GameScene');
  if (gameScene && gameScene.scene.isActive()) {
    gameScene.saveGame();
  }
});
