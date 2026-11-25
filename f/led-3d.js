/* i9Store Pro — LED wall configurator, 3D view (direction H, led.html step 7).
   ES module, imported by led-wizard.js only when step 7 opens. three.js 0.160.0 from cdn.jsdelivr.net via the import
   map in led.html; nothing else is loaded. Same massing language as planner-3d.js: warm white ground, black hairline
   edges, grey person; the LED face is the only dark, lit surface, with every cabinet seam drawn.
   Shapes: a curved wall is one column of cabinets per facet, each turned by the joint angle (a faceted arc); a cornered
   wall adds a second wall at 90° on the left, or an LED floor in front.
   Coordinates in metres: X across, Y up, Z toward the audience; the wall face sits at z = 0 and faces +Z.
   Assumed heights (shown under the view): wall bottom 1.0 m (fixed), 0.15 m base (floor-standing), 1.5 m trim (flown). */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const INK = 0x111111;
const COL = { bg: 0xf3f2ee, floor: 0xe6e4de, grid: 0xd3d1ca, wall: 0xfaf9f6, body: 0x2a2a29, steel: 0x8f8d87, person: 0x9b9890 };
const DEPTH = 0.1;

export function mount(host, data, opt = {}) {
  const S = data.screens.filter(s => !s.seg), segs = data.screens.filter(s => s.seg), mnt = data.mount;
  const floorLed = segs.some(s => s.k === 'floor');
  const bottom = floorLed ? 0.08 : mnt === 'flown' ? 1.5 : mnt === 'ground' ? 0.15 : 1.0;
  /* width on the floor plan: a curved wall takes its chord */
  const wOf = s => s.pts ? Math.hypot(s.pts[s.pts.length - 1][0], s.pts[s.pts.length - 1][1]) : s.W;
  const maxH = Math.max(...S.map(s => s.H));

  /* ---------- layout of the screens ---------- */
  const gap = data.lay === 'pair' ? Math.max(3, S[0].W * 0.8) : 0.8;
  const toe = data.lay === 'pair' ? 8 : 12;
  const place = [];
  if (data.lay === 'sides') {
    const m = S[0], sd = S[1];
    const a = toe * Math.PI / 180, off = m.W / 2 + gap + Math.cos(a) * sd.W / 2, fz = Math.sin(a) * sd.W / 2;
    place.push({ s: m, x: 0, z: 0, ry: 0 }, { s: sd, x: -off, z: fz, ry: a }, { s: S[2], x: off, z: fz, ry: -a });
  } else if (data.lay === 'pair') {
    const a = toe * Math.PI / 180, off = gap / 2 + Math.cos(a) * S[0].W / 2, fz = Math.sin(a) * S[0].W / 2;
    place.push({ s: S[0], x: -off, z: fz, ry: a }, { s: S[1], x: off, z: fz, ry: -a });
  } else place.push({ s: S[0], x: 0, z: 0, ry: 0 });
  const xs = place.map(p => [p.x - wOf(p.s) / 2, p.x + wOf(p.s) / 2]);
  const minX = Math.min(...xs.map(v => v[0])), maxX = Math.max(...xs.map(v => v[1])), totW = maxX - minX;
  const span = Math.max(totW, maxH * 2, data.dt * 0.6, 6);
  const cx = (minX + maxX) / 2, cy = bottom + maxH / 2;

  /* ---------- renderer ---------- */
  const canvas = document.createElement('canvas');
  canvas.className = 'g3c';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', '3D view of the LED wall, its mounting, a person for scale and the viewing distances');
  host.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COL.bg);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcac7bf, 1.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(span * 0.4, span, span * 0.8); scene.add(sun);

  const disposables = [];
  const keep = o => { disposables.push(o); return o; };
  const lam = (c, o = {}) => keep(new THREE.MeshLambertMaterial({ color: c, ...o }));
  const lineMat = (c = INK, op = 1) => keep(new THREE.LineBasicMaterial({ color: c, transparent: op < 1, opacity: op }));
  const EDGE = lineMat(INK, 0.9), EDGE_SOFT = lineMat(INK, 0.3), STEEL = lineMat(0x3a3a38, 1);
  function box(w, h, d, color, x, y0, z, edge = EDGE, parent = scene) {
    const g = keep(new THREE.BoxGeometry(w, h, d));
    const m = new THREE.Mesh(g, Array.isArray(color) ? color : lam(color)); m.position.set(x, y0 + h / 2, z); parent.add(m);
    if (edge) { const e = new THREE.LineSegments(keep(new THREE.EdgesGeometry(g)), edge); e.position.copy(m.position); parent.add(e); }
    return m;
  }
  function lines(pts, mat = STEEL, parent = scene) {
    const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const l = new THREE.LineSegments(g, mat); parent.add(l); return l;
  }

  /* ---------- floor ---------- */
  const FW = Math.max(totW + 10, 14), FD = Math.max(data.dt + 5, 12);
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(FW, FD)), lam(COL.floor, { emissive: 0x262523 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, FD / 2 - 3); scene.add(floor);
  { const pts = [], step = FW > 40 ? 2 : 1;
    for (let x = -Math.floor(FW / 2); x <= FW / 2; x += step) pts.push(x, 0.002, -3, x, 0.002, FD - 3);
    for (let z = -3; z <= FD - 3; z += step) pts.push(-FW / 2, 0.002, z, FW / 2, 0.002, z);
    lines(pts, lineMat(COL.grid, 1)); }

  /* ---------- the building wall (fixed install) ---------- */
  if (mnt === 'wall') {
    const ww = totW + 2.4, wh = Math.max(bottom + maxH + 0.8, 3.6);
    box(ww, wh, 0.2, COL.wall, (minX + maxX) / 2, 0, -DEPTH - 0.18, EDGE_SOFT);
  }

  /* ---------- the screens: one cabinet block each, the face textured with its cabinet grid ---------- */
  const faces = [];
  /* the lit face: the cabinet grid drawn into one canvas per surface */
  function faceTex(cols, rows) {
    const cell = Math.max(6, Math.min(64, Math.floor(2048 / Math.max(cols, rows))));
    const cv = document.createElement('canvas'); cv.width = cols * cell; cv.height = rows * cell;
    const c = cv.getContext('2d');
    const gr = c.createLinearGradient(0, 0, cv.width, cv.height); gr.addColorStop(0, '#2b2a28'); gr.addColorStop(0.55, '#161615'); gr.addColorStop(1, '#0d0d0d');
    c.fillStyle = gr; c.fillRect(0, 0, cv.width, cv.height);
    const rg = c.createRadialGradient(cv.width * 0.32, cv.height * 0.38, 0, cv.width * 0.32, cv.height * 0.38, Math.max(cv.width, cv.height) * 0.6);
    rg.addColorStop(0, 'rgba(247,246,242,.16)'); rg.addColorStop(1, 'rgba(247,246,242,0)'); c.fillStyle = rg; c.fillRect(0, 0, cv.width, cv.height);
    c.strokeStyle = 'rgba(247,246,242,.34)'; c.lineWidth = Math.max(1, cell * 0.04);
    c.beginPath();
    for (let i = 1; i < cols; i++) { c.moveTo(i * cell + 0.5, 0); c.lineTo(i * cell + 0.5, cv.height); }
    for (let j = 1; j < rows; j++) { c.moveTo(0, j * cell + 0.5); c.lineTo(cv.width, j * cell + 0.5); }
    c.stroke();
    const tex = keep(new THREE.CanvasTexture(cv)); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    return tex;
  }
  const body = lam(COL.body);
  /* BoxGeometry material order: +x, -x, +y, -y, +z (face), -z */
  const faceMats = tex => { const f = keep(new THREE.MeshBasicMaterial({ map: tex })); return [body, body, body, body, f, body]; };
  /* the structure behind a run of cabinets `w` wide (in the group's own frame, face at z = 0) */
  function mountFor(g, w, h, opt = {}) {
    if (mnt === 'ground') {
      box(w + (opt.tight ? 0 : 0.1), bottom, 0.5, COL.steel, 0, 0, -DEPTH - 0.1, EDGE_SOFT, g);   /* ground-stack base */
      const n = opt.tight ? 1 : Math.max(2, Math.ceil(w / 1.5) + 1), pts = [], zb = -DEPTH - 0.06, top = bottom + h, reach = Math.min(2.2, h * 0.55);
      for (let i = 0; i < n; i++) {
        const x = n === 1 ? 0 : -w / 2 + 0.06 + (w - 0.12) * i / (n - 1);
        pts.push(x, 0, zb, x, top, zb);                         /* upright */
        pts.push(x, bottom + h * 0.72, zb, x, 0, zb - reach);  /* rear brace */
        pts.push(x, 0, zb, x, 0, zb - reach);                    /* outrigger */
      }
      pts.push(-w / 2, top - 0.05, zb, w / 2, top - 0.05, zb);
      lines(pts, STEEL, g);
    } else if (mnt === 'flown') {
      const top = bottom + h, ty = top + 0.9, tw = w + (opt.tight ? 0 : 0.6), ts = 0.3, pts = [];
      box(w, 0.06, 0.12, COL.steel, 0, top, -DEPTH / 2, EDGE_SOFT, g);   /* hanging bar */
      [[-ts / 2, -ts / 2], [ts / 2, -ts / 2], [-ts / 2, ts / 2], [ts / 2, ts / 2]].forEach(([dy, dz]) => pts.push(-tw / 2, ty + dy, -DEPTH / 2 + dz, tw / 2, ty + dy, -DEPTH / 2 + dz));
      const seg = Math.max(1, Math.round(tw / 0.5));
      for (let i = 0; i < seg; i++) {
        const x0 = -tw / 2 + tw * i / seg, x1 = -tw / 2 + tw * (i + 1) / seg;
        pts.push(x0, ty - ts / 2, -DEPTH / 2 + ts / 2, x1, ty + ts / 2, -DEPTH / 2 + ts / 2);
        pts.push(x0, ty - ts / 2, -DEPTH / 2 - ts / 2, x1, ty + ts / 2, -DEPTH / 2 - ts / 2);
        pts.push(x0, ty - ts / 2, -DEPTH / 2 - ts / 2, x0, ty - ts / 2, -DEPTH / 2 + ts / 2);
      }
      const hp = opt.tight ? 1 : Math.max(2, Math.ceil(w / 1.0));
      for (let i = 0; i < hp; i++) { const x = -w / 2 + w * (i + 0.5) / hp; pts.push(x, top + 0.06, -DEPTH / 2, x, ty - ts / 2, -DEPTH / 2); }
      if (!opt.tight) [-tw / 2 + 0.3, tw / 2 - 0.3].forEach(x => pts.push(x, ty + ts / 2, -DEPTH / 2, x, ty + 3, -DEPTH / 2));   /* to the rigging points */
      lines(pts, STEEL, g);
    } else {
      /* wall brackets: short stand-offs behind the cabinets */
      const pts = [], n = opt.tight ? 1 : Math.max(2, Math.ceil(w / 1.2) + 1);
      for (let i = 0; i < n; i++) { const x = n === 1 ? 0 : -w / 2 + 0.1 + (w - 0.2) * i / (n - 1); [bottom + 0.1, bottom + h - 0.1].forEach(y => pts.push(x, y, -DEPTH, x, y, -DEPTH - 0.08)); }
      lines(pts, STEEL, g);
    }
  }
  place.forEach(pl => {
    const s = pl.s, g = new THREE.Group(); g.position.set(pl.x, 0, pl.z); g.rotation.y = pl.ry; scene.add(g);
    const tex = faceTex(s.cols, s.rows);
    if (s.pts && s.ja) {
      /* curved: one column of cabinets per facet, each turned by the joint angle; the texture is sliced per column */
      const n = s.cols, a = s.ja * Math.PI / 180, P = s.pts, ymin = Math.min(...P.map(p => p[1])), cx0 = P[n][0] / 2;
      for (let i = 0; i < n; i++) {
        const t = tex.clone(); t.repeat.set(1 / n, 1); t.offset.set(i / n, 0); t.needsUpdate = true; keep(t);
        const col = new THREE.Group(), mx = (P[i][0] + P[i + 1][0]) / 2 - cx0, mz = (P[i][1] + P[i + 1][1]) / 2 - ymin;
        col.position.set(mx, 0, mz); col.rotation.y = -(i - (n - 1) / 2) * a; g.add(col);
        box(s.cw, s.H, DEPTH, faceMats(t), 0, bottom, -DEPTH / 2, EDGE, col);
        mountFor(col, s.cw, s.H, { tight: true });
      }
    } else {
      box(s.W, s.H, DEPTH, faceMats(tex), 0, bottom, -DEPTH / 2, EDGE, g);
      mountFor(g, s.W, s.H);
    }
    faces.push({ g, s, pl });
  });
  /* cornered: a second wall at 90° on the left, or an LED floor in front of the wall */
  segs.forEach(s => {
    const m = S[0];
    if (s.k === 'wing') {
      const g = new THREE.Group(); g.position.set(-m.W / 2, 0, s.W / 2); g.rotation.y = Math.PI / 2; scene.add(g);
      box(s.W, s.H, DEPTH, faceMats(faceTex(s.cols, s.rows)), 0, bottom, -DEPTH / 2, EDGE, g);
      mountFor(g, s.W, s.H);
      faces.push({ g, s });
    } else {
      const f = keep(new THREE.MeshBasicMaterial({ map: faceTex(s.cols, s.rows) }));
      box(s.W, 0.06, s.H, [body, body, f, body, body, body], 0, 0, s.H / 2 + 0.02, EDGE, scene);
      faces.push({ s });
    }
  });

  /* ---------- labels: HTML tags over the canvas, projected every frame and clamped inside it (never cut off) ---------- */
  const tags = [];
  function tag(txt, pos, cls = '') {
    const el = document.createElement('span'); el.className = 'g3lab meta' + (cls ? ' ' + cls : ''); el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<i></i>'; el.appendChild(document.createTextNode(txt)); host.appendChild(el); tags.push({ el, pos }); return el;
  }
  const PAD = 8;
  function placeTags() {
    const w = host.clientWidth, h = host.clientHeight;
    tags.forEach(t => {
      const v = t.pos.clone().project(cam), el = t.el;
      if (!(v.z > -1 && v.z < 1)) { el.hidden = true; return; }   /* behind the camera */
      el.hidden = false;
      const ew = el.offsetWidth, eh = el.offsetHeight;
      const x = Math.max(PAD, Math.min(w - ew - PAD, (v.x + 1) / 2 * w - ew / 2));
      const y = Math.max(PAD, Math.min(h - eh - PAD, (1 - v.y) / 2 * h - eh - 6));
      el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    });
  }

  /* ---------- person for scale (1.75 m), just left of the wall ---------- */
  { const personMat = lam(COL.person), g = new THREE.Group(); const wing = segs.find(x => x.k === "wing"), ppx = wing ? -S[0].W / 2 + 0.9 : minX - 0.8, ppz = wing ? Math.min(wing.W, 2) + 0.6 : 0.7; g.position.set(ppx, 0, ppz); scene.add(g);
    const body = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.17, 0.21, 1.45, 18)), personMat); body.position.y = 0.725; g.add(body);
    const head = new THREE.Mesh(keep(new THREE.SphereGeometry(0.12, 18, 12)), personMat); head.position.y = 1.63; g.add(head);
    tag('1.75 m', new THREE.Vector3(ppx, 1.95, ppz)); }

  /* ---------- viewing distances, dashed on the floor ---------- */
  const dashed = keep(new THREE.LineDashedMaterial({ color: INK, dashSize: 0.35, gapSize: 0.22 }));
  const ORANGE_LINE = keep(new THREE.LineDashedMaterial({ color: 0xf53c00, dashSize: 0.35, gapSize: 0.22 }));
  [[data.dc, 'CLOSEST · ' + data.unitLabel(data.dc), ORANGE_LINE], [data.dt, 'TYPICAL · ' + data.unitLabel(data.dt), dashed]].forEach(([d, txt, mat], i) => {
    if (i === 1 && Math.abs(data.dt - data.dc) < 0.2) return;
    const half = Math.max(totW / 2 + 1.5, 3.5);
    const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute([cx - half, 0.01, d, cx + half, 0.01, d], 3));
    const l = new THREE.Line(g, mat); l.computeLineDistances(); scene.add(l);
    tag(txt, new THREE.Vector3(cx + half * 0.3, 0.02, d), i ? '' : 'on');
  });

  /* ---------- views ---------- */
  const cam = new THREE.PerspectiveCamera(40, 1, 0.05, span * 20);
  const controls = new OrbitControls(cam, canvas);
  controls.enableDamping = false; controls.maxPolarAngle = Math.PI * 0.495; controls.minDistance = 1; controls.maxDistance = span * 5;
  controls.screenSpacePanning = true;
  const fitDist = Math.max(totW * 1.05, maxH * 2.2, 5) + 2;
  let moved = false;
  function home() { cam.fov = 40; const k = Math.max(1, 1.1 / Math.max(cam.aspect, 0.35)), fd = fitDist * k; const zf = Math.max(fd * 1.05, data.dc + fd * 0.7); cam.position.set(cx + fd * 0.32, cy + fd * 0.5, zf); controls.target.set(cx, cy * 0.55, Math.min(data.dc * 0.45, 4)); cam.updateProjectionMatrix(); controls.update(); }
  let pov = null;
  function setView(v) {
    if (!v) { pov = null; moved = false; home(); draw(); opt.onPov && opt.onPov(null); return; }
    pov = v; const d = v === 'c' ? data.dc : data.dt;
    cam.fov = 50; cam.position.set(cx, 1.2, d); controls.target.set(cx, cy, 0); cam.updateProjectionMatrix(); controls.update(); draw();
    opt.onPov && opt.onPov(v);
  }
  home();
  function size() {
    const r = host.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false); canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    cam.aspect = w / h; cam.updateProjectionMatrix(); if (!moved && pov == null) home(); draw();
  }
  function draw() { renderer.render(scene, cam); placeTags(); }
  controls.addEventListener('change', draw);
  controls.addEventListener('start', () => { moved = true; });
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => size()) : null;
  if (ro) ro.observe(host); else window.addEventListener('resize', size);
  size();

  /* pixel check used by the test: share of sampled pixels that differ from the background */
  function stats() {
    draw();
    const gl = renderer.getContext(), w = canvas.width, h = canvas.height, px = new Uint8Array(4);
    let n = 0, diff = 0, dark = 0; const colors = new Set();
    for (let y = 4; y < h; y += Math.max(4, h >> 5)) for (let x = 4; x < w; x += Math.max(4, w >> 5)) {
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); n++;
      colors.add(px[0] >> 3 << 10 | px[1] >> 3 << 5 | px[2] >> 3);
      if (Math.abs(px[0] - 0xf3) + Math.abs(px[1] - 0xf2) + Math.abs(px[2] - 0xee) > 24) diff++;
      if (px[0] + px[1] + px[2] < 150) dark++;
    }
    return { w, h, samples: n, nonBg: diff, dark, colors: colors.size, screens: faces.length };
  }
  const api = {
    setView, reset() { setView(null); }, stats, get pov() { return pov; },
    /* label boxes against the canvas, for the test */
    tagBoxes() { draw(); const r = host.getBoundingClientRect(); return tags.map(t => { const b = t.el.getBoundingClientRect(); return { txt: t.el.textContent, hidden: t.el.hidden, l: b.left - r.left, t: b.top - r.top, r: r.right - b.right, b: r.bottom - b.bottom }; }); },
    dispose() { if (ro) ro.disconnect(); else window.removeEventListener('resize', size); controls.dispose(); disposables.forEach(d => d.dispose && d.dispose()); renderer.dispose(); canvas.remove(); tags.forEach(t => t.el.remove()); if (window.I9LED3D === api) delete window.I9LED3D; },
  };
  window.I9LED3D = api;
  return api;
}
