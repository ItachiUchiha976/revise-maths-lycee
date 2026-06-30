/* ============================================================
   install.js — PWA : enregistrement du Service Worker
   + gestion du prompt d'installation (Android/Chrome/Edge)
   + fallback instructions iOS Safari.
   Code 100% defensif : aucune API manquante ne provoque de crash.
   Inclure ce script sur CHAQUE page + placer quelque part :
     <button id="install-app-btn" ... style="display:none">...</button>
   ============================================================ */
(function () {
  "use strict";

  // ---- (a) Enregistrement du Service Worker ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      try {
        navigator.serviceWorker.register("sw.js").catch(function () {
          /* enregistrement impossible : l'app fonctionne quand meme */
        });
      } catch (e) {
        /* ignore */
      }
    });
  }

  // ---- Helpers ----
  function getBtn() {
    return document.getElementById("install-app-btn");
  }

  function isStandalone() {
    try {
      var mql = window.matchMedia && window.matchMedia("(display-mode: standalone)");
      if (mql && mql.matches) return true;
    } catch (e) {
      /* ignore */
    }
    // iOS Safari : navigator.standalone === true quand lancee depuis l'ecran d'accueil
    if (navigator.standalone === true) return true;
    return false;
  }

  function isIOS() {
    var ua = navigator.userAgent || navigator.vendor || "";
    var iOSDevice = /iPad|iPhone|iPod/.test(ua);
    // iPadOS 13+ se fait passer pour un Mac : detection par touch
    var iPadOS =
      navigator.platform === "MacIntel" &&
      typeof navigator.maxTouchPoints === "number" &&
      navigator.maxTouchPoints > 1;
    return iOSDevice || iPadOS;
  }

  function hideBtn() {
    var btn = getBtn();
    if (btn) btn.style.display = "none";
  }

  function showBtn() {
    var btn = getBtn();
    if (btn) btn.style.display = "inline-flex";
  }

  // Si l'app est deja installee : on ne montre jamais le bouton.
  if (isStandalone()) {
    hideBtn();
  }

  var deferredPrompt = null;

  // ---- (b) beforeinstallprompt (Android / Chrome / Edge desktop) ----
  window.addEventListener("beforeinstallprompt", function (e) {
    try {
      e.preventDefault(); // empeche la mini-infobar auto
    } catch (err) {
      /* ignore */
    }
    deferredPrompt = e;
    if (!isStandalone()) showBtn();
  });

  // ---- Clic sur le bouton d'installation ----
  function onInstallClick() {
    // Cas natif : un prompt a ete capte.
    if (deferredPrompt) {
      var dp = deferredPrompt;
      try {
        dp.prompt();
        if (dp.userChoice && typeof dp.userChoice.then === "function") {
          dp.userChoice
            .then(function (choice) {
              if (choice && choice.outcome === "accepted") {
                hideBtn();
              }
            })
            .catch(function () {})
            .then(function () {
              deferredPrompt = null;
            });
        } else {
          deferredPrompt = null;
        }
      } catch (e) {
        deferredPrompt = null;
      }
      return;
    }

    // ---- (c) Fallback iOS Safari : pas de beforeinstallprompt ----
    if (isIOS()) {
      showIOSInstructions();
      return;
    }

    // Autres navigateurs sans prompt dispo : petite aide generique.
    alert(
      "Pour installer l'application : ouvre le menu de ton navigateur " +
        "(les trois points) puis choisis « Installer l'application » " +
        "ou « Ajouter à l'écran d'accueil »."
    );
  }

  function showIOSInstructions() {
    // Evite les doublons si on reclique
    if (document.getElementById("ios-install-hint")) return;

    var box = document.createElement("div");
    box.id = "ios-install-hint";
    box.setAttribute("role", "dialog");
    box.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;z-index:9999;" +
      "background:#fff;border-top:3px solid #1a56a0;" +
      "box-shadow:0 -4px 20px rgba(0,0,0,.18);" +
      "padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));" +
      "font-family:'Segoe UI',Arial,sans-serif;color:#212529;" +
      "max-width:560px;margin:0 auto;border-radius:14px 14px 0 0;";

    box.innerHTML =
      "<div style='display:flex;align-items:flex-start;gap:10px'>" +
      "<div style='font-size:1.6rem;line-height:1'>📲</div>" +
      "<div style='flex:1;font-size:.95rem;line-height:1.5'>" +
      "<strong style='color:#1a56a0;display:block;margin-bottom:4px'>" +
      "Installer l'application sur iPhone / iPad</strong>" +
      "1. Appuie sur le bouton <strong>Partager</strong> " +
      "(le carré avec une flèche vers le haut, en bas de Safari).<br>" +
      "2. Fais défiler puis choisis " +
      "<strong>« Sur l'écran d'accueil »</strong>.<br>" +
      "3. Appuie sur <strong>Ajouter</strong> en haut à droite." +
      "</div></div>" +
      "<button type='button' id='ios-install-close' " +
      "style='margin-top:14px;width:100%;background:#1a56a0;color:#fff;" +
      "border:none;border-radius:8px;padding:12px;font-size:1rem;" +
      "font-weight:700;cursor:pointer;font-family:inherit'>J'ai compris</button>";

    document.body.appendChild(box);
    var closeBtn = document.getElementById("ios-install-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        if (box.parentNode) box.parentNode.removeChild(box);
      });
    }
  }

  // ---- Branche le bouton + cas iOS (pas de beforeinstallprompt) ----
  function wireUp() {
    var btn = getBtn();
    if (btn) {
      btn.addEventListener("click", onInstallClick);
    }
    // Sur iOS, beforeinstallprompt n'existe pas : on affiche le bouton
    // (sauf si deja installee) pour proposer les instructions manuelles.
    if (isIOS() && !isStandalone()) {
      showBtn();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireUp);
  } else {
    wireUp();
  }

  // ---- (d) App installee pendant la session -> on cache le bouton ----
  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    hideBtn();
  });

  // Si l'utilisateur bascule en mode standalone (installee), on cache.
  try {
    var standaloneMql = window.matchMedia && window.matchMedia("(display-mode: standalone)");
    if (standaloneMql) {
      var onChange = function (e) {
        if (e.matches) hideBtn();
      };
      if (typeof standaloneMql.addEventListener === "function") {
        standaloneMql.addEventListener("change", onChange);
      } else if (typeof standaloneMql.addListener === "function") {
        standaloneMql.addListener(onChange);
      }
    }
  } catch (e) {
    /* ignore */
  }
})();
