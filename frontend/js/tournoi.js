/**
 * ============================================================================
 *  LE TOURNOI — page publique unique (lecture seule)
 * ============================================================================
 *
 *  Regroupe en 2 onglets ce qui était auparavant 3 pages séparées :
 *   • 📋 Mon équipe  — sélection d'une équipe → ses matchs + ses classements (onglet par défaut)
 *   • 🏆 Classements — derniers scores du tournoi, puis poules (matin) + niveaux croisés (après-midi)
 *
 *  Un SEUL appel réseau (getAll) et un SEUL rafraîchissement auto (60 s) alimentent
 *  les 2 vues. Barème partout identique au backend : V=3 / N=2 / D=1, départage par
 *  la différence (BP − BC) puis les points marqués ; seuls les matchs « terminé » comptent.
 *
 *  Nécessite (chargés AVANT ce fichier) : config.js puis api.js.
 * ============================================================================
 */

let equipes = [];
let matchs = [];
let config = { global: {} };
let ongletActif = 'equipe';
let derniereSignature = '';
let categorieActive = '';
const CLE_EQUIPE = 'r92_mon_equipe';
const CLE_CATEGORIE = 'r92_ma_categorie';
const INTERVALLE_MS = 10000; // rafraîchissement auto toutes les 10 s (scores + classements en direct)

/* ==========================================================================
   DÉMARRAGE / NAVIGATION
   ========================================================================== */

async function initTournoi() {
  document.querySelectorAll('.onglet[data-onglet]').forEach(function (b) {
    b.addEventListener('click', function () { basculer(b.getAttribute('data-onglet')); });
  });
  document.getElementById('btn-refresh').addEventListener('click', onRafraichir);

  const sel = document.getElementById('select-equipe');
  sel.addEventListener('change', function () {
    localStorage.setItem(CLE_EQUIPE, sel.value);
    afficherEquipe();
  });

  // Filtre catégorie global : repeuple les équipes et réaffiche les deux onglets.
  document.getElementById('select-categorie').addEventListener('change', function (e) {
    categorieActive = e.target.value;
    localStorage.setItem(CLE_CATEGORIE, categorieActive);
    peuplerSelect();   // limite les équipes à la catégorie choisie
    afficherTout();
  });

  await charger(true);
  setInterval(function () { charger(false); }, INTERVALLE_MS);
}

/** Bascule d'onglet : montre une vue, cache l'autre. */
function basculer(cible) {
  ongletActif = cible;
  document.querySelectorAll('.onglet[data-onglet]').forEach(function (b) {
    b.classList.toggle('actif', b.getAttribute('data-onglet') === cible);
  });
  document.getElementById('vue-equipe').hidden = (cible !== 'equipe');
  document.getElementById('vue-classements').hidden = (cible !== 'classements');
}

/** (Re)charge les données. Ne ré-affiche que si elles ont changé (évite le clignotement). */
async function charger(premier) {
  try {
    const data = await apiGet('getAll');
    const signature = JSON.stringify(data.matchs) + '|' + JSON.stringify(data.equipes);
    equipes = data.equipes || [];
    matchs = data.matchs || [];
    config = data.config || { global: {} };
    majHeure();
    majTitre(); // le bandeau prend le nom de l'événement s'il est renseigné

    if (premier || signature !== derniereSignature) {
      derniereSignature = signature;
      peuplerCategorie();
      peuplerSelect();
      afficherTout();
    }
    // Verrou de publication (peut changer sans que les matchs/équipes changent).
    appliquerPublication();
  } catch (err) {
    if (premier) {
      document.getElementById('mon-planning').innerHTML =
        '<p class="vide">Erreur de chargement : ' + echapper(err.message) + '</p>';
    }
  }
}

/** Réaffiche les deux vues d'un coup (+ le podium, commun aux deux onglets). */
function afficherTout() {
  afficherPodium();
  afficherEquipe();
  afficherClassements();
}

/**
 * Affiche le podium dans l'encadré commun (visible sur les deux onglets), pour la
 * catégorie active — mais UNIQUEMENT s'il est mathématiquement certain (cf. podiumCertain).
 */
function afficherPodium() {
  const zone = document.getElementById('podium');
  if (!zone) return;
  const top = estPublie() ? podiumCertain(categorieActive) : null;
  if (!top) { zone.hidden = true; zone.innerHTML = ''; return; }

  const medailles = ['🥇', '🥈', '🥉'];
  let html = '<div class="podium-titre">🏆 Podium' +
    (categorieActive ? ' <span class="podium-cat">' + echapper(categorieActive) + '</span>' : '') + '</div>';
  top.forEach(function (t, i) {
    html += '<div class="podium-ligne podium-' + (i + 1) + '">' +
      '<span class="podium-rang">' + medailles[i] + '</span>' +
      '<span class="podium-nom">' + echapper(t.nom) + '</span>' +
    '</div>';
  });
  zone.innerHTML = html;
  zone.hidden = false;
}

/** Vrai si le tournoi est publié (rendu visible depuis l'admin). */
function estPublie() {
  return String(config.global && config.global.tournoi_publie).toLowerCase() === 'oui';
}

/**
 * Verrou de publication : tant que le tournoi n'est pas publié, on masque tout le contenu
 * (barre, onglets, filtre, vues) et on affiche l'écran « à venir ». Sinon, on montre la page.
 */
function appliquerPublication() {
  const pub = estPublie();
  document.getElementById('tournoi-avenir').hidden = pub;
  document.getElementById('don-lien').hidden = !pub;
  document.querySelector('.live-barre').hidden = !pub;
  document.querySelector('.onglets').hidden = !pub;
  document.getElementById('vues').hidden = !pub;
  // Le podium : masqué si non publié ; sinon c'est afficherPodium qui décide (certitude).
  if (!pub) { const pod = document.getElementById('podium'); if (pod) pod.hidden = true; }
  // Le filtre catégorie : masqué si non publié ; sinon c'est peuplerCategorie qui décide.
  if (!pub) document.getElementById('filtre-categorie').hidden = true;
}

function majHeure() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  // On affiche les secondes : ainsi chaque rafraîchissement fait VISIBLEMENT bouger
  // l'heure, même si les données n'ont pas changé (retour clair « ça a marché »).
  document.getElementById('maj').textContent = 'Mis à jour à ' + hh + ':' + mm + ':' + ss;
}

/**
 * Bouton « Rafraîchir » : recharge les données avec un retour visible (bouton désactivé
 * le temps de la requête), puis remet le libellé.
 */
async function onRafraichir() {
  const btn = document.getElementById('btn-refresh');
  const texte = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Rafraîchissement…';
  try {
    await charger(false);
  } finally {
    btn.disabled = false;
    btn.textContent = texte;
  }
}

/**
 * Met le titre de la page (bandeau + onglet du navigateur) au nom de l'événement
 * saisi dans l'admin (config.global.tournoi_nom), sinon garde « Le tournoi ».
 */
function majTitre() {
  const nom = (config.global && config.global.tournoi_nom || '').toString().trim();
  const h1 = document.getElementById('titre-tournoi');
  if (h1) h1.textContent = nom || 'Le tournoi';
  document.title = (nom || 'Le tournoi') + ' — Génération R92';
}

/* ==========================================================================
   DERNIERS SCORES — fil des résultats récents du tournoi (en haut de Classements)
   ========================================================================== */

function sectionDerniersScores() {
  const finis = matchs.filter(function (m) {
    return estTermine(m.statut) && String(m.score_A) !== '' && String(m.score_B) !== '';
  });
  let h = '<h2 class="live-titre">📣 Derniers scores</h2>';
  if (!finis.length) return h + '<p class="vide">Aucun score pour l\'instant.</p>';

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

/* ==========================================================================
   📋 MON ÉQUIPE — sélection + matchs + classements de l'équipe
   ========================================================================== */

/**
 * Remplit le menu déroulant des CATÉGORIES (filtre global des deux onglets).
 * Se masque tout seul s'il n'y a qu'une seule catégorie (menu inutile). Fixe `categorieActive`
 * (catégorie mémorisée si toujours présente, sinon la première par ordre alphabétique).
 */
function peuplerCategorie() {
  const bloc = document.getElementById('filtre-categorie');
  const sel = document.getElementById('select-categorie');

  const cats = categoriesPresentes();
  const memo = localStorage.getItem(CLE_CATEGORIE) || '';
  categorieActive = (cats.indexOf(memo) >= 0) ? memo : (cats[0] || '');

  sel.innerHTML = cats.map(function (c) {
    return '<option value="' + echapper(c) + '"' + (c === categorieActive ? ' selected' : '') + '>' +
      echapper(c) + '</option>';
  }).join('');

  bloc.hidden = (cats.length <= 1); // une seule catégorie → menu masqué
}

/** Catégories présentes (celles qui ont au moins une équipe), triées par ordre NUMÉRIQUE
 *  (U8 avant U10 avant U12 — un tri alphabétique classerait « U10 » avant « U8 »). */
function categoriesPresentes() {
  const cats = [];
  equipes.forEach(function (e) { if (e.categorie && cats.indexOf(e.categorie) < 0) cats.push(e.categorie); });
  return cats.sort(comparerCategorie);
}

/** Ordre des catégories : par le nombre qu'elles contiennent (U8 < U10 < U12), sinon alphabétique. */
function comparerCategorie(a, b) {
  const ma = String(a).match(/\d+/), mb = String(b).match(/\d+/);
  if (ma && mb && parseInt(ma[0], 10) !== parseInt(mb[0], 10)) return parseInt(ma[0], 10) - parseInt(mb[0], 10);
  return String(a).localeCompare(String(b));
}

/** Remplit le menu déroulant des équipes DE LA CATÉGORIE ACTIVE, en préservant le choix. */
function peuplerSelect() {
  const sel = document.getElementById('select-equipe');
  const choix = sel.value || localStorage.getItem(CLE_EQUIPE) || '';
  const membres = equipes.filter(function (e) { return e.categorie === categorieActive; })
    .slice().sort(function (a, b) { return String(a.nom_equipe).localeCompare(String(b.nom_equipe)); });

  let html = '<option value="">— Choisis ton équipe —</option>';
  membres.forEach(function (e) {
    html += '<option value="' + echapper(e.id_equipe) + '">' + echapper(e.nom_equipe) + '</option>';
  });
  sel.innerHTML = html;
  // On ne re-sélectionne le choix mémorisé que s'il appartient à la catégorie active.
  if (choix && membres.some(function (e) { return e.id_equipe === choix; })) sel.value = choix;
}

function afficherEquipe() {
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

  const eq = equipes.find(function (x) { return x.id_equipe === id; });
  if (eq) html += sectionClassementsEquipe(eq);
  zone.innerHTML = html;
}

/** Cartes de matchs (triées par heure) du point de vue de l'équipe id. */
function cartes(liste, id) {
  return liste.slice()
    .sort(function (a, b) { return String(a.heure_debut).localeCompare(String(b.heure_debut)); })
    .map(function (m) { return carteMatch(m, id); }).join('');
}

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

/** Les 3 classements affichés sous les matchs de l'équipe : sa poule, son niveau, le général. */
function sectionClassementsEquipe(eq) {
  let html = '';

  // 1) Sa poule du matin.
  const membresPoule = equipes.filter(function (e) { return e.categorie === eq.categorie && e.poule === eq.poule; });
  const matchsMatin = matchs.filter(function (m) { return m.categorie === eq.categorie && String(m.phase) !== 'classement'; });
  html += '<div class="planning-phase">📊 Classement de ta poule (matin)</div>';
  html += tableCompacte('Poule ' + echapper(String(eq.poule)), classementGroupe(matchsMatin, membresPoule), eq.id_equipe);

  // 2) Son niveau d'après-midi (si un match de classement existe pour elle).
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
    html += tableCompacte('Niveau ' + echapper(String(niv)), classementGroupe(matchsNiv, membresNiv), eq.id_equipe);
  }

  // 3) Général du tournoi (croisé final).
  html += '<div class="planning-phase">🏆 Classement général du tournoi</div>';
  html += tableGeneral(classementGeneral(eq.categorie), eq.id_equipe);
  return html;
}

/* ==========================================================================
   🏆 CLASSEMENTS — poules (matin) + niveaux croisés (après-midi), tableaux complets
   ========================================================================== */

function afficherClassements() {
  const zone = document.getElementById('vue-classements');
  const matin = classementParGroupe('matin');

  // En tête : le fil des derniers scores du tournoi (portée « tournoi entier », comme les classements).
  let html = sectionDerniersScores();

  if (!matin.length) {
    zone.innerHTML = html + '<p class="vide">Aucune poule pour le moment.</p>';
    return;
  }

  html += '<div class="planning-phase">🌅 Poules (matin)</div>';
  matin.forEach(function (cat) {
    html += '<h3 class="live-cat">' + echapper(cat.categorie) + '</h3>';
    cat.groupes.forEach(function (g) { html += tableComplete(g.titre, g.classement); });
  });

  const aprem = classementParGroupe('aprem');
  if (aprem.some(function (c) { return c.groupes.length; })) {
    html += '<div class="planning-phase">🏉 Après-midi — classement croisé par niveau</div>';
    aprem.forEach(function (cat) {
      if (!cat.groupes.length) return;
      html += '<h3 class="live-cat">' + echapper(cat.categorie) + '</h3>';
      cat.groupes.forEach(function (g) { html += tableComplete(g.titre, g.classement); });
    });
  }
  zone.innerHTML = html;
}

/**
 * Classement complet par groupe, pour la vue Classements. FILTRÉ sur la catégorie active.
 * @param phase 'matin' → équipes groupées par leur poule, ne compte que les matchs de poule.
 *              'aprem' → équipes groupées par niveau (poule du match = N1/N2…), ne compte que le classement.
 */
function classementParGroupe(phase) {
  const stats = {}, infos = {};
  if (phase === 'matin') {
    equipes.forEach(function (e) {
      if (!e.poule || e.categorie !== categorieActive) return;
      stats[e.id_equipe] = nouveauStats(e.id_equipe, e.nom_equipe);
      infos[e.id_equipe] = { categorie: e.categorie, cle: e.poule };
    });
    matchs.forEach(function (m) {
      if (m.categorie === categorieActive && String(m.phase) !== 'classement') compterMatch(stats, m);
    });
    return regrouper(stats, infos, 'Poule ');
  }
  const ms = matchs.filter(function (m) {
    return m.categorie === categorieActive && String(m.phase) === 'classement';
  });
  ms.forEach(function (m) {
    [m.equipe_A, m.equipe_B].forEach(function (id) {
      if (!stats[id]) { stats[id] = nouveauStats(id); infos[id] = { categorie: m.categorie, cle: m.poule }; }
    });
  });
  ms.forEach(function (m) { compterMatch(stats, m); });
  return regrouper(stats, infos, 'Niveau ');
}

/** Regroupe les stats par catégorie puis par clé (poule ou niveau), trie chaque groupe. */
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

/** Tableau complet : #, Équipe, J, V, N, D, BP, BC, Diff, Pts. */
function tableComplete(titre, liste) {
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

/* ==========================================================================
   CALCULS DE CLASSEMENT (barème commun) + tableaux compacts
   ========================================================================== */

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
function compterMatch(stats, m) {
  if (!estTermine(m.statut)) return;
  const a = stats[m.equipe_A], b = stats[m.equipe_B];
  if (!a || !b) return;
  const sa = Number(m.score_A), sb = Number(m.score_B);
  if (!isFinite(sa) || !isFinite(sb)) return;
  appliquer(a, sa, sb); appliquer(b, sb, sa);
}

/** Classement d'un groupe défini par ses membres (pour la vue « Mon équipe »). */
function classementGroupe(matchsGroupe, membres) {
  const stats = {};
  membres.forEach(function (e) { stats[e.id_equipe] = nouveauStats(e.id_equipe, e.nom_equipe); });
  matchsGroupe.forEach(function (m) { compterMatch(stats, m); });
  return Object.keys(stats).map(function (k) { return stats[k]; }).sort(comparer);
}

/** Numéro de niveau (N1 -> 1) ; 999 si pas de niveau (passe en fin de classement). */
function niveauNum(n) { const m = String(n).match(/(\d+)/); return m ? parseInt(m[1], 10) : 999; }

/**
 * Classement général (croisé final) d'une catégorie : ordonné par NIVEAU (N1 avant N2…),
 * puis par les résultats de l'après-midi, puis (départage) par ceux du matin.
 */
function classementGeneral(categorie) {
  const membres = equipes.filter(function (e) { return e.categorie === categorie && e.poule; });
  const sM = {}, sA = {}, niveau = {};
  membres.forEach(function (e) {
    sM[e.id_equipe] = nouveauStats(e.id_equipe, e.nom_equipe);
    sA[e.id_equipe] = nouveauStats(e.id_equipe, e.nom_equipe);
  });
  matchs.filter(function (m) { return m.categorie === categorie && String(m.phase) !== 'classement'; })
    .forEach(function (m) { compterMatch(sM, m); });
  const matchsAprem = matchs.filter(function (m) { return m.categorie === categorie && String(m.phase) === 'classement'; });
  matchsAprem.forEach(function (m) { compterMatch(sA, m); });
  matchsAprem.forEach(function (m) { niveau[m.equipe_A] = m.poule; niveau[m.equipe_B] = m.poule; });

  return membres.map(function (e) {
    return { id: e.id_equipe, nom: e.nom_equipe, niveau: niveau[e.id_equipe] || '', m: sM[e.id_equipe], a: sA[e.id_equipe] };
  }).sort(function (x, y) {
    const nx = niveauNum(x.niveau), ny = niveauNum(y.niveau);
    if (nx !== ny) return nx - ny;
    return comparer(x.a, y.a) || comparer(x.m, y.m);
  });
}

/* ==========================================================================
   PODIUM CERTAIN — top 3 du classement général, affiché UNIQUEMENT quand il
   est mathématiquement verrouillé (aucun résultat restant ne peut le changer).
   --------------------------------------------------------------------------
   Rappels qui fondent le calcul :
   • Le classement général trie par NIVEAU (figé dès l'après-midi généré),
     puis résultats de l'après-midi, puis (départage) du matin.
   • Barème V=3 / N=2 / D=1 : un match rapporte TOUJOURS entre 1 et 3 points.
   • Les scores sont libres → le goal-average (diff) et les points marqués (bp)
     peuvent basculer avec un gros score. Donc, tant que deux équipes PEUVENT
     encore se rejoindre AUX POINTS, leur ordre n'est pas garanti (un large
     succès pourrait inverser la diff). La certitude n'existe donc que si
     l'écart de points est INATTEIGNABLE, ou si tout est joué.
   ========================================================================== */

/** Nombre de matchs NON terminés d'une équipe, pour une phase donnée. */
function matchsRestants(id, estClassement) {
  return matchs.filter(function (m) {
    const cl = (String(m.phase) === 'classement');
    return cl === estClassement && (m.equipe_A === id || m.equipe_B === id) && !estTermine(m.statut);
  }).length;
}

/**
 * Départage GARANTI sur une clé (après-midi OU matin) entre deux équipes X et Y.
 * sX/sY = stats de la phase ; remX/remY = matchs restants de cette phase.
 * Retourne : 'X' (X devant, certain), 'Y' (Y devant, certain),
 *            'egal' (phase entièrement jouée et strictement à égalité → départage à la clé suivante),
 *            'incertain' (les fourchettes de points se chevauchent et il reste des matchs).
 */
function departageGaranti(sX, sY, remX, remY) {
  const xMin = sX.pts + remX,     xMax = sX.pts + 3 * remX;
  const yMin = sY.pts + remY,     yMax = sY.pts + 3 * remY;
  if (xMin > yMax) return 'X';           // X ne peut plus être rejoint aux points
  if (xMax < yMin) return 'Y';           // Y ne peut plus être rejoint aux points
  // Les fourchettes de points se chevauchent : ordre garanti seulement si TOUT est joué.
  if (remX === 0 && remY === 0) {
    const c = comparer(sX, sY);          // <0 => X devant ; >0 => Y devant ; 0 => égalité stricte
    if (c < 0) return 'X';
    if (c > 0) return 'Y';
    return 'egal';
  }
  return 'incertain';
}

/**
 * Vrai si l'équipe X est GARANTIE devant l'équipe Y dans le classement général,
 * quels que soient les résultats des matchs restants (X, Y = entrées de classementGeneral).
 */
function garantiDevant(X, Y) {
  const nx = niveauNum(X.niveau), ny = niveauNum(Y.niveau);
  if (nx < ny) return true;              // niveau figé : N1 toujours devant N2…
  if (nx > ny) return false;
  // Même niveau → départage après-midi, puis (si égalité stricte) matin.
  const dA = departageGaranti(X.a, Y.a, matchsRestants(X.id, true), matchsRestants(Y.id, true));
  if (dA === 'X') return true;
  if (dA === 'Y' || dA === 'incertain') return false;
  // dA === 'egal' : après-midi joué et à égalité → on départage au matin.
  const dM = departageGaranti(X.m, Y.m, matchsRestants(X.id, false), matchsRestants(Y.id, false));
  return dM === 'X';
}

/**
 * Renvoie le podium (top 3 du classement général) SI et seulement s'il est certain :
 *   - l'après-midi (classement croisé) est généré pour la catégorie ;
 *   - l'ordre interne du trio est garanti ;
 *   - le 3e est garanti devant TOUTES les équipes suivantes (frontière verrouillée).
 * Sinon renvoie null (rien à afficher).
 */
function podiumCertain(categorie) {
  if (!categorie) return null;
  // Pas d'après-midi généré → le classement final n'est pas encore défini.
  const aApresMidi = matchs.some(function (m) {
    return m.categorie === categorie && String(m.phase) === 'classement';
  });
  if (!aApresMidi) return null;

  const G = classementGeneral(categorie);
  if (G.length < 3) return null;                 // pas de podium à 3 sans au moins 3 équipes
  const top = G.slice(0, 3);

  // Ordre interne du podium (1er devant 2e, 2e devant 3e).
  if (!garantiDevant(top[0], top[1])) return null;
  if (!garantiDevant(top[1], top[2])) return null;
  // Frontière : le 3e doit être garanti devant chaque équipe classée après.
  for (let k = 3; k < G.length; k++) {
    if (!garantiDevant(top[2], G[k])) return null;
  }
  return top;
}

/** Tableau compact d'un classement de groupe (poule ou niveau). idSel = équipe surlignée. */
function tableCompacte(titre, liste, idSel) {
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

/* ==========================================================================
   OUTILS
   ========================================================================== */

function nomEquipe(id) {
  const e = equipes.find(function (x) { return x.id_equipe === id; });
  return e ? e.nom_equipe : id;
}

/** Vrai si le statut vaut « terminé », robuste au « é » décomposé (NFD) renvoyé par le Sheet. */
function estTermine(statut) { return /^\s*termin/i.test(String(statut)); }

function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', initTournoi);
