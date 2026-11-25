/* i9 Studios — language layer. English is the default and lives inline in the HTML.
   Portuguese strings live here, keyed by data-i18n. Attributes use data-i18n-attr="attr:key,attr2:key2".
   The choice is remembered per browser in localStorage (i9s.lang). Missing keys are listed in
   window.I9S.missing so the automated check can catch them. */
(function () {
  var I9S = window.I9S = window.I9S || {};
  var saved = null;
  try { saved = localStorage.getItem('i9s.lang'); } catch (e) {}
  var q = /[?&]lang=(en|pt)/.exec(location.search);
  I9S.lang = q ? q[1] : (saved === 'pt' ? 'pt' : 'en');
  I9S.PT = {};
  I9S.missing = [];
  I9S.addPT = function (o) { for (var k in o) I9S.PT[k] = o[k]; };

  I9S.apply = function () {
    var pt = I9S.lang === 'pt';
    I9S.missing = [];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (el.__en === undefined) el.__en = el.innerHTML;
      var k = el.getAttribute('data-i18n');
      if (pt) {
        if (I9S.PT[k] === undefined) { I9S.missing.push(k); el.innerHTML = el.__en; }
        else el.innerHTML = I9S.PT[k];
      } else el.innerHTML = el.__en;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var p = pair.split(':'), a = p[0].trim(), k = p[1].trim();
        el.__enA = el.__enA || {};
        if (el.__enA[a] === undefined) el.__enA[a] = el.getAttribute(a) || '';
        if (pt) {
          if (I9S.PT[k] === undefined) { I9S.missing.push(k); el.setAttribute(a, el.__enA[a]); }
          else el.setAttribute(a, I9S.PT[k]);
        } else el.setAttribute(a, el.__enA[a]);
      });
    });
    document.documentElement.lang = pt ? 'pt-BR' : 'en';
    document.dispatchEvent(new CustomEvent('i9s:lang'));
  };
  /* Brand case: CSS text-transform:uppercase would print "I9". Wrap every "i9" inside an uppercased
     element in <span class="i9"> (text-transform:none). Runs on load and on every DOM change. */
  I9S.brandCase = function (root) {
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null), n, hits = [];
    while ((n = w.nextNode())) {
      if (n.nodeValue.indexOf('i9') < 0) continue;
      var el = n.parentElement; if (!el || el.classList.contains('i9') || /^(SCRIPT|STYLE|TITLE|OPTION)$/.test(el.tagName)) continue;
      if (getComputedStyle(el).textTransform === 'uppercase') hits.push(n);
    }
    hits.forEach(function (t) {
      var parts = t.nodeValue.split('i9'), frag = document.createDocumentFragment();
      parts.forEach(function (p, i) {
        if (p) frag.appendChild(document.createTextNode(p));
        if (i < parts.length - 1) { var sp = document.createElement('span'); sp.className = 'i9'; sp.textContent = 'i9'; frag.appendChild(sp); }
      });
      t.parentNode.replaceChild(frag, t);
    });
  };
  (function () {
    var queued = false;
    function run() { queued = false; I9S.brandCase(document.body); }
    function start() {
      run();
      new MutationObserver(function () { if (!queued) { queued = true; requestAnimationFrame(run); } }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  })();
  I9S.setLang = function (l) {
    I9S.lang = l === 'pt' ? 'pt' : 'en';
    try { localStorage.setItem('i9s.lang', I9S.lang); } catch (e) {}
    I9S.apply();
  };

  /* ---------------- chrome ---------------- */
  I9S.addPT({
    'c.skip': 'Pular para o conteúdo',
    'c.group': 'Grupo i9',
    'c.line': 'Da ideia ao sinal.',
    'c.descriptor': 'i9 / Produção',
    'c.nav.produce': 'Produzir',
    'c.nav.distribute': 'Distribuir',
    'c.nav.market': 'Marketplace de conteúdo',
    'c.nav.events': 'Eventos e shows',
    'c.nav.facilities': 'Estrutura',
    'c.proposal': 'Proposta',
    'c.talk': 'Falar com a i9 Studios',
    'c.ct.h': 'Conte o que você está fazendo.',
    'c.ct.p': 'Um programa para produzir, uma grade para preencher, um evento para colocar no ar. Uma conversa; o time certo responde.',
    'c.ct.phone': 'Telefone',
    'c.ct.hours': 'Seg a sex, 9h às 18h (Brasília)',
    'c.ct.bases': 'Estúdios na Barra Funda · equipes ENG',
    'c.f.line': 'Produzimos. Distribuímos.<br>Colocamos no ar.',
    'c.f.p': 'A i9 Studios é a produtora do grupo i9. A i9TV cuida do sinal; a i9Store, do fluxo de equipamentos.',
    'c.f.buyers': 'Para emissoras',
    'c.f.register': 'Cadastro de comprador',
    'c.f.catalog': 'Catálogo',
    'c.f.proposal': 'Lista de proposta',
    'c.f.group': 'Grupo i9',
    'c.f.legal': 'i9 Studios · São Paulo, Brasil · As fotos são de projetos e estúdios da própria i9.',
    'c.f.proto': 'Protótipo de design · nada neste site é enviado'
  });

  /* ---------------- home ---------------- */
  I9S.addPT({
    'h.title': 'i9 Studios — Produzir. Distribuir. Ao vivo.',
    'h.alt0': 'Vista aérea de uma estrada entre colinas, da série documental Heróis Eternos',
    'h.alt2': 'Pôr do sol sobre o público de um palco ao ar livre em Foz do Iguaçu, Caldeirão com Mion',
    'h.w0': 'Produzir.',
    'h.w1': 'Distribuir.',
    'h.w2': 'Ao vivo.',
    'h.lede': 'A produtora do grupo i9. Fazemos novelas, séries, realities, documentários e conteúdo de marca; licenciamos conteúdo pronto para emissoras do mundo inteiro; e colocamos eventos e shows no ar com a nossa própria unidade móvel 4K.',
    'h.cta1': 'Encontrar conteúdo para a sua grade',
    'h.cta2': 'Produzir com a gente',
    'h.bus': 'Barramento de programa',
    'h.b0': 'Produzir', 'h.b1': 'Distribuir', 'h.b2': 'Ao vivo',
    'h.cap0': 'Heróis Eternos · coprodução i9 Studios e Record Américas · 21 episódios, filmado em 4K',
    'h.cap1': 'Marketplace de conteúdo · catálogo de demonstração, cartazes tipográficos',
    'h.cap2': 'Caldeirão com Mion, Foz do Iguaçu · unidade móvel 4K da i9 Studios',
    'h.jobs.h1': 'Uma produtora.',
    'h.jobs.h2': 'Três trabalhos.',
    'h.jobs.p': 'A maioria das empresas faz um deles. A i9 Studios faz os três, nos seus estúdios, com a sua unidade móvel, equipamentos e equipes, para que um programa seja feito, vendido e transmitido pela mesma casa.',
    'h.j1.k': 'Produtora de conteúdo',
    'h.j1.cr': 'Heróis Eternos · coprodução',
    'h.j1.h': 'Produzir',
    'h.j1.p': 'Do roteiro à entrega, para emissoras, plataformas e marcas.',
    'h.j1.l1': 'Novelas e séries',
    'h.j1.l2': 'Realities e programas de TV',
    'h.j1.l3': 'Documentários',
    'h.j1.l4': 'Publicidade e conteúdo de marca',
    'h.j1.a': 'Ver o que produzimos',
    'h.j2.k': 'Distribuidora de conteúdo',
    'h.j2.cr': 'Catálogo de demonstração',
    'h.j2.h': 'Distribuir',
    'h.j2.p': 'Um marketplace de conteúdo para canais de TV e plataformas do mundo inteiro. Cadastre-se uma vez e veja só o que está liberado para o seu território, veículo e público.',
    'h.j2.l1': 'Novelas, filmes, séries, documentários',
    'h.j2.l2': 'Filtrado pela faixa que você precisa preencher',
    'h.j2.l3': 'Licenças de 1 ano, 6 meses ou inserção única',
    'h.j2.l4': 'TV aberta, cabo, DTH, OTT',
    'h.j2.a': 'Abrir o marketplace',
    'h.j3.k': 'Produção ao vivo',
    'h.j3.cr': 'Leilão do Instituto Neymar Jr. · unidade móvel 4K',
    'h.j3.h': 'Eventos e shows',
    'h.j3.p': 'Shows, leilões, lutas, congressos e cultos, cortados ao vivo e entregues para o ar ou para o streaming.',
    'h.j3.l1': 'Unidade móvel 4K, até 16 câmeras',
    'h.j3.l2': 'Flypacks para qualquer local',
    'h.j3.l3': 'Transmissão ao vivo, nacional e internacional',
    'h.j3.l4': 'Equipes técnicas e ENG',
    'h.j3.a': 'Ver produção ao vivo',
    'h.fmt.h1': 'Nós fazemos os programas.',
    'h.fmt.h2': 'Todo formato, uma equipe.',
    'h.fmt.p': 'Cada imagem abaixo é de um projeto real da i9, com o crédito exato do que a i9 fez: produção, coprodução, unidade móvel, locação ou equipe.',
    'h.f1.b': 'Novelas e séries', 'h.f1.p': 'Meses de gravação com o mesmo visual do primeiro ao último episódio.', 'h.f1.c': 'Os 10 Mandamentos · locação de equipamentos',
    'h.f2.b': 'Reality shows', 'h.f2.p': 'Muitas câmeras, muitas horas, sem segunda chance.', 'h.f2.c': 'No Limite, TV Globo · locação e equipe',
    'h.f3.b': 'Programas de TV', 'h.f3.p': 'Programas de palco, plateia, especiais.', 'h.f3.c': 'Especial SBT · unidade móvel 4K',
    'h.f4.b': 'Documentários', 'h.f4.p': 'Viagem, pesquisa e muitas horas de material, finalizados em 4K.', 'h.f4.c': 'Heróis Eternos · coprodução com a Record Américas',
    'h.f5.b': 'Conteúdo de marca', 'h.f5.p': 'Um programa que o público procura, com uma marca por trás.', 'h.f5.c': 'Netmotors · um original i9',
    'h.f6.b': 'Publicidade', 'h.f6.p': 'Estúdio, cidade cenográfica, equipe e equipamento de TV para um dia de filmagem.', 'h.f6.c': 'Estúdio 01 · base da i9 Studios, São Paulo',
    'h.f7.b': 'Transmissão ao vivo', 'h.f7.p': 'Eventos cortados ao vivo e enviados para o ar, para o streaming, para vários países.', 'h.f7.c': 'ACBJJ 19 · transmissão internacional ao vivo',
    'h.d.k': 'Novo · Marketplace de conteúdo',
    'h.d.h1': 'Conteúdo para a sua grade.',
    'h.d.h2': 'Liberado para o seu território.',
    'h.d.p': 'Para diretores de programação de canais de TV e plataformas de qualquer lugar do mundo. Diga quatro coisas e veja só os títulos que você pode de fato exibir.',
    'h.d.q1': 'O quê', 'h.d.a1': 'Novela, filme, série, documentário, reality, infantil, música, fé, esportes.',
    'h.d.q2': 'Quanto tempo', 'h.d.a2': 'A faixa que você precisa preencher: minutos, dias por semana, semanas ou meses.',
    'h.d.q3': 'Por quanto tempo', 'h.d.a3': 'Uma licença de 1 ano, de 6 meses ou uma inserção única.',
    'h.d.q4': 'Onde', 'h.d.a4': 'TV aberta, cabo, satélite DTH, OTT, AVOD/FAST, IPTV.',
    'h.d.cta1': 'Cadastrar como comprador',
    'h.d.cta2': 'Como funciona',
    'h.d.origk': 'Títulos reais da i9',
    'h.d.orig': 'O catálogo abre com dois títulos reais: um original i9 e uma coprodução da i9 com a Record Américas.',
    'h.i.k': 'Preenchedor de grade',
    'h.i.ex': 'Exemplo · canal de fé, África do Sul',
    'h.i.slot': 'Faixa', 'h.i.days': 'Dias por semana', 'h.i.weeks': 'Semanas', 'h.i.need': 'A preencher',
    'h.i.cap': 'Segunda Colheita · 120 × 45 min · um episódio por faixa · preenche 24 de 26 semanas',
    'h.l.cap': 'Caldeirão com Mion · unidade móvel 4K da i9 Studios',
    'h.l.h': 'Ao vivo, em qualquer palco.',
    'h.l.p': 'A nossa unidade móvel 4K estaciona ao lado do palco; os flypacks viajam como bagagem e montam dentro do local. Câmeras, corte, gravação e sinal, operados pela mesma equipe que grava os nossos programas.',
    'h.l.n1': 'câmeras broadcast ou de cinema na unidade móvel',
    'h.l.n2': 'produção UHD, cortada ao vivo',
    'h.l.n3': 'bases de produção: São Paulo e Manaus',
    'h.l.n4v': 'Flypack',
    'h.l.n4': 'uma sala de controle em cases, para qualquer local',
    'h.l.al': 'Projetos ao vivo',
    'h.c1.p': 'Uma competição de canto com 100 jurados no palco, gravada com 16 câmeras broadcast.',
    'h.c1.r': 'Unidade móvel 4K da i9 Studios',
    'h.c2.b': 'Leilão Galácticos',
    'h.c2.p': 'O leilão beneficente do Ronaldo, edições 2024 e 2025, 16 câmeras.',
    'h.c2.r': 'Unidade móvel 4K da i9 Studios',
    'h.c3.p': 'Jiu-jítsu enviado ao vivo para vários países com 6 câmeras e uma grua.',
    'h.c3.r': 'Transmissão ao vivo da i9 Studios',
    'h.l.a': 'Todos os eventos e shows',
    'h.fa.h1': 'Por trás dos três.',
    'h.fa.h2': 'Estúdios, unidade móvel, equipamentos e equipes.',
    'h.fa.p': 'A mesma estrutura que sustenta as nossas produções está disponível para locação: estúdio, equipamentos, equipes e pós-produção, com ou sem o nosso time.',
    'h.fa.alt1': 'O estúdio de 667 m² vazio, com grid de iluminação',
    'h.fa.alt2': 'Fachadas da cidade cenográfica',
    'h.fa.alt3': 'A unidade móvel 4K da i9 Studios à noite',
    'h.fa.c1': 'Estúdio 01 · 667 m² · pé-direito de 8 m',
    'h.fa.c2': 'Cidade cenográfica · 600 m²',
    'h.fa.c3': 'Unidade móvel 4K · até 16 câmeras',
    'h.fa.n1': 'estúdio principal, Barra Funda, São Paulo',
    'h.fa.n2': 'de pé-direito para cenários, gruas e rigging',
    'h.fa.n3': 'de cidade cenográfica para cenas externas',
    'h.fa.n4': 'de estúdio, 10 × 12 m',
    'h.fa.a': 'Estrutura e locação',
    'h.cr.h': 'Créditos.',
    'h.cr.p': 'O que a i9 Studios fez, projeto a projeto, nas palavras do crédito.',
    'h.cr.r2': 'Coproduzido com a Record Américas',
    'h.cr.d2': 'Heróis Eternos <small>21 episódios, filmados e finalizados em 4K</small>',
    'h.cr.r3': 'Um original i9',
    'h.cr.r4': 'Externas e pós-produção',
    'h.cr.r5': 'Unidade móvel 4K',
    'h.cr.d5b': 'The Cut Brasil <small>HBO Max</small>',
    'h.cr.d5c': 'Leilão Galácticos <small>2024 e 2025</small>',
    'h.cr.d5d': 'Leilão beneficente do Instituto Neymar Jr.',
    'h.cr.r6': 'Transmissão ao vivo',
    'h.cr.r7': 'Equipe de operações',
    'h.cr.d7': 'A Fazenda <small>quatro temporadas, 2012–2014</small>',
    'h.cr.r8': 'Locação de equipamentos',
    'h.cr.r9': 'Locação e equipe',
    'h.cr.d9a': 'No Limite <small>TV Globo</small>',
    'h.cr.d9b': 'Finday <small>Grupo Primo, 2023–2025</small>',
    'h.cr.d9c': 'Documentário da turnê mundial do Oasis',
    'h.cr.note': 'Entre os clientes estão Globo, Record, SBT, HBO Max e Instituto Neymar Jr.'
  });
})();

/* ---------------- marketplace (static text) ---------------- */
I9S.addPT({
  'm.strip': 'Catálogo de demonstração — títulos e direitos são exemplos, exceto os 2 títulos reais da i9: Netmotors e Heróis Eternos. Nada nestas páginas é enviado.',
  'm.cat.title': 'Seu catálogo — marketplace de conteúdo i9 Studios',
  'm.cat.sort': 'Ordenar', 'm.cat.filler': 'Preenchedor de grade', 'm.cat.orig': 'Um original i9', 'm.cat.packs': 'Pacotes', 'm.cat.titles': 'Títulos', 'm.cat.filters': 'Filtros',
  'm.prop.title': 'Lista de proposta — marketplace de conteúdo i9 Studios',
  'm.prop.k': 'Sem preços: as licenças são negociadas caso a caso',
  'm.tbc': 'A confirmar com a i9',
  'm.demoZA': 'Canal de fé · África do Sul', 'm.demoUS': 'Plataforma OTT · Estados Unidos',
  'm.reg.try': 'Com pressa? Experimente um perfil de exemplo:',
  'm.reg.title': 'Cadastro de comprador — marketplace de conteúdo i9 Studios',
  'm.reg.h': 'Encontre conteúdo para a sua grade.',
  'm.reg.p': 'Cerca de dois minutos. As suas respostas definem o que o catálogo mostra: só títulos cujos direitos servem ao seu território, aos seus veículos, aos seus idiomas e ao seu público.',
  'm.reg.s1': 'Canal', 'm.reg.s2': 'Público', 'm.reg.s3': 'Distribuição', 'm.reg.s4': 'Contato',
  'm.reg.note': 'Protótipo de design: nada é enviado. O seu perfil fica salvo só neste navegador, para personalizar o catálogo.',
  'm.reg.l1': 'O seu canal', 'm.reg.d1': 'Quem você é e até onde chega o seu sinal. Os direitos são liberados por território.',
  'm.reg.company': 'Nome da empresa ou do canal', 'm.reg.country': 'País onde a empresa fica',
  'm.reg.terr': 'Territórios para onde você transmite', 'm.reg.terrh': 'Todos os países que o seu sinal ou serviço alcança.', 'm.reg.add': 'Adicionar território',
  'm.reg.l2': 'O seu público', 'm.reg.d2': 'Para mostrarmos primeiro o que combina com o seu público e esconder o que não combina.',
  'm.reg.profile': 'Perfil do canal', 'm.reg.langs': 'Idiomas em que você transmite', 'm.reg.accept': 'Você aceita',
  'm.reg.dub': 'Versões dubladas nos seus idiomas', 'm.reg.subs': 'Áudio original com legendas',
  'm.reg.l3': 'Como você distribui', 'm.reg.d3': 'Os direitos são vendidos por veículo. Marque todas as formas como você entrega.',
  'm.reg.veh': 'Veículos de transmissão', 'm.reg.looking': 'O que você procura', 'm.reg.lookingh': 'Opcional. Mostramos estes primeiro.',
  'm.reg.gap': 'A lacuna na sua grade', 'm.reg.gaph': 'Opcional. Por exemplo: dias úteis às 20h, 60 minutos, a partir de março.',
  'm.reg.l4': 'Com quem falamos', 'm.reg.d4': 'A pessoa que recebe os screeners e a proposta.',
  'm.reg.name': 'Seu nome', 'm.reg.role': 'Cargo', 'm.reg.email': 'E-mail de trabalho',
  'm.reg.note2': 'Protótipo: nada é enviado quando você continua. No marketplace real, este perfil chega ao time de distribuição da i9 Studios, que confirma os direitos antes de qualquer proposta.',
  'm.reg.back': '← Voltar', 'm.reg.next': 'Continuar', 'm.reg.finish': 'Ver o meu catálogo',
  'm.mk.title': 'Marketplace de conteúdo — i9 Studios',
  'm.mk.k': 'i9 Studios · Distribuir',
  'm.mk.h': 'Conteúdo para a sua grade. Liberado para o seu território.',
  'm.mk.p': 'Um marketplace de conteúdo para diretores de programação de canais de TV e plataformas de qualquer lugar do mundo. Cadastre-se uma vez e veja só o que você pode exibir, de acordo com a faixa que precisa preencher. Depois, envie um único pedido de proposta.',
  'm.mk.cta': 'Cadastrar como comprador', 'm.mk.cta2': 'Abrir o catálogo',
  'm.mk.rh1': 'Títulos reais da i9.', 'm.mk.rh2': 'Ao lado do catálogo de demonstração.',
  'm.mk.rp': 'Dois títulos reais abrem o catálogo: Netmotors, um original i9, e Heróis Eternos, uma coprodução da i9 com a Record Américas. O que a i9 ainda não confirmou aparece como "A confirmar com a i9".',
  'm.mk.hh1': 'Quatro passos.', 'm.mk.hh2': 'Sem tabela de preços.',
  'm.mk.hp': 'As licenças são negociadas caso a caso, então o marketplace termina num pedido de proposta, não num carrinho. A i9 responde com uma proposta por título, período e veículo.',
  'm.mk.s1': 'Cadastro', 'm.mk.s1p': 'Canal, território, perfil de público, idiomas, veículos. Cerca de dois minutos.',
  'm.mk.s2': 'Veja só o que está liberado', 'm.mk.s2p': 'Títulos cujos direitos cobrem o seu território e veículo, numa versão de idioma que você aceita, adequados ao seu público.',
  'm.mk.s3': 'Preencha a sua faixa', 'm.mk.s3p': 'Informe a duração da faixa, os dias por semana e por quanto tempo. Cada título mostra quanto dela ele preenche.',
  'm.mk.s4': 'Peça uma proposta', 'm.mk.s4p': 'Um pedido com todos os títulos, o período, os veículos e a sua cobertura. Screeners sob pedido.',
  'm.mk.exk': 'Exemplo completo · dados de demonstração', 'm.mk.exh': 'Um canal de fé na África do Sul.',
  'm.mk.exp': 'Uma emissora religiosa precisa de uma hora no fim da tarde, em dias úteis, pelos próximos seis meses. Veja o que o marketplace faz com as respostas dela.',
  'm.mk.exc': 'Rodar este exemplo',
  'm.mk.e1k': 'Cadastra', 'm.mk.e1': 'TV aberta na África do Sul, satélite DTH para Namíbia, Botsuana e Zimbábue.',
  'm.mk.e1p': 'Perfil: religioso / fé. Transmite em inglês e africâner; aceita dublagem e legendas.',
  'm.mk.e2k': 'Vê', 'm.mk.e2': '17 de 26 títulos, primeiro os seguros para fé e família.',
  'm.mk.e2p': 'Os 2 títulos reais da i9, Netmotors e Heróis Eternos, mais 15 títulos de demonstração. Ocultos: 7 sem direitos para o território ou os veículos, 2 com classificação 18+.',
  'm.mk.e3k': 'Preenche', 'm.mk.e3': '60 min × 5 dias por semana × 26 semanas = 130 faixas.',
  'm.mk.e3p': 'Segunda Colheita, 120 × 45 min, um episódio por faixa: 24 semanas. Pão para a Estrada, 52 × 30 min, dois por faixa: as outras 2 semanas, com sobra.',
  'm.mk.e4k': 'Envia', 'm.mk.e4': 'Um pedido: cobre 5 h por semana nas 26 semanas.',
  'm.mk.e4p': 'Dois títulos, licenças de 6 meses, TV aberta e DTH, screeners pedidos. A i9 confirma os direitos e responde com uma proposta.',
  'm.mk.wh1': 'Todo tipo de canal.', 'm.mk.wh2': 'Cada um vê o seu catálogo.',
  'm.mk.wp': 'O perfil do canal define o que vem primeiro e o que fica oculto. Um canal de fé nunca vê títulos 18+; um canal infantil vê só conteúdo livre.',
  'm.mk.p1': 'Religioso / fé', 'm.mk.p1p': 'Títulos seguros para fé e família primeiro; classificação adulta oculta.',
  'm.mk.p2': 'Entretenimento geral', 'm.mk.p2p': 'Novelas, séries, filmes e realities para todas as faixas.',
  'm.mk.p3': 'Infantil e família', 'm.mk.p3p': 'Só classificação livre; episódios curtos que cabem vários por faixa.',
  'm.mk.p4': 'Documentário e factual', 'm.mk.p4p': 'Documentários primeiro, em cortes de 26 e 52 minutos.',
  'm.mk.p5': 'OTT / SVOD', 'm.mk.p5p': 'Janelas de acervo e de primeira exibição para catálogos de streaming.',
  'm.mk.p6': 'AVOD / FAST', 'm.mk.p6p': 'Volume para canais lineares de streaming.',
  'm.mk.p7': 'Satélite DTH e cabo', 'm.mk.p7p': 'Coberturas em vários territórios, liberadas país a país.',
  'm.mk.p8': 'Música e esportes', 'm.mk.p8p': 'Especiais de shows e séries de eventos, inclusive exibição única.'
});

/* ---------------- produce ---------------- */
I9S.addPT({
  'p.title': 'Produzir — i9 Studios',
  'p.cap': 'Heróis Eternos · coprodução i9 Studios e Record Américas',
  'p.crumb': 'Produzir', 'p.h': 'Nós fazemos os programas.',
  'p.p': 'Do roteiro à entrega, para emissoras, plataformas e marcas: os nossos estúdios, as nossas câmeras, as nossas equipes e a nossa pós, no formato que o projeto pedir.',
  'p.cta': 'Conte sobre o seu projeto',
  'p.fm.h1': 'Sete formatos.', 'p.fm.h2': 'Uma produtora.',
  'p.fm.p': 'Cada foto é de um projeto real da i9. A linha embaixo diz exatamente o que a i9 fez ali.',
  'p.s1.b': 'Novelas e séries', 'p.s1.p': 'Meses de gravação com o mesmo visual do primeiro ao último episódio. Estúdio, câmeras, equipe e pós, no formato que o projeto pedir.', 'p.s1.c': 'Os 10 Mandamentos · locação de equipamentos: kit de cinema Sony F55, vídeo sem fio',
  'p.s2.b': 'Reality shows', 'p.s2.p': 'Muitas horas, muitas câmeras, sem segunda chance. Montamos a operação de câmeras, áudio e equipe para o formato rodar todo dia.', 'p.s2.c': 'The Cut Brasil, HBO Max · 9 Sony F55 e a unidade móvel 4K',
  'p.s3.b': 'Programas de TV', 'p.s3.p': 'Programa de palco, plateia, entrevista ou externas, entregue para o programa ir ao ar no dia marcado.', 'p.s3.c': 'Especial SBT · unidade móvel 4K da i9 Studios',
  'p.s4.b': 'Documentários', 'p.s4.p': 'Viagem, pesquisa e muitas horas de material. Gravamos, organizamos e finalizamos em 4K, para TV, streaming ou cinema.', 'p.s4.c': 'Heróis Eternos · coprodução com a Record Américas, 21 episódios',
  'p.s5.b': 'Conteúdo de marca', 'p.s5.p': 'Uma série, programa ou podcast que o público procura por conta própria, com uma marca por trás, pronto para TV, YouTube e redes.', 'p.s5.c': 'Netmotors · um original i9',
  'p.s6.b': 'Publicidade e institucional', 'p.s6.p': 'O estúdio, a equipe e os equipamentos de uma produção de TV para um dia de filmagem, do roteiro à entrega.', 'p.s6.c': 'Estúdio 01 na base da i9 Studios, São Paulo',
  'p.s7.b': 'Transmissão ao vivo', 'p.s7.p': 'Eventos cortados ao vivo e enviados para o ar ou para o streaming, no Brasil ou para vários países ao mesmo tempo.', 'p.s7.c': 'ACBJJ 19 · transmissão internacional ao vivo da i9 Studios',
  'p.pj.h1': 'O trabalho.', 'p.pj.h2': 'Creditado pelo papel.',
  'p.pj.p': 'Produção, coprodução, original, equipe ou locação: o crédito segue o que a i9 fez de fato.',
  'p.c1.p': 'Uma série documental de 21 episódios gravada na Terra Santa, filmada e finalizada em 4K.', 'p.c1.r': 'Coprodução i9 Studios e Record Américas',
  'p.c2.p': 'O programa de carros produzido inteiramente pela i9. Vai ao ar na RFTV, NGT, PlayTV e no YouTube, no canal Netmotors TV.', 'p.c2.r': 'Um original i9',
  'p.c3.p': 'Externas de ponta a ponta, direção, câmera, luz e áudio, mais pós-produção de áudio e vídeo.', 'p.c3.r': 'Externas e pós-produção da i9 Studios',
  'p.c4.p': 'Quatro temporadas do reality: três regulares e uma edição de verão, de 2012 a 2014.', 'p.c4.r': 'Equipe de operações da i9 Studios',
  'p.c5.p': 'O reality ao ar livre da TV Globo: um operador de áudio, um operador de câmera e equipamentos locados.', 'p.c5.r': 'Locação e equipe da i9 Studios',
  'p.pr.h1': 'Da ideia à entrega.', 'p.pr.h2': 'A mesma equipe do começo ao fim.',
  'p.pr.p': 'A mesma casa desenvolve, grava, finaliza e, quando você quiser, distribui. Conteúdo pronto da i9 pode seguir para o marketplace de conteúdo.',
  'p.pr.1': 'Desenvolvimento', 'p.pr.1p': 'Formato, roteiro, orçamento e cronograma.',
  'p.pr.2': 'Pré-produção', 'p.pr.2p': 'Locações, estúdio e cenários, elenco, equipe, equipamentos.',
  'p.pr.3': 'Gravação', 'p.pr.3p': 'Nos nossos estúdios, em locação ou ao vivo com a unidade móvel.',
  'p.pr.4': 'Pós e entrega', 'p.pr.4p': 'Edição, cor, som, grafismo, entregue na especificação de quem vai exibir.',
  'p.pr.a': 'O marketplace de conteúdo'
});

/* ---------------- events ---------------- */
I9S.addPT({
  'e.title': 'Eventos e shows — i9 Studios',
  'e.cap': 'Leilão do Instituto Neymar Jr. · unidade móvel 4K da i9 Studios',
  'e.crumb': 'Eventos e shows', 'e.h': 'Eventos e shows, cortados ao vivo.',
  'e.p': 'Shows, leilões, lutas, congressos e cultos. A nossa unidade móvel 4K ou um flypack, as nossas câmeras e a nossa equipe, e o sinal vai para o ar, para o streaming ou para os telões do local.',
  'e.cta': 'Reservar uma produção ao vivo',
  'e.ob.h1': 'A unidade móvel 4K.', 'e.ob.h2': 'Uma sala de controle sobre rodas.',
  'e.ob.p': 'Ela estaciona ao lado do palco: câmeras, corte ao vivo, gravação e sinal num só caminhão. Modular, montada por projeto.',
  'e.ob.alt': 'A unidade móvel 4K da i9 Studios estacionada à noite',
  'e.sp1': 'Câmeras', 'e.sp1v': 'Até 16 câmeras broadcast ou de cinema: Sony F55, Sony PXW-X400, Ikegami',
  'e.sp2': 'Switcher', 'e.sp2v': 'Sony XVS-G1, 16 entradas 12G-SDI',
  'e.sp3': 'Produção', 'e.sp3v': '4K UHD, cortado ao vivo',
  'e.sp4': 'Ligação das câmeras', 'e.sp4v': 'Fibra SMPTE e CCUs',
  'e.sp5': 'Gravação', 'e.sp5v': 'Atomos Shogun Studio, 12G 4K',
  'e.sp6': 'Áudio', 'e.sp6v': 'Allen &amp; Heath SQ7 com stage box Dante',
  'e.fp.h1': 'Qualquer local.', 'e.fp.h2': 'Unidade móvel, flypack ou equipe.',
  'e.fp.p': 'Três formas de colocar um evento no ar, escolhidas pelo local, pelo número de câmeras e pelo tempo de montagem.',
  'e.f1.b': 'Unidade móvel 4K', 'e.f1.p': 'Para programas de palco e grandes eventos: até 16 câmeras, corte ao vivo, gravação e sinal, estacionada ao lado do local.', 'e.f1.c': 'Canta Comigo · 16 câmeras broadcast',
  'e.f2.b': 'Flypack', 'e.f2.p': 'Uma sala de produção em cases: switcher, gravação, intercom e monitoração que viajam como bagagem e montam dentro do local. Nós enviamos, montamos e operamos.', 'e.f2.c': 'Finday · locação e equipe da i9 Studios',
  'e.f3.b': 'Transmissão ao vivo', 'e.f3.p': 'Câmeras, direção e sinal para o evento ir ao ar ou para o streaming, no Brasil ou para vários países.', 'e.f3.c': 'ACBJJ 19 · 6 câmeras, uma grua, sinal internacional',
  'e.f4.b': 'Equipes técnicas e ENG', 'e.f4.p': 'Operadores de câmera, som, luz, vídeo e engenharia, de São Paulo e Manaus, com ou sem os nossos equipamentos.', 'e.f4.c': 'Finday · locação e equipe da i9 Studios',
  'e.ev.h1': 'No ar com a i9.', 'e.ev.h2': 'Programas, leilões, esporte.',
  'e.ev.p': 'Cada projeto com o crédito do que a i9 fez nele.',
  'e.c3.b': 'Leilão beneficente do Instituto Neymar Jr.', 'e.c3.p': 'A 5ª edição, nos 10 anos do instituto, na Mercado Livre Arena Pacaembu.',
  'e.c4.p': 'Em Foz do Iguaçu, com 9 câmeras de cinema Sony F55.',
  'e.c6.p': 'Uma produção com 9 câmeras de cinema Sony F55.',
  'e.ev.n': 'Locação e equipe: Finday (Grupo Primo, 2023–2025), Rock in Rio, Lollapalooza, o documentário da turnê mundial do Oasis.'
});

/* ---------------- facilities ---------------- */
I9S.addPT({
  'f.title': 'Estrutura e locação — i9 Studios',
  'f.cap': 'Estúdio 01 · 667 m² · pé-direito de 8 m',
  'f.crumb': 'Estrutura', 'f.h': 'Estúdios, unidade móvel, equipamentos e equipes.',
  'f.p': 'A base de tudo o que produzimos e transmitimos, na Barra Funda, São Paulo. Para locação, com ou sem o nosso time.',
  'f.cta': 'Consultar disponibilidade',
  'f.st.h1': 'Estúdio 01.', 'f.st.h2': '667 m² com pé-direito de 8 m.',
  'f.st.p': 'Altura para cenários altos, gruas e iluminação no alto. Programas de auditório, novelas, publicidade, clipes.',
  'f.alt1': 'Um cenário de talk show no Estúdio 01', 'f.alt2': 'Uma filmagem de dança num cenário colorido', 'f.alt3': 'Um camarim com bancada de maquiagem',
  'f.c1': 'Estúdio 01 · cenário de talk show', 'f.c2': 'Estúdio 01 · cenário de clipe', 'f.c3': 'Salas de apoio',
  'f.n1': 'de piso de estúdio', 'f.n2': 'de pé-direito', 'f.n3': 'de cidade cenográfica para cenas externas', 'f.n4': 'segundo estúdio, 10 × 12 m',
  'f.bl.cap': 'Cidade cenográfica · base da i9 Studios, São Paulo',
  'f.bl.h': 'Uma rua só nossa.',
  'f.bl.p': 'Uma cidade cenográfica de 600 m² para cenas ao ar livre, com energia, apoio e equipe por perto, ao lado dos estúdios.',
  'f.rn.h1': 'Para locação.', 'f.rn.h2': 'Com ou sem o nosso time.',
  'f.rn.p': 'A estrutura que sustenta as nossas produções, disponível para as suas.',
  'f.s1.b': 'Locação de estúdio', 'f.s1.p': 'O Estúdio 01, o estúdio de 120 m², uma sala de podcast e um fundo infinito, na Barra Funda. Com ou sem equipe e equipamentos.', 'f.s1.c': 'Barra Funda, São Paulo',
  'f.s2.b': 'Locação de equipamentos', 'f.s2.p': 'Câmeras, lentes, iluminação, áudio, monitoração, tripés, acessórios, teleprompters, painéis de LED e mochilinks.', 'f.s2.c': 'Catálogo de locação no i9tv.com.br',
  'f.s3.b': 'Equipes técnicas e ENG', 'f.s3.p': 'Operadores de câmera, som, luz, vídeo e engenharia para gravações, programas e transmissões ao vivo, em São Paulo e Manaus.', 'f.s3.c': 'São Paulo · Manaus',
  'f.s4.b': 'Pós-produção', 'f.s4.p': 'Edição, cor, som, grafismo e entrega na especificação de quem vai exibir. Finalizamos o que gravamos e o que você traz.', 'f.s4.c': 'Finday · locação e equipe da i9 Studios',
  'f.s5.b': 'Unidade móvel 4K', 'f.s5.p': 'Até 16 câmeras broadcast ou de cinema, corte ao vivo, gravação e sinal num só caminhão.', 'f.s5.c': 'Veja Eventos e shows',
  'f.a1': 'Catálogo de locação no i9tv.com.br', 'f.a2': 'A unidade móvel e os flypacks'
});
