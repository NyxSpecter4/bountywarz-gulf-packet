// Headless smoke: proves click-fire fires, drag does NOT, pause gates fire.
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../js/gulf-combat-lite.js', 'utf8');
let pass = 0, fail = 0;
const ok = (c, n) => { c ? (pass++, console.log('  PASS ' + n)) : (fail++, console.error('  FAIL ' + n)); };

const listeners = {};
const fakeG = {
  addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
  dispatchEvent: () => true,
};
eval(src.replace('}(typeof window !== \'undefined\' ? window : this));', '}(fakeG));'));

// fake THREE with minimal vector/mesh plumbing
const fakeT = {
  Vector3: class { constructor(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0;} applyQuaternion(){return this;} normalize(){return this;} clone(){return Object.assign(Object.create(Object.getPrototypeOf(this)),this);} multiplyScalar(){return this;} setFromUnitVectors(){return this;} copy(){return this;} add(){return this;} },
  Quaternion: class {}, Group: class { add(){} constructor(){ this.position = {}; } },
  Mesh: class { constructor(){ const chain = { copy(){return chain;}, add(){return chain;}, addScalar(){return chain;} }; this.position = chain; this.quaternion = { setFromUnitVectors(){} }; this.userData = {}; } },
  CylinderGeometry: class {}, ConeGeometry: class {}, MeshBasicMaterial: class {}, MeshPhongMaterial: class {},
};
const shots = [];
const env = { THREE: fakeT, scene: { add: (m) => shots.push(m) }, camera: { position: {}, quaternion: {} } };
fakeG.GulfCombatLiteAttach(env);

const fireCount = () => shots.length;
ok(fakeG.GulfCombatLite && typeof fakeG.GulfCombatLite.fire === 'function', 'combat attaches with fire() exported');

// click: down+up same point -> fires
listeners['pointerdown'].forEach(f => f({ clientX: 100, clientY: 100 }));
listeners['pointerup'].forEach(f => f({ clientX: 103, clientY: 98 }));
ok(fireCount() === 1, 'click (down+up <8px) fires exactly one shot');

// drag: down+up far apart -> no fire
listeners['pointerdown'].forEach(f => f({ clientX: 100, clientY: 100 }));
listeners['pointerup'].forEach(f => f({ clientX: 260, clientY: 240 }));
ok(fireCount() === 1, 'drag-look does NOT fire');

// cooldown: immediate second click is suppressed (0.18s cd)
listeners['pointerdown'].forEach(f => f({ clientX: 10, clientY: 10 }));
listeners['pointerup'].forEach(f => f({ clientX: 10, clientY: 10 }));
ok(fireCount() === 1, 'fire cooldown respected (no double-shot)');

// pause gate: __GULF_PAUSED blocks fire
fakeG.__GULF_PAUSED = true;
fakeG.GulfCombatLite.tick(1.0); // burn cooldown
listeners['pointerdown'].forEach(f => f({ clientX: 5, clientY: 5 }));
listeners['pointerup'].forEach(f => f({ clientX: 5, clientY: 5 }));
ok(fireCount() === 1, '__GULF_PAUSED blocks click-fire');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
