// gulf-hud-theme.js — WCAG HUD tokens. Classic + Node.
'use strict';
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.GulfHudTheme = api.GulfHudTheme; root.defaultGulfTheme = api.defaultGulfTheme; }
}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  function relLum(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var c = [0,2,4].map(function (i) { var v = parseInt(h.slice(i,i+2),16)/255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4); });
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
  }
  function contrastRatio(fg,bg){ var a=relLum(fg),b=relLum(bg); return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05); }
  function GulfHudTheme(name) {
    var theme = { name:name, tokens:{} };
    theme.set = function (key,fg,bg,opts) {
      opts = opts || {}; var ratio = contrastRatio(fg,bg); var min = opts.largeText ? 3 : 4.5;
      if (ratio < min) throw new Error('THEME-REJECTED '+key+': '+fg+' on '+bg+' is '+ratio.toFixed(2)+':1');
      theme.tokens[key] = { key:key, fg:fg, bg:bg, contrast:Number(ratio.toFixed(2)), largeText:!!opts.largeText };
      return theme.tokens[key];
    };
    theme.get = function (key) { if (!theme.tokens[key]) throw new Error('THEME-MISSING '+key); return theme.tokens[key]; };
    theme.apply = function (doc) {
      doc = doc || (typeof document !== 'undefined' ? document : null);
      if (!doc || !doc.documentElement) return theme.receipt();
      Object.keys(theme.tokens).forEach(function (k) {
        var t = theme.tokens[k];
        doc.documentElement.style.setProperty('--gulf-'+k.replace(/\./g,'-')+'-fg', t.fg);
        doc.documentElement.style.setProperty('--gulf-'+k.replace(/\./g,'-')+'-bg', t.bg);
      });
      return theme.receipt();
    };
    theme.receipt = function () {
      var vals = Object.keys(theme.tokens).map(function (k) { return theme.tokens[k].contrast; });
      return { name:name, tokens:vals.length, min_contrast: vals.length ? Math.min.apply(null, vals) : 0 };
    };
    return theme;
  }
  function defaultGulfTheme() {
    var t = GulfHudTheme('gulf-default');
    t.set('hud.primary','#e8f4ff','#0a1626');
    t.set('hud.warning','#ffd166','#0a1626');
    t.set('hud.critical','#ff6b6b','#0a1626');
    t.set('hud.success','#7dff9b','#0a1626');
    t.set('panel.body','#dfe8ef','#122238');
    t.set('hud.bigBanner','#ffffff','#0a1626',{ largeText:true });
    return t;
  }
  return { GulfHudTheme:GulfHudTheme, defaultGulfTheme:defaultGulfTheme, contrastRatio:contrastRatio };
}));
