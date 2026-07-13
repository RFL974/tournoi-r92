/**
 * ============================================================================
 *  ADMIN — logique de la page d'administration
 * ============================================================================
 *  - Affiche les réglages (horaires globaux + catégories) lus depuis le backend.
 *  - Permet de saisir les équipes (ajout / suppression), écrites dans le Sheet.
 * ============================================================================
 */

/* Libellés lisibles pour les réglages d'une catégorie. */
const LIBELLES_CATEGORIE = {
  terrains:               'Terrains',
  taille_poule_cible:     'Taille de poule',
  format_mi_temps:        'Nb mi-temps',
  duree_mi_temps_min:     'Durée mi-temps',
  pause_mi_temps_min:     'Pause mi-temps',
  recup_entre_matchs_min: 'Récup. entre matchs'
};

/* On garde en mémoire la config chargée (utile pour regrouper les équipes). */
let configCourante = { global: {}, categories: [] };

/**
 * Vrai si une catégorie est marquée présente ("oui", quelle que soit la casse).
 */
function estPresente(cat) {
  return String(cat.presente).toLowerCase() === 'oui';
}

/**
 * Au chargement de la page : on récupère tout (config + équipes) en un appel,
 * puis on remplit la page.
 */
async function initAdmin() {
  const zoneReglages = document.getElementById('reglages');

  try {
    const data = await apiGet('getAll'); // { config, equipes, poules, matchs }
    configCourante = data.config;

    // 1) Réglages
    zoneReglages.innerHTML =
      afficherHoraires(data.config.global) + afficherCategories(data.config.categories);

    // On branche le formulaire des horaires (présent seulement si la config a chargé).
    const formHoraires = document.getElementById('form-horaires');
    if (formHoraires) formHoraires.addEventListener('submit', onEnregistrerHoraires);

    // 2) Équipes : on remplit la liste déroulante des catégories et la liste des équipes
    remplirSelectCategories(data.config.categories);
    afficherEquipes(data.equipes);

  } catch (erreur) {
    zoneReglages.innerHTML =
      '<div class="message erreur">Impossible de charger les réglages.<br>' +
      'Détail : ' + erreur.message + '</div>';
  }

  // On branche le formulaire d'ajout et les boutons de suppression.
  document.getElementById('form-equipe').addEventListener('submit', onAjouterEquipe);
  document.getElementById('liste-equipes').addEventListener('click', onClicListe);
}

/* --------------------------------------------------------------------------
   AFFICHAGE DES RÉGLAGES
   -------------------------------------------------------------------------- */

/**
 * Carte "Horaires de la journée" sous forme de FORMULAIRE modifiable.
 * Les heures utilisent le champ natif <input type="time"> (rouleau sur mobile).
 */
function afficherHoraires(global) {
  function val(cle) {
    return (global && global[cle] != null) ? echapper(String(global[cle])) : '';
  }
  return (
    '<section class="carte">' +
      '<h2>Horaires de la journée</h2>' +
      '<form id="form-horaires" class="form-reglages">' +
        champHeure('heure_debut', 'Heure de début', val('heure_debut')) +
        champHeure('heure_fin', 'Heure de fin', val('heure_fin')) +
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

/* Un champ "heure" (rouleau natif sur mobile). */
function champHeure(nom, label, valeur) {
  return '<div class="champ-reglage">' +
           '<label for="h-' + nom + '">' + label + '</label>' +
           '<input type="time" id="h-' + nom + '" name="' + nom + '" value="' + valeur + '">' +
         '</div>';
}

/* Un champ "nombre" (ex : durée en minutes). */
function champNombre(nom, label, valeur) {
  return '<div class="champ-reglage">' +
           '<label for="h-' + nom + '">' + label + '</label>' +
           '<input type="number" id="h-' + nom + '" name="' + nom + '" min="0" step="5" value="' + valeur + '">' +
         '</div>';
}

/**
 * Enregistre les horaires quand on soumet le formulaire.
 */
async function onEnregistrerHoraires(evenement) {
  evenement.preventDefault();
  const form = evenement.target;
  const message = document.getElementById('message-horaires');

  const data = {
    heure_debut:              form.heure_debut.value,
    heure_fin:                form.heure_fin.value,
    pause_dejeuner_debut:     form.pause_dejeuner_debut.value,
    pause_dejeuner_duree_min: form.pause_dejeuner_duree_min.value
  };

  if (!data.heure_debut || !data.heure_fin) {
    afficherMessage(message, "Renseigne au moins l'heure de début et de fin.", 'ko');
    return;
  }

  const bouton = form.querySelector('button');
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Enregistrement…';

  try {
    await apiPost('enregistrerHoraires', data);
    // On met à jour la config gardée en mémoire.
    configCourante.global = Object.assign({}, configCourante.global, data);
    afficherMessage(message, '✅ Horaires enregistrés.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

function afficherCategories(categories) {
  if (!categories || categories.length === 0) {
    return '<div class="message">Aucune catégorie configurée.</div>';
  }

  let html = '<h2 style="margin:24px 0 12px;">Catégories</h2>';

  categories.forEach(function (cat) {
    const badgeStatut = estPresente(cat)
      ? '<span class="statut-present">Présente</span>'
      : '<span class="statut-absent">Absente</span>';

    let reglages = '';
    for (const cle in LIBELLES_CATEGORIE) {
      const valeur = (cat[cle] != null && cat[cle] !== '') ? cat[cle] : '—';
      reglages +=
        '<div class="reglage">' +
          '<span class="r-libelle">' + LIBELLES_CATEGORIE[cle] + '</span>' +
          '<span class="r-valeur">' + valeur + '</span>' +
        '</div>';
    }

    html +=
      '<section class="carte categorie">' +
        '<div class="ligne-info">' +
          '<span class="badge">' + (cat.categorie || '?') + '</span>' +
          badgeStatut +
        '</div>' +
        '<div class="grille-reglages">' + reglages + '</div>' +
      '</section>';
  });

  return html;
}

/* --------------------------------------------------------------------------
   ÉQUIPES
   -------------------------------------------------------------------------- */

/**
 * Remplit la liste déroulante avec les catégories PRÉSENTES.
 */
function remplirSelectCategories(categories) {
  const select = document.getElementById('champ-categorie');
  // On garde la 1re option "Catégorie…" et on ajoute les catégories présentes.
  select.innerHTML = '<option value="">Catégorie…</option>';
  categories.filter(estPresente).forEach(function (cat) {
    const opt = document.createElement('option');
    opt.value = cat.categorie;
    opt.textContent = cat.categorie;
    select.appendChild(opt);
  });
}

/**
 * Affiche la liste des équipes, regroupées par catégorie.
 * @param {Object[]} equipes
 */
function afficherEquipes(equipes) {
  const zone = document.getElementById('liste-equipes');

  if (!equipes || equipes.length === 0) {
    zone.innerHTML = '<p class="vide">Aucune équipe saisie pour le moment.</p>';
    return;
  }

  // On regroupe les équipes par catégorie.
  const parCategorie = {};
  equipes.forEach(function (eq) {
    const cat = eq.categorie || '(sans catégorie)';
    if (!parCategorie[cat]) parCategorie[cat] = [];
    parCategorie[cat].push(eq);
  });

  // On affiche dans l'ordre des catégories de la config, puis les éventuelles autres.
  const ordre = configCourante.categories.map(function (c) { return c.categorie; });
  Object.keys(parCategorie).forEach(function (c) {
    if (ordre.indexOf(c) === -1) ordre.push(c);
  });

  let html = '';
  ordre.forEach(function (cat) {
    const liste = parCategorie[cat];
    if (!liste) return;

    let items = '';
    liste.forEach(function (eq) {
      items +=
        '<div class="equipe-item">' +
          '<span class="nom">' + echapper(eq.nom_equipe) + '</span>' +
          '<button class="bouton-suppr" data-id="' + eq.id_equipe + '" ' +
                  'data-nom="' + echapper(eq.nom_equipe) + '">Supprimer</button>' +
        '</div>';
    });

    html +=
      '<div class="groupe-categorie">' +
        '<h3>' + cat + ' <span class="cat-mini">(' + liste.length + ')</span></h3>' +
        items +
      '</div>';
  });

  zone.innerHTML = html;
}

/**
 * Quand on soumet le formulaire d'ajout d'équipe.
 */
async function onAjouterEquipe(evenement) {
  evenement.preventDefault(); // empêche le rechargement de la page

  const champNom = document.getElementById('champ-nom');
  const champCat = document.getElementById('champ-categorie');
  const bouton   = document.getElementById('bouton-ajouter');
  const message  = document.getElementById('message-equipe');

  const nom = champNom.value.trim();
  const categorie = champCat.value;

  if (!nom || !categorie) {
    afficherMessage(message, 'Indique un nom ET une catégorie.', 'ko');
    return;
  }

  // On désactive le bouton le temps de l'envoi (évite les doubles clics).
  bouton.disabled = true;
  bouton.textContent = 'Ajout…';

  try {
    await apiPost('ajouterEquipe', { nom_equipe: nom, categorie: categorie });

    // Succès : on vide le champ nom, on recharge la liste.
    champNom.value = '';
    champNom.focus();
    afficherMessage(message, '✅ « ' + nom +' » ajoutée.', 'ok');
    await rechargerEquipes();

  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = 'Ajouter';
  }
}

/**
 * Clic dans la liste : on gère les boutons "Supprimer".
 */
async function onClicListe(evenement) {
  const bouton = evenement.target.closest('.bouton-suppr');
  if (!bouton) return; // clic ailleurs que sur un bouton supprimer

  const id = bouton.getAttribute('data-id');
  const nom = bouton.getAttribute('data-nom');
  const message = document.getElementById('message-equipe');

  if (!confirm('Supprimer l\'équipe « ' + nom + ' » ?')) return;

  bouton.disabled = true;
  try {
    await apiPost('supprimerEquipe', { id_equipe: id });
    afficherMessage(message, '🗑️ « ' + nom + ' » supprimée.', 'ok');
    await rechargerEquipes();
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    bouton.disabled = false;
  }
}

/**
 * Recharge uniquement la liste des équipes depuis le backend.
 */
async function rechargerEquipes() {
  const equipes = await apiGet('getEquipes');
  afficherEquipes(equipes);
}

/* --------------------------------------------------------------------------
   PETITES AIDES
   -------------------------------------------------------------------------- */

/** Affiche un message de retour (succès/erreur) sous le formulaire. */
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
document.addEventListener('DOMContentLoaded', initAdmin);
