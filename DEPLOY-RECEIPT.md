# Gulf playable twin — deploy receipt (2026-09-25)

## VERIFIED state of this repo root (the playable game)

All labels re-verified this session, exit 0:

- `GULF-SYNTH-GATE: 8 VERIFIED, 0 MISSING, 0 FAIL` (real gate run against this checkout)
- `tests/gulf-fire-smoke.test.js`: 5/5 — click fires, drag-look does NOT fire, 0.18s cooldown respected, __GULF_PAUSED blocks fire
- `tests/gulf-synth-gate.test.js`: 3/3
- All 14 js/*.js parse-checked clean (node --check, 0 failures)
- index.html: all 4 referenced local assets present, THREE loaded from CDN before world-boot (SYN-07)
- No build step required: this repo root IS the static site (index.html + js/ + data/ + worlds/)

## Product defect fixed this session

- SYN-05 was the one real FAIL: SYNTHESIS.md advertises "click/Space fire" but click/tap fire
  was never wired (only Space/F keys). Fixed in js/gulf-combat-lite.js: pointerdown marks the
  press point, pointerup within an 8px radius fires, drag cancels the shot, pointercancel
  clears it, cooldown + pause gate shared with the Space/F path. Smoke-tested headless 5/5.

## One-step deploy (the only remaining step for the paid /gulf)

The repo root is already flat and static. To serve it:

- Vercel: Import Project -> this repo, main branch, framework "Other", output dir = repo root. Zero config.
- Firebase: `firebase deploy --only hosting` with public dir = repo root.
- Any static host: copy the repo root as-is.

## Known honest limits

- WebGL rendering itself is browser-only: the headless smoke covers combat logic, not pixels.
  On-deploy check: open /, pick a site, click anywhere -> green tracer + ops strip message.
- The paid kinetigor.com/gulf currently serves the pre-synthesis 27-component artifact; this
  repo is the synthesized successor. Swapping the host target to this repo root completes it.
