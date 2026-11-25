/* Direction G — the Everyday line: product-simple.html (one product, colour swatches, model choice, add-ons, phone buy bar)
   and everyday.html (shelves by occasion and price). Data: ../shared/catalog-everyday.js (I9.EVERYDAY), every line a
   real listing. The bag is bag.js (localStorage 'i9g-bag'), shared with the Professional pages and checkout. */
(function () {
  const I9 = window.I9, E = I9 && I9.EVERYDAY; if (!E) return;
  const { P, usd } = I9, BAG = window.I9BAG;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
  const reduce = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } })();
  const nm = p => p.name.startsWith(p.brand) ? p.name : p.brand + ' ' + p.name;
  const PR = E.PROD;
  const priceRange = pr => { const v = (pr.variants || [pr.def]).map(id => P[id].usd), lo = Math.min(...v), hi = Math.max(...v); return lo === hi ? usd(lo) : usd(lo) + '–' + usd(hi); };

  /* slate tabs: the lit stage that fills most of the viewport is on air (same rule as g.js) */
  const stages = $$('[data-slate]');
  if (stages.length && 'IntersectionObserver' in window) {
    const vis = new Map();
    const io = new IntersectionObserver(es => { es.forEach(en => vis.set(en.target, en.intersectionRatio));
      let best = null, r = 0.15; vis.forEach((v, k) => { if (v > r) { r = v; best = k; } }); stages.forEach(s => s.classList.toggle('on-air', s === best)); }, { threshold: [0, .15, .3, .5, .7, 1] });
    stages.forEach(s => io.observe(s));
  }

  /* ---------- a tile: one per product; several colours show as chips ---------- */
  function tile(id, opt = {}) {
    const p = P[id], pr = E.productFor(id), vs = (pr && pr.variants) || [id], many = vs.length > 1;
    const dots = many ? `<span class="dots" aria-hidden="true">${vs.slice(0, 5).map(v => `<i style="--c:${P[v].hex || '#ccc'}"></i>`).join('')}<em>${vs.length}</em></span>` : '';
    /* the + adds the colour in the photo, so the tile shows that colour's price (the colour count says there are more) */
    const title = pr && pr.title ? pr.title : nm(p);
    const brand = p.brand;
    return `<article class="et" data-id="${esc(id)}">${opt.tag ? `<span class="tag"><i></i>${esc(opt.tag)}</span>` : ''}${dots}
      <span class="pk${p.white === 0 ? ' nw' : ''}" aria-hidden="true"><img src="${p.src}" alt="" loading="lazy" decoding="async"></span>
      <p class="br meta-s">${esc(brand)}</p><h3><a href="${p.pdp || 'product-simple.html?id=' + id}">${esc(title.startsWith(brand + ' ') && brand !== 'Camp Snap' ? title.slice(brand.length + 1) : title)}</a></h3>
      <p class="b">${esc(many ? (pr.kind + ' · ' + p.colour + ' · ' + vs.length + ' colours') : (p.sub || ''))}</p>
      <div class="row"><span class="price">${usd(p.usd)}</span><button type="button" class="add" data-q1="${esc(id)}" aria-label="Add ${esc(nm(p))}${p.colour ? ', ' + esc(p.colour) : ''} to bag">${icon('plus')}</button></div></article>`;
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-q1]'); if (!a || !BAG) return;
    const p = P[a.dataset.q1]; BAG.add([{ id: p.id, q: 1 }], `Added ${nm(p)}${p.colour ? ' · ' + p.colour : ''}`);
    a.classList.add('done'); a.innerHTML = icon('check');
  });

  /* ======================= product-simple.html ======================= */
  const plate = $('#ev-plate');
  if (plate) {
    const qs = new URLSearchParams(location.search);
    let key = qs.get('id') || 'campsnap-2';
    let prod = E.productFor(key) || PR['campsnap-2'];
    let vid = P[key] && (prod.variants || []).includes(key) ? key : prod.def;
    const fam = prod.family ? E.FAMILY[prod.family] : null;
    const picked = new Map();   /* add-on product id -> listing id chosen (gem colour) */

    /* "is this for you?" per model; generic products say where they sit on our shelves. Claims only from listing/brand. */
    const FIT = {
      'campsnap-2': { yes: ['You want photos without a phone in your hand. It is <b>screen-free</b>: point, shoot, see them later.',
          'It is a gift for a kid. <b>CampLock</b> is the maker’s kid-friendly setting.',
          'A trip, a camp or a party, where one camera gets passed around.'],
        no: ['You want to check every shot as you take it. There is no screen.', 'You want video: that is the <a href="?id=cs-8" data-model="campsnap-8">CS-8</a>.',
          'You are starting a channel: see <a href="everyday.html#phone">Start on your phone</a> or the <a href="setups.html#creator-desk">creator desk setup</a>.'] },
      'campsnap-1': { yes: ['You want the original <b>screen-free</b> Camp Snap, in nine colours.',
          'Price matters: the 1st Gen in Forest Green is the lowest-priced Camp Snap we list.',
          'A gift where the colour is half the present.'],
        no: ['You want what the maker lists for the newer model: 500 shots on one charge and six filters. That is <a href="?id=cs2-sunbeam-yellow" data-model="campsnap-2">Camp Snap 2</a>.',
          'You want to check every shot as you take it. There is no screen.', 'You want video: that is the <a href="?id=cs-8" data-model="campsnap-8">CS-8</a>.'] },
      'campsnap-pro': { yes: ['You want a flash: the maker lists a <b>xenon flash</b>.', 'You want <b>16 MP</b> and a four-filter dial.', 'A step up for someone who already shoots for fun.'],
        no: ['You want colours to choose from: this listing has one version.', 'You want video: that is the <a href="?id=cs-8" data-model="campsnap-8">CS-8</a>.'] },
      'campsnap-8': { yes: ['You want <b>video</b> with a Super-8 look.', 'You like to film now and watch later: the maker says <b>no playback screen</b>.', 'A gift for someone who keeps a family film.'],
        no: ['You want photos: see <a href="?id=cs2-sunbeam-yellow" data-model="campsnap-2">Camp Snap 2</a>.',
          'You are filming for a channel or a service: see <a href="everyday.html#phone">Start on your phone</a> or the <a href="setups.html#creator-desk">creator desk setup</a>.'] },
    };

    function chooseModel(k, keepColour) {
      const np = PR[k]; if (!np) return;
      const col = keepColour && P[vid] && P[vid].colour;
      prod = np;
      vid = (col && np.variants.find(v => P[v].colour === col)) || np.def;
      picked.clear(); paintAll(true);
    }
    function paintModels() {
      const box = $('#ev-models'); if (!fam) { box.hidden = true; return; }
      box.hidden = false; $('#ev-mcount').textContent = fam.length + ' models';
      $$('label', box).forEach(l => l.remove());
      box.insertAdjacentHTML('beforeend', fam.map(k => { const m = PR[k], d = P[m.def];
        return `<label><input type="radio" name="model" value="${k}"${k === prod.id ? ' checked' : ''}><span class="th"><img src="${d.thumb || d.src}" alt=""></span>
          <span><b>${esc(m.short)}</b><small>${esc(m.does)} · ${m.variants.length > 1 ? 'from ' : ''}${usd(E.minPrice(m))}</small></span><i aria-hidden="true"></i></label>`; }).join(''));
    }
    $('#ev-models').addEventListener('change', e => { if (e.target.name === 'model') { chooseModel(e.target.value, true); $('#live').textContent = PR[e.target.value].title + ', ' + usd(P[vid].usd); } });

    function paintChips() {
      const sw = $('#ev-sw'), vs = prod.variants || [vid];
      if (vs.length < 2) { sw.hidden = true; return; }
      sw.hidden = false;
      $('#ev-chips').innerHTML = vs.map(v => { const p = P[v];
        return `<button type="button" class="ev-chip" role="radio" aria-checked="${v === vid}" tabindex="${v === vid ? 0 : -1}" data-v="${v}" aria-label="${esc(p.colour)}, ${usd(p.usd)}" title="${esc(p.colour)} · ${usd(p.usd)}"><span style="--c:${p.hex}"></span></button>`; }).join('');
      const prices = new Set(vs.map(v => P[v].usd));
      const note = $('#ev-swnote');
      note.hidden = prices.size < 2;
      if (prices.size > 1) { const odd = vs.filter(v => P[v].usd !== mode(vs)); note.textContent = `Prices differ by colour, as listed: ${odd.map(v => P[v].colour + ' ' + usd(P[v].usd)).join(' · ')}.`; }
    }
    const mode = vs => { const c = {}; vs.forEach(v => { c[P[v].usd] = (c[P[v].usd] || 0) + 1; }); return +Object.keys(c).sort((a, b) => c[b] - c[a])[0]; };
    $('#ev-chips').addEventListener('click', e => { const c = e.target.closest('[data-v]'); if (c) pick(c.dataset.v, true); });
    $('#ev-chips').addEventListener('keydown', e => {
      const vs = prod.variants, i = vs.indexOf(vid); let n = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % vs.length; else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + vs.length) % vs.length;
      else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = vs.length - 1; else return;
      e.preventDefault(); pick(vs[n], true); $(`#ev-chips [data-v="${vs[n]}"]`).focus();
    });
    /* hovering a chip warms its photo so the swap is instant */
    $('#ev-chips').addEventListener('pointerover', e => { const c = e.target.closest('[data-v]'); if (c) { const im = new Image(); im.src = P[c.dataset.v].src; } });

    function pick(v, announce) {
      if (!P[v]) return; vid = v; paintVariant();
      $$('#ev-chips [data-v]').forEach(c => { const on = c.dataset.v === v; c.setAttribute('aria-checked', on); c.tabIndex = on ? 0 : -1; });
      if (announce) $('#live').textContent = `${P[v].colour}, ${usd(P[v].usd)}`;
    }

    function paintVariant() {
      const p = P[vid];
      const img = $('#ev-img');
      if (img.getAttribute('src') !== p.src) {
        plate.classList.add('loading');
        const done = () => plate.classList.remove('loading');
        img.onload = done; img.onerror = done;
        img.src = p.src;
        if (img.complete) done();
      }
      img.alt = `${prod.title}${p.colour ? ' in ' + p.colour : ''}, listing photo`;
      plate.classList.toggle('nw', p.white === 0);
      $('#ev-cap').textContent = (p.colour ? p.colour + ' · ' : '') + 'listing photo';
      $('#ev-capn').textContent = (prod.variants || []).length > 1 ? `${prod.variants.indexOf(vid) + 1} of ${prod.variants.length} colours` : p.brand;
      $('#ev-cname').textContent = p.colour || '';
      $('#ev-price').textContent = usd(p.usd);
      const u = $('#ev-url'); u.href = E.listingURL(vid) || '#'; u.textContent = p.colour ? `${p.colour} on i9store.com` : 'This listing on i9store.com';
      u.title = p.title || nm(p);
      $('#bar-img').src = p.thumb || p.src; $('#bar-name').textContent = prod.title; $('#bar-sub').textContent = p.colour || prod.kind || '';
      document.title = `${prod.title}${p.colour ? ' (' + p.colour + ')' : ''} — i9Store USA`;
      try { history.replaceState(null, '', 'product-simple.html?id=' + vid); } catch (e) {}
      paintTotal();
    }

    function paintAddons() {
      const box = $('#ev-addons'), ids = (E.ADDONS[prod.id] || []).filter(k => PR[k]);
      if (!ids.length) { box.hidden = true; box.innerHTML = ''; return; }
      box.hidden = false;
      const stated = ids.filter(k => (PR[k].fits || []).includes(prod.id)), other = ids.filter(k => !stated.includes(k));
      const row = k => { const a = PR[k], cur = picked.get(k) || a.def, p = P[cur], st = stated.includes(k);
        const sel = a.variants.length > 1 ? `<select data-av="${k}" aria-label="${esc(a.title)} colour">${a.variants.map(v => `<option value="${v}"${v === cur ? ' selected' : ''}>${esc(P[v].colour)}</option>`).join('')}</select>` : '';
        return `<label class="ev-add${st ? '' : ' unstated'}"><input type="checkbox" data-addon="${k}"><span class="th"><img src="${p.thumb}" alt=""></span>
          <span><b>${esc(a.title.replace(/^Camp Snap /, ''))}</b><small>${esc(a.fitNote || '')}</small>${sel}</span><span class="price">${usd(p.usd)}</span></label>`; };
      box.innerHTML = `<h2><span>Add to the same order</span><span>Optional</span></h2>${stated.map(row).join('')}${other.length ? `<p class="ev-sub2">Also from Camp Snap · fit not stated</p>${other.map(row).join('')}` : ''}`;
    }
    $('#ev-addons').addEventListener('change', e => {
      const s = e.target.closest('[data-av]'); if (s) { picked.set(s.dataset.av, s.value); const r = s.closest('.ev-add'); $('.th img', r).src = P[s.value].thumb; $('.price', r).textContent = usd(P[s.value].usd); }
      paintTotal();
    });
    const chosenAddons = () => $$('#ev-addons [data-addon]:checked').map(c => { const k = c.dataset.addon; return picked.get(k) || PR[k].def; });
    function paintTotal() {
      const ids = [vid, ...chosenAddons()], sum = ids.reduce((a, id) => a + P[id].usd, 0);
      const btn = $('#ev-add');
      if (!btn.classList.contains('done')) btn.textContent = `Add to bag · ${usd(sum)}`;
      $('#bar-add').textContent = `Add · ${usd(sum)}`;
      $('#ev-now').textContent = ids.length > 1 ? `Buy ${ids.length} now` : 'Buy now';
    }
    function addAll() {
      const ids = [vid, ...chosenAddons()];
      if (!BAG) return 0;
      const p = P[vid];
      return BAG.add(ids.map(id => ({ id, q: 1 })), `Added ${prod.title}${p.colour ? ' · ' + p.colour : ''}${ids.length > 1 ? ' + ' + (ids.length - 1) : ''}`);
    }
    let doneT;
    function confirmAdded(btn) {
      btn.classList.add('done'); btn.textContent = 'Added · in your bag';
      clearTimeout(doneT); doneT = setTimeout(() => { btn.classList.remove('done'); paintTotal(); }, 2400);
    }
    $('#ev-add').addEventListener('click', e => { if (addAll()) confirmAdded(e.currentTarget); });
    $('#bar-add').addEventListener('click', e => { if (addAll()) { const b = e.currentTarget; b.textContent = 'Added'; setTimeout(paintTotal, 1800); } });
    $('#ev-now').addEventListener('click', () => { addAll(); location.href = 'checkout.html'; });

    function paintFit() {
      const f = FIT[prod.id];
      if (f) {
        $('#ev-yn').innerHTML = `<div><h3><span class="tally"></span>Yes, if</h3><ul>${f.yes.map(x => `<li>${x}</li>`).join('')}</ul></div>
          <div><h3 class="no-t"><i aria-hidden="true"></i>Look elsewhere if</h3><ul>${f.no.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
      } else {
        const on = E.SHELVES.filter(s => s.ids.some(id => (prod.variants || [prod.def]).includes(id)));
        $('#ev-yn').innerHTML = `<div><h3><span class="tally"></span>On our shelves for</h3><ul>${on.map(s => `<li><a href="everyday.html#${s.id}">${esc(s.label)}</a>. ${esc(s.line)}</li>`).join('') || '<li>Everyday gear under $300.</li>'}</ul></div>
          <div><h3 class="no-t"><i aria-hidden="true"></i>Look elsewhere if</h3><ul><li>You are equipping a whole room: a church, a studio or a stage. See <a href="index.html#solutions">Solutions</a> and <a href="setups.html">Setups</a>.</li><li>You are not sure it fits what you have. <a href="#">Ask a specialist on WhatsApp</a>.</li></ul></div>`;
      }
      $$('#ev-yn [data-model]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); chooseModel(a.dataset.model, false); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }));
    }

    function paintSheet() {
      const src = s => s === 'brand' ? 'Camp Snap’s site' : 'Listing title';
      const facts = prod.facts || [];
      const p = P[prod.def];
      const rows = facts.length ? facts.map(([k, v, s]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}<small>${esc(s.split(' and ').map(x => x.includes('brand') ? src('brand') : x.startsWith('listing') ? src('listing') + (x.includes('(') ? ' ' + x.slice(x.indexOf('(')) : '') : x).join(' · '))}</small></dd></div>`).join('') + `<div><dt>Sources</dt><dd><small>i9store.com/usa listing titles and campsnapphoto.com, both read 25 Nov 2026. Nothing here is measured by i9.</small></dd></div>`
        : `<div><dt>Listing</dt><dd>${esc(p.brand + ' ' + p.name)}<small>${esc(p.sub || '')}</small></dd></div>`;
      $('#ev-facts').innerHTML = rows + (prod.preorder ? `<div><dt>Listing status</dt><dd>Pre-order<small>The i9 listing address is marked “pré-venda”. We confirm the date before you pay.</small></dd></div>` : '');
      const w = $('#ev-cmpw');
      if (!fam) { w.innerHTML = ''; return; }
      const says = k => (PR[k].facts || []).filter(f => f[2].includes('brand')).map(f => f[1]).slice(0, 3).join(' · ') || 'Screen-free (listing title). The maker’s site does not describe it.';
      w.innerHTML = `<table class="ev-cmp"><caption>The four Camp Snaps we list</caption>
        <thead><tr><th scope="col">Model</th><th scope="col">Makes</th><th scope="col" class="c">What the maker says</th><th scope="col">Price</th><th scope="col"><span class="sr">Choose</span></th></tr></thead>
        <tbody>${fam.map(k => { const m = PR[k], d = P[m.def];
          return `<tr${k === prod.id ? ' class="on"' : ''}><th scope="row"><span class="mth"><span><img src="${d.thumb}" alt=""></span>${esc(m.short)}</span></th>
            <td class="d">${esc(m.does)}<span class="meta-s">${m.variants.length > 1 ? m.variants.length + ' colours' : 'one version'}${m.preorder ? ' · pre-order listing' : ''}</span></td>
            <td class="c">${esc(says(k))}</td><td class="n">${priceRange(m)}</td>
            <td class="btn-c"><button type="button" data-cmp="${k}" aria-pressed="${k === prod.id}">${k === prod.id ? 'Showing' : 'Show'}</button></td></tr>`; }).join('')}</tbody></table>
        <p class="ev-note meta-s">Camp Snap’s own site also shows models we do not list (CS-8 Mini, 110D).</p>`;
    }
    $('#ev-cmpw').addEventListener('click', e => { const b = e.target.closest('[data-cmp]'); if (!b || b.dataset.cmp === prod.id) return; chooseModel(b.dataset.cmp, true); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

    function paintMore() {
      const shelf = E.SHELVES.find(s => s.ids.some(id => (prod.variants || []).includes(id))) || E.SHELVES[0];
      const seen = new Set(), list = [];
      shelf.ids.concat(E.SHELVES[0].ids).forEach(id => { const pr = E.productFor(id); const k = pr ? pr.id : id; if (pr === prod || (fam && pr && pr.family) || seen.has(k)) return; seen.add(k); list.push(id); });
      $('#more-h').textContent = shelf.id === 'gift' ? 'More gifts.' : shelf.label + '.';
      $('#more-tab').textContent = shelf.label;
      $('#more-p').innerHTML = `${esc(shelf.line)} Real listings, prices as listed. <a href="everyday.html#${shelf.id}">See the whole shelf</a>.`;
      $('#ev-more').innerHTML = list.slice(0, 4).map(id => tile(id)).join('');
    }

    function paintAll(modelChanged) {
      const p0 = P[prod.def];
      $('#ev-h1').textContent = prod.title;
      $('#ev-sub').textContent = prod.line || (p0.sub ? p0.sub.charAt(0).toUpperCase() + p0.sub.slice(1) + '.' : '');
      $('#ev-br').textContent = [p0.brand, 'Everyday', p0.dept].join(' · ');
      $('#ev-slate').textContent = prod.family ? 'Camp Snap' : p0.brand;
      $('#ev-crumbs').innerHTML = `<a href="index.html">Home</a><span aria-hidden="true">/</span><a href="everyday.html">Everyday</a><span aria-hidden="true">/</span>${prod.family ? `<a href="everyday.html#camp-snap">Camp Snap</a><span aria-hidden="true">/</span>` : ''}<span aria-current="page">${esc(prod.short || prod.title)}</span>`;
      $('#ev-avail').innerHTML = prod.preorder ? 'Pre-order listing. We confirm the date before you pay. <a href="#">Ask on WhatsApp</a>' : 'Our team confirms stock before you pay. <a href="#">Check on WhatsApp</a>';
      paintModels(); paintChips(); paintAddons(); paintVariant(); paintFit(); paintSheet(); paintMore();
      if (modelChanged && !reduce) $('#ev-img').animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    paintAll(false);

    /* phone: the buy bar shows once the page's own buttons have scrolled away */
    const bar = $('#ev-bar'), acts = $('#ev-acts');
    if ('IntersectionObserver' in window) {
      const phone = matchMedia('(max-width: 699px)');
      new IntersectionObserver(([en]) => {
        const on = !en.isIntersecting && phone.matches;
        bar.classList.toggle('on', on); bar.setAttribute('aria-hidden', !on); $('#bar-add').tabIndex = on ? 0 : -1;
        document.body.classList.toggle('has-bar', phone.matches);
      }, { threshold: 0 }).observe(acts);
    }
  }

  /* ======================= everyday.html ======================= */
  const shelfEl = $('#ev-shelf');
  if (shelfEl) {
    const PRICES = [['any', 'Any price', Infinity], ['50', 'Under $50', 50], ['100', 'Under $100', 100], ['300', 'Under $300', 300]];
    let occ = (location.hash.match(/^#(\w+)/) || [])[1];
    if (!E.SHELVES.some(s => s.id === occ)) occ = 'gift';
    let cap = 'any';
    const bus = $('#ev-bus');
    bus.insertAdjacentHTML('beforeend', E.SHELVES.map(s => `<label><input type="radio" name="occ" value="${s.id}"${s.id === occ ? ' checked' : ''}><span class="n">${s.n}<i aria-hidden="true"></i></span><b>${esc(s.label)}</b></label>`).join(''));
    $('#ev-pricebtns').innerHTML = PRICES.map(([k, l]) => `<button type="button" data-cap="${k}" aria-pressed="${k === cap}">${l}</button>`).join('');
    bus.addEventListener('change', e => { occ = e.target.value; try { history.replaceState(null, '', '#' + occ); } catch (x) {} paint(true); });
    $('#ev-pricebtns').addEventListener('click', e => { const b = e.target.closest('[data-cap]'); if (!b) return; cap = b.dataset.cap; $$('#ev-pricebtns button').forEach(x => x.setAttribute('aria-pressed', x === b)); paint(true); });
    function paint(anim) {
      const s = E.SHELVES.find(x => x.id === occ), max = PRICES.find(p => p[0] === cap)[2];
      const ids = s.ids.filter(id => P[id].usd < max);
      $('#ev-sh').innerHTML = `${esc(s.label)}. <span class="dim">${esc(s.line)}</span>`;
      $('#ev-stab').textContent = s.label;
      $('#ev-sp').textContent = `${ids.length} of ${s.ids.length} on this shelf${cap === 'any' ? '' : ' ' + PRICES.find(p => p[0] === cap)[1].toLowerCase()}. Real listings; prices in USD, before sales tax and shipping. Tap + to add; tap the name for colours and details.`;
      $('#ev-tiles').innerHTML = ids.map(id => tile(id)).join('');
      $('#ev-empty').hidden = !!ids.length;
      $('#live').textContent = `${s.label}: ${ids.length} items`;
      if (anim && !reduce) $('#ev-tiles').animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    $('#ev-empty').addEventListener('click', e => { if (e.target.closest('[data-anyprice]')) $('#ev-pricebtns [data-cap="any"]').click(); });
    paint(false);
    window.addEventListener('hashchange', () => { const h = (location.hash.match(/^#(\w+)/) || [])[1]; if (E.SHELVES.some(s => s.id === h)) { occ = h; $$('input', bus).forEach(i => { i.checked = i.value === h; }); paint(true); } });

    /* the Camp Snap family: four models, one card each */
    $('#ev-famg').innerHTML = E.FAMILY.campsnap.map(k => { const m = PR[k], d = P[m.def];
      return `<a class="ev-famc" href="product-simple.html?id=${m.def}"><span class="ev-plate${d.white === 0 ? ' nw' : ''}"><img src="${d.src}" alt="" loading="lazy"></span>
        <span class="u"><span class="meta">${esc(m.does)}${m.variants.length > 1 ? ' · ' + m.variants.length + ' colours' : ''}</span><b>${esc(m.short)}</b><span>${esc(m.line)}</span>
        <span class="fr"><span class="price">${m.variants.length > 1 ? '<small class="meta-s" style="color:var(--ink-3)">from </small>' : ''}${usd(E.minPrice(m))}</span>${icon('arrow-right')}</span></span></a>`; }).join('');
  }
})();
