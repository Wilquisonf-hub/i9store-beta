/* Typographic posters for demonstration titles: type and flat brand colour fields only.
   No photographs, no fake key art. Every poster carries a DEMO tag while title.demo is true. */
(function () {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function lang() { return (window.I9S && I9S.lang) || 'en'; }
  function poster(t, opts) {
    opts = opts || {};
    var L = lang(), R = window.I9S_REF;
    var name = t.title[L] || t.title.en;
    var type = R.types[t.type][L];
    var fmt = !t.episodes ? '' : (t.episodes > 1 ? t.episodes + ' × ' + t.runtime + '′' : t.runtime + '′');
    var p = t.poster || { g: 'black', l: 'stack' };
    if (t.photos && t.photos.length) {
      /* real title: its own cleared photo, its credit tag (AN i9 ORIGINAL or i9 CO-PRODUCTION), never DEMO */
      return '<span class="poster g-black l-photo' + (t.credit ? ' ' + t.credit : '') + '"' + (opts.label ? ' role="img" aria-label="' + esc(name) + ' poster"' : ' aria-hidden="true"') + '>' +
        '<img src="img/' + t.photos[opts.photo || 0] + '.webp" alt="" loading="lazy">' +
        '<span class="pk">' + esc(type) + '</span>' +
        (t.creditTag ? '<span class="otag ' + (t.credit || '') + '">' + esc(t.creditTag) + '</span>' : '') +
        '<span class="pt">' + esc(name) + '</span>' +
        '<span class="ps">i9 STUDIOS</span></span>';
    }
    var extra = '';
    if (p.l === 'numeral') extra = '<span class="big" aria-hidden="true">' + (t.episodes > 1 ? String(t.episodes).padStart(2, '0') : '1') + '</span>';
    if (p.l === 'frame') extra = '<span class="fx" aria-hidden="true"></span>';
    if (p.l === 'split') extra = '<span class="vt" aria-hidden="true">' + esc(type) + '</span>';
    if (p.l === 'blocks') extra = '<span class="bk" aria-hidden="true">' + new Array(13).join('<i></i>') + '</span>';
    if (p.l === 'meter') {
      var h = [38, 62, 48, 84, 100, 70, 54, 76, 44, 30];
      extra = '<span class="mt" aria-hidden="true">' + h.map(function (x) { return '<i style="height:' + x + '%"></i>'; }).join('') + '</span>';
    }
    return '<span class="poster g-' + p.g + ' l-' + p.l + '"' + (opts.label ? ' role="img" aria-label="' + esc(name) + ' poster"' : ' aria-hidden="true"') + '>' +
      extra +
      '<span class="pk">' + esc(type) + '<br>' + fmt + '</span>' +
      (t.demo ? '<span class="demo">DEMO</span>' : '') +
      '<span class="pt">' + esc(name) + '</span>' +
      '<span class="ps">i9 STUDIOS</span>' +
      '</span>';
  }
  window.I9S_poster = poster;
})();
