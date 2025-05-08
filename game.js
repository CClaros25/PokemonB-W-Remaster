// Main Game Configuration (unchanged from your original)
const mainConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    pixelArt: true,
    backgroundColor: '#7CFC00', // Grass green
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

// Your original preload function
function preload() {
    this.load.atlasXML('hero', 'sCrkzvs.png', 'sCrkzvs.xml');
    this.load.image('grass', 'grass.png');
}

// Your original create function with 1/8 scale grass
function create() {
    // Grass placement (1/8 scale)
    const tileSize = 32;
    const cols = Math.floor(this.sys.game.config.width / tileSize);
    const rows = Math.floor(this.sys.game.config.height / tileSize);
    const grassGroup = this.add.group();

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (Math.random() < 0.6) {
                const grass = this.add.image(
                    x * tileSize + tileSize/2,
                    y * tileSize + tileSize/2,
                    'grass'
                );
                grass.setScale(0.125);
                grass.setOrigin(0.5);
                grassGroup.add(grass);
            }
        }
    }

    // Player setup
    player = this.add.sprite(256, 192, 'hero');

    // Your original animations
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

// Your original update function
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

// Side panel content
function createSidePanel() {
    // Add UI elements
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
