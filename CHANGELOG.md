# Journal des évolutions

Toutes les étapes significatives du projet sont notées ici, de la plus récente à la plus ancienne.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/).

## [Non publié]

### Email d'invitation assorti à la vitrine + bouton de réponse sur la page — 2026-08-02
L'email d'invitation (Phase 1) reprend l'identité de la vitrine refondue : **blason centré**
(nouveau `img/blason-racing92.png` — les clients mail n'affichent pas le SVG), surtitre « a le
plaisir de vous inviter », grand titre, **date · lieu**, affiche centrée plus grande, « **La
journée en un coup d'œil** » (accueil → coup d'envoi → pause méridienne → reprise → fin envisagée),
tableau des catégories **enrichi** (forme de jeu, temps de jeu — y compris Super Challenge 2×15 /
2×11, effectif, équipes par club). Le bouton « **Répondre à l'invitation** » reste l'action
centrale, suivi d'un lien « Voir l'invitation complète ».
**Nouveau jeton `{{LIEN_INVITATION}}`** : l'email pointe vers la page vitrine **personnalisée par
club** (`invitation-club.html?club=…&token=…`). La page reconnaît alors le club et affiche un
**vrai bouton « ✅ Répondre à l'invitation »** dans l'encart navy (relais des paramètres vers la
page de réponse — la validation du jeton reste côté backend). Visiteur anonyme : mention « lien
reçu par email », comme avant. `meta referrer no-referrer` posé sur les deux pages (le jeton de
l'URL ne fuit jamais vers les liens externes).
⚠️ **Ordre de mise en service : redéployer le backend AVANT tout nouvel envoi d'invitation**
(sinon le jeton `{{LIEN_INVITATION}}` partirait tel quel dans l'email). Tests : **488/488**.

### Invitation vitrine : le carton d'invitation fait enfin honneur au tournoi — 2026-08-02
La page d'invitation (Phase 1) était sobre au point d'être triste : petit blason dans un coin,
affiche timbre-poste, descriptif tronqué à 150 caractères, et 2 lignes par catégorie. Refonte
complète en **carton d'invitation** qui se lit de haut en bas :
1. **le blason du club en grand, centré** — c'est l'École de Rugby qui invite ;
2. **l'affiche du tournoi en héros**, puis le **descriptif complet** (un paragraphe par ligne saisie) ;
3. **la journée en un coup d'œil** : frise horaire accueil → coup d'envoi → pause méridienne →
   reprise → fin envisagée. La « fin envisagée » **ne s'affichait d'ailleurs jamais** : `heure_fin`
   ne sortait pas de la liste blanche publique — corrigé ;
4. **une carte détaillée par catégorie** : forme de jeu FFR retenue, temps de jeu (mi-temps ×
   durée + pause), récupération entre matchs, effectifs, équipes par club, arbitrage, lien
   règlement, format d'après-midi expliqué. Une catégorie U14 en **Super Challenge de France**
   affiche son badge, le jeu à XV et sa formule (P2 : plateau 2×15 ; P3 : samedi triangulaires,
   dimanche brassage) — miroir exact de la génération ;
5. les **repères FFR** (rappel sécurité effectif minimum, doctrine du format) conservés tels quels.
**Backend** : la vue publique `invitation` (liste blanche opt-in) s'ouvre aux **faits de format et
d'horaire** — jamais de donnée personnelle : le téléphone, l'adresse précise, parking et secours
restent derrière le jeton du dossier club. Un test dédié verrouille ces frontières.
**Partagé** : les résumés sportifs du dossier (`resumeMiTemps`, `resumeEffectif`…) déménagent dans
`commun-dossier.js` (écrits une fois, utilisés par le dossier ET l'invitation) ; au passage le
format **Poules de niveau** gagne son libellé (le dossier affichait « Classement croisé » à tort).
**Page de réponse assortie** : `reponse-invitation.html` (lien personnel avec jeton) reprend le
même en-tête vitrine (blason centré, grand titre, date · lieu, affiche compacte) — le formulaire
(oui/non, équipes par catégorie, joueurs + éducateurs par équipe, totaux vivants) est inchangé.
L'encart « Votre réponse » de la vitrine guide vers ce lien personnel reçu par email.
**Revue multi-agents (4 lentilles + contre-vérification)**, corrections retenues : l'intro et la
frise ne prêtent plus le déroulé « poules + après-midi » au Super Challenge (formule propre, cartes
fidèles) ; la description « Poules de niveau » ne promet plus « 4-5 équipes » (la génération peut
produire des poules de 3) ; les liens Instagram/site n'acceptent que le schéma http(s).
Vérifié au navigateur (fixture riche + fixture minimale : règle d'or respectée), en mobile et à
l'export PDF (4 pages équilibrées). **Backend à redéployer** ; tests : **479/479**.

### Verrou : la cause enfin trouvée — le select « forme de jeu » injecté trop tard — 2026-08-02
Le blocage qui obligeait à **ré-enregistrer les catégories** pour rouvrir les étapes suivantes est
identifié et corrigé.
**Ce qui se passait.** La carte de chaque catégorie contient un select « Forme de jeu retenue »,
qui n'est **rempli qu'une fois le référentiel FFR chargé depuis le serveur** — donc *après* que
l'assistant a pris sa « photo » de référence du formulaire. Ce champ arrivait ensuite avec sa
valeur enregistrée : la carte paraissait **modifiée** alors que personne n'y avait touché. Le
verrou grisait donc Équipes, Terrains, Poules & planning, Publication et Après-midi — et
ré-enregistrer les catégories reprenait une photo à jour, ce qui débloquait tout. D'où le
contournement quotidien, et la persistance après rechargement.
**Le correctif.** Les cartes qui étaient **propres** avant ce rendu différé voient leur photo
reprise juste après : les champs ajoutés par l'application font désormais partie de l'état
« enregistré ». Une carte où une **vraie saisie** est en cours n'est pas re-photographiée : son
avertissement, lui, reste — le garde-fou contre la perte de données est intact.
**100 % front**, aucun redéploiement backend.

### Terrains : une seule table de marque par grand terrain — 2026-08-02
Jusqu'ici, un grand terrain accueillant deux catégories (par exemple de l'U8 **et** de l'U10)
recevait **deux** tables de marque — une par catégorie. La mesure limitait les erreurs de saisie,
mais demandait **trop de bénévoles** pour être tenable.
Désormais : **une seule table par grand terrain**, quel que soit le nombre de catégories qui s'y
partagent la place. Elle appartient au **terrain** (et non plus à une catégorie) et se pose dans
l'espace libre le plus proche du **centre de gravité de tous les mini-terrains** qu'elle couvre —
donc au plus près de ce qu'elle surveille. Un terrain occupé en entier (U14) garde la sienne sur
la ligne de touche. Le placement manuel en tient compte : un mini-terrain ne peut pas se poser sur
la table. **100 % front**, aucun redéploiement backend.

### Verrou de la barre latérale : les étapes optionnelles ne bloquent plus le parcours — 2026-08-02
Analyse complète du système de verrouillage, à la suite d'un blocage persistant. **Deux défauts**
trouvés, indépendants du crayon des équipes (corrigé précédemment) :

**1. Une étape « libre » gelait quand même la suite.** Cinq écrans sont déclarés *libres* —
« Inviter un club », « Dossier complet », « Demande d'autorisation », « Feuille de journée »,
« Réinitialiser » — c'est-à-dire préparables à tout moment et **jamais verrouillés**. Mais le calcul
des verrous les traversait quand même : une simple retouche non enregistrée dans « Inviter un club »
(date limite, modalités, texte « Sur place »…) **bloquait Équipes, Terrains, Poules & planning,
Publication et Après-midi**. Le chemin principal était donc gelé par une étape explicitement
facultative — et le blocage survivait au rechargement, puisque la retouche restait en place. Un
écran libre ne propage désormais plus aucun blocage. Les écrans **non libres** protègent toujours
autant : une modification non enregistrée y bloque bien la suite.

**2. L'application ne disait pas ce qui bloquait.** Cliquer un onglet grisé faisait seulement
**trembler** l'onglet ; la raison n'existait que dans une infobulle au survol, que personne ne
pense à chercher. Elle s'affiche maintenant **en clair, en haut de la barre latérale** (« Pour
ouvrir cette étape, termine d'abord : … »), et s'efface d'elle-même. Le verrou devient
auto-explicatif : plus besoin de deviner quel formulaire enregistrer.
**100 % front**, aucun redéploiement backend.

### Feuille de fin de journée : bilan chronologique, PDF et envoi aux clubs — 2026-08-02
Nouvel item **« Feuille de journée »**, placé **après « Après-midi »** dans la barre latérale :
- **tous les matchs de la journée dans l'ordre chronologique** (heure de début, puis terrain, puis
  catégorie), avec leur **score**, la catégorie, le terrain et le moment (matin / après-midi) ;
- **rien n'est inventé** : un match sans score affiche « — » (jamais 0 – 0, qui serait un résultat
  faux) et un match sans heure lisible est rangé **en fin** de liste plutôt qu'en tête ;
- un **compteur** rappelle combien de matchs ont un score et combien restent en attente ;
- **📄 Télécharger le PDF** — document créé de zéro avec `pdf-lib`, **100 % navigateur, sans
  backend** : titre, bilan, tableau paginé (l'en-tête se répète à chaque page), valeurs trop
  longues tronquées proprement. Nom de fichier daté ;
- **✉️ Envoyer aux clubs** — envoi de la feuille (email HTML + version texte de repli) aux clubs
  **acceptés**, sur **l'adresse qui a servi à les inviter**. Confirmation préalable listant les
  destinataires, les clubs **sans adresse** (non contactés) et le nombre de matchs encore sans
  score. Chaque club est traité individuellement : l'échec de l'un n'annule pas les autres, et les
  échecs sont **affichés**, jamais silencieux.
Backend : nouvelle action protégée `envoyerFeuilleJour` (réutilise l'envoi d'email existant).
**Redéploiement backend nécessaire.**

### Terrains : placement manuel au point exact, orientation au choix, tables en dernier — 2026-08-02
Le placement manuel cherchait « la meilleure place libre » près du point lâché : le mini-terrain
partait ailleurs que là où on le posait, et certaines configurations pourtant produites
automatiquement étaient **impossibles à refaire à la main**. Désormais :
- **position exacte** — le mini-terrain se pose **centré sur le point où tu le lâches**, sans
  aucune recherche ni recalage (il est seulement ramené dans le grand terrain s'il dépasse) ;
- **aperçu à l'échelle pendant le glisser** — un rectangle montre l'emplacement réel, **vert**
  s'il est tenable, **rouge** sinon, avec la raison (hors terrain, ou couloir de circulation non
  respecté). On voit le résultat **avant** de lâcher ;
- **orientation au choix** — bouton **⟳** sur la pastille ou touche **R** pendant le glisser pour
  poser en largeur plutôt qu'en longueur. L'orientation d'un terrain remis de côté est conservée ;
- **refus explicite, jamais de déplacement** — un emplacement impossible est refusé avec sa
  raison, et la pastille reste de côté : l'application ne décide plus à ta place ;
- **tables de marque en dernier** — elles ne sont plus posées pendant les déplacements (elles
  occupaient de la place et bloquaient des positions valides). Nouveau bouton **« 📍 Valider le
  placement »** : il les pose d'un coup, au plus près des terrains de chaque catégorie, puis
  « Appliquer aux catégories » apparaît. Tout déplacement ultérieur les retire à nouveau.
Les deux seules règles conservées restent physiques : tenir dans le grand terrain et respecter le
couloir de circulation. **100 % front**, aucun redéploiement backend.

**Un terrain laissé de côté est un choix, pas une anomalie.** Mettre un mini-terrain de côté peut
simplement vouloir dire « je ne veux pas l'utiliser » : la validation **ne bloque plus** et
l'attribution aux catégories reste possible avec un ou plusieurs terrains inutilisés. Les messages
l'énoncent sans alarme (mini-terrains de côté, grands terrains non utilisés) et rappellent que
**moins de terrains = journée plus longue** — l'**arbitrage des horaires** vérifie l'heure de fin à
la génération du planning et propose ses pistes si elle est dépassée. Garde-fou ajouté : une
catégorie dont **tous** les terrains ont été mis de côté est signalée, et son réglage « Terrains »
actuel est **conservé** (rien n'est effacé en silence).

### Correctif : ouvrir le crayon d'une équipe ne verrouille plus la barre latérale — 2026-08-02
Cliquer sur le crayon ✏️ d'une équipe **grisait aussitôt les étapes suivantes** de la barre
latérale (Terrains, Poules & planning, Publication, Après-midi) — **même sans rien modifier**,
et il fallait « Enregistrer » ou « Annuler » pour y revenir.
Cause : le détecteur de « modifications non enregistrées » se déclenchait sur la simple
**présence** du champ d'édition à l'écran, pas sur un changement réel.
Il compare désormais les **valeurs** (nom, joueurs, éducateurs) à celles enregistrées, comme le
fait déjà le reste de l'application pour les formulaires :
- **ouvrir le crayon pour regarder ne verrouille plus rien** ;
- dès qu'une valeur change **réellement**, le verrou revient (le garde-fou contre la perte de
  saisie est intact) — et il **repart** si tu remets la valeur d'origine, si tu enregistres ou
  si tu annules ;
- retaper le même nom en minuscules ne compte pas comme une modification (il est enregistré en
  MAJUSCULES), et une équipe d'un Sheet ancien (colonnes d'effectifs absentes) ne déclenche
  aucun faux positif ;
- le formulaire d'**ajout** garde sa règle inchangée : un nom saisi bloque toujours, pour ne
  jamais perdre une équipe en cours de saisie.
Vérifié sur la vraie barre latérale (mode écrans) : 0 onglet verrouillé crayon ouvert, verrou
correct après une modification, levé après annulation. **100 % front**, aucun redéploiement backend.

### Correctif de style : champs « Joueurs » / « Éducs » alignés sur le reste — 2026-08-02
Les deux champs d'effectifs (carte **Équipes** et édition au crayon ✏️) n'avaient pas la même
allure que les autres champs : angles moins arrondis, autre police, autre bordure, hauteur
différente. Cause : les règles de champs listaient `input[type="text"]`, `input[type="email"]`
et `select` **mais pas** `input[type="number"]` — dans `styles.css` **et** dans `theme-r92.css`
(la feuille de thème, chargée après, qui a le dernier mot). Les champs nombre ne recevaient donc
aucun style de formulaire.
Corrigé **à la source** plutôt qu'en empilant des exceptions : `input[type="number"]` et les deux
champs d'édition rejoignent les listes existantes, et la boîte des champs d'édition en ligne
(nom + effectifs) est désormais définie **une seule fois** au lieu d'être dupliquée. Le `!important`
introduit avec la fonctionnalité disparaît. Ajout d'un `min-width: 0` sans lequel la largeur
intrinsèque d'un champ `number` (~187 px) écrasait la largeur courte voulue (96 px).
Vérifié au pixel en thème clair **et** sombre : mêmes hauteur, marges intérieures, arrondi,
bordure, fond et police que le champ « Nom de l'équipe ». Aucun changement de comportement.

### Équipes : joueurs et éducateurs déclarés par équipe → demande d'autorisation — 2026-08-01
À l'**ajout d'une équipe** comme au **crayon ✏️ de modification**, deux champs facultatifs
s'ajoutent : **« Joueurs »** et **« Éducs »** (nombre d'éducateurs accompagnant cette équipe).
Deux nouvelles colonnes `nb_joueurs` / `nb_educateurs` dans l'onglet Equipes (migration douce :
elles se créent toutes seules, les équipes existantes restent intactes).
- **repris automatiquement par la demande d'autorisation** : les joueurs alimentent **A.4 —
  Nombre de participants**, les éducateurs le total **B.3 — Nombre d'éducateurs**, avec une
  origine détaillée (« 30 déclarés par les clubs invités + 20 déclarés sur les équipes saisies
  à la main ») ;
- **anti-double-compte** : une équipe créée par une **réponse d'invitation** (`source` = auto)
  est déjà couverte par les totaux de son club — elle n'est **jamais** recomptée ici, et le
  crayon le dit explicitement. Les équipes sans `source` (antérieures à la colonne) sont
  traitées comme manuelles, le cas prudent ;
- **« vide » ≠ « zéro »** : un champ laissé vide signifie « non déclaré » (jamais transformé en
  0, ce qui déclarerait « aucun joueur ») ; un `0` saisi est une **réponse**. Vider un champ au
  crayon **efface** bien la valeur enregistrée ;
- **déclaration partielle signalée** : si certaines équipes portent leur effectif et d'autres
  non, la feuille le dit en orange (le total est incomplet) plutôt que de compléter au jugé ;
- **PDF pré-rempli** : même règle exactement.
Tests backend : **470/470** (+13 tests session 27, dont l'anti-double-compte).

### Demande d'autorisation : total des éducateurs (B.3) = clubs + club organisateur — 2026-08-01
**Défaut corrigé** : un total d'éducateurs saisi à la main **masquait** les éducateurs déclarés par
les clubs à la réponse d'invitation (24 saisi cachait 7 déclarés, sans rien signaler) — et cette
priorité était **l'inverse** de celle des participants et du type de terrain, où le déclaré prime.
Le total est désormais une **cascade additive**, parce que les deux sources couvrent des personnes
différentes : **éducateurs déclarés par les clubs acceptés + encadrants du club organisateur**
(nouveau champ `org_nb_educateurs_club` — le Racing ne s'invite pas lui-même, ses éducateurs ne
figurent donc dans aucune réponse, d'où le total faux jusqu'ici).
- **feuille de report** — B.3 affiche le total **calculé** avec le détail de son origine
  (« 7 déclarés par les clubs acceptés + 17 du club organisateur ») ;
- **migration douce** — un ancien total manuel devenu inutile n'est **jamais écrasé en silence** :
  il est **signalé en orange** (état informatif, hors compteur de manquants) avec la marche à
  suivre. Aucune soustraction, aucune redistribution : la part du club n'est jamais devinée ;
- **replis** — aucune source structurelle ⇒ l'ancien total manuel reste utilisé ; rien nulle part
  ⇒ « manquant ». Un `0` au club organisateur est une **réponse**, pas une absence de réponse ;
- **PDF pré-rempli** — même règle exactement (champ « Nombre d'éducateurs »).
Tests backend : **450/450** (+9 tests session 26 ; 2 tests de la session 23 réécrits, la règle de
priorité qu'ils figeaient ayant été volontairement changée).

### Terrains : ajustement manuel de la répartition par glisser-déposer — 2026-08-01
Sur la carte de **prévisualisation** de la répartition (avant « Appliquer ») :
- **clic sur un mini-terrain** → il est **mis de côté** (pastille colorée sous la carte) ;
- **glisser la pastille** sur le grand terrain voulu → le mini-terrain y est posé **au plus près
  du point lâché**, en respectant les **dimensions de la catégorie** et le **couloir de
  circulation** (mêmes règles que le calcul automatique, tables des marques comprises) ; s'il
  n'y a pas la place, le dépôt est **refusé avec un message** explicite (rien n'est perdu, la
  pastille reste de côté) ;
- les **numéros sont recalculés** après chaque geste (séquence 1, 2, 3… dans l'ordre des grands
  terrains) : la numérotation reste cohérente pour la table des marques ;
- une catégorie « terrain entier » (U14) ne se dépose que sur un grand terrain **vide** ; déposer
  une catégorie sur le terrain d'une autre **partage** le terrain (table des marques scindée,
  comme le mixage automatique) ; les grands terrains déclarés non utilisés apparaissent **vides**
  sur la carte pour servir de cibles ;
- « Appliquer aux catégories » **avertit** si des mini-terrains sont encore mis de côté (ils ne
  seraient pas appliqués) ; « Répartir les terrains » recalcule tout et annule les ajustements.
Souris **et** tactile (pointer events). 100 % front — **aucun redéploiement backend**.

### Terrains : nature du terrain (surface de jeu) reprise dans la demande d'autorisation — 2026-08-01
Chaque **grand terrain** de la carte « Terrains & répartition » porte désormais sa **nature**
(Synthétique, Gazon, Neige, Argile, Sable — mêmes libellés que le formulaire officiel), via un
menu déroulant placé entre le nom du terrain et le menu Rugby/Foot. La nature déclarée est
**reprise automatiquement** dans la demande d'autorisation :
- **feuille de report** — le champ « Type de terrain » (B.1) devient **calculé** à partir des
  natures déclarées (distinctes, dédupliquées ; les terrains sans nature sont signalés dans
  l'origine) ; repli sur la saisie manuelle `org_type_terrain`, sinon manquant — jamais deviné ;
- **carte de saisie** — la question « Type de terrain » n'est **plus posée** quand l'app y répond
  déjà (même mécanisme que le nombre de participants) ; une valeur déjà saisie reste affichée ;
- **PDF pré-rempli** — les cases « Type de terrain » sont cochées d'après les natures déclarées
  (**plusieurs natures ⇒ plusieurs cases**), repli sur la saisie manuelle.
Migration douce : les terrains enregistrés sans nature affichent « — Nature — » et ne changent
rien tant que la nature n'est pas choisie. Tests backend : **428/428** (+6 tests session 25).

### Demande d'autorisation : télécharger le formulaire officiel FFR pré-rempli (PDF) — 2026-07-31
Nouveau bouton **« Télécharger le formulaire pré-rempli (PDF) »** dans l'item Demande d'autorisation :
il génère le **formulaire officiel FFR** (AcroForm) **pré-rempli** avec ce que l'app connaît, et qui
**reste modifiable** (l'organisateur l'ouvre et complète le format sportif par catégorie + les
signatures). Remplissage **100 % côté navigateur** (lib `pdf-lib` vendorisée, sans build) — **aucun
backend**. ~24 champs texte + cases pré-remplis : organisateur (club, code, représentant, président,
tél/mail), label EDR, tournoi (nom, adresse, date, heures), niveau, participants (nb équipes),
installations (type de terrain, vestiaires), arbitrage, sécurité (responsable, médecin, antenne de
secours, ambulance), logistique (droits/hébergement/repas/goûters + montants), **récompenses par
catégorie**. Le **format sportif détaillé par catégorie** (nb matchs/durée par phase) et les
**signatures** restent à compléter à la main. Correspondance champ PDF ↔ donnée **vérifiée par la
position de chaque champ face à son libellé** dans le PDF officiel + test end-to-end (24 textes /
10 cases relus). Modèle : `frontend/modeles/demande-autorisation-ffr.pdf`.
Ajouts après 1er retour : **taille de police fixée à 9 pt** ; **tableau « Catégories et formes de jeu »
(page 2) coché automatiquement** d'après la forme de jeu retenue de chaque catégorie présente
(`Config.forme_jeu`) — mapping des cases vérifié par le libellé à droite de chacune.
**Mode HYBRIDE (2ᵉ retour)** : les champs que l'app remplit sont désormais **gravés en texte / « X »
statique** sur la page puis **retirés du formulaire** (plus de rectangle bleu de champ, plus de
surbrillance, plus de chevauchement) ; les champs non remplis (format sportif, signatures) **restent
des champs éditables**. « Heure de début » n'est plus remplie (sa case du formulaire officiel est
dessinée par-dessus le libellé « Niveau du tournoi » → chevauchement inévitable). Rendu vérifié page
par page (texte propre + cases « X » nettes).

### Demande d'autorisation : grisage conditionnel + pré-remplissage du tarif — 2026-07-31
Deux améliorations de la demande d'autorisation :
1. **Grisage conditionnel** — un champ ouvert lié à une question Oui/Non (Médecin → nom/tél, Repas →
   fournisseur/prix, Hébergement → structure, Goûters → fournisseur/prix, École labellisée → date,
   Équipes étrangères → liste, Droits → montant) est **grisé et non éditable** quand la réponse est
   « non ». Bascule en direct au changement de réponse ; valeur stockée conservée. Déclaré par `dep`.
2. **Pré-remplissage du tarif** — les champs « Droits d'inscription » (oui/non + montant) reprennent,
   **s'ils sont vides**, le **tarif d'engagement** saisi dans « Modalités d'inscription » (le montant,
   texte libre, est réduit à son 1ᵉʳ nombre car le champ autorisation est numérique). Jamais
   d'écrasement d'une valeur déjà saisie ; une note « ↩ repris des modalités » le signale, et le
   grisage reste cohérent avec la valeur effective. **Front seul, aucun redéploiement backend.**

### Réorganisation de la carte « Horaires » — 2026-07-31
Réordonnancement des champs de la carte Horaires pour placer **« Heure de fin communiquée aux clubs »
en dernier** (elle résume les réglages du dessus). Nouvel ordre : heure de début → RDV → heure de fin →
**battement terrain** → **pause déjeuner (échelonnée / début / durée)** → **marge après le dernier
match** → heure de fin communiquée. Les renvois « ci-dessus / ci-dessous » des aides (marge ↔ heure
communiquée) sont ajustés à ce nouvel ordre. **Affichage seul — aucun changement de comportement, aucun
redéploiement backend.**

### Vocabulaire « période » + retrait du champ Règlement (carte catégorie) — 2026-07-31
Renommage des libellés de la carte catégorie pour coller au vocabulaire FFR (les clés Sheet
`format_mi_temps` / `duree_mi_temps_min` / `pause_mi_temps_min` restent **inchangées**) :
« Nb mi-temps » → **« Nombre de période »**, « Durée mi-temps » → **« Durée de la période »**,
« Pause mi-temps » → **« Pause entre deux périodes »** (alertes « hors cadre FFR » alignées aussi).
Le champ **« Règlement (texte ou lien) »** est **retiré de la carte** ; sa valeur stockée est
**PRÉSERVÉE** à l'enregistrement (sinon la réécriture de la ligne entière l'effacerait — leçon
session 3) et reste affichée dans le dossier club si elle était renseignée. **Front seul, aucun
redéploiement backend.**

### « Trouver une date compatible » — proposer les jours sans conflit FFR — 2026-07-31
Dans la carte **« Date & conformité FFR »**, un bouton **« 🔎 Trouver une date compatible… »** ouvre un
panneau : on choisit un **mois**, et l'app propose les **samedis, dimanches et mercredis** de ce mois
avec leur statut FFR — **compatible** (vert), **vigilance** (orange, alerte douce, applicable) ou
**conflit** (écarté). Un clic **« Appliquer »** pose la date sur le tournoi, l'enregistre et recalcule la
conformité. Backend : nouvelle action publique `datesCompatiblesFFR(mois, categories, zone)` qui réutilise
le moteur `evaluerConformiteFFR` jour par jour (helpers **purs** `jourSemaineFFR` — Sakamoto, sans objet
Date — et `nbJoursDansMoisFFR`). La règle 72 h est bien prise en compte (autour d'une date fédérale, les
jours à ± 3 j tombent en conflit). Tests **352/352** (+14 `testS17_*`). Vérifié au navigateur (panneau,
recherche, chips colorées, application d'une date). ⚠️ **Redéploiement backend nécessaire.**

### Nouvelle carte « Date & conformité FFR » — dissociée des infos du site — 2026-07-31
La **date prévue**, la **zone de vacances** et le bloc **conformité FFR** (conflits, points de
vigilance, prescriptions) quittent la carte « Infos du tournoi » pour une **carte dédiée placée tout en
haut** (`#bloc-cadre-tournoi`). But : séparer nettement la **planification/conformité** des **infos qui
alimentent le site** (nom, lieu, adresse, description, affiche). La nouvelle carte a son **propre bouton
« Enregistrer la date »** (sauvegarde partielle date + zone via `enregistrerInfosTournoi` — le backend
n'écrit que les champs envoyés, donc les infos du site ne sont pas touchées). `lireInfosTournoi` ne
renvoie plus que nom/lieu/adresse/description ; `dateTournoiCourante`/`zoneVacancesCourante`/
`majApercuTournoi` lisent la date/zone **par nom** (peu importe le formulaire). La publication continue
d'enregistrer date + infos « par sécurité » (payload fusionné). Nouvelle section enregistrée dans
`ecrans.js` + `assistant.js` (piège des sections admin). **Front seul, aucun redéploiement backend.**
Vérifié au navigateur (structure DOM, séparation des données, aperçu du site suivant la date).

### Fix — bouton « Appliquer la norme FFR » absent sur une catégorie fraîchement ajoutée — 2026-07-31
Après ajout (ou suppression) d'une catégorie, `rechargerReglages` re-rendait les cartes mais **ne
recalculait pas la conformité FFR** : `dernierResConformite` ne couvrait donc que les catégories
présentes AVANT l'ajout. Résultat : la nouvelle catégorie (ex. U8 ajoutée alors que U10 existait
déjà) n'avait aucune donnée FFR mémorisée → son bouton « Appliquer la norme FFR » restait caché.
Correctif : `rechargerReglages` appelle désormais `majConformiteFFR` en fin de rechargement (la liste
des catégories a pu changer) ; l'appel redondant dans `onClicAppliquerFFR` est retiré. Vérifié au
navigateur : bug reproduit puis corrigé (U8 obtient son bouton après recalcul). Front seul, **aucun
redéploiement backend nécessaire**.

### Norme FFR dans la carte catégorie — « Appliquer la norme FFR » + champs vierges — 2026-07-31
Une catégorie neuve est désormais créée **VIERGE** (nb mi-temps, durée, pause, récup entre matchs :
aucune valeur devinée ; le menu « Nb mi-temps » propose une option **« — »**). Chaque carte de
catégorie affiche, quand le référentiel FFR expose des valeurs pour le mois et qu'un champ est **vide
ou divergent**, un bouton **« Appliquer la norme FFR »** qui remplit d'un coup **nb mi-temps, durée,
pause, récup, effectif min et max** (réutilise le flux backend testé `appliquerValeursFFR` — source
unique, jamais de recalcul dupliqué). Nouveauté : l'**effectif min** est désormais rempli =
**joueurs sur le terrain** (`RefFFR_Regles.effectif_terrain`, ex. 5 pour du 5×5) et l'effectif max =
max feuille de match. Les champs restent **modifiables**, avec une **alerte inline « hors cadre FFR »**
en direct sur les 4 champs de temps (miroir de l'alerte effectif existante), non bloquante. Garde-fou :
la **génération se bloque** (avant toute écriture) si une catégorie à générer (≥ 3 équipes) a une
**durée de mi-temps vide/0**, avec un message qui renvoie vers le bouton — pour ne jamais produire de
matchs de 0 min. Doctrine §1.12 respectée : devant plusieurs formes non tranchées, le bouton renvoie
au choix de la **forme retenue** au lieu de deviner. **Nuance FFR importante** : les 4 durées de jeu
dépendent du **nombre d'équipes** (la norme FFR ne les fixe que pour **3 à 6 équipes engagées**) — sur
une catégorie encore vide ou de plus de 6 équipes, le bouton remplit les **effectifs** et signale par un
message actionnable que les **durées** se rempliront une fois 3–6 équipes engagées (ou à saisir à la
main). Comportement conforme à la règle (aucune interpolation), inchangé vs le bouton session 6 — seul
l'**effectif min** est nouveau. Tests **338/338** (+9) ; vérifié au navigateur (carte vierge, bouton,
application, alerte réactive, garde-fou). ⚠️ **Redéploiement backend nécessaire.**

### Pause échelonnée : réglage global + pause déjeuner « à partir de » — 2026-07-31
La pause méridienne échelonnée passe d'une option **par catégorie** à un **réglage GLOBAL** dans la
carte **Horaires de la journée** (case au-dessus de la pause déjeuner). Quand elle est cochée : la
**« Pause déjeuner — début »** devient **« Pause déjeuner à partir de »** (heure de départ de la pause
échelonnée, qui sert d'**ancre** : aucune équipe ne part en pause avant), le champ **durée** est masqué
(60 min garanti par équipe), et après « Générer les poules » l'app **affiche l'heure de fin de pause de
la dernière équipe** (les deux vagues se relaient — 2ᵉ vague en début d'après-midi). Backend :
`pause_echelonnee` devient un paramètre global lu par `calculerPlanning` ; `planifierCategorieEchelonnee`
prend `dejDebut` (l'ancre) et renvoie `finRepos` ; `genererPoulesEtPlanning` écrit `pause_echelonnee_fin`
dans Config. Le bloc par catégorie est retiré. Tests 329/329 (+4). ⚠️ **Redéploiement backend nécessaire.**

### Super Challenge — arbitrage désigné (l'équipe qui ne joue pas) — 2026-07-31
Sur chaque triangulaire/quadrangulaire, l'app **désigne l'équipe qui arbitre** le match (celle qui ne
joue pas) : triangulaire → la 3ᵉ équipe ; quadrangulaire → la table du règlement (M1→E1 … M4→E4,
chaque équipe arbitre une fois). Stocké dans la nouvelle colonne **`arbitre`** de l'onglet Matchs
(migration douce, col 27) et **affiché** sur les 3 écrans (admin, saisie, page publique) : « 🧑‍⚖️
Arbitre : … ». `matchObjToRow` délègue désormais à `matchObjToRowComplet` → les réécritures
préservent l'arbitre **et** le score détaillé (corrige au passage une perte latente du détail).
*(En Phase 3 officielle l'arbitrage est FFR ; la 3ᵉ équipe reste un repère pratique.)* Tests 325/325
(+7). ⚠️ **Redéploiement backend nécessaire.**

### Super Challenge — vocabulaire à l'affichage (Samedi/Dimanche, Triangulaire, Poule E/F/G) — 2026-07-31
Pour une catégorie en Super Challenge, les 3 écrans (admin, saisie, page publique) affichent désormais
le **bon vocabulaire** au lieu du générique « Matin — poules / Poule A » : en-têtes **📅 Samedi —
triangulaires** / **🏆 Dimanche — brassage** (Phase 3) ou **🏉 Plateau** (Phase 2) ; groupes
**Triangulaire / Quadrangulaire A** (selon 3 ou 4 équipes) ; brassage du dimanche en **Poule E/F/G**
(au lieu de Niveau N1/N2/N3). Helpers partagés dans `commun.js` (`ctxScf`, `phaseLabelScf`,
`groupeLabelScf`, `pouleEFG`, `tailleGroupeScf`) — **null hors SCF** → tournois ordinaires strictement
inchangés. `contexte_tournoi`/`scf_phase` ajoutés à la config publique `live` (non sensibles) pour que
saisie et page publique connaissent le contexte. Tests 318/318 (helpers d'affichage validés à part) ;
vérifié au navigateur sur les vrais fichiers (admin, saisie, public). ⚠️ **Redéploiement backend
nécessaire** (liste blanche `live`).

### Super Challenge — regroupement en triangulaires (correctif) — 2026-07-31
Le Super Challenge regroupait les équipes comme un tournoi ordinaire (≈ 4 par poule) → à 12 équipes,
on obtenait **3 quadrangulaires** au lieu des **4 triangulaires** attendues. Désormais le regroupement
**privilégie les triangulaires** (nouveau `nbGroupesScf` : multiple de 3 → que des triangulaires ;
reste 1/2 → une/deux quadrangulaire(s) d'appoint). La **Phase 3 se joue en triangulaires uniquement**
(règlement) : un groupe d'une autre taille (effectif non multiple de 3) déclenche un **avertissement**
clair. Le nombre de poules forcé à la main reste prioritaire. Message de génération corrigé (ne dit
plus « triangulaires » en dur). Tests 318/318 (+9). ⚠️ **Redéploiement backend nécessaire.**

### Pause échelonnée — support des effectifs impairs — 2026-07-31
La pause méridienne échelonnée exigeait un **effectif pair** (vagues égales) ; un effectif impair
retombait sur la pause classique. Désormais les **effectifs impairs sont pris en charge** : la
répartition V1×V2 passe par `tourneesBipartites`, qui gère les **vagues inégales via un « bye »** (une
équipe se repose la tournée où elle tombe en face du vide). Éligibilité assouplie à **≥ 4 équipes**
(pair ou impair) ; en dessous de 4, repli classique + avertissement inchangé. Les deux garanties
tiennent (vérifié 5→11 équipes) : **round-robin complet**, **repos ≥ 60 min**, **équité 0 violation**.
Tests 309/309 (+6, tests impairs). ⚠️ **Redéploiement backend nécessaire.**

### Pause méridienne échelonnée (option par catégorie) — 2026-07-31
Répond au cas « peu de terrains, la matinée ne rentre pas » : une **pause déjeuner unique** laisse
tous les terrains à l'arrêt. Nouvelle option **par catégorie** (case « Pause échelonnée ») : la
catégorie joue en **un round-robin planifié en deux vagues** — pendant qu'une moitié se repose
(**≥ 60 min garanti**), l'autre joue ses matchs internes, puis l'inverse ; les matchs inter-vagues
ne tombent jamais pendant une pause → **équité** garantie (jamais reposé contre épuisé). Éligible si
effectif **pair ≥ 4** (sinon repli automatique sur la pause classique + avertissement ; jamais de
blocage). Remplace, pour la catégorie, la pause globale et le format d'après-midi. Backend :
`planifierCategorieEchelonnee` (pure) + intégration `calculerPlanning` (une poule « A ») ; nouvelle
colonne Config `pause_echelonnee`. Front : bloc « Pause méridienne » dans la fiche catégorie. Doc :
[`docs/pause-echelonnee.md`](docs/pause-echelonnee.md). Tests 303/303 (+13, dont équité 0 violation et
intégration `calculerPlanning`). ⚠️ **Redéploiement backend nécessaire.**

### Super Challenge U14 — Phase 3 : brassage du dimanche (2ᵉ journée) — 2026-07-31
Complète la Phase 3 : après les triangulaires du **samedi** (générées comme la Phase 2, en 2×11),
un nouveau bouton **« Générer le dimanche (brassage) »** (page Poules & planning, révélé seulement si
une catégorie U14 est en Phase 3) crée la **2ᵉ journée par niveau** — les 1ᵉʳˢ de chaque poule
ensemble, les 2ᵉˢ ensemble, les 3ᵉˢ ensemble (poules E/F/G), chacun en round-robin, en **2×11**.
Action backend `genererDimancheScf` : garde-fous (catégorie Phase 3 présente, scores du samedi tous
saisis), **réutilise `fixturesApresMidiCroise`** (donc classement général + podium sans code dédié),
planifie au **début de la 2ᵉ journée** (`planifierApresMidi` gagne un paramètre de départ forcé +
applique le temps SCF), écrit en `phase = classement`, **idempotent** (régénérable si un score du
samedi change). Nouveau `matchObjToRowComplet` (préserve le score détaillé lors de la réécriture).
Le samedi = `phase = poule`, le dimanche = `phase = classement` (pas de colonne « jour » : dérivé de
la phase). Bouton piloté par `majDimancheScf` (visible/actif selon les scores du samedi). Tests
290/290 (+7). ⚠️ **Redéploiement backend nécessaire.** *(Arbitrage désigné : PR suivante.)*

### Super Challenge U14 — génération Phase 2 (triangulaire/quadrangulaire, 2×15) — 2026-07-31
Suite du contexte SCF (déclaratif) : « Générer les poules » **produit désormais le plateau** pour
une catégorie U14 en Super Challenge. Chaque groupe de **3 → triangulaire** (réutilise le
round-robin de 3 existant), chaque groupe de **4 → quadrangulaire** (fixture dédié `fixtureQuadrangulaireScf` :
4 matchs, 2 par équipe, réparti en 2 tournées — ≠ round-robin de 6). Le **temps de jeu est forcé**
par le règlement (`dureeMatchScf` : 2×15 en P2, 2×11 en P3) sans toucher aux réglages de mi-temps,
et les catégories SCF **n'ont pas d'après-midi** (sautées dans `genererApresMidi` et
`projeterFinApresMidi`). Regroupement = mécanisme de poules habituel ; taille ≠ 3/4 → avertissement.
**Phase 3 partielle** : la journée de triangulaires est générée en 2×11, mais la structure 2 journées
(brassage samedi→dimanche) n'est pas encore automatisée — un avertissement le signale (prochain
chantier). Note admin dépendante de la phase (P2 = « générée », P3 = « partielle »). Tests 283/283
(+16, dont intégration `calculerPlanning`). ⚠️ **Redéploiement backend nécessaire.**

### Contexte U14 « Super Challenge de France » (déclaratif) — 2026-07-31
La fiche d'une catégorie **U14** (et elle seule, au sens FFR M14) propose désormais un choix de
**contexte de tournoi** : **Tournoi ordinaire** (défaut, comportement inchangé) ou **Super Challenge
de France**. En contexte SCF, les cartes « format d'après-midi » sont **masquées** (sans objet) et un
panneau récapitule la structure **Jeu à XV (15×15)** selon la **phase** retenue — Phase 2 (1 journée,
triangulaire/quadrangulaire, **2×15**) ou Phase 3 & clôture (2 journées, triangulaire, **2×11**) —,
barème Victoire 3 / Nul 2 / Défaite 1. Deux nouvelles colonnes Config **`contexte_tournoi`** et
**`scf_phase`** (migration douce, vides = tournoi ordinaire = historique). Normaliseur **prudent par
construction** `contexteScfCategorie` (backend, miroir front `contexteTournoiDe`/`scfPhaseDe`) : `SCF`
seulement si la catégorie est U14 **et** la valeur vaut exactement `SCF` ; une valeur `SCF` posée sur
une autre catégorie est **ignorée**, jamais devinée. ⚠️ **Purement déclaratif** : la génération du
planning et l'application des temps du Super Challenge **ne consomment pas encore** ces colonnes
(prévu session 14). *(Le Jeu à 7 / Sevens U14 n'est volontairement pas couvert.)* Tests 267/267
(+12). ⚠️ **Redéploiement backend nécessaire** (nouvelles colonnes assurées par `assurerColonnesConfig`).

### Répartition des terrains plafonnée au nombre d'équipes — 2026-07-24
La répartition automatique remplissait chaque grand terrain de **tous** les mini-terrains qui y
tenaient géométriquement, sans tenir compte du nombre d'équipes : avec peu d'équipes, elle
proposait donc des terrains qui resteraient **vides** (une équipe ne joue jamais deux matchs à la
fois → au plus **floor(équipes / 2)** matchs en même temps). Désormais chaque catégorie est
**plafonnée à floor(équipes / 2) terrains** (ex. 10 équipes → 5 terrains max ; 4 → 2). Sans
équipes saisies (0), aucun plafond (repli sur le remplissage géométrique d'avant). Les grands
terrains devenus inutiles ne sont plus dessinés. **Frontend seul** (`admin-terrains.js`) — aucun
redéploiement nécessaire.

### Dossier final envoyé en email HTML (même charte que l'invitation) — 2026-07-24
Le bouton **« Générer le dossier final »** ouvre désormais un **aperçu HTML live** de l'email
(comme l'invitation Phase 1) au lieu d'un simple message texte : bandeau navy avec l'affiche,
titres de sections bleus, bouton **« Voir le dossier complet »**, et un récapitulatif condensé
(catégories engagées, modalités d'inscription, jour J, parking, encadrement & assurance, contact).
**L'objet et la phrase d'introduction restent modifiables** ; le reste des sections est généré à
partir des infos du tournoi. L'email part en **HTML + version texte de repli**, avec l'affiche en
image **inline** (`cid:affiche`). ⚠️ **Redéploiement de la Web App nécessaire** : l'action backend
`envoyerDossierEmail` accepte maintenant `html_modele` + `texte_modele` (repli sur l'ancien envoi
texte `corps` si seul celui-ci est fourni). Nouveau helper partagé `envoyerEmailHtml` (mutualisé
avec l'envoi d'invitation).

### Clubs invités : création des équipes déplacée sur « Enregistrer la sélection » — 2026-07-24
La **création automatique des équipes** engagées d'un club (source=auto) se déclenche désormais
au clic sur **« Enregistrer la sélection »** (catégories engagées) plutôt que sur « Générer le
dossier final ». « Générer le dossier final » ne fait plus **que** préparer/ouvrir l'email du
dossier. Le mécanisme reste **idempotent** (pas de doublon si on ré-enregistre) et remonte
toujours l'alerte d'écart en cas de réduction d'engagement. Frontend seul (l'action backend
`creerEquipesClub` est inchangée) — aucun redéploiement nécessaire.

### Sprint 6 (complément) — Création auto des équipes à l'envoi du dossier + édition des fiches — 2026-07-24
Deux points du cahier des charges Sprint 6 qui manquaient : la **création automatique des équipes**
au moment d'envoyer le dossier final, et l'**édition inline** des coordonnées d'un club. ⚠️
Redéploiement de la Web App nécessaire.

- **Création automatique des équipes** (point 5) : au clic sur **« Générer le dossier final »**
  (juste **avant** l'aperçu email), les équipes engagées par le club sont créées dans l'onglet
  `Equipes` — `{club}` si 1 équipe, `{club}-1`, `{club}-2`… si plusieurs — en respectant la **casse
  exacte** du nom du club. Nouvelle colonne `Equipes.source` (`auto` / `manuel`, vide = `manuel`).
  Backend : action `creerEquipesClub`, **idempotente** (un 2ᵉ clic ne crée aucun doublon,
  correspondance de nom `{club}`/`{club}-N`). Le nombre d'équipes par catégorie vient de la réponse
  du club (`nb_equipes_par_categorie`), 1 par défaut. Si l'engagement a été **réduit** depuis
  (moins d'équipes demandées que présentes), **rien n'est supprimé** : un message est posé dans la
  nouvelle colonne `ClubsInvites.alerte_ecart` et un **badge ⚠️ Écart** apparaît sur la fiche
  (détail au clic). La création n'a **jamais** lieu à la simple réponse du club.
- **Édition inline des fiches** (point 6e) : un bouton **crayon ✏️** sur chaque ligne bascule les
  champs **nom du club / prénom / nom / email du contact** en édition directe (boutons
  **Enregistrer** / **Annuler**). Backend : action `modifierClubInvite` (validation email + nom non
  vide, refus de doublon de nom). Le **statut**, la **réponse déjà donnée** et le **jeton** ne sont
  pas touchés ; si le club a déjà répondu, un **avertissement discret** le rappelle avant modification.
- **Nom de club en casse exacte** : le formulaire d'ajout ne force **plus** le nom en MAJUSCULES
  (il sert désormais à nommer les équipes créées automatiquement).
- **Migration douce** : `Equipes.source` et `ClubsInvites.alerte_ecart` sont ajoutées automatiquement
  à droite sur un Sheet déjà en service. Les équipes déjà présentes = `manuel`.

### Sprint 6 — Réponse en libre-service du club + tri dynamique de la liste — 2026-07-24
Le contact du club répond lui-même à l'invitation via un **lien personnel sécurisé par jeton**
reçu dans l'email : il accepte (catégories engagées + nombre d'équipes par catégorie + joueurs)
ou décline. La réponse remplit automatiquement la fiche du club dans l'admin. **L'envoi du dossier
complet reste toujours déclenché manuellement** par l'organisateur. ⚠️ Redéploiement de la Web App.

- **Onglet `ClubsInvites`** — 4 nouvelles colonnes : `club_token` (UUID généré à l'ajout, sécurise
  la page de réponse ; rétro-attribué aux clubs existants via `assurerTokensClubs`), `date_reponse`,
  `nb_equipes_par_categorie` (JSON `{"U8":2,…}`), `nb_joueurs_total`. Migration douce.
- **Email d'invitation** — nouveau bouton **« Répondre à l'invitation »** (lien personnel avec jeton,
  `{{LIEN_REPONSE}}` remplacé par club au moment de l'envoi), en plus du lien « version complète »
  vers `invitation-club.html`.
- **Nouvelle page publique `reponse-invitation.html`** — accessible uniquement avec `tournoi`, `club`
  et `token` valides (sinon « Lien invalide ou expiré »). Rappel du tournoi, deux boutons
  présent/absent, formulaire de participation (cases catégories + nombre d'équipes avec **validation
  en direct du maximum** `max_equipes_par_club` + nombre total de joueurs), messages de confirmation.
- **Backend** — `getReponseInvitation` (lecture doGet validée par le jeton, n'expose jamais l'email)
  et `repondreInvitation` (écriture doPost **sécurisée par le jeton, pas la clé admin** : valide les
  catégories, les maxima et le nombre de joueurs ; écrit statut/categories_engagees/
  nb_equipes_par_categorie/nb_joueurs_total/date_reponse). Un jeton invalide n'écrit jamais rien.
- **Liste admin des clubs triée** (action requise en haut) : 1. Accepté sans dossier envoyé →
  2. Invité sans réponse → 3. Décliné → 4. Accepté déjà envoyé. Les lignes « Accepté » affichent la
  **réponse remontée** (catégories, équipes/catégorie, joueurs) + « Générer le dossier final ». La
  mise à Accepté **manuelle** (fallback téléphone, Sprint 4) reste disponible.

### Sprint 5 (addendum) — Email HTML : sauts de ligne + justification du texte — 2026-07-24
Deux corrections de rendu sur le template HTML de l'email d'invitation (Phase 1) :
- **Sauts de ligne préservés** : les retours à la ligne saisis dans les zones de texte libre
  (phrase d'introduction éditable de l'aperçu, montant du tarif d'engagement) sont convertis en
  `<br>` via une fonction utilitaire réutilisable `nl2brEmail()` (échappe le texte PUIS convertit
  les `\n`). Même traitement dans l'aperçu inline et dans l'email envoyé (une seule fonction de
  rendu partagée → aperçu fidèle).
- **Texte justifié** : `text-align:justify` en style en ligne sur le paragraphe de texte courant
  (phrase d'introduction). Les titres de section, pastilles, tableaux et blocs de contact ne sont
  pas justifiés.
- **Champs concernés** : la phrase d'introduction éditable (« corps du message ») et
  `tarif_engagement_montant`. `tournoi_description` et `tarif_engagement_modalites` ne figurent PAS
  dans l'email d'invitation (contenus du dossier Phase 2, envoyé en **texte brut** → sauts de ligne
  déjà préservés nativement, pas de justification applicable). `nl2brEmail()` reste réutilisable si
  ces champs sont un jour ajoutés à un template HTML.

### Sprint 5 (addendum) — Email d'invitation en HTML (charte R92) + affiche inline — 2026-07-24
Le corps de l'email d'invitation (Phase 1) passe du texte brut à un **template HTML** reprenant
la mise en forme de `invitation-club.html`, pour un rendu plus engageant, avec l'**affiche du
tournoi en image inline** et un lien de secours vers la page complète. ⚠️ Redéploiement de la
Web App nécessaire.

- **Template HTML compatible email** (tableaux + styles EN LIGNE, pas de flex/grid) aux couleurs
  de la charte (navy `#0C1C2E`, bleu `#2E8FE0`), mêmes sections que la page Phase 1 et dans le
  même ordre : en-tête (affiche + nom + date), salutation personnalisée « Bonjour {prénom}, » +
  intro courte, « Vous êtes invités » (tableau catégorie / équipes par club / effectif mini),
  « Le jour J, en bref », « Sur place » (pastilles stylées, seulement si cochées, + tarif),
  « Réponse attendue » (date + contact), pied avec lien « Voir la version complète en ligne ».
- **Affiche en image inline** : le fichier Drive (`tournoi_affiche_id`) est joint via
  `inlineImages` et référencé en `cid:affiche` dans le HTML. Si aucune affiche n'est renseignée,
  l'email part sans image d'en-tête (le reste s'affiche normalement).
- **Envoi** : `htmlBody` (template) + `body` texte brut simplifié (fallback clients sans HTML /
  anti-spam, avec le lien complet en clair) + `inlineImages`. **MailApp** par défaut (scope léger
  `script.send_mail`), **GmailApp** avec `from` si `email_expediteur` (alias) est configuré.
  S'applique à l'envoi **individuel** ET **groupé** (même template ; la salutation seule varie par
  club — jeton `{{SALUTATION}}` remplacé côté serveur).
- **Aperçu admin** : le panneau « Inviter un club » affiche désormais le **rendu HTML réel** de
  l'email dans une iframe isolée (mêmes structure et couleurs), mis à jour en direct. L'**objet**
  et la **phrase d'introduction** restent éditables ; « Régénérer » repart des infos du tournoi.

### Sprint 5 — Page « Inviter un club » fusionnée + envoi des invitations (aperçu inline) — 2026-07-24
Réorganisation du workflow Phase 1 : **une seule page** pour ajouter les clubs et **envoyer les
invitations**, avec un **panneau d'aperçu de l'email** en direct (comme l'aperçu de la carte
« Infos du tournoi ») au lieu d'un simple lien vers la page publique. ⚠️ Nécessite un redéploiement
de la Web App (2 nouvelles actions backend + colonne Sheets migrée automatiquement).

- **Onglet `ClubsInvites`** — nouvelle colonne `invitation_envoyee` (date, vide par défaut) : posée
  automatiquement à l'envoi **réussi** de l'invitation Phase 1 (distincte de `dossier_envoye`,
  Phase 2). Migration douce ; remise à zéro par la réinitialisation du tournoi.
- **Page « Inviter un club »** réorganisée : la carte **« Clubs invités »** (liste + ajout) passe
  **tout en haut** ; l'ancienne carte « Inviter un club (Ouvrir l'invitation) » est **supprimée**
  (remplacée par l'aperçu) ; « Sur place » et « Réponse à l'invitation » restent en dessous.
  L'item de sidebar **« Clubs invités » est supprimé** — son contenu vit désormais uniquement
  sur « Inviter un club ».
- **Aperçu inline de l'email** (`bloc-apercu-invitation`) : objet + corps (salutation
  « Bonjour {prénom}, » illustrée avec un exemple — 1er club, ou « Prénom » si la liste est vide —,
  texte d'intro fixe et lien vers `invitation-club.html`). **Mise à jour en direct** quand on
  modifie « Sur place » (ligne des services) ou « Réponse à l'invitation » (date limite), sans
  rechargement.
- **Envoi des invitations** :
  - Bouton global **« Envoyer les invitations à tous les clubs »** : **résumé avant confirmation**
    (nombre d'éligibles = statut Invité + email + `invitation_envoyee` vide ; nombre sans email ;
    nombre déjà invités, exclus par défaut), case **« Renvoyer aussi aux clubs déjà invités »**
    (décochée par défaut), envoi en boucle **tolérant aux pannes** (un échec n'arrête pas les
    suivants) + **résumé final** (« N envoyées, M échecs : […] »). `invitation_envoyee` posée à
    chaque succès.
  - Bouton **individuel** « ✉️ » sur chaque ligne de club (désactivé si pas d'email) : envoie
    l'invitation à ce club, même contenu que l'aperçu. Badge « ✉️ Invité le … » sur la ligne.
  - Backend : actions `envoyerInvitationClub` / `envoyerInvitationsGroupe` (destinataire relu du
    Sheet, salutation personnalisée par club, envoi partagé `MailApp`/`GmailApp` factorisé avec
    la Phase 2).
- **Rétrocompatibilité** : `invitation_envoyee` optionnel ; `invitation-club.html` (Phase 1)
  inchangée — seul le point d'accès pour l'envoyer change.
- **Confidentialité & aperçu (ajustements)** :
  - Le lien **« Retour à l'administration »** (et le titre « aperçu avant envoi ») ne s'affiche
    plus sur les pages `invitation-club.html` / `dossier-club.html` **que** si elles sont ouvertes
    depuis l'admin (paramètre `?admin=1`). Les liens reçus par email par les clubs ne l'exposent
    plus. Le bouton « Exporter en PDF » reste visible pour tous.
  - L'aperçu de l'email d'invitation devient **modifiable** (objet + message éditables). Tant
    qu'on n'y touche pas, il suit en direct les cartes « Sur place » / « Réponse » ; un bouton
    **« Régénérer depuis les infos du tournoi »** restaure le texte automatique. Le contenu
    **édité** est celui réellement envoyé (individuel comme groupé) ; la salutation
    « Bonjour {prénom}, » reste ajoutée automatiquement par club.
  - Rappel explicite dans l'interface : l'envoi groupé envoie **un email individuel par club**
    (les adresses ne sont jamais partagées) — plus sûr qu'une copie cachée, et compatible avec
    la salutation personnalisée.

### Sprint 4 — Deux phases : invitation légère (Phase 1) + dossier complet personnalisé (Phase 2) — 2026-07-24
Le dossier unique devient un parcours **en deux temps** : une **invitation courte** envoyée à
tous les clubs invités *avant* leur réponse (Phase 1), puis le **dossier complet personnalisé**
(l'existant des Sprints 1‑3) envoyé **par email**, *automatiquement*, uniquement aux clubs qui
**acceptent** (Phase 2). Rien de l'existant n'est supprimé. ⚠️ Nécessite un redéploiement de la
Web App (nouvelles actions backend + colonnes Sheets migrées automatiquement).

- **Zone A (config générale)** — nouveaux paramètres : `buvette_disponible`,
  `espace_sandwich_disponible`, `boutique_r92_disponible` (booléens), `date_limite_reponse`
  (distincte de `date_limite_confirmation`, propre à la Phase 2), `contact_reponse_nom/tel/email`,
  et `email_expediteur` (alias « Envoyer en tant que », vide par défaut). Validation croisée :
  **au moins un** de `contact_reponse_tel` / `contact_reponse_email` est requis. Cartes admin
  « **Sur place** » (3 cases) et « **Réponse à l'invitation** » (actions `enregistrerSurPlace` /
  `enregistrerReponseInvitation`).
- **Zone B (par catégorie)** — nouveau champ `max_equipes_par_club` (entier, vide = illimité).
  Affiché « Jusqu'à X équipes par club » ou « Plusieurs équipes possibles par catégorie ».
- **Onglet `ClubsInvites`** — enrichi : `club_contact_prenom` (politesse du dossier),
  `categories_engagees` (« U8,U10 », vide tant que pas de réponse), `dossier_envoye` (date posée
  **automatiquement au succès** de l'envoi email). Statut **« Confirmé » renommé « Accepté »**
  (ancien libellé encore reconnu). Migration douce : les 3 colonnes s'ajoutent à droite sans
  toucher aux 5 existantes.
- **Nouvelle page `invitation-club.html` (Phase 1)** — invitation générique 1 page (même contenu
  pour tous) : en-tête + accroche courte, « Vous êtes invités » (catégories + max équipes +
  effectif mini), « Le jour J, en bref », « Sur place » (pastilles si cochées + tarif si demandé),
  « Réponse attendue », pied de page (logo + Instagram + site). Pas de bandeau ICS/Maps/QR
  (réservé à la Phase 2). Réutilise `css/dossier.css`.
- **`dossier-club.html` (Phase 2)** — accessible via `?tournoi=…&club=…`. Si `club` est présent :
  paragraphe d'**accueil personnalisé** (« Bonjour {prénom}, … {club} … ») et **filtrage** du
  tableau « Format sportif » sur les `categories_engagees` du club (une seule catégorie → puces).
  Sans paramètre `club` ou sans catégories engagées : comportement **inchangé** (rétrocompatible
  avec les liens déjà envoyés). Lecture publique via `getClubDossier` qui n'expose **jamais**
  l'email (nom, prénom, catégories seulement).
- **Envoi automatique par email avec aperçu (Point 7)** — sur la ligne d'un club **Accepté** avec
  catégories engagées : bouton « **Générer le dossier final** » → fenêtre d'**aperçu** (destinataire
  en lecture seule, objet et corps pré-remplis et modifiables) → « Envoyer » déclenche l'envoi réel
  (`envoyerDossierEmail` : `MailApp`, ou `GmailApp` avec `from` si `email_expediteur` est un alias)
  et pose `dossier_envoye` **uniquement en cas de succès**. Si le club n'a pas d'email : bascule en
  mode « **Copier le lien** ». Gestion d'erreur : message clair, `dossier_envoye` non posé, envoi
  relançable.
- **Sidebar admin** — nouvel item « **Inviter un club** » (Phase 1, ouvre `invitation-club.html`) ;
  l'écran du dossier existant devient « **Dossier complet (accepté)** » (Phase 2).
- **Documentation** — `docs/passation.md` §11 : bascule de l'adresse d'envoi (test
  `romain.rifleu@gmail.com` → cible `generationr92@gmail.com`), les **deux options** (re-déploiement
  sous le compte cible, ou alias Gmail + `email_expediteur`) et le champ `email_expediteur`.
  `docs/structure-google-sheet.md` mis à jour (nouvelles colonnes/paramètres).

### Dossier : retrait du champ « Équipes attendues » — 2026-07-23
Le champ **« Équipes attendues (nb) »** par catégorie (`nb_equipes_attendues`), ajouté au
Sprint 3, est **retiré** de l'application : plus de champ dans le formulaire de catégorie, plus
de colonne « Équipes attendues » dans le tableau Format sportif du dossier, et plus de validation
côté backend. ⚠️ Nécessite un redéploiement de la Web App. La colonne éventuellement présente
dans l'onglet Config d'un Sheet déjà en service devient **inutilisée** (aucun impact — on peut la
laisser ou la supprimer à la main).

### Sprint 3 — Dossier d'INVITATION + clubs invités + autorisation droit à l'image — 2026-07-23
Le dossier club devient un vrai **dossier d'invitation**, envoyé AVANT la confirmation des clubs.

- **Bug corrigé (dossier)** : dans le tableau Format sportif, « Poules » (et tout mot d'une
  colonne serrée) ne se coupe plus en plein mot — valeurs courtes en `nowrap` (classe
  `.col-courte`), coupure générale `break-word` (entre les mots) au lieu de `anywhere`.
- **Nouvelles cartes admin** (écran « Générer le dossier ») : **Modalités d'inscription**
  (date limite de confirmation, case « Tarif d'engagement » — décochée par défaut — révélant
  montant + modalités), **Parking & accès** (texte + photo en glisser-déposer, même mécanisme
  Drive que l'affiche, aperçu miniature), **Encadrement & assurance** (ratio éducateurs/joueurs,
  diplômes exigés, case « attestation d'assurance requise »). Backend : action commune
  `enregistrerInvitation` + `enregistrerPhotoParking`/`supprimerPhotoParking` (mécanisme
  d'image factorisé avec l'affiche) — 9 nouveaux paramètres Zone A, tous optionnels.
- **Clubs invités** : nouvel onglet Sheets `ClubsInvites` (`club_nom`, `club_contact_nom`,
  `club_contact_email`, `statut` Invité/Confirmé/Décliné, `date_ajout` auto) + nouvel écran
  « Clubs invités » dans la barre latérale (liste avec statut modifiable en menu déroulant,
  formulaire d'ajout sur le modèle des Équipes). 🔒 Les emails ne sont **jamais publics** :
  lecture via `listerClubsInvites` (clé admin), hors snapshot `getAll` / relais CDN. La
  réinitialisation du tournoi **conserve** cette liste (carnet d'adresses).
- **Dossier** : trois nouvelles sections entre « Format sportif » et « Suivi & organisation » —
  **Modalités d'inscription** (date limite en date longue ; tarif seulement si demandé),
  **Parking & accès** (texte + photo pleine largeur, bordure arrondie), **Encadrement &
  assurance** (ratio, diplômes, mention attestation). Règle habituelle : section vide = masquée.
- **Autorisation droit à l'image** : nouveau bouton du bandeau d'actions — le `.docx` est
  généré **côté client** (PizZip + docxtemplater, vendorés dans `js/vendor/` comme le QR code :
  aucun appel externe) depuis `assets/autorisation-droit-image-template.docx`, avec remplacement
  des balises `{nom_tournoi}` / `{date_tournoi}` (date longue) / `{lieu_tournoi}` et un nom de
  fichier parlant (`Autorisation-droit-image-<nom-slugifié>-<date>.docx`). Le nom du club reste
  manuscrit (document générique). En cas de modèle introuvable : message clair sous le bandeau
  (« contactez [référent] »), jamais d'échec silencieux.
- **Réseaux sociaux** : le bouton du bandeau devient « 📣 Relayer sur les réseaux » et pointe
  directement vers `url_instagram` (compte Génération R92).
- **Format sportif (dossier) — légende explicative** : sous le tableau, une légende **décrit**
  désormais le format retenu (au lieu de seulement le nommer) — le déroulé du matin (poules
  round-robin) + une description concise de **chaque** format d'après-midi présent (dédupliqué).
  Elle ajoute aussi une ligne **« Temps de jeu »** par catégorie : temps de jeu par match
  (mi-temps × durée) et récupération entre deux matchs.
- ⚠️ **Redéploiement de la Web App nécessaire** (nouvelles actions backend). Rétrocompatible :
  tous les nouveaux champs sont optionnels, colonnes/onglet créés automatiquement (migration douce).

### Dossier club : la fin de l'événement expliquée (vestiaires + trophées) — 2026-07-23
La marge après le dernier match est désormais **explicitée partout** : elle couvre le
**retour aux vestiaires** puis la **cérémonie de remise des trophées**, et l'événement se
termine **à l'issue de la remise**. Le dossier affiche « **Fin de l'événement** » (au lieu de
« Fin de la journée ») avec une note explicative dans le Programme, l'agenda `.ics` reprend la
mention, et l'aide du champ « Marge » du formulaire Horaires détaille ce déroulé.

### Dossier club : marge de fin réglable dans les Horaires — 2026-07-23
La marge du mode automatique (« fin du dernier match + X min ») devient **réglable** :
nouveau champ **« Marge après le dernier match (min) »** dans le formulaire « Horaires de la
journée » de l'admin (défaut **75** = 1 h 15), stocké dans Config (`marge_fin_communiquee_min`).
Le dossier club l'utilise pour l'heure de fin annoncée (Programme + agenda `.ics`) quand
« Heure de fin communiquée » est vide. ⚠️ Nécessite un redéploiement de la Web App
(liste blanche d'`enregistrerHoraires` étendue).

### Dossier club : fin communiquée automatique + tableau sans débordement — 2026-07-23
- **Heure de fin annoncée aux clubs** : si `heure_fin_communiquee` est **vide**, le dossier
  affiche désormais automatiquement **fin du dernier match + 1 h 15** (`heure_fin`, recalculée
  à chaque génération du planning) — dans le Programme comme dans l'agenda `.ics`. Une valeur
  saisie à la main prime toujours. Le formulaire Horaires de l'admin l'explique sous le champ.
- **Règlement d'une catégorie** : l'URL est détectée même **noyée dans un préfixe** (cas réel :
  lien copié depuis la visionneuse PDF de Chrome, `chrome-extension://…/https://…pdf`) et
  remplacée par un lien court « Consulter le règlement » — fini l'URL brute interminable.
- **Anti-débordement** : les cellules du tableau Format sportif et les valeurs des listes
  coupent les chaînes insécables (`overflow-wrap: anywhere`) au lieu de faire déborder la page.

### Sprint 2 dossier club : générateur automatique de dossier — 2026-07-23
Nouvelle page **`dossier-club.html`** : le dossier récapitulatif envoyé aux clubs invités,
assemblé automatiquement depuis les données du tournoi (Config Zone A + Zone B). **Un seul
dossier par tournoi**, générique (pas de filtrage par club/catégorie). **100 % frontend** —
aucune modification backend (lecture via le `getAll` existant).

- **Contenu (A4, 1-2 pages)** : en-tête (affiche, nom, date, « Généré le … »), présentation
  (description tronquée à 400 caractères), Infos pratiques (lieu, adresse + parking/buvette/
  vestiaires si renseignés), Programme de la journée (RDV, coup d'envoi, pause déjeuner, fin
  communiquée + mention « horaires indicatifs »), Format sportif (**tableau** si plusieurs
  catégories, **puces** si une seule — colonnes vides retirées), Suivi & organisation (lien
  live + **QR code**, table de marque, **phrase de synthèse des terrains** calculée depuis les
  JSON), Sécurité (poste de secours + référent résolu via `securite_referent_identique`),
  bloc contact (référent tournoi), bandeau d'actions (**.ics**, **Google Maps**, **Waze**,
  site association, Instagram), pied de page logo R92 + mention Racing 92.
- **Règle d'or** : toute section dont tous les champs sont vides est **masquée entièrement**
  (titre compris) — jamais de « non communiqué ».
- **Technique** : `.ics` généré côté client (1 seul VEVENT, `DTSTART` = heure de RDV,
  `DTEND` = fin communiquée, replis début/fin de matchs) ; itinéraires construits depuis
  `tournoi_adresse` (repli `tournoi_lieu`) ; QR code généré **en local** par
  `js/vendor/qrcode.js` (lib MIT embarquée, aucun appel externe) ; **export PDF = impression
  navigateur** (CSS print `css/dossier.css`, charte navy `#0C1C2E` / bleu `#2E8FE0`).
- **Admin** : nouvel item **« Générer le dossier »** dans la barre latérale (et carte
  « Dossier » dans l'assistant mobile) — jamais verrouillé ; la carte affiche l'**état des
  sections** (celles qui apparaîtront / seront masquées) et ouvre le dossier dans un onglet.
- Le dossier lit aussi 7 paramètres **optionnels** de la Zone A s'ils sont ajoutés à la main
  (`logistique_parking`/`_buvette`/`_vestiaires`, `table_marque_organisation`,
  `url_tournoi_public`, `url_site_association`, `url_instagram`) — documentés dans
  `docs/structure-google-sheet.md`.

### Sprint 1 dossier club : nouveaux champs (adresse, RDV, contacts, sécurité, cadre sportif) — 2026-07-23
Premiers champs du futur **générateur de dossier club**. Tous **optionnels** : un tournoi
existant sans ces données continue de fonctionner à l'identique (rétrocompatible).

- **Zone A de `Config`** (paramètres globaux) : `tournoi_adresse` (adresse postale, séparée du
  lieu), `heure_rdv` (accueil des équipes), `heure_fin_communiquee` (fin annoncée aux clubs,
  jamais recalculée), `referent_nom` / `referent_tel`, `securite_secours_oui` /
  `securite_secours_precisions`, `securite_referent_identique` (défaut `oui`) /
  `securite_referent_nom` / `securite_referent_tel`.
- **Zone B de `Config`** (colonnes par catégorie, ajoutées à droite par la **migration douce**
  habituelle) : `reglement` (texte ou URL — à afficher en lien si `http…`), `effectif_min` /
  `effectif_max` (joueurs par équipe, min ≤ max vérifié), `arbitrage_organisation` (qui arbitre —
  nom distinct de l'« arbitrage » de l'assistant horaires).
- **Admin — Infos du tournoi** : nouveau champ **Adresse complète** sous le Lieu (enregistré avec
  les infos, effacé à la réinitialisation).
- **Admin — Horaires** : **Heure de RDV des équipes** (pré-remplie à `heure_debut − 1h15` à la
  saisie de l'heure de début, sans jamais écraser une valeur personnalisée) et **Heure de fin
  communiquée aux clubs** (saisie libre).
- **Admin — nouvelle carte « Contacts & sécurité »** (écran/carte Infos) : référent tournoi
  (nom + téléphone), case **Poste de secours** (révèle un champ Précisions), case **Référent
  sécurité identique au référent tournoi** (cochée par défaut ; décochée → nom + téléphone
  distincts). Nouvelle action backend `enregistrerContactsSecurite`.
- **Admin — Catégories** : 4 nouveaux réglages par catégorie (Règlement, Effectif min/max,
  Arbitrage), enregistrés avec la carte de la catégorie.
- **Validations** (frontend + backend) : téléphones à **10 chiffres** (espaces/points/tirets
  acceptés à la saisie, retirés à l'enregistrement), heures `HH:MM`, `effectif_min ≤ effectif_max`.
- Réinitialisation du tournoi : efface aussi l'adresse, les heures RDV/fin communiquée et les
  contacts & sécurité. `setupSheet()` crée les nouveaux en-têtes ; documentation
  (`docs/structure-google-sheet.md`) à jour.

### Admin : nouveau look navy/blanc/ciel + navigation par écrans — 2026-07-22
La page admin fait peau neuve, **sans toucher à sa logique** (admin.js inchangé). **100 % frontend.**

- **`css/theme-r92.css`** (nouveau) : surcouche visuelle chargée après `styles.css`, scopée sous
  `.theme-clair` → aucun effet sur saisie/perfs/tournoi. Typo **Fraunces** (titres, gros chiffres)
  + **Familjen Grotesk** (corps), cartes arrondies à ombre douce, boutons pilule, tableau de bord
  en 4 cartes-stats à pastille dégradée, champs clairs à focus bleu ciel. Réversible en retirant
  la ligne `<link>` d'`admin.html`. Au passage : le bouton « 🔄 Rafraîchir » respire (padding,
  casse normale, jamais coupé).
- **Mode « écrans »** (nouveaux `js/ecrans.js` + `css/ecrans.css`) : sur **grand écran** (≥ 1024px),
  fini la longue page qui déroule — une **barre latérale** navy fixe ouvre 4 écrans : **Infos du
  tournoi** (infos + horaires) · **Équipes & catégories** · **Poules & planning** (terrains,
  génération, après-midi) · **Publication** (+ réinitialisation). Le tableau de bord et le fil
  « Où en suis-je ? » restent visibles partout, et **cliquer une étape du fil ouvre le bon écran**.
  Chaque onglet porte une **pastille d'état** nourrie par le cerveau (✓ fait · à faire · « ! » à
  refaire). Le dernier écran ouvert est mémorisé ; fenêtre rétrécie → la barre devient des
  onglets horizontaux.
- **Cohabitation avec l'assistant à cartes** (décision explicite) : le choix se fait **au
  chargement** — grand écran → mode écrans ; **mobile → assistant à cartes inchangé**, avec son
  verrou « Suivant ». « Vue classique » reste l'échappatoire commune (même préférence mémorisée),
  avec un bouton de retour « Mode écrans » ou « Mode assistant » selon la taille.
- Technique : même recette éprouvée que l'assistant — on **déplace** les blocs existants (les
  écouteurs suivent), tous les `id`/classes sont conservés ; `assistant.js` aiguille entre les
  deux modes (4 petits branchements), `admin.js` **inchangé**. Sans JavaScript, la page longue
  s'affiche telle quelle.
- Vérifié en navigateur sur données réelles : 4 écrans, navigation par le fil, pastilles,
  aller-retour « Vue classique », verrou mobile (fermeture à la frappe, réouverture à
  l'annulation), pages saisie/tournoi/perfs intactes, aucune erreur console.

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
