# Architecture

> 🗺️ **À quoi sert ce document.** C'est **la carte du projet** : ce qui existe, et comment les
> morceaux se parlent. On l'ouvre pour répondre à *« où est-ce que ça se passe ? »* — pas pour
> comprendre le détail d'une fonction (ça, c'est le rôle des commentaires dans le code).
>
> ⚠️ **Règle de tenue à jour** — `CLAUDE.md` **§8 bis** : *une session qui ajoute un écran, une
> action serveur ou un onglet met ce document à jour **dans le même lot**.* Deux minutes sur le
> moment, une session entière si on rattrape plus tard.
>
> 📐 **Tous les comptes de ce document sont vérifiables**, et la méthode de comptage de chacun est
> écrite au **§7**. Un chiffre sans sa méthode est un piège : c'est la leçon **M-06** du chantier
> d'industrialisation.

---

Le projet repose sur **3 briques** qui se parlent en JSON.

```
┌─────────────────────┐        ┌──────────────────────────┐        ┌──────────────────────────┐
│   Frontend (web)    │  HTTP  │  Backend Apps Script     │        │   Google Sheet           │
│  8 pages            │ <────> │  (Web App, répond JSON)  │ <────> │  12 onglets              │
│  26 fichiers JS     │  JSON  │  doGet() / doPost()      │        │  8 de travail            │
│                     │        │  65 actions              │        │  + 4 de référence FFR    │
└─────────────────────┘        └──────────────────────────┘        └──────────────────────────┘
```

> Montée en charge spectateurs : la page publique lit `getAll` **mis en cache serveur ~10 s** (et
> peut basculer sur un **relais CDN Cloudflare** dormant). Voir [`relais-cdn.md`](relais-cdn.md).

---

## 1. Google Sheet — la base de données

Stocke toutes les données. Voir [`structure-google-sheet.md`](structure-google-sheet.md) pour le
détail des colonnes. C'est aussi l'endroit où l'organisateur peut vérifier ou corriger les données
à la main.

**12 onglets**, et ils ne jouent pas le même rôle : **8 onglets de travail** — les données du
tournoi — et **4 onglets de référence** qui portent le cadre fédéral.

### Les 8 onglets de travail

| Onglet | Ce qu'il contient | Créé par |
|---|---|---|
| `Config` | Tous les réglages : zone A (paramètres globaux, clé/valeur) et zone B (les catégories, en tableau). Contient aussi des **données personnelles** (référent, contacts sécurité, contacts de réponse) | `setupSheet()` |
| `Equipes` | Les équipes engagées, leur catégorie, leurs effectifs déclarés | `setupSheet()` |
| `Poules` | La composition des poules après tirage | `setupSheet()` |
| `Matchs` | Le planning **et** les scores : heure, terrain, phase, équipes, score, état | `setupSheet()` |
| `Historique` | Le journal de saison — une ligne par score validé, **jamais effacé** par une génération ni par la réinitialisation | `setupSheet()` |
| `ClubsInvites` | Les clubs invités : nom, **email de contact**, statut, jeton, réponse. ⚠️ **Données personnelles** — cet onglet ne sort **jamais** dans l'instantané public | `setupSheet()` |
| `Sponsors` | Les fiches partenaires (entreprises) | `setupSheet()`, et `assurerOngletSponsors()` **à la demande** sur un classeur plus ancien |
| `Mesures` | Les relevés de visibilité des partenaires | `assurerOngletMesures()` **à la demande**, au premier relevé |

> ℹ️ **`setupSheet()` en crée 7** et l'annonce ainsi dans sa fenêtre de confirmation. Le 8ᵉ,
> `Mesures`, apparaît au premier relevé de visibilité.

### Les 4 onglets de référence FFR

Ils portent le **calendrier et les règles de l'École de Rugby** publiés par la fédération. Ils ne
contiennent **aucune donnée personnelle**, sont lus **en public** (action `getRefFFR`, avec son
propre cache), et **se remplissent à la main** — `setupSheet()` ne les crée pas.

| Onglet | Ce qu'il contient |
|---|---|
| `RefFFR_Formes` | Les formes de jeu autorisées par catégorie |
| `RefFFR_Dates` | Le calendrier fédéral : quelles dates sont compatibles, par zone |
| `RefFFR_Regles` | Une ligne par *catégorie × forme × effectif* : terrain, effectifs, ballon, carton, tir au but |
| `RefFFR_Temps` | Les grilles de temps de jeu, par *catégorie × effectif × nombre de demi-journées × nombre d'équipes* |

> 🛡️ **Migration douce, et c'est une qualité du code** : si l'un de ces onglets est **absent, vide
> ou illisible**, la lecture renvoie une liste vide **sans jamais lever d'erreur**, et toute la
> chaîne de conformité se met en repli. **L'application continue de fonctionner exactement comme
> avant.** C'est pourquoi un classeur peut très bien tourner avec **les 8 onglets de travail
> seulement** — il perd alors la conformité FFR, rien d'autre.

---

## 2. Google Apps Script — le backend

Un script **rattaché au Sheet**, déployé en **Web App** accessible par une URL. Il expose deux
points d'entrée standard :

- **`doGet(e)`** : les demandes de **lecture** (« donne-moi tous les matchs ») ;
- **`doPost(e)`** : les demandes d'**écriture** (« enregistre le score du match M001 »).

Le frontend appelle l'URL de la Web App avec un paramètre `action`, et le backend renvoie du
**JSON**. Le frontend n'accède **jamais** directement au Sheet : tout passe par le backend.

> **Écriture (POST)** : le frontend envoie le JSON en `text/plain` pour éviter la requête
> préliminaire CORS (« preflight ») qu'Apps Script ne gère pas. Le corps contient `{ action, … }`.

### 2.1 — Qui a le droit de faire quoi

Il n'y a **pas de comptes d'utilisateurs** : il y a **deux clés partagées** et **un jeton par club**.

| Niveau d'accès | Ce que ça veut dire | Combien d'actions |
|---|---|---|
| 🌍 **Public** | aucune clé, aucun jeton — n'importe qui sur Internet | **13** |
| 🎟️ **Jeton du club** | le lien personnel envoyé au club (`?club=…&token=…`) ; un club ne voit jamais la fiche d'un autre | **4** |
| 🔑 **Clé SCORES** | la clé donnée aux marqueurs le jour J | **1** *(`enregistrerScore`)* |
| 🔐 **Clé ADMIN** | la clé de l'organisateur | **47** |

*13 + 4 + 1 + 47 = 65.*

Le contrôle est fait **au tout début de `doPost`**, avant toute ouverture du classeur. Trois tables
en tête de fichier le pilotent : `ACTIONS_SCORES`, `ACTIONS_TOKEN` et `ACTIONS_LECTURE`.

> 🔒 **Deux garde-fous en plus, tous deux dans le code** :
> **1.** un **anti-force-brute** — au-delà de `MAX_ECHECS_CLE = 30` mauvaises clés dans une fenêtre
> de 5 minutes, les nouvelles tentatives à mauvaise clé sont refusées ; une **bonne** clé passe
> toujours et remet le compteur à zéro, donc un marqueur n'est jamais bloqué ;
> **2.** une **longueur minimale de clé** — `LONGUEUR_CLE_MIN = 12` caractères, refusée en dessous
> au moment de la configurer.

> ⚠️ **La seule écriture publique du fichier est `mesureSponsors`**, et ce n'est pas un oubli : les
> relevés viennent des téléphones des spectateurs, qui n'ont évidemment aucune clé. Elle est
> plafonnée en débit et en volume, écrit dans un onglet isolé que rien d'autre ne lit, et **ne prend
> pas le verrou d'écriture** — sans quoi quelques centaines de spectateurs feraient attendre le
> marqueur au bord du terrain.

### 2.2 — Les 65 actions

**Légende de la colonne « Accès »** : 🌍 public · 🎟️ jeton du club · 🔑 clé SCORES · 🔐 clé ADMIN.

#### A. Service, données publiques et référentiel FFR — 12 actions

| Action | Accès | Voie | Ce qu'elle fait |
|---|---|---|---|
| `ping` | 🌍 | GET | Répond « en ligne » **sans ouvrir le classeur**. Sert au diagnostic |
| `getAll` | 🌍 | GET | **L'appel massif** : config publique + équipes + poules + matchs + partenaires actifs, en une fois, servi par un **cache serveur ~10 s** |
| `getRefFFR` | 🌍 | GET | Le référentiel FFR (formats, durées, temps de jeu). Cache **séparé** de `getAll` |
| `getConfig` | 🌍 | GET | Les réglages, **filtrés par la vue « invitation »** — jamais la config brute |
| `getEquipes` | 🌍 | GET | La liste des équipes |
| `getPoules` | 🌍 | GET | La composition des poules |
| `getMatchs` | 🌍 | GET | Le planning et les scores |
| `getClassement` | 🌍 | GET | **Calcule** le classement de chaque poule depuis les matchs terminés. Barème V=3 / N=2 / D=1, départage à la différence de points puis aux points marqués |
| `getHistorique` | 🌍 | GET | Le journal de saison (page Perfs) |
| `getConformiteFFR` | 🌍 | GET | Pour une date + des catégories + une zone : le tournoi est-il conforme au cadre FFR ? **Informatif, n'empêche jamais de sauvegarder** |
| `datesCompatiblesFFR` | 🌍 | GET | Les jours d'un mois compatibles FFR (week-ends + mercredis), avec leur statut |
| `getCapacitesCategories` | 🌍 | GET | Ce que la saisie doit proposer par catégorie (aujourd'hui : tir au but oui/non), **lu du référentiel FFR**, jamais déduit du nom de la catégorie |

#### B. Le parcours d'un club invité — 4 actions

> 🎟️ **Ces quatre actions sont ouvertes sur Internet mais protégées par le jeton du club.** Un
> jeton qui ne correspond pas reçoit une **erreur générique**, qui ne révèle rien.

| Action | Accès | Voie | Ce qu'elle fait |
|---|---|---|---|
| `getClubDossier` | 🎟️ | GET | Les infos **non sensibles** d'un club pour son dossier — **jamais son email** |
| `getConfigClub` | 🎟️ | GET | La partie du dossier qui lui est destinée : contacts du jour J, logistique, secours, tarifs |
| `getReponseInvitation` | 🎟️ | GET | Ce qu'il faut pour afficher la page de réponse : rappel du tournoi, catégories ouvertes, et la réponse déjà donnée s'il y en a une |
| `repondreInvitation` | 🎟️ | POST | **Le club répond lui-même** : accepte (avec ses catégories, son nombre d'équipes et de joueurs) ou décline. Tout est revalidé côté serveur |

#### C. Lectures réservées à l'organisateur — 5 actions

> Ces lectures passent par `doPost` **parce qu'elles exigent la clé ADMIN** — `doGet` est ouvert à
> tous. Elles ne modifient rien : elles répondent **avant** de prendre le verrou d'écriture, pour ne
> jamais faire attendre la saisie des scores.

| Action | Accès | Voie | Ce qu'elle fait |
|---|---|---|---|
| `getConfigAdmin` | 🔐 | POST | La config **complète**, zone A comprise — donc les données personnelles |
| `getDossierAutorisation` | 🔐 | POST | Les champs de la demande d'autorisation FFR (personnels) |
| `listerSponsors` | 🔐 | POST | Toutes les fiches partenaires, actives **ou non** |
| `lireMesuresSponsors` | 🔐 | POST | Les relevés de visibilité d'un jour donné |
| `listerClubsInvites` | 🔐 | POST | La liste des clubs invités. ⚠️ **Elle contient des emails** — c'est précisément pourquoi elle ne passe pas par `doGet` et n'entre **jamais** dans l'instantané public |

#### D. Les équipes — 4 actions

| Action | Accès | Voie | Ce qu'elle fait |
|---|---|---|---|
| `ajouterEquipe` | 🔐 | POST | Ajoute une équipe (nom + catégorie + effectifs), marquée `source = manuel` |
| `modifierEquipe` | 🔐 | POST | Renomme une équipe et met à jour ses effectifs. Un effectif **non fourni** n'est pas effacé ; un effectif **vide** l'est volontairement |
| `supprimerEquipe` | 🔐 | POST | Supprime une équipe |
| `supprimerEquipesCategorie` | 🔐 | POST | Supprime toutes les équipes d'une catégorie d'un coup |

#### E. Les réglages du tournoi — 5 actions

| Action | Accès | Voie | Ce qu'elle fait |
|---|---|---|---|
| `enregistrerHoraires` | 🔐 | POST | Les horaires globaux : début, fin, fin automatique, battement entre matchs, pause déjeuner, heure de RDV, heure de fin communiquée aux clubs, marge, pause échelonnée |
| `enregistrerCategorie` | 🔐 | POST | Crée ou met à jour une catégorie (zone B). Vérifie que l'effectif min ne dépasse pas le max |
| `supprimerCategorie` | 🔐 | POST | Supprime une catégorie |
| `appliquerValeursFFR` | 🔐 | POST | Applique à une catégorie les valeurs du référentiel FFR. ⚠️ **Le navigateur n'envoie que `{catégorie, date, variante}`** : le serveur relit lui-même le référentiel — sans quoi une page pourrait écrire n'importe quoi en se réclamant de la FFR |
| `enregistrerPlanTerrains` | 🔐 | POST | Le plan des grands terrains réels, les dimensions de mini-terrain par catégorie, le couloir de circulation et la table de marque |

#### F. Génération des poules et du planning — 5 actions

| Action | Accès | Voie | Ce qu'elle fait |
|---|---|---|---|
| `genererPoulesEtPlanning` | 🔐 | POST | Tire les poules et calcule le planning du matin. **Bloque à moins de 3 équipes dans une catégorie** (règle FFR : les matchs secs ne sont pas autorisés à l'école de rugby). Renvoie les **arbitrages** chiffrés en cas de dépassement |
| `reorganiserPoulesMatin` | 🔐 | POST | Refait les poules **à la main** selon une répartition fournie, puis recalcule matchs et horaires. **Refuse si un score du matin est déjà saisi** |
| `recalculerHoraires` | 🔐 | POST | Recalcule heures et terrains **sans retirer au sort** : même composition de poules, scores déjà saisis réinjectés. Refuse si l'après-midi est déjà généré |
| `genererApresMidi` | 🔐 | POST | Fabrique la phase de l'après-midi selon le format de **chaque** catégorie (poules de niveau / croisé / croisé diagonal / libre / coupe-plateau) et la planifie après la pause. **Ajoute sans effacer le matin** |
| `genererDimancheScf` | 🔐 | POST | Super Challenge : le brassage du **dimanche**, groupes de niveau formés d'après les scores du samedi |

#### G. La saisie des scores — 1 action

| Action | Accès | Voie | Ce qu'elle fait |
|---|---|---|---|
| `enregistrerScore` | 🔑 | POST | Enregistre le score d'un match et le passe en `terminé`. Scores entiers ≥ 0. En coupe : accepte un `vainqueur` en cas d'égalité, et une correction **en cascade** sur les tours suivants |

> 🔑 **C'est la seule action de la clé SCORES.** Un marqueur ne peut rien faire d'autre — ni
> générer, ni publier, ni toucher aux équipes.

#### H. Publication et contenus vus par le public — 8 actions

| Action | Accès | Voie | Ce qu'elle fait |
|---|---|---|---|
| `publierTournoi` | 🔐 | POST | Rend le tournoi visible, ou le masque. Tant que ce témoin n'est pas à `oui`, la page publique affiche « à venir » |
| `publierPlanningClubs` | 🔐 | POST | Rend poules et matchs visibles **dans les dossiers des clubs**. ⚠️ **Indépendant du précédent**, et **remis à `non` par toute génération ou réorganisation** : générer n'est pas valider |
| `enregistrerInfosTournoi` | 🔐 | POST | Nom, date, lieu, adresse, description |
| `enregistrerContactsSecurite` | 🔐 | POST | Référent tournoi, poste de secours, référent sécurité. Téléphones normalisés à 10 chiffres |
| `enregistrerAffiche` | 🔐 | POST | Enregistre l'affiche (image → Google Drive) |
| `supprimerAffiche` | 🔐 | POST | Retire l'affiche |
| `enregistrerPhotoParking` | 🔐 | POST | Enregistre la photo du parking (→ Google Drive) |
| `supprimerPhotoParking` | 🔐 | POST | Retire la photo du parking |

#### I. Le dossier d'invitation et les clubs invités — 15 actions

> 📬 **C'est le plus gros sous-ensemble du serveur, et il était entièrement absent de ce document
> jusqu'au 2026-08-09.** C'est ce que le problème **R-073** décrivait.

| Action | Accès | Voie | Ce qu'elle fait |
|---|---|---|---|
| `enregistrerInvitation` | 🔐 | POST | Le contenu du dossier d'invitation : tarif, attestation d'assurance, date limite de confirmation, textes libres |
| `enregistrerSurPlace` | 🔐 | POST | La carte « Sur place » du dossier (3 interrupteurs) |
| `enregistrerReponseInvitation` | 🔐 | POST | La carte « Réponse à l'invitation » : date limite, contact téléphone / email. **Exige au moins un des deux contacts** |
| `enregistrerDossierAutorisation` | 🔐 | POST | Les champs saisis de la demande d'autorisation FFR, écrits **champ par champ** pour ne jamais écraser le reste de la ligne |
| `ajouterClubInvite` | 🔐 | POST | Ajoute un club. Nom obligatoire, **doublons refusés** (comparaison sans accents ni casse), email vérifié s'il est fourni |
| `modifierClubInvite` | 🔐 | POST | Corrige le nom et le contact d'un club. **Ne touche ni au statut, ni à la réponse, ni au jeton** |
| `modifierStatutClubInvite` | 🔐 | POST | Change le statut d'un club (menu déroulant de la liste) |
| `supprimerClubInvite` | 🔐 | POST | Retire un club **en cascade avec ses équipes**. Avec `apercu = oui`, ne supprime rien et renvoie le plan pour la boîte de confirmation. **Refuse** tant qu'une équipe du club est bloquante (créée à la main, placée en poule, ou déjà dans des matchs) — jamais de matchs fantômes |
| `enregistrerCategoriesEngagees` | 🔐 | POST | Les catégories engagées d'un club, **et** la synchronisation de ses équipes, dans **un seul appel serveur** |
| `creerEquipesClub` | 🔐 | POST | Fabrique les équipes d'un club depuis son engagement (`club`, `club-1`, `club-2`…). **Idempotent** : ne recrée jamais une équipe déjà là. Un engagement réduit retire les équipes **supprimables** seulement |
| `regenererJetonClub` | 🔐 | POST | Renouvelle le lien personnel d'un club. ⚠️ **L'ancien lien cesse immédiatement de fonctionner**, y compris les copies partagées aux éducateurs. Geste volontaire, jamais automatique |
| `envoyerInvitationClub` | 🔐 | POST | Envoie l'invitation à **un** club. Destinataire **relu dans le classeur**, jamais fourni par le navigateur |
| `envoyerInvitationsGroupe` | 🔐 | POST | Envoi groupé — **un courriel par club, jamais un courriel commun**. Filtre côté serveur, tolérant aux pannes : l'échec d'un club n'arrête pas les suivants |
| `envoyerDossierEmail` | 🔐 | POST | Envoie le dossier complet à un club. Destinataire **toujours relu dans le classeur** |
| `envoyerFeuilleJour` | 🔐 | POST | Envoie la feuille de fin de journée aux clubs **acceptés**, chacun individuellement |

#### J. Les partenaires — 5 actions

| Action | Accès | Voie | Ce qu'elle fait |
|---|---|---|---|
| `enregistrerReglagesSponsors` | 🔐 | POST | Les réglages d'affichage (durées, interrupteurs). Seuls les champs **présents** dans la requête sont écrits |
| `enregistrerSponsor` | 🔐 | POST | Crée ou met à jour une fiche. Logo et visuel facultatifs ; remplacés, l'ancienne image part à la corbeille |
| `supprimerSponsor` | 🔐 | POST | Supprime une fiche et met ses images à la corbeille |
| `viderMesuresSponsors` | 🔐 | POST | Efface **tous** les relevés de visibilité. Les fiches ne bougent pas |
| `mesureSponsors` | 🌍 | POST | **La seule écriture sans clé.** Enregistre un relevé de visibilité envoyé par le téléphone d'un spectateur. Tout est revalidé, rien n'est cru sur parole. Plafonnée en débit et en volume, hors verrou |

#### K. La zone de danger — 1 action

| Action | Accès | Voie | Ce qu'elle fait |
|---|---|---|---|
| `reinitialiserTournoi` | 🔐 | POST | **Irréversible.** Vide `Equipes`, `Poules` et `Matchs`, supprime toutes les catégories, efface les infos publiques du tournoi. **`Historique` n'est PAS effacé** |

> ⚠️ **Ce que la réinitialisation n'efface pas, et qui n'est pas évident** : le détail des effectifs
> et le total d'éducateurs de l'édition passée, ainsi que **tous les contacts de la demande
> d'autorisation FFR** — représentant, président, **médecin**, antenne de secours. C'est un écart
> connu et suivi : voir [`conservation-donnees.md`](conservation-donnees.md) et les problèmes
> **R-030 / R-033** du chantier d'industrialisation.

### 2.3 — Ce qui se passe après chaque écriture

```
   requête POST
        │
        ├─ mesureSponsors ? ──► plafonds de débit ──► écrit dans Mesures ──► FIN (pas de verrou)
        │
        ├─ contrôle de la clé (SCORES ou ADMIN) ou du jeton ──► refus si mauvaise
        │
        ├─ action de LECTURE admin ? ──► répond ──► FIN (pas de verrou)
        │
        ├─ 🔒 prise du verrou d'écriture (attente max 20 s)
        │        │
        │        ├─ l'action s'exécute
        │        └─ succès ? ──► le cache public est reconstruit SOUS verrou
        │
        ├─ 🔓 relâchement du verrou
        │
        └─ envoi de l'instantané au relais CDN, APRÈS le verrou
```

Deux détails qui comptent, et qui sont dans le code :

1. **le verrou est relâché avant l'appel au relais CDN** — la latence réseau du relais ne prolonge
   plus la détention du verrou, donc n'entre pas en concurrence avec un autre marqueur ;
2. **`listerClubsInvites` ne reconstruit pas le cache** — c'est une lecture, rien n'a changé.

---

## 3. Frontend — les 8 pages

Pages statiques (HTML/CSS/JS), **mobile-first**, publiées par GitHub Pages.

| Page | Public visé | Rôle |
|---|---|---|
| `index.html` | tout le monde | **Redirection immédiate** vers `tournoi.html` (12 lignes, aucun script) |
| `tournoi.html` | les spectateurs | **La page publique.** 2 onglets — 📋 *Mon équipe* et 🏆 *Classements* — filtre catégorie global, derniers scores, **podium affiché dès qu'il est mathématiquement certain**, bandeau de don. Un seul appel `getAll`, rafraîchi ~15 s avec décalage aléatoire |
| `saisie.html` | les marqueurs, sur le terrain | Saisie des scores match par match, sur téléphone. **Clé SCORES** |
| `admin.html` | l'organisateur | **L'écran de pilotage** : équipes, réglages, génération, terrains, invitations, partenaires, autorisation FFR, feuille de journée. **Clé ADMIN**. 870 lignes de HTML, 20 scripts |
| `invitation-club.html` | un club, avant sa réponse | **Phase 1** — l'invitation légère, présentée comme un document |
| `reponse-invitation.html` | un club | **Phase 1** — le club accepte ou décline **lui-même**. Protégée par **jeton** |
| `dossier-club.html` | un club accepté | **Phase 2** — le dossier complet et personnalisé. Protégée par **jeton** |
| `perfs.html` | interne | Page « Perfs Racing », **non liée dans le menu** : lecture seule, 2 onglets |

### Les 26 fichiers JavaScript

**Chargés par toutes les pages, ou presque — le socle (5)**

| Fichier | Lignes | Rôle |
|---|---|---|
| `config.js` | 30 | **L'URL de la Web App** et les constantes partagées. Le **seul** fichier à modifier si l'adresse du backend change |
| `commun.js` | 309 | Les utilitaires communs à **toutes** les pages (échappement du texte, libellés, comparaison de catégories) — écrits une fois au lieu d'être recopiés |
| `api.js` | 218 | Les appels `fetch()` vers le backend. **Le seul endroit qui parle au serveur** |
| `dialog.js` | 177 | Les fenêtres de confirmation « maison », qui remplacent `confirm` / `prompt` / `alert` du navigateur |
| `commun-dossier.js` | 522 | Les utilitaires partagés par les trois pages « document » du parcours club |

**La page publique et la saisie (3)**

| Fichier | Lignes | Rôle |
|---|---|---|
| `tournoi.js` | 1 115 | Toute la page publique |
| `saisie.js` | 745 | Toute la saisie des scores |
| `perfs.js` | 410 | La page interne Perfs Racing |

**Le parcours des clubs (3)**

| Fichier | Lignes | Rôle |
|---|---|---|
| `invitation.js` | 179 | L'invitation Phase 1 |
| `reponse.js` | 453 | La réponse en libre-service du club |
| `dossier.js` | 855 | Le dossier Phase 2, personnalisé par club |

**Les partenaires (1)**

| Fichier | Lignes | Rôle |
|---|---|---|
| `sponsors.js` | 1 153 | Affichage **et** mesure de visibilité des partenaires. Chargé par la page publique, le dossier club et l'admin |

**L'administration (14)** — `admin.js` a été découpé au fil du temps ; chaque fichier porte une zone de l'écran

| Fichier | Lignes | Rôle |
|---|---|---|
| `admin.js` | 811 | Le noyau : chargement, navigation, orchestration des autres |
| `admin-tableau-bord.js` | 356 | Le récapitulatif d'état et le fil « Où en suis-je ? » |
| `admin-equipes.js` | 389 | Les équipes : liste, ajout, suppression |
| `admin-reglages.js` | 756 | Les horaires et les catégories |
| `admin-generation.js` | 742 | La génération des poules et du planning, et l'assistant d'arbitrage |
| `admin-terrains.js` | 1 601 | Le découpage géométrique des grands terrains en mini-terrains |
| `admin-invitations.js` | 1 874 | **Le plus gros fichier du frontend** : tout le sous-système d'invitation et de clubs invités |
| `admin-infos-publication.js` | 660 | Les contenus publics du tournoi et la publication |
| `admin-conformite-ffr.js` | 905 | La conformité FFR — **informative, n'empêche jamais de sauvegarder** |
| `admin-autorisation.js` | 1 011 | La demande d'autorisation FFR et sa feuille de report |
| `admin-feuille-jour.js` | 339 | La feuille de fin de journée |
| `admin-sponsors.js` | 1 126 | L'écran Partenaires |
| `ecrans.js` | 446 | Le mode « écrans » : sur ordinateur (≥ 1024 px), la longue page devient une interface à onglets |
| `assistant.js` | 530 | La présentation guidée de la page admin, section par section |

> 📐 **26 fichiers au total** : 5 + 3 + 3 + 1 + 14 = 26.

---

## 4. Les bibliothèques extérieures

Quatre bibliothèques sont **hébergées dans le dépôt** plutôt que chargées depuis Internet — un choix
prudent : aucune adresse extérieure n'est appelée depuis le téléphone d'un spectateur.

Leur inventaire — nom, version, origine, date d'entrée, empreinte, licence — est dans
**[`dependances-externes.md`](dependances-externes.md)**.

---

## 5. Pourquoi ce choix d'architecture ?

- **Zéro serveur à gérer** : Google héberge le Sheet et le script gratuitement ;
- **simple pour un débutant** : pas de base SQL, pas de déploiement complexe ;
- **séparation claire** : les données (Sheet), la logique (Apps Script), l'affichage (frontend) sont
  indépendants et évoluent un par un.

---

## 6. Montée en charge et concurrence

### Concurrence des écritures

Plusieurs personnes saisissent des scores en même temps (un marqueur par terrain). Les écritures
sont **sérialisées par un verrou** (`LockService` autour de `doPost`) : deux validations simultanées
ne peuvent plus se télescoper.

### Trafic de lecture

Deux charges à distinguer :

- **écriture** (réglages, scores) → peu d'utilisateurs, ponctuel : Apps Script encaisse ;
- **lecture publique** → **le point critique**, car Apps Script (compte Gmail) plafonne à
  ~**30 exécutions simultanées**.

> 📏 **Ce qui est mesuré** : une lecture occupe le serveur **1,65 s**, alors qu'un `ping`, qui
> n'exécute rien, en occupe déjà **1,59 s**. Le cache est donc excellent, mais le **temps de
> démarrage est incompressible**. Sur cette base, la capacité réelle est estimée à **150–300
> spectateurs simultanés**.
>
> ⚠️ **Le nombre réel de spectateurs n'est pas connu**, et aucun chiffre n'est avancé ici : c'est
> une **question ouverte** (**I-19** du chantier d'industrialisation), qui relève de la connaissance
> du terrain et non d'une mesure technique.

**Ce qui est en place, gratuitement :**

- **cache serveur** (`CacheService`) sur `getAll` (~10 s) — un seul appel relit le Sheet par tranche,
  rafraîchi à chaque écriture ;
- **réponse sans ouvrir le Sheet** quand le cache est chaud (~0,5 s économisé par requête) ;
- **anti-pointe à l'expiration du cache** : un seul « reconstructeur » relit le Sheet, les autres
  reçoivent une copie de secours — jamais de vague de relectures simultanées ;
- **étalement (jitter)** côté navigateur : rafraîchissement ~15 s avec décalage aléatoire ;
- **pause en arrière-plan** : un téléphone verrouillé **cesse d'appeler** le serveur ;
- **délai maximum par requête** (~12 s) : une connexion mobile qui « pend » est abandonnée.

**Solution de secours (dormante)** : un **relais CDN Cloudflare**
(`cloudflare/worker-tournoi.js`) vers lequel Apps Script pousse un instantané à chaque écriture.
Détails et activation : [`relais-cdn.md`](relais-cdn.md).

---

## 7. 📐 Comment les comptes de ce document ont été établis

> **Pourquoi cette section existe.** Un chiffre sans sa méthode ne peut pas être revérifié — et un
> chiffre qu'on ne peut pas revérifier finit par être recopié faux. C'est arrivé sur ce projet
> (leçon **M-06**). Chaque compte ci-dessous est donc **reproductible**.

**Relevé du 2026-08-09**, sur le dépôt à cette date.

| Compte | Résultat | Comment le refaire |
|---|---|---|
| **Actions du serveur** | **65** | Les `case '…'` des **trois** `switch` d'aiguillage de `doGet`/`doPost` = **61** *(en excluant les 6 `case` de tours — `FINALE`, `DEMI_FINALE`, `PETITE_FINALE`, `QUART_DE_FINALE`, `HUITIEME_DE_FINALE`, `SEIZIEME_DE_FINALE` — qui appartiennent à un `switch` de libellés, pas d'actions)*, **plus les 4 traitées par un `if`** avant les `switch` : `ping`, `getAll`, `getRefFFR` *(dans `doGet`)* et `mesureSponsors` *(dans `doPost`)*. **61 + 4 = 65** |
| **Répartition par accès** | **13 / 4 / 1 / 47** | Lecture des trois tables en tête de `doPost` : `ACTIONS_SCORES` *(1 : `enregistrerScore`)*, `ACTIONS_TOKEN` *(1 : `repondreInvitation`)*, `ACTIONS_LECTURE` *(4)*. **Public** = les 3 actions `if` de `doGet` + `mesureSponsors` + les 12 `case` de `doGet` **moins** les 3 qui valident un jeton en interne *(`getClubDossier`, `getConfigClub`, `getReponseInvitation`)* → **3 + 1 + 9 = 13**. **Jeton** = ces 3 + `repondreInvitation` → **4**. **ADMIN** = les 4 lectures authentifiées + les 45 `case` du `switch` d'écriture **moins** `enregistrerScore` et `repondreInvitation` → **4 + 43 = 47** |
| **Répartition par groupe (§2.2)** | 12 · 4 · 5 · 4 · 5 · 5 · 1 · 8 · 15 · 5 · 1 | Somme des tableaux A → K : **12+4+5+4+5+5+1+8+15+5+1 = 65**. Les deux découpages — par accès et par groupe — tombent sur le même total par deux chemins différents |
| **Pages** | **8** | Les fichiers `frontend/*.html` |
| **Fichiers JavaScript** | **26** | Les fichiers `frontend/js/*.js` — **le sous-dossier `js/vendor/` n'est pas compté** : ce sont des bibliothèques extérieures, inventoriées séparément |
| **Lignes par fichier** | *voir tableaux* | `wc -l` sur chaque fichier |
| **Scripts chargés par page** | *voir §3* | Les balises `<script src="js/…">` de chaque page HTML |
| **Onglets du classeur** | **12** *(8 de travail + 4 de référence)* | ⚠️ **Compter les `getSheetByName('…')` ne suffit pas** — c'est ainsi qu'un compte de 8 a d'abord été obtenu, à tort. Les 4 onglets `RefFFR_*` sont lus par `lireOngletSimple(classeur, '…')`, sans passer par `getSheetByName`. **La méthode juste réunit quatre sources** : `getSheetByName('…')`, `lireOngletSimple(classeur, '…')`, `creerOngletAvecEntetes(classeur, '…')` et `insertSheet('…')`, puis déduplique. Recoupé avec `deploiement.md`, qui documentait déjà les 4 onglets `RefFFR_*` |
| **Bibliothèques extérieures** | **4** | Les fichiers `frontend/js/vendor/*.js` |

> ℹ️ **Ces comptes portent sur ce que le code nomme.** Un onglet ajouté à la main dans un classeur
> réel, sans passer par le code, n'y figurerait pas.

> 🎯 **La leçon de ce document, et elle vaut plus que ses chiffres.** Le compte des onglets a
> d'abord été établi à **8**, par une méthode qui semblait raisonnable — chercher les
> `getSheetByName`. Elle était **incomplète**, et le contrôle croisé entre documents l'a révélé :
> `deploiement.md` mentionnait 4 onglets que le compte ignorait. **Un chiffre juste ne prouve pas
> une méthode juste ; seule une méthode écrite peut être prise en défaut.** C'est exactement à ça
> que sert ce §7.

---

## 8. Où trouver le reste

| Question | Document |
|---|---|
| Quelles colonnes dans chaque onglet ? | [`structure-google-sheet.md`](structure-google-sheet.md) |
| Comment redéployer le serveur ? | [`deploiement.md`](deploiement.md) |
| Quelles bibliothèques extérieures ? | [`dependances-externes.md`](dependances-externes.md) |
| Combien de temps garde-t-on les données ? | [`conservation-donnees.md`](conservation-donnees.md) |
| Que dit-on aux gens sur leurs données ? | [`textes-information-donnees.md`](textes-information-donnees.md) |
| Comment activer le relais anti-affluence ? | [`relais-cdn.md`](relais-cdn.md) |
| Comment reprendre le projet de zéro ? | [`passation.md`](passation.md) |
| Où en est le chantier d'industrialisation ? | [`industrialisation/ETAT.md`](industrialisation/ETAT.md) |
