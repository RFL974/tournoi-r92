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
    // ⭐ CELLE-CI NE MUTE PAS LE PRODUIT, MAIS LE MODÈLE DU TEST — et c'est le seul cas où
    //   c'est légitime : un faux serveur infidèle rend TOUTES les autres preuves creuses.
    //   Le défaut est réel, il a existé : le faux état frais renvoyait `club_token: ''`, plus
    //   vide que la réalité. Ici on va plus loin — le faux serveur RECYCLE l'ancien jeton.
    nom: 'F-T — le faux état frais RÉUTILISE l\'ancien jeton (modèle infidèle)',
    defaut: 'le garde-fou validerait un contrat que le vrai serveur ne respecte pas',
    appliquer: (b) => remplacer(b, 'tests/frontend-reinitialisation.test.js',
      '    club_token: NOUVEAU_JETON\n', '    club_token: ANCIEN_JETON\n')
  }
];

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
    // ⚠️ Le garde-fou est copié LUI AUSSI : sans cela, la mutation F-T — qui porte sur le
    //    MODÈLE du test, pas sur le produit — n'aurait aucun endroit où s'appliquer.
    for (const f of ['frontend/js/admin.js', 'frontend/js/admin-invitations.js',
                     'tests/frontend-reinitialisation.test.js']) {
      fs.copyFileSync(path.join(RACINE, f), path.join(copie, f));
    }

    mutation.appliquer(copie);

    // ⭐ On lance le garde-fou tel qu'il est dans la COPIE, contre la copie : pour les mutations
    //   de produit il est identique à celui du dépôt ; pour F-T, c'est justement lui qu'on mute.
    let detectee = false, resume = '';
    try {
      execFileSync(process.execPath, [path.join(copie, 'tests', 'frontend-reinitialisation.test.js')],
        { env: Object.assign({}, process.env, { RACINE_TOURNOI_R92: copie }), encoding: 'utf8' });
    } catch (e) {
      detectee = true;
      resume = String(e.stdout || '').split('\n')
        .filter((l) => l.indexOf('ÉCHEC') !== -1 && l.indexOf('Échecs :') === -1)
        .map((l) => l.trim()).slice(0, 3).join('\n        ');
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
