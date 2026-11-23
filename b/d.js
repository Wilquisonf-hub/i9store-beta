/* Direction D behaviour: cohort tiles drive the request bubble, the priced chain scene, the lead piece, the shelf and the
   primary action. All products and prices come from the real catalog. The bubble types like heywill's hero; with reduced
   motion it appears at once. */
(function () {
  const { P, C, JOBS, usd } = window.I9;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
  const pdp = id => id === 'ls600d' ? 'product.html' : '#';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const counts = { bag: +($('#bag-ct')?.textContent || 0), quote: +($('#quote-ct')?.textContent || 0) };
  function bump(kind, n = 1) {
    counts[kind] += n; const el = $(kind === 'bag' ? '#bag-ct' : '#quote-ct');
    if (el) { el.textContent = counts[kind]; el.classList.add('on'); }
    const l = $('#live'); if (l) l.textContent = kind === 'bag' ? 'Added to bag' : 'Added to quote list';
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]'), q = e.target.closest('[data-quote]');
    if (a) { bump('bag', a.dataset.add === 'chain' ? 5 : 1); a.classList.add('done'); a.textContent = 'Added'; a.setAttribute('aria-label', 'Added to bag'); }
    if (q) { bump('quote'); q.classList.add('done'); q.textContent = q.classList.contains('q') ? 'Quoted' : 'In quote list'; q.setAttribute('aria-label', 'In quote list'); }
  });
  $$('.qty').forEach(q => { const i = $('input', q); $$('button', q).forEach(b => b.addEventListener('click', () => { i.value = Math.max(1, +i.value + (+b.dataset.d)); })); });

  /* product gallery: one listing photo, fit or zoom */
  const main = $('#gal-main'), zb = $('[data-zoom]'), th = $('.thumbs .th');
  const setZoom = on => { if (!main || !zb) return; zb.setAttribute('aria-pressed', on); zb.lastElementChild.textContent = on ? 'Fit' : 'Zoom'; main.style.transformOrigin = '58% 40%'; main.style.transform = on ? 'scale(1.7)' : ''; };
  if (zb) zb.addEventListener('click', () => setZoom(zb.getAttribute('aria-pressed') !== 'true'));
  if (th) th.addEventListener('click', () => setZoom(false));

  /* home */
  const who = $('#who');
  if (!who) return;
  const ASK = {
    church: 'we stream Sunday service with a volunteer crew. What do we need?',
    broadcast: 'we need studio light, a camera and monitoring, quoted against our PO.',
    production: 'we shoot on location next week. Light, monitoring and crew comms?',
    creator: 'I want better picture and sound on my desk this week.',
    integrator: 'price this install by SKU: control, PTZ, wireless, mixer, switcher.'
  };
  const AV = { church: 'ue20', broadcast: 'bm4k', production: 'ls600d', creator: 'mdr', integrator: 'cuecore' };
  let cohort = 'church';
  try { cohort = localStorage.getItem('i9d-cohort') || 'church'; } catch (e) {}
  if (!C[cohort]) cohort = 'church';
  who.insertAdjacentHTML('beforeend', Object.entries(C).map(([k, v]) =>
    `<label><input type="radio" name="cohort" value="${k}" ${k === cohort ? 'checked' : ''}><span class="av pk" aria-hidden="true"><img src="${P[AV[k]].src}" alt=""></span><span><b>${v.label}</b><small>${v.who}</small></span></label>`).join(''));
  who.addEventListener('change', e => { cohort = e.target.value; try { localStorage.setItem('i9d-cohort', cohort); } catch (x) {} render(true); });

  let typer;
  function type(text) {
    const el = $('#bub-t'); clearInterval(typer);
    if (reduce) { el.textContent = text; return; }
    let i = 0; el.textContent = '';
    typer = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(typer); }, 26);
  }
  const big = (k, mode) => {
    const buy = `<button class="btn lg${mode === 'quote' ? ' hold' : ' act'}" data-add="${k}">Add to bag</button>`;
    const quote = `<button class="btn lg${mode === 'quote' ? ' act' : ' hold'}" data-quote="${k}">Add to quote list</button>`;
    return mode === 'quote' ? quote + buy : buy + quote;
  };

  function render(animate) {
    const c = C[cohort], lead = P[c.chain[0]], J = JOBS[cohort];
    if (animate) type(ASK[cohort]); else $('#bub-t').textContent = ASK[cohort];
    $('#hero-sub').textContent = c.lede;
    const cta = $('#cta-1'), cta2 = $('#cta-2');
    cta.textContent = c.mode === 'quote' ? 'Request a quote' : 'Shop the ' + c.noun + ' chain';
    cta.href = c.mode === 'quote' ? '#ways' : '#lead';
    cta2.textContent = c.mode === 'quote' ? 'See the ' + c.noun + ' chain' : 'Request a quote';
    cta2.href = c.mode === 'quote' ? '#lead' : '#ways';
    const WHO = { church: 'a church', broadcast: 'a station', production: 'a production crew', creator: 'a creator', integrator: 'an install' };
    $('#ans-h').textContent = `A starting chain for ${WHO[cohort]}, in signal order.`;
    $('#ans-list').innerHTML = c.chain.map((k, i) => { const p = P[k]; return `<li><a class="pk" href="${pdp(k)}" tabindex="-1" aria-hidden="true"><img src="${p.src}" alt="" loading="lazy"></a>
      <div><span class="job">${J[i]}</span><a href="${pdp(k)}">${esc(p.name)}</a><span class="br">${esc(p.brand)}</span></div><span class="price">${usd(p.usd)}</span></li>`; }).join('');
    $('#total').textContent = usd(c.chain.reduce((a, k) => a + P[k].usd, 0));
    $('#ans-acts').innerHTML = c.mode === 'quote'
      ? `<a class="btn act" href="#ways">Quote it for my project</a><button class="btn hold" data-add="chain">Add all five</button>`
      : `<button class="btn act" data-add="chain">Add all five to bag</button><a class="btn hold" href="#ways">Quote it for my room</a>`;
    /* lead piece */
    $('#lead-k').textContent = 'Starts the ' + c.noun + ' chain';
    $('#lead-h').textContent = J[0] + '.';
    $('#lead-n').textContent = lead.brand + ' ' + lead.name;
    $('#lead-sub').textContent = lead.sub;
    $('#lead-img').src = lead.src;
    $('#lead-pk').href = pdp(lead.id);
    $('#lead-cap').textContent = lead.brand + ' · ' + lead.cat;
    $('#lead-sku').textContent = lead.sku ? 'SKU ' + lead.sku : 'Listing photo';
    $('#lead-price').textContent = usd(lead.usd);
    $('#lead-acts').innerHTML = big(lead.id, c.mode);
    const nx = P[c.chain[1]];
    $('#lead-facts').innerHTML = [['Department', esc(lead.cat)], ['Next in the chain', `${esc(J[1])}: ${esc(nx.brand)} ${esc(nx.name)}`], ['Ships from', 'Miami, FL'], ['Details', lead.id === 'ls600d' ? '<a href="product.html">Specifications and what’s in the case</a>' : '<a href="#">Product page</a>']]
      .map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('');
    /* shelf */
    $('#picks-h').textContent = c.picksH + '.';
    $('#shelf').innerHTML = c.picks.map(k => { const p = P[k];
      const add = `<button class="btn${c.mode === 'quote' ? ' hold' : ''}" data-add="${k}" aria-label="Add ${esc(p.name)} to bag">Add to bag</button>`;
      const q = `<button class="btn q${c.mode === 'quote' ? '' : ' hold'}" data-quote="${k}" aria-label="Add ${esc(p.name)} to quote list">Quote</button>`;
      return `<article><a class="pk" href="${pdp(k)}" tabindex="-1" aria-hidden="true"><img src="${p.src}" alt="" loading="lazy"></a>
        <span class="br">${esc(p.brand)}</span><h3><a href="${pdp(k)}">${esc(p.name)}</a></h3><p class="s">${esc(p.sub)}</p>
        <div class="row"><span class="price">${usd(p.usd)}</span><span class="acts">${c.mode === 'quote' ? q + add : add + (c.mode === 'both' ? q : '')}</span></div></article>`; }).join('');
    if (animate && !reduce) ['#ans-list', '.lead', '#shelf'].forEach((s, i) => $(s).animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 60 * i, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
  }
  render(false);
  if (!reduce) setTimeout(() => type(ASK[cohort]), 350);
})();
