// Banco de dados de cartas temáticas (Notícias/Atualidades)
const allCardsData = [
    { name: 'ia', content: '🤖' }, { name: 'ia', content: 'IA' },
    { name: 'clima', content: '🌍' }, { name: 'clima', content: 'Clima' },
    { name: 'espaco', content: '🚀' }, { name: 'espaco', content: 'Espaço' },
    { name: 'crypto', content: '🪙' }, { name: 'crypto', content: 'Cripto' },
    { name: 'saude', content: '🧬' }, { name: 'saude', content: 'Saúde' },
    { name: 'tecnologia', content: '💻' }, { name: 'tecnologia', content: 'Tech' },
    { name: 'esporte', content: '⚽' }, { name: 'esporte', content: 'Esporte' },
    { name: 'arte', content: '🎨' }, { name: 'arte', content: 'Arte' }
];

const configPhases = {
    facil: { pairs: 4, gridClass: 'grid-facil' },
    medio: { pairs: 6, gridClass: 'grid-medio' },
    dificil: { pairs: 8, gridClass: 'grid-dificil' }
};

let moves = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchesFound = 0;
let currentPairsCount = 4;

const gameGrid = document.getElementById('game-grid');
const movesCounter = document.getElementById('moves-counter');
const currentPhaseText = document.getElementById('current-phase');
const phaseSelect = document.getElementById('phase-select');
const resetBtn = document.getElementById('reset-btn');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    renderRanking();
    
    phaseSelect.addEventListener('change', (e) => {
        initGame();
    });
    
    resetBtn.addEventListener('click', initGame);
});

function initGame() {
    const selectedPhase = phaseSelect.value;
    const config = configPhases[selectedPhase];
    
    currentPairsCount = config.pairs;
    currentPhaseText.textContent = `Fase: ${selectedPhase.toUpperCase()}`;
    
    // Atualiza classe do Grid no CSS para responsividade
    gameGrid.className = `game-grid ${config.gridClass}`;
    
    moves = 0;
    matchesFound = 0;
    movesCounter.textContent = `Movimentos: ${moves}`;
    resetCardSelection();
    
    // Filtra e embaralha as cartas para a fase correspondente
    const selectedKeys = [...new Set(allCardsData.map(c => c.name))].slice(0, currentPairsCount);
    const filteredCards = allCardsData.filter(card => selectedKeys.includes(card.name));
    const gameCards = shuffle([...filteredCards]);
    
    createGrid(gameCards);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createGrid(cards) {
    gameGrid.innerHTML = '';
    cards.forEach(cardData => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.name = cardData.name;
        
        card.innerHTML = `
            <div class="front">${cardData.content}</div>
            <div class="back">❓</div>
        `;
        
        card.addEventListener('click', flipCard);
        gameGrid.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard || this.classList.contains('flipped')) return;
    
    this.classList.add('flipped');
    
    if (!firstCard) {
        firstCard = this;
        return;
    }
    
    secondCard = this;
    updateMoves();
    checkMatch();
}

function updateMoves() {
    moves++;
    movesCounter.textContent = `Movimentos: ${moves}`;
}

function checkMatch() {
    const isMatch = firstCard.dataset.name === secondCard.dataset.name;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchesFound++;
    
    if (matchesFound === currentPairsCount) {
        setTimeout(handleWin, 500);
    }
    resetCardSelection();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetCardSelection();
    }, 1000);
}

function resetCardSelection() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

// Sistema de Ranking Local (Persistência com LocalStorage)
function handleWin() {
    const playerName = prompt(`🎉 Parabéns! Você terminou a fase com ${moves} movimentos.\nDigite seu nome para o Ranking:`) || "Anônimo";
    
    const newRecord = {
        name: playerName,
        phase: phaseSelect.value.toUpperCase(),
        moves: moves,
        date: new Date().toLocaleDateString('pt-BR')
    };
    
    let ranking = JSON.parse(localStorage.getItem('arcade_ranking')) || [];
    ranking.push(newRecord);
    
    // Ordena por menor número de movimentos (melhor score)
    ranking.sort((a, b) => a.moves - b.moves);
    
    // Guarda apenas o Top 5 geral para manter o desafio alto
    ranking = ranking.slice(0, 5);
    
    localStorage.setItem('arcade_ranking', JSON.stringify(ranking));
    renderRanking();
}

function renderRanking() {
    const rankingBody = document.getElementById('ranking-body');
    const ranking = JSON.parse(localStorage.getItem('arcade_ranking')) || [];
    
    rankingBody.innerHTML = ranking.length === 0 
        ? `<tr><td colspan="4" style="text-align:center;">Nenhum recorde ainda. Seja o primeiro!</td></tr>`
        : ranking.map((player, index) => `
            <tr>
                <td>${index + 1}º</td>
                <td><strong>${player.name}</strong></td>
                <td>${player.phase}</td>
                <td>${player.moves} mvs</td>
            </tr>
          `).join('');
}