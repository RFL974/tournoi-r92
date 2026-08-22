# frontend/

Pages web (HTML / CSS / JS), **mobile-first**, sans framework — **en ligne sur GitHub Pages**
(workflow `.github/workflows/pages.yml`, publiées à chaque push sur `main`).

**Pages** (base `https://rfl974.github.io/tournoi-r92/`) :
- **`tournoi.html`** — page publique unique, **2 onglets** *Mon équipe* / *Classements* + filtre
  catégorie + podium ; thème clair (`css/tournoi-public.css`, charte du site vitrine).
- **`admin.html`** — organisateur (réglages, équipes, génération, publication) ; clé admin.
- **`saisie.html`** — saisie des scores (table de marque, filtres catégorie + grand terrain,
  accordéons) ; clé scores.
- **`perfs.html`** — « Perfs du club », page interne (non liée), lecture seule.
- **`invitation-club.html`** — **invitation vitrine** (Phase 1, générique) : carton d'invitation
  envoyé aux clubs AVANT leur réponse — repère visuel centré, affiche en héros, descriptif, frise horaire
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
  QR généré en local par `js/vendor/qrcode.js`). Un bouton **« Partager le dossier à mes
  équipes »** transmet le lien COMPLET (jeton compris, donc valable chez le destinataire) —
  partage natif du téléphone si disponible, sinon email / WhatsApp / copie du lien.
  Ouverte depuis l'admin (« Aperçu du dossier de … », qui ouvre le dossier d'un club réel).

  > L'**autorisation de droit à l'image** (génération d'un `.docx` côté client) a été **retirée
  > du dossier** le 2026-08-03. Son modèle a été **supprimé du dépôt le 2026-08-19** : il
  > désignait nommément une structure comme destinataire de droits sur l'image de mineurs, alors
  > qu'aucune structure n'a adopté l'application. Les librairies `js/vendor/pizzip.min.js` et
  > `js/vendor/docxtemplater.min.js` restent dans le dépôt : plus rien ne les charge.
- **`index.html`** — redirige la racine vers `tournoi.html`.

**Fichiers partagés** :
- `css/styles.css` (thème sombre admin/saisie/perfs) · `css/tournoi-public.css` (thème clair public).
- `css/sponsors.css` — **tous** les encarts partenaires (A→F, bandeau du dossier club compris),
  chargée par `tournoi.html`, `admin.html` et `dossier-club.html`. Un seul endroit pour un
  emplacement, quelle que soit la page qui l'affiche : c'est ce qui garantit que l'aperçu de
  l'admin montre exactement ce que le club recevra.
- `js/config.js` — `API_URL` (backend) + `SNAPSHOT_URL` (relais CDN, vide par défaut).
- `js/commun.js` — petites fonctions utilitaires communes aux 4 pages (`echapper`, `estTermine`,
  `afficherMessage`, `libelleTourFr`, `comparerCategorie`) ; chargé juste après `config.js`.
- `js/commun-dossier.js` — le socle des pages « document » (invitation, réponse, dossier) :
  helpers de mise en forme (`txt`, `dateLongueFr`, `section`, `ligne`…), résumés sportifs
  (`resumeMiTemps`, `resumeEffectif`, `resumeReglement`…) et surtout les **blocs de page
  partagés** — `heroDocument` (repère visuel + affiche + descriptif), `friseJournee`,
  `cartesCategories`, `piedDocument`. L'invitation et le dossier affichent ainsi les MÊMES
  blocs : corriger une formulation les corrige tous les deux.
- `js/api.js` — `apiGet` / `apiPost` / `apiPostProtege` + gestion des clés (session).
- `js/admin.js`, `js/saisie.js`, `js/tournoi.js`, `js/perfs.js` — logique de chaque page.
- `js/sponsors.js` — **partenaires** : roue de rotation équitable, rendu des 5 emplacements,
  message plein écran accessible, **mesure de visibilité**. Partagé entre la page publique,
  l'admin et le dossier club. Voir [`../docs/sponsors.md`](../docs/sponsors.md).

  > ⚠️ **La mesure n'est PAS locale — elle remonte au serveur.** Quand des partenaires sont
  > réellement à l'écran, la page range un **identifiant d'appareil** dans la mémoire du
  > navigateur (`localStorage`, renouvelé **chaque jour**) et **envoie les relevés au serveur**
  > *(action `mesureSponsors`)* : un premier envoi à **20 s**, puis toutes les **10 min**, un
  > dernier quand la page se ferme, et un **immédiat** au clic sur un partenaire. La remontée
  > n'est armée **que** si des partenaires sont affichés — interrupteur des partenaires sur
  > « non » ⇒ **rien n'est envoyé**. Ce que le serveur en fait : `../docs/sponsors.md`.
- `js/admin-sponsors.js` — écran admin « Partenaires » : réglages, fiches, fiche de visibilité.

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
