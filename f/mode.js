/* Direction H — one store, two modes: "Store" (consumer, the default) and "Pro".
   Load in <head>, before the body paints, on every page: it sets <html data-mode="store|pro"> so the page never flashes
   the wrong ground. One catalogue, one bag (bag.js, 'i9g-bag'), one checkout, one search; only the home, the mega menu,
   the product page emphasis and the header accent change with the mode.

   Which mode a page opens in, first rule that applies:
     1. Pro-only surfaces (pro.html, planner.html, setups.html) are always Pro. Their "Store" segment goes to index.html.
     2. ?mode=store|pro in the URL wins, and is saved.
     3. A solution link (shop.html?solution=…) switches to Pro.
     4. The saved choice, localStorage 'i9g-mode' (try/catch: storage blocked = this page only).
     5. Store.
   The Store home is index.html, the Pro home is pro.html. index.html opened in Pro mode (saved, no ?mode=) goes to
   pro.html, so "the home" is the home of your mode; the old Pro home anchors (index.html#for-…, #solutions, #chain,
   #quote) also go to pro.html. There is never a "who are you?" gate.

   The header: a "Store | Pro" segmented control after the logo (links, so it works without this script's click
   handler) and a search field (Store: words; Pro: model, SKU or part number). On shared pages (product, shop,
   everyday, checkout) a click switches in place: no reload, the mega menu is rebuilt (nav-mega.js listens to
   'i9:mode'), the URL keeps ?mode= via replaceState. On the two homes and the Pro-only pages it navigates. */
(function () {
  const KEY = 'i9g-mode', MODES = ['store', 'pro'];
  const root = document.documentElement;
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const qs = new URLSearchParams(location.search);
  const PRO_ONLY = ['pro.html', 'planner.html', 'setups.html'];
  const read = () => { try { const v = localStorage.getItem(KEY); return MODES.includes(v) ? v : null; } catch (e) { return null; } };
  const save = m => { try { localStorage.setItem(KEY, m); } catch (e) {} };

  /* the Pro home moved to pro.html: keep its old anchors working */
  if (page === 'index.html' && /^#(for-\w+|solutions|chain|quote)$/.test(location.hash)) {
    save('pro'); location.replace('pro.html' + location.hash); return;
  }
  const urlMode = MODES.includes(qs.get('mode')) ? qs.get('mode') : null;
  const proOnly = PRO_ONLY.includes(page);
  const proEntry = page === 'shop.html' && qs.has('solution');
  let mode, why;
  if (proOnly) { mode = 'pro'; why = 'pro-surface'; }
  else if (urlMode) { mode = urlMode; why = 'url'; }
  else if (proEntry) { mode = 'pro'; why = 'pro-entry'; }
  else { const s = read(); mode = s || 'store'; why = s ? 'saved' : 'default'; }
  save(mode);
  if (page === 'index.html' && mode === 'pro') { location.replace('pro.html'); return; }
  root.dataset.mode = mode;

  const subs = [];
  const homeOf = m => m === 'pro' ? 'pro.html' : 'index.html';
  /* where each segment goes from this page */
  function hrefFor(m) {
    if (m === 'store' && (proOnly || page === 'index.html')) return 'index.html?mode=store';
    if (m === 'pro' && page === 'index.html') return 'pro.html';
    if (m === 'pro' && proOnly) return page + location.search + location.hash;
    const u = new URLSearchParams(location.search); u.set('mode', m);
    return page + '?' + u.toString() + location.hash;
  }
  const inPlace = () => !proOnly && page !== 'index.html';

  function paint() {
    document.querySelectorAll('[data-modesw] a').forEach(a => {
      const on = a.dataset.mode === mode; a.setAttribute('aria-current', on ? 'true' : 'false'); a.href = hrefFor(a.dataset.mode);
    });
    document.querySelectorAll('.hsearch input[name="q"]').forEach(i => {
      i.placeholder = mode === 'pro' ? 'Model, SKU or part number' : 'Search cameras, mics, lights, brands';
      i.setAttribute('aria-label', mode === 'pro' ? 'Search by model, SKU or part number' : 'Search the store');
    });
    document.querySelectorAll('.gnav .logo').forEach(a => { a.href = homeOf(mode); a.setAttribute('aria-label', mode === 'pro' ? 'i9Store Pro home' : 'i9Store home'); });
    document.querySelectorAll('.gnav a[aria-label="Quote list"], .gnav a[aria-label="My plan"]').forEach(a => { a.setAttribute('aria-label', 'My plan'); });
  }
  function set(m, opt = {}) {
    if (!MODES.includes(m) || m === mode) return;
    mode = m; why = opt.why || 'toggle'; save(m); root.dataset.mode = m;
    if (inPlace()) { try { const u = new URL(location.href); u.searchParams.set('mode', m); history.replaceState(history.state, '', u.pathname.split('/').pop() + u.search + u.hash); } catch (e) {} }
    paint();
    const live = document.getElementById('live'); if (live) live.textContent = (m === 'pro' ? 'Pro mode: solutions, setups, the room planner and quotes.' : 'Store mode: departments, brands and gifts.');
    subs.forEach(f => { try { f(m); } catch (e) {} });
    try { document.dispatchEvent(new CustomEvent('i9:mode', { detail: { mode: m } })); } catch (e) {}
  }

  /* ---------- header: the segmented control + the search field ---------- */
  const SW = () => `<div class="modesw" data-modesw role="group" aria-label="Shopping mode">
      <a data-mode="store" href="${hrefFor('store')}"><i aria-hidden="true"></i>Store</a><a data-mode="pro" href="${hrefFor('pro')}"><i aria-hidden="true"></i>Pro</a></div>`;
  const SEARCH = () => `<form class="hsearch" action="shop.html" method="get" role="search">
      <input type="search" name="q" autocomplete="off" enterkeyhint="search"><button type="submit" aria-label="Search"><svg class="ic" aria-hidden="true"><use href="#ic-magnifying-glass"/></svg></button></form>`;
  function decorate() {
    const nav = document.querySelector('header.gnav'); if (!nav) return;
    const isCo = nav.classList.contains('co-nav');
    const logo = nav.querySelector('.logo');
    if (logo && !isCo && !nav.querySelector('[data-modesw]')) logo.insertAdjacentHTML('afterend', SW());
    const right = nav.querySelector('.right');
    if (right && !isCo && !right.querySelector('.hsearch')) right.insertAdjacentHTML('afterbegin', SEARCH());
    /* phones and iPad portrait: the search is its own row under the header (Store mode, not on the Store home, which has one) */
    if (!isCo && page !== 'index.html' && !document.querySelector('.msearch')) nav.insertAdjacentHTML('afterend', `<div class="msearch"><div class="wrap">${SEARCH()}</div></div>`);
    paint();
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-modesw] a'); if (!a) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      if (a.dataset.mode === mode && page === homeOf(mode)) { e.preventDefault(); return; }   /* already here */
      if (!inPlace()) { save(a.dataset.mode); return; }   /* navigates (href) */
      e.preventDefault(); set(a.dataset.mode);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate); else decorate();
  window.addEventListener('storage', e => { if (e.key === KEY && MODES.includes(e.newValue) && inPlace()) set(e.newValue, { why: 'other-tab' }); });

  window.I9MODE = {
    get mode() { return mode; }, get why() { return why; }, KEY, set, paint, home: () => homeOf(mode), proOnly,
    on(f) { subs.push(f); },
  };
})();
