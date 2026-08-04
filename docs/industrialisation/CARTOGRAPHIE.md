# CARTOGRAPHIE — Tournoi R92

> **À quoi sert ce document ?**
> À comprendre **comment l'application est faite**, avant de chercher ce qui ne va pas.
> C'est l'ÉTAPE 1 du plan (`CLAUDE.md` §7). **Aucun fichier de l'application n'est modifié ici.**
>
> Le document est construit **par volets**, sur plusieurs sessions, parce que le projet est gros
> (plus de 11 000 lignes rien que pour le serveur).

**Dernière mise à jour** : 2026-08-04 (session 2)

| Volet | Contenu | Statut |
|---|---|---|
| **A — Le squelette** | Les morceaux qui composent l'application, où ils tournent, comment ils se parlent, comment le code arrive en ligne | ✅ **FAIT** (session 2) |
| B — Les fonctionnalités | Ce que l'application sait faire, écran par écran, du premier clic au tournoi terminé | ⬜ À faire |
| C — Les données | Ce qui est stocké, où, combien de temps, et ce qui relève de la vie privée | ⬜ À faire |

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
| A-12 | Les onglets `RefFFR_*` sont **remplis à la main** et ne sont créés par aucun code ; s'ils manquent ou si leur nom diffère d'un caractère, le programme renvoie une liste vide **sans le signaler** | A — métier / H | CERTAIN |
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
