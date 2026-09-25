/* gulf-session-end.js — close the trainer hour after 3 cards */
(function (g) {
  'use strict';
  var NEED = 3;
  function el(id) { return document.getElementById(id); }
  function showDebrief() {
    var box = el('gulf-debrief');
    if (!box) return;
    var n = Number((el('gulf-solved') || {}).textContent || 0);
    var miss = (el('gulf-log') && el('gulf-log').textContent.match(/\bno /g) || []).length;
    box.innerHTML =
      '<div class="gd-k">SESSION</div>' +
      '<div class="gd-h">Stop here.</div>' +
      '<p>You named ' + n + ' class' + (n === 1 ? '' : 'es') + '. Missed ' + miss + '.</p>' +
      '<p>These cards are sim evidence. They are not an FAA certificate and not Security+.</p>' +
      '<p>Next: same three sites tomorrow, or London if you want the city.</p>' +
      '<button type="button" id="gd-x">Close</button>';
    box.style.display = 'block';
    var x = el('gd-x');
    if (x) x.onclick = function () { box.style.display = 'none'; };
    var hint = el('hint');
    if (hint) hint.textContent = 'Hour complete.';
  }
  var last = 0;
  setInterval(function () {
    var n = Number((el('gulf-solved') || {}).textContent || 0);
    if (n >= NEED && n !== last) {
      last = n;
      showDebrief();
    }
  }, 400);
})(window);
