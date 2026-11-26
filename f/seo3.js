/* Direction H — the ten exemplar intent pages (26 Nov 2026, SEO-PAGINAS-PLANO.md §e.2). Loaded after bag.js / browse-core.js.
   Design only. Nothing here sends, uploads or stores anything outside the existing bag / My plan lists:
   - [data-add="id:q,id:q"]  adds listings to the bag (bag.js), like g.js / setups.js.
   - [data-plan="id:q,…"]    adds them to My plan (the Pro quote list, bag.js I9MYPLAN) and takes you to the page's lead form.
   - form.lead-f             the single lead form the plan asks for (§e.1 #1). On submit it validates, then shows what the
                             Central Comercial would receive (lead code, entry page, ship_to, items, fields) and says plainly
                             that the prototype sent nothing. A file input only shows the chosen file's name.
   - #setup                  the setup page: untick lines, live total, add the selection, kit picture (I9S.mountKit).
   - #taxcalc                the tax-exempt page's estimate (Florida 6% + Miami-Dade 1% surtax on the first $5,000 per item).
   - [data-open-now]         showroom: open / closed now, Mon–Fri 9 am–5 pm Miami time (America/New_York). */
(function () {
  const I9 = window.I9; if (!I9) return;
  const { P, usd } = I9, X = window.I9S || {}, BAG = window.I9BAG, PLAN = window.I9MYPLAN;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PT = /^pt/i.test(document.documentElement.lang || '');
  const T = (en, pt) => PT ? pt : en;
  const say = m => { const l = $('#live'); if (l) { l.textContent = ''; setTimeout(() => { l.textContent = m; }, 30); } };
  const parse = s => String(s || '').split(',').map(x => { const [id, q] = x.split(':'); return { id: id.trim(), q: Math.max(1, Math.floor(+q || 1)) }; }).filter(l => P[l.id]);
  const reduce = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };

  /* ---------- bag + My plan buttons ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]');
    if (a && BAG) { const L = parse(a.dataset.add); if (!L.length) return; const n = BAG.add(L, a.dataset.label || (L.length === 1 ? `Added ${P[L[0].id].brand} ${P[L[0].id].name}` : `Added ${L.reduce((s, l) => s + l.q, 0)} pieces to bag`));
      if (n) { a.classList.add('done'); setTimeout(() => a.classList.remove('done'), 1600); } return; }
    const q = e.target.closest('[data-plan]');
    if (q && PLAN) { const L = parse(q.dataset.plan); if (L.length) PLAN.add(L);
      const f = q.dataset.to ? $(q.dataset.to) : $('form.lead-f'); if (f) { fillItems(f, L); f.closest('section').scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' }); setTimeout(() => { const i = $('input:not([type=hidden]),select,textarea', f); if (i) i.focus({ preventScroll: true }); }, reduce() ? 0 : 420); }
      say(T(`${L.reduce((s, l) => s + l.q, 0)} pieces added to My plan. The quote form below sends the list to the i9 team.`, 'Itens adicionados.'));
      e.preventDefault(); }
  });

  /* ---------- the lead form ---------- */
  function fillItems(f, L) {
    const box = $('.lead-items', f); if (!box) return;
    const cur = parse(f.dataset.items); L.forEach(l => { const c = cur.find(x => x.id === l.id); if (c) c.q = Math.max(c.q, l.q); else cur.push(l); });
    f.dataset.items = cur.map(l => l.id + ':' + l.q).join(','); paintItems(f);
  }
  function paintItems(f) {
    const box = $('.lead-items', f); if (!box) return; const L = parse(f.dataset.items);
    const tot = L.reduce((s, l) => s + P[l.id].usd * l.q, 0);
    box.innerHTML = L.length ? `<p class="meta">${T('Goes with the request', 'Vai junto')} · ${L.length} ${T('lines', 'linhas')}</p><ul>${L.map(l => `<li><span class="q">${l.q}×</span><span>${esc(P[l.id].brand + ' ' + P[l.id].name)}</span><span class="p">${usd(P[l.id].usd * l.q)}</span></li>`).join('')}</ul><p class="meta-s lead-tot"><span>${T('Listed prices, before sales tax and shipping', 'Preços de lista')}</span><b>${usd(tot)}</b></p>` : '';
    box.hidden = !L.length;
  }
  $$('form.lead-f').forEach(f => {
    paintItems(f);
    $$('input[type=file]', f).forEach(inp => inp.addEventListener('change', () => { const o = $('#' + inp.dataset.name, f); if (o) o.textContent = inp.files && inp.files[0] ? inp.files[0].name + T(' · not uploaded (prototype)', ' · não enviado (protótipo)') : T('No file chosen', 'Nenhum arquivo'); }));
    f.addEventListener('submit', e => {
      e.preventDefault();
      let bad = null;
      $$('[required]', f).forEach(el => { const v = el.type === 'checkbox' ? el.checked : String(el.value || '').trim(); const okEmail = el.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim());
        const ok = !!v && okEmail; el.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok && !bad) bad = el; });
      const err = $('.lead-err', f);
      if (bad) { if (err) { err.hidden = false; err.textContent = T('Fill in the marked fields to send this to the i9 team.', 'Preencha os campos marcados.'); } bad.focus(); return; }
      if (err) err.hidden = true;
      const fields = $$('input:not([type=hidden]):not([type=file]),select,textarea', f).filter(el => el.name && (el.type !== 'checkbox' || el.checked) && String(el.value).trim())
        .map(el => [($(`label[for="${el.id}"]`, f) || {}).textContent || el.name, el.type === 'checkbox' ? T('yes', 'sim') : el.value.trim()]);
      const file = $('input[type=file]', f); if (file && file.files && file.files[0]) fields.push([T('Certificate', 'Certificado'), file.files[0].name + T(' (name only)', ' (só o nome)')]);
      const L = parse(f.dataset.items);
      const ctx = [[T('Lead', 'Lead'), f.dataset.lead], [T('Entry page', 'Página de entrada'), f.dataset.page], [T('Market (ship_to)', 'Mercado (ship_to)'), f.dataset.shipTo || 'US']];
      if (L.length) ctx.push([T('Items', 'Itens'), L.map(l => `${l.q}× ${P[l.id].brand} ${P[l.id].name}`).join('; ')]);
      const done = $('.lead-done', f.parentNode);
      done.innerHTML = `<p class="meta"><span class="tally"></span>${T('Prototype · nothing was sent', 'Protótipo · nada foi enviado')}</p>
        <h3>${esc(f.dataset.doneH || T('This is what the i9 team would receive.', 'Isto é o que a equipe i9 receberia.'))}</h3>
        <p>${esc(f.dataset.doneP || T('In the live store this request goes to the i9 team in Central Comercial, and a specialist replies by e-mail.', 'Na loja, o pedido vai para a equipe da i9.'))}</p>
        <dl class="ospec">${ctx.concat(fields).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <button type="button" class="btn sm" data-lead-again>${T('Edit the request', 'Editar')}</button>`;
      done.hidden = false; f.hidden = true; done.setAttribute('tabindex', '-1'); done.focus();
      say(T('Prototype: nothing was sent. The page shows what the i9 team would receive.', 'Protótipo: nada foi enviado.'));
    });
  });
  document.addEventListener('click', e => { const b = e.target.closest('[data-lead-again]'); if (!b) return; const d = b.closest('.lead-done'), f = d.parentNode.querySelector('form.lead-f'); d.hidden = true; f.hidden = false; const i = $('input:not([type=hidden]),select,textarea', f); if (i) i.focus(); });

  /* ---------- the setup page ---------- */
  const setup = $('#setup');
  if (setup) {
    const S = X.SET && X.SET[setup.dataset.setup];
    const rows = $$('.sx-row', setup);
    const tot = () => rows.reduce((a, r) => a + ($('input[data-inc]', r).checked ? +r.dataset.usd * +r.dataset.q : 0), 0);
    const pcs = () => rows.reduce((a, r) => a + ($('input[data-inc]', r).checked ? +r.dataset.q : 0), 0);
    const sel = () => rows.filter(r => $('input[data-inc]', r).checked).map(r => r.dataset.id + ':' + r.dataset.q).join(',');
    function paint() {
      const on = rows.filter(r => $('input[data-inc]', r).checked).length, all = on === rows.length;
      $('#su-total').textContent = usd(Math.round(tot() * 100) / 100);
      $('#su-count').textContent = all ? `Whole setup · ${rows.length} items · ${pcs()} pieces` : `${on} of ${rows.length} items · ${pcs()} pieces`;
      const add = $('#su-add'); add.dataset.add = sel(); add.disabled = !on; add.textContent = !on ? 'Nothing selected' : all ? 'Add the whole setup to bag' : `Add ${pcs()} pieces to bag`;
      const qb = $('#su-quote'); qb.dataset.plan = sel();
      rows.forEach(r => r.classList.toggle('off', !$('input[data-inc]', r).checked));
    }
    setup.addEventListener('change', e => { if (e.target.matches('input[data-inc]')) { paint(); say(`Subtotal ${$('#su-total').textContent}.`); } });
    paint();
    const kit = $('#su-kit');
    if (kit && S && X.mountKit) {
      X.mountKit(kit, S, { hotspots: true });
      kit.addEventListener('click', e => { const h = e.target.closest('.hs'); if (!h) return; const i = +h.dataset.i, r = $('#su-row-' + i);
        $$('.hs', kit).forEach(x => x.setAttribute('aria-pressed', x === h ? 'true' : 'false')); rows.forEach(x => x.classList.toggle('sel', x === r));
        if (r) r.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'nearest' }); });
    }
  }

  /* ---------- tax estimate (Florida 6% + Miami-Dade 1% discretionary surtax on the first $5,000 of each item) ---------- */
  const tc = $('#taxcalc');
  if (tc) {
    const R = { state: 0.06, surtax: 0.01, cap: 5000 };
    const itemTax = (usdv, ex) => ex ? 0 : Math.round((usdv * R.state + Math.min(usdv, R.cap) * R.surtax) * 100) / 100;
    window.I9TAX = { itemTax, R };
    function paint() {
      const ex = $('#tc-ex').checked; let sub = 0, tax = 0;
      $$('tr[data-usd]', tc).forEach(r => { const u = +r.dataset.usd, q = +r.dataset.q, t = itemTax(u, ex) * q; sub += u * q; tax += t; $('.tx', r).textContent = ex ? '$0.00' : usd(t); });
      tax = Math.round(tax * 100) / 100; sub = Math.round(sub * 100) / 100;
      $('#tc-sub').textContent = usd(sub); $('#tc-tax').textContent = ex ? 'Exempt · $0.00' : usd(tax); $('#tc-tot').textContent = usd(Math.round((sub + tax) * 100) / 100);
      $('#tc-flat').textContent = ex ? '' : `A flat 7% would be ${usd(Math.round(sub * 0.07 * 100) / 100)}; the surtax stops at $5,000 per item.`;
    }
    tc.addEventListener('change', paint); paint();
  }

  /* ---------- showroom: open now? ---------- */
  $$('[data-open-now]').forEach(el => {
    function paint() {
      let wd = '', hh = 0, mm = 0;
      try { const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
        parts.forEach(p => { if (p.type === 'weekday') wd = p.value; if (p.type === 'hour') hh = +p.value; if (p.type === 'minute') mm = +p.value; }); } catch (e) { return; }
      const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(wd), t = hh * 60 + mm, open = day && t >= 540 && t < 1020;
      el.dataset.state = open ? 'open' : 'closed';
      el.innerHTML = open ? `<i></i>Open now · until 5 pm Miami time` : `<i></i>Closed now · ${day && t < 540 ? 'opens 9 am today' : 'opens 9 am ' + (wd === 'Fri' || wd === 'Sat' ? 'Monday' : 'tomorrow')} (Miami time)`;
      $$('[data-day]').forEach(d => d.classList.toggle('today', d.dataset.day === wd));
    }
    paint(); setInterval(paint, 60000);
  });
})();
