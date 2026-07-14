/**
 * ============================================================================
 *  PERFS RACING — page interne (lecture seule, « juste pour nous »)
 * ============================================================================
 *
 *  Deux onglets :
 *   • « Ce tournoi » — les équipes DU RACING sur le tournoi EN COURS :
 *       bilan chiffré, CONTRE QUI on gagne/perd, et À QUEL MOMENT (frise horaire).
 *   • « Saison » — le CUMUL de la saison lu dans l'onglet Historique : pour chaque
 *       adversaire, toutes les rencontres additionnées (on croise souvent les mêmes
 *       équipes plusieurs fois dans l'année).
 *  Tout est classé par catégorie (U8, U10, …).
 *
 *  Repérage des équipes du Racing : leur NOM contient le mot-clé ci-dessous
 *  (insensible à la casse). Change simplement MOT_CLE_CLUB si un jour le club
 *  est nommé autrement dans le Sheet (ex : "R92").
 *
 *  Nécessite (chargés AVANT ce fichier) : config.js puis api.js.
 * ============================================================================
 */

/** 🔧 Mot-clé qui identifie une équipe du club dans son nom (casse ignorée). */
const MOT_CLE_CLUB = 'racing';

let equipes = [];
let matchs = [];
let historique = [];
const INTERVALLE_MS = 60000;
let derniereSignature = '';

/** Point d'entrée : onglets + chargement initial + rafraîchissement automatique. */
async function initPerfs() {
  document.getElementById('onglet-tournoi').addEventListener('click', function () { basculer('tournoi'); });
  document.getElementById('onglet-saison').addEventListener('click', function () { basculer('saison'); });

  const btn = document.getElementById('btn-refresh-perfs');
  if (btn) btn.addEventListener('click', function () { charger(false); });

  await charger(true);
  setInterval(function () { charger(false); }, INTERVALLE_MS);
}

/** Bascule d'onglet (affiche/masque les deux vues). */
function basculer(cible) {
  document.getElementById('onglet-tournoi').classList.toggle('actif', cible === 'tournoi');
  document.getElementById('onglet-saison').classList.toggle('actif', cible === 'saison');
  document.getElementById('vue-tournoi').hidden = (cible !== 'tournoi');
  document.getElementById('vue-saison').hidden = (cible !== 'saison');
}

/** (Re)charge tournoi en cours (getAll) + saison (getHistorique). Ne réaffiche que si ça change. */
async function charger(premier) {
  try {
    const data = await apiGet('getAll');
    // L'historique peut ne pas être dispo (backend pas encore redéployé) : on tolère
    // l'échec pour que « Ce tournoi » fonctionne toujours ; « Saison » sera juste vide.
    let hist = [];
    try { hist = await apiGet('getHistorique'); } catch (e) { hist = []; }

    const signature = JSON.stringify(data.matchs) + '|' + JSON.stringify(data.equipes) + '|' + JSON.stringify(hist);
    equipes = data.equipes || [];
    matchs = data.matchs || [];
    historique = Array.isArray(hist) ? hist : [];
    majHeure();

    if (premier || signature !== derniereSignature) {
      derniereSignature = signature;
      afficherTournoi();
      afficherSaison();
    }
  } catch (err) {
    if (premier) {
      document.getElementById('vue-tournoi').innerHTML =
        '<p class="vide">Erreur de chargement : ' + echapper(err.message) + '</p>';
    }
  }
}

/** Affiche l'heure de dernière mise à jour. */
function majHeure() {
  const el = document.getElementById('maj-perfs');
  if (!el) return;
  const d = new Date();
  el.textContent = 'Mis à jour à ' +
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') +
    ':' + String(d.getSeconds()).padStart(2, '0');
}

/** Vrai si un nom d'équipe appartient au club recherché. */
function estDuClub(nom) {
  return String(nom).toLowerCase().indexOf(MOT_CLE_CLUB) >= 0;
}

/** Nom d'une équipe à partir de son identifiant (pour le tournoi en cours). */
function nomEquipe(id) {
  const e = equipes.find(function (x) { return x.id_equipe === id; });
  return e ? e.nom_equipe : id;
}

/* ==========================================================================
   VUE « CE TOURNOI » — données live (getAll), par identifiant d'équipe
   ========================================================================== */

function afficherTournoi() {
  const zone = document.getElementById('vue-tournoi');
  const nôtres = equipes.filter(function (e) { return estDuClub(e.nom_equipe); });

  if (!nôtres.length) {
    zone.innerHTML = '<p class="vide">Aucune équipe « ' + echapper(MOT_CLE_CLUB) +
      ' » dans ce tournoi. Vérifie le nom des équipes (ou le mot-clé en haut de perfs.js).</p>';
    return;
  }

  const cats = categoriesTriees(nôtres.map(function (e) { return e.categorie; }));
  let html = bilanGlobalTournoi(nôtres);

  cats.forEach(function (cat) {
    html += '<div class="perfs-cat">' + echapper(cat) + '</div>';
    nôtres.filter(function (e) { return e.categorie === cat; })
      .slice().sort(function (a, b) { return String(a.nom_equipe).localeCompare(String(b.nom_equipe)); })
      .forEach(function (e) { html += carteEquipeTournoi(e); });
  });

  zone.innerHTML = html;
}

/** Bandeau récap du tournoi en cours : V/N/D, %, et matin vs après-midi. */
function bilanGlobalTournoi(nôtres) {
  const ids = {};
  nôtres.forEach(function (e) { ids[e.id_equipe] = 1; });
  let v = 0, n = 0, d = 0, matin = { v: 0, t: 0 }, aprem = { v: 0, t: 0 };

  matchsJouesLive().forEach(function (m) {
    const estA = ids[m.equipe_A], estB = ids[m.equipe_B];
    if (!estA && !estB) return;
    const vue = pointDeVue(m, estA ? m.equipe_A : m.equipe_B);
    const issue = issueDe(vue);
    if (issue === 'gagne') v++; else if (issue === 'nul') n++; else d++;
    const bloc = String(m.phase) === 'classement' ? aprem : matin;
    bloc.t++; if (issue === 'gagne') bloc.v++;
  });

  const total = v + n + d;
  return blocBilan('Bilan du tournoi', total, v, n, d,
    momentPuce('🌅 Matin', matin) + momentPuce('🏉 Après-midi', aprem));
}

/** Carte d'une équipe (tournoi en cours) : bilan + frise « à quel moment » + « contre qui ». */
function carteEquipeTournoi(e) {
  const joues = matchsDe(e.id_equipe).filter(function (m) { return estTermine(m.statut) && scoresValides(m); });
  const vues = joues.map(function (m) {
    const vue = pointDeVue(m, e.id_equipe);
    return { pour: vue.pour, contre: vue.contre, adversaire: nomEquipe(vue.adversaire),
             heure: m.heure_debut, terrain: m.terrain, phase: m.phase, issue: issueDe(vue) };
  });

  let html = '<div class="perfs-equipe">';
  html += '<div class="perfs-equipe-nom">' + echapper(e.nom_equipe) +
    ' <span class="perfs-poule">poule ' + echapper(String(e.poule || '?')) + '</span></div>';
  html += ligneBilan(vues);

  if (!vues.length) {
    return html + '<p class="vide">Aucun match terminé pour le moment.</p></div>';
  }

  const tri = vues.slice().sort(function (a, b) { return String(a.heure).localeCompare(String(b.heure)); });
  html += '<div class="perfs-sous-titre">À quel moment</div>' + friseHoraire(tri);
  html += '<div class="perfs-sous-titre">Contre qui</div>' + listeAdversaires(tri);
  return html + '</div>';
}

/** Frise horaire : une pastille par match dans l'ordre de la journée. */
function friseHoraire(vues) {
  const puces = vues.map(function (x) {
    const moment = String(x.phase) === 'classement' ? 'après-midi' : 'matin';
    const titre = x.heure + ' · ' + moment + ' · vs ' + x.adversaire + ' · ' + x.pour + '-' + x.contre;
    return puce(x.issue, x.heure, symbole(x.issue), titre);
  }).join('<span class="frise-lien"></span>');
  return '<div class="frise"><div class="frise-rail">' + puces + '</div></div>';
}

/** Liste « contre qui » : adversaire, score, résultat, moment. */
function listeAdversaires(vues) {
  return vues.map(function (x) {
    const moment = String(x.phase) === 'classement' ? '🏉 aprem' : '🌅 matin';
    return '<div class="match match-termine">' +
      '<div class="match-meta">' + echapper(String(x.heure)) + ' · Terrain ' +
        echapper(String(x.terrain)) + ' · ' + moment + '</div>' +
      '<div class="mp-ligne">' +
        '<span class="mp-adv">vs ' + echapper(x.adversaire) + '</span>' +
        '<span class="mp-resultat ' + x.issue + '">' + x.pour + ' - ' + x.contre +
          ' · ' + etiquette(x.issue) + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ==========================================================================
   VUE « SAISON » — cumul lu dans l'Historique, par NOM d'équipe
   ========================================================================== */

function afficherSaison() {
  const zone = document.getElementById('vue-saison');

  // Chaque ligne d'historique concernant le club, vue côté Racing.
  const vues = [];
  historique.forEach(function (h) {
    const aClub = estDuClub(h.equipe_A), bClub = estDuClub(h.equipe_B);
    if (!aClub && !bClub) return;
    if (aClub && bClub) return; // Racing vs Racing : on l'écarte du « contre qui »
    const estA = aClub;
    const pour = Number(estA ? h.score_A : h.score_B);
    const contre = Number(estA ? h.score_B : h.score_A);
    if (!isFinite(pour) || !isFinite(contre)) return;
    vues.push({
      categorie: h.categorie,
      adversaire: estA ? h.equipe_B : h.equipe_A,
      date: h.date,
      pour: pour, contre: contre,
      issue: pour > contre ? 'gagne' : (pour === contre ? 'nul' : 'perd')
    });
  });

  if (!vues.length) {
    zone.innerHTML = '<p class="vide">Aucun résultat encore dans l\'historique de saison. ' +
      'Chaque score validé s\'y ajoute automatiquement — reviens après quelques matchs.</p>';
    return;
  }

  // Bilan global de la saison.
  let v = 0, n = 0, d = 0;
  vues.forEach(function (x) { if (x.issue === 'gagne') v++; else if (x.issue === 'nul') n++; else d++; });
  let html = blocBilan('Bilan de la saison', v + n + d, v, n, d, '');

  // Regroupement : catégorie → adversaire (clé normalisée) → rencontres.
  const cats = categoriesTriees(vues.map(function (x) { return x.categorie; }));
  cats.forEach(function (cat) {
    html += '<div class="perfs-cat">' + echapper(cat) + '</div>';
    const advs = grouperParAdversaire(vues.filter(function (x) { return x.categorie === cat; }));
    advs.forEach(function (a) { html += carteAdversaireSaison(a); });
  });

  zone.innerHTML = html;
}

/** Regroupe des rencontres par adversaire (nom normalisé), triées par nb de matchs décroissant. */
function grouperParAdversaire(vues) {
  const parAdv = {};
  vues.forEach(function (x) {
    const cle = String(x.adversaire).trim().toUpperCase();
    const a = parAdv[cle] || (parAdv[cle] = { nom: x.adversaire, rencontres: [] });
    a.nom = x.adversaire; // garde la dernière graphie rencontrée
    a.rencontres.push(x);
  });
  return Object.keys(parAdv).map(function (k) { return parAdv[k]; })
    .sort(function (a, b) {
      if (b.rencontres.length !== a.rencontres.length) return b.rencontres.length - a.rencontres.length;
      return String(a.nom).localeCompare(String(b.nom));
    });
}

/** Carte d'un adversaire sur la saison : cumul V/N/D + frise des rencontres (par date). */
function carteAdversaireSaison(a) {
  const tri = a.rencontres.slice().sort(function (x, y) { return String(x.date).localeCompare(String(y.date)); });

  let html = '<div class="perfs-equipe">';
  html += '<div class="perfs-equipe-nom">vs ' + echapper(a.nom) +
    ' <span class="perfs-poule">' + tri.length + ' rencontre' + (tri.length > 1 ? 's' : '') + '</span></div>';
  html += ligneBilan(tri);

  const puces = tri.map(function (x) {
    const titre = formaterDate(x.date) + ' · ' + x.pour + '-' + x.contre + ' · ' + etiquette(x.issue);
    return puce(x.issue, formaterDate(x.date), x.pour + '-' + x.contre, titre);
  }).join('<span class="frise-lien"></span>');
  html += '<div class="frise"><div class="frise-rail">' + puces + '</div></div>';

  return html + '</div>';
}

/* ==========================================================================
   BRIQUES D'AFFICHAGE COMMUNES
   ========================================================================== */

/** Bandeau bilan (titre + V/N/D + % + éventuel complément à droite). */
function blocBilan(titre, total, v, n, d, complement) {
  const pct = total ? Math.round((v / total) * 100) : 0;
  return '<div class="perfs-global">' +
    '<div class="perfs-global-titre">' + echapper(titre) + ' · ' + total + ' match' + (total > 1 ? 's' : '') +
      ' joué' + (total > 1 ? 's' : '') + '</div>' +
    '<div class="perfs-chiffres">' +
      '<span class="pc pc-v">' + v + ' V</span>' +
      '<span class="pc pc-n">' + n + ' N</span>' +
      '<span class="pc pc-d">' + d + ' D</span>' +
      '<span class="pc pc-pct">' + pct + '% de victoires</span>' +
    '</div>' +
    (complement ? '<div class="perfs-moment-global">' + complement + '</div>' : '') +
  '</div>';
}

/** Ligne de bilan chiffré (J/V/N/D/Pour/Contre/Diff) à partir d'une liste de {pour, contre, issue}. */
function ligneBilan(vues) {
  let v = 0, n = 0, d = 0, bp = 0, bc = 0;
  vues.forEach(function (x) {
    bp += x.pour; bc += x.contre;
    if (x.issue === 'gagne') v++; else if (x.issue === 'nul') n++; else d++;
  });
  const diff = bp - bc, diffTxt = (diff > 0 ? '+' : '') + diff;
  return '<div class="perfs-bilan">' +
    stat('J', vues.length) + stat('V', v, 'gagne') + stat('N', n, 'nul') + stat('D', d, 'perd') +
    stat('Pour', bp) + stat('Contre', bc) + stat('Diff', diffTxt) +
  '</div>';
}

/** Une case de bilan (valeur + libellé, éventuellement colorée). */
function stat(libelle, valeur, classe) {
  return '<span class="perfs-stat">' +
    '<span class="perfs-stat-val ' + (classe || '') + '">' + echapper(String(valeur)) + '</span>' +
    '<span class="perfs-stat-lib">' + echapper(libelle) + '</span>' +
  '</span>';
}

/** Une pastille de frise (issue colorée + libellé haut + gros symbole bas). */
function puce(issue, libelleHaut, symb, titre) {
  return '<span class="frise-puce ' + issue + '" title="' + echapper(titre) + '">' +
    '<span class="frise-heure">' + echapper(String(libelleHaut)) + '</span>' +
    '<span class="frise-issue">' + echapper(String(symb)) + '</span>' +
  '</span>';
}

/** Petite puce « X/Y victoires » pour un moment de la journée. */
function momentPuce(libelle, bloc) {
  if (!bloc.t) return '';
  const pct = Math.round((bloc.v / bloc.t) * 100);
  return '<span class="perfs-moment">' + libelle + ' : <strong>' + bloc.v + '/' + bloc.t +
    '</strong> (' + pct + '%)</span>';
}

/* ==========================================================================
   PETITS OUTILS
   ========================================================================== */

function categoriesTriees(liste) {
  const cats = [];
  liste.forEach(function (c) { if (cats.indexOf(c) < 0) cats.push(c); });
  return cats.sort(function (a, b) { return String(a).localeCompare(String(b)); });
}

function matchsDe(id) {
  return matchs.filter(function (m) { return m.equipe_A === id || m.equipe_B === id; });
}
function matchsJouesLive() {
  return matchs.filter(function (m) { return estTermine(m.statut) && scoresValides(m); });
}
function scoresValides(m) {
  return isFinite(Number(m.score_A)) && String(m.score_A) !== '' &&
         isFinite(Number(m.score_B)) && String(m.score_B) !== '';
}
/** Point de vue de l'équipe id sur un match live : son score, celui d'en face, l'adversaire (id). */
function pointDeVue(m, id) {
  const estA = m.equipe_A === id;
  return {
    pour: Number(estA ? m.score_A : m.score_B),
    contre: Number(estA ? m.score_B : m.score_A),
    adversaire: estA ? m.equipe_B : m.equipe_A
  };
}
function issueDe(vue) {
  return vue.pour > vue.contre ? 'gagne' : (vue.pour === vue.contre ? 'nul' : 'perd');
}
function symbole(issue) { return issue === 'gagne' ? 'V' : (issue === 'nul' ? 'N' : 'D'); }
function etiquette(issue) { return issue === 'gagne' ? 'Victoire' : (issue === 'nul' ? 'Nul' : 'Défaite'); }

/** 'yyyy-MM-dd' → 'dd/MM' (ou renvoie tel quel si format inattendu). */
function formaterDate(iso) {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? (m[3] + '/' + m[2]) : String(iso);
}

/**
 * Vrai si le statut vaut « terminé », quelle que soit la forme du « é » (NFC/NFD).
 * (Même garde-fou que sur les autres pages, cf. reference-r92-statut-nfd.)
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
document.addEventListener('DOMContentLoaded', initPerfs);
