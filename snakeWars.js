const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const scoreDisplay = document.getElementById('scoreDisplay');
let score = 0;

class Snake {
  constructor(color) {
    this.color = color;
    this.body = [{ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }];
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
    this.body.pop();
  }

  draw() {
    ctx.fillStyle = this.color;
    for (const segment of this.body) {
      ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    }
  }

  checkCollision(otherSnake) {
    const head = this.body[0];
    for (const segment of otherSnake.body) {
      if (head.x === segment.x && head.y === segment.y) {
        this.alive = false;
        return;
      }
    }
  }
}

const player = new Snake('red');
const ai1 = new Snake('blue');
const ai2 = new Snake('green');
const ai3 = new Snake('yellow');
const aiSnakes = [ai1, ai2, ai3];

function buildGraph() {
  const grid = [];
  for (let y = 0; y < gridSize; y++) {
    const row = [];
    for (let x = 0; x < gridSize; x++) {
      let walkable = true;
      for (const snake of [player, ...aiSnakes]) {
        for (const segment of snake.body) {
          if (segment.x === x && segment.y === y) {
            walkable = false;
            break;
          }
        }
        if (!walkable) break;
      }
      row.push(walkable ? 1 : 0);
    }
    grid.push(row);
  }
  return new Graph(grid);
}

function findPath(snake, target) {
  const graph = buildGraph();
  const start = graph.grid[snake.body[0].y][snake.body[0].x];
  const end = graph.grid[target.y][target.x];
  return astar.search(graph, start, end);
}

function aiLogic(snake) {
  const paths = [
    findPath(snake, { x: player.body[0].x, y: player.body[0].y }),
    ...aiSnakes.filter(s => s !== snake).map(s => findPath(snake, { x: s.body[0].x, y: s.body[0].y })),
  ];

  const shortestPath = paths.reduce((shortest, path) => (path.length < shortest.length ? path : shortest));

    if (shortestPath.length > 0) {
    const nextNode = shortestPath[0];
    const deltaX = nextNode.x - snake.body[0].x;
    const deltaY = nextNode.y - snake.body[0].y;

    if (deltaX === 1) snake.direction = 0;
    else if (deltaX === -1) snake.direction = 2;
    else if (deltaY === 1) snake.direction = 1;
    else if (deltaY === -1) snake.direction = 3;
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
  hideOverlay();
  gameInterval = setInterval(gameLoop, 100);
}

function endGame(result) {
  clearInterval(gameInterval);
  displayOverlay(result === 'win' ? 'You Win' : 'You Lose');
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update();
  player.draw();

  for (const aiSnake of aiSnakes) {
    aiLogic(aiSnake);
    aiSnake.update();
    aiSnake.draw();
  }

  for (const aiSnake of aiSnakes) {
    player.checkCollision(aiSnake);
    aiSnake.checkCollision(player);
  }

  for (const ai1 of aiSnakes) {
    for (const ai2 of aiSnakes) {
      if (ai1 !== ai2) {
        ai1.checkCollision(ai2);
        ai2.checkCollision(ai1);
      }
    }
  }

  score++;
  scoreDisplay.textContent = `Score: ${score}`;

  if (!player.alive) {
    endGame('lose');
  } else if (aiSnakes.every(snake => !snake.alive)) {
    endGame('win');
  }
}

document.addEventListener('keydown', (e) => {
  if (!gameStarted) {
    gameStarted = true;
    startGame();
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

let gameStarted = false;
let gameInterval;

