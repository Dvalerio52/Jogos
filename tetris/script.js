const canvas = document.getElementById('tetris-canvas');
const context = canvas.getContext('2d');

// Escala os blocos (240x480 de resolução interna / blocos de 20px)
context.scale(20, 20);

let score = 0;
let lines = 0;
let currentPlayerName = "";

const matrixGrid = createMatrix(12, 24); // Grade do jogo: 12 colunas x 24 linhas

// Formato das Peças (Tetraminós)
const pieces = 'ILJOTSZ';
const colors = [
    null,
    '#3b82f6', // I (Azul)
    '#f59e0b', // L (Laranja)
    '#8b5cf6', // J (Roxo)
    '#ef4444', // O (Vermelho)
    '#10b981', // T (Verde)
    '#ec4899', // S (Rosa)
    '#6366f1'  // Z (Índigo)
];

const playerPiece = {
    pos: {x: 0, y: 0},
    matrix: null,
};

// Captura Elementos do DOM
const loginScreen = document.getElementById('login-screen');
const mainGameContainer = document.getElementById('main-game-container');
const usernameInput = document.getElementById('username-input');
const startGameBtn = document.getElementById('start-game-btn');
const playerNameDisplay = document.getElementById('player-name-display');
const scoreDisplay = document.getElementById('score-display');
const linesDisplay = document.getElementById('lines-display');

document.addEventListener('DOMContentLoaded', () => {
    renderRanking();

    startGameBtn.addEventListener('click', () => {
        const name = usernameInput.value.trim();
        if (!name) {
            alert("Insira um nome válido para ativar o painel!");
            return;
        }
        currentPlayerName = name;
        playerNameDisplay.textContent = currentPlayerName;

        loginScreen.classList.add('hidden');
        mainGameContainer.classList.remove('hidden');

        resetPlayerPiece();
        updateScore();
        updateGame();
    });

    // Mapeamento de Controles do Teclado (PC)
    document.addEventListener('keydown', event => {
        if (mainGameContainer.classList.contains('hidden')) return;
        if (event.keyCode === 37) playerMove(-1);      // Seta Esquerda
        else if (event.keyCode === 39) playerMove(1);   // Seta Direita
        else if (event.keyCode === 40) playerDrop();   // Seta Baixo
        else if (event.keyCode === 38) playerRotate(); // Seta Cima
    });

    // Mapeamento de Controles Touch (Mobile)
    document.getElementById('ctrl-left').addEventListener('click', () => playerMove(-1));
    document.getElementById('ctrl-right').addEventListener('click', () => playerMove(1));
    document.getElementById('ctrl-down').addEventListener('click', () => playerDrop());
    document.getElementById('ctrl-rotate').addEventListener('click', () => playerRotate());
});

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'I') return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
    else if (type === 'L') return [[0,2,0],[0,2,0],[0,2,2]];
    else if (type === 'J') return [[0,3,0],[0,3,0],[3,3,0]];
    else if (type === 'O') return [[4,4],[4,4]];
    else if (type === 'T') return [[0,5,0],[5,5,5],[0,0,0]];
    else if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
    else if (type === 'Z') return [[7,7,0],[0,7,7],[0,0,0]];
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(matrixGrid, {x: 0, y: 0});
    drawMatrix(playerPiece.matrix, playerPiece.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(grid, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                grid[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(grid, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (grid[y + o.y] && grid[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function gridSweep() {
    let rowCount = 1;
    outer: for (let y = matrixGrid.length - 1; y > 0; --y) {
        for (let x = 0; x < matrixGrid[y].length; ++x) {
            if (matrixGrid[y][x] === 0) {
                continue outer;
            }
        }
        const row = matrixGrid.splice(y, 1)[0].fill(0);
        matrixGrid.unshift(row);
        ++y;

        score += rowCount * 10;
        lines += 1;
        rowCount *= 2;
    }
}

let dropCounter = 0;
let dropInterval = 1000; // Velocidade inicial de queda (1 segundo)
let lastTime = 0;

function updateGame(time = 0) {
    if (mainGameContainer.classList.contains('hidden')) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(updateGame);
}

function playerMove(dir) {
    playerPiece.pos.x += dir;
    if (collide(matrixGrid, playerPiece)) {
        playerPiece.pos.x -= dir;
    }
}

function playerDrop() {
    playerPiece.pos.y++;
    if (collide(matrixGrid, playerPiece)) {
        playerPiece.pos.y--;
        merge(matrixGrid, playerPiece);
        resetPlayerPiece();
        gridSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerRotate() {
    const pos = playerPiece.pos.x;
    let offset = 1;
    rotate(playerPiece.matrix);
    while (collide(matrixGrid, playerPiece)) {
        playerPiece.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > playerPiece.matrix[0].length) {
            rotate(playerPiece.matrix, -1);
            playerPiece.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir = 1) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

function resetPlayerPiece() {
    playerPiece.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    playerPiece.pos.y = 0;
    playerPiece.pos.x = (matrixGrid[0].length / 2 | 0) - (playerPiece.matrix[0].length / 2 | 0);

    // Condição de Game Over
    if (collide(matrixGrid, playerPiece)) {
        alert(`💥 GAME OVER! Você fez ${score} pontos.`);
        saveRanking();
        
        // Limpa a matriz do mapa e reseta scores
        matrixGrid.forEach(row => row.fill(0));
        score = 0;
        lines = 0;
        
        loginScreen.classList.remove('hidden');
        mainGameContainer.classList.add('hidden');
        usernameInput.value = "";
    }
}

function updateScore() {
    scoreDisplay.textContent = score;
    linesDisplay.textContent = lines;
    // Aumenta a velocidade de queda conforme o jogador pontua (Deixa o jogo mais iterativo/difícil)
    dropInterval = Math.max(100, 1000 - (lines * 50));
}

// Sistema de Persistência do Placar de Líderes
function saveRanking() {
    const record = { name: currentPlayerName, score: score };
    let ranking = JSON.parse(localStorage.getItem('arcade_tetris_ranking')) || [];
    
    ranking.push(record);
    ranking.sort((a, b) => b.score - a.score); // Maior pontuação ganha
    ranking = ranking.slice(0, 5); // Mantém apenas o Top 5
    
    localStorage.setItem('arcade_tetris_ranking', JSON.stringify(ranking));
    renderRanking();
}

function renderRanking() {
    const rankingBody = document.getElementById('ranking-body');
    const ranking = JSON.parse(localStorage.getItem('arcade_tetris_ranking')) || [];
    
    rankingBody.innerHTML = ranking.length === 0 
        ? `<tr><td colspan="3" style="text-align:center;">Nenhum recorde. Domine o grid!</td></tr>`
        : ranking.map((player, index) => `
            <tr>
                <td>${index + 1}º</td>
                <td><strong>${player.name}</strong></td>
                <td>${player.score} pts</td>
            </tr>
          `).join('');
}