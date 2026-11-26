/* i9Store room planner — guided wizard (direction H / version F). Vanilla JS over planner.js.
   Seven steps: 1 what you're making · 2 the room · 3 cameras (type first, then a model per position, from the curated
   store models in shared/planner-cams.js) · 4 budget + what you already have (three priced options + why) · 5 the 2D plan
   (approve) · 6 3D view (planner-3d.js, imported only when the step opens) · 7 list and quote.
   There is one plan. The wizard composes it (I9PLANNER.compose), prices it (evaluate) and loads it (loadPlan); the 2D plan in
   step 5 and the advanced editor are the same SVG and the same state. The wizard's own answers ride in the same #p= hash
   as `z`, so a shared link reopens the same step. Prices only ever come from planner.js's tally(): priced store lines;
   owned lines are $0; "to quote" lines never get a number. Room presets and 3D heights: shared/planner-data.js. */
(function () {
  'use strict';
  const PL = window.I9PLANNER; if (!PL) return;
  const { P, usd } = window.I9;
  const D = window.I9PLAN, R = D.RULES;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r1 = v => Math.round(v * 10) / 10;
  const FT = 3.28084;
  const root = document.documentElement;
  const usd0 = v => '$' + Math.round(v).toLocaleString('en-US');

  /* ======================= words (EN / PT) ======================= */
  const W = {
    kick:['Room planner · Guided','Planejador de sala · Guiado'], toAdv:['Advanced editor','Editor avançado'],
    advK:['Advanced editor','Editor avançado'], advT:['The same plan as the guided steps, with every control.','O mesmo plano dos passos guiados, com todos os controles.'], toWiz:['Back to the guided steps','Voltar aos passos guiados'],
    back:['Back','Voltar'], next:['Next','Avançar'], stepOf:['Step {0} of 8','Passo {0} de 8'],
    st1:['What you’re making','O que vai produzir'], st2:['The room','A sala'], st3:['Cameras','Câmeras'], st4:['Production','Produção'], st5:['Budget','Orçamento'],
    st6:['The plan','O plano'], st7:['3D view','Vista 3D'], st8:['List & quote','Lista e cotação'],
    h1:['What are you making?','O que você vai produzir?'],
    l1:['Pick the closest. It sets a starting room, the people on camera and the gear. You can change all of it.','Escolha o mais próximo. Ele define a sala, as pessoas em cena e os equipamentos iniciais. Tudo pode mudar.'],
    h2:['Tell us about the room.','Conte como é a sala.'],
    l2:['Rough numbers are fine. We place the stage, the people and the control desk for you.','Números aproximados servem. Nós posicionamos o palco, as pessoas e a mesa de controle.'],
    h3:['Choose your cameras.','Escolha suas câmeras.'],
    l3:['Pick the type of camera first, then a model for each position in the room. Every model is a store listing at today’s price.','Escolha primeiro o tipo de câmera, depois um modelo para cada posição da sala. Todo modelo é um produto da loja, com o preço de hoje.'],
    h4:['Record, stream, screens and lights.','Gravação, transmissão, telões e luz.'],
    l4:['Tell us where the picture goes. We pick the switcher, recorder and encoder that do it, draw the signal chain, and add a light plan.','Diga para onde vai a imagem. Escolhemos o switcher, gravador e encoder, desenhamos a cadeia de sinal e somamos um plano de luz.'],
    h5:['Set a budget.','Defina um orçamento.'],
    l5:['Tick what you already own, set a budget, and we price three ways to do it from live store listings, and say which one fits.','Marque o que você já tem, defina um orçamento, e calculamos três formas de montar com os preços da loja, dizendo qual cabe.'],
    haveK:['Already have','Já tenho'], haveL:['Ticked items stay on the plan at $0 and leave the shopping list.','Itens marcados ficam no plano a $0 e saem da lista de compras.'],
    /* step 3: cameras */
    camType:['Camera type','Tipo de câmera'], ourPick:['Our pick for this room','Nossa escolha para esta sala'],
    f_ptz:['PTZ','PTZ'], fb_ptz:['One operator runs several cameras from the desk. Remote, on wall or ceiling mounts.','Um operador comanda várias câmeras da mesa. Remotas, em suporte de parede ou teto.'],
    f_cc:['Camcorder','Filmadora'], fb_cc:['A long built-in zoom. A run-and-gun operator on a tripod.','Zoom longo embutido. Um operador no tripé, pronto para tudo.'],
    f_lens:['Mirrorless / cine','Mirrorless / cinema'], fb_lens:['Shallow depth of field, interchangeable lenses, the cinematic look.','Fundo desfocado, lentes intercambiáveis, o visual de cinema.'],
    f_mix:['Mix','Misto'], fb_mix:['PTZ for the wides, a cine camera for the close-up.','PTZ nos planos abertos, uma câmera de cinema no close.'],
    fromP:['from {0}','a partir de {0}'], famMix:['PTZ + cine','PTZ + cinema'],
    posK:['Positions','Posições'], nCams:['Cameras','Câmeras'], sameAll:['Same model for every position','Mesmo modelo em todas as posições'],
    rl_pulpit:['Pulpit / presenter','Púlpito / apresentador'], rl_wide:['Wide','Plano aberto'], rl_close:['Close-up','Close'], rl_side:['Side angle','Ângulo lateral'], rl_corner:['Corner angle','Ângulo de canto'],
    everyone:['everyone','todos'], haveCam:['I have this camera','Já tenho esta câmera'], youHaveS:['You have this · $0','Você já tem · $0'],
    pickFor:['Choose for CAM {0} · {1}','Escolher para CAM {0} · {1}'], pickAll:['Choose for all {0} positions','Escolher para as {0} posições'],
    useFor:['Use on CAM {0}','Usar na CAM {0}'], useAll:['Use on all {0}','Usar nas {0}'], onCam:['On CAM {0}','Na CAM {0}'], onAll:['On every position','Em todas as posições'],
    cmp:['Compare','Comparar'], cmpH:['Side by side','Lado a lado'], cmpClear:['Clear','Limpar'], cmpMax:['Up to three cameras','Até três câmeras'],
    fltBrand:['Brand','Marca'], fltOut:['Output','Saída'], fltPrice:['Price','Preço'], all:['All','Todas'], any:['Any','Qualquer'],
    p1:['Under $2,500','Até $2.500'], p2:['$2,500–5,000','$2.500–5.000'], p3:['Over $5,000','Acima de $5.000'],
    shown:['{0} of {1} cameras','{0} de {1} câmeras'], noneMatch:['No camera matches these filters.','Nenhuma câmera com esses filtros.'], resetF:['Clear filters','Limpar filtros'],
    tab_all:['All types','Todos os tipos'],
    fx_zoom:['Zoom','Zoom'], fx_sensor:['Sensor','Sensor'], fx_out:['Outputs','Saídas'], fx_max:['Max','Máx.'], fx_ctl:['Control','Controle'], fx_lens:['Lens','Lente'], fx_aov:['Angle','Ângulo'], fx_price:['Price','Preço'], fx_type:['Type','Tipo'], fx_data:['Data','Dados'], fx_ndi:['NDI','NDI'], fx_power:['Power','Energia'],
    lensIncl:['{0} included','{0} incluída'], lensPick:['pick below','escolha abaixo'], lensK:['Lens','Lente'], lensKit:['{0}–{1} mm, included','{0}–{1} mm, incluída'], lensOther:['Other lens · to quote','Outra lente · a cotar'],
    beforeTax:['before sales tax and shipping','antes de sales tax e frete'], verify:['verify','verificar'], verified:['Manufacturer spec page','Página do fabricante'], src:['Source','Fonte'],
    paid:['paid','pago'], none:['—','—'],
    reachFar:['At full zoom it still frames {0} across at {1}: a medium shot, not a close-up. Move it closer or pick a longer lens.','No zoom máximo ainda enquadra {0} em {1}: plano médio, não close. Aproxime ou use lente maior.'],
    reachNarrow:['Widest is {0}°; this shot needs about {1}° to fit everyone. Pick a wider lens or a camera with a wider angle.','O mais aberto é {0}°; este plano precisa de uns {1}° para caber todos. Use lente mais aberta.'],
    reachOk:['Frames {0} across, {1} away','Enquadra {0} de largura, a {1}'],
    sumK:['Your cameras','Suas câmeras'], sCams:['Cameras','Câmeras'], sSw:['Switcher','Switcher'], sSig:['Signal','Sinal'], sAdds:['Adds','Inclui'], sPlan:['Whole plan','Plano inteiro'],
    sCamsV:['lenses included','lentes incluídas'], posAll:['All','Todas'], posSw:['Position','Posição'], sNote:['Live store prices, before sales tax and shipping. Lines to quote are priced by a specialist and come on top.','Preços da loja, antes de sales tax e frete. Linhas a cotar são precificadas por um especialista, à parte.'],
    sWarn:['{0} camera can’t frame its shot from there','{0} câmera não enquadra o plano daí'], sWarnN:['{0} cameras can’t frame their shot from there','{0} câmeras não enquadram o plano daí'],
    a_conv:['{0} × HDMI→SDI converter','{0} × conversor HDMI→SDI'], a_ctl:['PTZ joystick','Joystick PTZ'], a_cage:['{0} × cage','{0} × gaiola'], a_poe:['PoE switch','Switch PoE'], a_enc:['{0} × NDI encoder (to quote)','{0} × encoder NDI (a cotar)'], a_tri:['{0} × tripod','{0} × tripé'], a_brk:['{0} × bracket (to quote)','{0} × suporte (a cotar)'], a_pwr:['{0} × mains power','{0} × energia na tomada'],
    camsSub:['Cameras','Câmeras'], t_c:['Your cameras','Suas câmeras'],
    /* round 4: 3D lights, viewfinders, readouts */
    vfB:['Viewfinder','Visor'], mvB:['Multiview','Multiview'], frB:['Frusta','Campos de visão'], qB:['Quality','Qualidade'], qAuto:['Auto','Auto'], qLow:['Low','Baixa'],
    isoK:['ISO','ISO'], cctK:['Colour','Cor'],
    rdPres:['At the presenter · {0}','No apresentador · {0}'], rdKey:['Key','Principal'], rdRatio:['Key : fill','Principal : preenchimento'], rdCct:['Colour','Cor'], noFill:['no fill light','sem preenchimento'],
    rdExp:['Exposure check · 1/50 s · ISO {0}','Checagem de exposição · 1/50 s · ISO {0}'], rdNeeds:['needs ≈{0} lx, has {1} lx','precisa ≈{0} lx, tem {1} lx'],
    rdOk:['✓ enough light','✓ luz suficiente'], rdLow:['add light or open up','mais luz ou abra o diafragma'], rdAuto:['auto gain · no aperture data','ganho automático · sem dado de abertura'], rdNoT:['no subject in frame','ninguém no quadro'],
    rdPow:['Power','Energia'], rdPowV:['{0} W · {1} A at 120 V','{0} W · {1} A em 120 V'], rdPowN:['Fixture maximum draw from each maker’s page. Plan circuits with your electrician.','Consumo máximo das luzes na página de cada fabricante. Planeje os circuitos com seu eletricista.'],
    rdNote:['Rule of thumb: lux from each maker’s published 1 m figure (standard reflector, no diffusion), inverse-square to each face, times the dimmer; beam spread approx. — verify. Dimmers aim the key at the look (Soft 700 · Standard 1,200 · Bright 2,000 lx), fill at half the key (2:1), back a bit under the key. Exposure E = 250 × N² ÷ (t × ISO). Softboxes cost 1–2 stops: raise the dimmers to match.','Regra prática: lux pelo valor publicado de cada fabricante a 1 m (refletor padrão, sem difusão), inverso do quadrado até cada rosto, vezes o dimmer; abertura do facho aprox. — verificar. Os dimmers levam a principal ao look (Suave 700 · Padrão 1.200 · Forte 2.000 lx), o preenchimento à metade (2:1), o contraluz um pouco abaixo. Exposição E = 250 × N² ÷ (t × ISO). Softboxes custam 1–2 stops: suba os dimmers.'],
    /* auto-dim + Look (owner, 26 Nov 2026: "adjust the brightness … look good and simple for the user") */
    lookK:['Look','Look'], look_soft:['Soft','Suave'], look_std:['Standard','Padrão'], look_tv:['Bright (TV)','Forte (TV)'],
    lookFor:['{0} look','look {0}'], lookHint:['Sets how bright people look on camera; the dimmers follow.','Define o brilho das pessoas na câmera; os dimmers acompanham.'],
    onCam:['Light on camera','Luz na câmera'], lightOn:['Light on {0}:','Luz em {0}:'], the:['the ',''],
    st_ok:['good for camera','boa para a câmera'], st_low:['a bit dark. Needs a brighter light or move it closer.','um pouco escura. Precisa de uma luz mais forte ou mais perto.'],
    st_nokey:['a bit dark. No key light is aimed at them yet.','um pouco escura. Nenhuma luz principal mirada nela ainda.'],
    st_high:['too bright even at the lowest setting. A smaller light would do.','forte demais mesmo no mínimo. Uma luz menor resolve.'],
    st_even:['a little uneven: neighbouring lights overlap. Fine-tune the aim on site.','um pouco desigual: luzes vizinhas se sobrepõem. Ajuste a mira no local.'],
    st_nodata:['no published data, level set on site','sem dado publicado, nível ajustado no local'],
    st_cam:['{0} needs more light at this zoom: raise its ISO or open up.','{0} precisa de mais luz neste zoom: suba o ISO ou abra o diafragma.'],
    dimK:['Dimmer','Dimmer'], dimsK:['Dimmers','Dimmers'], dimsSub:['Set by the plan for the {0} look','Definidos pelo plano para o look {0}'],
    dimShort:['At 100 % it can’t reach the look: needs a brighter light or move it closer.','A 100 % não chega ao look: precisa de uma luz mais forte ou mais perto.'],
    dimAlt:['The {0} would reach it.','A {0} chegaria lá.'], dimTiny:['Would need {0}: a smaller light would do.','Precisaria de {0}: uma luz menor resolve.'],
    dimFull:['100 % · can’t reach','100 % · não chega'],
    noDataSite:['no published data, level set on site','sem dado publicado, nível no local'],
    rdPowSet:['At the set level (approx.) · max {0} W. Fixture draw from each maker’s page; plan circuits with your electrician.','No nível definido (aprox.) · máx. {0} W. Consumo pela página de cada fabricante; planeje os circuitos com seu eletricista.'],
    rdPowNo:['{0} light(s) without published data not counted.','{0} luz(es) sem dado publicado fora da conta.'],
    detK:['Details · lux, ratio, colour, exposure','Detalhes · lux, proporção, cor, exposição'],
    rdFill:['Fill','Preenchimento'], rdBack:['Back','Contraluz'], rdEv:['Exposure value','Valor de exposição'], rdTgt:['Look target (key)','Alvo do look (principal)'],
    rdNone:['No light plan in this room: add one in step 4 to see the lit view and the light readouts.','Sem plano de luz nesta sala: inclua no passo 4 para ver a vista iluminada e as leituras de luz.'],
    /* round 3: production + lighting step */
    q_rec:['Record?','Gravar?'], rec_none:['No','Não'], rec_pgm:['The program','O programa'], rec_iso:['Every camera (ISO)','Cada câmera (ISO)'],
    q_st:['Stream?','Transmitir?'], st_0:['No','Não'], st_1:['1 platform','1 plataforma'], st_2:['2 or more','2 ou mais'],
    q_scr:['Send video to a screen?','Enviar vídeo para um telão?'], scr_none:['No','Não'], scr_led:['LED wall','Painel de LED'], scr_proj:['Projector','Projetor'], scr_overflow:['Overflow room','Sala de apoio'],
    q_feed:['Screen and stream: same cut?','Telão e transmissão: mesmo corte?'], feed_same:['Same cut','Mesmo corte'], feed_aux:['One source on the screen','Uma fonte no telão'], feed_mix:['A different cut','Um corte diferente'],
    fd_same:['The screen shows exactly the stream. Fewest parts.','O telão mostra exatamente a transmissão. Menos peças.'],
    fd_aux:['The screen gets one source (a camera, lyrics, the program) on an aux, not a second mix.','O telão recebe uma fonte (câmera, letras, programa) num aux, não um segundo corte.'],
    fd_mix:['A full second mix for the room: lyrics full-screen in the room, clean cameras on the stream.','Um segundo corte completo: letras em tela cheia na sala, câmeras limpas na transmissão.'],
    q_gfx:['Graphics and lyrics','Gráficos e letras'], gfx_none:['None','Nenhum'], gfx_lower:['Lower thirds','Créditos'], gfx_lyrics:['Lyrics','Letras'],
    gfxNote:['Lyrics run on a computer into the switcher. ProPresenter is common but not on the store.','Letras rodam num computador ligado ao switcher. ProPresenter é comum, mas não está na loja.'],
    q_how:['Switch on','Cortar em'], how_hw:['A hardware switcher','Um switcher físico'], how_pc:['A computer (vMix / OBS)','Um computador (vMix / OBS)'],
    q_lvl:['Level','Nível'], lvl_s:['Starter','Inicial'], lvl_m:['Standard','Padrão'], lvl_p:['Pro','Pro'],
    chainK:['Signal chain','Cadeia de sinal'], chCams:['Cameras','Câmeras'], chWl:['{0} wireless','{0} sem fio'], chOut:['Outputs','Saídas'],
    o_stream:['Stream','Transmissão'], o_screen:['Screen','Telão'], o_rec:['Record','Gravação'], o_over:['Overflow room','Sala de apoio'],
    cut_pgm:['Program','Programa'], cut_aux:['Aux · one source','Aux · uma fonte'], cut_mix:['M/E 2 · its own cut','M/E 2 · corte próprio'], cut_mix2:['Mix 2 · its own cut','Mix 2 · corte próprio'], cut_iso:['Program + every camera','Programa + cada câmera'], cut_dests:['{0} platforms','{0} plataformas'],
    viaEnc:['via {0}','via {0}'], viaRec:['on {0}','em {0}'], builtIn:['built in','embutido'],
    lightK:['Lights & control','Luz e controle'], q_lights:['Do you need lighting too?','Precisa de iluminação também?'], yesLights:['Yes, include lighting','Sim, incluir iluminação'], noLights:['No, we have lights','Não, já temos luz'], unsureLights:['Not sure, suggest later','Não sei, sugiram depois'],
    q_ctl:['Who runs the lights?','Quem opera a luz?'], ctl_app:['The maker’s app','O app do fabricante'], ctl_dmx:['Scenes on DMX (wired)','Cenas em DMX (cabo)'], ctl_crmx:['Scenes on wireless DMX','Cenas em DMX sem fio'],
    q_panel:['A one-touch panel for the pastor / host','Painel de um toque para o pastor / apresentador'], q_relay:['An ON AIR sign','Placa ON AIR'],
    panelNote:['KioscTouch2 wall screen (or the Kiosc app on your iPad) → CueCore3 → the lights. Scenes: Worship · Preaching · Baptism · House lights.','Tela de parede KioscTouch2 (ou o app Kiosc no seu iPad) → CueCore3 → as luzes. Cenas: Louvor · Pregação · Batismo · Luz da casa.'],
    panelNoteP:['KioscTouch2 (or the Kiosc app) → CueCore3: an “On air” scene; the relay switches a mains ON AIR sign.','KioscTouch2 (ou o app Kiosc) → CueCore3: cena “No ar”; o relé liga uma placa ON AIR.'],
    noArt:['Scenes leave the CueCore3 on its DMX ports; a fixture needs DMX to be in the scenes.','As cenas saem da CueCore3 pelas portas DMX; a luz precisa de DMX para entrar nas cenas.'],
    roll_cam:['Cameras','Câmeras'], roll_prod:['Production','Produção'], roll_lit:['Lighting & control','Luz e controle'], roll_cab:['Cables & mounts','Cabos e suportes'], rollQ:['{0} to quote','{0} a cotar'],
    mob:['Mobile / handheld','Móvel / na mão'], mobNote:['Wireless link to the switcher','Link sem fio até o switcher'], oneCtl:['One controller runs all {0} cameras','Um controlador comanda as {0} câmeras'],
    whyK:['Why this switcher','Por que este switcher'],
    q_cctl:['Canon controller','Controlador Canon'], cctl_auto:['Auto','Auto'], cctl_300:['RC-IP300','RC-IP300'], cctl_1000:['RC-IP1000','RC-IP1000'],
    cctlNote:['Auto: the RC-IP300 (to quote, being added to the store) up to 4 cameras, the RC-IP1000 above.','Auto: RC-IP300 (a cotar, entrando na loja) até 4 câmeras, RC-IP1000 acima.'],
    q_pnl:['A hardware control panel','Um painel de controle físico'], pnl_none:['No','Não'], pnl_yes:['Yes','Sim'], pnlNote:['ATEM Micro Panel on the small ATEMs, an Advanced Panel on a Constellation. A control surface, never the switcher.','ATEM Micro Panel nos ATEM pequenos, um Advanced Panel no Constellation. Uma superfície de controle, nunca o switcher.'],
    q_ctrl:['Scene controller','Controlador de cenas'], ctrl_vp:['CueCore3 (Visual Productions)','CueCore3 (Visual Productions)'], ctrl_splay:['S-PLAY MINI (ENTTEC), small rooms','S-PLAY MINI (ENTTEC), salas pequenas'],
    q_ptype:['Panel','Painel'], ptype_kiosc:['KioscTouch2 wall screen','Tela de parede KioscTouch2'], ptype_ipad:['Kiosc app on your iPad','App Kiosc no seu iPad'], ptype_bstation:['B-Station2 buttons','Botões B-Station2'],
    roll_svc:['Services · i9TV','Serviços · i9TV'],
    howNote:['vMix is bought by the customer from vMix (i9 doesn’t sell it); OBS Studio is free. A hardware switcher is our first choice when it does the job.','O vMix é comprado pelo cliente na vMix (a i9 não vende); o OBS Studio é gratuito. Um switcher físico é nossa primeira escolha quando atende.'],
    lensStd:['Lens','Lente'], lensLong:['Long reach','Longo alcance'], extAdd:['+ {0}','+ {0}'], cropAdd:['{0} ×{1}','{0} ×{1}'],
    effTxt:['{0} effective','{0} efetivo'], dimTip:['Rule of thumb: past about f/8 a dim room needs more light or a higher ISO.','Regra prática: acima de f/8 uma sala escura pede mais luz ou ISO mais alto.'],
    adaptTip:['PL lens: needs the {0} (in the parts list) and the body’s Super 35 crop or the lens’s built-in 1.5× extender. {1} kg: heavy support to quote.','Lente PL: precisa do {0} (na lista) e do crop Super 35 do corpo ou do extensor 1,5× da lente. {1} kg: suporte reforçado a cotar.'],
    fixIt:['Use {0}','Usar {0}'], fixReach:['reaches {0}','alcança {0}'], builtinExt:['built-in 1.5×','1,5× embutido'],
    h6:['Here’s your plan.','Este é o seu plano.'],
    l6:['Drag a camera to move it, drag its dot to aim. When it looks right, approve it.','Arraste uma câmera para mover, arraste o ponto para mirar. Quando estiver certo, aprove.'],
    h7:['See it in 3D.','Veja em 3D.'],
    l7:['A simple model of the approved plan. Orbit and zoom, or look through each camera.','Um modelo simples do plano aprovado. Gire e aproxime, ou olhe por cada câmera.'],
    h8:['Your equipment list.','Sua lista de equipamentos.'],
    l8:['Everything the plan needs, grouped. What you have is at $0; lines to quote are priced by a specialist.','Tudo o que o plano precisa, em grupos. O que você tem fica a $0; as linhas a cotar são precificadas por um especialista.'],
    /* step 1 */
    k_church:['Church service','Culto na igreja'], kd_church:['Services streamed and on the screens, run by volunteers.','Cultos transmitidos e nos telões, operados por voluntários.'],
    k_podcast:['Podcast','Podcast'], kd_podcast:['Two to four people at a table, on video.','De duas a quatro pessoas à mesa, em vídeo.'],
    k_studio:['Studio / broadcast','Estúdio / TV'], kd_studio:['A desk and a set: news or a talk show, with operators.','Bancada e cenário: jornal ou programa, com operadores.'],
    k_event:['Live event','Evento ao vivo'], kd_event:['A stage, a crowd and long cable runs.','Palco, público e cabos longos.'],
    k_school:['School / auditorium','Escola / auditório'], kd_school:['Classes, assemblies and graduations.','Aulas, assembleias e formaturas.'],
    k_corp:['Corporate','Corporativo'], kd_corp:['Town halls, webinars and meeting-room shows.','Reuniões gerais, webinars e transmissões na sala de reunião.'],
    /* step 2 */
    size:['Room size','Tamanho da sala'], custom:['Custom','Personalizado'], wxd:['width × depth','largura × profundidade'],
    rp_church_s:['Chapel','Capela'], rp_church_m:['Sanctuary','Templo'], rp_church_l:['Large sanctuary','Templo grande'],
    rp_podcast_s:['Small room','Sala pequena'], rp_podcast_m:['Studio room','Sala de estúdio'], rp_podcast_l:['Large room','Sala grande'],
    rp_studio_s:['Small set','Cenário pequeno'], rp_studio_m:['Studio','Estúdio'], rp_studio_l:['Large studio','Estúdio grande'],
    rp_event_s:['Ballroom','Salão'], rp_event_m:['Hall','Pavilhão'], rp_event_l:['Large hall','Pavilhão grande'],
    rp_school_s:['Classroom','Sala de aula'], rp_school_m:['Auditorium','Auditório'], rp_school_l:['Gym','Ginásio'],
    rp_corp_s:['Meeting room','Sala de reunião'], rp_corp_m:['Studio room','Sala de estúdio'], rp_corp_l:['Town hall','Auditório interno'],
    front:['The stage is on','O palco fica na'], frShort:['A short wall','Parede menor'], frLong:['A long wall','Parede maior'],
    people:['People on camera','Pessoas em cena'], peopleHint:['Who speaks, sings or presents. Not the audience.','Quem fala, canta ou apresenta. Não a plateia.'],
    aud:['An audience in the room?','Tem público na sala?'], yes:['Yes','Sim'], no:['No','Não'],
    ctrl:['Where will the control desk be?','Onde fica a mesa de controle?'],
    cd_near:['Near the stage','Perto do palco'], cdd_near:['A few metres away','A poucos metros'],
    cd_back:['At the back of the room','No fundo da sala'], cdd_back:['Behind the audience','Atrás do público'],
    cd_booth:['In a booth or next room','Em cabine ou outra sala'], cdd_booth:['About 10 m more cable','Cerca de 10 m a mais de cabo'],
    preview:['Top view','Vista de cima'], previewNote:['Starting layout. You can move everything in step 5.','Layout inicial. Tudo pode ser movido no passo 5.'],
    /* step 3 */
    o_cam:['Cameras','Câmeras'], od_cam:['Any you already use. We plan around them.','As que você já usa. Planejamos em volta delas.'],
    oc_none:['None','Nenhuma'], oc_ptz:['PTZ (robotic)','PTZ (robótica)'], oc_cc:['Camcorder','Filmadora'], oc_lens:['Mirrorless / cinema','Mirrorless / cinema'], howMany:['How many','Quantas'],
    o_sw:['Video switcher','Switcher de vídeo'], od_sw:['ATEM or similar: the box that cuts between cameras.','ATEM ou similar: o aparelho que corta entre câmeras.'],
    o_pc:['A computer for streaming','Um computador para transmitir'], od_pc:['Streams, runs slides or lyrics.','Transmite, roda slides ou letras.'],
    o_aud:['Microphones and a sound desk','Microfones e mesa de som'], od_aud:['Mics for the people on camera, and a mixer.','Microfones para quem está em cena e um mixer.'],
    o_lit:['Lights','Iluminação'], od_lit:['Video lights, not just the room’s.','Luzes de vídeo, não só as da sala.'],
    o_net:['Network / PoE switch','Rede / switch PoE'], od_net:['Powers network cameras over one cable.','Alimenta câmeras de rede por um só cabo.'],
    o_tri:['Tripods','Tripés'], od_tri:['Sturdy ones with a fluid head.','Firmes, com cabeça fluida.'],
    o_cab:['Cables','Cabos'], od_cab:['Enough of the right type and length.','Suficientes, do tipo e comprimento certos.'],
    hnote:['Not sure? Leave it unticked. A specialist checks what you have before anything is ordered.','Na dúvida, deixe desmarcado. Um especialista confere o que você tem antes de qualquer pedido.'],
    swNdi:['NDI switching','Corte NDI'], swBig:['Larger switcher','Switcher maior'],
    ownNote:['Owned cameras keep the angles of the closest model we list; check yours before relying on the framing.','Câmeras próprias usam os ângulos do modelo mais próximo da loja; confira antes de confiar no enquadramento.'],
    /* step 4 */
    budget:['Your budget','Seu orçamento'], upTo:['Up to','Até'], noBudgetSet:['Not sure yet','Ainda não sei'],
    b1:['Under $5k','Até $5 mil'], b2:['$5–15k','$5–15 mil'], b3:['$15–40k','$15–40 mil'], b4:['$40k+','$40 mil+'],
    t_e:['Essential','Essencial'], t_r:['Recommended','Recomendado'], t_p:['Pro','Pro'], t_s:['From the setup','Do setup'],
    pick:['Our pick','Nossa escolha'], chosen:['Chosen','Escolhido'], choose:['Choose','Escolher'],
    fits:['Fits · {0} left','Cabe · sobram {0}'], over:['Over by {0}','Passa {0}'], noBudget:['No budget set','Sem orçamento definido'],
    plusQuote:['+ {0} to quote','+ {0} a cotar'], plusQuote1:['+ 1 to quote','+ 1 a cotar'], youHaveN:['{0} you have, at $0','{0} que você tem, a $0'],
    priced:['Subtotal (before tax and shipping)','Subtotal (antes de sales tax e frete)'],
    recFor:['For your budget','Para o seu orçamento'], recNo:['Without a budget','Sem orçamento'],
    allOver:['Even Essential is over by {0}. Tick what you already have, or talk to a specialist about a smaller first step.','Mesmo o Essencial passa {0}. Marque o que você já tem, ou fale com um especialista sobre um primeiro passo menor.'],
    footP:['Totals add up priced store lines only. Lines “to quote” (brackets, cable by the metre, NDI software) are priced by a specialist and come on top. Sales tax and shipping are calculated at checkout. No price here is invented.','Os totais somam só itens da loja com preço. Linhas “a cotar” (suportes, cabo por metro, software NDI) são precificadas por um especialista e vêm à parte. Nenhum preço aqui é inventado.'],
    redraw:['Choosing another option redraws the plan.','Escolher outra opção redesenha o plano.'],
    camN:['{0} camera','{0} câmera'], camsN:['{0} cameras','{0} câmeras'],
    kn_ptz:['PTZ','PTZ'], kn_studio:['studio','de estúdio'], kn_cine:['cinema','cinema'], kn_cc:['camcorder','filmadora'],
    on:['on','em'], lng:['Longest cable','Maior cabo'], sw:['Switcher','Switcher'], swQuote:['to quote','a cotar'],
    why_hdmi:['HDMI: every camera is within {0} of the desk, so plain HDMI cables do the job. The cheapest, simplest way in.','HDMI: toda câmera está a até {0} da mesa, então cabos HDMI comuns resolvem. O jeito mais barato e simples.'],
    why_hdmiAoc:['HDMI: the longest run is {0}, so that camera gets an active optical HDMI cable. Still the simplest way in.','HDMI: o maior cabo tem {0}, então essa câmera leva um cabo HDMI óptico ativo. Ainda o jeito mais simples.'],
    why_sdi:['SDI: the longest run is {0}. SDI’s locking cables carry the picture up to 100 m; it’s the broadcast default for reliability.','SDI: o maior cabo tem {0}. O SDI, com conector de trava, leva a imagem até 100 m; é o padrão de TV pela confiabilidade.'],
    why_sdiForced:['SDI, not HDMI: the longest run is {0}, past the 15 m HDMI can carry. SDI’s locking cables go up to 100 m.','SDI, não HDMI: o maior cabo tem {0}, além dos 15 m que o HDMI aguenta. O SDI, com trava, vai até 100 m.'],
    why_ip:['IP / NDI: one network cable per camera carries picture, control and power (PoE). The fewest cables across a big room, and one person steers every camera.','IP / NDI: um cabo de rede por câmera leva imagem, controle e energia (PoE). Menos cabos numa sala grande, e uma pessoa comanda todas as câmeras.'],
    why_ptz:['PTZ (robotic) cameras: one volunteer moves and zooms them all from the desk.','Câmeras PTZ (robóticas): um voluntário move e dá zoom em todas, da mesa.'],
    why_studio:['Studio cameras with zoom lenses: an operator on each, the most control over the picture.','Câmeras de estúdio com lente zoom: um operador em cada, o maior controle da imagem.'],
    why_cine:['Cinema-style cameras: interchangeable lenses and soft backgrounds, the cinematic look.','Câmeras estilo cinema: lentes intercambiáveis e fundo desfocado, o visual de cinema.'],
    why_cc:['Camcorders: a long built-in zoom, one operator each.','Filmadoras: zoom longo embutido, um operador em cada.'],
    why_own:['Your own {0} cameras are in the plan at $0.','Suas {0} câmeras entram no plano a $0.'], why_own1:['Your own camera is in the plan at $0.','Sua câmera entra no plano a $0.'],
    /* step 5 */
    yourPlan:['Your plan','Seu plano'], camsK:['Cameras','Câmeras'], toKnow:['Good to know','Bom saber'], allFits:['Nothing blocking. Cable lengths and power fit.','Nada bloqueando. Cabos e energia dentro do limite.'],
    approve:['Approve this plan','Aprovar este plano'], approved:['Approved','Aprovado'], changedSince:['Changed since you approved it','Alterado desde a aprovação'],
    fineTune:['Fine-tune in the advanced editor','Ajustar no editor avançado'], dragHint:['Drag a camera to move it · drag its orange dot to aim','Arraste a câmera para mover · arraste o ponto laranja para mirar'],
    youHave:['You have this','Você já tem'], approveNext:['Approve plan','Aprovar plano'], fromSetup:['From the setup','Do setup'],
    /* step 6 */
    overview:['Overview','Visão geral'], reset:['Reset view','Recentralizar'], pov:['Looking through','Olhando por'],
    g3dNote:['Massing model: heights are typical values (tripod 1.5 m, wall 2.6 m), not measured. Lights are suggested positions.','Modelo de volumes: alturas são valores típicos (tripé 1,5 m, parede 2,6 m), não medidos. Luzes em posições sugeridas.'],
    g3dHint:['Drag to orbit · scroll or pinch to zoom','Arraste para girar · role ou pince para zoom'],
    noGL:['The 3D view needs WebGL, which this browser has turned off.','A vista 3D precisa de WebGL, que este navegador desativou.'],
    noGLload:['The 3D view couldn’t load (it needs an internet connection the first time).','A vista 3D não carregou (precisa de internet na primeira vez).'],
    noGLp:['Your plan is unchanged. The 2D plan and the list are complete without it.','Seu plano não mudou. O plano 2D e a lista estão completos sem ela.'],
    loading3d:['Building the room…','Montando a sala…'], toList:['See the list','Ver a lista'],
    /* step 7 */
    bBudget:['Budget','Orçamento'], bTotal:['Subtotal, before tax + shipping','Subtotal, sem sales tax + frete'], bQuote:['To quote','A cotar'], bHave:['You have','Você já tem'],
    bQuoteN:['{0} lines, on top','{0} linhas, à parte'], bHaveN:['{0} items, not counted','{0} itens, não somados'], setBudget:['Set a budget','Definir orçamento'],
    bOver:['{0} over budget','{0} acima do orçamento'], bLeft:['{0} left in the budget','sobram {0} no orçamento'], reqQuote:['Request a quote','Pedir cotação'],
    sumPlan:['{0} · {1} to quote','{0} · {1} a cotar'],
  };
  const t = (k, ...a) => { const w = W[k]; let s = w ? w[PL.lang === 'pt' ? 1 : 0] : PL.t(k, ...a); a.forEach((v, i) => { s = s.split('{' + i + '}').join(v); }); return s; };

  /* ======================= kinds, layouts, recipes ======================= */
  /* Kind -> style template (audio, lights, labels in planner.js), layout family, defaults, photo (i9's own, shared/). */
  const KINDS = {
    church:  { tpl:'church', lay:'stage', n:3, au:1, img:'../shared/igreja.webp', names:['p_pastor', 'p_worship', 'p_music'], pulpit:true },
    podcast: { tpl:'podcast', lay:'table', n:2, au:0, img:'../shared/sol-corporate-studio.webp', names:['p_host', 'p_guest', 'p_cohost'] },
    studio:  { tpl:'studio', lay:'desk', n:2, au:0, img:'../shared/sol-broadcast-record-manaus-control.webp', names:['p_anchorA', 'p_anchorB'], set:true },
    event:   { tpl:'event', lay:'stage', n:2, au:1, img:'../shared/sol-events-finday-camera.webp', names:['p_speaker', 'p_presenter'], pulpit:true },
    school:  { tpl:'event', tplSmall:'empty', lay:'stage', n:1, au:1, img:'../shared/auditorio.webp', names:['p_presenter', 'p_speaker'], pulpit:true },
    corp:    { tpl:'studio', lay:'desk', n:2, au:0, rp:'s', img:'../shared/sol-podcast-studio-set.webp', names:['p_presenter', 'p_guest'] },
  };
  const KORDER = ['church', 'podcast', 'studio', 'event', 'school', 'corp'];
  /* Three ways to do it per kind: the i9 team's starting picks from the store (planning choices, not data). The planner then
     sizes every cable, switcher, PoE budget and mount from the plan, and prices the result from live listings.
     HDMI recipes move to SDI by themselves when a run passes 15 m. */
  const C = (k, m, o = {}) => ({ k, m, ...o });
  const RECIPES = {
    church:  { e:{ tr:'sdi', cams:[C('ptz', 'ue20'), C('ptz', 'ue20')] },
               r:{ tr:'ip', cams:[C('ptz', 'crn300'), C('ptz', 'crn300'), C('ptz', 'crn300')] },
               p:{ tr:'ip', cams:[C('ptz', 'ue80'), C('ptz', 'ue80'), C('ptz', 'ue80'), C('ptz', 'ue80')] } },
    podcast: { e:{ tr:'hdmi', cams:[C('lens', 'r50v', { lens:'kit', man:false }), C('ptz', 'tail2')] },
               r:{ tr:'hdmi', cams:[C('lens', 'r50v', { lens:'kit', man:false }), C('ptz', 'tail2'), C('ptz', 'tail2')] },
               p:{ tr:'hdmi', cams:[C('lens', 'fx30', { lens:'pz18105', man:false }), C('lens', 'fx30', { lens:'pz18105', man:false }), C('lens', 'fx30', { lens:'pz18105', man:false })] } },
    studio:  { e:{ tr:'sdi', cams:[C('ptz', 'ue20'), C('ptz', 'ue20')] },
               r:{ tr:'sdi', cams:[C('lens', 'bm4k', { lens:'dg1260' }), C('lens', 'bm4k', { lens:'dg1260' }), C('lens', 'bm4k', { lens:'dg1260' })] },
               p:{ tr:'sdi', cams:[C('lens', 'bm4k', { lens:'mk1855' }), C('lens', 'bm4k', { lens:'mk1855' }), C('lens', 'bm4k', { lens:'mk1855' }), C('ptz', 'ue80')] } },
    event:   { e:{ tr:'sdi', cams:[C('ptz', 'ue20'), C('ptz', 'ue20')] },
               r:{ tr:'sdi', cams:[C('ptz', 'ue80'), C('cc', 'xf605'), C('cc', 'xf605')] },
               p:{ tr:'sdi', cams:[C('ptz', 'ue100'), C('cc', 'xf605'), C('cc', 'xf605'), C('ptz', 'ue80')] } },
    school:  { e:{ tr:'hdmi', cams:[C('ptz', 'ue20')] },
               r:{ tr:'hdmi', cams:[C('ptz', 'ue20'), C('ptz', 'ue20')] },
               p:{ tr:'ip', cams:[C('ptz', 'crn300'), C('ptz', 'crn300'), C('ptz', 'crn300')] } },
    corp:    { e:{ tr:'hdmi', cams:[C('ptz', 'tail2'), C('ptz', 'tail2')] },
               r:{ tr:'hdmi', cams:[C('ptz', 'ue20'), C('ptz', 'ue20'), C('ptz', 'ue20')] },
               p:{ tr:'ip', cams:[C('ptz', 'ue80'), C('ptz', 'ue80'), C('ptz', 'ue80')] } },
  };
  const TIERS = ['e', 'r', 'p'];
  const OWN = ['sw', 'pc', 'aud', 'lit', 'net', 'tri', 'cab'];
  const BUDGETS = [2000, 3000, 4000, 5000, 6000, 8000, 10000, 12500, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000];
  const SETUP_KIND = { church:'church', podcast:'podcast', broadcast:'studio', events:'event', corporate:'corp', education:'school', creator:'podcast', production:'studio', integrator:'event' };
  const TPL_KIND = { church:'church', podcast:'podcast', studio:'studio', event:'event', empty:'corp' };
  /* #tpl=<word> links (guides, product pages) open the guided steps on that kind */
  const HASH_KIND = { church:'church', podcast:'podcast', studio:'studio', event:'event', events:'event', corporate:'corp', corp:'corp', broadcast:'studio', education:'school', school:'school', empty:'corp' };
  const kindFromHash = h => { const m = /^#(?:tpl|for)=?-?([\w-]+)/.exec(h || ''); return m && !/&v=a/.test(h) ? HASH_KIND[m[1]] || null : null; };

  /* ----- cameras (step 3): families, the curated store models, recipes per family ----- */
  const FAMS = ['ptz', 'cc', 'lens', 'mix'];
  /* round 3: production + light defaults per kind (planning starting points; the customer changes them in step 4) */
  const PRDEF = k => ({ church:{ rec:'pgm', st:1, scr:'led', feed:'same', gfx:'lyrics', how:'hw', lvl:'m' }, podcast:{ rec:'iso', st:1, scr:'none', feed:'same', gfx:'lower', how:'hw', lvl:'m' },
    studio:{ rec:'pgm', st:1, scr:'none', feed:'same', gfx:'lower', how:'hw', lvl:'m' }, event:{ rec:'pgm', st:1, scr:'led', feed:'aux', gfx:'lower', how:'hw', lvl:'m' },
    school:{ rec:'pgm', st:1, scr:'proj', feed:'same', gfx:'none', how:'hw', lvl:'s' }, corp:{ rec:'pgm', st:1, scr:'none', feed:'same', gfx:'lower', how:'hw', lvl:'m' } }[k] || { rec:'pgm', st:1, scr:'none', feed:'same', gfx:'none', how:'hw', lvl:'m' });
  const LTDEF = k => ({ on:1, ctl:'app', panel:0, relay:0, look:'std' });
  const prOf = z => z.pr || PRDEF(z.k), ltOf = z => z.lt || LTDEF(z.k);
  /* the family each kind's own recipes already use (those recipes stay the starting picks for that family) */
  const FAMDEF = { church:'ptz', podcast:'mix', studio:'mix', event:'mix', school:'ptz', corp:'ptz' };
  const CAMS = (D.CAMS || []).filter(c => P[c.id]);
  const CAMBY = {}; CAMS.forEach(c => { CAMBY[c.id] = c; });
  const kOf = m => D.PTZ[m] ? 'ptz' : D.CAMCORDER[m] ? 'cc' : 'lens';
  const famOfM = m => (CAMBY[m] && CAMBY[m].fam) || kOf(m);
  const specOf = m => D.PTZ[m] || D.CAMCORDER[m] || D.BODIES[m] || {};
  const famOf = z => z.fam || FAMDEF[z.k] || 'ptz';
  /* Three starting picks per family (i9 planning choices from the curated store models, not data). Short-run rooms
     (podcast, corporate) start on HDMI; the rest on SDI or IP. In Mix, the first position is the cine camera and the
     rest are PTZ. HDMI moves to SDI by itself when a run passes 15 m. */
  function frec(k, fam, tier) {
    const sm = k === 'podcast' || k === 'corp', h = sm ? 'hdmi' : 'sdi';
    const T = {
      ptz:  sm ? { e:['hdmi', ['tail2']], r:['hdmi', ['ue20']], p:['ip', ['ue80']] } : { e:['sdi', ['ue20']], r:['ip', ['crn300']], p:['ip', ['ue80']] },
      cc:   { e:[h, ['pxw-z90']], r:[h, ['xf605']], p:[h, ['ag-cx350']] },
      lens: k === 'studio' ? { e:['sdi', ['bm4k']], r:['sdi', ['bmstudio6k']], p:['sdi', ['c80']] }
          : sm ? { e:['hdmi', ['r50v']], r:['hdmi', ['canon-r6v']], p:['hdmi', ['canon-c50']] } : { e:['sdi', ['canon-r6v']], r:['sdi', ['canon-c50']], p:['sdi', ['c80']] },
      mix:  sm ? { e:['hdmi', ['r50v', 'tail2']], r:['hdmi', ['canon-r6v', 'ue20']], p:['hdmi', ['canon-c50', 'ue20']] } : { e:['sdi', ['r50v', 'ue20']], r:['sdi', ['canon-c50', 'ue50']], p:['sdi', ['c80', 'ue80']] },
    }[fam][tier];
    return { tr:T[0], ms:T[1].filter(m => P[m]) };
  }
  /* the camera lineup a tier proposes for the current answers: [{ k, m, lens, man }] */
  function lineupTier(z, tier) {
    const base = RECIPES[z.k][tier], fam = famOf(z), n = z.cn || base.cams.length;
    if (fam === FAMDEF[z.k]) return { tr:base.tr, cams:Array.from({ length:n }, (_, i) => ({ ...base.cams[Math.min(i, base.cams.length - 1)] })) };
    const f = frec(z.k, fam, tier);
    return { tr:f.tr, cams:Array.from({ length:n }, (_, i) => { const m = f.ms[Math.min(i, f.ms.length - 1)]; return { k:kOf(m), m, lens:null }; }) };
  }
  /* the customer's own lineup: the transport of our "recommended" pick, moved off IP when a camera has no NDI */
  function lineupCustom(z) {
    const base = lineupTier(z, 'r');
    const cams = z.cl.map(c => ({ k:kOf(c.m), m:c.m, lens:c.lens || null, own:!!c.own, ext:c.ext || null, crop:!!c.crop, mob:!!c.mob }));
    const tr = base.tr === 'ip' && cams.some(c => !specOf(c.m).ndi) ? 'sdi' : base.tr;
    return { tr, cams };
  }
  const manFor = (z, k) => k !== 'ptz' && z.k !== 'podcast';

  /* geometry for a position: where the camera stands, the shot it is there for, the angle it needs */
  const slotOf = (L, i, n) => n === 1 ? { ...L.slots[0], aim:'all', shot:'wide' } : L.slots[i];
  function camAt(L, s, k) {
    let { x, y } = s;
    if (k !== 'ptz' && s.near) ({ x, y } = s.near);   /* a manned camera stands mid-aisle, not on the back wall */
    if (k !== 'ptz' && s.mnt === 'wall') x = x < L.w / 2 ? x + 0.8 : x - 0.8;
    return { x, y };
  }
  function need(L, s, at) {
    const ppl = L.ppl; if (!ppl.length) return null;
    const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
    if (s.aim === 'all' || s.shot === 'wide' || typeof s.aim !== 'number') {
      const cx = ppl.reduce((a, p) => a + p.x, 0) / ppl.length, cy = ppl.reduce((a, p) => a + p.y, 0) / ppl.length;
      const a = Math.atan2(cx - at.x, -(cy - at.y)), dx = Math.sin(a), dy = -Math.cos(a);
      const offs = ppl.map(p => { const vx = p.x - at.x, vy = p.y - at.y, dp = vx * dx + vy * dy, lat = vx * -dy + vy * dx; return { dp, off:Math.abs(deg(Math.atan2(lat, dp))) }; })
        .filter(q => q.dp > 0.2).map(q => q.off + deg(Math.atan(0.35 / Math.max(q.dp, 0.5))));
      return { wide:true, h:Math.max(8, 2 * Math.max(...offs, 4)), d:Math.hypot(cx - at.x, cy - at.y) };
    }
    const p = ppl[s.aim] || ppl[0], d = Math.hypot(p.x - at.x, p.y - at.y);
    return { wide:false, h:2 * deg(Math.atan(R.frameFor[s.shot] / (2 * d))), d, p, shot:s.shot };
  }
  /* horizontal angle range [tightest, widest] of a camera (+ lens) */
  /* a lens's focal range [min, max], with an extender (from the focal length Canon allows it) */
  const extFor = (lens, ext) => { const e = ext && D.EXT && D.EXT[ext]; return e && e.lenses.includes(lens) ? e : null; };
  function fRange(m, lens, ext) {
    const b = D.BODIES[m], L0 = lens === 'kit' && b.kit ? b.kit : D.LENSES[lens];
    const r = L0 ? [L0.min, L0.max] : (D.OTHER_LENS[b.mount] || [12, 120]), e = extFor(lens, ext); if (!e) return r;
    const from = D.LENSES[lens].ext; return [(typeof from === 'number' ? Math.max(r[0], from) : r[0]) * e.x, r[1] * e.x];
  }
  /* effective max aperture [at the wide end of the usable range, at the tele end] */
  function apRange(m, lens, ext) {
    const b = D.BODIES[m], L0 = lens === 'kit' && b.kit ? b.kit : D.LENSES[lens]; if (!L0 || !L0.ap) return null;
    const e = extFor(lens, ext), k = e ? (e.apx || Math.pow(2, e.stops / 2)) : 1, from = e && typeof D.LENSES[lens].ext === 'number' ? D.LENSES[lens].ext : L0.min;
    const at = f => L0.max > L0.min ? L0.ap[0] + (L0.ap[1] - L0.ap[0]) * clamp((f - L0.min) / (L0.max - L0.min), 0, 1) : L0.ap[1];
    return [at(Math.max(L0.min, from)) * k, L0.ap[1] * k];
  }
  const sensW = (b, crop) => crop && b.crop ? b.crop.w : b.w;
  function hRange(k, m, lens, ext, crop) {
    const z = D.PTZ[m] || D.CAMCORDER[m]; if (z) return [z.hT, z.hW];
    const b = D.BODIES[m]; if (!b) return [5, 60];
    const r = fRange(m, lens, ext), w = sensW(b, crop);
    const h = f => 2 * Math.atan(w / (2 * f)) * 180 / Math.PI;
    return [h(r[1]), h(r[0])];
  }
  const fmtF = a => PL.fNum ? PL.fNum(a) : 'f/' + a.toFixed(1);
  const fmtFr = (r, cine) => { if (!r) return ''; if (cine) { const v = x => String(Math.round(x * 10) / 10); return v(r[0]) === v(r[1]) ? 'T' + v(r[0]) : 'T' + v(r[0]) + '–' + v(r[1]); }
    return fmtF(r[0]) === fmtF(r[1]) ? fmtF(r[0]) : fmtF(r[0]) + '–' + fmtF(r[1]).slice(2); };
  const mmTxt = r => Math.round(r[0]) === Math.round(r[1]) ? Math.round(r[0]) + ' mm' : Math.round(r[0]) + '–' + Math.round(r[1]) + ' mm';
  const REACH_FW = 1.6;
  /* the store lens presets that fit a body's mount (APS-C-only lenses are left off full-frame bodies) */
  const okLens = (b, l) => D.LENSES[l] && P[l] && !(D.LENSES[l].apsc && b.fmt === 'ff') && (D.LENSES[l].mount === b.mount || ((D.LENSES[l].fits || []).includes(b.mount) && b.crop));
  const lensesFor = b => ((D.PRESETS || {})[b.mount] || []).filter(l => okLens(b, l));
  /* long-reach lenses for this body: the store's telephotos for its mount (+ the PL CINE-SERVO on RF cinema bodies with a
     Super 35 mode, through an adapter) */
  const longFor = b => ((D.LONG || {})[b.mount] || []).filter(l => okLens(b, l));
  const extsFor = lens => Object.keys(D.EXT || {}).filter(x => D.EXT[x].lenses.includes(lens) && (D.EXT[x].builtin || P[x]));
  function reach(L, i, n, k, m, lens, ext, crop) {
    const s = slotOf(L, i, n), at = camAt(L, s, k), nd = need(L, s, at); if (!nd) return null;
    const [lo, hi] = hRange(k, m, lens, ext, crop), rad = d => d * Math.PI / 180;
    if (nd.wide) return nd.h > hi * 1.1 ? { bad:'narrow', hi, nd } : { nd, ok:true };   /* 10 %: shoulders at the edge are fine */
    const h = Math.max(lo, Math.min(hi, nd.h)), fw = 2 * nd.d * Math.tan(rad(h / 2));
    return fw > REACH_FW && nd.h < lo ? { bad:'far', fw, nd } : { nd, fw, ok:true };
  }
  /* the store lens that best frames this position: in range first, then the cheapest (an included kit lens costs $0) */
  function autoLens(m, L, i, n) {
    const b = D.BODIES[m]; if (!b) return null;
    /* the heavy PL cine zoom is offered, never put in automatically */
    const cands = (b.kit ? ['kit'] : []).concat(lensesFor(b), longFor(b).filter(l => !D.LENSES[l].heavy));
    if (!cands.length) return PL.defaultLens ? PL.defaultLens(m) : 'other';
    const s = slotOf(L, i, n), nd = need(L, s, camAt(L, s, 'lens')); if (!nd) return cands[0];
    const score = l => { const [lo, hi] = hRange('lens', m, l); const miss = nd.h < lo ? Math.log(lo / nd.h) : nd.h > hi ? Math.log(nd.h / hi) * 2 : 0; return miss * 1e6 + (l === 'kit' ? 0 : P[l].usd); };
    return cands.slice().sort((a, b2) => score(a) - score(b2))[0];
  }
  /* when a body can't get its close-up: the cheapest store lens / extender / crop mode combination that can */
  function suggest(m, L, i, n) {
    const b = D.BODIES[m]; if (!b) return null;
    const out = [];
    (b.kit ? ['kit'] : []).concat(lensesFor(b), longFor(b)).forEach(l => [null].concat(extsFor(l)).forEach(x => [false].concat(b.crop ? [true] : []).forEach(cr => {
      const lz = D.LENSES[l]; if (lz && lz.ic === 's35' && b.fmt === 'ff' && !cr && !(x && D.EXT[x].builtin)) return;
      const r = reach(L, i, n, 'lens', m, l, x, cr); if (!r || r.bad) return;
      out.push({ lens:l, ext:x, crop:cr, fw:r.fw, cost:(l === 'kit' ? 0 : P[l].usd) + (x && !D.EXT[x].builtin ? P[x].usd : 0) + (cr ? 1 : 0) + (lz && lz.adapter && P[lz.adapter] && lz.mount !== b.mount ? P[lz.adapter].usd : 0) });
    })));
    return out.sort((a, c) => a.cost - c.cost)[0] || null;
  }
  const posRole = (L, i, n) => { if (n === 1) return 'wide'; const s = L.slots[i]; return s.role || (s.shot === 'wide' ? 'wide' : 'close'); };

  /* the starting layout for the answers: furniture, people, control position and four camera slots */
  function layout(z) {
    const K = KINDS[z.k], w = z.w, d = z.d, n = clamp(z.n, 1, 8);
    const furn = [], ppl = [], slots = [];
    let ctrl, xr = z.cd === 'booth' ? 10 : 0;
    const nm = i => K.names[i] || 'p_person:' + (i + 1);
    const spread = (cx, span, cnt) => { const xs = []; for (let i = 0; i < cnt; i++) xs.push(cnt === 1 ? cx : cx - span / 2 + span * i / (cnt - 1)); return xs.sort((a, b) => Math.abs(a - cx) - Math.abs(b - cx)); };
    const inR = (x, y) => ({ x:clamp(x, 0.35, w - 0.35), y:clamp(y, 0.35, d - 0.35) });
    if (K.lay === 'stage') {
      const sd = clamp(d * 0.2, 2.2, 6), sw = clamp(w * 0.62, Math.min(3, w - 0.6), 16);
      furn.push({ k:'stage', x:w / 2, y:sd / 2, w:sw, h:sd });
      if (K.pulpit) furn.push({ k:'pulpit', x:w / 2, y:sd * 0.66, w:0.7, h:0.5 });
      const xs = spread(w / 2, Math.min(sw - 1, Math.max(1.6, (n - 1) * 2.8)), n);
      xs.forEach((x, i) => ppl.push({ n:nm(i), x, y: i === 0 && K.pulpit ? sd * 0.66 - 0.6 : sd * 0.4, a:180 }));
      ctrl = z.cd === 'near' ? inR(Math.min(w - 0.9, w / 2 + sw / 2 + 1.3), sd + 1.4) : inR(w / 2, d - 0.55);
      const seatEnd = z.cd === 'near' ? d - 0.9 : ctrl.y - 1.9;
      if (z.au && seatEnd - (sd + 1.4) > 1.4) furn.push({ k:'seats', x:w / 2, y:(sd + 1.4 + seatEnd) / 2, w:Math.max(2, Math.min(w - 2.6, sw * 1.15)), h:seatEnd - sd - 1.4 });
      const backY = z.cd === 'near' ? d - 0.8 : ctrl.y - 1.1;
      slots.push({ ...inR(w / 2, backY), mnt:'table', aim:0, shot:'mcu', role:'pulpit', near:inR(w / 2, Math.min(backY, sd + Math.max(2.5, (backY - sd) * 0.45))) });
      slots.push({ ...inR(w - 0.5, sd + (d - sd) * 0.3), mnt:'wall', aim:'all', shot:'wide', role:'wide' });
      slots.push({ ...inR(0.5, sd + (d - sd) * 0.42), mnt:'wall', aim: n > 1 ? 1 : 0, shot:'mcu', role:'close' });
      slots.push({ ...inR(Math.max(0.7, w / 2 - sw / 2 - 0.4), sd + 1.3), mnt:'tripod', aim: n > 2 ? 2 : 0, shot:'med', role:'side' });
    } else if (K.lay === 'desk') {
      if (K.set) furn.push({ k:'set', x:w / 2, y:0.25, w:Math.min(w - 1, 8), h:0.4 });
      const dy = clamp(d * 0.32, 1.6, 3.2), dw = clamp(0.9 * n + 0.6, 1.6, w - 1);
      furn.push({ k:'desk', x:w / 2, y:dy, w:dw, h:0.8 });
      spread(w / 2, Math.min(dw - 0.6, (n - 1) * 0.9), n).sort((a, b) => a - b).forEach((x, i) => ppl.push({ n:nm(i), x, y:dy - 0.65, a:180 }));
      ctrl = inR(w / 2, d - 0.5);   /* centred: the shortest runs, whether the desk is near or at the back */
      const far = clamp(d * 0.42, 2.2, 6);
      slots.push({ ...inR(w / 2, Math.min(dy + far, ctrl.y - 0.9)), mnt:'tripod', aim:'all', shot:'wide', role:'wide' });
      slots.push({ ...inR(w / 2 - clamp(w * 0.22, 1, 3), dy + far * 0.72), mnt:'tripod', aim:n - 1, shot:'mcu', role:'close' });
      slots.push({ ...inR(w / 2 + clamp(w * 0.22, 1, 3), dy + far * 0.72), mnt:'tripod', aim:0, shot:'mcu', role:'close' });
      slots.push({ ...inR(w * 0.12, dy + far * 0.95), mnt:'tripod', aim:'all', shot:'med', role:'side' });
    } else {
      const tw = n <= 2 ? 1.4 : n <= 4 ? 1.8 : 2.4, th = 0.9, tx = w / 2, ty = clamp(d * 0.42, 1.4, d - 2.2);
      furn.push({ k:'table', x:tx, y:ty, w:tw, h:th });
      const L = tx - tw / 2 - 0.45, Rr = tx + tw / 2 + 0.45;
      const seats = [{ x:L, y:ty, a:90 }, { x:Rr, y:ty, a:270 }, { x:tx, y:ty - th / 2 - 0.45, a:180 }];
      if (n >= 4) { seats[0].y = ty - 0.4; seats[1].y = ty - 0.4; seats.splice(2, 0, { x:L, y:ty + 0.4, a:90 }, { x:Rr, y:ty + 0.4, a:270 }); seats.splice(4, 1); seats.push({ x:tx, y:ty - th / 2 - 0.45, a:180 }); }
      const pos = n === 1 ? [{ x:tx, y:ty - th / 2 - 0.45, a:180 }] : seats.slice(0, n);
      while (pos.length < n) pos.push({ x:tx + (pos.length % 2 ? 0.6 : -0.6), y:ty - th / 2 - 0.5, a:180 });
      pos.forEach((p, i) => ppl.push({ n:nm(i), ...p }));
      ctrl = z.cd === 'near' ? inR(tx, Math.min(d - 0.35, ty + 2.4)) : inR(tx, d - 0.35);   /* behind the wide camera: the shortest runs */
      slots.push({ ...inR(tx, Math.min(d - 0.7, ty + 2.0)), mnt:'tripod', aim:'all', shot:'wide', role:'wide' });
      slots.push({ ...inR(Math.max(0.5, tx - tw / 2 - 1.0), Math.min(d - 0.9, ty + 1.5)), mnt:'tripod', aim: n > 1 ? 1 : 0, shot:'mcu', role:'close' });
      slots.push({ ...inR(Math.min(w - 0.5, tx + tw / 2 + 1.0), Math.min(d - 0.9, ty + 1.5)), mnt:'tripod', aim:0, shot:'mcu', role:'close' });
      slots.push({ ...inR(0.5, 0.5), mnt:'tripod', aim:'all', shot:'med', role:'corner' });
    }
    if (xr) ctrl = inR(ctrl.x, d - 0.35);
    const tpl = K.tplSmall && w * d < 150 ? K.tplSmall : K.tpl;
    return { tpl, w, d, furn, ppl, ctrl, xr, slots };
  }
  /* the camera list for a tier, with the customer's own cameras first */
  function ownedCam(z, rec) {
    if (z.oc === 'ptz') { const r = rec.cams.find(c => c.k === 'ptz'); return r ? C('ptz', r.m) : C('ptz', rec.tr === 'ip' ? 'crn300' : 'ue20'); }
    if (z.oc === 'cc') return C('cc', 'xf605');
    const r = rec.cams.find(c => c.k === 'lens'); return r ? { ...r } : C('lens', 'r50v', { lens:'kit', man:false });
  }
  function specFor(z, tier, trOverride) {
    const rec = tier === 'c' ? lineupCustom(z) : lineupTier(z, tier), L = layout(z);
    let cams = rec.cams.map(c => ({ ...c }));
    /* links saved before step 3 had cameras: "I have N cameras of a kind" still marks the first N as owned */
    const on = tier !== 'c' && z.oc && z.oc !== 'none' ? clamp(z.on, 0, 4) : 0;
    for (let i = 0; i < on; i++) { const oc = { ...ownedCam(z, rec), own:true }; if (i < cams.length) cams[i] = oc; else cams.push(oc); }
    cams = cams.slice(0, 4);
    const n = cams.length;
    cams.forEach((c, i) => { if (c.k === 'lens' && !c.lens) c.lens = autoLens(c.m, L, i, n); if (c.man == null) c.man = manFor(z, c.k); });
    const lt = ltOf(z);
    return { pr:prOf(z), lt:{ on:lt.on, ctl:lt.ctl, ctrl:lt.ctrl || 'vp', panel:lt.panel, relay:lt.relay, ptype:lt.ptype || 'kiosc', pick:{ ...(lt.pick || {}) }, look:lt.look || 'std', k:z.k, big: z.k === 'church' && z.w * z.d > 450 ? 1 : 0 },
      tpl:L.tpl, w:L.w, d:L.d, tr:trOverride || rec.tr, fmt:'hd', ext: z.k === 'podcast' || z.k === 'studio' ? 0 : 1, xr:L.xr, own:z.ow.slice(),
      furn:L.furn, ppl:L.ppl, ctrl:L.ctrl,
      cams:cams.map((c, i) => { const s = n === 1 ? { ...L.slots[0], aim:'all', shot:'wide' } : L.slots[i];
        const { x, y } = camAt(L, s, c.k);   /* manned cameras stand on tripods, off the wall / mid-aisle */
        return { k:c.k, m:c.m, lens:c.lens || null, ext:c.ext || null, crop:!!c.crop, mob:!!c.mob, x, y, mnt: c.k === 'ptz' ? s.mnt : 'tripod', man: c.man ?? (c.k !== 'ptz'), aim:s.aim, shot:s.shot, own:!!c.own }; }) };
  }
  let OPT_CACHE = { key:'', opts:null };
  function options() {
    const key = JSON.stringify([Z.k, Z.w, Z.d, Z.n, Z.au, Z.cd, Z.oc, Z.on, Z.ow, Z.st, Z.fam, Z.cn, Z.cl, Z.pr, Z.lt, PL.lang]);
    if (OPT_CACHE.key === key) return OPT_CACHE.opts;
    const opts = {};
    (Z.cl ? ['c'] : []).concat(TIERS).forEach(tier => {
      let spec = specFor(Z, tier), forced = false;
      let packed = PL.compose(spec), ev = PL.evaluate(packed);
      if (spec.tr === 'hdmi' && ev.maxRun > R.hdmiActive) { spec = specFor(Z, tier, 'sdi'); packed = PL.compose(spec); ev = PL.evaluate(packed); forced = true; }
      opts[tier] = { id:tier, packed, ev, forced };
    });
    if (Z.st) { const ev = PL.evaluate({ setup:Z.st }); if (ev) opts.s = { id:'s', setup:Z.st, ev, forced:false }; }
    OPT_CACHE = { key, opts };
    return opts;
  }
  const order = () => (Z.cl ? ['c'] : []).concat(Z.st ? ['s'] : []).concat(TIERS);
  function pickFor(opts) {
    if (Z.cl && opts.c) return 'c';   /* the customer chose these cameras in step 3 */
    if (!Z.b) return Z.st ? 's' : 'r';
    /* Recommended when it fits; Pro only when it fits with a quarter of the budget to spare; otherwise Essential */
    if (opts.p.ev.total <= Z.b * 0.75) return 'p';
    if (opts.r.ev.total <= Z.b) return 'r';
    return 'e';
  }

  /* plain words about an evaluated plan */
  const camKindOf = c => c.k === 'ptz' ? 'ptz' : c.k === 'cc' ? 'cc' : (D.BODIES[c.m] && D.BODIES[c.m].studio ? 'studio' : 'cine');
  function title(ev) {
    const groups = {}; ev.cams.forEach(c => { const k = camKindOf(c); groups[k] = (groups[k] || 0) + 1; });
    const ks = Object.keys(groups);
    const tr = ev.tr === 'ip' ? 'IP / NDI' : ev.tr.toUpperCase();
    const camWord = ks.length === 1 ? (PL.lang === 'pt' ? t(ev.n === 1 ? 'camN' : 'camsN', ev.n) + ' ' + t('kn_' + ks[0]) : `${ev.n} ${t('kn_' + ks[0])} ${ev.n === 1 ? 'camera' : 'cameras'}`)
      : (PL.lang === 'pt' ? t('camsN', ev.n) : `${ev.n} cameras`);   /* mixed kinds: the count here, the kinds in the why */
    return `${camWord} ${t('on')} ${tr}`;
  }
  function whyFormat(o) {
    const run = PL.lenTxt(o.ev.maxRun);
    if (o.ev.tr === 'ip') return t('why_ip');
    if (o.ev.tr === 'hdmi') return t(o.ev.maxRun > R.hdmiPassive ? 'why_hdmiAoc' : 'why_hdmi', run);
    return t(o.forced ? 'why_sdiForced' : 'why_sdi', run);
  }
  function whyCams(ev) {
    const ks = [...new Set(ev.cams.filter(c => !c.own).map(camKindOf))];
    let s = ks.map(k => t('why_' + k)).join(' ');
    const own = ev.cams.filter(c => c.own).length;
    if (own) s += (s ? ' ' : '') + t(own > 1 ? 'why_own' : 'why_own1', own);
    return s;
  }
  const switcherOf = ev => { const l = ev.bom.find(x => x.g === 'sw' && x.role === 'sw'); if (!l) return '—';
    const nm = l.id && P[l.id] ? P[l.id].name : l.code === 'NDI' ? t('swNdi') : t('swBig');
    return nm + (l.own ? ' · ' + t('youHave') : l.id && P[l.id] ? '' : ' · ' + t('swQuote')); };
  function fitHTML(total, b) {
    if (!b) return `<div class="fit none"><div class="bar"></div><span class="meta-s">${t('noBudget')}</span></div>`;
    const over = total > b, max = Math.max(total, b);
    const fill = Math.min(total, b) / max * 100, ov = over ? (total - b) / max * 100 : 0, mark = b / max * 100;
    return `<div class="fit ${over ? 'over' : 'ok'}"><div class="bar"><i style="width:${fill.toFixed(2)}%"></i>${over ? `<i class="ov" style="left:${fill.toFixed(2)}%;width:${ov.toFixed(2)}%"></i>` : ''}<b style="left:${mark.toFixed(2)}%"></b></div><span class="meta-s">${over ? t('over', usd0(total - b)) : t('fits', usd0(b - total))}</span></div>`;
  }

  /* ======================= wizard state (rides in the plan hash as z) ======================= */
  const DEF = () => ({ v:'w', sv:2, s:1, mx:1, k:null, pr:null, lt:null, rp:'m', w:16, d:24, fr:'s', n:3, au:1, cd:'back', oc:'none', on:0, ow:[], b:null, o:null, om:0, lo:null, pl:0, dirty:1, ap:0, apk:'', st:null,
    fam:null, cn:null, cl:null, same:0, pos:0 });
  let Z = DEF();
  function valid(z) {
    const d = DEF(); if (!z || typeof z !== 'object') return d;
    const o = { ...d, ...z };
    o.v = o.v === 'a' ? 'a' : 'w';
    if (!z.sv && +o.s >= 4) { o.s = +o.s + 1; o.mx = +(o.mx || o.s) + 1; }   /* links saved before the production step (round 3) */
    o.sv = 2; o.s = clamp(Math.round(+o.s || 1), 1, 8); o.mx = clamp(Math.round(+o.mx || o.s), o.s, 8);
    o.pr = o.pr && typeof o.pr === 'object' ? { ...PRDEF(o.k), ...o.pr } : null; o.lt = o.lt && typeof o.lt === 'object' ? { ...LTDEF(o.k), ...o.lt } : null;
    o.k = KINDS[o.k] ? o.k : null; o.w = clamp(+o.w || 16, 2, 80); o.d = clamp(+o.d || 24, 2, 80); o.n = clamp(Math.round(+o.n || 1), 1, 8);
    o.au = o.au ? 1 : 0; o.cd = ['near', 'back', 'booth'].includes(o.cd) ? o.cd : 'back'; o.fr = o.fr === 'l' ? 'l' : 's';
    o.oc = ['none', 'ptz', 'cc', 'lens'].includes(o.oc) ? o.oc : 'none'; o.on = clamp(Math.round(+o.on || 0), 0, 4);
    o.ow = Array.isArray(o.ow) ? o.ow.filter(r => OWN.includes(r)) : []; o.b = o.b ? clamp(+o.b, 500, 1e6) : null;
    o.fam = FAMS.includes(o.fam) ? o.fam : null; o.cn = o.cn ? clamp(Math.round(+o.cn), 1, 4) : null;
    /* the customer's camera picks: [model, lens, owned] per position, store models only */
    o.cl = Array.isArray(o.cl) ? o.cl.slice(0, 4).map(c => Array.isArray(c) ? { m:c[0], lens:c[1] || null, own:!!c[2], ext:c[3] || null, crop:!!c[4], mob:!!c[5] } : c)
      .filter(c => c && P[c.m] && (D.PTZ[c.m] || D.CAMCORDER[c.m] || D.BODIES[c.m])).map(c => ({ m:c.m, lens:D.BODIES[c.m] && (c.lens === 'kit' || c.lens === 'other' || D.LENSES[c.lens]) ? c.lens : null, own:!!c.own,
        ext:D.EXT && D.EXT[c.ext] && D.EXT[c.ext].lenses.includes(c.lens) ? c.ext : null, crop:!!c.crop && !!(D.BODIES[c.m] && D.BODIES[c.m].crop), mob:!!c.mob })) : null;
    if (o.cl && !o.cl.length) o.cl = null;
    o.same = o.same ? 1 : 0; o.pos = clamp(Math.round(+o.pos || 0), 0, 3);
    o.o = ['e', 'r', 'p', 's', 'c'].includes(o.o) ? o.o : null; o.st = o.st && window.I9S && window.I9S.SET && window.I9S.SET[o.st] ? o.st : null;
    if (o.o === 's' && !o.st) o.o = null;
    if (o.o === 'c' && !o.cl) o.o = null;
    return o;
  }
  PL.zGet = () => { const o = {}; Object.keys(Z).forEach(k => { let v = Z[k]; if (k === 'cl' && v) v = v.map(c => c.mob ? [c.m, c.lens || 0, c.own ? 1 : 0, c.ext || 0, c.crop ? 1 : 0, 1] : c.ext || c.crop ? [c.m, c.lens || 0, c.own ? 1 : 0, c.ext || 0, c.crop ? 1 : 0] : [c.m, c.lens || 0, c.own ? 1 : 0]); if (v !== null && v !== '' && !(Array.isArray(v) && !v.length)) o[k] = v; }); return o; };
  const save = () => PL.save();
  const hasPlan = () => Z.pl && !Z.dirty && Z.lo === Z.o;
  const hashOf = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

  function setAnswer(k, v) { if (Z[k] === v && !Array.isArray(v)) return; Z[k] = v; Z.dirty = 1; if (!Z.om) Z.o = null; }
  function presetDims(k, rp) { const r = D.ROOMS[k].find(p => p[0] === rp); return r ? [r[1], r[2]] : null; }
  function applyFront() { const lo = Math.min(Z.w, Z.d), hi = Math.max(Z.w, Z.d); if (KINDS[Z.k] && KINDS[Z.k].lay === 'stage') { if (Z.fr === 'l') { Z.w = hi; Z.d = lo; } else { Z.w = lo; Z.d = hi; } } }
  function chooseKind(k) {
    if (Z.k === k) return;
    const K = KINDS[k]; Z.k = k; Z.rp = K.rp || 'm'; const pd = presetDims(k, Z.rp); Z.w = pd[0]; Z.d = pd[1]; Z.fr = 's';
    Z.n = K.n; Z.au = K.au; Z.cd = K.lay === 'stage' ? 'back' : 'near'; Z.dirty = 1; Z.om = 0; Z.o = null; Z.st = null;
    Z.fam = null; Z.cn = null; Z.cl = null; Z.same = 0; Z.pos = 0;
  }

  /* answers follow a plan made in the advanced editor (room size, people), without redrawing it */
  function syncRoom() { const S = PL.state; Z.w = S.w; Z.d = S.d; Z.rp = 'c'; Z.n = clamp(S.ppl.length || 1, 1, 8); Z.au = S.furn.some(f => f.k === 'seats') ? 1 : 0; Z.ow = (S.own || []).slice(); }
  /* make sure the open plan is the chosen option (regenerate only when an answer changed or another option was chosen) */
  function ensurePlan() {
    const opts = options();
    if (!Z.o || !opts[Z.o]) Z.o = pickFor(opts);
    if (hasPlan()) return;
    const o = opts[Z.o];
    if (o.setup) PL.loadSetup(o.setup); else PL.loadPlan(o.packed);
    Z.pl = 1; Z.dirty = 0; Z.lo = Z.o; Z.ap = 0; Z.apk = '';
    save();
  }

  /* ======================= DOM ======================= */
  const panel = $('#wz-panel'), stepsEl = $('#wz-steps');
  const planbox = $('#planbox'), mvh = $('.mvh'), cviews = $('#cviews');
  const homes = [planbox, mvh, cviews].map(e => { const c = document.createComment('home'); e.parentNode.insertBefore(c, e); return [e, c]; });
  const goHome = () => homes.forEach(([e, c]) => { if (e.previousSibling !== c) c.parentNode.insertBefore(e, c.nextSibling); });
  let G3 = null;   /* the mounted 3D view */
  const unmount3d = () => { if (G3) { try { G3.dispose(); } catch (e) {} G3 = null; } };

  function setView(v) {
    Z.v = v;
    root.classList.toggle('pl-adv', v === 'a'); root.classList.toggle('pl-wiz', v !== 'a');
    if (v === 'a') { unmount3d(); goHome(); root.removeAttribute('data-wzs'); PL.renderPlanNow(); }
    render();
    save();
  }
  function go(s, opt = {}) {
    s = clamp(s, 1, 8);
    if (s > 1 && !Z.k) s = 1;
    if (s >= 6) ensurePlan();
    if (s >= 7 && !Z.ap && !opt.approve && s > Z.mx) s = 6;
    Z.s = s; Z.mx = Math.max(Z.mx, s);
    render();
    save();
    if (!opt.keepScroll) { const top = $('#wz').getBoundingClientRect().top + scrollY - 72; if (scrollY > top) scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
    if (opt.focus !== false) { const h = $('#wz-h'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll:true }); }
  }
  function approve() { Z.ap = 1; Z.apk = hashOf(PL.planKey()); }

  /* ----- stepper + chrome ----- */
  function renderChrome() {
    $('#wz-kick').textContent = t('kick'); $('#to-adv-l').textContent = t('toAdv');
    $('#advbar-k').textContent = t('advK'); $('#advbar-t').textContent = t('advT'); $('#to-wiz-l').textContent = t('toWiz');
    stepsEl.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8].map(i => {
      const cur = i === Z.s, done = i < Z.s || (i <= Z.mx && i !== Z.s), dis = i > Z.mx && !(i === Z.mx + 1 && canNext() && i <= 6);
      return `<li><button type="button" data-go="${i}" class="${cur ? 'cur' : done ? 'done' : ''}"${cur ? ' aria-current="step"' : ''}${dis ? ' disabled' : ''}><span class="n">${String(i).padStart(2, '0')}<i aria-hidden="true"></i></span><b>${esc(t('st' + i))}</b></button></li>`;
    }).join('');
    $('#wz-progbar').style.width = (Z.s / 8 * 100).toFixed(1) + '%';
    $('#wz-h').textContent = t('h' + Z.s);
    $('#wz-lede').textContent = t('l' + Z.s);
    root.setAttribute('data-wzs', Z.s);
    /* footer */
    $('#wz-back').classList.toggle('off', Z.s === 1); $('#wz-back').disabled = Z.s === 1; $('#wz-back-l').textContent = t('back');
    const nx = $('#wz-next'), nl = $('#wz-next-l');
    nx.disabled = !canNext();
    nl.textContent = Z.s === 6 ? t('approveNext') : Z.s === 7 ? t('toList') : Z.s === 8 ? t('reqQuote') : t('next') + ': ' + t('st' + (Z.s + 1));
    nx.classList.toggle('noarrow', Z.s === 8);
    let sum = `<span class="meta">${esc(t('stepOf', Z.s))}</span>`;
    if (Z.s >= 6 && Z.pl) { const tt = PL.tally(); sum += `<span class="tot"><b class="price">${usd(tt.total)}</b><span class="meta-s">${esc(tt.quote.length === 1 ? t('plusQuote1') : t('plusQuote', tt.quote.length))}</span></span>`; }
    else if (Z.s === 4 && Z.k) { const cs = camSum(); sum += `<span class="tot"><span class="meta-s">${esc(t('sPlan'))}</span> <b class="price">${usd(cs.ev.total)}</b><span class="meta-s">${esc(cs.ev.quote.length === 1 ? t('plusQuote1') : t('plusQuote', cs.ev.quote.length))}</span></span>`; }
    else if (Z.s === 5 && Z.b) sum += `<span class="tot"><span class="meta-s">${esc(t('upTo'))}</span> <b class="price">${usd0(Z.b)}</b></span>`;
    else if (Z.s === 3 && Z.k) { const cs = camSum(); sum += `<span class="tot"><span class="meta-s">${esc(t('camsSub'))}</span> <b class="price">${usd(cs.cam)}</b><span class="meta-s">· ${esc(t('sPlan'))} ${usd(cs.ev.total)}</span></span>`; }
    $('#wz-sum').innerHTML = sum;
  }
  function canNext() { return Z.s === 1 ? !!Z.k : true; }

  /* ----- step 1: what you're making ----- */
  function step1() {
    return `<div class="kinds" role="radiogroup" aria-labelledby="wz-h">${KORDER.map((k, i) => `
      <button type="button" class="kind${Z.k === k ? ' on' : ''}" role="radio" aria-checked="${Z.k === k}" data-kind="${k}">
        <span class="ph"><img src="${KINDS[k].img}" alt="" loading="${i < 3 ? 'eager' : 'lazy'}"></span>
        <span class="kt"><span class="n">${String(i + 1).padStart(2, '0')}<i aria-hidden="true"></i></span><b>${esc(t('k_' + k))}</b><span class="kd">${esc(t('kd_' + k))}</span></span>
      </button>`).join('')}</div>`;
  }

  /* ----- step 2: the room ----- */
  const unit = () => PL.state.unit;
  const toU = m => unit() === 'ft' ? Math.round(m * FT) : r1(m);
  const numTxt = v => { const s = String(v); return PL.lang === 'pt' ? s.replace('.', ',') : s; };
  function step2() {
    const K = KINDS[Z.k], pre = D.ROOMS[Z.k];
    const glyph = (w, d) => { const s = 34 / Math.max(w, d); return `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="${(40 - w * s) / 2}" y="${(40 - d * s) / 2}" width="${w * s}" height="${d * s}"/></svg>`; };
    const dimTxt = (w, d) => `${numTxt(toU(w))} × ${numTxt(toU(d))} ${unit()}`;
    const stage = K.lay === 'stage';
    return `<div class="rgrid">
      <div class="rform">
        <fieldset class="fs"><legend class="meta">${esc(t('size'))}</legend>
          <div class="presets">${pre.filter(p => Array.isArray(p)).map(([id, w, d]) => { const [ww, dd] = stage && Z.fr === 'l' ? [Math.max(w, d), Math.min(w, d)] : [w, d]; return `
            <button type="button" class="pre${Z.rp === id ? ' on' : ''}" data-rp="${id}" aria-pressed="${Z.rp === id}">${glyph(ww, dd)}<b>${esc(t('rp_' + Z.k + '_' + id))}</b><span class="meta-s">${dimTxt(ww, dd)}</span></button>`; }).join('')}
            <div class="pre cust${Z.rp === 'c' ? ' on' : ''}"><b>${esc(t('custom'))}</b>
              <span class="cin"><label class="num-in"><span class="sr">${esc(PL.t('width'))}</span><input id="wz-w" type="text" inputmode="decimal" autocomplete="off" value="${numTxt(toU(Z.w))}"><i class="u">${unit()}</i></label><span class="x" aria-hidden="true">×</span><label class="num-in"><span class="sr">${esc(PL.t('depth'))}</span><input id="wz-d" type="text" inputmode="decimal" autocomplete="off" value="${numTxt(toU(Z.d))}"><i class="u">${unit()}</i></label></span>
              <span class="seg sm" role="group" aria-label="Units"><button type="button" data-wu="m" aria-pressed="${unit() === 'm'}">m</button><button type="button" data-wu="ft" aria-pressed="${unit() === 'ft'}">ft</button></span>
            </div>
          </div>
        </fieldset>
        ${stage ? `<div class="fq"><span class="ql">${esc(t('front'))}</span><span class="seg" role="group" aria-label="${esc(t('front'))}"><button type="button" data-fr="s" aria-pressed="${Z.fr === 's'}">${esc(t('frShort'))}</button><button type="button" data-fr="l" aria-pressed="${Z.fr === 'l'}">${esc(t('frLong'))}</button></span></div>` : ''}
        <div class="fq"><span class="ql">${esc(t('people'))}<span class="meta-s">${esc(t('peopleHint'))}</span></span>
          <span class="pplc"><span class="step"><button type="button" data-n="-1" aria-label="−1"${Z.n <= 1 ? ' disabled' : ''}>${icon('minus')}</button><output id="wz-n" aria-live="polite">${Z.n}</output><button type="button" data-n="1" aria-label="+1"${Z.n >= 8 ? ' disabled' : ''}>${icon('plus')}</button></span>
          <span class="figs" aria-hidden="true">${Array.from({ length:8 }, (_, i) => `<i class="${i < Z.n ? 'on' : ''}"></i>`).join('')}</span></span></div>
        <div class="fq"><span class="ql">${esc(t('aud'))}</span><span class="seg" role="group" aria-label="${esc(t('aud'))}"><button type="button" data-au="1" aria-pressed="${!!Z.au}">${esc(t('yes'))}</button><button type="button" data-au="0" aria-pressed="${!Z.au}">${esc(t('no'))}</button></span></div>
        <fieldset class="fs"><legend class="meta">${esc(t('ctrl'))}</legend>
          <div class="cds">${['near', 'back', 'booth'].map((c, i) => `<button type="button" class="cd${Z.cd === c ? ' on' : ''}" data-cd="${c}" aria-pressed="${Z.cd === c}"><span class="n">${String(i + 1).padStart(2, '0')}<i aria-hidden="true"></i></span><b>${esc(t('cd_' + c))}</b><span class="meta-s">${esc(t('cdd_' + c))}</span></button>`).join('')}</div>
        </fieldset>
      </div>
      <figure class="rprev"><figcaption class="meta"><span class="tally"></span>${esc(t('preview'))} · <span class="dimtx">${dimTxt(Z.w, Z.d)}</span></figcaption>${preview()}<p class="meta-s">${esc(t('previewNote'))}</p></figure>
    </div>`;
  }
  function preview() {
    const L = layout(Z), pad = Math.max(0.8, 0.06 * Math.max(L.w, L.d)), k = Math.max(L.w, L.d) / 520;
    const vb = `${-pad} ${-pad} ${L.w + pad * 2} ${L.d + pad * 2}`;
    let s = `<svg class="pv" viewBox="${vb}" role="img" aria-label="${esc(t('preview'))}"><rect class="room" x="0" y="0" width="${L.w}" height="${L.d}"/>`;
    const step = Math.max(L.w, L.d) > 25 ? 5 : Math.max(L.w, L.d) > 10 ? 2 : 1;
    for (let x = step; x < L.w; x += step) s += `<line class="gl" x1="${x}" y1="0" x2="${x}" y2="${L.d}"/>`;
    for (let y = step; y < L.d; y += step) s += `<line class="gl" x1="0" y1="${y}" x2="${L.w}" y2="${y}"/>`;
    L.furn.forEach(f => { s += `<rect class="f f-${f.k}" x="${f.x - f.w / 2}" y="${f.y - f.h / 2}" width="${f.w}" height="${f.h}"/>`; if (f.w > 2.5 && f.h > 1.2) s += `<text x="${f.x}" y="${f.y - f.h / 2 + 12 * k * 1.3}" font-size="${10 * k * 1.3}" text-anchor="middle">${esc(PL.t('f_' + f.k).toUpperCase())}</text>`; });
    L.ppl.forEach(p => { s += `<circle class="p" cx="${p.x}" cy="${p.y}" r="${Math.max(0.17, 5 * k)}"/>`; });
    const cw = Math.max(1.2, 70 * k), ch = Math.max(0.5, 18 * k);
    s += `<rect class="c" x="${clamp(L.ctrl.x - cw / 2, -pad * 0.9, L.w + pad * 0.9 - cw)}" y="${L.ctrl.y - ch / 2}" width="${cw}" height="${ch}"/><text class="ct" x="${clamp(L.ctrl.x, cw / 2 - pad * 0.9, L.w + pad * 0.9 - cw / 2)}" y="${L.ctrl.y + 3.5 * k * 1.3}" font-size="${9 * k * 1.3}" text-anchor="middle">CTRL</text>`;
    s += `<rect class="walls" x="0" y="0" width="${L.w}" height="${L.d}"/></svg>`;
    return s;
  }

  /* ----- step 3: what you have ----- */
  const GLY = {
    sw:'<rect x="3" y="8" width="18" height="8"/><path d="M6 12h2M10 12h2M14 12h4"/>',
    pc:'<rect x="4" y="5" width="16" height="11"/><path d="M9 19h6M12 16v3"/>',
    aud:'<rect x="9" y="3" width="6" height="11" rx="0"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>',
    lit:'<rect x="5" y="4" width="14" height="9"/><path d="M12 13v8M8 21h8"/>',
    net:'<rect x="3" y="9" width="18" height="6"/><path d="M6 12h1M9 12h1M12 12h1M15 12h1M18 12h0.5"/>',
    tri:'<path d="M12 7v5M12 12l-6 9M12 12l6 9M12 12v9"/><rect x="8" y="3" width="8" height="4"/>',
    cab:'<path d="M4 7h5a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h12"/><rect x="2" y="5" width="2" height="4"/><rect x="20" y="17" width="2" height="4"/>',
    cam:'<rect x="3" y="7" width="13" height="10"/><path d="M16 11l5-3v8l-5-3"/>',
  };
  const gly = k => `<svg class="gly" viewBox="0 0 24 24" aria-hidden="true">${GLY[k]}</svg>`;
  /* ----- step 3: cameras — the type first, then a model per position ----- */
  const UI = { b:'', o:'', p:'', tab:null, cmp:[] };   /* picker filters + compare: this visit only, not saved in the link */
  const brandShort = b => b === 'Blackmagic Design' ? 'Blackmagic' : b;
  /* the lineup on screen: the customer's picks, else the cameras of the chosen (or recommended) option */
  function shownId(opts) { if (Z.cl && (Z.o === 'c' || !Z.o)) return 'c'; return Z.o && opts[Z.o] ? Z.o : Z.st && opts.s ? 's' : 'r'; }
  function lineupShown() {
    const opts = options(), id = shownId(opts);
    if (id === 'c') return Z.cl.map(c => ({ k:kOf(c.m), m:c.m, lens:D.BODIES[c.m] ? c.lens || opts.c.ev.cams[Z.cl.indexOf(c)]?.lens || null : null, own:!!c.own, ext:c.ext || null, crop:!!c.crop, mob:!!c.mob }));
    return opts[id].ev.cams.slice(0, 4).map(c => ({ k:c.k, m:c.m, lens:c.k === 'lens' ? c.lens : null, own:!!c.own, ext:c.ext || null, crop:!!c.crop, mob:!!c.mob }));
  }
  function editLineup(fn) {
    const cl = lineupShown().map(c => ({ m:c.m, lens:c.lens, own:c.own, ext:c.ext || null, crop:!!c.crop, mob:!!c.mob }));
    fn(cl, layout(Z));
    Z.cl = cl; Z.cn = cl.length; Z.o = 'c'; Z.om = 1; Z.dirty = 1;
  }
  function pickModel(m) {
    editLineup((cl, L) => { const n = cl.length, idx = Z.same ? cl.map((_, i) => i) : [clamp(Z.pos, 0, n - 1)];
      idx.forEach(i => { cl[i].m = m; cl[i].lens = D.BODIES[m] ? autoLens(m, L, i, n) : null; cl[i].ext = null; cl[i].crop = false; }); });
  }
  function setCount(n) {
    n = clamp(n, 1, 4);
    if (Z.cl) editLineup((cl, L) => { while (cl.length > n) cl.pop(); while (cl.length < n) { const last = cl[cl.length - 1], i = cl.length; cl.push({ m:last.m, lens:D.BODIES[last.m] ? autoLens(last.m, L, i, n) : null, own:false }); } });
    else { Z.cn = n; Z.dirty = 1; if (!Z.om) Z.o = null; }
    Z.pos = clamp(Z.pos, 0, n - 1);
  }
  const FGLY = {
    ptz:'<rect x="22" y="31" width="20" height="5"/><path d="M26 31v-5h12v5"/><circle cx="32" cy="16" r="10"/><circle cx="32" cy="16" r="4"/>',
    cc:'<rect x="12" y="15" width="25" height="15"/><path d="M37 18h7l7-4v18l-7-4h-7"/><path d="M16 15v-5h15v5M12 23H8"/>',
    lens:'<rect x="17" y="13" width="20" height="17"/><rect x="37" y="16" width="11" height="11"/><path d="M48 18h4v7h-4M13 9h28M13 9v25h28"/>',
    mix:'<rect x="6" y="25" width="13" height="4"/><circle cx="12.5" cy="17" r="6.5"/><rect x="30" y="13" width="15" height="13"/><rect x="45" y="16" width="8" height="8"/><path d="M27 9h20M27 9v20"/>',
  };
  function famCard(f, i, fam) {
    const on = f === fam, def = f === FAMDEF[Z.k];
    const pr = CAMS.filter(c => c.fam === f).map(c => P[c.id].usd);
    const from = f === 'mix' ? t('famMix') : pr.length ? t('fromP', usd0(Math.min(...pr))) : '';
    return `<button type="button" class="fam${on ? ' on' : ''}" role="radio" aria-checked="${on}" data-fam="${f}">
      <span class="fg"><svg viewBox="0 0 64 42" aria-hidden="true">${FGLY[f]}</svg>${def ? `<span class="fp meta">${esc(t('pick'))}</span>` : ''}</span>
      <span class="ft"><span class="n">${String(i + 1).padStart(2, '0')}<i aria-hidden="true"></i></span><b>${esc(t('f_' + f))}</b><span class="fd">${esc(t('fb_' + f))}</span><span class="ff meta-s">${esc(from)}</span></span>
    </button>`;
  }
  const outsOf = m => { const s = specOf(m); return [s.sdi ? s.sdi + '-SDI' : null, s.hdmi ? 'HDMI' : null, s.ndi ? (s.ndiKey ? 'NDI (' + t('paid') + ')' : 'NDI') : null].filter(Boolean).join(' · ') || t('none'); };
  function facts(m) {
    const s = specOf(m), f = famOfM(m), out = [];
    if (f === 'lens') { const fm = D.FORMATS[s.fmt]; out.push(['fx_sensor', `${fm ? fm.label : ''} · ${s.mount}`]); }
    else out.push(['fx_zoom', `${s.zoom}× · ${s.hW}°–${s.hT}°`]);
    out.push(['fx_out', outsOf(m)]);
    if (s.res) out.push(['fx_max', s.res]);
    if (f === 'ptz') out.push(['fx_ctl', (s.ctl || []).join(' · ') + (s.poe ? ' · ' + s.poe : '')]);
    else if (f === 'lens') out.push(['fx_lens', s.kit ? t('lensIncl', `${s.kit.min}–${s.kit.max} mm`) : t('lensPick')]);
    return out.slice(0, 4);
  }
  function pickList() {
    const fam = famOf(Z), tab = fam === 'mix' ? (UI.tab || 'all') : fam;
    const pool = CAMS.filter(c => tab === 'all' || c.fam === tab);
    let list = pool;
    if (UI.b) list = list.filter(c => P[c.id].brand === UI.b);
    if (UI.o) list = list.filter(c => { const s = specOf(c.id); return UI.o === 'sdi' ? !!s.sdi : UI.o === 'hdmi' ? !!s.hdmi : !!s.ndi; });
    if (UI.p) list = list.filter(c => { const u = P[c.id].usd; return UI.p === '1' ? u < 2500 : UI.p === '2' ? u >= 2500 && u <= 5000 : u > 5000; });
    return { list:list.slice().sort((a, b) => P[a.id].usd - P[b.id].usd), total:pool.length, tab, brands:[...new Set(pool.map(c => P[c.id].brand))].sort() };
  }
  function camCard(c, sel, n, ti) {
    const p = P[c.id], s = specOf(c.id), on = sel.has(c.id), inCmp = UI.cmp.includes(c.id);
    const use = Z.same ? t('useAll', n) : t('useFor', ti + 1), onL = Z.same ? t('onAll') : t('onCam', ti + 1);
    return `<li class="ccard${on ? ' on' : ''}">
      <span class="pk"><img src="${p.src}" alt="" loading="lazy"></span>
      <div class="cc-t"><span class="cc-b">${esc(brandShort(p.brand))}</span><b>${esc(p.name)}</b>
        <span class="cc-tags"><span class="cc-badge">${esc(c.sub)}</span>${s.approx ? `<span class="vf" title="${esc(s.note || '')}">${esc(t('verify'))}</span>` : ''}</span></div>
      <dl class="cc-f">${facts(c.id).map(([k, v]) => `<div><dt>${esc(t(k))}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <p class="cc-p"><b class="price">${usd(p.usd)}</b><span class="meta-s">${esc(t('beforeTax'))}</span></p>
      <div class="cc-a"><button type="button" class="btn sm${on ? ' solid' : ''}" data-pick="${c.id}" aria-pressed="${on}" aria-label="${esc((on ? onL : use) + ': ' + p.brand + ' ' + p.name)}">${on ? '✓ ' + esc(onL) : esc(use)}</button>
        <label class="cc-cmp"><input type="checkbox" data-cmp="${c.id}"${inCmp ? ' checked' : ''}${!inCmp && UI.cmp.length >= 3 ? ' disabled' : ''}><span>${esc(t('cmp'))}</span></label></div>
    </li>`;
  }
  function compare() {
    if (UI.cmp.length < 2) return UI.cmp.length ? `<p class="ccmp-hint meta-s"><i class="qd"></i>${esc(t('cmpMax'))} · ${esc(P[UI.cmp[0]].name)}</p>` : '';
    const ms = UI.cmp, row = (k, f) => `<tr><th scope="row">${esc(t(k))}</th>${ms.map(m => `<td>${f(m)}</td>`).join('')}</tr>`;
    const sp = specOf;
    return `<div class="ccmp" id="ccmp"><div class="ccmp-hd"><h3 class="meta"><span class="tally"></span>${esc(t('cmpH'))}</h3><button type="button" class="tbtn" data-cmpclear>${esc(t('cmpClear'))}</button></div>
      <div class="ccmp-sc"><table><thead><tr><td></td>${ms.map(m => `<th scope="col"><span class="pk"><img src="${P[m].src}" alt=""></span><span class="cc-b">${esc(brandShort(P[m].brand))}</span>${esc(P[m].name)}</th>`).join('')}</tr></thead><tbody>
      ${row('fx_price', m => `<b>${usd(P[m].usd)}</b>`)}
      ${row('fx_type', m => esc(CAMBY[m] ? CAMBY[m].sub : ''))}
      ${row('fx_zoom', m => famOfM(m) === 'lens' ? esc(`${(D.FORMATS[sp(m).fmt] || {}).label || ''} · ${sp(m).w} mm`) : esc(`${sp(m).zoom}× · ${sp(m).hW}°–${sp(m).hT}°`))}
      ${row('fx_out', m => esc(outsOf(m)))}
      ${row('fx_ndi', m => esc(sp(m).ndi || t('none')))}
      ${row('fx_power', m => esc(sp(m).poe ? sp(m).poe + (sp(m).poeAC ? ' · AC' : '') : sp(m).pwr && P[sp(m).pwr] ? P[sp(m).pwr].name : sp(m).pwr || t('none')))}
      ${row('fx_max', m => esc(sp(m).res || t('none')))}
      ${row('fx_ctl', m => famOfM(m) === 'ptz' ? esc((sp(m).ctl || []).join(' · ')) : famOfM(m) === 'lens' ? esc(sp(m).mount + ' · ' + (sp(m).kit ? t('lensIncl', sp(m).kit.min + '–' + sp(m).kit.max + ' mm') : t('lensPick'))) : esc(t('none')))}
      ${row('fx_data', m => `${sp(m).approx ? `<span class="vf">${esc(t('verify'))}</span> ` : esc(t('verified')) + ' · '}${/^https?:/.test(sp(m).src || '') ? `<a href="${esc(sp(m).src)}" target="_blank" rel="noopener">${esc(t('src'))}</a>` : ''}`)}
      </tbody></table></div></div>`;
  }
  function lensChips(c, i) {
    const b = D.BODIES[c.m]; if (!b) return '';
    const ls = (b.kit ? ['kit'] : []).concat(lensesFor(b)), lg = longFor(b);
    if (!ls.length && !lg.length) ls.push('other');
    const lab = l => l === 'kit' ? t('lensKit', b.kit.min, b.kit.max) : l === 'other' ? t('lensOther') : mmTxt([D.LENSES[l].min, D.LENSES[l].max]) + (D.LENSES[l].mount !== b.mount ? ' · ' + D.LENSES[l].mount : '');
    const nm = l => l === 'kit' ? b.kit.name : l === 'other' ? t('lensOther') : P[l].brand + ' ' + P[l].name + ' · ' + usd(P[l].usd);
    const chip = l => `<button type="button" class="lchip${l === c.lens ? ' on' : ''}" data-lens="${i}:${l}" aria-pressed="${l === c.lens}" title="${esc(nm(l))}" aria-label="${esc(nm(l))}">${esc(lab(l))}${l !== 'kit' && l !== 'other' ? `<small>${usd0(P[l].usd)}</small>` : ''}</button>`;
    const ex = extsFor(c.lens), lz = D.LENSES[c.lens];
    const opt = ex.map(x => { const e = D.EXT[x], on = c.ext === x, nmx = e.builtin ? t('builtinExt') : P[x].name;
      return `<button type="button" class="lchip x${on ? ' on' : ''}" data-ext="${i}:${x}" aria-pressed="${on}" aria-label="${esc((e.builtin ? e.name : P[x].brand + ' ' + P[x].name + ' · ' + usd(P[x].usd)))}">${esc(t('extAdd', nmx))}${e.builtin ? '' : `<small>${usd0(P[x].usd)}</small>`}</button>`; })
      .concat(b.crop ? [`<button type="button" class="lchip x${c.crop ? ' on' : ''}" data-crop="${i}" aria-pressed="${!!c.crop}" title="${esc(b.crop.note || '')}">${esc(t('cropAdd', b.crop.label, (b.w / b.crop.w).toFixed(2)))}${b.crop.approx ? ` <span class="vf">${esc(t('verify'))}</span>` : ''}</button>`] : []);
    const fr = fRange(c.m, c.lens, c.ext), ap = apRange(c.m, c.lens, c.ext), apHi = ap ? Math.max(ap[0], ap[1]) : 0;
    const effS = mmTxt(fr) + (ap ? ' · ' + fmtFr(ap, lz && lz.cine) : '');
    const eff = (c.ext || c.crop || ap) && c.lens !== 'other' ? `<p class="leff meta-s">${esc(c.ext || c.crop ? t('effTxt', effS) : effS)}${c.crop && b.crop ? ' · ' + esc(b.crop.label) : ''}${apHi > (D.DIM_AP || 8) + 0.3 ? `<span class="ldim"><i aria-hidden="true"></i>${esc(t('dimTip'))}</span>` : ''}${lz && lz.adapter && lz.mount !== b.mount && P[lz.adapter] ? `<span class="ldim"><i aria-hidden="true"></i>${esc(t('adaptTip', P[lz.adapter].brand + ' ' + P[lz.adapter].name, lz.heavy))}</span>` : ''}</p>` : '';
    return `<div class="lchips" role="group" aria-label="${esc(t('lensK') + ' · CAM ' + (i + 1))}">
      ${ls.length ? `<span class="lnrow"><span class="meta-s">${esc(t('lensStd'))}</span>${ls.map(chip).join('')}</span>` : ''}
      ${lg.length ? `<span class="lnrow"><span class="meta-s">${esc(t('lensLong'))}</span>${lg.map(chip).join('')}</span>` : ''}
      ${opt.length ? `<span class="lnrow"><span class="meta-s"></span>${opt.join('')}</span>` : ''}
      ${eff}</div>`;
  }
  function posRow(c, i, n, L) {
    const p = P[c.m], role = posRole(L, i, n), s = slotOf(L, i, n);
    const tgt = typeof s.aim === 'number' && n > 1 ? L.ppl[s.aim] : null;
    const framing = !tgt ? PL.t('s_' + (s.shot === 'med' ? 'med' : 'wide')) + ' · ' + t('everyone') : PL.t('s_' + s.shot) + ' · ' + PL.pname(tgt.n);
    const rc = reach(L, i, n, c.k, c.m, c.lens, c.ext, c.crop), act = !Z.same && i === Z.pos;
    const sg = rc && rc.bad === 'far' && c.k === 'lens' ? suggest(c.m, L, i, n) : null;
    const sgName = sg ? [sg.lens === 'kit' ? D.BODIES[c.m].kit.name : P[sg.lens].name, sg.ext ? (D.EXT[sg.ext].builtin ? t('builtinExt') : P[sg.ext].name) : '', sg.crop ? D.BODIES[c.m].crop.label : ''].filter(Boolean).join(' + ') : '';
    const msg = rc && rc.bad === 'far' ? t('reachFar', PL.lenTxt(rc.fw), PL.pname(rc.nd.p.n)) : rc && rc.bad === 'narrow' ? t('reachNarrow', Math.round(rc.hi), Math.round(rc.nd.h)) : '';
    return `<li class="cpos-i${act || Z.same ? ' on' : ''}${c.own ? ' own' : ''}${msg ? ' bad' : ''}">
      <button type="button" class="cp-sel" data-pos="${i}" aria-pressed="${act}" aria-controls="cpick"><span class="cn">${i + 1}</span><span class="cp-r"><b>${esc(t('rl_' + role))}</b><span class="meta-s">${esc(framing)}</span></span></button>
      <span class="pk"><img src="${p.src}" alt=""></span>
      <span class="cp-m"><span class="cc-b">${esc(brandShort(p.brand))}</span><b>${esc(p.name)}</b><span class="meta-s">${c.own ? esc(t('youHaveS')) : usd(p.usd)}${specOf(c.m).approx ? ` <span class="vf">${esc(t('verify'))}</span>` : ''}</span></span>
      <span class="cp-tg"><label class="cp-own"><input type="checkbox" data-owncam="${i}"${c.own ? ' checked' : ''}><span class="box" aria-hidden="true"></span><span>${esc(t('haveCam'))}</span></label>
      ${c.k !== 'ptz' ? `<label class="cp-own"><input type="checkbox" data-mob="${i}"${c.mob ? ' checked' : ''}><span class="box" aria-hidden="true"></span><span>${esc(t('mob'))}</span></label>` : ''}</span>
      ${lensChips(c, i)}
      ${msg ? `<p class="cp-w"><i aria-hidden="true"></i><span>${esc(msg)}${sg ? `<button type="button" class="tbtn cp-fix" data-fix="${i}:${sg.lens}:${sg.ext || ''}:${sg.crop ? 1 : 0}">${esc(t('fixIt', sgName))} · ${esc(t('fixReach', PL.lenTxt(sg.fw)))}</button>` : ''}</span></p>` : rc && rc.ok && !rc.nd.wide ? `<p class="cp-ok meta-s">${esc(t('reachOk', PL.lenTxt(rc.fw), PL.lenTxt(rc.nd.d)))}</p>` : ''}
    </li>`;
  }
  function camSum() {
    const opts = options(), o = opts[shownId(opts)], ev = o.ev;
    const camLines = ev.bom.filter(l => l.g === 'cam' && !l.own && l.id && P[l.id]);
    return { o, ev, cam:camLines.reduce((a, l) => a + P[l.id].usd * l.qty, 0) };
  }
  function csum(lu) {
    const { o, ev, cam } = camSum(), L = layout(Z), n = lu.length;
    const q = id => ev.bom.filter(l => l.id === id && !l.own).reduce((a, l) => a + l.qty, 0);
    const ctlIds = ['rp60'].concat(Object.values(D.PTZCTL || {}));
    const cages = ev.bom.filter(l => l.g === 'mnt' && l.id && P[l.id] && P[l.id].subcat === 'Cages & rigs' && !l.own).reduce((a, l) => a + l.qty, 0);
    const tri = ev.bom.filter(l => l.g === 'mnt' && (l.id === 'ad01' || l.id === 'focus12') && !l.own).reduce((a, l) => a + l.qty, 0);
    const brk = ev.bom.filter(l => l.code === 'BRKT').reduce((a, l) => a + l.qty, 0);
    const enc = ev.bom.filter(l => l.code === 'NDI' && /encoder/i.test(l.name || '')).reduce((a, l) => a + l.qty, 0);
    const pwr = ev.bom.filter(l => l.g === 'net' && (l.code === 'PWR' || (l.id && P[l.id] && P[l.id].subcat === 'Batteries & power')) && !l.own).reduce((a, l) => a + l.qty, 0);
    const adds = [q('microconv') ? t('a_conv', q('microconv')) : '', ev.bom.some(l => ctlIds.includes(l.id) || l.code === 'CTRL') ? t('a_ctl') : '',
      ev.bom.some(l => l.g === 'net' && l.role === 'net') ? t('a_poe') : '', enc ? t('a_enc', enc) : '', cages ? t('a_cage', cages) : '', pwr ? t('a_pwr', pwr) : '',
      tri ? t('a_tri', tri) : '', brk ? t('a_brk', brk) : ''].filter(Boolean);
    const bad = lu.filter((c, i) => { const r = reach(L, i, n, c.k, c.m, c.lens, c.ext, c.crop); return r && r.bad; }).length;
    const tr = ev.tr === 'ip' ? 'IP / NDI' : ev.tr.toUpperCase();
    const ctlL = ev.bom.find(l => (l.id && l.id === (D.PTZCTL || {}).Canon) || (l.code === 'CTRL' && /Canon/.test(l.name || '')));
    if (ctlL) adds.unshift(t('oneCtl', ctlL.who.length) + ' · ' + (ctlL.id ? P[ctlL.id].name : 'RC-IP300'));
    return `<p class="meta"><span class="tally"></span>${esc(t('sumK'))} · ${n}</p>
      <h2>${esc(title(ev))}</h2>
      <dl class="csdl">
        <div><dt>${esc(t('sCams'))}</dt><dd><b class="price">${usd(cam)}</b><span class="meta-s">${esc(t('sCamsV'))}</span></dd></div>
        <div><dt>${esc(t('sSw'))}</dt><dd>${esc(switcherOf(ev))}</dd></div>
        <div><dt>${esc(t('sSig'))}</dt><dd>${esc(tr)} · ${esc(t('lng'))} ${esc(PL.lenTxt(ev.maxRun))}${o.forced ? ' · HDMI → SDI' : ''}</dd></div>
        ${adds.length ? `<div><dt>${esc(t('sAdds'))}</dt><dd>${adds.map(esc).join('<br>')}</dd></div>` : ''}
        <div class="tot"><dt>${esc(t('sPlan'))}</dt><dd><b class="price">${usd(ev.total)}</b><span class="meta-s">${esc(ev.quote.length === 1 ? t('plusQuote1') : t('plusQuote', ev.quote.length))}</span></dd></div>
      </dl>
      ${bad ? `<p class="warn"><i aria-hidden="true"></i><span>${esc(t(bad === 1 ? 'sWarn' : 'sWarnN', bad))}</span></p>` : ''}
      <p class="lsn meta-s">${esc(t('sNote'))}</p>`;
  }
  function picker(lu) {
    const n = lu.length, L = layout(Z), fam = famOf(Z), { list, total, tab, brands } = pickList();
    const ti = clamp(Z.pos, 0, n - 1), sel = new Set(Z.same ? lu.map(c => c.m) : [lu[ti].m]);
    const head = Z.same ? t('pickAll', n) : t('pickFor', ti + 1, t('rl_' + posRole(L, ti, n)));
    const chip = (attr, v, cur, label) => `<button type="button" class="chip" ${attr}="${v}" aria-pressed="${cur === v}">${esc(label)}</button>`;
    return `<section class="cpick" id="cpick" aria-labelledby="cpick-h">
      <div class="cpick-hd"><h2 id="cpick-h">${esc(head)}</h2><p class="meta-s" aria-live="polite">${esc(t('shown', list.length, total))}</p></div>
      ${n > 1 ? `<div class="seg sm cpsw" role="group" aria-label="${esc(t('posSw'))}">${lu.map((c, i) => `<button type="button" data-psw="${i}" aria-pressed="${!Z.same && i === ti}">CAM ${i + 1}</button>`).join('')}<button type="button" data-psw="all" aria-pressed="${!!Z.same}">${esc(t('posAll'))}</button></div>` : ''}
      ${fam === 'mix' ? `<div class="seg ctabs" role="group" aria-label="${esc(t('camType'))}">${['all', 'ptz', 'cc', 'lens'].map(f => `<button type="button" data-tab="${f}" aria-pressed="${tab === f}">${esc(f === 'all' ? t('tab_all') : t('f_' + f))}</button>`).join('')}</div>` : ''}
      <div class="cflt">
        <div class="cf" role="group" aria-label="${esc(t('fltBrand'))}"><span class="meta-s">${esc(t('fltBrand'))}</span>${chip('data-fb', '', UI.b, t('all'))}${brands.map(b => chip('data-fb', b, UI.b, brandShort(b))).join('')}</div>
        <div class="cf" role="group" aria-label="${esc(t('fltOut'))}"><span class="meta-s">${esc(t('fltOut'))}</span>${chip('data-fo', '', UI.o, t('any'))}${chip('data-fo', 'sdi', UI.o, 'SDI')}${chip('data-fo', 'hdmi', UI.o, 'HDMI')}${chip('data-fo', 'ip', UI.o, 'NDI / IP')}</div>
        <div class="cf" role="group" aria-label="${esc(t('fltPrice'))}"><span class="meta-s">${esc(t('fltPrice'))}</span>${chip('data-fp', '', UI.p, t('any'))}${chip('data-fp', '1', UI.p, t('p1'))}${chip('data-fp', '2', UI.p, t('p2'))}${chip('data-fp', '3', UI.p, t('p3'))}</div>
      </div>
      ${compare()}
      ${list.length ? `<ul class="ccards">${list.map(c => camCard(c, sel, n, ti)).join('')}</ul>` : `<p class="cnone meta-s">${esc(t('noneMatch'))} <button type="button" class="textlink sm" data-freset>${esc(t('resetF'))}</button></p>`}
    </section>`;
  }
  function step3() {
    const fam = famOf(Z), lu = lineupShown(), L = layout(Z), n = lu.length;
    Z.pos = clamp(Z.pos, 0, n - 1);
    return `<div class="cfam" role="radiogroup" aria-label="${esc(t('camType'))}">${FAMS.map((f, i) => famCard(f, i, fam)).join('')}</div>
      <div class="cgrid">
        <div class="cposw">
          <div class="cposh"><h2 class="meta"><span class="tally"></span>${esc(t('posK'))}</h2>
            <div class="cposc"><span class="meta-s">${esc(t('nCams'))}</span><span class="step"><button type="button" data-cn="-1" aria-label="${esc(t('nCams'))} −1"${n <= 1 ? ' disabled' : ''}>${icon('minus')}</button><output aria-live="polite">${n}</output><button type="button" data-cn="1" aria-label="${esc(t('nCams'))} +1"${n >= 4 ? ' disabled' : ''}>${icon('plus')}</button></span>
            <label class="csame"><input type="checkbox" id="wz-same"${Z.same ? ' checked' : ''}><span class="box" aria-hidden="true"></span><span>${esc(t('sameAll'))}</span></label></div></div>
          <ol class="cpos">${lu.map((c, i) => posRow(c, i, n, L)).join('')}</ol>
        </div>
        <aside class="csum" id="wz-csum" aria-label="${esc(t('sumK'))}">${csum(lu)}</aside>
        ${picker(lu)}
      </div>`;
  }

  /* ----- step 4 (round 3): production + lights ----- */
  const ROLL = { cam:['cam'], prod:['sw', 'mon', 'aud', 'net'], lit:['lit'], cab:['cab', 'mnt'], svc:['svc'] };
  function rollup(bom) {
    const o = {}; Object.keys(ROLL).forEach(k => { const ls = bom.filter(l => !l.info && ROLL[k].includes(l.g === 'net' && l.code === 'PWR' && l.why === PL.t('w_npf') ? 'net' : l.g));
      o[k] = { tot:ls.filter(l => !l.own && l.id && P[l.id]).reduce((a, l) => a + P[l.id].usd * l.qty, 0), q:ls.filter(l => !l.own && !(l.id && P[l.id])).length }; });
    return o;
  }
  const rollHTML = bom => { const r = rollup(bom); return `<div class="roll">${Object.keys(ROLL).map(k => `<div><span class="meta">${esc(t('roll_' + k))}</span><b class="price">${usd(r[k].tot)}</b><span class="meta-s">${r[k].q ? esc(t('rollQ', r[k].q)) : '&nbsp;'}</span></div>`).join('')}</div>`; };
  function chain(ev, pr) {
    const sw = ev.bom.filter(l => l.g === 'sw' && (l.role === 'sw')).map(l => l.id && P[l.id] ? P[l.id].name : l.name)[0] || '—';
    const ids = ev.bom.map(l => l.id), nm = id => P[id] ? P[id].name : id, X = D.PROD;
    const swId = (ev.bom.find(l => l.g === 'sw' && l.role === 'sw' && l.id) || {}).id;
    const wl = ev.cams.filter(c => c.mob && c.k !== 'ptz').length, outs = [];
    const pc = pr.how === 'pc';
    if (pr.st > 0) outs.push(['o_stream', pr.st >= 2 ? t('cut_pgm') + ' · ' + t('cut_dests', '2+') : t('cut_pgm'), ids.includes(X.enc) ? t('viaEnc', nm(X.enc)) : pc ? 'vMix / OBS' : t('builtIn')]);
    if (pr.scr !== 'none' && pr.scr !== 'overflow') outs.push(['o_screen', t('scr_' + pr.scr) + ' · ' + (pr.feed === 'same' ? t('cut_pgm') : pr.feed === 'aux' ? t('cut_aux') : pc ? t('cut_mix2') : t('cut_mix')), '']);
    if (pr.scr === 'overflow') outs.push(['o_over', t('cut_pgm'), t('viaEnc', nm(X.dec))]);
    if (pr.rec !== 'none') outs.push(['o_rec', pr.rec === 'iso' ? t('cut_iso') : t('cut_pgm'), ids.includes(X.rec1) ? t('viaRec', nm(X.rec1)) : pc ? 'vMix / OBS' : t('builtIn')]);
    return `<figure class="sigch" aria-label="${esc(t('chainK'))}">
      <div class="ch-col ch-cams"><span class="meta">${esc(t('chCams'))}</span>${ev.cams.map((c, i) => `<span class="ch-n${c.mob && c.k !== 'ptz' ? ' wl' : ''}"><b>${i + 1}</b>${esc(P[c.m] ? P[c.m].name : c.m)}${c.mob && c.k !== 'ptz' ? ' · ' + esc(t('chWl', '')) : ''}</span>`).join('')}</div>
      <div class="ch-arw" aria-hidden="true"></div>
      <div class="ch-col ch-sw"><span class="meta">${esc(pc ? t('how_pc') : t('sSw'))}</span><b>${esc(sw)}</b><span class="meta-s">${esc(ev.tr === 'ip' ? 'IP / NDI' : ev.tr.toUpperCase())}${wl ? ' · ' + esc(t('chWl', wl)) : ''}</span></div>
      <div class="ch-arw" aria-hidden="true"></div>
      <div class="ch-col ch-outs"><span class="meta">${esc(t('chOut'))}</span>${outs.length ? outs.map(([k, cut, via]) => `<span class="ch-o"><b>${esc(t(k))}</b><span>${esc(cut)}</span>${via ? `<span class="meta-s">${esc(via)}</span>` : ''}</span>`).join('') : '<span class="ch-o"><span class="meta-s">—</span></span>'}</div>
    </figure>`;
  }
  /* round 4: lighting by role; each role shows its pick (any brand) and a picker of the store's lights */
  const LUI = { role:null, b:'' };
  function lightRoles(lt, LC) {
    const RL = (LC && LC.roles) || {}, look = t('look_' + ((LC && LC.look) || 'std'));
    /* the dimmer the plan sets for this role (installers dial it), or why it can't */
    const dimLine = role => { const r = RL[role]; if (!r || !r.data) return '';
      if (r.st === 'short') return `<span class="lr-no lr-dim meta-s">${esc(t('dimShort'))}${r.alt && P[r.alt] ? ' ' + esc(t('dimAlt', P[r.alt].name)) : ''}</span>`;
      if (r.st === 'tiny') return `<span class="lr-dim meta-s">${esc(t('dimTiny', r.rawPct))}</span>`;
      return `<span class="lr-dim meta-s"><b>${esc(t('dimK'))} ${esc(r.pct)}</b> · ${esc(t('lookFor', look))}</span>`; };
    const plan = D.lightPlan({ ...lt, k:Z.k, big: Z.k === 'church' && Z.w * Z.d > 450 ? 1 : 0 }, Z.n), dmx = lt.ctl === 'dmx' || lt.ctl === 'crmx';
    const spec = sp => [sp.bi ? 'bi-colour' : sp.rgb ? 'colour' : '', '≥ ' + Math.round(sp.min / 9).toLocaleString('en-US') + ' lx at 3 m', sp.quiet ? 'quiet' : '', dmx ? 'DMX' : ''].filter(Boolean).join(' · ');
    const fact = id => { const f = D.FIXT[id]; return f && f.lux1 ? `${Math.round(f.lux1 / 9).toLocaleString('en-US')} lx at 3 m · ${f.W} W${f.dmx ? ' · DMX' : ' · no DMX'}${f.quiet ? ' · quiet' : ''}` : 'no published data'; };
    const rows = plan.map(r => { const p = r.id && P[r.id];
      return `<li class="lr${LUI.role === r.role ? ' on' : ''}"><span class="lr-r"><b>${esc(PL.t('w_l_' + r.role))}</b><span class="meta-s">${r.q} × · ${esc(spec(r.spec))}</span></span>
        ${p ? `<span class="pk"><img src="${p.src}" alt=""></span><span class="lr-m"><span class="cc-b">${esc(p.brand)}</span><b>${esc(p.name)}</b><span class="meta-s">${esc(fact(r.id))} · ${usd(p.usd)}</span>${r.ok ? `<span class="lr-ok meta-s">${esc(r.auto ? 'meets the spec · cheapest store listing' : 'meets the spec')}</span>` : `<span class="lr-no meta-s">${esc(D.FIXT[r.id] && D.FIXT[r.id].lux1 ? 'below the spec' : t('noDataSite'))}</span>`}${dimLine(r.role)}</span>`
          : `<span class="lr-m"><b>${esc('No store listing meets the spec · to quote')}</b></span>`}
        <button type="button" class="tbtn lr-sw" data-lrole="${r.role}" aria-expanded="${LUI.role === r.role}">${esc(LUI.role === r.role ? 'Close' : 'Swap')}</button></li>`; }).join('');
    let pick = '';
    if (LUI.role) { const pool = D.lightPool(), brands = [...new Set(pool.map(id => P[id].brand))].sort(), cur = (plan.find(r => r.role === LUI.role) || {}).id;
      const list = pool.filter(id => !LUI.b || P[id].brand === LUI.b).sort((a, b) => P[a].usd - P[b].usd).slice(0, 24);
      const rs = plan.find(r => r.role === LUI.role).spec;
      pick = `<div class="lpick"><div class="cf" role="group" aria-label="Brand"><span class="meta-s">Brand</span><button type="button" class="chip" data-lb="" aria-pressed="${!LUI.b}">All</button>${brands.map(b => `<button type="button" class="chip" data-lb="${esc(b)}" aria-pressed="${LUI.b === b}">${esc(b)}</button>`).join('')}</div>
        <ul class="ccards">${list.map(id => { const p = P[id], ok = D.meets(id, rs, dmx);
          return `<li class="ccard${id === cur ? ' on' : ''}"><span class="pk"><img src="${p.src}" alt="" loading="lazy"></span><div class="cc-t"><span class="cc-b">${esc(p.brand)}</span><b>${esc(p.name)}</b><span class="cc-tags">${ok ? '<span class="cc-badge">meets spec</span>' : D.FIXT[id] && D.FIXT[id].lux1 ? '<span class="cc-badge">below spec</span>' : '<span class="vf">no published data</span>'}</span></div>
            <dl class="cc-f"><div><dt>Light</dt><dd>${esc(fact(id))}</dd></div></dl><p class="cc-p"><b class="price">${usd(p.usd)}</b><span class="meta-s">${esc(t('beforeTax'))}</span></p>
            <div class="cc-a"><button type="button" class="btn sm${id === cur ? ' solid' : ''}" data-lpick="${id}" aria-pressed="${id === cur}">${id === cur ? '✓ In the plan' : 'Use for ' + esc(PL.t('w_l_' + LUI.role).toLowerCase())}</button></div></li>`; }).join('')}</ul></div>`; }
    return `<ul class="lroles">${rows}</ul>${pick}`;
  }
  function stepProd() {
    const pr = prOf(Z), lt = ltOf(Z), opts = options(), o = opts[shownId(opts)], ev = o.ev;
    const q = (key, k, vals, cur, sub) => `<div class="fq pq"><span class="ql">${esc(t(key))}${sub ? `<span class="meta-s">${esc(sub)}</span>` : ''}</span><span class="seg" role="group" aria-label="${esc(t(key))}">${vals.map(v => `<button type="button" data-pr="${k}:${v}" aria-pressed="${String(cur) === String(v)}">${esc(t(k + '_' + v))}</button>`).join('')}</span></div>`;
    const lq = (key, k, vals, cur) => `<div class="fq pq"><span class="ql">${esc(t(key))}</span><span class="seg" role="group" aria-label="${esc(t(key))}">${vals.map(v => `<button type="button" data-lt="${k}:${v}" aria-pressed="${String(cur) === String(v)}">${esc(t(v === 1 ? 'yesLights' : v === 0 ? 'noLights' : v === 2 ? 'unsureLights' : k + '_' + v))}</button>`).join('')}</span></div>`;
    const scr = pr.scr !== 'none';
    const checks = ev.checks.filter(c => c.lvl !== 'ok' && /screen|telão|cut|corte|aux|stream|transm|multiview|DMX|Companion|vMix|app|spec|wireless|sem fio|ProPresenter/i.test(c.txt)).slice(0, 6);
    return `<div class="pgrid4">
      <div class="pform">
        <h2 class="meta lh4"><span class="tally"></span>${esc(t('st4'))}</h2>
        ${q('q_rec', 'rec', ['none', 'pgm', 'iso'], pr.rec)}
        ${q('q_st', 'st', [0, 1, 2], pr.st)}
        ${q('q_scr', 'scr', ['none', 'led', 'proj', 'overflow'], pr.scr)}
        ${scr && pr.scr !== 'overflow' ? `<fieldset class="fs pfeed"><legend class="meta">${esc(t('q_feed'))}</legend><div class="cds">${['same', 'aux', 'mix'].map((f, i) => `<button type="button" class="cd${pr.feed === f ? ' on' : ''}" data-pr="feed:${f}" aria-pressed="${pr.feed === f}"><span class="n">${String(i + 1).padStart(2, '0')}<i aria-hidden="true"></i></span><b>${esc(t('feed_' + f))}</b><span class="meta-s">${esc(t('fd_' + f))}</span></button>`).join('')}</div></fieldset>` : ''}
        ${q('q_gfx', 'gfx', ['none', 'lower', 'lyrics'], pr.gfx, pr.gfx === 'lyrics' ? t('gfxNote') : '')}
        ${q('q_how', 'how', ['hw', 'pc'], pr.how, pr.how === 'pc' ? t('howNote') : '')}
        ${pr.how === 'hw' ? q('q_pnl', 'pnl', ['none', 'yes'], pr.pnl || 'none', t('pnlNote')) : ''}
        ${ev.cams.filter(c => P[c.m] && P[c.m].brand === 'Canon' && (c.k === 'ptz' || (D.CANON_IP || []).includes(c.m))).length >= 2 && ev.cams.some(c => c.k === 'ptz' && P[c.m].brand === 'Canon') ? q('q_cctl', 'cctl', ['auto', '300', '1000'], pr.cctl || 'auto', t('cctlNote')) : ''}
        ${q('q_lvl', 'lvl', ['s', 'm', 'p'], pr.lvl)}
        <h2 class="meta lh4"><span class="tally"></span>${esc(t('lightK'))}</h2>
        ${lq('q_lights', 'on', [1, 0, 2], lt.on)}
        ${lt.on === 1 ? lightRoles(lt, ev.light) : ''}
        ${lt.on === 1 ? lq('q_ctl', 'ctl', ['app', 'dmx', 'crmx'], lt.ctl) : ''}
        ${lt.on === 1 && lt.ctl !== 'app' ? lq('q_ctrl', 'ctrl', ['vp', 'splay'], lt.ctrl || 'vp') : ''}
        ${lt.on === 1 && lt.ctl !== 'app' ? `<div class="fq pq"><span class="ql">${esc(t(Z.k === 'podcast' ? 'q_relay' : 'q_panel'))}<span class="meta-s">${esc(t(Z.k === 'podcast' ? 'panelNoteP' : 'panelNote'))}</span></span>
          <label class="csame"><input type="checkbox" data-ltc="${Z.k === 'podcast' ? 'relay' : 'panel'}"${(Z.k === 'podcast' ? lt.relay : lt.panel) ? ' checked' : ''}><span class="box" aria-hidden="true"></span><span>${esc(t('yes'))}</span></label></div>
          ${lt.panel && Z.k !== 'podcast' ? lq('q_ptype', 'ptype', ['kiosc', 'ipad', 'bstation'], lt.ptype || 'kiosc') : ''}
          <p class="meta-s pnote">${esc(t('noArt'))}</p>` : ''}
      </div>
      <aside class="psum4" aria-label="${esc(t('chainK'))}">
        <p class="meta"><span class="tally"></span>${esc(t('chainK'))}</p>
        ${chain(ev, pr)}
        ${checks.length ? `<ul class="checks pchecks">${checks.map(c => `<li class="${c.lvl}"><i aria-hidden="true"></i><span>${esc(c.txt)}</span></li>`).join('')}</ul>` : ''}
        ${rollHTML(ev.bom)}
        <p class="ptot4"><b class="price">${usd(ev.total)}</b><span class="meta-s">${esc(t('priced'))} · ${esc(ev.quote.length === 1 ? t('plusQuote1') : t('plusQuote', ev.quote.length))}</span></p>
      </aside>
    </div>`;
  }

  /* ----- step 5: budget ----- */
  function step4() {
    const opts = options();
    const pick = pickFor(opts);
    if (!Z.om || !Z.o || !opts[Z.o]) Z.o = pick;
    const bi = Z.b ? BUDGETS.reduce((bi, v, i) => Math.abs(v - Z.b) < Math.abs(BUDGETS[bi] - Z.b) ? i : bi, 0) : 8;
    const chips = [['b1', 5000], ['b2', 15000], ['b3', 40000], ['b4', 75000]];
    const allOver = Z.b && TIERS.every(k => opts[k].ev.total > Z.b);
    const P0 = opts[pick];
    return `<div class="bud">
      <div class="bset">
        <p class="meta">${esc(t('budget'))}</p>
        <p class="bval"><span class="meta-s">${esc(Z.b ? t('upTo') : '')}</span><b class="price" id="wz-bval">${Z.b ? usd0(Z.b) : esc(t('noBudgetSet'))}</b></p>
        <input type="range" id="wz-b" min="0" max="${BUDGETS.length - 1}" step="1" value="${bi}" aria-label="${esc(t('budget'))}" aria-valuetext="${Z.b ? usd0(Z.b) : esc(t('noBudgetSet'))}">
        <div class="chips">${chips.map(([k, v]) => `<button type="button" class="chip" data-b="${v}" aria-pressed="${Z.b === v}">${esc(t(k))}</button>`).join('')}<button type="button" class="chip" data-b="0" aria-pressed="${!Z.b}">${esc(t('noBudgetSet'))}</button></div>
      </div>
      <div class="brec"><p class="meta"><span class="tally"></span>${esc(t(Z.b ? 'recFor' : 'recNo'))} · ${esc(t('t_' + pick))}</p>
        <h2>${esc(title(P0.ev))}</h2>
        <p>${esc(whyFormat(P0))}</p><p class="dim">${esc(whyCams(P0.ev))}</p>
        ${allOver ? `<p class="warn"><i aria-hidden="true"></i>${esc(t('allOver', usd0(opts.e.ev.total - Z.b)))}</p>` : ''}
      </div>
    </div>
    <fieldset class="haves4"><legend class="meta">${esc(t('haveK'))}<span class="meta-s">${esc(t('haveL'))}</span></legend>
      <div class="hv">${OWN.map(r => `<label class="have sm${Z.ow.includes(r) ? ' on' : ''}"><input type="checkbox" data-ow="${r}"${Z.ow.includes(r) ? ' checked' : ''}><span class="box" aria-hidden="true"></span>${gly(r)}<b>${esc(t('o_' + r))}</b></label>`).join('')}</div>
    </fieldset>
    <div class="opts" role="radiogroup" aria-label="${esc(t('st4'))}">${order().map((k, i) => optCard(opts[k], i, k === pick, k === Z.o)).join('')}</div>
    <p class="meta-s fnote">${esc(t('footP'))}${Z.pl ? ' ' + esc(t('redraw')) : ''}</p>`;
  }
  function optCard(o, i, isPick, isSel) {
    const ev = o.ev, nm = o.id === 's' ? (window.I9S.SET[o.setup] || {}).title : t('t_' + o.id);
    const pk = [...new Set(ev.bom.filter(l => l.id && P[l.id] && !l.own && ['cam', 'sw', 'net', 'aud', 'mnt'].includes(l.g)).sort((a, b) => ['cam', 'sw', 'net', 'aud', 'mnt'].indexOf(a.g) - ['cam', 'sw', 'net', 'aud', 'mnt'].indexOf(b.g)).map(l => l.id))].slice(0, 3);
    return `<div class="opt${isSel ? ' on' : ''}" data-opt="${o.id}">
      <div class="oh"><span class="n meta">${String(i + 1).padStart(2, '0')} · ${esc(o.id === 's' ? t('t_s') : t('t_' + o.id))}</span>${isPick ? `<span class="pk meta">${esc(t('pick'))}</span>` : ''}</div>
      <h3>${esc(o.id === 's' ? nm : title(ev))}</h3>
      <div class="pks" aria-hidden="true">${pk.map(id => `<span class="pk"><img src="${P[id].src}" alt="" loading="lazy"></span>`).join('')}</div>
      <dl class="ospec"><div><dt>${esc(t('sw'))}</dt><dd>${esc(switcherOf(ev))}</dd></div><div><dt>${esc(t('lng'))}</dt><dd>${esc(PL.lenTxt(ev.maxRun))} · ${ev.tr === 'ip' ? 'Cat6' : ev.tr === 'hdmi' ? 'HDMI' : 'SDI'}</dd></div></dl>
      <p class="ot"><b class="price">${usd(ev.total)}</b><span class="meta-s">${esc(t('priced'))}</span></p>
      <p class="oq meta-s"><span><i class="qd"></i>${esc(ev.quote.length === 1 ? t('plusQuote1') : t('plusQuote', ev.quote.length))}</span>${ev.owned.length ? `<span><i class="ow"></i>${esc(t('youHaveN', ev.owned.length))}</span>` : ''}</p>
      ${fitHTML(ev.total, Z.b)}
      <button type="button" class="btn ${isSel ? 'solid' : ''} osel" data-choose="${o.id}" role="radio" aria-checked="${isSel}">${isSel ? '✓ ' + esc(t('chosen')) : esc(t('choose')) + ' ' + esc(o.id === 's' ? t('t_s') : t('t_' + o.id))}</button>
    </div>`;
  }

  /* ----- step 5: the plan ----- */
  function step5() {
    return `<div class="pgrid"><div class="pcol" id="wz-plan-slot"><p class="meta-s khint2">${esc(t('dragHint'))}</p></div><aside class="pside" id="wz-side">${side5()}</aside></div>`;
  }
  function side5() {
    const S = PL.state, tt = PL.tally(), opts = OPT_CACHE.opts, o = opts && opts[Z.o];
    const sel = PL.sel && PL.sel.kind === 'cam' ? PL.sel.i : -1;
    const warns = PL.checks.filter(c => c.lvl === 'warn');
    const ev = { tr:S.tr, n:S.cams.length, cams:S.cams.map(c => ({ k:c.k, m:c.m, own:!!c.own })), maxRun:S.cams.length ? Math.max(...S.cams.map(PL.runOf)) : 0 };
    const changed = Z.ap && Z.apk !== hashOf(PL.planKey());
    const nm = Z.o === 's' ? t('fromSetup') : t('t_' + (Z.o || 'r'));
    return `<p class="meta"><span class="tally"></span>${esc(t('yourPlan'))} · ${esc(nm)}</p>
      <h2>${esc(title(ev))}</h2>
      <p class="why">${esc(whyFormat({ ev, forced: o && o.forced && S.tr === 'sdi' }))}</p>
      <h3 class="meta">${esc(t('camsK'))}</h3>
      <ul class="pcams">${S.cams.map((c, i) => { const v = PL.view(c); return `<li><button type="button" data-cam5="${i}" aria-pressed="${i === sel}"><span class="cn">${i + 1}</span><span class="ci"><b>${esc(PL.modelName(c))}</b><span class="meta-s">${esc(v.cls ? PL.t('s_' + v.cls) + (v.tg ? ' · ' + PL.pname(v.tg.p.n) : '') : PL.t('noTarget'))} · ${esc(PL.runCable(c))} ${esc(PL.lenTxt(PL.runOf(c)))}</span></span>${c.own ? `<span class="yh meta">${esc(t('youHave'))}</span>` : ''}</button></li>`; }).join('')}</ul>
      <h3 class="meta">${esc(t('toKnow'))}</h3>
      <ul class="checks pchecks">${warns.length ? warns.map(c => `<li class="warn"><i aria-hidden="true"></i><span>${esc(c.txt)}</span></li>`).join('') : `<li class="ok lead"><i aria-hidden="true"></i><span>${esc(t('allFits'))}</span></li>`}</ul>
      <div class="ptot"><p><b class="price">${usd(tt.total)}</b><span class="meta-s">${esc(tt.quote.length === 1 ? t('plusQuote1') : t('plusQuote', tt.quote.length))}${tt.owned.length ? ' · ' + esc(t('youHaveN', tt.owned.length)) : ''}</span></p>${fitHTML(tt.total, Z.b)}</div>
      <div class="pacts">
        ${Z.ap && !changed ? `<p class="apd meta"><span class="tally"></span>${esc(t('approved'))}</p>` : changed ? `<p class="apd ch meta">${esc(t('changedSince'))}</p>` : ''}
        <button type="button" class="btn sig" id="wz-approve">${esc(Z.ap && !changed ? t('st6') : t('approve'))}${icon('arrow-right')}</button>
        <button type="button" class="btn" id="wz-fine">${esc(t('fineTune'))}</button>
      </div>`;
  }

  /* ----- step 6: 3D ----- */
  const G3UI = { vf: !matchMedia('(max-width:699px)').matches, mv:false, fr:false, q:'auto', det:false };
  function step6() {
    const S = PL.state, lt = S.lt;
    const tb = (id, on, label) => `<button type="button" class="tbtn pv3-t" data-g3="${id}" aria-pressed="${!!on}">${esc(label)}</button>`;
    return `<div class="g3">
      <div class="g3bar"><div class="seg sm g3v" role="group" aria-label="${esc(t('st7'))}"><button type="button" data-v3="o" aria-pressed="true">${esc(t('overview'))}</button>${S.cams.map((c, i) => `<button type="button" data-v3="${i}" aria-pressed="false">${esc(PL.camLab(i))}</button>`).join('')}</div>
        ${tb('vf', G3UI.vf, t('vfB'))}${tb('mv', G3UI.mv, t('mvB'))}${tb('fr', G3UI.fr, t('frB'))}
        <span class="seg sm pv3-q" role="group" aria-label="${esc(t('qB'))}"><button type="button" data-g3q="auto" aria-pressed="${G3UI.q === 'auto'}">${esc(t('qB'))} · ${esc(t('qAuto'))}</button><button type="button" data-g3q="low" aria-pressed="${G3UI.q === 'low'}">${esc(t('qLow'))}</button></span>
        <button type="button" class="tbtn" id="g3-reset">${esc(t('reset'))}</button><span class="meta-s g3h">${esc(t('g3dHint'))}</span></div>
      <div class="g3box" id="g3box"><div class="g3msg" id="g3msg"><span class="meta"><span class="tally"></span>${esc(t('loading3d'))}</span></div><p class="g3pov meta" id="g3pov" hidden></p></div>
      <div class="pv3-read" id="pv3-read">${readouts()}</div>
      <p class="meta-s g3note">${esc(t('g3dNote'))}</p>
    </div>`;
  }
  /* the readouts work without WebGL: they come from planner.js's light model, not from the render.
     Default view (customers): the Look, one plain line per person, the dimmer per light (installers), power at the set level.
     Exact lux, ratio, colour, EV and the per-camera exposure check sit under "Details". print = the PDF (details open). */
  function readouts(print) {
    const L = PL.lightCalc(); if (!L) return `<p class="meta-s pv3-none">${esc(t('rdNone'))}</p>`;
    const n0 = v => Math.round(v).toLocaleString('en-US'), S = PL.state, lt = S.lt || {};
    const who = i => { const n = S.ppl[i].n, nm = PL.pname(n); return PL.lang !== 'pt' && /^p_(?!person)/.test(n) ? t('the') + nm.toLowerCase() : nm; };
    const stTxt = sj => sj.st === 'cam' ? t('st_cam', (sj.cams || []).map(i => PL.camLab(i)).join(', ')) : t('st_' + sj.st);
    const subj = sj => `<li class="${sj.st === 'ok' ? 'ok' : sj.st === 'nodata' ? 'nd' : 'bad'}" data-subj="${sj.i}"><i aria-hidden="true"></i><span><b>${esc(t('lightOn', who(sj.i)))}</b> ${esc(stTxt(sj))}${sj.st === 'ok' ? ' <span class="ck" aria-hidden="true">✓</span>' : ''}</span></li>`;
    const order = ['key', 'fill', 'wash', 'back', 'bg'], R = Object.values(L.roles).sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role));
    const dim = r => `<li data-dim="${r.role}" class="${r.st === 'short' ? 'bad' : r.data ? '' : 'nd'}"><b>${esc(PL.t('r_' + r.role))}</b><span class="meta-s">${r.n} × ${esc(P[r.id] ? P[r.id].name : r.id)}</span>
        <span class="xv">${esc(!r.data ? t('noDataSite') : r.st === 'short' ? t('dimFull') : r.pct)}</span></li>`;
    const cam = r => { const c = S.cams[r.i], nm = PL.camLab(r.i) + ' · ' + (P[c.m] ? P[c.m].name : c.m);
      if (r.lux == null) return `<li><b>${esc(nm)}</b><span class="meta-s">${esc(t('rdNoT'))}</span></li>`;
      if (r.need == null) return `<li><b>${esc(nm)}</b><span class="meta-s">${esc(n0(r.lux))} lx · ${esc(t('rdAuto'))}</span></li>`;
      return `<li class="${r.ok ? 'ok' : 'bad'}" data-exp="${r.i}"><b>${esc(nm)} · ${esc(PL.fNum(r.N))}</b><span class="meta-s">${esc(t('rdNeeds', n0(r.need), n0(r.lux)))}</span><span class="xv">${esc(r.ok ? t('rdOk') : t('rdLow'))}</span></li>`; };
    const looks = ['soft', 'std', 'tv'], lk = t('look_' + L.look);
    return `<div class="pv3-r pv3-subj"><div class="pv3-lh"><p class="meta"><span class="tally"></span>${esc(t('onCam'))}</p>
        ${print ? `<p class="meta-s">${esc(t('lookK'))} · ${esc(lk)}</p>` : `<span class="seg sm pv3-look" role="group" aria-label="${esc(t('lookK'))}">${looks.map(v => `<button type="button" data-look="${v}" aria-pressed="${L.look === v}">${esc(t('look_' + v))}</button>`).join('')}</span>`}</div>
        <ul class="pv3-sl">${L.subjects.map(subj).join('')}</ul>${print ? '' : `<p class="meta-s pv3-lhint">${esc(t('lookHint'))}</p>`}</div>
      <div class="pv3-r pv3-dims"><p class="meta">${esc(t('dimsK'))}</p><p class="meta-s pv3-ds">${esc(t('dimsSub', lk.toLowerCase()))}</p><ul>${R.map(dim).join('')}</ul></div>
      <div class="pv3-r"><p class="meta">${esc(t('rdPow'))}</p><p class="pv3-pw"><b id="pv3-pw">${esc(t('rdPowV', n0(L.Wset), (Math.round(L.Aset * 10) / 10).toFixed(1)))}</b></p><p class="meta-s">${esc(t('rdPowSet', n0(L.W)))}${L.noData ? ' ' + esc(t('rdPowNo', L.noData)) : ''}</p></div>
      <details class="pv3-det" id="pv3-det"${print || G3UI.det ? ' open' : ''}><summary class="meta"><span>${esc(t('detK'))}</span></summary>
        ${print ? '' : `<div class="pv3-sc"><span class="seg sm" role="group" aria-label="${esc(t('isoK'))}"><span class="meta-s">${esc(t('isoK'))}</span>${[400, 800, 1600, 3200].map(v => `<button type="button" data-iso="${v}" aria-pressed="${(lt.iso || 800) === v}">${v}</button>`).join('')}</span>
          <span class="seg sm" role="group" aria-label="${esc(t('cctK'))}"><span class="meta-s">${esc(t('cctK'))}</span>${[3200, 4300, 5600].map(v => `<button type="button" data-cct="${v}" aria-pressed="${(lt.cct || 5600) === v}">${v}K</button>`).join('')}</span></div>`}
        <div class="pv3-dg"><div class="pv3-r"><p class="meta">${esc(t('rdPres', PL.pname(S.ppl[0].n)))}</p>
          <dl><div><dt>${esc(t('rdKey'))}</dt><dd><b>${esc(n0(L.key))} lx</b></dd></div><div><dt>${esc(t('rdFill'))}</dt><dd><b>${L.fill > 0.5 ? esc(n0(L.fill)) + ' lx' : esc(t('noFill'))}</b></dd></div>
            <div><dt>${esc(t('rdRatio'))}</dt><dd><b>${L.ratio ? esc(L.ratio.toFixed(1)) + ' : 1' : '—'}</b></dd></div><div><dt>${esc(t('rdBack'))}</dt><dd><b>${L.back > 0.5 ? esc(n0(L.back)) + ' lx' : '—'}</b></dd></div>
            <div><dt>${esc(t('rdCct'))}</dt><dd><b>${esc(L.cct)}K</b></dd></div><div><dt>${esc(t('rdEv'))}</dt><dd><b>${L.ev != null ? 'EV ' + esc(L.ev.toFixed(1)) : '—'}</b> <span class="meta-s">ISO 100</span></dd></div>
            <div><dt>${esc(t('rdTgt'))}</dt><dd><b>${esc(n0(L.target))} lx</b> <span class="meta-s">${esc(n0(Math.round(L.band[0] / 10) * 10))}–${esc(n0(Math.round(L.band[1] / 10) * 10))}</span></dd></div></dl></div>
          <div class="pv3-r pv3-rx"><p class="meta">${esc(t('rdExp', L.iso))}</p><ul>${L.cams.map(cam).join('')}</ul></div></div>
        <p class="meta-s pv3-rn">${esc(t('rdNote'))}</p></details>`;
  }
  /* "C50 · S35 crop · 400 mm" / "UE50KPJ · 20.0×": what the viewfinder is looking through */
  function vfLabel(c) {
    const nm = P[c.m] ? P[c.m].name.replace(/^EOS /, '') : c.m;
    if (c.k === 'lens') return `${nm}${c.crop ? ' · S35 crop' : ''} · ${Math.round(c.f)} mm${c.ext && D.EXT[c.ext] ? ' (' + D.EXT[c.ext].x + '×)' : ''}`;
    return `${nm} · ${PL.zoomX(c).toFixed(1)}×`;
  }
  function data3d() {
    const S = PL.state, L = PL.lightCalc();
    const lights = PL.bom.filter(l => l.g === 'lit' && l.id && P[l.id]).reduce((a, l) => a + l.qty, 0);
    return { w:S.w, d:S.d, furn:S.furn.map(f => ({ k:f.k, x:f.x, y:f.y, w:f.w, h:f.h })), ppl:S.ppl.map(p => ({ x:p.x, y:p.y, a:p.a })), ctrl:{ ...S.ctrl },
      cams:S.cams.map((c, i) => { const v = PL.view(c); const tg = v.tg ? { x:v.tg.p.x, y:v.tg.p.y } : null;
        return { x:c.x, y:c.y, a:c.a, h:v.h, mnt:c.mnt, k:c.k, own:!!c.own, label:String(i + 1), tg, all: c.tgt < 0 && v.n > 1, vf:vfLabel(c) }; }),
      lights:Math.min(lights, 4), H:D.HEIGHTS, sel: PL.sel && PL.sel.kind === 'cam' ? PL.sel.i : 0,
      /* round 4: the plan's fixtures as lights (position, height, aim, photometrics) */
      /* the 3D uses the dimmed level (candela = published lux at 1 m × dimmer); fixtures without data are drawn, unlit */
      fx:(L ? L.fx : []).map(f => { const F = D.FIXT[f.id] || {}; return { id:f.id, role:f.role, x:f.x, y:f.y, h:f.h, tx:f.tx, ty:f.ty, th:f.th, lux1:F.lux1 || 0, dim:f.dim == null ? 0 : f.dim, beam:F.beam || 55, W:F.W || 0, cct:(S.lt && S.lt.cct) || 5600 }; }),
      keyLux: L ? (L.front || L.target) : 0, target: L ? L.target : 0, cct:(S.lt && S.lt.cct) || 5600 };
  }
  function hasWebGL() { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
  function mount3d() {
    const box = $('#g3box'), msg = $('#g3msg');
    const fail = key => { msg.innerHTML = `<span class="meta"><span class="tally"></span>3D</span><b>${esc(t(key))}</b><span class="meta-s">${esc(t('noGLp'))}</span><span class="g3acts"><button type="button" class="btn sm" data-go="6">${esc(t('st6'))}</button><button type="button" class="btn sm sig" data-go="8">${esc(t('toList'))}</button></span>`; msg.classList.add('fail'); };
    if (!hasWebGL()) { fail('noGL'); return; }
    const want = Z.s;
    import('./planner-3d.js').then(m => {
      if (Z.s !== want || Z.v === 'a' || !document.body.contains(box)) return;
      try { G3 = m.mount(box, data3d(), { onPov: i => povLabel(i), vf:G3UI.vf, quality:G3UI.q }); msg.hidden = true; if (G3UI.mv) G3.setMode('multi'); if (G3UI.fr) G3.setFrusta(true);
        if (/[?&]fps\b/.test(location.search)) setTimeout(() => { const f = G3.fps(30), n = $('#g3pov'); if (n) { n.hidden = false; n.textContent = `Frame ${f.ms} ms · ${f.fps} fps · shadows ${f.shadows ? 'on' : 'off'} · ${f.low ? 'low' : 'auto'} · px ${f.px}`; } $('#g3box').scrollIntoView({ block:'center' }); }, 600); }
      catch (e) { fail('noGL'); }
    }).catch(() => { if (Z.s === want) fail('noGLload'); });
  }
  function povLabel(i) {
    const p = $('#g3pov'); if (!p) return;
    $$('[data-v3]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v3 === (i == null ? 'o' : String(i)))));
    if (i == null) { p.hidden = true; return; }
    const c = PL.state.cams[i], v = PL.view(c);
    p.hidden = false; p.innerHTML = `<span class="tally"></span>${esc(t('pov'))} ${esc(PL.camLab(i))} · ${esc(vfLabel(c))} · ${v.h.toFixed(1)}°`;
  }

  /* ----- step 7: list (the planner's own #bom section shows; this adds the budget bar) ----- */
  function renderBudgetBar() {
    const el = $('#wz-budget'); if (!el) return;
    const show = Z.pl && (Z.v === 'w' ? Z.s === 8 : !!Z.b);
    el.hidden = !show; if (!show) return;
    const tt = PL.tally(), b = Z.b;
    const over = b && tt.total > b;
    el.innerHTML = `<div class="wzb-row">
        <div><span class="meta">${esc(t('bBudget'))}</span><b class="price">${b ? usd0(b) : '—'}</b>${!b ? `<button type="button" class="textlink sm" data-go="5">${esc(t('setBudget'))}${icon('arrow-right')}</button>` : ''}</div>
        <div><span class="meta">${esc(t('bTotal'))}</span><b class="price">${usd(tt.total)}</b></div>
        <div><span class="meta"><i class="qd"></i>${esc(t('bQuote'))}</span><b>${esc(t('bQuoteN', tt.quote.length))}</b></div>
        <div><span class="meta"><i class="ow"></i>${esc(t('bHave'))}</span><b>${esc(t('bHaveN', tt.owned.length))}</b></div>
      </div>
      ${rollHTML(PL.bom)}
      ${b ? `${fitHTML(tt.total, b).replace('class="fit', 'class="fit big')}` : ''}
      ${b ? `<p class="wzb-st meta-s${over ? ' over' : ''}">${esc(over ? t('bOver', usd0(tt.total - b)) : t('bLeft', usd0(b - tt.total)))}</p>` : ''}`;
  }

  /* ======================= render ======================= */
  let lastLang = PL.lang;
  function render() {
    lastLang = PL.lang;
    renderBudgetBar();
    if (Z.v === 'a') { root.classList.add('pl-adv'); root.classList.remove('pl-wiz'); return; }
    root.classList.add('pl-wiz'); root.classList.remove('pl-adv');
    unmount3d(); goHome();
    renderChrome();
    const s = Z.s;
    panel.className = 'wz-panel s' + s;
    panel.innerHTML = s === 1 ? step1() : s === 2 ? step2() : s === 3 ? step3() : s === 4 ? stepProd() : s === 5 ? step4() : s === 6 ? step5() : s === 7 ? step6() : '';
    if (s === 6) { const slot = $('#wz-plan-slot'); slot.appendChild(planbox); slot.appendChild(mvh); slot.appendChild(cviews); requestAnimationFrame(() => PL.renderPlanNow()); }
    if (s === 7) mount3d();
    if (s === 5) renderChrome();   /* the pick may have changed the chosen option */
  }
  let rT = 0;
  document.addEventListener('i9plan:update', () => {
    if (PL.lang !== lastLang) { OPT_CACHE.key = ''; render(); return; }
    renderBudgetBar();
    if (Z.v !== 'w') return;
    cancelAnimationFrame(rT);
    rT = requestAnimationFrame(() => {
      if (Z.s === 6) { const sd = $('#wz-side'); if (sd) { const a = document.activeElement, keep = sd.contains(a) ? (a.dataset.cam5 != null ? `[data-cam5="${a.dataset.cam5}"]` : a.id ? '#' + a.id : null) : null; sd.innerHTML = side5(); if (keep) $(keep, sd)?.focus({ preventScroll:true }); } }
      if (Z.s >= 5) renderChrome();
    });
  });
  document.addEventListener('i9plan:load', () => {
    const hk = kindFromHash(location.hash);
    if (!PL.z && hk) { Z = DEF(); chooseKind(hk); Z.s = 2; Z.mx = 2; OPT_CACHE.key = ''; render(); save(); return; }   /* a #tpl= link: the guided steps */
    Z = valid(PL.z); if (!PL.z) Z.v = 'a'; Z.dirty = 0; Z.lo = Z.o; OPT_CACHE.key = ''; render(); });

  /* ======================= events ======================= */
  $('#to-adv').addEventListener('click', () => { if (Z.k && Z.s >= 5) ensurePlan(); setView('a'); scrollTo(0, 0); $('#advbar .btn')?.focus(); });
  $('#to-wiz').addEventListener('click', () => { if (!Z.k) { const k = TPL_KIND[PL.state.tpl] || 'church'; chooseKind(k); } syncRoom(); Z.pl = 1; Z.dirty = 0; Z.lo = Z.o = Z.o || 'r'; Z.s = Math.max(Z.s, 6); Z.mx = Math.max(Z.mx, 6); setView('w'); scrollTo(0, 0); });
  stepsEl.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b && !b.disabled) go(+b.dataset.go); });
  $('#wz-back').addEventListener('click', () => go(Z.s - 1));
  $('#wz-next').addEventListener('click', () => {
    if (Z.s === 6) { approve(); go(7, { approve:true }); return; }
    if (Z.s === 8) { $('#b-quote')?.click(); return; }
    go(Z.s + 1);
  });
  document.addEventListener('click', e => { const b = e.target.closest('#wz-budget [data-go], .g3msg [data-go]'); if (!b) return; if (Z.v === 'a') { Z.v = 'w'; root.classList.add('pl-wiz'); root.classList.remove('pl-adv'); } go(+b.dataset.go); });
  panel.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.kind) { chooseKind(b.dataset.kind); render(); return; }
    if (b.dataset.rp) { Z.rp = b.dataset.rp; const pd = presetDims(Z.k, Z.rp); Z.w = pd[0]; Z.d = pd[1]; applyFront(); Z.dirty = 1; render(); return; }
    if (b.dataset.wu) { PL.setUnit(b.dataset.wu); render(); return; }
    if (b.dataset.fr) { Z.fr = b.dataset.fr; applyFront(); Z.dirty = 1; render(); return; }
    if (b.dataset.n) { Z.n = clamp(Z.n + +b.dataset.n, 1, 8); Z.dirty = 1; render(); $(`[data-n="${b.dataset.n}"]`)?.focus(); return; }
    if (b.dataset.au) { Z.au = +b.dataset.au; Z.dirty = 1; render(); return; }
    if (b.dataset.cd) { Z.cd = b.dataset.cd; Z.dirty = 1; render(); $(`[data-cd="${b.dataset.cd}"]`)?.focus(); return; }
    const keep = sel => { render(); const el = $(sel, panel); if (el) el.focus({ preventScroll:true }); };
    if (b.dataset.pr) { const [k, v] = b.dataset.pr.split(':'); Z.pr = { ...prOf(Z), [k]: k === 'st' ? +v : v }; if (k === 'lvl') { /* level nudges the defaults */ } Z.dirty = 1; if (!Z.om) Z.o = null; keep(`[data-pr="${b.dataset.pr}"]`); save(); return; }
    if (b.dataset.lrole) { LUI.role = LUI.role === b.dataset.lrole ? null : b.dataset.lrole; LUI.b = ''; keep(`[data-lrole="${b.dataset.lrole}"]`); return; }
    if (b.dataset.lb != null) { LUI.b = b.dataset.lb; keep(`[data-lb="${b.dataset.lb}"]`); return; }
    if (b.dataset.lpick) { const lt = ltOf(Z); Z.lt = { ...lt, pick:{ ...(lt.pick || {}), [LUI.role]: b.dataset.lpick } }; Z.dirty = 1; if (!Z.om) Z.o = null; keep(`[data-lpick="${b.dataset.lpick}"]`); save(); return; }
    if (b.dataset.lt) { const [k, v] = b.dataset.lt.split(':'); Z.lt = { ...ltOf(Z), [k]: k === 'on' ? +v : v }; Z.dirty = 1; if (!Z.om) Z.o = null; keep(`[data-lt="${b.dataset.lt}"]`); save(); return; }
    /* step 3: cameras */
    const keep2 = sel => { render(); const el = $(sel, panel); if (el) el.focus({ preventScroll:true }); };
    if (b.dataset.fam) { if (famOf(Z) !== b.dataset.fam) { Z.fam = b.dataset.fam; Z.cl = null; Z.o = null; Z.om = 0; Z.dirty = 1; UI.tab = null; UI.b = ''; } keep(`[data-fam="${b.dataset.fam}"]`); save(); return; }
    if (b.dataset.cn) { setCount(lineupShown().length + +b.dataset.cn); keep(`[data-cn="${b.dataset.cn}"]`); save(); return; }
    if (b.dataset.pos != null) { Z.pos = +b.dataset.pos; Z.same = 0; UI.tab = null; render(); const h = $('#cpick-h'); if (h) { h.setAttribute('tabindex', '-1'); if (matchMedia('(max-width:1099px)').matches) h.scrollIntoView({ block:'start', behavior:'smooth' }); } $(`[data-pos="${b.dataset.pos}"]`, panel)?.focus({ preventScroll:true }); save(); return; }
    if (b.dataset.psw != null) { if (b.dataset.psw === 'all') { Z.same = 1; const lu = lineupShown(), m = lu[clamp(Z.pos, 0, lu.length - 1)].m; if (lu.some(c => c.m !== m)) pickModel(m); } else { Z.same = 0; Z.pos = +b.dataset.psw; } keep(`[data-psw="${b.dataset.psw}"]`); save(); return; }
    if (b.dataset.pick) { pickModel(b.dataset.pick); keep(`[data-pick="${b.dataset.pick}"]`); save(); return; }
    if (b.dataset.lens) { const [i, l] = b.dataset.lens.split(':'); editLineup(cl => { const c = cl[+i], bd = D.BODIES[c.m], lz = D.LENSES[l]; c.lensWas = c.lens; c.lens = l; if (!extFor(l, c.ext)) c.ext = null;
        const was = D.LENSES[c.lensWas]; if (lz && lz.ic === 's35' && bd.fmt === 'ff' && bd.crop) c.crop = true; else if (was && was.ic === 's35') c.crop = false; delete c.lensWas; }); keep(`[data-lens="${b.dataset.lens}"]`); save(); return; }
    if (b.dataset.ext) { const [i, x] = b.dataset.ext.split(':'); editLineup(cl => { cl[+i].ext = cl[+i].ext === x ? null : x; }); keep(`[data-ext="${b.dataset.ext}"]`); save(); return; }
    if (b.dataset.crop != null) { const i = +b.dataset.crop; editLineup(cl => { cl[i].crop = !cl[i].crop; }); keep(`[data-crop="${i}"]`); save(); return; }
    if (b.dataset.fix) { const [i, l, x, cr] = b.dataset.fix.split(':'); editLineup(cl => { Object.assign(cl[+i], { lens:l, ext:x || null, crop:cr === '1' }); }); keep(`[data-lens="${i}:${l}"]`); save(); return; }
    if (b.dataset.tab) { UI.tab = b.dataset.tab; UI.b = ''; keep(`[data-tab="${b.dataset.tab}"]`); return; }
    if (b.dataset.fb != null) { UI.b = b.dataset.fb; keep(`[data-fb="${b.dataset.fb}"]`); return; }
    if (b.dataset.fo != null) { UI.o = b.dataset.fo; keep(`[data-fo="${b.dataset.fo}"]`); return; }
    if (b.dataset.fp != null) { UI.p = b.dataset.fp; keep(`[data-fp="${b.dataset.fp}"]`); return; }
    if (b.hasAttribute('data-freset')) { UI.b = UI.o = UI.p = ''; keep('[data-fb=""]'); return; }
    if (b.hasAttribute('data-cmpclear')) { UI.cmp = []; keep('#cpick-h'); return; }
    if (b.dataset.oc) { Z.oc = b.dataset.oc; Z.on = Z.oc === 'none' ? 0 : Math.max(1, Z.on); Z.dirty = 1; render(); $(`[data-oc="${b.dataset.oc}"]`)?.focus(); return; }
    if (b.dataset.on) { Z.on = clamp(Z.on + +b.dataset.on, 1, 4); Z.dirty = 1; render(); $(`[data-on="${b.dataset.on}"]`)?.focus(); return; }
    if (b.dataset.b != null) { Z.b = +b.dataset.b || null; render(); save(); $(`[data-b="${b.dataset.b}"]`)?.focus(); return; }
    if (b.dataset.choose) { Z.o = b.dataset.choose; Z.om = 1; render(); save(); $(`[data-choose="${Z.o}"]`)?.focus(); return; }
    if (b.dataset.cam5 != null) { PL.select('cam', +b.dataset.cam5); return; }
    if (b.id === 'wz-approve') { approve(); go(7, { approve:true }); return; }
    if (b.id === 'wz-fine') { setView('a'); scrollTo(0, 0); return; }
    if (b.dataset.v3 != null && G3) { G3.setView(b.dataset.v3 === 'o' ? null : +b.dataset.v3); return; }
    if (b.id === 'g3-reset' && G3) { G3UI.mv = false; $$('[data-g3="mv"]').forEach(x => x.setAttribute('aria-pressed', 'false')); G3.setView(null); G3.reset(); return; }
    if (b.dataset.g3) { const k = b.dataset.g3; G3UI[k] = !G3UI[k]; b.setAttribute('aria-pressed', String(G3UI[k]));
      if (G3) { if (k === 'vf') { if (matchMedia('(max-width:699px)').matches) G3.setView(G3UI.vf ? (PL.sel && PL.sel.kind === 'cam' ? PL.sel.i : 0) : null); else G3.setVf(G3UI.vf); }
        if (k === 'mv') G3.setMode(G3UI.mv ? 'multi' : 'scene'); if (k === 'fr') G3.setFrusta(G3UI.fr); } return; }
    if (b.dataset.g3q) { G3UI.q = b.dataset.g3q; render(); return; }
    if (b.dataset.look) { const v = b.dataset.look; Z.lt = { ...ltOf(Z), look:v }; PL.setLt({ look:v }); save(); render(); $(`[data-look="${v}"]`)?.focus({ preventScroll:true }); return; }
    if (b.dataset.iso) { PL.setLt({ iso:+b.dataset.iso }); $$('[data-iso]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); const r = $('#pv3-read'); if (r) r.innerHTML = readouts(); return; }
    if (b.dataset.cct) { PL.setLt({ cct:+b.dataset.cct }); render(); return; }
  });
  panel.addEventListener('toggle', e => { if (e.target.id === 'pv3-det') G3UI.det = e.target.open; }, true);
  panel.addEventListener('change', e => {
    const i = e.target;
    if (i.dataset.ltc) { Z.lt = { ...ltOf(Z), [i.dataset.ltc]: i.checked ? 1 : 0 }; Z.dirty = 1; if (!Z.om) Z.o = null; render(); $(`[data-ltc="${i.dataset.ltc}"]`)?.focus(); save(); return; }
    if (i.dataset.mob != null) { const k = +i.dataset.mob, v = i.checked; editLineup(cl => { cl[k].mob = v; }); render(); $(`[data-mob="${k}"]`)?.focus(); save(); return; }
    if (i.dataset.owncam != null) { const k = +i.dataset.owncam, v = i.checked; editLineup(cl => { cl[k].own = v; }); render(); $(`[data-owncam="${k}"]`)?.focus(); save(); return; }
    if (i.dataset.cmp) { const id = i.dataset.cmp; UI.cmp = i.checked ? UI.cmp.filter(x => x !== id).concat(id).slice(-3) : UI.cmp.filter(x => x !== id); render(); $(`[data-cmp="${id}"]`)?.focus(); return; }
    if (i.id === 'wz-same') { Z.same = i.checked ? 1 : 0; if (Z.same) { const lu = lineupShown(), m = lu[clamp(Z.pos, 0, lu.length - 1)].m; if (lu.some(c => c.m !== m)) pickModel(m); } render(); $('#wz-same')?.focus(); save(); return; }
    if (i.dataset.ow) { const s = new Set(Z.ow); if (i.checked) s.add(i.dataset.ow); else s.delete(i.dataset.ow); Z.ow = OWN.filter(r => s.has(r)); Z.dirty = 1; render(); $(`[data-ow="${i.dataset.ow}"]`)?.focus(); return; }
    if (i.id === 'wz-w' || i.id === 'wz-d') {
      const v = parseFloat(String(i.value).replace(',', '.')) / (unit() === 'ft' ? FT : 1);
      if (v >= 2 && v <= 80) { Z[i.id === 'wz-w' ? 'w' : 'd'] = Math.round(v * 10) / 10; Z.rp = 'c'; Z.dirty = 1; }
      const id = i.id; render(); $('#' + id)?.focus();
    }
  });
  panel.addEventListener('keydown', e => { if ((e.target.id === 'wz-w' || e.target.id === 'wz-d') && e.key === 'Enter') { e.preventDefault(); e.target.dispatchEvent(new Event('change', { bubbles:true })); } });
  panel.addEventListener('input', e => {
    if (e.target.id !== 'wz-b') return;
    Z.b = BUDGETS[+e.target.value];
    /* live: readout, fits and the pick; full re-render on release keeps focus on the slider */
    $('#wz-bval').textContent = usd0(Z.b); e.target.setAttribute('aria-valuetext', usd0(Z.b));
    const opts = options();
    $$('.opt').forEach(c => { const o = opts[c.dataset.opt]; const f = c.querySelector('.fit'); if (o && f) f.outerHTML = fitHTML(o.ev.total, Z.b); });
  });
  panel.addEventListener('change', e => { if (e.target.id === 'wz-b') { render(); save(); $('#wz-b')?.focus(); } });

  /* ======================= boot ======================= */
  (function boot() {
    const hk = PL.hashKind, q = PL.queryTemplate;
    if (hk === 'p' && PL.z) { Z = valid(PL.z); Z.dirty = 0; if (Z.pl) Z.lo = Z.o; }
    else if (hk === 'tpl' && kindFromHash(PL.bootHash)) { Z = DEF(); chooseKind(kindFromHash(PL.bootHash)); Z.s = 2; Z.mx = 2; }   /* guides, product pages: the guided steps on that kind */
    else if (hk === 'p' || hk === 'tpl' || hk === 'adv') { Z = DEF(); Z.v = 'a'; const k = TPL_KIND[PL.state.tpl]; if (k) chooseKind(k); syncRoom(); Z.pl = 1; Z.dirty = 0; Z.o = Z.lo = 'r'; Z.s = 6; Z.mx = 6; }
    else if (q) {
      const st = window.I9S.SET[q], S = PL.state;
      Z = DEF(); Z.k = SETUP_KIND[st.sol] || TPL_KIND[S.tpl] || 'church'; Z.w = S.w; Z.d = S.d; Z.rp = 'c';
      const pre = D.ROOMS[Z.k].find(p => Array.isArray(p) && p[1] === S.w && p[2] === S.d); if (pre) Z.rp = pre[0];
      Z.n = clamp(S.ppl.length || 1, 1, 8); Z.au = S.furn.some(f => f.k === 'seats') ? 1 : 0; Z.cd = 'back';
      Z.st = q; Z.o = Z.lo = 's'; Z.om = 1; Z.pl = 1; Z.dirty = 0; Z.s = 6; Z.mx = 6;
    }
    if (Z.s >= 6 && Z.v === 'w') ensurePlan();
    render();
    save();
  })();

  window.I9WIZ = { get state() { return Z; }, go, options, setView, layout, get g3() { return G3; }, rollup, readouts,
    chain: () => { const opts = options(), o = opts[shownId(opts)]; return o ? chain(o.ev, prOf(Z)) : ''; } };
})();
