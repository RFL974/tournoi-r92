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
 *  des doublures. ⛔ Aucune relecture de source, aucune expression régulière sur le code : si
 *  quelqu'un réécrit ces fonctions autrement mais correctement, les contrôles passent.
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
/*  Un scénario complet : on joue « Réinitialiser le tournoi » et on observe.  */
/* -------------------------------------------------------------------------- */

/**
 * @param {Object} opt
 *   - listerEchoue      : `listerClubsInvites` lève (coupure réseau)
 *   - clubsFrais        : ce que le serveur renvoie quand tout va bien
 *   - sansRechargement  : on retire `chargerClubsInvites` du contexte (mutation F-A)
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
    nb_educateurs_total: '3', detail_effectifs: '{"U8":[{"j":7,"e":3}]}'
  }];

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

  // ⭐ Les DEUX vraies fonctions, dans le même contexte : `chargerClubsInvites` n'est pas une
  //   doublure, c'est le code réel — sans quoi F-D ne prouverait rien de son comportement.
  if (!opt.sansRechargement) {
    vm.runInContext(extraireFonction('frontend/js/admin-invitations.js',
      'async function chargerClubsInvites()'), contexte, { filename: 'admin-invitations.js' });
  }
  vm.runInContext(extraireFonction('frontend/js/admin.js',
    'async function onReinitialiser()'), contexte, { filename: 'admin.js' });

  return vm.runInContext('onReinitialiser()', contexte).then(() => ({
    trace,
    clubsEnMemoire: contexte.clubsInvitesCourants,
    zoneClubs: (elements['liste-clubs-invites'] || {}).innerHTML || '',
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

/** Une participation de l'édition précédente traîne-t-elle encore en mémoire ?
 *  ⭐ On regarde ce qu'un CONSOMMATEUR verrait (statut, effectifs), pas une colonne précise. */
function porteUneParticipation(clubs) {
  return (clubs || []).some((c) => ['statut', 'categories_engagees', 'nb_joueurs_total',
    'nb_educateurs_total', 'detail_effectifs', 'selection_enregistree', 'club_token']
    .some((k) => String(c[k] == null ? '' : c[k]).trim() !== ''));
}

(async () => {
  console.log('===== B2-0 — réinitialisation et clubs invités (garde-fou frontend) =====');

  /* ---- F-C : le chemin nominal ---------------------------------------- */
  const CARNET_APRES_RESET = [{
    club_nom: 'LE TEST RUGBY CLUB', club_contact_nom: 'DUPONT', club_contact_prenom: 'Marie',
    club_contact_email: 'contact@test-rugby.fr', date_ajout: '2026-05-12',
    statut: '', categories_engagees: '', nb_joueurs_total: '', nb_educateurs_total: '',
    detail_effectifs: '', selection_enregistree: '', club_token: ''
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
  verifier(panne.clubsEnMemoire.length === 0,
    'F-D ② la liste en mémoire est vide — on affiche moins, jamais du faux');
  verifier(/Impossible de charger les clubs invités/.test(panne.zoneClubs),
    'F-D ③ l\'écran signale explicitement l\'échec de chargement');
  verifier(panne.messages.some((m) => m.ton === 'ko' && /pas pu être relue/.test(m.texte)),
    'F-D ④ le message de fin dit que la réinitialisation a eu lieu MAIS que l\'écran est incomplet');
  verifier(panne.trace.some((e) => e.type === 'rechargerEtRendre'),
    'F-D ⑤ la panne n\'interrompt pas le reste de la remise à zéro de l\'écran');

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
