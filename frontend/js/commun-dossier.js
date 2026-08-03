/**
 * ============================================================================
 *  COMMUN-DOSSIER — helpers partagés par les pages « document » du dossier club
 * ============================================================================
 *
 *  But : ne plus recopier les mêmes petits helpers dans dossier.js, invitation.js
 *  et reponse.js. Avant, `txt`, `dateLongueFr`, `telephoneLisible`, `urlAffiche`,
 *  `ligne`, `section`, `heureFinCommuniquee`… existaient en 3 exemplaires quasi
 *  identiques (suffixés `…I` / `…R`) : corriger un bug obligeait à modifier les 3.
 *  Désormais on les écrit UNE fois, ici.
 *
 *  Ce fichier ne dépend de RIEN (aucune variable d'une page). On le charge APRÈS
 *  commun.js et AVANT le script de la page (dossier.js / invitation.js / reponse.js).
 * ============================================================================
 */

/* --------------------------------------------------------------------------
   OUTILS ADMIN + IMPRESSION (partagés par dossier-club.html et invitation-club.html)
   -------------------------------------------------------------------------- */

/** Un bouton [#bouton-imprimer] déclenche l'impression du navigateur (export PDF). */
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

/* --------------------------------------------------------------------------
   PETITS HELPERS DE MISE EN FORME
   -------------------------------------------------------------------------- */

/** Valeur texte propre ('' si vide/null). */
function txt(v) { return (v == null) ? '' : String(v).trim(); }

/** Vrai si un paramètre 'oui'/'non' de Config vaut 'oui'. */
function oui(v) { return String(v || '').toLowerCase() === 'oui'; }

/** Vraie si la catégorie est présente sur cette édition. */
function catPresente(cat) { return String(cat && cat.presente).toLowerCase() === 'oui'; }

/** Date « mercredi 11 novembre 2026 » (document daté, on met le jour). */
function dateLongueFr(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return txt(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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
 *    vestiaires puis la cérémonie de remise des trophées.
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
function urlAffiche(id, largeur) {
  return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w' + (largeur || 800);
}

/** Une ligne « libellé : valeur » de section — '' si la valeur est vide (ligne masquée). */
function ligne(libelle, valeurHtml) {
  if (!valeurHtml) return '';
  return '<li><span class="d-libelle">' + libelle + '</span><span class="d-valeur">' + valeurHtml + '</span></li>';
}

/** Assemble des lignes en liste — '' si TOUTES sont vides (la section sera masquée). */
function listeOuVide(lignes) {
  const contenu = lignes.join('');
  return contenu ? '<ul class="d-liste">' + contenu + '</ul>' : '';
}

/** Une section complète — '' si elle n'a aucun contenu (titre masqué avec). */
function section(titre, contenuHtml, classe) {
  if (!contenuHtml) return '';
  return '<section class="d-section' + (classe ? ' ' + classe : '') + '">' +
           '<h2>' + titre + '</h2>' + contenuHtml +
         '</section>';
}

/* --------------------------------------------------------------------------
   RÉSUMÉS SPORTIFS (partagés par dossier.js et invitation.js)
   -------------------------------------------------------------------------- */

/* DOSSIER_FORMATS, DOSSIER_FORMATS_DESC, cleFormatApresMidi et les repères FFR
   (FFR_RAPPEL_EFFECTIF, FFR_POURQUOI_FORMAT) vivent désormais dans commun.js :
   l'EMAIL d'invitation (admin, qui ne charge pas ce fichier) en a aussi besoin —
   la page vitrine et l'email disent ainsi exactement la même chose. */

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

/* ==========================================================================
   BLOCS DE PAGE PARTAGÉS (en-tête vitrine, frise, cartes par catégorie, pied)
   --------------------------------------------------------------------------
   L'invitation (Phase 1) et le dossier (Phase 2) sont le MÊME document à deux
   moments de la relation : ils doivent se ressembler, et surtout dire la même
   chose. Ces blocs, écrits une seule fois ici, sont donc appelés par les deux
   pages — corriger une formulation les corrige toutes les deux.
   ========================================================================== */

/**
 * EN-TÊTE « vitrine » : blason centré en grand, surtitre, titre du tournoi, date · lieu,
 * puis l'affiche en héros et le descriptif COMPLET (un paragraphe par ligne saisie).
 * @param {Object} g       paramètres globaux du tournoi
 * @param {Object} [opts]  { surtitre: HTML sûr écrit par nous, presentationDefaut: phrase
 *                           affichée quand le descriptif est vide ('' = rien) }
 */
function heroDocument(g, opts) {
  opts = opts || {};
  const nom = txt(g.tournoi_nom) || 'Tournoi Génération R92';

  // Date · lieu sur une même ligne (chaque morceau est omis s'il manque).
  const quand = [];
  if (txt(g.tournoi_date)) quand.push('<span class="inv-quand-date">' + echapper(dateLongueFr(g.tournoi_date)) + '</span>');
  if (txt(g.tournoi_lieu)) quand.push('<span>' + echapper(txt(g.tournoi_lieu)) + '</span>');

  let html = '<header class="inv-hero">' +
    // Blason du club centré, en GRAND : c'est l'École de Rugby qui reçoit.
    '<img class="inv-blason" src="img/blason-racing92.svg" alt="Racing 92" onerror="this.style.display=\'none\'">' +
    (opts.surtitre ? '<p class="inv-surtitre">' + opts.surtitre + '</p>' : '') +
    '<h1 class="inv-titre">' + echapper(nom) + '</h1>' +
    (quand.length ? '<p class="inv-quand">' + quand.join('<span class="inv-quand-sep"> · </span>') + '</p>' : '') +
  '</header>';

  // L'affiche du tournoi en héros, centrée et en grand.
  if (txt(g.tournoi_affiche_id)) {
    html += '<figure class="inv-affiche">' +
      '<img src="' + echapper(urlAffiche(g.tournoi_affiche_id, 1200)) + '" alt="Affiche — ' + echapper(nom) + '">' +
    '</figure>';
  }

  // Le descriptif COMPLET (jamais tronqué : c'est la présentation du tournoi).
  const description = txt(g.tournoi_description);
  const paragraphes = description
    ? description.split(/\n+/).map(function (p) { return p.trim(); }).filter(Boolean)
    : (opts.presentationDefaut ? [opts.presentationDefaut] : []);
  if (paragraphes.length) {
    html += '<div class="inv-presentation">' + paragraphes.map(function (p) {
      return '<p>' + echapper(p) + '</p>';
    }).join('') + '</div>';
  }

  return html;
}

/**
 * FRISE HORAIRE : les 5 étapes de la journée, chacune UNIQUEMENT si son heure est
 * connue — accueil (heure_rdv), coup d'envoi (heure_debut), pause méridienne
 * (pause_dejeuner_debut + durée), reprise (début + durée, simple arithmétique sur des
 * données réelles), fin envisagée (heureFinCommuniquee : manuelle, sinon fin du dernier
 * match + marge trophées).
 *
 * Les NOTES « matin : poules » / « après-midi : selon la catégorie » ne valent que pour
 * les tournois ordinaires : un tournoi 100 % Super Challenge suit la formule de son
 * règlement (triangulaires, pas de phase d'après-midi) — ses notes sont donc omises,
 * seules restent les heures (des données réelles).
 */
function friseJournee(g, cats) {
  const tousScf = !!(cats && cats.length) && cats.every(function (c) { return ctxScf(c).estScf; });
  const etapes = [];
  if (txt(g.heure_rdv)) {
    etapes.push({ h: txt(g.heure_rdv), t: 'Accueil des équipes', n: '' });
  }
  if (txt(g.heure_debut)) {
    etapes.push({ h: txt(g.heure_debut), t: 'Coup d\'envoi', n: tousScf ? '' : 'Matin : matchs de poules' });
  }
  const pauseDebut = txt(g.pause_dejeuner_debut);
  const pauseDuree = parseInt(txt(g.pause_dejeuner_duree_min), 10);
  if (pauseDebut) {
    etapes.push({ h: pauseDebut, t: 'Pause méridienne',
      n: (isFinite(pauseDuree) && pauseDuree > 0) ? pauseDuree + ' min' : '' });
    const reprise = (isFinite(pauseDuree) && pauseDuree > 0) ? heurePlusMinutes(pauseDebut, pauseDuree) : '';
    if (reprise) {
      etapes.push({ h: reprise, t: 'Reprise', n: tousScf ? '' : 'Après-midi : selon la catégorie' });
    }
  }
  const fin = heureFinCommuniquee(g);
  if (fin) {
    etapes.push({ h: fin, t: 'Fin envisagée', n: '' });
  }
  if (!etapes.length) return '';

  return '<ol class="inv-frise">' + etapes.map(function (e) {
    return '<li>' +
      '<span class="inv-frise-heure">' + echapper(e.h) + '</span>' +
      '<span class="inv-frise-titre">' + echapper(e.t) + '</span>' +
      (e.n ? '<span class="inv-frise-note">' + echapper(e.n) + '</span>' : '') +
    '</li>';
  }).join('') + '</ol>';
}

/**
 * CARTES PAR CATÉGORIE : le cadre sportif complet, une carte par catégorie (forme de jeu
 * FFR, temps de jeu, récupération, effectif, équipes par club, arbitrage, règlement,
 * format d'après-midi expliqué), précédé du déroulé commun et suivi des repères FFR.
 * Les catégories sont triées ; la liste reçue est celle que la page veut montrer (toutes
 * pour l'invitation, les catégories ENGAGÉES pour le dossier).
 */
function cartesCategories(cats) {
  if (!cats || !cats.length) return '';
  const tries = cats.slice().sort(function (a, b) { return comparerCategorie(a.categorie, b.categorie); });

  // Phrase d'introduction : le déroulé commun (matin en poules round-robin). Le Super
  // Challenge de France fait EXCEPTION (triangulaires / quadrangulaires où chaque équipe ne
  // joue que 2 matchs) : on ne lui applique pas la phrase générale, sa carte porte sa formule.
  const nonScf = tries.filter(function (c) { return !ctxScf(c).estScf; });
  const aScf = nonScf.length < tries.length;
  let intro = '';
  if (nonScf.length) {
    intro = 'Le matin, les catégories jouent en poules : chaque équipe rencontre toutes celles ' +
      'de sa poule. L\'après-midi suit le format propre à chaque catégorie, détaillé ci-dessous.';
    if (aScf) intro += ' Le Super Challenge de France (U14) suit la formule de son règlement, ' +
      'détaillée sur sa carte.';
  } else {
    intro = 'Le Super Challenge de France suit la formule de son règlement, détaillée ci-dessous.';
  }

  let html = '<p class="inv-cats-intro">' + intro + '</p>';
  html += '<div class="inv-cartes">' + tries.map(carteCategorie).join('') + '</div>';

  // Repères FFR sous les cartes : rappel sécurité (effectif minimum) + doctrine du format
  // (poules de niveau) — mêmes conditions d'affichage qu'avant la refonte (décisions S20).
  html += rappelEffectifFFR(tries);
  html += noteFormat(tries);
  return html;
}

/** UNE carte : bandeau navy (catégorie + forme de jeu), faits sportifs, format d'après-midi. */
function carteCategorie(c) {
  const scf = ctxScf(c); // Super Challenge de France (U14) : vocabulaire et temps dédiés

  // Badge du bandeau : contexte SCF prioritaire, sinon la forme de jeu FFR retenue.
  const badge = scf.estScf ? 'Super Challenge de France' : txt(c.forme_jeu);

  // Faits sportifs (chaque ligne sans valeur est omise).
  const lignes = [];
  if (scf.estScf) {
    // SCF : temps de match imposés par le règlement (P2 = 2×15 ; P3 = 2×11, miroir de
    // dureeMatchScf côté backend) ; la formule remplace le format d'après-midi.
    const periode = (scf.phase === 'P3') ? 11 : 15;
    lignes.push(ligneCarte('Forme de jeu', 'Jeu à XV (15 contre 15)'));
    lignes.push(ligneCarte('Temps de jeu', resumeMiTemps({ format_mi_temps: '2',
      duree_mi_temps_min: String(periode), pause_mi_temps_min: c.pause_mi_temps_min })));
    lignes.push(ligneCarte('Formule', (scf.phase === 'P3')
      ? 'Samedi : triangulaires · Dimanche : brassage par niveau'
      : 'Plateau en triangulaires / quadrangulaires'));
  } else {
    if (txt(c.forme_jeu)) lignes.push(ligneCarte('Forme de jeu', txt(c.forme_jeu)));
    const miTemps = resumeMiTemps(c);
    if (miTemps) {
      const jeu = tempsDeJeuDe(c);
      lignes.push(ligneCarte('Temps de jeu', miTemps + (jeu ? ' — ' + jeu + ' min par match' : '')));
    }
  }
  const recup = txt(c.recup_entre_matchs_min);
  if (recup) lignes.push(ligneCarte('Récupération', recup + ' min minimum entre deux matchs'));
  const effectif = resumeEffectif(c);
  if (effectif) lignes.push(ligneCarte('Effectif', effectif + ' par équipe'));
  lignes.push(ligneCarte('Équipes par club', phraseMaxEquipes(c)));
  if (txt(c.arbitrage_organisation)) lignes.push(ligneCarte('Arbitrage', txt(c.arbitrage_organisation)));
  const reglement = resumeReglement(c); // déjà échappé / lien sûr
  if (reglement) lignes.push(ligneCarteHtml('Règlement', reglement));

  // Format d'après-midi expliqué (libellé + description concise) — pas pour le SCF,
  // dont les catégories n'ont pas de phase d'après-midi (la formule dit tout).
  let apresMidi = '';
  if (!scf.estScf) {
    const cle = cleFormatApresMidi(c);
    apresMidi = '<p class="inv-carte-apm"><strong>Après-midi — ' + echapper(DOSSIER_FORMATS[cle]) +
      '</strong> : ' + echapper(DOSSIER_FORMATS_DESC[cle]) + '</p>';
  }

  return '<article class="inv-carte">' +
    '<div class="inv-carte-tete">' +
      '<span class="inv-carte-cat">' + echapper(txt(c.categorie)) + '</span>' +
      (badge ? '<span class="inv-carte-forme">' + echapper(badge) + '</span>' : '') +
    '</div>' +
    '<ul class="inv-carte-infos">' + lignes.join('') + '</ul>' +
    apresMidi +
  '</article>';
}

/** Une ligne « libellé / valeur » de carte ('' si valeur vide) — la valeur est échappée ici. */
function ligneCarte(libelle, valeur) {
  return valeur ? ligneCarteHtml(libelle, echapper(valeur)) : '';
}

/** Variante pour une valeur DÉJÀ en HTML sûr (lien règlement). */
function ligneCarteHtml(libelle, valeurHtml) {
  if (!valeurHtml) return '';
  return '<li><span class="inv-carte-libelle">' + libelle + '</span>' +
    '<span class="inv-carte-valeur">' + valeurHtml + '</span></li>';
}

/**
 * Équipes par club : max_equipes_par_club renseigné → « Jusqu'à X équipe(s) » ;
 * vide → « Plusieurs équipes possibles » (jamais « illimité » ni « 0 »).
 */
function phraseMaxEquipes(c) {
  const max = parseInt(txt(c.max_equipes_par_club), 10);
  return (isFinite(max) && max >= 1)
    ? 'Jusqu\'à ' + max + ' équipe' + (max > 1 ? 's' : '')
    : 'Plusieurs équipes possibles';
}

/**
 * Rappel sécurité FFR (session 20) : un club qui vient à l'effectif MINIMUM fait jouer chaque
 * enfant la quasi-totalité du temps de jeu de l'équipe — or la FFR plafonne le temps de jeu par
 * joueur et par jour (règle de sécurité). Affiché dès qu'au moins une catégorie a un effectif
 * minimum ; invite à venir avec une feuille de match complète pour faire tourner.
 */
function rappelEffectifFFR(cats) {
  const aEffectifMin = cats.some(function (c) {
    const n = parseInt(txt(c.effectif_min), 10);
    return isFinite(n) && n >= 1;
  });
  if (!aEffectifMin) return '';
  // Texte partagé avec l'email d'invitation (FFR_RAPPEL_EFFECTIF, commun.js) : une seule source.
  return '<p class="inv-rappel-effectif">⚠️ <strong>Rappel sécurité FFR</strong> — ' +
    echapper(FFR_RAPPEL_EFFECTIF) + '</p>';
}

/** Vrai si au moins une catégorie joue l'après-midi en « poules de niveau ». */
function aPoulesNiveau(cats) {
  return cats.some(function (c) {
    return String(txt(c.format_apresmidi)).toUpperCase() === 'POULES_NIVEAU';
  });
}

/** Note « pourquoi ce format » : la doctrine FFR École de Rugby, expliquée aux clubs invités.
 *  Affichée seulement quand une catégorie joue en poules de niveau — décisions Romain
 *  (session 20) : dire le POURQUOI du format et rappeler la doctrine, y compris le choix
 *  « en cas d'effectif impair, l'équipe supplémentaire va en poule basse ». */
function noteFormat(cats) {
  if (!aPoulesNiveau(cats)) return '';
  // Texte partagé avec l'email d'invitation (FFR_POURQUOI_FORMAT, commun.js) : une seule source.
  return '<p class="inv-note-format">💡 <strong>Pourquoi ce format ?</strong> ' +
    echapper(FFR_POURQUOI_FORMAT) + '</p>';
}

/** Un lien externe du pied de page — '' si l'URL n'est pas en http(s) : un schéma exotique
 *  (javascript:, data:…) glissé dans Config ne devient JAMAIS un lien cliquable (même règle
 *  que resumeReglement). */
function lienExterneSur(url, libelle) {
  const u = txt(url);
  if (!/^https?:\/\//i.test(u)) return '';
  return '<a class="inv-lien" href="' + echapper(u) + '" target="_blank" rel="noopener">' + libelle + '</a>';
}

/**
 * PIED DE PAGE : blason + nom de l'association, et les liens (Instagram, site) quand la page
 * n'a pas déjà son propre bandeau de liens. Le dossier passe `avecLiens = false` : ses boutons
 * d'action portent déjà le site et l'Instagram — deux fois les mêmes liens à 3 cm d'écart,
 * c'est du bruit.
 */
function piedDocument(g, avecLiens) {
  const liens = [];
  if (avecLiens) {
    const instagram = lienExterneSur(g.url_instagram, '📣 Instagram');
    if (instagram) liens.push(instagram);
    const site = lienExterneSur(g.url_site_association, '🌐 Site de l\'association');
    if (site) liens.push(site);
  }
  return '<footer class="d-pied inv-pied">' +
    '<img class="d-pied-logo" src="img/blason-racing92.svg" alt="" onerror="this.style.display=\'none\'">' +
    '<span class="inv-pied-nom">École de Rugby du Racing Club de France</span>' +
    (liens.length ? '<span class="inv-pied-liens">' + liens.join('') + '</span>' : '') +
  '</footer>';
}

/**
 * Catégories engagées (« U8,U10 » ou tableau JSON ["U8","U10"]) → tableau de noms
 * normalisés (MAJUSCULES sans espaces superflus). [] si rien n'est renseigné.
 */
function parseCategoriesEngagees(brut) {
  const t = txt(brut);
  if (!t) return [];
  let liste = null;
  try { const o = JSON.parse(t); if (Array.isArray(o)) liste = o; } catch (e) { /* pas du JSON */ }
  if (!liste) liste = t.split(',');
  return liste.map(function (s) { return String(s).trim().toUpperCase(); }).filter(Boolean);
}
