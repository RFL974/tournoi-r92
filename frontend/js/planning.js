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

/** Point d'entrée : on charge les données, on remplit le menu, on affiche. */
async function initPlanning() {
  const sel = document.getElementById('select-equipe');
  try {
    const data = await apiGet('getAll');
    equipes = data.equipes || [];
    matchs = data.matchs || [];
    remplirSelect();

    // On restaure le dernier choix mémorisé, s'il existe encore.
    const memo = localStorage.getItem(CLE_STOCKAGE);
    if (memo && equipes.some(function (e) { return e.id_equipe === memo; })) {
      sel.value = memo;
    }
    afficher();
  } catch (err) {
    document.getElementById('mon-planning').innerHTML =
      '<p class="vide">Erreur de chargement : ' + echapper(err.message) + '</p>';
  }

  sel.addEventListener('change', function () {
    localStorage.setItem(CLE_STOCKAGE, sel.value);
    afficher();
  });
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
