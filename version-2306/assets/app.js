(function () {
    var panel = document.querySelector('[data-mobile-panel]');
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
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
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid]'));
        var input = document.querySelector('[data-local-filter]');
        var sort = document.querySelector('[data-card-sort]');
        var querySync = document.querySelector('[data-query-sync]');

        if (querySync) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q') || '';
            querySync.value = q;
        }

        function filterCards() {
            var q = normalize(input ? input.value : '');
            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-card'));
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-region')
                    ].join(' '));
                    card.classList.toggle('is-filtered-out', q && text.indexOf(q) === -1);
                });
            });
        }

        function sortCards() {
            if (!sort) {
                return;
            }

            var value = sort.value;
            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-card'));
                cards.sort(function (a, b) {
                    if (value === 'rating') {
                        return Number(b.querySelector('.score-badge, .rank-list-score') ? (b.querySelector('.score-badge, .rank-list-score').textContent || 0) : b.getAttribute('data-rating') || 0) - Number(a.querySelector('.score-badge, .rank-list-score') ? (a.querySelector('.score-badge, .rank-list-score').textContent || 0) : a.getAttribute('data-rating') || 0);
                    }
                    if (value === 'year') {
                        var ay = Number((a.textContent.match(/\b(19|20)\d{2}\b/) || [0])[0]);
                        var by = Number((b.textContent.match(/\b(19|20)\d{2}\b/) || [0])[0]);
                        return by - ay;
                    }
                    return 0;
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
            });
        }

        if (input) {
            input.addEventListener('input', filterCards);
            filterCards();
        }

        if (sort) {
            sort.addEventListener('change', function () {
                sortCards();
                filterCards();
            });
        }
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('.player-overlay');
            var state = player.querySelector('[data-player-state]');
            var stream = player.getAttribute('data-stream');
            var hls = null;
            var ready = false;

            function setState(text, hidden) {
                if (!state) {
                    return;
                }
                state.textContent = text || '';
                state.classList.toggle('is-hidden', Boolean(hidden));
            }

            function attach() {
                if (ready || !video || !stream) {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setState('', true);
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setState('视频暂时无法播放，请稍后再试', false);
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.addEventListener('loadedmetadata', function () {
                        setState('', true);
                    }, { once: true });
                } else {
                    setState('视频暂时无法播放，请稍后再试', false);
                }

                ready = true;
            }

            function play() {
                attach();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                if (video) {
                    video.controls = true;
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {
                            setState('点击视频继续观看', false);
                        });
                    }
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (!ready) {
                        play();
                    }
                });
                video.addEventListener('play', function () {
                    setState('', true);
                    if (overlay) {
                        overlay.classList.add('is-hidden');
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHero();
        initFilters();
        initPlayers();
    });
}());
