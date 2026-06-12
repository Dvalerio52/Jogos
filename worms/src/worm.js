// src/Worm.js
export class Worm {
    constructor(x, y, color, isControlled = false) {
        this.x = x;
        this.y = y;
        this.radius = 10; // Raio do corpo circular
        this.color = color;
        this.vx = 0; // Velocidade horizontal residual (impacto)
        this.vy = 0; // Velocidade vertical (queda/gravidade)
        this.isGrounded = false;
        this.speed = 1.5;
        this.gravity = 0.2;
        this.isControlled = isControlled;
    }

    update(terrain, input) {
        // Aplica gravidade se estiver flutuando no ar
        if (!this.isGrounded) {
            this.vy += this.gravity;
        }

        // Processa comandos apenas se for o turno desta minhoca
        if (this.isControlled) {
            if (input.isPressed('arrowleft') || input.isPressed('a')) {
                this.vx = -this.speed;
            } else if (input.isPressed('arrowright') || input.isPressed('d')) {
                this.vx = this.speed;
            } else {
                this.vx = 0;
            }
        } else {
            // Se não estiver controlada, reduz a velocidade de impacto aos poucos (atrito)
            this.vx *= 0.95;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }

        // Resolução de Física Vertical
        let nextY = this.y + this.vy;
        if (terrain.isSolidPixel(this.x, nextY + this.radius)) {
            this.vy = 0;
            this.isGrounded = true;
            // Ajusta milimetricamente o corpo na superfície da cratera
            while (terrain.isSolidPixel(this.x, nextY + this.radius - 1)) {
                nextY--;
            }
            this.y = nextY;
        } else {
            this.y = nextY;
            this.isGrounded = false;
        }

        // Resolução de Física Horizontal (Inclui rampa para subir pequenas elevações de até 4px)
        if (this.vx !== 0) {
            let nextX = this.x + this.vx;
            if (!terrain.isSolidPixel(nextX, this.y + this.radius - 2)) {
                this.x = nextX;
            } else if (!terrain.isSolidPixel(nextX, this.y + this.radius - 6)) {
                this.x = nextX;
                this.y -= 4; // Sobe o degrau automaticamente
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Olho direcional preto fixado na direção do movimento
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        let eyeOffset = this.vx >= 0 ? 4 : -6;
        ctx.arc(this.x + eyeOffset, this.y - 3, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}