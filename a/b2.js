/* Direction B2 behaviour: cohort router (radio group) drives copy, CTA, chain, lead piece and gear log from the real catalog.
   Slate tabs light their tally while their stage is the one on screen. Gallery thumbs on the product page. */
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
    if (q) { bump('quote'); q.classList.add('done'); q.textContent = 'In quote'; }
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

  /* product gallery */
  const main = $('#gal-main');
  const zb = $('[data-zoom]');
  if (zb && main) zb.addEventListener('click', () => { const on = zb.getAttribute('aria-pressed') !== 'true'; zb.setAttribute('aria-pressed', on); zb.lastElementChild.textContent = on ? 'Fit' : 'Zoom'; main.style.transformOrigin = '58% 40%'; main.style.transform = on ? 'scale(1.7)' : ''; });
  const th = $('.gal .rail button:not([data-zoom])');
  if (th && zb && main) th.addEventListener('click', () => { zb.setAttribute('aria-pressed', 'false'); zb.lastElementChild.textContent = 'Zoom'; main.style.transform = ''; });

  /* home: cohort router */
  const router = $('.router');
  if (!router) return;
  let cohort = 'church';
  try { cohort = localStorage.getItem('i9b2-cohort') || 'church'; } catch (e) {}
  if (!C[cohort]) cohort = 'church';
  router.innerHTML = `<legend class="meta">Shopping for</legend>` + Object.entries(C).map(([k, v]) =>
    `<label><input type="radio" name="cohort" value="${k}" ${k === cohort ? 'checked' : ''}><b>${v.label}</b><small>${v.who}</small><i aria-hidden="true"></i></label>`).join('');
  router.addEventListener('change', e => { cohort = e.target.value; try { localStorage.setItem('i9b2-cohort', cohort); } catch (x) {} render(true); });

  const btns = (k, mode, big) => {
    const b = big ? '' : ' sm';
    const buy = `<button class="btn${b} ${mode === 'quote' ? '' : (big ? 'sig' : 'solid')}" data-add="${k}">Add to bag</button>`;
    const quote = big ? `<button class="btn${b}${mode === 'quote' ? ' sig' : ''}" data-quote="${k}">Add to quote list</button>` : `<button class="qbtn" data-quote="${k}">Quote</button>`;
    return mode === 'quote' ? quote + buy : buy + (mode === 'both' || big ? quote : '');
  };

  function render(animate) {
    const c = C[cohort], lead = P[c.chain[0]];
    const swap = () => {
      $('#hero-h').textContent = cohort === 'church' ? 'Sunday, on air.' : c.h;
      $('#hero-lede').textContent = c.lede;
      $('#slate-c').textContent = c.label;
      const cta = $('#cta-1');
      cta.textContent = c.mode === 'quote' ? 'Request a quote' : 'Shop the ' + c.noun + ' chain';
      cta.href = c.mode === 'quote' ? '#quote' : '#chain';
      $('#cta-2').firstChild.textContent = c.mode === 'quote' ? 'See the ' + c.noun + ' chain ' : 'Request a quote ';
      $('#cta-2').href = c.mode === 'quote' ? '#chain' : '#quote';
      const Noun = c.noun[0].toUpperCase() + c.noun.slice(1);
      $('#chain-h').innerHTML = `The ${c.noun} chain. <span class="dim">Light to stream, in signal order.</span>`;
      $('#tab-chain').textContent = Noun + ' chain';
      $('#path').innerHTML = c.chain.map((k, i) => { const p = P[k]; return `
        <article class="node"><a class="pk" href="${pdp(k)}" tabindex="-1" aria-hidden="true"><img src="${p.src}" alt="" loading="lazy"></a><span class="sq" aria-hidden="true"></span>
          <p class="job meta">${JOBS[cohort][i]}</p><span class="br meta-s">${esc(p.brand)}</span><h3><a href="${pdp(k)}">${esc(p.name)}</a></h3><p class="b">${esc(p.sub)}</p>
          <div class="row"><span class="price">${usd(p.usd)}</span><button class="add" data-add="${k}" aria-label="Add ${esc(p.name)} to bag">${icon('plus')}</button></div></article>`; }).join('');
      $('#total').textContent = usd(c.chain.reduce((a, k) => a + P[k].usd, 0));
      /* lead piece: node 1 of the chain, zoomed */
      $('#lead-m').textContent = 'Starts the ' + c.noun + ' chain · ' + JOBS[cohort][0];
      $('#lead-cat').textContent = lead.cat;
      $('#lead-h').textContent = lead.name;
      $('#lead-who').textContent = lead.brand + ' · ' + lead.sub;
      $('#tab-lead').textContent = lead.brand;
      $('#lead-img').src = lead.src;
      $('#lead-pk').href = pdp(lead.id);
      $('#lead-sku').textContent = lead.sku ? 'SKU ' + lead.sku : lead.brand;
      $('#lead-price').textContent = usd(lead.usd);
      $('#lead-dl').innerHTML = [['Department', lead.cat], ['Next in chain', JOBS[cohort][1] + ': ' + P[c.chain[1]].brand + ' ' + P[c.chain[1]].name],['Ships from', 'Miami, FL']]
        .map(([t, d]) => `<div><dt>${t}</dt><dd>${esc(d)}</dd></div>`).join('') + (lead.id === 'ls600d' ? `<div><dt>Details</dt><dd><a href="product.html">Specifications and what’s in the case</a></dd></div>` : '');
      $('#lead-acts').innerHTML = btns(lead.id, c.mode, true);
      /* gear log */
      $('#log-h').textContent = c.picksH + '.';
      $('#log').innerHTML = c.picks.map(k => { const p = P[k];
        return `<div class="lrow"><a class="pk" href="${pdp(k)}" tabindex="-1" aria-hidden="true"><img src="${p.src}" alt="" loading="lazy"></a>
        <div><h3><a href="${pdp(k)}">${esc(p.name)}</a></h3><span class="b">${esc(p.brand)} · ${esc(p.sub)}</span></div><span class="cat meta">${p.cat}</span>
        <span class="price">${usd(p.usd)}</span><div class="acts">${btns(k, c.mode, false)}</div></div>`; }).join('');
    };
    if (animate && !reduce) {
      const els = ['#hero-h', '#hero-lede', '.lead', '#path', '#log'].map(s => $(s));
      els.forEach(el => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }));
      setTimeout(() => { swap(); els.forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: i * 50, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' })); }, 160);
    } else swap();
  }
  render(false);

  /* the signal prints once: nodes light left to right, then only the terminal stays lit */
  const lastLive = () => $$('#path .node').slice(-1).forEach(n => n.classList.add('live'));
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; io.disconnect();
      $$('#path .node').forEach((n, i) => { setTimeout(() => n.classList.add('live'), 220 * i); setTimeout(() => { if (i < 4) n.classList.remove('live'); }, 220 * i + 420); }); }), { threshold: .4 });
    io.observe($('#path'));
  } else lastLive();
  router.addEventListener('change', () => setTimeout(lastLive, 200));
})();
