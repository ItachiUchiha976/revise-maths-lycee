/* Service worker de « Maths avec Fred ».
 *
 * Stratégie : RÉSEAU D'ABORD, cache en secours.
 *   Le site est mis à jour très souvent (nouveaux exercices, corrections de contenu). Un
 *   cache prioritaire figerait la version installée chez l'élève et rendrait invisibles nos
 *   corrections — piège déjà rencontré sur les autres apps du portefeuille (BOITE : « SW en
 *   network-first, sinon les mises à jour restent coincées en cache »).
 *   Ici, le cache ne sert donc qu'à UNE chose : permettre de réviser SANS connexion (dans le
 *   bus, au CDI, en vacances). Tant que le réseau répond, l'élève voit toujours la dernière
 *   version.
 */
const VERSION = 'mavf-v1-20260727b';
const COQUILLE = [
  '/revise-maths/',
  '/revise-maths/index.html',
  '/revise-maths/manifest.webmanifest',
  '/revise-maths/img/icone-192.png',
  '/revise-maths/img/icone-512.png',
];

self.addEventListener('install', (e) => {
  // on pré-charge le strict minimum pour que l'app s'ouvre hors ligne
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(COQUILLE).catch(() => null))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  // on supprime les caches des versions précédentes : pas d'accumulation sur le téléphone
  e.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // on ne touche ni aux autres domaines, ni aux appels d'API (paiement, contenu payant) :
  // les servir depuis un cache donnerait des réponses périmées ou fausses
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (/\/api\/|api\.tonargentexplique\.fr|\/formation-/.test(req.url)) return;

  e.respondWith(
    fetch(req)
      .then((rep) => {
        if (rep && rep.status === 200 && rep.type === 'basic') {
          const copie = rep.clone();
          caches.open(VERSION).then((c) => c.put(req, copie));
        }
        return rep;
      })
      .catch(() =>
        caches.match(req).then((c) => c || caches.match('/revise-maths/index.html'))
      )
  );
});
