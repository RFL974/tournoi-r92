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
- **`invitation-club.html`** — **invitation vitrine** (Phase 1, générique) : carton d'invitation
  envoyé aux clubs AVANT leur réponse — blason centré, affiche en héros, descriptif, frise horaire
  de la journée, une carte détaillée par catégorie (forme de jeu FFR, temps de jeu, pauses,
  récupération, effectifs, arbitrage, règlement), repères FFR ; export PDF via l'impression
  (`css/dossier.css`, `js/invitation.js`). Les données viennent de la vue publique `invitation`
  du backend (liste blanche sans donnée personnelle). Ouverte depuis l'email (lien personnel
  `?club=…&token=…`), elle affiche le bouton « Répondre à l'invitation » du club.
- **`reponse-invitation.html`** — **réponse à l'invitation** (lien PERSONNEL avec jeton, reçu par
  email) : même en-tête vitrine que l'invitation, puis le formulaire libre-service — présent /
  absent, équipes par catégorie, joueurs + éducateurs par équipe, totaux vivants
  (`js/reponse.js`).
- **`dossier-club.html`** — **dossier du club** (Phase 2, lien PERSONNEL avec jeton) : la page
  envoyée au club APRÈS son acceptation. **Même charte que l'invitation** (blocs communs de
  `js/commun-dossier.js`) mais **un autre rôle, donc un autre ordre** : l'invitation *vend*
  (affiche en héros, descriptif du tournoi, cadre sportif haut), le dossier *organise*. En-tête
  avec le **nom du club** et son engagement, affiche **réduite**, **pas de descriptif** (il a été
  lu à l'invitation), puis le **jour J** — la journée en un coup d'œil, **vos équipes** (et leurs
  poules), **votre planning** (les matchs du club : le matin dès la génération, l'après-midi
  quand il est composé), infos
  pratiques, parking & accès, votre contact, sécurité, suivi & QR — puis en **rappel** les cartes
  des catégories engagées, l'encadrement, les modalités, et le bandeau d'actions.
  **Page VIVANTE** : le club garde son lien et la page se reconstruit à chaque ouverture avec les
  données du moment — ce qui n'existe pas encore à l'envoi apparaîtra tout seul.
  Export PDF via l'impression du navigateur (`css/dossier.css`, `js/dossier.js`,
  QR généré en local par `js/vendor/qrcode.js`).
  Ouverte depuis l'admin (« Aperçu du dossier de … », qui ouvre le dossier d'un club réel).

  > L'**autorisation de droit à l'image** (génération d'un `.docx` côté client) a été **retirée
  > du dossier** le 2026-08-03, à la demande du club. Le modèle
  > `assets/autorisation-droit-image-template.docx` et les librairies `js/vendor/pizzip.min.js`
  > + `js/vendor/docxtemplater.min.js` restent dans le dépôt : plus rien ne les charge, mais
  > tout est là si la fonction revient.
- **`index.html`** — redirige la racine vers `tournoi.html`.

**Fichiers partagés** :
- `css/styles.css` (thème sombre admin/saisie/perfs) · `css/tournoi-public.css` (thème clair public).
- `js/config.js` — `API_URL` (backend) + `SNAPSHOT_URL` (relais CDN, vide par défaut).
- `js/commun.js` — petites fonctions utilitaires communes aux 4 pages (`echapper`, `estTermine`,
  `afficherMessage`, `libelleTourFr`, `comparerCategorie`) ; chargé juste après `config.js`.
- `js/commun-dossier.js` — le socle des pages « document » (invitation, réponse, dossier) :
  helpers de mise en forme (`txt`, `dateLongueFr`, `section`, `ligne`…), résumés sportifs
  (`resumeMiTemps`, `resumeEffectif`, `resumeReglement`…) et surtout les **blocs de page
  partagés** — `heroDocument` (blason + affiche + descriptif), `friseJournee`,
  `cartesCategories`, `piedDocument`. L'invitation et le dossier affichent ainsi les MÊMES
  blocs : corriger une formulation les corrige tous les deux.
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
