// src/game.js
import { InputManager } from './Input.js';
import { TerrainManager } from './Terrain.js';
import { Worm } from './Worm.js';
import { Projectile } from './Projectile.js'; 
import { GameManager } from './GameManager.js';

// Inicializa o jogo assim que a árvore DOM do navegador estiver pronta
window.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine('gameCanvas');
    game.start();
});