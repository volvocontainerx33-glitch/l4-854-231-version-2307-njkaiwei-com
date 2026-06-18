(function () {
    var video = document.querySelector('.movie-player');
    var cover = document.querySelector('.player-cover');
    var config = document.getElementById('play-source');
    var prepared = false;

    if (!video || !cover || !config) {
        return;
    }

    function source() {
        try {
            return JSON.parse(config.textContent).src;
        } catch (error) {
            return '';
        }
    }

    function prepare() {
        if (prepared) {
            return;
        }
        var url = source();
        if (!url) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && Hls.isSupported()) {
            var hls = new Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }
        prepared = true;
    }

    function start() {
        prepare();
        cover.classList.add('is-hidden');
        video.controls = true;
        var play = video.play();
        if (play && typeof play.catch === 'function') {
            play.catch(function () {});
        }
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (!prepared) {
            start();
        }
    });
})();
