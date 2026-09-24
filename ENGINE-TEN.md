# How our own kit gets to 10

A 10 is not a new renderer. It is **one** kit on **one** URL.

## This pass — 2026-09-24

Playable twin (`bountywarz-gulf-packet`) now boots on EngineCore:

- `js/engine-pick.js` — classic `createRenderer` / `makeFpsMeter` / `makePick` / `earnCert` (no `export`)
- `js/world-boot.js` — uses the kit, fills the canvas, WASD fly, nearest-target copy
- `js/gulf-raycaster.js` — InstancedMesh rings + stems through `makePick`
- `js/gulf-hud.js` — execution gulf (what to do) + evaluation gulf (yes / hold)
- Thumb-zone 48px actions from the mobile UI audit

Proof flags: `_engineCoreActive`, `_enginePickReady`, `_lastFps`, click ring opens classify.

## Remaining on paid `/gulf`

1. Deploy master (Vercel `git.deploymentEnabled=false`).
2. `scripts/build-with-gulf.cjs` already flatten + patches engine-core ESM.
3. Do not load `engine-core.js` as a classic script.
4. Replace leftover `new THREE.Raycaster()` only as worlds are touched.
