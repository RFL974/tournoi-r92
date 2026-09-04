/**
 * ============================================================================
 *  GARDE-FOU BACKEND — la BASCULE DES CONSOMMATEURS (M1-B2 / B2-3.c, R-101)
 *  Conception validée : voir docs/industrialisation/PLAN.md §16.5 (lot B2-3)
 * ============================================================================
 *
 *  ▶ Pour lancer :  node tests/backend-terrains-bascule.test.js
 *    (aucune dépendance, aucun navigateur, aucun réseau, ⛔ aucun Google — Node seul)
 *
 *  CE QU'IL PROTÈGE.
 *
 *  B2-3.a a posé le socle, B2-3.b la persistance — ⛔ et personne ne les lisait. B2-3.c
 *  branche les LECTEURS du serveur sur le plan publié de l'ÉDITION ACTIVE. Ce lot-ci ne se
 *  prouve donc pas en montrant qu'une fonction rend la bonne valeur : ⭐ il se prouve en
 *  montrant que les CONSOMMATEURS RÉELS ont changé de source, et qu'⛔ aucun d'eux ne peut
 *  y revenir sans qu'un test tombe.
 *
 *  ⚠️ POURQUOI CE BANC CHARGE `Code.gs` ET `Tests.gs` EN ENTIER, là où ses deux aînés
 *  extrayaient fonction par fonction. Parce que la preuve centrale de B2-3.c est la CEINTURE
 *  DU RESET : elle exige d'exécuter le VRAI `reinitialiserTournoi`, qui dépend de la moitié
 *  du fichier. ⭐ Extraire ce cortège reviendrait à réécrire l'application dans le test — et
 *  un test qui réécrit ce qu'il surveille ne surveille rien (leçon ③ de la session 35).
 *  ⛔ Les services Google ne sont PAS émulés : ce sont des doublures inertes, et le banc
 *  échoue bruyamment si un chemin testé essaie vraiment de s'en servir.
 *
 *  ⭐ ET IL REJOUE LA SÉRIE APPS SCRIPT (leçon ④ de la session 35) : une série écrite chez
 *  Google mais jamais lancée n'est pas un garde-fou.
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
/*  LE BAC — Apps Script réduit à des doublures INERTES                       */
/*                                                                            */
/*  ⛔ Aucune n'émule quoi que ce soit : `SpreadsheetApp` est un objet vide, et */
/*  c'est délibéré. Tout chemin qui l'appellerait lèverait — donc les tests    */
/*  ci-dessous ne peuvent PAS, par construction, s'appuyer sur un classeur     */
/*  ouvert par identifiant. Ils travaillent sur des faux classeurs injectés.   */
/* ========================================================================== */

function fabriquerBac(sourceCode) {
  let compteurUuid = 0;
  const journal = [];
  const bac = vm.createContext({
    Logger: { log: (m) => journal.push(String(m)) },
    Utilities: {
      // ⭐ Un UUID de la BONNE LONGUEUR : un test de B2-1 vérifie `length >= 8`, et une
      //    doublure trop courte le ferait échouer pour une raison qui n'a rien à voir.
      getUuid: () => {
        compteurUuid++;
        const n = String(compteurUuid).padStart(4, '0');
        return '0000' + n + '-aaaa-bbbb-cccc-' + n.padStart(12, '0');
      },
      formatDate: () => '2026-09-03 12:00:00',
      newBlob: () => ({ getBytes: () => [] }),
      base64Decode: () => [], base64Encode: () => '',
      computeDigest: () => [], DigestAlgorithm: { MD5: 'MD5' },
      Charset: { UTF_8: 'UTF_8' }, sleep: () => {}
    },
    Session: {
      getScriptTimeZone: () => 'Europe/Paris',
      getActiveUser: () => ({ getEmail: () => '' }),
      getEffectiveUser: () => ({ getEmail: () => '' })
    },
    SpreadsheetApp: {},
    DriveApp: { getFileById() { throw new Error('DriveApp inerte dans ce banc'); } },
    CacheService: {}, PropertiesService: {}, LockService: {},
    ContentService: {}, UrlFetchApp: {}, MailApp: {}, GmailApp: {}, HtmlService: {}
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
    throw new Error('Fonction introuvable dans backend/Code.gs : « ' + nom +' ». ' +
      'Si elle a été renommée, mets ce garde-fou à jour — ne le supprime pas.');
  }
  return f;
};

const sourceTerrainsEditionActive = F('sourceTerrainsEditionActive');
const repartitionTerrainsEditionActive = F('repartitionTerrainsEditionActive');
const naturesTerrainsEditionActive = F('naturesTerrainsEditionActive');
const configAvecTerrainsEdition = F('configAvecTerrainsEdition');
const lireConfigPublique = F('lireConfigPublique');
const assemblerDossierAutorisation = F('assemblerDossierAutorisation');
const publierPlanTerrains = F('publierPlanTerrains');
const assurerStructureTerrainsB23 = F('assurerStructureTerrainsB23');
const structureTerrainsB23EnPlace = F('structureTerrainsB23EnPlace');
const ENTETES = vm.runInContext('ENTETES', bac);
const CONFIG_PUBLIQUE_VUES = vm.runInContext('CONFIG_PUBLIQUE_VUES', bac);

/* ========================================================================== */
/*  Assertions                                                                */
/* ========================================================================== */

const etat = { total: 0, ok: 0, fail: 0, echecs: [] };
function verifier(condition, libelle) {
  etat.total++;
  if (condition) { etat.ok++; console.log('  OK    ' + libelle); }
  else { etat.fail++; etat.echecs.push(libelle); console.log('  ÉCHEC ' + libelle); }
}
function titre(t) { console.log('\n-- ' + t + ' --'); }

/* ========================================================================== */
/*  LE FAUX CLASSEUR — une GRILLE, comme celui de B2-3.b                      */
/* ========================================================================== */

function compteur() {
  return { setValues: 0, setValue: 0, clearContent: 0, insertSheet: 0,
    total() { return this.setValues + this.setValue + this.clearContent + this.insertSheet; } };
}

function fauxOnglet(nom, lignes, ecrit) {
  const d = (lignes || []).map((l) => l.slice());
  ecrit = ecrit || compteur();
  function assurerCellule(r, c) {
    while (d.length < r) d.push([]);
    while (d[r - 1].length < c) d[r - 1].push('');
  }
  const api = {
    _nom: nom,
    _lignes: () => d,
    getName: () => nom,
    getLastRow: () => {
      let dernier = 0;
      d.forEach((l, i) => { if (l.some((c) => c !== '' && c !== null && c !== undefined)) dernier = i + 1; });
      return dernier;
    },
    getLastColumn: () => {
      let dernier = 0;
      d.forEach((l) => l.forEach((c, j) => {
        if (c !== '' && c !== null && c !== undefined && j + 1 > dernier) dernier = j + 1;
      }));
      return dernier;
    },
    getMaxColumns: () => 26,
    insertColumnsAfter: () => api,
    setFrozenRows: () => api,
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
        setNumberFormat: () => plage, setBackground: () => plage,
        setFontColor: () => plage, setFontWeight: () => plage
      };
      return plage;
    }
  };
  return api;
}

function fauxClasseur(onglets, ecrit) {
  const table = {};
  ecrit = ecrit || compteur();
  (onglets || []).forEach((o) => { table[o._nom] = o; });
  return {
    _table: table,
    _ecritures: () => ecrit,
    getSheetByName: (n) => table[n] || null,
    insertSheet: (n) => { ecrit.insertSheet++; table[n] = fauxOnglet(n, [], ecrit); return table[n]; },
    getSpreadsheetTimeZone: () => 'Europe/Paris'
  };
}

const ED_A = 'ED-2026';
const ED_B = 'ED-2027';

/** ⭐ Le PIÈGE : un découpage qui n'appartient à aucun plan. Le rendre = retomber sur Config. */
const PIEGE = '{"Stade de l\'an dernier":["7","8","9"]}';

/** Un onglet `Config` RÉEL — zone A, puis l'en-tête `categorie`, puis la zone B. */
function ongletConfig(paramsGlobaux, categories, ecrit) {
  const lignes = [['— Réglages —', '']];
  Object.keys(paramsGlobaux).forEach((k) => lignes.push([k, paramsGlobaux[k]]));
  const colonnes = ['categorie', 'presente', 'terrains', 'terrains_auto'];
  lignes.push(colonnes);
  (categories || []).forEach((c) => lignes.push(colonnes.map((col) => (c[col] === undefined ? '' : c[col]))));
  return fauxOnglet('Config', lignes, ecrit);
}

function ongletEditions(lignes, ecrit) {
  return fauxOnglet('Editions', [ENTETES.Editions.slice()].concat(lignes || []), ecrit);
}

const CATEGORIES = [
  { categorie: 'U8', presente: 'oui', terrains: '1,2,3,4', terrains_auto: 'oui' },
  { categorie: 'U10', presente: 'oui', terrains: '5,6', terrains_auto: 'oui' }
];

function terrain(id, nom, sur) {
  return Object.assign({ terrain_id: id, selectionne: 'oui', snap_nom: nom, snap_type: 'rugby',
    snap_longueur_m: '115', snap_largeur_m: '70', snap_enbut_m: '0',
    snap_nature: 'Gazon', snap_pos: 'CG' }, sur || {});
}
function mini(numero, terrainId, categorie) {
  return { numero: String(numero), terrain_id: terrainId, categorie: categorie };
}
function planEssai(sur) {
  sur = sur || {};
  return {
    params: Object.assign({ role: 'plan', couloir_m: '5', tm_longueur_m: '4', tm_largeur_m: '4',
      dimensions_json: '{"U8":{"l":30,"w":20},"U10":{"l":40,"w":30}}' }, sur.params || {}),
    terrains: sur.terrains || [terrain('T1', 'Rugby 1'), terrain('T2', 'Rugby 2'),
      terrain('T3', 'Foot 1', { snap_nature: 'Synthétique' }),
      terrain('T4', 'Foot 2', { snap_nature: 'Synthétique' })],
    minis: sur.minis || [mini(1, 'T1', 'U8'), mini(2, 'T1', 'U8'), mini(3, 'T2', 'U8'),
      mini(4, 'T2', 'U8'), mini(5, 'T3', 'U10'), mini(6, 'T4', 'U10')]
  };
}
function generateur(prefixe) { let n = 0; return () => { n++; return prefixe + '-' + n; }; }

const PROJECTION_ATTENDUE = '{"Foot 1":["5"],"Foot 2":["6"],"Rugby 1":["1","2"],"Rugby 2":["3","4"]}';

/**
 * Un classeur COMPLET : `Config` (avec le piège), `Editions`, et — si demandé — la structure
 * B2-3 avec un plan publié pour l'édition A.
 */
function classeurComplet(options) {
  options = options || {};
  const ecrit = compteur();
  const editions = ongletEditions([[ED_A, 'active', '2026-09-01 10:00:00', '']], ecrit);
  const config = ongletConfig(Object.assign({
    tournoi_nom: 'Tournoi test', tournoi_publie: 'non',
    repartition_grands_terrains: PIEGE,
    terrains_physiques: '[{"nom":"Rugby 1","nature":"Gazon"},{"nom":"Vieux stade","nature":"Stabilisé"}]'
  }, options.global || {}), CATEGORIES, ecrit);
  const cl = fauxClasseur([config, editions,
    fauxOnglet('Equipes', [ENTETES.Equipes.slice()], ecrit),
    fauxOnglet('Poules', [ENTETES.Poules.slice()], ecrit),
    fauxOnglet('Matchs', [ENTETES.Matchs.slice()], ecrit),
    fauxOnglet('Sponsors', [['id_sponsor', 'nom', 'actif']], ecrit)], ecrit);
  let publication = null;
  if (options.structure) {
    assurerStructureTerrainsB23(cl);
    if (options.publie !== false) {
      publication = publierPlanTerrains(cl, ED_A, planEssai(options.plan), CATEGORIES,
        generateur('PL'), '2026-09-03 10:00:00');
    }
  }
  return { classeur: cl, config, editions, publication, ecritures: ecrit };
}

console.log('==============================================');
console.log('  B2-3.c — la bascule des consommateurs (R-101)');
console.log('==============================================');

/* ========================================================================== */
/*  SÉRIE A — LES CONSOMMATEURS RÉELS, appelés par leur vraie porte d'entrée   */
/* ========================================================================== */

titre('A — les vraies portes d\'entrée du serveur changent de source');

(function A1_vueLive() {
  // ⭐ `lireConfigPublique(classeur, 'live')` est EXACTEMENT ce que `construireSnapshot`
  //    appelle pour `getAll` : la page des scores et la page de saisie en dépendent.
  const sans = classeurComplet({ structure: false });
  const live1 = lireConfigPublique(sans.classeur, 'live');
  verifier(live1.global.repartition_grands_terrains === PIEGE,
    'A1 : sans structure, la vue LIVE rend la valeur de Config — comportement historique');

  const avec = classeurComplet({ structure: true });
  verifier(!!avec.publication && !!avec.publication.ok,
    'A1 : le plan d\'essai est publié (' + ((avec.publication || {}).error || 'ok') + ')');
  const live2 = lireConfigPublique(avec.classeur, 'live');
  verifier(live2.global.repartition_grands_terrains !== PIEGE,
    'A1 ⭐⭐ : avec structure, la vue LIVE ne rend PLUS la valeur piégée de Config');
  verifier(live2.global.repartition_grands_terrains === PROJECTION_ATTENDUE,
    'A1 ⭐ : elle rend la projection du plan publié de l\'édition active');
})();

(function A2_vueClub() {
  // ⭐ C'est CETTE vue que lit `frontend/js/dossier.js:resumeTerrains` — la phrase
  //    « 18 terrains de jeu, sur 4 grands terrains » d'un tournoi vide venait d'ici.
  const avec = classeurComplet({ structure: true });
  const club = lireConfigPublique(avec.classeur, 'club');
  verifier(club.global.repartition_grands_terrains === PROJECTION_ATTENDUE,
    'A2 ⭐ : la vue CLUB (dossier sous jeton) lit elle aussi le plan de l\'édition');

  // Édition NEUVE, sans plan : ⛔ aucun terrain hérité. C'est le critère de R-101.
  const lignes = avec.editions._lignes();
  for (let i = 1; i < lignes.length; i++) { if (String(lignes[i][0]) === ED_A) lignes[i][1] = 'fermee'; }
  lignes.push([ED_B, 'active', '2026-09-03 11:00:00', '']);
  const club2 = lireConfigPublique(avec.classeur, 'club');
  verifier(club2.global.repartition_grands_terrains === '',
    'A2 ⭐⭐ (R-101) : sur une édition NEUVE, le dossier n\'hérite d\'AUCUN terrain');
})();

(function A3_vueInvitation() {
  // La vitrine n'expose pas ce champ : la bascule ne doit rien y faire APPARAÎTRE.
  const avec = classeurComplet({ structure: true });
  const inv = lireConfigPublique(avec.classeur, 'invitation');
  verifier(!Object.prototype.hasOwnProperty.call(inv.global, 'repartition_grands_terrains'),
    'A3 ⭐ : la vue INVITATION n\'expose toujours pas le découpage — la liste blanche prime');
  verifier(CONFIG_PUBLIQUE_VUES.invitation.global.indexOf('repartition_grands_terrains') === -1,
    'A3 : et ce n\'est pas un hasard — le champ n\'est pas dans sa liste blanche');
})();

(function A4_dossierAutorisation() {
  // Le cœur PUR du dossier FFR : sans la clé, comportement historique ; avec, la décision
  // de l'appelant fait foi — ⛔ liste vide comprise.
  const config = { global: { terrains_physiques:
    '[{"nom":"Rugby 1","nature":"Gazon"},{"nom":"Vieux stade","nature":"Stabilisé"}]' },
    categories: [] };
  const sansCle = assemblerDossierAutorisation({}, config, {});
  const b1a = sansCle.sections.filter((s) => /^B\.1/.test(s.titre))[0];
  const nat1 = b1a.champs.filter((c) => c.libelle === 'Type de terrain')[0];
  verifier(nat1.valeur === 'Gazon, Stabilisé',
    'A4 : sans clé `naturesTerrains`, la cascade historique est intacte (constaté « ' + nat1.valeur + ' »)');

  const avecCle = assemblerDossierAutorisation(
    { naturesTerrains: { natures: ['Synthétique'], nbSansNature: 0 } }, config, {});
  const b1b = avecCle.sections.filter((s) => /^B\.1/.test(s.titre))[0];
  const nat2 = b1b.champs.filter((c) => c.libelle === 'Type de terrain')[0];
  verifier(nat2.valeur === 'Synthétique' && nat2.etat === 'calcule',
    'A4 ⭐ : avec la clé, c\'est la décision de l\'appelant qui fait foi');

  const vide = assemblerDossierAutorisation(
    { naturesTerrains: { natures: [], nbSansNature: 0 } }, config, {});
  const b1c = vide.sections.filter((s) => /^B\.1/.test(s.titre))[0];
  const nat3 = b1c.champs.filter((c) => c.libelle === 'Type de terrain')[0];
  verifier(nat3.valeur !== 'Gazon, Stabilisé',
    'A4 ⭐⭐ : une liste VIDE renvoie à la saisie, ⛔ jamais à l\'inventaire durable');
})();

(function A5_laProjectionNEstJamaisAtteinteEnErreur() {
  // 🎯 CE TEST EXISTE À CAUSE D'UNE MUTATION QUI N'A PAS ÉTÉ ATTRAPÉE, et c'est sa raison
  //    d'être. On avait écrit une mutation « la projection en erreur retombe sur Config » :
  //    ⛔ AUCUN test ne tombait. La cause n'était pas un trou dans les preuves — c'est que
  //    cette branche est INATTEIGNABLE : `planPublieValide` rejette déjà, via
  //    `ecartsInternesPlanTerrains` ⑦, tout plan dont la projection échouerait.
  //
  //    ⭐ On ne supprime pas pour autant la garde `if (projete.error) return ''` : elle rend
  //    le VIDE, donc elle n'ajoute aucun comportement — elle protège du jour où la validation
  //    s'assouplirait. ⚠️ Mais alors il faut FIGER le lien, sinon plus rien ne dit pourquoi
  //    elle est là : c'est l'objet de ce test. Le jour où `planPublieValide` cessera de
  //    rejeter les collisions, il tombera — et la garde redeviendra atteignable.
  const planPublieValide = F('planPublieValide');
  const projectionRepartitionTerrains = F('projectionRepartitionTerrains');

  // Deux grands terrains RETENUS portant le même nom : la projection en perdrait un.
  const enCollision = {
    edition_id: ED_A, plan_id: 'P1',
    params: { edition_id: ED_A, plan_id: 'P1', role: 'plan', signature: 'S' },
    terrains: [
      Object.assign(terrain('T1', 'Rugby 1'), { edition_id: ED_A, plan_id: 'P1' }),
      Object.assign(terrain('T2', 'Rugby 1'), { edition_id: ED_A, plan_id: 'P1' })],
    minis: [Object.assign(mini(1, 'T1', 'U8'), { edition_id: ED_A, plan_id: 'P1' })]
  };
  const proj = projectionRepartitionTerrains(enCollision);
  verifier(!!proj.error,
    'A5 : un plan à noms en COLLISION fait bien échouer la projection');

  const valide = planPublieValide({ pointeur: 'P1', edition_id: ED_A,
    plans: [enCollision.params], terrains: enCollision.terrains, minis: enCollision.minis });
  verifier(valide === null,
    'A5 ⭐⭐ : ⛔ mais il n\'atteint JAMAIS la projection — la validation l\'a rejeté avant');
})();

/**
 * A6 — ⛔ Une ÉCRITURE MÉTIER ordinaire ne crée aucune structure et ne publie aucun plan.
 *
 * ⚠️ La série Apps Script porte déjà ce contrôle (C12), mais sur un faux classeur qui n'a même
 * pas de méthode `insertSheet` : une mutation y est attrapée par une EXCEPTION, ⛔ pas par une
 * assertion. C'est trop faible — un test qui plante n'affirme rien. Ici, le classeur SAIT
 * créer un onglet ; s'il n'en crée pas, c'est parce que le code ne le lui a pas demandé.
 */
function A6_ecritureMetierNeMigreJamais(contexte, echecs) {
  const epn = vm.runInContext('enregistrerPlanTerrains', contexte);
  const ste = vm.runInContext('structureTerrainsB23EnPlace', contexte);
  const complet = classeurComplet({ structure: false });
  epn(complet.classeur, { terrains_physiques: '[{"nom":"Rugby 1","nature":"Gazon"}]',
    repartition_grands_terrains: '{"Rugby 1":["1","2","3"]}' });

  const creees = ['TerrainsPlan', 'Terrains', 'MiniTerrains']
    .filter((n) => complet.classeur.getSheetByName(n) !== null);
  if (creees.length) echecs.push('A6 : une écriture métier a créé ' + creees.join(', '));
  if (ste(complet.classeur)) echecs.push('A6 : la structure B2-3 est en place après une écriture métier');
  if (complet.ecritures.insertSheet !== 0) {
    echecs.push('A6 : ' + complet.ecritures.insertSheet + ' appel(s) à insertSheet');
  }
  return complet;
}

(function A6() {
  const echecs = [];
  const complet = A6_ecritureMetierNeMigreJamais(bac, echecs);
  verifier(echecs.length === 0,
    'A6 ⭐⭐ BLOQUANT : une écriture métier ne crée AUCUNE structure' +
      (echecs.length ? ' — ' + echecs.join(' · ') : '') +
      ' (le classeur d\'essai SAIT pourtant créer un onglet)');
  const ecrit = complet.config._lignes().filter((l) => l[0] === 'repartition_grands_terrains')[0];
  verifier(!!ecrit && ecrit[1] === '{"Rugby 1":["1","2","3"]}',
    'A6 : et l\'écriture historique dans Config, elle, a bien eu lieu — INCHANGÉE');
})();

/* ========================================================================== */
/*  SÉRIE B — LES INVENTAIRES : qui a le droit de lire l'ancienne source       */
/* ========================================================================== */

titre('B — inventaires : personne ne peut revenir à l\'ancienne source en douce');

/** Les lignes de `Code.gs` qui NOMMENT le champ historique, hors commentaires. */
function lignesQuiNommentLeChamp() {
  const out = [];
  SOURCE_CODE.split('\n').forEach((ligne, i) => {
    const nue = ligne.trim();
    if (nue.startsWith('*') || nue.startsWith('//') || nue.startsWith('/*')) return;
    if (ligne.indexOf('repartition_grands_terrains') === -1) return;
    out.push({ n: i + 1, texte: nue });
  });
  return out;
}

(function B1_inventaireDesLectures() {
  const lignes = lignesQuiNommentLeChamp();
  // ⭐ L'INVENTAIRE EXHAUSTIF, et chaque entrée dit POURQUOI elle a le droit d'exister.
  const autorises = [
    { motif: 'liste blanche de la vue LIVE', test: (t) => t.indexOf("'tournoi_publie'") !== -1 },
    { motif: 'liste blanche de la vue CLUB', test: (t) => t.indexOf("'url_tournoi_public'") !== -1 },
    // ⭐ Cette lecture-ci est LÉGITIME et le restera : `getDossierAutorisation` lit le `g` de la
    //    config DÉJÀ BASCULÉE (`configAvecTerrainsEdition`), donc elle compte les terrains de
    //    l'édition active. ⚠️ Elle est inscrite parce qu'elle est le point exact où un futur
    //    contributeur pourrait, sans le voir, remettre `lireConfig(classeur)` en amont.
    { motif: 'repli « saisi » du dossier d\'autorisation', test: (t) => t.indexOf('var rep = g.') !== -1 },
    // ⭐ Depuis le resserrement, l'écriture historique ne nomme plus le champ dans le corps de
    //    `enregistrerPlanTerrains` mais dans la liste des DEUX ÉVÉNEMENTIELS — celle qui n'est
    //    concaténée que lorsque la structure B2-3 n'existe pas encore.
    { motif: 'la liste des deux champs ÉVÉNEMENTIELS (chemin historique)',
      test: (t) => t.indexOf('var CHAMPS_TERRAINS_EVENEMENTIELS') !== -1 },
    { motif: 'la CEINTURE du reset', test: (t) => t.indexOf('effacerParamGlobal(ongletConfig,') !== -1 },
    { motif: 'la déclaration unique du nom (B2-3.c)', test: (t) => t.indexOf('var TERRAINS_CHAMP_PROJETE') !== -1 }
  ];
  const inconnues = lignes.filter((l) => !autorises.some((a) => a.test(l.texte)));
  verifier(inconnues.length === 0,
    'B1 ⭐⭐ BLOQUANT : aucune lecture du champ historique hors des ' + autorises.length +
      ' points inventoriés' +
      (inconnues.length ? ' — INCONNUE(S) : ' + inconnues.map((l) => 'ligne ' + l.n).join(', ') : ''));

  // ⭐ Et l'inverse : chaque point inventorié doit encore EXISTER. Un inventaire qui ne
  //    décrit plus rien est pire qu'un inventaire absent — il rassure à tort.
  const perimes = autorises.filter((a) => !lignes.some((l) => a.test(l.texte)));
  verifier(perimes.length === 0,
    'B1 ⭐ : aucune exception PÉRIMÉE ne reste inscrite' +
      (perimes.length ? ' — PÉRIMÉE(S) : ' + perimes.map((a) => a.motif).join(', ') : ''));

  // ⛔ Le nom ne doit plus être TAPÉ dans le bloc B2-3.c : il y a une déclaration pour ça.
  const blocC = SOURCE_CODE.slice(SOURCE_CODE.indexOf('B2-3.c — LA BASCULE DES CONSOMMATEURS'));
  const tapes = blocC.split('\n').filter((l) => {
    const nue = l.trim();
    if (nue.startsWith('*') || nue.startsWith('//') || nue.startsWith('/*')) return false;
    return l.indexOf("'repartition_grands_terrains'") !== -1;
  });
  verifier(tapes.length === 1,
    'B1 ⭐ : dans le bloc B2-3.c, le nom du champ est écrit UNE seule fois (constaté ' +
      tapes.length + ')');
})();

(function B2_cleDeCache() {
  // ⚠️ La vue LIVE change de SOURCE sans changer de forme : sans saut de clé, la copie de
  //    secours servirait 6 h le découpage de l'édition précédente, sous le bon nom.
  verifier(SOURCE_CODE.indexOf("'snapshot_json_v3'") === -1 &&
      SOURCE_CODE.indexOf("'snapshot_json_secours_v3'") === -1,
    'B2 ⭐⭐ : plus aucune référence aux anciennes clés de cache `_v3`');
  verifier(SOURCE_CODE.indexOf("cache.get('snapshot_json_v4')") !== -1 &&
      SOURCE_CODE.indexOf("cache.put('snapshot_json_v4'") !== -1 &&
      SOURCE_CODE.indexOf("cache.put('snapshot_json_secours_v4'") !== -1,
    'B2 ⭐ : les trois usages du cache pointent bien sur `_v4`');
})();

(function B3_aucuneMigrationImplicite() {
  // 🚨 L'invariant ① : aucun chemin de LECTURE ne doit pouvoir créer la structure.
  const blocC = SOURCE_CODE.slice(SOURCE_CODE.indexOf('B2-3.c — LA BASCULE DES CONSOMMATEURS'));
  const appels = blocC.split('\n').filter((l) => {
    const nue = l.trim();
    if (nue.startsWith('*') || nue.startsWith('//') || nue.startsWith('/*')) return false;
    return /\bassurer[A-Z]\w*\s*\(/.test(l);
  });
  verifier(appels.length === 0,
    'B3 ⭐⭐ BLOQUANT : le bloc B2-3.c n\'appelle AUCUNE fonction « assurer… » (constaté ' +
      appels.length + ')');

  const brancheDansLireConfigPublique =
    /function lireConfigPublique[\s\S]{0,600}?configAvecTerrainsEdition/.test(SOURCE_CODE);
  verifier(brancheDansLireConfigPublique,
    'B3 : `lireConfigPublique` passe bien par la bascule');
  const brancheDansAdmin =
    /case 'getConfigAdmin':[\s\S]{0,400}?configAvecTerrainsEdition/.test(SOURCE_CODE);
  verifier(brancheDansAdmin, 'B3 : `getConfigAdmin` passe bien par la bascule');
  const brancheDansDossier =
    /function getDossierAutorisation[\s\S]{0,600}?configAvecTerrainsEdition/.test(SOURCE_CODE);
  verifier(brancheDansDossier, 'B3 : `getDossierAutorisation` passe bien par la bascule');
})();

/* ========================================================================== */
/*  SÉRIE C — le REJEU de la série Apps Script (leçon ④ de la session 35)      */
/* ========================================================================== */

titre('C — la série Apps Script B2-3.c, REJOUÉE ici sur les vraies fonctions');

const SERIE_APPS_SCRIPT = [
  'testB23c_C1_sansStructureComportementHistorique',
  'testB23c_C2_consommateurLitLePlanPublie',
  'testB23c_C3_niBrouillonNiOrphelin',
  'testB23c_C4_isolationEntreEditions',
  'testB23c_C5_contratDeSortieInchange',
  'testB23c_C6_lectureNEcritRien',
  'testB23c_C7_configJamaisMutee',
  'testB23c_C8_naturesDesTerrainsRetenus',
  'testB23c_C9_defautFermeJamaisDeRepli',
  'testB23c_C10_ceintureDuResetInverseLeTemoin',
  'testB23c_C11_lePermanentSurvitAuReset',
  'testB23c_C12_ecritureNeMigreJamais',
  'testB23c_C13_resserrementQuatreChampsDurables',
  'testB23c_C14_symetrieSansStructureSixChamps',
  'testB23c_C15_dimensionsSansStructureRestentDansConfig',
  'testB23c_C16_dimensionsVontDansLeBrouillon',
  'testB23c_C17_dimensionsVisentLEditionActive',
  'testB23c_C18_aucunRepliVersConfig',
  'testB23c_C19_applicationsSuccessivesSAccumulent',
  'testB23c_C20_appliquerValeursFFRPasseParLePointDePassage'
];

/** Rejoue la série Apps Script dans un bac donné. @return {{total,ok,fail,echecs}} */
function rejouerSerieAppsScript(contexte) {
  const e = { total: 0, ok: 0, fail: 0, echecs: [] };
  SERIE_APPS_SCRIPT.forEach((nom) => {
    const f = vm.runInContext(nom, contexte);
    if (typeof f !== 'function') {
      e.total++; e.fail++; e.echecs.push(nom + ' : introuvable dans backend/Tests.gs');
      return;
    }
    try { f(e); } catch (err) { e.total++; e.fail++; e.echecs.push(nom + ' a levé : ' + err.message); }
  });
  return e;
}

(function C_rejeu() {
  const e = rejouerSerieAppsScript(bac);
  e.echecs.forEach((x) => console.log('        ' + x));
  verifier(e.fail === 0 && e.total >= 40,
    'C ⭐⭐ la série Apps Script B2-3.c passe ENTIÈREMENT ici : ' + e.ok + '/' + e.total +
      ' assertions, ' + e.fail + ' échec(s)');
})();

/* ========================================================================== */
/*  SÉRIE D — LE BILAN COMPLET : `lancerTestsFFR` va-t-il jusqu'au bout ?      */
/* ========================================================================== */

titre('D — le bilan complet du serveur, joué de bout en bout');

(function D_bilanComplet() {
  // 🎯 CE CONTRÔLE N'EST PAS DÉCORATIF, et il a déjà mordu : au commit `ed815fd`, une ligne
  //    `ecrit.setValues++` s'était glissée dans `_m1bFauxOnglet`, qui n'a pas de compteur.
  //    ⛔ `lancerTestsFFR` levait `ecrit is not defined` au premier test M1-B qui écrit, et
  //    n'affichait AUCUN bilan — le repère `1367/1367` était donc INATTEIGNABLE, sans que
  //    rien ne le signale, puisque personne ne lançait la série entière.
  const frais = fabriquerBac(SOURCE_CODE);
  let leve = null;
  try { vm.runInContext('lancerTestsFFR()', frais); } catch (err) { leve = err.message; }
  verifier(leve === null,
    'D ⭐⭐ BLOQUANT : `lancerTestsFFR` va jusqu\'au bout sans lever' +
      (leve ? ' — A LEVÉ : ' + leve : ''));

  const bilan = (frais.__journal || []).filter((l) => /^R92 —/.test(l))[0] || '';
  const m = /^R92 — (\d+)\/(\d+) OK, (\d+) FAIL$/.exec(bilan);
  verifier(!!m, 'D : un bilan est bien produit (« ' + bilan + ' »)');
  if (m) {
    verifier(m[3] === '0',
      'D ⭐⭐ : le bilan ne porte AUCUN échec — ' + bilan);
    console.log('        ⭐ Bilan attendu chez Google : ' + m[1] + '/' + m[2]);
  }
})();

/* ========================================================================== */
/*  SÉRIE M — LES MUTATIONS                                                   */
/*                                                                            */
/*  ⭐ On abîme la source, on recharge, on rejoue la série : un test DOIT       */
/*  tomber. Une mutation qui passe inaperçue est un trou dans les preuves.     */
/* ========================================================================== */

titre('M — mutations : chaque défaut introduit doit être ATTRAPÉ');

const MUTATIONS = [
  {
    nom: 'M1 · le consommateur RETOMBE sur Config quand il n\'y a pas de plan',
    de: "  if (!src.plan) return '';\n  var projete = projectionRepartitionTerrains(src.plan);",
    vers: "  if (!src.plan) { var gg = (config && config.global) || {};\n" +
          "    return gg[TERRAINS_CHAMP_PROJETE] == null ? '' : String(gg[TERRAINS_CHAMP_PROJETE]); }\n" +
          "  var projete = projectionRepartitionTerrains(src.plan);"
  },
  // ⚠️ IL N'Y A PAS DE « M2 », ET C'EST DÉLIBÉRÉ. Une mutation « la projection en erreur
  //    retombe sur Config » a été écrite, jouée, et ⛔ AUCUN test ne l'a attrapée. Le réflexe
  //    aurait été d'ajouter un test ; ⭐ la bonne réponse était de chercher POURQUOI — cette
  //    branche est inatteignable, `planPublieValide` rejetant déjà tout plan dont la
  //    projection échouerait. Le lien est désormais figé par le test A5, qui tombera le jour
  //    où il cessera d'être vrai. La mutation, elle, n'aurait rien pu prouver.
  {
    nom: 'M3 · la structure absente bascule quand même en mode moderne',
    de: "  if (!structureTerrainsB23EnPlace(classeur)) return vide;",
    vers: "  if (false) return vide;"
  },
  {
    nom: 'M4 · l\'édition active est ignorée — on prend n\'importe quelle édition',
    de: "  var edition = valeurTexteTerrain(registre.edition.edition_id);\n" +
        "  return { moderne: true, edition_id: edition,\n" +
        "           plan: edition ? planTerrainsPublie(classeur, edition) : null };",
    vers: "  var edition = valeurTexteTerrain(registre.edition.edition_id);\n" +
          "  var toutes = lireEditionsObjets(classeur);\n" +
          "  for (var z = 0; z < toutes.length; z++) {\n" +
          "    var p = planTerrainsPublie(classeur, valeurTexteTerrain(toutes[z].edition_id));\n" +
          "    if (p) return { moderne: true, edition_id: edition, plan: p };\n" +
          "  }\n" +
          "  return { moderne: true, edition_id: edition, plan: null };"
  },
  {
    nom: 'M5 · un pointeur non vide SUFFIT (on saute planPublieValide)',
    de: "function planTerrainsPublie(classeur, editionId) {\n" +
        "  return planPublieValide(contexteTerrainsEdition(classeur, editionId, []));",
    vers: "function planTerrainsPublie(classeur, editionId) {\n" +
          "  var pt = pointeurPlanTerrains(classeur, editionId);\n" +
          "  if (pt) { var pp = lirePlanTerrains(classeur, editionId, pt); if (pp) return pp; }\n" +
          "  return planPublieValide(contexteTerrainsEdition(classeur, editionId, []));"
  },
  {
    nom: 'M6 · le BROUILLON est consommé comme s\'il était publié',
    de: "  if (!src.plan) return '';",
    vers: "  if (!src.plan) { var br = lireBrouillonTerrains(classeur, src.edition_id);\n" +
          "    if (br) { var pj = projectionRepartitionTerrains(br);\n" +
          "      if (pj && !pj.error) return JSON.stringify(pj.repartition); } return ''; }"
  },
  {
    nom: 'M7 · `configAvecTerrainsEdition` MUTE son entrée au lieu de la copier',
    de: "  gOut[TERRAINS_CHAMP_PROJETE] = repartitionTerrainsEditionActive(classeur, config, src);\n" +
        "  return { global: gOut, categories: config.categories || [] };",
    vers: "  gIn[TERRAINS_CHAMP_PROJETE] = repartitionTerrainsEditionActive(classeur, config, src);\n" +
          "  return { global: gIn, categories: config.categories || [] };"
  },
  {
    nom: 'M8 · les NATURES reviennent à l\'inventaire durable',
    de: "  if (!src.moderne) return naturesTerrainsAutorisation(config);\n" +
        "  return naturesPlanTerrains(src.plan);",
    vers: "  return naturesTerrainsAutorisation(config);"
  },
  {
    nom: 'M9 · une LECTURE crée la structure (migration implicite)',
    de: "  if (!structureTerrainsB23EnPlace(classeur)) return vide;",
    vers: "  if (!structureTerrainsB23EnPlace(classeur)) { assurerStructureTerrainsB23(classeur); }"
  },
  {
    nom: 'M10 · la CEINTURE du reset est retirée',
    de: "  effacerParamGlobal(ongletConfig, 'repartition_grands_terrains');",
    vers: "  /* ceinture retirée */"
  },
  {
    nom: 'M11 · le reset emporte AUSSI l\'installation permanente du club',
    de: "  effacerParamGlobal(ongletConfig, 'repartition_grands_terrains');",
    vers: "  effacerParamGlobal(ongletConfig, 'repartition_grands_terrains');\n" +
          "  ['terrains_physiques', 'couloir_terrain_m', 'dimensions_categories',\n" +
          "   'tm_longueur_m', 'tm_largeur_m'].forEach(function (c) {\n" +
          "    effacerParamGlobal(ongletConfig, c); });"
  },
  {
    nom: 'M12 · `enregistrerPlanTerrains` crée la structure au passage',
    de: "function enregistrerPlanTerrains(classeur, data) {\n  var onglet = classeur.getSheetByName('Config');",
    vers: "function enregistrerPlanTerrains(classeur, data) {\n  var onglet = classeur.getSheetByName('Config');\n" +
          "  assurerStructureTerrainsB23(classeur);"
  },
  {
    // ⭐ LA MUTATION QUI DÉFAIT LE RESSERREMENT : `dimensions_categories` revient dans Config.
    nom: 'M14 · `dimensions_categories` est réécrit dans Config malgré la structure',
    de: "var CHAMPS_TERRAINS_DURABLES = ['terrains_physiques', 'couloir_terrain_m',\n" +
        "                                'tm_longueur_m', 'tm_largeur_m'];",
    vers: "var CHAMPS_TERRAINS_DURABLES = ['terrains_physiques', 'couloir_terrain_m',\n" +
          "                                'tm_longueur_m', 'tm_largeur_m', 'dimensions_categories'];"
  },
  {
    nom: 'M15 · `repartition_grands_terrains` est réécrit dans Config malgré la structure',
    de: "var CHAMPS_TERRAINS_DURABLES = ['terrains_physiques', 'couloir_terrain_m',\n" +
        "                                'tm_longueur_m', 'tm_largeur_m'];",
    vers: "var CHAMPS_TERRAINS_DURABLES = ['terrains_physiques', 'couloir_terrain_m',\n" +
          "                                'tm_longueur_m', 'tm_largeur_m', 'repartition_grands_terrains'];"
  },
  {
    // ⚠️ LA MUTATION SYMÉTRIQUE, et elle protège l'application TELLE QU'ELLE TOURNE : un
    //    resserrement INCONDITIONNEL couperait la seule écriture de la source historique.
    nom: 'M16 · le resserrement devient INCONDITIONNEL (casse le mode historique)',
    de: "  var champs = sourceTerrainsEditionActive(classeur).moderne\n" +
        "    ? CHAMPS_TERRAINS_DURABLES\n" +
        "    : CHAMPS_TERRAINS_DURABLES.concat(CHAMPS_TERRAINS_EVENEMENTIELS);",
    vers: "  var champs = CHAMPS_TERRAINS_DURABLES;"
  },
  {
    nom: 'M17 · un paramètre DURABLE est perdu au passage (la table de marque)',
    de: "var CHAMPS_TERRAINS_DURABLES = ['terrains_physiques', 'couloir_terrain_m',\n" +
        "                                'tm_longueur_m', 'tm_largeur_m'];",
    vers: "var CHAMPS_TERRAINS_DURABLES = ['terrains_physiques', 'couloir_terrain_m'];"
  },
  {
    // ⭐ LE REPLI INTERDIT : la structure existe, rien ne peut recevoir, et on écrit quand
    //    même dans `Config` — l'organisateur croit avoir enregistré, personne ne le lit.
    nom: 'M18 · les dimensions RETOMBENT sur Config quand aucun plan ne peut recevoir',
    de: "  var base = baseBrouillonTerrains(classeur, src);\n" +
        "  if (!base) {\n" +
        "    return { error: 'Cette édition n\\'a pas encore de plan de terrains : enregistre d\\'abord ' +\n" +
        "      'le plan des terrains, puis applique les valeurs FFR. ⛔ Rien n\\'a été écrit.' };\n" +
        "  }",
    vers: "  var base = baseBrouillonTerrains(classeur, src);\n" +
          "  if (!base) {\n" +
          "    ecrireChampsConfig(classeur.getSheetByName('Config'),\n" +
          "      { dimensions_categories: json }, ['dimensions_categories']);\n" +
          "    return { ok: true, destination: 'config' };\n" +
          "  }"
  },
  {
    nom: 'M19 · la LECTURE des dimensions reste sur Config (mélange des deux sources)',
    de: "  var brut;\n" +
        "  if (!src.moderne) {\n" +
        "    brut = ((config && config.global) || {}).dimensions_categories;\n" +
        "  } else {",
    vers: "  var brut;\n" +
          "  if (true) {\n" +
          "    brut = ((config && config.global) || {}).dimensions_categories;\n" +
          "  } else {"
  },
  {
    nom: 'M20 · écrire les dimensions PUBLIE le plan au passage',
    de: "  if (ecrit.error) return ecrit;\n" +
        "  return { ok: true, destination: 'brouillon', plan_id: ecrit.plan_id };",
    vers: "  if (ecrit.error) return ecrit;\n" +
          "  ecrirePointeurPlanTerrains(classeur, src.edition_id, ecrit.plan_id);\n" +
          "  return { ok: true, destination: 'brouillon', plan_id: ecrit.plan_id };"
  },
  {
    nom: 'M21 · on repart du plan PUBLIÉ au lieu du brouillon en cours (perte silencieuse)',
    de: "  return lireBrouillonTerrains(classeur, src.edition_id) || src.plan || null;",
    vers: "  return src.plan || lireBrouillonTerrains(classeur, src.edition_id) || null;"
  },
  {
    nom: 'M22 · `appliquerValeursFFR` réécrit AUSSI Config.dimensions_categories',
    de: "    destinationDims = ecritDims.destination;",
    vers: "    destinationDims = ecritDims.destination;\n" +
          "    ecrireChampsConfig(classeur.getSheetByName('Config'),\n" +
          "      { dimensions_categories: JSON.stringify(res.dimensions) }, ['dimensions_categories']);"
  },
  {
    // ⚠️ Un branchement qui emporterait un garde-fou au passage laisserait tout le reste vert.
    nom: 'M23 · le garde-fou de l\'AMBIGUÏTÉ (plusieurs formes FFR) est emporté',
    de: "  if (res.ambigu) {\n" +
        "    return { ok: true, applique: false, ambigu: true, categorie: categorie,\n" +
        "             formesDisponibles: res.formesDisponibles };\n" +
        "  }",
    vers: "  /* garde-fou emporté */"
  },
  {
    nom: 'M13 · un terrain ÉCARTÉ compte quand même dans les natures',
    de: "  (plan.terrains || []).filter(terrainRetenu).forEach(function (t) {\n" +
        "    var n = valeurTexteTerrain(t.snap_nature);",
    vers: "  (plan.terrains || []).forEach(function (t) {\n" +
          "    var n = valeurTexteTerrain(t.snap_nature);"
  }
];

/** Les contrôles TEXTUELS du banc (séries B), rejoués sur une source mutée. */
function controlesTextuels(source) {
  const echecs = [];
  const blocC = source.slice(source.indexOf('B2-3.c — LA BASCULE DES CONSOMMATEURS'));
  const assur = blocC.split('\n').filter((l) => {
    const nue = l.trim();
    if (nue.startsWith('*') || nue.startsWith('//') || nue.startsWith('/*')) return false;
    return /\bassurer[A-Z]\w*\s*\(/.test(l);
  });
  if (assur.length) echecs.push('B3 : le bloc B2-3.c appelle une fonction « assurer… »');
  if (source.indexOf("'snapshot_json_v3'") !== -1) echecs.push('B2 : clé de cache `_v3` revenue');
  if (!/function lireConfigPublique[\s\S]{0,600}?configAvecTerrainsEdition/.test(source)) {
    echecs.push('B3 : `lireConfigPublique` ne passe plus par la bascule');
  }
  if (!/case 'getConfigAdmin':[\s\S]{0,400}?configAvecTerrainsEdition/.test(source)) {
    echecs.push('B3 : `getConfigAdmin` ne passe plus par la bascule');
  }
  if (!/function getDossierAutorisation[\s\S]{0,600}?configAvecTerrainsEdition/.test(source)) {
    echecs.push('B3 : `getDossierAutorisation` ne passe plus par la bascule');
  }
  return echecs;
}

/** Les contrôles VIVANTS du banc (série A), rejoués sur un bac muté. */
function controlesVivants(contexte) {
  const echecs = [];
  const lcp = vm.runInContext('lireConfigPublique', contexte);
  const asb = vm.runInContext('assurerStructureTerrainsB23', contexte);
  const ppt = vm.runInContext('publierPlanTerrains', contexte);
  const ste = vm.runInContext('structureTerrainsB23EnPlace', contexte);

  // A1 — sans structure, comportement historique.
  const sans = classeurComplet({ structure: false });
  try {
    if (lcp(sans.classeur, 'live').global.repartition_grands_terrains !== PIEGE) {
      echecs.push('A1 : sans structure, la vue LIVE ne rend plus la valeur de Config');
    }
    if (ste(sans.classeur)) echecs.push('A1 : une lecture a créé la structure');
  } catch (e) { echecs.push('A1 a levé : ' + e.message); }

  // A1/A2 — avec structure et plan publié.
  const ecrit = compteur();
  const editions = ongletEditions([[ED_A, 'active', '2026-09-01 10:00:00', '']], ecrit);
  const config = ongletConfig({ tournoi_nom: 'T', repartition_grands_terrains: PIEGE,
    terrains_physiques: '[{"nom":"Rugby 1","nature":"Gazon"}]' }, CATEGORIES, ecrit);
  const cl = fauxClasseur([config, editions], ecrit);
  try {
    asb(cl);
    ppt(cl, ED_A, planEssai(), CATEGORIES, generateur('PL'), '2026-09-03 10:00:00');
    const live = lcp(cl, 'live').global.repartition_grands_terrains;
    if (live === PIEGE) echecs.push('A1 : la vue LIVE rend la valeur piégée de Config');
    if (live !== PROJECTION_ATTENDUE) echecs.push('A1 : la projection rendue est fausse (« ' + live + ' »)');

    const lg = editions._lignes();
    for (let i = 1; i < lg.length; i++) { if (String(lg[i][0]) === ED_A) lg[i][1] = 'fermee'; }
    lg.push([ED_B, 'active', '2026-09-03 11:00:00', '']);
    if (lcp(cl, 'club').global.repartition_grands_terrains !== '') {
      echecs.push('A2 : une édition NEUVE hérite encore de terrains');
    }
  } catch (e) { echecs.push('A2 a levé : ' + e.message); }

  // A6 — l'écriture métier ne migre jamais, ⭐ sur un classeur qui SAIT créer un onglet.
  try { A6_ecritureMetierNeMigreJamais(contexte, echecs); }
  catch (e) { echecs.push('A6 a levé : ' + e.message); }
  return echecs;
}

MUTATIONS.forEach((m) => {
  if (SOURCE_CODE.indexOf(m.de) === -1) {
    verifier(false, m.nom + ' — ⛔ ancre INTROUVABLE dans backend/Code.gs : mets la mutation à jour');
    return;
  }
  const mutee = SOURCE_CODE.replace(m.de, m.vers);
  let attrapee = [];
  let bacMute = null;
  try { bacMute = fabriquerBac(mutee); }
  catch (e) { attrapee.push('le chargement a levé : ' + e.message); }

  if (bacMute) {
    const e = rejouerSerieAppsScript(bacMute);
    e.echecs.forEach((x) => attrapee.push(x));
    controlesVivants(bacMute).forEach((x) => attrapee.push(x));
  }
  controlesTextuels(mutee).forEach((x) => attrapee.push(x));

  verifier(attrapee.length > 0, m.nom + ' — détectée par ' + attrapee.length + ' contrôle(s)');
  if (attrapee.length) console.log('        ↳ ' + attrapee[0]);
});

/* ========================================================================== */

console.log('\n==============================================');
console.log('B2-3.c bascule — ' + etat.ok + '/' + etat.total + ' OK, ' + etat.fail + ' ÉCHEC(S)');
console.log('==============================================');
if (etat.fail) { etat.echecs.forEach((e) => console.log('  ÉCHEC ' + e)); process.exit(1); }
