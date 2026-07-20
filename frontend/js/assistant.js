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
    '<div class="asst-viewport"><div class="asst-track" id="asst-track"></div></div>' +
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

  ajusterHauteur();
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

function onStepperClic(evenement) {
  if (evenement.type === 'keydown' && evenement.key !== 'Enter' && evenement.key !== ' ') return;
  const li = evenement.target.closest('.asst-step');
  if (!li) return;
  evenement.preventDefault();
  const i = parseInt(li.getAttribute('data-index'), 10);
  allerA(i, i < assistantIndex ? -1 : 1);
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

/** Échappe le HTML (réutilise echapper() d'admin.js si dispo). */
function echapperAsst(t) {
  return (typeof echapper === 'function') ? echapper(t) : String(t);
}
