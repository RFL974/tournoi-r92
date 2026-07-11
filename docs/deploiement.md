# Déploiement

> ⚠️ Document en cours de rédaction. Il sera complété quand le code backend et frontend existera.
> Pour l'instant il liste les étapes prévues.

## A. Backend — Google Apps Script (à venir)

1. Ouvrir le Google Sheet du tournoi.
2. Menu **Extensions → Apps Script**.
3. Coller le contenu de [`backend/Code.gs`](../backend/Code.gs) dans l'éditeur.
4. **Déployer → Nouveau déploiement → Type : Application Web**.
   - Exécuter en tant que : **moi**.
   - Qui a accès : **Tout le monde** (nécessaire pour que les visiteurs lisent le planning/live).
5. Copier l'**URL de la Web App** fournie.
6. Coller cette URL dans [`frontend/js/config.js`](../frontend/js/config.js).

> Chaque fois qu'on modifie `Code.gs`, il faut **redéployer** (gérer les déploiements → modifier)
> pour que les changements soient pris en compte.

## B. Frontend — mise en ligne (à venir)

Options envisagées pour héberger le dossier `frontend/` sur un sous-domaine de `generationr92.fr` :
- Hébergement statique classique (FTP vers le sous-domaine).
- Ou GitHub Pages, puis pointage du sous-domaine.

Cette section sera précisée selon l'hébergeur retenu.
