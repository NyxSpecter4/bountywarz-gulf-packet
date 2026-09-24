/* gulf-ctf-overlay.js — classify loop. Classic script. No export. */
(function (g) {
  'use strict';
  var STORE = 'bw_gulf_solved_v2';
  var overlay = null;
  var idx = 0;
  var role = 'red_quiz';
  function $(id) { return document.getElementById(id); }
  function assetCandidates(file) {
    var path = g.location && g.location.pathname || '';
    var list = ['data/' + file, '/worlds/drone-persian-gulf/data/' + file, '/worlds/drone-persian-gulf-recon/data/' + file, '/data/' + file];
    if (path.indexOf('/gulf') === 0) list.unshift('/worlds/drone-persian-gulf/data/' + file);
    return list;
  }
  function fetchFirst(files) {
    var i = 0;
    function next() {
      if (i >= files.length) return Promise.reject(new Error('overlay json missing'));
      var url = files[i++];
      return fetch(url, { cache: 'no-store' }).then(function (r) {
        if (!r.ok) return next();
        return r.json();
      }).catch(function () { return next(); });
    }
    return next();
  }
  function loadSolved() { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (_) { return {}; } }
  function saveSolved(map) { try { localStorage.setItem(STORE, JSON.stringify(map)); } catch (_) {} }
  function solvedCount() { var map = loadSolved(); return Object.keys(map).filter(function (k) { return map[k]; }).length; }
  function paintSolved() { var el = $('gulf-solved'); if (el) el.textContent = String(solvedCount()); }
  function quizFor(pin) { return pin[role] || pin.red_quiz || pin.blue_quiz || pin.purple_quiz || null; }
  function emitThought(pin, ok) {
    try { g.dispatchEvent(new CustomEvent('kimi.thought.recorded', { detail: { source: 'gulf.overlay', challenge_id: pin && pin.id, reasoning_content: (ok ? 'classified ' : 'missed ') + (pin && (pin.id || pin.name)), content: pin && pin.name, speculative: !ok } })); } catch (_) {}
    try {
      fetch('/api/athelgard-telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: (localStorage.getItem('bw_athelgard_session') || 'GULF'), worldId: 'drone-persian-gulf', events: [{ type: ok ? 'gulf-classify-ok' : 'gulf-classify-miss', pin: pin && pin.id, t: Date.now() }] }), keepalive: true }).catch(function () {});
    } catch (_) {}
  }
  function renderQuiz(pin) {
    if (!pin) return;
    var q = quizFor(pin);
    if (!q) return;
    var box = $('gulf-quiz');
    if (!box) return;
    var html = '<button id="quiz-x" type="button" aria-label="Close">×</button>';
    html += '<div class="gq-h">' + (pin.name || pin.id) + '</div>';
    html += '<div class="gq-p">' + q.prompt + '</div>';
    (q.choices || []).forEach(function (c, i) { html += '<button class="gq-c" data-i="' + i + '">' + c + '</button>'; });
    box.innerHTML = html;
    box.style.display = 'block';
    var closer = document.getElementById('quiz-x');
    if (closer) closer.onclick = function () { box.style.display = 'none'; };
    box.querySelectorAll('.gq-c').forEach(function (btn) {
      btn.onclick = function () {
        var ok = Number(btn.getAttribute('data-i')) === q.answer;
        if (ok) {
          var map = loadSolved(); map[pin.id || pin.name] = true; saveSolved(map); paintSolved();
          btn.textContent = 'Yes.'; emitThought(pin, true);
          setTimeout(function () { box.style.display = 'none'; }, 700);
        } else { btn.textContent = q.teach || 'Not that.'; emitThought(pin, false); }
      };
    });
  }
  function openPin(i) { var pins = g.GULF_PINS || []; if (!pins[i]) return; idx = i; renderQuiz(pins[i]); }
  function openNearest() {
    var pins = g.GULF_PINS || [];
    var me = (g.GulfRaycaster && g.GulfRaycaster.here) ? g.GulfRaycaster.here() : ((g.GulfRaycasterEngine && g.GulfRaycasterEngine.here) ? g.GulfRaycasterEngine.here() : { lat: 26.5667, lon: 56.25 });
    var dist = (g.GulfRaycaster && g.GulfRaycaster.distKm) || (g.GulfRaycasterEngine && g.GulfRaycasterEngine.distKm);
    var best = 0, bestD = 1e9;
    for (var i = 0; i < pins.length; i++) {
      var d = dist ? dist(me, { lat: pins[i].lat, lon: pins[i].lon != null ? pins[i].lon : pins[i].lng }) : i;
      if (d < bestD) { bestD = d; best = i; }
    }
    openPin(best);
  }
  function mount(data) {
    overlay = data;
    g.GULF_PINS = (data && data.pins) || [];
    paintSolved();
    var list = $('sites') || $('gulf-pins') || $('gulf-ctf-target-list');
    if (list && list.tagName !== 'PRE') {
      list.innerHTML = g.GULF_PINS.map(function (p, i) {
        var label = String(p.name || p.id).replace(/\s+—.*$/, '');
        return '<button class="pin" type="button" data-i="' + i + '">' + label + '</button>';
      }).join('');
      list.querySelectorAll('[data-i]').forEach(function (b) {
        b.onclick = function () {
          list.querySelectorAll('[data-i]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          openPin(Number(b.getAttribute('data-i')));
        };
      });
    }
    g.addEventListener('keydown', function (e) {
      if (e.key === 'h' || e.key === 'H') openNearest();
      if (e.key === '1') role = 'red_quiz';
      if (e.key === '2') role = 'blue_quiz';
      if (e.key === '3') role = 'purple_quiz';
    });
    g.GulfCTF = { openNearest: openNearest, openPin: openPin, overlay: overlay, setRole: function (r) { role = r; } };
    try { g.dispatchEvent(new Event('gulf-pins-ready')); } catch (e) {}
  }
  function load() {
    fetchFirst(assetCandidates('ctf-overlay.json')).then(mount).catch(function () {
      if (g.BUILDING_TWINS && g.BUILDING_TWINS.length) {
        mount({ pins: g.BUILDING_TWINS.map(function (t) {
          return { id: t.tier1_twin, name: t.tier1_twin, lat: t.lat, lon: t.lon || t.lng, red_quiz: { prompt: 'Training twin only. What is this overlay for?', choices: ['Live plant access', 'Classify a local fixture', 'AIS spoof recipe', 'Fire mission'], answer: 1, teach: 'Sandbox. Classify. Do not touch live infra.' } };
        }) });
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
}(window));
