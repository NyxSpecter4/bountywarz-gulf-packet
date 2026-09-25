/* gulf-ctf-overlay.js */
(function (g) {
  'use strict';
  var idx = 0;
  function $(id) { return document.getElementById(id); }
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
        var log = $('gulf-log');
        if (log) log.textContent += (ok ? 'yes ' : 'no ') + pin.name + '\n';
        if (ok) {
          var solved = $('gulf-solved');
          if (solved) solved.textContent = String((Number(solved.textContent) || 0) + 1);
          btn.textContent = 'Yes — class locked.';
          setTimeout(function () { box.style.display = 'none'; }, 700);
        } else {
          btn.textContent = q.teach || 'Not that.';
        }
      };
    });
  }
  function mount(data) {
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
          try { g.dispatchEvent(new CustomEvent('gulf-fly', { detail: { index: idx } })); } catch (err) {}
          renderQuiz(g.GULF_PINS[idx], 'red_quiz');
        };
      });
    }
    g.GulfCTF = { overlay: data };
    try { g.dispatchEvent(new Event('gulf-pins-ready')); } catch (e) {}
  }
  function load() {
    fetch('data/ctf-overlay.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(mount);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})(window);
