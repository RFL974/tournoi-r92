/**
 * ============================================================================
 *  COMMUN — petites fonctions utilitaires partagées par TOUTES les pages
 * ============================================================================
 *
 *  But : ne plus recopier les mêmes helpers dans admin.js / tournoi.js /
 *  saisie.js / perfs.js. Avant, `echapper` et `estTermine` (par exemple)
 *  existaient en 4 exemplaires identiques : corriger un bug obligeait à
 *  modifier les 4. Désormais on les écrit UNE fois, ici.
 *
 *  Ce fichier ne dépend de RIEN (aucune variable d'une page) : ce sont des
 *  fonctions « pures ». => On le charge en PREMIER dans chaque page HTML,
 *  juste après config.js.
 * ============================================================================
 */

/**
 * Échappe un texte pour l'insérer sans danger dans du HTML (anti-injection XSS).
 * Transforme les caractères spéciaux (& < > " ' `) en entités HTML. On échappe aussi
 * l'apostrophe et l'accent grave : ainsi le texte reste sûr même dans un attribut délimité
 * par des apostrophes ou des accents graves (défense en profondeur, tous contextes couverts).
 */
function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/`/g, '&#96;');
}

/**
 * Vrai si le statut d'un match vaut « terminé » (score saisi), quelle que soit
 * la forme du « é » (NFC/NFD) : le Sheet renvoie parfois un « é » décomposé,
 * on teste donc simplement le préfixe ASCII « termin ».
 */
function estTermine(statut) {
  return /^\s*termin/i.test(String(statut));
}

/**
 * Affiche un petit message sous un formulaire (vert = ok, rouge = erreur).
 * @param {HTMLElement} element  la zone de message
 * @param {string} texte
 * @param {string} type          'ok' pour un succès, sinon erreur
 */
function afficherMessage(element, texte, type) {
  element.textContent = texte;
  element.className = 'message-form ' + (type === 'ok' ? 'ok' : 'ko');
}

/** Libellé français lisible d'un tour de bracket (Coupe). */
function libelleTourFr(tour) {
  switch (String(tour)) {
    case 'FINALE': return 'Finale';
    case 'DEMI_FINALE': return 'Demi-finale';
    case 'PETITE_FINALE': return 'Petite finale';
    case 'QUART_DE_FINALE': return 'Quart de finale';
    case 'HUITIEME_DE_FINALE': return 'Huitième de finale';
    case 'SEIZIEME_DE_FINALE': return 'Seizième de finale';
    default: return String(tour || '');
  }
}

/**
 * Tri des catégories dans l'ordre naturel : U8 < U10 < U12… (le nombre d'abord,
 * puis l'ordre alphabétique en secours). Utilisable directement dans `.sort()`.
 */
function comparerCategorie(a, b) {
  const ma = String(a).match(/\d+/), mb = String(b).match(/\d+/);
  if (ma && mb && parseInt(ma[0], 10) !== parseInt(mb[0], 10)) return parseInt(ma[0], 10) - parseInt(mb[0], 10);
  return String(a).localeCompare(String(b));
}
