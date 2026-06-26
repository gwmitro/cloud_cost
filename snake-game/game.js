// ============================================
// Modern Snake Game - Complete Implementation
// ============================================

class SnakeGame {
    constructor() {
        // Game Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.gridWidth = this.canvas.width / this.gridSize;
        this.gridHeight = this.canvas.height / this.gridSize;

        // Game State
        this.snake = [{x: 10, y: 10}];
        this.food = {x: 15, y: 15};
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.gameRunning = false;
        this.gamePaused = false;
        this.currentDifficulty = 'easy';
        this.gameSpeed = this.getGameSpeed('easy');
        this.frameCount = 0;

        // Difficulty Settings
        this.difficultySettings = {
            easy: {speed: 0.1, speedMultiplier: 1, name: 'Easy'},
            medium: {speed: 0.15, speedMultiplier: 1.5, name: 'Medium'},
            hard: {speed: 0.2, speedMultiplier: 2, name: 'Hard'}
        };

        // Particle effects
        this.particles = [];

        // Initialize event listeners
        this.initializeEventListeners();
        this.updateHighScoreDisplay();
        this.gameLoop();
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Start Screen
        document.getElementById('playBtn').addEventListener('click', () => this.startGame());

        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDifficulty(e.target.dataset.difficulty));
        });

        // Game Controls
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.mainMenu());
        document.getElementById('pauseMenuBtn').addEventListener('click', () => this.mainMenu());

        // Mobile Controls
        document.getElementById('upBtn').addEventListener('click', () => this.setDirection(0, -1));
        document.getElementById('downBtn').addEventListener('click', () => this.setDirection(0, 1));
        document.getElementById('leftBtn').addEventListener('click', () => this.setDirection(-1, 0));
        document.getElementById('rightBtn').addEventListener('click', () => this.setDirection(1, 0));

        // Keyboard Controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    /**
     * Select game difficulty
     */
    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
    }

    /**
     * Get game speed based on difficulty
     */
    getGameSpeed(difficulty) {
        return this.difficultySettings[difficulty].speed;
    }

    /**
     * Start the game
     */
    startGame() {
        this.showScreen('gameScreen');
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameSpeed = this.getGameSpeed(this.currentDifficulty);
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.score = 0;
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.frameCount = 0;
        this.particles = [];
        this.updateScoreDisplay();
        document.getElementById('pauseBtn').textContent = 'Pause';
    }

    /**
     * Handle keyboard input
     */
    handleKeyPress(e) {
        if (!this.gameRunning) return;

        // Pause on spacebar
        if (e.code === 'Space') {
            e.preventDefault();
            this.togglePause();
            return;
        }

        if (this.gamePaused) {
            if (e.code !== 'Space') {
                e.preventDefault();
                this.togglePause();
            }
            return;
        }

        // Arrow key controls
        switch(e.code) {
            case 'ArrowUp':
                e.preventDefault();
                if (this.direction.y === 0) this.nextDirection = {x: 0, y: -1};
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (this.direction.y === 0) this.nextDirection = {x: 0, y: 1};
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (this.direction.x === 0) this.nextDirection = {x: -1, y: 0};
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (this.direction.x === 0) this.nextDirection = {x: 1, y: 0};
                break;
        }
    }

    /**
     * Set direction for mobile controls
     */
    setDirection(x, y) {
        if (!this.gameRunning || this.gamePaused) return;

        // Prevent reversing
        if (this.direction.x === -x && this.direction.y === -y) return;
        if (this.direction.x === x && this.direction.y === y) return;

        this.nextDirection = {x, y};
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        if (!this.gameRunning) return;

        this.gamePaused = !this.gamePaused;

        if (this.gamePaused) {
            this.showScreen('pauseScreen');
        } else {
            this.showScreen('gameScreen');
        }
    }

    /**
     * Generate new food position
     */
    generateFood() {
        let newFood;
        let validPosition = false;

        while (!validPosition) {
            newFood = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };

            // Check if food is not on snake
            validPosition = !this.snake.some(segment => 
                segment.x === newFood.x && segment.y === newFood.y
            );
        }

        return newFood;
    }

    /**
     * Update game state
     */
    updateGame() {
        if (!this.gameRunning || this.gamePaused) return;

        this.frameCount++;

        // Update based on game speed
        if (this.frameCount < 1 / this.gameSpeed) return;
        this.frameCount = 0;

        // Update direction
        this.direction = this.nextDirection;

        // Move snake
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= this.gridWidth ||
            newHead.y < 0 || newHead.y >= this.gridHeight) {
            this.endGame();
            return;
        }

        // Check self collision
        if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            this.endGame();
            return;
        }

        this.snake.unshift(newHead);

        // Check food collision
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.playEatSound();
            this.createParticles(this.food.x, this.food.y);
            this.food = this.generateFood();
            this.updateScoreDisplay();
        } else {
            this.snake.pop();
        }
    }

    /**
     * Create particle effects
     */
    createParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const velocity = 3;
            this.particles.push({
                x: x + 0.5,
                y: y + 0.5,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1,
                maxLife: 1
            });
        }
    }

    /**
     * Update particles
     */
    updateParticles() {
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
            p.x += p.vx * 0.1;
            p.y += p.vy * 0.1;
            p.life -= 0.02;
            p.vy += 0.1; // gravity
        });
    }

    /**
     * Render game
     */
    renderGame() {
        // Clear canvas
        this.ctx.fillStyle = '#0f1323';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid (subtle)
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.gridWidth; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.gridHeight; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        // Draw snake
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const padding = 2;

            // Head
            if (index === 0) {
                this.ctx.fillStyle = '#00ff88';
                this.ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
                this.ctx.shadowBlur = 15;
                this.ctx.fillRect(x + padding, y + padding, this.gridSize - padding * 2, this.gridSize - padding * 2);

                // Draw eyes
                this.ctx.fillStyle = '#0a0e27';
                const eyeSize = 3;
                const eyeOffset = 5;
                this.ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
            }
            // Body
            else {
                const opacity = 1 - (index / this.snake.length) * 0.5;
                this.ctx.fillStyle = `rgba(0, 255, 136, ${opacity})`;
                this.ctx.shadowColor = `rgba(0, 255, 136, ${opacity * 0.6})`;
                this.ctx.shadowBlur = 8;
                this.ctx.fillRect(x + padding, y + padding, this.gridSize - padding * 2, this.gridSize - padding * 2);
            }
        });

        this.ctx.shadowColor = 'transparent';

        // Draw food with animation
        const foodX = this.food.x * this.gridSize;
        const foodY = this.food.y * this.gridSize;
        const foodSize = 1 + Math.sin(Date.now() / 100) * 0.2;
        const padding = 2;

        this.ctx.fillStyle = '#00d4ff';
        this.ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(
            foodX + this.gridSize / 2,
            foodY + this.gridSize / 2,
            (this.gridSize / 2 - padding) * foodSize,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Draw particles
        this.particles.forEach(p => {
            const size = 2 * p.life;
            this.ctx.fillStyle = `rgba(0, 255, 136, ${p.life * 0.6})`;
            this.ctx.shadowColor = `rgba(0, 255, 136, ${p.life * 0.4})`;
            this.ctx.shadowBlur = 5;
            this.ctx.beginPath();
            this.ctx.arc(p.x * this.gridSize, p.y * this.gridSize, size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.shadowColor = 'transparent';
    }

    /**
     * End game
     */
    endGame() {
        this.gameRunning = false;
        this.playGameOverSound();

        const isNewHighScore = this.score > this.highScore;
        if (isNewHighScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalHighScore').textContent = this.highScore;
        document.getElementById('snakeLength').textContent = this.snake.length;
        document.getElementById('difficultyDisplay').textContent = 
            this.difficultySettings[this.currentDifficulty].name;

        const newScoreMsg = document.getElementById('newHighScoreMessage');
        if (isNewHighScore) {
            newScoreMsg.classList.add('show');
        } else {
            newScoreMsg.classList.remove('show');
        }

        this.showScreen('gameOverScreen');
    }

    /**
     * Restart game
     */
    restartGame() {
        this.startGame();
    }

    /**
     * Return to main menu
     */
    mainMenu() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.showScreen('startScreen');
    }

    /**
     * Show specific screen
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    /**
     * Update score display
     */
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        
        const speedMultiplier = this.difficultySettings[this.currentDifficulty].speedMultiplier;
        document.getElementById('speed').textContent = speedMultiplier + 'x';
    }

    /**
     * Update high score display on start screen
     */
    updateHighScoreDisplay() {
        document.getElementById('startHighScore').textContent = this.highScore;
    }

    /**
     * Save high score to localStorage
     */
    saveHighScore() {
        localStorage.setItem('snakeGameHighScore', this.highScore);
    }

    /**
     * Load high score from localStorage
     */
    loadHighScore() {
        const saved = localStorage.getItem('snakeGameHighScore');
        return saved ? parseInt(saved) : 0;
    }

    /**
     * Play eat sound
     */
    playEatSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio context not supported');
        }
    }

    /**
     * Play game over sound
     */
    playGameOverSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [400, 300, 200];
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.value = freq;
                    oscillator.type = 'sine';

                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                }, index * 150);
            });
        } catch (e) {
            console.log('Audio context not supported');
        }
    }

    /**
     * Main game loop
     */
    gameLoop = () => {
        this.updateGame();
        this.updateParticles();
        this.renderGame();
        requestAnimationFrame(this.gameLoop);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
