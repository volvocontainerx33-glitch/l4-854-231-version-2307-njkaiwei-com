(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot) {
        dot.classList.toggle('is-active', Number(dot.getAttribute('data-hero-dot')) === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
    lists.forEach(function (list) {
      var scope = list.closest('section') || document;
      var input = scope.querySelector('[data-filter-input]');
      var yearSelect = scope.querySelector('[data-filter-year]');
      var typeSelect = scope.querySelector('[data-filter-type]');
      var empty = scope.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial && input) {
        input.value = initial;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedYear = !year || card.getAttribute('data-year') === year;
          var matchedType = !type || card.getAttribute('data-type') === type;
          var shouldShow = matchedQuery && matchedYear && matchedType;
          card.style.display = shouldShow ? '' : 'none';
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }
      apply();
    });
  }

  function attachStream(video, url) {
    if (video.dataset.ready === '1') {
      return;
    }
    video.dataset.ready = '1';
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = url;
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var source = video ? video.querySelector('source') : null;
      var cover = player.querySelector('.player-cover');
      var playToggle = player.querySelector('.play-toggle');
      var muteToggle = player.querySelector('.mute-toggle');
      var fullToggle = player.querySelector('.full-toggle');
      if (!video || !source) {
        return;
      }
      var url = source.getAttribute('src');

      function play() {
        attachStream(video, url);
        player.classList.add('is-started');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-started');
          });
        }
      }

      function togglePlay() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      if (cover) {
        cover.addEventListener('click', play);
      }
      video.addEventListener('click', togglePlay);
      if (playToggle) {
        playToggle.addEventListener('click', togglePlay);
      }
      if (muteToggle) {
        muteToggle.addEventListener('click', function () {
          video.muted = !video.muted;
          muteToggle.textContent = video.muted ? '×' : '♪';
        });
      }
      if (fullToggle) {
        fullToggle.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }
      video.addEventListener('play', function () {
        player.classList.add('is-started');
        if (playToggle) {
          playToggle.textContent = 'Ⅱ';
        }
      });
      video.addEventListener('pause', function () {
        if (playToggle) {
          playToggle.textContent = '▶';
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
}());
