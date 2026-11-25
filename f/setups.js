/* Direction G — setups.html. Gallery of complete setups (setups.html, ?for=<solution> filters) and one setup's
   breakdown (setups.html#<setup-id>): the kit picture with numbered hotspots, synced both ways with the grouped parts
   list (what, qty, why), include/exclude per line with a running total, add the whole setup to the bag, quote it,
   open it in the room planner (planner.html?template=<id>, built by another lane). */
(function () {
  const I9 = window.I9, X = window.I9S; if (!I9 || !X) return;
  const { P, usd } = I9, { SOL, ORDER, SETUPS, SET, GROUPS, esc, icon, SH } = X;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desk = matchMedia('(min-width: 1100px)'), phone = matchMedia('(max-width: 699px)');
  const live = p => p.id === 'ls600d' ? 'product.html' : p.path ? 'https://i9store.com/usa/loja/' + p.path : '#';
  const two = n => String(n).padStart(2, '0');
  const say = m => { const l = $('#live'); l.textContent = ''; setTimeout(() => { l.textContent = m; }, 30); };

  /* ---------- gallery ---------- */
  const card = (s, big) => `<a class="sx-card${big ? ' big' : ''}" href="#${s.id}" aria-describedby="g-${s.id}">
      <span class="kit" data-kit="${s.id}"></span>
      <span class="osd" aria-hidden="true"><span class="src">${two(s.n)} · ${esc(SOL[s.sol].short)}</span><span class="sz">${s.size} · ${esc(s.sizeName)}</span></span>
      <span class="umd"><b>${esc(s.title)}</b><span class="get" id="g-${s.id}">${esc(s.lede)}</span>
        <span class="fr meta-s"><span>${s.items.length} items · ${s.pieces} pieces · ${usd(s.total)}</span>${icon('arrow-right')}</span></span></a>`;
  const mountAll = root => $$('[data-kit]', root).forEach(k => { if (!k.dataset.on) { k.dataset.on = 1; X.mountKit(k, SET[k.dataset.kit], { lazy: true }); } });

  const params = new URLSearchParams(location.search);
  let filter = SOL[params.get('for')] ? params.get('for') : '';
  const fs = $('#sx-filter');
  fs.insertAdjacentHTML('beforeend', [['', 'All rooms', SETUPS.length], ...ORDER.map(k => [k, SOL[k].short, X.setupsFor(k).length])]
    .filter(r => r[2]).map(([k, l, n]) => `<label><input type="radio" name="for" value="${k}"${k === filter ? ' checked' : ''}><i aria-hidden="true"></i>${esc(l)}<span class="n">${n}</span></label>`).join(''));
  fs.addEventListener('change', e => { filter = e.target.value; const u = new URL(location.href); filter ? u.searchParams.set('for', filter) : u.searchParams.delete('for'); u.hash = ''; history.replaceState(null, '', u); paintGallery(); say((filter ? SOL[filter].label : 'All rooms') + ': ' + list().length + ' setups'); });
  const list = () => SETUPS.filter(s => !filter || s.sol === filter);
  function paintGallery() {
    const L = list();
    $('#sx-kick').textContent = `Setups · ${SETUPS.length} complete rooms · ${ORDER.length} solutions`;
    const pieces = SETUPS.reduce((a, s) => a + s.items.length, 0), uniq = new Set(SETUPS.flatMap(s => s.items.map(i => i.id))).size;
    $('#sx-stats').innerHTML = `<span><b>${SETUPS.length}</b> setups</span><span><b>${uniq}</b> different live listings</span><span><b>${pieces}</b> numbered lines, each with a reason</span>`;
    $('#sx-grid').innerHTML = L.map((s, i) => card(s, !filter && i === 0)).join('') +
      `<a class="sx-plan" href="planner.html"${!filter ? ' style="grid-column:span 2"' : ''}><span class="meta" style="color:var(--ink-3)">Room planner</span>
        <b>Your room isn’t on the list? Lay it out yourself.</b><p>Start from any setup or an empty room, then send the list to your bag or to a specialist.</p>
        <span class="textlink">Open the room planner ${icon('arrow-right')}</span></a>`;
    mountAll($('#sx-grid'));
  }

  /* ---------- one setup ---------- */
  let S = null, off = new Set(), sel = -1, quoted = false;
  const fig = $('#d-fig'), kit = $('#d-kit'), cardEl = $('#hs-card');
  const lines = () => S.items.filter((_, i) => !off.has(i)).map(it => ({ id: it.id, q: it.q }));
  const sum = () => S.items.reduce((a, it, i) => a + (off.has(i) ? 0 : P[it.id].usd * it.q), 0);
  const pcs = () => S.items.reduce((a, it, i) => a + (off.has(i) ? 0 : it.q), 0);

  function renderDetail(id) {
    S = SET[id]; off = new Set(); sel = -1; quoted = false;
    const sol = SOL[S.sol], sibs = X.setupsFor(S.sol);
    document.title = `${S.title} — setup · i9Store USA`;
    $('#d-crumbs').innerHTML = `<a href="index.html">Home</a><span aria-hidden="true">/</span><a href="setups.html">Setups</a><span aria-hidden="true">/</span><a href="setups.html?for=${S.sol}">${esc(sol.label)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(S.title)}</span>`;
    $('#d-kick').textContent = `Setup ${two(S.n)} · ${sol.label} · size ${S.size}`;
    $('#d-h').textContent = S.title + '.';
    $('#d-lede').textContent = S.lede;
    $('#d-sizes').innerHTML = (sibs.length > 1 ? `<p class="meta">Sizes of this room</p><div class="row">${sibs.map(x => `<a href="#${x.id}"${x.id === S.id ? ' aria-current="page"' : ''}><span class="n">${x.size} · ${x.pieces} pcs<i aria-hidden="true"></i></span><b>${esc(x.sizeName)}</b></a>`).join('')}</div>` : '') +
      `<p class="crew meta-s"><span>Crew <b>${esc(S.crew)}</b></span><span>Items <b>${S.items.length}</b></span><span>Pieces <b>${S.pieces}</b></span></p>`;
    $('#d-slate-n').textContent = 'Setup ' + two(S.n);
    $('#d-slate').textContent = S.title;
    $('#d-osd').textContent = `${two(S.n)} · ${sol.short} · ${S.size}`;
    X.mountKit(kit, S, { hotspots: true });
    $('#d-plan').href = 'planner.html?template=' + S.id;
    $('#d-shop').href = 'shop.html?solution=' + S.sol;
    $('#d-shop').lastChild.textContent = 'Shop all gear for ' + sol.label.toLowerCase();
    $('#d-quote').lastChild.textContent = 'Quote this setup'; $('#d-quote').classList.remove('done');

    /* the list: grouped, numbered in group order */
    const byNo = S.items.map((it, i) => ({ it, i })).sort((a, b) => a.it.no - b.it.no);
    $('#d-list').innerHTML = `<h2 id="d-list-h">The list <span class="meta-s">${S.items.length} items · ${S.pieces} pieces</span></h2>
      <p class="how">Tap a number on the picture to find it here, or a number here to find it in the picture. Untick anything you already own and the total follows.</p>
      ${GROUPS.filter(([g]) => S.items.some(it => it.g === g)).map(([g, gl]) => { const rows = byNo.filter(x => x.it.g === g);
        return `<section class="sx-grp" aria-label="${esc(gl)}"><h3><span>${esc(gl)}</span><span>${rows.reduce((a, x) => a + x.it.q, 0)} pcs</span></h3><ol>${rows.map(({ it, i }) => { const p = P[it.id];
          return `<li class="sx-row" id="row-${i}" data-i="${i}">
            <button type="button" class="sx-num" data-i="${i}" aria-label="Show piece ${it.no} in the picture">${it.no}</button>
            <span class="pk"><img src="${p.src}" alt="" loading="lazy"></span>
            <span class="sx-txt"><span class="br meta-s">${esc(p.brand)}</span><b><a href="${live(p)}">${esc(p.name)}</a></b><span class="why">${esc(it.why)}</span><span class="qq meta-s">${it.q} × ${usd(p.usd)}</span></span>
            <span class="sx-amt"><span class="q meta-s">${it.q} × ${usd(p.usd)}</span><span class="price">${usd(p.usd * it.q)}</span>
              <label class="inc"><input type="checkbox" checked data-inc="${i}"><i aria-hidden="true"></i>In setup<span class="sr"> : ${esc(p.brand + ' ' + p.name)}</span></label>
              <button type="button" class="add" data-add1="${i}" aria-label="Add ${it.q > 1 ? it.q + ' × ' : ''}${esc(p.brand + ' ' + p.name)} to bag">${icon('plus')}</button></span></li>`; }).join('')}</ol></section>`; }).join('')}
      <div class="sx-tot"><span class="meta" id="d-tot-n"></span><span class="price" id="d-tot"></span></div>`;
    paintTotal();

    /* where this goes */
    const ph = sol.photo ? `<figure><img src="${SH + sol.photo}" alt="${esc(sol.alt)}" loading="lazy" style="--pos:${sol.pos}"><figcaption class="meta-s">${esc(sol.cap)}</figcaption></figure>`
      : `<figure class="lit" style="background:var(--stage)"><span class="comp">${sol.comp.map(id => `<span><img src="${P[id].src}" alt="" loading="lazy"></span>`).join('')}</span><figcaption class="meta-s" style="background:none;color:var(--s-ink-3)">${esc(sol.cap)}</figcaption></figure>`;
    const nShop = (I9.BROWSE || []).filter(id => P[id] && X.solTie(id, S.sol)).length;
    $('#d-where').innerHTML = `<div class="wrap">${ph}<div>
      <p class="meta kick"><span class="tally"></span>Where this goes · ${esc(sol.label)}</p>
      <h2 class="h2" id="w-h">${esc(sol.who)}.</h2>
      <p>${sol.photo ? 'The photo is an i9 project for this kind of room, shown for context. The equipment in it is not itemised and is not this list.' : 'There is no i9 project photo for this kind of room yet, so this is three of the setup’s live listings on white.'} Every room is different: send us yours and a specialist sizes the setup, adds cables and mounts, and quotes it.</p>
      <div class="cta"><a class="btn" href="shop.html?solution=${S.sol}">Shop all ${esc(sol.label.toLowerCase())} gear · ${nShop}</a><a class="textlink" href="#">${icon('whatsapp-logo')}Talk to a specialist</a></div></div></div>`;

    /* other setups */
    const others = [...sibs.filter(x => x.id !== S.id), ...SETUPS.filter(x => x.sol !== S.sol)].slice(0, 4);
    $('#d-more').innerHTML = others.map(x => card(x, false)).join('');
    mountAll($('#d-more'));
    closeCard(); paintBar();
  }

  function paintTotal() {
    const n = S.items.length - off.size, t = usd(sum());
    $('#d-count').textContent = off.size ? `${n} of ${S.items.length} items · ${pcs()} pieces` : `Whole setup · ${S.items.length} items · ${S.pieces} pieces`;
    $('#d-total').textContent = t; $('#d-tot').textContent = t;
    $('#d-tot-n').textContent = off.size ? `${n} of ${S.items.length} items · subtotal before tax and shipping` : 'Subtotal, whole setup · before tax and shipping';
    const b = $('#d-addall'); b.classList.remove('done'); b.disabled = !n;
    b.textContent = !n ? 'Nothing selected' : off.size ? `Add ${pcs()} pieces to bag` : 'Add the whole setup';
    $('#bar-n').textContent = off.size ? `${pcs()} pieces selected` : `Whole setup · ${S.pieces} pieces`;
    $('#bar-t').textContent = t; $('#bar-add').textContent = off.size ? `Add ${pcs()} pieces` : 'Add the whole setup';
    $$('.sx-row').forEach(r => r.classList.toggle('off', off.has(+r.dataset.i)));
  }

  /* ---------- hotspot <-> list sync ---------- */
  function select(i, from) {
    if (i === sel && from === 'hs') { clear(); return; }
    sel = i;
    kit.classList.toggle('has-sel', i > -1);
    $$('.kit-i', kit).forEach(el => el.classList.toggle('sel', +el.dataset.i === i));
    $$('.hs', kit).forEach(el => el.setAttribute('aria-pressed', +el.dataset.i === i));
    $$('.sx-row').forEach(r => r.classList.toggle('sel', +r.dataset.i === i));
    if (i < 0) return;
    const row = $('#row-' + i), it = S.items[i], p = P[it.id];
    if (from === 'hs') {
      say(`${it.no}: ${p.brand} ${p.name}, ${it.q} × ${usd(p.usd)}. ${it.why}`);
      if (phone.matches) row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      else { openCard(i); if (desk.matches) row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }
    } else if (from === 'num') {
      closeCard();
      if (!desk.matches) fig.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      say(`Piece ${it.no} highlighted in the picture`);
    } else closeCard();
  }
  function clear() { select(-1); sel = -1; closeCard(); }
  function openCard(i) {
    const it = S.items[i], p = P[it.id], hs = $(`.hs[data-i="${i}"]`, kit);
    const grp = GROUPS.find(g => g[0] === it.g)[1];
    cardEl.innerHTML = `<p class="t meta"><span>${it.no} · ${esc(grp)}</span><button type="button" data-cx aria-label="Close">${icon('x')}</button></p>
      <span class="br meta-s">${esc(p.brand)}</span><h3 id="hs-h">${esc(p.name)}</h3><p>${esc(it.why)}</p>
      <div class="pr"><span class="meta-s">${it.q} × ${usd(p.usd)}</span><span class="price">${usd(p.usd * it.q)}</span></div>
      <div class="acts"><button type="button" class="btn solid" data-card-add="${i}">Add ${it.q > 1 ? it.q : ''} to bag</button><button type="button" class="btn" data-card-row="${i}">In the list</button></div>`;
    cardEl.hidden = false;
    /* place the card beside the piece, never on top of it: right of it, else left, else below/above */
    const fr = fig.getBoundingClientRect(), it2 = $(`.kit-i[data-i="${i}"]`, kit).getBoundingClientRect(), hr = hs.getBoundingClientRect();
    const L = Math.min(it2.left, hr.left) - fr.left, R = it2.right - fr.left, T = Math.min(it2.top, hr.top) - fr.top, B = it2.bottom - fr.top;
    const cw = cardEl.offsetWidth, ch = cardEl.offsetHeight, W = fr.width, H = fr.height, pad = 10;
    let x, y;
    if (R + pad + cw <= W - 6) { x = R + pad; y = T; }
    else if (L - pad - cw >= 6) { x = L - pad - cw; y = T; }
    else { x = (L + R) / 2 - cw / 2; y = B + pad + ch <= H - 6 ? B + pad : T - pad - ch; }
    x = Math.max(6, Math.min(W - cw - 6, x)); y = Math.max(6, Math.min(H - ch - 6, y));
    cardEl.style.left = x + 'px'; cardEl.style.top = y + 'px';
  }
  function closeCard() { cardEl.hidden = true; }

  kit.addEventListener('click', e => {
    const hs = e.target.closest('.hs'); if (hs) { select(+hs.dataset.i, 'hs'); return; }
    const k = e.target.closest('.kit-i'); if (k) { select(+k.dataset.i, 'hs'); return; }
    clear();
  });
  kit.addEventListener('keydown', e => {
    const hs = e.target.closest('.hs'); if (!hs) return;
    const all = $$('.hs', kit).sort((a, b) => S.items[+a.dataset.i].no - S.items[+b.dataset.i].no), i = all.indexOf(hs);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); all[(i + 1) % all.length].focus(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); all[(i - 1 + all.length) % all.length].focus(); }
  });
  cardEl.addEventListener('click', e => {
    if (e.target.closest('[data-cx]')) { const i = sel; clear(); $(`.hs[data-i="${i}"]`, kit)?.focus(); return; }
    const a = e.target.closest('[data-card-add]'); if (a) { const it = S.items[+a.dataset.cardAdd]; X.bag.add([{ id: it.id, q: it.q }], `Added ${P[it.id].brand} ${P[it.id].name}`); a.classList.add('done'); a.textContent = 'Added'; return; }
    const r = e.target.closest('[data-card-row]'); if (r) { const row = $('#row-' + r.dataset.cardRow); row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); $('.sx-num', row).focus({ preventScroll: true }); closeCard(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S && sel > -1) { const i = sel; clear(); $(`.hs[data-i="${i}"]`, kit)?.focus(); } });
  document.addEventListener('pointerdown', e => { if (S && sel > -1 && !e.target.closest('#d-fig, .sx-row, .bx-toast')) clear(); });

  const listEl = $('#d-list');
  listEl.addEventListener('click', e => {
    const n = e.target.closest('.sx-num'); if (n) { select(+n.dataset.i, 'num'); return; }
    const a = e.target.closest('[data-add1]'); if (a) { const it = S.items[+a.dataset.add1]; X.bag.add([{ id: it.id, q: it.q }], `Added ${P[it.id].brand} ${P[it.id].name}`); a.classList.add('done'); a.innerHTML = icon('check'); }
  });
  listEl.addEventListener('change', e => { const c = e.target.closest('[data-inc]'); if (!c) return; const i = +c.dataset.inc; c.checked ? off.delete(i) : off.add(i); paintTotal(); say(`${c.checked ? 'Included' : 'Removed'}. Setup total ${usd(sum())}`); });
  /* hover / focus on a row lights its piece in the picture (fine pointers and keyboard) */
  listEl.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse' || !desk.matches) return; const r = e.target.closest('.sx-row'); if (r && +r.dataset.i !== sel) select(+r.dataset.i, 'row'); });
  listEl.addEventListener('focusin', e => { const r = e.target.closest('.sx-row'); if (r && +r.dataset.i !== sel && !e.target.matches('.sx-num')) select(+r.dataset.i, 'row'); });

  function addAll(btn) {
    const L = lines(); if (!L.length) return;
    X.bag.add(L, off.size ? `Added ${pcs()} pieces from this setup` : `Added the whole setup · ${S.pieces} pieces`);
    [$('#d-addall'), $('#bar-add')].forEach(b => { b.classList.add('done'); b.textContent = 'Added to bag'; });
    setTimeout(paintTotal, 2600);
  }
  $('#d-addall').addEventListener('click', addAll);
  $('#bar-add').addEventListener('click', addAll);
  $('#d-quote').addEventListener('click', e => {
    const q = $('#quote-ct'); if (!quoted) { q.textContent = +q.textContent + pcs(); q.classList.add('on'); quoted = true; }
    const b = e.currentTarget; b.classList.add('done'); b.lastChild.textContent = 'In your quote list'; say(`${pcs()} pieces added to your quote list`);
  });

  /* tablet / phone: a slim add-all bar once the summary has scrolled away */
  let pastSum = false;
  const bar = $('#sx-bar');
  function paintBar() { bar.classList.toggle('on', !!S && pastSum && !desk.matches && !$('#detail').hidden); }
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(en => { pastSum = !en.isIntersecting && en.boundingClientRect.top < 0; paintBar(); })).observe($('#d-sum'));
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { pastSum = false; paintBar(); } })).observe($('.sx-where'));

  /* ---------- routing: #<id> shows one setup, anything else the gallery ---------- */
  function route(first) {
    const id = location.hash.slice(1);
    const isD = !!SET[id];
    $('#gallery').hidden = isD; $('#detail').hidden = !isD;
    if (isD) { renderDetail(id); if (!first || true) { window.scrollTo(0, 0); $('#d-h').focus({ preventScroll: true }); } }
    else { document.title = 'Setups — shop the whole room · i9Store USA'; paintGallery(); if (!first) window.scrollTo(0, 0); S = null; paintBar(); }
  }
  window.addEventListener('hashchange', () => route(false));
  route(true);
  window.I9Setups = { select: i => select(i, 'hs'), state: () => ({ id: S && S.id, sel, off: [...off], total: S ? sum() : 0 }) };
})();
