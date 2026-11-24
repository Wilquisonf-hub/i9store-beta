/* Direction F behaviour (identical to E apart from the storage key). B2's base (counters, slate tallies, gallery zoom, cohort router) plus the hybrid hero:
   the router retypes the shopper's request in the orange talkback bubble, then the lit answer sheet re-prices the
   five-line chain, printing down the signal path. Every product and price comes from the real catalog (shared/catalog.js).
   With reduced motion the full request and answer appear at once. */
(function () {
  const { P, C, JOBS, usd } = window.I9;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
  const pdp = id => id === 'ls600d' ? 'product.html' : '#';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* bag + quote list counters */
  const counts = { bag: +($('#bag-ct')?.textContent || 0), quote: +($('#quote-ct')?.textContent || 0) };
  function bump(kind, n = 1) {
    counts[kind] += n; const el = $(kind === 'bag' ? '#bag-ct' : '#quote-ct');
    if (el) { el.textContent = counts[kind]; el.classList.add('on'); }
    const l = $('#live'); if (l) l.textContent = kind === 'bag' ? 'Added to bag' : 'Added to quote list';
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]'), q = e.target.closest('[data-quote]');
    if (a) { bump('bag', a.dataset.add === 'chain' ? 5 : 1); a.classList.add('done'); if (a.classList.contains('add')) a.innerHTML = icon('check'); else a.textContent = 'Added'; }
    if (q) { bump('quote', q.dataset.quote === 'chain' ? 5 : 1); q.classList.add('done'); q.textContent = 'In quote list'; }
  });
  $$('.qty').forEach(q => { const i = $('input', q); $$('button', q).forEach(b => b.addEventListener('click', () => { i.value = Math.max(1, +i.value + (+b.dataset.d)); })); });

  /* slate tabs: the stage that fills most of the viewport is on air */
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

  /* product gallery: one listing photo, fit or zoom */
  const main = $('#gal-main'), zb = $('[data-zoom]');
  const setZoom = on => { if (!main || !zb) return; zb.setAttribute('aria-pressed', on); zb.lastElementChild.textContent = on ? 'Fit' : 'Zoom'; main.style.transformOrigin = '58% 40%'; main.style.transform = on ? 'scale(1.7)' : ''; };
  if (zb) zb.addEventListener('click', () => setZoom(zb.getAttribute('aria-pressed') !== 'true'));
  const th = $('.gal .rail button:not([data-zoom])');
  if (th) th.addEventListener('click', () => setZoom(false));

  /* ---------- home ---------- */
  const router = $('.router');
  if (!router) return;
  const ASK = {
    church: 'we stream Sunday service with a volunteer crew. What do we need?',
    broadcast: 'we need studio light, a camera and monitoring, quoted against our PO.',
    production: 'we shoot on location next week. Light, monitoring and crew comms?',
    creator: 'I want better picture and sound on my desk this week.',
    integrator: 'price this install by SKU: control, PTZ, wireless, mixer, switcher.'
  };
  const WHO = { church: 'a church, light to stream', broadcast: 'a station, quoted by SKU', production: 'a crew on location', creator: 'a desk studio', integrator: 'an install, priced by SKU' };

  let cohort = 'church';
  try { cohort = localStorage.getItem('i9f-cohort') || 'church'; } catch (e) {}
  if (!C[cohort]) cohort = 'church';
  router.innerHTML = `<legend class="meta">Shopping for</legend>` + Object.entries(C).map(([k, v]) =>
    `<label><input type="radio" name="cohort" value="${k}" ${k === cohort ? 'checked' : ''}><b>${v.label}</b><small>${v.who}</small><i aria-hidden="true"></i></label>`).join('');
  router.addEventListener('change', e => { cohort = e.target.value; try { localStorage.setItem('i9f-cohort', cohort); } catch (x) {} render(true); });

  const btns = (k, mode) => {
    const buy = `<button class="btn ${mode === 'quote' ? '' : 'sig'}" data-add="${k}">Add to bag</button>`;
    const quote = `<button class="btn${mode === 'quote' ? ' sig' : ''}" data-quote="${k}">Add to quote list</button>`;
    return mode === 'quote' ? quote + buy : buy + quote;
  };
  const small = (k, mode) => {
    const buy = `<button class="btn sm ${mode === 'quote' ? '' : 'solid'}" data-add="${k}">Add to bag</button>`;
    const quote = `<button class="qbtn" data-quote="${k}">Quote</button>`;
    return mode === 'quote' ? quote + buy : buy + (mode === 'both' ? quote : '');
  };

  /* the request types into the bubble; a hidden ghost of the full text holds the bubble's size so nothing jumps */
  let typer, timers = [];
  const clearT = () => { clearInterval(typer); timers.forEach(clearTimeout); timers = []; };
  function setAsk(text, typeIt, done) {
    $('#ask-sr').textContent = text; $('#ask-ghost').textContent = text;
    const el = $('#ask-t'), bub = $('.bub');
    if (!typeIt || reduce) { el.textContent = text; bub.classList.remove('typing'); done && done(); return; }
    let i = 0; el.textContent = ''; bub.classList.add('typing');
    typer = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(typer); bub.classList.remove('typing'); done && done(); } }, 24);
  }
  const status = (state) => {
    const st = $('#ans-st'); st.dataset.state = state;
    st.lastElementChild.textContent = state === 'listen' ? 'Listening' : state === 'price' ? 'Pricing' : 'Priced · 5 lines';
  };

  function paintAnswer() {
    const c = C[cohort], J = JOBS[cohort];
    $('#ans-src').textContent = 'Example answer · ' + c.label;
    $('#ans-h').textContent = `A starting chain for ${WHO[cohort]}.`;
    $('#ans-list').innerHTML = c.chain.map((k, i) => { const p = P[k]; return `<li${i === 4 ? ' class="term"' : ''}>
      <span class="sq" aria-hidden="true"></span><a class="pk" href="${pdp(k)}" tabindex="-1" aria-hidden="true"><img src="${p.src}" alt="" loading="lazy"></a>
      <div class="tx"><span class="job meta">${String(i + 1).padStart(2, '0')} · ${J[i]}</span><a class="nm" href="${pdp(k)}">${esc(p.name)}</a><span class="br">${esc(p.brand)}</span></div>
      <span class="price">${usd(p.usd)}</span></li>`; }).join('');
    $('#total').textContent = usd(c.chain.reduce((a, k) => a + P[k].usd, 0));
    $('#ans-acts').innerHTML = c.mode === 'quote'
      ? `<button class="btn sig" data-quote="chain">Quote it for my project</button><button class="btn" data-add="chain">Add all five to bag</button>`
      : `<button class="btn sig" data-add="chain">Add all five to bag</button><a class="btn" href="#quote">Quote it for my room</a>`;
  }

  function paintBelow() {
    const c = C[cohort], lead = P[c.chain[0]], J = JOBS[cohort];
    $('#lead-m').textContent = 'Line 1 of the ' + c.noun + ' chain · ' + J[0];
    $('#lead-cat').textContent = lead.cat;
    $('#lead-h').textContent = lead.name;
    $('#lead-who').textContent = lead.brand + ' · ' + lead.sub;
    $('#tab-lead').textContent = lead.brand;
    $('#lead-img').src = lead.src;
    $('#lead-pk').href = pdp(lead.id);
    $('#lead-sku').textContent = lead.sku ? 'SKU ' + lead.sku : lead.brand + ' listing photo';
    $('#lead-price').textContent = usd(lead.usd);
    $('#lead-dl').innerHTML = [['Department', lead.cat], ['Next in chain', J[1] + ': ' + P[c.chain[1]].brand + ' ' + P[c.chain[1]].name], ['Ships from', 'Miami, FL']]
      .map(([t, d]) => `<div><dt>${t}</dt><dd>${esc(d)}</dd></div>`).join('') + (lead.id === 'ls600d' ? `<div><dt>Details</dt><dd><a href="product.html">Specifications and what’s in the case</a></dd></div>` : '');
    $('#lead-acts').innerHTML = btns(lead.id, c.mode);
    $('#log-h').textContent = c.picksH + '.';
    $('#log').innerHTML = c.picks.map(k => { const p = P[k];
      return `<div class="lrow"><a class="pk" href="${pdp(k)}" tabindex="-1" aria-hidden="true"><img src="${p.src}" alt="" loading="lazy"></a>
      <div><h3><a href="${pdp(k)}">${esc(p.name)}</a></h3><span class="b">${esc(p.brand)} · ${esc(p.sub)}</span></div><span class="cat meta">${p.cat}</span>
      <span class="price">${usd(p.usd)}</span><div class="acts">${small(k, c.mode)}</div></div>`; }).join('');
  }

  /* the answer prints down the signal path, one line at a time; only the terminal node stays lit */
  function printDown() {
    const rows = $$('#ans-list li');
    rows.forEach((r, i) => {
      r.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 90 * i, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      timers.push(setTimeout(() => r.classList.add('live'), 90 * i + 120));
      if (i < 4) timers.push(setTimeout(() => r.classList.remove('live'), 90 * i + 520));
    });
    timers.push(setTimeout(() => status('done'), 90 * rows.length + 200));
  }

  function render(animate) {
    clearT();
    const sheet = $('.sheet-a');
    if (!animate || reduce) { setAsk(ASK[cohort], false); paintAnswer(); paintBelow(); status('done'); return; }
    status('listen');
    sheet.classList.add('wait');
    setAsk(ASK[cohort], true, () => {
      status('price');
      timers.push(setTimeout(() => { paintAnswer(); sheet.classList.remove('wait'); printDown(); }, 260));
    });
    /* below the fold follows at once, quietly */
    paintBelow();
    ['.lead', '#log'].forEach((s, i) => $(s).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: 60 * i, fill: 'backwards' }));
  }
  render(false);
  /* first visit: the request types once over the already-priced answer, like a replay */
  if (!reduce) timers.push(setTimeout(() => setAsk(ASK[cohort], true), 450));
})();
