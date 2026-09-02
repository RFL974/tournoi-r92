/**
 * ============================================================================
 *  GARDE-FOU BACKEND — la PERSISTANCE INERTE par édition (M1-B2 / B2-3.b)
 *  Conception validée : voir docs/industrialisation/PLAN.md §16.5 (lot B2-3)
 * ============================================================================
 *
 *  ▶ Pour lancer :  node tests/backend-terrains-persistance.test.js
 *    (aucune dépendance, aucun navigateur, aucun réseau, ⛔ aucun Google — Node seul)
 *
 *  CE QU'IL PROTÈGE.
 *
 *  B2-3.b pose trois onglets, un pointeur, et la séquence qui publie un plan sans jamais
 *  qu'une interruption puisse faire passer un candidat à moitié écrit pour « le dernier plan
 *  confirmé ». ⭐ C'est un invariant de DONNÉES : il ne se prouve pas en lisant le code, il se
 *  prouve en écrivant dans un classeur et en regardant ce que les lecteurs obtiennent.
 *
 *  ⚠️ LE FAUX CLASSEUR N'EST PAS UNE SIMPLIFICATION. Il implémente les méthodes RÉELLEMENT
 *  appelées par le code testé — `getSheetByName`, `insertSheet`, `getRange().setValues()`,
 *  `clearContent`, `getLastRow`, `getLastColumn`, `setNumberFormat`, `setFrozenRows`… — et il
 *  se comporte comme une grille : une plage écrite en colonne 5 d'un onglet qui n'a qu'un
 *  en-tête sur 4 colonnes AGRANDIT la grille sans créer d'en-tête, exactement comme Sheets.
 *  ⭐ C'est ce réalisme qui permet au test « aucune colonne sans en-tête » de mordre.
 *
 *  ⛔ CE FICHIER NE TESTE AUCUN BRANCHEMENT : à ce stade, aucune de ces fonctions n'est routée.
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = process.env.RACINE_TOURNOI_R92 || path.join(__dirname, '..');
const SOURCE = fs.readFileSync(path.join(RACINE, 'backend/Code.gs'), 'utf8');

/* -------------------------------------------------------------------------- */
/*  Extraction — on ancre sur une DÉCLARATION en début de ligne, puis on       */
/*  découpe par équilibrage d'accolades. ⛔ On ne réécrit rien, on PREND.       */
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

/** Une déclaration `var NOM = …;` — sur une ligne, ou étalée jusqu'au `;` en début de ligne. */
function extraireVariable(nom) {
  const motif = new RegExp('^var\\s+' + nom + '\\s*=[\\s\\S]*?;\\s*$', 'm');
  const trouve = motif.exec(SOURCE);
  if (!trouve) throw new Error('Variable introuvable dans backend/Code.gs : « ' + nom + ' »');
  return trouve[0];
}

/** `ENTETES` est un gros littéral commenté : on le prend par équilibrage d'accolades. */
function extraireEntetes() {
  const debut = /^var\s+ENTETES\s*=\s*\{/m.exec(SOURCE);
  if (!debut) throw new Error('ENTETES introuvable dans backend/Code.gs');
  let profondeur = 0;
  for (let i = SOURCE.indexOf('{', debut.index); i < SOURCE.length; i++) {
    if (SOURCE[i] === '{') profondeur++;
    else if (SOURCE[i] === '}' && --profondeur === 0) {
      return SOURCE.slice(debut.index, i + 1) + ';';
    }
  }
  throw new Error('Accolades déséquilibrées autour de ENTETES');
}

/* Le socle pur B2-3.a, dont la persistance dépend. */
const SOCLE = [
  'normaliserTexteSouple', 'memeTexteSouple', 'hachageChaine',
  'valeurTexteTerrain', 'nombreCanoniqueTerrain', 'cleNomTerrain', 'terrainRetenu',
  'collisionsNomsTerrains', 'planifierIdentitesTerrains',
  'lignesDuPlanTerrains', 'melangeEditionsPlanTerrains', 'assemblerPlanTerrains',
  'brouillonTerrains', 'categoriesPresentesTerrains', 'numerosCanoniquesTerrains',
  'comparerNumerosMiniTerrain', 'categorieTerrainsAuto',
  'ecartsInternesPlanTerrains', 'ecartsPlanTerrains', 'planPublieValide',
  'comparerTerrainsProjection', 'projectionRepartitionTerrains', 'naturesPlanTerrains',
  'dimensionsCanoniquesTerrains', 'signatureTerrains', 'etatTerrainsPur'
];

/* Les briques de lecture/écriture du dépôt que la persistance réutilise. */
const BRIQUES = ['lireOngletSimple', 'creerOngletAvecEntetes', 'stylerEntete', 'assurerOngletModele'];

/* La persistance B2-3.b elle-même. */
const PERSISTANCE = [
  'assurerOngletTerrainsPlan', 'assurerOngletTerrainsB23', 'assurerOngletMiniTerrains',
  'assurerColonnePlanPublieEditions', 'assurerStructureTerrainsB23', 'structureTerrainsB23EnPlace',
  'lireEditionsObjets', 'ligneEditionParId', 'pointeurPlanTerrains',
  'lireTerrainsPlan', 'lireLignesTerrainsB23', 'lireLignesMiniTerrains',
  'contexteTerrainsEdition', 'lirePlanTerrains', 'lireBrouillonTerrains',
  'plansOrphelinsTerrains', 'planTerrainsPublie',
  'reecrireOngletModele', 'ecrireBlocsPlanTerrains', 'ecrireBrouillonTerrains',
  'ecrirePointeurPlanTerrains', 'supprimerPlanTerrains', 'balayerPlansOrphelins',
  'publierPlanTerrains'
];

const bac = vm.createContext({});
vm.runInContext(
  ['TERRAINS_ROLE_BROUILLON', 'TERRAINS_ROLE_PLAN', 'EDITIONS_COLONNE_PLAN_PUBLIE',
   'ONGLETS_TERRAINS_B23', 'COULEUR_FOND_ENTETE', 'COULEUR_TEXTE_ENTETE'].map(extraireVariable).join('\n') +
  '\n' + extraireEntetes() + '\n' +
  SOCLE.concat(BRIQUES, PERSISTANCE).map(extraireFonction).join('\n'),
  bac, { filename: 'backend/Code.gs (extrait)' });

function F(nom) {
  const f = vm.runInContext(nom, bac);
  if (typeof f !== 'function') throw new Error(nom + ' n\'est pas une fonction');
  return f;
}
const ENTETES = vm.runInContext('ENTETES', bac);
const COLONNE_POINTEUR = vm.runInContext('EDITIONS_COLONNE_PLAN_PUBLIE', bac);

const assurerStructureTerrainsB23 = F('assurerStructureTerrainsB23');
const structureTerrainsB23EnPlace = F('structureTerrainsB23EnPlace');
const assurerColonnePlanPublieEditions = F('assurerColonnePlanPublieEditions');
const pointeurPlanTerrains = F('pointeurPlanTerrains');
const ligneEditionParId = F('ligneEditionParId');
const lireTerrainsPlan = F('lireTerrainsPlan');
const lireLignesTerrainsB23 = F('lireLignesTerrainsB23');
const lireLignesMiniTerrains = F('lireLignesMiniTerrains');
const lirePlanTerrains = F('lirePlanTerrains');
const lireBrouillonTerrains = F('lireBrouillonTerrains');
const plansOrphelinsTerrains = F('plansOrphelinsTerrains');
const planTerrainsPublie = F('planTerrainsPublie');
const contexteTerrainsEdition = F('contexteTerrainsEdition');
const ecrireBrouillonTerrains = F('ecrireBrouillonTerrains');
const ecrirePointeurPlanTerrains = F('ecrirePointeurPlanTerrains');
const supprimerPlanTerrains = F('supprimerPlanTerrains');
const balayerPlansOrphelins = F('balayerPlansOrphelins');
const publierPlanTerrains = F('publierPlanTerrains');
const etatTerrainsPur = F('etatTerrainsPur');
const projectionRepartitionTerrains = F('projectionRepartitionTerrains');

/* ========================================================================== */
/*  LE FAUX CLASSEUR — fidèle aux méthodes RÉELLEMENT appelées                */
/*                                                                            */
/*  ⚠️ Il se comporte comme une GRILLE, pas comme un tableau d'objets : écrire */
/*  en colonne 5 d'un onglet qui n'a que 4 en-têtes agrandit la grille SANS    */
/*  créer d'en-tête — exactement comme Google Sheets. ⭐ C'est ce réalisme qui  */
/*  permet au contrôle « aucune colonne sans en-tête » de mordre pour de vrai. */
/* ========================================================================== */

/* ⭐ LE COMPTEUR D'ÉCRITURES — partagé par tous les onglets d'un même classeur.
   ⚠️ Il ne compte PAS « des changements de valeur » mais des APPELS aux méthodes qui écrivent
   (`setValues`, `setValue`, `clearContent`, `insertSheet`). C'est plus strict, et c'est le
   point : comparer deux empreintes prouve que le RÉSULTAT est identique ; compter les appels
   prouve qu'on n'a même pas TENTÉ d'écrire. Une réécriture à l'identique passerait la
   première preuve et échouerait celle-ci. */
function compteurEcritures() {
  return { setValues: 0, setValue: 0, clearContent: 0, insertSheet: 0,
    total: function () { return this.setValues + this.setValue + this.clearContent + this.insertSheet; } };
}

function fauxOnglet(nom, lignes, compteur) {
  const d = (lignes || []).map((l) => l.slice());
  const ecrit = compteur || compteurEcritures();
  let figees = 0;
  const styles = [];

  function largeur() {
    let m = 0;
    d.forEach((l) => { if (l.length > m) m = l.length; });
    return m;
  }
  function assurerCellule(r, c) {
    while (d.length < r) d.push([]);
    const ligne = d[r - 1];
    while (ligne.length < c) ligne.push('');
  }

  const api = {
    _nom: nom,
    _lignes: () => d,
    _ecritures: () => ecrit,
    _styles: () => styles,
    _figees: () => figees,
    getName: () => nom,
    getLastRow: () => {
      let dernier = 0;
      d.forEach((l, i) => {
        if (l.some((c) => c !== '' && c !== null && c !== undefined)) dernier = i + 1;
      });
      return dernier;
    },
    getLastColumn: () => {
      let dernier = 0;
      d.forEach((l) => {
        l.forEach((c, j) => { if (c !== '' && c !== null && c !== undefined && j + 1 > dernier) dernier = j + 1; });
      });
      return dernier;
    },
    getMaxColumns: () => Math.max(largeur(), 26),
    insertColumnsAfter: () => api,
    setFrozenRows: (n) => { figees = n; return api; },
    getDataRange: () => api.getRange(1, 1, Math.max(api.getLastRow(), 1), Math.max(api.getLastColumn(), 1)),
    getRange: (r, c, nr, nc) => {
      nr = nr || 1; nc = nc || 1;
      const plage = {
        getValues: () => {
          const out = [];
          for (let i = 0; i < nr; i++) {
            const ligne = [];
            for (let j = 0; j < nc; j++) {
              const v = (d[r - 1 + i] || [])[c - 1 + j];
              ligne.push(v === undefined ? '' : v);
            }
            out.push(ligne);
          }
          return out;
        },
        setValues: (vals) => {
          ecrit.setValues++;
          for (let i = 0; i < vals.length; i++) {
            for (let j = 0; j < vals[i].length; j++) {
              assurerCellule(r + i, c + j);
              d[r - 1 + i][c - 1 + j] = vals[i][j];
            }
          }
          return plage;
        },
        setValue: (v) => { ecrit.setValue++; assurerCellule(r, c); d[r - 1][c - 1] = v; return plage; },
        clearContent: () => {
          ecrit.clearContent++;
          for (let i = 0; i < nr; i++) {
            for (let j = 0; j < nc; j++) {
              if (d[r - 1 + i] && d[r - 1 + i][c - 1 + j] !== undefined) d[r - 1 + i][c - 1 + j] = '';
            }
          }
          return plage;
        },
        setNumberFormat: () => plage,
        setBackground: () => plage,
        setFontColor: () => plage,
        setFontWeight: () => { styles.push({ r, c, nr, nc }); return plage; }
      };
      return plage;
    }
  };
  return api;
}

function fauxClasseur(onglets, compteur) {
  const table = {};
  const ecrit = compteur || compteurEcritures();
  (onglets || []).forEach((o) => { table[o._nom] = o; });
  return {
    _table: table,
    _ecritures: () => ecrit,
    getSheetByName: (n) => table[n] || null,
    insertSheet: (n) => { ecrit.insertSheet++; table[n] = fauxOnglet(n, [], ecrit); return table[n]; },
    getSpreadsheetTimeZone: () => 'Europe/Paris'
  };
}

/** Un onglet `Editions` tel qu'il est AUJOURD'HUI : quatre colonnes, aucun pointeur. */
function ongletEditions(lignes, compteur) {
  return fauxOnglet('Editions', [ENTETES.Editions.slice()].concat(lignes || []), compteur);
}

/* ========================================================================== */
/*  Assertions                                                                */
/* ========================================================================== */

const etat = { total: 0, ok: 0, fail: 0, echecs: [] };
function verifier(condition, libelle) {
  etat.total++;
  if (condition) { etat.ok++; console.log('  OK    ' + libelle); }
  else { etat.fail++; etat.echecs.push(libelle); console.log('  ÉCHEC ' + libelle); }
}

/* ========================================================================== */
/*  Le jeu d'essai                                                            */
/* ========================================================================== */

const ED_A = 'ED-2026';
const ED_B = 'ED-2027';

function terrain(id, nom, sur) {
  return Object.assign({
    terrain_id: id, selectionne: 'oui', snap_nom: nom, snap_type: 'rugby',
    snap_longueur_m: '115', snap_largeur_m: '70', snap_enbut_m: '0',
    snap_nature: 'Gazon', snap_pos: 'CG'
  }, sur || {});
}
function mini(numero, terrainId, categorie) {
  return { numero: String(numero), terrain_id: terrainId, categorie: categorie };
}
const DIMENSIONS = '{"U8":{"l":30,"w":20,"src":"ffr"},"U10":{"l":40,"w":30,"src":"saisie"}}';
const CATEGORIES = [
  { categorie: 'U8', presente: 'oui', terrains: '1,2,3,4', terrains_auto: 'oui' },
  { categorie: 'U10', presente: 'oui', terrains: '5,6', terrains_auto: 'oui' },
  { categorie: 'U12', presente: 'non', terrains: '', terrains_auto: 'oui' }
];

function planEssai(sur) {
  const s = sur || {};
  return {
    params: Object.assign({ role: 'plan', couloir_m: '5', tm_longueur_m: '4', tm_largeur_m: '4',
      dimensions_json: DIMENSIONS }, s.params || {}),
    terrains: s.terrains || [
      terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 2'),
      terrain('T3', 'Foot 1', { snap_type: 'foot', snap_nature: 'Synthétique' }),
      terrain('T4', 'Foot 2', { snap_type: 'foot', snap_nature: 'Synthétique' })
    ],
    minis: s.minis || [
      mini(1, 'T1', 'U8'), mini(2, 'T1', 'U8'), mini(3, 'T2', 'U8'),
      mini(4, 'T2', 'U8'), mini(5, 'T3', 'U10'), mini(6, 'T4', 'U10')
    ]
  };
}

/** Un générateur d'identifiants déterministe (⭐ injecté : jamais Utilities.getUuid ici). */
function generateur(prefixe) {
  let n = 0;
  return () => { n++; return prefixe + '-' + n; };
}

/** Un classeur prêt : `Editions` avec deux éditions, la structure B2-3 en place. */
function classeurPret(avecStructure) {
  const compteur = compteurEcritures();
  const cl = fauxClasseur([ongletEditions([
    [ED_A, 'active', '2026-09-01 10:00:00', ''],
    [ED_B, 'fermee', '2025-09-01 10:00:00', '2026-08-31 23:59:59']
  ], compteur)], compteur);
  if (avecStructure !== false) assurerStructureTerrainsB23(cl);
  return cl;
}

/** Copie profonde du contenu des trois onglets — pour comparer « bit à bit ». */
function empreinte(cl) {
  return JSON.stringify(['TerrainsPlan', 'Terrains', 'MiniTerrains', 'Editions'].map((n) => {
    const o = cl.getSheetByName(n);
    return o ? o._lignes().map((l) => l.slice()) : null;
  }));
}

/* ========================================================================== */
/*  A — STRUCTURE                                                             */
/* ========================================================================== */

console.log('\n--- A : la structure, explicite et idempotente ---');

{
  const cl = classeurPret(false);
  verifier(!structureTerrainsB23EnPlace(cl),
    'A-01 avant toute mise en place, la structure est ABSENTE');
  assurerStructureTerrainsB23(cl);
  verifier(structureTerrainsB23EnPlace(cl), 'A-02 après la mise en place explicite, elle est là');
  ['TerrainsPlan', 'Terrains', 'MiniTerrains'].forEach((n) => {
    const entetes = cl.getSheetByName(n)._lignes()[0];
    verifier(JSON.stringify(entetes) === JSON.stringify(ENTETES[n]),
      'A-03 ' + n + ' porte exactement ses ' + ENTETES[n].length + ' colonnes, dans l\'ordre');
  });
  const eEdt = cl.getSheetByName('Editions')._lignes()[0];
  verifier(eEdt.length === 5 && eEdt[4] === COLONNE_POINTEUR,
    'A-04 ⭐ `' + COLONNE_POINTEUR + '` est ajoutée À DROITE d\'Editions (5ᵉ colonne)');
  verifier(JSON.stringify(eEdt.slice(0, 4)) === JSON.stringify(ENTETES.Editions),
    'A-05 ⭐ les quatre colonnes existantes d\'Editions sont INTACTES et à leur place');
}
{
  const cl = classeurPret();
  const avant = empreinte(cl);
  assurerStructureTerrainsB23(cl);
  assurerStructureTerrainsB23(cl);
  verifier(empreinte(cl) === avant,
    'A-06 ⭐⭐ IDEMPOTENTE : deux exécutions de plus ne changent RIEN, bit à bit');
  verifier(assurerColonnePlanPublieEditions(cl).ajoutee === false,
    'A-07 la colonne n\'est pas ajoutée deux fois');
}
{
  // ⭐ Les DONNÉES existantes d'Editions survivent à l'ajout de la colonne.
  const cl = classeurPret(false);
  const lignesAvant = JSON.stringify(cl.getSheetByName('Editions')._lignes().slice(1));
  assurerStructureTerrainsB23(cl);
  const apres = cl.getSheetByName('Editions')._lignes().slice(1);
  verifier(JSON.stringify(apres.map((l) => l.slice(0, 4))) === lignesAvant,
    'A-08 ⭐ les LIGNES d\'Editions sont conservées intégralement');
  verifier(ligneEditionParId(cl, ED_A).statut === 'active' &&
           ligneEditionParId(cl, ED_B).statut === 'fermee',
    'A-09 et elles restent lisibles par leur nom d\'en-tête');
}
{
  // ⚠️ Un onglet Editions ABSENT : la colonne ne se pose pas, ⛔ et rien n'est créé.
  const cl = fauxClasseur([]);
  const r = assurerColonnePlanPublieEditions(cl);
  verifier(r.ajoutee === false && cl.getSheetByName('Editions') === null,
    'A-10 ⛔ Editions absent ⇒ la colonne n\'est pas posée, et l\'onglet n\'est PAS créé');
}
{
  // ⭐ Une structure partielle (onglet créé à la main, sans colonnes) n'est pas une structure.
  const cl = classeurPret();
  cl._table.MiniTerrains = fauxOnglet('MiniTerrains', [['edition_id', 'plan_id']]);
  verifier(!structureTerrainsB23EnPlace(cl),
    'A-11 ⭐ un onglet créé à la main SANS ses colonnes ⇒ structure absente (contrôle par EN-TÊTES)');
}

/* ========================================================================== */
/*  B — LIRE NE CRÉE JAMAIS                                                   */
/* ========================================================================== */

console.log('\n--- B : lire ne crée jamais, et échoue fermé ---');

{
  const cl = classeurPret(false);   // ⛔ aucune structure
  const avant = empreinte(cl);
  const lectures = [
    () => pointeurPlanTerrains(cl, ED_A),
    () => lireTerrainsPlan(cl),
    () => lireLignesTerrainsB23(cl),
    () => lireLignesMiniTerrains(cl),
    () => lirePlanTerrains(cl, ED_A, 'PL-X'),
    () => lireBrouillonTerrains(cl, ED_A),
    () => plansOrphelinsTerrains(cl, ED_A),
    () => planTerrainsPublie(cl, ED_A),
    () => contexteTerrainsEdition(cl, ED_A, CATEGORIES)
  ];
  let planté = false;
  lectures.forEach((f) => { try { f(); } catch (e) { planté = true; } });
  verifier(!planté, 'B-01 les neuf lecteurs traversent une structure ABSENTE sans exception');
  verifier(empreinte(cl) === avant,
    'B-02 ⭐⭐ LIRE NE CRÉE RIEN : le classeur est identique, bit à bit, après neuf lectures');
  verifier(cl.getSheetByName('TerrainsPlan') === null && cl.getSheetByName('Terrains') === null &&
           cl.getSheetByName('MiniTerrains') === null,
    'B-03 ⛔ aucun des trois onglets n\'a été créé au passage');
  verifier(cl.getSheetByName('Editions')._lignes()[0].length === 4,
    'B-04 ⛔ la colonne du pointeur n\'a pas été ajoutée non plus');
  verifier(planTerrainsPublie(cl, ED_A) === null && pointeurPlanTerrains(cl, ED_A) === '',
    'B-05 ⭐ ÉCHEC FERMÉ : sans structure, aucun plan n\'est consommable');
}
{
  const cl = classeurPret();
  const avant = empreinte(cl);
  planTerrainsPublie(cl, ED_A);
  lireBrouillonTerrains(cl, ED_A);
  contexteTerrainsEdition(cl, ED_A, CATEGORIES);
  verifier(empreinte(cl) === avant,
    'B-06 ⭐ même avec la structure en place, lire ne modifie RIEN');
}

/* ========================================================================== */
/*  C — PUBLICATION PAR CANDIDAT ET POINTEUR                                  */
/* ========================================================================== */

console.log('\n--- C : le candidat, le pointeur, la bascule ---');

{
  const cl = classeurPret();
  verifier(pointeurPlanTerrains(cl, ED_A) === '', 'C-01 au départ, aucun plan n\'est publié');
  verifier(etatTerrainsPur(contexteTerrainsEdition(cl, ED_A, CATEGORIES)) === 'absent',
    'C-02 ⇒ état « absent »');

  const r = publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'),
    '2026-09-02 10:00:00');
  verifier(r.ok && r.plan_id === 'P-1', 'C-03 la publication réussit et rend le plan_id fabriqué');
  verifier(pointeurPlanTerrains(cl, ED_A) === 'P-1', 'C-04 ⭐ le pointeur désigne le nouveau plan');
  verifier(planTerrainsPublie(cl, ED_A) !== null, 'C-05 le plan pointé est consommable');
  verifier(etatTerrainsPur(contexteTerrainsEdition(cl, ED_A, CATEGORIES)) === 'confirme',
    'C-06 ⭐ et l\'état devient « confirme »');

  const proj = projectionRepartitionTerrains(planTerrainsPublie(cl, ED_A));
  verifier(!proj.error && Object.keys(proj.repartition).length === 4 &&
           proj.repartition['Rugby 1'].join(',') === '1,2',
    'C-07 ⭐ le plan relu du classeur se projette exactement');
}
{
  // ⭐ Le point central : pendant l'écriture du candidat, l'ANCIEN plan ne bouge pas.
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), '2026-09-02 10:00:00');
  const ancien = JSON.stringify(lirePlanTerrains(cl, ED_A, 'P-1'));
  const pointeurAvant = pointeurPlanTerrains(cl, ED_A);

  const gen = generateur('Q');
  const r = publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '7' } }), CATEGORIES,
    gen, '2026-09-02 11:00:00', 'plan');
  verifier(r.arrete === 'plan' && r.plan_id === 'Q-1',
    'C-08 interruption après l\'écriture des trois blocs du candidat');
  verifier(pointeurPlanTerrains(cl, ED_A) === pointeurAvant,
    'C-09 ⭐⭐ LE POINTEUR N\'A PAS BOUGÉ');
  verifier(JSON.stringify(lirePlanTerrains(cl, ED_A, 'P-1')) === ancien,
    'C-10 ⭐⭐ l\'ANCIEN PLAN est intact, bit à bit');
  verifier(lirePlanTerrains(cl, ED_A, 'Q-1') !== null,
    'C-11 le candidat Q-1 est bien écrit dans le classeur…');
  verifier(planTerrainsPublie(cl, ED_A).plan_id === 'P-1',
    'C-12 ⭐⭐ …et pourtant INVISIBLE : le plan consommable reste P-1');
}
{
  // ⭐ Un pointeur qui désigne un plan incomplet, ou inconnu : échec fermé.
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), '2026-09-02 10:00:00');
  ecrirePointeurPlanTerrains(cl, ED_A, 'JAMAIS-ECRIT');
  verifier(planTerrainsPublie(cl, ED_A) === null,
    'C-13 ⛔ pointeur désignant un plan INCONNU ⇒ aucun plan consommable');
  verifier(etatTerrainsPur(contexteTerrainsEdition(cl, ED_A, CATEGORIES)) === 'absent',
    'C-14 ⛔ et l\'état retombe fermé, jamais « confirme »');

  ecrirePointeurPlanTerrains(cl, ED_A, 'P-1');
  const oMini = cl.getSheetByName('MiniTerrains');
  oMini._lignes().length = 1;                       // ⚠️ corruption : on vide le bloc
  verifier(planTerrainsPublie(cl, ED_A) === null,
    'C-15 ⛔ pointeur valide mais bloc MiniTerrains vidé ⇒ aucun plan consommable');
}
/* ⭐⭐ L'INVARIANT CENTRAL, ÉPROUVÉ SOUS TOUTES SES FORMES : « un pointeur non vide ne
   suffit JAMAIS ». ⚠️ Chacune de ces corruptions laisse un plan que `lirePlanTerrains`
   ASSEMBLE sans broncher — seule la validation les arrête. Sans ces cas, une version de
   `planTerrainsPublie` qui sauterait `planPublieValide` passerait presque inaperçue. */
{
  const corruptions = [
    ['signature vidée à la main', (cl) => {
      const o = cl.getSheetByName('TerrainsPlan');
      const col = o._lignes()[0].indexOf('signature');
      o._lignes()[1][col] = '';
    }],
    ['deux terrains retenus homonymes', (cl) => {
      const o = cl.getSheetByName('Terrains');
      const col = o._lignes()[0].indexOf('snap_nom');
      o._lignes()[2][col] = o._lignes()[1][col];
    }],
    ['un mini-terrain rattaché à un terrain inconnu', (cl) => {
      const o = cl.getSheetByName('MiniTerrains');
      const col = o._lignes()[0].indexOf('terrain_id');
      o._lignes()[1][col] = 'FANTOME';
    }],
    ['un numéro de mini-terrain en double', (cl) => {
      const o = cl.getSheetByName('MiniTerrains');
      const col = o._lignes()[0].indexOf('numero');
      o._lignes()[2][col] = o._lignes()[1][col];
    }],
    ['un terrain retenu sans nom', (cl) => {
      const o = cl.getSheetByName('Terrains');
      const col = o._lignes()[0].indexOf('snap_nom');
      o._lignes()[1][col] = '';
    }],
    ['une ligne rattachée à une AUTRE édition', (cl) => {
      const o = cl.getSheetByName('Terrains');
      o._lignes()[1][0] = 'ED-AILLEURS';
    }]
  ];
  let toutesFermees = true, laquelle = '';
  corruptions.forEach(([nom, abimer]) => {
    const cl = classeurPret();
    publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 't1');
    if (planTerrainsPublie(cl, ED_A) === null) { toutesFermees = false; laquelle = nom + ' (départ)'; }
    abimer(cl);
    verifier(pointeurPlanTerrains(cl, ED_A) === 'P-1',
      'C-15/' + nom + ' — le pointeur est toujours « P-1 »…');
    if (planTerrainsPublie(cl, ED_A) !== null) { toutesFermees = false; laquelle = nom; }
  });
  verifier(toutesFermees,
    'C-15 bis ⭐⭐ UN POINTEUR NON VIDE NE SUFFIT JAMAIS : les six corruptions rendent `null` ' +
    (laquelle ? '(fautive : ' + laquelle + ')' : ''));
}
{
  // ⭐ Doublon de ligne TerrainsPlan : ambiguïté, on ne choisit jamais.
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), '2026-09-02 10:00:00');
  const oPlan = cl.getSheetByName('TerrainsPlan');
  oPlan._lignes().push(oPlan._lignes()[1].slice());
  verifier(lirePlanTerrains(cl, ED_A, 'P-1') === null && planTerrainsPublie(cl, ED_A) === null,
    'C-16 ⭐ DEUX lignes TerrainsPlan pour un même plan_id ⇒ refus (⛔ jamais au hasard)');
}
{
  // ⛔ Publier sans structure : refus, et zéro écriture.
  const cl = classeurPret(false);
  const avant = empreinte(cl);
  const r = publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 'x');
  verifier(!!r.error && /[Ss]tructure/.test(r.error), 'C-17 ⛔ publier sans structure ⇒ REFUS motivé');
  verifier(empreinte(cl) === avant, 'C-18 ⭐ et AUCUNE écriture n\'a eu lieu');
}
{
  // ⛔ Un plan invalide est refusé AVANT la première écriture.
  const cl = classeurPret();
  const avant = empreinte(cl);
  const casse = planEssai({ terrains: [terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 1')] });
  const r = publierPlanTerrains(cl, ED_A, casse, CATEGORIES, generateur('P'), 'x');
  verifier(!!r.error && r.ecarts && r.ecarts.length > 0,
    'C-19 ⛔ plan en COLLISION de noms ⇒ refus motivé, avec les écarts');
  verifier(empreinte(cl) === avant,
    'C-20 ⭐⭐ le refus est ANTÉRIEUR à toute écriture : classeur identique bit à bit');
}
/* ========================================================================== */
/*  C-23 — ⭐⭐ UN REFUS NE LAISSE AUCUNE TRACE, MÊME S'IL Y A DES ORPHELINS    */
/*                                                                            */
/*  ⚠️ CE SCÉNARIO EST NÉ D'UNE INCOHÉRENCE RÉELLE, relevée en revue de B2-3.b : */
/*  `publierPlanTerrains` BALAYAIT les plans orphelins AVANT de valider le      */
/*  candidat. Les deux garanties annoncées ne tenaient donc pas ensemble —      */
/*  « un candidat refusé ne laisse aucune trace » devenait FAUX dès que         */
/*  l'édition portait un orphelin, puisqu'il avait déjà été supprimé.          */
/*                                                                            */
/*  ⭐ Le scénario réunit VOLONTAIREMENT les quatre conditions à la fois : un    */
/*  plan publié valide, un pointeur valide, un orphelin préexistant, et un      */
/*  candidat invalide. C'est leur CONJONCTION qui révèle le défaut — chacune    */
/*  prise seule laissait le test passer.                                       */
/* ========================================================================== */
{
  const cl = classeurPret();

  // ① Un plan publié valide, et son pointeur.
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 't1');

  // ② Un plan ORPHELIN préexistant : une confirmation interrompue avant la bascule.
  publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '7' } }), CATEGORIES,
    generateur('ORPH'), 't2', 'plan');

  verifier(pointeurPlanTerrains(cl, ED_A) === 'P-1' &&
           plansOrphelinsTerrains(cl, ED_A).join(',') === 'ORPH-1',
    'C-23 ⓪ le décor est planté : plan publié « P-1 », orphelin « ORPH-1 »');

  // ③ L'état EXACT du classeur, et le compteur d'écritures, juste avant l'appel refusé.
  const avantBits = empreinte(cl);
  const avantPlanPublie = JSON.stringify(lirePlanTerrains(cl, ED_A, 'P-1'));
  const avantOrphelin = JSON.stringify(lirePlanTerrains(cl, ED_A, 'ORPH-1'));
  const avantEcritures = cl._ecritures().total();

  // ④ Un candidat INVALIDE : deux grands terrains retenus portent le même nom.
  const invalide = planEssai({ terrains: [terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 1')] });
  const r = publierPlanTerrains(cl, ED_A, invalide, CATEGORIES, generateur('X'), 't3');

  verifier(!!r.error && r.ecarts && r.ecarts.length > 0,
    'C-23 ① le candidat est REFUSÉ, avec ses écarts');
  verifier(JSON.stringify(lirePlanTerrains(cl, ED_A, 'ORPH-1')) === avantOrphelin &&
           plansOrphelinsTerrains(cl, ED_A).join(',') === 'ORPH-1',
    'C-23 ② ⭐⭐ L\'ORPHELIN EXISTE TOUJOURS — ⛔ le refus n\'a rien balayé');
  verifier(pointeurPlanTerrains(cl, ED_A) === 'P-1' &&
           JSON.stringify(lirePlanTerrains(cl, ED_A, 'P-1')) === avantPlanPublie,
    'C-23 ③ ⭐ le plan publié et son pointeur sont INCHANGÉS');
  verifier(empreinte(cl) === avantBits,
    'C-23 ④ ⭐⭐ les trois onglets (et Editions) sont identiques BIT À BIT');
  verifier(cl._ecritures().total() === avantEcritures,
    'C-23 ⑤ ⭐⭐ AUCUNE méthode d\'écriture du faux classeur n\'a été appelée — ' +
    'constaté : ' + (cl._ecritures().total() - avantEcritures) + ' appel(s)');
  verifier(planTerrainsPublie(cl, ED_A) !== null &&
           planTerrainsPublie(cl, ED_A).plan_id === 'P-1',
    'C-23 ⑥ ⭐ et le plan reste consommable, exactement comme avant');

  // ⑤ ⭐ LA CONTREPARTIE : le balayage n'a pas disparu, il a seulement CHANGÉ DE PLACE.
  //    Un candidat VALIDE, lui, doit toujours faire le ménage.
  const r2 = publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '7' } }), CATEGORIES,
    generateur('Y'), 't4');
  verifier(r2.ok && pointeurPlanTerrains(cl, ED_A) === 'Y-1',
    'C-23 ⑦ un candidat VALIDE publie normalement…');
  verifier(plansOrphelinsTerrains(cl, ED_A).length === 0 &&
           lirePlanTerrains(cl, ED_A, 'ORPH-1') === null,
    'C-23 ⑧ ⭐⭐ …et balaie bien l\'orphelin : le balayage a changé de PLACE, ⛔ pas disparu');
}

{
  // ⭐ Le client ne choisit pas le plan_id : il vient du générateur injecté.
  const cl = classeurPret();
  const p = planEssai();
  p.params.plan_id = 'CHOISI-PAR-LE-CLIENT';
  const r = publierPlanTerrains(cl, ED_A, p, CATEGORIES, generateur('P'), 'x');
  verifier(r.ok && r.plan_id === 'P-1' && pointeurPlanTerrains(cl, ED_A) === 'P-1',
    'C-21 ⭐ un plan_id envoyé par le client est IGNORÉ : seul le générateur décide');
  verifier(lirePlanTerrains(cl, ED_A, 'CHOISI-PAR-LE-CLIENT') === null,
    'C-22 ⛔ et rien n\'est écrit sous l\'identifiant qu\'il proposait');
}

/* ========================================================================== */
/*  D — ISOLATION ENTRE ÉDITIONS ET ENTRE PLANS                               */
/* ========================================================================== */

console.log('\n--- D : isolation ---');

{
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('A'), 't1');
  publierPlanTerrains(cl, ED_B, planEssai({ minis: [mini(1, 'T1', 'U8'), mini(2, 'T2', 'U8'),
    mini(3, 'T3', 'U10'), mini(4, 'T4', 'U10')],
    params: { dimensions_json: DIMENSIONS } }),
    [{ categorie: 'U8', presente: 'oui', terrains: '1,2', terrains_auto: 'oui' },
     { categorie: 'U10', presente: 'oui', terrains: '3,4', terrains_auto: 'oui' }],
    generateur('B'), 't2');

  verifier(pointeurPlanTerrains(cl, ED_A) === 'A-1' && pointeurPlanTerrains(cl, ED_B) === 'B-1',
    'D-01 deux éditions, deux pointeurs distincts');
  const pA = planTerrainsPublie(cl, ED_A), pB = planTerrainsPublie(cl, ED_B);
  verifier(pA.minis.length === 6 && pB.minis.length === 4,
    'D-02 ⭐ chaque édition rend SON plan (6 mini-terrains contre 4)');
  verifier(pA.minis.every((m) => m.edition_id === ED_A) &&
           pB.minis.every((m) => m.edition_id === ED_B),
    'D-03 ⛔ AUCUN MÉLANGE : chaque ligne porte son édition');
  verifier(pA.terrains.every((t) => t.plan_id === 'A-1') &&
           pB.terrains.every((t) => t.plan_id === 'B-1'),
    'D-04 ⛔ ni mélange de plan_id');

  // ⭐ Une édition FERMÉE reste relisible par son propre pointeur.
  verifier(planTerrainsPublie(cl, ED_B) !== null && pB.plan_id === 'B-1',
    'D-05 ⭐ une édition FERMÉE reste relisible par SON pointeur');
  const projB = projectionRepartitionTerrains(pB);
  verifier(!projB.error && projB.repartition['Rugby 1'].join(',') === '1',
    'D-06 ⭐ et sa projection historique est exacte');
}
{
  // ⭐ Une nouvelle édition, sans pointeur ⇒ absent, sans toucher aux autres.
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('A'), 't1');
  const oEdt = cl.getSheetByName('Editions');
  oEdt._lignes().push(['ED-2028', 'active', '2027-09-01 10:00:00', '', '']);
  verifier(planTerrainsPublie(cl, 'ED-2028') === null &&
           etatTerrainsPur(contexteTerrainsEdition(cl, 'ED-2028', CATEGORIES)) === 'absent',
    'D-07 ⭐ une NOUVELLE édition, sans pointeur ⇒ « absent » par construction');
  verifier(planTerrainsPublie(cl, ED_A) !== null,
    'D-08 ⛔ et l\'édition précédente n\'a pas bougé');
}
{
  // ⭐ Deux plans de la MÊME édition coexistent sans se mélanger.
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 't1');
  const gen = generateur('Q');
  publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '9' } }), CATEGORIES, gen,
    't2', 'plan');
  const p1 = lirePlanTerrains(cl, ED_A, 'P-1'), q1 = lirePlanTerrains(cl, ED_A, 'Q-1');
  verifier(p1 && q1 && p1.params.couloir_m === '5' && q1.params.couloir_m === '9',
    'D-09 ⭐ deux plans de la même édition coexistent, chacun avec ses valeurs');
  verifier(p1.minis.every((m) => m.plan_id === 'P-1') && q1.minis.every((m) => m.plan_id === 'Q-1'),
    'D-10 ⛔ et leurs mini-terrains ne se mélangent pas');
}

/* ========================================================================== */
/*  E — LE BROUILLON                                                          */
/* ========================================================================== */

console.log('\n--- E : le brouillon ---');

{
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 't1');
  const pointeAvant = JSON.stringify(lirePlanTerrains(cl, ED_A, 'P-1'));

  const br = planEssai({ params: { couloir_m: '8', plan_id: 'IGNORE-MOI' } });
  const r = ecrireBrouillonTerrains(cl, ED_A, br, generateur('BR'));
  verifier(!r.error && r.plan_id === 'BR-1',
    'E-01 ⭐ le brouillon s\'écrit sous un identifiant FABRIQUÉ (⛔ pas celui du client)');
  verifier(lirePlanTerrains(cl, ED_A, 'IGNORE-MOI') === null,
    'E-01 bis ⛔ le plan_id proposé par le client est ignoré');
  verifier(JSON.stringify(lirePlanTerrains(cl, ED_A, 'P-1')) === pointeAvant,
    'E-02 ⭐⭐ écrire le brouillon NE TOUCHE PAS au plan pointé, bit à bit');
  verifier(planTerrainsPublie(cl, ED_A).plan_id === 'P-1',
    'E-03 ⭐ et le plan consommable reste le plan pointé');
  verifier(etatTerrainsPur(contexteTerrainsEdition(cl, ED_A, CATEGORIES)) === 'a_reconfirmer',
    'E-04 ⭐ l\'état passe à « a_reconfirmer »');
  verifier(lireBrouillonTerrains(cl, ED_A).params.couloir_m === '8',
    'E-05 le brouillon se relit avec ses propres valeurs');
  /* ⭐⭐ « UN BROUILLON N'EST JAMAIS SIGNÉ » — et il faut LUI EN DONNER UNE pour le prouver.
     ⚠️ Une première version passait un plan sans signature : effacer la ligne qui la vide ne
     changeait alors rien, et la mutation restait invisible. On fournit donc une signature
     crédible, et l'on exige qu'elle soit écartée. */
  const signe = planEssai({ params: { couloir_m: '8' } });
  signe.params.signature = 'SIGNATURE-QUI-NE-DOIT-PAS-SURVIVRE';
  ecrireBrouillonTerrains(cl, ED_A, signe, generateur('XX'));
  verifier(lireBrouillonTerrains(cl, ED_A).params.signature === '',
    'E-06 ⭐⭐ un brouillon n\'est JAMAIS signé — même si on lui fournit une signature');
  {
    /* ⭐ Et voici POURQUOI cela compte : un brouillon signé qui serait pointé par erreur
       passerait pour un plan confirmé. Sans signature, il reste inconsommable. */
    const cl2 = classeurPret();
    const s2 = planEssai();
    s2.params.signature = 'SIGNATURE-INVENTEE';
    const rb = ecrireBrouillonTerrains(cl2, ED_A, s2, generateur('BR'));
    ecrirePointeurPlanTerrains(cl2, ED_A, rb.plan_id);
    verifier(planTerrainsPublie(cl2, ED_A) === null,
      'E-06 bis ⭐⭐ un BROUILLON pointé par erreur reste INCONSOMMABLE (il n\'est pas signé)');
  }

  // Un second enregistrement réutilise le MÊME plan_id : un seul brouillon par édition.
  const br2 = planEssai({ params: { couloir_m: '9', plan_id: 'AUTRE' } });
  ecrireBrouillonTerrains(cl, ED_A, br2, generateur('ZZ'));
  const brouillons = lireTerrainsPlan(cl).filter((l) => l.edition_id === ED_A && l.role === 'brouillon');
  verifier(brouillons.length === 1 && brouillons[0].plan_id === 'BR-1',
    'E-07 ⭐ UN SEUL brouillon par édition : le second enregistrement réutilise son identifiant');
  verifier(lireBrouillonTerrains(cl, ED_A).params.couloir_m === '9',
    'E-08 et il porte bien la nouvelle valeur');
}
{
  // ⭐ Après publication, le brouillon disparaît — et pas avant.
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 't1');
  ecrireBrouillonTerrains(cl, ED_A, planEssai(), generateur('BR'));
  verifier(lireBrouillonTerrains(cl, ED_A) !== null, 'E-09 le brouillon existe avant la publication');
  publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '6' } }), CATEGORIES,
    generateur('Q'), 't2');
  verifier(lireBrouillonTerrains(cl, ED_A) === null,
    'E-10 ⭐ après publication réussie, le brouillon est nettoyé');
  verifier(etatTerrainsPur(contexteTerrainsEdition(cl, ED_A, CATEGORIES)) === 'confirme',
    'E-11 ⭐ et l\'état revient à « confirme »');
  verifier(lirePlanTerrains(cl, ED_A, 'P-1') === null,
    'E-12 l\'ancien plan pointé est nettoyé lui aussi');
}

/* ========================================================================== */
/*  F — INTERRUPTIONS ET CONVERGENCE                                          */
/* ========================================================================== */

console.log('\n--- F : interruptions, et ce que les lecteurs obtiennent ---');

const POINTS = ['mini', 'terrains', 'plan', 'avantPublication'];
POINTS.forEach((point, i) => {
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 't1');
  const ancienBit = JSON.stringify(lirePlanTerrains(cl, ED_A, 'P-1'));
  const r = publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '7' } }), CATEGORIES,
    generateur('Q'), 't2', point);
  verifier(r.arrete === point, 'F-' + (i + 1) + 'a interruption « ' + point +' » atteinte');
  verifier(pointeurPlanTerrains(cl, ED_A) === 'P-1',
    'F-' + (i + 1) + 'b ⭐ le pointeur désigne TOUJOURS l\'ancien plan');
  verifier(JSON.stringify(lirePlanTerrains(cl, ED_A, 'P-1')) === ancienBit,
    'F-' + (i + 1) + 'c ⭐⭐ l\'ancien plan est intact BIT À BIT');
  verifier(planTerrainsPublie(cl, ED_A).plan_id === 'P-1',
    'F-' + (i + 1) + 'd ⭐ les lecteurs obtiennent l\'ancien plan, JAMAIS un mélange');
  // ⭐ Convergence : une relance complète publie et nettoie.
  const r2 = publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '7' } }), CATEGORIES,
    generateur('R'), 't3');
  verifier(r2.ok && pointeurPlanTerrains(cl, ED_A) === 'R-1',
    'F-' + (i + 1) + 'e ⭐ une RELANCE converge : le nouveau plan est publié');
  verifier(plansOrphelinsTerrains(cl, ED_A).length === 0,
    'F-' + (i + 1) + 'f ⭐ et le candidat abandonné a été balayé');
});
{
  // Interruption APRÈS la publication : le nouveau plan fait déjà foi.
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 't1');
  const r = publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '7' } }), CATEGORIES,
    generateur('Q'), 't2', 'apresPublication');
  verifier(r.ok && r.arrete === 'apresPublication' && pointeurPlanTerrains(cl, ED_A) === 'Q-1',
    'F-5a ⭐ après la bascule, le pointeur désigne le NOUVEAU plan');
  verifier(planTerrainsPublie(cl, ED_A).params.couloir_m === '7',
    'F-5b ⭐ et les lecteurs obtiennent le nouveau plan, entier');
  verifier(lirePlanTerrains(cl, ED_A, 'P-1') !== null,
    'F-5c l\'ancien plan traîne encore (nettoyage non fait) — ⛔ mais il n\'est plus lu');
  const r2 = publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '7' } }), CATEGORIES,
    generateur('R'), 't3');
  verifier(r2.ok && lirePlanTerrains(cl, ED_A, 'P-1') === null,
    'F-5d ⭐ une relance nettoie le résidu');
}
{
  // Interruption PENDANT le nettoyage : l'ancien est parti, le brouillon reste.
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 't1');
  ecrireBrouillonTerrains(cl, ED_A, planEssai(), generateur('BR'));
  const r = publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '7' } }), CATEGORIES,
    generateur('Q'), 't2', 'nettoyage');
  verifier(r.ok && r.arrete === 'nettoyage' && pointeurPlanTerrains(cl, ED_A) === 'Q-1',
    'F-6a ⭐ le nouveau plan fait foi malgré le nettoyage inachevé');
  verifier(planTerrainsPublie(cl, ED_A).plan_id === 'Q-1',
    'F-6b ⭐⭐ et un nettoyage interrompu n\'a JAMAIS entamé le plan pointé');
  verifier(lireBrouillonTerrains(cl, ED_A) !== null,
    'F-6c le brouillon résiduel est encore là…');
  verifier(etatTerrainsPur(contexteTerrainsEdition(cl, ED_A, CATEGORIES)) === 'a_reconfirmer',
    'F-6d ⭐ …et les lecteurs STRICTS voient donc « a_reconfirmer » : le défaut ferme');
}
{
  // ⛔ Le balayage ne peut PAS supprimer le plan pointé, ni le brouillon.
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 't1');
  ecrireBrouillonTerrains(cl, ED_A, planEssai(), generateur('BR'));
  publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '7' } }), CATEGORIES,
    generateur('Q'), 't2', 'plan');   // laisse Q-1 orphelin
  const orphelins = plansOrphelinsTerrains(cl, ED_A);
  verifier(orphelins.length === 1 && orphelins[0] === 'Q-1',
    'F-7a ⭐ le candidat abandonné est le SEUL orphelin (pointé et brouillon exclus)');
  balayerPlansOrphelins(cl, ED_A);
  verifier(planTerrainsPublie(cl, ED_A).plan_id === 'P-1',
    'F-7b ⭐⭐ le balayage n\'a PAS touché au plan pointé');
  verifier(lireBrouillonTerrains(cl, ED_A) !== null,
    'F-7c ⛔ ni au brouillon');
  verifier(lirePlanTerrains(cl, ED_A, 'Q-1') === null, 'F-7d et l\'orphelin est bien parti');
  verifier(supprimerPlanTerrains(cl, ED_A, 'P-1').error !== undefined,
    'F-7e ⭐⭐ SECOND VERROU : supprimer le plan POINTÉ est refusé, explicitement');
}

/* ========================================================================== */
/*  G — VOISINAGE : ce qui ne doit pas bouger                                  */
/* ========================================================================== */

console.log('\n--- G : voisinage ---');

{
  const cl = classeurPret();
  const config = fauxOnglet('Config', [['parametre', 'valeur'],
    ['terrains_physiques', '[{"id":"T1","nom":"Rugby 1"}]'],
    ['repartition_grands_terrains', '{"Rugby 1":["1","2"]}'],
    ['couloir_terrain_m', '5']]);
  cl._table.Config = config;
  const configAvant = JSON.stringify(config._lignes());
  const editionsAvant = JSON.stringify(cl.getSheetByName('Editions')._lignes().map((l) => l.slice(0, 4)));

  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 't1');
  ecrireBrouillonTerrains(cl, ED_A, planEssai(), generateur('BR'));
  publierPlanTerrains(cl, ED_A, planEssai({ params: { couloir_m: '7' } }), CATEGORIES,
    generateur('Q'), 't2');

  verifier(JSON.stringify(config._lignes()) === configAvant,
    'G-01 ⭐⭐ AUCUN champ de Config n\'est touché (terrains_physiques, répartition, couloir)');
  verifier(JSON.stringify(cl.getSheetByName('Editions')._lignes().map((l) => l.slice(0, 4))) ===
           editionsAvant,
    'G-02 ⭐⭐ aucune colonne VOISINE d\'Editions n\'est modifiée — seule la 5ᵉ bouge');
  verifier(pointeurPlanTerrains(cl, ED_B) === '',
    'G-03 ⛔ l\'autre édition n\'a reçu aucun pointeur');
  verifier(lireTerrainsPlan(cl).filter((l) => l.edition_id === ED_B).length === 0,
    'G-04 ⛔ et aucune de ses lignes n\'a été créée ou supprimée');
}
{
  // ⭐ Aucune colonne sans en-tête : le faux classeur se comporte comme une grille, donc
  //   une écriture trop large LAISSERAIT UNE TRACE. On vérifie qu'il n'y en a aucune.
  const cl = classeurPret();
  publierPlanTerrains(cl, ED_A, planEssai(), CATEGORIES, generateur('P'), 't1');
  let propre = true;
  ['TerrainsPlan', 'Terrains', 'MiniTerrains', 'Editions'].forEach((n) => {
    const lignes = cl.getSheetByName(n)._lignes();
    const nbEntetes = lignes[0].filter((h) => String(h || '').trim() !== '').length;
    lignes.slice(1).forEach((l) => {
      for (let j = nbEntetes; j < l.length; j++) {
        if (l[j] !== '' && l[j] !== null && l[j] !== undefined) propre = false;
      }
    });
  });
  verifier(propre,
    'G-05 ⭐⭐ AUCUNE donnée n\'est écrite dans une colonne SANS EN-TÊTE (le piège d\'ENTETES.Editions)');
}

/* ========================================================================== */
/*  H — LA SÉRIE APPS SCRIPT B2-3.b, EXÉCUTÉE ICI                             */
/* ========================================================================== */

console.log('\n--- H : la série Apps Script B2-3.b, exécutée localement ---');

const SOURCE_TESTS = fs.readFileSync(path.join(RACINE, 'backend/Tests.gs'), 'utf8');

function extraireFonctionTests(nom) {
  const motif = new RegExp('^function\\s+' + nom + '\\s*\\(', 'm');
  const trouve = motif.exec(SOURCE_TESTS);
  if (!trouve) throw new Error('Fonction introuvable dans backend/Tests.gs : « ' + nom + ' »');
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
  const motif = new RegExp('^var\\s+' + nom + '\\s*=[\\s\\S]*?;\\s*$', 'm');
  const trouve = motif.exec(SOURCE_TESTS);
  if (!trouve) throw new Error('Variable introuvable dans backend/Tests.gs : « ' + nom + ' »');
  return trouve[0];
}

const APPELS = (SOURCE_TESTS.match(/^\s{2}(testB23b_[A-Za-z0-9_]+)\(etat\);$/gm) || [])
  .map((l) => l.trim().replace(/\(etat\);$/, ''));

verifier(APPELS.length >= 6,
  'H-00 ⭐ la série B2-3.b est bien APPELÉE par lancerTestsFFR (' + APPELS.length + ' tests)');

vm.runInContext(
  extraireVariableTests('_B23B_ED') + '\n' +
  ['_b23bCompteur', '_b23bTotalEcritures', '_b23bFauxOnglet', '_b23bFauxClasseur',
   '_b23bEditions', '_b23bClasseurPret', '_b23bTerrain', '_b23bMini',
   '_b23bPlan', '_b23bCategories', '_b23bGenerateur', '_b23bEmpreinte']
    .concat(APPELS).map(extraireFonctionTests).join('\n') + '\n' +
  'function _ffrAssert(e, c, l) { e.total++; if (c) { e.ok++; } else { e.fail++; e.echecs.push(l); } }',
  bac, { filename: 'backend/Tests.gs (extrait B2-3.b)' });

const etatGoogle = { total: 0, ok: 0, fail: 0, echecs: [] };
APPELS.forEach((nom) => {
  const avantOk = etatGoogle.ok, avantTotal = etatGoogle.total;
  vm.runInContext(nom, bac)(etatGoogle);
  const passees = etatGoogle.ok - avantOk, jouees = etatGoogle.total - avantTotal;
  verifier(jouees > 0 && passees === jouees,
    'H : ' + nom + ' — ' + passees + '/' + jouees + ' assertion(s) Apps Script');
});
if (etatGoogle.fail) console.log('  ⚠️ en échec : ' + etatGoogle.echecs.join(' | '));
verifier(etatGoogle.fail === 0 && etatGoogle.total >= 25,
  'H-FIN ⭐⭐ la série Apps Script B2-3.b passe ENTIÈREMENT ici : ' + etatGoogle.ok + '/' +
  etatGoogle.total + ' assertions, ' + etatGoogle.fail + ' échec(s)');

/* -------------------------------------------------------------------------- */

console.log('==============================================');
console.log('B2-3.b persistance — ' + etat.ok + '/' + etat.total + ' OK, ' + etat.fail + ' ÉCHEC(S)');
if (etat.fail) console.log('Échecs : ' + etat.echecs.join(' | '));
console.log('==============================================');
process.exit(etat.fail ? 1 : 0);
