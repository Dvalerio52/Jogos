// src/GameManager.js
export class GameManager {
    constructor(worms) {
        this.worms = worms;
        this.currentWormIndex = 0;
        this.turnDuration = 45; // 45 segundos por turno
        this.timeLeft = this.turnDuration;
        this.lastTimeCheck = Date.now();
        this.state = 'PLAYING'; // Estados possíveis: 'PLAYING', 'WAITING_EXPLOSION', 'SWITCHING_TURN'
        
        this.setupInitialTurn();
    }

    setupInitialTurn() {
        // Garante que apenas a primeira minhoca comece com o controle ativado
        this.worms.forEach((worm, index) => {
            worm.isControlled = (index === this.currentWormIndex);
        });
    }

    update(projectiles) {
        // MÁQUINA DE ESTADOS (QA/Dev Lifecycle)
        switch (this.state) {
            case 'PLAYING':
                this.updateTimer();
                break;
                
            case 'WAITING_EXPLOSION':
                // Se o jogador atirou, esperamos todos os projéteis sumirem da tela para passar o turno
                if (projectiles.length === 0) {
                    this.state = 'SWITCHING_TURN';
                }
                break;
                
            case 'SWITCHING_TURN':
                this.switchTurn();
                break;
        }
    }

    updateTimer() {
        let agora = Date.now();
        // A cada 1000 milissegundos (1 segundo), decrementa o tempo
        if (agora - this.lastTimeCheck >= 1000) {
            this.timeLeft--;
            this.lastTimeCheck = agora;

            // CASO DE TESTE (QA Boundary): Se o tempo zerar, força a perda do turno
            if (this.timeLeft <= 0) {
                this.forceEndTurn();
            }
        }
    }

    forceEndTurn() {
        // Remove o controle de todas as minhocas imediatamente para travar os inputs
        this.worms.forEach(w => w.isControlled = false);
        this.state = 'SWITCHING_TURN';
    }

    triggerWeaponFired() {
        // Bloqueia novos comandos do jogador atual e entra em modo de espera física
        this.worms.forEach(w => w.isControlled = false);
        this.state = 'WAITING_EXPLOSION';
    }

    switchTurn() {
        // Alterna o índice do jogador (0 vira 1, 1 vira 0)
        this.currentWormIndex = (this.currentWormIndex + 1) % this.worms.length;
        
        // Passa o controle apenas para a nova minhoca ativa
        this.worms.forEach((worm, index) => {
            worm.isControlled = (index === this.currentWormIndex);
            if (worm.isControlled) {
                worm.vx = 0; // Limpa qualquer força residual de movimento
            }
        });

        // Reseta o cronômetro para o novo jogador
        this.timeLeft = this.turnDuration;
        this.lastTimeCheck = Date.now();
        this.state = 'PLAYING';
    }

    drawUI(ctx) {
        // Renderiza o HUD (Interface) direto no Canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 10, 190, 65);

        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`JOGADOR ATUAL: ${this.currentWormIndex + 1}`, 20, 30);
        
        // Se o tempo estiver acabando (menos de 10s), o texto fica vermelho (Alerta visual de UX)
        ctx.fillStyle = this.timeLeft <= 10 ? '#ff477e' : '#70e000';
        ctx.fillText(`TEMPO RESTANTE: ${this.timeLeft}s`, 20, 50);

        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Status Engine: ${this.state}`, 20, 65);
    }
}