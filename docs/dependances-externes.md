# Les bibliothèques extérieures du projet

> 📦 **Ce document répond à une seule question** : *quel code, écrit par quelqu'un d'autre, tourne
> dans le navigateur de nos utilisateurs — et comment savoir si une faille publiée nous concerne ?*
>
> Il ferme le problème **R-024** du chantier d'industrialisation.

---

## 1. Pourquoi ce document existe

Une **bibliothèque** *(en anglais « library »)*, c'est un morceau de programme écrit par quelqu'un
d'autre, qu'on réutilise au lieu de le réécrire. Fabriquer un PDF ou un QR code à la main
demanderait des mois ; ces bibliothèques le font en quelques lignes.

**Le problème n'est pas de les utiliser — c'est de ne pas savoir laquelle on utilise.**

> 🏉 **L'analogie.** Imagine que le club ait acheté quatre lots de ballons. Un jour, le fabricant
> annonce : *« les ballons du lot 12 se dégonflent au bout d'une heure, rapportez-les »*. Si personne
> n'a noté quel lot on a acheté, on ne peut **ni** se rassurer, **ni** agir. On reste dans le doute,
> indéfiniment.
>
> C'est exactement la situation quand une faille de sécurité est publiée sur une bibliothèque : sans
> son **numéro de version**, la question *« est-ce qu'on est concerné ? »* n'a pas de réponse.

---

## 2. ✅ Le bon choix déjà fait : elles sont hébergées ici

Ces quatre bibliothèques sont **dans le dépôt**, pas chargées depuis un site extérieur au moment où
la page s'ouvre. C'est un **choix prudent**, et il a trois conséquences positives :

1. **aucune adresse extérieure n'est appelée** depuis le téléphone d'un spectateur — donc aucun site
   tiers ne voit passer nos visiteurs ;
2. **le code ne peut pas changer sous nos pieds** : un fichier hébergé ailleurs peut être remplacé
   par son propriétaire ; celui-ci ne bougera que si nous le remplaçons ;
3. **la page fonctionne même si le site d'origine disparaît.**

> ⚠️ **La contrepartie, et c'est tout l'objet de ce document** : une bibliothèque hébergée chez nous
> **ne se met jamais à jour toute seule**. Si une faille est corrigée en amont, il faut aller
> chercher le nouveau fichier **à la main**. Encore faut-il savoir lequel on a.

---

## 3. 📋 L'inventaire

**Relevé du 2026-08-09.** Emplacement : `frontend/js/vendor/`.

### 3.1 — Le tableau

| Fichier | Taille | Version | Origine | Licence | Entrée dans le dépôt | Chargée par |
|---|---|---|---|---|---|---|
| `pdf-lib.min.js` | 525 099 o *(513 Kio)* | ⚠️ **à confirmer** | **pdf-lib** — `github.com/Hopding/pdf-lib` *(déduit du code, voir §3.3)* | ⚠️ **à confirmer** | **2026-07-31**, commit `62cbfac` *(« feat(autorisation) : télécharger le formulaire officiel FFR pré-rempli (PDF) »)* | `admin.html` |
| `docxtemplater.min.js` | 93 034 o *(91 Kio)* | ⚠️ **à confirmer** | **docxtemplater** *(à confirmer)* | ⚠️ **à confirmer** | **2026-07-23**, commit `bfcd762` *(« Sprint 3 : dossier d'invitation, clubs invités et autorisation droit à l'image »)* | ❌ **plus aucune page** |
| `pizzip.min.js` | 80 514 o *(79 Kio)* | ⚠️ **à confirmer** | **PizZip** *(à confirmer)* | ⚠️ **à confirmer** — le fichier renvoie à `pizzip.min.js.LICENSE.txt`, **absent du dépôt** | **2026-07-23**, commit `bfcd762` | ❌ **plus aucune page** |
| `qrcode.js` | 56 694 o *(55 Kio)* | ⚠️ **à confirmer** | ✅ **CERTAIN** — *QR Code Generator for JavaScript*, **Kazuhiko Arase**, `http://www.d-project.com/` *(écrit en clair dans l'en-tête du fichier)* | ✅ **CERTAIN — MIT** *(déclarée dans l'en-tête)* | **2026-07-23**, commit `f02b35e` *(« Sprint 2 dossier club »)* | `dossier-club.html` |

**Total : 4 fichiers, 755 341 octets — soit ~738 Kio.**

### 3.2 — L'empreinte : ce qui remplace la version en attendant

Une **empreinte** *(en anglais « hash »)* est une signature calculée à partir du contenu exact d'un
fichier. Deux fichiers identiques ont la même empreinte ; **un seul octet de différence la change
entièrement.**

> 🏉 **À quoi ça sert concrètement.** Tant qu'on ignore la version, l'empreinte permet quand même de
> répondre à *« est-ce bien ce fichier-là ? »*. Le jour où l'on identifie la version, on pourra
> **prouver** que c'est bien celle-ci qui est en service — au lieu de le supposer.

Empreintes **SHA-256**, calculées le 2026-08-09 :

| Fichier | SHA-256 |
|---|---|
| `pdf-lib.min.js` | `0f9a5cad07941f0826586c94e089d89b918c46e5c17cf2d5a3c6f666e3bc694f` |
| `docxtemplater.min.js` | `ee0cefeece9180e2242f06e5b01d75cd00ba1fc0c951e8543b59c17e581f2d71` |
| `pizzip.min.js` | `5a49e8df753c9f6d59d0a46839d086e6ab8b386a4c423ee4a7cbc8e7cbee02e3` |
| `qrcode.js` | `18ae399f81182bc9de916e9c77b195df20cc58d6f2d55a62b085a299f1bf1780` |

**Pour les recalculer** *(à faire après tout remplacement d'une bibliothèque)* :

```
sha256sum frontend/js/vendor/*.js
```

### 3.3 — ⚠️ Ce qui est marqué « à confirmer », et pourquoi

**Aucune version n'a pu être établie avec certitude, et rien n'a été inventé.**

Voici exactement ce qui a été cherché, et ce que ça a donné :

| Ce qui a été cherché | Résultat |
|---|---|
| Une bannière de version en tête de fichier | ❌ **aucune** des quatre n'en porte |
| Un motif `version: "x.y.z"` dans le contenu | ❌ aucune correspondance |
| Un fichier `package.json` ou un gestionnaire de paquets | ❌ **le projet n'en a pas** — les fichiers ont été copiés à la main |
| Le message du commit qui les a fait entrer | ❌ aucun ne nomme la version ni l'adresse de téléchargement |
| Un fichier de licence à côté | ❌ `pizzip.min.js.LICENSE.txt` est **annoncé mais absent** |

**Ce qui, en revanche, est CERTAIN et lu dans les fichiers eux-mêmes** :

- **`qrcode.js`** : son en-tête nomme l'auteur *(Kazuhiko Arase)*, l'adresse d'origine
  *(`d-project.com`)* et la licence *(MIT)*. **Origine et licence : établies.**
- **`pdf-lib.min.js`** : le fichier déclare l'objet global `PDFLib` et embarque la bannière `tslib`
  de Microsoft *(Apache 2.0)*. Le projet correspondant est **pdf-lib**. C'est une **déduction très
  solide, mais une déduction** : elle n'établit ni la version, ni la licence du fichier lui-même.
- **`pizzip.min.js`** : sa première ligne renvoie à un fichier de licence nommé
  `pizzip.min.js.LICENSE.txt`, ce qui identifie le projet **PizZip** — mais **le fichier de licence
  n'est pas dans le dépôt.**

> ⛔ **Consigne appliquée, mot pour mot** : *« si une version ou une origine ne peut pas être établie
> avec certitude, écris « à confirmer » plutôt que de l'inventer »* (Romain, 2026-08-09).
> **Un tableau à moitié vide mais vrai vaut mieux qu'un tableau complet et faux** — c'est la leçon
> **M-06**, et c'est le risque principal de ce chantier.

### 3.4 — Comment lever les « à confirmer » (quand tu voudras)

Ce n'est pas urgent, et **ça ne demande aucune ligne de code**. La méthode, pour chaque
bibliothèque :

1. télécharger la version officielle qu'on soupçonne ;
2. calculer son empreinte SHA-256 ;
3. **la comparer à celle du §3.2**. Si elles sont identiques, la version est **prouvée**, pas
   supposée — et on l'inscrit ici avec la date.

> 💡 Le jour où une de ces bibliothèques est **remplacée**, la bonne habitude est simplement de
> **noter la version et l'adresse au moment du téléchargement**. Cinq secondes sur le moment ; sinon,
> on retombe exactement dans la situation d'aujourd'hui.

---

## 4. ⚠️ Deux d'entre elles ne servent plus

**`docxtemplater.min.js` et `pizzip.min.js` — 173 548 octets, soit ~170 Kio — ne sont chargés par
aucune page.** Vérifié le 2026-08-09 : aucune balise `<script src="…">` ne les appelle, dans aucun
des 8 fichiers HTML.

**Ce n'est pas un oubli.** `frontend/README.md` l'écrit noir sur blanc : elles servaient à
l'autorisation de droit à l'image, retirée le 2026-08-03, et elles ont été **volontairement
conservées** au cas où la fonction reviendrait.

**Ce que ça coûte aujourd'hui** : rien pour les spectateurs — *un fichier que personne ne demande
n'est jamais téléchargé*. La page publique reste légère. Le coût est ailleurs : ces 170 Kio sont
**publiés sur Internet à chaque déploiement**, et ils allongent la liste de ce qu'il faudrait
surveiller en cas de faille.

> 📌 **Ce point est suivi séparément** — c'est le problème **R-080**, et la décision de les retirer
> ou de les garder appartient à Romain. **Ce document ne tranche pas**, il constate.

---

## 5. Règle de tenue à jour

> ⚠️ **`CLAUDE.md` §8 bis s'applique ici aussi.** Une session qui **ajoute**, **remplace** ou
> **retire** une bibliothèque met ce tableau à jour **dans le même lot** — nom, version, origine,
> date, empreinte, licence, et quelle page la charge.
>
> Deux minutes sur le moment. Sinon, on refabrique exactement le problème que ce document vient de
> refermer.
