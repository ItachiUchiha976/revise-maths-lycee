// "Mes appareils" — self-service (max 2 appareils, modèle Netflix). BOS 15/07/2026.
// Un appareil DÉJÀ autorisé peut en retirer un pour libérer une place. Un appareil bloqué ne peut pas gérer la liste (sécurité).
(function () {
  window.initBosDevices = function (formation, token, deviceId) {
    if (!token || !deviceId) return;
    if (document.getElementById('bosdev-btn')) return; // anti-doublon
    var API = 'https://api.tonargentexplique.fr/formation-devices';
    function post(extra) {
      return fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ formation: formation, token: token, device: deviceId }, extra))
      }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }
    var btn = document.createElement('button');
    btn.id = 'bosdev-btn'; btn.type = 'button'; btn.textContent = '⚙️ Mes appareils';
    btn.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9998;background:#4f46e5;color:#fff;border:none;border-radius:999px;padding:.6rem 1.05rem;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.2);font-family:inherit;font-size:.9rem';
    document.body.appendChild(btn);
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(20,20,40,.5);z-index:9999;display:none;align-items:center;justify-content:center;padding:1rem';
    overlay.innerHTML = '<div id="bosdev-card" style="background:#fff;max-width:440px;width:100%;border-radius:16px;padding:1.5rem;font-family:inherit;box-shadow:0 20px 60px rgba(0,0,0,.3)"></div>';
    document.body.appendChild(overlay);
    var card = overlay.querySelector('#bosdev-card');
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.style.display = 'none'; });
    function fmt(ts) { if (!ts) return ''; try { return ' · vu le ' + new Date(ts).toLocaleDateString('fr-FR'); } catch (e) { return ''; } }
    function draw(data) {
      var devs = (data && data.devices) || [];
      var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem"><h3 style="margin:0;font-size:1.15rem;color:#312e81">Mes appareils (' + devs.length + '/2)</h3><button id="bosdev-x" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#888;line-height:1">&times;</button></div>';
      h += '<p style="color:#5b647a;font-size:.9rem;margin:0 0 1rem;line-height:1.5">Ton accès fonctionne sur <b>2 appareils</b> maximum. Pour en connecter un nouveau (tu as changé de téléphone, un appareil est cassé…), <b>retire d\'abord un appareil</b> ci-dessous — ça libère une place aussitôt.</p>';
      if (!devs.length) { h += '<p style="color:#5b647a">Aucun appareil enregistré.</p>'; }
      devs.forEach(function (d) {
        h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem;padding:.7rem .9rem;border:1px solid #e3e1f5;border-radius:10px;margin-bottom:.6rem">';
        h += '<span style="font-size:.92rem;color:#241a2e">' + (d.current ? '📱 <b>Cet appareil</b>' : '💻 Autre appareil') + '<span style="color:#8a90a2;font-size:.8rem">' + fmt(d.last) + '</span></span>';
        h += d.current ? '<span style="color:#22a06b;font-weight:700;font-size:.85rem">actif</span>' : '<button data-rm="' + d.id + '" style="background:#fde8e8;color:#c0392b;border:none;border-radius:8px;padding:.4rem .75rem;font-weight:700;cursor:pointer;font-size:.85rem">Retirer</button>';
        h += '</div>';
      });
      card.innerHTML = h;
      card.querySelector('#bosdev-x').onclick = function () { overlay.style.display = 'none'; };
      Array.prototype.forEach.call(card.querySelectorAll('[data-rm]'), function (b) {
        b.onclick = function () { b.textContent = '…'; post({ action: 'remove', target: b.getAttribute('data-rm') }).then(function (d) { draw(d || { devices: [] }); }); };
      });
    }
    btn.onclick = function () { overlay.style.display = 'flex'; card.innerHTML = '<p style="font-family:inherit;color:#5b647a">Chargement…</p>'; post({ action: 'list' }).then(function (d) { draw(d || { devices: [] }); }); };
  };
})();
