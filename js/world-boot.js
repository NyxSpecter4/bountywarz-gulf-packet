/* world-boot.js — synthesized Gulf theater. Classic. No export. */
(function (g) {
  'use strict';
  var retry = 0;
  var C_LAT = 26.8, C_LNG = 53.8;
  var M_PER_DEG_LAT = 110540, M_PER_DEG_LNG = 88600;
  var keys = Object.create(null);
  var last = 0, yaw = 0, pitch = -0.18;
  if (typeof g.geoToWorld !== 'function') {
    g.geoToWorld = function (lat, lng) { return [(lng - C_LNG) * M_PER_DEG_LNG, (lat - C_LAT) * M_PER_DEG_LAT]; };
  }
  if (typeof g.worldToGeo !== 'function') {
    g.worldToGeo = function (x, z) { return { lat: C_LAT + z / M_PER_DEG_LAT, lng: C_LNG + x / M_PER_DEG_LNG }; };
  }
  g.BW_WORLD = g.BW_WORLD || { id: 'persian-gulf', name: 'Persian Gulf', version: 'synth-2026-09-24', hub: '/' };
  g.__CITY_NAME = g.__CITY_NAME || 'Persian Gulf';
  g.__CERT_REGION = 'persian-gulf';
  function resize(c, cam, renderer) {
    if (!c) return;
    var w = Math.max(320, g.innerWidth || 1280), h = Math.max(240, g.innerHeight || 720);
    c.width = w; c.height = h; c.style.width = '100%'; c.style.height = '100%'; c.style.display = 'block';
    if (cam) { cam.aspect = w / Math.max(1, h); cam.updateProjectionMatrix(); }
    if (renderer) renderer.setSize(w, h, false);
  }
  function nearestPin(cam) {
    var pins = g.GULF_PINS || [];
    if (!pins.length || !cam) return null;
    var geo = g.worldToGeo(cam.position.x, cam.position.z);
    var best = null, bestD = 1e12;
    for (var i = 0; i < pins.length; i++) {
      var pin = pins[i], lon = pin.lon != null ? pin.lon : pin.lng;
      var dlat = (pin.lat - geo.lat) * M_PER_DEG_LAT, dlng = (lon - geo.lng) * M_PER_DEG_LNG;
      var d = Math.sqrt(dlat * dlat + dlng * dlng);
      if (d < bestD) { bestD = d; best = { pin: pin, index: i, km: d / 1000, meters: d }; }
    }
    return best;
  }
  function boot() {
    if (g.GulfWorld && g.GulfWorld.renderer) {
      if (g.GulfRaycasterEngine && !g.GulfRaycaster) g.GulfRaycasterEngine.attach(g.GulfWorld.scene, g.GulfWorld.camera, g.GulfWorld.renderer, g.GulfWorld.canvas);
      return;
    }
    var c = document.getElementById('game-canvas');
    if (!c) { c = document.createElement('canvas'); c.id = 'game-canvas'; document.body.insertBefore(c, document.body.firstChild); }
    resize(c);
    var THREE = g.THREE;
    if (!THREE || !THREE.WebGLRenderer) {
      retry += 1;
      if (retry < 40) { console.warn('[GulfWorld] Three.js missing — retrying'); setTimeout(boot, 250); }
      else console.error('[GulfWorld] Three.js never arrived');
      return;
    }
    var core = g.EngineCore || {};
    var renderer = (typeof core.createRenderer === 'function') ? core.createRenderer(THREE, c, { clear: 0x071018 }) : new THREE.WebGLRenderer({ canvas: c, antialias: (g.devicePixelRatio || 1) < 2 });
    if (!core.createRenderer) {
      renderer.setPixelRatio(Math.min(g.devicePixelRatio || 1, 2));
      renderer.setSize(c.width, c.height, false);
      renderer.setClearColor(0x071018, 1);
      g._engineCoreActive = false;
    }
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071018);
    scene.fog = new THREE.Fog(0x0b1a24, 400, 4200);
    var cam = new THREE.PerspectiveCamera(58, c.width / Math.max(1, c.height), 0.4, 12000);
    cam.position.set(0, 48, 180);
    scene.add(new THREE.HemisphereLight(0x9ec4d8, 0x0c2a32, 0.6));
    var sun = new THREE.DirectionalLight(0xffd27a, 1.2); sun.position.set(-220, 260, 90); scene.add(sun);
    scene.add(new THREE.AmbientLight(0x1a2a40, 0.5));
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(5200, 24, 16), new THREE.MeshBasicMaterial({ color: 0x102436, side: THREE.BackSide })));
    var water = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000, 1, 1), new THREE.MeshStandardMaterial({ color: 0x163e4c, roughness: 0.28, metalness: 0.12 }));
    water.rotation.x = -Math.PI / 2; water.name = 'gulf-water'; scene.add(water);
    var pins = g.GULF_PINS || [];
    for (var i = 0; i < pins.length; i++) {
      var pin = pins[i], lon = pin.lon != null ? pin.lon : pin.lng, xz = g.geoToWorld(pin.lat, lon);
      var pad = new THREE.Mesh(new THREE.CylinderGeometry(18, 22, 4, 8), new THREE.MeshStandardMaterial({ color: pin.faction === 'CHAOS' ? 0x7a2030 : pin.faction === 'NEO' ? 0x1a6a44 : 0x2a5a6a, roughness: 0.8 }));
      pad.position.set(xz[0], 2, xz[1]); pad.userData.pinIndex = i; scene.add(pad);
    }
    var tanker = new THREE.Mesh(new THREE.BoxGeometry(18, 6, 70), new THREE.MeshStandardMaterial({ color: 0x4a5560, roughness: 0.7 }));
    tanker.position.set(40, 3, -30); scene.add(tanker);
    g.GulfWorld = { scene: scene, camera: cam, renderer: renderer, canvas: c, water: water, drone: cam };
    if (g.GulfRaycasterEngine) g.GulfRaycasterEngine.attach(scene, cam, renderer, c);
    var combat = (typeof g.GulfCombatLiteAttach === 'function') ? g.GulfCombatLiteAttach({ THREE: THREE, scene: scene, camera: cam, tankerAnchor: { x: 40, z: -30 } }) : null;
    var fps = (typeof core.makeFpsMeter === 'function') ? core.makeFpsMeter(8) : null;
    g.addEventListener('keydown', function (e) { keys[e.key.toLowerCase()] = true; });
    g.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
    g.addEventListener('resize', function () { resize(c, cam, renderer); });
    var dragging = false;
    c.addEventListener('pointerdown', function (ev) {
      if (ev.button === 0 && !ev.shiftKey && combat) combat.fire();
      if (ev.button === 2 || ev.shiftKey) dragging = true;
    });
    g.addEventListener('pointerup', function () { dragging = false; });
    g.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      yaw -= ev.movementX * 0.005;
      pitch = Math.max(-1.2, Math.min(0.35, pitch - ev.movementY * 0.004));
    });
    c.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    function frame(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      if (fps) fps.tick(dt);
      if (!g.__GULF_PAUSED) {
        var speed = (keys.shift ? 220 : 90) * dt;
        var forward = (keys.w || keys.arrowup) ? 1 : (keys.s || keys.arrowdown) ? -1 : 0;
        var strafe = (keys.d || keys.arrowright) ? 1 : (keys.a || keys.arrowleft) ? -1 : 0;
        var lift = keys.e ? 1 : keys.q ? -1 : 0;
        if (forward || strafe || lift) {
          cam.position.x += Math.sin(yaw) * forward * speed + Math.cos(yaw) * strafe * speed;
          cam.position.z += Math.cos(yaw) * forward * speed - Math.sin(yaw) * strafe * speed;
          cam.position.y = Math.max(8, Math.min(420, cam.position.y + lift * speed));
        }
        if (combat) combat.tick(dt);
      }
      cam.rotation.order = 'YXZ'; cam.rotation.y = yaw; cam.rotation.x = pitch;
      var n = nearestPin(cam);
      g._gulfNearest = n;
      if (n && n.pin) {
        var m = Math.round(n.meters);
        g._gulfTargetCopy = { name: n.pin.name || n.pin.id, sub: m < 400 ? 'IN RANGE · H / Classify' : ('Fly closer · ' + m + ' m'), inRange: m < 400, meters: m, index: n.index };
      } else {
        g._gulfTargetCopy = { name: 'NO TARGET', sub: 'WASD fly · K intercept · L escort', inRange: false, meters: null, index: -1 };
      }
      try { g.dispatchEvent(new Event('gulf-hud-tick')); } catch (_) {}
      renderer.render(scene, cam);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    console.info('[GulfWorld] synth boot', c.width + 'x' + c.height, 'pins=' + pins.length, 'core=' + !!g._engineCoreActive);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}(typeof window !== 'undefined' ? window : this));
