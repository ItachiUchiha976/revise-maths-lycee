/* ────────────────────────────────────────────────────────────────────────────
   bos-espace-eleve.js — le point d'entrée « Mon espace élève », visible partout.

   Pourquoi ce fichier existe (26/07/2026) : l'accès à l'espace élève n'existait QUE
   sous la forme d'un lien en pied de page. Autrement dit, un élève qui vient d'acheter
   et qui revient le lendemain ne retrouve pas ce qu'il a payé. C'est le genre de détail
   qui transforme une vente en demande de remboursement.

   Le lien est injecté par script plutôt que recopié dans 54 fichiers : une seule source,
   aucune page oubliée, et le libellé s'adapte à la situation de la personne.

   Deux états, parce que les deux publics n'ont pas le même besoin :
     • élève AYANT un accès  → « 🎓 Mon espace », mis en avant, mène droit à ses vidéos
       (et vers la bonne formation : Terminale si les deux sont détenues) ;
     • visiteur SANS accès   → « 🔑 Connexion élève », vers la page de récupération.

   ⚠️ Ce script n'accorde AUCUN droit : il ne fait que lire l'état et router. Les verrous
   restent côté serveur (les identifiants de vidéos ne sont jamais dans les fichiers publics).
   ──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  function lire(cle) {
    try { return localStorage.getItem(cle) || sessionStorage.getItem(cle) || ''; }
    catch (e) { return ''; }
  }

  function situation() {
    var p = lire('fp_access') === '1' || !!lire('fp_token');
    var t = lire('ft_access') === '1' || !!lire('ft_token');
    if (t) return { acces: true, url: 'formation-terminale-espace.html', libelle: '🎓 Mon espace' };
    if (p) return { acces: true, url: 'formation-premiere-espace.html', libelle: '🎓 Mon espace' };
    return { acces: false, url: 'connexion.html', libelle: '🔑 Connexion élève' };
  }

  function dejaPresent(zone) {
    return !!zone.querySelector('[data-bos-espace]');
  }

  function creerLien(s, classe) {
    var a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.libelle;
    a.className = classe;
    a.setAttribute('data-bos-espace', '1');
    if (s.acces) {
      // un élève qui a payé doit repérer son accès du premier coup d'œil
      a.style.cssText = 'background:#f5b301;color:#1a2352;font-weight:700;border-radius:999px;' +
                        'padding:.34rem .8rem;';
    }
    return a;
  }

  function poser() {
    var s = situation();

    // 1) barre de navigation (bureau)
    var nav = document.querySelector('nav.nav-yt, nav.nav-list, header nav');
    if (nav && !dejaPresent(nav)) {
      var lien = creerLien(s, 'nav-pack-link');
      // juste avant le lien YouTube s'il existe, sinon à la fin
      var yt = nav.querySelector('a[href*="youtube.com"]');
      if (yt) nav.insertBefore(lien, yt); else nav.appendChild(lien);
    }

    // 2) menu mobile, quand la page en a un
    var mob = document.querySelector('.mobile-menu, #mobile-menu');
    if (mob && !dejaPresent(mob)) {
      var l2 = creerLien(s, 'mobile-menu-link');
      mob.insertBefore(l2, mob.firstChild);
    }

    // 3) rappel discret sur l'accueil, pour l'élève qui revient
    if (s.acces && /(^|\/)(index\.html)?$/.test(location.pathname.split('?')[0])) {
      var hero = document.querySelector('.hero');
      if (hero && !document.querySelector('[data-bos-retour]')) {
        var d = document.createElement('div');
        d.setAttribute('data-bos-retour', '1');
        d.style.cssText = 'max-width:920px;margin:.9rem auto 0;padding:.75rem 1rem;border-radius:12px;' +
                          'background:#fff8e6;border:1px solid #f5d98a;text-align:center;color:#4a3c10;';
        d.innerHTML = 'Content de te revoir. <a href="' + s.url +
                      '" style="color:#1a2352;font-weight:700;text-decoration:underline">' +
                      'Reprendre ma formation →</a>';
        hero.parentNode.insertBefore(d, hero.nextSibling);
      }
    }
  }

  /* ── Le niveau suit l'élève ──────────────────────────────────────────────
     Les quiz et les flashcards s'ouvraient toujours sur « Tous les niveaux », y compris
     pour un élève dont on sait très bien en quelle classe il est. Il devait re-sélectionner
     sa classe à chaque visite — et, pire, tombait sur des questions de Terminale alors
     qu'il est en Première (donc sur un programme qu'il n'a pas encore vu).

     Règle appliquée (Fred, 26/07/2026) :
       • formation Première  → on ouvre sur « Première » ;
       • formation Terminale → on ouvre sur « Terminale », mais l'élève garde accès au
         programme de Première, dont il a besoin comme socle ;
       • personne sans formation → on ne touche à rien, tous les niveaux restent offerts.
     Le choix reste modifiable : on pré-remplit, on n'impose pas. Et si l'élève a déjà
     choisi lui-même pendant sa visite, on ne le contredit pas. */
  function niveauParDefaut() {
    var s = situation();
    if (!s.acces) return null;
    var t = lire('ft_access') === '1' || !!lire('ft_token');
    return t ? 'Terminale' : 'Première';
  }

  function preselectionnerNiveau() {
    var niveau = niveauParDefaut();
    if (!niveau) return;
    ['qz-level', 'fc-level'].forEach(function (id) {
      var sel = document.getElementById(id);
      if (!sel || sel.dataset.bosTouche === '1') return;
      var existe = [].some.call(sel.options, function (o) { return o.value === niveau; });
      if (!existe || sel.value !== 'all') return;      // déjà choisi par l'élève : on respecte
      sel.value = niveau;
      sel.dataset.bosTouche = '1';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  /* ── Filtrer les modules d'exercices par classe ───────────────────────────
     La liste des modules affichait les neuf modules en vrac. Chaque carte porte bien son
     niveau (« Première spé maths », « Première / Terminale »…), mais l'élève devait lire
     les neuf étiquettes pour trouver les siennes. On ajoute donc un filtre, réglé d'avance
     sur sa classe quand on la connaît.

     Un élève de Terminale voit aussi les modules de Première : les dérivées, les suites et
     le second degré de Première sont le socle du programme de Terminale. L'inverse serait
     décourageant — on n'envoie pas un élève de Première sur des intégrales. */
  function filtrerModules() {
    var grille = document.querySelector('.module-grid');
    if (!grille || document.querySelector('[data-bos-filtre]')) return;
    var cartes = [].slice.call(grille.querySelectorAll('.module-card'));
    if (cartes.length < 4) return;                 // pas la grille des modules

    function niveauDe(carte) {
      var e = carte.querySelector('.card-level');
      var t = (e ? e.textContent : '').toLowerCase();
      return { premiere: t.indexOf('première') > -1 || t.indexOf('premiere') > -1,
               terminale: t.indexOf('terminale') > -1 };
    }

    function appliquer(choix) {
      cartes.forEach(function (c) {
        var n = niveauDe(c);
        var garder = choix === 'tout'
          || (choix === 'premiere' && n.premiere)
          || (choix === 'terminale' && (n.terminale || n.premiere));  // Terminale = tout le socle
        c.style.display = garder ? '' : 'none';
      });
      [].forEach.call(document.querySelectorAll('[data-bos-niv]'), function (b) {
        var actif = b.getAttribute('data-bos-niv') === choix;
        b.style.background = actif ? '#2451B8' : '#eef2f9';
        b.style.color = actif ? '#fff' : '#41506b';
      });
    }

    var barre = document.createElement('div');
    barre.setAttribute('data-bos-filtre', '1');
    barre.style.cssText = 'display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;' +
                          'margin:0 0 1.1rem;';
    [['tout', 'Tous les niveaux'], ['premiere', 'Première'], ['terminale', 'Terminale']]
      .forEach(function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = p[1];
        b.setAttribute('data-bos-niv', p[0]);
        b.style.cssText = 'border:0;border-radius:999px;padding:.45rem 1.05rem;font-weight:700;' +
                          'font-size:.92rem;cursor:pointer;background:#eef2f9;color:#41506b;';
        b.addEventListener('click', function () { appliquer(p[0]); });
        barre.appendChild(b);
      });
    grille.parentNode.insertBefore(barre, grille);

    var n = niveauParDefaut();                     // « Première » / « Terminale » / null
    appliquer(n === 'Terminale' ? 'terminale' : (n === 'Première' ? 'premiere' : 'tout'));
  }

  function demarrer() {
    poser();
    // les listes de chapitres sont remplies par les scripts de page ; on repasse ensuite
    preselectionnerNiveau();
    filtrerModules();
    setTimeout(preselectionnerNiveau, 700);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
