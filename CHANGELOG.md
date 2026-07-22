# Journal des évolutions

Toutes les étapes significatives du projet sont notées ici, de la plus récente à la plus ancienne.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/).

## [Non publié]

### Admin : verrou du bouton « Suivant » dans l'assistant — 2026-07-22
Pendant la préparation du tournoi, l'assistant à cartes **empêche de passer à l'étape
suivante tant que l'étape en cours n'est pas complète** : « Suivant » est **grisé** avec
une **explication** de ce qui reste à faire (enregistrer, générer, répartir…). Et si on
**modifie après avoir enregistré**, le verrou **se referme** : il faut ré-enregistrer /
régénérer / ré-appliquer la partie modifiée. **100 % frontend** (aucun redéploiement backend).

- `assistant.js` : le verrou combine **deux détections** —
  1. le « cerveau » (`calculerEtatsEtapes`) : étapes ⚪️ à faire / 🟠 à refaire de la carte
     (ex. « Réglages modifiés depuis la génération » sur la carte Poules) ;
  2. les **modifications non enregistrées** : chaque formulaire est comparé à sa « photo »
     prise à son dernier état enregistré (+ cas dédiés : équipe saisie mais pas ajoutée,
     renommage en cours, affiche choisie, répartition calculée mais pas appliquée,
     édition de poules ouverte).
- Le **fil d'étapes** grise les étapes hors de portée (au-delà de la 1re étape bloquée) ;
  sauter en avant par le fil ou les flèches ← → est **borné à l'étape à corriger** ;
  revenir en arrière reste toujours possible. L'après-midi ne bloque pas (elle se génère
  plus tard, comme pour le verdict « prêt à publier »).
- `admin.js` : après chaque **enregistrement réussi** (infos, horaires, catégorie, plan des
  terrains) ou re-rendu depuis l'état enregistré, la « photo » de référence est reprise
  (`assistantMarquerPropre`) → le verrou se rouvre aussitôt.
- `styles.css` : bouton grisé, encart d'explication (petit tremblement si on insiste),
  étapes estompées ; respecte « animations réduites ».

### Saisie des scores : filtre « Grand terrain » — 2026-07-22
À la table de marque, on peut désormais **filtrer les matchs par grand terrain** (ex. « Rugby 1
(terrains 1, 2, 3, 4) ») en plus du filtre catégorie : on ne voit que les matchs des mini-terrains
qui composent le grand terrain où l'on se trouve → **pas d'erreur de saisie**. ⚠️ **Backend à
redéployer** (recoller `Code.gs`) et **répartition à ré-appliquer** une fois dans l'admin.

- `admin.js` : **✅ Appliquer aux catégories** mémorise aussi la **composition des grands terrains**
  (nouveau paramètre Config `repartition_grands_terrains`, JSON `{"Rugby 1":["1","2"],…}`).
- `Code.gs` : `enregistrerPlanTerrains` accepte ce nouveau paramètre.
- `saisie.html` / `saisie.js` : menu **« Grand terrain »** (mémorisé, masqué si moins de deux
  grands terrains ou répartition jamais appliquée) ; compteurs « X à saisir » et accordéons
  calculés sur la liste filtrée.
- Petit plus admin : le **calendrier** du champ Date (Infos du tournoi) s'ouvre au clic **n'importe
  où sur la barre** (plus seulement sur l'icône).

### Performance : capacité démultipliée pour la page publique (audit perf) — 2026-07-20
Optimisations **sans aucun changement de fonctionnalité ni d'API** — objectif : tenir la foule
du jour J (~1300 spectateurs) avec de la marge. ⚠️ **Backend à redéployer** (recoller `Code.gs`,
nouvelle version) ET **frontend à publier**.

**Backend (`Code.gs`) :**
- `doGet` : `ping` et `getAll` (cache chaud) répondent **sans ouvrir le classeur**
  (`SpreadsheetApp.openById()` ≈ 0,5 s à lui seul). `getAll` servi du cache passe de ~0,7 s à
  quelques ms → le plafond Apps Script (~30 exécutions simultanées) se libère d'autant plus
  vite, la même Web App encaisse **beaucoup plus de spectateurs**.
- **Anti-pointe** (« cache stampede ») : à l'expiration du cache (10 s), UN seul
  « reconstructeur » relit le Sheet (jeton `snapshot_regen`) ; les autres reçoivent une **copie
  de secours** (clé longue durée, ~10 s de retard max). Avant : des dizaines de relectures
  simultanées possibles à chaque expiration.
- Saisie d'un score de Coupe : l'objet du match est **réutilisé en mémoire** au lieu d'être relu
  dans le Sheet avant propagation, et `majPetiteFinale` balaie l'onglet **une fois au lieu de
  deux** → moins de temps sous le verrou d'écriture (les autres marqueurs attendent moins).

**Frontend :**
- **`tournoi.js`** (page publique) : rafraîchissement **en pause quand l'onglet est caché**
  (téléphone verrouillé, autre appli) + **recharge immédiate au retour** au premier plan ;
  **délai max de 12 s** par requête (une connexion qui « pend » n'immobilise plus la boucle) ;
  index `id → nom` des équipes (fini le parcours de la liste à chaque `nomEquipe()`).
- **`api.js`** : `apiGet(action, params, { delaiMs })` — délai maximum optionnel (abandon de la
  requête au-delà). Rétro-compatible : sans option, comportement inchangé.
- **`perfs.js`** : `getAll` + `getHistorique` chargés **en parallèle** (page ~2× plus rapide) ;
  boucle chaînée (fini `setInterval` qui pouvait empiler des requêtes) + pause en arrière-plan.

**Relais CDN (`cloudflare/worker-tournoi.js`, dormant) :**
- `stale-while-revalidate=30` : à l'expiration du cache de bord, le CDN ressert l'ancienne copie
  pendant qu'il en cherche une fraîche → réponse toujours immédiate, zéro vague sur le Worker.
  (À recoller dans Cloudflare seulement si le relais est activé un jour.)

### Qualité du code : mutualisation des utilitaires + nettoyage (audit) — 2026-07-20
Refonte **sans aucun changement de fonctionnalité** (qualité/maintenabilité uniquement).
⚠️ **frontend à publier** ET (pour les points backend) **backend à redéployer** (comportement
identique, aucune migration de données).

**Frontend :**
- Nouveau fichier **`frontend/js/commun.js`** : `echapper`, `estTermine`, `afficherMessage`,
  `libelleTourFr`, `comparerCategorie` écrits **une seule fois** au lieu d'être recopiés dans les
  4 pages. Chargé en premier dans chaque page HTML (après `config.js`). Copies retirées de
  `admin.js` / `tournoi.js` / `saisie.js` / `perfs.js`.
- **`admin.js`** : nouveau helper `rechargerEtRendre(options)` qui remplace le bloc
  « recharger `getAll` + re-rendre » recopié dans 6 handlers (rafraîchir / générer / recalculer /
  après-midi / réinitialiser / éditer les poules). Suppression de la fonction morte `nbTuiles`.

**Backend (`Code.gs`) :**
- `indexEnteteCategories(donnees)` : la recherche de la ligne d'en-tête « categorie » (recopiée
  **5 fois**) est factorisée en un seul helper.
- `ecrireParamsGlobaux(onglet, paires)` : écriture de plusieurs paramètres globaux en **une passe**
  (moins d'allers-retours avec le Sheet) à la génération et au recalcul. **Prouvé strictement
  équivalent** à des écritures successives (test d'équivalence : cas tout-existant / tout-nouveau /
  mixtes).

**Répartition des terrains (`admin.js`) :**
- `allouerTerrains` (~224 lignes, la fonction la plus complexe du frontend) découpée en
  **7 fonctions nommées** : `attribuerTerrainsEntiers` (étape 1), `attribuerDemisTerrains` (étape 2),
  `construireFilesAttribution` (étape 3), `poserTerrainSolo` / `poserTerrainScinde` (poseurs),
  `attribuerGrandsTerrains` (étape 4), `mixerEnSecours` (étape 5) + un court orchestrateur.
  L'état de travail (compteur de numérotation, avertissements, couleurs…) passe par un **contexte
  explicite `ctx`** au lieu de variables de closure dispersées. **Prouvé strictement équivalent** :
  batterie de **429 scénarios** déterministes (cas limites + générés) comparant l'ancien et le
  nouveau code — 0 écart sur les résultats ET l'état muté.
- Suppression de `cellulesGrille` (code mort, 0 appelant — comme `nbTuiles`).

- Vérifié : syntaxe OK sur tous les JS + `Code.gs` ; zéro erreur console sur les 4 pages ; tests
  d'équivalence au vert (batch Config 6/6 — dont clé dupliquée —, allouerTerrains 429/429) ;
  parcours réel « Répartir les terrains » exercé dans le navigateur avec la config en ligne
  (carte SVG conforme, numérotation continue).
- **Revue croisée multi-relecteurs** (équivalence / intégration / régression, chaque finding
  contre-vérifié) : aucun bug fonctionnel ; 5 points mineurs relevés et **tous corrigés** —
  ordre du vidage des arbitrages restauré dans la réinitialisation (chemin d'erreur réseau),
  `ecrireParamsGlobaux` aligné sur « première occurrence gagnante » comme l'ancien code,
  commentaires d'ordre des scripts (admin.html, saisie.html), commentaire orphelin (tournoi.js),
  `frontend/README.md` complété avec `js/commun.js`.

**Planification (`Code.gs`, étape finale de l'audit) :**
- `analyserArbitrages` / `analyserArbitragesMatin` (jumelles à 95 %) → noyau commun
  `analyserArbitragesSelon(config, equipes, cible, projeter)` + deux enrobages d'une ligne.
- Nouveaux helpers `listeTerrainsCategorie(cat)` (parsing « 1, 2 » recopié 3×) et
  `terrainPlusTot(terrains, terrainLibre)` (sélection du terrain libre recopiée 2×).
- Les deux boucles de planning (matin / après-midi) restent **volontairement séparées** :
  leurs contraintes diffèrent réellement (amorçage des disponibilités, saut de pause déjeuner
  vs barrière de tour de Coupe, équipes inconnues des brackets, forme du résultat) — les
  fusionner aurait produit une fonction à options illisible. Un commentaire l'explique dans
  le code.
- **Prouvé strictement équivalent** : banc de **842 comparaisons** (planning déterministe,
  tirage aléatoire seedé, affectation manuelle imposée, projections matin/journée, arbitrages,
  après-midi direct avec barrière de Coupe, équipes inconnues, `CROISE_DIAGONAL`) — 0 écart.
- **Seconde revue adversariale** (2 lentilles + contre-vérification) : aucun bug de
  comportement ; 3 trous de couverture relevés dans les bancs de test eux-mêmes, **tous
  comblés** — les bancs comparent désormais les fonctions chargées depuis les **vrais
  fichiers** (référence = git HEAD d'avant le chantier, pas des copies collées), la partie
  « params Config » et les sites d'`indexEnteteCategories` sont exercés (23 vérifications),
  et les formats d'après-midi non couverts ont leur cas direct.

### Terrains par catégorie : mode Auto / Manuel + vérification — 2026-07-20
Le champ **Terrains** d'une catégorie devient un choix **Auto / Manuel** (défaut **Auto**).
⚠️ **backend à redéployer** (nouvelle colonne `terrains_auto`, migration douce) + frontend à publier.
- **Auto** *(défaut)* : plus rien à saisir — les terrains viennent de l'onglet **Terrains &
  répartition**. La carte affiche les terrains actuels à titre indicatif.
- **Manuel** : saisie des numéros à la main, avec **vérification en direct** (« arbitrage ») au fil de
  la frappe : terrain **déjà utilisé** par une autre catégorie, numéro qui **n'existe pas** dans la
  répartition, catégorie **sans terrain**, saisie **non numérique**.
- **« Répartir / Appliquer »** ne touche plus **que les catégories en mode Auto** ; celles en Manuel
  gardent leurs numéros (indiqué dans la confirmation et le message de fin).
- Migration : colonne `terrains_auto` (`oui`/`non`, vide = `oui`) ajoutée automatiquement. Doc :
  guide-utilisateur §1.2/§1.4, structure-google-sheet.md.

### Nouveau format d'après-midi : classement croisé **diagonal** — 2026-07-20
4ᵉ format d'après-midi (aux côtés de Croisé / Libre / Coupe + Plateau), choisi par catégorie.
⚠️ **backend à redéployer** (nouvelle sous-fonction `fixturesApresMidiCroiseDiagonal`) + frontend à
publier.
- **Principe** : comme le croisé, mais les rangs sont **décalés** — le **1ᵉʳ d'une poule affronte le
  2ᵉ d'une AUTRE poule** (au lieu du 1ᵉʳ contre le 1ᵉʳ). Des affiches plus imprévisibles, **sans
  aucune élimination** : de simples matchs isolés qui alimentent le **même classement général +
  podium** que le croisé.
- **Pairage** : 2 poules → `1ᵉʳA vs 2ᵉB`, `1ᵉʳB vs 2ᵉA`, `3ᵉA vs 4ᵉB`… ; ≥ 3 poules → **rotation
  cyclique** (`1ᵉʳA vs 2ᵉB`, `1ᵉʳB vs 2ᵉC`, `1ᵉʳC vs 2ᵉA`…) ; **effectif impair** → repli en croisé
  classique pour le rang orphelin (équipe seule mise au repos, avertissement).
- **Distinction voulue** dans l'UI : titre « croisé **diagonal** », explication qui répète
  « 1ᵉʳ contre 2ᵉ » vs « 1ᵉʳ contre 1ᵉʳ », et récap de confirmation en capitales **DIAGONAL** pour
  ne pas le confondre avec le croisé simple au moment du choix.
- **Réutilisation** : niveaux étiquetés `N1`, `N2`… comme le croisé → classement, podium et
  affichage spectateur/saisie **partagés sans code dédié**.
- Doc : formats-apres-midi.md §2.

### Répartition automatique des terrains + carte visuelle — 2026-07-20
Nouvelle carte admin **« 🗺️ Terrains & répartition »** (entre Équipes et Poules & planning) qui
part des **grands terrains réels** et les **découpe automatiquement** en mini-terrains attribués aux
catégories. Fini l'attribution « au hasard » du champ Terrains. ⚠️ **backend à redéployer** (nouvelle
action `enregistrerPlanTerrains` qui mémorise le plan) + frontend à publier.
- **Déclaration** : grands terrains (nom, type 🏉/⚽, longueur × largeur, **emplacement** sur une
  grille 3×3), **couloir** de circulation (5 m), et **taille de terrain par catégorie** (ou « terrain
  entier » pour U14). **Tableau de capacité** recalculé en direct (combien de mini-terrains tiennent
  par grand terrain, couloirs compris, 2 orientations testées).
- **Répartir** : distribue les mini-terrains **selon le nombre d'équipes** (charge équilibrée),
  chaque catégorie **groupée** ; **partage** d'un grand terrain (scindé en deux) s'il y a plus de
  catégories que de terrains ; **table des marques** = 1 mini-terrain central réservé (« TM »),
  scindée en deux en cas de partage ; **U14** occupe un grand terrain entier.
- **Numérotation continue** : mini-terrains numérotés **1…N**, chaque numéro **unique** (évite la
  confusion à la table des marques, ex. plus de `R1-1`/`R2-1`).
- **Carte visuelle** dessinée **« comme sur le site »** (terrains à leur vraie position via
  l'emplacement 3×3) : couleur = catégorie, numéro = terrain, zone grise = table des marques.
- **Appliquer** écrit les numéros dans le champ **Terrains** de chaque catégorie (action existante
  `enregistrerCategorie`) → utilisés à la génération du planning. Ajustement manuel toujours possible.
- Doc : guide-utilisateur §1.4.

### Podium aussi en Coupe + Plateau — 2026-07-19
Le **podium 🥇🥈🥉** s'affiche désormais aussi pour le format **Coupe + Plateau** (avant : croisé
uniquement). Il apparaît dès qu'il est **décidé**. **Frontend seul, pas de redéploiement backend.**
- **Croisé** → top 3 du classement général (quand il est mathématiquement verrouillé — inchangé).
- **Coupe + Plateau** → 🥇 vainqueur de la finale, 🥈 finaliste, 🥉 vainqueur de la petite finale.
- **Libre** → **pas de podium** (choix assumé : format amical sans classement, pour ne pas classer
  les plus jeunes).

### Classement croisé : le vainqueur du tournoi est mis en avant — 2026-07-19
Précision : le classement croisé **désigne bien un vainqueur** — l'équipe qui finit **1ʳᵉ du
Niveau 1** (le groupe des premiers de poule) **remporte le tournoi**. Correctifs (**frontend seul,
pas de redéploiement backend**) :
- **Description** corrigée dans l'admin et la doc (fini le trompeur « pas de vainqueur final »).
- **Page publique** : l'onglet **Classements** affiche désormais le **classement général du
  tournoi** (en plus des niveaux), avec le **vainqueur mis en avant** (🏆 + ligne dorée) quand il
  est **mathématiquement certain** ; sinon l'équipe **en tête** (provisoire) est indiquée. Même
  mise en avant dans la vue « Mon équipe ».

### Formats d'après-midi par catégorie (Croisé / Libre / Coupe + Plateau) — 2026-07-19
Chaque catégorie choisit désormais **son propre format d'après-midi**, dans le même tournoi (ex.
M8 en « Matchs libres » pendant que M12 joue en « Coupe + Plateau »). Le choix se fait **au
paramétrage** (avant le jour J), pour l'annoncer aux équipes à l'avance. Voir le guide dédié
[`docs/formats-apres-midi.md`](docs/formats-apres-midi.md). ⚠️ **backend à redéployer** + frontend à
publier (déployer d'un seul tenant).

**Formats** : `CROISE` (historique, défaut), `LIBRE` (matchs amicaux, sans classement),
`COUPE_PLATEAU` (les *X* premiers de chaque poule en élimination directe + petite finale ; les
autres en plateau). Le bracket crée **automatiquement** 8èmes / quarts / demies / finale selon le
nombre de qualifiés (`poules × nbQualifiesCoupe`), avec **byes** si ce n'est pas une puissance de 2.
*(Non encore implémentés : « repoules », « repêchage ».)*

- **Modèle de données** (migrations **automatiques**, aucune manip) :
  - Config, par catégorie : `format_apresmidi` + `param_format` (JSON, ex. `{"nbQualifiesCoupe":2}`),
    créées dès le 1ᵉʳ enregistrement d'une catégorie.
  - Matchs : `format`, `sous_tableau` (COUPE/PLATEAU), `tour`, `match_suivant`, `place_suivant`,
    `vainqueur`. Toutes les lignes sont écrites sur 18 colonnes.
- **Backend** : `genererApresMidi` devient un **répartiteur** (→ `fixturesApresMidiCroise` / `…Libre`
  / `…CoupePlateau`) ; bracket par doublement de têtes de série (`construireBracketCoupe`, byes,
  petite finale) ; planification enrichie (équipes de bracket encore inconnues + barrière de tour).
  Erreurs **explicites** si le matin est incomplet.
- **Propagation Coupe** : `enregistrerScore` refuse un match « en attente », **exige un vainqueur**
  en cas d'égalité (pas de nul en élimination), **propage** le gagnant dans le match suivant
  (`propagerVainqueurBracket`), remplit la **petite finale** (perdants des demies), et **bloque** une
  correction déjà propagée sauf confirmation (**cascade**).
- **Admin** (`admin.js`) : choix du format en **cartes explicatives** (pas un simple menu) + champ
  « qualifiés en Coupe » conditionnel + récap ; disponible **dès la configuration**.
- **Saisie** (`saisie.js`) : contexte lisible (« 🏆 Demi-finale — Coupe U12 »…), matchs **en attente**
  verrouillés, **départage** (radio vainqueur), bandeau « Match amical » (LIBRE), confirmation de
  **correction en cascade**, rafraîchissement auto après une saisie de Coupe. `api.js` expose la
  réponse serveur sur l'erreur (drapeaux `departage_requis` / `cascade_requise`).
- **Page publique** (`tournoi.js`) : affichage **adapté au format** — **arbre** pour la Coupe
  (colonnes par tour + petite finale, gagnant mis en avant), liste pour le Plateau, liste amicale
  pour LIBRE, croisé inchangé. `perfs.js` inchangé (déjà format-agnostique).
- **Vérifs** : 45 tests backend (bracket, propagation, planification) + rendus vérifiés au navigateur
  (admin, saisie, page publique).

### Fix : « heure de fin » (auto) reflète enfin la fin de la JOURNÉE — 2026-07-19
Bug : en mode auto, « heure de fin des matchs » restait figée sur la fin du **matin** (ex. 11:36)
alors que le dernier match de l'après-midi finissait bien plus tard (ex. 14:49). Cause : `heure_fin`
n'était (re)calculée qu'à la **génération des poules du matin** (comme projection) ; ni
`genererApresMidi` ni `reorganiserPoulesMatin` ne la mettaient à jour. Correctif (⚠️ **backend, à
redéployer**) :
- **`genererApresMidi`** : en auto, écrit `heure_fin` = **vraie fin du dernier match** de la journée
  (matin + après-midi réels). Renvoie aussi `heure_fin_journee`.
- **`reorganiserPoulesMatin`** : en auto, recalcule `heure_fin` = fin **projetée** de la journée.
- Frontend : après génération de l'après-midi / réorganisation des poules, le formulaire
  « Horaires » est re-rendu (l'heure de fin à l'écran suit) et le message affiche « 🏁 Fin de la
  journée ». Pour corriger la valeur actuellement figée : redéployer puis **regénérer l'après-midi**.

### Admin : thème clair aligné sur la page publique + logo — 2026-07-19
Nouveau look de la page admin (frontend seul, **pas de redéploiement**), **calqué sur la page
publique du tournoi** : **fond blanc**, **cartes blanches** (liseré fin + ombre douce), **en-tête
navy** dégradé avec fine barre bleue (le **logo bleu ciel y ressort**), accents **bleu vif**, textes
navy/gris — mêmes couleurs que `tournoi-public.css`. Activé par la classe **`theme-clair`** sur
`<body>` d'admin.html → **scopé à la page admin** (Saisie/Perfs gardent le thème sombre ; la page
publique a sa propre CSS). Technique : remappage de `--texte`/`--bleu-ciel` sous `.theme-clair`
(pour rattraper les couleurs posées en `var(...)`, y compris inline) + overrides explicites des
fonds/champs/panneaux (cartes, tableau de bord, barre de connexion, planning, éditeur de poules,
zone de danger). **Logo Génération R92** dans l'en-tête (`frontend/img/logo-r92.png`, PNG source
1,6 Mo redimensionné à 800×533 / 164 Ko ; se masque tout seul si absent). Vérifié au navigateur
(desktop 1280 + mobile 375 : cartes blanches lisibles, en-tête navy + logo, planning/danger OK ;
0 erreur console).

### Admin : vrai tableau de bord sur grand écran (grille 2 colonnes) — 2026-07-19
La page admin gaspillait la largeur sur ordinateur (colonne de 900px centrée, grandes marges vides).
Sur **grand écran (≥1024px)**, `<main>` devient une **grille 2 colonnes** (frontend seul, **pas de
redéploiement**) : conteneur élargi à **1320px**, formulaires étroits **côte à côte** (Infos |
Horaires, puis Après-midi | Publier), et blocs larges (récap, Catégories, Équipes, Poules & planning,
Réinitialiser) en **pleine largeur**. Le **mobile reste inchangé** (une colonne). Mise en œuvre :
zone réglages scindée en `#zone-horaires` / `#zone-categories` (helper `injecterReglages`) ; grille
scopée à la page admin via `:has(#reglages)`. Au passage, le bloc **« Infos du tournoi »** est
remonté **au-dessus de « Horaires »** (à remplir en premier). Vérifié au navigateur (desktop 1440 :
conteneur 1320, 2×652px, paires côte à côte, blocs larges pleine largeur ; mobile 375 : une colonne ;
0 erreur console).

### Admin : modification manuelle des poules du matin — 2026-07-19
Nouvelle fonctionnalité : rééquilibrer les niveaux des poules du matin à la main (une équipe
dominante peut sinon tomber dans une poule faible). ⚠️ **Nécessite de recopier `Code.gs` +
redéployer** (nouvelle action backend).
- **Frontend** : bouton **✏️ Modifier les poules du matin** (visible quand des poules existent) →
  éditeur avec, par poule, une **✕** pour sortir une équipe (« à replacer »), puis **→ Poule X**
  pour la réaffecter ; indicateur d'**équilibre des tailles** (⚠️ si écart > 1) ; boutons
  **Enregistrer et recalculer** / **Annuler**. Garde-fous : refus si un **score du matin** est déjà
  saisi, et si des équipes restent « à replacer ».
- **Backend** : `calculerPlanning` accepte une **répartition imposée** (4ᵉ paramètre) au lieu du
  tirage auto ; nouvelle action `reorganiserPoulesMatin(assignation)` qui applique la répartition
  et **recalcule les matchs + horaires du matin** (même garde-fou scores côté serveur). L'après-midi
  n'est pas concerné (il reflète le niveau réel du matin).
- Vérifié au navigateur (planning fictif) : éditeur, ✕/réaffectation, équilibre ✅/⚠️, garde-fous
  entrée (scores) et sauvegarde (équipes à replacer) ; 0 erreur console. Guide utilisateur §1.4 à jour.
- ⚠️ **Recopier `Code.gs` + redéployer** pour activer la fonction (l'action `reorganiserPoulesMatin`).

### Admin : guidage quand aucune catégorie n'existe — 2026-07-19
Guidage (frontend seul, **pas de redéploiement**). Sans catégorie, le menu déroulant d'ajout
d'équipe était vide **sans explication** (utilisateur bloqué). Désormais `remplirSelectCategories`
affiche une **aide** (« ➕ Ajoute d'abord une catégorie… ») et **désactive le formulaire d'ajout**
(nom, menu, bouton) tant qu'aucune catégorie n'existe ; tout se réactive dès la première catégorie.
Vérifié au navigateur (0 catégorie → aide visible + formulaire désactivé ; 1 catégorie → aide masquée
+ formulaire actif ; 0 erreur console). Guide utilisateur §1.3 à jour.

### Admin : anti-doublon à l'ajout / au renommage d'une équipe — 2026-07-19
Qualité des données (frontend seul, **pas de redéploiement**). Ajouter deux équipes du **même nom
dans la même catégorie** créait de la confusion (planning, classements). Désormais `onAjouterEquipe`
et `onEnregistrerNom` **refusent un doublon** (comparaison en MAJUSCULES, insensible à la casse ;
le renommage s'exclut lui-même) avec un message clair, **avant** tout appel backend. Vérifié au
navigateur (« racing 1 » refusé quand « RACING 1 » existe, sans appel serveur ; nom différent
accepté). Guide utilisateur §1.3 à jour.

### Saisie : alerte cohérence après-midi si correction d'un score du matin — 2026-07-19
Cohérence des données (frontend seul, **pas de redéploiement**). L'après-midi (classement croisé)
est calculé une fois sur le classement du matin ; corriger un score du matin **après** génération de
l'après-midi peut fausser les niveaux. Désormais, sur la page Saisie, **corriger un score du matin
alors que l'après-midi est déjà généré** déclenche une **alerte** invitant à faire régénérer
l'après-midi (rien si aucun après-midi, ou si la correction porte sur un match d'après-midi). Note
passive ajoutée aussi côté admin (§ Phase après-midi). Le backend `genererApresMidi` **remplace**
proprement l'après-midi à la régénération (aucun changement backend nécessaire). Vérifié au
navigateur (correction matin + après-midi présent → alerte ; correction matin sans après-midi →
pas d'alerte ; 0 erreur console). Guide utilisateur §2 à jour.

### Admin : avancement « X/Y saisis » dans le planning — 2026-07-19
Pour piloter la journée sans quitter la page admin (frontend seul, **pas de redéploiement**) :
`afficherPlanning` ajoute un badge **« X/Y saisis »** à côté de chaque **catégorie** et de chaque
**phase** (Matin / Après-midi) — **bleu** tant qu'il reste des scores à entrer, **vert + ✅** quand
tout est saisi (helper `badgeAvancement`, statut `terminé`). Se met à jour avec le bouton
🔄 Rafraîchir. Vérifié au navigateur (état partiel bleu 2/3 · 0/1 ; état complet vert 3/3 ✅ ;
0 erreur console). Guide utilisateur §1.4 à jour.

### Admin : garde-fou contre l'effacement des scores à la régénération — 2026-07-19
Sécurité de données (frontend seul, **pas de redéploiement**). « Générer poules et planning » efface
tous les scores. Avant, un seul clic + confirmation simple suffisait à tout perdre en plein tournoi.
Désormais, `onGenerer` **compte les scores déjà saisis sur des données fraîches** (`getMatchs`) :
- **Aucun score** (préparation) → confirmation simple, comme avant.
- **Des scores existent** → avertissement **rouge** indiquant le **nombre** de matchs concernés,
  **puis** demande de la **clé admin** (double verrou) avant d'effacer. Annuler à n'importe quelle
  étape n'efface rien.
Vérifié au navigateur (chemin renforcé avec 3 scores simulés : avertissement rouge + demande de clé ;
chemin normal sans score : confirmation simple ; 0 erreur console). Guide utilisateur §1.4 à jour.

### Saisie + Admin : bouton « Rafraîchir » (données à jour le jour J) — 2026-07-19
Les pages **Saisie** et **Admin** ne rechargeaient les données qu'à l'ouverture (`getAll` une seule
fois). Problème le jour du tournoi : l'indicateur « scores du matin complets » (qui débloque la
génération de l'après-midi) restait figé, et une table de marque ne voyait pas les saisies des
autres appareils. Correctif (frontend seul, **pas de redéploiement**) :
- **Saisie** : bouton **🔄 Rafraîchir** + heure de dernière mise à jour (recharge manuelle, pour ne
  pas effacer un score en cours de frappe).
- **Admin** : bouton **🔄 Rafraîchir** dans le tableau de bord (recharge scores/planning/état
  après-midi **sans** re-rendre les formulaires de réglages en cours d'édition — vérifié au
  navigateur : une valeur tapée dans « Terrains » est conservée après rafraîchissement).
- Guide utilisateur §1.0 et §2 à jour.

### Admin : sécurité de la connexion (verrouiller + changer de clé) — 2026-07-19
Sécurité (frontend seul, **pas de redéploiement**) pour le cas « ordinateur laissé ouvert » :
- **Bouton 🔒 Verrouiller** dans la barre de connexion : efface la clé admin mémorisée → la page
  repasse en « Non connecté » et toute écriture redemande la clé.
- **« Changer de clé »** demande désormais **la clé actuelle en premier** (comparée à la clé
  mémorisée) avant d'autoriser la saisie d'une nouvelle clé. Clé actuelle erronée → refus.
- Vérifié au navigateur (verrouillage efface la clé et bascule la barre ; mauvaise clé actuelle
  refusée ; 0 erreur console).

### Admin : audit UX — points de confort (dialogues, connexion, affiche, « Présente ») — 2026-07-19
Troisième vague de l'audit UX (les « petits plus »). ⚠️ **Contient une nouvelle action backend
(`supprimerAffiche`) → il faut recopier `Code.gs` + redéployer** (les autres changements sont
frontend). Détail :
- **Fenêtres de dialogue maison** (nouveau `frontend/js/dialog.js`, chargé sur les 4 pages) :
  remplacent tous les `confirm` / `prompt` / `alert` natifs par des fenêtres aux couleurs du site
  (`dialogConfirmer` / `dialogAlerter` / `dialogDemander`, basées sur des Promesses ; Entrée =
  valider, Échap = annuler). `api.js` (clé) et `admin.js` (confirmations) adaptés. Actions
  destructives = bouton rouge.
- **Barre de connexion** (admin) : indique si la clé admin est active (🔓 Connecté / 🔒 Non
  connecté) avec bouton *Se connecter* / *Changer de clé*.
- **Retirer l'affiche** (point 8) : bouton sous l'aperçu qui annule un choix non enregistré, ou
  supprime l'affiche enregistrée (fichier Drive à la corbeille + `tournoi_affiche_id` effacé).
  **Nouvelle action backend `supprimerAffiche`.**
- **Suppression du réglage « Présente »** : toute catégorie existante est active (le toggle est
  retiré ; l'ajout et l'enregistrement envoient toujours `presente:'oui'`). Simplifie le modèle :
  une catégorie qui existe joue et apparaît dans le menu des équipes. (Frontend seul ; la colonne
  `presente` du Sheet reste, toujours à `oui`.)
- Vérifié au navigateur (dialogues, barre de connexion 2 états, carte catégorie sans toggle,
  bouton affiche) : 0 erreur console. Guide utilisateur §1.0, §1.2, §1.6 à jour.

### Admin : audit UX — tableau de bord + sections repliables — 2026-07-19
Deuxième vague de l'audit UX (« priorité moyenne »), **frontend uniquement — aucun changement
backend, pas de redéploiement `Code.gs`** :
- **Tableau de bord en haut de page** : bandeau récapitulant l'état du tournoi en un coup d'œil
  (**Catégories** présentes/total · **Équipes** · **Planning** ⚪️/🌅/🌅🏉 · **Publication** ⚪️/🟢),
  mis à jour automatiquement à chaque action (`majTableauBord()` dans admin.js).
- **Sections repliables** (`<details>`/`<summary>`) : « Horaires de la journée » (dépliée par
  défaut, pliable une fois réglée) et « Réinitialiser le tournoi » (repliée par défaut — moins de
  scroll, et on évite de l'ouvrir par erreur).
- Vérifié au navigateur (serveur local + backend en ligne, lecture publique sans clé) : rendu du
  bandeau (2 colonnes mobile / 4 colonnes desktop), pliage/dépliage OK, aucune erreur console.
- Mise à jour du mode d'emploi ([`docs/guide-utilisateur.md`](docs/guide-utilisateur.md), §1.0).

### Admin : audit UX — 3 correctifs de flux — 2026-07-18
Suite à un audit UX de la page administration, trois pièges du parcours sont corrigés
(frontend uniquement, **aucun changement backend — pas de redéploiement nécessaire**) :
- **Infos du tournoi enregistrables à tout moment** : ajout d'un bouton **« Enregistrer les
  infos »** dédié. Avant, les infos n'étaient sauvegardées qu'au clic sur « Générer le tournoi »
  et devenaient **non modifiables une fois publié** (il fallait dépublier). Elles sont désormais
  modifiables à tout moment, même après publication (et toujours enregistrées aussi à la
  publication, par sécurité).
- **Fin de l'ambiguïté « Générer »** : le bloc de publication s'appelle maintenant **« Publier le
  tournoi »** (bouton **« 🚀 Publier le tournoi »**) pour ne plus être confondu avec « Générer
  poules et planning ».
- **Phase après-midi : état de préparation** : une ligne indique l'avancement des scores du matin
  (ex. « ✅ 12/12 saisis — prêt » / « ⏳ 8/12 saisis ») et le bouton **« 🏉 Générer l'après-midi »**
  reste **désactivé tant que tous les scores du matin ne sont pas saisis**, au lieu d'échouer sur
  une erreur serveur au clic.
- Mise à jour du mode d'emploi ([`docs/guide-utilisateur.md`](docs/guide-utilisateur.md), §1.5–1.7).

### Admin : bouton de réinitialisation du tournoi — 2026-07-17
- Nouvelle **zone de danger** sur la page admin avec un bouton **« 🧹 Réinitialiser le tournoi »**
  (double confirmation). Il remet le tournoi à zéro pour repartir d'une base vierge : supprime
  toutes les **catégories**, toutes les **équipes**, toutes les **poules** et tous les **matchs**
  (planning + scores), efface les **infos du tournoi** (nom, date, lieu, description, affiche —
  affiche Drive mise à la corbeille), et repasse le tournoi en **masqué** s'il était public.
- **Conservés** : les réglages « Horaires de la journée » (heure début/fin, pauses…) et le
  **journal de saison** (onglet Historique, utilisé par la page Perfs).
- Nouvelle action backend `reinitialiserTournoi` (protégée par la clé ADMIN) + helpers
  `supprimerToutesCategories` et `effacerParamGlobal`.
- ⚠️ Nécessite de **recopier `Code.gs` + redéployer** (nouvelle action backend).

### Audit complet (code + sécurité + doc), nettoyage et documentation — 2026-07-14
- **Audit** du backend, du frontend, de la sécurité et de la documentation (4 passes).
- **Correctifs code** (sans changement fonctionnel) : `LockService` autour de `doPost` (écritures
  concurrentes sérialisées) ; écriture d'équipe en format texte (anti-injection de formule) ;
  garde-fou taille du cache serveur (<95 Ko) + snapshot construit une seule fois par écriture ;
  fix `[hidden] !important` manquant dans `tournoi-public.css` (contrôles visibles sur l'écran
  « à venir ») ; échappement du nom de catégorie (admin) ; rôles ARIA sur les onglets publics ;
  suppression de code mort (CSS de la page publique resté dans `styles.css`, variable `ongletActif`).
- **Sécurité** : audit rassurant (aucun secret dans le repo/historique, écritures protégées,
  affichage échappé). Recommandations : clés admin/scores **longues et aléatoires**, Sheet en
  partage **Restreint**. Voir [`docs/passation.md`](docs/passation.md).
- **Documentation** : nouveau **mode d'emploi complet** [`docs/guide-utilisateur.md`](docs/guide-utilisateur.md)
  et **doc de passation/portabilité** [`docs/passation.md`](docs/passation.md). Docs périmées
  corrigées (README, architecture, deploiement, phases-tournoi, backend/frontend README) ;
  `guide-admin.md` et `migration-association.md` supprimés (remplacés par les deux nouveaux).
- ⚠️ Les correctifs backend nécessitent de **recopier `Code.gs` + redéployer**.

### Montée en charge GRATUITE : cache serveur + étalement — 2026-07-14
- Solution **sans nouvel outil ni coût** (tout reste dans Apps Script + GitHub Pages) pour tenir
  ~1300 spectateurs : **cache serveur** (`CacheService`) sur `getAll` (~10 s) → un seul appel relit
  le Sheet par tranche, les autres reçoivent la copie en mémoire (~200 ms). Cache **rafraîchi à
  chaque écriture** (`apresEcriture`), donc les scores apparaissent sans retard.
- Côté navigateur : **étalement (jitter)** des rafraîchissements (`planifierProchainChargement`) pour
  éviter que tous les spectateurs appellent à la même seconde ; intervalle porté à **~15 s** (marge
  sous le plafond ~30 exécutions simultanées d'Apps Script).
- Le **relais CDN Cloudflare reste en sommeil** (dormant, cf. entrée ci-dessous) : activable plus
  tard pour une garantie « béton » sans rien réécrire.
- ⚠️ Le cache serveur nécessite de **recopier `Code.gs` + redéployer**.

### Montée en charge : relais CDN pour les spectateurs (Cloudflare) — 2026-07-14
- Prépare le support de **~1300 spectateurs** en direct sans saturer Apps Script (plafond ~30
  exécutions simultanées). Apps Script **pousse** un instantané des données vers un cache **edge
  Cloudflare** à chaque écriture (`pousserSnapshot` appelé après chaque action réussie de `doPost`) ;
  la page publique lit ce cache (illimité) au lieu d'interroger Apps Script.
- **Repli automatique intégré** : tant que le relais n'est pas configuré (`SNAPSHOT_URL` vide côté
  frontend, `RELAIS_URL` non réglé côté Apps Script via `configurerRelais`), tout fonctionne comme
  avant (lecture directe Apps Script). Idem si le relais tombe en panne.
- Nouveaux éléments : `cloudflare/worker-tournoi.js` (Worker), `docs/relais-cdn.md` (pas-à-pas de
  mise en place), `construireSnapshot`/`pousserSnapshot`/`configurerRelais` (backend),
  `lireDonnees` (frontend), constante `SNAPSHOT_URL` (config.js).
- ⚠️ Activation : recopier `Code.gs` + redéployer + `configurerRelais(url, cle)`, créer le Worker
  Cloudflare, puis renseigner `SNAPSHOT_URL`. Voir `docs/relais-cdn.md`.

### Saisie : repli immédiat de l'accordéon dès le dernier score validé — 2026-07-14
- Après chaque validation, l'accordéon de la phase se met à jour **en direct** (sans recharger) :
  le compteur « X à saisir » décrémente, et la phase **se replie automatiquement dès la validation
  de son dernier score** (après-midi → toujours ; matin → seulement si l'après-midi est déjà généré).
  Approche chirurgicale (`majAccordeonPhase`) : aucune autre saisie en cours n'est perdue.

### Saisie des scores : lisible sur téléphone (scoreboard vertical) + fix accordéon iOS — 2026-07-14
- **Refonte de la carte de match** : chaque équipe sur **sa propre ligne** avec son champ de score
  à droite (au lieu d'une ligne horizontale qui s'enroulait sur mobile — les deux scores se
  retrouvaient à côté d'une seule équipe, ambigu et source d'erreur). Clair sur téléphone ET ordinateur.
- **Fix accordéon sur iOS/Safari** : `<summary>` n'utilise plus `display:flex` (ce qui cassait le
  pliage/dépliage natif sur Safari mobile) ; chevron rendu en `::before` inline.
- 100 % frontend (`saisie.js` + `styles.css`).

### Saisie des scores : filtre par catégorie + matin repliable — 2026-07-14
- **Une table de marque par catégorie** : un menu déroulant en haut ne montre que les matchs de
  la catégorie choisie (masqué s'il n'y en a qu'une ; choix mémorisé). Limite fortement le risque
  d'erreur le jour J.
- **Le matin devient un accordéon** : replié par défaut **uniquement** quand tous ses matchs sont
  saisis ET que l'après-midi est généré (on range le matin pour se concentrer sur l'après-midi).
  Sinon il reste ouvert. Ré-ouvrable d'un clic ; la **correction d'un score du matin reste possible**.
- 100 % frontend (`saisie.html` + `saisie.js` + CSS accordéon dans `styles.css`).

### Rafraîchir corrigé (anti-cache) + titre = nom de l'événement — 2026-07-14
- **Bouton « Rafraîchir » réparé** : `apiGet` ajoutait la réponse au cache navigateur (surtout
  mobile) → les nouveaux scores n'apparaissaient pas. Ajout de `cache: 'no-store'` + paramètre
  anti-cache unique sur chaque lecture. Concerne toutes les pages (tournoi, perfs, admin…).
- **Retour visible** : le bouton affiche « ⏳ Rafraîchissement… » pendant la requête, et l'heure
  « Mis à jour à » affiche désormais les **secondes** (on voit que ça bouge même sans changement).
- **Titre dynamique** : la page publique « Le tournoi » prend le **nom de l'événement**
  (`config.global.tournoi_nom`) dans le bandeau ET l'onglet du navigateur ; repli sur « Le tournoi »
  si le nom n'est pas renseigné.

### Page publique : podium (top 3) affiché dès qu'il est mathématiquement certain — 2026-07-14
- Un **encadré podium** apparaît en haut à droite de la carte (pleine largeur sur mobile),
  **commun aux deux onglets** (« Mon équipe » et « Classements ») et **dynamique selon la
  catégorie** sélectionnée.
- Il ne s'affiche **que lorsque le trio de tête est verrouillé** — c.-à-d. quand aucun résultat
  possible des matchs restants ne peut changer les 3 premières places ni leur ordre. Prend en
  compte **tous les facteurs** du classement général : niveau (figé dès l'après-midi), résultats
  après-midi puis matin, et le barème V=3/N=2/D=1 avec départage diff/points marqués. Comme les
  scores sont libres (la diff peut basculer), la certitude repose sur des **écarts de points
  inatteignables** ; le podium peut donc s'afficher **avant** la fin de tous les matchs.
- 100 % frontend (`tournoi.js` : `podiumCertain`/`garantiDevant`/`departageGaranti` ; `tournoi.html`
  + `tournoi-public.css`). Aucun changement backend.

### Admin : arbitrage quand le matin déborde sur la pause déjeuner — 2026-07-14
- La **pause déjeuner** est traitée comme une **contrainte dure** : si le dernier match du
  **matin (poules)** se termine **après le début de la pause**, la génération lève un
  avertissement ET propose des **pistes d'arbitrage** pour finir le matin avant la pause
  (même principe que le dépassement de l'heure de fin manuelle).
- Backend : détection `matinDepasse` (fin du matin > début de pause) dans `genererPoulesEtPlanning` ;
  nouvelles fonctions `finMatinProjetee` + `analyserArbitragesMatin` ; nouveaux champs de retour
  `arbitrage_cause` (`'matin'` / `'forcage'` / `'fin'`) et `pause_debut`.
- Frontend : `afficherArbitrages` affiche une intro dédiée au cas « matin ».
- ⚠️ Nécessite de **recopier `backend/Code.gs`** dans Apps Script puis de **redéployer**.

### Page publique « Le tournoi » : nouveau design aux couleurs du site vitrine — 2026-07-14
- La page publique adopte la **charte du site vitrine boutique-r92** (navy / bleu ciel / bleu vif,
  polices **Barlow** + **Barlow Condensed**) au lieu de l'ancien thème sombre : en-tête navy avec
  logo R92 + lien « ← Retour au site », **bandeau de titre** en dégradé navy, contenu dans une
  **carte blanche**, **pied de page** navy.
- Nouvelle feuille **`frontend/css/tournoi-public.css`** DÉDIÉE à `tournoi.html` (thème clair).
  Les pages **admin / saisie / perfs gardent** leur `styles.css` (thème sombre) — aucun impact.
- Tous les composants fonctionnels (onglets, filtres, cartes de match, derniers scores, tableaux
  de classement, écran « à venir ») ont été recolorés en thème clair ; logos/favicon/grain servis
  depuis les assets du site vitrine. **Aucun changement de logique** (`tournoi.js` intact).

### Admin équipes : renommer + supprimer une catégorie entière — 2026-07-14
- **Renommer une équipe** sans la supprimer : bouton **« Modifier »** par équipe → champ d'édition
  en ligne (Entrée = enregistrer, Échap = annuler ; nom mis en MAJUSCULES). Nouvelle action backend
  `modifierEquipe` (met à jour la colonne `nom_equipe`).
- **« Tout supprimer »** en tête de chaque catégorie : efface toutes ses équipes d'un coup
  (confirmation demandée). Nouvelle action backend `supprimerEquipesCategorie`.
- ⚠️ Nécessite de **recopier `backend/Code.gs`** dans Apps Script puis de **redéployer** (Gérer les
  déploiements → crayon → Nouvelle version) pour que les deux nouvelles actions soient disponibles.

### Mise en ligne + publication du tournoi + intégration au site vitrine — 2026-07-14
- **Hébergement GitHub Pages** : le dossier `frontend/` est publié via `.github/workflows/pages.yml`
  (Settings → Pages → Source : GitHub Actions). URLs séparées : `…/tournoi.html` (public),
  `…/admin.html` (organisateurs), `…/saisie.html`, `…/perfs.html`. `frontend/index.html` redirige la racine.
- **Publication du tournoi** : action backend `publierTournoi` + param `tournoi_publie`. La page publique
  reste un écran « à venir » tant que le tournoi n'est pas publié (`appliquerPublication` + fix CSS
  `[hidden]{display:none !important}`).
- **Infos + affiche du tournoi** : actions `enregistrerInfosTournoi` (nom/date/lieu/description) et
  `enregistrerAffiche` (image redimensionnée côté navigateur → **Google Drive**, `tournoi_affiche_id` ;
  autorisation Drive via `autoriserDrive()`). Le bouton « Générer le tournoi » enregistre tout PUIS publie.
- **Intégration boutique-r92** (dépôt séparé) : carte d'actu dynamique (nom + affiche) + **page d'article**
  `boutique-r92/tournoi.html` (titre, description, date, lieu, affiche) avec bouton « Voir le tournoi en
  direct », agenda **.ics à 2 rappels** (veille + 2 h) et itinéraire « On y va ». Affiche servie via
  `lh3.googleusercontent.com/d/{id}` (⚠️ `drive.google.com/thumbnail` bloque le hotlinking).
- Nettoyage : suppression du code mort (CSS `.etoile`/`.cl-live`/`.fav-bloc|nom|match` de l'ancien système favoris).

### Page publique unique + filtre catégorie — 2026-07-13
- **Fusion** des 3 anciennes pages visiteur (`live.html`, `planning.html`, `classement.html`,
  **supprimées** avec leurs JS) en **une seule page `tournoi.html`** (+ `js/tournoi.js`) à **2 onglets** :
  - **Mon équipe** (défaut) : matchs + 3 classements de l'équipe ;
  - **Classements** : « Derniers scores » du tournoi en tête, puis poules du matin + niveaux croisés.
- **Filtre catégorie** global au-dessus des onglets : restreint équipes ET classements à la catégorie
  choisie ; **auto-masqué** s'il n'y a qu'une catégorie ; tri numérique (U8 < U10 < U12). « Derniers
  scores » reste global.
- **Favoris ⭐ retirés** (redondants avec « Mon équipe »). Un seul appel `getAll` + rafraîchissement 60 s.

### Perfs Racing — page interne — 2026-07-13
- Nouvelle page **`perfs.html`** (+ `js/perfs.js`), **non liée** dans le menu (accès par l'URL), lecture seule.
- 2 onglets : **Ce tournoi** (bilan + frise horaire par catégorie, via `getAll`) et **Saison** (cumul
  des rencontres par adversaire, via `getHistorique`). Repère les équipes du club par mot-clé (`racing`).

### Historique de saison (backend) — 2026-07-13
- Nouvel onglet **`Historique`** du Sheet, **jamais effacé** par une génération, alimenté
  **automatiquement** à chaque score validé (`archiverResultat` ; clé `tournoi_id`+`id_match` → une
  correction met à jour la même ligne ; stocke les **noms** d'équipe, stables d'un tournoi à l'autre).
- Nouvelle action de lecture `getHistorique`. Onglet + `tournoi_id` créés automatiquement.

### Nombre de poules Auto/forcé — 2026-07-13
- Le réglage catégorie `taille_poule_cible` est remplacé par **`nb_poules`** : vide = **Auto**
  (~4 équipes/poule), un entier = **forcé** (borné au nombre d'équipes). Colonne migrée automatiquement.
- **Assistant d'arbitrage étendu** : se déclenche aussi si un forçage rallonge la journée par rapport au
  mode Auto (pistes « X poules » et « revenir en Auto »).

> ✅ **Backend redéployé** : les évolutions ci-dessus (et celles marquées « backend à redéployer »
> plus bas) sont **en ligne et vérifiées** (l'API répond à `getHistorique`, `nb_poules`/`tournoi_id`
> présents dans la config). Reste l'**hébergement du frontend** et l'**URL HelloAsso**.

### Poules : deux équipes d'un même club séparées — 2026-07-13
- Nouvelle règle à la génération des poules du matin : **deux équipes d'un même club ne sont pas
  dans la même poule de départ** (ex. « RACING 92-1 » et « RACING 92-2 »).
- **Convention de nommage** : pour engager plusieurs équipes d'un club, suffixer par un
  **séparateur + numéro** : `CLUB-1`, `CLUB-2` (tiret), ou `CLUB/2`. Le club est le nom sans ce
  suffixe. ⚠️ Les chiffres **collés au nom** (ex. « RACING 92 ») ne sont PAS un suffixe et restent
  dans le nom du club — utiliser le tiret pour distinguer les équipes.
- `Code.gs` : helper `clubDe()` (retire un suffixe `-\d` final) + attribution repensée : on place
  les clubs les plus nombreux d'abord (les plus contraints), chaque équipe dans la poule la moins
  remplie sans équipe du même club → **contrainte respectée ET poules équilibrées**.
- Avertissement si un club a plus d'équipes que de poules (séparation alors impossible à 100 %).
- Validé en Node (500 tirages : 0 conflit, 0 déséquilibre pour des cas réalistes). ⚠️ **Backend à redéployer**.

### Admin : heure de fin = fin du TOURNOI (après-midi inclus) — 2026-07-13
- Avant, la génération du matin n'affichait que la **fin des poules du matin**. Or le planning de
  l'après-midi ne dépend que de la **structure** (nombre de matchs du croisé, déterminé par les
  poules) + des réglages + de la reprise après déjeuner — donc calculable dès le matin, sans
  connaître les équipes de l'après-midi.
- `Code.gs` : nouvelle fonction `projeterFinApresMidi` (simule l'après-midi avec des équipes
  fictives) + `finJourneeProjetee`. `genererPoulesEtPlanning` calcule et renvoie
  `heure_fin_matin`, `heure_fin_apresmidi` et `heure_fin_projetee` (= **fin du tournoi**) ; en mode
  auto, c'est cette fin de journée qui est écrite dans `heure_fin`. L'assistant d'arbitrage raisonne
  désormais sur la **journée complète**.
- `admin.js` : le message de génération affiche « 🌅 Fin du matin » **et** « 🏁 Fin estimée du
  tournoi (après-midi inclus) ».
- Validé en Node : la fin d'après-midi **projetée** (équipes fictives) est **identique** à la fin
  **réelle** (vraies équipes). ⚠️ **Backend à redéployer**.

### Mon planning : rafraîchissement automatique — 2026-07-13
- `planning.html` se **rafraîchit tout seul** (toutes les 60 s) + bouton « Rafraîchir » + « Mis à
  jour à HH:MM ». Ainsi, les **matchs d'après-midi générés en cours de journée apparaissent sans
  rechargement** (idem mises à jour de scores). Re-render **uniquement si les données ont changé**
  (signature), pour ne pas faire « sauter » la page, et l'**équipe sélectionnée est préservée**.

### Mon planning : classements en direct — 2026-07-13
- Sous les matchs de l'équipe choisie, `planning.html` affiche 3 classements (calculés côté
  navigateur, même barème) : **sa poule du matin**, **son niveau d'après-midi** (N1-N4), et le
  **classement général du tournoi** — l'équipe sélectionnée est **surlignée** partout.
- **Classement général = croisé final** : le Niveau 1 donne les places 1-3, le Niveau 2 les 4-6,
  etc. ; dans chaque niveau, ordre selon les matchs d'après-midi, puis départage « instant T » par
  le matin. Avant la génération de l'après-midi, il se replie sur un classement au points du matin.
- Logique du croisé validée en Node (blocs N1-N4 aux bonnes places, vainqueur de niveau en tête).

### Noms de clubs en majuscules — 2026-07-13
- À l'ajout d'une équipe (admin), le nom est **mis en majuscules** (`toUpperCase` dans
  `onAjouterEquipe`) → stocké et affiché en majuscules partout. Champ de saisie en
  `text-transform: uppercase` pour le retour visuel pendant la frappe.

### Sécurité : « connexion » à la page (clé demandée une seule fois) — 2026-07-13
- Avant, la clé était demandée à la première écriture puis à chaque tentative refusée (agaçant).
  Désormais : **une « connexion » à l'ouverture** de `admin.html` et `saisie.html` demande la clé
  **une fois**, la **valide** immédiatement, puis toutes les écritures passent en silence.
- **Stockage en session** (`sessionStorage`, plus `localStorage`) : la clé est oubliée à la fermeture
  de l'onglet → vraie « connexion » redemandée à chaque nouvelle session (mais silencieuse pendant
  qu'on travaille, reload compris).
- **Correction d'un score définitif** : le bouton « Corriger » **redemande la clé scores**
  (confirmation forte via `demanderCleValide`) avant de déverrouiller — en plus de la connexion.
- `api.js` : `connexion(role, libelle)` (boucle jusqu'à une clé valide, ne mémorise que si valide) +
  `cleValide(role, cle)` qui **teste la clé sans rien modifier** (sonde : action d'écriture avec un
  id bidon → « introuvable » si la clé est bonne, « Clé incorrecte » sinon). Frontend-only, **aucun
  redéploiement**.
- `admin.js` / `saisie.js` : appellent `connexion(...)` au chargement.
- **Fix encodage** : la détection du refus de clé matche des mots **ASCII** (`incorrecte`,
  `non configur`) car le « é » revient parfois mal encodé (« Cl√© incorrecte ») dans les messages.

### Sécurité écriture : 2 clés (admin / scores) — 2026-07-13
- Les actions d'**écriture** (`doPost`) exigent désormais une **clé**, vérifiée côté backend avant
  toute modification. Les **lectures** (`doGet`) restent ouvertes (public).
  - **Clé ADMIN** : génération poules/planning, génération après-midi, équipes, réglages.
  - **Clé SCORES** : saisie des scores (`enregistrerScore`).
- **Scores définitifs** : `enregistrerScore` refuse d'écraser un score déjà `terminé` sauf
  `modification: true`. Côté `saisie.html`, un score validé est **verrouillé** (champs grisés) ;
  le corriger = bouton « Corriger » → confirmation → « Valider la correction » (envoie modification).
- **Stockage des clés** : dans les Propriétés du script (jamais dans le code/GitHub), définies via
  la fonction `configurerCles()` à lancer une fois dans l'éditeur. Côté navigateur, la clé de chaque
  rôle est mémorisée (localStorage) et redemandée si le serveur la refuse.
- `Code.gs` : `verifierCle` / `lireCle` / `estTermineServeur` + contrôle d'accès en tête de `doPost`.
  `api.js` : `apiPostProtege` + gestion des clés locales. `admin.js` : écritures via `ecrireAdmin`.
- Validé en Node (statut NFC/NFD, mapping des clés) et en preview (verrouillage/correction, stockage
  des clés). ⚠️ **Backend à redéployer + lancer `configurerCles`** — voir `docs/deploiement.md`.

### Classement : groupes N1-N4 de l'après-midi — 2026-07-13
- La page **`classement.html`** affiche désormais **deux sections** : « 🌅 Poules (matin) » (A/B/C)
  et « 🏉 Après-midi — classement croisé par niveau » (N1-N4). Chaque niveau montre sa **composition**
  (dès la génération de l'après-midi) et son **classement** qui se remplit au fil des scores.
- Calcul **côté navigateur** depuis un seul `getAll` (même barème que le backend), avec les deux
  phases **comptées séparément** : le classement des poules ne compte que les matchs `phase=poule`,
  celui des niveaux que les matchs `phase=classement`. Corrige un mélange potentiel une fois les
  scores de l'après-midi saisis (même correctif appliqué au calcul de la page `live.html`).
- Vérifié en preview : compositions correctes (N1 = les 1ers de poule…), et le classement d'un
  niveau se met à jour correctement quand un score arrive (barème V=3/D=1, départage à la différence).
- Nouvelle page **`live.html`** + `js/live.js` (lecture seule) avec trois sections :
  **⭐ Mes favoris** (équipes suivies, mémorisées en localStorage — leurs matchs remontent en tête),
  **📣 Derniers scores** (matchs terminés, plus récents en premier, vainqueur en vert) et
  **🏆 Classements** par poule (réutilise `getClassement`), chaque équipe suivable via une étoile.
- **Rafraîchissement** automatique toutes les 60 s + bouton manuel + « Mis à jour à HH:MM ».
- **Bandeau de don HelloAsso** en placeholder (`href="#"`, `id="don-lien"`) — URL réelle à coller.
- Styles `.don-bandeau`, `.live-*`, `.etoile`, `.score-*`, `.fav-*`. Vérifiée en preview sur données
  live (favoris, tri des scores, étoiles cliquables, 0 erreur console).
- **Robustesse** : un seul appel réseau (`getAll`) ; le classement est **recalculé côté navigateur**
  (même barème que le backend) au lieu d'un 2ᵉ appel `getClassement` en parallèle qu'Apps Script
  gérait mal (page bloquée sur « Chargement… »). Rafraîchissement plus léger.
- **Alignement** : « Derniers scores » passé en grille scoreboard (`1fr auto 1fr`) — les scores
  s'alignent en colonne centrale au lieu de flotter selon la longueur des noms.
- **Alignement des classements** : les tableaux d'une poule à l'autre étaient décalés (chaque
  `<table>` se dimensionnait selon son contenu, ex. « aix en provence »). Passage en
  `table-layout: fixed` avec largeurs de colonnes fixes (classes `.cl-live` / `.cl-full`) sur les
  pages `live.html` **et** `classement.html` → colonnes alignées au pixel près.

### Page « Mon planning » (visiteur) — 2026-07-13
- Nouvelle page **`planning.html`** + `js/planning.js` : le visiteur choisit son équipe (menu
  groupé par catégorie) et voit **uniquement ses matchs**, séparés matin / après-midi, avec heure,
  terrain, adversaire et **résultat coloré** (Victoire vert / Défaite rouge / Nul) du point de vue
  de l'équipe. Dernier choix mémorisé (localStorage). Vérifiée en preview sur données live.
- **Fix affichage « terminé »** : le Sheet renvoie parfois le « é » en forme **décomposée** (NFD,
  8 caractères) — l'égalité stricte `=== 'terminé'` échouait, donc les matchs joués s'affichaient
  « à venir » et sans le badge « ✓ terminé ». Remplacé par un test robuste `estTermine()` (préfixe
  ASCII `termin`) dans `planning.js` et `saisie.js`.

### Session 13 (affichage) — 2026-07-13
- **Planning admin séparé matin / après-midi** : `afficherPlanning` scinde désormais chaque catégorie
  en deux tableaux — « 🌅 Matin — poules » (colonne *Poule* A/B/C) et « 🏉 Après-midi — classement
  croisé » (colonne *Niveau* N1-N4). Helper `tableMatchs()` + style `.planning-phase`.
- **Page de saisie séparée matin / après-midi** : `saisie.html` regroupe aussi les matchs en deux
  blocs (mêmes sous-titres). La méta d'une carte affiche « Poule A » (matin) ou « Niveau N1 » (après-midi).
- **Fix ids** : les matchs d'après-midi repartent de M019 à chaque régénération (max calculé sur le
  matin conservé) au lieu de grimper. Comportement de données inchangé.

### Session 13 — 2026-07-13 (phase après-midi : classement croisé)
- **Génération de l'après-midi** : nouvelle action d'écriture `genererApresMidi`. À partir du
  classement du matin, construit les matchs en **classement croisé** (les équipes de même rang de
  poule jouent ensemble, en round-robin par groupe — ex. U8 3 poules de 4 → 4 groupes de 3 → 12
  matchs), puis les **planifie** (terrains + horaires) à la reprise après la pause déjeuner via
  `planifierApresMidi()` (réutilise récup / battement / durées ; amorce les dispos depuis les fins
  de matchs du matin pour éviter tout empiètement).
- **Ajout, pas remplacement** : les matchs du matin (qui portent les scores) ne sont pas effacés ;
  re-générer ne remplace que les matchs `phase = classement`. Helpers `matchObjToRow()` / `ecrireMatchs()`.
- **Garde-fous** : refuse de générer si des matchs du matin ne sont pas `terminé` ; ignore (avec
  avertissement) une catégorie à une seule poule (pas de croisé possible).
- **Schéma** : nouvelle colonne `phase` (`poule` / `classement`) en dernière colonne de l'onglet
  `Matchs`, **créée automatiquement** (`assurerColonnePhase`) à la première génération — aucune manip
  manuelle, il suffit de redéployer le backend.
- **Frontend** : bouton « 🏉 Générer l'après-midi » dans `admin.html` + handler `onGenererApresMidi`
  (confirmation, résumé, avertissements, rechargement du planning).
- Logique validée hors-ligne (Node) : croisé correct (N1 = les 1ers), **0 conflit terrain/équipe**,
  reprise après déjeuner, chaque équipe joue 2 matchs. Bouton vérifié en preview. ⚠️ backend à redéployer.

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
