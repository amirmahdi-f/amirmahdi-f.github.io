const body = document.body;
const header = document.getElementById("siteHeader");
const themeToggle = document.getElementById("themeToggle");
const languageToggle = document.getElementById("languageToggle");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");
const typingText = document.getElementById("typingText");
const canvas = document.getElementById("gameCanvas");
const overlay = document.getElementById("gameMessage");
const gameTitle = document.getElementById("gameTitle");
const gameInstruction = document.getElementById("gameInstruction");
const startGame = document.getElementById("startGame");
const toast = document.getElementById("toast");

let language = localStorage.getItem("language") || "fa";
let theme = localStorage.getItem("theme") || "dark";

let currentGame = "snake";
let snakeGame = null;
let flappyGame = null;
let game2048 = null;
let gameStarted = false;

function setTheme() {
    if (theme === "light") {
        body.classList.add("light");
        themeToggle.textContent = "☾";
    } else {
        body.classList.remove("light");
        themeToggle.textContent = "☀";
    }
}

function applyLanguage() {
    body.dir = language === "fa" ? "rtl" : "ltr";
    body.lang = language;

    languageToggle.textContent = language === "fa" ? "EN" : "فا";

    document.querySelectorAll("[data-fa][data-en]").forEach(element => {
        element.textContent = element.dataset[language];
    });

    updateGameTexts();
}

function updateGameTexts() {
    if (!gameTitle || !gameInstruction) return;

    if (currentGame === "snake") {
        gameTitle.textContent = "Snake";
        gameInstruction.textContent = language === "fa"
            ? "با کلیدهای جهت‌دار یا لمس صفحه بازی کن"
            : "Use arrow keys or touch controls";
    } else if (currentGame === "flappy") {
        gameTitle.textContent = "Flappy Bird";
        gameInstruction.textContent = language === "fa"
            ? "با Space یا لمس صفحه پرواز کن"
            : "Press Space or tap to fly";
    } else if (currentGame === "2048") {
        gameTitle.textContent = "2048";
        gameInstruction.textContent = language === "fa"
            ? "با کلیدهای جهت‌دار یا کشیدن انگشت بازی کن"
            : "Use arrow keys or swipe to play";
    }

    if (startGame) {
        startGame.textContent = language === "fa" ? "شروع بازی" : "Start Game";
    }
}

setTheme();
applyLanguage();

themeToggle.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", theme);
    setTheme();
});

languageToggle.addEventListener("click", () => {
    language = language === "fa" ? "en" : "fa";
    localStorage.setItem("language", language);
    applyLanguage();
});

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
    });
}

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
    });
});

window.addEventListener("scroll", () => {
    if (window.scrollY > 45) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

const phrases = {
    fa: ["Python Developer", "Backend Developer", "Machine Learning Engineer"],
    en: ["Python Developer", "Backend Developer", "Machine Learning Engineer"]
};

let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
    if (!typingText) return;
    const currentPhrase = phrases[language][phraseIndex];
    typingText.textContent = currentPhrase.substring(0, charIndex);

    if (!deleting) {
        if (charIndex < currentPhrase.length) {
            charIndex++;
        } else {
            deleting = true;
            setTimeout(typeLoop, 1200);
            return;
        }
    } else {
        if (charIndex > 0) {
            charIndex--;
        } else {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases[language].length;
        }
    }
    setTimeout(typeLoop, deleting ? 55 : 100);
}

typeLoop();

document.querySelectorAll(".skill-card").forEach(card => {
    const progress = card.dataset.progress;
    card.style.setProperty("--progress", progress);
});

const copyEmail = document.getElementById("copyEmail");
if (copyEmail) {
    copyEmail.addEventListener("click", async () => {
        const email = "amirmahdi.bot@gmail.com";
        try {
            await navigator.clipboard.writeText(email);
            showToast(language === "fa" ? "ایمیل کپی شد ✓" : "Email copied ✓");
        } catch {
            showToast(email);
        }
    });
}

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

const yearElement = document.getElementById("year");
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// تنظیم دقیق اندازه بوم بازی (Canvas)
function resizeCanvas() {
    if (!canvas) return;
    
    canvas.width = 900;
    canvas.height = 560;

    if (snakeGame && currentGame === "snake") snakeGame.draw();
    if (flappyGame && currentGame === "flappy") flappyGame.draw();
    if (game2048 && currentGame === "2048") game2048.draw();
}

window.addEventListener("resize", resizeCanvas);

function createGames() {
    if (!canvas) return;
    snakeGame = new SnakeGame(canvas);
    flappyGame = new FlappyBirdGame(canvas);
    game2048 = new Game2048(canvas);
}

createGames();
resizeCanvas();

function stopAllGames() {
    if (snakeGame) snakeGame.stop();
    if (flappyGame) flappyGame.stop();
    if (game2048) game2048.stop();
}

function startSelectedGame() {
    stopAllGames();
    if (overlay) overlay.classList.add("hidden");
    gameStarted = true;

    if (currentGame === "snake" && snakeGame) {
        snakeGame.reset();
        snakeGame.start();
    } else if (currentGame === "flappy" && flappyGame) {
        flappyGame.reset();
        flappyGame.start();
    } else if (currentGame === "2048" && game2048) {
        game2048.reset();
        game2048.start();
    }
}

if (startGame) {
    startGame.addEventListener("click", () => {
        startSelectedGame();
    });
}

window.showGameOver = function (game, score = 0) {
    gameStarted = false;
    stopAllGames();

    if (overlay) overlay.classList.remove("hidden");

    if (game === "snake") {
        gameTitle.textContent = language === "fa" ? "باختی! 🐍" : "Game Over! 🐍";
    } else if (game === "flappy") {
        gameTitle.textContent = language === "fa" ? "باختی! 🐦" : "Game Over! 🐦";
    } else if (game === "2048") {
        gameTitle.textContent = language === "fa" ? "باختی! 🧩" : "Game Over! 🧩";
    }

    gameInstruction.textContent = language === "fa"
        ? `امتیاز: ${score} — برای شروع دوباره روی دکمه بزن`
        : `Score: ${score} — Press the button to play again`;

    startGame.textContent = language === "fa" ? "دوباره بازی کن" : "Play Again";
};

// کنترل تغییر بازی‌ها با کلیک روی دکمه‌ها
document.querySelectorAll(".game-switch").forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        
        const targetGame = button.getAttribute("data-game");
        if (!targetGame) return;

        currentGame = targetGame;

        document.querySelectorAll(".game-switch").forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });

        stopAllGames();
        gameStarted = false;

        if (overlay) overlay.classList.remove("hidden");
        updateGameTexts();

        if (currentGame === "snake" && snakeGame) {
            snakeGame.reset();
            snakeGame.stop();
        } else if (currentGame === "flappy" && flappyGame) {
            flappyGame.reset();
            flappyGame.stop();
        } else if (currentGame === "2048" && game2048) {
            game2048.reset();
            game2048.stop();
        }
    });
});

// کنترل کلیدهای کیبورد
document.addEventListener("keydown", event => {
    if (!gameStarted) return;

    if (currentGame === "snake" && snakeGame) {
        if (["ArrowUp", "w", "W"].includes(event.key)) { event.preventDefault(); snakeGame.changeDirection("up"); }
        if (["ArrowDown", "s", "S"].includes(event.key)) { event.preventDefault(); snakeGame.changeDirection("down"); }
        if (["ArrowLeft", "a", "A"].includes(event.key)) { event.preventDefault(); snakeGame.changeDirection("left"); }
        if (["ArrowRight", "d", "D"].includes(event.key)) { event.preventDefault(); snakeGame.changeDirection("right"); }
        if (event.key.toLowerCase() === "p") { event.preventDefault(); snakeGame.pause(); }
    } else if (currentGame === "flappy" && flappyGame) {
        if (event.code === "Space" || event.key === "ArrowUp") {
            event.preventDefault();
            flappyGame.flap();
        }
    } else if (currentGame === "2048" && game2048) {
        if (["ArrowUp", "w", "W"].includes(event.key)) { event.preventDefault(); game2048.move("up"); }
        if (["ArrowDown", "s", "S"].includes(event.key)) { event.preventDefault(); game2048.move("down"); }
        if (["ArrowLeft", "a", "A"].includes(event.key)) { event.preventDefault(); game2048.move("left"); }
        if (["ArrowRight", "d", "D"].includes(event.key)) { event.preventDefault(); game2048.move("right"); }
    }
});

// کنترل‌های لمسی
if (canvas) {
    canvas.addEventListener("pointerdown", event => {
        if (!gameStarted) return;

        if (currentGame === "flappy" && flappyGame) {
            flappyGame.flap();
        } else if (currentGame === "snake" && snakeGame) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const dx = x - centerX;
            const dy = y - centerY;

            if (Math.abs(dx) > Math.abs(dy)) {
                snakeGame.changeDirection(dx > 0 ? "right" : "left");
            } else {
                snakeGame.changeDirection(dy > 0 ? "down" : "up");
            }
        }
    });
}

let touchStartX = 0;
let touchStartY = 0;

if (canvas) {
    canvas.addEventListener("touchstart", event => {
        if (currentGame !== "2048" || !gameStarted) return;
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    canvas.addEventListener("touchend", event => {
        if (currentGame !== "2048" || !gameStarted || !game2048) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) < 30) return;

        if (absX > absY) {
            game2048.move(dx > 0 ? "right" : "left");
        } else {
            game2048.move(dy > 0 ? "down" : "up");
        }
    }, { passive: true });
}

// وضعیت اولیه بوم
stopAllGames();
if (overlay) overlay.classList.remove("hidden");
updateGameTexts();