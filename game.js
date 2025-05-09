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
    }
};

const sideConfig = {
    type: Phaser.AUTO,
    parent: 'side-panel',
    width: 256,
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

let player, cursors, trees = [];
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;
const TREE_WIDTH = 64;
const TREE_HEIGHT = 96;
const TREE_HITBOX_HEIGHT = 30;
const TILE_SIZE = 64;

function preload() {
    this.load.atlasXML('hero', 'sCrkzvs.png', 'sCrkzvs.xml');
    this.load.image('grass', 'grass.png');
    this.load.image('tree', 'tree.png');
    this.load.image('main-path', 'main-path.png');
    this.load.image('corner-path', 'corner-path.png');
}

function create() {
    const cols = Math.floor(this.sys.game.config.width / TILE_SIZE);
    const rows = Math.floor(this.sys.game.config.height / TILE_SIZE);
    const grassGroup = this.add.group();
    const pathGroup = this.add.group();
    const treeGroup = this.add.group();

    // Track all occupied positions
    const occupiedPositions = new Set();
    
    // Generate a winding path first
    generatePath(this, cols, rows, pathGroup, occupiedPositions);
    
    // Generate clumpy grass around the path (with proper spacing)
    generateGrass(this, cols, rows, grassGroup, occupiedPositions);
    
    // Generate trees with proper spacing
    generateTrees(this, cols, rows, treeGroup, occupiedPositions);

    // Player setup - place on path
    const startPos = findStartPosition(cols, rows, occupiedPositions);
    player = this.add.sprite(startPos.x * TILE_SIZE + TILE_SIZE/2, startPos.y * TILE_SIZE + TILE_SIZE/2, 'hero');
    player.setDepth(player.y + 20);

    // Animations
    setupAnimations(this);

    cursors = this.input.keyboard.createCursorKeys();
}

function generatePath(scene, cols, rows, pathGroup, occupiedPositions) {
    // Start path at a random edge
    const startEdge = Phaser.Math.Between(0, 3);
    let x, y, dirX, dirY;
    
    // Determine starting position and direction
    switch(startEdge) {
        case 0: // Top
            x = Phaser.Math.Between(1, cols-2);
            y = 0;
            dirX = 0;
            dirY = 1;
            break;
        case 1: // Right
            x = cols-1;
            y = Phaser.Math.Between(1, rows-2);
            dirX = -1;
            dirY = 0;
            break;
        case 2: // Bottom
            x = Phaser.Math.Between(1, cols-2);
            y = rows-1;
            dirX = 0;
            dirY = -1;
            break;
        case 3: // Left
            x = 0;
            y = Phaser.Math.Between(1, rows-2);
            dirX = 1;
            dirY = 0;
            break;
    }
    
    // Generate winding path
    const pathLength = Phaser.Math.Between(15, 25);
    let lastDirX = dirX;
    let lastDirY = dirY;
    
    for (let i = 0; i < pathLength; i++) {
        // Mark current position as occupied
        occupiedPositions.add(`${x},${y}`);
        
        // Place path tile
        const pathX = x * TILE_SIZE + TILE_SIZE / 2;
        const pathY = y * TILE_SIZE + TILE_SIZE / 2;
        
        // Determine if this is a straight path or corner
        let pathTile;
        if (i > 0 && (dirX !== lastDirX || dirY !== lastDirY)) {
            // Corner tile
            pathTile = scene.add.image(pathX, pathY, 'corner-path');
            // Calculate rotation based on direction change
            let rotation = 0;
            if (lastDirX === 1 && dirY === 1) rotation = 0; // Right to Down
            else if (lastDirY === 1 && dirX === -1) rotation = Math.PI/2; // Down to Left
            else if (lastDirX === -1 && dirY === -1) rotation = Math.PI; // Left to Up
            else if (lastDirY === -1 && dirX === 1) rotation = -Math.PI/2; // Up to Right
            pathTile.setRotation(rotation);
        } else {
            // Straight path
            pathTile = scene.add.image(pathX, pathY, 'main-path');
            if (dirX !== 0) pathTile.setRotation(Math.PI/2); // Horizontal path
        }
        pathTile.setOrigin(0.5);
        pathTile.setDepth(0);
        pathGroup.add(pathTile);
        
        // Random chance to change direction (but not back on itself)
        if (Phaser.Math.Between(0, 100) < 30 && i > 2) {
            const possibleDirs = [];
            if (dirX === 0) {
                // Currently moving vertically, can turn left or right
                possibleDirs.push({x: 1, y: 0});
                possibleDirs.push({x: -1, y: 0});
            } else {
                // Currently moving horizontally, can turn up or down
                possibleDirs.push({x: 0, y: 1});
                possibleDirs.push({x: 0, y: -1});
            }
            
            // Filter out directions that would go out of bounds
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
        
        // Move to next position
        x += dirX;
        y += dirY;
        
        // Stop if we hit the edge
        if (x <= 0 || x >= cols-1 || y <= 0 || y >= rows-1) break;
    }
}

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
            
            if (occupiedPositions.has(`${centerX},${centerY}`)) {
                validPosition = false;
            }
            
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
            
            const x = gx * TILE_SIZE + TILE_SIZE / 2;
            const y = gy * TILE_SIZE + TILE_SIZE / 2;
            
            const grass = scene.add.image(x, y, 'grass');
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
                const checkX = patchX + dx;
                const checkY = patchY + dy;
                if (occupiedPositions.has(`${checkX},${checkY}`)) {
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
                x: treeX - TREE_WIDTH/2,
                y: treeY - TREE_HITBOX_HEIGHT,
                width: TREE_WIDTH,
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

function findStartPosition(cols, rows, occupiedPositions) {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (occupiedPositions.has(`${x},${y}`)) {
                return { x, y };
            }
        }
    }
    return { x: Math.floor(cols/2), y: Math.floor(rows/2) };
}

function setupAnimations(scene) {
    scene.anims.create({
        key: 'walk_down',
        frames: ['walk_down_1', 'walk_down_2', 'walk_down_3', 'walk_down_4']
            .map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'walk_left',
        frames: ['walk_left_1', 'walk_left_2', 'walk_left_3', 'walk_left_4']
            .map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'walk_right',
        frames: ['walk_right_1', 'walk_right_2', 'walk_right_3', 'walk_right_4']
            .map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'walk_up',
        frames: ['walk_up_1', 'walk_up_2', 'walk_up_3', 'walk_up_4']
            .map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'idle_down',
        frames: [{ key: 'hero', frame: 'walk_down_1' }],
        frameRate: 1
    });

    scene.anims.create({
        key: 'idle_left',
        frames: [{ key: 'hero', frame: 'walk_left_1' }],
        frameRate: 1
    });

    scene.anims.create({
        key: 'idle_right',
        frames: [{ key: 'hero', frame: 'walk_right_1' }],
        frameRate: 1
    });

    scene.anims.create({
        key: 'idle_up',
        frames: [{ key: 'hero', frame: 'walk_up_1' }],
        frameRate: 1
    });
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

    for (const tree of trees) {
        if (checkCollision(playerBounds, tree)) {
            canMove = false;
            break;
        }
    }

    if (canMove) {
        player.x = newX;
        player.y = newY;
    }

    player.setDepth(player.y + 20);
    trees.forEach(tree => {
        tree.sprite.setDepth(tree.sprite.y);
    });
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
