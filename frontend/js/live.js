/**
 * ============================================================================
 *  LIVE — vue publique du tournoi en direct (lecture seule)
 * ============================================================================
 *
 *  Trois sections : ⭐ favoris (équipes suivies, mémorisées sur l'appareil),
 *  📣 derniers scores, 🏆 classements par poule. Rafraîchissement auto (60 s)
 *  et bouton manuel. Aucune écriture.
 *
 *  Nécessite (chargés AVANT ce fichier) : config.js puis api.js.
 * ============================================================================
 */

let equipes = [];
let matchs = [];
let classement = [];
const CLE_FAVORIS = 'r92_favoris';
const INTERVALLE_MS = 60000;

/* ----- Favoris (localStorage) ----- */
function favoris() {
  try { return JSON.parse(localStorage.getItem(CLE_FAVORIS)) || []; }
  catch (e) { return []; }
}
function estFavori(id) { return favoris().indexOf(id) >= 0; }
function basculerFavori(id) {
  const f = favoris();
  const i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1); else f.push(id);
  localStorage.setItem(CLE_FAVORIS, JSON.stringify(f));
  afficher();
}

/* ----- Chargement des données ----- */
async function charger() {
  try {
    // Un seul appel réseau : on récupère tout et on calcule le classement localement
    // (Apps Script gère mal 2 requêtes simultanées ; et ça allège le rafraîchissement).
    const all = await apiGet('getAll');
    equipes = all.equipes || [];
    matchs = all.matchs || [];
    classement = calculerClassementLocal(equipes, matchs);
    majHeure();
    afficher();
  } catch (err) {
    document.getElementById('live').innerHTML =
      '<p class="vide">Erreur de chargement : ' + echapper(err.message) + '</p>';
  }
}

/* Classement par poule, calculé côté navigateur — MÊME barème que le backend
   (V=3/N=2/D=1, départage différence puis points marqués ; matchs terminés seulement). */
function calculerClassementLocal(equipes, matchs) {
  const stats = {}, infos = {};
  equipes.forEach(function (e) {
    if (!e.poule) return;
    stats[e.id_equipe] = { id_equipe: e.id_equipe, nom_equipe: e.nom_equipe,
                           j: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, diff: 0, pts: 0 };
    infos[e.id_equipe] = { categorie: e.categorie, poule: e.poule };
  });
  matchs.forEach(function (m) {
    if (!estTermine(m.statut)) return;
    const a = stats[m.equipe_A], b = stats[m.equipe_B];
    if (!a || !b) return;
    const sa = Number(m.score_A), sb = Number(m.score_B);
    if (!isFinite(sa) || !isFinite(sb)) return;
    appliquerResultat(a, sa, sb);
    appliquerResultat(b, sb, sa);
  });
  const parCat = {};
  Object.keys(stats).forEach(function (id) {
    const info = infos[id];
    const cat = (parCat[info.categorie] = parCat[info.categorie] || {});
    (cat[info.poule] = cat[info.poule] || []).push(stats[id]);
  });
  const res = [];
  Object.keys(parCat).sort().forEach(function (cat) {
    const poules = [];
    Object.keys(parCat[cat]).sort().forEach(function (np) {
      poules.push({ nom_poule: np, classement: parCat[cat][np].sort(comparerClassement) });
    });
    res.push({ categorie: cat, poules: poules });
  });
  return res;
}
function appliquerResultat(s, pour, contre) {
  s.j++; s.bp += pour; s.bc += contre; s.diff = s.bp - s.bc;
  if (pour > contre) { s.v++; s.pts += 3; }
  else if (pour === contre) { s.n++; s.pts += 2; }
  else { s.d++; s.pts += 1; }
}
function comparerClassement(a, b) {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.diff !== a.diff) return b.diff - a.diff;
  return b.bp - a.bp;
}

function majHeure() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  document.getElementById('maj').textContent = 'Mis à jour à ' + hh + ':' + mm;
}

function nomEquipe(id) {
  const e = equipes.find(function (x) { return x.id_equipe === id; });
  return e ? e.nom_equipe : id;
}

/* ----- Rendu global ----- */
function afficher() {
  document.getElementById('live').innerHTML =
    sectionFavoris() + sectionDerniersScores() + sectionClassements();
}

/* ----- ⭐ Favoris ----- */
function sectionFavoris() {
  const favs = favoris().filter(function (id) {
    return equipes.some(function (e) { return e.id_equipe === id; });
  });
  let h = '<h2 class="live-titre">⭐ Mes favoris</h2>';
  if (!favs.length) {
    return h + '<p class="vide">Clique sur l\'étoile ☆ d\'une équipe (dans les classements ci-dessous) pour la suivre ici.</p>';
  }
  favs.forEach(function (id) {
    const mes = matchs.filter(function (m) { return m.equipe_A === id || m.equipe_B === id; })
      .slice().sort(function (a, b) { return String(a.heure_debut).localeCompare(String(b.heure_debut)); });
    h += '<div class="fav-bloc"><div class="fav-nom">★ ' + echapper(nomEquipe(id)) + '</div>';
    mes.forEach(function (m) { h += favMatchLigne(m, id); });
    h += '</div>';
  });
  return h;
}

function favMatchLigne(m, id) {
  const estA = m.equipe_A === id;
  const adv = echapper(nomEquipe(estA ? m.equipe_B : m.equipe_A));
  const monS = estA ? m.score_A : m.score_B;
  const advS = estA ? m.score_B : m.score_A;
  let res;
  if (estTermine(m.statut) && String(monS) !== '' && String(advS) !== '') {
    const a = Number(monS), b = Number(advS);
    res = '<span class="mp-resultat ' + (a > b ? 'gagne' : a < b ? 'perd' : 'nul') + '">' + a + ' - ' + b + '</span>';
  } else {
    res = '<span class="mp-avenir">' + echapper(m.heure_debut) + '</span>';
  }
  return '<div class="fav-match"><span>vs ' + adv + '</span>' + res + '</div>';
}

/* ----- 📣 Derniers scores ----- */
function sectionDerniersScores() {
  const finis = matchs.filter(function (m) {
    return estTermine(m.statut) && String(m.score_A) !== '' && String(m.score_B) !== '';
  });
  let h = '<h2 class="live-titre">📣 Derniers scores</h2>';
  if (!finis.length) return h + '<p class="vide">Aucun score pour l\'instant.</p>';

  // Plus récents d'abord (par heure de fin décroissante), on garde les 8 derniers.
  const tri = finis.slice()
    .sort(function (a, b) { return String(b.heure_fin).localeCompare(String(a.heure_fin)); })
    .slice(0, 8);
  tri.forEach(function (m) { h += ligneScore(m); });
  return h;
}

function ligneScore(m) {
  const a = Number(m.score_A), b = Number(m.score_B);
  const libelle = (String(m.phase) === 'classement' ? 'Niveau ' : 'Poule ') + String(m.poule);
  return '<div class="score-ligne">' +
    '<span class="score-meta">' + echapper(m.categorie) + ' · ' + echapper(libelle) + ' · ' + echapper(m.heure_fin) + '</span>' +
    '<div class="score-corps">' +
      '<span class="' + (a > b ? 'gagnant' : '') + '">' + echapper(nomEquipe(m.equipe_A)) + '</span>' +
      '<span class="score-chiffres">' + a + ' - ' + b + '</span>' +
      '<span class="' + (b > a ? 'gagnant' : '') + '">' + echapper(nomEquipe(m.equipe_B)) + '</span>' +
    '</div></div>';
}

/* ----- 🏆 Classements ----- */
function sectionClassements() {
  if (!classement.length) return '';
  let h = '<h2 class="live-titre">🏆 Classements</h2>';
  classement.forEach(function (cat) {
    h += '<h3 class="live-cat">' + echapper(cat.categorie) + '</h3>';
    (cat.poules || []).forEach(function (p) {
      h += '<div class="live-poule">Poule ' + echapper(p.nom_poule) + '</div>';
      h += '<div class="table-scroll"><table class="table-planning table-classement cl-live">' +
        '<thead><tr><th>#</th><th></th><th>Équipe</th><th>J</th><th>Diff</th><th>Pts</th></tr></thead><tbody>';
      (p.classement || []).forEach(function (t, i) {
        const fav = estFavori(t.id_equipe);
        h += '<tr' + (fav ? ' class="fav-ligne"' : '') + '>' +
          '<td>' + (i + 1) + '</td>' +
          '<td><button class="etoile' + (fav ? ' on' : '') + '" data-fav="' + echapper(t.id_equipe) +
            '" title="Suivre cette équipe">' + (fav ? '★' : '☆') + '</button></td>' +
          '<td class="col-equipe">' + echapper(t.nom_equipe) + '</td>' +
          '<td>' + t.j + '</td>' +
          '<td>' + (t.diff > 0 ? '+' : '') + t.diff + '</td>' +
          '<td class="col-pts">' + t.pts + '</td>' +
        '</tr>';
      });
      h += '</tbody></table></div>';
    });
  });
  return h;
}

/* ----- Aides ----- */
function estTermine(statut) { return /^\s*termin/i.test(String(statut)); }

function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ----- Démarrage ----- */
async function initLive() {
  await charger();
  document.getElementById('btn-refresh').addEventListener('click', charger);
  // Clic sur une étoile (délégation, car le contenu est régénéré à chaque rafraîchissement).
  document.getElementById('live').addEventListener('click', function (e) {
    const b = e.target.closest('[data-fav]');
    if (b) basculerFavori(b.getAttribute('data-fav'));
  });
  // Rafraîchissement automatique.
  setInterval(charger, INTERVALLE_MS);
}

document.addEventListener('DOMContentLoaded', initLive);
