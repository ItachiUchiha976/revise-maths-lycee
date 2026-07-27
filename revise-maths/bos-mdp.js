/* bos-mdp.js — confort de saisie des mots de passe, sur TOUTES les pages du site.
 *
 * Demandé par Fred le 27/07/2026 : « il devrait aussi y avoir un bouton pour afficher
 * le mot de passe pour éviter les erreurs » et « la touche Entrée doit valider ».
 *
 * Ce que fait ce fichier, sans rien avoir à configurer :
 *   1. Ajoute un œil 👁 dans CHAQUE champ type="password" de la page.
 *   2. Fait valider la touche Entrée, même quand le bouton n'est pas dans un <form>
 *      (cas de l'espace prof, de l'espace élève et du parcours « Première connexion »).
 *   3. Traite aussi les champs créés APRÈS le chargement (interfaces qui se redessinent),
 *      via un MutationObserver.
 *
 * À inclure en fin de <body> :  <script defer src="../bos-mdp.js?v=1"></script>
 */
(function () {
  "use strict";

  var MARQUE = "data-bos-oeil";

  function ajouteOeil(champ) {
    if (champ.getAttribute(MARQUE)) return;          // déjà traité
    champ.setAttribute(MARQUE, "1");

    var enveloppe = document.createElement("div");
    enveloppe.style.cssText = "position:relative;display:block";
    champ.parentNode.insertBefore(enveloppe, champ);
    enveloppe.appendChild(champ);
    champ.style.paddingRight = "3rem";

    var oeil = document.createElement("button");
    oeil.type = "button";
    oeil.setAttribute("aria-label", "Afficher le mot de passe");
    oeil.textContent = "👁";
    /* ⚠️ `color` est OBLIGATOIRE ici, et `!important` avec.
       Piège vécu le 27/07/2026 sur l'espace prof : sa feuille de style applique
       `button { color:#fff }` à TOUS les boutons. L'emoji 👁 est un caractère texte :
       il héritait donc du blanc, sur le fond blanc du champ — l'œil existait bien
       (44x44, bien placé, offsetParent non nul) mais était littéralement invisible.
       Aucune mesure programmatique ne l'attrape : seule une capture d'écran l'a montré. */
    oeil.style.cssText =
      "position:absolute;right:.5rem;top:50%;transform:translateY(-50%);" +
      "background:none!important;border:0;cursor:pointer;font-size:1.2rem;line-height:1;" +
      "padding:.35rem;opacity:.75;min-width:44px;min-height:44px;" +
      "color:#374151!important;box-shadow:none;margin:0";

    oeil.addEventListener("click", function () {
      var cache = champ.type === "password";
      champ.type = cache ? "text" : "password";
      oeil.textContent = cache ? "🙈" : "👁";
      oeil.setAttribute("aria-label", cache ? "Masquer le mot de passe" : "Afficher le mot de passe");
      champ.focus();
    });

    enveloppe.appendChild(oeil);
  }

  /* La touche Entrée valide le bouton le plus proche.
     Dans un <form> avec un submit, le navigateur le fait déjà — on ne touche à rien.
     Ailleurs, on cherche le premier bouton du même bloc. */
  function brancheEntree(champ) {
    if (champ.getAttribute("data-bos-entree")) return;
    champ.setAttribute("data-bos-entree", "1");

    champ.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var form = champ.closest("form");
      if (form && form.querySelector('[type="submit"]')) return;   // comportement natif

      var bloc = champ.closest("div, section, fieldset") || document;
      var bouton = bloc.querySelector("button:not([type=button][aria-label*='mot de passe'])");
      // on évite d'activer l'œil lui-même
      var boutons = bloc.querySelectorAll("button");
      for (var i = 0; i < boutons.length; i++) {
        if (!boutons[i].getAttribute("aria-label") ||
            boutons[i].getAttribute("aria-label").indexOf("mot de passe") === -1) {
          bouton = boutons[i];
          break;
        }
      }
      if (bouton) { e.preventDefault(); bouton.click(); }
    });
  }

  function traite() {
    var champs = document.querySelectorAll('input[type="password"]');
    for (var i = 0; i < champs.length; i++) { ajouteOeil(champs[i]); }
    // l'Entrée vaut aussi pour les champs e-mail / texte des blocs de connexion
    var saisies = document.querySelectorAll('input[type="password"], input[type="email"], input[type="text"]');
    for (var j = 0; j < saisies.length; j++) { brancheEntree(saisies[j]); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", traite);
  } else {
    traite();
  }

  // Les espaces prof/élève redessinent leur interface : on re-traite ce qui apparaît.
  if (window.MutationObserver) {
    new MutationObserver(function () { traite(); })
      .observe(document.documentElement, { childList: true, subtree: true });
  }
})();
