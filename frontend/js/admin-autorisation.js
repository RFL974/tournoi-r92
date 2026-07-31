/**
 * ============================================================================
 *  ADMIN — DEMANDE D'AUTORISATION DE TOURNOI (feuille de report FFR, session 7)
 * ============================================================================
 *  Deux parties dans la section #bloc-autorisation :
 *   1) les CHAMPS À SAISIR (zone A de Config), groupés comme le formulaire ;
 *   2) la FEUILLE DE REPORT, dans l'ordre du document officiel, avec l'état de
 *      chaque champ (calculé / saisi / manquant) et le compteur de manquants.
 *
 *  On ne réplique JAMAIS le PDF officiel et on n'invente aucune valeur. La feuille
 *  s'imprime seule (@media print). Les champs contiennent des données personnelles :
 *  lus/écrits via des actions doPost protégées par la clé admin, jamais en public.
 *
 *  Dépend de : api.js (apiPostProtege), commun.js (echapper), admin.js (configCourante,
 *  ecrireAdmin, lireConfigAdmin). Chargé après admin.js dans admin.html.
 * ============================================================================
 */

/* Groupes de champs À SAISIR (zone A). Les champs « calculés » n'apparaissent QUE sur la feuille. */
var AUTORISATION_SAISIE = [
  { titre: 'A.1 — Organisateur', champs: [
    { p: 'org_club_nom', l: 'Nom du club organisateur', t: 'text' },
    { p: 'org_code_club', l: 'Code club', t: 'text' },
    { p: 'org_representant_nom', l: 'Représentant (M./Mme)', t: 'text' },
    { p: 'org_representant_tel', l: 'Tél. représentant', t: 'tel' },
    { p: 'org_representant_mail', l: 'Mail représentant', t: 'email' },
    { p: 'org_president_nom', l: 'Président du club (M.)', t: 'text' },
    { p: 'org_president_tel', l: 'Tél. président', t: 'tel' },
    { p: 'org_president_mail', l: 'Mail président', t: 'email' },
    { p: 'org_label_edr', l: 'École de rugby labellisée', t: 'select', o: ['oui', 'non'] },
    // `dep` : ce champ est GRISÉ (désactivé) tant que la question Oui/Non `dep` vaut « non ».
    { p: 'org_label_date', l: 'Date du dernier label', t: 'text', ph: 'JJ/MM/AAAA', dep: 'org_label_edr' }
  ] },
  { titre: 'A.2 — Tournoi', champs: [
    { p: 'org_niveau_tournoi', l: 'Niveau du tournoi', t: 'select', o: ['International', 'National', 'Territorial', 'Départemental'] }
  ] },
  { titre: 'A.4 — Participants', champs: [
    { p: 'org_nb_participants', l: 'Nombre de participants (si les équipes sont saisies à la main)', t: 'number',
      ph: 'ex. 240 — laisser vide si les clubs ont déclaré leurs effectifs' },
    { p: 'org_equipes_etrangeres', l: 'Équipes étrangères', t: 'select', o: ['non', 'oui'] },
    { p: 'org_equipes_etrangeres_liste', l: 'Liste des équipes étrangères', t: 'textarea', dep: 'org_equipes_etrangeres' }
  ] },
  { titre: 'B.1 — Installations', champs: [
    { p: 'org_type_terrain', l: 'Type de terrain', t: 'select', o: ['Gazon', 'Synthétique', 'Sable', 'Neige', 'Argile'] },
    { p: 'org_nb_vestiaires', l: 'Nombre de vestiaires', t: 'number' }
  ] },
  { titre: 'B.3 — Arbitrage', champs: [
    { p: 'org_nb_arbitres', l: 'Nombre d\'arbitres', t: 'number' },
    { p: 'org_nb_educateurs', l: 'Nombre d\'éducateurs', t: 'number' },
    { p: 'org_nb_doublettes', l: 'Nombre de doublettes', t: 'number' }
  ] },
  { titre: 'B.4 — Sécurité', champs: [
    { p: 'org_medecin_oui', l: 'Médecin présent', t: 'select', o: ['non', 'oui'] },
    { p: 'org_medecin_nom', l: 'Médecin — nom', t: 'text', dep: 'org_medecin_oui' },
    { p: 'org_medecin_tel', l: 'Médecin — tél.', t: 'tel', dep: 'org_medecin_oui' },
    { p: 'org_secours_nom', l: 'Antenne de secours — nom', t: 'text' },
    { p: 'org_secours_tel', l: 'Antenne de secours — tél.', t: 'tel' },
    { p: 'org_ambulance', l: 'Ambulance', t: 'select', o: ['non', 'oui'] }
  ] },
  { titre: 'B.5 — Logistique', champs: [
    // `prefill` : si VIDE, ces champs reprennent le tarif d'engagement saisi dans « Modalités
    // d'inscription » (jamais d'écrasement d'une valeur déjà saisie) — voir prefillAutorisation.
    { p: 'org_droits_oui', l: 'Droits d\'inscription', t: 'select', o: ['non', 'oui'], prefill: true },
    { p: 'org_droits_montant', l: 'Montant / équipe', t: 'number', dep: 'org_droits_oui', prefill: true },
    { p: 'org_hebergement_oui', l: 'Hébergement', t: 'select', o: ['non', 'oui'] },
    { p: 'org_hebergement_structure', l: 'Hébergement — structure', t: 'text', dep: 'org_hebergement_oui' },
    { p: 'org_repas_oui', l: 'Repas', t: 'select', o: ['non', 'oui'] },
    { p: 'org_repas_fournisseur', l: 'Repas — fournisseur', t: 'text', dep: 'org_repas_oui' },
    { p: 'org_repas_prix', l: 'Repas — prix / pers.', t: 'number', dep: 'org_repas_oui' },
    { p: 'org_gouters_oui', l: 'Goûters', t: 'select', o: ['non', 'oui'] },
    { p: 'org_gouters_fournisseur', l: 'Goûters — fournisseur', t: 'text', dep: 'org_gouters_oui' },
    { p: 'org_gouters_prix', l: 'Goûters — prix / pers.', t: 'number', dep: 'org_gouters_oui' }
  ] }
];

/** Valeur courante d'un paramètre global (Config), ou ''. */
function valAutorisation(param) {
  const g = (typeof configCourante !== 'undefined' && configCourante && configCourante.global) || {};
  return g[param] != null ? String(g[param]) : '';
}

/** Valeur de PRÉ-REMPLISSAGE d'un champ (repris d'une info déjà saisie ailleurs), ou '' si aucune.
 *  Aujourd'hui : les « Droits d'inscription » (B.5) reprennent le TARIF D'ENGAGEMENT des modalités
 *  d'inscription. Le montant côté modalités est du texte libre → on n'en garde que le 1er nombre
 *  (le champ autorisation est numérique). N'écrase JAMAIS : n'est utilisé que si le champ est vide. */
function prefillAutorisation(param) {
  const g = (typeof configCourante !== 'undefined' && configCourante && configCourante.global) || {};
  if (param === 'org_droits_oui') {
    const t = String(g.tarif_engagement_oui == null ? '' : g.tarif_engagement_oui).trim().toLowerCase();
    return (t === 'oui' || t === 'non') ? t : '';
  }
  if (param === 'org_droits_montant') {
    const m = String(g.tarif_engagement_montant == null ? '' : g.tarif_engagement_montant).match(/\d+(?:[.,]\d+)?/);
    return m ? m[0].replace(',', '.') : '';
  }
  return '';
}

/** Valeur EFFECTIVE d'une question contrôleur (grisage) : la valeur stockée, ou à défaut son
 *  pré-remplissage. Ainsi un champ lié est grisé de façon cohérente même quand la question qui le
 *  pilote est encore vide mais pré-remplie à « non ». */
function valControleurEffectiveAutorisation(param) {
  const stored = valAutorisation(param);
  return stored !== '' ? stored : prefillAutorisation(param);
}

/** Catégories présentes (pour les récompenses par catégorie + le mémo arbitrage). */
function catsPresentesAutorisation() {
  const cats = (typeof configCourante !== 'undefined' && configCourante && configCourante.categories) || [];
  return cats.filter(function (c) { return String(c.presente).toLowerCase() === 'oui'; });
}

/** Un champ de saisie (input / select / textarea).
 *  Si `c.dep` est défini, le champ est GRISÉ (désactivé) quand la question Oui/Non `c.dep` vaut
 *  « non » : le champ ouvert lié n'a alors pas de sens. La valeur stockée est conservée (juste
 *  non modifiable) ; l'état est rebasculé en direct par onChangeAutorisation. */
function champSaisieAutorisation(c) {
  const stored = valAutorisation(c.p);
  // Pré-remplissage : SEULEMENT si le champ est vide (jamais d'écrasement d'une saisie).
  const prefill = (stored === '' && c.prefill) ? prefillAutorisation(c.p) : '';
  const estPrefill = (stored === '' && prefill !== '');
  const v = stored !== '' ? stored : prefill;
  // Grisage : sur la valeur EFFECTIVE de la question contrôleur (stockée ou pré-remplie).
  const grise = !!(c.dep && valControleurEffectiveAutorisation(c.dep) === 'non');
  const dis = grise ? ' disabled' : '';
  let controle;
  if (c.t === 'select') {
    controle = '<select class="r-input" name="' + c.p + '"' + dis + '><option value="">—</option>' +
      c.o.map(function (opt) {
        return '<option value="' + echapper(opt) + '"' + (v === opt ? ' selected' : '') + '>' + echapper(opt) + '</option>';
      }).join('') + '</select>';
  } else if (c.t === 'textarea') {
    controle = '<textarea class="r-input" name="' + c.p + '" rows="2"' + dis + '>' + echapper(v) + '</textarea>';
  } else {
    const ph = c.ph ? ' placeholder="' + echapper(c.ph) + '"' : '';
    controle = '<input class="r-input" type="' + c.t + '" name="' + c.p + '" value="' + echapper(v) + '"' + ph + dis + '>';
  }
  // data-dep porte la question CONTRÔLEUR : onChangeAutorisation retrouve les champs à (dé)griser.
  const attrDep = c.dep ? ' data-dep="' + echapper(c.dep) + '"' : '';
  const note = estPrefill
    ? '<span class="autorisation-prefill-note">↩ repris des modalités d\'inscription — vérifie puis enregistre</span>'
    : '';
  return '<label class="reglage' + (grise ? ' est-grise' : '') + (estPrefill ? ' est-prefill' : '') + '"' + attrDep + '>' +
    '<span class="r-libelle">' + echapper(c.l) + '</span>' + controle + note + '</label>';
}

/** Rend la partie SAISIE (formulaire) + le mémo arbitrage + le rappel « antenne de secours ». */
function rendreSaisieAutorisation() {
  let html = '<form id="form-autorisation" class="autorisation-saisie">';
  AUTORISATION_SAISIE.forEach(function (grp) {
    html += '<fieldset class="autorisation-groupe"><legend>' + echapper(grp.titre) + '</legend>';
    html += grp.champs.map(champSaisieAutorisation).join('');
    html += '</fieldset>';
  });

  // B.2 — Récompenses par catégorie présente.
  const cats = catsPresentesAutorisation();
  if (cats.length) {
    html += '<fieldset class="autorisation-groupe"><legend>B.2 — Récompenses par catégorie</legend>';
    html += cats.map(function (c) {
      const nom = String(c.categorie || '').trim();
      const v = valAutorisation('org_recompenses_' + nom);
      return '<label class="reglage"><span class="r-libelle">' + echapper(nom) + ' — récompenses</span>' +
        '<select class="r-input" name="org_recompenses_' + echapper(nom) + '"><option value="">—</option>' +
        ['non', 'oui'].map(function (o) { return '<option value="' + o + '"' + (v === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') +
        '</select></label>';
    }).join('');
    html += '</fieldset>';
  }
  html += '</form>';

  // Rappel « antenne de secours » du dossier club (jamais parsé automatiquement).
  const secours = valAutorisation('securite_secours_precisions');
  if (secours.trim()) {
    html += '<p class="autorisation-rappel">💡 Déjà saisi dans le dossier club (antenne de secours) : <em>' +
      echapper(secours) + '</em> — recopie le nom et le téléphone dans les champs B.4 ci-dessus.</p>';
  }

  // Mémo arbitrage (par catégorie, dossier club) : hors feuille de report, ne correspond à aucune case.
  const memo = cats.filter(function (c) { return String(c.arbitrage_organisation || '').trim(); });
  if (memo.length) {
    html += '<div class="autorisation-memo"><strong>Pour mémoire — arbitrage par catégorie (dossier club)</strong>' +
      '<ul>' + memo.map(function (c) {
        return '<li>' + echapper(String(c.categorie).trim()) + ' : ' + echapper(String(c.arbitrage_organisation).trim()) + '</li>';
      }).join('') + '</ul>' +
      '<span class="autorisation-memo-note">Ne correspond à aucune case du formulaire (B.3 demande des nombres globaux).</span></div>';
  }
  return html;
}

/** Rend la FEUILLE DE REPORT à partir du dossier assemblé par le backend. */
function rendreFeuilleAutorisation(dossier) {
  if (!dossier || !dossier.sections) {
    return '<div class="ffr-bloc ffr-neutre">Feuille indisponible pour le moment.</div>';
  }
  const compteur = dossier.nbManquants === 0
    ? '<div class="ffr-bloc ffr-vert">✅ Tous les champs connus sont renseignés. Vérifie puis recopie sur le formulaire officiel.</div>'
    : '<div class="ffr-bloc ffr-orange"><strong>Il manque ' + dossier.nbManquants +
      ' champ(s) avant de pouvoir déposer.</strong></div>';

  let html = '<div id="feuille-report" class="autorisation-feuille-report">' +
    '<h3>Feuille de report — Demande d\'autorisation de tournoi École de Rugby</h3>' + compteur;

  dossier.sections.forEach(function (s) {
    html += '<div class="autorisation-section"><h4>' + echapper(s.titre) + '</h4>';
    if (s.note) html += '<p class="autorisation-section-note">' + echapper(s.note) + '</p>';
    html += '<table class="autorisation-table"><tbody>';
    s.champs.forEach(function (c) {
      // 'avert' = signalement INFORMATIF (incohérence, format hors périmètre) : orange, message affiché,
      // JAMAIS compté dans les manquants (session 8). 'manquant' = trou réel. 'saisi'/'calcule' = renseignés.
      const etatCls = (c.etat === 'manquant' || c.etat === 'avert') ? 'ffr-orange'
        : (c.etat === 'saisi' ? 'autorisation-saisi' : 'autorisation-calcule');
      const valeur = c.etat === 'manquant' ? '<em>manquant</em>' : echapper(String(c.valeur));
      html += '<tr class="' + etatCls + '"><th>' + echapper(c.libelle) + '</th><td>' + valeur +
        '</td><td class="autorisation-etat">' + echapper(c.etat) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  });

  html += '<p class="autorisation-pied">Circuit de dépôt (à la charge du Racing) : ' +
    '<strong>Club demandeur → Comité Départemental → Ligue Régionale</strong>. ' +
    'Adresse et modalités de dépôt : à confirmer (audit Q2). Avis et signatures : hors de cette feuille.</p>';
  return html + '</div>';
}

/** (Re)charge et affiche la section « Demande d'autorisation ». Migration douce : silencieux si indisponible. */
async function majAutorisation() {
  const zoneSaisie = document.getElementById('autorisation-saisie');
  const zoneFeuille = document.getElementById('autorisation-feuille');
  if (!zoneSaisie || !zoneFeuille) return;
  zoneSaisie.innerHTML = rendreSaisieAutorisation();
  try {
    const rep = await apiPostProtege('getDossierAutorisation', {}, 'admin', 'admin');
    zoneFeuille.innerHTML = rendreFeuilleAutorisation(rep && rep.dossier);
  } catch (e) {
    zoneFeuille.innerHTML = '<div class="ffr-bloc ffr-neutre">Feuille de report indisponible ' +
      '(connecte-toi avec la clé admin).</div>';
  }
}

/** Enregistre les champs saisis (org_*), puis recharge la config et la feuille. */
async function onEnregistrerAutorisation() {
  const form = document.getElementById('form-autorisation');
  const message = document.getElementById('autorisation-message');
  if (!form) return;
  const data = {};
  Array.prototype.forEach.call(form.elements, function (el) {
    if (el.name && el.name.indexOf('org_') === 0) data[el.name] = String(el.value == null ? '' : el.value).trim();
  });
  const bouton = document.getElementById('bouton-enregistrer-autorisation');
  await avecBoutonOccupe(bouton, message, async function () {
    await ecrireAdmin('enregistrerDossierAutorisation', data);
    // La config a changé : on la recharge (source de vérité pour la saisie), puis on ré-assemble.
    if (typeof lireConfigAdmin === 'function') configCourante = await lireConfigAdmin();
    await majAutorisation();
    afficherMessage(message, '✅ Champs enregistrés.', 'ok');
  });
}

/* ==========================================================================
   PDF PRÉ-REMPLI — le formulaire officiel FFR (AcroForm) rempli avec nos données.
   Le remplissage est 100 % CÔTÉ NAVIGATEUR (pdf-lib), aucun backend. Les valeurs
   sont posées dans le PDF qui RESTE un formulaire à remplir : l'organisateur ouvre
   le PDF téléchargé et complète le reste (format sportif par catégorie, signatures).
   La correspondance champ PDF ↔ donnée a été vérifiée par la position de chaque
   champ face à son libellé dans le PDF officiel (millésime 2026-2027).
   ========================================================================== */

/* Tableau « Catégories et formes de jeu » (page 2) : par numéro de catégorie FFR, la liste des
   formes possibles avec leur case. `f` = code forme (T+2 / JCO / RE / SEVENS), `e` = effectif.
   Mapping VÉRIFIÉ par le libellé à droite de chaque case dans le PDF officiel. */
var PDF_FORMES_TABLE = {
  '6':  [{ plateau: true, c: 'Case à cocher69' }],
  '8':  [{ f: 'T+2', e: '5X5', c: 'Case à cocher70' }, { f: 'JCO', e: '5X5', c: 'Case à cocher71' }],
  '10': [{ f: 'T+2', e: '5X5', c: 'Case à cocher72' }, { f: 'JCO', e: '5X5', c: 'Case à cocher73' }, { f: 'RE', e: '7X7', c: 'Case à cocher74' }],
  '12': [{ f: 'T+2', e: '5X5', c: 'Case à cocher75' }, { f: 'JCO', e: '5X5', c: 'Case à cocher76' }, { f: 'RE', e: '10X10', c: 'Case à cocher77' }],
  '14': [{ f: 'T+2', e: '7X7', c: 'Case à cocher78' }, { f: 'JCO', e: '7X7', c: 'Case à cocher79' }, { f: 'RE', e: '10X10', c: 'Case à cocher80' }, { f: 'RE', e: '15X15', c: 'Case à cocher81' }, { f: 'SEVENS', e: '7X7', c: 'Case à cocher82' }],
  '15F':[{ f: 'T+2', e: '7X7', c: 'Case à cocher83' }, { f: 'JCO', e: '7X7', c: 'Case à cocher84' }, { f: 'RE', e: '10X10', c: 'Case à cocher85' }, { f: 'RE', e: '15X15', c: 'Case à cocher86' }, { f: 'SEVENS', e: '7X7', c: 'Case à cocher87' }]
};

/** Numéro de catégorie FFR à partir du nom d'app : U10→'10', U15F→'15F', M8→'8'. */
function numCategorieAut(nom) {
  return String(nom == null ? '' : nom).trim().toUpperCase().replace(/^[MU](?=\d)/, '');
}

/** Coche, dans le tableau des formes (page 2), la forme de jeu retenue de chaque catégorie présente
 *  (Config.forme_jeu, ex. « JCO — 5x5 »). Ajoute les cases à `cases`. Rien si forme non renseignée. */
function cocherFormesCategories(categories, cases) {
  (categories || []).forEach(function (cat) {
    if (String(cat.presente).toLowerCase() !== 'oui') return;
    var num = numCategorieAut(cat.categorie);
    var table = PDF_FORMES_TABLE[num];
    if (!table) return;
    var fj = String(cat.forme_jeu == null ? '' : cat.forme_jeu).trim();
    // M6 : une seule case (plateau) — cochée dès que la catégorie est présente.
    if (num === '6') { cases.push(table[0].c); return; }
    if (!fj) return; // pas de forme retenue ⇒ on ne devine pas
    var parts = fj.split(/[—–-]/);
    var forme = String(parts[0] || '').trim().toUpperCase().replace(/\s+/g, '');   // « J CO » → « JCO »
    var eff = String(parts[1] || '').trim().toUpperCase().replace(/\s+/g, '');       // « 5x5 » → « 5X5 »
    for (var i = 0; i < table.length; i++) {
      var opt = table[i];
      if (opt.plateau) continue;
      if (String(opt.f).toUpperCase().replace(/\s+/g, '') === forme && String(opt.e).toUpperCase() === eff) {
        cases.push(opt.c); return;
      }
    }
  });
}

/* Récompenses par catégorie : numéro FFR → [caseOui, caseNon]. */
var PDF_RECOMPENSES_AUT = {
  '6':  ['Case à cocher95', 'Case à cocher96'],
  '8':  ['Case à cocher97', 'Case à cocher98'],
  '10': ['Case à cocher64', 'Case à cocher99'],
  '12': ['Case à cocher100', 'Case à cocher119'],
  '14': ['Case à cocher101', 'Case à cocher102']
};

/** 'AAAA-MM-JJ' → 'JJ/MM/AAAA' (sans dépendre du fuseau) ; renvoie tel quel sinon. */
function dateFrPdfAut(iso) {
  var m = String(iso == null ? '' : iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? (m[3] + '/' + m[2] + '/' + m[1]) : String(iso == null ? '' : iso);
}

/**
 * Construit le PLAN de remplissage (résolu) : { textes:{champPDF:valeur}, cases:[champPDF] }.
 * PUR : ne lit ni DOM ni classeur. `g` = paramètres globaux (Config) ; nbClubs/nbEquipes = comptes.
 * Applique les MÊMES défauts que la feuille de report backend (club affilié, label, étrangères).
 */
function planRemplissageAutorisation(g, nbClubs, nbEquipes, categories) {
  g = g || {};
  function v(k) { return String(g[k] == null ? '' : g[k]).trim(); }
  var textes = {}, cases = [];
  function setT(champ, val) { val = String(val == null ? '' : val).trim(); if (val !== '') textes[champ] = val; }
  function ouinon(val, champOui, champNon) {
    var s = String(val == null ? '' : val).trim().toLowerCase();
    if (s === 'oui') cases.push(champOui); else if (s === 'non') cases.push(champNon);
  }
  function choix(val, map) { if (map[val]) cases.push(map[val]); }

  // A.1 Organisateur (défauts alignés sur la feuille de report backend).
  setT('Texte1', v('org_club_nom') || 'Racing Club de France Rugby');
  setT('Texte2', v('org_code_club'));
  setT('Texte3', v('org_representant_nom'));
  setT('Texte5', v('org_representant_tel'));
  setT('Texte6', v('org_representant_mail'));
  setT('Texte10', v('org_president_nom'));
  setT('Texte9', v('org_president_tel'));
  setT('Texte7', v('org_president_mail'));
  ouinon(v('org_label_edr') || 'oui', 'Case à cocher62', 'Case à cocher63');
  setT('Texte8', v('org_label_date'));

  // A.2 Tournoi.
  setT('Texte11', v('tournoi_nom'));
  setT('Texte12', v('tournoi_adresse') || v('tournoi_lieu'));
  setT('Date64_es_:signer:date', dateFrPdfAut(v('tournoi_date')));
  setT('Texte13', v('heure_debut'));
  setT('Texte14', v('heure_fin_communiquee') || v('heure_fin'));
  choix(v('org_niveau_tournoi'), { 'International': 'Case à cocher65', 'National': 'Case à cocher66',
    'Territorial': 'Case à cocher67', 'Départemental': 'Case à cocher68' });

  // A.4 Participants.
  if (nbClubs) setT('Texte15', String(nbClubs));
  if (nbEquipes) setT('Texte16', String(nbEquipes));
  setT('Texte17', v('org_nb_participants'));
  setT('Texte18', v('org_equipes_etrangeres_liste'));

  // B.1 Installations.
  choix(v('org_type_terrain'), { 'Gazon': 'Case à cocher91', 'Synthétique': 'Case à cocher92',
    'Neige': 'Case à cocher93', 'Argile': 'Case à cocher94', 'Sable': 'Case à cocher1' });
  setT('Texte20', v('org_nb_vestiaires'));

  // B.3 Arbitrage.
  setT('Texte46', v('org_nb_arbitres'));
  setT('Texte47', v('org_nb_educateurs'));
  setT('Texte48', v('org_nb_doublettes'));

  // B.4 Sécurité — responsable = référent sécurité (si distinct), sinon référent tournoi (dossier club).
  var secDistinct = v('securite_referent_identique').toLowerCase() === 'non';
  setT('Texte50', secDistinct ? v('securite_referent_nom') : v('referent_nom'));
  setT('Texte51', secDistinct ? v('securite_referent_tel') : v('referent_tel'));
  ouinon(v('org_medecin_oui'), 'Case à cocher123', 'Case à cocher124');
  setT('Texte52', v('org_medecin_nom'));
  setT('Texte53', v('org_medecin_tel'));
  if (v('org_secours_nom') || v('org_secours_tel')) cases.push('Case à cocher125'); // antenne secours = oui
  setT('Texte54', v('org_secours_nom'));
  setT('Texte55', v('org_secours_tel'));
  ouinon(v('org_ambulance'), 'Case à cocher103', 'Case à cocher104');

  // B.5 Logistique.
  ouinon(v('org_droits_oui'), 'Case à cocher105', 'Case à cocher106');
  setT('Texte56', v('org_droits_montant'));
  ouinon(v('org_hebergement_oui'), 'Case à cocher107', 'Case à cocher108');
  setT('Texte57', v('org_hebergement_structure'));
  ouinon(v('org_repas_oui'), 'Case à cocher109', 'Case à cocher110');
  setT('Texte58', v('org_repas_fournisseur'));
  setT('Texte59', v('org_repas_prix'));
  ouinon(v('org_gouters_oui'), 'Case à cocher111', 'Case à cocher112');
  setT('Texte60', v('org_gouters_fournisseur'));
  setT('Texte61', v('org_gouters_prix'));

  // B.2 Récompenses par catégorie (org_recompenses_<cat> ; U10→'10', M8→'8', U15F→'15' ignoré).
  Object.keys(g).forEach(function (k) {
    var mm = k.match(/^org_recompenses_(.+)$/);
    if (!mm) return;
    var num = String(mm[1]).toUpperCase().replace(/^[MU]/, '').replace(/\D.*$/, '');
    var pair = PDF_RECOMPENSES_AUT[num];
    if (!pair) return;
    ouinon(g[k], pair[0], pair[1]);
  });

  // Page 2 — tableau « Catégories et formes de jeu » : coche la forme retenue de chaque catégorie.
  cocherFormesCategories(categories, cases);

  // Page signatures — club demandeur.
  setT('Club demandeurRow1', v('org_club_nom') || 'Racing Club de France Rugby');
  return { textes: textes, cases: cases };
}

/** Applique un plan de remplissage à un PDF (bytes) via pdf-lib ; renvoie les octets du PDF rempli. */
async function appliquerPlanPdfAutorisation(PDFLib, bytes, plan) {
  const doc = await PDFLib.PDFDocument.load(bytes);
  const form = doc.getForm();
  Object.keys(plan.textes).forEach(function (champ) {
    try {
      const tf = form.getTextField(champ);
      tf.setText(plan.textes[champ]);
      // Taille de police FIXE : sans ça, les champs sont en « auto » (0) et pdf-lib agrandit le
      // texte à la hauteur de la case (15–22 pt) → il déborde sur les libellés voisins (chevauchements).
      tf.setFontSize(9);
    } catch (e) { /* champ absent : ignoré */ }
  });
  plan.cases.forEach(function (champ) {
    try { form.getCheckBox(champ).check(); } catch (e) { /* champ absent : ignoré */ }
  });
  try { form.updateFieldAppearances(); } catch (e) { /* apparences régénérées par le lecteur au besoin */ }
  return doc.save();
}

/** Télécharge des octets comme fichier. */
function telechargerFichierAutorisation(bytes, nom, type) {
  const blob = new Blob([bytes], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nom;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
}

/** Génère et télécharge le PDF officiel FFR pré-rempli avec les données du tournoi. */
async function onTelechargerPdfAutorisation() {
  const message = document.getElementById('autorisation-message');
  const bouton = document.getElementById('bouton-pdf-autorisation');
  if (typeof PDFLib === 'undefined') {
    if (message) afficherMessage(message, '⚠️ Bibliothèque PDF non chargée — recharge la page.', 'ko');
    return;
  }
  await avecBoutonOccupe(bouton, message, async function () {
    afficherMessage(message, 'Génération du PDF pré-rempli…', 'ok');
    const resp = await fetch('modeles/demande-autorisation-ffr.pdf');
    if (!resp.ok) throw new Error('Modèle PDF introuvable (modeles/demande-autorisation-ffr.pdf).');
    const bytes = await resp.arrayBuffer();
    const g = (typeof configCourante !== 'undefined' && configCourante && configCourante.global) || {};
    // Comptes : nb d'équipes = équipes chargées ; nb de clubs = clubs invités (si dispo).
    const eqs = (typeof equipesCourantes !== 'undefined' && equipesCourantes) ? equipesCourantes : [];
    const nbEquipes = eqs.length;
    const nbClubs = (typeof clubsInvitesCourants !== 'undefined' && clubsInvitesCourants)
      ? clubsInvitesCourants.length : 0;
    const cats = (typeof configCourante !== 'undefined' && configCourante && configCourante.categories) || [];
    const plan = planRemplissageAutorisation(g, nbClubs, nbEquipes, cats);
    const out = await appliquerPlanPdfAutorisation(PDFLib, bytes, plan);
    telechargerFichierAutorisation(out, 'demande-autorisation-' + (g.tournoi_date || 'tournoi') + '.pdf', 'application/pdf');
    afficherMessage(message, '✅ PDF pré-rempli téléchargé. Ouvre-le et complète le format sportif ' +
      'par catégorie + les signatures.', 'ok');
  });
}

/** (Dé)grise les champs liés à une question Oui/Non `param` selon sa valeur (« non » ⇒ grisé). */
function majGrisageAutorisation(param, valeur) {
  const grise = String(valeur) === 'non';
  const sel = (window.CSS && CSS.escape) ? CSS.escape(param) : param;
  document.querySelectorAll('#form-autorisation label[data-dep="' + sel + '"]').forEach(function (lab) {
    lab.classList.toggle('est-grise', grise);
    const ctrl = lab.querySelector('.r-input');
    if (ctrl) ctrl.disabled = grise;
  });
}

/** Changement d'une question Oui/Non contrôleur ⇒ (dé)grise ses champs liés en direct. */
function onChangeAutorisation(e) {
  const el = e.target;
  if (!el || !el.name || el.name.indexOf('org_') !== 0) return;
  // On n'agit que si ce champ pilote au moins un champ lié (data-dep).
  const sel = (window.CSS && CSS.escape) ? CSS.escape(el.name) : el.name;
  if (document.querySelector('#form-autorisation label[data-dep="' + sel + '"]')) {
    majGrisageAutorisation(el.name, el.value);
  }
}

/* Câblage : boutons Enregistrer / Imprimer + grisage conditionnel. Posé une fois, en délégation. */
document.addEventListener('DOMContentLoaded', function () {
  const section = document.getElementById('bloc-autorisation');
  if (!section) return;
  section.addEventListener('click', function (e) {
    if (e.target.closest('#bouton-enregistrer-autorisation')) { e.preventDefault(); onEnregistrerAutorisation(); }
    else if (e.target.closest('#bouton-pdf-autorisation')) { e.preventDefault(); onTelechargerPdfAutorisation(); }
    else if (e.target.closest('#bouton-imprimer-autorisation')) { e.preventDefault(); window.print(); }
  });
  section.addEventListener('change', onChangeAutorisation);
});
