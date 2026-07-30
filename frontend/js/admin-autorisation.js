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
    { p: 'org_label_date', l: 'Date du dernier label', t: 'text', ph: 'JJ/MM/AAAA' }
  ] },
  { titre: 'A.2 — Tournoi', champs: [
    { p: 'org_niveau_tournoi', l: 'Niveau du tournoi', t: 'select', o: ['International', 'National', 'Territorial', 'Départemental'] }
  ] },
  { titre: 'A.4 — Participants', champs: [
    { p: 'org_equipes_etrangeres', l: 'Équipes étrangères', t: 'select', o: ['non', 'oui'] },
    { p: 'org_equipes_etrangeres_liste', l: 'Liste des équipes étrangères', t: 'textarea' }
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
    { p: 'org_medecin_nom', l: 'Médecin — nom', t: 'text' },
    { p: 'org_medecin_tel', l: 'Médecin — tél.', t: 'tel' },
    { p: 'org_secours_nom', l: 'Antenne de secours — nom', t: 'text' },
    { p: 'org_secours_tel', l: 'Antenne de secours — tél.', t: 'tel' },
    { p: 'org_ambulance', l: 'Ambulance', t: 'select', o: ['non', 'oui'] }
  ] },
  { titre: 'B.5 — Logistique', champs: [
    { p: 'org_droits_oui', l: 'Droits d\'inscription', t: 'select', o: ['non', 'oui'] },
    { p: 'org_droits_montant', l: 'Montant / équipe', t: 'number' },
    { p: 'org_hebergement_oui', l: 'Hébergement', t: 'select', o: ['non', 'oui'] },
    { p: 'org_hebergement_structure', l: 'Hébergement — structure', t: 'text' },
    { p: 'org_repas_oui', l: 'Repas', t: 'select', o: ['non', 'oui'] },
    { p: 'org_repas_fournisseur', l: 'Repas — fournisseur', t: 'text' },
    { p: 'org_repas_prix', l: 'Repas — prix / pers.', t: 'number' },
    { p: 'org_gouters_oui', l: 'Goûters', t: 'select', o: ['non', 'oui'] },
    { p: 'org_gouters_fournisseur', l: 'Goûters — fournisseur', t: 'text' },
    { p: 'org_gouters_prix', l: 'Goûters — prix / pers.', t: 'number' }
  ] }
];

/** Valeur courante d'un paramètre global (Config), ou ''. */
function valAutorisation(param) {
  const g = (typeof configCourante !== 'undefined' && configCourante && configCourante.global) || {};
  return g[param] != null ? String(g[param]) : '';
}

/** Catégories présentes (pour les récompenses par catégorie + le mémo arbitrage). */
function catsPresentesAutorisation() {
  const cats = (typeof configCourante !== 'undefined' && configCourante && configCourante.categories) || [];
  return cats.filter(function (c) { return String(c.presente).toLowerCase() === 'oui'; });
}

/** Un champ de saisie (input / select / textarea). */
function champSaisieAutorisation(c) {
  const v = valAutorisation(c.p);
  let controle;
  if (c.t === 'select') {
    controle = '<select class="r-input" name="' + c.p + '"><option value="">—</option>' +
      c.o.map(function (opt) {
        return '<option value="' + echapper(opt) + '"' + (v === opt ? ' selected' : '') + '>' + echapper(opt) + '</option>';
      }).join('') + '</select>';
  } else if (c.t === 'textarea') {
    controle = '<textarea class="r-input" name="' + c.p + '" rows="2">' + echapper(v) + '</textarea>';
  } else {
    const ph = c.ph ? ' placeholder="' + echapper(c.ph) + '"' : '';
    controle = '<input class="r-input" type="' + c.t + '" name="' + c.p + '" value="' + echapper(v) + '"' + ph + '>';
  }
  return '<label class="reglage"><span class="r-libelle">' + echapper(c.l) + '</span>' + controle + '</label>';
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

/* Câblage : boutons Enregistrer / Imprimer. Posé une fois, en délégation sur la section. */
document.addEventListener('DOMContentLoaded', function () {
  const section = document.getElementById('bloc-autorisation');
  if (!section) return;
  section.addEventListener('click', function (e) {
    if (e.target.closest('#bouton-enregistrer-autorisation')) { e.preventDefault(); onEnregistrerAutorisation(); }
    else if (e.target.closest('#bouton-imprimer-autorisation')) { e.preventDefault(); window.print(); }
  });
});
