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
