/**
 * ============================================================================
 *  MODE « ÉCRANS » — barre latérale + onglets pour la page admin (grand écran)
 * ============================================================================
 *  Sur ordinateur (≥ 1024px), la longue page qui déroule devient une interface
 *  à BARRE LATÉRALE : 4 écrans (Infos · Équipes & catégories · Poules & planning
 *  · Publication). Sur mobile, l'assistant à cartes reste le mode guidé (avec
 *  son verrou « Suivant ») — c'est assistant.js qui choisit au chargement.
 *
 *  Même technique éprouvée que l'assistant : on DÉPLACE les blocs existants
 *  (déplacer un nœud DOM conserve ses écouteurs) → admin.js continue de
 *  fonctionner SANS AUCUNE modification. Le tableau de bord et le fil
 *  « Où en suis-je ? » restent visibles au-dessus des écrans, et cliquer sur
 *  une étape du fil ouvre l'écran correspondant.
 *
 *  Réversible : « Vue classique » (bas de la barre latérale) remet la page
 *  longue ; sans JavaScript, la page longue s'affiche telle quelle.
 * ============================================================================
 */

/* Les 4 écrans : quels blocs EXISTANTS chacun regroupe (par leur id), et quelles
   étapes du « cerveau » (calculerEtatsEtapes, admin.js) nourrissent sa pastille
   d'état dans la barre latérale. zone-horaires / zone-categories vivent dans la
   section #reglages : on les déplace individuellement (et on les y remettra). */
const ECRANS_DEF = [
  { id: 'infos',       titre: 'Infos du tournoi',     icone: '📝', blocs: ['bloc-infos-tournoi', 'zone-horaires'],                  cles: ['horaires'] },
  { id: 'equipes',     titre: 'Équipes & catégories', icone: '👥', blocs: ['zone-categories', 'bloc-equipes'],                      cles: ['categories', 'equipes'] },
  { id: 'poules',      titre: 'Poules & planning',    icone: '🎲', blocs: ['bloc-terrains', 'bloc-generation', 'bloc-apresmidi'],   cles: ['terrains', 'poules', 'apresmidi'] },
  { id: 'publication', titre: 'Publication',          icone: '📣', blocs: ['bloc-publication', 'bloc-reinitialisation'],            cles: [] }
];

/* Ordre d'origine des blocs dans <main>, pour restaurer la page longue
   (« Vue classique »). #reglages reste dans <main> : on y remet ses 2 zones. */
const ECRANS_ORDRE_ORIGINE = [
  'bloc-infos-tournoi', 'reglages', 'bloc-equipes', 'bloc-terrains',
  'bloc-generation', 'bloc-apresmidi', 'bloc-publication', 'bloc-reinitialisation'
];

const ECRANS_CLE_ACTIF = 'r92_ecran_admin'; // dernier écran ouvert (mémorisé)

/** Vrai si l'écran est assez grand pour la barre latérale (sinon : assistant). */
function ecransSontAdaptes() {
  return window.matchMedia && window.matchMedia('(min-width: 1024px)').matches;
}

/** Vrai si le mode écrans est actuellement affiché (utilisé par assistant.js). */
function ecransEstActif() {
  return !!document.getElementById('ecrans');
}

/** Construit la barre latérale + les 4 écrans et y déplace les blocs existants. */
function construireEcrans() {
  const main = document.querySelector('main');
  const conteneur = document.querySelector('.conteneur');
  if (!main || !conteneur || ecransEstActif()) return;
  if (typeof retirerBoutonReprise === 'function') retirerBoutonReprise();

  document.body.classList.add('avec-ecrans');

  // --- La barre latérale (navigation) -------------------------------------
  const nav = document.createElement('nav');
  nav.id = 'ecr-nav';
  nav.setAttribute('aria-label', "Sections de l'administration");
  let h = '<div class="ecr-marque">' +
            '<img class="ecr-logo" src="img/logo-r92.png" alt="" onerror="this.style.display=\'none\'">' +
            '<span class="ecr-marque-titre">Administration</span>' +
            '<span class="ecr-marque-sous">Tournoi R92</span>' +
          '</div>' +
          '<ul class="ecr-liste">';
  ECRANS_DEF.forEach(function (e) {
    h += '<li><button type="button" class="ecr-onglet" data-ecran="' + e.id + '">' +
           '<span class="ecr-icone">' + e.icone + '</span>' +
           '<span class="ecr-libelle">' + echapperEcr(e.titre) + '</span>' +
           '<span class="ecr-pastille" id="ecr-pastille-' + e.id + '" hidden></span>' +
         '</button></li>';
  });
  h += '</ul>' +
       '<div class="ecr-pied">' +
         '<button type="button" class="bouton-lien ecr-classique" id="ecr-vue-classique">Vue classique ✕</button>' +
       '</div>';
  nav.innerHTML = h;
  conteneur.insertBefore(nav, conteneur.firstChild);

  // --- Les écrans (on y DÉPLACE les blocs existants : écouteurs conservés) --
  const zone = document.createElement('div');
  zone.id = 'ecrans';
  ECRANS_DEF.forEach(function (e) {
    const ecran = document.createElement('section');
    ecran.className = 'ecran';
    ecran.id = 'ecran-' + e.id;
    ecran.hidden = true;
    e.blocs.forEach(function (id) {
      const bloc = document.getElementById(id);
      if (bloc) ecran.appendChild(bloc);
    });
    zone.appendChild(ecran);
  });
  main.appendChild(zone);

  // --- Écouteurs -----------------------------------------------------------
  nav.querySelector('.ecr-liste').addEventListener('click', function (evenement) {
    const btn = evenement.target.closest('.ecr-onglet');
    if (btn) ecransActiver(btn.getAttribute('data-ecran'));
  });
  nav.querySelector('#ecr-vue-classique').addEventListener('click', quitterEcrans);

  // Dernier écran ouvert (ou le premier), puis pastilles d'état.
  let depart = null;
  try { depart = localStorage.getItem(ECRANS_CLE_ACTIF); } catch (e) { /* stockage indisponible */ }
  if (!ECRANS_DEF.some(function (e) { return e.id === depart; })) depart = ECRANS_DEF[0].id;
  ecransActiver(depart, { sansScroll: true });
}

/**
 * Affiche l'écran demandé (et masque les autres).
 * @param {string}  id                 id logique ('infos', 'equipes', …)
 * @param {Object}  [opt]
 * @param {boolean} [opt.sansScroll]   ne pas remonter en haut (1er affichage, fil d'étapes)
 */
function ecransActiver(id, opt) {
  opt = opt || {};
  ECRANS_DEF.forEach(function (e) {
    const ecran = document.getElementById('ecran-' + e.id);
    if (ecran) ecran.hidden = (e.id !== id);
  });
  document.querySelectorAll('.ecr-onglet').forEach(function (btn) {
    const actif = btn.getAttribute('data-ecran') === id;
    btn.classList.toggle('est-actif', actif);
    if (actif) {
      btn.setAttribute('aria-current', 'page');
      // Fenêtre étroite : la barre d'onglets défile → on garde l'actif visible.
      if (btn.scrollIntoView) btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    } else {
      btn.removeAttribute('aria-current');
    }
  });
  try { localStorage.setItem(ECRANS_CLE_ACTIF, id); } catch (e) { /* stockage indisponible */ }
  ecransMajPastilles();
  if (!opt.sansScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Ouvre l'écran qui contient le bloc demandé, puis défile jusqu'à lui.
 *  Appelé (via assistant.js) quand on clique une étape du fil « Où en suis-je ? ». */
function ecransAllerVersBloc(blocId) {
  const bloc = document.getElementById(blocId);
  const ecran = bloc && bloc.closest('.ecran');
  if (!ecran) return;
  const def = ECRANS_DEF.find(function (e) { return 'ecran-' + e.id === ecran.id; });
  if (!def) return;
  ecransActiver(def.id, { sansScroll: true });
  if (bloc.scrollIntoView) bloc.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Pastilles d'état de la barre latérale, nourries par le « cerveau » d'admin.js :
 *   🟠 à refaire (quelque chose a changé depuis) > ⚪️ à faire > ✓ fait.
 *  Les étapes « attente » (ex. après-midi avant les scores) ne comptent pas.
 *  Appelée après chaque majEtatAvancement() via assistantMajVerrou (assistant.js).
 */
function ecransMajPastilles() {
  if (!ecransEstActif() || typeof calculerEtatsEtapes !== 'function') return;
  let etats;
  try { etats = calculerEtatsEtapes(); } catch (e) { return; } // données pas encore chargées
  ECRANS_DEF.forEach(function (def) {
    const pastille = document.getElementById('ecr-pastille-' + def.id);
    if (!pastille) return;
    const concernes = etats.filter(function (e) { return def.cles.indexOf(e.cle) !== -1; });
    const arefaire = concernes.filter(function (e) { return e.statut === 'arefaire'; });
    const afaire   = concernes.filter(function (e) { return e.statut === 'afaire'; });
    pastille.classList.remove('est-fait', 'est-afaire', 'est-arefaire');
    if (!concernes.length) { pastille.hidden = true; return; }
    pastille.hidden = false;
    if (arefaire.length)    { pastille.classList.add('est-arefaire'); pastille.textContent = '!'; }
    else if (afaire.length) { pastille.classList.add('est-afaire');   pastille.textContent = '';  }
    else                    { pastille.classList.add('est-fait');     pastille.textContent = '✓'; }
    // Le détail (ex. « Réglages modifiés depuis la génération ») en infobulle.
    pastille.title = concernes.map(function (e) { return e.titre + ' : ' + e.detail; }).join(' · ');
  });
}

/** Quitte le mode écrans : remet les blocs à leur place d'origine (page longue),
 *  mémorise le choix, et propose le bouton de retour au mode guidé. */
function quitterEcrans() {
  const main = document.querySelector('main');
  const zone = document.getElementById('ecrans');
  if (!main || !zone) return;

  // Les 2 zones de réglages retournent dans leur section #reglages…
  const reglages = document.getElementById('reglages');
  ['zone-horaires', 'zone-categories'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el && reglages) reglages.appendChild(el);
  });
  // …puis chaque bloc retrouve sa place dans <main>, dans l'ordre d'origine.
  ECRANS_ORDRE_ORIGINE.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) main.appendChild(el);
  });

  zone.remove();
  const nav = document.getElementById('ecr-nav');
  if (nav) nav.remove();
  document.body.classList.remove('avec-ecrans');

  try { localStorage.setItem(ASSISTANT_CLE_PREF, 'classique'); } catch (e) { /* stockage indisponible */ }
  if (typeof afficherBoutonReprise === 'function') afficherBoutonReprise();
}

/** Échappe le HTML (réutilise echapper() de commun.js si dispo). */
function echapperEcr(t) {
  return (typeof echapper === 'function') ? echapper(t) : String(t);
}
