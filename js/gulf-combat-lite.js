/* gulf-combat-lite.js — Zagros intercept + Hormuz escort on the shared kit. Classic. */
(function (g) {
  'use strict';
  if (g.GulfCombatLite) return;
  function attach(env) {
    var T = env.THREE, scene = env.scene, cam = env.camera;
    var projectiles = [], bandits = [], boats = [];
    var mode = null, fireCd = 0, kills = 0, tankerHp = 100;
    var anchor = env.tankerAnchor || { x: 40, z: -30 };
    function ops(msg) {
      g._gulfOps = msg;
      try { g.dispatchEvent(new CustomEvent('gulf-ops', { detail: msg })); } catch (_) {}
    }
    function fire() {
      if (!T || fireCd > 0 || g.__GULF_PAUSED) return;
      fireCd = 0.18;
      var dir = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).normalize();
      var mesh = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 2.6, 6), new T.MeshBasicMaterial({ color: 0x7dffb3 }));
      mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir);
      mesh.position.copy(cam.position).add(dir.clone().multiplyScalar(4));
      mesh.userData = { v: dir.multiplyScalar(170), life: 2.4 };
      scene.add(mesh); projectiles.push(mesh);
    }
    function makeBandit() {
      var grp = new T.Group();
      var body = new T.Mesh(new T.ConeGeometry(2.2, 6, 4), new T.MeshPhongMaterial({ color: 0xa02010 }));
      body.rotation.x = Math.PI / 2; grp.add(body); return grp;
    }
    function spawnZagros() {
      clear(); mode = 'zagros'; kills = 0;
      var base = cam.position;
      for (var i = 0; i < 3; i++) {
        var ang = (i / 3) * Math.PI * 2;
        var m = makeBandit();
        m.position.set(base.x + Math.cos(ang) * 220, 30 + i * 8, base.z + Math.sin(ang) * 220);
        scene.add(m); bandits.push({ mesh: m, hp: 30, phase: i });
      }
      ops('ZAGROS INTERCEPT — WAVE 1');
    }
    function spawnEscort() {
      clear(); mode = 'escort'; kills = 0; tankerHp = 100;
      for (var i = 0; i < 6; i++) {
        var hull = new T.Mesh(new T.BoxGeometry(5, 1.4, 11), new T.MeshPhongMaterial({ color: 0x2a2122 }));
        hull.position.set(anchor.x + 80 + i * 18, 0.8, anchor.z + (i - 3) * 16);
        scene.add(hull); boats.push({ mesh: hull, hp: 20 });
      }
      ops('HORMUZ ESCORT — USV CONTACTS EAST');
    }
    function clear() {
      bandits.forEach(function (b) { scene.remove(b.mesh); });
      boats.forEach(function (b) { scene.remove(b.mesh); });
      projectiles.forEach(function (p) { scene.remove(p); });
      bandits = []; boats = []; projectiles = []; mode = null;
    }
    function tick(dt) {
      if (g.__GULF_PAUSED) return;
      fireCd = Math.max(0, fireCd - dt);
      var i, j, p, b, dx, dz, dist;
      for (i = projectiles.length - 1; i >= 0; i--) {
        p = projectiles[i];
        p.position.add(p.userData.v.clone().multiplyScalar(dt));
        p.userData.life -= dt;
        if (p.userData.life <= 0) { scene.remove(p); projectiles.splice(i, 1); continue; }
        if (mode === 'zagros') {
          for (j = 0; j < bandits.length; j++) {
            b = bandits[j];
            if (p.position.distanceTo(b.mesh.position) < 6) {
              b.hp -= 10; scene.remove(p); projectiles.splice(i, 1);
              if (b.hp <= 0) {
                scene.remove(b.mesh); bandits.splice(j, 1); kills++;
                ops('AIR-TO-AIR +150 · ' + kills + ' kills');
                if (g.EngineCore && g.EngineCore.earnCert) g.EngineCore.earnCert('zagros-kill', String(b.phase));
              }
              break;
            }
          }
        } else if (mode === 'escort') {
          for (j = 0; j < boats.length; j++) {
            b = boats[j];
            if (p.position.distanceTo(b.mesh.position) < 7) {
              b.hp -= 10; scene.remove(p); projectiles.splice(i, 1);
              if (b.hp <= 0) {
                scene.remove(b.mesh); boats.splice(j, 1); kills++;
                ops('USV SPLASH +60 · ' + kills);
              }
              break;
            }
          }
        }
      }
      if (mode === 'zagros') {
        for (i = 0; i < bandits.length; i++) {
          b = bandits[i];
          dx = cam.position.x - b.mesh.position.x; dz = cam.position.z - b.mesh.position.z;
          dist = Math.sqrt(dx * dx + dz * dz) || 1;
          b.mesh.position.x += (dx / dist) * 22 * dt;
          b.mesh.position.z += (dz / dist) * 22 * dt;
          b.mesh.position.y += (cam.position.y - b.mesh.position.y) * 0.3 * dt;
        }
        if (!bandits.length) { ops('ZAGROS SECTOR CLEARED'); mode = null; }
      }
      if (mode === 'escort') {
        for (i = 0; i < boats.length; i++) {
          b = boats[i];
          dx = anchor.x - b.mesh.position.x; dz = anchor.z - b.mesh.position.z;
          dist = Math.sqrt(dx * dx + dz * dz) || 1;
          b.mesh.position.x += (dx / dist) * 8 * dt;
          b.mesh.position.z += (dz / dist) * 8 * dt;
          if (dist < 8) {
            tankerHp -= 10; scene.remove(b.mesh); boats.splice(i, 1); i--;
            ops('RAM — VLCC ' + tankerHp + '%');
            if (tankerHp <= 0) { ops('VLCC LOST'); mode = null; }
          }
        }
        if (mode === 'escort' && !boats.length && tankerHp > 0) { ops('CONVOY SAFE +750'); mode = null; }
      }
      g._gulfCombat = { mode: mode, kills: kills, tankerHp: tankerHp };
    }
    g.addEventListener('keydown', function (e) {
      var k = e.key.toLowerCase();
      if (k === 'k') { if (mode === 'zagros') { clear(); ops('ZAGROS HANDED OFF'); } else spawnZagros(); }
      if (k === 'l') { if (mode === 'escort') { clear(); ops('ESCORT WITHDRAWN'); } else spawnEscort(); }
      if (k === ' ' || k === 'f') fire();
    });
    g.GulfCombatLite = { tick: tick, fire: fire, zagros: spawnZagros, escort: spawnEscort, clear: clear };
    return g.GulfCombatLite;
  }
  g.GulfCombatLiteAttach = attach;
}(typeof window !== 'undefined' ? window : this));
