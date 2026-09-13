class SnakeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.cols = 25;
        this.rows = 18;

        this.snake = [];
        this.food = null;

        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };

        this.running = false;
        this.paused = false;

        this.animationId = null;
        this.lastTime = 0;

        this.score = 0;
        this.highScore =
            Number(localStorage.getItem("snakeHighScore")) || 0;

        this.speed = 125;
        this.minSpeed = 55;

        this.foodPulse = 0;
        this.foodParticles = [];
        this.eatAnimation = 0;

        this.reset();
    }

    reset() {
        this.stop();

        this.running = false;
        this.paused = false;

        this.score = 0;
        this.speed = 125;

        this.snake = [
            { x: 12, y: 9 },
            { x: 11, y: 9 },
            { x: 10, y: 9 },
            { x: 9, y: 9 }
        ];

        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };

        this.foodParticles = [];
        this.eatAnimation = 0;

        this.createFood();
        this.draw();
    }

    start() {
        if (this.running) return;

        this.running = true;
        this.paused = false;
        this.lastTime = performance.now();

        this.animationId =
            requestAnimationFrame(
                time => this.loop(time)
            );
    }

    stop() {
        this.running = false;
        this.paused = false;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    pause() {
        if (!this.running) return;

        this.paused = !this.paused;

        if (!this.paused) {
            this.lastTime = performance.now();

            this.animationId =
                requestAnimationFrame(
                    time => this.loop(time)
                );
        }

        this.draw();
    }

    changeDirection(direction) {
        if (!this.running || this.paused) return;

        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };

        const newDirection =
            directions[direction];

        if (!newDirection) return;

        if (
            newDirection.x === -this.direction.x &&
            newDirection.y === -this.direction.y
        ) {
            return;
        }

        this.nextDirection = newDirection;
    }

    loop(time) {
        if (!this.running) return;

        if (this.paused) {
            this.draw();

            this.animationId =
                requestAnimationFrame(
                    currentTime => this.loop(currentTime)
                );

            return;
        }

        const delta =
            time - this.lastTime;

        if (delta >= this.speed) {
            this.update();
            this.lastTime = time;
        }

        this.animate(delta);
        this.draw();

        this.animationId =
            requestAnimationFrame(
                currentTime => this.loop(currentTime)
            );
    }

    update() {
        this.direction = this.nextDirection;

        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        if (
            head.x < 0 ||
            head.x >= this.cols ||
            head.y < 0 ||
            head.y >= this.rows
        ) {
            this.gameOver();
            return;
        }

        const eating =
            head.x === this.food.x &&
            head.y === this.food.y;

        const bodyToCheck =
            eating
                ? this.snake
                : this.snake.slice(0, -1);

        const collision =
            bodyToCheck.some(
                part =>
                    part.x === head.x &&
                    part.y === head.y
            );

        if (collision) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        if (eating) {
            this.score++;

            if (this.score > this.highScore) {
                this.highScore = this.score;

                localStorage.setItem(
                    "snakeHighScore",
                    this.highScore
                );
            }

            this.speed =
                Math.max(
                    this.minSpeed,
                    125 - this.score * 3
                );

            this.eatAnimation = 1;

            this.createParticles();
            this.createFood();
        } else {
            this.snake.pop();
        }
    }

    animate(delta) {
        this.foodPulse += delta * 0.006;

        if (this.eatAnimation > 0) {
            this.eatAnimation -= delta * 0.006;
        }

        this.foodParticles =
            this.foodParticles.filter(
                particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.015;
                    particle.life -= delta * 0.002;

                    return particle.life > 0;
                }
            );
    }

    createFood() {
        let valid = false;

        while (!valid) {
            this.food = {
                x: Math.floor(
                    Math.random() * this.cols
                ),
                y: Math.floor(
                    Math.random() * this.rows
                )
            };

            valid =
                !this.snake.some(
                    part =>
                        part.x === this.food.x &&
                        part.y === this.food.y
                );
        }
    }

    createParticles() {
        if (!this.food) return;

        for (let i = 0; i < 16; i++) {
            const angle =
                Math.random() * Math.PI * 2;

            const speed =
                1 + Math.random() * 2.5;

            this.foodParticles.push({
                x: this.food.x + 0.5,
                y: this.food.y + 0.5,
                vx:
                    Math.cos(angle) *
                    speed *
                    0.025,
                vy:
                    Math.sin(angle) *
                    speed *
                    0.025,
                life: 1
            });
        }
    }

    draw() {
        this.drawBackground();
        this.drawGrid();
        this.drawFood();
        this.drawSnake();
        this.drawParticles();

        if (this.paused) {
            this.drawPause();
        }
    }

    drawBackground() {
        const ctx = this.ctx;

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                this.canvas.height
            );

        gradient.addColorStop(
            0,
            "#080d1b"
        );

        gradient.addColorStop(
            1,
            "#11182b"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }

    drawGrid() {
        const ctx = this.ctx;

        const cellWidth =
            this.canvas.width / this.cols;

        const cellHeight =
            this.canvas.height / this.rows;

        ctx.strokeStyle =
            "rgba(255,255,255,0.035)";

        ctx.lineWidth = 1;

        for (let x = 0; x <= this.cols; x++) {
            ctx.beginPath();

            ctx.moveTo(
                x * cellWidth,
                0
            );

            ctx.lineTo(
                x * cellWidth,
                this.canvas.height
            );

            ctx.stroke();
        }

        for (let y = 0; y <= this.rows; y++) {
            ctx.beginPath();

            ctx.moveTo(
                0,
                y * cellHeight
            );

            ctx.lineTo(
                this.canvas.width,
                y * cellHeight
            );

            ctx.stroke();
        }
    }

    drawFood() {
        if (!this.food) return;

        const ctx = this.ctx;

        const cellWidth =
            this.canvas.width / this.cols;

        const cellHeight =
            this.canvas.height / this.rows;

        const x =
            (this.food.x + 0.5) * cellWidth;

        const y =
            (this.food.y + 0.5) * cellHeight;

        const pulse =
            Math.sin(this.foodPulse) * 2;

        const radius =
            Math.min(
                cellWidth,
                cellHeight
            ) * 0.28 + pulse;

        ctx.save();

        ctx.shadowBlur = 25;
        ctx.shadowColor = "#ff4f81";

        const gradient =
            ctx.createRadialGradient(
                x - radius * 0.3,
                y - radius * 0.3,
                2,
                x,
                y,
                radius
            );

        gradient.addColorStop(
            0,
            "#ffffff"
        );

        gradient.addColorStop(
            0.2,
            "#ff9bb8"
        );

        gradient.addColorStop(
            0.6,
            "#ff4f81"
        );

        gradient.addColorStop(
            1,
            "#d9275f"
        );

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }

    drawSnake() {
        const ctx = this.ctx;

        const cellWidth =
            this.canvas.width / this.cols;

        const cellHeight =
            this.canvas.height / this.rows;

        const size =
            Math.min(
                cellWidth,
                cellHeight
            );

        for (
            let i = this.snake.length - 1;
            i >= 0;
            i--
        ) {
            const part = this.snake[i];

            const isHead = i === 0;
            const isTail =
                i === this.snake.length - 1;

            const x =
                part.x * cellWidth;

            const y =
                part.y * cellHeight;

            const padding =
                isHead ? 2 : 3;

            const width =
                cellWidth - padding * 2;

            const height =
                cellHeight - padding * 2;

            const color =
                isHead
                    ? "#65e6ff"
                    : "#55cfff";

            ctx.save();

            ctx.shadowBlur =
                isHead ? 18 : 8;

            ctx.shadowColor = color;

            const gradient =
                ctx.createLinearGradient(
                    x,
                    y,
                    x + width,
                    y + height
                );

            gradient.addColorStop(
                0,
                color
            );

            gradient.addColorStop(
                1,
                isHead
                    ? "#8c7cff"
                    : "#4c55d9"
            );

            ctx.fillStyle = gradient;

            ctx.beginPath();

            const radius =
                Math.min(
                    size * 0.24,
                    9
                );

            ctx.roundRect(
                x + padding,
                y + padding,
                width,
                height,
                radius
            );

            ctx.fill();

            ctx.restore();

            if (isTail) {
                this.drawTail(
                    part,
                    cellWidth,
                    cellHeight
                );
            }

            if (isHead) {
                this.drawEyes(
                    part,
                    cellWidth,
                    cellHeight
                );
            }
        }
    }

    drawEyes(
        head,
        cellWidth,
        cellHeight
    ) {
        const ctx = this.ctx;

        const centerX =
            head.x * cellWidth +
            cellWidth / 2;

        const centerY =
            head.y * cellHeight +
            cellHeight / 2;

        const eyeOffset =
            Math.min(
                cellWidth,
                cellHeight
            ) * 0.22;

        let eye1X;
        let eye1Y;
        let eye2X;
        let eye2Y;

        if (this.direction.x !== 0) {
            eye1X =
                centerX +
                this.direction.x *
                eyeOffset;

            eye2X =
                centerX +
                this.direction.x *
                eyeOffset;

            eye1Y =
                centerY - eyeOffset;

            eye2Y =
                centerY + eyeOffset;
        } else {
            eye1X =
                centerX - eyeOffset;

            eye2X =
                centerX + eyeOffset;

            eye1Y =
                centerY +
                this.direction.y *
                eyeOffset;

            eye2Y =
                centerY +
                this.direction.y *
                eyeOffset;
        }

        const eyeRadius =
            Math.min(
                cellWidth,
                cellHeight
            ) * 0.095;

        ctx.fillStyle = "#ffffff";

        ctx.beginPath();

        ctx.arc(
            eye1X,
            eye1Y,
            eyeRadius,
            0,
            Math.PI * 2
        );

        ctx.arc(
            eye2X,
            eye2Y,
            eyeRadius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#111827";

        const pupilRadius =
            eyeRadius * 0.55;

        ctx.beginPath();

        ctx.arc(
            eye1X +
                this.direction.x *
                pupilRadius *
                0.4,
            eye1Y +
                this.direction.y *
                pupilRadius *
                0.4,
            pupilRadius,
            0,
            Math.PI * 2
        );

        ctx.arc(
            eye2X +
                this.direction.x *
                pupilRadius *
                0.4,
            eye2Y +
                this.direction.y *
                pupilRadius *
                0.4,
            pupilRadius,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    drawTail(
        tail,
        cellWidth,
        cellHeight
    ) {
        const ctx = this.ctx;

        const next =
            this.snake[
                this.snake.length - 2
            ];

        if (!next) return;

        const x =
            tail.x * cellWidth +
            cellWidth / 2;

        const y =
            tail.y * cellHeight +
            cellHeight / 2;

        const nextX =
            next.x * cellWidth +
            cellWidth / 2;

        const nextY =
            next.y * cellHeight +
            cellHeight / 2;

        const dx = x - nextX;
        const dy = y - nextY;

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (!length) return;

        const size =
            Math.min(
                cellWidth,
                cellHeight
            ) * 0.28;

        const tipX =
            x +
            (dx / length) *
            size;

        const tipY =
            y +
            (dy / length) *
            size;

        ctx.save();

        ctx.fillStyle = "#4d55d9";

        ctx.beginPath();

        ctx.moveTo(
            x - dy / length * size,
            y + dx / length * size
        );

        ctx.lineTo(
            x + dy / length * size,
            y - dx / length * size
        );

        ctx.lineTo(
            tipX,
            tipY
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }

    drawParticles() {
        const ctx = this.ctx;

        const cellWidth =
            this.canvas.width / this.cols;

        const cellHeight =
            this.canvas.height / this.rows;

        this.foodParticles.forEach(
            particle => {
                const x =
                    particle.x * cellWidth;

                const y =
                    particle.y * cellHeight;

                ctx.save();

                ctx.globalAlpha =
                    particle.life;

                ctx.fillStyle =
                    "#ff6f9a";

                ctx.shadowBlur = 10;
                ctx.shadowColor = "#ff4f81";

                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    3,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                ctx.restore();
            }
        );
    }

    drawPause() {
        const ctx = this.ctx;

        ctx.save();

        ctx.fillStyle =
            "rgba(5,8,18,0.62)";

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#ffffff";

        ctx.font =
            "bold 34px Arial";

        ctx.fillText(
            "PAUSED",
            this.canvas.width / 2,
            this.canvas.height / 2
        );

        ctx.font =
            "16px Arial";

        ctx.fillStyle =
            "rgba(255,255,255,0.7)";

        ctx.fillText(
            "Press P to continue",
            this.canvas.width / 2,
            this.canvas.height / 2 + 42
        );

        ctx.restore();
    }

    gameOver() {
        this.stop();

        if (
            typeof window.showGameOver ===
            "function"
        ) {
            window.showGameOver(
                "snake",
                this.score
            );
        }
    }
}