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
}

function create() {
    const cols = Math.floor(this.sys.game.config.width / TILE_SIZE);
    const rows = Math.floor(this.sys.game.config.height / TILE_SIZE);
    const grassGroup = this.add.group();
    const treeGroup = this.add.group();

    const occupiedPositions = new Set();
    
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const grassX = x * TILE_SIZE + TILE_SIZE / 2;
            const grassY = y * TILE_SIZE + TILE_SIZE / 2;
            
            const grass = this.add.image(grassX, grassY, 'grass');
            grass.setScale(0.125);
            grass.setOrigin(0.5);
            grass.setDepth(0);
            grassGroup.add(grass);
        }
    }

    const patchCount = 30;
    for (let i = 0; i < patchCount; i++) {
        const patchX = Phaser.Math.Between(2, cols - 4);
        const patchY = Phaser.Math.Between(2, rows - 4);
        
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
            
            const tree = this.add.image(treeX, treeY - 20, 'tree');
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

    player = this.add.sprite(256, 192, 'hero');
    player.setDepth(player.y + 20);

    // Animations
    this.anims.create({
        key: 'walk_down',
        frames: ['walk_down_1', 'walk_down_2', 'walk_down_3', 'walk_down_4']
            .map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_left',
        frames: ['walk_left_1', 'walk_left_2', 'walk_left_3', 'walk_left_4']
            .map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_right',
        frames: ['walk_right_1', 'walk_right_2', 'walk_right_3', 'walk_right_4']
            .map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_up',
        frames: ['walk_up_1', 'walk_up_2', 'walk_up_3', 'walk_up_4']
            .map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'idle_down',
        frames: [{ key: 'hero', frame: 'walk_down_1' }],
        frameRate: 1
    });

    this.anims.create({
        key: 'idle_left',
        frames: [{ key: 'hero', frame: 'walk_left_1' }],
        frameRate: 1
    });

    this.anims.create({
        key: 'idle_right',
        frames: [{ key: 'hero', frame: 'walk_right_1' }],
        frameRate: 1
    });

    this.anims.create({
        key: 'idle_up',
        frames: [{ key: 'hero', frame: 'walk_up_1' }],
        frameRate: 1
    });

    cursors = this.input.keyboard.createCursorKeys();
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
    // Centered title
    this.add.text(this.cameras.main.centerX, 30, 'PLAYER STATS', {
        font: '24px Arial',
        fill: '#FFFFFF'
    }).setOrigin(0.5);

    // Stats with icons
    const statsY = 80;
    const statSpacing = 40;
    
    // Health
    this.add.text(20, statsY, '❤ Health:', {
        font: '18px Arial',
        fill: '#FFFFFF'
    });
    this.add.text(120, statsY, '████████', {
        font: '18px Arial',
        fill: '#FF5555'
    });

    // Level
    this.add.text(20, statsY + statSpacing, '⚡ Level:', {
        font: '18px Arial',
        fill: '#FFFFFF'
    });
    this.add.text(120, statsY + statSpacing, '1', {
        font: '18px Arial',
        fill: '#FFFFFF'
    });

    // XP
    this.add.text(20, statsY + statSpacing * 2, '✦ XP:', {
        font: '18px Arial',
        fill: '#FFFFFF'
    });
    this.add.text(120, statsY + statSpacing * 2, '0/100', {
        font: '18px Arial',
        fill: '#55FF55'
    });

    // Inventory title
    this.add.text(this.cameras.main.centerX, 200, 'INVENTORY', {
        font: '20px Arial',
        fill: '#FFFFFF'
    }).setOrigin(0.5);

    // Inventory items
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
