(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById('movie-player');
        var overlay = document.querySelector('[data-player-overlay]');
        var loaded = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
