/*
 * Comportements de la barre de navigation et de la hero section (voir design.css).
 */
(function () {
    'use strict';

    // Utilisée par script.js après un clic sur un lien interne
    window.closeMobileMenu = function () {
        const menu = document.querySelector('.mobile-menu');
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (!menu || !toggle) return;
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    // La barre devient plus opaque une fois la hero dépassée
    function initHeaderState() {
        const header = document.querySelector('.kl-header');
        if (!header) return;
        const hero = document.querySelector('.kl-hero, .library-hero-section');

        const update = () => {
            const limit = hero ? hero.offsetTop + hero.offsetHeight - header.offsetHeight - 40 : 40;
            header.classList.toggle('is-scrolled', window.scrollY > limit);
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
    }

    // Petit message temporaire
    function toast(message) {
        let node = document.querySelector('.kl-toast');
        if (!node) {
            node = document.createElement('div');
            node.className = 'kl-toast';
            node.setAttribute('role', 'status');
            document.body.appendChild(node);
        }
        node.textContent = message;
        node.classList.add('is-visible');
        clearTimeout(node._timer);
        node._timer = setTimeout(() => node.classList.remove('is-visible'), 2500);
    }

    // Bouton « Partager » : menu de partage du téléphone, sinon copie du lien
    function initShare() {
        document.querySelectorAll('[data-partager]').forEach(button => {
            button.addEventListener('click', async () => {
                const data = {
                    title: 'Kalamu - Association Culturelle',
                    text: "Grandir par la lecture, s'élever par l'écriture",
                    url: window.location.origin + window.location.pathname
                };
                try {
                    if (navigator.share) {
                        await navigator.share(data);
                    } else {
                        await navigator.clipboard.writeText(data.url);
                        toast('Lien du site copié');
                    }
                } catch (error) {
                    if (error && error.name !== 'AbortError') toast('Partage impossible sur cet appareil');
                }
            });
        });
    }

    function init() {
        initHeaderState();
        initShare();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
