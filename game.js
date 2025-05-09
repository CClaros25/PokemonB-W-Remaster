const mainConfig = {
    type: Phaser.AUTO,
    parent: 'main-game',
    width: 768,
    height: 768,
    pixelArt: true,
    backgroundColor: '#7CFC00',
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
    height: 284,
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
const TREE_HITBOX_HEIGHT = 30;
const ROCK_WIDTH = 32;  // Reduced from original 48
const ROCK_HEIGHT = 32; // Reduced from original 48
const ROCK_SCALE = 0.6; // Size adjustment (0.1-1.0)
const TILE_SIZE = 64;
let useFallbackPaths = false;

function preload() {
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
        rock.setScale(ROCK_SCALE); // Key size adjustment
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

// [Rest of your existing functions remain exactly the same]
// generatePath(), generateGrass(), generateTrees(), findStartPosition()
// setupAnimations(), update(), checkCollision(), createSidePanel()
// ... all other functions maintain their original implementation

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

    for (const tree of trees) {
        if (checkCollision(playerBounds, tree)) {
            canMove = false;
            break;
        }
    }
    
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

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function createSidePanel() {
    this.add.text(this.cameras.main.centerX, 30, 'PLAYER STATS', {
        font: '24px Arial',
        fill: '#FFFFFF'
    }).setOrigin(0.5);

    const statsY = 80;
    const statSpacing = 40;
    
    this.add.text(20, statsY, '❤ Health:', {
        font: '18px Arial',
        fill: '#FFFFFF'
    });
    this.add.text(120, statsY, '████████', {
        font: '18px Arial',
        fill: '#FF5555'
    });

    this.add.text(20, statsY + statSpacing, '⚡ Level:', {
        font: '18px Arial',
        fill: '#FFFFFF'
    });
    this.add.text(120, statsY + statSpacing, '1', {
        font: '18px Arial',
        fill: '#FFFFFF'
    });

    this.add.text(20, statsY + statSpacing * 2, '✦ XP:', {
        font: '18px Arial',
        fill: '#FFFFFF'
    });
    this.add.text(120, statsY + statSpacing * 2, '0/100', {
        font: '18px Arial',
        fill: '#55FF55'
    });

    this.add.text(this.cameras.main.centerX, 200, 'INVENTORY', {
        font: '20px Arial',
        fill: '#FFFFFF'
    }).setOrigin(0.5);

    const inventoryItems = [
        { name: 'Sword', icon: '⚔' },
        { name: 'Shield', icon: '🛡' },
        { name: 'Potion', icon: '🧪' }
    ];
    
    inventoryItems.forEach((item, index) => {
        this.add.text(40, 230 + index * 30, `${item.icon} ${item.name}`, {
            font: '16px Arial',
            fill: '#DDDDDD'
        });
    });
}
