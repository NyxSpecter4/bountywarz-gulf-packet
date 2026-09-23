/* world-boot.js — CLASSIC SCRIPT. No export. Fixes /gulf ESM parse crash. */
(function (g) {
  'use strict';
  var retry = 0;
  function resize(c) {
    if (!c) return;
    var w = Math.max(320, g.innerWidth || 1280);
    var h = Math.max(240, g.innerHeight || 720);
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    c.style.width = '100%';
    c.style.height = '100%';
    c.style.display = 'block';
  }
  function boot() {
    var c = document.getElementById('game-canvas');
    if (!c) {
      c = document.createElement('canvas');
      c.id = 'game-canvas';
      document.body.appendChild(c);
    }
    resize(c);
    g.addEventListener('resize', function () { resize(c); });

    var THREE = g.THREE;
    if (!THREE || !THREE.WebGLRenderer) {
      retry += 1;
      if (retry < 40) {
        console.warn('[GulfWorld] boot deps missing — retrying');
        setTimeout(boot, 250);
      } else {
        console.error('[GulfWorld] Three.js never arrived');
        paintFallback(c);
      }
      return;
    }

    var renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(g.devicePixelRatio || 1, 1.5));
    renderer.setSize(c.width, c.height, false);
    renderer.setClearColor(0x06060e, 1);

    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(55, c.width / Math.max(1, c.height), 0.1, 4000);
    cam.position.set(0, 80, 220);
    cam.lookAt(0, 0, 0);

    var light = new THREE.DirectionalLight(0xffd27a, 1.1);
    light.position.set(-40, 80, 20);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x1a2a40, 0.7));

    var waterTex = new THREE.TextureLoader().load(
      'worlds/drone-persian-gulf-recon/art/tex-water-hormuz.png'
    );
    waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
    waterTex.repeat.set(8, 8);
    var water = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 2400, 1, 1),
      new THREE.MeshStandardMaterial({ map: waterTex, roughness: 0.35, metalness: 0.05, color: 0x1a4a5a })
    );
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    var skyTex = new THREE.TextureLoader().load(
      'worlds/drone-persian-gulf-recon/art/sky-gulf-dusk.png'
    );
    scene.background = skyTex;

    // GPS pins as instanced rings — one draw
    var pins = (g.GULF_PINS || []).slice(0, 16);
    var ringGeo = new THREE.RingGeometry(6, 8, 24);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    var rings = new THREE.InstancedMesh(ringGeo, ringMat, Math.max(1, pins.length));
    var dummy = new THREE.Object3D();
    var origin = { lat: 26.5667, lon: 56.25 };
    function project(lat, lon) {
      return {
        x: (lon - origin.lon) * 900,
        z: (origin.lat - lat) * 900
      };
    }
    for (var i = 0; i < pins.length; i++) {
      var p = project(pins[i].lat, pins[i].lon);
      dummy.position.set(p.x, 2.5, p.z);
      dummy.rotation.x = -Math.PI / 2;
      dummy.updateMatrix();
      rings.setMatrixAt(i, dummy.matrix);
    }
    scene.add(rings);

    g.GulfWorld = {
      scene: scene,
      camera: cam,
      renderer: renderer,
      canvas: c,
      pins: pins,
      nearest: null
    };

    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();
    g.GulfRaycaster = raycaster;
    c.addEventListener('pointerdown', function (ev) {
      var r = c.getBoundingClientRect();
      pointer.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointer, cam);
      var hits = raycaster.intersectObject(rings);
      if (hits.length && g.GulfCTF && g.GulfCTF.openNearest) g.GulfCTF.openNearest();
    });

    var t0 = performance.now();
    function frame(now) {
      var t = (now - t0) / 1000;
      cam.position.x = Math.sin(t * 0.05) * 30;
      cam.lookAt(0, 0, 0);
      if (c.width !== g.innerWidth || c.height !== g.innerHeight) {
        resize(c);
        cam.aspect = c.width / Math.max(1, c.height);
        cam.updateProjectionMatrix();
        renderer.setSize(c.width, c.height, false);
      }
      renderer.render(scene, cam);
      g._lastFps = 60;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    console.info('[GulfWorld] booted classic script — canvas', c.width, 'x', c.height, 'pins', pins.length);
  }

  function paintFallback(c) {
    var ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#06060e';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#d4af37';
    ctx.font = '16px JetBrains Mono, monospace';
    ctx.fillText('GULF TWIN — renderer fallback', 24, 40);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
