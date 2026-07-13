# Journal des évolutions

Toutes les étapes significatives du projet sont notées ici, de la plus récente à la plus ancienne.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/).

## [Non publié]

### Session 12 — 2026-07-13 (classement des poules)
- **Calcul du classement (prérequis 2)** : nouvelle fonction backend `calculerClassement(classeur)` +
  action de lecture `getClassement`. Pour chaque poule : J / V / N / D / BP / BC / Diff / Pts.
  Barème **V=3 / N=2 / D=1** ; ne compte que les matchs `terminé` ; tri par **points**, puis
  **différence** (BP−BC), puis **points marqués**. Cœur **réutilisé tel quel par l'après-midi**.
- Helpers `enregistrerResultat()` et `comparerClassement()`. Logique validée hors-ligne (Node),
  dont une **égalité départagée à la différence** et l'exclusion des matchs non terminés.
- Nouvelle page **`frontend/classement.html`** + `js/classement.js` : un tableau de classement par
  poule, groupé par catégorie (colonnes centrées, points en gras). Styles `.table-classement`.
  Vérifiée en preview (rendu desktop + scroll horizontal contenu sur mobile). ⚠️ backend à redéployer.

### Session 11 — 2026-07-13 (saisie des scores)
- **Phase après-midi — décisions de conception** (prérequis à l'implémentation) : format retenu =
  **classement croisé** (les équipes de même rang de poule jouent ensemble, round-robin par groupe) ;
  fabrication = **génération en 2 temps** (bouton « Générer l'après-midi » après saisie des scores du
  matin). Prérequis identifiés, dans l'ordre : (1) saisie des scores, (2) calcul du classement,
  (3) génération après-midi. Voir `docs/phases-tournoi.md`.
- **Saisie des scores (prérequis 1)** : nouvelle action d'écriture `enregistrerScore`
  (`id_match`, `score_A`, `score_B`) qui écrit les scores dans l'onglet `Matchs` et passe le match
  en `terminé`. Validation des scores (entiers ≥ 0) côté backend via `validerScore()`.
- Nouvelle page dédiée **`frontend/saisie.html`** + `js/saisie.js` : liste des matchs par catégorie,
  deux champs de score + bouton **Valider** par match (usage table de marque / téléphone). Un match
  terminé reste modifiable. Styles ajoutés dans `styles.css` (cartes `.match`).
- `validerScore()` validé hors-ligne (Node) ; page vérifiée en preview (rendu + garde-fou champ vide
  + câblage API confirmé). ⚠️ **Backend à redéployer** pour activer l'enregistrement en ligne.
- Outil de dev : `.claude/serveur-preview.js` (petit serveur statique Node) car le `python3` de
  l'environnement est bloqué par le sandbox ; `.claude/launch.json` bascule sur Node.

### Note de conception — 2026-07-13
- Besoin identifié : la logique de l'**après-midi** diffère du matin (poules) — matchs de
  **classement / phases finales** qui dépendent des **résultats du matin**. Non implémenté ;
  capturé dans `docs/phases-tournoi.md` (approches possibles + questions à trancher, impact probable :
  colonne `phase` dans Matchs, génération en 2 temps ou structure à trous).

### Session 10 — 2026-07-13 (nettoyage & doc)
- Mise à jour de toute la doc racine : `README.md` (statut consolidé), `docs/architecture.md`
  (table des actions réellement disponibles + notes génération/arbitrage), `docs/guide-admin.md`
  (mode d'emploi complet de la page admin).
- Commentaires d'en-tête de `admin.js` complétés (génération + arbitrage).
- **Code mort supprimé** dans `styles.css` : `.ligne-info .libelle`/`.valeur`, `.statut-present`/
  `.statut-absent` (anciennes pastilles), `.reglage .r-valeur` — plus générés depuis le passage
  aux formulaires modifiables.

### Session 9 — 2026-07-13
- **Assistant d'arbitrage** : quand l'heure de fin est fixée manuellement et que le planning la
  dépasse, la génération propose des **pistes d'ajustement** (commencer plus tôt, réduire pause
  déjeuner / battement, ajouter un terrain, raccourcir mi-temps, réduire récup, réduire taille de
  poule). Chaque piste est **réellement simulée** (heure de fin résultante + gain), triée, et
  marquée ✅ si elle tient le créneau ; elle est **cliquable** pour appliquer le réglage et régénérer.
- `Code.gs` : planning extrait dans `calculerPlanning()` (réutilisable, sans écriture) ;
  `analyserArbitrages()` + `construireCandidats()` + `appliquerModif()` + `clonerConfig()`/`trouverCat()`.
- `admin.js`/`styles.css` : affichage des arbitrages cliquables sous le bouton Générer.
- Analyseur validé hors-ligne (Node) : leviers correctement classés par impact réel.

### Session 8 — 2026-07-13
- **Battement terrain** : nouveau réglage global `battement_terrain_min` — temps pour libérer un
  terrain entre 2 matchs (le terrain n'est réutilisable qu'à `fin + battement`).
- **Heure de fin automatique** : nouveau réglage `heure_fin_auto` (`oui`/`non`). En auto, l'heure
  de fin = fin du dernier match, recalculée et réécrite dans Config à chaque génération ; sinon
  valeur manuelle (avec alerte si dépassement).
- `Code.gs` : `enregistrerHoraires` réécrit via `ecrireParamGlobal()` (crée le paramètre s'il
  manque) ; génération prend en compte battement + heure de fin auto ; défauts ajoutés dans `setupSheet`.
- `admin.js` / `styles.css` : formulaire horaires avec case « auto » (grise le champ heure de fin)
  et champ « battement entre matchs » ; le planning et l'heure de fin se rafraîchissent après génération.
- Algorithme revalidé hors-ligne (Node) : battement respecté, 0 conflit.

### Session 7 — 2026-07-13
- Page admin **étape 4 — génération : bouton + affichage du planning (frontend)**.
  - Bouton « Générer poules et planning » (avec confirmation ; prévient que ça efface scores/matchs).
  - Affichage : composition des poules + tableau du planning (heure, terrain, poule, match avec
    noms d'équipes), par catégorie ; le planning existant s'affiche aussi au chargement de la page.
- Correctif backend : l'onglet `Matchs` est forcé au **format texte** avant écriture (les heures
  `11:00` étaient converties en valeurs date/heure). Vérifié : les heures s'affichent en `HH:MM`.
- Page admin **étape 4 — génération des poules et du planning (backend)**.
- `backend/Code.gs` : `genererPoulesEtPlanning()` + helpers (`tourneeToutesRondes`, `dureeMatch`,
  `hmVersMin`/`minVersHm`, `idMatch`, `melanger`, `ecrireGeneration`, `viderDonnees`).
  Répartit en poules (taille cible), crée les matchs (round-robin), planifie sans conflit
  (récup entre matchs, terrains dédiés, pause déjeuner évitée, alerte si dépassement de l'heure
  de fin). Écrit dans Poules, Equipes.poule et Matchs. Action doPost `genererPoulesEtPlanning`.
- Algorithme validé hors-ligne (Node) : 0 conflit terrains/équipes/récup/déjeuner, round-robin complet.
- Reste : bouton dans la page admin + affichage du planning généré.

### Session 6 — 2026-07-13
- Page admin **étape 3b — catégories modifiables depuis la page** (frontend seul, backend déjà en place).
  - Chaque catégorie devient un formulaire : interrupteur « Présente », terrains, taille de poule,
    nb de mi-temps, durées, pauses, récup → enregistrement via `enregistrerCategorie`.
  - Ajout et suppression de catégorie depuis la page (`enregistrerCategorie` / `supprimerCategorie`).
  - Écouteurs « délégués » sur la zone réglages (résistent au re-rendu) ; le menu des équipes suit
    les catégories présentes.
- Page admin **étape 3a — horaires modifiables depuis la page** (écriture dans Config).
- `backend/Code.gs` : nouvelles actions d'écriture des réglages : `enregistrerHoraires()`,
  `enregistrerCategorie()` (créer/mettre à jour), `supprimerCategorie()`. → **1 redéploiement**
  couvre aussi l'étape 3b (catégories modifiables) à venir.
- `frontend/js/admin.js` : la carte « Horaires » devient un formulaire (champs `<input type="time">`
  = rouleau natif sur mobile) ; enregistrement via `apiPost('enregistrerHoraires', …)`.
- `frontend/css/styles.css` : styles du formulaire de réglages (libellé/valeur, champ heure sombre).

### Session 5 — 2026-07-13
- Page admin **étape 2 — saisie des équipes** (première ÉCRITURE dans le Sheet).
- `backend/Code.gs` : ajout de `doPost()` + `ajouterEquipe()`, `supprimerEquipe()`,
  `genererIdEquipe()` (identifiants auto E01, E02…). → nécessite un **redéploiement** du backend.
- `frontend/js/api.js` : ajout de `apiPost(action, data)` (POST en `text/plain` pour éviter le
  preflight CORS non géré par Apps Script).
- `frontend/admin.html` : section « Équipes » (formulaire nom + catégorie, liste).
- `frontend/js/admin.js` : chargement via `getAll`, remplissage du menu catégories (présentes),
  ajout/suppression d'équipe avec rechargement de la liste, messages de retour.
- `frontend/css/styles.css` : styles du formulaire, boutons et liste d'équipes.
- ✅ **Testé avec succès** : ajout et suppression d'équipes depuis la page fonctionnent
  (écriture réelle dans l'onglet `Equipes`). POST navigateur → 302 → JSON confirmé.

### Session 4 — 2026-07-13
- Début du frontend : **page admin (étape 1 — affichage)**.
- Ajout de `frontend/css/styles.css` : charte R92 (couleurs, polices Bebas Neue / Barlow
  Condensed / Barlow), mobile-first, cartes et grilles de réglages.
- Ajout de `frontend/js/api.js` : `apiGet(action)` (lecture des données via `fetch`).
- Ajout de `frontend/js/admin.js` : lit `getConfig` et affiche horaires globaux + catégories.
- Ajout de `frontend/admin.html` : structure de la page + chargement des scripts.
- Ajout de `.claude/launch.json` : config de serveur local pour prévisualiser le frontend.
- Vérifié : le backend renvoie `access-control-allow-origin: *` → lecture navigateur autorisée.

### Note de migration — 2026-07-11
- Développement fait sur les **comptes personnels** de Romain ; tout devra basculer sur les
  **comptes de l'association** (en création). Ajout de `docs/migration-association.md` : check-list
  de bascule (Sheet, Apps Script/déploiement, dépôt GitHub, domaine, HelloAsso). La centralisation
  de `SHEET_ID` et `API_URL` rend la migration simple (transférer 3 objets + màj 1-2 valeurs).

### Note d'intégration — 2026-07-11
- Précision : les résultats publics seront une **section intégrée au site principal
  generationr92.fr** (développé en parallèle, dépôt GitHub séparé, pas encore en ligne), et non
  un simple sous-domaine autonome. Le `data.json` reste le pont d'intégration (techno-agnostique).
  Docs mises à jour (`README.md`, `deploiement.md`) + correction d'un doublon dans `deploiement.md`.

### Note d'architecture — 2026-07-11
- Décision **scalabilité/trafic** documentée (`architecture.md`) : pour supporter potentiellement
  ~1000 visiteurs le jour J, les pages publiques (planning/live) liront un **instantané `data.json`
  servi par CDN** (régénéré par Apps Script à chaque score + toutes les ~1 min), plutôt que
  d'interroger Apps Script à chaque vue. Écriture = Apps Script ; lecture publique = fichier statique.
  À implémenter au moment de construire les pages publiques.

### Session 3 — 2026-07-11
- `backend/Code.gs` : ajout de l'API de **lecture** (`doGet`) qui répond en JSON.
  Actions : `ping`, `getConfig`, `getEquipes`, `getPoules`, `getMatchs`, `getAll`.
  Helpers : `lireOngletSimple()` (Equipes/Poules/Matchs) et `lireConfig()` (2 zones).
- **Backend déployé en Web App** (accès « Tout le monde ») et **testé avec succès** :
  l'API renvoie bien la config et les catégories.
- `frontend/js/config.js` : création, stocke l'URL du backend (`API_URL`) — source unique.
- Documentation `deploiement.md` mise à jour : backend déployé, comment tester, comment
  redéployer sans changer l'URL, et note sécurité pour la future écriture.

### Session 2 — 2026-07-11
- Ajout de `backend/Code.gs` avec la fonction `setupSheet()` : crée automatiquement les 4 onglets
  (`Equipes`, `Poules`, `Matchs`, `Config`) et leurs en-têtes, stylise les en-têtes (charte R92),
  fige la 1re ligne, et pré-remplit `Config` (réglages globaux + exemples de catégories M8/M10/M12).
- Onglet `Config` forcé au format texte pour préserver les heures (`09:00`) et listes de terrains (`1,2`).
- `setupSheet()` cible le Sheet par son identifiant (`SpreadsheetApp.openById(SHEET_ID)`) plutôt que
  par le classeur actif : robuste que l'éditeur Apps Script soit lié au Sheet ou en projet indépendant.
- ✅ **Testé avec succès** : les 4 onglets ont été créés dans le Sheet.
- Documentation mise à jour (`structure-google-sheet.md` : création auto + disposition exacte des zones).

### Session 1 — 2026-07-11
- Création de la structure de dossiers du projet (`docs/`, `backend/`, `frontend/`).
- Rédaction de la documentation initiale : `README.md`, `docs/architecture.md`,
  `docs/structure-google-sheet.md`, `docs/deploiement.md`, `docs/guide-admin.md`.
- Ajout de `CHANGELOG.md` et `.gitignore`.
- Décisions techniques structurantes :
  - Terrains **dédiés par catégorie** (chaque catégorie tourne sur ses propres terrains).
  - Classement de poule **simplifié** : Victoire = 3, Nul = 2, Défaite = 1 ; départage à la
    différence de points marqués/encaissés.
  - Génération des poules par **taille cible** (l'algo crée autant de poules que nécessaire).
- Définition finalisée de la structure des 4 onglets du Google Sheet.

_À venir : initialisation Git + dépôt GitHub, puis premier code (backend Apps Script)._
