const config = {
    type: Phaser.AUTO,
    width: 256,
    height: 256,
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
}

function create() {
    player = this.add.sprite(128, 128, 'hero');

    // Animations based on your XML frame names
    this.anims.create({
        key: 'walk_down',
        frames: [
            { key: 'hero', frame: 'walk_down_1' },
            { key: 'hero', frame: 'walk_down_2' },
            { key: 'hero', frame: 'walk_down_3' },
            { key: 'hero', frame: 'walk_down_4' },
        ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_left',
        frames: [
            { key: 'hero', frame: 'walk_left_1' },
            { key: 'hero', frame: 'walk_left_2' },
            { key: 'hero', frame: 'walk_left_3' },
            { key: 'hero', frame: 'walk_left_4' },
        ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_right',
        frames: [
            { key: 'hero', frame: 'walk_right_1' },
            { key: 'hero', frame: 'walk_right_2' },
            { key: 'hero', frame: 'walk_right_3' },
            { key: 'hero', frame: 'walk_right_4' },
        ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_up',
        frames: [
            { key: 'hero', frame: 'walk_up_1' },
            { key: 'hero', frame: 'walk_up_2' },
            { key: 'hero', frame: 'walk_up_3' },
            { key: 'hero', frame: 'walk_up_4' },
        ],
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
