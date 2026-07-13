/**
 * ============================================================================
 *  ADMIN — logique de la page d'administration
 * ============================================================================
 *  - Affiche les réglages (horaires globaux + catégories) lus depuis le backend.
 *  - Permet de saisir les équipes (ajout / suppression), écrites dans le Sheet.
 * ============================================================================
 */

/* Champs modifiables d'une catégorie : clé (dans le Sheet), libellé, type de champ. */
const CHAMPS_CATEGORIE = [
  { cle: 'terrains',               label: 'Terrains',                  type: 'text' },
  { cle: 'taille_poule_cible',     label: 'Taille de poule',           type: 'number' },
  { cle: 'format_mi_temps',        label: 'Nb mi-temps',               type: 'select', options: ['1', '2'] },
  { cle: 'duree_mi_temps_min',     label: 'Durée mi-temps (min)',      type: 'number' },
  { cle: 'pause_mi_temps_min',     label: 'Pause mi-temps (min)',      type: 'number' },
  { cle: 'recup_entre_matchs_min', label: 'Récup. entre matchs (min)', type: 'number' }
];

/* On garde en mémoire la config et les équipes chargées (pour l'affichage). */
let configCourante = { global: {}, categories: [] };
let equipesCourantes = [];

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
    equipesCourantes = data.equipes;

    // 1) Réglages (horaires + catégories)
    zoneReglages.innerHTML =
      afficherHoraires(data.config.global) + afficherCategories(data.config.categories);

    // 2) Équipes : on remplit la liste déroulante des catégories et la liste des équipes
    remplirSelectCategories(data.config.categories);
    afficherEquipes(data.equipes);

    // 3) Poules & planning déjà générés (s'il y en a)
    afficherPlanning(data.poules, data.matchs);

  } catch (erreur) {
    zoneReglages.innerHTML =
      '<div class="message erreur">Impossible de charger les réglages.<br>' +
      'Détail : ' + erreur.message + '</div>';
  }

  // On branche le formulaire d'ajout et les boutons de suppression (équipes).
  document.getElementById('form-equipe').addEventListener('submit', onAjouterEquipe);
  document.getElementById('liste-equipes').addEventListener('click', onClicListe);

  // Zone réglages : écouteurs "délégués" (valables même après re-rendu de la zone).
  // (zoneReglages est déjà déclaré en haut de initAdmin.)
  zoneReglages.addEventListener('submit', onReglagesSubmit);
  zoneReglages.addEventListener('click', onReglagesClick);

  // Bouton de génération des poules et du planning.
  document.getElementById('bouton-generer').addEventListener('click', onGenerer);
}

/**
 * Aiguille les envois de formulaire de la zone réglages vers la bonne fonction.
 */
function onReglagesSubmit(evenement) {
  const form = evenement.target;
  if (form.id === 'form-horaires')          return onEnregistrerHoraires(evenement);
  if (form.id === 'form-ajout-categorie')   return onAjouterCategorie(evenement);
  if (form.classList.contains('form-categorie')) return onEnregistrerCategorie(evenement);
}

/**
 * Aiguille les clics de la zone réglages (boutons "Supprimer" de catégorie).
 */
function onReglagesClick(evenement) {
  const bouton = evenement.target.closest('.bouton-suppr-cat');
  if (bouton) onSupprimerCategorie(bouton);
}

/**
 * Recharge la config depuis le backend et re-affiche toute la zone réglages
 * (utilisé après ajout/suppression de catégorie).
 */
async function rechargerReglages() {
  const cfg = await apiGet('getConfig');
  configCourante = cfg;
  document.getElementById('reglages').innerHTML =
    afficherHoraires(cfg.global) + afficherCategories(cfg.categories);
  remplirSelectCategories(cfg.categories); // le menu des équipes suit les catégories présentes
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

/**
 * Affiche les catégories sous forme de FORMULAIRES modifiables (une carte par catégorie),
 * suivies d'un formulaire pour ajouter une nouvelle catégorie.
 */
function afficherCategories(categories) {
  let html = '<h2 style="margin:24px 0 12px;">Catégories</h2>';

  if (categories && categories.length > 0) {
    categories.forEach(function (cat) {
      html += formulaireCategorie(cat);
    });
  } else {
    html += '<p class="vide">Aucune catégorie. Ajoute-en une ci-dessous.</p>';
  }

  // Formulaire d'ajout d'une catégorie.
  html +=
    '<form id="form-ajout-categorie" class="carte">' +
      '<h3 style="color:var(--bleu-ciel);margin-bottom:10px;">Ajouter une catégorie</h3>' +
      '<div class="form-equipe">' +
        '<input type="text" name="categorie" placeholder="Nom (ex : U16)" autocomplete="off" required>' +
        '<button type="submit" class="bouton">Ajouter</button>' +
      '</div>' +
      '<div class="message-form" data-role="msg-ajout-cat"></div>' +
    '</form>';

  return html;
}

/**
 * Construit le formulaire modifiable d'une catégorie.
 */
function formulaireCategorie(cat) {
  const nom = cat.categorie || '?';
  const coche = estPresente(cat) ? ' checked' : '';

  let champs = '';
  CHAMPS_CATEGORIE.forEach(function (champ) {
    const valeur = (cat[champ.cle] != null) ? String(cat[champ.cle]) : '';
    champs += champCategorie(champ, valeur);
  });

  return (
    '<form class="carte categorie form-categorie" data-cat="' + echapper(nom) + '">' +
      '<div class="ligne-info">' +
        '<span class="badge">' + echapper(nom) + '</span>' +
        '<label class="toggle"><input type="checkbox" name="presente"' + coche + '> Présente</label>' +
      '</div>' +
      '<div class="grille-reglages">' + champs + '</div>' +
      '<div class="ligne-action">' +
        '<button type="submit" class="bouton">Enregistrer</button>' +
        '<button type="button" class="bouton-suppr bouton-suppr-cat" data-cat="' + echapper(nom) + '">Supprimer</button>' +
        '<span class="message-form message-cat"></span>' +
      '</div>' +
    '</form>'
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
    controle = '<input class="r-input" type="' + champ.type + '"' + attrs +
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

  // On rassemble les valeurs du formulaire.
  const data = { categorie: nom, presente: form.presente.checked ? 'oui' : 'non' };
  CHAMPS_CATEGORIE.forEach(function (champ) {
    data[champ.cle] = form[champ.cle].value;
  });
  if (typeof data.terrains === 'string') data.terrains = data.terrains.trim();

  const bouton = form.querySelector('button[type="submit"]');
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Enregistrement…';

  try {
    await apiPost('enregistrerCategorie', data);
    // On met à jour la config en mémoire + le menu des équipes, sans tout re-rendre
    // (pour garder le message et l'endroit où on est).
    const idx = configCourante.categories.findIndex(function (c) { return c.categorie === nom; });
    if (idx >= 0) configCourante.categories[idx] = Object.assign({}, configCourante.categories[idx], data);
    remplirSelectCategories(configCourante.categories);
    afficherMessage(message, '✅ Enregistré.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

/**
 * Ajoute une nouvelle catégorie (avec des valeurs de départ modifiables ensuite).
 */
async function onAjouterCategorie(evenement) {
  evenement.preventDefault();
  const form = evenement.target;
  const message = form.querySelector('[data-role="msg-ajout-cat"]');
  const nom = form.categorie.value.trim();

  if (!nom) { afficherMessage(message, 'Indique un nom.', 'ko'); return; }

  // On refuse un doublon (sinon on écraserait la catégorie existante).
  const existe = configCourante.categories.some(function (c) {
    return String(c.categorie).toLowerCase() === nom.toLowerCase();
  });
  if (existe) { afficherMessage(message, 'Cette catégorie existe déjà.', 'ko'); return; }

  const data = {
    categorie: nom, presente: 'oui', terrains: '', taille_poule_cible: '4',
    format_mi_temps: '2', duree_mi_temps_min: '10', pause_mi_temps_min: '2',
    recup_entre_matchs_min: '15'
  };

  const bouton = form.querySelector('button');
  bouton.disabled = true;
  try {
    await apiPost('enregistrerCategorie', data);
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
  if (!confirm('Supprimer la catégorie « ' + nom + ' » ?\n' +
               '(Les équipes de cette catégorie ne sont pas supprimées.)')) return;

  bouton.disabled = true;
  try {
    await apiPost('supprimerCategorie', { categorie: nom });
    await rechargerReglages();
  } catch (erreur) {
    alert('Erreur : ' + erreur.message);
    bouton.disabled = false;
  }
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
  equipesCourantes = equipes;
  afficherEquipes(equipes);
}

/* --------------------------------------------------------------------------
   GÉNÉRATION (poules + planning)
   -------------------------------------------------------------------------- */

/**
 * Lance la génération des poules et du planning, puis affiche le résultat.
 */
async function onGenerer() {
  const bouton  = document.getElementById('bouton-generer');
  const message = document.getElementById('message-generation');

  if (!confirm('Générer les poules et le planning ?\n\n' +
               'Cela EFFACE les poules, matchs et scores déjà saisis.')) return;

  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Génération…';
  afficherMessage(message, 'Génération en cours…', 'ok');

  try {
    const res = await apiPost('genererPoulesEtPlanning', {});
    const nbP = (res && res.nb_poules != null) ? res.nb_poules : '?';
    const nbM = (res && res.nb_matchs != null) ? res.nb_matchs : '?';
    let texte = '✅ ' + nbP + ' poule(s) et ' + nbM + ' match(s) générés.';
    if (res && res.avertissements && res.avertissements.length) {
      texte += '\n⚠️ ' + res.avertissements.join('\n⚠️ ');
    }
    afficherMessage(message, texte, (res && res.avertissements && res.avertissements.length) ? 'ko' : 'ok');

    // On recharge tout pour afficher le planning (et les poules des équipes).
    const data = await apiGet('getAll');
    equipesCourantes = data.equipes;
    afficherPlanning(data.poules, data.matchs);
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

/**
 * Affiche les poules (composition) et le planning des matchs, par catégorie.
 */
function afficherPlanning(poules, matchs) {
  const zone = document.getElementById('affichage-planning');
  poules = poules || [];
  matchs = matchs || [];

  if (poules.length === 0 && matchs.length === 0) {
    zone.innerHTML = '<p class="vide">Pas encore de planning. Clique sur « Générer ».</p>';
    return;
  }

  // Nom d'une équipe à partir de son identifiant.
  function nom(id) {
    const e = equipesCourantes.find(function (x) { return x.id_equipe === id; });
    return e ? e.nom_equipe : id;
  }

  // Liste ordonnée des catégories concernées.
  const cats = [];
  poules.forEach(function (p) { if (cats.indexOf(p.categorie) < 0) cats.push(p.categorie); });
  matchs.forEach(function (m) { if (cats.indexOf(m.categorie) < 0) cats.push(m.categorie); });

  let html = '';
  cats.forEach(function (cat) {
    html += '<h3 style="color:var(--bleu-ciel);margin:20px 0 8px;">' + echapper(cat) + '</h3>';

    // Composition des poules de la catégorie.
    poules.filter(function (p) { return p.categorie === cat; }).forEach(function (p) {
      const membres = equipesCourantes
        .filter(function (e) { return e.categorie === cat && e.poule === p.nom_poule; })
        .map(function (e) { return echapper(e.nom_equipe); });
      html += '<div class="poule-compo"><strong>Poule ' + echapper(p.nom_poule) + '</strong> : ' +
              (membres.join(', ') || '—') + '</div>';
    });

    // Planning des matchs de la catégorie, triés par heure.
    const ms = matchs.filter(function (m) { return m.categorie === cat; }).slice()
      .sort(function (a, b) { return String(a.heure_debut).localeCompare(String(b.heure_debut)); });

    if (ms.length) {
      html += '<div class="table-scroll"><table class="table-planning">' +
              '<thead><tr><th>Heure</th><th>Ter.</th><th>Poule</th><th>Match</th></tr></thead><tbody>';
      ms.forEach(function (m) {
        html += '<tr>' +
                  '<td>' + echapper(m.heure_debut) + '</td>' +
                  '<td>' + echapper(String(m.terrain)) + '</td>' +
                  '<td>' + echapper(String(m.poule)) + '</td>' +
                  '<td>' + echapper(nom(m.equipe_A)) + ' <span class="vs">vs</span> ' + echapper(nom(m.equipe_B)) + '</td>' +
                '</tr>';
      });
      html += '</tbody></table></div>';
    }
  });

  zone.innerHTML = html;
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
