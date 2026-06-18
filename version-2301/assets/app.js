(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function norm(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var active = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) return;
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === active);
                });
            }

            function restart() {
                if (timer) window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5200);
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    restart();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    show(active - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(active + 1);
                    restart();
                });
            }
            show(0);
            restart();
        });

        document.querySelectorAll("[data-search-root]").forEach(function (panel) {
            var section = panel.parentElement || document;
            var input = panel.querySelector("[data-search-input]");
            var select = panel.querySelector("[data-filter-select='category']");
            var clear = panel.querySelector("[data-clear-search]");
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
            var empty = section.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            if (input && initial) input.value = initial;

            function apply() {
                var query = norm(input ? input.value : "");
                var category = norm(select ? select.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = norm([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var cardCategory = norm(card.getAttribute("data-category"));
                    var matched = (!query || haystack.indexOf(query) !== -1) && (!category || cardCategory === category);
                    card.hidden = !matched;
                    if (matched) visible += 1;
                });
                if (empty) empty.classList.toggle("is-visible", visible === 0);
            }

            if (input) input.addEventListener("input", apply);
            if (select) select.addEventListener("change", apply);
            if (clear) {
                clear.addEventListener("click", function () {
                    if (input) input.value = "";
                    if (select) select.value = "";
                    apply();
                });
            }
            apply();
        });

        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector("[data-play-cover]");
            var button = player.querySelector("[data-play-button]");
            var hlsInstance = null;
            var started = false;

            function attach() {
                if (!video || started) return;
                var stream = video.getAttribute("data-stream");
                if (!stream) return;
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                if (!video) return;
                attach();
                player.classList.add("is-playing");
                video.controls = true;
                var attempt = video.play();
                if (attempt && attempt.catch) {
                    attempt.catch(function () {
                        video.controls = true;
                    });
                }
            }

            if (cover) cover.addEventListener("click", play);
            if (button) button.addEventListener("click", play);
            if (video) {
                video.addEventListener("click", function () {
                    if (!started) play();
                });
                video.addEventListener("error", function () {
                    player.classList.add("has-error");
                });
            }
            window.addEventListener("pagehide", function () {
                if (hlsInstance) hlsInstance.destroy();
            });
        });
    });
})();
