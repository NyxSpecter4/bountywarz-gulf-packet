/* world-boot.js — CLASSIC SCRIPT. No export.
 * Owns canvas + GulfWorld. Uses EngineCore.createRenderer / makeFpsMeter when present.
 */
(function (g) {
  'use strict';
  var retry = 0;
  var C_LAT = 26.5667, C_LNG = 56.25;
  var M_PER_DEG_LAT = 110540, M_PER_DEG_LNG = 99000;
  var keys = Object.create(null);
  var last = 0;
  var yaw = 0;
  var pitch = -0.18;

  if (typeof g.geoToWorld !== 'function') {
    g.geoToWorld = function (lat, lng) {
      return [(lng - C_LNG) * M_PER_DEG_LNG, (C_LAT - lat) * M_PER_DEG_LAT];
    };
  }
  if (typeof g.worldToGeo !== 'function') {
    g.worldToGeo = function (x, z) {
      return { lat: C_LAT - z / M_PER_DEG_LAT, lng: C_LNG + x / M_PER_DEG_LNG };
    };
  }

  g.BW_WORLD = g.BW_WORLD || {
    id: 'persian-gulf',
    name: 'Persian Gulf',
    version: 'engine-kit-2026-09-24',
    hub: '/'
  };
  g.__CITY_NAME = g.__CITY_NAME || 'Persian Gulf';
  g.__ART_BASE = g.__ART_BASE || 'worlds/drone-persian-gulf-recon/art/';
  g.__CERT_REGION = 'persian-gulf';

  function resize(c, cam, renderer) {
    if (!c) return;
    var w = Math.max(320, g.innerWidth || 1280);
    var h = Math.max(240, g.innerHeight || 720);
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    c.style.width = '100%';
    c.style.height = '100%';
    c.style.display = 'block';
    if (cam) {
      cam.aspect = w / Math.max(1, h);
      cam.updateProjectionMatrix();
    }
    if (renderer) renderer.setSize(w, h, false);
  }

  function art(name) {
    return (g.__ART_BASE || 'worlds/drone-persian-gulf-recon/art/') + name;
  }

  function nearestPin(cam) {
    var pins = g.GULF_PINS || [];
    if (!pins.length || !cam) return null;
    var geo = g.worldToGeo(cam.position.x, cam.position.z);
    var best = null, bestD = 1e9;
    var dist = g.GulfRaycaster && g.GulfRaycaster.distKm;
    for (var i = 0; i < pins.length; i++) {
      var pin = pins[i];
      var d;
      if (dist) d = dist(geo, { lat: pin.lat, lon: pin.lon != null ? pin.lon : pin.lng });
      else d = Math.abs(pin.lat - geo.lat) + Math.abs((pin.lon != null ? pin.lon : pin.lng) - geo.lng);
      if (d < bestD) { bestD = d; best = { pin: pin, index: i, km: d }; }
    }
    return best;
  }

  function boot() {
    if (g.GulfWorld && g.GulfWorld.renderer) {
      if (g.GulfRaycasterEngine && !g.GulfRaycaster) {
        g.GulfRaycasterEngine.attach(g.GulfWorld.scene, g.GulfWorld.camera, g.GulfWorld.renderer, g.GulfWorld.canvas);
      }
      return;
    }
    var c = document.getElementById('game-canvas');
    if (!c) {
      c = document.createElement('canvas');
      c.id = 'game-canvas';
      document.body.appendChild(c);
    }
    resize(c);
    var THREE = g.THREE;
    if (!THREE || !THREE.WebGLRenderer) {
      retry += 1;
      if (retry < 40) {
        console.warn('[GulfWorld] boot deps missing — retrying');
        setTimeout(boot, 250);
      } else {
        console.error('[GulfWorld] Three.js never arrived');
      }
      return;
    }

    var core = g.EngineCore || {};
    var renderer = (typeof core.createRenderer === 'function')
      ? core.createRenderer(THREE, c, { clear: 0x071018 })
      : new THREE.WebGLRenderer({ canvas: c, antialias: (g.devicePixelRatio || 1) < 2, alpha: false });
    if (!core.createRenderer) {
      renderer.setPixelRatio(Math.min(g.devicePixelRatio || 1, 2));
      renderer.setSize(c.width, c.height, false);
      renderer.setClearColor(0x071018, 1);
      g._engineCoreActive = false;
    }
    g._enginePickReady = !!g._enginePickReady;

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071018);
    scene.fog = new THREE.Fog(0x0b1a24, 280, 2600);

    var cam = new THREE.PerspectiveCamera(58, c.width / Math.max(1, c.height), 0.4, 9000);
    cam.position.set(0, 42, 160);

    scene.add(new THREE.HemisphereLight(0x9ec4d8, 0x0c2a32, 0.55));
    var sun = new THREE.DirectionalLight(0xffd27a, 1.15);
    sun.position.set(-180, 220, 80);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x1a2a40, 0.55));

    var sky = new THREE.Mesh(
      new THREE.SphereGeometry(4200, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0x102436, side: THREE.BackSide })
    );
    scene.add(sky);

    var loader = new THREE.TextureLoader();
    var waterMat = new THREE.MeshStandardMaterial({
      color: 0x163e4c,
      roughness: 0.32,
      metalness: 0.08
    });
    loader.load(art('tex-water-hormuz.png'), function (tex) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(10, 10);
      waterMat.map = tex;
      waterMat.needsUpdate = true;
    }, undefined, function () {});
    var water = new THREE.Mesh(new THREE.PlaneGeometry(3200, 3200, 1, 1), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.name = 'gulf-water';
    scene.add(water);

    var quay = new THREE.Mesh(
      new THREE.BoxGeometry(90, 6, 28),
      new THREE.MeshStandardMaterial({ color: 0x4a5560, roughness: 0.85 })
    );
    quay.position.set(-40, 3, -20);
    scene.add(quay);

    g.GulfWorld = { scene: scene, camera: cam, renderer: renderer, canvas: c, water: water };
    if (g.GulfRaycasterEngine) g.GulfRaycasterEngine.attach(scene, cam, renderer, c);

    var fps = (typeof core.makeFpsMeter === 'function') ? core.makeFpsMeter(8) : null;

    g.addEventListener('keydown', function (e) { keys[e.key.toLowerCase()] = true; });
    g.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
    g.addEventListener('resize', function () { resize(c, cam, renderer); });

    var dragging = false;
    c.addEventListener('pointerdown', function (ev) {
      if (ev.button === 2 || ev.shiftKey) dragging = true;
    });
    g.addEventListener('pointerup', function () { dragging = false; });
    g.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      yaw -= ev.movementX * 0.005;
      pitch = Math.max(-1.2, Math.min(0.35, pitch - ev.movementY * 0.004));
    });
    c.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    function applyLook() {
      cam.rotation.order = 'YXZ';
      cam.rotation.y = yaw;
      cam.rotation.x = pitch;
    }

    function frame(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      if (fps) fps.tick(dt);

      var speed = (keys.shift ? 180 : 78) * dt;
      var forward = (keys.w || keys.arrowup) ? 1 : (keys.s || keys.arrowdown) ? -1 : 0;
      var strafe = (keys.d || keys.arrowright) ? 1 : (keys.a || keys.arrowleft) ? -1 : 0;
      var lift = keys.e ? 1 : keys.q ? -1 : 0;
      if (forward || strafe || lift) {
        cam.position.x += Math.sin(yaw) * forward * speed + Math.cos(yaw) * strafe * speed;
        cam.position.z += Math.cos(yaw) * forward * speed - Math.sin(yaw) * strafe * speed;
        cam.position.y = Math.max(8, Math.min(220, cam.position.y + lift * speed));
      } else {
        cam.position.x += Math.sin(now / 28000) * 0.08;
      }
      applyLook();

      var n = nearestPin(cam);
      g._gulfNearest = n;
      if (n && n.pin) {
        var m = Math.round(n.km * 1000);
        g._gulfTargetCopy = {
          name: n.pin.name || n.pin.id,
          sub: m < 400 ? 'IN RANGE · press H or tap Classify' : ('Fly closer · ' + m + ' m'),
          inRange: m < 400,
          meters: m,
          index: n.index
        };
      } else {
        g._gulfTargetCopy = { name: 'NO TARGET', sub: 'Wait for pins · or tap a site', inRange: false, meters: null, index: -1 };
      }
      try { g.dispatchEvent(new Event('gulf-hud-tick')); } catch (_) {}

      renderer.render(scene, cam);
      requestAnimationFrame(frame);
    }
    applyLook();
    requestAnimationFrame(frame);
    console.info('[GulfWorld] engine kit boot', c.width + 'x' + c.height, 'core=' + !!g._engineCoreActive, 'pick=' + !!g._enginePickReady);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}(window));
