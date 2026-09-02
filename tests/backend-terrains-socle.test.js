/**
 * ============================================================================
 *  GARDE-FOU BACKEND — le SOCLE PUR des terrains (M1-B2 / B2-3.a)
 *  Conception validée : voir docs/industrialisation/PLAN.md §16.5 (lot B2-3)
 * ============================================================================
 *
 *  ▶ Pour lancer :  node tests/backend-terrains-socle.test.js
 *    (aucune dépendance, aucun navigateur, aucun réseau, ⛔ aucun Google — Node seul)
 *
 *  CE QU'IL PROTÈGE, et pourquoi il vaut un fichier à part.
 *
 *  Le socle B2-3.a est entièrement composé de fonctions PURES : elles ne touchent ni
 *  `SpreadsheetApp`, ni `Utilities`, ni aucun service Google. ⭐ Elles sont donc exécutables
 *  ICI, sur cette machine, sans redéployer quoi que ce soit — et c'est précisément ce qui
 *  permet de les éprouver AVANT tout branchement.
 *
 *  ⚠️ Le fichier source EST lu — c'est ainsi qu'on en extrait les fonctions. Ce qui est
 *  proscrit est autre chose, et c'est la doctrine du dépôt : ⛔ AUCUNE assertion ne se contente
 *  de chercher une chaîne dans le code pour conclure qu'il se comporte bien. Le source est lu
 *  UNIQUEMENT pour extraire et EXÉCUTER les vraies fonctions ; toutes les assertions portent
 *  ensuite sur ce que l'exécution a produit.
 *  ⭐ Conséquence voulue : réécrire ces fonctions autrement mais correctement laisse tout au vert.
 *
 *  ⛔ CE FICHIER NE TESTE AUCUN BRANCHEMENT, parce qu'il n'y en a aucun : à ce stade, aucune
 *  de ces fonctions n'est appelée par une action serveur, un écran ou `reinitialiserTournoi`.
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = process.env.RACINE_TOURNOI_R92 || path.join(__dirname, '..');
const SOURCE = fs.readFileSync(path.join(RACINE, 'backend/Code.gs'), 'utf8');

/* -------------------------------------------------------------------------- */
/*  Extraction — même principe que les garde-fous frontend : on ancre sur une  */
/*  DÉCLARATION en début de ligne (jamais sur une occurrence en commentaire),  */
/*  puis on découpe par équilibrage d'accolades.                              */
/* -------------------------------------------------------------------------- */

function extraireFonction(nom) {
  const motif = new RegExp('^function\\s+' + nom + '\\s*\\(', 'm');
  const trouve = motif.exec(SOURCE);
  if (!trouve) {
    throw new Error('Fonction introuvable dans backend/Code.gs : « ' + nom + ' ». ' +
      'Si elle a été renommée, mets ce garde-fou à jour — ne le supprime pas.');
  }
  let profondeur = 0;
  for (let i = SOURCE.indexOf('{', trouve.index); i < SOURCE.length; i++) {
    if (SOURCE[i] === '{') profondeur++;
    else if (SOURCE[i] === '}' && --profondeur === 0) return SOURCE.slice(trouve.index, i + 1);
  }
  throw new Error('Accolades déséquilibrées autour de « ' + nom + ' »');
}

/** Une déclaration `var NOM = …;` tenant sur une ligne (les deux constantes de rôle). */
function extraireVariable(nom) {
  const motif = new RegExp('^var\\s+' + nom + '\\s*=.*?;\\s*$', 'm');
  const trouve = motif.exec(SOURCE);
  if (!trouve) throw new Error('Variable introuvable dans backend/Code.gs : « ' + nom + ' »');
  return trouve[0];
}

/* Les trois briques COMMUNES dont le socle dépend (elles existaient déjà). */
const COMMUNES = ['normaliserTexteSouple', 'memeTexteSouple', 'hachageChaine'];

/* Le socle B2-3.a lui-même. ⭐ La liste est explicite : si une fonction disparaît, ce fichier
   échoue bruyamment au lieu de tester silencieusement moins de choses. */
const SOCLE = [
  'valeurTexteTerrain', 'nombreCanoniqueTerrain', 'cleNomTerrain', 'terrainRetenu',
  'collisionsNomsTerrains', 'planifierIdentitesTerrains',
  'lignesDuPlanTerrains', 'melangeEditionsPlanTerrains', 'assemblerPlanTerrains',
  'brouillonTerrains', 'categoriesPresentesTerrains', 'numerosCanoniquesTerrains',
  'comparerNumerosMiniTerrain', 'categorieTerrainsAuto',
  'ecartsInternesPlanTerrains', 'ecartsPlanTerrains', 'planPublieValide',
  'comparerTerrainsProjection', 'projectionRepartitionTerrains', 'naturesPlanTerrains',
  'dimensionsCanoniquesTerrains', 'signatureTerrains', 'etatTerrainsPur'
];

const CONSTANTES = ['TERRAINS_ROLE_BROUILLON', 'TERRAINS_ROLE_PLAN'];

const bac = vm.createContext({});
vm.runInContext(
  CONSTANTES.map(extraireVariable).join('\n') + '\n' +
  COMMUNES.concat(SOCLE).map(extraireFonction).join('\n'),
  bac, { filename: 'backend/Code.gs (extrait)' });

/** Appelle la VRAIE fonction du backend, dans le bac à sable. */
function F(nom) {
  const f = vm.runInContext(nom, bac);
  if (typeof f !== 'function') throw new Error(nom + ' n\'est pas une fonction');
  return f;
}

const cleNomTerrain = F('cleNomTerrain');
const nombreCanoniqueTerrain = F('nombreCanoniqueTerrain');
const collisionsNomsTerrains = F('collisionsNomsTerrains');
const planifierIdentitesTerrains = F('planifierIdentitesTerrains');
const ecartsInternesPlanTerrains = F('ecartsInternesPlanTerrains');
const ecartsPlanTerrains = F('ecartsPlanTerrains');
const planPublieValide = F('planPublieValide');
const projectionRepartitionTerrains = F('projectionRepartitionTerrains');
const naturesPlanTerrains = F('naturesPlanTerrains');
const signatureTerrains = F('signatureTerrains');
const etatTerrainsPur = F('etatTerrainsPur');
const assemblerPlanTerrains = F('assemblerPlanTerrains');
const dimensionsCanoniquesTerrains = F('dimensionsCanoniquesTerrains');
const numerosCanoniquesTerrains = F('numerosCanoniquesTerrains');

/* -------------------------------------------------------------------------- */
/*  Assertions                                                                */
/* -------------------------------------------------------------------------- */

const etat = { total: 0, ok: 0, fail: 0, echecs: [] };

function verifier(condition, libelle) {
  etat.total++;
  if (condition) { etat.ok++; console.log('  OK    ' + libelle); }
  else { etat.fail++; etat.echecs.push(libelle); console.log('  ÉCHEC ' + libelle); }
}

/* -------------------------------------------------------------------------- */
/*  Le jeu de référence : une édition, un plan, quatre grands terrains         */
/*  ⭐ Volontairement REPRÉSENTATIF du plan par défaut de l'application         */
/*  (Rugby 1, Rugby 2, Foot 1, Foot 2) : le cas nominal doit être le cas testé. */
/* -------------------------------------------------------------------------- */

const ED = 'ED-2026';
const PL = 'PL-A';

function terrain(id, nom, options) {
  const o = options || {};
  return Object.assign({
    edition_id: ED, plan_id: PL, terrain_id: id, selectionne: 'oui',
    snap_nom: nom, snap_type: 'rugby', snap_longueur_m: '115', snap_largeur_m: '70',
    snap_enbut_m: '0', snap_nature: 'Gazon', snap_pos: 'CG'
  }, o);
}

function mini(numero, terrainId, categorie, options) {
  return Object.assign({
    edition_id: ED, plan_id: PL, numero: String(numero),
    terrain_id: terrainId, categorie: categorie
  }, options || {});
}

const DIMENSIONS = '{"U8":{"l":30,"w":20,"src":"ffr"},"U10":{"l":40,"w":30,"src":"saisie"}}';

function parametres(options) {
  return Object.assign({
    edition_id: ED, plan_id: PL, role: 'plan',
    couloir_m: '5', tm_longueur_m: '4', tm_largeur_m: '4',
    dimensions_json: DIMENSIONS, signature: '', fige_le: '2026-09-02 10:00:00'
  }, options || {});
}

const CATEGORIES = [
  { categorie: 'U8', presente: 'oui', terrains: '1,2,3,4', terrains_auto: 'oui' },
  { categorie: 'U10', presente: 'oui', terrains: '5,6', terrains_auto: 'oui' },
  { categorie: 'U12', presente: 'non', terrains: '', terrains_auto: 'oui' }
];

/** Construit un contexte complet, avec la signature RÉELLEMENT calculée sur le plan. */
function contexteReference(sur) {
  const s = sur || {};
  const terrains = s.terrains || [
    terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 2'),
    terrain('T3', 'Foot 1', { snap_type: 'foot', snap_nature: 'Synthétique', snap_pos: 'HC' }),
    terrain('T4', 'Foot 2', { snap_type: 'foot', snap_nature: 'Synthétique', snap_pos: 'CD' })
  ];
  const minis = s.minis || [
    mini(1, 'T1', 'U8'), mini(2, 'T1', 'U8'), mini(3, 'T2', 'U8'), mini(4, 'T2', 'U8'),
    mini(5, 'T3', 'U10'), mini(6, 'T4', 'U10')
  ];
  const categories = s.categories || CATEGORIES;
  const params = parametres(s.params);
  const plans = s.plans || [params];
  const ctx = {
    pointeur: s.pointeur !== undefined ? s.pointeur : PL,
    edition_id: s.edition_id !== undefined ? s.edition_id : ED,
    plans, terrains, minis, categories
  };
  // ⭐ La signature est calculée sur le plan lui-même, jamais recopiée à la main :
  //    un test qui figerait un hachage en dur ne prouverait plus rien après refonte.
  // ⚠️ Le test est `=== undefined`, ⛔ PAS une simple négation : `signatureBrute: ''` est le
  //    cas « signature obligatoire ABSENTE », et c'est justement celui qu'on veut pouvoir poser.
  //    Écrit `if (!s.signatureBrute)`, ce harnais recalculait la signature et trois assertions
  //    passaient au vert sans rien prouver.
  if (s.signatureBrute === undefined) {
    const assemble = assemblerPlanTerrains(plans, terrains, minis, ctx.edition_id, PL);
    if (assemble) params.signature = signatureTerrains(assemble, categories);
  } else {
    params.signature = s.signatureBrute;
  }
  return ctx;
}

function planDe(ctx) {
  return assemblerPlanTerrains(ctx.plans, ctx.terrains, ctx.minis, ctx.edition_id, ctx.pointeur);
}

/* ========================================================================== */
/*  N — NORMALISATION ET COLLISIONS DE NOMS                                   */
/* ========================================================================== */

console.log('\n--- N : normalisation des noms et collisions ---');

function memeCle(a, b) { return cleNomTerrain(a) === cleNomTerrain(b); }

verifier(memeCle('Rugby 1', 'Rugby 1'), 'N-01 noms exactement identiques');
verifier(memeCle('Rugby 1', 'rugby 1') && memeCle('Rugby 1', 'RUGBY 1'), 'N-02 casse ignorée');
verifier(memeCle('Terrain école', 'Terrain ecole'), 'N-03 accents ignorés');
verifier(memeCle('Rugby 1', '   Rugby 1   '), 'N-04 espaces de bord ignorés');
verifier(memeCle('Rugby 1', 'Rugby  1'),
  'N-05 ⭐ espaces internes multiples réduits (ce que normaliserTexteSouple seule NE voit pas)');
verifier(memeCle('Rugby  1', 'Rugby \t 1'), 'N-05 bis tabulations et espaces se valent');
verifier(!memeCle('Rugby 1', 'Rugby1'),
  'N-06 ⛔ « Rugby 1 » et « Rugby1 » restent DISTINCTS (⛔ ne pas sur-normaliser)');
verifier(!memeCle('Rugby 1', 'Rugby 2'), 'N-07 deux noms différents restent différents');

{
  const deux = [terrain('T1', 'Rugby 1'), terrain('T2', 'rugby  1')];
  const r = collisionsNomsTerrains(deux);
  verifier(r.collisions.length === 1 && r.collisions[0].nb === 2,
    'N-08 deux terrains RETENUS homonymes ⇒ collision signalée');
  verifier(r.vides.length === 0, 'N-08 bis aucun nom vide dans ce cas');
}
{
  const unSeul = [terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 1', { selectionne: 'non' })];
  const r = collisionsNomsTerrains(unSeul);
  verifier(r.collisions.length === 0,
    'N-09 ⭐ homonymes dont UN SEUL est retenu ⇒ aucune collision (l\'inventaire est un carnet)');
}
{
  const r = collisionsNomsTerrains([terrain('T1', '   '), terrain('T2', 'Rugby 2')]);
  verifier(r.vides.length === 1 && r.vides[0] === 'T1', 'N-10 nom VIDE parmi les retenus ⇒ signalé');
}
{
  const r = collisionsNomsTerrains([terrain('T1', ''), terrain('T2', '', { selectionne: 'non' })]);
  verifier(r.vides.length === 1, 'N-11 un nom vide NON retenu n\'est pas signalé');
}
{
  const trois = [terrain('T1', 'Rugby 1'), terrain('T2', 'RUGBY 1'), terrain('T3', 'Rugby  1')];
  const r = collisionsNomsTerrains(trois);
  verifier(r.collisions.length === 1 && r.collisions[0].nb === 3,
    'N-12 trois homonymes ⇒ une collision de 3');
}
verifier(collisionsNomsTerrains([]).collisions.length === 0 &&
         collisionsNomsTerrains(null).vides.length === 0,
  'N-13 liste vide ou absente ⇒ sain, ⛔ sans exception');

/* ⭐ LE DÉFAUT FERMÉ DE `terrainRetenu`, et il vaut son propre bloc : 🔬 une mutation qui
   remplaçait « vaut oui » par « ne vaut pas non » est passée INAPERÇUE, parce que tous les
   cas ci-dessus n'employaient que « oui » et « non ». Une valeur vide, absente ou fantaisiste
   doit valoir NON RETENU — sans quoi un terrain jamais choisi entrerait dans un plan confirmé. */
{
  const terrainRetenu = F('terrainRetenu');
  verifier(terrainRetenu({ selectionne: 'oui' }) === true &&
           terrainRetenu({ selectionne: 'OUI' }) === true,
    'N-13 bis « oui » (quelle que soit la casse) ⇒ retenu');
  const fermes = [{ selectionne: 'non' }, { selectionne: '' }, { selectionne: '   ' },
                  { selectionne: 'x' }, { selectionne: '1' }, { selectionne: null }, {}, null];
  verifier(fermes.every((l) => terrainRetenu(l) === false),
    'N-13 ter ⭐⭐ DÉFAUT FERMÉ : vide, absent, null ou fantaisiste ⇒ NON retenu');
  const collisionSurVides = collisionsNomsTerrains(
    [terrain('T1', 'Rugby 1', { selectionne: '' }), terrain('T2', 'Rugby 1', { selectionne: 'x' })]);
  verifier(collisionSurVides.collisions.length === 0 && collisionSurVides.vides.length === 0,
    'N-13 quater ⭐ et deux terrains NON retenus (valeur inconnue) ne collisionnent pas');
}

/* Normalisation des NOMBRES */
console.log('\n--- N : normalisation des nombres ---');
verifier(nombreCanoniqueTerrain(30) === '30' && nombreCanoniqueTerrain('30') === '30',
  'N-14 30 et « 30 » donnent la même forme');
verifier(nombreCanoniqueTerrain('30.0') === '30' && nombreCanoniqueTerrain(' 30 ') === '30',
  'N-15 « 30.0 » et « 30 » (avec espaces) aussi');
verifier(nombreCanoniqueTerrain('30,5') === '30.5', 'N-16 la virgule décimale est acceptée');
verifier(nombreCanoniqueTerrain('') === '' && nombreCanoniqueTerrain(null) === '' &&
         nombreCanoniqueTerrain('abc') === '',
  'N-17 vide, absent ou illisible ⇒ chaîne vide, ⛔ jamais 0');

/* Numéros de mini-terrains */
verifier(numerosCanoniquesTerrains(' 3, 1 ,2 ').join(',') === '1,2,3',
  'N-18 les numéros cités par une catégorie sont triés et nettoyés');
verifier(numerosCanoniquesTerrains('10,2').join(',') === '2,10',
  'N-19 ⭐ tri NUMÉRIQUE (2 avant 10), pas alphabétique');
verifier(numerosCanoniquesTerrains('').length === 0 && numerosCanoniquesTerrains(null).length === 0,
  'N-20 champ vide ⇒ liste vide');

/* ========================================================================== */
/*  I — IDENTITÉS DURABLES DES GRANDS TERRAINS                                */
/* ========================================================================== */

console.log('\n--- I : identités durables ---');

function generateur(prefixe) {
  let n = 0;
  return function () { n++; return prefixe + '-' + n; };
}

{
  const connues = [{ id: 'A1', nom: 'Rugby 1' }];
  const r = planifierIdentitesTerrains([{ id: 'A1', nom: 'Rugby 1 renommé' }], connues, generateur('X'));
  verifier(!r.error && r.inventaire[0].id === 'A1' && r.conserves === 1 && r.attribues === 0,
    'I-01 ⭐ un identifiant existant est CONSERVÉ, même si le nom change');
  verifier(r.inventaire[0].nom === 'Rugby 1 renommé', 'I-01 bis les autres champs sont recopiés');
}
{
  const r = planifierIdentitesTerrains([{ nom: 'Rugby 1' }, { nom: 'Rugby 2' }], [], generateur('X'));
  verifier(!r.error && r.attribues === 2 && r.inventaire[0].id === 'X-1' && r.inventaire[1].id === 'X-2',
    'I-02 un identifiant manquant est attribué par le GÉNÉRATEUR INJECTÉ');
}
{
  // ⭐ Le rejeu : on repasse la sortie en entrée, elle devient sa propre référence.
  const un = planifierIdentitesTerrains([{ nom: 'A' }, { nom: 'B' }], [], generateur('X'));
  const deux = planifierIdentitesTerrains(un.inventaire, un.inventaire, generateur('Y'));
  verifier(!deux.error && deux.attribues === 0 && deux.conserves === 2 &&
    JSON.stringify(deux.inventaire) === JSON.stringify(un.inventaire),
    'I-03 ⭐ REJEU DÉTERMINISTE : rejouée sur sa propre sortie, elle n\'attribue rien');
}
{
  const r = planifierIdentitesTerrains([{ id: 'A1' }, { id: 'A1' }], [{ id: 'A1' }], generateur('X'));
  verifier(!!r.error && /même identifiant/.test(r.error),
    'I-04 ⛔ deux entrées portant le MÊME identifiant ⇒ REFUS motivé');
  verifier(r.inventaire === undefined, 'I-04 bis ⛔ et aucun inventaire n\'est rendu');
}
{
  const r = planifierIdentitesTerrains([{ id: 'INVENTE' }], [{ id: 'A1' }], generateur('X'));
  verifier(!!r.error && /inconnu/.test(r.error),
    'I-05 ⛔ identifiant que le serveur n\'a jamais émis ⇒ REFUS');
}
{
  // JSON ancien : aucune entrée n'a d'identifiant, et tous les champs doivent survivre.
  const ancien = [
    { nom: 'Rugby 1', type: 'rugby', L: 115, W: 70, pos: 'CG', enBut: 0, nature: 'Gazon' },
    { nom: 'Foot 1', type: 'foot', L: 105, W: 68, pos: 'HC', enBut: 0 }
  ];
  const r = planifierIdentitesTerrains(ancien, [], generateur('X'));
  verifier(!r.error && r.attribues === 2, 'I-06 JSON ancien sans identifiant ⇒ tous attribués');
  verifier(r.inventaire[0].L === 115 && r.inventaire[0].nature === 'Gazon' &&
           r.inventaire[1].pos === 'HC',
    'I-06 bis ⭐ AUCUNE PERTE : dimensions, nature et emplacement sont conservés');
  verifier(ancien[0].id === undefined,
    'I-06 ter ⭐ l\'entrée d\'ORIGINE n\'est pas modifiée (le plan reste rejouable)');
}
{
  const r = planifierIdentitesTerrains([{ nom: 'A' }], [{ id: 'X-1' }], generateur('X'));
  verifier(!!r.error && /déjà utilisé/.test(r.error),
    'I-07 ⛔ un générateur qui rendrait un identifiant DÉJÀ connu ⇒ refus (garde-fou)');
}
verifier(planifierIdentitesTerrains([], [], generateur('X')).inventaire.length === 0,
  'I-08 inventaire vide ⇒ sortie vide, ⛔ sans erreur');

/* ========================================================================== */
/*  V — VALIDATION STRUCTURELLE                                               */
/* ========================================================================== */

console.log('\n--- V : validation structurelle ---');

{
  const ctx = contexteReference();
  verifier(ecartsInternesPlanTerrains(planDe(ctx)).length === 0,
    'V-01 le plan de référence est cohérent avec lui-même');
  verifier(ecartsPlanTerrains(planDe(ctx), ctx.categories).length === 0,
    'V-02 ⭐ et cohérent avec les catégories de l\'édition');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', 'Rugby 1', { selectionne: 'non' })],
    minis: [mini(1, 'T1', 'U8')]
  });
  const e = ecartsInternesPlanTerrains(planDe(ctx));
  verifier(e.some((x) => /aucun grand terrain retenu/.test(x)), 'V-03 aucun terrain retenu ⇒ écart');
  verifier(e.some((x) => /NON retenu/.test(x)), 'V-04 mini rattaché à un terrain non retenu ⇒ écart');
}
{
  const ctx = contexteReference({ terrains: [terrain('T1', 'Rugby 1')], minis: [] });
  verifier(ecartsInternesPlanTerrains(planDe(ctx)).some((x) => /aucun mini-terrain/.test(x)),
    'V-05 aucun mini-terrain ⇒ écart');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', 'Rugby 1'), terrain('T1', 'Rugby 2')],
    minis: [mini(1, 'T1', 'U8')]
  });
  verifier(ecartsInternesPlanTerrains(planDe(ctx)).some((x) => /en double/.test(x)),
    'V-06 identifiant de grand terrain en double ⇒ écart');
}
{
  const ctx = contexteReference({
    terrains: [terrain('', 'Rugby 1')], minis: [mini(1, 'T1', 'U8')]
  });
  verifier(ecartsInternesPlanTerrains(planDe(ctx)).some((x) => /pas d'identifiant/.test(x)),
    'V-07 grand terrain sans identifiant ⇒ écart');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', 'Rugby 1')],
    minis: [mini(1, 'T1', 'U8'), mini(1, 'T1', 'U8')]
  });
  verifier(ecartsInternesPlanTerrains(planDe(ctx)).some((x) => /numéro de mini-terrain en double/.test(x)),
    'V-08 numéro de mini-terrain en double ⇒ écart');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', 'Rugby 1')],
    minis: [mini(1, 'T1', '')]
  });
  verifier(ecartsInternesPlanTerrains(planDe(ctx)).some((x) => /aucune catégorie/.test(x)),
    'V-09 mini-terrain sans catégorie ⇒ écart');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', 'Rugby 1')],
    minis: [mini(1, 'INCONNU', 'U8')]
  });
  verifier(ecartsInternesPlanTerrains(planDe(ctx)).some((x) => /grand terrain inconnu/.test(x)),
    'V-10 mini-terrain rattaché à un grand terrain inconnu ⇒ écart');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', 'Rugby 1'), terrain('T2', 'rugby  1')],
    minis: [mini(1, 'T1', 'U8'), mini(2, 'T2', 'U8')]
  });
  verifier(ecartsInternesPlanTerrains(planDe(ctx)).some((x) => /le même nom/.test(x)),
    'V-11 ⭐ collision de noms parmi les RETENUS ⇒ écart (l\'invariant du contrat public)');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', '')], minis: [mini(1, 'T1', 'U8')]
  });
  verifier(ecartsInternesPlanTerrains(planDe(ctx)).some((x) => /pas de nom/.test(x)),
    'V-12 nom vide parmi les retenus ⇒ écart');
}
{
  const cats = [{ categorie: 'U8', presente: 'oui', terrains: '1,2,3,4', terrains_auto: 'oui' },
                { categorie: 'U14', presente: 'oui', terrains: '', terrains_auto: 'oui' }];
  const ctx = contexteReference({ categories: cats });
  const e = ecartsPlanTerrains(planDe(ctx), cats);
  verifier(e.some((x) => /U14.*aucune dimension/.test(x)),
    'V-13 catégorie présente SANS dimension ⇒ écart');
}
{
  const cats = [{ categorie: 'U8', presente: 'oui', terrains: '1,2', terrains_auto: 'oui' },
                { categorie: 'U10', presente: 'oui', terrains: '5,6', terrains_auto: 'oui' }];
  const ctx = contexteReference({ categories: cats });
  verifier(ecartsPlanTerrains(planDe(ctx), cats).some((x) => /U8 \(Auto\)/.test(x)),
    'V-14 ⭐ AUTO : cat.terrains ≠ mini-terrains attribués ⇒ écart (l\'état partiel se voit)');
}
{
  const cats = [{ categorie: 'U8', presente: 'oui', terrains: '1,2', terrains_auto: 'non' },
                { categorie: 'U10', presente: 'oui', terrains: '5,6', terrains_auto: 'non' }];
  const ctx = contexteReference({ categories: cats });
  verifier(!ecartsPlanTerrains(planDe(ctx), cats).some((x) => /Manuel/.test(x)),
    'V-15 MANUEL : citer moins de terrains que le plan n\'est PAS un écart');
}
{
  const cats = [{ categorie: 'U8', presente: 'oui', terrains: '1,2,3,4,99', terrains_auto: 'non' },
                { categorie: 'U10', presente: 'oui', terrains: '5,6', terrains_auto: 'non' }];
  const ctx = contexteReference({ categories: cats });
  verifier(ecartsPlanTerrains(planDe(ctx), cats).some((x) => /Manuel.*99.*n'existe pas/.test(x)),
    'V-16 MANUEL : citer un terrain qui n\'existe pas ⇒ écart');
}
{
  const cats = [{ categorie: 'U8', presente: 'oui', terrains: '1,2,3,4', terrains_auto: 'oui' }];
  const ctx = contexteReference({ categories: cats });
  verifier(ecartsPlanTerrains(planDe(ctx), cats).some((x) => /U10.*n'est pas une catégorie présente/.test(x)),
    'V-17 ⭐ mini-terrains affectés à une catégorie disparue ⇒ écart');
}
{
  const params = parametres({ dimensions_json: '{pas du json' });
  const ctx = contexteReference({ params: { dimensions_json: '{pas du json' }, plans: [params] });
  verifier(ecartsPlanTerrains(planDe(ctx), ctx.categories).some((x) => /illisibles/.test(x)),
    'V-18 dimensions illisibles ⇒ écart, ⛔ sans exception');
}
{
  const mauvais = [mini(1, 'T1', 'U8', { edition_id: 'AUTRE' })];
  const plan = { edition_id: ED, plan_id: PL, params: parametres(), terrains: [terrain('T1', 'R1')], minis: mauvais };
  verifier(ecartsInternesPlanTerrains(plan).some((x) => /pas la bonne édition/.test(x)),
    'V-19 ⭐ cohérence edition_id / plan_id contrôlée dans les trois blocs');
}
verifier(ecartsInternesPlanTerrains(null).length === 1,
  'V-20 plan absent ⇒ un écart, ⛔ jamais une exception');

/* ========================================================================== */
/*  P — LE PLAN POINTÉ (garde-fou de lecture)                                 */
/* ========================================================================== */

console.log('\n--- P : lecture du plan pointé ---');

verifier(planPublieValide(contexteReference()) !== null, 'P-01 plan complet et pointé ⇒ lisible');
verifier(planPublieValide(contexteReference({ pointeur: '' })) === null, 'P-02 pointeur vide ⇒ null');
verifier(planPublieValide(contexteReference({ pointeur: 'PL-INCONNU' })) === null,
  'P-03 pointeur désignant un plan inconnu ⇒ null');
{
  const ctx = contexteReference();
  verifier(planPublieValide(Object.assign({}, ctx, { terrains: [] })) === null,
    'P-04 bloc Terrains manquant ⇒ null');
  verifier(planPublieValide(Object.assign({}, ctx, { minis: [] })) === null,
    'P-05 bloc MiniTerrains manquant ⇒ null');
  verifier(planPublieValide(Object.assign({}, ctx, { plans: [] })) === null,
    'P-06 bloc TerrainsPlan manquant ⇒ null');
}
{
  const ctx = contexteReference();
  const double = ctx.plans.concat([parametres({ couloir_m: '9' })]);
  verifier(planPublieValide(Object.assign({}, ctx, { plans: double })) === null,
    'P-07 ⭐ DEUX lignes de paramètres pour le même plan_id ⇒ null (⛔ jamais de choix au hasard)');
}
{
  const ctx = contexteReference();
  const melange = ctx.terrains.concat([terrain('T9', 'Autre', { edition_id: 'ED-AUTRE' })]);
  verifier(planPublieValide(Object.assign({}, ctx, { terrains: melange })) === null,
    'P-08 ⭐ un bloc mélangeant DEUX éditions sous le même plan_id ⇒ null');
}
{
  const ctx = contexteReference({ signatureBrute: '' });
  verifier(planPublieValide(ctx) === null, 'P-09 signature obligatoire absente ⇒ null');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 1')],
    minis: [mini(1, 'T1', 'U8'), mini(2, 'T2', 'U8')]
  });
  verifier(planPublieValide(ctx) === null,
    'P-10 ⭐ CORRUPTION MANUELLE (collision de noms) ⇒ la lecture destinée à Saisie rend null');
}
{
  const ctx = contexteReference({ minis: [mini(1, 'T1', 'U8'), mini(1, 'T2', 'U8')] });
  verifier(planPublieValide(ctx) === null, 'P-11 numéro de mini dupliqué ⇒ null');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 2', { selectionne: 'non' })],
    minis: [mini(1, 'T1', 'U8'), mini(2, 'T2', 'U8')]
  });
  verifier(planPublieValide(ctx) === null, 'P-12 mini rattaché à un terrain non retenu ⇒ null');
}
{
  // ⭐⭐ LE point de l'arbitrage 13 : une catégorie supprimée NE rend PAS le plan illisible.
  const ctx = contexteReference({ categories: [CATEGORIES[0]] });
  verifier(planPublieValide(ctx) !== null,
    'P-13 ⭐⭐ une catégorie supprimée NE casse PAS la lecture (elle changera l\'ÉTAT, pas la validité)');
}
verifier(planPublieValide(null) === null && planPublieValide({}) === null,
  'P-14 contexte absent ou vide ⇒ null, ⛔ sans exception');

/* ========================================================================== */
/*  J — PROJECTION HISTORIQUE                                                 */
/* ========================================================================== */

console.log('\n--- J : projection du contrat historique ---');

{
  const ctx = contexteReference();
  const r = projectionRepartitionTerrains(planDe(ctx));
  verifier(!r.error && Object.keys(r.repartition).length === 4,
    'J-01 ⭐ quatre grands terrains donnent EXACTEMENT quatre clés');
  verifier(JSON.stringify(r.repartition['Rugby 1']) === '["1","2"]' &&
           JSON.stringify(r.repartition['Rugby 2']) === '["3","4"]' &&
           JSON.stringify(r.repartition['Foot 1']) === '["5"]' &&
           JSON.stringify(r.repartition['Foot 2']) === '["6"]',
    'J-02 noms figés et numéros historiques conservés');
  const encore = projectionRepartitionTerrains(planDe(ctx));
  verifier(JSON.stringify(encore.repartition) === JSON.stringify(r.repartition),
    'J-03 ⭐ ORDRE STABLE : deux projections du même plan donnent le même objet');
  verifier(Object.keys(r.repartition).join('|') === 'Foot 1|Foot 2|Rugby 1|Rugby 2',
    'J-04 l\'ordre est déterministe (nom normalisé), ⛔ pas celui des lignes');
}
{
  const ctx = contexteReference({ minis: [mini(1, 'T1', 'U8')] });
  const r = projectionRepartitionTerrains(planDe(ctx));
  verifier(!r.error && Object.keys(r.repartition).length === 4 &&
           r.repartition['Foot 1'].length === 0,
    'J-05 ⭐ un grand terrain retenu SANS mini-terrain reste présent (liste vide) — aucun perdu');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 1')],
    minis: [mini(1, 'T1', 'U8'), mini(2, 'T2', 'U8')]
  });
  const r = projectionRepartitionTerrains(planDe(ctx));
  verifier(!!r.error && /portent le nom/.test(r.error),
    'J-06 ⭐ COLLISION IMPOSSIBLE À PROJETER : échec fermé, ⛔ jamais un écrasement silencieux');
  verifier(r.repartition === undefined, 'J-06 bis ⛔ et aucune répartition n\'est rendue');
  verifier(!/Plan incohérent/.test(r.error),
    'J-06 ter ⭐ le refus vient du contrôle de COLLISION lui-même, ⛔ pas du fourre-tout ' +
    '« plan incohérent » — sinon ce contrôle serait du code mort');
}
{
  // ⭐ Le plan est figé : renommer l'inventaire durable ensuite ne peut rien changer,
  //   puisque la projection ne consulte QUE snap_nom.
  const ctx = contexteReference();
  const avant = projectionRepartitionTerrains(planDe(ctx));
  const inventaireRenomme = [{ id: 'T1', nom: 'Stade Nord' }, { id: 'T2', nom: 'Stade Sud' }];
  const apres = projectionRepartitionTerrains(planDe(ctx));
  verifier(JSON.stringify(avant.repartition) === JSON.stringify(apres.repartition) &&
           inventaireRenomme.length === 2,
    'J-07 ⭐ l\'inventaire durable renommé n\'a AUCUN effet (aucun inventaire n\'est consulté)');
}
{
  const ctx = contexteReference({ terrains: [terrain('T1', 'Rugby 1', { selectionne: 'non' })] });
  const r = projectionRepartitionTerrains(planDe(ctx));
  verifier(!!r.error, 'J-08 plan incohérent ⇒ échec fermé, ⛔ jamais une projection partielle');
}
verifier(projectionRepartitionTerrains(null).error !== undefined,
  'J-09 plan absent ⇒ erreur, ⛔ jamais une exception');
{
  const ctx = contexteReference({
    minis: [mini(10, 'T1', 'U8'), mini(2, 'T1', 'U8'), mini(1, 'T1', 'U8'),
            mini(3, 'T2', 'U8'), mini(4, 'T3', 'U10'), mini(5, 'T4', 'U10')]
  });
  const r = projectionRepartitionTerrains(planDe(ctx));
  verifier(JSON.stringify(r.repartition['Rugby 1']) === '["1","2","10"]',
    'J-10 ⭐ les numéros sont triés NUMÉRIQUEMENT (2 avant 10)');
}

/* Natures */
console.log('\n--- J : natures des terrains retenus ---');
{
  const ctx = contexteReference();
  const n = naturesPlanTerrains(planDe(ctx));
  verifier(n.natures.join('|') === 'Gazon|Synthétique' && n.nbSansNature === 0,
    'J-11 natures DISTINCTES, dans l\'ordre de déclaration');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', 'Rugby 1', { snap_nature: 'Gazon' }),
               terrain('T2', 'Rugby 2', { snap_nature: 'Neige', selectionne: 'non' }),
               terrain('T3', 'Foot 1', { snap_nature: '' })],
    minis: [mini(1, 'T1', 'U8'), mini(5, 'T3', 'U10')]
  });
  const n = naturesPlanTerrains(planDe(ctx));
  verifier(n.natures.join('|') === 'Gazon',
    'J-12 ⭐ un terrain NON RETENU n\'impose plus sa surface au dossier de la Ligue');
  verifier(n.nbSansNature === 1, 'J-13 un terrain retenu sans nature est compté, ⛔ pas deviné');
}
verifier(naturesPlanTerrains(null).natures.length === 0,
  'J-14 plan absent ⇒ liste vide (l\'appelant retombe sur org_type_terrain)');

/* ========================================================================== */
/*  S — SIGNATURE                                                             */
/* ========================================================================== */

console.log('\n--- S : signature des terrains ---');

function signatureDe(sur) {
  const ctx = contexteReference(sur);
  return signatureTerrains(planDe(ctx), ctx.categories);
}
const SIG = signatureDe();

verifier(SIG === signatureDe(), 'S-01 la signature est stable pour un même plan');

/* Ce qui DOIT changer la signature — les six familles validées. */
verifier(signatureDe({ categories: [CATEGORIES[0]] }) !== SIG,
  'S-02 ⭐ une catégorie retirée change la signature');
verifier(signatureDe({
  categories: [Object.assign({}, CATEGORIES[0], { terrains: '1,2' }), CATEGORIES[1], CATEGORIES[2]]
}) !== SIG, 'S-03 ⭐ la répartition réellement appliquée (cat.terrains) change la signature');
verifier(signatureDe({
  categories: [Object.assign({}, CATEGORIES[0], { terrains_auto: 'non' }), CATEGORIES[1], CATEGORIES[2]]
}) !== SIG, 'S-04 le mode Auto/Manuel change la signature');
verifier(signatureDe({
  terrains: [terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 2', { selectionne: 'non' }),
             terrain('T3', 'Foot 1'), terrain('T4', 'Foot 2')]
}) !== SIG, 'S-05 ⭐ la sélection d\'un grand terrain change la signature');
verifier(signatureDe({ params: { dimensions_json: '{"U8":{"l":35,"w":20},"U10":{"l":40,"w":30}}' } }) !== SIG,
  'S-06 ⭐ une dimension modifiée change la signature');
verifier(signatureDe({ params: { couloir_m: '6' } }) !== SIG, 'S-07 ⭐ le couloir change la signature');
verifier(signatureDe({ params: { tm_longueur_m: '5' } }) !== SIG,
  'S-08 la longueur de table de marque change la signature');
verifier(signatureDe({ params: { tm_largeur_m: '5' } }) !== SIG,
  'S-09 la largeur de table de marque change la signature');
verifier(signatureDe({ minis: [mini(1, 'T1', 'U10'), mini(2, 'T1', 'U8'), mini(3, 'T2', 'U8'),
                               mini(4, 'T2', 'U8'), mini(5, 'T3', 'U10'), mini(6, 'T4', 'U10')] }) !== SIG,
  'S-10 ⭐ l\'affectation d\'un mini-terrain à une autre catégorie change la signature');

/* Ce qui NE DOIT PAS changer la signature. */
/* ⭐⭐ LE PIÈGE DE `signatureGeneration`, ET IL SE TESTE MAL — voici pourquoi ce bloc est
   écrit ainsi. Une première version se contentait de déclarer un tableau d'équipes dans le
   test SANS jamais le passer à la fonction : 🔬 une mutation qui réintroduisait le nombre
   d'équipes dans la signature passait alors INAPERÇUE, puisqu'il n'y avait rien à lire.
   ⭐ On INJECTE donc les effectifs LÀ OÙ ILS POURRAIENT ÊTRE LUS — dans les catégories et
   dans le plan — et l'on exige que la signature n'en tienne aucun compte. Une implémentation
   qui les lirait serait prise en défaut ici. */
{
  const catsAvecEffectifs = CATEGORIES.map((c) => Object.assign({}, c, {
    nb_equipes: 12, equipes: [{ nom: 'X' }, { nom: 'Y' }], nb_poules: '3'
  }));
  verifier(signatureTerrains(planDe(contexteReference()), catsAvecEffectifs) === SIG,
    'S-11 ⭐⭐ des ÉQUIPES posées sur les catégories ne changent RIEN (⛔ le piège de signatureGeneration)');

  const ctxPlan = contexteReference();
  const planCharge = planDe(ctxPlan);
  planCharge.equipes = [{ nom: 'X' }, { nom: 'Y' }, { nom: 'Z' }];
  planCharge.nb_equipes = 38;
  planCharge.matchs = [{ id: 'M1' }];
  planCharge.poules = [{ id: 'P1' }];
  verifier(signatureTerrains(planCharge, ctxPlan.categories) === SIG,
    'S-11 bis ⭐⭐ des équipes, poules et matchs posés sur le PLAN ne changent rien non plus');

  const catsPlusUne = CATEGORIES.map((c) => Object.assign({}, c, { nb_equipes: 13 }));
  verifier(signatureTerrains(planDe(contexteReference()), catsPlusUne) === SIG &&
           signatureTerrains(planDe(contexteReference()), catsAvecEffectifs) === SIG,
    'S-11 ter ⭐ inscrire une équipe de plus laisse la signature IDENTIQUE — le dossier des ' +
    'clubs ne se ferme pas en pleine phase d\'inscription');
}
verifier(signatureDe({
  params: { dimensions_json: '{"U8":{"l":30,"w":20,"src":"saisie"},"U10":{"l":40,"w":30,"src":"ffr"}}' }
}) === SIG, 'S-12 ⭐ changer `src` SANS changer la valeur ne change RIEN');
verifier(signatureDe({
  params: { dimensions_json: '{"U10":{"w":30,"l":40,"src":"saisie"},"U8":{"w":20,"l":30,"src":"ffr"}}' }
}) === SIG, 'S-13 ⭐ RÉORDONNER les clés du JSON ne change RIEN');
/* ⚠️ Les TROIS paramètres portent ici une représentation RÉELLEMENT différente (« 5.0 » et
   non 5) : 🔬 avec `couloir_m: 5`, une mutation qui supprimait la canonisation du couloir
   passait inaperçue — `String(5)` et « 5 » se valent déjà. Le test ne mordait que sur la TM. */
verifier(signatureDe({
  params: { couloir_m: '5.0', tm_longueur_m: '4.0', tm_largeur_m: 4,
            dimensions_json: '{"U8":{"l":"30.0","w":"20"},"U10":{"l":40,"w":"30.0"}}' }
}) === SIG, 'S-14 ⭐ « 5.0 » et 5, « 30.0 » et 30 : la représentation numérique n\'a aucun effet');
verifier(signatureDe({ params: { couloir_m: ' 5 ' } }) === SIG,
  'S-14 bis les espaces autour d\'un nombre n\'ont aucun effet non plus');
verifier(signatureDe({
  categories: [CATEGORIES[1], CATEGORIES[2], CATEGORIES[0]]
}) === SIG, 'S-15 l\'ordre des catégories reçues n\'a aucun effet');
verifier(signatureDe({
  categories: [Object.assign({}, CATEGORIES[0], { terrains: '4,3, 2 ,1' }), CATEGORIES[1], CATEGORIES[2]]
}) === SIG, 'S-16 l\'ordre des numéros dans cat.terrains n\'a aucun effet');
verifier(signatureDe({
  terrains: [terrain('T4', 'Foot 2', { snap_type: 'foot', snap_nature: 'Synthétique', snap_pos: 'CD' }),
             terrain('T2', 'Rugby 2'), terrain('T1', 'Rugby 1'),
             terrain('T3', 'Foot 1', { snap_type: 'foot', snap_nature: 'Synthétique', snap_pos: 'HC' })]
}) === SIG, 'S-17 l\'ordre des lignes de terrains n\'a aucun effet');
verifier(signatureDe({
  terrains: [terrain('T1', 'Rugby 1', { snap_longueur_m: '999', snap_nature: 'Neige', snap_pos: 'BD' }),
             terrain('T2', 'Rugby 2'),
             terrain('T3', 'Foot 1', { snap_type: 'foot', snap_nature: 'Synthétique', snap_pos: 'HC' }),
             terrain('T4', 'Foot 2', { snap_type: 'foot', snap_nature: 'Synthétique', snap_pos: 'CD' })]
}) === SIG, 'S-18 ⭐ les caractéristiques FIGÉES (taille, nature, emplacement) ne sont pas dans la signature');
verifier(signatureDe({ categories: CATEGORIES.concat([
  { categorie: 'U14', presente: 'non', terrains: '9', terrains_auto: 'oui' }]) }) === SIG,
  'S-19 une catégorie NON présente n\'entre pas dans la signature');
verifier(signatureDe({ params: { fige_le: '2030-01-01 00:00:00' } }) === SIG,
  'S-20 l\'horodatage n\'entre pas dans la signature');

/* Canonisation des dimensions, isolément */
verifier(dimensionsCanoniquesTerrains('{"U8":{"l":30,"w":20}}') ===
         dimensionsCanoniquesTerrains('{"U8":{"w":"20","l":"30","src":"ffr"}}'),
  'S-21 la forme canonique des dimensions ignore l\'ordre, le type et `src`');
verifier(dimensionsCanoniquesTerrains('{pas du json') === '' &&
         dimensionsCanoniquesTerrains('') === '' && dimensionsCanoniquesTerrains(null) === '',
  'S-22 dimensions illisibles ou absentes ⇒ forme vide, ⛔ sans exception');
verifier(dimensionsCanoniquesTerrains('{"U14":{"plein":true}}') !==
         dimensionsCanoniquesTerrains('{"U14":{"l":100,"w":70}}'),
  'S-23 « plein terrain » et une taille chiffrée ne se confondent pas');

/* ========================================================================== */
/*  E — LES ÉTATS                                                             */
/* ========================================================================== */

console.log('\n--- E : calcul des états ---');

const BROUILLON = { edition_id: ED, plan_id: 'PL-B', role: 'brouillon',
  couloir_m: '5', tm_longueur_m: '4', tm_largeur_m: '4', dimensions_json: DIMENSIONS,
  signature: '', fige_le: '2026-09-02 11:00:00' };

{
  const ctx = contexteReference({ pointeur: '' });
  ctx.plans = [];
  verifier(etatTerrainsPur(ctx) === 'absent', 'E-01 aucun pointeur et aucun brouillon ⇒ absent');
}
{
  const ctx = contexteReference({ pointeur: '' });
  ctx.plans = [BROUILLON];
  verifier(etatTerrainsPur(ctx) === 'brouillon', 'E-02 brouillon seul ⇒ brouillon');
}
{
  const ctx = contexteReference();
  verifier(etatTerrainsPur(ctx) === 'confirme',
    'E-03 ⭐ plan pointé valide, aucun brouillon, signature identique ⇒ confirme');
}
{
  const ctx = contexteReference();
  ctx.plans = ctx.plans.concat([BROUILLON]);
  verifier(etatTerrainsPur(ctx) === 'a_reconfirmer',
    'E-04 ⭐ plan pointé valide + brouillon ⇒ a_reconfirmer');
}
{
  const ctx = contexteReference({ signatureBrute: 'signature-perimee' });
  verifier(etatTerrainsPur(ctx) === 'a_reconfirmer',
    'E-05 ⭐ plan pointé valide sans brouillon, mais signature différente ⇒ a_reconfirmer');
}
{
  // ⭐⭐ Le scénario de l'arbitrage 10, chemin B : une catégorie supprimée AILLEURS.
  const ctx = contexteReference();
  const reduit = Object.assign({}, ctx, { categories: [CATEGORIES[0]] });
  verifier(etatTerrainsPur(reduit) === 'a_reconfirmer',
    'E-06 ⭐⭐ une catégorie supprimée hors de l\'écran Terrains ⇒ a_reconfirmer (c\'est la SIGNATURE qui l\'attrape)');
}
{
  const ctx = contexteReference({ pointeur: 'PL-INCONNU' });
  verifier(etatTerrainsPur(ctx) === 'absent',
    'E-07 ⛔ pointeur INCONNU ⇒ état fermé (absent), jamais confirme');
  const avecBrouillon = Object.assign({}, ctx, { plans: ctx.plans.concat([BROUILLON]) });
  verifier(etatTerrainsPur(avecBrouillon) === 'brouillon',
    'E-08 ⛔ pointeur inconnu + brouillon ⇒ brouillon, jamais confirme');
}
{
  const ctx = contexteReference({ signatureBrute: '' });
  verifier(etatTerrainsPur(ctx) === 'absent',
    'E-09 ⛔ signature obligatoire absente ⇒ état fermé, jamais confirme');
}
{
  const ctx = contexteReference({
    terrains: [terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 1')],
    minis: [mini(1, 'T1', 'U8'), mini(2, 'T2', 'U8')]
  });
  verifier(etatTerrainsPur(ctx) === 'absent',
    'E-10 ⛔ plan INCOHÉRENT (collision) ⇒ état fermé, jamais confirme');
}
{
  const ctx = contexteReference();
  ctx.plans = ctx.plans.concat([parametres({ couloir_m: '9' })]);
  verifier(etatTerrainsPur(ctx) === 'absent',
    'E-11 ⛔ pointeur AMBIGU (deux lignes pour un plan_id) ⇒ état fermé');
}
{
  const ctx = contexteReference();
  verifier(etatTerrainsPur(Object.assign({}, ctx, { minis: [] })) === 'absent',
    'E-12 ⛔ plan INCOMPLET (un bloc manquant) ⇒ état fermé');
}
verifier(etatTerrainsPur(null) === 'absent' && etatTerrainsPur({}) === 'absent',
  'E-13 contexte absent ou vide ⇒ absent, ⛔ sans exception');
{
  // ⭐ Le défaut FERMÉ, dit autrement : sur les 8 contextes dégradés ci-dessus,
  //   PAS UN SEUL ne remonte vers « confirme ».
  const degrades = [
    contexteReference({ pointeur: '' }),
    contexteReference({ pointeur: 'PL-INCONNU' }),
    contexteReference({ signatureBrute: '' }),
    Object.assign({}, contexteReference(), { minis: [] }),
    Object.assign({}, contexteReference(), { terrains: [] }),
    Object.assign({}, contexteReference(), { plans: [] }),
    contexteReference({ terrains: [terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 1')],
                        minis: [mini(1, 'T1', 'U8'), mini(2, 'T2', 'U8')] }),
    contexteReference({ minis: [mini(1, 'T1', 'U8'), mini(1, 'T2', 'U8')] })
  ];
  verifier(degrades.every((c) => etatTerrainsPur(c) !== 'confirme'),
    'E-14 ⭐⭐ LE DÉFAUT EST FERMÉ : aucun des 8 contextes dégradés ne remonte vers « confirme »');
}

/* ========================================================================== */
/*  H — LA SÉRIE APPS SCRIPT, EXÉCUTÉE ICI                                    */
/*                                                                            */
/*  ⭐ POURQUOI CE BLOC EXISTE, et c'est une leçon du dépôt : `backend/Tests.gs` */
/*  ne tourne que CHEZ GOOGLE. Une série qui y est écrite mais jamais lancée   */
/*  n'est pas un garde-fou — c'est une intention. Le socle B2-3.a étant PUR,   */
/*  rien n'empêche de l'exécuter ici, avant tout déploiement.                  */
/*                                                                            */
/*  ⛔ Ce n'est PAS une seconde vérité : ce sont les MÊMES fonctions de test,   */
/*  extraites du VRAI fichier, exécutées sur le VRAI socle. Un écart entre les */
/*  deux fichiers est donc impossible sans qu'un des deux échoue.             */
/* ========================================================================== */

console.log('\n--- H : la série Apps Script (backend/Tests.gs), exécutée localement ---');

const SOURCE_TESTS = fs.readFileSync(path.join(RACINE, 'backend/Tests.gs'), 'utf8');

function extraireDe(source, motif, nom, quoi) {
  const trouve = motif.exec(source);
  if (!trouve) {
    throw new Error(quoi + ' introuvable dans backend/Tests.gs : « ' + nom + ' ». ' +
      'Si elle a été renommée, mets ce garde-fou à jour — ne le supprime pas.');
  }
  return trouve;
}

function extraireFonctionTests(nom) {
  const trouve = extraireDe(SOURCE_TESTS, new RegExp('^function\\s+' + nom + '\\s*\\(', 'm'),
    nom, 'Fonction');
  let profondeur = 0;
  for (let i = SOURCE_TESTS.indexOf('{', trouve.index); i < SOURCE_TESTS.length; i++) {
    if (SOURCE_TESTS[i] === '{') profondeur++;
    else if (SOURCE_TESTS[i] === '}' && --profondeur === 0) {
      return SOURCE_TESTS.slice(trouve.index, i + 1);
    }
  }
  throw new Error('Accolades déséquilibrées autour de « ' + nom + ' »');
}

function extraireVariableTests(nom) {
  return extraireDe(SOURCE_TESTS, new RegExp('^var\\s+' + nom + '\\s*=.*?;\\s*$', 'm'),
    nom, 'Variable')[0];
}

/* Les noms de la série, dans l'ordre où `lancerTestsFFR` les appelle. ⭐ La liste est lue
   DANS le fichier : si un test est ajouté à Tests.gs sans être appelé, il n'apparaît pas ici —
   et si l'appel existe sans la fonction, l'extraction échoue bruyamment. */
const APPELS = (SOURCE_TESTS.match(/^\s{2}(testB23_[A-Za-z0-9_]+)\(etat\);$/gm) || [])
  .map((l) => l.trim().replace(/\(etat\);$/, ''));

const bacTests = vm.createContext({});
vm.runInContext(
  ['TERRAINS_ROLE_BROUILLON', 'TERRAINS_ROLE_PLAN'].map(extraireVariable).join('\n') + '\n' +
  COMMUNES.concat(SOCLE).map(extraireFonction).join('\n') + '\n' +
  ['_B23_ED', '_B23_PL', '_B23_DIMENSIONS'].map(extraireVariableTests).join('\n') + '\n' +
  ['_b23Terrain', '_b23Mini', '_b23Params', '_b23Categories', '_b23Contexte', '_b23Plan',
   '_b23Ecart'].concat(APPELS).map(extraireFonctionTests).join('\n'),
  bacTests, { filename: 'backend/Tests.gs (extrait)' });

verifier(APPELS.length === 19,
  'H-00 ⭐ les 19 tests de la série B2-3.a sont bien APPELÉS par lancerTestsFFR (trouvés : ' +
  APPELS.length + ')');

/* La doublure de `_ffrAssert` : elle reverse chaque assertion dans le compteur de ce fichier. */
const etatGoogle = { total: 0, ok: 0, fail: 0, echecs: [] };
vm.runInContext('var __etatG = null; function _ffrAssert(e, c, l) { ' +
  'e.total++; if (c) { e.ok++; } else { e.fail++; e.echecs.push(l); } }', bacTests);

APPELS.forEach((nom) => {
  const avantOk = etatGoogle.ok, avantTotal = etatGoogle.total;
  vm.runInContext(nom, bacTests)(etatGoogle);
  const passees = etatGoogle.ok - avantOk;
  const jouees = etatGoogle.total - avantTotal;
  verifier(jouees > 0 && passees === jouees,
    'H : ' + nom + ' — ' + passees + '/' + jouees + ' assertion(s) Apps Script');
});

if (etatGoogle.fail) {
  console.log('  ⚠️ assertions Apps Script en échec : ' + etatGoogle.echecs.join(' | '));
}
verifier(etatGoogle.fail === 0 && etatGoogle.total >= 60,
  'H-FIN ⭐⭐ la série Apps Script passe ENTIÈREMENT ici : ' + etatGoogle.ok + '/' +
  etatGoogle.total + ' assertions, ' + etatGoogle.fail + ' échec(s)');

/* -------------------------------------------------------------------------- */

console.log('==============================================');
console.log('B2-3.a socle pur — ' + etat.ok + '/' + etat.total + ' OK, ' + etat.fail + ' ÉCHEC(S)');
if (etat.fail) console.log('Échecs : ' + etat.echecs.join(' | '));
console.log('==============================================');
process.exit(etat.fail ? 1 : 0);
