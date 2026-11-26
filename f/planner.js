/* i9Store room planner (direction G). Vanilla JS + SVG, no libraries.
   The customer lays out a room, places cameras, sees each camera's field of view from manufacturer angles, picks the
   transport (SDI / HDMI / IP-NDI) and gets an assembly list. Priced lines are live listings (shared/catalog*.js);
   everything sized from the plan that the store does not list is "To quote", never priced.
   Data and sources: shared/planner-data.js. Rules: see RULES there and DIRECTIONS-B2-D.md, "Room planner". */
(function () {
  'use strict';
  const { P, usd } = window.I9;
  const D = window.I9PLAN, R = D.RULES;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r2 = v => Math.round(v * 100) / 100;
  const NS = 'http://www.w3.org/2000/svg';
  const FT = 3.28084;

  /* ======================= words (EN / PT) ======================= */
  const W = {
    skip:['Skip to content','Pular para o conteúdo'], talk:['Talk to a specialist','Fale com um especialista'], navPlanner:['Planner','Planejador'],
    kick:['Room planner · i9 / Equipment','Planejador de sala · i9 / Equipamentos'], h1:['Plan your room.','Planeje sua sala.'],
    lede:['Lay out the space, place the cameras and see what each one frames. Pick SDI, HDMI or network, and get the parts list: every camera, cable length, mount and mic, priced from live USA listings.',
          'Desenhe o espaço, posicione as câmeras e veja o que cada uma enquadra. Escolha SDI, HDMI ou rede e receba a lista de peças: cada câmera, comprimento de cabo, suporte e microfone, com preços da loja USA.'],
    tplLegend:['Start from · Room template','Comece por · Modelo de sala'], room:['Room','Sala'], width:['Width','Largura'], depth:['Depth','Profundidade'], dimsHint:['width × depth','largura × profundidade'],
    addCam:['Add camera','Adicionar câmera'], typePtz:['PTZ (robotic)','PTZ (robótica)'], typeLens:['Camera + lens','Câmera + lente'], typeCc:['Camcorder','Filmadora'],
    addPerson:['Person','Pessoa'], addFurn:['Furniture','Mobília'],
    f_table:['Table','Mesa'], f_desk:['Desk','Bancada'], f_pulpit:['Pulpit','Púlpito'], f_stage:['Stage','Palco'], f_seats:['Seating','Plateia'], f_set:['Set wall','Cenário'], f_ctrl:['Control','Controle'],
    keysHint:['Drag to move · drag the dot to aim · arrows move · R / Shift+R rotate','Arraste para mover · arraste o ponto para mirar · setas movem · R / Shift+R giram'],
    mvTitle:['Camera views · schematic','Visão das câmeras · esquema'], mvNote:['How much of the subject fills each frame. Shapes, not a render.','Quanto do assunto preenche cada quadro. Formas, não uma imagem real.'],
    sigKick:['Signal','Sinal'], sigH:['How the cameras reach the switcher','Como as câmeras chegam ao switcher'], format:['Format','Formato'], ptzCtl:['PTZ control','Controle PTZ'],
    ctlIp:['IP (same network)','IP (mesma rede)'], ctl422:['RS-422 serial','RS-422 serial'], extIn:['Other switcher inputs','Outras entradas no switcher'],
    extHint:['Computer, slides or playback that also goes into the switcher.','Computador, slides ou playback que também entram no switcher.'],
    chkKick:['Checks','Verificações'], chkH:['What the plan needs to work','O que o plano precisa para funcionar'],
    bomTab:['Equipment list','Lista de equipamentos'], bomH:['The parts list.','A lista de peças.'], bomH2:['What, how many, which length, why.','O quê, quantos, qual comprimento, por quê.'],
    bomP:['Lines with a photo are live listings with today’s USD price, before sales tax and shipping (calculated at checkout). Lines marked “To quote” are sized from your plan (cable lengths, brackets, parts we don’t list yet); a specialist prices them. Nothing here is a package sales has confirmed.',
          'Linhas com foto são produtos da loja com o preço de hoje em USD, sem sales tax e frete (calculados no checkout). Linhas “A cotar” são dimensionadas pelo seu plano (comprimentos de cabo, suportes, itens que ainda não listamos); um especialista coloca o preço. Nada aqui é um pacote confirmado pelo comercial.'],
    assume:['Cable lengths: routed along floor and walls (the dashed lines), plus the rise at each end, plus 20 %, plus 2 m. Angles of view are manufacturer figures; values marked “approx.” need checking before an order.',
            'Comprimento de cabo: rota pelo chão e paredes (as linhas tracejadas), mais a subida em cada ponta, mais 20 %, mais 2 m. Ângulos de visão são dados do fabricante; valores “aprox.” precisam ser conferidos antes do pedido.'],
    qdH:['Request a quote for this plan','Pedir cotação deste plano'], qdNote:['Prototype: nothing is sent. This is the summary a specialist would receive, with a link that reopens this exact plan.','Protótipo: nada é enviado. Este é o resumo que um especialista receberia, com um link que reabre este plano.'],
    qdCopy:['Copy summary','Copiar resumo'], copied:['Copied','Copiado'], close:['Close','Fechar'],
    footLine:['We supply the equipment.<br>i9 Studios and i9TV do the rest.','Nós fornecemos o equipamento.<br>A i9 Studios e a i9TV fazem o resto.'],
    fShop:['Shop','Loja'], fHelp:['Help','Ajuda'], fQuote:['Request a quote','Pedir cotação'], fTerms:['Terms and conditions','Termos e condições'],
    footBot:['Camera angles: manufacturer spec pages (sources in the data file). Prices: live i9store.com/usa listings.','Ângulos: páginas de especificação dos fabricantes (fontes no arquivo de dados). Preços: loja i9store.com/usa.'],
    /* setups (integration: setups.html "Open in room planner" -> planner.html?template=<setup id>) */
    setFrom:['From the setup','Do setup'], setOpen:['Open the setup','Abrir o setup'], setMatch:['Open the matching setup','Abrir o setup correspondente'],
    c_setCams:['Cameras from the setup “{0}”: {1}, placed on the {2} template.','Câmeras do setup “{0}”: {1}, posicionadas no modelo {2}.'],
    c_setNoCams:['The setup “{0}” has no cameras in its parts list, so the plan uses the {1} template’s camera.','O setup “{0}” não tem câmeras na lista, então o plano usa a câmera do modelo {1}.'],
    c_setUnknown:['The planner doesn’t model the cameras in the setup “{0}” yet ({1}), so the plan uses the {2} template’s cameras.','O planejador ainda não modela as câmeras do setup “{0}” ({1}), então o plano usa as câmeras do modelo {2}.'],
    c_setSome:['Not modelled yet, left out of the plan: {0}.','Ainda não modelado, fora do plano: {0}.'],
    tcMsg:['Your plan has changes. Start over from the {0} template? Its cameras, people and furniture replace yours.','Seu plano tem alterações. Recomeçar do modelo {0}? As câmeras, pessoas e mobília dele substituem as suas.'],
    tcYes:['Replace my plan','Substituir meu plano'], tcNo:['Keep my plan','Manter meu plano'], live_kept:['Kept your plan.','Seu plano foi mantido.'],
    addedLine:['Added {0}','Adicionado: {0}'], addedPlan:['Added {0} pieces from this plan','{0} peças deste plano adicionadas'],
    /* templates */
    t_podcast:['Podcast','Podcast'], t_church:['Church','Igreja'], t_studio:['Studio','Estúdio'], t_event:['Live event / corporate','Evento / corporativo'], t_empty:['Empty room','Sala vazia'],
    td_podcast:['3 hosts, table','3 pessoas, mesa'], td_church:['Stage, booth','Palco, cabine'], td_studio:['Desk, set','Bancada, cenário'], td_event:['Stage, FOH','Palco, FOH'], td_empty:['Start blank','Do zero'],
    p_host:['Host','Apresentador'], p_guest:['Guest','Convidado'], p_cohost:['Co-host','Coapresentador'], p_pastor:['Pastor','Pastor'], p_worship:['Worship leader','Ministro de louvor'], p_music:['Musician','Músico'],
    p_anchorA:['Anchor A','Âncora A'], p_anchorB:['Anchor B','Âncora B'], p_presenter:['Presenter','Apresentador'], p_speaker:['Speaker','Palestrante'], p_person:['Person {0}','Pessoa {0}'],
    /* inspector */
    cam:['Camera','Câmera'], type:['Type','Tipo'], model:['Model','Modelo'], lens:['Lens','Lente'], sensor:['Sensor format','Formato do sensor'], focal:['Focal length','Distância focal'], zoom:['Zoom','Zoom'],
    mount:['Mount','Montagem'], m_tripod:['Tripod','Tripé'], m_wall:['Wall','Parede'], m_ceiling:['Ceiling','Teto'], m_table:['Table / shelf','Mesa / prateleira'],
    manned:['Operator on this camera','Operador nesta câmera'], subject:['Subject','Assunto'], auto:['Auto (nearest the centre)','Automático (mais ao centro)'],
    frame:['Frame','Enquadrar'], aim:['Aim at subject and zoom to:','Mirar no assunto e ajustar para:'], pan:['Pan','Pan'], remove:['Remove','Remover'],
    hfov:['Horizontal angle','Ângulo horizontal'], dist:['Distance to subject','Distância ao assunto'], fw:['Frame width at subject','Largura do quadro no assunto'], shot:['Shot','Plano'], run:['Cable run','Cabo até o controle'],
    kitLens:['kit lens','lente do kit'], otherLens:['Other lens (to quote)','Outra lente (a cotar)'], bodyNative:['{0} (this body, {1} mm)','{0} (este corpo, {1} mm)'],
    approx:['approx. — verify','aprox. — verificar'], source:['Source','Fonte'], noTarget:['Nobody in frame','Ninguém no quadro'],
    selPerson:['Person','Pessoa'], name:['Name','Nome'], selFurn:['Furniture','Mobília'], w:['Width','Largura'], h:['Depth','Profundidade'],
    selCtrl:['Control position','Posição de controle'], ctrlP:['Where the switcher sits. Every cable run is measured to here.','Onde fica o switcher. Todo cabo é medido até aqui.'],
    selNone:['Select a camera, person or piece of furniture on the plan.','Selecione uma câmera, pessoa ou mobília no plano.'],
    ptzNote:['Zoom between the published wide and tele angles.','Zoom entre os ângulos publicados de abertura e tele.'],
    lensNote:['HFOV = 2·atan(sensor width ÷ 2·focal length).','HFOV = 2·atan(largura do sensor ÷ 2·distância focal).'],
    /* shots */
    s_cu:['Close-up','Close'], s_mcu:['Medium close-up','Plano próximo'], s_med:['Medium','Plano médio'], s_wide:['Wide','Plano aberto'],
    sh_cu:['CU','CL'], sh_mcu:['MCU','PP'], sh_med:['MS','PM'], sh_wide:['WS','PA'], twoShot:['{0}-shot','{0} pessoas'],
    /* transport notes */
    tr_sdi:['Locking BNC, long runs, the broadcast default. 3G for 1080p, 12G for 4K.','BNC com trava, cabos longos, padrão broadcast. 3G para 1080p, 12G para 4K.'],
    tr_hdmi:['Cheapest and simplest for short runs (a podcast table). Past ~7.6 m it needs active optical cable; past 15 m, convert to SDI.','Mais barato e simples para cabos curtos (mesa de podcast). Acima de ~7,6 m precisa de cabo óptico ativo; acima de 15 m, converter para SDI.'],
    tr_ip:['Video, control and power on one Cat6 per camera (NDI|HX / SRT / ST 2110, simplified to IP/NDI). Needs a PoE switch with enough budget.','Vídeo, controle e energia em um Cat6 por câmera (NDI|HX / SRT / ST 2110, simplificado como IP/NDI). Precisa de switch PoE com potência suficiente.'],
    /* groups */
    g_cam:['Cameras & lenses','Câmeras e lentes'], g_sw:['Switching & streaming','Corte e transmissão'], g_cab:['Cabling','Cabos'], g_net:['Network & power','Rede e energia'],
    g_mnt:['Mounts & support','Suportes'], g_aud:['Audio','Áudio'], g_lit:['Lighting','Iluminação'], g_mon:['Monitoring & intercom','Monitoração e intercom'],
    qty:['Qty','Qtd'], each:['each','cada'], toQuote:['To quote','A cotar'], addBag:['Add to bag','Adicionar'], added:['Added','Adicionado'], approxShort:['approx.','aprox.'],
    pricedLines:['{0} priced lines','{0} linhas com preço'], quoteLines:['{0} lines to quote','{0} linhas a cotar'], totalPriced:['Subtotal (before tax and shipping)','Subtotal (antes de sales tax e frete)'],
    addAll:['Add priced lines to bag','Adicionar linhas com preço'], reqQuote:['Request a quote for this plan','Pedir cotação deste plano'], print:['Print / save PDF','Imprimir / salvar PDF'], copyLink:['Copy link to this plan','Copiar link do plano'], linkCopied:['Link copied','Link copiado'],
    lines:['{0} lines','{0} linhas'], line1:['1 line','1 linha'],
    /* line words */
    w_cam:['On the plan','No plano'], w_lensFor:['Lens for','Lente para'], w_body:['Body for','Corpo para'],
    g_lens:['Zoom lens, {0} mount','Lente zoom, encaixe {0}'], g_lensSpec:['about {0}–{1} mm to cover the framing','cerca de {0}–{1} mm para o enquadramento'],
    g_ndienc:['HDMI/SDI to NDI encoder at the camera','Encoder HDMI/SDI para NDI na câmera'], w_ndienc:['This camera has no NDI output','Esta câmera não tem saída NDI'],
    g_ndikey:['NDI activation / upgrade key','Licença / chave de ativação NDI'], w_ndikey:['NDI is a paid upgrade on this model (check purchase date)','NDI é upgrade pago neste modelo (ver data da compra)'],
    w_rp60:['One joystick for {0} Panasonic PTZ over IP','Um joystick para {0} PTZ Panasonic via IP'],
    g_canonCtl:['Canon PTZ joystick (RC-IP100 class)','Joystick PTZ Canon (classe RC-IP100)'], w_canonCtl:['Controls the Canon PTZ over IP','Controla as PTZ Canon via IP'],
    w_switch:['{0} camera inputs + {1} other = {2} inputs; streams and records','{0} câmeras + {1} outras = {2} entradas; transmite e grava'],
    w_switchNS:['{0} camera inputs + {1} other = {2} inputs (no built-in streaming)','{0} câmeras + {1} outras = {2} entradas (sem streaming interno)'],
    w_enc:['The switcher has no built-in streaming','O switcher não tem streaming interno'],
    g_ndisw:['NDI production switcher or software (TriCaster / vMix class)','Switcher NDI ou software (classe TriCaster / vMix)'], g_ndiswSpec:['{0} NDI inputs, PTZ control, program + streaming','{0} entradas NDI, controle PTZ, programa + streaming'],
    w_ndisw:['Takes every camera off the network; most stream built in','Recebe as câmeras pela rede; a maioria já transmite'],
    g_bigsw:['Production switcher, {0}+ inputs','Switcher de produção, {0}+ entradas'], w_bigsw:['More inputs than the store’s listed switchers','Mais entradas que os switchers listados'],
    g_uhdhdmi:['4K HDMI production switcher','Switcher de produção 4K HDMI'], w_uhdhdmi:['ATEM Mini models are HD; 4K over HDMI needs a different switcher','ATEM Mini é HD; 4K em HDMI pede outro switcher'],
    w_conv:['Camera has no {0} output: converter at the camera','Câmera sem saída {0}: conversor na câmera'], w_convLong:['HDMI run over 15 m: HDMI→SDI at the camera, SDI→HDMI at the switcher','Cabo HDMI acima de 15 m: HDMI→SDI na câmera, SDI→HDMI no switcher'],
    w_fiber:['SDI run past its practical length: fiber pair','SDI além do comprimento prático: par de fibra'],
    g_fiber:['Fiber: LC duplex cable + SFP modules if not included','Fibra: cabo LC duplex + módulos SFP se não incluídos'],
    g_sdi:['SDI coax cable, BNC–BNC, terminated, 12G-rated','Cabo coaxial SDI, BNC–BNC, crimpado, padrão 12G'], w_sdi:['Camera to switcher','Câmera ao switcher'],
    w_bulk:['{0} m of SDI in total: a reel and connectors beat made-up cables','{0} m de SDI no total: bobina e conectores saem melhor que cabos prontos'],
    g_bnc12:['12G BNC connectors for Canare L-5.5CUHD','Conectores BNC 12G para Canare L-5.5CUHD'],
    w_hdmi:['Camera to switcher, {0} run','Câmera ao switcher, cabo de {0}'],
    g_cat6:['Cat6 cable, RJ45 both ends','Cabo Cat6, RJ45 nas pontas'], w_cat6ip:['Video + control + PoE power, one per camera','Vídeo + controle + energia PoE, um por câmera'], w_cat6ctl:['PTZ control + PoE power','Controle PTZ + energia PoE'], w_cat6422:['RS-422 control (no power)','Controle RS-422 (sem energia)'],
    g_xlr3:['XLR cable, 3 m','Cabo XLR, 3 m'], w_xlrMic:['Mic to recorder','Microfone ao gravador'], g_xlr1:['XLR cable, 1 m','Cabo XLR, 1 m'], w_xlrRx:['Wireless receiver to mixer','Receptor sem fio ao mixer'],
    g_pgmAudio:['Audio cable, mixer to switcher','Cabo de áudio, mixer ao switcher'], w_pgmAudio:['Program sound into the stream','Som do programa na transmissão'],
    g_hdmiMv:['HDMI cable, 2 m','Cabo HDMI, 2 m'], w_hdmiMv:['Switcher multiview to monitor','Multiview do switcher ao monitor'],
    w_net:['{0} ports used of {1}; PoE {2} W of {3} W','{0} portas usadas de {1}; PoE {2} W de {3} W'],
    g_poesw:['Managed PoE++ switch','Switch gerenciado PoE++'], g_poeswSpec:['{0}+ ports, {1}+ W PoE budget, IGMP snooping for NDI','{0}+ portas, {1}+ W de PoE, IGMP snooping para NDI'],
    w_poesw:['No listed switch has enough ports or PoE for this plan','Nenhum switch listado tem portas ou PoE suficientes'],
    g_power:['AC power at the camera position','Tomada no ponto da câmera'], w_power:['Not powered over the network','Sem energia pela rede'],
    g_ups:['UPS for switcher and network, 1000 VA+','Nobreak para switcher e rede, 1000 VA+'], w_ups:['Keeps the show up through a power blip','Mantém o programa no ar em quedas rápidas'],
    w_tripod:['Camera support','Suporte da câmera'], w_tripodHeavy:['Studio camera with zoom: payload class','Câmera de estúdio com zoom: classe de carga'],
    g_wall:['Wall bracket for {0}','Suporte de parede para {0}'], g_ceil:['Ceiling bracket for {0}','Suporte de teto para {0}'], w_bracket:['Manufacturer’s own bracket recommended','Recomendado o suporte do próprio fabricante'],
    g_arm:['Boom arm for SM7B','Braço articulado para SM7B'], w_arm:['One per mic','Um por microfone'],
    w_mic:['One per person on the plan ({0})','Um por pessoa no plano ({0})'], w_rec:['Records and mixes {0} mics','Grava e mixa {0} microfones'], w_mix:['{0} mics + {1} band / playback inputs','{0} microfones + {1} entradas de banda / playback'],
    w_mixDirect:['{0} mics go straight into the switcher’s mic inputs','{0} microfones direto nas entradas de microfone do switcher'],
    w_phones:['One per host + one for the producer','Um por pessoa + um para o produtor'], w_phonesOp:['For the operator','Para o operador'],
    w_lit_podcast:['Key per side of the table + a background accent (starting suggestion)','Luz principal por lado da mesa + acento no fundo (sugestão inicial)'],
    w_lit_church:['Front wash on the pulpit (starting suggestion)','Luz frontal no púlpito (sugestão inicial)'], g_dmx:['Stage wash and DMX plan','Plano de luz de palco e DMX'], w_dmx:['Sized with a lighting plan by i9','Dimensionado com um plano de luz da i9'],
    w_lit_studio:['Key + fill on the desk, soft panel kit for the set (starting suggestion)','Principal + preenchimento na bancada, kit de painéis no cenário (sugestão inicial)'],
    w_lit_event:['High-output key on the stage (starting suggestion)','Luz de alta potência no palco (sugestão inicial)'], w_lit_empty:['Soft key kit (starting suggestion)','Kit de luz suave (sugestão inicial)'],
    g_mv:['Multiview monitor, 24–32" HDMI','Monitor de multiview, 24–32" HDMI'], w_mv:['Every camera, preview and program on one screen','Todas as câmeras, preview e programa em uma tela'],
    g_conf:['Talent confidence monitor','Monitor de retorno para o talento'], w_conf:['Program return for the desk','Retorno do programa para a bancada'],
    w_icom:['{0} operators: director + {1} on cameras','{0} operadores: diretor + {1} nas câmeras'], g_icom:['Intercom for {0} operators','Intercom para {0} operadores'],
    /* checks */
    c_hdmiOk:['{0}: HDMI {1}, passive cable is fine','{0}: HDMI {1}, cabo passivo serve'],
    c_hdmiAoc:['{0}: HDMI {1} is past passive copper. Listed an active optical HDMI cable (one direction only, cannot be cut to length).','{0}: HDMI {1} passa do cobre passivo. Listado cabo HDMI óptico ativo (só uma direção, não pode ser cortado).'],
    c_hdmiLong:['{0}: HDMI {1} is over 15 m. HDMI isn’t practical here: listed HDMI→SDI converters at both ends. Or switch the plan to SDI.','{0}: HDMI {1} passa de 15 m. HDMI não é prático: listados conversores HDMI→SDI nas pontas. Ou mude o plano para SDI.'],
    c_sdiLong:['{0}: {1} over {2} exceeds the practical {3} m. Listed a fiber converter pair.','{0}: {1} em {2} passa dos {3} m práticos. Listado par de conversores de fibra.'],
    c_sdiOk:['SDI runs: longest {0}, within {1} m for {2}','Cabos SDI: maior {0}, dentro de {1} m para {2}'],
    c_3g:['{0} outputs 3G-SDI: 1080p only over SDI, not 2160p','{0} sai em 3G-SDI: só 1080p em SDI, não 2160p'],
    c_eth:['{0}: Cat6 {1} is over the 100 m Ethernet limit. Put a switch near the cameras with a fiber uplink.','{0}: Cat6 {1} passa do limite de 100 m. Coloque um switch perto das câmeras com uplink de fibra.'],
    c_poe:['PoE: {0} W needed, {1} W on the {2}','PoE: {0} W necessários, {1} W no {2}'],
    c_poeNo:['PoE: {0} W and {1} PoE++ ports needed; no listed switch fits, a managed PoE++ switch is to quote','PoE: {0} W e {1} portas PoE++; nenhum switch listado serve, switch PoE++ gerenciado a cotar'],
    c_unmanaged:['NDI on an unmanaged switch is fine for a few NDI|HX cameras. For NDI High Bandwidth or many cameras, use a managed switch with IGMP snooping.','NDI em switch não gerenciado serve para poucas câmeras NDI|HX. Para NDI Full ou muitas câmeras, use switch gerenciado com IGMP snooping.'],
    c_ue150:['{0}: the AW-UE150 draws up to ≈68 W on PoE++, more than a 60 W port. Planned on its AC adaptor.','{0}: a AW-UE150 consome até ≈68 W em PoE++, mais que uma porta de 60 W. Planejada na fonte AC.'],
    c_canonPoe:['{0}: Canon’s spec page lists PoE+ but also “PoE cannot be used” for some regions. Verify the US unit before relying on PoE.','{0}: a página da Canon lista PoE+ mas também “PoE não pode ser usado” em algumas regiões. Confirme a unidade US.'],
    c_422:['RS-422 carries control only: each PTZ needs an AC outlet, and video still runs on {0}','RS-422 leva só controle: cada PTZ precisa de tomada, e o vídeo continua em {0}'],
    c_noNdi:['{0} has no NDI output: an encoder at the camera is listed','{0} não tem saída NDI: encoder na câmera listado'],
    c_ndiKey:['{0}: NDI is an upgrade key on this model','{0}: NDI é chave de upgrade neste modelo'],
    c_noTgt:['{0} frames nobody. Aim it at a person or pick a subject.','{0} não enquadra ninguém. Mire em uma pessoa ou escolha um assunto.'],
    c_tgtOut:['{0}: {1} is outside the frame','{0}: {1} está fora do quadro'],
    c_inputs:['{0} inputs needed: more than the listed switchers ({1}); a larger switcher is to quote','{0} entradas: mais que os switchers listados ({1}); switcher maior a cotar'],
    c_stream:['Streaming: wired internet at the control position, about 10 Mbps up per 1080p stream (more for 4K)','Transmissão: internet cabeada no controle, cerca de 10 Mbps de upload por stream 1080p (mais para 4K)'],
    c_icom:['{0} operators on the plan: intercom listed','{0} operadores no plano: intercom listado'],
    c_approx:['{0}: figures marked approx. — verify before ordering','{0}: valores aprox. — verificar antes do pedido'],
    c_uhdHdmi:['2160p over HDMI: the ATEM Mini range is HD. Use SDI with the 4K Constellation, or quote a 4K HDMI switcher.','2160p em HDMI: a linha ATEM Mini é HD. Use SDI com o Constellation 4K, ou cote um switcher 4K HDMI.'],
    c_ok:['Nothing blocking. Cable lengths and PoE fit.','Nada bloqueando. Cabos e PoE dentro do limite.'],
    /* quote summary */
    q_title:['i9Store room plan — quote request','Plano de sala i9Store — pedido de cotação'], q_room:['Room','Sala'], q_cams:['Cameras','Câmeras'], q_sig:['Signal','Sinal'], q_list:['Equipment','Equipamentos'],
    q_priced:['Priced lines total','Total das linhas com preço'], q_quote:['Lines to quote','Linhas a cotar'], q_link:['Plan link','Link do plano'], q_checks:['Checks','Verificações'],
    live_tpl:['{0} template loaded: {1} cameras.','Modelo {0} carregado: {1} câmeras.'], live_added:['Camera {0} added.','Câmera {0} adicionada.'], live_removed:['Removed.','Removido.'],
    /* owned items (wizard step 3, the "Already have" panel) */
    youHave:['You have this','Você já tem'], ownedLines:['{0} you have','{0} você já tem'], ownCam:['You already have this camera','Você já tem esta câmera'],
    ownKick:['Already have','Já tenho'], ownH:['Left out of the shopping list','Fora da lista de compras'],
    ownP:['Ticked items stay on the plan, marked “You have this” at $0.','Itens marcados ficam no plano, como “Você já tem” a $0.'],
    r_sw:['Video switcher','Switcher de vídeo'], r_pc:['Computer / streaming','Computador / streaming'], r_aud:['Mics & audio mixer','Microfones e mesa de som'], r_lit:['Lights','Iluminação'],
    r_net:['Network / PoE switch','Rede / switch PoE'], r_tri:['Tripods','Tripés'], r_cab:['Cables','Cabos'],
    xrun:['Cable beyond the room','Cabo além da sala'], xrunHint:['Extra metres to a booth or rack outside the room, added to every run.','Metros extras até uma cabine ou rack fora da sala, somados a cada cabo.'],
    q_own:['You have (not counted)','Você já tem (não somado)'],
    g_pc:['Computer for streaming and slides','Computador para transmissão e slides'], w_pc:['Slides, lyrics or playback into the switcher','Slides, letras ou playback no switcher'],
    w_pcNdi:['Runs the NDI switching software','Roda o software de corte NDI'],
    g_ndisoft:['NDI production software (vMix class), licence','Software de produção NDI (classe vMix), licença'], w_ndisoft:['Runs on your computer and takes every camera off the network','Roda no seu computador e recebe as câmeras pela rede'],
    /* version F: the camera picker's accessories and the reach check */
    w_cage:['Rig for handles, monitor and mic','Rig para alças, monitor e microfone'], w_pwrDummy:['Mains power instead of batteries','Energia da tomada em vez de baterias'],
    g_pwrBody:['Mains power for {0}','Alimentação na tomada para {0}'], w_pwrBody:['A long service outlasts batteries; check what ships in the box','Um culto longo dura mais que as baterias; confira o que vem na caixa'],
    w_ptzCtl:['One joystick for {0} {1} PTZ over IP','Um joystick para {0} PTZ {1} via IP'],
    c_poeAC:['{0}: draws more than a 60 W PoE++ port. Planned on its AC adaptor.','{0}: consome mais que uma porta PoE++ de 60 W. Planejada na fonte AC.'],
    c_reach:['{0} is at full zoom and still frames {1} across at {2}: wider than a close-up. Move it closer, or use a longer lens or zoom.','{0} está no zoom máximo e ainda enquadra {1} em {2}: mais aberto que um close. Aproxime a câmera ou use lente / zoom maior.'],
    /* round 2: long reach */
    extK:['Extender','Extensor'], extNone:['None','Nenhum'], cropK:['Super 35 crop mode','Modo crop Super 35'], effK:['effective','efetivo'],
    w_ext:['Extender for {0}: ×{1}, {2} effective','Extensor para {0}: ×{1}, {2} efetivo'], w_adapt:['{0} lens on a {1} body','Lente {0} em corpo {1}'],
    g_heavy:['Heavy-duty support for a {0} kg lens','Suporte reforçado para lente de {0} kg'], w_heavy:['Check the tripod and head payload with a specialist','Confira a carga do tripé e da cabeça com um especialista'],
    c_dim:['{0}: {1} effective at this zoom. Rule of thumb: past about f/8 a dim room needs more light or a higher ISO.','{0}: {1} efetivo neste zoom. Regra prática: acima de f/8 uma sala escura pede mais luz ou ISO mais alto.'],
    c_ic:['{0}: the {1} covers Super 35. Turn on the body’s Super 35 crop mode or the lens’s built-in 1.5× extender.','{0}: a {1} cobre Super 35. Ligue o modo crop Super 35 do corpo ou o extensor 1,5× da lente.'],
    ctlOk:['confirmed','confirmado'],
    /* round 3: production, wireless, Canon control, lighting */
    w_canonAll:['One controller runs all {0} Canon cameras (controller firmware 1.3.0+, C50 firmware 1.0.4.1+)','Um controlador comanda as {0} câmeras Canon (firmware 1.3.0+, C50 1.0.4.1+)'],
    g_c50eth:['USB-C to Ethernet adapter for the EOS C50','Adaptador USB-C para Ethernet da EOS C50'], w_c50eth:['The C50 has no Ethernet port; Canon-tested adapters only (or Wi-Fi)','A C50 não tem porta Ethernet; só adaptadores testados pela Canon (ou Wi-Fi)'],
    c_canonAlt:['Canon RC-IP300 (not on the store) or the free Canon Remote Camera Control app (up to 20 cameras) can also run these cameras.','O Canon RC-IP300 (fora da loja) ou o app gratuito Remote Camera Control (até 20 câmeras) também comandam estas câmeras.'],
    w_wl:['Wireless camera link, about {0} m planning range indoors','Link sem fio da câmera, cerca de {0} m de alcance planejado em ambiente interno'],
    g_npf:['NP-F batteries and charger for the wireless link','Baterias NP-F e carregador para o link sem fio'], w_npf:['Transmitter on the camera, receiver at the switcher','Transmissor na câmera, receptor no switcher'],
    g_ndirx:['HDMI to NDI encoder at the wireless receiver','Encoder HDMI para NDI no receptor sem fio'],
    c_wlFar:['{0}: {1} to the receiver is past the {2} m indoor planning range of the {3}. Move the receiver closer or use a longer-range kit.','{0}: {1} até o receptor passa do alcance planejado de {2} m do {3}. Aproxime o receptor ou use um kit de maior alcance.'],
    c_wlNotes:['Wireless cameras: lock to non-DFS or 6 GHz channels for live services; add an audio delay of about 2–6 frames on the switcher; each receiver uses one switcher input; wireless SDI is 1080p max.','Câmeras sem fio: fixe canais não-DFS ou 6 GHz em cultos ao vivo; atrase o áudio uns 2–6 quadros no switcher; cada receptor usa uma entrada; SDI sem fio vai até 1080p.'],
    c_wlKit:['{0}: {1}','{0}: {1}'],
    w_swPr:['{0} camera inputs + {1} other = {2} inputs','{0} câmeras + {1} outras = {2} entradas'],
    w_panel2:['Two M/E rows on a hardware panel make the second cut practical to run','Duas fileiras M/E num painel físico tornam o segundo corte prático'],
    c_obs:['Starter level: OBS Studio (free) on a computer with a capture card is the lowest-cost way to switch, with one program out.','Nível inicial: OBS Studio (gratuito) num computador com placa de captura é o jeito mais barato, com um programa só.'],
    w_me2:['Two M/Es: M/E 1 makes the stream, M/E 2 a different cut for the screen','Dois M/Es: M/E 1 faz a transmissão, M/E 2 um corte diferente para o telão'],
    w_iso:['Records every camera separately (ISO)','Grava cada câmera separadamente (ISO)'], w_recPgm:['Records the program: this switcher has no recorder','Grava o programa: este switcher não tem gravador'], w_recIso:['One recorder per camera for ISO: this switcher records program only','Um gravador por câmera para ISO: este switcher grava só o programa'],
    w_encPr:['Streams the program: this switcher has no built-in streaming','Transmite o programa: este switcher não transmite sozinho'],
    g_scr:['Video run to the {0}, sized on site','Cabo de vídeo até o {0}, dimensionado no local'], w_scr:['{0}','{0}'],
    scr_led:['LED wall','painel de LED'], scr_proj:['projector','projetor'], scr_overflow:['overflow room','sala de apoio'],
    w_dec:['Decodes the stream for the overflow room','Decodifica a transmissão na sala de apoio'],
    c_feedSame:['The screen and the stream show the same cut.','O telão e a transmissão mostram o mesmo corte.'],
    c_feedAux:['The screen shows one source on an aux (a camera, the lyrics computer or the program), not a second mix.','O telão mostra uma fonte num aux (uma câmera, o computador de letras ou o programa), não um segundo corte.'],
    c_oneOut:['{0} has one HDMI out: feeding the screen takes away the operator’s multiview. Use the software multiview or a larger switcher.','{0} tem uma saída HDMI: alimentar o telão tira o multiview do operador. Use o multiview do software ou um switcher maior.'],
    c_st2:['Streaming to {0} platforms: the switcher streams to one destination; use a restream service or vMix (up to 5 destinations).','Transmissão para {0} plataformas: o switcher transmite para um destino; use um serviço de restream ou o vMix (até 5).'],
    g_lyr:['Lyrics / presentation computer (ProPresenter is not on the store)','Computador de letras / apresentação (ProPresenter não está na loja)'], w_lyr:['Into a switcher input; full-screen lyrics on the screen, keyed on the stream','Numa entrada do switcher; letras em tela cheia no telão, sobrepostas na transmissão'],
    g_pc:['Production computer for vMix / OBS','Computador de produção para vMix / OBS'], s_pc:['8+ cores, NVIDIA RTX-class GPU, 32 GB RAM, NVMe SSD (planning guide)','8+ núcleos, GPU classe NVIDIA RTX, 32 GB RAM, SSD NVMe (guia)'], w_pcPr:['Switches, records and streams in software','Corta, grava e transmite em software'],
    g_vmix4k:['vMix 4K or Pro licence, bought by the customer from vMix (not sold by i9)','Licença vMix 4K ou Pro, comprada pelo cliente na vMix (a i9 não vende)'], g_vmixhd:['vMix HD licence from vMix (not sold by i9), or free OBS Studio','Licença vMix HD na vMix (a i9 não vende), ou OBS Studio gratuito'],
    w_panelMini:['Control panel, no video: cuts, keys and macros on the {0}','Painel de controle, sem vídeo: cortes, keys e macros no {0}'],
    /* round 5 (26 Nov 2026): production quality follows the whole chain, and the control panel is a choice */
    w_conv12:['{0} sends 4K only over HDMI ({1}). A 12G BiDirectional converter at the camera puts it on 12G-SDI for the run: HDMI is a short-distance cable','{0} só envia 4K por HDMI ({1}). Um conversor bidirecional 12G na câmera coloca o sinal em 12G-SDI para o cabo: HDMI é cabo de curta distância'],
    w_conv3:['{0} has no SDI out: a 3G BiDirectional converter at the camera puts its 1080 HDMI on 3G-SDI for the run','{0} não tem saída SDI: um conversor bidirecional 3G na câmera coloca o HDMI 1080 em 3G-SDI para o cabo'],
    w_conv3Hd:['{0} reaches the switcher in 1080: a 3G BiDirectional converter puts its HDMI on 3G-SDI','{0} chega ao switcher em 1080: um conversor bidirecional 3G coloca o HDMI em 3G-SDI'],
    w_convHdmi:['{0} has no HDMI out: converter to the HDMI switcher','{0} não tem saída HDMI: conversor para o switcher HDMI'],
    w_convLong12:['HDMI run over 15 m: a 12G converter at each end (HDMI→SDI at the camera, SDI→HDMI at the switcher)','Cabo HDMI acima de 15 m: conversor 12G em cada ponta (HDMI→SDI na câmera, SDI→HDMI no switcher)'],
    w_convLong3:['HDMI run over 15 m: a 3G converter at each end (HDMI→SDI at the camera, SDI→HDMI at the switcher)','Cabo HDMI acima de 15 m: conversor 3G em cada ponta (HDMI→SDI na câmera, SDI→HDMI no switcher)'],
    w_wlConv:['The Accsoon receiver carries 4K only on HDMI (its SDI out stops at 1080p60): a 12G BiDirectional converter at the receiver puts the 4K picture on 12G-SDI','O receptor Accsoon só entrega 4K por HDMI (a saída SDI vai até 1080p60): um conversor bidirecional 12G no receptor coloca o 4K em 12G-SDI'],
    w_wl60:['4K at 60p: the CineView SE 4K stops at 4K30, so the Master 4K (4K60) is planned','4K a 60p: o CineView SE 4K vai até 4K30, então o plano usa o Master 4K (4K60)'],
    c_up:['{0} ({1}) can’t send {2} live ({3}): it reaches the switcher in 1080 and is up-converted. Swap to {4} for real {2}.','{0} ({1}) não envia {2} ao vivo ({3}): chega ao switcher em 1080 e é convertido para cima. Troque por {4} para {2} de verdade.'],
    c_upNo:['{0} ({1}) can’t send {2} live ({3}): it reaches the switcher in 1080 and is up-converted.','{0} ({1}) não envia {2} ao vivo ({3}): chega ao switcher em 1080 e é convertido para cima.'],
    c_unk:['{0} ({1}): the maker doesn’t state its HDMI 4K output rate; planned as {2} over HDMI, verify before ordering.','{0} ({1}): o fabricante não informa a taxa da saída 4K em HDMI; planejado como {2} em HDMI, confirme antes do pedido.'],
    c_ipHd:['{0} ({1}): its network video tops out at 1080, so on NDI it can’t carry {2}. Use SDI, or a camera with 4K NDI.','{0} ({1}): o vídeo em rede vai até 1080, então em NDI não leva {2}. Use SDI, ou uma câmera com NDI 4K.'],
    c_ipUnk:['{0} ({1}): the maker doesn’t state the network video resolution; verify {2} over NDI.','{0} ({1}): o fabricante não informa a resolução do vídeo em rede; confirme {2} em NDI.'],
    c_wlUp:['{0}: the Accsoon transmitter takes 4K only on HDMI and this camera has no 4K HDMI out, so the wireless picture is 1080.','{0}: o transmissor Accsoon só aceita 4K por HDMI e esta câmera não tem saída 4K em HDMI, então o vídeo sem fio é 1080.'],
    w_swUhd:['{0} inputs at {1}: 12G-SDI inputs, each with its own format converter (an HD source is up-converted)','{0} entradas em {1}: entradas 12G-SDI, cada uma com conversor de formato (uma fonte HD é convertida para cima)'],
    w_swHd:['{0} inputs at {1}: 3G-SDI, 1080p60 maximum','{0} entradas em {1}: 3G-SDI, máximo 1080p60'],
    c_swCmp:['4K switcher: the {0} makes the cheaper complete chain here ({1} with panel, encoder and recorder) than the {2} ({3}).','Switcher 4K: o {0} fecha a cadeia completa mais barata aqui ({1} com painel, encoder e gravador) do que o {2} ({3}).'],
    c_tvsDc:['The TV Studio 4K8 has no down-converted program output (Blackmagic lists down-conversion on its multiview only), so a 1080 projector feed needs the Constellation 4K’s HD down-converted output.','O TV Studio 4K8 não tem saída de programa convertida para baixo (a Blackmagic só lista no multiview), então o projetor em 1080 pede a saída HD do Constellation 4K.'],
    c_tvsStream:['TV Studio 4K8 streams over RTMP built in; Blackmagic doesn’t state its maximum stream resolution: verify 2160p before promising a 4K stream.','O TV Studio 4K8 transmite por RTMP embutido; a Blackmagic não informa a resolução máxima: confirme 2160p antes de prometer transmissão 4K.'],
    w_encQ4:['Streams in {0}: Streaming Encoder 4K, 12G-SDI input, up to 2160p60','Transmite em {0}: Streaming Encoder 4K, entrada 12G-SDI, até 2160p60'],
    w_encQh:['Streams in {0}: Streaming Encoder HD, up to 1080p60','Transmite em {0}: Streaming Encoder HD, até 1080p60'],
    w_encQd:['Streams in {0} from the {1} program: the Streaming Encoder HD’s 12G-SDI input down-converts Ultra HD to HD','Transmite em {0} a partir do programa {1}: a entrada 12G-SDI do Streaming Encoder HD converte Ultra HD para HD'],
    w_recQ:['Records the {0} program: {1}','Grava o programa {0}: {1}'], w_recQiso:['One recorder per camera for ISO at {0}: {1}','Um gravador por câmera para ISO em {0}: {1}'],
    s_recHd:['3G-SDI, up to 1080p60','3G-SDI, até 1080p60'], s_rec30:['6G-SDI, Ultra HD up to 2160p30','6G-SDI, Ultra HD até 2160p30'], s_rec60:['12G-SDI, up to 2160p60','12G-SDI, até 2160p60'],
    w_scrDc:['Projector in 1080: the {0}’s HD down-converted SDI output, turned into HDMI at the projector','Projetor em 1080: a saída SDI convertida para HD do {0}, virando HDMI no projetor'],
    w_scrHd:['{0} feed: the switcher’s 3G-SDI aux, turned into HDMI at the {0}','Sinal do {0}: o aux 3G-SDI do switcher, virando HDMI no {0}'],
    w_scrUhd:['{0} feed in {1}: a 12G-SDI aux, turned into HDMI at the LED processor','Sinal do {0} em {1}: um aux 12G-SDI, virando HDMI no processador do LED'],
    g_dconv:['4K → 1080 down-converter for the projector','Conversor 4K → 1080 para o projetor'], w_dconv:['This switcher has no down-converted program out','Este switcher não tem saída de programa convertida para baixo'],
    c_ledUhd:['LED wall at {0}: confirm the LED processor takes 2160p on HDMI; if it is an HD processor, feed it from the Constellation’s HD down-converted output instead.','Painel de LED em {0}: confirme que o processador aceita 2160p em HDMI; se for HD, use a saída HD convertida do Constellation.'],
    c_ledUhdT:['LED wall at {0}: confirm the LED processor takes 2160p on HDMI; for an HD processor a 4K → 1080 down-converter is to quote (the TV Studio 4K8 down-converts only its multiview).','Painel de LED em {0}: confirme que o processador aceita 2160p em HDMI; para um processador HD, um conversor 4K → 1080 fica a cotar (o TV Studio 4K8 só converte o multiview).'],
    w_mvConv:['Multiview to an HDMI monitor: the {0}’s multiview is on {1}-SDI only','Multiview num monitor HDMI: o multiview do {0} sai só em {1}-SDI'],
    q_swpn:['Switcher · control','Switcher · controle'], pn_builtin:['panel built in','painel embutido'], pn_none:['no hardware panel (ATEM Software Control)','sem painel físico (ATEM Software Control)'],
    w_pnlPick:['Control panel ({0}): {1}','Painel de controle ({0}): {1}'], pnlAuto:['suggested for {0} inputs at this level','sugerido para {0} entradas neste nível'], pnlMine:['your choice','sua escolha'],
    c_pnlFall:['The control panel you picked doesn’t fit the {0}; the suggested one is used instead.','O painel escolhido não serve no {0}; o sugerido foi usado.'],
    g_cap4k:['4K capture card, 12G-SDI, for the computer','Placa de captura 4K, 12G-SDI, para o computador'], w_cap4k:['The listed DeckLink Duo 2 / Quad 2 are 3G-SDI (HD): 4K capture is to quote','As DeckLink Duo 2 / Quad 2 listadas são 3G-SDI (HD): captura 4K a cotar'],
    g_bst:['Visual Productions B-Station2 wall panel','Painel de parede Visual Productions B-Station2'], s_vp:['to quote · Visual Productions, represented by i9','a cotar · Visual Productions, representada pela i9'],
    g_kiosc:['Kiosc app on your iPad (App Store)','App Kiosc no seu iPad (App Store)'],
    g_crmx:['Wireless DMX (CRMX) transmitter + receivers','Transmissor + receptores DMX sem fio (CRMX)'], s_crmx:['{0} receiver(s) for fixtures without built-in CRMX','{0} receptor(es) para luzes sem CRMX embutido'],
    g_svc:['Services · i9TV','Serviços · i9TV'], g_inst:['Installation','Instalação'], g_train:['Training (by i9TV)','Treinamento (pela i9TV)'], g_sla:['Support SLA','SLA de suporte'],
    g_prog:['Lighting programming: scenes on the controller','Programação de luz: cenas no controlador'], g_klay:['Kiosc panel layout','Layout do painel Kiosc'], g_comp:['Bitfocus Companion bridge (lights → ATEM / OBS)','Ponte Bitfocus Companion (luz → ATEM / OBS)'], g_vtcp:['vMix TCP automation from the CueCore3','Automação TCP do vMix pela CueCore3'],
    w_svc:['Sized with you; a specialist prices it','Dimensionado com você; um especialista orça'], w_vmix:['Not on the store; Mix 2 → Output 2 gives the screen its own cut on 4K / Pro','Fora da loja; Mix 2 → Output 2 dá ao telão um corte próprio no 4K / Pro'],
    w_card:['Captures {0} camera inputs into the computer','Captura {0} entradas de câmera no computador'],
    w_l_key:['Key light, one per person on camera','Luz principal, uma por pessoa em cena'], w_l_fill:['Soft fill','Preenchimento suave'], w_l_back:['Back / hair light','Contraluz'], w_l_bg:['Background colour','Cor de fundo'], w_l_wash:['Stage wash','Luz geral de palco'],
    w_cue:['Lighting controller: scenes, schedules, 4 DMX ports','Controlador de luz: cenas, horários, 4 portas DMX'], w_panel:['The pastor / host panel: one-touch scenes','Painel do pastor / apresentador: cenas com um toque'],
    w_relay:['Switches a mains ON AIR sign from the scene (installed by an electrician)','Liga uma placa ON AIR na tomada pela cena (instalada por eletricista)'],
    g_dmxrun:['DMX cable runs, 5-pin, sized on site','Cabos DMX de 5 pinos, dimensionados no local'], g_jack:['3.5 mm to 5-pin DMX cable for the Forza 150B','Cabo DMX 3,5 mm para 5 pinos da Forza 150B'],
    w_crmxTx:['Wireless DMX (CRMX) transmitter on the controller','Transmissor DMX sem fio (CRMX) no controlador'], w_crmxRx:['CRMX receiver for fixtures without built-in CRMX','Receptor CRMX para luzes sem CRMX'],
    c_noDmx:['{0} has no DMX: app or remote only, outside the lighting scenes.','{0} não tem DMX: só app ou controle, fora das cenas.'],
    c_dmxVerify:['{0}: {1}','{0}: {1}'],
    c_vmixAuto:['One button can start the service: the CueCore3 sends TCP to vMix (port 8099) with the lights scene. Each end is documented; Visual Productions publishes no direct note.','Um botão pode iniciar o culto: a CueCore3 envia TCP ao vMix (porta 8099) com a cena de luz. Cada lado é documentado; a Visual Productions não publica nota direta.'],
    c_compAuto:['To trigger an ATEM or OBS from the lighting scenes you need Bitfocus Companion on a computer as a bridge (not documented by Visual Productions).','Para acionar um ATEM ou OBS pelas cenas de luz é preciso o Bitfocus Companion num computador como ponte (não documentado pela Visual Productions).'],
    c_app:['Lights run on the maker’s app ({0}) at this level, outside any scenes.','Luzes pelo app do fabricante ({0}) neste nível, fora de cenas.'],
    c_spec:['{0}: {1} does not meet the role’s spec ({2}); check it or pick another light.','{0}: {1} não atende a especificação do papel ({2}); confira ou escolha outra luz.'],
    c_noFix:['{0}: no store listing meets the spec ({1}); to quote.','{0}: nenhum produto da loja atende ({1}); a cotar.'],
    g_splay:['ENTTEC S-PLAY MINI scene controller','Controlador de cenas ENTTEC S-PLAY MINI'],
    c_splay:['S-PLAY MINI: no schedules and no TCP to vMix. Keep the CueCore3 for the one-button “start service” or timed scenes.','S-PLAY MINI: sem agendamento e sem TCP para o vMix. Mantenha a CueCore3 para o botão “iniciar culto” ou cenas agendadas.'],
    c_wifiPanel:['Only the button presses travel over Wi-Fi (Kiosc / KioscTouch2 / B-Station2); the light signal stays on cable.','Só os toques nos botões vão pelo Wi-Fi (Kiosc / KioscTouch2 / B-Station2); o sinal de luz segue no cabo.'],
    g_crmxTx:['CRMX transmitter (LumenRadio CRMX Luna class) on a CueCore3 DMX port','Transmissor CRMX (classe LumenRadio CRMX Luna) numa porta DMX da CueCore3'],
    g_crmxRx:['CRMX receivers: Luna for fixed lights, Ratpac Cintenna 2 for battery / moving lights','Receptores CRMX: Luna para luzes fixas, Ratpac Cintenna 2 para luzes a bateria / móveis'],
    w_crmxOnly:['Only where cable can’t run; lights with CRMX built in need no receiver','Só onde o cabo não passa; luzes com CRMX embutido dispensam receptor'], s_rep:['to quote · represented by i9','a cotar · representado pela i9'],
    g_node:['Art-Net / sACN → DMX node by the fixtures (ENTTEC ODE Mk3, PoE, 2 universes, or VP RdmNode)','Nó Art-Net / sACN → DMX junto às luzes (ENTTEC ODE Mk3, PoE, 2 universos, ou VP RdmNode)'],
    g_noderun:['Cat6 run from the control desk to the DMX node','Cabo Cat6 da mesa de controle até o nó DMX'], g_dmxshort:['Short DMX runs from the node to the fixtures','Cabos DMX curtos do nó até as luzes'],
    c_node:['The lights are {0} from the control desk: past about 30 m (rule of thumb) the plan runs Ethernet to a DMX node by the stage instead of one long DMX line.','As luzes estão a {0} da mesa: acima de ~30 m (regra prática) o plano leva Ethernet até um nó DMX junto ao palco em vez de um cabo DMX longo.'],
    g_ldes:['Lighting design · i9TV suggests','Projeto de luz · sugestão da i9TV'], s_ldes:['to quote','a cotar'],
    /* auto-dim (owner, 26 Nov 2026: "adjust the brightness … look good and simple for the user") */
    r_key:['Key','Principal'], r_fill:['Fill','Preenchimento'], r_back:['Back','Contraluz'], r_bg:['Background','Fundo'], r_wash:['Stage wash','Luz de palco'],
    w_dimAt:['{0} dimmer {1}','Dimmer {0} {1}'], w_dimSite:['{0}: level set on site','{0}: nível ajustado no local'],
    c_dimShort:['{0} light: {1} at 100 % can’t reach the look from there. It needs a brighter light or move it closer.{2}','Luz {0}: {1} a 100 % não chega ao look daí. Precisa de uma luz mais forte ou mais perto.{2}'],
    c_dimAlt:[' The {0} would reach it.',' A {0} chegaria lá.'],
    c_dimTiny:['{0} light: {1} would need {2}; a smaller light would do.','Luz {0}: {1} precisaria de {2}; uma luz menor resolve.'],
    camLabel:['CAM {0}','CAM {0}'], ctrlLabel:['CTRL · switcher','CTRL · switcher'], facing:['facing','virada para'],
  };
  let LANG = 'en';
  try { LANG = localStorage.getItem('i9g-lang') === 'pt' ? 'pt' : 'en'; } catch (e) {}
  const t = (k, ...a) => { const w = W[k]; let s = w ? w[LANG === 'pt' ? 1 : 0] : k; a.forEach((v, i) => { s = s.split('{' + i + '}').join(v); }); return s; };
  const pname = n => (W[n] ? t(n) : n.startsWith('p_person:') ? t('p_person', n.split(':')[1]) : n);

  /* ======================= templates ======================= */
  const TPL = {
    podcast: { w:5.5, d:4.5, tr:'hdmi', fmt:'hd', ext:0, audio:'podcast', lit:'podcast',
      furn:[{ k:'table', x:2.75, y:1.9, w:1.6, h:0.9 }],
      ppl:[{ n:'p_host', x:1.75, y:1.9, a:90 }, { n:'p_guest', x:3.75, y:1.9, a:270 }, { n:'p_cohost', x:2.75, y:1.15, a:180 }],
      ctrl:{ x:2.75, y:4.2 },
      cams:[{ k:'lens', m:'r50v', lens:'kit', x:2.75, y:3.85, mnt:'tripod', man:false, aim:'all', shot:'wide' },
            { k:'ptz', m:'tail2', x:1.0, y:3.5, mnt:'tripod', aim:1, shot:'mcu' },
            { k:'ptz', m:'tail2', x:4.5, y:3.5, mnt:'tripod', aim:0, shot:'mcu' }] },
    church: { w:18, d:24, tr:'ip', fmt:'hd', ext:1, audio:'church', lit:'church',
      furn:[{ k:'stage', x:9, y:2.5, w:12, h:5 }, { k:'pulpit', x:9, y:3.6, w:0.7, h:0.5 }, { k:'seats', x:9, y:13.6, w:14, h:11 }],
      ppl:[{ n:'p_pastor', x:9, y:3.0, a:180 }, { n:'p_worship', x:5.5, y:2.2, a:180 }, { n:'p_music', x:12.6, y:1.8, a:180 }],
      ctrl:{ x:9, y:22.9 },
      cams:[{ k:'ptz', m:'crn300', x:9, y:21.8, mnt:'table', aim:0, shot:'mcu' },
            { k:'ptz', m:'crn300', x:0.6, y:10, mnt:'wall', aim:0, shot:'mcu' },
            { k:'ptz', m:'crn300', x:17.4, y:9, mnt:'wall', aim:'all', shot:'wide' }] },
    studio: { w:10, d:8, tr:'sdi', fmt:'hd', ext:1, audio:'studio', lit:'studio',
      furn:[{ k:'set', x:5, y:0.4, w:8, h:0.4 }, { k:'desk', x:5, y:2.6, w:2.4, h:0.8 }],
      ppl:[{ n:'p_anchorA', x:4.4, y:2.0, a:180 }, { n:'p_anchorB', x:5.6, y:2.0, a:180 }],
      ctrl:{ x:8.9, y:7.2 },
      cams:[{ k:'lens', m:'bm4k', lens:'mk1855', x:5, y:5.8, mnt:'tripod', man:true, aim:'all', shot:'wide' },
            { k:'lens', m:'bm4k', lens:'mk1855', x:3.4, y:4.6, mnt:'tripod', man:true, aim:1, shot:'mcu' },
            { k:'lens', m:'bm4k', lens:'mk1855', x:6.6, y:4.6, mnt:'tripod', man:true, aim:0, shot:'mcu' }] },
    event: { w:30, d:20, tr:'sdi', fmt:'hd', ext:1, audio:'event', lit:'event',
      furn:[{ k:'stage', x:15, y:2.5, w:14, h:5 }, { k:'pulpit', x:19, y:3.3, w:0.6, h:0.5 }, { k:'seats', x:15, y:11.5, w:22, h:9 }],
      ppl:[{ n:'p_presenter', x:14, y:2.8, a:180 }, { n:'p_speaker', x:19, y:2.75, a:180 }],
      ctrl:{ x:15, y:19.1 },
      cams:[{ k:'ptz', m:'ue80', x:15, y:17.8, mnt:'table', aim:0, shot:'mcu' },
            { k:'cc', m:'xf605', x:5, y:7, mnt:'tripod', man:true, aim:'all', shot:'wide' },
            { k:'cc', m:'xf605', x:25, y:7, mnt:'tripod', man:true, aim:1, shot:'mcu' }] },
    empty: { w:8, d:6, tr:'hdmi', fmt:'hd', ext:0, audio:'empty', lit:'empty',
      furn:[], ppl:[{ n:'p_person:1', x:4, y:2.6, a:180 }], ctrl:{ x:5.4, y:5.5 },
      cams:[{ k:'ptz', m:'ue20', x:4, y:5.3, mnt:'tripod', aim:0, shot:'med' }] },
  };
  const TORDER = ['podcast', 'church', 'studio', 'event', 'empty'];
  const FURN = { table:{ w:1.8, h:0.9 }, desk:{ w:2.4, h:0.8 }, pulpit:{ w:0.7, h:0.5 }, stage:{ w:8, h:4 }, seats:{ w:8, h:6 }, set:{ w:6, h:0.4 } };

  /* setups (browse-core.js I9S.SET) -> the closest template. The setup's own cameras replace the template's when
     planner-data.js models them; they take the template's camera positions (same kind first), aims and shots. */
  const SETUP_TPL = { 'church-1op':'church', 'church-3ptz':'church', 'podcast-2cam':'podcast', 'broadcast-studio':'studio', 'event-2cam':'event',
    'creator-desk':'empty', 'corporate-room':'studio', 'council-chamber':'event', 'interview-kit':'empty', 'control-rack':'empty' };
  const SOL_TPL = { church:'church', podcast:'podcast', broadcast:'studio', events:'event', corporate:'studio', education:'event', creator:'empty', production:'empty', integrator:'empty' };
  const TPL_SETUP = { podcast:'podcast-2cam', church:'church-3ptz', studio:'broadcast-studio', event:'event-2cam' };
  const SETS = () => (window.I9S && window.I9S.SET) || {};
  const tplForSetup = id => SETUP_TPL[id] || SOL_TPL[(SETS()[id] || {}).sol] || 'empty';
  const camKind = m => D.PTZ[m] ? 'ptz' : D.CAMCORDER[m] ? 'cc' : D.BODIES[m] ? 'lens' : null;
  /* a camera line in a parts list: modelled by the planner, or a Cameras listing that is not a controller */
  const isCamItem = id => !!camKind(id) || (P[id] && P[id].dept === 'Cameras' && !/controller|joystick/i.test((P[id].sub || '') + ' ' + P[id].name));

  /* ======================= state ======================= */
  /* what the customer may already own (wizard step 3 / the "Already have" panel). Cameras are owned per camera (c.own). */
  const ROLES = ['sw', 'pc', 'aud', 'lit', 'net', 'tri', 'cab'];
  let S, uid = 1, sel = null;
  let Z = null;        /* the guided wizard's own state, kept in the same #p= hash (planner-wizard.js reads/writes it) */
  let zGet = null;
  let SETUP = null;   /* { id, tpl, title, loaded:[{m,q}], missing:[{id,q}] } while the plan comes from a setup */
  let BASE = '';      /* the untouched plan for the current template / setup: an edit is any difference from it */
  const nid = () => uid++;

  /* a plan from a spec: a template, or a layout the guided wizard composed (planner-wizard.js). key = the style template
     (audio, lighting, labels). Optional: ctl, xr (cable metres beyond the room, e.g. a booth next door), own (roles the
     customer already has), per camera own:true. */
  function fromSpec(T, key) {
    const s = { tpl:key, w:T.w, d:T.d, unit:S ? S.unit : 'm', tr:T.tr, fmt:T.fmt, ctl:T.ctl === '422' ? '422' : 'ip', ext:T.ext || 0, xr:T.xr || 0, own:(T.own || []).filter(r => ROLES.includes(r)),
      pr:T.pr ? { ...T.pr } : null, lt:T.lt ? { ...T.lt } : null,
      furn:T.furn.map(f => ({ id:nid(), ...f })), ppl:T.ppl.map(p => ({ id:nid(), ...p })), ctrl:{ ...T.ctrl }, cams:[] };
    T.cams.forEach(c => {
      const cam = newCam(c.k, c.m, s, c);
      if (c.own) cam.own = true;
      s.cams.push(cam);
    });
    S = s;
    T.cams.forEach((c, i) => frameCam(S.cams[i], c.shot, c.aim));
    return s;
  }
  function fromTemplate(key) { return fromSpec(TPL[key], key); }
  function fromSetup(id) {
    const st = SETS()[id]; if (!st) return null;
    const key = tplForSetup(id), T = TPL[key];
    fromTemplate(key);
    const info = { id, tpl:key, title:st.title, loaded:[], missing:[] };
    const units = [];
    st.items.forEach(it => {
      if (!isCamItem(it.id)) return;
      const k = camKind(it.id);
      if (k && P[it.id]) { info.loaded.push({ m:it.id, q:it.q }); for (let i = 0; i < it.q; i++) units.push({ k, m:it.id }); }
      else info.missing.push({ id:it.id, q:it.q });
    });
    if (!units.length) return info;   /* nothing modelled: keep the template's cameras, the Checks panel says so */
    const lensIds = st.items.map(it => it.id).filter(l => D.LENSES[l]);
    const used = new Set(), spec = [];
    S.cams = units.map((u, n) => {
      let si = T.cams.findIndex((c, i) => !used.has(i) && c.k === u.k);
      if (si < 0) si = T.cams.findIndex((c, i) => !used.has(i));
      let o;
      if (si >= 0) { used.add(si); o = T.cams[si]; }
      else o = { x:S.w * (n + 1) / (units.length + 1), y:S.d * 0.85, mnt:'tripod', aim:'all', shot:'wide' };
      let lens = null;
      if (u.k === 'lens') { const mt = D.BODIES[u.m].mount; lens = lensIds.find(l => D.LENSES[l].mount === mt) || (o.lens && D.LENSES[o.lens] && D.LENSES[o.lens].mount === mt ? o.lens : null); }
      spec.push(o);
      return newCam(u.k, u.m, S, { x:o.x, y:o.y, mnt:o.mnt, man:u.k === 'ptz' ? false : (o.man ?? true), lens });
    });
    S.cams.forEach((c, i) => frameCam(c, spec[i].shot, spec[i].aim));
    return info;
  }
  /* edits = any difference from the untouched template / setup plan (units are a display choice, not an edit) */
  const planKey = () => { const o = packPlan(); o.u = null; if (o.lt && o.lt.look) o.lt = { ...o.lt, look:undefined }; return JSON.stringify(o); };   /* the look only moves dimmers: not a plan change */
  function pristine(tpl, setupId) { const keep = S; if (setupId) fromSetup(setupId); else fromTemplate(tpl); const k = planKey(); S = keep; return k; }
  const fromThisSetup = () => SETUP && SETUP.tpl === S.tpl;
  function newCam(k, m, s, o = {}) {
    const c = { id:nid(), k, m, x:o.x ?? s.w / 2, y:o.y ?? s.d * 0.85, a:o.a ?? 0, z:0, f:0, lens:o.lens || null, sf:null,
      mnt:o.mnt || (k === 'ptz' ? 'wall' : 'tripod'), man:o.man ?? (k !== 'ptz'), tgt:-1, ext:o.ext || null, crop:!!o.crop, mob:!!o.mob };
    if (k === 'lens') { const b = D.BODIES[m]; c.sf = b.fmt; if (!c.lens) c.lens = defaultLens(m); c.f = lensRange(c)[0]; }
    return c;
  }
  function defaultLens(m) { const b = D.BODIES[m]; if (b.kit) return 'kit'; const pre = ((D.PRESETS || {})[b.mount] || []).find(k => D.LENSES[k] && P[k]); if (pre) return pre; const l = Object.keys(D.LENSES).find(k => D.LENSES[k].mount === b.mount && P[k]); return l || 'other'; }
  /* version F round 2: an extender multiplies the focal range (from its allowed focal length up) and costs light */
  const extOf = c => { const e = c && c.ext && D.EXT && D.EXT[c.ext]; return e && e.lenses.includes(c.lens) ? e : null; };
  const extApx = e => e ? (e.apx || Math.pow(2, e.stops / 2)) : 1;
  function baseRange(c) {
    const b = D.BODIES[c.m];
    if (c.lens === 'kit' && b.kit) return [b.kit.min, b.kit.max];
    if (D.LENSES[c.lens]) return [D.LENSES[c.lens].min, D.LENSES[c.lens].max];
    return D.OTHER_LENS[b.mount] || [12, 120];
  }
  function lensRange(c) {
    const r = baseRange(c), e = extOf(c); if (!e) return r;
    const from = D.LENSES[c.lens].ext; const lo = typeof from === 'number' ? Math.max(r[0], from) : r[0];
    return [lo * e.x, r[1] * e.x];
  }
  /* max aperture at the current focal length (linear between the lens's two marked apertures), extender included */
  function apAt(c) {
    const b = D.BODIES[c.m], L0 = c.lens === 'kit' ? b.kit : D.LENSES[c.lens]; if (!L0 || !L0.ap) return null;
    const e = extOf(c), f0 = c.f / (e ? e.x : 1), t = L0.max > L0.min ? clamp((f0 - L0.min) / (L0.max - L0.min), 0, 1) : 1;
    return (L0.ap[0] + (L0.ap[1] - L0.ap[0]) * t) * extApx(e);
  }
  const FSTOPS = [1.2, 1.4, 1.8, 2, 2.8, 2.9, 3.5, 4, 4.4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14, 16, 18, 20, 22, 25, 32];
  const fNum = a => 'f/' + FSTOPS.reduce((b, v) => Math.abs(Math.log(v / a)) < Math.abs(Math.log(b / a)) ? v : b, FSTOPS[0]);
  const sensorW = c => { const b = D.BODIES[c.m]; if (c.crop && b.crop) return b.crop.w; return c.sf === b.fmt ? b.w : D.FORMATS[c.sf].w; };
  const zspec = c => c.k === 'ptz' ? D.PTZ[c.m] : c.k === 'cc' ? D.CAMCORDER[c.m] : null;

  /* ======================= optics ======================= */
  function hfov(c) {
    const z = zspec(c);
    if (z) { const tw = Math.tan(rad(z.hW / 2)), tt = Math.tan(rad(z.hT / 2)); return 2 * deg(Math.atan(tw * Math.pow(tt / tw, c.z))); }
    return 2 * deg(Math.atan(sensorW(c) / (2 * c.f)));
  }
  function setHfov(c, h) {
    const z = zspec(c);
    if (z) { const tw = Math.tan(rad(z.hW / 2)), tt = Math.tan(rad(z.hT / 2)); c.z = clamp(Math.log(Math.tan(rad(h / 2)) / tw) / Math.log(tt / tw), 0, 1); return; }
    const [a, b] = lensRange(c); c.f = clamp(sensorW(c) / (2 * Math.tan(rad(h / 2))), a, b);
  }
  const zoomX = c => { const z = zspec(c); return z ? Math.pow(z.zoom, c.z) : 1; };
  const dirv = a => [Math.sin(rad(a)), -Math.cos(rad(a))];
  function rel(c, p) {
    const [dx, dy] = dirv(c.a), vx = p.x - c.x, vy = p.y - c.y;
    const depth = vx * dx + vy * dy, lat = vx * -dy + vy * dx;   /* right-hand perpendicular */
    return { depth, lat, off: deg(Math.atan2(lat, depth)), dist: Math.hypot(vx, vy) };
  }
  function view(c) {
    const h = hfov(c), half = h / 2;
    const ppl = S.ppl.map((p, i) => ({ p, i, ...rel(c, p) }));
    const inF = ppl.filter(q => q.depth > 0.3 && Math.abs(q.off) <= half + 1);
    let tg = null;
    if (c.tgt >= 0 && S.ppl[c.tgt]) tg = ppl[c.tgt];
    else if (inF.length) tg = inF.slice().sort((a, b) => Math.abs(a.off) - Math.abs(b.off) || a.depth - b.depth)[0];
    const out = tg && !inF.includes(tg);
    const fw = tg && tg.depth > 0 ? 2 * tg.depth * Math.tan(rad(half)) : null;
    let cls = null; if (fw != null) cls = R.shots.find(s => fw <= s[1])[0];
    return { h, ppl, inF, tg, out, fw, cls, n: inF.length };
  }
  function frameCam(c, shot, aim) {
    let tgIdx = typeof aim === 'number' ? aim : null;
    if (aim === 'all' || shot === 'wide') {
      const pts = S.ppl; if (!pts.length) return;
      if (aim === 'all' || tgIdx == null) {
        const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length, cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
        c.a = (deg(Math.atan2(cx - c.x, -(cy - c.y))) + 360) % 360;
      } else { const p = S.ppl[tgIdx]; c.a = (deg(Math.atan2(p.x - c.x, -(p.y - c.y))) + 360) % 360; }
      const offs = pts.map(p => rel(c, p)).filter(q => q.depth > 0.2).map(q => Math.abs(q.off) + deg(Math.atan(0.35 / Math.max(q.depth, 0.5))));
      setHfov(c, Math.max(8, 2 * Math.max(...offs, 4)));
      c.tgt = aim === 'all' ? -1 : (tgIdx ?? -1);
      return;
    }
    if (tgIdx == null) { const v = view(c); if (!v.tg) return; tgIdx = v.tg.i; }
    const p = S.ppl[tgIdx]; if (!p) return;
    c.a = (deg(Math.atan2(p.x - c.x, -(p.y - c.y))) + 360) % 360;
    const d = Math.hypot(p.x - c.x, p.y - c.y);
    setHfov(c, 2 * deg(Math.atan(R.frameFor[shot] / (2 * d))));
    c.tgt = tgIdx;
  }
  function cone(c, h) {
    const pts = [[c.x, c.y]], n = 28;
    for (let i = 0; i <= n; i++) {
      const a = c.a - h / 2 + h * i / n, [dx, dy] = dirv(a);
      let tm = Infinity;
      if (dx > 1e-9) tm = Math.min(tm, (S.w - c.x) / dx); if (dx < -1e-9) tm = Math.min(tm, -c.x / dx);
      if (dy > 1e-9) tm = Math.min(tm, (S.d - c.y) / dy); if (dy < -1e-9) tm = Math.min(tm, -c.y / dy);
      pts.push([c.x + dx * tm, c.y + dy * tm]);
    }
    return pts;
  }
  /* cable run: orthogonal route camera → control along floor/walls, + rise at each end, +20 %, +2 m */
  function runOf(c) {
    const flat = Math.abs(c.x - S.ctrl.x) + Math.abs(c.y - S.ctrl.y);
    return (flat + R.rise[c.mnt] + R.riseCtrl + (S.xr || 0)) * (1 + R.slackPct) + R.slackM;
  }
  const lenTxt = m => S.unit === 'ft' ? Math.ceil(m * FT) + ' ft' : (m < 10 ? m.toFixed(1) : Math.round(m)) + ' m';
  const buyLen = m => S.unit === 'ft' ? Math.ceil(m * FT / 5) * 5 + ' ft' : Math.ceil(m) + ' m';
  const camLab = i => t('camLabel', i + 1);
  const modelName = c => P[c.m] ? P[c.m].brand + ' ' + P[c.m].name : c.m;
  const isApprox = c => { if (c.k === 'lens') { const b = D.BODIES[c.m]; return !!b.approx || (c.crop && b.crop && !!b.crop.approx) || (!c.crop && c.sf !== b.fmt && D.FORMATS[c.sf].approx); } const z = zspec(c); return !!(z && z.approx); };

  /* ======================= plan rendering ======================= */
  const svg = $('#plan'), box = $('#planbox');
  let k = 0.01, pad = 1;
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const a in attrs) e.setAttribute(a, attrs[a]); if (parent) parent.appendChild(e); return e; };
  const set = (e, attrs) => { for (const a in attrs) e.setAttribute(a, attrs[a]); return e; };
  const L = {};
  function layers() {
    svg.innerHTML = '';
    const defs = el('defs', {}, svg);
    const pat = el('pattern', { id:'hatch', width:0.4, height:0.4, patternUnits:'userSpaceOnUse', patternTransform:'rotate(45)' }, defs);
    el('line', { x1:0, y1:0, x2:0, y2:0.4, class:'hatch' }, pat);
    ['stat', 'runs', 'cones', 'furn', 'lits', 'ppl', 'ctrl', 'ann', 'cams'].forEach(n => { L[n] = el('g', { class:'l-' + n }, svg); });
  }
  function measure() {
    const vbW = S.w + pad * 2.4, vbH = S.d + pad * 2.2;
    const cw = box.clientWidth || 800, ch = box.clientHeight || 600;
    k = Math.max(vbW / cw, vbH / ch);
  }
  function renderStatic() {
    pad = Math.max(0.9, 0.07 * Math.max(S.w, S.d));
    svg.setAttribute('viewBox', `${-pad * 1.4} ${-pad} ${S.w + pad * 2.4} ${S.d + pad * 2.2}`);
    box.style.setProperty('--plan-ar', ((S.w + pad * 2.4) / (S.d + pad * 2.2)).toFixed(3));
    measure();
    const g = L.stat; g.innerHTML = '';
    el('rect', { x:0, y:0, width:S.w, height:S.d, class:'room' }, g);
    const maxd = Math.max(S.w, S.d);
    let minor, major;
    if (S.unit === 'ft') { const f = 1 / FT; [minor, major] = maxd <= 10 ? [f, 5 * f] : maxd <= 25 ? [5 * f, 25 * f] : [10 * f, 50 * f]; }
    else [minor, major] = maxd <= 10 ? [0.5, 1] : maxd <= 25 ? [1, 5] : [2, 10];
    const gr = el('g', { class:'grid' }, g);
    for (let x = minor; x < S.w - 1e-6; x += minor) el('line', { x1:x, y1:0, x2:x, y2:S.d, class: Math.abs(x / major - Math.round(x / major)) < 1e-4 ? 'maj' : 'min' }, gr);
    for (let y = minor; y < S.d - 1e-6; y += minor) el('line', { x1:0, y1:y, x2:S.w, y2:y, class: Math.abs(y / major - Math.round(y / major)) < 1e-4 ? 'maj' : 'min' }, gr);
    el('rect', { x:0, y:0, width:S.w, height:S.d, class:'walls' }, g);
    const fs = 11 * k;
    const dimW = S.unit === 'ft' ? (S.w * FT).toFixed(1) + ' ft' : S.w.toFixed(1) + ' m', dimD = S.unit === 'ft' ? (S.d * FT).toFixed(1) + ' ft' : S.d.toFixed(1) + ' m';
    el('line', { x1:0, y1:-pad * 0.45, x2:S.w, y2:-pad * 0.45, class:'dim' }, g);
    el('text', { x:S.w / 2, y:-pad * 0.45 - 6 * k, class:'dimt', 'text-anchor':'middle', 'font-size':fs }, g).textContent = dimW;
    el('line', { x1:-pad * 0.55, y1:0, x2:-pad * 0.55, y2:S.d, class:'dim' }, g);
    const td = el('text', { x:-pad * 0.55 - 6 * k, y:S.d / 2, class:'dimt', 'text-anchor':'middle', 'font-size':fs, transform:`rotate(-90 ${-pad * 0.55 - 6 * k} ${S.d / 2})` }, g); td.textContent = dimD;
    /* scale bar */
    const opts = S.unit === 'ft' ? [5, 10, 25, 50, 100].map(v => [v / FT, v + ' ft']) : [[1, '1 m'], [2, '2 m'], [5, '5 m'], [10, '10 m']];
    const sb = opts.find(o => o[0] >= S.w * 0.14) || opts[opts.length - 1];
    const sy = S.d + pad * 0.6;
    el('rect', { x:0, y:sy - 3 * k, width:sb[0], height:6 * k, class:'sbar' }, g);
    el('rect', { x:0, y:sy - 3 * k, width:sb[0] / 2, height:6 * k, class:'sbar2' }, g);
    el('text', { x:sb[0] + 8 * k, y:sy + 4 * k, class:'dimt', 'font-size':fs }, g).textContent = sb[1];
    el('text', { x:S.w, y:sy + 4 * k, class:'dimt', 'text-anchor':'end', 'font-size':fs }, g).textContent = t('t_' + S.tpl).toUpperCase() + ' · ' + t('room').toUpperCase();
  }
  const pool = { cones:new Map(), runs:new Map(), furn:new Map(), ppl:new Map(), cams:new Map(), ann:new Map() };
  function sync(map, items, layer, make) {
    const keep = new Set(items.map(o => o.id));
    for (const [id, e] of map) if (!keep.has(id)) { e.remove(); map.delete(id); }
    items.forEach(o => { if (!map.has(o.id)) { const e = make(o); layer.appendChild(e); map.set(o.id, e); } });
  }
  function renderPlan() {
    const views = S.cams.map(view);
    const sid = sel && sel.kind === 'cam' ? S.cams[sel.i]?.id : null;
    /* cones */
    sync(pool.cones, S.cams, L.cones, () => el('polygon', { class:'cone' }));
    S.cams.forEach((c, i) => set(pool.cones.get(c.id), { points: cone(c, views[i].h).map(p => p.map(r2).join(',')).join(' '), class:'cone' + (c.id === sid ? ' on' : '') }));
    /* runs */
    sync(pool.runs, S.cams, L.runs, () => { const g = el('g', { class:'run' }); el('polyline', {}, g); el('text', { 'text-anchor':'middle' }, g); return g; });
    S.cams.forEach(c => {
      const g = pool.runs.get(c.id), on = c.id === sid;
      g.setAttribute('class', 'run' + (on ? ' on' : ''));
      g.firstChild.setAttribute('points', `${r2(c.x)},${r2(c.y)} ${r2(c.x)},${r2(S.ctrl.y)} ${r2(S.ctrl.x)},${r2(S.ctrl.y)}`);
      const midY = Math.abs(S.ctrl.y - c.y) > 40 * k ? (c.y + S.ctrl.y) / 2 : null;
      const nearX = Math.abs(S.ctrl.x - c.x) < 90 * k;
      const tx = g.lastChild; set(tx, midY != null ? { x:c.x + 7 * k, y:midY, 'font-size':10.5 * k, 'text-anchor':'start' } : nearX ? { x:c.x - 22 * k, y:c.y + 4 * k, 'font-size':10.5 * k, 'text-anchor':'end' } : { x:(c.x + S.ctrl.x) / 2, y:S.ctrl.y - 8 * k, 'font-size':10.5 * k, 'text-anchor':'middle' });
      tx.textContent = on ? runCable(c) + ' · ' + lenTxt(runOf(c)) : '';
    });
    /* furniture */
    sync(pool.furn, S.furn, L.furn, f => { const g = el('g', { class:'obj furn', tabindex:0, role:'button' }); el('rect', {}, g); el('rect', { class:'ring' }, g); el('text', { 'text-anchor':'middle' }, g); return g; });
    S.furn.forEach((f, i) => {
      const g = pool.furn.get(f.id), on = sel && sel.kind === 'furn' && sel.i === i;
      set(g, { class:'obj furn f-' + f.k + (on ? ' sel' : ''), 'data-kind':'furn', 'data-i':i, 'aria-label': t('f_' + f.k) + ', ' + lenTxt(f.w) + ' × ' + lenTxt(f.h) });
      set(g.children[0], { x:f.x - f.w / 2, y:f.y - f.h / 2, width:f.w, height:f.h, class:'fb' });
      set(g.children[1], { x:f.x - f.w / 2 - 3 * k, y:f.y - f.h / 2 - 3 * k, width:f.w + 6 * k, height:f.h + 6 * k, class:'ring' });
      const big = f.w > 3 && f.h > 2, tiny = f.w < 60 * k || f.h < 20 * k;
      set(g.children[2], { x:f.x, y: big ? f.y - f.h / 2 + 16 * k : tiny ? f.y + f.h / 2 + 13 * k : f.y + 4 * k, 'font-size':10.5 * k });
      g.children[2].textContent = t('f_' + f.k).toUpperCase();
    });
    /* control position */
    if (!L.ctrl.firstChild) { const g = el('g', { class:'obj ctrl', tabindex:0, role:'button', 'data-kind':'ctrl', 'data-i':0 }, L.ctrl); el('rect', { class:'cb' }, g); el('rect', { class:'ring' }, g); el('rect', { class:'tl' }, g); el('text', {}, g); }
    { const g = L.ctrl.firstChild, cw = Math.max(1.3, 128 * k), chh = Math.max(0.55, 26 * k), on = sel && sel.kind === 'ctrl';
      set(g, { class:'obj ctrl' + (on ? ' sel' : ''), 'aria-label': t('selCtrl') });
      const bx = clamp(S.ctrl.x - cw / 2, -pad * 1.3, S.w + pad * 0.95 - cw);
      set(g.children[0], { x:bx, y:S.ctrl.y - chh / 2, width:cw, height:chh });
      set(g.children[1], { x:bx - 3 * k, y:S.ctrl.y - chh / 2 - 3 * k, width:cw + 6 * k, height:chh + 6 * k });
      set(g.children[2], { x:bx + 7 * k, y:S.ctrl.y - 3.5 * k, width:7 * k, height:7 * k });
      set(g.children[3], { x:bx + 19 * k, y:S.ctrl.y + 4 * k, 'font-size':10 * k });
      g.children[3].textContent = 'CTRL · SWITCHER';
    }
    /* people */
    sync(pool.ppl, S.ppl, L.ppl, () => { const g = el('g', { class:'obj person', tabindex:0, role:'button' }); el('circle', { class:'ring' }, g); el('circle', { class:'pb' }, g); el('line', { class:'nose' }, g); el('text', { 'text-anchor':'middle' }, g); return g; });
    S.ppl.forEach((p, i) => {
      const g = pool.ppl.get(p.id), r = Math.max(0.17, 6.5 * k), on = sel && sel.kind === 'ppl' && sel.i === i;
      const tgt = S.cams.some((c, j) => views[j].tg && views[j].tg.i === i);
      set(g, { class:'obj person' + (on ? ' sel' : '') + (tgt ? ' tgt' : ''), 'data-kind':'ppl', 'data-i':i, 'aria-label': pname(p.n) });
      set(g.children[0], { cx:p.x, cy:p.y, r:r + 4 * k });
      set(g.children[1], { cx:p.x, cy:p.y, r });
      const [dx, dy] = dirv(p.a); set(g.children[2], { x1:p.x + dx * r, y1:p.y + dy * r, x2:p.x + dx * (r + 6 * k), y2:p.y + dy * (r + 6 * k) });
      const below = dy < 0.3; set(g.children[3], { x:p.x, y: p.y + (below ? r + 14 * k : -r - 7 * k), 'font-size':10.5 * k });
      g.children[3].textContent = pname(p.n);
    });
    /* round 3: the starting light plan (schematic) */
    L.lits.innerHTML = '';
    lightSpots().forEach(o => { const r = 7 * k, g = el('g', { class:'lit lit-' + o.r }, L.lits);
      const F = (D.FIXT || {})[o.id], a0 = Math.atan2(o.tx - o.x, -(o.ty - o.y)), len = Math.max(0.8, Math.hypot(o.tx - o.x, o.ty - o.y) * 1.15), hb = rad((F ? F.beam : 55) / 2);
      el('polygon', { class:'litc', points:[[o.x, o.y], [o.x + Math.sin(a0 - hb) * len, o.y - Math.cos(a0 - hb) * len], [o.x + Math.sin(a0 + hb) * len, o.y - Math.cos(a0 + hb) * len]].map(q => q.map(r2).join(',')).join(' ') }, g);
      el('rect', { x:o.x - r, y:o.y - r, width:r * 2, height:r * 2, transform:`rotate(45 ${r2(o.x)} ${r2(o.y)})` }, g);
      el('text', { x:o.x, y:o.y + 3.6 * k, 'text-anchor':'middle', 'font-size':9.5 * k }, g).textContent = o.r; });
    /* annotation: frame width line at the selected camera's subject */
    L.ann.innerHTML = '';
    if (sid != null) {
      const i = sel.i, c = S.cams[i], v = views[i];
      if (v.tg && v.fw && v.tg.depth > 0) {
        const [dx, dy] = dirv(c.a), cxp = c.x + dx * v.tg.depth, cyp = c.y + dy * v.tg.depth, rx = -dy, ry = dx, hw = v.fw / 2;
        el('line', { x1:cxp - rx * hw, y1:cyp - ry * hw, x2:cxp + rx * hw, y2:cyp + ry * hw, class:'fwl' }, L.ann);
        [[-1], [1]].forEach(([s]) => el('line', { x1:cxp + s * rx * hw - dx * 5 * k, y1:cyp + s * ry * hw - dy * 5 * k, x2:cxp + s * rx * hw + dx * 5 * k, y2:cyp + s * ry * hw + dy * 5 * k, class:'fwl' }, L.ann));
        const ends = [1, -1].map(sg => { const ex = cxp + sg * rx * (hw + 10 * k), ey = cyp + sg * ry * (hw + 10 * k); return { sg, ex, ey, room: Math.min(ex, S.w - ex, ey, S.d - ey) }; });
        const fits = ends.filter(o => (o.sg * rx >= 0 ? S.w - o.ex : o.ex) > 70 * k && o.ey > 8 * k && o.ey < S.d - 4 * k);
        const best = fits.length ? fits[0] : null;
        const lx = best ? best.ex : cxp + rx * hw * 0.6 + dx * 8 * k, ly = best ? best.ey : cyp + ry * hw * 0.6 + dy * 8 * k;
        const tx = el('text', { x:lx, y:ly + 4 * k, class:'fwt', 'font-size':11 * k, 'text-anchor': best ? (best.sg * rx >= 0 ? 'start' : 'end') : 'middle' }, L.ann);
        tx.textContent = lenTxt(v.fw) + ' · ' + t('sh_' + v.cls);
      }
    }
    /* cameras */
    sync(pool.cams, S.cams, L.cams, () => {
      const g = el('g', { class:'obj camera', tabindex:0, role:'button' });
      const body = el('g', { class:'cbody' }, g);
      el('circle', { class:'hit' }, body); el('circle', { class:'ring' }, body); el('line', { class:'stem' }, body); el('circle', { class:'rot' }, body); el('circle', { class:'rothit' }, body);
      el('rect', { class:'cb' }, body); el('polygon', { class:'cl' }, body);
      el('text', { class:'cn', 'text-anchor':'middle' }, g);
      return g;
    });
    S.cams.forEach((c, i) => {
      const g = pool.cams.get(c.id), on = c.id === sid, s = 9 * k;
      set(g, { class:'obj camera' + (on ? ' sel' : ''), 'data-kind':'cam', 'data-i':i,
        'aria-label': `${camLab(i)}, ${modelName(c)}, ${t(views[i].cls ? 's_' + views[i].cls : 'noTarget')}, ${t('pan')} ${Math.round(c.a)}°` });
      const b = g.firstChild; b.setAttribute('transform', `translate(${r2(c.x)} ${r2(c.y)}) rotate(${r2(c.a)})`);
      const [hit, ring, stem, rot, rothit, cb, cl] = b.children;
      set(hit, { r: s * 2 }); set(ring, { r: s * 2.1 });
      set(stem, { x1:0, y1:-s * 1.4, x2:0, y2:-s * 3.2 }); set(rot, { cx:0, cy:-s * 3.4, r:s * 0.55 }); set(rothit, { cx:0, cy:-s * 3.4, r:s * 1.3, 'data-rot':1 });
      set(cb, { x:-s, y:-s * 0.6, width:s * 2, height:s * 1.5 });
      set(cl, { points:`${-s * 0.5},${-s * 0.6} ${s * 0.5},${-s * 0.6} ${s * 0.85},${-s * 1.35} ${-s * 0.85},${-s * 1.35}` });
      const [dx, dy] = dirv(c.a);
      const side = c.x + (-dy) * s * 2.6 > S.w - 6 * k || c.x + (-dy) * s * 2.6 < 6 * k ? -1 : 1;
      set(g.lastChild, { x:c.x + side * -dy * s * 2.6, y:c.y + side * dx * s * 2.6 + 4 * k, 'font-size':10.5 * k });
      g.lastChild.textContent = String(i + 1);
    });
  }
  const runCable = c => S.tr === 'ip' ? 'Cat6' : S.tr === 'hdmi' ? (runOf(c) > R.hdmiActive ? 'HDMI→SDI' : 'HDMI') : pathOf(c).cable;

  /* ======================= camera views (schematic multiview) ======================= */
  function thumb(c, v, big) {
    const half = v.h / 2, tanh = Math.tan(rad(half));
    let s = `<svg viewBox="0 0 16 9" class="th" aria-hidden="true"><rect class="tbg" width="16" height="9"/>`;
    s += `<line class="thz" x1="0" y1="3.5" x2="16" y2="3.5"/>`;
    s += [16 / 3, 32 / 3].map(x => `<line class="g3" x1="${x}" y1="0" x2="${x}" y2="9"/>`).join('') + [3, 6].map(y => `<line class="g3" x1="0" y1="${y}" x2="16" y2="${y}"/>`).join('');
    const vis = v.ppl.filter(q => q.depth > 0.2).sort((a, b) => b.depth - a.depth);
    vis.forEach(q => {
      const X = 8 + (q.lat / (q.depth * tanh)) * 8, sw = (R.shoulder / (2 * q.depth * tanh)) * 16;
      if (X + sw < -1 || X - sw > 17) return;
      const isT = v.tg && v.tg.i === q.i, hr = sw * 0.23, hy = 3.5, shy = hy + sw * 0.5;
      const op = isT ? '1' : clamp(1.1 - q.depth / 14, 0.4, 0.9).toFixed(2);
      s += `<g class="sil${isT ? ' t' : ''}" opacity="${op}"><path d="M${r2(X - sw / 2)} 9.5 L${r2(X - sw / 2)} ${r2(shy + sw * 0.12)} Q${r2(X - sw / 2)} ${r2(shy)} ${r2(X - sw * 0.3)} ${r2(shy)} L${r2(X + sw * 0.3)} ${r2(shy)} Q${r2(X + sw / 2)} ${r2(shy)} ${r2(X + sw / 2)} ${r2(shy + sw * 0.12)} L${r2(X + sw / 2)} 9.5 Z"/><rect x="${r2(X - hr * 0.55)}" y="${r2(hy + hr * 0.6)}" width="${r2(hr * 1.1)}" height="${r2(shy - hy - hr * 0.5)}"/><circle cx="${r2(X)}" cy="${r2(hy)}" r="${r2(hr)}"/></g>`;
    });
    if (!vis.length || !v.n) s += `<text x="8" y="5" class="nob" text-anchor="middle">${esc(t('noTarget'))}</text>`;
    return s + '</svg>';
  }
  function renderViews() {
    const sid = sel && sel.kind === 'cam' ? sel.i : -1;
    $('#cviews').innerHTML = S.cams.map((c, i) => { const v = view(c);
      const shot = v.cls ? t('s_' + v.cls) + (v.n > 1 && (v.cls === 'med' || v.cls === 'wide') ? ' · ' + t('twoShot', v.n) : '') : t('noTarget');
      return `<button type="button" class="cv" data-cam="${i}" aria-pressed="${i === sid}">
        <span class="scr">${thumb(c, v)}<span class="osd" aria-hidden="true"><span>${esc(camLab(i))} · ${v.cls ? t('sh_' + v.cls) : '—'}</span><span class="pgm"><span class="tally" style="background:#000"></span>SEL</span></span></span>
        <span class="umd"><b>${esc(shot)}</b><span class="meta-s">${esc(P[c.m] ? P[c.m].name : c.m)} · ${v.h.toFixed(1)}°${v.fw ? ' · ' + lenTxt(v.fw) : ''}</span></span></button>`; }).join('');
  }

  /* ======================= inspector ======================= */
  const selPanel = $('#sel-panel');
  function opt(v, label, cur) { return `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(label)}</option>`; }
  function srcLink(spec) { return spec && spec.src && /^https?:/.test(spec.src) ? ` <a href="${esc(spec.src)}" target="_blank" rel="noopener">${t('source')}</a>` : ''; }
  function renderInspector(force) {
    if (!force && selPanel.contains(document.activeElement) && document.activeElement !== selPanel) { readouts(); return; }
    const a = document.activeElement && selPanel.contains(document.activeElement) ? document.activeElement.id : null;
    if (!sel) { selPanel.innerHTML = `<p class="none meta-s">${t('selNone')}</p>`; return; }
    if (sel.kind === 'cam') {
      const c = S.cams[sel.i]; if (!c) { sel = null; return renderInspector(true); }
      const models = c.k === 'ptz' ? Object.keys(D.PTZ) : c.k === 'cc' ? Object.keys(D.CAMCORDER) : Object.keys(D.BODIES);
      let h = `<h2 class="ih"><span class="meta"><span class="tally"></span>${esc(camLab(sel.i))}</span><span>${esc(modelName(c))}</span></h2>
        <div class="seg sm" role="group" aria-label="${t('type')}" id="i-type">${['ptz', 'lens', 'cc'].map(x => `<button type="button" data-k="${x}" aria-pressed="${c.k === x}">${t(x === 'ptz' ? 'typePtz' : x === 'lens' ? 'typeLens' : 'typeCc')}</button>`).join('')}</div>
        <div class="rows">
        <div class="row"><label for="i-model">${t('model')}</label><select id="i-model">${models.map(m => opt(m, P[m].brand + ' ' + P[m].name + ' · ' + usd(P[m].usd), c.m)).join('')}</select></div>`;
      if (c.k === 'lens') {
        const b = D.BODIES[c.m];
        const lenses = Object.keys(D.LENSES).filter(l => P[l] && (D.LENSES[l].mount === b.mount || (D.LENSES[l].fits || []).includes(b.mount)) && !(D.LENSES[l].apsc && b.fmt === 'ff'));
        const exts = Object.keys(D.EXT || {}).filter(x => D.EXT[x].lenses.includes(c.lens) && (D.EXT[x].builtin || P[x]));
        h += `<div class="row"><label for="i-lens">${t('lens')}</label><select id="i-lens">${b.kit ? opt('kit', b.kit.name, c.lens) : ''}${lenses.map(l => opt(l, P[l].brand + ' ' + P[l].name + ' · ' + usd(P[l].usd), c.lens)).join('')}${opt('other', t('otherLens') + ' · ' + b.mount, c.lens)}</select></div>`;
        if (exts.length) h += `<div class="row"><label for="i-ext">${t('extK')}</label><select id="i-ext">${opt('', t('extNone'), c.ext || '')}${exts.map(x => opt(x, D.EXT[x].builtin ? D.EXT[x].name : P[x].brand + ' ' + P[x].name + ' · ' + usd(P[x].usd), c.ext || '')).join('')}</select></div>`;
        if (b.crop) h += `<label class="chk"><input type="checkbox" id="i-crop"${c.crop ? ' checked' : ''}><span>${t('cropK')} · ${esc(b.crop.label)}</span></label>`;
        h += `
          <div class="row"><label for="i-sf">${t('sensor')}</label><select id="i-sf">${Object.keys(D.FORMATS).map(f => opt(f, f === b.fmt ? t('bodyNative', D.FORMATS[f].label, b.w) : D.FORMATS[f].label + ' · ' + D.FORMATS[f].w + ' mm', c.sf)).join('')}</select></div>`;
        const [lo, hi] = lensRange(c);
        h += lo === hi ? `<div class="row"><span class="lab">${t('focal')}</span><span class="val" data-ro="f"></span></div>`
          : `<div class="row sl"><label for="i-f">${t('focal')} <span class="val" data-ro="f"></span></label><input id="i-f" type="range" min="${lo}" max="${hi}" step="0.5" value="${c.f}"></div>`;
        h += `<p class="meta-s dim">${t('lensNote')}${b.approx || c.sf !== b.fmt ? ' · <span class="ax">' + t('approx') + '</span>' : ''}${srcLink(b)}</p>`;
      } else {
        const z = zspec(c);
        h += `<div class="row sl"><label for="i-z">${t('zoom')} <span class="val" data-ro="z"></span></label><input id="i-z" type="range" min="0" max="1" step="0.005" value="${c.z}"></div>
          <p class="meta-s dim">${t('ptzNote')} ${z.hW}° → ${z.hT}° · ${z.zoom}× · ${esc(z.f)}${z.approx ? ' · <span class="ax">' + t('approx') + '</span>' : ''}${srcLink(z)}</p>`;
      }
      h += `<div class="row"><label for="i-mnt">${t('mount')}</label><select id="i-mnt">${['tripod', 'wall', 'ceiling', 'table'].map(m => opt(m, t('m_' + m), c.mnt)).join('')}</select></div>
        <div class="row"><label for="i-tgt">${t('subject')}</label><select id="i-tgt">${opt(-1, t('auto'), c.tgt)}${S.ppl.map((p, j) => opt(j, pname(p.n), c.tgt)).join('')}</select></div>
        <label class="chk"><input type="checkbox" id="i-man"${c.man ? ' checked' : ''}><span>${t('manned')}</span></label>
        <label class="chk"><input type="checkbox" id="i-own"${c.own ? ' checked' : ''}><span>${t('ownCam')}</span></label>
        </div>
        <div class="frm"><span class="meta-s">${t('aim')}</span><div class="seg sm" role="group" aria-label="${t('frame')}">${['wide', 'med', 'mcu', 'cu'].map(s => `<button type="button" data-frame="${s}">${t('sh_' + s)}</button>`).join('')}</div></div>
        <dl class="ro">
          <div><dt>${t('hfov')}</dt><dd data-ro="h"></dd></div><div><dt>${t('dist')}</dt><dd data-ro="d"></dd></div>
          <div><dt>${t('fw')}</dt><dd data-ro="fw"></dd></div><div><dt>${t('shot')}</dt><dd data-ro="cls"></dd></div>
          <div><dt>${t('pan')}</dt><dd data-ro="a"></dd></div><div><dt>${t('run')}</dt><dd data-ro="run"></dd></div>
        </dl>
        <button type="button" class="tbtn del" data-del="cam">${icon('x')}${t('remove')} ${esc(camLab(sel.i))}</button>`;
      selPanel.innerHTML = h;
    } else if (sel.kind === 'ppl') {
      const p = S.ppl[sel.i]; if (!p) { sel = null; return renderInspector(true); }
      selPanel.innerHTML = `<h2 class="ih"><span class="meta">${t('selPerson')}</span><span>${esc(pname(p.n))}</span></h2>
        <div class="rows"><div class="row"><label for="i-pn">${t('name')}</label><input id="i-pn" type="text" value="${esc(pname(p.n))}" maxlength="28"></div></div>
        <p class="meta-s dim">${t('keysHint')}</p>
        <button type="button" class="tbtn del" data-del="ppl">${icon('x')}${t('remove')}</button>`;
    } else if (sel.kind === 'furn') {
      const f = S.furn[sel.i]; if (!f) { sel = null; return renderInspector(true); }
      const u = S.unit === 'ft' ? FT : 1;
      selPanel.innerHTML = `<h2 class="ih"><span class="meta">${t('selFurn')}</span><span>${t('f_' + f.k)}</span></h2>
        <div class="rows"><div class="row"><label for="i-fw">${t('w')} (${S.unit})</label><input id="i-fw" type="number" min="0.3" step="0.1" value="${r2(f.w * u)}"></div>
        <div class="row"><label for="i-fh">${t('h')} (${S.unit})</label><input id="i-fh" type="number" min="0.3" step="0.1" value="${r2(f.h * u)}"></div></div>
        <button type="button" class="tbtn del" data-del="furn">${icon('x')}${t('remove')}</button>`;
    } else if (sel.kind === 'ctrl') {
      selPanel.innerHTML = `<h2 class="ih"><span class="meta"><span class="tally"></span>CTRL</span><span>${t('selCtrl')}</span></h2><p class="meta-s dim">${t('ctrlP')}</p>`;
    }
    readouts();
    if (a && $('#' + a)) $('#' + a).focus();
  }
  function readouts() {
    if (!sel || sel.kind !== 'cam') return;
    const c = S.cams[sel.i]; if (!c) return; const v = view(c);
    const put = (k2, val) => $$(`[data-ro="${k2}"]`, selPanel).forEach(e => { e.textContent = val; });
    const zs = zspec(c), mid = zs && c.z > 0.002 && c.z < 0.998;
    put('h', (mid ? '≈ ' : '') + v.h.toFixed(1) + '°');
    put('z', zs ? zoomX(c).toFixed(1) + '× · ' + (mid ? '≈' : '') + v.h.toFixed(1) + '°' : '');
    put('f', c.k === 'lens' ? c.f.toFixed(1) + ' mm' + (extOf(c) || c.crop ? ' ' + t('effK') : '') + (apAt(c) ? ' · ' + fNum(apAt(c)) : '') + ' · ' + v.h.toFixed(1) + '°' : '');
    put('d', v.tg ? lenTxt(v.tg.dist) + ' · ' + pname(v.tg.p.n) : '—');
    put('fw', v.fw ? lenTxt(v.fw) : '—');
    put('cls', v.cls ? t('s_' + v.cls) + (v.out ? ' · ⚠' : '') + (v.n > 1 && (v.cls === 'med' || v.cls === 'wide') ? ' · ' + t('twoShot', v.n) : '') : t('noTarget'));
    put('a', Math.round(c.a) + '°');
    put('run', runCable(c) + ' · ' + lenTxt(runOf(c)));
  }

  /* ======================= equipment list (BOM) + checks ======================= */
  /* round 5 (26 Nov 2026): the production quality the customer picks in step 4 (S.fmt = 'hd' | 'uhd', S.pr.fps = 30 | 60,
     S.pr.sq = 'hd' to stream a 4K program in 1080) follows every part: cameras (over the output actually used), converters,
     switcher, recorder, encoder, screen feed and multiview. Facts in planner-cams.js (D.VOUT, D.PROD), sources there. */
  const qualOf = () => { const pr = S.pr || {}, q = S.fmt === 'uhd' ? 'uhd' : 'hd', fps = +pr.fps === 60 ? 60 : 30, sq = q === 'uhd' && pr.sq === 'hd' ? 'hd' : q;
    return { q, fps, sq, pgm:(q === 'uhd' ? '2160p' : '1080p') + fps, st:(sq === 'uhd' ? '2160p' : '1080p') + fps }; };
  /* a camera's live 4K outputs: the read data, else what its connectors say (12G-SDI carries 2160p60 by standard; HDMI unknown) */
  const vout = m => { const v = (D.VOUT || {})[m]; if (v) return v; const z = D.PTZ[m] || D.CAMCORDER[m] || D.BODIES[m] || {};
    return { s: z.sdi === '12G' ? 60 : 0, h: z.hdmi ? null : 0, ip:null, approx:true, note:'' }; };
  const camSpec = c => c.k === 'lens' ? D.BODIES[c.m] : zspec(c) || {};
  /* the best 4K this camera can send live, in words (for the checks) */
  const best4k = v => v.s ? '12G-SDI 2160p' + v.s : v.h ? 'HDMI 2160p' + v.h : v.h === 0 && v.s === 0 ? (LANG === 'pt' ? '1080 no máximo' : '1080 at most') : (LANG === 'pt' ? 'não informado' : 'not stated');
  /* how one camera's picture reaches the switcher at the plan's quality.
     conv: 'conv12' | 'conv3' | null (a converter at the camera); up: reaches only in 1080 (up-converted by the switcher's input
     converter); unk: the maker doesn't state the rate used; cable: what runs to the control position */
  function pathOf(c) {
    const Q = qualOf(), z = camSpec(c), v = vout(c.m), f = Q.fps, uhd = Q.q === 'uhd';
    const o = { uhd, conv:null, up:false, unk:false, ok:true, cable:'', v };
    if (S.tr === 'sdi') {
      if (!uhd) { if (!z.sdi) { o.conv = 'conv3'; o.cable = 'HDMI→3G-SDI'; } else o.cable = '3G-SDI'; }
      else if (v.s >= f) o.cable = '12G-SDI';
      else if (z.hdmi && (v.h == null || v.h >= f)) { o.conv = 'conv12'; o.cable = 'HDMI→12G-SDI'; o.unk = v.h == null; }
      else { o.up = true; o.ok = false; if (z.sdi) o.cable = '3G-SDI · 1080'; else { o.conv = 'conv3'; o.cable = 'HDMI→3G-SDI · 1080'; } }
    } else if (S.tr === 'hdmi') {
      o.cable = runOf(c) > R.hdmiActive ? 'HDMI→SDI' : 'HDMI';
      if (uhd && !(z.hdmi && (v.h == null || v.h >= f))) { o.up = true; o.ok = false; } else if (uhd) o.unk = v.h == null;
    } else {
      o.cable = 'Cat6';
      if (uhd) { if (v.ip == null) o.unk = true; else if (v.ip < f) { o.up = true; o.ok = false; } }
    }
    return o;
  }
  /* the cheapest store camera of the same family that delivers the quality (verified rate), for the swap suggestion */
  function swapFor(c) {
    const Q = qualOf(); if (Q.q !== 'uhd') return null;
    const fam = c.k === 'ptz' ? 'ptz' : c.k === 'cc' ? 'cc' : 'lens', f = Q.fps;
    const fits = m => { const v = (D.VOUT || {})[m]; if (!v) return false; const z = D.PTZ[m] || D.CAMCORDER[m] || D.BODIES[m] || {};
      return S.tr === 'ip' ? (v.ip || 0) >= f && !!z.ndi : S.tr === 'hdmi' ? (v.h || 0) >= f : v.s >= f || (z.hdmi && (v.h || 0) >= f); };
    const br = P[c.m] ? P[c.m].brand : '';   /* same brand first (the customer's system stays one family), then the cheapest */
    const list = (D.CAMS || []).filter(x => x.fam === fam && x.id !== c.m && P[x.id] && fits(x.id)).sort((a, b) => (P[b.id].brand === br) - (P[a.id].brand === br) || P[a.id].usd - P[b.id].usd);
    return list.length ? list[0].id : null;
  }
  /* control panels: what fits this switcher, what the plan suggests, and the customer's pick (S.pr.pnl) */
  const SMALL_SW = ['atemmp', 'atemmini', 'atemproiso', 'atemext', 'atemxiso', 'atemsdi', 'atemsdipro', 'atemsdix'];
  function panelFor(id, nIn, pr) {
    const X = D.PROD, tvs = id === X.tvs4k8, small = SMALL_SW.includes(id), me = /^atem2me/.test(id) ? 2 : /^atem4me/.test(id) ? 4 : 1;
    const opts = tvs ? ['builtin'] : small ? ['none', 'mini'] : me >= 2 ? ['none', 'mini', 'me1', 'me1_20', 'me2', 'me2_30'] : ['none', 'mini', 'me1', 'me1_20'];
    const mix = pr.scr && pr.scr !== 'none' && pr.feed === 'mix', want = pr.pnl === 'yes';
    const auto = tvs ? 'builtin' : small ? (pr.lvl === 'p' || want ? 'mini' : 'none')
      : pr.lvl === 'p' ? (me >= 2 && mix ? 'me2' : nIn > 10 ? 'me1_20' : 'me1') : pr.lvl === 's' && !want ? 'none' : 'mini';
    /* a plan saved before round 5 carries no pnl: it had no panel unless it asked ('yes'), so it keeps none */
    const ch = pr.pnl == null ? 'none' : !['auto', 'yes'].includes(pr.pnl) ? pr.pnl : null, key = ch && opts.includes(ch) ? ch : auto;
    const pnl = X.panels && X.panels[key];
    return { opts, auto, key, chosen:ch, fall: !!ch && !opts.includes(ch), id: pnl && P[pnl[0]] ? pnl[0] : null };
  }
  const panelUsd = (id, nIn, pr) => { const p = panelFor(id, nIn, pr); return p.id ? P[p.id].usd : 0; };
  const fmtTxt = () => { const Q = qualOf(); return Q.pgm + (Q.sq !== Q.q ? ' · ' + (LANG === 'pt' ? 'transmissão ' : 'stream ') + Q.st : ''); };
  const usd0 = v => '$' + Math.round(v).toLocaleString('en-US');
  let PROD = null;   /* what the last build decided about quality, switcher and panel (the wizard's step 4 reads it) */

  /* round 3: the wizard's production answers (S.pr) choose the switcher, recorder, encoder and outputs.
     pr = { rec:'none'|'pgm'|'iso', st:0|1|2, scr:'none'|'led'|'proj'|'overflow', feed:'same'|'aux'|'mix', gfx:'none'|'lower'|'lyrics', how:'hw'|'pc',
            lvl:'s'|'m'|'p', pnl:'auto'|'none'|'builtin'|'mini'|'me1'|'me1_20'|'me2'|'me2_30', fps:30|60, sq:'same'|'hd' } */
  function prodBuild(nC, nIn, add, warn, hd, labs, cams) {
    const pr = S.pr, X = D.PROD, scr = pr.scr && pr.scr !== 'none' ? pr.scr : null, Q = qualOf(), uhd = Q.q === 'uhd';
    const recId = !uhd ? X.recBy.hd : Q.fps === 60 ? X.recBy.uhd60 : X.recBy.uhd30, recSpec = t(!uhd ? 's_recHd' : Q.fps === 60 ? 's_rec60' : 's_rec30');
    const encId = Q.sq === 'uhd' ? X.enc4 : X.encHd;
    if (pr.gfx === 'lyrics') add('sw', { name:t('g_lyr'), spec:'', qty:1, why:t('w_lyr'), code:'PC', role:'pc' });
    if (pr.how === 'pc') {
      add('sw', { name:t('g_pc'), spec:t('s_pc'), qty:1, why:t('w_pcPr'), code:'PC', role:'pc' });
      add('sw', { name:t(pr.feed === 'mix' || pr.rec === 'iso' || uhd ? 'g_vmix4k' : 'g_vmixhd'), spec:'', qty:1, why:t('w_vmix'), code:'SW', role:'sw' });
      const ins = cams.length;
      if (S.tr === 'hdmi') add('sw', { id:X.cards.hdmi, qty:Math.ceil(ins / 4), why:t('w_card', ins), role:'sw' });
      else if (uhd) add('sw', { name:t('g_cap4k'), spec:'× ' + ins, qty:1, why:t('w_cap4k'), code:'PC', role:'sw' });
      else { const need = ins + (scr && pr.feed !== 'same' ? 1 : 0); add('sw', { id: need <= 4 ? X.cards.sdi4 : X.cards.sdi8, qty:Math.max(1, Math.ceil(need / 8)), why:t('w_card', ins), role:'sw' }); }
      if (pr.st >= 2) warn(t('c_st2', pr.st >= 2 ? '2+' : pr.st), 'info');
      PROD.sw = null;
    } else {
      if (pr.lvl === 's') warn(t('c_obs'), 'info');
      let id = null, swWhy = '';
      const mix = !!(scr && pr.feed === 'mix');
      if (S.tr === 'hdmi') {
        if (uhd) { add('sw', { name:t('g_uhdhdmi'), spec:t('g_bigsw', nIn), qty:1, why:t('w_uhdhdmi'), code:'SW', role:'sw' }); warn(t('c_uhdHdmi')); }
        else id = nIn <= 4 ? (pr.rec === 'iso' ? 'atemproiso' : 'atemmp') : nIn <= 8 ? (pr.rec === 'iso' ? 'atemxiso' : 'atemext') : null;
        if (id) swWhy = t('w_swPr', nC, S.ext, nIn);
      } else if (uhd) {
        /* 4K: the Constellation 4K range or the TV Studio 4K8. The 4K8 has its panel, streaming and recording built in; the
           Constellation needs an encoder, a recorder and (optionally) a panel. Both are costed complete and the cheaper one is
           planned. The 4K8 drops out when the customer picks a separate panel, or a 1080 projector needs a down-converted out. */
        const ch = pr.pnl == null ? 'none' : !['auto', 'yes'].includes(pr.pnl) ? pr.pnl : null;
        const extra = s => (pr.st > 0 && !(s.tvs && Q.sq === 'uhd') ? P[encId].usd : 0) + (pr.rec === 'pgm' && !s.tvs ? P[recId].usd : 0) + (pr.rec === 'iso' ? P[recId].usd * nC : 0) + panelUsd(s.id, nIn, pr);
        const cands = X.uhdSw.filter(s => P[s.id] && s.inp >= nIn && (!mix || s.me >= 2) && !(s.tvs && ((ch && ch !== 'builtin') || scr === 'proj')) && !(!s.tvs && ch === 'builtin'))
          .map(s => ({ ...s, cost:P[s.id].usd + extra(s) })).sort((a, b) => a.cost - b.cost || (a.tvs ? 1 : -1));
        const tv = X.uhdSw.find(s => s.tvs);
        if (cands.length) {
          id = cands[0].id; swWhy = t('w_swUhd', nIn, Q.pgm);
          const other = cands.find(s => !!s.tvs !== !!cands[0].tvs);
          if (other) warn(t('c_swCmp', P[id].name, usd0(cands[0].cost), P[other.id].name, usd0(other.cost)), 'info');
          else if (tv && scr === 'proj' && !cands[0].tvs && nIn <= tv.inp) warn(t('c_tvsDc'), 'info');
          if (cands[0].tvs && pr.st > 0 && Q.sq === 'uhd') warn(t('c_tvsStream'), 'info');
        }
      } else {
        id = mix ? (nIn <= 20 ? X.me2.hd : null) : nIn <= 4 ? 'atemsdipro' : nIn <= 8 ? 'atemsdix' : nIn <= 10 ? 'atem1mehd' : nIn <= 20 ? 'atem2me-hd' : null;
        if (id) swWhy = /^atem(1|2)me/.test(id) ? t('w_swHd', nIn, Q.pgm) : t('w_swPr', nC, S.ext, nIn);
      }
      if (id) add('sw', { id, qty:1, why:(mix ? t('w_me2') + ' · ' : '') + swWhy + (X.iso.includes(id) && pr.rec === 'iso' ? ' · ' + t('w_iso') : ''), role:'sw' });
      if (!id && !(S.tr === 'hdmi' && uhd)) { add('sw', { name:t('g_bigsw', nIn), spec:'', qty:1, why:t('w_bigsw'), code:'SW', role:'sw' }); warn(t('c_inputs', nIn, uhd ? 40 : 20)); }
      PROD.sw = id;
      if (id) {
        const isTvs = id === X.tvs4k8, sdiOut = isTvs || /^atem(1|2|4)me/.test(id);
        /* recording and streaming the switcher doesn't do itself, in the plan's format */
        if (pr.rec === 'iso' && !X.iso.includes(id)) add('sw', { id:recId, qty:nC, why:t('w_recQiso', Q.pgm, recSpec), role:'sw' });
        else if (pr.rec !== 'none' && !X.rec.includes(id)) add('sw', { id:recId, qty:1, why:t('w_recQ', Q.pgm, recSpec), role:'sw' });
        if (pr.st > 0 && (!X.stream.includes(id) || (isTvs && Q.sq !== 'uhd'))) add('sw', { id:encId, qty:1, why: Q.sq === 'uhd' ? t('w_encQ4', Q.st) : uhd ? t('w_encQd', Q.st, Q.pgm) : t('w_encQh', Q.st), role:'pc' });
        if (pr.st >= 2) warn(t('c_st2', '2+'), 'info');
        if (scr && X.oneOut.includes(id)) warn(t('c_oneOut', P[id].name), 'info');
        /* the control panel: the customer's pick, else the suggestion */
        const pn = panelFor(id, nIn, pr); PROD.panel = pn;
        if (pn.fall) warn(t('c_pnlFall', P[id].name), 'info');
        if (pn.id) add('sw', { id:pn.id, qty:1, why:t('w_pnlPick', pn.chosen && !pn.fall ? t('pnlMine') : t('pnlAuto', nIn), pn.id === X.panel.mini ? t('w_panelMini', P[id].name) : X.panels[pn.key][1] >= 2 ? t('w_panel2') : P[pn.id].name), role:'panel' });
        /* screen feed and multiview from an SDI-only switcher: HDMI at the screen / monitor, in the right format */
        if (sdiOut && scr && scr !== 'overflow') {
          const sn = t('scr_' + scr);
          if (scr === 'proj' && uhd) { if (X.dc[id]) add('sw', { id:X.toHdmi.hd, qty:1, why:t('w_scrDc', P[id].name), role:'sw' }); else { add('sw', { name:t('g_dconv'), spec:'2160p → 1080p', qty:1, why:t('w_dconv'), code:'SW', role:'sw' }); warn(t('c_tvsDc')); } }
          else if (uhd) { add('sw', { id:X.toHdmi.uhd, qty:1, why:t('w_scrUhd', sn, Q.pgm), role:'sw' }); warn(t(X.dc[id] ? 'c_ledUhd' : 'c_ledUhdT', Q.pgm), 'info'); }
          else add('sw', { id:X.toHdmi.hd, qty:1, why:t('w_scrHd', sn), role:'sw' });
        }
        if (X.mvSdi[id]) add('mon', { id:X.toHdmi[X.mvSdi[id]], qty:1, why:t('w_mvConv', P[id].name, X.mvSdi[id] === 'uhd' ? '12G' : '3G') });
      }
    }
    if (scr) {
      if (scr === 'overflow') add('sw', { id:X.dec, qty:1, why:t('w_dec'), role:'sw' });
      else add('cab', { name:t('g_scr', t('scr_' + scr)), spec:'', qty:1, why:t('w_scr', t(pr.feed === 'same' ? 'c_feedSame' : pr.feed === 'aux' ? 'c_feedAux' : 'w_me2')), code:'SDI' });
      warn(t(pr.feed === 'same' ? 'c_feedSame' : pr.feed === 'aux' ? 'c_feedAux' : 'w_me2'), 'info');
    }
  }
  /* round 3–4: the role-based starting light plan (any brand) + control (S.lt = { on, k, big, ctl:'app'|'dmx'|'crmx', panel, relay }) */
  function lightBuild(add, warn, nP) {
    const lt = S.lt; if (!lt.on) return;
    if (lt.on === 2) { add('svc', { name:t('g_ldes'), spec:t('s_ldes'), qty:1, why:t('w_svc'), code:'SVC' }); return; }
    const plan = D.lightPlan(lt, nP);
    const C = D.LIGHTCTL, F = D.FIXT, dmxOn = lt.ctl === 'dmx' || lt.ctl === 'crmx', specTxt = sp => [sp.bi ? 'bi-colour' : sp.rgb ? 'colour' : '', '≥ ' + Math.round(sp.min / 9).toLocaleString('en-US') + ' lx at 3 m', sp.quiet ? 'quiet' : '', dmxOn ? 'DMX' : ''].filter(Boolean).join(', ');
    let rx = 0; const apps = new Set();
    const LV = lightLevels();   /* the dimmer % per role, for installers (the parts list shows it next to each light) */
    plan.forEach(r => { const id = r.id, q = r.buy;
      if (!id) { add('lit', { name:t('w_l_' + r.role), spec:specTxt(r.spec), qty:r.q, why:t('c_noFix', t('w_l_' + r.role), specTxt(r.spec)), code:'LIT', role:'lit' }); return; }
      const lv = LV && LV.roles[r.role], rn = t('r_' + r.role);
      add('lit', { id, qty:q, why:t('w_l_' + r.role) + ' · ' + specTxt(r.spec), role:'lit', who: lv ? [lv.data ? t('w_dimAt', rn, lv.pct) : t('w_dimSite', rn)] : undefined });
      if (lv && lv.st === 'short') warn(t('c_dimShort', rn.toLowerCase(), P[id].name, lv.alt && P[lv.alt] ? t('c_dimAlt', P[lv.alt].name) : ''), 'info');
      if (lv && lv.st === 'tiny') warn(t('c_dimTiny', rn.toLowerCase(), P[id].name, lv.rawPct), 'info');
      const f = F[id] || {}; if (f.app) apps.add(f.app);
      if (!r.ok && !r.auto && f.dmx !== false) warn(t('c_spec', t('w_l_' + r.role), P[id].name, f.lux1 ? specTxt(r.spec) : 'no published data'), 'info');
      if (dmxOn && !f.dmx) warn(t('c_noDmx', P[id].name), 'info');
      if (dmxOn && f.verify) warn(t('c_dmxVerify', P[id].name, f.verify), 'info');
      if (lt.ctl === 'crmx' && f.dmx && !f.crmx) rx += r.q;
      if (lt.ctl === 'dmx' && f.jack) add('lit', { name:t('g_jack'), spec:'', qty:q, why:'', code:'DMX', role:'lit' }); });
    if (dmxOn) {
      if (lt.ctrl === 'splay') add('lit', { name:t('g_splay'), spec:t('s_rep'), qty:1, why:t('w_cue'), code:'CTRL', role:'lit' });
      else add('lit', { id:C.ctl, qty:1, why:t('w_cue'), role:'lit' });
      /* round 4 (owner: i9 represents ENTTEC): past NODE_M from the desk, Ethernet to a DMX node instead of one long DMX run */
      const far = lightSpots().reduce((m, f) => Math.max(m, Math.hypot(f.x - S.ctrl.x, f.y - S.ctrl.y) + (S.xr || 0)), 0);
      if (lt.ctl === 'dmx' && far > NODE_M) { add('lit', { name:t('g_node'), spec:t('s_rep'), qty:1, why:'', code:'NET', role:'lit' }); add('lit', { name:t('g_noderun'), spec:buyLen(far * 1.2 + 2), qty:1, why:'', code:'CAT6', role:'lit', len:buyLen(far * 1.2 + 2) }); add('lit', { name:t('g_dmxshort'), spec:'', qty:1, why:'', code:'DMX', role:'lit' }); warn(t('c_node', lenTxt(far)), 'info'); }
      else if (lt.ctl === 'dmx') add('lit', { name:t('g_dmxrun'), spec:'', qty:1, why:'', code:'DMX', role:'lit' });
      else { add('lit', { name:t('g_crmxTx'), spec:t('s_rep'), qty:1, why:t('w_crmxOnly'), code:'DMX', role:'lit' }); if (rx) add('lit', { name:t('g_crmxRx'), spec:t('s_rep'), qty:rx, why:t('w_crmxOnly'), code:'DMX', role:'lit' }); }
      if (lt.panel && lt.ctrl !== 'splay') warn(t('c_wifiPanel'), 'info');
      if (lt.panel && lt.ctrl !== 'splay') { const pt = lt.ptype || 'kiosc';
        if (pt === 'bstation') add('lit', { name:t('g_bst'), spec:t('s_vp'), qty:1, why:t('w_panel'), code:'CTRL', role:'lit' });
        else if (pt === 'ipad') add('lit', { name:t('g_kiosc'), spec:'', qty:0, why:'', info:true });
        else add('lit', { id:C.panel, qty:1, why:t('w_panel'), role:'lit' }); }
      if (lt.relay) add('lit', { id:C.relay, qty:1, why:t('w_relay'), role:'lit' });
      warn(t(lt.ctrl === 'splay' ? 'c_splay' : S.pr && S.pr.how === 'pc' ? 'c_vmixAuto' : 'c_compAuto'), 'info');
    } else warn(t('c_app', [...apps].join(', ') || '—'), 'info');
  }
  /* round 3–4: the starting light plan as fixtures with a position, a height and an aim (schematic, not a lighting design):
     key in front of each person toward the cameras, fill on the other side, back behind, wash from the house side, colour on
     the back wall. Heights are typical stand / truss heights (approx.). */
  const isSeated = p => S.furn.some(f => (f.k === 'table' || f.k === 'desk') && Math.abs(p.x - f.x) <= f.w / 2 + 0.9 && Math.abs(p.y - f.y) <= f.h / 2 + 0.9);
  const stageAt = (x, y) => { const st = S.furn.find(f => f.k === 'stage'); return st && Math.abs(x - st.x) <= st.w / 2 && Math.abs(y - st.y) <= st.h / 2 ? ((D.HEIGHTS || {}).stage || 0.6) : 0; };
  const faceH = p => stageAt(p.x, p.y) + (isSeated(p) ? 1.2 : 1.6);
  function lightSpots() {
    if (!S.lt || S.lt.on !== 1 || !D.lightPlan || !S.ppl.length) return [];
    const plan = D.lightPlan(S.lt, S.ppl.length), by = {};
    plan.forEach(r => { if (!r.id) return; for (let i = 0; i < r.q; i++) (by[r.role] = by[r.role] || []).push(r.id); });
    const n = S.ppl.length, out = [];
    const cx = S.cams.length ? S.cams.reduce((a, c) => a + c.x, 0) / S.cams.length : S.w / 2, cy = S.cams.length ? S.cams.reduce((a, c) => a + c.y, 0) / S.cams.length : S.d;
    const px = S.ppl.reduce((a, p) => a + p.x, 0) / n, py = S.ppl.reduce((a, p) => a + p.y, 0) / n, mid = { x:px, y:py, n:'', a:0 };
    const dirTo = p => (deg(Math.atan2(cx - p.x, -(cy - p.y))) + 360) % 360;
    const at = (p, ang, dist) => ({ x:clamp(p.x + Math.sin(rad(ang)) * dist, 0.2, S.w - 0.2), y:clamp(p.y - Math.cos(rad(ang)) * dist, 0.2, S.d - 0.2) });
    const push = (id, role, r, pos, h, tgt, th) => out.push({ id, role, r, x:pos.x, y:pos.y, h:stageAt(pos.x, pos.y) + h, tx:tgt.x, ty:tgt.y, th });
    /* 26 Nov 2026 (auto-dim): with several people side by side each key comes from the outside, so it doesn't cross the
       neighbour's face (the spill made the levels uneven); one person, or the person in the middle, keeps camera left */
    const side = p => n > 1 && Math.abs(p.x - px) > 0.3 && Math.abs(at(p, dirTo(p) + 40, 2.2).x - px) > Math.abs(at(p, dirTo(p) - 40, 2.2).x - px) ? 1 : -1;
    (by.key || []).forEach((id, i) => { const p = i < n ? S.ppl[i] : mid; push(id, 'key', 'K', at(p, dirTo(p) + 40 * (i < n ? side(p) : -1), 2.2), 2.3, p, i < n ? faceH(p) : 1.6 + stageAt(p.x, p.y)); });
    (by.fill || []).forEach((id, i) => { const p = S.ppl[i % n]; push(id, 'fill', 'F', at(p, dirTo(p) - 45 * side(p), 2.4), 2.0, p, faceH(p)); });
    (by.back || []).forEach((id, i) => { const p = S.ppl[i % n]; push(id, 'back', 'B', at(p, dirTo(p) + 180 + (i % 2 ? -25 : 25), 1.4), 2.6, p, faceH(p)); });
    (by.wash || []).forEach((id, i, a) => { const x = S.w * (i + 1) / (a.length + 1), y = clamp(py + (cy - py) * 0.35, 0.3, S.d - 0.3); push(id, 'wash', 'W', { x, y }, 3.4, { x:px + (x - S.w / 2) * 0.3, y:py }, 1.6 + stageAt(px, py)); });
    (by.bg || []).forEach((id, i, a) => { const x = S.w * (i + 1) / (a.length + 1); push(id, 'bg', 'C', { x, y:0.25 }, 0.3, { x, y:0 }, 1.6); });
    return out;
  }
  /* lux at a point from one fixture: inverse-square from the published 1 m figure, full inside the beam, fading to 0 over a
     quarter beam outside it (rule of thumb for the edge) */
  function luxAt(f, P) {
    const F = (D.FIXT || {})[f.id]; if (!F || !F.lux1) return 0;
    const v = [P.x - f.x, P.h - f.h, P.y - f.y], ax = [f.tx - f.x, f.th - f.h, f.ty - f.y];
    const d = Math.hypot(...v), la = Math.hypot(...ax); if (d < 0.05 || la < 1e-6) return 0;
    const cos = (v[0] * ax[0] + v[1] * ax[1] + v[2] * ax[2]) / (d * la), th = deg(Math.acos(clamp(cos, -1, 1))), half = F.beam / 2;
    const fall = th <= half ? 1 : Math.max(0, 1 - (th - half) / (F.beam * 0.25));
    return F.lux1 * fall / (d * d);
  }
  /* auto-dim (owner, 26 Nov 2026: "adjust the brightness, we need it to look good and simple for the user").
     Most LED fixtures dim 0–100 %. Each fixture with published photometrics gets the dimmer % that puts its subject on the
     look's target, from the real throw (position, height, aim): key = the target (accepted from −17 % to +25 %, i.e. about
     1,000–1,500 lx on Standard); fill and stage wash together at half the key (2:1); back / rim a bit under the key (0.8×);
     background colour about 1.5 stops under the key on the wall it lights (⅓). Fixtures aimed at the same person share one
     level; a few passes absorb the spill between neighbours. A fixture that can't reach its target at 100 % stays at 100 %
     and says so; one that would need under 5 % says a smaller light would do. Fixtures without published data are left out
     of the maths ("level set on site"). Planning rule of thumb, not a lighting design. */
  const LOOKS = { soft:700, std:1200, tv:2000 };
  const lookOf = () => (S.lt && LOOKS[S.lt.look] ? S.lt.look : 'std');
  const LCLASS = { key:'key', fill:'fill', wash:'fill', back:'back', bg:'bg' };
  const LSHARE = { key:1, fill:0.5, back:0.8, bg:1 / 3 }, LREACH = { key:1000 / 1200, fill:0.7, back:0.5, bg:0.5 }, DIM_MIN = 0.05;
  const BAND = [1000 / 1200, 1500 / 1200];   /* accepted around the target: 1,000–1,500 lx on Standard */
  function lightLevels() {
    const fx = lightSpots(); if (!fx.length) return null;
    const look = lookOf(), T = LOOKS[look], F = D.FIXT || {};
    const pts = S.ppl.map(p => ({ x:p.x, y:p.y, h:faceH(p) }));
    const near = (x, y) => { let b = -1, bd = 0.6; S.ppl.forEach((p, i) => { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; b = i; } }); return b; };
    fx.forEach(f => { f.data = !!(F[f.id] && F[f.id].lux1); f.cls = LCLASS[f.role] || 'key';
      f.sub = f.cls === 'bg' ? null : f.role === 'wash' ? 'all' : (k => k < 0 ? 'all' : k)(near(f.tx, f.ty));
      f.u = pts.map(P => luxAt(f, P));                                  /* lux at each face at 100 % */
      f.u0 = f.cls === 'bg' ? luxAt(f, { x:f.tx, y:f.ty, h:f.th }) : 0;  /* background: lux on the wall it lights */
      f.dim = f.data ? 1 : null; });
    const sc = fx.filter(f => f.data), groups = {};
    sc.forEach((f, k) => { const g = f.cls === 'bg' ? 'bg|' + k : f.role + '|' + f.sub; (groups[g] = groups[g] || { cls:f.cls, role:f.role, sub:f.sub, fx:[] }).fx.push(f); });
    const G = Object.values(groups);
    const subsOf = g => g.sub === 'all' ? pts.map((_, i) => i) : [g.sub];
    const at = (cls, i) => sc.reduce((a, f) => a + (f.cls === cls ? f.u[i] * f.dim : 0), 0);
    const have = g => g.cls === 'bg' ? g.fx.reduce((a, f) => a + f.u0 * f.dim, 0) : (ii => ii.reduce((a, i) => a + at(g.cls, i), 0) / ii.length)(subsOf(g));
    G.forEach(g => { g.tgt = T * LSHARE[g.cls]; g.raw = 1; });
    /* least squares per class over the people that class is aimed at (box 1–100 %, coordinate descent): a key that also hits
       the next person shares the job with that person's own key instead of pushing it to the floor */
    G.forEach(g => { g.w = pts.map((_, i) => g.fx.reduce((a, f) => a + f.u[i], 0)); });
    const rows = {}; G.forEach(g => { if (g.cls !== 'bg') (rows[g.cls] = rows[g.cls] || new Set()); subsOf(g).forEach(i => g.cls !== 'bg' && rows[g.cls].add(i)); });
    for (let it = 0; it < 60; it++) G.forEach(g => { const d0 = g.fx[0].dim;
      let want;
      if (g.cls === 'bg') { const h = have(g); want = h > 1e-6 ? d0 * g.tgt / h : Infinity; }
      else { let num = 0, den = 0; rows[g.cls].forEach(i => { const w = g.w[i]; if (w > 0) { num += w * (g.tgt - (at(g.cls, i) - w * d0)); den += w * w; } }); want = den > 1e-9 ? num / den : Infinity; }
      if (!isFinite(want)) { g.raw = Infinity; g.fx.forEach(f => { f.dim = 1; }); return; }
      /* raw = what this light alone would need for its own subject (for "can't reach" / "a smaller light would do") */
      g.raw = g.cls === 'bg' ? want : (h => h > 1e-6 ? d0 * g.tgt / h : Infinity)(have(g));
      g.fx.forEach(f => { f.dim = clamp(want, 0.01, 1); }); });
    sc.forEach(f => { f.dim = Math.max(1, Math.round(f.dim * 100)) / 100; });   /* what the installer dials: whole per cent */
    /* per role (the light list): dimmer range, can't reach / too strong, a stronger store light from the same role spec */
    const plan = D.lightPlan(S.lt, S.ppl.length), dmx = S.lt.ctl === 'dmx' || S.lt.ctl === 'crmx', roles = {};
    const pc = v => Math.round(v * 100) + ' %';
    fx.forEach(f => { const r = roles[f.role] = roles[f.role] || { role:f.role, id:f.id, n:0, data:f.data, dims:[], st:f.data ? 'ok' : 'nodata', need:0, raw:1 };
      r.n++; if (f.data) r.dims.push(f.dim); });
    G.forEach(g => { const r = roles[g.role], h = have(g), share = h / g.tgt;
      if (g.raw > 1 && share < LREACH[g.cls]) { r.st = 'short'; r.need = Math.max(r.need, isFinite(share) && share > 0 ? 1 / share : Infinity); }
      else if (r.st === 'ok' && g.cls !== 'bg') { /* too strong on its own (not just lit by a neighbour's spill) */
        const ii = subsOf(g), own = ii.reduce((a, i) => a + g.w[i], 0) / ii.length, need = own > 0 ? g.tgt / own : 1;
        if (need < DIM_MIN) { r.st = 'tiny'; r.raw = Math.min(r.raw, need); } }
      else if (r.st === 'ok' && g.raw < DIM_MIN) { r.st = 'tiny'; r.raw = Math.min(r.raw, g.raw); } });
    Object.values(roles).forEach(r => {
      if (r.dims.length) { const lo = Math.min(...r.dims), hi = Math.max(...r.dims); r.lo = lo; r.hi = hi; r.pct = lo === hi ? pc(lo) : Math.round(lo * 100) + '–' + pc(hi); }
      if (r.st === 'tiny') r.rawPct = Math.max(1, Math.round(r.raw * 100)) + ' %';
      if (r.st === 'short' && D.meets && F[r.id] && F[r.id].lux1 && isFinite(r.need)) {
        const spec = (plan.find(x => x.role === r.role) || {}).spec || { min:0 }, need = F[r.id].lux1 * r.need;
        r.alt = Object.keys(F).filter(id => P[id] && id !== r.id && F[id].lux1 >= need && D.meets(id, { ...spec, min:0 }, dmx))
          .sort((a, b) => P[a].usd / (F[a].per || 1) - P[b].usd / (F[b].per || 1))[0] || null; } });
    /* per person: one plain status */
    const subjects = pts.map((P0, i) => { const key = at('key', i), fill = at('fill', i), back = at('back', i);
      const mine = fx.filter(f => f.cls === 'key' && (f.sub === i || f.sub === 'all'));
      const md = mine.filter(f => f.data);   /* off target with dimmers still free = overlapping lights, not a weak / strong light */
      const st = mine.length && !md.length ? 'nodata' : key < T * BAND[0] ? (!md.length ? 'nokey' : md.some(f => f.dim >= 1) ? 'low' : 'even') : key > T * BAND[1] ? (md.length && md.every(f => f.dim <= DIM_MIN) ? 'high' : 'even') : 'ok';
      return { i, n:S.ppl[i].n, key, fill, back, front:key + fill, st }; });
    return { fx, look, target:T, band:[T * BAND[0], T * BAND[1]], subjects, roles };
  }
  /* readouts: per person, the dimmers, power at the set level, and an exposure check per camera (E = C × N² ÷ (t × ISO)) */
  function lightCalc() {
    const LV = lightLevels(); if (!LV) return null;
    const fx = LV.fx, X = D.EXPO || { C:250, t:1 / 50, iso:800 }, iso = (S.lt && S.lt.iso) || X.iso, cct = (S.lt && S.lt.cct) || 5600;
    const s0 = LV.subjects[0], FX = D.FIXT || {};
    /* power: maximum draw from each maker's page; at the set level it scales with the dimmer (approx.: LED drivers are close to linear) */
    const W = fx.reduce((a, f) => a + ((FX[f.id] || {}).W || 0), 0), Wset = fx.reduce((a, f) => a + ((FX[f.id] || {}).W || 0) * (f.dim == null ? 1 : f.dim), 0);
    const noData = fx.filter(f => !(FX[f.id] || {}).W).length;
    const cams = S.cams.map((c, i) => { const v = view(c); if (!v.tg) return { i, lux:null };
      const sj = LV.subjects[v.tg.i], lux = sj ? sj.front : 0, N = c.k === 'lens' ? apAt(c) : null, need = N ? X.C * N * N / (X.t * iso) : null;
      return { i, lux, N, need, ok: need == null ? null : lux >= need / Math.SQRT2, who:v.tg.p.n, sub:v.tg.i }; });
    cams.forEach(c => { if (c.ok === false) { const sj = LV.subjects[c.sub]; if (sj) { sj.cams = (sj.cams || []).concat(c.i); if (sj.st === 'ok' || sj.st === 'high') sj.st = 'cam'; } } });
    const ev = v => v > 0 ? Math.log2(v * 100 / X.C) : null;   /* EV at ISO 100 from incident light */
    return { fx, key:s0.key, fill:s0.fill, back:s0.back, front:s0.front, ev:ev(s0.front), ratio: s0.fill > 0.5 ? s0.key / s0.fill : null, cct,
      W, A: W / 120, Wset, Aset: Wset / 120, noData, iso, t:X.t, cams, look:LV.look, target:LV.target, band:LV.band, looks:LOOKS, subjects:LV.subjects, roles:LV.roles };
  }
  function setLt(o) { if (!S.lt) return; Object.assign(S.lt, o); update(); }
  const GROUPS = ['cam', 'sw', 'cab', 'net', 'mnt', 'aud', 'lit', 'mon', 'svc'];
  const REACH_FW = 1.6;
  const NODE_M = 30;   /* m: DMX past this from the desk gets a network node (rule of thumb, not a DMX limit) */   /* m: wider than this at full zoom, aimed at one person, is not a close-up any more */
  let BOM = [], CHECKS = [];
  function build() {
    const out = [], chk = [];
    /* role = what "I already have" covers (ROLES); an owned line stays in the plan, shows "You have this" and is never priced */
    const own = S.own || [];
    const add = (g, o) => {
      const role = o.role || { cab:'cab', aud:'aud', lit:'lit' }[g] || null;
      const owned = o.own != null ? !!o.own : !!(role && own.includes(role));
      const key = (o.id ? g + '|' + o.id : g + '|' + o.name + '|' + (o.spec || '')) + (owned ? '|own' : '');
      const ex = out.find(l => l.key === key);
      if (ex) { ex.qty += o.qty; if (o.who) o.who.forEach(w => { if (!ex.who.includes(w)) ex.who.push(w); }); return ex; }
      const l = { key, g, ...o, role, own:owned, who: o.who ? [...o.who] : [] }; out.push(l); return l;
    };
    const warn = (txt, lvl = 'warn') => chk.push({ lvl, txt });
    const cams = S.cams, nC = cams.length, hd = S.fmt === 'hd', Q = qualOf();
    PROD = { q:Q, sw:null, panel:null, cams:[] };
    const views = cams.map(view);
    const labs = cams.map((c, i) => camLab(i));

    /* --- cameras & lenses --- */
    const encCams = [], apx = [], cpoe = [];
    cams.forEach((c, i) => {
      const lab = labs[i];
      add('cam', { id:c.m, qty:1, why:t('w_cam'), who:[lab], own:!!c.own });
      if (c.k === 'lens') {
        const b = D.BODIES[c.m];
        if (D.LENSES[c.lens]) add('cam', { id:c.lens, qty:1, why:t('w_lensFor'), who:[lab], own:!!c.own });
        else if (c.lens === 'other') { const [lo, hi] = lensRange(c); add('cam', { name:t('g_lens', b.mount), spec:t('g_lensSpec', lo, hi), qty:1, why:t('w_lensFor'), who:[lab], code:'LENS', own:!!c.own }); }
        const lz = D.LENSES[c.lens], ex = extOf(c);
        if (ex && !ex.builtin && P[c.ext]) add('cam', { id:c.ext, qty:1, why:t('w_ext', P[c.lens] ? P[c.lens].name : c.lens, ex.x, Math.round(lensRange(c)[0]) + '–' + Math.round(lensRange(c)[1]) + ' mm'), who:[lab], own:!!c.own });
        if (lz && lz.mount !== b.mount && lz.adapter && P[lz.adapter]) add('cam', { id:lz.adapter, qty:1, why:t('w_adapt', lz.mount, b.mount), who:[lab], own:!!c.own });
        if (lz && lz.heavy) add('mnt', { name:t('g_heavy', lz.heavy), spec:'', qty:1, why:t('w_heavy'), who:[lab], code:'BRKT' });
        /* version F: a cage made for this body, and mains power (a priced dummy battery, else a line to quote) */
        if (b.cage && P[b.cage]) add('mnt', { id:b.cage, qty:1, why:t('w_cage'), who:[lab], own:!!c.own });
        if (b.pwr) { if (P[b.pwr]) add('net', { id:b.pwr, qty:1, why:t('w_pwrDummy'), who:[lab], own:!!c.own }); else add('net', { name:t('g_pwrBody', modelName(c)), spec:b.pwr, qty:1, why:t('w_pwrBody'), who:[lab], code:'PWR', own:!!c.own }); }
      }
      const z = zspec(c);
      if (S.tr === 'ip') {
        const hasNdi = z && z.ndi;
        if (!hasNdi) { encCams.push(i); warn(t('c_noNdi', lab)); }
        else if (z.ndiKey) { add('cam', { name:t('g_ndikey'), spec:modelName(c), qty:1, why:t('w_ndikey'), who:[lab], code:'NDI' }); warn(t('c_ndiKey', lab), 'info'); }
      }
      if (isApprox(c)) apx.push(lab + ' (' + modelName(c) + ')');
      if (c.k === 'ptz' && (c.m === 'crn300' || c.m === 'crn500') && (S.tr === 'ip' || S.ctl === 'ip')) cpoe.push(lab);
    });
    if (apx.length) warn(t('c_approx', apx.join(', ')), 'info');
    if (cpoe.length) warn(t('c_canonPoe', cpoe.join(', ')), 'info');
    const ptz = cams.map((c, i) => [c, i]).filter(([c]) => c.k === 'ptz');
    const pan = ptz.filter(([c]) => P[c.m].brand === 'Panasonic'), can = ptz.filter(([c]) => P[c.m].brand === 'Canon'), sny = ptz.filter(([c]) => P[c.m].brand === 'Sony');
    const ctl = D.PTZCTL || {};
    if (pan.length >= 2) add('cam', { id:'rp60', qty:1, why:t('w_rp60', pan.length), who:pan.map(([, i]) => labs[i]) });
    /* round 3: Canon PTZ + Canon cinema bodies (C50 / C80 / C400 / XF605) on one RC-IP1000 */
    const canCine = cams.map((c, i) => [c, i]).filter(([c]) => (D.CANON_IP || []).includes(c.m));
    const canAll = can.concat(canCine);
    if (can.length >= 1 && canAll.length >= 2) {
      const cc = S.pr && S.pr.cctl && S.pr.cctl !== 'auto' ? S.pr.cctl : (S.pr && canAll.length <= 4 ? '300' : '1000'), R3 = (D.PROD || {}).rcip300;
      if (cc === '300' && R3) add('cam', { name:R3.name, spec:R3.note, qty:1, why:canCine.length ? t('w_canonAll', canAll.length) : t('w_ptzCtl', can.length, 'Canon'), who:canAll.map(([, i]) => labs[i]), code:'CTRL' });
      else if (ctl.Canon && P[ctl.Canon]) add('cam', { id:ctl.Canon, qty:1, why:canCine.length ? t('w_canonAll', canAll.length) : t('w_ptzCtl', can.length, 'Canon'), who:canAll.map(([, i]) => labs[i]) });
      else add('cam', { name:t('g_canonCtl'), spec:'RC-IP1000 / RC-IP300', qty:1, why:t('w_canonCtl'), who:canAll.map(([, i]) => labs[i]), code:'CTRL' });
      canCine.forEach(([c, i]) => { if ((D.CANON_ETH || {})[c.m]) add('cam', { name:t('g_c50eth'), spec:D.CANON_ETH[c.m], qty:1, why:t('w_c50eth'), who:[labs[i]], code:'NET' }); });
      if (canCine.length) warn(t('c_canonAlt'), 'info');
    }
    if (sny.length >= 2 && ctl.Sony && P[ctl.Sony]) add('cam', { id:ctl.Sony, qty:1, why:t('w_ptzCtl', sny.length, 'Sony') + (D.PTZCTL_OK && D.PTZCTL_OK.Sony ? ' · ' + D.PTZCTL_OK.Sony : ''), who:sny.map(([, i]) => labs[i]) });

    /* --- switching & streaming --- */
    const nIn = nC + S.ext;
    let sw = null;
    const ownPc = own.includes('pc');
    /* a computer the customer already has: it stays on the plan at $0; on IP it runs the NDI switching software */
    if (ownPc) add('sw', { name:t('g_pc'), spec:'', qty:1, why:t(S.tr === 'ip' ? 'w_pcNdi' : 'w_pc'), code:'PC', role:'pc' });
    if (S.tr === 'ip') {
      if (ownPc) add('sw', { name:t('g_ndisoft'), spec:t('g_ndiswSpec', nIn), qty:1, why:t('w_ndisoft'), code:'NDI', role:'sw', own:false });
      else add('sw', { name:t('g_ndisw'), spec:t('g_ndiswSpec', nIn) + (hd ? '' : ' · ' + Q.pgm), qty:1, why:t('w_ndisw'), code:'NDI', role:'sw' });
      /* round 3: the NDI switcher / software records and streams; the screen still needs its run and its cut */
      if (S.pr && D.PROD) { const pr = S.pr, scr = pr.scr && pr.scr !== 'none' ? pr.scr : null;
        if (pr.gfx === 'lyrics') add('sw', { name:t('g_lyr'), spec:'', qty:1, why:t('w_lyr'), code:'PC', role:'pc' });
        if (pr.st >= 2) warn(t('c_st2', '2+'), 'info');
        if (scr === 'overflow') add('sw', { id:D.PROD.dec, qty:1, why:t('w_dec'), role:'sw' });
        else if (scr) add('cab', { name:t('g_scr', t('scr_' + scr)), spec:'', qty:1, why:t(pr.feed === 'same' ? 'c_feedSame' : pr.feed === 'aux' ? 'c_feedAux' : 'w_me2'), code:'SDI' });
        if (scr) warn(t(pr.feed === 'same' ? 'c_feedSame' : pr.feed === 'aux' ? 'c_feedAux' : 'w_me2'), 'info'); }
    }
    else if (S.pr && D.PROD) prodBuild(nC, nIn, add, warn, hd, labs, cams);
    else {
      const list = S.tr === 'hdmi' ? (hd ? D.SWITCHERS.hdmi : null) : (hd ? D.SWITCHERS.sdi : D.SWITCHERS.sdiUHD);
      if (!list) { add('sw', { name:t('g_uhdhdmi'), spec:t('g_bigsw', nIn), qty:1, why:t('w_uhdhdmi'), code:'SW', role:'sw' }); warn(t('c_uhdHdmi')); }
      else {
        sw = list.find(s => s.inp >= nIn);
        if (sw) add('sw', { id:sw.id, qty:1, why:t(sw.stream ? 'w_switch' : 'w_switchNS', nC, S.ext, nIn), approx:!!sw.approx, role:'sw' });
        else { add('sw', { name:t('g_bigsw', nIn), spec:'', qty:1, why:t('w_bigsw'), code:'SW', role:'sw' }); warn(t('c_inputs', nIn, list[list.length - 1].inp)); }
        if (sw && !sw.stream) add('sw', { id:D.SWITCHERS.encoder, qty:1, why:t('w_enc'), role:'pc' });
      }
    }
    encCams.forEach(i => add('sw', { name:t('g_ndienc'), spec:(cams[i].k === 'lens' && !D.BODIES[cams[i].m].sdi ? 'HDMI' : 'SDI/HDMI') + ' → NDI|HX, PoE', qty:1, why:t('w_ndienc'), who:[labs[i]], code:'NDI' }));

    /* --- cabling (per run) --- */
    const sdiRuns = [], catRuns = [];
    let maxSdi = 0;
    const mobs = [];
    cams.forEach((c, i) => {
      const lab = labs[i], run = runOf(c), z = zspec(c);
      const camSdi = c.k === 'lens' ? D.BODIES[c.m].sdi : z.sdi, camHdmi = c.k === 'lens' ? D.BODIES[c.m].hdmi : z.hdmi;
      const pa = pathOf(c), conv = hd ? (D.PROD && D.PROD.conv3) || 'microconv' : 'microconv';
      PROD.cams[i] = { cable:pa.cable, conv:pa.conv, up:pa.up, unk:pa.unk, swap:null };
      if (c.mob && c.k !== 'ptz' && D.WIRELESS) { mobs.push(i); return; }   /* round 3: a handheld camera reaches the switcher wirelessly */
      /* round 5: a camera that can't deliver the quality (flag + the cheapest same-family store camera that can), or one whose rate is not stated */
      if (pa.up && !c.own) { const sw = swapFor(c); PROD.cams[i].swap = sw; warn(sw ? t(S.tr === 'ip' ? 'c_ipHd' : 'c_up', lab, modelName(c), Q.pgm, best4k(pa.v), P[sw].brand + ' ' + P[sw].name) : t(S.tr === 'ip' ? 'c_ipHd' : 'c_upNo', lab, modelName(c), Q.pgm, best4k(pa.v))); }
      else if (pa.up) warn(t(S.tr === 'ip' ? 'c_ipHd' : 'c_upNo', lab, modelName(c), Q.pgm, best4k(pa.v)));
      else if (pa.unk) warn(t(S.tr === 'ip' ? 'c_ipUnk' : 'c_unk', lab, modelName(c), Q.pgm), 'info');
      if (S.tr === 'hdmi') {
        if (!camHdmi) add('sw', { id:conv, qty:1, why:t('w_convHdmi', modelName(c)), who:[lab] });
        if (run <= R.hdmiPassive) { add('cab', { id:'hdmi76', qty:1, why:t('w_sdi'), who:[lab + ' ' + lenTxt(run)] }); warn(t('c_hdmiOk', lab, lenTxt(run)), 'ok'); }
        else if (run <= 10) { add('cab', { id:'hdmiaoc10', qty:1, why:t('w_sdi'), who:[lab + ' ' + lenTxt(run)] }); warn(t('c_hdmiAoc', lab, lenTxt(run))); }
        else if (run <= R.hdmiActive) { add('cab', { id:'hdmiaoc15', qty:1, why:t('w_sdi'), who:[lab + ' ' + lenTxt(run)] }); warn(t('c_hdmiAoc', lab, lenTxt(run))); }
        else { add('sw', { id:conv, qty:2, why:t(hd ? 'w_convLong3' : 'w_convLong12'), who:[lab] }); sdiRuns.push([lab, run]); warn(t('c_hdmiLong', lab, lenTxt(run))); }
      } else if (S.tr === 'sdi') {
        /* the converter at the camera: HDMI → 12G-SDI when its 4K is HDMI-only, HDMI → 3G-SDI for a 1080 picture */
        if (pa.conv === 'conv12') add('sw', { id:D.PROD.conv12, qty:1, why:t('w_conv12', modelName(c), 'HDMI 2160p' + (pa.v.h || Q.fps)), who:[lab], approx:pa.unk });
        else if (pa.conv === 'conv3') add('sw', { id:D.PROD.conv3, qty:1, why:t(pa.up ? 'w_conv3Hd' : 'w_conv3', modelName(c)), who:[lab] });
        const lim = hd || pa.up ? R.sdi3G : R.sdi12G;
        if (run > lim) { add('sw', { id:'fiberconv', qty:2, why:t('w_fiber'), who:[lab] }); add('cab', { name:t('g_fiber'), spec:buyLen(run), qty:1, why:t('w_fiber'), who:[lab], code:'FIBER', len:buyLen(run) }); warn(t('c_sdiLong', lab, lenTxt(run), lim === R.sdi3G ? '3G-SDI' : '12G-SDI', lim)); }
        else { sdiRuns.push([lab, run]); maxSdi = Math.max(maxSdi, run); }
      }
      if (S.tr === 'ip') catRuns.push([lab, run, 'ip']);
      else if (c.k === 'ptz') catRuns.push([lab, run, S.ctl === 'ip' ? 'ctl' : '422']);
    });
    if (mobs.length) {
      const WL = D.WIRELESS, W5 = (D.PROD || {}).wl, base = S.tr === 'sdi' ? WL.sdi : WL.hdmi;
      mobs.forEach(i => { const c = cams[i], lab = labs[i], d = Math.hypot(c.x - S.ctrl.x, c.y - S.ctrl.y) + (S.xr || 0), v = vout(c.m), z5 = camSpec(c);
        let id = base; if (d > WL.los[base] * WL.indoor) id = WL.long;
        /* round 5: 4K goes through the Accsoon link only on HDMI (TX in, RX out); 4K60 needs the Master 4K */
        const wl4k = !hd && z5.hdmi && (v.h == null || v.h >= Q.fps);
        if (!hd && W5 && wl4k && Q.fps === 60 && id === W5.se.id) { id = W5.master.id; warn(t('w_wl60'), 'info'); }
        if (!hd && !wl4k) { warn(t('c_wlUp', lab)); PROD.cams[i].up = true; PROD.cams[i].cable = 'Wireless · 1080'; }
        else PROD.cams[i].cable = hd ? 'Wireless' : 'Wireless · HDMI 4K';
        const rng = Math.round(WL.los[id] * WL.indoor);
        add('sw', { id, qty:1, why:t('w_wl', rng), who:[lab], approx:!!(WL.kitVerify || {})[id] });
        if ((WL.kitVerify || {})[id]) warn(t('c_wlKit', P[id].brand + ' ' + P[id].name, WL.kitVerify[id]), 'info');
        if (d > rng) warn(t('c_wlFar', lab, lenTxt(d), rng, P[id].name));
        if (S.tr === 'ip') add('sw', { name:t('g_ndirx'), spec:'HDMI → NDI|HX', qty:1, why:t('w_ndienc'), who:[lab], code:'NDI' });
        if (!hd && wl4k && S.tr === 'sdi' && D.PROD.conv12) { add('sw', { id:D.PROD.conv12, qty:1, why:t('w_wlConv'), who:[lab] }); PROD.cams[i].conv = 'wl12'; }
        add('net', { name:t('g_npf'), spec:'NP-F', qty:1, why:t('w_npf'), who:[lab], code:'PWR' }); });
      warn(t('c_wlNotes'), 'info');
    }
    if (S.tr === 'sdi' && sdiRuns.length && !chk.some(c => c.txt.includes('SDI') && c.lvl === 'warn')) warn(t('c_sdiOk', lenTxt(maxSdi), hd ? R.sdi3G : R.sdi12G, hd ? '3G-SDI' : '12G-SDI'), 'ok');
    const sdiTotal = sdiRuns.reduce((a, r) => a + Math.ceil(r[1]), 0);
    if (sdiRuns.length) {
      if (sdiTotal >= R.sdiBulkFrom) {
        if (hd) { add('cab', { id:'belden1855', qty:Math.ceil(sdiTotal / 305), why:t('w_bulk', sdiTotal), who:sdiRuns.map(r => r[0]) }); add('cab', { id:'beldenbnc', qty:Math.ceil(sdiRuns.length * 2 / 50), why:t('w_bulk', sdiTotal) }); }
        else { add('cab', { id:'canare300', qty:Math.ceil(sdiTotal / 300), why:t('w_bulk', sdiTotal), who:sdiRuns.map(r => r[0]) }); add('cab', { name:t('g_bnc12'), spec:'× ' + sdiRuns.length * 2, qty:sdiRuns.length * 2, why:t('w_bulk', sdiTotal), code:'BNC' }); }
      } else sdiRuns.forEach(([lab, run]) => { if (run <= 2) add('cab', { id:'sdi2', qty:1, why:t('w_sdi'), who:[lab] }); else add('cab', { name:t('g_sdi'), spec:buyLen(run), qty:1, why:t('w_sdi'), who:[lab], code:'SDI', len:buyLen(run) }); });
    }
    catRuns.forEach(([lab, run, kind]) => {
      add('cab', { name:t('g_cat6'), spec:buyLen(run), qty:1, why:t(kind === 'ip' ? 'w_cat6ip' : kind === 'ctl' ? 'w_cat6ctl' : 'w_cat6422'), who:[lab], code:'CAT6', len:buyLen(run) });
      if (run > R.eth) warn(t('c_eth', lab, lenTxt(run)));
    });
    if (S.ctl === '422' && ptz.length && S.tr !== 'ip') warn(t('c_422', S.tr === 'hdmi' ? 'HDMI' : 'SDI'), 'info');

    /* --- network & power --- */
    let poeW = 0, poePP = 0, poePorts = 0, ethDev = 0;
    const acCams = [];
    cams.forEach((c, i) => {
      const z = zspec(c), lab = labs[i];
      if (c.k === 'ptz' && (S.tr === 'ip' || S.ctl === 'ip')) {
        ethDev++;
        if (z.poeAC) { acCams.push(lab); warn(t(c.m === 'ue150' ? 'c_ue150' : 'c_poeAC', lab)); }
        else { poeW += z.poeW; poePorts++; if (z.poe === 'PoE++') poePP++; }
      } else if (c.k === 'ptz') acCams.push(lab);
      else if (S.tr === 'ip') { ethDev++; poeW += 15; poePorts++; acCams.push(lab); }
      else acCams.push(lab);
    });
    let netsw = null;
    if (ethDev) {
      const ports = ethDev + 2 + (S.tr === 'ip' ? 1 : 0) + 1;
      const fits = D.NETSW.filter(n => n.ports >= ports && n.poePP >= poePP && (n.poePlus + n.poePP) >= poePorts && n.budget >= poeW);
      const pref = S.tr === 'ip' ? fits.sort((a, b) => (b.managed - a.managed) || P[a.id].usd - P[b.id].usd) : fits.sort((a, b) => P[a.id].usd - P[b.id].usd);
      netsw = pref[0];
      if (netsw) {
        add('net', { id:netsw.id, qty:1, why:t('w_net', ports, netsw.ports, poeW, netsw.budget), role:'net' });
        warn(t('c_poe', poeW, netsw.budget, P[netsw.id].name), 'ok');
        if (S.tr === 'ip' && !netsw.managed) warn(t('c_unmanaged'), 'info');
      } else {
        add('net', { name:t('g_poesw'), spec:t('g_poeswSpec', ports, Math.ceil(poeW * 1.25 / 10) * 10), qty:1, why:t('w_poesw'), code:'NET', role:'net' });
        warn(t('c_poeNo', poeW, poePP));
      }
    }
    if (acCams.length) add('net', { name:t('g_power'), spec:'', qty:acCams.length, why:t('w_power'), who:acCams, code:'AC' });
    add('net', { name:t('g_ups'), spec:'', qty:1, why:t('w_ups'), code:'UPS' });

    /* --- mounts --- */
    cams.forEach((c, i) => {
      const lab = labs[i], heavy = c.k === 'lens' && D.BODIES[c.m].studio;
      if (c.mob && c.k !== 'ptz') return;   /* handheld: no tripod */
      if (c.mnt === 'tripod') add('mnt', { id: heavy ? 'focus12' : 'ad01', qty:1, why:t(heavy ? 'w_tripodHeavy' : 'w_tripod'), who:[lab], role:'tri' });
      else if (c.mnt === 'wall' || c.mnt === 'ceiling') add('mnt', { name:t(c.mnt === 'wall' ? 'g_wall' : 'g_ceil', modelName(c)), spec:'', qty:1, why:t('w_bracket'), who:[lab], code:'BRKT' });
    });

    /* --- audio --- */
    const T = TPL[S.tpl], nP = S.ppl.length, style = T.audio;
    if (nP) {
      if (style === 'podcast') {
        add('aud', { id:'sm7b', qty:nP, why:t('w_mic', nP) });
        add('aud', { name:t('g_arm'), spec:'', qty:nP, why:t('w_arm'), code:'ARM' });
        add('cab', { name:t('g_xlr3'), spec:'', qty:nP, why:t('w_xlrMic'), code:'XLR', len:'3 m' });
        add('aud', { id: nP <= 6 ? 'p8' : nP <= 8 ? 'l12' : 'l20r', qty:1, why:t('w_rec', nP) });
        add('aud', { id:'mdr', qty:nP + 1, why:t('w_phones') });
      } else {
        const mic = style === 'church' || style === 'event' ? 'ewd' : 'ewdme4';
        add('aud', { id:mic, qty:nP, why:t('w_mic', nP) });
        const band = style === 'church' ? 4 : 0, nIn2 = nP + band;
        if (style === 'empty' && nP <= 2) add('aud', { name:t('w_mixDirect', nP), spec:'', qty:0, why:'', info:true });
        else {
          add('aud', { id: nIn2 <= 8 ? 'l12' : nIn2 <= 16 ? 'l20r' : 'dm3', qty:1, why:t('w_mix', nP, band) });
          add('cab', { name:t('g_xlr1'), spec:'', qty:nP, why:t('w_xlrRx'), code:'XLR', len:'1 m' });
        }
        add('aud', { id:'mdr', qty:1, why:t('w_phonesOp') });
      }
      add('cab', { name:t('g_pgmAudio'), spec:'3 m', qty:1, why:t('w_pgmAudio'), code:'AUD', len:'3 m' });
    }

    /* --- lighting (suggestion) --- */
    if (S.lt && D.lightPlan) lightBuild(add, warn, nP);
    else {
    const lit = { podcast:[['a200d', 2], ['pt2c', 1]], church:[['ls600d', 2]], studio:[['nova', 2], ['p60c', 1]], event:[['ls1200d', 2]], empty:[['p60c', 1]] }[T.lit];
    lit.forEach(([id, q]) => add('lit', { id, qty:q, why:t('w_lit_' + T.lit) }));
    if (T.lit === 'church') add('lit', { name:t('g_dmx'), spec:'', qty:1, why:t('w_dmx'), code:'DMX' });
    }

    /* --- monitoring & intercom --- */
    add('mon', { name:t('g_mv'), spec:'', qty:1, why:t('w_mv'), code:'MON' });
    add('cab', { name:t('g_hdmiMv'), spec:'', qty:1, why:t('w_hdmiMv'), code:'HDMI', len:'2 m' });
    if (S.tpl === 'studio') add('mon', { name:t('g_conf'), spec:'', qty:1, why:t('w_conf'), code:'MON' });
    const manned = cams.filter(c => c.man && c.k !== 'ptz').length, ops = 1 + manned;
    if (ops > 1) {
      const ic = ops <= 4 ? 'solid' : ops <= 6 ? 'c16s' : ops <= 8 ? 'c1pro8' : null;
      if (ic) add('mon', { id:ic, qty:1, why:t('w_icom', ops, manned) }); else add('mon', { name:t('g_icom', ops), spec:'', qty:1, why:t('w_icom', ops, manned), code:'ICOM' });
      warn(t('c_icom', ops), 'info');
    }

    /* --- framing checks --- */
    views.forEach((v, i) => { if (!v.tg) warn(t('c_noTgt', labs[i])); else if (v.out) warn(t('c_tgtOut', labs[i], pname(v.tg.p.n))); });
    /* version F round 2: dim effective aperture (rule of thumb) and a Super 35 lens on a full-frame body */
    cams.forEach((c, i) => { if (c.k !== 'lens') return; const a = apAt(c); if (a && a > (D.DIM_AP || 8) + 0.3) warn(t('c_dim', labs[i], fNum(a)), 'info');
      const lz = D.LENSES[c.lens], b = D.BODIES[c.m], ex = extOf(c);
      if (lz && lz.ic === 's35' && b.fmt === 'ff' && !c.crop && !(ex && ex.builtin)) warn(t('c_ic', labs[i], P[c.lens] ? P[c.lens].name : c.lens)); });
    /* version F: a camera aimed at one person, at the end of its zoom, still framing wider than a medium close-up */
    views.forEach((v, i) => { const c = cams[i]; if (c.tgt < 0 || !v.tg || v.out || !v.fw) return;
      const atLimit = zspec(c) ? c.z >= 0.995 : c.f >= lensRange(c)[1] - 0.01;
      if (atLimit && v.fw > REACH_FW) warn(t('c_reach', labs[i], lenTxt(v.fw), pname(v.tg.p.n))); });
    if (fromThisSetup()) {
      const nm = id => P[id].brand + ' ' + P[id].name, list = a => a.map(x => `${x.q} × ${nm(x.m || x.id)}`).join(', ');
      if (SETUP.loaded.length) { warn(t('c_setCams', SETUP.title, list(SETUP.loaded), t('t_' + SETUP.tpl)), 'info'); if (SETUP.missing.length) warn(t('c_setSome', list(SETUP.missing)), 'info'); }
      else if (SETUP.missing.length) warn(t('c_setUnknown', SETUP.title, list(SETUP.missing), t('t_' + SETUP.tpl)), 'info');
      else warn(t('c_setNoCams', SETUP.title, t('t_' + SETUP.tpl)), 'info');
    }
    if (nC) warn(t('c_stream'), 'info');
    /* owner, 25 Nov 2026: every plan carries i9TV's services, to quote (plus programming where the plan needs it) */
    const svc = (name, spec) => add('svc', { name, spec:spec || '', qty:1, why:t('w_svc'), code:'SVC' });
    svc(t('g_inst')); svc(t('g_train')); svc(t('g_sla'));
    const lc = out.some(l => l.id === (D.LIGHTCTL || {}).ctl || /S-PLAY/.test(l.name || ''));
    if (lc) svc(t('g_prog'));
    if (S.lt && S.lt.panel && (S.lt.ptype || 'kiosc') !== 'bstation' && out.some(l => l.id === (D.LIGHTCTL || {}).ctl)) svc(t('g_klay'));
    if (out.some(l => l.id === (D.LIGHTCTL || {}).ctl) && S.pr) svc(t(S.pr.how === 'pc' ? 'g_vtcp' : 'g_comp'));   /* the S-PLAY MINI can't drive vMix / ATEM: no bridge line */
    BOM = out.filter(l => !l.info || true); CHECKS = chk;
  }

  /* the one place totals are made: owned lines are never priced, "to quote" lines never get a number */
  function tally(bom) {
    const lines = bom.filter(l => !l.info);
    const owned = lines.filter(l => l.own), buy = lines.filter(l => !l.own);
    const priced = buy.filter(l => l.id && P[l.id]), quote = buy.filter(l => !(l.id && P[l.id]));
    const total = priced.reduce((a, l) => a + P[l.id].usd * l.qty, 0);
    const ownedValue = owned.filter(l => l.id && P[l.id]).reduce((a, l) => a + P[l.id].usd * l.qty, 0);
    return { lines, priced, quote, owned, total, ownedValue };
  }
  const CODEGLYPH = { SDI:'SDI', CAT6:'CAT6', XLR:'XLR', AUD:'AUD', HDMI:'HDMI', FIBER:'FIBER', BNC:'BNC', NET:'NET', AC:'AC', UPS:'UPS', BRKT:'BRKT', ARM:'ARM', LENS:'LENS', NDI:'NDI', SW:'SW', CTRL:'CTRL', DMX:'DMX', MON:'MON', ICOM:'ICOM', PC:'PC', PWR:'PWR', SVC:'SVC' };
  function renderBOM() {
    const { priced, quote, owned, total } = tally(BOM);
    $('#bom-m').textContent = `${t('t_' + S.tpl)} · ${lenTxt(S.w)} × ${lenTxt(S.d)} · ${S.cams.length} ${t('q_cams').toLowerCase()} · ${S.tr === 'ip' ? 'IP / NDI' : S.tr.toUpperCase()} · ${fmtTxt()}`;
    $('#btot').innerHTML = `<div class="tp"><span class="meta">${t('totalPriced')}</span><span class="price" id="ptotal">${usd(total)}</span>
      <span class="meta-s cnt"><span>${t('pricedLines', priced.length)}</span><span><i class="qd"></i>${t('quoteLines', quote.length)}</span>${owned.length ? `<span><i class="ow"></i>${t('ownedLines', owned.length)}</span>` : ''}</span></div>
      <div class="acts"><button type="button" class="btn sig" id="b-quote">${t('reqQuote')}</button><button type="button" class="btn solid" id="b-addall">${t('addAll')}</button>
      <button type="button" class="btn" id="b-print">${t('print')}</button><button type="button" class="btn" id="b-link">${t('copyLink')}</button></div>`;
    $('#bomlist').innerHTML = GROUPS.map((g, gi) => {
      const ls = BOM.filter(l => l.g === g); if (!ls.length) return '';
      const sub = ls.filter(l => !l.own && l.id && P[l.id]).reduce((a, l) => a + P[l.id].usd * l.qty, 0);
      return `<section class="bgrp" aria-labelledby="bg-${g}"><h3 class="gh" id="bg-${g}"><span class="n meta">${String(gi + 1).padStart(2, '0')}</span><b>${t('g_' + g)}</b><span class="meta-s">${(n => n === 1 ? t('line1') : t('lines', n))(ls.filter(l => !l.info).length)}${sub ? ' · ' + usd(sub) : ''}</span></h3>
        ${ls.map(l => row(l)).join('')}</section>`;
    }).join('');
  }
  function row(l) {
    if (l.info) return `<div class="brow info"><span class="gl"><b>i</b></span><div class="bi"><b>${esc(l.name)}</b></div></div>`;
    const p = l.id && P[l.id];
    const who = l.who && l.who.length ? `<span class="who">${l.who.map(esc).join(' · ')}</span>` : '';
    if (l.own) {
      return `<div class="brow own">${p ? `<span class="pk"><img src="${p.src}" alt="" loading="lazy"></span>` : `<span class="gl"><b>${CODEGLYPH[l.code] || '—'}</b>${l.len ? `<i>${esc(l.len)}</i>` : ''}</span>`}
        <div class="bi">${p ? `<span class="br meta-s">${esc(p.brand)}</span><b>${esc(p.name)}</b>` : `<b>${esc(l.name)}</b>`}<span class="why meta-s">${esc(l.why)}${who ? ' · ' : ''}${who}</span></div>
        <span class="q"><span class="meta">${t('qty')}</span><b>${l.qty}</b></span>
        <span class="pr"><b class="price">${usd(0)}</b></span><span class="ac"><span class="tag own meta">${t('youHave')}</span></span></div>`;
    }
    if (p) {
      return `<div class="brow"><span class="pk"><img src="${p.src}" alt="" loading="lazy"></span>
        <div class="bi"><span class="br meta-s">${esc(p.brand)}</span><b>${esc(p.name)}</b><span class="sp">${esc(p.sub)}</span><span class="why meta-s">${esc(l.why)}${l.approx ? ' · <span class="ax">' + t('approxShort') + '</span>' : ''}${who ? ' · ' : ''}${who}</span></div>
        <span class="q"><span class="meta">${t('qty')}</span><b>${l.qty}</b></span>
        <span class="pr"><b class="price">${usd(p.usd * l.qty)}</b>${l.qty > 1 ? `<span class="meta-s">${usd(p.usd)} ${t('each')}</span>` : ''}</span>
        <span class="ac"><button type="button" class="btn sm" data-padd="${l.id}" data-qty="${l.qty}">${t('addBag')}</button></span></div>`;
    }
    return `<div class="brow tq"><span class="gl"><b>${CODEGLYPH[l.code] || '—'}</b>${l.len ? `<i>${esc(l.len)}</i>` : ''}</span>
      <div class="bi"><b>${esc(l.name)}</b>${l.spec && l.spec !== l.len ? `<span class="sp">${esc(l.spec)}</span>` : ''}<span class="why meta-s">${esc(l.why)}${who ? ' · ' : ''}${who}</span></div>
      <span class="q"><span class="meta">${t('qty')}</span><b>${l.qty}</b></span>
      <span class="pr"><span class="tag meta">${t('toQuote')}</span></span><span class="ac"></span></div>`;
  }
  function renderChecks() {
    const order = { warn:0, info:2, ok:1 };
    const list = CHECKS.slice().sort((a, b) => order[a.lvl] - order[b.lvl]);
    const hasWarn = list.some(c => c.lvl === 'warn');
    $('#checks').innerHTML = (hasWarn ? '' : `<li class="ok lead"><i aria-hidden="true"></i><span>${esc(t('c_ok'))}</span></li>`) +
      list.map(c => `<li class="${c.lvl}"><i aria-hidden="true"></i><span><span class="sr">${c.lvl === 'warn' ? 'Warning: ' : ''}</span>${esc(c.txt)}</span></li>`).join('');
  }

  /* ======================= controls, head, signal ======================= */
  function renderHead() {
    const tb = $('#tbus');
    if (!tb.querySelector('label')) tb.insertAdjacentHTML('beforeend', TORDER.map((k2, i) => `<label><input type="radio" name="tpl" value="${k2}"><span class="n">${String(i + 1).padStart(2, '0')}<i aria-hidden="true"></i></span><b data-t="${k2}"></b><span class="td meta-s" data-td="${k2}"></span></label>`).join(''));
    $$('#tbus b[data-t]').forEach(b => { b.textContent = t('t_' + b.dataset.t); });
    $$('#tbus [data-td]').forEach(b => { b.textContent = t('td_' + b.dataset.td); });
    $$('#tbus input').forEach(i => { i.checked = i.value === S.tpl; });
    const u = S.unit === 'ft' ? FT : 1;
    const wI = $('#room-w'), dI = $('#room-d');
    const nf = v => { const x = String(S.unit === 'ft' ? Math.round(v * 10) / 10 : r2(v)); return LANG === 'pt' ? x.replace('.', ',') : x; };
    if (document.activeElement !== wI) wI.value = nf(S.w * u);
    if (document.activeElement !== dI) dI.value = nf(S.d * u);
    $$('.dims .u').forEach(e => { e.textContent = S.unit; });
    $$('#units button').forEach(b => b.setAttribute('aria-pressed', b.dataset.unit === S.unit));
    $$('#transport button').forEach(b => b.setAttribute('aria-pressed', b.dataset.tr === S.tr));
    $('#tr-note').textContent = t('tr_' + S.tr);
    $('#fmt').value = S.fmt; $('#ctl').value = S.ctl;
    if (document.activeElement !== $('#ext')) $('#ext').value = S.ext;
    const xr = $('#xr'); if (xr && document.activeElement !== xr) xr.value = S.unit === 'ft' ? Math.round((S.xr || 0) * FT) : r2(S.xr || 0);
    $$('.xr-u').forEach(e => { e.textContent = S.unit; });
    const op = $('#own-list');
    if (op) {
      if (!op.firstChild) op.innerHTML = ROLES.map(r => `<label class="chk"><input type="checkbox" data-own="${r}"><span data-ownl="${r}"></span></label>`).join('');
      $$('[data-own]', op).forEach(i => { i.checked = (S.own || []).includes(i.dataset.own); });
      $$('[data-ownl]', op).forEach(e => { e.textContent = t('r_' + e.dataset.ownl); });
    }
    const ts = $('#tset'), sid = fromThisSetup() ? SETUP.id : TPL_SETUP[S.tpl], st = sid && SETS()[sid];
    if (ts) {
      ts.hidden = !st;
      if (st) ts.innerHTML = fromThisSetup()
        ? `<span class="tl" title="${esc(st.title)}">${t('setFrom')} <b>${esc(st.title)}</b></span><a href="setups.html#${esc(sid)}">${t('setOpen')} ${icon('arrow-right')}</a>`
        : `<a href="setups.html#${esc(sid)}" title="${esc(st.title)}"><span class="tl">${t('setMatch')}: ${esc(st.title)}</span> ${icon('arrow-right')}</a>`;
    }
    const tc = $('#tconfirm');
    if (tc && !tc.hidden && tc.dataset.v) { $('#tc-msg').textContent = t('tcMsg', t('t_' + tc.dataset.v)); $('#tc-yes').textContent = t('tcYes'); $('#tc-no').textContent = t('tcNo'); }
  }
  function applyLang() {
    document.documentElement.lang = LANG === 'pt' ? 'pt-BR' : 'en';
    $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
    $$('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === LANG));
    document.title = (LANG === 'pt' ? 'Planeje sua sala' : 'Plan your room') + ' — i9Store USA';
  }

  /* ======================= update cycle + URL state ======================= */
  let hashT = 0;
  function update(o = {}) {
    if (o.stat) renderStatic();
    renderPlan(); renderViews(); renderInspector(o.force);
    build(); renderBOM(); renderChecks(); renderHead();
    clearTimeout(hashT); hashT = setTimeout(saveHash, o.now ? 0 : 300);
    document.dispatchEvent(new CustomEvent('i9plan:update'));
  }
  function pack(noZ) {
    const o = packPlan();
    const z = noZ ? null : (zGet ? zGet() : Z);
    if (z) o.z = z;
    return o;
  }
  function packPlan() {
    const o = { v:1, t:S.tpl, w:r2(S.w), d:r2(S.d), u:S.unit, tr:S.tr, fm:S.fmt, ct:S.ctl, e:S.ext, c:[r2(S.ctrl.x), r2(S.ctrl.y)],
      f:S.furn.map(f => [f.k, r2(f.x), r2(f.y), r2(f.w), r2(f.h)]), p:S.ppl.map(p => [p.n, r2(p.x), r2(p.y), Math.round(p.a)]),
      k:S.cams.map(c => { const a = [c.k, c.m, r2(c.x), r2(c.y), Math.round(c.a * 10) / 10, Math.round(c.z * 1000) / 1000, r2(c.f), c.lens, c.sf, c.mnt, c.man ? 1 : 0, c.tgt];
        if (c.own || c.ext || c.crop || c.mob) a.push(c.own ? 1 : 0); if (c.ext || c.crop || c.mob) a.push(c.ext || 0, c.crop ? 1 : 0); if (c.mob) a.push(1); return a; }) };
    if (S.pr) o.pr = S.pr; if (S.lt) o.lt = S.lt;
    /* only when used, so plans saved before the wizard keep the same link */
    if (S.xr) o.x = r2(S.xr);
    if (S.own && S.own.length) o.o = S.own.slice();
    return o;
  }
  function unpack(o) {
    if (!o || o.v !== 1 || !TPL[o.t]) return false;
    S = { tpl:o.t, w:clamp(+o.w, 2, 80), d:clamp(+o.d, 2, 80), unit:o.u === 'ft' ? 'ft' : 'm', tr:['sdi', 'hdmi', 'ip'].includes(o.tr) ? o.tr : 'sdi', fmt:o.fm === 'uhd' ? 'uhd' : 'hd', ctl:o.ct === '422' ? '422' : 'ip', ext:clamp(+o.e || 0, 0, 8),
      ctrl:{ x:+o.c[0], y:+o.c[1] }, furn:(o.f || []).filter(f => FURN[f[0]]).map(f => ({ id:nid(), k:f[0], x:+f[1], y:+f[2], w:+f[3], h:+f[4] })),
      ppl:(o.p || []).map(p => ({ id:nid(), n:String(p[0]).slice(0, 28), x:+p[1], y:+p[2], a:+p[3] || 0 })), cams:[],
      xr:clamp(+o.x || 0, 0, 200), own:Array.isArray(o.o) ? o.o.filter(r => ROLES.includes(r)) : [],
      pr:o.pr && typeof o.pr === 'object' ? o.pr : null, lt:o.lt && typeof o.lt === 'object' ? o.lt : null };
    Z = o.z && typeof o.z === 'object' ? o.z : null;
    (o.k || []).forEach(a => {
      const [kk, m] = a; const ok = kk === 'ptz' ? D.PTZ[m] : kk === 'cc' ? D.CAMCORDER[m] : kk === 'lens' ? D.BODIES[m] : null; if (!ok || !P[m]) return;
      const c = newCam(kk, m, S, { x:+a[2], y:+a[3], a:+a[4], mnt:a[9], man:!!a[10], lens:a[7], ext:D.EXT && D.EXT[a[13]] ? a[13] : null, crop:!!a[14] && !!(D.BODIES[m] && D.BODIES[m].crop), mob:!!a[15] });
      c.z = clamp(+a[5] || 0, 0, 1); if (kk === 'lens') { c.sf = D.FORMATS[a[8]] ? a[8] : c.sf; const [lo, hi] = lensRange(c); c.f = clamp(+a[6] || lo, lo, hi); }
      c.tgt = Number.isInteger(a[11]) ? a[11] : -1; if (!R.rise[c.mnt]) c.mnt = 'tripod';
      if (a[12]) c.own = true;
      S.cams.push(c);
    });
    return true;
  }
  const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
  const planURL = () => location.href.split('#')[0] + '#p=' + b64e(JSON.stringify(pack()));
  function saveHash() { try { history.replaceState(null, '', '#p=' + b64e(JSON.stringify(pack()))); } catch (e) {} }
  function loadHash() {
    const h = location.hash;
    Z = null;
    const m = h.match(/^#p=([\w-]+)/);
    if (m) { try { if (unpack(JSON.parse(b64d(m[1])))) return true; } catch (e) {} }
    const tm = h.match(/^#(?:tpl|for|adv)=?-?([\w-]+)/);
    const map = { church:'church', podcast:'podcast', studio:'studio', event:'event', events:'event', corporate:'event', broadcast:'studio', education:'event', empty:'empty' };
    if (tm && SETS()[tm[1]]) { SETUP = fromSetup(tm[1]); return true; }
    if (tm && map[tm[1]]) { SETUP = null; fromTemplate(map[tm[1]]); return true; }
    const q = queryTemplate();
    if (q) { SETUP = fromSetup(q); return true; }
    SETUP = null; fromTemplate('podcast');
    return true;
  }
  function queryTemplate() { try { const v = new URLSearchParams(location.search).get('template'); return v && SETS()[v] ? v : null; } catch (e) { return null; } }
  /* after a load: keep the setup note for a saved plan that still sits on the setup's template, and remember the untouched plan */
  function settle() {
    if (/^#p=/.test(location.hash)) { const q = queryTemplate(); SETUP = null; if (q && tplForSetup(q) === S.tpl) { const keep = S; SETUP = fromSetup(q); S = keep; } }
    BASE = pristine(S.tpl, fromThisSetup() ? SETUP.id : null);
  }

  /* ======================= interaction: drag, rotate, keys ======================= */
  let drag = null;
  function svgPt(e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
  function objOf(kind, i) { return kind === 'cam' ? S.cams[i] : kind === 'ppl' ? S.ppl[i] : kind === 'furn' ? S.furn[i] : kind === 'ctrl' ? S.ctrl : null; }
  function select(kind, i, focus) {
    sel = kind ? { kind, i } : null;
    update({ force:true });
    if (focus && kind) { const g = kind === 'ctrl' ? L.ctrl.firstChild : $(`.l-${kind === 'cam' ? 'cams' : kind === 'ppl' ? 'ppl' : 'furn'} [data-i="${i}"]`, svg); if (g) g.focus({ preventScroll:true }); }
  }
  svg.addEventListener('pointerdown', e => {
    const g = e.target.closest('.obj'); if (!g) return;
    const kind = g.dataset.kind, i = +g.dataset.i, o = objOf(kind, i); if (!o) return;
    e.preventDefault();
    if (!sel || sel.kind !== kind || sel.i !== i) select(kind, i);
    g.focus({ preventScroll:true });
    const pt = svgPt(e);
    drag = { kind, i, rot: !!e.target.dataset.rot && kind === 'cam', dx: pt.x - o.x, dy: pt.y - o.y, id: e.pointerId, moved:false };
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('dragging');
  });
  svg.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const o = objOf(drag.kind, drag.i), pt = svgPt(e);
    if (drag.rot) { let a = (deg(Math.atan2(pt.x - o.x, -(pt.y - o.y))) + 360) % 360; if (e.shiftKey) a = Math.round(a / 15) * 15; o.a = Math.round(a); }
    else {
      const snap = v => Math.round(v / 0.05) * 0.05;
      const hw = o.w ? o.w / 2 : 0, hh = o.h ? o.h / 2 : 0;
      o.x = clamp(snap(pt.x - drag.dx), hw ? Math.min(hw, S.w / 2) : 0.1, hw ? Math.max(S.w - hw, S.w / 2) : S.w - 0.1);
      o.y = clamp(snap(pt.y - drag.dy), hh ? Math.min(hh, S.d / 2) : 0.1, hh ? Math.max(S.d - hh, S.d / 2) : S.d - 0.1);
    }
    drag.moved = true; update();
  });
  const endDrag = e => { if (!drag || (e && e.pointerId !== drag.id)) return; drag = null; svg.classList.remove('dragging'); saveHash(); };
  svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);
  svg.addEventListener('keydown', e => {
    const g = e.target.closest('.obj'); if (!g) return;
    const kind = g.dataset.kind, i = +g.dataset.i, o = objOf(kind, i); if (!o) return;
    const step = e.shiftKey ? 0.5 : 0.1; let hit = true;
    if (e.key === 'ArrowLeft') o.x = clamp(o.x - step, 0, S.w); else if (e.key === 'ArrowRight') o.x = clamp(o.x + step, 0, S.w);
    else if (e.key === 'ArrowUp') o.y = clamp(o.y - step, 0, S.d); else if (e.key === 'ArrowDown') o.y = clamp(o.y + step, 0, S.d);
    else if ((e.key === 'r' || e.key === 'R') && 'a' in o) o.a = ((o.a + (e.shiftKey ? -15 : 15)) % 360 + 360) % 360;
    else if ((e.key === 'Delete' || e.key === 'Backspace') && kind !== 'ctrl') { removeSel(); }
    else if (e.key === 'Enter' || e.key === ' ') { select(kind, i, true); }
    else hit = false;
    if (hit) { e.preventDefault(); if (!sel || sel.kind !== kind || sel.i !== i) sel = { kind, i }; update(); }
  });
  svg.addEventListener('focusin', e => { const g = e.target.closest('.obj'); if (!g) return; const kind = g.dataset.kind, i = +g.dataset.i; if (!sel || sel.kind !== kind || (kind !== 'ctrl' && sel.i !== i)) { sel = { kind, i: kind === 'ctrl' ? 0 : i }; update({ force:true }); } });
  svg.addEventListener('click', e => { if (!e.target.closest('.obj') && !drag) { /* background click keeps selection */ } });

  function removeSel() {
    if (!sel) return;
    if (sel.kind === 'cam') S.cams.splice(sel.i, 1);
    else if (sel.kind === 'ppl') { S.ppl.splice(sel.i, 1); S.cams.forEach(c => { if (c.tgt === sel.i) c.tgt = -1; else if (c.tgt > sel.i) c.tgt--; }); }
    else if (sel.kind === 'furn') S.furn.splice(sel.i, 1);
    sel = S.cams.length ? { kind:'cam', i:0 } : null;
    say(t('live_removed')); update({ force:true });
  }

  /* inspector events */
  selPanel.addEventListener('input', e => {
    if (!sel) return; const id = e.target.id;
    if (sel.kind === 'cam') { const c = S.cams[sel.i];
      if (id === 'i-z') c.z = +e.target.value; else if (id === 'i-f') c.f = +e.target.value; else return; update(); }
    else if (sel.kind === 'ppl' && id === 'i-pn') { S.ppl[sel.i].n = e.target.value.slice(0, 28) || t('p_person', sel.i + 1); renderPlan(); renderViews(); clearTimeout(hashT); hashT = setTimeout(saveHash, 400); }
    else if (sel.kind === 'furn' && (id === 'i-fw' || id === 'i-fh')) { const v = +e.target.value / (S.unit === 'ft' ? FT : 1); if (v >= 0.3) { S.furn[sel.i][id === 'i-fw' ? 'w' : 'h'] = Math.min(v, id === 'i-fw' ? S.w : S.d); update(); } }
  });
  selPanel.addEventListener('change', e => {
    if (!sel || sel.kind !== 'cam') return; const c = S.cams[sel.i], id = e.target.id, v = e.target.value;
    if (id === 'i-model') { const h = hfov(c); c.m = v; if (c.k === 'lens') { c.sf = D.BODIES[v].fmt; c.lens = defaultLens(v); const [lo] = lensRange(c); c.f = lo; } setHfov(c, h); update({ force:true }); }
    else if (id === 'i-lens') { const h = hfov(c); c.lens = v; if (!extOf(c)) c.ext = null; setHfov(c, h); update({ force:true }); }
    else if (id === 'i-ext') { const h = hfov(c); c.ext = v || null; setHfov(c, h); update({ force:true }); }
    else if (id === 'i-crop') { const h = hfov(c); c.crop = e.target.checked; setHfov(c, h); update({ force:true }); }
    else if (id === 'i-sf') { c.sf = v; update({ force:true }); }
    else if (id === 'i-mnt') { c.mnt = v; update(); }
    else if (id === 'i-tgt') { c.tgt = +v; update(); }
    else if (id === 'i-man') { c.man = e.target.checked; update(); }
    else if (id === 'i-own') { c.own = e.target.checked; update(); }
  });
  selPanel.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !sel) return;
    if (b.dataset.del) return removeSel();
    if (sel.kind !== 'cam') return; const c = S.cams[sel.i];
    if (b.dataset.k && b.dataset.k !== c.k) {
      const nk = b.dataset.k, h = hfov(c);
      const m = nk === 'ptz' ? (S.tr === 'ip' ? 'crn300' : 'ue20') : nk === 'cc' ? 'xf605' : 'bm4k';
      const nc = newCam(nk, m, S, { x:c.x, y:c.y, a:c.a, mnt: nk === 'ptz' ? c.mnt : 'tripod' }); nc.id = c.id; nc.tgt = c.tgt; setHfov(nc, h);
      pool.cams.get(c.id)?.remove(); pool.cams.delete(c.id);
      S.cams[sel.i] = nc; update({ force:true }); $(`#i-type [data-k="${nk}"]`)?.focus(); return;
    }
    if (b.dataset.frame) { const v = view(c); frameCam(c, b.dataset.frame, b.dataset.frame === 'wide' ? (c.tgt >= 0 ? c.tgt : 'all') : (v.tg ? v.tg.i : (c.tgt >= 0 ? c.tgt : null))); update(); }
  });

  /* toolbar */
  function menu(btn, m) {
    btn.addEventListener('click', () => { const open = m.hidden; $$('.tools .menu').forEach(x => { x.hidden = true; }); $$('.tools [aria-expanded]').forEach(x => x.setAttribute('aria-expanded', 'false')); m.hidden = !open; btn.setAttribute('aria-expanded', open); if (open) m.querySelector('button').focus(); });
    m.addEventListener('keydown', e => { const items = $$('button', m), i = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { m.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); } if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); } });
  }
  menu($('#add-cam'), $('#cam-menu')); menu($('#add-furn'), $('#furn-menu'));
  document.addEventListener('click', e => { if (!e.target.closest('.addcam')) { $$('.tools .menu').forEach(x => { x.hidden = true; }); $$('.tools [aria-expanded]').forEach(x => x.setAttribute('aria-expanded', 'false')); } });
  $('#cam-menu').addEventListener('click', e => {
    const b = e.target.closest('[data-add-cam]'); if (!b) return;
    if (S.cams.length >= 12) return;
    const kk = b.dataset.addCam, m = kk === 'ptz' ? (S.tr === 'ip' ? 'crn300' : 'ue20') : kk === 'cc' ? 'xf605' : 'bm4k';
    const n = S.cams.length, c = newCam(kk, m, S, { x: clamp(S.w * (0.25 + 0.5 * ((n * 0.37) % 1)), 0.3, S.w - 0.3), y: S.d * 0.82, mnt: kk === 'ptz' ? 'tripod' : 'tripod' });
    S.cams.push(c); frameCam(c, 'med', null);
    $('#cam-menu').hidden = true; $('#add-cam').setAttribute('aria-expanded', 'false');
    say(t('live_added', n + 1)); select('cam', n, true);
  });
  $('#furn-menu').addEventListener('click', e => {
    const b = e.target.closest('[data-add-furn]'); if (!b) return; const kk = b.dataset.addFurn, f = FURN[kk];
    S.furn.push({ id:nid(), k:kk, x:S.w / 2, y:S.d / 2, w:Math.min(f.w, S.w), h:Math.min(f.h, S.d) });
    $('#furn-menu').hidden = true; $('#add-furn').setAttribute('aria-expanded', 'false'); select('furn', S.furn.length - 1, true);
  });
  $('#add-person').addEventListener('click', () => { S.ppl.push({ id:nid(), n:'p_person:' + (S.ppl.length + 1), x:S.w / 2, y:S.d / 2, a:180 }); select('ppl', S.ppl.length - 1, true); });

  /* head controls */
  function applyTemplate(v) {
    hideConfirm();
    SETUP = null;
    if (location.search) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} }
    fromTemplate(v); BASE = planKey();
    sel = { kind:'cam', i:0 }; Object.values(pool).forEach(m => { m.forEach(x => x.remove()); m.clear(); }); L.ctrl.innerHTML = '';
    say(t('live_tpl', t('t_' + v), S.cams.length)); update({ stat:true, force:true, now:true });
  }
  function askTemplate(v) {
    const tc = $('#tconfirm'); tc.dataset.v = v; tc.hidden = false;
    $('#tc-msg').textContent = t('tcMsg', t('t_' + v)); $('#tc-yes').textContent = t('tcYes'); $('#tc-no').textContent = t('tcNo');
    say(t('tcMsg', t('t_' + v)));
  }
  function hideConfirm() { const tc = $('#tconfirm'); if (tc) { tc.hidden = true; delete tc.dataset.v; } }
  $('#tbus').addEventListener('change', e => {
    const v = e.target.value; if (!TPL[v]) return;
    if (planKey() !== BASE) { askTemplate(v); renderHead(); return; }   /* renderHead puts the radio back on the current template */
    applyTemplate(v);
  });
  $('#tconfirm').addEventListener('click', e => {
    const b = e.target.closest('[data-tc]'); if (!b) return;
    const v = $('#tconfirm').dataset.v;
    if (b.dataset.tc === 'yes' && TPL[v]) { applyTemplate(v); $(`#tbus input[value="${v}"]`)?.focus(); }
    else { hideConfirm(); say(t('live_kept')); $(`#tbus input[value="${S.tpl}"]`)?.focus(); }
  });
  $('#tconfirm').addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); hideConfirm(); say(t('live_kept')); $(`#tbus input[value="${S.tpl}"]`)?.focus(); } });
  const dimChange = () => {
    const u = S.unit === 'ft' ? FT : 1, num = v => parseFloat(String(v).replace(',', '.')), w = num($('#room-w').value) / u, d = num($('#room-d').value) / u;
    if (!(w >= 2 && w <= 80 && d >= 2 && d <= 80)) { renderHead(); return; }
    if (!(w >= 2 && w <= 80 && d >= 2 && d <= 80)) return;
    S.w = w; S.d = d;
    [...S.cams, ...S.ppl].forEach(o => { o.x = clamp(o.x, 0.1, S.w - 0.1); o.y = clamp(o.y, 0.1, S.d - 0.1); });
    S.furn.forEach(f => { f.w = Math.min(f.w, S.w); f.h = Math.min(f.h, S.d); f.x = clamp(f.x, f.w / 2, S.w - f.w / 2); f.y = clamp(f.y, f.h / 2, S.d - f.h / 2); });
    S.ctrl.x = clamp(S.ctrl.x, 0.3, S.w - 0.3); S.ctrl.y = clamp(S.ctrl.y, 0.3, S.d - 0.3);
    update({ stat:true });
  };
  ['#room-w', '#room-d'].forEach(id => { $(id).addEventListener('change', dimChange); $(id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); dimChange(); } }); });
  $('#units').addEventListener('click', e => { const b = e.target.closest('[data-unit]'); if (!b) return; S.unit = b.dataset.unit; update({ stat:true, force:true }); });
  $('#transport').addEventListener('click', e => { const b = e.target.closest('[data-tr]'); if (!b) return; S.tr = b.dataset.tr; update({ force:true }); say(b.textContent + ' · ' + t('tr_' + S.tr)); });
  $('#fmt').addEventListener('change', e => { S.fmt = e.target.value; update(); document.dispatchEvent(new CustomEvent('i9plan:fmt', { detail:S.fmt })); });
  $('#ctl').addEventListener('change', e => { S.ctl = e.target.value; update(); });
  $('#ext').addEventListener('change', e => { S.ext = clamp(Math.round(+e.target.value || 0), 0, 8); update(); });
  $('#xr')?.addEventListener('change', e => { const v = parseFloat(String(e.target.value).replace(',', '.')) / (S.unit === 'ft' ? FT : 1); S.xr = clamp(Math.round((v || 0) * 10) / 10, 0, 200); update(); });
  $('#own-list')?.addEventListener('change', e => { const r = e.target.dataset.own; if (!r) return; const o = new Set(S.own || []); if (e.target.checked) o.add(r); else o.delete(r); S.own = ROLES.filter(x => o.has(x)); update(); });
  $$('.step [data-step]').forEach(b => b.addEventListener('click', () => { S.ext = clamp(S.ext + (+b.dataset.step), 0, 8); update(); }));
  $$('.lang button').forEach(b => b.addEventListener('click', () => { LANG = b.dataset.lang; try { localStorage.setItem('i9g-lang', LANG); } catch (e) {} applyLang(); update({ stat:true, force:true }); }));
  $('#cviews').addEventListener('click', e => { const b = e.target.closest('[data-cam]'); if (b) select('cam', +b.dataset.cam); });

  /* bag, quote, print, link */
  const BAG = window.I9BAG;
  $('#bom').addEventListener('click', e => {
    const a = e.target.closest('[data-padd]');
    if (a && !a.classList.contains('done')) { const p = P[a.dataset.padd]; if (BAG) BAG.add([{ id:a.dataset.padd, q:+a.dataset.qty || 1 }], t('addedLine', p.brand + ' ' + p.name)); a.classList.add('done'); a.textContent = t('added'); return; }
    const id = e.target.closest('button')?.id;
    if (id === 'b-addall') { const L = []; $$('[data-padd]').forEach(x => { if (!x.classList.contains('done')) { L.push({ id:x.dataset.padd, q:+x.dataset.qty || 1 }); x.classList.add('done'); x.textContent = t('added'); } }); if (L.length && BAG) BAG.add(L, t('addedPlan', L.reduce((n, l) => n + l.q, 0))); e.target.closest('button').classList.add('done'); }
    if (id === 'b-print') window.print();
    if (id === 'b-link') { copy(planURL()).then(() => { const b = $('#b-link'); b.textContent = t('linkCopied'); say(t('linkCopied')); }); }
    if (id === 'b-quote') openQuote();
  });
  function copy(s) { try { if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(s); } catch (e) {} const ta = document.createElement('textarea'); ta.value = s; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); return Promise.resolve(); }
  function summary() {
    const lines = BOM.filter(l => !l.info), { quote, owned, total } = tally(BOM);
    let s = t('q_title') + '\n' + '='.repeat(t('q_title').length) + '\n\n';
    s += `${t('q_room')}: ${t('t_' + S.tpl)} · ${lenTxt(S.w)} × ${lenTxt(S.d)}\n${t('q_sig')}: ${S.tr === 'ip' ? 'IP / NDI' : S.tr.toUpperCase()} · ${fmtTxt()} · PTZ ${S.ctl === 'ip' ? 'IP' : 'RS-422'}\n${PROD && PROD.sw && P[PROD.sw] ? t('q_swpn') + ': ' + P[PROD.sw].name + ' · ' + (PROD.panel && PROD.panel.id ? P[PROD.panel.id].name : PROD.panel && PROD.panel.key === 'builtin' ? t('pn_builtin') : t('pn_none')) + '\n' : ''}\n${t('q_cams')}:\n`;
    S.cams.forEach((c, i) => { const v = view(c); s += `  ${camLab(i)}  ${modelName(c)}${c.k === 'lens' ? ' + ' + (D.LENSES[c.lens] ? P[c.lens].name : c.lens === 'kit' ? D.BODIES[c.m].kit.name : t('otherLens')) + (extOf(c) ? ' + ' + (extOf(c).builtin ? extOf(c).name : P[c.ext].name) : '') + (c.crop ? ' · S35' : '') + ' @ ' + c.f.toFixed(0) + ' mm' : ' @ ' + zoomX(c).toFixed(1) + '×'} · ${v.h.toFixed(1)}° · ${v.cls ? t('s_' + v.cls) + ' ' + lenTxt(v.fw) : t('noTarget')} · ${t('m_' + c.mnt)} · ${runCable(c)} ${lenTxt(runOf(c))}\n`; });
    s += `\n${t('q_list')}:\n`;
    GROUPS.forEach(g => { const ls = lines.filter(l => l.g === g); if (!ls.length) return; s += `  [${t('g_' + g)}]\n`;
      ls.forEach(l => { const p = l.id && P[l.id]; s += `   ${String(l.qty).padStart(2)} × ${p ? p.brand + ' ' + p.name : l.name}${l.spec ? ' — ' + l.spec : ''}  ${l.own ? '(' + t('youHave') + ')' : p ? usd(p.usd * l.qty) : '(' + t('toQuote') + ')'}\n`; }); });
    s += `\n${t('q_priced')}: ${usd(total)}\n${t('q_quote')}: ${quote.length}\n${owned.length ? t('q_own') + ': ' + owned.length + '\n' : ''}`;
    const w = CHECKS.filter(c => c.lvl === 'warn'); if (w.length) { s += `\n${t('q_checks')}:\n` + w.map(c => '  ! ' + c.txt).join('\n') + '\n'; }
    s += `\n${t('q_link')}: ${planURL()}\n`;
    return s;
  }
  const dlg = $('#quote-dlg');
  function openQuote() { $('#qd-text').textContent = summary(); $('#qd-copy').textContent = t('qdCopy'); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); $('#qd-copy').focus(); }
  const closeQ = () => { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); $('#b-quote')?.focus(); };
  $('#qd-x').addEventListener('click', closeQ); $('#qd-close').addEventListener('click', closeQ);
  dlg.addEventListener('click', e => { if (e.target === dlg) closeQ(); });
  $('#qd-copy').addEventListener('click', () => copy($('#qd-text').textContent).then(() => { $('#qd-copy').textContent = t('copied'); }));

  const say = s => { const l = $('#live'); if (l) { l.textContent = ''; setTimeout(() => { l.textContent = s; }, 30); } };

  /* ======================= boot ======================= */
  layers();
  const BOOT_HASH = location.hash;   /* the wizard boots later (its script may still be loading when the first save runs) */
  loadHash(); settle();
  sel = S.cams.length ? { kind:'cam', i:0 } : null;
  applyLang();
  update({ stat:true, force:true, now:true });
  if ('ResizeObserver' in window) { let rt = 0; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { renderStatic(); renderPlan(); }, 60); }).observe(box); }
  const clearPools = () => { Object.values(pool).forEach(m => { m.forEach(x => x.remove()); m.clear(); }); L.ctrl.innerHTML = ''; };
  window.addEventListener('hashchange', () => { const h = location.hash; if (/^#p=/.test(h) && h === '#p=' + b64e(JSON.stringify(pack()))) return; if (/^#(p|tpl|adv)=/.test(h)) { clearPools(); hideConfirm(); loadHash(); settle(); sel = S.cams.length ? { kind:'cam', i:0 } : null; update({ stat:true, force:true }); document.dispatchEvent(new CustomEvent('i9plan:load')); } });

  /* ======================= API for the guided wizard (planner-wizard.js) and the 3D view (planner-3d.js) =======================
     compose(spec)  -> a packed plan from a layout spec (fromSpec), without touching the open plan
     evaluate(o)    -> the parts list + totals for a packed plan ({ setup:id } for a setup), without touching the open plan
     loadPlan(o) / loadSetup(id) -> replace the open plan (both views read and write this one plan) */
  function evaluate(o) {
    const keep = { S, SETUP, BOM, CHECKS, Z, PROD };
    try {
      if (o && o.setup) { if (!SETS()[o.setup]) return null; SETUP = fromSetup(o.setup); } else if (!unpack(o)) return null;
      build();
      const tt = tally(BOM);
      return { ...tt, bom:BOM, checks:CHECKS, tr:S.tr, fmt:S.fmt, n:S.cams.length, maxRun:S.cams.length ? Math.max(...S.cams.map(runOf)) : 0,
        cams:S.cams.map(c => ({ k:c.k, m:c.m, own:!!c.own, lens:c.lens, man:c.man, ext:extOf(c) ? c.ext : null, crop:!!c.crop, mob:!!c.mob })), packed:packPlan(), light:lightCalc(), prod:PROD ? { ...PROD, cams:PROD.cams.slice() } : null };
    } finally { S = keep.S; SETUP = keep.SETUP; BOM = keep.BOM; CHECKS = keep.CHECKS; Z = keep.Z; PROD = keep.PROD; }
  }
  function compose(spec) { const keep = S; try { fromSpec(spec, spec.tpl); return packPlan(); } finally { S = keep; } }
  function loadPlan(o) {
    SETUP = null;
    if (location.search) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} }
    const z = zGet ? zGet() : Z;
    clearPools(); hideConfirm(); unpack(o); Z = z; BASE = planKey();
    sel = S.cams.length ? { kind:'cam', i:0 } : null;
    update({ stat:true, force:true, now:true });
  }
  function loadSetup(id) {
    if (!SETS()[id]) return false;
    clearPools(); hideConfirm(); SETUP = fromSetup(id); BASE = planKey();
    sel = S.cams.length ? { kind:'cam', i:0 } : null;
    update({ stat:true, force:true, now:true });
    return true;
  }
  window.I9PLANNER = { get state() { return S; }, view, hfov, runOf, get bom() { return BOM; }, get checks() { return CHECKS; }, select, update,
    get setup() { return fromThisSetup() ? SETUP : null; }, get edited() { return planKey() !== BASE; },
    /* wizard + 3D */
    evaluate, compose, loadPlan, loadSetup, tally: () => tally(BOM), get prod() { return PROD; }, qualOf, vout, TPL, ROLES, t, lenTxt, modelName, camLab, runCable, pname, defaultLens, fNum,
    lightSpots, luxAt, lightCalc, lightLevels, LOOKS, setLt, apAt, zoomX, faceH,
    get lang() { return LANG; }, get z() { return Z; }, set zGet(f) { zGet = f; }, save: () => { clearTimeout(hashT); saveHash(); }, planKey,
    get sel() { return sel; }, get queryTemplate() { return queryTemplate(); }, get bootHash() { return BOOT_HASH; }, get hashKind() { return /^#p=/.test(BOOT_HASH) ? 'p' : /^#adv|^#(tpl|for)=[\w-]+&v=a/.test(BOOT_HASH) ? 'adv' : /^#(tpl|for)/.test(BOOT_HASH) ? 'tpl' : ''; },
    setUnit(u) { S.unit = u === 'ft' ? 'ft' : 'm'; update({ stat:true, force:true }); }, renderPlanNow() { renderStatic(); renderPlan(); } };
})();
