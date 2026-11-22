/*
 * Page Événements : « mur d'affichage ».
 *  - le prochain événement est « à l'affiche » : affiche visible en entier, compte à rebours, ajout à l'agenda ;
 *  - les suivants sont épinglés en dessous ;
 *  - les événements passés ne sont pas listés : les souvenirs (data/souvenirs.json) sont montrés en album avec doodles.
 * Les événements se gèrent dans l'admin : rien n'est écrit en dur ici.
 */
(function () {
    'use strict';

    var stage = document.getElementById('ev-stage');
    if (!stage) return;

    var home = stage.getAttribute('data-mode') === 'home';
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var COLORS = ['#c4663c', '#2f6f8f', '#d6336c', '#2e8b57', '#7b52c9', '#b9772b'];

    // ------------------------------------------------------------------ Outils

    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (key) {
            var value = attrs[key];
            if (value === null || value === undefined || value === false) return;
            if (key === 'class') node.className = value;
            else if (key === 'text') node.textContent = value;
            else node.setAttribute(key, value === true ? '' : value);
        });
        (children || []).forEach(function (child) {
            if (child) node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        });
        return node;
    }
    function icon(name) { return el('i', { class: 'fas ' + name, 'aria-hidden': 'true' }); }
    function hash(text) {
        var h = 0;
        for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
        return h;
    }

    // Dates « AAAA-MM-JJ » lues en UTC pour éviter tout décalage de fuseau
    function parseDay(text) {
        var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(text || '');
        return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
    }
    function todayUTC() {
        var d = new Date();
        return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    }
    function fmt(ms, options) {
        return new Intl.DateTimeFormat('fr-FR', Object.assign({ timeZone: 'UTC' }, options)).format(new Date(ms));
    }
    var DAY = 86400000;

    function span(ev) {
        var start = parseDay(ev.date_debut);
        var end = parseDay(ev.date_fin) || start;
        return { start: start, end: Math.max(start, end) };
    }

    function longDate(ev) {
        var s = span(ev);
        if (s.end === s.start) return fmt(s.start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        return 'Du ' + fmt(s.start, { day: 'numeric', month: 'long' }) + ' au ' + fmt(s.end, { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // ------------------------------------------------------------------ Doodles (petits dessins à la main)

    var DOODLES = {
        star: 'M32 6 L39 24 L58 25 L43 37 L48 56 L32 45 L16 56 L21 37 L6 25 L25 24 Z',
        heart: 'M32 54 C10 38 6 24 14 15 C21 8 30 12 32 20 C34 12 43 8 50 15 C58 24 54 38 32 54 Z',
        spiral: 'M32 32 m0 -3 a3 3 0 1 1 -3 3 a8 8 0 1 1 8 8 a13 13 0 1 1 -13 -13 a18 18 0 1 1 18 18',
        arrow: 'M6 48 C18 18 36 14 54 22 M54 22 L42 14 M54 22 L44 33',
        sparkle: 'M32 6 L32 58 M6 32 L58 32 M14 14 L50 50 M50 14 L14 50',
        circle: 'M44 10 C22 2 6 18 10 36 C14 54 40 60 54 44 C62 32 56 14 36 8',
        squiggle: 'M4 32 C12 18 20 46 28 32 C36 18 44 46 52 32 C56 26 58 30 60 32',
        smile: 'M12 36 C20 52 44 52 52 36 M22 22 L22 26 M42 22 L42 26'
    };

    function doodle(kind, color, size) {
        var svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', size || 44);
        svg.setAttribute('height', size || 44);
        svg.setAttribute('class', 'ev-doodle');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        var path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', DOODLES[kind]);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '3.5');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
        return svg;
    }
    var KINDS = Object.keys(DOODLES);

    function scribble(seed, count) {
        var h = hash(seed);
        var nodes = [];
        var corners = [
            'top:-18px;right:-14px', 'bottom:34px;left:-20px', 'top:30%;right:-22px', 'bottom:-14px;right:18%', 'top:-14px;left:12%'
        ];
        for (var i = 0; i < count; i++) {
            var kind = KINDS[(h >>> (i * 3)) % KINDS.length];
            var color = COLORS[(h >>> (i * 2 + 1)) % COLORS.length];
            var node = doodle(kind, color, 36 + ((h >>> (i + 4)) % 4) * 6);
            node.style.cssText = corners[(h + i * 2) % corners.length] + ';--r:' + (((h >>> i) % 40) - 20) + 'deg';
            nodes.push(node);
        }
        return nodes;
    }

    // ------------------------------------------------------------------ Affiche

    function openPoster(src) {
        if (window.openImageModal) window.openImageModal(src);
        else window.open(src, '_blank', 'noopener');
    }

    function poster(ev, className) {
        var s = span(ev);
        var box = el('div', { class: 'ev-poster ' + (className || '') });
        if (ev.image) {
            var img = el('img', { src: ev.image, alt: 'Affiche : ' + ev.titre, loading: 'lazy' });
            var button = el('button', { type: 'button', class: 'ev-poster-btn', 'aria-label': 'Voir l’affiche en grand : ' + ev.titre }, [
                img, el('span', { class: 'ev-zoom', 'aria-hidden': 'true' }, [icon('fa-search-plus')])
            ]);
            button.addEventListener('click', function () { openPoster(ev.image); });
            box.appendChild(button);
        } else {
            // pas d'affiche : on en fabrique une
            box.appendChild(el('div', { class: 'ev-poster-gen' }, [
                el('span', { class: 'ev-gen-day', text: fmt(s.start, { day: 'numeric' }) }),
                el('span', { class: 'ev-gen-month', text: fmt(s.start, { month: 'long' }) }),
                el('strong', { text: ev.titre })
            ]));
        }
        return box;
    }

    function sticker(ev) {
        var s = span(ev);
        var same = s.start === s.end;
        return el('div', { class: 'ev-sticker', 'aria-hidden': 'true' }, [
            el('span', { class: 'ev-sticker-month', text: fmt(s.start, { month: 'short' }).replace('.', '') }),
            el('span', { class: 'ev-sticker-day', text: fmt(s.start, { day: 'numeric' }) }),
            same ? null : el('span', { class: 'ev-sticker-to', text: '→ ' + fmt(s.end, { day: 'numeric' }) })
        ]);
    }

    function countdown(ev) {
        var s = span(ev), now = todayUTC();
        var label, big;
        if (now >= s.start && now <= s.end) { big = 'ON Y EST !'; label = 'en ce moment'; }
        else {
            var days = Math.round((s.start - now) / DAY);
            if (days === 1) { big = 'DEMAIN'; label = ''; }
            else { big = 'J-' + days; label = 'jours'; }
        }
        return el('div', { class: 'ev-count', role: 'status' }, [
            el('span', { class: 'ev-count-big', text: big }),
            label ? el('span', { class: 'ev-count-label', text: label }) : null
        ]);
    }

    // ------------------------------------------------------------------ Agenda et partage

    function icsEscape(text) {
        return String(text || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
    }
    function icsDate(ms) { return new Date(ms).toISOString().slice(0, 10).replace(/-/g, ''); }

    function downloadCalendar(ev) {
        var s = span(ev);
        var lines = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kalamu//Evenements//FR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
            'UID:' + icsDate(s.start) + '-' + hash(ev.titre) + '@kalamu',
            'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''),
            'DTSTART;VALUE=DATE:' + icsDate(s.start),
            'DTEND;VALUE=DATE:' + icsDate(s.end + DAY),
            'SUMMARY:' + icsEscape(ev.titre),
            ev.lieu ? 'LOCATION:' + icsEscape(ev.lieu) : null,
            ev.description ? 'DESCRIPTION:' + icsEscape(ev.description) : null,
            'END:VEVENT', 'END:VCALENDAR'
        ].filter(Boolean);
        var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = el('a', { href: url, download: 'kalamu-' + icsDate(s.start) + '.ics' });
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function share(ev, button) {
        var data = { title: ev.titre + ' — Kalamu', text: ev.titre + ' · ' + longDate(ev) + (ev.lieu ? ' · ' + ev.lieu : ''), url: location.href.split('#')[0] };
        var done = function (message) {
            var original = button.getAttribute('data-label');
            button.querySelector('span').textContent = message;
            setTimeout(function () { button.querySelector('span').textContent = original; }, 2200);
        };
        if (navigator.share) {
            navigator.share(data).catch(function () { /* partage annulé */ });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(data.text + ' ' + data.url).then(function () { done('Lien copié !'); });
        }
    }

    function actionButton(label, iconName, handler) {
        var button = el('button', { type: 'button', class: 'ev-btn', 'data-label': label }, [icon(iconName), el('span', { text: label })]);
        button.addEventListener('click', function () { handler(button); });
        return button;
    }

    // ------------------------------------------------------------------ À l'affiche
    function feature(ev) {
        var tags = (ev.tags || []).filter(Boolean);
        var wrap = el('div', { class: 'ev-poster-wrap' }, [
            poster(ev, 'ev-poster-lead'),
            el('span', { class: 'ev-tape ev-tape-1', 'aria-hidden': 'true' }),
            el('span', { class: 'ev-tape ev-tape-2', 'aria-hidden': 'true' })
        ].concat(scribble(ev.titre, 3)));

        var title = el('h3', { class: 'ev-title' }, [ev.titre]);
        var underline = doodle('squiggle', '#c4663c', 120);
        underline.setAttribute('class', 'ev-underline');
        underline.setAttribute('viewBox', '0 20 64 24');
        underline.setAttribute('preserveAspectRatio', 'none');
        underline.setAttribute('width', 160); underline.setAttribute('height', 16);

        var info = el('div', { class: 'ev-info' }, [
            el('div', { class: 'ev-badges' }, [sticker(ev), countdown(ev)]),
            title, underline,
            el('p', { class: 'ev-meta' }, [icon('fa-calendar-alt'), ' ' + longDate(ev)]),
            ev.lieu ? el('p', { class: 'ev-meta' }, [icon('fa-map-marker-alt'), ' ' + ev.lieu]) : null,
            ev.description ? el('p', { class: 'ev-desc', text: ev.description }) : null,
            tags.length ? el('ul', { class: 'ev-tags' }, tags.map(function (t, i) {
                var li = el('li', { text: t });
                li.style.setProperty('--c', COLORS[(hash(t) + i) % COLORS.length]);
                return li;
            })) : null,
            el('div', { class: 'ev-actions' }, [
                actionButton('Ajouter à mon agenda', 'fa-calendar-plus', function () { downloadCalendar(ev); }),
                actionButton('Partager', 'fa-share-alt', function (b) { share(ev, b); })
            ])
        ]);
        return el('article', { class: 'ev-feature' }, [wrap, info]);
    }

    // ------------------------------------------------------------------ Les suivants
    function miniPoster(ev, i) {
        var li = el('li', { class: 'ev-mini', style: '--tilt:' + (((hash(ev.titre) % 5) - 2) * 1.2).toFixed(1) + 'deg;--i:' + i }, [
            el('div', { class: 'ev-mini-poster' }, [poster(ev), el('span', { class: 'ev-tape ev-tape-1', 'aria-hidden': 'true' }), sticker(ev)]),
            el('div', { class: 'ev-mini-cap' }, [
                el('strong', { text: ev.titre }),
                el('small', {}, [icon('fa-map-marker-alt'), ' ' + (ev.lieu || longDate(ev))])
            ])
        ]);
        return li;
    }

    function renderEvents(data) {
        var now = todayUTC();
        var events = (data.evenements || []).filter(function (e) { return e && e.titre && parseDay(e.date_debut); })
            .filter(function (e) { return span(e).end >= now; })
            .sort(function (a, b) { return span(a).start - span(b).start; });

        stage.replaceChildren();
        if (!events.length) {
            stage.appendChild(el('div', { class: 'ev-empty' }, [
                doodle('sparkle', '#c4663c', 64),
                el('h3', { text: 'Le prochain rendez-vous se prépare…' }),
                el('p', { text: 'Aucun événement n’est programmé pour le moment. Suivez-nous sur les réseaux sociaux pour être informé en premier.' })
            ]));
            return;
        }

        stage.appendChild(el('div', { class: 'ev-lead-label' }, [doodle('arrow', '#c4663c', 40), el('span', { text: 'À l’affiche' })]));
        stage.appendChild(feature(events[0]));

        if (events.length > 1) {
            stage.appendChild(el('div', { class: 'ev-lead-label ev-next-label' }, [doodle('star', '#b9772b', 34), el('span', { text: 'Ensuite' })]));
            stage.appendChild(el('ul', { class: 'ev-wall' }, events.slice(1, home ? 4 : undefined).map(miniPoster)));
        }
        reveal(stage.querySelectorAll('.ev-feature, .ev-mini'));
    }

    // ------------------------------------------------------------------ Souvenirs
    var album = document.getElementById('ev-album');

    function renderMemories(data) {
        if (!album) return;
        var photos = (data.souvenirs || []).filter(function (p) { return p && p.image; })
            .sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); });
        var section = document.getElementById('ev-memories');
        if (!photos.length) { if (section) section.hidden = true; return; }

        album.replaceChildren.apply(album, photos.map(function (p, i) {
            var h = hash(p.image + (p.legende || ''));
            var img = el('img', { src: p.image, alt: p.legende || p.evenement || 'Souvenir d’un événement Kalamu', loading: 'lazy' });
            var button = el('button', { type: 'button', class: 'ev-photo-btn', 'aria-label': 'Voir la photo en grand' }, [img]);
            button.addEventListener('click', function () { openPoster(p.image); });
            var caption = (p.legende || p.evenement) ? el('figcaption', {}, [
                p.legende ? el('span', { text: p.legende }) : null,
                p.evenement ? el('small', { text: p.evenement }) : null
            ]) : null;
            var fig = el('figure', { class: 'ev-photo' }, [
                el('span', { class: 'ev-tape ev-tape-1', 'aria-hidden': 'true' }), button, caption
            ].concat(scribble(p.image, 2)));
            return el('li', { class: 'ev-memory', style: '--tilt:' + (((h % 9) - 4) * 0.9).toFixed(1) + 'deg;--i:' + (i % 6) }, [fig]);
        }));
        reveal(album.querySelectorAll('.ev-memory'));
    }

    // ------------------------------------------------------------------ Apparition
    function reveal(nodes) {
        if (reduceMotion || !('IntersectionObserver' in window)) {
            nodes.forEach(function (n) { n.classList.add('is-in', 'is-done'); });
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        nodes.forEach(function (n) {
            n.addEventListener('animationend', function () { n.classList.add('is-done'); });
            observer.observe(n);
        });
    }

    function load(path) {
        return fetch(path, { cache: 'no-cache' }).then(function (r) {
            if (!r.ok) throw new Error(path + ' : ' + r.status);
            return r.json();
        });
    }

    load('/data/evenements.json').then(renderEvents).catch(function (error) {
        console.error('Événements non chargés :', error);
        stage.replaceChildren(el('p', { class: 'content-empty', text: 'Les événements sont momentanément indisponibles.' }));
    });
    if (album) {
        load('/data/souvenirs.json').then(renderMemories).catch(function () {
            var section = document.getElementById('ev-memories');
            if (section) section.hidden = true;
        });
    }
})();
