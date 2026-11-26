/* Direction H — PTZ camera distance / shot-size calculator (ptz-camera-distance-calculator.html). 26 Nov 2026.
   The optics are the room planner's, unchanged (planner.js hfov()/setHfov(), planner-data.js RULES):
     - each PTZ has its published horizontal angle at the wide end (hW) and the tele end (hT), shared/planner-data.js +
       shared/planner-cams.js (manufacturer spec pages; approx:true = tele angle derived, shown "verify");
     - between the ends, tan(HFOV/2) is interpolated on a log scale (z = 0 wide … 1 tele), which hits both ends exactly;
     - frame width at the subject = 2 · d · tan(HFOV/2);
     - shot names come from the frame width: CU ≤ 0.75 m, MCU ≤ 1.25 m, MS ≤ 2.5 m, else WS (RULES.shots), and the
       planner aims for 0.6 / 1.0 / 1.8 m when it frames a CU / MCU / MS (RULES.frameFor).
   Pure functions live in I9PTZCALC (also loaded by tmp-seo3/build.cjs to compute the page's table, and by the test);
   the UI below only runs when the calculator's markup is on the page. Reads I9PLAN read-only; writes nothing to storage. */
(function (root) {
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const FT = 0.3048;
  const RULES0 = { shots: [['cu', 0.75], ['mcu', 1.25], ['med', 2.5], ['wide', Infinity]], frameFor: { cu: 0.6, mcu: 1.0, med: 1.8 }, shoulder: 0.5 };
  const rules = () => (root.I9PLAN && root.I9PLAN.RULES) || RULES0;
  const NAMES = { cu: 'Close-up', mcu: 'Medium close-up', med: 'Medium shot', wide: 'Wide shot' };
  const ABBR = { cu: 'CU', mcu: 'MCU', med: 'MS', wide: 'WS' };
  const WHAT = { cu: 'head and shoulders', mcu: 'chest up', med: 'waist up', wide: 'the whole stage' };

  const M = {
    FT, NAMES, ABBR, WHAT, rules,
    /* horizontal angle at zoom position z (0 = wide end, 1 = tele end) */
    hfov(s, z) { const tw = Math.tan(rad(s.hW / 2)), tt = Math.tan(rad(s.hT / 2)); return 2 * deg(Math.atan(tw * Math.pow(tt / tw, z))); },
    zoomX(s, z) { return Math.pow(s.zoom, z); },
    frame(h, d) { return 2 * d * Math.tan(rad(h / 2)); },
    shot(fw) { return rules().shots.find(x => fw <= x[1])[0]; },
    /* zoom position that gives frame width fw at distance d (< 0: wider than the wide end can go; > 1: tighter than tele) */
    zFor(s, fw, d) { const h = 2 * Math.atan(fw / (2 * d)), tw = Math.tan(rad(s.hW / 2)), tt = Math.tan(rad(s.hT / 2)); return Math.log(Math.tan(h / 2) / tw) / Math.log(tt / tw); },
    /* farthest distance at which the tele end still frames fw */
    maxDist(s, fw) { return fw / (2 * Math.tan(rad(s.hT / 2))); },
    /* nearest distance at which the wide end takes in a width W */
    minDist(s, W) { return W / (2 * Math.tan(rad(s.hW / 2))); },
    /* everything the page shows for one camera at one distance */
    at(s, d) {
      const R = rules(), wide = M.frame(s.hW, d), tight = M.frame(s.hT, d);
      const ladder = ['cu', 'mcu', 'med'].map(k => {
        const fw = R.frameFor[k], z = M.zFor(s, fw, d);
        return { k, fw, z, st: z > 1 ? 'far' : z < 0 ? 'near' : 'ok', x: z > 1 || z < 0 ? null : M.zoomX(s, z) };
      });
      ladder.push({ k: 'wide', fw: wide, z: 0, st: 'ok', x: 1 });
      return { d, wide, tight, tightShot: M.shot(tight), wideShot: M.shot(wide), ladder,
        cuMax: M.maxDist(s, R.frameFor.cu), mcuMax: M.maxDist(s, R.frameFor.mcu), medMax: M.maxDist(s, R.frameFor.med) };
    },
    /* formatting */
    len(m, u, dp) { const v = u === 'ft' ? m / FT : m; const p = dp != null ? dp : (v < 10 ? 2 : v < 100 ? 1 : 0);
      return v.toLocaleString('en-US', { minimumFractionDigits: p, maximumFractionDigits: p }) + (u === 'ft' ? ' ft' : ' m'); },
    x(v) { return (v < 10 ? v.toFixed(1) : Math.round(v)) + '×'; },
  };
  root.I9PTZCALC = M;

  /* ======================= UI (the calculator page only) ======================= */
  const doc = root.document; if (!doc || !doc.getElementById || !doc.getElementById('pc')) return;
  const D = root.I9PLAN, I9 = root.I9; if (!D || !I9) return;
  const $ = s => doc.querySelector(s), $$ = s => [...doc.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const { P, usd } = I9;
  const CAMS = (D.CAMS || []).filter(c => c.fam === 'ptz' && D.PTZ[c.id] && P[c.id]).map(c => c.id);
  ['ue20', 'tail2', 'crn300', 'ue50', 'ue80', 'crn500', 'ue100', 'ue150'].forEach(id => { if (D.PTZ[id] && P[id] && !CAMS.includes(id)) CAMS.push(id); });
  const pdp = p => p.path && p.path.split('/').filter(Boolean).length >= 3 ? 'https://i9store.com/usa/loja/' + p.path : 'shop.html?q=' + encodeURIComponent(p.brand + ' ' + p.name);

  const S = { cam: 'ue20', u: 'ft', d: 15, z: 1 };   /* d is always metres; 15 m ≈ 49 ft, a booth at the back of a mid-size sanctuary */
  const q = new URLSearchParams(root.location.search);
  if (CAMS.includes(q.get('cam'))) S.cam = q.get('cam');
  if (q.get('u') === 'm' || q.get('u') === 'ft') S.u = q.get('u');
  if (+q.get('d') > 0) S.d = Math.min(200, +q.get('d'));

  const sel = $('#pc-cam'), din = $('#pc-d'), zin = $('#pc-z');
  const brands = [...new Set(CAMS.map(id => P[id].brand))];
  sel.innerHTML = brands.map(b => `<optgroup label="${esc(b)}">${CAMS.filter(id => P[id].brand === b).sort((a, c) => P[a].usd - P[c].usd)
    .map(id => `<option value="${id}">${esc(P[id].name)} · ${D.PTZ[id].zoom}× · ${usd(P[id].usd)}${D.PTZ[id].approx ? ' · verify' : ''}</option>`).join('')}</optgroup>`).join('');
  const say = m => { const l = $('#live'); if (l) { l.textContent = ''; setTimeout(() => { l.textContent = m; }, 30); } };

  function readD() {
    const v = parseFloat(String(din.value).replace(',', '.'));
    const ok = isFinite(v) && v > 0 && v <= (S.u === 'ft' ? 650 : 200);
    din.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (ok) S.d = S.u === 'ft' ? v * FT : v;
    return ok;
  }
  const fmtIn = () => { const v = S.u === 'ft' ? S.d / FT : S.d; din.value = String(Math.round(v * 10) / 10); };

  function silhouette(fw, h) {
    /* the frame is fw × h metres; eyes on the upper third (headroom rule), a 1.75 m person, shoulders RULES.shoulder wide */
    const R = M.rules(), sh = R.shoulder || 0.5, eye = h / 3, cx = fw / 2, hr = 0.105, headC = eye + 0.015;
    const neckY = headC + hr * 0.95, shY = neckY + 0.07, feet = eye + 1.62;
    const body = `M${cx - 0.05} ${neckY} L${cx - 0.05} ${shY - 0.03} Q${cx - sh / 2} ${shY - 0.02} ${cx - sh / 2} ${shY + 0.12} L${cx - sh / 2 + 0.02} ${eye + 0.75}
      L${cx - 0.2} ${eye + 0.82} L${cx - 0.17} ${feet} L${cx - 0.03} ${feet} L${cx} ${eye + 0.9} L${cx + 0.03} ${feet} L${cx + 0.17} ${feet} L${cx + 0.2} ${eye + 0.82}
      L${cx + sh / 2 - 0.02} ${eye + 0.75} L${cx + sh / 2} ${shY + 0.12} Q${cx + sh / 2} ${shY - 0.02} ${cx + 0.05} ${shY - 0.03} L${cx + 0.05} ${neckY} Z`;
    const floor = feet < h ? `<rect x="0" y="${feet}" width="${fw}" height="${h - feet}" class="fl"/>` : '';
    return `${floor}<path d="${body}" class="ps"/><circle cx="${cx}" cy="${headC}" r="${hr}" class="ps"/>`;
  }

  function paint(announce) {
    const s = D.PTZ[S.cam], p = P[S.cam], A = M.at(s, S.d), u = S.u;
    const z = S.z, h = M.hfov(s, z), fw = M.frame(h, S.d), cls = M.shot(fw), zx = M.zoomX(s, z);
    $('#pc-zv').textContent = `${M.x(zx)}${z >= 0.999 ? ' · full zoom' : z <= 0.001 ? ' · widest' : ''}`;
    $('#pc-oh').innerHTML = `<span class="tally"></span>${z >= 0.999 ? 'Tightest shot from here' : 'Shot at ' + M.x(zx)}`;
    $('#pc-shot').innerHTML = `${M.NAMES[cls]} <span class="dim">· ${M.len(fw, u)} wide</span>`;
    const reachCU = A.ladder[0].st === 'ok';
    $('#pc-why').textContent = reachCU
      ? `From ${M.len(S.d, u)}, the ${p.brand} ${p.name} frames a head-and-shoulders close-up at about ${M.x(A.ladder[0].x)} of its ${s.zoom}× optical zoom.`
      : A.ladder[0].st === 'near'
        ? `At ${M.len(S.d, u)} the camera is very close: even its widest angle frames tighter than a close-up.`
        : `From ${M.len(S.d, u)}, full zoom (${s.zoom}×) frames ${M.len(A.tight, u)} across: a ${M.NAMES[A.tightShot].toLowerCase()} (${M.WHAT[A.tightShot]}). A close-up needs the camera within ${M.len(A.cuMax, u)}.`;
    $('#pc-ladder').innerHTML = A.ladder.map(L => {
      const lab = L.k === 'wide' ? `widest angle · ${M.len(L.fw, u)} across` : `${M.len(L.fw, u, u === 'ft' ? 1 : 1)} frame · ${M.WHAT[L.k]}`;
      const st = L.st === 'ok' ? `<span class="vd ok"><i></i>${L.k === 'wide' ? '1×' : M.x(L.x)}</span>` : L.st === 'far' ? `<span class="vd bad"><i></i>Too far</span>` : `<span class="vd"><i></i>Too close</span>`;
      return `<li data-k="${L.k}" data-st="${L.st}"><b>${M.ABBR[L.k]}</b><span>${M.NAMES[L.k]}<small class="meta-s">${lab}</small></span>${st}</li>`; }).join('');
    $('#pc-wide').textContent = `${M.len(A.wide, u)} across · ${M.NAMES[A.wideShot].toLowerCase()}`;
    $('#pc-tight').textContent = `${M.len(A.tight, u)} across · ${M.NAMES[A.tightShot].toLowerCase()}`;
    $('#pc-cumax').textContent = `${M.len(A.cuMax, u)} · MCU to ${M.len(A.mcuMax, u)}`;
    $('#pc-ang').innerHTML = `${s.hW}° → ${s.hT}°${s.approx ? ' <span class="ap">tele derived · verify</span>' : ''}`;
    $('#pc-price').innerHTML = `<a href="${pdp(p)}">${esc(p.brand + ' ' + p.name)}</a> · ${usd(p.usd)}`;
    $('#pc-src').innerHTML = `Angles: <a href="${esc(s.src)}" rel="noopener">${esc(p.brand)} spec page</a>${s.read ? ', read ' + esc(s.read) : ''}.${s.approx ? ' ' + esc(s.note || '') : ''}`;

    /* frame preview: what the camera sees, to scale */
    const fh = fw * 9 / 16;
    $('#pc-frame').innerHTML = `<svg viewBox="0 0 ${fw} ${fh}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(M.NAMES[cls])}: the frame is ${esc(M.len(fw, u))} wide at the person">${silhouette(fw, fh)}</svg>`;
    $('#pc-fcap').textContent = `${M.ABBR[cls]} · ${M.len(fw, u)} × ${M.len(fh, u)} at the person · ${M.x(zx)}`;
    /* top view: camera on the left, the person at d, the wide end and the current angle */
    const W = 360, H = 120, x0 = 22, x1 = W - 24, k = (x1 - x0) / S.d, cy = H / 2;
    const half = a => Math.min(cy - 6, Math.tan(rad(a / 2)) * (x1 - x0));
    const hw = half(s.hW), hz = half(h);
    $('#pc-top').innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <path d="M${x0} ${cy} L${x1} ${cy - hw} L${x1} ${cy + hw} Z" class="wd"/>
      <path d="M${x0} ${cy} L${x1} ${cy - Math.max(hz, 0.6)} L${x1} ${cy + Math.max(hz, 0.6)} Z" class="tz"/>
      <line x1="${x0}" y1="${H - 10}" x2="${x1}" y2="${H - 10}" class="dl"/><text x="${(x0 + x1) / 2}" y="${H - 14}" text-anchor="middle">${esc(M.len(S.d, u))}</text>
      <rect x="${x0 - 8}" y="${cy - 6}" width="12" height="12" class="cm"/><circle cx="${x1}" cy="${cy}" r="4.5" class="pr"/></svg>`;

    /* cameras on the store that reach a close-up (and an MCU) from here */
    const reach = CAMS.filter(id => M.maxDist(D.PTZ[id], M.rules().frameFor.cu) >= S.d).sort((a, b) => P[a].usd - P[b].usd);
    const mcu = CAMS.filter(id => !reach.includes(id) && M.maxDist(D.PTZ[id], M.rules().frameFor.mcu) >= S.d).sort((a, b) => P[a].usd - P[b].usd);
    const li = id => `<li><a href="${pdp(P[id])}">${esc(P[id].brand + ' ' + P[id].name)}</a><span class="meta-s">${D.PTZ[id].zoom}× · CU to ${esc(M.len(M.maxDist(D.PTZ[id], M.rules().frameFor.cu), u, 1))}</span><span class="price">${usd(P[id].usd)}</span></li>`;
    $('#pc-reach').innerHTML = reach.length
      ? `<p class="meta"><span class="tally"></span>PTZ cameras that frame a close-up from ${esc(M.len(S.d, u))}</p><ul>${reach.slice(0, 6).map(li).join('')}</ul>`
      : `<p class="meta"><span class="tally"></span>No PTZ in this list frames a close-up from ${esc(M.len(S.d, u))}</p>${mcu.length ? `<p class="meta-s rq">These reach a medium close-up (chest up):</p><ul>${mcu.slice(0, 6).map(li).join('')}</ul>` : '<p class="meta-s rq">Move a camera closer to the stage, or use a camera with an interchangeable long lens (the room planner has them).</p>'}`;
    $('#pc-reach').hidden = false;
    const hl = id => `planner.html#tpl=church`;
    $('#pc-plan').setAttribute('href', hl(S.cam));
    if (announce) say(`${p.brand} ${p.name} at ${M.len(S.d, u)}: ${M.NAMES[cls]}, ${M.len(fw, u)} wide.`);
    try { const url = new URL(root.location.href); url.searchParams.set('cam', S.cam); url.searchParams.set('d', String(Math.round(S.d * 100) / 100)); url.searchParams.set('u', S.u); root.history.replaceState(null, '', url.pathname.split('/').pop() + url.search + url.hash); } catch (e) {}
  }

  sel.value = S.cam; fmtIn(); zin.value = String(Math.round(S.z * 1000));
  $$('[data-pu]').forEach(b => b.setAttribute('aria-pressed', b.dataset.pu === S.u ? 'true' : 'false'));
  $$('.pc-u').forEach(e => { e.textContent = S.u; });
  sel.addEventListener('change', () => { S.cam = sel.value; paint(true); });
  din.addEventListener('input', () => { if (readD()) paint(false); });
  din.addEventListener('change', () => { if (readD()) paint(true); });
  zin.addEventListener('input', () => { S.z = +zin.value / 1000; paint(false); });
  $$('[data-pu]').forEach(b => b.addEventListener('click', () => { if (S.u === b.dataset.pu) return; S.u = b.dataset.pu; $$('[data-pu]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); $$('.pc-u').forEach(e => { e.textContent = S.u; }); fmtIn(); paint(true); }));
  $$('[data-try]').forEach(b => b.addEventListener('click', () => { const [cam, d] = b.dataset.try.split('@'); if (!CAMS.includes(cam)) return; S.cam = cam; S.d = +d; S.z = 1; sel.value = cam; zin.value = '1000'; fmtIn(); din.setAttribute('aria-invalid', 'false'); paint(true); $('#pc').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }));
  root.I9PTZCALC.ui = { get state() { return { ...S }; }, set(o) { Object.assign(S, o); if (o.cam) sel.value = o.cam; if (o.d != null || o.u) fmtIn(); if (o.z != null) zin.value = String(Math.round(o.z * 1000)); $$('[data-pu]').forEach(x => x.setAttribute('aria-pressed', x.dataset.pu === S.u ? 'true' : 'false')); paint(false); }, CAMS };
  paint(false);
})(typeof window !== 'undefined' ? window : globalThis);
