(function () {
  'use strict';

  var $body = document.querySelector('body');
  var $loadingPage = document.getElementById('loadingPage');
  !(function () {
    function t(t) {
      this.el = t;
      for (
        var n = t.className.replace(/^\s+|\s+$/g, '').split(/\s+/), i = 0;
        i < n.length;
        i++
      )
        e.call(this, n[i]);
    }
    // ... [existing classList polyfill code] ...
  })();

  // canUse
  window.canUse = function (p) {
    if (!window._canUse) window._canUse = document.createElement('div');
    var e = window._canUse.style,
      up = p.charAt(0).toUpperCase() + p.slice(1);
    return (
      p in e ||
      'Moz' + up in e ||
      'Webkit' + up in e ||
      'O' + up in e ||
      'ms' + up in e
    );
  };

  // Whether the visitor has asked their system for less motion. Read once
  // at startup: the slideshow only ever decides this at the point it would
  // start, so there is nothing later to keep in sync.
  function prefersReducedMotion() {
    return !!(
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  // window.addEventListener
  (function () {
    if ('addEventListener' in window) return;
    window.addEventListener = function (type, f) {
      window.attachEvent('on' + type, f);
    };
  })();

  // Slideshow Background.
  (function () {
    // Settings.
    var settings = {
      images: {
        'images/slideshow/1.webp': 'center',
        'images/slideshow/2.webp': 'center',
        'images/slideshow/3.webp': 'center',
        'images/slideshow/4.webp': 'center',
        'images/slideshow/5.webp': 'center',
        'images/slideshow/6.webp': 'center',
        'images/slideshow/7.webp': 'center',
        'images/slideshow/8.webp': 'center',
        'images/slideshow/9.webp': 'center',
        'images/slideshow/10.webp': 'center',
        'images/slideshow/11.webp': 'center',
        'images/slideshow/12.webp': 'center',
        'images/slideshow/13.webp': 'center',
      },
      delay: 5000,
    };

    // Create and setup wrapper first
    var $wrapper = document.createElement('div');
    $wrapper.id = 'bg';
    $body.appendChild($wrapper);

    // Preload images and track loading
    var sources = Object.keys(settings.images);
    var $bgs = [];
    var revealed = false;
    var started = false;
    // How far ahead of the rotation to fetch, and how far it has got. One
    // backdrop is on screen and the next is wanted in five seconds, so two in
    // hand absorbs a slow response without running away.
    var lead = 2;
    var requested = 1; // sources[0] is requested at the bottom of this block
    var shown = 0;

    // The loading screen covers the whole page, so it has to come down whatever
    // happens to the images -- a single 404 or a stalled request must not leave
    // visitors looking at a black screen.
    function reveal() {
      if (revealed) return;
      revealed = true;

      window.clearTimeout(revealTimeoutId);
      startSlideshow();

      // Remove loading element completely from DOM
      if ($loadingPage && $loadingPage.parentNode) {
        $loadingPage.parentNode.removeChild($loadingPage);
      }
      $body.classList.remove('is-preload');
    }

    // Two things have to be in place for the page to look right: the first
    // backdrop, and the webfont. Waiting on the whole thirteen-image rotation
    // put several megabytes in front of every visitor, and in practice the
    // failsafe always won that race. Waiting on the font instead costs little
    // and spares the visitor the heading re-wrapping under them a second
    // after the page appears: the fallback is wide enough that the title
    // breaks over three lines instead of two.
    var pendingGates = 2;

    function gateReady() {
      pendingGates--;
      if (pendingGates <= 0) revealAndPrime();
    }

    var revealTimeoutId = window.setTimeout(revealAndPrime, 2500);

    // Asking for the two weights the hero uses, rather than relying on
    // document.fonts.ready alone: ready resolves against whatever is pending
    // at the time, so it can come back immediately if layout has not yet
    // asked for a face. load() starts them itself, which does not depend on
    // that timing. Failure resolves the gate too -- a missing font must never
    // be the reason the overlay stays up.
    if (window.Promise && document.fonts && document.fonts.load) {
      window.Promise.all([
        document.fonts.load('300 1rem "Source Sans Pro"'),
        document.fonts.load('600 1rem "Source Sans Pro"'),
      ])
        .then(gateReady)
        .catch(gateReady);
    } else {
      gateReady();
    }

    function preload(src, onSettled) {
      var img = new Image();
      var $bg = document.createElement('div');

      function settle() {
        // Images that arrive after the slideshow started just join the rotation.
        if (revealed) startSlideshow();
        if (onSettled) onSettled();
      }

      img.onload = function () {
        $bg.style.backgroundImage = 'url("' + src + '")';
        $bg.style.backgroundPosition = settings.images[src];
        $wrapper.appendChild($bg);
        $bgs.push($bg);

        settle();
      };
      img.onerror = settle;
      img.src = src;
    }

    // Whether the rotation is actually going to happen. If it is not, the
    // first backdrop is the only one that will ever be seen, and fetching the
    // other twelve would be pure waste -- which is what used to happen to
    // anyone who had asked their system for less motion.
    function willRotate() {
      return canUse('transition') && !prefersReducedMotion();
    }

    // Fetched just ahead of the rotation rather than all at once. Thirteen
    // images at five seconds each is over a minute of photography and most
    // visits end long before that, so arriving used to cost the better part of
    // a megabyte of pictures nobody stayed to see. If a fetch does fall behind,
    // $bgs grows more slowly and the rotation cycles what it has, which is what
    // it already did whenever a request stalled.
    function requestAhead() {
      while (requested < sources.length && requested <= shown + lead) {
        preload(sources[requested]);
        requested++;
      }
    }

    function revealAndPrime() {
      reveal();
      if (willRotate()) requestAhead();
    }

    if (sources.length > 0) preload(sources[0], gateReady);
    else gateReady();

    function startSlideshow() {
      // Nothing loaded (yet)? Bail -- a later settle() will try again.
      if (started || $bgs.length == 0) return;
      started = true;

      var pos = 0;
      var lastPos = 0;

      $bgs[pos].classList.add('visible');
      $bgs[pos].classList.add('top');

      if (!canUse('transition')) return;

      // The first image is showing by now, so returning here leaves a still
      // background rather than an empty one. slideshow.css stops the pan on
      // the same condition.
      if (prefersReducedMotion()) return;

      window.setInterval(function () {
        // Checked per tick rather than once, since $bgs can still grow if
        // images finish loading after the failsafe started the slideshow.
        if ($bgs.length < 2) return;

        lastPos = pos;
        pos++;
        if (pos >= $bgs.length) pos = 0;

        $bgs[lastPos].classList.remove('top');
        $bgs[pos].classList.add('visible');
        $bgs[pos].classList.add('top');

        // Moving on is what earns the next fetch.
        shown = pos;
        requestAhead();

        window.setTimeout(function () {
          $bgs[lastPos].classList.remove('visible');
        }, settings.delay / 2);
      }, settings.delay);
    }
  })();
})();
