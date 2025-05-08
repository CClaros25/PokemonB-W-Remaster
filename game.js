const mainConfig = {
    type: Phaser.AUTO,
    width: 800,  // Reduced main canvas width
    height: 768,
    pixelArt: true,
    backgroundColor: '#468215', // Grass green background
    scene: {
        preload,
        create,
        update
    }
};

const sideConfig = {
    type: Phaser.AUTO,
    parent: 'sideCanvas',
    width: 224,  // 1024 - 800 = 224 for side panel
    height: 768,
    pixelArt: true,
    backgroundColor: '#333333', // Dark gray for contrast
    scene: {
        create: createSideCanvas
    }
};

const mainGame = new Phaser.Game(mainConfig);
const sidePanel = new Phaser.Game(sideConfig);

let player, cursors;

function preload() {
    this.load.atlasXML('hero', 'sCrkzvs.png', 'sCrkzvs.xml');
    this.load.image('grass', 'grass.png');
}

function create() {
    // Offset everything 100px to the left
    const xOffset = -100;
    
    // Create grass sprites (1/8 scale) with offset
    const tileSize = 64;
    const cols = Math.floor(mainConfig.width / tileSize);
    const rows = Math.floor(mainConfig.height / tileSize);
    const grassGroup = this.add.group();

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (Math.random() < 0.6) {
                const grass = this.add.image(
                    x * tileSize + tileSize/2 + xOffset,
                    y * tileSize + tileSize/2,
                    'grass'
                );
                grass.setScale(0.125);
                grass.setOrigin(0.5);
                grassGroup.add(grass);
            }
        }
    }

    // Player setup with offset
    player = this.add.sprite(256 + xOffset, 192, 'hero');

    // Animations (unchanged)
    this.anims.create({
        key: 'walk_down',
        frames: ['walk_down_1', 'walk_down_2', 'walk_down_3', 'walk_down_4']
            .map(f => ({ key: 'hero', frame: f })),
        frameRate: 10,
        repeat: -1
    });

    // ... (other animations remain the same) ...

    cursors = this.input.keyboard.createCursorKeys();
}

function createSideCanvas() {
    // Add UI elements to side canvas
    this.add.text(20, 30, 'STATS', { 
        font: '24px Arial', 
        fill: '#FFFFFF' 
    });
    
    // Add more side panel elements as needed
}

function update() {
    let moving = false;
    const speed = 2;
    const xOffset = -100; // Same offset as in create()

    if (cursors.left.isDown) {
        player.x -= speed;
        player.anims.play('walk_left', true);
        moving = true;
    } 
    // ... (other movement controls remain the same) ...

    if (!moving) {
        player.anims.play('idle_down', true);
    }
}
