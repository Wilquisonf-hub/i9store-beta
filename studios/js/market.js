/* ==========================================================================
   i9 Studios content marketplace — prototype engine.

   DESIGN PROTOTYPE: NOTHING IS SENT ANYWHERE. The buyer profile, the schedule filler and the
   proposal list live only in this browser (localStorage keys i9s.*). There is no backend call,
   no form post, no analytics. In production the "send" step becomes a POST to i9's own server,
   which creates the lead / opportunity in Central (see STUDIOS.md).

   Matching: a title is shown when one of its rights rows covers at least one of the buyer's
   territories AND one of the buyer's vehicles, the buyer can air one of its language versions
   (original audio, a dub they accept, or subtitles they accept), and its rating suits the
   channel profile (18+ hidden from faith and kids channels).
   ========================================================================== */
(function () {
  var R = window.I9S_REF, C = window.I9S_CATALOG || [], PK = window.I9S_PACKAGES || [];
  var ICON = window.I9S_ICON || {};
  var KEY = { profile: 'i9s.profile', filler: 'i9s.filler', proposal: 'i9s.proposal', filters: 'i9s.filters', sent: 'i9s.sent' };

  function get(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function L() { return (window.I9S && I9S.lang) || 'en'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function byId(id) { return C.filter(function (t) { return t.id === id; })[0]; }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function inter(a, b) { return a.filter(function (x) { return b.indexOf(x) >= 0; }); }

  /* ---------------- strings for dynamic UI ---------------- */
  var S = {
    en: {
      hours: '{n} h', min: 'min', eps: '{e} × {r} min', film: '{r} min',
      catTitle: 'Your catalogue', edit: 'Edit profile',
      cleared: '{n} titles cleared for you', clearedOne: '1 title cleared for you',
      hidden: '{n} hidden for your profile', hidRights: '{n} not cleared for your territory or vehicles', hidLang: '{n} without a language version you accept', hidRating: '{n} rated 18+, hidden for {p} channels',
      shown: 'Showing {n} of {m}', none: 'No title matches these filters. Clear a filter or change the slot.', clear: 'Clear filters',
      add: 'Add to proposal', added: 'In proposal', remove: 'Remove',
      screener: 'Request a screener', screenerOn: 'Screener requested',
      fitAll: 'Fills all {w} weeks', fitSpare: 'Fills all {w} weeks · {x} spare', fitPart: 'Fills {f} of {w} weeks', fitSlots: 'Fills {f} of {n} slots', fitLong: 'Runs {r} min: needs a longer slot', fitOne: 'Fits your {s}-min slot', fitOneSeries: '{n} episodes for {k} slots',
      perSlot: '{k} per slot', notIn: 'Not cleared for {c}',
      langAudio: 'In {a}', langDub: '{a} dub', langSubs: '{o} with {a} subtitles',
      or: ' or ',
      need: 'to fill', slots: 'slots', single: 'Single insertion: one slot of {s} min',
      pkTitle: 'Packages that fill your slot', pkOf: '{a} of {b} titles cleared for you', pkFill: 'Together: {f}',
      gateH: 'Register to see the titles cleared for you.', gateP: 'The catalogue shows only what you can air: your territory, your vehicles, your languages and your audience. It takes about two minutes.', gateCta: 'Register as a buyer', gateTry: 'Or try a sample profile:',
      demoZA: 'Faith channel · South Africa', demoUS: 'OTT platform · United States',
      why: 'Why you’re seeing this',
      // title page
      back: 'Back to your catalogue', specEp: 'Episodes × runtime', specTot: 'Total running time', specAudio: 'Original audio', specDub: 'Dubbed versions', specSubs: 'Subtitles', specFmt: 'Format', specRating: 'Rating', specGenre: 'Genre',
      noneYet: 'none yet', rightsH: 'Rights availability', rightsP: 'Each row is one offer. The row that fits your profile is marked.',
      thTerr: 'Territories', thVeh: 'Vehicles', thWin: 'Windows', thLic: 'Licence periods', thEx: 'Exclusivity', yours: 'Fits your profile', except: 'except {c}',
      schedH: 'In your schedule', schedNo: 'Register and set your slot to see how much of your schedule this fills.',
      schedTxt: 'At {s} min × {d} days a week, {k} per slot: {e} episodes make {f} slots, {w} weeks of programming.', schedNeed: 'Your run needs {n} slots ({h}).',
      schedCovered: 'Covered, with {x} spare.', schedShort: 'Covers {p}%; add titles to fill the other {r} weeks.', schedFilm: 'A {r}-minute film needs a slot of at least {r} minutes.',
      moreH: 'Also cleared for your channel', notAvail: 'Not available for your profile', notAvailP: 'This title is not cleared for your territory, vehicles, languages or audience. It stays visible here only because you opened its link.',
      screenerNote: 'Screener request added. It goes with your proposal request.',
      // proposal
      propH: 'Your proposal list', propEmpty: 'Your list is empty. Add titles from your catalogue.', propBrowse: 'Browse your catalogue',
      lic: 'Licence', start: 'Preferred start', vehicles: 'Vehicles', excl: 'Exclusivity', notes: 'Notes for i9 (optional)',
      anyEx: 'Either', notesPh: 'Slot, start date, delivery format, anything that helps us shape the proposal.',
      covH: 'Schedule coverage', covTxt: 'Covers {s}-min × {d} days a week ({h}/week) for {f} of {w} weeks', covAll: 'Covers {h}/week for all {w} weeks', covSingle: 'Single insertion: {n} title(s), one run each',
      covSum: '{n} titles · {e} episodes · {t} of programming',
      send: 'Send request for proposal', sendNeedProfile: 'Register first, so we know where and how you broadcast.', sendNote: 'Prototype: pressing send does not transmit anything. It shows what the buyer sees next.',
      doneH: 'Request ready for i9 Studios.', doneP: 'In the live marketplace this request goes straight to the i9 Studios distribution team. In this prototype nothing was sent; your request stays in this browser.',
      ref: 'Local draft reference', nextH: 'What happens next',
      n1h: 'Rights check', n1: 'i9 distribution confirms each title is cleared for your territories, vehicles and period.',
      n2h: 'Screeners', n2: 'Requested screeners arrive through a private link.',
      n3h: 'Proposal', n3: 'You receive one proposal per deal: licence fee, period, number of runs, exclusivity and delivery specs.',
      n4h: 'Contract and delivery', n4: 'After signature, i9 delivers masters, subtitles and dubs in the agreed format.',
      talkNow: 'Prefer to talk now? WhatsApp i9 Studios', newReq: 'Start a new list',
      toast: '{t} added to your proposal', toastRm: '{t} removed from your proposal',
      // register
      stepOf: 'Step {a} of {b}', req: 'Required', pickOne: 'Choose at least one', emailBad: 'Enter a valid email',
      neighbours: 'Add nearby:', addTerr: 'Add a territory', rm: 'Remove {c}',
      orig: 'An i9 Original', tbc: 'To confirm with i9', perDeal: 'i9 owns the IP: rights set per deal', langTbc: 'languages to confirm with i9',
      epsTbc: 'episodes to confirm', fitTbc: 'Episodes and runtime to confirm with i9', licDeal: 'Set per deal',
      featK: 'An i9 Original · real title', featP: 'The one real title in this catalogue: the car show produced entirely by i9, in two packagings, short-form pílulas or 30-minute episodes. i9 owns the IP, so territories, windows and exclusivity are set per deal.',
      outlets: 'Airs today on', origCount: '1 i9 Original + {n} demonstration titles',
      rightsDeal: 'i9 owns the Netmotors IP. Territories, vehicles, windows, licence periods and exclusivity are agreed per deal.',
      covExcl: '{t} is not counted: episodes and runtime to confirm with i9.',
      aiDub: '{a} AI dub', langsAI: 'Portuguese · AI-dubbed into English and Spanish', dubAIv: 'English, Spanish (AI-dubbed)',
      cutsShort: '8–12 min pílulas, 12 a month · or 4 × 30 min a month', metaCuts: '3 seasons · 8–12 min pílulas or 30-min episodes',
      fitCut30: '30-min version, 4 a month: covers {p}% of your slot', fitCutPill: 'Pílulas, 12 a month: covers {p}% of your slot', fitCutNo: 'Needs a slot of at least 12 min',
      fitOneCut30: 'One 30-min episode fits your {s}-min slot', fitOnePill: 'A pílula fits your {s}-min slot',
      trailer: 'Trailer coming soon', trailerP: 'The trailer is being edited. Request a screener in the meantime.',
      versH: 'One show, two packagings', versShort: 'Short-form', versShortV: '8–12 min × 12 a month', versShortP: 'Pílulas for OTT, social and fillers.',
      versLin: 'Linear TV', versLinV: '4 × 30 min a month', versLinP: 'Each episode is 3 pílulas. A weekly 30-min slot.',
      seasons: 'Seasons', seasonsV: '3, in the new format', shortForm: 'Short-form', shortFormV: 'Pílulas of 8–12 min, 12 a month', linear: '30-min version', linearV: '4 × 30 min a month, each made of 3 pílulas',
      epSeason: 'Episodes per season', k4: '4K availability', trailerK: 'Trailer', credit: 'Credit', format2: 'Format',
      schedCut: 'At {s} min × {d} days a week your slot takes {n} {c} a month (a month counted as 4 weeks). Netmotors supplies {k} a month, about {p}% of it.',
      cut30n: '30-min episodes', cutPilln: 'pílulas',
      covRate: '{t} is not counted in the total: it is supplied at {r} a month and the season length is still to confirm with i9.',
      gallery: 'From the production', flCov: 'Your proposal list fills {f} of {w} weeks', flCov0: 'Add titles: this strip fills as your proposal list grows'
    },
    pt: {
      hours: '{n} h', min: 'min', eps: '{e} × {r} min', film: '{r} min',
      catTitle: 'Seu catálogo', edit: 'Editar perfil',
      cleared: '{n} títulos liberados para você', clearedOne: '1 título liberado para você',
      hidden: '{n} ocultos para o seu perfil', hidRights: '{n} sem direitos para o seu território ou veículos', hidLang: '{n} sem versão num idioma que você aceita', hidRating: '{n} classificados 18+, ocultos para canais de {p}',
      shown: 'Mostrando {n} de {m}', none: 'Nenhum título com esses filtros. Limpe um filtro ou mude a faixa.', clear: 'Limpar filtros',
      add: 'Adicionar à proposta', added: 'Na proposta', remove: 'Remover',
      screener: 'Pedir screener', screenerOn: 'Screener pedido',
      fitAll: 'Preenche as {w} semanas', fitSpare: 'Preenche as {w} semanas · sobra {x}', fitPart: 'Preenche {f} de {w} semanas', fitSlots: 'Preenche {f} de {n} faixas', fitLong: 'Tem {r} min: precisa de uma faixa maior', fitOne: 'Cabe na sua faixa de {s} min', fitOneSeries: '{n} episódios para {k} faixas',
      perSlot: '{k} por faixa', notIn: 'Sem direitos para {c}',
      langAudio: 'Em {a}', langDub: 'Dublado em {a}', langSubs: '{o} com legendas em {a}',
      or: ' ou ',
      need: 'a preencher', slots: 'faixas', single: 'Inserção única: uma faixa de {s} min',
      pkTitle: 'Pacotes que preenchem a sua faixa', pkOf: '{a} de {b} títulos liberados para você', pkFill: 'Juntos: {f}',
      gateH: 'Cadastre-se para ver os títulos liberados para você.', gateP: 'O catálogo mostra só o que você pode exibir: seu território, seus veículos, seus idiomas e seu público. Leva cerca de dois minutos.', gateCta: 'Cadastrar como comprador', gateTry: 'Ou experimente um perfil de exemplo:',
      demoZA: 'Canal de fé · África do Sul', demoUS: 'Plataforma OTT · Estados Unidos',
      why: 'Por que você está vendo isto',
      back: 'Voltar ao seu catálogo', specEp: 'Episódios × duração', specTot: 'Duração total', specAudio: 'Áudio original', specDub: 'Versões dubladas', specSubs: 'Legendas', specFmt: 'Formato', specRating: 'Classificação', specGenre: 'Gênero',
      noneYet: 'ainda não', rightsH: 'Direitos disponíveis', rightsP: 'Cada linha é uma oferta. A linha que serve ao seu perfil está marcada.',
      thTerr: 'Territórios', thVeh: 'Veículos', thWin: 'Janelas', thLic: 'Períodos de licença', thEx: 'Exclusividade', yours: 'Serve ao seu perfil', except: 'exceto {c}',
      schedH: 'Na sua grade', schedNo: 'Cadastre-se e defina a sua faixa para ver quanto da sua grade este título preenche.',
      schedTxt: 'Com {s} min × {d} dias por semana, {k} por faixa: {e} episódios dão {f} faixas, {w} semanas de programação.', schedNeed: 'O seu período precisa de {n} faixas ({h}).',
      schedCovered: 'Coberto, com sobra de {x}.', schedShort: 'Cobre {p}%; adicione títulos para preencher as outras {r} semanas.', schedFilm: 'Um filme de {r} minutos precisa de uma faixa de pelo menos {r} minutos.',
      moreH: 'Também liberados para o seu canal', notAvail: 'Indisponível para o seu perfil', notAvailP: 'Este título não está liberado para o seu território, veículos, idiomas ou público. Ele aparece aqui só porque você abriu o link.',
      screenerNote: 'Pedido de screener adicionado. Ele vai junto com o seu pedido de proposta.',
      propH: 'Sua lista de proposta', propEmpty: 'Sua lista está vazia. Adicione títulos do seu catálogo.', propBrowse: 'Ver o seu catálogo',
      lic: 'Licença', start: 'Início desejado', vehicles: 'Veículos', excl: 'Exclusividade', notes: 'Observações para a i9 (opcional)',
      anyEx: 'Tanto faz', notesPh: 'Faixa, data de início, formato de entrega, o que ajudar a montar a proposta.',
      covH: 'Cobertura da grade', covTxt: 'Cobre {s} min × {d} dias por semana ({h}/semana) em {f} de {w} semanas', covAll: 'Cobre {h}/semana nas {w} semanas', covSingle: 'Inserção única: {n} título(s), uma exibição cada',
      covSum: '{n} títulos · {e} episódios · {t} de programação',
      send: 'Enviar pedido de proposta', sendNeedProfile: 'Cadastre-se antes, para sabermos onde e como você transmite.', sendNote: 'Protótipo: o botão enviar não transmite nada. Ele mostra o que o comprador vê em seguida.',
      doneH: 'Pedido pronto para a i9 Studios.', doneP: 'No marketplace real, este pedido vai direto para o time de distribuição da i9 Studios. Neste protótipo nada foi enviado; o pedido fica neste navegador.',
      ref: 'Referência local do rascunho', nextH: 'O que acontece agora',
      n1h: 'Checagem de direitos', n1: 'A distribuição da i9 confirma que cada título está liberado para os seus territórios, veículos e período.',
      n2h: 'Screeners', n2: 'Os screeners pedidos chegam por um link privado.',
      n3h: 'Proposta', n3: 'Você recebe uma proposta por negócio: valor da licença, período, número de exibições, exclusividade e especificações de entrega.',
      n4h: 'Contrato e entrega', n4: 'Depois da assinatura, a i9 entrega masters, legendas e dublagens no formato combinado.',
      talkNow: 'Prefere falar agora? WhatsApp da i9 Studios', newReq: 'Começar uma nova lista',
      toast: '{t} adicionado à sua proposta', toastRm: '{t} removido da sua proposta',
      stepOf: 'Etapa {a} de {b}', req: 'Obrigatório', pickOne: 'Escolha pelo menos um', emailBad: 'Digite um e-mail válido',
      neighbours: 'Adicionar vizinhos:', addTerr: 'Adicionar território', rm: 'Remover {c}',
      orig: 'Um original i9', tbc: 'A confirmar com a i9', perDeal: 'a i9 é dona do IP: direitos definidos por negócio', langTbc: 'idiomas a confirmar com a i9',
      epsTbc: 'episódios a confirmar', fitTbc: 'Episódios e duração a confirmar com a i9', licDeal: 'Definida por negócio',
      featK: 'Um original i9 · título real', featP: 'O único título real deste catálogo: o programa de carros produzido inteiramente pela i9, em dois formatos, pílulas curtas ou episódios de 30 minutos. A i9 é dona do IP, então territórios, janelas e exclusividade são definidos por negócio.',
      outlets: 'Vai ao ar hoje em', origCount: '1 original i9 + {n} títulos de demonstração',
      rightsDeal: 'A i9 é dona do IP do Netmotors. Territórios, veículos, janelas, períodos de licença e exclusividade são combinados por negócio.',
      covExcl: '{t} não entra na conta: episódios e duração a confirmar com a i9.',
      aiDub: 'dublagem por IA em {a}', langsAI: 'Português · dublado por IA em inglês e espanhol', dubAIv: 'Inglês, espanhol (dublagem por IA)',
      cutsShort: 'pílulas de 8–12 min, 12 por mês · ou 4 × 30 min por mês', metaCuts: '3 temporadas · pílulas de 8–12 min ou episódios de 30 min',
      fitCut30: 'Versão de 30 min, 4 por mês: cobre {p}% da sua faixa', fitCutPill: 'Pílulas, 12 por mês: cobre {p}% da sua faixa', fitCutNo: 'Precisa de uma faixa de pelo menos 12 min',
      fitOneCut30: 'Um episódio de 30 min cabe na sua faixa de {s} min', fitOnePill: 'Uma pílula cabe na sua faixa de {s} min',
      trailer: 'Trailer em breve', trailerP: 'O trailer está em edição. Enquanto isso, peça um screener.',
      versH: 'Um programa, dois formatos', versShort: 'Formato curto', versShortV: '8–12 min × 12 por mês', versShortP: 'Pílulas para OTT, redes e interprogramas.',
      versLin: 'TV linear', versLinV: '4 × 30 min por mês', versLinP: 'Cada episódio reúne 3 pílulas. Uma faixa semanal de 30 min.',
      seasons: 'Temporadas', seasonsV: '3, no formato novo', shortForm: 'Formato curto', shortFormV: 'Pílulas de 8–12 min, 12 por mês', linear: 'Versão de 30 min', linearV: '4 × 30 min por mês, cada um com 3 pílulas',
      epSeason: 'Episódios por temporada', k4: 'Disponibilidade em 4K', trailerK: 'Trailer', credit: 'Crédito', format2: 'Formato',
      schedCut: 'Com {s} min × {d} dias por semana, a sua faixa consome {n} {c} por mês (mês contado como 4 semanas). O Netmotors entrega {k} por mês, cerca de {p}% disso.',
      cut30n: 'episódios de 30 min', cutPilln: 'pílulas',
      covRate: '{t} não entra no total: é entregue a {r} por mês e a duração da temporada ainda está a confirmar com a i9.',
      gallery: 'Da produção', flCov: 'Sua lista de proposta preenche {f} de {w} semanas', flCov0: 'Adicione títulos: esta faixa enche conforme a sua lista cresce'
    }
  };
  function t(k, v) {
    var s = (S[L()] && S[L()][k]) || S.en[k] || k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  function nm(obj) { return obj ? (obj[L()] || obj.en) : ''; }
  function country(code) { var c = R.countries.filter(function (x) { return x[0] === code; })[0]; return c ? (L() === 'pt' ? c[2] : c[1]) : code; }
  function terrName(code) { return R.regions[code] ? nm(R.regions[code]) : country(code); }
  function langName(code) { return nm(R.languages[code]) || code; }
  function langLower(code) { var n = langName(code); return L() === 'pt' ? n.toLowerCase() : n; }
  function fmtH(min) { var h = min / 60; return t('hours', { n: h >= 10 ? Math.round(h) : (Math.round(h * 10) / 10) }); }
  function list(a) { return a.join(', '); }

  /* ---------------- matching ---------------- */
  function regionsOf(code) { var c = R.countries.filter(function (x) { return x[0] === code; })[0]; return [code, 'WORLD'].concat(c ? c[3] : []); }
  function covers(row, code) { if (row.excl.indexOf(code) >= 0) return false; var rs = regionsOf(code); return row.terr.some(function (x) { return rs.indexOf(x) >= 0; }); }
  function suits(title, p) {
    if (p.profile === 'faith') return title.rating !== '18';
    if (p.profile === 'kids') return title.rating === 'L' && (title.tags.indexOf('kids') >= 0 || title.tags.indexOf('family') >= 0);
    return true;
  }
  function langMode(title, p) {
    var langs = p.langs || [];
    var a = inter(title.audio, langs); if (a.length) return { mode: 'audio', code: a[0] };
    if (p.dub) { var d = inter(title.dub, langs); if (d.length) return { mode: 'dub', code: d[0] }; }
    if (p.subs) { var s = inter(title.subs, langs); if (s.length) return { mode: 'subs', code: s[0], orig: title.audio[0] }; }
    return null;
  }
  function evaluate(title, p) {
    var res = { ok: false, reason: null, rows: [], covered: [], notCovered: [], veh: [], ex: [], lic: [], win: [], lang: null };
    if (!p) { res.reason = 'noprofile'; return res; }
    if (!suits(title, p)) { res.reason = 'rating'; return res; }
    if (title.perDeal) { res.ok = true; res.perDeal = true; res.covered = p.terr.slice(); res.veh = p.veh.slice(); res.lang = langMode(title, p); res.ai = !!title.dubAI; return res; }
    var terrHit = false;
    title.rights.forEach(function (row) {
      var cov = p.terr.filter(function (c) { return covers(row, c); });
      if (!cov.length) return;
      terrHit = true;
      var v = inter(row.veh, p.veh);
      if (!v.length) return;
      res.rows.push(row);
      res.covered = uniq(res.covered.concat(cov));
      res.veh = uniq(res.veh.concat(v));
      res.ex = uniq(res.ex.concat(row.ex));
      res.lic = uniq(res.lic.concat(row.lic));
      res.win = uniq(res.win.concat(row.win));
    });
    if (!res.rows.length) { res.reason = terrHit ? 'vehicle' : 'territory'; return res; }
    res.lang = langMode(title, p);
    if (!res.lang) { res.reason = 'language'; return res; }
    res.notCovered = p.terr.filter(function (c) { return res.covered.indexOf(c) < 0; });
    res.ok = true;
    return res;
  }
  function rank(title, p) {
    var s = 0, tg = title.tags;
    if (p.profile === 'faith') s += tg.indexOf('faith-safe') >= 0 ? 30 : tg.indexOf('family') >= 0 ? 20 : (title.rating === 'L' || title.rating === '10') ? 10 : 0;
    if (p.profile === 'kids') s += tg.indexOf('kids') >= 0 ? 30 : 10;
    var typeFor = { factual: 'documentary', sports: 'sports', music: 'music', news: 'documentary' }[p.profile];
    if (typeFor && title.type === typeFor) s += 30;
    if ((p.looking || []).indexOf(title.type) >= 0) s += 8;
    return s;
  }
  function whyText(ev) {
    if (ev.perDeal) return [list(ev.covered.map(country)), ev.veh.map(function (v) { return R.vehicles[v].s; }).join(', '), t('perDeal'), ev.lang ? langPhrase(ev) : t('langsAI')].join(' · ');
    var vs = ev.veh.map(function (v) { return R.vehicles[v].s; });
    var ex = ev.ex.map(function (e) { return nm(R.exclusivity[e]); }).join(t('or'));
    return [list(ev.covered.map(country)), vs.join(', '), ex, langPhrase(ev)].join(' · ');
  }
  function langPhrase(ev) {
    var lg;
    if (ev.lang.mode === 'dub' && ev.ai) return t('aiDub', { a: L() === 'pt' ? langLower(ev.lang.code) : langName(ev.lang.code) });
    if (ev.lang.mode === 'audio') lg = t('langAudio', { a: L() === 'pt' ? langLower(ev.lang.code) : langName(ev.lang.code) });
    else if (ev.lang.mode === 'dub') lg = t('langDub', { a: L() === 'pt' ? langLower(ev.lang.code) : langName(ev.lang.code) });
    else lg = t('langSubs', { o: langName(ev.lang.orig), a: L() === 'pt' ? langLower(ev.lang.code) : langName(ev.lang.code) });
    return lg;
  }

  /* ---------------- schedule filler ---------------- */
  var FDEF = { slot: 60, days: 5, len: 26, unit: 'weeks', lic: 'any' };
  function filler() { var f = get(KEY.filler, null) || {}; for (var k in FDEF) if (f[k] === undefined) f[k] = FDEF[k]; return f; }
  function weeksOf(f) { return f.unit === 'months' ? Math.round(f.len * 52 / 12) : f.len; }
  function single(f) { return f.lic === 'single'; }
  function slotsNeeded(f) { return single(f) ? 1 : f.days * weeksOf(f); }
  function perSlot(title, f) { if (!title.runtime) return 0; return title.runtime <= f.slot ? Math.max(1, Math.floor(f.slot / title.runtime)) : 0; }
  function slotsOf(title, f) { var k = perSlot(title, f); return k ? Math.ceil(title.episodes / k) : 0; }
  function fitCuts(title, f) {
    var c30 = title.cuts.filter(function (c) { return c.id === 'thirty'; })[0], cp = title.cuts.filter(function (c) { return c.id === 'pill'; })[0];
    var cut = f.slot >= 30 ? c30 : (f.slot >= cp.max ? cp : null);
    if (!cut) return { pct: 0, k: 0, slots: 0, text: t('fitCutNo'), long: true, rate: true };
    var per = Math.floor(f.slot / cut.max);
    if (single(f)) return { pct: 1, k: per, slots: 0, text: t(cut.id === 'thirty' ? 'fitOneCut30' : 'fitOnePill', { s: f.slot }), rate: true, cut: cut };
    var needMonth = f.days * 4 * per;               // owner's convention: a weekly slot = 4 a month
    var pct = Math.min(1, cut.perMonth / needMonth);
    return { pct: pct, k: per, slots: 0, cut: cut, needMonth: needMonth, rate: true, text: t(cut.id === 'thirty' ? 'fitCut30' : 'fitCutPill', { p: Math.round(pct * 100) }) };
  }
  function fit(title, f) {
    if (title.cuts) return fitCuts(title, f);
    var k = perSlot(title, f), w = weeksOf(f), need = slotsNeeded(f);
    if (!title.episodes || !title.runtime) return { pct: 0, k: 0, slots: 0, text: t('fitTbc'), tbc: true };
    if (!k) return { pct: 0, k: 0, slots: 0, text: t('fitLong', { r: title.runtime }), long: true };
    var slots = Math.ceil(title.episodes / k), pct = Math.min(1, slots / need), txt;
    if (single(f)) txt = title.episodes === 1 ? t('fitOne', { s: f.slot }) : t('fitOneSeries', { n: title.episodes, k: slots });
    else if (title.episodes === 1 || slots < f.days) txt = t('fitSlots', { f: slots, n: need });
    else if (slots >= need) {
      var x = Math.floor((slots - need) / f.days);
      txt = x > 0 ? t('fitSpare', { w: w, x: wk(x) }) : t('fitAll', { w: w });
    } else txt = t('fitPart', { f: Math.floor(slots / f.days), w: w });
    return { pct: pct, k: k, slots: slots, text: txt };
  }
  function wk(n) { return L() === 'pt' ? (n === 1 ? '1 semana' : n + ' semanas') : (n === 1 ? '1 week' : n + ' weeks'); }

  /* ---------------- proposal store ---------------- */
  function prop() { return get(KEY.proposal, []) || []; }
  function inProp(id) { return prop().some(function (x) { return x.id === id; }); }
  function addProp(id, screener) {
    var p = prop(), it = p.filter(function (x) { return x.id === id; })[0];
    if (!it) { it = { id: id, screener: !!screener, lic: null }; p.push(it); }
    else if (screener) it.screener = true;
    set(KEY.proposal, p); if (window.I9S_updateProposalCount) I9S_updateProposalCount();
  }
  function rmProp(id) { set(KEY.proposal, prop().filter(function (x) { return x.id !== id; })); if (window.I9S_updateProposalCount) I9S_updateProposalCount(); }
  function toast(msg) {
    var el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }

  /* ---------------- sample profiles (demo shortcuts, clearly labelled) ---------------- */
  var SAMPLES = {
    za: { company: 'Example Faith Channel (demo)', country: 'ZA', terr: ['ZA', 'NA', 'BW', 'ZW'], profile: 'faith', langs: ['en', 'af'], dub: true, subs: true, veh: ['fta', 'dth'], looking: ['novela', 'documentary', 'faith', 'music', 'kids'], gap: 'Weekday evening block, 60 min', name: 'Demo buyer', role: 'Programming director', email: 'buyer@example.com', wa: '+27 00 000 0000', sample: true },
    us: { company: 'Example Streaming Platform (demo)', country: 'US', terr: ['US'], profile: 'general', langs: ['en', 'es'], dub: true, subs: true, veh: ['svod', 'avod'], looking: ['series', 'film', 'documentary', 'reality'], gap: 'New catalogue for a Spanish-language AVOD channel', name: 'Demo buyer', role: 'Head of content', email: 'buyer@example.com', wa: '+1 000 000 0000', sample: true }
  };
  function useSample(k, go) { set(KEY.profile, SAMPLES[k]); set(KEY.filters, null); if (go) location.href = 'catalog.html'; }

  /* ---------------- shared bits ---------------- */
  function profileChips(p) {
    var bits = [];
    bits.push('<span class="chip"><b>' + esc(nm(R.profiles[p.profile])) + '</b></span>');
    bits.push('<span class="chip">' + esc(list(p.terr.map(country))) + '</span>');
    bits.push('<span class="chip">' + esc(p.veh.map(function (v) { return nm(R.vehicles[v]); }).join(' · ')) + '</span>');
    bits.push('<span class="chip">' + esc(p.langs.map(langName).join(' · ')) + (p.subs ? ' · ' + (L() === 'pt' ? 'legendas OK' : 'subtitles OK') : '') + (p.dub ? ' · ' + (L() === 'pt' ? 'dublagem OK' : 'dubbing OK') : '') + '</span>');
    return bits.join('');
  }
  function addBtn(id, cls) {
    var on = inProp(id);
    return '<button type="button" class="addp' + (cls ? ' ' + cls : '') + (on ? ' on' : '') + '" data-add="' + id + '" aria-pressed="' + on + '"><i aria-hidden="true"></i><span>' + (on ? t('added') : t('add')) + '</span></button>';
  }
  function bindAdd(root, after) {
    $$('[data-add]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-add'), tt = byId(id);
        if (inProp(id)) { rmProp(id); toast(t('toastRm', { t: nm(tt.title) })); }
        else { addProp(id); toast(t('toast', { t: nm(tt.title) })); }
        if (after) { after(id); var nb = document.querySelector('#cat-grid [data-add="' + id + '"], #feat [data-add="' + id + '"]'); if (nb) nb.focus({ preventScroll: true }); } else { var on = inProp(id); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.querySelector('span').textContent = on ? t('added') : t('add'); }
      });
    });
  }
  function metaLine(tt) {
    if (tt.cuts) return nm(R.types[tt.type]) + ' · ' + t('metaCuts');
    if (!tt.episodes) return nm(R.types[tt.type]) + ' · ' + t('epsTbc');
    return nm(R.types[tt.type]) + ' · ' + (tt.episodes > 1 ? t('eps', { e: tt.episodes, r: tt.runtime }) : t('film', { r: tt.runtime })) + ' · ' + fmtH(tt.episodes * tt.runtime);
  }
  function tag(tt) { return tt.original ? ' <span class="origtag">' + t('orig') + '</span>' : (tt.demo ? ' <span class="dtag">DEMO</span>' : ''); }
  function bar(pct) { return '<span class="fbar" aria-hidden="true"><i style="width:' + Math.round(pct * 100) + '%"></i></span>'; }
  function weekStrip(filled, total, cls) {
    var n = Math.min(total, 52), scale = total / n, out = '';
    for (var i = 0; i < n; i++) out += '<i class="' + ((i + 1) * scale <= filled + 1e-9 ? 'f' : (i * scale < filled ? 'h' : '')) + '"></i>';
    return '<span class="wstrip ' + (cls || '') + '" style="--n:' + n + '" aria-hidden="true">' + out + '</span>';
  }

  /* ======================= CATALOGUE ======================= */
  var FILT0 = { types: [], veh: [], win: 'any', ex: 'any', fmt: 'any', lang: 'any', fits: false, sort: 'fit' };
  function filters() { var f = get(KEY.filters, null) || {}; for (var k in FILT0) if (f[k] === undefined) f[k] = JSON.parse(JSON.stringify(FILT0[k])); return f; }

  function catalogPage() {
    var root = $('#cat'); if (!root) return;
    var p = get(KEY.profile, null);
    $('#cat-gate').hidden = !!p; $('#cat-main').hidden = !p;
    if (!p) { renderGate(); return; }
    renderCatalog(p);
  }
  function renderGate() {
    $('#cat-gate').innerHTML =
      '<div class="wrap gate"><div>' +
      '<h1 class="h2">' + t('gateH') + '</h1><p class="lede">' + t('gateP') + '</p>' +
      '<p style="margin-top:28px"><a class="btn sig" href="register.html">' + t('gateCta') + '</a></p>' +
      '<p class="meta dim" style="margin:36px 0 12px">' + t('gateTry') + '</p>' +
      '<div class="samples"><button type="button" class="btn sm" data-sample="za">' + t('demoZA') + '</button><button type="button" class="btn sm" data-sample="us">' + t('demoUS') + '</button></div>' +
      '</div><div class="gate-wall" aria-hidden="true">' + C.slice(0, 12).map(function (x) { return I9S_poster(x); }).join('') + '</div></div>';
    $$('[data-sample]').forEach(function (b) { b.addEventListener('click', function () { useSample(b.getAttribute('data-sample'), true); }); });
  }

  var catBusy = false;
  function renderCatalog(p) {
    if (catBusy) return;
    catBusy = true;
    try { renderCatalog2(p); } finally { catBusy = false; }
  }
  function renderCatalog2(p) {
    var f = filler(), F = filters();
    var evs = C.map(function (title) { return { t: title, ev: evaluate(title, p) }; });
    var availAll = evs.filter(function (x) { return x.ev.ok; });
    var feats = availAll.filter(function (x) { return x.t.original; });
    var avail = availAll.filter(function (x) { return !x.t.original; });
    var hid = { rights: 0, language: 0, rating: 0 };
    evs.forEach(function (x) { if (!x.ev.ok) { var r = x.ev.reason; if (r === 'territory' || r === 'vehicle') hid.rights++; else if (r === 'language') hid.language++; else if (r === 'rating') hid.rating++; } });
    var nHid = C.length - availAll.length;

    // header
    $('#cat-name').textContent = p.company;
    $('#cat-h').textContent = t('catTitle');
    $('#cat-chips').innerHTML = profileChips(p);
    $('#cat-count').innerHTML = '<span class="big num">' + availAll.length + '</span><span>' + (availAll.length === 1 ? t('clearedOne') : t('cleared', { n: availAll.length }).replace(/^\d+\s/, '')) + (feats.length ? '<br><em class="meta-s dim">' + t('origCount', { n: avail.length }) + '</em>' : '') + '</span>';
    var hparts = [];
    if (hid.rights) hparts.push(t('hidRights', { n: hid.rights }));
    if (hid.language) hparts.push(t('hidLang', { n: hid.language }));
    if (hid.rating) hparts.push(t('hidRating', { n: hid.rating, p: nm(R.profiles[p.profile]).toLowerCase() }));
    $('#cat-hidden').innerHTML = nHid ? '<b>' + t('hidden', { n: nHid }) + '</b>' + (hparts.length ? ': ' + hparts.join(' · ') : '') : '';
    $('#cat-edit').textContent = t('edit');

    renderFiller(f, p);
    renderFeatured(feats, p);
    renderPackages(avail, f, p);

    // filter options limited to what the buyer can use
    var vehOpts = p.veh;
    var typeOpts = Object.keys(R.types).filter(function (k) { return C.some(function (x) { return x.type === k && !x.original; }); });
    var langOpts = uniq(avail.reduce(function (a, x) { return a.concat(x.t.audio || [], x.t.dub || [], x.t.subs || []); }, [])).filter(function (l) { return p.langs.indexOf(l) >= 0; });
    var side = $('#cat-filters');
    function seg(name, opts, cur) {
      return '<div class="seg" role="radiogroup">' + opts.map(function (o) {
        return '<button type="button" role="radio" aria-checked="' + (cur === o[0]) + '" data-f="' + name + '" data-v="' + o[0] + '">' + esc(o[1]) + '</button>';
      }).join('') + '</div>';
    }
    var anyL = L() === 'pt' ? 'Todos' : 'Any';
    side.innerHTML =
      '<div class="fhead-m"><b>' + (L() === 'pt' ? 'Filtros' : 'Filters') + '</b><button type="button" id="f-close">' + (L() === 'pt' ? 'Ver títulos' : 'Show titles') + '</button></div>' +
      '<div class="fgroup"><h3 class="meta">' + (L() === 'pt' ? 'Tipo de conteúdo' : 'Content type') + '</h3><div class="chips">' +
        typeOpts.map(function (k) {
          var n = avail.filter(function (x) { return x.t.type === k; }).length;
          return '<label class="ck' + (n ? '' : ' off') + '"><input type="checkbox" data-f="types" value="' + k + '"' + (F.types.indexOf(k) >= 0 ? ' checked' : '') + (n ? '' : ' disabled') + '><span>' + esc(nm(R.types[k])) + ' <em class="num">' + n + '</em></span></label>';
        }).join('') + '</div></div>' +
      '<div class="fgroup"><h3 class="meta">' + (L() === 'pt' ? 'Período / licença' : 'Period / licence') + '</h3>' +
        seg('lic', [['any', anyL], ['12m', L() === 'pt' ? '1 ano' : '1 year'], ['6m', L() === 'pt' ? '6 meses' : '6 months'], ['single', L() === 'pt' ? 'Inserção única' : 'Single run']], f.lic) + '</div>' +
      '<div class="fgroup"><h3 class="meta">' + (L() === 'pt' ? 'Veículo' : 'Vehicle') + '</h3><div class="chips">' +
        vehOpts.map(function (v) { return '<label class="ck"><input type="checkbox" data-f="veh" value="' + v + '"' + (F.veh.indexOf(v) >= 0 ? ' checked' : '') + '><span>' + esc(nm(R.vehicles[v])) + '</span></label>'; }).join('') + '</div></div>' +
      '<div class="fgroup"><h3 class="meta">' + (L() === 'pt' ? 'Janela' : 'Window') + '</h3>' +
        '<select data-f="win" aria-label="' + (L() === 'pt' ? 'Janela' : 'Window') + '"><option value="any">' + anyL + '</option>' + Object.keys(R.windows).map(function (w) { return '<option value="' + w + '"' + (F.win === w ? ' selected' : '') + '>' + esc(nm(R.windows[w])) + '</option>'; }).join('') + '</select></div>' +
      '<div class="fgroup"><h3 class="meta">' + (L() === 'pt' ? 'Exclusividade' : 'Exclusivity') + '</h3>' +
        seg('ex', [['any', anyL], ['nonexcl', nm(R.exclusivity.nonexcl)], ['excl', nm(R.exclusivity.excl)]], F.ex) + '</div>' +
      '<div class="fgroup"><h3 class="meta">' + (L() === 'pt' ? 'Formato' : 'Format') + '</h3>' +
        seg('fmt', [['any', anyL], ['HD', 'HD'], ['4K', '4K']], F.fmt) + '</div>' +
      '<div class="fgroup"><h3 class="meta">' + (L() === 'pt' ? 'Áudio / legendas' : 'Audio / subtitles') + '</h3>' +
        '<select data-f="lang" aria-label="' + (L() === 'pt' ? 'Idioma' : 'Language') + '"><option value="any">' + anyL + '</option>' + langOpts.map(function (l) { return '<option value="' + l + '"' + (F.lang === l ? ' selected' : '') + '>' + esc(langName(l)) + '</option>'; }).join('') + '</select></div>' +
      '<div class="fgroup"><label class="tog"><input type="checkbox" data-f="fits"' + (F.fits ? ' checked' : '') + '><span>' + (L() === 'pt' ? 'Só o que cabe na minha faixa' : 'Only what fits my slot') + '</span></label></div>' +
      '<button type="button" class="textlink" id="f-clear">' + t('clear') + '</button>';

    // apply filters
    var list2 = avail.filter(function (x) {
      var tt = x.t, ev = x.ev;
      if (F.types.length && F.types.indexOf(tt.type) < 0) return false;
      if (f.lic !== 'any' && ev.lic.indexOf(f.lic) < 0) return false;
      if (F.veh.length && !inter(ev.veh, F.veh).length) return false;
      if (F.win !== 'any' && ev.win.indexOf(F.win) < 0) return false;
      if (F.ex !== 'any' && ev.ex.indexOf(F.ex) < 0) return false;
      if (F.fmt !== 'any' && (tt.format || []).indexOf(F.fmt) < 0) return false;
      if (F.lang !== 'any' && (tt.audio || []).concat(tt.dub || [], tt.subs || []).indexOf(F.lang) < 0) return false;
      if (F.fits && !perSlot(tt, f)) return false;
      return true;
    });
    list2.forEach(function (x) { x.fit = fit(x.t, f); x.score = rank(x.t, p); });
    var sorts = {
      fit: function (a, b) { return (b.score - a.score) || (b.fit.pct - a.fit.pct) || nm(a.t.title).localeCompare(nm(b.t.title)); },
      hours: function (a, b) { return ((b.t.episodes || 0) * (b.t.runtime || 0)) - ((a.t.episodes || 0) * (a.t.runtime || 0)); },
      az: function (a, b) { return nm(a.t.title).localeCompare(nm(b.t.title)); }
    };
    list2.sort(sorts[F.sort] || sorts.fit);

    $('#cat-shown').textContent = t('shown', { n: list2.length, m: avail.length });
    var sortSel = $('#cat-sort');
    sortSel.innerHTML = [['fit', L() === 'pt' ? 'Melhor para o seu canal' : 'Best for your channel'], ['hours', L() === 'pt' ? 'Mais horas' : 'Most hours'], ['az', 'A–Z']].map(function (o) { return '<option value="' + o[0] + '"' + (F.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('');
    $('#f-open').querySelector('span').textContent = (L() === 'pt' ? 'Filtros' : 'Filters') + (activeCount(F, f) ? ' · ' + activeCount(F, f) : '');

    var grid = $('#cat-grid');
    grid.innerHTML = list2.length ? list2.map(function (x) { return card(x.t, x.ev, x.fit); }).join('') : '<div class="empty"><p>' + t('none') + '</p><button type="button" class="btn sm" id="f-clear2">' + t('clear') + '</button></div>';
    bindAdd(grid, function () { var y = window.scrollY; renderCatalog(p); window.scrollTo(0, y); });

    // events
    $$('[data-f]', side).forEach(function (el) {
      var ev = el.tagName === 'SELECT' ? 'change' : (el.type === 'checkbox' ? 'change' : 'click');
      el.addEventListener(ev, function () {
        var k = el.getAttribute('data-f');
        if (k === 'types' || k === 'veh') { F[k] = $$('[data-f="' + k + '"]:checked', side).map(function (i) { return i.value; }); }
        else if (k === 'fits') F.fits = el.checked;
        else if (k === 'lic') { var ff = filler(); ff.lic = el.getAttribute('data-v'); if (ff.lic === '12m') { ff.len = 12; ff.unit = 'months'; } if (ff.lic === '6m') { ff.len = 6; ff.unit = 'months'; } set(KEY.filler, ff); }
        else F[k] = el.tagName === 'SELECT' ? el.value : el.getAttribute('data-v');
        set(KEY.filters, F); renderCatalog(p);
      });
    });
    var clr = function () { set(KEY.filters, null); var ff = filler(); ff.lic = 'any'; set(KEY.filler, ff); renderCatalog(p); };
    $('#f-clear').addEventListener('click', clr);
    if ($('#f-clear2')) $('#f-clear2').addEventListener('click', clr);
    $('#f-close').onclick = function () { side.classList.remove('open'); document.body.style.overflow = ''; $('#f-open').focus(); };
    $('#f-open').onclick = function () { side.classList.add('open'); document.body.style.overflow = 'hidden'; $('#f-close').focus(); };
    sortSel.onchange = function () { F.sort = sortSel.value; set(KEY.filters, F); renderCatalog(p); };
  }
  function activeCount(F, f) { return F.types.length + F.veh.length + (F.win !== 'any') + (F.ex !== 'any') + (F.fmt !== 'any') + (F.lang !== 'any') + (F.fits ? 1 : 0) + (f.lic !== 'any'); }

  function card(tt, ev, ft) {
    var meta = metaLine(tt);
    return '<article class="tcard' + (tt.original ? ' is-orig' : '') + '" data-id="' + tt.id + '">' +
      '<a class="tp" href="title.html?id=' + tt.id + '">' + I9S_poster(tt, { label: true }) + '</a>' +
      '<div class="tb">' +
        '<h3><a href="title.html?id=' + tt.id + '">' + esc(nm(tt.title)) + '</a>' + tag(tt) + '</h3>' +
        '<p class="tm meta-s">' + esc(meta) + '</p>' +
        '<p class="why" title="' + esc(t('why')) + '"><span class="sr">' + t('why') + ': </span>' + esc(whyText(ev)) + '</p>' +
        (ev.notCovered.length ? '<p class="nc meta-s">' + esc(t('notIn', { c: list(ev.notCovered.map(country)) })) + '</p>' : '') +
        '<div class="fit' + (ft.long || ft.tbc ? ' long' : '') + '">' + bar(ft.pct) + '<span class="meta-s">' + esc(ft.text) + '</span></div>' +
        addBtn(tt.id) +
      '</div></article>';
  }

  function renderFiller(f, p) {
    var box = $('#filler'); if (!box) return;
    var w = weeksOf(f), need = slotsNeeded(f), hrs = single(f) ? f.slot : f.slot * f.days * w;
    var pitems = prop().map(function (x) { return byId(x.id); }).filter(function (x) { return x && evaluate(x, p).ok; });
    var pslots = pitems.reduce(function (a, x) { return a + slotsOf(x, f); }, 0);
    var pt = L() === 'pt';
    box.innerHTML =
      '<div class="fl-in">' +
        '<div class="fl-h"><h2 class="meta"><span class="tally"></span>' + (pt ? 'Preenchedor de grade' : 'Schedule filler') + '</h2><p>' + (pt ? 'Diga a faixa que você precisa preencher. Cada título mostra quanto dela ele cobre, por número de episódios × duração.' : 'Tell us the slot you need to fill. Every title shows how much of it it covers, by episode count × runtime.') + '</p></div>' +
        '<div class="fl-f">' +
          '<label><span class="meta">' + (pt ? 'Duração da faixa' : 'Slot length') + '</span><select id="fl-slot">' + [15, 30, 45, 60, 90, 120].map(function (m) { return '<option value="' + m + '"' + (f.slot === m ? ' selected' : '') + '>' + m + ' min</option>'; }).join('') + '</select></label>' +
          '<label><span class="meta">' + (pt ? 'Dias por semana' : 'Days a week') + '</span><span class="step"><button type="button" data-d="-1" aria-label="' + (pt ? 'Menos' : 'Fewer') + '">−</button><input id="fl-days" type="number" min="1" max="7" value="' + f.days + '" inputmode="numeric"' + (single(f) ? ' disabled' : '') + '><button type="button" data-d="1" aria-label="' + (pt ? 'Mais' : 'More') + '">+</button></span></label>' +
          '<label><span class="meta">' + (pt ? 'Por quanto tempo' : 'For how long') + '</span><span class="dur"><input id="fl-len" type="number" min="1" max="104" value="' + f.len + '" inputmode="numeric"' + (single(f) ? ' disabled' : '') + '><select id="fl-unit"' + (single(f) ? ' disabled' : '') + '><option value="weeks"' + (f.unit === 'weeks' ? ' selected' : '') + '>' + (pt ? 'semanas' : 'weeks') + '</option><option value="months"' + (f.unit === 'months' ? ' selected' : '') + '>' + (pt ? 'meses' : 'months') + '</option></select></span></label>' +
          '<div class="fl-out"><span class="v num" id="fl-hours">' + fmtH(hrs) + '</span><span class="meta">' + (single(f) ? t('single', { s: f.slot }) : (need + ' ' + t('slots') + ' · ' + wk(w) + ' · ' + t('need'))) + '</span></div>' +
        '</div>' +
        (single(f) ? '' : '<div class="fl-w">' + weekStrip(Math.min(w, pslots / f.days), w) + '<span class="meta-s" id="fl-cov">' + (pitems.length ? '<a href="proposal.html">' + t('flCov', { f: Math.min(w, Math.floor(pslots / f.days)), w: w }) + '</a>' : t('flCov0')) + '</span></div>') +
      '</div>';
    function upd() {
      if (box._busy) return;
      var ff = filler();
      ff.slot = +$('#fl-slot').value;
      ff.days = Math.max(1, Math.min(7, +$('#fl-days').value || 1));
      ff.len = Math.max(1, Math.min(104, +$('#fl-len').value || 1));
      ff.unit = $('#fl-unit').value;
      set(KEY.filler, ff);
      box._busy = true;
      setTimeout(function () { renderCatalog(p); box._busy = false; }, 0);
    }
    ['#fl-slot', '#fl-unit'].forEach(function (s) { $(s).addEventListener('change', upd); });
    ['#fl-days', '#fl-len'].forEach(function (s) { $(s).addEventListener('change', upd); });
    $$('[data-d]', box).forEach(function (b) { b.addEventListener('click', function () { var i = $('#fl-days'); i.value = Math.max(1, Math.min(7, (+i.value || 1) + (+b.getAttribute('data-d')))); upd(); }); });
  }

  function renderFeatured(feats, p) {
    var box = $('#feat'); if (!box) return;
    if (!feats.length) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    var x = feats[0], tt = x.t;
    box.innerHTML = '<div class="wrap"><article class="feat" data-id="' + tt.id + '">' +
      '<a class="feat-ph" href="title.html?id=' + tt.id + '"><img src="img/' + tt.photos[0] + '.webp" alt="' + esc(nm(tt.title)) + ': ' + (L() === 'pt' ? 'carro clássico e equipe numa garagem, durante a gravação' : 'a classic car and crew in a garage, during the shoot') + '"><span class="otag big">AN i9 ORIGINAL</span></a>' +
      '<div class="feat-b">' +
        '<p class="meta dim"><span class="tally"></span> ' + t('featK') + '</p>' +
        '<h2><a href="title.html?id=' + tt.id + '">' + esc(nm(tt.title)) + '</a></h2>' +
        '<p class="meta-s dim">' + esc(nm(tt.genre)) + '</p>' +
        '<p>' + t('featP') + '</p>' +
        '<p class="why">' + esc(whyText(x.ev)) + '</p>' +
        '<dl class="fmini"><div><dt class="meta">' + t('outlets') + '</dt><dd>' + esc(tt.outlets.join(' · ')) + '</dd></div>' +
          '<div><dt class="meta">' + t('format2') + '</dt><dd>' + t('cutsShort') + '</dd></div>' +
          '<div><dt class="meta">' + t('specAudio') + '</dt><dd>' + t('langsAI') + '</dd></div>' +
          '<div><dt class="meta">' + t('epSeason') + '</dt><dd><span class="tbc">' + t('tbc') + '</span></dd></div></dl>' +
        (function () { var ft = fit(tt, filler()); return '<div class="fit">' + bar(ft.pct) + '<span class="meta-s">' + esc(ft.text) + '</span></div>'; })() +
        '<div class="feat-a">' + addBtn(tt.id) + '<a class="textlink" href="title.html?id=' + tt.id + '">' + (L() === 'pt' ? 'Ver o título' : 'See the title') + ' →</a></div>' +
      '</div></article></div>';
    bindAdd(box, function () { var y = window.scrollY; renderCatalog(p); window.scrollTo(0, y); });
  }

  function renderPackages(avail, f, p) {
    var box = $('#packs'); if (!box) return;
    var ids = avail.map(function (x) { return x.t.id; });
    var rows = PK.map(function (pk) {
      var ok = pk.titles.filter(function (id) { return ids.indexOf(id) >= 0; });
      var slots = ok.reduce(function (a, id) { return a + slotsOf(byId(id), f); }, 0);
      var need = slotsNeeded(f), pct = Math.min(1, slots / need);
      var w = weeksOf(f), wf = Math.floor(slots / f.days);
      var txt = single(f) ? t('fitSlots', { f: slots, n: need }) : (slots >= need ? t('fitAll', { w: w }) : t('fitPart', { f: Math.min(wf, w), w: w }));
      return { pk: pk, ok: ok, pct: pct, txt: txt };
    }).filter(function (r) { return r.ok.length >= 2; }).sort(function (a, b) { return b.pct - a.pct; });
    if (!rows.length) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = '<div class="wrap"><div class="pk-h"><h2 class="h3">' + t('pkTitle') + '</h2><span class="dtag">DEMO</span></div><div class="packs">' + rows.map(function (r) {
      return '<article class="pack"><div class="pk-posters">' + r.ok.slice(0, 4).map(function (id) { return I9S_poster(byId(id)); }).join('') + '</div>' +
        '<div class="pk-b"><b>' + esc(nm(r.pk.name)) + '</b><p>' + esc(nm(r.pk.blurb)) + '</p><p class="meta-s dim">' + t('pkOf', { a: r.ok.length, b: r.pk.titles.length }) + '</p>' +
        '<div class="fit">' + bar(r.pct) + '<span class="meta-s">' + t('pkFill', { f: r.txt }) + '</span></div>' +
        '<button type="button" class="addp" data-pack="' + r.pk.id + '"><i aria-hidden="true"></i><span>' + (L() === 'pt' ? 'Adicionar os ' + r.ok.length + ' títulos' : 'Add all ' + r.ok.length + ' titles') + '</span></button></div></article>';
    }).join('') + '</div></div>';
    $$('[data-pack]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var r = rows.filter(function (x) { return x.pk.id === b.getAttribute('data-pack'); })[0];
        r.ok.forEach(function (id) { addProp(id); });
        toast(t('toast', { t: nm(r.pk.name) }));
        renderCatalog(p);
      });
    });
  }

  /* ======================= TITLE PAGE ======================= */
  function titlePage() {
    var root = $('#ttl'); if (!root) return;
    var id = (/[?&]id=([^&]+)/.exec(location.search) || [])[1];
    var tt = byId(decodeURIComponent(id || '')) || C[0];
    var p = get(KEY.profile, null), f = filler(), ev = evaluate(tt, p);
    var pt = L() === 'pt';
    document.title = nm(tt.title) + ' — i9 Studios ' + (pt ? 'marketplace de conteúdo' : 'content marketplace');
    var TBC = { tbc: true };
    var totalMin = tt.episodes && tt.runtime ? tt.episodes * tt.runtime : null;
    var langs = function (a) { return a == null ? TBC : (a.length ? a.map(langName).join(', ') : t('noneYet')); };
    var spec = [
      [t('specGenre'), nm(tt.genre)],
      [t('specEp'), !tt.episodes ? TBC : (tt.episodes > 1 ? t('eps', { e: tt.episodes, r: tt.runtime }) : t('film', { r: tt.runtime }))],
      [t('specTot'), totalMin ? fmtH(totalMin) : TBC],
      [t('specAudio'), langs(tt.audio)], [t('specDub'), langs(tt.dub)], [t('specSubs'), langs(tt.subs)],
      [t('specFmt'), tt.format ? tt.format.join(' · ') : TBC], [t('specRating'), tt.real ? (L() === 'pt' ? 'Para a família' : 'Family-safe') : nm(R.ratings[tt.rating])]
    ];
    if (tt.real) spec = [
      [t('specGenre'), nm(tt.genre)], [t('credit'), 'AN i9 ORIGINAL'], [t('outlets'), tt.outlets.join(' · ')],
      [t('seasons'), tt.seasons ? t('seasonsV') : TBC],
      [t('shortForm'), tt.cuts ? t('shortFormV') : TBC], [t('linear'), tt.cuts ? t('linearV') : TBC],
      [t('epSeason'), TBC], [t('specTot'), TBC],
      [t('specAudio'), langs(tt.audio)], [t('specDub'), tt.dubAI ? t('dubAIv') : langs(tt.dub)], [t('specSubs'), langs(tt.subs)],
      [t('k4'), TBC], [t('trailerK'), tt.trailer === 'soon' ? t('trailer') : TBC], [t('specRating'), L() === 'pt' ? 'Para a família' : 'Family-safe']
    ];
    var cell = function (v) { return v && v.tbc ? '<span class="tbc">' + t('tbc') + '</span>' : esc(v); };
    var inP = inProp(tt.id), scr = prop().some(function (x) { return x.id === tt.id && x.screener; });
    $('#ttl-hero').innerHTML =
      '<div class="wrap th">' +
        '<div class="th-p">' + I9S_poster(tt, { label: true }) + (tt.photos ? '<div class="gal"><p class="meta dim">' + t('gallery') + '</p><div>' + tt.photos.slice(1, 4).map(function (ph) { return '<img src="img/' + ph + '.webp" alt="" loading="lazy">'; }).join('') + '</div></div>' : '') + '</div>' +
        '<div class="th-b">' +
          '<a class="back meta" href="catalog.html">← ' + t('back') + '</a>' +
          '<p class="meta dim th-k">' + esc(nm(R.types[tt.type])) + ' ·' + tag(tt) + '</p>' +
          '<h1>' + esc(nm(tt.title)) + '</h1>' +
          '<p class="lede">' + esc(nm(tt.synopsis)) + '</p>' +
          (ev.ok ? '<p class="why big"><span class="tally"></span><span><span class="meta dim">' + t('why') + '</span><br>' + esc(whyText(ev)) + (ev.notCovered.length ? '<br><span class="meta-s dim">' + esc(t('notIn', { c: list(ev.notCovered.map(country)) })) + '</span>' : '') + '</span></p>'
            : (p ? '<p class="na"><b>' + t('notAvail') + '</b><br>' + t('notAvailP') + '</p>' : '')) +
          '<div class="th-a">' +
            '<button type="button" class="btn sig" id="t-add"' + (p && !ev.ok ? ' disabled' : '') + '>' + (inP ? '✓ ' + t('added') : t('add')) + '</button>' +
            '<button type="button" class="btn" id="t-scr"' + (p && !ev.ok ? ' disabled' : '') + ' aria-pressed="' + scr + '">' + (scr ? '✓ ' + t('screenerOn') : t('screener')) + '</button>' +
          '</div>' +
          '<p class="meta-s dim" id="t-note" role="status" aria-live="polite"></p>' +
          (tt.cuts ? '<div class="vers"><div class="trailer" role="img" aria-label="' + esc(t('trailer')) + '"><span class="meta">TRAILER</span><b>' + t('trailer') + '</b><span class="meta-s">' + t('trailerP') + '</span></div>' +
            '<h2 class="meta vh">' + t('versH') + '</h2><div class="vcards">' +
            '<div><span class="meta">' + t('versShort') + '</span><b>' + t('versShortV') + '</b><p>' + t('versShortP') + '</p></div>' +
            '<div><span class="meta">' + t('versLin') + '</span><b>' + t('versLinV') + '</b><p>' + t('versLinP') + '</p></div></div></div>' : '') +
          '<table class="spec dark"><tbody>' + spec.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + cell(r[1]) + '</td></tr>'; }).join('') + '</tbody></table>' +
        '</div>' +
      '</div>';

    // rights table
    var mine = function (row) { return p && p.terr.some(function (c) { return covers(row, c); }) && inter(row.veh, p.veh).length; };
    if (tt.perDeal) {
      var tb = '<span class="tbc">' + t('tbc') + '</span>';
      $('#ttl-rights').innerHTML = '<div class="wrap"><div class="head"><h2 class="h2">' + t('rightsH') + '</h2><p>' + t('rightsDeal') + '</p></div>' +
        '<div class="tscroll"><table class="rights"><thead><tr><th>' + t('thTerr') + '</th><th>' + t('thVeh') + '</th><th>' + t('thWin') + '</th><th>' + t('thLic') + '</th><th>' + t('thEx') + '</th></tr></thead><tbody>' +
        '<tr class="mine"><td data-l="' + t('thTerr') + '"><span class="yours meta"><span class="tally"></span>' + t('perDeal') + '</span>' + tb + '</td><td data-l="' + t('thVeh') + '">' + tb + '</td><td data-l="' + t('thWin') + '">' + tb + '</td><td data-l="' + t('thLic') + '">' + tb + '</td><td data-l="' + t('thEx') + '">' + tb + '</td></tr>' +
        '</tbody></table></div></div>';
    } else
    $('#ttl-rights').innerHTML =
      '<div class="wrap"><div class="head"><h2 class="h2">' + t('rightsH') + '</h2><p>' + t('rightsP') + '</p></div>' +
      '<div class="tscroll"><table class="rights"><thead><tr><th>' + t('thTerr') + '</th><th>' + t('thVeh') + '</th><th>' + t('thWin') + '</th><th>' + t('thLic') + '</th><th>' + t('thEx') + '</th></tr></thead><tbody>' +
      tt.rights.map(function (row) {
        var m = mine(row);
        var terr = row.terr.map(terrName).join(', ') + (row.excl.length ? ' <span class="dim">(' + t('except', { c: row.excl.map(country).join(', ') }) + ')</span>' : '');
        var veh = row.veh.map(function (v) { var on = p && p.veh.indexOf(v) >= 0; return '<span class="vt' + (on && m ? ' on' : '') + '">' + esc(nm(R.vehicles[v])) + '</span>'; }).join('');
        return '<tr' + (m ? ' class="mine"' : '') + '><td data-l="' + t('thTerr') + '">' + (m ? '<span class="yours meta"><span class="tally"></span>' + t('yours') + '</span>' : '') + terr + '</td><td data-l="' + t('thVeh') + '">' + veh + '</td><td data-l="' + t('thWin') + '">' + row.win.map(function (w) { return nm(R.windows[w]); }).join(', ') + '</td><td data-l="' + t('thLic') + '">' + row.lic.map(function (l) { return nm(R.licences[l]); }).join(', ') + '</td><td data-l="' + t('thEx') + '">' + row.ex.map(function (e) { return nm(R.exclusivity[e]); }).join(', ') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="meta-s dim" style="margin-top:16px">' + (pt ? 'Direitos de demonstração. Os direitos reais vêm do registro de direitos da i9 por título.' : 'Demonstration rights. Real rights come from i9’s rights register, per title.') + '</p></div>';

    // schedule
    var sc = $('#ttl-sched');
    if (!p) sc.innerHTML = '<div class="wrap"><h2 class="h2">' + t('schedH') + '</h2><p class="lede" style="margin-top:16px">' + t('schedNo') + '</p><p style="margin-top:24px"><a class="btn sig" href="register.html">' + t('gateCta') + '</a></p></div>';
    else {
      var ft = fit(tt, f), w = weeksOf(f), need = slotsNeeded(f), k = perSlot(tt, f);
      var body;
      if (tt.cuts) {
        var fc = fit(tt, f);
        body = '<div class="sc-calc">' +
          '<div><span class="v num">' + f.slot + '<small> min</small></span><span class="meta">' + (pt ? 'Faixa' : 'Slot') + '</span></div>' +
          '<div><span class="v num">' + f.days + '</span><span class="meta">' + (pt ? 'Dias por semana' : 'Days a week') + '</span></div>' +
          '<div><span class="v num">' + (fc.cut ? fc.cut.perMonth : '—') + '</span><span class="meta">' + (fc.cut ? (fc.cut.id === 'thirty' ? t('cut30n') : t('cutPilln')) : '') + (pt ? ' por mês' : ' a month') + '</span></div>' +
          '<div class="res"><span class="v num">' + Math.round(fc.pct * 100) + '%</span><span class="meta">' + esc(fc.text) + '</span></div></div>' +
          (fc.cut && !single(f) ? '<p class="sc-t">' + t('schedCut', { s: f.slot, d: f.days, n: fc.needMonth, c: fc.cut.id === 'thirty' ? t('cut30n') : t('cutPilln'), k: fc.cut.perMonth, p: Math.round(fc.pct * 100) }) + ' <b>' + t('versLinP') + '</b></p>' : '');
      }
      else if (!tt.runtime) body = '<p class="lede">' + t('fitTbc') + '.</p>';
      else if (!k) body = '<p class="lede">' + t('schedFilm', { r: tt.runtime }) + '</p>';
      else {
        var slots = Math.ceil(tt.episodes / k), wks = Math.round(slots / f.days * 10) / 10;
        var kTxt = t('perSlot', { k: k });
        var res = slots >= need ? t('schedCovered', { x: single(f) ? '' : wk(Math.floor((slots - need) / f.days)) }) : t('schedShort', { p: Math.round(slots / need * 100), r: Math.ceil((need - slots) / f.days) });
        body = '<div class="sc-calc">' +
          '<div><span class="v num">' + f.slot + '<small> min</small></span><span class="meta">' + (pt ? 'Faixa' : 'Slot') + '</span></div>' +
          '<div><span class="v num">' + f.days + '</span><span class="meta">' + (pt ? 'Dias por semana' : 'Days a week') + '</span></div>' +
          '<div><span class="v num">' + (single(f) ? 1 : w) + '</span><span class="meta">' + (single(f) ? (pt ? 'Inserção' : 'Run') : (pt ? 'Semanas' : 'Weeks')) + '</span></div>' +
          '<div class="res"><span class="v num">' + Math.round(ft.pct * 100) + '%</span><span class="meta">' + esc(ft.text) + '</span></div></div>' +
          (single(f) ? '' : weekStrip(Math.min(w, slots / f.days), w)) +
          '<p class="sc-t">' + t('schedTxt', { s: f.slot, d: f.days, k: kTxt, e: tt.episodes, f: slots, w: wks }) + ' ' + t('schedNeed', { n: need, h: fmtH(single(f) ? f.slot : f.slot * f.days * w) }) + ' <b>' + res + '</b></p>';
      }
      sc.innerHTML = '<div class="wrap"><div class="head"><h2 class="h2">' + t('schedH') + '</h2><p><a class="textlink" href="catalog.html#filler">' + (pt ? 'Mudar a faixa' : 'Change the slot') + ' →</a></p></div>' + body + '</div>';
    }

    // more
    var more = $('#ttl-more');
    if (p) {
      var others = C.filter(function (x) { return x.id !== tt.id && evaluate(x, p).ok; }).sort(function (a, b) { return (rank(b, p) - rank(a, p)) || (a.type === tt.type ? -1 : 1); }).slice(0, 4);
      more.innerHTML = others.length ? '<div class="wrap"><h2 class="h3" style="margin-bottom:28px">' + t('moreH') + '</h2><div class="cgrid four">' + others.map(function (x) { var e = evaluate(x, p); return card(x, e, fit(x, f)); }).join('') + '</div></div>' : '';
      bindAdd(more);
    } else more.innerHTML = '';

    $('#t-add').addEventListener('click', function () {
      if (inProp(tt.id)) { rmProp(tt.id); toast(t('toastRm', { t: nm(tt.title) })); } else { addProp(tt.id); toast(t('toast', { t: nm(tt.title) })); }
      titlePage();
    });
    $('#t-scr').addEventListener('click', function () {
      addProp(tt.id, true); titlePage(); $('#t-note').textContent = t('screenerNote');
    });
  }

  /* ======================= PROPOSAL ======================= */
  function proposalPage() {
    var root = $('#prop'); if (!root) return;
    var p = get(KEY.profile, null), f = filler(), items = prop(), pt = L() === 'pt';
    var sent = get(KEY.sent, null);
    if (sent && sent.done) { renderDone(sent); return; }
    $('#prop-h').textContent = t('propH');
    if (!items.length) {
      $('#prop-body').innerHTML = '<div class="empty big"><p class="lede">' + t('propEmpty') + '</p><a class="btn sig" href="catalog.html">' + t('propBrowse') + '</a></div>';
      $('#prop-side').innerHTML = ''; return;
    }
    var rows = items.map(function (it) { var tt = byId(it.id); return tt ? { it: it, t: tt, ev: evaluate(tt, p) } : null; }).filter(Boolean);
    $('#prop-body').innerHTML = '<ol class="plist">' + rows.map(function (r, i) {
      var tt = r.t, ev = r.ev, licOpts = ev.ok ? ev.lic : tt.rights.reduce(function (a, x) { return uniq(a.concat(x.lic)); }, []);
      if (tt.perDeal) licOpts = ['deal'];
      var cur = r.it.lic || (f.lic !== 'any' && licOpts.indexOf(f.lic) >= 0 ? f.lic : licOpts[0]);
      var ft = fit(tt, f);
      return '<li class="pitem" data-id="' + tt.id + '">' +
        '<a class="pp" href="title.html?id=' + tt.id + '">' + I9S_poster(tt) + '</a>' +
        '<div class="pb">' +
          '<div class="pt-row"><span class="meta dim num">' + String(i + 1).padStart(2, '0') + '</span><h3><a href="title.html?id=' + tt.id + '">' + esc(nm(tt.title)) + '</a>' + tag(tt) + '</h3></div>' +
          '<p class="meta-s dim">' + esc(metaLine(tt)) + '</p>' +
          (ev.ok ? '<p class="why">' + esc(whyText(ev)) + '</p>' : (p ? '<p class="nc meta-s">' + t('notAvail') + '</p>' : '')) +
          '<div class="pctl">' +
            '<label><span class="meta">' + t('lic') + '</span><select data-lic="' + tt.id + '">' + licOpts.map(function (l) { return '<option value="' + l + '"' + (cur === l ? ' selected' : '') + '>' + esc(l === 'deal' ? t('licDeal') : nm(R.licences[l])) + '</option>'; }).join('') + '</select></label>' +
            '<label class="tog"><input type="checkbox" data-scr="' + tt.id + '"' + (r.it.screener ? ' checked' : '') + '><span>' + t('screener') + '</span></label>' +
            '<button type="button" class="textlink rm" data-rm="' + tt.id + '">' + t('remove') + '</button>' +
          '</div>' +
          '<div class="fit">' + bar(ft.pct) + '<span class="meta-s">' + esc(ft.text) + '</span></div>' +
        '</div></li>';
    }).join('') + '</ol>';

    // coverage
    var okRows = rows.filter(function (r) { return !p || r.ev.ok; });
    var slots = okRows.reduce(function (a, r) { return a + slotsOf(r.t, f); }, 0);
    var need = slotsNeeded(f), w = weeksOf(f), wf = Math.min(w, Math.floor(slots / f.days));
    var perWeek = fmtH(f.slot * f.days);
    var covLine = single(f) ? t('covSingle', { n: okRows.length }) : (slots >= need ? t('covAll', { h: perWeek, w: w }) : t('covTxt', { s: f.slot, d: f.days, h: perWeek, f: wf, w: w }));
    var eps = okRows.reduce(function (a, r) { return a + (r.t.episodes || 0); }, 0);
    var mins = okRows.reduce(function (a, r) { return a + (r.t.episodes || 0) * (r.t.runtime || 0); }, 0);
    var tbcRows = okRows.filter(function (r) { return !r.t.episodes; });
    var vehs = p ? p.veh : [];
    var draft = get('i9s.draft', {}) || {};
    $('#prop-side').innerHTML =
      '<div class="cov">' +
        '<h2 class="meta"><span class="tally"></span>' + t('covH') + '</h2>' +
        '<p class="cov-big" id="cov-line">' + esc(covLine) + '</p>' +
        (single(f) ? '' : weekStrip(Math.min(w, slots / f.days), w)) +
        '<p class="meta-s dim">' + t('covSum', { n: okRows.length, e: eps, t: fmtH(mins) }) + '</p>' +
        tbcRows.map(function (r) { return '<p class="meta-s dim">' + esc(r.t.cuts ? t('covRate', { t: nm(r.t.title), r: L() === 'pt' ? '4 × 30 min ou 12 pílulas' : '4 × 30 min or 12 pílulas' }) : t('covExcl', { t: nm(r.t.title) })) + '</p>'; }).join('') +
        '<p class="meta-s"><a href="catalog.html#filler">' + (pt ? 'Mudar a faixa' : 'Change the slot') + ' →</a></p>' +
      '</div>' +
      '<form class="pform" id="pform" novalidate>' +
        '<label><span class="meta">' + t('start') + '</span><input type="month" id="p-start" value="' + esc(draft.start || '') + '"></label>' +
        '<fieldset><legend class="meta">' + t('vehicles') + '</legend><div class="chips">' + (vehs.length ? vehs : Object.keys(R.vehicles)).map(function (v) { return '<label class="ck"><input type="checkbox" name="pveh" value="' + v + '" checked><span>' + esc(nm(R.vehicles[v])) + '</span></label>'; }).join('') + '</div></fieldset>' +
        '<fieldset><legend class="meta">' + t('excl') + '</legend><div class="seg" role="radiogroup">' + [['any', t('anyEx')], ['nonexcl', nm(R.exclusivity.nonexcl)], ['excl', nm(R.exclusivity.excl)]].map(function (o, i) { return '<button type="button" role="radio" data-ex="' + o[0] + '" aria-checked="' + ((draft.ex || 'any') === o[0]) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div></fieldset>' +
        '<label><span class="meta">' + t('notes') + '</span><textarea id="p-notes" rows="3" placeholder="' + esc(t('notesPh')) + '">' + esc(draft.notes || '') + '</textarea></label>' +
        (p ? '<p class="who meta-s"><b>' + esc(p.company) + '</b><br>' + esc(p.name) + ' · ' + esc(p.role) + '<br>' + esc(p.email) + ' · ' + esc(p.wa) + ' <a href="register.html?edit=1">' + t('edit') + '</a></p>' : '<p class="warn">' + t('sendNeedProfile') + ' <a href="register.html">' + t('gateCta') + '</a></p>') +
        '<button type="submit" class="btn sig full" id="p-send"' + (p ? '' : ' disabled') + '>' + t('send') + '</button>' +
        '<p class="meta-s dim">' + t('sendNote') + '</p>' +
      '</form>';

    $$('[data-lic]').forEach(function (s) { s.addEventListener('change', function () { var pp = prop(); pp.forEach(function (x) { if (x.id === s.getAttribute('data-lic')) x.lic = s.value; }); set(KEY.proposal, pp); }); });
    $$('[data-scr]').forEach(function (c) { c.addEventListener('change', function () { var pp = prop(); pp.forEach(function (x) { if (x.id === c.getAttribute('data-scr')) x.screener = c.checked; }); set(KEY.proposal, pp); }); });
    $$('[data-rm]').forEach(function (b) { b.addEventListener('click', function () { var tt = byId(b.getAttribute('data-rm')); rmProp(tt.id); toast(t('toastRm', { t: nm(tt.title) })); proposalPage(); }); });
    $$('[data-ex]').forEach(function (b) { b.addEventListener('click', function () { $$('[data-ex]').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); saveDraft(); }); });
    ['#p-start', '#p-notes'].forEach(function (s) { $(s).addEventListener('change', saveDraft); });
    function saveDraft() { var ex = $$('[data-ex]').filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0]; set('i9s.draft', { start: $('#p-start').value, notes: $('#p-notes').value, ex: ex ? ex.getAttribute('data-ex') : 'any' }); }

    $('#pform').addEventListener('submit', function (e) {
      e.preventDefault(); if (!p) return;
      saveDraft();
      // DESIGN PROTOTYPE: nothing is transmitted. In production this payload is POSTed to i9's server,
      // which creates the lead/opportunity in Central and notifies the distribution team.
      var ex = $$('[data-ex]').filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
      var payload = {
        ref: 'I9S-' + p.country + '-' + Date.now().toString(36).toUpperCase().slice(-6),
        at: new Date().toISOString(), buyer: p,
        titles: prop(), filler: f, coverage: covLine,
        start: $('#p-start').value, vehicles: $$('[name="pveh"]:checked').map(function (i) { return i.value; }),
        exclusivity: ex ? ex.getAttribute('data-ex') : 'any', notes: $('#p-notes').value, done: true
      };
      set(KEY.sent, payload);
      renderDone(payload);
      window.scrollTo(0, 0);
    });
  }

  function renderDone(s) {
    var pt = L() === 'pt';
    $('#prop-h').textContent = t('doneH');
    var wa = 'https://wa.me/551133927878';
    $('#prop-body').innerHTML =
      '<div class="done" id="done">' +
        '<p class="lede">' + t('doneP') + '</p>' +
        '<dl class="refbox"><dt class="meta">' + t('ref') + '</dt><dd class="num">' + esc(s.ref) + '</dd></dl>' +
        '<h2 class="h3" style="margin:44px 0 20px">' + t('nextH') + '</h2>' +
        '<ol class="next">' +
          '<li><b>' + t('n1h') + '</b><span>' + t('n1') + '</span></li>' +
          '<li><b>' + t('n2h') + '</b><span>' + t('n2') + '</span></li>' +
          '<li><b>' + t('n3h') + '</b><span>' + t('n3') + '</span></li>' +
          '<li><b>' + t('n4h') + '</b><span>' + t('n4') + '</span></li>' +
        '</ol>' +
        '<div class="done-a"><a class="btn" href="' + wa + '" rel="noopener">' + t('talkNow') + '</a><button type="button" class="textlink" id="new-req">' + t('newReq') + '</button></div>' +
      '</div>';
    $('#prop-side').innerHTML =
      '<div class="cov sum"><h2 class="meta"><span class="tally"></span>' + (pt ? 'Resumo do pedido' : 'Request summary') + '</h2>' +
      '<p><b>' + esc(s.buyer.company) + '</b><br><span class="dim">' + esc(list(s.buyer.terr.map(country))) + '</span></p>' +
      '<p class="cov-big">' + esc(s.coverage) + '</p>' +
      '<ul class="sumlist">' + s.titles.map(function (it) { var tt = byId(it.id); return tt ? '<li><span>' + esc(nm(tt.title)) + tag(tt) + '</span><span class="meta-s dim">' + esc(tt.perDeal ? t('licDeal') : nm(R.licences[it.lic || tt.rights[0].lic[0]])) + (it.screener ? ' · screener' : '') + '</span></li>' : ''; }).join('') + '</ul>' +
      '<p class="meta-s dim">' + s.vehicles.map(function (v) { return nm(R.vehicles[v]); }).join(' · ') + (s.start ? ' · ' + esc(s.start) : '') + '</p></div>';
    $('#new-req').addEventListener('click', function () { set(KEY.sent, null); set(KEY.proposal, []); set('i9s.draft', {}); if (window.I9S_updateProposalCount) I9S_updateProposalCount(); location.href = 'catalog.html'; });
  }

  /* ======================= REGISTER ======================= */
  function registerPage() {
    var form = $('#reg'); if (!form) return;
    var pt = function () { return L() === 'pt'; };
    var edit = /[?&]edit=1/.test(location.search);
    var st = (edit && get(KEY.profile, null)) || { terr: [], langs: [], veh: [], looking: [], dub: true, subs: true };
    var step = 1, N = 4;

    // options
    function fillOptions() {
      var cs = R.countries.slice().sort(function (a, b) { return country(a[0]).localeCompare(country(b[0])); });
      $('#r-country').innerHTML = '<option value="">' + (pt() ? 'Escolha o país' : 'Choose a country') + '</option>' + cs.map(function (c) { return '<option value="' + c[0] + '"' + (st.country === c[0] ? ' selected' : '') + '>' + esc(country(c[0])) + '</option>'; }).join('');
      $('#r-add').innerHTML = '<option value="">' + t('addTerr') + '…</option>' + cs.map(function (c) { return '<option value="' + c[0] + '">' + esc(country(c[0])) + '</option>'; }).join('');
      $('#r-profile').innerHTML = Object.keys(R.profiles).map(function (k) { return '<label class="card-r"><input type="radio" name="profile" value="' + k + '"' + (st.profile === k ? ' checked' : '') + '><span>' + esc(nm(R.profiles[k])) + '</span></label>'; }).join('');
      $('#r-langs').innerHTML = Object.keys(R.languages).map(function (k) { return '<label class="ck"><input type="checkbox" name="langs" value="' + k + '"' + (st.langs.indexOf(k) >= 0 ? ' checked' : '') + '><span>' + esc(langName(k)) + '</span></label>'; }).join('');
      $('#r-veh').innerHTML = Object.keys(R.vehicles).map(function (k) { return '<label class="ck"><input type="checkbox" name="veh" value="' + k + '"' + (st.veh.indexOf(k) >= 0 ? ' checked' : '') + '><span>' + esc(nm(R.vehicles[k])) + '</span></label>'; }).join('');
      $('#r-looking').innerHTML = Object.keys(R.types).map(function (k) { return '<label class="ck"><input type="checkbox" name="looking" value="' + k + '"' + (st.looking.indexOf(k) >= 0 ? ' checked' : '') + '><span>' + esc(nm(R.types[k])) + '</span></label>'; }).join('');
      $('#r-dub').checked = st.dub !== false; $('#r-subs').checked = st.subs !== false;
      ['company', 'gap', 'name', 'role', 'email', 'wa'].forEach(function (k) { var el = $('#r-' + k); if (el && st[k] && !el.value) el.value = st[k]; });
      drawTerr();
    }
    function drawTerr() {
      $('#r-terr').innerHTML = st.terr.map(function (c) { return '<span class="tchip">' + esc(country(c)) + '<button type="button" data-rmt="' + c + '" aria-label="' + esc(t('rm', { c: country(c) })) + '">×</button></span>'; }).join('');
      $$('[data-rmt]').forEach(function (b) { b.addEventListener('click', function () { st.terr = st.terr.filter(function (x) { return x !== b.getAttribute('data-rmt'); }); drawTerr(); }); });
      // neighbours: same primary region as the home country
      var home = R.countries.filter(function (x) { return x[0] === st.country; })[0], sug = [];
      if (home) {
        var reg = home[3][home[3].length - 1];
        sug = R.countries.filter(function (x) { return x[3].indexOf(reg) >= 0 && st.terr.indexOf(x[0]) < 0; }).slice(0, 4);
      }
      $('#r-sug').innerHTML = sug.length ? '<span class="meta dim">' + t('neighbours') + '</span>' + sug.map(function (x) { return '<button type="button" class="sug" data-addt="' + x[0] + '">+ ' + esc(country(x[0])) + '</button>'; }).join('') : '';
      $$('[data-addt]').forEach(function (b) { b.addEventListener('click', function () { st.terr.push(b.getAttribute('data-addt')); drawTerr(); }); });
    }
    $('#r-country').addEventListener('change', function () {
      st.country = this.value;
      if (st.country && st.terr.indexOf(st.country) < 0) st.terr.unshift(st.country);
      drawTerr(); clearErr('country');
    });
    $('#r-add').addEventListener('change', function () { var v = this.value; if (v && st.terr.indexOf(v) < 0) st.terr.push(v); this.value = ''; drawTerr(); clearErr('terr'); });

    function err(k, msg) { var e = $('[data-err="' + k + '"]'); if (e) { e.textContent = msg; e.hidden = false; } var f = $('#r-' + k); if (f) f.setAttribute('aria-invalid', 'true'); }
    function clearErr(k) { var e = $('[data-err="' + k + '"]'); if (e) e.hidden = true; var f = $('#r-' + k); if (f) f.removeAttribute('aria-invalid'); }
    function read() {
      st.company = $('#r-company').value.trim();
      var pr = $('input[name="profile"]:checked'); st.profile = pr ? pr.value : null;
      st.langs = $$('input[name="langs"]:checked').map(function (i) { return i.value; });
      st.veh = $$('input[name="veh"]:checked').map(function (i) { return i.value; });
      st.looking = $$('input[name="looking"]:checked').map(function (i) { return i.value; });
      st.dub = $('#r-dub').checked; st.subs = $('#r-subs').checked;
      ['gap', 'name', 'role', 'email', 'wa'].forEach(function (k) { st[k] = $('#r-' + k).value.trim(); });
    }
    function valid(s) {
      read(); var ok = true;
      $$('[data-err]').forEach(function (e) { e.hidden = true; });
      if (s === 1) {
        if (!st.company) { err('company', t('req')); ok = false; }
        if (!st.country) { err('country', t('req')); ok = false; }
        if (!st.terr.length) { err('terr', t('pickOne')); ok = false; }
      }
      if (s === 2) {
        if (!st.profile) { err('profile', t('pickOne')); ok = false; }
        if (!st.langs.length) { err('langs', t('pickOne')); ok = false; }
      }
      if (s === 3) { if (!st.veh.length) { err('veh', t('pickOne')); ok = false; } }
      if (s === 4) {
        if (!st.name) { err('name', t('req')); ok = false; }
        if (!st.role) { err('role', t('req')); ok = false; }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(st.email)) { err('email', t('emailBad')); ok = false; }
        if (!st.wa) { err('wa', t('req')); ok = false; }
      }
      if (!ok) { var first = $('[data-err]:not([hidden])'); if (first) { var fld = first.closest('.fld'); var inp = fld && fld.querySelector('input,select'); if (inp) inp.focus(); } }
      return ok;
    }
    function show(s) {
      step = s;
      $$('.rstep').forEach(function (fs) { fs.hidden = +fs.getAttribute('data-step') !== s; });
      $$('.rnav li').forEach(function (li, i) { li.classList.toggle('on', i + 1 === s); li.classList.toggle('done', i + 1 < s); });
      $('#r-stepof').textContent = t('stepOf', { a: s, b: N });
      $('#r-back').hidden = s === 1;
      $('#r-next').hidden = s === N; $('#r-finish').hidden = s !== N;
      $('#r-prog').style.width = (s / N * 100) + '%';
      var h = $('.rstep[data-step="' + s + '"] legend'); if (h && s > 1) h.focus();
    }
    $('#r-next').addEventListener('click', function () { if (valid(step)) show(step + 1); });
    $('#r-back').addEventListener('click', function () { read(); show(step - 1); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (step < N) { if (valid(step)) show(step + 1); return; }
      if (!valid(4)) return;
      // DESIGN PROTOTYPE: the profile is stored only in this browser. Nothing is sent.
      var prof = { company: st.company, country: st.country, terr: st.terr, profile: st.profile, langs: st.langs, dub: st.dub, subs: st.subs, veh: st.veh, looking: st.looking, gap: st.gap, name: st.name, role: st.role, email: st.email, wa: st.wa };
      set(KEY.profile, prof); set(KEY.filters, null);
      location.href = 'catalog.html';
    });
    $$('[data-sample]').forEach(function (b) { b.addEventListener('click', function () { useSample(b.getAttribute('data-sample'), true); }); });
    fillOptions(); show(1);
    document.addEventListener('i9s:lang', function () { read(); fillOptions(); $('#r-stepof').textContent = t('stepOf', { a: step, b: N }); });
  }

  /* ======================= MARKET LANDING ======================= */
  function marketPage() {
    var w = $('#mk-wall'); if (w) w.innerHTML = C.concat(C).slice(0, 30).map(function (x) { return I9S_poster(x); }).join('');
    $$('[data-sample]').forEach(function (b) { if (!b._b) { b._b = 1; b.addEventListener('click', function () { useSample(b.getAttribute('data-sample'), true); }); } });
    var n = $('#mk-n'); if (n) n.textContent = C.length;
  }

  /* ---------------- boot ---------------- */
  function renderAll() { catalogPage(); titlePage(); proposalPage(); marketPage(); }
  function boot() {
    if (window.I9S_renderChrome) I9S_renderChrome();
    registerPage();
    renderAll();
    if (window.I9S) I9S.apply();
    document.addEventListener('i9s:lang', renderAll);
    var rv = $$('.rv'); rv.forEach(function (e) { e.classList.add('in'); });
  }
  window.I9S_market = { evaluate: evaluate, fit: fit, filler: filler, samples: SAMPLES };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
