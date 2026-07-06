/* ============================================================
   Service Worker — Cours de Maths (MathsAvecFred)
   Cache versionne, network-first pour les navigations,
   cache-first pour les autres assets same-origin.
   Ne JAMAIS intercepter les domaines externes
   (meet.jit.si, excalidraw.com, api.web3forms.com, etc.).
   Robuste : aucun echec de cache ne casse la page.
   ============================================================ */

const CACHE = "cours-v1";

// Shell precache (chemins relatifs au scope ./cours/)
const SHELL = [
  "espace-eleve.html",
  "espace-prof.html",
  "exercices.html",
  "devoirs.html",
  "classe.html",
  "../style.css",
  "manifest.webmanifest",
  "icons/icon-192.png"
];

// ---- INSTALL : precache le shell (tolerant aux 404) ----
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE);
        // addAll echoue en bloc si UNE ressource manque -> on ajoute une par une.
        await Promise.all(
          SHELL.map(async (url) => {
            try {
              const res = await fetch(url, { cache: "no-cache" });
              if (res && res.ok) await cache.put(url, res.clone());
            } catch (e) {
              /* ressource indisponible a l'install : on ignore */
            }
          })
        );
      } catch (e) {
        /* open cache impossible : on ne bloque pas l'install */
      }
      await self.skipWaiting();
    })()
  );
});

// ---- ACTIVATE : supprime les vieux caches + prend le controle ----
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys.map((k) => (k === CACHE ? null : caches.delete(k)))
        );
      } catch (e) {
        /* nettoyage best-effort */
      }
      await self.clients.claim();
    })()
  );
});

// ---- FETCH ----
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // On ne gere que les GET (jamais les POST/formulaires Web3Forms).
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return; // URL invalide : on laisse le navigateur gerer
  }

  // SECURITE : ne JAMAIS intercepter les domaines externes
  // (visio jit.si, tableau excalidraw, capture web3forms, CDN KaTeX, etc.).
  // On laisse passer au reseau sans toucher.
  if (url.origin !== self.location.origin) return;

  // 1) NAVIGATIONS (request.mode === "navigate") -> NETWORK-FIRST + fallback cache.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          // Mise a jour du cache en arriere-plan (best-effort).
          try {
            const cache = await caches.open(CACHE);
            cache.put(req, fresh.clone());
          } catch (e) {
            /* ignore */
          }
          return fresh;
        } catch (e) {
          // Hors-ligne / reseau KO -> on tente le cache exact, puis le shell.
          const cached = await caches.match(req);
          if (cached) return cached;
          const shell = await caches.match("espace-eleve.html");
          if (shell) return shell;
          return new Response(
            "<!doctype html><meta charset='utf-8'><title>Hors ligne</title>" +
              "<body style='font-family:sans-serif;padding:2rem;text-align:center'>" +
              "<h1>Hors ligne</h1><p>Reconnecte-toi a Internet pour acceder a ton espace.</p></body>",
            { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 503 }
          );
        }
      })()
    );
    return;
  }

  // 2) AUTRES ASSETS same-origin -> CACHE-FIRST + mise a jour reseau.
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      const networkFetch = fetch(req)
        .then((res) => {
          // On ne met en cache que les reponses valides "basic" (same-origin).
          if (res && res.ok && res.type === "basic") {
            caches
              .open(CACHE)
              .then((cache) => cache.put(req, res.clone()))
              .catch(() => {});
          }
          return res;
        })
        .catch(() => null);

      // Cache d'abord (rapide), sinon on attend le reseau.
      if (cached) {
        networkFetch; // mise a jour en arriere-plan, on n'attend pas
        return cached;
      }
      const fresh = await networkFetch;
      if (fresh) return fresh;
      // Dernier recours : rien en cache, reseau KO.
      return new Response("", { status: 504, statusText: "Hors ligne" });
    })()
  );
});
