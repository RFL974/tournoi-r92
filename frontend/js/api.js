/**
 * ============================================================================
 *  API — la "boîte à outils" pour parler au backend (Apps Script)
 * ============================================================================
 *
 *  Ce fichier fournit des fonctions simples que les pages utilisent pour
 *  récupérer les données, sans avoir à répéter le code technique partout.
 *
 *  Il a besoin de la variable API_URL, définie dans config.js.
 *  => Dans chaque page HTML, on charge config.js AVANT api.js.
 * ============================================================================
 */

/**
 * Va chercher une donnée auprès du backend (requête de LECTURE).
 * @param {string} action  ex : 'getConfig', 'getEquipes', 'getAll'
 * @param {Object} [params] paramètres supplémentaires éventuels (optionnel)
 * @return {Promise<Object>} la réponse du backend, déjà transformée en objet
 *
 * Exemple d'utilisation :
 *   const config = await apiGet('getConfig');
 */
async function apiGet(action, params) {
  // On construit l'URL complète : .../exec?action=getConfig&...
  const url = new URL(API_URL);
  url.searchParams.set('action', action);

  // On ajoute les éventuels paramètres supplémentaires.
  if (params) {
    for (const cle in params) {
      url.searchParams.set(cle, params[cle]);
    }
  }

  // fetch() envoie la requête et attend la réponse.
  const reponse = await fetch(url.toString());
  if (!reponse.ok) {
    throw new Error('Le serveur a répondu avec une erreur (' + reponse.status + ').');
  }

  // On transforme la réponse (du texte JSON) en objet JavaScript utilisable.
  const donnees = await reponse.json();

  // Si le backend a renvoyé un champ "error", on le signale.
  if (donnees && donnees.error) {
    throw new Error(donnees.error);
  }

  return donnees;
}
