// Main Game Configuration
const mainConfig = {
    type: Phaser.AUTO,
    parent: 'main-game', // Parent div
    width: 1024,
    height: 768,
    pixelArt: true,
    backgroundColor: '#7CFC00',
    scene: {
        preload,
        create,
        update
    }
};

// Side Panel Configuration
const sideConfig = {
    type: Phaser.AUTO,
    parent: 'side-panel',
    width: 300,
    height: 768,
    pixelArt: true,
    backgroundColor: '#333333',
    scene: {
        create: createSidePanel
    }
};

// Create both game instances
const mainGame = new Phaser.Game(mainConfig);
const sideGame = new Phaser.Game(sideConfig);

let player, cursors;

function preload() {
    this.load.atlasXML('hero', 'sCrkzvs.png', 'sCrkzvs.xml');
    this.load.image('grass', 'grass.png');
    this.load.image('tree', 'tree.png'); // Load tree texture
}

function create() {
    const tileSize = 64;
    const cols = Math.floor(this.sys.game.config.width / tileSize);
    const rows = Math.floor(this.sys.game.config.height / tileSize);
    const grassGroup = this.add.group();
    const treeGroup = this.add.group();

    const patchCount = 30;
    for (let i = 0; i < patchCount; i++) {
        const patchX = Phaser.Math.Between(1, cols - 3);
        const patchY = Phaser.Math.Between(1, rows - 3);
        const patchSize = Phaser.Math.Between(6, 9);

        let hasTree = Math.random() < 0.5;
        let treePlaced = false;

        for (let j = 0; j < patchSize; j++) {
            const offsetX = Phaser.Math.Between(-1, 1);
            const offsetY = Phaser.Math.Between(-1, 1);
            const x = (patchX + offsetX) * tileSize + tileSize / 2;
            const y = (patchY + offsetY) * tileSize + tileSize / 2;

            const grass = this.add.image(x, y, 'grass');
            grass.setScale(0.125);
            grass.setOrigin(0.5);
            grassGroup.add(grass);

            // Place one tree per patch, sometimes
            if (hasTree && !treePlaced && Math.random() < 0.3) {
                const tree = this.add.image(x, y - 20, 'tree');
                tree.setScale(0.25);
                tree.setOrigin(0.5, 1);
                treeGroup.add(tree);
                treePlaced = true;
            }
        }
    }

    // Player setup
    player = this.add.sprite(256, 192, 'hero');

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

    if (cursors.left.isDown) {
        player.x -= speed;
        player.anims.play('walk_left', true);
        moving = true;
    } else if (cursors.right.isDown) {
        player.x += speed;
        player.anims.play('walk_right', true);
        moving = true;
    } else if (cursors.up.isDown) {
        player.y -= speed;
        player.anims.play('walk_up', true);
        moving = true;
    } else if (cursors.down.isDown) {
        player.y += speed;
        player.anims.play('walk_down', true);
        moving = true;
    }

    if (!moving) {
        player.anims.play('idle_down', true);
    }
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

    // Add more UI elements as needed...
}
