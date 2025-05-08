const config = {
    type: Phaser.AUTO,
    width: 512, // doubled the canvas size
    height: 384,
    pixelArt: true,
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let player, cursors;

function preload() {
    this.load.atlasXML('hero', 'sCrkzvs.png', 'sCrkzvs.xml');
    this.load.image('grass', 'images/grass.png'); // load grass tile
}

function create() {
    // Fill background with randomly placed grass
    const tileSize = 64;
    const cols = Math.floor(config.width / tileSize);
    const rows = Math.floor(config.height / tileSize);
    const grassGroup = this.add.group();

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Randomly choose whether to place grass
            if (Math.random() < 0.6) {
                grassGroup.create(x * tileSize, y * tileSize, 'grass')
                    .setOrigin(0, 0);
            }
        }
    }

    player = this.add.sprite(256, 192, 'hero');

    this.anims.create({
        key: 'walk_down',
        frames: ['walk_down_1', 'walk_down_2', 'walk_down_3', 'walk_down_4'].map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_left',
        frames: ['walk_left_1', 'walk_left_2', 'walk_left_3', 'walk_left_4'].map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_right',
        frames: ['walk_right_1', 'walk_right_2', 'walk_right_3', 'walk_right_4'].map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_up',
        frames: ['walk_up_1', 'walk_up_2', 'walk_up_3', 'walk_up_4'].map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    let moving = false;

    if (cursors.left.isDown) {
        player.x -= 2;
        player.anims.play('walk_left', true);
        moving = true;
    } else if (cursors.right.isDown) {
        player.x += 2;
        player.anims.play('walk_right', true);
        moving = true;
    } else if (cursors.up.isDown) {
        player.y -= 2;
        player.anims.play('walk_up', true);
        moving = true;
    } else if (cursors.down.isDown) {
        player.y += 2;
        player.anims.play('walk_down', true);
        moving = true;
    }

    if (!moving) {
        player.anims.stop();
    }
}
