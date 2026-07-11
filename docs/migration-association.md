# Migration vers les comptes de l'association

**Contexte :** pendant le développement, tout est hébergé sur les **comptes personnels** de Romain
(ordinateur perso, compte Google perso, compte GitHub `RFL974`). À terme, tout doit passer sur les
**comptes de l'association Génération R92** (en cours de création).

Ce document est la **check-list à suivre le jour de la bascule**. Rien à faire avant.

## Pourquoi ce sera simple
Tout ce qui dépend d'un compte est **centralisé** :
- `SHEET_ID` → une seule ligne dans [`../backend/Code.gs`](../backend/Code.gs)
- `API_URL` → une seule ligne dans [`../frontend/js/config.js`](../frontend/js/config.js)

La migration se résume donc à : **transférer 3 objets** + **mettre à jour 1 ou 2 valeurs**.

## Check-list

### 1. Google Sheet (base de données)
- **Option A (recommandée)** : transférer la **propriété** du Sheet au compte Google de l'association
  (Partager → cliquer sur le compte asso → « Transférer la propriété »). ✅ `SHEET_ID` **inchangé**.
- **Option B** : recréer un Sheet vierge sur le compte asso et relancer `setupSheet()`.
  ⚠️ Dans ce cas `SHEET_ID` **change** → le mettre à jour dans `Code.gs`.

### 2. Apps Script + déploiement (backend)
- Le **projet de script** doit être accessible depuis le compte asso (transfert ou recréation :
  recoller `Code.gs` dans un nouveau projet Apps Script sous le compte asso).
- **Redéployer** la Web App sous le compte de l'association (Exécuter en tant que : le compte asso ;
  Qui a accès : Tout le monde).
- ⚠️ **L'URL `/exec` va changer** → mettre à jour `API_URL` dans [`../frontend/js/config.js`](../frontend/js/config.js).

### 3. Dépôt GitHub
- Transférer `RFL974/tournoi-r92` vers l'**organisation GitHub** de l'association
  (Settings → General → Danger Zone → « Transfer ownership »), ou le recréer sous le compte asso.

### 4. Autres rattachements
- **Domaine / hébergement** : `generationr92.fr` et son hébergement = comptes de l'association.
- **Lien de don HelloAsso** : compte HelloAsso de l'association (à mettre dans la bannière du live).

### 5. Vérifications après migration
- Tester l'API : `…/exec?action=ping`, `?action=getConfig`, `?action=getAll`.
- Tester une saisie de score et une génération de planning.
- Vérifier que les pages publiques lisent bien les bonnes données.

> 💡 Alternative : si les comptes de l'association sont créés **tôt**, on peut construire
> directement dessus et éviter toute migration. À voir selon l'avancement de la création de l'asso.
