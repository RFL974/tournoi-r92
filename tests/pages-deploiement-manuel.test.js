/**
 * ============================================================================
 *  GARDE-FOU — POUSSER N'EST PAS PUBLIER
 *  Séparation entre le push GitHub et le déploiement GitHub Pages
 * ============================================================================
 *
 *  ▶ Pour lancer :  node tests/pages-deploiement-manuel.test.js
 *    (aucune dépendance, aucun réseau, aucun appel GitHub — Node seul)
 *
 *  CE QU'IL PROTÈGE.
 *
 *  `.github/workflows/pages.yml` publiait le dossier `frontend/` À CHAQUE POUSSÉE sur
 *  `main` touchant `frontend/**` ou lui-même. ⛔ Décider d'enregistrer du travail sur
 *  GitHub revenait donc à décider de le mettre EN LIGNE — deux gestes très différents,
 *  confondus en un seul, et un seul « oui » pour les deux.
 *
 *  ⭐ LE CONTRAT QU'IL FIGE :
 *
 *    | Événement                            | Vérifications | Déploiement |
 *    |--------------------------------------|---------------|-------------|
 *    | Push sur `main`                      |      oui      |     NON     |
 *    | Pull request                         |      oui      |     NON     |
 *    | Déclenchement manuel, autre branche  |      oui      |     NON     |
 *    | Déclenchement manuel sur `main`      |      oui      |     OUI     |
 *
 *  ⚠️ IL NE CHERCHE PAS UNE CHAÎNE, ET C'EST TOUTE SA VALEUR. Un contrôle qui se
 *  contenterait de chercher « workflow_dispatch » dans le fichier serait satisfait par
 *  un commentaire, ou par une condition inversée. ⭐ Celui-ci LIT la structure du YAML,
 *  EXTRAIT la condition réelle du job `deploy`, puis l'ÉVALUE sur quatre contextes
 *  d'exécution simulés. C'est le comportement qui est prouvé, pas le texte.
 *
 *  ⛔ ET IL ÉCHOUE FERMÉ : une expression qu'il ne sait pas traduire fidèlement fait
 *  ÉCHOUER le contrôle, elle n'est jamais supposée bénigne.
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = process.env.RACINE_TOURNOI_R92 || path.join(__dirname, '..');
const CHEMIN = path.join(RACINE, '.github/workflows/pages.yml');
const SOURCE = fs.readFileSync(CHEMIN, 'utf8');

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
/*  UN LECTEUR YAML MINIMAL — par INDENTATION, ⛔ pas par expressions régulières */
/*                                                                            */
/*  ⚠️ Il ne prétend pas lire tout le YAML : il lit CE fichier, dont la forme  */
/*  est simple (mappings, séquences, scalaires sur une ligne). ⭐ Ce qui compte */
/*  est qu'il suive la STRUCTURE — « la clé `if` DU JOB `deploy` » — là où une */
/*  expression régulière attraperait n'importe quel `if:` du fichier.          */
/* ========================================================================== */

/** Retire un commentaire de fin de ligne, en respectant les guillemets. */
function sansCommentaire(ligne) {
  let dansSimple = false, dansDouble = false;
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];
    if (c === "'" && !dansDouble) dansSimple = !dansSimple;
    else if (c === '"' && !dansSimple) dansDouble = !dansDouble;
    else if (c === '#' && !dansSimple && !dansDouble) return ligne.slice(0, i);
  }
  return ligne;
}

/** Les lignes utiles : ni vides, ni entièrement en commentaire. */
function lignesUtiles(source) {
  const out = [];
  source.split('\n').forEach((brute, i) => {
    const nue = sansCommentaire(brute).replace(/\s+$/, '');
    if (nue.trim() === '') return;
    out.push({ n: i + 1, indent: nue.length - nue.replace(/^ +/, '').length, texte: nue.trim() });
  });
  return out;
}

/**
 * Analyse en arbre. Un nœud : { valeur, enfants:{clé→nœud}, liste:[nœud] }.
 * ⛔ Aucune dépendance : c'est la contrainte du projet, et elle est tenue.
 */
function analyser(lignes, depart, indentParent) {
  const noeud = { valeur: null, enfants: {}, liste: [], ligne: 0 };
  let i = depart;
  while (i < lignes.length) {
    const l = lignes[i];
    if (l.indent <= indentParent) break;
    if (l.texte.startsWith('- ')) {
      const contenu = l.texte.slice(2).trim();
      const item = { valeur: null, enfants: {}, liste: [], ligne: l.n };
      const paire = /^([A-Za-z_][\w.-]*):\s*(.*)$/.exec(contenu);
      if (paire) {
        item.enfants[paire[1]] = { valeur: paire[2] === '' ? null : paire[2],
                                   enfants: {}, liste: [], ligne: l.n };
        // les clés suivantes du même élément sont indentées comme « - » + 2
        const sous = analyser(lignes, i + 1, l.indent + 1);
        Object.keys(sous.enfants).forEach((k) => { item.enfants[k] = sous.enfants[k]; });
        i = sous.fin;
      } else {
        item.valeur = contenu;
        i++;
      }
      noeud.liste.push(item);
      continue;
    }
    const paire = /^([A-Za-z_][\w.-]*):\s*(.*)$/.exec(l.texte);
    if (!paire) { i++; continue; }
    const cle = paire[1], reste = paire[2];
    const sous = analyser(lignes, i + 1, l.indent);
    sous.valeur = reste === '' ? null : reste;
    sous.ligne = l.n;
    noeud.enfants[cle] = sous;
    i = sous.fin;
  }
  noeud.fin = i;
  return noeud;
}

const LIGNES = lignesUtiles(SOURCE);
const ARBRE = analyser(LIGNES, 0, -1);

/** Descend dans l'arbre par un chemin de clés. `null` si absent — ⛔ jamais d'exception. */
function noeud(racine, chemin) {
  let n = racine;
  for (let i = 0; i < chemin.length; i++) {
    if (!n || !n.enfants[chemin[i]]) return null;
    n = n.enfants[chemin[i]];
  }
  return n;
}
function valeur(racine, chemin) { const n = noeud(racine, chemin); return n ? n.valeur : null; }
function items(racine, chemin) { const n = noeud(racine, chemin); return n ? n.liste : []; }

/** Un scalaire YAML, débarrassé de ses guillemets et de ses espaces.
 *  ⚠️ Point de passage UNIQUE : les `paths` sont écrits `- 'frontend/**'`, guillemets compris.
 *  Comparer la valeur BRUTE marchait dans un contrôle et pas dans l'autre — c'est exactement
 *  le genre d'écart qui fait échouer un banc sur du code sain. */
function scalaire(v) {
  return String(v === undefined || v === null ? '' : v).trim().replace(/^['"]|['"]$/g, '');
}
/** Les éléments d'une séquence, en scalaires normalisés. */
function listeScalaires(racine, chemin) { return items(racine, chemin).map((x) => scalaire(x.valeur)); }

/* ========================================================================== */
/*  L'ÉVALUATEUR DE CONDITION — ⭐ le cœur de ce banc                          */
/*                                                                            */
/*  Il traduit l'expression GitHub Actions en JavaScript, puis l'exécute dans  */
/*  un bac vide. ⛔ Seuls les jetons INVENTORIÉS sont acceptés : tout le reste  */
/*  fait ÉCHOUER le contrôle plutôt que d'être supposé inoffensif.             */
/* ========================================================================== */

const JETONS_AUTORISES = [
  { motif: /^github\.event_name\b/, rendu: (m, ctx) => JSON.stringify(ctx.event_name) },
  { motif: /^github\.ref\b/,        rendu: (m, ctx) => JSON.stringify(ctx.ref) },
  { motif: /^'[^']*'/,              rendu: (m) => JSON.stringify(m.slice(1, -1)) },
  { motif: /^"[^"]*"/,              rendu: (m) => JSON.stringify(m.slice(1, -1)) },
  { motif: /^==/,                   rendu: () => '===' },
  { motif: /^!=/,                   rendu: () => '!==' },
  { motif: /^&&/,                   rendu: () => '&&' },
  { motif: /^\|\|/,                 rendu: () => '||' },
  { motif: /^!/,                    rendu: () => '!' },
  { motif: /^\(/,                   rendu: () => '(' },
  { motif: /^\)/,                   rendu: () => ')' },
  { motif: /^\s+/,                  rendu: () => ' ' }
];

/**
 * Évalue la condition d'un job pour un contexte donné.
 * @return {{valeur:boolean}|{error:string}}  ⛔ jamais un booléen deviné.
 */
function evaluerCondition(expression, contexte) {
  let reste = String(expression == null ? '' : expression).trim();
  // GitHub accepte `${{ … }}` autour de la condition : on l'ôte avant de lire.
  const enveloppe = /^\$\{\{([\s\S]*)\}\}$/.exec(reste);
  if (enveloppe) reste = enveloppe[1].trim();
  if (reste === '') return { error: 'condition vide' };

  let js = '';
  while (reste.length) {
    let trouve = null;
    for (let i = 0; i < JETONS_AUTORISES.length && !trouve; i++) {
      const m = JETONS_AUTORISES[i].motif.exec(reste);
      if (m) trouve = { rendu: JETONS_AUTORISES[i].rendu(m[0], contexte), taille: m[0].length };
    }
    if (!trouve) {
      return { error: 'jeton non reconnu à « ' + reste.slice(0, 30) + '… » — ⛔ ce banc ne ' +
        'suppose JAMAIS qu\'une expression qu\'il ne sait pas lire est inoffensive' };
    }
    js += trouve.rendu;
    reste = reste.slice(trouve.taille);
  }
  let r;
  try { r = vm.runInNewContext(js, Object.create(null), { timeout: 500 }); }
  catch (e) { return { error: 'expression illisible : ' + e.message }; }
  if (typeof r !== 'boolean') return { error: 'l\'expression ne rend pas un booléen' };
  return { valeur: r };
}

/** Les quatre contextes d'exécution du contrat. */
const CONTEXTES = [
  { nom: 'push sur `main`',                     ctx: { event_name: 'push', ref: 'refs/heads/main' },              deploie: false },
  { nom: 'pull request',                        ctx: { event_name: 'pull_request', ref: 'refs/pull/12/merge' },   deploie: false },
  { nom: 'déclenchement manuel, AUTRE branche', ctx: { event_name: 'workflow_dispatch', ref: 'refs/heads/travaux' }, deploie: false },
  { nom: 'déclenchement manuel sur `main`',     ctx: { event_name: 'workflow_dispatch', ref: 'refs/heads/main' }, deploie: true }
];

/**
 * Le contrat, éprouvé sur une source de workflow donnée.
 * ⭐ Rend la liste des écarts — vide = conforme. C'est ce qui permet de la rejouer sur
 * des copies MUTÉES sans dupliquer une ligne de logique.
 */
function ecartsDuContrat(source) {
  const ecarts = [];
  let arbre;
  try { arbre = analyser(lignesUtiles(source), 0, -1); }
  catch (e) { return ['le workflow est illisible : ' + e.message]; }

  // ① Les vérifications restent déclenchées.
  const push = noeud(arbre, ['on', 'push']);
  if (!push) ecarts.push('le déclencheur `push` a disparu');
  else {
    const branches = listeScalaires(push, ['branches'])
      .concat(scalaire(valeur(push, ['branches'])).replace(/[[\]]/g, '').split(',')
        .map((x) => scalaire(x)).filter(Boolean));
    if (branches.indexOf('main') === -1) ecarts.push('le `push` ne surveille plus `main`');
    const chemins = listeScalaires(push, ['paths']);
    if (chemins.indexOf('frontend/**') === -1) ecarts.push('le `push` ne surveille plus `frontend/**`');
    if (chemins.indexOf('.github/workflows/pages.yml') === -1) {
      ecarts.push('le `push` ne surveille plus le workflow lui-même');
    }
  }
  const pr = noeud(arbre, ['on', 'pull_request']);
  if (!pr) ecarts.push('le déclencheur `pull_request` a disparu — les PR ne sont plus vérifiées');
  else {
    const chemins = listeScalaires(pr, ['paths']);
    if (chemins.indexOf('frontend/**') === -1) ecarts.push('la `pull_request` ne surveille plus `frontend/**`');
    if (chemins.indexOf('tests/**') === -1) ecarts.push('la `pull_request` ne surveille plus `tests/**`');
  }
  if (!noeud(arbre, ['on', 'workflow_dispatch'])) {
    ecarts.push('`workflow_dispatch` a disparu — ⛔ plus aucun moyen de publier');
  }

  // ② Le job `deploy` : ses trois verrous.
  const deploy = noeud(arbre, ['jobs', 'deploy']);
  if (!deploy) return ecarts.concat(['le job `deploy` a disparu']);
  if (scalaire(valeur(deploy, ['needs'])) !== 'verifier') {
    ecarts.push('`deploy` ne dépend plus de `verifier` (needs = « ' +
      valeur(deploy, ['needs']) + ' »)');
  }
  const condition = valeur(deploy, ['if']);
  if (!condition) return ecarts.concat(['`deploy` n\'a plus de condition — il se déclenche TOUJOURS']);

  // ③ ⭐ LA PREUVE COMPORTEMENTALE : on ÉVALUE la condition sur les quatre événements.
  CONTEXTES.forEach((c) => {
    const r = evaluerCondition(condition, c.ctx);
    if (r.error) { ecarts.push('condition inévaluable pour « ' + c.nom + ' » : ' + r.error); return; }
    if (r.valeur !== c.deploie) {
      ecarts.push('« ' + c.nom + ' » ' + (r.valeur ? 'DÉPLOIE' : 'ne déploie pas') +
        ' alors qu\'il ' + (c.deploie ? 'devrait déployer' : 'NE DOIT PAS déployer'));
    }
  });

  // ④ L'action réelle et les permissions.
  const etapes = items(deploy, ['steps']).map((e) => String((e.enfants.uses || {}).valeur || ''));
  if (!etapes.some((u) => /^actions\/deploy-pages@/.test(u))) {
    ecarts.push('l\'action `actions/deploy-pages` a disparu du job de déploiement');
  }
  const permJob = noeud(deploy, ['permissions']);
  if (!permJob || scalaire(valeur(permJob, ['pages'])) !== 'write') {
    ecarts.push('`pages: write` n\'est plus déclaré DANS le job `deploy`');
  }
  const permGlobale = noeud(arbre, ['permissions']);
  if (permGlobale && valeur(permGlobale, ['pages'])) {
    ecarts.push('⛔ `pages: write` est remonté au NIVEAU DU WORKFLOW — tous les jobs y auraient droit');
  }
  if (permGlobale && valeur(permGlobale, ['id-token'])) {
    ecarts.push('⛔ `id-token` est remonté au niveau du workflow');
  }
  const verifier2 = noeud(arbre, ['jobs', 'verifier']);
  if (verifier2 && noeud(verifier2, ['permissions'])) {
    ecarts.push('⛔ le job `verifier` s\'est vu accorder des permissions propres');
  }
  return ecarts;
}

console.log('==================================================');
console.log('  Pages — pousser n\'est pas publier');
console.log('==================================================');

/* ========================================================================== */
/*  SÉRIE A — LE CONTRAT, SUR LE WORKFLOW RÉEL                                */
/* ========================================================================== */

titre('A — les déclencheurs de VÉRIFICATION sont intacts');

(function A_declencheurs() {
  const push = noeud(ARBRE, ['on', 'push']);
  const cheminsPush = listeScalaires(push, ['paths']);
  verifier(!!push && cheminsPush.indexOf('frontend/**') !== -1 &&
    cheminsPush.indexOf('.github/workflows/pages.yml') !== -1,
    'A1 : le `push` surveille toujours `frontend/**` et le workflow lui-même (' +
      cheminsPush.join(', ') + ')');
  verifier(scalaire(valeur(push, ['branches'])).indexOf('main') !== -1,
    'A2 : et il surveille toujours la branche `main`');

  const pr = noeud(ARBRE, ['on', 'pull_request']);
  const cheminsPr = listeScalaires(pr, ['paths']);
  verifier(!!pr && cheminsPr.indexOf('frontend/**') !== -1 && cheminsPr.indexOf('tests/**') !== -1,
    'A3 : une pull request lance toujours les vérifications (' + cheminsPr.join(', ') + ')');
  verifier(!!noeud(ARBRE, ['on', 'workflow_dispatch']),
    'A4 : `workflow_dispatch` existe — ⭐ c\'est désormais la SEULE porte de publication');
})();

titre('B — le job `deploy` et ses trois verrous');

(function B_verrous() {
  const deploy = noeud(ARBRE, ['jobs', 'deploy']);
  verifier(!!deploy, 'B1 : le job `deploy` existe');
  verifier(scalaire(valeur(deploy, ['needs'])) === 'verifier',
    'B2 ⭐ : il dépend TOUJOURS de `verifier` — le verrou de C-013 est conservé');

  const condition = valeur(deploy, ['if']);
  console.log('        condition lue : ' + condition);
  verifier(/workflow_dispatch/.test(condition),
    'B3 ⭐ : la condition exige un déclenchement MANUEL');
  verifier(/refs\/heads\/main/.test(condition),
    'B4 ⭐ : et elle exige précisément `refs/heads/main`');
  verifier(!/!=\s*'pull_request'/.test(condition),
    'B5 ⭐⭐ : ⛔ l\'ancienne condition « tout sauf une PR » a bien DISPARU');
})();

titre('C — LA PREUVE : la condition ÉVALUÉE sur les quatre événements');

(function C_evaluation() {
  const condition = valeur(noeud(ARBRE, ['jobs', 'deploy']), ['if']);
  CONTEXTES.forEach((c) => {
    const r = evaluerCondition(condition, c.ctx);
    verifier(!r.error && r.valeur === c.deploie,
      'C · ' + c.nom.padEnd(38) + ' ⇒ ' +
      (r.error ? '⛔ ' + r.error : (r.valeur ? 'DÉPLOIE' : 'ne déploie pas')) +
      '   (attendu : ' + (c.deploie ? 'DÉPLOIE' : 'ne déploie pas') + ')');
  });
})();

titre('D — l\'action réelle et les permissions');

(function D_actionEtPermissions() {
  const deploy = noeud(ARBRE, ['jobs', 'deploy']);
  const etapes = items(deploy, ['steps']).map((e) => String((e.enfants.uses || {}).valeur || ''));
  verifier(etapes.some((u) => /^actions\/deploy-pages@/.test(u)),
    'D1 : l\'action réelle `actions/deploy-pages` est toujours là (' +
      etapes.filter(Boolean).join(', ') + ')');
  verifier(etapes.some((u) => /^actions\/upload-pages-artifact@/.test(u)) &&
    etapes.some((u) => /^actions\/configure-pages@/.test(u)),
    'D2 : la chaîne de publication est complète (configure + upload + deploy)');
  verifier(scalaire(valeur(deploy, ['environment', 'name'])) === 'github-pages',
    'D3 : l\'environnement `github-pages` est conservé');

  verifier(scalaire(valeur(deploy, ['permissions', 'pages'])) === 'write' &&
    scalaire(valeur(deploy, ['permissions', 'id-token'])) === 'write',
    'D4 ⭐ : `pages: write` et `id-token: write` vivent DANS le job de déploiement');
  const globale = noeud(ARBRE, ['permissions']);
  verifier(!!globale && scalaire(valeur(globale, ['contents'])) === 'read' &&
    !valeur(globale, ['pages']) && !valeur(globale, ['id-token']),
    'D5 ⭐⭐ : ⛔ au niveau du workflow, RIEN d\'autre que `contents: read`');
  verifier(!noeud(ARBRE, ['jobs', 'verifier', 'permissions']),
    'D6 ⭐ : le job `verifier` n\'a AUCUNE permission propre — il ne peut pas publier');
})();

titre('E — le workflow réel est conforme, en un seul contrôle');

(function E_contratComplet() {
  const ecarts = ecartsDuContrat(SOURCE);
  verifier(ecarts.length === 0,
    'E ⭐⭐ : aucun écart au contrat' + (ecarts.length ? ' — ' + ecarts.join(' ; ') : ''));
})();

/* ========================================================================== */
/*  SÉRIE M — LES MUTATIONS : ce garde-fou mord-il ?                          */
/* ========================================================================== */

titre('M — on abîme le workflow dans une copie, et le banc doit le voir');

const MUTATIONS = [
  {
    nom: 'M1 · le contrôle `workflow_dispatch` est retiré de la condition',
    de: "    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'",
    vers: "    if: github.ref == 'refs/heads/main'"
  },
  {
    nom: 'M2 · retour de l\'ancienne condition « tout sauf une pull request »',
    de: "    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'",
    vers: "    if: github.event_name != 'pull_request'"
  },
  {
    nom: 'M3 · le contrôle sur `refs/heads/main` est supprimé',
    de: "    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'",
    vers: "    if: github.event_name == 'workflow_dispatch'"
  },
  {
    nom: 'M4 · `main` est remplacé par une autre branche',
    de: "    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'",
    vers: "    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/preprod'"
  },
  {
    nom: 'M5 · `needs: verifier` est supprimé (la publication double le contrôle)',
    de: "    needs: verifier                              # ⬅️ le verrou de C-013",
    vers: "    # needs retiré"
  },
  {
    nom: 'M6 · le déploiement est ré-autorisé lors d\'un push',
    de: "    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'",
    vers: "    if: (github.event_name == 'workflow_dispatch' || github.event_name == 'push') && " +
          "github.ref == 'refs/heads/main'"
  },
  {
    nom: 'M7 · l\'action `actions/deploy-pages` disparaît',
    de: "        uses: actions/deploy-pages@v4",
    vers: "        run: echo 'publication silencieusement supprimée'"
  },
  {
    nom: 'M8 · `pages: write` remonte au niveau du workflow (tous les jobs y ont droit)',
    de: "permissions:\n  contents: read",
    vers: "permissions:\n  contents: read\n  pages: write"
  },
  {
    nom: 'M9 · la condition devient une expression que le banc ne sait pas lire',
    de: "    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'",
    vers: "    if: startsWith(github.ref, 'refs/heads/')"
  },
  {
    nom: 'M10 · le déclencheur `pull_request` est retiré (les PR ne sont plus vérifiées)',
    de: "  pull_request:",
    vers: "  pull_request_target_desactive:"
  }
];

MUTATIONS.forEach((m) => {
  if (SOURCE.indexOf(m.de) === -1) {
    verifier(false, m.nom + ' — ⛔ ancre INTROUVABLE dans pages.yml : mets la mutation à jour');
    return;
  }
  const ecarts = ecartsDuContrat(SOURCE.replace(m.de, m.vers));
  verifier(ecarts.length > 0, m.nom + ' — détectée par ' + ecarts.length + ' contrôle(s)');
  if (ecarts.length) console.log('        ↳ ' + ecarts[0]);
});

/* ⭐ LE CONTRÔLE DU CONTRÔLE : sur le workflow RÉEL, aucun écart ne doit être signalé. */
verifier(ecartsDuContrat(SOURCE).length === 0,
  'M-FIN ⭐ : sur le workflow réel, ⛔ aucun faux positif');

/* ========================================================================== */

console.log('\n==================================================');
console.log('Pages manuel — ' + etat.ok + '/' + etat.total + ' OK, ' + etat.fail + ' ÉCHEC(S)');
console.log('==================================================');
if (etat.fail) { etat.echecs.forEach((e) => console.log('  ÉCHEC ' + e)); process.exit(1); }
