/**
 * ============================================================================
 *  CONFIG — réglages partagés par toutes les pages du frontend
 * ============================================================================
 *
 *  C'est le SEUL endroit où l'on écrit l'URL du backend (la Web App Apps Script).
 *  Si un jour cette URL change, on ne modifie QUE ce fichier, et toutes les pages
 *  restent à jour automatiquement.
 * ============================================================================
 */

/**
 * URL de la Web App Google Apps Script (elle se termine par "/exec").
 *
 *  ⚠️ IMPORTANT : pour garder CETTE MÊME URL quand on modifie le code backend,
 *  il faut redéployer via  Déployer → Gérer les déploiements → (crayon) Modifier
 *  → Version : "Nouvelle version" → Déployer.
 *  Créer un "Nouveau déploiement" génèrerait une URL DIFFÉRENTE (à éviter).
 */
const API_URL = "https://script.google.com/macros/s/AKfycbz_jRSNnFCjJvhUiofO6n3lg41ev8_9UDuvVGB_KDpm_EYZVSgwyi55MG8AfKu2JRQFBA/exec";

/**
 * URL du RELAIS CDN (Cloudflare Worker) — cache "edge" qui encaisse des milliers de
 * spectateurs sans saturer Apps Script. UNIQUEMENT pour la LECTURE de la page publique.
 *
 *  ⚠️ Laisser VIDE ("") tant que le relais n'est pas créé : dans ce cas la page publique
 *  lit Apps Script directement (comme avant). Dès qu'on colle ici l'URL du Worker
 *  (ex. "https://tournoi-r92.xxxx.workers.dev"), la page publique lit le relais.
 */
const SNAPSHOT_URL = "";
