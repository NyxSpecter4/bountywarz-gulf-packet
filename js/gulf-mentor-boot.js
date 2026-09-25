/* gulf-mentor-boot.js */
(function () {
  'use strict';
  function add(src) {
    if (!src || document.querySelector('script[src="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  }
  function buildObjectives() {
    var twins = window.BUILDING_TWINS || window.GULF_PINS || [];
    if (!twins.length) return;
    if (window.OBJECTIVES && window.OBJECTIVES.length) return;
    window.OBJECTIVES = twins.map(function (t) {
      return {
        name: t.tier1_twin || t.name || t.id,
        hq: 'gulf',
        defender: 'range',
        nation: 'FICTIONAL',
        vuln: (t.cve || t.anomaly_class || 'educational twin'),
        cwe: t.cwe || null,
        bounty: t.bounty || 1000,
        lat: t.lat, lng: t.lon || t.lng,
        alt: t.alt || 180,
        radius: t.radius || 45,
        captured: false, hacked: false
      };
    });
  }
  function loadMentor() {
    var base = 'https://bountywarz.com';
    add(base + '/worlds/drone-london-recon/js/london-codex.js');
    add(base + '/worlds/drone-london-recon/js/london-hunt-terminal.js');
    add(base + '/worlds/drone-london-recon/js/london-card-play.js');
    add(base + '/worlds/drone-london-recon/js/london-mentor-gate.js');
    add(base + '/worlds/drone-london-recon/js/athelgard-telemetry-publisher.js');
    add(base + '/js/drone-athelgard-voice.js');
    add(base + '/js/drone-killchain-cards.js');
    add(base + '/js/drone-ar-cards.js');
    add(base + '/js/cert-ladder-bar.js');
  }
  function go() { buildObjectives(); loadMentor(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
