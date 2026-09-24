/* gulf-runtime.js — wires EngineCore + state + fps-guard + visibilitychange. Classic. No export. */
(function (g) {
  'use strict';
  if (g.GulfRuntime) return;
  var ui = (typeof g.GulfUIState === 'function') ? g.GulfUIState('BOOT') : null;
  if (ui) ui.to('HQ', 'cold load');
  function onVisibility() {
    if (document.visibilityState === 'hidden') {
      if (ui) ui.onHidden();
      g.__GULF_PAUSED = true;
    } else {
      g.__GULF_PAUSED = false;
      if (ui && ui.current() === 'PAUSED') ui.to('SORTIE', 'tab visible');
    }
  }
  if (g.document) g.document.addEventListener('visibilitychange', onVisibility);
  if (ui) { ui.to('BRIEFING', 'command map ready'); ui.to('SORTIE', 'canvas live'); }
  if (g.GulfFpsGuard && g.GulfWorld && g.GulfWorld.renderer) g.GulfFpsGuard.attachRenderer(g.GulfWorld.renderer);
  /* gulf-fps-guard.js is the 60fps vertical-slice guard this runtime attaches. */
  g.GulfRuntime = {
    ui: ui,
    startSortie: function () { return ui ? ui.to('SORTIE', 'player entered theater') : null; },
    debrief: function () { return ui ? ui.to('DEBRIEF', 'flag locked') : null; },
    receipt: function () { return ui ? ui.receipt() : { state: 'UNMANAGED' }; }
  };
}(typeof window !== 'undefined' ? window : globalThis));
