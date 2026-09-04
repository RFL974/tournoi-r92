/**
 * ============================================================================
 *  GARDE-FOU — L'ÉCRAN DES TERRAINS ET L'ÉCRITURE COMPLÈTE DU DÉCOUPAGE
 *  M1-B2 / B2-3.d (R-101) — conception : voir l'en-tête du bloc dans backend/Code.gs
 * ============================================================================
 *
 *  ▶ Pour lancer :  node tests/backend-terrains-ecran.test.js
 *    (aucune dépendance, aucun navigateur, aucun réseau, ⛔ aucun Google — Node seul)
 *
 *  CE QU'IL PROTÈGE.
 *
 *  B2-3.c avait branché les LECTEURS sur le plan publié de l'édition — ⛔ mais personne ne
 *  pouvait écrire ce plan : le navigateur n'envoyait ni les identités durables des grands
 *  terrains, ni la catégorie de chaque mini-terrain. B2-3.d ferme cette moitié.
 *
 *  ⭐ CE BANC NE SE CONTENTE PAS DE VÉRIFIER LE SERVEUR. Sa preuve centrale est un
 *  ALLER-RETOUR COMPLET : le VRAI code du navigateur (`frontend/js/admin-terrains.js`)
 *  fabrique le message, le VRAI code du serveur (`backend/Code.gs`) l'écrit dans un faux
 *  classeur, et on vérifie que l'identité durable de chaque grand terrain SURVIT au trajet.
 *  ⛔ Deux bacs séparés, reliés par le seul message — comme en vrai.
 *
 *  ⚠️ Les services Google ne sont PAS émulés : ce sont des doublures inertes. Le banc échoue
 *  bruyamment si un chemin testé essaie vraiment de s'en servir.
 *
 *  ⭐ ET IL REJOUE LA SÉRIE APPS SCRIPT B2-3.d : une série écrite chez Google mais jamais
 *  lancée n'est pas un garde-fou, c'est une intention.
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = process.env.RACINE_TOURNOI_R92 || path.join(__dirname, '..');
const CHEMIN_CODE = path.join(RACINE, 'backend/Code.gs');
const CHEMIN_TESTS = path.join(RACINE, 'backend/Tests.gs');
const CHEMIN_ECRAN = path.join(RACINE, 'frontend/js/admin-terrains.js');
const SOURCE_CODE = fs.readFileSync(CHEMIN_CODE, 'utf8');
const SOURCE_TESTS = fs.readFileSync(CHEMIN_TESTS, 'utf8');
const SOURCE_ECRAN = fs.readFileSync(CHEMIN_ECRAN, 'utf8');

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
/*  LE BAC SERVEUR — Apps Script réduit à des doublures INERTES               */
/* ========================================================================== */

/**
 * ⭐ DES IDENTITÉS QUE L'ŒIL RECONNAÎT, et qui ne ressemblent NI aux noms NI aux positions.
 * ⚠️ Le premier jet de ce banc utilisait des UUID : une identité qui aurait « suivi » la
 * position ou le nom se serait vue… mais un lecteur ne l'aurait pas cru sur parole. Avec
 * `ID-ZULU-9` sur « Rugby 1 » à la position 0, toute confusion saute aux yeux.
 */
const IDS_RECONNAISSABLES = ['ID-ZULU-9', 'ID-ALPHA-3', 'ID-MIKE-7', 'ID-KILO-1', 'ID-XRAY-5',
                             'ID-TANGO-2', 'ID-VICTOR-8'];

function fabriquerBacServeur(sourceCode, identitesLisibles) {
  let compteurUuid = 0;
  const journal = [];
  const bac = vm.createContext({
    Logger: { log: (m) => journal.push(String(m)) },
    Utilities: {
      getUuid: () => {
        if (identitesLisibles) {
          return IDS_RECONNAISSABLES[compteurUuid++] || ('ID-EXTRA-' + compteurUuid);
        }
        compteurUuid++;
        const n = String(compteurUuid).padStart(4, '0');
        return '0000' + n + '-aaaa-bbbb-cccc-' + n.padStart(12, '0');
      },
      formatDate: () => '2026-09-04 12:00:00',
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

const bac = fabriquerBacServeur(SOURCE_CODE);
const F = (nom) => {
  const f = vm.runInContext(nom, bac);
  if (typeof f !== 'function') {
    throw new Error('Fonction introuvable dans backend/Code.gs : « ' + nom + ' ». ' +
      'Si elle a été renommée, mets ce garde-fou à jour — ne le supprime pas.');
  }
  return f;
};

const ENTETES = vm.runInContext('ENTETES', bac);

/* ========================================================================== */
/*  LE FAUX CLASSEUR — une GRILLE, comme celui de B2-3.b et B2-3.c            */
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
    // ⭐ `ecrireParamGlobal` INSÈRE une ligne quand le paramètre n'existe pas encore — c'est le
    //   cas d'un classeur qui n'a jamais enregistré la table de marque. ⛔ Sans cette méthode, le
    //   banc échouerait pour une raison qui n'a rien à voir avec ce qu'il surveille.
    insertRowsBefore: (r, n) => { for (let i = 0; i < n; i++) d.splice(r - 1, 0, []); return api; },
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
/** ⭐ Le PIÈGE de B2-3.c : un découpage qui n'appartient à aucun plan. */
const PIEGE = '{"Stade de l\'an dernier":["7","8","9"]}';

const CATEGORIES = [
  { categorie: 'U8', presente: 'oui', terrains: '1,2,3,4', terrains_auto: 'oui' },
  { categorie: 'U10', presente: 'oui', terrains: '5,6', terrains_auto: 'oui' }
];

function ongletConfig(paramsGlobaux, ecrit) {
  const lignes = [['— Réglages —', '']];
  Object.keys(paramsGlobaux).forEach((k) => lignes.push([k, paramsGlobaux[k]]));
  const colonnes = ['categorie', 'presente', 'terrains', 'terrains_auto'];
  lignes.push(colonnes);
  CATEGORIES.forEach((c) => lignes.push(colonnes.map((col) => (c[col] === undefined ? '' : c[col]))));
  return fauxOnglet('Config', lignes, ecrit);
}

function ongletEditions(lignes, ecrit) {
  return fauxOnglet('Editions', [ENTETES.Editions.slice()].concat(lignes || []), ecrit);
}

/** L'inventaire tel que le navigateur l'envoie la toute première fois : ⛔ SANS identité. */
function INVENTAIRE_NEUF() {
  return [{ nom: 'Rugby 1', type: 'rugby', L: 115, W: 70, enBut: 0, nature: 'Gazon', pos: 'CG' },
          { nom: 'Rugby 2', type: 'rugby', L: 110, W: 68, enBut: 0, nature: 'Synthétique', pos: 'BG' }];
}

/** Le découpage d'essai — ⭐ aligné sur `CATEGORIES` (mode AUTO ⇒ égalité stricte exigée). */
function MINIS() {
  return [{ numero: '1', terrain_index: 0, categorie: 'U8' },
          { numero: '2', terrain_index: 0, categorie: 'U8' },
          { numero: '3', terrain_index: 0, categorie: 'U8' },
          { numero: '4', terrain_index: 0, categorie: 'U8' },
          { numero: '5', terrain_index: 1, categorie: 'U10' },
          { numero: '6', terrain_index: 1, categorie: 'U10' }];
}

function envoi(sur) {
  sur = sur || {};
  const payload = {
    dimensions: { U8: { l: 30, w: 20 }, U10: { l: 40, w: 30 } },
    couloir_m: '5', tm_longueur_m: '4', tm_largeur_m: '4'
  };
  if (sur.selection !== undefined) { if (sur.selection !== null) payload.selection = sur.selection; }
  else payload.selection = ['oui', 'oui'];
  if (sur.minis !== undefined) { if (sur.minis !== null) payload.minis = sur.minis; }
  else payload.minis = MINIS();
  const message = {
    terrains_physiques: JSON.stringify(sur.inventaire || INVENTAIRE_NEUF()),
    couloir_terrain_m: '5', tm_longueur_m: '4', tm_largeur_m: '4'
  };
  if (!sur.sansPlan) message.plan_terrains = JSON.stringify(payload);
  return message;
}

/** Un classeur complet. `structure` faux ⇒ ⛔ régime HISTORIQUE. */
function classeur(options) {
  options = options || {};
  const ecrit = compteur();
  const editions = ongletEditions([[ED_A, 'active', '2026-09-01 10:00:00', '']], ecrit);
  const config = ongletConfig(Object.assign({
    tournoi_nom: 'Tournoi test', tournoi_publie: 'non',
    repartition_grands_terrains: PIEGE,
    dimensions_categories: '{"U8":{"l":99,"w":99}}',
    terrains_physiques: options.inventaire || ''
  }, options.global || {}), ecrit);
  const cl = fauxClasseur([config, editions,
    fauxOnglet('Equipes', [ENTETES.Equipes.slice()], ecrit),
    fauxOnglet('Poules', [ENTETES.Poules.slice()], ecrit),
    fauxOnglet('Matchs', [ENTETES.Matchs.slice()], ecrit)], ecrit);
  if (options.structure) F('assurerStructureTerrainsB23')(cl);
  return { classeur: cl, config, editions, ecritures: ecrit };
}

/**
 * Confirme comme le VRAI navigateur : en renvoyant l'empreinte reçue au chargement.
 * ⭐ `surEmpreinte` permet d'éprouver le refus — empreinte absente (`''`) ou périmée.
 */
function confirmer(cl, surEmpreinte) {
  const b = F('planTerrainsPourEcran')(cl).brouillon || {};
  const jeton = { empreinte: b.empreinte || '', plan_id: b.plan_id || '' };
  if (surEmpreinte !== undefined) jeton.empreinte = surEmpreinte;
  return F('confirmerPlanTerrains')(cl, jeton);
}

/** Empreinte du classeur, pour comparer « bit à bit ». */
function empreinte(cl) {
  const noms = ['TerrainsPlan', 'Terrains', 'MiniTerrains', 'Editions', 'Config'];
  return JSON.stringify(noms.map((n) => {
    const o = cl.getSheetByName(n);
    return o ? o._lignes().map((l) => l.slice()) : null;
  }));
}

console.log('==================================================');
console.log('  B2-3.d — l\'écran et l\'écriture du découpage');
console.log('==================================================');

/* ========================================================================== */
/*  SÉRIE A — LE RÉGIME HISTORIQUE, ⛔ INTACT                                 */
/* ========================================================================== */

titre('A — sans la structure B2-3, rien ne change (le frontend peut être publié avant)');

(function A1_sansStructure() {
  const c = classeur({ structure: false });
  const message = envoi();
  message.dimensions_categories = '{"U8":{"l":30,"w":20}}';
  message.repartition_grands_terrains = '{"Rugby 1":["1","2"]}';
  const avantStructure = F('structureTerrainsB23EnPlace')(c.classeur);
  const r = F('enregistrerPlanTerrains')(c.classeur, message);

  verifier(avantStructure === false, 'A1 : le classeur d\'essai est bien en régime historique');
  verifier(r && r.ok === true && r.inventaire === undefined,
    'A1 : la réponse est celle d\'avant — ⛔ aucun inventaire identifié rendu');
  const lu = F('lireConfig')(c.classeur).global;
  verifier(lu.terrains_physiques === message.terrains_physiques,
    'A1 ⭐⭐ : l\'inventaire est écrit TEL QUEL — ⛔ aucune identité ajoutée');
  verifier(lu.dimensions_categories === '{"U8":{"l":30,"w":20}}' &&
    lu.repartition_grands_terrains === '{"Rugby 1":["1","2"]}',
    'A1 ⭐ : les SIX champs sont écrits, exactement comme avant');
  verifier(F('lireTerrainsPlan')(c.classeur).length === 0,
    'A1 ⭐⭐ : `plan_terrains` est IGNORÉ — ⛔ aucun brouillon');
  verifier(F('structureTerrainsB23EnPlace')(c.classeur) === false,
    'A1 ⭐⭐ : ⛔ l\'écriture n\'a créé AUCUNE structure au passage');

  const vue = F('planTerrainsPourEcran')(c.classeur);
  verifier(vue.moderne === false && vue.brouillon === null && vue.publie === null,
    'A1 ⭐ : l\'écran n\'annonce ni brouillon ni plan publié — ⛔ aucun faux « publié »');
  verifier(vue.etat === 'absent',
    'A1 : et l\'état reste « absent » — ⛔ jamais « confirmé » par défaut');
})();

/* ========================================================================== */
/*  SÉRIE B — LE CHARGEMENT : trois choses distinctes                         */
/* ========================================================================== */

titre('B — l\'écran ne confond jamais inventaire, brouillon et plan publié');

(function B1_chargementDistinct() {
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  const vue = F('planTerrainsPourEcran')(c.classeur);

  verifier(vue.moderne === true && vue.edition_id === ED_A,
    'B1 : l\'écran sait sur quelle édition il travaille');
  verifier(vue.inventaire.length === 2 && vue.inventaire.every((t) => String(t.id || '') !== ''),
    'B1 ⭐⭐ : l\'inventaire DURABLE revient avec ses identités');
  verifier(vue.brouillon !== null && vue.publie === null,
    'B1 ⭐⭐ : le BROUILLON existe, ⛔ le plan publié n\'existe PAS — les deux sont distincts');
  verifier(vue.etat === 'brouillon',
    'B1 ⭐ : l\'état dit « brouillon » — ⛔ jamais « confirmé »');
  verifier(vue.brouillon.signature === '',
    'B1 ⭐⭐ : un brouillon n\'est JAMAIS signé');
  verifier((vue.brouillon.minis || []).length === 6 &&
    vue.brouillon.minis.every((m) => m.categorie === 'U8' || m.categorie === 'U10'),
    'B1 ⭐⭐ : chaque mini-terrain porte sa CATÉGORIE EXPLICITE');
  verifier(vue.brouillon.dimensions_json.indexOf('"l":30') !== -1,
    'B1 ⭐ : les dimensions vivent dans le PLAN — ⛔ plus dans une cellule permanente');
  verifier(Object.keys(vue.selection).length === 2 &&
    Object.keys(vue.selection).every((k) => vue.selection[k] === true),
    'B1 : la sélection revient par IDENTITÉ, ⛔ pas par nom');

  confirmer(c.classeur);
  const apres = F('planTerrainsPourEcran')(c.classeur);
  verifier(apres.publie !== null && apres.brouillon === null && apres.etat === 'confirme',
    'B1 ⭐⭐ : après confirmation, c\'est le PLAN PUBLIÉ qui existe — le brouillon a disparu');
})();

(function B2_lectureNEcritRien() {
  const c = classeur({ structure: true });
  const avant = empreinte(c.classeur);
  const nbAvant = c.ecritures.total();
  F('planTerrainsPourEcran')(c.classeur);
  F('planTerrainsPourEcran')(c.classeur);
  verifier(empreinte(c.classeur) === avant && c.ecritures.total() === nbAvant,
    'B2 ⭐⭐ : ⛔ `getPlanTerrains` n\'écrit RIEN — classeur identique bit à bit');

  const sans = classeur({ structure: false });
  F('planTerrainsPourEcran')(sans.classeur);
  verifier(F('structureTerrainsB23EnPlace')(sans.classeur) === false && sans.ecritures.insertSheet === 0,
    'B2 ⭐⭐ : ⛔ elle ne CRÉE JAMAIS la structure — c\'est le geste de B2-3.e');
})();

/* ========================================================================== */
/*  SÉRIE C — LES IDENTITÉS DURABLES                                          */
/* ========================================================================== */

titre('C — les identités durables sont émises par le serveur, et conservées');

(function C1_attribueesPuisConservees() {
  const c = classeur({ structure: true });
  const r1 = F('enregistrerPlanTerrains')(c.classeur, envoi());
  verifier(r1.ok && r1.identites_attribuees === 2,
    'C1 ⭐ : DEUX identités neuves à la première écriture');
  verifier(r1.inventaire[0].nom === 'Rugby 1' && r1.inventaire[0].L === 115 &&
    r1.inventaire[0].nature === 'Gazon' && r1.inventaire[0].pos === 'CG' &&
    r1.inventaire[1].nature === 'Synthétique',
    'C1 ⭐⭐ : ⛔ AUCUNE PERTE — taille, nature, type et emplacement voyagent intacts');

  const renvoi = JSON.parse(JSON.stringify(r1.inventaire));
  renvoi[0].nom = 'Rugby Principal';
  renvoi[0].L = 120;
  const r2 = F('enregistrerPlanTerrains')(c.classeur, envoi({ inventaire: renvoi }));
  verifier(r2.ok && r2.identites_attribuees === 0 &&
    r2.inventaire[0].id === r1.inventaire[0].id && r2.inventaire[1].id === r1.inventaire[1].id,
    'C1 ⭐⭐ : renommé et redimensionné, le terrain GARDE son identité');

  const minis = F('lireLignesMiniTerrains')(c.classeur);
  const ids = { [r1.inventaire[0].id]: true, [r1.inventaire[1].id]: true };
  verifier(minis.length === 6 && minis.every((m) => ids[m.terrain_id]),
    'C1 ⭐⭐ : les mini-terrains portent l\'IDENTITÉ, ⛔ pas une position d\'écran');
  const snap = F('lireLignesTerrainsB23')(c.classeur);
  verifier(snap.some((l) => l.snap_nom === 'Rugby Principal' && l.snap_longueur_m === '120'),
    'C1 ⭐ : le plan fige l\'installation TELLE QU\'ELLE EST au moment de l\'enregistrement');
})();

(function C2_identiteFabriqueeRefusee() {
  const c = classeur({ structure: true });
  const avant = empreinte(c.classeur);
  const inventé = INVENTAIRE_NEUF();
  inventé[0].id = 'ID-INVENTE-PAR-LE-NAVIGATEUR';
  const r = F('enregistrerPlanTerrains')(c.classeur, envoi({ inventaire: inventé }));
  verifier(r.error && /inconnu/i.test(r.error),
    'C2 ⭐⭐ : une identité que le serveur n\'a jamais émise est REFUSÉE');
  verifier(empreinte(c.classeur) === avant,
    'C2 ⭐⭐ : ⛔ et le refus n\'a rien écrit — classeur identique bit à bit');

  const r1 = F('enregistrerPlanTerrains')(c.classeur, envoi());
  const double = JSON.parse(JSON.stringify(r1.inventaire));
  double[1].id = double[0].id;
  const avant2 = empreinte(c.classeur);
  const r2 = F('enregistrerPlanTerrains')(c.classeur, envoi({ inventaire: double }));
  verifier(r2.error && /même identifiant/i.test(r2.error) && empreinte(c.classeur) === avant2,
    'C2 ⭐⭐ : deux terrains de MÊME identité ⇒ refus, ⛔ sans trace');
})();

/* ========================================================================== */
/*  SÉRIE D — LES DEUX GESTES SÉPARÉS                                         */
/* ========================================================================== */

titre('D — enregistrer n\'est pas confirmer');

(function D1_aucunePublicationImplicite() {
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  verifier(F('pointeurPlanTerrains')(c.classeur, ED_A) === '',
    'D1 ⭐⭐ : ⛔ enregistrer NE PUBLIE PAS — le pointeur est resté vide');
  verifier(F('planTerrainsPublie')(c.classeur, ED_A) === null,
    'D1 ⭐⭐ : rien n\'est consommable tant que rien n\'est confirmé');
  verifier(F('repartitionTerrainsEditionActive')(c.classeur, F('lireConfig')(c.classeur)) === '',
    'D1 ⭐⭐ : les consommateurs voient du VIDE — ⛔ jamais le brouillon, ⛔ jamais Config');

  // ⭐ Et rejouer l'enregistrement dix fois ne publie toujours rien.
  for (let i = 0; i < 10; i++) F('enregistrerPlanTerrains')(c.classeur, envoi());
  verifier(F('pointeurPlanTerrains')(c.classeur, ED_A) === '',
    'D1 ⭐⭐ : ⛔ dix enregistrements de plus ne publient toujours RIEN');
  verifier(F('lireTerrainsPlan')(c.classeur).length === 1,
    'D1 ⭐ : et il n\'y a toujours qu\'UN brouillon (⛔ pas onze)');
})();

(function D2_confirmationExplicite() {
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  const conf = confirmer(c.classeur);
  verifier(conf.ok === true && String(conf.plan_id || '') !== '',
    'D2 ⭐ : la confirmation publie (' + (conf.error || 'ok') + ')');
  verifier(F('pointeurPlanTerrains')(c.classeur, ED_A) === conf.plan_id,
    'D2 ⭐⭐ : le pointeur désigne le plan confirmé');

  const projection = F('repartitionTerrainsEditionActive')(c.classeur, F('lireConfig')(c.classeur));
  verifier(projection === '{"Rugby 1":["1","2","3","4"],"Rugby 2":["5","6"]}',
    'D2 ⭐⭐ : la forme historique `repartition_grands_terrains` est EXACTE (' + projection + ')');
  const natures = F('naturesTerrainsEditionActive')(c.classeur, F('lireConfig')(c.classeur));
  verifier(natures.natures.length === 2 && natures.nbSansNature === 0,
    'D2 ⭐ : les natures viennent des terrains RETENUS du plan confirmé');
})();

(function D3_ancienPlanTientPendantLaPreparation() {
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  confirmer(c.classeur);
  const pointeur = F('pointeurPlanTerrains')(c.classeur, ED_A);
  const projection = F('repartitionTerrainsEditionActive')(c.classeur, F('lireConfig')(c.classeur));

  // Un nouveau brouillon, très différent — ⛔ il ne doit RIEN changer pour les consommateurs.
  F('enregistrerPlanTerrains')(c.classeur, envoi({
    minis: [{ numero: '42', terrain_index: 0, categorie: 'U8' }] }));
  verifier(F('pointeurPlanTerrains')(c.classeur, ED_A) === pointeur,
    'D3 ⭐⭐ : préparer un nouveau brouillon ne déplace PAS le pointeur');
  verifier(F('repartitionTerrainsEditionActive')(c.classeur, F('lireConfig')(c.classeur)) === projection,
    'D3 ⭐⭐ : les consommateurs voient TOUJOURS l\'ancien plan confirmé, à l\'identique');
  verifier(F('planTerrainsPourEcran')(c.classeur).etat === 'a_reconfirmer',
    'D3 ⭐ : et l\'écran, lui, annonce « à reconfirmer »');

  // Le brouillon est invalide au regard des catégories ⇒ la confirmation REFUSE, ⛔ sans casser.
  const r = confirmer(c.classeur);
  verifier(r.error && F('pointeurPlanTerrains')(c.classeur, ED_A) === pointeur,
    'D3 ⭐⭐ : un brouillon incohérent est REFUSÉ — ⛔ l\'ancien plan reste en service');
  verifier(F('repartitionTerrainsEditionActive')(c.classeur, F('lireConfig')(c.classeur)) === projection,
    'D3 ⭐⭐ : et après ce refus, les consommateurs voient encore la même chose');
})();

(function D4_confirmerRefuseFerme() {
  const sans = classeur({ structure: false });
  const avantSans = empreinte(sans.classeur);
  const r1 = confirmer(sans.classeur);
  verifier(r1.error && empreinte(sans.classeur) === avantSans &&
    F('structureTerrainsB23EnPlace')(sans.classeur) === false,
    'D4 ⭐⭐ : sans structure ⇒ refus, ⛔ rien écrit, ⛔ aucune structure créée');

  const vide = classeur({ structure: true });
  const avantVide = empreinte(vide.classeur);
  const r2 = confirmer(vide.classeur);
  verifier(r2.error && /confirmer/i.test(r2.error) && empreinte(vide.classeur) === avantVide,
    'D4 ⭐ : aucun brouillon ⇒ refus, ⛔ classeur intact');
})();

/* ========================================================================== */
/*  SÉRIE E — LES REFUS : ⛔ aucun ne laisse de trace                          */
/* ========================================================================== */

titre('E — un message fautif est refusé, et ne laisse RIEN');

(function E1_tousLesRefus() {
  const cas = [
    ['sélection ABSENTE', { selection: null }],
    ['sélection DÉCALÉE', { selection: ['oui'] }],
    ['sélection ILLISIBLE', { selection: ['oui', 'peut-être'] }],
    ['catégorie MANQUANTE', { minis: [{ numero: '1', terrain_index: 0, categorie: '' }] }],
    ['catégorie INCONNUE', { minis: [{ numero: '1', terrain_index: 0, categorie: 'U19' }] }],
    ['catégorie ABSENTE du message', { minis: [{ numero: '1', terrain_index: 0 }] }],
    ['numéro EN DOUBLE', { minis: [{ numero: '1', terrain_index: 0, categorie: 'U8' },
                                   { numero: '1', terrain_index: 1, categorie: 'U10' }] }],
    ['numéro MANQUANT', { minis: [{ numero: '', terrain_index: 0, categorie: 'U8' }] }],
    ['grand terrain HORS BORNES', { minis: [{ numero: '1', terrain_index: 9, categorie: 'U8' }] }],
    ['grand terrain NÉGATIF', { minis: [{ numero: '1', terrain_index: -1, categorie: 'U8' }] }],
    ['grand terrain NON DÉSIGNÉ', { minis: [{ numero: '1', categorie: 'U8' }] }],
    ['grand terrain désigné par un NOM', { minis: [{ numero: '1', terrain_index: 'Rugby 1', categorie: 'U8' }] }],
    ['mini sur un terrain ÉCARTÉ', { selection: ['non', 'oui'],
                                     minis: [{ numero: '1', terrain_index: 0, categorie: 'U8' }] }],
    ['découpage qui n\'est pas une liste', { minis: { '1': 'U8' } }]
  ];

  let refuses = 0, intacts = 0;
  const passes = [];
  cas.forEach((c) => {
    const cl = classeur({ structure: true });
    const avant = empreinte(cl.classeur);
    const nb = cl.ecritures.total();
    const r = F('enregistrerPlanTerrains')(cl.classeur, envoi(c[1]));
    if (r && r.error) refuses++; else passes.push(c[0]);
    if (empreinte(cl.classeur) === avant && cl.ecritures.total() === nb) intacts++;
    else passes.push(c[0] + ' (a écrit)');
  });
  verifier(refuses === cas.length,
    'E1 ⭐⭐ : les ' + cas.length + ' messages fautifs sont REFUSÉS' +
      (passes.length ? ' — passé(s) : ' + passes.join(' ; ') : ''));
  verifier(intacts === cas.length,
    'E1 ⭐⭐ : ⛔ AUCUN refus n\'a écrit quoi que ce soit — classeur identique bit à bit');
})();

(function E2_illisibleNEffaceRien() {
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  const avant = empreinte(c.classeur);
  const cas = ['{ pas du json', '[]', '"une chaîne"', '42'];
  let tous = true;
  cas.forEach((brut) => {
    const r = F('enregistrerPlanTerrains')(c.classeur,
      { terrains_physiques: JSON.stringify(INVENTAIRE_NEUF()), plan_terrains: brut });
    if (!r || !r.error) tous = false;
  });
  verifier(tous, 'E2 ⭐ : un `plan_terrains` illisible ou mal formé est refusé (' + cas.length + ' formes)');
  verifier(empreinte(c.classeur) === avant,
    'E2 ⭐⭐ : ⛔ et le découpage déjà enregistré est INTACT — jamais vidé par accident');
})();

(function E3_absenceNEstPasVide() {
  // ⭐ « Enregistrer les terrains » ne parle pas du découpage : le brouillon le CONSERVE.
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  const avantMinis = F('lireLignesMiniTerrains')(c.classeur).length;
  const inv = F('planTerrainsPourEcran')(c.classeur).inventaire;
  const message = envoi({ inventaire: inv });
  const payload = JSON.parse(message.plan_terrains);
  delete payload.minis;                       // ⭐ le bouton « Enregistrer » n'envoie pas de minis
  message.plan_terrains = JSON.stringify(payload);
  F('enregistrerPlanTerrains')(c.classeur, message);
  verifier(F('lireLignesMiniTerrains')(c.classeur).length === avantMinis && avantMinis === 6,
    'E3 ⭐⭐ : l\'ABSENCE de découpage le CONSERVE — ⛔ elle ne l\'efface pas');

  // ⛔ Une liste VIDE, elle, veut dire « efface » — et c'est une intention différente.
  payload.minis = [];
  message.plan_terrains = JSON.stringify(payload);
  F('enregistrerPlanTerrains')(c.classeur, message);
  verifier(F('lireLignesMiniTerrains')(c.classeur).length === 0,
    'E3 ⭐ : une liste VIDE, elle, efface — les deux intentions restent distinguables');
})();

/* ========================================================================== */
/*  SÉRIE F — L'ISOLATION ENTRE ÉDITIONS                                      */
/* ========================================================================== */

titre('F — une édition ne touche jamais l\'instantané d\'une autre (R-101)');

(function F1_isolation() {
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  const conf = confirmer(c.classeur);
  const planA = JSON.stringify(F('planTerrainsPublie')(c.classeur, ED_A));

  // On ferme l'édition A, on en ouvre une neuve.
  const lignes = c.editions._lignes();
  for (let i = 1; i < lignes.length; i++) { if (String(lignes[i][0]) === ED_A) lignes[i][1] = 'fermee'; }
  lignes.push([ED_B, 'active', '2026-09-04 11:00:00', '']);

  verifier(F('repartitionTerrainsEditionActive')(c.classeur, F('lireConfig')(c.classeur)) === '',
    'F1 ⭐⭐ : une édition NEUVE n\'hérite d\'AUCUN terrain — c\'est le critère de R-101');
  verifier(F('planTerrainsPourEcran')(c.classeur).etat === 'absent',
    'F1 ⭐ : et son écran dit « aucune configuration »');

  // On travaille sur B, puis on confirme : ⛔ A ne bouge pas d'un caractère.
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  confirmer(c.classeur);
  verifier(JSON.stringify(F('planTerrainsPublie')(c.classeur, ED_A)) === planA,
    'F1 ⭐⭐ : l\'instantané publié de l\'édition PRÉCÉDENTE est INTACT');
  verifier(F('pointeurPlanTerrains')(c.classeur, ED_A) === conf.plan_id,
    'F1 ⭐ : son pointeur n\'a pas bougé non plus');
  verifier(F('planTerrainsPublie')(c.classeur, ED_B) !== null &&
    F('pointeurPlanTerrains')(c.classeur, ED_B) !== conf.plan_id,
    'F1 : l\'édition neuve a bien SON propre plan');
})();

(function F2_jamaisDeRepliVersConfig() {
  // ⭐ `Config` porte le PIÈGE (le découpage de l'an dernier). En régime moderne, ⛔ aucun
  //   chemin ne doit le rendre — ni sans plan, ni avec un brouillon, ni après un refus.
  const c = classeur({ structure: true });
  const lire = () => F('repartitionTerrainsEditionActive')(c.classeur, F('lireConfig')(c.classeur));
  verifier(lire() === '', 'F2 ⭐⭐ : sans plan ⇒ VIDE, ⛔ jamais la valeur piégée de Config');
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  verifier(lire() === '', 'F2 ⭐⭐ : avec un BROUILLON ⇒ toujours VIDE — un brouillon ne se consomme pas');
  F('enregistrerPlanTerrains')(c.classeur, envoi({ selection: ['oui'] }));   // refusé
  verifier(lire() === '', 'F2 ⭐⭐ : après un REFUS ⇒ toujours VIDE');
  verifier(F('lireConfig')(c.classeur).global.repartition_grands_terrains === PIEGE,
    'F2 : (contrôle du contrôle) la valeur piégée est pourtant bien là, dans Config');

  // Et les DIMENSIONS ne retombent pas non plus sur Config.
  const dims = F('dimensionsTerrainsEditionActive')(c.classeur, F('lireConfig')(c.classeur));
  verifier(JSON.stringify(dims).indexOf('99') === -1,
    'F2 ⭐⭐ : les dimensions viennent du PLAN — ⛔ jamais du `dimensions_categories` de Config');
})();

/* ========================================================================== */
/*  SÉRIE G — L'ALLER-RETOUR RÉEL : le VRAI navigateur, le VRAI serveur        */
/* ========================================================================== */

titre('G — le vrai code du navigateur parle au vrai code du serveur');

/** Un DOM RÉDUIT — ⛔ il n'émule rien : il porte juste les éléments que l'écran lit. */
function fabriquerBacEcran(sourceEcran) {
  const elements = {};
  const faireElement = (id) => ({
    id, textContent: '', disabled: false, innerHTML: '', hidden: false,
    value: '', checked: false, classList: { contains: () => false },
    setAttribute() {}, getAttribute: () => null, querySelector: () => null,
    querySelectorAll: () => [], closest: () => null
  });
  ['message-terrains', 'bouton-enregistrer-terrains', 'message-repartition',
   'bouton-appliquer-repartition', 'bouton-confirmer-terrains',
   'message-confirmation-terrains', 'repartition-resultat', 'zone-terrains']
    .forEach((id) => { elements[id] = faireElement(id); });

  const envoisAdmin = [];
  /* ⭐ DES LIGNES DE TERRAIN RÉELLES dans le faux DOM — sans elles, `lireTerrainsDuFormulaire`
     ne serait jamais exécutée, et une mutation qui y FABRIQUERAIT une identité passerait
     inaperçue. ⚠️ C'est exactement ce qui est arrivé au premier jet de ce banc. */
  let lignesDom = [];
  const fabriquerLigne = (t) => ({
    getAttribute: (nom) => (nom === 'data-id' ? String(t.id || '') : null),
    querySelector: (sel) => {
      const table = { '.tp-nom': { value: String(t.nom || '') },
                      '.tp-nature': { value: String(t.nature || '') },
                      '.tp-type': { value: String(t.type || 'rugby') },
                      '.tp-l': { value: String(t.L || '') }, '.tp-w': { value: String(t.W || '') },
                      '.tp-enbut': { value: String(t.enBut || '') },
                      '.tp-pos': { value: String(t.pos || '') },
                      '.tp-retenu': { checked: t.selectionne !== 'non' } };
      return table[sel] || null;
    }
  });
  const bacEcran = vm.createContext({
    document: {
      getElementById: (id) => elements[id] || null,
      querySelectorAll: (sel) =>
        (sel === '#liste-terrains-physiques .terrain-ligne' ? lignesDom.map(fabriquerLigne) : [])
    },
    console,
    echapper: (s) => String(s === undefined || s === null ? '' : s),
    svgIcone: () => '',
    afficherMessage: (el, texte) => { if (el) el.__message = texte; },
    dialogConfirmer: async () => true,
    dialogAlerter: async () => true,
    majEtatAvancement: () => {},
    injecterReglages: () => {},
    assistantMarquerPropre: () => {},
    estPresente: (c) => String(c.presente || '').toLowerCase() === 'oui',
    terrainsAutoDe: (c) => String(c.terrains_auto || 'oui').toLowerCase() !== 'non',
    comparerCategorie: () => 0,
    apiPostProtege: async () => { throw new Error('non branché dans ce test'); },
    ecrireAdmin: async (action, data) => { envoisAdmin.push({ action, data }); return { ok: true }; },
    configCourante: { global: {}, categories: CATEGORIES.slice() },
    equipesCourantes: []
  });
  vm.runInContext(sourceEcran || SOURCE_ECRAN, bacEcran, { filename: 'frontend/js/admin-terrains.js' });
  bacEcran.__elements = elements;
  bacEcran.__envois = envoisAdmin;
  bacEcran.__poserLignes = (t) => { lignesDom = t; };
  return bacEcran;
}

(function G1_leMessageDuNavigateurEstCompletEtIdentifie() {
  const cl = classeur({ structure: true });
  const ecran = fabriquerBacEcran();

  // ── ① L'écran charge son état depuis le VRAI serveur.
  const vue = F('planTerrainsPourEcran')(cl.classeur);
  vm.runInContext('planTerrainsB23 = ' + JSON.stringify(vue) + '; planTerrainsB23Demande = true;', ecran);
  verifier(vm.runInContext('etatPlanTerrains().moderne', ecran) === true,
    'G1 : l\'écran se sait en régime moderne');

  // ── ② L'organisateur déclare deux grands terrains (aucune identité encore).
  const formulaire = INVENTAIRE_NEUF().map((t) => Object.assign({ selectionne: 'oui' }, t));
  vm.runInContext('lireTerrainsDuFormulaire = function () { return ' +
    JSON.stringify(formulaire) + '; };', ecran);
  vm.runInContext('lireDimensionsDuFormulaire = function () { ' +
    'return { U8: { l: 30, w: 20 }, U10: { l: 40, w: 30 } }; };', ecran);
  vm.runInContext('lireCouloir = function () { return 5; };', ecran);
  vm.runInContext('lireTailleTM = function () { return { l: 4, w: 4 }; };', ecran);

  // ── ③ Bouton « Enregistrer les terrains » : le VRAI handler fabrique le VRAI message.
  vm.runInContext('onEnregistrerPlanTerrains();', ecran);
  const envois = ecran.__envois;
  verifier(envois.length === 1 && envois[0].action === 'enregistrerPlanTerrains',
    'G1 : le bouton « Enregistrer » appelle bien l\'action attendue');
  const message = envois[0].data;
  verifier(typeof message.plan_terrains === 'string',
    'G1 ⭐ : le message porte désormais le PLAN de l\'édition, à côté de l\'installation durable');
  const payload = JSON.parse(message.plan_terrains);
  verifier(Array.isArray(payload.selection) && payload.selection.length === 2,
    'G1 ⭐ : il porte une SÉLECTION explicite, une par grand terrain');
  verifier(payload.minis === undefined,
    'G1 ⭐⭐ : ⛔ et PAS de découpage — « Enregistrer » ne parle pas des mini-terrains');
  verifier(JSON.parse(message.terrains_physiques).every((t) => t.selectionne === undefined),
    'G1 ⭐ : `selectionne` ne pollue pas l\'inventaire DURABLE — il appartient à l\'édition');

  // ── ④ Le VRAI serveur reçoit ce message.
  const r = F('enregistrerPlanTerrains')(cl.classeur, message);
  verifier(r.ok === true && r.inventaire.length === 2 &&
    r.inventaire.every((t) => String(t.id || '') !== ''),
    'G1 ⭐⭐ : le serveur accepte le message du VRAI navigateur et attribue les identités');
})();

(function G1bis_leMessageHistoriqueEstIDENTIQUEAAVANT() {
  // 🚨 LE CONTRÔLE QUI AUTORISE LA PUBLICATION AVANT B2-3.e. Le frontend part sur GitHub Pages
  //    bien avant que le serveur connaisse quoi que ce soit de B2-3. ⛔ Son message doit donc
  //    être, dans ce régime, EXACTEMENT celui d'avant — pas « équivalent », identique.
  const ecran = fabriquerBacEcran();
  vm.runInContext('planTerrainsB23 = { moderne: false, etat: "absent", inventaire: [], ' +
    'brouillon: null, publie: null, selection: {} }; planTerrainsB23Demande = true;', ecran);
  // ⭐ Un DOM SANS case « utilisé » — c'est ce que rend `ligneTerrainPhysique` hors régime moderne.
  ecran.__poserLignes([{ nom: 'Rugby 1', nature: 'Gazon', type: 'rugby', L: 115, W: 70,
                         enBut: 0, pos: 'CG' }]);
  vm.runInContext('lireDimensionsDuFormulaire = function () { return { U8: { l: 30, w: 20 } }; };', ecran);
  vm.runInContext('lireCouloir = function () { return 5; };', ecran);
  vm.runInContext('lireTailleTM = function () { return { l: 4, w: 4 }; };', ecran);
  vm.runInContext('onEnregistrerPlanTerrains();', ecran);

  const message = ecran.__envois[0].data;
  verifier(message.plan_terrains === undefined,
    'G1bis ⭐⭐ : ⛔ AUCUN `plan_terrains` n\'est envoyé en régime historique');
  verifier(message.terrains_physiques ===
    '[{"nom":"Rugby 1","nature":"Gazon","type":"rugby","L":115,"W":70,"enBut":0,"pos":"CG"}]',
    'G1bis ⭐⭐ : l\'inventaire envoyé est au CARACTÈRE PRÈS celui d\'avant — ⛔ ni `id`, ni ' +
      '`selectionne`, ni changement d\'ordre des champs');
  verifier(Object.keys(message).sort().join() ===
    'couloir_terrain_m,dimensions_categories,terrains_physiques,tm_largeur_m,tm_longueur_m',
    'G1bis ⭐ : et le message porte exactement les cinq mêmes champs qu\'avant');

  // Le VRAI serveur, sans structure, l'accepte et se comporte comme avant.
  const cl = classeur({ structure: false });
  const r = F('enregistrerPlanTerrains')(cl.classeur, message);
  verifier(r.ok === true && r.inventaire === undefined &&
    F('lireConfig')(cl.classeur).global.terrains_physiques === message.terrains_physiques,
    'G1bis ⭐⭐ : le serveur historique l\'écrit TEL QUEL — la chaîne complète est inchangée');
})();

(function G2_lesIdentitesSurviventAuTrajetComplet() {
  const cl = classeur({ structure: true });
  const ecran = fabriquerBacEcran();

  // ① Premier enregistrement : le serveur attribue les identités.
  const premier = F('enregistrerPlanTerrains')(cl.classeur, envoi());
  const idsPremier = premier.inventaire.map((t) => t.id);

  // ② L'écran RECHARGE son état — c'est là qu'il apprend les identités.
  const vue = F('planTerrainsPourEcran')(cl.classeur);
  vm.runInContext('planTerrainsB23 = ' + JSON.stringify(vue) + '; planTerrainsB23Demande = true;', ecran);
  vm.runInContext('configCourante = { global: {}, categories: ' + JSON.stringify(CATEGORIES) + ' };', ecran);
  const affiche = vm.runInContext('planTerrainsActuel()', ecran);
  verifier(affiche.terrains.length === 2 && affiche.terrains.map((t) => t.id).join() === idsPremier.join(),
    'G2 ⭐⭐ : l\'écran affiche l\'inventaire AVEC les identités reçues du serveur');
  verifier(JSON.stringify(affiche.dims).indexOf('"l":30') !== -1,
    'G2 ⭐ : et les tailles de terrain viennent du PLAN, ⛔ pas du Config périmé');

  // ③ L'organisateur répartit, puis applique : le VRAI code fabrique le découpage.
  const formulaire = affiche.terrains.map((t) => Object.assign({ selectionne: 'oui' }, t));
  vm.runInContext('lireTerrainsDuFormulaire = function () { return ' +
    JSON.stringify(formulaire) + '; };', ecran);
  vm.runInContext('lireDimensionsDuFormulaire = function () { ' +
    'return { U8: { l: 30, w: 20 }, U10: { l: 40, w: 30 } }; };', ecran);
  vm.runInContext('lireCouloir = function () { return 5; };', ecran);
  vm.runInContext('lireTailleTM = function () { return { l: 4, w: 4 }; };', ecran);

  // ⭐ La répartition telle que la carte la produit : `fp.field` sont les OBJETS de la photo.
  vm.runInContext('(function () {' +
    'var photo = lireTerrainsDuFormulaire();' +
    'repartitionCalculee = { terrainsSource: photo, fieldsPlan: [' +
    '  { field: photo[0], zones: [{ cat: "U8", tiles: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }] }] },' +
    '  { field: photo[1], zones: [{ cat: "U10", tiles: [{ id: "5" }, { id: "6" }] }] }' +
    '] };' +
    '})();', ecran);
  const traduit = vm.runInContext('planDecoupagePourServeur()', ecran);
  verifier(!traduit.error && traduit.payload.minis.length === 6,
    'G2 ⭐ : le découpage est traduit pour le serveur (' + (traduit.error || 'ok') + ')');
  verifier(traduit.payload.minis.every((m) => m.categorie === 'U8' || m.categorie === 'U10'),
    'G2 ⭐⭐ : chaque mini-terrain porte sa CATÉGORIE — ⛔ jamais déduite d\'un nom de terrain');
  verifier(traduit.payload.minis.every((m) => typeof m.terrain_index === 'number') &&
    traduit.payload.minis.every((m) => m.terrain_id === undefined),
    'G2 ⭐⭐ : il désigne une POSITION DANS LE MESSAGE — ⛔ le navigateur n\'émet aucune identité');

  // ④ Le serveur écrit, puis on CONFIRME.
  const r = F('enregistrerPlanTerrains')(cl.classeur, {
    terrains_physiques: JSON.stringify(traduit.inventaire),
    plan_terrains: JSON.stringify(traduit.payload)
  });
  verifier(r.ok && r.identites_attribuees === 0 && r.inventaire.map((t) => t.id).join() === idsPremier.join(),
    'G2 ⭐⭐ : ⛔ AUCUNE identité neuve — celles du premier enregistrement ont survécu au trajet');
  const conf = confirmer(cl.classeur);
  verifier(conf.ok === true, 'G2 ⭐ : le plan issu du vrai navigateur est CONFIRMABLE (' +
    (conf.error || 'ok') + ')');
  const minis = F('lireLignesMiniTerrains')(cl.classeur);
  verifier(minis.length === 6 && minis.every((m) => idsPremier.indexOf(m.terrain_id) !== -1),
    'G2 ⭐⭐ : et les mini-terrains publiés portent les identités D\'ORIGINE');
  verifier(F('repartitionTerrainsEditionActive')(cl.classeur, F('lireConfig')(cl.classeur)) ===
    '{"Rugby 1":["1","2","3","4"],"Rugby 2":["5","6"]}',
    'G2 ⭐⭐ : la sortie historique est exacte — le contrat des écrans est tenu');
})();

(function G3_lEcranRefuseAvantDEnvoyer() {
  const ecran = fabriquerBacEcran();
  vm.runInContext('planTerrainsB23 = { moderne: true, etat: "absent", inventaire: [], ' +
    'brouillon: null, publie: null, selection: {} }; planTerrainsB23Demande = true;', ecran);
  vm.runInContext('lireDimensionsDuFormulaire = function () { return {}; };', ecran);
  vm.runInContext('lireCouloir = function () { return 5; };', ecran);
  vm.runInContext('lireTailleTM = function () { return { l: 4, w: 4 }; };', ecran);

  // ① Le formulaire a changé depuis le calcul ⇒ ⛔ on n'envoie RIEN.
  vm.runInContext('(function () {' +
    'var photo = [{ nom: "Rugby 1", L: 100, W: 60, selectionne: "oui" }];' +
    'repartitionCalculee = { terrainsSource: photo, fieldsPlan: [' +
    '  { field: photo[0], zones: [{ cat: "U8", tiles: [{ id: "1" }] }] }] };' +
    'lireTerrainsDuFormulaire = function () { ' +
    '  return [{ nom: "Rugby AUTRE", L: 100, W: 60, selectionne: "oui" }]; };' +
    '})();', ecran);
  const decale = vm.runInContext('planDecoupagePourServeur()', ecran);
  verifier(decale.error && /relance/i.test(decale.error),
    'G3 ⭐⭐ : les terrains ont changé depuis le calcul ⇒ REFUS côté écran, ⛔ rien n\'est envoyé');

  // ② Un mini-terrain sur un grand terrain DÉCOCHÉ ⇒ refus nommé, avant l'aller-retour.
  vm.runInContext('(function () {' +
    'var photo = [{ nom: "Rugby 1", L: 100, W: 60, selectionne: "non" }];' +
    'repartitionCalculee = { terrainsSource: photo, fieldsPlan: [' +
    '  { field: photo[0], zones: [{ cat: "U8", tiles: [{ id: "1" }] }] }] };' +
    'lireTerrainsDuFormulaire = function () { return photo; };' +
    '})();', ecran);
  const decoche = vm.runInContext('planDecoupagePourServeur()', ecran);
  verifier(decoche.error && decoche.error.indexOf('Rugby 1') !== -1,
    'G3 ⭐ : un terrain décoché qui porte des mini-terrains est signalé PAR SON NOM');
})();

(function G4_lEcranDitLEtatEtNePubliePasParInadvertance() {
  const ecran = fabriquerBacEcran();
  const attendus = {
    absent: ['Aucune configuration', 'confirme'],
    brouillon: ['à confirmer', 'utilisée nulle part'],
    a_reconfirmer: ['reconfirmer', 'ancienne'],
    confirme: ['confirmée', 'utilisée']
  };
  let tousDistincts = true;
  const rendus = new Set();
  Object.keys(attendus).forEach((e) => {
    vm.runInContext('planTerrainsB23 = { moderne: true, etat: "' + e + '", inventaire: [], ' +
      'brouillon: null, publie: null, selection: {} };', ecran);
    const bandeau = vm.runInContext('bandeauEtatTerrains()', ecran);
    rendus.add(bandeau);
    if (!attendus[e].every((mot) => bandeau.toLowerCase().indexOf(mot.toLowerCase()) !== -1)) {
      tousDistincts = false;
    }
  });
  verifier(tousDistincts && rendus.size === 4,
    'G4 ⭐⭐ : les QUATRE états produisent QUATRE messages distincts et explicites');

  vm.runInContext('planTerrainsB23 = { moderne: false, etat: "absent", inventaire: [], ' +
    'brouillon: null, publie: null, selection: {} };', ecran);
  verifier(vm.runInContext('bandeauEtatTerrains()', ecran) === '' &&
    vm.runInContext('blocConfirmationTerrains()', ecran) === '',
    'G4 ⭐⭐ : ⛔ RIEN ne s\'affiche en régime historique — l\'écran est celui d\'avant');

  // ⭐ Le bouton n'est ACTIF que s'il y a quelque chose à confirmer.
  const actif = {};
  ['absent', 'brouillon', 'a_reconfirmer', 'confirme'].forEach((e) => {
    vm.runInContext('planTerrainsB23 = { moderne: true, etat: "' + e + '", inventaire: [], ' +
      'brouillon: null, publie: null, selection: {} };', ecran);
    actif[e] = vm.runInContext('blocConfirmationTerrains()', ecran).indexOf('disabled') === -1;
  });
  verifier(actif.brouillon && actif.a_reconfirmer && !actif.absent && !actif.confirme,
    'G4 ⭐ : le bouton « Confirmer » n\'est actif que quand il y a une proposition');
})();

(function G5_uneValeurParDefautNEstJamaisPresenteeCommeConfirmee() {
  const ecran = fabriquerBacEcran();
  // ⭐ Aucun plan : l'écran PROPOSE les terrains par défaut, et propose de les retenir…
  vm.runInContext('planTerrainsB23 = { moderne: true, etat: "absent", inventaire: [], ' +
    'brouillon: null, publie: null, selection: {} }; planTerrainsB23Demande = true;', ecran);
  vm.runInContext('configCourante = { global: {}, categories: ' + JSON.stringify(CATEGORIES) + ' };', ecran);
  const plan = vm.runInContext('planTerrainsActuel()', ecran);
  verifier(plan.terrains.length > 0,
    'G5 : sans rien d\'enregistré, l\'écran PROPOSE des grands terrains (comme avant)');
  verifier(vm.runInContext('terrainRetenuEcran({ nom: "Rugby 1" })', ecran) === true,
    'G5 : et il propose de les retenir — ⭐ c\'est une PROPOSITION');
  verifier(vm.runInContext('bandeauEtatTerrains()', ecran).indexOf('Aucune configuration') !== -1,
    'G5 ⭐⭐ : ⛔ mais l\'écran dit « aucune configuration » — la proposition n\'est JAMAIS ' +
      'présentée comme confirmée');

  // …et une sélection ENREGISTRÉE prime sur la proposition, dans les deux sens.
  vm.runInContext('planTerrainsB23 = { moderne: true, etat: "brouillon", inventaire: [], ' +
    'brouillon: null, publie: null, selection: { "T1": false, "T2": true } };', ecran);
  verifier(vm.runInContext('terrainRetenuEcran({ id: "T1" })', ecran) === false &&
    vm.runInContext('terrainRetenuEcran({ id: "T2" })', ecran) === true,
    'G5 ⭐ : une sélection enregistrée fait foi — ⛔ la proposition ne la recouvre jamais');
})();

(function G6_unePanneNeDetruitPasLesIdentites() {
  // 🚨 LE PIÈGE DE CE LOT, ET IL EST SILENCIEUX. Si une coupure réseau effaçait l'état chargé,
  //    l'écran retomberait en régime historique, perdrait les `data-id` de son DOM, et le
  //    prochain enregistrement repartirait SANS identité — le serveur en fabriquerait alors de
  //    neuves. ⛔ Des identités « durables » qui changent à chaque coupure ne sont pas durables.
  const ecran = fabriquerBacEcran();
  const etatConnu = { moderne: true, etat: 'brouillon', edition_id: ED_A,
    inventaire: [{ id: 'T-DURABLE-1', nom: 'Rugby 1', L: 115, W: 70 }],
    brouillon: null, publie: null, selection: { 'T-DURABLE-1': true } };
  vm.runInContext('planTerrainsB23 = ' + JSON.stringify(etatConnu) + ';', ecran);

  // Le serveur devient injoignable, et l'écran redemande son état.
  vm.runInContext('apiPostProtege = async function () { throw new Error("réseau coupé"); };', ecran);
  vm.runInContext('planTerrainsB23Demande = false;', ecran);
  vm.runInContext('injecterTerrains = function () {};', ecran);   // ⛔ pas de DOM à repeindre ici
  const attente = vm.runInContext('chargerPlanTerrainsB23()', ecran);

  return attente.then(() => {
    const apres = vm.runInContext('etatPlanTerrains()', ecran);
    verifier(apres.moderne === true && apres.inventaire.length === 1 &&
      apres.inventaire[0].id === 'T-DURABLE-1',
      'G6 ⭐⭐ : une PANNE réseau ne détruit PAS l\'état connu — les identités durables tiennent');

    // ⭐ Et à froid (aucun état connu), la panne laisse simplement le régime historique.
    const neuf = fabriquerBacEcran();
    vm.runInContext('apiPostProtege = async function () { throw new Error("Action inconnue"); };', neuf);
    vm.runInContext('injecterTerrains = function () {};', neuf);
    return vm.runInContext('chargerPlanTerrainsB23()', neuf).then(() => {
      verifier(vm.runInContext('etatPlanTerrains().moderne', neuf) === false,
        'G6 ⭐⭐ : serveur ANCIEN (« Action inconnue ») ⇒ régime historique, ⛔ aucune erreur montrée');
      verifier(vm.runInContext('bandeauEtatTerrains()', neuf) === '',
        'G6 ⭐ : et l\'écran reste EXACTEMENT celui d\'avant — c\'est ce qui autorise à publier ' +
          'ce frontend avant B2-3.e');
      finir();
    });
  });
})();

/* ⚠️ LA SUITE EST DIFFÉRÉE, et ce n'est pas un détail de style : G6 est le seul contrôle
   ASYNCHRONE du banc (il éprouve un chemin `async` du navigateur). Enchaîner les séries
   suivantes en synchrone les ferait tourner AVANT ses assertions, et le bilan final serait
   compté sans elles. ⛔ Un bilan qui ne compte pas tout est pire qu'un bilan absent. */
function finir() {

/* ========================================================================== */
/*  SÉRIE I — L'IDENTITÉ DURABLE, ÉPROUVÉE SUR LES SEPT GESTES QUI LA MENACENT */
/*                                                                            */
/*  🚨 CE QUE CETTE SÉRIE ÉTABLIT, ET C'EST LA QUESTION CENTRALE DU LOT :      */
/*  l'identité d'un grand terrain suit LE TERRAIN — ⛔ jamais son NOM, ⛔ jamais */
/*  sa POSITION à l'écran. Les identités sont volontairement lisibles          */
/*  (`ID-ZULU-9` sur « Rugby 1 », position 0) : toute confusion se VOIT.       */
/* ========================================================================== */

titre('I — l\'identité suit le terrain, jamais le nom, jamais la position');

/** Un bac neuf à identités lisibles, avec un classeur prêt et deux terrains enregistrés. */
function scenarioIdentites() {
  const b = fabriquerBacServeur(SOURCE_CODE, true);
  const f = (nom) => vm.runInContext(nom, b);
  const ecrit = compteur();
  const editions = ongletEditions([[ED_A, 'active', '2026-09-01 10:00:00', '']], ecrit);
  const config = ongletConfig({ tournoi_nom: 'T', repartition_grands_terrains: PIEGE,
    dimensions_categories: '{"U8":{"l":99,"w":99}}', terrains_physiques: '' }, ecrit);
  const cl = fauxClasseur([config, editions,
    fauxOnglet('Equipes', [ENTETES.Equipes.slice()], ecrit)], ecrit);
  f('assurerStructureTerrainsB23')(cl);
  const premier = f('enregistrerPlanTerrains')(cl, envoi());
  return { f, cl, ecrit, inv: premier.inventaire, premier,
    /** Enregistre un inventaire + un découpage, comme le ferait l'écran. */
    poser: (inv, minis, sel) => f('enregistrerPlanTerrains')(cl, {
      terrains_physiques: JSON.stringify(inv),
      plan_terrains: JSON.stringify({ selection: sel || inv.map(() => 'oui'), minis: minis,
        dimensions: { U8: { l: 30, w: 20 }, U10: { l: 40, w: 30 } },
        couloir_m: '5', tm_longueur_m: '4', tm_largeur_m: '4' }) }),
    /** L'état persisté, sous une forme qu'on lit d'un coup d'œil. */
    vu: () => ({
      config: JSON.parse(f('lireConfig')(cl).global.terrains_physiques)
        .map((t) => t.nom + '=' + t.id).join(' · '),
      minis: f('lireLignesMiniTerrains')(cl).map((m) => m.numero + '→' + m.terrain_id).join(' · '),
      snap: f('lireLignesTerrainsB23')(cl).map((l) => l.snap_nom + '=' + l.terrain_id).join(' · ')
    }) };
}

/** Les mini-terrains, tous sur le grand terrain d'index `i` sauf les 5 et 6 sur `j`. */
function MINIS_SUR(i, j) {
  return [{ numero: '1', terrain_index: i, categorie: 'U8' }, { numero: '2', terrain_index: i, categorie: 'U8' },
          { numero: '3', terrain_index: i, categorie: 'U8' }, { numero: '4', terrain_index: i, categorie: 'U8' },
          { numero: '5', terrain_index: j, categorie: 'U10' }, { numero: '6', terrain_index: j, categorie: 'U10' }];
}

(function I1_identitesLisiblesEtDistinctes() {
  const sc = scenarioIdentites();
  verifier(sc.inv[0].id === 'ID-ZULU-9' && sc.inv[1].id === 'ID-ALPHA-3',
    'I1 : les identités d\'essai sont LISIBLES et ne ressemblent ni aux noms ni aux positions (' +
      sc.vu().config + ')');
  verifier(sc.premier.identites_attribuees === 2,
    'I1 : elles ont été émises par le SERVEUR, deux d\'un coup');
})();

(function I2_permutation() {
  const sc = scenarioIdentites();
  const r = sc.poser([sc.inv[1], sc.inv[0]], MINIS_SUR(1, 0));   // ⭐ ordre INVERSÉ
  const v = sc.vu();
  verifier(r.ok && r.identites_attribuees === 0,
    'I2 ⭐ : permuter deux grands terrains ne crée AUCUNE identité neuve');
  verifier(v.config === 'Rugby 2=ID-ALPHA-3 · Rugby 1=ID-ZULU-9',
    'I2 ⭐⭐ : chacun garde SON identité malgré l\'inversion (' + v.config + ')');
  verifier(v.minis === '1→ID-ZULU-9 · 2→ID-ZULU-9 · 3→ID-ZULU-9 · 4→ID-ZULU-9 · ' +
    '5→ID-ALPHA-3 · 6→ID-ALPHA-3',
    'I2 ⭐⭐ : les mini-terrains persistés suivent l\'identité, ⛔ pas la position (' + v.minis + ')');
})();

(function I3_renommage() {
  const sc = scenarioIdentites();
  const ren = JSON.parse(JSON.stringify(sc.inv));
  ren[0].nom = 'Terrain d\'honneur';
  const r = sc.poser(ren, MINIS_SUR(0, 1));
  const v = sc.vu();
  verifier(r.ok && r.identites_attribuees === 0 &&
    v.config === 'Terrain d\'honneur=ID-ZULU-9 · Rugby 2=ID-ALPHA-3',
    'I3 ⭐⭐ : un terrain RENOMMÉ garde son identité (' + v.config + ')');
  verifier(v.snap === 'Terrain d\'honneur=ID-ZULU-9 · Rugby 2=ID-ALPHA-3',
    'I3 ⭐ : et le plan fige le NOUVEAU nom sous l\'ANCIENNE identité');
})();

(function I4_renommageEtPermutationSimultanes() {
  // 🚨 LE PIÈGE MAXIMAL : l'ex-« Rugby 2 » passe en tête ET prend le nom « Rugby 1 ».
  //    ⛔ Un rapprochement par NOM ou par POSITION échangerait les deux identités.
  const sc = scenarioIdentites();
  const x = [JSON.parse(JSON.stringify(sc.inv[1])), JSON.parse(JSON.stringify(sc.inv[0]))];
  x[0].nom = 'Rugby 1';
  x[1].nom = 'Rugby 2';
  const r = sc.poser(x, MINIS_SUR(1, 0));
  const v = sc.vu();
  verifier(r.ok && r.identites_attribuees === 0,
    'I4 ⭐ : renommage ET permutation simultanés — aucune identité neuve');
  verifier(v.config === 'Rugby 1=ID-ALPHA-3 · Rugby 2=ID-ZULU-9',
    'I4 ⭐⭐⭐ : les identités ont suivi les TERRAINS, ⛔ pas les noms (' + v.config + ')');
  verifier(v.minis.indexOf('1→ID-ZULU-9') !== -1 && v.minis.indexOf('5→ID-ALPHA-3') !== -1,
    'I4 ⭐⭐ : et les mini-terrains sont restés sur le bon terrain PHYSIQUE');
})();

(function I5_suppressionDuPremier() {
  const sc = scenarioIdentites();
  const r = sc.poser([sc.inv[1]], [{ numero: '5', terrain_index: 0, categorie: 'U10' },
                                   { numero: '6', terrain_index: 0, categorie: 'U10' }]);
  const v = sc.vu();
  verifier(r.ok && r.identites_attribuees === 0 && v.config === 'Rugby 2=ID-ALPHA-3',
    'I5 ⭐⭐ : supprimer le PREMIER ne transfère pas son identité au suivant (' + v.config + ')');
  verifier(v.minis === '5→ID-ALPHA-3 · 6→ID-ALPHA-3',
    'I5 ⭐ : les mini-terrains restants pointent toujours la bonne identité');
})();

(function I6_insertionAuMilieu() {
  const sc = scenarioIdentites();
  const avec = [sc.inv[0],
    { nom: 'Foot 1', type: 'foot', L: 105, W: 68, enBut: 0, nature: 'Synthétique', pos: 'HC' },
    sc.inv[1]];
  const r = sc.poser(avec, MINIS_SUR(0, 2));
  const v = sc.vu();
  verifier(r.ok && r.identites_attribuees === 1,
    'I6 ⭐ : insérer un terrain AU MILIEU n\'émet qu\'UNE identité neuve');
  // ⚠️ On n'exige PAS une valeur précise pour la 3ᵉ identité : le générateur sert aussi aux
  //    `plan_id` des brouillons, donc son rang dépend du nombre d'écritures. ⭐ Ce qui compte,
  //    et c'est ce qu'on exige : les DEUX existantes sont intactes, et la neuve diffère d'elles.
  const trois = JSON.parse(sc.f('lireConfig')(sc.cl).global.terrains_physiques);
  const idNeuf = trois[1].id;
  verifier(trois[0].id === 'ID-ZULU-9' && trois[2].id === 'ID-ALPHA-3',
    'I6 ⭐⭐ : les deux identités existantes n\'ont PAS bougé malgré le décalage (' + v.config + ')');
  verifier(idNeuf !== 'ID-ZULU-9' && idNeuf !== 'ID-ALPHA-3' && String(idNeuf).length > 0,
    'I6 ⭐ : le terrain inséré reçoit une identité NEUVE et distincte (' + idNeuf + ')');

  // ⭐ Et la nouvelle identité est STABLE : un second enregistrement ne la renouvelle pas.
  const relu = sc.f('planTerrainsPourEcran')(sc.cl).inventaire;
  const r2 = sc.poser(relu, MINIS_SUR(0, 2));
  const apres2 = JSON.parse(sc.f('lireConfig')(sc.cl).global.terrains_physiques).map((t) => t.id);
  verifier(r2.ok && r2.identites_attribuees === 0 &&
    apres2.join() === ['ID-ZULU-9', idNeuf, 'ID-ALPHA-3'].join(),
    'I6 ⭐⭐ : après RECHARGEMENT, le terrain neuf réutilise EXACTEMENT la même identité (' +
      apres2.join(' · ') + ')');
})();

(function I7_homonymes() {
  const sc = scenarioIdentites();
  const h = JSON.parse(JSON.stringify(sc.inv));
  h[1].nom = 'Rugby 1';                                   // ⭐ deux terrains HOMONYMES
  const r = sc.poser(h, MINIS_SUR(0, 1));
  const v = sc.vu();
  verifier(r.ok && r.identites_attribuees === 0 &&
    v.config === 'Rugby 1=ID-ZULU-9 · Rugby 1=ID-ALPHA-3',
    'I7 ⭐⭐ : deux HOMONYMES restent DISTINCTS par leur identité (' + v.config + ')');
  verifier(v.minis === '1→ID-ZULU-9 · 2→ID-ZULU-9 · 3→ID-ZULU-9 · 4→ID-ZULU-9 · ' +
    '5→ID-ALPHA-3 · 6→ID-ALPHA-3',
    'I7 ⭐⭐ : et leurs mini-terrains ne se mélangent pas');
  // ⛔ La CONFIRMATION, elle, refuse : le contrat public est indexé par NOM (invariant B2-3.a).
  const c = confirmer(sc.cl);
  verifier(!!c.error && /même nom/.test(c.error),
    'I7 ⭐ : la confirmation les REFUSE — le contrat public perdrait un terrain (' +
      (c.error || 'publié !').slice(0, 60) + '…)');
})();

(function I8_identitesRefusees() {
  const sc = scenarioIdentites();
  const avant = empreinte(sc.cl);
  const nbAvant = sc.ecrit.total();

  const faux = JSON.parse(JSON.stringify(sc.inv));
  faux[0].id = 'ID-ZULU-9-FALSIFIE';
  const r1 = sc.poser(faux, MINIS_SUR(0, 1));
  verifier(!!r1.error && /inconnu/i.test(r1.error),
    'I8 ⭐⭐ : un `terrain_id` FALSIFIÉ est refusé');

  const dup = JSON.parse(JSON.stringify(sc.inv));
  dup[1].id = dup[0].id;
  const r2 = sc.poser(dup, MINIS_SUR(0, 1));
  verifier(!!r2.error && /même identifiant/i.test(r2.error),
    'I8 ⭐⭐ : un `terrain_id` DUPLIQUÉ est refusé');
  verifier(empreinte(sc.cl) === avant && sc.ecrit.total() === nbAvant,
    'I8 ⭐⭐ : ⛔ aucun des deux refus n\'a écrit — classeur identique bit à bit');
})();

(function I9_unIndexModifieNeChangeAucuneIdentite() {
  // ⭐ Un index falsifié déplace un MINI-TERRAIN d'un parent à l'autre — c'est son rôle.
  //   ⛔ Ce qu'il ne peut JAMAIS faire, c'est déplacer une IDENTITÉ d'un terrain à l'autre.
  const sc = scenarioIdentites();
  const r = sc.poser(sc.inv, MINIS_SUR(1, 1));      // tous les minis sur le SECOND terrain
  const v = sc.vu();
  verifier(r.ok && v.config === 'Rugby 1=ID-ZULU-9 · Rugby 2=ID-ALPHA-3',
    'I9 ⭐⭐ : changer les index ne touche AUCUNE identité de grand terrain (' + v.config + ')');
  verifier(v.minis.split(' · ').every((x) => x.indexOf('ID-ALPHA-3') !== -1),
    'I9 ⭐ : seuls les RATTACHEMENTS ont bougé, comme demandé');
})();

(function I10_lesSnapshotsPubliesCollentAuMomentDeLaConfirmation() {
  const sc = scenarioIdentites();
  const ren = JSON.parse(JSON.stringify(sc.inv));
  ren[0].nom = 'Nom AU MOMENT DE LA CONFIRMATION';
  sc.poser(ren, MINIS_SUR(0, 1));
  const c = confirmer(sc.cl);
  verifier(c.ok === true, 'I10 : le plan est confirmé (' + (c.error || 'ok') + ')');

  const publie = sc.f('planTerrainsPublie')(sc.cl, ED_A);
  const fige = publie.terrains.map((t) => t.snap_nom + '=' + t.terrain_id).sort().join(' · ');
  verifier(fige.indexOf('Nom AU MOMENT DE LA CONFIRMATION=ID-ZULU-9') !== -1,
    'I10 ⭐⭐ : l\'instantané publié porte le nom ET l\'identité du moment de la confirmation');

  // ⭐ On renomme ENCORE, après la publication : l'instantané ne doit PAS bouger.
  const apres = sc.f('planTerrainsPourEcran')(sc.cl).inventaire;
  const ren2 = JSON.parse(JSON.stringify(apres));
  ren2[0].nom = 'Renommé APRÈS la confirmation';
  sc.poser(ren2, MINIS_SUR(0, 1));
  const publie2 = sc.f('planTerrainsPublie')(sc.cl, ED_A);
  verifier(publie2.terrains.map((t) => t.snap_nom).join().indexOf('APRÈS') === -1,
    'I10 ⭐⭐ : un renommage ULTÉRIEUR ne réécrit PAS l\'instantané publié');
  verifier(sc.f('repartitionTerrainsEditionActive')(sc.cl, sc.f('lireConfig')(sc.cl))
      .indexOf('Nom AU MOMENT DE LA CONFIRMATION') !== -1,
    'I10 ⭐ : le contrat public rend donc encore le nom figé, ⛔ pas le nom courant');
})();

/* ========================================================================== */
/*  SÉRIE J — « CONFIRMER » PUBLIE-T-IL CE QUE L'ON VOIT ?                     */
/* ========================================================================== */

titre('J — la confirmation ne publie jamais autre chose que ce qui est présenté');

(function J1_lEmpreinteEstObligatoire() {
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  const avant = empreinte(c.classeur);
  const r = F('confirmerPlanTerrains')(c.classeur, {});
  verifier(!!r.error && empreinte(c.classeur) === avant,
    'J1 ⭐⭐ : sans empreinte ⇒ REFUS, ⛔ rien écrit — le défaut est FERMÉ');
  const r2 = F('confirmerPlanTerrains')(c.classeur, { empreinte: '' });
  verifier(!!r2.error, 'J1 ⭐ : une empreinte VIDE ne vaut pas absence de contrôle');
  verifier(confirmer(c.classeur).ok === true,
    'J1 : (contrôle du contrôle) avec la bonne empreinte, ça publie');
})();

(function J2_unAutreOngletNePeutPasDetournerLaConfirmation() {
  // 🚨 LE DÉFAUT CONSTATÉ AVANT CORRECTION : un brouillon garde son `plan_id` d'un
  //    enregistrement à l'autre. Un second onglet pouvait donc le réécrire ENTIÈREMENT entre
  //    l'affichage et le clic, et « Confirmer » publiait ce plan-là EN SILENCE.
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  const vueChargee = F('planTerrainsPourEcran')(c.classeur);

  // Un autre onglet réécrit le brouillon : dimensions, couloir et NOM du terrain.
  const inv = vueChargee.inventaire;
  const modifie = JSON.parse(JSON.stringify(inv));
  modifie[0].nom = 'Modifié depuis un autre onglet';
  F('enregistrerPlanTerrains')(c.classeur, {
    terrains_physiques: JSON.stringify(modifie),
    plan_terrains: JSON.stringify({ selection: ['oui', 'oui'], minis: MINIS(),
      dimensions: { U8: { l: 77, w: 77 }, U10: { l: 40, w: 30 } },
      couloir_m: '42', tm_longueur_m: '4', tm_largeur_m: '4' }) });
  const vueReelle = F('planTerrainsPourEcran')(c.classeur);

  verifier(vueReelle.brouillon.plan_id === vueChargee.brouillon.plan_id,
    'J2 ⭐ : le `plan_id` est le MÊME — ⛔ il ne prouve rien sur le contenu');
  verifier(vueReelle.brouillon.empreinte !== vueChargee.brouillon.empreinte,
    'J2 ⭐⭐ : mais l\'EMPREINTE, elle, a changé');

  const avant = empreinte(c.classeur);
  const r = F('confirmerPlanTerrains')(c.classeur,
    { empreinte: vueChargee.brouillon.empreinte, plan_id: vueChargee.brouillon.plan_id });
  verifier(!!r.error && /autre onglet|changé/i.test(r.error),
    'J2 ⭐⭐⭐ : confirmer avec l\'empreinte PÉRIMÉE est REFUSÉ, avec un message qui l\'explique');
  verifier(empreinte(c.classeur) === avant &&
    F('pointeurPlanTerrains')(c.classeur, ED_A) === '',
    'J2 ⭐⭐ : ⛔ rien n\'a été publié, rien n\'a été écrit');

  // Après rechargement, la confirmation publie EXACTEMENT ce que l\'écran montre alors.
  const r2 = confirmer(c.classeur);
  const publie = F('planTerrainsPublie')(c.classeur, ED_A);
  verifier(r2.ok && publie.params.dimensions_json === vueReelle.brouillon.dimensions_json &&
    publie.params.couloir_m === vueReelle.brouillon.couloir_m,
    'J2 ⭐⭐ : après rechargement, le plan publié est CELUI QUE L\'ÉCRAN MONTRE');
})();

(function J3_leRenommageSeulSuffitAChangerLEmpreinte() {
  // ⚠️ `signatureTerrains` IGNORE les noms — délibérément (B2-3.a). L'empreinte, elle, ne le
  //    peut pas : le nom est ce que l'organisateur LIT à l'écran.
  const c = classeur({ structure: true });
  const r1 = F('enregistrerPlanTerrains')(c.classeur, envoi());
  const e1 = F('planTerrainsPourEcran')(c.classeur).brouillon.empreinte;
  const ren = JSON.parse(JSON.stringify(r1.inventaire));
  ren[0].nom = 'Autre nom';
  F('enregistrerPlanTerrains')(c.classeur, envoi({ inventaire: ren }));
  const e2 = F('planTerrainsPourEcran')(c.classeur).brouillon.empreinte;
  verifier(e1 !== e2,
    'J3 ⭐⭐ : un simple RENOMMAGE change l\'empreinte — ⛔ `signatureTerrains` ne l\'aurait pas vu');

  // ⭐ Et elle est CANONIQUE : deux lectures du même brouillon donnent la même empreinte.
  const e3 = F('planTerrainsPourEcran')(c.classeur).brouillon.empreinte;
  verifier(e2 === e3, 'J3 ⭐ : deux lectures du même brouillon donnent la MÊME empreinte');
})();

(function J4_lEcranRefuseAvantDEnvoyer() {
  // ⭐ LE PREMIER DES DEUX VERROUS : l'écran lui-même. Il attrape ce que le serveur ne peut
  //   pas voir — une saisie en cours, jamais envoyée.
  const ecran = fabriquerBacEcran();
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  const vue = F('planTerrainsPourEcran')(c.classeur);
  vm.runInContext('planTerrainsB23 = ' + JSON.stringify(vue) + '; planTerrainsB23Demande = true;', ecran);
  vm.runInContext('lireDimensionsDuFormulaire = function () { ' +
    'return { U8: { l: 30, w: 20 }, U10: { l: 40, w: 30 } }; };', ecran);
  vm.runInContext('lireCouloir = function () { return 5; };', ecran);
  vm.runInContext('lireTailleTM = function () { return { l: 4, w: 4 }; };', ecran);

  // ① le formulaire est FIDÈLE au brouillon ⇒ aucun écart
  const fidele = vue.brouillon.terrains.map((l) => ({ id: l.terrain_id, nom: l.snap_nom,
    type: l.snap_type, nature: l.snap_nature, pos: l.snap_pos, L: Number(l.snap_longueur_m),
    W: Number(l.snap_largeur_m), enBut: Number(l.snap_enbut_m), selectionne: l.selectionne }));
  ecran.__poserLignes(fidele);
  verifier(vm.runInContext('ecartFormulaireBrouillon()', ecran) === null,
    'J4 ⭐ : formulaire fidèle au brouillon ⇒ aucun écart signalé');

  // ② une largeur modifiée SANS enregistrer ⇒ refus nommé
  const modifie = JSON.parse(JSON.stringify(fidele));
  modifie[0].W = 99;
  ecran.__poserLignes(modifie);
  const ecart = vm.runInContext('ecartFormulaireBrouillon()', ecran);
  verifier(typeof ecart === 'string' && ecart.indexOf('Rugby 1') !== -1 &&
    /Enregistrer/i.test(ecart),
    'J4 ⭐⭐ : une largeur modifiée SANS enregistrer bloque la confirmation, en nommant le terrain');

  // ③ une case « utilisé » décochée sans enregistrer ⇒ refus
  const decoche = JSON.parse(JSON.stringify(fidele));
  decoche[0].selectionne = 'non';
  ecran.__poserLignes(decoche);
  verifier(typeof vm.runInContext('ecartFormulaireBrouillon()', ecran) === 'string',
    'J4 ⭐ : décocher « utilisé » sans enregistrer bloque aussi');

  // ④ une répartition calculée mais NON appliquée ⇒ refus
  ecran.__poserLignes(fidele);
  vm.runInContext('repartitionCalculee = { fieldsPlan: [], terrainsSource: [] };', ecran);
  const r4 = vm.runInContext('ecartFormulaireBrouillon()', ecran);
  verifier(typeof r4 === 'string' && /Appliquer/i.test(r4),
    'J4 ⭐⭐ : une répartition calculée mais NON APPLIQUÉE bloque la confirmation');
  vm.runInContext('repartitionCalculee = null;', ecran);
  verifier(vm.runInContext('ecartFormulaireBrouillon()', ecran) === null,
    'J4 : (contrôle du contrôle) une fois appliquée, plus d\'écart');
})();

(function J5_leBoutonEnvoieBienLeJeton() {
  const ecran = fabriquerBacEcran();
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  const vue = F('planTerrainsPourEcran')(c.classeur);
  vm.runInContext('planTerrainsB23 = ' + JSON.stringify(vue) + '; planTerrainsB23Demande = true;', ecran);
  vm.runInContext('ecartFormulaireBrouillon = function () { return null; };', ecran);
  vm.runInContext('rafraichirEtatTerrains = async function () {};', ecran);
  vm.runInContext('onConfirmerPlanTerrains();', ecran);

  return new Promise((r) => setImmediate(r)).then(() => new Promise((r) => setImmediate(r)))
    .then(() => {
      const envoye = ecran.__envois.filter((e) => e.action === 'confirmerPlanTerrains')[0];
      verifier(!!envoye && envoye.data.empreinte === vue.brouillon.empreinte,
        'J5 ⭐⭐ : le bouton renvoie EXACTEMENT l\'empreinte reçue du serveur — ⛔ il n\'en calcule aucune');
      verifier(!!envoye && envoye.data.plan_id === vue.brouillon.plan_id,
        'J5 ⭐ : et le `plan_id` de la proposition affichée');
      // Le serveur, lui, l'accepte.
      verifier(F('confirmerPlanTerrains')(c.classeur, envoye.data).ok === true,
        'J5 ⭐⭐ : le jeton produit par le VRAI bouton est accepté par le VRAI serveur');
      finirJ();
    });
})();

function finirJ() {

/* ========================================================================== */
/*  SÉRIE K — CONTRÔLE D'ACCÈS ET COHÉRENCE DE LECTURE                        */
/* ========================================================================== */

titre('K — `getPlanTerrains` est une lecture d\'administration, et rien d\'autre');

(function K1_memeNiveauDAutorisationQueLesAutresLecturesAdmin() {
  const src = SOURCE_CODE;
  const lecture = /var ACTIONS_LECTURE = \{([\s\S]*?)\};/.exec(src);
  verifier(!!lecture && /getPlanTerrains:\s*true/.test(lecture[1]),
    'K1 : `getPlanTerrains` est déclarée dans `ACTIONS_LECTURE`, comme `getConfigAdmin`');

  // ⭐ Le contrôle de clé PRÉCÈDE le branchement des lectures : c'est ce qui rend l'action
  //   aussi protégée que `getConfigAdmin`. On établit l'ORDRE dans `doPost`.
  const iCle = src.indexOf("var nomCle = ACTIONS_SCORES[action] ? 'CLE_SCORES' : 'CLE_ADMIN';");
  const iLect = src.indexOf('if (ACTIONS_LECTURE[action]) {');
  const iCase = src.indexOf("case 'getPlanTerrains':");
  verifier(iCle > 0 && iLect > iCle && iCase > iLect,
    'K1 ⭐⭐ : le contrôle de la CLÉ ADMIN précède le branchement — ⛔ aucune lecture sans clé');
  verifier(!/ACTIONS_SCORES = \{[^}]*getPlanTerrains/.test(src) &&
    !/ACTIONS_TOKEN = \{[^}]*getPlanTerrains/.test(src),
    'K1 ⭐ : ⛔ elle n\'est ni dans les actions à clé SCORES, ni dans celles à jeton public');

  // ⛔ Et elle n'est joignable par AUCUNE route publique (`doGet`).
  // ⚠️ On découpe la VRAIE fonction, par équilibrage d'accolades. Le premier jet de ce contrôle
  //    prenait « tout ce qui sépare `doGet` de `doPost` » — soit 150 000 caractères, dont la
  //    déclaration d'`ACTIONS_LECTURE` : il criait au loup sur du code parfaitement sain.
  const debut = src.indexOf('function doGet(');
  let prof = 0, fin = debut;
  for (let i = src.indexOf('{', debut); i < src.length; i++) {
    if (src[i] === '{') prof++;
    else if (src[i] === '}' && --prof === 0) { fin = i + 1; break; }
  }
  const doGet = src.slice(debut, fin);
  verifier(fin > debut && doGet.length < 12000,
    'K1 : (contrôle du contrôle) la fonction `doGet` est bien isolée (' + doGet.length + ' caractères)');
  verifier(doGet.indexOf('getPlanTerrains') === -1 && doGet.indexOf('planTerrainsPourEcran') === -1 &&
    doGet.indexOf('confirmerPlanTerrains') === -1,
    'K1 ⭐⭐ : ⛔ `doGet` — la porte PUBLIQUE, sans clé — ne connaît AUCUNE des deux actions');
})();

(function K2_aucunBrouillonNExposePubliquement() {
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());     // un brouillon existe, non publié
  ['live', 'club', 'public'].forEach((vue) => {
    let rendu;
    try { rendu = JSON.stringify(F('lireConfigPublique')(c.classeur, vue)); }
    catch (e) { rendu = ''; }
    verifier(rendu.indexOf('Rugby 1') === -1 && rendu.indexOf('brouillon') === -1,
      'K2 ⭐⭐ : la vue publique « ' + vue + ' » n\'expose ⛔ AUCUN brouillon');
  });
  verifier(F('repartitionTerrainsEditionActive')(c.classeur, F('lireConfig')(c.classeur)) === '',
    'K2 ⭐ : et le contrat public reste VIDE tant que rien n\'est confirmé');
})();

(function K3_lectureIntermediaireEchoueFerme() {
  // ⚠️ Les trois onglets ne sont PAS transactionnels — B2-3.b le dit noir sur blanc. Une
  //    lecture peut donc tomber au milieu d'une écriture. ⭐ Ce qu'on établit ici : un tel
  //    assemblage ne peut pas être CONFIRMÉ, parce que son empreinte ne se retrouvera pas.
  const c = classeur({ structure: true });
  F('enregistrerPlanTerrains')(c.classeur, envoi());
  const partielle = F('planTerrainsPourEcran')(c.classeur).brouillon.empreinte;

  // On simule la suite de l'écriture : deux mini-terrains de plus arrivent.
  const inv = F('planTerrainsPourEcran')(c.classeur).inventaire;
  F('enregistrerPlanTerrains')(c.classeur, envoi({ inventaire: inv,
    minis: MINIS().concat([{ numero: '7', terrain_index: 1, categorie: 'U10' }]) }));

  const avant = empreinte(c.classeur);
  const r = F('confirmerPlanTerrains')(c.classeur, { empreinte: partielle });
  verifier(!!r.error && empreinte(c.classeur) === avant,
    'K3 ⭐⭐ : une empreinte prise sur un état INTERMÉDIAIRE ne peut pas confirmer — ⛔ et n\'écrit rien');
  verifier(/Recharge/i.test(r.error),
    'K3 ⭐ : le refus demande un RECHARGEMENT — le défaut est fermé, pas silencieux');
})();

/* ========================================================================== */
/*  SÉRIE H — LA SÉRIE APPS SCRIPT, REJOUÉE ICI                               */
/* ========================================================================== */

titre('H — la série Apps Script B2-3.d tourne vraiment');

const TESTS_B23D = ['testB23d_D1_sansStructureRienNeChange',
  'testB23d_D2_ecranDistingueLesTroisChoses', 'testB23d_D3_identitesAttribueesPuisConservees',
  'testB23d_D4_refusSansTrace', 'testB23d_D5_confirmerEstUnGesteAPart',
  'testB23d_D6_confirmerRefuseFerme', 'testB23d_D7_publicationParUnSeulChemin',
  'testB23d_D8_onNeConfirmeQueCeQuiEstPresente'];

function rejouerSerie(contexte) {
  const resultat = { total: 0, ok: 0, fail: 0, echecs: [] };
  TESTS_B23D.forEach((nom) => {
    const f = vm.runInContext(nom, contexte);
    if (typeof f !== 'function') {
      resultat.echecs.push(nom + ' introuvable dans backend/Tests.gs');
      resultat.fail++; resultat.total++;
      return;
    }
    const e = { total: 0, ok: 0, fail: 0, echecs: [] };
    try { f(e); } catch (err) { e.fail++; e.total++; e.echecs.push(nom + ' a levé : ' + err.message); }
    resultat.total += e.total; resultat.ok += e.ok; resultat.fail += e.fail;
    e.echecs.forEach((x) => resultat.echecs.push(x));
  });
  return resultat;
}

(function H_serieAppsScript() {
  TESTS_B23D.forEach((nom) => {
    const f = vm.runInContext(nom, bac);
    const e = { total: 0, ok: 0, fail: 0, echecs: [] };
    if (typeof f !== 'function') { verifier(false, 'H : ' + nom + ' introuvable'); return; }
    try { f(e); } catch (err) { e.fail++; e.echecs.push('a levé : ' + err.message); }
    verifier(e.fail === 0, 'H : ' + nom + ' — ' + e.ok + '/' + e.total + ' assertion(s) Apps Script' +
      (e.echecs.length ? ' — ' + e.echecs[0] : ''));
  });
  const bilan = rejouerSerie(bac);
  verifier(bilan.fail === 0,
    'H-FIN ⭐⭐ la série Apps Script B2-3.d passe ENTIÈREMENT ici : ' + bilan.ok + '/' + bilan.total +
    ' assertions, ' + bilan.fail + ' échec(s)');
})();

/* ========================================================================== */
/*  SÉRIE M — LES MUTATIONS : est-ce que tout cela MORD ?                      */
/* ========================================================================== */

titre('M — on réintroduit les défauts, et les contrôles doivent les attraper');

/** Les contrôles VIVANTS, rejoués sur un bac muté. */
function controlesVivants(contexte) {
  const echecs = [];
  const f = (nom) => vm.runInContext(nom, contexte);
  const enregistrer = f('enregistrerPlanTerrains');
  const confirmerBrut = f('confirmerPlanTerrains');
  const confirmer = function (cl) {
    const b = f('planTerrainsPourEcran')(cl).brouillon || {};
    return confirmerBrut(cl, { empreinte: b.empreinte || '', plan_id: b.plan_id || '' });
  };
  const pointeur = f('pointeurPlanTerrains');
  const ecran = f('planTerrainsPourEcran');
  const structureEnPlace = f('structureTerrainsB23EnPlace');
  const lireCfg = f('lireConfig');
  const repartition = f('repartitionTerrainsEditionActive');
  const minisDe = f('lireLignesMiniTerrains');
  const plansDe = f('lireTerrainsPlan');

  // ① Enregistrer ne publie jamais.
  try {
    const c = classeur({ structure: true });
    f('assurerStructureTerrainsB23');
    enregistrer(c.classeur, envoi());
    if (pointeur(c.classeur, ED_A) !== '') echecs.push('enregistrer a PUBLIÉ');
    if (repartition(c.classeur, lireCfg(c.classeur)) !== '') echecs.push('un brouillon est devenu consommable');
  } catch (e) { echecs.push('① a levé : ' + e.message); }

  // ② Les identités sont conservées d'un enregistrement à l'autre.
  try {
    const c = classeur({ structure: true });
    const r1 = enregistrer(c.classeur, envoi());
    if (!r1.inventaire || !r1.inventaire.every((t) => String(t.id || '') !== '')) {
      echecs.push('aucune identité attribuée');
    } else {
      const r2 = enregistrer(c.classeur, envoi({ inventaire: r1.inventaire }));
      if (!r2.inventaire || r2.inventaire.map((t) => t.id).join() !== r1.inventaire.map((t) => t.id).join()) {
        echecs.push('les identités ont CHANGÉ au second enregistrement');
      }
      const m = minisDe(c.classeur);
      if (m.length !== 6) echecs.push('le découpage n\'a pas 6 mini-terrains');
      if (!m.every((x) => x.categorie === 'U8' || x.categorie === 'U10')) {
        echecs.push('une catégorie de mini-terrain a été perdue ou remplacée');
      }
      if (!m.every((x) => r1.inventaire.some((t) => t.id === x.terrain_id))) {
        echecs.push('un mini-terrain ne porte pas une identité durable');
      }
    }
  } catch (e) { echecs.push('② a levé : ' + e.message); }

  // ③ Les refus ne laissent rien.
  try {
    [{ selection: null }, { minis: [{ numero: '1', terrain_index: 0, categorie: 'U19' }] },
     { minis: [{ numero: '1', terrain_index: 0 }] },
     { minis: [{ numero: '1', terrain_index: 42, categorie: 'U8' }] },
     { minis: [{ numero: '1', terrain_index: 0, categorie: 'U8' },
               { numero: '1', terrain_index: 1, categorie: 'U8' }] }].forEach((cas, i) => {
      const c = classeur({ structure: true });
      const avant = empreinte(c.classeur);
      const r = enregistrer(c.classeur, envoi(cas));
      if (!r || !r.error) echecs.push('refus n°' + i + ' non prononcé');
      if (empreinte(c.classeur) !== avant) echecs.push('refus n°' + i + ' a laissé une trace');
    });
  } catch (e) { echecs.push('③ a levé : ' + e.message); }

  // ④ La confirmation publie, et l'ancien plan tient pendant la préparation du suivant.
  try {
    const c = classeur({ structure: true });
    enregistrer(c.classeur, envoi());
    const conf = confirmer(c.classeur);
    if (!conf.ok) echecs.push('la confirmation a échoué : ' + conf.error);
    const projection = repartition(c.classeur, lireCfg(c.classeur));
    if (projection !== '{"Rugby 1":["1","2","3","4"],"Rugby 2":["5","6"]}') {
      echecs.push('la projection publiée est fausse (« ' + projection + ' »)');
    }
    enregistrer(c.classeur, envoi({ minis: [{ numero: '9', terrain_index: 0, categorie: 'U8' }] }));
    if (repartition(c.classeur, lireCfg(c.classeur)) !== projection) {
      echecs.push('un nouveau brouillon a changé ce que voient les consommateurs');
    }
    if (ecran(c.classeur).etat !== 'a_reconfirmer') echecs.push('l\'état « à reconfirmer » a disparu');
  } catch (e) { echecs.push('④ a levé : ' + e.message); }

  // ⑤ bis — CONFIRMER UN BROUILLON INVALIDE NE LAISSE RIEN.
  //    ⭐ Révélé par la mutation M2 : sans la validation EN MÉMOIRE, le candidat est écrit puis
  //    rejeté à la relecture — le refus laisse alors des lignes orphelines. La garantie de
  //    B2-3.b est plus forte que « ça ne publie pas » : c'est « ça n'écrit RIEN ».
  try {
    const c = classeur({ structure: true });
    enregistrer(c.classeur, envoi({ minis: [] }));       // brouillon sans mini-terrain
    const avant = empreinte(c.classeur);
    const r = confirmer(c.classeur);
    if (!r || !r.error) echecs.push('un brouillon INVALIDE a été confirmé');
    if (empreinte(c.classeur) !== avant) {
      echecs.push('une confirmation REFUSÉE a laissé une trace dans le classeur');
    }
  } catch (e) { echecs.push('⑤bis a levé : ' + e.message); }

  // ⑤ ter — UNE SÉLECTION DÉCALÉE EST REFUSÉE, même quand rien d'autre ne la trahit.
  //    ⭐ Révélé par M11 : avec des mini-terrains tous posés sur le PREMIER grand terrain, un
  //    décalage passe en silence — et le second terrain devient « écarté » alors que
  //    l'organisateur l'avait coché. ⛔ Le contrôle de longueur est donc le seul filet.
  try {
    const c = classeur({ structure: true });
    const avant = empreinte(c.classeur);
    const r = enregistrer(c.classeur, envoi({
      selection: ['oui'],
      minis: [{ numero: '1', terrain_index: 0, categorie: 'U8' }] }));
    if (!r || !r.error) echecs.push('une sélection DÉCALÉE a été acceptée');
    if (empreinte(c.classeur) !== avant) echecs.push('la sélection décalée a écrit');
  } catch (e) { echecs.push('⑤ter a levé : ' + e.message); }

  // ⑤ quater — LE REFUS D'UN INDEX HORS BORNES DIT LEQUEL.
  //    ⭐ Révélé par M13 : sans le contrôle de bornes, le message devient « n'a pas
  //    d'identifiant » — vrai, mais inexploitable. ⛔ Un refus doit nommer la cause.
  try {
    const c = classeur({ structure: true });
    const r = enregistrer(c.classeur, envoi({
      minis: [{ numero: '1', terrain_index: 42, categorie: 'U8' }] }));
    if (!r || !r.error) echecs.push('un `terrain_index` hors bornes a été accepté');
    else if (r.error.indexOf('42') === -1) {
      echecs.push('le refus d\'un index hors bornes ne dit pas lequel : « ' + r.error + ' »');
    }
  } catch (e) { echecs.push('⑤quater a levé : ' + e.message); }

  // ⑤ quinquies — L'ABSENCE DE DÉCOUPAGE LE CONSERVE.
  //    ⭐ Révélé par M14 : « Enregistrer les terrains » ne parle pas des mini-terrains ; si son
  //    silence les effaçait, chaque correction de largeur détruirait la répartition.
  try {
    const c = classeur({ structure: true });
    const premier = enregistrer(c.classeur, envoi());
    const message = envoi({ inventaire: premier.inventaire });
    const payload = JSON.parse(message.plan_terrains);
    delete payload.minis;
    message.plan_terrains = JSON.stringify(payload);
    enregistrer(c.classeur, message);
    if (minisDe(c.classeur).length !== 6) {
      echecs.push('un enregistrement SANS découpage a effacé les mini-terrains');
    }
  } catch (e) { echecs.push('⑤quinquies a levé : ' + e.message); }

  // ⑤ sexies — EN RÉGIME MODERNE, `Config` N'EST PLUS RÉÉCRIT POUR L'ÉVÉNEMENTIEL.
  //    ⭐ Révélé par M19 : y réécrire n'aurait aucun effet visible et laisserait traîner une
  //    valeur périmée que la prochaine édition pourrait croire sienne (c'est R-101).
  try {
    const c = classeur({ structure: true });
    const message = envoi();
    message.repartition_grands_terrains = '{"NOUVEAU":["1"]}';
    message.dimensions_categories = '{"U8":{"l":77,"w":77}}';
    enregistrer(c.classeur, message);
    const g = lireCfg(c.classeur).global;
    if (g.repartition_grands_terrains !== PIEGE) {
      echecs.push('`repartition_grands_terrains` a été réécrit dans Config en régime moderne');
    }
    if (g.dimensions_categories !== '{"U8":{"l":99,"w":99}}') {
      echecs.push('`dimensions_categories` a été réécrit dans Config en régime moderne');
    }
  } catch (e) { echecs.push('⑤sexies a levé : ' + e.message); }

  // ⑤ septies — L'IDENTITÉ SUIT LE TERRAIN, ⛔ NI LE NOM, NI LA POSITION.
  //    ⭐ Le cas maximal : l'ex-second terrain passe en tête ET prend le nom du premier.
  //    Un rapprochement par nom, par position, ou « comme la fois d'avant » échange les deux.
  try {
    const c = classeur({ structure: true });
    const r1 = enregistrer(c.classeur, envoi());
    const A = r1.inventaire[0].id, B = r1.inventaire[1].id;
    if (!A || !B || A === B) echecs.push('les deux identités de départ ne sont pas distinctes');
    const x = [JSON.parse(JSON.stringify(r1.inventaire[1])), JSON.parse(JSON.stringify(r1.inventaire[0]))];
    x[0].nom = 'Rugby 1'; x[1].nom = 'Rugby 2';
    const r2 = enregistrer(c.classeur, { terrains_physiques: JSON.stringify(x),
      plan_terrains: JSON.stringify({ selection: ['oui', 'oui'],
        minis: [{ numero: '1', terrain_index: 1, categorie: 'U8' }, { numero: '2', terrain_index: 1, categorie: 'U8' },
                { numero: '3', terrain_index: 1, categorie: 'U8' }, { numero: '4', terrain_index: 1, categorie: 'U8' },
                { numero: '5', terrain_index: 0, categorie: 'U10' }, { numero: '6', terrain_index: 0, categorie: 'U10' }],
        dimensions: { U8: { l: 30, w: 20 }, U10: { l: 40, w: 30 } },
        couloir_m: '5', tm_longueur_m: '4', tm_largeur_m: '4' }) });
    if (r2.error) echecs.push('renommage+permutation refusé : ' + r2.error);
    else {
      if (r2.identites_attribuees !== 0) echecs.push('renommage+permutation a émis une identité NEUVE');
      const ecrit = JSON.parse(lireCfg(c.classeur).global.terrains_physiques);
      if (ecrit[0].id !== B || ecrit[1].id !== A) {
        echecs.push('les identités ont été ÉCHANGÉES : attendu ' + B + ',' + A +
          ' — obtenu ' + ecrit[0].id + ',' + ecrit[1].id);
      }
      const m = minisDe(c.classeur);
      const surA = m.filter((x2) => x2.terrain_id === A).map((x2) => x2.numero).sort().join();
      if (surA !== '1,2,3,4') {
        echecs.push('les mini-terrains ont suivi la POSITION au lieu de l\'identité (sur ' + A + ' : ' + surA + ')');
      }
      // ⛔ Et la référence éphémère de création ne doit JAMAIS être persistée comme identité.
      if (m.some((x2) => x2.terrain_id === '0' || x2.terrain_id === '1')) {
        echecs.push('un `terrain_id` persisté vaut un INDEX — la référence éphémère a fui');
      }
    }
  } catch (e) { echecs.push('⑤septies a levé : ' + e.message); }

  // ⑤ octies — LA CONFIRMATION NE PUBLIE QUE CE QUI A ÉTÉ PRÉSENTÉ.
  try {
    const c = classeur({ structure: true });
    const r1 = enregistrer(c.classeur, envoi());
    const vueChargee = ecran(c.classeur);
    if (!vueChargee.brouillon || !vueChargee.brouillon.empreinte) {
      echecs.push('le brouillon ne porte plus d\'empreinte');
    }
    const sansJeton = confirmerBrut(c.classeur, {});
    if (!sansJeton.error) {
      echecs.push('la confirmation SANS empreinte a été acceptée');
    } else if (!/n'a pas indiqué/i.test(sansJeton.error)) {
      // ⭐ Révélé par la mutation M27 : sans le contrôle « empreinte absente », le refus a
      //   quand même lieu — mais par le contrôle SUIVANT, dont le message accuse « un autre
      //   onglet ». ⛔ L'organisateur partirait chercher un problème qui n'existe pas.
      echecs.push('le refus SANS empreinte donne un message trompeur : « ' +
        sansJeton.error.slice(0, 70) + '… »');
    }
    // Un autre onglet réécrit le brouillon.
    const mod = JSON.parse(JSON.stringify(r1.inventaire));
    mod[0].nom = 'Réécrit ailleurs';
    enregistrer(c.classeur, envoi({ inventaire: mod }));
    const avant = empreinte(c.classeur);
    if (!confirmerBrut(c.classeur, { empreinte: vueChargee.brouillon.empreinte }).error) {
      echecs.push('une empreinte PÉRIMÉE a été acceptée — la confirmation publie en silence');
    }
    if (empreinte(c.classeur) !== avant) echecs.push('le refus de confirmation a écrit');
    if (!confirmer(c.classeur).ok) echecs.push('la confirmation à jour ne publie plus');
  } catch (e) { echecs.push('⑤octies a levé : ' + e.message); }

  // ⑤ Le régime historique est intact, et rien ne crée la structure.
  try {
    const c = classeur({ structure: false });
    const message = envoi();
    message.repartition_grands_terrains = '{"Rugby 1":["1"]}';
    enregistrer(c.classeur, message);
    if (lireCfg(c.classeur).global.repartition_grands_terrains !== '{"Rugby 1":["1"]}') {
      echecs.push('le régime historique n\'écrit plus les six champs');
    }
    if (lireCfg(c.classeur).global.terrains_physiques !== message.terrains_physiques) {
      echecs.push('le régime historique a modifié l\'inventaire au passage');
    }
    if (plansDe(c.classeur).length !== 0) echecs.push('un brouillon est né sans structure');
    if (structureEnPlace(c.classeur)) echecs.push('l\'écriture a CRÉÉ la structure');
    ecran(c.classeur);
    if (structureEnPlace(c.classeur)) echecs.push('la LECTURE a créé la structure');
    const vide = classeur({ structure: false });
    confirmer(vide.classeur);
    if (structureEnPlace(vide.classeur)) echecs.push('confirmer a créé la structure');
  } catch (e) { echecs.push('⑤ a levé : ' + e.message); }

  return echecs;
}

const MUTATIONS = [
  {
    nom: 'M1 · enregistrer PUBLIE au passage (le brouillon devient le plan)',
    de: "    if (ecrit.error) return ecrit;\n    planId = ecrit.plan_id;",
    vers: "    if (ecrit.error) return ecrit;\n    planId = ecrit.plan_id;\n" +
          "    ecrirePointeurPlanTerrains(classeur, source.edition_id, planId);"
  },
  {
    nom: 'M2 · le pointeur bouge AVANT la validation complète du candidat',
    de: "  var ecarts = ecartsPlanTerrains(enMemoire, categories);\n" +
        "  if (ecarts.length) return { error: 'Plan refusé : ' + ecarts.join(' · '), ecarts: ecarts };",
    vers: "  var ecarts = [];"
  },
  {
    nom: 'M3 · l\'identité est remplacée par une NEUVE à chaque enregistrement',
    de: "  var identites = planifierIdentitesTerrains(recues, connues, function () { return Utilities.getUuid(); });",
    vers: "  var identites = planifierIdentitesTerrains(recues, [], function () { return Utilities.getUuid(); });"
  },
  {
    nom: 'M4 · l\'identité est remplacée par la POSITION à l\'écran',
    de: "function ligneTerrainDepuisInventaire(entree, selectionne) {\n" +
        "  var ligne = { terrain_id: valeurTexteTerrain(entree && entree.id),",
    vers: "function ligneTerrainDepuisInventaire(entree, selectionne, __i) {\n" +
          "  var ligne = { terrain_id: String(__i === undefined ? 0 : __i),"
  },
  {
    nom: 'M5 · l\'identité est remplacée par le NOM du terrain',
    de: "  var ligne = { terrain_id: valeurTexteTerrain(entree && entree.id),",
    vers: "  var ligne = { terrain_id: valeurTexteTerrain(entree && entree.nom),"
  },
  {
    nom: 'M6 · une identité INCONNUE du serveur est acceptée',
    de: "      if (!connus[id]) {\n        return { error: 'Identifiant de grand terrain inconnu (' + id + ') : il n\\'a pas été ' +\n" +
        "          'émis par le serveur. Recharge la page, puis réessaie.' };\n      }",
    vers: "      /* garde-fou retiré */"
  },
  {
    nom: 'M7 · la CATÉGORIE d\'un mini-terrain devient facultative',
    de: "      if (categorie === '') {\n" +
        "        return { error: 'Le mini-terrain ' + numero + ' n\\'a pas de catégorie. ' +\n" +
        "          '⛔ Rien n\\'a été écrit.' };\n      }",
    vers: "      if (categorie === '') categorie = 'U8';"
  },
  {
    nom: 'M8 · la catégorie INCONNUE passe (elle serait devinée plus tard)',
    de: "      if (!presentes[categorie]) {",
    vers: "      if (false && !presentes[categorie]) {"
  },
  {
    nom: 'M9 · un numéro de mini-terrain EN DOUBLE est accepté',
    de: "      if (vus[numero]) {\n" +
        "        return { error: 'Le numéro de mini-terrain « ' + numero + ' » apparaît deux fois. ' +\n" +
        "          '⛔ Rien n\\'a été écrit.' };\n      }",
    vers: "      /* garde-fou retiré */"
  },
  {
    nom: 'M10 · la SÉLECTION absente vaut « tout retenu » (un défaut deviné)',
    de: "  var brutSel = payload.selection;\n  if (!Array.isArray(brutSel)) {",
    vers: "  var brutSel = payload.selection;\n" +
          "  if (!Array.isArray(brutSel)) { brutSel = inventaire.map(function () { return 'oui'; }); }\n" +
          "  if (false) {"
  },
  {
    nom: 'M11 · une sélection DÉCALÉE passe (les cases glissent d\'un terrain)',
    de: "  if (brutSel.length !== inventaire.length) {",
    vers: "  if (false && brutSel.length !== inventaire.length) {"
  },
  {
    nom: 'M12 · un mini-terrain peut se poser sur un grand terrain ÉCARTÉ',
    de: "      if (!retenuParId[idTerrain]) {",
    vers: "      if (false && !retenuParId[idTerrain]) {"
  },
  {
    nom: 'M13 · un `terrain_index` HORS BORNES est accepté',
    de: "      if (idx < 0 || idx >= idParIndex.length) {",
    vers: "      if (false) {"
  },
  {
    nom: 'M14 · l\'ABSENCE de découpage l\'EFFACE au lieu de le conserver',
    de: "  if (payload.minis === undefined || payload.minis === null) {\n" +
        "    minis = ((base && base.minis) || []).map(function (m) {",
    vers: "  if (payload.minis === undefined || payload.minis === null) {\n" +
          "    minis = ([]).map(function (m) {"
  },
  {
    nom: 'M15 · un `plan_terrains` ILLISIBLE vide le découpage au lieu de refuser',
    de: "  try { obj = JSON.parse(texte); } catch (e) {\n" +
        "    return { error: 'Le plan des terrains envoyé est illisible. ⛔ Rien n\\'a été écrit.' };\n  }",
    vers: "  try { obj = JSON.parse(texte); } catch (e) { return { plan: { selection: [], minis: [] } }; }"
  },
  {
    nom: 'M16 · le brouillon est écrit AVANT que le message soit validé',
    de: "    if (construit.error) return construit;",
    vers: "    if (construit.error) { ecrireBrouillonTerrains(classeur, source.edition_id,\n" +
          "      { params: {}, terrains: [], minis: [] }, function () { return Utilities.getUuid(); });\n" +
          "      return construit; }"
  },
  {
    nom: 'M17 · `enregistrerPlanTerrains` CRÉE la structure au passage',
    de: "function enregistrerPlanTerrains(classeur, data) {\n  var onglet = classeur.getSheetByName('Config');",
    vers: "function enregistrerPlanTerrains(classeur, data) {\n  var onglet = classeur.getSheetByName('Config');\n" +
          "  assurerStructureTerrainsB23(classeur);"
  },
  {
    nom: 'M18 · `confirmerPlanTerrains` crée la structure plutôt que de refuser',
    de: "  if (!structureTerrainsB23EnPlace(classeur)) {\n" +
        "    return { error: 'La configuration par édition n\\'est pas encore en place sur ce classeur. ' +\n" +
        "      '⛔ Rien n\\'a été écrit.' };\n  }",
    vers: "  if (!structureTerrainsB23EnPlace(classeur)) { assurerStructureTerrainsB23(classeur); }"
  },
  {
    nom: 'M19 · le régime MODERNE réécrit quand même `repartition_grands_terrains` dans Config',
    de: "  var durables = {};\n  CHAMPS_TERRAINS_DURABLES.forEach(function (c) { if (data[c] != null) durables[c] = data[c]; });",
    vers: "  var durables = {};\n" +
          "  CHAMPS_TERRAINS_DURABLES.concat(CHAMPS_TERRAINS_EVENEMENTIELS).forEach(function (c) {\n" +
          "    if (data[c] != null) durables[c] = data[c]; });\n" +
          "  champs = CHAMPS_TERRAINS_DURABLES.concat(CHAMPS_TERRAINS_EVENEMENTIELS);"
  },
  {
    nom: 'M20 · le régime HISTORIQUE se met à écrire un brouillon (casse l\'ordre des phases)',
    de: "  if (!source.moderne) {\n    ecrireChampsConfig(onglet, data, champs);\n    return { ok: true };\n  }",
    vers: "  if (!source.moderne) {\n    ecrireChampsConfig(onglet, data, champs);\n" +
          "    assurerStructureTerrainsB23(classeur);\n    return { ok: true };\n  }"
  },
  {
    nom: 'M21 · le régime HISTORIQUE cesse d\'écrire les champs événementiels',
    de: "  if (!source.moderne) {\n    ecrireChampsConfig(onglet, data, champs);",
    vers: "  if (!source.moderne) {\n    ecrireChampsConfig(onglet, data, CHAMPS_TERRAINS_DURABLES);"
  },
  {
    nom: 'M22 · l\'écran fabrique un « publié » à partir de Config quand il n\'y a pas de plan',
    de: "  if (!src.moderne) return reponse;",
    vers: "  reponse.etat = 'confirme';\n  if (!src.moderne) return reponse;"
  },
  {
    // 🚨 LE RAPPROCHEMENT PAR POSITION — le défaut exact que la revue demandait d'exclure.
    nom: 'M24 · l\'identité est rapprochée par la POSITION dans la liste',
    de: "    var id = valeurTexteTerrain(t.id);",
    vers: "    var id = valeurTexteTerrain(((connues || [])[i] || {}).id);"
  },
  {
    nom: 'M25 · l\'identité est rapprochée par le NOM du terrain',
    de: "    var id = valeurTexteTerrain(t.id);",
    vers: "    var id = '';\n" +
          "    (connues || []).forEach(function (k) {\n" +
          "      if (!id && valeurTexteTerrain(k.nom) === valeurTexteTerrain(t.nom)) id = valeurTexteTerrain(k.id);\n" +
          "    });"
  },
  {
    nom: 'M26 · la référence ÉPHÉMÈRE (l\'index) est persistée comme `terrain_id`',
    de: "      minis.push({ numero: numero, terrain_id: idTerrain, categorie: categorie });",
    vers: "      minis.push({ numero: numero, terrain_id: String(idx), categorie: categorie });"
  },
  {
    nom: 'M27 · l\'empreinte n\'est plus EXIGÉE à la confirmation',
    de: "  if (attendue === '') {",
    vers: "  if (false) {"
  },
  {
    nom: 'M28 · l\'empreinte est reçue mais jamais COMPARÉE',
    de: "  var reelle = empreinteBrouillonTerrains(brouillon);\n  if (attendue !== reelle) {",
    vers: "  var reelle = attendue;\n  if (attendue !== reelle) {"
  },
  {
    nom: 'M29 · l\'empreinte IGNORE les noms (comme `signatureTerrains`)',
    de: "    parts.push('gt=' + t.terrain_id + '|s=' + t.selectionne + '|nom=' + t.snap_nom +",
    vers: "    parts.push('gt=' + t.terrain_id + '|s=' + t.selectionne + '|nom=' + '' +"
  },
  {
    nom: 'M23 · le brouillon repart SIGNÉ (donc lisible comme un plan confirmé)',
    de: "  params.signature = '';                     // ⛔ un brouillon n'est jamais signé",
    vers: "  params.signature = 'SIGNATURE-FABRIQUEE';"
  }
];

MUTATIONS.forEach((m) => {
  if (SOURCE_CODE.indexOf(m.de) === -1) {
    verifier(false, m.nom + ' — ⛔ ancre INTROUVABLE dans backend/Code.gs : mets la mutation à jour');
    return;
  }
  const mutee = SOURCE_CODE.replace(m.de, m.vers);
  const attrapee = [];
  let bacMute = null;
  try { bacMute = fabriquerBacServeur(mutee); }
  catch (e) { attrapee.push('le chargement a levé : ' + e.message); }

  if (bacMute) {
    const serie = rejouerSerie(bacMute);
    serie.echecs.forEach((x) => attrapee.push(x));
    controlesVivants(bacMute).forEach((x) => attrapee.push(x));
  }
  verifier(attrapee.length > 0, m.nom + ' — détectée par ' + attrapee.length + ' contrôle(s)');
  if (attrapee.length) console.log('        ↳ ' + attrapee[0]);
});

/* ========================================================================== */
/*  SÉRIE MF — LES MUTATIONS DU NAVIGATEUR                                     */
/*                                                                            */
/*  ⚠️ Les 23 mutations ci-dessus n'éprouvent que le SERVEUR. Or c'est le       */
/*  NAVIGATEUR qui fabrique le message : une identité qu'il inventerait, ou    */
/*  une catégorie qu'il devinerait, ne se verrait dans AUCUNE d'elles.         */
/* ========================================================================== */

titre('MF — on abîme le code du navigateur, et les contrôles doivent le voir');

/**
 * Les contrôles VIVANTS du navigateur, rejoués sur une source d'écran mutée.
 * ⚠️ ASYNCHRONE, et ce n'est pas un choix de style : `onConfirmerPlanTerrains` attend une
 * boîte de dialogue avant d'envoyer quoi que ce soit. ⛔ Lire les envois de façon synchrone
 * revenait à conclure « le bouton n'appelle plus l'action » sur du code parfaitement sain —
 * c'est ce qu'a fait le premier jet, et le contrôle du contrôle l'a signalé.
 */
async function controlesFrontend(sourceEcran) {
  const echecs = [];
  let ecran;
  try { ecran = fabriquerBacEcran(sourceEcran); }
  catch (e) { return ['le chargement de l\'écran a levé : ' + e.message]; }

  const cl = classeur({ structure: true });
  const premier = F('enregistrerPlanTerrains')(cl.classeur, envoi());
  const idsPremier = premier.inventaire.map((t) => t.id);
  const vue = F('planTerrainsPourEcran')(cl.classeur);

  try {
    vm.runInContext('planTerrainsB23 = ' + JSON.stringify(vue) + '; planTerrainsB23Demande = true;', ecran);
    vm.runInContext('configCourante = { global: {}, categories: ' + JSON.stringify(CATEGORIES) + ' };', ecran);
    const affiche = vm.runInContext('planTerrainsActuel()', ecran);
    const formulaire = affiche.terrains.map((t) => Object.assign({ selectionne: 'oui' }, t));
    vm.runInContext('lireTerrainsDuFormulaire = function () { return ' +
      JSON.stringify(formulaire) + '; };', ecran);
    vm.runInContext('lireDimensionsDuFormulaire = function () { ' +
      'return { U8: { l: 30, w: 20 }, U10: { l: 40, w: 30 } }; };', ecran);
    vm.runInContext('lireCouloir = function () { return 5; };', ecran);
    vm.runInContext('lireTailleTM = function () { return { l: 4, w: 4 }; };', ecran);
    vm.runInContext('(function () {' +
      'var photo = lireTerrainsDuFormulaire();' +
      'repartitionCalculee = { terrainsSource: photo, fieldsPlan: [' +
      '  { field: photo[0], zones: [{ cat: "U8", tiles: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }] }] },' +
      '  { field: photo[1], zones: [{ cat: "U10", tiles: [{ id: "5" }, { id: "6" }] }] }' +
      '] };' +
      '})();', ecran);

    const traduit = vm.runInContext('planDecoupagePourServeur()', ecran);
    if (traduit.error) { echecs.push('la traduction a échoué : ' + traduit.error); return echecs; }

    // ① Le navigateur n'émet AUCUNE identité, et la catégorie reste explicite.
    if (!traduit.payload.minis.every((m) => typeof m.terrain_index === 'number')) {
      echecs.push('un mini-terrain ne désigne plus son grand terrain par sa POSITION');
    }
    if (traduit.payload.minis.some((m) => m.terrain_id !== undefined)) {
      echecs.push('le navigateur envoie une IDENTITÉ — il n\'a pas à en émettre');
    }
    if (!traduit.payload.minis.every((m) => m.categorie === 'U8' || m.categorie === 'U10')) {
      echecs.push('une CATÉGORIE de mini-terrain a été perdue ou remplacée');
    }
    if (traduit.payload.minis.filter((m) => m.categorie === 'U8').length !== 4) {
      echecs.push('les catégories ne correspondent plus aux zones de la carte');
    }
    if (traduit.inventaire.some((t) => t.selectionne !== undefined)) {
      echecs.push('`selectionne` pollue l\'inventaire DURABLE');
    }
    if (!traduit.inventaire.every((t) => idsPremier.indexOf(t.id) !== -1)) {
      echecs.push('l\'inventaire renvoyé ne porte plus les identités reçues du serveur');
    }

    // ② Le serveur accepte, et ⛔ ne fabrique AUCUNE identité neuve.
    const r = F('enregistrerPlanTerrains')(cl.classeur, {
      terrains_physiques: JSON.stringify(traduit.inventaire),
      plan_terrains: JSON.stringify(traduit.payload) });
    if (r.error) echecs.push('le serveur a refusé le message : ' + r.error);
    else if (r.identites_attribuees !== 0) {
      echecs.push('le serveur a dû fabriquer ' + r.identites_attribuees + ' identité(s) NEUVE(S)');
    }
    const conf = confirmer(cl.classeur);
    if (!conf.ok) echecs.push('le plan produit n\'est pas confirmable : ' + conf.error);
    else if (F('repartitionTerrainsEditionActive')(cl.classeur, F('lireConfig')(cl.classeur)) !==
             '{"Rugby 1":["1","2","3","4"],"Rugby 2":["5","6"]}') {
      echecs.push('la projection publiée est fausse');
    }
  } catch (e) { echecs.push('les contrôles du navigateur ont levé : ' + e.message); }

  // ② bis — LA VRAIE LECTURE DU FORMULAIRE : ⛔ elle n'invente aucune identité.
  //    ⭐ Révélé par MF5 : tant que `lireTerrainsDuFormulaire` restait stubbée, une mutation
  //    qui y fabriquait un `id` (`Date.now()`) ne pouvait PAS être vue.
  //
  //    ⚠️ UN BAC NEUF, ET C'EST LE POINT : au-dessus, `lireTerrainsDuFormulaire` a été REMPLACÉE
  //    par un stub pour piloter la répartition. La rappeler ici lirait donc le stub — le
  //    contrôle croirait tester le vrai code et ne testerait rien. ⭐ Le premier jet de ce banc
  //    est tombé exactement dans ce piège, et c'est ce contrôle-ci qui l'a signalé.
  try {
    const vierge = fabriquerBacEcran(sourceEcran);
    vierge.__poserLignes([{ id: '', nom: 'Terrain neuf', L: 100, W: 60 },
                          { id: 'T-DEJA-CONNU', nom: 'Rugby 1', L: 115, W: 70, selectionne: 'non' }]);
    const lus = vm.runInContext('(function () { return lireTerrainsDuFormulaire(); })()', vierge);
    if (lus.length !== 2) echecs.push('la lecture du formulaire ne rend pas les deux lignes');
    else {
      if (lus[0].id !== undefined) {
        echecs.push('le navigateur a FABRIQUÉ une identité (« ' + lus[0].id + ' ») pour un terrain neuf');
      }
      if (lus[1].id !== 'T-DEJA-CONNU') echecs.push('une identité connue n\'est plus relue telle quelle');
      if (lus[0].selectionne !== 'oui' || lus[1].selectionne !== 'non') {
        echecs.push('la case « utilisé » n\'est plus lue correctement');
      }
    }
  } catch (e) { echecs.push('②bis a levé : ' + e.message); }

  // ② ter — UN GRAND TERRAIN SCINDÉ : deux catégories dessus, ⛔ et son NOM ne dit rien.
  //    ⭐ Révélé par MF3 : avec « Rugby 1 » ⇒ U8 et « Rugby 2 » ⇒ U10, une catégorie DEVINÉE
  //    depuis le nom tombait juste par accident. Le cas du terrain PARTAGÉ — qui est le cas
  //    courant de l'application — rend la devinette impossible à réussir.
  try {
    vm.runInContext('(function () {' +
      'var photo = [{ id: "T-A", nom: "Rugby 1", L: 115, W: 70, selectionne: "oui" }];' +
      'lireTerrainsDuFormulaire = function () { return photo; };' +
      'repartitionCalculee = { terrainsSource: photo, fieldsPlan: [' +
      '  { field: photo[0], mode: "split", zones: [' +
      '      { cat: "U8",  tiles: [{ id: "1" }, { id: "2" }] },' +
      '      { cat: "U10", tiles: [{ id: "3" }, { id: "4" }] }] }] };' +
      '})();', ecran);
    const scinde = vm.runInContext('planDecoupagePourServeur()', ecran);
    if (scinde.error) echecs.push('un grand terrain SCINDÉ n\'est plus traduisible : ' + scinde.error);
    else {
      const parNumero = {};
      scinde.payload.minis.forEach((m) => { parNumero[m.numero] = m.categorie; });
      if (parNumero['1'] !== 'U8' || parNumero['2'] !== 'U8' ||
          parNumero['3'] !== 'U10' || parNumero['4'] !== 'U10') {
        echecs.push('sur un terrain PARTAGÉ, les catégories sont fausses (' +
          JSON.stringify(parNumero) + ') — une catégorie devinée ne peut pas tomber juste ici');
      }
    }
  } catch (e) { echecs.push('②ter a levé : ' + e.message); }

  // ③ Le garde-fou du décalage, et la sélection enregistrée.
  try {
    vm.runInContext('(function () {' +
      'var photo = [{ nom: "Rugby 1", L: 100, W: 60, selectionne: "oui" }];' +
      'repartitionCalculee = { terrainsSource: photo, fieldsPlan: [' +
      '  { field: photo[0], zones: [{ cat: "U8", tiles: [{ id: "1" }] }] }] };' +
      'lireTerrainsDuFormulaire = function () { ' +
      '  return [{ nom: "Rugby AUTRE", L: 100, W: 60, selectionne: "oui" }]; };' +
      '})();', ecran);
    if (!vm.runInContext('planDecoupagePourServeur()', ecran).error) {
      echecs.push('un formulaire DÉCALÉ depuis le calcul n\'est plus refusé');
    }
    vm.runInContext('planTerrainsB23 = { moderne: true, etat: "brouillon", inventaire: [], ' +
      'brouillon: null, publie: null, selection: { "T1": false } };', ecran);
    if (vm.runInContext('terrainRetenuEcran({ id: "T1" })', ecran) !== false) {
      echecs.push('une sélection ENREGISTRÉE (« écarté ») est ignorée par l\'écran');
    }
    vm.runInContext('planTerrainsB23.etat = "brouillon";', ecran);
    const bandeau = vm.runInContext('bandeauEtatTerrains()', ecran);
    if (bandeau.toLowerCase().indexOf('à confirmer') === -1) {
      echecs.push('un BROUILLON n\'est plus annoncé « à confirmer » : « ' + bandeau + ' »');
    }
    vm.runInContext('planTerrainsB23.moderne = false;', ecran);
    if (vm.runInContext('bandeauEtatTerrains()', ecran) !== '') {
      echecs.push('le bandeau s\'affiche en régime HISTORIQUE');
    }
  } catch (e) { echecs.push('③ a levé : ' + e.message); }

  // ④ LE VERROU DE L'ÉCRAN, et l'envoi du jeton — ⭐ les deux moitiés du §5.
  try {
    const cl2 = classeur({ structure: true });
    F('enregistrerPlanTerrains')(cl2.classeur, envoi());
    const vue2 = F('planTerrainsPourEcran')(cl2.classeur);
    const e2 = fabriquerBacEcran(sourceEcran);
    vm.runInContext('planTerrainsB23 = ' + JSON.stringify(vue2) + '; planTerrainsB23Demande = true;', e2);
    vm.runInContext('lireDimensionsDuFormulaire = function () { ' +
      'return { U8: { l: 30, w: 20 }, U10: { l: 40, w: 30 } }; };', e2);
    vm.runInContext('lireCouloir = function () { return 5; };', e2);
    vm.runInContext('lireTailleTM = function () { return { l: 4, w: 4 }; };', e2);
    const fidele = vue2.brouillon.terrains.map((l) => ({ id: l.terrain_id, nom: l.snap_nom,
      type: l.snap_type, nature: l.snap_nature, pos: l.snap_pos, L: Number(l.snap_longueur_m),
      W: Number(l.snap_largeur_m), enBut: Number(l.snap_enbut_m), selectionne: l.selectionne }));

    e2.__poserLignes(fidele);
    if (vm.runInContext('ecartFormulaireBrouillon()', e2) !== null) {
      echecs.push('un formulaire FIDÈLE au brouillon est signalé comme divergent');
    }
    const modifie = JSON.parse(JSON.stringify(fidele));
    modifie[0].W = 99;
    e2.__poserLignes(modifie);
    if (vm.runInContext('ecartFormulaireBrouillon()', e2) === null) {
      echecs.push('une modification NON ENREGISTRÉE ne bloque plus la confirmation');
    }
    e2.__poserLignes(fidele);
    vm.runInContext('repartitionCalculee = { fieldsPlan: [], terrainsSource: [] };', e2);
    if (vm.runInContext('ecartFormulaireBrouillon()', e2) === null) {
      echecs.push('une répartition NON APPLIQUÉE ne bloque plus la confirmation');
    }
    vm.runInContext('repartitionCalculee = null;', e2);

    // Le bouton doit renvoyer l'empreinte REÇUE, et le serveur doit l'accepter.
    vm.runInContext('rafraichirEtatTerrains = async function () {};', e2);
    vm.runInContext('onConfirmerPlanTerrains();', e2);
    await new Promise((r) => setImmediate(r));   // ⭐ le handler est `async` : on le laisse finir
    await new Promise((r) => setImmediate(r));
    const envoye = e2.__envois.filter((x) => x.action === 'confirmerPlanTerrains')[0];
    if (!envoye) echecs.push('le bouton « Confirmer » n\'appelle plus l\'action');
    else if (envoye.data.empreinte !== vue2.brouillon.empreinte) {
      echecs.push('le bouton n\'envoie plus l\'empreinte reçue du serveur');
    } else if (!F('confirmerPlanTerrains')(cl2.classeur, envoye.data).ok) {
      echecs.push('le jeton produit par le bouton est refusé par le serveur');
    }
  } catch (e) { echecs.push('④ a levé : ' + e.message); }

  return echecs;
}

const MUTATIONS_FRONTEND = [
  {
    nom: 'MF1 · le navigateur ÉMET une identité au lieu de désigner une position',
    de: "        minis.push({ numero: String(t.id), terrain_index: idx, categorie: String(z.cat) });",
    vers: "        minis.push({ numero: String(t.id), terrain_id: 'T-' + idx, terrain_index: idx, categorie: String(z.cat) });"
  },
  {
    nom: 'MF2 · la CATÉGORIE est remplacée par une valeur par défaut',
    de: "        minis.push({ numero: String(t.id), terrain_index: idx, categorie: String(z.cat) });",
    vers: "        minis.push({ numero: String(t.id), terrain_index: idx, categorie: 'U8' });"
  },
  {
    nom: 'MF3 · la CATÉGORIE est DEVINÉE depuis le nom du grand terrain',
    de: "        minis.push({ numero: String(t.id), terrain_index: idx, categorie: String(z.cat) });",
    vers: "        minis.push({ numero: String(t.id), terrain_index: idx, categorie: String(fp.field.nom).indexOf('1') !== -1 ? 'U8' : 'U10' });"
  },
  {
    nom: 'MF4 · `selectionne` part POLLUER l\'inventaire durable du club',
    de: "    const copie = Object.assign({}, t);\n    delete copie.selectionne;\n    return copie;",
    vers: "    return Object.assign({}, t);"
  },
  {
    nom: 'MF5 · le navigateur FABRIQUE une identité quand elle manque',
    de: "    const id = row.getAttribute('data-id') || '';",
    vers: "    const id = row.getAttribute('data-id') || ('T' + Date.now());"
  },
  {
    nom: 'MF6 · le garde-fou du DÉCALAGE est retiré',
    de: "  if (!memeListe) {",
    vers: "  if (false) {"
  },
  {
    nom: 'MF7 · l\'écran ignore la SÉLECTION enregistrée et propose « retenu » partout',
    de: "  if (id && Object.prototype.hasOwnProperty.call(sel, id)) return !!sel[id];",
    vers: "  if (false) return !!sel[id];"
  },
  {
    nom: 'MF8 · un BROUILLON est annoncé comme confirmé',
    de: "  const t = textes[e.etat] || textes.absent;",
    vers: "  const t = textes.confirme;"
  },
  {
    nom: 'MF9 · le bandeau s\'affiche AUSSI en régime historique',
    de: "  const e = etatPlanTerrains();\n  if (!e.moderne) return '';\n  const textes = {",
    vers: "  const e = etatPlanTerrains();\n  const textes = {"
  },
  {
    nom: 'MF11 · le verrou de l\'écran saute (on confirme ce qu\'on ne voit pas)',
    de: "function ecartFormulaireBrouillon() {\n  const e = etatPlanTerrains();",
    vers: "function ecartFormulaireBrouillon() {\n  if (true) return null;\n  const e = etatPlanTerrains();"
  },
  {
    nom: 'MF12 · le bouton n\'envoie plus l\'empreinte reçue',
    de: "    await ecrireAdmin('confirmerPlanTerrains',\n" +
        "      { empreinte: b.empreinte || '', plan_id: b.plan_id || '' });",
    vers: "    await ecrireAdmin('confirmerPlanTerrains', { plan_id: b.plan_id || '' });"
  },
  {
    nom: 'MF10 · l\'inventaire renvoyé au serveur PERD les identités reçues',
    de: "  if (etatB23.moderne && (etatB23.inventaire || []).length) terrains = etatB23.inventaire;",
    vers: "  if (etatB23.moderne && (etatB23.inventaire || []).length) { terrains = etatB23.inventaire.map(function (t) { var c = Object.assign({}, t); delete c.id; return c; }); }"
  }
];

(async function serieMutationsFrontend() {
  for (const m of MUTATIONS_FRONTEND) {
    if (SOURCE_ECRAN.indexOf(m.de) === -1) {
      verifier(false, m.nom + ' — ⛔ ancre INTROUVABLE dans admin-terrains.js : mets la mutation à jour');
      continue;
    }
    const attrapee = await controlesFrontend(SOURCE_ECRAN.replace(m.de, m.vers));
    verifier(attrapee.length > 0, m.nom + ' — détectée par ' + attrapee.length + ' contrôle(s)');
    if (attrapee.length) console.log('        ↳ ' + attrapee[0]);
  }

  // ⭐ LE CONTRÔLE DU CONTRÔLE : sur la source INTACTE, aucun de ces contrôles ne doit crier.
  const surLeVrai = await controlesFrontend(SOURCE_ECRAN);
  verifier(surLeVrai.length === 0,
    'MF-FIN ⭐ : sur le code RÉEL, les contrôles du navigateur ne signalent rien' +
      (surLeVrai.length ? ' — ' + surLeVrai.join(' ; ') : ''));
  bilanFinal();
})();

function bilanFinal() {

/* ========================================================================== */

console.log('\n==================================================');
console.log('B2-3.d écran — ' + etat.ok + '/' + etat.total + ' OK, ' + etat.fail + ' ÉCHEC(S)');
console.log('==================================================');
if (etat.fail) { etat.echecs.forEach((e) => console.log('  ÉCHEC ' + e)); process.exit(1); }

}   /* fin de `bilanFinal()` — la série MF est asynchrone (elle exerce un handler `async`) */

}   /* fin de `finirJ()` — la série J contient un contrôle asynchrone (le VRAI bouton) */

}   /* fin de `finir()` — voir la note de la série G */
