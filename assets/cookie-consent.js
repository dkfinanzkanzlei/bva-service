/* ===== BVA-Consulting · Cookie-Consent (DSGVO, selbst-enthalten) ===== */
(function () {
  'use strict';

  var KEY = 'bva_cookie_consent';      // gespeicherter Wert: 'all' | 'necessary'
  var VERSION = '1';                    // bei Änderung der Cookie-Nutzung erhöhen → erneut abfragen

  function getConsent() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || obj.v !== VERSION) return null;
      return obj;
    } catch (e) { return null; }
  }

  function saveConsent(choice) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ choice: choice, v: VERSION, t: Date.now() }));
    } catch (e) {}
    // Hook für späteres Laden optionaler Dienste (aktuell keine vorhanden)
    window.dispatchEvent(new CustomEvent('bva:cookie-consent', { detail: { choice: choice } }));
  }

  function injectStyles() {
    if (document.getElementById('cc-styles')) return;
    var css = ''
      + '.cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:flex;justify-content:center;'
      + 'padding:16px;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Inter",system-ui,sans-serif;}'
      + '.cc-card{pointer-events:auto;max-width:720px;width:100%;background:linear-gradient(180deg,#1d6f58 0%,#175a46 100%);'
      + 'color:#efe8d2;border:1px solid rgba(192,149,74,0.55);border-radius:18px;'
      + 'box-shadow:0 18px 48px rgba(0,0,0,0.45),inset 0 1px 0 rgba(239,232,210,0.12);'
      + 'padding:22px 24px;display:flex;flex-direction:column;gap:16px;'
      + 'transform:translateY(14px);opacity:0;transition:transform .45s cubic-bezier(.2,.7,.2,1),opacity .45s ease;}'
      + '.cc-banner.cc-in .cc-card{transform:none;opacity:1;}'
      + '.cc-title{font-size:16px;font-weight:700;letter-spacing:-0.01em;margin:0;color:#efe8d2;}'
      + '.cc-text{font-size:14px;line-height:1.55;margin:0;color:rgba(239,232,210,0.9);}'
      + '.cc-text a{color:#e8c98f;text-decoration:underline;text-underline-offset:2px;}'
      + '.cc-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;}'
      + '.cc-btn{appearance:none;border:none;cursor:pointer;font:inherit;font-size:14px;font-weight:600;'
      + 'border-radius:999px;padding:12px 26px;line-height:1.2;white-space:nowrap;transition:transform .2s ease,box-shadow .2s ease,background .2s ease;}'
      + '.cc-btn:focus-visible{outline:2px solid #e8c98f;outline-offset:2px;}'
      + '.cc-accept{background:linear-gradient(145deg,#efe8d2 0%,#c0954a 100%);color:#1b6b54;'
      + 'box-shadow:0 8px 20px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.4);}'
      + '.cc-accept:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(0,0,0,0.42),inset 0 1px 0 rgba(255,255,255,0.5);}'
      + '.cc-reject{background:transparent;color:#efe8d2;border:1.5px solid rgba(239,232,210,0.5);}'
      + '.cc-reject:hover{border-color:#efe8d2;background:rgba(239,232,210,0.06);}'
      + '.cc-row{display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:space-between;}'
      + '@media (max-width:560px){.cc-card{padding:20px;}.cc-actions{width:100%;}.cc-btn{flex:1;text-align:center;}}'
      + '[data-cookie-settings]{cursor:pointer;}';
    var s = document.createElement('style');
    s.id = 'cc-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  var bannerEl = null;

  function closeBanner() {
    if (!bannerEl) return;
    bannerEl.classList.remove('cc-in');
    var el = bannerEl;
    bannerEl = null;
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 480);
  }

  function buildBanner() {
    injectStyles();
    if (bannerEl) return; // schon offen

    var wrap = document.createElement('div');
    wrap.className = 'cc-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-label', 'Cookie-Hinweis');

    wrap.innerHTML =
      '<div class="cc-card">'
      + '<p class="cc-title">Wir respektieren deine Privatsphäre</p>'
      + '<p class="cc-text">Wir verwenden Cookies und ähnliche Technologien. Technisch notwendige Cookies sorgen dafür, '
      + 'dass die Seite funktioniert. Optionale Cookies (z.&nbsp;B. für externe Inhalte wie Schriftarten und Komfort) '
      + 'setzen wir nur mit deiner Einwilligung. Mehr dazu in der '
      + '<a href="/datenschutz">Datenschutzerklärung</a>.</p>'
      + '<div class="cc-row">'
      +   '<div class="cc-actions">'
      +     '<button type="button" class="cc-btn cc-accept" data-cc="all">Alle akzeptieren</button>'
      +     '<button type="button" class="cc-btn cc-reject" data-cc="necessary">Nur notwendige</button>'
      +   '</div>'
      + '</div>'
      + '</div>';

    document.body.appendChild(wrap);
    bannerEl = wrap;

    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cc]');
      if (!btn) return;
      saveConsent(btn.getAttribute('data-cc'));
      closeBanner();
    });

    // Einblend-Animation
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { wrap.classList.add('cc-in'); });
    });
  }

  // Öffentliche Funktion: Einstellungen erneut öffnen
  window.bvaCookieSettings = function () { buildBanner(); };

  function wireSettingsLinks() {
    var links = document.querySelectorAll('[data-cookie-settings]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        e.preventDefault();
        buildBanner();
      });
    }
  }

  function init() {
    wireSettingsLinks();
    if (!getConsent()) buildBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
