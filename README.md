# 🕹️ Central de Jogos Arcade - Portfólio

> Uma coleção de pequenos jogos interativos baseados em navegador (Web), desenvolvidos com foco em performance mobile, acessibilidade e código limpo.

🎨 **[CLIQUE AQUI PARA ACESSAR A CENTRAL DE JOGOS](https://Dvalerio52.github.io/Jogos/)**

---

## 📱 Jogos Inclusos

### 1. Notícias em Mente 🧠 (Jogo da Memória)
Um jogo da memória baseado em acontecimentos e fatos marcantes da atualidade. 
* **Foco:** Manipulação do DOM, responsividade e lógica de estados.
* **Link Direto:** [Jogar Notícias em Mente](https://Dvalerio52.github.io/Jogos/) *(Ajuste o caminho se tiver colocado em uma subpasta)*

---

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estruturação semântica e acessível da aplicação.
* **CSS3:** Estilização moderna com variáveis CSS (`:root`), Grid Layout dinâmico e animações 3D otimizadas via GPU (`transform: rotateY`).
* **JavaScript (Vanilla JS):** Lógica de programação pura, controle de fluxo e eventos de toque.

---

## 🧠 Diferenciais Técnicos e Otimizações

Como o foco do projeto é demonstrar boas práticas de engenharia de software e foco em qualidade (QA), foram aplicadas as seguintes soluções:

* **Algoritmo Fisher-Yates:** Utilizado no jogo da memória para garantir um embaralhamento puramente aleatório e performático das cartas a cada nova partida.
* **Otimização Mobile (UI/UX):** Implementação de bloqueio de zoom nativo via tag `viewport` e uso de `aspect-ratio` no CSS para evitar quebras de layout em telas de smartphones.
* **Prevenção de Race Conditions (Bugs de Clique):** Controle de fluxo com travas lógicas (`lockBoard`) no JavaScript, impedindo que cliques rápidos quebrem a validação e o estado do jogo.
* **Performance Gráfica:** Efeitos visuais de rotação executados via hardware (CSS) para garantir uma taxa de quadros estável (60 FPS) mesmo em dispositivos móveis antigos.

---

## 🚀 Como Executar Localmente

Como o repositório utiliza tecnologias web nativas, você não precisa instalar nenhuma dependência externa (como Node.js).

1. Clone este repositório:
   ```bash
   git clone [https://github.com/Dvalerio52/Jogos.git](https://github.com/Dvalerio52/Jogos.git)