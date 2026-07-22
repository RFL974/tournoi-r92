# frontend/

Pages web (HTML / CSS / JS), **mobile-first**, sans framework — **en ligne sur GitHub Pages**
(workflow `.github/workflows/pages.yml`, publiées à chaque push sur `main`).

**Pages** (base `https://rfl974.github.io/tournoi-r92/`) :
- **`tournoi.html`** — page publique unique, **2 onglets** *Mon équipe* / *Classements* + filtre
  catégorie + podium ; thème clair (`css/tournoi-public.css`, charte du site vitrine).
- **`admin.html`** — organisateur (réglages, équipes, génération, publication) ; clé admin.
- **`saisie.html`** — saisie des scores (table de marque, filtres catégorie + grand terrain,
  accordéons) ; clé scores.
- **`perfs.html`** — « Perfs Racing », page interne (non liée), lecture seule.
- **`index.html`** — redirige la racine vers `tournoi.html`.

**Fichiers partagés** :
- `css/styles.css` (thème sombre admin/saisie/perfs) · `css/tournoi-public.css` (thème clair public).
- `js/config.js` — `API_URL` (backend) + `SNAPSHOT_URL` (relais CDN, vide par défaut).
- `js/commun.js` — petites fonctions utilitaires communes aux 4 pages (`echapper`, `estTermine`,
  `afficherMessage`, `libelleTourFr`, `comparerCategorie`) ; chargé juste après `config.js`.
- `js/api.js` — `apiGet` / `apiPost` / `apiPostProtege` + gestion des clés (session).
- `js/admin.js`, `js/saisie.js`, `js/tournoi.js`, `js/perfs.js` — logique de chaque page.

**Présentation de la page admin** (surcouches, la logique reste dans `admin.js`) :
- `css/theme-r92.css` — habillage navy/blanc/ciel, chargé après `styles.css`, scopé `.theme-clair`.
- `js/ecrans.js` + `css/ecrans.css` — mode « écrans » : barre latérale + 4 onglets sur grand écran.
- `js/assistant.js` — assistant à cartes (mobile) avec verrou « Suivant », et **aiguillage** au
  chargement : grand écran → mode écrans, mobile → assistant, « Vue classique » → page longue.

## Voir les pages en local
Ouvrir un fichier directement (double-clic) suffit pour un aperçu. Pour un vrai serveur local :

```bash
python3 -m http.server 8123 --directory frontend
# puis http://localhost:8123/admin.html
```

Mode d'emploi complet : [`../docs/guide-utilisateur.md`](../docs/guide-utilisateur.md).
Architecture : [`../docs/architecture.md`](../docs/architecture.md).
