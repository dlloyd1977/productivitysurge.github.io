/* Basic opt-in analytics: no Google measurement request until consent. */
(() => {
  'use strict';
  const key = 'ps-analytics-consent-v1';
  const measurement = document.currentScript.dataset.measurement;
  const maxAge = 180 * 24 * 60 * 60 * 1000;
  let loaded = false;
  let choice = null;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && Date.now() - saved.time < maxAge &&
        ['granted', 'denied'].includes(saved.value)) choice = saved.value;
  } catch (_) { /* Unavailable storage never implies consent. */ }

  window.dataLayer = window.dataLayer || [];
  function consent() { window.dataLayer.push(arguments); }
  consent('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied'
  });

  function grant() {
    window['ga-disable-' + measurement] = false;
    consent('consent', 'update', {analytics_storage: 'granted'});
    if (!loaded) {
      loaded = true;
      window.dispatchEvent(new Event('ps-analytics-granted'));
    }
  }
  window.psAnalyticsAllowed = () => choice === 'granted';
  if (choice === 'granted') grant();

  function clearAnalyticsCookies() {
    const domains = ['', location.hostname, '.' + location.hostname,
      '.' + location.hostname.replace(/^www\./, '')];
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) continue;
      for (const domain of domains) {
        document.cookie = name + '=; Max-Age=0; path=/' +
          (domain ? '; domain=' + domain : '');
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = '/assets/css/analytics-consent.css';
    document.head.append(style);
    const panel = document.createElement('section');
    panel.className = 'ps-consent'; panel.setAttribute('aria-labelledby', 'ps-consent-title');
    panel.innerHTML = '<h2 id="ps-consent-title">Website Analytics</h2>' +
      '<p>May we use Google Analytics to understand visits and improve this website? ' +
      'Analytics stays off unless you accept. <a href="/privacy-policy.html#website-analytics">Privacy Details</a></p>' +
      '<div class="ps-consent-actions"><button type="button" data-choice="granted">Accept Analytics</button>' +
      '<button type="button" data-choice="denied">Reject Analytics</button>' +
      '<button type="button" data-close>Close</button></div>' +
      '<p class="ps-consent-status" role="status"></p>';
    const settings = document.createElement('button');
    settings.type = 'button'; settings.className = 'ps-consent-settings';
    settings.textContent = 'Analytics Settings';
    const status = panel.querySelector('[role="status"]');
    const close = panel.querySelector('[data-close]');
    const update = () => {
      status.textContent = 'Current Choice: ' + (choice === 'granted' ? 'Accepted' : 'Off');
      close.hidden = choice === null;
    };
    panel.hidden = choice !== null;
    update(); document.body.append(panel, settings);
    settings.addEventListener('click', () => {
      panel.hidden = false; update(); panel.querySelector('button').focus();
    });
    close.addEventListener('click', () => { panel.hidden = true; settings.focus(); });
    panel.addEventListener('keydown', event => {
      if (event.key === 'Escape' && choice !== null) close.click();
    });
    panel.querySelectorAll('[data-choice]').forEach(button => {
      button.addEventListener('click', () => {
        const wasGranted = choice === 'granted';
        choice = button.dataset.choice;
        let persisted = false;
        try { localStorage.setItem(key, JSON.stringify({value: choice, time: Date.now()})); }
        catch (_) { /* Keep the current page choice even if storage is blocked. */ }
        try { persisted = JSON.parse(localStorage.getItem(key)).value === choice; }
        catch (_) { /* Storage unavailable. */ }
        if (choice === 'granted') grant();
        else {
          clearAnalyticsCookies();
          if (wasGranted) {
            // Reload drops all measurement listeners; next load stays blocked.
            window['ga-disable-' + measurement] = true;
            consent('consent', 'update', {analytics_storage: 'denied'});
            if (persisted) location.reload();
          }
        }
        panel.hidden = persisted;
        update();
        if (!persisted) status.textContent = 'Choice Applies To This Page Only; Storage Is Unavailable.';
        else settings.focus();
      });
    });
    window.addEventListener('storage', event => {
      if (event.key === key || event.key === null) location.reload();
    });
  });
})();
