(function () {
    var mobileButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        var show = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });

        restart();
    }

    var normalize = function (value) {
        return (value || '').toString().trim().toLowerCase();
    };

    var applySearch = function (root) {
        var input = root.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
        var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter-value]'));
        var empty = root.querySelector('[data-empty-state]');
        var filterKey = '';
        var filterValue = 'all';

        if (!input && !chips.length) {
            return;
        }

        var refresh = function () {
            var q = normalize(input ? input.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var search = normalize(card.getAttribute('data-search'));
                var matchesText = !q || search.indexOf(q) !== -1;
                var matchesFilter = true;

                if (filterValue !== 'all' && filterKey) {
                    matchesFilter = normalize(card.getAttribute('data-' + filterKey)).indexOf(normalize(filterValue)) !== -1;
                }

                var keep = matchesText && matchesFilter;
                card.hidden = !keep;

                if (keep) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('active', visible === 0);
            }
        };

        if (input) {
            input.addEventListener('input', refresh);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });

                chip.classList.add('active');
                filterKey = chip.getAttribute('data-filter-key') || '';
                filterValue = chip.getAttribute('data-filter-value') || 'all';
                refresh();
            });
        });
    };

    applySearch(document);

    var playerWrap = document.querySelector('[data-player-wrap]');

    if (playerWrap) {
        var video = playerWrap.querySelector('video');
        var playButton = playerWrap.querySelector('[data-play-button]');
        var loading = playerWrap.querySelector('[data-player-loading]');
        var errorBox = playerWrap.querySelector('[data-player-error]');
        var source = video ? video.getAttribute('data-stream') : '';
        var loaded = false;
        var requested = false;
        var hls = null;

        var showLoading = function (active) {
            if (loading) {
                loading.classList.toggle('active', active);
            }
        };

        var showError = function (message) {
            showLoading(false);
            if (errorBox) {
                errorBox.textContent = message;
                errorBox.classList.add('active');
            }
        };

        var hideOverlay = function () {
            if (playButton) {
                playButton.classList.add('hidden');
            }
        };

        var attemptPlay = function () {
            if (!video) {
                return;
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.then(hideOverlay).catch(function () {
                    hideOverlay();
                });
            } else {
                hideOverlay();
            }
        };

        var loadVideo = function () {
            if (!video || loaded) {
                return;
            }

            loaded = true;
            showLoading(true);

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    showLoading(false);
                    if (requested) {
                        attemptPlay();
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showError('视频加载失败，请刷新重试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    showLoading(false);
                    if (requested) {
                        attemptPlay();
                    }
                }, { once: true });
            } else {
                showError('该浏览器暂不支持播放');
            }
        };

        if (playButton && video) {
            playButton.addEventListener('click', function () {
                requested = true;
                loadVideo();
                attemptPlay();
            });

            video.addEventListener('play', hideOverlay);
            video.addEventListener('waiting', function () {
                showLoading(true);
            });
            video.addEventListener('playing', function () {
                showLoading(false);
            });
            video.addEventListener('error', function () {
                showError('视频加载失败，请刷新重试');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
})();
