const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const tileSize = 20;
let score = 0;
let lives = 3;
let currentPlayerName = "";
let gameIntervalId = null;

// Mapa em Matriz: 1 = Parede, 0 = Pastilha (Comida), 2 = Espaço Vazio
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
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
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Classes do Jogo
class Pacman {
    constructor() {
        this.x = 9 * tileSize;
        this.y = 16 * tileSize;
        this.dirX = 0;
        this.dirY = 0;
        this.nextDirX = 0;
        this.nextDirY = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x + tileSize/2, this.y + tileSize/2, tileSize/2 - 2, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.lineTo(this.x + tileSize/2, this.y + tileSize/2);
        ctx.fillStyle = '#ffd43b';
        ctx.fill();
        ctx.closePath();
    }

    move() {
        // Tenta aplicar a direção intencionada pelo jogador
        if (this.canMove(this.nextDirX, this.nextDirY)) {
            this.dirX = this.nextDirX;
            this.dirY = this.nextDirY;
        }

        if (this.canMove(this.dirX, this.dirY)) {
            this.x += this.dirX * 2;
            this.y += this.dirY * 2;
        }
    }

    canMove(dx, dy) {
        // Checa colisões futuras com as bordas dos blocos na matriz
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
    constructor(x, y, color) {
        this.x = x * tileSize;
        this.y = y * tileSize;
        this.color = color;
        // Direções possíveis de deslocamento
        this.dirs = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
        this.dir = this.dirs[Math.floor(Math.random() * 4)];
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x + tileSize/2, this.y + tileSize/2 - 2, tileSize/2 - 2, Math.PI, 0, false);
        ctx.lineTo(this.x + tileSize - 2, this.y + tileSize);
        ctx.lineTo(this.x + 2, this.y + tileSize);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move() {
        // Inteligência Artificial Simples: Anda em linha reta, mudando aleatoriamente nos cruzamentos
        if (Math.random() < 0.05 || !this.canMove(this.dir.x, this.dir.y)) {
            const validDirs = this.dirs.filter(d => this.canMove(d.x, d.y));
            if (validDirs.length > 0) {
                this.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
            }
        }
        this.x += this.dir.x * 2;
        this.y += this.dir.y * 2;
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

const pacman = new Pacman();
const ghosts = [
    new Ghost(9, 9, '#ef4444'), // Vermelho Blinky
    new Ghost(9, 10, '#ec4899'), // Rosa Pinky
    new Ghost(8, 10, '#22d3ee')  // Azul Inky
];

// Eventos de Inicialização do DOM
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
        gameIntervalId = setInterval(gameLoop, 1000 / 60); // 60 FPS estáveis
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
                ctx.fillStyle = '#1c7ed6'; // Cor das paredes do labirinto
                ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
            } else if (map[r][c] === 0) {
                ctx.beginPath();
                ctx.arc(c * tileSize + tileSize/2, r * tileSize + tileSize/2, 3, 0, 2 * Math.PI);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function checkCollisions() {
    // 1. Comer Pastilhas
    const currentTileX = Math.floor((pacman.x + tileSize/2) / tileSize);
    const currentTileY = Math.floor((pacman.y + tileSize/2) / tileSize);

    if (map[currentTileY] && map[currentTileX] === 0) {
        map[currentTileY][currentTileX] = 2; // Transforma em espaço vazio
        score += 10;
        scoreDisplay.textContent = score;
    }

    // 2. Colisão com Fantasmas
    ghosts.forEach(ghost => {
        const dist = Math.hypot((pacman.x - ghost.x), (pacman.y - ghost.y));
        if (dist < tileSize - 4) {
            handleLifeLoss();
        }
    });
}

function handleLifeLoss() {
    lives--;
    if (lives <= 0) {
        clearInterval(gameIntervalId);
        alert(`💥 GAME OVER! Você acumulou ${score} pontos.`);
        saveRanking();
        
        loginScreen.classList.remove('hidden');
        mainGameContainer.classList.add('hidden');
        usernameInput.value = "";
    } else {
        livesDisplay.textContent = "❤️ ".repeat(lives);
        // Reseta as coordenadas dos personagens de volta ao ponto inicial sem zerar os pontos
        pacman.x = 9 * tileSize; pacman.y = 16 * tileSize;
        pacman.dirX = 0; pacman.dirY = 0; pacman.nextDirX = 0; pacman.nextDirY = 0;
    }
}

function resetGameSession() {
    score = 0;
    lives = 3;
    scoreDisplay.textContent = score;
    livesDisplay.textContent = "❤️ ❤️ ❤️";
    
    // Repovoa o mapa restaurando as pastilhas (0) nas posições originais
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 2 && r !== 10 && c !== 9) map[r][c] = 0;
        }
    }
}

function saveRanking() {
    const record = { name: currentPlayerName, score: score };
    let ranking = JSON.parse(localStorage.getItem('arcade_comecome_ranking')) || [];
    
    ranking.push(record);
    ranking.sort((a, b) => b.score - a.score);
    ranking = ranking.slice(0, 5);
    
    localStorage.setItem('arcade_comecome_ranking', JSON.stringify(ranking));
    renderRanking();
}

function renderRanking() {
    const rankingBody = document.getElementById('ranking-body');
    const ranking = JSON.parse(localStorage.getItem('arcade_comecome_ranking')) || [];
    
    rankingBody.innerHTML = ranking.length === 0 
        ? `<tr><td colspan="3" style="text-align:center;">Sem recordes. Pegue todas as pastilhas!</td></tr>`
        : ranking.map((player, index) => `
            <tr>
                <td>${index + 1}º</td>
                <td><strong>${player.name}</strong></td>
                <td>${player.score} pts</td>
            </tr>
          `).join('');
}