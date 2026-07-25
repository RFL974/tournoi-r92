/**
 * ============================================================================
 *  ADMIN — CONFORMITÉ FFR (référentiel RefFFR)
 * ============================================================================
 *  Deux restitutions, toutes deux INFORMATIVES (n'empêchent jamais de sauvegarder) :
 *   1) un bloc « Conformité FFR » sous la date du tournoi : résultat de
 *      verifierConformiteFFR (backend) — vert / orange / rouge ;
 *   2) la « Forme FFR attendue » (forme de jeu + effectif) dans chaque carte de
 *      réglage de catégorie, pour le mois du tournoi, avec un avertissement inline
 *      si l'effectif saisi est incohérent avec l'effectif FFR.
 *
 *  MIGRATION DOUCE : si le référentiel FFR est absent, un bandeau gris neutre est
 *  affiché et aucun contrôle n'est appliqué (l'app fonctionne comme avant).
 *
 *  Dépend de globaux définis ailleurs, accédés à l'appel :
 *   - commun.js : echapper
 *   - api.js    : apiGet
 *   - admin.js  : configCourante
 *  Chargé après admin.js et admin-reglages.js dans admin.html.
 * ============================================================================
 */

/* Référentiel FFR mémorisé (une seule requête par session, réutilisée par les cartes). */
var refFFRCache = null;

/** Charge (et mémorise) le référentiel FFR. Migration douce : listes vides si indisponible. */
async function chargerRefFFR() {
  if (refFFRCache) return refFFRCache;
  try { refFFRCache = await apiGet('getRefFFR'); }
  catch (e) { refFFRCache = { formes: [], dates: [], millesime: null }; }
  return refFFRCache;
}

/* --------------------------------------------------------------------------
   VALEURS COURANTES (formulaire d'abord, sinon état enregistré)
   -------------------------------------------------------------------------- */

/** Date du tournoi actuellement saisie (ISO 'AAAA-MM-JJ'), sinon celle enregistrée, sinon ''. */
function dateTournoiCourante() {
  const form = document.getElementById('form-infos-tournoi');
  const v = (form && form.tournoi_date) ? form.tournoi_date.value : '';
  if (v) return v;
  const g = (typeof configCourante !== 'undefined' && configCourante && configCourante.global) || {};
  return g.tournoi_date || '';
}

/** Zone de vacances courante (select du formulaire, sinon Config, défaut 'C'). */
function zoneVacancesCourante() {
  const form = document.getElementById('form-infos-tournoi');
  const v = (form && form.zone_vacances) ? form.zone_vacances.value : '';
  if (v) return v;
  const g = (typeof configCourante !== 'undefined' && configCourante && configCourante.global) || {};
  return g.zone_vacances || 'C';
}

/** Noms des catégories présentes (presente = 'oui'). */
function categoriesPresentesNoms() {
  const cats = (typeof configCourante !== 'undefined' && configCourante && configCourante.categories) || [];
  return cats.filter(function (c) { return String(c.presente).toLowerCase() === 'oui'; })
             .map(function (c) { return String(c.categorie || '').trim(); })
             .filter(Boolean);
}

/* --------------------------------------------------------------------------
   BLOC « CONFORMITÉ FFR » (sous la date du tournoi)
   -------------------------------------------------------------------------- */

/** (Re)calcule et affiche le bloc « Conformité FFR », puis rafraîchit les formes des cartes. */
async function majConformiteFFR() {
  const zone = document.getElementById('bloc-conformite-ffr');
  if (!zone) return;

  await chargerRefFFR(); // dispo du référentiel + formes pour les cartes

  const refVide = !refFFRCache ||
    ((refFFRCache.formes || []).length === 0 && (refFFRCache.dates || []).length === 0);
  if (refVide) {
    zone.innerHTML = '<div class="ffr-bloc ffr-neutre">Référentiel FFR non chargé — ' +
      'aucun contrôle de conformité n\'est appliqué.</div>';
    majFormesCategories();
    return;
  }

  const dateISO = dateTournoiCourante();
  if (!dateISO) {
    zone.innerHTML = '<div class="ffr-bloc ffr-neutre">Renseigne la date du tournoi pour ' +
      'vérifier la conformité avec le calendrier FFR.</div>';
    majFormesCategories();
    return;
  }

  zone.innerHTML = '<div class="ffr-bloc ffr-neutre">Vérification de la conformité FFR…</div>';
  let res;
  try {
    res = await apiGet('getConformiteFFR', {
      date: dateISO,
      categories: categoriesPresentesNoms().join(','),
      zone: zoneVacancesCourante()
    });
  } catch (e) {
    zone.innerHTML = '<div class="ffr-bloc ffr-neutre">Contrôle FFR indisponible pour le moment.</div>';
    return;
  }
  zone.innerHTML = rendreConformiteFFR(res);
  majFormesCategories();
}

/** Construit le HTML du bloc à partir du résultat de verifierConformiteFFR. */
function rendreConformiteFFR(res) {
  if (!res || res.refDisponible === false) {
    return '<div class="ffr-bloc ffr-neutre">Référentiel FFR non chargé — ' +
      'aucun contrôle de conformité n\'est appliqué.</div>';
  }
  const mill = (refFFRCache && refFFRCache.millesime) ? refFFRCache.millesime : '2026-2027';
  let html = '';
  if (res.bloquants && res.bloquants.length) {
    html += '<div class="ffr-bloc ffr-rouge"><strong>⛔ ' + res.bloquants.length +
      ' conflit(s) avec le calendrier FFR ' + echapper(mill) + '</strong><ul>' +
      res.bloquants.map(ligneConflitFFR).join('') + '</ul></div>';
  }
  if (res.avertissements && res.avertissements.length) {
    html += '<div class="ffr-bloc ffr-orange"><strong>⚠️ ' + res.avertissements.length +
      ' point(s) de vigilance</strong><ul>' +
      res.avertissements.map(ligneConflitFFR).join('') + '</ul></div>';
  }
  if (!html) {
    html = '<div class="ffr-bloc ffr-vert">✅ Aucun conflit détecté avec le calendrier FFR ' +
      echapper(mill) + '.</div>';
  }
  html += '<p class="ffr-note">Contrôle informatif : l\'organisateur reste décideur — ' +
    'la date peut être enregistrée malgré une alerte.</p>';
  return html;
}

/** Une ligne de conflit (date + libellé + motif). */
function ligneConflitFFR(item) {
  const d = item.date ? echapper(dateCourteFrFFR(item.date)) + ' — ' : '';
  const lib = item.libelle ? '<strong>' + echapper(item.libelle) + '</strong>' : '';
  const motif = item.motif ? ' <span class="ffr-motif">' + echapper(item.motif) + '</span>' : '';
  return '<li>' + d + lib + motif + '</li>';
}

/** 'AAAA-MM-JJ' → 'JJ/MM/AAAA' (sans dépendre du fuseau). */
function dateCourteFrFFR(iso) {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? (m[3] + '/' + m[2] + '/' + m[1]) : String(iso);
}

/* --------------------------------------------------------------------------
   « FORME FFR ATTENDUE » dans les cartes de réglage par catégorie
   -------------------------------------------------------------------------- */

/**
 * Clé de catégorie canonique (miroir du backend normaliserCategorie) : apparie M↔U.
 *   M8/U8 → '8' · M10/U10 → '10' · M15F/U15F → '15F'. Le référentiel FFR reste en M…,
 *   l'app en U… : on n'apparie jamais par égalité exacte.
 */
function normaliserCategorieFFR(valeur) {
  const s = String(valeur == null ? '' : valeur).trim().toUpperCase();
  if (s === '') return '';
  return s.replace(/^[MU](?=\d)/, '');
}

/** Ligne de forme FFR pour une catégorie au mois de la date du tournoi, ou null. */
function formeAttendueFFR(categorie, dateISO) {
  if (!refFFRCache || !dateISO) return null;
  const mois = String(dateISO).slice(0, 7);
  const cle = normaliserCategorieFFR(categorie);
  const formes = refFFRCache.formes || [];
  for (let i = 0; i < formes.length; i++) {
    const f = formes[i];
    let fmois = String(f.mois || '').trim();
    if (fmois.length > 7) fmois = fmois.slice(0, 7); // tolère une date complète
    if (normaliserCategorieFFR(f.categorie) === cle && fmois === mois) return f;
  }
  return null;
}

/**
 * Remplit la zone « Forme FFR attendue » de chaque carte catégorie (placeholder
 * .ffr-forme[data-cat] posé par formulaireCategorie), avec l'avertissement d'effectif.
 */
function majFormesCategories() {
  const dateISO = dateTournoiCourante();
  document.querySelectorAll('.ffr-forme[data-cat]').forEach(function (el) {
    const cat = el.getAttribute('data-cat');
    const f = formeAttendueFFR(cat, dateISO);
    if (!f) { el.innerHTML = ''; el.hidden = true; return; }
    el.hidden = false;
    const forme = String(f.forme_jeu || '').trim();
    const eff = String(f.effectif || '').trim();
    const libelle = [forme, eff].filter(Boolean).join(' — ') || '—';
    const autor = String(f.tournoi_autorise || '').trim().toUpperCase();
    let badge = '';
    if (autor === 'NON') badge = ' <span class="ffr-tag ffr-tag-rouge">tournoi non autorisé</span>';
    else if (autor === 'LIMITE') badge = ' <span class="ffr-tag ffr-tag-orange">format limité</span>';
    el.innerHTML =
      '<span class="ffr-forme-libelle">Forme FFR attendue : <strong>' + echapper(libelle) + '</strong></span>' +
      badge + alerteEffectifFFR(cat, eff);
  });
}

/** Avertissement inline si l'effectif min/max saisi ne couvre pas l'effectif FFR (ex. 7 pour '7x7'). */
function alerteEffectifFFR(cat, effFFR) {
  const n = parseInt(String(effFFR).replace(/[^\d].*$/, ''), 10); // '7x7' → 7
  if (!isFinite(n) || n <= 0) return '';
  const sel = (window.CSS && CSS.escape) ? CSS.escape(cat) : cat;
  const form = document.querySelector('form.form-categorie[data-cat="' + sel + '"]');
  if (!form) return '';
  const champMin = form.querySelector('[name="effectif_min"]');
  const champMax = form.querySelector('[name="effectif_max"]');
  const min = parseInt(champMin ? champMin.value : '', 10);
  const max = parseInt(champMax ? champMax.value : '', 10);
  const incoherent = (isFinite(min) && min > n) || (isFinite(max) && max < n);
  if (!incoherent) return '';
  return ' <span class="ffr-alerte-eff">⚠️ Effectif FFR attendu : ' + n +
    ' joueurs (' + echapper(String(effFFR)) + ')</span>';
}
