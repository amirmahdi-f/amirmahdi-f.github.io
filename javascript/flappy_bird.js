class FlappyBirdGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.running = false;
        this.animationId = null;

        this.background = new Image();
        this.birdImage = new Image();
        this.pipeTopImage = new Image();
        this.pipeBottomImage = new Image();

        this.background.src = "images/flappy-background.png";
        this.birdImage.src = "images/flappy-bird.png";
        this.pipeTopImage.src = "images/flappy-pipe-top.png";
        this.pipeBottomImage.src = "images/flappy-pipe-bottom.png";

        this.bird = {
            x: 160,
            y: 250,
            width: 46,
            height: 34,
            velocity: 0,
            rotation: 0
        };

        this.gravity = 0.42;
        this.jumpStrength = -7.2;

        this.pipe = {
            x: canvas.width + 80,
            width: 80,
            gap: 175,
            gapY: 250
        };

        this.score = 0;
        this.pipeSpeed = 4;
        this.groundHeight = 75;

        this.reset();
    }

    reset() {
        this.stop();

        this.bird = {
            x: Math.min(160, this.canvas.width * 0.25),
            y: this.canvas.height * 0.42,
            width: 46,
            height: 34,
            velocity: 0,
            rotation: 0
        };

        this.pipe = {
            x: this.canvas.width + 80,
            width: 80,
            gap: 175,
            gapY: this.randomGap()
        };

        this.score = 0;

        this.draw();
    }

    start() {
        if (this.running) return;

        this.running = true;
        this.loop();
    }

    stop() {
        this.running = false;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    flap() {
        if (!this.running) return;

        this.bird.velocity = this.jumpStrength;
    }

    randomGap() {
        const min = 150;

        const max =
            this.canvas.height -
            this.groundHeight -
            150;

        return min + Math.random() * (max - min);
    }

    loop() {
        if (!this.running) return;

        this.update();
        this.draw();

        this.animationId =
            requestAnimationFrame(() => this.loop());
    }

    update() {
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;

        this.bird.rotation = Math.max(
            -0.5,
            Math.min(
                1.2,
                this.bird.velocity * 0.08
            )
        );

        this.pipe.x -= this.pipeSpeed;

        if (this.pipe.x + this.pipe.width < 0) {
            this.pipe.x = this.canvas.width + 30;
            this.pipe.gapY = this.randomGap();
            this.score++;
        }

        const birdLeft =
            this.bird.x - this.bird.width / 2;

        const birdRight =
            this.bird.x + this.bird.width / 2;

        const birdTop =
            this.bird.y - this.bird.height / 2;

        const birdBottom =
            this.bird.y + this.bird.height / 2;

        const topLimit = 0;

        const bottomLimit =
            this.canvas.height -
            this.groundHeight;

        if (
            birdTop <= topLimit ||
            birdBottom >= bottomLimit
        ) {
            this.gameOver();
            return;
        }

        const pipeLeft = this.pipe.x;

        const pipeRight =
            this.pipe.x + this.pipe.width;

        const gapTop =
            this.pipe.gapY -
            this.pipe.gap / 2;

        const gapBottom =
            this.pipe.gapY +
            this.pipe.gap / 2;

        const touchingPipe =
            birdRight > pipeLeft &&
            birdLeft < pipeRight;

        const outsideGap =
            birdTop < gapTop ||
            birdBottom > gapBottom;

        if (touchingPipe && outsideGap) {
            this.gameOver();
        }
    }

    draw() {
        this.drawBackground();
        this.drawPipes();
        this.drawBird();
        this.drawScore();
    }

    drawBackground() {
        const ctx = this.ctx;

        if (
            this.background.complete &&
            this.background.naturalWidth > 0
        ) {
            ctx.drawImage(
                this.background,
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
        } else {
            ctx.fillStyle = "#70c5ce";

            ctx.fillRect(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
        }
    }

    drawPipes() {
    const ctx = this.ctx;

    const x = this.pipe.x;
    const width = this.pipe.width;

    const gapTop =
        this.pipe.gapY -
        this.pipe.gap / 2;

    const gapBottom =
        this.pipe.gapY +
        this.pipe.gap / 2;

    if (
        this.pipeTopImage.complete &&
        this.pipeTopImage.naturalWidth > 0
    ) {
        ctx.drawImage(
            this.pipeTopImage,
            x,
            0,
            width,
            gapTop
        );
    }

    if (
        this.pipeBottomImage.complete &&
        this.pipeBottomImage.naturalWidth > 0
    ) {
        ctx.drawImage(
            this.pipeBottomImage,
            x,
            gapBottom,
            width,
            this.canvas.height - gapBottom
        );
    }
}

    drawBird() {
        const ctx = this.ctx;

        ctx.save();

        ctx.translate(
            this.bird.x,
            this.bird.y
        );

        ctx.rotate(this.bird.rotation);

        if (
            this.birdImage.complete &&
            this.birdImage.naturalWidth > 0
        ) {
            ctx.drawImage(
                this.birdImage,
                -this.bird.width / 2,
                -this.bird.height / 2,
                this.bird.width,
                this.bird.height
            );
        }

        ctx.restore();
    }

    drawScore() {
        const ctx = this.ctx;

        ctx.font = "bold 44px Arial";
        ctx.textAlign = "center";
        ctx.lineWidth = 5;

        ctx.strokeStyle =
            "rgba(0,0,0,0.5)";

        ctx.strokeText(
            String(this.score),
            this.canvas.width / 2,
            65
        );

        ctx.fillStyle = "#ffffff";

        ctx.fillText(
            String(this.score),
            this.canvas.width / 2,
            65
        );

        ctx.textAlign = "start";
    }

    gameOver() {
        this.stop();

        if (
            typeof window.showGameOver ===
            "function"
        ) {
            window.showGameOver(
                "flappy",
                this.score
            );
        }
    }
}