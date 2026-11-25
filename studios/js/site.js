/* i9 Studios — site behaviour: chrome + i18n boot, hero program cut, poster wall, schedule-filler
   teaser, reveals. No analytics, no network calls. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function boot() {
    if (window.I9S_renderChrome) I9S_renderChrome();
    drawPosters();
    hero();
    teaser();
    reveals();
    if (window.I9S) I9S.apply();
  }

  function drawPosters() {
    var C = window.I9S_CATALOG; if (!C || !window.I9S_poster) return;
    var wall = document.getElementById('wall');
    if (wall) {
      var order = [], safe = C.filter(function (t) { return t.rating !== '18'; });
      for (var i = 0; i < 32; i++) order.push(safe[(i * 7) % safe.length]);
      wall.innerHTML = order.map(function (t) { return I9S_poster(t); }).join('');
    }
    var mini = document.getElementById('mini');
    if (mini) {
      var g = { black: '#0a0a0a', graphite: '#1d1d1c', steel: '#5c5c58', paper: '#f7f6f2', white: '#fff', deep: '#e6e4dc', mist: '#dad9d3', orange: '#f53c00' };
      mini.innerHTML = C.slice(0, 8).map(function (t) { return '<i style="background:' + g[t.poster.g] + '"></i>'; }).join('');
    }
    var pick = function (ids) { return ids.map(function (id) { return C.filter(function (t) { return t.id === id; })[0]; }).filter(Boolean); };
    var shelf = document.getElementById('inst-shelf');
    if (shelf) shelf.innerHTML = pick(['second-harvest', 'long-pilgrimage', 'choir-nights', 'stone-choirs', 'bread-for-the-road']).map(function (t) { return I9S_poster(t); }).join('');
    var js = document.getElementById('jobshelf');
    if (js) js.innerHTML = pick(['house-of-tides', 'rivers-that-carry-us', 'lantern-season', 'dispatch-40', 'pip-paper-boats', 'choir-nights']).map(function (t) { return I9S_poster(t); }).join('');
  }

  function hero() {
    var h = document.querySelector('.hero'); if (!h) return;
    var srcs = h.querySelectorAll('.src'), words = h.querySelectorAll('.triad .w'), bus = h.querySelectorAll('.bus button');
    var caps = h.querySelectorAll('[data-cap]'), slate = document.getElementById('slate-src');
    var names = ['PRODUCE', 'DISTRIBUTE', 'GO LIVE'];
    var cur = 0, timer = null, DUR = 6000;
    h.style.setProperty('--dur', DUR / 1000 + 's');
    function cut(n, user) {
      cur = n;
      srcs.forEach(function (s, i) { s.classList.toggle('on', i === n); });
      words.forEach(function (w, i) { w.classList.toggle('on', i === n); });
      bus.forEach(function (b, i) {
        b.setAttribute('aria-pressed', i === n ? 'true' : 'false');
        var p = b.querySelector('.prog'); if (p) { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; }
      });
      caps.forEach(function (c) { c.hidden = c.getAttribute('data-cap') !== String(n); });
      if (slate) slate.textContent = 'SRC ' + (n + 1) + ' · ' + names[n];
      if (user) restart();
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { cut((cur + 1) % 3); }, DUR); }
    bus.forEach(function (b) { b.addEventListener('click', function () { cut(+b.getAttribute('data-go'), true); }); });
    words.forEach(function (w) { w.addEventListener('click', function () { cut(+w.getAttribute('data-go'), true); }); });
    restart();
    // timecode: hh:mm:ss:ff, 25 fps, from page open
    var tc = document.getElementById('tc'), t0 = performance.now();
    function pad(x) { return String(x).padStart(2, '0'); }
    function tick() {
      var f = Math.floor((performance.now() - t0) / 40);
      var ff = f % 25, s = Math.floor(f / 25) % 60, m = Math.floor(f / 1500) % 60;
      if (tc) tc.textContent = '10:' + pad(m) + ':' + pad(s) + ':' + pad(ff);
      if (!reduce) requestAnimationFrame(tick);
    }
    tick();
  }

  function teaser() {
    var w = document.getElementById('inst-weeks'); if (!w) return;
    var filled = 24, total = 26;
    w.innerHTML = new Array(total + 1).join('<i></i>');
    var cells = w.querySelectorAll('i');
    function run() {
      cells.forEach(function (c, i) {
        setTimeout(function () { c.classList.add(i < filled ? 'f' : 'x'); if (i === filled - 1) c.classList.add('now'); setTimeout(function () { c.classList.remove('now'); }, 600); }, reduce ? 0 : 400 + i * 45);
      });
    }
    if (!('IntersectionObserver' in window) || reduce) { run(); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run(); io.disconnect(); } }); }, { threshold: .4 });
    io.observe(w);
  }

  function reveals() {
    var els = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach(function (e) { io.observe(e); });
  }

  document.addEventListener('i9s:lang', function () { drawPosters(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
