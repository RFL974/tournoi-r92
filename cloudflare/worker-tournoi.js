/**
 * ============================================================================
 *  RELAIS CDN — Cloudflare Worker pour le Tournoi R92
 * ============================================================================
 *  Rôle : encaisser des milliers de spectateurs sans saturer Google Apps Script.
 *
 *   • POST  (protégé par une clé secrète)  → Apps Script y dépose l'instantané
 *                                            des données à chaque changement.
 *   • GET   (ouvert à tous)                → la page publique lit l'instantané.
 *                                            Réponse mise en cache ~8 s au bord
 *                                            du réseau (partagée entre tous).
 *
 *  À déployer sur Cloudflare avec :
 *   - un namespace KV lié sous le nom  TOURNOI
 *   - une variable secrète             SNAPSHOT_KEY  (la même que côté Apps Script)
 *  (voir docs/relais-cdn.md pour le pas-à-pas)
 * ============================================================================
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {
    // Pré-vol CORS (navigateurs)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // --- Écriture : Apps Script dépose l'instantané (protégé par la clé) ---
    if (request.method === 'POST') {
      const auth = request.headers.get('Authorization') || '';
      if (auth !== 'Bearer ' + env.SNAPSHOT_KEY) {
        return new Response('Non autorisé', { status: 401, headers: CORS });
      }
      const corps = await request.text();
      await env.TOURNOI.put('snapshot', corps);
      return new Response('OK', { headers: CORS });
    }

    // --- Lecture : la page publique récupère l'instantané ---
    if (request.method === 'GET') {
      const data = await env.TOURNOI.get('snapshot');
      return new Response(data || '{"error":"pas encore de donnees"}', {
        headers: {
          ...CORS,
          'Content-Type': 'application/json; charset=utf-8',
          // Cache court au bord du réseau : la grande majorité des lectures est
          // servie par le CDN sans rappeler le Worker → tient n'importe quelle foule.
          // stale-while-revalidate : à l'expiration des 8 s, le CDN ressert l'ancienne
          // copie (jusqu'à 30 s) PENDANT qu'il va en chercher une fraîche en arrière-plan
          // → aucune vague de requêtes simultanées vers le Worker, réponse toujours immédiate.
          'Cache-Control': 'public, max-age=8, stale-while-revalidate=30',
        },
      });
    }

    return new Response('Méthode non gérée', { status: 405, headers: CORS });
  },
};
