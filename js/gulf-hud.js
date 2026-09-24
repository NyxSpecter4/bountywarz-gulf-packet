/* gulf-hud.js — execution + evaluation + combat ops. Classic. */
(function (g) {
  'use strict';
  var role = 'red_quiz';
  function $(id) { return document.getElementById(id); }
  function setText(id, text) { var el = $(id); if (el) el.textContent = text; }
  function paintRole() {
    var map = { red_quiz: 'RED', blue_quiz: 'BLUE', purple_quiz: 'PURPLE' };
    setText('hud-role', map[role] || 'RED');
    document.querySelectorAll('[data-role]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-role') === role); });
    if (g.GulfCTF && g.GulfCTF.setRole) g.GulfCTF.setRole(role);
  }
  function paintTarget() {
    var t = g._gulfTargetCopy || { name: 'Acquiring theater…', sub: 'WASD · K · L', inRange: false, meters: null };
    setText('tg-name', t.name || '—');
    setText('tg-site', t.sub || '');
    var chip = $('tg-range');
    if (chip) { chip.textContent = t.inRange ? 'IN RANGE' : (t.meters != null ? t.meters + ' m' : '—'); chip.className = 'range' + (t.inRange ? ' ok' : ''); }
    setText('hud-fps', String(g._lastFps || '—'));
    var engine = $('hud-engine');
    if (engine) {
      var st = (g.__GULF_UI && g.__GULF_UI.state) || (g._engineCoreActive ? 'CORE' : 'LOCAL');
      engine.textContent = st + (g._enginePickReady ? '+PICK' : '');
    }
    if (g._gulfOps) setText('hud-ops', g._gulfOps);
    var cbt = g._gulfCombat;
    if (cbt && $('hud-combat')) {
      $('hud-combat').textContent = cbt.mode ? (cbt.mode.toUpperCase() + ' · KILLS ' + cbt.kills + (cbt.mode === 'escort' ? ' · VLCC ' + cbt.tankerHp + '%' : '')) : 'K intercept · L escort · click fire';
    }
  }
  function paintEval(detail) {
    var el = $('hud-eval');
    if (!el || !detail) return;
    el.textContent = detail.ok ? ('YES · ' + (detail.name || 'classified')) : ('HOLD · ' + (detail.teach || 'try another class'));
    el.className = 'eval ' + (detail.ok ? 'ok' : 'miss');
    el.style.display = 'block';
  }
  function bind() {
    document.querySelectorAll('[data-role]').forEach(function (b) {
      b.addEventListener('click', function () { role = b.getAttribute('data-role'); paintRole(); });
    });
    var classify = $('btn-classify');
    if (classify) classify.addEventListener('click', function () { if (g.GulfCTF && g.GulfCTF.openNearest) g.GulfCTF.openNearest(); });
    var fly = $('btn-fly');
    if (fly) fly.addEventListener('click', function () {
      var n = g._gulfNearest, cam = g.GulfWorld && g.GulfWorld.camera;
      if (!n || !n.pin || !cam || typeof g.geoToWorld !== 'function') return;
      var lon = n.pin.lon != null ? n.pin.lon : n.pin.lng, xz = g.geoToWorld(n.pin.lat, lon);
      cam.position.set(xz[0], 28, xz[1] + 40);
    });
    g.addEventListener('gulf-hud-tick', paintTarget);
    g.addEventListener('gulf-classify', function (ev) { paintEval(ev.detail || {}); });
    g.addEventListener('gulf-ops', paintTarget);
    g.addEventListener('keydown', function (e) {
      if (e.key === '1') role = 'red_quiz';
      if (e.key === '2') role = 'blue_quiz';
      if (e.key === '3') role = 'purple_quiz';
      paintRole();
    });
    paintRole(); paintTarget();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
}(typeof window !== 'undefined' ? window : this));
