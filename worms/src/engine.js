import { InputManager } from './Input.js';
import { TerrainManager } from './Terrain.js';
import { Worm } from './Worm.js';
import { Projectile } from './Projectile.js'; 
import { GameManager } from './GameManager.js'; // <-- ADICIONE ESTA LINHA

export class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Inicialização dos gerenciadores da Engine
        this.input = new InputManager();
        this.terrain = new TerrainManager(this.canvas.width, this.canvas.height);
        
        // LISTA DE PROJÉTEIS: Array dinâmico que gerencia as balas ativas na tela
        this.projectiles = []; 

        // Criação das entidades iniciais do mapa (Minhoca Rosa controlada por padrão)
        this.worms = [
            new Worm(200, 50, '#ff477e', true), 
            new Worm(600, 50, '#70e000', false)
        ];

        this.initEvents();
    }

    initEvents() {
        // Evento de clique para escavar o cenário manualmente (Mecânica de testes de QA)
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.terrain.destroyCircle(x, y, 40);
        });
    }

    start() {
        // Core Game Loop rodando a 60 FPS estáveis via hardware
        const loop = () => {
            this.update();
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update() {
        // A) Atualiza as físicas e movimentos de todas as Minhocas
        for (let worm of this.worms) {
            worm.update(this.terrain, this.input);
        }

        // B) MÓDULO DE DISPARO: Se o jogador apertar ESPAÇO e não houver balas na tela
        if (this.input.isPressed(' ') && this.projectiles.length === 0) {
            let minhocaAtiva = this.worms.find(w => w.isControlled);
            
            if (minhocaAtiva) {
                // QA Boundary Check: Identifica para onde a minhoca olha para disparar no vetor correto
                let direcaoTiro = minhocaAtiva.vx >= 0 ? 4 : -4;
                
                // Instancia o projétil saindo um pouco acima da cabeça da minhoca (Y - 12)
                // Parâmetros: (X inicial, Y inicial, Força Horizontal X, Força Vertical Y)
                this.projectiles.push(new Projectile(minhocaAtiva.x, minhocaAtiva.y - 12, direcaoTiro, -5));
            }
        }

        // C) GESTÃO DE MEMÓRIA (Garbage Collection Manual): 
        // Atualiza os projéteis e remove do array os que explodiram para não gerar vazamento de memória
        for (let projectile of this.projectiles) {
            projectile.update(this.terrain, this.worms);
        }
        this.projectiles = this.projectiles.filter(p => p.isActive);
    }

    render() {
        // 1. Renderiza o Fundo (Céu limpo)
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 2. Renderiza a camada do Terreno (Bitmaps e Crateras)
        this.terrain.draw(this.ctx);
        
        // 3. Renderiza os Projéteis ativos cortando o céu
        for (let projectile of this.projectiles) {
            projectile.draw(this.ctx);
        }
        
        // 4. Renderiza os Personagens (Minhocas) por cima de tudo
        for (let worm of this.worms) {
            worm.draw(this.ctx);
        }
    }
}