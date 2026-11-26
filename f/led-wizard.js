/* i9Store Pro — LED wall configurator (direction H, led.html). Vanilla JS; data in ../shared/led-data.js (window.I9LED).
   Eight steps, in the room planner wizard's grammar (planner-wizard.js): 1 use and place · 2 installation · 3 space and
   viewing distance · 4 pixel pitch and model · 5 cabinet layout · 6 signal and processing · 7 3D view (led-3d.js,
   imported only when the step opens) · 8 review and request a factory quote.
   LED walls are built to order: there is no price and no bag here. The end is a quote request that i9 takes to the
   factory. All answers ride in the URL hash as #l=<base64url JSON> (like the planner's #p=), so a link reopens the same
   wall on the same step. The quote form's personal fields never go in the URL.
   Lead gate (owner, 25 Nov): steps 1–5 and the 3D overview are free. The processor plan (model, count, ports,
   receiving cards, fibre, genlock), the closest / typical row views, the printable spec sheet and "save project" need a
   free project account. While locked those values are never written to the page; the link (#l=) carries inputs only. */
(function () {
  'use strict';
  const L = window.I9LED; if (!L) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const FT = 3.28084;
  const n0 = v => Math.round(v).toLocaleString('en-US');
  const nf = (v, d) => (+v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pad2 = i => String(i).padStart(2, '0');
  const reduce = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };
  const TO_CONFIRM = 'To confirm with factory';
  const NSTEP = 8;

  /* ======================= words ======================= */
  const ST = ['', 'Use', 'Installation', 'Space', 'Pitch', 'Cabinets', 'Signal', '3D view', 'Quote'];
  const H = ['', 'Where will the LED wall go?', 'How is it installed?', 'How much space is there?', 'Pick the pixel pitch.',
    'Fit the cabinets.', 'Signal and processing.', 'See it in 3D.', 'Review and request a factory quote.'];
  const LEDE = ['',
    'Pick the closest use. It sets typical viewing distances and the kind of cabinet. You can change all of it.',
    'Fixed, floor-standing or flown, and whether it’s rental. That decides which cabinets make sense.',
    'The area the wall can fill and how far away people are. Rough numbers are fine.',
    'We suggest a pitch from your viewing distances, with the rules of thumb in i9’s pixel-pitch calculator. i9’s own panels come first.',
    'A wall is built from whole cabinets. We fit as many as the space takes and show the real size, resolution and margin.',
    'What feeds the wall and what drives it. Ports follow the pixel load, the bit depth and the frame rate.',
    'The wall built from its cabinets, on its mounting, with a person for scale and the viewing distances on the floor.',
    'LED walls are built to order. i9 takes this spec to the factory and comes back with price and lead time.'];
  const MOUNTS = {
    wall:   { label: 'Fixed on a wall', d: 'Brackets or a frame on the building wall. Permanent.' },
    ground: { label: 'Floor-standing', d: 'Ground-stacked on a mobile structure or frame, braced at the back.' },
    flown:  { label: 'Flown from truss', d: 'Hung from a truss or rigging points, with hanging bars.' },
  };
  const INPUTS = { hdmi: 'HDMI 2.0', sdi: '12G-SDI', dp: 'DisplayPort', fibre: 'Fibre / IP' };
  const INPUT_WORD = { hdmi: 'HDMI', sdi: 'SDI', dp: 'DisplayPort', fibre: 'fibre / IP', dvi: 'DVI' };
  const SRC = { hd: [1920, 1080, '1080p (1920 × 1080)'], '4k': [3840, 2160, '4K UHD (3840 × 2160)'] };
  const NAMED = [[16 / 9, '16:9'], [4 / 3, '4:3'], [21 / 9, '21:9'], [32 / 9, '32:9'], [1, '1:1'], [9 / 16, '9:16'], [2, '2:1'], [3, '3:1'], [3 / 4, '3:4']];

  /* ======================= models ======================= */
  const I9M = L.I9_MODELS.concat(L.I9_MODELS_MORE);
  /* i9 models made for the chosen use come first (broadcast / XR surfaces the 1.96 XR) */
  const i9Order = z => I9M.map((m, i) => ({ m, i, k: (m.uses || []).includes(z.use) ? ((m.uses || []).length === 1 ? 0 : 1) : 2 })).sort((a, b) => a.k - b.k || a.i - b.i).map(x => x.m);
  const SHAPES = { flat: ['Flat', 'One plane, cabinets side by side.'], curved: ['Curved', 'An arc of cabinets, a set angle at each joint.'], corner: ['Cornered', 'Two walls at 90°, or a wall and an LED floor.'] };
  const shapesOf = m => m && m.mounting && m.mounting.length > 1 ? m.mounting : null;
  function modelById(id) {
    if (!id) return null;
    const m = I9M.find(x => x.id === id); if (m) return m;
    const g = /^g-(\d+(?:\.\d+)?)$/.exec(id); if (!g) return null;
    const p = +g[1]; if (!(p > 0.3 && p < 40)) return null;
    return { id, maker: 'generic', name: 'P' + g[1], pitch: p, env: L.GENERIC.out.includes(p) && !L.GENERIC.in.includes(p) ? ['out'] : L.GENERIC.in.includes(p) && !L.GENERIC.out.includes(p) ? ['in'] : ['in', 'out'],
      rental: null, cabinet: null, kgPerCabinet: null, wMaxPerCabinet: null, wAvgPerCabinet: null, brightnessNits: null };
  }
  /* does an i9 model suit the answers? (generic pitches always do) */
  function modelMiss(m, z) {
    if (!m || m.maker !== 'i9') return '';
    if (!m.env.includes(z.env)) return m.env.includes('in') ? 'Made for indoor use' : 'Made for outdoor use';
    if (z.rent && m.install && !m.install.includes('rental')) return 'Made for fixed installs, not rental';
    if (!z.rent && m.install && !m.install.includes('fixed')) return 'Made for rental';
    return '';
  }
  const cabById = id => L.CABINETS.find(c => c.id === id) || null;
  /* a model built on one cabinet (the i9 COB 1.86: 640 × 480 mm, owner 25 Nov) always uses it */
  const modelCab = m => m && m.cabinet ? (L.CABINETS.find(c => c.w === m.cabinet.w && c.h === m.cabinet.h) || { id: m.cabinet.id, w: m.cabinet.w, h: m.cabinet.h, name: `${m.cabinet.w} × ${m.cabinet.h}`, note: '', fit: [], env: m.env }) : null;
  /* cabinets that suit the installation: rental picks the die-cast quick-lock sizes; otherwise the mount */
  function cabsFor(z) {
    const want = z.rent ? 'rental' : z.mount;
    return L.CABINETS.filter(c => c.fit.includes(want) && c.env.includes(z.env));
  }

  /* ======================= the maths ======================= */
  /* rules of thumb from i9's pixel-pitch calculator (i9tv.com.br/ferramentas/calculadora-pixel-pitch-painel-led):
     minimum viewing distance in metres = pitch in mm (1 m per mm); comfortable = 3 × that (3 m per mm, ≈ 10 ft per mm) */
  const minDist = p => p * 1, comfDist = p => p * 3;
  function verdict(p, d) {
    if (!(d > 0)) return { k: 'none', t: 'Set a distance' };
    if (d < minDist(p)) return { k: 'bad', t: 'Closer than the minimum: pixels show' };
    if (d < comfDist(p)) return { k: 'mid', t: 'Acceptable: above the minimum, below comfortable' };
    return { k: 'ok', t: 'Comfortable by the 3 m per mm rule' };
  }
  /* suggested pitch: the largest generic pitch that is above the minimum for the closest row and comfortable for the
     typical row; broadcast backdrops stay below 2.6 mm (i9tv: news studios usually use under 2.6 mm) */
  function suggest(z) {
    const list = L.GENERIC[z.env] || L.GENERIC.in;
    let lim = Math.min(z.dc, z.dt / 3); const cam = z.use && L.USES[z.use] && L.USES[z.use].camera;
    if (cam) lim = Math.min(lim, 2.5);
    const ok = list.filter(p => p <= lim + 1e-9);
    return { p: ok.length ? ok[ok.length - 1] : list[0], lim, cam, none: !ok.length };
  }
  /* whole cabinets in a space: "fill" takes as many as fit; "169" the grid closest to 16:9 that fits */
  /* n cabinets of width w (m) with `ja` degrees at every joint: a faceted arc, concave toward the audience. Walks the
     cabinets in plan (x across, y toward the audience) and measures the chord (straight width between the two ends),
     the depth of the curve (chord to the furthest point) and the radius through the joints. */
  function arcGeom(n, w, ja) {
    const a = (ja || 0) * Math.PI / 180, pts = [[0, 0]];
    for (let i = 0; i < n; i++) { const t = (i - (n - 1) / 2) * a, p = pts[i]; pts.push([p[0] + w * Math.cos(t), p[1] + w * Math.sin(t)]); }
    const e = pts[n], chord = Math.hypot(e[0], e[1]);
    let depth = 0; pts.forEach(p => { depth = Math.max(depth, Math.abs(p[1] - e[1] * p[0] / (e[0] || 1))); });
    return { n, arc: n * w, chord, depth, bend: Math.max(0, n - 1) * (ja || 0), R: a > 0 ? w / (2 * Math.sin(a / 2)) : Infinity, pts };
  }
  /* columns of a curved wall: as many as keep the chord inside the space width (the arc subtends at most 180°) */
  function curveCols(sw, w, ja) {
    let n = 1;
    while ((n + 1) * ja <= 180 + 1e-9 && arcGeom(n + 1, w, ja).chord <= sw + 1e-6) n++;
    return n;
  }
  function fit(sw, sh, cab, mode, ja) {
    const mc = ja ? curveCols(sw, cab.w / 1000, ja) : Math.max(1, Math.floor(sw * 1000 / cab.w + 1e-6)), mr = Math.max(1, Math.floor(sh * 1000 / cab.h + 1e-6));
    let cols = mc, rows = mr;
    if (mode === '169') {
      let best = null;
      for (let c = 1; c <= mc; c++) for (let r = 1; r <= mr; r++) {
        const s = Math.abs(Math.log((c * cab.w) / (r * cab.h) / (16 / 9))), a = c * r;
        if (!best || s < best.s - 1e-9 || (Math.abs(s - best.s) < 1e-9 && a > best.a)) best = { s, a, c, r };
      }
      cols = best.c; rows = best.r;
    }
    const W = cols * cab.w / 1000, Hh = rows * cab.h / 1000, geo = ja ? arcGeom(cols, cab.w / 1000, ja) : null;
    return { cols, rows, W, H: Hh, geo, mx: Math.max(0, sw - (geo ? geo.chord : W)), my: Math.max(0, sh - Hh), tooSmall: sw * 1000 < cab.w - 1e-6 || sh * 1000 < cab.h - 1e-6 };
  }
  const pxLabel = C => C.exact ? 'module resolution from factory data' : C.own ? 'computed from pitch; module resolution to confirm with factory' : 'approx.; exact module resolution from factory';
  const ratioTxt = (w, h) => { const r = w / h, nm = NAMED.find(([v]) => Math.abs(r / v - 1) < 0.03); return nf(r, 2) + ':1' + (nm ? ' · near ' + nm[1] : ''); };
  function screensOf(z) {
    if (z.lay === 'sides') return [{ k: 'main', label: 'Main wall', sw: z.sw, sh: z.sh }, { k: 'left', label: 'Left side', sw: z.xw, sh: z.xh }, { k: 'right', label: 'Right side', sw: z.xw, sh: z.xh }];
    if (z.lay === 'pair') return [{ k: 'left', label: 'Screen A', sw: z.sw, sh: z.sh }, { k: 'right', label: 'Screen B', sw: z.sw, sh: z.sh }];
    if (z.shape === 'corner') return [{ k: 'main', label: 'Main wall', sw: z.sw, sh: z.sh }, z.cn === 'floor' ? { k: 'floor', label: 'LED floor', sw: z.sw, sh: z.wd, seg: true } : { k: 'wing', label: 'Side wall', sw: z.wd, sh: z.sh, seg: true }];
    return [{ k: 'main', label: 'Main wall', sw: z.sw, sh: z.sh }];
  }
  /* everything the wall comes to, from the answers */
  function calc(z = Z) {
    const m = modelById(z.m), cab = modelCab(m) || cabById(z.cab) || cabsFor(z)[0] || L.CABINETS[0];
    const pitch = m ? m.pitch : suggest(z).p;
    const pxc = [Math.round(cab.w / pitch), Math.round(cab.h / pitch)];
    const screens = screensOf(z).map(s => { const f = fit(s.sw, s.sh, cab, s.k === 'floor' ? 'fill' : z.fit, s.k === 'main' && z.shape === 'curved' ? z.ja : 0); return { ...s, ...f, cabs: f.cols * f.rows, pxW: f.cols * pxc[0], pxH: f.rows * pxc[1], area: f.W * f.H }; });
    const cabs = screens.reduce((a, s) => a + s.cabs, 0), px = screens.reduce((a, s) => a + s.pxW * s.pxH, 0), area = screens.reduce((a, s) => a + s.area, 0);
    /* the canvas the processor maps: screens side by side */
    const canvas = [screens.reduce((a, s) => a + s.pxW, 0), Math.max(...screens.map(s => s.pxH))];
    const kg = m && m.kgPerCabinet ? m.kgPerCabinet * cabs : null, wMax = m && m.wMaxPerCabinet ? m.wMaxPerCabinet * cabs : null, wAvg = m && m.wAvgPerCabinet ? m.wAvgPerCabinet * cabs : null;
    return { m, cab, pitch, pxc, screens, cabs, px, area, canvas, kg, wMax, wAvg, exact: !!(m && m.moduleRes), own: !!modelCab(m) };
  }
  /* each processor against the wall: ports, units, inputs */
  function procs(z = Z, C = calc(z)) {
    const pxCab = C.pxc[0] * C.pxc[1];
    const rows = L.PROCESSORS.map(p => {
      const cap = L.portCap(p.rule, z.bits, z.fps), cpp = Math.floor(cap / pxCab);
      const r = { p, cap, cpp, ports: 0, units: Infinity, inMiss: [], k4: z.src !== '4k' || p.in4k, dims: false };
      if (cpp < 1) return { ...r, status: 'no', st: 'A cabinet is more than one port carries' };
      r.ports = C.screens.reduce((a, s) => a + Math.ceil(s.cabs / cpp), 0) * (z.bk ? 2 : 1);
      r.effMax = Math.min(p.maxPx * (z.fps > 60 ? 60 / z.fps : 1), p.ports * cap);
      const uDims = Math.max(...C.screens.map(s => Math.ceil(s.pxW / p.maxW) * Math.ceil(s.pxH / p.maxH)));
      r.dims = uDims > 1;
      r.units = Math.max(1, Math.ceil(r.ports / p.ports), Math.ceil(C.px / r.effMax), uDims);
      r.inMiss = z.inp.filter(i => !p.inputs.includes(i));
      r.hzOk = z.fps <= p.maxHz; r.glOk = !glNeed(z) || p.genlock === true;
      r.status = !r.k4 || !r.hzOk ? 'no' : r.units === 1 ? (r.inMiss.length || !r.glOk ? 'conv' : 'fits') : r.units <= 4 ? 'multi' : 'no';
      r.st = !r.k4 ? 'No 4K input' : !r.hzOk ? 'Inputs to ' + p.maxHz + ' Hz' : r.units > 4 ? 'Too small for this wall' : r.units > 1 ? r.units + ' units' + (r.glOk ? '' : ' · no genlock') : !r.glOk ? 'Fits · no genlock input' : r.inMiss.length ? 'Fits · no ' + r.inMiss.map(i => INPUT_WORD[i]).join(', ') + ' input' : 'Fits · 1 unit';
      return r;
    });
    const rec = rows.find(r => r.status === 'fits') || rows.find(r => r.status === 'conv' && r.glOk) || rows.find(r => r.status === 'multi' && r.glOk && !r.inMiss.length) || rows.find(r => r.status === 'conv') || rows.filter(r => r.status === 'multi' && !r.inMiss.length).sort((a, b) => a.units - b.units)[0] || rows.find(r => r.status === 'multi') || rows[rows.length - 1];
    const chosen = (z.pr && rows.find(r => r.p.id === z.pr)) || rec;
    return { rows, rec, chosen };
  }
  /* genlock to the studio's sync: on by default for XR (the 1.96 XR model or a curved / cornered volume) */
  const xrOf = z => z.m === 'i9-xr196' || (z.shape && z.shape !== 'flat');
  const glNeed = z => z.gl == null ? xrOf(z) : !!z.gl;
  function fibreOf(z, r) {
    const long = z.run > L.COPPER_MAX_M, n = Math.max(1, Math.ceil(r.ports * Math.max(1, r.units > 1 ? 1 : 1) / 10));
    if (r.p.fibre === 'only') return { need: true, always: true, n, t: `${n} × ${r.p.brand === 'Brompton' ? 'Tessera XD' : 'CVT10'} at the wall (10 ports per fibre link)${long ? '' : '; this processor always uses them'}` };
    if (!long) return { need: false, n: 0, t: `Not needed: ${lenTxt(z.run, 0)} run, copper Ethernet reaches 100 m` };
    if (r.p.fibre === 'out') return { need: true, n, t: `Yes, ${lenTxt(z.run, 0)} is past copper’s 100 m: the unit’s fibre outputs plus about ${n} fibre converter${n > 1 ? 's' : ''} at the wall (10 ports each; model to confirm)` };
    return { need: true, n: 0, t: `Yes, ${lenTxt(z.run, 0)} is past copper’s 100 m: external fibre converters on the Ethernet runs (model and count to confirm)` };
  }

  /* ======================= state (rides in the hash as #l=) ======================= */
  const DEF = () => ({ s: 1, mx: 1, use: null, env: 'in', mount: 'wall', rent: 0, lay: 'single', sw: 5, sh: 3, xw: 2.5, xh: 1.5, dc: 5, dt: 12, u: 'm',
    m: null, cab: null, fit: 'fill', allc: 0, shape: 'flat', ja: 3, cn: 'walls', wd: 2.5, inp: ['hdmi'], src: 'hd', map: 'scaled', fps: 60, bits: 8, bk: 0, gl: null, run: 30, pr: null, ex: null });
  let Z = DEF();
  function valid(o) {
    const d = DEF(); if (!o || typeof o !== 'object') return d;
    const z = { ...d, ...o };
    z.s = clamp(Math.round(+z.s || 1), 1, NSTEP); z.mx = clamp(Math.round(+z.mx || z.s), z.s, NSTEP);
    z.use = L.USES[z.use] ? z.use : null; if (!z.use) { z.s = 1; z.mx = 1; }
    z.env = z.env === 'out' ? 'out' : 'in'; z.mount = MOUNTS[z.mount] ? z.mount : 'wall'; z.rent = z.rent ? 1 : 0;
    if (z.rent && z.mount === 'wall') z.mount = 'ground';
    z.lay = ['single', 'sides', 'pair'].includes(z.lay) ? z.lay : 'single';
    ['sw', 'sh', 'xw', 'xh'].forEach(k => { z[k] = clamp(+z[k] || d[k], 0.3, 100); });
    z.dc = clamp(+z.dc || d.dc, 0.5, 300); z.dt = clamp(+z.dt || d.dt, z.dc, 300); z.u = z.u === 'ft' ? 'ft' : 'm';
    z.m = modelById(z.m) ? z.m : null; z.cab = cabById(z.cab) ? z.cab : null; z.fit = z.fit === '169' ? '169' : 'fill'; z.allc = z.allc ? 1 : 0;
    z.inp = Array.isArray(z.inp) ? Object.keys(INPUTS).filter(k => z.inp.includes(k)) : ['hdmi'];
    z.src = z.src === '4k' ? '4k' : 'hd'; z.map = z.map === '1to1' ? '1to1' : 'scaled';
    z.fps = [30, 50, 60, 120, 240].includes(+z.fps) ? +z.fps : 60; z.bits = [8, 10, 12].includes(+z.bits) ? +z.bits : 8; z.bk = z.bk ? 1 : 0;
    z.run = clamp(+z.run || 30, 1, 5000); z.pr = L.PROCESSORS.some(p => p.id === z.pr) ? z.pr : null;
    z.ex = L.PRESETS.some(p => p.id === z.ex) ? z.ex : null;
    const shp = shapesOf(modelById(z.m));
    z.shape = shp && z.lay === 'single' && shp.includes(z.shape) ? z.shape : 'flat';
    z.ja = clamp(Math.round((+z.ja || 3) * 2) / 2, 0.5, 10); z.cn = z.cn === 'floor' ? 'floor' : 'walls'; z.wd = clamp(+z.wd || 2.5, 0.5, 30);
    z.gl = z.gl == null ? null : z.gl ? 1 : 0;
    if (z.s > 4 && !z.m) { z.s = 4; z.mx = Math.max(z.mx, 4); }
    return z;
  }
  const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
  /* the link carries the free layer only: every answer the customer typed or picked, never a result. The processor
     override (pr) is a gated result, so it never rides in the link; the plan is recomputed for whoever opens it. */
  const NOT_IN_LINK = ['pr'];
  function hashOf(z = Z) { const o = {}; const d = DEF(); Object.keys(z).forEach(k => { if (NOT_IN_LINK.includes(k)) return; if (JSON.stringify(z[k]) !== JSON.stringify(d[k]) || k === 's') o[k] = z[k]; }); return '#l=' + b64e(JSON.stringify(o)); }
  function save() { try { history.replaceState(history.state, '', location.pathname.split('/').pop() + location.search.replace(/[?&]preset=[\w-]+/, '').replace(/^&/, '?') + hashOf()); } catch (e) {} }
  function readHash() { const m = /^#l=([\w-]+)/.exec(location.hash); if (!m) return null; try { const z = valid(JSON.parse(b64d(m[1]))); z.pr = null; return z; } catch (e) { return null; } }
  function chooseUse(k) {
    if (Z.use === k) return;
    const U = L.USES[k]; Z.use = k; Z.env = U.env; Z.mount = U.mount; Z.rent = U.rent; Z.sw = U.sw; Z.sh = U.sh; Z.dc = U.dc; Z.dt = U.dt;
    Z.m = null; Z.cab = null; Z.pr = null; Z.ex = null; Z.mx = 1;
  }
  function applyPreset(id) {
    const P = L.PRESETS.find(p => p.id === id); if (!P) return;
    Z = valid({ ...DEF(), ...P.z, ex: id, s: 5, mx: NSTEP, u: Z.u });
  }
  /* keep model + cabinet consistent with the answers */
  function settle() {
    const m = modelById(Z.m); if (m && modelMiss(m, Z)) Z.m = null;
    if (m && m.maker === 'generic' && !(L.GENERIC[Z.env] || []).includes(m.pitch)) Z.m = null;
    const shp = shapesOf(modelById(Z.m)); if (!shp || Z.lay !== 'single' || !shp.includes(Z.shape)) Z.shape = 'flat';
    const mc = modelCab(modelById(Z.m)); if (mc) { Z.cab = mc.id; return; }
    const list = Z.allc ? L.CABINETS : cabsFor(Z);
    if (!Z.cab || !list.some(c => c.id === Z.cab)) { if (!Z.allc || !Z.cab) Z.cab = (cabsFor(Z)[0] || L.CABINETS[0]).id; }
  }

  /* ======================= units ======================= */
  const toU = m => Z.u === 'ft' ? m * FT : m;
  const fromU = v => Z.u === 'ft' ? v / FT : v;
  const numIn = m => { const v = toU(m); return String(Math.round(v * 100) / 100); };
  function lenTxt(m, d = 1) { return Z.u === 'ft' ? nf(m * FT, Math.max(d, 1) === 2 ? 1 : d === 0 ? 0 : 1) + ' ft' : nf(m, d) + ' m'; }
  const dimTxt = (w, h, d = 2) => Z.u === 'ft' ? `${nf(w * FT, 1)} × ${nf(h * FT, 1)} ft` : `${nf(w, d)} × ${nf(h, d)} m`;
  const areaTxt = a => Z.u === 'ft' ? nf(a * FT * FT, 0) + ' sq ft' : nf(a, 1) + ' m²';
  const pxTxt = (w, h) => `${n0(w)} × ${n0(h)} px`;
  const unitSeg = (cls = '') => `<span class="seg sm ${cls}" role="group" aria-label="Units"><button type="button" data-u="m" aria-pressed="${Z.u === 'm'}">m</button><button type="button" data-u="ft" aria-pressed="${Z.u === 'ft'}">ft</button></span>`;
  const lenInput = (id, m, label) => `<label class="num-in"><span class="sr">${esc(label)}</span><input id="${id}" data-len="${id}" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="${numIn(m)}"><i class="u">${Z.u}</i></label>`;

  /* ======================= drawings ======================= */
  /* a use glyph: a small elevation of the typical wall, cabinets drawn */
  const GLYPH = {
    church:    [{ x: 26, y: 14, w: 48, h: 27, c: 8, r: 5 }, { x: 8, y: 18, w: 14, h: 8, c: 2, r: 1 }, { x: 78, y: 18, w: 14, h: 8, c: 2, r: 1 }],
    corporate: [{ x: 30, y: 16, w: 40, h: 22.5, c: 5, r: 5 }],
    broadcast: [{ x: 10, y: 12, w: 80, h: 32, c: 16, r: 6 }],
    event:     [{ x: 18, y: 8, w: 64, h: 38, c: 12, r: 7 }],
    retail:    [{ x: 40, y: 6, w: 20, h: 40, c: 2, r: 4 }],
    outdoor:   [{ x: 16, y: 6, w: 68, h: 34, c: 6, r: 3 }],
  };
  function glyph(k) {
    const G = GLYPH[k], fl = 50;
    let s = `<svg class="lgly" viewBox="0 0 100 56" aria-hidden="true"><line class="fl" x1="0" y1="${fl}" x2="100" y2="${fl}"/>`;
    G.forEach((g, i) => {
      s += `<rect class="${i ? 'sd' : 'mn'}" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}"/>`;
      for (let c = 1; c < g.c; c++) s += `<line class="sm" x1="${g.x + g.w * c / g.c}" y1="${g.y}" x2="${g.x + g.w * c / g.c}" y2="${g.y + g.h}"/>`;
      for (let r = 1; r < g.r; r++) s += `<line class="sm" x1="${g.x}" y1="${g.y + g.h * r / g.r}" x2="${g.x + g.w}" y2="${g.y + g.h * r / g.r}"/>`;
      if (k === 'outdoor' && !i) s += `<line class="st" x1="${g.x + g.w * 0.3}" y1="${g.y + g.h}" x2="${g.x + g.w * 0.3}" y2="${fl}"/><line class="st" x1="${g.x + g.w * 0.7}" y1="${g.y + g.h}" x2="${g.x + g.w * 0.7}" y2="${fl}"/>`;
      if (k === 'event' && !i) s += `<line class="st" x1="${g.x + 4}" y1="${g.y + g.h}" x2="${g.x - 4}" y2="${fl}"/><line class="st" x1="${g.x + g.w - 4}" y1="${g.y + g.h}" x2="${g.x + g.w + 4}" y2="${fl}"/>`;
    });
    return s + `<g class="pp"><circle cx="${k === 'retail' ? 70 : 93}" cy="${fl - 9.4}" r="1.6"/><rect x="${(k === 'retail' ? 70 : 93) - 1.4}" y="${fl - 7.6}" width="2.8" height="7.6"/></g></svg>`;
  }
  /* mount glyph */
  function mountGlyph(k) {
    let s = `<svg class="mgly" viewBox="0 0 60 44" aria-hidden="true"><line class="fl" x1="2" y1="40" x2="58" y2="40"/>`;
    if (k === 'wall') s += `<rect class="bw" x="6" y="2" width="48" height="38"/><rect class="mn" x="14" y="10" width="32" height="18"/>`;
    if (k === 'ground') s += `<rect class="mn" x="14" y="12" width="32" height="26"/><line class="st" x1="42" y1="12" x2="54" y2="40"/><line class="st" x1="18" y1="12" x2="6" y2="40"/><line class="st" x1="10" y1="38" x2="50" y2="38"/>`;
    if (k === 'flown') s += `<rect class="tr" x="8" y="3" width="44" height="4"/><line class="st" x1="20" y1="7" x2="20" y2="12"/><line class="st" x1="40" y1="7" x2="40" y2="12"/><rect class="mn" x="14" y="12" width="32" height="18"/>`;
    for (let c = 1; c < 4; c++) { const y0 = k === 'ground' ? 12 : 10 + (k === 'flown' ? 2 : 0), hh = k === 'ground' ? 26 : 18; s += `<line class="sm" x1="${14 + 8 * c}" y1="${y0}" x2="${14 + 8 * c}" y2="${y0 + hh}"/>`; }
    return s + '</svg>';
  }
  /* the elevation: each screen's space (dashed), the wall of whole cabinets inside it, dimensions and a 1.75 m person */
  function elevation(C, opt = {}) {
    const sc = C.screens, gap = Z.lay === 'pair' ? Math.max(3, sc[0].sw * 0.8) : 0.8;
    const totW = sc.reduce((a, s) => a + s.sw, 0) + gap * (sc.length - 1), maxH = Math.max(...sc.map(s => s.sh), 1.9);
    const left = 1.3, padT = maxH * 0.16 + 0.25, padB = maxH * 0.2 + 0.35, padR = 0.35;
    const VW = left + totW + padR, VH = padT + maxH + padB, k = window.innerWidth < 700 ? Math.max(VW / 470, VH / 300) : Math.max(VW / 900, VH / 420);
    const fs = 12 * k, base = padT + maxH;
    let x = left;
    let s = `<svg class="elev" viewBox="0 0 ${nf(VW, 3).replace(/,/g, '')} ${nf(VH, 3).replace(/,/g, '')}" role="img" aria-label="${esc(opt.label || 'Front view of the LED wall')}">`;
    s += `<line class="fl" x1="0" y1="${base}" x2="${VW}" y2="${base}"/>`;
    sc.forEach((sp, i) => {
      const y0 = base - sp.sh;
      s += `<rect class="sp" x="${x}" y="${y0}" width="${sp.sw}" height="${sp.sh}"/>`;
      const wx = x + (sp.sw - sp.W) / 2, wy = base - sp.H - (sp.sh - sp.H) / 2;
      s += `<rect class="wall" x="${wx}" y="${wy}" width="${sp.W}" height="${sp.H}"/>`;
      const big = sp.cols * sp.rows > 900;
      for (let c = 1; c < sp.cols; c++) if (!big || c % 2 === 0) s += `<line class="seam" x1="${wx + sp.W * c / sp.cols}" y1="${wy}" x2="${wx + sp.W * c / sp.cols}" y2="${wy + sp.H}"/>`;
      for (let r = 1; r < sp.rows; r++) if (!big || r % 2 === 0) s += `<line class="seam" x1="${wx}" y1="${wy + sp.H * r / sp.rows}" x2="${wx + sp.W}" y2="${wy + sp.H * r / sp.rows}"/>`;
      s += `<rect class="wedge" x="${wx}" y="${wy}" width="${sp.W}" height="${sp.H}"/>`;
      /* labels: name + grid on top, width under, height at the side */
      s += `<text class="lab" x="${x}" y="${y0 - fs * 0.7}" font-size="${fs}">${esc(sp.label.toUpperCase())} · ${sp.cols} × ${sp.rows}</text>`;
      s += `<text class="dim" x="${wx + sp.W / 2}" y="${base + fs * 1.5}" font-size="${fs}" text-anchor="middle">${esc(lenTxt(sp.W, 2))}</text>`;
      s += `<text class="dim" x="${wx + sp.W + fs * 0.4}" y="${wy + sp.H / 2}" font-size="${fs}" dominant-baseline="middle">${esc(lenTxt(sp.H, 2))}</text>`;
      if (sp.mx > 0.005 || sp.my > 0.005) s += `<text class="mg" x="${x + sp.sw / 2}" y="${base + fs * 2.9}" font-size="${fs * 0.9}" text-anchor="middle">space ${esc(dimTxt(sp.sw, sp.sh))}</text>`;
      x += sp.sw + gap;
    });
    /* person for scale, 1.75 m */
    const px = left * 0.45, ph = 1.75;
    s += `<g class="person"><circle cx="${px}" cy="${base - ph + 0.11}" r="0.11"/><path d="M${px - 0.19} ${base} L${px - 0.17} ${base - ph + 0.6} Q${px - 0.17} ${base - ph + 0.25} ${px} ${base - ph + 0.25} Q${px + 0.17} ${base - ph + 0.25} ${px + 0.17} ${base - ph + 0.6} L${px + 0.19} ${base} Z"/></g>`;
    s += `<text class="mg" x="${px}" y="${base + fs * 1.5}" font-size="${fs * 0.9}" text-anchor="middle">1.75 m</text>`;
    return s + '</svg>';
  }

  /* ======================= DOM ======================= */
  const root = document.documentElement;
  const panel = $('#lz-panel'), stepsEl = $('#lz-steps');
  let G3 = null;
  const unmount3d = () => { if (G3) { try { G3.dispose(); } catch (e) {} G3 = null; } };

  function go(s, opt = {}) {
    s = clamp(s, 1, NSTEP);
    if (s > 1 && !Z.use) s = 1;
    if (s > 4 && !Z.m) s = 4;
    Z.s = s; Z.mx = Math.max(Z.mx, s);
    render(); save();
    if (!opt.keepScroll) { const top = $('#lz').getBoundingClientRect().top + scrollY - 72; if (scrollY > top) scrollTo({ top, behavior: reduce() ? 'auto' : 'smooth' }); }
    if (opt.focus !== false) { const h = $('#lz-h'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  const canNext = () => Z.s === 1 ? !!Z.use : Z.s === 4 ? !!Z.m : true;

  function renderChrome(C) {
    stepsEl.innerHTML = Array.from({ length: NSTEP }, (_, j) => { const i = j + 1;
      const cur = i === Z.s, done = i !== Z.s && i <= Z.mx, dis = i > Z.mx && !(i === Z.mx + 1 && canNext()) || (i > 1 && !Z.use) || (i > 4 && !Z.m);
      return `<li><button type="button" data-go="${i}" class="${cur ? 'cur' : done ? 'done' : ''}"${cur ? ' aria-current="step"' : ''}${dis ? ' disabled' : ''}><span class="n">${pad2(i)}<i aria-hidden="true"></i></span><b>${ST[i]}</b></button></li>`; }).join('');
    $('#lz-progbar').style.width = (Z.s / NSTEP * 100).toFixed(1) + '%';
    $('#lz-h').textContent = H[Z.s]; $('#lz-lede').textContent = LEDE[Z.s];
    root.setAttribute('data-lzs', Z.s);
    const back = $('#lz-back'); back.classList.toggle('off', Z.s === 1); back.disabled = Z.s === 1;
    const nx = $('#lz-next'); nx.disabled = !canNext();
    $('#lz-next-l').textContent = Z.s === 7 ? 'Review and quote' : Z.s === NSTEP ? 'Request factory quote' : 'Next: ' + ST[Z.s + 1];
    nx.classList.toggle('noarrow', Z.s === NSTEP);
    let sum = `<span class="meta">Step ${Z.s} of ${NSTEP}</span>`;
    if (Z.m) sum += `<span class="tot"><b class="num">${pxTxt(C.canvas[0], C.canvas[1])}</b><span class="meta-s">${n0(C.cabs)} cabinets · ${esc(areaTxt(C.area))}</span></span>`;
    else if (Z.use) sum += `<span class="tot"><span class="meta-s">${esc(L.USES[Z.use].label)} · ${Z.env === 'out' ? 'outdoor' : 'indoor'}</span></span>`;
    $('#lz-sum').innerHTML = sum;
  }

  /* ======================= project account (the lead gate) =======================
     PRODUCTION (none of this runs in the prototype):
     - The account is the store's existing customer account (Central API). Sign-in is by a 6-digit email code or
       Google; there are no passwords anywhere in this flow.
     - The gated values (processor model and count, ports used / available, receiving cards, fibre, genlock and
       frame-rate implications, the closest / typical row views, the printable spec sheet) are computed SERVER-SIDE
       after sign-in and are never shipped to anonymous clients: led-data.js loses its PROCESSORS table, and procs(),
       fibreOf() and specRows()' gated lines become one authenticated call that returns the plan for this #l= state.
     - On account creation (and on every quote request or "save project") the lead goes to Central → Comercial as an
       opportunity: contact fields + role + timing + consent, the project JSON (the #l= state and the computed plan),
       the source page and the UTM parameters of the visit. Contact fields travel in the request body, never in a URL.
     - The sales team sees the project in Central and contacts the customer to continue it. No response-time promise.
     PROTOTYPE: nothing is sent and no account is created. A flag in localStorage holds only { name, emailMasked, id },
     never the full email or phone; the full form values live in memory for the form's lifetime only. */
  const ACC_KEY = 'i9led-account';
  let ACC = null;          /* { name, emailMasked, id } */
  let ACC_ORG = '';        /* organisation, memory only, for the quote card in this visit */
  function accLoad() {
    try {
      const o = JSON.parse(localStorage.getItem(ACC_KEY) || 'null');
      if (o && typeof o.name === 'string' && o.name.trim() && typeof o.emailMasked === 'string' && /^LED-[A-Z0-9]{5}$/.test(o.id)) ACC = { name: o.name.trim().slice(0, 80), emailMasked: o.emailMasked.slice(0, 120), id: o.id };
    } catch (e) { ACC = null; }
  }
  function accStore() { try { localStorage.setItem(ACC_KEY, JSON.stringify({ name: ACC.name, emailMasked: ACC.emailMasked, id: ACC.id })); } catch (e) {} }
  function accForget() { try { localStorage.removeItem(ACC_KEY); } catch (e) {} }
  const signed = () => !!ACC;
  const maskEmail = e => { const s = String(e).trim(), at = s.lastIndexOf('@'); return at < 1 ? '•••' : s[0] + '•••' + s.slice(at); };
  const nameFromEmail = e => String(e).split('@')[0].split(/[._+-]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ') || 'i9 customer';
  function newId() {
    const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let r;
    try { r = crypto.getRandomValues(new Uint8Array(5)); } catch (e) { r = Array.from({ length: 5 }, () => Math.floor(Math.random() * 256)); }
    return 'LED-' + Array.from(r, x => A[x % A.length]).join('');
  }
  const live = t => { const l = $('#live'); if (l) l.textContent = t; };
  const firstName = n => String(n).trim().split(/\s+/)[0];

  /* what the account gives, said once, the same everywhere */
  const GATE_T = {
    proc: 'Processor plan, ports and receiving cards: free with a project account. An i9 engineer reviews the plan with you.',
    '3d': 'The views from the closest and typical rows come with a free project account.',
    sheet: 'Processor, genlock and fibre lines, the printable sheet and saving the project: free with a project account.',
  };
  /* the sheet's lede: what is waiting (by where it was opened) + what the account gives */
  const ACC_BASE = 'Save the project, get the processor plan, the full spec sheet and an engineer’s review.';
  const ACC_LEDE = { '': '', proc: 'The processor plan for this wall is worked out.', '3d': 'The views from the closest and typical rows are ready.', sheet: 'The full spec sheet is ready to print.', save: '' };
  const GETS = ['Processor model, ports and receiving cards', 'Genlock, frame rate and fibre advice', 'Views from the closest and typical rows', 'The printable spec sheet, saved with the project'];
  const COUNTRIES = ['United States', 'Brazil', 'Mexico', 'Colombia', 'Chile', 'Argentina', 'Peru', 'Ecuador', 'Dominican Republic', 'Puerto Rico', 'Panama', 'Costa Rica', 'Guatemala', 'Other'];
  const ROLES = [['end', 'End customer'], ['integrator', 'Integrator or reseller'], ['rental', 'Rental company']];
  const TIMING = [['month', 'This month'], ['1-3', '1–3 months'], ['3-6', '3–6 months'], ['research', 'Just researching']];
  const FLABEL = { name: 'full name', org: 'company, church or organisation', email: 'a valid work email', phone: 'phone or WhatsApp', country: 'country', role: '“I am”', timing: 'project timing', consent: 'your OK for i9 to contact you' };
  const GOOGLE_G = '<svg class="gg" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

  /* a redaction bar: the shape of a value, never the value */
  const rd = (w, cls = '') => `<span class="rd${cls ? ' ' + cls : ''}" style="--w:${w}" aria-hidden="true"></span>`;
  const LOCKED = 'Free with a project account';
  function gateBox(kind) {
    return `<div class="gate"><p class="gate-t">${icon('lock')}<span>${esc(GATE_T[kind])}</span></p>
      <div class="gate-a"><button type="button" class="btn sig" data-acct="new" data-from="${kind}">Create free project account</button><button type="button" class="lnk" data-acct="in" data-from="${kind}">I already have an account</button></div></div>`;
  }

  /* the account form: the sheet uses it, and so does the step 8 quote request when nobody is signed in (one form, not two) */
  function acctForm(ctx, mode) {
    const radios = (name, list) => list.map(([v, l]) => `<label class="rc"><input type="radio" name="${name}" value="${v}" required><span>${esc(l)}</span></label>`).join('');
    const det = mode === 'in'
      ? `<label class="fld"><span>Work email</span><input name="email" type="email" autocomplete="email" required></label>`
      : `<div class="qf2"><label class="fld"><span>Full name</span><input name="name" autocomplete="name" required></label>
          <label class="fld"><span>Company, church or organisation</span><input name="org" autocomplete="organization" required></label></div>
        <div class="qf2"><label class="fld"><span>Work email</span><input name="email" type="email" autocomplete="email" required></label>
          <label class="fld"><span>Phone or WhatsApp</span><input name="phone" type="tel" autocomplete="tel" required></label></div>
        <label class="fld"><span>Country</span><select name="country" autocomplete="country-name" required><option value="">Choose</option>${COUNTRIES.map(c => `<option>${c}</option>`).join('')}</select></label>
        <fieldset class="afr"><legend>I am</legend><div class="afc c3">${radios('role', ROLES)}</div></fieldset>
        <fieldset class="afr"><legend>Project timing</legend><div class="afc c4">${radios('timing', TIMING)}</div></fieldset>
        <label class="fld"><span>Note <em>optional</em></span><textarea name="note" rows="3" placeholder="Venue, content, deadlines, anything we should know"></textarea></label>
        <label class="cns"><input type="checkbox" name="consent" required><span>i9 may contact me about this project</span></label>`;
    const go = ctx === 'quote' ? 'Request factory quote' : 'Email me a sign-in code';
    const sw = ctx === 'quote' ? `Already have an account? <button type="button" class="lnk" data-acct="in" data-from="sheet">Sign in</button>`
      : mode === 'in' ? `New here? <button type="button" class="lnk" data-acct-mode="new">Create a free project account</button>`
      : `Already have an account? <button type="button" class="lnk" data-acct-mode="in">Sign in</button>`;
    return `<form class="af" id="${ctx === 'quote' ? 'qf' : 'af'}" data-ctx="${ctx}" data-mode="${mode}" novalidate>
      <div class="af-det">
        <button type="button" class="btn af-g" data-google>${GOOGLE_G}Continue with Google</button>
        <p class="af-gnote meta-s" role="status" hidden></p>
        <p class="af-or meta-s"><span>or with your email</span></p>
        ${det}
        <p class="qf-err meta-s af-err" role="alert" hidden></p>
        <button type="submit" class="btn sig af-go">${go} ${icon('arrow-right')}</button>
        <p class="meta-s af-fine">No password. ${ctx === 'quote' ? 'We email you a 6-digit code to confirm, and the request opens your free project account.' : 'We email you a 6-digit code.'}</p>
        <p class="meta-s af-sw">${sw}</p>
      </div>
      <div class="af-code" hidden>
        <p class="af-sent">Enter the 6-digit code we sent to <b class="af-to"></b>.</p>
        <label class="fld"><span>Sign-in code</span><input name="code" class="af-cin" inputmode="numeric" autocomplete="one-time-code" maxlength="7" spellcheck="false"></label>
        <p class="qf-err meta-s af-err2" role="alert" hidden></p>
        <button type="submit" class="btn sig af-go">${ctx === 'quote' ? 'Verify and send the request' : 'Verify and save the project'} ${icon('arrow-right')}</button>
        <p class="meta-s af-sw"><button type="button" class="lnk" data-af-back>Use a different email</button></p>
        <p class="meta-s af-fine">Prototype: any 6 digits work; no email is sent.</p>
      </div>
    </form>`;
  }
  function afSubmit(f) {
    const code = $('.af-code', f);
    if (!code.hidden) return afVerify(f);
    const err = $('.af-err', f), els = [...f.elements].filter(e => e.closest('.af-det') && e.willValidate);
    els.forEach(e => { e.removeAttribute('aria-invalid'); const fs = e.closest('fieldset'); if (fs) fs.removeAttribute('aria-invalid'); });
    const bad = els.filter(e => !e.checkValidity());
    if (bad.length) {
      bad.forEach(e => { const fs = e.closest('fieldset.afr'); (fs || e).setAttribute('aria-invalid', 'true'); });
      const miss = [...new Set(bad.map(e => FLABEL[e.name] || e.name))];
      err.hidden = false; err.textContent = miss.length > 3 ? 'Fill in the fields marked in orange, and tick the box so i9 can contact you about the project.'.replace(miss.includes(FLABEL.consent) ? '' : ', and tick the box so i9 can contact you about the project', '') : 'Still needed: ' + miss.join(', ') + '.';
      bad[0].focus();
      return;
    }
    err.hidden = true;
    const d = {}; els.forEach(e => { if (e.type === 'radio') { if (e.checked) d[e.name] = e.value; } else if (e.type === 'checkbox') d[e.name] = e.checked; else d[e.name] = e.value.trim(); });
    f._d = d;   /* memory only, for the code step */
    $('.af-to', f).textContent = maskEmail(d.email);
    $('.af-det', f).hidden = true; code.hidden = false;
    const ci = $('.af-cin', f); ci.value = ''; ci.focus();
    live('Enter the 6-digit sign-in code. Prototype: any 6 digits work.');
  }
  function afVerify(f) {
    const ci = $('.af-cin', f), err = $('.af-err2', f), v = ci.value.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(v)) { ci.setAttribute('aria-invalid', 'true'); err.hidden = false; err.textContent = 'Enter the 6 digits from the email.'; ci.focus(); return; }
    const d = f._d || {}, ctx = f.dataset.ctx;
    ACC = { name: (f.dataset.mode === 'in' ? nameFromEmail(d.email) : d.name).slice(0, 80), emailMasked: maskEmail(d.email), id: newId() };
    ACC_ORG = (d.org || '').slice(0, 120);
    f._d = null;
    accStore();
    /* PRODUCTION: here the account is created or signed in through Central, the lead + project JSON + source page + UTM
       go to Central → Comercial, and the gated plan is fetched from the server. The prototype sends nothing. */
    render(); save();
    live(`Signed in as ${ACC.name}. Project saved · ${ACC.id}. The processor plan is open.`);
    if (ctx === 'quote') showSent();
    else acctDone();
  }
  function afClick(b) {
    if (b.hasAttribute('data-google')) {
      const n = $('.af-gnote', b.closest('form')); n.hidden = false;
      n.textContent = 'Google sign-in isn’t connected on this prototype. Use the email code below.';
      return true;
    }
    if (b.hasAttribute('data-af-back')) {
      const f = b.closest('form'); $('.af-code', f).hidden = true; $('.af-det', f).hidden = false;
      const e = $('[name="email"]', f); if (e) e.focus();
      return true;
    }
    return false;
  }
  function signOut() {
    ACC = null; ACC_ORG = ''; accForget();
    if (dlg && dlg.open) dlg.close();
    render(); save();
    live('Signed out. The processor plan is locked again.');
    const h = $('#lz-h'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
  }

  /* ----- the account sheet: a side panel (full screen on a phone), a modal dialog with its own focus trap ----- */
  let dlg = null, opener = null;
  function acctSheet(mode, from) {
    return `<div class="acct-in">
      <div class="acct-hd"><p class="meta"><span class="tally"></span>${mode === 'in' ? 'Project account · sign in' : 'Free project account'}</p><button type="button" class="acct-x" data-acct-close aria-label="Close">${icon('x')}</button></div>
      <h2 id="acct-h" tabindex="-1">${mode === 'in' ? 'Sign in to your project.' : 'Save this wall and get the full plan.'}</h2>
      <p class="acct-lede">${esc(mode === 'in' ? 'We email you a code. Your saved project, the processor plan and the full spec sheet open as soon as you’re in.' : ((ACC_LEDE[from] || '') + ' ' + ACC_BASE).trim())}</p>
      ${mode === 'in' ? '' : `<ul class="acct-get">${GETS.map(g => `<li><i aria-hidden="true"></i>${esc(g)}</li>`).join('')}</ul>`}
      <p class="acct-proto meta-s"><i aria-hidden="true"></i>Prototype: nothing is sent; no account is created.</p>
      <div class="acct-body">${acctForm('sheet', mode)}</div>
    </div>`;
  }
  function acctDone() {
    if (!dlg) return;
    const s = Z.s, what = s === 6 ? 'See the processor plan' : s === 7 ? 'Back to the 3D view' : s === 8 ? 'Back to the spec sheet' : 'Back to your wall';
    dlg.innerHTML = `<div class="acct-in">
      <div class="acct-hd"><p class="meta acct-ok"><span class="tally"></span>Project saved · ${esc(ACC.id)}</p><button type="button" class="acct-x" data-acct-close aria-label="Close">${icon('x')}</button></div>
      <h2 id="acct-h" tabindex="-1">You’re in, ${esc(firstName(ACC.name))}.</h2>
      <p class="acct-lede">Our team will contact you to continue the project.</p>
      <ul class="acct-get on">${GETS.map(g => `<li><i aria-hidden="true"></i>${esc(g)}</li>`).join('')}</ul>
      <p class="acct-proto meta-s"><i aria-hidden="true"></i>Prototype: nothing is sent; no account is created.</p>
      <button type="button" class="btn sig acct-done" data-acct-close>${what} ${icon('arrow-right')}</button>
    </div>`;
    $('#acct-h', dlg).focus();
  }
  const FOCUSABLE = 'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';
  const visibleIn = el => [...el.querySelectorAll(FOCUSABLE)].filter(e => e.getClientRects().length && !e.closest('[hidden]'));
  function openAcct(mode, from, el) {
    if (signed()) return;
    if (el) opener = el;
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.className = 'acct'; dlg.id = 'acct'; dlg.setAttribute('aria-labelledby', 'acct-h');
      document.body.appendChild(dlg);
      dlg.addEventListener('cancel', e => { e.preventDefault(); closeAcct(); });   /* Esc */
      dlg.addEventListener('click', e => {
        if (e.target === dlg) { closeAcct(); return; }   /* the backdrop */
        const b = e.target.closest('button'); if (!b || b.disabled) return;
        if (afClick(b)) return;
        if (b.hasAttribute('data-acct-close')) { closeAcct(); return; }
        if (b.dataset.acctMode) { openAcct(b.dataset.acctMode, dlg.dataset.from); return; }
      });
      dlg.addEventListener('submit', e => { const f = e.target; if (f.classList.contains('af')) { e.preventDefault(); afSubmit(f); } });
      dlg.addEventListener('keydown', e => {   /* focus stays in the sheet */
        if (e.key !== 'Tab') return;
        const f = visibleIn(dlg); if (!f.length) return;
        const a = f[0], z = f[f.length - 1], cur = document.activeElement;
        if (e.shiftKey && (cur === a || !dlg.contains(cur) || cur === $('#acct-h', dlg))) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && (cur === z || !dlg.contains(cur))) { e.preventDefault(); a.focus(); }
      });
    }
    dlg.dataset.from = from || '';
    dlg.innerHTML = acctSheet(mode, from || '');
    if (!dlg.open) { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } }
    root.classList.add('acct-open');
    $('#acct-h', dlg).focus();
  }
  function closeAcct() {
    if (!dlg) return;
    if (dlg.open) dlg.close();
    root.classList.remove('acct-open');
    /* the opener may have been redrawn (sign-in redraws the step): fall back to what just unlocked */
    let t = opener && opener.isConnected ? opener : null;
    if (!t || (signed() && t.dataset && t.dataset.acct)) t = signed() ? (Z.s === 6 ? $('.prc', panel) : Z.s === 7 ? $('[data-v3="c"]', panel) : Z.s === 8 ? $('#lz-print', panel) : null) : null;
    if (!t) { t = $('#lz-h'); t.setAttribute('tabindex', '-1'); }
    t.focus({ preventScroll: !opener || !opener.isConnected });
    opener = null;
  }

  /* ----- the running summary (steps 2–7) ----- */
  function summary(C, PR) {
    const U = Z.use && L.USES[Z.use], m = C.m;
    const row = (k, label, v, s) => `<div><dt><button type="button" data-go="${s}" aria-label="Edit ${esc(label)}">${esc(label)}</button></dt><dd${v ? '' : ' class="nil"'}>${v || '—'}</dd></div>`;
    const sc = C.screens;
    return `<p class="meta"><span class="tally"></span>Your wall${Z.ex ? ' · from an example' : ''}</p>
      <dl class="lsdl">
        ${row('use', 'Use', U ? esc(U.label) + ' · ' + (Z.env === 'out' ? 'outdoor' : 'indoor') : '', 1)}
        ${row('inst', 'Installation', Z.use && Z.s >= 2 ? esc(MOUNTS[Z.mount].label) + (Z.rent ? ' · rental' : '') : '', 2)}
        ${row('space', 'Space', Z.use && Z.mx >= 3 ? sc.map(s => esc(dimTxt(s.sw, s.sh, 1))).filter((v, i, a) => a.indexOf(v) === i).join(' · ') + (sc.length > 1 ? ` · ${sc.length} ${Z.shape === 'corner' ? 'surfaces' : 'screens'}` : '') : '', 3)}
        ${row('view', 'Viewing', Z.use && Z.mx >= 3 ? esc(lenTxt(Z.dc, 1)) + ' closest · ' + esc(lenTxt(Z.dt, 1)) + ' typical' : '', 3)}
        ${row('pitch', 'Pitch', m ? (m.maker === 'i9' ? '<span class="i9b">i9</span> ' : '') + esc(m.maker === 'i9' ? m.name : nf(m.pitch, m.pitch < 10 ? (String(m.pitch).split('.')[1] || '').length : 0) + ' mm, generic') : '', 4)}
        ${row('cab', 'Cabinets', m && Z.mx >= 5 ? `${n0(C.cabs)} × ${esc(C.cab.name)} mm` + (Z.shape === 'curved' ? ` · curved ${nf(C.screens[0].geo.bend, 1)}°` : Z.shape === 'corner' ? ' · cornered' : '') : '', 5)}
        ${row('wall', 'Wall', m && Z.mx >= 5 ? esc(sc.length > 1 ? areaTxt(C.area) + ' in ' + sc.length + (Z.shape === 'corner' ? ' surfaces' : ' screens') : dimTxt(sc[0].W, sc[0].H) + ' · ' + areaTxt(C.area)) : '', 5)}
        ${row('res', 'Resolution', m && Z.mx >= 5 ? (sc.length > 1 ? sc.map(s => pxTxt(s.pxW, s.pxH)).filter((v, i, a) => a.indexOf(v) === i).join(' · ') : pxTxt(sc[0].pxW, sc[0].pxH)) : '', 5)}
        ${row('proc', 'Processor', m && Z.mx >= 6 && PR ? (signed() ? esc(PR.chosen.p.brand + ' ' + PR.chosen.p.model) + (PR.chosen.units > 1 && isFinite(PR.chosen.units) ? ' × ' + PR.chosen.units : '') + ` · ${PR.chosen.ports} port${PR.chosen.ports === 1 ? '' : 's'}` : `<span class="lkv">${icon('lock')}With a project account</span>`) : '', 6)}
      </dl>
      <p class="meta-s lsn">Built to order, no stock and no prices. i9 quotes it with the factory.</p>
      ${accLine()}`;
  }
  /* who is signed in, under the summary (and on the quote card) */
  function accLine() {
    if (signed()) return `<div class="lacc"><p class="meta-s">Signed in as <b>${esc(ACC.name)}</b> · <button type="button" class="lnk" data-signout>Sign out</button></p><p class="meta-s lacc-id">Project saved · ${esc(ACC.id)}</p></div>`;
    return `<div class="lacc"><button type="button" class="lnk strong" data-acct="new" data-from="">${icon('lock')}Save this project</button><p class="meta-s">Free account: the processor plan, the full spec sheet and an engineer’s review.</p></div>`;
  }

  /* ----- step 1: use and place ----- */
  function step1() {
    const keys = Object.keys(L.USES);
    return `<div class="uses" role="radiogroup" aria-labelledby="lz-h">${keys.map((k, i) => { const U = L.USES[k]; return `
      <button type="button" class="use${Z.use === k ? ' on' : ''}" role="radio" aria-checked="${Z.use === k}" data-use="${k}">
        <span class="ph">${glyph(k)}</span>
        <span class="kt"><span class="n">${pad2(i + 1)}<i aria-hidden="true"></i></span><b>${esc(U.label)}</b><span class="kd">${esc(U.d)}</span></span>
      </button>`; }).join('')}</div>
      <div class="fq envq"><span class="ql">Indoor or outdoor?<span class="meta-s">Outdoor walls need weatherproof cabinets and more brightness.</span></span>
        <span class="seg" role="group" aria-label="Indoor or outdoor"><button type="button" data-env="in" aria-pressed="${Z.env === 'in'}">Indoor</button><button type="button" data-env="out" aria-pressed="${Z.env === 'out'}">Outdoor</button></span></div>
      <section class="exs" aria-labelledby="ex-h">
        <div class="exh"><h2 class="meta" id="ex-h"><span class="tally"></span>Or start from an example wall</h2><p class="meta-s">Examples to start from, not packages. Every number can change.</p></div>
        <div class="exl">${L.PRESETS.map((p, i) => `<button type="button" class="ex${Z.ex === p.id ? ' on' : ''}" data-ex="${p.id}"><span class="n meta-s">EX ${pad2(i + 1)}</span><b>${esc(p.label)}</b><span class="meta-s">${esc(p.d)}</span>${icon('arrow-right')}</button>`).join('')}</div>
      </section>`;
  }

  /* ----- step 2: installation ----- */
  function step2() {
    const C = cabsFor(Z);
    return `<fieldset class="fs"><legend class="meta">How it’s mounted</legend>
        <div class="mts">${Object.keys(MOUNTS).map((k, i) => { const dis = Z.rent && k === 'wall'; return `<button type="button" class="mt${Z.mount === k ? ' on' : ''}" data-mount="${k}" aria-pressed="${Z.mount === k}"${dis ? ' disabled' : ''}>
          ${mountGlyph(k)}<span class="n">${pad2(i + 1)}<i aria-hidden="true"></i></span><b>${esc(MOUNTS[k].label)}</b><span class="meta-s">${esc(dis ? 'Rental walls stand on the floor or fly.' : MOUNTS[k].d)}</span></button>`; }).join('')}</div>
      </fieldset>
      <div class="fq"><span class="ql">Is it for rental?<span class="meta-s">Touring cabinets: die-cast, quick locks, built and struck often.</span></span>
        <span class="seg" role="group" aria-label="Is it for rental?"><button type="button" data-rent="0" aria-pressed="${!Z.rent}">No, a fixed install</button><button type="button" data-rent="1" aria-pressed="${!!Z.rent}">Yes, rental</button></span></div>
      <div class="cabhint"><p class="meta"><span class="tally"></span>Cabinets that suit this</p>
        <ul>${C.map(c => `<li><b class="num">${esc(c.name)} mm</b><span>${esc(c.note)}</span></li>`).join('')}</ul>
        <p class="meta-s">You pick the size in step 5; the others stay available there.</p></div>`;
  }

  /* ----- step 3: space and viewing distance ----- */
  function step3() {
    const sideRow = Z.lay === 'sides' ? `<div class="fq"><span class="ql">Each side screen<span class="meta-s">Width × height of the area for each IMAG screen.</span></span>
        <span class="cin">${lenInput('lz-xw', Z.xw, 'Side screen width')}<span class="x" aria-hidden="true">×</span>${lenInput('lz-xh', Z.xh, 'Side screen height')}</span></div>` : '';
    return `<div class="fq top"><span class="ql">Units</span>${unitSeg()}</div>
      <fieldset class="fs"><legend class="meta">How many screens</legend>
        <div class="lays">${[['single', 'One wall', 'A single LED wall'], ['sides', 'Main + 2 sides', 'A main wall with left and right IMAG screens'], ['pair', 'A pair', 'Two equal screens either side of a stage']].map(([k, b, d], i) => `
          <button type="button" class="lay${Z.lay === k ? ' on' : ''}" data-lay="${k}" aria-pressed="${Z.lay === k}"><span class="lg" aria-hidden="true">${k === 'single' ? '<i class="m"></i>' : k === 'sides' ? '<i class="s"></i><i class="m"></i><i class="s"></i>' : '<i class="s2"></i><span></span><i class="s2"></i>'}</span><span class="n">${pad2(i + 1)}<i aria-hidden="true"></i></span><b>${b}</b><span class="meta-s">${d}</span></button>`).join('')}</div>
      </fieldset>
      <div class="fq"><span class="ql">${Z.lay === 'pair' ? 'Each screen' : 'Main wall'}<span class="meta-s">Width × height of the area the wall can fill.</span></span>
        <span class="cin">${lenInput('lz-sw', Z.sw, 'Width')}<span class="x" aria-hidden="true">×</span>${lenInput('lz-sh', Z.sh, 'Height')}</span></div>
      ${sideRow}
      <div class="fq"><span class="ql">Closest viewer<span class="meta-s">Front row, or the camera for a backdrop.</span></span>${lenInput('lz-dc', Z.dc, 'Closest viewing distance')}</div>
      <div class="fq"><span class="ql">Typical viewer<span class="meta-s">Where most people sit or stand.</span></span>${lenInput('lz-dt', Z.dt, 'Typical viewing distance')}</div>`;
  }
  function side3() {
    const g = suggest(Z);
    return `<figure class="lprev"><figcaption class="meta"><span class="tally"></span>Front view · the space</figcaption>${elevation(calc({ ...Z, m: Z.m || 'g-' + g.p, cab: Z.cab || cabsFor(Z)[0].id }), { label: 'Front view of the space and a first fit' })}
      <p class="meta-s">Dashed: the space. Filled: a first fit of whole cabinets, refined in step 5.</p></figure>`;
  }

  /* ----- step 4: pitch and model ----- */
  const pitchTxt = p => nf(p, (String(p).split('.')[1] || '').length);
  function chipsFor(p) {
    const a = verdict(p, Z.dc), b = verdict(p, Z.dt);
    return `<span class="vd ${a.k}" title="${esc(a.t)}"><i aria-hidden="true"></i>Closest · ${esc(a.k === 'ok' ? 'comfortable' : a.k === 'mid' ? 'acceptable' : 'pixels show')}</span><span class="vd ${b.k}" title="${esc(b.t)}"><i aria-hidden="true"></i>Typical · ${esc(b.k === 'ok' ? 'comfortable' : b.k === 'mid' ? 'acceptable' : 'pixels show')}</span>`;
  }
  function step4() {
    const g = suggest(Z), list = L.GENERIC[Z.env];
    const i9 = i9Order(Z).map(m => { const miss = modelMiss(m, Z), on = Z.m === m.id; const fld = (k, v) => `<div><dt>${k}</dt><dd${v == null ? ' class="tc"' : ''}>${v == null ? TO_CONFIRM : esc(v)}</dd></div>`;
      return `<div class="i9m${on ? ' on' : ''}${miss ? ' miss' : ''}">
        <div class="i9h"><span class="badge meta"><span class="tally"></span>i9 manufactured</span>${on ? '<span class="meta sel">Chosen</span>' : ''}</div>
        <div class="i9t"><p class="pp num">${pitchTxt(m.pitch)}<small>mm</small></p><div><h3>${esc(m.name)}</h3><p class="meta-s">${m.tech ? esc(m.tech) + ' · ' : ''}built to order by i9</p></div></div>
        <dl class="ospec">${fld('Pixel pitch', pitchTxt(m.pitch) + ' mm')}${fld('Grayscale', m.grayBits + '-bit')}${fld('Refresh', n0(m.refreshHz) + ' Hz')}${fld('Use', (m.env.includes('out') ? (m.env.includes('in') ? 'Indoor or outdoor' : 'Outdoor') : 'Indoor') + (m.install ? ', ' + m.install.map(x => x === 'fixed' ? 'fixed install' : 'rental').join(' or ') : ''))}${shapesOf(m) ? fld('Mounting', m.mounting.map(x => SHAPES[x][0].toLowerCase()).join(', ') + ' · modular') : ''}${fld('Cabinet', m.cabinet ? m.cabinet.w + ' × ' + m.cabinet.h + ' mm' : null)}${m.cabinet ? fld('Per cabinet', Math.round(m.cabinet.w / m.pitch) + ' × ' + Math.round(m.cabinet.h / m.pitch) + ' px, computed') : ''}${fld('Brightness', m.brightnessNits)}${fld('Weight, power', m.kgPerCabinet)}</dl>
        <p class="vds">${chipsFor(m.pitch)}</p>
        ${miss ? `<p class="miss-t meta-s"><i aria-hidden="true"></i>${esc(miss)}. Change step ${Z.rent ? 2 : 1} to use it, or pick a generic pitch.</p>` : ''}
        <button type="button" class="btn ${on ? 'solid' : 'sig'} osel" data-model="${m.id}" aria-pressed="${on}"${miss ? ' disabled' : ''}>${on ? '✓ Chosen' : 'Choose the i9 ' + pitchTxt(m.pitch)}</button>
      </div>`; }).join('');
    return `<div class="sug"><p class="meta"><span class="tally"></span>Suggested for your distances</p>
        <h2><span class="num">${pitchTxt(g.p)} mm</span> <span class="dim">or finer</span></h2>
        <p>${g.none ? `Your closest viewer at ${esc(lenTxt(Z.dc))} is nearer than the finest ${Z.env === 'out' ? 'outdoor' : 'indoor'} pitch allows for comfort; this is the finest we list.` : `The largest pitch where the closest viewer (${esc(lenTxt(Z.dc))}) is past the minimum and the typical viewer (${esc(lenTxt(Z.dt))}) is comfortable.`}${g.cam ? ' On camera we keep it under 2.6 mm: news studios usually use under 2.6 mm, and the camera test with a cabinet comes before the order.' : ''}</p>
        <p class="rule meta-s">Rules of thumb from i9’s pixel-pitch calculator: minimum distance = 1 m per mm of pitch; comfortable = 3 m per mm (about 10 ft per mm). They are a range, not a hard limit.</p></div>
      <h3 class="lh meta">i9’s own panels</h3>
      <div class="i9s">${i9}
        <div class="i9more"><p class="meta">More i9 models</p><p>i9 builds other models too. They’re added here when the factory confirms their data; ask a specialist meanwhile.</p></div></div>
      <h3 class="lh meta">Generic pitch · ${Z.env === 'out' ? 'outdoor' : 'indoor'} · the factory proposes the model</h3>
      <div class="gps" role="radiogroup" aria-label="Generic pixel pitch">${list.map(p => { const id = 'g-' + p, on = Z.m === id, sg = p === g.p;
        return `<button type="button" class="gp${on ? ' on' : ''}" role="radio" aria-checked="${on}" data-model="${id}">
          <span class="gph">${sg ? '<span class="sgb meta">Suggested</span>' : '<span class="meta">Generic</span>'}</span>
          <span class="pp num">${pitchTxt(p)}<small>mm</small></span>
          <span class="gd meta-s">Min ${esc(lenTxt(minDist(p)))} · comfortable ${esc(lenTxt(comfDist(p)))}</span>
          <span class="vds">${chipsFor(p)}</span></button>`; }).join('')}</div>
      <p class="meta-s fnote">Brightness, weight and power depend on the exact model; the factory confirms them with the quote.</p>`;
  }

  /* ----- step 5: cabinet layout ----- */
  function step5(C) {
    const own = modelCab(C.m), rec = own ? [own] : cabsFor(Z), others = own ? [] : L.CABINETS.filter(c => !rec.includes(c));
    const cabBtn = c => { const on = C.cab.id === c.id, px = [Math.round(c.w / C.pitch), Math.round(c.h / C.pitch)], s = 30 / Math.max(c.w, c.h);
      return `<button type="button" class="cb${on ? ' on' : ''}" data-cab="${c.id}" aria-pressed="${on}"><svg viewBox="0 0 36 36" aria-hidden="true"><rect x="${18 - c.w * s / 2}" y="${18 - c.h * s / 2}" width="${c.w * s}" height="${c.h * s}"/></svg>
        <b class="num">${esc(c.name)}<small> mm</small></b><span class="meta-s">≈ ${px[0]} × ${px[1]} px at ${pitchTxt(C.pitch)} mm</span></button>`; };
    const m = C.m;
    const res = C.screens.map(sp => `<div class="lscr">
        ${C.screens.length > 1 ? `<p class="meta sh">${esc(sp.label)}</p>` : ''}
        <dl class="ospec big">
          <div><dt>Cabinets</dt><dd class="num">${sp.cols} × ${sp.rows} = <b>${n0(sp.cabs)}</b></dd></div>
          <div><dt>Wall size</dt><dd class="num">${esc(dimTxt(sp.W, sp.H))} · ${esc(areaTxt(sp.area))}</dd></div>
          <div><dt>Margin left</dt><dd class="num">${sp.mx < 0.005 && sp.my < 0.005 ? 'None: fills the space' : esc(lenTxt(sp.mx, 2)) + ' wide · ' + esc(lenTxt(sp.my, 2)) + ' high'}</dd></div>
          <div><dt>Aspect ratio</dt><dd class="num">${esc(ratioTxt(sp.W, sp.H))}</dd></div>
          <div><dt>Resolution</dt><dd class="num"><b>${pxTxt(sp.pxW, sp.pxH)}</b></dd></div>
        </dl>${sp.tooSmall ? '<p class="warn meta-s"><i aria-hidden="true"></i>The space is smaller than one cabinet; one is shown.</p>' : ''}</div>`).join('');
    const per = C.cabs, kgT = C.kg ? nf(C.kg, 0) + ' kg' : null, wT = C.wMax ? nf(C.wMax / 1000, 1) + ' kW max' + (C.wAvg ? ' · ' + nf(C.wAvg / 1000, 1) + ' kW typical' : '') : null;
    return `<div class="cabset">
        <fieldset class="fs"><legend class="meta">Cabinet size${own ? ' · the i9 ' + pitchTxt(m.pitch) + ' is built on ' + esc(own.name) + ' mm cabinets' : m && m.maker === 'i9' ? ' · for the i9 ' + pitchTxt(m.pitch) + ' the size is to confirm with factory' : ''}</legend>
          <div class="cbs">${rec.map(cabBtn).join('')}</div>
          ${own ? `<p class="meta-s cabown">Fixed for this model. ${C.pxc[0]} × ${C.pxc[1]} px per cabinet, computed from the pitch${m.cabNote ? ': ' + esc(m.cabNote) : ''}. Module resolution to confirm with factory. Other sizes are for generic pitches.</p>` : ''}
          ${others.length ? `<button type="button" class="tbtn morec" data-allc="${Z.allc ? 0 : 1}" aria-expanded="${!!Z.allc}">${Z.allc ? 'Hide other sizes' : `Other sizes (${others.length})`}</button>${Z.allc ? `<div class="cbs other">${others.map(cabBtn).join('')}</div>` : ''}` : ''}
        </fieldset>
        ${shapeUI(C)}
        <div class="fq"><span class="ql">Fit<span class="meta-s">Fill takes every whole cabinet the space holds; 16:9 picks the grid nearest 16:9.</span></span>
          <span class="seg" role="group" aria-label="Fit"><button type="button" data-fit="fill" aria-pressed="${Z.fit === 'fill'}">Fill the space</button><button type="button" data-fit="169" aria-pressed="${Z.fit === '169'}">Closest to 16:9</button></span></div>
        <div class="fq"><span class="ql">Units</span>${unitSeg()}</div>
      </div>
      <figure class="lelev"><figcaption class="meta"><span class="tally"></span>Front view · ${C.screens.length > 1 ? C.screens.length + ' ' + (Z.shape === 'corner' ? 'surfaces, unfolded' : 'screens') : Z.shape === 'curved' ? 'the wall, unrolled' : 'the wall'} · cabinet seams drawn</figcaption>${elevation(C)}</figure>
      ${Z.shape !== 'flat' ? `<figure class="lelev"><figcaption class="meta"><span class="tally"></span>Top view · ${Z.shape === 'curved' ? 'arc and chord' : Z.cn === 'floor' ? 'wall and floor' : 'two walls at 90°'}</figcaption>${planView(C)}</figure>` : ''}
      <div class="lres${C.screens.length > 1 ? ' multi' : ''}">${res}
        <dl class="ospec tot">
          <div><dt>Total</dt><dd class="num"><b>${n0(per)}</b> cabinets · ${esc(areaTxt(C.area))} · ${(C.px / 1e6).toFixed(2)} MP</dd></div>
          <div><dt>Pixels per cabinet</dt><dd class="num">${C.pxc[0]} × ${C.pxc[1]} px <span class="ap">${pxLabel(C)}</span></dd></div>
          <div><dt>Weight</dt><dd${kgT ? ' class="num"' : ' class="tc"'}>${kgT || TO_CONFIRM}</dd></div>
          <div><dt>Power</dt><dd${wT ? ' class="num"' : ' class="tc"'}>${wT || TO_CONFIRM}</dd></div>
        </dl></div>`;
  }

  /* ----- step 5 helpers: shape controls and the top view ----- */
  const shapeGlyph = k => `<svg viewBox="0 0 48 26" aria-hidden="true">${k === 'flat' ? '<path d="M4 8h40"/>' : k === 'curved' ? '<path d="M4 20 Q24 -2 44 20"/>' : '<path d="M8 22V6h36"/>'}</svg>`;
  function shapeUI(C) {
    const m = C.m, shp = shapesOf(m); if (!shp) return '';
    if (Z.lay !== 'single') return `<p class="meta-s cabown">This cabinet also mounts curved or cornered, for a single wall (step 3).</p>`;
    let ctl = '';
    if (Z.shape === 'curved') {
      const g = C.screens[0].geo;
      ctl = `<div class="fq"><span class="ql">Angle per joint<span class="meta-s">Between two neighbouring cabinets, in 0.5° steps. The cabinet’s maximum: to confirm with factory.</span></span>
          <span class="step"><button type="button" data-ja="-0.5" aria-label="Half a degree less"${Z.ja <= 0.5 ? ' disabled' : ''}>${icon('minus')}</button><output aria-live="polite">${nf(Z.ja, 1)}°</output><button type="button" data-ja="0.5" aria-label="Half a degree more"${Z.ja >= 10 ? ' disabled' : ''}>${icon('plus')}</button></span></div>
        <dl class="ospec cgeo">
          <div><dt>Total bend</dt><dd class="num">${nf(g.bend, 1)}° <span class="ap">${g.n - 1} joints × ${nf(Z.ja, 1)}°</span></dd></div>
          <div><dt>Arc length</dt><dd class="num">${esc(lenTxt(g.arc, 2))} <span class="ap">the LED surface</span></dd></div>
          <div><dt>Chord width</dt><dd class="num"><b>${esc(lenTxt(g.chord, 2))}</b> <span class="ap">straight, end to end</span></dd></div>
          <div><dt>Depth</dt><dd class="num">${esc(lenTxt(g.depth, 2))} <span class="ap">chord to the back of the curve</span></dd></div>
          <div><dt>Radius</dt><dd class="num">≈ ${esc(lenTxt(g.R, 1))}</dd></div>
        </dl>`;
    } else if (Z.shape === 'corner') {
      ctl = `<div class="fq"><span class="ql">Corner</span><span class="seg" role="group" aria-label="Corner"><button type="button" data-cn="walls" aria-pressed="${Z.cn === 'walls'}">Two walls at 90°</button><button type="button" data-cn="floor" aria-pressed="${Z.cn === 'floor'}">Wall + LED floor</button></span></div>
        <div class="fq"><span class="ql">${Z.cn === 'floor' ? 'Floor depth' : 'Side wall width'}<span class="meta-s">${Z.cn === 'floor' ? 'How far the LED floor comes out from the wall. Floor load rating: to confirm with factory.' : 'The second wall, on the left, at 90° to the main wall; same height.'}</span></span>${lenInput('lz-wd', Z.wd, Z.cn === 'floor' ? 'Floor depth' : 'Side wall width')}</div>`;
    }
    return `<fieldset class="fs"><legend class="meta">Shape · these cabinets mount at angles</legend>
        <div class="lays shp">${shp.map((k, i) => `<button type="button" class="lay${Z.shape === k ? ' on' : ''}" data-shape="${k}" aria-pressed="${Z.shape === k}"><span class="lg">${shapeGlyph(k)}</span><span class="n">${pad2(i + 1)}<i aria-hidden="true"></i></span><b>${SHAPES[k][0]}</b><span class="meta-s">${SHAPES[k][1]}</span></button>`).join('')}</div>
        ${ctl}</fieldset>`;
  }
  /* top view (plan): the wall seen from above, audience at the bottom */
  function planView(C) {
    const main = C.screens[0], cw = C.cab.w / 1000;
    let segs = [], extra = '', W, Hh, labels = '';
    if (Z.shape === 'curved') {
      const g = main.geo, ymin = Math.min(...g.pts.map(p => p[1]));
      const P = g.pts.map(p => [p[0], p[1] - ymin]);
      segs = P.slice(0, -1).map((p, i) => [p, P[i + 1]]);
      W = g.chord; Hh = Math.max(g.depth, 0.6);
      const yb = P[P.length - 1][1];
      extra = `<line class="ch" x1="0" y1="${yb}" x2="${W}" y2="${yb}"/>`;
      labels = [[W / 2, yb, 'chord ' + lenTxt(g.chord, 2), 'b'], [W / 2, 0, 'arc ' + lenTxt(g.arc, 2) + ' · ' + nf(g.bend, 1) + '°', 't']];
    } else {
      const ww = main.W, wing = C.screens[1];
      segs = [[[0, 0], [ww, 0]]];
      if (Z.cn === 'floor') { extra = `<rect class="flr" x="0" y="0" width="${ww}" height="${wing.H}"/>`; W = ww; Hh = wing.H; labels = [[ww / 2, 0, 'wall ' + lenTxt(ww, 2), 't'], [ww / 2, wing.H, 'floor ' + lenTxt(wing.H, 2) + ' deep', 'b']]; }
      else { segs.push([[0, 0], [0, wing.W]]); W = ww; Hh = wing.W; labels = [[ww / 2, 0, 'main ' + lenTxt(ww, 2), 't'], [0, wing.W, 'side ' + lenTxt(wing.W, 2), 'b']]; }
    }
    const pad = Math.max(W, Hh) * 0.08 + 0.4, VW = W + pad * 2, VH = Hh + pad * 2.4, fs = Math.max(VW / (window.innerWidth < 700 ? 34 : 64), 0.12);
    let s = `<svg class="elev plan" viewBox="${-pad} ${-pad * 1.2} ${VW} ${VH}" role="img" aria-label="Top view of the wall">${extra}`;
    segs.forEach(([a, b]) => { s += `<line class="cabseg" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`; });
    if (Z.shape === 'corner') { const n = main.cols; for (let i = 1; i < n; i++) s += `<line class="tick" x1="${i * cw}" y1="-0.05" x2="${i * cw}" y2="0.05"/>`; }
    else segs.forEach(([a]) => { s += `<circle class="jt" cx="${a[0]}" cy="${a[1]}" r="${fs * 0.18}"/>`; });
    labels.forEach(([x, y, t, v]) => { s += `<text class="dim" x="${x}" y="${v === 't' ? y - fs * 0.7 : y + fs * 1.4}" font-size="${fs}" text-anchor="middle">${esc(t)}</text>`; });
    s += `<text class="mg" x="${W / 2}" y="${Hh + pad * 1.05}" font-size="${fs * 0.85}" text-anchor="middle">AUDIENCE / CAMERA ↓</text>`;
    return s + '</svg>';
  }

  /* ----- step 6: signal and processing ----- */
  function portsViz(used, total) {
    if (total > 40) { const f = Math.min(1, used / total); return `<span class="pbar" aria-hidden="true"><i style="width:${(f * 100).toFixed(1)}%"></i></span>`; }
    return `<span class="pts" aria-hidden="true">${Array.from({ length: total }, (_, i) => `<i class="${i < used ? 'on' : ''}"></i>`).join('')}</span>`;
  }
  const vf = (p, f) => p.verify.includes(f) ? ' <span class="vf" title="Arithmetic on the spec sheet, or not printed: verify">verify</span>' : '';
  function step6(C, PR) {
    const r = PR.chosen, p = r.p, rule = L.PORT_RULES[p.rule], fb = isFinite(r.units) ? fibreOf(Z, r) : null;
    const src = SRC[Z.src], cv = C.canvas;
    let mapT, mapW = false;
    if (Z.map === '1to1') {
      if (cv[0] > src[0] || cv[1] > src[1]) { mapW = true; mapT = `At 1:1 a ${Z.src === '4k' ? '4K' : '1080p'} source covers ${n0(Math.min(cv[0], src[0]))} × ${n0(Math.min(cv[1], src[1]))} of the ${pxTxt(cv[0], cv[1])} canvas. Choose ${Z.src === '4k' ? 'scaled' : '4K or scaled'}, or feed a custom canvas from a media server.`; }
      else mapT = `1:1: the wall shows ${pxTxt(cv[0], cv[1])} of the ${src[0]} × ${src[1]} source, pixel for pixel. Make content at that size, or the rest is cropped.`;
    } else mapT = `Scaled: the processor fits the ${src[0]} × ${src[1]} source to the ${pxTxt(cv[0], cv[1])} canvas. Content made at the native size looks sharpest.`;
    const per = r.p.rule === 'brom' ? 'Brompton nominal' : rule.label;
    const why = r.cpp < 1 ? 'At this setting one cabinet is more than a port carries. Lower the frame rate or bit depth.' :
      `${n0(C.cabs)} cabinets of ${C.pxc[0]} × ${C.pxc[1]} px. At ${Z.bits}-bit ${Z.fps} Hz one port carries ${n0(r.cap)} px, so ${r.cpp} cabinet${r.cpp > 1 ? 's' : ''} per port and ${r.ports} port${r.ports > 1 ? 's' : ''}${Z.bk ? ', doubled for the backup loop' : ''}.`;
    const controls = `<div class="sigc">
        <div class="fq"><span class="ql">Inputs at the wall<span class="meta-s">Pick every kind of source the show uses.</span></span>
          <span class="chips">${Object.keys(INPUTS).map(k => `<button type="button" class="chip" data-inp="${k}" aria-pressed="${Z.inp.includes(k)}">${esc(INPUTS[k])}</button>`).join('')}</span></div>
        <div class="fq"><span class="ql">Source resolution</span><span class="seg" role="group" aria-label="Source resolution"><button type="button" data-src="hd" aria-pressed="${Z.src === 'hd'}">1080p</button><button type="button" data-src="4k" aria-pressed="${Z.src === '4k'}">4K UHD</button></span></div>
        <div class="fq"><span class="ql">Pixel mapping</span><span class="seg" role="group" aria-label="Pixel mapping"><button type="button" data-map="1to1" aria-pressed="${Z.map === '1to1'}">1:1</button><button type="button" data-map="scaled" aria-pressed="${Z.map === 'scaled'}">Scaled</button></span></div>
        <p class="mapn meta-s${mapW ? ' w' : ''}">${mapW ? '<i aria-hidden="true"></i>' : ''}${esc(mapT)}</p>
        <div class="fq"><span class="ql">Frame rate</span><span class="seg sm" role="group" aria-label="Frame rate">${[30, 50, 60, 120, 240].map(f => `<button type="button" data-fps="${f}" aria-pressed="${Z.fps === f}">${f} Hz</button>`).join('')}</span></div>
        <div class="fq"><span class="ql">Video bit depth<span class="meta-s">What the processor sends. The panel’s own grayscale (14-bit on the i9 COB) is made on the receiving card and doesn’t load the port.</span></span><span class="seg sm" role="group" aria-label="Video bit depth">${[8, 10, 12].map(b => `<button type="button" data-bits="${b}" aria-pressed="${Z.bits === b}">${b}-bit</button>`).join('')}</span></div>
        <div class="fq"><span class="ql">Genlock to studio sync<span class="meta-s">${xrOf(Z) ? 'On for XR: wall, cameras and render engine lock to one sync.' : 'Lock the wall to the studio’s sync, as broadcast and XR need.'}</span></span><span class="seg" role="group" aria-label="Genlock to studio sync"><button type="button" data-gl="0" aria-pressed="${!glNeed(Z)}">No</button><button type="button" data-gl="1" aria-pressed="${glNeed(Z)}">Yes</button></span></div>
        <div class="fq"><span class="ql">Backup data loop<span class="meta-s">A second cable to every chain, common in rental and broadcast. Doubles the ports.</span></span><span class="seg" role="group" aria-label="Backup data loop"><button type="button" data-bk="0" aria-pressed="${!Z.bk}">No</button><button type="button" data-bk="1" aria-pressed="${!!Z.bk}">Yes</button></span></div>
        <div class="fq"><span class="ql">Processor to wall<span class="meta-s">Cable run from the control position to the wall.</span></span><span class="cin">${lenInput('lz-run', Z.run, 'Cable run from processor to wall')}${unitSeg()}</span></div>
      </div>`;
    /* locked: the inputs above stay live; the result is drawn as its shape only. Nothing computed for the plan
       (model, count, ports, loads, fibre, cards, warnings) is written while nobody is signed in. */
    if (!signed()) return `<div class="sgrid">${controls}<div class="sres">${step6Locked()}</div></div>`;
    const card = `<div class="prc" tabindex="-1">
        <div class="prh"><p class="meta"><span class="tally"></span>${r === PR.rec ? 'Recommended processor' : 'Your choice'}</p>${r !== PR.rec ? `<button type="button" class="textlink sm" data-pr="">Back to the recommendation</button>` : ''}</div>
        <h2>${esc(p.brand)} ${esc(p.model)}${isFinite(r.units) && r.units > 1 ? ` <span class="ux">× ${r.units}</span>` : ''}</h2>
        <p class="why">${esc(why)}</p>
        <div class="pport"><span class="meta">Ethernet ports${vf(p, 'ports')}</span><b class="num">${isFinite(r.units) ? r.ports : '—'} <small>of ${n0(p.ports * (isFinite(r.units) ? r.units : 1))}</small></b>${portsViz(Math.min(r.ports, p.ports * (isFinite(r.units) ? r.units : 1)), Math.min(400, p.ports * (isFinite(r.units) ? r.units : 1)))}</div>
        <dl class="ospec">
          <div><dt>Per port</dt><dd class="num">${n0(r.cap)} px at ${Z.bits}-bit ${Z.fps} Hz <span class="ap">${esc(per)}</span>${rule.verify ? ' <span class="vf" title="Colorlight’s spec PDF could not be read: verify">verify</span>' : ''}</dd></div>
          <div><dt>Pixel load</dt><dd class="num">${n0(C.px)} of ${n0((r.effMax || 0) * (isFinite(r.units) ? r.units : 1))}</dd></div>
          <div><dt>Max canvas</dt><dd class="num">${n0(p.maxW)} × ${n0(p.maxH)}${vf(p, 'maxW')}</dd></div>
          <div><dt>Inputs</dt><dd>${esc(p.inText)}</dd></div>
          <div><dt>Genlock</dt><dd>${esc(p.glText)}${p.genlock == null ? ' <span class="vf" title="Not stated on the official spec: verify">verify</span>' : ''}</dd></div>
          <div><dt>Frame rate</dt><dd>${esc(p.hzText)}</dd></div>
          <div><dt>Fibre</dt><dd>${fb ? esc(fb.t) : '—'}</dd></div>
          <div><dt>Receiving cards</dt><dd class="num">${n0(C.cabs)} <span class="ap">one per cabinet, typical; to confirm with factory</span></dd></div>
        </dl>
        ${r.inMiss.length ? `<p class="warn meta-s"><i aria-hidden="true"></i>No ${esc(r.inMiss.map(i => INPUT_WORD[i]).join(' or '))} input on the ${esc(p.model)}: add a converter, or pick a processor that has it.</p>` : ''}
        ${!r.glOk ? `<p class="warn meta-s"><i aria-hidden="true"></i>${esc(p.model)}: ${p.genlock === 'source' ? 'locks to its source only, no external genlock input' : 'genlock not stated on the spec sheet'}. For XR pick a processor with genlock.</p>` : ''}
        ${!r.hzOk ? `<p class="warn meta-s"><i aria-hidden="true"></i>${esc(p.model)} inputs go to ${p.maxHz} Hz; ${Z.fps} Hz needs a high-frame-rate processor.</p>` : ''}
        ${Z.fps > 60 && Z.inp.includes('sdi') ? `<p class="warn meta-s"><i aria-hidden="true"></i>12G-SDI inputs stop at 60 Hz on every processor here: feed ${Z.fps} Hz over HDMI 2.0 or DisplayPort.</p>` : ''}
        ${!r.k4 ? `<p class="warn meta-s"><i aria-hidden="true"></i>The ${esc(p.model)} takes up to 1080p-class sources; a 4K source needs a 4K processor.</p>` : ''}
        ${p.notes ? `<p class="meta-s pn">${esc(p.notes)}</p>` : ''}
        <p class="src meta-s"><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Maker’s spec sheet ${icon('arrow-up-right')}</a><span>Read ${esc(p.read)}</span></p>
      </div>`;
    const list = `<div class="prl" role="radiogroup" aria-label="Processors">${PR.rows.map(x => { const on = x === r;
        return `<button type="button" class="pr ${x.status}${on ? ' on' : ''}" role="radio" aria-checked="${on}" data-pr="${x.p.id}">
          <span class="pb meta-s">${esc(x.p.brand)}</span><b>${esc(x.p.model)}</b>
          <span class="pq meta-s num">${x.p.ports}${x.p.verify.includes('ports') ? '*' : ''} ports · ${(x.p.maxPx / 1e6).toLocaleString('en-US', { maximumFractionDigits: 2 })} MP</span>
          <span class="ps meta-s">${x === PR.rec ? '<span class="rk">Pick</span>' : ''}${esc(x.st)}</span></button>`; }).join('')}</div>
      <p class="meta-s fnote">Small to large. * port count is arithmetic on the spec sheet: verify. Max loads as each maker states them; per-port loads from NovaStar’s formula (MX40 Pro sheet), Brompton’s help pages and, for Colorlight, its max load ÷ ports.</p>`;
    return `<div class="sgrid">${controls}<div class="sres">${card}<h3 class="lh meta">All processors against this wall</h3>${list}</div></div>`;
  }
  function step6Locked() {
    const rows = [['Per port', '15ch'], ['Pixel load', '13ch'], ['Max canvas', '9ch'], ['Inputs', '19ch'], ['Genlock', '14ch'], ['Frame rate', '10ch'], ['Fibre', '17ch'], ['Receiving cards', '6ch']];
    const card = `<div class="prc lockd">
        <div class="prh"><p class="meta"><span class="tally"></span>Recommended processor</p><span class="lkb meta">${icon('lock')}<span class="lkt">Project account</span></span></div>
        <h2 class="rdh"><span class="sr">Processor model and count: free with a project account.</span>${rd('6.2em')} <span class="ux" aria-hidden="true">×</span>${rd('.62em', 'sq')}</h2>
        <p class="why rdw">${rd('94%')}${rd('58%')}</p>
        <div class="pport"><span class="meta">Ethernet ports</span><b class="num"><span class="sr">Used and available ports: free with a project account.</span>${rd('1.1em')} <small aria-hidden="true">of</small> ${rd('1.4em')}</b><span class="pts lk" aria-hidden="true">${'<i></i>'.repeat(12)}</span></div>
        <dl class="ospec">${rows.map(([k, w]) => `<div><dt>${k}</dt><dd>${rd(w)}<span class="sr">${LOCKED}</span></dd></div>`).join('')}</dl>
        ${gateBox('proc')}
      </div>`;
    const W = [['8ch', '9ch', '13ch', '10ch'], ['9ch', '6ch', '12ch', '8ch'], ['10ch', '8ch', '14ch', '6ch'], ['8ch', '10ch', '12ch', '9ch']];
    const list = `<div class="prl lk" aria-hidden="true">${W.map(w => `<div class="pr"><span class="pb">${rd(w[0])}</span><b>${rd(w[1])}</b><span class="pq">${rd(w[2])}</span><span class="ps">${rd(w[3])}</span></div>`).join('')}</div>
      <p class="meta-s fnote">Every processor we check against this wall, small to large, with ports, load and fit. It comes with the plan.</p>`;
    return `${card}<h3 class="lh meta">All processors against this wall</h3>${list}`;
  }

  /* ----- step 7: 3D ----- */
  function step7() {
    /* the overview is free; standing in the rows comes with the account (the buttons open the account sheet) */
    const pov = (v, t) => signed() ? `<button type="button" data-v3="${v}" aria-pressed="false">${t}</button>`
      : `<button type="button" class="lk" data-acct="new" data-from="3d" aria-label="${t}: free with a project account">${icon('lock')}${t}</button>`;
    return `<div class="g3">
      <div class="g3bar"><div class="seg sm g3v" role="group" aria-label="View"><button type="button" data-v3="o" aria-pressed="true">Overview</button>${pov('c', 'From the closest row')}${pov('t', 'From the typical row')}</div>
        <button type="button" class="tbtn" id="g3-reset">Reset view</button><span class="meta-s g3h">Drag to orbit · scroll or pinch to zoom</span></div>
      <div class="g3box" id="g3box"><div class="g3msg" id="g3msg"><span class="meta"><span class="tally"></span>Building the wall…</span></div><p class="g3pov meta" id="g3pov" hidden></p></div>
      ${signed() ? '' : `<p class="g3lock meta-s">${icon('lock')}<span>${esc(GATE_T['3d'])} <button type="button" class="lnk" data-acct="new" data-from="3d">Create free project account</button></span></p>`}
      <p class="meta-s g3note">Massing model. Assumed heights: wall bottom ${Z.shape === 'corner' && Z.cn === 'floor' ? 'on the LED floor' : Z.mount === 'flown' ? '1.5 m (flown trim)' : Z.mount === 'ground' ? 'on a 0.15 m base' : '1.0 m above the floor'}; cabinet depth 0.1 m; person 1.75 m. The structure is drawn to show the kind of mounting, not engineered.</p>
    </div>`;
  }
  function data3d(C) {
    return { mount: Z.mount, lay: Z.lay, dc: Z.dc, dt: Z.dt, u: Z.u, unitLabel: m => lenTxt(m, 1), pitch: C.pitch,
      shape: Z.shape, cn: Z.cn,
      screens: C.screens.map(s => ({ k: s.k, label: s.label, seg: !!s.seg, cols: s.cols, rows: s.rows, W: s.W, H: s.H, cw: C.cab.w / 1000, ch: C.cab.h / 1000, pts: s.geo ? s.geo.pts : null, ja: s.geo ? Z.ja : 0 })) };
  }
  function hasWebGL() { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
  function mount3d(C) {
    const box = $('#g3box'), msg = $('#g3msg');
    const fail = why => { msg.classList.add('fail'); msg.innerHTML = `<span class="meta"><span class="tally"></span>Front view</span><b>${esc(why)}</b>${elevation(C, { label: 'Front view of the LED wall (3D unavailable)' })}<span class="meta-s">Your wall is unchanged; the spec in step 8 is complete without the 3D view.</span>`; box.classList.add('flat'); };
    if (!hasWebGL()) { fail('The 3D view needs WebGL, which this browser has turned off. Here is the front view.'); return; }
    const want = Z.s;
    import('./led-3d.js').then(m => {
      if (Z.s !== want || !document.body.contains(box)) return;
      try { G3 = m.mount(box, data3d(C), { onPov: v => povLabel(v) }); msg.hidden = true; }
      catch (e) { fail('The 3D view couldn’t start here. Here is the front view.'); }
    }).catch(() => { if (Z.s === want) fail('The 3D view couldn’t load (it needs an internet connection the first time). Here is the front view.'); });
  }
  function povLabel(v) {
    const p = $('#g3pov'); if (!p) return;
    $$('[data-v3]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v3 === (v || 'o'))));
    if (!v) { p.hidden = true; return; }
    p.hidden = false; p.innerHTML = `<span class="tally"></span>Seated eye height · ${esc(lenTxt(v === 'c' ? Z.dc : Z.dt, 1))} from the wall`;
  }

  /* ----- step 8: review and quote ----- */
  function specRows(C, PR) {
    const m = C.m, r = PR.chosen, U = L.USES[Z.use];
    const rows = [
      ['Use', `${U.label} · ${Z.env === 'out' ? 'outdoor' : 'indoor'}`],
      ['Installation', MOUNTS[Z.mount].label],
      ['Rental', Z.rent ? 'Yes: touring cabinets, frequent assembly' : 'No: fixed install'],
      ['Screens', C.screens.length === 1 ? '1 wall' : C.screens.map(s => s.label).join(', ')],
      ['Model', m.maker === 'i9' ? `i9 ${m.name} (i9 manufactured) · ${m.grayBits}-bit · ${n0(m.refreshHz)} Hz` : `Generic ${pitchTxt(m.pitch)} mm · factory proposes the model`],
      ['Pixel pitch', pitchTxt(m.pitch) + ' mm'],
      ['Cabinet', `${C.cab.name} mm${C.own ? ' (i9 cabinet)' : ''} · ${C.pxc[0]} × ${C.pxc[1]} px each, ${pxLabel(C)}`],
    ];
    C.screens.forEach(s => rows.push([C.screens.length > 1 ? s.label : 'Wall', `${s.cols} × ${s.rows} = ${s.cabs} cabinets · ${dimTxt(s.W, s.H)} · ${pxTxt(s.pxW, s.pxH)}`]));
    if (Z.shape === 'curved') { const g = C.screens[0].geo; rows.push(['Shape', `Curved · ${nf(Z.ja, 1)}° per joint · ${nf(g.bend, 1)}° total bend · arc ${lenTxt(g.arc, 2)} · chord ${lenTxt(g.chord, 2)} · depth ${lenTxt(g.depth, 2)}`]); }
    else if (Z.shape === 'corner') rows.push(['Shape', Z.cn === 'floor' ? 'Cornered · wall + LED floor (floor load rating to confirm with factory)' : 'Cornered · two walls at 90°']);
    rows.push(['Total', `${n0(C.cabs)} cabinets · ${areaTxt(C.area)} · ${n0(C.px)} px`]);
    rows.push(['Viewing', `closest ${lenTxt(Z.dc)} · typical ${lenTxt(Z.dt)}`]);
    /* gated lines: while nobody is signed in only their label is kept (the value is never built) */
    const lk = !signed();
    rows.push(['Processor', lk ? LOCKED : `${r.p.brand} ${r.p.model}${isFinite(r.units) && r.units > 1 ? ' × ' + r.units : ''} · ${r.ports} of ${r.p.ports * (isFinite(r.units) ? r.units : 1)} ports${Z.bk ? ' (with backup loop)' : ''}`]);
    rows.push(['Signal', `${Z.inp.length ? Z.inp.map(i => INPUTS[i]).join(', ') : 'Inputs to define'} · ${SRC[Z.src][2]} · ${Z.map === '1to1' ? '1:1 mapping' : 'scaled'} · ${Z.bits}-bit ${Z.fps} Hz`]);
    rows.push(['Genlock', lk ? LOCKED : glNeed(Z) ? `Needed · ${r.p.model}: ${r.p.genlock === true ? 'yes' : r.p.genlock === 'source' ? 'source lock only' : 'not stated, verify'}` : 'Not needed']);
    rows.push(['Cable run', lk ? LOCKED : `${lenTxt(Z.run, 0)} · ${isFinite(r.units) ? fibreOf(Z, r).t : '—'}`]);
    rows.push(['Weight, power', C.kg ? `${nf(C.kg, 0)} kg` : TO_CONFIRM]);
    if (m.maker === 'i9') rows.push(['To confirm', (m.cabinet ? '' : 'Cabinet size, ') + 'Module resolution, brightness, weight and power of the i9 model, with the factory']);
    return rows;
  }
  function step8(C, PR) {
    const rows = specRows(C, PR);
    return `<div class="qgrid">
      <section class="stage sheet" aria-labelledby="sheet-h" data-slate>
        <div class="slate-tab" aria-hidden="true"><i></i><span>LED</span><b>Spec sheet</b></div>
        <div class="sh-in">
          <div class="sh-top"><div><p class="meta">i9Store Pro · LED wall · for a factory quote</p><h2 id="sheet-h">${esc(L.USES[Z.use].label)}${C.screens.length > 1 ? ', ' + C.screens.length + ' screens' : ''}</h2></div>
            <p class="sh-big num"><b>${pxTxt(C.canvas[0], C.canvas[1])}</b><span class="meta-s">${n0(C.cabs)} cabinets · ${esc(areaTxt(C.area))}</span></p></div>
          <figure class="sh-elev">${elevation(C, { label: 'Front view for the spec sheet' })}</figure>
          <dl class="sh-dl">${rows.map(([k, v], i) => `<div${v === LOCKED ? ' class="lkr"' : ''}><dt>${esc(k)}</dt>${v === LOCKED ? `<dd>${rd(['24ch', '17ch', '28ch'][i % 3])}${icon('lock')}<span class="sr">${LOCKED}</span></dd>` : `<dd${v === TO_CONFIRM ? ' class="tc"' : ''}>${esc(v)}</dd>`}</div>`).join('')}</dl>
          <p class="sh-note meta-s">No prices: LED walls are built to order and quoted with the factory. Pixels per cabinet are approximate until the factory confirms the module resolution. Processor figures are from the makers’ spec sheets, read ${esc(L.READ)}.</p>
          ${signed() ? '' : `<p class="sh-lock meta-s">${icon('lock')}<span>${esc(GATE_T.sheet)}</span></p>`}
          <div class="sh-acts">${signed() ? `<button type="button" class="btn sm" id="lz-print">Print the spec sheet</button><button type="button" class="btn sm" id="lz-saveproj">Save project</button>`
            : `<button type="button" class="btn sm lk" data-acct="new" data-from="sheet">${icon('lock')}Print the spec sheet</button><button type="button" class="btn sm lk" data-acct="new" data-from="save">${icon('lock')}Save project</button>`}
            <!-- Integration comes later: the LED wall will join the room plan as one "to quote" line. For now this only opens the planner. -->
            <a class="textlink" href="planner.html" id="lz-toplan">Add to my room plan ${icon('arrow-right')}</a></div>
          <p class="sh-saved meta-s" id="lz-saved" role="status" hidden></p>
        </div>
      </section>
      <section class="qform" aria-labelledby="qf-h">
        <div id="qf-wrap">${signed() ? quoteSigned() : `
        <p class="meta"><span class="tally"></span>Request a factory quote</p>
        <h2 id="qf-h">Who should we send it to?</h2>
        <p class="qf-p">A specialist checks the spec with you, then i9 quotes it with the factory. The request also saves the project to a free account: the processor plan, the full spec sheet and an engineer’s review.</p>
        <p class="acct-proto meta-s"><i aria-hidden="true"></i>Prototype: nothing is sent; no account is created.</p>
        ${acctForm('quote', 'new')}`}
        </div>
        <div class="qsent" id="qsent" hidden tabindex="-1"></div>
      </section>
    </div>`;
  }
  function quoteText(C, PR) {
    return ['i9Store Pro · LED wall · factory quote request', ''].concat(specRows(C, PR).map(([k, v]) => `${k}: ${v}`)).concat(['', 'Reopen this wall: ' + location.href.split('#')[0] + hashOf()]).join('\n');
  }
  /* signed in: the contact comes from the account, so the form keeps only what belongs to this request */
  function quoteSigned() {
    return `<p class="meta"><span class="tally"></span>Request a factory quote</p>
        <h2 id="qf-h">Send it to the factory.</h2>
        <p class="qf-p">A specialist checks the spec with you, then i9 quotes it with the factory: price, lead time and shipping to you. Installation, configuration and training by i9TV in Florida and Brazil, and in Latin America under contract, with an optional support plan (SLA).</p>
        <div class="qacc"><p class="meta">From your project account</p><b>${esc(ACC.name)}</b><span class="meta-s">${ACC_ORG ? esc(ACC_ORG) + ' · ' : ''}${esc(ACC.emailMasked)}</span>
          <p class="meta-s">Signed in as <b>${esc(ACC.name)}</b> · <button type="button" class="lnk" data-signout>Sign out</button></p></div>
        <form id="qf" novalidate>
          <label class="fld"><span>${Z.rent ? 'Event date' : 'Install date'} <em>optional</em></span><input name="date" type="date"></label>
          <label class="fld"><span>Notes <em>optional</em></span><textarea name="notes" rows="4" placeholder="Venue, content, deadlines, anything we should know"></textarea></label>
          <p class="qf-err meta-s" id="qf-err" hidden></p>
          <button type="submit" class="btn sig qf-go">Request factory quote ${icon('arrow-right')}</button>
          <p class="meta-s qf-fine">Prototype: nothing is sent from this page.</p>
        </form>`;
  }
  function submitQuote() {
    const f = $('#qf'); if (!f) return;
    if (f.classList.contains('af')) { afSubmit(f); return; }   /* nobody signed in: the request creates the account */
    const err = $('#qf-err');
    if (!f.checkValidity()) {
      const bad = [...f.elements].find(e => e.willValidate && !e.checkValidity());
      err.hidden = false; err.textContent = 'Check the date.';
      if (bad) bad.focus();
      return;
    }
    err.hidden = true;
    showSent();
  }
  function showSent() {
    /* PRODUCTION: this is where the lead goes to Central → Comercial (the sales pipeline) as an opportunity on the
       customer's account: the account, the spec rows above, the computed plan, the share link (#l=), the source page
       and the UTM of the visit. Contact fields travel in the request body only, never in a URL. This prototype sends
       nothing: no fetch, no beacon, no storage of the form. */
    if (!signed()) return;
    const C = calc(), PR = procs(Z, C), s = $('#qsent'); if (!s) return;
    $('#qf-wrap').hidden = true; s.hidden = false;
    s.innerHTML = `<p class="meta"><span class="tally"></span>Prototype: nothing is sent</p>
      <h2>This is where the request would go to i9.</h2>
      <p class="qs-acc"><b>Project saved · ${esc(ACC.id)}</b><span>Our team will contact you to continue the project.</span></p>
      <p>In the live store, a specialist would receive the spec below with your account details, check it with you and quote it with the factory. On this prototype nothing left the page and no account was created.</p>
      <pre tabindex="0" id="qtext">${esc(quoteText(C, PR))}</pre>
      <div class="qs-acts"><button type="button" class="btn sm" id="q-copy">Copy summary</button><button type="button" class="btn sm" id="q-edit">Back to the form</button></div>`;
    live('Prototype: nothing is sent. The request summary is shown.');
    s.focus();
  }

  /* ======================= render ======================= */
  /* replacing the panel removes a focused length field; its blur can fire 'change' mid-render: that change is applied
     to the state and drawn on the next tick instead of re-entering render() */
  let rendering = false, again = false, renders = 0;
  function render() {
    rendering = true; renders++;
    try { renderNow(); } finally { rendering = false; }
    if (again) { again = false; setTimeout(() => { render(); save(); }, 0); }
  }
  function renderNow() {
    unmount3d();
    settle();
    const C = calc(), PR = Z.m ? procs(Z, C) : null;
    renderChrome(C);
    const s = Z.s;
    panel.className = 'lz-panel s' + s;
    const aside = s >= 2 && s <= 7 ? `<aside class="lsum" aria-label="Your wall so far">${summary(C, PR)}</aside>` : '';
    let main = s === 1 ? step1() : s === 2 ? step2() : s === 3 ? `<div class="s3g"><div class="s3f">${step3()}</div>${side3()}</div>` : s === 4 ? step4() : s === 5 ? step5(C) : s === 6 ? step6(C, PR) : s === 7 ? step7() : step8(C, PR);
    panel.innerHTML = aside ? `<div class="lgrid"><div class="lmain">${main}</div>${aside}</div>` : main;
    if (s === 7) mount3d(C);
  }
  function rerender(sel) { render(); save(); if (sel) { const e = $(sel, panel); if (e) e.focus({ preventScroll: true }); } }

  /* ======================= events ======================= */
  stepsEl.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b && !b.disabled) go(+b.dataset.go); });
  $('#lz-back').addEventListener('click', () => go(Z.s - 1));
  $('#lz-next').addEventListener('click', () => { if (Z.s === NSTEP) { const f = $('#qf'); if (f && !$('#qf-wrap').hidden) submitQuote(); else { $('#qsent')?.focus(); } return; } go(Z.s + 1); });
  panel.addEventListener('submit', e => { if (e.target.id === 'qf') { e.preventDefault(); submitQuote(); } });
  panel.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const d = b.dataset;
    if (afClick(b)) return;
    if (d.acct) { openAcct(d.acct, d.from, b); return; }
    if (b.hasAttribute('data-signout')) { signOut(); return; }
    if (d.go) { go(+d.go); return; }
    if (d.use) { chooseUse(d.use); rerender(`[data-use="${d.use}"]`); return; }
    if (d.ex) { applyPreset(d.ex); render(); save(); go(5); return; }
    if (d.env) { Z.env = d.env; if (Z.use === 'outdoor' && Z.env === 'in') Z.use = 'retail'; Z.ex = null; rerender(`[data-env="${d.env}"]`); return; }
    if (d.mount) { Z.mount = d.mount; Z.ex = null; rerender(`[data-mount="${d.mount}"]`); return; }
    if (d.rent) { Z.rent = +d.rent; if (Z.rent && Z.mount === 'wall') Z.mount = 'ground'; Z.ex = null; rerender(`[data-rent="${d.rent}"]`); return; }
    if (d.lay) { Z.lay = d.lay; Z.ex = null; rerender(`[data-lay="${d.lay}"]`); return; }
    if (d.u) { const a = document.activeElement && document.activeElement.dataset.u ? `[data-u="${d.u}"]` : null; Z.u = d.u; rerender(a || `[data-u="${d.u}"]`); return; }
    if (d.model) { Z.m = d.model; Z.pr = null; Z.mx = Math.max(Z.mx, 4); rerender(`[data-model="${d.model}"]`); return; }
    if (d.cab) { Z.cab = d.cab; Z.pr = null; rerender(`[data-cab="${d.cab}"]`); return; }
    if (d.allc != null) { Z.allc = +d.allc; rerender('.morec'); return; }
    if (d.shape) { Z.shape = d.shape; Z.pr = null; Z.ex = null; rerender(`[data-shape="${d.shape}"]`); return; }
    if (d.ja) { Z.ja = clamp(Z.ja + +d.ja, 0.5, 10); Z.pr = null; Z.ex = null; rerender(`[data-ja="${d.ja}"]`); return; }
    if (d.cn) { Z.cn = d.cn; Z.pr = null; rerender(`[data-cn="${d.cn}"]`); return; }
    if (d.gl) { Z.gl = +d.gl; Z.pr = null; rerender(`[data-gl="${d.gl}"]`); return; }
    if (d.fit) { Z.fit = d.fit; Z.pr = null; rerender(`[data-fit="${d.fit}"]`); return; }
    if (d.inp) { const s = new Set(Z.inp); s.has(d.inp) ? s.delete(d.inp) : s.add(d.inp); Z.inp = Object.keys(INPUTS).filter(k => s.has(k)); rerender(`[data-inp="${d.inp}"]`); return; }
    if (d.src) { Z.src = d.src; rerender(`[data-src="${d.src}"]`); return; }
    if (d.map) { Z.map = d.map; rerender(`[data-map="${d.map}"]`); return; }
    if (d.fps) { Z.fps = +d.fps; rerender(`[data-fps="${d.fps}"]`); return; }
    if (d.bits) { Z.bits = +d.bits; rerender(`[data-bits="${d.bits}"]`); return; }
    if (d.bk) { Z.bk = +d.bk; rerender(`[data-bk="${d.bk}"]`); return; }
    if (d.pr != null) { Z.pr = d.pr || null; rerender(d.pr ? `[data-pr="${d.pr}"]` : '.prl .pr.on'); return; }
    if (d.v3 && G3) { G3.setView(d.v3 === 'o' ? null : d.v3); return; }
    if (b.id === 'g3-reset' && G3) { G3.reset(); return; }
    if (b.id === 'lz-print') { window.print(); return; }
    if (b.id === 'lz-saveproj') { const t = $('#lz-saved'); if (t && signed()) { t.hidden = false; t.innerHTML = `<b>Project saved · ${esc(ACC.id)}</b> Our team will contact you to continue the project. Prototype: nothing is sent.`; b.classList.add('done'); b.textContent = 'Saved'; } return; }
    if (b.id === 'q-copy') { const t = $('#qtext').textContent; try { navigator.clipboard.writeText(t).then(() => { b.textContent = 'Copied'; }, () => {}); } catch (e) {} return; }
    if (b.id === 'q-edit') { $('#qsent').hidden = true; $('#qf-wrap').hidden = false; const fe = $('#qf input, #qf textarea'); if (fe) fe.focus(); return; }
  });
  /* lengths: typed in the current unit, stored in metres.
     Every keystroke commits the value to the state ('input'), so whatever is clicked next (Next, a toggle, an example)
     already reads the typed number. The redraw waits: a redraw on blur would replace the button under the pointer and
     swallow that first click. So 'change' never redraws while a pointer is down; the redraw runs after the click (and
     only if the click didn't redraw already). From the keyboard (Tab, Enter) it redraws at once and keeps focus. */
  const LEN = { 'lz-sw': ['sw', 0.3, 100], 'lz-sh': ['sh', 0.3, 100], 'lz-xw': ['xw', 0.3, 100], 'lz-xh': ['xh', 0.3, 100], 'lz-dc': ['dc', 0.5, 300], 'lz-dt': ['dt', 0.5, 300], 'lz-run': ['run', 1, 5000], 'lz-wd': ['wd', 0.5, 30] };
  function commitLen(i) {
    const k = LEN[i.id]; if (!k) return false;
    const v = fromU(parseFloat(String(i.value).replace(',', '.')));
    if (!(v >= k[1] && v <= k[2])) return false;
    const nv = Math.round(v * 1000) / 1000; if (Z[k[0]] === nv) return false;
    Z[k[0]] = nv; if (k[0] === 'dc' && Z.dt < Z.dc) Z.dt = Z.dc; if (k[0] === 'dt' && Z.dt < Z.dc) Z.dc = Z.dt; Z.ex = null; Z.pr = null;
    save(); return true;
  }
  let ptrDown = false, lenPending = -1;
  const selOf = el => { if (!el || !panel.contains(el)) return null; if (el.id) return '#' + el.id; const a = [...el.attributes].find(x => /^data-/.test(x.name)); return a ? `[${a.name}="${a.value}"]` : null; };
  document.addEventListener('pointerdown', () => { ptrDown = true; }, true);
  document.addEventListener('pointerup', () => { setTimeout(() => { ptrDown = false; if (lenPending >= 0 && lenPending === renders) { lenPending = -1; render(); save(); } else lenPending = -1; }, 0); }, true);
  document.addEventListener('pointercancel', () => { ptrDown = false; }, true);
  panel.addEventListener('input', e => { if (LEN[e.target.id]) commitLen(e.target); });
  panel.addEventListener('change', e => {
    const i = e.target; if (!LEN[i.id]) return;
    commitLen(i);
    if (rendering) { again = true; return; }
    if (ptrDown) { lenPending = renders; return; }   /* redraw after the click */
    if (!i.isConnected) { setTimeout(() => { render(); save(); }, 0); return; }
    /* keyboard: focus may be moving (Tab); redraw on the next tick and put focus back where it went */
    setTimeout(() => { const sel = selOf(document.activeElement) || '#' + i.id; render(); save(); const el = $(sel, panel); if (el) el.focus({ preventScroll: true }); }, 0);
  });
  panel.addEventListener('keydown', e => { if (LEN[e.target.id] && e.key === 'Enter') { e.preventDefault(); commitLen(e.target); const id = e.target.id; render(); save(); const el = $('#' + id, panel); if (el) el.focus({ preventScroll: true }); } });
  window.addEventListener('hashchange', () => { const z = readHash(); if (z && hashOf(z) !== hashOf()) { Z = z; render(); } });

  /* ======================= boot ======================= */
  (function boot() {
    accLoad();
    const z = readHash(), q = new URLSearchParams(location.search).get('preset');
    if (z) Z = z;
    else if (q && L.PRESETS.some(p => p.id === q)) applyPreset(q);
    render(); save();
  })();

  window.I9LEDWIZ = { get state() { return Z; }, go, calc: z => calc(z ? valid({ ...Z, ...z }) : Z), procs: z => { const v = z ? valid({ ...Z, ...z }) : Z; return procs(v, calc(v)); }, fit, arcGeom, curveCols, suggest: z => suggest(z ? valid({ ...Z, ...z }) : Z), verdict, hashOf: () => hashOf(), get g3() { return G3; }, get account() { return ACC ? { ...ACC } : null; } };
})();
