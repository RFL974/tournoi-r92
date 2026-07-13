# Phases du tournoi (matin / après-midi)

> 🧭 Note de conception. Le **format** de l'après-midi est désormais **décidé** (voir ci-dessous) ;
> l'implémentation se fait par étapes (prérequis d'abord).

## ✅ Décisions prises (2026-07-13)
- **Format = classement croisé** : les équipes de **même rang de poule** jouent ensemble (tous les
  1ers ensemble, tous les 2es, etc.). Chaque groupe de rang = **round-robin**. Ex. U8 réel = 3 poules
  (A/B/C) → 4 groupes de 3 équipes → 3 matchs par groupe. Adapté rugby jeunes (tout le monde continue).
- **Fabrication = génération en 2 temps** : bouton « Générer l'après-midi » **après** saisie des
  scores du matin, qui crée les matchs avec les vraies équipes. (Pas de structure « à trous ».)

### Feuille de route (prérequis avant l'après-midi)
1. **Saisie des scores** — action `enregistrerScore` + page `saisie.html`. ✅ Fait (session 11).
2. **Calcul du classement** de poule (V=3/N=2/D=1, départage à la différence puis points marqués).
   ✅ Fait (session 12) : fonction `calculerClassement` + action `getClassement` + page `classement.html`.
3. **Génération après-midi** (classement croisé). ✅ Fait (session 13) : action `genererApresMidi`
   (construit les matchs croisés + les planifie après le déjeuner, sans effacer le matin) +
   bouton dans l'admin. Colonne `phase` (`poule`/`classement`) ajoutée à l'onglet `Matchs`.

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

### Impact sur les données (implémenté)
- L'onglet `Matchs` distingue la **phase** via la colonne `phase` (`poule` / `classement`) — ✅ ajoutée.
- Approche retenue = **génération en 2 temps** : les équipes de l'après-midi sont **fixées** au moment
  de la génération (une fois les scores du matin connus), pas laissées sous forme de règle/libellé.
