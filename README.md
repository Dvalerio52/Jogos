# 🕹️ Arcade Hub - Desenvolvido com Foco em QA & Engenharia de Software

Bem-vindo ao repositório do meu ecossistema de jogos clássicos! Este projeto foi desenvolvido utilizando tecnologias web nativas para demonstrar na prática conceitos avançados de lógica de programação, arquitetura de software e engenharia de qualidade (QA).

## 🚀 Como Jogar (Acesso Rápido)

Os jogos estão hospedados e prontos para rodar direto no seu navegador. Escolha um e desafie o placar de líderes:

*   🧠 **Jogo da Memória:** [Acessar Jogo](https://dvalerio52.github.io/Jogos/)
*   🧱 **Retro Tetris Arcade:** [Acessar Jogo](https://dvalerio52.github.io/Jogos/tetris/)
*   🟡 **Pac-Man Clássico:** [Acessar Jogo](https://dvalerio52.github.io/Jogos/pac-man/)

---

## 🛠️ Tecnologias Utilizadas

*   **HTML5** (Estruturação e Canvas API)
*   **CSS3** (Estilização Retro e Design Responsivo)
*   **JavaScript Vanilla** (Lógica de Programação, Game Loops e Manipulação de Estados)

---

## 🔍 Engenharia de Qualidade & Desafios Técnicos

Mais do que apenas programar as mecânicas, cada aplicação foi desenvolvida sob a ótica de um **QA Engineer**, mapeando cenários críticos, fluxos de exceção e garantindo a estabilidade do produto final.

### 🧠 Jogo da Memória (Memory Match)
*   **Desafio Dev:** Controle de estados dinâmicos para gerenciar cartas viradas, combinadas e bloqueio temporário de cliques concorrentes.
*   **Abordagem de QA:** Validação de fluxos de exceção (como impedir que o sistema valide um acerto se o usuário clicar duas vezes seguidas na mesma carta) e testes de regressão para reiniciar o tabuleiro mantendo a aleatoriedade.

### 🧱 Retro Tetris Arcade
*   **Desafio Dev:** Manipulação de matrizes bidimensionais dinâmicas para renderização da grade de blocos e controle preciso do Game Loop com `requestAnimationFrame`.
*   **Abordagem de QA:** Validação da curva de dificuldade progressiva baseada na pontuação (*Difficulty Curve*) para garantir o balanceamento do jogo, além de testes de colisão milimétricos nos limites das paredes durante a rotação das peças.

### 🟡 Pac-Man Clássico (Fidelidade Original)
*   **Desafio Dev:** Renderização de mapa baseada na geometria clássica do fliperama de 1980, algoritmo de movimentação por eixos para a inteligência artificial dos fantasmas e implementação do túnel de teletransporte lateral.
*   **Abordagem de QA:** Mapeamento de múltiplos cenários de colisão física (*Boundary Testing*), gerenciamento de estados globais (ativação e temporização do Modo Pânico ao consumir as pastilhas grandes) e validação matemática da pontuação multiplicadora exponencial.

---

## ✨ Diferenciais de Produto Implementados

*   **Persistência de Dados:** Integração com o `localStorage` do navegador para manter um sistema de Ranking local funcional com os maiores recordes salvos.
*   **Acessibilidade e Responsividade:** Controles virtuais em formato de cruz mapeados por toque para excelente jogabilidade em dispositivos móveis, em paralelo ao suporte nativo de teclado (setas direcionais) para desktops.
*   **Tratamento de Edge Cases:** Prevenção de falhas e bugs de concorrência em inputs rápidos de mudança de direção.

---

## 📁 Como Rodar o Projeto Localmente

Se quiser clonar o repositório para analisar a estrutura do código:

```bash
# Clone o repositório
git clone [https://github.com/Dvalerio52/Jogos.git](https://github.com/Dvalerio52/Jogos.git)

# Entre na pasta do projeto
cd Jogos

# Abra o arquivo index.html no seu navegador de preferência