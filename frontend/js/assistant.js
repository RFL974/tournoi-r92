/**
 * ============================================================================
 *  ASSISTANT À CARTES — présentation guidée de la page admin (étape 4a)
 * ============================================================================
 *  Objectif : montrer les sections existantes UNE PAR UNE, sous forme de cartes
 *  qui glissent, sans rien réécrire. On DÉPLACE simplement les blocs existants
 *  dans un carrousel (déplacer un nœud DOM conserve ses écouteurs), donc toute
 *  la logique déjà en place (formulaires, boutons, cerveau) continue de marcher.
 *
 *  Une échappatoire « Vue classique » remet les blocs à leur place d'origine :
 *  la page telle qu'elle existait reste accessible en un clic (filet de sécurité).
 *  Le choix (assistant / classique) est mémorisé dans le navigateur.
 *
 *  VERROU « SUIVANT » : pendant la préparation, on ne passe à la carte suivante
 *  que si l'étape en cours est COMPLÈTE (enregistrée / générée / répartie, d'après
 *  le « cerveau » calculerEtatsEtapes d'admin.js) ET sans modification en attente
 *  (formulaire modifié depuis le dernier enregistrement, répartition calculée mais
 *  pas appliquée, édition de poules en cours). Modifier après avoir enregistré
 *  referme le verrou : il faut ré-enregistrer / régénérer / ré-appliquer.
 * ============================================================================
 */

/* Ordre des cartes = ordre logique de préparation (le même que le « cerveau »).
   Chaque carte réutilise un ou plusieurs blocs EXISTANTS (par leur id). */
const ASSISTANT_ETAPES = [
  { id: 'infos',     titre: 'Infos',        icone: '📝', blocs: ['bloc-infos-tournoi'] },
  { id: 'reglages',  titre: 'Réglages',     icone: '⏱️', blocs: ['reglages'] },
  { id: 'equipes',   titre: 'Équipes',      icone: '👥', blocs: ['bloc-equipes'] },
  { id: 'terrains',  titre: 'Terrains',     icone: '🗺️', blocs: ['bloc-terrains'] },
  { id: 'poules',    titre: 'Poules',       icone: '🎲', blocs: ['bloc-generation'] },
  { id: 'apresmidi', titre: 'Après-midi',   icone: '🏉', blocs: ['bloc-apresmidi'] },
  { id: 'resume',    titre: 'Résumé',       icone: '📋', blocs: ['tableau-bord', 'etat-avancement', 'bloc-publication', 'bloc-reinitialisation'] }
];

const ASSISTANT_CLE_PREF = 'r92_mode_admin'; // 'assistant' (défaut) | 'classique'

let assistantIndex = 0;
let assistantOrdreOrigine = null; // ids des blocs dans leur ordre DOM d'origine (pour restaurer)
let assistantObserver = null;

/** Point d'entrée : appelé à la fin de initAdmin(). Respecte la préférence mémorisée. */
function initAssistant() {
  // Mémorise l'ordre d'origine des blocs (pour la « vue classique »).
  if (!assistantOrdreOrigine) {
    assistantOrdreOrigine = ASSISTANT_ETAPES
      .reduce(function (acc, e) { return acc.concat(e.blocs); }, [])
      .filter(function (id) { return document.getElementById(id); });
  }
  const pref = (function () { try { return localStorage.getItem(ASSISTANT_CLE_PREF); } catch (e) { return null; } })();
  if (pref === 'classique') afficherBoutonReprise();
  else construireAssistant();
}

/** Construit le carrousel et y déplace les blocs existants. */
function construireAssistant() {
  const main = document.querySelector('main');
  if (!main || document.getElementById('assistant')) return;
  retirerBoutonReprise();

  const asst = document.createElement('div');
  asst.id = 'assistant';
  asst.innerHTML =
    '<header class="asst-tete">' +
      '<ol class="asst-stepper" id="asst-stepper"></ol>' +
      '<button type="button" class="bouton-lien asst-classique" id="asst-vue-classique">Vue classique ✕</button>' +
    '</header>' +
    '<div class="asst-barre"><span class="asst-barre-jauge" id="asst-barre-jauge"></span></div>' +
    '<div class="asst-viewport"><div class="asst-track" id="asst-track"></div></div>' +
    '<div class="asst-verrou" id="asst-verrou" hidden></div>' +
    '<footer class="asst-pied">' +
      '<button type="button" class="bouton asst-nav asst-prec" id="asst-prec">◀ Précédent</button>' +
      '<span class="asst-compteur" id="asst-compteur"></span>' +
      '<button type="button" class="bouton asst-nav asst-suiv" id="asst-suiv">Suivant ▶</button>' +
    '</footer>';

  const track = asst.querySelector('#asst-track');
  ASSISTANT_ETAPES.forEach(function (et, i) {
    const slide = document.createElement('section');
    slide.className = 'asst-slide';
    slide.setAttribute('data-index', i);
    et.blocs.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) slide.appendChild(el); // DÉPLACE le bloc (écouteurs conservés)
    });
    track.appendChild(slide);
  });
  main.appendChild(asst);

  // Fil d'étapes (cliquable pour sauter directement).
  const stepper = asst.querySelector('#asst-stepper');
  ASSISTANT_ETAPES.forEach(function (et, i) {
    const li = document.createElement('li');
    li.className = 'asst-step';
    li.setAttribute('data-index', i);
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.innerHTML = '<span class="asst-step-num">' + et.icone + '</span>' +
                   '<span class="asst-step-nom">' + echapperAsst(et.titre) + '</span>';
    stepper.appendChild(li);
  });

  // Écouteurs (délégués, robustes au re-rendu).
  stepper.addEventListener('click', onStepperClic);
  stepper.addEventListener('keydown', onStepperClic);
  asst.querySelector('#asst-prec').addEventListener('click', function () { allerA(assistantIndex - 1, -1); });
  asst.querySelector('#asst-suiv').addEventListener('click', function () { allerA(assistantIndex + 1, 1); });
  asst.querySelector('#asst-vue-classique').addEventListener('click', quitterAssistant);

  // Navigation au clavier (flèches ← →), sauf quand on saisit dans un champ.
  document.removeEventListener('keydown', onClavierAssistant);
  document.addEventListener('keydown', onClavierAssistant);

  // Verrou « Suivant » : toute saisie ou clic dans une carte peut changer l'état
  // (champ modifié, répartition calculée, édition de poules ouverte…) → on réévalue
  // juste après (les écouteurs métier d'admin.js s'exécutent d'abord).
  track.addEventListener('input', assistantMajVerrouDiffere);
  track.addEventListener('change', assistantMajVerrouDiffere);
  track.addEventListener('click', assistantMajVerrouDiffere);
  // Photo d'un formulaire jamais vu AVANT la première frappe (référence = état enregistré).
  track.addEventListener('focusin', assistantNoterZoneInconnue);

  // Recalage de hauteur quand le contenu d'une carte change (ajout de catégorie, etc.).
  if (window.ResizeObserver) {
    assistantObserver = new ResizeObserver(function () { ajusterHauteur(); });
    track.querySelectorAll('.asst-slide').forEach(function (s) { assistantObserver.observe(s); });
  }
  window.addEventListener('resize', ajusterHauteur);

  assistantIndex = 0;
  allerA(0, 0);
}

/** Va à l'étape i (avec direction pour l'animation : -1 arrière, +1 avant, 0 aucune). */
function allerA(i, direction) {
  const track = document.getElementById('asst-track');
  if (!track) return;
  i = Math.max(0, Math.min(ASSISTANT_ETAPES.length - 1, i));

  // VERROU : impossible d'aller AU-DELÀ d'une étape incomplète ou qui a des
  // modifications non enregistrées. Revenir en arrière reste toujours possible,
  // et atterrir SUR l'étape à corriger aussi (pour la finir).
  if (i > assistantIndex) {
    const etats = (typeof calculerEtatsEtapes === 'function') ? calculerEtatsEtapes() : [];
    for (let s = assistantIndex; s < i; s++) {
      if (assistantRaisonsEtape(s, etats).length) { i = s; break; }
    }
    if (i === assistantIndex) assistantSecouerVerrou(); // refusé : on attire l'œil sur l'explication
  }
  assistantIndex = i;

  track.style.transform = 'translateX(' + (-i * 100) + '%)';

  // Fil d'étapes : marque l'active + les précédentes comme « faites ».
  const steps = document.querySelectorAll('.asst-step');
  steps.forEach(function (li, k) {
    li.classList.toggle('est-active', k === i);
    li.classList.toggle('est-faite', k < i);
  });

  // Compteur + boutons Précédent/Suivant.
  const compteur = document.getElementById('asst-compteur');
  if (compteur) compteur.textContent = 'Étape ' + (i + 1) + ' / ' + ASSISTANT_ETAPES.length + ' — ' + ASSISTANT_ETAPES[i].titre;
  const prec = document.getElementById('asst-prec');
  const suiv = document.getElementById('asst-suiv');
  if (prec) prec.style.visibility = (i === 0) ? 'hidden' : 'visible';
  if (suiv) suiv.style.visibility = (i === ASSISTANT_ETAPES.length - 1) ? 'hidden' : 'visible';

  // Barre de progression.
  const jauge = document.getElementById('asst-barre-jauge');
  if (jauge) jauge.style.width = ((i + 1) / ASSISTANT_ETAPES.length * 100) + '%';

  // Centre l'étape active dans le fil (surtout utile sur mobile, où il défile).
  // Calcul manuel de scrollLeft : plus fiable que scrollIntoView sur un conteneur overflow-x.
  const stepper = document.getElementById('asst-stepper');
  const chip = steps[i];
  if (stepper && chip) {
    const decalage = chip.getBoundingClientRect().left - stepper.getBoundingClientRect().left;
    const cible = stepper.scrollLeft + decalage - (stepper.clientWidth - chip.offsetWidth) / 2;
    stepper.scrollLeft = Math.max(0, cible);
  }

  ajusterHauteur();
  assistantMajVerrou(); // le bouton « Suivant » suit l'état de la nouvelle carte
  // Remonte en haut de la carte (confort mobile).
  const asst = document.getElementById('assistant');
  if (asst && direction !== 0 && asst.scrollIntoView) asst.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Ajuste la hauteur du viewport à la carte active (les autres sont hors écran). */
function ajusterHauteur() {
  const vp = document.querySelector('.asst-viewport');
  const slides = document.querySelectorAll('.asst-slide');
  if (!vp || !slides[assistantIndex]) return;
  vp.style.height = slides[assistantIndex].offsetHeight + 'px';
}

/** Flèches ← → pour naviguer entre les cartes (ignorées si on saisit dans un champ). */
function onClavierAssistant(evenement) {
  if (!assistantEstActif()) return;
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
  if (evenement.key === 'ArrowRight') { evenement.preventDefault(); allerA(assistantIndex + 1, 1); }
  else if (evenement.key === 'ArrowLeft') { evenement.preventDefault(); allerA(assistantIndex - 1, -1); }
}

function onStepperClic(evenement) {
  if (evenement.type === 'keydown' && evenement.key !== 'Enter' && evenement.key !== ' ') return;
  const li = evenement.target.closest('.asst-step');
  if (!li) return;
  evenement.preventDefault();
  const i = parseInt(li.getAttribute('data-index'), 10);
  allerA(i, i < assistantIndex ? -1 : 1);
}

/* ==========================================================================
   VERROU « SUIVANT » — on ne quitte une carte vers la suivante que si :
     1) le « cerveau » (calculerEtatsEtapes, admin.js) dit que ses étapes sont ✅ fait
        (infos générées / enregistrées / terrains répartis…) ;
     2) rien n'est « en attente » sur la carte : formulaire modifié depuis le dernier
        enregistrement, répartition calculée mais pas appliquée, édition de poules
        ouverte, équipe saisie mais pas ajoutée…
   Modifier APRÈS avoir enregistré referme donc le verrou automatiquement.
   ========================================================================== */

/* Étapes du cerveau qui doivent être ✅ « fait » pour quitter chaque carte.
   (L'après-midi ne bloque pas : elle se génère plus tard, une fois les scores du
   matin saisis — même logique que le verdict « prêt à publier » du cerveau.) */
const ASSISTANT_CLES_CERVEAU = {
  reglages: ['horaires', 'categories'],
  equipes:  ['equipes'],
  terrains: ['terrains'],
  poules:   ['poules']
};

/* « Photos » des formulaires à leur dernier état ENREGISTRÉ (clé = élément DOM).
   Valeurs actuelles ≠ photo → modifications non enregistrées. Les photos sont
   (re)prises au premier affichage d'un formulaire, et quand admin.js signale un
   enregistrement réussi ou un re-rendu depuis l'état enregistré (assistantMarquerPropre). */
const assistantPhotos = new WeakMap();

let assistantVerrouTimer = null;

/** Valeurs actuelles des champs d'une zone, sous forme de texte comparable. */
function assistantSerialiser(zone) {
  const parts = [];
  zone.querySelectorAll('input, select, textarea').forEach(function (c) {
    const type = String(c.type || '').toLowerCase();
    if (type === 'button' || type === 'submit' || type === 'file' || type === 'hidden') return;
    const val = (type === 'checkbox' || type === 'radio') ? (c.checked ? '1' : '0') : String(c.value);
    parts.push((c.name || c.id || c.className || '') + '=' + val);
  });
  return parts.join('\n');
}

/** (Re)prend la photo d'une zone : ses valeurs ACTUELLES deviennent la référence
 *  « enregistrée ». Appelée par admin.js après chaque enregistrement réussi. */
function assistantMarquerPropre(zone) {
  if (zone && zone.nodeType === 1) assistantPhotos.set(zone, assistantSerialiser(zone));
  assistantMajVerrou();
}

/** Photo d'une zone jamais vue, prise AVANT la première frappe (délégué focusin). */
function assistantNoterZoneInconnue(evenement) {
  const zone = evenement.target.closest('form') || evenement.target.closest('#zone-terrains');
  if (zone && !assistantPhotos.has(zone)) assistantPhotos.set(zone, assistantSerialiser(zone));
}

/** Zones surveillées : les formulaires des cartes + la zone terrains (champs sans <form>).
 *  #form-equipe est exclu : il a sa règle dédiée (ajout immédiat, la catégorie choisie reste). */
function assistantZonesSurveillees() {
  const track = document.getElementById('asst-track');
  if (!track) return [];
  const zones = [];
  track.querySelectorAll('form').forEach(function (f) {
    if (f.id === 'form-equipe') return;
    zones.push(f);
  });
  const zt = document.getElementById('zone-terrains');
  if (zt && track.contains(zt)) zones.push(zt);
  return zones;
}

/** Libellé humain d'une zone modifiée : dit QUOI enregistrer pour rouvrir le verrou. */
function assistantNomZone(zone) {
  if (zone.id === 'form-infos-tournoi')   return 'infos modifiées → « 💾 Enregistrer les infos »';
  if (zone.id === 'form-horaires')        return 'horaires modifiés → « Enregistrer les horaires »';
  if (zone.id === 'form-ajout-categorie') return 'nouvelle catégorie saisie → « Ajouter » (ou vide le champ)';
  if (zone.id === 'zone-terrains')        return 'plan des terrains modifié → « Enregistrer les terrains »';
  const cat = zone.getAttribute && zone.getAttribute('data-cat');
  if (cat) return 'catégorie « ' + cat + ' » modifiée → « Enregistrer »';
  return 'modifications non enregistrées';
}

/** Modifications « en attente » sur la carte i (raisons humaines, ou liste vide). */
function assistantRaisonsModifs(i) {
  const et = ASSISTANT_ETAPES[i];
  const slide = document.querySelector('.asst-slide[data-index="' + i + '"]');
  if (!et || !slide) return [];
  const raisons = [];

  // 1) Formulaires dont les valeurs diffèrent de leur photo « enregistrée ».
  assistantZonesSurveillees().forEach(function (zone) {
    if (!slide.contains(zone)) return;
    const photo = assistantPhotos.get(zone);
    if (photo == null) { assistantPhotos.set(zone, assistantSerialiser(zone)); return; }
    if (photo !== assistantSerialiser(zone)) raisons.push(assistantNomZone(zone));
  });

  // 2) États « en attente » hors formulaires (variables d'admin.js).
  if (et.id === 'infos' && typeof afficheDataURI !== 'undefined' && afficheDataURI) {
    raisons.push('affiche choisie → « 💾 Enregistrer les infos » (ou « Retirer l\'affiche »)');
  }
  if (et.id === 'equipes') {
    const nom = document.getElementById('champ-nom');
    if (nom && nom.value.trim()) raisons.push('équipe saisie → « Ajouter » (ou vide le champ)');
    if (document.querySelector('#liste-equipes .champ-edit-nom')) {
      raisons.push('renommage en cours → « Enregistrer » ou « Annuler »');
    }
  }
  if (et.id === 'terrains' && typeof repartitionCalculee !== 'undefined' && repartitionCalculee) {
    const resu = document.getElementById('repartition-resultat');
    if (resu && resu.innerHTML.trim()) {
      raisons.push('répartition calculée → « ✅ Appliquer aux catégories » (ou recalcule-la)');
    }
  }
  if (et.id === 'poules' && typeof editionPoules !== 'undefined' && editionPoules) {
    raisons.push('édition des poules en cours → « 💾 Enregistrer et recalculer » ou « Annuler »');
  }
  return raisons;
}

/** Tout ce qui empêche de QUITTER la carte i vers la suivante (liste vide = libre). */
function assistantRaisonsEtape(i, etatsCerveau) {
  const et = ASSISTANT_ETAPES[i];
  if (!et) return [];
  const raisons = [];
  const cles = ASSISTANT_CLES_CERVEAU[et.id];
  if (cles && typeof calculerEtatsEtapes === 'function') {
    const etats = etatsCerveau || calculerEtatsEtapes();
    cles.forEach(function (cle) {
      const e = etats.find(function (x) { return x.cle === cle; });
      if (e && e.statut !== 'fait') raisons.push(e.titre + ' — ' + e.detail);
    });
  }
  return raisons.concat(assistantRaisonsModifs(i));
}

/** Grise/active « Suivant », affiche l'explication, grise le fil hors de portée. */
function assistantMajVerrou() {
  const suiv = document.getElementById('asst-suiv');
  const zone = document.getElementById('asst-verrou');
  if (!suiv || !zone) return; // assistant non affiché (vue classique)

  const etats = (typeof calculerEtatsEtapes === 'function') ? calculerEtatsEtapes() : [];
  const derniere = ASSISTANT_ETAPES.length - 1;
  const raisons = (assistantIndex < derniere) ? assistantRaisonsEtape(assistantIndex, etats) : [];

  suiv.disabled = raisons.length > 0;
  if (raisons.length) {
    zone.hidden = false;
    zone.innerHTML = '🔒 <strong>Pour continuer&nbsp;:</strong> ' +
      raisons.map(echapperAsst).join('<span class="asst-verrou-sep"> · </span>');
  } else {
    zone.hidden = true;
    zone.innerHTML = '';
  }

  // Fil d'étapes : grise ce qui est hors de portée (au-delà de la 1re étape bloquée).
  let limite = derniere;
  for (let s = assistantIndex; s < derniere; s++) {
    if (assistantRaisonsEtape(s, etats).length) { limite = s; break; }
  }
  document.querySelectorAll('.asst-step').forEach(function (li, k) {
    li.classList.toggle('est-verrouillee', k > limite);
  });
}

/** Réévalue le verrou juste APRÈS l'action en cours (laisse admin.js réagir d'abord). */
function assistantMajVerrouDiffere() {
  if (assistantVerrouTimer) return;
  assistantVerrouTimer = setTimeout(function () {
    assistantVerrouTimer = null;
    assistantMajVerrou();
  }, 0);
}

/** Petit tremblement de l'explication quand on insiste sur un passage refusé. */
function assistantSecouerVerrou() {
  const zone = document.getElementById('asst-verrou');
  if (!zone || zone.hidden) return;
  zone.classList.remove('est-secoue');
  void zone.offsetWidth; // relance l'animation CSS
  zone.classList.add('est-secoue');
}

/** Quitte l'assistant : remet les blocs à leur place d'origine + mémorise le choix. */
function quitterAssistant() {
  const asst = document.getElementById('assistant');
  const main = document.querySelector('main');
  if (!asst || !main) return;
  if (assistantObserver) { assistantObserver.disconnect(); assistantObserver = null; }
  window.removeEventListener('resize', ajusterHauteur);

  // Remet chaque bloc dans <main>, dans l'ordre d'origine.
  (assistantOrdreOrigine || []).forEach(function (id) {
    const el = document.getElementById(id);
    if (el) main.appendChild(el);
  });
  asst.remove();

  try { localStorage.setItem(ASSISTANT_CLE_PREF, 'classique'); } catch (e) {}
  afficherBoutonReprise();
}

/** En vue classique : petit bouton flottant pour revenir à l'assistant. */
function afficherBoutonReprise() {
  if (document.getElementById('asst-reprise')) return;
  const main = document.querySelector('main');
  if (!main) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'asst-reprise';
  btn.className = 'bouton asst-reprise';
  btn.textContent = '🎴 Mode assistant';
  btn.addEventListener('click', function () {
    try { localStorage.setItem(ASSISTANT_CLE_PREF, 'assistant'); } catch (e) {}
    construireAssistant();
  });
  // Placé juste après la barre de connexion (en haut).
  const ref = document.getElementById('barre-connexion');
  if (ref && ref.parentNode) ref.parentNode.insertBefore(btn, ref.nextSibling);
  else main.insertBefore(btn, main.firstChild);
}

function retirerBoutonReprise() {
  const b = document.getElementById('asst-reprise');
  if (b) b.remove();
}

/** Vrai si l'assistant est actuellement affiché (utilisé par admin.js). */
function assistantEstActif() {
  return !!document.getElementById('assistant');
}

/** Va à l'étape (carte) qui contient le bloc d'id donné. Utilisé par le cerveau. */
function assistantAllerVersBloc(blocId) {
  const el = document.getElementById(blocId);
  const slide = el && el.closest('.asst-slide');
  if (!slide) return;
  const i = parseInt(slide.getAttribute('data-index'), 10);
  if (!isNaN(i)) allerA(i, i < assistantIndex ? -1 : 1);
}

/** Échappe le HTML (réutilise echapper() d'admin.js si dispo). */
function echapperAsst(t) {
  return (typeof echapper === 'function') ? echapper(t) : String(t);
}
