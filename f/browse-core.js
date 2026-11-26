/* Direction G — browse core: setups, solution metadata, the bag, and the setup "kit" composition.
   Loaded after ../shared/catalog.js, catalog-more.js and catalog-browse.js, before nav-mega.js / setups.js / shop.js.
   Every product id below is a real i9store.com/usa listing in window.I9.P. Setups are suggested starting points built
   from live listings, not packages sales has confirmed. "why" lines say what the piece does in the room; they make no
   spec claim beyond the listing title.
   Setup images are COMPOSITIONS of the listings' own packshots on #FFFFFF (every packshot has a white ground), laid out
   like a catalogue kit page and labelled "Suggested setup · products shown are live listings". None of i9's project
   photos is hotspotted: no i9 source names the exact models in those photos (see DIRECTIONS-B2-D.md, Setups + browse).
   Solution data (I9S.SOL) is the single source for all of direction G: g.js reads it for the home page.
   The bag lives in bag.js (window.I9BAG); I9S.bag is the same object. */
(function () {
  const I9 = window.I9; if (!I9) return;
  const { P, usd } = I9;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
  const SH = '../shared/';

  /* ---------- the nine solutions: the ONE source (home hero/bus/multiview/chain/picks in g.js, the mega menu, setups
     and shop all read this). Home copy (h, lede, get, mode, chain, jobs, picks) moved here from g.js unchanged;
     short = the menu / setup label; fits = the store kinds that room buys (shop membership, see DIRECTIONS-B2-D.md). */
  const SOL = {
    church: { label:'Churches', bus:'Churches', who:'Services, livestream, volunteer crews', chainName:'church chain', path:'Light to stream',
      h:'Sunday, on air.', lede:'PTZ cameras, a switcher, wireless handhelds and stage light a volunteer crew can run. Buy a single piece, or send us your room and we’ll quote the whole chain.',
      get:'Stage light, a PTZ camera, wireless handhelds, a mixer and a stream switcher.', mode:'both',
      chain:['ls600d','ue20','ewd','l12','atemmp'], jobs:['Light the platform','Capture','Mic the pulpit','Mix','Switch and stream'],
      picksH:'Picked for churches', picks:['rp60','atem1me','ewdme3','dm3','hyperdeck','solid'],
      photo:'igreja.webp', pos:'46% 62%', src:'i9 church project', cap:'Sanctuary booth, i9 church project',
      alt:'View from a sanctuary booth: a video router panel and program monitor in front of the stage and LED wall',
      short:'Churches',
      fits:['PTZ & robotic','Camcorders','Switchers','Encoders & decoders','Microphones','Recorders & mixers','Headphones & headsets','LED lights','Controls & DMX','Intercom','Teleprompters','Monitors','Converters'] },
    broadcast: { label:'Broadcast & TV', bus:'Broadcast & TV', who:'Stations, studios, master control', chainName:'studio chain', path:'Light to switcher',
      h:'Studio and field gear, specified to the SKU.', lede:'Studio cameras, talent audio, prompting and production switchers with part numbers up front. Quote against your PO, or buy single pieces now.',
      get:'Key light, studio camera, talent lav, prompter and a 1 M/E switcher.', mode:'quote',
      chain:['nova','bm4k','ewdme4','fps170','atem1me'], jobs:['Key light','Studio camera','Talent audio','Prompt','Switch'],
      picksH:'Picked for stations', picks:['videohub','ursabg2','ue80','rp60','hyperdeck','va7'],
      photo:'sol-broadcast-record-manaus-control.webp', pos:'50% 42%', src:'Record Manaus', cap:'Record Manaus control room · i9TV engineering',
      alt:'A station control room: operators at the switcher and audio desks under a wall of program monitors',
      short:'Broadcast',
      fits:['Broadcast','Cinema','PTZ & robotic','Switchers','Converters','Teleprompters','Intercom','Encoders & decoders','Monitors','Wireless video','Tripods','Microphones','Recorders & mixers','LED lights','Devices & controls','Cables & connectors'] },
    podcast: { label:'Podcast & radio', bus:'Podcast & radio', who:'Video podcasts, radio studios', chainName:'podcast chain', path:'Light to stream',
      h:'Sound like radio. Look like TV.', lede:'A broadcast vocal mic, a podcast recorder, an auto-tracking camera and an ISO switcher that records every angle. For a company studio, a church radio or your own show.',
      get:'Key light, AI-tracking camera, vocal mic, podcast recorder, ISO switcher.', mode:'both',
      chain:['a200d','tail2','sm7b','p8','atemproiso'], jobs:['Key light','Camera','Mic','Record and mix','Switch and stream'],
      picksH:'Picked for podcasts and radio', picks:['mv7','mdr','p60c','pt2c','l12','dm3'],
      photo:'sol-podcast-studio-set.webp', pos:'50% 60%', src:'i9 podcast set', cap:'Podcast set · i9 podcast-studio solution',
      alt:'A podcast set: a table with microphones on arms, leather armchairs and wood shelving under soft overhead light',
      short:'Podcast',
      fits:['PTZ & robotic','Mirrorless & DSLR','Switchers','Microphones','Recorders & mixers','Headphones & headsets','LED lights','Light modifiers','Audio accessories','Tripods'] },
    events: { label:'Live events', bus:'Live events', who:'Concerts, conferences, sports', chainName:'event chain', path:'Camera to stream',
      h:'One take. Every camera rolling.', lede:'A 4K camcorder, wireless video, handheld mics, crew intercom and an ISO switcher for shows that happen once. Quote the package for your date, or buy single pieces now.',
      get:'4K camcorder, wireless video, handhelds, crew intercom, ISO switcher.', mode:'both',
      chain:['xf605','bolt6','ewd','c16s','atemxiso'], jobs:['Camera','Wireless video','Mic the stage','Crew comms','Switch and stream'],
      picksH:'Picked for live events', picks:['l20r','versa','sumo19se','ls1200d','ue80','ewdme3'],
      photo:'sol-events-finday-camera.webp', pos:'55% 40%', src:'Finday, São Paulo', cap:'Finday, São Paulo · i9 Studios rental and crew',
      alt:'A camera operator on a riser at a conference, stage light beams cutting through the haze behind him',
      short:'Events',
      fits:['Camcorders','PTZ & robotic','Broadcast','Wireless video','Switchers','Encoders & decoders','Intercom','Microphones','Recorders & mixers','Monitors','LED lights','Controls & DMX','Tripods'] },
    production: { label:'Production companies', bus:'Production', who:'Crews on set and on location', chainName:'production chain', path:'Light to monitor',
      h:'Gear that goes out on the next job.', lede:'High-output light, a cinema camera, wireless lavaliers, a field recorder and a wireless monitor for crews on location. Buy today, or quote quantities for the whole package.',
      get:'High-output key, 6K cinema camera, wireless lav, recorder, monitor.', mode:'both',
      chain:['ls600d','c80','ewdpme2','f6','m7pro'], jobs:['Key light','Camera','Wireless lav','Record sound','Monitor'],
      picksH:'Picked for production', picks:['solid','nova','rs4','f22x','dome150','f10'],
      photo:'sol-production-canta-comigo-rack.webp', pos:'50% 50%', src:'Canta Comigo', cap:'Canta Comigo · i9 Studios 4K OB truck',
      alt:'Inside an OB truck: racks of camera control units, colour-bar monitors and orange fibre cabling',
      short:'Production',
      fits:['Cinema','Mirrorless & DSLR','Camcorders','PL mount','RF mount','EF mount','E mount','L mount','MFT mount','Nikon Z mount','Lens accessories','LED lights','Light modifiers','Microphones','Recorders & mixers','Monitors','Wireless video','Gimbals & sliders','Tripods','Support accessories','Cages & rigs','Batteries & power','Memory cards','Intercom'] },
    creator: { label:'Creators & YouTube', bus:'Creators', who:'Channels, streams, small studios', chainName:'creator chain', path:'Light to stream',
      h:'Better picture and sound, this week.', lede:'A mirrorless camera made for video, a compact key light, wireless mics and a four-camera stream switcher. One-page checkout, no account needed.',
      get:'Compact key, mirrorless camera, wireless mics, stream switcher, deck.', mode:'buy',
      chain:['ls60d','r50v','profile','atemmp','lslive'], jobs:['Key light','Camera','Mic','Switch and stream','Control'],
      picksH:'Picked for creators', picks:['lantern','a60x','mv7','tail2','ninja','mdr'],
      comp:['r50v','ls60d','profile'], src:'Live listings', cap:'Three live listings · not a photo',
      short:'Creators',
      fits:['Mirrorless & DSLR','Switchers','Devices & controls','Microphones','Recorders & mixers','Headphones & headsets','LED lights','Light modifiers','Tripods','Gimbals & sliders','Monitors','RF mount','E mount','L mount','MFT mount','Nikon Z mount','Memory cards'] },
    education: { label:'Schools & government', bus:'Schools & gov', who:'Classrooms, chambers, public sessions', chainName:'session chain', path:'Camera to stream',
      h:'Every session, streamed and on record.', lede:'PTZ cameras with a joystick controller, handheld mics for the floor, and a switcher and encoder to stream and archive. Quoted against a PO, or an invoice for your finance team.',
      get:'PTZ camera and joystick, floor mics, ISO switcher, streaming encoder.', mode:'quote',
      chain:['ue50','rp60','ewd','atemproiso','bmenc'], jobs:['Capture','Camera control','Mic the floor','Switch and record','Stream'],
      picksH:'Picked for schools and government', picks:['crn300','hyperdeck','l12','sp150','ewdme4','va7'],
      photo:'auditorio.webp', pos:'50% 64%', src:'Auditorium', cap:'Auditorium · i9 institutions and government',
      alt:'A large dark auditorium seen from the back: rows of seats facing three wide screens',
      short:'Schools & gov',
      fits:['PTZ & robotic','Switchers','Encoders & decoders','Microphones','Recorders & mixers','Teleprompters','Monitors','Converters'] },
    corporate: { label:'Corporate studios', bus:'Corporate', who:'In-house video, training, town halls', chainName:'corporate chain', path:'Light to switcher',
      h:'A studio your team can run on Monday.', lede:'A PTZ camera, soft panel light, a lavalier, a teleprompter and an ISO switcher, sized for an ordinary meeting room. Buy it on a company card, or have it quoted.',
      get:'Panel light, NDI PTZ camera, lavalier, teleprompter, ISO switcher.', mode:'both',
      chain:['p60c','crn300','ewdme4','sp150','atemproiso'], jobs:['Key light','Camera','Mic','Prompt','Switch and stream'],
      picksH:'Picked for corporate studios', picks:['sm7b','tail2','a200d','hyperdeck','bmenc','mdr'],
      photo:'sol-corporate-studio.webp', pos:'50% 58%', src:'i9 corporate studio', cap:'Corporate studio · i9 corporate-studio solution',
      alt:'A corporate studio: PTZ cameras on stands facing a meeting table with a screen and bookshelves',
      short:'Corporate',
      fits:['PTZ & robotic','Mirrorless & DSLR','Switchers','Encoders & decoders','Microphones','Teleprompters','LED lights','Light modifiers','Recorders & mixers','Monitors'] },
    integrator: { label:'Integrators & resellers', bus:'Integrators', who:'Project lists across 140+ brands', chainName:'project chain', path:'Router to control',
      h:'Project lists, priced by SKU.', lede:'Routing, conversion, AV networking, Dante audio and show control across 140+ brands. Build a quote list and send it in one go; a specialist replies with a priced list for the project.',
      get:'12G router, converters, AV network switch, Dante console, show control.', mode:'quote',
      chain:['videohub','microconv','m4250','dm3d','cuecore'], jobs:['Route','Convert','Network','Mix on Dante','Show control'],
      picksH:'Picked for integrators', picks:['ue80','rp60','ewdxem2','atem1me','vptouch','hyperdeck'],
      comp:['videohub','dm3d','cuecore'], src:'Live listings', cap:'Three live listings · not a photo',
      short:'Integrators',
      fits:['Converters','Switchers','Devices & controls','Encoders & decoders','Intercom','Controls & DMX','Cables & connectors','Recorders & mixers','Microphones','PTZ & robotic','Monitors'] },
  };
  const ORDER = ['church','broadcast','podcast','events','production','education','corporate','creator','integrator'];

  /* ---------- groups: how a setup's parts list is sectioned (IKEA-style "what it is for") ---------- */
  const GROUPS = [
    ['picture', 'Picture'], ['light', 'Light'], ['sound', 'Sound'], ['control', 'Switch, record, stream'],
    ['comms', 'Comms and network'], ['support', 'Support and power'],
  ];

  /* ---------- setups. item: [id, qty, group, why, h (visual height in the kit), row (0 back, 1 front)] ---------- */
  const SETUPS = [
    { id:'church-1op', sol:'church', size:'S', sizeName:'One operator', title:'Small church, one operator',
      lede:'Two PTZ cameras, a live-stream switcher, two handhelds and a mixer that records every channel. One volunteer runs it from the booth.',
      crew:'1 operator', items:[
      ['ls600d',1,'light','Daylight key for the platform, from the back of the room.',3.4,0],
      ['ue20',2,'picture','One camera holds the wide, one follows the speaker. 12x zoom.',1.9,0],
      ['ewd',2,'sound','Handhelds for the pastor and the worship leader.',1.7,1],
      ['l12',1,'sound','Mixes the band and the mics and records each channel.',1.25,1],
      ['atemmp',1,'control','Cuts between the two cameras and streams the service.',0.9,1],
      ['mdr',1,'sound','The operator hears the stream mix, not the room.',1.3,1] ]},
    { id:'church-3ptz', sol:'church', size:'L', sizeName:'Three PTZ over IP', title:'Church, three PTZ cameras over IP',
      lede:'Three 4K PTZ cameras on the network, one joystick for presets, a 1 M/E switcher, a recorder for the archive and an encoder for the stream.',
      crew:'2–3 people', items:[
      ['ls600d',2,'light','Front light for the platform, one from each side.',3.4,0],
      ['ue80',3,'picture','Wide, pulpit and worship. 4K60 with SDI, HDMI and NDI.',2,0],
      ['rp60',1,'control','One joystick recalls the presets for all three cameras.',1.25,1],
      ['atem1me',1,'control','Switches the cameras, slides and lyrics into one program.',1.1,1],
      ['hyperdeck',1,'control','Records the program for the archive and the replay.',0.75,1],
      ['bmenc',1,'control','Sends the program to your site and to YouTube.',0.75,1],
      ['m4250',1,'comms','Managed AV switch that carries the cameras on the network.',0.6,1],
      ['ewdme3',2,'sound','Headset mics for the speaker and the worship leader.',1.6,1],
      ['ewd',2,'sound','Handhelds for readings and announcements.',1.7,1],
      ['dm3',1,'sound','Digital console for the band, the mics and the stream mix.',1.3,1],
      ['solid',1,'comms','Talkback between the booth, the stage and the camera op.',1.4,1] ]},
    { id:'podcast-2cam', sol:'podcast', size:'M', sizeName:'Two hosts', title:'Two-camera video podcast',
      lede:'Two hosts, two auto-tracking cameras, two broadcast vocal mics, a podcast recorder and an ISO switcher that keeps every angle for the edit.',
      crew:'Hosts run it', items:[
      ['a200d',2,'light','One key light per host.',2.4,0],
      ['ad01',2,'support','Puts each camera at eye level across the table.',3.6,0],
      ['tail2',2,'picture','One camera per host. It tracks the speaker.',1.4,0],
      ['sm7b',2,'sound','Broadcast vocal mic for each host.',1.25,1],
      ['p8',1,'sound','Records each mic on its own track.',0.95,1],
      ['atemproiso',1,'control','Records every camera angle as its own file.',0.85,1],
      ['mdr',2,'sound','One pair of studio headphones per host.',1.3,1] ]},
    { id:'broadcast-studio', sol:'broadcast', size:'L', sizeName:'Three studio cameras', title:'Small broadcast studio',
      lede:'Three studio cameras on fluid-head tripods, a teleprompter on the presenter camera, a 1 M/E switcher, a 12G router and crew talkback.',
      crew:'4–6 crew', items:[
      ['nova',2,'light','Soft RGBWW key and fill for the desk.',2.4,0],
      ['focus12',3,'support','Fluid head and two-stage tripod for each camera.',3.6,0],
      ['bm4k',3,'picture','Wide, presenter and guest.',1.35,0],
      ['fps170',1,'picture','Prompter for the presenter camera.',2.2,0],
      ['ewdme4',2,'sound','Lavaliers for presenter and guest.',1.5,1],
      ['atem1me',1,'control','The production switcher for the show.',1.1,1],
      ['videohub',1,'control','Routes cameras, program and returns to every monitor.',0.7,1],
      ['hyperdeck',1,'control','Records the program.',0.75,1],
      ['c16s',1,'comms','Six wireless headsets for camera ops and the floor.',1.4,1] ]},
    { id:'event-2cam', sol:'events', size:'M', sizeName:'Two cameras + wireless', title:'Live event, two cameras and wireless video',
      lede:'Two operated 4K camcorders, a wireless video link for the roaming camera, an ISO switcher with a big monitor, stage mics and crew intercom.',
      crew:'3–4 crew', items:[
      ['wildbull-t7s',2,'support','Tripod for each camcorder.',3.6,0],
      ['xf605',2,'picture','Two operated cameras: the wide and the close-up.',1.5,0],
      ['bolt6',1,'picture','Wireless video from the roaming camera to the switcher.',1,0],
      ['sumo19se',1,'control','Big monitor at the switcher: watch, record, switch.',2,0],
      ['atemxiso',1,'control','ISO switcher: streams the show and keeps every angle.',1,1],
      ['ewd',2,'sound','Handhelds for the stage.',1.7,1],
      ['l20r',1,'sound','Twenty-channel mixer-recorder for the stage.',1.2,1],
      ['c16s',1,'comms','Six headsets for camera ops, director and stage.',1.4,1] ]},
    { id:'creator-desk', sol:'creator', size:'S', sizeName:'One desk', title:'Creator desk',
      lede:'A mirrorless camera made for video, a compact key light with a lantern, wireless and desk mics, and a four-camera stream switcher with a control deck.',
      crew:'Just you', items:[
      ['ls60d',1,'light','Compact daylight key for the desk.',1.6,0],
      ['lantern',1,'light','Turns the LS 60d into a big, soft source.',2.4,0],
      ['r50v',1,'picture','Mirrorless camera with a 14–30 mm lens.',1,0],
      ['dt01',1,'support','Small tripod for the camera on the desk.',1.5,0],
      ['mv7',1,'sound','Desk mic for the voice.',1.4,1],
      ['profile',1,'sound','Wireless mics when you stand up or bring a guest.',0.9,1],
      ['atemmp',1,'control','Switches up to four HDMI cameras and streams.',0.8,1],
      ['lslive',1,'control','Scene and sound buttons at your fingertips.',0.8,1],
      ['mdr',1,'sound','Studio headphones.',1.3,1] ]},
    { id:'corporate-room', sol:'corporate', size:'M', sizeName:'Meeting room', title:'Corporate studio in a meeting room',
      lede:'Two NDI PTZ cameras, a three-panel light kit, lavaliers, a teleprompter and an ISO switcher with a streaming encoder for town halls.',
      crew:'1 person', items:[
      ['p60c',1,'light','Three soft panels: key, fill and back light.',1.6,0],
      ['crn300',2,'picture','One on the presenter, one on the wide.',1.9,0],
      ['sp150',1,'picture','Prompter with a 15" foldable monitor.',2.1,0],
      ['ewdme4',2,'sound','Lavaliers for two presenters.',1.5,1],
      ['atemproiso',1,'control','Switches and records every angle.',0.85,1],
      ['bmenc',1,'control','Streams town halls to your platform.',0.75,1],
      ['gs108pp',1,'comms','Eight-port PoE+ switch for the camera network.',0.55,1] ]},
    { id:'council-chamber', sol:'education', size:'M', sizeName:'Two PTZ + floor mics', title:'Council chamber or lecture hall',
      lede:'Two 24x PTZ cameras with a joystick controller, handheld mics for the floor, a mixer, and a switcher, recorder and encoder to stream and archive.',
      crew:'1 operator', items:[
      ['ue50',2,'picture','Covers the dais and the floor. 24x optical zoom.',2,0],
      ['rp60',1,'control','Joystick with presets for each seat.',1.25,1],
      ['ewd',3,'sound','Handhelds for the chair and public comment.',1.7,1],
      ['l12',1,'sound','Mixes the floor and the dais mics.',1.25,1],
      ['atemproiso',1,'control','Switches the session and records each camera.',0.85,1],
      ['hyperdeck',1,'control','Keeps the record copy of every session.',0.75,1],
      ['bmenc',1,'control','Streams the session to the public.',0.75,1] ]},
    { id:'interview-kit', sol:'production', size:'M', sizeName:'Location interview', title:'Location interview kit',
      lede:'A 6K cinema camera with a fast prime, a high-output key with a softbox, an RGBWW fill, wireless lav, field recorder, wireless monitor and batteries.',
      crew:'2–3 crew', items:[
      ['ls600d',1,'light','High-output daylight key, V-Mount.',3.4,0],
      ['dome150',1,'light','Softbox that shapes the key.',2.6,0],
      ['f22x',1,'light','Flexible RGBWW panel for fill or background.',1.6,0],
      ['wildbull-t7s',1,'support','Tripod for the camera.',3.6,0],
      ['c80',1,'picture','Full-frame 6K cinema camera, Canon RF.',1.25,1],
      ['rf45',1,'picture','Fast RF prime for the interview frame.',0.8,1],
      ['ewdpme2',1,'sound','Wireless lavalier for the subject.',1.1,1],
      ['f6',1,'sound','Multitrack field recorder.',0.9,1],
      ['m7pro',1,'picture','Wireless monitor for the director.',0.95,1],
      ['hypercore150-v',2,'support','V-Mount batteries so the key runs without mains power.',1,1] ]},
    { id:'control-rack', sol:'integrator', size:'L', sizeName:'Control room rack', title:'Control room: routing, Dante and show control',
      lede:'A 12G router with bidirectional converters, a managed AV network switch, a Dante console and receiver, and show control with a wall touch screen.',
      crew:'Project install', items:[
      ['videohub',1,'control','The 20x20 12G router at the heart of the room.',0.8,0],
      ['microconv',4,'control','SDI/HDMI converters for displays and sources.',0.6,1],
      ['m4250',1,'comms','Managed AV network for Dante and control.',0.6,0],
      ['dm3d',1,'sound','Digital console with Dante.',1.3,0],
      ['ewdxem2',1,'sound','Two-channel wireless receiver on Dante.',0.65,1],
      ['cuecore',1,'comms','Show control: lighting, AV and triggers.',0.75,1],
      ['vptouch',1,'comms','Wall touch screen for lighting and DMX.',1.2,1] ]},
  ];
  SETUPS.forEach((s, i) => {
    s.n = i + 1;
    s.items = s.items.map(([id, q, g, why, h, r]) => ({ id, q, g, why, h, r }));
    /* list numbers run in group order (so the list reads 1, 2, 3 down the page); the kit keeps the authored layout order */
    const gi = g => GROUPS.findIndex(x => x[0] === g);
    s.items.map((it, i) => [gi(it.g), i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(([, i], k) => { s.items[i].no = k + 1; });
    s.total = s.items.reduce((a, it) => a + P[it.id].usd * it.q, 0);
    s.pieces = s.items.reduce((a, it) => a + it.q, 0);
  });
  const SET = Object.fromEntries(SETUPS.map(s => [s.id, s]));
  const setupsFor = k => SETUPS.filter(s => s.sol === k);
  const inSetups = id => SETUPS.filter(s => s.items.some(it => it.id === id));

  /* solution membership for the shop: in a setup / picked (chain or picks) / fits (store subcategory the room buys from) */
  function solTie(id, k) {
    const s = SOL[k], p = P[id];
    if (setupsFor(k).some(x => x.items.some(it => it.id === id))) return 'setup';
    if (s.chain.includes(id) || s.picks.includes(id)) return 'picked';
    if (p && s.fits.includes(p.subcat)) return 'fits';
    return '';
  }

  /* ---------- bag: the shared module in bag.js (localStorage 'i9g-bag') ---------- */
  const bag = window.I9BAG;

  /* ---------- the kit: a composition of real packshots on white, laid out in rows, scaled to its frame ---------- */
  const aspect = {};   /* natural aspect per image, filled as images load */
  function kitHTML(s, opt = {}) {
    const hs = opt.hotspots;
    const items = s.items.map((it, i) => {
      const p = P[it.id], n = opt.copies === false ? 1 : Math.min(it.q, 3);
      const imgs = Array.from({ length: n }, (_, c) => `<img src="${p.src}" alt="" ${opt.lazy ? 'loading="lazy"' : ''} decoding="async" data-c="${c}">`).join('');
      return `<span class="kit-i" data-i="${i}" data-n="${n}">${imgs}</span>`;
    }).join('');
    const spots = hs ? s.items.map((it, i) => { const p = P[it.id];
      return `<button type="button" class="hs" data-i="${i}" aria-label="${it.no}: ${esc(p.brand + ' ' + p.name)}${it.q > 1 ? ', ' + it.q + ' pieces' : ''}" aria-pressed="false" aria-controls="row-${i}"><span>${it.no}</span>${it.q > 1 ? `<small>×${it.q}</small>` : ''}</button>`; }).join('') : '';
    return `<span class="kit-in">${items}${spots}</span>`;
  }
  function layoutKit(kit, s, opt = {}) {
    const W = 100, ar = kit.clientWidth / Math.max(1, kit.clientHeight) || 1.6, H = W / ar;
    const narrow = ar < 1.25;
    const OV = 0.42, GAP = opt.gap ?? 0.55, VG = opt.vgap ?? 0.45;
    const padX = opt.padX ?? 5, padT = opt.padT ?? (narrow ? 12 : 9), padB = opt.padB ?? (narrow ? 8 : 7);
    /* visual heights are compressed (h^0.8) so a tripod does not shrink a converter to a speck */
    const hv = it => Math.pow(it.h, 0.8);
    const base = [0, 1, 2].map(r => s.items.map((it, i) => ({ it, i })).filter(x => (x.it.r || 0) === r)).filter(r => r.length);
    const chunk = (r, cap) => { const n = Math.ceil(r.length / cap), size = Math.ceil(r.length / n); const out = []; for (let j = 0; j < r.length; j += size) out.push(r.slice(j, j + size)); return out; };
    const measure = rows => rows.map(r => {
      const cells = r.map(({ it, i }) => {
        const a = aspect[P[it.id].src] || 1.2, n = opt.copies === false ? 1 : Math.min(it.q, 3), h = hv(it), sw = h * a;
        return { i, h, sw, w: sw * (1 + OV * (n - 1)), n };
      });
      return { cells, w: cells.reduce((a, c) => a + c.w, 0) + GAP * (cells.length - 1), h: Math.max(...cells.map(c => c.h)) };
    });
    const fitK = meas => { const totH = meas.reduce((a, r) => a + r.h, 0) + VG * (meas.length - 1);
      return [Math.min((W - 2 * padX) / Math.max(...meas.map(r => r.w)), (H - padT - padB) / totH), totH]; };
    /* try a few row splits and keep the one that lets the pieces be biggest */
    let best = null;
    for (const cap of [99, 6, 5, 4, 3, 2]) {
      const rows = base.flatMap(r => r.length > cap ? chunk(r, cap) : [r]);
      if (best && rows.length === best.rows.length && cap !== 99) continue;
      const meas = measure(rows), [k, totH] = fitK(meas), score = k * (1 - 0.04 * rows.length);
      if (!best || score > best.score) best = { rows, meas, k, totH, score };
    }
    const { meas, k, totH } = best;
    let y = padT + ((H - padT - padB) - totH * k) / 2;
    const boxes = [];
    meas.forEach(r => {
      let x = (W - r.w * k) / 2; const base = y + r.h * k;
      r.cells.forEach(c => { boxes[c.i] = { x, y: base - c.h * k, w: c.w * k, h: c.h * k, sw: c.sw * k, n: c.n }; x += (c.w + GAP) * k; });
      y = base + VG * k;
    });
    kit.querySelectorAll('.kit-i').forEach(el => {
      const b = boxes[+el.dataset.i]; if (!b) return;
      Object.assign(el.style, { left: b.x / W * 100 + '%', top: b.y / H * 100 + '%', width: b.w / W * 100 + '%', height: b.h / H * 100 + '%' });
      [...el.children].forEach((img, c) => {
        /* copies: the first stands in front, later ones step back to the right */
        Object.assign(img.style, { left: (c * OV * b.sw) / b.w * 100 + '%', width: b.sw / b.w * 100 + '%', zIndex: 10 - c,
          transform: c ? `translateY(-${c * 5}%) scale(${1 - c * 0.07})` : '' });
      });
    });
    kit.querySelectorAll('.hs').forEach(el => {
      const b = boxes[+el.dataset.i]; if (!b) return;
      el.style.left = Math.max(1.5, Math.min(94, b.x / W * 100 + Math.min(b.sw, b.w) / W * 100 * 0.12)) + '%';
      el.style.top = Math.max(2, Math.min(90, b.y / H * 100 + b.h / H * 100 * 0.06)) + '%';
    });
    /* keep numbers from sitting on each other: nudge a later one down (then right) until it is clear */
    const pw = kit.clientWidth, ph = kit.clientHeight, placed = [];
    [...kit.querySelectorAll('.hs')].forEach(el => {
      let x = parseFloat(el.style.left) / 100 * pw, y = parseFloat(el.style.top) / 100 * ph;
      const w = el.offsetWidth + 4, h = el.offsetHeight + 4;
      for (let t = 0; t < 8 && placed.some(r => x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y); t++) { if (y + h * 2 < ph) y += h; else x += w; }
      placed.push({ x, y, w, h }); el.style.left = x / pw * 100 + '%'; el.style.top = y / ph * 100 + '%';
    });
  }
  function mountKit(kit, s, opt = {}) {
    kit.innerHTML = kitHTML(s, opt);
    const run = () => layoutKit(kit, s, opt);
    kit.querySelectorAll('img').forEach(img => {
      const done = () => { if (img.naturalWidth) aspect[img.src] = img.naturalWidth / img.naturalHeight; run(); };
      if (img.complete) done(); else img.addEventListener('load', done, { once: true });
    });
    run();
    if ('ResizeObserver' in window) { const ro = new ResizeObserver(run); ro.observe(kit); kit._ro = ro; }
    return run;
  }

  const total = k => SOL[k].chain.reduce((a, id) => a + P[id].usd, 0);
  window.I9S = { SOL, ORDER, GROUPS, SETUPS, SET, setupsFor, inSetups, solTie, total, bag, mountKit, layoutKit, esc, icon, SH };
})();
