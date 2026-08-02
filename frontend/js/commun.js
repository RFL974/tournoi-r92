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

/* ---------------------------------------------------------------------------
   ÉTIQUETTES SUPER CHALLENGE (affichage partagé admin / saisie / public)
   Toutes ces fonctions renvoient `null` pour une catégorie NON Super Challenge :
   l'appelant garde alors son libellé habituel (« Matin — poules », « Poule A »…).
   Elles ne changent donc RIEN aux tournois ordinaires.
   --------------------------------------------------------------------------- */

/** Contexte SCF d'une catégorie côté affichage (miroir léger du backend). → { estScf, phase }.
 *  Prudent : SCF seulement si la catégorie est U14 (M14) ET contexte_tournoi vaut exactement 'SCF'. */
function ctxScf(cat) {
  var s = String((cat && cat.contexte_tournoi) == null ? '' : cat.contexte_tournoi).trim().toUpperCase();
  var u14 = String((cat && cat.categorie) == null ? '' : cat.categorie).trim().toUpperCase().replace(/^[MU](?=\d)/, '') === '14';
  var ph = String((cat && cat.scf_phase) == null ? '' : cat.scf_phase).trim().toUpperCase() === 'P3' ? 'P3' : 'P2';
  return { estScf: (u14 && s === 'SCF'), phase: ph };
}

/** Poule de niveau du brassage du dimanche : N1/N2/N3 → E/F/G. Autre valeur → inchangée. */
function pouleEFG(nom) {
  var m = /^N(\d+)$/.exec(String(nom == null ? '' : nom));
  if (!m) return String(nom == null ? '' : nom);
  var L = 'EFGHIJ', i = parseInt(m[1], 10) - 1;
  return (i >= 0 && i < L.length) ? L.charAt(i) : String(nom);
}

/** Nombre d'équipes d'un groupe (poule) SCF, compté sur les matchs du matin (hors classement). */
function tailleGroupeScf(matchs, categorie, nomPoule) {
  var s = {};
  (matchs || []).forEach(function (m) {
    if (m.categorie === categorie && String(m.phase) !== 'classement' && String(m.poule) === String(nomPoule)) {
      s[m.equipe_A] = 1; s[m.equipe_B] = 1;
    }
  });
  return Object.keys(s).length;
}

/** En-tête de phase pour une catégorie SCF (texte prêt à l'affichage), ou null si non-SCF.
 *  estClassement = matchs de la phase 'classement' (2ᵉ journée / brassage). */
function phaseLabelScf(cat, estClassement) {
  var c = ctxScf(cat);
  if (!c.estScf) return null;
  if (c.phase === 'P3') return estClassement ? '🏆 Dimanche — brassage (poules par niveau)' : '📅 Samedi — triangulaires';
  return estClassement ? '🏆 Brassage' : '🏉 Plateau';
}

/** Libellé d'un groupe SCF, ou null si non-SCF. `taille` = nb d'équipes du groupe ;
 *  estClassement → poule de niveau (E/F/G) ; sinon triangulaire (3) ou quadrangulaire (4). */
function groupeLabelScf(cat, nomPoule, taille, estClassement) {
  var c = ctxScf(cat);
  if (!c.estScf) return null;
  if (estClassement) return 'Poule ' + pouleEFG(nomPoule);
  return (taille === 4 ? 'Quadrangulaire ' : 'Triangulaire ') + String(nomPoule == null ? '' : nomPoule);
}

/* ---------------------------------------------------------------------------
   Vocabulaire POULES DE NIVEAU (session 20) — mêmes règles que les helpers SCF :
   renvoient null pour une catégorie qui n'est PAS en POULES_NIVEAU, l'appelant
   garde alors son libellé habituel (« Niveau N1 »…). Rien ne change ailleurs.
   --------------------------------------------------------------------------- */

/** Nombre de poules de niveau (étiquettes N1..Nk distinctes) d'une catégorie, compté sur les
 *  matchs d'après-midi (phase 'classement'). Sert à savoir laquelle est la « Poule basse ». */
function nbPoulesNiveauCat(matchs, categorie) {
  var s = {};
  (matchs || []).forEach(function (m) {
    if (m.categorie === categorie && String(m.phase) === 'classement' &&
        /^N\d+$/.test(String(m.poule == null ? '' : m.poule).trim())) {
      s[String(m.poule).trim()] = 1;
    }
  });
  return Object.keys(s).length;
}

/** Libellé d'une poule de niveau d'après-midi pour une catégorie en POULES_NIVEAU, ou null sinon.
 *  N1 → « Poule haute » ; dernière → « Poule basse » ; intermédiaires → « Poule niveau k » ;
 *  une seule poule → « Poule de classement ». `nbNiveaux` = total de poules de niveau (0 = inconnu). */
function libellePouleNiveau(cat, nomPoule, nbNiveaux) {
  var f = (cat && cat.format_apresmidi != null) ? String(cat.format_apresmidi).trim().toUpperCase() : '';
  if (f !== 'POULES_NIVEAU') return null;
  var m = /^N(\d+)$/.exec(String(nomPoule == null ? '' : nomPoule).trim());
  if (!m) return null;
  var k = parseInt(m[1], 10);
  var n = parseInt(nbNiveaux, 10) || 0;
  if (n === 1) return 'Poule de classement';
  if (k === 1) return 'Poule haute';
  if (n >= 2 && k === n) return 'Poule basse';
  return 'Poule niveau ' + k;
}

/** Texte de l'arbitre DÉSIGNÉ d'un match (l'équipe qui ne joue pas, Super Challenge), ou '' si aucun.
 *  `nomFn` = fonction id_equipe → nom lisible. Renvoie du TEXTE BRUT (l'appelant échappe pour le HTML). */
function libelleArbitreScf(m, nomFn) {
  var a = (m && m.arbitre != null) ? String(m.arbitre).trim() : '';
  if (!a) return '';
  return 'Arbitre : ' + ((typeof nomFn === 'function') ? nomFn(a) : a);
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

/**
 * Exécute une action asynchrone en gérant l'état « occupé » d'un bouton : le désactive et
 * affiche un libellé d'attente pendant l'action, restaure son libellé d'origine ensuite (même
 * en cas d'erreur), et signale toute exception via afficherMessage(message, '⚠️ …', 'ko').
 *
 * Remplace le bloc `texteBouton = … ; disabled = true ; try {…} catch {afficherMessage…}
 * finally {disabled = false ; textContent = texteBouton}` qui était recopié dans une dizaine
 * de handlers d'enregistrement de l'admin. La VALIDATION préalable (avec `return` anticipé)
 * reste à faire AVANT l'appel, comme avant.
 *
 * @param {HTMLElement} bouton       le bouton à occuper
 * @param {HTMLElement} message      la zone de message (pour afficher l'erreur éventuelle)
 * @param {Function} action          fonction async : le corps métier à exécuter
 * @param {string} [texteOccupe]     libellé pendant l'action (défaut « Enregistrement… »)
 */
async function avecBoutonOccupe(bouton, message, action, texteOccupe) {
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = texteOccupe || 'Enregistrement…';
  try {
    await action();
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

/**
 * Construit un index { id_equipe → nom_equipe } pour retrouver un nom d'équipe en O(1).
 * `nomEquipe()` est appelé des centaines de fois par affichage (cartes, classements, bracket…) :
 * un index évite de reparcourir toute la liste des équipes (`.find()`, O(n)) à chaque appel.
 * À reconstruire à chaque rechargement des équipes.
 */
function indexerNoms(equipes) {
  const index = {};
  (equipes || []).forEach(function (e) { index[e.id_equipe] = e.nom_equipe; });
  return index;
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

/* ---------------------------------------------------------------------------
   VOCABULAIRE DES FORMATS D'APRÈS-MIDI + REPÈRES FFR (partagés par TOUTES les
   pages : dossier/invitation via commun-dossier.js, et l'EMAIL d'invitation
   construit par l'admin — admin.html ne charge pas commun-dossier.js).
   Écrits UNE fois : la page vitrine et l'email disent exactement la même chose.
   --------------------------------------------------------------------------- */

/* Libellés humains des formats d'après-midi (mêmes clés que la page admin). */
const DOSSIER_FORMATS = {
  CROISE: 'Classement croisé',
  CROISE_DIAGONAL: 'Croisé diagonal',
  POULES_NIVEAU: 'Poules de niveau',
  LIBRE: 'Matchs libres',
  COUPE_PLATEAU: 'Coupe + Plateau'
};

/* Description CONCISE de chaque format (destinée aux clubs). */
const DOSSIER_FORMATS_DESC = {
  CROISE: 'les équipes sont regroupées par niveau d\'après leur classement du matin, '
    + 'puis s\'affrontent au sein de leur niveau (classement général et podium).',
  CROISE_DIAGONAL: 'brassage par rangs croisés entre poules — le 1ᵉʳ d\'une poule affronte '
    + 'le 2ᵉ d\'une autre — les résultats étant cumulés au classement général.',
  // Pas de taille de poule promise : la génération peut produire des poules de 3 (6 équipes
  // classées → [3,3], 7 → [3,4] — voir taillesPoulesNiveau côté backend).
  POULES_NIVEAU: 'le classement de la mi-journée est découpé en poules de niveau '
    + '(poule haute, niveau 2…), chacune jouée en mini-championnat complet — aucune élimination, '
    + 'le 1ᵉʳ de la poule haute remporte le tournoi.',
  LIBRE: 'des matchs amicaux supplémentaires, sans classement ni podium (idéal pour les plus jeunes).',
  COUPE_PLATEAU: 'les premiers de chaque poule disputent une coupe à élimination directe '
    + '(jusqu\'à la finale), les autres un plateau sans élimination.'
};

/** Clé de format normalisée d'une catégorie (repli CROISE, comme partout ailleurs). */
function cleFormatApresMidi(cat) {
  const f = String((cat && cat.format_apresmidi) == null ? '' : cat.format_apresmidi).trim().toUpperCase();
  return DOSSIER_FORMATS_DESC[f] ? f : 'CROISE';
}

/* Repères FFR affichés aux clubs (page d'invitation ET email) — texte brut, chaque
   rendu y ajoute son habillage (⚠️/💡, gras, styles). Décisions Romain, session 20. */
const FFR_RAPPEL_EFFECTIF = 'venir à l\'effectif minimum signifie que chaque enfant joue la '
  + 'quasi-totalité du temps de jeu de l\'équipe, or la FFR plafonne le temps de jeu par joueur '
  + 'et par jour. Prévoyez une feuille de match complète pour faire tourner les enfants.';
const FFR_POURQUOI_FORMAT = 'Il suit la doctrine FFR de l\'École de Rugby : un maximum de temps '
  + 'de jeu pour chaque enfant, des matchs équilibrés entre équipes de même niveau, et aucune '
  + 'phase finale à élimination (interdites en tournoi EDR) — c\'est le classement final qui '
  + 'départage. En cas d\'effectif impair, l\'équipe supplémentaire rejoint la poule basse : '
  + 'les enfants qui ont le plus besoin de jouer jouent plus.';
