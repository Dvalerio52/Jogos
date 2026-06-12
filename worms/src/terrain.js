// src/Terrain.js
export class TerrainManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Criamos o canvas isolado na memória (Invisível) para performance de renderização
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        
        this.generate();
    }

    // Gera um terreno com curvas suaves usando a função Seno
    generate() {
        this.ctx.fillStyle = '#e67e22'; // Cor do solo
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);
        
        for (let x = 0; x <= this.width; x++) {
            let y = 320 + Math.sin(x * 0.015) * 50 + Math.sin(x * 0.005) * 30;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.lineTo(this.width, this.height);
        this.ctx.closePath();
        this.ctx.fill();
    }

    // Recorta um círculo do mapa (simula o buraco da explosão)
    destroyCircle(cx, cy, radius) {
        this.ctx.globalCompositeOperation = 'destination-out'; // Modo borracha
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over'; // Restaura o modo normal
    }

    // Retorna verdadeiro se o pixel nas coordenadas X e Y não for transparente
    isSolidPixel(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        const pixel = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        return pixel[3] > 0; // Canal Alpha > 0 significa que o pixel existe
    }

    // Desenha o mapa da memória na tela real do jogo
    draw(mainCtx) {
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}