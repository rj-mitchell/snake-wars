const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 30;
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
  // Save current positions before updating
  const currentPlayerHead = { x: player.body[0].x, y: player.body[0].y };
  const aiSnakesHeads = aiSnakes.map((aiSnake) => ({ x: aiSnake.body[0].x, y: aiSnake.body[0].y }));

  // Update positions
  player.update();
  for (const aiSnake of aiSnakes) {
    aiLogic(aiSnake);
    aiSnake.update();
  }

  // Check for collisions
  if (checkCollisions(player, aiSnakes) || checkCollisions(player, [{ body: [currentPlayerHead] }])) {
    player.alive = false;
    endGame('lose');
    return;
  }

  let aiAliveCount = aiSnakes.filter((aiSnake) => aiSnake.alive).length;
  for (const aiSnake of aiSnakes) {
    if (checkCollisions(aiSnake, aiSnakes.filter((other) => other !== aiSnake).concat([{ body: [aiSnakesHeads.shift()] }]))) {
      aiSnake.alive = false;
      aiAliveCount -= 1;
    }
  }

  if (aiAliveCount === 0) {
    endGame('win');
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw();
  for (const aiSnake of aiSnakes) {
    aiSnake.draw();
  }

  score++;
  scoreDisplay.textContent = `Score: ${score}`;
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
    gameState = 'running';
    hideOverlay();
    player.alive = true;
    ai1.alive = true;
    ai2.alive = true;
    ai3.alive = true;
    score = 0;
    gameInterval = setInterval(gameLoop, 100);
}

function endGame(result) {
  gameState = 'ended';
  clearInterval(gameInterval);

  const overlay = document.getElementById('overlay');
  const title = document.getElementById('title');
  const subtitle = document.getElementById('subtitle');

  if (result === 'win') {
    title.textContent = `You Win!`;
    title.color = 'white';
    subtitle.textContent = `Score: ${score}`;
    subtitle.color = 'white';
  } else {
    title.textContent = `You Lose!`;
    title.color = 'white';    
  }

  setTimeout(() => {
    title.textContent = 'Snake Wars';
    subtitle.textContent = 'Press any key to start';
  }, 3000);
}


document.addEventListener('keydown', (e) => {
    if (gameState === 'ended' || gameState === 'not_started') {
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

let gameInterval;
let gameState = 'not_started';

