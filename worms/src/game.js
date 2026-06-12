// src/game.js
import { GameEngine } from './Engine.js';

// Inicializa o jogo assim que a árvore DOM do navegador estiver pronta
window.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine('gameCanvas');
    game.start();
});