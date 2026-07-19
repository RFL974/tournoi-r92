# Phases du tournoi (matin / après-midi)

> 🧭 Note de conception. Le **format** de l'après-midi est désormais **décidé** (voir ci-dessous) ;
> l'implémentation se fait par étapes (prérequis d'abord).

> 🆕 **Mise à jour (2026-07-19)** — l'après-midi est maintenant **configurable par catégorie** :
> `CROISE` (décrit ici), `LIBRE` (matchs amicaux) ou `COUPE_PLATEAU` (élimination directe + plateau).
> Le classement croisé ci-dessous reste le **format par défaut**. Détails et mode d'emploi complet :
> [`formats-apres-midi.md`](formats-apres-midi.md).

## ✅ Décisions prises (2026-07-13)
- **Format = classement croisé** : les équipes de **même rang de poule** jouent ensemble (tous les
  1ers ensemble, tous les 2es, etc.). Chaque groupe de rang = **round-robin**. Ex. U8 réel = 3 poules
  (A/B/C) → 4 groupes de 3 équipes → 3 matchs par groupe. Adapté rugby jeunes (tout le monde continue).
- **Fabrication = génération en 2 temps** : bouton « Générer l'après-midi » **après** saisie des
  scores du matin, qui crée les matchs avec les vraies équipes. (Pas de structure « à trous ».)

### Feuille de route (prérequis avant l'après-midi)
1. **Saisie des scores** — action `enregistrerScore` + page `saisie.html`. ✅ Fait (session 11).
2. **Calcul du classement** de poule (V=3/N=2/D=1, départage à la différence puis points marqués).
   ✅ Fait (session 12) : fonction `calculerClassement` + action `getClassement` ; affiché dans
   l'onglet **« Classements »** de `tournoi.html` (anciennement la page `classement.html`).
3. **Génération après-midi** (classement croisé). ✅ Fait (session 13) : action `genererApresMidi`
   (construit les matchs croisés + les planifie après le déjeuner, sans effacer le matin) +
   bouton dans l'admin. Colonne `phase` (`poule`/`classement`) ajoutée à l'onglet `Matchs`.

## Matin — phase de poules ✅ (fait)
Championnat : dans chaque poule, chaque équipe rencontre toutes les autres (round-robin).
Généré et planifié par `genererPoulesEtPlanning` (voir [`architecture.md`](architecture.md)).

## Après-midi — classement croisé ✅ (fait)
Les rencontres de l'après-midi **dépendent du classement du matin** : les équipes de **même rang de
poule** jouent ensemble (Niveau 1 = tous les 1ᵉʳˢ, Niveau 2 = tous les 2ᵉˢ, etc.), chaque niveau en
round-robin. Comme ces matchs dépendent des scores du matin, on procède en **2 temps** : le bouton
« Générer l'après-midi » les crée **une fois les scores du matin saisis**, avec les vraies équipes
(pas de structure « à trous »).

- L'onglet `Matchs` distingue la phase via la colonne `phase` (`poule` / `classement`).
- Le **classement général** ordonne par niveau (N1 avant N2…), puis résultats après-midi, puis
  matin ; barème V=3/N=2/D=1, départage à la différence puis points marqués. Le **podium** de la
  page publique s'appuie sur ce classement (voir [`guide-utilisateur.md`](guide-utilisateur.md)).
