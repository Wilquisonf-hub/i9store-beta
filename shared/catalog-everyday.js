/* i9Store design directions — the Everyday line (extends shared/catalog*.js; load after catalog-browse.js).
   1) Camp Snap: the 25 live i9store.com/usa listings read on 25 Nov 2026 (search "camp snap"; raw read:
      tmp-everyday/campsnap-read-20261125.md). The live store lists every colour as its own product; here each colour
      stays its own listing (its own id, price, image and URL, so the bag and checkout still deal in real listings) and
      the listings are MERGED into one product per model, with swatches.
      Titles: as listed (Portuguese words put in English). Prices: the listed USD price of each colour (they differ:
      Camp Snap 2 Forest Green $74.99 vs $69.99; 1st Gen Forest Green $59.99 vs $74.99).
      Images: each listing's own image ("original" size of the listing thumbnail URL on i9's storage hosts).
      white: 1 = four corners pure white; 0 = cream/grey photo ground (checked: tmp-everyday/contact.png).
      hex (swatch colour): sampled from the body of that listing's own photo (tmp-everyday/swatch-check.png), so the
      chip matches the photo, not a brand colour card.
   2) Facts: only from the listing title ('listing') or Camp Snap's own site ('brand': campsnapphoto.com home page read
      25 Nov 2026, exact phrases in tmp-everyday/brand-read-20261125.md). Nothing else is claimed.
   3) Everyday shelves: existing catalog listings (catalog*.js, already real) grouped by occasion. Two pairs of existing
      colour listings are merged the same way (PGYTECH OneGo Solo V2 4L, Hollyland LARK 150 SOLO); their chip colours are
      approximated from the listing photos.
   Nothing here is invented: no ratings, reviews, stock counts or delivery dates. */
(function () {
  const I9 = window.I9; if (!I9) return;
  const P = I9.P;
  const H1 = 'https://storage.centrali9tv.com.br/prod/', H2 = 'https://i9tv-storage.s3.us-east-1.amazonaws.com/prod/';
  const BASE = 'https://i9store.com/usa/loja/';
  const CAM = 'cameras/cameras-de-acao/', ACC = 'acessorios/acessorios/';
  /* [id, product, colour, listing title as shown, usd, host, img path after /prod/ (thumbnail dir), url path, white, hex] */
  const R = [
    ['cs2-sunbeam-yellow',  'campsnap-2', 'Sunbeam Yellow',   'Camp Snap 2 (Sunbeam Yellow)',   69.99, H2, '2026/06/images/thumbnail/100821_36.jpg', CAM + 'camp-snap-2-camera-digital-sem-tela-sunbeam-yellow/', 1, '#d8983d'],
    ['cs2-tangerine-drift', 'campsnap-2', 'Tangerine Drift',  'Camp Snap 2 (Tangerine Drift)',  69.99, H2, '2026/06/images/thumbnail/100452_image_20260608_.png', CAM + 'camp-snap-2-camera-digital-sem-tela-tangerine-drift/', 0, '#f08315'],
    ['cs2-strawberry-splash','campsnap-2','Strawberry Splash','Camp Snap 2 (Strawberry Splash)',69.99, H2, '2026/06/images/thumbnail/100444_image_20260608_.png', CAM + 'camp-snap-2-camera-digital-sem-tela-strawberry-splash/', 0, '#ce80af'],
    ['cs2-blue-rush',       'campsnap-2', 'Blue Rush',        'Camp Snap 2 (Blue Rush)',        69.99, H2, '2026/06/images/thumbnail/100437_image_20260608_.png', CAM + 'camp-snap-2-camera-digital-sem-tela-blue-rush/', 0, '#82c4db'],
    ['cs2-twisted-lime',    'campsnap-2', 'Twisted Lime',     'Camp Snap 2 (Twisted Lime)',     69.99, H2, '2026/06/images/thumbnail/100458_image_20260608_.png', CAM + 'camp-snap-2-camera-digital-sem-tela-twisted-lime/', 0, '#b5d303'],
    ['cs2-chestnut-brown',  'campsnap-2', 'Chestnut Brown',   'Camp Snap 2 (Chestnut Brown)',   69.99, H2, '2026/06/images/thumbnail/100818_03a.jpg', CAM + 'camp-snap-2-camera-digital-sem-tela-chestnut-brown/', 1, '#a05d31'],
    ['cs2-forest-green',    'campsnap-2', 'Forest Green',     'Camp Snap 2 (Forest Green)',     74.99, H2, '2026/06/images/thumbnail/100820_05.jpg', CAM + 'camp-snap-2-camera-digital-sem-tela-forest-green/', 1, '#4b4a2c'],
    ['cs2-arctic-white',    'campsnap-2', 'Arctic White',     'Camp Snap 2 (Arctic White)',     69.99, H2, '2026/06/images/thumbnail/100806_02.jpg', CAM + 'camp-snap-2-camera-digital-sem-tela-arctic-white/', 1, '#ebe9ea'],
    ['cs2-stealth-black',   'campsnap-2', 'Stealth Black',    'Camp Snap 2 (Stealth Black)',    69.99, H2, '2026/06/images/thumbnail/100798_01a.jpg', CAM + 'camp-snap-2-camera-digital-sem-tela-stealth-black/', 1, '#312f2f'],

    ['cs1-aqua',            'campsnap-1', 'Aqua',             'Camp Snap 1st Gen (Aqua)',       74.99, H1, '2024/09/images/thumbnail/67570_546.jpg', CAM + 'camp-snap-camera-digital-sem-tela-aqua/', 1, '#78b9c3'],
    ['cs1-pink',            'campsnap-1', 'Pink',             'Camp Snap 1st Gen (Pink)',       74.99, H1, '2024/09/images/thumbnail/67581_23.jpg', CAM + 'camp-snap-camera-digital-sem-tela-pink/', 1, '#df4876'],
    ['cs1-yellow',          'campsnap-1', 'Yellow',           'Camp Snap 1st Gen (Yellow)',     74.99, H1, '2024/09/images/thumbnail/67583_25.jpg', CAM + 'camp-snap-camera-digital-sem-tela-yellow/', 1, '#f0ae36'],
    ['cs1-red',             'campsnap-1', 'Red',              'Camp Snap 1st Gen (Red)',        74.99, H1, '2024/09/images/thumbnail/67579_548.jpg', CAM + 'camp-snap-camera-digital-sem-tela-red/', 1, '#84383a'],
    ['cs1-chestnut-brown',  'campsnap-1', 'Chestnut Brown',   'Camp Snap 1st Gen CS-V105 (Chestnut Brown)', 74.99, H1, '2024/09/images/thumbnail/67589_7.jpg', CAM + 'camp-snap-camera-digital-sem-tela-brown/', 1, '#8e5135'],
    ['cs1-forest-green',    'campsnap-1', 'Forest Green',     'Camp Snap 1st Gen CS-V105 (Forest Green)',   59.99, H1, '2024/09/images/thumbnail/67586_verfe.jpg', CAM + 'camp-snap-camera-digital-sem-tela-forest-green/', 1, '#454834'],
    ['cs1-navy',            'campsnap-1', 'Navy',             'Camp Snap 1st Gen (Navy)',       74.99, H1, '2025/07/images/thumbnail/87539_4removebgprevie.png', CAM + 'camp-snap-camera-digital-sem-tela-navy/', 1, '#303f60'],
    ['cs1-white',           'campsnap-1', 'White',            'Camp Snap 1st Gen (White)',      74.99, H1, '2024/09/images/thumbnail/67568_1.jpg', CAM + 'camp-snap-camera-digital-sem-tela-white/', 1, '#e9e8e6'],
    ['cs1-black',           'campsnap-1', 'Black',            'Camp Snap 1st Gen (Black)',      74.99, H1, '2024/09/images/thumbnail/67576_547.jpg', CAM + 'camp-snap-camera-digital-sem-tela-black/', 1, '#29292c'],

    ['cs-pro',              'campsnap-pro', '',  'Camp Snap - Digital camera CS-PRO',   99.00, H1, '2025/09/images/thumbnail/90798_photo_20250917_.jpg', CAM + 'camp-snap-camera-digital-cs-pro-pre-venda/', 0, ''],
    ['cs-8',                'campsnap-8',   '',  'Camp Snap - Digital video camera CS-8', 199.00, H1, '2025/09/images/thumbnail/89815_photo_20250902_.jpg', CAM + 'camp-snap-camera-de-video-digital-cs-8-pre-venda/', 0, ''],

    ['cs-case',             'cs-case',  '',                   'Camp Snap - Waterproof Case',    27.00, H1, '2025/07/images/thumbnail/85816_photo_20250707_.jpg', 'acessorios/cages-e-acessorios/camp-snap-waterproof-case/', 0, ''],
    ['cs-bag',              'cs-bag',   '',                   'Camp Snap - Camera Bag (Fits Camp Snap & CS-Pro)', 19.99, H2, '2026/08/images/thumbnail/103367_photo_20260810_.jpg', ACC + 'camp-sanp-camera-bag-fits-camp-snap-cs-pro/', 0, ''],
    ['cs-gems-pearl',       'cs-gems',  'Pearl Bloom',        'Camp Snap - Gem Kits (Pearl Bloom)', 9.99, H2, '2026/08/images/thumbnail/103362_photo_20260810_.jpg', ACC + 'camp-snap-gem-kits-pearl-bloom/', 0, '#e9dfe6'],
    ['cs-gems-midnight',    'cs-gems',  'Midnight Sparkle',   'Camp Snap - Gem Kits (Midnight Sparkle)', 9.99, H2, '2026/08/images/thumbnail/103360_photo_20260810_.jpg', ACC + 'camp-snap-gem-kits-midnight-sparkle/', 0, '#22253a'],
    ['cs8-kit',             'cs8-kit',  '',                   'Camp Snap - CS-8 Accessory Starter Kit', 29.99, H2, '2026/08/images/thumbnail/103368_photo_20260810_.jpg', ACC + 'camp-snap-cs-8-accessory-starter-kit/', 0, ''],
  ];

  /* ---------- merged products ---------- */
  const PROD = {
    'campsnap-2': { family:'campsnap', title:'Camp Snap 2', short:'Camp Snap 2', kind:'Screen-free digital camera', does:'Photos', def:'cs2-sunbeam-yellow',
      line:'Screen-free photos. 500 shots on one charge, six filters.',
      facts:[ ['Screen', 'Screen-free', 'listing title ("sem tela") and brand'], ['Shots per charge', '500 shots on one charge', 'brand'],
        ['Filters', '6 filters, toggled on the camera, no app needed', 'brand'], ['For kids', 'CampLock kid-friendly settings', 'brand'],
        ['Tripod', 'Tripod compatible', 'brand'], ['Out of the box', 'Arrives charged with the memory card inside', 'brand'] ] },
    'campsnap-1': { family:'campsnap', title:'Camp Snap 1st Gen', short:'1st Gen', code:'CS-V105', kind:'Screen-free digital camera', does:'Photos', def:'cs1-aqua',
      line:'The original screen-free camera, in nine colours.',
      facts:[ ['Screen', 'Screen-free', 'listing title ("sem tela")'], ['Model', 'CS-V105', 'listing title'] ] },
    'campsnap-pro': { family:'campsnap', title:'Camp Snap CS-PRO', short:'CS-PRO', kind:'Digital camera', does:'Photos, with flash', def:'cs-pro', preorder:true,
      line:'16 MP, a four-filter dial and a xenon flash.',
      facts:[ ['Sensor', '16 MP', 'brand'], ['Filters', '4-filter dial', 'brand'], ['Flash', 'Xenon flash', 'brand'] ] },
    'campsnap-8': { family:'campsnap', title:'Camp Snap CS-8', short:'CS-8', kind:'Digital video camera', does:'Video', def:'cs-8', preorder:true,
      line:'A Super-8-inspired video camera with no playback screen.',
      facts:[ ['Records', 'Video', 'listing title ("câmera de vídeo digital")'], ['Look', 'Super-8 inspired', 'brand'], ['Screen', 'No playback screen', 'brand'] ] },
    'cs-case':  { title:'Camp Snap Waterproof Case', kind:'Waterproof case', def:'cs-case', fitNote:'The listing does not say which Camp Snap it fits. Ask us before you buy.' },
    'cs-bag':   { title:'Camp Snap Camera Bag', kind:'Camera bag', def:'cs-bag', fits:['campsnap-2', 'campsnap-1', 'campsnap-pro'], fitNote:'Fits Camp Snap & CS-Pro, per the listing title.' },
    'cs-gems':  { title:'Camp Snap Gem Kits', kind:'Stick-on gem kit', def:'cs-gems-pearl', fitNote:'The listing does not say which Camp Snap it fits.' },
    'cs8-kit':  { title:'Camp Snap CS-8 Accessory Starter Kit', kind:'Accessory starter kit', def:'cs8-kit', fits:['campsnap-8'], fitNote:'For the CS-8, per the listing title.' },
    /* existing catalog listings, merged by colour the same way */
    'onego-solo-4l': { title:'PGYTECH OneGo Solo V2 4L', kind:'Sling bag, 4 L', def:'onego-solo4-moss' },
    'lark150-solo':  { title:'Hollyland LARK 150 SOLO', kind:'Wireless lavalier microphone, 2.4 GHz', def:'lark150-black' },
  };
  const MERGE = { 'onego-solo-4l': [['onego-solo4-moss', 'Moss green', '#5d6648'], ['onego-solo4-obs', 'Obsidian', '#2a2b2d']],
                  'lark150-solo':  [['lark150-black', 'Black', '#2b2b2b'], ['lark150-white', 'White', '#ececec']] };
  /* add-ons offered on each camera page: stated fit first, then "fit not stated" */
  const ADDONS = { 'campsnap-2': ['cs-bag', 'cs-case', 'cs-gems'], 'campsnap-1': ['cs-bag', 'cs-case', 'cs-gems'],
                   'campsnap-pro': ['cs-bag'], 'campsnap-8': ['cs8-kit'] };

  const pdp = id => 'product-simple.html?id=' + id;
  for (const [id, prod, colour, title, usd, host, img, path, white, hex] of R) {
    const isCam = /^campsnap/.test(prod);
    P[id] = { id, brand:'Camp Snap', name: PROD[prod].title, title, colour, hex,
      sub: [PROD[prod].kind, colour].filter(Boolean).join(', '), usd, cat: isCam ? 'Cameras' : 'Accessories', dept: isCam ? 'Cameras' : 'Accessories',
      subcat: isCam ? 'Action cameras' : (path.startsWith('acessorios/cages') ? 'Cages & rigs' : 'Other accessories'),
      img, src: host + img.replace('/thumbnail/', '/original/'), thumb: host + img, path, white, product: prod, everyday: 1, pdp: pdp(id) };
    (PROD[prod].variants = PROD[prod].variants || []).push(id);
  }
  for (const k in MERGE) MERGE[k].forEach(([id, colour, hex]) => { const p = P[id]; if (!p) return;
    p.colour = colour; p.hex = hex; p.product = k; (PROD[k].variants = PROD[k].variants || []).push(id); });
  for (const k in PROD) PROD[k].id = k;

  /* ---------- shelves by occasion (all listings already in catalog*.js unless Camp Snap) ---------- */
  const SHELVES = [
    { id:'gift',    n:'01', label:'A gift',               line:'Easy to wrap, easy to use, nothing to set up.',
      ids:['cs2-sunbeam-yellow', 'cs1-aqua', 'cs-8', 'osmo-mobile6', 'lark-m2', 'g1x-four', 'h1essential', 'ttartisan-mini-led'] },
    { id:'travel',  n:'02', label:'Travel light',         line:'Fits a sling bag. Most of it fits a pocket.',
      ids:['cs2-stealth-black', 'onego-solo4-moss', 'bt15', 'moza-minimi', 'dt01', 'ttartisan-mini-led', 'cs-bag'] },
    { id:'phone',   n:'03', label:'Start on your phone',  line:'Better sound, steadier shots and light for the phone you have.',
      ids:['lark-m2', 'lark-m2s-combo', 'osmo-mobile6', 'l10-ring', 'tp10', 'dt01', 'bt15', 'profile'] },
    { id:'podcast', n:'04', label:'Podcast at home',      line:'One mic, one pair of headphones, one recorder.',
      ids:['zdm1-kit', 'zdm1', 'p4', 'mdr', 'mv7', 'vo7u-white'] },
    { id:'music',   n:'05', label:'Record music',         line:'Handy recorders and pedals for rehearsal and the road.',
      ids:['h1essential', 'h4essential', 'm4-mictrak', 'q2n4k', 'g1x-four', 'ms70cdr-plus'] },
    { id:'light',   n:'06', label:'Better light',         line:'Small lights for a desk, a face on camera or a bag.',
      ids:['al-m9', 'aputure-mc', 'l10-ring', 'a60x', 'ttartisan-mini-led', 'ls60d'] },
  ];
  /* one tile per product: a listing that belongs to a merged product is shown once, as that product */
  const productOf = id => (P[id] && P[id].product && PROD[P[id].product]) ? PROD[P[id].product] : null;
  const ensure = id => { if (!P[id]) return null; if (productOf(id)) return productOf(id);
    const p = P[id]; return (PROD['l:' + id] = PROD['l:' + id] || { id: 'l:' + id, title: p.brand + ' ' + p.name, kind: p.sub, def: id, variants: [id] }); };
  const EV_IDS = new Set();
  SHELVES.forEach(s => { s.ids = s.ids.filter(id => P[id] && P[id].usd > 0); s.ids.forEach(id => { const pr = ensure(id); (pr.variants || [id]).forEach(v => EV_IDS.add(v)); }); });
  for (const k in PROD) if (!k.startsWith('l:')) (PROD[k].variants || []).forEach(v => EV_IDS.add(v));
  EV_IDS.forEach(id => { const p = P[id]; p.everyday = 1; if (!p.pdp) p.pdp = pdp(id); });

  /* the shop shows one tile per merged product (its default listing), plus the curated listings */
  if (I9.BROWSE) {
    const seen = new Set(I9.BROWSE);
    const hide = new Set(); for (const k in PROD) if (!k.startsWith('l:') && PROD[k].variants && PROD[k].variants.length > 1) PROD[k].variants.forEach(v => { if (v !== PROD[k].def) hide.add(v); });
    I9.BROWSE = I9.BROWSE.filter(id => !hide.has(id));
    for (const k in PROD) { const d = PROD[k].def; if (d && P[d] && !seen.has(d) && !hide.has(d)) I9.BROWSE.push(d); }
  }
  if (I9.DEPTS) { const cam = I9.DEPTS.find(d => d.name === 'Cameras'); if (cam && !cam.subs.some(s => s.slug === 'action-cameras')) cam.subs.push({ name:'Action cameras', slug:'action-cameras' }); }

  const productFor = key => PROD[key] || productOf(key) || (P[key] ? ensure(key) : null);
  const minPrice = pr => Math.min(...(pr.variants || [pr.def]).map(v => P[v].usd));
  I9.EVERYDAY = {
    read: '2026-11-25', BASE, PROD, SHELVES, ADDONS,
    FAMILY: { campsnap: ['campsnap-2', 'campsnap-1', 'campsnap-pro', 'campsnap-8'] },
    ids: EV_IDS,
    isEveryday: id => EV_IDS.has(id),
    productFor, minPrice,
    listingURL: id => P[id] && P[id].path ? BASE + P[id].path : '',
  };
  try { document.dispatchEvent(new CustomEvent('i9:everyday')); } catch (e) {}
})();
