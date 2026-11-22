/*
 * Bibliothèque en étagères : les livres de data/livres.json sont rangés par catégorie.
 * Un clic (ou Entrée) sur un livre le fait sortir de l'étagère et venir vers le visiteur.
 * Les livres restent gérés depuis l'admin : aucun contenu n'est écrit ici.
 */
(function () {
    'use strict';

    var root = document.getElementById('etageres');
    if (!root) return;

    var CATEGORIES = [
        { id: 'kalamu', icon: 'fa-feather-alt', titre: 'Publications Kalamu', palette: ['#a8512b', '#944526', '#c9822f', '#b04f2a'] },
        { id: 'classiques', icon: 'fa-star', titre: 'Classiques', palette: ['#6b1d1d', '#7f2a2a', '#8b3a1e', '#5c2a14'] },
        { id: 'contemporains', icon: 'fa-calendar-alt', titre: 'Contemporains', palette: ['#1f5f5b', '#2e7d6b', '#1d4e6b', '#2f6f8f'] },
        { id: 'poesie', icon: 'fa-pen-nib', titre: 'Poésie', palette: ['#4a3a7a', '#5b4b8f', '#3b4a8a', '#6a3f7a'] },
        { id: 'essais', icon: 'fa-lightbulb', titre: 'Essais et société', palette: ['#37474f', '#455a64', '#3e5a4a', '#5a4a3a'] },
        { id: 'monde', icon: 'fa-globe', titre: 'Littérature du monde', palette: ['#8a5a14', '#9a6a1c', '#7a4a1c', '#a0722a'] },
        { id: 'jeunesse', icon: 'fa-user', titre: 'Jeunesse', palette: ['#b9772b', '#2e8b57', '#b83280', '#6d4bc4'] }
    ];

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var openState = null;

    // ------------------------------------------------------------------ Outils

    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (key) {
            var value = attrs[key];
            if (value === null || value === undefined || value === false) return;
            if (key === 'class') node.className = value;
            else if (key === 'text') node.textContent = value;
            else if (key === 'style') node.setAttribute('style', value);
            else node.setAttribute(key, value === true ? '' : value);
        });
        (children || []).forEach(function (child) {
            if (child) node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        });
        return node;
    }

    function icon(name) {
        return el('i', { class: 'fas ' + name, 'aria-hidden': 'true' });
    }

    function hash(text) {
        var h = 0;
        for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
        return h;
    }

    function authorLine(book) {
        if (book.a_paraitre) return book.auteur ? book.auteur + ' — à paraître' : 'À paraître';
        return book.auteur || '';
    }

    // ------------------------------------------------------------------ Étagères

    function spine(book, cat) {
        var h = hash(book.titre);
        var width = 54 + (h % 5) * 5;                 // 54 à 74 px
        var height = 230 + ((h >>> 3) % 6) * 10;       // 230 à 280 px
        var color = cat.palette[h % cat.palette.length];
        var label = book.titre + (book.auteur ? ', ' + book.auteur : '') + (book.a_paraitre ? ' (à paraître)' : '');

        return el('button', {
            type: 'button',
            class: 'eg-book' + (book.a_paraitre ? ' eg-soon' : ''),
            style: '--w:' + width + 'px;--h:' + height + 'px;--c:' + color,
            'data-tip': book.titre,
            'aria-label': 'Ouvrir : ' + label
        }, [
            el('span', { class: 'eg-band eg-band-top', 'aria-hidden': 'true' }),
            el('span', { class: 'eg-title', text: book.titre, 'aria-hidden': 'true' }),
            el('span', { class: 'eg-emblem', 'aria-hidden': 'true' }, [icon(cat.icon)])
        ]);
    }

    var allBooks = [];
    var lastWidth = 0;

    function bookWidth(book) { return 54 + (hash(book.titre) % 5) * 5; }

    function availableWidth() {
        var probe = el('div', { class: 'eg-row', style: 'visibility:hidden;height:0;padding-top:0' });
        var host = root.querySelector('.eg-case') || root;
        host.appendChild(probe);
        var cs = getComputedStyle(probe);
        var width = probe.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        probe.remove();
        return Math.max(width, 200);
    }

    // Répartit les livres d'une catégorie en rangées qui tiennent dans la largeur disponible
    function chunk(items, avail) {
        var rows = [], current = [], used = 0, GAP = 5;
        items.forEach(function (book) {
            var w = bookWidth(book) + GAP;
            if (current.length && used + w > avail) { rows.push(current); current = []; used = 0; }
            current.push(book);
            used += w;
        });
        if (current.length) rows.push(current);
        return rows;
    }

    function render() {
        var books = allBooks;
        root.replaceChildren();
        var caseEl = el('div', { class: 'eg-case' });
        root.appendChild(caseEl);
        var avail = availableWidth();
        lastWidth = root.clientWidth;

        CATEGORIES.forEach(function (cat) {
            var items = books.filter(function (b) { return b.categorie === cat.id; });
            if (!items.length) return;

            chunk(items, avail).forEach(function (rowBooks, index) {
                var row = el('div', { class: 'eg-row', role: 'list' });
                rowBooks.forEach(function (book) {
                    var btn = spine(book, cat);
                    btn.setAttribute('role', 'listitem');
                    btn.addEventListener('click', function () { openBook(book, cat, btn); });
                    row.appendChild(btn);
                });

                var shelf = el('section', {
                    class: 'eg-shelf' + (index ? ' eg-shelf-more' : ''),
                    id: index ? null : 'rayon-' + cat.id,
                    'aria-label': cat.titre
                }, [
                    index ? null : el('div', { class: 'eg-plaque' }, [
                        icon(cat.icon),
                        el('span', { text: cat.titre }),
                        el('small', { text: items.length + (items.length > 1 ? ' livres' : ' livre') })
                    ]),
                    row,
                    el('div', { class: 'eg-plank', 'aria-hidden': 'true' })
                ]);
                caseEl.appendChild(shelf);
            });
        });

        if (!caseEl.children.length) {
            root.replaceChildren(el('p', { class: 'content-empty', text: 'La collection sera bientôt disponible.' }));
        }
    }

    // Raccourcis vers les rayons et chiffres de la collection (page bibliothèque)
    function renderExtras() {
        var nav = document.getElementById('rayons-nav');
        if (nav) {
            nav.replaceChildren();
            CATEGORIES.forEach(function (cat) {
                var count = allBooks.filter(function (b) { return b.categorie === cat.id; }).length;
                if (!count) return;
                var link = el('a', { href: '#rayon-' + cat.id, class: 'rc-chip' }, [
                    icon(cat.icon), el('span', { text: cat.titre }), el('small', { text: String(count) })
                ]);
                link.addEventListener('click', function (e) {
                    var target = document.getElementById('rayon-' + cat.id);
                    if (!target) return;
                    e.preventDefault();
                    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
                });
                nav.appendChild(link);
            });
        }

        var authors = {}, editors = {};
        allBooks.forEach(function (b) {
            if (b.auteur) authors[b.auteur.toLowerCase()] = 1;
            if (b.editeur) editors[b.editeur.toLowerCase()] = 1;
        });
        var stats = { livres: allBooks.length, auteurs: Object.keys(authors).length, editeurs: Object.keys(editors).length };
        document.querySelectorAll('[data-eg-stat]').forEach(function (node) {
            var value = stats[node.getAttribute('data-eg-stat')];
            if (value) node.textContent = value;
        });
    }

    function load(data) {
        allBooks = (data.livres || []).filter(function (b) { return b && b.titre; })
            .sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); });
        render();
        renderExtras();

        var timer = null;
        window.addEventListener('resize', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                if (!openState && Math.abs(root.clientWidth - lastWidth) > 30) render();
            }, 250);
        });
    }

    // ------------------------------------------------------------------ Ouverture d'un livre

    function coverFace(book, cat, color) {
        var face = el('div', { class: 'eg-face eg-face-cover' });
        if (book.cover) {
            face.appendChild(el('img', { src: book.cover, alt: '' }));
        } else {
            face.classList.add('eg-cover-generated');
            face.style.setProperty('--c', color);
            face.appendChild(icon(cat.icon));
            face.appendChild(el('strong', { text: book.titre }));
        }
        return face;
    }

    function targetSize() {
        var small = window.innerWidth < 720;
        var ch = Math.min(window.innerHeight * (small ? 0.36 : 0.62), small ? 330 : 470);
        return { w: Math.round(ch * 0.68), h: Math.round(ch) };
    }

    function rectOf(node) {
        var r = node.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
    }

    function frame(r, transform) {
        return {
            left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px',
            transform: transform
        };
    }

    function sparkles(box, host) {
        var cx = box.left + box.width / 2;
        var cy = box.top + box.height / 2;
        for (var i = 0; i < 18; i++) {
            var angle = Math.random() * Math.PI * 2;
            var dist = 90 + Math.random() * 190;
            var spark = el('span', {
                class: 'eg-spark',
                'aria-hidden': 'true',
                style: 'left:' + cx + 'px;top:' + cy + 'px;--dx:' + Math.round(Math.cos(angle) * dist) + 'px;--dy:' +
                    Math.round(Math.sin(angle) * dist) + 'px;--s:' + (0.5 + Math.random() * 0.9).toFixed(2) +
                    ';--d:' + Math.round(Math.random() * 250) + 'ms'
            });
            host.appendChild(spark);
            setTimeout(function (node) { node.remove(); }, 1700, spark);
        }
    }

    function openBook(book, cat, btn) {
        if (openState) return;
        var size = targetSize();
        var color = getComputedStyle(btn).getPropertyValue('--c').trim();
        var titleId = 'eg-titre-' + hash(book.titre);

        var slot = el('div', { class: 'eg-slot', style: 'width:' + size.w + 'px;height:' + size.h + 'px' });
        var slotCover = coverFace(book, cat, color);
        slotCover.classList.add('eg-slot-cover');
        slot.appendChild(slotCover);

        var text = [book.resume_court, book.resume].filter(Boolean).join(' ');
        var details = [];
        if (book.annee) details.push(el('li', {}, [icon('fa-calendar-alt'), ' ' + book.annee]));
        if (book.editeur) details.push(el('li', {}, [icon('fa-building'), ' ' + book.editeur]));
        if (book.exemplaires) details.push(el('li', {}, [icon('fa-clone'), ' ' + book.exemplaires + (book.exemplaires > 1 ? ' exemplaires' : ' exemplaire')]));
        var closeBtn = el('button', { type: 'button', class: 'eg-close', 'aria-label': 'Remettre le livre sur l\'étagère' }, [icon('fa-times')]);
        var panel = el('div', { class: 'eg-panel' }, [
            el('span', { class: 'eg-chip' }, [icon(cat.icon), ' ' + cat.titre]),
            el('h3', { id: titleId, text: book.titre }),
            authorLine(book) ? el('p', { class: 'eg-author', text: authorLine(book) }) : null,
            book.genre ? el('span', { class: 'eg-genre', text: book.genre }) : null,
            text ? el('p', { class: 'eg-text', text: text }) : el('p', { class: 'eg-text eg-text-soon', text: 'Le résumé de ce livre sera bientôt disponible.' }),
            details.length ? el('ul', { class: 'eg-details' }, details) : null,
            el('button', { type: 'button', class: 'eg-back' }, [icon('fa-arrow-left'), ' Remettre sur l\'étagère'])
        ]);

        var overlay = el('div', { class: 'eg-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId }, [
            el('div', { class: 'eg-glow', 'aria-hidden': 'true' }),
            closeBtn,
            el('div', { class: 'eg-stage' }, [slot, panel])
        ]);

        document.body.appendChild(overlay);
        document.body.classList.add('eg-locked');

        var from = rectOf(btn);
        var to = rectOf(slot);
        var state = { overlay: overlay, slot: slot, btn: btn, panel: panel, closing: false };
        openState = state;

        var close = function () { closeBook(state); };
        closeBtn.addEventListener('click', close);
        panel.querySelector('.eg-back').addEventListener('click', close);
        overlay.addEventListener('click', function (e) { if (e.target === overlay || e.target.classList.contains('eg-stage')) close(); });
        state.onKey = function (e) {
            if (e.key === 'Escape') close();
            if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
        };
        document.addEventListener('keydown', state.onKey);

        btn.classList.add('is-out');

        if (reduceMotion || !overlay.animate) {
            overlay.classList.add('is-in', 'is-landed', 'is-seated');
            closeBtn.focus();
            return;
        }

        slotCover.style.visibility = 'hidden';
        requestAnimationFrame(function () { overlay.classList.add('is-in'); });

        var flyer = el('div', { class: 'eg-flyer' }, [
            (function () { var c = btn.cloneNode(true); c.removeAttribute('role'); c.removeAttribute('aria-label'); c.className = 'eg-book eg-face eg-face-spine'; c.removeAttribute('style'); c.style.setProperty('--c', color); c.tabIndex = -1; return c; })(),
            coverFace(book, cat, color)
        ]);
        overlay.appendChild(flyer);

        var lift = { left: from.left, top: from.top - 34, width: from.width, height: from.height };
        var anim = flyer.animate([
            Object.assign(frame(from, 'rotateY(0deg)'), { offset: 0 }),
            Object.assign(frame(lift, 'rotateY(0deg) scale(1.04)'), { offset: 0.22 }),
            Object.assign(frame(to, 'rotateY(180deg)'), { offset: 1 })
        ], { duration: 1050, easing: 'cubic-bezier(.3,.7,.25,1)', fill: 'forwards' });

        setTimeout(function () { sparkles(to, overlay); }, 380);
        setTimeout(function () { overlay.classList.add('is-landed'); }, 700);

        anim.onfinish = function () {
            slotCover.style.visibility = '';
            overlay.classList.add('is-seated');
            flyer.remove();
            closeBtn.focus();
        };
    }

    function closeBook(state) {
        if (!state || state.closing) return;
        state.closing = true;
        document.removeEventListener('keydown', state.onKey);

        var overlay = state.overlay;
        var btn = state.btn;
        var finish = function () {
            overlay.remove();
            document.body.classList.remove('eg-locked');
            btn.classList.remove('is-out');
            btn.focus({ preventScroll: true });
            openState = null;
        };

        overlay.classList.remove('is-landed', 'is-seated');

        if (reduceMotion || !overlay.animate) {
            finish();
            return;
        }

        var color = getComputedStyle(btn).getPropertyValue('--c').trim();
        var from = rectOf(state.slot);
        var to = rectOf(btn);
        var slotCover = state.slot.firstChild;
        var book = { cover: slotCover.querySelector('img') ? slotCover.querySelector('img').getAttribute('src') : '', titre: btn.getAttribute('data-tip') };
        var cat = { icon: 'fa-book' };

        var spineClone = btn.cloneNode(true);
        spineClone.removeAttribute('role'); spineClone.removeAttribute('aria-label');
        spineClone.className = 'eg-book eg-face eg-face-spine'; spineClone.removeAttribute('style');
        spineClone.style.setProperty('--c', color); spineClone.tabIndex = -1;

        var flyer = el('div', { class: 'eg-flyer' }, [spineClone, coverFace(book, cat, color)]);
        overlay.appendChild(flyer);
        slotCover.style.visibility = 'hidden';
        overlay.classList.add('is-leaving');

        var anim = flyer.animate([
            Object.assign(frame(from, 'rotateY(180deg)'), { offset: 0 }),
            Object.assign(frame(to, 'rotateY(0deg)'), { offset: 1 })
        ], { duration: 700, easing: 'cubic-bezier(.4,.1,.3,1)', fill: 'forwards' });
        anim.onfinish = finish;
    }

    // ------------------------------------------------------------------ Démarrage

    fetch('/data/livres.json', { cache: 'no-cache' })
        .then(function (response) {
            if (!response.ok) throw new Error('livres.json : ' + response.status);
            return response.json();
        })
        .then(load)
        .catch(function (error) {
            console.error('Étagères non chargées :', error);
            root.appendChild(el('p', { class: 'content-empty', text: 'La collection est momentanément indisponible.' }));
        });
})();
