// ===== GAME CONSTANTS =====
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;
const TREE_WIDTH = 42.66;
const TREE_HEIGHT = 64;
const TREE_HITBOX_HEIGHT = TREE_HEIGHT * 0.15;
const ROCK_WIDTH = 16;
const ROCK_HEIGHT = 16;
const ROCK_SCALE = 0.2;
const TILE_SIZE = 64;

// ===== GAME STATE =====
let player, cursors, trees = [], rocks = [], shiftKey;
let useFallbackPaths = false;

// ===== UTILITY FUNCTIONS =====
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function findStartPosition(cols, rows, occupiedPositions) {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (occupiedPositions.has(`${x},${y}`)) return { x, y };
        }
    }
    return { x: Math.floor(cols/2), y: Math.floor(rows/2) };
}

// ===== PATH GENERATION =====
function createPathTile(scene, x, y, isCorner = false, rotation = 0) {
    if (useFallbackPaths) {
        const tile = scene.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x8B4513);
        tile.setOrigin(0.5);
        if (isCorner) tile.fillAlpha = 0.8;
        if (rotation !== 0) tile.rotation = rotation;
        return tile;
    } else {
        const tile = scene.add.image(x, y, isCorner ? 'corner-path' : 'main-path');
        tile.setOrigin(0.5);
        if (rotation !== 0) tile.rotation = rotation;
        return tile;
    }
}

function generatePath(scene, cols, rows, pathGroup, occupiedPositions) {
    const startEdge = Phaser.Math.Between(0, 3);
    let x, y, dirX, dirY;

    switch(startEdge) {
        case 0: x = Phaser.Math.Between(1, cols-2); y = 0; dirX = 0; dirY = 1; break;
        case 1: x = cols-1; y = Phaser.Math.Between(1, rows-2); dirX = -1; dirY = 0; break;
        case 2: x = Phaser.Math.Between(1, cols-2); y = rows-1; dirX = 0; dirY = -1; break;
        case 3: x = 0; y = Phaser.Math.Between(1, rows-2); dirX = 1; dirY = 0; break;
    }

    const pathLength = Phaser.Math.Between(15, 25);
    let lastDirX = dirX;
    let lastDirY = dirY;


    for (let i = 0; i < pathLength; i++) {
        occupiedPositions.add(`${x},${y}`);

        const pathX = x * TILE_SIZE + TILE_SIZE / 2;
        const pathY = y * TILE_SIZE + TILE_SIZE / 2;

        let isCorner = false;
        let rotation = 0;

        if (i > 0 && (dirX !== lastDirX || dirY !== lastDirY)) {
            isCorner = true;
            if (lastDirX === 1 && dirY === 1) rotation = 0;
            else if (lastDirY === 1 && dirX === -1) rotation = Math.PI/2;
            else if (lastDirX === -1 && dirY === -1) rotation = Math.PI;
            else if (lastDirY === -1 && dirX === 1) rotation = -Math.PI/2;
        }

        const pathTile = createPathTile(scene, pathX, pathY, isCorner, rotation);

        if (!isCorner && dirX !== 0) pathTile.rotation = Math.PI/2;

        pathTile.setDepth(0);
        pathGroup.add(pathTile);
        if (Phaser.Math.Between(0, 100) < 30 && i > 2) {
            const possibleDirs = dirX === 0 ? 
                [{x: 1, y: 0}, {x: -1, y: 0}] : 
                [{x: 0, y: 1}, {x: 0, y: -1}];

            const validDirs = possibleDirs.filter(dir => {
                const newX = x + dir.x;
                const newY = y + dir.y;
                return newX >= 0 && newX < cols && newY >= 0 && newY < rows;
            });

            if (validDirs.length > 0) {
                lastDirX = dirX;
                lastDirY = dirY;
                const newDir = Phaser.Math.RND.pick(validDirs);
                dirX = newDir.x;
                dirY = newDir.y;
            }
        }

        x += dirX;
        y += dirY;
        if (x <= 0 || x >= cols-1 || y <= 0 || y >= rows-1) break;
    }
}
// ===== ENVIRONMENT GENERATION =====
function generateGrass(scene, cols, rows, grassGroup, occupiedPositions) {
    const clumpCount = 15;
    const minClumpSize = 3;
    const maxClumpSize = 8;
    const clumpSpacing = 3;
    const clumpCenters = [];

    for (let i = 0; i < clumpCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let centerX, centerY;

        while (attempts < 50 && !validPosition) {
            centerX = Phaser.Math.Between(1, cols - 2);
            centerY = Phaser.Math.Between(1, rows - 2);
            validPosition = true;

            for (const center of clumpCenters) {
                const dx = Math.abs(center.x - centerX);
                const dy = Math.abs(center.y - centerY);
                if (dx < clumpSpacing && dy < clumpSpacing) {
                    validPosition = false;
                    break;
                }
            }

            if (occupiedPositions.has(`${centerX},${centerY}`)) validPosition = false;
            attempts++;
        }

        if (!validPosition) continue;

        clumpCenters.push({ x: centerX, y: centerY });
        const clumpSize = Phaser.Math.Between(minClumpSize, maxClumpSize);

        for (let j = 0; j < clumpSize; j++) {
            const offsetX = Phaser.Math.Between(-1, 1);
            const offsetY = Phaser.Math.Between(-1, 1);
            const gx = centerX + offsetX;
            const gy = centerY + offsetY;

            if (gx < 0 || gx >= cols || gy < 0 || gy >= rows || 
                occupiedPositions.has(`${gx},${gy}`)) continue;

            const grass = scene.add.image(
                gx * TILE_SIZE + TILE_SIZE / 2,
                gy * TILE_SIZE + TILE_SIZE / 2,
                'grass'
            );
            grass.setScale(0.125);
            grass.setOrigin(0.5);
            grass.setDepth(0);
            grassGroup.add(grass);
        }
    }
}

function generateTrees(scene, cols, rows, treeGroup, occupiedPositions) {
    const patchCount = 20;

    for (let i = 0; i < patchCount; i++) {
        const patchX = Phaser.Math.Between(2, cols - 3);
        const patchY = Phaser.Math.Between(2, rows - 3);

        let canPlaceTree = true;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (occupiedPositions.has(`${patchX + dx},${patchY + dy}`)) {
                    canPlaceTree = false;
                    break;
                }
            }
            if (!canPlaceTree) break;
        }

        if (canPlaceTree && Math.random() < 0.5) {
            const treeX = patchX * TILE_SIZE + TILE_SIZE / 2;
            const treeSpriteY = patchY * TILE_SIZE + TILE_SIZE / 2 - 20; // draw sprite at this Y

        const tree = scene.add.image(treeX, treeSpriteY, 'tree');
        tree.setScale(0.7);
        tree.setOrigin(0.5, 1);
        tree.setDepth(treeSpriteY);
        treeGroup.add(tree);

        const hitboxHeight = TREE_HEIGHT * 0.15;
        const frontThresholdY = scene.sys.game.config.height - 120;

        if (treeSpriteY < frontThresholdY) {
            trees.push({
            sprite: tree,
            x: treeX - TREE_WIDTH / 2,
            y: treeSpriteY - hitboxHeight, // anchor hitbox to bottom of sprite
            width: TREE_WIDTH,
            height: hitboxHeight
        });
    }
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    occupiedPositions.add(`${patchX + dx},${patchY + dy}`);
                }
            }
        }
    }
}

function generateRocks(scene, cols, rows, rockGroup, occupiedPositions) {
    const rockCount = Phaser.Math.Between(1, 2);

    for (let i = 0; i < rockCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let rockX, rockY;

        while (attempts < 50 && !validPosition) {
            rockX = Phaser.Math.Between(1, cols - 2);
            rockY = Phaser.Math.Between(1, rows - 2);
            validPosition = true;

            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    if (occupiedPositions.has(`${rockX + dx},${rockY + dy}`)) {
                        validPosition = false;
                        break;
                    }
                }
                if (!validPosition) break;
            }
            attempts++;
        }

        if (!validPosition) continue;

        const rockType = Phaser.Math.Between(1, 2);
        const x = rockX * TILE_SIZE + TILE_SIZE / 2;
        const y = rockY * TILE_SIZE + TILE_SIZE / 2;

        const rock = scene.add.image(x, y, `rock${rockType}`);
        rock.setScale(ROCK_SCALE);
        rock.setOrigin(0.5);
        rock.setDepth(y + .5);
        rockGroup.add(rock);

        const scaledWidth = ROCK_WIDTH * ROCK_SCALE;
        const scaledHeight = ROCK_HEIGHT * ROCK_SCALE;

        rocks.push({
            sprite: rock,
            x: x - scaledWidth/2,
            y: y - scaledHeight/2,
            width: scaledWidth,
            height: scaledHeight
        });

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                occupiedPositions.add(`${rockX + dx},${rockY + dy}`);
            }
        }
    }
}

// ===== ANIMATIONS =====
function setupAnimations(scene) {
    const anims = [
        { key: 'walk_down', frames: ['walk_down_1', 'walk_down_2', 'walk_down_3', 'walk_down_4'] },
        { key: 'walk_left', frames: ['walk_left_1', 'walk_left_2', 'walk_left_3', 'walk_left_4'] },
        { key: 'walk_right', frames: ['walk_right_1', 'walk_right_2', 'walk_right_3', 'walk_right_4'] },
        { key: 'walk_up', frames: ['walk_up_1', 'walk_up_2', 'walk_up_3', 'walk_up_4'] }
    ];
    
    anims.forEach(anim => {
        scene.anims.create({
            key: anim.key,
            frames: anim.frames.map(f => ({ key: 'hero', frame: f })),
            frameRate: 10,
            repeat: -1
        });
    });
    
    const idleAnims = [
        { key: 'idle_down', frame: 'walk_down_1' },
        { key: 'idle_left', frame: 'walk_left_1' },
        { key: 'idle_right', frame: 'walk_right_1' },
        { key: 'idle_up', frame: 'walk_up_1' }
    ];
    
    idleAnims.forEach(anim => {
        scene.anims.create({
            key: anim.key,
            frames: [{ key: 'hero', frame: anim.frame }],
            frameRate: 1
        });
    });
}

// ===== SIDE PANEL =====
function createSidePanel() {
    // Coordinates for the grid
    const grid = [
        { key: 'pkmn',   col: 0, row: 0 },
        { key: 'dex',    col: 1, row: 0 },
        { key: 'bag',    col: 0, row: 1 },
        { key: 'save',   col: 1, row: 1 }
    ];
    const cellSize = 180;
    const startX = 50;
    const startY = 50;

    // Add 2x2 grid of icons
    grid.forEach(item => {
        const x = startX + item.col * cellSize;
        const y = startY + item.row * cellSize;

        // Add unhovered image
        const icon = this.add.image(x, y, `${item.key}_unhovered`).setOrigin(0, 0).setInteractive();

        // On hover, set to _hovered version
        icon.on('pointerover', () => {
            icon.setTexture(`${item.key}_hovered`);
        });

        // On out, set back to _unhovered version
        icon.on('pointerout', () => {
            icon.setTexture(`${item.key}_unhovered`);
        });
    });
}
// ===== CORE GAME SCENES =====
function preload() {
    console.log("Loading game assets...");
    
    this.load.image('background', 'background.png')
        .on('loaderror', () => console.error("Failed to load background"));
    
    this.load.atlasXML('hero', 'sCrkzvs.png', 'sCrkzvs.xml')
        .on('loaderror', () => console.error("Failed to load hero spritesheet"));
    
    this.load.image('grass', 'grass.png');
    this.load.image('tree', 'tree.png');
    this.load.image('rock1', 'rock1.png');
    this.load.image('rock2', 'rock2.png');
   
    
    this.load.image('main-path', 'main-path.png')
        .on('loaderror', () => {
            useFallbackPaths = true;
            console.log("Using fallback paths");
        });
    this.load.image('corner-path', 'corner-path.png')
        .on('loaderror', () => {
            useFallbackPaths = true;
            console.log("Using fallback paths");
        });

    this.load.on('complete', () => {
        console.log("All assets loaded successfully!");
    });
}

function preloadSidePanel() {
    this.load.image('pkmn_unhovered', 'pkmn_unhovered.png');
    this.load.image('dex_unhovered', 'dex_unhovered.png');
    this.load.image('bag_unhovered', 'bag_unhovered.png');
    this.load.image('save_unhovered', 'save_unhovered.png');
    this.load.image('pkmn_hovered', 'pkmn_hovered.png');
    this.load.image('dex_hovered', 'dex_hovered.png');
    this.load.image('bag_hovered', 'bag_hovered.png');
    this.load.image('save_hovered', 'save_hovered.png');
}

function create() {
    // Add background
    const bg = this.add.image(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'background'
    );
    bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    bg.setDepth(-1);

    // Generate world
    const cols = Math.floor(this.sys.game.config.width / TILE_SIZE);
    const rows = Math.floor(this.sys.game.config.height / TILE_SIZE);
    const occupiedPositions = new Set();
    
    const grassGroup = this.add.group();
    const pathGroup = this.add.group();
    const treeGroup = this.add.group();
    const rockGroup = this.add.group();

    generatePath(this, cols, rows, pathGroup, occupiedPositions);
    generateGrass(this, cols, rows, grassGroup, occupiedPositions);
    generateTrees(this, cols, rows, treeGroup, occupiedPositions);
    generateRocks(this, cols, rows, rockGroup, occupiedPositions);

    // Create player
    const startPos = findStartPosition(cols, rows, occupiedPositions);
    player = this.add.sprite(
        startPos.x * TILE_SIZE + TILE_SIZE/2,
        startPos.y * TILE_SIZE + TILE_SIZE/2,
        'hero'
    );
    player.setDepth(player.y + 20);

    // Setup controls and animations
    setupAnimations(this);
    cursors = this.input.keyboard.createCursorKeys();
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
}

function update() {
    // Movement handling
    let moving = false;
    const speed = shiftKey.isDown ? 2 : 1.5;
    let newX = player.x;
    let newY = player.y;
    let direction = '';

    if (cursors.left.isDown) {
        newX -= speed;
        player.anims.play('walk_left', true);
        moving = true;
        direction = 'left';
    } else if (cursors.right.isDown) {
        newX += speed;
        player.anims.play('walk_right', true);
        moving = true;
        direction = 'right';
    } else if (cursors.up.isDown) {
        newY -= speed;
        player.anims.play('walk_up', true);
        moving = true;
        direction = 'up';
    } else if (cursors.down.isDown) {
        newY += speed;
        player.anims.play('walk_down', true);
        moving = true;
        direction = 'down';
    }

    if (!moving) {
        if (direction === 'left') player.anims.play('idle_left', true);
        else if (direction === 'right') player.anims.play('idle_right', true);
        else if (direction === 'up') player.anims.play('idle_up', true);
        else player.anims.play('idle_down', true);
    }
    // Collision detection
    let canMove = true;
    const playerBounds = {
        x: newX - PLAYER_WIDTH/2,
        y: newY - PLAYER_HEIGHT/2,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
    };

    for (const tree of trees) {
        if (checkCollision(playerBounds, tree)) {
            canMove = false;
            break;
        }
    }
    for (const rock of rocks) {
        if (checkCollision(playerBounds, rock)) {
            canMove  = false;
            break;
        }
    }

    // Apply movement
    if (canMove) {
        player.x = newX;
        player.y = newY;
    }

    // Update depths
    player.setDepth(player.y + 20);
    trees.forEach(tree => tree.sprite.setDepth(tree.sprite.y));
    rocks.forEach(rock => rock.sprite.setDepth(rock.sprite.y));
}

// ===== GAME CONFIGURATION =====
const mainConfig = {
    type: Phaser.AUTO,
    parent: 'main-game',
    width: 768,
    height: 768,
    pixelArt: true,
    scene: { preload, create, update },
    dom: { createContainer: true },
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const sideConfig = {
    type: Phaser.AUTO,
    parent: 'side-panel',
    width: 600,
    height: 450,
    pixelArt: true,
    backgroundColor: '#333333',
    scene: { create: createSidePanel, preload: preloadSidePanel },
    dom: { createContainer: true },
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// ===== GAME INITIALIZATION =====
try {
    console.log("Initializing game...");
    const mainGame = new Phaser.Game(mainConfig);
    const sideGame = new Phaser.Game(sideConfig);
    
    if (!mainGame.isBooted) console.error("Main game failed to initialize!");
    if (!sideGame.isBooted) console.error("Side panel failed to initialize!");
    else console.log("Both game instances initialized successfully!");
} catch (error) {
    console.error("Game initialization failed:", error);
}
