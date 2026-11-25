/* Beta version switcher: jumps between A/B/C on the same page (home, product, checkout). */
(function () {
  var parts = location.pathname.split('/');
  var file = parts.pop() || 'index.html';
  var cur = parts.pop();
  var common = ['index.html', 'product.html', 'checkout.html'];
  var versions = [['a', 'A · On Air'], ['b', 'B · Hey Will'], ['c', 'C · Hybrid'], ['d', 'D · Daylight'], ['e', 'E · Solutions'], ['f', 'F · Store + Pro']];
  var css = '#i9beta{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:2px;' +
    'background:#0A0A0A;color:#F7F6F2;font:500 12px/1 "PT Mono",ui-monospace,Menlo,monospace;letter-spacing:.04em;' +
    'border:1px solid rgba(247,246,242,.28);box-shadow:0 4px 8px rgba(0,0,0,.25)}' +
    '#i9beta a{color:inherit;text-decoration:none;padding:11px 12px;display:block}' +
    '#i9beta a:hover{background:rgba(247,246,242,.12)}' +
    '#i9beta a[aria-current]{background:#F53C00;color:#0A0A0A}' +
    '#i9beta a:focus-visible{outline:3px solid #F53C00;outline-offset:2px}' +
    '#i9beta .lbl{padding:11px 10px 11px 12px;opacity:.6}' +
    '@media (max-width:560px){#i9beta{left:8px;bottom:8px}#i9beta .lbl,#i9beta .long{display:none}#i9beta a{padding:12px 14px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var nav = document.createElement('nav'); nav.id = 'i9beta'; nav.setAttribute('aria-label', 'Design versions');
  var html = '<a class="lbl" href="../index.html" title="All versions">BETA</a>';
  versions.forEach(function (v) {
    var name = v[1].split(' · ');
    var target = (common.indexOf(file) >= 0 || v[0] === cur) ? file : 'index.html';
    html += '<a href="../' + v[0] + '/' + target + '"' + (v[0] === cur ? ' aria-current="page"' : '') + '>' +
      name[0] + '<span class="long"> · ' + name[1] + '</span></a>';
  });
  nav.innerHTML = html;
  document.body.appendChild(nav);
  /* Sit above any fixed or sticky bottom bar on the page (wizard footer, phone buy bar) so it never covers Back / Buy. */
  function lift() {
    var h = 0;
    document.querySelectorAll('body *').forEach(function (el) {
      if (el === nav || nav.contains(el)) return;
      var cs = getComputedStyle(el);
      if ((cs.position !== 'fixed' && cs.position !== 'sticky') || cs.display === 'none' || cs.visibility === 'hidden') return;
      var r = el.getBoundingClientRect();
      if (r.height > 0 && r.height < innerHeight * 0.4 && r.bottom >= innerHeight - 2 && r.width > innerWidth * 0.5) h = Math.max(h, innerHeight - r.top);
    });
    nav.style.bottom = (h ? h + 8 : (innerWidth <= 560 ? 8 : 16)) + 'px';
  }
  addEventListener('load', lift); addEventListener('resize', lift);
  setInterval(lift, 1000);
})();
