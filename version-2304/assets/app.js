(function () {
    var hlsLoader;

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === current);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                show(idx);
                start();
            });
        });
        root.addEventListener("mouseenter", function () {
            clearInterval(timer);
        });
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var panel = scope.parentElement.querySelector(".filter-panel");
            if (!panel) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var input = panel.querySelector("[data-search-input]");
            var region = panel.querySelector("[data-region-select]");
            var year = panel.querySelector("[data-year-select]");
            var category = panel.querySelector("[data-category-select]");
            var tagButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
            var clear = panel.querySelector("[data-clear-filter]");
            var empty = scope.parentElement.querySelector("[data-empty-state]");
            var activeTerm = "";

            function valueOf(el) {
                return el ? String(el.value || "").trim().toLowerCase() : "";
            }

            function textOf(card) {
                return [
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.category
                ].join(" ").toLowerCase();
            }

            function apply() {
                var q = valueOf(input);
                var regionValue = valueOf(region);
                var yearValue = valueOf(year);
                var categoryValue = valueOf(category);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = textOf(card);
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (regionValue && String(card.dataset.region || "").toLowerCase().indexOf(regionValue) === -1) {
                        ok = false;
                    }
                    if (yearValue && String(card.dataset.year || "").toLowerCase() !== yearValue) {
                        ok = false;
                    }
                    if (categoryValue && String(card.dataset.category || "").toLowerCase() !== categoryValue) {
                        ok = false;
                    }
                    if (activeTerm && haystack.indexOf(activeTerm) === -1) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, year, category].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });
            tagButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeTerm = String(button.dataset.filterValue || "").trim().toLowerCase();
                    tagButtons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
            if (clear) {
                clear.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (category) {
                        category.value = "";
                    }
                    activeTerm = "";
                    tagButtons.forEach(function (button, idx) {
                        button.classList.toggle("active", idx === 0);
                    });
                    apply();
                });
            }
            apply();
        });
    }

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLoader) {
            return hlsLoader;
        }
        hlsLoader = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsLoader;
    }

    function attachVideo(video, url) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return Promise.resolve();
        }
        return loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                video.__hls = hls;
                return;
            }
            video.src = url;
        }).catch(function () {
            video.src = url;
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var url = player.getAttribute("data-hls");
            var attached = false;
            if (!video || !url) {
                return;
            }

            function begin() {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var task = attached ? Promise.resolve() : attachVideo(video, url).then(function () {
                    attached = true;
                });
                task.then(function () {
                    var playTask = video.play();
                    if (playTask && typeof playTask.catch === "function") {
                        playTask.catch(function () {});
                    }
                });
            }

            if (overlay) {
                overlay.addEventListener("click", begin);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    begin();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
