// src/Engine.js
import { InputManager } from './Input.js';
import { TerrainManager } from './Terrain.js';
import { Worm } from './Worm.js';
import { Projectile } from './Projectile.js'; 
import { GameManager } from './GameManager.js'; 

export class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.input = new InputManager();
        this.terrain = new TerrainManager(this.canvas.width, this.canvas.height);
        this.projectiles = []; 

        this.worms = [
            new Worm(200, 50, '#ff477e', true), 
            new Worm(600, 50, '#70e000', false)
        ];

        this.gameManager = new GameManager(this.worms);

        this.initEvents();
    }

    initEvents() {
        // Correção de QA: Garante que o clique no cenário use o método correto do TerrainManager
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.terrain.destroyCircle(x, y, 40);
        });
    }

    start() {
        const loop = () => {
            this.update();
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update() {
        this.gameManager.update(this.projectiles);

        for (let worm of this.worms) {
            worm.update(this.terrain, this.input);
        }

        // Sistema de tiro corrigido para checar o estado 'PLAYING'
        if (this.input.isPressed(' ') && this.projectiles.length === 0 && this.gameManager.state === 'PLAYING') {
            let minhocaAtiva = this.worms.find(w => w.isControlled);
            
            if (minhocaAtiva) {
                let direcaoTiro = minhocaAtiva.vx >= 0 ? 4 : -4;
                this.projectiles.push(new Projectile(minhocaAtiva.x, minhocaAtiva.y - 12, direcaoTiro, -5));
                this.gameManager.triggerWeaponFired(); 
            }
        }

        for (let projectile of this.projectiles) {
            projectile.update(this.terrain, this.worms);
        }
        this.projectiles = this.projectiles.filter(p => p.isActive);
    }

    render() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.terrain.draw(this.ctx);
        
        for (let projectile of this.projectiles) {
            projectile.draw(this.ctx);
        }
        
        for (let worm of this.worms) {
            worm.draw(this.ctx);
        }

        this.gameManager.drawUI(this.ctx);
    }
}