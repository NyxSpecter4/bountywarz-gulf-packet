// gulf-synth-gate.js — verifies the SYNTHESIS contract on the twin checkout (runs from disk
// where bountywarz-gulf-packet lives; the GitHub connector is SHA-only for these private
// repos). Each behavioral claim in SYNTHESIS.md becomes a labeled rule; exit 0 only when
// nothing FAILs. MISSING is honest — never simulated, never a pass by default.
//
//   node gulf-synth-gate.js [--root=<twin checkout dir>]
'use strict';
const fs = require('fs');
const path = require('path');

function readIfExists(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } }

function gate(root) {
  root = root || __dirname;
  const jsDir = path.join(root, 'js');
  const files = {};
  for (const name of ['world-boot.js', 'engine-pick.js', 'gulf-sites.js', 'gulf-combat-lite.js', 'gulf-runtime.js', 'gulf-ui-state.js', 'gulf-hud-theme.js']) {
    files[name] = readIfExists(path.join(jsDir, name));
  }
  const index = readIfExists(path.join(root, 'index.html'));
  const findings = [];
  const rule = (id, name, status, details) => { findings.push({ id, name, status, details }); console.log(`${status === 'VERIFIED' ? 'ok ' : '!! '} ${id} ${name}: ${status}${details ? ' — ' + details : ''}`); };

  // SYN-01: the death loop is gone — the boot path must NOT wait on BUILDING_TWINS / ESM engine-core
  const boot = files['world-boot.js'];
  if (!boot) rule('SYN-01', 'boot file present', 'MISSING', 'js/world-boot.js not found at root');
  else {
    const waits = ['BUILDING_TWINS', 'engine-core'].filter(s => boot.includes(s));
    rule('SYN-01', 'no BUILDING_TWINS / engine-core wait in the boot path', waits.length === 0 ? 'VERIFIED' : 'FAIL',
      waits.length === 0 ? 'boot does not reference the dead wait states' : `boot still references: ${waits.join(', ')}`);
  }

  // SYN-02: the boot path creates its OWN renderer — no dependency on a foreign engine's
  const creates = !!boot && /createRenderer|WebGLRenderer/.test(boot);
  rule('SYN-02', 'twin owns its renderer (createRenderer/WebGLRenderer in world-boot.js)', boot ? (creates ? 'VERIFIED' : 'FAIL') : 'MISSING',
    !boot ? 'no boot file' : creates ? 'renderer created in the twin' : 'no renderer creation found — back to waiting on someone else');

  // SYN-03: classic scripts only — no ESM export/import in the engine kit
  const engine = files['engine-pick.js'];
  if (!engine) rule('SYN-03', 'engine-pick is classic (no export/import)', 'MISSING', 'js/engine-pick.js not found');
  else {
    const esm = (engine.match(/^\s*(export|import)\s/m) || []).length;
    rule('SYN-03', 'engine-pick is classic (no top-level export/import)', esm === 0 ? 'VERIFIED' : 'FAIL',
      esm === 0 ? 'classic script — loads in any <script> tag' : `${esm} top-level ESM statement(s) break non-module loading`);
  }

  // SYN-04: 12 site pads on the real basin projection (Kharg -> Qeshm bounds)
  const sites = files['gulf-sites.js'];
  if (!sites) rule('SYN-04', '12 site pads in basin bounds', 'MISSING', 'js/gulf-sites.js not found');
  else {
    const ids = (sites.match(/id\s*[:=]\s*['"][^'"]+['"]/g) || []);
    const coords = sites.match(/lat|lon|lng/gi) || [];
    rule('SYN-04', '12 site pads with basin coordinates', ids.length === 12 ? 'VERIFIED' : 'FAIL',
      ids.length === 12 ? `12 site ids, ${coords.length} coordinate refs` : `expected 12 site ids, found ${ids.length}`);
  }

  // SYN-05: combat wiring — K Zagros intercept + L USV escort + fire input
  const combat = files['gulf-combat-lite.js'];
  if (!combat) rule('SYN-05', 'K intercept / L escort / fire wired in combat-lite', 'MISSING', 'js/gulf-combat-lite.js not found');
  else {
    const hasK = /KeyK|'k'|"k"/i.test(combat), hasL = /KeyL|'l'|"l"/i.test(combat), hasFire = /click|pointerdown|Space/i.test(combat);
    rule('SYN-05', 'K intercept / L escort / fire wired in combat-lite', (hasK && hasL && hasFire) ? 'VERIFIED' : 'FAIL',
      `K=${hasK} L=${hasL} fire=${hasFire}`);
  }

  // SYN-06: combat honors the state machine pause (__GULF_PAUSED)
  const honors = !!(combat && combat.includes('__GULF_PAUSED'));
  rule('SYN-06', 'combat honors __GULF_PAUSED from the state machine', combat ? (honors ? 'VERIFIED' : 'FAIL') : 'MISSING',
    !combat ? 'no combat file' : honors ? 'pause gate respected' : '__GULF_PAUSED not referenced — combat runs while paused');

  // SYN-07: index.html loads THREE BEFORE world-boot (the black-HUD fix, structural)
  if (!index) rule('SYN-07', 'index.html loads THREE before world-boot', 'MISSING', 'index.html not readable');
  else {
    const three = index.search(/three(\.min)?\.js|THREE/i);
    const bootRef = index.search(/world-boot\.js/);
    rule('SYN-07', 'index.html loads THREE before world-boot', (three !== -1 && bootRef !== -1 && three < bootRef) ? 'VERIFIED' : 'FAIL',
      three === -1 ? 'THREE not referenced in index.html' : bootRef === -1 ? 'world-boot not referenced' : three < bootRef ? 'order correct' : 'world-boot loads BEFORE THREE — black HUD regression');
  }

  // SYN-08: the state machine + theme kit from the audit pass are present in the twin
  const kit = !!files['gulf-ui-state.js'] && !!files['gulf-hud-theme.js'];
  rule('SYN-08', 'audit kit present (gulf-ui-state.js + gulf-hud-theme.js)', kit ? 'VERIFIED' : 'MISSING',
    kit ? 'labeled state machine + WCAG theme carried into the twin' : 'audit kit not found in js/');

  const failed = findings.filter(f => f.status === 'FAIL');
  const receipt = { run: 'GULF-SYNTH-GATE', root, generated_at: new Date().toISOString(),
    verified: findings.filter(f => f.status === 'VERIFIED').length,
    missing: findings.filter(f => f.status === 'MISSING').length,
    failed: failed.length, findings };
  console.log('\n--- GULF-SYNTH-GATE RECEIPT ---');
  console.log(JSON.stringify(receipt, null, 2));
  console.log(`\nGULF-SYNTH-GATE: ${receipt.verified} VERIFIED, ${receipt.missing} MISSING (labeled), ${failed.length} FAIL`);
  return { exit: failed.length === 0 ? 0 : 1, receipt };
}

module.exports = { gate };

if (require.main === module) {
  const root = (process.argv.find(a => a.startsWith('--root=')) || '').split('=')[1] || __dirname;
  process.exit(gate(root).exit);
}
