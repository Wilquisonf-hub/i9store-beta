/* Return-policy line (owner 25 Nov 2026): 30 days from delivery or pickup, like B&H and Adorama. Holiday extension, same dates as
   B&H: items bought from Nov 1 through Jan 1 can be returned through Feb 1. Full policy text: MERCADOS-ARQUITETURA.md §11.5
   (draft, pending legal review). Fills every [data-returns]. */
(function () {
  function line(now) {
    var m = now.getMonth(), d = now.getDate(), y = now.getFullYear();
    var holiday = m === 10 || m === 11 || (m === 0 && d === 1);
    if (!holiday) return '30-day returns from delivery or pickup.';
    var until = (m === 0) ? y : y + 1;
    return 'Extended holiday returns: bought now, returnable through Feb 1, ' + until + '. Otherwise 30 days from delivery or pickup.';
  }
  function paint() { var t = line(new Date()); document.querySelectorAll('[data-returns]').forEach(function (el) { el.textContent = t; }); }
  window.I9RETURNS = { line: line };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint); else paint();
})();
