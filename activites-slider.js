// Carrousel « Nos Activités » : flèches, points, balayage tactile, défilement automatique
(function () {
    'use strict';

    function init() {
        var slider = document.querySelector('.act-slider');
        if (!slider) return;

        var track = slider.querySelector('.act-track');
        var slides = slider.querySelectorAll('.act-slide');
        var dotsBox = slider.querySelector('.act-dots');
        var total = slides.length;
        if (!track || !total) return;

        var current = 0;
        var timer = null;
        var DELAY = 6000;
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var dots = [];
        for (var i = 0; i < total; i++) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'act-dot';
            dot.setAttribute('aria-label', 'Aller à l’activité ' + (i + 1));
            (function (n) { dot.addEventListener('click', function () { go(n, true); }); })(i);
            dotsBox.appendChild(dot);
            dots.push(dot);
        }

        function render() {
            track.style.transform = 'translateX(' + (-current * 100) + '%)';
            for (var i = 0; i < total; i++) {
                slides[i].setAttribute('aria-hidden', i === current ? 'false' : 'true');
                dots[i].classList.toggle('active', i === current);
                if (i === current) dots[i].setAttribute('aria-current', 'true');
                else dots[i].removeAttribute('aria-current');
            }
        }

        function go(n, user) {
            current = (n + total) % total;
            render();
            if (user) restart();
        }

        function start() {
            if (reduceMotion || timer) return;
            timer = setInterval(function () { go(current + 1); }, DELAY);
        }
        function stop() { clearInterval(timer); timer = null; }
        function restart() { stop(); start(); }

        slider.querySelector('.act-prev').addEventListener('click', function () { go(current - 1, true); });
        slider.querySelector('.act-next').addEventListener('click', function () { go(current + 1, true); });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        slider.addEventListener('focusin', stop);
        slider.addEventListener('focusout', start);
        document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

        // Balayage tactile
        var startX = null;
        slider.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; stop(); }, { passive: true });
        slider.addEventListener('touchend', function (e) {
            if (startX !== null) {
                var dx = e.changedTouches[0].clientX - startX;
                if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1), true);
                else start();
            }
            startX = null;
        }, { passive: true });

        // Flèches du clavier quand le carrousel a le focus
        slider.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') go(current - 1, true);
            if (e.key === 'ArrowRight') go(current + 1, true);
        });

        render();
        start();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
