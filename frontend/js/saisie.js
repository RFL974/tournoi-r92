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
let categorieActiveSaisie = '';
const CLE_CAT_SAISIE = 'r92_saisie_cat';

/** Point d'entrée : on va chercher les données puis on affiche. */
async function initSaisie() {
  const zone = document.getElementById('liste-matchs');

  // Changement de catégorie (le <select> est statique dans le HTML, on l'écoute une fois).
  const sel = document.getElementById('select-cat-saisie');
  if (sel) sel.addEventListener('change', function (e) {
    categorieActiveSaisie = e.target.value;
    localStorage.setItem(CLE_CAT_SAISIE, categorieActiveSaisie);
    afficherMatchs();
  });

  // Bouton « Rafraîchir » : recharge les saisies faites sur les autres appareils.
  const btnMaj = document.getElementById('bouton-rafraichir-saisie');
  if (btnMaj) btnMaj.addEventListener('click', rafraichirSaisie);

  try {
    const data = await apiGet('getAll');
    equipes = data.equipes || [];
    matchs = data.matchs || [];
    afficherMatchs();
    majHeureSaisie();
  } catch (err) {
    zone.innerHTML = '<p class="vide">Erreur de chargement : ' + echapper(err.message) + '</p>';
  }
  // « Connexion » : on demande la clé scores une fois à l'ouverture (puis mémorisée).
  await connexion('scores', 'de saisie des scores');
}

/**
 * Recharge les matchs depuis le backend et réaffiche la table de marque.
 * ⚠️ Réaffiche la liste : un score en cours de frappe (non validé) serait perdu — c'est
 * pourquoi c'est un bouton manuel (on rafraîchit quand on ne saisit rien).
 */
async function rafraichirSaisie() {
  const bouton = document.getElementById('bouton-rafraichir-saisie');
  const texte = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = '⏳ …';
  try {
    const data = await apiGet('getAll');
    equipes = data.equipes || [];
    matchs = data.matchs || [];
    afficherMatchs();
    majHeureSaisie();
  } catch (err) {
    // On garde l'affichage actuel en cas d'erreur réseau.
  } finally {
    bouton.disabled = false;
    bouton.textContent = texte;
  }
}

/** Affiche l'heure de la dernière mise à jour des données. */
function majHeureSaisie() {
  const el = document.getElementById('maj-saisie');
  if (el) el.textContent = 'Mis à jour à ' + new Date().toLocaleTimeString('fr-FR');
}

/** Ordre des catégories : par le nombre qu'elles contiennent (U8 < U10 < U12), sinon alphabétique. */
function comparerCategorie(a, b) {
  const ma = String(a).match(/\d+/), mb = String(b).match(/\d+/);
  if (ma && mb && parseInt(ma[0], 10) !== parseInt(mb[0], 10)) return parseInt(ma[0], 10) - parseInt(mb[0], 10);
  return String(a).localeCompare(String(b));
}

/**
 * Remplit le menu déroulant des catégories et fixe la catégorie active (mémorisée si
 * toujours présente, sinon la première). Le menu se masque s'il n'y a qu'une catégorie.
 */
function peuplerFiltreCat() {
  const bloc = document.getElementById('filtre-cat-saisie');
  const sel = document.getElementById('select-cat-saisie');
  const cats = [];
  matchs.forEach(function (m) { if (cats.indexOf(m.categorie) < 0) cats.push(m.categorie); });
  cats.sort(comparerCategorie);

  const memo = localStorage.getItem(CLE_CAT_SAISIE) || '';
  categorieActiveSaisie = (cats.indexOf(memo) >= 0) ? memo : (cats[0] || '');

  sel.innerHTML = cats.map(function (c) {
    return '<option value="' + echapper(c) + '"' + (c === categorieActiveSaisie ? ' selected' : '') + '>' +
      echapper(c) + '</option>';
  }).join('');
  bloc.hidden = (cats.length <= 1);
}

/** Nom lisible d'une équipe à partir de son identifiant. */
function nomEquipe(id) {
  const e = equipes.find(function (x) { return x.id_equipe === id; });
  return e ? e.nom_equipe : id;
}

/** Libellé français d'un tour de bracket (Coupe). */
function libelleTourFr(tour) {
  switch (String(tour)) {
    case 'FINALE': return 'Finale';
    case 'DEMI_FINALE': return 'Demi-finale';
    case 'PETITE_FINALE': return 'Petite finale';
    case 'QUART_DE_FINALE': return 'Quart de finale';
    case 'HUITIEME_DE_FINALE': return 'Huitième de finale';
    case 'SEIZIEME_DE_FINALE': return 'Seizième de finale';
    default: return String(tour || '');
  }
}

/** Vrai si le match est un match de Coupe (élimination directe). */
function estMatchCoupe(m) {
  return String(m.sous_tableau || '').toUpperCase() === 'COUPE';
}

/** Vrai si un match de Coupe est « en attente » : une des deux équipes n'est pas encore connue. */
function estEnAttente(m) {
  return estMatchCoupe(m) && (!m.equipe_A || !m.equipe_B);
}

/**
 * Titre lisible d'un match, affiché au bénévole pour qu'il comprenne l'enjeu :
 *  Coupe → « 🏆 Demi-finale — Coupe U12 » ; Plateau → « Plateau — U12 » ;
 *  Libre → « Match amical » ; Croisé → « Niveau 3 » ; Matin → « Poule A ».
 */
function contexteMatch(m) {
  if (estMatchCoupe(m)) return '🏆 ' + (libelleTourFr(m.tour) || 'Coupe') + ' — Coupe ' + m.categorie;
  if (String(m.sous_tableau || '').toUpperCase() === 'PLATEAU') return 'Plateau — ' + m.categorie;
  if (String(m.format || '').toUpperCase() === 'LIBRE') return 'Match amical';
  if (String(m.phase) === 'classement') return 'Niveau ' + String(m.poule);
  return 'Poule ' + String(m.poule);
}

/** Rend les cartes d'une liste de matchs, triées par heure. */
function cartesMatchs(liste) {
  return liste.slice()
    .sort(function (a, b) { return String(a.heure_debut).localeCompare(String(b.heure_debut)); })
    .map(carteMatch).join('');
}

/** Rend une phase (matin ou après-midi) dans un accordéon. `replie` = fermé par défaut. */
function phaseAccordeon(titre, liste, replie, resume) {
  return '<details class="phase-accordeon"' + (replie ? '' : ' open') + '>' +
    '<summary class="planning-phase phase-sommaire">' + titre +
      ' <span class="phase-resume">(' + resume + ')</span></summary>' +
    '<div class="phase-contenu">' + cartesMatchs(liste) + '</div>' +
  '</details>';
}

/** Résumé affiché à côté du titre d'une phase (nombre restant / tout saisi). */
function resumePhase(restants, total) {
  return (restants === 0)
    ? 'tous saisis ✓ — cliquer pour voir / corriger'
    : restants + ' à saisir sur ' + total;
}

/**
 * Après une validation/correction, met à jour EN DIRECT l'accordéon de la phase du match :
 *   - décrémente le compteur « X à saisir » ;
 *   - replie la phase dès que son dernier score est saisi (après-midi → toujours ;
 *     matin → uniquement si l'après-midi est déjà généré).
 * Chirurgical : on ne réaffiche pas toute la liste (aucune saisie en cours n'est perdue).
 */
function majAccordeonPhase(carte) {
  const det = carte.closest('details.phase-accordeon');
  if (!det) return;
  const m = matchs.find(function (x) { return x.id_match === carte.getAttribute('data-id'); });
  if (!m) return;

  const estClassement = String(m.phase) === 'classement';
  const memePhase = matchs.filter(function (x) {
    return x.categorie === categorieActiveSaisie && (String(x.phase) === 'classement') === estClassement;
  });
  const restants = memePhase.filter(function (x) { return !estTermine(x.statut); }).length;
  const apremGenere = matchs.some(function (x) {
    return x.categorie === categorieActiveSaisie && String(x.phase) === 'classement';
  });

  // Compteur à jour (mêmes libellés que l'affichage initial).
  let resume;
  if (restants > 0) {
    resume = restants + ' à saisir sur ' + memePhase.length;
  } else if (estClassement) {
    resume = 'tous saisis ✓ — cliquer pour voir / corriger';
  } else {
    resume = 'tous saisis ✓' + (apremGenere ? ' — cliquer pour voir / corriger' : '');
  }
  const span = det.querySelector('.phase-resume');
  if (span) span.textContent = '(' + resume + ')';

  // Repli automatique quand la phase est bouclée.
  const replie = (restants === 0) && (estClassement || apremGenere);
  if (replie) det.open = false;
}

/**
 * Affiche la table de marque de LA catégorie active : matin (dans un accordéon) puis
 * après-midi. Le matin est replié par défaut uniquement quand il est ENTIÈREMENT saisi
 * ET que l'après-midi est généré (on le range pour se concentrer sur l'après-midi), mais
 * il reste ré-ouvrable d'un clic et ses scores restent corrigeables.
 */
function afficherMatchs() {
  const zone = document.getElementById('liste-matchs');
  if (!matchs.length) {
    document.getElementById('filtre-cat-saisie').hidden = true;
    zone.innerHTML = '<p class="vide">Aucun match. Génère d\'abord le planning dans l\'admin.</p>';
    return;
  }

  peuplerFiltreCat(); // remplit le menu + fixe categorieActiveSaisie

  const ms = matchs.filter(function (m) { return m.categorie === categorieActiveSaisie; });
  const matin = ms.filter(function (m) { return String(m.phase) !== 'classement'; });
  const aprem = ms.filter(function (m) { return String(m.phase) === 'classement'; });

  const restantsMatin = matin.filter(function (m) { return !estTermine(m.statut); }).length;
  const restantsAprem = aprem.filter(function (m) { return !estTermine(m.statut); }).length;
  const apremGenere = aprem.length > 0;

  let html = '';

  if (matin.length) {
    // Le matin se replie une fois entièrement saisi ET l'après-midi généré.
    const replie = (restantsMatin === 0) && apremGenere;
    const resume = (restantsMatin === 0)
      ? 'tous saisis ✓' + (apremGenere ? ' — cliquer pour voir / corriger' : '')
      : restantsMatin + ' à saisir sur ' + matin.length;
    html += phaseAccordeon('🌅 Matin — poules', matin, replie, resume);
  }

  if (aprem.length) {
    // L'après-midi se replie quand tous ses matchs sont terminés (journée bouclée).
    const replie = (restantsAprem === 0);
    html += phaseAccordeon(titreApresMidi(aprem), aprem, replie,
      resumePhase(restantsAprem, aprem.length));
  }

  if (!matin.length && !aprem.length) {
    html = '<p class="vide">Aucun match pour cette catégorie.</p>';
  }

  zone.innerHTML = html;
}

/** Titre de l'accordéon après-midi, selon le format des matchs de la catégorie affichée. */
function titreApresMidi(aprem) {
  const formats = {};
  aprem.forEach(function (m) { formats[String(m.format || '').toUpperCase()] = true; });
  if (formats.COUPE_PLATEAU) return '🏉 Après-midi — Coupe & Plateau';
  if (formats.LIBRE) return '🏉 Après-midi — matchs amicaux';
  return '🏉 Après-midi — classement croisé';
}

/** HTML d'une carte de match (contexte + saisie des 2 scores + départage + bouton). */
function carteMatch(m) {
  const contexte = contexteMatch(m);
  const coupe = estMatchCoupe(m);
  const libre = String(m.format || '').toUpperCase() === 'LIBRE';

  // Match de Coupe « en attente » : les 2 équipes ne sont pas encore connues → non saisissable.
  if (estEnAttente(m)) {
    return '' +
      '<div class="match match-attente" data-id="' + echapper(m.id_match) + '">' +
        '<div class="match-meta">' + echapper(m.heure_debut) + ' · Terrain ' + echapper(String(m.terrain)) +
          ' · ' + echapper(contexte) + '</div>' +
        '<div class="bandeau-attente">⏳ <strong>En attente</strong> : les deux équipes ne sont pas encore ' +
          'connues. Ce match se débloquera dès que les matchs précédents seront saisis.</div>' +
      '</div>';
  }

  const termine = estTermine(m.statut);
  const sa = (m.score_A === '' || m.score_A == null) ? '' : m.score_A;
  const sb = (m.score_B === '' || m.score_B == null) ? '' : m.score_B;

  // Bandeau contextuel : amical (LIBRE) ou avertissement élimination directe (COUPE).
  let bandeau = '';
  if (libre) bandeau = '<div class="bandeau-amical">🎈 Match amical — sans classement (juste du temps de jeu)</div>';
  else if (coupe) bandeau = '<div class="bandeau-coupe">⚔️ Élimination directe : un vainqueur est obligatoire.</div>';

  // Départage (COUPE) : radios pour désigner le vainqueur en cas d'égalité au score.
  let departage = '';
  if (coupe) {
    const grp = 'vainqueur-' + echapper(m.id_match);
    const vA = (String(m.vainqueur) === String(m.equipe_A)) ? ' checked' : '';
    const vB = (String(m.vainqueur) === String(m.equipe_B)) ? ' checked' : '';
    const dis = termine ? ' disabled' : '';
    departage =
      '<div class="departage">' +
        '<span class="departage-lib">En cas d\'égalité, vainqueur :</span>' +
        '<label class="departage-opt"><input type="radio" name="' + grp + '" value="A"' + vA + dis + '> ' +
          echapper(nomEquipe(m.equipe_A)) + '</label>' +
        '<label class="departage-opt"><input type="radio" name="' + grp + '" value="B"' + vB + dis + '> ' +
          echapper(nomEquipe(m.equipe_B)) + '</label>' +
      '</div>';
  }

  return '' +
    '<div class="match' + (termine ? ' match-termine' : '') + (coupe ? ' match-coupe' : '') +
        '" data-id="' + echapper(m.id_match) + '">' +
      '<div class="match-meta">' + echapper(m.heure_debut) + ' · Terrain ' + echapper(String(m.terrain)) +
        ' · ' + echapper(contexte) +
        (termine ? ' · <span class="badge-ok">✓ terminé</span>' : '') + '</div>' +
      bandeau +
      '<div class="match-saisie">' +
        '<div class="eq-ligne">' +
          '<span class="eq">' + echapper(nomEquipe(m.equipe_A)) + '</span>' +
          '<input class="r-input score" type="number" min="0" inputmode="numeric" value="' + echapper(String(sa)) + '"' + (termine ? ' disabled' : '') + '>' +
        '</div>' +
        '<div class="eq-ligne">' +
          '<span class="eq">' + echapper(nomEquipe(m.equipe_B)) + '</span>' +
          '<input class="r-input score" type="number" min="0" inputmode="numeric" value="' + echapper(String(sb)) + '"' + (termine ? ' disabled' : '') + '>' +
        '</div>' +
        departage +
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

  // 1) Score validé (définitif) et verrouillé → « Corriger » redemande la clé scores
  //    (confirmation forte), puis déverrouille les champs sans encore rien envoyer.
  if (verrouille) {
    const cle = await demanderCleValide('scores', '🔒 Corriger un score définitif\n\nEntre la clé scores :');
    if (cle == null) return; // annulé → le score reste verrouillé
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

  const m = matchs.find(function (x) { return x.id_match === id; });
  const coupe = carte.classList.contains('match-coupe');

  // Départage (COUPE) : traduit le radio A/B coché en identifiant d'équipe désignée vainqueur.
  let vainqueur = '';
  if (coupe && m) {
    const r = carte.querySelector('input[name^="vainqueur-"]:checked');
    if (r) vainqueur = (r.value === 'B') ? m.equipe_B : m.equipe_A;
  }

  // Envoi (facteur commun) : une correction porte modification:true ; une cascade forcerCascade:true.
  async function envoyer(forcerCascade) {
    const data = { id_match: id, score_A: scoreA, score_B: scoreB, modification: enEdition };
    if (coupe && vainqueur) data.vainqueur = vainqueur;
    if (forcerCascade) data.forcerCascade = true;
    return apiPostProtege('enregistrerScore', data, 'scores', 'de saisie des scores');
  }

  bouton.disabled = true;
  try {
    let res;
    try {
      res = await envoyer(false);
    } catch (err) {
      const info = err.reponse || {};
      // Correction en cascade : le résultat était déjà propagé vers un match lui-même joué.
      if (info.cascade_requise) {
        const ok = await dialogConfirmer(
          '⚠️ ' + err.message + '\n\nConfirmer la modification en cascade ?',
          { ok: 'Modifier quand même', annuler: 'Annuler', danger: true });
        if (!ok) { afficherMessage(msg, 'Correction annulée.', 'ko'); bouton.disabled = false; return; }
        res = await envoyer(true); // on réapplique en forçant la cascade
      } else {
        throw err; // départage requis, clé, etc. → message affiché plus bas
      }
    }

    // Score enregistré. En COUPE, la propagation a modifié d'autres matchs → on recharge la
    // liste pour que l'équipe gagnante apparaisse tout de suite dans le match suivant.
    if (m) { m.score_A = res.match.score_A; m.score_B = res.match.score_B; m.statut = 'terminé'; }
    if (coupe) {
      verrouiller(carte);
      afficherMessage(msg, 'Score enregistré ✓ — vainqueur propagé.', 'ok');
      await rafraichirSaisie(); // met à jour les matchs suivants (finale, petite finale…)
      return;
    }

    verrouiller(carte);
    afficherMessage(msg, 'Score enregistré ✓', 'ok');
    majAccordeonPhase(carte); // compteur à jour + repli auto dès le dernier score de la phase

    // Cohérence après-midi : corriger un score du MATIN alors que l'après-midi est déjà généré
    // peut fausser les niveaux (calculés sur le classement du matin). On alerte pour que
    // l'organisateur régénère l'après-midi.
    const estMatin = m && String(m.phase) !== 'classement';
    const apremGenere = matchs.some(function (x) { return String(x.phase) === 'classement'; });
    if (enEdition && estMatin && apremGenere) {
      await dialogAlerter(
        '⚠️ Tu viens de CORRIGER un score du matin, mais l\'après-midi est déjà généré.\n\n' +
        'Le classement du matin a peut-être changé → les niveaux de l\'après-midi risquent d\'être faussés.\n\n' +
        'Préviens l\'organisateur : il doit RÉGÉNÉRER l\'après-midi (page admin) pour rétablir les bons niveaux.');
    }
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
