/**
 * ============================================================================
 *  ADMIN — RÉGLAGES (horaires + catégories) (extrait de admin.js)
 * ============================================================================
 *  Affichage et enregistrement des réglages du tournoi : horaires globaux
 *  (début/fin, battement, pause déjeuner, RDV, marge de fin communiquée) et
 *  catégories (présence, terrains, nombre de poules Auto/forcé, format
 *  d'après-midi, durées…), avec ajout / suppression. Sorti du monolithe
 *  admin.js SANS changement de comportement.
 *
 *  Dépend de globaux définis ailleurs, accédés au moment de l'appel (handlers
 *  post-chargement) — l'ordre des <script> importe peu ; chargé après admin.js :
 *   - commun.js : echapper, svgIcone, comparerCategorie, afficherMessage, avecBoutonOccupe…
 *   - admin.js  : configCourante, ecrireAdmin, apiGet, majTableauBord,
 *                 majEtatAvancement, majDossier, remplirSelectCategories, dialog*…
 * ============================================================================
 */

/* --------------------------------------------------------------------------
   AFFICHAGE DES RÉGLAGES
   -------------------------------------------------------------------------- */

/**
 * Injecte les réglages dans leurs deux zones distinctes (horaires / catégories),
 * pour permettre une mise en page côte à côte sur grand écran. Les écouteurs délégués
 * sont posés sur le DOCUMENT (voir initAdmin) : ils continuent de fonctionner même
 * quand le mode écrans déplace les deux zones hors de #reglages.
 */
function injecterReglages(global, categories) {
  document.getElementById('zone-horaires').innerHTML = afficherHoraires(global);
  document.getElementById('zone-categories').innerHTML = afficherCategories(categories);
  // Affiche d'emblée les conseils des catégories déjà en mode Manuel (sans attendre une frappe).
  document.querySelectorAll('.bloc-terrains[data-terrains="manuel"]').forEach(verifierTerrainsBloc);
}

/**
 * Carte "Horaires de la journée" sous forme de FORMULAIRE modifiable.
 * Les heures utilisent le champ natif <input type="time"> (rouleau sur mobile).
 */
function afficherHoraires(global) {
  function val(cle, def) {
    return (global && global[cle] != null && global[cle] !== '')
      ? echapper(String(global[cle])) : (def || '');
  }
  // Heure de fin automatique par défaut (sauf si explicitement 'non').
  var auto = String((global && global.heure_fin_auto) || 'oui').toLowerCase() !== 'non';

  // Carte simple (non repliable : chaque étape a désormais son propre écran,
  // plier n'avait plus de raison d'être).
  return (
    '<section class="carte">' +
      '<h2>Horaires de la journée</h2>' +
      '<form id="form-horaires" class="form-reglages">' +
        champHeure('heure_debut', 'Heure de début des matchs', val('heure_debut')) +
        // Heure de RDV (accueil des équipes) : pré-remplie à début − 1h15 quand on saisit
        // l'heure de début (voir onReglagesChange), mais toujours modifiable à la main.
        champHeure('heure_rdv', 'Heure de RDV des équipes', val('heure_rdv')) +
        // Heure de fin + case "auto"
        '<div class="champ-reglage">' +
          '<label for="h-heure_fin">Heure de fin des matchs</label>' +
          '<span class="fin-groupe">' +
            '<label class="mini-toggle"><input type="checkbox" id="h-heure_fin_auto" name="heure_fin_auto"' +
              (auto ? ' checked' : '') + '> auto</label>' +
            '<input type="time" id="h-heure_fin" name="heure_fin" value="' + val('heure_fin') + '"' +
              (auto ? ' disabled' : '') + '>' +
          '</span>' +
        '</div>' +
        // Heure de fin COMMUNIQUÉE (dossier club). VIDE = automatique : le dossier
        // affiche « fin du dernier match + marge » et suit chaque régénération du
        // planning. Une valeur saisie ici prime et ne bouge plus.
        champHeure('heure_fin_communiquee', 'Heure de fin communiquée aux clubs', val('heure_fin_communiquee'),
                   'Vide = auto : fin du dernier match + la marge ci-dessous (suit le planning).') +
        // Marge réglable du mode automatique (défaut 75 min = 1h15) : couvre le retour
        // aux vestiaires puis la cérémonie de remise des trophées — l'événement se
        // termine à l'issue de la remise. La main reste totale à l'organisateur.
        champNombre('marge_fin_communiquee_min', 'Marge après le dernier match (min)', val('marge_fin_communiquee_min', '75'),
                    'Retour aux vestiaires + remise des trophées : l\'événement se termine à la fin de la remise. '
                    + 'Fin annoncée = dernier match + cette marge (si l\'heure ci-dessus est vide).') +
        champNombre('battement_terrain_min', 'Battement terrain entre les matchs (min)', val('battement_terrain_min', '5')) +
        champHeure('pause_dejeuner_debut', 'Pause déjeuner — début', val('pause_dejeuner_debut')) +
        champNombre('pause_dejeuner_duree_min', 'Pause déjeuner — durée (min)', val('pause_dejeuner_duree_min')) +
        '<div class="ligne-action">' +
          '<button type="submit" class="bouton">Enregistrer les horaires</button>' +
          '<span id="message-horaires" class="message-form"></span>' +
        '</div>' +
      '</form>' +
    '</section>'
  );
}

/** Retire `minutes` à une heure « HH:MM ». Renvoie « HH:MM », ou '' si l'heure est illisible. */
function heureMoinsMinutes(hhmm, minutes) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || ''));
  if (!m) return '';
  let total = parseInt(m[1], 10) * 60 + parseInt(m[2], 10) - minutes;
  while (total < 0) total += 24 * 60; // reste sur la même journée (pas d'heure négative)
  return ('0' + Math.floor(total / 60)).slice(-2) + ':' + ('0' + (total % 60)).slice(-2);
}

/* Un champ "heure" (rouleau natif sur mobile), avec une ligne d'aide optionnelle. */
function champHeure(nom, label, valeur, aide) {
  return '<div class="champ-reglage">' +
           '<label for="h-' + nom + '">' + label + '</label>' +
           '<input type="time" id="h-' + nom + '" name="' + nom + '" value="' + valeur + '">' +
           (aide ? '<span class="f-aide">' + aide + '</span>' : '') +
         '</div>';
}

/* Un champ "nombre" (ex : durée en minutes), avec une ligne d'aide optionnelle. */
function champNombre(nom, label, valeur, aide) {
  return '<div class="champ-reglage">' +
           '<label for="h-' + nom + '">' + label + '</label>' +
           '<input type="number" id="h-' + nom + '" name="' + nom + '" min="0" step="5" value="' + valeur + '">' +
           (aide ? '<span class="f-aide">' + aide + '</span>' : '') +
         '</div>';
}

/**
 * Enregistre les horaires quand on soumet le formulaire.
 */
async function onEnregistrerHoraires(evenement) {
  evenement.preventDefault();
  const form = evenement.target;
  const message = document.getElementById('message-horaires');

  const auto = form.heure_fin_auto.checked;
  const data = {
    heure_debut:              form.heure_debut.value,
    heure_rdv:                form.heure_rdv.value,
    heure_fin:                form.heure_fin.value,
    heure_fin_auto:           auto ? 'oui' : 'non',
    heure_fin_communiquee:    form.heure_fin_communiquee.value,
    marge_fin_communiquee_min: form.marge_fin_communiquee_min.value,
    battement_terrain_min:    form.battement_terrain_min.value,
    pause_dejeuner_debut:     form.pause_dejeuner_debut.value,
    pause_dejeuner_duree_min: form.pause_dejeuner_duree_min.value
  };

  if (!data.heure_debut) {
    afficherMessage(message, "Renseigne l'heure de début.", 'ko');
    return;
  }
  if (!auto && !data.heure_fin) {
    afficherMessage(message, "Renseigne l'heure de fin (ou coche « auto »).", 'ko');
    return;
  }

  const bouton = form.querySelector('button');
  await avecBoutonOccupe(bouton, message, async function () {
    await ecrireAdmin('enregistrerHoraires', data);
    // On met à jour la config gardée en mémoire.
    configCourante.global = Object.assign({}, configCourante.global, data);
    // Valeurs désormais ENREGISTRÉES → l'assistant reprend sa photo de référence.
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);
    majEtatAvancement(); // le fil « Où en suis-je ? » suit les horaires
    majDossier();        // la section Programme du dossier club suit
    afficherMessage(message, '✅ Horaires enregistrés.', 'ok');
  });
}

/**
 * Affiche les catégories sous forme de FORMULAIRES modifiables (une carte par catégorie),
 * suivies d'un formulaire pour ajouter une nouvelle catégorie.
 */
function afficherCategories(categories) {
  // Formulaire d'ajout EN PREMIER (au-dessus de la liste) : c'est par lui qu'on
  // commence, et il reste visible sans avoir à défiler sous toutes les cartes.
  let html =
    '<form id="form-ajout-categorie" class="carte">' +
      '<h3 style="margin-bottom:10px;">Ajouter une catégorie</h3>' +
      '<div class="form-equipe">' +
        '<input type="text" name="categorie" placeholder="Nom (ex : U16)" autocomplete="off" required>' +
        '<button type="submit" class="bouton">Ajouter</button>' +
      '</div>' +
      '<div class="message-form" data-role="msg-ajout-cat"></div>' +
    '</form>';

  html += '<h2 style="margin:24px 0 12px;">Catégories</h2>';
  if (categories && categories.length > 0) {
    categories.forEach(function (cat) {
      html += formulaireCategorie(cat);
    });
  } else {
    html += '<p class="vide">Aucune catégorie. Ajoute-en une ci-dessus.</p>';
  }

  return html;
}

/**
 * Construit le formulaire modifiable d'une catégorie.
 */
function formulaireCategorie(cat) {
  const nom = cat.categorie || '?';

  let champs = '';
  CHAMPS_CATEGORIE.forEach(function (champ) {
    const valeur = (cat[champ.cle] != null) ? String(cat[champ.cle]) : '';
    champs += champCategorie(champ, valeur);
  });

  return (
    '<form class="carte categorie form-categorie" data-cat="' + echapper(nom) + '">' +
      '<div class="ligne-info">' +
        '<span class="badge">' + echapper(nom) + '</span>' +
      '</div>' +
      blocTerrains(cat) +
      '<div class="grille-reglages">' + champs + '</div>' +
      blocFormatApresMidi(cat) +
      '<div class="ligne-action">' +
        '<button type="submit" class="bouton">Enregistrer</button>' +
        '<button type="button" class="bouton-suppr bouton-suppr-cat" data-cat="' + echapper(nom) + '">Supprimer</button>' +
        '<span class="message-form message-cat"></span>' +
      '</div>' +
    '</form>'
  );
}

/**
 * Bloc « Terrains » d'une catégorie : choix Auto / Manuel.
 *  - Auto (défaut) : les terrains sont attribués par l'onglet « Terrains & répartition ».
 *    Le champ de saisie est masqué ; on affiche juste les terrains actuels à titre indicatif.
 *  - Manuel : l'organisateur saisit lui-même les numéros, et une vérification en direct
 *    (doublons entre catégories, terrain inexistant, catégorie sans terrain) le conseille.
 * L'affichage conditionnel est piloté par l'attribut data-terrains (voir onReglagesChange),
 * comme pour le format d'après-midi : pas de :has(), compatible tous téléphones.
 */
function blocTerrains(cat) {
  const auto = terrainsAutoDe(cat);
  const val = (cat && cat.terrains != null) ? String(cat.terrains) : '';
  const infoActuel = val.trim()
    ? '. Actuellement : <strong>' + echapper(val) + '</strong>'
    : ' (pas encore répartis).';
  return (
    '<div class="bloc-terrains" data-terrains="' + (auto ? 'auto' : 'manuel') + '">' +
      '<span class="format-libelle">Terrains</span>' +
      '<div class="terr-mode">' +
        '<label class="terr-choix"><input type="radio" name="terrains_auto" value="oui"' + (auto ? ' checked' : '') + '> Auto</label>' +
        '<label class="terr-choix"><input type="radio" name="terrains_auto" value="non"' + (!auto ? ' checked' : '') + '> Manuel</label>' +
      '</div>' +
      // Champ manuel (toujours présent dans le DOM pour conserver la valeur ; masqué en mode Auto).
      '<label class="terr-manuel reglage">' +
        '<input class="r-input" type="text" name="terrains" value="' + echapper(val) + '" placeholder="ex : 1, 2">' +
        '<span class="f-aide">Numéros des terrains dédiés à cette catégorie, séparés par des virgules.</span>' +
      '</label>' +
      // Info mode Auto.
      '<p class="terr-auto-info">✅ Attribués automatiquement via l\'onglet « Terrains &amp; répartition »' + infoActuel + '</p>' +
      // Zone de conseils (mode Manuel), remplie par verifierTerrainsBloc().
      '<div class="terr-conseils" data-role="terr-conseils"></div>' +
    '</div>'
  );
}

/** Ensemble des numéros de mini-terrains QUI EXISTENT (pour la vérification d'existence).
 *  Source : la répartition calculée dans cette session si dispo, sinon les terrains déjà
 *  attribués aux catégories (dernière répartition appliquée). Vide = on ne peut pas vérifier. */
function ensembleTerrainsExistants() {
  const set = new Set();
  if (repartitionCalculee && repartitionCalculee.parCategorie) {
    Object.keys(repartitionCalculee.parCategorie).forEach(function (k) {
      (repartitionCalculee.parCategorie[k] || []).forEach(function (id) {
        const n = Number(id); if (!isNaN(n)) set.add(n);
      });
    });
  }
  (configCourante.categories || []).forEach(function (c) {
    String(c.terrains || '').split(',').map(function (s) { return s.trim(); })
      .forEach(function (t) { if (/^\d+$/.test(t)) set.add(Number(t)); });
  });
  return set;
}

/** Numéros de terrains utilisés par les AUTRES catégories → { numéro: [noms de catégories] }. */
function terrainsParAutreCategorie(nom) {
  const map = {};
  (configCourante.categories || []).forEach(function (c) {
    if (String(c.categorie) === String(nom) || !estPresente(c)) return;
    String(c.terrains || '').split(',').map(function (s) { return s.trim(); })
      .forEach(function (t) {
        if (!/^\d+$/.test(t)) return;
        const n = Number(t);
        (map[n] = map[n] || []).push(String(c.categorie));
      });
  });
  return map;
}

/**
 * Analyse une saisie manuelle de terrains et renvoie la liste des conseils.
 * @return {Array<{niveau:'ko'|'warn', texte:string}>}
 */
function analyserTerrainsManuels(nom, brut) {
  const conseils = [];
  const tokens = String(brut || '').split(',').map(function (s) { return s.trim(); })
    .filter(function (s) { return s !== ''; });

  // 1) Jetons non numériques.
  tokens.filter(function (t) { return !/^\d+$/.test(t); }).forEach(function (t) {
    conseils.push({ niveau: 'ko', texte: '« ' + t + ' » n\'est pas un numéro de terrain.' });
  });

  const nums = tokens.filter(function (t) { return /^\d+$/.test(t); }).map(Number);

  // 2) Aucun terrain alors qu'il y a des équipes.
  if (nums.length === 0) {
    const nbEq = (equipesParCategorie()[nom] || 0);
    if (nbEq > 0) conseils.push({ niveau: 'ko', texte: 'Cette catégorie a ' + nbEq + ' équipe(s) mais aucun terrain.' });
    return conseils;
  }

  // 3) Doublons dans la saisie elle-même.
  const vus = {};
  nums.forEach(function (n) {
    if (vus[n]) conseils.push({ niveau: 'warn', texte: 'Le terrain ' + n + ' est indiqué deux fois.' });
    vus[n] = true;
  });
  const uniques = Object.keys(vus).map(Number);

  // 4) Terrain aussi utilisé par une autre catégorie.
  const parAutre = terrainsParAutreCategorie(nom);
  uniques.forEach(function (n) {
    if (parAutre[n] && parAutre[n].length) {
      conseils.push({ niveau: 'warn', texte: 'Le terrain ' + n + ' est aussi utilisé par ' + parAutre[n].join(', ') + '.' });
    }
  });

  // 5) Terrain inexistant dans la répartition (si on connaît la liste des terrains existants).
  const existants = ensembleTerrainsExistants();
  if (existants.size) {
    const max = Math.max.apply(null, Array.from(existants));
    uniques.forEach(function (n) {
      if (!existants.has(n)) {
        conseils.push({ niveau: 'ko', texte: 'Le terrain ' + n + ' n\'existe pas dans ta répartition (les terrains vont de 1 à ' + max + ').' });
      }
    });
  }

  return conseils;
}

/** (Re)calcule et affiche les conseils d'un bloc Terrains (uniquement en mode Manuel). */
function verifierTerrainsBloc(bloc) {
  if (!bloc) return;
  const zone = bloc.querySelector('[data-role="terr-conseils"]');
  if (!zone) return;
  if (bloc.getAttribute('data-terrains') !== 'manuel') { zone.innerHTML = ''; return; }

  const form = bloc.closest('form.form-categorie');
  const nom = form ? form.getAttribute('data-cat') : '';
  const input = bloc.querySelector('input[name="terrains"]');
  const brut = input ? input.value : '';

  const conseils = analyserTerrainsManuels(nom, brut);
  if (!conseils.length) {
    zone.innerHTML = brut.trim()
      ? '<p class="terr-conseil ok">✅ Terrains valides.</p>'
      : '';
    return;
  }
  zone.innerHTML = conseils.map(function (c) {
    return '<p class="terr-conseil ' + c.niveau + '">⚠️ ' + echapper(c.texte) + '</p>';
  }).join('');
}

/**
 * Bloc « Format de l'après-midi » d'une catégorie : cartes cliquables (radio) avec explication
 * visible, champ « qualifiés en Coupe » (affiché seulement pour COUPE_PLATEAU) et récapitulatif.
 * L'affichage conditionnel est piloté par l'attribut data-format du bloc (voir onReglagesChange) :
 * pas besoin de :has(), ça marche sur tous les téléphones.
 */
function blocFormatApresMidi(cat) {
  const fmt = formatApresMidiDe(cat);
  const nbQ = nbQualifiesCoupeDe(cat);

  const cartes = FORMATS_APRESMIDI.map(function (f) {
    const choisi = (f.cle === fmt);
    return (
      '<label class="format-carte f-' + f.cle + (choisi ? ' est-choisi' : '') + '">' +
        '<input type="radio" name="format_apresmidi" value="' + f.cle + '"' + (choisi ? ' checked' : '') + '>' +
        '<span class="f-corps">' +
          '<span class="f-titre">' + echapper(f.titre) + '</span>' +
          '<span class="f-desc">' + echapper(f.desc) + '</span>' +
        '</span>' +
      '</label>'
    );
  }).join('');

  // Récaps : un par format, révélé selon data-format (texte concret pour confirmer le choix).
  const recaps =
    '<span class="format-recap r-CROISE">Après-midi : <b>classement croisé</b> — matchs équilibrés par niveau ; le vainqueur du Niveau 1 remporte le tournoi (classement général + podium).</span>' +
    '<span class="format-recap r-CROISE_DIAGONAL">Après-midi : <b>classement croisé DIAGONAL</b> — le 1ᵉʳ d\'une poule affronte le 2ᵉ d\'une AUTRE poule (croisement en diagonale, à ne pas confondre avec le croisé simple 1ᵉʳ-contre-1ᵉʳ). Résultats cumulés au classement général + podium.</span>' +
    '<span class="format-recap r-LIBRE">Après-midi : <b>matchs libres</b> — amicaux, sans classement ni podium (idéal pour les plus jeunes).</span>' +
    '<span class="format-recap r-COUPE_PLATEAU">Après-midi : <b>Coupe + Plateau</b> — les premiers de chaque poule en élimination directe (finale + petite finale), les autres en plateau.</span>';

  return (
    '<div class="bloc-format" data-format="' + fmt + '">' +
      '<span class="format-libelle">Format de l\'après-midi</span>' +
      '<div class="format-cartes">' + cartes + '</div>' +
      '<label class="format-coupe-param reglage">' +
        '<span class="r-libelle">Qualifiés en Coupe (par poule)</span>' +
        '<input class="r-input" type="number" min="1" name="nbQualifiesCoupe" value="' + echapper(String(nbQ)) + '">' +
        '<span class="f-aide">Les premiers de chaque poule partent en Coupe ; les autres vont automatiquement en Plateau.</span>' +
      '</label>' +
      '<div class="format-recap-zone">' + recaps + '</div>' +
    '</div>'
  );
}

/**
 * Un champ modifiable d'une catégorie (input texte/nombre ou menu déroulant).
 * On enveloppe le champ dans un <label> (pas d'id, pour éviter les doublons).
 */
function champCategorie(champ, valeur) {
  let controle;
  if (champ.type === 'select') {
    let options = '';
    champ.options.forEach(function (opt) {
      options += '<option value="' + opt + '"' + (String(valeur) === opt ? ' selected' : '') + '>' + opt + '</option>';
    });
    controle = '<select class="r-input" name="' + champ.cle + '">' + options + '</select>';
  } else {
    const attrs = (champ.type === 'number') ? ' min="0"' : '';
    const ph = champ.placeholder ? ' placeholder="' + echapper(champ.placeholder) + '"' : '';
    controle = '<input class="r-input" type="' + champ.type + '"' + attrs + ph +
               ' name="' + champ.cle + '" value="' + echapper(valeur) + '">';
  }
  return '<label class="reglage"><span class="r-libelle">' + champ.label + '</span>' + controle + '</label>';
}

/**
 * Enregistre les modifications d'une catégorie.
 */
async function onEnregistrerCategorie(evenement) {
  evenement.preventDefault();
  const form = evenement.target;
  const message = form.querySelector('.message-cat');
  const nom = form.getAttribute('data-cat');

  // On rassemble les valeurs du formulaire. Toute catégorie existante est active
  // (le réglage « Présente » a été retiré) → on envoie toujours 'oui'.
  const data = { categorie: nom, presente: 'oui' };
  CHAMPS_CATEGORIE.forEach(function (champ) {
    data[champ.cle] = form[champ.cle].value;
  });

  // Effectifs par équipe (dossier club) : optionnels, mais si les deux sont saisis, min ≤ max.
  const effMin = parseInt(data.effectif_min, 10);
  const effMax = parseInt(data.effectif_max, 10);
  if (isFinite(effMin) && isFinite(effMax) && effMin > effMax) {
    afficherMessage(message, "⚠️ Effectif min (" + effMin + ") supérieur à l'effectif max (" + effMax + ").", 'ko');
    return;
  }
  // Terrains : bloc dédié (Auto / Manuel). Le champ texte garde sa valeur même masqué en Auto.
  data.terrains = form.terrains ? String(form.terrains.value).trim() : '';
  data.terrains_auto = (form.terrains_auto && form.terrains_auto.value === 'non') ? 'non' : 'oui';

  // Format d'après-midi + son paramètre JSON (nbQualifiesCoupe seulement pour COUPE_PLATEAU).
  const fmt = (form.format_apresmidi && form.format_apresmidi.value) ? form.format_apresmidi.value : 'CROISE';
  data.format_apresmidi = fmt;
  if (fmt === 'COUPE_PLATEAU') {
    let nbQ = parseInt(form.nbQualifiesCoupe && form.nbQualifiesCoupe.value, 10);
    if (!isFinite(nbQ) || nbQ < 1) nbQ = 2;
    data.param_format = JSON.stringify({ nbQualifiesCoupe: nbQ });
  } else {
    data.param_format = '';
  }

  const bouton = form.querySelector('button[type="submit"]');
  await avecBoutonOccupe(bouton, message, async function () {
    await ecrireAdmin('enregistrerCategorie', data);
    // On met à jour la config en mémoire + le menu des équipes, sans tout re-rendre
    // (pour garder le message et l'endroit où on est).
    const idx = configCourante.categories.findIndex(function (c) { return c.categorie === nom; });
    if (idx >= 0) configCourante.categories[idx] = Object.assign({}, configCourante.categories[idx], data);
    // Catégorie ENREGISTRÉE → l'assistant reprend sa photo de référence.
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);
    remplirSelectCategories(configCourante.categories);
    majTableauBord(); // le nombre de catégories « présentes » a pu changer
    majDossier();     // le cadre sportif du dossier club suit
    afficherMessage(message, '✅ Enregistré.', 'ok');
  });
}

/**
 * Ajoute une nouvelle catégorie (avec des valeurs de départ modifiables ensuite).
 */
/** Nom de catégorie « normalisé » pour comparer sans piège : minuscules, sans
 *  accents (é → e), espaces réduits. Détecte les doublons du type «  u10 » / « U10 ». */
function normaliserNomCategorie(nom) {
  return String(nom || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève les accents (é → e + accent séparé)
    .replace(/\s+/g, ' ')                             // espaces multiples → un seul
    .trim()
    .toLowerCase();
}

async function onAjouterCategorie(evenement) {
  evenement.preventDefault();
  const form = evenement.target;
  const message = form.querySelector('[data-role="msg-ajout-cat"]');
  const nom = form.categorie.value.trim();

  if (!nom) { afficherMessage(message, 'Indique un nom.', 'ko'); return; }

  // On refuse un doublon (sinon on écraserait la catégorie existante).
  // Comparaison SOUPLE : casse, accents et espaces ignorés («  u10 » = « U10 »).
  const doublon = (configCourante.categories || []).find(function (c) {
    return normaliserNomCategorie(c.categorie) === normaliserNomCategorie(nom);
  });
  if (doublon) {
    afficherMessage(message, '⚠️ La catégorie « ' + doublon.categorie + ' » existe déjà.', 'ko');
    return;
  }

  const data = {
    categorie: nom, presente: 'oui', terrains: '', terrains_auto: 'oui', nb_poules: '',
    format_mi_temps: '2', duree_mi_temps_min: '10', pause_mi_temps_min: '2',
    recup_entre_matchs_min: '15', format_apresmidi: 'CROISE', param_format: '',
    reglement: '', effectif_min: '', effectif_max: '', arbitrage_organisation: ''
  };

  const bouton = form.querySelector('button');
  bouton.disabled = true;
  try {
    await ecrireAdmin('enregistrerCategorie', data);
    await rechargerReglages(); // la nouvelle carte apparaît
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    bouton.disabled = false;
  }
}

/**
 * Supprime une catégorie (après confirmation).
 */
async function onSupprimerCategorie(bouton) {
  const nom = bouton.getAttribute('data-cat');
  if (!await dialogConfirmer('Supprimer la catégorie « ' + nom + ' » ?\n' +
               '(Les équipes de cette catégorie ne sont pas supprimées.)',
               { ok: 'Supprimer', danger: true })) return;

  bouton.disabled = true;
  try {
    await ecrireAdmin('supprimerCategorie', { categorie: nom });
    await rechargerReglages();
  } catch (erreur) {
    await dialogAlerter('Erreur : ' + erreur.message);
    bouton.disabled = false;
  }
}
