/* i9Store room planner — the camera picker's curated models (direction H / version F only; load after planner-data.js).
   Extends window.I9 (listings) and window.I9PLAN (planning specs) without changing either file, so direction G keeps
   exactly what it had.

   Listings: real i9store.com/usa listings read on 25 Nov 2026 from the public product pages / sitemap
   (https://i9store.com/sitemap-produtos.xml, raw read: tmp-planner2/i9store-usa-listings-20261125.tsv). Same rules as
   catalog-more.js: names put in English, model words unchanged, the single listed USD price, the listing's own image on
   i9's storage host (every one checked: four 6×6 px corners >= 248 on R, G and B = pure white ground). Nothing invented.
   Only listings that are not already in catalog.js / catalog-more.js / catalog-browse.js are added here.

   Planning specs: manufacturer spec pages, URL + date per entry (read 25 Nov 2026). v:true = read on the manufacturer's
   page. approx:true = not verified or derived (shown as "verify" in the UI, and the note says what was derived from what).
   Lenses are the store's own zoom lenses per mount; their focal ranges are the model designation. */
(function () {
  const I9 = window.I9, D = window.I9PLAN; if (!I9 || !D) return;
  const IMG = 'https://storage.centrali9tv.com.br/prod/';
  const READ = '2026-11-25';

  /* ---------- listings (id: [brand, name, sub, usd, dept, subcat, img, path]) ---------- */
  const L = {
    'canon-c50':      ['Canon', 'EOS C50', 'Full-frame 7K open-gate cinema camera, Canon RF, body', 3899, 'Cameras', 'Cinema', '2026/09/images/original/106265_eosc50canonshop.jpg', 'cameras/broadcast/canon-eos-c50-full-frame-cinema-camera-canon-rf/'],
    'canon-r6v':      ['Canon', 'EOS R6 V', 'Full-frame 7K video-first mirrorless camera, body only', 2499, 'Cameras', 'Mirrorless & DSLR', '2026/05/images/original/99861_4.jpg', 'cameras/dslr-mirrorless/canon-camera-mirrorless-eos-r6-v/'],
    'sony-fx3':       ['Sony', 'FX3A', 'Full-frame E-mount cinema camera, body', 4298, 'Cameras', 'Cinema', '2023/02/images/original/46909_4239d.jpg', 'cameras/cinema/sony-fx3-camera-de-cinema-full-frame-corpo/'],
    'bm-pocket6kpro': ['Blackmagic Design', 'Pocket Cinema Camera 6K Pro', 'Cinema camera, Canon EF', 2835, 'Cameras', 'Cinema', '2022/08/images/original/37059_a1.jpg', 'cameras/cinema/blackmagic-design-camera-de-cinema-pocket-6k-pro-canon-ef/'],
    'pana-ue40':      ['Panasonic', 'AW-UE40', '4K30 HDMI PTZ camera, 24x optical zoom', 2899, 'Cameras', 'PTZ & robotic', '2022/10/images/original/40268_7309.jpg', 'acessorios/acessorios/panasonic-aw-ue40-4k30-sdihdmi-ptz-camera-com-24x-zoom-optico/'],
    /* lenses */
    'canon-rf24105l': ['Canon', 'RF 24-105mm f/4L IS USM', 'Zoom lens, Canon RF', 1399, 'Lenses', 'RF mount', '2023/03/images/original/47629_canonrf24105mm.jpg', 'lentes/rf-mount/canon-lente-rf-24-105mm-f4-l-is-usm/'],
    'canon-rf2470':   ['Canon', 'RF 24-70mm f/2.8L IS USM', 'Zoom lens, Canon RF', 2599, 'Lenses', 'RF mount', '2024/04/images/original/61399_7497.jpg', 'lentes/acessorios-de-lentes/lente-canon-rf-24-70mm-f28-l-is-usm/'],
    'canon-rf70200':  ['Canon', 'RF 70-200mm f/4L IS USM', 'Telephoto zoom lens, Canon RF', 1699, 'Lenses', 'RF mount', '2024/11/images/original/70439_70.jpg', 'lentes/rf-mount/canon-rf-70-200mm-f4-l-is-usm-lens/'],
    'fuji-mkr50135':  ['Fujinon', 'MK-R 50-135mm T2.9', 'Cine zoom lens, Canon RF', 3999, 'Lenses', 'RF mount', '2025/03/images/original/78663_fujinonmkr50135.jpg', 'lentes/rf-mount/fujinon-lente-mk-r-50-135mm-t29-cine-zoom-rf-mount/'],
    'sony-fe24105':   ['Sony', 'FE 24-105mm f/4 G OSS', 'Zoom lens, Sony E', 1398, 'Lenses', 'E mount', '2020/10/images/original/20315_31274.jpg', 'lentes/fe-mount/sony-lente-fe-24-105mm-f4-g-oss/'],
    'sony-pz28135':   ['Sony', 'FE PZ 28-135mm f/4 G OSS', 'Full-frame power zoom lens, Sony E', 2998, 'Lenses', 'E mount', '2022/05/images/original/32789_sonyfepz28135mm.jpg', 'lentes/fe-mount/sony-lente-fe-pz-28-135mm/'],
    'sony-fe70200':   ['Sony', 'FE 70-200mm f/4 G OSS', 'Telephoto zoom lens, Sony E', 1298, 'Lenses', 'E mount', '2021/05/images/original/23653_1392158857_1029.jpg', 'lentes/fe-mount/sony-lente-fe-70-200mm-f4-g-oss/'],
    'canon-cne1880':  ['Canon', 'CN-E 18-80mm T4.4 Compact-Servo', 'Cine zoom lens, Canon EF', 5020, 'Lenses', 'EF mount', '2024/06/images/original/63080_105445.jpg', 'lentes/ef-mount/canon-lente-zoom-de-cinema-cn-e-18-80mm-t44-compact-servo-ef-mount/'],
    'canon-cne70200': ['Canon', 'CN-E 70-200mm T4.4 Compact-Servo', 'Cine zoom lens, Canon EF', 5510, 'Lenses', 'EF mount', '2024/06/images/original/63089_10546.jpg', 'lentes/ef-mount/canon-lente-zoom-cine-servo-compacta-canon-cn-e-70-200mm-t44-ef-mount/'],
    /* cages, power, PTZ controllers */
    'sr-cage-c50':    ['SmallRig', 'Cage for Canon EOS C50', 'SKU 5656', 69.99, 'Accessories', 'Cages & rigs', '2026/09/images/original/106722_5656.jpg', 'acessorios/cages-e-acessorios/smallrig-cage-for-canon-eos-c50/'],
    'sr-cage-c80':    ['SmallRig', 'Cage for Canon EOS C80', 'SKU 5810', 99.99, 'Accessories', 'Cages & rigs', '2026/09/images/original/106724_5810.jpg', 'acessorios/cages-e-acessorios/smallrig-cage-for-canon-eos-c80/'],
    'sr-cage-c400':   ['SmallRig', 'Basic Cage Kit for Canon EOS C400', 'SKU 4947', 199.99, 'Accessories', 'Cages & rigs', '2026/09/images/original/106734_4947.jpg', 'acessorios/cages-e-acessorios/smallrig-basic-cage-kit-for-canon-eos-c400/'],
    'sr-cage-r6v':    ['SmallRig', 'HawkLock Quick Release Cage for Canon EOS R6 V', 'SKU 6372', 59.99, 'Accessories', 'Cages & rigs', '2026/09/images/original/106553_6372.jpg', 'acessorios/cages-e-acessorios/smallrig-hawklock-quick-release-cage-for-canon-eos-r6-v-6372/'],
    'sr-cage-r6m3':   ['SmallRig', 'HawkLock Quick Release Cage for Canon EOS R6 Mark III / II', 'SKU 5954', 59.99, 'Accessories', 'Cages & rigs', '2026/09/images/original/106726_5954.jpg', 'acessorios/cages-e-acessorios/smallrig-hawklock-quick-release-cage-for-canon-eos-r6-mark-iii-r6-mark-ii/'],
    'sr-cage-r50v':   ['SmallRig', 'Camera Cage for Canon EOS R50 V', 'Black, SKU 5427B', 59.99, 'Accessories', 'Cages & rigs', '2025/10/images/original/92139_99.jpg', 'acessorios/acessorios/smallrig-camera-cage-for-canon-eos-r50-v-black/'],
    'tilta-cage-fx3': ['Tilta', 'Camera Cage for Sony FX3 / FX30 Pro Kit V2', 'Black', 254.15, 'Accessories', 'Cages & rigs', '2023/10/images/original/55015_1694613702_img_.jpg', 'acessorios/cages-e-acessorios/tilta-cage-para-sony-fx3-fx30-pro-kit-v2-gaiola-preto/'],
    'sr-cage-fx6':    ['SmallRig', 'Cage Kit for Sony FX6', 'SKU 4124', 159, 'Accessories', 'Cages & rigs', '2025/01/images/original/74547_photo_20250122_.jpg', 'acessorios/cages-e-acessorios/smallrig-cage-kit-for-sony-fx6/'],
    'sr-cage-pyxis':  ['SmallRig', 'Cage Kit for Blackmagic PYXIS 6K / 12K', 'SKU 5281', 199.99, 'Accessories', 'Cages & rigs', '2026/09/images/original/106550_5281.jpg', 'acessorios/cages-e-acessorios/smallrig-cage-kit-for-blackmagic-pyxis-6k-12k-5281/'],
    'sr-fz100':       ['SmallRig', 'Dummy Battery for Sony NP-FZ100', 'With US power adapter, 4268B', 35.99, 'Accessories', 'Batteries & power', '2024/09/images/original/67913_630.jpg', 'acessorios/baterias-e-carregadores/smallrig-dummy-battery-for-sony-np-fz100-with-power-adapter-american-standard/'],
    'canon-rcip100':  ['Canon', 'RC-IP100', 'PTZ joystick controller with touchscreen', 2099, 'Cameras', 'PTZ & robotic', '2022/01/images/original/30171_5231c004.jpg', 'acessorios-de-cameras/controles-remotos-para-cameras/canon-rc-ip100-controlador-de-joystick-ptz-com-telatouchscreen/'],
    'sony-rmip10':    ['Sony', 'RM-IP10', 'IP remote controller for BRC cameras', 1695, 'Cameras', 'PTZ & robotic', '2021/12/images/original/30048_sonyrmip10iprem.jpg', 'cameras/acessorios-de-cameras/sony-rm-ip10-ip-controlador-remoto-para-cameras-brc/'],
  };
  for (const id in L) {
    if (I9.P[id]) continue;
    const [brand, name, sub, usd, dept, subcat, img, path] = L[id];
    I9.P[id] = { id, brand, name, sub, usd, cat:dept, dept, subcat, img, src:IMG + img, path, white:1, read:READ };
  }

  /* ---------- planning specs ---------- */
  const PAN = 'https://pro-av.panasonic.net/en/products/';
  const CEU = 'https://www.canon-europe.com/';
  const BMD = 'https://www.blackmagicdesign.com/products/';
  const SONY = 'https://pro.sony/ue_US/products/';

  /* PTZ: hW / hT = published horizontal angle at the wide / tele end. Where only the wide angle is published, the tele
     angle is derived from the optical zoom (tan(hT/2) = tan(hW/2) ÷ zoom) and the entry is approx. */
  Object.assign(D.PTZ, {
    'pana-ue40': { zoom:24, hW:74.1, hT:3.3, f:'24× optical, F1.8–4.0', sdi:null, hdmi:true, ndi:'NDI|HX2 (paid upgrade, not included)', ndiKey:true, poe:'PoE+', poeW:30, ctl:['IP','USB'], res:'2160/29.97p HDMI',
      v:true, read:READ, src:PAN + 'aw-ue50-40/spec.html', note:'74.1°→3.3° horizontal. HDMI 1.4 up to 2160/29.97p; no SDI (3G-SDI is the UE50 only). PoE+ IEEE 802.3at or 12 V DC.' },
    ue160b: { zoom:20, hW:75.1, hT:4.0, f:'8.8–176.0 mm', sdi:'12G', hdmi:true, ndi:'NDI High Bandwidth + NDI|HX2 (standard)', poe:'PoE++', poeW:90, poeAC:true, ctl:['IP','RS-422'], res:'2160/60p',
      v:true, read:READ, src:PAN + 'aw-ue160/spec.html', note:'75.1°→4.0°; the page does not say the angles are for 16:9. PoE++ 802.3bt at 1.5 A (42–57 V): more than a 60 W port, so the planner powers it from its AC adaptor. 12G-SDI + 2 × 3G-SDI, HDMI 2.0, SRT.' },
    crn400b: { zoom:20, hW:65.6, hT:3.6, f:'3.67–73.4 mm', sdi:'12G', hdmi:true, ndi:'NDI|HX (licence not stated)', poe:'PoE++', poeW:40, ctl:['IP','RS-422'], res:'2160/59.94p',
      v:true, read:READ, src:CEU + 'ptz-cameras/cr-n400/specifications/', note:'65.6°→3.6° at 29.97/25/23.98 Hz; 63.3°→3.5° at 59.94/50 Hz. PoE++ 802.3bt only (PoE / PoE+ will not power it), ≈34.4 W, needs a Class 5 (40 W) port. 12G-SDI + 3G-SDI, SRT.' },
    'srg-a12': { zoom:12, hW:70.0, hT:6.7, f:'4.4–52.8 mm', sdi:'3G', hdmi:true, ndi:'NDI|HX (firmware v3.0+; licence may be paid)', ndiKey:true, poe:'PoE++', poeW:72, poeAC:true, ctl:['IP','VISCA'], res:'2160/29.97p HDMI, 1080/59.94p SDI',
      approx:true, read:READ, src:SONY + 'ptz-network-cameras/srg-a12', note:'Approx. — verify: Sony publishes ≈70° horizontal at the wide end only; the 6.7° tele angle is derived from the 12× zoom. PoE++ Type 4 up to 71.3 W: planned on its AC adaptor.' },
    'brc-am7': { zoom:20, hW:75.0, hT:4.4, f:'≈7.6–154 mm (Sony gives inches)', sdi:'12G', hdmi:true, ndi:'NDI|HX (pre-installed)', poe:'PoE++', poeW:72, poeAC:true, ctl:['IP','VISCA'], res:'2160/59.94p',
      approx:true, read:READ, src:SONY + 'ptz-network-cameras/brc-am7', note:'Approx. — verify: Sony publishes ≈75° horizontal at the wide end only; the 4.4° tele angle is derived from the 20× zoom. 12G-SDI + 3G-SDI + SFP+, PoE++ up to 71.3 W: planned on its AC adaptor.' },
  });
  /* existing PTZ: a max-resolution line for the picker cards (same pages as planner-data.js) */
  const RES = { ue20:'2160/29.97p', ue50:'2160/29.97p HDMI', ue80:'2160/59.94p', ue100:'2160/59.94p', ue150:'2160/59.94p', crn300:'2160/29.97p', crn500:'2160/59.94p', tail2:'2160/60p' };
  for (const k in RES) if (D.PTZ[k] && !D.PTZ[k].res) D.PTZ[k].res = RES[k];
  D.PTZ.ue20.read = D.PTZ.ue50.read = D.PTZ.ue80.read = D.PTZ.crn300.read = D.PTZ.tail2.read = READ;
  D.PTZ.tail2.sdi = '3G';   /* OBSBOT's current spec page lists 3G-SDI (re-read 25 Nov 2026) */

  /* Camcorders: none of these four publish angles in degrees. Angles are derived from the published 35 mm-equivalent
     focal lengths on a 36 mm width (HFOV = 2·atan(18 ÷ f_equiv)), so every entry is approx. */
  Object.assign(D.CAMCORDER, {
    'pxw-z90': { zoom:12, hW:63.6, hT:5.9, f:'9.3–111.6 mm (29.0–348.0 mm equiv., 16:9)', sdi:'3G', hdmi:true, ndi:null, res:'UHD 29.97p · FHD 59.94p',
      approx:true, read:READ, src:SONY + 'handheld-camcorders/pxw-z90', note:'Approx. — verify: angles derived from Sony\'s 35 mm-equivalent 29.0–348.0 mm (16:9). 3G-SDI + HDMI; streams over RTMP.' },
    'ag-cx350': { zoom:20, hW:72.6, hT:4.2, f:'8.8–176 mm (24.5–490 mm equiv.)', sdi:'3G', hdmi:true, ndi:'NDI|HX (may need an upgrade)', ndiKey:true, res:'UHD 59.94p · FHD 120p',
      approx:true, read:READ, src:PAN + 'ag-cx350/spec.html', note:'Approx. — verify: angles derived from Panasonic\'s 24.5–490 mm equivalent (aspect not stated). SDI out up to 1080/59.94p (the page does not say "3G"). NDI|HX, SRT.' },
    xa75: { zoom:15, hW:70.4, hT:5.4, f:'25.5–382.5 mm equiv., 1.0-type', sdi:'3G', hdmi:true, ndi:null, res:'UHD 30p record · 1080 out',
      approx:true, read:READ, src:CEU + 'video-cameras/xa75/specifications/', note:'Approx. — verify: angles derived from Canon\'s 25.5–382.5 mm equivalent. SDI and mini-HDMI output 1080 only, even when recording UHD.' },
  });
  Object.assign(D.CAMCORDER.xf605, { res:'UHD 59.94p', read:READ, src:CEU + 'video-cameras/xf605/specifications/',
    note:'Approx. — verify: Canon publishes 8.3–124.5 mm (25.5–382.5 mm equiv.), not angles. The CR-N500 page lists the same lens at 73.0°→5.7°, used here. 12G-SDI + HDMI, SRT.' });

  /* Bodies: w = active image width in mm in UHD when the maker publishes it; otherwise the full sensor width (approx).
     cage = a cage listing made for this body; pwr = a priced mains-power part, else a "to quote" line names what to get. */
  Object.assign(D.BODIES, {
    'canon-c50': { mount:'RF', fmt:'ff', w:33.6, sdi:null, hdmi:true, res:'7K RAW 60p · 4K 120p', cage:'sr-cage-c50', pwr:'DR-E6P / DR-E6C DC coupler',
      v:true, read:READ, src:CEU + 'video-cameras/eos-c50/specifications/', note:'33.6 × 18.9 mm in UHD (35.9 mm in DCI 4K). Full-size HDMI, no SDI. LP-E6P battery; mains through the DR-E6P / DR-E6C couplers.' },
    c400: { mount:'RF', fmt:'ff', w:33.8, sdi:'12G', hdmi:true, res:'6K RAW 60p · 4K 60p', cage:'sr-cage-c400', pwr:'12 V DC supply for the 4-pin XLR input',
      v:true, read:READ, src:CEU + 'cameras/eos-c400/specifications/', note:'33.8 × 19.0 mm in UHD (36.0 mm in DCI 4K / 6K). 12G-SDI + 3G-SDI monitor out, full-size HDMI, RJ45 with SRT. 12 V DC on 4-pin XLR.' },
    'canon-r6v': { mount:'RF', fmt:'ff', w:36.0, sdi:null, hdmi:true, res:'7K RAW 60p · 4K 120p', cage:'sr-cage-r6v', pwr:'DR-E6P DC coupler + PD-E2',
      approx:true, read:READ, src:'https://asia.canon/en/consumer/eos-r6-v/body/specification', note:'Approx. — verify: Canon lists the R6 V only as "full-frame", with no size in mm; a generic 36 mm width is used. Full-size HDMI, no SDI. LP-E6P; mains via DR-E6P + PD-E2.' },
    'eos-r6m3': { mount:'RF', fmt:'ff', w:35.9, sdi:null, hdmi:true, res:'7K RAW 60p · 4K 120p', cage:'sr-cage-r6m3', pwr:'DR-E6P DC coupler + PD-E2',
      approx:true, read:READ, src:CEU + 'cameras/eos-r6-mark-iii/specifications/', note:'Approx. — verify: 35.9 mm is the full sensor; Canon does not give the UHD width (it says 4K 120p is uncropped). Full-size HDMI, no SDI.' },
    'sony-fx3': { mount:'E', fmt:'ff', w:35.6, sdi:null, hdmi:true, res:'4K 120p', cage:'tilta-cage-fx3', pwr:'sr-fz100',
      approx:true, read:READ, src:'https://helpguide.sony.net/ilc/2210/v1/en/contents/TP1000886922.html', note:'Approx. — verify: 35.6 mm is the full sensor; 4K is full frame, 4K 120p crops (factor not stated). Full-size HDMI, no SDI. NP-FZ100.' },
    'fx6-24105': { mount:'E', fmt:'ff', w:36.0, sdi:'12G', hdmi:true, res:'UHD 120p · DCI 4K 60p', cage:'sr-cage-fx6', pwr:'DC 19.5 V adaptor or BP-U batteries',
      kit:{ name:'FE 24-105mm f/4 G OSS (included)', min:24, max:105 },
      approx:true, read:READ, src:'https://www.sony.co.uk/interchangeable-lens-cameras/products/ilme-fx6/spec', note:'Approx. — verify: Sony lists full frame without a size in mm; a generic 36 mm width is used. 12G-SDI + HDMI. This listing includes the 24-105 mm lens.' },
    'pyxis6k-l': { mount:'L', fmt:'s35', w:24.3, sdi:'12G', hdmi:false, res:'6K 2.4:1 60p · 4K DCI 60p', cage:'sr-cage-pyxis', pwr:'12 V supply (Lemo) or BP-U batteries',
      approx:true, read:READ, src:BMD + 'blackmagicpyxis/techspecs', note:'Approx. — verify: 4K is a Super 35 window, ≈24.3 mm derived from 4096 × 5.94 µm (not published). 12G-SDI out, no HDMI listed, records BRAW.' },
    bmstudio6k: { mount:'EF', fmt:'s35', w:20.2, sdi:'12G', hdmi:true, studio:true, res:'6K 50p · UHD 60p',
      approx:true, read:READ, src:BMD + 'blackmagicstudiocamera/techspecs', note:'Approx. — verify: UHD is scaled from a 5.3K window, ≈20.2 mm derived. 12G-SDI in/out, HDMI 2.0, 10G Ethernet, PoE / 12 V.' },
    'bm-pocket6kpro': { mount:'EF', fmt:'s35', w:23.1, sdi:null, hdmi:true, res:'6K 50p · UHD 60p', pwr:'12 V DC supply',
      approx:true, read:READ, src:BMD + 'blackmagicpocketcinemacamera/techspecs', note:'Approx. — verify: 23.10 mm is the full sensor; the UHD area is not stated. HDMI out up to 1080p60, no SDI. Built-in NDs.' },
  });
  Object.assign(D.BODIES.c80, { res:'6K RAW 30p · 4K 120p', cage:'sr-cage-c80', pwr:'24 V DC adaptor for the DC IN', read:READ, src:CEU + 'video-cameras/eos-c80/specifications/' });
  Object.assign(D.BODIES.bm4k, { res:'4K 60p', read:READ });
  Object.assign(D.BODIES.r50v, { res:'4K 60p (crop) · 4K 30p', cage:'sr-cage-r50v', pwr:'DR-E18 DC coupler', read:READ, src:CEU + 'cameras/eos-r50v/specifications/',
    note:'Approx. — verify: 22.3 mm is the full APS-C sensor; 4K 60p crops. Micro-HDMI only. The listing includes the RF-S 14-30 mm power zoom.' });
  Object.assign(D.BODIES.fx30, { res:'4K 120p (crop)', cage:'tilta-cage-fx3', pwr:'sr-fz100', read:READ, src:'https://helpguide.sony.net/ilc/2220/v1/en/contents/TP1000888850.html',
    note:'Approx. — verify: 23.3 mm is the full Super 35 sensor; 4K 120p crops about 1.6×. Full-size HDMI, no SDI. NP-FZ100.' });
  Object.assign(D.BODIES.s5iix, { res:'6K 30p · 4K 30p full frame', cage:'tilta-cage-s5ii', pwr:'DC coupler / USB-PD supply', read:READ,
    note:'Approx. — verify: 35.6 mm is the full sensor; full-frame 4K is up to 30p (60p is APS-C). Full-size HDMI, no SDI.' });

  /* the store's zoom lenses for these mounts (focal range = the model designation) */
  Object.assign(D.LENSES, {
    'canon-rf24105l': { mount:'RF', min:24, max:105 }, 'canon-rf2470': { mount:'RF', min:24, max:70 }, 'canon-rf70200': { mount:'RF', min:70, max:200 },
    'fuji-mkr50135': { mount:'RF', min:50, max:135, cine:true },
    'sony-fe24105': { mount:'E', min:24, max:105 }, 'sony-pz28135': { mount:'E', min:28, max:135 }, 'sony-fe70200': { mount:'E', min:70, max:200 },
    'lumix-s-70300': { mount:'L', min:70, max:300 },
    'canon-cne1880': { mount:'EF', min:18, max:80, cine:true }, 'canon-cne70200': { mount:'EF', min:70, max:200, cine:true },
  });
  D.LENSES.mk1855.cine = D.LENSES.mk50135.cine = true;
  D.LENSES.pz18105.apsc = true;   /* an APS-C (Sony "E", not "FE") lens: offered on Super 35 / APS-C bodies only */
  D.OTHER_LENS.EF = [18, 80];
  /* lens presets offered per mount in the picker: 2–4 common zooms, all store listings */
  D.PRESETS = { RF:['canon-rf24105l', 'canon-rf2470', 'canon-rf70200', 'fuji-mkr50135'], E:['sony-fe24105', 'pz18105', 'sony-pz28135', 'sony-fe70200'],
    L:['s24105', 'lumix-s-70300'], EF:['canon-cne1880', 'canon-cne70200'], MFT:['dg1260', 'mk1855'], B4:[] };

  /* PTZ joysticks on the store, by brand (used from two PTZ of one brand) */
  D.PTZCTL = { Panasonic:'rp60', Canon:'canon-rcip100', Sony:'sony-rmip10' };

  /* ---------- the curated picker: a bit from each brand, three families ---------- */
  /* fam: ptz | cc (camcorder) | lens (mirrorless / cine / studio, interchangeable lens). sub = the badge under the family. */
  D.CAMS = [
    ['tail2', 'ptz', 'PTZ'], ['ue20', 'ptz', 'PTZ'], ['pana-ue40', 'ptz', 'PTZ'], ['crn300', 'ptz', 'PTZ'], ['srg-a12', 'ptz', 'PTZ'], ['ue50', 'ptz', 'PTZ'],
    ['ue80', 'ptz', 'PTZ'], ['crn500', 'ptz', 'PTZ'], ['crn400b', 'ptz', 'PTZ'], ['ue100', 'ptz', 'PTZ'], ['brc-am7', 'ptz', 'PTZ'], ['ue160b', 'ptz', 'PTZ'],
    ['pxw-z90', 'cc', 'Camcorder'], ['xa75', 'cc', 'Camcorder'], ['xf605', 'cc', 'Camcorder'], ['ag-cx350', 'cc', 'Camcorder'],
    ['r50v', 'lens', 'Mirrorless'], ['fx30', 'lens', 'Cinema'], ['bm4k', 'lens', 'Studio'], ['s5iix', 'lens', 'Mirrorless'], ['canon-r6v', 'lens', 'Mirrorless'],
    ['eos-r6m3', 'lens', 'Mirrorless'], ['bmstudio6k', 'lens', 'Studio'], ['bm-pocket6kpro', 'lens', 'Cinema'], ['pyxis6k-l', 'lens', 'Cinema'], ['canon-c50', 'lens', 'Cinema'],
    ['sony-fx3', 'lens', 'Cinema'], ['c80', 'lens', 'Cinema'], ['fx6-24105', 'lens', 'Cinema'], ['c400', 'lens', 'Cinema'],
  ].filter(([id, fam]) => I9.P[id] && (fam === 'ptz' ? D.PTZ[id] : fam === 'cc' ? D.CAMCORDER[id] : D.BODIES[id])).map(([id, fam, sub]) => ({ id, fam, sub }));
})();
