// Asset loading
const assets = {
    player: new Image(),
    grass: new Image(),
    // You can add more: tree: new Image(), etc.
};
assets.player.src = 'images/player.gif'; // or player.png (spritesheet preferred)
assets.grass.src = 'images/grass.png';

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game state
let player = { x: 200, y: 200, dir: 'down' };
let inBattle = false;
let grassPatches = [];

// Initialization
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

function drawPlayer() {
    ctx.drawImage(assets.player, player.x - 16, player.y - 16, 32, 32); // Centered
}

function createGrass() {
    for (let i = 0; i < 15; i++) {
        grassPatches.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            width: 64,
            height: 64
        });
    }
}

function drawGrass() {
    grassPatches.forEach(patch => {
        ctx.drawImage(assets.grass, patch.x, patch.y, patch.width, patch.height);
    });
}

function handleKeyPress(e) {
    const speed = 5;
    if (e.key === 'ArrowUp') { player.y -= speed; player.dir = 'up'; }
    if (e.key === 'ArrowDown') { player.y += speed; player.dir = 'down'; }
    if (e.key === 'ArrowLeft') { player.x -= speed; player.dir = 'left'; }
    if (e.key === 'ArrowRight') { player.x += speed; player.dir = 'right'; }
}

function drawBattle() {
    ctx.fillStyle = 'red';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 100, 200, 200);
}

init();
