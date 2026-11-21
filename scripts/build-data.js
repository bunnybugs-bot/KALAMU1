/*
 * Assemble le contenu saisi dans l'espace admin (dossier content/)
 * en fichiers prêts à afficher (dossier data/), lus par content.js.
 * Lancé automatiquement par Netlify à chaque publication (voir netlify.toml).
 * Aucune dépendance : seulement Node.js.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const DATA = path.join(ROOT, 'data');

function readJSON(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
        console.warn(`Ignoré (fichier illisible) : ${path.relative(ROOT, file)} — ${error.message}`);
        return null;
    }
}

function readFolder(name) {
    const dir = path.join(CONTENT, name);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.json'))
        .sort()
        .map(file => readJSON(path.join(dir, file)))
        .filter(Boolean);
}

function readFile(name, fallback) {
    const file = path.join(CONTENT, name);
    return fs.existsSync(file) ? (readJSON(file) || fallback) : fallback;
}

const byOrder = (a, b) =>
    (Number(a.ordre) || 1000) - (Number(b.ordre) || 1000) ||
    String(a.titre || a.nom || '').localeCompare(String(b.titre || b.nom || ''), 'fr');

function write(name, value) {
    fs.writeFileSync(path.join(DATA, name), JSON.stringify(value, null, 2) + '\n');
    console.log(`data/${name} généré`);
}

fs.mkdirSync(DATA, { recursive: true });

const evenements = readFolder('evenements')
    .sort((a, b) => String(a.date_debut || '').localeCompare(String(b.date_debut || '')));
const livres = readFolder('livres').sort(byOrder);
const membres = readFolder('membres').sort(byOrder);
const bureau = readFile('bureau.json', {});
const infos = readFile('infos.json', {});
const chiffres = readFile('chiffres.json', { chiffres: [] });

write('evenements.json', { evenements });
write('livres.json', { livres });
write('membres.json', { ...bureau, membres });
write('infos.json', infos);
write('chiffres.json', chiffres);

console.log(`${evenements.length} événements, ${livres.length} livres, ${membres.length} membres.`);
