/* bos-nav-shrink.js — la bande de menu (header sticky) se fait discrete.
   - Defilement vers le BAS  -> la bande se cache (glisse vers le haut).
   - Defilement vers le HAUT (ou tout en haut de page) -> elle revient.
   - Des qu'on quitte le haut de page -> version compacte (bande plus fine).
   But : rendre l'ecran aux eleves sur mobile ET petits ecrans d'ordinateur.
   Idempotent, defensif, zero dependance. Ajout 15/07/2026. */
(function () {
  function init() {
    var header = document.querySelector('header');
    if (!header || !header.querySelector('.nav-yt')) return; // uniquement le header a menu
    if (header.dataset.navShrink) return;                    // idempotent
    header.dataset.navShrink = '1';

    var lastY = window.pageYOffset || 0;
    var ticking = false;
    var SHOW_ZONE = 60; // toujours visible dans les 60 premiers pixels
    var DELTA = 6;      // ignore les micro-mouvements du doigt

    function update() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;

      if (y > 8) header.classList.add('nav-compact');
      else header.classList.remove('nav-compact');

      if (y <= SHOW_ZONE) {                 // tout en haut -> toujours visible
        header.classList.remove('nav-hidden');
        lastY = y;
        return;
      }
      if (Math.abs(y - lastY) < DELTA) return;

      if (y > lastY) header.classList.add('nav-hidden');    // descend -> cacher
      else header.classList.remove('nav-hidden');           // remonte -> montrer
      lastY = y;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    // Amene l'onglet de la page en cours dans le champ visible (nav horizontale mobile)
    try {
      var nav = header.querySelector('.nav-yt');
      var active = nav && nav.querySelector('a.active');
      if (nav && active) {
        var delta = active.getBoundingClientRect().left - nav.getBoundingClientRect().left;
        nav.scrollLeft += delta - 12;
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
