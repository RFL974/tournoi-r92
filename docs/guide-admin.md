# Guide de l'organisateur

Comment utiliser l'outil, avant et pendant le tournoi. La **page admin** (`admin.html`) est
opérationnelle ; les pages visiteurs (Mon planning, Live, Saisie des scores) arriveront ensuite.

## Ouvrir la page admin
Ouvrir `frontend/admin.html` dans un navigateur (voir `frontend/README.md`). La page lit et écrit
en direct dans le Google Sheet via le backend.

## Avant le tournoi (page admin)

### 1. Régler les horaires de la journée (carte « Horaires de la journée »)
- **Heure de début** (sélecteur d'heure).
- **Heure de fin** : cochée **« auto »** par défaut → elle est **calculée** à la génération
  (fin du dernier match). Décoche « auto » pour la **fixer manuellement**.
- **Battement entre matchs (min)** : temps pour libérer un terrain entre deux matchs.
- **Pause déjeuner** : heure de début + durée.
- Cliquer **« Enregistrer les horaires »**.

### 2. Régler les catégories (cartes par catégorie)
Chaque catégorie est modifiable directement :
- Interrupteur **« Présente »** (une catégorie absente est ignorée dans la génération).
- **Terrains** dédiés (numéros séparés par des virgules, ex : `1,2,3`).
- **Nombre de poules** : laisser **vide (« Auto »)** pour un calcul automatique selon le nombre
  d'équipes (≈ 4 par poule), ou saisir un **nombre** pour le forcer. Si un forçage rallonge trop
  la journée, l'assistant d'arbitrage propose des pistes (dont « revenir en Auto »).
- **nb de mi-temps**, **durée de mi-temps**, **pause mi-temps**, **récup. entre matchs**.
- **« Enregistrer »** par catégorie. On peut **ajouter** (nom, ex `U16`) ou **supprimer** une catégorie.

### 3. Saisir les équipes (section « Équipes »)
- Taper le **nom** (mis automatiquement en MAJUSCULES), choisir la **catégorie** (parmi les
  présentes), **« Ajouter »**.
- La liste apparaît, groupée par catégorie ; bouton **« Supprimer »** par équipe.
- **Plusieurs équipes d'un même club** : les nommer `CLUB-1`, `CLUB-2` (tiret + numéro) — elles
  seront automatiquement placées dans des **poules différentes** au tirage du matin. *(Attention :
  un chiffre collé au nom, comme « RACING 92 », fait partie du nom ; utiliser le tiret pour
  distinguer les équipes : « RACING 92-1 », « RACING 92-2 ».)*

### 4. Générer les poules et le planning (section « Poules & planning »)
- Cliquer **« Générer poules et planning »** (confirmation : cela **efface** poules, matchs et
  scores précédents).
- L'outil répartit les équipes en poules (par catégorie), crée tous les matchs (chacun contre tous
  dans sa poule) et calcule les horaires **sans conflit** (récup, battement terrain, pause déjeuner).
- Le résultat s'affiche : composition des poules + tableau du planning (heure, terrain, poule, match).

### Assistant d'arbitrage (si heure de fin manuelle dépassée)
Si l'heure de fin est **fixée manuellement** et que le planning la dépasse, l'outil propose des
**pistes d'ajustement** chiffrées (commencer plus tôt, réduire la pause / le battement, ajouter un
terrain, raccourcir les mi-temps, réduire la récup ou la taille des poules). Chaque piste indique
l'heure de fin obtenue et si elle **tient** le créneau (✅). **Cliquer** sur une piste applique le
réglage et régénère automatiquement.

## Pendant le tournoi
- **Saisie des scores** (page dédiée → à venir) : entrer le score de chaque match terminé.
- Les **classements** et le **live** se mettront à jour automatiquement.

## Pour les visiteurs (à venir)
- **Mon planning** : chaque personne choisit son équipe et voit uniquement ses matchs.
- **Live** : classements par catégorie, derniers scores, favoris (étoile stockée dans le
  navigateur), et lien de don HelloAsso.
