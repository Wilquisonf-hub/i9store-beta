/* i9Store room planner — camera, lens, switcher and network data with sources.
   Read on 24–25 Nov 2026. "v" = verified: the value was read on the manufacturer's own public spec page (or Canon's
   spec page quoted by a search excerpt where the page itself refused automated reads; noted per model).
   "approx" = not verified in this session: shown in the UI as "approx. — verify" with the note below.
   Product keys point at real i9store.com/usa listings in shared/catalog.js + shared/catalog-more.js. */
window.I9PLAN = (function () {
  const PAN = 'https://pro-av.panasonic.net/en/products/';

  /* Sensor formats for "camera + lens". w = active image width in mm used for HFOV = 2·atan(w / 2f). */
  const FORMATS = {
    ff:   { label:'Full frame', w:36.0, approx:true, note:'Generic 36 mm. Bodies crop in some modes; each body below sets its own width.' },
    s35:  { label:'Super 35', w:24.9, approx:true, note:'Generic Super 35 (sensors run 23.1–24.9 mm wide).' },
    apsc: { label:'APS-C', w:22.3, approx:true, note:'Canon APS-C 22.3 mm; Sony/Panasonic APS-C ≈ 23.5 mm.' },
    m43:  { label:'Micro Four Thirds', w:17.3, approx:true, note:'Generic Four Thirds 17.3 mm.' },
    b4:   { label:'2/3" (B4 broadcast)', w:9.59, approx:true, note:'Standard 2/3-inch 16:9 image width.' },
  };

  /* PTZ cameras: published horizontal angle of view at the wide and tele ends. Between the two ends the planner
     interpolates tan(HFOV/2) on a log scale, which hits both published ends exactly; mid-zoom values are shown with "≈". */
  const PTZ = {
    ue20:   { zoom:12, hW:71.0, hT:6.0, f:'3.9–46.8 mm', sdi:'3G', hdmi:true, ndi:null, poe:'PoE+', poeW:30, ctl:['IP','RS-422','RS-232C','USB'],
              v:true, src:PAN + 'aw-ue20/spec.html', note:'IEEE 802.3at (PoE+). No NDI listed on the spec page.' },
    ue50:   { zoom:24, hW:74.1, hT:3.3, f:'4.12–98.9 mm', sdi:'3G', hdmi:true, ndi:'NDI|HX2 (upgrade key, depends on purchase date)', ndiKey:true, poe:'PoE+', poeW:30, ctl:['IP','RS-422','USB'],
              v:true, src:PAN + 'aw-ue50-40/spec.html', note:'IEEE 802.3at (PoE+). NDI|HX2 1080p only, not included by default on earlier units.' },
    ue80:   { zoom:24, hW:74.1, hT:3.3, f:'4.12–98.9 mm', sdi:'3G', hdmi:true, ndi:'NDI High Bandwidth + NDI|HX2', poe:'PoE++', poeW:60, ctl:['IP','RS-422'],
              v:true, src:PAN + 'aw-ue80/spec.html', note:'IEEE 802.3bt (PoE++), 1.0 A on PoE++. The spec page lists 3G-SDI out.' },
    ue100:  { zoom:24, hW:74.1, hT:3.3, f:'4.12–98.9 mm', sdi:'12G', hdmi:true, ndi:'NDI High Bandwidth + NDI|HX2', poe:'PoE++', poeW:60, ctl:['IP','RS-422'],
              v:true, src:PAN + 'aw-ue100/spec.html', note:'IEEE 802.3bt (PoE++), 1.0 A on PoE++. 12G-SDI + 3G-SDI out.' },
    ue150:  { zoom:20, hW:75.1, hT:4.0, f:'8.8–176.0 mm', sdi:'12G', hdmi:true, ndi:null, poe:'PoE++', poeW:90, poeAC:true, ctl:['IP','RS-422'],
              v:true, src:PAN + 'aw-ue150/spec.html', note:'PoE++ at 1.2 A (42–57 V): up to ≈68 W, more than a 60 W Type 3 port. Planner powers it from its AC adaptor. No NDI on the spec page (12G-SDI, 3G-SDI, fiber SFP+ out).' },
    crn300: { zoom:20, hW:65.6, hT:3.6, f:'3.67–73.4 mm', sdi:'3G', hdmi:true, ndi:'NDI|HX2', poe:'PoE+', poeW:30, ctl:['IP','RS-422','USB'],
              v:true, src:'https://asia.canon/en/business/cr-n300/main/specification', note:'65.6°–3.6° at 29.97/25/23.98 Hz; 63.5°–3.4° at 59.94/50 Hz. PoE+ IEEE 802.3at, Class 4 (≈16.2 W max draw). The same page also says "PoE cannot be used" for some region variants — verify for US units.' },
    crn500: { zoom:15, hW:73.0, hT:5.7, f:'8.3–124.5 mm', sdi:'3G', hdmi:true, ndi:'NDI|HX2', poe:'PoE+', poeW:30, ctl:['IP','RS-422'],
              v:true, src:'https://asia.canon/en/business/cr-n500/main/specification', note:'PoE+ IEEE 802.3at, Class 4. Same "PoE cannot be used" caveat as the CR-N300 page — verify for US units.' },
    tail2:  { zoom:5, hW:81, hT:18, f:'4.6–23 mm (22–110 mm equiv.)', sdi:'3G', hdmi:true, ndi:'NDI (activation may be sold separately)', ndiKey:true, poe:'PoE+', poeW:30, ctl:['IP','USB'],
              v:true, src:'https://www.obsbot.com/obsbot-tail-2-ptzr-4k-live-production-camera/specs', note:'81° H at 1×, 18° H at 5× optical. PoE+ 802.3af/at, 30 W max. Also USB-C powered.' },
  };

  /* Camcorders with a built-in zoom behave like a PTZ lens on the plan. */
  const CAMCORDER = {
    xf605: { zoom:15, hW:73.0, hT:5.7, f:'8.3–124.5 mm, 1.0-type', sdi:'12G', hdmi:true, ndi:null, approx:true,
             src:'https://asia.canon/en/business/cr-n500/main/specification', note:'Approx. — verify: angles taken from the Canon CR-N500, which publishes the same 8.3–124.5 mm 15× lens on a 1.0-type sensor. Not read from an XF605 page.' },
  };

  /* Camera bodies for "camera + lens". fmt = default format key, w = this body's own active width (mm) when known. */
  const BODIES = {
    bm4k:    { mount:'MFT', fmt:'m43', w:17.78, sdi:'12G', hdmi:true, studio:true, v:true, src:'https://www.blackmagicdesign.com/products/blackmagicstudiocamera/techspecs/W-CAM-21',
               note:'Studio Camera 4K Pro G2: 17.78 × 10 mm (Four Thirds), active MFT mount, 12G-SDI out + return, HDMI 2.0, 10G Ethernet, Type 4 PoE input.' },
    ursabg2: { mount:'B4', fmt:'b4', w:9.59, sdi:'12G', hdmi:false, studio:true, approx:true, src:'https://www.blackmagicdesign.com/products/blackmagicursabroadcast/techspecs/W-CAM-23',
               note:'Blackmagic lists a 2/3-inch effective size with the installed B4 mount (sensor 23.10 × 12.99 mm). 9.59 mm is the standard 2/3" 16:9 width, not a Blackmagic figure.' },
    c80:     { mount:'RF', fmt:'ff', w:33.8, sdi:'12G', hdmi:true, v:true, src:'https://www.canon.co.uk/video-cameras/eos-c80/specifications/',
               note:'Canon: 36.0 × 19.0 mm in 6K/4K DCI; 33.8 × 19.0 mm when UHD or Full HD is selected (used here). Read via a search excerpt of Canon\'s spec page; the page blocks automated reads.' },
    r50v:    { mount:'RF', fmt:'apsc', w:22.3, sdi:null, hdmi:true, kit:{ name:'RF-S 14-30mm f/4-6.3 (included)', min:14, max:30 }, approx:true, src:'',
               note:'Approx. — verify: generic Canon APS-C width. 4K60 may crop. Micro-HDMI out only.' },
    fx30:    { mount:'E', fmt:'s35', w:23.3, sdi:null, hdmi:true, approx:true, src:'',
               note:'Approx. — verify: generic Sony Super 35 / APS-C width. HDMI out only.' },
    s5iix:   { mount:'L', fmt:'ff', w:35.6, sdi:null, hdmi:true, approx:true, src:'',
               note:'Approx. — verify: generic full-frame width; some 4K modes crop. HDMI out only.' },
  };

  /* Lenses on the store, by mount. Focal range in mm. */
  const LENSES = {
    mk1855:  { mount:'MFT', min:18, max:55 },
    dg1260:  { mount:'MFT', min:12, max:60 },
    pz18105: { mount:'E', min:18, max:105 },
    mk50135: { mount:'E', min:50, max:135 },
    s24105:  { mount:'L', min:24, max:105 },
    s50:     { mount:'L', min:50, max:50 },
    s85:     { mount:'L', min:85, max:85 },
    rf45:    { mount:'RF', min:45, max:45 },
  };
  /* "Other lens" when the store has none for that mount: a generic line to quote, with a free focal range. */
  const OTHER_LENS = { RF:[24,105], B4:[8.5,170], MFT:[12,60], E:[18,105], L:[24,105] };

  /* Switchers on the store. inp = camera inputs; stream = built-in streaming; uhd = handles 2160p.
     ATEM SDI Pro ISO (4 × 3G-SDI, RTMP/SRT streaming) and SDI Extreme ISO (8 SDI in) were confirmed on Blackmagic's
     tech-spec pages via search on 25 Nov 2026 (https://www.blackmagicdesign.com/products/atemsdi/techspecs). The ATEM Mini
     and Constellation counts are Blackmagic's published figures as known to the store team, not re-read here: approx. */
  const SWITCHERS = {
    hdmi: [ { id:'atemproiso', inp:4, stream:true, iso:true, approx:true }, { id:'atemxiso', inp:8, stream:true, iso:true, approx:true } ],
    sdi:  [ { id:'atemsdipro', inp:4, stream:true, iso:true, v:true }, { id:'atemsdix', inp:8, stream:true, iso:true, v:true }, { id:'atem1mehd', inp:10, stream:false, approx:true } ],
    sdiUHD: [ { id:'atem1me', inp:10, stream:false, uhd:true, approx:true } ],
    encoder: 'bmenc',
    src:'https://www.blackmagicdesign.com/products/atemsdi/techspecs',
    note:'ATEM Mini Pro ISO / Mini Extreme ISO G2 / Constellation input counts: Blackmagic published figures, not re-read on 25 Nov 2026 — verify before quoting.',
  };

  /* Network switches on the store with their PoE budget (manufacturer pages). */
  const NETSW = [
    { id:'gs108pp', ports:8, poePlus:8, poePP:0, budget:123, managed:false, src:'https://www.netgear.com/business/wired/switches/unmanaged/gs108pp/', note:'8 × PoE+ (30 W/port), 123 W total.' },
    { id:'m4250',   ports:8, poePlus:8, poePP:0, budget:125, managed:true,  src:'i9store listing title "(125 W)"', note:'Managed AV Line switch (IGMP for NDI), 8 × PoE+, 125 W per the listing title.' },
    { id:'gs516up', ports:16, poePlus:8, poePP:8, budget:380, managed:false, src:'https://www.netgear.com/business/wired/switches/unmanaged/gs516up/', note:'8 × PoE+ and 8 × PoE++ Type 3 (60 W/port), 380 W total.' },
  ];

  /* Rules used by the planner. All lengths in metres. */
  const RULES = {
    slackPct: 0.20,            /* +20 % on the routed length */
    slackM: 2,                 /* then +2 m for service loops and dressing */
    rise: { tripod:1.2, table:0.8, wall:2.5, ceiling:3.0 },  /* vertical allowance at the camera end */
    riseCtrl: 0.8,             /* drop to the desk at the control position */
    hdmiPassive: 7.6,          /* longest passive HDMI on the store; good practice is ≤ 5–7 m for 4K60 */
    hdmiActive: 15,            /* beyond this, convert to SDI or fiber */
    sdi3G: 100,                /* rule of thumb for 1080p on RG6-class coax; check the cable maker's chart */
    sdi12G: 50,                /* rule of thumb for 2160p on 12G coax (e.g. Canare L-5.5CUHD runs longer) */
    sdiBulkFrom: 120,          /* total SDI metres above which a bulk reel + connectors beats made-up cables */
    eth: 100,                  /* Ethernet channel limit incl. patch cords */
    shoulder: 0.5,             /* a person's shoulder width for shot sizes */
    shots: [ ['cu',0.75], ['mcu',1.25], ['med',2.5], ['wide',Infinity] ],  /* frame width at the subject, metres */
    frameFor: { cu:0.6, mcu:1.0, med:1.8 },  /* frame width the "Frame" buttons aim for */
  };

  /* Guided wizard (planner-wizard.js) and 3D view (planner-3d.js), added 25 Nov 2026.
     ROOMS: typical room sizes offered as presets, width × depth in metres. Approx. — verify: planning defaults chosen by the
     i9 team for a starting layout, not measured rooms; the customer can type their own.
     HEIGHTS: metres above the floor used only to draw the 3D model. Approx. — verify: common practice values, not
     manufacturer data (camera lens height on each mount, people, furniture, a stage riser). The 2D cable rule keeps
     RULES.rise above. */
  const ROOMS = {
    church:  [['s', 10, 14], ['m', 16, 24], ['l', 24, 36]],
    podcast: [['s', 4, 3.5], ['m', 5.5, 4.5], ['l', 7, 6]],
    studio:  [['s', 6, 5], ['m', 10, 8], ['l', 14, 10]],
    event:   [['s', 15, 12], ['m', 30, 20], ['l', 40, 30]],
    school:  [['s', 9, 7], ['m', 18, 22], ['l', 30, 25]],
    corp:    [['s', 6, 5], ['m', 10, 8], ['l', 16, 12]],
    approx: true,
  };
  const HEIGHTS = {
    cam: { tripod:1.5, table:1.15, wall:2.6, ceiling:2.9 },
    eyeStand:1.62, eyeSeat:1.2, stage:0.6, table:0.74, desk:0.76, pulpit:1.1, seat:0.45, set:2.4, lightStand:2.2,
    wall:(w, d) => Math.min(7, Math.max(3, 0.18 * Math.max(w, d))),
    approx: true,
  };

  return { FORMATS, PTZ, CAMCORDER, BODIES, LENSES, OTHER_LENS, SWITCHERS, NETSW, RULES, ROOMS, HEIGHTS };
})();
