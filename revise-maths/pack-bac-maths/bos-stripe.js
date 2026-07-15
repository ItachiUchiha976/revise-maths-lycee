/* BOS — Checkout Stripe (produits digitaux). Restauré le 12/07/2026.
   Le bouton crée une session Checkout via l'API VPS (stripe-api) qui génère
   le token de téléchargement (livraison de l'ebook) injecté dans success_url.
   Encaisse vers le compte Stripe de la boutique.

   MAJ 15/07/2026 (demande Fred) : le bouton « Payer par CB » se place désormais
   JUSTE SOUS chaque bouton PayPal (.btn-buy → bosBuyNow), avec la même géométrie
   (classe btn-buy réutilisée), pour un rendu groupé et pro. Avant, aucun sélecteur
   d'ancre ne matchait .btn-buy → le bouton tombait après le <h1> (dispersé). */

(function(){
  'use strict';

  var STRIPE_API = 'https://api.tonargentexplique.fr/create-checkout-session';

  // Produits digitaux de ce site (prix TTC = prix affichés sur les pages)
  var DIGITAL = {
    'pack-bac-maths':  { amount: 9.90,  boutique: 'mathsavecfred' },
    'controle-argent': { amount: 9.00,  boutique: 'tonargentexplique' },
    'pack-budget':     { amount: 12.00, boutique: 'tonargentexplique' }
  };

  function findProduct() {
    var el = document.querySelector('[data-bos-product-id]');
    if (el) {
      var pid = el.getAttribute('data-bos-product-id');
      if (DIGITAL[pid]) return pid;
    }
    var parts = location.pathname.replace(/\/+$/, '').split('/');
    var slug = (parts.pop() || '').replace(/\.html?$/, '');
    if (slug === 'index' || slug === '') slug = parts.pop() || '';
    return DIGITAL[slug] ? slug : null;
  }

  function euros(a){ return a.toFixed(2).replace('.', ',') + ' €'; }

  function makeStripeButton(pid, p) {
    var btn = document.createElement('button');
    btn.type = 'button';
    // Réutilise la géométrie de .btn-buy (largeur, padding, radius, police) => aligné
    // exactement sous le bouton PayPal ; seules la couleur et la marge changent.
    btn.className = 'btn-buy bos-stripe-btn';
    btn.style.cssText = 'background:#635BFF;color:#fff;box-shadow:0 6px 24px rgba(99,91,255,0.30);margin-top:12px;';
    var label = '💳 Payer par CB — ' + euros(p.amount);
    btn.innerHTML = label;
    btn.onmouseover = function(){ this.style.background = '#4F46E5'; };
    btn.onmouseout  = function(){ this.style.background = '#635BFF'; };

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      btn.textContent = '⏳ Redirection vers le paiement...';
      btn.disabled = true;
      fetch(STRIPE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: p.amount, currency: 'eur', boutique: p.boutique, products: [pid],
          /* BOS 13/07/2026 : sans returnPath, Stripe renvoyait vers /merci.html a la RACINE du domaine
             (404 ou page sans code token) => le client payait et ne recevait rien. */
          returnPath: location.pathname.replace(/[^\/]*$/, 'merci.html'),
          cancelPath: location.pathname })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.url) { window.location.href = data.url; }
        else {
          alert('Erreur de paiement : ' + (data.error || 'inconnue') + '. Tu peux aussi payer par PayPal juste au-dessus.');
          btn.innerHTML = label; btn.disabled = false;
        }
      })
      .catch(function() {
        alert('Impossible de contacter le serveur de paiement. Réessaie dans quelques instants, ou utilise le bouton PayPal.');
        btn.innerHTML = label; btn.disabled = false;
      });
    });
    return btn;
  }

  var _done = false;
  function addStripeButton(pid) {
    if (_done) return;
    var p = DIGITAL[pid];
    if (!p) return;

    // Cible = chaque bouton PayPal (.btn-buy qui appelle bosBuyNow). Le bouton CB
    // se glisse juste APRÈS, dans le même parent => les deux boutons sont regroupés.
    var targets = Array.prototype.slice.call(document.querySelectorAll('button.btn-buy'))
      .filter(function(b){ return /bosBuyNow/.test(b.getAttribute('onclick') || ''); });

    if (!targets.length) {
      // Fallback (pages sans .btn-buy) : ancienne logique d'ancre.
      var anchor = document.querySelector('.bos-paypal-btn') ||
                   document.querySelector('.btn-checkout') ||
                   document.querySelector('.checkout-stripe') ||
                   document.getElementById('stripe-btn-container');
      if (anchor) targets = [anchor];
    }
    if (!targets.length) return;

    var added = 0;
    targets.forEach(function(anchor){
      if (!anchor.parentNode) return;
      var nxt = anchor.nextElementSibling;
      if (nxt && nxt.classList && nxt.classList.contains('bos-stripe-btn')) return; // déjà posé
      var btn = makeStripeButton(pid, p);
      anchor.parentNode.insertBefore(btn, anchor.nextSibling);
      added++;
    });
    if (added) _done = true;

    try {
      if (window.umami && typeof umami.track === 'function') {
        umami.track('view_stripe_button', {page: location.pathname});
      }
    } catch(e) {}
  }

  function init() {
    var pid = findProduct();
    if (pid) addStripeButton(pid);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
