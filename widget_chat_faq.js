/* ═══════════════════════════════════════════════════════════════════
   Chatbot FAQ — Maths avec Fred (mathsavecfred.fr)
   Assistant de FONCTIONNEMENT du site (jamais les maths).
   Intégration : coller ce script AVANT </body>, ou le servir en
   fichier et l'inclure via <script src="widget_chat_faq.js"></script>.
   Endpoint : https://api.tonargentexplique.fr/cours/chat-faq
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  if (window.__chatFaqInjected) return;
  window.__chatFaqInjected = true;

  var API = "https://api.tonargentexplique.fr/cours/chat-faq";

  var CSS = [
    "#bos-chat-faq-fab{position:fixed;right:20px;bottom:20px;z-index:99999;width:58px;height:58px;border-radius:50%;",
    "background:#4f46e5;color:#fff;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(79,70,229,.4);",
    "display:flex;align-items:center;justify-content:center;font-size:26px;transition:transform .15s}",
    "#bos-chat-faq-fab:hover{transform:scale(1.06)}",
    "#bos-chat-faq-panel{position:fixed;right:20px;bottom:90px;z-index:99999;width:340px;max-width:calc(100vw - 32px);",
    "height:460px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.18);",
    "display:flex;flex-direction:column;overflow:hidden;font-family:Poppins,system-ui,-apple-system,sans-serif}",
    "#bos-chat-faq-panel[hidden]{display:none}",
    "#bos-chat-faq-head{background:#4f46e5;color:#fff;padding:14px 16px;font-weight:600;font-size:15px;",
    "display:flex;justify-content:space-between;align-items:center}",
    "#bos-chat-faq-head small{font-weight:400;opacity:.85;font-size:11px;display:block}",
    "#bos-chat-faq-close{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1}",
    "#bos-chat-faq-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#f6f7fb}",
    ".bos-msg{max-width:82%;padding:9px 13px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}",
    ".bos-msg.bot{background:#fff;border:1px solid #e5e7eb;align-self:flex-start;border-bottom-left-radius:4px}",
    ".bos-msg.user{background:#4f46e5;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}",
    ".bos-msg.typing{color:#6b7280;font-style:italic}",
    "#bos-chat-faq-form{display:flex;border-top:1px solid #e5e7eb;padding:10px;gap:8px;background:#fff}",
    "#bos-chat-faq-input{flex:1;border:1px solid #d1d5db;border-radius:20px;padding:9px 14px;font-size:14px;font-family:inherit;outline:none}",
    "#bos-chat-faq-input:focus{border-color:#4f46e5}",
    "#bos-chat-faq-send{background:#4f46e5;color:#fff;border:none;border-radius:20px;padding:0 16px;font-size:14px;cursor:pointer;font-family:inherit}",
    "#bos-chat-faq-send:disabled{opacity:.5;cursor:default}"
  ].join("");

  var style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  var fab = document.createElement("button");
  fab.id = "bos-chat-faq-fab";
  fab.setAttribute("aria-label", "Ouvrir l'assistant");
  fab.textContent = "💬";
  document.body.appendChild(fab);

  var panel = document.createElement("div");
  panel.id = "bos-chat-faq-panel";
  panel.hidden = true;
  panel.innerHTML =
    '<div id="bos-chat-faq-head"><div>Assistant Maths avec Fred' +
    '<small>réponses sur le site, pas les exercices</small></div>' +
    '<button id="bos-chat-faq-close" aria-label="Fermer">×</button></div>' +
    '<div id="bos-chat-faq-body"></div>' +
    '<form id="bos-chat-faq-form">' +
    '<input id="bos-chat-faq-input" type="text" placeholder="Ta question (prix, accès…)" autocomplete="off" />' +
    '<button id="bos-chat-faq-send" type="submit">Envoyer</button>' +
    "</form>";
  document.body.appendChild(panel);

  var body = panel.querySelector("#bos-chat-faq-body");
  var input = panel.querySelector("#bos-chat-faq-input");
  var form = panel.querySelector("#bos-chat-faq-form");
  var sendBtn = panel.querySelector("#bos-chat-faq-send");

  function addMsg(text, who) {
    var m = document.createElement("div");
    m.className = "bos-msg " + who;
    m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }

  addMsg("Bonjour 👋 Je réponds à tes questions sur le site et les formations (prix, accès, contenu). Pour les maths, direction les exercices !", "bot");

  fab.addEventListener("click", function () {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) input.focus();
  });
  panel.querySelector("#bos-chat-faq-close").addEventListener("click", function () {
    panel.hidden = true;
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var q = input.value.trim();
    if (!q || sendBtn.disabled) return;
    addMsg(q, "user");
    input.value = "";
    var typing = addMsg("…", "bot");
    typing.className = "bos-msg bot typing";
    sendBtn.disabled = true;

    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        typing.remove();
        addMsg(d.reponse || "Désolé, je n'ai pas compris.", "bot");
        sendBtn.disabled = false;
      })
      .catch(function () {
        typing.remove();
        addMsg("Impossible de joindre l'assistant. Réessaie dans un instant.", "bot");
        sendBtn.disabled = false;
      });
  });
})();
