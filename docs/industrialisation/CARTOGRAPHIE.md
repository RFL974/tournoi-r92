# CARTOGRAPHIE — Tournoi R92

> **À quoi sert ce document ?**
> À comprendre **comment l'application est faite**, avant de chercher ce qui ne va pas.
> C'est l'ÉTAPE 1 du plan (`CLAUDE.md` §7). **Aucun fichier de l'application n'est modifié ici.**
>
> Le document est construit **par volets**, sur plusieurs sessions, parce que le projet est gros
> (plus de 11 000 lignes rien que pour le serveur).

**Dernière mise à jour** : 2026-08-04 (session 4)

| Volet | Contenu | Statut |
|---|---|---|
| **A — Le squelette** | Les morceaux qui composent l'application, où ils tournent, comment ils se parlent, comment le code arrive en ligne | ✅ **FAIT** (session 2) |
| **B — Les fonctionnalités** | Ce que l'application sait faire, écran par écran, du premier clic au tournoi terminé | ✅ **FAIT** (session 3) |
| **C — Les données** | Ce qui est stocké, où, combien de temps, et ce qui relève de la vie privée | ✅ **FAIT** (session 4) |

> ✅ **La cartographie (ÉTAPE 1) est terminée.** La suite est l'ÉTAPE 2 — l'audit.

---

# VOLET A — LE SQUELETTE

## A.1 — L'image d'ensemble, en une phrase

Tournoi R92 n'est **pas un logiciel installé sur un ordinateur**. C'est un **assemblage de services
Google gratuits** (un tableur, un petit programme, un espace de fichiers) auquel on a ajouté des
**pages web publiques hébergées par GitHub**.

Autrement dit : il n'y a **aucun serveur loué**, **aucune base de données classique**, et **aucune
facture d'hébergement**. Tout repose sur des comptes gratuits.

> C'est un choix qui a de vraies qualités (coût nul, rien à administrer) et de vraies limites. Les
> limites seront chiffrées à l'ÉTAPE 2 ; ici on se contente de **décrire**.

---

## A.2 — Les 6 morceaux de l'application

Voici les 6 endroits où « quelque chose » se passe. Aucun n'est optionnel sauf le n°6.

```
        [ TÉLÉPHONE / ORDINATEUR de l'utilisateur ]
                          │
                          │  (1) télécharge les pages
                          ▼
        ┌─────────────────────────────────────────┐
        │  1. GITHUB PAGES — les pages web        │
        │     rfl974.github.io/tournoi-r92/…      │
        │     8 pages HTML + 26 fichiers JS       │
        │     PUBLIC : aucun mot de passe ici     │
        └─────────────────────────────────────────┘
                          │
                          │  (2) demandes en JSON, une seule adresse
                          │      script.google.com/…/exec
                          ▼
        ┌─────────────────────────────────────────┐         ┌──────────────────────┐
        │  2. GOOGLE APPS SCRIPT — le cerveau     │────────▶│ 6. RELAIS CLOUDFLARE │
        │     1 fichier Code.gs (8 030 lignes)    │  (6)    │    (DÉSACTIVÉ)       │
        │     doGet = lire · doPost = écrire      │         └──────────────────────┘
        └─────────────────────────────────────────┘
                │              │               │
         (3)    │        (4)   │        (5)    │
                ▼              ▼               ▼
    ┌────────────────┐  ┌────────────┐  ┌──────────────┐
    │ 3. GOOGLE      │  │ 4. GOOGLE  │  │ 5. GMAIL     │
    │    SHEET       │  │    DRIVE   │  │  (envoi de   │
    │  (le classeur) │  │ (affiche,  │  │   courriels  │
    │  jusqu'à       │  │  logos,    │  │   aux clubs) │
    │  12 onglets    │  │  photos)   │  │              │
    └────────────────┘  └────────────┘  └──────────────┘
```

### 1. GitHub Pages — les pages web *(la vitrine et les guichets)*

**Ce que c'est** : les fichiers `frontend/` du dépôt, publiés tels quels à l'adresse
`https://rfl974.github.io/tournoi-r92/`.

**Point important** : ces pages sont **publiques, toutes, sans exception**. `admin.html` et
`saisie.html` sont téléchargeables par n'importe qui, comme la page publique. Ce qui les protège
n'est **pas** l'accès à la page, c'est le fait que le **serveur refuse d'écrire** sans la bonne clé.

> **Analogie** : la porte de la salle de contrôle du stade n'est pas fermée à clé — mais la machine
> qui change le tableau d'affichage, elle, demande un code. On peut entrer et regarder ; on ne peut
> pas toucher.

### 2. Google Apps Script — le cerveau *(le serveur)*

**Ce que c'est** : un programme qui tourne **chez Google**, rattaché au classeur. Il est publié en
« application web » : une adresse unique qui se termine par `/exec`.

C'est **le seul** à avoir le droit de toucher aux données. Les pages web ne lisent **jamais** le
classeur directement.

**Sa taille** : `backend/Code.gs` = **8 030 lignes**, **274 fonctions**, dans **un seul fichier**.
Un fichier de tests séparé, `backend/Tests.gs`, fait **3 594 lignes** et **301 fonctions**.

### 3. Google Sheet — la base de données *(le classeur)*

**Ce que c'est** : un tableur Google ordinaire. Chaque onglet est une « table ».

| Onglet | Contient | Créé par |
|---|---|---|
| `Config` | Tous les réglages du tournoi (horaires, catégories, contacts, textes…) | `setupSheet()` |
| `Equipes` | Les équipes engagées | `setupSheet()` |
| `Poules` | Les poules | `setupSheet()` |
| `Matchs` | Le planning **et** les scores | `setupSheet()` |
| `Historique` | Le journal de saison (un match terminé = une ligne, jamais effacée) | `setupSheet()` |
| `ClubsInvites` | Les clubs invités **avec leurs emails de contact** | `setupSheet()` |
| `Sponsors` | Les partenaires affichés sur la page publique | `setupSheet()` |
| `Mesures` | Relevés anonymes de visibilité des partenaires | créé à la demande |
| `RefFFR_Formes`, `RefFFR_Dates`, `RefFFR_Regles`, `RefFFR_Temps` | Le référentiel de la Fédération (catégories, dates autorisées, règles) | **rempli à la main** |

**Un point à retenir** : les 4 onglets `RefFFR_*` ne sont créés par aucun code. Le programme les lit
en se protégeant : s'ils sont absents, il renvoie une liste vide plutôt que de planter.

### 4. Google Drive — les images

L'affiche du tournoi, les logos des partenaires et la photo du parking sont **déposés dans le Drive
du compte Google**, puis **rendus publics en lecture** (« toute personne disposant du lien »). Le
classeur ne garde que l'identifiant du fichier.

### 5. Gmail — les envois aux clubs

Le programme envoie de vrais courriels (invitations, dossiers, feuilles de match) **depuis le compte
Google du propriétaire**. Il utilise `GmailApp` quand c'est possible, `MailApp` sinon.

### 6. Le relais Cloudflare — **actuellement éteint**

Un dispositif prévu pour encaisser des milliers de spectateurs. Le code existe
(`cloudflare/worker-tournoi.js`), mais dans `frontend/js/config.js` la ligne `SNAPSHOT_URL = ""`
est **vide** → **le relais n'est pas utilisé aujourd'hui**. *(CERTAIN, constaté dans le fichier.)*

---

## A.3 — Comment les morceaux se parlent : **une seule porte**

C'est le point le plus important du squelette, et le plus simple à retenir.

**Toute la communication entre les pages web et le serveur passe par UNE SEULE adresse.** Ce qui
change d'une demande à l'autre, c'est un mot : le paramètre `action`.

```
LECTURE (doGet)                          ÉCRITURE (doPost)
────────────────                          ─────────────────
.../exec?action=getAll                   POST vers .../exec
.../exec?action=getMatchs                corps : { "action": "enregistrerScore",
.../exec?action=getClassement                      "id_match": "M12",
                                                   "score_A": 15, "score_B": 10,
15 actions de lecture                              "cle": "……" }

                                          50 actions d'écriture (ou de lecture protégée)
```

Deux fonctions dans `Code.gs` font le tri :

- **`doGet`** (ligne 313) — les **lectures**. **Aucune clé n'est demandée.** Ouvert à tous.
- **`doPost`** (ligne 2801) — les **écritures**. Une clé est exigée, sauf trois exceptions décrites
  plus bas.

Côté pages web, **un seul fichier** sait parler au serveur : `frontend/js/api.js`. Toutes les autres
pages passent par lui. C'est une bonne chose : il y a **un seul endroit** à regarder pour comprendre
(ou corriger) la façon dont les demandes partent.

### Le détail qui explique un choix bizarre du code

`api.js` envoie ses écritures en `text/plain` alors que ce sont des données JSON. Ce n'est pas une
erreur : Apps Script ne sait pas répondre à la question préalable que le navigateur poserait
autrement (le « contrôle préalable » de sécurité entre sites). Déclarer `text/plain` évite cette
question. **C'est une contrainte de Google, pas un choix de style.**

---

## A.4 — Qui a le droit de quoi

Il y a **trois** systèmes de contrôle d'accès différents, qui coexistent.

| # | Mécanisme | Protège quoi | Où est le secret |
|---|---|---|---|
| 1 | **Clé ADMIN** (`CLE_ADMIN`) | ~44 actions : équipes, réglages, génération, invitations, partenaires, réinitialisation | Propriétés du script, **chez Google** |
| 2 | **Clé SCORES** (`CLE_SCORES`) | **1 seule action** : `enregistrerScore` | Propriétés du script, **chez Google** |
| 3 | **Jeton de club** (`club_token`) | La page où un club répond à son invitation, et son dossier | Colonne du classeur, envoyée dans le lien du courriel |

**Ce qu'il faut comprendre sur les clés** : ce sont deux **mots de passe partagés**, pas des comptes
personnels. Il n'y a **aucune notion d'utilisateur** dans l'application : personne n'a de compte,
personne ne « se connecte » à son nom. Qui connaît la clé admin **est** l'administrateur.

Côté navigateur, la clé saisie est rangée dans le `sessionStorage` — un tiroir vidé à la fermeture de
l'onglet. Elle est donc redemandée à chaque nouvelle ouverture. *(CERTAIN, `api.js` lignes 118-128.)*

Trois garde-fous existent déjà côté serveur *(CERTAIN, constaté)* :
- une clé doit faire **au moins 12 caractères** pour être enregistrée ;
- au-delà de **~30 essais ratés en 5 minutes**, les mauvaises clés sont refusées un moment (une
  **bonne** clé passe toujours — le marqueur n'est jamais bloqué) ;
- les messages d'erreur inattendus sont **génériques**, pour ne pas raconter l'intérieur du système.

### Les trois exceptions de `doPost`

`doPost` n'est pas un couloir unique. Il y a trois sorties avant le couloir principal :

1. **`mesureSponsors`** — la **seule écriture publique, sans aucune clé**. Ce sont les téléphones
   des spectateurs qui déposent des compteurs de visibilité des partenaires. Elle est traitée
   **avant** tout le reste et n'écrit que dans l'onglet isolé `Mesures`.
2. **`repondreInvitation`** — protégée par le **jeton du club**, pas par une clé.
3. **Quatre « lectures déguisées en écritures »** (`getConfigAdmin`, `getDossierAutorisation`,
   `listerSponsors`, `lireMesuresSponsors`) — elles passent par `doPost` **uniquement** pour exiger
   la clé admin, car une adresse de lecture laisserait la clé traîner dans l'historique du
   navigateur. Elles ne modifient rien.

---

## A.5 — Le trajet d'un score, de bout en bout

C'est **le flux critique** de l'application : c'est lui qui tourne le jour du tournoi, sous pression.

```
 ① Le marqueur ouvre saisie.html sur son téléphone
      │  (page publique — juste du HTML)
      ▼
 ② Il saisit 15-10 et valide
      │  saisie.js → apiPostProtege('enregistrerScore', …, 'scores')
      │  la clé SCORES est ajoutée automatiquement à l'envoi
      ▼
 ③ doPost reçoit la demande
      │  ├─ vérifie la clé SCORES
      │  ├─ prend un VERROU (20 s max d'attente)
      │  │    → si un autre marqueur écrit au même instant, celui-ci attend son tour
      │  ├─ écrit dans l'onglet Matchs
      │  ├─ ajoute une ligne dans Historique
      │  └─ RECONSTRUIT l'instantané public, puis relâche le verrou
      ▼
 ④ Le classeur Google contient le nouveau score
      │
      ▼
 ⑤ La page publique tournoi.html demande getAll toutes les ~15 s
      │  (avec un décalage aléatoire pour que tout le monde n'appelle pas en même temps)
      ▼
 ⑥ Le spectateur voit le nouveau score — au pire ~10 s après
```

### Deux mécanismes de protection déjà en place

**Le verrou** *(`LockService`)* : imaginez une seule clé pour entrer dans le local des scores. Deux
marqueurs qui valident à la même seconde ne peuvent pas écrire en même temps ; le second attend
(jusqu'à 20 secondes) puis entre. Sans cela, deux écritures simultanées pourraient s'écraser.

**Le cache** *(la copie de secours)* : le programme garde en mémoire, pendant ~10 secondes, une copie
toute prête de « tout le tournoi ». Quand 500 spectateurs demandent l'affichage en même temps, **un
seul** relit vraiment le classeur ; les 499 autres reçoivent la copie. Cela répond en quelques
millisecondes au lieu de ~0,5 seconde.

Le cache est **refait à chaque écriture** : un score validé est donc visible tout de suite, pas au
bout de 10 secondes.

---

## A.6 — Les pages web, une par une

| Page | Pour qui | Protégée ? | Fichiers JS chargés |
|---|---|---|---|
| `index.html` | — | — | redirige vers `tournoi.html` |
| `tournoi.html` | **Le public** (spectateurs, parents) | Non | 6 |
| `saisie.html` | Les **marqueurs** au bord du terrain | Clé SCORES à l'écriture | 5 |
| `admin.html` | **L'organisateur** | Clé ADMIN à l'écriture | **20** |
| `perfs.html` | Interne Racing 92 | Non (page non liée) | 5 |
| `invitation-club.html` | Un club invité (phase 1) | Lien seul | 5 |
| `reponse-invitation.html` | Un club qui répond | **Jeton de club** | 5 |
| `dossier-club.html` | Un club ayant accepté (phase 2) | **Jeton de club** | 7 |

### Le cas `admin.html`

C'est le morceau le plus lourd du frontend : **20 fichiers JavaScript** chargés d'un coup, pour
**14 écrans** (infos, horaires, catégories, invitation, dossier, équipes, terrains, poules,
autorisation, publication, partenaires, après-midi, feuille du jour, réinitialisation).

Le découpage suit ces écrans : `admin-equipes.js`, `admin-terrains.js`, `admin-invitations.js`…
C'est **lisible** : on sait où chercher. Deux fichiers dépassent largement les autres —
`admin-invitations.js` (104 Ko) et `admin-terrains.js` (87 Ko).

---

## A.7 — Comment le code est organisé (et une chose à savoir)

### Il n'y a **aucun outil de construction**

Pas de `package.json`, pas de dépendances à installer, pas d'étape de compilation. Les fichiers
écrits sont **exactement** ceux qui partent en ligne.

**Conséquence pratique** : c'est simple, et c'est aussi la raison pour laquelle rien ne peut vérifier
automatiquement le code avant sa publication. Un fichier JavaScript cassé part en ligne cassé.
*(CERTAIN.)*

Quatre bibliothèques extérieures sont **recopiées dans le dépôt** (`frontend/js/vendor/`) plutôt que
téléchargées : `pdf-lib` (513 Ko), `docxtemplater`, `pizzip`, `qrcode`. C'est un choix **prudent** :
aucune dépendance à un site tiers le jour J.

### Tout le JavaScript vit dans **un seul espace commun**

Les 26 fichiers du frontend définissent **693 fonctions**, et **toutes** sont visibles par toutes les
autres. Il n'y a pas de « boîtes » séparées : quand une page charge 20 fichiers, ils se retrouvent
tous dans la même pièce.

> **Analogie** : au lieu de 20 classeurs étiquetés, on a 693 feuilles posées sur une même table. On
> les retrouve toutes, mais rien n'empêche deux feuilles de porter le même titre.

**Ce que ça donne aujourd'hui** — j'ai vérifié : **8 noms de fonctions sont utilisés deux ou trois
fois** dans le projet (`charger`, `basculer`, `nomEquipe`, `carteMatch`, `estPublie`, `majHeure`,
`categoriesPresentes`, `urlAffiche`).

**Et aujourd'hui, ce n'est PAS un problème** : à chaque fois, les fichiers concernés ne sont **jamais
chargés par la même page**. Par exemple `nomEquipe` existe dans `perfs.js`, `saisie.js` et
`tournoi.js` — trois pages différentes, qui ne se croisent jamais. *(CERTAIN, vérifié page par page.)*

**Ce qu'il faut en retenir** : le risque est **latent, pas actif**. Le jour où une page chargerait
deux de ces fichiers, la deuxième définition écraserait silencieusement la première — sans message
d'erreur. À noter pour le domaine G (architecture) de l'ÉTAPE 2 ; **rien à corriger aujourd'hui**.

---

## A.8 — Comment le code arrive en ligne : **deux chemins très différents**

C'est probablement le point le plus important de tout ce volet.

### Le frontend : automatique ✅

```
Romain (ou Claude) pousse sur main
        │
        ▼
GitHub Action « pages.yml » se déclenche toute seule
   (uniquement si frontend/** a changé)
        │
        ▼
Les pages sont en ligne en quelques minutes
```

Le dépôt **est** la vérité pour les pages web. Ce qui est dans `frontend/` sur `main` est ce que
voient les utilisateurs.

### Le backend : **manuel, par copier-coller** ⚠️

```
Romain modifie backend/Code.gs dans le dépôt
        │
        ▼
   … rien ne se passe …
        │
        ▼
Il doit OUVRIR l'éditeur Apps Script, COLLER le code,
puis « Gérer les déploiements → Modifier → Nouvelle version »
```

**Conséquence directe et permanente** : rien ne garantit que le code du dépôt soit celui qui tourne
réellement. C'est le point **I-01** déjà noté dans `ETAT.md`, et cette cartographie le **confirme
comme structurel** : ce n'est pas un oubli ponctuel, c'est la façon dont le projet fonctionne.

> **Analogie** : le dépôt Git est le cahier de recettes. La cuisine, elle, est chez Google. Modifier
> la recette dans le cahier ne change rien au plat servi tant que personne n'est allé la recopier en
> cuisine.

**Statut** : **INCONNU** — impossible à vérifier depuis le dépôt. Seul Romain peut le lever, en
ouvrant l'éditeur Apps Script et en comparant.

### Une conséquence à ne pas manquer

Le fichier `backend/Tests.gs` contient **301 fonctions de test**. Elles ne peuvent s'exécuter **que
dans Apps Script**, à la main. Il n'existe **aucun moyen** de les lancer depuis cet ordinateur, ni
automatiquement avant une publication. *(CERTAIN.)*

---

## A.9 — Les secrets : où sont-ils, et où ne sont-ils pas

| Élément | Où il est | Dans le dépôt public ? |
|---|---|---|
| Clé ADMIN | Propriétés du script, chez Google | ❌ Non |
| Clé SCORES | Propriétés du script, chez Google | ❌ Non |
| Clé du relais CDN | Propriétés du script, chez Google | ❌ Non |
| **Adresse du serveur** (`API_URL`) | `frontend/js/config.js` | ✅ **Oui** — inévitable, le navigateur doit la connaître |
| **Identifiant du classeur** (`SHEET_ID_DEFAUT`) | `backend/Code.gs` ligne 15 | ✅ **Oui** |
| **Jetons des clubs** | Colonne `club_token` du classeur | ❌ Non (mais voyagent dans les liens des courriels) |

Les deux clés ne sont **pas** dans le dépôt — c'est **correct** et c'est à souligner.

L'identifiant du classeur, lui, est visible dans le dépôt public. Le `README` du backend en tire déjà
la bonne conclusion : **le classeur ne doit jamais être partagé « toute personne disposant du
lien »**, sinon connaître l'identifiant suffirait à tout lire.

**Statut** : ✅ **VÉRIFIÉ — le classeur est PRIVÉ.** Romain a fourni le 2026-08-04 une capture du
panneau Drive de « Tournoi R92 - Base de données » : *Qui a accès → **Privé***. L'identifiant public
dans le dépôt **n'expose donc rien** : le connaître ne permet pas d'ouvrir le fichier.

Cela éclaire au passage un point du montage : la Web App est déployée avec « Exécuter en tant que :
Moi ». Le programme lit donc le classeur **avec l'identité du propriétaire**. C'est exactement ce qui
permet à un spectateur qui n'a aucun accès au classeur de voir malgré tout les scores : il ne lit pas
le classeur, il lit ce que le programme veut bien lui répondre.

> **Analogie** : le classeur est un dossier rangé dans un bureau fermé. Le public ne peut pas entrer.
> Mais un employé (le programme) y a accès et vient annoncer les résultats au guichet. Le public
> obtient l'information sans jamais approcher du dossier.

---

## A.10 — Points d'attention repérés pendant la cartographie

> ⚠️ **Ce ne sont PAS des conclusions d'audit.** Aucun n'est classé P0/P1/P2/P3 : la classification
> est le travail de l'ÉTAPE 2. Ce sont des **choses vues en chemin**, notées pour ne pas les perdre.

| Réf | Ce qui a été remarqué | Domaine concerné (étape 2) | Certitude |
|---|---|---|---|
| A-01 | Le backend est **un seul fichier de 8 030 lignes** | G — architecture | CERTAIN |
| A-02 | La publication du backend est **manuelle** : le dépôt peut différer de ce qui tourne | G / D | CERTAIN |
| A-03 | Les 301 tests existants **ne peuvent pas être lancés automatiquement** | D — tests | CERTAIN |
| A-04 | Il n'y a **aucune vérification automatique** avant publication du frontend | D / G | CERTAIN |
| A-05 | Les clés sont des **mots de passe partagés**, sans notion de personne : impossible de savoir *qui* a fait quoi | C — sécurité | CERTAIN |
| A-06 | `mesureSponsors` est une **écriture publique sans clé** | C — sécurité | CERTAIN |
| A-07 | 8 noms de fonctions en double dans le frontend — **sans effet aujourd'hui**, mais rien ne l'empêche demain | G / H | CERTAIN |
| A-08 | Les images sont déposées sur Drive et **rendues publiques en lecture** | B — RGPD / C | CERTAIN |
| A-09 | L'onglet `ClubsInvites` contient des **emails** ; il est exclu des données publiques et protégé par la clé admin | B — RGPD | CERTAIN (mécanisme constaté, efficacité non testée) |
| A-10 | Les jetons des clubs **voyagent dans des liens envoyés par courriel** | B / C | CERTAIN |
| A-11 | Le relais CDN existe mais est **éteint** (`SNAPSHOT_URL = ""`) : en cas d'affluence, tout repose sur Apps Script | F — performance | CERTAIN |
| A-12 | Les onglets `RefFFR_*` sont **remplis à la main** et ne sont créés par aucun code ; s'ils manquent ou si leur nom diffère d'un caractère, le programme renvoie une liste vide **sans le signaler**. *(Les 4 onglets sont bien présents et correctement nommés — vérifié le 2026-08-04. Le constat porte sur l'absence de signalement, pas sur un manque actuel.)* | A — métier / H | CERTAIN |
| A-14 | Le classeur ne contient **aucune donnée personnelle de tiers aujourd'hui** (seuls emails présents : ceux de Romain et de son épouse, pour tester les envois). Mais l'application **est conçue pour en collecter** : la première invitation réelle y fera entrer les coordonnées de contacts de clubs. Sujet à préparer **avant** ce jour-là, pas à réparer après | B — RGPD | CERTAIN (précisé par Romain le 2026-08-04) |
| A-13 | ~~Le partage réel du Google Sheet n'est pas vérifiable ici~~ → ✅ **levé le 2026-08-04 : le classeur est privé** (capture Drive fournie par Romain). Reste un constat de dépendance : la sécurité des données repose entièrement sur ce réglage, qui vit **chez Google** et qu'aucun code ne protège d'un changement accidentel | C — sécurité | **CERTAIN** |

---

## A.11 — Ce que ce volet ne dit PAS

Pour rester honnête sur les limites de ce document :

- ❌ **Il ne dit pas si l'application fonctionne bien.** Rien n'a été exécuté, rien n'a été testé.
- ❌ **Il ne décrit pas les fonctionnalités** (comment se génère une poule, comment se calcule un
  classement) → volet B.
- ❌ **Il ne détaille pas les données stockées** ni leur durée de conservation → volet C.
- ❌ **Il ne porte aucun jugement** sur la qualité, la sécurité ou la performance → ÉTAPE 2.
- ❌ **Il ne dit rien du code réellement en service chez Google** → **INCONNU** (I-01).

---

## A.12 — Le résumé qu'il faut retenir

1. **Une seule porte.** Toutes les pages parlent au serveur par **une seule adresse**, en changeant
   juste le mot `action`. Si cette porte tombe, **tout** tombe.
2. **Le classeur est la base de données.** Il n'y a rien d'autre. Ce qui est écrit dedans est la
   vérité de l'application.
3. **Deux mots de passe partagés**, pas de comptes. Qui a la clé admin peut tout faire.
4. **Toutes les pages sont publiques**, y compris l'administration. Ce qui protège, c'est le refus
   d'écriture côté serveur, jamais l'accès à la page.
5. **Les pages web se publient toutes seules ; le serveur, non.** C'est la principale faiblesse de
   structure repérée : elle rend impossible, depuis le dépôt, d'affirmer ce qui tourne vraiment.
6. **Aucun filet automatique.** Pas de vérification avant publication, pas de tests exécutables ici.

---

# VOLET B — LES FONCTIONNALITÉS

> **Ce que fait ce volet** : parcourir ce que l'application **sait faire**, du tout premier réglage
> jusqu'au tournoi terminé. **Aucun fichier de l'application n'a été modifié.**
>
> **Ce qu'il ne fait pas** : juger. Il n'y a ici **aucun** P0/P1/P2/P3 — c'est le travail de
> l'ÉTAPE 2. Les choses vues en chemin sont notées en §B.12, comme au volet A.

**Écrit en session 3 (2026-08-04).**

---

## B.1 — L'application en une phrase

Tournoi R92 accompagne **une journée de tournoi de rugby École de Rugby**, de bout en bout :
inviter les clubs → recueillir leurs engagements → régler la journée → tirer les poules et
fabriquer le planning → saisir les scores sur le terrain → afficher les résultats au public →
envoyer le bilan.

Ce n'est donc **pas** un simple tableau d'affichage. C'est un **outil d'organisation** dont
l'affichage public n'est que la partie visible.

---

## B.2 — La ligne de vie d'un tournoi

Voici l'ordre réel des choses. Chaque étape est réalisée dans l'application ; aucune n'est
optionnelle sauf celles marquées « libre ».

```
     AVANT LE JOUR J                                       LE JOUR J
     ───────────────                                       ─────────
 ①  Infos du tournoi (nom, date, lieu, affiche)        ⑨  Saisie des scores du matin
        │                                                      │  (saisie.html, au bord du terrain)
 ②  Horaires de la journée                                     ▼
        │                                              ⑩  Génération de l'APRÈS-MIDI
 ③  Catégories (U8, U10, …) + normes FFR                   (exige TOUS les scores du matin)
        │                                                      │
 ④  Invitation des clubs (phase 1)  ──── libre ────────┐       ▼
        │   les clubs répondent eux-mêmes              │  ⑪  Saisie des scores de l'après-midi
        ▼                                              │       │
 ⑤  Dossier complet aux clubs acceptés (phase 2) ─ libre┤       ▼
        │   → crée automatiquement leurs équipes       │  ⑫  Feuille de fin de journée
        ▼                                              │       (PDF + envoi aux clubs)
 ⑥  Équipes (complétées / corrigées à la main)         │
        │                                              │   EN CONTINU
 ⑦  Terrains (découpage des grands terrains)           │   ─────────
        │                                              │   Page publique des scores
 ⑧  POULES + PLANNING (le tirage)                      │   (rafraîchie toute seule)
        │                                              │
        ├── Demande d'autorisation FFR ──── libre ─────┤
        │                                              │
        └── PUBLICATION (rendre visible au public) ────┘
```

Deux étapes sont **des interrupteurs séparés**, et c'est important :

- **« Publier le tournoi »** (`tournoi_publie`) → allume la page publique des scores ;
- **« Montrer le planning aux clubs »** (`planning_visible_clubs`) → autorise chaque club à voir
  ses poules et ses matchs dans **son** dossier.

Le second est **remis à « non » automatiquement** à chaque génération ou réorganisation des poules.
Autrement dit : on ne peut pas montrer un planning aux clubs **par oubli**, seulement **par
décision**. *(CERTAIN.)*

---

## B.3 — Ce que sait faire le serveur : les 65 actions

Rappel du volet A : tout passe par une seule adresse, et c'est le mot `action` qui change.
Voici **ce que chaque mot déclenche**, regroupé par sujet.

### Les 15 lectures (`doGet`) — **ouvertes à tous, sans clé**

| Action | Ce qu'elle renvoie |
|---|---|
| `ping` | « je suis en ligne » (aucune donnée) |
| `getAll` | **L'instantané public** : réglages filtrés + équipes + poules + matchs + partenaires actifs |
| `getConfig` | Les réglages, filtrés « vue invitation » |
| `getEquipes` / `getPoules` / `getMatchs` | Le contenu brut de ces trois onglets |
| `getClassement` | Le classement des poules, calculé côté serveur |
| `getHistorique` | Le journal de saison (tous les matchs archivés) |
| `getRefFFR` | Le référentiel de la Fédération (formes de jeu, dates, règles, temps) |
| `getConformiteFFR` | Le verdict de conformité pour une date + des catégories |
| `datesCompatiblesFFR` | Pour un mois donné, quels jours sont autorisés |
| `getCapacitesCategories` | Le tir au but est-il permis dans cette catégorie ? |
| `getClubDossier`, `getConfigClub`, `getReponseInvitation` | Les données d'**un** club — **exigent son jeton** |

> **Point à retenir** : trois de ces quinze lectures ne sont **pas** vraiment publiques — elles
> demandent le jeton du club. Les douze autres le sont.

### Les 50 écritures (`doPost`) — **clé exigée, sauf 2 exceptions**

| Sujet | Actions | Qui peut |
|---|---|---|
| **Réglages du tournoi** | `enregistrerInfosTournoi`, `enregistrerHoraires`, `enregistrerCategorie`, `supprimerCategorie`, `appliquerValeursFFR`, `enregistrerContactsSecurite`, `enregistrerPlanTerrains` | clé ADMIN |
| **Images** | `enregistrerAffiche`, `supprimerAffiche`, `enregistrerPhotoParking`, `supprimerPhotoParking` | clé ADMIN |
| **Équipes** | `ajouterEquipe`, `modifierEquipe`, `supprimerEquipe`, `supprimerEquipesCategorie` | clé ADMIN |
| **Le tirage et le planning** | `genererPoulesEtPlanning`, `reorganiserPoulesMatin`, `recalculerHoraires`, `genererApresMidi`, `genererDimancheScf` | clé ADMIN |
| **Publication** | `publierTournoi`, `publierPlanningClubs` | clé ADMIN |
| **Clubs invités** | `listerClubsInvites`, `ajouterClubInvite`, `modifierClubInvite`, `supprimerClubInvite`, `modifierStatutClubInvite`, `enregistrerCategoriesEngagees`, `regenererJetonClub`, `creerEquipesClub` | clé ADMIN |
| **Envois de courriels** | `envoyerInvitationClub`, `envoyerInvitationsGroupe`, `envoyerDossierEmail`, `envoyerFeuilleJour` | clé ADMIN |
| **Textes du dossier** | `enregistrerInvitation`, `enregistrerSurPlace`, `enregistrerReponseInvitation` | clé ADMIN |
| **Autorisation FFR** | `enregistrerDossierAutorisation`, `getDossierAutorisation` | clé ADMIN |
| **Partenaires** | `enregistrerReglagesSponsors`, `enregistrerSponsor`, `supprimerSponsor`, `listerSponsors`, `lireMesuresSponsors`, `viderMesuresSponsors` | clé ADMIN |
| **Remise à zéro** | `reinitialiserTournoi` | clé ADMIN |
| **Lecture des réglages** | `getConfigAdmin` | clé ADMIN |
| **🔵 Saisie des scores** | `enregistrerScore` | **clé SCORES** |
| **🟡 Réponse d'un club** | `repondreInvitation` | **jeton du club** |
| **🔴 Relevé de visibilité** | `mesureSponsors` | **personne — public** |

---

## B.4 — Le parcours de préparation : les écrans de l'administration

L'administration présente **le même contenu de deux façons**, choisies automatiquement :

- **sur ordinateur** (écran large) : une **barre latérale** avec un écran par étape ;
- **sur téléphone** : un **assistant** qui montre les cartes **une par une**, avec un bouton
  « Suivant ».

Dans les deux cas, un **verrou** empêche d'avancer tant que l'étape en cours n'est pas complète —
enregistrée, générée ou répartie. Certaines étapes sont marquées **« libres »** : elles ne sont
jamais verrouillées (invitation, dossier, autorisation, partenaires, feuille de journée,
réinitialisation).

> **Détail technique important, expliqué simplement** : ces deux présentations ne réécrivent rien.
> Elles **déplacent physiquement les mêmes blocs** de la page. C'est pourquoi les deux modes
> fonctionnent avec exactement le même code derrière, et pourquoi un bouton « Vue classique »
> remet tout en place. *(CERTAIN.)*

### Les étapes, dans l'ordre

| # | Écran | Ce qu'on y fait | Verrouillable |
|---|---|---|---|
| 1 | **Infos du tournoi** | Nom, date, lieu, adresse, descriptif, affiche. Aperçu en direct de ce que verra le site vitrine | non |
| 2 | **Horaires** | Heure de début, heure de fin (auto ou imposée), battement entre deux matchs sur un terrain, pause déjeuner, heure de rendez-vous | **oui** |
| 3 | **Catégories** | Quelles catégories sont présentes (U8, U10…), durée de mi-temps, récupération, effectifs, nombre de poules (auto ou forcé), **format d'après-midi**, taille de terrain | **oui** |
| 4 | **Inviter un club** | Carnet des clubs, aperçu en direct du courriel, envoi individuel ou groupé, réglages « sur place » et « réponse attendue » | libre |
| 5 | **Dossier complet** | Modalités d'inscription, parking, encadrement, contacts & sécurité, puis envoi du dossier aux clubs qui ont accepté | libre |
| 6 | **Équipes** | Ajout, renommage, suppression — **en complément** des équipes créées automatiquement par les clubs | **oui** |
| 7 | **Terrains** | Déclarer les grands terrains réels, puis les **découper** en mini-terrains et les répartir entre catégories | **oui** |
| 8 | **Poules & planning** | **Le tirage.** Puis modification manuelle des poules, recalcul des horaires, assistant d'arbitrage | **oui** |
| 9 | **Demande d'autorisation** | La feuille de report du formulaire officiel FFR, pré-remplie avec ce que l'application sait déjà | libre |
| 10 | **Publication** | Rendre le tournoi visible au public | non |
| 11 | **Partenaires** | Fiches des partenaires, où et comment ils s'affichent, fiche de visibilité à leur renvoyer | libre |
| 12 | **Après-midi** | Génère la seconde phase, une fois tous les scores du matin saisis | **oui** |
| 13 | **Feuille de journée** | Le bilan chronologique de tous les matchs — à l'écran, en PDF, ou envoyé aux clubs | libre |
| 14 | **Réinitialiser** | Remettre le tournoi à zéro pour l'édition suivante | libre |

### Un mot sur l'écran « Terrains »

C'est le plus inattendu. On ne déclare pas des terrains de match : on déclare les **vrais grands
terrains** du stade (rugby, football), et l'application **calcule combien de mini-terrains y
tiennent** selon la taille de terrain de chaque catégorie, en gardant un couloir de circulation
entre eux. Elle en dessine ensuite un plan.

> **Analogie** : on ne dit pas à l'application « j'ai 12 terrains ». On lui dit « j'ai deux terrains
> de rugby et deux de football », et elle répond « alors tu peux y poser 6 terrains de U8 et 4 de
> U12, voilà où ». *(CERTAIN, `admin-terrains.js`.)*

---

## B.5 — Le parcours des clubs : deux phases, et le club fait lui-même le travail

C'est la partie la plus riche de l'application, et la moins visible.

```
   ORGANISATEUR                          CLUB INVITÉ
   ────────────                          ───────────

 ① Ajoute le club au carnet
   (nom, prénom du contact, email)
   → un JETON unique est créé
        │
 ② « Envoyer l'invitation »
   courriel + affiche jointe                 ③ reçoit le courriel avec DEUX liens :
        │                                       • l'invitation à lire
        │                                       • la page pour RÉPONDRE
        │                                            │
        │                                            ▼
        │                                       ④ Il répond LUI-MÊME :
        │                                          « je viens » + combien d'équipes
        │                                          par catégorie + effectifs
        │                                          … ou « je décline »
        │                                            │
 ⑤ Sa fiche passe en « Accepté »  ◀────────────────┘
   (marquée « à enregistrer »)
        │
 ⑥ « Enregistrer la sélection »
   → LES ÉQUIPES SONT CRÉÉES TOUTES SEULES
     (« MASSY-1 », « MASSY-2 », …)
        │
 ⑦ « Envoyer le dossier complet »              ⑧ reçoit son dossier personnel :
                                                  une page qui VIT — planning, poules,
                                                  contacts, parking, QR code…
```

### Ce qu'il faut retenir

**Le club saisit lui-même son engagement.** L'organisateur ne recopie rien. C'est la fonctionnalité
qui fait gagner le plus de temps, et c'est aussi celle qui fait entrer des **données de tiers** dans
le classeur (voir volet C).

**Les équipes se créent toutes seules.** Un club qui annonce 2 équipes en U8 et 1 en U10 fait
apparaître `MASSY-1`, `MASSY-2` et `MASSY` dans l'onglet Équipes, marquées « auto ».

**Et surtout : l'application ne détruit jamais à l'aveugle.** Quand un club réduit sa participation,
la synchronisation ne retire une équipe que si elle est **libre** — pas encore dans une poule, pas
encore dans un match. Sinon elle **refuse et laisse une alerte** sur la fiche du club, à traiter à
la main. *(CERTAIN, `planifierSyncEquipesClub`.)*

> **Analogie** : l'application range la salle, mais si une chaise a quelqu'un dessus, elle ne la
> retire pas — elle colle un post-it « cette chaise est occupée, vois ce que tu en fais ».

### Le gel des réponses à J-16

**16 jours avant le tournoi**, les réponses des clubs sont **closes** : ni première réponse, ni
modification. Le message renvoyé invite à contacter l'organisateur par courriel.

Ce contrôle est fait **par le serveur**, pas seulement par la page. Le code le dit explicitement :
un verrou posé uniquement sur l'écran serait contournable. *(CERTAIN.)*

### Le dossier du club est une page **vivante**

Le club reçoit un lien, pas un document figé. À chaque ouverture, la page se reconstruit avec les
données du moment : ce qui n'existait pas au moment de l'envoi (le planning, les poules) **apparaît
tout seul**, sans rien avoir à renvoyer. L'export PDF passe par l'impression du navigateur.

---

## B.6 — Le moteur sportif : comment naissent les poules et le planning

C'est le cœur de l'application. Un seul bouton, mais beaucoup de règles derrière.

### Étape 1 — Deux refus avant toute écriture

L'application **refuse de générer** — et n'écrit alors **rien du tout** — dans deux cas :

1. **Moins de 3 équipes** dans une catégorie présente. C'est une **règle de la Fédération** : à
   l'École de Rugby, les matchs secs ne sont pas autorisés, il faut au minimum 3 équipes.
   *(Une catégorie à **zéro** équipe est simplement ignorée, avec un avertissement.)*
2. **Durée de mi-temps non renseignée**. Sans elle, les matchs dureraient 0 minute.

### Étape 2 — La composition des poules

- **Combien de poules ?** Par défaut, une poule pour **4 équipes** (`ceil(nombre / 4)`).
  L'organisateur peut forcer un autre nombre — et l'application lui dira alors **combien de temps
  ce choix lui coûte** sur la journée.
- **Qui va où ?** Le tirage est aléatoire, **avec une règle** : deux équipes du **même club** ne
  vont pas dans la même poule. L'application place d'abord les clubs les plus nombreux (les plus
  contraints), puis équilibre avec les autres. Si un club a plus d'équipes que de poules, la
  séparation est impossible et **elle le dit**.

### Étape 3 — Les matchs

Chaque poule joue un **championnat complet** : chacun rencontre chacun une fois.

### Étape 4 — Les horaires

L'application pose les matchs les uns après les autres en respectant simultanément :

- le **terrain** doit être libre (+ le battement réglé) ;
- **les deux équipes** doivent être libres (+ leur temps de récupération) ;
- aucun match ne doit **chevaucher la pause déjeuner** — s'il tomberait dedans, il est repoussé
  après.

Elle choisit à chaque fois le **terrain qui se libère le plus tôt**.

### Étape 5 — Les avertissements et l'assistant d'arbitrage

Si la journée finit trop tard, ou si le matin déborde sur la pause déjeuner, l'application
**simule des ajustements** (moins de poules, mi-temps plus courtes, moins de récupération…) et
propose **jusqu'à 6 pistes**, classées de la plus efficace à la moins efficace.

> C'est une des fonctionnalités les plus abouties : l'application ne se contente pas de dire
> « ça ne rentre pas », elle propose **quoi changer**.

### Deux options particulières

**La pause déjeuner échelonnée** — au lieu d'arrêter tout le monde en même temps, chaque catégorie
d'au moins 4 équipes joue en **deux vagues**, avec au moins 60 minutes de repos pour chacune. Le
tournoi ne s'arrête jamais complètement.

**Le Super Challenge de France (U14)** — un cadre réglementaire distinct : le temps de jeu est
**imposé** (2×15 min en phase 2, 2×11 min en phase 3), les groupes sont des **triangulaires**
(3 équipes), et ces catégories **n'ont pas d'après-midi**. La phase 3 se joue sur deux jours, avec
un bouton dédié « Générer le dimanche (brassage) ».

### Après le tirage : trois outils de rattrapage

| Outil | Ce qu'il fait | Garde-fou |
|---|---|---|
| **Modifier les poules à la main** | Déplacer une équipe d'une poule à l'autre, puis tout replanifier | **Refusé** si un seul score du matin est saisi — contrôlé **par le serveur** |
| **Recalculer les horaires** | Recalculer heures et terrains **sans retirer** les poules ni les scores déjà saisis | Refusé si l'après-midi est généré ou si la composition a changé |
| **Tout regénérer** | Nouveau tirage complet | Efface **tout**, scores compris. Double confirmation + re-saisie de la clé admin |

---

## B.7 — Le classement : le barème et le départage

C'est la règle qui décide **qui gagne le tournoi**. Elle est courte :

```
   Victoire  → 3 points
   Match nul → 2 points
   Défaite   → 1 point      (une défaite rapporte quand même un point : esprit École de Rugby)

   En cas d'égalité, dans cet ordre :
     1. le plus de points au classement
     2. la meilleure DIFFÉRENCE (points marqués − points encaissés)
     3. le plus de POINTS MARQUÉS
```

Deux précisions constatées dans le code :

- Le classement **des poules** ne compte **que les matchs du matin**. Sans cela, une fois des
  scores d'après-midi saisis, regénérer l'après-midi partirait d'un classement faussé.
- Ce barème est écrit **deux fois** : côté serveur (`Code.gs`) **et** côté navigateur
  (`tournoi.js`), parce qu'Apps Script et le navigateur ne peuvent pas partager le même fichier.
  Le code porte un avertissement explicite : toute modification d'un côté doit être répercutée de
  l'autre. La spécification de référence est `docs/regles-classement.md`. *(CERTAIN.)*

---

## B.8 — L'après-midi : cinq formats au choix, catégorie par catégorie

Après les poules du matin, chaque catégorie peut jouer un format **différent** dans le même
tournoi. C'est un réglage de la carte de catégorie.

| Format | Le principe, simplement | Enjeu |
|---|---|---|
| **CROISE** *(par défaut)* | Les équipes de **même rang** se retrouvent : tous les 1ers ensemble, tous les 2es ensemble… puis championnat dans chaque niveau | Classement final |
| **CROISE_DIAGONAL** | Les rangs sont **décalés** : le 1er d'une poule affronte le 2e d'une **autre** poule. Un niveau = deux rangs consécutifs | Classement final |
| **POULES_NIVEAU** | Le classement de midi, toutes poules confondues, est **découpé en tranches de 4-5**. Chaque tranche joue un championnat complet | Classement final |
| **LIBRE** | Matchs amicaux : chacun rencontre chacun, **sans enjeu** ni classement | Aucun |
| **COUPE_PLATEAU** | Les meilleurs de chaque poule partent en **élimination directe** (+ petite finale) ; les autres jouent un plateau amical | Élimination |

### Deux points à connaître

**POULES_NIVEAU privilégie volontairement « le bas joue plus »** : quand l'effectif ne tombe pas
juste, ce sont les **poules du bas** qui passent à 5 équipes. Le commentaire du code assume la
raison : à ces âges, le temps de jeu supplémentaire va aux enfants qui en ont le plus besoin, et la
fatigue ne se concentre pas sur les équipes de tête. C'est une **décision d'organisateur**, pas un
hasard d'algorithme.

**COUPE_PLATEAU est le seul format à élimination directe**, et il apporte des règles propres :

- un match dont les deux équipes ne sont pas encore connues **ne peut pas être saisi** ;
- en cas d'**égalité**, le marqueur **doit désigner** un vainqueur (pas de nul en élimination) ;
- le vainqueur est **propagé immédiatement** dans le match suivant ;
- **corriger** un score déjà propagé vers un match lui-même joué est **bloqué**, sauf confirmation
  explicite — cela réinitialiserait la suite du tableau.

**Garde-fou commun à tous les formats** : l'après-midi ne se génère que si **tous** les matchs du
matin sont terminés.

---

## B.9 — Le jour J : la saisie des scores

C'est la fonctionnalité qui tourne **sous pression**, sur un téléphone, au bord d'un terrain.

### Ce que voit le marqueur

Les matchs regroupés en **accordéons par phase** (matin / après-midi), filtrables par
**catégorie** et par **grand terrain** — un marqueur affecté au terrain de rugby n° 1 ne voit que
ses matchs.

### Deux façons de saisir

| Mode | Ce qu'on saisit | Le score |
|---|---|---|
| **Simple** | Directement 15 et 10 | tel quel |
| **Détaillé** | Essais, transformations, pénalités, drops | **calculé** : essai 5, transfo 2, pénalité 3, drop 3 |

Le mode détaillé n'est proposé **que dans les catégories où le référentiel FFR autorise le tir au
but**. Le total est recalculé **côté serveur** — jamais celui envoyé par le téléphone.

### Les protections de la saisie

- **Scores refusés** s'ils ne sont pas des entiers ≥ 0 ;
- **Un score validé est définitif** : le modifier exige de passer explicitement par « Corriger » ;
- **Un verrou** empêche deux marqueurs d'écrire au même instant (voir volet A) ;
- **Chaque score validé est archivé** dans le journal de saison (onglet `Historique`), avec les
  **noms** des équipes (stables d'une édition à l'autre) et l'identifiant du tournoi. Un même match
  ressaisi **met à jour** sa ligne au lieu d'en créer une seconde ;
- L'archivage **ne peut jamais bloquer la saisie** : s'il échoue, le score est quand même
  enregistré.

---

## B.10 — Ce que voit le public

`tournoi.html` se rafraîchit toute seule (~15 s) et propose deux vues :

**« Mon équipe »** — on choisit sa catégorie puis son équipe, et on obtient ses matchs (passés et à
venir, avec heure et terrain), plus **trois classements** : celui de sa poule, celui de son niveau
d'après-midi, et le **classement général** de la catégorie.

**« Classements »** — tous les tableaux : J, V, N, D, points marqués, encaissés, différence, points.

S'y ajoutent : les **derniers scores** du tournoi, un **podium**, l'affiche, et les **partenaires**
(voir ci-dessous).

Deux comportements notables :

- Tant que le tournoi n'est pas publié, la page affiche un **bandeau de démonstration** au lieu de
  faire croire à des résultats réels ;
- L'onglet mis en arrière-plan **met le rafraîchissement en pause**, et recharge immédiatement au
  retour — cela évite des centaines d'appels inutiles pendant que les téléphones sont dans les
  poches.

---

## B.11 — Les fonctionnalités « en plus »

### La demande d'autorisation FFR

L'application produit une **feuille de report** du formulaire officiel de demande d'autorisation de
tournoi : elle reprend, dans l'ordre du document, chaque champ attendu, et indique s'il est
**calculé** (déduit des données du tournoi), **saisi** (renseigné par l'organisateur) ou
**manquant**.

Le point délicat est le **nombre de participants**, qui est reconstitué par **cascade** :
les effectifs déclarés par les clubs qui ont accepté + les effectifs saisis à la main sur les
équipes ajoutées manuellement — sans double compte, et **ajustés** si des équipes ont été retirées
après la réponse du club. Si rien n'est disponible nulle part, l'application **ne devine pas** :
elle affiche « manquant ».

> Elle ne remplit **pas** le PDF officiel et ne l'imite pas. Elle prépare les réponses ; le dépôt
> reste manuel.

### La conformité FFR

Un référentiel (les 4 onglets `RefFFR_*`) permet à l'application de dire, pour une date et des
catégories données : la date est-elle autorisée ? quelle forme de jeu (5×5, 7×7…) ? quel temps de
jeu ? quel plafond de temps par enfant ?

Ces vérifications sont **informatives** : elles affichent vert / orange / rouge mais
**n'empêchent jamais d'enregistrer**. Un bouton « Appliquer la norme FFR » recopie les valeurs
attendues dans la carte de la catégorie.

> **Deux exceptions**, déjà vues en §B.6 : le minimum de 3 équipes et la durée de mi-temps, qui
> **bloquent** réellement la génération.
>
> Et une limite héritée du volet A : si les onglets `RefFFR_*` manquent, l'application affiche un
> bandeau neutre et **ne contrôle plus rien** — sans que cela ressemble à une panne.

### Les partenaires (sponsors)

Six emplacements d'affichage : bandeau sous le titre, rail latéral rotatif, encart au fil des
scores, plein écran d'accueil passable, mur des partenaires, et bandeau du dossier club.

L'application **mesure** leur visibilité : temps d'exposition, affichages, clics, tranches
horaires — comptés dans le navigateur, puis consolidés entre tous les téléphones, pour produire une
**fiche de visibilité** à renvoyer au partenaire.

Cette mesure repose sur **deux identifiants tirés au hasard sur l'appareil et remis à zéro chaque
jour**. Aucun cookie, aucun traceur tiers. C'est aussi **la seule écriture publique sans clé** de
toute l'application (voir volet A, point A-06) — elle n'écrit que dans l'onglet isolé `Mesures`,
que rien d'autre ne lit, avec une validation champ par champ et des bornes strictes.

### La feuille de fin de journée

Le bilan de **tous** les matchs dans l'ordre de l'horloge, avec leur score. Trois usages : à
l'écran, en **PDF fabriqué entièrement dans le navigateur** (aucun appel serveur), et **envoyé par
courriel** aux clubs qui ont accepté. Rien n'est inventé : un match sans score affiche « — ».

### La page « Perfs Racing »

Page interne, en lecture seule, non liée depuis le reste du site : le bilan des équipes du Racing
sur le tournoi en cours (contre qui on gagne, à quel moment de la journée) et le **cumul de la
saison** lu dans le journal `Historique`.

### La réinitialisation

Remet le tournoi à zéro pour l'édition suivante. Ce qui est **effacé** : équipes, poules, matchs,
catégories, infos publiques, horaires, contacts, dossier d'invitation, affiche et photo de parking
(mises à la corbeille du Drive).

Ce qui est **délibérément conservé** :

- l'onglet **`ClubsInvites`** — c'est un carnet d'adresses réutilisable ;
- l'onglet **`Sponsors`** et les réglages d'affichage — un partenariat se reconduit, et tout
  effacer obligerait à re-téléverser tous les logos ;
- l'onglet **`Historique`** — c'est la mémoire de la saison ;
- l'**adresse d'expédition** des courriels — c'est un réglage d'infrastructure, comme les clés.

---

## B.12 — Points d'attention repérés pendant ce volet

> ⚠️ **Ce ne sont PAS des conclusions d'audit.** Aucun n'est classé P0/P1/P2/P3 — c'est le travail
> de l'ÉTAPE 2. Ce sont des **choses vues en chemin**, notées pour ne pas les perdre.

| Réf | Ce qui a été remarqué | Domaine (étape 2) | Certitude |
|---|---|---|---|
| **B-01** | Le **barème de classement est écrit deux fois** (serveur + navigateur). Le code le signale et donne la spécification de référence, mais rien n'empêche techniquement les deux de diverger | H / D | CERTAIN |
| **B-02** | Les deux **empreintes de réglages** (`signatureGeneration`, `signatureStructure`), qui disent à l'administration « il faut regénérer », sont elles aussi écrites **deux fois** (serveur + navigateur), avec la même remarque « fonctions MIROIR » | H / D | CERTAIN |
| **B-03** | **Regénérer les poules efface tous les scores.** Le garde-fou (double confirmation + re-saisie de la clé admin) existe **uniquement dans le navigateur** : le serveur, lui, ne vérifie pas la présence de scores avant d'écrire. À comparer avec « réorganiser les poules », qui **refuse côté serveur**, et avec le gel des réponses à J-16, protégé côté serveur avec un commentaire expliquant pourquoi | C / D / A | CERTAIN |
| **B-04** | Aucune notion de **forfait**, d'**abandon** ou de **match annulé** n'existe dans le code. Une équipe absente doit être gérée à la main (score 0, ou suppression de l'équipe) | A — métier | CERTAIN |
| **B-05** | On ne peut **ni déplacer ni reporter un match individuel** (changer son heure ou son terrain). Les seuls outils sont « recalculer les horaires » (tout le matin) et « tout regénérer » | A — métier | CERTAIN |
| **B-06** | La génération de l'après-midi exige que **tous** les matchs du matin soient terminés. Un seul match non saisi (équipe absente, oubli) **bloque toute la seconde phase** | A / E | CERTAIN |
| **B-07** | Le **Super Challenge phase 3** est explicitement **incomplet** : le code avertit que le socle multi-journées « n'est pas encore branché (prévu PR B/C) » et qu'il génère seulement le samedi | A — métier | CERTAIN |
| **B-08** | Une **date de tournoi vide** désactive silencieusement le gel des réponses à J-16 (`reponsesGelees` renvoie « non gelé » si la date est illisible) — donc les réponses restent ouvertes | A / D | CERTAIN |
| **B-09** | Le contenu des **courriels** (dossier, feuille de journée) est fabriqué **par le navigateur** et envoyé au serveur, qui se contente de l'expédier. Le serveur ne contrôle donc pas ce qui part sous l'adresse du propriétaire | C — sécurité | CERTAIN |
| **B-10** | Les **deux publications** (`tournoi_publie` public / `planning_visible_clubs` clubs) sont indépendantes. C'est **volontaire et documenté**, mais c'est une subtilité qui peut surprendre : un tournoi publié montre le planning à qui a le lien public, même si les clubs ne le voient pas dans leur dossier | A / E | CERTAIN |
| **B-11** | La **réinitialisation ne demande pas de confirmation côté serveur** : l'action `reinitialiserTournoi` efface dès qu'elle reçoit la clé admin. La confirmation vit dans la page | C / E | CERTAIN |
| **B-12** | Le **classement général** et le **podium** affichés au public sont calculés **dans le navigateur** (`tournoi.js`), pas par le serveur. Le serveur ne fournit que le classement **des poules** | H / D | CERTAIN |

---

## B.13 — Ce que ce volet ne dit PAS

- ❌ **Il ne dit pas si tout cela fonctionne.** Rien n'a été exécuté, rien n'a été testé.
  Toute affirmation ici porte sur **ce que le code prévoit**, pas sur ce qui se produit en vrai.
- ❌ **Il ne détaille pas les données stockées** ni leur durée de conservation → volet C.
- ❌ **Il ne juge ni la qualité, ni la sécurité, ni l'ergonomie** de ces fonctionnalités → ÉTAPE 2.
- ❌ **Il ne dit rien du code réellement en service chez Google** → **INCONNU** (I-01).
- ❌ **Il ne vérifie pas la conformité aux règles FFR** : c'est le chantier séparé
  `AUDIT-TOURNOI-R92.md` (décision D-003).

---

## B.14 — Le résumé qu'il faut retenir

1. **L'application couvre toute la journée**, pas seulement l'affichage : inviter, engager,
   régler, tirer au sort, planifier, saisir, afficher, clôturer.
2. **Les clubs travaillent pour l'organisateur.** Ils répondent eux-mêmes, et leurs équipes se
   créent toutes seules. C'est le plus gros gain de temps de l'outil — et la porte par laquelle
   entrent les données personnelles.
3. **Le tirage est intelligent** : il sépare les équipes d'un même club, respecte terrains,
   récupération et pause déjeuner, et **propose quoi changer** quand la journée ne rentre pas.
4. **Un barème court décide de tout** : 3 / 2 / 1, puis différence, puis points marqués. Il est
   écrit à deux endroits — c'est le point le plus fragile repéré dans ce volet.
5. **Cinq formats d'après-midi coexistent**, réglables catégorie par catégorie.
6. **L'application refuse beaucoup de choses**, et c'est sa qualité principale : moins de
   3 équipes, durée manquante, poules modifiées après un score, après-midi avant la fin du matin,
   réponse d'un club à J-16, score déjà validé, correction en cascade d'un tableau de coupe.
7. **Mais tous ces refus ne sont pas au même endroit.** Certains sont tenus par le serveur, donc
   incontournables ; d'autres seulement par la page, donc contournables. C'est la principale
   observation de structure de ce volet (B-03).

---

# VOLET C — LES DONNÉES

> **Ce que fait ce volet** : ouvrir les tiroirs. Quelles informations l'application range,
> **où**, **qui peut les voir**, **combien de temps elles restent**, et lesquelles touchent à la
> **vie privée**. **Aucun fichier de l'application n'a été modifié.**
>
> **Ce qu'il ne fait pas** : juger. Il n'y a ici **aucun** P0/P1/P2/P3, et **aucune** appréciation
> de conformité au RGPD. C'est le travail du **domaine B** de l'ÉTAPE 2. Ce volet lui prépare le
> terrain : on ne peut pas dire si des données sont bien traitées avant de savoir **lesquelles**
> existent.

**Écrit en session 4 (2026-08-04).**

> 📌 **Rappel indispensable pour lire ce volet.** Aujourd'hui, le classeur ne contient **aucune
> donnée personnelle de tiers** : le tournoi en base est fictif (I-04) et les seules adresses
> présentes sont celles de Romain et de son épouse, saisies pour tester les envois (I-03).
> Tout ce volet décrit donc **ce que l'application est capable de collecter** le jour où de vrais
> clubs seront invités — pas ce qu'elle détient à cet instant.

---

## C.1 — L'essentiel en une phrase

L'application manipule **très peu de données personnelles**, et elle ne connaît **aucun enfant par
son nom** : les mineurs n'y existent que sous forme de **nombres** (« 12 joueurs, 2 éducateurs »).
Les seules personnes identifiées nominativement sont **des adultes** : les contacts des clubs, le
référent du tournoi, le responsable sécurité, et les dirigeants renseignés pour la demande
d'autorisation fédérale.

---

## C.2 — Les cinq endroits où vivent des données

Le classeur n'est pas le seul tiroir. Il y en a cinq, et c'est important : effacer le classeur
n'efface pas les quatre autres.

```
   ┌──────────────────────────────────────────────────────────────────────┐
   │  1. LE CLASSEUR GOOGLE SHEET  ──  le tiroir principal, 12 onglets    │
   │     PRIVÉ (vérifié, I-06). Tout passe par le programme.              │
   └──────────────────────────────────────────────────────────────────────┘
   ┌──────────────────────────────────────────────────────────────────────┐
   │  2. GOOGLE DRIVE  ──  affiche, logos des partenaires, photo parking  │
   │     Fichiers rendus PUBLICS en lecture (« toute personne             │
   │     disposant du lien »).                                            │
   └──────────────────────────────────────────────────────────────────────┘
   ┌──────────────────────────────────────────────────────────────────────┐
   │  3. LA BOÎTE GMAIL DU PROPRIÉTAIRE  ──  une copie de CHAQUE courriel │
   │     envoyé reste dans « Messages envoyés », avec l'adresse du club.  │
   └──────────────────────────────────────────────────────────────────────┘
   ┌──────────────────────────────────────────────────────────────────────┐
   │  4. LES APPAREILS DES VISITEURS  ──  mémoire du navigateur           │
   │     compteurs de partenaires, équipe choisie, clé saisie.            │
   └──────────────────────────────────────────────────────────────────────┘
   ┌──────────────────────────────────────────────────────────────────────┐
   │  5. LE RELAIS CLOUDFLARE  ──  ÉTEINT aujourd'hui                     │
   │     S'il était rallumé : une copie de l'instantané public, hors      │
   │     de chez Google.                                                  │
   └──────────────────────────────────────────────────────────────────────┘
```

> **Analogie** : le classeur est l'armoire du bureau. Le Drive est le panneau d'affichage dans le
> hall (visible de tous ceux qui savent où regarder). Gmail, c'est le double au carbone de chaque
> lettre envoyée, gardé dans un tiroir séparé. Vider l'armoire ne décroche pas le panneau et ne
> brûle pas les doubles.

---

## C.3 — Le classeur, onglet par onglet

Douze onglets. Voici, pour chacun : ce qu'il contient, qui l'écrit, qui peut le lire, et s'il
touche à la vie privée.

| Onglet | Contient | Écrit par | Lisible **sans aucune clé** ? | Données personnelles ? |
|---|---|---|---|---|
| **`Config`** *(zone A)* | ~104 réglages du tournoi : horaires, textes, images, contacts, sécurité, demande d'autorisation, partenaires | admin (clé) | ❌ **Non** — seuls les champs d'une **liste blanche** sortent | ✅ **OUI** — noms, téléphones, emails d'adultes |
| **`Config`** *(zone B)* | 20 colonnes de réglages **par catégorie** (temps de jeu, effectifs, format, terrains) | admin (clé) | Partiellement (liste blanche) | ❌ Non |
| **`Equipes`** | 7 colonnes : identifiant, nom d'équipe, catégorie, poule, origine, **nb de joueurs**, **nb d'éducateurs** | admin **et** synchronisation des clubs | ✅ **Oui, en entier** | ⚠️ Des **effectifs** (nombres), aucun nom de personne |
| **`Poules`** | 3 colonnes : identifiant, catégorie, nom de poule | génération | ✅ Oui, en entier | ❌ Non |
| **`Matchs`** | 27 colonnes : horaires, terrains, équipes, scores, détail du score, tableau de coupe, arbitre | génération + marqueurs | ✅ Oui, en entier | ❌ Non |
| **`Historique`** | 9 colonnes : le journal de saison, un match terminé = une ligne | saisie des scores | ✅ Oui, en entier | ❌ Non |
| **`ClubsInvites`** | **17 colonnes** : le carnet d'adresses des clubs + tout ce qu'ils ont déclaré | admin + réponses des clubs | ❌ **Non** — clé admin obligatoire | ✅ **OUI** — le cœur du sujet |
| **`Sponsors`** | 13 colonnes : fiches des partenaires (entreprises) | admin (clé) | Partiellement (liste blanche des champs publics, partenaires actifs seulement) | ❌ Non — un partenaire est une entreprise |
| **`Mesures`** | 5 colonnes : relevés de visibilité déposés par les téléphones des spectateurs | **le public, sans clé** | ❌ Non (lecture réservée à l'admin) | ❌ Non — deux identifiants **aléatoires**, renouvelés chaque jour |
| **`RefFFR_Formes`** · **`RefFFR_Dates`** · **`RefFFR_Regles`** · **`RefFFR_Temps`** | Le référentiel de la Fédération | **rempli à la main** | ✅ Oui | ❌ Non |

**Deux choses à retenir de ce tableau :**

1. **Un seul onglet concentre la quasi-totalité du sujet vie privée : `ClubsInvites`.** Avec, en
   second, une partie de la zone A de `Config`.
2. **Quatre onglets sortent en entier, sans aucune clé** : `Equipes`, `Poules`, `Matchs`,
   `Historique`. Ce point est développé en §C.6.

---

## C.4 — `ClubsInvites` : le seul carnet d'adresses de l'application

C'est l'onglet le plus sensible. Voici ses **17 colonnes**, une par une.

| Colonne | Ce que c'est | Qui la remplit | Vie privée |
|---|---|---|---|
| `club_nom` | Nom du club (« MASSY ») | admin | ❌ (une personne morale) |
| `club_contact_nom` | **Nom du référent du club** | admin | ✅ **Personne physique** |
| `club_contact_prenom` | **Prénom du référent** (sert à la formule de politesse) | admin | ✅ **Personne physique** |
| `club_contact_email` | **Adresse email du référent** | admin | ✅ **Personne physique** |
| `statut` | Invité / Accepté / Décliné | admin **et** réponse du club | ❌ |
| `date_ajout` | Date d'entrée dans le carnet | admin | ❌ |
| `club_token` | **Le jeton secret** : la clé du lien personnel envoyé au club | généré automatiquement | ⚠️ C'est un **secret d'accès** |
| `invitation_envoyee` | Date d'envoi de l'invitation (phase 1) | automatique | ❌ |
| `dossier_envoye` | Date d'envoi du dossier (phase 2) | automatique | ❌ |
| `date_reponse` | Date de la réponse du club | le club | ❌ |
| `categories_engagees` | « U8,U10 » | le club | ❌ |
| `nb_equipes_par_categorie` | `{"U8":2,"U10":1}` | le club | ❌ |
| `nb_joueurs_total` | Total d'enfants attendus | calculé par le serveur | ⚠️ **Effectif de mineurs** (un nombre) |
| `nb_educateurs_total` | Total d'encadrants | calculé par le serveur | ⚠️ Effectif d'adultes (un nombre) |
| `detail_effectifs` | **Le détail équipe par équipe** : `{"U8":[{"j":8,"e":2},…]}` | le club | ⚠️ **Effectifs de mineurs**, au niveau de l'équipe |
| `alerte_ecart` | Message d'alerte pour l'organisateur | automatique | ❌ |
| `selection_enregistree` | Date du « j'ai enregistré la sélection » | admin | ❌ |

### Ce que le code fait déjà pour protéger cet onglet *(CERTAIN, constaté)*

- **Il n'est jamais dans les données publiques.** L'instantané servi à la page des scores
  (`getAll`) ne le contient pas, et aucune lecture publique n'y touche.
- **Sa lecture exige la clé admin**, et passe volontairement par le chemin d'**écriture**
  (`doPost`) : une adresse de lecture aurait laissé la clé traîner dans l'historique du
  navigateur (voir volet A).
- **L'email d'un club n'est jamais renvoyé à personne** — même pas au club lui-même. Le
  commentaire du code est explicite : *« AUCUN email de club n'est jamais renvoyé »*.
- **Le destinataire d'un courriel est toujours relu dans le classeur**, jamais pris dans la
  demande envoyée par la page — pour qu'on ne puisse pas détourner un envoi.
- **Un envoi groupé envoie un courriel par club**, jamais un courriel commun : les clubs ne
  découvrent pas les adresses les uns des autres.

---

## C.5 — Les données personnelles dans `Config`

La zone A de `Config` contient ~104 réglages. La très grande majorité sont des horaires, des
textes ou des interrupteurs. **Onze** portent sur des personnes physiques :

| Champ | Qui c'est | Où il apparaît |
|---|---|---|
| `referent_nom`, `referent_tel` | Le **référent du tournoi**, joignable le jour J | Dossier des clubs (derrière le jeton) |
| `securite_referent_nom`, `securite_referent_tel` | Le **responsable sécurité**, si c'est une autre personne | Dossier des clubs (derrière le jeton) |
| `contact_reponse_nom`, `contact_reponse_email` | Le contact à qui écrire pour répondre à l'invitation | **Page publique d'invitation** |
| `contact_reponse_tel` | Son téléphone | **Nulle part en public** — retiré volontairement (décision de session 3 : *« le portable d'un bénévole n'a rien à faire sur une page mise en avant »*) |
| `email_expediteur` | L'adresse d'expédition des courriels | Nulle part |
| `org_representant_nom / _tel / _mail` | Le **représentant du club organisateur** (formulaire FFR) | Nulle part — écran admin seulement |
| `org_president_nom / _tel / _mail` | Le **président du club** (formulaire FFR) | Nulle part — écran admin seulement |
| `org_medecin_nom / _tel`, `org_secours_nom / _tel` | Le **médecin** et l'**antenne de secours** | Nulle part — écran admin seulement |

### Et une exception qui mérite d'être signalée

Un champ, et un seul, invite explicitement à saisir des **identités d'enfants** :

> `org_equipes_etrangeres_liste` — libellé affiché à l'organisateur :
> **« Liste des équipes étrangères (noms, prénoms, dates de naissance) »**

Il n'apparaît que si l'organisateur a coché « équipes étrangères : oui », il n'est visible qu'avec
la clé admin, et il ne sort **jamais** en public. Mais c'est le **seul endroit de toute
l'application** où des noms de mineurs peuvent entrer. *(CERTAIN, `Code.gs` ligne 2490.)*

---

## C.6 — La règle « rien ne sort sauf ce qui est autorisé » — et sa limite

C'est le mécanisme de protection le plus important du code, et il mérite d'être compris.

### Le principe, en une image

Il y a deux façons de décider ce qui sort d'un bureau :

- **« Tout sort, sauf ce qu'on pense à retenir »** → le jour où un nouveau dossier arrive, il part
  avec le reste. Personne n'a rien décidé : il est parti par défaut.
- **« Rien ne sort, sauf ce qui est nommé sur une liste »** → un nouveau dossier reste au bureau
  tant que personne ne l'a explicitement ajouté à la liste.

Le code applique **la seconde règle** pour `Config` et `Sponsors`, et il l'écrit noir sur blanc :

> *« PRINCIPE NON NÉGOCIABLE : rien ne sort sauf ce qui est nommément autorisé. Un paramètre
> ajouté dans Config plus tard est donc PRIVÉ PAR DÉFAUT — personne n'a à y penser. »*

Mieux : il existe **trois listes différentes** selon à qui l'on parle, et la plus fermée est celle
qui s'applique par défaut si l'on se trompe de nom.

| Liste | Servie à | Contient |
|---|---|---|
| **`live`** | La page publique des scores (des milliers de téléphones) | Le strict minimum : nom du tournoi, témoin de publication, réglages d'affichage des partenaires. **Aucune donnée personnelle.** |
| **`invitation`** | La page vitrine publique | Le programme de la journée, le cadre sportif, + `contact_reponse_nom` et `contact_reponse_email`. **Pas de téléphone.** |
| **`club`** | Le dossier d'un club, **derrière son jeton** | Tout ce qui précède + adresse précise, parking, tarifs, secours, **et les téléphones du référent et du responsable sécurité**. |

### La limite : quatre onglets ne passent pas par ce filtre

`Equipes`, `Poules`, `Matchs` et `Historique` sont servis **tels quels**, **toutes colonnes
comprises**, à qui les demande sans aucune clé. La fonction de lecture renvoie systématiquement
**toute colonne qui porte un en-tête**. *(CERTAIN, `lireOngletSimple`, ligne 545.)*

**Ce que cela donne aujourd'hui** : rien de personnel n'en sort. Les colonnes les plus proches du
sujet sont `nb_joueurs` et `nb_educateurs` de l'onglet `Equipes` — c'est-à-dire *« l'équipe
MASSY-1 est venue avec 12 enfants et 2 éducateurs »*. Un nombre, pas une personne.

**Ce qu'il faut noter** : ces quatre onglets fonctionnent donc sur la règle inverse de tout le
reste. Une colonne ajoutée demain à `Equipes` ou à `Matchs` sera publique **sans que personne ait
eu à le décider**. C'est le point C-01 ci-dessous.

---

## C.7 — Qui voit quoi : les cinq niveaux d'accès

| # | Qui | Ce qu'il faut pour entrer | Ce qu'il voit |
|---|---|---|---|
| 1 | **N'importe qui** | Rien | Nom du tournoi, programme, équipes (**effectifs compris**), poules, matchs, scores, classements, journal de saison, référentiel FFR, partenaires actifs, nom + email du contact d'invitation |
| 2 | **Un club invité** | **Son jeton**, reçu par courriel | Tout ce qui précède + **sa** fiche (prénom du contact, ce qu'il a déclaré), **ses** équipes, et les contacts jour J : **téléphones** du référent et du responsable sécurité, parking, secours, tarifs |
| 3 | **Un marqueur** | La **clé SCORES** | Rien de plus en lecture — il **écrit** les scores |
| 4 | **L'organisateur** | La **clé ADMIN** | **Tout** : la zone A entière de `Config` (contacts, sécurité, dirigeants), l'onglet `ClubsInvites` **en entier — emails et jetons compris** — les partenaires, les relevés de visibilité |
| 5 | **Le propriétaire du compte Google** | Son mot de passe Google | **Tout, sans passer par l'application** : le classeur, le Drive, et la boîte Gmail avec la copie de chaque courriel envoyé |

**Deux points importants sur ce tableau :**

- **Un club ne voit jamais un autre club.** Son jeton n'ouvre que sa propre fiche. La seule
  information qu'il obtient sur les autres, c'est la liste des équipes du tournoi — qui est
  publique de toute façon.
- **Le niveau 4 n'est pas une personne, c'est un mot de passe.** Comme noté au volet A (point
  A-05), il n'y a **aucun compte utilisateur** : le classeur ne garde donc **aucune trace de qui**
  a consulté le carnet d'adresses.

---

## C.8 — Et les enfants ?

C'est la question qui compte le plus, alors elle mérite une réponse nette.

**L'application ne stocke le nom d'aucun enfant.** Il n'existe, dans tout le code, **aucune**
colonne de nom de joueur, de prénom de joueur, de date de naissance ou de numéro de licence.
*(CERTAIN — vérifié par recherche sur l'ensemble du dépôt.)*

Ce qui est collecté sur les mineurs se résume à **trois nombres** :

| Donnée | Où | Précision | Qui la voit |
|---|---|---|---|
| Nombre de joueurs **par équipe** | `Equipes.nb_joueurs` | « MASSY-1 : 12 » | **Tout le monde** |
| Nombre de joueurs **par équipe, tel que déclaré par le club** | `ClubsInvites.detail_effectifs` | `{"U8":[{"j":12,"e":2},…]}` | Clé admin, **et le club lui-même** |
| Nombre **total** de joueurs d'un club | `ClubsInvites.nb_joueurs_total` | « 34 » | Clé admin, et le club lui-même |

Ces nombres servent à deux choses réelles : **remplir la demande d'autorisation fédérale** (qui
exige un nombre de participants) et **vérifier l'effectif minimum FFR par équipe**.

> **En résumé, avec une image** : l'application sait qu'il y aura *« 34 enfants du club de
> Massy »*. Elle ne sait pas **lesquels**, ni leur âge exact, ni comment les joindre. La seule
> personne joignable, c'est **l'adulte référent du club**.

**La seule exception** est le champ libre « équipes étrangères » décrit en §C.5 : là,
l'organisateur est explicitement invité à saisir des noms et des dates de naissance.

---

## C.9 — Combien de temps les données restent

C'est le point le plus simple à énoncer, et le plus structurant :

> **Rien ne disparaît tout seul.** Il n'existe dans le code **aucune durée de conservation**,
> **aucune purge automatique**, **aucune date d'expiration**. Toute suppression est le résultat
> d'un **geste manuel**. *(CERTAIN.)*

| Donnée | Ce qui l'efface | Automatique ? |
|---|---|---|
| Équipes, poules, matchs, scores | « Tout regénérer » ou la **réinitialisation** | ❌ Non |
| `Historique` (journal de saison) | **Rien** — délibérément conservé, édition après édition | ❌ Non |
| Carnet d'adresses `ClubsInvites` | Suppression d'un club, un par un, à la main | ❌ Non |
| Relevés `Mesures` | Le bouton « repartir de zéro » de l'écran Partenaires | ❌ Non |
| Fiches partenaires | Suppression d'une fiche, à la main | ❌ Non |
| Affiche, logos, photo de parking (Drive) | Mis **à la corbeille** du Drive quand on les remplace ou qu'on réinitialise | ⚠️ Google vide la corbeille ~30 jours plus tard |
| Courriels envoyés (Gmail) | **Rien** | ❌ Non |
| Mémoire des navigateurs des visiteurs | Change de jour en jour (compteurs), ou à la fermeture de l'onglet (clés) | ✅ Oui, partiellement |

### La réinitialisation, en détail

C'est le seul « grand ménage » de l'application. Voici exactement ce qu'elle fait aux données
personnelles.

**Ce qu'elle efface** ✅

- Les **contacts & sécurité** : référent du tournoi, responsable sécurité, poste de secours ;
- Les **contacts d'invitation** : nom, téléphone et email du contact « réponse » ;
- Dans `ClubsInvites` : les **jetons** (donc tous les anciens liens deviennent inopérants — c'est
  voulu, le code l'explique : *« réinitialiser, c'est ouvrir une nouvelle édition »*), les
  catégories engagées, les dates d'envoi, la date de réponse, le nombre d'équipes par catégorie et
  le nombre total de joueurs ;
- L'affiche et la photo du parking (mises à la corbeille du Drive).

**Ce qu'elle conserve délibérément** 🟡

- Le **carnet d'adresses lui-même** : nom du club, nom et prénom du contact, **son adresse email**.
  C'est assumé et documenté : *« c'est un carnet d'adresses réutilisable d'une édition à l'autre »* ;
- L'onglet `Historique` (mémoire de la saison) ;
- Les fiches partenaires et leurs logos ;
- L'adresse d'expédition des courriels.

**Ce qu'elle conserve sans que ce soit expliqué** ⚠️ *(voir C-03 et C-04)*

- Dans `ClubsInvites` : le **statut** de l'édition précédente, l'alerte d'écart, et surtout
  **`detail_effectifs`** et **`nb_educateurs_total`** — c'est-à-dire les effectifs d'enfants
  déclarés équipe par équipe l'année d'avant, alors que le total (`nb_joueurs_total`), lui, est
  bien effacé ;
- **Tous les champs de la demande d'autorisation** : noms, téléphones et emails du représentant,
  du président, du médecin et de l'antenne de secours.

---

## C.10 — Les données qui sortent du classeur

Cinq chemins de sortie, tous constatés dans le code.

**1. Les courriels.** Invitation (phase 1), dossier (phase 2), feuille de fin de journée. Ils
partent vers les adresses des contacts de clubs, **depuis la boîte Gmail du propriétaire**, et une
copie reste dans « Messages envoyés ». Leur contenu est fabriqué **par la page d'administration**
puis expédié par le serveur (déjà relevé en B-09) : les coordonnées transitent donc par le
navigateur de l'organisateur.

**2. Les liens à jeton.** Chaque club reçoit un lien personnel. Ce lien ouvre son dossier — donc
les téléphones du jour J, le parking, les secours. Deux protections constatées : la page **retire
le jeton de la barre d'adresse** dès l'ouverture et le range dans une mémoire vidée à la fermeture
de l'onglet ; et un jeton peut être **régénéré** à tout moment par l'organisateur, ce qui invalide
l'ancien lien. Mais **le courriel, lui, reste transférable** — quiconque le reçoit d'un club a le
lien.

**3. Les images sur Drive.** L'affiche, les logos des partenaires et la photo du parking sont
déposés sur le Drive puis **explicitement rendus publics en lecture** (« toute personne disposant
du lien »). C'est nécessaire pour que la page publique et les courriels les affichent.

**4. Les documents fabriqués dans le navigateur.** La feuille de fin de journée en PDF et le
dossier club imprimable sont produits **entièrement sur l'appareil**, sans aucun appel serveur
supplémentaire, grâce aux quatre bibliothèques recopiées dans le dépôt. Aucune donnée ne part vers
un service tiers.

**5. Le relais Cloudflare — éteint.** S'il était rallumé, il conserverait une **copie de
l'instantané public** hors de chez Google. Comme cet instantané est filtré par la liste `live`, il
ne contient aucune donnée personnelle — mais cela ferait un endroit de plus où les données du
tournoi sont recopiées.

---

## C.11 — Ce qui est stocké sur les appareils des visiteurs

| Ce qui est rangé | Où | Durée |
|---|---|---|
| Les compteurs de visibilité des partenaires | Mémoire longue du navigateur | **Remis à zéro chaque jour** |
| **Deux identifiants aléatoires** (l'appareil, la visite) | Mémoire longue du navigateur | **Renouvelés chaque jour** |
| La catégorie et l'équipe choisies sur la page publique | Mémoire longue | Jusqu'à effacement manuel |
| La catégorie et le terrain choisis par un marqueur | Mémoire longue | Jusqu'à effacement manuel |
| La préférence d'affichage de l'administration (assistant / classique) | Mémoire longue | Jusqu'à effacement manuel |
| **La clé ADMIN ou SCORES saisie** | Mémoire **de l'onglet** | **Effacée à la fermeture de l'onglet** |
| Le jeton d'un club | Mémoire **de l'onglet** | Effacé à la fermeture de l'onglet |

**Aucun cookie. Aucun traceur tiers. Aucun outil de mesure d'audience extérieur.** Les deux
identifiants de la mesure des partenaires sont tirés au hasard sur l'appareil, remis à zéro chaque
jour, et ne permettent de suivre personne d'un site à l'autre. *(CERTAIN, `sponsors.js` et
`Code.gs`.)*

Le serveur **revalide tout** ce que ces relevés contiennent : format des identifiants, nombre de
partenaires, borne haute de chaque compteur. Le commentaire du code résume l'esprit : *« Rien de
ce qui entre n'est cru sur parole. »*

---

## C.12 — Points d'attention repérés pendant ce volet

> ⚠️ **Ce ne sont PAS des conclusions d'audit**, et surtout **pas des manquements RGPD** : la
> classification P0/P1/P2/P3 et l'appréciation de conformité sont le travail de l'ÉTAPE 2,
> domaine B. Ce sont des **choses vues en chemin**, notées pour ne pas les perdre.

| Réf | Ce qui a été remarqué | Domaine (étape 2) | Certitude |
|---|---|---|---|
| **C-01** | Quatre onglets (`Equipes`, `Poules`, `Matchs`, `Historique`) sortent **en entier, toutes colonnes comprises**, sans aucune clé — la règle inverse de `Config` et `Sponsors`, protégés par liste blanche. Aucune donnée personnelle n'en sort **aujourd'hui**, mais une colonne ajoutée demain serait publique **sans décision** | B / C | CERTAIN |
| **C-02** | `Equipes.nb_joueurs` et `nb_educateurs` — les **effectifs d'enfants par équipe** — sont accessibles **sans aucune clé** (via `getEquipes` et l'instantané public). Ce sont des nombres, sans aucun nom | B — RGPD | CERTAIN |
| **C-03** | La **réinitialisation** efface `nb_joueurs_total` mais **conserve** `detail_effectifs` et `nb_educateurs_total` : les effectifs d'enfants déclarés **équipe par équipe** pour l'édition précédente restent dans le classeur. Le `statut` et l'`alerte_ecart` de l'édition passée restent également | B / A | CERTAIN |
| **C-04** | La réinitialisation n'efface **aucun** champ de la demande d'autorisation : noms, téléphones et emails du **représentant**, du **président**, du **médecin** et de l'**antenne de secours** traversent les éditions. C'est peut-être voulu (mêmes dirigeants d'une année sur l'autre) mais ce n'est **écrit nulle part**, alors que les autres conservations le sont | B — RGPD | CERTAIN |
| **C-05** | **Aucune durée de conservation nulle part.** Rien n'expire, rien ne se purge : `Historique`, `ClubsInvites` et `Mesures` s'accumulent jusqu'à un geste manuel | B — RGPD | CERTAIN |
| **C-06** | Les **jetons de club ne se périment pas**. Un lien reste valable tant qu'il n'est pas régénéré ou effacé par une réinitialisation. Il ouvre les **téléphones du jour J** et la logistique. La page masque le jeton de la barre d'adresse, mais le **courriel reste transférable** | B / C | CERTAIN |
| **C-07** | Une **copie de chaque courriel envoyé** reste dans la boîte Gmail du propriétaire, avec l'adresse du club. Le classeur n'est donc pas le seul endroit où vivent ces coordonnées, et la réinitialisation n'y a **aucune prise** | B — RGPD | CERTAIN |
| **C-08** | Les images du Drive sont **explicitement rendues publiques en lecture**. Leur suppression les met **à la corbeille** (Google la vide ~30 jours plus tard), pas au pilon immédiat. Ce qu'un lien déjà diffusé donne encore à voir pendant ce délai est **INCONNU** | B / C | CERTAIN (mise en corbeille) · **INCONNU** (accès résiduel) |
| **C-09** | L'onglet `Mesures` **grossit sans limite** : chaque appareil dépose plusieurs relevés au fil de la visite, et rien ne les efface automatiquement | B / F | CERTAIN |
| **C-10** | Un champ libre invite explicitement à saisir des **noms, prénoms et dates de naissance d'enfants** (« liste des équipes étrangères »). C'est le **seul endroit** de l'application où des identités de mineurs peuvent entrer. Il n'est ni public, ni effacé par la réinitialisation | B — RGPD | CERTAIN |
| **C-11** | La lecture du carnet renvoie l'onglet `ClubsInvites` **en entier**, **jetons compris**, à la page d'administration. C'est nécessaire à l'écran, mais cela signifie que la clé admin donne accès, **en une seule requête**, à tout le carnet d'adresses et à tous les jetons | B / C | CERTAIN |
| **C-12** | **Aucune trace de qui accède à quoi.** Les clés étant des mots de passe partagés (A-05), le classeur ne garde aucun registre des consultations du carnet d'adresses. Ce que le journal d'exécution de Google conserve, et pendant combien de temps, est **INCONNU** depuis le dépôt | B / C | CERTAIN (côté application) · **INCONNU** (côté Google) |
| **C-13** | Les navigateurs des visiteurs gardent des informations (compteurs, choix d'équipe, clés) — mais **aucun cookie, aucun traceur tiers**, et les identifiants de mesure sont aléatoires et renouvelés chaque jour | B / E | CERTAIN |

---

## C.13 — Ce que ce volet ne dit PAS

- ❌ **Il ne dit pas si tout cela est conforme au RGPD.** Ce n'est ni son rôle ni son moment :
  c'est le domaine B de l'ÉTAPE 2. Et conformément à `CLAUDE.md` §6.B, **aucune certification
  juridique ne sera jamais prononcée** — seulement des risques et des mesures techniques.
- ❌ **Il ne dit pas ce que le classeur contient réellement à cet instant.** Il décrit ce que le
  **code** est capable d'écrire. Le contenu réel n'a pas été lu (et ne peut pas l'être depuis le
  dépôt).
- ❌ **Il ne dit rien des données déjà présentes chez Google** hors du classeur : journaux
  d'exécution, corbeille du Drive, sauvegardes Google. **INCONNU.**
- ❌ **Il ne vérifie pas que les protections décrites fonctionnent.** Le code prévoit que l'email
  d'un club ne sorte jamais ; **rien n'a été exécuté pour le prouver**. Statut : **NON VÉRIFIÉ**.
- ❌ **Il ne dit rien du code réellement en service chez Google** → **INCONNU** (I-01).

---

## C.14 — Le résumé qu'il faut retenir

1. **Aucun enfant n'est identifié.** Pas de nom, pas de date de naissance, pas de licence — que
   des **nombres**. Les seules personnes nommées sont **des adultes** : contacts de clubs,
   référent, responsable sécurité, dirigeants du formulaire fédéral.
2. **Un seul onglet concentre le sujet : `ClubsInvites`.** C'est le carnet d'adresses. Il est
   exclu des données publiques et protégé par la clé admin.
3. **Le code applique déjà la bonne règle** pour les réglages : *rien ne sort sauf ce qui est
   nommé sur une liste*, avec trois listes selon l'interlocuteur, et la plus fermée par défaut.
   C'est une protection solide, et écrite comme un principe.
4. **Mais quatre onglets échappent à cette règle** et sortent en entier, sans clé. Sans
   conséquence aujourd'hui ; sans garde-fou demain.
5. **Rien ne s'efface tout seul.** Aucune durée de conservation, aucune purge. La réinitialisation
   est le seul grand ménage, et elle laisse volontairement le carnet d'adresses — plus quelques
   champs dont personne n'a écrit pourquoi ils restent.
6. **Le classeur n'est pas le seul tiroir.** Les courriels envoyés, les images publiques du Drive
   et les liens à jeton continuent d'exister en dehors de lui, hors de portée de toute
   réinitialisation.
7. **Le bon moment, c'est maintenant.** Le classeur est encore vide de données de tiers. Tout ce
   qui sera décidé au domaine B pourra donc être mis en place **avant** que de vraies coordonnées
   y entrent — c'est-à-dire avant la première invitation réelle.
