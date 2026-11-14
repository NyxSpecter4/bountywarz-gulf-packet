> ## HISTORICAL — superseded by the ONE APP (marked 2026-11-14; do not read as current estate direction)
>
> This packet is the **old Persian Gulf flagship** of BountyWarz, retained as history. The estate's current product is **THE ONE APP — Kinetigor's single cognitive surface**, live at https://kinetigor.com (one bundle, aligned apexes, one identity contract).
>
> Canonical sources for current state: the `NyxSpecter4/bountywarz` repository README and its canonical orientation block; the three governing P0 issues there (#1425 Atomic Journey · #1426 Time to Verified Outcome · #1427 Physical Return Loop); the Sea Trial baseline (#120 · 569 · 4 human-banked flags); and the operational gate (one candidate completing the physical return loop).
>
> The "Live prod gap" section below is an **obsolete TODO from the old-game era** — `bountywarz.com` is now an aligned apex of the one app, and this packet is **not slated for deploy**. Do not deploy this packet.
>
> Content below preserved unchanged.

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
