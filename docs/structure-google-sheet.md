# Structure du Google Sheet

Le Google Sheet sert de **base de données** du tournoi. Il contient **4 onglets**.

> URL du Sheet :
> https://docs.google.com/spreadsheets/d/17jcZMNHJywE6e1qEXMnp_g6rsVeLo05vbQ-0njdlL7U/edit

**Règle importante :** la **première ligne de chaque onglet contient les en-têtes de colonnes**
(exactement les noms indiqués ci-dessous, en minuscules, sans accents). Le backend s'appuie sur
ces noms pour lire/écrire les données — il ne faut donc pas les renommer.

> 🛠️ **Création automatique.** Ces onglets et en-têtes sont créés automatiquement par la fonction
> `setupSheet()` du fichier [`../backend/Code.gs`](../backend/Code.gs), à lancer une fois depuis
> l'éditeur Apps Script. Pas besoin de les saisir à la main.

---

## Onglet `Config`

Cet onglet contient deux zones : **Zone A** (réglages globaux, en haut, paires
`parametre`/`valeur`), une ligne vide, un titre `— Réglages par catégorie —`, puis la **Zone B**
(en-têtes + une ligne par catégorie). Le backend repère les zones **par leur contenu** (nom du
paramètre, ou ligne dont la 1re cellule vaut `categorie`), donc les numéros de ligne peuvent varier.

Tout l'onglet `Config` est au **format texte** (pour éviter que `09:00` devienne une heure
et `1,2` un nombre décimal).

### Zone A — Réglages globaux de la journée

Deux colonnes : `parametre` et `valeur`.

| parametre | valeur (exemple) | Signification |
|---|---|---|
| `heure_debut` | `09:00` | Heure de début du tournoi |
| `heure_fin` | `17:00` | Heure de fin — **calculée automatiquement** si `heure_fin_auto = oui` |
| `heure_fin_auto` | `oui` | Si `oui`, l'heure de fin = fin du dernier match (recalculée à chaque génération) |
| `battement_terrain_min` | `5` | Temps (min) pour libérer un terrain entre 2 matchs |
| `pause_dejeuner_debut` | `12:30` | Début de la pause déjeuner |
| `pause_dejeuner_duree_min` | `60` | Durée de la pause déjeuner, en minutes |

### Zone B — Réglages par catégorie

Un tableau, **une ligne par catégorie**. En-têtes :

| Colonne | Exemple | Signification |
|---|---|---|
| `categorie` | `U8` | Nom de la catégorie |
| `presente` | `oui` | La catégorie participe-t-elle à cette édition ? (`oui`/`non`) |
| `terrains` | `1,2` | Terrains dédiés à cette catégorie (numéros séparés par des virgules) |
| `taille_poule_cible` | `4` | Nombre d'équipes visé par poule |
| `format_mi_temps` | `2` | Nombre de mi-temps par match (`1` ou `2`) |
| `duree_mi_temps_min` | `10` | Durée d'une mi-temps, en minutes |
| `pause_mi_temps_min` | `2` | Pause entre les deux mi-temps, en minutes (0 si `format_mi_temps = 1`) |
| `recup_entre_matchs_min` | `15` | Temps de récupération minimum d'une équipe entre 2 de ses matchs |

> **Durée totale d'un match** (calculée par le backend) :
> `format_mi_temps × duree_mi_temps_min + pause_mi_temps_min` (si 2 mi-temps).
> Exemple U8 : `2 × 8 + 2 = 18 min`.

---

## Onglet `Equipes`

Une ligne par équipe. En-têtes :

| Colonne | Exemple | Rempli par |
|---|---|---|
| `id_equipe` | `E01` | Identifiant unique (généré ou saisi) |
| `nom_equipe` | `Suresnes 1` | Saisi par l'admin |
| `categorie` | `U8` | Saisi par l'admin |
| `poule` | `A` | **Auto** — rempli par « Générer poules et planning » |

---

## Onglet `Poules`

Définit les poules existantes. La **composition** se lit dans `Equipes` (colonne `poule`),
et le **classement se calcule** à partir des scores de l'onglet `Matchs`.

| Colonne | Exemple | Signification |
|---|---|---|
| `id_poule` | `P01` | Identifiant unique de la poule |
| `categorie` | `U8` | Catégorie de la poule |
| `nom_poule` | `A` | Nom court (A, B, C…) |

---

## Onglet `Matchs`

Une ligne par match. En-têtes :

| Colonne | Exemple | Rempli par |
|---|---|---|
| `id_match` | `M001` | Identifiant unique |
| `categorie` | `U8` | Auto (génération) |
| `poule` | `A` | Auto (génération) |
| `terrain` | `1` | Auto (génération) |
| `heure_debut` | `09:00` | Auto (génération) |
| `heure_fin` | `09:22` | Auto (génération) |
| `equipe_A` | `E01` | Auto (génération) — identifiant d'équipe |
| `equipe_B` | `E02` | Auto (génération) — identifiant d'équipe |
| `score_A` | `15` | **Page de saisie des scores** |
| `score_B` | `10` | **Page de saisie des scores** |
| `statut` | `à venir` | `à venir` / `en cours` / `terminé` |
| `phase` | `poule` | Auto — `poule` (matin) ou `classement` (après-midi) |

> ℹ️ **Migration automatique** : la colonne `phase` est en **dernière colonne (L)**. Sur un Sheet
> déjà créé avant la session 13, l'en-tête `phase` est **ajouté automatiquement** dès la première
> génération (matin ou après-midi) — aucune manip manuelle. Les `setupSheet()` neufs la créent déjà.

Pour les matchs de l'**après-midi** (`phase = classement`), la colonne `poule` contient le **niveau**
du classement croisé (`N1` = groupe des 1ers de poule, `N2` = les 2es, etc.).

---

## Système de classement (rappel)

Calculé en direct à partir des matchs `terminé` :
- **Victoire** = 3 points
- **Match nul** = 2 points
- **Défaite** = 1 point

En cas d'égalité de points, départage par la **différence** (points marqués − points encaissés),
puis par les points marqués.
