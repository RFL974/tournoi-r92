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

/* Description CONCISE de chaque format (destinée aux clubs) : le dossier ne se
   contente pas de nommer le format retenu, il l'explique dans une légende sous
   le tableau « Format sportif ». Version courte des textes de la page admin. */
const DOSSIER_FORMATS_DESC = {
  CROISE: 'les équipes sont regroupées par niveau d\'après leur classement du matin, '
    + 'puis s\'affrontent au sein de leur niveau (classement général et podium).',
  CROISE_DIAGONAL: 'brassage par rangs croisés entre poules — le 1ᵉʳ d\'une poule affronte '
    + 'le 2ᵉ d\'une autre — les résultats étant cumulés au classement général.',
  LIBRE: 'des matchs amicaux supplémentaires, sans classement ni podium (idéal pour les plus jeunes).',
  COUPE_PLATEAU: 'les premiers de chaque poule disputent une coupe à élimination directe '
    + '(jusqu\'à la finale), les autres un plateau sans élimination.'
};

/** Clé de format normalisée d'une catégorie (repli CROISE, comme partout ailleurs). */
function cleFormatApresMidi(cat) {
  const f = txt(cat.format_apresmidi).toUpperCase();
  return DOSSIER_FORMATS_DESC[f] ? f : 'CROISE';
}

document.addEventListener('DOMContentLoaded', initDossier);
document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'bouton-imprimer') window.print();
});

/** Révèle les éléments réservés à l'admin (lien « Retour à l'administration », titre)
 *  UNIQUEMENT si la page est ouverte depuis l'administration (?admin=1). Sans ce
 *  paramètre — cas des liens reçus par email par les clubs — ils restent masqués. */
function revelerOutilsAdmin() {
  try {
    if (new URLSearchParams(window.location.search).get('admin') === '1') {
      document.querySelectorAll('.admin-seul').forEach(function (el) { el.hidden = false; });
    }
  } catch (e) { /* environnement sans URLSearchParams : on laisse masqué */ }
}

async function initDossier() {
  const zone = document.getElementById('dossier');
  revelerOutilsAdmin();
  try {
    const data = await apiGet('getAll'); // { config, equipes, poules, matchs }
    const config = (data && data.config) || { global: {}, categories: [] };

    // PHASE 2 — personnalisation par club (rétrocompatible) : si l'URL porte ?club=…,
    // on va chercher les infos NON sensibles du club (nom, prénom, catégories engagées —
    // jamais l'email) pour l'accueil personnalisé et le filtrage du format sportif.
    // Sans paramètre club (liens déjà envoyés), le dossier reste générique.
    let club = null;
    const params = new URLSearchParams(window.location.search);
    const clubParam = txt(params.get('club'));
    if (clubParam) {
      try {
        const r = await apiGet('getClubDossier', { club: clubParam });
        club = (r && r.club) || null;
      } catch (e) { club = null; } // club introuvable / lecture ratée → mode générique
    }

    zone.innerHTML = construireDossier(config.global || {}, config.categories || [], club);
    dessinerQR(); // le QR se dessine après coup (il vise un conteneur du HTML rendu)
  } catch (erreur) {
    zone.innerHTML = '<div class="message-chargement erreur">Impossible de charger les données du tournoi.<br>'
      + 'Détail : ' + echapper(erreur.message) + '</div>';
  }
}

/**
 * Catégories engagées d'un club → tableau de noms normalisés (MAJUSCULES sans espaces
 * superflus). Accepte le format texte « U8,U10 » ou un tableau JSON ["U8","U10"].
 * Renvoie [] si rien n'est renseigné (le dossier reste alors non filtré).
 */
function categoriesEngageesListe(club) {
  const brut = club ? txt(club.categories_engagees) : '';
  if (!brut) return [];
  let liste = null;
  try { const o = JSON.parse(brut); if (Array.isArray(o)) liste = o; } catch (e) { /* pas du JSON */ }
  if (!liste) liste = brut.split(',');
  return liste.map(function (s) { return String(s).trim().toUpperCase(); }).filter(Boolean);
}

/**
 * Paragraphe d'accueil personnalisé (inséré avant la Présentation) quand le club est connu.
 * « Bonjour {prénom}, … {nom du tournoi} … les joueuses et joueurs de {nom du club} … ».
 * Si le prénom manque, on garde « Bonjour, » (jamais de « Bonjour undefined »).
 */
function accueilPersonnalise(g, club) {
  if (!club) return '';
  const prenom = txt(club.club_contact_prenom);
  const nomClub = txt(club.club_nom);
  const nomTournoi = txt(g.tournoi_nom) || 'Tournoi Génération R92';
  const bonjour = prenom ? 'Bonjour ' + echapper(prenom) + ',' : 'Bonjour,';
  return '<p class="d-accueil">' + bonjour +
    ' nous avons bien reçu votre retour concernant votre souhait de participer au '
    + echapper(nomTournoi) + '. Nous sommes heureux de compter parmi nous les joueuses et joueurs'
    + (nomClub ? ' de ' + echapper(nomClub) : '')
    + '. Voici les informations détaillées de cette journée.</p>';
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
 *    génération) + la marge réglée dans le formulaire Horaires de l'admin
 *    (`marge_fin_communiquee_min`, défaut 1 h 15). Cette marge couvre le retour aux
 *    vestiaires puis la cérémonie de remise des trophées — l'événement se termine
 *    à l'issue de la remise.
 */
const MARGE_FIN_COMMUNIQUEE_DEFAUT_MIN = 75;
function heureFinCommuniquee(g) {
  const manuelle = txt(g.heure_fin_communiquee);
  if (manuelle) return manuelle;
  const marge = parseInt(txt(g.marge_fin_communiquee_min), 10);
  return heurePlusMinutes(g.heure_fin, (isFinite(marge) && marge >= 0) ? marge : MARGE_FIN_COMMUNIQUEE_DEFAUT_MIN);
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

/** Temps de JEU d'un match (mi-temps × durée, pause exclue), en minutes — null si inconnu. */
function tempsDeJeuDe(cat) {
  const nb = parseInt(txt(cat.format_mi_temps), 10) || 2;
  const duree = parseInt(txt(cat.duree_mi_temps_min), 10);
  return (isFinite(duree) && duree > 0) ? nb * duree : null;
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
  if (heureFinCommuniquee(g)) {
    prog.push('Fin de l\'événement (après la remise des trophées) : ' + heureFinCommuniquee(g));
  }

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

function construireDossier(g, categories, club) {
  const cats = (categories || []).filter(catPresente);

  // Filtrage Phase 2 : si le club a des catégories engagées, le FORMAT SPORTIF ne montre
  // que ces catégories (les autres sections restent inchangées). Repli sur toutes les
  // catégories si la sélection ne correspond à aucune (donnée incohérente) — jamais de
  // section vide. Sans club / sans sélection : `catsFormat` = toutes les catégories.
  const engagees = categoriesEngageesListe(club);
  let catsFormat = cats;
  if (engagees.length) {
    const filtre = cats.filter(function (c) {
      return engagees.indexOf(txt(c.categorie).toUpperCase()) !== -1;
    });
    if (filtre.length) catsFormat = filtre;
  }

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

  // 1 bis) ACCUEIL PERSONNALISÉ (Phase 2) : inséré AVANT la Présentation, seulement si le
  //        club est connu (paramètre ?club= présent et trouvé). Sinon rien (mode générique).
  html += accueilPersonnalise(g, club);

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
    ligne('Fin de l\'événement', echapper(heureFinCommuniquee(g)))
  ]);
  html += section('Programme de la journée',
    lignesProgramme && (lignesProgramme +
      '<p class="d-note">Après le dernier match : retour aux vestiaires puis cérémonie de remise des trophées — '
      + 'l\'événement se termine à l\'issue de la remise. '
      + 'Horaires indicatifs — le planning détaillé fera foi le jour du tournoi.</p>'));

  // 5) FORMAT SPORTIF : tableau si plusieurs catégories, puces si une seule.
  //    Filtré sur les catégories ENGAGÉES du club en Phase 2 (catsFormat) — une seule
  //    catégorie engagée bascule automatiquement en affichage puces (cf. cadreSportif).
  html += section('Format sportif', cadreSportif(catsFormat));

  // 5 bis) MODALITÉS D'INSCRIPTION (dossier d'INVITATION) : date limite de confirmation,
  //        tarif d'engagement (montant + modalités) SEULEMENT si un tarif est demandé.
  const tarifOui = String(txt(g.tarif_engagement_oui)).toLowerCase() === 'oui';
  html += section('Modalités d\'inscription', listeOuVide([
    ligne('Confirmation attendue avant le',
      txt(g.date_limite_confirmation) ? echapper(dateLongueFr(g.date_limite_confirmation)) : ''),
    ligne('Tarif d\'engagement', tarifOui ? echapper(txt(g.tarif_engagement_montant)) : ''),
    ligne('Modalités de paiement', tarifOui ? echapper(txt(g.tarif_engagement_modalites)) : '')
  ]));

  // 5 ter) PARKING & ACCÈS : texte + photo (plan du parking) en pleine largeur.
  html += section('Parking & accès',
    (txt(g.parking_texte) ? '<p class="d-parking-texte">' + echapper(txt(g.parking_texte)) + '</p>' : '') +
    (txt(g.parking_photo_id)
      ? '<img class="d-parking-photo" src="' + echapper(urlAfficheDossier(g.parking_photo_id, 1000)) + '" ' +
        'alt="Plan du parking et des accès">'
      : ''));

  // 5 quater) ENCADREMENT & ASSURANCE : ratio, diplômes, attestation si requise.
  const attestation = String(txt(g.assurance_attestation_requise)).toLowerCase() === 'oui';
  html += section('Encadrement & assurance', listeOuVide([
    ligne('Encadrement', echapper(txt(g.encadrement_ratio))),
    ligne('Diplômes exigés', echapper(txt(g.encadrement_diplomes))),
    ligne('Assurance', attestation ? 'Attestation d\'assurance du club à fournir' : '')
  ]));

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
    const liste = listeOuVide([
      ligne('Catégorie', echapper(txt(c.categorie))),
      ligne('Matin', 'Poules (round-robin)'),
      ligne('Après-midi', echapper(resumeApresMidi(c))),
      ligne('Mi-temps', echapper(resumeMiTemps(c))),
      ligne('Effectif par équipe', echapper(resumeEffectif(c))),
      ligne('Règlement', resumeReglement(c)),
      ligne('Arbitrage', echapper(txt(c.arbitrage_organisation)))
    ]);
    return liste + legendeFormatSportif(tries);
  }

  // Colonnes candidates : celles dont AU MOINS une catégorie a une valeur sont gardées.
  // `courte: true` = valeurs brèves (« Poules », « 2 × 10 min ») affichées SANS retour à la
  // ligne (classe .col-courte) — sinon la coupure de secours du tableau peut casser un mot
  // (« Poule / s ») quand les colonnes se serrent.
  const colonnes = [
    { titre: 'Catégorie',  courte: true, v: function (c) { return echapper(txt(c.categorie)); } },
    { titre: 'Matin',      courte: true, v: function ()  { return 'Poules'; } },
    { titre: 'Après-midi', v: function (c) { return echapper(resumeApresMidi(c)); } },
    { titre: 'Mi-temps',   courte: true, v: function (c) { return echapper(resumeMiTemps(c)); } },
    { titre: 'Effectif',   courte: true, v: function (c) { return echapper(resumeEffectif(c)); } },
    { titre: 'Règlement',  v: function (c) { return resumeReglement(c); } },
    { titre: 'Arbitrage',  v: function (c) { return echapper(txt(c.arbitrage_organisation)); } }
  ].filter(function (col) {
    return tries.some(function (c) { return col.v(c) !== ''; });
  });

  let html = '<table class="d-table"><thead><tr>';
  colonnes.forEach(function (col) {
    html += '<th' + (col.courte ? ' class="col-courte"' : '') + '>' + col.titre + '</th>';
  });
  html += '</tr></thead><tbody>';
  tries.forEach(function (c) {
    html += '<tr>';
    colonnes.forEach(function (col) {
      html += '<td' + (col.courte ? ' class="col-courte"' : '') + '>' + (col.v(c) || '—') + '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html + legendeFormatSportif(tries);
}

/**
 * Légende SOUS le tableau du cadre sportif : le dossier ne se contente pas de
 * nommer le format, il l'explique. Deux lignes :
 *  - « Déroulé » : le matin (poules round-robin) + la description de CHAQUE format
 *    d'après-midi présent (dédupliqué : une seule description par format utilisé) ;
 *  - « Temps de jeu » : par catégorie, le temps de jeu par match (mi-temps × durée)
 *    et la récupération entre deux matchs. Complète la colonne « Mi-temps » du tableau
 *    (qui donne le découpage) avec le total joué et le repos — les infos que réclament
 *    les clubs pour organiser leurs rotations.
 * Chaque bout d'info manquant est simplement omis (jamais de « non communiqué »).
 */
function legendeFormatSportif(cats) {
  const parts = [];

  // 1) Déroulé + description des formats présents (dédupliqués, dans l'ordre des catégories).
  const formatsPresents = [];
  cats.forEach(function (c) {
    const cle = cleFormatApresMidi(c);
    if (formatsPresents.indexOf(cle) === -1) formatsPresents.push(cle);
  });
  let deroule = '<strong>Déroulé</strong> — <em>Matin :</em> poules en round-robin '
    + '(chaque équipe rencontre toutes celles de sa poule).';
  formatsPresents.forEach(function (cle) {
    deroule += ' <em>Après-midi, ' + echapper(DOSSIER_FORMATS[cle]) + ' :</em> '
      + echapper(DOSSIER_FORMATS_DESC[cle]);
  });
  parts.push('<p class="d-legende-ligne">' + deroule + '</p>');

  // 2) Temps de jeu par catégorie : temps de jeu par match + récupération entre matchs.
  const lignesTemps = [];
  cats.forEach(function (c) {
    const seg = [];
    const jeu = tempsDeJeuDe(c);
    if (jeu) seg.push(jeu + ' min de jeu par match');
    const recup = txt(c.recup_entre_matchs_min);
    if (recup) seg.push('récupération ' + echapper(recup) + ' min entre deux matchs');
    if (seg.length) {
      lignesTemps.push('<strong>' + echapper(txt(c.categorie)) + '</strong> : ' + seg.join(', '));
    }
  });
  if (lignesTemps.length) {
    parts.push('<p class="d-legende-ligne"><strong>Temps de jeu</strong> — '
      + lignesTemps.join(' · ') + '.</p>');
  }

  return '<div class="d-legende">' + parts.join('') + '</div>';
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
  // Autorisation de droit à l'image : docx généré EN LOCAL depuis le modèle du site
  // (les balises nom/date/lieu sont remplacées ; le nom du club reste manuscrit).
  boutons.push('<button type="button" class="d-action" id="bouton-droit-image">🖼️ Autorisation droit à l\'image</button>');
  if (txt(g.url_site_association)) {
    boutons.push('<a class="d-action" href="' + echapper(txt(g.url_site_association)) + '" target="_blank" rel="noopener">🌐 Site de l\'association</a>');
  }
  // « Relayer sur les réseaux » pointe directement vers le compte Instagram Génération R92.
  if (txt(g.url_instagram)) {
    boutons.push('<a class="d-action" href="' + echapper(txt(g.url_instagram)) + '" target="_blank" rel="noopener">📣 Relayer sur les réseaux</a>');
  }
  if (!boutons.length) return '';

  // Les boutons .ics et droit à l'image ont besoin des données : branchés après le rendu (délégué).
  document.addEventListener('click', function brancherActions(e) {
    if (e.target && e.target.id === 'bouton-ics') telechargerICS(g);
    if (e.target && e.target.id === 'bouton-droit-image') telechargerAutorisationImage(g);
  });

  return '<div class="d-actions">' + boutons.join('') + '</div>' +
         '<p class="d-action-erreur" id="d-action-erreur" hidden></p>';
}

/* --------------------------------------------------------------------------
   AUTORISATION DE DROIT À L'IMAGE — docx généré CÔTÉ CLIENT
   --------------------------------------------------------------------------
   Le modèle assets/autorisation-droit-image-template.docx contient les balises
   {nom_tournoi}, {date_tournoi} et {lieu_tournoi}, remplacées à la volée par
   PizZip + docxtemplater (js/vendor/, chargés par dossier-club.html — aucun
   appel externe, comme le QR code). Le document reste GÉNÉRIQUE : le nom du
   club est écrit à la main par chaque famille.
   -------------------------------------------------------------------------- */

/** « Challenge Marc Chevalier » → « challenge-marc-chevalier » (nom de fichier sûr). */
function slugifier(texte) {
  return String(texte || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // é → e (accents retirés)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Génère et télécharge l'autorisation de droit à l'image du tournoi affiché.
 * En cas de problème (modèle manquant/renommé, librairie absente), un message
 * clair s'affiche sous le bandeau — jamais d'échec silencieux.
 */
async function telechargerAutorisationImage(g) {
  const erreurZone = document.getElementById('d-action-erreur');
  const bouton = document.getElementById('bouton-droit-image');
  if (erreurZone) { erreurZone.hidden = true; erreurZone.textContent = ''; }
  if (bouton) bouton.disabled = true;

  try {
    if (typeof PizZip === 'undefined' || typeof docxtemplater === 'undefined') {
      throw new Error('librairies de génération non chargées');
    }
    // 1) Le modèle .docx, récupéré à côté de la page (binaire → ArrayBuffer).
    const reponse = await fetch('assets/autorisation-droit-image-template.docx');
    if (!reponse.ok) throw new Error('modèle introuvable (' + reponse.status + ')');
    const contenu = await reponse.arrayBuffer();

    // 2-3) Chargement PizZip + docxtemplater, puis remplacement des 3 balises.
    const doc = new docxtemplater(new PizZip(contenu), { paragraphLoop: true, linebreaks: true });
    doc.render({
      nom_tournoi:  txt(g.tournoi_nom) || 'Tournoi Génération R92',
      date_tournoi: txt(g.tournoi_date) ? dateLongueFr(g.tournoi_date) : '',
      lieu_tournoi: txt(g.tournoi_lieu) || txt(g.tournoi_adresse)
    });

    // 4-5) Docx de sortie (blob) → téléchargement avec un nom de fichier parlant.
    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Autorisation-droit-image-'
      + (slugifier(txt(g.tournoi_nom)) || 'tournoi-generation-r92')
      + (txt(g.tournoi_date) ? '-' + txt(g.tournoi_date) : '') + '.docx';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  } catch (e) {
    const referent = txt(g.referent_nom) || 'l\'organisateur du tournoi';
    if (erreurZone) {
      erreurZone.textContent = '⚠️ Impossible de charger le modèle d\'autorisation, contactez '
        + referent + '.';
      erreurZone.hidden = false;
    }
  } finally {
    if (bouton) bouton.disabled = false;
  }
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
