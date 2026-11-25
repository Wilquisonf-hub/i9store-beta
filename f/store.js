/* Direction H — the Store home (index.html). Needs ../shared/catalog*.js (incl. catalog-everyday.js), bag.js, browse-core.js.
   Every product is a real listing with its listed USD price and its own image. "Picked by i9" is a hand-picked starting
   shelf, labelled as such; there is no sales, review, stock or delivery data, so none is shown. */
(function () {
  const I9 = window.I9, X = window.I9S, E = I9 && I9.EVERYDAY, BAG = window.I9BAG; if (!I9 || !X) return;
  const { P, usd } = I9, { esc, icon } = X;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const nm = p => p.name.startsWith(p.brand) ? p.name : p.brand + ' ' + p.name;
  /* the page a tile opens: Everyday listings and single listings open product-simple (it takes any listing id);
     the LS 600d has the full product page */
  const pdp = id => id === 'ls600d' ? 'product.html' : (P[id].pdp || 'product-simple.html?id=' + id);
  const prodOf = id => (E && E.productFor(id)) || null;

  /* ---------- a product cell: packshot on white, brand, name, what it is, price, + ---------- */
  function cell(id, opt = {}) {
    const p = P[id]; if (!p) return '';
    const pr = prodOf(id), vs = (pr && pr.variants && pr.variants.length > 1) ? pr.variants : null;
    const title = pr && pr.title && vs ? pr.title : nm(p);
    const brand = p.brand, shown = title.startsWith(brand + ' ') && brand !== 'Camp Snap' ? title.slice(brand.length + 1) : title;
    const dots = vs ? `<span class="dots" aria-hidden="true">${vs.slice(0, 6).map(v => `<i style="--c:${P[v].hex || '#ccc'}"></i>`).join('')}</span>` : '';
    const what = vs ? `${pr.kind} · ${vs.length} colours` : (p.sub || '');
    return `<article class="pc${opt.cls ? ' ' + opt.cls : ''}" data-id="${esc(id)}">
      <a class="pk${p.white === 0 ? ' nw' : ''}" href="${pdp(id)}" tabindex="-1" aria-hidden="true"><img src="${p.thumb && opt.thumb ? p.thumb : p.src}" alt="" loading="${opt.eager ? 'eager' : 'lazy'}" decoding="async"></a>
      <p class="br meta-s">${esc(brand)}</p>
      <h3><a href="${pdp(id)}">${esc(shown)}</a></h3>
      <p class="b">${esc(what)}</p>
      <div class="row"><span class="price">${vs ? '<small>from</small> ' + usd(E.minPrice(pr)) : usd(p.usd)}</span>${dots}
        <button type="button" class="add" data-sadd="${esc(id)}" aria-label="Add ${esc(nm(p))}${p.colour ? ', ' + esc(p.colour) : ''} to bag, ${usd(p.usd)}">${icon('plus')}</button></div>
    </article>`;
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-sadd]'); if (!a || !BAG) return;
    const p = P[a.dataset.sadd]; BAG.add([{ id: p.id, q: 1 }], `Added ${nm(p)}${p.colour ? ' · ' + p.colour : ''}`);
    a.classList.add('done'); a.innerHTML = icon('check');
  });

  /* ---------- hero: four picks ---------- */
  const HERO = ['cs2-sunbeam-yellow', 'mv7', 'lark-m2', 'r50v'];
  $('#s-picks').innerHTML = HERO.filter(id => P[id]).map((id, i) => cell(id, { eager: true, cls: i === 0 ? 'lead' : '' })).join('');

  /* ---------- departments (counts from the browse catalogue) ---------- */
  const ALL = (I9.BROWSE || Object.keys(P)).filter(id => P[id] && P[id].usd > 0);
  const HEAD = { Cameras:'ue80', Lenses:'rf45', Lighting:'ls600d', Audio:'sm7b', Studio:'atemmp', Monitoring:'ninja', Supports:'rs4', Accessories:'hypercore150-v' };
  const DEPTS = (I9.DEPTS || []).map(d => ({ ...d, n: ALL.filter(id => P[id].dept === d.name).length })).filter(d => d.n);
  const headImg = d => { const id = (HEAD[d.name] && P[HEAD[d.name]]) ? HEAD[d.name] : ALL.find(i => P[i].dept === d.name && P[i].white !== 0); return id ? P[id].src : ''; };
  $('#dep-n').textContent = `${DEPTS.length} departments · ${ALL.length} live listings`;
  $('#s-deps').innerHTML = DEPTS.map((d, i) => `<a href="shop.html?category=${d.slug}"><span class="pk"><img src="${headImg(d)}" alt="" loading="${i < 4 ? 'eager' : 'lazy'}"></span><b>${esc(d.name)}</b><span class="meta-s">${d.n} listings</span></a>`).join('');

  /* ---------- shop by need: the Everyday shelves, filtered by price ---------- */
  if (E) {
    const CAPS = [['any', 'Any price', Infinity], ['50', 'Under $50', 50], ['100', 'Under $100', 100], ['300', 'Under $300', 300]];
    let occ = E.SHELVES[0].id, cap = 'any';
    $('#s-occ').insertAdjacentHTML('beforeend', E.SHELVES.map(s => `<label><input type="radio" name="occ" value="${s.id}"${s.id === occ ? ' checked' : ''}><span class="n meta-s">${s.n}</span><b>${esc(s.label)}</b></label>`).join(''));
    $('#s-cap').insertAdjacentHTML('beforeend', CAPS.map(([k, l]) => `<button type="button" data-cap="${k}" aria-pressed="${k === cap}">${l}</button>`).join(''));
    const paint = () => {
      const s = E.SHELVES.find(x => x.id === occ), max = CAPS.find(c => c[0] === cap)[2];
      const seen = new Set(), ids = s.ids.filter(id => { const pr = prodOf(id), k = pr ? pr.id : id; if (seen.has(k)) return false; seen.add(k); return P[id].usd <= max; });
      $('#s-line').textContent = s.line;
      $('#s-shelf').innerHTML = ids.map(id => cell(id)).join('');
      $('#s-empty').hidden = ids.length > 0;
      $('#need-all').href = 'everyday.html#' + s.id;
      $('#need-all').firstChild.textContent = 'The whole “' + s.label + '” shelf ';
      $$('#s-cap button').forEach(b => b.setAttribute('aria-pressed', b.dataset.cap === cap));
    };
    $('#s-occ').addEventListener('change', e => { occ = e.target.value; paint(); });
    $('#s-cap').addEventListener('click', e => { const b = e.target.closest('[data-cap]'); if (b) { cap = b.dataset.cap; paint(); } });
    $('#s-empty').addEventListener('click', e => { if (e.target.closest('[data-anycap]')) { cap = 'any'; paint(); } });
    paint();
  } else $('#need').hidden = true;

  /* ---------- picked by i9: a hand-picked shelf (not a ranking) ---------- */
  const PICKED = ['sm7b', 'atemmp', 'a200d', 'rs4', 'p4', 'mdr'];
  $('#s-picked').innerHTML = PICKED.filter(id => P[id]).map(id => cell(id)).join('');

  /* ---------- brands: twelve names people know, with how many listings each has here ---------- */
  const brandN = {}; ALL.forEach(id => { const b = P[id].brand; brandN[b] = (brandN[b] || 0) + 1; });
  const campN = Object.keys(P).filter(id => P[id].brand === 'Camp Snap').length;
  const BR = [['Blackmagic Design', 'atemmp'], ['Canon', 'r50v'], ['Sony', 'a7iv'], ['Zoom', 'p4'], ['Aputure', 'ls60d'], ['Sennheiser', 'profile'],
              ['Nanlite', 'forza300'], ['DJI', 'osmo-mobile6'], ['Hollyland', 'lark-m2'], ['Panasonic', 'ue20'], ['Atomos', 'ninja'], ['Camp Snap', 'cs1-aqua']];
  $('#brand-n').textContent = `${Object.keys(brandN).length} brands in this catalogue`;
  $('#s-brands').innerHTML = BR.filter(([b, id]) => P[id]).map(([b, id]) => { const n = b === 'Camp Snap' ? campN : (brandN[b] || 0);
    return `<a href="shop.html?brand=${encodeURIComponent(b)}"><span><b>${esc(b)}</b><span class="meta-s">${n} listing${n === 1 ? '' : 's'}</span></span><span class="pk"><img src="${P[id].src}" alt="" loading="lazy"></span></a>`; }).join('');

  /* ---------- the Pro band: a real setup composition in door 02 ---------- */
  const kit = $('#s-kit'); if (kit && X.SET && X.SET[kit.dataset.kit]) X.mountKit(kit, X.SET[kit.dataset.kit], { lazy: true, copies: false, padX: 8, padT: 14, padB: 10 });
  const sn = $('#s-setn'); if (sn && X.SETUPS) sn.firstChild.textContent = X.SETUPS.length + ' setups ';

  /* ---------- the header search hides while the hero search is on screen (one search field in view) ---------- */
  const hs = $('.s-search');
  if (hs && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(en => document.documentElement.classList.toggle('s-search-on', en.isIntersecting)), { rootMargin: '-72px 0px 0px 0px' }).observe(hs);
  }
  /* the header's search icon (below 1440) focuses the hero field when it is on this page */
  document.addEventListener('click', e => { const a = e.target.closest('a[href="#q"]'); if (!a) return; e.preventDefault(); const q = $('#q'); q.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); q.focus({ preventScroll: true }); });
})();
