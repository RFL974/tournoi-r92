# backend/

Code **Google Apps Script** du projet — un seul fichier **`Code.gs`**, déployé en **Web App**.

Il contient tout le backend :
- **`doGet`** — lectures ouvertes à tous (`getAll`, `getConfig`, `getEquipes`, `getPoules`,
  `getMatchs`, `getClassement`, `getHistorique`). `getAll` est **mis en cache serveur ~10 s**.
- **`doPost`** — écritures protégées par une **clé** (admin ou scores), **sérialisées** par un
  verrou (`LockService`) : équipes, catégories, horaires, scores, génération des poules/planning,
  phase après-midi (classement croisé), publication, infos + affiche.
- **Sécurité** : deux clés (`CLE_ADMIN` / `CLE_SCORES`) stockées dans les **Propriétés du script**
  (jamais dans le code), réglées par `configurerCles(...)`.
- **Montée en charge** : cache serveur + **relais CDN** optionnel (`pousserSnapshot` /
  `configurerRelais`, voir [`../docs/relais-cdn.md`](../docs/relais-cdn.md)).
- **Utilitaires à lancer une fois** depuis l'éditeur : `setupSheet()` (crée les **5 onglets**
  `Equipes`, `Poules`, `Matchs`, `Config`, `Historique`), `configurerCles(...)`, `autoriserDrive()`
  (autorisation Drive pour l'affiche), `configurerRelais(...)`.

Voir [`../docs/architecture.md`](../docs/architecture.md), [`../docs/deploiement.md`](../docs/deploiement.md)
et [`../docs/structure-google-sheet.md`](../docs/structure-google-sheet.md).
