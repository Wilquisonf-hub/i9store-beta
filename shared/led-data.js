/* i9Store — LED wall configurator data (direction H, led.html). Plain data, no prices: LED walls are quoted with the
   factory, never sold from stock. Read by direction-h/led-wizard.js as window.I9LED.

   Rules for this file
   - Never invent i9 product specs. Two i9 models are known on 25 Nov 2026, both from the owner: "COB 1.86 Indoor
     Fixed, 14-bit, 3840 Hz" on a 640 × 480 mm cabinet, and "1.96 XR / virtual production, 16-bit, 7680 Hz" on a
     496 × 496 mm modular cabinet that mounts at angles. Every other field is null with "TO CONFIRM with factory", and
     the UI prints "to confirm with factory" for any null.
   - Other i9 models ("among others", owner) go in I9_MODELS_MORE when the factory sends their data. Nothing is shown
     for an empty slot; never put a placeholder product there.
   - Generic pitches and cabinet sizes are market classes, not products. Pixels per cabinet = cabinet mm / pitch,
     rounded, labelled "approx.; exact module resolution from factory".
   - Processor figures come from the manufacturers' own spec sheets or pages, read 25 Nov 2026; URL beside each entry.
     A figure that is arithmetic on the sheet, or could not be read on an official page, is listed in `verify` and the
     UI shows "verify" next to it. */
(function () {
  'use strict';
  const READ = '2026-11-25';

  /* ---------- i9-manufactured models ----------
     One object per model, same fields for every model so the owner's full specs slot straight in:
       id, maker:'i9', name, pitch (mm), tech, grayBits, refreshHz,
       env: ['in'] | ['out'] | ['in','out'], install: ['fixed'] | ['rental'] | both,
       uses: step-1 uses this model is shown first for,
       cabinet: { id, w, h } in mm (null = to confirm), mounting: ['flat'] or with 'curved' / 'corner',
       jointMaxDeg: largest angle between two cabinets (null = to confirm),
       moduleRes, brightnessNits, kgPerCabinet, wMaxPerCabinet, wAvgPerCabinet (null = to confirm with factory),
       source, confirmed: which fields the owner or the factory has confirmed.
     Pixels per cabinet are always computed from cabinet ÷ pitch and labelled so until moduleRes is filled. */
  const I9_MODELS = [
    {
      id: 'i9-cob186', maker: 'i9', name: 'COB 1.86 Indoor Fixed', pitch: 1.86,
      tech: 'COB (chip on board)', grayBits: 14, refreshHz: 3840,
      env: ['in'], install: ['fixed'], uses: ['church', 'corporate', 'broadcast', 'retail'],
      cabinet: { id: 'c640', w: 640, h: 480 },   // owner, 25 Nov 2026: the COB 1.86 is built on 640 × 480 mm cabinets
      /* 640 / 1.86 ≈ 344, 480 / 1.86 ≈ 258 → 344 × 258 px, which matches the common 4 × 3 layout of 320 × 160 mm modules
         (172 × 86 px each). The factory's module resolution is still to confirm. */
      mounting: ['flat'], jointMaxDeg: null,
      cabNote: 'it matches the common 4 × 3 layout of 320 × 160 mm modules (172 × 86 px each)',
      moduleRes: null,        // TO CONFIRM with factory (pixels per module)
      brightnessNits: null,   // TO CONFIRM with factory
      kgPerCabinet: null,     // TO CONFIRM with factory
      wMaxPerCabinet: null,   // TO CONFIRM with factory (max power per cabinet, W)
      wAvgPerCabinet: null,   // TO CONFIRM with factory (typical power per cabinet, W)
      viewingAngle: null,     // TO CONFIRM with factory
      serviceAccess: null,    // TO CONFIRM with factory (front / rear)
      source: 'Owner, 25 Nov 2026',
      confirmed: { pitch: true, grayBits: true, refreshHz: true, env: true, install: true, cabinet: true },
    },
    {
      id: 'i9-xr196', maker: 'i9', name: '1.96 XR · virtual production', pitch: 1.96,
      tech: null,             // TO CONFIRM with factory (SMD / COB / other)
      grayBits: 16, refreshHz: 7680,
      env: ['in'], install: null,   // fixed or rental: not stated by the owner, so both are offered
      uses: ['broadcast'],
      cabinet: { id: 'c496', w: 496, h: 496 },   // owner, 25 Nov 2026: modular, can be mounted at angles (curved / cornered XR stages)
      /* 496 / 1.96 ≈ 253 → 253 × 253 px computed. Some 1.9 mm 500-class panels are 256 × 256: do not assume; to confirm. */
      mounting: ['flat', 'curved', 'corner'],
      cabNote: 'some 1.9 mm 500-class panels are 256 × 256, so nothing is assumed',
      jointMaxDeg: null,      // TO CONFIRM with factory (the configurator offers 0.5°–10° per joint)
      moduleRes: null,        // TO CONFIRM with factory
      brightnessNits: null,   // TO CONFIRM with factory
      kgPerCabinet: null,     // TO CONFIRM with factory
      wMaxPerCabinet: null,   // TO CONFIRM with factory
      wAvgPerCabinet: null,   // TO CONFIRM with factory
      viewingAngle: null,     // TO CONFIRM with factory
      serviceAccess: null,    // TO CONFIRM with factory
      source: 'Owner, 25 Nov 2026',
      confirmed: { pitch: true, grayBits: true, refreshHz: true, env: true, cabinet: true, mounting: true },
    },
  ];
  /* i9's other manufactured models (the owner sends full specs for more indoor / outdoor, fixed / rental models):
     add them here or above with the same fields. Leave empty until then: the configurator shows only real entries. */
  const I9_MODELS_MORE = [];

  /* ---------- generic pitch classes (mm). Any factory; the factory proposes the model ---------- */
  const GENERIC = {
    in:  [0.9, 1.2, 1.5, 1.9, 2.5, 2.6, 2.9, 3.9, 4.8],
    out: [2.6, 2.9, 3.9, 4.8, 5.9, 6.67, 8, 10],
  };

  /* ---------- generic cabinet sizes (mm). `fit`: installations each size is usually built for.
     496 × 496 is no longer generic: it is the i9 1.96 XR cabinet (owner, 25 Nov). ---------- */
  const CABINETS = [
    { id: 'c500',  w: 500, h: 500,   name: '500 × 500',   note: 'Die-cast aluminium, quick locks. The rental standard.', fit: ['rental', 'ground', 'flown', 'wall'], env: ['in', 'out'] },
    { id: 'c5001k', w: 500, h: 1000, name: '500 × 1000',  note: 'Die-cast, quick locks. Taller rental and outdoor walls.', fit: ['rental', 'ground', 'flown'], env: ['in', 'out'] },
    { id: 'c640',  w: 640, h: 480,   name: '640 × 480',   note: '4:3 fixed-install cabinet, wall or frame.', fit: ['wall', 'ground'], env: ['in', 'out'] },
    { id: 'c600',  w: 600, h: 337.5, name: '600 × 337.5', note: '16:9 cabinet: whole cabinets make 16:9 walls.', fit: ['wall', 'ground'], env: ['in'] },
    { id: 'c960',  w: 960, h: 960,   name: '960 × 960',   note: 'Large fixed cabinet, usually outdoor.', fit: ['wall'], env: ['out'] },
  ];

  /* ---------- Ethernet port capacity (pixels per 1 Gb port) ----------
     NovaStar MX40 Pro spec sheet V1.5.0, "Ethernet Port Load Capacity", p. 15 (same in the MX6000 Pro V1.5.0 sheet):
     "8bit: Load capacity × 24 × Frame rate < 1000 × 1000 × 1000 × 0.95"; 10-bit uses 32 with A10s Pro / A8s Pro
     receiving cards and 48 with other cards; 12-bit uses 48. That gives 659,722 px at 8-bit 60 Hz — the "~650,000
     pixels per port" rule ("capable of loading 650,000 pixels in a single Ethernet cable", MX6000 Pro sheet p. 2).
     We use 48 for 10-bit (conservative: any receiving card). Full load needs a load width of 128 px or more.
     https://oss.novastar.tech/uploads/2025/10/MX40-Pro-LED-Display-Controller-Specifications-V1.5.0.pdf  (read 25 Nov 2026)
     Brompton (Tessera online help, High Frame Rate): 525,000 px at 8-bit 60 Hz, 420,000 at 10-bit, 350,000 at 12-bit;
     doubling the frame rate halves it ("525,000 pixels at 8-bit 60Hz halves to 262,500 pixels at 8-bit 120 Hz").
     https://www.bromptontech.com/online-help/Content/Tessera%20User%20Manual/03.%20Feature%20Topics/12.2.5%20-%20High%20Frame%20Rate.htm  (read 25 Nov 2026)
     Colorlight: its spec PDFs refused automated reads (403). A search snippet of the X100 Pro sheet gives
     "8bit@60Hz: 0.65 million pixels; 10bit@60Hz: 0.49 million" — unverified, so Colorlight uses its own verified
     max-load ÷ port count at 8-bit 60 Hz (X12m 7.86 M ÷ 12, X4m 2.6 M ÷ 4 ≈ 655,000) scaled like NovaStar, marked verify. */
  const PORT_RULES = {
    nova: { label: 'NovaStar formula', base: 659722, bpp: { 8: 24, 10: 48, 12: 48 }, url: 'https://oss.novastar.tech/uploads/2025/10/MX40-Pro-LED-Display-Controller-Specifications-V1.5.0.pdf', read: READ },
    clt:  { label: 'Colorlight max load ÷ ports', base: 655000, bpp: { 8: 24, 10: 48, 12: 48 }, verify: true, url: 'https://en.colorlightinside.com/product/routine/6868', read: READ },
    brom: { label: 'Brompton nominal', base: 525000, depth: { 8: 1, 10: 420000 / 525000, 12: 350000 / 525000 }, url: 'https://www.bromptontech.com/online-help/Content/Tessera%20User%20Manual/03.%20Feature%20Topics/12.2.5%20-%20High%20Frame%20Rate.htm', read: READ },
  };
  /* pixels one 1 Gb port carries at a video bit depth and frame rate */
  function portCap(rule, bits, fps) {
    const R = PORT_RULES[rule];
    if (rule === 'brom') return Math.floor(R.base * R.depth[bits] * 60 / fps);
    return Math.floor(R.base * 24 * 60 / (R.bpp[bits] * fps));
  }
  /* 1000BASE-T (IEEE 802.3ab) runs to 100 m over Cat5e/Cat6: past that the ports need fibre */
  const COPPER_MAX_M = 100;

  /* ---------- processors, small to large. inputs: hdmi · sdi · dp · dvi · fibre (OPT in or ST 2110) ----------
     in4k: takes a 3840 × 2160 / 4096 × 2160 60 Hz source on its own inputs. maxPx: as stated by the maker (basis in
     `basis`). fibre: 'out' = fibre outputs on the unit (converter needed at the wall), 'only' = fibre outputs only (a
     converter is always needed), null = copper only (external converters for long runs). */
  /* genlock: true = external sync input on the sheet; 'source' = locks to its input only; null = not stated.
     maxHz: highest input frame rate on the sheet (SDI inputs stop at 60 Hz on every unit here). Read 25 Nov 2026. */
  const PROCESSORS = [
    { id: 'brom-s4', genlock: 'source', glText: 'Locks to the source only, no external sync input (“Lock to source”)', maxHz: 60, hzText: '23.98–60 Hz',
       brand: 'Brompton', model: 'Tessera S4', rule: 'brom', ports: 4, maxPx: 2100000, basis: 'nominal', maxW: 1920, maxH: 1080,
      inputs: ['dvi', 'hdmi'], inText: '1× DVI-D with loop, up to 1920 × 1080 at 60 Hz (HDMI through an adapter)', in4k: false, fibre: null,
      url: 'https://www.bromptontech.com/wp-content/uploads/2025/07/Brompton-S4-Data-Sheet-Mar2025-EN.pdf', url2: 'https://www.bromptontech.com/online-help/Content/A_Introduction%20Topics/Feature%20Comparison.htm', read: READ, verify: [] },
    { id: 'nova-vx400', genlock: null, glText: 'Not stated; sync from an internal input source only', maxHz: 60, hzText: 'inputs listed at 60 Hz',
       brand: 'NovaStar', model: 'VX400', rule: 'nova', ports: 4, maxPx: 2600000, basis: 'no basis stated', maxW: 10240, maxH: 8192,
      inputs: ['hdmi', 'dvi', 'sdi', 'fibre'], inText: '2× HDMI 1.3, 1× DVI, 1× 3G-SDI, 1× OPT fibre in (2K × 1K at 60 Hz)', in4k: false, fibre: 'out',
      url: 'https://oss.novastar.tech/uploads/2024/07/VX400-All-in-One-Controller-Specifications-V1.2.0.pdf', read: READ, verify: [] },
    { id: 'clt-x4m', genlock: null, glText: 'Not stated on the spec page', maxHz: 60, hzText: 'max input 1920 × 1080 at 60 Hz',
       brand: 'Colorlight', model: 'X4m', rule: 'clt', ports: 4, maxPx: 2600000, basis: 'no basis stated', maxW: 3840, maxH: 2000,
      inputs: ['hdmi', 'dvi'], inText: '2× HDMI 1.4, 1× DVI, CVBS, VGA, USB; max input 1920 × 1080 at 60 Hz', in4k: false, fibre: null,
      url: 'https://en.colorlightinside.com/product/routine/6474', read: READ, verify: [] },
    { id: 'nova-vx1000', genlock: true, glText: 'Genlock in + loop, bi-level and tri-level (not with low-latency mode)', maxHz: 60, hzText: 'inputs listed at 60 Hz',
       brand: 'NovaStar', model: 'VX1000', rule: 'nova', ports: 10, maxPx: 6500000, basis: 'no basis stated', maxW: 10240, maxH: 8192,
      inputs: ['hdmi', 'dvi', 'sdi', 'fibre'], inText: '2× HDMI 1.4, 2× DVI, 1× 3G-SDI, 10G OPT fibre in (4K × 1K at 60 Hz)', in4k: false, fibre: 'out',
      url: 'https://oss.novastar.tech/uploads/2024/07/VX1000-All-in-One-Controller-Specifications-V1.6.0.pdf', read: READ, verify: [] },
    { id: 'clt-x12m', genlock: null, glText: 'Not stated on the spec page', maxHz: 60, hzText: 'max input 4096 × 2160 at 60 Hz',
       brand: 'Colorlight', model: 'X12m', rule: 'clt', ports: 12, maxPx: 7860000, basis: 'no basis stated', maxW: 16384, maxH: 8192,
      inputs: ['hdmi', 'dp'], inText: '1× HDMI 2.0, 4× HDMI 1.4, 1× DP 1.2, USB; max input 4096 × 2160 at 60 Hz', in4k: true, fibre: null,
      url: 'https://en.colorlightinside.com/product/routine/6868', url2: 'https://en.colorlightinside.com/product/special/2107?language=en', read: READ, verify: [] },
    { id: 'nova-mx40pro', genlock: true, glText: 'Genlock in + loop: bi-level, tri-level, blackburst, 23.98–60 Hz', maxHz: 240, hzText: 'HDMI 2.0 / DP to 240 Hz, 12G-SDI to 60 Hz; output to 480 Hz',
       brand: 'NovaStar', model: 'MX40 Pro', rule: 'nova', ports: 20, maxPx: 9000000, basis: 'max device load', maxW: 16384, maxH: 16384,
      inputs: ['hdmi', 'dp', 'sdi'], inText: '3× HDMI 2.0 with loop, 1× DP 1.2, 1× 12G-SDI with loop', in4k: true, fibre: 'out',
      notes: '4× 10G fibre outputs; in 40-port mode they carry Ethernet ports 1–40.',
      url: 'https://oss.novastar.tech/uploads/2025/10/MX40-Pro-LED-Display-Controller-Specifications-V1.5.0.pdf', read: READ, verify: [] },
    { id: 'brom-sx40', genlock: true, glText: 'Bi-level and tri-level sync in + thru, or sync to source', maxHz: 250, hzText: 'HDMI 2.0b 23.98–250 Hz, 12G-SDI to 60 Hz',
       brand: 'Brompton', model: 'Tessera SX40', rule: 'brom', ports: 40, maxPx: 9000000, basis: '12-bit (36 bits per pixel) at 60 Hz', maxW: 4096, maxH: 2160,
      inputs: ['hdmi', 'sdi'], inText: '1× HDMI 2.0b (to 4096 × 2160, 23.98–250 Hz), 1× 12G-SDI with loop', in4k: true, fibre: 'only',
      notes: '4× 10G outputs (copper or fibre) to Tessera XD units; each XD gives ten 1G links, so 40 × 1G.',
      url: 'https://www.bromptontech.com/wp-content/uploads/2025/07/Brompton-SX40-Data-Sheet-Feb2025-EN.pdf', url2: 'https://www.bromptontech.com/online-help/Content/A_Introduction%20Topics/Feature%20Comparison.htm', read: READ, verify: ['ports'] },
    { id: 'nova-mx6000pro', genlock: true, glText: 'Genlock pair: bi-level, tri-level, blackburst, 23.98–60 Hz', maxHz: 240, hzText: 'HDMI 2.0 / DP cards to 240 Hz, 12G-SDI to 60 Hz; output to 480 Hz',
       brand: 'NovaStar', model: 'MX6000 Pro', rule: 'nova', ports: 320, maxPx: 141000000, basis: 'max device load', maxW: 16384, maxH: 16384,
      inputs: ['hdmi', 'dp', 'sdi', 'fibre'], inText: 'Input cards: 4× HDMI 2.0, 4× DP 1.2, 4× 12G-SDI, HDMI 2.1, DP 1.4, ST 2110 (25G / 100G)', in4k: true, fibre: 'only',
      notes: 'Modular 6U: 8 output-card slots, each 4× 10G fibre to CVT10 converters (40 ports per card).',
      url: 'https://oss.novastar.tech/uploads/2025/09/MX6000-Pro-LED-Display-Controller-Specifications-V1.5.0.pdf', read: READ, verify: ['ports', 'maxW'] },
  ];

  /* ---------- uses (step 1): starting answers for each ---------- */
  const USES = {
    church:    { label: 'Church stage', d: 'Behind the stage and on the stream, run by volunteers.', env: 'in', mount: 'wall', rent: 0, sw: 6, sh: 3.5, dc: 5, dt: 14 },
    corporate: { label: 'Corporate', d: 'Boardroom, lobby or town-hall screen at 16:9.', env: 'in', mount: 'wall', rent: 0, sw: 3.5, sh: 2, dc: 2.5, dt: 6 },
    broadcast: { label: 'Broadcast · XR studio', d: 'A set on camera, or an LED volume for virtual production.', env: 'in', mount: 'ground', rent: 0, sw: 6, sh: 2.5, dc: 3, dt: 5, camera: true },
    event:     { label: 'Event · rental', d: 'Stages, tours and launches. Built and struck often.', env: 'in', mount: 'ground', rent: 1, sw: 6, sh: 3.5, dc: 6, dt: 18 },
    retail:    { label: 'Retail · signage', d: 'Shop windows, totems and lobby displays.', env: 'in', mount: 'wall', rent: 0, sw: 2, sh: 2.5, dc: 1.5, dt: 4 },
    outdoor:   { label: 'Outdoor', d: 'Façades, signs and open-air stages.', env: 'out', mount: 'wall', rent: 0, sw: 6, sh: 3, dc: 10, dt: 25 },
  };

  /* ---------- presets: example walls, not packages ---------- */
  const PRESETS = [
    { id: 'church', label: 'Church stage', d: 'One wall behind the stage', z: { use: 'church', env: 'in', mount: 'wall', rent: 0, lay: 'single', sw: 5, sh: 3, dc: 4, dt: 10, m: 'g-2.9', cab: 'c640', fit: 'fill', src: 'hd', map: 'scaled', inp: ['hdmi', 'sdi'] } },
    { id: 'corporate', label: 'Corporate 16:9', d: 'Boardroom or lobby', z: { use: 'corporate', env: 'in', mount: 'wall', rent: 0, lay: 'single', sw: 3, sh: 1.7, dc: 2.5, dt: 5, m: 'g-1.5', cab: 'c600', fit: '169', src: 'hd', map: 'scaled', inp: ['hdmi'] } },
    { id: 'broadcast', label: 'Broadcast backdrop', d: 'Studio set, on camera', z: { use: 'broadcast', env: 'in', mount: 'ground', rent: 0, lay: 'single', sw: 6, sh: 2.5, dc: 3, dt: 5, m: 'i9-cob186', cab: 'c640', fit: 'fill', src: '4k', map: 'scaled', inp: ['sdi', 'hdmi'], bits: 10 } },
    { id: 'rental', label: 'Rental event', d: 'Ground-stacked, 6 × 3.5 m', z: { use: 'event', env: 'in', mount: 'ground', rent: 1, lay: 'single', sw: 6, sh: 3.5, dc: 6, dt: 18, m: 'g-3.9', cab: 'c500', fit: 'fill', src: 'hd', map: '1to1', inp: ['hdmi', 'sdi'], bk: 1 } },
    { id: 'imag', label: 'Side IMAG pair', d: 'Two screens flanking a stage', z: { use: 'event', env: 'in', mount: 'flown', rent: 0, lay: 'pair', sw: 3.5, sh: 2, dc: 6, dt: 16, m: 'g-2.6', cab: 'c500', fit: 'fill', src: 'hd', map: 'scaled', inp: ['sdi'] } },
    { id: 'xr', label: 'XR virtual production', d: 'Curved LED volume, ~6 m × 3 m', z: { use: 'broadcast', env: 'in', mount: 'ground', rent: 0, lay: 'single', sw: 6, sh: 3, dc: 3, dt: 5, m: 'i9-xr196', shape: 'curved', ja: 3, fit: 'fill', src: '4k', map: '1to1', inp: ['sdi', 'hdmi'], bits: 10, fps: 60 } },
    { id: 'outdoor', label: 'Outdoor sign', d: 'Fixed façade display', z: { use: 'outdoor', env: 'out', mount: 'wall', rent: 0, lay: 'single', sw: 6, sh: 3, dc: 10, dt: 25, m: 'g-8', cab: 'c960', fit: 'fill', src: 'hd', map: 'scaled', inp: ['hdmi'] } },
  ];

  window.I9LED = { READ, I9_MODELS, I9_MODELS_MORE, GENERIC, CABINETS, PORT_RULES, portCap, COPPER_MAX_M, PROCESSORS, USES, PRESETS };
})();
