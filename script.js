// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const paddleSpeed = 6;
const ballSpeed = 5;
const maxBallSpeed = 7;

let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Player paddle (left)
const playerPaddle = {
    x: 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: paddleSpeed
};

// Computer paddle (right)
const computerPaddle = {
    x: canvas.width - paddleWidth - 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: paddleSpeed * 0.8 // Slightly slower than player
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: ballSpeed,
    dy: ballSpeed,
    radius: ballSize,
    speed: ballSpeed
};

// Mouse position tracking
let mouseY = canvas.height / 2;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Button controls
document.getElementById('startBtn').addEventListener('click', toggleGame);
document.getElementById('resetBtn').addEventListener('click', resetScore);

function toggleGame() {
    gameRunning = !gameRunning;
    const btn = document.getElementById('startBtn');
    btn.textContent = gameRunning ? 'Pause Game' : 'Start Game';
    
    if (gameRunning && ball.x === canvas.width / 2 && ball.y === canvas.height / 2) {
        resetBall();
    }
}

function resetScore() {
    playerScore = 0;
    computerScore = 0;
    updateScoreboard();
    gameRunning = false;
    document.getElementById('startBtn').textContent = 'Start Game';
    resetBall();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
    ball.dy = (Math.random() - 0.5) * ballSpeed;
}

// Update player paddle position
function updatePlayerPaddle() {
    // Mouse control
    if (mouseY - paddleHeight / 2 > 0 && mouseY + paddleHeight / 2 < canvas.height) {
        playerPaddle.y = mouseY - paddleHeight / 2;
    }

    // Keyboard control (arrow keys)
    if (keys['ArrowUp'] && playerPaddle.y > 0) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if (keys['ArrowDown'] && playerPaddle.y < canvas.height - paddleHeight) {
        playerPaddle.y += playerPaddle.speed;
    }

    // Boundary check
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + paddleHeight > canvas.height) {
        playerPaddle.y = canvas.height - paddleHeight;
    }
}

// Update computer paddle position (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + paddleHeight / 2;
    const distance = ball.y - computerCenter;

    // Simple AI: follow the ball with some delay
    if (distance < -35) {
        if (computerPaddle.y > 0) {
            computerPaddle.y -= computerPaddle.speed;
        }
    } else if (distance > 35) {
        if (computerPaddle.y < canvas.height - paddleHeight) {
            computerPaddle.y += computerPaddle.speed;
        }
    }

    // Boundary check
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + paddleHeight > canvas.height) {
        computerPaddle.y = canvas.height - paddleHeight;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        // Prevent ball from getting stuck
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
        }
        if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
        }
    }

    // Paddle collision (player)
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + paddleHeight
    ) {
        ball.dx = Math.abs(ball.dx); // Ensure ball moves away
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (playerPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
        ball.dy += hitPos * 3;
        
        // Increase ball speed slightly
        ball.dx *= 1.05;
        if (Math.abs(ball.dx) > maxBallSpeed) {
            ball.dx = maxBallSpeed * (ball.dx > 0 ? 1 : -1);
        }
    }

    // Paddle collision (computer)
    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + paddleHeight
    ) {
        ball.dx = -Math.abs(ball.dx); // Ensure ball moves away
        ball.x = computerPaddle.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computerPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
        ball.dy += hitPos * 3;
        
        // Increase ball speed slightly
        ball.dx *= 1.05;
        if (Math.abs(ball.dx) > maxBallSpeed) {
            ball.dx = maxBallSpeed * (ball.dx > 0 ? 1 : -1);
        }
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScoreboard();
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScoreboard();
        resetBall();
    }
}

// Update scoreboard
function updateScoreboard() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#667eea';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#764ba2';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff5252';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawCenterLine();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
