// ===== GAME CONSTANTS =====
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;
const TREE_WIDTH = 64;
const TREE_HEIGHT = 96;
const TREE_HITBOX_HEIGHT = 30;
const ROCK_WIDTH = 32;
const ROCK_HEIGHT = 32;
const ROCK_SCALE = 0.4; // Reduced from 0.6 to make rocks smaller
const TILE_SIZE = 64;

// ===== GAME STATE =====
let player, cursors, trees = [], rocks = [];
let useFallbackPaths = false;

// ===== UTILITY FUNCTIONS =====
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function findStartPosition(cols, rows, occupiedPositions) {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (occupiedPositions.has(`${x},${y}`)) return { x, y };
        }
    }
    return { x: Math.floor(cols/2), y: Math.floor(rows/2) };
}

// ===== PATH GENERATION =====
function createPathTile(scene, x, y, isCorner = false, rotation = 0) {
    if (useFallbackPaths) {
        const tile = scene.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x8B4513);
        tile.setOrigin(0.5);
        if (isCorner) tile.fillAlpha = 0.8;
        if (rotation !== 0) tile.rotation = rotation;
        return tile;
    } else {
        const tile = scene.add.image(x, y, isCorner ? 'corner-path' : 'main-path');
        tile.setOrigin(0.5);
        if (rotation !== 0) tile.rotation = rotation;
        return tile;
    }
}

function generatePath(scene, cols, rows, pathGroup, occupiedPositions) {
    // Generate first path from one edge
    const path1 = generateSinglePath(scene, cols, rows, pathGroup, occupiedPositions);
    
    // Generate second path from a different edge
    const path2 = generateSinglePath(scene, cols, rows, pathGroup, occupiedPositions, path1.end);
    
    // Try to connect the two paths if they're close
    if (path1 && path2) {
        const dist = Phaser.Math.Distance.BetweenPoints(path1.end, path2.end);
        if (dist < 5 * TILE_SIZE) {
            connectPaths(scene, path1.end, path2.end, pathGroup, occupiedPositions);
        }
    }
}

function generateSinglePath(scene, cols, rows, pathGroup, occupiedPositions, avoidPoint = null) {
    // Choose a random edge (0: top, 1: right, 2: bottom, 3: left)
    let startEdge = Phaser.Math.Between(0, 3);
    
    // If we're avoiding a point (for second path), choose a different edge
    if (avoidPoint) {
        const avoidEdge = 
            avoidPoint.y === 0 ? 0 : 
            avoidPoint.x === cols-1 ? 1 : 
            avoidPoint.y === rows-1 ? 2 : 3;
            
        startEdge = (avoidEdge + 1 + Phaser.Math.Between(0, 2)) % 4;
    }
    
    let x, y, dirX, dirY;
    
    switch(startEdge) {
        case 0: x = Phaser.Math.Between(1, cols-2); y = 0; dirX = 0; dirY = 1; break;
        case 1: x = cols-1; y = Phaser.Math.Between(1, rows-2); dirX = -1; dirY = 0; break;
        case 2: x = Phaser.Math.Between(1, cols-2); y = rows-1; dirX = 0; dirY = -1; break;
        case 3: x = 0; y = Phaser.Math.Between(1, rows-2); dirX = 1; dirY = 0; break;
    }
    
    const pathLength = Phaser.Math.Between(15, 25);
    let lastDirX = dirX;
    let lastDirY = dirY;
    let endPoint = null;
    
    for (let i = 0; i < pathLength; i++) {
        occupiedPositions.add(`${x},${y}`);
        
        const pathX = x * TILE_SIZE + TILE_SIZE / 2;
        const pathY = y * TILE_SIZE + TILE_SIZE / 2;
        
        let isCorner = false;
        let rotation = 0;
        
        if (i > 0 && (dirX !== lastDirX || dirY !== lastDirY)) {
            isCorner = true;
            if (lastDirX === 1 && dirY === 1) rotation = 0;
            else if (lastDirY === 1 && dirX === -1) rotation = Math.PI/2;
            else if (lastDirX === -1 && dirY === -1) rotation = Math.PI;
            else if (lastDirY === -1 && dirX === 1) rotation = -Math.PI/2;
        }
        
        const pathTile = createPathTile(scene, pathX, pathY, isCorner, rotation);
        
        if (!isCorner && dirX !== 0) pathTile.rotation = Math.PI/2;
        
        pathTile.setDepth(0);
        pathGroup.add(pathTile);
        
        // Store the end point
        endPoint = { x, y, pathX, pathY };
        
        // Random chance to change direction
        if (Phaser.Math.Between(0, 100) < 30 && i > 2) {
            const possibleDirs = dirX === 0 ? 
                [{x: 1, y: 0}, {x: -1, y: 0}] : 
                [{x: 0, y: 1}, {x: 0, y: -1}];
            
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
        
        x += dirX;
        y += dirY;
        if (x <= 0 || x >= cols-1 || y <= 0 || y >= rows-1) break;
    }
    
    return { end: endPoint };
}

function connectPaths(scene, point1, point2, pathGroup, occupiedPositions) {
    let x = point1.x;
    let y = point1.y;
    
    const dx = point2.x > point1.x ? 1 : point2.x < point1.x ? -1 : 0;
    const dy = point2.y > point1.y ? 1 : point2.y < point1.y ? -1 : 0;
    
    // First move horizontally if needed
    while (x !== point2.x) {
        x += dx;
        occupiedPositions.add(`${x},${y}`);
        
        const pathX = x * TILE_SIZE + TILE_SIZE / 2;
        const pathY = y * TILE_SIZE + TILE_SIZE / 2;
        
        const pathTile = createPathTile(scene, pathX, pathY);
        pathTile.rotation = Math.PI/2; // Horizontal path
        pathTile.setDepth(0);
        pathGroup.add(pathTile);
    }
    
    // Then move vertically if needed
    while (y !== point2.y) {
        y += dy;
        occupiedPositions.add(`${x},${y}`);
        
        const pathX = x * TILE_SIZE + TILE_SIZE / 2;
        const pathY = y * TILE_SIZE + TILE_SIZE / 2;
        
        const pathTile = createPathTile(scene, pathX, pathY);
        pathTile.setDepth(0);
        pathGroup.add(pathTile);
    }
}

// ===== ENVIRONMENT GENERATION =====
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
            
            if (occupiedPositions.has(`${centerX},${centerY}`)) validPosition = false;
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
            
            const grass = scene.add.image(
                gx * TILE_SIZE + TILE_SIZE / 2,
                gy * TILE_SIZE + TILE_SIZE / 2,
                'grass'
            );
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
                if (occupiedPositions.has(`${patchX + dx},${patchY + dy}`)) {
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

function generateRocks(scene, cols, rows, rockGroup, occupiedPositions) {
    const rockCount = Phaser.Math.Between(5, 10); // Increased number of rocks since they're smaller
    
    for (let i = 0; i < rockCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let rockX, rockY;
        
        while (attempts < 50 && !validPosition) {
            rockX = Phaser.Math.Between(1, cols - 2);
            rockY = Phaser.Math.Between(1, rows - 2);
            validPosition = true;
            
            // Check if position is already occupied
            if (occupiedPositions.has(`${rockX},${rockY}`)) {
                validPosition = false;
            }
            
            // Check surrounding area (smaller since rocks are smaller)
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
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
        rock.setScale(ROCK_SCALE);
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
        
        // Mark only the immediate tile as occupied for smaller rocks
        occupiedPositions.add(`${rockX},${rockY}`);
    }
}

// ... (rest of the code remains the same)
