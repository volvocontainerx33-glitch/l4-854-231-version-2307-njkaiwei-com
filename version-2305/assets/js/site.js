(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dots button'));
    const prev = carousel.querySelector('.hero-prev');
    const next = carousel.querySelector('.hero-next');
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    const restart = function () {
      window.clearInterval(timer);
      start();
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    showSlide(0);
    start();
  }

  const searchInput = document.querySelector('.js-search');
  const genreSelect = document.querySelector('.js-genre');
  const cards = Array.from(document.querySelectorAll('.movie-card'));

  const applyFilters = function () {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const genre = genreSelect ? genreSelect.value.trim().toLowerCase() : '';

    cards.forEach(function (card) {
      const text = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.year
      ].join(' ').toLowerCase();
      const genreText = (card.dataset.genre || '').toLowerCase();
      const matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      const matchedGenre = !genre || genreText.indexOf(genre) !== -1;
      card.classList.toggle('is-filtered-out', !(matchedKeyword && matchedGenre));
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (genreSelect) {
    genreSelect.addEventListener('change', applyFilters);
  }
})();

function initVideoPlayer(videoUrl) {
  const video = document.getElementById('videoPlayer');
  const overlay = document.querySelector('.player-overlay');
  let sourceReady = false;
  let sourcePromise = null;

  if (!video || !videoUrl) {
    return;
  }

  const bindSource = function () {
    if (sourceReady) {
      return Promise.resolve();
    }

    if (sourcePromise) {
      return sourcePromise;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      sourceReady = true;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      sourcePromise = new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          sourceReady = true;
          resolve();
        });
      });
      return sourcePromise;
    }

    video.src = videoUrl;
    sourceReady = true;
    return Promise.resolve();
  };

  const startPlayback = function () {
    bindSource().then(function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  };

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
}
