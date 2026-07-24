# Règles de classement — spécification unique

Ce document est **la** source de vérité du barème de classement. Il est **implémenté deux fois**
(voir « Pourquoi en double » plus bas) et les deux implémentations **doivent rester identiques** :

| Côté | Fichier | Fonctions |
|---|---|---|
| Backend (Apps Script) | [`backend/Code.gs`](../backend/Code.gs) | `enregistrerResultat`, `comparerClassement`, `calculerClassement` |
| Frontend (navigateur) | [`frontend/js/tournoi.js`](../frontend/js/tournoi.js) | `appliquer`, `comparer`, `compterMatch` |

> ⚠️ **Toute modification du barème ou du départage doit être répercutée des DEUX côtés.**
> Les deux fichiers portent un commentaire « CONTRAT PARTAGÉ » qui renvoie ici.

---

## Barème de points

Par match **terminé** (statut « terminé » + deux scores numériques valides) :

| Issue | Points | Constante |
|---|---|---|
| Victoire (`pour > contre`) | **3** | `POINTS_VICTOIRE` |
| Nul (`pour === contre`) | **2** | `POINTS_NUL` |
| Défaite (`pour < contre`) | **1** | `POINTS_DEFAITE` |

Statistiques cumulées par équipe : `j` (joués), `v`/`n`/`d` (victoires/nuls/défaites),
`bp` (buts/points pour), `bc` (contre), `diff = bp − bc`, `pts`.

## Départage (ordre décroissant)

À égalité, on départage dans cet ordre strict :

1. **Points** (`pts`)
2. **Différence** (`diff = bp − bc`)
3. **Points marqués** (`bp`)

Au-delà, l'ordre est celui du moteur de tri (non garanti) — pas de critère supplémentaire
(ex. confrontation directe) à ce jour.

## Quels matchs sont comptés

- Uniquement les matchs **terminés** avec deux scores **numériques** (`isFinite`).
- Le test « terminé » est **robuste au « é » décomposé (NFD)** renvoyé par le Sheet
  (`estTermineServeur` / `estTermine` : préfixe `termin`).
- Le **classement des poules** ne compte **que le matin** : les matchs de phase
  `classement` (après-midi croisé) sont **exclus**, sinon une régénération du croisé
  partirait d'un classement de poule faussé par l'après-midi.

---

## Pourquoi en double ?

Le backend tourne sous **Google Apps Script**, le frontend dans le **navigateur** : ils ne
peuvent pas `import`/partager un même fichier `.js`. Le classement est donc calculé :

- **côté serveur** (`calculerClassement`) — sert notamment à générer la phase après-midi
  (tirage croisé par niveaux) ;
- **côté navigateur** (`tournoi.js`) — recalculé en direct depuis le snapshot brut `getAll`
  (mis en cache ~10 s), pour l'affichage public temps réel sans appel serveur supplémentaire.

Si les deux barèmes divergent, **le classement affiché au public ne correspond plus à celui
qui sert à générer l'après-midi** → tirages incohérents. D'où ce document et les constantes
nommées (`POINTS_VICTOIRE` / `POINTS_NUL` / `POINTS_DEFAITE`) des deux côtés.
