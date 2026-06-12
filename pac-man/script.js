const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const tileSize = 20;
let score = 0;
let lives = 3;
let currentPlayerName = "";
let gameIntervalId = null;

// Sistema de pânico de fantasmas (quando come a pastilha grande)
let frightenedTimer = 0;
let ghostsEatenInRow = 0;

// O MAPA OFICIAL RETRO (21 linhas x 19 colunas)
// 1 = Parede Azul, 0 = Pastilha Pequena, 3 = Pastilha Grande (Energizer), 2 = Espaço Vazio / Linha de Fuga
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
    [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
    [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,3,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,3,1],
    [1,0,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Ajusta tamanho interno do canvas de forma dinâmica baseada no mapa clássico
canvas.width = 19 * tileSize;
canvas.height = 20 * tileSize;

class Pacman {
    constructor() {
        this.resetPosition();
        this.mouthAngle = 0.2;
        this.mouthSpeed = 0.02;
    }

    resetPosition() {
        this.x = 9 * tileSize;
        this.y = 16 * tileSize;
        this.dirX = 0;
        this.dirY = 0;
        this.nextDirX = 0;
        this.nextDirY = 0;
        this.rotation = 0;
    }

    draw() {
        // Controla animação de abrir e fechar a boca
        this.mouthAngle += this.mouthSpeed;
        if (this.mouthAngle > 0.4 || this.mouthAngle < 0.05) {
            this.mouthSpeed = -this.mouthSpeed;
        }

        ctx.save();
        ctx.translate(this.x + tileSize/2, this.y + tileSize/2);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        ctx.arc(0, 0, tileSize/2 - 1, this.mouthAngle * Math.PI, (2 - this.mouthAngle) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fillStyle = '#ffff00';
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    move() {
        // Tenta aplicar nova rota desejada
        if (this.canMove(this.nextDirX, this.nextDirY)) {
            this.dirX = this.nextDirX;
            this.dirY = this.nextDirY;
            
            // Define o ângulo correto da animação da boca baseada na direção
            if (this.dirX === 1) this.rotation = 0;
            if (this.dirX === -1) this.rotation = Math.PI;
            if (this.dirY === 1) this.rotation = Math.PI / 2;
            if (this.dirY === -1) this.rotation = Math.PI * 1.5;
        }

        if (this.canMove(this.dirX, this.dirY)) {
            this.x += this.dirX * 2;
            this.y += this.dirY * 2;
        }

        // TÚNEL DE FUGA CLÁSSICO (Teletransporte lateral)
        if (this.x < -tileSize/2) this.x = canvas.width - tileSize/2;
        if (this.x > canvas.width - tileSize/2) this.x = -tileSize/2;
    }

    canMove(dx, dy) {
        const nextX = this.x + dx * 2;
        const nextY = this.y + dy * 2;

        const tileLeft = Math.floor(nextX / tileSize);
        const tileRight = Math.floor((nextX + tileSize - 1) / tileSize);
        const tileTop = Math.floor(nextY / tileSize);
        const tileBottom = Math.floor((nextY + tileSize - 1) / tileSize);

        if (map[tileTop] && map[tileBottom]) {
            return map[tileTop][tileLeft] !== 1 && map[tileTop][tileRight] !== 1 &&
                   map[tileBottom][tileLeft] !== 1 && map[tileBottom][tileRight] !== 1;
        }
        return false;
    }
}

class Ghost {
    constructor(x, y, color, originalColor) {
        this.startX = x * tileSize;
        this.startY = y * tileSize;
        this.color = color;
        this.originalColor = originalColor;
        this.reset();
        this.dirs = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.dir = {x: 0, y: -1};
    }

    draw() {
        ctx.beginPath();
        // Se estiver sob efeito do Energizer, muda para azul fantasma
        ctx.fillStyle = frightenedTimer > 0 ? '#2121ff' : this.color;
        
        // Se o pânico estiver quase acabando, faz o fantasma piscar em branco/azul (Fidelidade visual)
        if (frightenedTimer > 0 && frightenedTimer < 180 && Math.floor(frightenedTimer / 15) % 2 === 0) {
            ctx.fillStyle = '#ffffff';
        }

        ctx.arc(this.x + tileSize/2, this.y + tileSize/2 - 2, tileSize/2 - 1, Math.PI, 0, false);
        ctx.lineTo(this.x + tileSize - 1, this.y + tileSize);
        
        // Efeito serrilhado ondulado da parte inferior do fantasma original
        ctx.lineTo(this.x + (tileSize * 0.75), this.y + tileSize - 3);
        ctx.lineTo(this.x + (tileSize * 0.5), this.y + tileSize);
        ctx.lineTo(this.x + (tileSize * 0.25), this.y + tileSize - 3);
        ctx.lineTo(this.x + 1, this.y + tileSize);
        
        ctx.fill();
        ctx.closePath();

        // Olhos dos Fantasmas
        ctx.beginPath();
        ctx.fillStyle = frightenedTimer > 0 ? '#ffb8ae' : '#ffffff'; // Olhos vermelhos se em pânico
        ctx.arc(this.x + 6, this.y + 6, 2.5, 0, 2 * Math.PI);
        ctx.arc(this.x + 14, this.y + 6, 2.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    move() {
        // Velocidade reduzida quando assustados
        const speed = frightenedTimer > 0 ? 1 : 2;

        if (Math.random() < 0.2 || !this.canMove(this.dir.x, this.dir.y, speed)) {
            const validDirs = this.dirs.filter(d => this.canMove(d.x, d.y, speed));
            if (validDirs.length > 0) {
                this.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
            }
        }
        this.x += this.dir.x * speed;
        this.y += this.dir.y * speed;

        // Suporte ao túnel lateral também para os fantasmas
        if (this.x < -tileSize/2) this.x = canvas.width - tileSize/2;
        if (this.x > canvas.width - tileSize/2) this.x = -tileSize/2;
    }

    canMove(dx, dy, speed) {
        const nextX = this.x + dx * speed;
        const nextY = this.y + dy * speed;
        const tileLeft = Math.floor(nextX / tileSize);
        const tileRight = Math.floor((nextX + tileSize - 1) / tileSize);
        const tileTop = Math.floor(nextY / tileSize);
        const tileBottom = Math.floor((nextY + tileSize - 1) / tileSize);

        if (map[tileTop] && map[tileBottom]) {
            return map[tileTop][tileLeft] !== 1 && map[tileTop][tileRight] !== 1 &&
                   map[tileBottom][tileLeft] !== 1 && map[tileBottom][tileRight] !== 1;
        }
        return false;
    }
}

const pacman = new Pacman();
const ghosts = [
    new Ghost(9, 7, '#ff0000', '#ff0000'),  // Blinky (Vermelho)
    new Ghost(9, 9, '#ffb8ff', '#ffb8ff'),  // Pinky (Rosa)
    new Ghost(8, 9, '#00ffff', '#00ffff'),  // Inky (Ciano)
    new Ghost(10, 9, '#ffb852', '#ffb852')  // Clyde (Laranja)
];

const loginScreen = document.getElementById('login-screen');
const mainGameContainer = document.getElementById('main-game-container');
const usernameInput = document.getElementById('username-input');
const scoreDisplay = document.getElementById('score-display');
const livesDisplay = document.getElementById('lives-display');
const playerNameDisplay = document.getElementById('player-name-display');

document.addEventListener('DOMContentLoaded', () => {
    renderRanking();

    document.getElementById('start-game-btn').addEventListener('click', () => {
        const name = usernameInput.value.trim();
        if (!name) {
            alert("Insira uma credencial de jogador válida!");
            return;
        }
        currentPlayerName = name;
        playerNameDisplay.textContent = currentPlayerName;

        loginScreen.classList.add('hidden');
        mainGameContainer.classList.remove('hidden');

        resetGameSession();
        gameIntervalId = setInterval(gameLoop, 1000 / 60);
    });

    // Eventos do Teclado (PC)
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp') setDirection(0, -1);
        if (e.key === 'ArrowDown') setDirection(0, 1);
        if (e.key === 'ArrowLeft') setDirection(-1, 0);
        if (e.key === 'ArrowRight') setDirection(1, 0);
    });

    // Eventos dos Botões Mobile
    document.getElementById('ctrl-up').addEventListener('click', () => setDirection(0, -1));
    document.getElementById('ctrl-down').addEventListener('click', () => setDirection(0, 1));
    document.getElementById('ctrl-left').addEventListener('click', () => setDirection(-1, 0));
    document.getElementById('ctrl-right').addEventListener('click', () => setDirection(1, 0));
});

function setDirection(x, y) {
    pacman.nextDirX = x;
    pacman.nextDirY = y;
}

function gameLoop() {
    pacman.move();
    ghosts.forEach(g => g.move());

    if (frightenedTimer > 0) {
        frightenedTimer--;
        if (frightenedTimer === 0) ghostsEatenInRow = 0;
    }

    checkCollisions();
    drawMap();

    pacman.draw();
    ghosts.forEach(g => g.draw());
}

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 1) {
                ctx.fillStyle = '#2121ff'; // Linhas duplas simuladas por bloco clássico azul
                ctx.fillRect(c * tileSize + 1, r * tileSize + 1, tileSize - 2, tileSize - 2);
            } else if (map[r][c] === 0) {
                // Pastilha Pequena
                ctx.beginPath();
                ctx.arc(c * tileSize + tileSize/2, r * tileSize + tileSize/2, 2.5, 0, 2 * Math.PI);
                ctx.fillStyle = '#ffb8ae';
                ctx.fill();
                ctx.closePath();
            } else if (map[r][c] === 3) {
                // Pastilha Grande (Energizer) Piscando continuamente
                if (Math.floor(Date.now() / 200) % 2 === 0) {
                    ctx.beginPath();
                    ctx.arc(c * tileSize + tileSize/2, r * tileSize + tileSize/2, 6, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ffb8ae';
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }
}

function checkCollisions() {
    const currentTileX = Math.floor((pacman.x + tileSize/2) / tileSize);
    const currentTileY = Math.floor((pacman.y + tileSize/2) / tileSize);

    // 1. Comer Pastilha Normal
    if (map[currentTileY] && map[currentTileY][currentTileX] === 0) {
        map[currentTileY][currentTileX] = 2;
        score += 10;
        scoreDisplay.textContent = score;
    }

    // 2. Comer Pastilha Grande (Ativa o modo de Caça aos Fantasmas!)
    if (map[currentTileY] && map[currentTileY][currentTileX] === 3) {
        map[currentTileY][currentTileX] = 2;
        score += 50;
        scoreDisplay.textContent = score;
        frightenedTimer = 420; // Aproximadamente 7 segundos a 60 FPS
    }

    // 3. Colisão Física com Fantasmas
    ghosts.forEach(ghost => {
        const dist = Math.hypot((pacman.x - ghost.x), (pacman.y - ghost.y));
        if (dist < tileSize - 4) {
            if (frightenedTimer > 0) {
                // Se o fantasma estiver em pânico, o Pacman o come!
                ghostsEatenInRow++;
                score += ghostsEatenInRow * 200; // Sistema multiplicador original (200, 400, 800, 1600)
                scoreDisplay.textContent = score;
                ghost.reset();
            } else {
                // Senão, o Pacman perde uma vida
                handleLifeLoss();
            }
        }
    });
}

function handleLifeLoss() {
    lives--;
    if (lives <= 0) {
        clearInterval(gameIntervalId);
        alert(`💥 GAME OVER! Você alcançou ${score} pontos.`);
        saveRanking();
        
        loginScreen.classList.remove('hidden');
        mainGameContainer.classList.add('hidden');
        usernameInput.value = "";
    } else {
        livesDisplay.textContent = "❤️ ".repeat(lives);
        pacman.resetPosition();
        ghosts.forEach(g => g.reset());
    }
}

function resetGameSession() {
    score = 0;
    lives = 3;
    frightenedTimer = 0;
    ghostsEatenInRow = 0;
    scoreDisplay.textContent = score;
    livesDisplay.textContent = "❤️ ❤️ ❤️";
    pacman.resetPosition();
    ghosts.forEach(g => g.reset());
    
    // Repovoa o mapa restaurando a comida
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 2) {
                // Mantém corredores vazios de fuga e spawn intactos
                if (r === 9 || r === 10 || r === 8 || r === 12) continue;
                map[r][c] = 0;
            }
        }
    }
}

function saveRanking() {
    const record = { name: currentPlayerName, score: score };
    let ranking = JSON.parse(localStorage.getItem('arcade_pacman_ranking')) || [];
    
    ranking.push(record);
    ranking.sort((a, b) => b.score - a.score);
    ranking = ranking.slice(0, 5);
    
    localStorage.setItem('arcade_pacman_ranking', JSON.stringify(ranking));
    renderRanking();
}

function renderRanking() {
    const rankingBody = document.getElementById('ranking-body');
    const ranking = JSON.parse(localStorage.getItem('arcade_pacman_ranking')) || [];
    
    rankingBody.innerHTML = ranking.length === 0 
        ? `<tr><td colspan="3" style="text-align:center;">Sem recordes ainda. Devore o labirinto!</td></tr>`
        : ranking.map((player, index) => `
            <tr>
                <td>${index + 1}º</td>
                <td><strong>${player.name}</strong></td>
                <td>${player.score} pts</td>
            </tr>
          `).join('');
}