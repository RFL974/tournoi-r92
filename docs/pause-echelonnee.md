# Pause méridienne échelonnée (réglage global des horaires)

> **Le problème.** Avec **peu de terrains** (typiquement 2 pour l'U14), une **pause déjeuner unique**
> laisse **tous les terrains à l'arrêt** pendant sa durée. La matinée « ne rentre » alors plus dans
> les horaires, à moins d'ajouter un terrain qu'on n'a pas.

## Le principe

Quand la case **« Pause échelonnée »** est cochée pour une catégorie, celle-ci joue en **un seul
round-robin** (chaque équipe rencontre toutes les autres une fois), planifié en **deux vagues** :

- **Vague 1** = la première moitié des équipes ; **Vague 2** = la seconde moitié.
- **Matin** : matchs **inter-vagues** (Vague 1 contre Vague 2) — tout le monde à égalité de fatigue.
- **Pause 1** : pendant que la **Vague 1 se repose** (≥ 60 min), la **Vague 2 joue ses matchs internes**.
- **Pause 2** : l'inverse — la **Vague 2 se repose**, la **Vague 1 joue les siens**.
- **Après-midi** : le reste des matchs **inter-vagues** — tout le monde est reposé.

Les terrains ne s'arrêtent jamais (pas de temps mort de pause globale), ce qui **rend jouable** une
journée qui, autrement, ne tenait pas.

## Les deux garanties

1. **Repos ≥ 60 min** pour **chaque** équipe (forcé par construction ; si un cas dégénéré passe sous
   le seuil, c'est **signalé** à la génération — jamais violé en silence).
2. **Équité** : un match **inter-vagues** ne tombe **jamais** pendant une pause. Donc **jamais** une
   équipe reposée contre une équipe épuisée en attente de sa pause. (Vérifié par les tests : 0 violation.)

## Conditions et repli

- **Effectif ≥ 4** requis (**pair ou impair** : les vagues inégales d'un effectif impair sont gérées
  par un **« bye »** — une équipe se repose la tournée où elle tombe en face du vide). En dessous de
  4 équipes, l'app **retombe automatiquement** sur la **pause classique** avec un **avertissement**
  clair — la génération n'échoue jamais.
- **Terrains dédiés** à la catégorie recommandés (le planning des deux vagues occupe ses terrains en continu).
- Cette option **remplace** la **pause déjeuner unique** **et** le **format d'après-midi** des
  catégories concernées (chacune devient un seul round-robin, donc pas de phase de classement croisé).

## Réglage global + pause déjeuner « à partir de »

C'est un **réglage GLOBAL** (carte **Horaires de la journée**, case au-dessus de la pause déjeuner),
pas par catégorie : quand il est coché, il s'applique à **toutes les catégories présentes** (≥ 4
équipes ; les autres restent en pause classique). Quand il est actif :

- la **« Pause déjeuner — début »** devient **« Pause déjeuner à partir de »** : l'heure à laquelle
  la pause échelonnée commence (les équipes ne partent pas en pause avant). Le **champ « durée »**
  disparaît (chaque équipe a 60 min garanti) ;
- après **« Générer les poules »**, l'app affiche **l'heure à laquelle la dernière équipe finit sa
  pause** (les deux vagues se relaient : la 2ᵉ vague déjeune après la 1ʳᵉ, donc en début d'après-midi).

## Où c'est réglé / stocké

- **Administration** → carte **Horaires de la journée** → case **« Pause méridienne échelonnée »**.
- **Config (global)** : `pause_echelonnee` (`oui` / vide) et `pause_echelonnee_fin` (heure calculée à
  la génération) — voir [`structure-google-sheet.md`](structure-google-sheet.md).

## Côté technique (rappel)

Backend ([`../backend/Code.gs`](../backend/Code.gs)) : `planifierCategorieEchelonnee` (fonction pure)
construit et date les matchs des deux vagues ; `calculerPlanning` l'appelle pour les catégories
`pause_echelonnee = oui` (une seule poule « A », pas de pause globale). Ne consomme aucune donnée
externe : entièrement testé (partition en vagues, round-robin complet **pair et impair**, repos ≥ 60,
équité 0 violation, intégration, repli si moins de 4 équipes). Les vagues inégales (effectif impair)
sont gérées par `tourneesBipartites` (tournées avec bye).
