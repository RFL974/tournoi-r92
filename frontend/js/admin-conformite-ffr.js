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
  catch (e) { refFFRCache = { formes: [], dates: [], regles: [], temps: [], millesime: null }; }
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

  // COUVERTURE — si la date du tournoi est hors de la saison couverte par le référentiel, on
  // affiche un bandeau ORANGE explicite AVANT tout le reste. Rien n'a pu être comparé : le vert
  // « aucun conflit » est alors formellement interdit (voir la garde plus bas).
  const horsCouverture = !!(res.couverture && res.couverture.couverte === false);
  if (horsCouverture) {
    html += '<div class="ffr-bloc ffr-orange"><strong>⚠️ ' +
      echapper(messageCouvertureFFR(res)) + '</strong></div>';
  }

  if (res.bloquants && res.bloquants.length) {
    html += '<div class="ffr-bloc ffr-rouge"><strong>⛔ ' + res.bloquants.length +
      ' conflit(s) avec le calendrier FFR ' + echapper(mill) + '</strong><ul>' +
      res.bloquants.map(ligneConflitFFR).join('') + '</ul></div>';
  }
  // Points de vigilance métier — on EXCLUT l'avertissement de couverture (déjà affiché en bandeau
  // ci-dessus) pour ne pas le montrer deux fois.
  const averts = (res.avertissements || []).filter(function (a) { return !(a && a.couverture); });
  if (averts.length) {
    html += '<div class="ffr-bloc ffr-orange"><strong>⚠️ ' + averts.length +
      ' point(s) de vigilance</strong><ul>' +
      averts.map(ligneConflitFFR).join('') + '</ul></div>';
  }
  // GARDE : le bandeau vert ne peut apparaître QUE si la couverture est confirmée. On ne se
  // repose pas sur « la liste d'avertissements est vide » : on teste explicitement horsCouverture.
  if (!html && !horsCouverture) {
    html = '<div class="ffr-bloc ffr-vert">✅ Aucun conflit détecté avec le calendrier FFR ' +
      echapper(mill) + '.</div>';
  }
  // Prescriptions FFR par catégorie (terrain / effectif / temps / ballon / carton), sous le verdict.
  html += rendreDetailFFR(res);

  html += '<p class="ffr-note">Contrôle informatif : l\'organisateur reste décideur — ' +
    'la date peut être enregistrée malgré une alerte. Les valeurs FFR sont PROPOSÉES ; un ' +
    'signalement orange marque un réglage hors du cadre, il ne l\'interdit pas.</p>';
  return html;
}

/* --------------------------------------------------------------------------
   PRESCRIPTIONS FFR PAR CATÉGORIE (terrain / effectif / temps / ballon / carton)
   Doctrine « proposer, laisser la main, alerter » : on affiche la valeur FFR ;
   si le réglage de Config diverge, un badge orange le signale — jamais bloquant.
   -------------------------------------------------------------------------- */

/** dimensions_categories (zone A, JSON clé par catégorie de l'app) → objet, {} si absent/illisible. */
function dimensionsCategoriesFFR() {
  const g = (typeof configCourante !== 'undefined' && configCourante && configCourante.global) || {};
  try { return g.dimensions_categories ? JSON.parse(g.dimensions_categories) : {}; }
  catch (e) { return {}; }
}

/** Objet catégorie de Config par nom (ex. 'U10'), ou {} si absent. */
function categorieConfigFFR(cat) {
  const cats = (typeof configCourante !== 'undefined' && configCourante && configCourante.categories) || [];
  return cats.filter(function (c) { return String(c.categorie || '').trim() === cat; })[0] || {};
}

/** Vrai si le réglage Config (non vide) diffère de la valeur FFR (comparaison numérique si possible). */
function ecartFFR(cfgVal, ffrVal) {
  const a = String(cfgVal == null ? '' : cfgVal).trim();
  const b = String(ffrVal == null ? '' : ffrVal).trim();
  if (a === '' || b === '') return false; // rien de saisi côté Config ⇒ pas de divergence signalée
  const na = parseInt(a, 10), nb = parseInt(b, 10);
  if (isFinite(na) && isFinite(nb)) return na !== nb;
  return a !== b;
}

/** Badge orange « réglage actuel hors cadre » (valeur Config + rappel FFR). */
function badgeEcartFFR(cfgVal) {
  return ' <span class="ffr-attendu">⚠️ réglage actuel : ' + echapper(String(cfgVal)) + ' — hors cadre FFR</span>';
}

/** Une ligne « Label : valeur FFR » + badge d'écart éventuel. */
function ligneDetailFFR(label, valeurFFR, cfgVal, diverge) {
  if (valeurFFR === '' || valeurFFR == null) return '';
  return '<div class="ffr-ligne"><span class="ffr-ligne-label">' + echapper(label) + '</span> ' +
    '<span class="ffr-ligne-val">' + echapper(String(valeurFFR)) + '</span>' +
    (diverge ? badgeEcartFFR(cfgVal) : '') + '</div>';
}

/** Restitution complète : une carte par catégorie présente ayant des prescriptions. */
function rendreDetailFFR(res) {
  const regles = (res && res.regles) || {};
  const temps = (res && res.temps) || {};
  const cats = categoriesPresentesNoms().filter(function (c) { return regles[c] || temps[c]; });
  if (!cats.length) return '';
  const dims = dimensionsCategoriesFFR();
  let html = '<div class="ffr-bloc ffr-neutre ffr-detail"><strong>📋 Prescriptions FFR par catégorie</strong>';
  cats.forEach(function (cat) {
    const cfg = categorieConfigFFR(cat);
    html += '<div class="ffr-detail-cat"><span class="ffr-detail-titre">' + echapper(cat) + '</span>' +
      detailReglesFFR(regles[cat] || [], cfg, dims[cat]) +
      detailTempsFFR(temps[cat], cfg) +
      '</div>';
  });
  return html + '</div>';
}

/** Terrain / effectif / ballon / carton, à partir des règles jointes (souvent une seule). */
function detailReglesFFR(regles, cfg, dim) {
  if (!regles.length) return '';
  let html = '';
  regles.forEach(function (r) {
    // Terrain : dimensions chiffrées, sinon libellé (« terrain normal » EST la donnée FFR).
    if (r.terrain_longueur_m && r.terrain_largeur_m) {
      const ffrDim = r.terrain_longueur_m + ' × ' + r.terrain_largeur_m + ' m';
      const diverge = dim && (ecartFFR(dim.l, r.terrain_longueur_m) || ecartFFR(dim.w, r.terrain_largeur_m));
      const cfgDim = dim ? ((dim.l || '?') + ' × ' + (dim.w || '?') + ' m') : '';
      html += ligneDetailFFR('Terrain', ffrDim, cfgDim, diverge);
    } else if (r.terrain_libelle) {
      html += ligneDetailFFR('Terrain', r.terrain_libelle, '', false);
    }
    // Effectifs : sur le terrain + maximum sur la feuille (comparé à effectif_max de Config).
    const eff = [r.effectif_terrain ? r.effectif_terrain + ' sur le terrain' : '',
                 r.effectif_max_feuille ? r.effectif_max_feuille + ' max sur la feuille' : '']
                .filter(Boolean).join(' · ');
    html += ligneDetailFFR('Effectif', eff, cfg.effectif_max, ecartFFR(cfg.effectif_max, r.effectif_max_feuille));
    html += ligneDetailFFR('Ballon', r.ballon, '', false);
    html += ligneDetailFFR('Carton jaune', r.carton_jaune_min ? r.carton_jaune_min + ' min' : '', '', false);
  });
  return html;
}

/** Temps : plafond (sécurité) + variantes de découpage, avec écarts vs Config sur l'union des valeurs. */
function detailTempsFFR(t, cfg) {
  if (!t) return '';
  let html = '';
  // Plafond de temps de jeu par joueur — contrainte de SÉCURITÉ, toujours en tête.
  if (t.plafond_joueur_min) {
    html += '<div class="ffr-ligne"><span class="ffr-ligne-label">⏱ Plafond de temps de jeu / joueur</span> ' +
      '<span class="ffr-ligne-val"><strong>' + echapper(t.plafond_joueur_min) + ' min</strong> (sécurité)</span></div>';
  }
  const grilles = t.grilles || [];
  if (!grilles.length) {
    html += '<div class="ffr-ligne"><span class="ffr-ligne-val">Grille de temps non publiée pour ce nombre ' +
      'd\'équipes (plafond seul).</span></div>';
    return html;
  }
  // Chaque variante (A/B) : découpage également valide — on affiche les deux, on ne choisit pas.
  grilles.forEach(function (g) {
    const v = g.variante ? 'Variante ' + g.variante + ' : ' : '';
    const bits = [];
    if (g.nb_periodes && g.duree_periode_min) bits.push(g.nb_periodes + ' × ' + g.duree_periode_min + ' min');
    if (g.pause_periodes_min) bits.push('pause ' + g.pause_periodes_min + ' min');
    if (g.arret_entre_matchs_min) bits.push('arrêt ' + g.arret_entre_matchs_min + ' min entre matchs');
    if (g.rencontres_par_equipe) bits.push(g.rencontres_par_equipe + ' rencontres/équipe');
    html += '<div class="ffr-ligne"><span class="ffr-ligne-label">Temps</span> ' +
      '<span class="ffr-ligne-val">' + echapper(v + bits.join(' · ')) + '</span></div>';
  });
  // Écarts Config vs UNION des valeurs FFR (le réglage doit correspondre à AU MOINS une variante).
  html += ecartTempsFFR('Nb de périodes', cfg.format_mi_temps, grilles, 'nb_periodes');
  html += ecartTempsFFR('Durée de période', cfg.duree_mi_temps_min, grilles, 'duree_periode_min');
  html += ecartTempsFFR('Pause entre périodes', cfg.pause_mi_temps_min, grilles, 'pause_periodes_min');
  html += ecartTempsFFR('Arrêt entre matchs', cfg.recup_entre_matchs_min, grilles, 'arret_entre_matchs_min');
  return html;
}

/** Signale un écart si le réglage Config ne correspond à AUCUNE des variantes FFR pour ce champ. */
function ecartTempsFFR(label, cfgVal, grilles, champ) {
  const cfg = String(cfgVal == null ? '' : cfgVal).trim();
  if (cfg === '') return '';
  const valeurs = grilles.map(function (g) { return String(g[champ] || '').trim(); })
                         .filter(Boolean)
                         .filter(function (v, i, a) { return a.indexOf(v) === i; });
  if (!valeurs.length) return '';
  const dansLeCadre = valeurs.some(function (v) { return !ecartFFR(cfg, v); });
  if (dansLeCadre) return '';
  return '<div class="ffr-ligne"><span class="ffr-attendu">⚠️ ' + echapper(label) + ' : réglage ' +
    echapper(cfg) + ' hors cadre FFR (attendu ' + echapper(valeurs.join(' ou ')) + ')</span></div>';
}

/**
 * Message du bandeau de couverture. On réutilise en priorité le libellé de l'avertissement
 * poussé par le backend (source unique, déjà formaté) ; à défaut on le reconstruit à partir des
 * bornes de `res.couverture` et de la date du tournoi courante.
 */
function messageCouvertureFFR(res) {
  const a = (res.avertissements || []).filter(function (x) { return x && x.couverture; })[0];
  if (a && a.libelle) return a.libelle;
  const c = res.couverture || {};
  const d = c.debut ? dateCourteFrFFR(c.debut) : '?';
  const f = c.fin ? dateCourteFrFFR(c.fin) : '?';
  const dj = dateCourteFrFFR(dateTournoiCourante());
  return 'La date du tournoi (' + dj + ') est en dehors de la période couverte par le ' +
    'référentiel FFR chargé (du ' + d + ' au ' + f + '). Aucun contrôle de date n\'a pu être effectué.';
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
