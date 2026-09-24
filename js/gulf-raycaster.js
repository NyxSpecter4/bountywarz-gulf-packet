/* gulf-raycaster.js — EngineCore.makePick rings. Classic. No export. */
(function (g) {
  'use strict';
  var ORIGIN = { lat: 26.5667, lon: 56.25 };
  var SCALE = 900;

  function pinToWorld(pin) {
    if (typeof g.geoToWorld === 'function' && pin.lat != null && (pin.lon != null || pin.lng != null)) {
      var xz = g.geoToWorld(pin.lat, pin.lon != null ? pin.lon : pin.lng);
      return { x: xz[0], y: 3.2, z: xz[1] };
    }
    return {
      x: ((pin.lon != null ? pin.lon : pin.lng) - ORIGIN.lon) * SCALE,
      y: 3.2,
      z: (ORIGIN.lat - pin.lat) * SCALE
    };
  }

  function worldToLatLon(pos) {
    if (typeof g.worldToGeo === 'function') {
      var geo = g.worldToGeo(pos.x, pos.z);
      return { lat: geo.lat, lon: geo.lng != null ? geo.lng : geo.lon };
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
    if (g.GulfRaycaster && g.GulfRaycaster.rings) return g.GulfRaycaster;

    var ringGeo = new THREE.RingGeometry(7, 10, 28);
    var ringMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    var rings = new THREE.InstancedMesh(ringGeo, ringMat, 32);
    rings.name = 'gulf-pin-rings';
    scene.add(rings);

    var stemGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 6);
    var stemMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.55 });
    var stems = new THREE.InstancedMesh(stemGeo, stemMat, 32);
    stems.name = 'gulf-pin-stems';
    scene.add(stems);

    var dummy = new THREE.Object3D();

    function layout(pins) {
      pins = pins || g.GULF_PINS || [];
      var n = Math.min(32, pins.length);
      for (var i = 0; i < n; i++) {
        var w = pinToWorld(pins[i]);
        dummy.position.set(w.x, w.y, w.z);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        rings.setMatrixAt(i, dummy.matrix);
        dummy.position.set(w.x, 4, w.z);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        stems.setMatrixAt(i, dummy.matrix);
      }
      rings.count = Math.max(1, n);
      stems.count = Math.max(1, n);
      rings.instanceMatrix.needsUpdate = true;
      stems.instanceMatrix.needsUpdate = true;
    }

    var pick = (g.EngineCore && g.EngineCore.makePick)
      ? g.EngineCore.makePick(THREE, camera, canvas, [rings])
      : null;
    var raycaster = pick ? pick.raycaster : new THREE.Raycaster();
    var pointer = pick ? pick.pointer : new THREE.Vector2();

    function pickIndex(ev) {
      if (pick) {
        var h = pick.hit(ev, [rings]);
        if (!h) return -1;
        return h.instanceId == null ? 0 : h.instanceId;
      }
      var r = canvas.getBoundingClientRect();
      pointer.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      var hits = raycaster.intersectObject(rings);
      if (!hits.length) return -1;
      return hits[0].instanceId == null ? 0 : hits[0].instanceId;
    }

    canvas.addEventListener('pointerdown', function (ev) {
      if (ev.shiftKey || ev.button === 2) return;
      var i = pickIndex(ev);
      if (i < 0) return;
      var pin = (g.GULF_PINS || [])[i];
      if (g.EngineCore && typeof g.EngineCore.earnCert === 'function') {
        g.EngineCore.earnCert('gulf-pin-hit', pin && pin.id);
      }
      if (g.GulfCTF && g.GulfCTF.openPin) g.GulfCTF.openPin(i);
      try { g.dispatchEvent(new CustomEvent('gulf-pin-hit', { detail: { index: i, pin: pin } })); } catch (_) {}
    });

    layout(g.GULF_PINS || []);
    g.addEventListener('gulf-pins-ready', function () { layout(g.GULF_PINS || []); });

    g.GulfRaycaster = {
      rings: rings,
      stems: stems,
      raycaster: raycaster,
      layout: layout,
      pickIndex: pickIndex,
      pick: pick,
      here: here,
      pinToWorld: pinToWorld,
      worldToLatLon: worldToLatLon,
      distKm: distKm
    };
    return g.GulfRaycaster;
  }

  g.GulfRaycasterEngine = { attach: attach, here: here, distKm: distKm, pinToWorld: pinToWorld };
}(window));
