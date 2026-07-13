# frontend/

Pages web du projet (HTML / CSS / JS), **mobile-first**, à héberger sur un sous-domaine de
`generationr92.fr`. Le code arrivera après le backend.

Pages prévues : `admin.html`, `planning.html`, `live.html`, `scores.html`.
Fichiers partagés : `css/styles.css`, `js/config.js`, `js/api.js`.

- **`admin.html`** — ✅ créée (étape 1 : affiche les réglages en lecture seule).
- **`css/styles.css`** — ✅ créé. Style commun (charte R92), mobile-first.
- **`js/config.js`** — ✅ créé. Contient l'URL du backend (`API_URL`), source unique.
- **`js/api.js`** — ✅ créé. Fonction `apiGet(action)` pour lire les données du backend.
- **`js/admin.js`** — ✅ créé. Logique de la page admin.

## Voir les pages en local
Ouvrir `admin.html` directement dans le navigateur (double-clic) suffit pour le développement.
Ou, pour un vrai serveur local, depuis la racine du projet :

```bash
python3 -m http.server 8123 --directory frontend
# puis ouvrir http://localhost:8123/admin.html
```

Voir [`../docs/architecture.md`](../docs/architecture.md).
