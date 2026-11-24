/* Cookie consent for Google Analytics.

   Under PECR the ICO treats analytics cookies as non-essential, so the gtag
   snippet in each page's <head> starts with analytics_storage denied and GA
   sets no cookie until someone accepts here. This file only ever moves consent
   from denied to granted; declining simply leaves the default in place.

   The choice lives in localStorage rather than a cookie so that declining
   really does leave nothing behind. */

(function () {
  var STORAGE_KEY = 'pec-cookie-consent';
  var POLICY_LINK = window.pecPrivacyPolicyHref || '#privacy-policy';

  /* Private browsing and blocked site data make localStorage throw rather than
     return null, so every access is guarded. A visitor whose storage is
     unavailable is simply asked again next time. */
  function readChoice() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch (e) {
      /* Nothing to do: the banner will reappear on the next visit. */
    }
  }

  function grantAnalytics() {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');

    var text = document.createElement('p');
    text.innerHTML =
      'We would like to use Google Analytics to count visits to this site, ' +
      'which sets a cookie in your browser. It is entirely up to you, and ' +
      'nothing on the site depends on it. See our ' +
      '<a href="' +
      POLICY_LINK +
      '">Privacy Policy</a>.';

    var actions = document.createElement('div');
    actions.className = 'cookie-actions';

    var accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'accept';
    accept.textContent = 'Accept';

    var decline = document.createElement('button');
    decline.type = 'button';
    decline.className = 'decline';
    decline.textContent = 'Decline';

    actions.appendChild(accept);
    actions.appendChild(decline);
    banner.appendChild(text);
    banner.appendChild(actions);

    /* main.js closes any open article when a click reaches <body>. The banner
       sits outside the articles, so without this a click on Accept would also
       shut the privacy policy the visitor was reading. */
    banner.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    function close() {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
      releaseSpace();
    }

    accept.addEventListener('click', function () {
      saveChoice('granted');
      grantAnalytics();
      close();
    });

    decline.addEventListener('click', function () {
      saveChoice('denied');
      close();
    });

    return banner;
  }

  /* The banner is fixed to the bottom of the window, and both pages centre
     their content in the full viewport height, so on a short screen it lands
     squarely over the register button. Publishing its height lets the layout
     centre in what is left instead of behind it. */
  function reserveSpace() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;

    document.documentElement.style.setProperty(
      '--cookie-banner-height',
      banner.offsetHeight + 'px'
    );
    document.body.classList.add('has-cookie-banner');
  }

  function releaseSpace() {
    document.documentElement.style.removeProperty('--cookie-banner-height');
    document.body.classList.remove('has-cookie-banner');
  }

  function showBanner() {
    if (document.getElementById('cookie-banner')) return;
    document.body.appendChild(buildBanner());
    reserveSpace();
  }

  /* Rotating the phone or growing the text reflows the banner to a different
     number of lines, so the reserved strip has to be remeasured. */
  window.addEventListener('resize', function () {
    if (document.getElementById('cookie-banner')) reserveSpace();
  });

  function init() {
    var choice = readChoice();

    /* The head snippet grants consent itself on a repeat visit so that the
       pageview is not missed while this file loads; repeating it is harmless
       and covers the case where that inline check could not read storage. */
    if (choice === 'granted') {
      grantAnalytics();
    } else if (choice !== 'denied') {
      showBanner();
    }

    /* Lets the Cookies section of the privacy policy reopen the banner, so a
       choice can be changed at any time. */
    var reopen = document.getElementById('cookie-settings');
    if (reopen) {
      reopen.addEventListener('click', function (event) {
        event.preventDefault();
        showBanner();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
