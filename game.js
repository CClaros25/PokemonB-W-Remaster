// ===== GAME CONSTANTS =====
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;
const TREE_WIDTH = 42.66;
const TREE_HEIGHT = 64;
const TREE_HITBOX_HEIGHT = TREE_HEIGHT * 0.15;
const ROCK_WIDTH = 16;
const ROCK_HEIGHT = 16;
const ROCK_SCALE = 0.2;
const TILE_SIZE = 64;
const MAX_PARTY_SIZE = 6;
const ENCOUNTER_PERCENT = 0.2;

// ===== GAME STATE =====
let player, cursors, trees = [], rocks = [], shiftKey;
let useFallbackPaths = false;
let areaX = 0, areaY = 0;
let grassGroup, pathGroup, treeGroup, rockGroup;
let encounterActive = false;
let currentEncounterName = null;
let battleUI = null;
let battleChatUI = null;
let pokedex = JSON.parse(localStorage.getItem('pokedex') || '[]');
let party = JSON.parse(localStorage.getItem('party') || '[]');
if (pokedex.length === 0) {
  pokedex = ['bulbasaur', 'charmander', 'squirtle'];
  localStorage.setItem('pokedex', JSON.stringify(pokedex));
}
if (party.length === 0) {
  party = ['bulbasaur', 'charmander', 'squirtle'];
  localStorage.setItem('party', JSON.stringify(party));
}
let sidePanelMode = "main";
let sidePanelSceneRef = null;
let slotOptionsPanel = null;

// ===== POKEMON DATA (GEN 1-5) =====
const pokemonNames = [
  // 1-151
"bulbasaur","ivysaur","venusaur","charmander","charmeleon","charizard","squirtle","wartortle","blastoise","caterpie","metapod","butterfree","weedle","kakuna","beedrill","pidgey","pidgeotto","pidgeot","rattata","raticate","spearow","fearow","ekans","arbok","pikachu","raichu","sandshrew","sandslash","nidoran-f","nidorina","nidoqueen","nidoran-m","nidorino","nidoking","clefairy","clefable","vulpix","ninetales","jigglypuff","wigglytuff","zubat","golbat","oddish","gloom","vileplume","paras","parasect","venonat","venomoth","diglett","dugtrio","meowth","persian","psyduck","golduck","mankey","primeape","growlithe","arcanine","poliwag","poliwhirl","poliwrath","abra","kadabra","alakazam","machop","machoke","machamp","bellsprout","weepinbell","victreebel","tentacool","tentacruel","geodude","graveler","golem","ponyta","rapidash","slowpoke","slowbro","magnemite","magneton","farfetchd","doduo","dodrio","seel","dewgong","grimer","muk","shellder","cloyster","gastly","haunter","gengar","onix","drowzee","hypno","krabby","kingler","voltorb","electrode","exeggcute","exeggutor","cubone","marowak","hitmonlee","hitmonchan","lickitung","koffing","weezing","rhyhorn","rhydon","chansey","tangela","kangaskhan","horsea","seadra","goldeen","seaking","staryu","starmie","mr-mime","scyther","jynx","electabuzz","magmar","pinsir","tauros","magikarp","gyarados","lapras","ditto","eevee","vaporeon","jolteon","flareon","porygon","omanyte","omastar","kabuto","kabutops","aerodactyl","snorlax","articuno","zapdos","moltres","dratini","dragonair","dragonite","mewtwo","mew",
// 152-251
"chikorita","bayleef","meganium","cyndaquil","quilava","typhlosion","totodile","croconaw","feraligatr","sentret","furret","hoothoot","noctowl","ledyba","ledian","spinarak","ariados","crobat","chinchou","lanturn","pichu","cleffa","igglybuff","togepi","togetic","natu","xatu","mareep","flaaffy","ampharos","bellossom","marill","azumarill","sudowoodo","politoed","hoppip","skiploom","jumpluff","aipom","sunkern","sunflora","yanma","wooper","quagsire","espeon","umbreon","murkrow","slowking","misdreavus","unown","wobbuffet","girafarig","pineco","forretress","dunsparce","gligar","steelix","snubbull","granbull","qwilfish","scizor","shuckle","heracross","sneasel","teddiursa","ursaring","slugma","magcargo","swinub","piloswine","corsola","remoraid","octillery","delibird","mantine","skarmory","houndour","houndoom","kingdra","phanpy","donphan","porygon2","stantler","smeargle","tyrogue","hitmontop","smoochum","elekid","magby","miltank","blissey","raikou","entei","suicune","larvitar","pupitar","tyranitar","lugia","ho-oh","celebi",
// 252-386
"treecko","grovyle","sceptile","torchic","combusken","blaziken","mudkip","marshtomp","swampert","poochyena","mightyena","zigzagoon","linoone","wurmple","silcoon","beautifly","cascoon","dustox","lotad","lombre","ludicolo","seedot","nuzleaf","shiftry","taillow","swellow","wingull","pelipper","ralts","kirlia","gardevoir","surskit","masquerain","shroomish","breloom","slakoth","vigoroth","slaking","nincada","ninjask","shedinja","whismur","loudred","exploud","makuhita","hariyama","azurill","nosepass","skitty","delcatty","sableye","mawile","aron","lairon","aggron","meditite","medicham","electrike","manectric","plusle","minun","volbeat","illumise","roselia","gulpin","swalot","carvanha","sharpedo","wailmer","wailord","numel","camerupt","torkoal","spoink","grumpig","spinda","trapinch","vibrava","flygon","cacnea","cacturne","swablu","altaria","zangoose","seviper","lunatone","solrock","barboach","whiscash","corphish","crawdaunt","baltoy","claydol","lileep","cradily","anorith","armaldo","feebas","milotic","castform","kecleon","shuppet","banette","duskull","dusclops","tropius","chimecho","absol","wynaut","snorunt","glalie","spheal","sealeo","walrein","clamperl","huntail","gorebyss","relicanth","luvdisc","bagon","shelgon","salamence","beldum","metang","metagross","regirock","regice","registeel","latias","latios","kyogre","groudon","rayquaza","jirachi","deoxys","deoxys-attack","deoxys-defense","deoxys-speed",
// 387-493
"turtwig","grotle","torterra","chimchar","monferno","infernape","piplup","prinplup","empoleon","starly","staravia","staraptor","bidoof","bibarel","kricketot","kricketune","shinx","luxio","luxray","budew","roserade","cranidos","rampardos","shieldon","bastiodon","burmy","wormadam","wormadam-sandy","wormadam-trash","mothim","combee","vespiquen","pachirisu","buizel","floatzel","cherubi","cherrim","cherrim-overcast","shellos","gastrodon","ambipom","drifloon","drifblim","buneary","lopunny","mismagius","honchkrow","glameow","purugly","chingling","stunky","skuntank","bronzor","bronzong","bonsly","mime-jr","happiny","chatot","spiritomb","gible","gabite","garchomp","munchlax","riolu","lucario","hippopotas","hippowdon","skorupi","drapion","croagunk","toxicroak","carnivine","finneon","lumineon","mantyke","snover","abomasnow","weavile","magnezone","lickilicky","rhyperior","tangrowth","electivire","magmortar","togekiss","yanmega","leafeon","glaceon","gliscor","mamoswine","porygon-z","gallade","probopass","dusknoir","froslass","rotom","uxie","mesprit","azelf","dialga","palkia","heatran","regigigas","giratina","giratina-origin","cresselia","phione","manaphy","darkrai","shaymin","shaymin-sky","arceus",
// 494-649
"victini","snivy","servine","serperior","tepig","pignite","emboar","oshawott","dewott","samurott","patrat","watchog","lillipup","herdier","stoutland","purrloin","liepard","pansage","simisage","pansear","simisear","panpour","simipour","munna","musharna","pidove","tranquill","unfezant","blitzle","zebstrika","roggenrola","boldore","gigalith","woobat","swoobat","drilbur","excadrill","audino","timburr","gurdurr","conkeldurr","tympole","palpitoad","seismitoad","throh","sawk","sewaddle","swadloon","leavanny","venipede","whirlipede","scolipede","cottonee","whimsicott","petilil","lilligant","basculin","sandile","krokorok","krookodile","darumaka","darmanitan","maractus","dwebble","crustle","scraggy","scrafty","sigilyph","yamask","cofagrigus","tirtouga","carracosta","archen","archeops","trubbish","garbodor","zorua","zoroark","minccino","cinccino","gothita","gothorita","gothitelle","solosis","duosion","reuniclus","ducklett","swanna","vanillite","vanillish","vanilluxe","deerling","sawsbuck","emolga","karrablast","escavalier","foongus","amoonguss","frillish","jellicent","alomomola","joltik","galvantula","ferroseed","ferrothorn","klink","klang","klinklang","tynamo","eelektrik","eelektross","elgyem","beheeyem","litwick","lampent","chandelure","axew","fraxure","haxorus","cubchoo","beartic","cryogonal","shelmet","accelgor","stunfisk","mienfoo","mienshao","druddigon","golett","golurk","pawniard","bisharp","bouffalant","rufflet","braviary","vullaby","mandibuzz","heatmor","durant","deino","zweilous","hydreigon","larvesta","volcarona","cobalion","terrakion","virizion","tornadus","tornadus-therian","thundurus","thundurus-therian","reshiram","zekrom","landorus","landorus-therian","kyurem","kyurem-black","kyurem-white","keldeo","keldeo-resolute","meloetta","meloetta-pirouette","genesect"
];

// ===== CHAT UTILITY =====
function showBattleChatMessage(scene, message) {
  if (!battleChatUI) return;
  battleChatUI.chatText.setText(message);
}

// ===== ENCOUNTER SPRITES WITH ANIMATED GIFS =====
function showEncounterSprites(pokeName, playerName) {
  document.querySelectorAll('.battle-pokemon').forEach(e => e.remove());
  const backImg = document.createElement('img');
  backImg.src = `pokemon/back/${playerName}.gif`;
  backImg.className = 'battle-pokemon';
  backImg.style.position = 'absolute';
  backImg.style.left = '210px';   // tune for your layout
  backImg.style.top = '340px';
  backImg.style.width = '180px';  // larger
  backImg.style.zIndex = 10;
  backImg.style.pointerEvents = 'none';
  document.body.appendChild(backImg);

  // Wild Pokémon (front sprite): smaller and further (top right of battle box)
  const frontImg = document.createElement('img');
  frontImg.src = `pokemon/front/${pokeName}.gif`;
  frontImg.className = 'battle-pokemon';
  frontImg.style.position = 'absolute';
  frontImg.style.left = '540px';  // tune for your layout
  backImg.style.top = '180px';
  frontImg.style.top = '180px';
  frontImg.style.width = '120px'; // smaller
  frontImg.style.zIndex = 10;
  frontImg.style.pointerEvents = 'none';
  document.body.appendChild(frontImg);
}

function removeEncounterSprites() {
  document.querySelectorAll('.battle-pokemon').forEach(e => e.remove());
}

// ===== UTILITY FUNCTIONS =====
function checkCollision(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y;
}
function addToDex(name) {
  name = name.toLowerCase();
  if (!pokedex.includes(name)) {
    pokedex.push(name);
    localStorage.setItem('pokedex', JSON.stringify(pokedex));
  }
}
function addToParty(name) {
  name = name.toLowerCase();
  if (!party.includes(name) && party.length < MAX_PARTY_SIZE) {
    party.push(name);
    localStorage.setItem('party', JSON.stringify(party));
  }
}
function movePartySlot(fromIdx, toIdx) {
  if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= party.length || toIdx >= party.length) return;
  const [removed] = party.splice(fromIdx, 1);
  party.splice(toIdx, 0, removed);
  localStorage.setItem('party', JSON.stringify(party));
}
function switchPartyPokemon(idx, name) {
  if (idx < 0 || idx >= MAX_PARTY_SIZE) return;
  if (!pokedex.includes(name)) return;
  if (party.includes(name) && party[idx] !== name) return;
  party[idx] = name;
  localStorage.setItem('party', JSON.stringify(party));
}
function findStartPosition(cols, rows, occupiedPositions) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (occupiedPositions.has(`${x},${y}`)) return { x, y };
    }
  }
  return { x: Math.floor(cols/2), y: Math.floor(rows/2) };
}

function showPartySlotOptions(scene, slotIdx) {
  let panel = scene.add.container();
  let bg = scene.add.rectangle(320, 180, 220, 180, 0x333333, 0.97);
  panel.add(bg);

  let y = 120;
  // Switch with Pokédex
  panel.add(
    scene.add.text(240, y, "[Switch with Dex]", { fontFamily: "monospace", fontSize: "18px", fill: "#6fa" })
      .setInteractive()
      .on('pointerdown', () => {
        panel.destroy(true);
        showDexSwitch(scene, slotIdx);
      })
  ); y += 32;

  // Remove from party
  panel.add(
    scene.add.text(240, y, "[Remove from Party]", { fontFamily: "monospace", fontSize: "18px", fill: "#f66" })
      .setInteractive()
      .on('pointerdown', () => {
        party.splice(slotIdx, 1);
        localStorage.setItem('party', JSON.stringify(party));
        panel.destroy(true);
        setSidePanelMode("party");
      })
  ); y += 32;

  // Swap with another slot
  panel.add(
    scene.add.text(240, y, "[Swap Position]", { fontFamily: "monospace", fontSize: "18px", fill: "#fc3" })
      .setInteractive()
      .on('pointerdown', () => {
        panel.destroy(true);
        showSlotSwap(scene, slotIdx);
      })
  ); y += 32;

  // Cancel
  panel.add(
    scene.add.text(240, y, "[Cancel]", { fontFamily: "monospace", fontSize: "18px", fill: "#aaa" })
      .setInteractive()
      .on('pointerdown', () => {
        panel.destroy(true);
      })
  );
  // ESC support
  scene.input.keyboard.once('keydown-ESC', () => {
    panel.destroy(true);
  });
}

// ===== ANIMATIONS =====
function setupAnimations(scene) {
  const anims = [
    { key: 'walk_down', frames: ['walk_down_1', 'walk_down_2', 'walk_down_3', 'walk_down_4'] },
    { key: 'walk_left', frames: ['walk_left_1', 'walk_left_2', 'walk_left_3', 'walk_left_4'] },
    { key: 'walk_right', frames: ['walk_right_1', 'walk_right_2', 'walk_right_3', 'walk_right_4'] },
    { key: 'walk_up', frames: ['walk_up_1', 'walk_up_2', 'walk_up_3', 'walk_up_4'] }
  ];
  anims.forEach(anim => {
    scene.anims.create({
      key: anim.key,
      frames: anim.frames.map(f => ({ key: 'hero', frame: f })),
      frameRate: 10,
      repeat: -1
    });
  });
  const idleAnims = [
    { key: 'idle_down', frame: 'walk_down_1' },
    { key: 'idle_left', frame: 'walk_left_1' },
    { key: 'idle_right', frame: 'walk_right_1' },
    { key: 'idle_up', frame: 'walk_up_1' }
  ];
  idleAnims.forEach(anim => {
    scene.anims.create({
      key: anim.key,
      frames: [{ key: 'hero', frame: anim.frame }],
      frameRate: 1
    });
  });
}

// ===== ASSET LOADING =====
function preload() {
  this.load.image('background', 'background.png')
    .on('loaderror', () => console.error("Failed to load background"));
  this.load.atlasXML('hero', 'sCrkzvs.png', 'sCrkzvs.xml')
    .on('loaderror', () => console.error("Failed to load hero spritesheet"));
  this.load.image('grass', 'grass.png');
  this.load.image('tree', 'tree.png');
  this.load.image('rock1', 'rock1.png');
  this.load.image('rock2', 'rock2.png');
  this.load.image('main-path', 'main-path.png')
    .on('loaderror', () => { useFallbackPaths = true; });
  this.load.image('corner-path', 'corner-path.png')
    .on('loaderror', () => { useFallbackPaths = true; });
  this.load.on('complete', () => {
    console.log("All assets loaded successfully!");
  });
}
function preloadSidePanel() {
  this.load.image('pkmn_unhovered', 'pkmn_unhovered.png');
  this.load.image('dex_unhovered', 'dex_unhovered.png');
  this.load.image('bag_unhovered', 'bag_unhovered.png');
  this.load.image('save_unhovered', 'save_unhovered.png');
  this.load.image('pkmn_hovered', 'pkmn_hovered.png');
  this.load.image('dex_hovered', 'dex_hovered.png');
  this.load.image('bag_hovered', 'bag_hovered.png');
  this.load.image('save_hovered', 'save_hovered.png');
}

// ===== PATH & ENVIRONMENT GENERATION =====
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
  const startEdge = Phaser.Math.Between(0, 3);
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
      const treeSpriteY = patchY * TILE_SIZE + TILE_SIZE / 2 - 20;
      const tree = scene.add.image(treeX, treeSpriteY, 'tree');
      tree.setScale(0.7);
      tree.setOrigin(0.5, 1);
      tree.setDepth(treeSpriteY);
      treeGroup.add(tree);
      const hitboxHeight = TREE_HEIGHT * 0.15;
      const frontThresholdY = scene.sys.game.config.height - 120;
      if (treeSpriteY < frontThresholdY) {
        trees.push({
          sprite: tree,
          x: treeX - TREE_WIDTH / 2,
          y: treeSpriteY - hitboxHeight,
          width: TREE_WIDTH,
          height: hitboxHeight
        });
      }
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          occupiedPositions.add(`${patchX + dx},${patchY + dy}`);
        }
      }
    }
  }
}
function generateRocks(scene, cols, rows, rockGroup, occupiedPositions) {
  const rockCount = Phaser.Math.Between(1, 2);
  for (let i = 0; i < rockCount; i++) {
    let attempts = 0;
    let validPosition = false;
    let rockX, rockY;
    while (attempts < 50 && !validPosition) {
      rockX = Phaser.Math.Between(1, cols - 2);
      rockY = Phaser.Math.Between(1, rows - 2);
      validPosition = true;
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
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
    rock.setDepth(y + .5);
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
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        occupiedPositions.add(`${rockX + dx},${rockY + dy}`);
      }
    }
  }
}

// ===== SIDE PANEL BUTTON CONFIGS (dynamic) =====
function getMainPanelButtons() {
  return [
    { key: 'pkmn', label: 'PKMN', onClick: () => { setSidePanelMode('party'); } },
    { key: 'dex', label: 'DEX', onClick: () => { showPokedexPanel(); } },
    { key: 'bag', label: 'BAG', onClick: () => {/* TODO: bag display */} },
    { key: 'save', label: 'SAVE', onClick: () => {/* TODO: save game */} }
  ];
}
function getBattlePanelButtons() {
  return [
    { key: 'fight', label: 'FIGHT', onClick: () => {/* TODO: attack logic */} },
    { key: 'catch', label: 'CATCH', onClick: () => { tryCatchPokemon(); } },
    { key: 'switch', label: 'SWITCH', onClick: () => { setSidePanelMode('battle_party'); } },
    { key: 'run', label: 'RUN', onClick: () => { endEncounterUI(); } }
  ];
}

// ===== SIDE PANEL RENDERER =====
function renderSidePanel(scene, buttons) {
  scene.children.removeAll();

  const canvasWidth = 684;
  const canvasHeight = 378;
  const iconWidth = 487;
  const iconHeight = 231;
  const gap = 20;
  const cols = 2;
  const rows = 2;
  const cellWidth = (canvasWidth - gap) / cols;
  const cellHeight = (canvasHeight - gap) / rows;
  const scale = Math.min(cellWidth / iconWidth, cellHeight / iconHeight);

  buttons.forEach((btn, i) => {
    if (!btn) return;
    let x, y;
    if (sidePanelMode === "main" || sidePanelMode === "battle") {
      const col = i % 2, row = Math.floor(i / 2);
      x = col * (cellWidth + gap);
      y = row * (cellHeight + gap);
    }
    if (sidePanelMode === "main") {
      let icon = scene.add.image(x, y, `${btn.key}_unhovered`)
        .setOrigin(0, 0)
        .setScale(scale)
        .setInteractive();
      icon.on('pointerover', () => icon.setTexture(`${btn.key}_hovered`));
      icon.on('pointerout', () => icon.setTexture(`${btn.key}_unhovered`));
      icon.on('pointerdown', btn.onClick);
    } else if (sidePanelMode === "battle") {
      let icon = scene.add.text(x + 60, y + 50, btn.label, { fontFamily: "monospace", fontSize: "32px", fill: "#fff", backgroundColor: "#444", padding: { x: 12, y: 4 } })
        .setInteractive()
        .on('pointerdown', btn.onClick);
    }
  });
}

// ===== PARTY PANEL RENDERER (With Add to Empty Slot) =====
function renderPartyPanel(scene, mode="party", onSelect) {
  scene.children.removeAll();
  // 2x3 grid
  const slotW = 135, slotH = 100;
  const startX = 40, startY = 40;
  for (let i = 0; i < MAX_PARTY_SIZE; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const x = startX + col * (slotW + 20);
    const y = startY + row * (slotH + 24);
}
    let name = party[i];
    let color = name ? "#fff" : "#888";
    let content = name ? name.charAt(0).toUpperCase() + name.slice(1) : "(empty)";
    let rect = scene.add.rectangle(x, y, slotW, slotH, 0x222222, 0.85).setOrigin(0, 0);
    let txt = scene.add.text(x + 10, y + 40, content, { fontFamily: "monospace", fontSize: "22px", fill: color });
    rect.setInteractive();

    if (name) {
      rect.on('pointerdown', () => {
        if (typeof onSelect === "function") onSelect(i, name);
      });
      txt.setInteractive().on('pointerdown', () => {
        if (typeof onSelect === "function") onSelect(i, name);
      });
    } else {
      // Empty slot: allow adding from Dex
      rect.on('pointerdown', () => {
        showDexAdd(scene, i, mode);
      });
      txt.setInteractive().on('pointerdown', () => {
        showDexAdd(scene, i, mode);
      });
    }
  }
  // Close button
  let closeBtn = scene.add.text(320, 330, "[Close]", { fontFamily: "monospace", fontSize: "20px", fill: "#fff" })
    .setInteractive()
    .on('pointerdown', () => {
      setSidePanelMode(mode === "battle" ? "battle" : "main");
    });
}

// ===== ADD TO EMPTY SLOT FROM DEX =====
function showDexAdd(scene, slotIdx, mode="party") {
  let dexList = pokedex.filter(name => !party.includes(name));
  let panel = scene.add.container();
  let bg = scene.add.rectangle(320, 180, 200, 280, 0x222244, 0.99);
  panel.add(bg);
  let y = 70;
  if (dexList.length === 0) {
    panel.add(
      scene.add.text(240, y, "No available Pokémon", { fontFamily: "monospace", fontSize: "18px", fill: "#fff" })
    );
    y += 30;
  } else {
    dexList.slice(0, 6).forEach((name, i) => {
      panel.add(
        scene.add.text(240, y, name.charAt(0).toUpperCase() + name.slice(1), { fontFamily: "monospace", fontSize: "18px", fill: "#fff" })
          .setInteractive()
          .on('pointerdown', () => {
            party[slotIdx] = name;
            localStorage.setItem('party', JSON.stringify(party));
            setSidePanelMode(mode);
            panel.destroy(true);
          })
      );
      y+=30;
    });
  }
  panel.add(
    scene.add.text(240, y, "[Cancel]", { fontFamily: "monospace", fontSize: "20px", fill: "#aaa" })
      .setInteractive()
      .on('pointerdown', () => {
        panel.destroy(true);
        setSidePanelMode(mode);
      })
  );
}

// ===== DEX SWITCH PANEL =====
function showDexSwitch(scene, slotIdx, mode="party") {
  let dexList = pokedex.filter(name => !party.includes(name));
  let panel = scene.add.container();
  let bg = scene.add.rectangle(320, 180, 200, 280, 0x222244, 0.99);
  panel.add(bg);
  let y = 70;
  dexList.slice(0, 6).forEach((name, i) => {
    panel.add(
      scene.add.text(240, y, name.charAt(0).toUpperCase() + name.slice(1), { fontFamily: "monospace", fontSize: "18px", fill: "#fff" })
        .setInteractive()
        .on('pointerdown', () => {
          switchPartyPokemon(slotIdx, name);
          panel.destroy(true);
          setSidePanelMode(mode);
        })
    );
    y+=30;
  });
  panel.add(
    scene.add.text(240, y, "[Cancel]", { fontFamily: "monospace", fontSize: "20px", fill: "#aaa" })
      .setInteractive()
      .on('pointerdown', () => {
        panel.destroy(true);
        setSidePanelMode(mode);
      })
  );
}

// ===== SLOT SWAP PANEL =====
function showSlotSwap(scene, slotIdx, mode="party") {
  let panel = scene.add.container();
  let bg = scene.add.rectangle(320, 180, 200, 280, 0x444422, 0.99);
  panel.add(bg);
  let y = 70;
  for (let i = 0; i < party.length; i++) {
    if (i === slotIdx) continue;
    let name = party[i];
    panel.add(
      scene.add.text(240, y, "Swap with " + (name ? name.charAt(0).toUpperCase()+name.slice(1) : "(empty)"), { fontFamily: "monospace", fontSize: "18px", fill: "#fff" })
        .setInteractive()
        .on('pointerdown', () => {
          movePartySlot(slotIdx, i);
          panel.destroy(true);
          setSidePanelMode(mode);
        })
    );
    y+=30;
  }
  panel.add(
    scene.add.text(240, y, "[Cancel]", { fontFamily: "monospace", fontSize: "20px", fill: "#aaa" })
      .setInteractive()
      .on('pointerdown', () => {
        panel.destroy(true);
        setSidePanelMode(mode);
      })
  );
}

function showPokedexPanel() {
  if (!sidePanelSceneRef) return;
  if (window.dexPanel) window.dexPanel.destroy(true);

  let panel = sidePanelSceneRef.add.container();
  window.dexPanel = panel;

  let bg = sidePanelSceneRef.add.rectangle(294, 166, 570, 320, 0x111133, 0.98);
  panel.add(bg);

  let title = sidePanelSceneRef.add.text(204, 20, "POKÉDEX", { fontFamily: "monospace", fontSize: "32px", fill: "#fff" });
  panel.add(title);

  let y = 65;
  pokedex.forEach((name, i) => {
    let inParty = party.includes(name);
    let row = sidePanelSceneRef.add.text(110, y, 
      name.charAt(0).toUpperCase()+name.slice(1) + (inParty ? " [IN PARTY]" : ""), 
      { fontFamily: "monospace", fontSize: "20px", fill: "#fff" }
    );
    panel.add(row);

    // Switch button
    if (!inParty && party.length < MAX_PARTY_SIZE) {
      let switchBtn = sidePanelSceneRef.add.text(370, y, "[Switch]", { fontFamily: "monospace", fontSize: "16px", fill: "#3f3" })
        .setInteractive()
        .on('pointerdown', () => {
          party.push(name);
          localStorage.setItem('party', JSON.stringify(party));
          showPokedexPanel();
        });
      panel.add(switchBtn);
    }

    // Remove from party
    if (inParty) {
      let removeBtn = sidePanelSceneRef.add.text(450, y, "[Remove]", { fontFamily: "monospace", fontSize: "16px", fill: "#f33" })
        .setInteractive()
        .on('pointerdown', () => {
          let idx = party.indexOf(name);
          if (idx !== -1) party.splice(idx, 1);
          localStorage.setItem('party', JSON.stringify(party));
          showPokedexPanel();
        });
      panel.add(removeBtn);
    }
    y += 28;
  });

  // Close/cancel button
  let closeBtn = sidePanelSceneRef.add.text(420, 300, "[Close]", { fontFamily: "monospace", fontSize: "20px", fill: "#fff" })
    .setInteractive()
    .on('pointerdown', () => {
      panel.destroy(true);
      window.dexPanel = null;
      setSidePanelMode("main");
    });
  panel.add(closeBtn);

  // ESC closes dex
  sidePanelSceneRef.input.keyboard.once('keydown-ESC', () => {
    if (window.dexPanel) window.dexPanel.destroy(true);
    window.dexPanel = null;
    setSidePanelMode("main");
  });
}

function setSidePanelMode(mode) {
  sidePanelMode = mode;
  if (sidePanelSceneRef) {
    if (mode === "main") {
      renderSidePanel(sidePanelSceneRef, getMainPanelButtons());
    } else if (mode === "party") {
      renderPartyPanel(sidePanelSceneRef, "party");
    } else if (mode === "battle") {
      renderSidePanel(sidePanelSceneRef, getBattlePanelButtons());
    } else if (mode === "battle_party") {
      renderPartyPanel(sidePanelSceneRef, "battle", (i, name) => {
        movePartySlot(i, 0);
        setSidePanelMode("battle");
        showEncounterSprites(currentEncounterName, party[0]);
      });
    }
  }
}

// ===== ENCOUNTER/DEX LOGIC (Battle uses DOM GIFs, not Phaser images) =====
function startEncounter(scene) {
  encounterActive = true;
  setSidePanelMode("battle");
  if (player) player.setVisible(false);
  if (treeGroup) treeGroup.setVisible(false);
  if (rockGroup) rockGroup.setVisible(false);
  if (grassGroup) grassGroup.setVisible(false);
  if (pathGroup) pathGroup.setVisible(false);

  const pokeIndex = Phaser.Math.Between(0, pokemonNames.length - 1);
  const pokeName = pokemonNames[pokeIndex];
  currentEncounterName = pokeName;
  if (battleUI) battleUI.destroy(true);
  battleUI = scene.add.container();

  // BATTLE CHAT UI (bottom-right)
  if (battleChatUI) { battleChatUI.destroy(true); }
  battleChatUI = scene.add.container();
  const chatWidth = 420, chatHeight = 80;
  const chatX = scene.sys.game.config.width - chatWidth - 30;
  const chatY = scene.sys.game.config.height - chatHeight - 30;
  const chatBg = scene.add.rectangle(chatX, chatY, chatWidth, chatHeight, 0x111111, 0.92)
    .setOrigin(0, 0)
    .setStrokeStyle(2, 0xffffff);
  const chatText = scene.add.text(chatX + 18, chatY + 16, '', {
    fontFamily: "monospace", fontSize: "20px", fill: "#fff", wordWrap: { width: chatWidth - 36 }
  });
  battleChatUI.add(chatBg);
  battleChatUI.add(chatText);
  battleChatUI.chatText = chatText;
  showBattleChatMessage(scene, `You encountered a wild ${pokeName.charAt(0).toUpperCase() + pokeName.slice(1)}!`);

  // Add animated GIFs using DOM
  let playerName = party[0] || "bulbasaur";
  showEncounterSprites(pokeName, playerName);

  // Battle UI box
  const rect = scene.add.rectangle(scene.sys.game.config.width/2, scene.sys.game.config.height/2, 640, 350, 0x222222, 0.97);
  rect.setStrokeStyle(4, 0xffffff);
  battleUI.add(rect);
}

function endEncounterUI() {
  setSidePanelMode("main");
  encounterActive = false;
  currentEncounterName = null;
  if (battleUI) { battleUI.destroy(true); battleUI = null; }
  if (battleChatUI) { battleChatUI.destroy(true); battleChatUI = null; }
  removeEncounterSprites();
  if (player) player.setVisible(true);
  if (treeGroup) treeGroup.setVisible(true);
  if (rockGroup) rockGroup.setVisible(true);
  if (grassGroup) grassGroup.setVisible(true);
  if (pathGroup) pathGroup.setVisible(true);
}

function tryCatchPokemon() {
  if (!currentEncounterName || !sidePanelSceneRef) return;
  if (Math.random() < 0.5) {
    addToDex(currentEncounterName);
    addToParty(currentEncounterName);
    showBattleChatMessage(sidePanelSceneRef.scene.scene, `Gotcha! ${currentEncounterName.charAt(0).toUpperCase() + currentEncounterName.slice(1)} was caught!`);
    setTimeout(() => {
      if (battleUI) battleUI.destroy(true);
      if (battleChatUI) battleChatUI.destroy(true);
      removeEncounterSprites();
      endEncounterUI();
    }, 1200);
  } else {
    showBattleChatMessage(sidePanelSceneRef.scene.scene, `Oh no! ${currentEncounterName.charAt(0).toUpperCase() + currentEncounterName.slice(1)} broke free!`);
  }
}

function tryEncounter(scene) {
  if (encounterActive) return;
  let standingOnGrass = false;
  grassGroup.getChildren().forEach(grass => {
    const dx = Math.abs(player.x - grass.x);
    const dy = Math.abs(player.y - grass.y);
    if (dx < TILE_SIZE/2 && dy < TILE_SIZE/2) standingOnGrass = true;
  });
  if (standingOnGrass && Math.random() < ENCOUNTER_PERCENT / 100) {
  startEncounter(scene);
  }
}

// ===== AREA GENERATION & SWITCHING =====
function generateArea(scene, ax, ay, entranceDir, previousX, previousY) {
  if (grassGroup) grassGroup.clear(true, true);
  if (pathGroup) pathGroup.clear(true, true);
  if (treeGroup) treeGroup.clear(true, true);
  if (rockGroup) rockGroup.clear(true, true);
  trees = [];
  rocks = [];

  const cols = Math.floor(scene.sys.game.config.width / TILE_SIZE);
  const rows = Math.floor(scene.sys.game.config.height / TILE_SIZE);
  const occupiedPositions = new Set();

  generatePath(scene, cols, rows, pathGroup, occupiedPositions);
  generateGrass(scene, cols, rows, grassGroup, occupiedPositions);
  generateTrees(scene, cols, rows, treeGroup, occupiedPositions);
  generateRocks(scene, cols, rows, rockGroup, occupiedPositions);

  switch (entranceDir) {
    case 'left':
      player.x = scene.sys.game.config.width - PLAYER_WIDTH / 2 - 2;
      player.y = previousY !== undefined ? previousY : scene.sys.game.config.height / 2;
      break;
    case 'right':
      player.x = PLAYER_WIDTH / 2 + 2;
      player.y = previousY !== undefined ? previousY : scene.sys.game.config.height / 2;
      break;
    case 'up':
      player.y = scene.sys.game.config.height - PLAYER_HEIGHT / 2 - 2;
      player.x = previousX !== undefined ? previousX : scene.sys.game.config.width / 2;
      break;
    case 'down':
      player.y = PLAYER_HEIGHT / 2 + 2;
      player.x = previousX !== undefined ? previousX : scene.sys.game.config.width / 2;
      break;
    default:
      player.x = scene.sys.game.config.width / 2;
      player.y = scene.sys.game.config.height / 2;
      break;
  }
  player.setDepth(player.y + 20);
}

// ===== MAIN CREATE & UPDATE =====
function create() {
  const bg = this.add.image(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    'background'
  );
  bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
  bg.setDepth(-1);

  grassGroup = this.add.group();
  pathGroup = this.add.group();
  treeGroup = this.add.group();
  rockGroup = this.add.group();

  player = this.add.sprite(
    this.sys.game.config.width/2,
    this.sys.game.config.height/2,
    'hero'
  );
  player.setDepth(player.y + 20);

  setupAnimations(this);
  cursors = this.input.keyboard.createCursorKeys();
  shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

  generateArea(this, areaX, areaY);

  if (pokedex.length === 0) {
    pokedex = ['bulbasaur', 'charmander', 'squirtle'];
    localStorage.setItem('pokedex', JSON.stringify(pokedex));
  }
  if (party.length === 0) {
    party = ['bulbasaur', 'charmander', 'squirtle'];
    localStorage.setItem('party', JSON.stringify(party));
  }
}
function update() {
  if (encounterActive) return;

  let moving = false;
  const speed = shiftKey.isDown ? 2.5 : 1.5;
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
  for (const rock of rocks) {
    if (checkCollision(playerBounds, rock)) {
      canMove = false;
      break;
    }
  }

  let exited = false, exitDir = null;
  let previousX = player.x, previousY = player.y;
  const w = mainConfig.width, h = mainConfig.height;

  if (canMove) {
    if (newX < 0) {
      areaX -= 1;
      exited = true;
      exitDir = 'right';
    } else if (newX > w) {
      areaX += 1;
      exited = true;
      exitDir = 'left';
    } else if (newY < 0) {
      areaY -= 1;
      exited = true;
      exitDir = 'down';
    } else if (newY > h) {
      areaY += 1;
      exited = true;
      exitDir = 'up';
    }
  }

  if (exited) {
    generateArea(this, areaX, areaY, exitDir, previousX, previousY);
    return;
  }

  if (canMove) {
    player.x = newX;
    player.y = newY;
    tryEncounter(this);
  }

  player.setDepth(player.y + 20);
  trees.forEach(tree => tree.sprite.setDepth(tree.sprite.y));
  rocks.forEach(rock => rock.sprite.setDepth(rock.sprite.y));
}

// ===== GAME CONFIGURATION =====
const mainConfig = {
  type: Phaser.AUTO,
  parent: 'main-game',
  width: 768,
  height: 768,
  pixelArt: true,
  scene: { preload, create, update },
  dom: { createContainer: true },
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
const sideConfig = {
  type: Phaser.AUTO,
  parent: 'side-panel',
  width: 588,
  height: 332,
  pixelArt: true,
  backgroundColor: '#333333',
  scene: { create: createSidePanel, preload: preloadSidePanel },
  dom: { createContainer: true },
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// ===== GAME INITIALIZATION =====
try {
  console.log("Initializing game...");
  const mainGame = new Phaser.Game(mainConfig);
  const sideGame = new Phaser.Game(sideConfig);

  if (!mainGame.isBooted) console.error("Main game failed to initialize!");
  if (!sideGame.isBooted) console.error("Side panel failed to initialize!");
  else console.log("Both game instances initialized successfully!");
} catch (error) {
  console.error("Game initialization failed:", error);
}

// ===== ESCAPE HANDLER FOR MENUS =====
function createSidePanel() {
  sidePanelSceneRef = this;
  setSidePanelMode("main");
  this.input.keyboard.on('keydown-ESC', () => {
    if (sidePanelMode === "party" || sidePanelMode === "battle_party") {
      setSidePanelMode(encounterActive ? "battle" : "main");
    }
    if (window.dexPanel) {
      window.dexPanel.destroy(true);
      window.dexPanel = null;
    }
  }, this);
}
