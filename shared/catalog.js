/* i9Store design directions — real catalog data.
   Names, prices and images read from i9store.com/usa on 23 Nov 2026 (category pages + product page).
   Names are the live listings with Portuguese words put in English for the USA store; model words unchanged.
   Images are the live listing images on i9's storage host. Nothing here is invented. */
window.I9 = (function () {
  const IMG = 'https://storage.centrali9tv.com.br/prod/';
  const P = {
    ls600d:  { brand:'Aputure', name:'LS 600d Pro', sub:'Daylight LED, V-Mount', usd:1417, cat:'Lighting', img:'2026/01/images/original/95831_aputurels600xpr.jpeg', sku:'APD0126A2C', job:'Light the platform' },
    ue20:    { brand:'Panasonic', name:'AW-UE20KP', sub:'4K PTZ camera, 12x zoom, black', usd:1695, cat:'Cameras', img:'2023/08/images/original/53796_8077.png', job:'Capture' },
    rp60:    { brand:'Panasonic', name:'AW-RP60', sub:'Remote camera controller', usd:2995, cat:'Cameras', img:'2020/09/images/original/16960_27687.jpg' },
    atemmls: { brand:'Blackmagic Design', name:'ATEM Micro Live Stream', sub:'Live stream switcher', usd:785, cat:'Studio', img:'2025/02/images/original/76641_1712932237_1823.jpg', job:'Switch and stream' },
    atem1me: { brand:'Blackmagic Design', name:'ATEM 1 M/E Constellation UHD 4K', sub:'Live production switcher', usd:2135, cat:'Studio', img:'2024/11/images/original/71757_77.jpg' },
    ewd:     { brand:'Sennheiser', name:'EW-D 835-S SET', sub:'Digital wireless handheld, MMD 835 capsule, Q1-6: 470–526 MHz', usd:749, cat:'Audio', img:'2024/10/images/original/68079_1652873755_1639.jpg', job:'Mic the pulpit' },
    l12:     { brand:'Zoom', name:'LiveTrak L-12', sub:'12-channel digital mixer and multitrack recorder', usd:649.99, cat:'Audio', img:'2022/05/images/original/33315_a1.jpg', job:'Mix' },
    nova:    { brand:'Aputure', name:'Nova P300c Kit', sub:'RGBWW LED panel with rolling case', usd:1329, cat:'Lighting', img:'2022/04/images/original/32260_aputurenovap300.jpg' },
    solid:   { brand:'Hollyland', name:'Solidcom SE 4S', sub:'Full-duplex wireless intercom', usd:459, cat:'Audio', img:'2024/08/images/original/66370_1.png' },
    cuecore: { brand:'Visual Productions', name:'CueCore3', sub:'Multi-protocol architectural lighting controller', usd:2017.5, cat:'Studio', img:'2025/07/images/original/87504_1683195325_1764.jpg' },
    bm4k:    { brand:'Blackmagic Design', name:'Studio Camera 4K Pro G2', sub:'Studio camera', usd:2135, cat:'Cameras', img:'2023/03/images/original/47692_7939.jpg' },
    va7:     { brand:'Blackmagic Design', name:'Video Assist 7" 12G HDR', sub:'SDI/HDMI recording monitor', usd:985, cat:'Monitoring', img:'2020/09/images/original/19027_30123.jpg' },
    mdr:     { brand:'Sony', name:'MDR-7506', sub:'Studio headphones', usd:113, cat:'Audio', img:'2020/09/images/original/13118_22857.jpg' },
    f22x:    { brand:'Aputure', name:'Amaran F22x', sub:'RGBWW LED panel, V-Mount', usd:700, cat:'Lighting', img:'2023/01/images/original/44875_6394a.jpg' },
    ls60d:   { brand:'Aputure', name:'LS 60d', sub:'Daylight LED', usd:299, cat:'Lighting', img:'2022/04/images/original/32152_a5.jpg' },
    lantern: { brand:'Aputure', name:'Lantern Softbox', sub:'65 cm', usd:89, cat:'Accessories', img:'2020/09/images/original/16255_29219.jpg' },
    f10:     { brand:'Aputure', name:'Fresnel F10', sub:'Fresnel attachment', usd:219, cat:'Accessories', img:'2020/12/images/original/21742_1589383254_1561.jpg' },
    barn:    { brand:'Aputure', name:'Barndoors F10', sub:'For the LS 600d Fresnel', usd:139, cat:'Accessories', img:'2020/12/images/original/21753_1589383914_-i-m.jpg' },
    octa:    { brand:'Aputure', name:'Light OctaDome 120', sub:'Softbox with grid, 47.2"', usd:129, cat:'Accessories', img:'2022/04/images/original/31639_apa0226a30.jpg' },
    dome150: { brand:'Aputure', name:'Light Dome 150', sub:'Softbox', usd:269, cat:'Accessories', img:'2021/08/images/original/27581_1628606748_img_.jpg' },
  };
  for (const k in P) { P[k].id = k; P[k].src = IMG + P[k].img; }
  const usd = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* Cohorts: copy + which real products lead. Chains are suggested starting points, not packages sales has confirmed. */
  const C = {
    church: { noun:'church', picksH:'Picked for churches', label:'Churches', who:'Services, livestream, volunteer crews',
      h:'Sunday, from the stage to the stream.',
      lede:'PTZ cameras, a switcher, wireless handhelds and stage light a volunteer crew can run. Buy a single piece, or send us your room and we’ll quote the whole chain.',
      mode:'both', chain:['ls600d','ue20','ewd','l12','atemmls'], picks:['rp60','atem1me','nova','solid','cuecore','bm4k','va7','mdr'] },
    broadcast: { noun:'broadcast', picksH:'Picked for stations', label:'Broadcast & TV', who:'Stations, studios, master control',
      h:'Studio and field gear, specified to the SKU.',
      lede:'Switchers, studio cameras, monitoring and light with part numbers up front. Quote against your PO, or buy single pieces now.',
      mode:'quote', chain:['nova','bm4k','ewd','va7','atem1me'], picks:['rp60','ue20','cuecore','solid','f22x','ls600d','mdr','l12'] },
    production: { noun:'production', picksH:'Picked for production', label:'Production', who:'Production companies, crews on set',
      h:'Gear that goes out on the next job.',
      lede:'High-output light, monitoring and wireless intercom for crews on location. Buy today, or quote quantities for the whole package.',
      mode:'both', chain:['ls600d','bm4k','solid','va7','atem1me'], picks:['nova','f22x','f10','dome150','barn','lantern','ue20','mdr'] },
    creator: { noun:'creator', picksH:'Picked for creators', label:'Creators', who:'Channels, podcasts, small studios',
      h:'Better picture and sound, this week.',
      lede:'Compact light, mics and recorders that fit a desk or a backpack. One-page checkout, no account needed.',
      mode:'buy', chain:['ls60d','ue20','ewd','l12','atemmls'], picks:['lantern','f22x','mdr','dome150','octa','solid','va7','ls600d'] },
    integrator: { noun:'integrator', picksH:'Picked for integrators', label:'Integrators', who:'Integrators and resellers, project lists',
      h:'Project lists, priced by SKU.',
      lede:'Build a quote list across 140+ brands and send it in one go. A specialist replies with a priced list for the project.',
      mode:'quote', chain:['cuecore','ue20','ewd','l12','atem1me'], picks:['rp60','atemmls','bm4k','va7','solid','nova','ls600d','mdr'] },
  };
  const JOBS = { church:['Light the platform','Capture','Mic the pulpit','Mix','Switch and stream'],
    broadcast:['Key light','Studio camera','Talent audio','Monitor','Switch'],
    production:['Key light','Camera','Crew comms','Monitor','Switch'],
    creator:['Key light','Camera','Mic','Mix','Stream'],
    integrator:['Control','Capture','Wireless','Mix','Switch'] };
  return { P, C, JOBS, usd };
})();
