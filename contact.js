/*
 * Page Contact : formulaire de contact et newsletter.
 * Les envois passent par Netlify Forms (aucun serveur à gérer) :
 *   Netlify > Forms > « contact » et « newsletter » (liste exportable en CSV).
 * Sans JavaScript, le formulaire fonctionne quand même (redirection vers cette page avec ?envoi=ok / ?inscription=ok).
 */
(function () {
    'use strict';

    var params = new URLSearchParams(location.search);
    var local = /^(localhost|127\.|\[::1\])/.test(location.hostname) || location.protocol === 'file:';

    function mailLink() {
        var link = document.querySelector('[data-info="email"]');
        return link ? link.textContent.trim() : 'associationkalamu@gmail.com';
    }

    function enhance(form, successFlag) {
        if (!form) return;
        var wrap = form.parentElement;
        var success = wrap.querySelector('.ct-success');
        var status = form.querySelector('.ct-status');
        var button = form.querySelector('button[type="submit"]');
        var label = button.querySelector('span');
        var original = label.textContent;

        function show(sent) {
            form.hidden = sent;
            success.hidden = !sent;
            if (sent) success.setAttribute('tabindex', '-1');
        }

        if (params.get(successFlag) === 'ok') show(true);

        var again = wrap.querySelector('[data-again]');
        if (again) again.addEventListener('click', function () { show(false); form.querySelector('input:not([type="hidden"])').focus(); });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            status.textContent = '';
            status.classList.remove('is-error');

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            button.disabled = true;
            label.textContent = 'Envoi…';

            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(new FormData(form)).toString()
            }).then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                form.reset();
                show(true);
                success.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }).catch(function (error) {
                console.warn('Envoi non abouti :', error);
                status.classList.add('is-error');
                status.textContent = local
                    ? 'L’envoi ne fonctionne qu’une fois le site publié sur Netlify (test en local impossible).'
                    : 'Oups, l’envoi n’a pas abouti. Réessayez dans un instant, ou écrivez-nous à ' + mailLink() + '.';
            }).then(function () {
                button.disabled = false;
                label.textContent = original;
            });
        });
    }

    enhance(document.getElementById('contact-form'), 'envoi');
    enhance(document.getElementById('newsletter-form'), 'inscription');

    // ?sujet=livre|partenaire|membre pré-sélectionne le sujet du message
    var subjects = { livre: 'Proposer un livre', partenaire: 'Devenir partenaire', membre: 'Devenir membre' };
    var select = document.getElementById('ct-sujet');
    var wanted = subjects[params.get('sujet')];
    if (select && wanted) select.value = wanted;
})();
