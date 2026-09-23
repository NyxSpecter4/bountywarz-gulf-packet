/* gulf-athelgard-telemetry.js */
(function () {
  'use strict';
  var URL = 'https://bountywarz.com/api/athelgard-telemetry';
  function sid() {
    try {
      var s = localStorage.getItem('bw_athelgard_session');
      if (s) return s;
      s = 'HORMUZ-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      localStorage.setItem('bw_athelgard_session', s);
      return s;
    } catch (_) { return 'HORMUZ-TMP'; }
  }
  function flush() {
    var sessionId = sid();
    var payload = {
      sessionId: sessionId,
      callsign: window.__callsign || 'HORMUZ PILOT',
      playerId: sessionId,
      worldId: 'drone-persian-gulf',
      flight: { alt: 400, spd: 0, hdg: 270, batt: 100 },
      events: [{ type: 'gulf-presence', t: Date.now() }],
      score: 0
    };
    fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(function () {});
  }
  setInterval(flush, 2000);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', flush);
  else flush();
})();
