/* ==========================================================================
   i9 Studios content marketplace: DEMONSTRATION CATALOGUE.

   ONE REAL TITLE: Netmotors, i9's original production (owned IP, credit "AN i9 ORIGINAL", the only
   title allowed to carry it). Its published facts come from i9tv.com.br; every fact we do not have is
   null and shows as "to confirm with i9". Its rights are set per deal (i9 owns the IP).

   EVERY OTHER TITLE BELOW IS INVENTED. Names, synopses, episode counts and rights are examples
   written to show how the marketplace works. None is a real show and none is an i9
   production. Real i9 productions (Heróis Eternos, Canta Comigo, ...) are credited on the
   Produce page and are NOT offered for licence here.

   To make it real, i9 replaces this file with its distribution catalogue, one object per
   title, keeping the same fields:

   id        url-safe slug
   demo      true for placeholders (shows the DEMO tag); remove for real titles
   type      novela | series | film | documentary | reality | kids | music | faith | sports | magazine
   real      true for a real title (no DEMO tag)      original  true only for owned IP (AN i9 ORIGINAL)
   photos    real, cleared i9 photos (real titles only)   outlets  where it airs today (published facts)
   perDeal   true when rights are not listed and availability is set per deal
   title     { en, pt }            synopsis { en, pt }      genre { en, pt }
   rating    L | 10 | 12 | 14 | 16 | 18   (18 = adult: hidden from faith and kids channels)
   tags      suitability: 'faith-safe', 'family', 'kids'
   episodes  number of episodes (1 for a film)        runtime  minutes per episode (net)
   format    ['HD'] or ['HD','4K']
   audio     original audio languages      dub  dubbed versions ready     subs  subtitle files ready
   poster    { g: ground colour, l: layout }  typographic poster drawn in code (no photos)
   rights    one row per offer: territory × vehicle × window × licence × exclusivity
             terr   territory or region codes (data/territories.js)    excl  carved-out countries
             veh    fta | cable | dth | iptv | svod | avod
             win    first | second | library | catchup
             lic    12m | 6m | single
             ex     nonexcl | excl
   ========================================================================== */
window.I9S_CATALOG = [
  {
    id: 'netmotors', real: true, original: true, perDeal: true, type: 'magazine',
    title: { en: 'Netmotors', pt: 'Netmotors' },
    genre: { en: 'Motoring / lifestyle magazine show', pt: 'Programa de revista sobre carros e estilo de vida' },
    synopsis: {
      en: 'The car show produced entirely by i9: information, entertainment and stories for car enthusiasts, from format to delivery. It airs today on RFTV, NGT, PlayTV and YouTube, on the Netmotors TV channel.',
      pt: 'O programa de carros produzido inteiramente pela i9: informação, entretenimento e histórias para quem gosta de carro, do formato à entrega. Hoje vai ao ar na RFTV, NGT, PlayTV e no YouTube, no canal Netmotors TV.'
    },
    rating: 'L', tags: ['family'],
    /* Owner facts, 25 Nov: 3 seasons in the new format; "pílulas" of 8–12 min, 12 a month; a second
       packaging of 4 × 30-min episodes a month, each made of 3 pílulas; original Portuguese; AI-dubbed
       into English and Spanish; trailer in edit. Still unknown (null = "to confirm with i9"): episodes
       per season, total running time, subtitles, 4K availability, territories, windows, exclusivity.
       Season totals are NOT multiplied out from the monthly rate. */
    seasons: 3, episodes: null, runtime: null, format: null, subs: null,
    audio: ['pt'], dub: ['en', 'es'], dubAI: true, trailer: 'soon',
    cuts: [
      { id: 'pill', min: 8, max: 12, perMonth: 12 },
      { id: 'thirty', min: 30, max: 30, perMonth: 4, pills: 3 }
    ],
    outlets: ['RFTV', 'NGT', 'PlayTV', 'YouTube · Netmotors TV'],
    photos: ['p-netmotors-0', 'p-netmotors-1', 'p-netmotors-3', 'p-netmotors-2', 'p-netmotors-4', 'p-netmotors-5'],
    poster: { g: 'black', l: 'photo' },
    rights: []
  },
  {
    id: 'house-of-tides', demo: true, type: 'novela',
    title: { en: 'House of Tides', pt: 'Casa das Marés' },
    genre: { en: 'Family drama', pt: 'Drama familiar' },
    synopsis: {
      en: 'Three generations of a fishing family share one house on a coastal island. When the youngest daughter comes home to save the boatyard, old debts and old loves come in with the tide.',
      pt: 'Três gerações de uma família de pescadores dividem uma casa numa ilha do litoral. Quando a filha mais nova volta para salvar o estaleiro, dívidas e amores antigos chegam com a maré.'
    },
    rating: '10', tags: ['family'], episodes: 160, runtime: 45, format: ['HD', '4K'],
    audio: ['pt'], dub: ['es'], subs: ['en', 'es', 'fr'],
    poster: { g: 'paper', l: 'band' },
    rights: [
      { terr: ['AFRICA', 'LATAM', 'LUSO'], excl: [], veh: ['fta', 'cable', 'dth'], win: ['first', 'second'], lic: ['12m', '6m'], ex: ['nonexcl', 'excl'] }
    ]
  },
  {
    id: 'second-harvest', demo: true, type: 'novela',
    title: { en: 'Second Harvest', pt: 'Segunda Colheita' },
    genre: { en: 'Rural drama, faith and family', pt: 'Drama rural, fé e família' },
    synopsis: {
      en: 'After a drought takes the farm, a widowed father and his four children start again in a valley town where nobody knows them. A story of forgiveness, told one season at a time.',
      pt: 'Depois que a seca leva a fazenda, um pai viúvo e seus quatro filhos recomeçam numa cidade do vale onde ninguém os conhece. Uma história de perdão, contada estação por estação.'
    },
    rating: 'L', tags: ['faith-safe', 'family'], episodes: 120, runtime: 45, format: ['HD'],
    audio: ['pt'], dub: ['en', 'es'], subs: ['en', 'es'],
    poster: { g: 'deep', l: 'stack' },
    rights: [
      { terr: ['WORLD'], excl: ['BR'], veh: ['fta', 'cable', 'dth', 'iptv'], win: ['first', 'library'], lic: ['12m', '6m'], ex: ['nonexcl'] },
      { terr: ['NORAM'], excl: [], veh: ['svod', 'avod'], win: ['library'], lic: ['12m'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'coffee-ridge', demo: true, type: 'novela',
    title: { en: 'The Coffee Ridge', pt: 'Serra do Café' },
    genre: { en: 'Period drama', pt: 'Drama de época' },
    synopsis: {
      en: 'In the 1920s highlands, two families fight over the best slopes for coffee, until their children fall in love on the night of the first export train.',
      pt: 'Na serra dos anos 1920, duas famílias disputam as melhores encostas de café, até que os filhos se apaixonam na noite do primeiro trem de exportação.'
    },
    rating: '12', tags: [], episodes: 140, runtime: 45, format: ['HD', '4K'],
    audio: ['pt'], dub: ['es'], subs: ['en', 'es'],
    poster: { g: 'graphite', l: 'split' },
    rights: [
      { terr: ['LATAM', 'EUROPE'], excl: ['BR'], veh: ['fta', 'cable', 'svod'], win: ['first', 'second'], lic: ['12m', '6m'], ex: ['nonexcl', 'excl'] }
    ]
  },
  {
    id: 'velvet-debts', demo: true, type: 'novela',
    title: { en: 'Velvet Debts', pt: 'Dívidas de Veludo' },
    genre: { en: 'Adult drama', pt: 'Drama adulto' },
    synopsis: {
      en: 'A nightclub owner borrows from the wrong people to keep the lights on. Explicit scenes and strong language: for adult schedules only.',
      pt: 'O dono de uma boate pede dinheiro às pessoas erradas para manter as luzes acesas. Cenas explícitas e linguagem forte: só para grades adultas.'
    },
    rating: '18', tags: [], episodes: 90, runtime: 45, format: ['HD'],
    audio: ['pt'], dub: [], subs: ['en', 'es'],
    poster: { g: 'black', l: 'center' },
    rights: [
      { terr: ['WORLD'], excl: [], veh: ['fta', 'cable', 'dth', 'iptv', 'svod', 'avod'], win: ['first', 'second', 'library'], lic: ['12m', '6m'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'dispatch-40', demo: true, type: 'series',
    title: { en: 'Dispatch 40', pt: 'Central 40' },
    genre: { en: 'Crime drama, 2 seasons', pt: 'Drama policial, 2 temporadas' },
    synopsis: {
      en: 'The night shift at an emergency dispatch centre hears the city at its worst. Each episode follows one call from the first ring to the last siren.',
      pt: 'O turno da noite de uma central de emergência ouve a cidade no seu pior momento. Cada episódio acompanha uma chamada, do primeiro toque à última sirene.'
    },
    rating: '16', tags: [], episodes: 20, runtime: 50, format: ['HD', '4K'],
    audio: ['pt'], dub: ['en', 'es'], subs: ['en', 'es', 'fr'],
    poster: { g: 'black', l: 'numeral' },
    rights: [
      { terr: ['WORLD'], excl: [], veh: ['svod', 'avod', 'cable'], win: ['first', 'catchup'], lic: ['12m'], ex: ['nonexcl', 'excl'] }
    ]
  },
  {
    id: 'low-tide-clinic', demo: true, type: 'series',
    title: { en: 'Low Tide Clinic', pt: 'Clínica da Maré Baixa' },
    genre: { en: 'Medical drama', pt: 'Drama médico' },
    synopsis: {
      en: 'A young doctor takes the only post nobody wanted: a river clinic reachable by boat twice a day. Thirty episodes, thirty patients, one stubborn town.',
      pt: 'Uma jovem médica aceita o posto que ninguém queria: uma clínica ribeirinha que só se alcança de barco, duas vezes por dia. Trinta episódios, trinta pacientes, uma cidade teimosa.'
    },
    rating: '14', tags: [], episodes: 30, runtime: 45, format: ['HD'],
    audio: ['pt'], dub: ['es', 'en'], subs: ['en', 'es'],
    poster: { g: 'white', l: 'frame' },
    rights: [
      { terr: ['NORAM', 'LATAM'], excl: [], veh: ['svod', 'avod', 'cable'], win: ['first', 'second'], lic: ['12m', '6m'], ex: ['nonexcl', 'excl'] }
    ]
  },
  {
    id: 'quiet-frequency', demo: true, type: 'series',
    title: { en: 'The Quiet Frequency', pt: 'A Frequência Silenciosa' },
    genre: { en: 'Mystery', pt: 'Mistério' },
    synopsis: {
      en: 'A radio engineer at a remote relay station picks up a broadcast that should not exist. Ten tight episodes; the answer is in the last one.',
      pt: 'Um engenheiro de rádio numa estação repetidora isolada capta uma transmissão que não deveria existir. Dez episódios enxutos; a resposta está no último.'
    },
    rating: '14', tags: [], episodes: 10, runtime: 50, format: ['HD', '4K'],
    audio: ['en'], dub: ['es'], subs: ['pt', 'es', 'fr'],
    poster: { g: 'steel', l: 'meter' },
    rights: [
      { terr: ['WORLD'], excl: ['US'], veh: ['fta', 'cable', 'dth', 'iptv', 'svod', 'avod'], win: ['first', 'second'], lic: ['12m', '6m'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'ninth-bridge', demo: true, type: 'film',
    title: { en: 'The Ninth Bridge', pt: 'A Nona Ponte' },
    genre: { en: 'Drama, feature film', pt: 'Drama, longa-metragem' },
    synopsis: {
      en: 'An old ferryman refuses to leave the river the day the ninth bridge opens. His granddaughter has one afternoon to change his mind.',
      pt: 'Um velho balseiro se recusa a deixar o rio no dia em que a nona ponte é inaugurada. A neta tem uma tarde para fazê-lo mudar de ideia.'
    },
    rating: '12', tags: ['family'], episodes: 1, runtime: 104, format: ['HD', '4K'],
    audio: ['pt'], dub: ['es'], subs: ['en', 'es', 'fr'],
    poster: { g: 'mist', l: 'center' },
    rights: [
      { terr: ['WORLD'], excl: [], veh: ['fta', 'cable', 'dth', 'svod', 'avod'], win: ['first', 'second', 'library'], lic: ['12m', '6m', 'single'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'lantern-season', demo: true, type: 'film',
    title: { en: 'Lantern Season', pt: 'Tempo de Lanternas' },
    genre: { en: 'Family film', pt: 'Filme familiar' },
    synopsis: {
      en: 'A choir of misfits has one December to save their village chapel. Warm, funny and safe for the whole family.',
      pt: 'Um coral de desajustados tem um único dezembro para salvar a capela da vila. Leve, engraçado e para toda a família.'
    },
    rating: 'L', tags: ['family', 'faith-safe'], episodes: 1, runtime: 92, format: ['HD'],
    audio: ['pt'], dub: ['en', 'es'], subs: ['en', 'es'],
    poster: { g: 'orange', l: 'stack' },
    rights: [
      { terr: ['AFRICA', 'NORAM', 'EUROPE'], excl: [], veh: ['fta', 'dth', 'svod', 'avod'], win: ['first', 'second'], lic: ['single', '12m'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'red-dust-highway', demo: true, type: 'film',
    title: { en: 'Red Dust Highway', pt: 'Rodovia de Poeira Vermelha' },
    genre: { en: 'Action, feature film', pt: 'Ação, longa-metragem' },
    synopsis: {
      en: 'Two truckers, one stolen load and 2,000 km of unpaved road. Violence and strong language.',
      pt: 'Dois caminhoneiros, uma carga roubada e 2.000 km de estrada de terra. Violência e linguagem forte.'
    },
    rating: '16', tags: [], episodes: 1, runtime: 110, format: ['HD', '4K'],
    audio: ['pt'], dub: ['es'], subs: ['en', 'es'],
    poster: { g: 'graphite', l: 'band' },
    rights: [
      { terr: ['LATAM', 'NORAM'], excl: [], veh: ['svod', 'avod', 'cable'], win: ['first', 'second'], lic: ['12m', '6m', 'single'], ex: ['nonexcl', 'excl'] }
    ]
  },
  {
    id: 'number-seven-night', demo: true, type: 'film',
    title: { en: 'Number Seven, Night', pt: 'Número Sete, Noite' },
    genre: { en: 'Erotic thriller', pt: 'Thriller erótico' },
    synopsis: {
      en: 'A hotel night manager and a guest who never checks out. Explicit content: adult schedules only.',
      pt: 'Um gerente noturno de hotel e uma hóspede que nunca faz o check-out. Conteúdo explícito: só para grades adultas.'
    },
    rating: '18', tags: [], episodes: 1, runtime: 98, format: ['HD'],
    audio: ['pt'], dub: [], subs: ['en', 'es'],
    poster: { g: 'black', l: 'split' },
    rights: [
      { terr: ['WORLD'], excl: [], veh: ['fta', 'cable', 'dth', 'iptv', 'svod', 'avod'], win: ['first', 'library'], lic: ['12m', '6m', 'single'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'rivers-that-carry-us', demo: true, type: 'documentary',
    title: { en: 'Rivers That Carry Us', pt: 'Rios Que Nos Levam' },
    genre: { en: 'Documentary series, nature and people', pt: 'Série documental, natureza e gente' },
    synopsis: {
      en: 'Eight rivers, eight communities that live by them. Shot in 4K over a full year of floods and droughts.',
      pt: 'Oito rios, oito comunidades que vivem deles. Filmado em 4K ao longo de um ano inteiro de cheias e secas.'
    },
    rating: 'L', tags: ['family', 'faith-safe'], episodes: 8, runtime: 52, format: ['HD', '4K'],
    audio: ['pt'], dub: ['en', 'es'], subs: ['en', 'es', 'fr'],
    poster: { g: 'white', l: 'frame' },
    rights: [
      { terr: ['WORLD'], excl: [], veh: ['fta', 'cable', 'dth', 'iptv', 'svod', 'avod'], win: ['first', 'second', 'library'], lic: ['12m', '6m'], ex: ['nonexcl', 'excl'] }
    ]
  },
  {
    id: 'stone-choirs', demo: true, type: 'documentary',
    title: { en: 'Stone Choirs', pt: 'Coros de Pedra' },
    genre: { en: 'Documentary, sacred music', pt: 'Documentário, música sacra' },
    synopsis: {
      en: 'Six church choirs in six old stone towns prepare for one shared Easter concert. The voices, the rehearsals and the people behind them.',
      pt: 'Seis corais de igreja em seis cidades antigas de pedra se preparam para um único concerto de Páscoa. As vozes, os ensaios e as pessoas por trás deles.'
    },
    rating: 'L', tags: ['faith-safe', 'family'], episodes: 6, runtime: 26, format: ['HD', '4K'],
    audio: ['pt'], dub: ['en'], subs: ['en', 'es', 'fr'],
    poster: { g: 'mist', l: 'meter' },
    rights: [
      { terr: ['AFRICA', 'EUROPE', 'LATAM'], excl: [], veh: ['fta', 'dth', 'cable', 'iptv'], win: ['first', 'second'], lic: ['12m', '6m', 'single'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'long-pilgrimage', demo: true, type: 'documentary',
    title: { en: 'The Long Pilgrimage', pt: 'A Longa Peregrinação' },
    genre: { en: 'Documentary series, faith', pt: 'Série documental, fé' },
    synopsis: {
      en: 'Ten pilgrims walk ten historic routes of faith on foot. What they carry, what they leave behind, and who they meet on the road.',
      pt: 'Dez peregrinos percorrem a pé dez rotas históricas de fé. O que carregam, o que deixam para trás e quem encontram no caminho.'
    },
    rating: 'L', tags: ['faith-safe', 'family'], episodes: 10, runtime: 45, format: ['HD'],
    audio: ['pt'], dub: ['en', 'es'], subs: ['en', 'es'],
    poster: { g: 'paper', l: 'frame' },
    rights: [
      { terr: ['WORLD'], excl: [], veh: ['fta', 'cable', 'dth', 'iptv', 'avod'], win: ['first', 'library'], lic: ['12m', '6m'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'engines-of-the-coast', demo: true, type: 'documentary',
    title: { en: 'Engines of the Coast', pt: 'Motores da Costa' },
    genre: { en: 'Factual series, machines', pt: 'Série factual, máquinas' },
    synopsis: {
      en: 'The ports, rail yards and shipyards that keep a coastline moving, and the crews who work them through the night.',
      pt: 'Os portos, pátios ferroviários e estaleiros que mantêm o litoral em movimento, e as equipes que os operam noite adentro.'
    },
    rating: '10', tags: [], episodes: 12, runtime: 26, format: ['HD'],
    audio: ['pt'], dub: [], subs: ['en', 'es'],
    poster: { g: 'graphite', l: 'numeral' },
    rights: [
      { terr: ['LATAM', 'NORAM', 'EUROPE'], excl: [], veh: ['svod', 'avod', 'cable'], win: ['first', 'second', 'library'], lic: ['12m', '6m'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'build-it-by-sunday', demo: true, type: 'reality',
    title: { en: 'Build It by Sunday', pt: 'Pronto até Domingo' },
    genre: { en: 'Home makeover reality', pt: 'Reality de reforma' },
    synopsis: {
      en: 'A neighbourhood crew has six days to rebuild a family home before the Sunday reveal. Twenty homes, twenty families.',
      pt: 'Uma equipe do bairro tem seis dias para reconstruir a casa de uma família antes da revelação de domingo. Vinte casas, vinte famílias.'
    },
    rating: 'L', tags: ['family'], episodes: 20, runtime: 45, format: ['HD'],
    audio: ['pt'], dub: ['es'], subs: ['en', 'es'],
    poster: { g: 'paper', l: 'blocks' },
    rights: [
      { terr: ['AFRICA', 'LATAM', 'LUSO'], excl: [], veh: ['fta', 'cable', 'dth'], win: ['first', 'second'], lic: ['12m', '6m'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'last-workshop', demo: true, type: 'reality',
    title: { en: 'The Last Workshop', pt: 'A Última Oficina' },
    genre: { en: 'Craft competition', pt: 'Competição de ofícios' },
    synopsis: {
      en: 'Twelve craftspeople, one workshop, one maker leaves each week. Woodwork, metal and leather judged by masters of each trade.',
      pt: 'Doze artesãos, uma oficina, um sai a cada semana. Madeira, metal e couro julgados por mestres de cada ofício.'
    },
    rating: '10', tags: ['family'], episodes: 12, runtime: 60, format: ['HD', '4K'],
    audio: ['pt'], dub: ['es', 'en'], subs: ['en', 'es'],
    poster: { g: 'white', l: 'split' },
    rights: [
      { terr: ['NORAM', 'EUROPE', 'LATAM', 'APAC'], excl: [], veh: ['fta', 'cable', 'dth', 'iptv', 'svod', 'avod'], win: ['first', 'second'], lic: ['12m'], ex: ['nonexcl', 'excl'] }
    ]
  },
  {
    id: 'pip-paper-boats', demo: true, type: 'kids',
    title: { en: 'Pip and the Paper Boats', pt: 'Pip e os Barcos de Papel' },
    genre: { en: 'Animation, ages 3–6', pt: 'Animação, 3 a 6 anos' },
    synopsis: {
      en: 'Pip folds a new paper boat every morning and sails it somewhere new. Gentle stories about sharing, weather and small brave things.',
      pt: 'Pip dobra um barco de papel novo toda manhã e o leva a um lugar diferente. Histórias delicadas sobre dividir, o tempo e pequenas coragens.'
    },
    rating: 'L', tags: ['kids', 'family', 'faith-safe'], episodes: 52, runtime: 11, format: ['HD', '4K'],
    audio: ['pt'], dub: ['en', 'es', 'fr'], subs: ['en'],
    poster: { g: 'deep', l: 'blocks' },
    rights: [
      { terr: ['WORLD'], excl: [], veh: ['fta', 'cable', 'dth', 'iptv', 'svod', 'avod'], win: ['first', 'second', 'library'], lic: ['12m', '6m'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'tiny-orchestra', demo: true, type: 'kids',
    title: { en: 'Tiny Orchestra', pt: 'Pequena Orquestra' },
    genre: { en: 'Live-action kids music', pt: 'Musical infantil' },
    synopsis: {
      en: 'Five kids, five instruments and a music teacher who believes every noise is a note. One song learned per episode.',
      pt: 'Cinco crianças, cinco instrumentos e um professor que acha que todo barulho é uma nota. Uma música aprendida por episódio.'
    },
    rating: 'L', tags: ['kids', 'family', 'faith-safe'], episodes: 26, runtime: 22, format: ['HD'],
    audio: ['pt'], dub: ['en', 'es'], subs: ['en'],
    poster: { g: 'mist', l: 'blocks' },
    rights: [
      { terr: ['AFRICA', 'LATAM'], excl: [], veh: ['fta', 'dth', 'iptv', 'avod'], win: ['first', 'second'], lic: ['12m', '6m'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'choir-nights', demo: true, type: 'music',
    title: { en: 'Choir Nights', pt: 'Noites de Coral' },
    genre: { en: 'Gospel concert specials', pt: 'Especiais de música gospel' },
    synopsis: {
      en: 'Twelve one-hour concerts by gospel choirs and soloists, recorded live with a full audience. Ready for weekend and holiday slots.',
      pt: 'Doze concertos de uma hora com corais e solistas gospel, gravados ao vivo com plateia. Prontos para faixas de fim de semana e feriados.'
    },
    rating: 'L', tags: ['faith-safe', 'family'], episodes: 12, runtime: 60, format: ['HD', '4K'],
    audio: ['pt'], dub: [], subs: ['en', 'es'],
    poster: { g: 'black', l: 'meter' },
    rights: [
      { terr: ['WORLD'], excl: [], veh: ['fta', 'cable', 'dth', 'iptv', 'svod', 'avod'], win: ['first', 'second', 'library'], lic: ['12m', '6m', 'single'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'rooftop-sessions', demo: true, type: 'music',
    title: { en: 'Rooftop Sessions', pt: 'Sessões no Terraço' },
    genre: { en: 'Music performance show', pt: 'Programa musical' },
    synopsis: {
      en: 'New bands play three songs on a city rooftop at sunset, then talk about how they wrote them.',
      pt: 'Bandas novas tocam três músicas num terraço da cidade ao pôr do sol e contam como as compuseram.'
    },
    rating: '12', tags: [], episodes: 16, runtime: 30, format: ['HD', '4K'],
    audio: ['pt', 'en'], dub: [], subs: ['en', 'es'],
    poster: { g: 'orange', l: 'numeral' },
    rights: [
      { terr: ['NORAM', 'EUROPE'], excl: [], veh: ['svod', 'avod'], win: ['first', 'library'], lic: ['12m', '6m'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'psalms-at-dawn', demo: true, type: 'faith',
    title: { en: 'Psalms at Dawn', pt: 'Salmos ao Amanhecer' },
    genre: { en: 'Daily devotional', pt: 'Devocional diário' },
    synopsis: {
      en: 'A short daily reading and reflection filmed at sunrise in quiet places. Built to open a morning schedule, Monday to Saturday.',
      pt: 'Uma leitura e reflexão diária curta, filmada ao nascer do sol em lugares tranquilos. Feita para abrir a grade da manhã, de segunda a sábado.'
    },
    rating: 'L', tags: ['faith-safe', 'family'], episodes: 130, runtime: 15, format: ['HD'],
    audio: ['pt'], dub: ['en', 'es'], subs: ['en', 'es', 'fr'],
    poster: { g: 'paper', l: 'center' },
    rights: [
      { terr: ['WORLD'], excl: [], veh: ['fta', 'cable', 'dth', 'iptv', 'avod'], win: ['first', 'second', 'library'], lic: ['12m', '6m'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'bread-for-the-road', demo: true, type: 'faith',
    title: { en: 'Bread for the Road', pt: 'Pão para a Estrada' },
    genre: { en: 'Faith talk show', pt: 'Programa de entrevistas, fé' },
    synopsis: {
      en: 'Each week a host shares a table with a guest whose faith carried them through a hard year. Half an hour, no studio audience.',
      pt: 'A cada semana o apresentador divide a mesa com um convidado cuja fé o sustentou num ano difícil. Meia hora, sem plateia.'
    },
    rating: 'L', tags: ['faith-safe', 'family'], episodes: 52, runtime: 30, format: ['HD'],
    audio: ['pt'], dub: ['en'], subs: ['en', 'es'],
    poster: { g: 'graphite', l: 'stack' },
    rights: [
      { terr: ['AFRICA', 'LUSO', 'EUROPE'], excl: [], veh: ['fta', 'dth', 'cable', 'iptv'], win: ['first', 'second'], lic: ['12m', '6m', 'single'], ex: ['nonexcl'] }
    ]
  },
  {
    id: 'grappling-nights', demo: true, type: 'sports',
    title: { en: 'Grappling Nights', pt: 'Noites de Grappling' },
    genre: { en: 'Jiu-jitsu event series', pt: 'Série de eventos de jiu-jítsu' },
    synopsis: {
      en: 'Twenty fight nights of submission grappling, with full undercards, commentary in two languages and post-fight interviews.',
      pt: 'Vinte noites de luta de grappling, com cards completos, narração em duas línguas e entrevistas pós-luta.'
    },
    rating: '12', tags: [], episodes: 20, runtime: 90, format: ['HD', '4K'],
    audio: ['pt', 'en'], dub: [], subs: ['es'],
    poster: { g: 'steel', l: 'split' },
    rights: [
      { terr: ['WORLD'], excl: [], veh: ['fta', 'cable', 'dth', 'iptv', 'svod', 'avod'], win: ['first', 'second'], lic: ['6m', 'single'], ex: ['nonexcl', 'excl'] }
    ]
  }
];

/* Demonstration packages: ready-made blocks a programming director can take as one deal.
   Only the titles cleared for the buyer's profile count toward a package. */
window.I9S_PACKAGES = [
  {
    id: 'faith-family-weeknights', demo: true,
    name: { en: 'Faith & Family Weeknights', pt: 'Fé e Família nas Noites' },
    blurb: { en: 'Drama, documentary and music for an evening faith block.', pt: 'Drama, documentário e música para um bloco noturno de fé.' },
    titles: ['second-harvest', 'long-pilgrimage', 'stone-choirs', 'choir-nights', 'bread-for-the-road']
  },
  {
    id: 'weekend-documentary', demo: true,
    name: { en: 'Weekend Documentary Block', pt: 'Bloco de Documentários de Fim de Semana' },
    blurb: { en: 'Factual series in 26 and 52-minute cuts.', pt: 'Séries factuais em cortes de 26 e 52 minutos.' },
    titles: ['rivers-that-carry-us', 'engines-of-the-coast', 'stone-choirs', 'long-pilgrimage']
  },
  {
    id: 'kids-morning', demo: true,
    name: { en: 'Kids Morning Block', pt: 'Bloco Infantil da Manhã' },
    blurb: { en: 'Short episodes that stack two or more to a slot.', pt: 'Episódios curtos que cabem dois ou mais por faixa.' },
    titles: ['pip-paper-boats', 'tiny-orchestra']
  },
  {
    id: 'prime-time-drama', demo: true,
    name: { en: 'Prime-time Drama', pt: 'Drama no Horário Nobre' },
    blurb: { en: 'Long-running novelas and series for the evening.', pt: 'Novelas e séries longas para a noite.' },
    titles: ['house-of-tides', 'second-harvest', 'dispatch-40', 'low-tide-clinic', 'velvet-debts']
  }
];
