// gulf-ui-state.js — ENGINE: labeled UI state machine. Classic + Node.
'use strict';
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.GulfUIState = api.GulfUIState; root.GULF_UI_STATES = api.STATES; }
}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  var STATES = ['BOOT', 'HQ', 'BRIEFING', 'SORTIE', 'PAUSED', 'DEBRIEF', 'ERROR'];
  var TRANSITIONS = { BOOT:['HQ','ERROR'], HQ:['BRIEFING','ERROR'], BRIEFING:['SORTIE','HQ','ERROR'], SORTIE:['PAUSED','DEBRIEF','ERROR'], PAUSED:['SORTIE','DEBRIEF','ERROR'], DEBRIEF:['HQ','ERROR'], ERROR:['BOOT'] };
  function GulfUIState(initial) {
    initial = initial || 'BOOT';
    var ui = { state: initial, transitions: 0, refused: [], receipts: [], backgroundPaused: 0 };
    ui.current = function () { return ui.state; };
    ui.to = function (next, reason) {
      reason = reason || '';
      if ((TRANSITIONS[ui.state] || []).indexOf(next) === -1) {
        var d = 'ILLEGAL-TRANSITION ' + ui.state + ' -> ' + next + ' — refused, state unchanged';
        ui.refused.push(d); ui.receipts.push(d); return { ok:false, state:ui.state, detail:d };
      }
      var prev = ui.state; ui.state = next; ui.transitions++;
      var ok = 'TRANSITION ' + prev + ' -> ' + next;
      ui.receipts.push(ok); return { ok:true, state:ui.state, detail:ok };
    };
    ui.onHidden = function () {
      if (ui.state === 'SORTIE') { ui.backgroundPaused++; return ui.to('PAUSED', 'visibility lost during sortie — auto-pause'); }
      return { ok:true, state:ui.state, detail:'hidden in ' + ui.state + ' — no auto-pause needed' };
    };
    ui.onVisible = function () {
      if (ui.state === 'PAUSED' && ui.backgroundPaused) return ui.to('SORTIE', 'tab visible — resume sortie');
      return { ok:true, state:ui.state, detail:'visible in ' + ui.state };
    };
    ui.receipt = function () { return { state:ui.state, transitions:ui.transitions, refused:ui.refused.slice(), background_paused:ui.backgroundPaused, transcript:ui.receipts.slice(-10) }; };
    return ui;
  }
  return { GulfUIState:GulfUIState, STATES:STATES, TRANSITIONS:TRANSITIONS };
}));
