var isWebKit = 'webkitAppearance' in document.documentElement.style,
  // zoom-based scaling causes font sizes and line heights to be calculated differently
  // on the other hand, zoom-based scaling correctly anti-aliases fonts during transforms (no need for layer creation hack)
  //scaleMethod = isWebKit ? 'zoom' : 'transform',
  scaleMethod = 'transform',
  //scaleMethod = null,
  bespoke = require('bespoke'),
  bullets = require('./bespoke-bullets.js'),
  classes = require('bespoke-classes'),
  fullscreen = require('bespoke-fullscreen'),
  hash = require('bespoke-hash'),
  multimedia = require('bespoke-multimedia'),
  nav = require('bespoke-nav'),
  //onstage = require('bespoke-onstage'),
  overview = require('bespoke-overview'),
  scale = require('bespoke-scale');

(module.exports = bespoke).deck = bespoke.from('.deck', [
  classes(),
  nav(),
  fullscreen(),
  (scaleMethod ? scale(scaleMethod) : function(deck) {}),
  //function(deck) { // TODO migrate to bespoke-canvas (or bespoke-undercoat) plugin
  //  var firstSlide = deck.slides[0], canvas = document.createElement('div');
  //  canvas.classList.add('bespoke-slide-canvas');
  //  firstSlide.parentNode.insertBefore(canvas, firstSlide);
  //  if (scaleMethod === 'zoom') {
  //    canvas.style.zoom = firstSlide.style.zoom;
  //    new MutationObserver(function(mutations) {
  //      if (canvas.style.zoom !== firstSlide.style.zoom) canvas.style.zoom = firstSlide.style.zoom;
  //    }).observe(firstSlide, { attributes: true, attributeFilter: ['style'] });
  //  }
  //},
  overview({ margin: 20 }),
  //bullets('ul.build, ul.build > li, h2.build, h2.build > span.line, pre.build, pre.build > code, svg .build, figure.build > img'),
  bullets('.build, .build-items > *:not(.build-items)'),
  // ...or fuse the .build-items:not(.build) list with first item
  //bullets([
  //  '.build',
  //  '.build-items.build > *:not(.build-items)',
  //  '.build-items:not(.build)',
  //  '.build-items:not(.build) > *:not(.build-items):not(:first-child)'].join(', ')
  //),
  //onstage(),
  multimedia(),
  function(deck) { // TODO convert to bespoke-textfit(ter) (or bespoke-typefit(ter)) plugin
    // IMPORTANT we must defer until load event so all web fonts have a chance to load
    // if we used webfontloader (or something equivalent) we could invoke this sooner
    window.addEventListener('load', function fitText() {
      Array.prototype.forEach.call(deck.parent.querySelectorAll('h2.fit, ul.fit'), function(container) {
        // NOTE since we're working in ratios, we don't have to worry about scaling the getBoundingClientRect() dimensions
        var availableW = container.getBoundingClientRect().width;
        var lines = container.querySelectorAll('.line');
        // special case when there's only a single line
        if (lines.length === 0) {
          container.style.display = 'inline-block';
          container.style.width = 'initial';
          lines = [container];
        }
        Array.prototype.forEach.call(lines, function(line) {
          var actualW = line.getBoundingClientRect().width;
          var currentFs = parseFloat(window.getComputedStyle(line).fontSize);
          var adjustedFs = (availableW / actualW) * currentFs;
          if (currentFs != adjustedFs) line.style.fontSize = adjustedFs + 'px';
          // TODO adjust word-spacing or letter-spacing for an exact fit
        });
        if (lines[0] === container) {
          container.style.display = '';
          container.style.width = '';
        }
      });
      window.removeEventListener('load', fitText);
    }, false);
  },
  hash()
]);
