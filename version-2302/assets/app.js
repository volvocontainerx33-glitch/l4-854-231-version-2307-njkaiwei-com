(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startHero() {
        if (!slides.length) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            setSlide(current + 1);
        }, 5200);
    }

    if (slides.length) {
        setSlide(0);
        startHero();
        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                startHero();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                startHero();
            });
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var year = scope.querySelector('[data-filter-year]');
        var type = scope.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
        var empty = scope.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q && input) {
            input.value = q;
        }

        function applyFilter() {
            var keyword = normalize(input && input.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var matchedType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
                var matched = matchedKeyword && matchedYear && matchedType;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });
})();
