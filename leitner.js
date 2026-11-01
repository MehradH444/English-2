/* ==========================================================================
   SUPER-APP LEITNER SYSTEM MODULE - leitner.js
   ========================================================================== */

window.LeitnerModule = (function() {
    let currentCardIndex = 0;
    let deck = [];

    function init() {
        setupDeck();
        renderBoxesBar();
        renderCurrentCard();
        setupEventListeners();
    }

    function setupDeck() {
        if (!window.AppState.data) return;
        
        let saved = JSON.parse(localStorage.getItem("p3_leitner_deck"));
        if (!saved || saved.length === 0) {
            deck = [];
            window.AppState.data.lessons.forEach(l => {
                l.vocab.forEach(v => {
                    deck.push({ ...v, box: 1 });
                });
            });
            saveDeck();
        } else {
            deck = saved;
        }
    }

    function saveDeck() {
        localStorage.setItem("p3_leitner_deck", JSON.stringify(deck));
    }

    function renderBoxesBar() {
        const bar = document.getElementById("leitner-boxes-bar");
        if (!bar) return;

        const counts = [0, 0, 0, 0, 0];
        deck.forEach(c => {
            if (c.box >= 1 && c.box <= 5) counts[c.box - 1]++;
        });

        bar.innerHTML = counts.map((count, idx) => `
            <div class="leitner-box-stat">
                <h4>جعبه ${idx + 1}</h4>
                <span>${count}</span>
            </div>
        `).join('');
    }

    function renderCurrentCard() {
        const cardElem = document.getElementById("leitner-card");
        if (!cardElem || deck.length === 0) return;

        cardElem.classList.remove("flipped");

        const card = deck[currentCardIndex];
        document.getElementById("leitner-pos-tag").innerText = card.pos;
        document.getElementById("leitner-word-en").innerText = card.word;
        document.getElementById("leitner-phonetic").innerText = card.phonetic;
        document.getElementById("leitner-word-fa").innerText = card.meaning;
        document.getElementById("leitner-example").innerText = card.example;
        document.getElementById("leitner-example-fa").innerText = card.example_fa;

        const audioBtn = document.getElementById("leitner-audio-btn");
        audioBtn.onclick = (e) => {
            e.stopPropagation();
            window.speakText(card.word);
        };
    }

    function setupEventListeners() {
        const cardElem = document.getElementById("leitner-card");
        if (cardElem) {
            cardElem.onclick = () => cardElem.classList.toggle("flipped");
        }

        const wrongBtn = document.getElementById("leitner-btn-wrong");
        const correctBtn = document.getElementById("leitner-btn-correct");

        if (wrongBtn) {
            wrongBtn.onclick = () => handleAnswer(false);
        }
        if (correctBtn) {
            correctBtn.onclick = () => handleAnswer(true);
        }
    }

    function handleAnswer(isCorrect) {
        if (deck.length === 0) return;

        const card = deck[currentCardIndex];
        if (isCorrect) {
            if (card.box < 5) card.box++;
            window.addXP(15);
        } else {
            card.box = 1; // Return to Box 1
            // Add to Mistake Vault
            if (window.AppState) {
                window.AppState.mistakes.push(card);
                localStorage.setItem("p3_mistakes", JSON.stringify(window.AppState.mistakes));
            }
        }

        saveDeck();
        renderBoxesBar();

        currentCardIndex = (currentCardIndex + 1) % deck.length;
        renderCurrentCard();
    }

    return { init };
})();
