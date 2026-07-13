/**
 * Petit serveur statique pour la PREVIEW locale du frontend (dev uniquement).
 * Sert le dossier ../frontend sur le port 8123. Aucune dépendance externe.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..', 'frontend');
const PORT = 8123;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/saisie.html';
  const fichier = path.join(RACINE, rel);
  // Sécurité minimale : rester dans la racine.
  if (!fichier.startsWith(RACINE)) { res.writeHead(403); res.end('403'); return; }
  fs.readFile(fichier, (err, data) => {
    if (err) { res.writeHead(404); res.end('404 ' + rel); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(fichier)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('Preview sur http://localhost:' + PORT));
