(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function() {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var index = parseInt(dot.getAttribute('data-slide'), 10) || 0;
        show(index);
        start();
      });
    });

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    show(0);
    start();
  }

  function initFilters() {
    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function(scope) {
      var input = scope.querySelector('.filter-input');
      var year = scope.querySelector('.filter-select');
      var type = scope.querySelector('.type-select');
      var section = scope.parentElement;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        cards.forEach(function(card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var byQuery = !q || haystack.indexOf(q) !== -1;
          var byYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var byType = !typeValue || card.getAttribute('data-type') === typeValue;
          card.classList.toggle('is-hidden', !(byQuery && byYear && byType));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (type) {
        type.addEventListener('change', apply);
      }
      apply();
    });
  }

  function initPlayer() {
    var video = document.querySelector('.movie-video');
    var cover = document.querySelector('.player-cover');
    var config = document.getElementById('movie-player-data');
    if (!video || !cover || !config) {
      return;
    }

    var data;
    try {
      data = JSON.parse(config.textContent || '{}');
    } catch (error) {
      data = {};
    }
    var src = data.src || '';

    function startPlayback() {
      if (!src) {
        return;
      }
      cover.classList.add('is-hidden');
      if (video.dataset.ready === '1') {
        video.play().catch(function() {});
        return;
      }
      video.dataset.ready = '1';
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(function() {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 60,
          backBufferLength: 30
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
        hls.on(window.Hls.Events.ERROR, function(event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }
      video.src = src;
      video.play().catch(function() {});
    }

    cover.addEventListener('click', startPlayback);
    video.addEventListener('click', function() {
      if (video.paused) {
        startPlayback();
      }
    });
  }
})();
