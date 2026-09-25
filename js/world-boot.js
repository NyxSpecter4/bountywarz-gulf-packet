/* world-boot.js — WASD + RANGE.origin */
(function (g) {
  'use strict';
  var retry = 0, keys = {}, yaw = 0, pitch = -0.18, flying = false;
  function resize(c) {
    var w = Math.max(320, g.innerWidth || 1280), h = Math.max(240, g.innerHeight || 720);
    c.width = w; c.height = h; c.style.width = '100%'; c.style.height = '100%';
  }
  function project(lat, lon, origin) {
    return { x: (lon - origin.lon) * 900, z: (origin.lat - lat) * 900 };
  }
  function boot() {
    var c = document.getElementById('game-canvas');
    if (!c) return;
    resize(c);
    var THREE = g.THREE;
    if (!THREE || !THREE.WebGLRenderer) { if (++retry < 40) return setTimeout(boot, 250); return; }
    var renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true });
    renderer.setPixelRatio(Math.min(g.devicePixelRatio || 1, 1.5));
    renderer.setSize(c.width, c.height, false);
    renderer.setClearColor(0x0a1620, 1);
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a1620, 400, 2200);
    var cam = new THREE.PerspectiveCamera(60, c.width / Math.max(1, c.height), 0.5, 5000);
    cam.position.set(0, 70, 160);
    scene.add(new THREE.HemisphereLight(0x8ec8e8, 0x0a1a14, 0.85));
    var sun = new THREE.DirectionalLight(0xffd27a, 1.15); sun.position.set(-80, 140, 40); scene.add(sun);
    var water = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ color: 0x143844, roughness: 0.28 }));
    water.rotation.x = -Math.PI / 2; scene.add(water);
    var origin = (g.RANGE && g.RANGE.origin) || { lat: 26.5667, lon: 56.25 };
    var beacons = [];
    function rebuildPins() {
      beacons.forEach(function (b) { scene.remove(b.mesh); }); beacons = [];
      (g.GULF_PINS || []).forEach(function (pin, i) {
        var p = project(pin.lat, pin.lon || pin.lng, origin);
        var group = new THREE.Group();
        var stem = new THREE.Mesh(new THREE.BoxGeometry(8, 36, 8), new THREE.MeshStandardMaterial({ color: i === 0 ? 0xe2c36b : 0x3ec7d6 }));
        stem.position.y = 18;
        var ring = new THREE.Mesh(new THREE.RingGeometry(14, 18, 24), new THREE.MeshBasicMaterial({ color: 0x3ec7d6, side: THREE.DoubleSide, transparent: true, opacity: 0.75 }));
        ring.rotation.x = -Math.PI / 2; ring.position.y = 1.2;
        group.add(stem); group.add(ring); group.position.set(p.x, 0, p.z); scene.add(group);
        beacons.push({ mesh: group, x: p.x, z: p.z });
      });
    }
    rebuildPins(); g.addEventListener('gulf-pins-ready', rebuildPins);
    function applyLook() { cam.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ')); }
    applyLook();
    function flyToIndex(i) {
      var b = beacons[i]; if (!b) return;
      flying = { x: b.x - Math.sin(yaw) * 70, y: 48, z: b.z - Math.cos(yaw) * 70 };
    }
    g.addEventListener('gulf-fly', function (ev) { if (ev && ev.detail && typeof ev.detail.index === 'number') flyToIndex(ev.detail.index); });
    g.addEventListener('keydown', function (e) { keys[e.key.toLowerCase()] = true; if (e.code === 'Space') { keys.space = true; e.preventDefault(); } });
    g.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; if (e.code === 'Space') keys.space = false; });
    c.addEventListener('click', function () { if (c.requestPointerLock) c.requestPointerLock(); });
    g.addEventListener('mousemove', function (e) {
      if (document.pointerLockElement !== c) return;
      yaw -= e.movementX * 0.0022; pitch -= e.movementY * 0.0022;
      if (pitch > 1.2) pitch = 1.2; if (pitch < -1.35) pitch = -1.35;
    });
    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      applyLook();
      var forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion); forward.y = 0; if (forward.lengthSq()) forward.normalize();
      var right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion); right.y = 0; if (right.lengthSq()) right.normalize();
      var speed = (keys.shift ? 180 : 70) * dt;
      if (keys.w || keys.arrowup) cam.position.addScaledVector(forward, speed);
      if (keys.s || keys.arrowdown) cam.position.addScaledVector(forward, -speed);
      if (keys.d || keys.arrowright) cam.position.addScaledVector(right, speed);
      if (keys.a || keys.arrowleft) cam.position.addScaledVector(right, -speed);
      if (keys.space || keys.e) cam.position.y += speed;
      if (keys.q) cam.position.y -= speed;
      if (cam.position.y < 8) cam.position.y = 8;
      if (flying) {
        cam.position.x += (flying.x - cam.position.x) * Math.min(1, dt * 3);
        cam.position.y += (flying.y - cam.position.y) * Math.min(1, dt * 3);
        cam.position.z += (flying.z - cam.position.z) * Math.min(1, dt * 3);
        if (Math.abs(cam.position.x - flying.x) < 2) flying = false;
      }
      renderer.render(scene, cam);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window);
