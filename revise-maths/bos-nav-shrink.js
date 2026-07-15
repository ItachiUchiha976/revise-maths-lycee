/* bos-nav-shrink.js — bande de menu discrete + menu hamburger sur petit ecran.
   - Defilement vers le BAS  -> la bande se cache (glisse vers le haut).
   - Defilement vers le HAUT (ou tout en haut) -> elle revient.  (vertical, aime de Fred)
   - Petit ecran (<=900px) : les onglets se rangent derriere un bouton hamburger
     (menu deroulant VERTICAL) -> plus aucun defilement horizontal.
   Le bouton est cree en JS : aucune retouche du HTML des 33 pages.
   Idempotent, defensif, zero dependance. Ajout 15/07/2026 (v2 hamburger). */
(function () {
  function init() {
    var header = document.querySelector('header');
    if (!header) return;
    var inner = header.querySelector('.header-inner');
    var nav = header.querySelector('.nav-yt');
    if (!inner || !nav) return;
    if (header.dataset.navShrink) return; // idempotent
    header.dataset.navShrink = '1';

    /* --- Bouton hamburger (visible en CSS uniquement <=900px) --- */
    var burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.type = 'button';
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span><span></span><span></span>';
    inner.appendChild(burger);

    function closeMenu() {
      header.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
    }
    function toggleMenu() {
      var open = header.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    burger.addEventListener('click', function (e) { e.stopPropagation(); toggleMenu(); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('click', function (e) {
      if (header.classList.contains('menu-open') && !header.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

    /* --- Masquage au defilement (vertical) --- */
    var lastY = window.pageYOffset || 0;
    var ticking = false;
    var SHOW_ZONE = 60; // toujours visible dans les 60 premiers pixels
    var DELTA = 6;      // ignore les micro-mouvements du doigt

    function update() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;

      if (y > 8) header.classList.add('nav-compact');
      else header.classList.remove('nav-compact');

      if (y <= SHOW_ZONE) { header.classList.remove('nav-hidden'); lastY = y; return; }
      if (Math.abs(y - lastY) < DELTA) return;

      if (y > lastY) { header.classList.add('nav-hidden'); closeMenu(); } // descend -> cacher + fermer
      else header.classList.remove('nav-hidden');                        // remonte -> montrer
      lastY = y;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
