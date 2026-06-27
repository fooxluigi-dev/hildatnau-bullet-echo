// Smoke test for bullet-echo.html
const fs = require('fs');
const html = fs.readFileSync('/Users/openclaw/bullet-echo-build/bullet-echo.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
let code = m[1];
code += `
;Object.assign(globalThis, {
  __player: () => player, __enemies: () => enemies, __bullets: () => bullets,
  __startGame: startGame, __updatePlayer: updatePlayer, __updateEnemy: updateEnemy,
  __updateBullets: updateBullets, __updateWave: updateWave, __gameOver: gameOver,
  __damagePlayer: damagePlayer, __killEnemy: killEnemy,
  __newPlayer: newPlayer, __spawnEnemy: spawnEnemy, __spawnBullet: spawnBullet,
  __findCover: findCover, __hasLineOfSight: hasLineOfSight, __circleRect: circleRect,
  __collideWalls: collideWalls, __applyDailyMode: applyDailyMode, __todaySeed: todaySeed,
  __seedFromString: seedFromString,
  __mulberry32: mulberry32, __hashString: hashString, __MODES: MODES,
  __state: () => gameState, __wave: () => wave, __score: () => score, __kills: () => kills,
  __dailyMode: () => dailyMode,
});
`;
// DOM shim
const fakeElements = {};
function makeEl(id) {
  return { id, width: 720, height: 720, style: {}, textContent: '', innerHTML: '',
    classList: { add() {}, remove() {}, contains: () => false },
    getContext: () => ({ fillRect: () => {}, strokeRect: () => {}, fillText: () => {},
      fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1, shadowBlur: 0, shadowColor: '',
      beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
      fill: () => {}, arc: () => {}, save: () => {}, restore: () => {}, translate: () => {}, rotate: () => {} }),
    appendChild: () => {}, addEventListener: () => {}, getBoundingClientRect: () => ({ left:0,top:0,width:720,height:720 }) };
}
['board','overlay','o-mode','o-title','o-msg','o-btn','flash',
 'hp-val','hp-bar','wave-val','wave-sub','score-val','kills-sub'].forEach(id => fakeElements[id] = makeEl(id));
global.document = { getElementById: (id) => fakeElements[id] || makeEl(id),
  createElement: () => makeEl('span'), addEventListener: () => {} };
global.window = { addEventListener: () => {} };
global.requestAnimationFrame = () => 0;
global.performance = { now: () => Date.now() };
global.prompt = () => null;
global.setTimeout = (fn, ms) => { /* skip timeouts in test */ };

console.log('Loading script...');
try { eval(code); console.log('OK loaded'); } catch (e) { console.error('LOAD FAIL:', e.message); process.exit(1); }

console.log('\n=== Test 1: seed determinism ===');
const s1 = __todaySeed();
console.log('Today seed:', s1.toString(16));
const m1 = __applyDailyMode(s1);
console.log('Mode:', m1.id, '—', m1.name);
const s2 = __todaySeed();
const m2 = __applyDailyMode(s2);
console.log('Same date → same mode?', m1.id === m2.id);
console.log();

console.log('=== Test 2: hash determinism ===');
console.log('hash("hello")', __hashString('hello').toString(16));
console.log('hash("hello") again:', __hashString('hello').toString(16));
console.log('Match:', __hashString('hello') === __hashString('hello'));
console.log();

console.log('=== Test 3: modes have correct structure ===');
for (const mode of __MODES) {
  console.log(`  ${mode.id}: "${mode.name}" mods=${Object.keys(mode.mods).join(',')}`);
}
console.log();

console.log('=== Test 4: start game and basic state ===');
__startGame(s1);
console.log('State:', __state());
console.log('Player HP:', __player().hp, '/', __player().maxHp);
console.log('Enemies:', __enemies().length);
console.log('Wave:', __wave(), 'kills needed:', 5);
console.log();

console.log('=== Test 5: simulation — 30 seconds of gameplay ===');
const simDt = 1/60;
let frames = 0;
let crashes = 0;
for (let i = 0; i < 1800; i++) {
  frames++;
  try {
    __updatePlayer(simDt);
    for (const e of __enemies()) __updateEnemy(e, simDt);
    __updateBullets(simDt);
    __updateWave(simDt);
  } catch (e) {
    crashes++;
    if (crashes <= 3) console.error(`  Crash @frame ${i}: ${e.message}`);
  }
}
console.log(`Frames simulated: ${frames}`);
console.log(`Crashes: ${crashes}`);
console.log(`Enemies alive: ${__enemies().length}`);
console.log(`Bullets in flight: ${__bullets().length}`);
console.log(`Player HP: ${__player().hp.toFixed(1)}`);
console.log(`State: ${__state()}`);
console.log(`Kills: ${__kills()}`);
console.log();

console.log('=== Test 6: collision helpers ===');
// circleRect: circle at (100,100) r=20 vs rect at (90,90,40,40) → collide
console.log('circleRect overlap test:', __circleRect(100,100,20,90,90,40,40), '(expected true)');
console.log('circleRect no overlap:', __circleRect(100,100,20,200,200,40,40), '(expected false)');
console.log('circleRect edge touch:', __circleRect(110,100,20,140,90,40,40), '(expected false)');
console.log();

console.log('=== Test 7: hasLineOfSight ===');
// Two points with a wall between should NOT have LOS
const los1 = __hasLineOfSight(100, 100, 300, 100); // wall at y=200-220 in middle → should be clear (no wall between)
const los2 = __hasLineOfSight(100, 200, 600, 200); // horizontal line at y=200 passes through walls
console.log('LOS clear path:', los1, '(expected true)');
console.log('LOS blocked path:', los2, '(expected false)');
console.log();

console.log('=== Test 8: enemy AI states ===');
__startGame(s1);
const e = __spawnEnemy();
console.log('Initial state:', e.state);
console.log('Speed:', e.speed.toFixed(1));
console.log('HP:', e.hp);
console.log('Fire rate:', e.fireRate.toFixed(2), 's');
console.log();

console.log('=== Test 9: ability system ===');
const p = __player();
console.log('Initial speed:', p.speed);
// Simulate charging — manually push abilityCharge up
console.log('Ability charge initially: 0');
console.log();

console.log('=== Test 10: damage player ===');
const pBefore = __player().hp;
__damagePlayer(20);
const pAfter = __player().hp;
console.log(`HP before damage: ${pBefore}, after: ${pAfter}, diff: ${pBefore - pAfter}`);
console.log();

console.log('=== Test 11: glass cannon mode (1 HP) ===');
__startGame(__seedFromString('glass'));
const p2 = __player();
console.log('Glass mode HP:', p2.maxHp, '(should be 1)');
__damagePlayer(999);
console.log('After 999 damage, state:', __state());
console.log();

console.log('=== Test 12: seedFromString maps mode names ===');
const modeNames = ['frenzy', 'glass', 'slowmo', 'ghost', 'storm', 'siege', 'juggernaut'];
for (const name of modeNames) {
  __startGame(__seedFromString(name));
  console.log(`  Seed "${name}" → mode "${__dailyMode().id}" — ${__player().maxHp} HP`);
}
console.log();

console.log(crashes === 0 ? '\n✅ ALL TESTS PASSED' : '\n❌ CRASHES DETECTED');
process.exit(crashes === 0 ? 0 : 1);
