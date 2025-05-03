// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
const POKEMON_COUNT = 1025; // Gen 1-6
let player = { x: 200, y: 200, dir: 'down' };
let inBattle = false;
let grassPatches = [];

// Initialize
function init() {
    createGrass();
    document.addEventListener('keydown', handleKeyPress);
    gameLoop();
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrass();
    drawPlayer();
    if (inBattle) drawBattle();
    requestAnimationFrame(gameLoop);
}

// Draw functions
function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
    ctx.fill();
}

function createGrass() {
    for (let i = 0; i < 15; i++) {
        grassPatches.push({
            x: Math.random() * 350,
            y: Math.random() * 350,
            width: 50 + Math.random() * 100,
            height: 50 + Math.random() * 100
        });
    }
}

// Key controls
function handleKeyPress(e) {
    const speed = 5;
    if (e.key === 'ArrowUp') { player.y -= speed; player.dir = 'up'; }
    if (e.key === 'ArrowDown') { player.y += speed; player.dir = 'down'; }
    if (e.key === 'ArrowLeft') { player.x -= speed; player.dir = 'left'; }
    if (e.key === 'ArrowRight') { player.x += speed; player.dir = 'right'; }
}

init();
