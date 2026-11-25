/* Direction G — the one bag. Every page that adds to the bag or shows its count loads this file
   (after ../shared/catalog*.js, before browse-core.js / g.js / planner.js / setups.js / shop.js).
   Saved in localStorage['i9g-bag'] as { "<listing id>": qty }, ids are keys of window.I9.P. Every storage call is in
   try/catch: in a private window or with storage blocked the bag lives in memory for the page and nothing breaks.
   Writers: home (g.js: add, chain "add all five"), product page (g.js, with its qty), planner ("Add priced lines" and
   per-line Add), setups ("Add the whole setup", per-line), shop tiles, Everyday (everyday.js: product-simple with its
   add-ons, shelf tiles). Readers: every header #bag-ct, the drawer, checkout. */
(function () {
  const I9 = window.I9; if (!I9) return;
  const { P, usd } = I9;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KEY = 'i9g-bag';
  const clean = o => { const b = {}; if (o && typeof o === 'object') Object.keys(o).forEach(id => { const q = Math.floor(+o[id]); if (q > 0) b[id] = q; }); return b; };
  const read = () => { try { return clean(JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return {}; } };
  let mem = read();
  const subs = [];
  const write = b => { mem = clean(b); try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} subs.forEach(f => { try { f(); } catch (e) {} }); };
  /* lines whose listing is loaded on this page (a page that lacks catalog-browse.js still counts every saved piece) */
  const lines = () => Object.keys(mem).map(id => ({ id, q: mem[id], p: P[id] || null }));
  const count = () => Object.values(mem).reduce((a, n) => a + n, 0);
  const total = () => lines().reduce((a, l) => a + (l.p ? l.p.usd * l.q : 0), 0);
  const reduce = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };

  function paint(flash) {
    const n = count();
    document.querySelectorAll('#bag-ct, [data-bagn]').forEach(el => { el.textContent = n; if (el.id === 'bag-ct') el.classList.toggle('on', n > 0); });
    const el = $('#bag-ct');
    if (flash && el && el.animate && !reduce())
      el.animate([{ transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
  function say(msg) { const l = $('#live'); if (l) { l.textContent = ''; setTimeout(() => { l.textContent = msg; }, 30); } }
  let toastT;
  function toast(msg, sub) {
    let t = $('#bx-toast');
    if (!t) { t = document.createElement('div'); t.id = 'bx-toast'; t.className = 'bx-toast'; t.setAttribute('aria-hidden', 'true'); document.body.appendChild(t); }
    t.innerHTML = `<span class="tally"></span><b>${esc(msg)}</b>${sub ? `<span class="meta-s">${esc(sub)}</span>` : ''}<a href="checkout.html">Bag <svg class="ic" aria-hidden="true"><use href="#ic-arrow-right"/></svg></a>`;
    t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3200);
  }

  const bag = {
    /* lines: [{ id, q }]. label: what the toast and the live region say. opt.quiet: no toast (the page shows its own state). */
    add(list, label, opt = {}) {
      const b = { ...mem }; let n = 0, sum = 0;
      list.forEach(({ id, q }) => { q = Math.floor(+q || 1); if (!P[id] || q < 1) return; b[id] = (b[id] || 0) + q; n += q; sum += P[id].usd * q; });
      if (!n) return 0;
      write(b); paint(true);
      const msg = label || (n === 1 ? 'Added to bag' : `Added ${n} pieces to bag`);
      say(`${msg}. ${usd(sum)}. Bag has ${count()} pieces.`);
      if (!opt.quiet) toast(msg, usd(sum));
      return n;
    },
    set(id, q) { const b = { ...mem }; q = Math.floor(+q || 0); if (q > 0) b[id] = q; else delete b[id]; write(b); paint(); },
    remove(id) { bag.set(id, 0); },
    clear() { write({}); paint(); },
    lines, count, total, paint, say,
    onChange(f) { subs.push(f); },
    KEY,
  };
  window.I9BAG = bag;
  /* Everyday listings (Camp Snap colours, etc.) live in ../shared/catalog-everyday.js. A page that does not load it
     (setups, planner, product) can still hold those lines in the saved bag: load the file once, from the same folder as
     catalog.js, then repaint, so names and totals resolve everywhere. Pages that already load it are untouched. */
  if (!I9.EVERYDAY && !document.querySelector('script[src*="catalog-everyday.js"]')) {
    const c = document.querySelector('script[src*="catalog.js"]');
    if (c) { const s = document.createElement('script'); s.src = c.getAttribute('src').replace(/catalog\.js(\?.*)?$/, 'catalog-everyday.js');
      s.onload = () => { paint(); subs.forEach(f => { try { f(); } catch (e) {} }); }; document.head.appendChild(s); }
  }
  /* Direction H — "My plan": the Pro project list (was G's per-page quote counter). Saved in localStorage['i9g-plan'] as
     { id: qty }, same rules as the bag. Pro's "Add to my plan" / "Quote" buttons write it; every header #quote-ct reads it;
     pro.html#quote lists it. It is a list to send for a quote, not a second cart: nothing is priced or paid from it. */
  const PKEY = 'i9g-plan';
  const pread = () => { try { return clean(JSON.parse(localStorage.getItem(PKEY) || '{}')); } catch (e) { return {}; } };
  let pmem = pread(); const psubs = [];
  const ppaint = () => { const n = Object.values(pmem).reduce((a, x) => a + x, 0); document.querySelectorAll('#quote-ct').forEach(el => { el.textContent = n; el.classList.toggle('on', n > 0); }); };
  const plan = {
    add(list) { const b = { ...pmem }; let n = 0; list.forEach(({ id, q }) => { q = Math.floor(+q || 1); if (!P[id] || q < 1) return; b[id] = (b[id] || 0) + q; n += q; });
      if (!n) return 0; pmem = clean(b); try { localStorage.setItem(PKEY, JSON.stringify(pmem)); } catch (e) {} ppaint(); psubs.forEach(f => { try { f(); } catch (e) {} }); return n; },
    lines: () => Object.keys(pmem).map(id => ({ id, q: pmem[id], p: P[id] || null })),
    count: () => Object.values(pmem).reduce((a, x) => a + x, 0),
    clear() { pmem = {}; try { localStorage.setItem(PKEY, '{}'); } catch (e) {} ppaint(); psubs.forEach(f => { try { f(); } catch (e) {} }); },
    onChange(f) { psubs.push(f); }, paint: ppaint, KEY: PKEY,
  };
  window.I9MYPLAN = plan;   /* not I9PLAN: that name is the planner data (shared/planner-data.js) */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ppaint); else ppaint();
  window.addEventListener('storage', e => { if (e.key === PKEY) { pmem = pread(); ppaint(); psubs.forEach(f => { try { f(); } catch (x) {} }); } });
  window.addEventListener('storage', e => { if (e.key === KEY) { mem = read(); paint(); subs.forEach(f => { try { f(); } catch (x) {} }); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => paint()); else paint();
})();
