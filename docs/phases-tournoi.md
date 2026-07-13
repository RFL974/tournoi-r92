# Phases du tournoi (matin / après-midi)

> 🧭 Note de conception pour une **fonctionnalité à venir**. Rien n'est encore implémenté pour
> l'après-midi ; ce document capture le besoin et les questions à trancher.

## Matin — phase de poules ✅ (fait)
Championnat : dans chaque poule, chaque équipe rencontre toutes les autres (round-robin).
Généré et planifié par `genererPoulesEtPlanning` (voir [`architecture.md`](architecture.md)).

## Après-midi — phase de classement / finales ⬜ (à concevoir)
La logique **change** l'après-midi : les rencontres ne sont plus le championnat de poule mais des
matchs qui **dépendent du classement du matin** (ex : phases finales, matchs de classement).

### Implication technique majeure
Ces matchs dépendent des **résultats du matin** (donc des **scores** saisis). Conséquences :
- On ne peut **pas** générer l'après-midi en même temps que le matin.
- Deux approches possibles :
  1. **Génération en 2 temps** : générer l'après-midi une fois les scores du matin saisis.
  2. **Structure à trous** : créer les créneaux de l'après-midi avec des libellés (« 1er poule A »,
     « vainqueur quart 1 »…) remplis automatiquement au fur et à mesure des résultats.

### Questions à trancher (prochaine session)
- **Format exact** de l'après-midi : élimination directe (tableau quart/demi/finale) ?
  matchs de classement croisés (1ᵉʳ vs 1ᵉʳ, 2ᵉ vs 2ᵉ…) ? autre ?
- Est-ce **le même format pour toutes les catégories**, ou réglable par catégorie / par édition ?
- **Classement de poule** : barème déjà défini (V=3 / N=2 / D=1, départage à la différence) —
  suffisant pour désigner les qualifiés ? gestion fine des égalités ?
- **Horaires/terrains de l'après-midi** : reprise après la pause déjeuner, mêmes terrains dédiés ?
- Faut-il une **page/écran dédié** côté admin pour lancer/ajuster la phase de l'après-midi ?

### Impact sur les données
- L'onglet `Matchs` devra sans doute distinguer la **phase** (poule / classement / finale) —
  probablement une colonne supplémentaire (ex : `phase`) à prévoir.
- Les équipes d'un match d'après-midi peuvent être **déterminées par une règle** plutôt que fixées
  (ex : « 1er de poule A ») tant que les scores ne sont pas connus.
