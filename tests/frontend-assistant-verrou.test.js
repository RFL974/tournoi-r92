/**
 * ============================================================================
 *  GARDE-FOU FRONTEND — le verrou du parcours guidé (téléphone)
 *  Chantier M1-PUB / PUB-2 — défaut R-098 / B5
 * ============================================================================
 *
 *  ▶ Pour lancer :  node tests/frontend-assistant-verrou.test.js
 *    (aucune dépendance, aucun navigateur, aucun réseau — Node seul)
 *    Il tourne aussi dans le contrôle `verifier` du workflow Pages : un échec REFUSE
 *    la publication, comme un fichier JavaScript illisible.
 *
 *  CE QU'IL PROTÈGE.
 *
 *  🔬 CONSTATÉ EN RÉEL le 2026-08-26 par Romain, sur téléphone, sur le site publié
 *  (contrôle B5 de la fiche R-098), classeur SANS aucune donnée de tournoi :
 *  un clic sur « 🌐 Publication » DÉVERROUILLAIT six étapes jamais franchies —
 *  Inviter, Dossier, Équipes, Terrains, Poules, Autorisation — et peignait
 *  « ⏱️ Réglages » EN VERT, c'est-à-dire « faite », alors que c'est précisément
 *  l'étape qui bloque tout le reste.
 *
 *  🔬 LA CAUSE : `assistantIndex` portait DEUX sens — la carte affichée, et la
 *  progression atteinte. Ces deux sens étaient identiques tant qu'on ne pouvait
 *  jamais dépasser une étape bloquée. La carte `libre` de PUB-2 les a séparés,
 *  et le code a continué à les confondre. Le correctif introduit `assistantAtteint`.
 *
 *  ⛔ CE FICHIER NE TESTE PAS L'APPARENCE : il teste QUI EST JOIGNABLE, QUI EST
 *  ANNONCÉ « FAIT », et QUI EST GRISÉ — trois affirmations que l'écran fait à
 *  l'organisateur.
 *  ⭐ Il exécute les VRAIES fonctions — `allerA`, `assistantMajVerrou`,
 *  `assistantRaisonsEtape`, et la VRAIE liste `ASSISTANT_ETAPES` — extraites de
 *  `frontend/js/assistant.js` et lancées dans un contexte Node avec des doublures.
 *
 *  ⭐ ET IL SE PROUVE LUI-MÊME (série Z). R-098 a déjà produit « un harnais qui ne
 *  bloquait jamais » : il aurait validé n'importe quoi. Ici, le code d'AVANT le
 *  correctif est reconstruit par substitution et rejoué — s'il ne reproduit PAS le
 *  défaut constaté le 2026-08-26, ce fichier ÉCHOUE. Un test qui ne peut pas
 *  échouer ne prouve rien.
 *
 *  ⚠️ POURQUOI HORS DE `frontend/` : tout `frontend/` est publié tel quel sur GitHub
 *  Pages. Un fichier de test y serait mis en ligne pour rien.
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = process.env.RACINE_TOURNOI_R92 || path.join(__dirname, '..');
const FICHIER = 'frontend/js/assistant.js';

/* -------------------------------------------------------------------------- */
/*  Extraction — ⛔ on ne réécrit rien, on PREND le code réel.                  */
/*  ⭐ Même mécanique que les deux autres garde-fous du dossier.                */
/* -------------------------------------------------------------------------- */

function lire(cheminRelatif) {
  return fs.readFileSync(path.join(RACINE, cheminRelatif), 'utf8');
}

/** Localise une DÉCLARATION (jamais une occurrence en commentaire) : une déclaration
 *  commence AU DÉBUT D'UNE LIGNE, un commentaire commence par une espace, une étoile
 *  ou deux barres. ⛔ Pas d'analyseur JavaScript : une ancre de ligne suffit. */
function situer(source, cheminRelatif, entete) {
  const estFonction = entete.indexOf('(') !== -1;
  const noyau = estFonction ? entete.replace(/\s*\([\s\S]*$/, '') : entete;
  const motif = new RegExp('^' + noyau.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    (estFonction ? '\\s*\\(' : ''), 'm');
  const trouve = motif.exec(source);
  if (!trouve) {
    throw new Error('Déclaration introuvable dans ' + cheminRelatif + ' : « ' + entete + ' ». ' +
      'Si le code a été renommé, mets ce garde-fou à jour — ne le supprime pas.');
  }
  return trouve.index;
}

/** Découpe un bloc délimité par des accolades ou des crochets, par équilibrage. */
function extraireBloc(cheminRelatif, entete, ouvrant) {
  const source = lire(cheminRelatif);
  const debut = situer(source, cheminRelatif, entete);
  const fermant = ouvrant === '[' ? ']' : '}';
  let profondeur = 0;
  for (let i = source.indexOf(ouvrant, debut); i < source.length; i++) {
    if (source[i] === ouvrant) profondeur++;
    else if (source[i] === fermant && --profondeur === 0) return source.slice(debut, i + 1) + ';';
  }
  throw new Error('Délimiteurs déséquilibrés autour de « ' + entete + ' »');
}

const SRC_ETAPES = extraireBloc(FICHIER, 'const ASSISTANT_ETAPES', '[');
const SRC_CLES = extraireBloc(FICHIER, 'const ASSISTANT_CLES_CERVEAU', '{');
const SRC_ALLER_A = extraireBloc(FICHIER, 'function allerA(', '{');
const SRC_MAJ_VERROU = extraireBloc(FICHIER, 'function assistantMajVerrou(', '{');
const SRC_RAISONS_ETAPE = extraireBloc(FICHIER, 'function assistantRaisonsEtape(', '{');
const SRC_RAISONS_MODIFS = extraireBloc(FICHIER, 'function assistantRaisonsModifs(', '{');

/** La liste réelle des étapes, lue une fois pour dimensionner le banc d'essai. */
const ETAPES = vm.runInNewContext(SRC_ETAPES + '\nASSISTANT_ETAPES;');
const I = {};
ETAPES.forEach(function (e, k) { I[e.id] = k; });

/** Quelles étapes ont un prérequis PROPRE (lu dans le vrai fichier, jamais recopié ici). */
const ASSISTANT_CLES_ETAPE = vm.runInNewContext(SRC_CLES + '\nASSISTANT_CLES_CERVEAU;');

/* -------------------------------------------------------------------------- */
/*  RECONSTRUCTION DU CODE D'AVANT LE CORRECTIF (série Z).                     */
/*                                                                            */
/*  ⚠️ Chaque substitution DOIT s'appliquer. Si une ancre disparaît, on lève —  */
/*  ⛔ un « avant » qui n'a pas été reconstruit se comporterait comme l'« après » */
/*  et déclarerait le défaut introuvable, c'est-à-dire l'inverse de la vérité.  */
/* -------------------------------------------------------------------------- */

function substituer(source, avant, apres, quoi) {
  if (source.indexOf(avant) !== -1) return source.replace(avant, apres);
  // ⭐ DÉJÀ sous sa forme d'avant : c'est le cas quand `mutations-frontend.test.js` a
  //    RÉINTRODUIT le défaut dans une copie pour éprouver ce garde-fou. On n'a alors rien à
  //    reconstruire, et ⛔ ce n'est pas une erreur.
  if (source.indexOf(apres) !== -1) return source;
  throw new Error('Reconstruction du code d\'AVANT impossible — ancre introuvable (' + quoi +
    ').\n  Le correctif R-098/B5 a été réécrit : mets CETTE reconstruction à jour, ' +
    'ne la supprime pas.\n  Ancre : ' + avant.slice(0, 100));
}

/** L'état du code au 2026-08-26 avant correction : `assistantIndex` fait tout. */
function versAncien(srcAllerA, srcMajVerrou) {
  let a = srcAllerA;
  a = substituer(a,
    'if (i > assistantAtteint && !(ASSISTANT_ETAPES[i] || {}).libre) {',
    'if (i > assistantIndex && !(ASSISTANT_ETAPES[i] || {}).libre) {', 'le verrou de allerA');
  a = substituer(a,
    'li.classList.toggle(\'est-faite\', k < Math.min(i, assistantAtteint));',
    'li.classList.toggle(\'est-faite\', k < i);', 'la marque « faite »');
  // La mise à jour de la progression n'existait pas : on la neutralise entièrement.
  a = substituer(a,
    'if (!(ASSISTANT_ETAPES[i] || {}).libre) {\n    // Carte ORDINAIRE',
    'if (false) {\n    // Carte ORDINAIRE', 'la branche « carte ordinaire »');
  a = substituer(a, '} else if (i > assistantAtteint) {', '} else if (false) {',
    'la branche « carte libre »');

  let m = substituer(srcMajVerrou,
    'limite = Math.max(s, assistantAtteint); break;',
    'limite = Math.max(s, assistantIndex); break;', 'la limite du grisage');
  return { allerA: a, majVerrou: m };
}

/* -------------------------------------------------------------------------- */
/*  Le banc d'essai : un faux fil d'étapes, un faux cerveau, le VRAI code.     */
/* -------------------------------------------------------------------------- */

function fabriquerClassList() {
  const noms = new Set();
  return {
    contains: function (n) { return noms.has(n); },
    add: function (n) { noms.add(n); },
    remove: function (n) { noms.delete(n); },
    toggle: function (n, force) {
      if (force === undefined) { if (noms.has(n)) noms.delete(n); else noms.add(n); }
      else if (force) noms.add(n);
      else noms.delete(n);
      return noms.has(n);
    }
  };
}

/** Le « cerveau » `calculerEtatsEtapes`, réduit à ce dont le verrou se sert.
 *  ⚠️ Les titres sont ceux du VRAI cerveau (`admin-tableau-bord.js`) : ils apparaissent
 *  dans le message « Pour continuer : … » que le test lit. */
const TITRES = {
  horaires: 'Horaires', categories: 'Catégories', equipes: 'Équipes',
  terrains: 'Terrains', poules: 'Poules & planning', apresmidi: 'Après-midi'
};

function cerveau(statuts) {
  return Object.keys(TITRES).map(function (cle) {
    return { cle: cle, titre: TITRES[cle], statut: statuts[cle] || 'afaire', detail: 'témoin' };
  });
}

/** ⛔ Le classeur RÉELLEMENT constaté le 2026-08-26 : rien du tout. */
const CLASSEUR_VIDE = cerveau({});
/** Horaires et catégories faits, le reste non : le blocage tombe sur « Équipes ». */
const CLASSEUR_PARTIEL = cerveau({ horaires: 'fait', categories: 'fait' });
/** Tournoi entièrement préparé : plus aucun blocage. */
const CLASSEUR_COMPLET = cerveau({
  horaires: 'fait', categories: 'fait', equipes: 'fait',
  terrains: 'fait', poules: 'fait', apresmidi: 'fait'
});

/**
 * @param {Object} opt
 *   - etats  : le tableau renvoyé par le faux `calculerEtatsEtapes`
 *   - ancien : rejoue le code d'AVANT le correctif (série Z)
 */
function banc(opt) {
  opt = opt || {};
  const chips = ETAPES.map(function () {
    return {
      classList: fabriquerClassList(), offsetWidth: 0,
      getBoundingClientRect: function () { return { left: 0 }; }
    };
  });
  const elements = {
    'asst-track': { style: {} },
    'asst-compteur': { textContent: '' },
    'asst-prec': { style: {} },
    'asst-suiv': { style: {}, disabled: false },
    'asst-barre-jauge': { style: {} },
    'asst-stepper': {
      scrollLeft: 0, clientWidth: 0,
      getBoundingClientRect: function () { return { left: 0 }; }
    },
    'asst-verrou': { hidden: true, innerHTML: '', classList: fabriquerClassList() },
    'assistant': { scrollIntoView: function () { } }
  };

  const refus = [];

  const sources = opt.ancien
    ? versAncien(SRC_ALLER_A, SRC_MAJ_VERROU)
    : { allerA: SRC_ALLER_A, majVerrou: SRC_MAJ_VERROU };

  const ctx = vm.createContext({
    // Le faux navigateur, réduit à ce que le verrou touche réellement.
    document: {
      getElementById: function (id) { return elements[id] || null; },
      querySelectorAll: function (sel) { return sel === '.asst-step' ? chips : []; },
      // ⛔ Aucune `.asst-slide` : `assistantRaisonsModifs` renvoie donc [] — ce banc
      //    éprouve les PRÉREQUIS, pas les saisies non enregistrées (déjà gardées ailleurs).
      querySelector: function () { return null; }
    },
    // Les doublures.
    calculerEtatsEtapes: function () { return opt.etats; },
    raisonsModifsDans: function () { return []; },
    assistantZonesSurveillees: function () { return []; },
    echapper: function (s) { return String(s); },
    ajusterHauteur: function () { },
    ecransEstActif: function () { return false; },
    assistantSecouerVerrou: function () { refus.push(true); },
    // Les deux repères, exposés pour être LUS par le test.
    assistantIndex: 0,
    assistantAtteint: 0,
    __api: null
  });

  vm.runInContext([
    SRC_ETAPES, SRC_CLES, sources.allerA, sources.majVerrou,
    SRC_RAISONS_ETAPE, SRC_RAISONS_MODIFS,
    '__api = { allerA: allerA };'
  ].join('\n\n'), ctx);

  function instantane() {
    const marques = function (nom) {
      return chips.map(function (c, k) { return c.classList.contains(nom) ? k : -1; })
        .filter(function (k) { return k >= 0; });
    };
    return {
      index: ctx.assistantIndex,
      atteint: ctx.assistantAtteint,
      verts: marques('est-faite'),
      grisees: marques('est-verrouillee'),
      suivantBloque: elements['asst-suiv'].disabled
    };
  }

  return {
    allerA: function (i) { ctx.__api.allerA(i, 1); return instantane(); },
    instantane: instantane,
    refus: refus,
    // Le démarrage réel de `construireAssistant` : index 0, progression 0.
    demarrer: function () { ctx.assistantIndex = 0; ctx.assistantAtteint = 0; return this.allerA(0); }
  };
}

/* -------------------------------------------------------------------------- */
/*  Assertions                                                                */
/* -------------------------------------------------------------------------- */

const etat = { ok: 0, fail: 0, total: 0, echecs: [] };

function verifier(libelle, condition, detail) {
  etat.total++;
  if (condition) { etat.ok++; console.log('  ok    ' + libelle); }
  else {
    etat.fail++;
    etat.echecs.push(libelle);
    console.log('  ÉCHEC ' + libelle + (detail ? '\n          → ' + detail : ''));
  }
}

const memeListe = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const nomsDe = (l) => l.map(function (k) { return ETAPES[k].titre; }).join(', ') || '(aucune)';

/** Ce que l'organisateur VOIT réellement, et rien d'autre.
 *  ⛔ `atteint` en est exclu, et c'est capital pour la série N : ce repère N'EXISTE PAS dans le
 *  code d'avant (il y vaut toujours 0). Le comparer ferait échouer la non-régression à coup sûr,
 *  ⭐ en annonçant une différence de COMPORTEMENT là où il n'y a qu'une différence de MÉCANIQUE
 *  INTERNE. Ce que le correctif promet, c'est un écran identique — pas des rouages identiques. */
function visible(inst) {
  return { index: inst.index, verts: inst.verts, grisees: inst.grisees,
           suivantBloque: inst.suivantBloque };
}

/* ========================================================================== */

console.log('===== R-098 / B5 — verrou du parcours guidé (garde-fou frontend) =====');
console.log('(défaut constaté sur téléphone le 2026-08-26 — classeur sans données)\n');

/* --- Contrôles de fidélité du banc : sans eux, tout le reste est creux ----- */

console.log('-- Série F — le banc décrit-il la vraie application ? --');

verifier('F-1 · la carte « Publication » existe et est marquée `libre`',
  I.publication !== undefined && ETAPES[I.publication].libre === true);
verifier('F-2 · « Résumé » existe et n\'est PAS `libre` (il porte la réinitialisation)',
  I.resume !== undefined && !ETAPES[I.resume].libre);
verifier('F-3 · « Résumé » contient bien `bloc-reinitialisation`',
  (ETAPES[I.resume].blocs || []).indexOf('bloc-reinitialisation') !== -1);
verifier('F-4 · « Publication » ne porte QUE `bloc-publication`',
  memeListe(ETAPES[I.publication].blocs, ['bloc-publication']));
verifier('F-5 · une seule carte `libre` dans tout le parcours',
  ETAPES.filter(function (e) { return e.libre; }).length === 1,
  'trouvées : ' + ETAPES.filter(function (e) { return e.libre; }).map(function (e) { return e.id; }));
verifier('F-6 · Publication est placée après Autorisation (comme sur grand écran)',
  I.publication === I.autorisation + 1);

/* --- Série Z : le code d'AVANT reproduit-il le défaut constaté ? ----------- */

console.log('\n-- Série Z — AUTOTEST : le code d\'avant reproduit-il le défaut réel ? --');
console.log('   (s\'il ne le reproduit pas, ce fichier ne prouve plus rien et DOIT échouer)');

{
  const vieux = banc({ etats: CLASSEUR_VIDE, ancien: true });
  vieux.demarrer();
  const avantClic = vieux.instantane();
  const apresClic = vieux.allerA(I.publication);

  verifier('Z-1 · AVANT le clic, les six étapes signalées par Romain sont grisées',
    [I.invitation, I.dossier, I.equipes, I.terrains, I.poules, I.autorisation]
      .every(function (k) { return avantClic.grisees.indexOf(k) !== -1; }),
    'grisées : ' + nomsDe(avantClic.grisees));

  verifier('Z-2 · l\'ancien code DÉVERROUILLE bien ces six étapes après le clic',
    [I.invitation, I.dossier, I.equipes, I.terrains, I.poules, I.autorisation]
      .every(function (k) { return apresClic.grisees.indexOf(k) === -1; }),
    'encore grisées : ' + nomsDe(apresClic.grisees));

  verifier('Z-3 · l\'ancien code peint « Réglages » EN VERT (effet ③, confirmé par Romain)',
    apresClic.verts.indexOf(I.reglages) !== -1,
    'vertes : ' + nomsDe(apresClic.verts));

  verifier('Z-4 · l\'ancien code laisse bien Après-midi, Feuille, Partenaires et Résumé grisés',
    [I.apresmidi, I.feuillejour, I.sponsors, I.resume]
      .every(function (k) { return apresClic.grisees.indexOf(k) !== -1; }),
    'grisées : ' + nomsDe(apresClic.grisees));

  const vieux2 = banc({ etats: CLASSEUR_VIDE, ancien: true });
  vieux2.demarrer();
  vieux2.allerA(I.publication);
  verifier('Z-5 · l\'ancien code laisse RÉELLEMENT atteindre « Équipes » (pas qu\'un grisage)',
    vieux2.allerA(I.equipes).index === I.equipes);
}

/* --- Série V : le comportement exigé, après correctif ---------------------- */

console.log('\n-- Série V — le comportement corrigé, classeur VIDE --');

{
  const b = banc({ etats: CLASSEUR_VIDE });
  b.demarrer();
  const depart = b.instantane();
  const surPublication = b.allerA(I.publication);

  verifier('V-A1 · Publication reste joignable directement depuis la 1re étape',
    surPublication.index === I.publication,
    'atterri sur : ' + ETAPES[surPublication.index].titre);

  verifier('V-A2 · Publication n\'est jamais grisée',
    surPublication.grisees.indexOf(I.publication) === -1);

  const bloquees = [I.invitation, I.dossier, I.equipes, I.terrains, I.poules, I.autorisation];
  verifier('V-B1 · les six étapes restent GRISÉES après le clic sur Publication',
    bloquees.every(function (k) { return surPublication.grisees.indexOf(k) !== -1; }),
    'grisées : ' + nomsDe(surPublication.grisees));

  let toutesRefusees = true;
  const atteintes = [];
  bloquees.forEach(function (k) {
    const b2 = banc({ etats: CLASSEUR_VIDE });
    b2.demarrer();
    b2.allerA(I.publication);
    const apres = b2.allerA(k);
    if (apres.index === k) { toutesRefusees = false; atteintes.push(ETAPES[k].titre); }
  });
  verifier('V-B2 · aucune des six n\'est RÉELLEMENT atteignable depuis Publication',
    toutesRefusees, 'atteintes à tort : ' + (atteintes.join(', ') || '(aucune)'));

  verifier('V-C1 · AUCUNE étape non réalisée n\'est peinte en vert',
    surPublication.verts.indexOf(I.reglages) === -1 &&
    surPublication.verts.indexOf(I.equipes) === -1 &&
    surPublication.verts.indexOf(I.terrains) === -1 &&
    surPublication.verts.indexOf(I.poules) === -1,
    'vertes : ' + nomsDe(surPublication.verts));

  // ⚠️ CE CONTRÔLE EST ÉPINGLÉ, ET IL FAUT LIRE POURQUOI.
  //
  // Entrer sur Publication depuis un classeur vide peint UNE étape en vert : « 📝 Infos ».
  // ⭐ C'est voulu, et ce n'est pas un mensonge : `ASSISTANT_CLES_CERVEAU` n'impose AUCUN
  // prérequis à « Infos ». Vert y signifie « rien ne reste à faire ici », ce qui est exact.
  // ⭐ Ce n'est pas non plus un comportement neuf : l'ancien code peignait déjà « Infos » en
  // vert dès le premier « Suivant » (série N, classeur vide, clic 1 → verts = [0]).
  // ⛔ Ce qui était FAUX et qui est corrigé : « ⏱️ Réglages » — l'étape qui bloque réellement —
  // était peinte en vert elle aussi, avec Inviter, Dossier, Équipes, Terrains et Autorisation.
  //
  // La liste est ÉPINGLÉE plutôt que décrite : si un jour une étape de plus verdit ici, ce
  // garde-fou doit le DIRE, et non l'absorber en silence.
  verifier('V-C2 · classeur vide, sur Publication : exactement « Infos » est verte, rien d\'autre',
    memeListe(surPublication.verts, [I.infos]),
    'vertes : ' + nomsDe(surPublication.verts) + ' (attendu : Infos seule)');

  verifier('V-C3 · aucune étape PORTANT un prérequis non rempli n\'est verte',
    surPublication.verts.every(function (k) {
      return !ASSISTANT_CLES_ETAPE[ETAPES[k].id];
    }),
    'vertes à prérequis : ' + nomsDe(surPublication.verts.filter(function (k) {
      return !!ASSISTANT_CLES_ETAPE[ETAPES[k].id];
    })));

  verifier('V-C4 · au départ (avant tout clic), aucune étape n\'est verte',
    memeListe(depart.verts, []), 'vertes : ' + nomsDe(depart.verts));

  verifier('V-E1 · « Résumé » reste inatteignable depuis Publication (le tremplin est fermé)',
    b.allerA(I.resume).index === I.publication);

  const b3 = banc({ etats: CLASSEUR_VIDE });
  b3.demarrer();
  b3.allerA(I.publication);
  b3.allerA(I.autorisation);
  verifier('V-E2 · ni en deux temps, par Autorisation puis Résumé',
    b3.allerA(I.resume).index !== I.resume);

  verifier('V-F1 · « Suivant » reste bloqué depuis Publication',
    surPublication.suivantBloque);

  verifier('V-F2 · le refus se signale (secousse de l\'explication)', b.refus.length > 0);
}

console.log('\n-- Série V — chaque étape garde son verrou PROPRE --');

{
  // Classeur partiel : horaires + catégories faits ⇒ le blocage tombe sur « Équipes ».
  const b = banc({ etats: CLASSEUR_PARTIEL });
  b.demarrer();

  verifier('V-D1 · « Réglages » est joignable (ses deux prérequis sont faits)',
    b.allerA(I.reglages).index === I.reglages);

  verifier('V-D2 · on atterrit SUR « Équipes » quand on vise plus loin (étape à finir)',
    b.allerA(I.poules).index === I.equipes);

  verifier('V-D3 · « Terrains » reste refusé tant qu\'Équipes n\'est pas fait',
    b.allerA(I.terrains).index === I.equipes);

  verifier('V-D4 · « Poules » reste refusé également',
    b.allerA(I.poules).index === I.equipes);

  const surPub = b.allerA(I.publication);
  verifier('V-D5 · Publication reste joignable depuis « Équipes »',
    surPub.index === I.publication);
  verifier('V-D6 · et « Terrains » reste refusé APRÈS ce détour',
    b.allerA(I.terrains).index === I.publication);

  const vide = banc({ etats: CLASSEUR_VIDE });
  vide.demarrer();
  verifier('V-D7 · classeur vide : « Réglages » garde SON verrou (Équipes hors de portée)',
    vide.allerA(I.equipes).index !== I.equipes);
}

console.log('\n-- Série M — la progression ne recule JAMAIS (monotonie) --');

{
  const b = banc({ etats: CLASSEUR_PARTIEL });
  b.demarrer();
  const jusqueEquipes = b.allerA(I.equipes);
  verifier('M-1 · la progression monte quand on avance légitimement',
    jusqueEquipes.atteint === I.equipes, 'atteint = ' + jusqueEquipes.atteint);

  const retour = b.allerA(I.infos);
  verifier('M-2 · revenir à la 1re étape ne fait PAS reculer la progression',
    retour.atteint === I.equipes, 'atteint = ' + retour.atteint);

  verifier('M-3 · et l\'étape acquise reste joignable sans la refranchir',
    b.allerA(I.equipes).index === I.equipes);

  const detour = b.allerA(I.publication);
  verifier('M-4 · un détour par la carte `libre` ne fait pas reculer la progression',
    detour.atteint === I.equipes, 'atteint = ' + detour.atteint);

  // Monotonie éprouvée sur une longue séquence, aller et retour, tous classeurs.
  let monotone = true, ouCaCasse = '';
  [CLASSEUR_VIDE, CLASSEUR_PARTIEL, CLASSEUR_COMPLET].forEach(function (etats, n) {
    const s = banc({ etats: etats });
    s.demarrer();
    let precedent = s.instantane().atteint;
    const parcours = [];
    for (let k = 0; k < ETAPES.length; k++) parcours.push(k);
    for (let k = ETAPES.length - 1; k >= 0; k--) parcours.push(k);
    parcours.forEach(function (k) {
      const a = s.allerA(k).atteint;
      if (a < precedent) { monotone = false; ouCaCasse = 'classeur ' + n + ', étape ' + k; }
      precedent = a;
    });
  });
  verifier('M-5 · sur ' + (ETAPES.length * 2) + ' navigations × 3 classeurs, ' +
    'la progression ne décroît jamais', monotone, ouCaCasse);
}

console.log('\n-- Série N — NON-RÉGRESSION : le parcours ordinaire est-il inchangé ? --');

{
  // ⭐ Le parcours ORDINAIRE = les clics sur « Suivant », pas à pas, depuis le départ.
  //   C'est ce que fait un organisateur qui ne saute rien.
  [['vide', CLASSEUR_VIDE], ['partiel', CLASSEUR_PARTIEL], ['complet', CLASSEUR_COMPLET]]
    .forEach(function (paire) {
      const nom = paire[0], etats = paire[1];
      const neuf = banc({ etats: etats });
      const vieux = banc({ etats: etats, ancien: true });
      neuf.demarrer(); vieux.demarrer();
      let identique = true, ecart = '';
      for (let n = 0; n < ETAPES.length + 2; n++) {
        const a = visible(neuf.allerA(neuf.instantane().index + 1));
        const b = visible(vieux.allerA(vieux.instantane().index + 1));
        if (!memeListe(a, b)) {
          identique = false;
          ecart = 'au clic ' + (n + 1) + ' — nouveau ' + JSON.stringify(a) +
                  ' / ancien ' + JSON.stringify(b);
          break;
        }
      }
      verifier('N-1 (' + nom + ') · « Suivant » pas à pas : comportement IDENTIQUE à avant',
        identique, ecart);
    });

  // Retours en arrière depuis une progression acquise, sur un tournoi complet.
  const neuf = banc({ etats: CLASSEUR_COMPLET });
  const vieux = banc({ etats: CLASSEUR_COMPLET, ancien: true });
  neuf.demarrer(); vieux.demarrer();
  let identique = true, ecart = '';
  [I.poules, I.terrains, I.reglages, I.infos, I.equipes, I.resume, I.infos].forEach(function (k, n) {
    const a = visible(neuf.allerA(k)), b = visible(vieux.allerA(k));
    if (identique && !memeListe(a, b)) {
      identique = false;
      ecart = 'à la navigation ' + (n + 1) + ' (' + ETAPES[k].titre + ') — nouveau ' +
              JSON.stringify(a) + ' / ancien ' + JSON.stringify(b);
    }
  });
  verifier('N-2 · tournoi complet, allers-retours libres : comportement IDENTIQUE à avant',
    identique, ecart);

  // ⭐ LA PROPRIÉTÉ GLOBALE, et c'est la plus forte : le correctif ne peut que RESTREINDRE.
  let jamaisPlusPermissif = true, faute = '';
  [CLASSEUR_VIDE, CLASSEUR_PARTIEL, CLASSEUR_COMPLET].forEach(function (etats, c) {
    for (let depart = 0; depart < ETAPES.length; depart++) {
      for (let cible = 0; cible < ETAPES.length; cible++) {
        const a = banc({ etats: etats }), v = banc({ etats: etats, ancien: true });
        a.demarrer(); v.demarrer();
        a.allerA(depart); v.allerA(depart);
        const ra = a.allerA(cible), rv = v.allerA(cible);
        // 1) joignabilité : ce que le nouveau accepte, l'ancien l'acceptait déjà
        if (ra.index === cible && rv.index !== cible) {
          jamaisPlusPermissif = false;
          faute = 'classeur ' + c + ' : ' + ETAPES[depart].titre + ' → ' + ETAPES[cible].titre +
                  ' accepté par le nouveau, refusé par l\'ancien';
        }
        // 2) marques vertes : le nouveau n'en ajoute jamais
        const ajoutees = ra.verts.filter(function (k) { return rv.verts.indexOf(k) === -1; });
        if (ajoutees.length && jamaisPlusPermissif) {
          jamaisPlusPermissif = false;
          faute = 'classeur ' + c + ' : ' + ETAPES[depart].titre + ' → ' + ETAPES[cible].titre +
                  ' peint en vert ' + nomsDe(ajoutees) + ' que l\'ancien ne peignait pas';
        }
      }
    }
  });
  verifier('N-3 · sur les ' + (3 * ETAPES.length * ETAPES.length) + ' trajets possibles, ' +
    'le correctif ne DÉVERROUILLE ni ne VERDIT jamais plus que l\'ancien',
    jamaisPlusPermissif, faute);
}

console.log('\n-- Série C — cohérence : ce qui est grisé est exactement ce qui est refusé --');

{
  let coherent = true, faute = '';
  [CLASSEUR_VIDE, CLASSEUR_PARTIEL, CLASSEUR_COMPLET].forEach(function (etats, c) {
    [I.infos, I.reglages, I.equipes, I.publication].forEach(function (depart) {
      const ref = banc({ etats: etats });
      ref.demarrer();
      const vu = ref.allerA(depart);
      ETAPES.forEach(function (e, cible) {
        if (cible === vu.index) return;
        const essai = banc({ etats: etats });
        essai.demarrer();
        essai.allerA(depart);
        const arrive = essai.allerA(cible).index === cible;
        const grisee = vu.grisees.indexOf(cible) !== -1;
        if (arrive === grisee && coherent) {
          coherent = false;
          faute = 'classeur ' + c + ', depuis ' + ETAPES[vu.index].titre + ' vers ' + e.titre +
                  ' : ' + (grisee ? 'grisée mais atteignable' : 'atteignable mais non grisée');
        }
      });
    });
  });
  verifier('C-1 · une étape est grisée SI ET SEULEMENT SI elle est refusée', coherent, faute);
}

/* ========================================================================== */

console.log('\n==============================================');
console.log('R-098/B5 frontend — ' + etat.ok + '/' + etat.total + ' OK, ' + etat.fail + ' ÉCHEC(S)');
if (etat.fail) etat.echecs.forEach(function (e) { console.log('   · ' + e); });
console.log('==============================================');
process.exit(etat.fail ? 1 : 0);
