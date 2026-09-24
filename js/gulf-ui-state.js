/* gulf-ui-state.js — labeled UI state machine. Classic + Node. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GulfUIState = api.GulfUIState;
  root.GULF_UI_STATES = api.STATES;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  var STATES = ['BOOT', 'HQ', 'BRIEFING', 'SORTIE', 'PAUSED', 'DEBRIEF', 'ERROR'];
  var TRANSITIONS = {
    BOOT: ['HQ', 'ERROR'],
    HQ: ['BRIEFING', 'ERROR'],
    BRIEFING: ['SORTIE', 'HQ', 'ERROR'],
    SORTIE: ['PAUSED', 'DEBRIEF', 'ERROR'],
    PAUSED: ['SORTIE', 'DEBRIEF', 'ERROR'],
    DEBRIEF: ['HQ', 'ERROR'],
    ERROR: ['BOOT']
  };
  function GulfUIState(initial) {
    initial = initial || 'BOOT';
    if (STATES.indexOf(initial) < 0) throw new Error('unknown initial state: ' + initial);
    var ui = { state: initial, transitions: 0, refused: [], receipts: [], backgroundPaused: 0 };
    ui.current = function () { return ui.state; };
    ui.to = function (next, reason) {
      reason = reason || '';
      var legal = (TRANSITIONS[ui.state] || []).indexOf(next) >= 0;
      if (!legal) {
        var detail = 'ILLEGAL-TRANSITION ' + ui.state + ' -> ' + next + (reason ? ' (' + reason + ')' : '') + ' — refused, state unchanged';
        ui.refused.push(detail);
        ui.receipts.push(detail);
        return { ok: false, state: ui.state, detail: detail };
      }
      var prev = ui.state;
      ui.state = next;
      ui.transitions++;
      var okDetail = 'TRANSITION ' + prev + ' -> ' + next + (reason ? ' (' + reason + ')' : '');
      ui.receipts.push(okDetail);
      return { ok: true, state: ui.state, detail: okDetail };
    };
    ui.onHidden = function () {
      if (ui.state === 'SORTIE') {
        ui.backgroundPaused++;
        return ui.to('PAUSED', 'visibility lost during sortie — auto-pause');
      }
      return { ok: true, state: ui.state, detail: 'hidden in ' + ui.state + ' — no auto-pause needed' };
    };
    ui.receipt = function () {
      return { state: ui.state, transitions: ui.transitions, refused: ui.refused.slice(), background_paused: ui.backgroundPaused, transcript: ui.receipts.slice(-10) };
    };
    return ui;
  }
  return { GulfUIState: GulfUIState, STATES: STATES, TRANSITIONS: TRANSITIONS };
}));
