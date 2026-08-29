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
    var settledImages = 0;
    var totalImages = Object.keys(settings.images).length;
    var $bgs = [];
    var revealed = false;
    var started = false;

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

    var revealTimeoutId = window.setTimeout(reveal, 5000);

    function settle() {
      settledImages++;

      // Images that arrive after the failsafe fired still join the rotation.
      if (revealed) startSlideshow();
      else if (settledImages === totalImages) reveal();
    }

    Object.keys(settings.images).forEach(function (src) {
      var img = new Image();
      var $bg = document.createElement('div');

      img.onload = function () {
        $bg.style.backgroundImage = 'url("' + src + '")';
        $bg.style.backgroundPosition = settings.images[src];
        $wrapper.appendChild($bg);
        $bgs.push($bg);

        settle();
      };
      img.onerror = settle;
      img.src = src;
    });

    function startSlideshow() {
      // Nothing loaded (yet)? Bail -- a later settle() will try again.
      if (started || $bgs.length == 0) return;
      started = true;

      var pos = 0;
      var lastPos = 0;

      $bgs[pos].classList.add('visible');
      $bgs[pos].classList.add('top');

      if (!canUse('transition')) return;

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

        window.setTimeout(function () {
          $bgs[lastPos].classList.remove('visible');
        }, settings.delay / 2);
      }, settings.delay);
    }
  })();
})();
