// src/Projectile.js
export class Projectile {
    constructor(x, y, vx, vy, radius = 4) {
        this.x = x;
        this.y = y;
        this.vx = vx; // Velocidade Horizontal (Força inicial * Cosseno do ângulo)
        this.vy = vy; // Velocidade Vertical (Força inicial * Seno do ângulo)
        this.radius = radius;
        this.gravity = 0.15; // Força puxando a bala para baixo a cada frame
        this.isActive = true; // Flag de controle: vira falso quando explode
        this.explosionRadius = 30; // Tamanho da cratera que vai gerar
    }

    update(terrain, worms) {
        if (!this.isActive) return;

        // Aplica a gravidade constante na velocidade vertical
        this.vy += this.gravity;

        // Atualiza a posição do projétil no espaço com base nas velocidades
        this.x += this.vx;
        this.y += this.vy;

        // CASO DE TESTE (QA): Se sair pelos lados ou fundo da tela, desativa o objeto para não vazar memória
        if (this.x < 0 || this.x > terrain.width || this.y > terrain.height) {
            this.isActive = false;
            return;
        }

        // CHECAGEM DE COLISÃO: O projétil atingiu o terreno sólido?
        if (terrain.isSolidPixel(this.x, this.y)) {
            this.explode(terrain, worms);
        }
    }

    explode(terrain, worms) {
        this.isActive = false;

        // 1. Aplica o recorte/destruição no terreno usando o método que já criamos
        terrain.destroyCircle(this.x, this.y, this.explosionRadius);

        // 2. REGRA DE NEGÓCIO / QA: Aplica força de impacto (Knockback) nas minhocas próximas
        for (let worm of worms) {
            // Calcula a distância matemática elementar entre a explosão e a minhoca
            let dx = worm.x - this.x;
            let dy = worm.y - this.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            // Se a minhoca estava dentro do raio da explosão, ela sofre o impacto físico
            if (distancia < this.explosionRadius + worm.radius) {
                worm.isGrounded = false;
                
                // Vetor normalizado de empurrão
                let forca = (this.explosionRadius + worm.radius - distancia) * 0.15;
                worm.vx = (dx / distancia) * forca;
                worm.vy = (dy / distancia) * forca - 2; // O -2 garante que ela seja lançada um pouco para cima
            }
        }
    }

    draw(ctx) {
        if (!this.isActive) return;

        // Desenha o projétil como uma pequena bala de canhão preta
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}