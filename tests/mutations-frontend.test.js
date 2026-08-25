/**
 * ============================================================================
 *  LE GARDE-FOU DU GARDE-FOU — mutations du chantier M1-B2 / B2-0
 * ============================================================================
 *
 *  ▶ Pour lancer :  node tests/mutations-frontend.test.js
 *
 *  ⭐ POURQUOI CE FICHIER EXISTE, et c'est une leçon de ce projet.
 *
 *  Un test qui passe ne prouve rien tant qu'on ne l'a pas vu ÉCHOUER. Le chantier M1-B (R-098)
 *  avait déjà trouvé « un harnais qui ne bloquait jamais » — il aurait validé n'importe quoi.
 *  Et pendant B2-0, un contrôle d'ordre a bien failli passer sur un index `-1` : il aurait
 *  approuvé le code d'AVANT le correctif.
 *
 *  Ce fichier réintroduit VOLONTAIREMENT, dans une COPIE TEMPORAIRE du dépôt, chacun des
 *  défauts que B2-0 a corrigés, et vérifie que `frontend-reinitialisation.test.js` les
 *  ATTRAPE. Une mutation qui passerait inaperçue est un échec.
 *
 *  ⛔ Il ne modifie JAMAIS le dépôt : tout se joue dans un dossier temporaire, supprimé ensuite.
 *  ⭐ Il est rejouable depuis un clone neuf, sans aucune dépendance.
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const RACINE = path.join(__dirname, '..');

/** Remplace un motif EXACT dans un fichier de la copie ; échoue bruyamment s'il a disparu. */
function remplacer(base, fichier, avant, apres) {
  const chemin = path.join(base, fichier);
  const source = fs.readFileSync(chemin, 'utf8');
  if (source.indexOf(avant) === -1) {
    throw new Error('Motif introuvable dans ' + fichier + ' — cette mutation est PÉRIMÉE : ' +
      'le code a changé. Mets-la à jour, ne la supprime pas.\n  Motif : ' + avant.slice(0, 90));
  }
  fs.writeFileSync(chemin, source.replace(avant, apres));
}

const MUTATIONS = [
  {
    nom: 'F-A — le rechargement des clubs est retiré après le reset',
    defaut: 'l\'écran garderait les cartes « Accepté » et les effectifs de l\'édition effacée',
    appliquer: (b) => remplacer(b, 'frontend/js/admin.js',
      '    const clubsRelus = (typeof chargerClubsInvites === \'function\') && await chargerClubsInvites();',
      '    const clubsRelus = true;')
  },
  {
    nom: 'F-B — l\'ordre est inversé : on ré-affiche AVANT de relire les clubs',
    defaut: 'majDossier et majTableauBord liraient encore l\'ancienne liste',
    appliquer: (b) => {
      const f = 'frontend/js/admin.js';
      const appel = '    const clubsRelus = (typeof chargerClubsInvites === \'function\') && await chargerClubsInvites();\n';
      remplacer(b, f, appel, '');
      remplacer(b, f, '                              equipes: true, infos: true, publication: true });',
        '                              equipes: true, infos: true, publication: true });\n' + appel);
    }
  },
  {
    nom: 'F-D — l\'oubli préalable est retiré : la relecture en échec laisse le passé en place',
    defaut: '⭐ LE DÉFAUT SIGNALÉ PAR LA REVUE — panne réseau après un reset réussi côté serveur',
    appliquer: (b) => remplacer(b, 'frontend/js/admin.js',
      '    clubsInvitesCourants = [];\n', '')
  },
  {
    nom: 'F-D bis — chargerClubsInvites ment : elle annonce un succès qu\'elle n\'a pas eu',
    defaut: 'l\'organisateur croirait l\'écran à jour alors qu\'il ne l\'est pas',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-invitations.js',
      '      + echapper(erreur.message) + \'</p>\';\n    return false;',
      '      + echapper(erreur.message) + \'</p>\';\n    return true;')
  },
  {
    nom: 'F-E — le texte de confirmation reprend l\'ancienne promesse « statut conservé »',
    defaut: 'l\'organisateur validerait une perte qu\'on lui annonce comme une conservation',
    appliquer: (b) => remplacer(b, 'frontend/js/admin.js',
      '\'• le carnet d\\\'adresses des clubs invités — noms, contacts, emails — et vos \' +\n               \'partenaires. Les clubs restent dans la liste : ils redeviennent invitables.\'',
      '\'• le carnet des clubs invités (noms, contacts, statut) et vos partenaires.\'')
  },
  {
    // ⭐ LE DÉFAUT TROUVÉ EN VALIDATION RÉELLE le 2026-08-25 : la feuille FFR de l'édition
    //   effacée restait à l'écran — 3 clubs, 12 équipes, 117 participants, 38 éducateurs — sur
    //   un classeur pourtant vide.
    nom: 'F-G — la feuille FFR n\'est plus relue apres le reset (stale state Demande d autorisation)',
    defaut: 'le document destine a la LIGUE afficherait encore l edition close',
    appliquer: (b) => remplacer(b, 'frontend/js/admin.js',
      '    if (typeof majAutorisation === \'function\') await majAutorisation();\n', '')
  },
  {
    // ⭐⭐ LE FILET DE SECOURS : sans lui, un échec de rechargerEtRendre laisse une page
    //   ENTIÈRE peinte avec l'édition que le serveur vient d'effacer.
    nom: 'F-H — le rechargement de secours est retire',
    defaut: 'la page entiere resterait peinte avec l edition effacee',
    appliquer: (b) => remplacer(b, 'frontend/js/admin.js',
      '      rechargerLaPage();\n      return;\n', '')
  },
  {
    // ⛔ Le `return` est l'autre moitie : sans lui, on repeindrait « Reponse » depuis une
    //   config vide, et `email_expediteur` — pourtant CONSERVE — apparaitrait vide.
    nom: 'F-H bis — la sortie apres le rechargement est retiree',
    defaut: 'email_expediteur s afficherait VIDE et un enregistrement l ecraserait',
    appliquer: (b) => remplacer(b, 'frontend/js/admin.js',
      '      rechargerLaPage();\n      return;\n', '      rechargerLaPage();\n')
  },
  {
    nom: 'F-G bis — l oubli prealable de la feuille FFR est retire',
    defaut: 'en cas de panne reseau, l ancienne feuille resterait la seule copie visible',
    appliquer: (b) => remplacer(b, 'frontend/js/admin.js',
      '    if (typeof invaliderAutorisationAffichee === \'function\') invaliderAutorisationAffichee();\n', '')
  },
  {
    // ⭐ CELLE-CI NE MUTE PAS LE PRODUIT, MAIS LE MODÈLE DU TEST — et c'est le seul cas où
    //   c'est légitime : un faux serveur infidèle rend TOUTES les autres preuves creuses.
    //   Le défaut est réel, il a existé : le faux état frais renvoyait `club_token: ''`, plus
    //   vide que la réalité. Ici on va plus loin — le faux serveur RECYCLE l'ancien jeton.
    nom: 'F-T — le faux état frais RÉUTILISE l\'ancien jeton (modèle infidèle)',
    defaut: 'le garde-fou validerait un contrat que le vrai serveur ne respecte pas',
    appliquer: (b) => remplacer(b, 'tests/frontend-reinitialisation.test.js',
      '    club_token: NOUVEAU_JETON\n', '    club_token: ANCIEN_JETON\n')
  },

  /* ======================================================================
     M1-B2 / B2-0.5 — la Demande d'autorisation suit les enregistrements.
     ⭐ Ces mutations sont rejouées contre `frontend-autorisation-sync.test.js`.
     ====================================================================== */
  {
    // ⭐ LE DÉFAUT CONSTATÉ EN RÉEL le 2026-08-25 : nom du tournoi enregistré, feuille FFR
    //   restée sur l'ancien jusqu'à un rechargement manuel du navigateur.
    nom: 'M-1 — le crochet est retiré de ecrireAdmin',
    garde: 'autorisation',
    defaut: 'plus AUCUN enregistrement ne rafraîchirait la feuille FFR — le défaut réel revient',
    appliquer: (b) => remplacer(b, 'frontend/js/admin.js',
      '    if (typeof ecritureImpacteAutorisation === \'function\' &&\n' +
      '        ecritureImpacteAutorisation(action, data, res)) {',
      '    if (false) {')
  },
  {
    nom: 'M-2 — « enregistrerInfosTournoi » est retirée de la liste A',
    garde: 'autorisation',
    defaut: 'exactement le chemin du défaut réel : le nom du tournoi ne rafraîchirait rien',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      '  enregistrerInfosTournoi:       \'A.2 nom/lieu/adresse/date — et A.3 (le mois choisit les formes)\',\n', '')
  },
  {
    // ⛔ LE CŒUR DU POINT 2 : ecrireAdmin porte 46 des 51 écritures de l'admin.
    nom: 'M-2 bis — ecrireAdmin ATTEND la relecture FFR',
    garde: 'autorisation',
    defaut: 'toutes les écritures concernées traîneraient la latence d\'un aller-retour FFR',
    appliquer: (b) => remplacer(b, 'frontend/js/admin.js',
      '        majAutorisationSiObsolete().catch(function () { /* la feuille garde son message */ });',
      '        await majAutorisationSiObsolete();')
  },
  {
    nom: 'M-3 — « enregistrerSurPlace » est ajoutée à la liste A (faux impact)',
    garde: 'autorisation',
    defaut: 'une écriture SANS RAPPORT paierait une route réseau à chaque fois',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      'var ACTIONS_AUTORISATION_CROCHET = {\n',
      'var ACTIONS_AUTORISATION_CROCHET = {\n  enregistrerSurPlace: \'faux impact introduit par la mutation\',\n')
  },
  {
    nom: 'M-4 — le crochet de navigation ORDINATEUR est retiré (ecrans.js)',
    garde: 'autorisation',
    defaut: 'sur ordinateur, ouvrir l\'onglet ne relirait plus jamais la feuille',
    appliquer: (b) => remplacer(b, 'frontend/js/ecrans.js',
      '  if (id === \'autorisation\' && typeof majAutorisationSiObsolete === \'function\') {\n' +
      '    majAutorisationSiObsolete().catch(function () { /* la feuille garde son message */ });\n  }\n', '')
  },
  {
    // ⭐⭐ LE JUMEAU. C'est l'écart entre ces deux fichiers qui avait produit R-098.
    nom: 'M-4 bis — le crochet de navigation MOBILE est retiré (assistant.js)',
    garde: 'autorisation',
    defaut: 'sur téléphone, la feuille FFR resterait périmée — défaut invisible depuis un ordinateur',
    appliquer: (b) => remplacer(b, 'frontend/js/assistant.js',
      '  if ((ASSISTANT_ETAPES[i] || {}).id === \'autorisation\' &&\n' +
      '      typeof majAutorisationSiObsolete === \'function\') {\n' +
      '    majAutorisationSiObsolete().catch(function () { /* la feuille garde son message */ });\n  }\n', '')
  },
  {
    nom: 'M-5 — la révision est marquée LUE avant la relecture',
    garde: 'autorisation',
    defaut: 'une panne effacerait la dette : plus jamais de nouvel essai',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      '      const cible = autorisationRevision;              // ⭐ capturée AVANT toute attente',
      '      const cible = autorisationRevision; autorisationRevisionLue = cible;')
  },
  {
    // ⭐⭐ LE PIÈGE EXACT que le compteur de révision existe pour éviter.
    nom: 'M-5 bis — on inscrit la révision COURANTE au lieu de la CIBLE capturée',
    garde: 'autorisation',
    defaut: 'une écriture arrivée pendant la lecture serait comptée lue sans avoir été lue',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      '      autorisationRevisionLue = cible;                 // ⛔ la CIBLE, jamais autorisationRevision',
      '      autorisationRevisionLue = autorisationRevision;')
  },
  {
    nom: 'M-5 ter — le RATTRAPAGE automatique est supprimé (un seul tour)',
    garde: 'autorisation',
    defaut: 'la dernière écriture attendrait une navigation hypothétique pour être vue',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      'while (autorisationRevision !== autorisationRevisionLue && tours < AUTORISATION_TOURS_MAX) {',
      'while (autorisationRevision !== autorisationRevisionLue && tours < 1) {')
  },
  {
    nom: 'M-6 — l\'échec de la relecture est ignoré',
    garde: 'autorisation',
    defaut: 'une panne réseau serait enregistrée comme un succès',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      '      if (!bilan.ok) return { relue: tours > 1, motif: bilan.motif, tours: tours };\n', '')
  },
  {
    nom: 'M-7 — majAutorisation annonce un succès même après une panne',
    garde: 'autorisation',
    defaut: 'le bilan mentirait : c\'est le « succès silencieux » que B2-0.5 interdit',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      '  if (!reseauOk) return { ok: false, motif: \'reseau\', saisie: saisie };',
      '  if (!reseauOk) return { ok: true, motif: \'reseau\', saisie: saisie };')
  },
  {
    // ⭐ LA PROTECTION DES SAISIES : une synchronisation automatique ne doit RIEN effacer.
    nom: 'M-8 — preserverSaisie est ignorée : le formulaire est toujours reconstruit',
    garde: 'autorisation',
    defaut: 'une saisie org_* en cours serait effacée par une écriture faite ailleurs',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      '  } else if (opt.preserverSaisie && typeof autorisationSaisieModifiee === \'function\' &&\n' +
      '             autorisationSaisieModifiee()) {\n' +
      '    saisie = \'preservee-saisie-en-cours\';\n', '  } else if (false) {\n')
  },
  {
    nom: 'M-8 bis — après une PANNE, le formulaire est repeint quand même',
    garde: 'autorisation',
    defaut: 'sans dossier fiable, on masquerait les questions au jugé',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      '  if (opt.preserverSaisie && !reseauOk) {\n    saisie = \'preservee-panne\';\n',
      '  if (false) {\n    saisie = \'preservee-panne\';\n')
  },
  {
    nom: 'M-9 — le filtre « aperçu » est retiré',
    garde: 'autorisation',
    defaut: 'un simple APERÇU de suppression provoquerait un recalcul complet',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      '  if (action === \'supprimerClubInvite\' && reponse && reponse.apercu === true) return false;\n', '')
  },
  {
    // ⭐ LE SCOPAGE PAR ACTION, exigé par la revue : un champ homonyme ne doit rien contourner.
    nom: 'M-9 bis — les filtres de réponse ne sont plus SCOPÉS par action',
    garde: 'autorisation',
    defaut: 'un futur point d\'entrée employant `apercu`/`applique` contournerait le marquage',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      '  if (action === \'supprimerClubInvite\' && reponse && reponse.apercu === true) return false;\n' +
      '  if (action === \'appliquerValeursFFR\' && reponse && reponse.applique === false) return false;',
      '  if (reponse && reponse.apercu === true) return false;\n' +
      '  if (reponse && reponse.applique === false) return false;')
  },
  {
    nom: 'M-10 — une action n\'est plus classée dans aucune des trois listes',
    garde: 'autorisation',
    defaut: 'l\'oubli d\'un futur chemin d\'écriture passerait inaperçu — le trou d\'origine',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      '  regenererJetonClub:       \'club_token — non lu par la feuille\',\n', '')
  },
  {
    nom: 'M-11 — une écriture contourne ecrireAdmin par un apiPostProtege direct',
    garde: 'autorisation',
    defaut: 'le « point de passage » cesserait d\'en être un, sans que personne ne le voie',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-equipes.js',
      'async function', 'async function __mutationContournement() {\n' +
      '  return apiPostProtege(\'enregistrerContournementTest\', {}, \'admin\', \'admin\');\n}\n\nasync function')
  },
  {
    nom: 'M-12 — la liste des champs sans impact d\'« enregistrerInvitation » est vidée',
    garde: 'autorisation',
    defaut: 'enregistrer le seul texte du parking paierait une route réseau inutile',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      '  enregistrerInvitation:   [\'date_limite_confirmation\', \'tarif_engagement_modalites\',\n' +
      '                            \'parking_texte\', \'encadrement_ratio\', \'encadrement_diplomes\',\n' +
      '                            \'assurance_attestation_requise\']',
      '  enregistrerInvitation:   []')
  },
  {
    // ⭐ LE SENS SÛR DE L'ERREUR : un champ INCONNU doit provoquer un recalcul, pas un silence.
    nom: 'M-13 — le filtre des charges partielles est inversé (some au lieu de every)',
    garde: 'autorisation',
    defaut: 'un champ NOUVEAU serait tenu pour sans impact : l\'écran redeviendrait périmé en silence',
    appliquer: (b) => remplacer(b, 'frontend/js/admin-autorisation.js',
      'if (cles.length && cles.every(function (c) { return sansImpact.indexOf(c) !== -1; })) return false;',
      'if (cles.length && cles.some(function (c) { return sansImpact.indexOf(c) !== -1; })) return false;')
  }
];

/** Quel garde-fou rejouer pour une mutation donnée. */
const GARDES = {
  reset: 'frontend-reinitialisation.test.js',
  autorisation: 'frontend-autorisation-sync.test.js'
};

/* -------------------------------------------------------------------------- */

const base = fs.mkdtempSync(path.join(os.tmpdir(), 'r92-mutations-'));
let nonDetectees = 0;

try {
  console.log('===== B2-0 — rejeu des mutations frontend =====');
  console.log('(copie temporaire : ' + base + ' — le dépôt n\'est jamais modifié)\n');

  for (const mutation of MUTATIONS) {
    const copie = path.join(base, 'copie');
    fs.rmSync(copie, { recursive: true, force: true });
    fs.mkdirSync(path.join(copie, 'frontend', 'js'), { recursive: true });
    fs.mkdirSync(path.join(copie, 'tests'), { recursive: true });
    // ⚠️ TOUT `frontend/js/` est copié, et ce n'est pas du confort : les contrôles d'INVENTAIRE
    //    de B2-0.5 (G-E « toute action est classée », G-J « aucune écriture ne contourne
    //    ecrireAdmin ») BALAIENT le dossier entier. Avec une copie partielle, leurs mutations
    //    ne trouveraient rien à muter — ou pire, le garde-fou planterait, et le contrôle
    //    anti-plantage plus bas les refuserait à juste titre.
    // ⚠️ Les garde-fous sont copiés EUX AUSSI : la mutation F-T porte sur le MODÈLE du test,
    //    pas sur le produit, et n'aurait sinon aucun endroit où s'appliquer.
    for (const f of fs.readdirSync(path.join(RACINE, 'frontend', 'js'))) {
      if (!/\.js$/.test(f)) continue;
      fs.copyFileSync(path.join(RACINE, 'frontend', 'js', f), path.join(copie, 'frontend', 'js', f));
    }
    for (const f of ['tests/frontend-reinitialisation.test.js',
                     'tests/frontend-autorisation-sync.test.js']) {
      fs.copyFileSync(path.join(RACINE, f), path.join(copie, f));
    }

    mutation.appliquer(copie);

    // ⭐ On lance le garde-fou tel qu'il est dans la COPIE, contre la copie : pour les mutations
    //   de produit il est identique à celui du dépôt ; pour F-T, c'est justement lui qu'on mute.
    const garde = GARDES[mutation.garde || 'reset'];
    let detectee = false, resume = '';
    try {
      execFileSync(process.execPath, [path.join(copie, 'tests', garde)],
        { env: Object.assign({}, process.env, { RACINE_TOURNOI_R92: copie }), encoding: 'utf8' });
    } catch (e) {
      const sortie = String(e.stdout || '');
      const lignesEchec = sortie.split('\n')
        .filter((l) => l.indexOf('ÉCHEC') !== -1 && l.indexOf('Échecs :') === -1)
        .map((l) => l.trim());
      // ⚠️ UN PLANTAGE N'EST PAS UNE DÉTECTION, et ce contrôle a déjà servi : une fois, un
      //    fichier manquant dans la copie faisait planter le garde-fou à CHAQUE mutation —
      //    « 10/10 détectées » ne prouvait alors strictement rien. On exige donc au moins une
      //    ligne ÉCHEC, c'est-à-dire une assertion qui a VRAIMENT mordu.
      if (!lignesEchec.length) {
        throw new Error('Le garde-fou a planté au lieu d\'échouer sur une assertion — la ' +
          'mutation « ' + mutation.nom + ' » ne prouve RIEN.\n' + sortie.slice(-1200) +
          String(e.stderr || '').slice(-1200));
      }
      detectee = true;
      resume = lignesEchec.slice(0, 3).join('\n        ');
    }

    console.log((detectee ? '  DÉTECTÉE      ' : '  ⛔ PASSÉE      ') + mutation.nom);
    console.log('        ce qu\'elle ferait : ' + mutation.defaut);
    if (resume) console.log('        ' + resume);
    if (!detectee) nonDetectees++;
    console.log('');
  }
} finally {
  fs.rmSync(base, { recursive: true, force: true });
}

console.log('==============================================');
console.log('Mutations : ' + (MUTATIONS.length - nonDetectees) + '/' + MUTATIONS.length +
  ' détectées, ' + nonDetectees + ' passée(s) inaperçue(s)');
console.log('==============================================');
process.exit(nonDetectees ? 1 : 0);
