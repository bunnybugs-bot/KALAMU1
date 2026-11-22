/*
 * Page Équipe : les membres de data/membres.json sont affichés en « polaroïds » épinglés,
 * regroupés par pôle. Un clic retourne la carte (verso : carte de membre de bibliothèque).
 * Les photos manquantes sont remplacées par les initiales de la personne.
 */
(function () {
    'use strict';

    var root = document.getElementById('equipe-poles');
    if (!root) return;

    var POLES = [
        { id: 'direction', titre: 'Direction', icon: 'fa-compass', color: '#c4663c' },
        { id: 'vie-associative', titre: 'Vie associative', icon: 'fa-handshake', color: '#2e8b57' },
        { id: 'pedagogie', titre: 'Pédagogie & documentation', icon: 'fa-graduation-cap', color: '#2f6f8f' },
        { id: 'communication', titre: 'Communication & médias', icon: 'fa-bullhorn', color: '#7b52c9' },
        { id: 'social', titre: 'Pôle Social & Enfant', icon: 'fa-child', color: '#d6336c' },
        { id: 'inclusion', titre: 'Pôle Inclusion & Leadership', icon: 'fa-universal-access', color: '#b9772b' },
        { id: 'eco-plume', titre: 'Kalamu Éco-Plume', icon: 'fa-leaf', color: '#3b8f3b' }
    ];
    var OTHER = { id: 'autres', titre: 'Autres membres', icon: 'fa-user-friends', color: '#6c757d' };

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    function plain(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    function hash(text) {
        var h = 0;
        for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
        return h;
    }
    function initials(name) {
        var words = name.replace(/\(.*?\)/g, '').split(/\s+/).filter(Boolean);
        var first = words[0] || '?';
        var last = words.length > 1 ? words[words.length - 1] : '';
        return (first.charAt(0) + last.charAt(0)).toUpperCase();
    }

    // Photo indiquée dans l'admin, sinon /images/uploads/prenom_nom.jpg (sans accents, en minuscules)
    function photoCandidates(member) {
        var list = [];
        if (member.photo) list.push(member.photo);
        var base = plain(member.nom).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        ['.jpg', '.jpeg', '.png', '.webp'].forEach(function (ext) {
            var guess = '/images/uploads/' + base + ext;
            if (list.indexOf(guess) === -1) list.push(guess);
        });
        return list;
    }

    function photoBlock(member, pole) {
        var box = el('span', { class: 'eq-photo' });
        var fallback = function () {
            box.replaceChildren(el('span', { class: 'eq-initials', 'aria-hidden': 'true', text: initials(member.nom) }));
        };
        var candidates = photoCandidates(member);
        var tryNext = function () {
            var src = candidates.shift();
            if (!src) { fallback(); return; }
            var img = el('img', { alt: '', loading: 'lazy', decoding: 'async' });
            img.addEventListener('error', tryNext);
            img.src = src;
            box.replaceChildren(img);
        };
        tryNext();
        return box;
    }

    // Retire du rôle le nom du pôle déjà indiqué par la rubrique
    function shortRole(member, pole) {
        var role = member.role || '';
        var out = role.replace(new RegExp('\\s*' + pole.titre.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&'), 'i'), '').trim();
        return out || role;
    }

    function card(member, pole, index) {
        var role = member.role || '';
        var tilt = ((hash(member.nom) % 7) - 3) * 0.9;
        var lead = /^pr[ée]sident/i.test(role);

        var front = el('span', { class: 'eq-face eq-front' }, [
            photoBlock(member, pole),
            el('span', { class: 'eq-caption' }, [
                el('strong', { text: member.nom }),
                el('small', { text: shortRole(member, pole) })
            ])
        ]);

        var lines = [
            el('span', { class: 'eq-back-title', text: 'Carte de membre' }),
            el('span', { class: 'eq-line' }, [el('em', { text: 'Nom' }), member.nom]),
            el('span', { class: 'eq-line' }, [el('em', { text: 'Pôle' }), pole.titre]),
            el('span', { class: 'eq-line' }, [el('em', { text: 'Rôle' }), role])
        ];
        if (member.bio) lines.push(el('span', { class: 'eq-bio', text: member.bio }));
        var back = el('span', { class: 'eq-face eq-backface', 'aria-hidden': 'true' }, lines.concat([
            el('span', { class: 'eq-stamp' }, [el('span', { text: 'Kalamu' }), icon('fa-feather-alt')])
        ]));

        var button = el('button', {
            type: 'button',
            class: 'eq-card',
            'aria-pressed': 'false',
            'aria-label': member.nom + (role ? ', ' + role : '') + ' — retourner la carte'
        }, [el('span', { class: 'eq-inner' }, [front, back])]);

        button.addEventListener('click', function () {
            var flipped = button.classList.toggle('is-flipped');
            button.setAttribute('aria-pressed', flipped ? 'true' : 'false');
            back.setAttribute('aria-hidden', flipped ? 'false' : 'true');
            front.setAttribute('aria-hidden', flipped ? 'true' : 'false');
        });

        return el('li', {
            class: 'eq-item' + (lead ? ' eq-lead-card' : ''),
            style: '--tilt:' + tilt.toFixed(1) + 'deg;--i:' + (index % 6)
        }, [button]);
    }

    function render(data) {
        var members = (data.membres || []).filter(function (m) { return m && m.nom; })
            .sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); });

        if (!data.afficher_fiches || !members.length) {
            var section = document.getElementById('equipe-section');
            if (section) section.hidden = true;
            return;
        }

        var known = {};
        POLES.forEach(function (p) { known[p.id] = true; });
        var groups = POLES.concat([OTHER]).map(function (pole) {
            return {
                pole: pole,
                items: members.filter(function (m) { return pole === OTHER ? !known[m.pole] : m.pole === pole.id; })
            };
        }).filter(function (g) { return g.items.length; });

        root.replaceChildren();
        var nav = document.getElementById('equipe-nav');
        if (nav) nav.replaceChildren();

        groups.forEach(function (group) {
            var pole = group.pole;
            var id = 'pole-' + pole.id;

            root.appendChild(el('section', { class: 'eq-pole', id: id, style: '--accent:' + pole.color, 'aria-labelledby': id + '-titre' }, [
                el('div', { class: 'eq-pole-head' }, [
                    el('span', { class: 'eq-pole-icon' }, [icon(pole.icon)]),
                    el('h3', { id: id + '-titre', text: pole.titre }),
                    el('small', { text: group.items.length + (group.items.length > 1 ? ' membres' : ' membre') })
                ]),
                el('ul', { class: 'eq-grid' }, group.items.map(function (m, i) { return card(m, pole, i); }))
            ]));

            if (nav) {
                var link = el('a', { href: '#' + id, class: 'eq-chip', style: '--accent:' + pole.color }, [
                    icon(pole.icon), el('span', { text: pole.titre }), el('small', { text: String(group.items.length) })
                ]);
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
                });
                nav.appendChild(link);
            }
        });

        var count = document.getElementById('equipe-count');
        if (count) count.hidden = false; count.textContent = members.length + ' membres · ' + groups.length + (groups.length > 1 ? ' pôles' : ' pôle');

        reveal();
    }

    // Les cartes « tombent » sur le tableau quand elles arrivent à l'écran
    function reveal() {
        var items = root.querySelectorAll('.eq-item');
        items.forEach(function (item) {
            // l'animation d'arrivée terminée, le survol reprend la main sur la position
            item.addEventListener('animationend', function () { item.classList.add('is-done'); });
        });
        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(function (item) { item.classList.add('is-in'); });
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        items.forEach(function (item) { observer.observe(item); });
    }

    fetch('/data/membres.json', { cache: 'no-cache' })
        .then(function (response) {
            if (!response.ok) throw new Error('membres.json : ' + response.status);
            return response.json();
        })
        .then(render)
        .catch(function (error) {
            console.error('Équipe non chargée :', error);
            root.replaceChildren(el('p', { class: 'content-empty', text: 'L\'équipe est momentanément indisponible.' }));
        });
})();
