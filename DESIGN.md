# DESIGN.md — Système de design de mathsavecfred.fr (revise-maths-lycee)

> **À LIRE AVANT TOUTE ÉDITION DU SITE.** Ce fichier est la référence unique du design.
> Tout agent (Claude Code, autopilote, sous-agent) qui modifie une page de ce repo doit
> s'y conformer. Source de vérité technique : `revise-maths/style.css` (refonte
> « Design System Express », site-type FORMATION, 16/07/2026 + design v2 structurel).
> Dernière mise à jour de ce document : 17/07/2026.

---

## 1. Identité — « académique confiance »

Site de formation maths lycée (Seconde / Première / Terminale spé), tenu par **Fred,
professeur de maths pour lycéen(ne)s et collégien(ne)s** (jamais « prof de lycée »).
L'ambiance visuelle : **sérieux académique bleu** + **motivation gamifiée ambre/vert**,
motif « papier millimétré » (grille de points CSS) en filigrane, symboles mathématiques
flottants en fond de hero. Mobile-first, compatible KaTeX.

- **Public** : lycéens 15-18 ans (et leurs parents pour le paiement).
- **Promesse** : « Passe le BAC maths avec confiance » — preuve, méthode, pas de bling.
- **Modèle freemium** : ~10 % du contenu gratuit (échantillon), 90 % dans les formations.

## 2. Ton de voix (FR)

- **Tutoiement systématique** de l'élève : « Entraîne-toi », « Ton email », « Teste-toi ».
- **Encourageant, jamais culpabilisant** : « Tu n'es pas seul·e face aux maths ».
- **Preuve avant promesse** : chiffres réels uniquement (19 chapitres, 290 flashcards,
  233 quiz — vérifiés dans `formation-banque-revision.json` ; « Plus de 2 800 leçons
  données »). Ne JAMAIS inventer un chiffre de preuve.
- **Honnêteté freemium affichée** : « Ici, tu testes gratuitement ~10 % de chaque
  contenu » — on dit clairement ce qui est gratuit et ce qui est payant.
- **Fred au masculin** (« ravi », « content ») ; l'élève en écriture inclusive légère
  (« prévenu·e », « seul·e »).
- **Emojis fonctionnels** en tête de libellés de nav/CTA (🎓 🧠 🎯 🎮 🧮 💡 📘 📄) —
  jamais en pluie décorative dans les paragraphes.
- **Accents français corrects partout** (é, è, ê, à, ç…) — un texte sans accents est
  un bug bloquant.

## 3. Palette (valeurs exactes — tokens de `style.css`)

| Token | Hex | Rôle |
|---|---|---|
| `--color-primary` | `#2451B8` | Bleu académique — confiance, titres colorés, boutons primaires, liens |
| `--color-primary-dark` | `#173A8C` | Dégradés header/footer, texte sur fond ambre |
| `--color-primary-light` | `#EAF0FB` | Fond des badges/pills |
| `--color-accent` | `#F5A623` | Ambre — motivation, gamification, badge série, CTA formations |
| `--color-accent-dark` | `#D9891D` | Ambre foncé (texte urgence, hover) |
| `--color-cta` / `--color-success` | `#22C55E` | Vert — validation, boutons d'action (capture email) |
| `--color-cta-dark` | `#16A34A` | Vert foncé (dégradés de boutons) |
| `--color-error` | `#ef4444` | UNIQUEMENT états d'erreur de champ |
| `--color-bg` | `#F7F9FC` | Fond de page |
| `--color-bg-alt` | `#EEF3FC` | Bandes alternées (proof-band) |
| `--color-surface` | `#ffffff` | Cartes, hero |
| `--color-border` | `#E2E8F0` | Bordures 1px des cartes |
| `--color-text` | `#14171F` | Texte principal |
| `--color-text-muted` | `#5B6472` | Texte secondaire |
| `--color-youtube` | `#ff0000` | RÉSERVÉ aux vrais liens YouTube (c'est la marque) |
| `--color-navy-deep` | `#14213D` | Navy dramatique — bloc sombre « formations » |

**Accents des cartes/outils** (classes additives `acc-a` → `acc-f` sur `.module-card`,
`.quick-launch a`, `.tool-band`) : `#2451B8` bleu · `#F5A623` ambre · `#22C55E` vert ·
`#A855F7` violet · `#EC4899` rose · `#0EA5E9` bleu ciel. Mécanique : variable locale
`--acc` + `color-mix(in srgb, var(--acc) 12%, white)` pour les fonds pastel.

Fond de page : deux `radial-gradient` très légers (bleu 7 %, ambre 6 %) sur `#F7F9FC`,
`background-attachment: fixed`.

⚠️ Les pages de vente formation (`formation-premiere.html`, `formation-terminale.html`)
portent encore des accents hérités (`#4f46e5` indigo, `#ffd23f` jaune CTA) antérieurs à
la refonte 16/07. Toute retouche future de ces pages doit **converger vers la palette
système** ci-dessus (bleu `#2451B8`, ambre `#F5A623`), pas propager l'indigo.

## 4. Typographies

```css
--font:        'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
--font-heading:'Sora', var(--font);
```

- **Sora** (600/700/800) : h1-h4, `.logo`, gros chiffres (`.price-amount`, `.proof-num`),
  cartes flottantes du hero. `letter-spacing: -.01em` sur les titres.
- **Inter** (400/500/600/700) : corps de texte, boutons, formulaires. `line-height: 1.6`,
  `font-variant-numeric: tabular-nums` sur le body (les chiffres s'alignent).
- **Typo distinctive mathématique (serif)** — la signature du site : les symboles et
  écritures mathématiques décoratifs sont en **serif**, jamais en Inter/Sora :
  - symboles SVG flottants du hero (`.bos-sym text`) : `Georgia, 'Times New Roman', serif`,
    graisse 700, fill `#2451B8` ;
  - exemples résolus (`.we-math`) : `"Cambria Math", Georgia, serif` sur fond `#f7f9fc` ;
  - décorations SVG des pages formation : `font-family="serif" font-style="italic"`
    (∫, f'(x)…).
  Les **formules exigibles** dans le contenu pédagogique passent par **KaTeX** (CDN
  0.16.10), jamais par du texte brut stylisé.
- Import : Google Fonts (`@import` en tête de `style.css` + `preconnect` dans les pages).
- Échelle : h1 hero `clamp(2.2rem, 1.3rem + 4vw, 3.9rem)` ; h2 section `1.5rem` avec
  soulignement dégradé bleu→ambre (54×4px, `::after`) ; corps `1rem/16px` ; petits
  labels `.76–.88rem` en 600/700.

## 5. Espacement, rayons, ombres

- **Échelle 8pt** : `--space-1:4px · 2:8 · 3:12 · 4:16 · 6:24 · 8:32 · 12:48 · 16:64`.
- **Rayons** (site FORMATION = plus sobre que les boutiques, pas de bouton pill) :
  `--radius:10px` (boutons) · `--radius-card:12px` (cartes) · `--radius-lg:16px`
  (hero, bandeaux, offre) · `--radius-pill:999px` (RÉSERVÉ badges/séries/onglets actifs).
- **Ombres** : `--shadow: 0 1px 3px rgba(20,23,31,.06)` (repos) ·
  `--shadow-lg: 0 14px 34px rgba(20,40,80,.14)` (blocs importants) ·
  `--shadow-hover: 0 16px 32px rgba(36,81,184,.18)` (survol cartes).
  Boutons colorés : ombre teintée de leur propre couleur (ex. vert
  `rgba(34,197,94,.28)`, bleu `rgba(36,81,184,.30)`).
- **Largeurs** : contenu `--max-width: 940px` ; header élargi à `1180px` pour que les
  onglets tiennent en une ligne.
- **Cibles tactiles** : `min-height: 44px` minimum sur tout élément cliquable mobile
  (48px sur les CTA principaux).

## 6. Composants récurrents (ne pas réinventer — réutiliser)

- **Header sticky** : dégradé bleu `120deg #2451B8 → #2f5fce → #173A8C` + grille de
  points blanche (`radial-gradient … / 20px 20px`). Se cache au scroll vers le bas,
  revient vers le haut (`.nav-hidden` / `.nav-compact` posées par `bos-nav-shrink.js`).
  ≤600px : hamburger généré en JS (aucune retouche HTML), menu déroulant VERTICAL,
  fermeture par clic dehors / lien / Échap. L'onglet actif = pill ambre pleine
  (`.nav-pack-link.active`, texte navy `#173A8C`).
- **Hero** : split asymétrique 55/45 dès 900px (`.hero-grid`), empilé centré sur mobile.
  Fond = papier millimétré + halo bleu ; symboles SVG flottants (voir §7) ;
  `<span class="hl">` = surlignage ambre 38 % sous le mot-clé ; cartes flottantes
  `.float-card` (formules en Sora, rotations ±4-7°).
- **Quick-launch** : chips horizontales scrollables (pattern « stories »), fondu de
  masque à droite, 1 tap = 1 outil.
- **Badges** (`.badge`) : pills bleu clair `#EAF0FB` / texte `#2451B8` (programme,
  niveaux, features).
- **Module-card** (`.module-card acc-*`) : carte blanche, bordure 1px + **liseré haut
  3px** couleur d'accent, icône émoji dans pastille ronde pastel, titre Sora 800,
  description 2 lignes max (`-webkit-line-clamp:2`), pied = pill niveau + flèche `→`.
  Mobile ≤600px : la grille devient rangée horizontale scrollable (tuiles 76 %).
- **Proof-band** : bande `#EEF3FC` avec 3 chiffres animés en count-up (voir §7) +
  mention « Conforme au programme officiel ».
- **Prof-badge** : photo ronde de Fred + 2 lignes de crédibilité — le composant confiance.
- **Email-capture** : fond dégradé `#eef2ff→#f5f3ff`, liseré gauche 5px bleu, formulaire
  Web3Forms, bouton vert dégradé, consentement RGPD à cocher, note « Pas de spam ».
- **Offer-block** (Pack Bac 9,90 €) : fond crème `#fffbeb→#fff7ed`, badge ambre uppercase,
  liste à ✓, prix en Sora 2.5rem bleu, CTA bleu dégradé.
- **Formations-band** : bloc sombre navy (`#14213D→#173A8C→#0F2861`) à **bords diagonaux**
  (`clip-path` 34px, 20px mobile — max 2 par page), eyebrow pill, CTA ambre texte navy.
- **Tool-band** : mini-hero bandeau dégradé de la couleur de l'outil (quiz/flashcards/
  jeux/calcul mental) — couleurs vérifiées contraste AA (`acc-b` = texte navy sur ambre).
- **Reviews** : cartes blanches, étoiles ambre `#F5A623`, citation italique, avatar
  initiale sur dégradé bleu. Témoignages réels uniquement (prénom + niveau).
- **Gamification** (façon Duolingo) : `.bos-progress` (barre 8px pill verte, transition
  width .4s) + `.streak-badge` (pill ambre, **texte navy `#173A8C`** — le blanc sur ambre
  échoue au contraste AA en petit texte).
- **FAQ** : `<details>/<summary>` stylés, marqueur `+`/`−`.
- **Footer** : dégradé navy `#173A8C→#0F2861`, 5 colonnes (marque/outils/formations/
  guides/légal), liens `#FBBF57` ; 2 colonnes ≤860px, 1 colonne ≤480px.
- **Pastille rétractation** (`bos-retractation.js`, racine) : lien fixe bas-gauche
  « Droit de rétractation » + modal de confirmation → API VPS. Obligation légale
  (ordonnance 2026-2) — TOUJOURS présent sur les pages de vente.
- **Sticky CTA mobile** (`bos-sticky-cta.js`) : barre d'achat ≤768px qui clone le bouton
  d'achat existant (aucune logique dupliquée).

## 7. Animations & mouvement

Règle générale : **léger, utile, jamais devant le contenu**. Durées 150-400ms pour les
interactions, easing `ease`/`ease-in-out`.

- **Symboles maths flottants** (hero, `index.html`) : 6 SVG (π √ ∫ Σ x² ƒ) en opacité
  `.09`, `z-index:-1`, `pointer-events:none`, keyframes `bosSymFloatA/B` (translateY
  ±12-14px + rotation ±4°, 6.5-10s, déphasés). Jamais devant le texte ni les boutons.
- **Count-up des chiffres de preuve** : IntersectionObserver (threshold .4), 1100ms,
  ease-out cubique, ne joue qu'une fois.
- **Hover** : boutons/CTA `translateY(-2px)` + ombre renforcée ; cartes
  `translateY(-4px)` + `--shadow-hover` ; icône de carte `scale(1.08) rotate(-4deg)` ;
  flèche de carte `translateX(6px)`.
- **`prefers-reduced-motion: reduce` OBLIGATOIRE** : les keyframes passent à
  `animation: none`, le count-up affiche directement la valeur finale (les deux
  mécanismes existent déjà — les répliquer pour toute nouvelle animation).
- **Règle pour tout futur « reveal au scroll »** : le contenu doit être visible sans JS
  et sans scroll-event — si un état initial masqué est utilisé, prévoir un **backstop**
  (rendu forcé ≤5s et fallback no-JS). Ne jamais laisser une section invisible parce
  qu'un observer n'a pas tiré.
- Focus clavier : `:focus-visible` = outline 2px `#2451B8`, offset 2px — sur TOUS les
  éléments interactifs (déjà global dans `style.css`).

## 8. Freemium & monétisation (UI)

- **Voile ~10/90** : les modules montrent la section 1 puis voilent le reste (cours,
  exemples, exos) avec CTA « Je débloque les 90 % » / « Je débloque tout → » vers
  `formations.html`. Limite **3 générations d'exercices gratuits/jour** par module
  (compteur localStorage `bos_mod_free_*`), encart bleu-violet de dépassement.
- **Accès payant** : flags `fp_access` / `ft_access` (session + localStorage) posés par
  `merci-formation-*.html` ; clé propriétaire vérifiée par **double hash FNV-1a+DJB2**
  (`isOwnerKey()`) — la clé en clair ne doit JAMAIS apparaître dans un source.
- **Prix** : montant en Sora 900 bleu, détail en muted. Pré-commande = « 59 € · puis
  119 € à l'ouverture (septembre 2026) » — le futur prix est daté et réel.
  Événements Umami sur les CTA (`data-umami-event`).

## 9. Scripts à NE JAMAIS CASSER

| Fichier | Rôle | Points fragiles |
|---|---|---|
| `revise-maths/bos-stripe.js` | Checkout Stripe via API VPS `api.tonargentexplique.fr` | mapping `DIGITAL` (prix serveur), `data-bos-product-id`, `returnPath` |
| `revise-maths/bos-paypal.js` | Checkout PayPal 0-backend (`fredsoule976`) | token eager anti-vol, `data-bos-no-token` (pré-commandes), `window._bosMerciPage` |
| `bos-retractation.js` (racine) | Rétractation légale | doit rester chargé sur toute page de vente |
| `revise-maths/bos-nav-shrink.js` | Header cache/hamburger | s'appuie sur `header > .header-inner > .nav-yt` |
| `revise-maths/bos-sticky-cta.js` | Barre d'achat mobile | détecte les boutons par sélecteurs (`[data-bos-key]`, `bosBuyNow`, texte) — ne pas renommer les boutons d'achat |
| `revise-maths/formation-devices.js` | « Mes appareils » (max 2, modèle Netflix) | API `formation-devices` |

Ne pas renommer/supprimer les attributs `data-bos-product-id`, `data-bos-no-token`,
`data-bos-key`, ni les pages `merci*.html`. Toute modification d'un tunnel de paiement
se re-teste en E2E comme un client (Playwright), pas au grep.

## 10. INTERDITS (bloquants — aucune exception)

1. ⛔ **Jamais de compte à rebours ni de fausse urgence** (chrono « expire dans X min »
   sur une offre qui n'expire pas = pratique trompeuse, art. L121-2 DGCCRF).
2. ⛔ **Jamais de faux prix barré** : pas de « ancien prix » jamais pratiqué. Seule
   comparaison tolérée : le **futur prix réel et daté** d'une pré-commande
   (« 59 € · puis 119 € à l'ouverture »).
3. ⛔ **Jamais de lien `github.io` brut en public** — uniquement `mathsavecfred.fr`
   (et les autres domaines possédés pour les produits croisés).
4. ⛔ **Contraste AA minimum** sur tout texte (rappels connus : texte **navy `#173A8C`**
   sur fond ambre, jamais blanc en petit texte ; couleurs `tool-band` déjà vérifiées).
5. ⛔ **Jamais de texte français sans accents** ni de féminin pour Fred ; statut =
   « professeur de maths pour lycéen(ne)s et collégien(ne)s », JAMAIS « prof de lycée ».
6. ⛔ **Ne jamais casser** `bos-stripe.js` / `bos-paypal.js` / `data-bos-key` /
   `data-bos-product-id` / gates `fp_access`-`ft_access` (voir §9).
7. ⛔ **Jamais de chiffre de preuve inventé** (avis, compteurs, effectifs) — tout chiffre
   affiché doit être vérifiable dans le repo ou les faits.
8. ⛔ **Jamais la clé propriétaire en clair** dans un source (hash uniquement).
9. ⛔ Pas d'images lourdes pour les motifs décoratifs : filigranes = CSS/SVG inline
   (grille de points, symboles) ; photos = locales (`img/deco/`), `loading="lazy"`,
   `width`/`height` posés.
10. ⛔ Pas de contenu pédagogique affirmé sans le programme officiel
    (`Output/Programme_Officiel_2026/` côté BOS) — rubrique, pas comptage de mots.

## 11. Checklist avant commit (résumé)

- [ ] Rendu vérifié en VRAI (Playwright/navigateur, pas un grep) — desktop ET 360px.
- [ ] `prefers-reduced-motion` respecté par toute nouvelle animation.
- [ ] Aucun débordement horizontal (pièges connus : `100vw` inclut la scrollbar →
      utiliser `width:100%` ; KaTeX larges → conteneur `overflow-x:auto` ;
      `minmax(0,1fr)` + `min-width:0` dans les grilles).
- [ ] Tunnel de paiement re-testé si une page de vente a bougé.
- [ ] Palette/typos = tokens de ce fichier (pas de nouvel hex sauvage).
- [ ] Cache-buster de `style.css` (`?v=YYYYMMDDx`) incrémenté si le CSS a changé.
