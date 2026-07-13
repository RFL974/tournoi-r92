/**
 * ============================================================================
 *  CLASSEMENT — page dédiée (lecture seule)
 * ============================================================================
 *
 *  Affiche le classement de chaque poule (calculé côté backend par
 *  calculerClassement), groupé par catégorie. Barème : V=3 / N=2 / D=1,
 *  départage à la différence (BP − BC) puis aux points marqués.
 *
 *  Nécessite (chargés AVANT ce fichier) : config.js puis api.js.
 * ============================================================================
 */

/** Point d'entrée : on va chercher le classement puis on l'affiche. */
async function initClassement() {
  const zone = document.getElementById('classement');
  try {
    const data = await apiGet('getClassement');
    afficherClassement(data);
  } catch (err) {
    zone.innerHTML = '<p class="vide">Erreur de chargement : ' + echapper(err.message) + '</p>';
  }
}

/** Construit un tableau de classement par catégorie puis par poule. */
function afficherClassement(cats) {
  const zone = document.getElementById('classement');
  cats = cats || [];
  if (!cats.length) {
    zone.innerHTML = '<p class="vide">Aucune poule. Génère d\'abord le planning dans l\'admin.</p>';
    return;
  }

  let html = '';
  cats.forEach(function (cat) {
    html += '<h2 style="margin-top:18px;">' + echapper(cat.categorie) + '</h2>';
    (cat.poules || []).forEach(function (p) {
      html += '<h3 style="color:var(--bleu-ciel);margin:14px 0 6px;">Poule ' + echapper(p.nom_poule) + '</h3>';
      html += '<div class="table-scroll"><table class="table-planning table-classement">' +
        '<thead><tr><th>#</th><th>Équipe</th><th>J</th><th>V</th><th>N</th><th>D</th>' +
        '<th>BP</th><th>BC</th><th>Diff</th><th>Pts</th></tr></thead><tbody>';
      (p.classement || []).forEach(function (t, i) {
        const diff = (t.diff > 0 ? '+' : '') + t.diff;
        html += '<tr>' +
          '<td>' + (i + 1) + '</td>' +
          '<td class="col-equipe">' + echapper(t.nom_equipe) + '</td>' +
          '<td>' + t.j + '</td><td>' + t.v + '</td><td>' + t.n + '</td><td>' + t.d + '</td>' +
          '<td>' + t.bp + '</td><td>' + t.bc + '</td><td>' + echapper(diff) + '</td>' +
          '<td class="col-pts">' + t.pts + '</td>' +
        '</tr>';
      });
      html += '</tbody></table></div>';
    });
  });
  zone.innerHTML = html;
}

/** Neutralise les caractères spéciaux HTML (sécurité d'affichage). */
function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* On lance tout une fois la page prête. */
document.addEventListener('DOMContentLoaded', initClassement);
