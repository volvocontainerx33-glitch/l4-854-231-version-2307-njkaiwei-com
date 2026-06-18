(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var active = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === active);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === active);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchButton = document.querySelector('[data-search-button]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var noResults = document.querySelector('.no-results');

    function filterCards() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
            var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent).toLowerCase();
            var matched = !keyword || text.indexOf(keyword) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        if (noResults) {
            noResults.style.display = visible ? 'none' : 'block';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    if (searchButton) {
        searchButton.addEventListener('click', filterCards);
    }
})();
