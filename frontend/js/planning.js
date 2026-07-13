/**
 * ============================================================================
 *  MON PLANNING — page visiteur (lecture seule)
 * ============================================================================
 *
 *  Le visiteur choisit son équipe et voit uniquement SES matchs (matin +
 *  après-midi), avec horaires, terrains, adversaire et score s'il est joué.
 *  Le dernier choix est mémorisé (localStorage) pour un retour plus rapide.
 *
 *  Nécessite (chargés AVANT ce fichier) : config.js puis api.js.
 * ============================================================================
 */

let equipes = [];
let matchs = [];
const CLE_STOCKAGE = 'r92_mon_equipe';
const INTERVALLE_MS = 60000;
let derniereSignature = '';

/** Point d'entrée : chargement initial + rafraîchissement automatique. */
async function initPlanning() {
  const sel = document.getElementById('select-equipe');
  await charger(true);

  sel.addEventListener('change', function () {
    localStorage.setItem(CLE_STOCKAGE, sel.value);
    afficher();
  });
  const btn = document.getElementById('btn-refresh-planning');
  if (btn) btn.addEventListener('click', function () { charger(false); });

  // Rafraîchissement auto : les matchs d'après-midi générés en cours de journée
  // apparaissent tout seuls (idem mises à jour de scores).
  setInterval(function () { charger(false); }, INTERVALLE_MS);
}

/**
 * (Re)charge les données. Ne ré-affiche QUE si elles ont changé (évite de faire
 * "sauter" la page à chaque rafraîchissement). Préserve l'équipe sélectionnée.
 */
async function charger(premier) {
  const sel = document.getElementById('select-equipe');
  const choix = sel.value || localStorage.getItem(CLE_STOCKAGE) || '';
  try {
    const data = await apiGet('getAll');
    const signature = JSON.stringify(data.matchs) + '|' + JSON.stringify(data.equipes);
    equipes = data.equipes || [];
    matchs = data.matchs || [];
    majHeurePlanning();

    if (premier || signature !== derniereSignature) {
      derniereSignature = signature;
      remplirSelect();
      if (choix && equipes.some(function (e) { return e.id_equipe === choix; })) sel.value = choix;
      afficher();
    }
  } catch (err) {
    if (premier) {
      document.getElementById('mon-planning').innerHTML =
        '<p class="vide">Erreur de chargement : ' + echapper(err.message) + '</p>';
    }
  }
}

/** Affiche l'heure de dernière mise à jour. */
function majHeurePlanning() {
  const el = document.getElementById('maj-planning');
  if (!el) return;
  const d = new Date();
  el.textContent = 'Mis à jour à ' +
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

/** Remplit le menu déroulant des équipes, groupées par catégorie. */
function remplirSelect() {
  const sel = document.getElementById('select-equipe');
  const cats = [];
  equipes.forEach(function (e) { if (cats.indexOf(e.categorie) < 0) cats.push(e.categorie); });

  let html = '<option value="">— Choisis ton équipe —</option>';
  cats.forEach(function (cat) {
    html += '<optgroup label="' + echapper(cat) + '">';
    equipes.filter(function (e) { return e.categorie === cat; })
      .slice().sort(function (a, b) { return String(a.nom_equipe).localeCompare(String(b.nom_equipe)); })
      .forEach(function (e) {
        html += '<option value="' + echapper(e.id_equipe) + '">' + echapper(e.nom_equipe) + '</option>';
      });
    html += '</optgroup>';
  });
  sel.innerHTML = html;
}

/** Nom d'une équipe à partir de son identifiant. */
function nomEquipe(id) {
  const e = equipes.find(function (x) { return x.id_equipe === id; });
  return e ? e.nom_equipe : id;
}

/** Affiche les matchs de l'équipe sélectionnée, séparés matin / après-midi. */
function afficher() {
  const zone = document.getElementById('mon-planning');
  const id = document.getElementById('select-equipe').value;

  if (!id) {
    zone.innerHTML = '<p class="vide">Sélectionne ton équipe pour voir tes matchs.</p>';
    return;
  }

  const mes = matchs.filter(function (m) { return m.equipe_A === id || m.equipe_B === id; });
  if (!mes.length) {
    zone.innerHTML = '<p class="vide">Aucun match pour cette équipe (planning pas encore généré ?).</p>';
    return;
  }

  const matin = mes.filter(function (m) { return String(m.phase) !== 'classement'; });
  const aprem = mes.filter(function (m) { return String(m.phase) === 'classement'; });

  let html = '';
  if (matin.length) html += '<div class="planning-phase">🌅 Matin — poules</div>' + cartes(matin, id);
  if (aprem.length) html += '<div class="planning-phase">🏉 Après-midi — classement croisé</div>' + cartes(aprem, id);

  // Classements en direct : sa poule du matin, son niveau d'après-midi, et le général du tournoi.
  const eq = equipes.find(function (x) { return x.id_equipe === id; });
  if (eq) html += sectionClassements(eq);

  zone.innerHTML = html;
}

/** Rend les cartes d'une liste de matchs (triées par heure), du point de vue de l'équipe id. */
function cartes(liste, id) {
  return liste.slice()
    .sort(function (a, b) { return String(a.heure_debut).localeCompare(String(b.heure_debut)); })
    .map(function (m) { return carteMatch(m, id); }).join('');
}

/** Carte d'un match vu du côté de l'équipe id : adversaire + résultat. */
function carteMatch(m, id) {
  const estA = m.equipe_A === id;
  const adversaire = nomEquipe(estA ? m.equipe_B : m.equipe_A);
  const monScore = estA ? m.score_A : m.score_B;
  const scoreAdv = estA ? m.score_B : m.score_A;
  const termine = estTermine(m.statut);
  const libelle = (String(m.phase) === 'classement' ? 'Niveau ' : 'Poule ') + String(m.poule);

  let resultat;
  if (termine && String(monScore) !== '' && String(scoreAdv) !== '') {
    const a = Number(monScore), b = Number(scoreAdv);
    const issue = a > b ? 'gagne' : (a < b ? 'perd' : 'nul');
    const etiquette = a > b ? 'Victoire' : (a < b ? 'Défaite' : 'Nul');
    resultat = '<span class="mp-resultat ' + issue + '">' + a + ' - ' + b + ' · ' + etiquette + '</span>';
  } else {
    resultat = '<span class="mp-avenir">à venir</span>';
  }

  return '<div class="match' + (termine ? ' match-termine' : '') + '">' +
    '<div class="match-meta">' + echapper(m.heure_debut) + ' · Terrain ' + echapper(String(m.terrain)) +
      ' · ' + echapper(libelle) + '</div>' +
    '<div class="mp-ligne"><span class="mp-adv">vs ' + echapper(adversaire) + '</span>' +
      resultat + '</div>' +
  '</div>';
}

/* -------------------------------------------------------------------------
   CLASSEMENTS (même barème que le backend : V=3/N=2/D=1, départage Diff puis BP)
   ------------------------------------------------------------------------- */

/** Les 3 classements affichés sous les matchs de l'équipe sélectionnée. */
function sectionClassements(eq) {
  let html = '';

  // 1) Classement de SA poule du matin.
  const membresPoule = equipes.filter(function (e) { return e.categorie === eq.categorie && e.poule === eq.poule; });
  const matchsMatin = matchs.filter(function (m) { return m.categorie === eq.categorie && String(m.phase) !== 'classement'; });
  html += '<div class="planning-phase">📊 Classement de ta poule (matin)</div>';
  html += tableClassement('Poule ' + echapper(String(eq.poule)), classementGroupe(matchsMatin, membresPoule), eq.id_equipe);

  // 2) Classement de SON niveau d'après-midi (si un match de classement existe pour elle).
  const matchNiv = matchs.find(function (m) {
    return String(m.phase) === 'classement' && (m.equipe_A === eq.id_equipe || m.equipe_B === eq.id_equipe);
  });
  if (matchNiv) {
    const niv = matchNiv.poule;
    const matchsNiv = matchs.filter(function (m) {
      return m.categorie === eq.categorie && String(m.phase) === 'classement' && m.poule === niv;
    });
    const idsNiv = {};
    matchsNiv.forEach(function (m) { idsNiv[m.equipe_A] = 1; idsNiv[m.equipe_B] = 1; });
    const membresNiv = Object.keys(idsNiv).map(function (x) { return { id_equipe: x, nom_equipe: nomEquipe(x) }; });
    html += '<div class="planning-phase">📊 Classement de ton niveau (après-midi)</div>';
    html += tableClassement('Niveau ' + echapper(String(niv)), classementGroupe(matchsNiv, membresNiv), eq.id_equipe);
  }

  // 3) Classement général du tournoi (croisé final : N1 = places 1-3, N2 = 4-6, …).
  html += '<div class="planning-phase">🏆 Classement général du tournoi</div>';
  html += tableGeneral(classementGeneral(eq.categorie), eq.id_equipe);
  return html;
}

function nouveauStats(id, nom) {
  return { id_equipe: id, nom_equipe: nom || nomEquipe(id), j: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, diff: 0, pts: 0 };
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
/** Compte les matchs terminés d'un groupe et renvoie ses membres triés (classement). */
function classementGroupe(matchsGroupe, membres) {
  const stats = {};
  membres.forEach(function (e) { stats[e.id_equipe] = nouveauStats(e.id_equipe, e.nom_equipe); });
  compterMatchs(stats, matchsGroupe);
  return Object.keys(stats).map(function (k) { return stats[k]; }).sort(comparer);
}
function compterMatchs(stats, ms) {
  ms.forEach(function (m) {
    if (!estTermine(m.statut)) return;
    const a = stats[m.equipe_A], b = stats[m.equipe_B];
    if (!a || !b) return;
    const sa = Number(m.score_A), sb = Number(m.score_B);
    if (!isFinite(sa) || !isFinite(sb)) return;
    appliquer(a, sa, sb); appliquer(b, sb, sa);
  });
}

/** Numéro de niveau (N1 -> 1) ; 999 si pas de niveau (passe en fin de classement). */
function niveauNum(n) { const m = String(n).match(/(\d+)/); return m ? parseInt(m[1], 10) : 999; }

/**
 * Classement général (croisé final) d'une catégorie : les équipes sont ordonnées par
 * NIVEAU (N1 avant N2…), puis, à l'intérieur d'un niveau, par les résultats de l'après-midi,
 * puis (départage « instant T » avant l'après-midi) par les résultats du matin.
 */
function classementGeneral(categorie) {
  const membres = equipes.filter(function (e) { return e.categorie === categorie && e.poule; });
  const sM = {}, sA = {}, niveau = {};
  membres.forEach(function (e) {
    sM[e.id_equipe] = nouveauStats(e.id_equipe, e.nom_equipe);
    sA[e.id_equipe] = nouveauStats(e.id_equipe, e.nom_equipe);
  });
  compterMatchs(sM, matchs.filter(function (m) { return m.categorie === categorie && String(m.phase) !== 'classement'; }));
  const matchsAprem = matchs.filter(function (m) { return m.categorie === categorie && String(m.phase) === 'classement'; });
  compterMatchs(sA, matchsAprem);
  matchsAprem.forEach(function (m) { niveau[m.equipe_A] = m.poule; niveau[m.equipe_B] = m.poule; });

  return membres.map(function (e) {
    return { id: e.id_equipe, nom: e.nom_equipe, niveau: niveau[e.id_equipe] || '', m: sM[e.id_equipe], a: sA[e.id_equipe] };
  }).sort(function (x, y) {
    const nx = niveauNum(x.niveau), ny = niveauNum(y.niveau);
    if (nx !== ny) return nx - ny;
    return comparer(x.a, y.a) || comparer(x.m, y.m);
  });
}

/** Tableau compact d'un classement de groupe (poule ou niveau). idSel = équipe surlignée. */
function tableClassement(titre, liste, idSel) {
  let h = '<div class="live-poule">' + titre + '</div>';
  h += '<div class="table-scroll"><table class="table-planning table-classement">' +
    '<thead><tr><th>#</th><th>Équipe</th><th>J</th><th>Diff</th><th>Pts</th></tr></thead><tbody>';
  liste.forEach(function (t, i) {
    const diff = (t.diff > 0 ? '+' : '') + t.diff;
    h += '<tr' + (t.id_equipe === idSel ? ' class="fav-ligne"' : '') + '>' +
      '<td>' + (i + 1) + '</td><td class="col-equipe">' + echapper(t.nom_equipe) + '</td>' +
      '<td>' + t.j + '</td><td>' + echapper(diff) + '</td><td class="col-pts">' + t.pts + '</td></tr>';
  });
  return h + '</tbody></table></div>';
}

/** Tableau du classement général (place, équipe, niveau, points/diff de l'après-midi). */
function tableGeneral(liste, idSel) {
  let h = '<div class="table-scroll"><table class="table-planning table-classement">' +
    '<thead><tr><th>#</th><th>Équipe</th><th>Niveau</th><th>Pts</th><th>Diff</th></tr></thead><tbody>';
  liste.forEach(function (t, i) {
    const diff = (t.a.diff > 0 ? '+' : '') + t.a.diff;
    h += '<tr' + (t.id === idSel ? ' class="fav-ligne"' : '') + '>' +
      '<td>' + (i + 1) + '</td><td class="col-equipe">' + echapper(t.nom) + '</td>' +
      '<td>' + echapper(t.niveau || '—') + '</td><td class="col-pts">' + t.a.pts + '</td><td>' + echapper(diff) + '</td></tr>';
  });
  return h + '</tbody></table></div>';
}

/**
 * Vrai si le statut vaut « terminé », quelle que soit la forme du « é » (NFC/NFD).
 * On teste le préfixe ASCII « termin » : robuste face aux accents décomposés
 * renvoyés par le Sheet, et seul « terminé » commence ainsi (vs « à venir » / « en cours »).
 */
function estTermine(statut) {
  return /^\s*termin/i.test(String(statut));
}

/** Neutralise les caractères spéciaux HTML (sécurité d'affichage). */
function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* On lance tout une fois la page prête. */
document.addEventListener('DOMContentLoaded', initPlanning);
