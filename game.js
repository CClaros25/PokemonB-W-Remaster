const mainConfig = {
    type: Phaser.AUTO,
    parent: 'main-game',
    width: 768,
    height: 768,
    pixelArt: true,
    scene: {
        preload,
        create,
        update
    },
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const sideConfig = {
    type: Phaser.AUTO,
    parent: 'side-panel',
    width: 300,
    height: 768,
    pixelArt: true,
    backgroundColor: '#333333',
    scene: {
        create: createSidePanel
    },
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const mainGame = new Phaser.Game(mainConfig);
const sideGame = new Phaser.Game(sideConfig);

let player, cursors, trees = [], rocks = [];
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;
const TREE_WIDTH = 64;
const TREE_HEIGHT = 96;
const TREE_HITBOX_HEIGHT = 40;
const TREE_HITBOX_FRONT_REDUCTION = 0.6; // 40% smaller front hitbox
const ROCK_WIDTH = 24;  // Smaller than before
const ROCK_HEIGHT = 24; // Smaller than before
const ROCK_SCALE = 0.4; // Smaller scale (40% of original)
const TILE_SIZE = 64;
let useFallbackPaths = false;

function preload() {
    this.load.image('background', 'background.png');
    this.load.atlasXML('hero', 'sCrkzvs.png', 'sCrkzvs.xml');
    this.load.image('grass', 'grass.png');
    this.load.image('tree', 'tree.png');
    this.load.image('rock1', 'rock1.png');
    this.load.image('rock2', 'rock2.png');
    
    this.load.image('main-path', 'main-path.png').on('loaderror', () => {
        useFallbackPaths = true;
    });
    this.load.image('corner-path', 'corner-path.png').on('loaderror', () => {
        useFallbackPaths = true;
    });
}

function create() {
    const bg = this.add.image(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'background'
    );
    bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    bg.setDepth(-1);

    const cols = Math.floor(this.sys.game.config.width / TILE_SIZE);
    const rows = Math.floor(this.sys.game.config.height / TILE_SIZE);
    const grassGroup = this.add.group();
    const pathGroup = this.add.group();
    const treeGroup = this.add.group();
    const rockGroup = this.add.group();

    const occupiedPositions = new Set();
    
    generatePath(this, cols, rows, pathGroup, occupiedPositions);
    generateGrass(this, cols, rows, grassGroup, occupiedPositions);
    generateTrees(this, cols, rows, treeGroup, occupiedPositions);
    generateRocks(this, cols, rows, rockGroup, occupiedPositions);

    const startPos = findStartPosition(cols, rows, occupiedPositions);
    player = this.add.sprite(startPos.x * TILE_SIZE + TILE_SIZE/2, startPos.y * TILE_SIZE + TILE_SIZE/2, 'hero');
    player.setDepth(player.y + 20);

    setupAnimations(this);
    cursors = this.input.keyboard.createCursorKeys();
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
            const treeY = patchY * TILE_SIZE + TILE_SIZE / 2;
            
            const tree = scene.add.image(treeX, treeY - 20, 'tree');
            tree.setScale(2);
            tree.setOrigin(0.5, 1);
            tree.setDepth(treeY);
            treeGroup.add(tree);
            
            trees.push({
                sprite: tree,
                x: treeX - (TREE_WIDTH * TREE_HITBOX_FRONT_REDUCTION)/2,
                y: treeY - TREE_HITBOX_HEIGHT,
                width: TREE_WIDTH * TREE_HITBOX_FRONT_REDUCTION,
                height: TREE_HITBOX_HEIGHT
            });
            
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
        rock.setDepth(y);
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

function update() {
    let moving = false;
    const speed = 2;
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

    let canMove = true;
    const playerBounds = {
        x: newX - PLAYER_WIDTH/2,
        y: newY - PLAYER_HEIGHT/2,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
    };

    // Improved tree collision
    for (const tree of trees) {
        const playerFront = player.y < tree.sprite.y; // Player is above tree (in front)
        const effectiveWidth = playerFront ? 
            TREE_WIDTH * TREE_HITBOX_FRONT_REDUCTION : 
            TREE_WIDTH * 0.3; // Even narrower when behind
            
        if (checkCollision(
            playerBounds,
            {
                x: tree.sprite.x - effectiveWidth/2,
                y: tree.y,
                width: effectiveWidth,
                height: tree.height
            }
        )) {
            canMove = false;
            break;
        }
    }
    
    // Rock collision
    for (const rock of rocks) {
        if (checkCollision(playerBounds, rock)) {
            canMove = false;
            break;
        }
    }

    if (canMove) {
        player.x = newX;
        player.y = newY;
    }

    player.setDepth(player.y + 20);
    trees.forEach(tree => tree.sprite.setDepth(tree.sprite.y));
    rocks.forEach(rock => rock.sprite.setDepth(rock.sprite.y));
}

// [Rest of your existing functions remain unchanged]
// generatePath(), generateGrass(), findStartPosition()
// setupAnimations(), checkCollision(), createSidePanel()
