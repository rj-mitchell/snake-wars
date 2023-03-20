const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 40;
const tileSize = canvas.width / gridSize;
const scoreDisplay = document.getElementById("scoreDisplay");
let score = 0;

class Snake {
  constructor(color) {
    this.color = color;
    this.body = [
      {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      },
    ];
    this.direction = Math.floor(Math.random() * 4);
    this.alive = true;
  }

  update() {
    const head = { x: this.body[0].x, y: this.body[0].y };

    switch (this.direction) {
      case 0:
        head.x++;
        break;
      case 1:
        head.y++;
        break;
      case 2:
        head.x--;
        break;
      case 3:
        head.y--;
        break;
    }

    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      this.alive = false;
      return;
    }

    for (const segment of this.body) {
      if (head.x === segment.x && head.y === segment.y) {
        this.alive = false;
        return;
      }
    }

    this.body.unshift(head);
  }

  draw() {
    ctx.fillStyle = this.color;
    for (const segment of this.body) {
      ctx.fillRect(
        segment.x * tileSize,
        segment.y * tileSize,
        tileSize - 1,
        tileSize - 1
      );
    }
  }
}

const player = new Snake("red");
const ai1 = new Snake("blue");
const ai2 = new Snake("green");
const ai3 = new Snake("yellow");
const aiSnakes = [ai1, ai2, ai3];

function aiLogic(snake) {
    const possibleMoves = [
        { x: snake.body[0].x + 1, y: snake.body[0].y },
        { x: snake.body[0].x - 1, y: snake.body[0].y },
        { x: snake.body[0].x, y: snake.body[0].y + 1 },
        { x: snake.body[0].x, y: snake.body[0].y - 1 },
    ];

    const validMoves = possibleMoves.filter(
        (move) =>
            move.x >= 0 &&
            move.x < gridSize &&
            move.y >= 0 &&
            move.y < gridSize &&
            !snake.body.some(
                (segment) => segment.x === move.x && segment.y === move.y
            ) &&
            !player.body.some(
                (segment) => segment.x === move.x && segment.y === move.y
            ) &&
            !aiSnakes
                .filter((other) => other !== snake)
                .some((other) =>
                    other.body.some((segment) => segment.x === move.x && segment.y === move.y)
                )
    );

    const playerDistance = (move) => {
        return Math.abs(move.x - player.body[0].x) + Math.abs(move.y - player.body[0].y);
    };

    if (validMoves.length > 0) {
        const sortedMoves = validMoves.sort(
            (a, b) => playerDistance(a) - playerDistance(b)
        );
        const aggressiveMove = sortedMoves[0];
        if (aggressiveMove.x > snake.body[0].x) snake.direction = 0;
        else if (aggressiveMove.x < snake.body[0].x) snake.direction = 2;
        else if (aggressiveMove.y > snake.body[0].y) snake.direction = 1;
        else if (aggressiveMove.y < snake.body[0].y) snake.direction = 3;
    }
}

function checkCollisions(snake, otherSnakes) {
    const head = snake.body[0];
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        return true;
    }

    for (const segment of snake.body.slice(1)) {
        if (head.x === segment.x && head.y === segment.y) {
            return true;
        }
    }

    for (const otherSnake of otherSnakes) {
        for (const segment of otherSnake.body) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
    }

    return false;
}

function gameLoop() {
    moveSnake(player);
    for (const aiSnake of aiSnakes) {
        aiLogic(aiSnake);
        moveSnake(aiSnake);
    }

    if (checkCollisions(player, aiSnakes)) {
        player.alive = false;
        endGame('lose');
        return;
    }

    let aiAliveCount = aiSnakes.filter((aiSnake) => aiSnake.alive).length;
    for (const aiSnake of aiSnakes) {
        if (checkCollisions(aiSnake, aiSnakes.filter((other) => other !== aiSnake))) {
            aiSnake.alive = false;
            aiAliveCount -= 1;
        }
    }
    
    if (aiAliveCount === 0) {
        endGame('win');
        return;
    }

    drawBackground();
    drawSnake(player);
    for (const aiSnake of aiSnakes) {
        drawSnake(aiSnake);
    }

    score++;
    scoreDisplay.textContent = `Score: ${score}`;
}
  
    score++;
    scoreDisplay.textContent = `Score: ${score}`;

    if (!player.alive) {
        endGame('lose');
    } else if (aiSnakes.every(snake => !snake.alive)) {
        endGame('win');
    }
}

function displayOverlay(text) {
    const overlay = document.getElementById('overlay');
    const overlayText = document.getElementById('overlayText');
    overlayText.textContent = text;
    overlay.style.display = 'flex';
}

function hideOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none';
}

function startGame() {
    gameStarted = true;
    hideOverlay();
    player.alive = true;
    ai1.alive = true;
    ai2.alive = true;
    ai3.alive = true;
    score = 0;
    gameInterval = setInterval(gameLoop, 100);
}

function endGame(result) {
    clearInterval(gameInterval);

    if (result === 'win') {
        displayOverlay(`You Win - Score: ${score}`);
    } else {
        displayOverlay('You Lose');
    }

    setTimeout(() => {
        displayOverlay('Snake Wars - Press any key to start');
        gameStarted = false;
    }, 3000);
}

document.addEventListener('keydown', (e) => {
    if (!gameStarted) {
        gameStarted = true;
        startGame();
        return;
    }

    switch (e.key) {
        case 'ArrowUp':
            if (player.direction !== 1) player.direction = 3;
            break;
        case 'ArrowDown':
            if (player.direction !== 3) player.direction = 1;
            break;
        case 'ArrowLeft':
            if (player.direction !== 0) player.direction = 2;
            break;
        case 'ArrowRight':
            if (player.direction !== 2) player.direction = 0;
            break;
    }
});

let gameStarted;
let gameInterval;

