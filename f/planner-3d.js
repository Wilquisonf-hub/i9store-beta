/* i9Store room planner — 3D view of the approved plan (direction G, wizard step 6).
   ES module, imported by planner-wizard.js only when step 6 opens. three.js 0.160.0 from cdn.jsdelivr.net via the import
   map in planner.html; nothing else is loaded. A massing model in the On Air look: warm white room, black hairline
   edges, grey people and furniture, dark camera bodies; orange only for the selected camera, its tally and its frustum.
   Heights are typical values (I9PLAN.HEIGHTS, "approx. — verify"), not measured. Plan coordinates: x across the room,
   y into it (metres); here x → X, y → Z, height → Y, origin at the room centre. Camera pan a: 0° faces the front wall.
   Round 4 (version F): when the plan has a Nanlite light plan, each fixture is a physically-correct SpotLight (intensity in
   candela = Nanlite's published lux at 1 m, inverse-square decay, beam from the data), ACES Filmic tone mapping auto-exposed
   to the key light at the presenter, soft shadows on desktop (off on phones / "low"). A viewfinder inset and a multiview
   render each camera at its real horizontal angle of view; frusta can be shown per camera. Rendering is on demand. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const INK = 0x111111, ORANGE = 0xf53c00;
const COL = { bg:0xf3f2ee, floor:0xe6e4de, grid:0xd3d1ca, wall:0xfaf9f6, furn:0xffffff, stage:0xe2e0d9, seat:0xd8d6cf, set:0xe9e7e1, person:0x9b9890, cam:0x1d1d1c, stand:0x2a2a29 };

export function mount(host, data, opt = {}) {
  const H = data.H, W = data.w, Dp = data.d;
  const WALL = H.wall(W, Dp);
  const X = x => x - W / 2, Zc = y => y - Dp / 2;

  /* ---------- renderer ---------- */
  const canvas = document.createElement('canvas');
  canvas.className = 'g3c';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', '3D view of the room plan');
  host.appendChild(canvas);
  const LIT = !!(data.fx && data.fx.length);
  const LOW = opt.quality === 'low' || (opt.quality !== 'high' && (Math.min(window.innerWidth, window.innerHeight) < 700 || (navigator.hardwareConcurrency || 8) <= 4));
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:!LOW, preserveDrawingBuffer:true });
  renderer.setPixelRatio(Math.min(LOW ? 1.25 : 2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COL.bg);
  const keyLux = Math.max(50, data.keyLux || 500);
  if (LIT) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 3.4 / keyLux;   /* a 60 % grey at the key reads about mid-high on ACES */
    renderer.shadowMap.enabled = !LOW; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8f8c84, keyLux * 0.14));   /* bounce / room light (a look, not a measurement) */
  } else {
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcac7bf, 1.55));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(W * 0.35, WALL * 4, Dp * 0.6); scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35); fill.position.set(-W * 0.5, WALL * 2, -Dp * 0.4); scene.add(fill);
  }

  const disposables = [];
  const keep = o => { disposables.push(o); return o; };
  const lam = (c, o = {}) => { if (LIT) { const { emissive, ...r } = o; return keep(new THREE.MeshStandardMaterial({ color:c, roughness:0.88, metalness:0, ...r })); } return keep(new THREE.MeshLambertMaterial({ color:c, ...o })); };
  const lineMat = (c = INK, op = 1) => keep(new THREE.LineBasicMaterial({ color:c, transparent:op < 1, opacity:op, toneMapped:false }));
  const EDGE = lineMat(INK, 0.9), EDGE_SOFT = lineMat(INK, 0.28);
  /* a box sitting on y0, with black edges */
  function box(w, h, d, color, x, y0, z, edge = EDGE, parent = scene) {
    const g = keep(new THREE.BoxGeometry(w, h, d));
    const m = new THREE.Mesh(g, lam(color)); m.position.set(x, y0 + h / 2, z); parent.add(m); m.castShadow = m.receiveShadow = LIT;
    const e = new THREE.LineSegments(keep(new THREE.EdgesGeometry(g)), edge); e.position.copy(m.position); parent.add(e);
    return m;
  }

  /* ---------- the room ---------- */
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(W, Dp)), lam(COL.floor, { emissive:0x262523 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = LIT; scene.add(floor);
  { const step = Math.max(W, Dp) > 25 ? 2 : 1, pts = [];
    for (let x = step; x < W - 1e-6; x += step) pts.push(X(x), 0.002, -Dp / 2, X(x), 0.002, Dp / 2);
    for (let y = step; y < Dp - 1e-6; y += step) pts.push(-W / 2, 0.002, Zc(y), W / 2, 0.002, Zc(y));
    const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    scene.add(new THREE.LineSegments(g, lineMat(COL.grid, 1))); }
  /* walls face inward, single-sided: the walls between you and the room drop out as you orbit (a dollhouse view) */
  const wallMat = lam(COL.wall, { side:THREE.FrontSide, emissive:0x8f8e8a });
  [[W, 0, -Dp / 2, 0], [W, 0, Dp / 2, Math.PI], [Dp, -W / 2, 0, Math.PI / 2], [Dp, W / 2, 0, -Math.PI / 2]].forEach(([len, x, z, ry]) => {
    const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(len, WALL)), wallMat); m.position.set(x, WALL / 2, z); m.rotation.y = ry; m.receiveShadow = LIT; scene.add(m);
  });
  { const c = [[-W / 2, -Dp / 2], [W / 2, -Dp / 2], [W / 2, Dp / 2], [-W / 2, Dp / 2]], pts = [];
    for (let i = 0; i < 4; i++) { const [a, b] = [c[i], c[(i + 1) % 4]]; pts.push(a[0], 0.004, a[1], b[0], 0.004, b[1]); }
    const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.LineSegments(g, EDGE));
    const top = []; for (let i = 0; i < 4; i++) { const [a, b] = [c[i], c[(i + 1) % 4]]; top.push(a[0], WALL, a[1], b[0], WALL, b[1]); top.push(a[0], 0, a[1], a[0], WALL, a[1]); }
    const g2 = keep(new THREE.BufferGeometry()); g2.setAttribute('position', new THREE.Float32BufferAttribute(top, 3)); scene.add(new THREE.LineSegments(g2, EDGE_SOFT)); }

  /* ---------- furniture ---------- */
  const stage = data.furn.find(f => f.k === 'stage');
  const onStage = (x, y) => stage && Math.abs(x - stage.x) <= stage.w / 2 && Math.abs(y - stage.y) <= stage.h / 2;
  const nearTop = (x, y) => data.furn.some(f => (f.k === 'table' || f.k === 'desk') && Math.abs(x - f.x) <= f.w / 2 + 0.9 && Math.abs(y - f.y) <= f.h / 2 + 0.9);
  data.furn.forEach(f => {
    const x = X(f.x), z = Zc(f.y), base = f.k !== 'stage' && onStage(f.x, f.y) ? H.stage : 0;
    if (f.k === 'stage') box(f.w, H.stage, f.h, COL.stage, x, 0, z);
    else if (f.k === 'pulpit') box(Math.min(f.w, 0.7), H.pulpit, Math.min(f.h, 0.5), COL.furn, x, base, z);
    else if (f.k === 'table' || f.k === 'desk') {
      const th = f.k === 'table' ? H.table : H.desk;
      box(f.w, 0.05, f.h, COL.furn, x, base + th - 0.05, z);
      box(f.w - 0.1, th - 0.05, 0.04, COL.furn, x, base, z + f.h / 2 - 0.08, EDGE_SOFT);   /* modesty panel facing the cameras */
    } else if (f.k === 'set') box(f.w, H.set, f.h, COL.set, x, 0, z);
    else if (f.k === 'seats') {
      const rows = Math.max(1, Math.floor(f.h / 0.95)), gap = f.h / rows;
      for (let r = 0; r < rows; r++) box(f.w, H.seat, 0.48, COL.seat, x, 0, Zc(f.y - f.h / 2 + gap * (r + 0.5)), EDGE_SOFT);
    }
  });

  /* ---------- people ---------- */
  const personMat = lam(COL.person);
  const heads = [];
  data.ppl.forEach(p => {
    const base = onStage(p.x, p.y) ? H.stage : 0, seated = nearTop(p.x, p.y);
    const g = new THREE.Group(); g.position.set(X(p.x), base, Zc(p.y)); scene.add(g);
    const bodyH = seated ? 0.62 : 1.35, y0 = seated ? 0.45 : 0;
    const body = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.17, 0.21, bodyH, 18)), personMat); body.position.y = y0 + bodyH / 2; g.add(body);
    const head = new THREE.Mesh(keep(new THREE.SphereGeometry(0.115, 18, 12)), personMat); head.position.y = y0 + bodyH + 0.15; g.add(head);
    body.castShadow = head.castShadow = LIT; body.receiveShadow = head.receiveShadow = LIT;
    if (seated) box(0.46, 0.45, 0.46, COL.seat, 0, 0, 0, EDGE_SOFT, g);
    heads.push(new THREE.Vector3(X(p.x), base + y0 + bodyH + 0.15, Zc(p.y)));
  });
  const crowd = heads.length ? heads.reduce((a, v) => a.add(v), new THREE.Vector3()).multiplyScalar(1 / heads.length) : new THREE.Vector3(0, 1.4, 0);

  /* ---------- control desk ---------- */
  { const x = X(data.ctrl.x), z = Zc(data.ctrl.y);
    box(1.4, 0.75, 0.6, COL.furn, x, 0, z);
    const mon = box(0.62, 0.36, 0.03, COL.cam, x, 0.8, z - 0.12, EDGE); void mon; }

  /* ---------- round 4: the plan's fixtures as lights ---------- */
  const kelvin = K => { const t = K / 100; let r, g, b;   /* Tanner Helland's blackbody fit, 1000–40000 K */
    r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592); g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
    const c = v => Math.max(0, Math.min(255, v)) / 255; return new THREE.Color().setRGB(c(r), c(g), c(b), THREE.SRGBColorSpace); };
  const FIX_BODY = keep(new THREE.MeshBasicMaterial({ color:0x1d1d1c, toneMapped:false })), FIX_FACE = keep(new THREE.MeshBasicMaterial({ color:0xfff3df, toneMapped:false }));
  let shadowsLeft = LOW ? 0 : 4;
  (data.fx || []).forEach(f => {
    const pos = new THREE.Vector3(X(f.x), f.h, Zc(f.y)), tg = new THREE.Vector3(X(f.tx), f.th, Zc(f.ty));
    const sp = new THREE.SpotLight(kelvin(f.cct || data.cct || 5600), f.lux1, 0, Math.min(1.45, f.beam * Math.PI / 360), 0.45, 2);
    sp.position.copy(pos); sp.target.position.copy(tg); scene.add(sp, sp.target);
    if (shadowsLeft > 0 && (f.role === 'key' || f.role === 'wash')) { shadowsLeft--; sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.bias = -0.0004; sp.shadow.radius = 4; sp.shadow.camera.near = 0.3; }
    /* the fixture: a head on a yoke, on a stand (or hung for a wash) */
    const head = new THREE.Group(); head.position.copy(pos); scene.add(head); head.lookAt(tg);
    const big = /pavo/.test(f.id) ? [0.6, 0.12, 0.05] : [0.22, 0.22, 0.3];
    const hb = new THREE.Mesh(keep(new THREE.BoxGeometry(...big)), FIX_BODY); head.add(hb);
    const fc = new THREE.Mesh(keep(new THREE.PlaneGeometry(big[0] * 0.8, big[1] * 0.8)), FIX_FACE); fc.position.z = big[2] / 2 + 0.002; head.add(fc);
    const base = pos.y - f.h + (f.h > 3 ? f.h : 0), pts = f.role === 'wash' ? [pos.x, pos.y + 0.15, pos.z, pos.x, WALL, pos.z] : [pos.x, pos.y - 0.15, pos.z, pos.x, Math.max(0, pos.y - f.h), pos.z];
    if (f.role !== 'wash' && f.role !== 'bg') for (let i = 0; i < 3; i++) { const a = i * 2.094, y0 = Math.max(0, pos.y - f.h); pts.push(pos.x, y0 + 0.5, pos.z, pos.x + Math.sin(a) * 0.35, y0, pos.z + Math.cos(a) * 0.35); }
    const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.LineSegments(g, EDGE)); void base;
  });

  /* ---------- lights (suggested positions: either side of the people, toward the cameras) ---------- */
  if (!LIT && data.lights > 0 && data.cams.length) {
    const cx = data.cams.reduce((a, c) => a + X(c.x), 0) / data.cams.length, cz = data.cams.reduce((a, c) => a + Zc(c.y), 0) / data.cams.length;
    const toCam = Math.atan2(cx - crowd.x, cz - crowd.z), r = Math.min(4.5, Math.max(1.8, Math.hypot(cx - crowd.x, cz - crowd.z) * 0.45));
    const angs = [-0.6, 0.6, -1.05, 1.05].slice(0, data.lights);
    angs.forEach(da => {
      const lx = crowd.x + Math.sin(toCam + da) * r, lz = crowd.z + Math.cos(toCam + da) * r;
      const px = Math.max(-W / 2 + 0.3, Math.min(W / 2 - 0.3, lx)), pz = Math.max(-Dp / 2 + 0.3, Math.min(Dp / 2 - 0.3, lz));
      const base = onStage(px + W / 2, pz + Dp / 2) ? H.stage : 0;
      const pts = [px, base, pz, px, base + H.lightStand, pz];
      for (let i = 0; i < 3; i++) { const a = i * 2.094; pts.push(px, base + 0.5, pz, px + Math.sin(a) * 0.35, base, pz + Math.cos(a) * 0.35); }
      const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.LineSegments(g, EDGE));
      const head = new THREE.Group(); head.position.set(px, base + H.lightStand, pz); scene.add(head);
      box(0.55, 0.38, 0.07, COL.furn, 0, -0.19, 0, EDGE, head);
      head.lookAt(crowd.x, crowd.y, crowd.z);
    });
  }

  /* ---------- cameras + frusta ---------- */
  const SEL_MAT = keep(new THREE.MeshBasicMaterial({ color:ORANGE, toneMapped:false })), BODY_MAT = LIT ? keep(new THREE.MeshBasicMaterial({ color:COL.cam, toneMapped:false })) : lam(COL.cam), STAND_MAT = lineMat(COL.stand, 1);
  const FR_LINE = lineMat(INK, 0.32), FR_LINE_ON = lineMat(ORANGE, 1);
  const FR_FILL = keep(new THREE.MeshBasicMaterial({ color:ORANGE, transparent:true, opacity:0.12, side:THREE.DoubleSide, depthWrite:false, toneMapped:false }));
  /* one colour per camera when every frustum is shown (orange stays the selected one) */
  const PAL = [0x2f6fed, 0x1f9d6b, 0xb44fd0, 0x8a6d00, 0x0a8a96, 0xc0392b, 0x5d6d7e, 0x7d3c98];
  const FR_PAL = PAL.map(c => lineMat(c, 0.85));
  let showFr = false;
  const cams = data.cams.map((c, i) => {
    const hgt = H.cam[c.mnt] || 1.5, base = c.mnt === 'tripod' && onStage(c.x, c.y) ? H.stage : 0;
    const pos = new THREE.Vector3(X(c.x), base + hgt, Zc(c.y));
    let tgt;
    if (c.tg && !c.all) { const k = data.ppl.findIndex(p => p.x === c.tg.x && p.y === c.tg.y); tgt = k >= 0 ? heads[k].clone() : new THREE.Vector3(X(c.tg.x), 1.5, Zc(c.tg.y)); }
    else if (c.all && heads.length) tgt = crowd.clone();
    else { const a = c.a * Math.PI / 180; tgt = pos.clone().add(new THREE.Vector3(Math.sin(a) * 5, -0.3, -Math.cos(a) * 5)); }
    /* keep the pan from the plan (the 2D aim is the truth); only the tilt comes from the subject's height */
    const a = c.a * Math.PI / 180, flat = Math.max(0.5, Math.hypot(tgt.x - pos.x, tgt.z - pos.z));
    const pitch = Math.atan2(tgt.y - pos.y, flat);
    const rig = new THREE.Group(); rig.position.copy(pos); rig.rotation.order = 'YXZ'; rig.rotation.y = -a; rig.rotation.x = pitch; scene.add(rig);
    /* body: lens along -Z */
    const body = new THREE.Group(); rig.add(body);
    if (c.k === 'ptz') {
      const b = new THREE.Mesh(keep(new THREE.BoxGeometry(0.17, 0.15, 0.2)), BODY_MAT); body.add(b);
      const l = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.045, 0.05, 0.08, 16)), BODY_MAT); l.rotation.x = Math.PI / 2; l.position.z = -0.13; body.add(l);
    } else {
      const b = new THREE.Mesh(keep(new THREE.BoxGeometry(0.14, 0.15, 0.26)), BODY_MAT); body.add(b);
      const l = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.05, 0.055, 0.16, 16)), BODY_MAT); l.rotation.x = Math.PI / 2; l.position.z = -0.21; body.add(l);
    }
    const tally = new THREE.Mesh(keep(new THREE.BoxGeometry(0.06, 0.03, 0.06)), SEL_MAT); tally.position.set(0, 0.095, 0.02); body.add(tally);
    /* mount */
    const mpts = [];
    if (c.mnt === 'tripod') { for (let k = 0; k < 3; k++) { const aa = k * 2.094 + a; mpts.push(pos.x, pos.y - 0.1, pos.z, pos.x + Math.sin(aa) * 0.42, base, pos.z + Math.cos(aa) * 0.42); } mpts.push(pos.x, pos.y - 0.1, pos.z, pos.x, base + 0.55, pos.z); }
    else if (c.mnt === 'ceiling') mpts.push(pos.x, pos.y + 0.08, pos.z, pos.x, WALL, pos.z);
    else if (c.mnt === 'wall') { const dl = c.x, dr = W - c.x, dt = c.y, db = Dp - c.y, m = Math.min(dl, dr, dt, db);
      const wx = m === dl ? -W / 2 : m === dr ? W / 2 : pos.x, wz = m === dt ? -Dp / 2 : m === db ? Dp / 2 : pos.z;
      mpts.push(pos.x, pos.y - 0.09, pos.z, wx, pos.y - 0.09, wz, pos.x, pos.y - 0.09, pos.z, pos.x, pos.y - 0.09 - 0.0, pos.z); }
    else { box(0.36, Math.max(0.05, pos.y - 0.1), 0.36, COL.furn, pos.x, 0, pos.z, EDGE_SOFT); }
    if (mpts.length) { const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(mpts, 3)); scene.add(new THREE.LineSegments(g, STAND_MAT)); }
    /* frustum to the subject plane (16:9) */
    const dist = Math.max(2.5, Math.min(Math.hypot(tgt.x - pos.x, tgt.y - pos.y, tgt.z - pos.z) * 1.08, Math.max(W, Dp) * 1.2));
    const hw = dist * Math.tan(c.h * Math.PI / 360), hh = hw * 9 / 16;
    const P = [[0, 0, 0], [-hw, hh, -dist], [hw, hh, -dist], [hw, -hh, -dist], [-hw, -hh, -dist]];
    const fl = []; [1, 2, 3, 4].forEach(k => fl.push(...P[0], ...P[k])); [[1, 2], [2, 3], [3, 4], [4, 1]].forEach(([u, v]) => fl.push(...P[u], ...P[v]));
    const fg = keep(new THREE.BufferGeometry()); fg.setAttribute('position', new THREE.Float32BufferAttribute(fl, 3));
    const frLines = new THREE.LineSegments(fg, FR_LINE); rig.add(frLines);
    const tri = []; [[1, 2], [2, 3], [3, 4], [4, 1]].forEach(([u, v]) => tri.push(...P[0], ...P[u], ...P[v])); tri.push(...P[1], ...P[2], ...P[3], ...P[1], ...P[3], ...P[4]);
    const tg2 = keep(new THREE.BufferGeometry()); tg2.setAttribute('position', new THREE.Float32BufferAttribute(tri, 3));
    const frFill = new THREE.Mesh(tg2, FR_FILL); rig.add(frFill);
    /* label */
    const spr = label(c.label, false); spr.position.set(pos.x, pos.y + 0.45 + Math.max(W, Dp) * 0.006, pos.z); scene.add(spr);
    return { c, i, rig, body, tally, frLines, frFill, spr, pos, tgt, pitch, a };
  });
  function label(txt, on) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const x = cv.getContext('2d'); x.fillStyle = on ? '#f53c00' : '#0a0a0a'; x.fillRect(4, 4, 56, 56);
    x.fillStyle = on ? '#000' : '#f7f6f2'; x.font = '700 34px "PT Mono", ui-monospace, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 32, 35);
    const tex = keep(new THREE.CanvasTexture(cv)); tex.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map:tex, depthTest:false, toneMapped:false })));
    const k = 0.32 + Math.max(W, Dp) * 0.012; s.scale.set(k, k, k); s.renderOrder = 10; s.userData.txt = txt; return s;
  }
  let sel = Math.min(Math.max(0, data.sel | 0), cams.length - 1);
  function paintSel() {
    cams.forEach(o => {
      const on = o.i === sel;
      o.frLines.material = on ? FR_LINE_ON : showFr ? FR_PAL[o.i % FR_PAL.length] : FR_LINE; o.frLines.visible = on || showFr; o.frFill.visible = on; o.tally.visible = on;
      const s = label(o.c.label, on); s.position.copy(o.spr.position); scene.remove(o.spr); o.spr = s; scene.add(s);
    });
  }
  if (cams.length) paintSel();

  /* ---------- view: orbit, reset, camera POV ---------- */
  const span = Math.max(W, Dp);
  const cam = new THREE.PerspectiveCamera(40, 1, 0.05, span * 12);
  const controls = new OrbitControls(cam, canvas);
  controls.enableDamping = false; controls.maxPolarAngle = Math.PI * 0.49; controls.minDistance = 1.5; controls.maxDistance = span * 4;
  controls.screenSpacePanning = true;
  const home = () => { cam.position.set(W * 0.5, span * 0.5 + WALL * 0.9, Dp * 0.78 + 1.6); controls.target.set(0, Math.min(1.2, WALL * 0.3), -Dp * 0.05); cam.fov = 40; cam.updateProjectionMatrix(); controls.update(); };
  home();
  let pov = null;
  function size() {
    const r = host.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false); canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    cam.aspect = w / h; cam.updateProjectionMatrix(); draw();
  }
  let mode = 'scene', vf = !!opt.vf;
  const ov = document.createElement('div'); ov.className = 'pv3-ov'; host.appendChild(ov);
  function camView(o) { povCam.position.copy(o.pos); povCam.rotation.order = 'YXZ'; povCam.rotation.set(o.pitch, -o.a, 0);
    povCam.fov = 2 * Math.atan(Math.tan(o.c.h * Math.PI / 360) * 9 / 16) * 180 / Math.PI; povCam.aspect = 16 / 9; povCam.updateProjectionMatrix(); }
  /* render one camera's picture into a pixel rectangle (y from the bottom, WebGL style), helpers hidden */
  function shoot(o, x, y, w2, h2) {
    const hide = cams.map(q => [q.rig.visible, q.spr.visible]); cams.forEach(q => { q.spr.visible = false; q.frLines.visible = false; q.frFill.visible = false; }); o.rig.visible = false;
    camView(o); renderer.setViewport(x, y, w2, h2); renderer.setScissor(x, y, w2, h2); renderer.setScissorTest(true);
    renderer.setClearColor(COL.bg, 1); renderer.clear(); renderer.render(scene, povCam);
    cams.forEach((q, k) => { q.rig.visible = hide[k][0]; q.spr.visible = hide[k][1]; }); paintVis();
  }
  function paintVis() { cams.forEach(o => { const on = o.i === sel; o.frLines.visible = on || showFr; o.frFill.visible = on; }); }
  const lab = (txt, l, t, w2, cls) => `<span class="pv3-lab${cls ? ' ' + cls : ''}" style="left:${l}%;top:${t}%;max-width:${w2}%">${txt}</span>`;
  const esc3 = v => String(v).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  function draw() {
    const w = canvas.width, h = canvas.height;
    renderer.setScissorTest(false); renderer.setViewport(0, 0, w, h); renderer.setClearColor(pov == null && mode !== 'multi' ? COL.bg : 0x0a0a0a, 1); renderer.clear();
    let html = '';
    if (mode === 'multi' && cams.length) {
      const n = cams.length, cols = n <= 1 ? 1 : n <= 4 ? 2 : 3, rows = Math.ceil(n / cols), gap = Math.round(4 * (renderer.getPixelRatio() || 1));
      let cw = Math.floor((w - gap * (cols + 1)) / cols), ch = Math.round(cw * 9 / 16);
      if (ch * rows + gap * (rows + 1) > h) { ch = Math.floor((h - gap * (rows + 1)) / rows); cw = Math.round(ch * 16 / 9); }
      const ox = Math.round((w - (cw * cols + gap * (cols - 1))) / 2), oy = Math.round((h - (ch * rows + gap * (rows - 1))) / 2);
      cams.forEach((o, k) => { const cx = ox + (k % cols) * (cw + gap), ry = Math.floor(k / cols), cy = h - oy - (ry + 1) * ch - ry * gap;
        shoot(o, cx, cy, cw, ch);
        html += lab(`<b>${esc3(o.c.label)}</b>${esc3(o.c.vf || '')}`, cx / w * 100, (h - cy - ch) / h * 100, cw / w * 100, 'mv' + (o.i === sel ? ' on' : '')); });
      renderer.setScissorTest(false); ov.innerHTML = html; return;
    }
    if (pov == null) { renderer.render(scene, cam);
      if (vf && cams[sel]) { const iw = Math.round(Math.max(Math.min(w * 0.34, 520 * (renderer.getPixelRatio() || 1)), 200)), ih = Math.round(iw * 9 / 16), m = Math.round(10 * (renderer.getPixelRatio() || 1));
        renderer.setScissorTest(true); renderer.setViewport(w - iw - m - 2, m - 2, iw + 4, ih + 4); renderer.setScissor(w - iw - m - 2, m - 2, iw + 4, ih + 4); renderer.setClearColor(0x0a0a0a, 1); renderer.clear();
        shoot(cams[sel], w - iw - m, m, iw, ih); renderer.setScissorTest(false);
        html = lab(`<b>${esc3(cams[sel].c.label)}</b>${esc3(cams[sel].c.vf || '')}`, (w - iw - m) / w * 100, (h - m - ih) / h * 100, iw / w * 100, 'vf'); }
      ov.innerHTML = html; return; }
    ov.innerHTML = '';
    /* looking through a camera: a 16:9 frame, letterboxed, the camera's own body and frustum hidden */
    let fw = w, fh = Math.round(w * 9 / 16); if (fh > h) { fh = h; fw = Math.round(h * 16 / 9); }
    const ox = Math.round((w - fw) / 2), oy = Math.round((h - fh) / 2);
    renderer.setViewport(ox, oy, fw, fh); renderer.setScissor(ox, oy, fw, fh); renderer.setScissorTest(true);
    renderer.setClearColor(COL.bg, 1); renderer.clear();
    renderer.render(scene, povCam);
    renderer.setScissorTest(false);
  }
  const povCam = new THREE.PerspectiveCamera(40, 16 / 9, 0.05, span * 12);
  function setView(i) {
    cams.forEach(o => { o.rig.visible = true; o.spr.visible = true; });
    if (i == null || !cams[i]) { pov = null; controls.enabled = true; draw(); opt.onPov && opt.onPov(null); return; }
    pov = i; sel = i; paintSel();
    const o = cams[i];
    o.rig.visible = false; o.spr.visible = false;
    povCam.position.copy(o.pos);
    povCam.rotation.order = 'YXZ'; povCam.rotation.set(o.pitch, -o.a, 0);
    povCam.fov = 2 * Math.atan(Math.tan(o.c.h * Math.PI / 360) * 9 / 16) * 180 / Math.PI; povCam.aspect = 16 / 9; povCam.updateProjectionMatrix();
    controls.enabled = false; draw(); opt.onPov && opt.onPov(i);
  }
  controls.addEventListener('change', () => { if (pov == null) draw(); });
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => size()) : null;
  if (ro) ro.observe(host); else window.addEventListener('resize', size);
  size();

  /* pixel check used by the test: share of sampled pixels that differ from the background */
  function stats() {
    draw();
    const gl = renderer.getContext(), w = canvas.width, h = canvas.height, px = new Uint8Array(4);
    let n = 0, diff = 0; const colors = new Set();
    for (let y = 4; y < h; y += Math.max(4, h >> 5)) for (let x = 4; x < w; x += Math.max(4, w >> 5)) {
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); n++;
      colors.add(px[0] >> 3 << 10 | px[1] >> 3 << 5 | px[2] >> 3);
      if (Math.abs(px[0] - 0xf3) + Math.abs(px[1] - 0xf2) + Math.abs(px[2] - 0xee) > 24) diff++;
    }
    return { w, h, samples:n, nonBg:diff, colors:colors.size };
  }
  const api = {
    setView, select(i) { sel = i; paintSel(); draw(); }, reset() { pov = null; mode = 'scene'; controls.enabled = true; home(); draw(); }, stats,
    /* round 4 */
    setMode(m) { mode = m === 'multi' ? 'multi' : 'scene'; if (mode === 'multi') pov = null; controls.enabled = mode !== 'multi'; draw(); },
    setVf(on) { vf = !!on; draw(); }, setFrusta(on) { showFr = !!on; paintSel(); draw(); },
    get lit() { return LIT; }, get low() { return LOW; }, get shadows() { return renderer.shadowMap.enabled; }, cells() { return ov.querySelectorAll('.pv3-lab.mv').length; },
    hfov(i) { return cams[i] ? cams[i].c.h : null; },
    fps(n = 30) { const gl = renderer.getContext(); draw(); gl.finish(); const px1 = new Uint8Array(4), t0 = performance.now(); for (let k = 0; k < n; k++) { draw(); gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px1); } const ms = (performance.now() - t0) / n; return { ms:Math.round(ms * 10) / 10, fps:Math.round(1000 / ms), lit:LIT, low:LOW, shadows:renderer.shadowMap.enabled, px:renderer.getPixelRatio() }; },
    dispose() { if (ro) ro.disconnect(); else window.removeEventListener('resize', size); controls.dispose(); disposables.forEach(d => d.dispose && d.dispose()); renderer.dispose(); canvas.remove(); ov.remove(); if (window.I9PLAN3D === api) delete window.I9PLAN3D; },
  };
  window.I9PLAN3D = api;
  return api;
}
