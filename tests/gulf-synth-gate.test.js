// gulf-synth-gate.test.js — proves the synthesis-contract gate both directions: a twin that
// honors the synthesis contract passes clean; a twin that regresses (BUILDING_TWINS wait,
// ESM engine, boot-before-THREE, ignored pause, wrong site count) FAILs with labeled
// findings — never a silent pass.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { gate } = require('../gulf-synth-gate.js');
let passed = 0, failed = 0;
const test = (n, f) => { try { f(); passed++; console.log(`  ok - ${n}`); } catch (e) { failed++; console.error(`  FAIL - ${n}: ${e.message}`); } };

function mkTwin(dir, over = {}) {
  fs.mkdirSync(path.join(dir, 'js'), { recursive: true });
  const files = Object.assign({
    'index.html': '<script src="https://cdn/three.min.js"></script><script src="js/world-boot.js"></script>',
    'js/world-boot.js': 'const renderer = EngineCore.createRenderer(); renderer.render(scene);\n',
    'js/engine-pick.js': 'function pick(x){ return x; }\n',
    'js/gulf-sites.js': Array.from({ length: 12 }, (_, i) => `const s${i} = { id: 'site-${i}', lat: 26 + i * 0.2, lng: 50 + i * 0.3 };`).join('\n') + '\n',
    'js/gulf-combat-lite.js': "addEventListener('keydown', e => { if (e.code === 'KeyK') intercept(); if (e.code === 'KeyL') escort(); }); canvas.addEventListener('click', fire); if (!__GULF_PAUSED) tick();\n",
    'js/gulf-ui-state.js': 'function GulfUIState(){}\n',
    'js/gulf-hud-theme.js': 'function GulfHudTheme(){}\n'
  }, over);
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), body);
}

test('synthesis-honoring twin passes the gate clean, exit 0', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'twin-ok-'));
  mkTwin(dir);
  const r = gate(dir);
  assert.strictEqual(r.exit, 0);
  assert.strictEqual(r.receipt.failed, 0);
  assert.strictEqual(r.receipt.verified, 8);
});

test('regressed twin FAILs with labeled findings — the exact paid-/gulf death modes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'twin-bad-'));
  mkTwin(dir, {
    'index.html': '<script src="js/world-boot.js"></script><script src="three.min.js"></script>', // boot BEFORE three
    'js/world-boot.js': "if (state === 'BUILDING_TWINS') { waitFor('engine-core'); } // dead loop\n",
    'js/engine-pick.js': 'export function pick(x){ return x; }\n',
    'js/gulf-sites.js': Array.from({ length: 9 }, (_, i) => `const s${i} = { id: 'site-${i}' };`).join('\n') + '\n',
    'js/gulf-combat-lite.js': "addEventListener('keydown', e => { if (e.code === 'KeyK') intercept(); });\n" // no L, no pause gate
  });
  // this twin never adopted the audit kit — SYN-08 must label it MISSING, not FAIL
  fs.rmSync(path.join(dir, 'js', 'gulf-ui-state.js'));
  fs.rmSync(path.join(dir, 'js', 'gulf-hud-theme.js'));
  const r = gate(dir);
  assert.strictEqual(r.exit, 1);
  const byId = Object.fromEntries(r.receipt.findings.map(f => [f.id, f]));
  assert.strictEqual(byId['SYN-01'].status, 'FAIL', 'BUILDING_TWINS wait must FAIL');
  assert.strictEqual(byId['SYN-02'].status, 'FAIL', 'no own renderer must FAIL');
  assert.strictEqual(byId['SYN-03'].status, 'FAIL', 'ESM export in engine kit must FAIL');
  assert.strictEqual(byId['SYN-04'].status, 'FAIL', '9 sites must FAIL (expected 12)');
  assert.strictEqual(byId['SYN-05'].status, 'FAIL', 'missing L escort must FAIL');
  assert.strictEqual(byId['SYN-06'].status, 'FAIL', 'ignored __GULF_PAUSED must FAIL');
  assert.strictEqual(byId['SYN-07'].status, 'FAIL', 'boot-before-THREE must FAIL (black-HUD regression)');
  assert.strictEqual(byId['SYN-08'].status, 'MISSING', 'absent audit kit is MISSING, not FAIL');
});

test('partial twin labels honestly: missing files are MISSING, never counted as passes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'twin-partial-'));
  fs.mkdirSync(path.join(dir, 'js'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'js', 'world-boot.js'), 'EngineCore.createRenderer();\n');
  const r = gate(dir);
  assert.strictEqual(r.exit, 0, 'MISSING is honest, not a FAIL');
  assert.strictEqual(r.receipt.missing >= 5, true, 'absent components labeled MISSING');
  assert.strictEqual(r.receipt.verified, 2, 'only SYN-01/02 could verify');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
