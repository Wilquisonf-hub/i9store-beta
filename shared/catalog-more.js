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
