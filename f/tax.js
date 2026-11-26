/* OWNER 25 NOV: tax not included. "i9Store USA sells at the USD price plus Sales Tax, except for customers with a Sales Tax
   Exemption, such as other resellers and religious institutions. The listed price includes neither tax nor shipping."
   Checkout only (checkout.html, after g.js). Design, nothing real:
   - Sales tax reads "Enter ZIP to calculate" until a 5-digit ZIP is typed, then a marked placeholder for the live
     calculation, so the Total reads "subtotal + shipping, + sales tax".
   - US shipping, 26 Nov 2026 (coordinator, relaying the owner; matches Google Merchant Center): free on orders over $500,
     otherwise $25 flat; in-stock items ship in 1–3 business days. Shipping is a real line now and goes into the Total.
     Delivery "about 1–5 business days after it ships" and the 4 pm Miami cutoff are the coordinator's assumptions: they
     appear only as estimates, after the ZIP. [TO CONFIRM] "over $500" read as strictly more than $500.00.
   - "My organization is tax-exempt" (reseller certificate, or 501(c)(3) / religious institution): an upload slot, tax reads
     "Exempt, pending certificate review", and a note says a specialist confirms it before the order ships. The file input
     only shows the chosen file's name on this page: nothing is uploaded, read or stored.
   - Where the option sits: near the top in Pro mode (churches are a key Pro audience) and in direction G (no Store mode,
     G is the Pro language); after Delivery in Store mode, where the address and ZIP are.
   - Ship: the flat rule above (labels still bought through i9's GoShippo integration: FedEx, UPS, USPS), and after the ZIP
     the handling time, the delivery estimate and the cutoff. "Pick up at our Miami showroom" (free): the address fields
     give way to the showroom address, Shipping reads "Pickup · free", and sales tax still applies (unless exempt).
   Strings are EN, with PT kept beside them for <html lang="pt…">. */
(function () {
  const $ = s => document.querySelector(s);
  const box = $('#exempt'), sums = $('#co-sums'); if (!box || !sums) return;
  const PT = /^pt/i.test(document.documentElement.lang || '');
  const T = (en, pt) => PT ? pt : en;
  const S = {
    enter: T('Enter ZIP to calculate', 'Informe o ZIP para calcular'),
    shipFree: T('Free · US order over $500', 'Grátis · pedido acima de US$ 500'),
    shipNone: T('—', '—'),
    dlEnter: T('Appears when your address is in', 'Aparece quando o endereço estiver completo'),
    dlEst: T('About 1–5 business days after it ships · estimate', 'Cerca de 1–5 dias úteis após o envio · estimativa'),
    pickup: T('Pickup · free', 'Retirada · grátis'),
    tax: T('+ sales tax', '+ sales tax'), none: T('exemption pending review', 'isenção em revisão'),
    live: T('Calculated live · not in this prototype', 'Calculado ao vivo · fora deste protótipo'),
    exempt: T('Exempt, pending certificate review', 'Isento, aguardando revisão do certificado'),

    attach: T('Attach your certificate', 'Anexe seu certificado'),
  };
  const on = $('#tx-on'), more = $('#tx-more'), zip = $('#co-zip'), file = $('#tx-file'), fname = $('#tx-fname');
  const say = m => { const l = $('#live') || (() => { const d = document.createElement('div'); d.id = 'live'; d.className = 'sr'; d.setAttribute('aria-live', 'polite'); document.body.appendChild(d); return d; })(); l.textContent = ''; setTimeout(() => { l.textContent = m; }, 30); };

  /* ---------- where the option sits ---------- */
  const modeNow = () => (window.I9MODE && I9MODE.mode) || document.documentElement.dataset.mode || 'pro';
  function place() {
    const pro = modeNow() !== 'store';
    box.classList.toggle('tx-top', pro);
    const intro = $('.co-main .intro'), del = $('#ad') && $('#ad').closest('fieldset');
    if (pro && intro && intro.nextElementSibling !== box) intro.after(box);
    if (!pro && del && del.nextElementSibling !== box) del.after(box);
  }

  /* ---------- US shipping rule (26 Nov 2026): free over $500, otherwise $25 flat; pickup free ---------- */
  const SHIP = { freeOver: 500, flat: 25 };
  const usd = v => (window.I9 && I9.usd) ? I9.usd(v) : '$' + v.toFixed(2);
  let bag = (() => { try { const ls = window.I9BAG ? I9BAG.lines().filter(l => l.p) : []; return { sum: ls.reduce((a, l) => a + l.p.usd * l.q, 0), n: ls.length }; } catch (e) { return { sum: 0, n: 0 }; } })();
  const shipCost = (sum, n, pk) => pk || !n || sum > SHIP.freeOver ? 0 : SHIP.flat;

  /* ---------- the calculated lines and the total ---------- */
  const zipOk = () => /^\d{5}(-\d{4})?$/.test((zip && zip.value || '').trim());
  const method = () => { const r = document.querySelector('input[name="dm"]:checked'); return r ? r.value : 'ship'; };
  function paint() {
    const z = zipOk(), ex = !!(on && on.checked), pk = method() === 'pickup';
    sums.dataset.zip = z ? zip.value.trim().slice(0, 5) : ''; sums.dataset.exempt = ex ? '1' : '0'; sums.dataset.method = pk ? 'pickup' : 'ship';
    const ship = $('#co-ship'), tax = $('#co-tax');
    const free = !pk && bag.n && bag.sum > SHIP.freeOver, cost = shipCost(bag.sum, bag.n, pk);
    ship.textContent = pk ? S.pickup : !bag.n ? S.shipNone : free ? S.shipFree : usd(SHIP.flat); ship.classList.remove('ph'); ship.classList.toggle('free', !!(pk || free));
    sums.dataset.ship = String(cost);
    const tot = usd(Math.round((bag.sum + cost) * 100) / 100); $('#co-tot').textContent = tot; const t2 = $('#co-t'); if (t2) t2.textContent = tot;
    /* pickup: tax is still due, worked out for the showroom's address by the live store */
    const known = z || pk;
    tax.textContent = ex ? S.exempt : known ? S.live : S.enter; tax.classList.toggle('ph', known && !ex); tax.classList.toggle('ex', ex);
    $('#co-totq').textContent = ex ? S.none : S.tax;
    /* the Delivery group: address + carriers for shipping, the showroom card for pickup */
    document.querySelectorAll('.ship-f').forEach(e => { e.hidden = pk; });
    const pu = $('#co-pickup'); if (pu) pu.hidden = !pk;
    const cz = $('#co-cz'), cl = $('#co-cl'), cs = $('#co-cs');
    if (cz) cz.hidden = z; if (cl) cl.hidden = !z; if (cs) cs.hidden = !z;
    const dl = $('#co-dl'); if (dl) dl.textContent = z ? S.dlEst : S.dlEnter;
    document.querySelectorAll('.dm-o').forEach(l => l.classList.toggle('on', l.querySelector('input').checked));
    if (more) more.hidden = !ex;
    box.classList.toggle('on', ex);
  }

  on && on.addEventListener('change', () => { paint(); say(on.checked ? T('Tax-exempt. Attach your certificate. Sales tax: exempt, pending certificate review.', 'Isento. Anexe o certificado. Sales tax: isento, aguardando revisão.') : T('Sales tax will be calculated from your ZIP.', 'O sales tax será calculado pelo seu ZIP.')); });
  document.querySelectorAll('input[name="dm"]').forEach(r => r.addEventListener('change', () => { paint(); say(method() === 'pickup' ? T('Pickup at the Miami showroom. Shipping free; sales tax still applies.', 'Retirada no showroom de Miami. Frete grátis; sales tax se aplica.') : T('Ship to your address. Free over $500, otherwise $25.', 'Envio para o seu endereço. Grátis acima de US$ 500; senão, US$ 25.')); }));
  zip && zip.addEventListener('input', () => { const was = sums.dataset.zip; paint(); if (!!sums.dataset.zip !== !!was) say(sums.dataset.zip ? T('ZIP in. Delivery estimate shown; sales tax is calculated by the live store.', 'ZIP informado.') : S.enter); });
  /* the certificate: show the chosen name only. Nothing is read, uploaded or kept (the input is cleared on the next pick). */
  file && file.addEventListener('change', () => {
    const f = file.files && file.files[0];
    fname.textContent = f ? T('Chosen: ', 'Escolhido: ') + f.name : S.attach;
    box.classList.toggle('has-file', !!f);
    if (f) say(T('Certificate chosen. Not uploaded in this prototype.', 'Certificado escolhido. Não é enviado neste protótipo.'));
  });
  /* deep link from the Store home's trust tile (checkout.html#exempt): open the option */
  if (location.hash === '#exempt' && on) { on.checked = true; }

  document.addEventListener('i9:co-paint', e => { if (e.detail) bag = { sum: +e.detail.sum || 0, n: +e.detail.n || 0 }; paint(); });
  document.addEventListener('i9:mode', () => { place(); });
  place(); paint();
  window.I9TAX = { paint, place, get exempt() { return !!(on && on.checked); }, get zip() { return sums.dataset.zip; }, get method() { return method(); }, SHIP };
})();
