let playerName = '';
const loginPage = document.getElementById('login-page');
const gamePage = document.getElementById('game-page');
const startButton = document.getElementById('start-game');
const playerNameInput = document.getElementById('player-name');
const playerDisplay = document.getElementById('player-display');

startButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName) {
        loginPage.style.display = 'none';
        gamePage.style.display = 'block';
        playerDisplay.textContent = `Player: ${playerName}`;
        const backgroundMusic = document.getElementById('background-music');
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
        startGame();
    }
});

function startGame() {
    const ball = document.getElementById('ball');
    const goal = document.getElementById('goal');
    const obstaclesContainer = document.getElementById('obstacles');
    const powerUpsContainer = document.getElementById('power-ups');
    const scoreDisplay = document.getElementById('score');
    const gameOverDisplay = document.getElementById('game-over');

    let ballY = 300;
    let ballX = 50;
    let ballSpeedX = 0;
    let ballSpeedY = 0;
    let gravity = 0.5;
    let gravityX = 0;
    let gravityY = gravity;
    let level = 1;
    let isGameOver = false;
    let powerUpActive = false;
    let lastKeyPressTime = 0;
    let score = 0;
    
    const powerUpTypes = ['speed', 'shield', 'size', 'multiball', 'timeWarp', 'ghostMode'];
    let currentPowerUp = null;
    let powerUpTimer = 0;
    let isGhostMode = false;
    let balls = [{ x: 50, y: 300, speedX: 0, speedY: 0 }];
    let timeWarpActive = false;
    let angle = 0;

    function activatePowerUp(type) {
        powerUpActive = true;
        currentPowerUp = type;
        powerUpTimer = 5;
        document.getElementById('power-up-sound').play();
        
        switch(type) {
            case 'speed':
                ball.style.filter = 'hue-rotate(45deg) brightness(1.5) saturate(2)';
                ball.style.boxShadow = '0 0 20px #ff4400, 0 0 40px #ff4400, 0 0 60px #ff4400';
                gravity = 1.2;
                break;
            case 'shield':
                ball.style.filter = 'hue-rotate(120deg) brightness(1.3)';
                ball.style.boxShadow = '0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00ff00';
                ball.style.animation = 'pulse 1s infinite';
                break;
            case 'size':
                ball.style.filter = 'hue-rotate(280deg) brightness(1.4)';
                ball.style.boxShadow = '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff';
                ball.style.transform = `scale(0.5) rotate(${angle}deg)`; // Fix size transformation
                break;
            case 'multiball':
                ball.style.filter = 'hue-rotate(200deg) brightness(1.5)';
                ball.style.boxShadow = '0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff';
                for(let i = 0; i < 2; i++) {
                    const multiBall = ball.cloneNode(true);
                    multiBall.id = `multiball-${balls.length}`;
                    multiBall.style.filter = 'hue-rotate(200deg) brightness(1.5)';
                    multiBall.style.boxShadow = '0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff';
                    document.querySelector('.game-container').appendChild(multiBall);
                    balls.push({
                        x: balls[0].x,
                        y: balls[0].y,
                        speedX: (Math.random() - 0.5) * 10,
                        speedY: (Math.random() - 0.5) * 10
                    });
                }
                break;
            case 'timeWarp':
                ball.style.filter = 'hue-rotate(240deg) brightness(1.4) contrast(1.2)';
                ball.style.boxShadow = '0 0 20px #0000ff, 0 0 40px #0000ff, 0 0 60px #0000ff';
                timeWarpActive = true;
                document.querySelector('.game-container').style.filter = 'hue-rotate(240deg) brightness(0.8)';
                gravity = 0.25;
                break;
            case 'ghostMode':
                ball.style.filter = 'hue-rotate(0deg) brightness(1.3)';
                ball.style.boxShadow = '0 0 20px #ffffff, 0 0 40px #ffffff, 0 0 60px #ffffff';
                ball.style.opacity = '0.5';
                isGhostMode = true;
                break;
        }

        // Remove any existing timer
        clearInterval(window.powerUpInterval);
        
        // Display power-up timer
        const timerDisplay = document.getElementById('power-up-timer');
        timerDisplay.textContent = `Power-up: ${type} (${powerUpTimer}s)`;
        timerDisplay.style.display = 'block';

        // Start timer countdown
        window.powerUpInterval = setInterval(() => {
            powerUpTimer--;
            timerDisplay.textContent = `Power-up: ${type} (${powerUpTimer}s)`;
            if (powerUpTimer <= 0) {
                clearInterval(window.powerUpInterval);
                deactivatePowerUp();
            }
        }, 1000);
    }

    function deactivatePowerUp() {
        powerUpActive = false;
        currentPowerUp = null;
        ball.style.filter = '';
        ball.style.boxShadow = '';
        ball.style.transform = `rotate(${angle}deg)`;
        ball.style.animation = '';
        ball.style.opacity = '1';
        gravity = 0.5;
        timeWarpActive = false;
        isGhostMode = false;
        document.querySelector('.game-container').style.filter = '';
        document.getElementById('power-up-timer').style.display = 'none';
        balls = [balls[0]]; // Keep only the main ball
    }

    function initializeGame() {
        ball.style.left = ballX + 'px';
        ball.style.top = ballY + 'px';
        
        goal.style.right = '50px';
        goal.style.top = Math.random() * (window.innerHeight - 50) + 'px';
        
        createObstacles();
    }

    function createObstacles() {
        obstaclesContainer.innerHTML = '';
        const numObstacles = level + 2;
        
        for (let i = 0; i < numObstacles; i++) {
            const obstacle = document.createElement('div');
            obstacle.className = 'obstacle';
            obstacle.style.left = (300 + i * 200) + 'px';
            obstacle.style.top = Math.random() * (window.innerHeight - 40) + 'px';
            obstaclesContainer.appendChild(obstacle);
        }
    }

    function createPowerUp() {
        const powerUp = document.createElement('div');
        powerUp.className = 'power-up';
        powerUp.dataset.type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        powerUp.style.left = (Math.random() * (window.innerWidth - 30)) + 'px';
        powerUp.style.top = (Math.random() * (window.innerHeight - 30)) + 'px';
        powerUpsContainer.appendChild(powerUp);
    }

    function updateMovement(e) {
        const speed = powerUpActive && currentPowerUp === 'speed' ? 12 : 8;
        
        switch(e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                // Switch gravity to left
                gravityX = -gravity;
                gravityY = 0;
                document.getElementById('power-up-sound').play();
                break;
            case 'ArrowRight':
            case 'KeyD':
                // Switch gravity to right
                gravityX = gravity;
                gravityY = 0;
                document.getElementById('power-up-sound').play();
                break;
            case 'ArrowUp':
            case 'KeyW':
                // Switch gravity to up
                gravityX = 0;
                gravityY = -gravity;
                document.getElementById('power-up-sound').play();
                break;
            case 'ArrowDown':
            case 'KeyS':
                // Switch gravity to down
                gravityX = 0;
                gravityY = gravity;
                document.getElementById('power-up-sound').play();
                break;
        }
    }
 
    function activatePowerUp(type) {
        powerUpActive = true;
        currentPowerUp = type;
        powerUpTimer = 5;
        document.getElementById('power-up-sound').play();
        
        switch(type) {
            case 'speed':
                ball.style.filter = 'hue-rotate(45deg) brightness(1.5) saturate(2)';
                ball.style.boxShadow = '0 0 20px #ff4400, 0 0 40px #ff4400, 0 0 60px #ff4400';
                gravity = 1.2;
                break;
            case 'shield':
                ball.style.filter = 'hue-rotate(120deg) brightness(1.3)';
                ball.style.boxShadow = '0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00ff00';
                ball.style.animation = 'pulse 1s infinite';
                break;
            case 'size':
                ball.style.filter = 'hue-rotate(280deg) brightness(1.4)';
                ball.style.boxShadow = '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff';
                ball.style.transform = `scale(0.5) rotate(${angle}deg)`; // Fix size transformation
                break;
            case 'multiball':
                ball.style.filter = 'hue-rotate(200deg) brightness(1.5)';
                ball.style.boxShadow = '0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff';
                for(let i = 0; i < 2; i++) {
                    const multiBall = ball.cloneNode(true);
                    multiBall.id = `multiball-${balls.length}`;
                    multiBall.style.filter = 'hue-rotate(200deg) brightness(1.5)';
                    multiBall.style.boxShadow = '0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff';
                    document.querySelector('.game-container').appendChild(multiBall);
                    balls.push({
                        x: balls[0].x,
                        y: balls[0].y,
                        speedX: (Math.random() - 0.5) * 10,
                        speedY: (Math.random() - 0.5) * 10
                    });
                }
                break;
            case 'timeWarp':
                ball.style.filter = 'hue-rotate(240deg) brightness(1.4) contrast(1.2)';
                ball.style.boxShadow = '0 0 20px #0000ff, 0 0 40px #0000ff, 0 0 60px #0000ff';
                timeWarpActive = true;
                document.querySelector('.game-container').style.filter = 'hue-rotate(240deg) brightness(0.8)';
                gravity = 0.25;
                break;
            case 'ghostMode':
                ball.style.filter = 'hue-rotate(0deg) brightness(1.3)';
                ball.style.boxShadow = '0 0 20px #ffffff, 0 0 40px #ffffff, 0 0 60px #ffffff';
                ball.style.opacity = '0.5';
                isGhostMode = true;
                break;
        }

        // Remove any existing timer
        clearInterval(window.powerUpInterval);
        
        // Display power-up timer
        const timerDisplay = document.getElementById('power-up-timer');
        timerDisplay.textContent = `Power-up: ${type} (${powerUpTimer}s)`;
        timerDisplay.style.display = 'block';

        // Start timer countdown
        window.powerUpInterval = setInterval(() => {
            powerUpTimer--;
            timerDisplay.textContent = `Power-up: ${type} (${powerUpTimer}s)`;
            if (powerUpTimer <= 0) {
                clearInterval(window.powerUpInterval);
                deactivatePowerUp();
            }
        }, 1000);
    }

    function deactivatePowerUp() {
        powerUpActive = false;
        currentPowerUp = null;
        ball.style.filter = '';
        ball.style.boxShadow = '';
        ball.style.transform = `rotate(${angle}deg)`;
        ball.style.animation = '';
        ball.style.opacity = '1';
        gravity = 0.5;
        timeWarpActive = false;
        isGhostMode = false;
        document.querySelector('.game-container').style.filter = '';
        document.getElementById('power-up-timer').style.display = 'none';
        balls = [balls[0]]; // Keep only the main ball
    }

    function initializeGame() {
        ball.style.left = ballX + 'px';
        ball.style.top = ballY + 'px';
        
        goal.style.right = '50px';
        goal.style.top = Math.random() * (window.innerHeight - 50) + 'px';
        
        createObstacles();
    }

    function createObstacles() {
        obstaclesContainer.innerHTML = '';
        const numObstacles = level + 2;
        
        for (let i = 0; i < numObstacles; i++) {
            const obstacle = document.createElement('div');
            obstacle.className = 'obstacle';
            obstacle.style.left = (300 + i * 200) + 'px';
            obstacle.style.top = Math.random() * (window.innerHeight - 40) + 'px';
            obstaclesContainer.appendChild(obstacle);
        }
    }

    function createPowerUp() {
        const powerUp = document.createElement('div');
        powerUp.className = 'power-up';
        powerUp.dataset.type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        powerUp.style.left = (Math.random() * (window.innerWidth - 30)) + 'px';
        powerUp.style.top = (Math.random() * (window.innerHeight - 30)) + 'px';
        powerUpsContainer.appendChild(powerUp);
    }

    function updateMovement(e) {
        const speed = powerUpActive && currentPowerUp === 'speed' ? 12 : 8;
        
        switch(e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                // Switch gravity to left
                gravityX = -gravity;
                gravityY = 0;
                document.getElementById('power-up-sound').play();
                break;
            case 'ArrowRight':
            case 'KeyD':
                // Switch gravity to right
                gravityX = gravity;
                gravityY = 0;
                document.getElementById('power-up-sound').play();
                break;
            case 'ArrowUp':
            case 'KeyW':
                // Switch gravity to up
                gravityX = 0;
                gravityY = -gravity;
                document.getElementById('power-up-sound').play();
                break;
            case 'ArrowDown':
            case 'KeyS':
                // Switch gravity to down
                gravityX = 0;
                gravityY = gravity;
                document.getElementById('power-up-sound').play();
                break;
        }
    }

    // Add background music to the game. First, make sure you have a background music file in your Sound folder. Let's add the audio element and control it:
    const backgroundMusic = document.createElement('audio');
    backgroundMusic.src = 'Sound/background-music.mp3';
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5; // 50% volume
    document.body.appendChild(backgroundMusic);
    
    // Play background music
    backgroundMusic.play();

    function gameLoop() {
        if (isGameOver) return;

        // Update all balls
        balls.forEach((ballObj, index) => {
            // Apply gravity with time warp effect
            const timeScale = timeWarpActive ? 0.5 : 1;
            ballObj.speedX += gravityX * timeScale;
            ballObj.speedY += gravityY * timeScale;
            
            // Update position with time warp effect
            ballObj.x += ballObj.speedX * timeScale;
            ballObj.y += ballObj.speedY * timeScale;

            // Add friction
            ballObj.speedX *= 0.95;
            ballObj.speedY *= 0.95;

            // Speed limits
            ballObj.speedX = Math.min(Math.max(ballObj.speedX, -15), 15);
            ballObj.speedY = Math.min(Math.max(ballObj.speedY, -15), 15);

            // Boundary checks
            if (ballObj.x <= 0 || ballObj.x >= window.innerWidth - 30) {
                ballObj.speedX *= -0.5;
                ballObj.x = ballObj.x <= 0 ? 0 : window.innerWidth - 30;
            }
            if (ballObj.y <= 0 || ballObj.y >= window.innerHeight - 30) {
                ballObj.speedY *= -0.5;
                ballObj.y = ballObj.y <= 0 ? 0 : window.innerHeight - 30;
            }

            // Update ball positions
            if (index === 0) {
                ball.style.left = ballObj.x + 'px';
                ball.style.top = ballObj.y + 'px';
                angle = Math.atan2(gravityY, gravityX) * (180 / Math.PI);
                ball.style.transform = `rotate(${angle}deg)`;
            } else {
                const multiBall = document.getElementById(`multiball-${index}`);
                if (multiBall) {
                    multiBall.style.left = ballObj.x + 'px';
                    multiBall.style.top = ballObj.y + 'px';
                    multiBall.style.transform = `rotate(${angle}deg)`;
                }
            }
        });

        checkCollisions();
        
        if (Math.random() < 0.005) {
            createPowerUp();
        }

        requestAnimationFrame(gameLoop);
    }

    function checkCollisions() {
        const powerUps = document.querySelectorAll('.power-up');
        powerUps.forEach(powerUp => {
            if (isColliding(ball, powerUp)) {
                activatePowerUp(powerUp.dataset.type);
                powerUp.remove();
                score += 50;
            }
        });

        const obstacles = document.querySelectorAll('.obstacle');
        obstacles.forEach(obstacle => {
            if (isColliding(ball, obstacle) && !(powerUpActive && currentPowerUp === 'shield')) {
                gameOver();
            }
        });

        if (isColliding(ball, goal)) {
            levelUp();
        }
    }

    function isColliding(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    function levelUp() {
        level++;
        score += 100 * level;
        scoreDisplay.textContent = `Level: ${level} | Score: ${score}`;
        
        // Fix level up sound
        const levelUpSound = document.getElementById('level-up-sound');
        if (levelUpSound) {
            levelUpSound.currentTime = 0; // Reset sound to start
            levelUpSound.play().catch(error => console.log('Error playing level up sound:', error));
        }
        
        // Random position for goal anywhere on screen
        goal.style.left = Math.random() * (window.innerWidth - 50) + 'px';
        goal.style.top = Math.random() * (window.innerHeight - 50) + 'px';
        goal.style.right = 'auto';
        
        createObstacles();
    }

    function gameOver() {
        isGameOver = true;
        gameOverDisplay.style.display = 'block';
        document.getElementById('collision-sound').play();
        // Stop background music on game over
        const backgroundMusic = document.getElementById('background-music');
        backgroundMusic.pause();
    }

    function resetGame() {
        // Remove multi-balls first
        document.querySelectorAll('[id^="multiball-"]').forEach(el => el.remove());

        // Reset ball position and speed
        ballX = 50;
        ballY = 300;
        ballSpeedX = 0;
        ballSpeedY = 0;
        balls = [{ x: ballX, y: ballY, speedX: 0, speedY: 0 }];

        // Reset game state
        isGameOver = false;
        level = 1;
        score = 0;
        gravityX = 0;
        gravityY = gravity;
        powerUpActive = false;
        currentPowerUp = null;
        timeWarpActive = false;
        isGhostMode = false;

        // Reset UI
        gameOverDisplay.style.display = 'none';
        ball.style = '';
        ball.style.left = ballX + 'px';
        ball.style.top = ballY + 'px';
        document.querySelector('.game-container').style.filter = '';
        scoreDisplay.textContent = `Level: ${level} | Score: ${score}`;
        document.getElementById('power-up-timer').style.display = 'none';

        // Clear containers
        powerUpsContainer.innerHTML = '';
        obstaclesContainer.innerHTML = '';

        // Reinitialize game
        createObstacles();
        
        // Reset goal position
        goal.style.left = Math.random() * (window.innerWidth - 50) + 'px';
        goal.style.top = Math.random() * (window.innerHeight - 50) + 'px';
        goal.style.right = 'auto';

        // Restart game loop
        requestAnimationFrame(gameLoop);
    }

    // Single event listener for game controls
    const gameControls = (e) => {
        if (e.code === 'KeyR' && isGameOver) {
            resetGame();
            return;
        }
        if (!isGameOver) {
            updateMovement(e);
        }
    };

    // Remove existing and add single event listener
    document.addEventListener('keydown', gameControls);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyR' && isGameOver) {
            resetGame();
        }
    });

    initializeGame();
    gameLoop();
}
