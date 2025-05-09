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
    }
};

const mainGame = new Phaser.Game(mainConfig);
const sideGame = new Phaser.Game(sideConfig);

let player, cursors, trees = [];
const PLAYER_WIDTH = 32; // Approximate player width
const PLAYER_HEIGHT = 48; // Approximate player height
const TREE_WIDTH = 64; // Approximate tree width
const TREE_HEIGHT = 96; // Approximate tree height

function preload() {
    this.load.atlasXML('hero', 'sCrkzvs.png', 'sCrkzvs.xml');
    this.load.image('grass', 'grass.png');
    this.load.image('tree', 'tree.png');
}

function create() {
    const tileSize = 64;
    const cols = Math.floor(this.sys.game.config.width / tileSize);
    const rows = Math.floor(this.sys.game.config.height / tileSize);
    const grassGroup = this.add.group();
    const treeGroup = this.add.group();

    const occupiedTreeTiles = new Set();

    const patchCount = 30;
    for (let i = 0; i < patchCount; i++) {
        const patchX = Phaser.Math.Between(1, cols - 3);
        const patchY = Phaser.Math.Between(1, rows - 3);
        const patchSize = Phaser.Math.Between(6, 9);

        let hasTree = Math.random() < 0.5;
        let treeTileKey = null;

        if (hasTree) {
            const treeOffsetX = Phaser.Math.Between(-1, 1);
            const treeOffsetY = Phaser.Math.Between(-1, 1);
            const tx = patchX + treeOffsetX;
            const ty = patchY + treeOffsetY;
            treeTileKey = `${tx},${ty}`;
            occupiedTreeTiles.add(treeTileKey);
        }

        for (let j = 0; j < patchSize; j++) {
            const offsetX = Phaser.Math.Between(-1, 1);
            const offsetY = Phaser.Math.Between(-1, 1);
            const gx = patchX + offsetX;
            const gy = patchY + offsetY;
            const tileKey = `${gx},${gy}`;

            if (occupiedTreeTiles.has(tileKey)) continue;

            const x = gx * tileSize + tileSize / 2;
            const y = gy * tileSize + tileSize / 2;

            const grass = this.add.image(x, y, 'grass');
            grass.setScale(0.125);
            grass.setOrigin(0.5);
            grass.setDepth(0);
            grassGroup.add(grass);
        }

        if (hasTree && treeTileKey) {
            const [tx, ty] = treeTileKey.split(',').map(Number);
            const x = tx * tileSize + tileSize / 2;
            const y = ty * tileSize + tileSize / 2;

            const tree = this.add.image(x, y - 20, 'tree');
            tree.setScale(2);
            tree.setOrigin(0.5, 1);
            tree.setDepth(y);
            treeGroup.add(tree);
            trees.push({
                sprite: tree,
                x: x,
                y: y - 20,
                width: TREE_WIDTH,
                height: TREE_HEIGHT
            });
        }
    }

    player = this.add.sprite(256, 192, 'hero');
    player.setDepth(player.y + 20);

    // Animations (unchanged from your original code)
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

    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    let moving = false;
    const speed = 2;
    let newX = player.x;
    let newY = player.y;

    if (cursors.left.isDown) {
        newX -= speed;
        player.anims.play('walk_left', true);
        moving = true;
    } else if (cursors.right.isDown) {
        newX += speed;
        player.anims.play('walk_right', true);
        moving = true;
    } else if (cursors.up.isDown) {
        newY -= speed;
        player.anims.play('walk_up', true);
        moving = true;
    } else if (cursors.down.isDown) {
        newY += speed;
        player.anims.play('walk_down', true);
        moving = true;
    }

    if (!moving) {
        player.anims.play('idle_down', true);
    }

    // Check for tree collisions before moving
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

    // Update depths
    player.setDepth(player.y + 20);
    trees.forEach(tree => {
        tree.sprite.setDepth(tree.y);
    });
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function createSidePanel() {
    this.add.text(20, 30, 'PLAYER STATS', {
        font: '24px Arial',
        fill: '#FFFFFF'
    });

    this.add.text(20, 80, 'Health: ████████', {
        font: '18px Arial',
        fill: '#FF5555'
    });

    this.add.text(20, 120, 'Level: 1', {
        font: '18px Arial',
        fill: '#FFFFFF'
    });

    this.add.text(20, 160, 'Inventory:', {
        font: '18px Arial',
        fill: '#FFFFFF'
    });
}
