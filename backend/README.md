# backend/

Code **Google Apps Script** du projet, déployé en **Web App**.

> ⚠️ **Le serveur, ce sont DEUX fichiers — pas un.** C'est le piège le plus coûteux de ce projet :
> ne recoller que `Code.gs` chez Google laisse le harnais de tests dans son état précédent, et un
> bilan de tests « au vert » ne prouve alors **rien**. Voir
> [`../docs/deploiement.md`](../docs/deploiement.md), qui donne les **deux nombres de contrôle** à
> vérifier après chaque collage.

| Fichier | Lignes *(relevé le 2026-08-22)* | Rôle |
|---|---|---|
| **`Code.gs`** | 8 342 | **Le serveur** : les 65 actions, la sécurité, la génération, le classement |
| **`Tests.gs`** | 4 314 | **Le harnais de tests** : à coller chez Google **lui aussi**, et à lancer par `lancerTestsFFR` |

> 📐 **Ces deux nombres bougent à chaque session qui touche au serveur.** Pour les revérifier :
> `wc -l backend/Code.gs backend/Tests.gs`.
>
> ⚠️ **Le bilan attendu des tests n'est volontairement PAS recopié ici.** C'est un **repère de
> vérification** : recopié à deux endroits, il finit par contredire l'autre — et c'est un repère
> périmé qui fait conclure à une panne alors que tout va bien. Il n'a donc **qu'une seule adresse** :
> [`../docs/deploiement.md`](../docs/deploiement.md), qui renvoie lui-même à
> `docs/industrialisation/ETAT.md` §9 pour la valeur du jour.

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

- 🆕 **`Editions` ne contient AUCUNE donnée personnelle** : un identifiant technique, un statut et
  deux horodatages. ⛔ Il n'est exposé par **aucune** vue publique — `edition_id` ne figure dans
  aucune liste blanche de `CONFIG_PUBLIQUE_VUES`, et un test le vérifie.
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
| `setupSheet()` | Crée **8 onglets de travail** : `Equipes`, `Poules`, `Matchs`, `Historique`, `ClubsInvites`, `Sponsors`, 🆕 `Editions` et `Config` — et **ouvre la première édition**. ⚠️ **Il n'en crée pas d'autres** : `Mesures` apparaît au premier relevé de visibilité, et les **4 onglets de référence FFR** (`RefFFR_Formes`, `RefFFR_Dates`, `RefFFR_Regles`, `RefFFR_Temps`) se remplissent **à la main**. Un classeur complet en compte donc **13**. ⚠️ **Ne jamais relancer `setupSheet()` sur un classeur en service** : il réécrirait `Config`. ⚡ *(Cette case annonçait **7** onglets et un total de **12** : vrai jusqu'au 2026-08-27, avant le lot B2-1.)* |
| ⏳ 🆕 `migrerClubsMaintenant()` | **M1-B2 / B2-2** — sépare `ClubsInvites` en **`Clubs`** *(carnet durable)* + **`Participations`** *(une ligne = une édition × un club)* sur un classeur **déjà en service**. ⭐ **Elle ne crée une participation que si la ligne PROUVE un engagement réel** — ⛔ ni un `club_token` ni un `statut = 'Invité'` ne suffisent, car l'un et l'autre étaient posés **avant tout envoi** *(**D-059**)*. ⭐ **Idempotente par convergence, sans aucun drapeau** : elle calcule l'écart entre ce qui devrait exister et ce qui existe, et n'écrit que la différence — relancée elle ne crée rien, **interrompue elle se reprend** sans perte. ⛔ **Elle n'efface RIEN** : `ClubsInvites` reste intact, cellule pour cellule. ⚠️ Elle **refuse** s'il n'y a aucune édition active *(lancer d'abord `migrerEditionsMaintenant()`)* ou si le registre est en anomalie. 🔴 **PAS ENCORE LANCÉE** — le code n'est ni poussé ni déployé au 2026-08-27. ⭐ **Elle ne se déclare TERMINÉE qu'après un contrôle de cohérence ligne à ligne** : si un écart subsiste, elle le NOMME, ⛔ ne pose aucune marque, et le logiciel continue de travailler sur `ClubsInvites`. ⚠️ **Une écriture métier ne la déclenche JAMAIS** : tant que la marque `Config.migration_clubs_b22` n'est pas posée, l'installation reste **legacy**, même si les onglets existent déjà à moitié |
| 🆕 `migrerEditionsMaintenant()` | **M1-B2 / B2-1** — ouvre le **registre des éditions** sur un classeur **déjà en service** : crée l'onglet `Editions` s'il manque et y écrit **une** édition `active`. ⭐ **Elle ne touche RIEN d'autre** — aucune réinitialisation, aucune donnée effacée — et elle est **idempotente** : relancée, elle ne crée aucun doublon. ⚠️ Elle **refuse** si plusieurs éditions sont déjà `active` *(anomalie à corriger à la main)*. ✅ **LANCÉE le 2026-08-27** — une première fois *(édition ouverte)*, une seconde fois *(« rien à faire »)* : ⭐ **l'idempotence est prouvée sur le classeur réel**, ⛔ pas seulement par les tests. ⚡ *(Cette case disait « 🔴 **PAS ENCORE LANCÉE** » : vrai jusqu'à cette date.)* Voir [`../docs/deploiement.md`](../docs/deploiement.md) |
| `configurerCles()` | Définit les deux clés. À lancer **depuis le menu « Tournoi R92 » du classeur**, pas depuis le bouton ▶ de l'éditeur — les fenêtres de saisie ne s'affichent pas depuis l'éditeur |
| `autoriserDrive()` | Donne au script l'autorisation Google Drive, nécessaire pour l'affiche **et** la photo du parking |
| `configurerRelais(...)` | Renseigne le relais CDN (optionnel, dormant par défaut) |
| `lancerTestsFFR()` | Lance le harnais de `Tests.gs`. **Le bilan attendu se lit dans [`../docs/deploiement.md`](../docs/deploiement.md)** — et ce qu'il faut retenir : un nombre **plus petit** que celui annoncé signifie que c'est l'**ancien** `Tests.gs` qui a tourné, donc que le collage des deux fichiers n'a pas été fait |

---

Voir [`../docs/architecture.md`](../docs/architecture.md),
[`../docs/deploiement.md`](../docs/deploiement.md) et
[`../docs/structure-google-sheet.md`](../docs/structure-google-sheet.md).
