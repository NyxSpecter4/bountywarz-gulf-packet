/* gulf-ctf-overlay.js */
(function (g) {
  'use strict';
  var overlay = null;
  var idx = 0;
  function $(id) { return document.getElementById(id); }
  function distKm(a, b) {
    var R = 6371;
    var dLat = (b.lat - a.lat) * Math.PI / 180;
    var dLon = (b.lon - a.lon) * Math.PI / 180;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }
  function here() { return { lat: 26.5667, lon: 56.25 }; }
  function renderQuiz(pin, side) {
    var q = pin[side] || pin.red_quiz;
    if (!q) return;
    var box = $('gulf-quiz');
    if (!box) return;
    var html = '<button id="quiz-x" type="button" aria-label="Close">×</button>';
    html += '<div class="gq-h">' + pin.name + '</div>';
    html += '<div class="gq-p">' + q.prompt + '</div>';
    (q.choices || []).forEach(function (c, i) {
      html += '<button class="gq-c" data-i="' + i + '">' + c + '</button>';
    });
    box.innerHTML = html;
    box.style.display = 'block';
    var closer = document.getElementById('quiz-x');
    if (closer) closer.onclick = function () { box.style.display = 'none'; };
    box.querySelectorAll('.gq-c').forEach(function (btn) {
      btn.onclick = function () {
        var ok = Number(btn.getAttribute('data-i')) === q.answer;
        if (ok) {
          var solved = $('gulf-solved');
          if (solved) solved.textContent = String((Number(solved.textContent) || 0) + 1);
          btn.textContent = 'Yes.';
          setTimeout(function () { box.style.display = 'none'; }, 700);
        } else {
          btn.textContent = q.teach || 'Not that.';
        }
      };
    });
  }
  function openNearest() {
    var pins = g.GULF_PINS || [];
    var me = here();
    var best = null, bestD = 1e9;
    for (var i = 0; i < pins.length; i++) {
      var d = distKm(me, { lat: pins[i].lat, lon: pins[i].lon });
      if (d < bestD) { bestD = d; best = pins[i]; }
    }
    if (best) renderQuiz(best, 'red_quiz');
  }
  function mount(data) {
    overlay = data;
    g.GULF_PINS = (data && data.pins) || [];
    var list = $('sites') || $('gulf-pins');
    if (list) {
      list.innerHTML = g.GULF_PINS.map(function (p, i) {
        var label = (p.name || p.id).replace(/\s+—.*$/, '');
        return '<button class="pin" data-i="' + i + '">' + label + '</button>';
      }).join('');
      list.querySelectorAll('.pin').forEach(function (b) {
        b.onclick = function () {
          list.querySelectorAll('.pin').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          idx = Number(b.getAttribute('data-i'));
          renderQuiz(g.GULF_PINS[idx], 'red_quiz');
        };
      });
    }
    g.addEventListener('keydown', function (e) {
      if (e.key === 'h' || e.key === 'H') openNearest();
    });
    g.GulfCTF = { openNearest: openNearest, overlay: overlay };
    try { g.dispatchEvent(new Event('gulf-pins-ready')); } catch (e) {}
  }
  function load() {
    fetch('data/ctf-overlay.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(mount)
      .catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})(window);
