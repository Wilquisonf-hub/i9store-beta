/* Direction H — the mega menu has two sets of tabs, one per mode (mode.js, <html data-mode>):
     Store: Departments · Brands · Gifts & Everyday · Help
     Pro:   Solutions · Categories · Brands · Setups · Plan your room   (direction G's set, minus Everyday, which is Store's)
   Switching mode on a shared page rebuilds the bar, the panels and the drawer ('i9:mode'); everything below is G's.
   Direction G — mega menu. Needs ../shared/icons.js, catalog*.js, browse-core.js. Drop-in for the .gnav header:
   put <nav class="mega-bar" data-mega aria-label="Shop"></nav> where the department links were, keep the header's
   .menu-btn. Desktop (>= 1100): six disclosure tabs (the sixth, Everyday, is the simple-products line), each opening a full-width panel. Keyboard: Left/Right move
   between tabs, Down/Enter/Space open and enter a panel, arrows move inside it, Home/End, Esc closes and returns focus
   to the tab; focus leaving the header closes it. Hover opens on fine pointers only; touch (iPad landscape) taps
   toggle and a tap outside closes. Below 1100 the .menu-btn opens a drawer (side sheet on tablet, full screen on
   phone) that drills down one level at a time; focus is trapped inside, Esc closes and focus returns to the button. */
(function () {
  const I9 = window.I9, X = window.I9S; if (!I9 || !X) return;
  const { P, usd } = I9, { SOL, ORDER, SETUPS, esc, icon, SH } = X;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const bar = $('[data-mega]'); if (!bar) return;
  const header = bar.closest('header') || document.body;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const desk = matchMedia('(min-width: 1100px)');
  const caret = `<svg class="ic" aria-hidden="true"><use href="#ic-caret-down"/></svg>`;

  /* ---------- counts from the browse catalogue ---------- */
  const ALL = (I9.BROWSE || Object.keys(P)).filter(id => P[id] && P[id].usd > 0);
  const DEPTS = (I9.DEPTS || []).map(d => {
    const ids = ALL.filter(id => P[id].dept === d.name);
    return { ...d, n: ids.length, subs: d.subs.map(s => ({ ...s, n: ids.filter(id => P[id].subcat === s.name).length })).filter(s => s.n) };
  }).filter(d => d.n);
  const brandN = {}; ALL.forEach(id => { const b = P[id].brand; brandN[b] = (brandN[b] || 0) + 1; });
  const BRANDS = Object.keys(brandN).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  const TOP = Object.keys(brandN).sort((a, b) => brandN[b] - brandN[a] || a.localeCompare(b)).slice(0, 18).sort((a, b) => a.localeCompare(b));
  const letter = b => { const c = b[0].toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; };
  const LETTERS = [...new Set(BRANDS.map(letter))];
  /* the packshot that heads each department: a recognisable listing on white */
  const HEAD = { Cameras:'ue80', Lenses:'rf45', Lighting:'ls600d', Audio:'sm7b', Studio:'fps170', Monitoring:'sumo19se', Supports:'focus12', Accessories:'hypercore150-v' };
  const headImg = d => { const id = (HEAD[d.name] && P[HEAD[d.name]]) ? HEAD[d.name] : ALL.find(i => P[i].dept === d.name && P[i].white !== 0); return id ? P[id].src : ''; };
  const shop = q => 'shop.html' + (q ? '?' + q : '');
  const enc = encodeURIComponent;
  const solComp = (s, cls = 'comp') => `<span class="${cls}">${s.comp.map(id => `<span><img src="${P[id].src}" alt="" loading="lazy"></span>`).join('')}</span>`;
  const FEATURED = ['church-3ptz', 'podcast-2cam', 'broadcast-studio', 'creator-desk'];
  const here = location.pathname.split('/').pop();

  /* ---------- panel content (every panel; each mode shows its own set) ---------- */
  const PANELS = [
    { id:'solutions', label:'Solutions', html: () => `
      <div class="mg-head"><p class="meta"><span class="tally"></span>Shop by kind of room · 9 solutions</p><a class="mg-all" href="setups.html">See a complete setup for each ${icon('arrow-right')}</a></div>
      <div class="mg-sol">${ORDER.map((k, i) => { const s = SOL[k], n = X.setupsFor(k).length;
        const scr = s.comp ? `<span class="mg-scr lit">${solComp(s)}</span>` : `<span class="mg-scr"><img src="${SH + s.photo}" alt="" loading="lazy" style="--pos:${s.pos}"></span>`;
        return `<a class="mg-win" href="${shop('solution=' + k)}">${scr}<span class="mg-osd" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <span class="mg-umd"><b>${esc(s.label)}</b><span>${esc(s.who)}</span><span class="meta-s">${n} setup${n === 1 ? '' : 's'} · shop the room</span></span></a>`; }).join('')}
        <a class="mg-spec" href="#"><span class="meta-s">10 · WhatsApp</span><b>Not sure which room you are? Ask a specialist.</b>${icon('whatsapp-logo')}</a>
      </div>` },
    { id:'categories', label:'Categories', html: () => `
      <div class="mg-head"><p class="meta"><span class="tally"></span>${DEPTS.length} departments · ${ALL.length} live listings</p><a class="mg-all" href="${shop('view=categories')}">All categories ${icon('arrow-right')}</a></div>
      <div class="mg-cats">${DEPTS.map(d => `<div class="mg-cat">
        <a class="mg-cath" href="${shop('category=' + d.slug)}"><span class="pk"><img src="${headImg(d)}" alt="" loading="lazy"></span><span><b>${esc(d.name)}</b><span class="meta-s">${d.n} listings</span></span></a>
        <ul class="mg-subs">${d.subs.map(s => `<li><a href="${shop('category=' + d.slug + '&sub=' + s.slug)}">${esc(s.name)}<span class="n">${s.n}</span></a></li>`).join('')}</ul></div>`).join('')}
      </div>` },
    { id:'brands', label:'Brands', html: () => `
      <div class="mg-head"><p class="meta"><span class="tally"></span>${BRANDS.length} brands in this catalogue</p><a class="mg-all" href="${shop('view=brands')}">All brands, A–Z ${icon('arrow-right')}</a></div>
      <div class="mg-brands">
        <ul class="mg-ledger">${TOP.map(b => `<li><a href="${shop('brand=' + enc(b))}">${esc(b)}<span class="n">${brandN[b]}</span></a></li>`).join('')}</ul>
        <div><p class="mg-note">Jump to a letter in the brand index.</p>
          <div class="mg-az">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => LETTERS.includes(c) ? `<a href="${shop('view=brands')}#brand-${c}" aria-label="Brands starting with ${c}">${c}</a>` : `<span aria-hidden="true">${c}</span>`).join('')}</div>
          <p class="mg-note">The most-listed brands are on the left, with how many live listings each has here.</p></div>
      </div>` },
    { id:'setups', label:'Setups', html: () => `
      <div class="mg-head"><p class="meta"><span class="tally"></span>Shop the whole room · ${SETUPS.length} setups</p><a class="mg-all" href="setups.html">All setups ${icon('arrow-right')}</a></div>
      <div class="mg-setups">${FEATURED.map(id => { const s = X.SET[id];
        return `<a class="mg-kit" href="setups.html#${s.id}"><span class="kit" data-kit="${s.id}"></span>
          <span class="mg-umd"><b>${esc(s.title)}</b><span class="meta-s">${s.pieces} pieces · ${usd(s.total)}</span></span></a>`; }).join('')}
        <ul class="mg-list">${SETUPS.map(s => `<li><a href="setups.html#${s.id}"><span class="meta-s">${String(s.n).padStart(2, '0')}</span><b>${esc(s.title)}</b><span>${esc(SOL[s.sol].short)} · ${usd(s.total)}</span></a></li>`).join('')}</ul>
      </div>` },
    { id:'plan', label:'Plan your room', html: () => `
      <div class="mg-plan">
        <div><p class="meta" style="color:var(--ink-3);display:flex;gap:10px;align-items:center;margin:0 0 16px"><span class="tally"></span>Room planner</p>
          <h3>Lay out your room before you buy.</h3>
          <p>Start from one of our setups or from an empty room. Every piece in the planner is a live listing, and the list goes to your bag or to a specialist for a quote.</p>
          <a class="btn sig" href="planner.html">Open the room planner</a>
          <a class="mg-led" href="led.html" style="display:grid;gap:4px;margin-top:28px;padding-top:18px;border-top:1px solid var(--rule);text-decoration:none;color:var(--ink)"><span class="meta" style="display:flex;gap:10px;align-items:center;color:var(--ink-3)"><span class="tally"></span>LED walls · built to order</span><b style="font-size:18px;font-weight:600;letter-spacing:-.01em">Configure an LED wall ${icon('arrow-right')}</b><span style="color:var(--ink-2);font-size:14px">Pitch, cabinets, processors and a 3D view, quoted with the factory.</span></a></div>
        <div><p class="meta" style="color:var(--ink-3);margin:0 0 10px">Start from a setup</p>
          <ul class="mg-tpl">${SETUPS.map(s => `<li><a href="planner.html?template=${s.id}"><b>${esc(s.title)}</b><span class="meta-s">${s.pieces} pcs</span></a></li>`).join('')}</ul></div>
      </div>` },
    /* Line 02 · Everyday (everyday.html, product-simple.html). Data: I9.EVERYDAY from ../shared/catalog-everyday.js,
       which bag.js loads on pages that do not include it; the panel fills when it is first opened. */
    { id:'everyday', label:'Everyday', html: () => { const E = I9.EVERYDAY;
      if (!E) return `<div class="mg-head"><p class="meta"><span class="tally"></span>Line 02 · Everyday</p><a class="mg-all" href="everyday.html">Gifts and first kits ${icon('arrow-right')}</a></div>`;
      return `
      <div class="mg-head"><p class="meta"><span class="tally"></span>Line 02 · Everyday · gifts and first kits, most under $300</p><a class="mg-all" href="everyday.html">All of Everyday ${icon('arrow-right')}</a></div>
      <div class="mg-ev">
        <ul class="mg-occ">${E.SHELVES.map(s => `<li><a href="everyday.html#${s.id}"><span class="meta-s">${s.n}</span><b>${esc(s.label)}</b><span>${esc(s.line)}</span></a></li>`).join('')}</ul>
        <div class="mg-evcs"><p class="meta" style="color:var(--ink-3);margin:0 0 12px">Camp Snap · pick a model, then a colour</p>
          <div class="mg-evg">${E.FAMILY.campsnap.map(k => { const m = E.PROD[k], d = P[m.def];
            return `<a class="mg-evc" href="product-simple.html?id=${m.def}"><span class="pk${d.white === 0 ? ' nw' : ''}"><img src="${d.thumb || d.src}" alt="" loading="lazy"></span>
              <span class="mg-umd"><b>${esc(m.short)}</b><span class="meta-s">${esc(m.does)} · ${m.variants.length > 1 ? 'from ' : ''}${usd(E.minPrice(m))}</span></span></a>`; }).join('')}</div></div>
      </div>`; } },
    /* ---------- Store mode panels (direction H) ---------- */
    { id:'departments', label:'Departments', html: () => { const E = I9.EVERYDAY;
      return `
      <div class="mg-head"><p class="meta"><span class="tally"></span>Shop by department · ${DEPTS.length} departments · ${ALL.length} live listings</p><a class="mg-all" href="${shop('view=categories')}">All departments ${icon('arrow-right')}</a></div>
      <div class="mg-deps">${DEPTS.map(d => `<div class="mg-dep">
        <a class="mg-deph" href="${shop('category=' + d.slug)}"><span class="pk"><img src="${headImg(d)}" alt="" loading="lazy"></span><b>${esc(d.name)}</b><span class="meta-s">${d.n} listings</span></a>
        <ul>${d.subs.slice().sort((a, b) => b.n - a.n).slice(0, 3).map(x => `<li><a href="${shop('category=' + d.slug + '&sub=' + x.slug)}">${esc(x.name)}</a></li>`).join('')}</ul></div>`).join('')}
      </div>
      <div class="mg-need"><p class="meta">Shop by need</p>
        <ul>${E ? E.SHELVES.map(x => `<li><a href="everyday.html#${x.id}">${esc(x.label)}</a></li>`).join('') : ''}<li><a href="${shop('price=u250')}">Under $250</a></li></ul></div>`; } },
    { id:'help', label:'Help', html: () => `
      <div class="mg-head"><p class="meta"><span class="tally"></span>How buying here works</p><a class="mg-all" href="#">Talk to a specialist ${icon('arrow-right')}</a></div>
      <div class="mg-help">
        <dl class="mg-facts">
          <div><dt class="meta">Ships from</dt><dd><b>Miami, Florida.</b> I9Store USA LLC, 20815 NE 16th Ave, Miami, FL 33179.</dd></div>
          <div><dt class="meta">Price</dt><dd><b>In USD, before sales tax and shipping.</b> Both are calculated at checkout. Tax-exempt? Resellers and religious institutions send their certificate there.</dd></div>
          <div><dt class="meta">Installments</dt><dd><b>Installment plans are available through our support team.</b> Ask on WhatsApp before you pay.</dd></div>
          <div><dt class="meta">A person</dt><dd><b>WhatsApp a specialist</b>, or call <a href="tel:+13053334374">+1 (305) 333-4374</a>. <a href="mailto:contato@i9tv.com.br">contato@i9tv.com.br</a></dd></div>
        </dl>
        <a class="mg-topro" href="pro.html" data-pro-door><span class="meta"><span class="tally"></span>i9Store Pro</span><b>Buying for a church, a studio or a station?</b><span>Solutions, complete setups, the room planner and quotes for a PO. Same bag, same checkout.</span><span class="go">Switch to Pro ${icon('arrow-right')}</span></a>
      </div>` },
  ];
  const SETS = { store: ['departments', 'brands', 'everyday', 'help'], pro: ['solutions', 'categories', 'brands', 'setups', 'plan'] };
  const LABEL = { everyday: 'Gifts & Everyday' };
  const modeNow = () => (window.I9MODE && I9MODE.mode) || document.documentElement.dataset.mode || 'pro';
  let TABS = [];


  /* ---------- desktop bar + panels (rebuilt when the mode changes) ---------- */
  let tabs = [], panels = null, open = null, scrim = null, hoverT = null, builtFor = '';
  function mount() {
    const m = modeNow(); if (m === builtFor) return; builtFor = m;
    if (open) hide(false);
    TABS = SETS[m].map(id => { const t = PANELS.find(x => x.id === id); return { ...t, label: LABEL[id] && m === 'store' ? LABEL[id] : t.label }; });
    bar.dataset.set = m;
    bar.innerHTML = TABS.map(t => `<button type="button" class="mg-tab" id="mg-t-${t.id}" aria-expanded="false" aria-controls="mg-p-${t.id}">${esc(t.label)}${caret}</button>`).join('');
    if (panels) panels.remove();
    panels = document.createElement('div'); panels.className = 'mg-panels';
    panels.innerHTML = TABS.map(t => `<div class="mg-panel" id="mg-p-${t.id}" role="region" aria-labelledby="mg-t-${t.id}" hidden><div class="wrap"></div></div>`).join('');
    header.appendChild(panels);
    tabs = $$('.mg-tab', bar);
    /* the page we're on marks its tab */
    const qp = new URLSearchParams(location.search);
    let cur = here === 'everyday.html' || here === 'product-simple.html' ? 'everyday' : here === 'setups.html' ? 'setups' : here === 'planner.html' || here === 'led.html' ? 'plan' : here === 'shop.html' ? (qp.get('solution') ? 'solutions' : qp.get('brand') || qp.get('view') === 'brands' ? 'brands' : (m === 'store' ? 'departments' : 'categories')) : '';
    if (cur && $('#mg-t-' + cur)) $('#mg-t-' + cur).setAttribute('aria-current', 'page');
    tabs.forEach(wire);
    panels.addEventListener('keydown', panelKeys);
  }

  const panelOf = t => $('#' + t.getAttribute('aria-controls'));
  const focusables = el => $$('a[href],button:not([disabled])', el).filter(x => x.offsetParent !== null);
  function fill(t) {
    const p = panelOf(t), w = $('.wrap', p);
    if (!w.dataset.done) {
      w.innerHTML = TABS.find(x => 'mg-t-' + x.id === t.id).html(); w.dataset.done = 1;
      $$('[data-kit]', w).forEach(k => X.mountKit(k, X.SET[k.dataset.kit], { lazy: true, copies: false, padX: 6, padT: 8, padB: 8 }));
    }
  }
  function show(t, focusFirst) {
    if (open === t) { if (focusFirst) focusables(panelOf(t))[0]?.focus(); return; }
    if (open) hide(false);
    fill(t); open = t; t.setAttribute('aria-expanded', 'true'); panelOf(t).hidden = false;
    if (!scrim) { scrim = document.createElement('div'); scrim.className = 'mg-scrim'; scrim.addEventListener('click', () => hide(false)); document.body.appendChild(scrim); }
    if (focusFirst) requestAnimationFrame(() => focusables(panelOf(t))[0]?.focus());
  }
  function hide(returnFocus) {
    if (!open) return; const t = open; open = null;
    t.setAttribute('aria-expanded', 'false'); panelOf(t).hidden = true;
    if (scrim) { scrim.remove(); scrim = null; }
    if (returnFocus) t.focus();
  }
  function wire(t, i) {
    t.addEventListener('click', () => { open === t ? hide(false) : show(t, false); });
    t.addEventListener('keydown', e => {
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); const n = tabs[(i + (k === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); if (open) show(n, false); }
      else if (k === 'Home' || k === 'End') { e.preventDefault(); (k === 'Home' ? tabs[0] : tabs[tabs.length - 1]).focus(); }
      else if (k === 'ArrowDown' || ((k === 'Enter' || k === ' ') && open !== t)) { e.preventDefault(); show(t, true); }
      else if (k === 'Escape') { hide(true); }
    });
    t.addEventListener('pointerenter', e => { if (!fine.matches || e.pointerType !== 'mouse') return; clearTimeout(hoverT); hoverT = setTimeout(() => show(t, false), open ? 0 : 140); });
  }
  function panelKeys(e) {
    if (!open) return; const k = e.key, f = focusables(panelOf(open)), i = f.indexOf(document.activeElement);
    if (k === 'Escape') { e.preventDefault(); hide(true); return; }
    let n = null;
    if (k === 'ArrowDown' || k === 'ArrowRight') n = f[(i + 1) % f.length];
    else if (k === 'ArrowUp' || k === 'ArrowLeft') n = i <= 0 ? null : f[i - 1];
    else if (k === 'Home') n = f[0]; else if (k === 'End') n = f[f.length - 1];
    else return;
    e.preventDefault();
    if (n) n.focus(); else open.focus();   /* up from the first link goes back to the tab */
  }
  /* leaving with the mouse closes (fine pointers), leaving with focus closes, tapping outside closes */
  header.addEventListener('pointerleave', e => { if (!fine.matches || e.pointerType !== 'mouse') return; clearTimeout(hoverT); hoverT = setTimeout(() => hide(false), 260); });
  header.addEventListener('pointerenter', () => { if (open) clearTimeout(hoverT); });
  bar.addEventListener('pointerleave', () => { if (!open) clearTimeout(hoverT); });
  header.addEventListener('focusout', e => { if (open && !header.contains(e.relatedTarget)) hide(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) hide(true); });
  desk.addEventListener?.('change', () => hide(false));

  /* ---------- drawer (below 1100) ---------- */
  const btn = $('.menu-btn', header);
  let drawer = null, lastView = [];
  const rows = (items) => `<ul class="mg-rows">${items.join('')}</ul>`;
  const VIEWS = {
    root: () => `<h2 class="mg-vh sr">Menu</h2>
      <div class="modesw dsw" data-modesw role="group" aria-label="Shopping mode"><a data-mode="store" href="index.html?mode=store"><i aria-hidden="true"></i>Store</a><a data-mode="pro" href="pro.html"><i aria-hidden="true"></i>Pro</a></div>
      ${rows([
      ...TABS.map(t => `<li><button type="button" class="mg-row" data-go="${t.id}"><span class="grow"><span>${esc(t.label)}</span><small>${esc(({ solutions:'9 kinds of room, each with a setup', categories: DEPTS.length + ' departments, ' + ALL.length + ' listings', departments: DEPTS.length + ' departments, ' + ALL.length + ' listings', brands: BRANDS.length + ' brands, A–Z', setups: SETUPS.length + ' complete rooms with every piece', plan:'Lay out your room, start from a setup', everyday:'Gifts and first kits, two taps', help:'Shipping, installments, a person on WhatsApp' })[t.id])}</small></span>${caret}</button></li>`),
      `<li><a class="mg-row sm" href="checkout.html"><span class="grow"><span>Bag</span></span><span class="n">${X.bag.count()} pcs</span></a></li>`,
      modeNow() === 'pro' ? `<li><a class="mg-row sm" href="pro.html#quote"><span class="grow"><span>Request a quote</span></span></a></li>` : `<li><a class="mg-row sm" href="pro.html"><span class="grow"><span>i9Store Pro</span><small>Solutions, setups, the room planner and quotes</small></span></a></li>`])}`,
    solutions: () => `<h2 class="mg-vh">Solutions</h2>${rows(ORDER.map((k, i) => { const s = SOL[k];
      const th = s.comp ? `<span class="th lit"><img src="${P[s.comp[0]].src}" alt=""></span>` : `<span class="th"><img src="${SH + s.photo}" alt="" style="--pos:${s.pos}"></span>`;
      return `<li><a class="mg-row" href="${shop('solution=' + k)}">${th}<span class="grow"><span>${esc(s.label)}</span><small>${esc(s.who)}</small></span></a></li>`; }))}`,
    categories: () => `<h2 class="mg-vh">Categories</h2>${rows(DEPTS.map(d => `<li><button type="button" class="mg-row" data-go="dept:${d.slug}"><span class="pk"><img src="${headImg(d)}" alt=""></span><span class="grow"><span>${esc(d.name)}</span><small>${d.subs.length} kinds · ${d.n} listings</small></span>${caret}</button></li>`))}
      <p style="margin:18px 0 0"><a class="mg-all" href="${shop('view=categories')}">All categories ${icon('arrow-right')}</a></p>`,
    dept: slug => { const d = DEPTS.find(x => x.slug === slug); return `<h2 class="mg-vh">${esc(d.name)}</h2>${rows([
      `<li><a class="mg-row sm" href="${shop('category=' + d.slug)}"><span class="grow"><span>All ${esc(d.name.toLowerCase())}</span></span><span class="n">${d.n}</span></a></li>`,
      ...d.subs.map(s => `<li><a class="mg-row sm" href="${shop('category=' + d.slug + '&sub=' + s.slug)}"><span class="grow"><span>${esc(s.name)}</span></span><span class="n">${s.n}</span></a></li>`)])}`; },
    brands: () => `<h2 class="mg-vh">Brands</h2><p class="meta" style="color:var(--ink-3);margin:6px 0 0">Most listed</p>
      <div class="mg-chips">${TOP.slice(0, 10).map(b => `<a href="${shop('brand=' + enc(b))}">${esc(b)}<span class="n">${brandN[b]}</span></a>`).join('')}</div>
      ${LETTERS.map(L => `<h3 class="mg-letter">${L}</h3>${rows(BRANDS.filter(b => letter(b) === L).map(b => `<li><a class="mg-row sm" href="${shop('brand=' + enc(b))}"><span class="grow"><span>${esc(b)}</span></span><span class="n">${brandN[b]}</span></a></li>`))}`).join('')}`,
    setups: () => `<h2 class="mg-vh">Setups</h2>${rows(SETUPS.map(s => `<li><a class="mg-row" href="setups.html#${s.id}"><span class="th lit"><img src="${P[s.items.find(it => it.g === 'picture')?.id || s.items[0].id].src}" alt=""></span><span class="grow"><span>${esc(s.title)}</span><small>${esc(SOL[s.sol].short)} · ${s.pieces} pieces · ${usd(s.total)}</small></span></a></li>`))}
      <p style="margin:18px 0 0"><a class="mg-all" href="setups.html">All setups ${icon('arrow-right')}</a></p>`,
    everyday: () => { const E = I9.EVERYDAY; if (!E) return `<h2 class="mg-vh">Everyday</h2><a class="btn sig" href="everyday.html" style="width:100%">Gifts and first kits</a>`;
      return `<h2 class="mg-vh">Everyday</h2><p style="color:var(--ink-2);margin:0 0 8px">Gifts and first kits, most under $300. One-page checkout.</p>${rows([
      `<li><a class="mg-row sm" href="everyday.html"><span class="grow"><span>All of Everyday</span></span></a></li>`,
      ...E.SHELVES.map(s => `<li><a class="mg-row sm" href="everyday.html#${s.id}"><span class="grow"><span>${esc(s.label)}</span><small>${esc(s.line)}</small></span></a></li>`)])}
      <p class="meta" style="color:var(--ink-3);margin:24px 0 4px">Camp Snap</p>${rows(E.FAMILY.campsnap.map(k => { const m = E.PROD[k], d = P[m.def];
        return `<li><a class="mg-row" href="product-simple.html?id=${m.def}"><span class="th lit"><img src="${d.thumb || d.src}" alt=""></span><span class="grow"><span>${esc(m.short)}</span><small>${esc(m.does)} · ${m.variants.length > 1 ? m.variants.length + ' colours · from ' : ''}${usd(E.minPrice(m))}</small></span></a></li>`; }))}`; },
    departments: () => VIEWS.categories().replace('<h2 class="mg-vh">Categories</h2>', '<h2 class="mg-vh">Departments</h2>'),
    help: () => `<h2 class="mg-vh">Help</h2>${rows([
      `<li><div class="mg-row sm"><span class="grow"><span>Ships from Miami, Florida</span><small>Prices in USD; sales tax and shipping calculated at checkout</small></span></div></li>`,
      `<li><div class="mg-row sm"><span class="grow"><span>Installments</span><small>Plans available through our support team</small></span></div></li>`,
      `<li><a class="mg-row sm" href="tel:+13053334374"><span class="grow"><span>Call +1 (305) 333-4374</span><small>Or WhatsApp a specialist</small></span></a></li>`,
      `<li><a class="mg-row sm" href="pro.html"><span class="grow"><span>Buying for an organisation?</span><small>Switch to Pro: solutions, setups, quotes for a PO</small></span></a></li>`])}`,
    plan: () => `<h2 class="mg-vh">Plan your room</h2><p style="color:var(--ink-2);margin:0 0 16px">Start from a setup or an empty room. Every piece is a live listing.</p>
      <a class="btn sig" href="planner.html" style="width:100%">Open the room planner</a>
      <a class="btn" href="led.html" style="width:100%;margin-top:8px">Configure an LED wall</a>
      <p class="meta" style="color:var(--ink-3);margin:24px 0 4px">Start from a setup</p>${rows(SETUPS.map(s => `<li><a class="mg-row sm" href="planner.html?template=${s.id}"><span class="grow"><span>${esc(s.title)}</span></span><span class="n">${s.pieces} pcs</span></a></li>`))}`,
  };
  function build() {
    drawer = document.createElement('div'); drawer.className = 'mg-drawer'; drawer.hidden = true;
    drawer.innerHTML = `<div class="mg-dscrim" data-close></div>
      <div class="mg-sheet" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="mg-dtop"><a class="logo" href="${(window.I9MODE && I9MODE.home()) || 'index.html'}" aria-label="i9Store home"><img src="${SH}i9-seal.webp" alt=""><span><b>i9Store</b></span></a>
          <button type="button" class="ibtn" data-close aria-label="Close menu">${icon('x')}</button></div>
        <div class="mg-views"></div>
        <div class="mg-dfoot"><a href="#">${icon('whatsapp-logo')}Talk to a specialist</a><a href="checkout.html">${icon('bag')}Bag · <span data-bagn>${X.bag.count()}</span></a></div>
      </div>`;
    document.body.appendChild(drawer);
    drawer.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return closeDrawer();
      const go = e.target.closest('[data-go]'); if (go) return push(go.dataset.go);
      if (e.target.closest('[data-back]')) return pop();
      if (e.target.closest('a[href]')) closeDrawer(false);
    });
    drawer.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); return; }
      if (e.key === 'Tab') { const f = focusables($('.mg-sheet', drawer)); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && e.target.closest('.mg-view')) {
        const f = focusables(e.target.closest('.mg-view')), i = f.indexOf(document.activeElement);
        if (i > -1) { e.preventDefault(); f[Math.max(0, Math.min(f.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))].focus(); }
      }
    });
  }
  function render(key, dir) {
    const views = $('.mg-views', drawer), [name, arg] = key.split(':');
    const v = document.createElement('div'); v.className = 'mg-view' + (dir ? ' ' + dir : ''); v.dataset.key = key;
    const backTo = lastView.length > 1 ? lastView[lastView.length - 2] : null;
    v.innerHTML = (backTo ? `<button type="button" class="mg-back" data-back>${caret}${esc(backTo === 'root' ? 'Menu' : (TABS.find(t => t.id === backTo.split(':')[0]) || {}).label || 'Back')}</button>` : '') + VIEWS[name](arg);
    views.innerHTML = ''; views.appendChild(v);
    if (window.I9MODE) I9MODE.paint();
    requestAnimationFrame(() => (backTo ? $('.mg-back', v) : focusables(v)[0])?.focus());
  }
  function push(key) { lastView.push(key); render(key, 'in'); }
  function pop() { if (lastView.length > 1) { lastView.pop(); render(lastView[lastView.length - 1], 'back'); } }
  function openDrawer() {
    if (!drawer) build();
    $('[data-bagn]', drawer).textContent = X.bag.count();
    lastView = ['root']; render('root'); drawer.hidden = false;
    document.documentElement.classList.add('mg-lock'); btn?.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer(focus = true) {
    if (!drawer || drawer.hidden) return; drawer.hidden = true;
    document.documentElement.classList.remove('mg-lock'); btn?.setAttribute('aria-expanded', 'false');
    if (focus) btn?.focus();
  }
  if (btn) {
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-haspopup', 'dialog');
    btn.addEventListener('click', openDrawer);
  }
  desk.addEventListener?.('change', () => { if (desk.matches) closeDrawer(false); });
  mount();
  document.addEventListener('i9:mode', () => { mount(); if (drawer && !drawer.hidden) { lastView = ['root']; render('root'); } });
  window.I9Mega = { open: id => show($('#mg-t-' + id), false), close: () => hide(false), openDrawer, closeDrawer, get set() { return builtFor; }, tabs: () => TABS.map(t => t.id) };
})();
