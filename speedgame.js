/* ==========================================================================
   SUPER-APP SPEED GAME & QUIZ MODULE - speedgame.js
   ========================================================================== */

window.SpeedGameModule = (function() {
    let timer = 60;
    let score = 0;
    let interval = null;
    let currentQuestion = null;

    function init() {
        setupEventListeners();
    }

    function setupEventListeners() {
        const startBtn = document.getElementById("btn-start-speed-game");
        if (startBtn) {
            startBtn.onclick = startGame;
        }
    }

    function startGame() {
        timer = 60;
        score = 0;
        updateScoreUI();

        document.getElementById("speed-start-screen").style.display = "none";
        document.getElementById("speed-play-screen").style.display = "block";

        interval = setInterval(() => {
            timer--;
            document.getElementById("speed-timer").innerText = timer;
            if (timer <= 0) {
                endGame();
            }
        }, 1000);

        nextQuestion();
    }

    function nextQuestion() {
        if (!window.AppState.data) return;
        const allVocab = [];
        window.AppState.data.lessons.forEach(l => allVocab.push(...l.vocab));

        currentQuestion = allVocab[Math.floor(Math.random() * allVocab.length)];
        document.getElementById("speed-question-word").innerText = currentQuestion.word;

        // Generate 4 Options
        const options = [currentQuestion.meaning];
        while (options.length < 4) {
            const rand = allVocab[Math.floor(Math.random() * allVocab.length)].meaning;
            if (!options.includes(rand)) options.push(rand);
        }

        // Shuffle
        options.sort(() => Math.random() - 0.5);

        const container = document.getElementById("speed-options-container");
        container.innerHTML = "";

        options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "btn-primary-glow";
            btn.style.width = "100%";
            btn.style.margin = "0.5rem 0";
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(opt === currentQuestion.meaning);
            container.appendChild(btn);
        });
    }

    function checkAnswer(isCorrect) {
        if (isCorrect) {
            score += 10;
            window.addXP(10);
            updateScoreUI();
        }
        nextQuestion();
    }

    function updateScoreUI() {
        document.getElementById("speed-score-val").innerText = score;
    }

    function endGame() {
        clearInterval(interval);
        window.triggerConfetti();
        alert(`زمان تمام شد! امتیاز نهایی شما: ${score}`);
        document.getElementById("speed-start-screen").style.display = "block";
        document.getElementById("speed-play-screen").style.display = "none";
    }

    return { init };
})();
