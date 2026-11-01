/* ==========================================================================
   SUPER-APP VOICE COACH MODULE - voicecoach.js
   ========================================================================== */

window.VoiceCoachModule = (function() {
    let recognition = null;

    function init() {
        setupSpeechRecognition();
        populateSelectOptions();
        setupEventListeners();
    }

    function setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const spokenText = event.results[0][0].transcript.toLowerCase().trim();
                analyzeVoice(spokenText);
            };

            recognition.onerror = () => {
                showStatus(false, "خطا در دریافت صدا. مجدداً تلاش کنید.");
            };
        }
    }

    function populateSelectOptions() {
        const select = document.getElementById("voice-target-select");
        if (!select || !window.AppState.data) return;

        select.innerHTML = "";
        window.AppState.data.lessons.forEach(l => {
            l.vocab.forEach(v => {
                const opt = document.createElement("option");
                opt.value = JSON.stringify(v);
                opt.innerText = `${v.word} (${v.meaning})`;
                select.appendChild(opt);
            });
        });

        select.onchange = () => {
            const card = JSON.parse(select.value);
            document.getElementById("voice-target-text").innerText = card.word;
            document.getElementById("voice-target-phonetic").innerText = card.phonetic;
        };
    }

    function setupEventListeners() {
        const recordBtn = document.getElementById("btn-start-record");
        if (recordBtn) {
            recordBtn.onclick = () => {
                if (!recognition) {
                    alert("مرورگر شما از سیستم تشخیص صدا پشتیبانی نمی‌کند.");
                    return;
                }
                document.getElementById("recording-status").style.display = "block";
                document.getElementById("voice-feedback").style.display = "none";
                recognition.start();
            };
        }
    }

    function analyzeVoice(spoken) {
        document.getElementById("recording-status").style.display = "none";
        const target = document.getElementById("voice-target-text").innerText.toLowerCase().trim();

        document.getElementById("voice-feedback").style.display = "flex";
        document.getElementById("voice-recognized-text").innerText = `متن تشخیص داده شده: "${spoken}"`;

        if (spoken === target) {
            document.getElementById("voice-score-circle").innerText = "100%";
            document.getElementById("voice-score-circle").style.borderColor = "var(--accent-green)";
            document.getElementById("voice-msg").innerText = "تلفظ شما فوق‌العاده و ۱۰۰٪ صحیح است! عالی بود!";
            window.addXP(25);
            window.triggerConfetti();
        } else {
            document.getElementById("voice-score-circle").innerText = "50%";
            document.getElementById("voice-score-circle").style.borderColor = "var(--accent-gold)";
            document.getElementById("voice-msg").innerText = "تلفظ شما نزدیک بود، اما کاملاً دقیق نبود. دوباره تلاش کنید.";
        }
    }

    function showStatus(isRec, msg) {
        document.getElementById("recording-status").style.display = isRec ? "block" : "none";
    }

    return { init };
})();
