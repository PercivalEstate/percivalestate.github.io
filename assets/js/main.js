/*
	Dimension by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {
  var $window = $(window),
    $body = $('body'),
    $header = $('#header'),
    $footer = $('#footer'),
    $main = $('#main'),
    $main_articles = $main.children('article');

  // Play initial animations on page load.
  $window.on('load', function () {
    window.setTimeout(function () {
      $body.removeClass('is-preload');
    }, 100);
  });

  // Nav.
  // The header holds more than one nav, so evaluate each one on its own item
  // count -- otherwise the combined total decides the divider for all of them.
  $header.children('nav').each(function () {
    var $nav = $(this),
      $nav_li = $nav.find('li');

    // Add "middle" alignment classes if we're dealing with an even number of items.
    if ($nav_li.length % 2 == 0) {
      $nav.addClass('use-middle');
      $nav_li.eq($nav_li.length / 2).addClass('is-middle');
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
  function loadDeferred($article) {
    $article.find('img[data-src], iframe[data-src]').each(function () {
      var src = this.getAttribute('data-src');

      this.removeAttribute('data-src');

      if (this.tagName === 'IFRAME') watchEmbed(this, src);

      this.src = src;
    });
  }

  // Each embed sits behind a spinner that only its own load event takes down,
  // so a request that never finishes would leave the spinner -- and the
  // several hundred pixels of space reserved for it -- on screen for good.
  // Give up after a while and offer the content directly instead.
  var embedTimeout = 20000;

  function watchEmbed(iframe, src) {
    var $spinner = $('#' + iframe.getAttribute('data-spinner')),
      minHeight = iframe.getAttribute('data-min-height'),
      timeoutId;

    iframe.addEventListener('load', function () {
      window.clearTimeout(timeoutId);
      $spinner.hide();

      // Airtable embeds report no height of their own, so the panel would
      // collapse around a zero-height frame without this.
      if (minHeight) iframe.style.minHeight = minHeight + 'px';
    });

    timeoutId = window.setTimeout(function () {
      $spinner.hide();

      $('<p class="embed-fallback"></p>')
        .append(
          $('<a></a>')
            .attr({ href: src, target: '_blank', rel: 'noopener' })
            .text('This part of the page could not be loaded. Open it in a new tab.')
        )
        .insertAfter(iframe);
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
  var $returnFocus = null;

  // Reading document.activeElement in _show is too late. Following a fragment
  // link resets focus, and because the article it points at is still
  // display:none there is nothing to hand focus to, so the reset lands on
  // <body> -- all of it before hashchange fires. Catch the link on the way
  // through instead.
  $body.on('click', 'a[href^="#"]', function () {
    if ($body.hasClass('is-article-visible')) return;

    $returnFocus = $(this);
  });

  // tabindex -1 rather than markup: the articles are only ever focused from
  // here, and a container in the tab order proper would be a stop with
  // nothing to do.
  function focusArticle($article) {
    $article.attr('tabindex', '-1').focus();
  }

  function restoreFocus() {
    if ($returnFocus && $returnFocus.length && $returnFocus.is(':visible'))
      $returnFocus.focus();

    $returnFocus = null;
  }

  $main._show = function (id, initial) {
    var $article = $main_articles.filter('#' + id);

    // No such article? Bail.
    if ($article.length == 0) return;

    loadDeferred($article);

    // Handle lock.

    // Already locked? Speed through "show" steps w/o delays.
    if (locked || (typeof initial != 'undefined' && initial === true)) {
      // Mark as switching.
      $body.addClass('is-switching');

      // Mark as visible.
      $body.addClass('is-article-visible');

      // Deactivate all articles (just in case one's already active).
      $main_articles.removeClass('active');

      // Hide header, footer.
      $header.hide();
      $footer.hide();

      // Show main, article.
      $main.show();
      $article.show();

      // Activate article.
      $article.addClass('active');

      // A deep link arrives with focus on <body> and no header behind the
      // panel to tab through, so there is nothing to move and, later,
      // nothing to give back.
      if (!initial) focusArticle($article);

      // Unlock.
      locked = false;

      // Unmark as switching.
      setTimeout(
        function () {
          $body.removeClass('is-switching');
        },
        initial ? 1000 : 0
      );

      return;
    }

    // Lock.
    locked = true;

    // Article already visible? Just swap articles.
    if ($body.hasClass('is-article-visible')) {
      // Deactivate current article.
      var $currentArticle = $main_articles.filter('.active');

      $currentArticle.removeClass('active');

      // Show article.
      setTimeout(function () {
        // Hide current article.
        $currentArticle.hide();

        // Show article.
        $article.show();

        // Activate article.
        setTimeout(function () {
          $article.addClass('active');

          focusArticle($article);

          // Window stuff.
          $window.scrollTop(0);

          // Unlock.
          setTimeout(function () {
            locked = false;
          }, delay);
        }, 25);
      }, delay);
    }

    // Otherwise, handle as normal.
    else {
      // Mark as visible.
      $body.addClass('is-article-visible');

      // Show article.
      setTimeout(function () {
        // Hide header, footer.
        $header.hide();
        $footer.hide();

        // Show main, article.
        $main.show();
        $article.show();

        // Activate article.
        setTimeout(function () {
          $article.addClass('active');

          focusArticle($article);

          // Window stuff.
          $window.scrollTop(0);

          // Unlock.
          setTimeout(function () {
            locked = false;
          }, delay);
        }, 25);
      }, delay);
    }
  };

  $main._hide = function (addState) {
    var $article = $main_articles.filter('.active');

    // Article not visible? Bail.
    if (!$body.hasClass('is-article-visible')) return;

    // Add state?
    if (typeof addState != 'undefined' && addState === true)
      history.pushState(null, null, '/');

    // Handle lock.

    // Already locked? Speed through "hide" steps w/o delays.
    if (locked) {
      // Mark as switching.
      $body.addClass('is-switching');

      // Deactivate article.
      $article.removeClass('active');

      // Hide article, main.
      $article.hide();
      $main.hide();

      // Show footer, header.
      $footer.show();
      $header.show();

      // Unmark as visible.
      $body.removeClass('is-article-visible');

      // Unlock.
      locked = false;

      // Unmark as switching.
      $body.removeClass('is-switching');

      // The header is back and unblurred, so the link that opened the panel
      // can hold focus again.
      restoreFocus();

      // Window stuff.
      $window.scrollTop(0);

      return;
    }

    // Lock.
    locked = true;

    // Deactivate article.
    $article.removeClass('active');

    // Hide article.
    setTimeout(function () {
      // Hide article, main.
      $article.hide();
      $main.hide();

      // Show footer, header.
      $footer.show();
      $header.show();

      // Unmark as visible.
      setTimeout(function () {
        $body.removeClass('is-article-visible');

        // The header is back and unblurred, so the link that opened the panel
        // can hold focus again.
        restoreFocus();

        // Window stuff.
        $window.scrollTop(0);

        // Unlock.
        setTimeout(function () {
          locked = false;
        }, delay);
      }, 25);
    }, delay);
  };

  // Articles.
  $main_articles.each(function () {
    var $this = $(this);

    // Close.
    // A bare <div> is unreachable without a mouse, so it carries a button role
    // and a tab stop, and answers Enter and Space the way a real button would.
    // Escape still closes the panel from anywhere.
    function close() {
      location.hash = '';
      history.pushState(null, null, '/');
    }

    $('<div class="close" role="button" tabindex="0">Close</div>')
      .appendTo($this)
      .on('click', close)
      .on('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
          // Space would otherwise scroll the panel behind the dismissal.
          event.preventDefault();
          close();
        }
      });

    // Prevent clicks from inside article from bubbling.
    $this.on('click', function (event) {
      event.stopPropagation();
    });
  });

  // Events.
  $body.on('click', function (event) {
    // Article visible? Hide.
    if ($body.hasClass('is-article-visible')) $main._hide(true);
  });

  $window.on('keyup', function (event) {
    switch (event.keyCode) {
      case 27:
        // Article visible? Hide.
        if ($body.hasClass('is-article-visible')) $main._hide(true);

        break;

      default:
        break;
    }
  });

  $window.on('hashchange', function (event) {
    // Empty hash?
    if (location.hash == '' || location.hash == '#') {
      // Prevent default.
      event.preventDefault();
      event.stopPropagation();

      // Hide.
      $main._hide();
    }

    // Otherwise, check for a matching article.
    else if ($main_articles.filter(location.hash).length > 0) {
      // Prevent default.
      event.preventDefault();
      event.stopPropagation();

      // Show article.
      $main._show(location.hash.substr(1));
    }
  });

  // Scroll restoration.
  // This prevents the page from scrolling back to the top on a hashchange.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  else {
    var oldScrollPos = 0,
      scrollPos = 0,
      $htmlbody = $('html,body');

    $window
      .on('scroll', function () {
        oldScrollPos = scrollPos;
        scrollPos = $htmlbody.scrollTop();
      })
      .on('hashchange', function () {
        $window.scrollTop(oldScrollPos);
      });
  }

  // Initialize.

  // Hide main, articles.
  $main.hide();
  $main_articles.hide();

  // Initial article.
  //
  // Deliberately not deferred to window's load event: that waits on every
  // slideshow image and embed, so someone following a #register link would
  // watch the home page for several seconds before the panel appeared, and
  // never see it at all if one of those requests stalled.
  if (location.hash != '' && location.hash != '#') {
    var showInitialArticle = function () {
      $main._show(location.hash.substr(1), true);
    };

    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', showInitialArticle);
    else showInitialArticle();
  }
})(jQuery);
