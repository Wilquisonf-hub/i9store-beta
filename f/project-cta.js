/* Direction H — "Part of a bigger project?" on the Store product pages (owner, 25 Nov: "some CTA that shows the customer
   something like: I'm building a studio, I'm doing a project…").
   Catches a customer buying one piece of something bigger and offers Pro's routes, without pushing: no orange, no modal,
   below the buy box. Store mode only ([data-for="store"]); Pro already has "Add to my plan" on the product page.

   Mount: <div class="pcta" data-pcta data-for="store" [data-id="<listing id>"]></div>. product-simple.html has no data-id:
   the listing is read from ?id= at click time (the page swaps colours with replaceState).
   How clear it is (data-tier):
     hidden  Camp Snap and its accessories (gift line): nothing shows.
     light   an Everyday listing on the gift shelf, or one outside the pro departments (bags, gimbals, phone tripods): one line.
     clear   Cameras, Lenses, Lighting, Audio, Studio (switchers, prompters), Monitoring, or any listing used in a setup.
   Routes (each says where it goes; all land on Pro surfaces, which mode.js switches to Pro by itself):
     studio   the room planner from the setup that uses this listing (planner.html?template=<setup>), else the studio template;
     podcast  the podcast / creator setup that uses it (setups.html#<setup>), else the podcast setups;
     church   the church / events setup that uses it, else the church setups;
     other    pro.html#quote: a specialist, with My plan.
   "Take it along" (on by default, says exactly what it does): the listing goes into My plan (I9MYPLAN, bag.js) with the
   page's quantity, so it is on the list the planner, setups and the specialist see. Nothing else is written. */
(function () {
  const I9 = window.I9, X = window.I9S, PLAN = window.I9MYPLAN;
  const mounts = document.querySelectorAll('[data-pcta]'); if (!I9 || !mounts.length) return;
  const { P } = I9, E = I9.EVERYDAY;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
  const PT = /^pt/i.test(document.documentElement.lang || '');
  const T = (en, pt) => PT ? pt : en;
  const PRO_DEPTS = ['Cameras', 'Lenses', 'Lighting', 'Audio', 'Studio', 'Monitoring'];

  const currentId = m => {
    if (m.dataset.id && P[m.dataset.id]) return m.dataset.id;
    const k = new URLSearchParams(location.search).get('id') || '';
    if (P[k]) return k;
    const pr = E && E.productFor(k); return pr && P[pr.def] ? pr.def : null;
  };
  const setups = id => (X && X.inSetups ? X.inSetups(id) : []);
  function tier(id) {
    const p = P[id]; if (!p) return 'hidden';
    if (p.brand === 'Camp Snap' || /^Camp Snap/.test(p.name)) return 'hidden';
    if (setups(id).length) return 'clear';
    const gift = !!(E && E.SHELVES.some(s => s.id === 'gift' && s.ids.some(x => x === id || (E.productFor(x) || {}).id === (E.productFor(id) || {}).id)));
    if (E && E.isEveryday(id) && (gift || !PRO_DEPTS.includes(p.dept))) return 'light';
    return PRO_DEPTS.includes(p.dept) ? 'clear' : 'light';
  }
  const shortName = p => p.name.length > 22 ? p.name.split(/\s+/).slice(0, 3).join(' ') : p.name;

  function routes(id) {
    const S = setups(id), p = P[id];
    const find = sols => S.find(s => sols.includes(s.sol));
    const uses = s => { const it = s.items.find(i => i.id === id); return it && it.q > 1 ? T(`uses ${it.q}`, `usa ${it.q}`) : T('uses this', 'usa este'); };
    const studio = find(['broadcast', 'corporate', 'creator', 'podcast']);   /* a studio room; a location kit (production) is not one */
    const pod = find(['podcast', 'creator']);
    const church = find(['church', 'events']);
    return [
      { k: 'studio', label: T('I’m building a studio', 'Estou montando um estúdio'),
        href: studio ? 'planner.html?template=' + studio.id : 'planner.html#tpl=studio',
        dest: studio ? T(`Room planner, from “${studio.title}” · ${uses(studio)}`, `Planejador, a partir de “${studio.title}” · ${uses(studio)}`)
                     : T('Room planner, studio template', 'Planejador, modelo de estúdio'), ic: 'presentation' },
      { k: 'podcast', label: T('Podcast or video set', 'Podcast ou set de vídeo'),
        href: pod ? 'setups.html#' + pod.id : 'setups.html?for=podcast',
        dest: pod ? T(`Setup: ${pod.title} · ${uses(pod)}`, `Setup: ${pod.title} · ${uses(pod)}`) : T('Podcast setups, each with its parts list', 'Setups de podcast, com lista de peças'), ic: 'video-camera' },
      { k: 'church', label: T('Church or live events', 'Igreja ou eventos ao vivo'),
        href: church ? 'setups.html#' + church.id : 'setups.html?for=church',
        dest: church ? T(`Setup: ${church.title} · ${uses(church)}`, `Setup: ${church.title} · ${uses(church)}`) : T('Church setups, each with its parts list', 'Setups para igrejas, com lista de peças'), ic: 'broadcast' },
      { k: 'other', label: T('Something else · talk to a specialist', 'Outra coisa · falar com um especialista'),
        href: 'pro.html#quote', dest: T('Send it with your plan, or WhatsApp us', 'Envie com o seu plano, ou WhatsApp'), ic: 'whatsapp-logo' },
    ];
  }

  function render(m) {
    const id = currentId(m), t = tier(id);
    m.dataset.tier = t; m.dataset.for = 'store';
    if (t === 'hidden') { m.hidden = true; m.innerHTML = ''; return; }
    m.hidden = false;
    const p = P[id];
    if (t === 'light') {
      m.innerHTML = `<p class="pcta-lite"><span class="meta">${T('Bigger project?', 'Projeto maior?')}</span><span>${T('See <a href="setups.html" data-route="setups">complete setups</a> or <a href="pro.html#quote" data-route="other">ask a specialist</a>.', 'Veja <a href="setups.html" data-route="setups">setups completos</a> ou <a href="pro.html#quote" data-route="other">fale com um especialista</a>.')}</span></p>`;
      return;
    }
    const R = routes(id);
    m.innerHTML = `<section class="pcta-box" aria-labelledby="pcta-h">
        <div class="pcta-hd"><p class="meta"><span class="tl" aria-hidden="true"></span>${T('i9Store Pro', 'i9Store Pro')}</p>
          <h2 id="pcta-h">${T('Part of a bigger project?', 'Faz parte de um projeto maior?')}</h2>
          <p>${T(`Tell us what the ${esc(shortName(p))} is for. We’ll open the closest plan or setup.`, `Conte para que é o ${esc(shortName(p))}. Abrimos o plano ou setup mais próximo.`)}</p></div>
        <ul class="pcta-r">${R.map((r, i) => `<li><a href="${r.href}" data-route="${r.k}">
          <span class="n meta">0${i + 1}</span><span class="pt"><b>${esc(r.label)}</b><small>${esc(r.dest)}</small></span>${icon('arrow-right')}</a></li>`).join('')}</ul>
        <div class="pcta-ft">
          <label class="pcta-take"><input type="checkbox" checked data-take><span class="box" aria-hidden="true"></span><span>${T(`Take the ${esc(shortName(p))} along: add it to My plan`, `Levar o ${esc(shortName(p))}: adicionar ao Meu plano`)}</span></label>
          <span class="meta-s">${T('Opens i9Store Pro · same bag, same checkout', 'Abre o i9Store Pro · mesma sacola, mesmo checkout')}</span>
        </div>
      </section>`;
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-pcta] [data-route]'); if (!a) return;
    const m = a.closest('[data-pcta]'), take = m.querySelector('[data-take]');
    if (!take || !take.checked || !PLAN) return;   /* the light line carries nothing */
    const id = currentId(m); if (!id) return;
    const qi = document.querySelector('.buy .qty input'), q = Math.max(1, Math.floor(+(qi && qi.value) || 1));
    PLAN.add([{ id, q }]);
  });
  const paintAll = () => mounts.forEach(render);
  paintAll();
  /* product-simple swaps models and colours in place: repaint when the URL's listing changes */
  let last = location.search;
  ['click', 'change', 'popstate'].forEach(ev => window.addEventListener(ev, () => setTimeout(() => { if (location.search !== last) { last = location.search; paintAll(); } }, 0)));
  window.I9PCTA = { tier, routes, paint: paintAll };
})();
