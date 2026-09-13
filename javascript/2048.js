class Game2048 {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.size = 4;
        this.board = [];
        this.score = 0;
        this.best = Number(localStorage.getItem("2048Best")) || 0;

        this.running = false;
        this.gameOver = false;

        this.touchStartX = 0;
        this.touchStartY = 0;

        this.colors = {
            0: "#cdc1b4", 2: "#eee4da", 4: "#ede0c8", 8: "#f2b179",
            16: "#f59563", 32: "#f67c5f", 64: "#f65e3b", 128: "#edcf72",
            256: "#edcc61", 512: "#edc850", 1024: "#edc53f", 2048: "#edc22e"
        };

        this.textColors = {
            2: "#776e65", 4: "#776e65", 8: "#f9f6f2", 16: "#f9f6f2",
            32: "#f9f6f2", 64: "#f9f6f2", 128: "#f9f6f2", 256: "#f9f6f2",
            512: "#f9f6f2", 1024: "#f9f6f2", 2048: "#f9f6f2"
        };

        this.reset();
    }

    reset() {
        this.board = Array.from(
            { length: this.size },
            () => Array(this.size).fill(0)
        );

        this.score = 0;
        this.gameOver = false;
        this.running = false;

        this.addRandomTile();
        this.addRandomTile();

        this.draw();
    }

    start() {
        this.running = true;
        this.draw();
    }

    stop() {
        this.running = false;
    }

    addRandomTile() {
        const emptyCells = [];

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (!emptyCells.length) return;

        const position = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.board[position.row][position.col] = Math.random() < 0.9 ? 2 : 4;
    }

    move(direction) {
        if (!this.running || this.gameOver) return;

        const previous = JSON.stringify(this.board);

        if (direction === "left") this.moveLeft();
        if (direction === "right") this.moveRight();
        if (direction === "up") this.moveUp();
        if (direction === "down") this.moveDown();

        const current = JSON.stringify(this.board);

        if (previous !== current) {
            this.addRandomTile();

            if (this.score > this.best) {
                this.best = this.score;
                localStorage.setItem("2048Best", this.best);
            }

            this.draw();

            if (this.checkGameOver()) {
                this.endGame();
            }
        }
    }

    moveLeft() {
        for (let row = 0; row < this.size; row++) {
            this.board[row] = this.mergeLine(this.board[row]);
        }
    }

    moveRight() {
        for (let row = 0; row < this.size; row++) {
            this.board[row] = this.mergeLine([...this.board[row]].reverse()).reverse();
        }
    }

    moveUp() {
        for (let col = 0; col < this.size; col++) {
            const line = [];
            for (let row = 0; row < this.size; row++) line.push(this.board[row][col]);
            const merged = this.mergeLine(line);
            for (let row = 0; row < this.size; row++) this.board[row][col] = merged[row];
        }
    }

    moveDown() {
        for (let col = 0; col < this.size; col++) {
            const line = [];
            for (let row = this.size - 1; row >= 0; row--) line.push(this.board[row][col]);
            const merged = this.mergeLine(line);
            for (let row = 0; row < this.size; row++) this.board[this.size - 1 - row][col] = merged[row];
        }
    }

    mergeLine(line) {
        const filtered = line.filter(value => value !== 0);
        const result = [];
        let index = 0;

        while (index < filtered.length) {
            if (index + 1 < filtered.length && filtered[index] === filtered[index + 1]) {
                const merged = filtered[index] * 2;
                result.push(merged);
                this.score += merged;
                index += 2;
            } else {
                result.push(filtered[index]);
                index++;
            }
        }

        while (result.length < this.size) {
            result.push(0);
        }

        return result;
    }

    checkGameOver() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) return false;
                if (col < this.size - 1 && this.board[row][col] === this.board[row][col + 1]) return false;
                if (row < this.size - 1 && this.board[row][col] === this.board[row + 1][col]) return false;
            }
        }
        return true;
    }

    endGame() {
        this.gameOver = true;
        this.running = false;

        if (typeof window.showGameOver === "function") {
            window.showGameOver("2048", this.score);
        }
    }

    getTileFontSize(value) {
        if (value >= 1000) return 34;
        if (value >= 100) return 42;
        return 52;
    }

    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#faf8ef";
        ctx.fillRect(0, 0, width, height);

        const boardSize = Math.min(width, height) * 0.9;
        const offsetX = (width - boardSize) / 2;
        const offsetY = (height - boardSize) / 2;
        const padding = boardSize * 0.045;
        const gap = boardSize * 0.025;
        const tileSize = (boardSize - padding * 2 - gap * 3) / 4;

        ctx.fillStyle = "#bbada0";
        this.roundRect(ctx, offsetX, offsetY, boardSize, boardSize, boardSize * 0.025);

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const x = offsetX + padding + col * (tileSize + gap);
                const y = offsetY + padding + row * (tileSize + gap);
                const value = this.board[row][col];
                this.drawTile(x, y, tileSize, value);
            }
        }

        this.drawScore();
    }

    drawTile(x, y, size, value) {
        const ctx = this.ctx;
        ctx.fillStyle = this.colors[value] || "#3c3a32";
        this.roundRect(ctx, x, y, size, size, size * 0.08);

        if (value === 0) return;

        const fontSize = this.getTileFontSize(value);
        ctx.fillStyle = this.textColors[value] || "#f9f6f2";
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(value, x + size / 2, y + size / 2);
    }

    drawScore() {
        const ctx = this.ctx;
        ctx.fillStyle = "#776e65";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(`SCORE ${this.score}`, 12, this.canvas.height - 12);
        ctx.textAlign = "right";
        ctx.fillText(`BEST ${this.best}`, this.canvas.width - 12, this.canvas.height - 12);
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fill();
    }
}