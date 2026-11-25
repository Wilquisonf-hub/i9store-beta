/* i9 Studios marketplace: reference lists used by registration, matching and the rights tables.
   Territory codes are ISO 3166-1 alpha-2. Regions are rights groupings a licence can name instead of
   listing countries (WORLD, AFRICA, SADC, LATAM, NORAM, EUROPE, MENA, APAC, LUSO = Portuguese-speaking).
   When i9 loads real rights, keep these codes so the matching code does not change. */
window.I9S_REF = {
  regions: {
    WORLD:  { en: 'Worldwide', pt: 'Mundo' },
    AFRICA: { en: 'Africa', pt: 'África' },
    SADC:   { en: 'Southern Africa (SADC)', pt: 'África Austral (SADC)' },
    LATAM:  { en: 'Latin America', pt: 'América Latina' },
    NORAM:  { en: 'North America', pt: 'América do Norte' },
    EUROPE: { en: 'Europe', pt: 'Europa' },
    MENA:   { en: 'Middle East & North Africa', pt: 'Oriente Médio e Norte da África' },
    APAC:   { en: 'Asia-Pacific', pt: 'Ásia-Pacífico' },
    LUSO:   { en: 'Portuguese-speaking countries', pt: 'Países de língua portuguesa' }
  },
  countries: [
    ['ZA', 'South Africa', 'África do Sul', ['AFRICA', 'SADC']],
    ['NA', 'Namibia', 'Namíbia', ['AFRICA', 'SADC']],
    ['BW', 'Botswana', 'Botsuana', ['AFRICA', 'SADC']],
    ['ZW', 'Zimbabwe', 'Zimbábue', ['AFRICA', 'SADC']],
    ['ZM', 'Zambia', 'Zâmbia', ['AFRICA', 'SADC']],
    ['MZ', 'Mozambique', 'Moçambique', ['AFRICA', 'SADC', 'LUSO']],
    ['AO', 'Angola', 'Angola', ['AFRICA', 'SADC', 'LUSO']],
    ['CV', 'Cabo Verde', 'Cabo Verde', ['AFRICA', 'LUSO']],
    ['NG', 'Nigeria', 'Nigéria', ['AFRICA']],
    ['GH', 'Ghana', 'Gana', ['AFRICA']],
    ['KE', 'Kenya', 'Quênia', ['AFRICA']],
    ['EG', 'Egypt', 'Egito', ['AFRICA', 'MENA']],
    ['US', 'United States', 'Estados Unidos', ['NORAM']],
    ['CA', 'Canada', 'Canadá', ['NORAM']],
    ['MX', 'Mexico', 'México', ['LATAM']],
    ['GT', 'Guatemala', 'Guatemala', ['LATAM']],
    ['DO', 'Dominican Republic', 'República Dominicana', ['LATAM']],
    ['CO', 'Colombia', 'Colômbia', ['LATAM']],
    ['PE', 'Peru', 'Peru', ['LATAM']],
    ['CL', 'Chile', 'Chile', ['LATAM']],
    ['AR', 'Argentina', 'Argentina', ['LATAM']],
    ['BR', 'Brazil', 'Brasil', ['LATAM', 'LUSO']],
    ['PT', 'Portugal', 'Portugal', ['EUROPE', 'LUSO']],
    ['ES', 'Spain', 'Espanha', ['EUROPE']],
    ['GB', 'United Kingdom', 'Reino Unido', ['EUROPE']],
    ['FR', 'France', 'França', ['EUROPE']],
    ['IT', 'Italy', 'Itália', ['EUROPE']],
    ['DE', 'Germany', 'Alemanha', ['EUROPE']],
    ['AE', 'United Arab Emirates', 'Emirados Árabes Unidos', ['MENA']],
    ['PH', 'Philippines', 'Filipinas', ['APAC']],
    ['IN', 'India', 'Índia', ['APAC']],
    ['ID', 'Indonesia', 'Indonésia', ['APAC']],
    ['KR', 'South Korea', 'Coreia do Sul', ['APAC']],
    ['AU', 'Australia', 'Austrália', ['APAC']]
  ],
  languages: {
    en: { en: 'English', pt: 'Inglês' },
    pt: { en: 'Portuguese', pt: 'Português' },
    es: { en: 'Spanish', pt: 'Espanhol' },
    fr: { en: 'French', pt: 'Francês' },
    af: { en: 'Afrikaans', pt: 'Africâner' },
    zu: { en: 'Zulu', pt: 'Zulu' },
    sw: { en: 'Swahili', pt: 'Suaíli' },
    ar: { en: 'Arabic', pt: 'Árabe' },
    de: { en: 'German', pt: 'Alemão' },
    it: { en: 'Italian', pt: 'Italiano' }
  },
  vehicles: {
    fta:   { en: 'Free-to-air TV', pt: 'TV aberta', s: 'FTA' },
    cable: { en: 'Cable TV', pt: 'TV a cabo', s: 'Cable' },
    dth:   { en: 'Satellite DTH', pt: 'Satélite DTH', s: 'DTH' },
    iptv:  { en: 'IPTV', pt: 'IPTV', s: 'IPTV' },
    svod:  { en: 'OTT / SVOD', pt: 'OTT / SVOD', s: 'SVOD' },
    avod:  { en: 'AVOD / FAST', pt: 'AVOD / FAST', s: 'AVOD' }
  },
  profiles: {
    general: { en: 'General entertainment', pt: 'Entretenimento geral' },
    faith:   { en: 'Religious / faith', pt: 'Religioso / fé' },
    kids:    { en: 'Kids & family', pt: 'Infantil e família' },
    factual: { en: 'Documentary & factual', pt: 'Documentário e factual' },
    news:    { en: 'News & talk', pt: 'Jornalismo e debate' },
    sports:  { en: 'Sports', pt: 'Esportes' },
    music:   { en: 'Music', pt: 'Música' },
    lifestyle: { en: 'Lifestyle', pt: 'Estilo de vida' }
  },
  types: {
    novela:      { en: 'Novela', pt: 'Novela' },
    series:      { en: 'Series', pt: 'Série' },
    film:        { en: 'Film', pt: 'Filme' },
    documentary: { en: 'Documentary', pt: 'Documentário' },
    reality:     { en: 'Reality', pt: 'Reality' },
    kids:        { en: 'Kids & animation', pt: 'Infantil e animação' },
    music:       { en: 'Music & shows', pt: 'Música e shows' },
    faith:       { en: 'Faith', pt: 'Fé' },
    sports:      { en: 'Sports', pt: 'Esportes' },
    magazine:    { en: 'Magazine & lifestyle', pt: 'Revista e estilo de vida' }
  },
  windows: {
    first:   { en: 'First run', pt: 'Primeira exibição' },
    second:  { en: 'Second run', pt: 'Segunda exibição' },
    library: { en: 'Library', pt: 'Acervo' },
    catchup: { en: 'Catch-up (7 days)', pt: 'Catch-up (7 dias)' }
  },
  licences: {
    '12m':    { en: '1-year licence', pt: 'Licença de 1 ano' },
    '6m':     { en: '6-month licence', pt: 'Licença de 6 meses' },
    'single': { en: 'Single insertion', pt: 'Inserção única' }
  },
  exclusivity: {
    nonexcl: { en: 'Non-exclusive', pt: 'Não exclusivo' },
    excl:    { en: 'Exclusive', pt: 'Exclusivo' }
  },
  ratings: {
    L:  { en: 'All ages', pt: 'Livre' },
    '10': { en: '10+', pt: '10+' },
    '12': { en: '12+', pt: '12+' },
    '14': { en: '14+', pt: '14+' },
    '16': { en: '16+', pt: '16+' },
    '18': { en: '18+ adult', pt: '18+ adulto' }
  }
};
