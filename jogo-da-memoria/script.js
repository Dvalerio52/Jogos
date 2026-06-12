// Banco de dados de atualidades (Emojis e Textos)
const allCardsData = [
    { name: 'ia', content: '🤖' }, { name: 'ia', content: 'IA' },
    { name: 'clima', content: '🌍' }, { name: 'clima', content: 'Clima' },
    { name: 'espaco', content: '🚀' }, { name: 'espaco', content: 'Espaço' },
    { name: 'crypto', content: '🪙' }, { name: 'crypto', content: 'Cripto' },
    { name: 'saude', content: '🧬' }, { name: 'saude', content: 'Saúde' },
    { name: 'tech', content: '💻' }, { name: 'tech', content: 'Tech' },
    { name: 'esporte', content: '⚽' }, { name: 'esporte', content: 'Esporte' },
    { name: 'arte', content: '🎨' }, { name: 'arte', content: 'Arte' }
];

// Configuração das fases sequenciais obrigatórias
const campaignPhases = [
    { level: 1, name: 'Fácil (Mundo Tech)', pairs: 4, gridClass: 'grid-4' },
    { level: 2, name: 'Médio (Ciência & Economia)', pairs: 6, gridClass: 'grid-4' },
    { level: 3, name: 'Difícil (Atualidades Geral)', pairs: 8, gridClass: 'grid-4' }
];

let currentPhaseIndex = 0;
let totalAccumulatedMoves = 0;
let currentPhaseMoves = 0;
let currentPlayerName = "";

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchesFound = 0;

const loginScreen = document.getElementById('login-screen');
const mainGameContainer = document.getElementById('main-game-container');
const usernameInput = document.getElementById('username-input');
const startCampaignBtn = document.getElementById('start-campaign-btn');

const gameGrid = document.getElementById('game-grid');
const movesCounter = document.getElementById('moves-counter');
const currentPhaseText = document.getElementById('current-phase');
const playerDisplay = document.getElementById('player-display');

document.addEventListener('DOMContentLoaded', () => {
    renderRanking();
    
    startCampaignBtn.addEventListener('click', () => {
        const name = usernameInput.value.trim();
        if (!name) {
            alert("Por favor, digite um nome válido para começar!");
            return;
        }
        currentPlayerName = name;
        playerDisplay.textContent = `Jogador: ${currentPlayerName}`;
        
        // Troca de telas
        loginScreen.classList.add('hidden');
        mainGameContainer.classList.remove('hidden');
        
        startCampaign();
    });
});

function startCampaign() {
    currentPhaseIndex = 0;
    totalAccumulatedMoves = 0;
    loadPhase(currentPhaseIndex);
}

function loadPhase(index) {
    const phase = campaignPhases[index];
    currentPhaseMoves = 0;
    matchesFound = 0;
    
    // Atualiza cabeçalho e estrutura do Grid
    currentPhaseText.textContent = `Fase: ${phase.level}/3 - ${phase.name}`;
    movesCounter.textContent = `Movimentos: ${totalAccumulatedMoves} (Fase: 0)`;
    gameGrid.className = `game-grid ${phase.gridClass}`;
    
    resetCardSelection();

    // Filtra pares específicos para a fase
    const selectedKeys = [...new Set(allCardsData.map(c => c.name))].slice(0, phase.pairs);
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
    currentPhaseMoves++;
    totalAccumulatedMoves++;
    movesCounter.textContent = `Movimentos: ${totalAccumulatedMoves} (Fase: ${currentPhaseMoves})`;
}

function checkMatch() {
    const isMatch = firstCard.dataset.name === secondCard.dataset.name;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchesFound++;
    
    const targetPairs = campaignPhases[currentPhaseIndex].pairs;
    if (matchesFound === targetPairs) {
        setTimeout(handlePhaseComplete, 600);
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

function handlePhaseComplete() {
    if (currentPhaseIndex < campaignPhases.length - 1) {
        alert(`🏆 Você passou da Fase ${currentPhaseIndex + 1}!\nClique para ir para a próxima fase.`);
        currentPhaseIndex++;
        loadPhase(currentPhaseIndex);
    } else {
        // Chegou ao fim de todas as fases
        alert(`🎉 CAMPANHA CONCLUÍDA, ${currentPlayerName}!\nSua pontuação total final foi de ${totalAccumulatedMoves} movimentos.`);
        saveToRanking();
        
        // Retorna para a tela de login para uma nova rodada se quiser
        loginScreen.classList.remove('hidden');
        mainGameContainer.classList.add('hidden');
        usernameInput.value = "";
    }
}

function saveToRanking() {
    const record = {
        name: currentPlayerName,
        score: totalAccumulatedMoves,
        date: new Date().toLocaleDateString('pt-BR')
    };
    
    let ranking = JSON.parse(localStorage.getItem('arcade_campaign_ranking')) || [];
    ranking.push(record);
    
    // Organiza do menor número de movimentos para o maior
    ranking.sort((a, b) => a.score - b.score);
    ranking = ranking.slice(0, 5); // Mantém o Top 5
    
    localStorage.setItem('arcade_campaign_ranking', JSON.stringify(ranking));
    renderRanking();
}

function renderRanking() {
    const rankingBody = document.getElementById('ranking-body');
    const ranking = JSON.parse(localStorage.getItem('arcade_campaign_ranking')) || [];
    
    rankingBody.innerHTML = ranking.length === 0 
        ? `<tr><td colspan="4" style="text-align:center;">Nenhum recorde registrado. Seja o pioneiro!</td></tr>`
        : ranking.map((player, index) => `
            <tr>
                <td>${index + 1}º</td>
                <td><strong>${player.name}</strong></td>
                <td>${player.score} mvs</td>
                <td>${player.date}</td>
            </tr>
          `).join('');
}