/* i9Store Pro — LED wall quick calculator (direction H, led-wall-calculator.html). Vanilla JS.
   Reads ../shared/led-data.js (window.I9LED) READ-ONLY and uses the SAME rules as the configurator (led-wizard.js):
     - minimum viewing distance = 1 m per mm of pitch, comfortable = 3 m per mm (i9's pixel-pitch calculator);
     - suggested pitch = the largest generic pitch for the environment that is <= min(closest, typical / 3),
       capped under 2.6 mm (<= 2.5) for on-camera uses (broadcast / XR);
     - whole cabinets: floor(space / cabinet) per axis ("fill") or the grid nearest 16:9 that fits ("169");
     - pixels per cabinet = round(cabinet mm / pitch), computed until the factory confirms the module resolution;
     - an i9 model built on one cabinet always uses it (COB 1.86: 640 x 480 mm; 1.96 XR: 496 x 496 mm);
     - no processor ports or models here: the processor plan (model, count, ports, receiving cards) is in the
       configurator behind a free project account (owner's lead-gate decision, 25 Nov). The page only explains the
       per-port pixel rule in general terms.
   led-wizard.js cannot be loaded here (it renders into led.html's DOM), so the few functions are restated below with
   the wizard's names; tmp-seo/seo-test.cjs checks both give the same numbers for the same answers.
   window.I9LEDCALC is the pure part (also loaded by the test in node); the UI mounts only if #lc exists. */
(function () {
  'use strict';
  const L = window.I9LED; if (!L) return;
  const FT = 3.28084;
  const NAMED = [[16 / 9, '16:9'], [4 / 3, '4:3'], [21 / 9, '21:9'], [32 / 9, '32:9'], [1, '1:1'], [9 / 16, '9:16'], [2, '2:1'], [3, '3:1'], [3 / 4, '3:4']];
  const nf = (v, d) => (+v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const n0 = v => Math.round(v).toLocaleString('en-US');
  const pitchTxt = p => nf(p, (String(p).split('.')[1] || '').length);

  /* ---------- the configurator's rules (led-wizard.js, same names) ---------- */
  const I9M = L.I9_MODELS.concat(L.I9_MODELS_MORE);
  const minDist = p => p * 1, comfDist = p => p * 3;
  function verdict(p, d) {
    if (!(d > 0)) return { k: 'none', t: 'Set a distance' };
    if (d < minDist(p)) return { k: 'bad', t: 'pixels show' };
    if (d < comfDist(p)) return { k: 'mid', t: 'acceptable' };
    return { k: 'ok', t: 'comfortable' };
  }
  function suggest(z) {
    const list = L.GENERIC[z.env] || L.GENERIC.in;
    let lim = Math.min(z.dc, z.dt / 3); const cam = !!(z.use && L.USES[z.use] && L.USES[z.use].camera);
    if (cam) lim = Math.min(lim, 2.5);
    const ok = list.filter(p => p <= lim + 1e-9);
    return { p: ok.length ? ok[ok.length - 1] : list[0], lim, cam, none: !ok.length };
  }
  function modelById(id) {
    if (!id) return null;
    const m = I9M.find(x => x.id === id); if (m) return m;
    const g = /^g-(\d+(?:\.\d+)?)$/.exec(id); if (!g) return null;
    const p = +g[1]; if (!(p > 0.3 && p < 40)) return null;
    return { id, maker: 'generic', name: 'P' + g[1], pitch: p };
  }
  function modelMiss(m, z) {
    if (!m || m.maker !== 'i9') return '';
    if (!m.env.includes(z.env)) return m.env.includes('in') ? 'made for indoor use' : 'made for outdoor use';
    if (z.rent && m.install && !m.install.includes('rental')) return 'made for fixed installs, not rental';
    if (!z.rent && m.install && !m.install.includes('fixed')) return 'made for rental';
    return '';
  }
  const cabById = id => L.CABINETS.find(c => c.id === id) || null;
  const modelCab = m => m && m.cabinet ? (L.CABINETS.find(c => c.w === m.cabinet.w && c.h === m.cabinet.h) || { id: m.cabinet.id, w: m.cabinet.w, h: m.cabinet.h, name: `${m.cabinet.w} × ${m.cabinet.h}`, own: true }) : null;
  function cabsFor(z) { const want = z.rent ? 'rental' : z.mount; return L.CABINETS.filter(c => c.fit.includes(want) && c.env.includes(z.env)); }
  function fit(sw, sh, cab, mode) {
    const mc = Math.max(1, Math.floor(sw * 1000 / cab.w + 1e-6)), mr = Math.max(1, Math.floor(sh * 1000 / cab.h + 1e-6));
    let cols = mc, rows = mr;
    if (mode === '169') {
      let best = null;
      for (let c = 1; c <= mc; c++) for (let r = 1; r <= mr; r++) {
        const s = Math.abs(Math.log((c * cab.w) / (r * cab.h) / (16 / 9))), a = c * r;
        if (!best || s < best.s - 1e-9 || (Math.abs(s - best.s) < 1e-9 && a > best.a)) best = { s, a, c, r };
      }
      cols = best.c; rows = best.r;
    }
    const W = cols * cab.w / 1000, H = rows * cab.h / 1000;
    return { cols, rows, W, H, mx: Math.max(0, sw - W), my: Math.max(0, sh - H), tooSmall: sw * 1000 < cab.w - 1e-6 || sh * 1000 < cab.h - 1e-6 };
  }
  const ratioTxt = (w, h) => { const r = w / h, nm = NAMED.find(([v]) => Math.abs(r / v - 1) < 0.03); return nf(r, 2) + ':1' + (nm ? ' · near ' + nm[1] : ''); };

  /* ---------- state: the answers, in metres ---------- */
  const DEF = () => ({ use: 'church', env: 'in', sw: 5, sh: 3, dc: 4, dt: 10, m: '', cab: '', fit: 'fill', u: 'm' });
  function norm(z) {
    const d = DEF(), o = { ...d, ...z };
    o.use = L.USES[o.use] ? o.use : d.use;
    o.env = o.env === 'out' ? 'out' : 'in';
    const U = L.USES[o.use]; o.mount = U.mount; o.rent = U.rent;
    if (o.rent && o.mount === 'wall') o.mount = 'ground';
    ['sw', 'sh'].forEach(k => { o[k] = Math.min(100, Math.max(0.3, +o[k] || d[k])); });
    o.dc = Math.min(300, Math.max(0.5, +o.dc || d.dc)); o.dt = Math.min(300, Math.max(o.dc, +o.dt || d.dt));
    const m = modelById(o.m);
    if (!m || modelMiss(m, o) || (m.maker === 'generic' && !(L.GENERIC[o.env] || []).includes(m.pitch))) o.m = '';
    o.fit = o.fit === '169' ? '169' : 'fill'; o.u = o.u === 'ft' ? 'ft' : 'm';
    const own = modelCab(modelById(o.m));
    if (own) o.cab = own.id;
    else if (!cabById(o.cab) || !cabById(o.cab).env.includes(o.env)) o.cab = (cabsFor(o)[0] || L.CABINETS.find(c => c.env.includes(o.env))).id;
    return o;
  }
  /* everything the wall comes to (one flat screen) */
  function calc(zIn) {
    const z = norm(zIn), sg = suggest(z);
    const m = modelById(z.m) || modelById('g-' + sg.p);
    const cab = modelCab(m) || cabById(z.cab);
    const pitch = m.pitch, pxc = [Math.round(cab.w / pitch), Math.round(cab.h / pitch)];
    const f = fit(z.sw, z.sh, cab, z.fit), pxW = f.cols * pxc[0], pxH = f.rows * pxc[1];
    const cabs = f.cols * f.rows, px = pxW * pxH;
    const input = pxW <= 1920 && pxH <= 1080 ? 'hd' : pxW <= 3840 && pxH <= 2160 ? 'uhd' : 'big';
    return { z, sg, m, auto: !modelById(z.m), cab, pitch, pxc, ...f, pxW, pxH, cabs, px, area: f.W * f.H, ratio: ratioTxt(f.W, f.H),
      input, vc: verdict(pitch, z.dc), vt: verdict(pitch, z.dt) };
  }
  /* the configurator link: led.html#l=<base64url JSON>, the wizard's own format (hashOf / readHash in led-wizard.js);
     opens on step 5 (cabinets) with the answers filled; the pitch is the chosen model or the suggested generic pitch */
  const b64e = s => (typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(s))) : Buffer.from(s, 'utf8').toString('base64')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  function wizState(zIn) {
    const C = calc(zIn), z = C.z;
    return { s: 5, mx: 5, use: z.use, env: z.env, mount: z.mount, rent: z.rent, lay: 'single', sw: z.sw, sh: z.sh, dc: z.dc, dt: z.dt, u: z.u, m: C.m.id, cab: C.cab.id, fit: z.fit };
  }
  const wizHref = zIn => 'led.html#l=' + b64e(JSON.stringify(wizState(zIn)));

  window.I9LEDCALC = { DEF, norm, calc, suggest, verdict, fit, modelById, modelMiss, modelCab, cabsFor, ratioTxt, wizState, wizHref, FT, pitchTxt };

  /* ======================= UI (led-wall-calculator.html #lc) ======================= */
  if (typeof document === 'undefined') return;
  const root = document.getElementById('lc'); if (!root) return;
  const $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let Z = norm({});
  /* ?use=church etc. prefills the use (links from the solution pages) */
  try { const q = new URLSearchParams(location.search); if (L.USES[q.get('use')]) Z = norm({ ...Z, use: q.get('use'), env: L.USES[q.get('use')].env, sw: L.USES[q.get('use')].sw, sh: L.USES[q.get('use')].sh, dc: L.USES[q.get('use')].dc, dt: L.USES[q.get('use')].dt }); } catch (e) {}

  const toU = m => Z.u === 'ft' ? m * FT : m, fromU = v => Z.u === 'ft' ? v / FT : v;
  const numIn = m => String(Math.round(toU(m) * 100) / 100);
  const lenTxt = (m, d = 1) => Z.u === 'ft' ? nf(m * FT, d === 0 ? 0 : 1) + ' ft' : nf(m, d) + ' m';
  const dimTxt = (w, h) => Z.u === 'ft' ? `${nf(w * FT, 1)} × ${nf(h * FT, 1)} ft` : `${nf(w, 2)} × ${nf(h, 2)} m`;
  const areaTxt = a => Z.u === 'ft' ? nf(a * FT * FT, 0) + ' sq ft' : nf(a, 1) + ' m²';

  const LEN = { 'lc-sw': ['sw', 0.3, 100], 'lc-sh': ['sh', 0.3, 100], 'lc-dc': ['dc', 0.5, 300], 'lc-dt': ['dt', 0.5, 300] };
  function paintInputs() {
    Object.keys(LEN).forEach(id => { const i = $('#' + id); if (i && document.activeElement !== i) i.value = numIn(Z[LEN[id][0]]); });
    $$('.num-in .u').forEach(u => { u.textContent = Z.u; });
    $$('[data-u]').forEach(b => b.setAttribute('aria-pressed', b.dataset.u === Z.u));
    $$('[data-env]').forEach(b => b.setAttribute('aria-pressed', b.dataset.env === Z.env));
    $$('[data-fit]').forEach(b => b.setAttribute('aria-pressed', b.dataset.fit === Z.fit));
    $('#lc-use').value = Z.use;
    /* panel options: suggested generic, i9 models (disabled with the reason when they don't suit), generic pitches */
    const sg = suggest(Z);
    const i9 = I9M.map(m => { const miss = modelMiss(m, Z); return `<option value="${m.id}"${miss ? ' disabled' : ''}>i9 ${esc(m.name)} · ${pitchTxt(m.pitch)} mm${miss ? ' (' + esc(miss) + ')' : ''}</option>`; }).join('');
    const gen = (L.GENERIC[Z.env] || []).map(p => `<option value="g-${p}">${pitchTxt(p)} mm generic${p === sg.p ? ' · suggested' : ''}</option>`).join('');
    $('#lc-m').innerHTML = `<option value="">Suggested for my distances (${pitchTxt(sg.p)} mm)</option><optgroup label="i9 manufactured">${i9}</optgroup><optgroup label="Generic pitch · ${Z.env === 'out' ? 'outdoor' : 'indoor'}">${gen}</optgroup>`;
    $('#lc-m').value = Z.m;
    const own = modelCab(modelById(Z.m));
    $('#lc-cab').innerHTML = own ? `<option value="${own.id}">${own.w} × ${own.h} mm · this model’s cabinet</option>` :
      L.CABINETS.filter(c => c.env.includes(Z.env)).map(c => `<option value="${c.id}">${esc(c.name)} mm${c.fit.includes('rental') ? ' · rental' : ''}</option>`).join('');
    $('#lc-cab').value = Z.cab; $('#lc-cab').disabled = !!own;
  }
  function elevation(C) {
    /* text is sized in viewBox units: k maps 1 screen px to metres for a ~640 px (phone ~330 px) wide drawing; the right
       pad grows until the height label fits */
    const sw = C.z.sw, sh = C.z.sh, maxH = Math.max(sh, 1.9), left = 1.3, padT = maxH * 0.16 + 0.25, padB = maxH * 0.22 + 0.35;
    const px0 = window.innerWidth < 700 ? 330 : 640;
    let padR = 0.35, VW, k;
    for (let i = 0; i < 3; i++) { VW = left + sw + padR; k = Math.max(VW / px0, (padT + maxH + padB) / 300); padR = Math.max(0.35, 12 * k * 4.8); }
    const VH = padT + maxH + padB, fs = 12 * k, base = padT + maxH;
    const wx = left + (sw - C.W) / 2, wy = base - C.H - (sh - C.H) / 2, f = v => +v.toFixed(3);
    let s = `<svg class="elev" viewBox="0 0 ${f(VW)} ${f(VH)}" role="img" aria-label="Front view: ${C.cols} by ${C.rows} cabinets, ${esc(dimTxt(C.W, C.H))}, inside a ${esc(dimTxt(sw, sh))} space, with a 1.75 m person for scale">`;
    s += `<line class="fl" x1="0" y1="${f(base)}" x2="${f(VW)}" y2="${f(base)}"/><rect class="sp" x="${left}" y="${f(base - sh)}" width="${f(sw)}" height="${f(sh)}"/>`;
    s += `<rect class="wall" x="${f(wx)}" y="${f(wy)}" width="${f(C.W)}" height="${f(C.H)}"/>`;
    const big = C.cabs > 900;
    for (let c = 1; c < C.cols; c++) if (!big || c % 2 === 0) s += `<line class="seam" x1="${f(wx + C.W * c / C.cols)}" y1="${f(wy)}" x2="${f(wx + C.W * c / C.cols)}" y2="${f(wy + C.H)}"/>`;
    for (let r = 1; r < C.rows; r++) if (!big || r % 2 === 0) s += `<line class="seam" x1="${f(wx)}" y1="${f(wy + C.H * r / C.rows)}" x2="${f(wx + C.W)}" y2="${f(wy + C.H * r / C.rows)}"/>`;
    s += `<rect class="wedge" x="${f(wx)}" y="${f(wy)}" width="${f(C.W)}" height="${f(C.H)}"/>`;
    s += `<text class="lab" x="${left}" y="${f(base - sh - fs * 0.7)}" font-size="${f(fs)}">${C.cols} × ${C.rows} CABINETS · ${esc(C.cab.w + ' × ' + C.cab.h)} MM</text>`;
    s += `<text class="dim" x="${f(wx + C.W / 2)}" y="${f(base + fs * 1.5)}" font-size="${f(fs)}" text-anchor="middle">${esc(lenTxt(C.W, 2))}</text>`;
    s += `<text class="dim" x="${f(wx + C.W + fs * 0.4)}" y="${f(wy + C.H / 2)}" font-size="${f(fs)}" dominant-baseline="middle">${esc(lenTxt(C.H, 2))}</text>`;
    if (C.mx > 0.005 || C.my > 0.005) s += `<text class="mg" x="${f(left + sw / 2)}" y="${f(base + fs * 2.9)}" font-size="${f(fs * 0.9)}" text-anchor="middle">space ${esc(dimTxt(sw, sh))}</text>`;
    const px = left * 0.45, ph = 1.75;
    s += `<g class="person"><circle cx="${f(px)}" cy="${f(base - ph + 0.11)}" r="0.11"/><path d="M${f(px - 0.19)} ${f(base)} L${f(px - 0.17)} ${f(base - ph + 0.6)} Q${f(px - 0.17)} ${f(base - ph + 0.25)} ${f(px)} ${f(base - ph + 0.25)} Q${f(px + 0.17)} ${f(base - ph + 0.25)} ${f(px + 0.17)} ${f(base - ph + 0.6)} L${f(px + 0.19)} ${f(base)} Z"/></g>`;
    s += `<text class="mg" x="${f(px)}" y="${f(base + fs * 1.5)}" font-size="${f(fs * 0.9)}" text-anchor="middle">1.75 m</text>`;
    return s + '</svg>';
  }
  const chip = (v, who) => `<span class="vd ${v.k}"><i aria-hidden="true"></i>${who} · ${v.t}</span>`;
  const INPUT_TXT = { hd: 'Fits a 1080p input pixel for pixel (1920 × 1080).', uhd: 'Larger than 1080p: a 4K UHD input (3840 × 2160), or a 1080p source scaled up.', big: 'Larger than 4K UHD: more than one processor output or unit, mapped together.' };
  function paintOut() {
    const C = calc(Z); Z = C.z;
    const m = C.m;
    $('#lc-pitch').innerHTML = `${pitchTxt(C.sg.p)} mm <span class="dim">or finer</span>`;
    $('#lc-why').textContent = C.sg.none
      ? `Your closest viewer at ${lenTxt(Z.dc)} is nearer than the finest ${Z.env === 'out' ? 'outdoor' : 'indoor'} pitch we list allows for comfort; ${pitchTxt(C.sg.p)} mm is the finest.`
      : `The largest ${Z.env === 'out' ? 'outdoor' : 'indoor'} pitch where the closest viewer (${lenTxt(Z.dc)}) is past the minimum and most viewers (${lenTxt(Z.dt)}) are comfortable.${C.sg.cam ? ' On camera we keep it under 2.6 mm.' : ''}`;
    $('#lc-panel').innerHTML = m.maker === 'i9' ? `<span class="i9b">i9</span> ${esc(m.name)} · ${pitchTxt(m.pitch)} mm` : `${pitchTxt(m.pitch)} mm generic${C.auto ? ' · suggested' : ''}`;
    $('#lc-chips').innerHTML = chip(C.vc, 'Closest') + chip(C.vt, 'Most viewers');
    $('#lc-cabs').innerHTML = `${C.cols} × ${C.rows} = <b>${n0(C.cabs)}</b> <span class="ap">× ${C.cab.w} × ${C.cab.h} mm</span>`;
    $('#lc-size').innerHTML = `<b>${esc(dimTxt(C.W, C.H))}</b> · ${esc(areaTxt(C.area))}`;
    $('#lc-margin').textContent = C.mx < 0.005 && C.my < 0.005 ? 'None: fills the space' : `${lenTxt(C.mx, 2)} wide · ${lenTxt(C.my, 2)} high`;
    $('#lc-res').innerHTML = `<b>${n0(C.pxW)} × ${n0(C.pxH)} px</b> · ${nf(C.px / 1e6, 2)} MP`;
    $('#lc-ratio').textContent = C.ratio;
    $('#lc-pxc').innerHTML = `${C.pxc[0]} × ${C.pxc[1]} px <span class="ap">computed</span>`;
    $('#lc-input').textContent = INPUT_TXT[C.input];
    $('#lc-warn').hidden = !C.tooSmall;
    $('#lc-elev').innerHTML = elevation(C);
    $('#lc-open').href = wizHref(Z); $('#lc-plan').href = wizHref(Z);
    $('#lc-sum').textContent = `${n0(C.pxW)} × ${n0(C.pxH)} px · ${n0(C.cabs)} cabinets · ${dimTxt(C.W, C.H)}`;
  }
  function render() { paintInputs(); paintOut(); }
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.u) { Z.u = b.dataset.u; render(); }
    else if (b.dataset.env) { Z.env = b.dataset.env; Z = norm(Z); render(); }
    else if (b.dataset.fit) { Z.fit = b.dataset.fit; render(); }
  });
  root.addEventListener('input', e => {
    const k = LEN[e.target.id]; if (!k) return;
    const v = fromU(parseFloat(String(e.target.value).replace(',', '.')));
    if (!(v >= k[1] && v <= k[2])) { e.target.setAttribute('aria-invalid', 'true'); return; }
    e.target.removeAttribute('aria-invalid');
    Z[k[0]] = Math.round(v * 1000) / 1000; if (k[0] === 'dc' && Z.dt < Z.dc) Z.dt = Z.dc;
    Z = norm(Z); paintInputs(); paintOut();
  });
  root.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'lc-use') { const U = L.USES[t.value]; Z = norm({ ...Z, use: t.value, env: U.env }); render(); }
    else if (t.id === 'lc-m') { Z.m = t.value; Z = norm(Z); render(); }
    else if (t.id === 'lc-cab') { Z.cab = t.value; Z = norm(Z); render(); }
    else if (LEN[t.id]) { t.removeAttribute('aria-invalid'); t.value = numIn(Z[LEN[t.id][0]]); }
  });
  /* "Try it" in the common-sizes table loads that space here */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-try]'); if (!t) return;
    const [sw, sh] = t.dataset.try.split(',').map(Number); Z = norm({ ...Z, sw, sh }); render();
    root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    const l = document.getElementById('live'); if (l) l.textContent = `Calculator set to a ${sw} by ${sh} metre space.`;
  });
  $('#lc-use').innerHTML = Object.keys(L.USES).map(k => `<option value="${k}">${esc(L.USES[k].label)}</option>`).join('');
  render();
  window.I9LEDCALC.ui = { get state() { return Z; }, set: z => { Z = norm({ ...Z, ...z }); render(); }, calc: () => calc(Z) };
})();
