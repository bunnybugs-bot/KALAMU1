/* Section Partenaires : onglets par famille + mur de partenaires lu dans data/partenaires.json */
(function () {
    'use strict';

    var tabsBox = document.querySelector('.pt2-tabs');
    if (!tabsBox) return;

    var tabs = Array.prototype.slice.call(tabsBox.querySelectorAll('.pt2-tab'));
    var layout = document.querySelector('.pt2-layout');
    layout.classList.add('pt2-js');

    function select(tab, focus) {
        tabs.forEach(function (t) {
            var on = t === tab;
            t.setAttribute('aria-selected', on ? 'true' : 'false');
            t.tabIndex = on ? 0 : -1;
            var panel = document.getElementById(t.getAttribute('aria-controls'));
            if (panel) panel.hidden = !on;
        });
        if (focus) tab.focus();
    }

    tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () { select(tab); });
        tab.addEventListener('keydown', function (e) {
            var next = null;
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
            if (e.key === 'Home') next = tabs[0];
            if (e.key === 'End') next = tabs[tabs.length - 1];
            if (next) { e.preventDefault(); select(next, true); }
        });
    });

    // ---------------------------------------------------------------- Mur des partenaires
    var TYPES = { education: 'Éducation', culture: 'Culture', ong: 'ONG', institutions: 'Institutions', medias: 'Médias' };
    var wall = document.getElementById('partenaires-logos');
    var list = document.getElementById('partenaires-liste');
    if (!wall || !list) return;

    function initials(name) {
        return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
    }

    fetch('/data/partenaires.json', { cache: 'no-cache' })
        .then(function (response) {
            if (!response.ok) throw new Error(String(response.status));
            return response.json();
        })
        .then(function (data) {
            var partners = (data.partenaires || []).filter(function (p) { return p && p.nom; })
                .sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); });
            if (!partners.length) return;

            partners.forEach(function (p) {
                var visual = document.createElement('span');
                visual.className = 'pt2-logo-visual';
                if (p.logo) {
                    var img = document.createElement('img');
                    img.src = p.logo;
                    img.alt = '';
                    img.loading = 'lazy';
                    img.addEventListener('error', function () { visual.textContent = initials(p.nom); });
                    visual.appendChild(img);
                } else {
                    visual.textContent = initials(p.nom);
                }

                var name = document.createElement('strong');
                name.textContent = p.nom;
                var type = document.createElement('small');
                type.textContent = TYPES[p.type] || '';

                var inner = [visual, name, type];
                var item = document.createElement('li');
                var holder;
                if (p.lien && /^https?:\/\//i.test(p.lien)) {
                    holder = document.createElement('a');
                    holder.href = p.lien;
                    holder.target = '_blank';
                    holder.rel = 'noopener';
                    holder.setAttribute('aria-label', p.nom + ' (nouvel onglet)');
                } else {
                    holder = document.createElement('span');
                }
                holder.className = 'pt2-logo';
                inner.forEach(function (n) { holder.appendChild(n); });
                item.appendChild(holder);
                list.appendChild(item);
            });
            wall.hidden = false;
        })
        .catch(function () { /* pas de partenaires renseignés : le mur reste masqué */ });
})();
