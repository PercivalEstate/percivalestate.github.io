/*
	Dimension by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)

	Written against the DOM rather than jQuery. The library was 30KB gzipped --
	more than every other script on the site put together -- and this file was
	the only thing asking for it; slideshow.js and consent.js were already
	written this way.
*/

(function () {
  'use strict';

  var body = document.body,
    header = document.getElementById('header'),
    footer = document.getElementById('footer'),
    main = document.getElementById('main'),
    articles = Array.prototype.filter.call(main.children, function (el) {
      return el.tagName === 'ARTICLE';
    });

  // What jQuery's .hide() and .show() were doing here: set an inline display of
  // none, then clear it again so the stylesheet's own value returns. Clearing is
  // enough because every element these run on -- #main, #header, #footer, the
  // articles and the embed spinners -- is given a display by the stylesheet,
  // which is the case jQuery's extra bookkeeping existed to cover.
  function hide(el) {
    if (el) el.style.display = 'none';
  }

  function show(el) {
    if (el) el.style.display = '';
  }

  // Play initial animations on page load.
  window.addEventListener('load', function () {
    window.setTimeout(function () {
      body.classList.remove('is-preload');
    }, 100);
  });

  // Nav.
  // The divider is drawn at the halfway mark, which only lands between two
  // items when the count is even. Left as a loop over the header's own children
  // so that a second nav would be measured on its own count rather than a
  // combined total.
  Array.prototype.forEach.call(header.children, function (nav) {
    if (nav.tagName !== 'NAV') return;

    var items = nav.querySelectorAll('li');

    // Add "middle" alignment classes if we're dealing with an even number of items.
    if (items.length % 2 === 0) {
      nav.classList.add('use-middle');
      items[items.length / 2].classList.add('is-middle');
    }
  });

  // Main.
  var delay = 325,
    locked = false;

  // Methods.
  // Content images and Airtable embeds inside the panels carry data-src rather
  // than src. #main article is opacity:0 rather than display:none, and the
  // articles are only hidden once this file runs, so loading="lazy" has a
  // laid-out box to reason about and the browser fetches everything on the
  // home page anyway -- most of a megabyte of maps, and the whole of
  // Airtable's embed bundle, for panels most visitors never open. This hands
  // them over at the moment the panel is actually shown.
  function loadDeferred(article) {
    var deferred = article.querySelectorAll('img[data-src], iframe[data-src]');

    Array.prototype.forEach.call(deferred, function (el) {
      var src = el.getAttribute('data-src');

      el.removeAttribute('data-src');

      if (el.tagName === 'IFRAME') watchEmbed(el, src);

      el.src = src;
    });
  }

  // Each embed sits behind a spinner that only its own load event takes down,
  // so a request that never finishes would leave the spinner -- and the
  // several hundred pixels of space reserved for it -- on screen for good.
  // Give up after a while and offer the content directly instead.
  var embedTimeout = 20000;

  function watchEmbed(iframe, src) {
    var spinner = document.getElementById(iframe.getAttribute('data-spinner')),
      minHeight = iframe.getAttribute('data-min-height'),
      timeoutId;

    iframe.addEventListener('load', function () {
      window.clearTimeout(timeoutId);
      hide(spinner);

      // Airtable embeds report no height of their own, so the panel would
      // collapse around a zero-height frame without this.
      if (minHeight) iframe.style.minHeight = minHeight + 'px';
    });

    timeoutId = window.setTimeout(function () {
      hide(spinner);

      var fallback = document.createElement('p'),
        link = document.createElement('a');

      fallback.className = 'embed-fallback';

      link.href = src;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent =
        'This part of the page could not be loaded. Open it in a new tab.';

      fallback.appendChild(link);
      iframe.parentNode.insertBefore(fallback, iframe.nextSibling);
    }, embedTimeout);
  }

  // Focus.
  // Opening a panel hides the header, so whatever the keyboard was on stops
  // being focusable and the browser drops focus to <body> -- the next Tab
  // then starts over from the top of the document. Move focus into the panel
  // instead, and hand it back to the link that opened it on the way out.
  //
  // Only the outermost open is remembered: About links to #register, and the
  // link that does it sits inside the panel that is about to be hidden, so it
  // is no use as a return target.
  var returnFocus = null;

  // Reading document.activeElement in showArticle is too late. Following a
  // fragment link resets focus, and because the article it points at is still
  // display:none there is nothing to hand focus to, so the reset lands on
  // <body> -- all of it before hashchange fires. Catch the link on the way
  // through instead.
  //
  // Registered ahead of the handler further down that closes an open panel, so
  // the two keep the order they had under jQuery, which ran delegated handlers
  // before direct ones on the same element whatever order they were bound in.
  body.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');

    if (!link) return;
    if (body.classList.contains('is-article-visible')) return;

    returnFocus = link;
  });

  // tabindex -1 rather than markup: the articles are only ever focused from
  // here, and a container in the tab order proper would be a stop with
  // nothing to do.
  function focusArticle(article) {
    article.setAttribute('tabindex', '-1');
    article.focus();
  }

  // jQuery's :visible was a box test rather than a style test -- an element at
  // opacity 0 still counted -- and that is the behaviour wanted here, because
  // the header is still transparent for a moment after it is shown again.
  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function restoreFocus() {
    if (returnFocus && returnFocus.isConnected && isVisible(returnFocus))
      returnFocus.focus();

    returnFocus = null;
  }

  // A fragment is whatever someone put after the # -- it arrives from the
  // address bar and from other people's links, so it is not necessarily a
  // usable selector. Resolving it as an id and checking the element is one of
  // ours asks nothing of a selector engine, which is what stopped '#a"b' and
  // '#*' throwing back when there was one.
  function articleFor(id) {
    var el = id ? document.getElementById(id) : null;

    return el && articles.indexOf(el) !== -1 ? el : null;
  }

  function activeArticle() {
    for (var i = 0; i < articles.length; i++)
      if (articles[i].classList.contains('active')) return articles[i];

    return null;
  }

  function showArticle(id, initial) {
    var article = articleFor(id);

    // No such article? Bail.
    if (!article) return;

    loadDeferred(article);

    // Handle lock.

    // Already locked? Speed through "show" steps w/o delays.
    if (locked || initial === true) {
      // Mark as switching.
      body.classList.add('is-switching');

      // Mark as visible.
      body.classList.add('is-article-visible');

      // Deactivate all articles (just in case one's already active).
      articles.forEach(function (el) {
        el.classList.remove('active');
      });

      // Hide header, footer.
      hide(header);
      hide(footer);

      // Show main, article.
      show(main);
      show(article);

      // Activate article.
      article.classList.add('active');

      // A deep link arrives with focus on <body> and no header behind the
      // panel to tab through, so there is nothing to move and, later,
      // nothing to give back.
      if (!initial) focusArticle(article);

      // Unlock.
      locked = false;

      // Unmark as switching.
      window.setTimeout(
        function () {
          body.classList.remove('is-switching');
        },
        initial ? 1000 : 0
      );

      return;
    }

    // Lock.
    locked = true;

    // Article already visible? Just swap articles.
    if (body.classList.contains('is-article-visible')) {
      // Deactivate current article.
      var current = activeArticle();

      if (current) current.classList.remove('active');

      // Show article.
      window.setTimeout(function () {
        // Hide current article.
        hide(current);

        // Show article.
        show(article);

        // Activate article.
        window.setTimeout(function () {
          article.classList.add('active');

          focusArticle(article);

          // Window stuff.
          window.scrollTo(0, 0);

          // Unlock.
          window.setTimeout(function () {
            locked = false;
          }, delay);
        }, 25);
      }, delay);
    }

    // Otherwise, handle as normal.
    else {
      // Mark as visible.
      body.classList.add('is-article-visible');

      // Show article.
      window.setTimeout(function () {
        // Hide header, footer.
        hide(header);
        hide(footer);

        // Show main, article.
        show(main);
        show(article);

        // Activate article.
        window.setTimeout(function () {
          article.classList.add('active');

          focusArticle(article);

          // Window stuff.
          window.scrollTo(0, 0);

          // Unlock.
          window.setTimeout(function () {
            locked = false;
          }, delay);
        }, 25);
      }, delay);
    }
  }

  function hideArticle(addState) {
    var article = activeArticle();

    // Article not visible? Bail.
    if (!body.classList.contains('is-article-visible')) return;

    // Add state?
    if (addState === true)
      history.pushState(null, null, location.pathname + location.search);

    // Handle lock.

    // Already locked? Speed through "hide" steps w/o delays.
    if (locked) {
      // Mark as switching.
      body.classList.add('is-switching');

      // Deactivate article.
      if (article) article.classList.remove('active');

      // Hide article, main.
      hide(article);
      hide(main);

      // Show footer, header.
      show(footer);
      show(header);

      // Unmark as visible.
      body.classList.remove('is-article-visible');

      // Unlock.
      locked = false;

      // Unmark as switching.
      body.classList.remove('is-switching');

      // The header is back and unblurred, so the link that opened the panel
      // can hold focus again.
      restoreFocus();

      // Window stuff.
      window.scrollTo(0, 0);

      return;
    }

    // Lock.
    locked = true;

    // Deactivate article.
    if (article) article.classList.remove('active');

    // Hide article.
    window.setTimeout(function () {
      // Hide article, main.
      hide(article);
      hide(main);

      // Show footer, header.
      show(footer);
      show(header);

      // Unmark as visible.
      window.setTimeout(function () {
        body.classList.remove('is-article-visible');

        // The header is back and unblurred, so the link that opened the panel
        // can hold focus again.
        restoreFocus();

        // Window stuff.
        window.scrollTo(0, 0);

        // Unlock.
        window.setTimeout(function () {
          locked = false;
        }, delay);
      }, 25);
    }, delay);
  }

  // Articles.
  articles.forEach(function (article) {
    // Close.
    // A bare <div> is unreachable without a mouse, so it carries a button role
    // and a tab stop, and answers Enter and Space the way a real button would.
    // Escape still closes the panel from anywhere.
    function close() {
      hideArticle(true);
    }

    var closer = document.createElement('div');

    closer.className = 'close';
    closer.setAttribute('role', 'button');
    closer.setAttribute('tabindex', '0');
    closer.textContent = 'Close';

    article.appendChild(closer);

    closer.addEventListener('click', close);
    closer.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        // Space would otherwise scroll the panel behind the dismissal.
        event.preventDefault();
        close();
      }
    });

    // Prevent clicks from inside article from bubbling.
    article.addEventListener('click', function (event) {
      event.stopPropagation();
    });
  });

  // Events.
  body.addEventListener('click', function () {
    // Article visible? Hide.
    if (body.classList.contains('is-article-visible')) hideArticle(true);
  });

  window.addEventListener('keyup', function (event) {
    // Escape, by name now rather than by the deprecated keyCode 27.
    if (event.key !== 'Escape' && event.key !== 'Esc') return;

    // Article visible? Hide.
    if (body.classList.contains('is-article-visible')) hideArticle(true);
  });

  window.addEventListener('hashchange', function () {
    // Empty hash?
    if (location.hash === '' || location.hash === '#') hideArticle();
    // Otherwise, check for a matching article.
    else if (articleFor(location.hash.substr(1)))
      showArticle(location.hash.substr(1));
  });

  // Scroll restoration.
  // This prevents the page from scrolling back to the top on a hashchange.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Initialize.

  // Hide main, articles.
  hide(main);
  articles.forEach(function (article) {
    hide(article);
  });

  // Initial article.
  //
  // Deliberately not deferred to window's load event: that waits on every
  // slideshow image and embed, so someone following a #register link would
  // watch the home page for several seconds before the panel appeared, and
  // never see it at all if one of those requests stalled.
  if (location.hash !== '' && location.hash !== '#') {
    var showInitialArticle = function () {
      showArticle(location.hash.substr(1), true);
    };

    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', showInitialArticle);
    else showInitialArticle();
  }
})();
