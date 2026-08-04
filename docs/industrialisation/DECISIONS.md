# DÉCISIONS — Industrialisation de Tournoi R92

> Ce fichier existe pour répondre à une question que se posera toujours une nouvelle session (ou un
> développeur extérieur) : **« pourquoi est-ce fait comme ça ? »**
>
> Une décision non écrite ici est une décision perdue.

**Dernière mise à jour** : 2026-08-04 (session 1)

---

## Modèle de fiche

```markdown
### D-0XX — <sujet>

| Champ | Valeur |
|---|---|
| **Date** | AAAA-MM-JJ |
| **Session** | N |
| **Statut** | PROPOSÉE / VALIDÉE / REFUSÉE / EN ATTENTE DE ROMAIN |
| **Décidée par** | Romain / Claude (technique) |

**Problème posé**
> …

**Décision prise**
> …

**Raison**
> …

**Conséquences**
> …

**Ce qui aurait été possible à la place** (et pourquoi ça n'a pas été retenu)
> …
```

---

## DÉCISIONS VALIDÉES

### D-001 — La mémoire du projet est dans le dépôt, pas dans la conversation

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ✅ VALIDÉE |
| **Décidée par** | Romain |

**Problème posé**
> Jusqu'ici, ce qui avait été compris du projet vivait dans la conversation en cours. Quand la
> conversation se termine, cette compréhension disparaît. Chaque nouvelle session risquait de
> refaire le même travail, ou pire, de repartir sur de fausses bases.

**Décision prise**
> La mémoire durable du projet est constituée de deux choses : le fichier `CLAUDE.md` à la racine
> (les règles de travail) et le dossier `docs/industrialisation/` (l'état réel du chantier). Une
> nouvelle session lit ces documents avant de décider quoi faire.

**Raison**
> Ces fichiers sont dans le dépôt Git : ils survivent aux conversations, ils sont datés, et on peut
> voir leur historique.

**Conséquences**
> Chaque session doit **écrire** ce qu'elle a fait avant de s'arrêter. Une session qui ne met pas à
> jour ces fichiers est une session perdue.

---

### D-002 — Une session = un objectif, puis arrêt

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ✅ VALIDÉE |
| **Décidée par** | Romain |

**Problème posé**
> Un travail d'industrialisation touche à tout : sécurité, données, interface, tests. Tout mélanger
> dans une même séance rend impossible de savoir ce qui a été vérifié et ce qui ne l'a pas été.

**Décision prise**
> Chaque session a **un seul objectif précis**. Quand il est atteint : mise à jour de la
> documentation, vérification de l'état Git, commit si nécessaire, rapport de fin de session,
> recommandation pour la suivante, puis **arrêt**. Jamais d'enchaînement automatique.

**Raison**
> Cela laisse à Romain le contrôle du rythme et la possibilité de valider chaque étape en la
> comprenant.

**Conséquences**
> Le travail avance par petits pas. C'est volontairement plus lent, et volontairement plus sûr.

---

### D-003 — Articulation avec l'audit de conformité FFR existant

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ✅ VALIDÉE par Romain le 2026-08-04 |

**Problème posé**
> Le dépôt contient déjà `AUDIT-TOURNOI-R92.md` : un gros document (~129 000 caractères) qui audite
> la conformité du tournoi aux règles de la Fédération Française de Rugby, avec sa **propre méthode
> par sessions**. Si on ne dit rien, on se retrouve avec deux systèmes de suivi qui racontent chacun
> une version de l'état du projet.

**Décision proposée**
> Les deux chantiers restent **séparés et complémentaires** :
> - `AUDIT-TOURNOI-R92.md` = **la règle du jeu** (ce que la FFR impose : catégories, durées, formes
>   de jeu, points). Il reste la source de vérité pour tout ce qui est réglementaire.
> - `docs/industrialisation/` = **la solidité de l'outil** (est-ce fiable, sûr, testé, respectueux
>   des données personnelles, utilisable sur le terrain).
>
> Quand l'audit métier (domaine A) touchera une règle FFR, on **renvoie** à `AUDIT-TOURNOI-R92.md`
> plutôt que de recopier son contenu.

**Raison**
> Recopier créerait deux versions de la même règle, qui finiraient par diverger.

**Conséquences si validée**
> `AUDIT-TOURNOI-R92.md` n'est pas modifié par ce chantier. Le domaine A se concentre sur ce que
> l'application **sait faire ou ne sait pas faire**, pas sur ce que la FFR impose.

---

### D-004 — Langue des messages de commit

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ✅ VALIDÉE par Romain le 2026-08-04 |

**Problème posé**
> Le prompt maître donne des exemples de commits en anglais
> (`fix(ranking): correct tie-break calculation`). Le dépôt utilise en réalité, depuis plus de 170
> commits, un format mixte : type et catégorie en anglais, description **en français**
> (`fix(sponsors): le bandeau du dossier écrasait son accroche`).
>
> *Un « commit », c'est une photo enregistrée du projet à un instant donné, avec une phrase qui
> explique ce qui a changé. L'ensemble des commits forme l'historique.*

**Décision proposée**
> Conserver la convention existante du dépôt : `type(scope): description en français`.

**Raison**
> Changer maintenant produirait un historique à deux langues, plus difficile à relire. Et la
> description en français est plus utile à Romain, qui est le premier lecteur de cet historique.

---

### D-006 — Comment les modifications arrivent dans le dépôt : documentation vs. code

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ✅ VALIDÉE par Romain le 2026-08-04 |
| **Décidée par** | Romain |

**Problème posé**
> L'habitude du projet est de passer par une « branche + pull request » : on travaille sur une copie
> de côté, et on la fusionne dans la version officielle après relecture. C'est une sécurité utile
> pour du code. Mais l'appliquer aux fichiers de suivi ralentirait chaque session sans rien
> protéger : ces fichiers ne s'exécutent pas, ils ne peuvent rien casser.

**Décision prise**
> - **Documentation** (`CLAUDE.md`, `docs/industrialisation/`, autres documents) : commit **direct
>   sur `main`**, sans branche ni pull request.
> - **Code de l'application** (`backend/`, `frontend/`, configuration) : la règle habituelle reste
>   entière — **branche + pull request**, et **validation de Romain avant toute modification**
>   (`CLAUDE.md` §7 ÉTAPE 4).

**Raison**
> Séparer ce qui est risqué de ce qui ne l'est pas. Un texte qui décrit le travail ne mérite pas la
> même cérémonie qu'un code qui calcule des scores le jour d'un tournoi.

**Conséquences**
> La mise à jour de fin de session est rapide et systématique — donc elle sera réellement faite.
> Une session qui mélangerait documentation **et** code devra faire **deux** choses distinctes :
> le commit de doc sur `main`, et une branche + PR pour le code.

---

## DÉCISIONS EN ATTENTE DE ROMAIN

### D-005 — Périmètre du dépôt à auditer

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ⏳ EN ATTENTE DE ROMAIN |

**Problème posé**
> L'application Tournoi R92 est reliée à un autre projet, le site vitrine `boutique-r92`, qui vit
> dans un **dépôt séparé** (non présent ici). Certains affichages publics existent des deux côtés.

**Décision proposée**
> L'industrialisation porte **uniquement** sur le dépôt `tournoi-r92`. Si l'audit révèle un risque
> qui concerne aussi `boutique-r92`, il est **signalé** dans `RISQUES.md`, mais non corrigé ici.

**Raison**
> Corriger à l'aveugle dans un dépôt qu'on ne peut pas lire est le meilleur moyen de casser quelque
> chose.

**Question à Romain** : veux-tu inclure `boutique-r92` dans le périmètre plus tard, et si oui,
peux-tu le rendre accessible ?
