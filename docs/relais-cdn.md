# Relais CDN — tenir des milliers de spectateurs

## Pourquoi
La page publique interroge Google Apps Script, qui plafonne à ~30 exécutions simultanées.
Avec ~1300 spectateurs qui rafraîchissent toutes les 10 s, Apps Script saturerait.

**Solution :** Apps Script *pousse* une copie des données vers un cache **Cloudflare** (gratuit,
mondial) à chaque changement. Les spectateurs lisent ce cache, qui encaisse n'importe quelle foule.
Apps Script n'est plus jamais interrogé par les spectateurs.

```
Marqueurs de scores ──► Apps Script ──(pousse à chaque écriture)──► Cloudflare (cache)
                                                                          ▲
                                          1300 spectateurs ──(lisent)─────┘
```

> **Repli automatique** : tant que le relais n'est pas configuré (URL vide), tout fonctionne
> comme avant (les spectateurs lisent Apps Script). On peut donc tout préparer sans rien casser.

---

## Mise en place (à faire une seule fois)

### 1) Créer le service Cloudflare
1. Crée un compte gratuit sur **https://dash.cloudflare.com/sign-up**.
2. Menu de gauche : **Workers & Pages** → **Create application** → **Create Worker**.
3. Donne-lui un nom, ex. `tournoi-r92`. Clique **Deploy** (le code par défaut sera remplacé).
4. Clique **Edit code** : efface tout et colle le contenu de
   [`cloudflare/worker-tournoi.js`](../cloudflare/worker-tournoi.js). Clique **Deploy**.
5. Note l'**URL** du Worker affichée (ex. `https://tournoi-r92.toncompte.workers.dev`).

### 2) Créer le stockage (KV) et le lier
1. **Workers & Pages** → **KV** → **Create a namespace**, nom : `TOURNOI_KV`.
2. Reviens sur ton Worker → onglet **Settings** → **Variables and Secrets** :
   - **KV Namespace Bindings** → **Add binding** : *Variable name* = `TOURNOI`,
     *KV namespace* = `TOURNOI_KV`. **Save**.
   - **Secrets** → **Add** : *Name* = `SNAPSHOT_KEY`, *Value* = une phrase secrète que tu inventes
     (ex. `r92-relais-7fK2p`). **Save**. ⚠️ Garde-la, on la remet côté Apps Script.

### 3) Brancher Apps Script (la poussée)
1. Ouvre l'éditeur Apps Script (Extensions → Apps Script).
2. Recopie le `Code.gs` à jour, **enregistre**, puis **redéploie** (Gérer les déploiements →
   crayon → Nouvelle version).
3. Dans l'éditeur, sélectionne la fonction **`configurerRelais`** en haut, puis, dans la console,
   lance-la **une fois** en collant tes valeurs. Le plus simple : ouvre `configurerRelais`, remplace
   temporairement la ligne de test, ou lance depuis la barre :
   ```js
   configurerRelais('https://tournoi-r92.toncompte.workers.dev', 'r92-relais-7fK2p')
   ```
   (URL du Worker + la même clé secrète qu'à l'étape 2). Autorise l'exécution si demandé.

### 4) Brancher la page publique (la lecture)
1. Dans [`frontend/js/config.js`](../frontend/js/config.js), renseigne :
   ```js
   const SNAPSHOT_URL = "https://tournoi-r92.toncompte.workers.dev";
   ```
2. Pousse sur GitHub (mise en ligne automatique).

---

## Vérifier que ça marche
1. Ouvre ton URL Worker dans le navigateur : tu dois voir du JSON (les données du tournoi).
   *(Au tout début, avant toute écriture, tu verras `{"error":"pas encore de donnees"}` — c'est
   normal ; saisis/valide un score pour amorcer le cache.)*
2. Ouvre la page publique : les scores se mettent à jour en ~10 s.
3. Dans les outils navigateur (onglet Réseau), la page publique doit appeler l'URL **Cloudflare**,
   plus Apps Script.

## Coût
Pour ~1300 spectateurs sur une journée, le volume de lectures dépasse le tout petit palier gratuit
des Workers. Le plan **Workers Paid (~5 $/mois)** couvre très largement l'événement (10 M requêtes
incluses) — activable la veille, résiliable après. Le cache de 8 s réduit fortement le nombre
d'appels réels au Worker (l'essentiel est servi par le CDN).

## En cas de souci le jour J
Si le relais tombe, **aucune panique** : la page publique **bascule automatiquement** sur Apps
Script (repli intégré). Pour désactiver volontairement le relais, remettre `SNAPSHOT_URL = ""`
dans `config.js` et repousser.
