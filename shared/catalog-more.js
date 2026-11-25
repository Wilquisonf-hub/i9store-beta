/* i9Store design directions — more real listings (extends shared/catalog.js; load after it).
   Read from the public i9store.com/usa category pages on 23 Nov 2026 (audio, cameras, studio, lighting,
   monitoring, tripods subcategories). Names are the live listings with Portuguese words put in English;
   model words unchanged. "sub" only restates what the listing title says. Prices are the listed USD prices.
   Images are each listing's own image on i9's storage host; every one was checked on #FFFFFF (white ground).
   Nothing here is invented. "path" is the listing URL under https://i9store.com/usa/loja/ for checking. */
(function () {
  const I9 = window.I9; if (!I9) return;
  const IMG = 'https://storage.centrali9tv.com.br/prod/';
  const M = {
    sm7b:      { brand:'Shure', name:'SM7B', sub:'Professional vocal microphone for podcast', usd:439, cat:'Audio', img:'2022/11/images/original/41616_1339.jpg', path:'audio/microfones/shure-sm7b-microfone-vocal-profissional-para-podcast/' },
    mv7:       { brand:'Shure', name:'MV7', sub:'Podcast microphone, black', usd:249, cat:'Audio', img:'2023/06/images/original/51671_shuremv7microfo.jpg', path:'audio/microfones/shure-mv7-podcast-microphone-black/' },
    p8:        { brand:'Zoom', name:'PodTrak P8', sub:'Portable multitrack podcast recorder', usd:349, cat:'Audio', img:'2022/05/images/original/33266_a1.jpg', path:'audio/gravadores-pedais-e-mixers-de-audio/zoom-podtrak-p8-gravador-de-podcast-multipista-portatil/' },
    l20r:      { brand:'Zoom', name:'LiveTrak L-20R', sub:'20-channel digital mixer-recorder for stage use', usd:799.99, cat:'Audio', img:'2022/05/images/original/33308_a1.jpg', path:'audio/gravadores-pedais-e-mixers-de-audio/' },
    dm3:       { brand:'Yamaha', name:'DM3', sub:'Digital mixing console', usd:1699.99, cat:'Audio', img:'2024/03/images/original/59969_9700.jpg', path:'audio/gravadores-pedais-e-mixers-de-audio/' },
    dm3d:      { brand:'Yamaha', name:'DM3-D', sub:'Digital mixing console with Dante', usd:2265.99, cat:'Audio', img:'2023/12/images/original/57038_9300.jpg', path:'audio/gravadores-pedais-e-mixers-de-audio/' },
    ewdme3:    { brand:'Sennheiser', name:'EW-D ME3 SET', sub:'Digital wireless cardioid headset microphone system', usd:799, cat:'Audio', img:'2025/04/images/original/79773_1622505308_1639.jpg', path:'audio/microfones/' },
    ewdme4:    { brand:'Sennheiser', name:'EW-D ME4 SET', sub:'Digital wireless cardioid lavalier system, Q1-6', usd:583.86, cat:'Audio', img:'2025/04/images/original/79776_1622505308_1639.jpg', path:'audio/microfones/' },
    ewdpme2:   { brand:'Sennheiser', name:'EW-DP ME 2 SET', sub:'Omni lavalier wireless kit for camera, R4-9: 552–607 MHz', usd:649, cat:'Audio', img:'2023/05/images/original/50334_sennheiserewdpm.jpg', path:'audio/microfones/' },
    ewdxem2:   { brand:'Sennheiser', name:'EW-DX EM 2 DANTE', sub:'Two-channel rack-mount digital receiver with Dante', usd:1499, cat:'Audio', img:'2024/05/images/original/61835_7959.jpg', path:'audio/microfones/' },
    ue50:      { brand:'Panasonic', name:'UE50KPJ', sub:'4K30 SDI/HDMI PTZ camera, 24x optical zoom, black', usd:3299, cat:'Cameras', img:'2022/07/images/original/36132_1639587020_1678.jpg', path:'cameras/ptz-roboticas/' },
    ue80:      { brand:'Panasonic', name:'UE80', sub:'4K60 SDI/HDMI/NDI PTZ camera, 24x optical zoom, black', usd:4999, cat:'Cameras', img:'2022/10/images/original/41061_ue80.jpg', path:'cameras/ptz-roboticas/aw-ue80-4k-professional-ptz-camera/' },
    crn300:    { brand:'Canon', name:'CR-N300', sub:'4K NDI PTZ camera, 20x zoom, satin black', usd:2999, cat:'Cameras', img:'2024/04/images/original/61083_9980.jpg', path:'cameras/ptz-roboticas/' },
    tail2:     { brand:'OBSBOT', name:'Tail 2', sub:'AI-powered PTZR 4K live production camera', usd:1199, cat:'Cameras', img:'2025/08/images/original/88808_4.jpg', path:'cameras/ptz-roboticas/obsbot-tail-2-ai-powered-ptzr-4k-live-production-camera/' },
    r50v:      { brand:'Canon', name:'EOS R50 V', sub:'Mirrorless camera with 14-30 mm f/4-6.3 lens', usd:949, cat:'Cameras', img:'2025/03/images/original/79063_85.jpg', path:'cameras/dslr-mirrorless/' },
    c80:       { brand:'Canon', name:'EOS C80', sub:'Full-frame 6K cinema camera, Canon RF', usd:5849, cat:'Cameras', img:'2024/09/images/original/67016_416.jpg', path:'cameras/cinema/canon-eos-c80-camera-de-cinema-full-frame-6k-canon-rf/' },
    xf605:     { brand:'Canon', name:'XF605', sub:'UHD 4K HDR pro camcorder', usd:5049, cat:'Cameras', img:'2022/02/images/original/30394_canonxf605.jpg', path:'cameras/filmadoras/' },
    ursabg2:   { brand:'Blackmagic Design', name:'URSA Broadcast G2', sub:'Broadcast camera', usd:4925, cat:'Cameras', img:'2022/08/images/original/37608_7158a.jpg', path:'cameras/cinema/' },
    sp150:     { brand:'Scriptpeople', name:'Teleprompter SP150', sub:'With 15" foldable LCD monitor', usd:1449, cat:'Studio', img:'2020/09/images/original/15568_25868.jpg', path:'estudio/teleprompter/' },
    fps170:    { brand:'Telescript', name:'FPS170F-SDI', sub:'Teleprompter with 17" foldable LCD monitor', usd:5795, cat:'Studio', img:'2022/06/images/original/34156_a1.jpg', path:'estudio/teleprompter/' },
    bmenc:     { brand:'Blackmagic Design', name:'Streaming Encoder 4K', sub:'Streaming encoder', usd:785, cat:'Studio', img:'2025/06/images/original/84390_15.jpg', path:'estudio/encoders-e-decoders/' },
    versa:     { brand:'Videon', name:'VersaStreamer 4K', sub:'Streaming encoder, 3G-SDI/HDMI', usd:1995, cat:'Studio', img:'2020/09/images/original/17489_28349.jpg', path:'estudio/encoders-e-decoders/' },
    c16s:      { brand:'Hollyland', name:'Solidcom C1-6S', sub:'Full-duplex wireless DECT intercom, 6 headsets, 1.9 GHz', usd:1183, cat:'Studio', img:'2022/09/images/original/39113_1648701950_1696.jpg', path:'estudio/sistemas-de-intercom/' },
    bolt6:     { brand:'Teradek', name:'Bolt 6 LT 750Q', sub:'Wireless transmitter/receiver kit, 3G-SDI/HDMI', usd:2790, cat:'Monitoring', img:'2024/11/images/original/71904_017.jpg', path:'monitoracao/transmissao-de-video-wireless/' },
    m7pro:     { brand:'Accsoon', name:'CineView M7 Pro', sub:'7" recording monitor with wireless transmitter/receiver', usd:899, cat:'Monitoring', img:'2025/07/images/original/88051_2.jpg', path:'monitoracao/transmissao-de-video-wireless/' },
    videohub:  { brand:'Blackmagic Design', name:'Videohub 20x20 12G', sub:'Zero-latency video router', usd:2769, cat:'Studio', img:'2023/12/images/original/56768_1681464339_1761.jpg', path:'estudio/switchers/' },
    microconv: { brand:'Blackmagic Design', name:'Micro Converter BiDirectional SDI/HDMI 12G', sub:'With power supply', usd:205, cat:'Studio', img:'2025/04/images/original/80277_bm.jpg', path:'estudio/conversores/' },
    m4250:     { brand:'Netgear', name:'AV Line M4250 GSM4212P', sub:'8-port Gigabit managed AV switch with SFP', usd:609.99, cat:'Studio', img:'2024/08/images/original/66399_13.jpg', path:'estudio/switchers/' },
    hyperdeck: { brand:'Blackmagic Design', name:'HyperDeck Studio HD Plus', sub:'Recorder', usd:795, cat:'Audio', img:'2025/05/images/original/82983_17.jpg', path:'audio/gravadores-pedais-e-mixers-de-audio/blackmagic-design-hyperdeck-studio-hd-plus/' },
    a200d:     { brand:'Amaran', name:'200d S', sub:'Daylight COB LED monolight', usd:299, cat:'Lighting', img:'2023/03/images/original/47573_7728.jpg', path:'iluminacao/luzes-de-led/amaran-200d-s-luz-de-led-daylight/' },
    p60c:      { brand:'Aputure', name:'Amaran P60c Kit', sub:'Kit of 3 LED panels', usd:990, cat:'Lighting', img:'2022/04/images/original/31664_amp60cuskit.jpg', path:'iluminacao/luzes-de-led/' },
    pt2c:      { brand:'Amaran', name:'PT2c', sub:'Kit of 2 pixel tubes', usd:598, cat:'Lighting', img:'2023/11/images/original/56133_7735.jpg', path:'iluminacao/luzes-de-led/' },
    ls1200d:   { brand:'Aputure', name:'LS 1200d Pro', sub:'LED light kit', usd:3390, cat:'Lighting', img:'2022/01/images/original/30195_apa0249a25.jpg', path:'iluminacao/luzes-de-led/' },
    sumo19se:  { brand:'Atomos', name:'Sumo 19" SE', sub:'HDR monitor, recorder and switcher', usd:2299, cat:'Monitoring', img:'2023/05/images/original/50148_atomossumo19sem.jpg', path:'monitoracao/monitores/' },
    rs4:       { brand:'DJI', name:'RS 4 Pro', sub:'Gimbal stabilizer, 4.5 kg', usd:869, cat:'Supports', img:'2024/04/images/original/60444_1712652359_1816.jpeg', path:'tripes-e-suportes/gimbals-e-sliders/' },
    f6:        { brand:'Zoom', name:'F6', sub:'Multitrack field recorder', usd:599.99, cat:'Audio', img:'2022/03/images/original/31281_zoomf6.jpg', path:'audio/gravadores-pedais-e-mixers-de-audio/zoom-f6-gravador-de-campo-multitrack/' },
    profile:   { brand:'Sennheiser', name:'Profile Wireless', sub:'Audio system and recorder for camera and smartphone', usd:279, cat:'Audio', img:'2024/10/images/original/69607_1.jpg', path:'audio/microfones/' },
    atemmp:    { brand:'Blackmagic Design', name:'ATEM Mini Pro', sub:'Switcher for 4 HDMI cameras', usd:349, cat:'Studio', img:'2024/11/images/original/69795_12.jpg', path:'estudio/switchers/' },
    atemproiso:{ brand:'Blackmagic Design', name:'ATEM Mini Pro ISO', sub:'HDMI live stream switcher', usd:585, cat:'Studio', img:'2021/07/images/original/26964_blackmagic_desi.jpg', path:'estudio/switchers/' },
    atemxiso:  { brand:'Blackmagic Design', name:'ATEM Mini Extreme ISO G2', sub:'Switcher', usd:2245, cat:'Studio', img:'2025/04/images/original/80675_1743777874_img_.jpg', path:'estudio/switchers/' },
    lslive:    { brand:'Loupedeck', name:'Live S', sub:'Custom console for streaming', usd:179, cat:'Studio', img:'2023/01/images/original/44852_7675c.jpg', path:'estudio/dispositivos-e-controles/' },
    a60x:      { brand:'Amaran', name:'60x S', sub:'Bi-color COB LED monolight', usd:159, cat:'Lighting', img:'2023/11/images/original/56382_7731.jpg', path:'iluminacao/luzes-de-led/' },
    ninja:     { brand:'Atomos', name:'Ninja', sub:'5.2" 4K recording monitor, HDMI', usd:589, cat:'Monitoring', img:'2023/08/images/original/53684_8730a.jpg', path:'monitoracao/monitores/' },
    vptouch:   { brand:'Visual Productions', name:'Wall-Mount Touch Screen', sub:'Lighting controls and DMX', usd:1485, cat:'Lighting', img:'2025/07/images/original/87671_1753440025_1907.jpg', path:'iluminacao/controles-e-dmx/' },
  };
  for (const k in M) { M[k].id = k; M[k].src = IMG + M[k].img; I9.P[k] = M[k]; }
  I9.MORE = Object.keys(M);
})();

/* Room planner additions (direction G planner.html), appended 25 Nov 2026. Same rules as above: live i9store.com/usa
   listings read on 23–25 Nov 2026 from the public category pages (cameras/ptz, cinema, mirrorless, lenses, studio/switchers,
   studio/converters, accessories/cables, tripods, headsets). Raw reads: tmp-g/c-uniq.json, tmp-planner/lens-acc.json,
   tmp-planner/cables.json. Names put in English; model words unchanged; prices are the listed USD prices. */
(function () {
  const I9 = window.I9; if (!I9) return;
  const IMG = 'https://storage.centrali9tv.com.br/prod/';
  const M = {
    ue100:      { brand:'Panasonic', name:'AW-UE100', sub:'4K NDI PTZ camera, 12G-SDI/HDMI, 24x optical zoom, black', usd:6789, cat:'Cameras', img:'2025/03/images/original/78315_1596027060_1579.jpg', path:'cameras/ptz-roboticas/camera-panasonic-4k-ndi-pro-12g-sdihdmi-ptz-com-zoom-optico-de-24x-preta/' },
    ue150:      { brand:'Panasonic', name:'AW-UE150', sub:'UHD 4K PTZ camera, 20x zoom, black', usd:9962, cat:'Cameras', img:'2021/11/images/original/29722_camerapanasonic.jpg', path:'cameras/ptz-roboticas/panasonic-aw-ue150k-camera-ptz-uhd-4k-preta/' },
    crn500:     { brand:'Canon', name:'CR-N500', sub:'Professional 4K NDI PTZ camera, 15x zoom, satin black', usd:5399, cat:'Cameras', img:'2021/11/images/original/29554_1615970799_1630.jpg', path:'cameras/ptz-roboticas/canon-cr-n500-camera-ptz-4k-ndi-com-zoom-15x-preto/' },
    fx30:       { brand:'Sony', name:'FX30', sub:'4K cinema camera, body only (no top handle)', usd:1948, cat:'Cameras', img:'2022/10/images/original/39759_a1.jpg', path:'cameras/cinema/sony-fx30-camera-de-cinema-4k-corpo/' },
    s5iix:      { brand:'Panasonic', name:'Lumix S5 IIX', sub:'Mirrorless camera, body only', usd:2197.99, cat:'Cameras', img:'2024/03/images/original/59357_9617.jpg', path:'cameras/dslr-mirrorless/panasonic-lumix-s5-iix-camera-mirrorless-corpo/' },
    mk1855:     { brand:'Fujinon', name:'MK18-55mm T2.9', sub:'Cine zoom lens, MFT mount', usd:3799, cat:'Lenses', img:'2020/09/images/original/17212_28060.jpg', path:'lentes/mft-mount/fujinon-lente-mk18-55mm-t29-mft-mount/' },
    dg1260:     { brand:'Panasonic', name:'Leica DG Vario-Elmarit 12-60mm f/2.8-4', sub:'ASPH. POWER OIS zoom lens, MFT mount', usd:997.99, cat:'Lenses', img:'2024/10/images/original/68294_713.jpg', path:'lentes/lentes/panasonic-lente-leica-dg-vario-elmarit-12-60mm-f28-4-asph-power-ois/' },
    pz18105:    { brand:'Sony', name:'E PZ 18-105mm f/4 G OSS', sub:'Power zoom lens, Sony E mount', usd:848, cat:'Lenses', img:'2020/09/images/original/18824_29916.jpg', path:'lentes/e-mount/sony-lente-e-pz-18-105mm-f4-g-oss/' },
    mk50135:    { brand:'Fujinon', name:'MK50-135mm T2.9', sub:'Cine zoom lens, Sony E mount', usd:3999, cat:'Lenses', img:'2020/09/images/original/12398_22015.jpg', path:'lentes/e-mount/fujinon-lente-mk50-135mm-t29-sony-e-mount/' },
    s24105:     { brand:'Panasonic', name:'Lumix S 24-105mm f/4 Macro OIS', sub:'Zoom lens, L mount (kit with UV filter)', usd:1297.99, cat:'Lenses', img:'2024/07/images/original/63358_13.jpg', path:'lentes/lentes/panasonic-l-ente-lumix-s-24-105mm-f4-macro-ois-com-kit-de-filtro-uv/' },
    s50:        { brand:'Panasonic', name:'Lumix S 50mm f/1.8', sub:'Prime lens, L mount', usd:447.99, cat:'Lenses', img:'2024/07/images/original/63347_10648.jpg', path:'lentes/lentes/panasonic-lente-lumix-s-50mm-f18-lens/' },
    s85:        { brand:'Panasonic', name:'Lumix S 85mm f/1.8', sub:'Prime lens, L mount', usd:647.99, cat:'Lenses', img:'2024/07/images/original/63351_21.jpg', path:'lentes/lentes/panasonic-lente-lumix-s-85mm-f18/' },
    rf45:       { brand:'Canon', name:'RF 45mm f/1.2 STM', sub:'Prime lens, Canon RF mount', usd:469, cat:'Lenses', img:'2025/11/images/original/93359_4.jpg', path:'lentes/rf-mount/canon-lente-rf-45mm-f12-stm/' },
    atemmini:   { brand:'Blackmagic Design', name:'ATEM Mini', sub:'Switcher for 4 HDMI cameras', usd:295, cat:'Studio', img:'2020/09/images/original/18426_29437.jpg', path:'estudio/switchers/blackmagic-design-atem-mini-switcher-para-4-cameras-hdmi/' },
    atemext:    { brand:'Blackmagic Design', name:'ATEM Mini Extreme', sub:'Switcher', usd:1249, cat:'Studio', img:'2022/02/images/original/30454_blackmagic_desi.jpg', path:'estudio/switchers/blackmagic-design-atem-mini-extreme/' },
    atemsdi:    { brand:'Blackmagic Design', name:'ATEM SDI', sub:'Switcher', usd:389, cat:'Studio', img:'2022/10/images/original/40518_7321.jpg', path:'estudio/switchers/blackmagic-design-atem-sdi-switcher/' },
    atemsdipro: { brand:'Blackmagic Design', name:'ATEM SDI Pro ISO', sub:'Switcher', usd:895, cat:'Studio', img:'2026/01/images/original/96591_blackmagicdesin.jpg', path:'estudio/switchers/blackmagic-design-atem-sdi-pro-iso-switcher/' },
    atemsdix:   { brand:'Blackmagic Design', name:'ATEM SDI Extreme ISO', sub:'Switcher', usd:1715, cat:'Studio', img:'2022/08/images/original/37611_7159a.jpg', path:'estudio/switchers/blackmagic-design-switcher-atem-sdi-extreme-iso/' },
    atem1mehd:  { brand:'Blackmagic Design', name:'ATEM 1 M/E Constellation HD', sub:'Live production switcher, 1 RU', usd:1195, cat:'Studio', img:'2024/11/images/original/71541_blackmagic_desi.jpg', path:'estudio/switchers/blackmagic-design-switcher-de-producao-ao-vivo-atem-1-me-constellation-hd-1-ru/' },
    fiberconv:  { brand:'Blackmagic Design', name:'Mini Converter Optical Fiber 12G-SDI', sub:'SDI to fiber and back', usd:185, cat:'Studio', img:'2020/09/images/original/13232_22971.jpg', path:'estudio/conversores/blackmagic-design-mini-converter-optical-fiber-12g-sdi/' },
    hdmi76:     { brand:'Kondor Blue', name:'Braided HDMI cable, 7.6 m', sub:'Passive copper HDMI', usd:32.99, cat:'Cables', img:'2024/06/images/original/63056_10540.jpg', path:'acessorios/cabos-e-conectores/kondor-cabo-hdmi-trancado-76m-azul/' },
    hdmiaoc10:  { brand:'ZILR', name:'Fiber-optic HDMI cable, 4K, 10 m', sub:'Active optical HDMI with Ethernet', usd:149.99, cat:'Cables', img:'2023/05/images/original/50451_zilrcabohdmidea.jpg', path:'acessorios/cabos-e-conectores/zilr-cabo-hdmi-de-alta-velocidade-de-fibra-optica-com-ethernet-10-metros/' },
    hdmiaoc15:  { brand:'iFootage', name:'8K optical HDMI cable, 15 m', sub:'Active optical HDMI', usd:119, cat:'Cables', img:'2023/09/images/original/54242_photo_20230905_.jpg', path:'acessorios/cabos-e-conectores/ifootage-cabo-hdmi-optico-8k-15m/' },
    sdi2:       { brand:'ZILR', name:'12G-SDI BNC cable, 2 m', sub:'4K BNC to BNC', usd:27.49, cat:'Cables', img:'2023/05/images/original/50396_zilrcabo12gsdib.jpg', path:'acessorios/cabos-e-conectores/zilr-cabo-12g-sdi-bnc-4k-de-2m-de-comprimento/' },
    canare300:  { brand:'Canare', name:'12G-SDI / 4K UHD video coax, 300 m', sub:'Bulk reel, black', usd:981.87, cat:'Cables', img:'2024/10/images/original/68561_1767.jpg', path:'acessorios/cabos-e-conectores/canare-cabo-coaxial-de-video-12g-sdi-4k-uhd-984-black/' },
    belden1855: { brand:'Belden', name:'1855A 6G-SDI Mini-RG59 coax, 1000 ft', sub:'CMR rated, 23 AWG, black', usd:479, cat:'Cables', img:'2022/12/images/original/43166_169494.png', path:'acessorios/cabos-e-conectores/belden-cabo-sdi-1855a-010z1000-cmr-rated-6g-sdi-mini-rg59-digital-coax-video-cable-23-awg-black-1000-foot/' },
    beldenbnc:  { brand:'Belden', name:'6 GHz BNC compression connector, Mini RG59', sub:'Pack of 50, for 1855A', usd:161.5, cat:'Cables', img:'2022/12/images/original/43171_202151.png', path:'acessorios/cabos-e-conectores/belden-1855abhd1-6g-sdi-1-pc-bnc-hd-compression-connector-for-1855a23-awg-rg59-mini-coax-cable-violet-band-50pk/' },
    ad01:       { brand:'SmallRig', name:'AD-01', sub:'Heavy-duty tripod with fluid head', usd:159, cat:'Supports', img:'2023/01/images/original/45602_smallrigad01tri.jpg', path:'tripes-e-suportes/tripe-para-camera/smallrig-ad-01-tripe-resistente-com-cabeca-fluida/' },
    focus12:    { brand:'Cartoni', name:'FOCUS 12 2-St SDS ALU System MS', sub:'Fluid head and two-stage tripod system', usd:2778, cat:'Supports', img:'2023/04/images/original/48929_6640.jpg', path:'tripes-e-suportes/tripe-para-camera/cartoni-focus-12-red-lock-system-100mm-ball/' },
    c1pro8:     { brand:'Hollyland', name:'Solidcom C1 Pro-8S', sub:'Full-duplex ENC wireless intercom, 8 headsets, 1.9 GHz', usd:2549, cat:'Audio', img:'2025/06/images/original/83800_15.jpg', path:'audio/fones-de-ouvido-e-headsets/hollyland-solidcom-c1-pro-8s-full-duplex-enc-wireless-intercom-system-com-8-headsets-19-ghz/' },
    gs108pp:    { brand:'Netgear', name:'GS108PP', sub:'8-port Gigabit PoE+ unmanaged switch', usd:139.99, cat:'Studio', img:'2024/09/images/original/67726_796.jpg', path:'estudio/switchers/netgear-switch-8-portas-gigabit-ethernet-poe-nao-gerenciavel/' },
    gs516up:    { brand:'Netgear', name:'GS516UP', sub:'16-port Gigabit PoE++ unmanaged switch', usd:369.99, cat:'Studio', img:'2024/09/images/original/66868_392b.jpg', path:'estudio/switchers/netgear-switch-nao-gerenciado-compativel-com-gigabit-poe-de-16-portas/' },
  };
  for (const k in M) { M[k].id = k; M[k].src = IMG + M[k].img; I9.P[k] = M[k]; }
  I9.PLANNER_MORE = Object.keys(M);
})();
