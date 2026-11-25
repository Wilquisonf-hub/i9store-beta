/* i9 Studios — shared chrome: group bar, nav, mobile sheet, contact and footer.
   Text carries data-i18n keys; English is inline, Portuguese lives in js/i18n.js.
   Contact data is the group's published contact (i9tv.com.br): +55 11 3392-7878, contato@i9tv.com.br,
   Mon–Fri 09:00–18:00 Brasília time. No analytics, no third-party requests besides Google Fonts. */
(function () {
  var WA = 'https://wa.me/551133927878';
  var STORE = 'https://wilquisonf-hub.github.io/i9store-beta/e/index.html';
  var ICON = {
    wa: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.4 18.6z"/><path d="M9 8.6c0 3.4 3 6.4 6.4 6.4l1.1-1.6-2-1-1 .9a5 5 0 0 1-2.7-2.7l.9-1-1-2z" stroke-width="1.2"/></svg>',
    arrow: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    out: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16L17 7M9 7h8v8"/></svg>',
    list: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16H6zM9 9h6M9 13h6M9 17h3"/></svg>'
  };
  window.I9S_ICON = ICON;

  function topHTML(cur, i9tvHref) {
    var links = [
      ['produce', 'produce.html', 'c.nav.produce', 'Produce'],
      ['distribute', 'market.html', 'c.nav.distribute', 'Distribute'],
      ['events', 'events.html', 'c.nav.events', 'Events &amp; shows'],
      ['facilities', 'facilities.html', 'c.nav.facilities', 'Facilities']
    ];
    var nav = links.map(function (l) {
      var extra = l[0] === 'distribute' ? ' <span class="new" data-i18n="c.nav.market">Content marketplace</span>' : '';
      return '<a href="' + l[1] + '"' + (cur === l[0] ? ' aria-current="page"' : '') + '><span data-i18n="' + l[2] + '">' + l[3] + '</span>' + extra + '</a>';
    }).join('');
    var sheet = links.map(function (l) {
      return '<a href="' + l[1] + '"><span data-i18n="' + l[2] + '">' + l[3] + '</span>' + ICON.arrow + '</a>';
    }).join('');
    return '' +
      '<a class="skip" href="#main" data-i18n="c.skip">Skip to content</a>' +
      '<div class="gbar"><div class="wrap">' +
        '<nav aria-label="i9 group" data-i18n-attr="aria-label:c.group">' +
          '<a href="https://i9tv.com.br">i9</a><span class="sep" aria-hidden="true"></span>' +
          '<a href="index.html" aria-current="page"><span class="tally" aria-hidden="true"></span>i9 Studios</a>' +
          '<a href="' + i9tvHref + '">i9TV</a>' +
          '<a href="' + STORE + '">i9Store</a>' +
        '</nav>' +
        '<span class="gline meta" data-i18n="c.line">From idea to signal.</span>' +
        '<div class="lang" role="group" aria-label="Language"><button type="button" data-lang="en" aria-pressed="true">EN</button><button type="button" data-lang="pt" aria-pressed="false">PT</button></div>' +
      '</div></div>' +
      '<header class="nav"><div class="wrap">' +
        '<a class="lockup" href="index.html" aria-label="i9 Studios home"><img src="img/i9-seal.webp" alt="" width="34" height="34"><span><b>i9<span>STUDIOS</span></b><small data-i18n="c.descriptor">i9 / Production</small></span></a>' +
        '<nav class="links" aria-label="i9 Studios">' + nav + '</nav>' +
        '<div class="right">' +
          '<a class="prop-link" href="proposal.html" id="prop-link" hidden>' + ICON.list + '<span data-i18n="c.proposal">Proposal</span><span class="ct" id="prop-ct">0</span></a>' +
          '<a class="talk" href="' + WA + '" rel="noopener">' + ICON.wa + '<span data-i18n="c.talk">Talk to i9 Studios</span></a>' +
          '<button class="burger" type="button" aria-expanded="false" aria-controls="sheet" aria-label="Menu"><i></i><i></i></button>' +
        '</div>' +
      '</div></header>' +
      '<div class="sheet" id="sheet">' + sheet +
        '<a href="proposal.html"><span data-i18n="c.proposal">Proposal</span>' + ICON.list + '</a>' +
        '<a class="btn sig" href="' + WA + '" rel="noopener">' + ICON.wa + '<span data-i18n="c.talk">Talk to i9 Studios</span></a>' +
      '</div>';
  }

  function bottomHTML(i9tvHref) {
    return '' +
      '<section class="band paper chapter" id="contact" aria-labelledby="contact-h"><div class="wrap contact">' +
        '<div>' +
          '<h2 id="contact-h" data-i18n="c.ct.h">Tell us what you’re making.</h2>' +
          '<p class="lede" data-i18n="c.ct.p">A show to produce, a schedule to fill, an event to put on air. One conversation; the right team answers.</p>' +
        '</div>' +
        '<ul class="clist">' +
          '<li><a href="' + WA + '" rel="noopener"><b>WhatsApp</b><span class="meta-s num">+55 11 3392-7878</span></a></li>' +
          '<li><a href="tel:+551133927878"><b data-i18n="c.ct.phone">Phone</b><span class="meta-s num" data-i18n="c.ct.hours">Mon–Fri, 09:00–18:00 BRT</span></a></li>' +
          '<li><a href="mailto:contato@i9tv.com.br"><b>Email</b><span class="meta-s">contato@i9tv.com.br</span></a></li>' +
          '<li><div><b>São Paulo · Manaus</b><span class="meta-s" data-i18n="c.ct.bases">Barra Funda studios · ENG crews</span></div></li>' +
        '</ul>' +
      '</div></section>' +
      '<footer class="band black foot"><div class="wrap">' +
        '<div class="top">' +
          '<div><p class="line" data-i18n="c.f.line">We produce it. We distribute it.<br>We put it on air.</p><p data-i18n="c.f.p">i9 Studios is the production house of the i9 group. i9TV owns the signal; i9Store owns the equipment flow.</p></div>' +
          '<div><h3 class="meta">i9 Studios</h3><ul>' +
            '<li><a href="produce.html" data-i18n="c.nav.produce">Produce</a></li>' +
            '<li><a href="market.html" data-i18n="c.nav.market">Content marketplace</a></li>' +
            '<li><a href="events.html" data-i18n="c.nav.events">Events &amp; shows</a></li>' +
            '<li><a href="facilities.html" data-i18n="c.nav.facilities">Facilities</a></li></ul></div>' +
          '<div><h3 class="meta" data-i18n="c.f.buyers">For broadcasters</h3><ul>' +
            '<li><a href="register.html" data-i18n="c.f.register">Register as a buyer</a></li>' +
            '<li><a href="catalog.html" data-i18n="c.f.catalog">Catalogue</a></li>' +
            '<li><a href="proposal.html" data-i18n="c.f.proposal">Proposal list</a></li></ul></div>' +
          '<div><h3 class="meta" data-i18n="c.f.group">i9 group</h3><ul>' +
            '<li><a href="https://i9tv.com.br">i9</a></li>' +
            '<li><a href="' + i9tvHref + '">i9TV</a></li>' +
            '<li><a href="' + STORE + '">i9Store</a></li></ul></div>' +
        '</div>' +
        '<div class="bot meta-s"><span data-i18n="c.f.legal">i9 Studios · São Paulo, Brazil · Photos are i9’s own projects and studios.</span><span data-i18n="c.f.proto">Design prototype · nothing on this site is sent anywhere</span></div>' +
      '</div></footer>';
  }

  function render() {
    var body = document.body;
    var cur = body.getAttribute('data-nav') || '';
    var pt = (window.I9S && I9S.lang === 'pt');
    var i9tvHref = pt ? 'https://i9tv.com.br/i9tv' : 'https://i9tv.com.br/en/i9tv';
    var top = document.getElementById('chrome-top');
    var bottom = document.getElementById('chrome-bottom');
    if (top) top.innerHTML = topHTML(cur, i9tvHref);
    if (bottom) bottom.innerHTML = bottomHTML(i9tvHref);

    var burger = document.querySelector('.burger'), sheet = document.getElementById('sheet');
    if (burger) burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      sheet.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.addEventListener('click', function () { I9S.setLang(b.getAttribute('data-lang')); });
    });
    updateProposalCount();
  }

  function updateProposalCount() {
    var n = 0;
    try { n = (JSON.parse(localStorage.getItem('i9s.proposal') || '[]') || []).length; } catch (e) { n = 0; }
    var link = document.getElementById('prop-link'), ct = document.getElementById('prop-ct');
    if (!link) return;
    var market = /^(distribute|market)$/.test(document.body.getAttribute('data-nav') || '');
    link.hidden = !(n > 0 || market);
    ct.textContent = n;
    ct.classList.toggle('on', n > 0);
  }
  window.I9S_updateProposalCount = updateProposalCount;

  document.addEventListener('i9s:lang', function () {
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === I9S.lang ? 'true' : 'false');
    });
    var pt = I9S.lang === 'pt';
    document.querySelectorAll('a[href*="i9tv.com.br/"][href$="/i9tv"]').forEach(function (a) {
      a.href = pt ? 'https://i9tv.com.br/i9tv' : 'https://i9tv.com.br/en/i9tv';
    });
  });

  window.I9S_renderChrome = render;
})();
