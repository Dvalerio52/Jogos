// Banco de dados dinâmico de atualidades (pode atualizar as notícias quando quiser)
const newsData = [
    { id: 1, content: "Exploração de Marte 🚀" },
    { id: 2, content: "Nova IA Avançada 🤖" },
    { id: 3, content: "Crise Climática Global 🌍" },
    { id: 4, content: "Olimpíadas / Esportes 🏆" },
    { id: 5, content: "Fusão Nuclear Comercial ⚡" },
    { id: 6, content: "Avanço na Medicina Genética 🧬" }
];

// Duplicar os dados para criar os pares do jogo da memória
let cardsArray = [...newsData, ...newsData];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let attempts = 0;
let matches = 0;

const grid = document.getElementById('game-grid');
const attemptsEl = document.getElementById('attempts');
const matchesEl = document.getElementById('matches');
const resetBtn = document.getElementById('reset-btn');

// Função para embaralhar as cartas (Algoritmo Fisher-Yates)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Inicializar e renderizar o tabuleiro
function createBoard() {
    grid.innerHTML = "";
    shuffle(cardsArray);
    
    cardsArray.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = item.id;

        card.innerHTML = `
            <div class="card-back"></div>
            <div class="card-front">${item.content}</div>
        `;

        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

// Virar a carta
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

// Verificar se as duas cartas viradas são iguais
function checkForMatch() {
    attempts++;
    attemptsEl.textContent = attempts;

    let isMatch = firstCard.dataset.id === secondCard.dataset.id;
    isMatch ? disableCards() : unflipCards();
}

// Se forem iguais, mantém viradas e desabilita o clique nelas
function disableCards() {
    matches++;
    matchesEl.textContent = matches;
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    resetTurn();

    if (matches === newsData.length) {
        setTimeout(() => alert(`Parabéns! Você detonou no Arcade de Atualidades em ${attempts} tentativas!`), 500);
    }
}

// Se não forem iguais, desvira após um breve intervalo
function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetTurn();
    }, 1000);
}

function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

// Reiniciar o jogo do zero
function resetGame() {
    attempts = 0;
    matches = 0;
    attemptsEl.textContent = attempts;
    matchesEl.textContent = matches;
    resetTurn();
    createBoard();
}

resetBtn.addEventListener('click', resetGame);

// Inicia o jogo ao carregar a página
createBoard();