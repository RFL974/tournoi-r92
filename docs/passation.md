# Passation & portabilité

Ce document décrit **tout** ce qu'il faut transférer pour que l'outil quitte l'ordinateur et les
comptes **personnels** qui l'hébergent aujourd'hui, et passe dans l'**environnement institutionnel
d'une organisation adoptante** — de la réception d'un nom de domaine à la passation complète.
Il remplace l'ancien `migration-association.md`.

> **Bonne nouvelle sur l'« ordi »** : rien n'est stocké *localement* de façon critique. Tout vit
> dans le cloud (GitHub, Google, éventuellement Cloudflare). L'ordinateur ne sert qu'à éditer le
> code. Une simple **copie du dépôt Git** suffit à ne rien perdre (voir §8).

---

## 0. ⛔ PRÉREQUIS — cette procédure n'est pas encore applicable

> ⚠️ **À lire avant tout le reste.** Ce document est une **procédure prête**, pas une procédure
> **en cours**. Rien de ce qui suit ne doit être engagé aujourd'hui.

**L'état réel, au moment où ces lignes sont écrites :**

| | |
|---|---|
| 🔵 **Ce que le logiciel est** | Un **développement personnel**, sur **données fictives**. ⛔ **Aucune exploitation réelle n'a jamais eu lieu** |
| ⛔ **Ce qu'aucune structure n'a fait** | **Aucune organisation n'a commandé, étudié, validé ni adopté ce logiciel.** Aucune n'est engagée, aucune n'est pressentie ici |
| 🎯 **Ce que ce document est donc** | La réponse à une question **conditionnelle** : *« si demain une organisation décidait officiellement d'adopter ce logiciel, comment transférerait-on proprement l'environnement ? »* |

**Sept conditions doivent être remplies AVANT d'ouvrir le §1**, et aucune ne relève de la
technique :

1. **décision explicite d'adoption** du logiciel par une organisation ;
2. **identification de l'organisation adoptante** — son nom, sa forme juridique, sa capacité à
   contracter et à ouvrir des comptes ;
3. **désignation de ses administrateurs** *(voir §0.1)* ;
4. **fourniture ou création de ses comptes institutionnels** — Google, GitHub, éventuellement
   Cloudflare et registrar ;
5. **arbitrage sur le domaine et l'hébergement** *(voir §0.2)* ;
6. **décisions juridiques et de protection des données** nécessaires — responsable du traitement,
   mentions légales, information des personnes, durées de conservation ;
7. **validation du jalon d'adoption** prévu par l'étape **CF-14 — Adoption institutionnelle** du
   chantier Confiance *(`industrialisation/PLAN.md` §14.3)*.

> ⚠️ **CF-14 n'est pas réalisée** — son existence et son objet sont inscrits au plan, son dossier
> n'est **pas rédigé**. ➡️ **La passation ne peut donc pas être déclenchée aujourd'hui**, et le
> présent document ne préjuge en rien de son issue : une organisation sollicitée peut accepter,
> demander des modifications, **ou ne pas souhaiter utiliser la solution**.

### 0.1 L'administrateur désigné — ce que le rôle exige

Plusieurs étapes ci-dessous ne peuvent être faites que par une personne disposant des accès de
l'organisation. Ce document **ne désigne personne** : il décrit **ce que le rôle demande**, et
l'organisation adoptante choisit qui l'occupe.

| Ce qu'il faut pouvoir faire | Où |
|---|---|
| Accepter un transfert de propriété de fichier, et déployer un script | Compte Google institutionnel |
| Accepter un transfert de dépôt, et administrer les réglages de publication | Compte ou organisation GitHub institutionnel |
| Valider une adresse d'expédition, ou confirmer un alias | Messagerie institutionnelle |
| Modifier des enregistrements DNS | Registrar du domaine, **si** un domaine est retenu |
| Conserver et transmettre des secrets *(les deux clés d'écriture)* | Hors du code, hors du dépôt |

> ⚠️ **Le rôle peut être tenu par plusieurs personnes** — rien n'impose une personne unique. Mais
> **au moins une** doit avoir chaque accès du tableau, sinon la procédure s'arrête en chemin.

### 0.2 ⏸️ Ce que ce document ne décide PAS

L'infrastructure actuelle **n'est pas un choix institutionnel** : c'est ce qui existe aujourd'hui,
pour un développement personnel.

| Point | État |
|---|---|
| **Le nom du dépôt** *(`tournoi-r92`)* | ⏸️ **Réserve assumée** — le renommer casserait les liens déjà distribués. À trancher avec l'hébergement |
| **GitHub Pages comme hébergeur** | ⏸️ **À décider par l'organisation.** ⚠️ Sa documentation **interdit** d'y faire tourner un service loué à des tiers — sans conséquence aujourd'hui, déterminant si l'usage change |
| **Le nom de domaine** | ⏸️ **À décider.** Le §5 explique **comment** en brancher un, jamais **lequel** |
| **Google Apps Script comme serveur** | ⏸️ **À réexaminer** au moment de l'adoption, avec le contrat qui l'accompagne |

➡️ Les sections qui suivent documentent **l'état technique actuel**, **ce qu'il faudrait
transférer**, et **les contrôles à faire**. Elles n'arbitrent pas à la place de l'organisation.

---

## 1. Inventaire : tout ce qui est lié à un compte personnel

| # | Élément | Où c'est aujourd'hui *(source)* | À transférer vers *(destination à déterminer)* |
|---|---------|----------------------|-------------------|
| 1 | **Google Sheet** (la base de données) | Compte Google personnel de développement | Compte Google institutionnel |
| 2 | **Projet Apps Script** (backend, lié au Sheet) + **déploiement** (URL `/exec`) | idem Sheet | idem Sheet (re-déploiement) |
| 3 | **Clés** admin/scores + réglages relais (Propriétés du script) | Script Properties | idem (à re-régler) |
| 4 | **Fichiers Drive** (affiches du tournoi) | Google Drive personnel | Drive institutionnel |
| 5 | **Dépôt GitHub + GitHub Pages** (`tournoi-r92`) | Compte GitHub personnel `RFL974` | Compte ou organisation GitHub institutionnel |
| 6 | **Compte Cloudflare** (relais CDN, *si activé*) | Cloudflare personnel | Cloudflare institutionnel |
| 7 | **Nom de domaine** | ⛔ **aucun** — les adresses sont en `*.github.io` | À décider *(§0.2)* |
| 8 | **Liens croisés** avec le site vitrine `boutique-r92` | URLs `rfl974.github.io/...` | URLs de la destination retenue |

> ℹ️ **Pourquoi les noms de comptes actuels figurent ici** : ce sont les **sources** du transfert,
> et les chaînes exactes à rechercher dans le code *(§6)*. Les retirer rendrait la procédure
> inexécutable. ⚠️ **Aucune destination n'est nommée** — c'est à l'organisation adoptante de les
> fournir.

---

## 2. Les 3 (et seulement 3) points de configuration à connaître

Toute la « tuyauterie » tient en **trois valeurs** :

1. **`SHEET_ID`** — dans `backend/Code.gs` (ligne ~11) : l'identifiant du Google Sheet.
2. **`API_URL`** — dans `frontend/js/config.js` : l'URL `/exec` du déploiement Apps Script (le
   backend que le frontend appelle).
3. **`SNAPSHOT_URL`** — dans `frontend/js/config.js` : l'URL du relais Cloudflare (vide si le relais
   n'est pas utilisé).

Plus, **hors code** (Propriétés du script Apps Script) : `CLE_ADMIN`, `CLE_SCORES`, et si relais
`RELAIS_URL` + `RELAIS_CLE`. On les (re)règle avec `configurerCles(...)` et `configurerRelais(...)`.

Si tu ne devais retenir qu'une chose : **après un transfert, ces valeurs doivent pointer vers les
nouveaux comptes.**

---

## 3. Passation Google (Sheet + Apps Script + Drive + clés)

### 3.1 Transférer la propriété du Google Sheet
1. Ouvrir le Sheet → **Partager** → ajouter l'adresse du **compte Google institutionnel**.
2. Sur cette adresse, ouvrir le menu de rôle → **« En faire le propriétaire »** → confirmer.
   *(Le projet Apps Script, étant « lié » au Sheet, suit automatiquement.)*
3. Vérifier ensuite, côté compte institutionnel, que le Sheet reste en partage **Restreint**
   (propriétaire seul) — ne jamais le passer en « toute personne disposant du lien » (l'ID est
   public dans le code).

> **Alternative** si le transfert de propriété direct n'est pas possible (comptes de domaines
> différents) : depuis le compte institutionnel, **faire une copie** du Sheet. Attention, une copie
> **recrée un projet Apps Script vierge** (voir 3.2) et un **nouveau `SHEET_ID`** (à reporter dans
> `Code.gs`).

> 🛟 **Avant de transférer quoi que ce soit** : faire une **copie de sauvegarde** du Sheet
> *(Fichier → Créer une copie)*, conservée par le compte d'origine jusqu'à la fin de la recette
> *(§9)*. C'est le seul filet en cas de transfert raté — et il ne coûte rien.

### 3.2 Re-déployer le backend sous le compte institutionnel (NOUVELLE `API_URL`)

> ⚠️ **Le serveur, ce sont DEUX fichiers** : `backend/Code.gs` **et** `backend/Tests.gs`. Une copie
> ou un nouveau projet Apps Script les demande **tous les deux**. Ne recoller que `Code.gs` laisse un
> harnais de tests périmé, et un bilan « au vert » ne prouve alors rien.
> **Les deux nombres de contrôle à vérifier après collage sont dans**
> [`deploiement.md`](deploiement.md).

Même après transfert, il faut **re-déployer** pour que le web app s'exécute sous le compte
institutionnel :
1. Google Sheet (compte institutionnel) → **Extensions → Apps Script**.
2. Vérifier que `SHEET_ID` (en tête de `Code.gs`) correspond bien au Sheet institutionnel.
   ⚠️ **Coller aussi `Tests.gs`**, puis lancer `lancerTestsFFR` → le bilan doit correspondre aux
   **deux nombres de contrôle de [`deploiement.md`](deploiement.md)** *(le bilan attendu **et** la
   dernière ligne du fichier)*. ⚠️ **Ces deux nombres changent à chaque fois que les tests évoluent :
   ils ne sont donnés qu'à un seul endroit, pour qu'ils ne puissent pas se contredire.**
3. **Déployer → Nouveau déploiement → Type : Application Web**, « Exécuter en tant que : moi »,
   « Accès : tout le monde » → **Déployer**. **Copier la nouvelle URL `/exec`.**
4. Reporter cette URL dans `frontend/js/config.js` → `API_URL = "…/exec"`, puis pousser sur GitHub.
5. Lancer une fois **`autoriserDrive()`** (menu Exécuter) pour ré-autoriser l'accès Drive (affiche).

### 3.3 Re-régler les clés et le relais
Dans l'éditeur Apps Script du compte institutionnel, lancer une fois :
```js
configurerCles('NOUVELLE_CLE_ADMIN_LONGUE', 'NOUVELLE_CLE_SCORES_LONGUE')
// et si le relais Cloudflare est utilisé :
configurerRelais('https://…workers.dev', 'NOUVELLE_CLE_RELAIS')
```
> **Sécurité** : profiter de la passation pour choisir des **clés longues et aléatoires** (≥ 16
> caractères, ex. générées par un gestionnaire de mots de passe). C'est la meilleure protection
> contre les tentatives de devinette. Communiquer la clé **scores** aux marqueurs le jour J, garder
> la clé **admin** pour l'organisation.

> 🔒 **Et révoquer l'ancien accès.** Une fois la recette terminée *(§9)*, retirer le compte
> personnel de développement des partages du Sheet et du Drive, et **retirer son accès au dépôt**.
> ⚠️ **Les anciennes clés doivent avoir été remplacées, pas seulement oubliées** : elles restent
> valides tant que `configurerCles(...)` n'a pas été relancé.

### 3.4 Fichiers Drive (affiches)
Les affiches téléversées sont des fichiers Drive (champ `tournoi_affiche_id`). Si l'historique des
affiches doit être conservé, les **déplacer/partager** vers le Drive institutionnel. Sinon, il
suffit de **re-téléverser** une affiche depuis la page admin après passation (l'ancienne reste en
corbeille).

---

## 4. Passation GitHub (dépôt + Pages)

### 4.1 Transférer le dépôt
GitHub → dépôt `tournoi-r92` → **Settings → General → Transfer ownership** → indiquer le compte ou
l'organisation GitHub institutionnel. Le dépôt `boutique-r92` (site vitrine, lié par des URL
croisées — voir §6) se transfère de la même façon **s'il entre dans le périmètre décidé**.

> ⚠️ **Le transfert demande une acceptation** de la destination : l'administrateur désigné doit être
> disponible au moment où l'invitation est envoyée, sinon elle expire.

### 4.2 Réactiver GitHub Pages
Sous le compte institutionnel : dépôt → **Settings → Pages → Source : GitHub Actions**. Le workflow
`.github/workflows/pages.yml` republie automatiquement le dossier `frontend/`.

> ⚠️ **Sans domaine personnalisé**, l'URL de base **change** (`https://<compte-institutionnel>.
> github.io/tournoi-r92/`). Il faut alors mettre à jour **tous les liens absolus** (voir §6).
> **Avec** un domaine personnalisé (§5), l'URL devient stable et indépendante du compte —
> **c'est ce qui est techniquement recommandé**, si l'organisation retient un domaine.

> 🔴 **Le point qu'il ne faut pas découvrir après coup** : les liens **à jeton** déjà envoyés aux
> clubs (`?club=…&token=…`) contiennent l'URL de base. **Tout changement d'URL les casse.** Ne pas
> transférer en cours d'édition d'un tournoi, ou prévoir un renvoi des liens.

---

## 5. Nom de domaine (de la réception à la mise en ligne)

> ⏸️ **Cette section ne s'applique que si l'organisation adoptante décide de retenir un domaine.**
> Elle explique **comment** en brancher un — ⛔ **jamais lequel**.

Objectif : servir les sites sous un **domaine institutionnel**, ce qui **découple** les adresses du
nom de compte GitHub. Deux schémas possibles :
- **Sous-domaines** : `tournoi.[DOMAINE_INSTITUTIONNEL]` (cette appli) et
  `www.[DOMAINE_INSTITUTIONNEL]` (vitrine).
- **Sous-chemins** : un seul domaine, plusieurs dépôts (plus complexe côté GitHub Pages).
  → **Techniquement plus simple : les sous-domaines.**

### 5.1 À la réception du domaine
1. Créer un compte chez le **registrar** (OVH, Gandi, Cloudflare Registrar…) ou récupérer les accès.
2. Repérer la zone **DNS** (là où on ajoute des enregistrements).

### 5.2 Brancher un sous-domaine sur GitHub Pages
Pour `tournoi.[DOMAINE_INSTITUTIONNEL]` → dépôt `tournoi-r92` :
1. **DNS** : ajouter un enregistrement **CNAME** : `tournoi` →
   `<compte-institutionnel>.github.io`.
2. **GitHub** : dépôt → **Settings → Pages → Custom domain** : saisir
   `tournoi.[DOMAINE_INSTITUTIONNEL]` → Save. (GitHub ajoute un fichier `CNAME` dans le dépôt.)
3. Attendre la propagation DNS (quelques minutes à quelques heures), puis cocher **Enforce HTTPS**.
4. Faire de même pour la vitrine (`www` → dépôt `boutique-r92`) et rediriger l'apex
   `[DOMAINE_INSTITUTIONNEL]` → `www` (enregistrements **A** vers les IP GitHub Pages, ou
   redirection du registrar).

### 5.3 Après bascule sur le domaine
Mettre à jour les **liens croisés** (§6) pour utiliser le domaine plutôt que `*.github.io`.

---

## 6. Liens croisés à mettre à jour (tournoi ⇄ vitrine)

L'appli tournoi référence le site vitrine (et réciproquement) par des **URL absolues**. Après un
changement d'URL de base (nouveau compte GitHub **ou** nouveau domaine), rechercher/remplacer :

- Dans **`frontend/tournoi.html`** et **`frontend/css/tournoi-public.css`** : les
  `https://rfl974.github.io/boutique-r92/...`.
- Dans **`frontend/js/config.js`** : `API_URL` et `SNAPSHOT_URL` (voir §2).
- Dans le dépôt **`boutique-r92`** : les liens et l'agenda/itinéraire qui pointent vers
  `rfl974.github.io/tournoi-r92/...`.
- Repère utile : `LC_ALL=en_US.UTF-8 grep -rn "rfl974.github.io" frontend/` liste tous les liens à
  revoir.

> **Astuce** : si un domaine est retenu (§5), y basculer **une bonne fois**, puis n'utiliser QUE des
> liens sous ce domaine — ainsi un futur changement de compte GitHub n'impactera plus rien.

> ⚠️ **Le contenu de ces liens est un sujet distinct de leur adresse.** Certains pointent vers des
> pages institutionnelles et relèvent de l'étape **CF-4b** du chantier Confiance ; le présent
> document ne traite que **l'adresse technique**, jamais ce qui est présenté.

---

## 7. Relais Cloudflare (uniquement s'il est activé)

Par défaut le relais est **dormant** (la montée en charge est assurée par le cache serveur + le
rafraîchissement étalé, voir [`relais-cdn.md`](relais-cdn.md)). S'il a été activé :
1. Recréer (ou transférer) le **Worker** + le **namespace KV** sous le compte Cloudflare
   institutionnel (code dans `cloudflare/worker-tournoi.js`, procédure dans `relais-cdn.md`).
2. Régénérer le secret `SNAPSHOT_KEY`, le reporter côté Apps Script via `configurerRelais(...)`.
3. Mettre la nouvelle URL du Worker dans `frontend/js/config.js` → `SNAPSHOT_URL`.
> Le repli étant automatique, si le relais n'est pas recréé, la page publique lit simplement Apps
> Script (cache serveur) — rien ne casse.

---

## 8. « Tout doit quitter mon ordi » — que garder ?

- **Le code** vit sur GitHub : une fois le dépôt transféré, l'ordi n'a plus rien d'indispensable.
  Par prudence, garder une **copie du dépôt** : `git clone` (ou télécharger le ZIP) sur un support
  de l'organisation.
- **Les données** vivent dans le Google Sheet (transféré en §3).
- **Aucun secret** n'est sur l'ordi ni dans le dépôt : les clés sont dans les Propriétés du script.
- Désinstaller/oublier les outils locaux (éditeur, etc.) n'a aucun impact sur l'appli en ligne.

---

## 9. Checklist de vérification finale (après passation)

- [ ] Une **copie de sauvegarde** du Sheet a été faite **avant** le transfert (§3.1).
- [ ] Le Google Sheet appartient au compte institutionnel et est en partage **Restreint**.
- [ ] `SHEET_ID` (dans `Code.gs`) pointe sur le Sheet institutionnel.
- [ ] Le backend est **re-déployé** sous le compte institutionnel ; `API_URL` (config.js) = nouvelle
      URL `/exec`.
- [ ] `configurerCles(...)` relancé avec des **clés longues** ; saisie d'un score de test OK.
- [ ] `autoriserDrive()` relancé ; téléversement d'une affiche de test OK.
- [ ] Dépôts GitHub transférés ; **Pages** réactivées.
- [ ] (Si domaine retenu) Domaine branché, **HTTPS** actif.
- [ ] **Liens croisés** mis à jour (plus aucun `rfl974.github.io` :
      `LC_ALL=en_US.UTF-8 grep -rn "rfl974.github.io"`).
- [ ] Page publique : scores + classements + podium s'affichent et se rafraîchissent.
- [ ] (Si relais) Worker Cloudflare recréé, `SNAPSHOT_URL` + `configurerRelais(...)` à jour.
- [ ] Une **copie du dépôt** est archivée du côté de l'organisation.
- [ ] 🔒 **Accès du compte personnel de développement révoqués** : partages Sheet et Drive retirés,
      accès au dépôt retiré, **anciennes clés remplacées** (§3.3).
- [ ] 🛟 **Retour arrière possible** tant que la recette n'est pas close : la copie de sauvegarde du
      Sheet et l'ancien déploiement sont **conservés**, et ne sont supprimés qu'après validation.

---

## 10. Ordre recommandé

1. ⛔ **Vérifier d'abord les sept prérequis du §0** — sans eux, ne rien commencer.
2. Sauvegarde : copie du Sheet, copie du dépôt.
3. Google : transfert du Sheet → re-déploiement (`API_URL`) → clés/Drive.
4. GitHub : transfert des dépôts → Pages.
5. (Si retenu) Domaine : DNS → Pages custom domain → HTTPS.
6. Liens croisés : remplacer les URLs → pousser.
7. (Option) Relais Cloudflare.
8. Checklist §9 de bout en bout, avec un score et une affiche de test.
9. Seulement ensuite : **révocation des anciens accès** et suppression des sauvegardes.

---

## 11. Bascule de l'adresse d'envoi des dossiers (email) — À PRÉVOIR

Depuis le Sprint 4, l'admin peut **envoyer automatiquement le dossier complet (Phase 2)** par
email à un club qui a accepté (bouton « Générer le dossier final » → aperçu → « Envoyer »).
L'envoi part de l'**adresse du compte Google qui exécute le script Apps Script**.

### 11.1 État actuel (phase de test)
Le script tourne aujourd'hui sous un **compte Gmail personnel de développement**. Les emails de
dossier partent **donc de cette adresse**, et c'est aussi vers elle que sont envoyés les emails de
**test** de validation.

> Techniquement : sans `email_expediteur` configuré, le backend utilise `MailApp.sendEmail(...)`,
> qui envoie **au nom du compte exécutant**.

> ⚠️ **Autorisation à accorder UNE FOIS.** Le tout premier envoi échoue tant que le scope
> d'envoi d'emails n'est pas autorisé (message : *« Vous n'êtes pas autorisé à appeler
> MailApp.sendEmail »*). Pour l'accorder :
> 1. Ouvrir le Sheet → **Extensions → Apps Script**.
> 2. Dans la liste des fonctions (en haut), choisir **`autoriserEnvoiEmail`** → **Exécuter**.
> 3. Accepter les autorisations demandées. Comme le projet référence aussi **GmailApp** (pour
>    l'alias, option B ci-dessous), Google peut afficher **« Cette application n'est pas
>    validée »** → **Paramètres avancés → « Accéder au projet (non sécurisé) »** → autoriser.
> 4. Refaire un envoi de test depuis l'admin : il part alors du compte exécutant.
>
> Aucune re-publication (nouveau déploiement) n'est nécessaire : l'autorisation est liée au
> compte, pas au déploiement. Si l'envoi échoue encore après ça, redéployer une **nouvelle
> version** de la Web App (Déployer → Gérer les déploiements → crayon → Version « Nouvelle version »).

### 11.2 Cible : une adresse d'expédition institutionnelle

> ⏸️ **Aucune adresse n'est retenue à ce jour**, et aucune ne peut l'être : elle appartient à
> l'organisation adoptante, qui la fournit au moment de l'adoption *(§0, condition 4)*.

Le jour venu, l'envoi devra partir d'une **adresse d'expédition institutionnelle**
— notée ci-dessous `[ADRESSE_EXPEDITION]`. Deux options, **à choisir le moment venu** :

**Option A — Exécuter le script sous le compte institutionnel.**
Le projet Apps Script est **redéployé/exécuté** sous ce compte (transfert du Sheet +
re-déploiement « Exécuter en tant que : moi », cf. §3.1–3.2). Les emails partent alors
**nativement** de `[ADRESSE_EXPEDITION]`.
→ Laisser `email_expediteur` **vide** dans ce cas (l'adresse d'exécution suffit).
→ ⚠️ **Nécessite l'accès de l'administrateur désigné** au compte institutionnel pour le
déploiement.

**Option B — Alias « Envoyer un message en tant que » sur le compte exécutant.**
Sans redéployer sous le compte institutionnel :
1. Gmail du compte exécutant → **Paramètres → Comptes et importation → « Envoyer des
   emails en tant que » → Ajouter une autre adresse email** → saisir `[ADRESSE_EXPEDITION]`
   et **valider** (Gmail envoie un code de confirmation à cette adresse — ⚠️ **une action de
   l'administrateur désigné est requise une seule fois** pour valider l'alias, mais pas de
   re-déploiement).
2. Dans l'admin, carte **« Réponse à l'invitation »**, renseigner le champ **Email expéditeur**
   avec `[ADRESSE_EXPEDITION]` (paramètre Zone A `email_expediteur`).
3. Le backend utilise alors `GmailApp.sendEmail(..., { from: email_expediteur })`. **La première
   fois**, relancer une fonction depuis l'éditeur Apps Script pour **autoriser le scope Gmail**
   (envoi), puis vérifier avec un email de test.

> ⚠️ **Option B : à mesurer avant de la retenir.** Elle laisse le script s'exécuter sous un compte
> **personnel** tout en affichant une adresse **institutionnelle** — pratique, mais l'organisation
> n'a alors la maîtrise **ni du script, ni des données**. **A est plus propre** dès lors que
> l'adoption est actée.

> ⚠️ Si `email_expediteur` est renseigné mais **n'est pas** un alias valide du compte exécutant,
> Gmail lève une exception : l'admin affiche une **erreur claire** et **`dossier_envoye` n'est pas
> posé** (l'envoi est simplement à relancer). Aucune donnée n'est corrompue.

### 11.3 Le champ `email_expediteur`
- **Où** : Zone A de l'onglet `Config` (carte admin « Réponse à l'invitation »).
- **Rôle** : purement informatif/config ; **ne bloque rien s'il est vide**.
- **Vide** → l'email part de l'adresse du compte exécutant.
- **Renseigné** → utilisé comme adresse « from » (Option B ; suppose l'alias configuré).
- **Conservé** par une réinitialisation de tournoi (config d'infrastructure, comme les clés).

> ⚠️ **Le nom AFFICHÉ de l'expéditeur est un réglage distinct**, fixé côté serveur et **non
> configurable depuis l'admin**. Il relève de l'étape **CF-4b** du chantier Confiance, pas de ce
> document.

### 11.4 Checklist bascule email (le moment venu)
- [ ] ⛔ Les prérequis du **§0** sont remplis, et `[ADRESSE_EXPEDITION]` a été **fournie par
      l'organisation**.
- [ ] Option choisie (A : re-déploiement sous le compte institutionnel — ou — B : alias Gmail).
- [ ] (Option B) Alias `[ADRESSE_EXPEDITION]` ajouté et **validé** par l'administrateur désigné.
- [ ] (Option B) `email_expediteur` renseigné dans la carte « Réponse à l'invitation ».
- [ ] (Option B) Scope Gmail **autorisé** une fois dans l'éditeur Apps Script.
- [ ] Email de **test** envoyé et reçu depuis la bonne adresse.
