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

  // Rend les cartes d'une liste de matchs, triées par heure.
  function cartes(liste) {
    return liste.slice()
      .sort(function (a, b) { return String(a.heure_debut).localeCompare(String(b.heure_debut)); })
      .map(carteMatch).join('');
  }

  let html = '';
  cats.forEach(function (cat) {
    html += '<h2 style="margin-top:18px;">' + echapper(cat) + '</h2>';
    const ms = matchs.filter(function (m) { return m.categorie === cat; });
    const matin = ms.filter(function (m) { return String(m.phase) !== 'classement'; });
    const aprem = ms.filter(function (m) { return String(m.phase) === 'classement'; });
    if (matin.length) {
      html += '<div class="planning-phase">🌅 Matin — poules</div>';
      html += cartes(matin);
    }
    if (aprem.length) {
      html += '<div class="planning-phase">🏉 Après-midi — classement croisé</div>';
      html += cartes(aprem);
    }
  });
  zone.innerHTML = html;
}

/** HTML d'une carte de match (méta + saisie des 2 scores + bouton). */
function carteMatch(m) {
  const termine = estTermine(m.statut);
  const sa = (m.score_A === '' || m.score_A == null) ? '' : m.score_A;
  const sb = (m.score_B === '' || m.score_B == null) ? '' : m.score_B;
  const libellePoule = (String(m.phase) === 'classement' ? 'Niveau ' : 'Poule ') + String(m.poule);
  return '' +
    '<div class="match' + (termine ? ' match-termine' : '') + '" data-id="' + echapper(m.id_match) + '">' +
      '<div class="match-meta">' + echapper(m.heure_debut) + ' · Terrain ' + echapper(String(m.terrain)) +
        ' · ' + echapper(libellePoule) +
        (termine ? ' · <span class="badge-ok">✓ terminé</span>' : '') + '</div>' +
      '<div class="match-saisie">' +
        '<span class="eq eq-a">' + echapper(nomEquipe(m.equipe_A)) + '</span>' +
        '<input class="r-input score" type="number" min="0" inputmode="numeric" value="' + echapper(String(sa)) + '"' + (termine ? ' disabled' : '') + '>' +
        '<span class="vs">vs</span>' +
        '<input class="r-input score" type="number" min="0" inputmode="numeric" value="' + echapper(String(sb)) + '"' + (termine ? ' disabled' : '') + '>' +
        '<span class="eq eq-b">' + echapper(nomEquipe(m.equipe_B)) + '</span>' +
        '<button class="bouton bouton-valider" type="button">' + (termine ? 'Corriger' : 'Valider') + '</button>' +
      '</div>' +
      '<div class="message-form"></div>' +
    '</div>';
}

/** Un seul écouteur pour tous les boutons « Valider / Corriger » (délégation d'événement). */
document.addEventListener('click', async function (evenement) {
  const bouton = evenement.target.closest('.bouton-valider');
  if (!bouton) return;

  const carte = bouton.closest('.match');
  const msg = carte.querySelector('.message-form');
  const enEdition = carte.classList.contains('match-edition');
  const verrouille = carte.classList.contains('match-termine') && !enEdition;

  // 1) Score validé (définitif) et verrouillé → « Corriger » demande une confirmation
  //    puis déverrouille les champs, sans encore rien envoyer.
  if (verrouille) {
    if (!confirm('Ce score est validé (définitif).\nLe corriger ?')) return;
    deverrouiller(carte);
    afficherMessage(msg, 'Corrige le score puis valide.', 'ok');
    return;
  }

  // 2) Validation d'un nouveau score OU d'une correction.
  const inputs = carte.querySelectorAll('.score');
  const id = carte.getAttribute('data-id');
  const scoreA = inputs[0].value.trim();
  const scoreB = inputs[1].value.trim();
  if (scoreA === '' || scoreB === '') {
    afficherMessage(msg, 'Entre les deux scores.', 'ko');
    return;
  }

  bouton.disabled = true;
  try {
    // Une correction (mode édition) porte modification:true → autorisée à écraser le définitif.
    const res = await apiPostProtege('enregistrerScore',
      { id_match: id, score_A: scoreA, score_B: scoreB, modification: enEdition },
      'scores', 'de saisie des scores');
    // Mise à jour de la copie locale pour rester cohérent sans recharger la page.
    const m = matchs.find(function (x) { return x.id_match === id; });
    if (m) { m.score_A = res.match.score_A; m.score_B = res.match.score_B; m.statut = 'terminé'; }
    verrouiller(carte);
    afficherMessage(msg, 'Score enregistré ✓', 'ok');
  } catch (err) {
    afficherMessage(msg, err.message, 'ko');
  } finally {
    bouton.disabled = false;
  }
});

/** Passe une carte en mode correction : champs déverrouillés, bouton « Valider la correction ». */
function deverrouiller(carte) {
  carte.classList.add('match-edition');
  carte.querySelectorAll('.score').forEach(function (i) { i.disabled = false; });
  carte.querySelector('.bouton-valider').textContent = 'Valider la correction';
}

/** Verrouille une carte (score définitif) : champs grisés, bouton « Corriger », badge terminé. */
function verrouiller(carte) {
  carte.classList.remove('match-edition');
  carte.classList.add('match-termine');
  carte.querySelectorAll('.score').forEach(function (i) { i.disabled = true; });
  carte.querySelector('.bouton-valider').textContent = 'Corriger';
  // Ajoute le badge « ✓ terminé » s'il n'y est pas encore.
  const meta = carte.querySelector('.match-meta');
  if (meta && meta.querySelector('.badge-ok') == null) {
    meta.insertAdjacentHTML('beforeend', ' · <span class="badge-ok">✓ terminé</span>');
  }
}

/* --------------------------------------------------------------------------
   PETITES AIDES (identiques à admin.js pour rester cohérent)
   -------------------------------------------------------------------------- */

/** Affiche un message de retour (succès/erreur) sous le match. */
function afficherMessage(element, texte, type) {
  element.textContent = texte;
  element.className = 'message-form ' + (type === 'ok' ? 'ok' : 'ko');
}

/**
 * Vrai si le statut vaut « terminé », quelle que soit la forme du « é » (NFC/NFD).
 * Le Sheet peut renvoyer un « é » décomposé ; on teste le préfixe ASCII « termin ».
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
document.addEventListener('DOMContentLoaded', initSaisie);
