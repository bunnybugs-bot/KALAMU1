/*
 * Contenu dynamique du site Kalamu.
 * Les textes, livres, événements, membres et coordonnées sont lus dans le dossier /data,
 * qui est modifié par l'administrateur depuis /admin (Decap CMS).
 * Ce fichier ne contient que l'affichage : aucun contenu n'est écrit en dur ici.
 */
(function () {
    'use strict';

    // ------------------------------------------------------------------ Outils

    /** Crée un élément HTML. Le texte est toujours inséré comme texte (jamais comme HTML). */
    function el(tag, attrs, children) {
        const node = document.createElement(tag);
        Object.entries(attrs || {}).forEach(([key, value]) => {
            if (value === null || value === undefined || value === false) return;
            if (key === 'class') node.className = value;
            else if (key === 'text') node.textContent = value;
            else if (key === 'style') node.setAttribute('style', value);
            else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
            else node.setAttribute(key, value === true ? '' : value);
        });
        (children || []).forEach(child => {
            if (child === null || child === undefined || child === false) return;
            node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        });
        return node;
    }

    function icon(name) {
        return el('i', { class: 'fas ' + name, 'aria-hidden': 'true' });
    }

    async function loadJSON(path) {
        // no-cache : le navigateur revérifie le fichier, donc une publication de l'admin est visible tout de suite
        const response = await fetch(path, { cache: 'no-cache' });
        if (!response.ok) throw new Error(path + ' : ' + response.status);
        return response.json();
    }

    /** Date du jour au format AAAA-MM-JJ (heure locale du visiteur). */
    function today() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function parseDate(value) {
        if (!value) return null;
        const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!match) return null;
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
        'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    function formatDate(d) {
        return (d.getDate() === 1 ? '1er' : d.getDate()) + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear();
    }

    /** « 21 au 23 mai 2026 », « 30 avril au 2 mai 2026 » ou « 22 mai 2026 ». */
    function formatPeriod(start, end) {
        const d1 = parseDate(start);
        const d2 = parseDate(end);
        if (!d1) return '';
        if (!d2 || d2.getTime() === d1.getTime()) return formatDate(d1);
        const day1 = d1.getDate() === 1 ? '1er' : d1.getDate();
        if (d1.getFullYear() === d2.getFullYear()) {
            if (d1.getMonth() === d2.getMonth()) return day1 + ' au ' + formatDate(d2);
            return day1 + ' ' + MOIS[d1.getMonth()] + ' au ' + formatDate(d2);
        }
        return formatDate(d1) + ' au ' + formatDate(d2);
    }

    function list(value) {
        return Array.isArray(value) ? value.filter(Boolean) : [];
    }

    // ------------------------------------------------------------------ Événements

    function eventCard(event, isUpcoming) {
        const period = formatPeriod(event.date_debut, event.date_fin);
        const label = (isUpcoming ? 'Événement à venir' : 'Événement passé') + (period ? ' — ' + period : '');
        const title = event.titre || 'Événement';

        let imageBlock = null;
        if (event.image) {
            const open = () => window.openImageModal && window.openImageModal(event.image);
            imageBlock = el('div', { class: 'event-image-container' }, [
                el('img', { src: event.image, alt: title, class: 'event-image', loading: 'lazy', onclick: open }),
                el('div', { class: 'event-image-overlay' }, [
                    el('button', { class: 'image-action-btn', type: 'button', title: 'Voir en grand', 'aria-label': 'Voir en grand', onclick: open }, [icon('fa-expand')]),
                    el('button', {
                        class: 'image-action-btn', type: 'button', title: 'Télécharger', 'aria-label': "Télécharger l'affiche",
                        onclick: () => window.downloadImage && window.downloadImage(event.image)
                    }, [icon('fa-download')])
                ])
            ]);
        }

        const description = [event.description, event.lieu ? 'Lieu : ' + event.lieu + '.' : '']
            .filter(Boolean).join(' ');

        return el('article', { class: 'event-card ' + (isUpcoming ? 'upcoming-event' : 'past-event') }, [
            imageBlock,
            el('div', { class: 'event-content' }, [
                el('h3', { text: title }),
                el('p', { class: 'event-date', text: label }),
                description ? el('p', { class: 'event-description', text: description }) : null,
                list(event.tags).length
                    ? el('div', { class: 'event-tags' }, list(event.tags).map(tag => el('span', { class: 'event-tag', text: tag })))
                    : null
            ])
        ]);
    }

    function renderEvents(data) {
        const upcomingGrid = document.getElementById('evenements-a-venir');
        if (!upcomingGrid) return;
        const pastBlock = document.getElementById('evenements-passes-bloc');
        const pastGrid = document.getElementById('evenements-passes');

        const now = today();
        const events = list(data.evenements).filter(e => e.titre && e.date_debut);
        const lastDay = e => String(e.date_fin || e.date_debut).slice(0, 10);

        const upcoming = events.filter(e => lastDay(e) >= now)
            .sort((a, b) => String(a.date_debut).localeCompare(String(b.date_debut)));
        const past = events.filter(e => lastDay(e) < now)
            .sort((a, b) => String(b.date_debut).localeCompare(String(a.date_debut)))
            .slice(0, 6); // les 6 plus récents

        upcomingGrid.replaceChildren();
        if (upcoming.length) {
            upcoming.forEach(e => upcomingGrid.appendChild(eventCard(e, true)));
        } else {
            upcomingGrid.appendChild(el('p', { class: 'content-empty' }, [
                'Aucun événement n\'est programmé pour le moment. Suivez-nous sur les réseaux sociaux pour être informé des prochains rendez-vous.'
            ]));
        }

        if (pastBlock && pastGrid) {
            pastGrid.replaceChildren(...past.map(e => eventCard(e, false)));
            pastBlock.hidden = past.length === 0;
        }
    }

    // ------------------------------------------------------------------ Livres

    const CATEGORIES = [
        { id: 'kalamu', cls: 'kalamu', icon: 'fa-feather-alt', titre: 'Publications Kalamu', texte: "Les œuvres de nos auteurs et de l'association" },
        { id: 'classiques', cls: 'classic', icon: 'fa-star', titre: 'Classiques', texte: 'Les œuvres fondatrices de la littérature africaine' },
        { id: 'contemporains', cls: 'contemporary', icon: 'fa-calendar-alt', titre: 'Contemporains', texte: 'Les nouvelles voix de la littérature africaine' },
        { id: 'jeunesse', cls: 'youth', icon: 'fa-user', titre: 'Jeunesse', texte: 'Des œuvres pour les jeunes lecteurs' }
    ];
    const BOOKS_VISIBLE = 2; // livres visibles par catégorie avant « Voir plus »

    function bookCard(book, cls) {
        const title = book.titre || 'Sans titre';
        const author = book.a_paraitre ? (book.auteur ? book.auteur + ' — à paraître' : 'À paraître') : (book.auteur || '');
        const short = book.resume_court || '';
        const full = [short, book.resume].filter(Boolean).join(' ');
        const hasMore = Boolean(book.resume);

        const toggle = hasMore ? el('button', {
            class: 'read-more-btn', type: 'button', 'aria-expanded': 'false',
            onclick: function () { window.toggleDescription(this); }
        }, ['Lire plus']) : null;

        return el('div', { class: 'book-card ' + cls }, [
            el('div', { class: 'book-cover' }, [
                book.cover
                    ? el('img', { src: book.cover, alt: title + (book.auteur ? ' - ' + book.auteur : ''), class: 'book-image', loading: 'lazy' })
                    : el('div', { class: 'book-image book-image-empty' }, [icon('fa-book')])
            ]),
            el('div', { class: 'book-info' }, [
                el('h3', { text: title }),
                author ? el('p', { class: 'book-author', text: author }) : null,
                short ? el('p', { class: 'book-description' }, [
                    el('span', { class: 'description-short', text: short }),
                    hasMore ? el('span', { class: 'description-full', style: 'display: none;', text: full }) : null
                ]) : null,
                toggle,
                book.genre ? el('div', { class: 'book-tags' }, [el('span', { class: 'book-tag', text: book.genre })]) : null
            ])
        ]);
    }

    function renderLibrary(data) {
        const container = document.getElementById('bibliotheque-collection');
        if (!container) return;
        const books = list(data.livres).filter(b => b.titre);
        container.replaceChildren();

        CATEGORIES.forEach(cat => {
            const items = books.filter(b => b.categorie === cat.id);
            if (!items.length) return;

            const cards = items.map(b => bookCard(b, cat.cls));
            cards.forEach((card, i) => { if (i >= BOOKS_VISIBLE) card.hidden = true; });

            let moreSection = null;
            if (items.length > BOOKS_VISIBLE) {
                const label = el('span', { class: 'see-more-text', text: 'Voir plus de ' + cat.titre.toLowerCase() });
                moreSection = el('div', { class: 'see-more-section' }, [
                    el('button', {
                        class: 'see-more-btn', type: 'button', 'aria-expanded': 'false',
                        onclick: function () {
                            const expanded = this.classList.toggle('expanded');
                            this.setAttribute('aria-expanded', String(expanded));
                            label.textContent = (expanded ? 'Voir moins de ' : 'Voir plus de ') + cat.titre.toLowerCase();
                            cards.forEach((card, i) => { if (i >= BOOKS_VISIBLE) card.hidden = !expanded; });
                        }
                    }, [label, icon('fa-chevron-down see-more-icon')])
                ]);
            }

            container.appendChild(el('div', { class: 'books-category', id: 'categorie-' + cat.id }, [
                el('div', { class: 'category-header' }, [
                    el('div', { class: 'category-icon' }, [icon(cat.icon)]),
                    el('h3', { text: cat.titre }),
                    el('p', { text: cat.texte })
                ]),
                el('div', { class: 'books-grid' }, cards),
                moreSection
            ]));
        });

        if (!container.children.length) {
            container.appendChild(el('p', { class: 'content-empty', text: 'La collection sera bientôt disponible.' }));
        }
    }

    function renderLibraryCarousel(data) {
        const track = document.getElementById('carrousel-livres');
        const indicators = document.getElementById('carrousel-indicateurs');
        if (!track) return;
        const books = list(data.livres).filter(b => b.carrousel && b.cover);

        track.replaceChildren(...books.map((book, i) => el('div', {
            class: 'carousel-slide' + (i === 0 ? ' active' : ''),
            style: 'background-image: url("' + encodeURI(book.cover).replace(/"/g, '%22') + '")',
            role: 'img',
            'aria-label': book.titre
        }, [
            el('div', { class: 'slide-content' }, [
                el('h3', { text: book.titre }),
                book.accroche ? el('p', { text: book.accroche }) : null
            ])
        ])));

        if (indicators) {
            indicators.replaceChildren(...books.map((book, i) => el('button', {
                class: 'indicator' + (i === 0 ? ' active' : ''), type: 'button',
                'aria-label': 'Afficher ' + book.titre,
                onclick: () => window.goToHeroSlide && window.goToHeroSlide(i)
            })));
        }
        if (window.goToHeroSlide) window.goToHeroSlide(0);
    }

    function renderHomeBooks(data) {
        const container = document.getElementById('accueil-livres');
        if (!container) return;
        const books = list(data.livres).filter(b => b.accueil && b.titre).slice(0, 4);
        container.replaceChildren(...books.map(book => el('div', { class: 'book-teaser' }, [
            book.cover ? el('img', { src: book.cover, alt: book.titre, class: 'book-cover', loading: 'lazy' }) : null,
            el('div', { class: 'book-overlay' }, [
                el('h4', { text: book.titre }),
                el('p', { text: book.a_paraitre ? 'À paraître' : (book.auteur || '') })
            ])
        ])));
    }

    // ------------------------------------------------------------------ Membres

    function renderMembers(data) {
        const photo = document.getElementById('photo-bureau');
        if (photo) {
            if (data.photo_groupe) {
                photo.src = data.photo_groupe;
                photo.hidden = false;
                photo.onclick = () => window.openImageModal && window.openImageModal(data.photo_groupe);
            } else {
                photo.hidden = true;
            }
        }

        const grid = document.getElementById('membres-fiches');
        if (!grid) return;
        const members = list(data.membres).filter(m => m.nom);
        grid.hidden = !data.afficher_fiches || members.length === 0;
        grid.replaceChildren(...members.map(m => el('div', { class: 'member-card' }, [
            el('div', { class: 'member-avatar' }, [
                m.photo ? el('img', { src: m.photo, alt: m.nom, loading: 'lazy' }) : icon('fa-user')
            ]),
            el('h4', { text: m.nom }),
            m.role ? el('p', { class: 'member-role', text: m.role }) : null,
            m.bio ? el('p', { class: 'member-bio', text: m.bio }) : null
        ])));
    }

    // ------------------------------------------------------------------ Coordonnées

    function telHref(number) {
        const digits = String(number).replace(/[^\d+]/g, '');
        if (digits.startsWith('+')) return 'tel:' + digits;
        if (digits.startsWith('00')) return 'tel:+' + digits.slice(2);
        return 'tel:+221' + digits; // numéros sénégalais par défaut
    }

    function renderInfos(data) {
        const phones = list(data.telephones);

        document.querySelectorAll('[data-info="adresse"]').forEach(n => { n.textContent = data.adresse || ''; });
        document.querySelectorAll('[data-info="telephones-texte"]').forEach(n => { n.textContent = phones.join(' - '); });
        document.querySelectorAll('[data-info="telephones"]').forEach(n => {
            n.replaceChildren(...phones.map(p => el('p', {}, [el('a', { href: telHref(p), text: p })])));
        });
        document.querySelectorAll('[data-info="email-lien"]').forEach(n => {
            if (data.email) n.href = 'mailto:' + data.email;
        });
        document.querySelectorAll('[data-info="email"]').forEach(n => {
            n.textContent = data.email || '';
            if (n.tagName === 'A') n.href = 'mailto:' + (data.email || '');
        });
        ['facebook', 'instagram', 'tiktok'].forEach(network => {
            document.querySelectorAll('[data-info-lien="' + network + '"]').forEach(link => {
                if (data[network]) {
                    link.href = data[network];
                    link.hidden = false;
                } else {
                    link.hidden = true;
                }
            });
        });
    }

    // ------------------------------------------------------------------ Hero : « À la une » et chiffres

    const CATEGORY_LABELS = { kalamu: 'Publications Kalamu', classiques: 'Classiques', contemporains: 'Contemporains', jeunesse: 'Jeunesse' };

    function featureCard(label, labelIcon, title, sub, subIcon, link, linkLabel, text, cover, meta) {
        return [
            el('span', { class: 'kl-feature-label' }, [icon(labelIcon), ' ' + label]),
            el('div', { class: 'kl-feature-head' }, [
                el('div', {}, [
                    el('h3', { text: title }),
                    sub ? el('p', { class: 'kl-feature-sub' }, [icon(subIcon), ' ' + sub]) : null
                ]),
                el('a', { href: link, class: 'kl-round-btn', 'aria-label': linkLabel }, [icon('fa-arrow-right')])
            ]),
            (text || cover) ? el('div', { class: 'kl-feature-body' }, [
                cover ? el('img', { src: cover, alt: '', class: 'kl-feature-cover', loading: 'lazy' }) : null,
                text ? el('p', { class: 'kl-feature-text', text: text }) : null
            ]) : null,
            meta.length ? el('div', { class: 'kl-feature-meta' },
                meta.map(([metaIcon, value]) => el('span', {}, [icon(metaIcon), value]))) : null
        ];
    }

    function renderHero(eventsData, booksData, membersData) {
        const card = document.getElementById('hero-a-la-une');
        const books = list(booksData && booksData.livres).filter(b => b.titre);

        // Chiffre : nombre de livres de la bibliothèque (hors livres à paraître)
        const count = document.getElementById('hero-nb-livres');
        if (count && books.length) count.textContent = String(books.filter(b => !b.a_paraitre).length);

        // Petites photos des membres
        const avatars = document.getElementById('hero-avatars');
        if (avatars) {
            const photos = list(membersData && membersData.membres).filter(m => m.photo).slice(0, 4);
            avatars.replaceChildren(...photos.map(m => el('img', { src: m.photo, alt: '', loading: 'lazy' })));
        }

        if (!card) return;
        const now = today();
        const next = list(eventsData && eventsData.evenements)
            .filter(e => e.titre && e.date_debut && String(e.date_fin || e.date_debut).slice(0, 10) >= now)
            .sort((a, b) => String(a.date_debut).localeCompare(String(b.date_debut)))[0];

        if (next) {
            card.replaceChildren(...featureCard(
                'Prochain événement', 'fa-calendar-alt', next.titre,
                next.lieu, 'fa-map-marker-alt', '#evenements', 'Voir les événements',
                next.description, null,
                [['fa-calendar', formatPeriod(next.date_debut, next.date_fin)]].concat(
                    list(next.tags).slice(0, 1).map(tag => ['fa-tag', tag]))
            ));
            return;
        }

        const book = books.find(b => b.accueil && !b.a_paraitre) || books.find(b => !b.a_paraitre);
        if (!book) return;
        card.replaceChildren(...featureCard(
            'À la une', 'fa-book-open', book.titre,
            book.auteur, 'fa-feather-alt', 'bibliotheque.html', 'Voir la bibliothèque',
            book.resume_court, book.cover,
            [book.genre ? ['fa-bookmark', book.genre] : null,
                CATEGORY_LABELS[book.categorie] ? ['fa-layer-group', CATEGORY_LABELS[book.categorie]] : null].filter(Boolean)
        ));
    }

    // ------------------------------------------------------------------ Carrousel de la bibliothèque
    // script.js suppose 6 diapositives fixes ; le nombre de livres du carrousel varie désormais.
    // On remplace donc la navigation par une version qui compte les diapositives réellement affichées.
    function setupHeroCarousel() {
        if (!document.querySelector('.modern-hero-carousel') || typeof heroCurrentSlide === 'undefined') return;
        window.changeSlide = function (direction) {
            const total = document.querySelectorAll('.carousel-slide').length;
            if (!total) return;
            heroCurrentSlide = (heroCurrentSlide + direction + total) % total; // eslint-disable-line no-undef
            window.updateSlide();
        };
        window.goToHeroSlide = function (index) {
            heroCurrentSlide = index; // eslint-disable-line no-undef
            window.updateSlide();
        };
    }

    // ------------------------------------------------------------------ Démarrage

    function run(path, ...renderers) {
        return loadJSON(path)
            .then(data => renderers.forEach(render => render(data)))
            .catch(error => console.error('Contenu non chargé :', error));
    }

    function init() {
        setupHeroCarousel();
        document.querySelectorAll('[data-annee]').forEach(n => { n.textContent = new Date().getFullYear(); });

        const needs = selector => document.querySelector(selector) !== null;
        if (needs('#evenements-a-venir')) run('/data/evenements.json', renderEvents);
        if (needs('#accueil-livres, #bibliotheque-collection, #carrousel-livres')) {
            run('/data/livres.json', renderHomeBooks, renderLibrary, renderLibraryCarousel);
        }
        if (needs('#photo-bureau, #membres-fiches')) run('/data/membres.json', renderMembers);
        if (needs('[data-info], [data-info-lien]')) run('/data/infos.json', renderInfos);
        if (needs('#hero-a-la-une')) {
            Promise.all(['/data/evenements.json', '/data/livres.json', '/data/membres.json'].map(path => loadJSON(path).catch(() => null)))
                .then(([events, books, members]) => renderHero(events, books, members))
                .catch(error => console.error('Hero non mise à jour :', error));
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
