/* gulf-engine-bridge.js — classic. No export. */
(function (g) {
  'use strict';
  if (g.__GULF_ENGINE_BRIDGE) return;
  g.__GULF_ENGINE_BRIDGE = true;
  var ui = typeof g.GulfUIState === 'function' ? g.GulfUIState('BOOT') : null;
  function go(next, why) {
    if (!ui) return null;
    var r = ui.to(next, why); g.__GULF_UI = ui.receipt(); return r;
  }
  if (ui) { go('HQ','bridge boot'); go('BRIEFING','theater live'); go('SORTIE','canvas ready'); }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (!ui) return;
      if (document.hidden) { ui.onHidden(); g.__GULF_PAUSED = true; }
      else { ui.onVisible(); g.__GULF_PAUSED = false; }
      g.__GULF_UI = ui.receipt();
    });
  }
  try { if (typeof g.defaultGulfTheme === 'function') { var t = g.defaultGulfTheme(); t.apply(document); g.__GULF_THEME = t.receipt(); } } catch (e) {}
  g.GulfEngineBridge = { ui: function () { return ui; }, go: go, receipt: function () { return ui ? ui.receipt() : { state: 'UNWIRED' }; } };
}(typeof window !== 'undefined' ? window : this));
