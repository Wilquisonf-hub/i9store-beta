/* Direction G — shop.html: one listing template driven by URL params.
   ?solution=<id>  ?category=<dept slug>[&sub=<sub slug>]  ?brand=<name>  (all combinable, brand/category/sub repeatable)
   ?price=<bucket> ?setup=1 ?sort=rec|low|high|az ?q=<text>  ·  ?view=brands (A–Z index)  ·  ?view=categories (index)
   Facets: solution, category (department › kind), brand, price, "in a setup"; counts are computed against the other
   active facets. Every listing is real (shared/catalog*.js). */
(function () {
  const I9 = window.I9, X = window.I9S; if (!I9 || !X) return;
  const { P, usd } = I9, { SOL, ORDER, SETUPS, esc, icon, SH } = X;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const enc = encodeURIComponent;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desk = matchMedia('(min-width: 1100px)');
  const say = m => { const l = $('#live'); l.textContent = ''; setTimeout(() => { l.textContent = m; }, 30); };
  const live = p => p.id === 'ls600d' ? 'product.html' : p.pdp ? p.pdp : p.path ? 'https://i9store.com/usa/loja/' + p.path : '#';   /* p.pdp: Everyday page (catalog-everyday.js) */
  const EV = I9.EVERYDAY;   /* merged colour products: one tile, with its colour count */
  const colours = id => { const pr = EV && P[id].product && EV.PROD[P[id].product]; return pr && pr.variants && pr.variants.length > 1 ? pr.variants.length : 0; };

  const ALL = (I9.BROWSE || Object.keys(P)).filter(id => P[id] && P[id].usd > 0);
  const ORD = Object.fromEntries(ALL.map((id, i) => [id, i]));
  const DEPTS = (I9.DEPTS || []).filter(d => ALL.some(id => P[id].dept === d.name));
  const deptBySlug = Object.fromEntries(DEPTS.map(d => [d.slug, d]));
  const subBySlug = {}; DEPTS.forEach(d => d.subs.forEach(s => { subBySlug[s.slug] = { ...s, dept: d.name }; }));
  const brandN = {}; ALL.forEach(id => { brandN[P[id].brand] = (brandN[P[id].brand] || 0) + 1; });
  const BRANDS = Object.keys(brandN).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  const brandKey = Object.fromEntries(BRANDS.map(b => [b.toLowerCase(), b]));
  const PRICES = [['u250', 'Under $250', 0, 250], ['250-1k', '$250 to $1,000', 250, 1000], ['1k-2500', '$1,000 to $2,500', 1000, 2500], ['2500-5k', '$2,500 to $5,000', 2500, 5000], ['5k', '$5,000 and up', 5000, Infinity]];
  const setupsOf = {}; ALL.forEach(id => { const s = X.inSetups(id); if (s.length) setupsOf[id] = s; });
  const HEAD = { Cameras:'ue80', Lenses:'rf45', Lighting:'ls600d', Audio:'sm7b', Studio:'fps170', Monitoring:'sumo19se', Supports:'focus12', Accessories:'hypercore150-v' };
  const deptImg = d => P[HEAD[d.name]]?.src || P[ALL.find(i => P[i].dept === d.name && P[i].white !== 0)].src;
  const subImg = (dept, sub, pool = ALL) => { const c = pool.filter(i => P[i].dept === dept && P[i].subcat === sub && P[i].white !== 0); const s = c.find(i => setupsOf[i]) || c.sort((a, b) => P[b].usd - P[a].usd)[0]; return s ? P[s].src : ''; };

  /* ---------- state <-> URL ---------- */
  const q = new URLSearchParams(location.search);
  const view = q.get('view');
  const st = {
    solution: SOL[q.get('solution')] ? q.get('solution') : '',
    dept: new Set(q.getAll('category').flatMap(v => v.split(',')).map(v => v.toLowerCase()).map(v => deptBySlug[v] ? v : (DEPTS.find(d => d.name.toLowerCase() === v) || {}).slug).filter(Boolean)),
    sub: new Set(q.getAll('sub').flatMap(v => v.split(',')).filter(v => subBySlug[v])),
    brand: new Set(q.getAll('brand').map(v => brandKey[v.toLowerCase()]).filter(Boolean)),
    price: new Set(q.getAll('price').filter(v => PRICES.some(p => p[0] === v))),
    setup: q.get('setup') === '1',
    sort: ['rec', 'low', 'high', 'az'].includes(q.get('sort')) ? q.get('sort') : 'rec',
    q: (q.get('q') || '').trim(),
  };
  st.sub.forEach(s => st.dept.add(DEPTS.find(d => d.name === subBySlug[s].dept).slug));
  const unknownBrand = q.getAll('brand').length && !st.brand.size ? q.getAll('brand')[0] : '';
  const stack = [];   /* order filters were added, for "remove the last filter" */
  function syncURL() {
    const u = new URLSearchParams();
    if (st.solution) u.set('solution', st.solution);
    st.dept.forEach(v => u.append('category', v)); st.sub.forEach(v => u.append('sub', v));
    st.brand.forEach(v => u.append('brand', v)); st.price.forEach(v => u.append('price', v));
    if (st.setup) u.set('setup', '1'); if (st.sort !== 'rec') u.set('sort', st.sort); if (st.q) u.set('q', st.q);
    history.replaceState(null, '', 'shop.html' + (u.toString() ? '?' + u.toString().replace(/%2C/g, ',') : ''));
  }

  /* ---------- filtering ---------- */
  const T = {
    solution: id => !st.solution || !!X.solTie(id, st.solution),
    cat: id => { if (!st.dept.size) return true; const p = P[id], d = DEPTS.find(x => x.name === p.dept);
      if (!d || !st.dept.has(d.slug)) return false; const own = d.subs.filter(s => st.sub.has(s.slug)); return !own.length || own.some(s => s.name === p.subcat); },
    brand: id => !st.brand.size || st.brand.has(P[id].brand),
    price: id => !st.price.size || PRICES.some(([k, , lo, hi]) => st.price.has(k) && P[id].usd >= lo && P[id].usd < hi),
    setup: id => !st.setup || !!setupsOf[id],
    q: id => { if (!st.q) return true; const p = P[id], h = (p.brand + ' ' + p.name + ' ' + (p.sub || '') + ' ' + p.subcat).toLowerCase(); return st.q.toLowerCase().split(/\s+/).every(w => h.includes(w)); },
  };
  const pass = (id, except) => Object.keys(T).every(k => k === except || T[k](id));
  const results = () => ALL.filter(id => pass(id));
  /* search ranking: the whole phrase in the brand or the name beats words scattered through the description, so
     "camp snap" puts Camp Snap first and a lens that only mentions "camp" never outranks it */
  const qRank = id => { if (!st.q) return 0; const p = P[id], q = st.q.toLowerCase(), b = p.brand.toLowerCase(), n = p.name.toLowerCase();
    return (b === q || n === q ? 60 : 0) + (b.startsWith(q) || n.startsWith(q) ? 40 : 0) + ((b + ' ' + n).includes(q) ? 20 : 0); };
  const rank = id => { let r = qRank(id); if (st.solution) r += ({ setup: 30, picked: 20, fits: 0 })[X.solTie(id, st.solution)] || 0; if (setupsOf[id]) r += 10; if (P[id].white === 0) r -= 5; return r; };
  function sorted(L) {
    const s = st.sort;
    return L.slice().sort(s === 'low' ? (a, b) => P[a].usd - P[b].usd : s === 'high' ? (a, b) => P[b].usd - P[a].usd
      : s === 'az' ? (a, b) => P[a].brand.localeCompare(P[b].brand) || P[a].name.localeCompare(P[b].name)
      : (a, b) => rank(b) - rank(a) || ORD[a] - ORD[b]);
  }

  /* ---------- page top ---------- */
  const deptNames = () => [...st.dept].map(s => deptBySlug[s].name);
  const subNames = () => [...st.sub].map(s => subBySlug[s].name);
  function titleParts() {
    const subs = subNames(), depts = deptNames(), brands = [...st.brand];
    let main = brands.length === 1 ? brands[0] : subs.length === 1 ? subs[0] : depts.length === 1 ? depts[0] : '';
    let dim = '';
    if (brands.length === 1 && (subs.length === 1 || depts.length === 1)) dim = (subs[0] || depts[0]).toLowerCase();
    if (st.solution) { if (!main) main = SOL[st.solution].label; else dim = (dim ? dim + ' ' : '') + 'for ' + SOL[st.solution].label.toLowerCase(); }
    if (!main) main = st.setup ? 'In a setup' : 'All equipment';
    return { main, dim };
  }
  function paintTop(n) {
    const { main, dim } = titleParts();
    $('#bx-h').innerHTML = esc(main) + (dim ? ` <span class="dim">${esc(dim)}.</span>` : '.');
    document.title = main + (dim ? ' ' + dim : '') + ' — i9Store USA';
    $('#slate').textContent = main;
    const cr = ['<a href="index.html">Home</a>', '<a href="shop.html">Shop</a>'];
    if (st.solution) cr.push(`<a href="setups.html?for=${st.solution}">Solutions</a>`, `<a href="shop.html?solution=${st.solution}">${esc(SOL[st.solution].label)}</a>`);
    if (st.dept.size === 1) { const d = deptBySlug[[...st.dept][0]]; cr.push(`<a href="shop.html?category=${d.slug}">${esc(d.name)}</a>`); if (st.sub.size === 1) cr.push(`<a href="shop.html?category=${d.slug}&sub=${[...st.sub][0]}">${esc(subNames()[0])}</a>`); }
    if (st.brand.size === 1) cr.push('<a href="shop.html?view=brands">Brands</a>', `<a href="shop.html?brand=${enc([...st.brand][0])}">${esc([...st.brand][0])}</a>`);
    cr[cr.length - 1] = cr[cr.length - 1].replace(/^<a [^>]*>(.*)<\/a>$/, '<span aria-current="page">$1</span>');
    $('#crumbs').innerHTML = cr.join('<span aria-hidden="true">/</span>');
    const R = results(), brands = new Set(R.map(id => P[id].brand)).size, inS = R.filter(id => setupsOf[id]).length;
    $('#kick').textContent = st.solution ? `Solution · ${SOL[st.solution].label}` : st.brand.size === 1 ? 'Brand' : st.dept.size ? 'Category' : 'Shop · all departments';
    $('#stats').innerHTML = `<span><b>${R.length}</b> listings</span><span><b>${brands}</b> brand${brands === 1 ? '' : 's'}</span><span><b>${inS}</b> in a setup</span>`;
  }
  /* the context column + "choose" row only change when the page's identity changes, not on every facet tick */
  let ctxKey = '';
  const lit = (ids, cap) => ids.length ? `<figure class="bx-ctx lit"><span class="comp">${ids.map(id => `<span><img src="${P[id].src}" alt=""></span>`).join('')}</span><figcaption class="meta-s">${esc(cap)}</figcaption></figure>` : '';
  function paintContext() {
    const key = [st.solution, [...st.brand].join('|'), [...st.dept].join('|')].join('/');
    if (key === ctxKey) return; ctxKey = key;
    const ctx = $('#ctx'), ch = $('#choose');
    const R0 = ALL.filter(id => T.solution(id) && T.brand(id));
    if (st.solution) {
      const s = SOL[st.solution], ss = X.setupsFor(st.solution);
      ctx.innerHTML = (s.photo ? `<figure class="bx-ctx"><img src="${SH + s.photo}" alt="${esc(s.alt)}" style="--pos:${s.pos}"><span class="slate meta" aria-hidden="true"><span class="tally"></span><span>PGM</span><span>${esc(s.short)}</span></span><figcaption class="meta-s">${esc(s.cap)}</figcaption></figure>`
        : `<figure class="bx-ctx lit"><span class="comp">${s.comp.map(id => `<span><img src="${P[id].src}" alt=""></span>`).join('')}</span><figcaption class="meta-s">${esc(s.cap)}</figcaption></figure>`) +
        '';
      $('#lede').innerHTML = `<p class="bx-lede">${esc(s.who)}. Every listing in the kinds of gear this room buys. Pieces in a ${esc(s.label.toLowerCase())} setup and i9’s picks come first.</p>`;
      ch.innerHTML = `<p class="meta"><span>Complete setups for ${esc(s.label.toLowerCase())}</span><a href="setups.html?for=${st.solution}">All setups</a></p>
        <div class="chooser wide">${ss.map(x => `<a class="kitc" href="setups.html#${x.id}"><span class="kit" data-kit="${x.id}"></span><span class="tx"><b>${esc(x.title)}</b><span class="n">${x.pieces} pcs · ${usd(x.total)}</span></span></a>`).join('')}
        </div>
        <p class="meta" style="margin-top:28px"><span>Kinds of gear ${esc(s.label.toLowerCase())} buy</span><a href="shop.html?view=categories">All categories</a></p>
        <div class="chooser">${s.fits.map(n => { const d = DEPTS.find(x => x.subs.some(y => y.name === n)); if (!d) return ''; const sub = d.subs.find(y => y.name === n), c = R0.filter(id => P[id].subcat === n).length; if (!c) return '';
          return `<button type="button" data-csub="${sub.slug}" aria-pressed="false"><span class="pk"><img src="${subImg(d.name, n, R0)}" alt=""></span><span class="tx"><b>${esc(n)}</b><span class="n">${c}</span></span></button>`; }).join('')}</div>`;
      $$('[data-kit]', ch).forEach(k => X.mountKit(k, X.SET[k.dataset.kit], { copies: false, padT: 6, padB: 6 }));
    } else if (st.brand.size === 1) {
      const b = [...st.brand][0], mine = ALL.filter(id => P[id].brand === b), depts = [...new Set(mine.map(id => P[id].dept))];
      const top3 = mine.filter(id => P[id].white !== 0).sort((x, y) => (setupsOf[y] ? 1 : 0) - (setupsOf[x] ? 1 : 0) || P[y].usd - P[x].usd).slice(0, 3);
      const sets = SETUPS.filter(s => s.items.some(it => P[it.id].brand === b));
      ctx.innerHTML = lit(top3, `${b} · three live listings · not a photo`);
      $('#lede').innerHTML = `<p class="bx-lede">${mine.length} live listing${mine.length === 1 ? '' : 's'} from ${esc(b)} in ${depts.map(esc).join(', ').replace(/, ([^,]*)$/, ' and $1')}. Prices in USD, before sales tax and shipping.</p>
        ${sets.length ? `<p class="bx-lede">In ${sets.length} of our setups: ${sets.map(s => `<a href="setups.html#${s.id}">${esc(s.title.toLowerCase())}</a>`).join(', ')}.</p>` : ''}`;
      const subs = [...new Set(mine.map(id => P[id].dept + '|' + P[id].subcat))];
      ch.innerHTML = top3.length ? `<p class="meta"><span>Choose what you need from ${esc(b)}</span><a href="shop.html?view=brands">All brands</a></p>
        <div class="chooser">${subs.map(k => { const [d, s] = k.split('|'), ss = DEPTS.find(x => x.name === d).subs.find(x => x.name === s); return `<button type="button" data-csub="${ss.slug}" aria-pressed="false"><span class="pk"><img src="${subImg(d, s, mine) || P[mine[0]].src}" alt=""></span><span class="tx"><b>${esc(s)}</b><span class="n">${mine.filter(id => P[id].subcat === s).length}</span></span></button>`; }).join('')}</div>` : '';
    } else if (st.dept.size === 1) {
      const d = deptBySlug[[...st.dept][0]], mine = ALL.filter(id => P[id].dept === d.name);
      const subs3 = d.subs.map(x => mine.filter(id => P[id].subcat === x.name && P[id].white !== 0).sort((a, b) => (setupsOf[b] ? 1 : 0) - (setupsOf[a] ? 1 : 0) || P[b].usd - P[a].usd)[0]).filter(Boolean).slice(0, 3);
      ctx.innerHTML = lit(subs3, `${d.name} · three live listings · not a photo`);
      $('#lede').innerHTML = `<p class="bx-lede">${mine.length} live listings from ${new Set(mine.map(id => P[id].brand)).size} brands. Pick a kind below, or narrow by brand, price or room with the filters.</p>`;
      ch.innerHTML = `<p class="meta"><span>Choose a kind of ${esc(d.name.toLowerCase())}</span><a href="shop.html?view=categories">All categories</a></p>
        <div class="chooser">${d.subs.filter(s => mine.some(id => P[id].subcat === s.name)).map(s => `<button type="button" data-csub="${s.slug}" aria-pressed="false"><span class="pk"><img src="${subImg(d.name, s.name)}" alt=""></span><span class="tx"><b>${esc(s.name)}</b><span class="n">${mine.filter(id => P[id].subcat === s.name).length}</span></span></button>`).join('')}</div>`;
    } else {
      ctx.innerHTML = lit(['ue80', 'ls600d', 'sm7b'].filter(i => P[i]), 'Three live listings · not a photo');
      $('#lede').innerHTML = `<p class="bx-lede">${ALL.length} live listings from ${BRANDS.length} brands, shipped from Miami. Browse by department, by brand, or by the kind of room you are equipping.</p>
        <p class="bx-lede"><a href="setups.html">Or shop a complete setup</a>, numbered piece by piece.</p>`;
      ch.innerHTML = `<p class="meta"><span>Departments</span><a href="shop.html?view=categories">All categories</a></p>
        <div class="chooser">${DEPTS.map(d => `<a href="shop.html?category=${d.slug}"><span class="pk"><img src="${deptImg(d)}" alt=""></span><span class="tx"><b>${esc(d.name)}</b><span class="n">${ALL.filter(id => P[id].dept === d.name).length}</span></span></a>`).join('')}</div>`;
    }
    void R0;
  }
  $('#choose').addEventListener('click', e => {
    const b = e.target.closest('[data-csub]'); if (!b) return;
    const s = subBySlug[b.dataset.csub], d = DEPTS.find(x => x.name === s.dept);
    if (st.sub.has(s.slug)) st.sub.delete(s.slug); else { st.sub.add(s.slug); st.dept.add(d.slug); stack.push(['sub', s.slug]); }
    update(true);
    $('#results').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---------- facets (built once; counts / checked / disabled updated in place so focus never jumps) ---------- */
  const fo = (type, name, val, label, cls = '') => `<label class="fo ${cls}"><input type="${type}" name="${name}" value="${esc(val)}"><i aria-hidden="true"></i><span class="l">${esc(label)}</span><span class="n"></span></label>`;
  const topBrands = BRANDS.slice().sort((a, b) => brandN[b] - brandN[a]).slice(0, 10);
  let showAllBrands = st.brand.size && [...st.brand].some(b => !topBrands.includes(b));
  $('#fbody').innerHTML = `
    <fieldset class="fg" data-g="solution"><legend><span>Solution</span></legend>
      ${fo('radio', 'solution', '', 'Any room')}${ORDER.map(k => fo('radio', 'solution', k, SOL[k].label)).join('')}</fieldset>
    <fieldset class="fg" data-g="cat"><legend><span>Category</span></legend>
      ${DEPTS.map(d => fo('checkbox', 'dept', d.slug, d.name) + d.subs.map(s => fo('checkbox', 'sub', s.slug, s.name, 'sub')).join('')).join('')}</fieldset>
    <fieldset class="fg" data-g="brand"><legend><span>Brand</span><span>${BRANDS.length}</span></legend>
      <label class="sr" for="ffind">Find a brand</label><input class="ffind" id="ffind" type="search" placeholder="Find a brand" autocomplete="off">
      <div id="blist">${BRANDS.map(b => fo('checkbox', 'brand', b, b)).join('')}</div>
      <button type="button" class="fmore" id="bmore" aria-expanded="false"></button></fieldset>
    <fieldset class="fg" data-g="price"><legend><span>Price</span><span>USD, before tax</span></legend>
      ${PRICES.map(([k, l]) => fo('checkbox', 'price', k, l)).join('')}</fieldset>
    <fieldset class="fg" data-g="setup"><legend><span>Setups</span></legend>
      ${fo('checkbox', 'setup', '1', 'Only pieces in a setup')}</fieldset>
    <fieldset class="fg"><legend><span>Search</span></legend>
      <label class="sr" for="fq">Search these listings</label><input class="ffind" id="fq" type="search" placeholder="Model, brand or kind" autocomplete="off" value="${esc(st.q)}"></fieldset>`;
  const F = $('#fbody');
  function paintFacets() {
    const cnt = (except, fn) => ALL.filter(id => pass(id, except) && fn(id)).length;
    $$('input[name=solution]', F).forEach(i => { const v = i.value; i.checked = v === st.solution; const n = v ? cnt('solution', id => !!X.solTie(id, v)) : cnt('solution', () => true); setN(i, n, !n && !i.checked); });
    $$('input[name=dept]', F).forEach(i => { const d = deptBySlug[i.value]; i.checked = st.dept.has(i.value); const n = cnt('cat', id => P[id].dept === d.name); setN(i, n, !n && !i.checked); });
    $$('input[name=sub]', F).forEach(i => { const s = subBySlug[i.value], d = DEPTS.find(x => x.name === s.dept); i.checked = st.sub.has(i.value);
      const n = cnt('cat', id => P[id].dept === s.dept && P[id].subcat === s.name); setN(i, n, !n && !i.checked); i.closest('.fo').hidden = !st.dept.has(d.slug); });
    const f = ($('#ffind').value || '').trim().toLowerCase();
    $$('input[name=brand]', F).forEach(i => { const b = i.value; i.checked = st.brand.has(b); const n = cnt('brand', id => P[id].brand === b); setN(i, n, !n && !i.checked);
      i.closest('.fo').hidden = f ? !b.toLowerCase().includes(f) : !(showAllBrands || topBrands.includes(b) || i.checked); });
    const bm = $('#bmore'); bm.hidden = !!f; bm.setAttribute('aria-expanded', !!showAllBrands); bm.innerHTML = showAllBrands ? `Show fewer ${icon('minus')}` : `Show all ${BRANDS.length} brands ${icon('plus')}`;
    $$('input[name=price]', F).forEach(i => { const [, , lo, hi] = PRICES.find(p => p[0] === i.value); i.checked = st.price.has(i.value); const n = cnt('price', id => P[id].usd >= lo && P[id].usd < hi); setN(i, n, !n && !i.checked); });
    $$('input[name=setup]', F).forEach(i => { i.checked = st.setup; setN(i, cnt('setup', id => !!setupsOf[id]), false); });
  }
  function setN(i, n, dis) { i.closest('.fo').querySelector('.n').textContent = n; i.disabled = dis; }
  F.addEventListener('change', e => {
    const i = e.target; if (!i.name) return;
    const v = i.value;
    if (i.name === 'solution') { st.solution = v; if (v) stack.push(['solution', v]); }
    else if (i.name === 'dept') { if (i.checked) { st.dept.add(v); stack.push(['dept', v]); } else { st.dept.delete(v); deptBySlug[v].subs.forEach(s => st.sub.delete(s.slug)); } }
    else if (i.name === 'sub') { i.checked ? (st.sub.add(v), stack.push(['sub', v])) : st.sub.delete(v); }
    else if (i.name === 'brand') { i.checked ? (st.brand.add(v), stack.push(['brand', v])) : st.brand.delete(v); }
    else if (i.name === 'price') { i.checked ? (st.price.add(v), stack.push(['price', v])) : st.price.delete(v); }
    else if (i.name === 'setup') { st.setup = i.checked; if (i.checked) stack.push(['setup', '1']); }
    update(true);
  });
  let qt; F.addEventListener('input', e => {
    if (e.target.id === 'ffind') paintFacets();
    if (e.target.id === 'fq') { clearTimeout(qt); qt = setTimeout(() => { st.q = e.target.value.trim(); update(true); }, 200); }
  });
  $('#bmore').addEventListener('click', () => { showAllBrands = !showAllBrands; paintFacets(); });

  /* ---------- chips ---------- */
  function chips() {
    const c = [];
    if (st.solution) c.push(['solution', st.solution, 'Room', SOL[st.solution].short]);
    deptNames().forEach((n, k) => { const slug = [...st.dept][k]; if (!deptBySlug[slug].subs.some(s => st.sub.has(s.slug))) c.push(['dept', slug, 'Category', n]); });
    st.sub.forEach(s => c.push(['sub', s, subBySlug[s].dept, subBySlug[s].name]));
    st.brand.forEach(b => c.push(['brand', b, 'Brand', b]));
    st.price.forEach(p => c.push(['price', p, 'Price', PRICES.find(x => x[0] === p)[1]]));
    if (st.setup) c.push(['setup', '1', 'Setups', 'In a setup']);
    if (st.q) c.push(['q', st.q, 'Search', '“' + st.q + '”']);
    $('#chips').innerHTML = c.map(([k, v, l, t]) => `<button type="button" class="chip" data-rm="${k}" data-v="${esc(v)}" aria-label="Remove ${esc(l)}: ${esc(t)}"><span class="k">${esc(l)}</span>${esc(t)}${icon('x')}</button>`).join('') +
      (c.length > 1 ? `<button type="button" class="chip clear" data-clear>Clear all</button>` : '');
    return c.length;
  }
  function remove(k, v) {
    if (k === 'solution') st.solution = ''; else if (k === 'dept') { st.dept.delete(v); deptBySlug[v].subs.forEach(s => st.sub.delete(s.slug)); }
    else if (k === 'sub') { st.sub.delete(v); } else if (k === 'brand') st.brand.delete(v); else if (k === 'price') st.price.delete(v);
    else if (k === 'setup') st.setup = false; else if (k === 'q') { st.q = ''; $('#fq').value = ''; }
  }
  function clearAll() { st.solution = ''; st.dept.clear(); st.sub.clear(); st.brand.clear(); st.price.clear(); st.setup = false; st.q = ''; $('#fq').value = ''; }
  document.addEventListener('click', e => {
    const r = e.target.closest('[data-rm]'); if (r) { remove(r.dataset.rm, r.dataset.v); update(true); say('Filter removed. ' + results().length + ' listings'); ($('#chips .chip') || $('#count')).focus?.(); return; }
    if (e.target.closest('[data-clear], [data-fclear]')) { clearAll(); update(true); say('All filters cleared. ' + ALL.length + ' listings'); return; }
    const last = e.target.closest('[data-last]'); if (last) { const l = stack.pop(); if (l) remove(l[0], l[1]); update(true); return; }
  });

  /* ---------- tiles ---------- */
  const PAGE = 48; let shown = PAGE;
  function tag(id) {
    if (st.solution) {
      const t = X.solTie(id, st.solution), s = SOL[st.solution];
      if (t === 'setup') { const x = X.setupsFor(st.solution).find(z => z.items.some(it => it.id === id)); return `<a class="bt-tag" href="setups.html#${x.id}"><i aria-hidden="true"></i>In the ${esc(s.short.toLowerCase())} setup</a>`; }
      if (t === 'picked') return `<span class="bt-tag pick"><i aria-hidden="true"></i>Picked for ${esc(s.short.toLowerCase())}</span>`;
      return '';
    }
    const ss = setupsOf[id]; if (!ss) return '';
    return ss.length === 1 ? `<a class="bt-tag" href="setups.html#${ss[0].id}"><i aria-hidden="true"></i>In a setup · ${esc(SOL[ss[0].sol].short)}</a>`
      : `<a class="bt-tag" href="setups.html#${ss[0].id}" title="${esc(ss.map(s => s.title).join(' · '))}"><i aria-hidden="true"></i>In ${ss.length} setups</a>`;
  }
  const tile = id => { const p = P[id];
    return `<article class="bt">${tag(id)}<span class="pk${p.white === 0 ? ' nw' : ''}" aria-hidden="true"><img src="${p.src}" alt="" loading="lazy" decoding="async"></span>
      <p class="cat meta">${esc(p.subcat || p.dept)}</p><p class="br meta-s">${esc(p.brand)}</p>
      <h3><a href="${live(p)}">${esc(p.name)}</a></h3><p class="b">${esc(colours(id) ? (EV.PROD[p.product].kind + ' · ' + colours(id) + ' colours') : (p.sub || ''))}</p>
      <div class="row"><span class="price">${usd(p.usd)}</span><button type="button" class="add" data-add1="${id}" aria-label="Add ${esc(p.brand + ' ' + p.name)} to bag">${icon('plus')}</button></div></article>`; };
  function paintTiles(R) {
    const L = sorted(R), page = L.slice(0, shown);
    $('#tiles').innerHTML = page.map(tile).join('');
    $('#tiles').hidden = !L.length;
    const left = L.length - page.length;
    $('#more').hidden = left <= 0;
    $('#morebtn').textContent = `Show ${Math.min(PAGE, left)} more`;
    $('#moren').textContent = `${page.length} of ${L.length} shown`;
    const em = $('#empty'); em.hidden = !!L.length;
    if (!L.length) {
      const l = stack[stack.length - 1];
      em.innerHTML = `<p class="meta"><i aria-hidden="true"></i>No signal</p><h2 class="h2">Nothing on air for that mix.</h2>
        <p>No live listing matches all of these filters together${unknownBrand ? ` (we have no listings from “${esc(unknownBrand)}” in this catalogue)` : ''}. Remove one, or ask a specialist: i9 sources across 140+ brands, not only what is listed here.</p>
        <div class="acts">${l ? `<button type="button" class="btn solid" data-last>Remove the last filter</button>` : ''}<button type="button" class="btn" data-clear>Clear all filters</button><a class="btn" href="#">${icon('whatsapp-logo')}Ask a specialist</a></div>`;
    }
  }
  $('#morebtn').addEventListener('click', () => { const first = shown; shown += PAGE; paintTiles(results()); $$('#tiles .bt')[first]?.querySelector('h3 a')?.focus(); say(`Showing ${Math.min(shown, results().length)} listings`); });
  $('#tiles').addEventListener('click', e => { const a = e.target.closest('[data-add1]'); if (!a) return; const p = P[a.dataset.add1]; X.bag.add([{ id: p.id, q: 1 }], `Added ${p.brand} ${p.name}`); a.classList.add('done'); a.innerHTML = icon('check'); });
  $('#sort').value = st.sort;
  $('#sort').addEventListener('change', e => { st.sort = e.target.value; update(false); });

  function update(resetPage) {
    if (resetPage) shown = PAGE;
    const R = results();
    paintTop(R.length); paintContext(); paintFacets();
    $$('#choose [data-csub]').forEach(b => b.setAttribute('aria-pressed', st.sub.has(b.dataset.csub)));
    const n = chips();
    $('#count').innerHTML = `${R.length} listing${R.length === 1 ? '' : 's'}<span class="meta-s">${n ? n + ' filter' + (n === 1 ? '' : 's') + ' on' : 'Every department'} · sorted ${$('#sort').selectedOptions[0].text.toLowerCase()}</span>`;
    $('#filt').textContent = n ? `Filter · ${n}` : 'Filter';
    $('#fshow').textContent = `Show ${R.length} listing${R.length === 1 ? '' : 's'}`;
    paintTiles(R); syncURL();
  }

  /* ---------- desktop: hide/show the facet column · tablet/phone: facets drawer ---------- */
  $('#hidef').addEventListener('click', e => { const g = $('#bx-grid'), off = g.classList.toggle('nofacets'); e.currentTarget.textContent = off ? 'Show filters' : 'Hide filters'; e.currentTarget.setAttribute('aria-expanded', !off); });
  const fac = $('#facets'), filt = $('#filt');
  function openF() { fac.classList.add('open'); fac.setAttribute('role', 'dialog'); fac.setAttribute('aria-modal', 'true'); filt.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('mg-lock'); requestAnimationFrame(() => $('[data-fclose]', fac).focus()); }
  function closeF() { if (!fac.classList.contains('open')) return; fac.classList.remove('open'); fac.removeAttribute('role'); fac.removeAttribute('aria-modal'); filt.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('mg-lock'); filt.focus(); }
  filt.addEventListener('click', openF);
  fac.addEventListener('click', e => { if (e.target.closest('[data-fclose]')) closeF(); });
  fac.addEventListener('keydown', e => {
    if (!fac.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeF(); }
    if (e.key === 'Tab') { const f = $$('button,input:not([disabled]),a[href]', fac).filter(x => x.offsetParent !== null); if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
  });
  desk.addEventListener?.('change', () => { if (desk.matches) closeF(); });

  /* ================= index views ================= */
  function brandIndex() {
    $('#results').hidden = true; $('#choose').innerHTML = '';
    const idx = $('#index'); idx.hidden = false;
    document.title = 'Brands A–Z — i9Store USA';
    $('#crumbs').innerHTML = '<a href="index.html">Home</a><span aria-hidden="true">/</span><a href="shop.html">Shop</a><span aria-hidden="true">/</span><span aria-current="page">Brands</span>';
    $('#kick').textContent = 'Brand index · A–Z'; $('#bx-h').innerHTML = `Brands. <span class="dim">${BRANDS.length} of them.</span>`;
    $('#stats').innerHTML = `<span><b>${BRANDS.length}</b> brands</span><span><b>${ALL.length}</b> listings</span><span>i9 sources from 140+ brands; these are the ones listed here</span>`;
    const top = BRANDS.slice().sort((a, b) => brandN[b] - brandN[a]).slice(0, 12);
    $('#ctx').innerHTML = ''; $('#lede').innerHTML = `<p class="bx-lede">Every brand with a live listing in this catalogue, with how many. The most listed:</p><div class="az-top">${top.map(b => `<a href="shop.html?brand=${enc(b)}">${esc(b)}<span class="n">${brandN[b]}</span></a>`).join('')}</div>`;
    const letter = b => /[A-Z]/i.test(b[0]) ? b[0].toUpperCase() : '#';
    const Ls = [...new Set(BRANDS.map(letter))];
    const best = b => { const m = ALL.filter(id => P[id].brand === b); return (m.filter(id => P[id].white !== 0).sort((x, y) => (setupsOf[y] ? 1 : 0) - (setupsOf[x] ? 1 : 0) || P[y].usd - P[x].usd)[0]) || m[0]; };
    idx.innerHTML = `<nav class="az-bar" aria-label="Brands by letter"><div class="wrap">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => Ls.includes(c) ? `<a href="#brand-${c}">${c}</a>` : `<span aria-hidden="true">${c}</span>`).join('')}</div></nav>
      <div class="wrap az">${Ls.map(L => { const bs = BRANDS.filter(b => letter(b) === L);
        return `<section class="az-sec" id="brand-${L}" aria-labelledby="h-${L}"><h2 id="h-${L}">${L}<small>${bs.length} brand${bs.length === 1 ? '' : 's'}</small></h2>
          <div class="az-list">${bs.map(b => { const m = ALL.filter(id => P[id].brand === b), d = [...new Set(m.map(id => P[id].dept))];
            return `<a class="az-b" href="shop.html?brand=${enc(b)}"><span class="pk"><img src="${P[best(b)].src}" alt="" loading="lazy"></span><span><b><span>${esc(b)}</span><span class="n">${m.length}</span></b><span class="d">${d.map(esc).join(' · ')}</span></span></a>`; }).join('')}</div></section>`; }).join('')}</div>`;
    const bar = $('.az-bar');
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) $$('a', bar).forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-40% 0px -55% 0px' }); $$('.az-sec').forEach(s => io.observe(s)); }
    if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
  }
  function catIndex() {
    $('#results').hidden = true;
    const idx = $('#index'); idx.hidden = false;
    document.title = 'Categories — i9Store USA';
    $('#crumbs').innerHTML = '<a href="index.html">Home</a><span aria-hidden="true">/</span><a href="shop.html">Shop</a><span aria-hidden="true">/</span><span aria-current="page">Categories</span>';
    $('#kick').textContent = 'Category index'; $('#bx-h').innerHTML = `Categories. <span class="dim">${DEPTS.length} departments.</span>`;
    const nsub = DEPTS.reduce((a, d) => a + d.subs.filter(s => ALL.some(id => P[id].subcat === s.name && P[id].dept === d.name)).length, 0);
    $('#stats').innerHTML = `<span><b>${DEPTS.length}</b> departments</span><span><b>${nsub}</b> kinds</span><span><b>${ALL.length}</b> listings</span>`;
    $('#ctx').innerHTML = lit(['ue80', 'atem1me', 'ls600d'], 'Three live listings · not a photo'); $('#lede').innerHTML = `<p class="bx-lede">Departments as the store files them, with every kind inside and how many live listings each has. Looking for a whole room instead? <a href="setups.html">Shop a setup</a>.</p>`;
    $('#choose').innerHTML = '';
    idx.innerHTML = `<div class="wrap" style="padding-top:56px;padding-bottom:88px"><div class="ci">${DEPTS.map(d => { const m = ALL.filter(id => P[id].dept === d.name);
      return `<section class="ci-d" aria-labelledby="ci-${d.slug}"><a class="pk" href="shop.html?category=${d.slug}" tabindex="-1" aria-hidden="true"><img src="${deptImg(d)}" alt="" loading="lazy"></a>
        <div><h2 id="ci-${d.slug}"><a href="shop.html?category=${d.slug}">${esc(d.name)}</a></h2><p class="meta-s">${m.length} listings · ${new Set(m.map(id => P[id].brand)).size} brands</p>
        <ul>${d.subs.map(s => [s, m.filter(id => P[id].subcat === s.name).length]).filter(x => x[1]).map(([s, n]) => `<li><a href="shop.html?category=${d.slug}&sub=${s.slug}">${esc(s.name)}<span class="n">${n}</span></a></li>`).join('')}</ul>
        <a class="textlink" href="shop.html?category=${d.slug}">All ${esc(d.name.toLowerCase())} ${icon('arrow-right')}</a></div></section>`; }).join('')}</div></div>`;
  }

  if (view === 'brands') brandIndex();
  else if (view === 'categories') catIndex();
  else update(true);
  window.I9Shop = { state: () => ({ solution: st.solution, dept: [...st.dept], sub: [...st.sub], brand: [...st.brand], price: [...st.price], setup: st.setup, n: results().length }) };
})();
