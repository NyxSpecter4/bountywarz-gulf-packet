/* gulf-raycaster.js — Mako-owned pick engine. Classic script. No export. */
(function (g) {
  'use strict';
  var ORIGIN = { lat: 26.5667, lon: 56.25 };
  var SCALE = 900;
  function pinToWorld(pin) {
    if (typeof g.geoToWorld === 'function' && pin.lat != null && (pin.lon != null || pin.lng != null)) {
      var xz = g.geoToWorld(pin.lat, pin.lon != null ? pin.lon : pin.lng);
      return { x: xz[0], y: 2.5, z: xz[1] };
    }
    return {
      x: ((pin.lon != null ? pin.lon : pin.lng) - ORIGIN.lon) * SCALE,
      y: 2.5,
      z: (ORIGIN.lat - pin.lat) * SCALE
    };
  }
  function worldToLatLon(pos) {
    if (typeof g.worldToGeo === 'function') {
      var geo = g.worldToGeo(pos.x, pos.z);
      return { lat: geo.lat, lon: geo.lng };
    }
    return { lat: ORIGIN.lat - pos.z / SCALE, lon: ORIGIN.lon + pos.x / SCALE };
  }
  function here() {
    var cam = g.GulfWorld && g.GulfWorld.camera;
    if (cam && cam.position) return worldToLatLon(cam.position);
    return { lat: ORIGIN.lat, lon: ORIGIN.lon };
  }
  function distKm(a, b) {
    var R = 6371;
    var dLat = (b.lat - a.lat) * Math.PI / 180;
    var dLon = (b.lon - a.lon) * Math.PI / 180;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }
  function attach(scene, camera, renderer, canvas) {
    var THREE = g.THREE;
    if (!THREE || !scene || !camera || !canvas) return null;
    var ringGeo = new THREE.RingGeometry(6, 8, 24);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    var rings = new THREE.InstancedMesh(ringGeo, ringMat, 32);
    rings.name = 'gulf-pin-rings';
    scene.add(rings);
    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();
    var dummy = new THREE.Object3D();
    function layout(pins) {
      pins = pins || g.GULF_PINS || [];
      var n = Math.min(32, pins.length);
      for (var i = 0; i < n; i++) {
        var w = pinToWorld(pins[i]);
        dummy.position.set(w.x, w.y, w.z);
        dummy.rotation.x = -Math.PI / 2;
        dummy.updateMatrix();
        rings.setMatrixAt(i, dummy.matrix);
      }
      rings.count = Math.max(1, n);
      rings.instanceMatrix.needsUpdate = true;
    }
    function pickIndex(ev) {
      var r = canvas.getBoundingClientRect();
      pointer.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      var hits = raycaster.intersectObject(rings);
      if (!hits.length) return -1;
      var inst = hits[0].instanceId;
      return inst == null ? 0 : inst;
    }
    canvas.addEventListener('pointerdown', function (ev) {
      var i = pickIndex(ev);
      if (i < 0) return;
      var pin = (g.GULF_PINS || [])[i];
      if (g.GulfCTF && g.GulfCTF.openPin) g.GulfCTF.openPin(i);
      else if (g.GulfCTF && g.GulfCTF.openNearest) g.GulfCTF.openNearest();
      try { g.dispatchEvent(new CustomEvent('gulf-pin-hit', { detail: { index: i, pin: pin } })); } catch (_) {}
    });
    layout(g.GULF_PINS || []);
    g.addEventListener('gulf-pins-ready', function () { layout(g.GULF_PINS || []); });
    g.GulfRaycaster = { rings: rings, raycaster: raycaster, layout: layout, pickIndex: pickIndex, here: here, pinToWorld: pinToWorld, worldToLatLon: worldToLatLon, distKm: distKm };
    return g.GulfRaycaster;
  }
  g.GulfRaycasterEngine = { attach: attach, here: here, distKm: distKm, pinToWorld: pinToWorld };
}(window));
