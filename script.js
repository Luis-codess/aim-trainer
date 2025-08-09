// ==== SIMPLE GLOBALS ====
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const hud = document.getElementById('hud');
const scoreEl = document.getElementById('score');
const clicksEl = document.getElementById('clicks');
const accEl = document.getElementById('acc');
const timeEl = document.getElementById('time');

const over = document.getElementById('over');
const finalScore = document.getElementById('finalScore');
const finalHits = document.getElementById('finalHits');
const finalMisses = document.getElementById('finalMisses');
const finalAcc = document.getElementById('finalAcc');

const hitSound = document.getElementById('hitSound');

const RADIUS = 28;
const DURATION_MS = 10000; // 10 seconds
const BALLS_TO_DRAW = 3;

let balls = [];       // each ball: { x, y, r }
let score = 0;
let hits = 0;
let clicks = 0;

let loopId = null;    // setInterval id
let endAt = 0;        // timestamp when game ends
let running = false;  // game state

// ==== UTILS ====
// Return a random integer between min and max (inclusive)
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Put a ball fully inside the canvas
function randomBall() {
  return {
    x: rand(RADIUS, canvas.width - RADIUS),
    y: rand(RADIUS, canvas.height - RADIUS),
    r: RADIUS
  };
}

// Simple accuracy calculation
function accuracy() {
  if (clicks === 0) return 0;
  return Math.round((hits / clicks) * 100);
}

// ==== GAME FLOW ====
function startGame() {
  // reset all state
  balls = [];
    for (let i = 0; i < BALLS_TO_DRAW; i++) {
  balls.push(randomBall());
}
  score = 0;
  hits = 0;
  clicks = 0;
  endAt = Date.now() + DURATION_MS;
  running = true;

  // UI states
  startBtn.classList.add('hidden');
  over.classList.add('hidden');
  hud.classList.remove('hidden');

  // start loop (simple setInterval ~60fps)
  clearInterval(loopId);
  loopId = setInterval(gameLoop, 16);
}

function endGame() {
  running = false;
  clearInterval(loopId);

  // hide HUD, show results
  hud.classList.add('hidden');
  over.classList.remove('hidden');

  finalScore.textContent = score;
  finalHits.textContent = hits;
  finalMisses.textContent = Math.max(0, clicks - hits);
  finalAcc.textContent = accuracy() + '%';

  // show Start/Restart
  startBtn.classList.add('hidden'); // keep hidden; use restart
}

function gameLoop() {
  // time left
  const msLeft = Math.max(0, endAt - Date.now());
  timeEl.textContent = (msLeft / 1000).toFixed(1);

  // end condition
  if (msLeft <= 0) {
    endGame();
    draw(); // draw final frame (clears canvas)
    return;
  }

  // draw everything
  draw();
}

function draw() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw balls in yellow
  ctx.fillStyle = '#ffe600';
  balls.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 3);
    ctx.fill();
  });

  // update HUD text
  scoreEl.textContent = score;
  clicksEl.textContent = clicks;
  accEl.textContent = accuracy() + '%';
}

// ==== INPUT ====
canvas.addEventListener('click', function (e) {
  if (!running) return;

  // mouse position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  clicks++;

  // check if click hit any ball
  let hit = false;
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    const dx = mx - b.x;
    const dy = my - b.y;
    const distSq = dx * dx + dy * dy;

    if (distSq <= b.r * b.r) {
      // hit this ball
      hit = true;
      score++;
      hits++;
      balls[i] = randomBall(); // move just the hit ball
      try { hitSound.currentTime = 0; hitSound.play(); } catch (_) {}
      break;
    }
  }

  // (we don't need to do anything special for a miss)
});

// Buttons
startBtn.addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// First screen: only the Start button is visible; canvas just sits there.
