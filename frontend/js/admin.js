/**
 * ============================================================================
 *  ADMIN — logique de la page d'administration
 * ============================================================================
 *
 *  Pour cette 1re étape, la page se contente de LIRE les réglages (horaires
 *  globaux + catégories) depuis le backend et de les AFFICHER. Rien n'est
 *  modifié : c'est de l'affichage seul.
 * ============================================================================
 */

/* Libellés lisibles pour les réglages globaux (au lieu des noms techniques). */
const LIBELLES_GLOBAUX = {
  heure_debut:               'Heure de début',
  heure_fin:                 'Heure de fin',
  pause_dejeuner_debut:      'Pause déjeuner (début)',
  pause_dejeuner_duree_min:  'Pause déjeuner (durée, min)'
};

/* Libellés lisibles pour les réglages d'une catégorie. */
const LIBELLES_CATEGORIE = {
  terrains:               'Terrains',
  taille_poule_cible:     'Taille de poule',
  format_mi_temps:        'Nb mi-temps',
  duree_mi_temps_min:     'Durée mi-temps',
  pause_mi_temps_min:     'Pause mi-temps',
  recup_entre_matchs_min: 'Récup. entre matchs'
};

/**
 * Point de départ : dès que la page est chargée, on va chercher la config
 * et on l'affiche.
 */
async function initAdmin() {
  const zone = document.getElementById('contenu');

  try {
    // On demande la config au backend.
    const config = await apiGet('getConfig');

    // On construit l'affichage et on l'injecte dans la page.
    zone.innerHTML = afficherGlobaux(config.global) + afficherCategories(config.categories);

  } catch (erreur) {
    // Si ça échoue (pas de réseau, backend en panne...), on affiche un message clair.
    zone.innerHTML =
      '<div class="message erreur">Impossible de charger les réglages.<br>' +
      'Détail : ' + erreur.message + '</div>';
  }
}

/**
 * Construit la carte des horaires globaux de la journée.
 * @param {Object} global  ex : { heure_debut: '09:00', ... }
 * @return {string} du HTML
 */
function afficherGlobaux(global) {
  let lignes = '';
  for (const cle in LIBELLES_GLOBAUX) {
    const libelle = LIBELLES_GLOBAUX[cle];
    const valeur = (global && global[cle] != null) ? global[cle] : '—';
    lignes +=
      '<div class="ligne-info">' +
        '<span class="libelle">' + libelle + '</span>' +
        '<span class="valeur">' + valeur + '</span>' +
      '</div>';
  }

  return (
    '<section class="carte">' +
      '<h2>Horaires de la journée</h2>' +
      lignes +
    '</section>'
  );
}

/**
 * Construit une carte par catégorie.
 * @param {Object[]} categories  liste des catégories
 * @return {string} du HTML
 */
function afficherCategories(categories) {
  if (!categories || categories.length === 0) {
    return '<div class="message">Aucune catégorie configurée.</div>';
  }

  let html = '<h2 style="margin:24px 0 12px;">Catégories</h2>';

  categories.forEach(function (cat) {
    const presente = String(cat.presente).toLowerCase() === 'oui';
    const badgeStatut = presente
      ? '<span class="statut-present">Présente</span>'
      : '<span class="statut-absent">Absente</span>';

    // Les petits réglages de la catégorie.
    let reglages = '';
    for (const cle in LIBELLES_CATEGORIE) {
      const valeur = (cat[cle] != null && cat[cle] !== '') ? cat[cle] : '—';
      reglages +=
        '<div class="reglage">' +
          '<span class="r-libelle">' + LIBELLES_CATEGORIE[cle] + '</span>' +
          '<span class="r-valeur">' + valeur + '</span>' +
        '</div>';
    }

    html +=
      '<section class="carte categorie">' +
        '<div class="ligne-info">' +
          '<span class="badge">' + (cat.categorie || '?') + '</span>' +
          badgeStatut +
        '</div>' +
        '<div class="grille-reglages">' + reglages + '</div>' +
      '</section>';
  });

  return html;
}

/* On lance initAdmin() une fois que la page HTML est prête. */
document.addEventListener('DOMContentLoaded', initAdmin);
