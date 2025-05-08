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
    this.load.spritesheet('hero', 'sCrkzvs.png', {
        frameWidth: 64,
        frameHeight: 64
    });
}

function create() {
    player = this.add.sprite(128, 128, 'hero');

    this.anims.create({
        key: 'walk_down',
        frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'walk_left',
        frames: this.anims.generateFrameNumbers('hero', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'walk_right',
        frames: this.anims.generateFrameNumbers('hero', { start: 8, end: 11 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'walk_up',
        frames: this.anims.generateFrameNumbers('hero', { start: 12, end: 15 }),
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
