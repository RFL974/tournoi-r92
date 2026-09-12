/**
 * ============================================================================
 *  GARDE-FOU — ACCÈS ÉPHÉMÈRE AUX SCORES : LE NOYAU PUR
 *  IMPL-…-5H, corrigé par CORR-…-5I, …-5J, puis CORR-ACCES-SCORES-CONFIRMATION-DR-5K
 *  Conception : voir l'en-tête du bloc « ACCÈS ÉPHÉMÈRE AUX SCORES — LE NOYAU PUR »
 *  dans backend/Code.gs
 * ============================================================================
 *
 *  ▶ Pour lancer :  node tests/backend-acces-scores-noyau-pur.test.js
 *    (aucune dépendance, aucun navigateur, aucun réseau, ⛔ aucun Google — Node seul)
 *
 *  CE QU'IL PROTÈGE.
 *
 *  `saisie.html` sert aujourd'hui les données du tournoi AVANT toute autorisation, et son
 *  adresse est permanente. La correction complète demande un jeton par édition, un stockage
 *  protégé et une route qui contrôle avant de servir — trois chantiers. Ce lot pose UNIQUEMENT
 *  les RÈGLES, sous forme de fonctions de décision pures, que personne n'appelle encore.
 *
 *  ⭐ CE BANC FAIT TROIS CHOSES, ET LA TROISIÈME EST LA PLUS IMPORTANTE :
 *    ① il REJOUE la série Apps Script 5H — une série écrite chez Google mais jamais lancée
 *       n'est pas un garde-fou, c'est une intention ;
 *    ② il vérifie que RIEN N'EST BRANCHÉ : aucune des fonctions ajoutées n'est appelée
 *       ailleurs dans le fichier, et les zones interdites n'ont pas bougé ;
 *    ③ il RÉINTRODUIT TRENTE-QUATRE DÉFAUTS, un par un, et exige que les séries les attrapent.
 *       Un contrôle qui ne sait pas échouer ne prouve rien. ⛔ Et si une mutation ne s'applique
 *       pas EXACTEMENT une fois, le banc échoue : une mutation qui ne mute rien prouverait
 *       le contraire de ce qu'on croit.
 *
 *  ⚠️ LA LEÇON DE 5I. La série 5H passait à 46/46 — et neuf défauts indépendants ont pourtant
 *  été reproduits par une revue extérieure : une phase du matin masquée par l'après-midi, une
 *  version corrompue ramenée à zéro, une empreinte de fin aveugle aux identifiants, un rejeu
 *  resservi à une autre édition, un assainissement qui ne descendait qu'au premier niveau…
 *  ⭐ Les huit mutants ajoutés en 5I existent pour que ces neuf trous ne puissent plus se
 *  refermer en silence.
 *
 *  ⚠️ Les services Google ne sont PAS émulés : ce sont des doublures inertes. Le banc échoue
 *  bruyamment si un chemin testé essaie vraiment de s'en servir.
 *
 *  ⚠️ TOUTES LES VALEURS SONT FICTIVES — aucun jeton, aucune clé réelle n'apparaît ici.
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = process.env.RACINE_TOURNOI_R92 || path.join(__dirname, '..');
const CHEMIN_CODE = path.join(RACINE, 'backend/Code.gs');
const CHEMIN_TESTS = path.join(RACINE, 'backend/Tests.gs');
const SOURCE_CODE = fs.readFileSync(CHEMIN_CODE, 'utf8');
const SOURCE_TESTS = fs.readFileSync(CHEMIN_TESTS, 'utf8');

/* ========================================================================== */
/*  ASSERTIONS                                                                */
/* ========================================================================== */

const etat = { total: 0, ok: 0, fail: 0, echecs: [] };
function verifier(condition, libelle) {
  etat.total++;
  if (condition) { etat.ok++; console.log('  OK    ' + libelle); }
  else { etat.fail++; etat.echecs.push(libelle); console.log('  ÉCHEC ' + libelle); }
}
function titre(t) { console.log('\n-- ' + t + ' --'); }

/* ========================================================================== */
/*  LE BAC — Apps Script réduit à des doublures INERTES                       */
/* ========================================================================== */

/**
 * ⚠️ Chaque service Google LÈVE si on s'en sert. C'est délibéré : le noyau 5H est censé être
 * PUR, et la seule façon de le prouver est de rendre toute tentative d'appel bruyante.
 * ⛔ `Utilities.getUuid` lève aussi : le noyau ne doit tirer AUCUN aléa — les identifiants
 * lui sont fournis.
 */
function fabriquerBac(sourceCode) {
  const journal = [];
  const inerte = (nom) => new Proxy({}, {
    get() { throw new Error('Service Google touché par un chemin pur : ' + nom); }
  });
  const bac = vm.createContext({
    Logger: { log: (m) => journal.push(String(m)) },
    Utilities: {
      getUuid() { throw new Error('Utilities.getUuid appelé : le noyau pur ne tire aucun aléa'); },
      formatDate() { throw new Error('Utilities.formatDate appelé : le noyau pur ne lit pas l\'horloge'); },
      computeDigest() { throw new Error('Utilities.computeDigest appelé : le noyau pur reste sans Google'); }
    },
    Session: inerte('Session'),
    SpreadsheetApp: inerte('SpreadsheetApp'),
    DriveApp: inerte('DriveApp'),
    CacheService: inerte('CacheService'),
    PropertiesService: inerte('PropertiesService'),
    LockService: inerte('LockService'),
    ContentService: inerte('ContentService'),
    UrlFetchApp: inerte('UrlFetchApp'),
    MailApp: inerte('MailApp'),
    GmailApp: inerte('GmailApp'),
    HtmlService: inerte('HtmlService')
  });
  vm.runInContext(sourceCode, bac, { filename: 'backend/Code.gs' });
  vm.runInContext(SOURCE_TESTS, bac, { filename: 'backend/Tests.gs' });
  bac.__journal = journal;
  return bac;
}

const bac = fabriquerBac(SOURCE_CODE);
const F = (nom) => {
  const f = vm.runInContext(nom, bac);
  if (typeof f !== 'function') {
    throw new Error('Fonction introuvable dans backend/Code.gs : « ' + nom + ' ». ' +
      'Si elle a été renommée, mets ce garde-fou à jour — ne le supprime pas.');
  }
  return f;
};

/* Les noms des séries 5H ET 5I, lus dans backend/Tests.gs : ⛔ jamais recopiés à la main, sinon
   un test ajouté chez Google ne serait jamais rejoué ici. */
function nomsDeSerie(prefixe) {
  const motif = new RegExp('^function (' + prefixe + '[A-Za-z0-9_]+)\\(', 'gm');
  return (SOURCE_TESTS.match(motif) || [])
    .map((s) => s.replace(/^function /, '').replace(/\($/, ''));
}
const TESTS_5H = nomsDeSerie('test5H_');
const TESTS_5I = nomsDeSerie('test5I_');
const TESTS_5J = nomsDeSerie('test5J_');
const TESTS_5K = nomsDeSerie('test5K_');
const TESTS_NOYAU = TESTS_5H.concat(TESTS_5I).concat(TESTS_5J).concat(TESTS_5K);

/** Rejoue les séries 5H + 5I + 5J dans un bac donné et rend leur bilan cumulé. */
function rejouerSerie5H(contexte) {
  const bilan = { total: 0, ok: 0, fail: 0, echecs: [] };
  TESTS_NOYAU.forEach((nom) => {
    const f = vm.runInContext(nom, contexte);
    if (typeof f !== 'function') {
      bilan.total++; bilan.fail++; bilan.echecs.push(nom + ' introuvable dans backend/Tests.gs');
      return;
    }
    const e = { total: 0, ok: 0, fail: 0, echecs: [] };
    try { f(e); } catch (err) {
      e.total++; e.fail++; e.echecs.push(nom + ' a levé : ' + err.message);
    }
    bilan.total += e.total; bilan.ok += e.ok; bilan.fail += e.fail;
    e.echecs.forEach((x) => bilan.echecs.push(x));
  });
  return bilan;
}

/* ========================================================================== */
/*  SÉRIE A — LA SÉRIE APPS SCRIPT 5H TOURNE VRAIMENT                         */
/* ========================================================================== */

titre('A — la série Apps Script 5H tourne vraiment ici');

verifier(TESTS_5H.length >= 46 && TESTS_5I.length >= 20 && TESTS_5J.length >= 18 &&
         TESTS_5K.length >= 14,
  'A0 : les quatre séries sont présentes dans backend/Tests.gs — ' + TESTS_5H.length +
  ' fonctions 5H, ' + TESTS_5I.length + ' 5I, ' + TESTS_5J.length + ' 5J et ' +
  TESTS_5K.length + ' 5K');

const BILAN_INTACT = rejouerSerie5H(bac);
verifier(BILAN_INTACT.fail === 0,
  'A1 ⭐⭐ les quatre séries passent ENTIÈREMENT ici : ' + BILAN_INTACT.ok + '/' +
  BILAN_INTACT.total + ' assertions, ' + BILAN_INTACT.fail + ' échec(s)' +
  (BILAN_INTACT.echecs.length ? ' — ' + BILAN_INTACT.echecs[0] : ''));

/* ⭐ Chaque fonction de la série est aussi enregistrée dans `lancerTestsFFR` : une série
   présente mais non appelée depuis le point d'entrée ne tournerait jamais chez Google. */
const nonEnregistrees = TESTS_NOYAU.filter((n) => SOURCE_TESTS.indexOf('  ' + n + '(etat);') === -1);
verifier(nonEnregistrees.length === 0,
  'A2 : les ' + TESTS_NOYAU.length + ' tests du noyau sont appelés depuis `lancerTestsFFR`' +
  (nonEnregistrees.length ? ' — manquants : ' + nonEnregistrees.join(', ') : ''));

/* ========================================================================== */
/*  SÉRIE B — RIEN N'EST BRANCHÉ, ET LES ZONES INTERDITES N'ONT PAS BOUGÉ     */
/* ========================================================================== */

titre('B — le noyau est bien DÉCONNECTÉ (c\'est la promesse centrale du lot)');

/** Le bloc 5H, isolé du reste du fichier. */
function decouperBloc5H(source) {
  const debut = source.indexOf('/* ===================== ACCÈS ÉPHÉMÈRE AUX SCORES — LE NOYAU PUR');
  if (debut === -1) throw new Error('Bloc 5H introuvable dans backend/Code.gs');
  const fin = source.indexOf('/* ===================== RETOUR D\'UNE FONCTION DE MAINTENANCE', debut);
  if (fin === -1) throw new Error('Fin du bloc 5H introuvable');
  return { bloc: source.slice(debut, fin), reste: source.slice(0, debut) + source.slice(fin) };
}

const DECOUPE = decouperBloc5H(SOURCE_CODE);

/* Les noms déclarés par le bloc — fonctions et constantes. */
const FONCTIONS_5H = (DECOUPE.bloc.match(/^function ([A-Za-z0-9_]+)\(/gm) || [])
  .map((s) => s.replace(/^function /, '').replace(/\($/, ''));
const CONSTANTES_5H = (DECOUPE.bloc.match(/^var (ACCES_[A-Za-z0-9_]+)/gm) || [])
  .map((s) => s.replace(/^var /, ''));

verifier(FONCTIONS_5H.length >= 38 && CONSTANTES_5H.length >= 29,
  'B1 : le bloc déclare ' + FONCTIONS_5H.length + ' fonctions et ' + CONSTANTES_5H.length +
  ' constantes');

/* ⭐ LA PREUVE QUE RIEN N'EST BRANCHÉ : aucun de ces noms n'apparaît ailleurs dans Code.gs. */
const fuites = FONCTIONS_5H.concat(CONSTANTES_5H)
  .filter((n) => new RegExp('\\b' + n + '\\b').test(DECOUPE.reste));
verifier(fuites.length === 0,
  'B2 ⭐ aucune fonction ni constante du noyau n\'est référencée ailleurs dans Code.gs' +
  (fuites.length ? ' — fuites : ' + fuites.join(', ') : ''));

/* ⛔ `ENTETES` est INTACT : aucun onglet n'est déclaré, donc aucune fonction de maintenance
   existante ne peut créer quoi que ce soit. ⚠️ Et `ENTETES.Editions.length` sert de largeur de
   plage ailleurs : l'allonger casserait un classeur en service. */
const ENTETES = vm.runInContext('ENTETES', bac);
const CLES_ENTETES_ATTENDUES = ['Config', 'Equipes', 'Poules', 'Matchs', 'Historique',
  'ClubsInvites', 'Sponsors', 'Mesures', 'Editions', 'TerrainsPlan', 'Terrains', 'MiniTerrains',
  'Clubs', 'Participations'];
const clesEntetes = Object.keys(ENTETES);
const ajoutees = clesEntetes.filter((k) => CLES_ENTETES_ATTENDUES.indexOf(k) === -1);
verifier(ajoutees.length === 0 && /AccesScores|JournalAudit|RequetesIdempotentes/.test(JSON.stringify(clesEntetes)) === false,
  'B3 ⭐ `ENTETES` ne déclare AUCUN onglet nouveau (ni AccesScores, ni JournalAudit, ni ' +
  'RequetesIdempotentes)' + (ajoutees.length ? ' — ajoutés : ' + ajoutees.join(', ') : ''));

/* ⛔ Les zones interdites ne mentionnent rien du noyau. */
function corpsDe(source, entete) {
  const debut = source.indexOf(entete);
  if (debut === -1) throw new Error('Introuvable : ' + entete);
  let p = 0;
  for (let i = source.indexOf('{', debut); i < source.length; i++) {
    if (source[i] === '{') p++;
    else if (source[i] === '}' && --p === 0) return source.slice(debut, i + 1);
  }
  throw new Error('Accolades déséquilibrées : ' + entete);
}
const ZONES_INTERDITES = ['function doGet(', 'function doPost(', 'function enregistrerScore(',
  'function reinitialiserTournoi(', 'function planifierOuvertureEdition(',
  'function planifierBasculeEdition(', 'function basculerEditionApresReset('];
const zonesTouchees = ZONES_INTERDITES.filter((z) => /ACCES_|acces[A-Z]|AccesScores/.test(corpsDe(SOURCE_CODE, z)));
verifier(zonesTouchees.length === 0,
  'B4 ⭐ `doGet`, `doPost`, `enregistrerScore`, le reset et le registre des éditions ne ' +
  'mentionnent RIEN du noyau' + (zonesTouchees.length ? ' — touchées : ' + zonesTouchees.join(', ') : ''));

/* ⛔ Le schéma des matchs n'a pas reçu de colonne : la « version » d'un match est DÉDUITE. */
verifier(ENTETES.Matchs.indexOf('version') === -1 &&
         ENTETES.Matchs.length === 27 &&
         /empreinteEtatMatch/.test(DECOUPE.bloc),
  'B5 ⭐ aucune colonne `version` ajoutée aux matchs (' + ENTETES.Matchs.length +
  ' colonnes) : la version est déduite par `empreinteEtatMatch`');

/* ========================================================================== */
/*  SÉRIE C — LA PURETÉ, VÉRIFIÉE EN EXÉCUTION ET DANS LA SOURCE              */
/* ========================================================================== */

titre('C — la pureté : aucun Google, aucune horloge, aucun aléa, aucune écriture');

/* ⭐ Le bac LÈVE sur tout service Google. Si la série entière passe dans ce bac, c'est qu'aucun
   chemin testé n'a touché Google, ni lu l'horloge, ni tiré d'aléa. */
verifier(BILAN_INTACT.fail === 0,
  'C1 ⭐ les quatre séries passent dans un bac où TOUT service Google lève — donc aucun chemin ' +
  'testé n\'appelle Google, `getUuid`, `formatDate` ni `computeDigest`');

const SERVICES = ['SpreadsheetApp', 'DriveApp', 'CacheService', 'PropertiesService',
  'LockService', 'ContentService', 'UrlFetchApp', 'MailApp', 'GmailApp', 'HtmlService',
  'Session', 'Utilities'];
const servicesCites = SERVICES.filter((s) => new RegExp('\\b' + s + '\\.').test(DECOUPE.bloc));
verifier(servicesCites.length === 0,
  'C2 : la source du bloc ne cite AUCUN service Google' +
  (servicesCites.length ? ' — cités : ' + servicesCites.join(', ') : ''));

/* ⛔ Aucune lecture d'horloge : `new Date()` sans argument est interdit dans le bloc.
   ⭐ `new Date(Date.UTC(...))` est permis — c'est de l'arithmétique sur une date FOURNIE. */
verifier(/new Date\(\s*\)/.test(DECOUPE.bloc) === false && /Date\.now/.test(DECOUPE.bloc) === false,
  'C3 ⭐ le bloc ne lit jamais l\'horloge (`new Date()` et `Date.now` absents)');

/* Déterminisme : deux appels identiques rendent exactement le même résultat. */
const determiner = F('determinerFinDeTournoiAcces');
const cats = [{ categorie: 'U10', presente: 'oui' }];
const matchs = [{ id_match: 'M1', categorie: 'U10', phase: 'poule', statut: 'à venir' }];
const un = JSON.stringify(determiner(cats, matchs));
const deux = JSON.stringify(determiner(cats, matchs));
verifier(un === deux, 'C4 : le calcul de fin est déterministe (deux appels, même résultat)');

/* ⛔ Aucune mutation des entrées. */
const catsAvant = JSON.stringify(cats), matchsAvant = JSON.stringify(matchs);
determiner(cats, matchs);
F('planifierTransitionAcces')(null, { action: 'PREPARER', version_lue: 0 });
F('planifierResetAccesScores')(null, '2026-09-13 20:00:00');
verifier(JSON.stringify(cats) === catsAvant && JSON.stringify(matchs) === matchsAvant,
  'C5 : les décisions ne modifient jamais les données qu\'on leur donne');

/* ⛔ Le noyau ne fabrique aucun jeton : aucun générateur, aucune adresse. */
verifier(/getUuid|randomUUID|Math\.random/.test(DECOUPE.bloc) === false &&
         /https?:\/\//.test(DECOUPE.bloc.replace(/\/\*[\s\S]*?\*\//g, '')) === false,
  'C6 ⭐ le noyau ne génère aucun jeton et ne fabrique aucune adresse');

/* ========================================================================== */
/*  SÉRIE M — LES MUTANTS : est-ce que tout cela MORD ?                        */
/* ========================================================================== */

titre('M — on réintroduit trente-quatre défauts, et les séries doivent les attraper');

/** Remplace un fragment EXACT, en exigeant qu'il soit présent (sinon la preuve serait creuse). */
function substituer(source, avant, apres, quoi) {
  if (source.indexOf(avant) === -1) {
    throw new Error('Mutation impossible (' + quoi + ') : fragment introuvable. ' +
      'Le code a changé — mets ce garde-fou à jour, ne le supprime pas.');
  }
  if (source.split(avant).length - 1 !== 1) {
    throw new Error('Mutation ambiguë (' + quoi + ') : fragment présent plusieurs fois.');
  }
  return source.split(avant).join(apres);
}

const MUTANTS = [
  {
    nom: 'M1 — une sortie est autorisée depuis CLÔTURÉ',
    avant: "  { action: ACCES_ACTION_ROTATION,  depuis: ACCES_ETAT_FIGE,    vers: ACCES_ETAT_FIGE,    jeton: 'REMPLACE' }\n];",
    apres: "  { action: ACCES_ACTION_ROTATION,  depuis: ACCES_ETAT_FIGE,    vers: ACCES_ETAT_FIGE,    jeton: 'REMPLACE' },\n" +
           "  { action: ACCES_ACTION_REPRENDRE, depuis: ACCES_ETAT_CLOTURE, vers: ACCES_ETAT_OUVERT,  jeton: 'INCHANGE' }\n];"
  },
  {
    nom: 'M2 — la rotation est interdite en FIGÉ',
    avant: ",\n  { action: ACCES_ACTION_ROTATION,  depuis: ACCES_ETAT_FIGE,    vers: ACCES_ETAT_FIGE,    jeton: 'REMPLACE' }\n];",
    apres: "\n];"
  },
  {
    nom: 'M3 — le calcul redevient GLOBAL au lieu de par catégorie',
    avant: 'resultats.push(etatCategorieAcces(n, reglageDe[n] || null, matchsDe[n] || []));',
    apres: 'resultats.push(etatCategorieAcces(n, reglageDe[n] || null, tous));'
  },
  {
    nom: 'M4 — le gel devient IMPOSSIBLE quand le calcul ne conclut pas',
    avant: '    if (gel.decision === ACCES_GEL_CONFIRMATION_REQUISE) {\n      var vGel = validerConfirmationAcces(',
    apres: '    if (gel.decision === ACCES_GEL_CONFIRMATION_REQUISE) {\n' +
           '      return { refus: \'FIN_NON_CONFIRMEE\', etat_actuel: lu.etat, version: lu.version };\n' +
           '      var vGel = validerConfirmationAcces('
  },
  {
    nom: 'M5 — un même identifiant est accepté avec un contenu différent',
    avant: '  var connue = accesTexte(enregistrement.empreinte_demande);\n  if (connue !== empreinte) {',
    apres: '  var connue = accesTexte(enregistrement.empreinte_demande);\n  if (false && connue !== empreinte) {'
  },
  {
    nom: 'M6 — une requête EN_COURS est réappliquée',
    apres: "    return { decision: ACCES_IDEM_APPLIQUER, motif: 'requete_en_cours', empreinte: empreinte };",
    avant: "    return { decision: ACCES_IDEM_RECONCILIER, motif: 'requete_en_cours', empreinte: empreinte };"
  },
  {
    nom: 'M7 — une confirmation est acceptée pour une ancienne version',
    avant: "    return { refus: 'CONFIRMATION_AUTRE_VERSION' };",
    apres: '    return { ok: true };'
  },
  {
    nom: 'M8 — une clôture prématurée passe sans confirmation renforcée',
    avant: '    if (cloture.decision === ACCES_CLOTURE_CONFIRMATION_RENFORCEE) {',
    apres: '    if (false && cloture.decision === ACCES_CLOTURE_CONFIRMATION_RENFORCEE) {'
  },
  {
    nom: 'M9 — un score périmé est accepté (la dernière écriture gagne)',
    avant: '  if (accesTexte(d.version_lue) !== courante) {',
    apres: '  if (false && accesTexte(d.version_lue) !== courante) {'
  },
  {
    nom: 'M10 — une ligne CLÔTURÉ est créée depuis ABSENT',
    avant: '  if (!lu.existe) {\n    return { ok: true, ecrire: null, ligne_creee: false,',
    apres: '  if (false && !lu.existe) {\n    return { ok: true, ecrire: null, ligne_creee: false,'
  },

  /* ───────── Les huit mutants ajoutés par 5I : un par défaut reproduit en revue ───────── */
  {
    nom: 'M11 — la phase 1 est de nouveau IGNORÉE dès que la phase 2 existe',
    avant: '  if (phase2.length > 0 && nt1.length > 0) {',
    apres: '  if (false && phase2.length > 0 && nt1.length > 0) {'
  },
  {
    nom: 'M12 — `suite_generable` redevient vrai SANS aucun ATTEND_SUITE',
    avant: '  return auMoinsUneAttend;',
    apres: '  return r.length > 0;'
  },
  {
    nom: 'M13 — une version vide est de nouveau ramenée à zéro',
    avant: "  if (brut === '') return { ok: false, motif: 'vide' };",
    apres: "  if (brut === '') return { ok: true, valeur: 0 };"
  },
  {
    nom: "M14 — les identifiants de matchs sortent de l'empreinte de fin",
    avant: '      matchs: ids\n    }));',
    apres: '      matchs: []\n    }));'
  },
  {
    nom: "M15 — le contrôle de l'édition sort du rejeu (idempotence)",
    avant: '  if (accesTexte(enregistrement.edition_id) !== fiable.edition_id) {',
    apres: '  if (false && accesTexte(enregistrement.edition_id) !== fiable.edition_id) {'
  },
  {
    nom: "M16 — le contrôle de l'édition sort de la récupération protégée",
    avant: '  if (accesTexte(recuperation.edition_id) !== edition) {',
    apres: '  if (false && accesTexte(recuperation.edition_id) !== edition) {'
  },
  {
    nom: "M17 — l'assainissement redevient SUPERFICIEL (premier niveau, par référence)",
    avant: '      o[k] = accesCopieAssainie(v[k], temoin, liste);',
    apres: '      o[k] = v[k];'
  },
  {
    nom: 'M18 — le vainqueur sort de la version du match',
    avant: "  'place_suivant', 'vainqueur', 'essais_A', 'essais_B', 'transfo_A', 'transfo_B',",
    apres: "  'place_suivant', 'essais_A', 'essais_B', 'transfo_A', 'transfo_B',"
  },
  {
    nom: 'M19 — la validation calendaire est retirée (2026-02-31 repasse)',
    avant: '  if (!accesDateCivileExiste(an, mois, jour)) {',
    apres: '  if (false && !accesDateCivileExiste(an, mois, jour)) {'
  },

  /* ───────── Les dix mutants ajoutés par 5J : un au moins par défaut corrigé ───────── */
  {
    /* ⭐ Deux substitutions : l'ambiguïté ne revient qu'en retirant les longueurs DES DEUX
       côtés — chaînes et objets. C'est la raison d'être des mutants multi-substitutions. */
    nom: "M20 — l'encodage redevient AMBIGU (longueurs retirées des chaînes ET des objets)",
    substitutions: [
      { avant: "  if (t === 'string') return 's' + v.length + ':' + v;",
        apres: "  if (t === 'string') return 's:' + v;" },
      { avant: "      corps += 'k' + cles[j].length + ':' + cles[j] + accesCanonique(v[cles[j]]);\n    }\n    return 'o' + cles.length + ':' + corps;",
        apres: "      corps += (j ? ';' : '') + cles[j] + '=' + accesCanonique(v[cles[j]]);\n    }\n    return 'o{' + corps + '}';" }
    ]
  },
  {
    nom: 'M21 — les chaînes perdent leur longueur (forme normale cassée)',
    avant: "  if (t === 'string') return 's' + v.length + ':' + v;",
    apres: "  if (t === 'string') return 's:' + v;"
  },
  {
    nom: "M22 — `accesMatchComplet` déclare tout complet (défaut ②)",
    avant: '  return { ok: manquants.length === 0, manquants: manquants };',
    apres: '  return { ok: true, manquants: [] };'
  },
  {
    nom: "M23 — la cohérence demande/contexte est retirée (défaut ③)",
    avant: '    if (!egal) {',
    apres: '    if (false && !egal) {'
  },
  {
    nom: "M24 — l'empreinte n'est plus liée au contexte authentifié (défaut ③)",
    avant: '  if (contexte === undefined || contexte === null) return accesCanonique(demande || {});',
    apres: '  if (true) return accesCanonique(demande || {});'
  },
  {
    nom: "M25 — la borne de zone exacte est retirée (défaut ④)",
    avant: "  if (n > ACCES_ENTIER_MAX) return { ok: false, motif: 'hors_plage_exacte' };",
    apres: "  if (false && n > ACCES_ENTIER_MAX) return { ok: false, motif: 'hors_plage_exacte' };"
  },
  {
    nom: "M26 — l'incrément au plafond rend la valeur INCHANGÉE (défaut ④)",
    avant: "  if (n >= ACCES_ENTIER_MAX) return { ok: false, motif: 'plafond_atteint' };",
    apres: '  if (n >= ACCES_ENTIER_MAX) return { ok: true, valeur: n };'
  },
  {
    nom: "M27 — l'expiration redevient facultative (défaut ⑤)",
    avant: '  var expire = accesInstantValide(e.expire_le);\n  if (!expire.ok) {',
    apres: '  var expire = accesInstantValide(e.expire_le);\n  if (false && !expire.ok) {'
  },
  {
    nom: "M28 — à l'instant exact d'expiration, la confirmation passe encore (défaut ⑤)",
    avant: "  if (maintenant.cle >= expire.cle) return { refus: 'CONFIRMATION_EXPIREE' };",
    apres: "  if (maintenant.cle > expire.cle) return { refus: 'CONFIRMATION_EXPIREE' };"
  },
  {
    nom: "M29 — retour à `Date.UTC` pour le calendrier (défaut ⑥, 0001 redevient 1901)",
    avant: '  var cible = accesCivilsDepuisJours(accesJoursCivils(an, mois, jour) + n);',
    apres: '  var __d = new Date(Date.UTC(an, mois - 1, jour));\n' +
           '  __d.setUTCDate(__d.getUTCDate() + n);\n' +
           '  var cible = { an: __d.getUTCFullYear(), mois: __d.getUTCMonth() + 1,\n' +
           '                jour: __d.getUTCDate() };'
  },

  /* ───────── Les cinq mutants ajoutés par 5K ───────── */
  {
    nom: "M30 — deux éditions ABSENTES redeviennent « égales » (défaut A)",
    avant: "var ACCES_CONFIRMATION_CHAMPS = ['confirmation_id', 'edition_id', 'action', 'etat_evalue',\n  'empreinte_fin', 'consomme'];",
    apres: "var ACCES_CONFIRMATION_CHAMPS = ['confirmation_id', 'action', 'etat_evalue',\n  'empreinte_fin', 'consomme'];"
  },
  {
    nom: "M31 — `consomme` redevient permissif (tout ce qui n'est pas `true` passe, défaut B)",
    avant: "  if (nom === 'consomme') return (v === true || v === false);",
    apres: "  if (nom === 'consomme') return true;"
  },
  {
    nom: "M32 — l'édition revient de la DEMANDE au lieu du contexte (défaut C)",
    avant: "        confirmation_id: d.confirmation_id, edition_id: fiable.edition_id,\n        action: ACCES_ACTION_FIGER, etat_courant: lu.etat, version_courante: lu.version,",
    apres: "        confirmation_id: d.confirmation_id, edition_id: d.edition_id,\n        action: ACCES_ACTION_FIGER, etat_courant: lu.etat, version_courante: lu.version,"
  },
  {
    nom: "M33 — `confirmation_a_consommer` disparaît du plan (défaut D)",
    avant: '  if (confirmationUtilisee) sortie.confirmation_a_consommer = confirmationUtilisee;',
    apres: '  if (false && confirmationUtilisee) sortie.confirmation_a_consommer = confirmationUtilisee;'
  },
  {
    nom: "M34 — le rôle n'est plus vérifié (une table pourrait figer)",
    avant: '  if (fiable.role !== ACCES_ROLE_ORGANISATEUR) {',
    apres: '  if (false && fiable.role !== ACCES_ROLE_ORGANISATEUR) {'
  }
];

const bilansMutants = [];
MUTANTS.forEach((m) => {
  let mute;
  try {
    /* ⭐ Un mutant peut porter PLUSIEURS substitutions : certains défauts ne se réintroduisent
       qu'en changeant deux endroits à la fois (l'encodage ambigu, par exemple). ⛔ Chacune doit
       s'appliquer EXACTEMENT une fois, sinon `substituer` lève et le contrôle tombe. */
    const paires = m.substitutions || [{ avant: m.avant, apres: m.apres }];
    mute = SOURCE_CODE;
    paires.forEach((pr, i) => {
      mute = substituer(mute, pr.avant, pr.apres, m.nom + ' [' + (i + 1) + ']');
    });
  } catch (err) { verifier(false, m.nom + ' — ' + err.message); return; }

  let bilan;
  try { bilan = rejouerSerie5H(fabriquerBac(mute)); }
  catch (err) {
    /* Un mutant qui empêche même le chargement compte comme détecté, mais on le dit. */
    bilansMutants.push({ nom: m.nom, tombes: -1, total: BILAN_INTACT.total });
    verifier(true, m.nom + ' — détecté au chargement : ' + err.message);
    return;
  }
  bilansMutants.push({ nom: m.nom, tombes: bilan.fail, total: bilan.total });
  verifier(bilan.fail >= 1,
    m.nom + ' — ' + bilan.fail + ' contrôle(s) tombé(s) sur ' + bilan.total +
    (bilan.echecs.length ? ' — 1er : ' + bilan.echecs[0].slice(0, 90) : ''));
});

/* ⭐ LE CONTRÔLE DU CONTRÔLE : sur la source INTACTE, la série ne doit rien signaler. */
verifier(BILAN_INTACT.fail === 0,
  'M-FIN ⭐ sur le code RÉEL, les quatre séries ne signalent rien (' + BILAN_INTACT.ok + '/' +
  BILAN_INTACT.total + ')');

/* ========================================================================== */
/*  BILAN                                                                     */
/* ========================================================================== */

console.log('\n-- Détection par mutant --');
bilansMutants.forEach((b) => {
  console.log('  ' + (b.tombes === -1 ? 'chargement' : String(b.tombes) + '/' + b.total) +
    '  ' + b.nom);
});

console.log('\n==================================================');
console.log('noyau pur 5H→5K — ' + etat.ok + '/' + etat.total + ' OK, ' + etat.fail + ' ÉCHEC(S)');
console.log('séries Apps Script rejouées : ' + BILAN_INTACT.ok + '/' + BILAN_INTACT.total +
  '  (5H : ' + TESTS_5H.length + ' · 5I : ' + TESTS_5I.length + ' · 5J : ' + TESTS_5J.length +
  ' · 5K : ' + TESTS_5K.length + ')');
console.log('==================================================');
if (etat.fail) { etat.echecs.forEach((e) => console.log('  ÉCHEC ' + e)); process.exit(1); }
