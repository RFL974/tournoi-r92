/**
 * ============================================================================
 *  SAISIE DES SCORES — page dédiée (tables de marque, usage téléphone)
 * ============================================================================
 *
 *  Charge tous les matchs, affiche pour chacun deux champs de score + un bouton
 *  « Valider ». Valider envoie le score au backend (action enregistrerScore) et
 *  passe le match en « terminé ». Un match déjà terminé reste modifiable.
 *
 *  Nécessite (chargés AVANT ce fichier) : config.js puis api.js.
 * ============================================================================
 */

let equipes = [];
let matchs = [];

/** Point d'entrée : on va chercher les données puis on affiche. */
async function initSaisie() {
  const zone = document.getElementById('liste-matchs');
  try {
    const data = await apiGet('getAll');
    equipes = data.equipes || [];
    matchs = data.matchs || [];
    afficherMatchs();
  } catch (err) {
    zone.innerHTML = '<p class="vide">Erreur de chargement : ' + echapper(err.message) + '</p>';
  }
}

/** Nom lisible d'une équipe à partir de son identifiant. */
function nomEquipe(id) {
  const e = equipes.find(function (x) { return x.id_equipe === id; });
  return e ? e.nom_equipe : id;
}

/** Construit la liste des matchs, groupée par catégorie et triée par heure. */
function afficherMatchs() {
  const zone = document.getElementById('liste-matchs');
  if (!matchs.length) {
    zone.innerHTML = '<p class="vide">Aucun match. Génère d\'abord le planning dans l\'admin.</p>';
    return;
  }

  // Catégories dans leur ordre d'apparition.
  const cats = [];
  matchs.forEach(function (m) { if (cats.indexOf(m.categorie) < 0) cats.push(m.categorie); });

  let html = '';
  cats.forEach(function (cat) {
    html += '<h2 style="margin-top:18px;">' + echapper(cat) + '</h2>';
    const ms = matchs.filter(function (m) { return m.categorie === cat; }).slice()
      .sort(function (a, b) { return String(a.heure_debut).localeCompare(String(b.heure_debut)); });
    ms.forEach(function (m) { html += carteMatch(m); });
  });
  zone.innerHTML = html;
}

/** HTML d'une carte de match (méta + saisie des 2 scores + bouton). */
function carteMatch(m) {
  const termine = String(m.statut) === 'terminé';
  const sa = (m.score_A === '' || m.score_A == null) ? '' : m.score_A;
  const sb = (m.score_B === '' || m.score_B == null) ? '' : m.score_B;
  return '' +
    '<div class="match' + (termine ? ' match-termine' : '') + '" data-id="' + echapper(m.id_match) + '">' +
      '<div class="match-meta">' + echapper(m.heure_debut) + ' · Terrain ' + echapper(String(m.terrain)) +
        ' · Poule ' + echapper(String(m.poule)) +
        (termine ? ' · <span class="badge-ok">✓ terminé</span>' : '') + '</div>' +
      '<div class="match-saisie">' +
        '<span class="eq eq-a">' + echapper(nomEquipe(m.equipe_A)) + '</span>' +
        '<input class="r-input score" type="number" min="0" inputmode="numeric" value="' + echapper(String(sa)) + '">' +
        '<span class="vs">vs</span>' +
        '<input class="r-input score" type="number" min="0" inputmode="numeric" value="' + echapper(String(sb)) + '">' +
        '<span class="eq eq-b">' + echapper(nomEquipe(m.equipe_B)) + '</span>' +
        '<button class="bouton bouton-valider" type="button">' + (termine ? 'Modifier' : 'Valider') + '</button>' +
      '</div>' +
      '<div class="message-form"></div>' +
    '</div>';
}

/** Un seul écouteur pour tous les boutons « Valider » (délégation d'événement). */
document.addEventListener('click', async function (evenement) {
  const bouton = evenement.target.closest('.bouton-valider');
  if (!bouton) return;

  const carte = bouton.closest('.match');
  const id = carte.getAttribute('data-id');
  const inputs = carte.querySelectorAll('.score');
  const msg = carte.querySelector('.message-form');
  const scoreA = inputs[0].value.trim();
  const scoreB = inputs[1].value.trim();

  if (scoreA === '' || scoreB === '') {
    afficherMessage(msg, 'Entre les deux scores.', 'ko');
    return;
  }

  bouton.disabled = true;
  try {
    const res = await apiPost('enregistrerScore', { id_match: id, score_A: scoreA, score_B: scoreB });
    // On met à jour la copie locale pour rester cohérent sans recharger la page.
    const m = matchs.find(function (x) { return x.id_match === id; });
    if (m) { m.score_A = res.match.score_A; m.score_B = res.match.score_B; m.statut = 'terminé'; }
    carte.classList.add('match-termine');
    bouton.textContent = 'Modifier';
    afficherMessage(msg, 'Score enregistré ✓', 'ok');
  } catch (err) {
    afficherMessage(msg, err.message, 'ko');
  } finally {
    bouton.disabled = false;
  }
});

/* --------------------------------------------------------------------------
   PETITES AIDES (identiques à admin.js pour rester cohérent)
   -------------------------------------------------------------------------- */

/** Affiche un message de retour (succès/erreur) sous le match. */
function afficherMessage(element, texte, type) {
  element.textContent = texte;
  element.className = 'message-form ' + (type === 'ok' ? 'ok' : 'ko');
}

/** Neutralise les caractères spéciaux HTML (sécurité d'affichage). */
function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* On lance tout une fois la page prête. */
document.addEventListener('DOMContentLoaded', initSaisie);
