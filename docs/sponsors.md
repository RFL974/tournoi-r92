# Partenaires (sponsors) sur la page publique

> **Statut : PROTOTYPE.** Objectif = démontrer la faisabilité et montrer le résultat sur la
> vraie page des scores le jour J. **Aucun service payant, aucun serveur en plus.** Tout tient
> dans ce qui existe déjà : Google Sheet, Apps Script, Drive, GitHub Pages, relais Cloudflare
> gratuit. Ce qui est volontairement laissé de côté est listé en fin de document.

## En un coup d'œil

| | |
|---|---|
| **Où ça s'affiche** | `frontend/tournoi.html` (page publique des scores) |
| **Où ça se règle** | `admin.html` → écran **Partenaires** |
| **Où c'est stocké** | onglet **Sponsors** du Google Sheet + paramètres de l'onglet **Config** |
| **Coût réseau** | **zéro requête en plus** — les partenaires voyagent dans l'instantané `getAll` |
| **Mesure** | comptée dans le navigateur, **consolidée entre tous les appareils** — aucun cookie, aucun tiers |
| **Interrupteur général** | `sponsors_actifs` — sur `non`, la page publique est **exactement celle d'avant** |

---

## 1. Les emplacements

Les cinq premiers sont sur la page publique des scores ; le sixième est sur le **dossier club**.

| Code | Nom | Comportement | Combien de partenaires |
|------|-----|--------------|------------------------|
| **A** | `bandeau` | Bandeau sous le titre, **permanent**, ne bouge jamais | 1 (tiré par la roue à chaque chargement) |
| **B** | `rail` | Colonne de droite sur ordinateur, **barre basse** sur téléphone, **rotatif** | 2 à 6 |
| **C** | `fil` | Encart au gabarit d'une carte de match, dans le fil des scores | 1, **figé pour la session** |
| **D** | `plein` | Message plein écran à l'arrivée, passable | 1 par affichage |
| **E** | `mur` | Grille de tous les logos, en bas de page | tous |
| **F** | `dossier` | Bandeau permanent en tête du **dossier club**, imprimé avec le PDF | ceux qui sont cochés |

### F — le dossier club, un cas à part

Le dossier (`dossier-club.html`) est le document envoyé aux clubs inscrits. Trois différences
volontaires avec la page des scores :

- **Bandeau permanent uniquement, et JAMAIS de message plein écran.** Un club ouvre son dossier
  pour trouver un horaire, un parking, un contact — il ne doit pas attendre. C'est la contrainte
  d'origine de cet emplacement, et elle est inscrite dans le code, pas seulement dans un réglage.
- **Aucune rotation** : tous les partenaires cochés figurent côte à côte. Le dossier s'imprime, et
  ce qui tourne n'existe pas sur le papier — un club qui garde son PDF doit y retrouver
  exactement ce qu'il a vu à l'écran.
- **Pas d'accroche commerciale**, seulement les logos : c'est un document d'organisation.

Deux verrous : l'**interrupteur général** `sponsors_actifs` (le même que la page des scores — on
n'allume pas les partenaires à moitié) et la case **F** cochée sur la fiche du partenaire. Un
sponsor de la page des scores n'atterrit jamais sur le dossier sans décision explicite.

Les données viennent de `getAll`, déjà chargé par le dossier pour le planning : **aucun appel
réseau supplémentaire**. Le temps d'exposition et les clics y sont comptés comme ailleurs et
rejoignent la fiche de visibilité.

> ℹ️ La page d'**invitation** (`invitation-club.html`), envoyée avant l'inscription, n'a
> volontairement **pas** de partenaires : elle sert à convaincre un club de venir, pas à
> exposer des marques.

### La règle qui gouverne tout

> **Un parent qui ouvre la page pendant le match de son enfant doit voir le score en moins de
> trois secondes.**

Concrètement, dans le code :

- **Aucun saut de mise en page.** Chaque emplacement a une hauteur réservée en CSS *avant* que
  le logo arrive (`min-height` sur A, C, E ; pile de vues superposées sur B). Un logo qui charge
  en retard ne fait jamais sauter les scores sous le doigt.
- **La barre basse ne recouvre rien** : `body.sp-barre-active` réserve sa hauteur en bas de page.
- **Le plein écran ne s'ouvre qu'à l'arrivée**, jamais sur un rafraîchissement automatique
  (`sponsorPleinFait` dans `tournoi.js`), et jamais si le tournoi n'est pas publié.
- **Un seul appel commercial au-dessus du contenu** : quand le bandeau partenaire (A) est
  présent, le bandeau de don **descend** sous les contrôles (classe `don-bandeau-bas`, jouée
  par l'ordre flex de `.carte-app`).

---

## 2. La roue équitable

Le tirage au hasard ne convient pas : sur dix chargements il donnerait trois fois le gros
partenaire et zéro fois le petit — indéfendable en fin de saison.

`sponsorsTirer()` (dans `frontend/js/sponsors.js`) construit donc, **une fois par appareil**,
une liste où chaque partenaire figure `poids` fois, la mélange (Fisher-Yates), la mémorise, et
avance d'un cran à chaque affichage.

Conséquences :

- **tout le monde est vu une fois avant que quiconque soit vu deux fois** ;
- deux spectateurs n'ont pas la même séquence (pas d'effet « toute la tribune voit Décathlon
  en même temps ») ;
- chaque emplacement a **son propre curseur** : le partenaire du plein écran n'est jamais celui
  de l'encart au même instant ;
- le curseur n'avance **que si l'affichage a réellement eu lieu** — un rechargement pendant la
  période de repos ne consomme pas de tour ;
- la roue se reconstruit toute seule quand la composition change (ajout d'un partenaire, poids
  modifié) : c'est la `signature` qui le détecte.

Le **poids (1 à 5)** est le seul levier commercial, et il est explicable tel quel au partenaire :
poids 3 = trois fois plus de tours dans la roue que poids 1.

---

## 3. Réglages (onglet `Config`)

Tous sont écrits par l'écran admin et exposés à la page publique via
`CONFIG_PUBLIQUE_VUES.live` — **liste blanche opt-in : un paramètre non déclaré là ne sort
jamais**, et la page conclurait « sponsors désactivés » en silence.

| Paramètre | Défaut | Bornes | Effet |
|---|---|---|---|
| `sponsors_actifs` | `non` | oui/non | Interrupteur général. Sur `non`, page inchangée. |
| `sponsors_mur_actif` | `oui` | oui/non | Emplacement E. |
| `sponsor_barre_mobile` | `oui` | oui/non | Emplacement B sur téléphone. |
| `sponsor_rotation_s` | `8` | 0–60 | Secondes entre deux partenaires du rail. 0 = pas de rotation. |
| `sponsor_interstitiel_actif` | `non` | oui/non | Emplacement D. |
| `sponsor_interstitiel_duree_s` | `5` | 3–10 | Fermeture automatique. |
| `sponsor_interstitiel_skip_s` | `2` | 0–10 | Délai avant que « Passer » devienne actionnable. **Toujours raboté à la durée.** |
| `sponsor_interstitiel_repos_min` | `30` | 1–240 | Période avant de revoir le message. |
| `sponsor_interstitiel_premiere_visite` | `non` | oui/non | `non` = pas de message à la toute première arrivée de la journée. |

Les bornes sont appliquées **deux fois** — dans l'admin (`admin-sponsors.js`) et dans le backend
(`bornerReglageSponsor`). Ce n'est pas de la redondance décorative : elles empêchent qu'une
faute de frappe (« 500 » au lieu de « 5 ») ne transforme le message en écran bloquant le jour J.

## 4. Fiche partenaire (onglet `Sponsors`)

| Colonne | Rôle |
|---|---|
| `id_sponsor` | Identifiant tiré au sort à la création (`SP…`). |
| `nom` | Sert aussi de texte alternatif pour les lecteurs d'écran. |
| `logo_id` | Fichier Drive, public en lecture — même mécanisme que `tournoi_affiche_id`. |
| `url` | Site du partenaire. Lien en `rel="noopener sponsored"`, nouvel onglet. |
| `accroche` | Une ligne, 60 caractères, affichée sous le logo. |
| `emplacements` | `bandeau,rail,fil,plein,mur,dossier` (virgules). Vide ⇒ `mur`. |
| `poids` | 1 à 5. Part dans la roue. |
| `visuel_id` | Visuel plein écran fourni par le partenaire (facultatif). |
| `couleur` | `#RRGGBB`, fond du plein écran auto-composé. |
| `actif` | `oui` = visible. Toute autre valeur ⇒ retiré de la page **sans perdre la fiche**. |
| `ordre` | Position dans le mur des partenaires uniquement. |
| `logo_zoom` | Taille du logo en **% de la taille de référence** (50 à 200, défaut 100). |

**Sans logo**, le partenaire s'affiche en pastille à son nom sur sa couleur de marque : un
commerçant qui n'a pas de fichier exploitable reste affichable, et la démo fonctionne avant
même le premier téléversement.

**Logo qui paraît trop petit ?** Beaucoup de fichiers embarquent leurs propres **marges
blanches** : le logo semble minuscule alors que l'image, elle, est à la bonne taille. Aucun
réglage global ne peut le rattraper — le vide fait partie du fichier. D'où `logo_zoom`, réglable
par partenaire dans l'admin (130 à 150 % dans ce cas). Recadrer le fichier reste la meilleure
solution, le zoom est le rattrapage.

**Fond blanc peint au téléversement.** Un canevas vierge est transparent-**noir** : tout maillon
qui aplatit la transparence (encodage JPEG, mais aussi le proxy d'images qui sert les fichiers
Drive) fait ressortir un logo détouré sur un carré noir. On peint donc un fond blanc sous le
logo à l'envoi — plus de transparence à rater, donc plus aucun maillon capable de la rater. Les
tuiles qui accueillent les logos sont blanches, le fond peint est invisible.

**Sans visuel plein écran**, l'interstitiel se compose tout seul (logo + accroche + couleur) :
inutile de relancer douze commerçants pour une image.

L'onglet `Sponsors` **survit à une réinitialisation du tournoi**, comme `ClubsInvites` : un
partenariat se reconduit d'une édition à l'autre, et le réinitialiser obligerait à re-téléverser
tous les logos. Pour retirer un partenaire, on décoche `actif`.

---

## 5. La mesure — et ses limites, dites franchement

### Ce qui est compté

| Indicateur | Comment |
|---|---|
| **Temps d'exposition réel** | Logo présent à **plus de 50 % dans l'écran** (`IntersectionObserver`) **et** onglet au premier plan (`document.hidden`). Le compteur s'arrête quand le téléphone se verrouille. |
| **Affichages** | Chaque apparition distincte — un tour de rotation, un encart rendu, un plein écran ouvert. |
| **Clics** | Sur le logo ou l'accroche, par emplacement. |
| **Plein écran** | Durée réellement regardée + part de visiteurs qui passent avant la fin. |
| **Courbe de visibilité** | Par tranche de 30 minutes, sur toute la journée. |
| **Part de voix** | Part du partenaire dans l'exposition sponsor totale. |

Pourquoi le temps d'exposition plutôt que les impressions : **« 12 000 impressions » ne veut rien
dire pour un bandeau permanent** — c'est juste le nombre d'ouvertures de la page. L'unité qu'un
partenaire peut comparer à un panneau au bord du terrain, c'est le temps réellement passé à
l'écran.

### La remontée : tous les appareils, sans verrou et sans serveur en plus

Les compteurs sont calculés dans le navigateur, puis **remontés** pour que la fiche porte sur
tous les spectateurs.

**Le chemin.** Une action `mesureSponsors` dans `doPost`, traitée **avant le contrôle de clé et
avant le verrou d'écriture**, qui ajoute une ligne à l'onglet `Mesures`. C'est la seule écriture
publique du backend, et le contournement du verrou est le vrai enjeu : la saisie des scores en
prend un à chaque validation, et des relevés passant par le chemin normal feraient attendre le
marqueur au bord du terrain.

**Le rythme.** Un premier relevé **20 secondes** après l'ouverture, puis un **toutes les 10
minutes**, plus un dernier à la fermeture. Le premier est volontairement rapide : la plupart des
visites durent moins d'une minute, et si leur seul relevé était celui de la fermeture — le moment
où le navigateur peut couper la requête — ces spectateurs manqueraient à la portée annoncée.
Ordre de grandeur : ~2 à 3 relevés par visite, soit quelques milliers de lignes sur une journée.

**Pourquoi ça reste juste sans coordination.** Deux propriétés, et elles se répondent :

- les relevés sont **cumulatifs**, jamais des écarts → un relevé perdu ne coûte que le temps
  écoulé depuis le précédent, jamais l'historique de la session ;
- la consolidation prend le **maximum par session**, puis **somme les sessions** → un relevé
  arrivé deux fois ne compte pas double.

C'est ce qui autorise à écrire **sans verrou et sans jamais relire** : `appendRow` ajoute en fin
d'onglet, et deux relevés simultanés qui se marcheraient dessus ne coûteraient qu'une mesure
d'audience — jamais un score.

⚠️ **Le piège à éviter si vous touchez à ce code** : additionner les relevés d'une même session
au lieu d'en prendre le maximum. Le temps d'exposition serait alors compté autant de fois qu'il
y a eu d'envois — un chiffre faux, et faux **à la hausse**, donc invisible à la relecture.

### « J'ai déployé, et pourtant rien ne remonte »

L'écran Partenaires a un bouton **« Tester la remontée »** qui éprouve la chaîne maillon par
maillon et **nomme celui qui casse**, au lieu de laisser deviner :

1. **Écriture** — envoie un relevé de test au backend. S'il répond *« Action inconnue »*, le
   déploiement n'a pas pris.
2. **Relecture** — vérifie que ce relevé ressort bien.
3. **Relevés réels** — compte ceux déjà remontés des spectateurs.

> 🐛 **Un piège déjà rencontré, corrigé, et à ne pas réintroduire.** `appendRow` écrit la journée
> en chaîne, mais **Sheets la convertit en vraie date** : la relecture reçoit alors un objet
> `Date` et le filtrage par journée ne trouve plus rien — les relevés sont dans le Sheet, et la
> fiche annonce « aucun relevé ». `mesureJourTexte` normalise les deux formes, et l'onglet est
> créé au format texte. Ne « simplifiez » pas cette comparaison.

> ⚠️ **L'autre cause fréquente** : avoir cliqué *« Nouveau déploiement »* au lieu de
> **Gérer les déploiements → ✏️ → Version : Nouvelle version**. Le premier crée une **nouvelle
> URL** ; `frontend/js/config.js` pointe alors toujours sur l'ancienne, qui exécute l'ancien
> code. Tout *semble* déployé, et rien ne l'est.

Le relevé de test porte l'identifiant réservé `__test__` : il est filtré de la consolidation et
n'apparaît jamais dans la fiche d'un partenaire, ni dans la portée annoncée.

### Ce que la fiche annonce

- Des relevés sont arrivés → **« Mesuré sur N appareils, M visites »**, chiffres consolidés.
- Aucun relevé → **« Mesuré sur cet appareil seulement »**, et elle le dit plutôt que de laisser
  croire à une audience non mesurée.

Dans les deux cas c'est un **plancher mesuré** : un appareil équipé d'un bloqueur, fermé
brutalement ou en navigation privée peut manquer à l'appel. Jamais une estimation.

Pour une réunion sponsors, le champ **Projection** multiplie les chiffres par une fréquentation
saisie à la main. La fiche porte alors un bandeau **« Projection — données simulées »**
impossible à retirer par erreur.

### Vie privée

Aucun cookie, aucun traceur tiers, aucune donnée personnelle. Seulement **deux identifiants
aléatoires** tirés sur l'appareil et **remis à zéro chaque jour** : l'un compte la portée
(combien d'appareils), l'autre la visite. Ils ne permettent d'identifier personne, ni de suivre
qui que ce soit d'un site à l'autre. L'onglet `Mesures` est isolé — aucune autre partie du
logiciel ne le lit — et se vide d'un bouton depuis l'admin.

### La surface publique, dite franchement

`mesureSponsors` est une écriture **sans clé** : les spectateurs n'en ont évidemment pas. Ce que
ça implique, et pourquoi c'est tenable ici : la charge utile est minuscule et **entièrement
revalidée** côté serveur (identifiants au format strict, 40 partenaires maximum, chaque compteur
borné) ; elle n'écrit que dans `Mesures`, effaçable d'un bouton ; et rien de ce qui y entre n'est
jamais réinjecté ailleurs. Un abus ne peut donc que polluer une mesure d'audience — pas un score,
pas un classement, pas un dossier.

---

## 6. Le mode démo

```
https://rfl974.github.io/tournoi-r92/tournoi.html?demo=sponsors
```

- force l'affichage des partenaires **même si l'interrupteur général est sur `non`** ;
- rejoue le plein écran **à volonté** (pas de période de repos) ;
- accélère la rotation ;
- ajoute une barre flottante : **Rejouer le plein écran** et **Repérer les emplacements** ;
- si **aucun** partenaire n'est enregistré, injecte cinq partenaires d'exemple.

C'est un simple paramètre d'URL : **la page publique reste intacte pour les spectateurs**. Il
permet de préparer et de répéter la démonstration sans rien activer en production.

Recommandation pour le jour J : garder l'interrupteur général sur `non` (page publique
strictement identique à aujourd'hui) et basculer depuis l'admin, en direct, au moment de la
démonstration — le retour en arrière prend une seconde.

---

## 7. Fichiers

| Fichier | Rôle |
|---|---|
| `frontend/js/sponsors.js` | **Le moteur.** Roue équitable, rendu des 5 emplacements, plein écran accessible, mesure locale, mode démo. Partagé public/admin. |
| `frontend/js/tournoi.js` | `appliquerSponsors()`, `encartFil()`, insertion dans les deux vues. |
| `frontend/css/tournoi-public.css` | Section 19 — styles des emplacements A à E. |
| `frontend/js/dossier.js` | `bandeauPartenaires()` — l'emplacement F, en tête du dossier club. |
| `frontend/css/dossier.css` | Styles du bandeau F, écran **et** impression. |
| `frontend/js/admin-sponsors.js` | Écran admin : réglages, fiches, fiche de visibilité. |
| `frontend/css/theme-r92.css` | Styles de l'écran admin + règles d'impression de la fiche. |
| `backend/Code.gs` | Onglet `Sponsors`, `lireSponsorsPublics`, CRUD, réglages, liste blanche `live`. |

### Accessibilité du plein écran

Vraie boîte de dialogue : `role="dialog"` + `aria-modal`, focus capturé à l'intérieur (piège à
Tab), `Échap` qui ferme, focus rendu à son point de départ. Le bouton « Passer » fait au moins
44 px, il est **visible dès le départ** (jamais de croix cachée) et affiche son décompte — le
conteneur porte le focus initial, car un bouton désactivé ne peut pas le recevoir. Les fondus
respectent `prefers-reduced-motion`.

---

## 8. Hors périmètre — documenté, pas construit

| Ce qui manque | Pourquoi | Ce qu'il faudrait |
|---|---|---|
| **Consolidation entre appareils** | Le prototype démontre la mécanique, pas l'échelle. | Un petit collecteur Apps Script **déployé séparément** de l'API des scores (pour ne pas partager son verrou), écrivant dans un onglet `Mesures` ; la page enverrait un relevé unique par visite via `sendBeacon`. Une soixantaine de lignes, gratuit. |
| **Compteur en direct dans l'admin** | Sans consolidation, il n'afficherait que l'appareil qui regarde. | Découle du point précédent. |
| **Ciblage** (par catégorie, par créneau) | Aucun besoin exprimé. | Colonnes supplémentaires dans l'onglet `Sponsors`. |
| **Tout service payant** | Contrainte explicite du projet. | — |

## 9. Mise en service

1. **Backend** — redéployer la Web App Apps Script (Déployer → Gérer les déploiements →
   crayon → Nouvelle version), pour garder la même URL. L'onglet `Sponsors` se crée tout seul à
   la première écriture (`assurerOngletSponsors`) : inutile de relancer `setupSheet`, qui
   réécrirait `Config`.
2. **Admin** — écran **Partenaires** : saisir les fiches, régler l'affichage, laisser
   l'interrupteur général sur `non`.
3. **Répéter** — ouvrir `tournoi.html?demo=sponsors` et vérifier le rendu sur téléphone.
4. **Le jour J** — basculer l'interrupteur général quand on veut montrer le résultat.
5. **Après** — écran Partenaires → *fiche de visibilité* → **Imprimer / PDF** pour chaque
   partenaire, ou **Exporter en CSV**.
