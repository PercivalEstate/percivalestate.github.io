/* Home page campaign notice for planning application P2026/1577/FUL.

   Shows the campaign once, in front of the page, and then gets out of the
   way: the choice is remembered in localStorage so a resident who has read it
   -- or who has already been to the campaign page, which records the same key
   -- is never shown it again.

   The persistent half of the campaign is in the markup rather than here: the
   notice in the header is always present and needs no script.

   Nothing here reads or sends any personal information; the only thing it
   stores is the fact that the notice has been seen. */

(function () {
  'use strict';

  var STORAGE_KEY = 'pec-campaign-notice';
  var CAMPAIGN_URL = '/save-our-community-hall/';

  function seen() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'seen';
    } catch (e) {
      /* Private browsing and blocked site data throw rather than return null.
         A visitor whose storage is unavailable is shown the notice again next
         time, which is the same way consent.js treats the cookie banner. */
      return false;
    }
  }

  function remember() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'seen');
    } catch (e) {
      /* Nothing to do. */
    }
  }

  function track(eventName) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName);
  }

  /* Everything the keyboard can land on inside the dialog, in document
     order, so Tab can be wrapped around the ends of it. */
  function focusable(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll('a[href], button:not([disabled])'),
      function (el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      }
    );
  }

  function build() {
    var overlay = document.createElement('div');
    overlay.id = 'campaign-modal';

    var panel = document.createElement('div');
    panel.className = 'campaign-modal-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'campaign-modal-title');
    panel.setAttribute('tabindex', '-1');

    var title = document.createElement('h2');
    title.id = 'campaign-modal-title';
    title.textContent = 'Save our community hall';

    var first = document.createElement('p');
    first.textContent =
      'Islington Council has applied to permanently change Tompion Community ' +
      'Hall from community use to office use.';

    var second = document.createElement('p');
    second.textContent =
      'The Percival Estate Community objects to the application. If you live ' +
      'on or near the estate, you can help by submitting your own objection.';

    var actions = document.createElement('div');
    actions.className = 'campaign-modal-actions';

    var send = document.createElement('a');
    send.className = 'button primary button-wrap';
    send.href = CAMPAIGN_URL;
    send.textContent = 'Send your objection';

    var dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'button campaign-modal-dismiss button-wrap';
    dismiss.textContent = 'Not now, take me to the site';

    actions.appendChild(send);
    actions.appendChild(dismiss);

    panel.appendChild(title);
    panel.appendChild(first);
    panel.appendChild(second);
    panel.appendChild(actions);
    overlay.appendChild(panel);

    return { overlay: overlay, panel: panel, send: send, dismiss: dismiss };
  }

  function show() {
    var parts = build();
    var overlay = parts.overlay;
    var panel = parts.panel;

    /* The rest of the page is hidden from assistive technology while the
       dialog is up, so that browsing by heading or landmark cannot wander
       out of it. The cookie banner is included: it is a dialog of its own and
       would otherwise be reachable behind this one. */
    var backdrop = [
      document.getElementById('wrapper'),
      document.getElementById('footer'),
      document.getElementById('cookie-banner')
    ].filter(Boolean);

    var restoredAriaHidden = backdrop.map(function (el) {
      var previous = el.getAttribute('aria-hidden');
      el.setAttribute('aria-hidden', 'true');
      return { el: el, previous: previous };
    });

    function close(reason) {
      remember();

      document.removeEventListener('keydown', onKeydown, true);

      restoredAriaHidden.forEach(function (entry) {
        if (entry.previous === null) entry.el.removeAttribute('aria-hidden');
        else entry.el.setAttribute('aria-hidden', entry.previous);
      });

      document.body.classList.remove('campaign-modal-open');
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);

      if (reason === 'dismissed') {
        /* Focus goes to the campaign link that stays in the header, so the
           keyboard lands on the thing the dialog was asking about rather
           than back at the top of the document. */
        var persistent = document.querySelector('.campaign-notice a[href]');
        if (persistent) persistent.focus();
      }
    }

    function onKeydown(event) {
      if (event.key === 'Escape' || event.key === 'Esc') {
        event.preventDefault();
        /* Escape stops the event reaching main.js, which would otherwise
           read it as a request to close an article. */
        event.stopPropagation();
        close('dismissed');
        return;
      }

      if (event.key !== 'Tab') return;

      var items = focusable(panel);
      if (items.length === 0) return;

      var firstItem = items[0];
      var lastItem = items[items.length - 1];
      var active = document.activeElement;

      if (event.shiftKey && (active === firstItem || active === panel)) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && active === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    parts.dismiss.addEventListener('click', function () {
      track('campaign_modal_dismissed');
      close('dismissed');
    });

    parts.send.addEventListener('click', function () {
      track('campaign_modal_cta_clicked');
      /* Remembered before the page changes, so coming back does not show it
         again. Not close()d: the browser is leaving anyway, and taking the
         dialog down first would flash the home page underneath. */
      remember();
    });

    /* A click on the dim area outside the panel dismisses it, the way a
       click outside an open article does on this site already. */
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) close('dismissed');
    });

    /* main.js closes any open article when a click reaches <body>, and this
       sits outside the articles, so without this a click inside the dialog
       would also shut whatever was open behind it. */
    panel.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    document.addEventListener('keydown', onKeydown, true);
    document.body.classList.add('campaign-modal-open');
    document.body.appendChild(overlay);

    panel.focus();

    track('campaign_modal_shown');
  }

  function start() {
    if (seen()) return;

    /* Somebody who followed a link straight to a panel -- /#register from a
       poster, say -- asked for that panel. Do not put a dialog over it. */
    if (window.location.hash !== '' && window.location.hash !== '#') return;

    /* slideshow.js holds a full-screen overlay over the page until the first
       backdrop and the webfont are ready, and removes #loadingPage when it
       comes down. Showing the dialog before that would put it behind the
       overlay. Its own failsafe fires at 2.5s, so this waits a little longer
       and then goes ahead regardless -- the dialog must never be the thing
       that fails to appear. */
    if (!document.getElementById('loadingPage')) {
      show();
      return;
    }

    var done = false;

    function ready() {
      if (done) return;
      done = true;
      window.clearTimeout(failsafe);
      observer.disconnect();
      show();
    }

    var observer = new MutationObserver(function () {
      if (!document.getElementById('loadingPage')) ready();
    });

    observer.observe(document.body, { childList: true });

    var failsafe = window.setTimeout(ready, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
