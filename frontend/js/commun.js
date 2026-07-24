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

/* ============================================================================
 *  ICÔNES SVG D'INTERFACE — même style filaire que la barre latérale (trait fin
 *  arrondi, couleur = celle du texte). Remplacent les émojis dans les BOUTONS et
 *  actions de l'admin. Chaque entrée = l'INTÉRIEUR du <svg> (dessin 24×24).
 *  Certaines réutilisent EXACTEMENT le tracé de la barre latérale (horloge,
 *  ballon, balai, poules, terrain, membres) pour un rendu identique.
 * ========================================================================== */
var ICONES_UI = {
  rafraichir:   '<path d="M20 11.5A8 8 0 1 0 18 17"></path><path d="M20 4.5v6h-6"></path>',
  crayon:       '<path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17.5V20z"></path><path d="M13.5 6.5l3 3"></path>',
  corbeille:    '<path d="M4 7h16M10 7V4.8h4V7M6.5 7l1 12.5h9l1-12.5M10 10.5v6M14 10.5v6"></path>',
  email:        '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3.5 7l8.5 6 8.5-6"></path>',
  enregistrer:  '<path d="M5 4h11l3 3v13H5z"></path><path d="M8 4v5h7V4M8 20v-6h8v6"></path>',
  dossier:      '<path d="M6 3h8l4 4v14H6z"></path><path d="M14 3v4h4M9 12h6M9 16h4"></path>',
  verrou:       '<rect x="5" y="10.5" width="14" height="9.5" rx="2"></rect><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"></path>',
  verrou_ouvert:'<rect x="5" y="10.5" width="14" height="9.5" rx="2"></rect><path d="M8 10.5V7a4 4 0 0 1 7.7-1.5"></path>',
  imprimante:   '<path d="M7 9V4h10v5"></path><rect x="4" y="9" width="16" height="7" rx="1.5"></rect><path d="M7.5 14h9v5.5h-9z"></path>',
  membres:      '<circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="10" r="2.3"></circle><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5M15.5 15c2 .3 3.5 1.9 3.5 4"></path>',
  plus:         '<path d="M12 5v14M5 12h14"></path>',
  croix:        '<path d="M6 6l12 12M18 6L6 18"></path>',
  coche:        '<path d="M5 12.5l4.5 4.5L19 7"></path>',
  horloge:      '<circle cx="12" cy="12" r="8"></circle><path d="M12 7.5V12l3 2"></path>',
  ballon:       '<ellipse cx="12" cy="12" rx="5" ry="8" transform="rotate(45 12 12)"></ellipse><path d="M9 9l6 6M10.5 7.5l6 6M7.5 10.5l6 6"></path>',
  balai:        '<path d="M14 4l6 6M13 5l-7 7 5 5 7-7M6 12l-2 6 6-2"></path>',
  poules:       '<path d="M4 6h16M4 12h16M4 18h10"></path><circle cx="18" cy="18" r="2.4"></circle>',
  terrain:      '<rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M12 6v12M3 12h4M17 12h4"></path>',
  monde:        '<circle cx="12" cy="12" r="8"></circle><path d="M4 12h16M12 4c2.5 2.5 2.5 13 0 16M12 4c-2.5 2.5-2.5 13 0 16"></path>'
};

/** Renvoie le balisage <svg> d'une icône d'interface (classe .ic + classe optionnelle). */
function svgIcone(nom, classe) {
  return '<svg class="ic' + (classe ? ' ' + classe : '') + '" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true">' + (ICONES_UI[nom] || '') + '</svg>';
}

/** Injecte l'icône SVG dans tout élément [data-ic="nom"] (boutons statiques du HTML). */
function injecterIcones(racine) {
  (racine || document).querySelectorAll('[data-ic]').forEach(function (el) {
    if (el.querySelector('svg.ic')) return; // déjà injectée
    el.insertAdjacentHTML('afterbegin', svgIcone(el.getAttribute('data-ic')));
  });
}
