# bountywarz-gulf-packet

Persian Gulf flagship packet for BountyWarz.

Playable twin at repo-root `index.html` (GitHub Pages).

## Engine kit (our own components)

Classic scripts only — **no `export`**:

- `js/engine-pick.js` — `EngineCore.createRenderer` / `makeFpsMeter` / `makePick` / `earnCert`
- `js/world-boot.js` — canvas fill, water/sky, WASD fly, nearest-target copy
- `js/gulf-raycaster.js` — InstancedMesh rings through shared pick
- `js/gulf-ctf-overlay.js` — 12-pin classify loop
- `js/gulf-hud.js` — execution + evaluation gulfs from the UI/UX audit

Proof: `_engineCoreActive`, `_enginePickReady`, `_lastFps`, click a ring, H / Classify.

Training twins only. No AIS spoof recipes. No live plant.

## Live prod gap

`https://bountywarz.com/gulf` still needs a Vercel deploy (`git.deploymentEnabled=false`). Copy these classic scripts onto that app plus `data/ctf-overlay.json`.
