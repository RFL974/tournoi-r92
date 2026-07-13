/**
 * ============================================================================
 *  CLASSEMENT — page dédiée (lecture seule)
 * ============================================================================
 *
 *  Deux sections :
 *   - 🌅 Poules (matin) : classement de chaque poule A/B/C.
 *   - 🏉 Après-midi : classement de chaque niveau N1-N4 (classement croisé).
 *
 *  Tout est calculé côté navigateur depuis un seul appel `getAll` (même barème que
 *  le backend : V=3/N=2/D=1, départage différence puis points marqués). Les deux
 *  phases sont comptées SÉPARÉMENT (le matin ne compte que les matchs de poule,
 *  l'après-midi que les matchs de classement).
 *
 *  Nécessite (chargés AVANT ce fichier) : config.js puis api.js.
 * ============================================================================
 */

let equipes = [];
let matchs = [];

async function initClassement() {
  const zone = document.getElementById('classement');
  try {
    const data = await apiGet('getAll');
    equipes = data.equipes || [];
    matchs = data.matchs || [];
    afficher();
  } catch (err) {
    zone.innerHTML = '<p class="vide">Erreur de chargement : ' + echapper(err.message) + '</p>';
  }
}

function nomEquipe(id) {
  const e = equipes.find(function (x) { return x.id_equipe === id; });
  return e ? e.nom_equipe : id;
}

function afficher() {
  const zone = document.getElementById('classement');
  const matin = classementMatin();
  if (!matin.length) {
    zone.innerHTML = '<p class="vide">Aucune poule. Génère d\'abord le planning dans l\'admin.</p>';
    return;
  }

  let html = '<div class="planning-phase">🌅 Poules (matin)</div>';
  matin.forEach(function (cat) {
    html += '<h3 class="live-cat">' + echapper(cat.categorie) + '</h3>';
    cat.groupes.forEach(function (g) { html += tableClassement(g.titre, g.classement); });
  });

  const aprem = classementApresMidi();
  if (aprem.some(function (c) { return c.groupes.length; })) {
    html += '<div class="planning-phase">🏉 Après-midi — classement croisé par niveau</div>';
    aprem.forEach(function (cat) {
      if (!cat.groupes.length) return;
      html += '<h3 class="live-cat">' + echapper(cat.categorie) + '</h3>';
      cat.groupes.forEach(function (g) { html += tableClassement(g.titre, g.classement); });
    });
  }

  zone.innerHTML = html;
}

/* -------------------------------------------------------------------------
   CALCULS (même barème que le backend)
   ------------------------------------------------------------------------- */
function nouveauStats(id) {
  return { id_equipe: id, nom_equipe: nomEquipe(id), j: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, diff: 0, pts: 0 };
}
function appliquer(s, pour, contre) {
  s.j++; s.bp += pour; s.bc += contre; s.diff = s.bp - s.bc;
  if (pour > contre) { s.v++; s.pts += 3; }
  else if (pour === contre) { s.n++; s.pts += 2; }
  else { s.d++; s.pts += 1; }
}
function comparer(a, b) {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.diff !== a.diff) return b.diff - a.diff;
  return b.bp - a.bp;
}
function compterMatch(stats, m) {
  if (!estTermine(m.statut)) return;
  const a = stats[m.equipe_A], b = stats[m.equipe_B];
  if (!a || !b) return;
  const sa = Number(m.score_A), sb = Number(m.score_B);
  if (!isFinite(sa) || !isFinite(sb)) return;
  appliquer(a, sa, sb);
  appliquer(b, sb, sa);
}

// Matin : équipes groupées par leur poule (Equipes.poule), on ne compte QUE les
// matchs de poule (phase ≠ classement).
function classementMatin() {
  const stats = {}, infos = {};
  equipes.forEach(function (e) {
    if (!e.poule) return;
    stats[e.id_equipe] = nouveauStats(e.id_equipe);
    infos[e.id_equipe] = { categorie: e.categorie, cle: e.poule };
  });
  matchs.forEach(function (m) {
    if (String(m.phase) === 'classement') return;
    compterMatch(stats, m);
  });
  return regrouper(stats, infos, 'Poule ');
}

// Après-midi : équipes groupées par NIVEAU (le champ « poule » du match = N1/N2…),
// on ne compte QUE les matchs de classement (phase = classement). La composition
// s'affiche même sans score (les points se remplissent au fil des résultats).
function classementApresMidi() {
  const aprem = matchs.filter(function (m) { return String(m.phase) === 'classement'; });
  const stats = {}, infos = {};
  aprem.forEach(function (m) {
    [m.equipe_A, m.equipe_B].forEach(function (id) {
      if (!stats[id]) {
        stats[id] = nouveauStats(id);
        infos[id] = { categorie: m.categorie, cle: m.poule };
      }
    });
  });
  aprem.forEach(function (m) { compterMatch(stats, m); });
  return regrouper(stats, infos, 'Niveau ');
}

// Regroupe les stats par catégorie puis par clé (poule ou niveau), trie chaque groupe.
function regrouper(stats, infos, prefixeTitre) {
  const parCat = {};
  Object.keys(stats).forEach(function (id) {
    const info = infos[id];
    const cat = (parCat[info.categorie] = parCat[info.categorie] || {});
    (cat[info.cle] = cat[info.cle] || []).push(stats[id]);
  });
  const res = [];
  Object.keys(parCat).sort().forEach(function (cat) {
    const groupes = [];
    Object.keys(parCat[cat]).sort().forEach(function (cle) {
      groupes.push({ titre: prefixeTitre + cle, classement: parCat[cat][cle].sort(comparer) });
    });
    res.push({ categorie: cat, groupes: groupes });
  });
  return res;
}

/* -------------------------------------------------------------------------
   RENDU
   ------------------------------------------------------------------------- */
function tableClassement(titre, liste) {
  let h = '<div class="live-poule">' + echapper(titre) + '</div>';
  h += '<div class="table-scroll"><table class="table-planning table-classement cl-full">' +
    '<thead><tr><th>#</th><th>Équipe</th><th>J</th><th>V</th><th>N</th><th>D</th>' +
    '<th>BP</th><th>BC</th><th>Diff</th><th>Pts</th></tr></thead><tbody>';
  liste.forEach(function (t, i) {
    const diff = (t.diff > 0 ? '+' : '') + t.diff;
    h += '<tr>' +
      '<td>' + (i + 1) + '</td>' +
      '<td class="col-equipe">' + echapper(t.nom_equipe) + '</td>' +
      '<td>' + t.j + '</td><td>' + t.v + '</td><td>' + t.n + '</td><td>' + t.d + '</td>' +
      '<td>' + t.bp + '</td><td>' + t.bc + '</td><td>' + echapper(diff) + '</td>' +
      '<td class="col-pts">' + t.pts + '</td>' +
    '</tr>';
  });
  return h + '</tbody></table></div>';
}

function estTermine(statut) { return /^\s*termin/i.test(String(statut)); }

function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', initClassement);
