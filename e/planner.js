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
    bomP:['Lines with a photo are live listings with today’s price, shipping and sales tax included. Lines marked “To quote” are sized from your plan (cable lengths, brackets, parts we don’t list yet); a specialist prices them. Nothing here is a package sales has confirmed.',
          'Linhas com foto são produtos da loja com o preço de hoje, frete e imposto incluídos. Linhas “A cotar” são dimensionadas pelo seu plano (comprimentos de cabo, suportes, itens que ainda não listamos); um especialista coloca o preço. Nada aqui é um pacote confirmado pelo comercial.'],
    assume:['Cable lengths: routed along floor and walls (the dashed lines), plus the rise at each end, plus 20 %, plus 2 m. Angles of view are manufacturer figures; values marked “approx.” need checking before an order.',
            'Comprimento de cabo: rota pelo chão e paredes (as linhas tracejadas), mais a subida em cada ponta, mais 20 %, mais 2 m. Ângulos de visão são dados do fabricante; valores “aprox.” precisam ser conferidos antes do pedido.'],
    qdH:['Request a quote for this plan','Pedir cotação deste plano'], qdNote:['Prototype: nothing is sent. This is the summary a specialist would receive, with a link that reopens this exact plan.','Protótipo: nada é enviado. Este é o resumo que um especialista receberia, com um link que reabre este plano.'],
    qdCopy:['Copy summary','Copiar resumo'], copied:['Copied','Copiado'], close:['Close','Fechar'],
    footLine:['We supply the equipment.<br>i9 Studios and i9TV do the rest.','Nós fornecemos o equipamento.<br>A i9 Studios e a i9TV fazem o resto.'],
    fShop:['Shop','Loja'], fHelp:['Help','Ajuda'], fQuote:['Request a quote','Pedir cotação'], fTerms:['Terms and conditions','Termos e condições'],
    footBot:['Camera angles: manufacturer spec pages (sources in the data file). Prices: live i9store.com/usa listings.','Ângulos: páginas de especificação dos fabricantes (fontes no arquivo de dados). Preços: loja i9store.com/usa.'],
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
    pricedLines:['{0} priced lines','{0} linhas com preço'], quoteLines:['{0} lines to quote','{0} linhas a cotar'], totalPriced:['Priced total, shipping and tax included','Total com preço, frete e imposto incluídos'],
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

  /* ======================= state ======================= */
  let S, uid = 1, sel = null;
  const nid = () => uid++;

  function fromTemplate(key) {
    const T = TPL[key];
    const s = { tpl:key, w:T.w, d:T.d, unit:S ? S.unit : 'm', tr:T.tr, fmt:T.fmt, ctl:'ip', ext:T.ext,
      furn:T.furn.map(f => ({ id:nid(), ...f })), ppl:T.ppl.map(p => ({ id:nid(), ...p })), ctrl:{ ...T.ctrl }, cams:[] };
    T.cams.forEach(c => {
      const cam = newCam(c.k, c.m, s, c);
      s.cams.push(cam);
    });
    S = s;
    T.cams.forEach((c, i) => frameCam(S.cams[i], c.shot, c.aim));
    return s;
  }
  function newCam(k, m, s, o = {}) {
    const c = { id:nid(), k, m, x:o.x ?? s.w / 2, y:o.y ?? s.d * 0.85, a:o.a ?? 0, z:0, f:0, lens:o.lens || null, sf:null,
      mnt:o.mnt || (k === 'ptz' ? 'wall' : 'tripod'), man:o.man ?? (k !== 'ptz'), tgt:-1 };
    if (k === 'lens') { const b = D.BODIES[m]; c.sf = b.fmt; if (!c.lens) c.lens = defaultLens(m); c.f = lensRange(c)[0]; }
    return c;
  }
  function defaultLens(m) { const b = D.BODIES[m]; if (b.kit) return 'kit'; const l = Object.keys(D.LENSES).find(k => D.LENSES[k].mount === b.mount); return l || 'other'; }
  function lensRange(c) {
    const b = D.BODIES[c.m];
    if (c.lens === 'kit' && b.kit) return [b.kit.min, b.kit.max];
    if (D.LENSES[c.lens]) return [D.LENSES[c.lens].min, D.LENSES[c.lens].max];
    return D.OTHER_LENS[b.mount] || [12, 120];
  }
  const sensorW = c => { const b = D.BODIES[c.m]; return c.sf === b.fmt ? b.w : D.FORMATS[c.sf].w; };
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
    return (flat + R.rise[c.mnt] + R.riseCtrl) * (1 + R.slackPct) + R.slackM;
  }
  const lenTxt = m => S.unit === 'ft' ? Math.ceil(m * FT) + ' ft' : (m < 10 ? m.toFixed(1) : Math.round(m)) + ' m';
  const buyLen = m => S.unit === 'ft' ? Math.ceil(m * FT / 5) * 5 + ' ft' : Math.ceil(m) + ' m';
  const camLab = i => t('camLabel', i + 1);
  const modelName = c => P[c.m] ? P[c.m].brand + ' ' + P[c.m].name : c.m;
  const isApprox = c => { if (c.k === 'lens') { const b = D.BODIES[c.m]; return !!b.approx || (c.sf !== b.fmt && D.FORMATS[c.sf].approx); } const z = zspec(c); return !!(z && z.approx); };

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
    ['stat', 'runs', 'cones', 'furn', 'ppl', 'ctrl', 'ann', 'cams'].forEach(n => { L[n] = el('g', { class:'l-' + n }, svg); });
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
  const runCable = c => S.tr === 'ip' ? 'Cat6' : S.tr === 'hdmi' ? (runOf(c) > R.hdmiActive ? 'HDMI→SDI' : 'HDMI') : (S.fmt === 'uhd' ? '12G-SDI' : '3G-SDI');

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
        const lenses = Object.keys(D.LENSES).filter(l => D.LENSES[l].mount === b.mount);
        h += `<div class="row"><label for="i-lens">${t('lens')}</label><select id="i-lens">${b.kit ? opt('kit', b.kit.name, c.lens) : ''}${lenses.map(l => opt(l, P[l].brand + ' ' + P[l].name + ' · ' + usd(P[l].usd), c.lens)).join('')}${opt('other', t('otherLens') + ' · ' + b.mount, c.lens)}</select></div>
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
    put('f', c.k === 'lens' ? c.f.toFixed(1) + ' mm · ' + v.h.toFixed(1) + '°' : '');
    put('d', v.tg ? lenTxt(v.tg.dist) + ' · ' + pname(v.tg.p.n) : '—');
    put('fw', v.fw ? lenTxt(v.fw) : '—');
    put('cls', v.cls ? t('s_' + v.cls) + (v.out ? ' · ⚠' : '') + (v.n > 1 && (v.cls === 'med' || v.cls === 'wide') ? ' · ' + t('twoShot', v.n) : '') : t('noTarget'));
    put('a', Math.round(c.a) + '°');
    put('run', runCable(c) + ' · ' + lenTxt(runOf(c)));
  }

  /* ======================= equipment list (BOM) + checks ======================= */
  const GROUPS = ['cam', 'sw', 'cab', 'net', 'mnt', 'aud', 'lit', 'mon'];
  let BOM = [], CHECKS = [];
  function build() {
    const out = [], chk = [];
    const add = (g, o) => {
      const key = o.id ? g + '|' + o.id : g + '|' + o.name + '|' + (o.spec || '');
      const ex = out.find(l => l.key === key);
      if (ex) { ex.qty += o.qty; if (o.who) o.who.forEach(w => { if (!ex.who.includes(w)) ex.who.push(w); }); return ex; }
      const l = { key, g, ...o, who: o.who ? [...o.who] : [] }; out.push(l); return l;
    };
    const warn = (txt, lvl = 'warn') => chk.push({ lvl, txt });
    const cams = S.cams, nC = cams.length, hd = S.fmt === 'hd';
    const views = cams.map(view);
    const labs = cams.map((c, i) => camLab(i));

    /* --- cameras & lenses --- */
    const encCams = [], apx = [], cpoe = [];
    cams.forEach((c, i) => {
      const lab = labs[i];
      add('cam', { id:c.m, qty:1, why:t('w_cam'), who:[lab] });
      if (c.k === 'lens') {
        const b = D.BODIES[c.m];
        if (D.LENSES[c.lens]) add('cam', { id:c.lens, qty:1, why:t('w_lensFor'), who:[lab] });
        else if (c.lens === 'other') { const [lo, hi] = lensRange(c); add('cam', { name:t('g_lens', b.mount), spec:t('g_lensSpec', lo, hi), qty:1, why:t('w_lensFor'), who:[lab], code:'LENS' }); }
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
    const pan = ptz.filter(([c]) => P[c.m].brand === 'Panasonic'), can = ptz.filter(([c]) => P[c.m].brand === 'Canon');
    if (pan.length >= 2) add('cam', { id:'rp60', qty:1, why:t('w_rp60', pan.length), who:pan.map(([, i]) => labs[i]) });
    if (can.length >= 2) add('cam', { name:t('g_canonCtl'), spec:'RC-IP100 / RC-IP300', qty:1, why:t('w_canonCtl'), who:can.map(([, i]) => labs[i]), code:'CTRL' });

    /* --- switching & streaming --- */
    const nIn = nC + S.ext;
    let sw = null;
    if (S.tr === 'ip') add('sw', { name:t('g_ndisw'), spec:t('g_ndiswSpec', nIn), qty:1, why:t('w_ndisw'), code:'NDI' });
    else {
      const list = S.tr === 'hdmi' ? (hd ? D.SWITCHERS.hdmi : null) : (hd ? D.SWITCHERS.sdi : D.SWITCHERS.sdiUHD);
      if (!list) { add('sw', { name:t('g_uhdhdmi'), spec:t('g_bigsw', nIn), qty:1, why:t('w_uhdhdmi'), code:'SW' }); warn(t('c_uhdHdmi')); }
      else {
        sw = list.find(s => s.inp >= nIn);
        if (sw) add('sw', { id:sw.id, qty:1, why:t(sw.stream ? 'w_switch' : 'w_switchNS', nC, S.ext, nIn), approx:!!sw.approx });
        else { add('sw', { name:t('g_bigsw', nIn), spec:'', qty:1, why:t('w_bigsw'), code:'SW' }); warn(t('c_inputs', nIn, list[list.length - 1].inp)); }
        if (sw && !sw.stream) add('sw', { id:D.SWITCHERS.encoder, qty:1, why:t('w_enc') });
      }
    }
    encCams.forEach(i => add('sw', { name:t('g_ndienc'), spec:(cams[i].k === 'lens' && !D.BODIES[cams[i].m].sdi ? 'HDMI' : 'SDI/HDMI') + ' → NDI|HX, PoE', qty:1, why:t('w_ndienc'), who:[labs[i]], code:'NDI' }));

    /* --- cabling (per run) --- */
    const sdiRuns = [], catRuns = [];
    let maxSdi = 0;
    cams.forEach((c, i) => {
      const lab = labs[i], run = runOf(c), z = zspec(c);
      const camSdi = c.k === 'lens' ? D.BODIES[c.m].sdi : z.sdi, camHdmi = c.k === 'lens' ? D.BODIES[c.m].hdmi : z.hdmi;
      if (S.tr === 'hdmi') {
        if (!camHdmi) add('sw', { id:'microconv', qty:1, why:t('w_conv', 'HDMI'), who:[lab] });
        if (run <= R.hdmiPassive) { add('cab', { id:'hdmi76', qty:1, why:t('w_sdi'), who:[lab + ' ' + lenTxt(run)] }); warn(t('c_hdmiOk', lab, lenTxt(run)), 'ok'); }
        else if (run <= 10) { add('cab', { id:'hdmiaoc10', qty:1, why:t('w_sdi'), who:[lab + ' ' + lenTxt(run)] }); warn(t('c_hdmiAoc', lab, lenTxt(run))); }
        else if (run <= R.hdmiActive) { add('cab', { id:'hdmiaoc15', qty:1, why:t('w_sdi'), who:[lab + ' ' + lenTxt(run)] }); warn(t('c_hdmiAoc', lab, lenTxt(run))); }
        else { add('sw', { id:'microconv', qty:2, why:t('w_convLong'), who:[lab] }); sdiRuns.push([lab, run]); warn(t('c_hdmiLong', lab, lenTxt(run))); }
      } else if (S.tr === 'sdi') {
        if (!camSdi) add('sw', { id:'microconv', qty:1, why:t('w_conv', 'SDI'), who:[lab] });
        if (!hd && camSdi === '3G') warn(t('c_3g', lab + ' (' + modelName(c) + ')'));
        const lim = hd ? R.sdi3G : R.sdi12G;
        if (run > lim) { add('sw', { id:'fiberconv', qty:2, why:t('w_fiber'), who:[lab] }); add('cab', { name:t('g_fiber'), spec:buyLen(run), qty:1, why:t('w_fiber'), who:[lab], code:'FIBER', len:buyLen(run) }); warn(t('c_sdiLong', lab, lenTxt(run), hd ? '3G-SDI' : '12G-SDI', lim)); }
        else { sdiRuns.push([lab, run]); maxSdi = Math.max(maxSdi, run); }
      }
      if (S.tr === 'ip') catRuns.push([lab, run, 'ip']);
      else if (c.k === 'ptz') catRuns.push([lab, run, S.ctl === 'ip' ? 'ctl' : '422']);
    });
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
        if (z.poeAC) { acCams.push(lab); warn(t('c_ue150', lab)); }
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
        add('net', { id:netsw.id, qty:1, why:t('w_net', ports, netsw.ports, poeW, netsw.budget) });
        warn(t('c_poe', poeW, netsw.budget, P[netsw.id].name), 'ok');
        if (S.tr === 'ip' && !netsw.managed) warn(t('c_unmanaged'), 'info');
      } else {
        add('net', { name:t('g_poesw'), spec:t('g_poeswSpec', ports, Math.ceil(poeW * 1.25 / 10) * 10), qty:1, why:t('w_poesw'), code:'NET' });
        warn(t('c_poeNo', poeW, poePP));
      }
    }
    if (acCams.length) add('net', { name:t('g_power'), spec:'', qty:acCams.length, why:t('w_power'), who:acCams, code:'AC' });
    add('net', { name:t('g_ups'), spec:'', qty:1, why:t('w_ups'), code:'UPS' });

    /* --- mounts --- */
    cams.forEach((c, i) => {
      const lab = labs[i], heavy = c.k === 'lens' && D.BODIES[c.m].studio;
      if (c.mnt === 'tripod') add('mnt', { id: heavy ? 'focus12' : 'ad01', qty:1, why:t(heavy ? 'w_tripodHeavy' : 'w_tripod'), who:[lab] });
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
    const lit = { podcast:[['a200d', 2], ['pt2c', 1]], church:[['ls600d', 2]], studio:[['nova', 2], ['p60c', 1]], event:[['ls1200d', 2]], empty:[['p60c', 1]] }[T.lit];
    lit.forEach(([id, q]) => add('lit', { id, qty:q, why:t('w_lit_' + T.lit) }));
    if (T.lit === 'church') add('lit', { name:t('g_dmx'), spec:'', qty:1, why:t('w_dmx'), code:'DMX' });

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
    if (nC) warn(t('c_stream'), 'info');
    BOM = out.filter(l => !l.info || true); CHECKS = chk;
  }

  const CODEGLYPH = { SDI:'SDI', CAT6:'CAT6', XLR:'XLR', AUD:'AUD', HDMI:'HDMI', FIBER:'FIBER', BNC:'BNC', NET:'NET', AC:'AC', UPS:'UPS', BRKT:'BRKT', ARM:'ARM', LENS:'LENS', NDI:'NDI', SW:'SW', CTRL:'CTRL', DMX:'DMX', MON:'MON', ICOM:'ICOM' };
  function renderBOM() {
    const lines = BOM.filter(l => !l.info);
    const priced = lines.filter(l => l.id && P[l.id]), quote = lines.filter(l => !(l.id && P[l.id]));
    const total = priced.reduce((a, l) => a + P[l.id].usd * l.qty, 0);
    $('#bom-m').textContent = `${t('t_' + S.tpl)} · ${lenTxt(S.w)} × ${lenTxt(S.d)} · ${S.cams.length} ${t('q_cams').toLowerCase()} · ${S.tr === 'ip' ? 'IP / NDI' : S.tr.toUpperCase()} · ${S.fmt === 'hd' ? '1080p' : '2160p'}`;
    $('#btot').innerHTML = `<div class="tp"><span class="meta">${t('totalPriced')}</span><span class="price" id="ptotal">${usd(total)}</span>
      <span class="meta-s cnt"><span>${t('pricedLines', priced.length)}</span><span><i class="qd"></i>${t('quoteLines', quote.length)}</span></span></div>
      <div class="acts"><button type="button" class="btn sig" id="b-quote">${t('reqQuote')}</button><button type="button" class="btn solid" id="b-addall">${t('addAll')}</button>
      <button type="button" class="btn" id="b-print">${t('print')}</button><button type="button" class="btn" id="b-link">${t('copyLink')}</button></div>`;
    $('#bomlist').innerHTML = GROUPS.map((g, gi) => {
      const ls = BOM.filter(l => l.g === g); if (!ls.length) return '';
      const sub = ls.filter(l => l.id && P[l.id]).reduce((a, l) => a + P[l.id].usd * l.qty, 0);
      return `<section class="bgrp" aria-labelledby="bg-${g}"><h3 class="gh" id="bg-${g}"><span class="n meta">${String(gi + 1).padStart(2, '0')}</span><b>${t('g_' + g)}</b><span class="meta-s">${(n => n === 1 ? t('line1') : t('lines', n))(ls.filter(l => !l.info).length)}${sub ? ' · ' + usd(sub) : ''}</span></h3>
        ${ls.map(l => row(l)).join('')}</section>`;
    }).join('');
  }
  function row(l) {
    if (l.info) return `<div class="brow info"><span class="gl"><b>i</b></span><div class="bi"><b>${esc(l.name)}</b></div></div>`;
    const p = l.id && P[l.id];
    const who = l.who && l.who.length ? `<span class="who">${l.who.map(esc).join(' · ')}</span>` : '';
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
  }
  function pack() {
    return { v:1, t:S.tpl, w:r2(S.w), d:r2(S.d), u:S.unit, tr:S.tr, fm:S.fmt, ct:S.ctl, e:S.ext, c:[r2(S.ctrl.x), r2(S.ctrl.y)],
      f:S.furn.map(f => [f.k, r2(f.x), r2(f.y), r2(f.w), r2(f.h)]), p:S.ppl.map(p => [p.n, r2(p.x), r2(p.y), Math.round(p.a)]),
      k:S.cams.map(c => [c.k, c.m, r2(c.x), r2(c.y), Math.round(c.a * 10) / 10, Math.round(c.z * 1000) / 1000, r2(c.f), c.lens, c.sf, c.mnt, c.man ? 1 : 0, c.tgt]) };
  }
  function unpack(o) {
    if (!o || o.v !== 1 || !TPL[o.t]) return false;
    S = { tpl:o.t, w:clamp(+o.w, 2, 80), d:clamp(+o.d, 2, 80), unit:o.u === 'ft' ? 'ft' : 'm', tr:['sdi', 'hdmi', 'ip'].includes(o.tr) ? o.tr : 'sdi', fmt:o.fm === 'uhd' ? 'uhd' : 'hd', ctl:o.ct === '422' ? '422' : 'ip', ext:clamp(+o.e || 0, 0, 8),
      ctrl:{ x:+o.c[0], y:+o.c[1] }, furn:(o.f || []).filter(f => FURN[f[0]]).map(f => ({ id:nid(), k:f[0], x:+f[1], y:+f[2], w:+f[3], h:+f[4] })),
      ppl:(o.p || []).map(p => ({ id:nid(), n:String(p[0]).slice(0, 28), x:+p[1], y:+p[2], a:+p[3] || 0 })), cams:[] };
    (o.k || []).forEach(a => {
      const [kk, m] = a; const ok = kk === 'ptz' ? D.PTZ[m] : kk === 'cc' ? D.CAMCORDER[m] : kk === 'lens' ? D.BODIES[m] : null; if (!ok || !P[m]) return;
      const c = newCam(kk, m, S, { x:+a[2], y:+a[3], a:+a[4], mnt:a[9], man:!!a[10], lens:a[7] });
      c.z = clamp(+a[5] || 0, 0, 1); if (kk === 'lens') { c.sf = D.FORMATS[a[8]] ? a[8] : c.sf; const [lo, hi] = lensRange(c); c.f = clamp(+a[6] || lo, lo, hi); }
      c.tgt = Number.isInteger(a[11]) ? a[11] : -1; if (!R.rise[c.mnt]) c.mnt = 'tripod';
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
    const m = h.match(/^#p=([\w-]+)/);
    if (m) { try { if (unpack(JSON.parse(b64d(m[1])))) return true; } catch (e) {} }
    const tm = h.match(/^#(?:tpl|for)=?-?(\w+)/);
    const map = { church:'church', podcast:'podcast', studio:'studio', event:'event', events:'event', corporate:'event', broadcast:'studio', education:'event', empty:'empty' };
    fromTemplate(tm && map[tm[1]] ? map[tm[1]] : 'podcast');
    return true;
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
    else if (id === 'i-lens') { const h = hfov(c); c.lens = v; setHfov(c, h); update({ force:true }); }
    else if (id === 'i-sf') { c.sf = v; update({ force:true }); }
    else if (id === 'i-mnt') { c.mnt = v; update(); }
    else if (id === 'i-tgt') { c.tgt = +v; update(); }
    else if (id === 'i-man') { c.man = e.target.checked; update(); }
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
  $('#tbus').addEventListener('change', e => { const v = e.target.value; if (!TPL[v]) return; fromTemplate(v); sel = { kind:'cam', i:0 }; Object.values(pool).forEach(m => { m.forEach(x => x.remove()); m.clear(); }); L.ctrl.innerHTML = ''; say(t('live_tpl', t('t_' + v), S.cams.length)); update({ stat:true, force:true, now:true }); });
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
  $('#fmt').addEventListener('change', e => { S.fmt = e.target.value; update(); });
  $('#ctl').addEventListener('change', e => { S.ctl = e.target.value; update(); });
  $('#ext').addEventListener('change', e => { S.ext = clamp(Math.round(+e.target.value || 0), 0, 8); update(); });
  $$('.step [data-step]').forEach(b => b.addEventListener('click', () => { S.ext = clamp(S.ext + (+b.dataset.step), 0, 8); update(); }));
  $$('.lang button').forEach(b => b.addEventListener('click', () => { LANG = b.dataset.lang; try { localStorage.setItem('i9g-lang', LANG); } catch (e) {} applyLang(); update({ stat:true, force:true }); }));
  $('#cviews').addEventListener('click', e => { const b = e.target.closest('[data-cam]'); if (b) select('cam', +b.dataset.cam); });

  /* bag, quote, print, link */
  let bag = 0;
  function bump(n) { bag += n; const el2 = $('#bag-ct'); if (el2) { el2.textContent = bag; el2.classList.add('on'); } }
  $('#bom').addEventListener('click', e => {
    const a = e.target.closest('[data-padd]');
    if (a && !a.classList.contains('done')) { bump(+a.dataset.qty || 1); a.classList.add('done'); a.textContent = t('added'); say(t('added')); return; }
    const id = e.target.closest('button')?.id;
    if (id === 'b-addall') { let n = 0; $$('[data-padd]').forEach(x => { if (!x.classList.contains('done')) { n += +x.dataset.qty || 1; x.classList.add('done'); x.textContent = t('added'); } }); if (n) bump(n); e.target.closest('button').classList.add('done'); say(t('added')); }
    if (id === 'b-print') window.print();
    if (id === 'b-link') { copy(planURL()).then(() => { const b = $('#b-link'); b.textContent = t('linkCopied'); say(t('linkCopied')); }); }
    if (id === 'b-quote') openQuote();
  });
  function copy(s) { try { if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(s); } catch (e) {} const ta = document.createElement('textarea'); ta.value = s; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); return Promise.resolve(); }
  function summary() {
    const lines = BOM.filter(l => !l.info), priced = lines.filter(l => l.id && P[l.id]), quote = lines.filter(l => !(l.id && P[l.id]));
    const total = priced.reduce((a, l) => a + P[l.id].usd * l.qty, 0);
    let s = t('q_title') + '\n' + '='.repeat(t('q_title').length) + '\n\n';
    s += `${t('q_room')}: ${t('t_' + S.tpl)} · ${lenTxt(S.w)} × ${lenTxt(S.d)}\n${t('q_sig')}: ${S.tr === 'ip' ? 'IP / NDI' : S.tr.toUpperCase()} · ${S.fmt === 'hd' ? '1080p' : '2160p'} · PTZ ${S.ctl === 'ip' ? 'IP' : 'RS-422'}\n\n${t('q_cams')}:\n`;
    S.cams.forEach((c, i) => { const v = view(c); s += `  ${camLab(i)}  ${modelName(c)}${c.k === 'lens' ? ' + ' + (D.LENSES[c.lens] ? P[c.lens].name : c.lens === 'kit' ? D.BODIES[c.m].kit.name : t('otherLens')) + ' @ ' + c.f.toFixed(0) + ' mm' : ' @ ' + zoomX(c).toFixed(1) + '×'} · ${v.h.toFixed(1)}° · ${v.cls ? t('s_' + v.cls) + ' ' + lenTxt(v.fw) : t('noTarget')} · ${t('m_' + c.mnt)} · ${runCable(c)} ${lenTxt(runOf(c))}\n`; });
    s += `\n${t('q_list')}:\n`;
    GROUPS.forEach(g => { const ls = lines.filter(l => l.g === g); if (!ls.length) return; s += `  [${t('g_' + g)}]\n`;
      ls.forEach(l => { const p = l.id && P[l.id]; s += `   ${String(l.qty).padStart(2)} × ${p ? p.brand + ' ' + p.name : l.name}${l.spec ? ' — ' + l.spec : ''}  ${p ? usd(p.usd * l.qty) : '(' + t('toQuote') + ')'}\n`; }); });
    s += `\n${t('q_priced')}: ${usd(total)}\n${t('q_quote')}: ${quote.length}\n`;
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
  loadHash();
  sel = S.cams.length ? { kind:'cam', i:0 } : null;
  applyLang();
  update({ stat:true, force:true, now:true });
  if ('ResizeObserver' in window) { let rt = 0; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { renderStatic(); renderPlan(); }, 60); }).observe(box); }
  window.addEventListener('hashchange', () => { const h = location.hash; if (/^#p=/.test(h) && h === '#p=' + b64e(JSON.stringify(pack()))) return; if (/^#(p|tpl)=/.test(h)) { Object.values(pool).forEach(m => { m.forEach(x => x.remove()); m.clear(); }); L.ctrl.innerHTML = ''; loadHash(); sel = S.cams.length ? { kind:'cam', i:0 } : null; update({ stat:true, force:true }); } });
  window.I9PLANNER = { get state() { return S; }, view, hfov, runOf, get bom() { return BOM; }, get checks() { return CHECKS; }, select, update };
})();
