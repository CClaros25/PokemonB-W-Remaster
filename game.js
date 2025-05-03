// Main Pokémon Game - Black/White Style
const POKEMON_COUNT = 1025; // Up to Gen 6 (X/Y)
const GRASS_ENCOUNTER_CHANCE = 0.1; // 10% chance per step in grass

// Player and game state
let playerX = 200;
let playerY = 200;
let playerDirection = "down";
let inBattle = false;
let steps = 0;

// Pokémon data (simplified)
let pokemonNames = [];
let currentPokemon = null;

// Map elements
let grassTiles = [];
let mapWidth = 400;
let mapHeight = 400;

// Set up the canvas
function start() {
    setSize(mapWidth, mapHeight);
    
    // Load Pokémon names (in a real game, this would be a full database)
    loadPokemonNames();
    
    // Create grassy areas
    createGrassPatches();
    
    // Draw initial game state
    drawGame();
    
    // Set up keyboard controls
    keyDownMethod(keyHandler);
    
    // Game loop
    setTimer(updateGame, 50);
}

function loadPokemonNames() {
    // In a real game, you'd have actual names - this is a placeholder
    for (let i = 1; i <= POKEMON_COUNT; i++) {
        pokemonNames.push("Pokémon #" + i);
    }
    // Example names (normally you'd have all 1025)
    pokemonNames[0] = "Bulbasaur";
    pokemonNames[25] = "Pikachu";
    pokemonNames[149] = "Dragonite";
    pokemonNames[382] = "Kyogre";
    pokemonNames[493] = "Arceus";
    pokemonNames[650] = "Chespin";
    pokemonNames[716] = "Xerneas";
}

function createGrassPatches() {
    // Create random grass patches
    for (let i = 0; i < 20; i++) {
        let x = Randomizer.nextInt(0, mapWidth - 40);
        let y = Randomizer.nextInt(0, mapHeight - 40);
        let width = Randomizer.nextInt(30, 100);
        let height = Randomizer.nextInt(30, 100);
        grassTiles.push({x: x, y: y, width: width, height: height});
    }
}

function drawGame() {
    // Clear the canvas
    clear();
    
    // Draw grass patches
    setColor("green");
    for (let i = 0; i < grassTiles.length; i++) {
        let grass = grassTiles[i];
        fillRect(grass.x, grass.y, grass.width, grass.height);
    }
    
    // Draw paths (brown rectangles)
    setColor("brown");
    fillRect(0, 180, mapWidth, 40); // Horizontal path
    fillRect(180, 0, 40, mapHeight); // Vertical path
    
    // Draw player
    setColor("blue");
    fillCircle(playerX, playerY, 10);
    
    // Draw direction indicator
    setColor("black");
    if (playerDirection == "up") {
        fillRect(playerX - 3, playerY - 8, 6, 3);
    } else if (playerDirection == "down") {
        fillRect(playerX - 3, playerY + 5, 6, 3);
    } else if (playerDirection == "left") {
        fillRect(playerX - 8, playerY - 3, 3, 6);
    } else if (playerDirection == "right") {
        fillRect(playerX + 5, playerY - 3, 3, 6);
    }
    
    // If in battle, draw battle screen
    if (inBattle) {
        drawBattleScreen();
    }
}

function drawBattleScreen() {
    // Black/White style battle screen
    setColor("white");
    fillRect(0, 250, mapWidth, 150);
    setColor("black");
    drawRect(0, 250, mapWidth, 150);
    
    // Draw Pokémon name
    setFont("bold 14px Arial");
    text(currentPokemon, 20, 280);
    
    // Draw battle options
    text("FIGHT    BAG", 20, 350);
    text("PKMN    RUN", 150, 350);
    
    // Draw wild Pokémon sprite (simplified)
    setColor("red");
    fillRect(300, 270, 50, 50);
}

function updateGame() {
    if (!inBattle) {
        // Check if player is in grass
        let inGrass = false;
        for (let i = 0; i < grassTiles.length; i++) {
            let grass = grassTiles[i];
            if (playerX > grass.x && playerX < grass.x + grass.width &&
                playerY > grass.y && playerY < grass.y + grass.height) {
                inGrass = true;
                break;
            }
        }
        
        // Random encounter check
        if (inGrass && Randomizer.nextBoolean(GRASS_ENCOUNTER_CHANCE)) {
            startBattle();
        }
    }
    
    drawGame();
}

function startBattle() {
    inBattle = true;
    let randomPokeId = Randomizer.nextInt(0, POKEMON_COUNT - 1);
    currentPokemon = pokemonNames[randomPokeId];
}

function endBattle() {
    inBattle = false;
    currentPokemon = null;
}

function keyHandler(e) {
    if (inBattle) {
        handleBattleInput(e.key);
    } else {
        handleMovement(e.key);
    }
}

function handleMovement(key) {
    let moveAmount = 5;
    
    if (key == "ArrowUp") {
        playerY -= moveAmount;
        playerDirection = "up";
    } else if (key == "ArrowDown") {
        playerY += moveAmount;
        playerDirection = "down";
    } else if (key == "ArrowLeft") {
        playerX -= moveAmount;
        playerDirection = "left";
    } else if (key == "ArrowRight") {
        playerX += moveAmount;
        playerDirection = "right";
    }
    
    // Keep player on screen
    playerX = constrain(playerX, 5, mapWidth - 5);
    playerY = constrain(playerY, 5, mapHeight - 5);
    
    steps++;
}

function handleBattleInput(key) {
    if (key == "r") { // Run
        if (Randomizer.nextBoolean(0.7)) { // 70% chance to escape
            endBattle();
        }
    } else if (key == "f") { // Fight
        // In a real game, this would start the battle system
        if (Randomizer.nextBoolean(0.8)) { // 80% chance to win for demo
            endBattle();
        }
    }
}

function constrain(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

start();
