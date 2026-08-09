# backend/

Code **Google Apps Script** du projet, déployé en **Web App**.

> ⚠️ **Le serveur, ce sont DEUX fichiers — pas un.** C'est le piège le plus coûteux de ce projet :
> ne recoller que `Code.gs` chez Google laisse le harnais de tests dans son état précédent, et un
> bilan de tests « au vert » ne prouve alors **rien**. Voir
> [`../docs/deploiement.md`](../docs/deploiement.md), qui donne les **deux nombres de contrôle** à
> vérifier après chaque collage.

| Fichier | Lignes | Rôle |
|---|---|---|
| **`Code.gs`** | 8 147 | **Le serveur** : les 65 actions, la sécurité, la génération, le classement |
| **`Tests.gs`** | 3 859 | **Le harnais de tests** : à coller chez Google **lui aussi**, et à lancer par `lancerTestsFFR` — bilan attendu `R92 — 616/616 OK, 0 FAIL` |

---

## Ce que contient `Code.gs`

- **`doGet`** — les **lectures**. Ouvertes à tous *(`getAll`, `getConfig`, `getEquipes`, `getPoules`,
  `getMatchs`, `getClassement`, `getHistorique`, `getRefFFR`, `ping`, et les trois lectures du
  référentiel FFR)*, **sauf trois** qui exigent le **jeton du club** *(`getClubDossier`,
  `getConfigClub`, `getReponseInvitation`)*. `getAll` et `getRefFFR` sont **mis en cache serveur
  ~10 s**, chacun sur sa propre clé.
- **`doPost`** — les **écritures**, protégées par une **clé** (admin ou scores) et **sérialisées**
  par un verrou (`LockService`) : équipes, catégories, horaires, terrains, scores, génération des
  poules et du planning, phases de l'après-midi, Super Challenge, publication, infos et affiche,
  invitations et clubs invités, partenaires, réinitialisation.
- **Deux exceptions au schéma ci-dessus**, toutes deux volontaires :
  - **`mesureSponsors`** est la **seule écriture sans clé** — les relevés viennent des téléphones des
    spectateurs. Elle est plafonnée en débit et en volume, écrit dans l'onglet isolé `Mesures`, et
    **ne prend pas le verrou** : sans quoi quelques centaines de spectateurs feraient attendre le
    marqueur au bord du terrain ;
  - **`repondreInvitation`** est une écriture **publique validée par le jeton du club** : c'est le
    libre-service qui permet à un club d'accepter ou de décliner lui-même.

> 📖 **Les 65 actions sont listées une par une**, avec leur niveau d'accès, dans
> [`../docs/architecture.md`](../docs/architecture.md) §2.2.

---

## Sécurité

- **Deux clés** (`CLE_ADMIN` / `CLE_SCORES`) stockées dans les **Propriétés du script** — *jamais*
  dans le code —, réglées par `configurerCles()`, qui **exige au moins 12 caractères**.
- **Anti-force-brute** : au-delà de ~30 essais de clé ratés en 5 minutes, les nouvelles tentatives à
  **mauvaise** clé sont refusées un moment. Une **bonne** clé passe toujours et remet le compteur à
  zéro — un marqueur n'est donc jamais bloqué.
- **Plafonds sur la seule porte ouverte** (`mesureSponsors`) : un plafond **dur** sur la taille de
  l'onglet des relevés, et deux plafonds de **débit** (global et par appareil), vérifiés **avant**
  d'ouvrir le classeur.
- **Images** (affiche, photo du parking) : envoi Drive **limité aux vraies images**
  (PNG/JPEG/WebP/GIF) et à **5 Mo**.
- **Erreurs** : les exceptions inattendues renvoient un message **générique**, le détail restant
  journalisé côté serveur — un message d'erreur brut peut trahir la structure interne.
- → Choisir des clés **longues et aléatoires** (gestionnaire de mots de passe) et **garder le Sheet
  privé** : ne jamais le partager en « toute personne disposant du lien », le `SHEET_ID` étant
  visible dans le dépôt public.

---

## Données personnelles

- **`ClubsInvites` contient des emails de contact** → cet onglet n'entre **jamais** dans les données
  publiques (`getAll`, relais CDN). Sa lecture (`listerClubsInvites`) passe par `doPost` et exige la
  **clé admin**, comme les écritures.
- **La zone A de `Config` contient aussi des données personnelles** (référent, contacts sécurité,
  contacts de réponse). Toute lecture publique passe **obligatoirement** par `lireConfigPublique`,
  qui applique une **liste blanche** : une colonne ajoutée demain reste privée par défaut.
- Combien de temps chaque donnée est conservée, et qui l'efface :
  [`../docs/conservation-donnees.md`](../docs/conservation-donnees.md).

---

## Montée en charge

Cache serveur + **relais CDN** optionnel (`pousserSnapshot` / `configurerRelais`) — voir
[`../docs/relais-cdn.md`](../docs/relais-cdn.md).

---

## Utilitaires à lancer une fois depuis l'éditeur

| Fonction | Ce qu'elle fait |
|---|---|
| `setupSheet()` | Crée **7 onglets de travail** : `Equipes`, `Poules`, `Matchs`, `Historique`, `ClubsInvites`, `Sponsors` et `Config`. ⚠️ **Il n'en crée pas d'autres** : `Mesures` apparaît au premier relevé de visibilité, et les **4 onglets de référence FFR** (`RefFFR_Formes`, `RefFFR_Dates`, `RefFFR_Regles`, `RefFFR_Temps`) se remplissent **à la main**. Un classeur complet en compte donc **12**. ⚠️ **Ne jamais relancer `setupSheet()` sur un classeur en service** : il réécrirait `Config` |
| `configurerCles()` | Définit les deux clés. À lancer **depuis le menu « Tournoi R92 » du classeur**, pas depuis le bouton ▶ de l'éditeur — les fenêtres de saisie ne s'affichent pas depuis l'éditeur |
| `autoriserDrive()` | Donne au script l'autorisation Google Drive, nécessaire pour l'affiche **et** la photo du parking |
| `configurerRelais(...)` | Renseigne le relais CDN (optionnel, dormant par défaut) |
| `lancerTestsFFR()` | Lance le harnais de `Tests.gs`. Bilan attendu : **`R92 — 616/616 OK, 0 FAIL`** |

---

Voir [`../docs/architecture.md`](../docs/architecture.md),
[`../docs/deploiement.md`](../docs/deploiement.md) et
[`../docs/structure-google-sheet.md`](../docs/structure-google-sheet.md).
