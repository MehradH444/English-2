/* ==========================================================================
   SUPER-APP MAIN ENGINE (PROSPECT 3) - app.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. App State & Persistent Data Setup
    window.AppState = {
        data: null,
        xp: parseInt(localStorage.getItem("p3_xp")) || 0,
        level: parseInt(localStorage.getItem("p3_level")) || 1,
        activeTheme: localStorage.getItem("p3_theme") || "cyberpunk",
        activeView: "view-lessons",
        mistakes: JSON.parse(localStorage.getItem("p3_mistakes")) || [],
        leitnerCards: JSON.parse(localStorage.getItem("p3_leitner")) || []
    };

    // 2. Initialize Canvas Engines
    initParticleCanvas();
    initThemeSystem();
    initNavigation();
    
    // 3. Load Master Data JSON
    fetchData();
});

// Fetch Data JSON
async function fetchData() {
    try {
        const response = await fetch("data.json");
        window.AppState.data = await response.json();
        
        // Initialize Modules
        renderLessonsUI();
        renderGrammarUI();
        renderIrregularVerbsUI();
        renderSynAntUI();
        renderGoldenTipsUI();
        
        if (window.LeitnerModule) window.LeitnerModule.init();
        if (window.VoiceCoachModule) window.VoiceCoachModule.init();
        if (window.SpeedGameModule) window.SpeedGameModule.init();
        if (window.AdminDashboardModule) window.AdminDashboardModule.init();

        updateGamificationUI();
    } catch (err) {
        console.error("Error loading database:", err);
    }
}

// Gamification System (XP & Levels)
window.addXP = function(amount) {
    window.AppState.xp += amount;
    const nextLevelXP = window.AppState.level * 100;
    
    if (window.AppState.xp >= nextLevelXP) {
        window.AppState.level++;
        triggerConfetti();
        alert(`تبریک! شما به سطح ${window.AppState.level} ارتقا یافتید! 🎉`);
    }

    localStorage.setItem("p3_xp", window.AppState.xp);
    localStorage.setItem("p3_level", window.AppState.level);
    updateGamificationUI();
};

function updateGamificationUI() {
    const levelBadge = document.getElementById("user-level-badge");
    const xpFill = document.getElementById("xp-bar-fill");
    const xpText = document.getElementById("xp-text-display");

    const currentLevelMax = window.AppState.level * 100;
    const progressPercent = Math.min((window.AppState.xp / currentLevelMax) * 100, 100);

    if (levelBadge) levelBadge.innerText = `سطح ${window.AppState.level}: دانش‌پژوه`;
    if (xpFill) xpFill.style.width = `${progressPercent}%`;
    if (xpText) xpText.innerText = `${window.AppState.xp} / ${currentLevelMax} XP`;
}

// Native Speech Synthesis Engine
window.speakText = function(text) {
    if (!('speechSynthesis' in window)) {
        alert("مرورگر شما از قابلیت تلفظ صوتی پشتیبانی نمی‌کند.");
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;

    const equalizer = document.getElementById("audio-equalizer");
    if (equalizer) equalizer.style.display = "flex";

    utterance.onend = () => {
        if (equalizer) equalizer.style.display = "none";
    };

    window.speechSynthesis.speak(utterance);
};

// Navigation Handling
function initNavigation() {
    const navItems = document.querySelectorAll(".nav-menu li");
    const viewSections = document.querySelectorAll(".view-section");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetView = item.getAttribute("data-view");

            navItems.forEach(li => li.classList.remove("active"));
            item.classList.add("active");

            viewSections.forEach(sec => {
                if (sec.id === targetView) {
                    sec.classList.add("active");
                } else {
                    sec.classList.remove("active");
                }
            });

            // Mobile Auto Close Sidebar
            document.getElementById("sidebar").classList.remove("open");
        });
    });

    const toggleBtn = document.getElementById("sidebar-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("open");
        });
    }
}

// Theme Switcher System
function initThemeSystem() {
    const themeBtns = document.querySelectorAll(".theme-btn");
    document.body.className = `theme-${window.AppState.activeTheme}`;

    themeBtns.forEach(btn => {
        if (btn.getAttribute("data-theme") === window.AppState.activeTheme) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }

        btn.addEventListener("click", () => {
            const theme = btn.getAttribute("data-theme");
            themeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            document.body.className = `theme-${theme}`;
            window.AppState.activeTheme = theme;
            localStorage.setItem("p3_theme", theme);
        });
    });
}

// Interactive Particle Canvas Background Engine
function initParticleCanvas() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    for (let i = 0; i < 40; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(0, 243, 255, 0.3)";

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// Confetti Fireworks FX Engine
window.triggerConfetti = function() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ["#00f3ff", "#ff007f", "#ffb703", "#00f5d4"];

    for (let i = 0; i < 100; i++) {
        pieces.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12 - 4,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 100
        });
    }

    function renderConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        pieces.forEach(p => {
            if (p.life > 0) {
                active = true;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity
                p.life--;

                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        });

        if (active) requestAnimationFrame(renderConfetti);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    renderConfetti();
};

// UI Render Helpers
function renderLessonsUI() {
    const tabsContainer = document.getElementById("lesson-tabs");
    const contentArea = document.getElementById("lesson-content-area");
    if (!tabsContainer || !contentArea) return;

    tabsContainer.innerHTML = "";
    window.AppState.data.lessons.forEach((lesson, index) => {
        const btn = document.createElement("button");
        btn.className = `lesson-tab-btn ${index === 0 ? "active" : ""}`;
        btn.innerText = lesson.title;
        btn.onclick = () => {
            document.querySelectorAll(".lesson-tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            displayLessonDetail(lesson);
        };
        tabsContainer.appendChild(btn);
    });

    displayLessonDetail(window.AppState.data.lessons[0]);
}

function displayLessonDetail(lesson) {
    const contentArea = document.getElementById("lesson-content-area");
    contentArea.innerHTML = `
        <div class="table-responsive-card">
            <h3><i class="fa-solid fa-book-reader"></i> ${lesson.title} - متن کامل درسی</h3>
            <p style="margin: 1rem 0; font-size: 1.1rem; line-height: 1.8;">${lesson.reading_en}</p>
            <button class="btn-primary-glow" onclick="speakText('${lesson.reading_en.replace(/'/g, "\\'")}')">
                <i class="fa-solid fa-volume-high"></i> گوش دادن به متن کامل
            </button>
            <hr style="margin: 1.5rem 0; border-color: var(--border-glass);">
            <h4>ترجمه خط‌به‌خط فارسی:</h4>
            <p style="color: var(--text-secondary); line-height: 1.8; margin-top: 0.5rem;">${lesson.reading_fa}</p>
        </div>

        <div class="table-responsive-card">
            <h3><i class="fa-solid fa-spell-check"></i> واژگان ریزبه‌ریز همراه با تلفظ و نقش دستوری</h3>
            <table class="custom-table" style="margin-top: 1rem;">
                <thead>
                    <tr>
                        <th>واژه</th>
                        <th>فونتیک</th>
                        <th>نقش (POS)</th>
                        <th>معنی</th>
                        <th>تلفظ</th>
                    </tr>
                </thead>
                <tbody>
                    ${lesson.vocab.map(v => `
                        <tr>
                            <td><strong>${v.word}</strong></td>
                            <td>${v.phonetic}</td>
                            <td><span class="card-tag">${v.pos}</span></td>
                            <td>${v.meaning}</td>
                            <td>
                                <button class="btn-audio-small" onclick="speakText('${v.word}')">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderGrammarUI() {
    const area = document.getElementById("grammar-content-area");
    if (!area) return;
    area.innerHTML = window.AppState.data.grammar.map(g => `
        <div class="table-responsive-card">
            <h3><i class="fa-solid fa-code-branch"></i> ${g.title}</h3>
            <p style="margin: 0.75rem 0; font-weight: 500;">${g.rule}</p>
            <ul style="padding-right: 1.25rem; color: var(--accent-cyan);">
                ${g.examples.map(ex => `<li>${ex}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

function renderIrregularVerbsUI() {
    const tbody = document.getElementById("irregular-verbs-tbody");
    if (!tbody) return;
    tbody.innerHTML = window.AppState.data.irregular_verbs.map(v => `
        <tr>
            <td><strong>${v.base}</strong></td>
            <td>${v.past}</td>
            <td>${v.pp}</td>
            <td>${v.meaning}</td>
            <td>
                <button class="btn-audio-small" onclick="speakText('${v.base}, ${v.past}')">
                    <i class="fa-solid fa-volume-high"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderSynAntUI() {
    const tbody = document.getElementById("syn-ant-tbody");
    if (!tbody) return;
    tbody.innerHTML = window.AppState.data.synonyms_antonyms.map(s => `
        <tr>
            <td><strong>${s.word}</strong></td>
            <td style="color: var(--accent-green);">${s.synonym}</td>
            <td style="color: var(--accent-magenta);">${s.antonym}</td>
            <td>${s.meaning}</td>
        </tr>
    `).join('');
}

function renderGoldenTipsUI() {
    const area = document.getElementById("golden-tips-container");
    if (!area) return;
    area.innerHTML = window.AppState.data.golden_tips.map(t => `
        <div class="table-responsive-card">
            <h3 style="color: var(--accent-gold);"><i class="fa-solid fa-star"></i> ${t.title}</h3>
            <p style="margin-top: 0.75rem; line-height: 1.7;">${t.content}</p>
        </div>
    `).join('');
}
