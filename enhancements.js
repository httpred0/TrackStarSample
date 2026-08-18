// Hand-authored behaviour layered on top of the generated app.js.
//
// app.js is regenerated from the design document by build.js, so anything added
// by hand lives here instead. Loaded after app.js.

(function () {
  'use strict';

  var STAR_COUNT = 26;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // A burst of stars firing outward from a point, in the same visual language
  // as the marquee's cursor sparks: an orange star with a warm glow, thrown out
  // along a random arc, tumbling and falling slightly as it fades.
  function starBurst(x, y) {
    var layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
    document.body.appendChild(layer);

    var longest = 0;

    for (var i = 0; i < STAR_COUNT; i++) {
      var star = document.createElement('span');
      star.textContent = '★';

      var size = 9 + Math.random() * 17;
      var tone = 0.62 + Math.random() * 0.24;
      var hue = 36 + Math.random() * 18;

      star.style.cssText =
        'position:absolute;left:' + x + 'px;top:' + y + 'px;' +
        'font-size:' + size.toFixed(1) + 'px;line-height:1;' +
        'color:oklch(' + tone.toFixed(2) + ' 0.19 ' + hue.toFixed(0) + ');' +
        'text-shadow:0 0 6px oklch(0.85 0.13 45 / 0.9), 0 0 18px oklch(0.72 0.19 45 / 0.7),' +
        ' 0 0 34px oklch(0.68 0.2 42 / 0.45);' +
        'will-change:transform,opacity';
      layer.appendChild(star);

      // Spread evenly around the circle, then jitter, so the ring reads as a
      // burst rather than a rosette.
      var angle = (i / STAR_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.55;
      var distance = 55 + Math.random() * 145;
      var dx = Math.cos(angle) * distance;
      var dy = Math.sin(angle) * distance;
      var spin = (Math.random() - 0.5) * 620;
      var duration = 680 + Math.random() * 620;
      longest = Math.max(longest, duration);

      var animation = star.animate(
        [
          {
            transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)',
            opacity: 0,
            offset: 0,
          },
          {
            transform:
              'translate(calc(-50% + ' + (dx * 0.5).toFixed(1) + 'px),' +
              ' calc(-50% + ' + (dy * 0.5 - 8).toFixed(1) + 'px))' +
              ' scale(1) rotate(' + (spin * 0.45).toFixed(0) + 'deg)',
            opacity: 1,
            offset: 0.22,
          },
          {
            transform:
              'translate(calc(-50% + ' + dx.toFixed(1) + 'px),' +
              ' calc(-50% + ' + (dy + 46).toFixed(1) + 'px))' +
              ' scale(0.5) rotate(' + spin.toFixed(0) + 'deg)',
            opacity: 0,
            offset: 1,
          },
        ],
        { duration: duration, easing: 'cubic-bezier(0.15, 0.72, 0.25, 1)', fill: 'forwards' }
      );

      animation.onfinish = function (el) {
        return function () {
          el.remove();
        };
      }(star);
    }

    setTimeout(function () {
      layer.remove();
    }, longest + 250);
  }

  function start() {
    var signIn = document.querySelector('[data-signin]');
    if (!signIn) return;

    signIn.addEventListener('click', function (event) {
      // The design's links are all href="#", which would jump the page to the
      // top and undercut the effect.
      event.preventDefault();
      if (prefersReducedMotion()) return;

      var box = signIn.getBoundingClientRect();
      // Fire from the pointer when there is one, and from the button's centre
      // for keyboard activation, where clientX/clientY are 0.
      var x = event.clientX || box.left + box.width / 2;
      var y = event.clientY || box.top + box.height / 2;
      starBurst(x, y);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
