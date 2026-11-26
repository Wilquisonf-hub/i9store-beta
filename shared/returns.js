/* Return-policy line (owner 25 Nov 2026): 30 days from delivery or pickup, like B&H and Adorama. Holiday extension, same dates as
   B&H: items bought from Nov 1 through Jan 1 can be returned through Feb 1. Full policy text: MERCADOS-ARQUITETURA.md §11.5
   (draft, pending legal review). Fills every [data-returns] with the short line, and every [data-returns-season] with the
   holiday window that applies today (returns.html, 26 Nov 2026):
     Nov 1 – Jan 1  "open": buying now falls inside the window;
     Jan 2 – Feb 1  "tail": last window's purchases can still come back until Feb 1;
     otherwise      "next": the coming window. */
(function () {
  var MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function line(now) {
    var m = now.getMonth(), d = now.getDate(), y = now.getFullYear();
    var holiday = m === 10 || m === 11 || (m === 0 && d === 1);
    if (!holiday) return '30-day returns from delivery or pickup.';
    var until = (m === 0) ? y : y + 1;
    return 'Extended holiday returns: bought now, returnable through Feb 1, ' + until + '. Otherwise 30 days from delivery or pickup.';
  }
  function season(now) {
    var m = now.getMonth(), d = now.getDate(), y = now.getFullYear();
    var open = m === 10 || m === 11 || (m === 0 && d === 1);
    var tail = (m === 0 && d > 1) || (m === 1 && d === 1);
    var start = (m === 0 || (m === 1 && d === 1)) ? y - 1 : y;
    return { state: open ? 'open' : tail ? 'tail' : 'next', start: new Date(start, 10, 1), end: new Date(start + 1, 0, 1), until: new Date(start + 1, 1, 1) };
  }
  function long(dt) { return MONTH[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear(); }
  function seasonText(now) {
    var s = season(now), span = long(s.start) + ' – ' + long(s.end);
    if (s.state === 'open') return 'Open now: bought ' + span + ', returnable through ' + long(s.until) + '.';
    if (s.state === 'tail') return 'Bought ' + span + '? Returnable through ' + long(s.until) + '.';
    return 'Next window: bought ' + span + ', returnable through ' + long(s.until) + '.';
  }
  function paint() {
    var now = new Date(), t = line(now), s = season(now), st = seasonText(now);
    document.querySelectorAll('[data-returns]').forEach(function (el) { el.textContent = t; });
    document.querySelectorAll('[data-returns-season]').forEach(function (el) { el.textContent = st; el.dataset.state = s.state; });
  }
  window.I9RETURNS = { line: line, season: season, seasonText: seasonText };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint); else paint();
})();
