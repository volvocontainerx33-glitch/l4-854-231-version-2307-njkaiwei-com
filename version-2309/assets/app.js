function qs(selector, root) {
    return (root || document).querySelector(selector);
}

function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
}

function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
    });
}

function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
        return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;
    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
            slide.classList.toggle('is-active', idx === current);
        });
        dots.forEach(function (dot, idx) {
            dot.classList.toggle('is-active', idx === current);
        });
    }
    function play() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            show(Number(dot.getAttribute('data-hero-dot')) || 0);
            play();
        });
    });
    if (slides.length > 1) {
        play();
    }
}

function normalizeText(text) {
    return String(text || '').toLowerCase().trim();
}

function setupGlobalSearch() {
    qsa('[data-global-search]').forEach(function (input) {
        var panel = input.closest('.search-panel');
        var results = qs('[data-search-results]', panel);
        if (!results || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        input.addEventListener('input', function () {
            var keyword = normalizeText(input.value);
            if (keyword.length < 1) {
                results.classList.remove('is-open');
                results.innerHTML = '';
                return;
            }
            var matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
                return normalizeText(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.genre).indexOf(keyword) !== -1;
            }).slice(0, 20);
            results.innerHTML = matches.map(function (item) {
                return '<a class="search-result-item" href="' + item.url + '">' +
                    '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                    '<span><strong>' + item.title + '</strong><em>' + item.year + ' · ' + item.region + ' · ' + item.type + '</em></span>' +
                    '</a>';
            }).join('');
            results.classList.toggle('is-open', matches.length > 0);
        });
        document.addEventListener('click', function (event) {
            if (!panel.contains(event.target)) {
                results.classList.remove('is-open');
            }
        });
    });
}

function setupLocalFilters() {
    var input = qs('[data-local-filter]');
    var year = qs('[data-filter-year]');
    var region = qs('[data-filter-region]');
    var cards = qsa('[data-card]');
    var empty = qs('[data-empty-state]');
    if (!input || cards.length === 0) {
        return;
    }
    function apply() {
        var keyword = normalizeText(input.value);
        var yearValue = year ? year.value : '';
        var regionValue = region ? region.value : '';
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalizeText([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-type')
            ].join(' '));
            var ok = (!keyword || haystack.indexOf(keyword) !== -1) &&
                (!yearValue || card.getAttribute('data-year') === yearValue) &&
                (!regionValue || card.getAttribute('data-region') === regionValue);
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }
    input.addEventListener('input', apply);
    if (year) {
        year.addEventListener('change', apply);
    }
    if (region) {
        region.addEventListener('change', apply);
    }
}

function initPlayer(source) {
    var video = qs('[data-player-video]');
    var cover = qs('[data-player-cover]');
    var button = qs('[data-player-button]');
    if (!video || !cover || !source) {
        return;
    }
    var loaded = false;
    function load() {
        if (!loaded) {
            loaded = true;
            cover.classList.add('is-hidden');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        } else {
            cover.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }
    cover.addEventListener('click', load);
    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            load();
        });
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        } else {
            video.pause();
        }
    });
}

window.initPlayer = initPlayer;

document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilters();
});
