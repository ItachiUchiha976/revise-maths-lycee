/* bos-cahiers.js — « mode extrait » de l'appli native (généré le 2026-10-05 par generer_cahiers_appli.py).
 *
 * Règle de Fred (05/10/2026) : l'appli = réviser 5 minutes (quelques exercices offerts par chapitre) ;
 * le cahier = s'entraîner (séries complètes, corrigés détaillés).
 * → dans l'APPLI ANDROID uniquement (Capacitor), chaque banque d'exos n'affiche que l'extrait ci-dessous.
 *   Le SITE WEB et la PWA gardent les banques complètes (outil des cours particuliers).
 * Désactiver : mode_extrait_appli.actif = false dans Scripts/Maths/cahiers_appli.json puis relancer le générateur.
 * Aucune donnée collectée, aucun appel réseau. */
(function () {
  'use strict';
  var ACTIF = true;
  var EXTRAITS = {"exos-equations-inequations-seconde.html": ["F1", "M1", "D1"], "exos-fonctions-affines-seconde.html": ["F1", "M1", "D1"], "exos-fonctions-reference-seconde.html": ["F1", "M1", "D1"], "exos-geometrie-reperee-seconde.html": ["F1", "M1", "D1"], "exos-probabilites-seconde.html": ["F1", "M1", "D1"], "exos-probabilites-conditionnelles-seconde.html": ["F1", "M1", "D1"], "exos-statistiques-seconde.html": ["F1", "M1", "D1"], "exos-second-degre-premiere.html": ["F1", "M1", "D1"], "exos-derivation-premiere.html": ["F1", "M1", "D1"], "exos-exponentielle-premiere.html": ["F1", "M1", "D1"], "exos-suites-premiere.html": ["F1", "M1", "D1"], "exos-produit-scalaire-premiere.html": ["F1", "M1", "D1"], "exos-variables-aleatoires-premiere.html": ["F1", "M1", "D1"], "exos-trigonometrie-premiere.html": ["F1", "M1", "D1"], "exos-suites-terminale.html": ["F1", "M1", "D1"], "exos-limites-terminale.html": ["F1", "M1", "D1"], "exos-exponentielle-terminale.html": ["F1", "M1", "D1"], "exos-logarithme-terminale.html": ["F1", "M1", "D1"], "exos-primitives-integrales-terminale.html": ["F1", "M1", "D1"], "exos-loi-binomiale-terminale.html": ["F1", "M1", "D1"], "exos-geometrie-espace-terminale.html": ["F1", "M1", "D1"]};

  function estApp() {
    try {
      var C = window.Capacitor;
      if (C && typeof C.isNativePlatform === 'function') return !!C.isNativePlatform();
      if (C && typeof C.getPlatform === 'function') return C.getPlatform() !== 'web';
      // secours : WebView Android servie par Capacitor (https://localhost + UA « wv »)
      return location.hostname === 'localhost' && /; wv\)/.test(navigator.userAgent || '');
    } catch (e) { return false; }
  }

  window.BOS_CAHIERS = {
    estApp: estApp,
    // reçoit le tableau EXOS de la page ; renvoie l'extrait dans l'appli, le tableau complet ailleurs
    extrait: function (liste) {
      try {
        var nom = (location.pathname.split('/').pop() || '');
        var ids = EXTRAITS[nom];
        if (!ACTIF || !ids || !liste || !liste.length || !estApp()) return liste;
        var out = liste.filter(function (e) { return ids.indexOf(e.id) >= 0; });
        if (!out.length) return liste;
        window.BOS_EXTRAIT = { montres: out.length, total: liste.length };
        return out;
      } catch (e) { return liste; }
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var x = window.BOS_EXTRAIT;
    if (!x) return;
    var el = document.querySelector('#cahier-encart .bc-extrait');
    if (!el) return;
    var a = el.querySelector('[data-bc=montres]'), b = el.querySelector('[data-bc=total]');
    if (a) a.textContent = x.montres;
    if (b) b.textContent = x.total;
    el.hidden = false;
  });
})();
