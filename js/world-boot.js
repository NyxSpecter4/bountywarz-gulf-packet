/* world-boot.js — CLASSIC SCRIPT. No export. */
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
      if (retry < 40) { console.warn('[GulfWorld] boot deps missing — retrying'); setTimeout(boot, 250); }
      else { console.error('[GulfWorld] Three.js never arrived'); }
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
    scene.add(new THREE.DirectionalLight(0xffd27a, 1.1));
    scene.add(new THREE.AmbientLight(0x1a2a40, 0.7));
    var waterTex = new THREE.TextureLoader().load('worlds/drone-persian-gulf-recon/art/tex-water-hormuz.png');
    waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
    waterTex.repeat.set(8, 8);
    var water = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshStandardMaterial({ map: waterTex, roughness: 0.35, metalness: 0.05, color: 0x1a4a5a }));
    water.rotation.x = -Math.PI / 2;
    scene.add(water);
    scene.background = new THREE.TextureLoader().load('worlds/drone-persian-gulf-recon/art/sky-gulf-dusk.png');
    var ringGeo = new THREE.RingGeometry(6, 8, 24);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    var rings = new THREE.InstancedMesh(ringGeo, ringMat, 16);
    scene.add(rings);
    function layoutPins(pins) {
      var dummy = new THREE.Object3D();
      var origin = { lat: 26.5667, lon: 56.25 };
      var n = Math.min(16, pins.length);
      for (var i = 0; i < n; i++) {
        dummy.position.set((pins[i].lon - origin.lon) * 900, 2.5, (origin.lat - pins[i].lat) * 900);
        dummy.rotation.x = -Math.PI / 2;
        dummy.updateMatrix();
        rings.setMatrixAt(i, dummy.matrix);
      }
      rings.count = Math.max(1, n);
      rings.instanceMatrix.needsUpdate = true;
    }
    layoutPins(g.GULF_PINS || []);
    g.addEventListener('gulf-pins-ready', function () { layoutPins(g.GULF_PINS || []); console.info('[GulfWorld] pins attached', (g.GULF_PINS || []).length); });
    g.GulfWorld = { scene: scene, camera: cam, renderer: renderer, canvas: c };
    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();
    g.GulfRaycaster = raycaster;
    c.addEventListener('pointerdown', function (ev) {
      var r = c.getBoundingClientRect();
      pointer.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointer, cam);
      if (raycaster.intersectObject(rings).length && g.GulfCTF) g.GulfCTF.openNearest();
    });
    function frame(now) {
      cam.position.x = Math.sin(now / 20000) * 30;
      cam.lookAt(0, 0, 0);
      if (c.width !== g.innerWidth || c.height !== g.innerHeight) {
        resize(c);
        cam.aspect = c.width / Math.max(1, c.height);
        cam.updateProjectionMatrix();
        renderer.setSize(c.width, c.height, false);
      }
      renderer.render(scene, cam);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    console.info('[GulfWorld] booted classic script — canvas', c.width, 'x', c.height);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
