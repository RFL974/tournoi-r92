/**
 * ============================================================================
 *  DOSSIER CLUB — assemble le dossier récapitulatif envoyé aux clubs invités
 * ============================================================================
 *  Construit un document A4 (1-2 pages) à partir des données du tournoi
 *  (Config Zone A + Zone B), via le MÊME backend que les autres pages (apiGet).
 *  Un seul dossier par tournoi, générique : pas de filtrage par club ou par
 *  catégorie — un club engagé sur plusieurs catégories y retrouve tout.
 *
 *  Règle d'or : toute section dont TOUS les champs sont vides est masquée
 *  entièrement (titre compris). Jamais de « non communiqué ».
 *
 *  L'export PDF passe par l'impression du navigateur (CSS print dans
 *  css/dossier.css) — aucune librairie PDF. Le QR code est généré en local
 *  par js/vendor/qrcode.js (MIT) — aucun appel externe.
 * ============================================================================
 */

/* Libellés humains des formats d'après-midi (mêmes clés que la page admin). */
const DOSSIER_FORMATS = {
  CROISE: 'Classement croisé',
  CROISE_DIAGONAL: 'Croisé diagonal',
  LIBRE: 'Matchs libres',
  COUPE_PLATEAU: 'Coupe + Plateau'
};

document.addEventListener('DOMContentLoaded', initDossier);
document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'bouton-imprimer') window.print();
});

async function initDossier() {
  const zone = document.getElementById('dossier');
  try {
    const data = await apiGet('getAll'); // { config, equipes, poules, matchs }
    const config = (data && data.config) || { global: {}, categories: [] };
    zone.innerHTML = construireDossier(config.global || {}, config.categories || []);
    dessinerQR(); // le QR se dessine après coup (il vise un conteneur du HTML rendu)
  } catch (erreur) {
    zone.innerHTML = '<div class="message-chargement erreur">Impossible de charger les données du tournoi.<br>'
      + 'Détail : ' + echapper(erreur.message) + '</div>';
  }
}

/* --------------------------------------------------------------------------
   PETITS HELPERS
   -------------------------------------------------------------------------- */

/** Valeur texte propre ('' si vide/null). */
function txt(v) { return (v == null) ? '' : String(v).trim(); }

/** Date « mercredi 11 novembre 2026 » (dossier = document daté, on met le jour). */
function dateLongueFr(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return txt(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Tronque au dernier mot entier avant `max` caractères (même règle que l'aperçu admin). */
function tronquer(texte, max) {
  const t = txt(texte);
  if (t.length <= max) return t;
  const coupe = t.slice(0, max);
  return coupe.slice(0, coupe.lastIndexOf(' ') > 0 ? coupe.lastIndexOf(' ') : max).trim() + '…';
}

/** Ajoute `minutes` à une heure « HH:MM » (bornée à 23:59). '' si l'heure est illisible. */
function heurePlusMinutes(hhmm, minutes) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(txt(hhmm));
  if (!m) return '';
  const total = Math.min(23 * 60 + 59, parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + minutes);
  return ('0' + Math.floor(total / 60)).slice(-2) + ':' + ('0' + (total % 60)).slice(-2);
}

/**
 * Heure de fin ANNONCÉE aux clubs :
 *  - `heure_fin_communiquee` renseignée → elle fait foi (choix manuel) ;
 *  - vide → AUTOMATIQUE : fin du dernier match (`heure_fin`, recalculée à chaque
 *    génération) + 1 h 15 de marge (rangements, goûter, remise des récompenses…).
 */
const MARGE_FIN_COMMUNIQUEE_MIN = 75;
function heureFinCommuniquee(g) {
  return txt(g.heure_fin_communiquee) || heurePlusMinutes(g.heure_fin, MARGE_FIN_COMMUNIQUEE_MIN);
}

/** « 0612345678 » → « 06 12 34 56 78 » (affichage ; la valeur stockée reste normalisée). */
function telephoneLisible(v) {
  const c = txt(v).replace(/\D/g, '');
  return /^\d{10}$/.test(c) ? c.replace(/(\d{2})(?=\d)/g, '$1 ').trim() : txt(v);
}

/** JSON parsé sans jamais casser la page (valeur de repli sinon). */
function jsonSur(v, repli) {
  try { const o = JSON.parse(txt(v) || 'null'); return (o == null) ? repli : o; }
  catch (e) { return repli; }
}

/** URL d'affichage de l'affiche Drive (même CDN lh3 que la page admin). */
function urlAfficheDossier(id, largeur) {
  return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w' + (largeur || 800);
}

/** Une ligne « libellé : valeur » de section — '' si la valeur est vide (ligne masquée). */
function ligne(libelle, valeurHtml) {
  if (!valeurHtml) return '';
  return '<li><span class="d-libelle">' + libelle + '</span><span class="d-valeur">' + valeurHtml + '</span></li>';
}

/** Une section complète — '' si elle n'a aucun contenu (titre masqué avec). */
function section(titre, contenuHtml, classe) {
  if (!contenuHtml) return '';
  return '<section class="d-section' + (classe ? ' ' + classe : '') + '">' +
           '<h2>' + titre + '</h2>' + contenuHtml +
         '</section>';
}

/** Vraie si la catégorie est présente sur cette édition. */
function catPresente(cat) { return String(cat && cat.presente).toLowerCase() === 'oui'; }

/* --------------------------------------------------------------------------
   LOGIQUES DE RÉSUMÉ (terrains, cadre sportif, sécurité)
   -------------------------------------------------------------------------- */

/**
 * Transforme les JSON de terrains en UNE phrase lisible — jamais de JSON brut.
 *  - Source principale : `repartition_grands_terrains` {"Rugby 1":["1","2"],…}
 *    → nb de terrains de jeu, nb de grands terrains, complets vs réduits
 *    (un grand terrain à 1 seul terrain de jeu = joué en terrain complet).
 *  - Repli : les numéros de la colonne `terrains` des catégories présentes.
 *  Renvoie '' si on ne sait rien (la ligne est alors masquée).
 */
function resumeTerrains(global, categories) {
  const repartition = jsonSur(global.repartition_grands_terrains, {});
  const grands = Object.keys(repartition).filter(function (k) {
    return Array.isArray(repartition[k]) && repartition[k].length > 0;
  });
  let nbJeu = 0, complets = 0;
  grands.forEach(function (k) {
    nbJeu += repartition[k].length;
    if (repartition[k].length === 1) complets++;
  });

  if (nbJeu > 0) {
    const reduits = nbJeu - complets;
    let phrase = nbJeu + ' terrain' + (nbJeu > 1 ? 's' : '') + ' de jeu';
    const details = [];
    if (complets > 0) details.push(complets + ' grand' + (complets > 1 ? 's' : '') + ' complet' + (complets > 1 ? 's' : ''));
    if (reduits > 0) details.push(reduits + ' réduit' + (reduits > 1 ? 's' : ''));
    if (details.length > 1) phrase += ' : ' + details.join(', ');
    phrase += ', sur ' + grands.length + ' grand' + (grands.length > 1 ? 's' : '') + ' terrain' + (grands.length > 1 ? 's' : '')
            + ' (' + grands.join(', ') + ')';
    return phrase;
  }

  // Repli : numéros de terrains déclarés par catégorie (avant toute répartition appliquée).
  const numeros = new Set();
  (categories || []).filter(catPresente).forEach(function (c) {
    txt(c.terrains).split(',').forEach(function (n) { if (n.trim()) numeros.add(n.trim()); });
  });
  if (numeros.size > 0) return numeros.size + ' terrain' + (numeros.size > 1 ? 's' : '') + ' de jeu';
  return '';
}

/** « 2 × 10 min » (+ «, pause 2 min » si 2 mi-temps avec pause). */
function resumeMiTemps(cat) {
  const nb = txt(cat.format_mi_temps) || '2';
  const duree = txt(cat.duree_mi_temps_min);
  if (!duree) return '';
  let s = nb + ' × ' + duree + ' min';
  const pause = parseInt(cat.pause_mi_temps_min, 10);
  if (nb === '2' && isFinite(pause) && pause > 0) s += ' (pause ' + pause + ' min)';
  return s;
}

/** « 8 à 12 joueurs » / « 8 joueurs min » / « 12 joueurs max » / ''. */
function resumeEffectif(cat) {
  const min = txt(cat.effectif_min), max = txt(cat.effectif_max);
  if (min && max) return (min === max) ? min + ' joueurs' : min + ' à ' + max + ' joueurs';
  if (min) return min + ' joueurs min';
  if (max) return max + ' joueurs max';
  return '';
}

/**
 * Règlement : lien cliquable si la valeur CONTIENT une URL http(s), sinon texte.
 * On extrait l'URL même noyée dans un préfixe — cas réel : lien copié depuis la
 * visionneuse PDF de Chrome (« chrome-extension://…/https://api.www.ffr.fr/….pdf »).
 * Un libellé court remplace l'URL brute : plus de chaîne interminable qui déborde.
 */
function resumeReglement(cat) {
  const v = txt(cat.reglement);
  if (!v) return '';
  const m = v.match(/https?:\/\/\S+/i);
  if (m) {
    return '<a href="' + echapper(m[0]) + '" target="_blank" rel="noopener">Consulter le règlement</a>';
  }
  return echapper(v);
}

/** Libellé du format d'après-midi (repli = croisé, comme partout ailleurs). */
function resumeApresMidi(cat) {
  const f = txt(cat.format_apresmidi).toUpperCase();
  return DOSSIER_FORMATS[f] || DOSSIER_FORMATS.CROISE;
}

/**
 * Résout le référent SÉCURITÉ : identique au référent tournoi (défaut, y compris
 * champ vide) → on réutilise referent_nom / referent_tel ; sinon les champs dédiés.
 * Renvoie { nom, tel } (chaînes éventuellement vides).
 */
function referentSecurite(g) {
  const identique = String(txt(g.securite_referent_identique) || 'oui').toLowerCase() !== 'non';
  return identique
    ? { nom: txt(g.referent_nom), tel: txt(g.referent_tel) }
    : { nom: txt(g.securite_referent_nom), tel: txt(g.securite_referent_tel) };
}

/* --------------------------------------------------------------------------
   LIENS UTILES (.ics, itinéraires, page de suivi)
   -------------------------------------------------------------------------- */

/** URL de la page publique de suivi : paramètre `url_tournoi_public` si présent
 *  dans Config, sinon la page tournoi.html qui vit à côté de ce dossier. */
function urlSuiviPublic(g) {
  return txt(g.url_tournoi_public) || new URL('tournoi.html', window.location.href).toString();
}

/** Adresse à utiliser pour l'itinéraire et l'agenda (repli : lieu). */
function adresseItineraire(g) {
  return txt(g.tournoi_adresse) || txt(g.tournoi_lieu);
}

/** Échappe une valeur texte ICS (RFC 5545 : virgules, points-virgules, retours ligne). */
function icsEchapper(v) {
  return String(v || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** « 2026-11-11 » + « 07:45 » → « 20261111T074500 » (heure locale flottante). */
function icsDateHeure(dateISO, hhmm) {
  const d = txt(dateISO).replace(/-/g, '');
  const h = txt(hhmm).replace(':', '');
  return (/^\d{8}$/.test(d) && /^\d{4}$/.test(h)) ? d + 'T' + h + '00' : '';
}

/**
 * Construit le contenu du fichier .ics : UN SEUL événement, de l'heure de RDV à
 * l'heure de fin annoncée aux clubs (manuelle, sinon fin du dernier match + 1 h 15 ;
 * replis : heure_debut au départ, RDV + 8 h à l'arrivée). Renvoie null si la date
 * ou l'heure de départ manquent.
 */
function construireICS(g) {
  const date = txt(g.tournoi_date);
  const debut = txt(g.heure_rdv) || txt(g.heure_debut);
  if (!date || !debut) return null;

  let fin = heureFinCommuniquee(g);
  if (!fin) fin = heurePlusMinutes(debut, 8 * 60);
  const dtStart = icsDateHeure(date, debut);
  const dtEnd = icsDateHeure(date, fin);
  if (!dtStart || !dtEnd) return null;

  // DESCRIPTION = résumé du programme (uniquement les horaires renseignés).
  const prog = [];
  if (txt(g.heure_rdv)) prog.push('RDV des équipes : ' + txt(g.heure_rdv));
  if (txt(g.heure_debut)) prog.push('Coup d\'envoi : ' + txt(g.heure_debut));
  if (txt(g.pause_dejeuner_debut)) {
    prog.push('Pause déjeuner : ' + txt(g.pause_dejeuner_debut)
      + (txt(g.pause_dejeuner_duree_min) ? ' (' + txt(g.pause_dejeuner_duree_min) + ' min)' : ''));
  }
  if (heureFinCommuniquee(g)) prog.push('Fin prévue : ' + heureFinCommuniquee(g));

  const horodatage = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return ['BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Generation R92//Tournoi//FR',
          'BEGIN:VEVENT',
          'UID:tournoi-r92-' + date + '@generation-r92',
          'DTSTAMP:' + horodatage,
          'DTSTART:' + dtStart,
          'DTEND:' + dtEnd,
          'SUMMARY:' + icsEchapper(txt(g.tournoi_nom) || 'Tournoi Génération R92'),
          'LOCATION:' + icsEchapper(adresseItineraire(g)),
          'DESCRIPTION:' + icsEchapper(prog.join(' · ')),
          'END:VEVENT',
          'END:VCALENDAR'].join('\r\n');
}

/** Déclenche le téléchargement du .ics (généré côté client, aucune dépendance serveur). */
function telechargerICS(g) {
  const contenu = construireICS(g);
  if (!contenu) return;
  const blob = new Blob([contenu], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tournoi-r92-' + (txt(g.tournoi_date) || 'agenda') + '.ics';
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/* --------------------------------------------------------------------------
   CONSTRUCTION DU DOSSIER (le HTML complet, section par section)
   -------------------------------------------------------------------------- */

function construireDossier(g, categories) {
  const cats = (categories || []).filter(catPresente);
  let html = '';

  // 1) EN-TÊTE : affiche, nom, date, horodatage de génération.
  const nom = txt(g.tournoi_nom) || 'Tournoi Génération R92';
  const genereLe = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  html += '<header class="d-entete">' +
    (txt(g.tournoi_affiche_id)
      ? '<img class="d-affiche" src="' + echapper(urlAfficheDossier(g.tournoi_affiche_id, 800)) + '" alt="Affiche — ' + echapper(nom) + '">'
      : '') +
    '<div class="d-entete-textes">' +
      '<p class="d-surtitre">Dossier club — Génération R92</p>' +
      '<h1>' + echapper(nom) + '</h1>' +
      (txt(g.tournoi_date) ? '<p class="d-date">' + echapper(dateLongueFr(g.tournoi_date)) + '</p>' : '') +
      '<p class="d-genere">Généré le ' + echapper(genereLe) + '</p>' +
    '</div>' +
  '</header>';

  // 2) PRÉSENTATION (2-3 phrases, tronquée à 400 caractères).
  if (txt(g.tournoi_description)) {
    html += '<p class="d-presentation">' + echapper(tronquer(g.tournoi_description, 400)) + '</p>';
  }

  // 3) INFOS PRATIQUES : lieu + adresse, puis logistique si renseignée dans Config
  //    (paramètres optionnels de la Zone A : logistique_parking / _buvette / _vestiaires).
  html += section('Infos pratiques', listeOuVide([
    ligne('Lieu', echapper(txt(g.tournoi_lieu))),
    ligne('Adresse', echapper(txt(g.tournoi_adresse))),
    ligne('Parking', echapper(txt(g.logistique_parking))),
    ligne('Buvette / restauration', echapper(txt(g.logistique_buvette))),
    ligne('Vestiaires', echapper(txt(g.logistique_vestiaires)))
  ]));

  // 4) PROGRAMME DE LA JOURNÉE (+ mention « horaires indicatifs »).
  const pause = txt(g.pause_dejeuner_debut)
    ? echapper(txt(g.pause_dejeuner_debut)) + (txt(g.pause_dejeuner_duree_min) ? ' (' + echapper(txt(g.pause_dejeuner_duree_min)) + ' min)' : '')
    : '';
  const lignesProgramme = listeOuVide([
    ligne('Accueil des équipes (RDV)', echapper(txt(g.heure_rdv))),
    ligne('Premier coup d\'envoi', echapper(txt(g.heure_debut))),
    ligne('Pause déjeuner', pause),
    ligne('Fin de la journée', echapper(heureFinCommuniquee(g)))
  ]);
  html += section('Programme de la journée',
    lignesProgramme && (lignesProgramme + '<p class="d-note">Horaires indicatifs — le planning détaillé fera foi le jour du tournoi.</p>'));

  // 5) FORMAT SPORTIF : tableau si plusieurs catégories, puces si une seule.
  html += section('Format sportif', cadreSportif(cats));

  // 6) SUIVI & ORGANISATION : lien live + QR, table de marque, résumé des terrains.
  const urlLive = urlSuiviPublic(g);
  const terrains = resumeTerrains(g, cats);
  html += section('Suivi des scores & organisation',
    '<div class="d-suivi">' +
      '<div class="d-suivi-texte">' + listeOuVide([
        ligne('Scores en direct', '<a href="' + echapper(urlLive) + '" target="_blank" rel="noopener">' + echapper(urlLive) + '</a>'),
        ligne('Table de marque', echapper(txt(g.table_marque_organisation))),
        ligne('Terrains', echapper(terrains))
      ]) + '</div>' +
      '<div class="d-qr" id="d-qr" data-url="' + echapper(urlLive) + '"><span class="d-qr-legende">Scores en direct</span></div>' +
    '</div>');

  // 7) SÉCURITÉ : poste de secours (si coché) + référent sécurité résolu.
  const secours = String(txt(g.securite_secours_oui)).toLowerCase() === 'oui';
  const refSecu = referentSecurite(g);
  const contactSecu = [refSecu.nom ? echapper(refSecu.nom) : '', refSecu.tel ? echapper(telephoneLisible(refSecu.tel)) : '']
    .filter(Boolean).join(' — ');
  html += section('Sécurité', listeOuVide([
    ligne('Poste de secours', secours
      ? 'Sur place' + (txt(g.securite_secours_precisions) ? ' — ' + echapper(txt(g.securite_secours_precisions)) : '')
      : ''),
    ligne('Référent sécurité', contactSecu)
  ]));

  // 8) BLOC CONTACT : référent tournoi.
  if (txt(g.referent_nom) || txt(g.referent_tel)) {
    html += '<section class="d-section d-contact">' +
      '<h2>Votre contact</h2>' +
      '<p class="d-contact-ligne">' +
        (txt(g.referent_nom) ? '<strong>' + echapper(txt(g.referent_nom)) + '</strong>' : '') +
        (txt(g.referent_tel)
          ? (txt(g.referent_nom) ? ' · ' : '') + '<a href="tel:' + echapper(txt(g.referent_tel)) + '">'
            + echapper(telephoneLisible(g.referent_tel)) + '</a>'
          : '') +
      '</p></section>';
  }

  // 9) BANDEAU D'ACTIONS : agenda .ics, itinéraires, liens de l'association.
  html += bandeauActions(g);

  // 10) PIED DE PAGE : logo + mention discrète (document identifiable même découpé).
  html += '<footer class="d-pied">' +
    '<img class="d-pied-logo" src="img/logo-r92.png" alt="" onerror="this.style.display=\'none\'">' +
    '<span>Génération R92 <span class="d-pied-mention">· École de rugby du Racing 92</span></span>' +
  '</footer>';

  return html;
}

/** Assemble des lignes en liste — '' si TOUTES sont vides (la section sera masquée). */
function listeOuVide(lignes) {
  const contenu = lignes.join('');
  return contenu ? '<ul class="d-liste">' + contenu + '</ul>' : '';
}

/**
 * Cadre sportif :
 *  - 1 catégorie active  → puces simples (pas de tableau pour une seule ligne) ;
 *  - plusieurs           → tableau compact, une ligne par catégorie, colonnes
 *    entièrement vides retirées (mêmes règles que les sections).
 * Le matin est toujours joué en poules (round-robin) — libellé fixe.
 */
function cadreSportif(cats) {
  if (!cats.length) return '';
  const tries = cats.slice().sort(function (a, b) { return comparerCategorie(a.categorie, b.categorie); });

  if (tries.length === 1) {
    const c = tries[0];
    return listeOuVide([
      ligne('Catégorie', echapper(txt(c.categorie))),
      ligne('Matin', 'Poules (round-robin)'),
      ligne('Après-midi', echapper(resumeApresMidi(c))),
      ligne('Mi-temps', echapper(resumeMiTemps(c))),
      ligne('Effectif par équipe', echapper(resumeEffectif(c))),
      ligne('Règlement', resumeReglement(c)),
      ligne('Arbitrage', echapper(txt(c.arbitrage_organisation)))
    ]);
  }

  // Colonnes candidates : celles dont AU MOINS une catégorie a une valeur sont gardées.
  const colonnes = [
    { titre: 'Catégorie',  v: function (c) { return echapper(txt(c.categorie)); } },
    { titre: 'Matin',      v: function ()  { return 'Poules'; } },
    { titre: 'Après-midi', v: function (c) { return echapper(resumeApresMidi(c)); } },
    { titre: 'Mi-temps',   v: function (c) { return echapper(resumeMiTemps(c)); } },
    { titre: 'Effectif',   v: function (c) { return echapper(resumeEffectif(c)); } },
    { titre: 'Règlement',  v: function (c) { return resumeReglement(c); } },
    { titre: 'Arbitrage',  v: function (c) { return echapper(txt(c.arbitrage_organisation)); } }
  ].filter(function (col) {
    return tries.some(function (c) { return col.v(c) !== ''; });
  });

  let html = '<table class="d-table"><thead><tr>';
  colonnes.forEach(function (col) { html += '<th>' + col.titre + '</th>'; });
  html += '</tr></thead><tbody>';
  tries.forEach(function (c) {
    html += '<tr>';
    colonnes.forEach(function (col) { html += '<td>' + (col.v(c) || '—') + '</td>'; });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

/** Bandeau d'actions : chaque bouton n'apparaît que si son lien est constructible. */
function bandeauActions(g) {
  const adresse = adresseItineraire(g);
  const boutons = [];

  if (construireICS(g)) {
    boutons.push('<button type="button" class="d-action" id="bouton-ics">📅 Ajouter à mon agenda</button>');
  }
  if (adresse) {
    const q = encodeURIComponent(adresse);
    boutons.push('<a class="d-action" href="https://www.google.com/maps/search/?api=1&query=' + q + '" target="_blank" rel="noopener">🗺️ Itinéraire (Google Maps)</a>');
    boutons.push('<a class="d-action" href="https://waze.com/ul?q=' + q + '&navigate=yes" target="_blank" rel="noopener">🚗 Itinéraire (Waze)</a>');
  }
  if (txt(g.url_site_association)) {
    boutons.push('<a class="d-action" href="' + echapper(txt(g.url_site_association)) + '" target="_blank" rel="noopener">🌐 Site de l\'association</a>');
  }
  if (txt(g.url_instagram)) {
    boutons.push('<a class="d-action" href="' + echapper(txt(g.url_instagram)) + '" target="_blank" rel="noopener">📸 Instagram</a>');
  }
  if (!boutons.length) return '';

  // Le bouton .ics a besoin des données : on le branche après le rendu (délégué).
  document.addEventListener('click', function brancherICS(e) {
    if (e.target && e.target.id === 'bouton-ics') telechargerICS(g);
  });

  return '<div class="d-actions">' + boutons.join('') + '</div>';
}

/* --------------------------------------------------------------------------
   QR CODE (page de suivi en direct) — généré en local, pointe vers l'URL live
   -------------------------------------------------------------------------- */

function dessinerQR() {
  const conteneur = document.getElementById('d-qr');
  if (!conteneur || typeof qrcode !== 'function') return;
  try {
    const qr = qrcode(0, 'M'); // version auto, correction M
    qr.addData(conteneur.getAttribute('data-url'));
    qr.make();
    // SVG : net à l'écran comme à l'impression (cellSize 4 ≈ 3 cm imprimé).
    conteneur.insertAdjacentHTML('afterbegin', qr.createSvgTag({ cellSize: 4, margin: 8 }));
  } catch (e) {
    conteneur.hidden = true; // URL trop longue ou lib absente : on masque, sans casser la page
  }
}
