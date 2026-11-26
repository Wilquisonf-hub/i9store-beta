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
    back:['Back','Voltar'], next:['Next','Avançar'], stepOf:['Step {0} of 7','Passo {0} de 7'],
    st1:['What you’re making','O que vai produzir'], st2:['The room','A sala'], st3:['Cameras','Câmeras'], st4:['Budget','Orçamento'],
    st5:['The plan','O plano'], st6:['3D view','Vista 3D'], st7:['List & quote','Lista e cotação'],
    h1:['What are you making?','O que você vai produzir?'],
    l1:['Pick the closest. It sets a starting room, the people on camera and the gear. You can change all of it.','Escolha o mais próximo. Ele define a sala, as pessoas em cena e os equipamentos iniciais. Tudo pode mudar.'],
    h2:['Tell us about the room.','Conte como é a sala.'],
    l2:['Rough numbers are fine. We place the stage, the people and the control desk for you.','Números aproximados servem. Nós posicionamos o palco, as pessoas e a mesa de controle.'],
    h3:['Choose your cameras.','Escolha suas câmeras.'],
    l3:['Pick the type of camera first, then a model for each position in the room. Every model is a store listing at today’s price.','Escolha primeiro o tipo de câmera, depois um modelo para cada posição da sala. Todo modelo é um produto da loja, com o preço de hoje.'],
    h4:['Set a budget.','Defina um orçamento.'],
    l4:['Tick what you already own, set a budget, and we price three ways to do it from live store listings, and say which one fits.','Marque o que você já tem, defina um orçamento, e calculamos três formas de montar com os preços da loja, dizendo qual cabe.'],
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
    h5:['Here’s your plan.','Este é o seu plano.'],
    l5:['Drag a camera to move it, drag its dot to aim. When it looks right, approve it.','Arraste uma câmera para mover, arraste o ponto para mirar. Quando estiver certo, aprove.'],
    h6:['See it in 3D.','Veja em 3D.'],
    l6:['A simple model of the approved plan. Orbit and zoom, or look through each camera.','Um modelo simples do plano aprovado. Gire e aproxime, ou olhe por cada câmera.'],
    h7:['Your equipment list.','Sua lista de equipamentos.'],
    l7:['Everything the plan needs, grouped. What you have is at $0; lines to quote are priced by a specialist.','Tudo o que o plano precisa, em grupos. O que você tem fica a $0; as linhas a cotar são precificadas por um especialista.'],
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
    const cams = z.cl.map(c => ({ k:kOf(c.m), m:c.m, lens:c.lens || null, own:!!c.own }));
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
  function hRange(k, m, lens) {
    const z = D.PTZ[m] || D.CAMCORDER[m]; if (z) return [z.hT, z.hW];
    const b = D.BODIES[m]; if (!b) return [5, 60];
    const r = lens === 'kit' && b.kit ? [b.kit.min, b.kit.max] : D.LENSES[lens] ? [D.LENSES[lens].min, D.LENSES[lens].max] : (D.OTHER_LENS[b.mount] || [12, 120]);
    const h = f => 2 * Math.atan(b.w / (2 * f)) * 180 / Math.PI;
    return [h(r[1]), h(r[0])];
  }
  const REACH_FW = 1.6;
  /* the store lens presets that fit a body's mount (APS-C-only lenses are left off full-frame bodies) */
  const lensesFor = b => ((D.PRESETS || {})[b.mount] || []).filter(l => D.LENSES[l] && P[l] && !(D.LENSES[l].apsc && b.fmt === 'ff'));
  function reach(L, i, n, k, m, lens) {
    const s = slotOf(L, i, n), at = camAt(L, s, k), nd = need(L, s, at); if (!nd) return null;
    const [lo, hi] = hRange(k, m, lens), rad = d => d * Math.PI / 180;
    if (nd.wide) return nd.h > hi * 1.1 ? { bad:'narrow', hi, nd } : { nd, ok:true };   /* 10 %: shoulders at the edge are fine */
    const h = Math.max(lo, Math.min(hi, nd.h)), fw = 2 * nd.d * Math.tan(rad(h / 2));
    return fw > REACH_FW && nd.h < lo ? { bad:'far', fw, nd } : { nd, fw, ok:true };
  }
  /* the store lens that best frames this position: in range first, then the cheapest (an included kit lens costs $0) */
  function autoLens(m, L, i, n) {
    const b = D.BODIES[m]; if (!b) return null;
    const cands = (b.kit ? ['kit'] : []).concat(lensesFor(b));
    if (!cands.length) return PL.defaultLens ? PL.defaultLens(m) : 'other';
    const s = slotOf(L, i, n), nd = need(L, s, camAt(L, s, 'lens')); if (!nd) return cands[0];
    const score = l => { const [lo, hi] = hRange('lens', m, l); const miss = nd.h < lo ? Math.log(lo / nd.h) : nd.h > hi ? Math.log(nd.h / hi) * 2 : 0; return miss * 1e6 + (l === 'kit' ? 0 : P[l].usd); };
    return cands.slice().sort((a, b2) => score(a) - score(b2))[0];
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
    return { tpl:L.tpl, w:L.w, d:L.d, tr:trOverride || rec.tr, fmt:'hd', ext: z.k === 'podcast' || z.k === 'studio' ? 0 : 1, xr:L.xr, own:z.ow.slice(),
      furn:L.furn, ppl:L.ppl, ctrl:L.ctrl,
      cams:cams.map((c, i) => { const s = n === 1 ? { ...L.slots[0], aim:'all', shot:'wide' } : L.slots[i];
        const { x, y } = camAt(L, s, c.k);   /* manned cameras stand on tripods, off the wall / mid-aisle */
        return { k:c.k, m:c.m, lens:c.lens || null, x, y, mnt: c.k === 'ptz' ? s.mnt : 'tripod', man: c.man ?? (c.k !== 'ptz'), aim:s.aim, shot:s.shot, own:!!c.own }; }) };
  }
  let OPT_CACHE = { key:'', opts:null };
  function options() {
    const key = JSON.stringify([Z.k, Z.w, Z.d, Z.n, Z.au, Z.cd, Z.oc, Z.on, Z.ow, Z.st, Z.fam, Z.cn, Z.cl, PL.lang]);
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
  const DEF = () => ({ v:'w', s:1, mx:1, k:null, rp:'m', w:16, d:24, fr:'s', n:3, au:1, cd:'back', oc:'none', on:0, ow:[], b:null, o:null, om:0, lo:null, pl:0, dirty:1, ap:0, apk:'', st:null,
    fam:null, cn:null, cl:null, same:0, pos:0 });
  let Z = DEF();
  function valid(z) {
    const d = DEF(); if (!z || typeof z !== 'object') return d;
    const o = { ...d, ...z };
    o.v = o.v === 'a' ? 'a' : 'w'; o.s = clamp(Math.round(+o.s || 1), 1, 7); o.mx = clamp(Math.round(+o.mx || o.s), o.s, 7);
    o.k = KINDS[o.k] ? o.k : null; o.w = clamp(+o.w || 16, 2, 80); o.d = clamp(+o.d || 24, 2, 80); o.n = clamp(Math.round(+o.n || 1), 1, 8);
    o.au = o.au ? 1 : 0; o.cd = ['near', 'back', 'booth'].includes(o.cd) ? o.cd : 'back'; o.fr = o.fr === 'l' ? 'l' : 's';
    o.oc = ['none', 'ptz', 'cc', 'lens'].includes(o.oc) ? o.oc : 'none'; o.on = clamp(Math.round(+o.on || 0), 0, 4);
    o.ow = Array.isArray(o.ow) ? o.ow.filter(r => OWN.includes(r)) : []; o.b = o.b ? clamp(+o.b, 500, 1e6) : null;
    o.fam = FAMS.includes(o.fam) ? o.fam : null; o.cn = o.cn ? clamp(Math.round(+o.cn), 1, 4) : null;
    /* the customer's camera picks: [model, lens, owned] per position, store models only */
    o.cl = Array.isArray(o.cl) ? o.cl.slice(0, 4).map(c => Array.isArray(c) ? { m:c[0], lens:c[1] || null, own:!!c[2] } : c)
      .filter(c => c && P[c.m] && (D.PTZ[c.m] || D.CAMCORDER[c.m] || D.BODIES[c.m])).map(c => ({ m:c.m, lens:D.BODIES[c.m] && (c.lens === 'kit' || c.lens === 'other' || D.LENSES[c.lens]) ? c.lens : null, own:!!c.own })) : null;
    if (o.cl && !o.cl.length) o.cl = null;
    o.same = o.same ? 1 : 0; o.pos = clamp(Math.round(+o.pos || 0), 0, 3);
    o.o = ['e', 'r', 'p', 's', 'c'].includes(o.o) ? o.o : null; o.st = o.st && window.I9S && window.I9S.SET && window.I9S.SET[o.st] ? o.st : null;
    if (o.o === 's' && !o.st) o.o = null;
    if (o.o === 'c' && !o.cl) o.o = null;
    return o;
  }
  PL.zGet = () => { const o = {}; Object.keys(Z).forEach(k => { let v = Z[k]; if (k === 'cl' && v) v = v.map(c => [c.m, c.lens || 0, c.own ? 1 : 0]); if (v !== null && v !== '' && !(Array.isArray(v) && !v.length)) o[k] = v; }); return o; };
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
    s = clamp(s, 1, 7);
    if (s > 1 && !Z.k) s = 1;
    if (s >= 5) ensurePlan();
    if (s >= 6 && !Z.ap && !opt.approve && s > Z.mx) s = 5;
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
    stepsEl.innerHTML = [1, 2, 3, 4, 5, 6, 7].map(i => {
      const cur = i === Z.s, done = i < Z.s || (i <= Z.mx && i !== Z.s), dis = i > Z.mx && !(i === Z.mx + 1 && canNext() && i <= 5);
      return `<li><button type="button" data-go="${i}" class="${cur ? 'cur' : done ? 'done' : ''}"${cur ? ' aria-current="step"' : ''}${dis ? ' disabled' : ''}><span class="n">${String(i).padStart(2, '0')}<i aria-hidden="true"></i></span><b>${esc(t('st' + i))}</b></button></li>`;
    }).join('');
    $('#wz-progbar').style.width = (Z.s / 7 * 100).toFixed(1) + '%';
    $('#wz-h').textContent = t('h' + Z.s);
    $('#wz-lede').textContent = t('l' + Z.s);
    root.setAttribute('data-wzs', Z.s);
    /* footer */
    $('#wz-back').classList.toggle('off', Z.s === 1); $('#wz-back').disabled = Z.s === 1; $('#wz-back-l').textContent = t('back');
    const nx = $('#wz-next'), nl = $('#wz-next-l');
    nx.disabled = !canNext();
    nl.textContent = Z.s === 5 ? t('approveNext') : Z.s === 6 ? t('toList') : Z.s === 7 ? t('reqQuote') : t('next') + ': ' + t('st' + (Z.s + 1));
    nx.classList.toggle('noarrow', Z.s === 7);
    let sum = `<span class="meta">${esc(t('stepOf', Z.s))}</span>`;
    if (Z.s >= 5 && Z.pl) { const tt = PL.tally(); sum += `<span class="tot"><b class="price">${usd(tt.total)}</b><span class="meta-s">${esc(tt.quote.length === 1 ? t('plusQuote1') : t('plusQuote', tt.quote.length))}</span></span>`; }
    else if (Z.s === 4 && Z.b) sum += `<span class="tot"><span class="meta-s">${esc(t('upTo'))}</span> <b class="price">${usd0(Z.b)}</b></span>`;
    else if (Z.s === 3 && Z.k) { const cs = camSum(); sum += `<span class="tot"><span class="meta-s">${esc(t('camsSub'))}</span> <b class="price">${usd(cs.cam)}</b><span class="meta-s">· ${esc(t('sPlan'))} ${usd(cs.ev.total)}</span></span>`; }
    $('#wz-sum').innerHTML = sum;
  }
  function canNext() { return Z.s === 1 ? !!Z.k : Z.s === 7 ? true : true; }

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
    if (id === 'c') return Z.cl.map(c => ({ k:kOf(c.m), m:c.m, lens:D.BODIES[c.m] ? c.lens || opts.c.ev.cams[Z.cl.indexOf(c)]?.lens || null : null, own:!!c.own }));
    return opts[id].ev.cams.slice(0, 4).map(c => ({ k:c.k, m:c.m, lens:c.k === 'lens' ? c.lens : null, own:!!c.own }));
  }
  function editLineup(fn) {
    const cl = lineupShown().map(c => ({ m:c.m, lens:c.lens, own:c.own }));
    fn(cl, layout(Z));
    Z.cl = cl; Z.cn = cl.length; Z.o = 'c'; Z.om = 1; Z.dirty = 1;
  }
  function pickModel(m) {
    editLineup((cl, L) => { const n = cl.length, idx = Z.same ? cl.map((_, i) => i) : [clamp(Z.pos, 0, n - 1)];
      idx.forEach(i => { cl[i].m = m; cl[i].lens = D.BODIES[m] ? autoLens(m, L, i, n) : null; }); });
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
    const ls = (b.kit ? ['kit'] : []).concat(lensesFor(b));
    if (!ls.length) ls.push('other');
    const lab = l => l === 'kit' ? t('lensKit', b.kit.min, b.kit.max) : l === 'other' ? t('lensOther') : `${D.LENSES[l].min}–${D.LENSES[l].max} mm`;
    const nm = l => l === 'kit' ? b.kit.name : l === 'other' ? t('lensOther') : P[l].brand + ' ' + P[l].name + ' · ' + usd(P[l].usd);
    return `<div class="lchips" role="group" aria-label="${esc(t('lensK') + ' · CAM ' + (i + 1))}"><span class="meta-s">${esc(t('lensK'))}</span>${ls.map(l => `<button type="button" class="lchip${l === c.lens ? ' on' : ''}" data-lens="${i}:${l}" aria-pressed="${l === c.lens}" title="${esc(nm(l))}" aria-label="${esc(nm(l))}">${esc(lab(l))}${l !== 'kit' && l !== 'other' ? `<small>${usd0(P[l].usd)}</small>` : ''}</button>`).join('')}</div>`;
  }
  function posRow(c, i, n, L) {
    const p = P[c.m], role = posRole(L, i, n), s = slotOf(L, i, n);
    const tgt = typeof s.aim === 'number' && n > 1 ? L.ppl[s.aim] : null;
    const framing = !tgt ? PL.t('s_' + (s.shot === 'med' ? 'med' : 'wide')) + ' · ' + t('everyone') : PL.t('s_' + s.shot) + ' · ' + PL.pname(tgt.n);
    const rc = reach(L, i, n, c.k, c.m, c.lens), act = !Z.same && i === Z.pos;
    const msg = rc && rc.bad === 'far' ? t('reachFar', PL.lenTxt(rc.fw), PL.pname(rc.nd.p.n)) : rc && rc.bad === 'narrow' ? t('reachNarrow', Math.round(rc.hi), Math.round(rc.nd.h)) : '';
    return `<li class="cpos-i${act || Z.same ? ' on' : ''}${c.own ? ' own' : ''}${msg ? ' bad' : ''}">
      <button type="button" class="cp-sel" data-pos="${i}" aria-pressed="${act}" aria-controls="cpick"><span class="cn">${i + 1}</span><span class="cp-r"><b>${esc(t('rl_' + role))}</b><span class="meta-s">${esc(framing)}</span></span></button>
      <span class="pk"><img src="${p.src}" alt=""></span>
      <span class="cp-m"><span class="cc-b">${esc(brandShort(p.brand))}</span><b>${esc(p.name)}</b><span class="meta-s">${c.own ? esc(t('youHaveS')) : usd(p.usd)}${specOf(c.m).approx ? ` <span class="vf">${esc(t('verify'))}</span>` : ''}</span></span>
      <label class="cp-own"><input type="checkbox" data-owncam="${i}"${c.own ? ' checked' : ''}><span class="box" aria-hidden="true"></span><span>${esc(t('haveCam'))}</span></label>
      ${lensChips(c, i)}
      ${msg ? `<p class="cp-w"><i aria-hidden="true"></i><span>${esc(msg)}</span></p>` : rc && rc.ok && !rc.nd.wide ? `<p class="cp-ok meta-s">${esc(t('reachOk', PL.lenTxt(rc.fw), PL.lenTxt(rc.nd.d)))}</p>` : ''}
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
    const bad = lu.filter((c, i) => { const r = reach(L, i, n, c.k, c.m, c.lens); return r && r.bad; }).length;
    const tr = ev.tr === 'ip' ? 'IP / NDI' : ev.tr.toUpperCase();
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

  /* ----- step 4: budget ----- */
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
  function step6() {
    const S = PL.state;
    return `<div class="g3">
      <div class="g3bar"><div class="seg sm g3v" role="group" aria-label="${esc(t('st6'))}"><button type="button" data-v3="o" aria-pressed="true">${esc(t('overview'))}</button>${S.cams.map((c, i) => `<button type="button" data-v3="${i}" aria-pressed="false">${esc(PL.camLab(i))}</button>`).join('')}</div>
        <button type="button" class="tbtn" id="g3-reset">${esc(t('reset'))}</button><span class="meta-s g3h">${esc(t('g3dHint'))}</span></div>
      <div class="g3box" id="g3box"><div class="g3msg" id="g3msg"><span class="meta"><span class="tally"></span>${esc(t('loading3d'))}</span></div><p class="g3pov meta" id="g3pov" hidden></p></div>
      <p class="meta-s g3note">${esc(t('g3dNote'))}</p>
    </div>`;
  }
  function data3d() {
    const S = PL.state;
    const lights = PL.bom.filter(l => l.g === 'lit' && l.id && P[l.id]).reduce((a, l) => a + l.qty, 0);
    return { w:S.w, d:S.d, furn:S.furn.map(f => ({ k:f.k, x:f.x, y:f.y, w:f.w, h:f.h })), ppl:S.ppl.map(p => ({ x:p.x, y:p.y, a:p.a })), ctrl:{ ...S.ctrl },
      cams:S.cams.map((c, i) => { const v = PL.view(c); const tg = v.tg ? { x:v.tg.p.x, y:v.tg.p.y } : null;
        return { x:c.x, y:c.y, a:c.a, h:v.h, mnt:c.mnt, k:c.k, own:!!c.own, label:String(i + 1), tg, all: c.tgt < 0 && v.n > 1 }; }),
      lights:Math.min(lights, 4), H:D.HEIGHTS, sel: PL.sel && PL.sel.kind === 'cam' ? PL.sel.i : 0 };
  }
  function hasWebGL() { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
  function mount3d() {
    const box = $('#g3box'), msg = $('#g3msg');
    const fail = key => { msg.innerHTML = `<span class="meta"><span class="tally"></span>3D</span><b>${esc(t(key))}</b><span class="meta-s">${esc(t('noGLp'))}</span><span class="g3acts"><button type="button" class="btn sm" data-go="5">${esc(t('st5'))}</button><button type="button" class="btn sm sig" data-go="7">${esc(t('toList'))}</button></span>`; msg.classList.add('fail'); };
    if (!hasWebGL()) { fail('noGL'); return; }
    const want = Z.s;
    import('./planner-3d.js').then(m => {
      if (Z.s !== want || Z.v === 'a' || !document.body.contains(box)) return;
      try { G3 = m.mount(box, data3d(), { onPov: i => povLabel(i) }); msg.hidden = true; }
      catch (e) { fail('noGL'); }
    }).catch(() => { if (Z.s === want) fail('noGLload'); });
  }
  function povLabel(i) {
    const p = $('#g3pov'); if (!p) return;
    $$('[data-v3]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v3 === (i == null ? 'o' : String(i)))));
    if (i == null) { p.hidden = true; return; }
    const c = PL.state.cams[i], v = PL.view(c);
    p.hidden = false; p.innerHTML = `<span class="tally"></span>${esc(t('pov'))} ${esc(PL.camLab(i))} · ${esc(PL.modelName(c))} · ${v.h.toFixed(1)}°`;
  }

  /* ----- step 7: list (the planner's own #bom section shows; this adds the budget bar) ----- */
  function renderBudgetBar() {
    const el = $('#wz-budget'); if (!el) return;
    const show = Z.pl && (Z.v === 'w' ? Z.s === 7 : !!Z.b);
    el.hidden = !show; if (!show) return;
    const tt = PL.tally(), b = Z.b;
    const over = b && tt.total > b;
    el.innerHTML = `<div class="wzb-row">
        <div><span class="meta">${esc(t('bBudget'))}</span><b class="price">${b ? usd0(b) : '—'}</b>${!b ? `<button type="button" class="textlink sm" data-go="4">${esc(t('setBudget'))}${icon('arrow-right')}</button>` : ''}</div>
        <div><span class="meta">${esc(t('bTotal'))}</span><b class="price">${usd(tt.total)}</b></div>
        <div><span class="meta"><i class="qd"></i>${esc(t('bQuote'))}</span><b>${esc(t('bQuoteN', tt.quote.length))}</b></div>
        <div><span class="meta"><i class="ow"></i>${esc(t('bHave'))}</span><b>${esc(t('bHaveN', tt.owned.length))}</b></div>
      </div>
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
    panel.innerHTML = s === 1 ? step1() : s === 2 ? step2() : s === 3 ? step3() : s === 4 ? step4() : s === 5 ? step5() : s === 6 ? step6() : '';
    if (s === 5) { const slot = $('#wz-plan-slot'); slot.appendChild(planbox); slot.appendChild(mvh); slot.appendChild(cviews); requestAnimationFrame(() => PL.renderPlanNow()); }
    if (s === 6) mount3d();
    if (s === 4) renderChrome();   /* the pick may have changed the chosen option */
  }
  let rT = 0;
  document.addEventListener('i9plan:update', () => {
    if (PL.lang !== lastLang) { OPT_CACHE.key = ''; render(); return; }
    renderBudgetBar();
    if (Z.v !== 'w') return;
    cancelAnimationFrame(rT);
    rT = requestAnimationFrame(() => {
      if (Z.s === 5) { const sd = $('#wz-side'); if (sd) { const a = document.activeElement, keep = sd.contains(a) ? (a.dataset.cam5 != null ? `[data-cam5="${a.dataset.cam5}"]` : a.id ? '#' + a.id : null) : null; sd.innerHTML = side5(); if (keep) $(keep, sd)?.focus({ preventScroll:true }); } }
      if (Z.s >= 4) renderChrome();
    });
  });
  document.addEventListener('i9plan:load', () => {
    const hk = kindFromHash(location.hash);
    if (!PL.z && hk) { Z = DEF(); chooseKind(hk); Z.s = 2; Z.mx = 2; OPT_CACHE.key = ''; render(); save(); return; }   /* a #tpl= link: the guided steps */
    Z = valid(PL.z); if (!PL.z) Z.v = 'a'; Z.dirty = 0; Z.lo = Z.o; OPT_CACHE.key = ''; render(); });

  /* ======================= events ======================= */
  $('#to-adv').addEventListener('click', () => { if (Z.k && Z.s >= 4) ensurePlan(); setView('a'); scrollTo(0, 0); $('#advbar .btn')?.focus(); });
  $('#to-wiz').addEventListener('click', () => { if (!Z.k) { const k = TPL_KIND[PL.state.tpl] || 'church'; chooseKind(k); } syncRoom(); Z.pl = 1; Z.dirty = 0; Z.lo = Z.o = Z.o || 'r'; Z.s = Math.max(Z.s, 5); Z.mx = Math.max(Z.mx, 5); setView('w'); scrollTo(0, 0); });
  stepsEl.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b && !b.disabled) go(+b.dataset.go); });
  $('#wz-back').addEventListener('click', () => go(Z.s - 1));
  $('#wz-next').addEventListener('click', () => {
    if (Z.s === 5) { approve(); go(6, { approve:true }); return; }
    if (Z.s === 7) { $('#b-quote')?.click(); return; }
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
    /* step 3: cameras */
    const keep = sel => { render(); const el = $(sel, panel); if (el) el.focus({ preventScroll:true }); };
    if (b.dataset.fam) { if (famOf(Z) !== b.dataset.fam) { Z.fam = b.dataset.fam; Z.cl = null; Z.o = null; Z.om = 0; Z.dirty = 1; UI.tab = null; UI.b = ''; } keep(`[data-fam="${b.dataset.fam}"]`); save(); return; }
    if (b.dataset.cn) { setCount(lineupShown().length + +b.dataset.cn); keep(`[data-cn="${b.dataset.cn}"]`); save(); return; }
    if (b.dataset.pos != null) { Z.pos = +b.dataset.pos; Z.same = 0; UI.tab = null; render(); const h = $('#cpick-h'); if (h) { h.setAttribute('tabindex', '-1'); if (matchMedia('(max-width:1099px)').matches) h.scrollIntoView({ block:'start', behavior:'smooth' }); } $(`[data-pos="${b.dataset.pos}"]`, panel)?.focus({ preventScroll:true }); save(); return; }
    if (b.dataset.psw != null) { if (b.dataset.psw === 'all') { Z.same = 1; const lu = lineupShown(), m = lu[clamp(Z.pos, 0, lu.length - 1)].m; if (lu.some(c => c.m !== m)) pickModel(m); } else { Z.same = 0; Z.pos = +b.dataset.psw; } keep(`[data-psw="${b.dataset.psw}"]`); save(); return; }
    if (b.dataset.pick) { pickModel(b.dataset.pick); keep(`[data-pick="${b.dataset.pick}"]`); save(); return; }
    if (b.dataset.lens) { const [i, l] = b.dataset.lens.split(':'); editLineup(cl => { cl[+i].lens = l; }); keep(`[data-lens="${b.dataset.lens}"]`); save(); return; }
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
    if (b.id === 'wz-approve') { approve(); go(6, { approve:true }); return; }
    if (b.id === 'wz-fine') { setView('a'); scrollTo(0, 0); return; }
    if (b.dataset.v3 != null && G3) { G3.setView(b.dataset.v3 === 'o' ? null : +b.dataset.v3); return; }
    if (b.id === 'g3-reset' && G3) { G3.setView(null); G3.reset(); return; }
  });
  panel.addEventListener('change', e => {
    const i = e.target;
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
    else if (hk === 'p' || hk === 'tpl' || hk === 'adv') { Z = DEF(); Z.v = 'a'; const k = TPL_KIND[PL.state.tpl]; if (k) chooseKind(k); syncRoom(); Z.pl = 1; Z.dirty = 0; Z.o = Z.lo = 'r'; Z.s = 5; Z.mx = 5; }
    else if (q) {
      const st = window.I9S.SET[q], S = PL.state;
      Z = DEF(); Z.k = SETUP_KIND[st.sol] || TPL_KIND[S.tpl] || 'church'; Z.w = S.w; Z.d = S.d; Z.rp = 'c';
      const pre = D.ROOMS[Z.k].find(p => Array.isArray(p) && p[1] === S.w && p[2] === S.d); if (pre) Z.rp = pre[0];
      Z.n = clamp(S.ppl.length || 1, 1, 8); Z.au = S.furn.some(f => f.k === 'seats') ? 1 : 0; Z.cd = 'back';
      Z.st = q; Z.o = Z.lo = 's'; Z.om = 1; Z.pl = 1; Z.dirty = 0; Z.s = 5; Z.mx = 5;
    }
    if (Z.s >= 5 && Z.v === 'w') ensurePlan();
    render();
    save();
  })();

  window.I9WIZ = { get state() { return Z; }, go, options, setView, layout, get g3() { return G3; } };
})();
