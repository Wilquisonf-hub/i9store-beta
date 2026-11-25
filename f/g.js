/* Direction G behaviour.
   Nine solutions ("sources"). The program bus in the hero and the multiview windows below it both cut a source
   to program: hero photo + words + actions, the start-here chain and total, and the picks all re-cut.
   Every product is a real listing (shared/catalog.js + shared/catalog-more.js). Chains are suggested starting
   points, not packages sales has confirmed. Photos are i9's own projects (see DIRECTIONS-B2-D.md, section G). */
(function () {
  const { P, usd } = window.I9;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
  const pdp = id => id === 'ls600d' ? 'product.html' : '#';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SH = '../shared/';

  /* ---------- the nine sources: one source of truth, I9S.SOL in browse-core.js (shared with the menu, setups, shop) ---------- */
  const X = window.I9S || {};
  const S = X.SOL || {}, ORDER = X.ORDER || [];
  const total = k => S[k].chain.reduce((a, id) => a + P[id].usd, 0);
  window.I9G = { S, ORDER, total };

  /* ---------- bag (shared and saved: bag.js) + quote list (in-page counter) ---------- */
  const BAG = window.I9BAG;
  /* Direction H: the quote list is saved ("My plan", I9PLAN in bag.js), so it survives pages and modes. */
  const PLAN = window.I9MYPLAN;
  const counts = { quote: PLAN ? PLAN.count() : +($('#quote-ct')?.textContent || 0) };
  function bumpQuote(n = 1, ids) {
    if (PLAN && ids && ids.length) { PLAN.add(ids); counts.quote = PLAN.count(); }
    else counts.quote += n;
    const el = $('#quote-ct');
    if (el) { el.textContent = counts.quote; el.classList.add('on'); }
    const l = $('#live'); if (l) l.textContent = 'Added to your plan (quote list)';
  }
  let chainIds = () => [];   /* the home page points this at the chain on program */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]'), q = e.target.closest('[data-quote]');
    if (a) {
      const v = a.dataset.add;
      if (v === 'chain') { const ids = chainIds(); if (BAG) BAG.add(ids.map(id => ({ id, q: 1 })), `Added the ${a.dataset.chainName || 'chain'} · ${ids.length} pieces`); }
      else if (P[v]) {
        const qi = a.closest('.acts') && a.closest('.acts').querySelector('.qty input');
        const n = Math.max(1, Math.floor(+(qi ? qi.value : 1) || 1));
        if (BAG) BAG.add([{ id: v, q: n }], `Added ${P[v].brand} ${P[v].name}${n > 1 ? ' ×' + n : ''}`);
      }
      a.classList.add('done'); if (a.classList.contains('add')) a.innerHTML = icon('check'); else a.textContent = 'Added';
    }
    if (q) {
      const v = q.dataset.quote, qi = q.closest('.acts') && q.closest('.acts').querySelector('.qty input');
      const n = Math.max(1, Math.floor(+(qi ? qi.value : 1) || 1));
      const ids = v === 'chain' ? chainIds().map(id => ({ id, q: 1 })) : P[v] ? [{ id: v, q: n }] : [];
      bumpQuote(v === 'chain' ? 5 : ids.length ? n : 1, ids);
      q.classList.add('done'); q.textContent = q.dataset.doneLabel || 'In quote';
    }
  });
  $$('.qty').forEach(q => { const i = $('input', q); $$('button', q).forEach(b => b.addEventListener('click', () => { i.value = Math.max(1, +i.value + (+b.dataset.d)); })); });

  /* ---------- slate tabs: the lit stage that fills most of the viewport is on air ---------- */
  const stages = $$('[data-slate]');
  if (stages.length && 'IntersectionObserver' in window) {
    const vis = new Map();
    const io = new IntersectionObserver(es => {
      es.forEach(en => vis.set(en.target, en.intersectionRatio));
      let best = null, r = 0.15; vis.forEach((v, k) => { if (v > r) { r = v; best = k; } });
      stages.forEach(s => s.classList.toggle('on-air', s === best));
    }, { threshold: [0, .15, .3, .5, .7, 1] });
    stages.forEach(s => io.observe(s));
  }

  /* ---------- product gallery zoom ---------- */
  const main = $('#gal-main'), zb = $('[data-zoom]');
  if (zb && main) zb.addEventListener('click', () => { const on = zb.getAttribute('aria-pressed') !== 'true'; zb.setAttribute('aria-pressed', on); zb.lastElementChild.textContent = on ? 'Fit' : 'Zoom'; main.style.transformOrigin = '58% 40%'; main.style.transform = on ? 'scale(1.7)' : ''; });

  /* ---------- product page: "used in" links back to the home page with that source on program ---------- */
  const used = $('#usedin');
  if (used) {
    const id = used.dataset.id;
    used.innerHTML = ORDER.filter(k => S[k].chain.includes(id) || S[k].picks.includes(id)).map(k =>
      `<li><a href="pro.html#for-${k}">${esc(S[k].label)}<span class="meta-s">${S[k].chain.includes(id) ? 'in the chain' : 'picked'}</span></a></li>`).join('');
  }

  /* ================= checkout: the saved bag, line by line ================= */
  const coLines = $('#co-lines');
  const full = p => p.name.startsWith(p.brand) ? p.name : p.brand + ' ' + p.name;   /* "Camp Snap 2", not "Camp Snap Camp Snap 2" */
  if (coLines && BAG) {
    const paintCo = () => {
      const ls = BAG.lines().filter(l => l.p), n = ls.reduce((a, l) => a + l.q, 0), sum = ls.reduce((a, l) => a + l.p.usd * l.q, 0);
      coLines.innerHTML = ls.map(({ id, q, p }) => `<div class="oline" data-id="${esc(id)}"><span class="pk"><img src="${p.src}" alt=""></span>
        <div><b>${esc(full(p))}</b>${p.sub ? `<span class="s">${esc(p.sub)}</span>` : ''}<span class="q">${p.sku ? esc(p.sku) + ' · ' : ''}×${q}${q > 1 ? ' · ' + usd(p.usd) + ' each' : ''}</span>
        <button type="button" class="co-rm" data-rm="${esc(id)}" aria-label="Remove ${esc(full(p))} from the bag">Remove</button></div>
        <span class="price">${usd(p.usd * q)}</span></div>`).join('');
      $('#co-empty').hidden = ls.length > 0;
      const pcs = n === 1 ? '1 piece' : n + ' pieces';
      $('#co-n').textContent = 'Order · ' + pcs; $('#co-t').textContent = usd(sum);
      $('#co-sub').textContent = usd(sum); $('#co-tot').textContent = usd(sum);
      const pay = $('#co-pay'); pay.textContent = ls.length ? 'Pay ' + usd(sum) : 'Your bag is empty'; pay.disabled = !ls.length;
      /* Everyday-only bag (every line from I9.EVERYDAY): express pay placeholders, no quote / PO line, no organisation
         field, "Keep shopping" back to Everyday. Any Professional line brings the quote route back. */
      const EV = window.I9.EVERYDAY, evOnly = !!(EV && ls.length && ls.every(l => EV.isEveryday(l.id)));
      const xp = $('#xpay'); if (xp) xp.hidden = !evOnly;
      const alt = $('#co-alt'); if (alt) alt.hidden = evOnly;
      $('.co-main')?.classList.toggle('ev-only', evOnly);
      const ks = $('#ord-h a'); if (ks) ks.href = evOnly ? 'everyday.html' : ((window.I9MODE && I9MODE.home()) || 'index.html');
      const em = $('#em'); if (em) em.placeholder = evOnly ? 'you@example.com' : 'you@yourorganization.org';
    };
    coLines.addEventListener('click', e => {
      const r = e.target.closest('[data-rm]'); if (!r) return;
      const p = P[r.dataset.rm]; BAG.remove(r.dataset.rm);
      BAG.say(`Removed ${p ? full(p) : 'the line'}. Bag has ${BAG.count()} pieces.`);
      ($('#co-lines [data-rm]') || $('#co-empty a'))?.focus();
    });
    BAG.onChange(paintCo); paintCo();
  }

  /* ================= pro.html#quote: "My plan", the saved quote list (direction H) ================= */
  const psum = $('#plan-sum');
  if (psum && PLAN) {
    const paintPlan = () => {
      const ls = PLAN.lines().filter(l => l.p), n = ls.reduce((a, l) => a + l.q, 0), sum = ls.reduce((a, l) => a + l.p.usd * l.q, 0);
      psum.hidden = !ls.length;
      psum.innerHTML = ls.length ? `<p class="meta">My plan · ${n} piece${n === 1 ? '' : 's'} · ${usd(sum)} listed</p><ul>${ls.map(({ q, p }) => `<li><span>${esc(full(p))}</span><span class="meta-s">×${q}</span></li>`).join('')}</ul>
        <p class="meta-s">Saved in this browser. A specialist prices it with lead times; nothing is charged from the plan.</p>` : '';
    };
    PLAN.onChange(paintPlan); paintPlan();
  }

  /* ================= home ================= */
  const bus = $('#bus');
  if (!bus) return;

  let cohort = 'church';
  chainIds = () => S[cohort].chain.slice();
  try { cohort = localStorage.getItem('i9g-cohort') || 'church'; } catch (e) {}
  const fromHash = (location.hash.match(/^#for-(\w+)/) || [])[1];
  if (fromHash) cohort = fromHash;
  if (!S[cohort]) cohort = 'church';

  const comp = (ids, cls = '') => `<span class="comp ${cls}">${ids.map(id => `<span><img src="${P[id].src}" alt=""></span>`).join('')}</span>`;

  /* program bus (radio group) */
  bus.insertAdjacentHTML('beforeend', ORDER.map((k, i) =>
    `<label><input type="radio" name="cohort" value="${k}"><span class="n">${String(i + 1).padStart(2, '0')}<i aria-hidden="true"></i></span><b>${esc(S[k].bus)}</b></label>`).join(''));
  bus.insertAdjacentHTML('beforeend', `<a class="spec" href="#"><span class="n meta-s">10 · WhatsApp ${icon('whatsapp-logo')}</span><b>Not sure? Ask a specialist</b></a>`);
  bus.addEventListener('change', e => cut(e.target.value, { from: 'bus' }));

  /* multiview windows */
  $('#mvgrid').innerHTML = ORDER.map((k, i) => { const s = S[k];
    const scr = s.comp ? `<span class="scr lit">${comp(s.comp)}</span>`
      : `<span class="scr"><img src="${SH + s.photo}" alt="" loading="${i < 3 ? 'eager' : 'lazy'}" style="--pos:${s.pos}"></span>`;
    return `<button type="button" class="win${i === 0 ? ' big' : ''}" data-cohort="${k}" aria-pressed="false" aria-describedby="get-${k}">
      ${scr}
      <span class="osd" aria-hidden="true"><span class="src">${String(i + 1).padStart(2, '0')} · ${esc(s.src)}</span><span class="pgm"><span class="tally" style="background:#000"></span>PGM</span></span>
      <span class="umd"><b>${esc(s.label)}</b><span class="get" id="get-${k}">${esc(s.get)}</span>
        <span class="fr meta-s"><span>5 pieces · ${usd(total(k))}</span>${icon('arrow-right')}</span></span>
    </button>`; }).join('');
  $('#mvgrid').addEventListener('click', e => { const w = e.target.closest('.win'); if (w) cut(w.dataset.cohort, { from: 'mv' }); });

  const btns = (k, mode) => {
    const buy = `<button class="btn sm ${mode === 'quote' ? '' : 'solid'}" data-add="${k}">Add to bag</button>`;
    const quote = `<button class="qbtn" data-quote="${k}">Quote</button>`;
    return mode === 'quote' ? quote + buy : buy + quote;
  };

  function paint() {
    const c = S[cohort];
    /* hero = program */
    $('#hero-h').textContent = c.h;
    $('#hero-lede').textContent = c.lede;
    $('#slate-c').textContent = c.label;
    const cta = $('#cta-1'), cta2 = $('#cta-2');
    cta.textContent = c.mode === 'quote' ? 'Request a quote' : 'Shop the ' + c.chainName;
    cta.href = c.mode === 'quote' ? '#quote' : '#chain';
    cta2.firstChild.textContent = c.mode === 'quote' ? 'See the ' + c.chainName + ' ' : 'Request a quote ';
    cta2.href = c.mode === 'quote' ? '#chain' : '#quote';
    const card = $('#pgm'), feed = $('#feed');
    card.classList.toggle('lit', !!c.comp);
    feed.innerHTML = c.comp ? comp(c.comp)
      : `<img id="pgm-img" src="${SH + c.photo}" alt="${esc(c.alt)}" style="--pos:${c.pos}">`;
    if (c.comp) feed.setAttribute('aria-label', 'Packshots of ' + c.comp.map(id => P[id].brand + ' ' + P[id].name).join(', ')), feed.setAttribute('role', 'img');
    else feed.removeAttribute('aria-label'), feed.removeAttribute('role');
    $('#pgm-cap').textContent = c.cap;
    /* bus + windows */
    $$('input', bus).forEach(i => { i.checked = i.value === cohort; });
    $$('.win').forEach(w => w.setAttribute('aria-pressed', w.dataset.cohort === cohort));
    /* chain */
    const Noun = c.chainName[0].toUpperCase() + c.chainName.slice(1);
    $('#chain-m').textContent = 'Start here · ' + c.label;
    $('#chain-h').innerHTML = `The ${esc(c.chainName)}. <span class="dim">${esc(c.path)}, in signal order.</span>`;
    $('#tab-chain').textContent = Noun;
    $('#total').textContent = usd(total(cohort));
    $('#chain-acts').innerHTML = c.mode === 'quote'
      ? `<button class="btn solid" data-quote="chain">Quote all five</button><button class="btn" data-add="chain" data-chain-name="${esc(c.chainName)}">Add all five to bag</button>`
      : `<button class="btn solid" data-add="chain" data-chain-name="${esc(c.chainName)}">Add all five to bag</button><a class="btn" href="#quote">Quote it for my room</a>`;
    $('#path').innerHTML = c.chain.map((k, i) => { const p = P[k]; return `
      <article class="node">${i === 0 ? '<span class="start"><i></i>Start here</span>' : ''}<a class="pk" href="${pdp(k)}" tabindex="-1" aria-hidden="true"><img src="${p.src}" alt="" loading="lazy"></a><span class="sq" aria-hidden="true"></span>
        <p class="job meta">${String(i + 1).padStart(2, '0')} · ${esc(c.jobs[i])}</p><span class="br meta-s">${esc(p.brand)}</span><h3><a href="${pdp(k)}">${esc(p.name)}</a></h3><p class="b">${esc(p.sub)}</p>
        <div class="row"><span class="price">${usd(p.usd)}</span><button class="add" data-add="${k}" aria-label="Add ${esc(p.brand + ' ' + p.name)} to bag">${icon('plus')}</button></div></article>`; }).join('');
    /* picks */
    $('#log-h').textContent = c.picksH + '.';
    $('#log').innerHTML = c.picks.map(k => { const p = P[k];
      return `<div class="lrow"><a class="pk" href="${pdp(k)}" tabindex="-1" aria-hidden="true"><img src="${p.src}" alt="" loading="lazy"></a>
        <div><h3><a href="${pdp(k)}">${esc(p.brand + ' ' + p.name)}</a></h3><span class="b">${esc(p.sub)}</span>
        <div class="rf"><span class="cat meta">${esc(p.cat)}</span><span class="price">${usd(p.usd)}</span><div class="acts">${btns(k, c.mode)}</div></div></div></div>`; }).join('');
    lastLive();
  }

  function cut(k, opt = {}) {
    if (!S[k]) return;
    const changed = k !== cohort; cohort = k;
    try { localStorage.setItem('i9g-cohort', k); } catch (x) {}
    const live = $('#live'); if (live) live.textContent = S[k].label + ' on program. Chain total ' + usd(total(k)) + '.';
    if (opt.from === 'mv') {
      /* a window cut: re-cut, then take the viewer to the start-here row for that source */
      paint(); flash();
      const target = $('#chain');
      requestAnimationFrame(() => target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
      return;
    }
    if (!changed) return;
    if (reduce) { paint(); return; }
    const els = ['#hero-h', '#hero-lede', '#feed', '#path', '#log'].map(s => $(s));
    els.forEach(el => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }));
    setTimeout(() => { paint(); els.forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: i * 40, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' })); }, 150);
  }
  function flash() {
    if (reduce) return;
    ['#path', '#log', '#feed'].forEach((s, i) => $(s).animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 120 + i * 50, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
  }

  /* the signal prints once: nodes light left to right, then only the terminal stays lit */
  function lastLive() { const n = $$('#path .node'); n.forEach((x, i) => x.classList.toggle('live', i === n.length - 1)); }
  paint();
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; io.disconnect();
      const n = $$('#path .node'); n.forEach(x => x.classList.remove('live'));
      n.forEach((x, i) => { setTimeout(() => x.classList.add('live'), 200 * i); setTimeout(() => { if (i < n.length - 1) x.classList.remove('live'); }, 200 * i + 400); }); }), { threshold: .4 });
    io.observe($('#path'));
  }
  window.addEventListener('hashchange', () => { const h = (location.hash.match(/^#for-(\w+)/) || [])[1]; if (h && S[h]) cut(h); });
})();
