# bountywarz-gulf-packet

Persian Gulf flagship packet for BountyWarz.

- Playable twin (GitHub Pages / this repo root `index.html`)
- Specs under `worlds/drone-persian-gulf-recon/`
- Classic scripts only (`js/world-boot.js`, `js/gulf-ctf-overlay.js`) — **no `export`** so they will not throw `Unexpected token 'export'` if dropped onto `/gulf`

## Live prod gap

`https://bountywarz.com/gulf` still 404s these files. Copy this repo’s `js/world-boot.js` and `js/gulf-ctf-overlay.js` onto that app, plus `data/ctf-overlay.json`. The twin here is the sandbox classify loop (12 GPS pins, red quizzes, flags). No AIS spoof recipes. No live plant.

## Revoke leaked tokens

If a PAT was pasted into chat, revoke it in GitHub Settings → Developer settings → Tokens.
