/* world-boot.js — CLASSIC SCRIPT. No export. Owns canvas + GulfWorld. */
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
  function art(name) { return g.__ART_BASE ? g.__ART_BASE + name : 'worlds/drone-persian-gulf-recon/art/' + name; }
  function boot() {
    if (g.GulfWorld && g.GulfWorld.renderer) {
      if (g.GulfRaycasterEngine && !g.GulfRaycaster) {
        g.GulfRaycasterEngine.attach(g.GulfWorld.scene, g.GulfWorld.camera, g.GulfWorld.renderer, g.GulfWorld.canvas);
      }
      return;
    }
    var c = document.getElementById('game-canvas');
    if (!c) { c = document.createElement('canvas'); c.id = 'game-canvas'; document.body.appendChild(c); }
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
    renderer.setClearColor(0x0b1a24, 1);
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1a24);
    scene.fog = new THREE.Fog(0x0b1a24, 400, 2200);
    var cam = new THREE.PerspectiveCamera(55, c.width / Math.max(1, c.height), 0.1, 8000);
    cam.position.set(0, 80, 220);
    cam.lookAt(0, 0, 0);
    scene.add(new THREE.DirectionalLight(0xffd27a, 1.1));
    scene.add(new THREE.AmbientLight(0x1a2a40, 0.7));
    var hemi = new THREE.HemisphereLight(0x87a0b4, 0x1a4a5a, 0.45);
    scene.add(hemi);
    var waterTex = new THREE.TextureLoader().load(art('tex-water-hormuz.png'));
    waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
    waterTex.repeat.set(8, 8);
    var water = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshStandardMaterial({ map: waterTex, roughness: 0.35, metalness: 0.05, color: 0x1a4a5a }));
    water.rotation.x = -Math.PI / 2;
    scene.add(water);
    g.GulfWorld = { scene: scene, camera: cam, renderer: renderer, canvas: c };
    if (g.GulfRaycasterEngine) g.GulfRaycasterEngine.attach(scene, cam, renderer, c);
    function frame(now) {
      cam.position.x = Math.sin(now / 20000) * 40;
      cam.position.z = 200 + Math.cos(now / 26000) * 20;
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
}(window));
