/**
 * ============================================================================
 *  GARDE-FOU FRONTEND — « Réinitialiser le tournoi » et les clubs invités
 *  Chantier M1-B2 / B2-0 — voir docs/industrialisation/PLAN.md §16.5 bis
 * ============================================================================
 *
 *  ▶ Pour lancer :  node tests/frontend-reinitialisation.test.js
 *    (aucune dépendance, aucun navigateur, aucun réseau — Node seul)
 *    Il tourne aussi tout seul dans le contrôle `verifier` du workflow Pages :
 *    un échec REFUSE la publication, comme un fichier JavaScript illisible.
 *
 *  CE QU'IL PROTÈGE, et pourquoi ça vaut un fichier à part.
 *
 *  `rechargerEtRendre` s'appuie sur `getAll`, qui ne contient PAS les clubs invités : ils
 *  portent des emails, et leur seule lecture est `listerClubsInvites`, protégée par la clé
 *  admin. Une réinitialisation pouvait donc vider le classeur tout en laissant à l'écran —
 *  et surtout dans `clubsInvitesCourants`, que lit l'export PDF de la demande d'autorisation —
 *  les clubs « Accepté » et les effectifs de l'édition précédente.
 *
 *  ⛔ Ce fichier ne teste PAS l'affichage : il teste l'ENCHAÎNEMENT et l'ÉTAT MÉMOIRE.
 *  ⭐ Il exécute les VRAIES fonctions `onReinitialiser` (admin.js) et `chargerClubsInvites`
 *  (admin-invitations.js), extraites de leur fichier et lancées dans un contexte Node avec
 *  des doublures.
 *
 *  ⚠️ Les fichiers source SONT lus — c'est bien ainsi qu'on en extrait les fonctions. Ce qui
 *  est proscrit est autre chose, et c'est la vraie doctrine : ⛔ AUCUNE assertion ne se contente
 *  de chercher une chaîne ou une expression régulière DANS LE CODE pour conclure qu'il se
 *  comporte bien. Les fichiers sont lus UNIQUEMENT pour extraire et EXÉCUTER les vraies
 *  fonctions ; toutes les assertions portent ensuite sur ce que l'exécution a produit.
 *  ⭐ Conséquence voulue : réécrire ces fonctions autrement mais correctement laisse tout au vert.
 *
 *  ⚠️ POURQUOI HORS DE `frontend/` : tout `frontend/` est publié tel quel sur GitHub Pages.
 *  Un fichier de test y serait mis en ligne pour rien.
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = process.env.RACINE_TOURNOI_R92 || path.join(__dirname, '..');

/* -------------------------------------------------------------------------- */
/*  Extraction : on découpe une fonction de son fichier, par équilibrage       */
/*  d'accolades. ⛔ On ne la réécrit pas, on ne la simule pas : on la PREND.    */
/* -------------------------------------------------------------------------- */

function extraireFonction(cheminRelatif, entete) {
  const source = fs.readFileSync(path.join(RACINE, cheminRelatif), 'utf8');
  const debut = source.indexOf(entete);
  if (debut === -1) {
    throw new Error('Introuvable dans ' + cheminRelatif + ' : « ' + entete + ' ». ' +
      'Si la fonction a été renommée, mets ce garde-fou à jour — ne le supprime pas.');
  }
  let profondeur = 0;
  for (let i = source.indexOf('{', debut); i < source.length; i++) {
    if (source[i] === '{') profondeur++;
    else if (source[i] === '}' && --profondeur === 0) return source.slice(debut, i + 1);
  }
  throw new Error('Accolades déséquilibrées autour de « ' + entete + ' »');
}

/* -------------------------------------------------------------------------- */
/*  LE CONTRAT DU JETON, tel qu'il est RÉELLEMENT (doctrine T6 de B2-0)        */
/*                                                                            */
/*  ⚠️ Ne pas simplifier ces deux constantes, et voici pourquoi — c'est un      */
/*  défaut que ce fichier a déjà porté, trouvé par une revue extérieure.        */
/*                                                                            */
/*  Le faux serveur renvoyait `club_token: ''` après réinitialisation. C'était  */
/*  un état PLUS VIDE QUE LA RÉALITÉ, donc un test plus facile que la vie :     */
/*  `listerClubsInvites` appelle `assurerTokensClubs`, qui redonne un UUID neuf */
/*  à tout club qui n'en a pas — et renvoie la LIGNE COMPLÈTE, jeton compris.   */
/*  Après un reset réel suivi d'une relecture réussie, `club_token` est donc    */
/*  NON VIDE, et c'est CORRECT.                                                */
/*                                                                            */
/*  ⭐ La doctrine B2-0 n'est pas « aucun jeton » : c'est « aucun jeton HÉRITÉ, */
/*  ancien lien définitivement invalide ». Un jeton neuf est attendu.           */
/*                                                                            */
/*  ⛔ Ce fichier ne rejoue PAS la sécurité du jeton : `backend/Tests.gs` (T6)  */
/*  couvre déjà l'ancien lien invalide, le refus de l'ancien jeton et l'unicité */
/*  du nouveau. Ici on vérifie seulement que le FAUX SERVEUR respecte le vrai   */
/*  contrat de `listerClubsInvites` — sans quoi tout le reste teste une fiction.*/
/* -------------------------------------------------------------------------- */

const ANCIEN_JETON = 'JETON-EDITION-PRECEDENTE';
const NOUVEAU_JETON = 'JETON-NEUF-APRES-RESET';

/* -------------------------------------------------------------------------- */
/*  LA FEUILLE FFR D'UNE ÉDITION PRÉCÉDENTE — ⚠️ DONNÉES FICTIVES              */
/*                                                                            */
/*  ⛔ Ces valeurs sont INVENTÉES pour le test, et doivent le rester : noms     */
/*  volontairement reconnaissables comme faux (« TOURNOI TEST ANCIEN »).       */
/*  ⭐ Un test automatisé n'a aucun besoin de données réelles — il a besoin de  */
/*  valeurs qu'on puisse RECHERCHER sans ambiguïté après coup.                 */
/*                                                                            */
/*  ⚠️ NE PAS CONFONDRE DEUX CHOSES, et c'est le point :                       */
/*   · le SCÉNARIO reproduit ici — ancien état à l'écran, reset serveur réussi, */
/*     ouverture de l'écran SANS recharger le navigateur — vient d'un défaut    */
/*     CONSTATÉ MANUELLEMENT le 2026-08-25 en validation réelle ;              */
/*   · les VALEURS ci-dessous, elles, sont une mise en scène. ⛔ Elles ne sont   */
/*     PAS ce qui a été vu à l'écran ce jour-là, et ce fichier ne prétend pas   */
/*     le contraire. La preuve terrain vit dans le rapport de session, pas ici. */
/* -------------------------------------------------------------------------- */

const ANCIENNE_FEUILLE_FFR =
  '<div class="ffr-bloc">A.2 Tournoi : TOURNOI TEST ANCIEN — 2019-01-01 — STADE TEST ANCIEN' +
  '</div><div class="ffr-bloc">A.4 Nombre de clubs : 3 · Nombre d\'equipes : 12 · ' +
  'Nombre de participants : 117</div><div class="ffr-bloc">B.3 Nombre d\'educateurs : 38</div>';

const ANCIENNE_SAISIE_FFR = '<form>Champs saisis de l\'edition close (117 participants)</form>';

/** Une valeur de l'ancienne feuille FFR traîne-t-elle encore à l'écran ?
 *  ⛔ Témoins FICTIFS, choisis pour être introuvables ailleurs dans une feuille fraîche. */
const TRACES_ANCIENNE_EDITION = ['TOURNOI TEST ANCIEN', '2019-01-01', 'STADE TEST ANCIEN',
  '117', '38', ': 3 ', ': 12'];

function porteUneTraceDeLAncienneEdition(html) {
  return TRACES_ANCIENNE_EDITION.some((t) => String(html || '').indexOf(t) !== -1);
}

/* -------------------------------------------------------------------------- */
/*  Un scénario complet : on joue « Réinitialiser le tournoi » et on observe.  */
/* -------------------------------------------------------------------------- */

/**
 * @param {Object} opt
 *   - listerEchoue      : `listerClubsInvites` lève (coupure réseau)
 *   - clubsFrais        : ce que le serveur renvoie quand tout va bien
 *   - sansRechargement    : on retire `chargerClubsInvites` du contexte (mutation F-A)
 *   - autorisationEchoue  : la relecture de la feuille FFR leve (coupure reseau)
 *   - sansMajAutorisation : on retire la RELECTURE de la feuille, mais PAS l'oubli
 * @return {Promise<Object>} { trace, clubsEnMemoire, zoneClubs, messages }
 */
function jouerReinitialisation(opt) {
  opt = opt || {};
  const trace = [];
  const elements = {};
  const messages = [];

  // L'ÉTAT DE DÉPART : la mémoire de l'admin porte le tournoi de l'édition précédente,
  // avec un club ACCEPTÉ et ses effectifs — exactement le cas réel du 2026-08-24.
  const ANCIENNE_PARTICIPATION = [{
    club_nom: 'LE TEST RUGBY CLUB', club_contact_email: 'contact@test-rugby.fr',
    statut: 'Accepté', categories_engagees: 'U8', nb_joueurs_total: '7',
    nb_educateurs_total: '3', detail_effectifs: '{"U8":[{"j":7,"e":3}]}',
    selection_enregistree: '2026-08-25', club_token: ANCIEN_JETON
  }];

  // ⚠️ L'ÉCRAN « Demande d'autorisation » TEL QU'IL EST AU MOMENT DU CLIC : rendu au chargement
  // de la page, il porte encore la feuille FFR de l'édition qui va être effacée. C'est
  // EXACTEMENT ce qui a été constaté en réel le 2026-08-25.
  elements['autorisation-feuille'] = { id: 'autorisation-feuille', innerHTML: ANCIENNE_FEUILLE_FFR };
  elements['autorisation-saisie'] = { id: 'autorisation-saisie', innerHTML: ANCIENNE_SAISIE_FFR };

  const contexte = {
    console,
    document: {
      getElementById: (id) => (elements[id] = elements[id] ||
        { id, textContent: '', innerHTML: '', disabled: false })
    },
    // L'état partagé que tout l'admin lit — le cœur du sujet.
    clubsInvitesCourants: ANCIENNE_PARTICIPATION.map((c) => Object.assign({}, c)),

    dialogConfirmer: async (texte) => { trace.push({ type: 'confirm', texte }); return true; },
    afficherMessage: (el, texte, ton) => { messages.push({ texte, ton }); trace.push({ type: 'message' }); },
    echapper: (s) => String(s == null ? '' : s),
    afficherClubsInvites: () => trace.push({ type: 'afficherClubs' }),
    majApercuDossier: () => {},
    rechargerEtRendre: async () => { trace.push({ type: 'rechargerEtRendre' }); },

    // Les trois autres écrans du delta initAdmin / rechargerEtRendre (voir onReinitialiser).
    majSurPlace: () => trace.push({ type: 'majSurPlace' }),
    majReponse: () => trace.push({ type: 'majReponse' }),
    majApercuInvitation: () => trace.push({ type: 'majApercuInvitation' }),

    // Doublures de RENDU seulement : ce qu'on éprouve est que les zones soient RÉÉCRITES,
    // ⛔ pas ce qu'elles contiennent — le contenu, c'est le backend qui en répond (T4).
    rendreFeuilleAutorisation: () => '<div class="ffr-bloc">FEUILLE FRAICHE</div>',
    rendreSaisieAutorisation: () => '<div>SAISIE FRAICHE</div>',
    questionsDejaRepondues: () => ({}),
    apiPostProtege: async (action) => {
      trace.push({ type: 'appel', action });
      if (opt.autorisationEchoue) throw new Error('Échec réseau simulé (FFR)');
      return { dossier: { sections: [], nbManquants: 12, complet: false } };
    },

    ecrireAdmin: async (action) => {
      trace.push({ type: 'appel', action });
      if (action === 'listerClubsInvites') {
        if (opt.listerEchoue) throw new Error('Échec réseau simulé');
        return { clubs: opt.clubsFrais || [] };
      }
      return { nb_categories: 2, nb_equipes: 12, nb_poules: 3, nb_matchs: 18 };
    }
  };
  contexte.globalThis = contexte;
  vm.createContext(contexte);

  // ⭐ Les VRAIES fonctions, dans le même contexte — ce ne sont pas des doublures :
  //   `chargerClubsInvites`, `invaliderAutorisationAffichee` et `majAutorisation` sont le code réel.
  //   Sans cela, F-D et F-G ne prouveraient rien de leur comportement.
  if (!opt.sansRechargement) {
    vm.runInContext(extraireFonction('frontend/js/admin-invitations.js',
      'async function chargerClubsInvites()'), contexte, { filename: 'admin-invitations.js' });
  }
  vm.runInContext(extraireFonction('frontend/js/admin-autorisation.js',
    'function invaliderAutorisationAffichee()'), contexte, { filename: 'admin-autorisation.js' });
  // ⚠️ `sansMajAutorisation` ne retire QUE la relecture, jamais l'oubli : c'est précisément ce
  //    qu'il faut isoler pour prouver que l'oubli tient TOUT SEUL (F-G ⑧).
  if (!opt.sansMajAutorisation) {
    vm.runInContext(extraireFonction('frontend/js/admin-autorisation.js',
      'async function majAutorisation()'), contexte, { filename: 'admin-autorisation.js' });
  }
  vm.runInContext(extraireFonction('frontend/js/admin.js',
    'async function onReinitialiser()'), contexte, { filename: 'admin.js' });

  return vm.runInContext('onReinitialiser()', contexte).then(() => ({
    trace,
    clubsEnMemoire: contexte.clubsInvitesCourants,
    zoneClubs: (elements['liste-clubs-invites'] || {}).innerHTML || '',
    zoneFeuilleFFR: elements['autorisation-feuille'].innerHTML || '',
    zoneSaisieFFR: elements['autorisation-saisie'].innerHTML || '',
    messages
  }));
}

/* -------------------------------------------------------------------------- */
/*  Assertions                                                                */
/* -------------------------------------------------------------------------- */

const etat = { total: 0, ok: 0, fail: 0, echecs: [] };

function verifier(condition, libelle) {
  etat.total++;
  if (condition) { etat.ok++; console.log('  OK    ' + libelle); }
  else { etat.fail++; etat.echecs.push(libelle); console.log('  ÉCHEC ' + libelle); }
}

/** Les champs d'ENGAGEMENT qui, s'ils sont remplis, trahissent une édition non réinitialisée.
 *  ⛔ `club_token` n'en fait PAS partie : après une relecture réussie il est NON VIDE, et c'est
 *  le contrat (voir l'encadré du jeton plus haut). Le jeton se contrôle par sa VALEUR — ancien
 *  ou neuf — pas par sa présence. */
const CHAMPS_ENGAGEMENT = ['statut', 'categories_engagees', 'dossier_envoye', 'invitation_envoyee',
  'date_reponse', 'nb_equipes_par_categorie', 'nb_joueurs_total', 'alerte_ecart',
  'detail_effectifs', 'nb_educateurs_total', 'selection_enregistree'];

/** Une participation de l'édition précédente traîne-t-elle encore en mémoire ?
 *  ⭐ On regarde ce qu'un CONSOMMATEUR verrait (statut, effectifs), pas une colonne précise. */
function porteUneParticipation(clubs) {
  return (clubs || []).some((c) => CHAMPS_ENGAGEMENT
    .some((k) => String(c[k] == null ? '' : c[k]).trim() !== ''));
}

/** Le jeton de l'édition précédente survit-il en mémoire ? ⭐ Contrôle par la VALEUR. */
function porteLAncienJeton(clubs) {
  return (clubs || []).some((c) => String(c.club_token || '').trim() === ANCIEN_JETON);
}

(async () => {
  console.log('===== B2-0 — réinitialisation et clubs invités (garde-fou frontend) =====');

  /* ---- F-C : le chemin nominal ---------------------------------------- */
  // ⭐ CE QUE LE VRAI SERVEUR RENVOIE après un reset suivi d'un `listerClubsInvites` :
  //    l'identité et le contact DURABLES, tous les champs d'engagement VIDES,
  //    et un club_token NON VIDE — le jeton neuf posé par `assurerTokensClubs`.
  const CARNET_APRES_RESET = [{
    club_nom: 'LE TEST RUGBY CLUB', club_contact_nom: 'DUPONT', club_contact_prenom: 'Marie',
    club_contact_email: 'contact@test-rugby.fr', date_ajout: '2026-05-12',
    statut: '', categories_engagees: '', dossier_envoye: '', invitation_envoyee: '',
    date_reponse: '', nb_equipes_par_categorie: '', nb_joueurs_total: '', alerte_ecart: '',
    detail_effectifs: '', nb_educateurs_total: '', selection_enregistree: '',
    club_token: NOUVEAU_JETON
  }];
  const nominal = await jouerReinitialisation({ clubsFrais: CARNET_APRES_RESET });
  const iReset = nominal.trace.findIndex((e) => e.action === 'reinitialiserTournoi');
  const iClubs = nominal.trace.findIndex((e) => e.action === 'listerClubsInvites');
  const iRendre = nominal.trace.findIndex((e) => e.type === 'rechargerEtRendre');

  verifier(iReset !== -1, 'F-C ① la réinitialisation est bien demandée au serveur');
  verifier(iClubs !== -1 && iClubs > iReset,
    'F-C ② les clubs invités sont RELUS depuis le serveur, APRÈS la réinitialisation');
  verifier(iRendre !== -1, 'F-C ③ le reste de la page est ré-affiché');
  verifier(nominal.clubsEnMemoire.length === 1 && nominal.clubsEnMemoire[0].club_nom === 'LE TEST RUGBY CLUB',
    'F-C ④ le carnet DURABLE revient bien en mémoire (le club reste connu)');
  verifier(!porteUneParticipation(nominal.clubsEnMemoire),
    'F-C ⑤ ⭐ et il ne porte plus AUCUNE participation de l\'édition effacée');
  verifier(nominal.messages.some((m) => m.ton === 'ok' && /réinitialisé/.test(m.texte)),
    'F-C ⑥ l\'organisateur est informé du succès');

  /* ---- F-T : le contrat du JETON, tel qu'il est réellement --------------- */
  //   ⛔ On ne rejoue pas la sécurité backend (T6 la couvre) : on vérifie que le faux serveur
  //      respecte le contrat de `listerClubsInvites`, et que rien de l'ancien ne traverse.
  const jetonFrais = String((nominal.clubsEnMemoire[0] || {}).club_token || '').trim();
  verifier(jetonFrais !== '',
    'F-T ① le jeton frais EXISTE après relecture — un jeton neuf est attendu, pas interdit');
  verifier(jetonFrais !== ANCIEN_JETON,
    'F-T ② ⭐ il est DIFFÉRENT de celui de l\'édition précédente');
  verifier(!porteLAncienJeton(nominal.clubsEnMemoire),
    'F-T ③ ⭐ l\'ancien jeton n\'est plus nulle part en mémoire après la relecture nominale');

  /* ---- F-B : l'ORDRE ---------------------------------------------------- */
  // ⚠️ `iClubs !== -1` est INDISPENSABLE : sans lui, un -1 « passerait » la comparaison et ce
  //    contrôle validerait un code qui ne relit rien. C'est le piège du garde-fou qui ne mord jamais.
  verifier(iClubs !== -1 && iRendre !== -1 && iClubs < iRendre,
    'F-B ⭐ les clubs sont relus AVANT le ré-affichage — majDossier et majTableauBord, ' +
    'qui lisent cette liste, voient donc du frais');

  /* ---- F-D : LE CONTRÔLE BLOQUANT — panne réseau APRÈS un reset réussi --- */
  //   Le serveur a effacé. La relecture échoue. ⛔ Rien de l'ancienne édition ne doit survivre.
  const panne = await jouerReinitialisation({ listerEchoue: true });
  verifier(!porteUneParticipation(panne.clubsEnMemoire),
    'F-D ⭐⭐ BLOQUANT : relecture en échec ⇒ AUCUNE participation de l\'ancienne édition ' +
    'ne subsiste en mémoire (fail-closed)');
  verifier(!porteLAncienJeton(panne.clubsEnMemoire),
    'F-D ② ⭐ ni l\'ancien jeton — en panne, RIEN de l\'édition passée ne survit');
  verifier(panne.clubsEnMemoire.length === 0,
    'F-D ③ la liste en mémoire est vide — on affiche moins, jamais du faux');
  verifier(/Impossible de charger les clubs invités/.test(panne.zoneClubs),
    'F-D ④ l\'écran signale explicitement l\'échec de chargement');
  verifier(panne.messages.some((m) => m.ton === 'ko' && /pas pu être relue/.test(m.texte)),
    'F-D ⑤ le message de fin dit que la réinitialisation a eu lieu MAIS que l\'écran est incomplet');
  verifier(panne.trace.some((e) => e.type === 'rechargerEtRendre'),
    'F-D ⑥ la panne n\'interrompt pas le reste de la remise à zéro de l\'écran');

  /* ---- F-G : LA DEMANDE D'AUTORISATION — le défaut trouvé EN RÉEL -------- */
  //   Scénario exact : ancien état à l'écran → reset réussi → on ouvre « Demande d'autorisation »
  //   SANS recharger le navigateur. ⛔ Aucune donnée de l'ancienne édition ne doit rester visible.
  verifier(nominal.trace.some((e) => e.action === 'getDossierAutorisation'),
    'F-G ① la feuille FFR est RELUE depuis le serveur après le reset');
  verifier(!porteUneTraceDeLAncienneEdition(nominal.zoneFeuilleFFR),
    'F-G ② ⭐ plus aucune valeur de l\'ancien tournoi dans la feuille (ni nom, ni date, ni ' +
    'lieu, ni 3 clubs / 12 equipes / 117 participants / 38 educateurs)');
  verifier(!porteUneTraceDeLAncienneEdition(nominal.zoneSaisieFFR),
    'F-G ③ ni dans la zone de saisie de la demande');
  verifier(/FEUILLE FRAICHE/.test(nominal.zoneFeuilleFFR),
    'F-G ④ la feuille affichée est bien celle que le serveur vient de renvoyer');

  //   ⭐⭐ FAIL-CLOSED : la relecture de la feuille ÉCHOUE (réseau) après un reset réussi.
  //      C'est le cas dangereux : le classeur est vide, et l'écran est la seule copie restante.
  const panneFFR = await jouerReinitialisation({ clubsFrais: CARNET_APRES_RESET, autorisationEchoue: true });
  verifier(!porteUneTraceDeLAncienneEdition(panneFFR.zoneFeuilleFFR),
    'F-G ⑤ ⭐⭐ BLOQUANT : relecture FFR en échec ⇒ l\'ancienne feuille a DISPARU quand même');
  verifier(!porteUneTraceDeLAncienneEdition(panneFFR.zoneSaisieFFR),
    'F-G ⑥ ⭐⭐ idem pour la zone de saisie');
  verifier(/indisponible/.test(panneFFR.zoneFeuilleFFR),
    'F-G ⑦ et l\'écran dit clairement que la feuille est indisponible');

  //   ⛔ Même si `majAutorisation` n'existait pas, l'oubli préalable doit avoir eu lieu.
  const sansMaj = await jouerReinitialisation({ clubsFrais: CARNET_APRES_RESET, sansMajAutorisation: true });
  verifier(!porteUneTraceDeLAncienneEdition(sansMaj.zoneFeuilleFFR),
    'F-G ⑧ ⭐ sans même la fonction de relecture, l\'ancienne feuille ne survit pas');

  //   Les trois autres écrans du delta initAdmin / rechargerEtRendre.
  ['majSurPlace', 'majReponse', 'majApercuInvitation'].forEach((f) => {
    verifier(nominal.trace.some((e) => e.type === f),
      'F-G ⑨ ' + f + ' est rafraîchi après le reset (données d\'édition effacées)');
  });

  /* ---- F-A : le rechargement lui-même ----------------------------------- */
  const sansFonction = await jouerReinitialisation({ sansRechargement: true });
  verifier(!porteUneParticipation(sansFonction.clubsEnMemoire),
    'F-A ⭐ même sans `chargerClubsInvites`, aucune ancienne participation ne survit ' +
    '(l\'oubli précède la relecture)');
  verifier(sansFonction.trace.some((e) => e.type === 'rechargerEtRendre'),
    'F-A ② et la réinitialisation aboutit quand même');

  /* ---- Le texte de confirmation dit la vérité --------------------------- */
  const confirmations = nominal.trace.filter((e) => e.type === 'confirm')
    .map((e) => e.texte).join('\n');
  verifier(/RÉPONSE à cette édition/.test(confirmations),
    'F-E ① la fenêtre de confirmation annonce que la RÉPONSE du club est effacée');
  verifier(/éducateurs/.test(confirmations),
    'F-E ② elle annonce aussi les éducateurs (R-099)');
  verifier(!/\(noms, contacts, statut\)/.test(confirmations),
    'F-E ③ ⭐ elle n\'annonce PLUS « statut » parmi les données conservées (devenu faux)');

  console.log('==============================================');
  console.log('B2-0 frontend — ' + etat.ok + '/' + etat.total + ' OK, ' + etat.fail + ' ÉCHEC(S)');
  if (etat.fail) console.log('Échecs : ' + etat.echecs.join(' | '));
  console.log('==============================================');
  process.exit(etat.fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
