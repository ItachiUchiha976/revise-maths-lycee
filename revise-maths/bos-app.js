/* bos-app.js — rend « Maths avec Fred » installable comme une vraie application.
 *
 * À inclure sur toutes les pages du site (une ligne <script>). Il fait trois choses :
 *   1. déclare le manifeste et les icônes si la page ne les a pas encore ;
 *   2. enregistre le service worker (révision hors connexion) ;
 *   3. capte l'événement d'installation du navigateur et l'expose à la page
 *      (window.BOS_APP.installer()), pour que le bouton « Installer » de la page
 *      Téléchargements déclenche la vraie invite du système — et non un tutoriel.
 *
 * ⚠️ Le navigateur n'autorise l'invite qu'après un geste de l'utilisateur : on garde donc
 * l'événement de côté au lieu de l'appeler tout de suite, sinon il est perdu.
 */
(function () {
  'use strict';
  var BASE = '/revise-maths/';

  function baliseSiAbsente(sel, creer) {
    if (!document.querySelector(sel)) document.head.appendChild(creer());
  }

  baliseSiAbsente('link[rel="manifest"]', function () {
    var l = document.createElement('link');
    l.rel = 'manifest';
    l.href = BASE + 'manifest.webmanifest';
    return l;
  });
  baliseSiAbsente('link[rel="apple-touch-icon"]', function () {
    var l = document.createElement('link');
    l.rel = 'apple-touch-icon';
    l.href = BASE + 'img/icone-180-ios.png';
    return l;
  });
  baliseSiAbsente('meta[name="theme-color"]', function () {
    var m = document.createElement('meta');
    m.name = 'theme-color';
    m.content = '#1a2352';
    return m;
  });
  // iOS n'implémente pas le manifeste : ces deux balises lui disent d'ouvrir en plein écran
  baliseSiAbsente('meta[name="apple-mobile-web-app-capable"]', function () {
    var m = document.createElement('meta');
    m.name = 'apple-mobile-web-app-capable';
    m.content = 'yes';
    return m;
  });

  var invite = null;
  var API = {
    disponible: false,
    // true quand la page tourne DANS l'application installée (et non dans un onglet)
    installee: window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true,
    installer: function () {
      if (!invite) return Promise.resolve('indisponible');
      invite.prompt();
      return invite.userChoice.then(function (choix) {
        invite = null;
        API.disponible = false;
        return choix && choix.outcome === 'accepted' ? 'installee' : 'refusee';
      });
    },
  };
  window.BOS_APP = API;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();          // on empêche la bannière automatique…
    invite = e;                  // …et on garde l'invite pour notre propre bouton
    API.disponible = true;
    window.dispatchEvent(new CustomEvent('bos-app-installable'));
  });

  window.addEventListener('appinstalled', function () {
    API.installee = true;
    API.disponible = false;
    window.dispatchEvent(new CustomEvent('bos-app-installee'));
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(BASE + 'sw.js', { scope: BASE }).catch(function () {});
    });
  }
})();
