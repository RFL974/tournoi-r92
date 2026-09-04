/**
 * ============================================================================
 *  GARDE-FOU FRONTEND — la « Demande d'autorisation » suit les enregistrements
 *  Chantier M1-B2 / B2-0.5
 * ============================================================================
 *
 *  ▶ Pour lancer :  node tests/frontend-autorisation-sync.test.js
 *    (aucune dépendance, aucun navigateur, aucun réseau — Node seul)
 *    Il tourne aussi dans le contrôle `verifier` du workflow Pages : un échec REFUSE
 *    la publication, comme un fichier JavaScript illisible.
 *
 *  CE QU'IL PROTÈGE.
 *
 *  ⚠️ Constaté EN RÉEL le 2026-08-25 : un nom de tournoi enregistré dans « Infos du
 *  tournoi », puis navigation vers « Demande d'autorisation » — l'ANCIEN nom y était
 *  toujours. Un rechargement du navigateur suffisait à afficher le bon.
 *  🔬 MÊME CAUSE QUE B2-0.3, une porte plus loin : la feuille FFR n'était recalculée
 *  qu'au chargement de la page, après une réinitialisation, et après son propre
 *  enregistrement. 28 autres chemins d'écriture ne la rappelaient jamais.
 *
 *  ⛔ Ce fichier ne teste PAS l'apparence : il teste l'ENCHAÎNEMENT, la DETTE DE
 *  RÉVISION et la PRÉSERVATION DES SAISIES.
 *  ⭐ Il exécute les VRAIES fonctions — `ecrireAdmin` (admin.js), tout le bloc B2-0.5
 *  de `admin-autorisation.js`, `ecransActiver` (ecrans.js) et `allerA` (assistant.js) —
 *  extraites de leur fichier et lancées dans un contexte Node avec des doublures.
 *
 *  ⚠️ Les fichiers source SONT lus : c'est ainsi qu'on en extrait les fonctions. Ce qui
 *  est proscrit est autre chose : ⛔ aucune assertion de COMPORTEMENT ne se contente de
 *  chercher une chaîne dans le code. Les deux seules assertions qui LISENT le code sont
 *  G-E et G-J, et elles l'assument : ce sont des contrôles d'INVENTAIRE (toute action
 *  est classée, toute écriture passe par le bon chemin), pas des contrôles de conduite.
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

/* -------------------------------------------------------------------------- */
/*  Extraction — ⛔ on ne réécrit rien, on PREND le code réel.                  */
/* -------------------------------------------------------------------------- */

function lire(cheminRelatif) {
  return fs.readFileSync(path.join(RACINE, cheminRelatif), 'utf8');
}

/** Localise une DÉCLARATION (jamais une occurrence en commentaire).
 *  ⭐ MÊME MÉCANIQUE que `frontend-reinitialisation.test.js`, et pour les mêmes deux raisons :
 *  une déclaration commence AU DÉBUT D'UNE LIGNE (un commentaire commence par des espaces,
 *  une étoile ou deux barres), et la liste des PARAMÈTRES ne doit jamais être imposée au code
 *  produit par son test. ⛔ Pas d'analyseur JavaScript : une ancre de ligne suffit. */
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

const extraireFonction = (f, e) => extraireBloc(f, e, '{');
const extraireObjet = (f, e) => extraireBloc(f, e, '{');
const extraireTableau = (f, e) => extraireBloc(f, e, '[');

/* -------------------------------------------------------------------------- */
/*  INVENTAIRE STATIQUE (G-E et G-J) — ⛔ un appel qu'on ne sait pas classer    */
/*  doit FAIRE ÉCHOUER le contrôle, jamais disparaître de l'inventaire.        */
/*                                                                            */
/*  ⚠️ Le défaut corrigé ici : l'inventaire ne cherchait que les actions entre  */
/*  GUILLEMETS SIMPLES. Un futur appel écrit avec des guillemets doubles, un    */
/*  gabarit, ou une variable n'aurait tout simplement pas été vu — et le test   */
/*  aurait annoncé « inventaire complet » en toute bonne foi.                  */
/* -------------------------------------------------------------------------- */

/** Retire les commentaires de BLOC et les lignes ENTIÈREMENT en commentaire.
 *  ⛔ On ne touche PAS aux `//` en milieu de ligne : « https:// » y vit, et les couper
 *  détruirait du vrai code. Un inventaire qui mutile sa source ment autant qu'un
 *  inventaire aveugle — ici on ne retire que ce qui ne peut pas être du code. */
function sansCommentaires(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n').map(function (l) { return /^\s*\/\//.test(l) ? '' : l; }).join('\n');
}

/** Tous les APPELS à `nom(` d'une source, avec leur premier argument analysé.
 *  ⭐ Trois formes de littéral STATIQUE sont reconnues — `'x'`, `"x"`, et le gabarit
 *  `` `x` `` sans interpolation. ⛔ Tout le reste est marqué `dynamique` et devra être
 *  refusé explicitement par l'appelant.
 *  ⚠️ La DÉCLARATION de la fonction (`function nom(`) n'est pas un appel : elle est écartée. */
function appelsA(source, nom) {
  const trouves = [];
  const re = new RegExp('(function\\s+)?\\b' + nom + '\\s*\\(', 'g');
  let m;
  while ((m = re.exec(source)) !== null) {
    if (m[1]) continue;
    const reste = source.slice(re.lastIndex);
    const litteral = reste.match(/^\s*'([^'\\]*)'\s*[,)]/)
                  || reste.match(/^\s*"([^"\\]*)"\s*[,)]/)
                  || reste.match(/^\s*`([^`$\\]*)`\s*[,)]/);
    if (litteral) trouves.push({ action: litteral[1], dynamique: false });
    else trouves.push({ action: reste.slice(0, 40).split(/[\n,)]/)[0].trim(), dynamique: true });
  }
  return trouves;
}

/** Une déclaration tenant sur une seule ligne (`var X = 5;`). */
function extraireLigne(cheminRelatif, entete) {
  const source = lire(cheminRelatif);
  const debut = situer(source, cheminRelatif, entete);
  const fin = source.indexOf('\n', debut);
  return source.slice(debut, fin === -1 ? source.length : fin);
}

/* -------------------------------------------------------------------------- */
/*  ⚠️ DONNÉES FICTIVES — et elles doivent le rester.                          */
/*                                                                            */
/*  ⛔ NE PAS CONFONDRE DEUX CHOSES :                                          */
/*   · le SCÉNARIO rejoué ici — enregistrement d'un nom, navigation vers la    */
/*     feuille FFR SANS recharger le navigateur — vient d'un défaut CONSTATÉ   */
/*     MANUELLEMENT le 2026-08-25 en validation réelle ;                       */
/*   · les VALEURS ci-dessous sont une mise en scène. ⛔ Elles ne sont PAS ce   */
/*     qui a été vu à l'écran ce jour-là, et ce fichier ne le prétend pas.     */
/*     La preuve terrain vit dans le rapport de session, pas ici.              */
/* -------------------------------------------------------------------------- */

const NOM_ANCIEN = 'TOURNOI TEST ANCIEN';
const NOM_NOUVEAU = 'TOURNOI TEST NOUVEAU';
const NOM_TROISIEME = 'TOURNOI TEST TROISIEME';
const TEMOIN_SAISIE = 'TEMOIN SAISIE NON ENREGISTREE';
const NIVEAU_ENREGISTRE = 'DEPARTEMENTAL';

/* -------------------------------------------------------------------------- */
/*  Le banc d'essai : un faux navigateur, un faux serveur, le VRAI code.       */
/* -------------------------------------------------------------------------- */

/**
 * @param {Object} opt
 *   - mode               : 'classique' (page longue) | 'ecrans' | 'assistant'
 *   - feuilleEchoue      : `getDossierAutorisation` lève (coupure réseau)
 *   - configBloquee      : `lireConfigAdmin` attend une libération manuelle
 *   - avantReponseFFR    : fonction(n) appelée AVANT la n-ième réponse du serveur FFR
 *   - avantReponseConfig : fonction(n) appelée AVANT la n-ième réponse de `lireConfigAdmin`
 */
function banc(opt) {
  opt = opt || {};
  const trace = [];
  const elements = {};
  // Ce que « le classeur » contient : c'est CETTE valeur que la feuille doit finir par montrer.
  const serveur = { nom: NOM_ANCIEN, niveau: NIVEAU_ENREGISTRE };
  let appelsFFR = 0;
  let appelsConfig = 0;
  const messages = [];
  let libererConfig = null;
  const configBloquee = opt.configBloquee
    ? new Promise(function (r) { libererConfig = r; }) : null;

  function creer(id, extra) {
    elements[id] = Object.assign({ id: id, innerHTML: '', hidden: false, style: {},
      textContent: '', disabled: false }, extra || {});
    return elements[id];
  }

  creer('bloc-autorisation');
  creer('autorisation-feuille', { innerHTML: 'A.2 Tournoi : ' + NOM_ANCIEN });
  // ⭐ Le formulaire org_* est modélisé par sa VALEUR : le reconstruire l'écrase, exactement
  //   comme `zoneSaisie.innerHTML = …` détruit les champs d'un vrai formulaire.
  creer('form-autorisation', { valeur: 'org_niveau=' + NIVEAU_ENREGISTRE,
    elements: [{ name: 'org_niveau_tournoi', value: NIVEAU_ENREGISTRE }] });
  creer('autorisation-message');
  creer('bouton-enregistrer-autorisation');
  const zoneSaisie = {
    id: 'autorisation-saisie', _html: 'SAISIE ' + NOM_ANCIEN, style: {},
    get innerHTML() { return this._html; },
    set innerHTML(v) {
      this._html = v;
      trace.push({ type: 'saisie-reconstruite' });
      elements['form-autorisation'].valeur = 'org_niveau=' + serveur.niveau;
    }
  };
  elements['autorisation-saisie'] = zoneSaisie;

  // Le MODE d'affichage se joue par la seule présence de ces deux éléments — c'est
  // exactement ce que regarde `autorisationEstAffichee`.
  if (opt.mode === 'ecrans') creer('ecran-autorisation', { hidden: true });
  if (opt.mode === 'assistant') creer('asst-track');

  const contexte = {
    console,
    document: {
      getElementById: function (id) { return elements[id] || null; },
      querySelectorAll: function () { return []; },
      querySelector: function () { return null; }
    },
    localStorage: { setItem: function () {}, getItem: function () { return null; } },
    window: { scrollTo: function () {} },
    configCourante: { global: { tournoi_nom: NOM_ANCIEN }, categories: [] },

    /* ---- doublures d'affichage : on éprouve l'ENCHAÎNEMENT, pas le HTML ---- */
    rendreFeuilleAutorisation: function (dossier) {
      return 'A.2 Tournoi : ' + ((dossier && dossier.nom) || '');
    },
    rendreSaisieAutorisation: function () { return 'SAISIE ' + serveur.nom; },
    questionsDejaRepondues: function () { return {}; },
    /* L'outil du verrou d'étapes (assistant.js), doublé : il sérialise le formulaire. */
    assistantSerialiser: function (form) { return String((form && form.valeur) || ''); },

    /* ---- le faux serveur ----
       ⭐ Chaque réponse porte l'état du classeur AU MOMENT DE LA REQUÊTE, pas au moment où
       elle revient. C'est le comportement d'un vrai serveur — et c'est indispensable ici :
       sans cela, une réponse « dépassée » reviendrait magiquement à jour, et les tests
       G-N / G-O ne pourraient rien prouver. */
    apiPostProtege: async function (action) {
      trace.push({ type: 'appel', action: action });
      if (action === 'getDossierAutorisation') {
        appelsFFR++;
        const instantane = serveur.nom;
        if (opt.avantReponseFFR) await opt.avantReponseFFR(appelsFFR);
        if (opt.feuilleEchoue) throw new Error('Échec réseau simulé (FFR)');
        return { dossier: { nom: instantane } };
      }
      return { ok: true };
    },
    lireConfigAdmin: async function () {
      appelsConfig++;
      trace.push({ type: 'lireConfigAdmin' });
      const instantane = serveur.nom;
      if (opt.avantReponseConfig) await opt.avantReponseConfig(appelsConfig);
      if (configBloquee) await configBloquee;
      return { global: { tournoi_nom: instantane }, categories: [] };
    },

    /* ---- doublures nécessaires au CHEMIN PROPRE (onEnregistrerAutorisation) ---- */
    avecBoutonOccupe: async function (bouton, message, travail) { return travail(); },
    afficherMessage: function (el, texte, ton) { messages.push({ texte: texte, ton: ton }); },

    /* ---- doublures des dépendances de navigation ---- */
    ecransCalculerVerrous: function () { return {}; },
    ecransEtats: function () { return []; },
    ecransDireVerrou: function () {},
    ecransMajPastilles: function () {},
    ecransSecouerOnglet: function () {},
    calculerEtatsEtapes: function () { return []; },
    assistantRaisonsEtape: function () { return []; },
    assistantSecouerVerrou: function () {},
    assistantMajVerrou: function () {},
    ajusterHauteur: function () {},

    /* ---- observation ---- */
    __serveur: serveur,
    __trace: trace,
    __elements: elements,
    __appelsFFR: function () { return appelsFFR; },
    __messages: messages,
    __libererConfig: function () { if (libererConfig) libererConfig(); }
  };
  contexte.globalThis = contexte;
  vm.createContext(contexte);

  // ⭐ TOUT EN UN SEUL SCRIPT : `const ECRANS_DEF` / `const ASSISTANT_ETAPES` sont des
  //   `const`, qui ne deviennent PAS des propriétés du contexte — les fonctions qui les
  //   lisent doivent donc être compilées dans le MÊME script pour les voir. Les `var` et
  //   les `function`, eux, remontent bien sur le contexte : c'est ainsi qu'on les rappelle.
  const AUTO = 'frontend/js/admin-autorisation.js';
  const source = [
    'var assistantIndex = 0;',
    // ⭐ AJOUTÉ PAR R-098/B5 (2026-08-26) : `allerA` distingue désormais la carte AFFICHÉE
    //   (`assistantIndex`) de la PROGRESSION ACQUISE (`assistantAtteint`). Sans cette ligne,
    //   ce garde-fou-ci plante au lieu d'éprouver ce qu'il garde.
    //   ⚠️ Sa valeur volontairement HAUTE neutralise le verrou : ⛔ ce fichier n'éprouve PAS
    //   le verrou (c'est l'objet de `frontend-assistant-verrou.test.js`), il éprouve le
    //   CROCHET de relecture de la feuille FFR, et il doit pouvoir atteindre sa carte.
    'var assistantAtteint = 99;',
    extraireObjet(AUTO, 'var ACTIONS_AUTORISATION_CROCHET = {'),
    extraireObjet(AUTO, 'var ACTIONS_AUTORISATION_CHEMIN_PROPRE = {'),
    extraireObjet(AUTO, 'var ACTIONS_AUTORISATION_SANS_IMPACT = {'),
    extraireObjet(AUTO, 'var CHAMPS_SANS_IMPACT_AUTORISATION = {'),
    extraireLigne(AUTO, 'var autorisationRevision = 0;'),
    extraireLigne(AUTO, 'var autorisationRevisionLue = 0;'),
    extraireLigne(AUTO, 'var autorisationRelectureEnCours = null;'),
    extraireLigne(AUTO, 'var autorisationSaisiePhoto = null;'),
    extraireLigne(AUTO, 'var AUTORISATION_TOURS_MAX = 5;'),
    extraireFonction(AUTO, 'function invaliderFeuilleAutorisationAffichee()'),
    extraireFonction(AUTO, 'function autorisationPhotographierSaisie()'),
    extraireFonction(AUTO, 'function autorisationSaisieModifiee()'),
    extraireFonction(AUTO, 'function autorisationEstAffichee()'),
    extraireFonction(AUTO, 'function signalerAutorisationObsolete()'),
    extraireFonction(AUTO, 'function ecritureImpacteAutorisation(action, data, reponse)'),
    extraireFonction(AUTO, 'async function majAutorisation(opt)'),
    extraireFonction(AUTO, 'async function majAutorisationSiObsolete()'),
    extraireFonction(AUTO, 'async function onEnregistrerAutorisation()'),
    extraireFonction('frontend/js/admin.js', 'async function ecrireAdmin(action, data)'),
    extraireTableau('frontend/js/ecrans.js', 'const ECRANS_DEF = ['),
    extraireFonction('frontend/js/ecrans.js', 'function ecransActiver(id, opt)'),
    extraireTableau('frontend/js/assistant.js', 'const ASSISTANT_ETAPES = ['),
    extraireFonction('frontend/js/assistant.js', 'function allerA(i, direction)'),
    // Passerelles de lecture : les `const` et l'index de l'assistant ne remontent pas seuls.
    'function __indexAutorisation() { return ASSISTANT_ETAPES.findIndex(function (e) {' +
      ' return e.id === "autorisation"; }); }',
    'function __assistantIndex() { return assistantIndex; }',
    // ⚠️ Passerelle indispensable au harnais : pour ATTENDRE une relecture de fond, il faut
    //    pouvoir REJOINDRE la chaîne en cours sans en DÉCLENCHER une nouvelle. Rappeler
    //    `majAutorisationSiObsolete()` en relancerait une quand la dette persiste (panne),
    //    et les compteurs d'appels ne voudraient plus rien dire.
    'function __enCours() { return autorisationRelectureEnCours; }'
  ].join('\n\n');
  vm.runInContext(source, contexte, { filename: 'B2-0.5-sous-test.js' });

  return contexte;
}

const lancer = (ctx, code) => vm.runInContext(code, ctx);
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
/** Laisse les tâches de fond s'exécuter, puis REJOINT la chaîne de relecture en cours.
 *  ⛔ Elle ne DÉCLENCHE jamais de relecture : sinon, sur une panne (où la dette persiste
 *  volontairement), le harnais provoquerait lui-même l'essai suivant et fausserait tous les
 *  comptages d'appels. On rejoint, on n'ordonne pas. */
async function laisserTourner(ctx) {
  for (let tentative = 0; tentative < 6; tentative++) {
    for (let k = 0; k < 4; k++) await new Promise((r) => setImmediate(r));
    const enCours = lancer(ctx, '__enCours()');
    if (!enCours) break;
    try { await enCours; } catch (e) { /* la chaîne absorbe déjà ses pannes */ }
  }
}

const feuille = (ctx) => ctx.__elements['autorisation-feuille'].innerHTML;
const saisie = (ctx) => ctx.__elements['form-autorisation'].valeur;

/* -------------------------------------------------------------------------- */
/*  Assertions                                                                */
/* -------------------------------------------------------------------------- */

const etat = { total: 0, ok: 0, fail: 0 };

function verifier(condition, libelle) {
  etat.total++;
  if (condition) { etat.ok++; console.log('  OK    ' + libelle); }
  else { etat.fail++; console.log('  ÉCHEC ' + libelle); }
}

(async () => {
  console.log('===== B2-0.5 — la Demande d\'autorisation suit les enregistrements =====');

  /* ==== G-A — LE DÉFAUT RÉEL, à la lettre ============================== */
  {
    const ctx = banc({ mode: 'classique' });
    await lancer(ctx, 'majAutorisation()');            // rendu initial (chargement de page)
    verifier(feuille(ctx).indexOf(NOM_ANCIEN) !== -1,
      'G-A ① au départ, la feuille montre bien l\'ancien tournoi');

    ctx.__serveur.nom = NOM_NOUVEAU;                   // le serveur enregistre le nouveau nom
    await lancer(ctx, 'ecrireAdmin("enregistrerInfosTournoi", { tournoi_nom: "' + NOM_NOUVEAU + '" })');
    await laisserTourner(ctx);                         // ⛔ AUCUN rechargement du navigateur

    verifier(feuille(ctx).indexOf(NOM_NOUVEAU) !== -1,
      'G-A ② ⭐⭐ BLOQUANT : sans recharger la page, la feuille montre le NOUVEAU nom');
    verifier(feuille(ctx).indexOf(NOM_ANCIEN) === -1,
      'G-A ③ ⭐ et plus aucune trace de l\'ancien');
    verifier(ctx.autorisationRevision === ctx.autorisationRevisionLue,
      'G-A ④ la dette de révision est soldée (' + ctx.autorisationRevision + '/' +
      ctx.autorisationRevisionLue + ')');
  }

  /* ==== G-B — une écriture SANS RAPPORT ne coûte rien ================== */
  {
    const ctx = banc({ mode: 'classique' });
    await lancer(ctx, 'majAutorisation()');
    const avant = ctx.__appelsFFR();
    await lancer(ctx, 'ecrireAdmin("enregistrerSurPlace", { buvette_disponible: "oui" })');
    await laisserTourner(ctx);
    verifier(ctx.__appelsFFR() === avant,
      'G-B ① ⛔ enregistrerSurPlace ⇒ AUCUN recalcul de la feuille (constaté ' +
      (ctx.__appelsFFR() - avant) + ')');
    verifier(ctx.autorisationRevision === 0, 'G-B ② aucune révision consommée');

    // ⭐ Même action IMPACTANTE, mais charge PARTIELLE sans champ lu par la feuille.
    await lancer(ctx, 'ecrireAdmin("enregistrerInvitation", { parking_texte: "Parking test" })');
    await laisserTourner(ctx);
    verifier(ctx.__appelsFFR() === avant,
      'G-B ③ ⭐ « Parking » seul ⇒ aucun recalcul, alors que l\'action est impactante');
    await lancer(ctx, 'ecrireAdmin("enregistrerInvitation", { tarif_engagement_oui: "oui" })');
    await laisserTourner(ctx);
    verifier(ctx.__appelsFFR() > avant,
      'G-B ④ ⭐ mais le TARIF D\'ENGAGEMENT, lui, déclenche bien un recalcul');
    // ⛔ Le sens sûr de l'erreur : un champ INCONNU doit provoquer un recalcul.
    const avant2 = ctx.__appelsFFR();
    await lancer(ctx, 'ecrireAdmin("enregistrerInvitation", { champ_invente_demain: "x" })');
    await laisserTourner(ctx);
    verifier(ctx.__appelsFFR() > avant2,
      'G-B ⑤ ⭐ un champ INCONNU provoque un recalcul (l\'oubli conserve la fraîcheur)');

    // ⭐⭐ LA CHARGE MIXTE — le cas qui distingue « TOUS sans impact » de « AU MOINS UN sans
    //   impact ». Un parking anodin accompagné du tarif d'engagement DOIT recalculer : sinon
    //   un seul champ inoffensif suffirait à masquer tous les autres.
    const avant3 = ctx.__appelsFFR();
    await lancer(ctx, 'ecrireAdmin("enregistrerInvitation", ' +
      '{ parking_texte: "Parking test", tarif_engagement_montant: "12" })');
    await laisserTourner(ctx);
    verifier(ctx.__appelsFFR() > avant3,
      'G-B ⑥ ⭐⭐ charge MIXTE (parking + tarif) ⇒ recalcul : un champ anodin ne masque pas les autres');
  }

  /* ==== G-C — MODE ÉCRANS : invalidée, puis relue à l'ouverture ======== */
  {
    const ctx = banc({ mode: 'ecrans' });
    await lancer(ctx, 'majAutorisation()');
    const avant = ctx.__appelsFFR();
    ctx.__serveur.nom = NOM_NOUVEAU;
    await lancer(ctx, 'ecrireAdmin("enregistrerHoraires", { heure_debut: "09:00" })');
    for (let k = 0; k < 6; k++) await new Promise((r) => setImmediate(r));

    verifier(ctx.__appelsFFR() === avant,
      'G-C ① ⛔ écran fermé : rien n\'est recalculé tant qu\'on ne regarde pas');
    verifier(feuille(ctx).indexOf('rechargement') !== -1,
      'G-C ② ⭐ mais la feuille est EFFACÉE tout de suite — plus rien de faux à lire');
    verifier(feuille(ctx).indexOf(NOM_ANCIEN) === -1,
      'G-C ③ l\'ancien nom a disparu sans attendre le réseau');

    await lancer(ctx, 'ecransActiver("autorisation")');   // ⭐ la VRAIE navigation ordinateur
    await laisserTourner(ctx);
    verifier(ctx.__appelsFFR() === avant + 1,
      'G-C ④ ⭐⭐ à l\'ouverture de l\'onglet : relue EXACTEMENT UNE FOIS (constaté ' +
      (ctx.__appelsFFR() - avant) + ')');
    verifier(feuille(ctx).indexOf(NOM_NOUVEAU) !== -1,
      'G-C ⑤ et elle montre le nouveau nom');
  }

  /* ==== G-L — MODE ASSISTANT (mobile) : le parcours jumeau ============= */
  {
    const ctx = banc({ mode: 'assistant' });
    await lancer(ctx, 'majAutorisation()');
    const avant = ctx.__appelsFFR();
    ctx.__serveur.nom = NOM_NOUVEAU;
    await lancer(ctx, 'ecrireAdmin("modifierStatutClubInvite", { club_nom: "X", statut: "Accepté" })');
    for (let k = 0; k < 6; k++) await new Promise((r) => setImmediate(r));

    verifier(ctx.__appelsFFR() === avant,
      'G-L ① ⛔ carte non ouverte : rien n\'est recalculé');
    verifier(feuille(ctx).indexOf(NOM_ANCIEN) === -1,
      'G-L ② la feuille est effacée tout de suite, comme sur ordinateur');

    const i = lancer(ctx, '__indexAutorisation()');
    verifier(i >= 0, 'G-L ③ l\'étape « autorisation » existe bien dans le parcours mobile');
    lancer(ctx, 'allerA(' + i + ', 1)');                  // ⭐ la VRAIE navigation mobile
    await laisserTourner(ctx);
    verifier(lancer(ctx, '__assistantIndex()') === i,
      'G-L ④ on est bien arrivé sur l\'étape Autorisation');
    verifier(ctx.__appelsFFR() === avant + 1,
      'G-L ⑤ ⭐⭐ BLOQUANT : le parcours MOBILE relit lui aussi, exactement une fois (constaté ' +
      (ctx.__appelsFFR() - avant) + ')');
    verifier(feuille(ctx).indexOf(NOM_NOUVEAU) !== -1,
      'G-L ⑥ et la feuille mobile montre le nouveau nom');
  }

  /* ==== G-D — plusieurs écritures, UNE seule relecture ================= */
  {
    const ctx = banc({ mode: 'ecrans' });
    await lancer(ctx, 'majAutorisation()');
    const avant = ctx.__appelsFFR();
    await lancer(ctx, 'ecrireAdmin("ajouterEquipe", { nom_equipe: "TEST-1" })');
    await lancer(ctx, 'ecrireAdmin("supprimerCategorie", { categorie: "U8" })');
    await lancer(ctx, 'ecrireAdmin("enregistrerPlanTerrains", { terrains_physiques: "[]" })');
    for (let k = 0; k < 6; k++) await new Promise((r) => setImmediate(r));
    verifier(ctx.autorisationRevision === 3, 'G-D ① les trois écritures sont comptées');
    await lancer(ctx, 'ecransActiver("autorisation")');
    await laisserTourner(ctx);
    verifier(ctx.__appelsFFR() === avant + 1,
      'G-D ② ⭐ trois écritures ⇒ UNE SEULE route vers le serveur (constaté ' +
      (ctx.__appelsFFR() - avant) + ')');
    verifier(ctx.autorisationRevisionLue === 3, 'G-D ③ et la dette est soldée d\'un coup');
  }

  /* ==== G-F — les chemins propres ne déclenchent pas de double relecture */
  {
    const ctx = banc({ mode: 'classique' });
    await lancer(ctx, 'majAutorisation()');
    const avant = ctx.__appelsFFR();
    await lancer(ctx, 'ecrireAdmin("enregistrerDossierAutorisation", { org_niveau_tournoi: "X" })');
    await lancer(ctx, 'ecrireAdmin("reinitialiserTournoi", {})');
    await laisserTourner(ctx);
    verifier(ctx.autorisationRevision === 0,
      'G-F ① ⛔ les actions à CHEMIN PROPRE ne consomment aucune révision');
    verifier(ctx.__appelsFFR() === avant,
      'G-F ② ⭐ et ne provoquent aucun recalcul en doublon (constaté ' +
      (ctx.__appelsFFR() - avant) + ')');
  }

  /* ==== G-G — PANNE : la dette est conservée, la tentative suivante est RÉELLE */
  {
    const ctx = banc({ mode: 'ecrans', feuilleEchoue: true });
    await lancer(ctx, 'majAutorisation()');          // rendu initial (réussi ? non : il échoue)
    ctx.__elements['form-autorisation'].valeur = 'org_niveau=' + TEMOIN_SAISIE;
    const avant = ctx.__appelsFFR();

    ctx.__serveur.nom = NOM_NOUVEAU;
    await lancer(ctx, 'ecrireAdmin("enregistrerCategorie", { categorie: "U8" })');
    await lancer(ctx, 'ecransActiver("autorisation")');
    await laisserTourner(ctx);

    verifier(ctx.__appelsFFR() === avant + 1, 'G-G ① une tentative a bien eu lieu');
    verifier(feuille(ctx).indexOf('indisponible') !== -1,
      'G-G ② la feuille annonce clairement l\'indisponibilité');
    verifier(ctx.autorisationRevisionLue !== ctx.autorisationRevision,
      'G-G ③ ⭐⭐ BLOQUANT : la dette est CONSERVÉE (' + ctx.autorisationRevisionLue + '/' +
      ctx.autorisationRevision + ') — une panne n\'est pas un succès');
    verifier(saisie(ctx).indexOf(TEMOIN_SAISIE) !== -1,
      'G-G ④ ⭐ le formulaire org_* n\'a PAS été réécrit : sans dossier fiable, on ne repeint pas');

    // ⭐⭐ ET MÊME SUR UN FORMULAIRE PROPRE : une panne ne doit RIEN repeindre. Sans dossier,
    //   on ne sait pas honnêtement quelles questions masquer — repeindre serait deviner.
    //   ⚠️ Cette assertion est distincte de la précédente : avec un formulaire SALE, la
    //   préservation jouerait de toute façon, et le cas « panne » ne serait pas éprouvé.
    const ctxP = banc({ mode: 'ecrans', feuilleEchoue: true });
    await lancer(ctxP, 'majAutorisation()');
    const recAvant = ctxP.__trace.filter(function (e) { return e.type === 'saisie-reconstruite'; }).length;
    await lancer(ctxP, 'ecrireAdmin("ajouterEquipe", { nom_equipe: "TEST-2" })');
    await lancer(ctxP, 'ecransActiver("autorisation")');
    await laisserTourner(ctxP);
    const recApres = ctxP.__trace.filter(function (e) { return e.type === 'saisie-reconstruite'; }).length;
    verifier(recApres === recAvant,
      'G-G ④ bis ⭐⭐ BLOQUANT : panne + formulaire PROPRE ⇒ le formulaire n\'est pas repeint ' +
      '(reconstructions constatées : ' + (recApres - recAvant) + ')');

    // La panne se termine : une NOUVELLE ouverture doit retenter POUR DE VRAI.
    ctx.__elements['ecran-autorisation'].hidden = true;
    delete require.cache;                            // (sans effet ici, lisibilité)
    const ctx2 = ctx;
    ctx2.__reparer = true;
    // On répare le faux serveur en remplaçant la doublure par une version qui répond.
    ctx2.apiPostProtege = async function (action) {
      ctx2.__trace.push({ type: 'appel', action: action });
      if (action === 'getDossierAutorisation') { ctx2.__compteurRepare = (ctx2.__compteurRepare || 0) + 1;
        return { dossier: { nom: ctx2.__serveur.nom } }; }
      return { ok: true };
    };
    await lancer(ctx2, 'ecransActiver("autorisation")');
    await laisserTourner(ctx2);
    verifier(ctx2.__compteurRepare === 1,
      'G-G ⑤ ⭐⭐ la prochaine ouverture RETENTE réellement (constaté ' +
      (ctx2.__compteurRepare || 0) + ')');
    verifier(feuille(ctx2).indexOf(NOM_NOUVEAU) !== -1,
      'G-G ⑥ et la feuille finit par montrer le bon nom');
    verifier(ctx2.autorisationRevisionLue === ctx2.autorisationRevision,
      'G-G ⑦ la dette est enfin soldée');
  }

  /* ==== G-H — écriture PENDANT la relecture : rattrapage AUTOMATIQUE === */
  {
    let ctx = null;
    // ⚠️ `armee` n'est pas un détail : le rendu initial de la page est LUI AUSSI une lecture
    //    FFR. Sans ce drapeau, la seconde écriture tomberait pendant le rendu initial et
    //    non pendant la relecture — le scénario testé ne serait pas celui qu'on croit.
    const declenchee = { fait: false, armee: false };
    ctx = banc({
      mode: 'ecrans',
      avantReponseFFR: async function () {
        if (!declenchee.armee || declenchee.fait) return;
        declenchee.fait = true;
        ctx.__serveur.nom = NOM_TROISIEME;
        // ⛔ Volontairement NON attendue : c'est le cas réel (un autre clic).
        lancer(ctx, 'ecrireAdmin("recalculerHoraires", {})');
        for (let k = 0; k < 4; k++) await new Promise((r) => setImmediate(r));
      }
    });
    await lancer(ctx, 'majAutorisation()');
    const avant = ctx.__appelsFFR();
    declenchee.armee = true;                 // ⭐ à partir d'ici seulement
    ctx.__serveur.nom = NOM_NOUVEAU;
    await lancer(ctx, 'ecrireAdmin("genererPoulesEtPlanning", {})');
    await lancer(ctx, 'ecransActiver("autorisation")');
    await laisserTourner(ctx);

    verifier(declenchee.fait, 'G-H ① la seconde écriture est bien tombée PENDANT la lecture');
    verifier(ctx.__appelsFFR() === avant + 2,
      'G-H ② ⭐⭐ BLOQUANT : un SECOND tour a été fait automatiquement (lectures constatées : ' +
      (ctx.__appelsFFR() - avant) + ')');
    verifier(ctx.autorisationRevisionLue === ctx.autorisationRevision,
      'G-H ③ ⭐⭐ à la fin, revisionLue == revision (' + ctx.autorisationRevisionLue + '/' +
      ctx.autorisationRevision + ') — aucune révision comptée lue par erreur');
    verifier(feuille(ctx).indexOf(NOM_TROISIEME) !== -1,
      'G-H ④ ⭐ et la feuille montre la DERNIÈRE valeur, pas celle du premier tour');
  }

  /* ==== G-I — une saisie org_* non enregistrée n'est JAMAIS détruite === */
  {
    const ctx = banc({ mode: 'classique' });
    await lancer(ctx, 'majAutorisation()');           // rendu propre : photo prise
    verifier(saisie(ctx).indexOf(NIVEAU_ENREGISTRE) !== -1,
      'G-I ① au départ, le formulaire porte la valeur enregistrée');

    ctx.__elements['form-autorisation'].valeur = 'org_niveau=' + TEMOIN_SAISIE; // l'organisateur tape
    ctx.__serveur.nom = NOM_NOUVEAU;
    await lancer(ctx, 'ecrireAdmin("enregistrerContactsSecurite", { referent_nom: "TEST" })');
    await laisserTourner(ctx);

    verifier(feuille(ctx).indexOf(NOM_NOUVEAU) !== -1,
      'G-I ② la feuille s\'est bien synchronisée');
    verifier(saisie(ctx).indexOf(TEMOIN_SAISIE) !== -1,
      'G-I ③ ⭐⭐ BLOQUANT : la saisie org_* EN COURS a survécu à la synchronisation');

    // ⭐ Et le contraire doit rester vrai : formulaire PROPRE ⇒ on le reconstruit.
    const ctx2 = banc({ mode: 'classique' });
    await lancer(ctx2, 'majAutorisation()');
    ctx2.__serveur.niveau = 'REGIONAL';
    ctx2.__serveur.nom = NOM_NOUVEAU;
    await lancer(ctx2, 'ecrireAdmin("enregistrerCategorie", { categorie: "U10" })');
    await laisserTourner(ctx2);
    verifier(saisie(ctx2).indexOf('REGIONAL') !== -1,
      'G-I ④ ⭐ formulaire PROPRE : il est bien reconstruit avec les données fraîches');
  }

  /* ==== G-2 — ecrireAdmin NE DÉPEND PAS de la latence FFR ============== */
  {
    const ctx = banc({ mode: 'classique', configBloquee: true });
    await lancer(ctx, 'majAutorisation()');
    const avant = ctx.__appelsFFR();
    ctx.__serveur.nom = NOM_NOUVEAU;          // le classeur, lui, a bien été mis à jour
    const ecriture = lancer(ctx,
      'ecrireAdmin("enregistrerInfosTournoi", { tournoi_nom: "' + NOM_NOUVEAU + '" })');
    const gagnant = await Promise.race([
      ecriture.then(function () { return 'ecriture-rendue'; }),
      attendre(400).then(function () { return 'bloquee'; })
    ]);
    verifier(gagnant === 'ecriture-rendue',
      'G-2 ① ⭐⭐ BLOQUANT : l\'écriture rend son résultat SANS attendre la relecture FFR');
    verifier(ctx.__appelsFFR() === avant,
      'G-2 ② la relecture est bien encore en attente à cet instant');
    verifier(feuille(ctx).indexOf('rechargement') !== -1,
      'G-2 ③ ⭐ et la feuille est DÉJÀ invalidée — plus rien de faux à lire pendant l\'attente');
    verifier(ctx.autorisationRevision === 1 && ctx.autorisationRevisionLue === 0,
      'G-2 ④ la dette est bien enregistrée');
    ctx.__libererConfig();                    // on relâche : la relecture se termine normalement
    await laisserTourner(ctx);
    verifier(feuille(ctx).indexOf(NOM_NOUVEAU) !== -1,
      'G-2 ⑤ une fois le réseau revenu, la feuille se met à jour toute seule');
  }

  /* ==== G-K — un APERÇU n'écrit rien : aucune invalidation ============= */
  {
    const ctx = banc({ mode: 'classique' });
    await lancer(ctx, 'majAutorisation()');
    const avant = ctx.__appelsFFR();
    // Le serveur répond `apercu:true` : il DÉCLARE n'avoir rien écrit (Code.gs:5508).
    ctx.apiPostProtege = async function (action) {
      if (action === 'getDossierAutorisation') { ctx.__n = (ctx.__n || 0) + 1;
        return { dossier: { nom: ctx.__serveur.nom } }; }
      if (action === 'supprimerClubInvite') return { ok: true, apercu: true };
      return { ok: true };
    };
    await lancer(ctx, 'ecrireAdmin("supprimerClubInvite", { club_nom: "X", apercu: "oui" })');
    await laisserTourner(ctx);
    verifier(ctx.autorisationRevision === 0,
      'G-K ① ⭐ l\'APERÇU de suppression ne rend pas la feuille obsolète');
    verifier(!ctx.__n, 'G-K ② et ne provoque aucun recalcul');
    verifier(feuille(ctx).indexOf(NOM_ANCIEN) !== -1,
      'G-K ③ la feuille affichée n\'est même pas effacée');

    // ⛔ Mais la suppression RÉELLE, elle, doit compter.
    ctx.apiPostProtege = async function (action) {
      if (action === 'getDossierAutorisation') { ctx.__n = (ctx.__n || 0) + 1;
        return { dossier: { nom: ctx.__serveur.nom } }; }
      return { ok: true, equipes_supprimees: [] };
    };
    await lancer(ctx, 'ecrireAdmin("supprimerClubInvite", { club_nom: "X" })');
    await laisserTourner(ctx);
    verifier(ctx.autorisationRevision === 1,
      'G-K ④ ⭐ la suppression RÉELLE, elle, rend bien la feuille obsolète');

    // Idem pour appliquerValeursFFR quand le serveur répond « ambigu, rien écrit ».
    const ctx3 = banc({ mode: 'classique' });
    await lancer(ctx3, 'majAutorisation()');
    ctx3.apiPostProtege = async function (action) {
      if (action === 'getDossierAutorisation') { ctx3.__n = (ctx3.__n || 0) + 1;
        return { dossier: { nom: ctx3.__serveur.nom } }; }
      return { ok: true, applique: false, ambigu: true };
    };
    await lancer(ctx3, 'ecrireAdmin("appliquerValeursFFR", { categorie: "U8" })');
    await laisserTourner(ctx3);
    verifier(ctx3.autorisationRevision === 0,
      'G-K ⑤ ⭐ « formes ambiguës, rien écrit » ⇒ aucune obsolescence');

    // ⛔ ET LE FILTRE DOIT ÊTRE SCOPÉ PAR ACTION : un futur point d'entrée qui emploierait
    //    `apercu` ou `applique` pour tout autre chose ne doit PAS pouvoir contourner le
    //    marquage. Ici `genererApresMidi` renvoie les deux champs — et écrit pour de bon.
    const ctx4 = banc({ mode: 'classique' });
    await lancer(ctx4, 'majAutorisation()');
    ctx4.apiPostProtege = async function (action) {
      if (action === 'getDossierAutorisation') return { dossier: { nom: ctx4.__serveur.nom } };
      return { ok: true, applique: false, apercu: true };
    };
    await lancer(ctx4, 'ecrireAdmin("genererApresMidi", {})');
    await laisserTourner(ctx4);
    verifier(ctx4.autorisationRevision === 1,
      'G-K ⑥ ⭐⭐ les filtres sont SCOPÉS : une AUTRE action portant apercu/applique ne ' +
      'contourne rien');
  }

  /* ==== G-M — CHEMIN PROPRE : une panne ne solde JAMAIS la dette ======= */
  {
    // ⚠️ `enregistrerDossierAutorisation` est en catégorie B : le crochet commun l'ignore
    //    volontairement. Elle doit donc porter SA dette elle-même — et honnêtement.
    const ctx = banc({ mode: 'ecrans', feuilleEchoue: true });
    ctx.__serveur.nom = NOM_NOUVEAU;
    await lancer(ctx, 'onEnregistrerAutorisation()');
    await laisserTourner(ctx);

    verifier(ctx.autorisationRevision === 1,
      'G-M ① l\'écriture réussie a bien noté que la feuille est devenue fausse');
    verifier(ctx.autorisationRevisionLue !== ctx.autorisationRevision,
      'G-M ② ⭐⭐ BLOQUANT : relecture FFR en échec ⇒ la dette est CONSERVÉE (' +
      ctx.autorisationRevisionLue + '/' + ctx.autorisationRevision + ')');
    verifier(feuille(ctx).indexOf(NOM_ANCIEN) === -1,
      'G-M ③ ⭐ et la feuille ne montre plus l\'ancienne valeur');
    verifier(ctx.__messages.some(function (m) { return m.texte.indexOf('enregistrés') !== -1; }),
      'G-M ④ ⛔ l\'ENREGISTREMENT MÉTIER reste annoncé comme réussi — il l\'est');
    verifier(ctx.__messages.some(function (m) { return m.texte.indexOf('réseau') !== -1; }),
      'G-M ⑤ ⭐ mais l\'organisateur est prévenu que la feuille n\'a pas pu être relue');

    // Le réseau revient : la prochaine ouverture doit retenter POUR DE VRAI.
    let relectures = 0;
    ctx.apiPostProtege = async function (action) {
      if (action === 'getDossierAutorisation') { relectures++; return { dossier: { nom: ctx.__serveur.nom } }; }
      return { ok: true };
    };
    await lancer(ctx, 'ecransActiver("autorisation")');
    await laisserTourner(ctx);
    verifier(relectures === 1,
      'G-M ⑥ ⭐⭐ la prochaine ouverture RETENTE réellement (constaté ' + relectures + ')');
    verifier(feuille(ctx).indexOf(NOM_NOUVEAU) !== -1,
      'G-M ⑦ la feuille montre enfin la valeur enregistrée');
    verifier(ctx.autorisationRevisionLue === ctx.autorisationRevision,
      'G-M ⑧ et le succès suivant solde la dette');
  }

  /* ==== G-N — une réponse DÉPASSÉE ne repeint JAMAIS l'écran =========== */
  {
    // ⭐ G-H prouvait que l'ÉTAT FINAL est bon. Ici on éprouve le TEMPS INTERMÉDIAIRE :
    //   une réponse partie pour la révision 1 et revenue alors que la révision 2 existe
    //   déjà ne doit pas remettre l'ancienne valeur à l'écran, fût-ce une fraction de seconde.
    const portes = {};
    const porte = function (n) {
      if (!portes[n]) {
        let ouvrir; const p = new Promise(function (r) { ouvrir = r; });
        portes[n] = { p: p, ouvrir: ouvrir };
      }
      return portes[n];
    };
    const ctx = banc({
      mode: 'ecrans',
      avantReponseFFR: async function (n) { if (n >= 2) await porte(n).p; }
    });
    await lancer(ctx, 'majAutorisation()');                 // lecture n° 1 — rendu initial, libre
    ctx.__serveur.nom = NOM_NOUVEAU;
    await lancer(ctx, 'ecrireAdmin("genererPoulesEtPlanning", {})');       // révision 1
    lancer(ctx, 'ecransActiver("autorisation")');           // lance la lecture n° 2 (cible 1)
    for (let k = 0; k < 6; k++) await new Promise((r) => setImmediate(r));

    ctx.__serveur.nom = NOM_TROISIEME;
    await lancer(ctx, 'ecrireAdmin("recalculerHoraires", {})');            // révision 2
    verifier(ctx.autorisationRevision === 2, 'G-N ① la seconde écriture est bien arrivée pendant');

    porte(2).ouvrir();                                       // ⬅️ la réponse DÉPASSÉE revient
    for (let k = 0; k < 6; k++) await new Promise((r) => setImmediate(r));
    verifier(feuille(ctx).indexOf(NOM_NOUVEAU) === -1,
      'G-N ② ⭐⭐ BLOQUANT : la réponse de la révision 1 n\'a PAS repeint l\'écran');
    verifier(feuille(ctx).indexOf('rechargement') !== -1,
      'G-N ③ ⭐ l\'écran est resté dans son état neutre — fail-closed jusqu\'au bout');
    verifier(ctx.autorisationRevisionLue === 0,
      'G-N ④ ⛔ et aucune révision n\'a été comptée lue');

    porte(3).ouvrir();                                       // la lecture de la révision 2
    await laisserTourner(ctx);
    verifier(feuille(ctx).indexOf(NOM_TROISIEME) !== -1,
      'G-N ⑤ ⭐ la feuille finale montre bien la DERNIÈRE valeur');
    verifier(ctx.autorisationRevisionLue === ctx.autorisationRevision,
      'G-N ⑥ et la dette est soldée (' + ctx.autorisationRevisionLue + '/' +
      ctx.autorisationRevision + ')');
  }

  /* ==== G-O — un instantané de config DÉPASSÉ n'écrase pas configCourante */
  {
    // ⚠️ Ce trou-là ne se voit sur AUCUN écran : il installerait du passé directement dans
    //    l'état global que lisent tous les formulaires. D'où un test dédié.
    const portes = {};
    const porte = function (n) {
      if (!portes[n]) {
        let ouvrir; const p = new Promise(function (r) { ouvrir = r; });
        portes[n] = { p: p, ouvrir: ouvrir };
      }
      return portes[n];
    };
    const ctx = banc({
      mode: 'ecrans',
      avantReponseConfig: async function (n) { await porte(n).p; }
    });
    const nomConfig = function () { return (ctx.configCourante.global || {}).tournoi_nom; };
    verifier(nomConfig() === NOM_ANCIEN, 'G-O ① au départ, la config porte l\'ancienne valeur');

    ctx.__serveur.nom = NOM_NOUVEAU;
    await lancer(ctx, 'ecrireAdmin("enregistrerCategorie", { categorie: "U8" })');  // révision 1
    lancer(ctx, 'ecransActiver("autorisation")');   // tour 1 : lecture de config n° 1, BLOQUÉE
    for (let k = 0; k < 6; k++) await new Promise((r) => setImmediate(r));

    ctx.__serveur.nom = NOM_TROISIEME;
    await lancer(ctx, 'ecrireAdmin("ajouterEquipe", { nom_equipe: "TEST-3" })');    // révision 2
    porte(1).ouvrir();                               // ⬅️ l'instantané DÉPASSÉ (NOM_NOUVEAU) revient
    for (let k = 0; k < 6; k++) await new Promise((r) => setImmediate(r));

    verifier(nomConfig() !== NOM_NOUVEAU,
      'G-O ② ⭐⭐ BLOQUANT : l\'instantané de config DÉPASSÉ n\'a PAS écrasé configCourante');
    verifier(nomConfig() === NOM_ANCIEN,
      'G-O ③ ⭐ la config connue est restée celle d\'avant, pas une valeur intermédiaire');

    porte(2).ouvrir();                               // tour 2 : la config de la révision 2
    await laisserTourner(ctx);
    verifier(nomConfig() === NOM_TROISIEME,
      'G-O ④ ⭐ puis la config la plus RÉCENTE est bien installée');
    verifier(ctx.autorisationRevisionLue === ctx.autorisationRevision,
      'G-O ⑤ et la dette est soldée');
  }

  /* ==== G-P — CHEMIN PROPRE : concurrence pendant SES PROPRES lectures === */
  {
    // ⭐ `majAutorisationSiObsolete` était protégée ; le chemin propre, lui, attendait le réseau
    //   SANS cible. Une autre écriture pouvait le doubler, et sa réponse — déjà dépassée —
    //   installer une config ancienne ou repeindre l'écran. La dette n'était plus soldée à
    //   tort (corrigé au tour précédent), mais du PASSÉ pouvait redevenir visible.
    //   ⚠️ Mode « écrans », feuille FERMÉE : le crochet commun ne lance donc AUCUNE
    //   synchronisation de fond. Le seul rattrapage observé est celui du chemin propre lui-même.
    const nouvellePorte = function () {
      const portes = {};
      return function (n) {
        if (!portes[n]) {
          let ouvrir; const p = new Promise(function (r) { ouvrir = r; });
          portes[n] = { p: p, ouvrir: ouvrir };
        }
        return portes[n];
      };
    };
    const flush = async function () {
      for (let k = 0; k < 8; k++) await new Promise((r) => setImmediate(r));
    };

    /* ---- (a) la lecture de CONFIG du chemin propre est doublée ---------- */
    const porteA = nouvellePorte();
    const ctx = banc({ mode: 'ecrans', avantReponseConfig: async function (n) { await porteA(n).p; } });
    const nomConfig = function () { return (ctx.configCourante.global || {}).tournoi_nom; };
    ctx.__serveur.nom = NOM_NOUVEAU;
    lancer(ctx, 'onEnregistrerAutorisation()');        // ⛔ non attendu : il va se bloquer
    await flush();

    ctx.__serveur.nom = NOM_TROISIEME;
    await lancer(ctx, 'ecrireAdmin("enregistrerCategorie", { categorie: "U8" })');   // révision 2
    verifier(ctx.autorisationRevision === 2,
      'G-P ① une autre écriture est arrivée pendant la relecture du chemin propre');

    porteA(1).ouvrir();                                // ⬅️ l'instantané config DÉPASSÉ revient
    await flush();
    verifier(nomConfig() !== NOM_NOUVEAU,
      'G-P ② ⭐⭐ BLOQUANT : l\'instantané config dépassé n\'a PAS écrasé configCourante');
    verifier(nomConfig() === NOM_ANCIEN,
      'G-P ③ ⭐ la config connue est restée celle d\'avant');
    verifier(feuille(ctx).indexOf(NOM_NOUVEAU) === -1 && feuille(ctx).indexOf(NOM_ANCIEN) === -1,
      'G-P ④ ⭐⭐ BLOQUANT : aucune valeur de la révision 1 n\'est visible à l\'écran');
    verifier(feuille(ctx).indexOf('rechargement') !== -1,
      'G-P ⑤ ⭐ l\'écran est resté neutre — fail-closed');
    verifier(ctx.autorisationRevisionLue === 0,
      'G-P ⑥ ⛔ la dette est conservée (' + ctx.autorisationRevisionLue + '/' +
      ctx.autorisationRevision + ')');
    verifier(ctx.__messages.some(function (m) { return m.texte.indexOf('enregistrés') !== -1; }) &&
             !ctx.__messages.some(function (m) { return m.texte.indexOf('réseau') !== -1; }),
      'G-P ⑦ ⛔ l\'enregistrement org_* est annoncé RÉUSSI, sans fausse alerte réseau');

    porteA(2).ouvrir();                                // le rattrapage lit la révision 2
    await laisserTourner(ctx);
    verifier(feuille(ctx).indexOf(NOM_TROISIEME) !== -1,
      'G-P ⑧ ⭐⭐ le rattrapage AUTOMATIQUE a pris la dernière révision, sans navigation');
    verifier(nomConfig() === NOM_TROISIEME, 'G-P ⑨ et la config la plus récente est installée');
    verifier(ctx.autorisationRevisionLue === ctx.autorisationRevision,
      'G-P ⑩ revisionLue == revision (' + ctx.autorisationRevisionLue + '/' +
      ctx.autorisationRevision + ')');

    /* ---- (b) la lecture de la FEUILLE du chemin propre est doublée ------ */
    const porteB = nouvellePorte();
    const ctx2 = banc({ mode: 'ecrans', avantReponseFFR: async function (n) { await porteB(n).p; } });
    ctx2.__serveur.nom = NOM_NOUVEAU;
    lancer(ctx2, 'onEnregistrerAutorisation()');       // config lue tout de suite, FFR bloquée
    await flush();

    ctx2.__serveur.nom = NOM_TROISIEME;
    await lancer(ctx2, 'ecrireAdmin("ajouterEquipe", { nom_equipe: "TEST-4" })');    // révision 2
    porteB(1).ouvrir();                                // ⬅️ la réponse FEUILLE DÉPASSÉE revient
    await flush();
    verifier(feuille(ctx2).indexOf(NOM_NOUVEAU) === -1,
      'G-P ⑪ ⭐⭐ BLOQUANT : la réponse FEUILLE dépassée n\'a PAS repeint l\'écran');
    verifier(feuille(ctx2).indexOf('rechargement') !== -1,
      'G-P ⑫ ⭐ l\'écran est resté neutre pendant le rattrapage');
    verifier(ctx2.autorisationRevisionLue === 0,
      'G-P ⑬ ⛔ et la dette est conservée');

    porteB(2).ouvrir();
    await laisserTourner(ctx2);
    verifier(feuille(ctx2).indexOf(NOM_TROISIEME) !== -1,
      'G-P ⑭ ⭐ la feuille finale montre uniquement la DERNIÈRE valeur');
    verifier(ctx2.autorisationRevisionLue === ctx2.autorisationRevision,
      'G-P ⑮ et la dette est soldée');
  }

  /* ==== G-E — INVENTAIRE : toute action est classée, exactement une fois */
  {
    const dossierJs = path.join(RACINE, 'frontend/js');
    const fichiers = fs.readdirSync(dossierJs).filter(function (f) { return /\.js$/.test(f); });
    const ctx = banc({ mode: 'classique' });
    const A = ctx.ACTIONS_AUTORISATION_CROCHET;
    const B = ctx.ACTIONS_AUTORISATION_CHEMIN_PROPRE;
    const C = ctx.ACTIONS_AUTORISATION_SANS_IMPACT;

    const actions = new Set();
    const dynamiques = [];
    fichiers.forEach(function (f) {
      const src = sansCommentaires(fs.readFileSync(path.join(dossierJs, f), 'utf8'));
      appelsA(src, 'ecrireAdmin').forEach(function (a) {
        if (a.dynamique) { dynamiques.push(f + ' → ' + a.action); return; }
        actions.add(a.action);
      });
    });
    verifier(actions.size > 20, 'G-E ① l\'inventaire a bien trouvé les actions (' + actions.size + ')');

    const nonClassees = [];
    const doubles = [];
    actions.forEach(function (a) {
      const n = (A[a] ? 1 : 0) + (B[a] ? 1 : 0) + (C[a] ? 1 : 0);
      if (n === 0) nonClassees.push(a);
      if (n > 1) doubles.push(a);
    });
    verifier(nonClassees.length === 0,
      'G-E ② ⭐⭐ BLOQUANT : toute action passée à ecrireAdmin est CLASSÉE' +
      (nonClassees.length ? ' — non classée(s) : ' + nonClassees.join(', ') : ''));
    verifier(doubles.length === 0,
      'G-E ③ ⭐ aucune action classée DEUX FOIS' +
      (doubles.length ? ' — en double : ' + doubles.join(', ') : ''));
    verifier(dynamiques.length === 0,
      'G-E ④ ⭐⭐ BLOQUANT : aucune ACTION DYNAMIQUE non inventoriable' +
      (dynamiques.length ? ' — trouvée(s) : ' + dynamiques.join(' ; ') +
        ' — une action calculée ne peut pas être classée : écris-la en toutes lettres, ' +
        'ou inscris une exception motivée' : ''));

    // ⭐ PREUVE NOMMÉE que l'analyseur reconnaît bien les TROIS formes de littéral statique et
    //   refuse le reste — sans quoi « aucune action dynamique » ne voudrait rien dire.
    const temoin = [
      'ecrireAdmin(\'ACTION_SIMPLE\', {});',
      'ecrireAdmin("ACTION_DOUBLE", {});',
      'ecrireAdmin(`ACTION_GABARIT`, {});',
      'ecrireAdmin(actionCalculee, {});',
      'ecrireAdmin(`prefixe${x}`, {});',
      'async function ecrireAdmin(action, data) {}'
    ].join('\n');
    const lus = appelsA(temoin, 'ecrireAdmin');
    verifier(lus.length === 5,
      'G-E ⑤ les 5 APPELS sont vus, la déclaration est écartée (constaté ' + lus.length + ')');
    verifier(lus[0].action === 'ACTION_SIMPLE' && !lus[0].dynamique &&
             lus[1].action === 'ACTION_DOUBLE' && !lus[1].dynamique &&
             lus[2].action === 'ACTION_GABARIT' && !lus[2].dynamique,
      'G-E ⑥ ⭐ guillemets SIMPLES, DOUBLES et gabarit statique : tous les trois classés');
    verifier(lus[3].dynamique && lus[4].dynamique,
      'G-E ⑦ ⭐ une variable et un gabarit INTERPOLÉ sont refusés comme dynamiques');
  }

  /* ==== G-J — ANTI-CONTOURNEMENT du point de passage =================== */
  {
    /* ⚠️ INVENTAIRE DU 2026-08-25, et il corrige une affirmation trop forte : `ecrireAdmin`
       n'est PAS l'unique porte des écritures admin. Cinq écritures la contournent
       (partenaires, feuille de journée). Aucune ne touche la feuille FFR — vérifié une par
       une — donc elles restent telles quelles dans ce lot. ⛔ Mais toute NOUVELLE devra
       passer par `ecrireAdmin`, ou être inscrite ICI avec sa raison. */
    const EXCEPTIONS = {
      'admin.js|getConfigAdmin': 'lecture de la config (lireConfigAdmin)',
      'admin-autorisation.js|getDossierAutorisation': 'lecture de la feuille elle-même',
      /* ⭐ M1-B2 / B2-3.d — LECTURE : l'écran des terrains demande l'inventaire durable, le
         brouillon et le plan publié, distinctement. ⛔ Elle n'écrit rien (elle passe par
         `ACTIONS_LECTURE` côté serveur, donc sans même prendre le verrou d'écriture). */
      'admin-terrains.js|getPlanTerrains': 'lecture — inventaire, brouillon et plan publié',
      'admin-sponsors.js|lireMesuresSponsors': 'lecture — onglet Mesures, non lu par la feuille',
      'admin-sponsors.js|listerSponsors': 'lecture — onglet Sponsors, non lu par la feuille',
      'admin-sponsors.js|enregistrerReglagesSponsors': 'écriture historique — réglages d\'affichage des partenaires',
      'admin-sponsors.js|enregistrerSponsor': 'écriture historique — onglet Sponsors',
      'admin-sponsors.js|supprimerSponsor': 'écriture historique — onglet Sponsors',
      'admin-sponsors.js|viderMesuresSponsors': 'écriture historique — onglet Mesures',
      'admin-feuille-jour.js|envoyerFeuilleJour': 'écriture historique — envoi d\'emails, aucune donnée de la feuille',
      'saisie.js|enregistrerScore': 'clé SCORES, autre page — le score ne change ni terrain ni catégorie',
      /* ⭐ LE relais générique : c'est `ecrireAdmin` elle-même, le point de passage. Son action
         est forcément dynamique — c'est sa raison d'être. Elle est donc inscrite NOMMÉMENT
         plutôt qu'exemptée par une règle générale sur les appels dynamiques. */
      'admin.js|dyn:action': 'le relais générique de ecrireAdmin — c\'est LUI le point de passage'
    };
    const dossierJs = path.join(RACINE, 'frontend/js');
    const fichiers = fs.readdirSync(dossierJs).filter(function (f) { return /\.js$/.test(f); });
    const hors = [];
    const vues = new Set();
    fichiers.forEach(function (f) {
      if (f === 'api.js') return;                       // c'est la définition elle-même
      const src = sansCommentaires(fs.readFileSync(path.join(dossierJs, f), 'utf8'));
      appelsA(src, 'apiPostProtege').forEach(function (a) {
        const cle = f + '|' + (a.dynamique ? 'dyn:' : '') + a.action;
        vues.add(cle);
        if (!EXCEPTIONS[cle]) hors.push(f + ' → ' + (a.dynamique ? 'action dynamique « ' : '« ') +
          a.action + ' »');
      });
    });
    verifier(vues.size >= 10, 'G-J ① l\'inventaire des appels directs est complet (' + vues.size + ')');
    verifier(hors.length === 0,
      'G-J ② ⭐⭐ BLOQUANT : aucune écriture ne contourne ecrireAdmin hors exceptions inventoriées' +
      (hors.length ? ' — trouvé : ' + hors.join(' ; ') : ''));
    const inutiles = Object.keys(EXCEPTIONS).filter(function (cle) { return !vues.has(cle); });
    verifier(inutiles.length === 0,
      'G-J ③ ⭐ aucune exception PÉRIMÉE ne reste inscrite' +
      (inutiles.length ? ' — à retirer : ' + inutiles.join(', ') : ''));
  }

  console.log('==============================================');
  console.log('B2-0.5 frontend — ' + etat.ok + '/' + etat.total + ' OK, ' + etat.fail + ' ÉCHEC(S)');
  console.log('==============================================');
  process.exit(etat.fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
