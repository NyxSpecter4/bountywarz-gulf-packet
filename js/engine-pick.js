/* js/engine-pick.js — shared EngineCore kit. Classic script. No export.
 * createRenderer / makeFpsMeter / makePick attach to window.EngineCore.
 * AA off on high-DPI. Does not import engine-core (that file is ESM).
 */
(function (g) {
  'use strict';
  var core = g.EngineCore || {};
  g.EngineCore = core;

  function createRenderer(THREE, canvas, opts) {
    opts = opts || {};
    var useAA = (g.devicePixelRatio || 1) < 2;
    var r = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: useAA,
      powerPreference: 'high-performance',
      alpha: !!opts.alpha
    });
    var w = canvas.clientWidth || g.innerWidth || 1280;
    var h = canvas.clientHeight || g.innerHeight || 720;
    r.setPixelRatio(Math.min(g.devicePixelRatio || 1, 2));
    r.setSize(w, h, false);
    if (opts.clear != null) r.setClearColor(opts.clear, 1);
    g._aaActive = useAA;
    g._engineCoreActive = true;
    return r;
  }

  function makeFpsMeter(everyN) {
    everyN = everyN || 10;
    var hist = [];
    var frame = 0;
    return {
      tick: function (dt) {
        if (!dt) return;
        hist.push(1 / dt);
        if (hist.length > 60) hist.shift();
        if (++frame % everyN === 0) {
          var sum = 0;
          for (var i = 0; i < hist.length; i++) sum += hist[i];
          g._lastFps = Math.round(sum / hist.length);
        }
      },
      get: function () { return g._lastFps || 0; }
    };
  }

  function makePick(THREE, camera, canvas, targets) {
    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();
    function hit(ev, objects) {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      pointer.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      var list = objects || targets || [];
      if (!list.length) return null;
      var hits = raycaster.intersectObjects(list, true);
      if (!hits.length) return null;
      var h = hits[0];
      return {
        object: h.object,
        point: h.point,
        distance: h.distance,
        instanceId: h.instanceId == null ? null : h.instanceId
      };
    }
    function bind(onHit) {
      canvas.addEventListener('pointerdown', function (ev) {
        var h = hit(ev);
        if (h && onHit) onHit(h, ev);
      });
    }
    return { raycaster: raycaster, pointer: pointer, hit: hit, bind: bind };
  }

  function earnCert(id, note) {
    g._gulfCerts = g._gulfCerts || {};
    if (id) g._gulfCerts[id] = { t: Date.now(), note: note || '' };
    try {
      g.dispatchEvent(new CustomEvent('gulf-cert', { detail: { id: id, note: note } }));
    } catch (_) {}
    if (typeof core.earnCert === 'function' && core.earnCert !== earnCert) {
      try { core.earnCert(id, note); } catch (_) {}
    }
  }

  if (typeof core.createRenderer !== 'function') core.createRenderer = createRenderer;
  if (typeof core.makeFpsMeter !== 'function') core.makeFpsMeter = makeFpsMeter;
  if (typeof core.earnCert !== 'function') core.earnCert = earnCert;
  core.makePick = makePick;
  g._enginePickReady = true;
}(typeof window !== 'undefined' ? window : globalThis));
