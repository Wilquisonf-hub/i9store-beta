/* i9Store room planner — project account, lead gate, i9 staff projects and the presentation PDF (version F, round 4).
   The account sheet, its form and the gate are the LED configurator's (direction-h/led-wizard.js, "project account (the
   lead gate)"), mirrored here unchanged in wording and markup so both tools have one UX; the CSS is shared in
   planner-wizard.css. Free: the parts list with prices. With a free project account: the detailed plan (camera positions,
   cable plan, signal chain, light plan), "save project" and the presentation PDF.
   PRODUCTION (none of this runs in the prototype): sign-in is the store's customer account (Central API, email code or
   Google, no passwords); the detailed plan is computed server-side for signed-in users; and EACH PROJECT (every save,
   duplicate or quote request) CREATES AN OPPORTUNITY IN CENTRAL (Comercial) with the contact fields, the project JSON
   (#p= state + computed plan), the source page and the UTM parameters. Contact fields travel in the request body only.
   PROTOTYPE: nothing is sent. localStorage (inside try/catch) holds only { name, emailMasked, id, staff } and the project
   names with their plan links; never the full email or phone. i9 staff (an email ending @i9tv.com.br or @i9store.com) can
   keep several named projects; customers keep one. */
(function () {
  'use strict';
  const PL = window.I9PLANNER, WZ = () => window.I9WIZ; if (!PL) return;
  const { P, usd } = window.I9;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
  const box = $('#pz-proj'), pres = $('#pz-pres'); if (!box) return;

  /* ----- the account (same shape as the LED configurator's) ----- */
  const ACC_KEY = 'i9plan-account', PRJ_KEY = 'i9plan-projects';
  let ACC = null, ACC_ORG = '';
  const STAFF = /@(i9tv\.com\.br|i9store\.com)$/i;
  function accLoad() { try { const o = JSON.parse(localStorage.getItem(ACC_KEY) || 'null');
    if (o && typeof o.name === 'string' && o.name.trim() && typeof o.emailMasked === 'string' && /^RP-[A-Z0-9]{5}$/.test(o.id)) ACC = { name:o.name.trim().slice(0, 80), emailMasked:o.emailMasked.slice(0, 120), id:o.id, staff:STAFF.test(o.emailMasked) }; } catch (e) { ACC = null; } }
  function accStore() { try { localStorage.setItem(ACC_KEY, JSON.stringify({ name:ACC.name, emailMasked:ACC.emailMasked, id:ACC.id })); } catch (e) {} }
  function accForget() { try { localStorage.removeItem(ACC_KEY); } catch (e) {} }
  const maskEmail = e => { const s = String(e).trim(), at = s.lastIndexOf('@'); return at < 1 ? '•••' : s[0] + '•••' + s.slice(at); };
  const nameFromEmail = e => String(e).split('@')[0].split(/[._+-]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ') || 'i9 customer';
  const newId = (pre = 'RP-') => { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let r; try { r = crypto.getRandomValues(new Uint8Array(5)); } catch (e) { r = Array.from({ length:5 }, () => Math.floor(Math.random() * 256)); } return pre + Array.from(r, x => A[x % A.length]).join(''); };
  const live = t => { const l = $('#live'); if (l) l.textContent = t; };
  const firstName = n => String(n).trim().split(/\s+/)[0];

  /* ----- projects ----- */
  const prjLoad = () => { try { const a = JSON.parse(localStorage.getItem(PRJ_KEY) || '[]'); return Array.isArray(a) ? a.filter(p => p && /^PR-[A-Z0-9]{5}$/.test(p.id) && typeof p.name === 'string' && /^#p=/.test(p.h || '')).slice(0, 50) : []; } catch (e) { return []; } };
  const prjSave = a => { try { localStorage.setItem(PRJ_KEY, JSON.stringify(a.map(p => ({ id:p.id, name:String(p.name).slice(0, 60), h:p.h, at:p.at })))); } catch (e) {} };
  let CUR = null;   /* the open project id */
  const roomName = () => { const S = PL.state, k = (WZ() && WZ().state.k) || S.tpl; return (k ? k[0].toUpperCase() + k.slice(1) : 'Room') + ' · ' + PL.lenTxt(S.w) + ' × ' + PL.lenTxt(S.d); };
  function saveProject(asNew, name) {
    PL.save(); const h = location.hash, a = prjLoad(), now = new Date().toISOString().slice(0, 10);
    if (!ACC.staff) { const one = a[0] || { id:newId('PR-') }; Object.assign(one, { name:name || one.name || roomName(), h, at:now }); prjSave([one]); CUR = one.id; return one; }
    let p = !asNew && a.find(x => x.id === CUR);
    if (p) Object.assign(p, { h, at:now, name:name || p.name }); else { p = { id:newId('PR-'), name:name || roomName(), h, at:now }; a.unshift(p); }
    prjSave(a); CUR = p.id; return p;
  }

  /* ----- the gate ----- */
  const GATE_T = 'The detailed plan (camera positions, cable plan, signal chain, light plan), saving the project and the presentation PDF: free with a project account.';
  const GETS = ['Camera positions and the cable plan', 'The signal chain and the light plan in detail', 'Save the project and come back to it', 'The presentation PDF for your team'];
  const rd = (w) => `<span class="rd" style="--w:${w}" aria-hidden="true"></span>`;
  const COUNTRIES = ['United States', 'Brazil', 'Mexico', 'Colombia', 'Chile', 'Argentina', 'Peru', 'Ecuador', 'Dominican Republic', 'Puerto Rico', 'Panama', 'Costa Rica', 'Guatemala', 'Other'];
  const ROLES = [['end', 'End customer'], ['integrator', 'Integrator or reseller'], ['rental', 'Rental company']];
  const TIMING = [['month', 'This month'], ['1-3', '1–3 months'], ['3-6', '3–6 months'], ['research', 'Just researching']];
  const FLABEL = { name:'full name', org:'company, church or organisation', email:'a valid work email', phone:'phone or WhatsApp', country:'country', role:'“I am”', timing:'project timing', consent:'your OK for i9 to contact you' };
  function acctForm(mode) {
    const radios = (name, list) => list.map(([v, l]) => `<label class="rc"><input type="radio" name="${name}" value="${v}" required><span>${esc(l)}</span></label>`).join('');
    const det = mode === 'in' ? `<label class="fld"><span>Work email</span><input name="email" type="email" autocomplete="email" required></label>`
      : `<div class="qf2"><label class="fld"><span>Full name</span><input name="name" autocomplete="name" required></label>
          <label class="fld"><span>Company, church or organisation</span><input name="org" autocomplete="organization" required></label></div>
        <div class="qf2"><label class="fld"><span>Work email</span><input name="email" type="email" autocomplete="email" required></label>
          <label class="fld"><span>Phone or WhatsApp</span><input name="phone" type="tel" autocomplete="tel" required></label></div>
        <label class="fld"><span>Country</span><select name="country" autocomplete="country-name" required><option value="">Choose</option>${COUNTRIES.map(c => `<option>${c}</option>`).join('')}</select></label>
        <fieldset class="afr"><legend>I am</legend><div class="afc c3">${radios('role', ROLES)}</div></fieldset>
        <fieldset class="afr"><legend>Project timing</legend><div class="afc c4">${radios('timing', TIMING)}</div></fieldset>
        <label class="cns"><input type="checkbox" name="consent" required><span>i9 may contact me about this project</span></label>`;
    return `<form class="af" id="af" data-mode="${mode}" novalidate><div class="af-det">
        <button type="button" class="btn af-g" data-google>Continue with Google</button><p class="af-gnote meta-s" role="status" hidden></p>
        <p class="af-or meta-s"><span>or with your email</span></p>${det}
        <p class="qf-err meta-s af-err" role="alert" hidden></p>
        <button type="submit" class="btn sig af-go">Email me a sign-in code ${icon('arrow-right')}</button>
        <p class="meta-s af-fine">No password. We email you a 6-digit code.</p>
        <p class="meta-s af-sw">${mode === 'in' ? 'New here? <button type="button" class="lnk" data-acct-mode="new">Create a free project account</button>' : 'Already have an account? <button type="button" class="lnk" data-acct-mode="in">Sign in</button>'}</p></div>
      <div class="af-code" hidden><p class="af-sent">Enter the 6-digit code we sent to <b class="af-to"></b>.</p>
        <label class="fld"><span>Sign-in code</span><input name="code" class="af-cin" inputmode="numeric" autocomplete="one-time-code" maxlength="7" spellcheck="false"></label>
        <p class="qf-err meta-s af-err2" role="alert" hidden></p>
        <button type="submit" class="btn sig af-go">Verify and save the project ${icon('arrow-right')}</button>
        <p class="meta-s af-sw"><button type="button" class="lnk" data-af-back>Use a different email</button></p>
        <p class="meta-s af-fine">Prototype: any 6 digits work; no email is sent.</p></div></form>`;
  }
  let dlg = null, opener = null, after = null;
  function openAcct(mode, el, then) {
    if (ACC) { then && then(); return; }
    if (el) opener = el; after = then || null;
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.className = 'acct'; dlg.id = 'acct'; dlg.setAttribute('aria-labelledby', 'acct-h'); document.body.appendChild(dlg);
      dlg.addEventListener('cancel', e => { e.preventDefault(); closeAcct(); });
      dlg.addEventListener('click', e => { if (e.target === dlg) { closeAcct(); return; } const b = e.target.closest('button'); if (!b) return;
        if (b.hasAttribute('data-google')) { const n = $('.af-gnote', dlg); n.hidden = false; n.textContent = 'Google sign-in isn’t connected on this prototype. Use the email code below.'; return; }
        if (b.hasAttribute('data-af-back')) { $('.af-code', dlg).hidden = true; $('.af-det', dlg).hidden = false; return; }
        if (b.hasAttribute('data-acct-close')) { closeAcct(); return; }
        if (b.dataset.acctMode) { fill(b.dataset.acctMode); } });
      dlg.addEventListener('submit', e => { e.preventDefault(); afSubmit(e.target); });
    }
    fill(mode); document.documentElement.classList.add('acct-open');
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
    $('#acct-h', dlg).focus();
  }
  function fill(mode) {
    dlg.innerHTML = `<div class="acct-in"><div class="acct-hd"><p class="meta"><span class="tally"></span>${mode === 'in' ? 'Project account · sign in' : 'Free project account'}</p><button type="button" class="acct-x" data-acct-close aria-label="Close">${icon('x')}</button></div>
      <h2 id="acct-h" tabindex="-1">${mode === 'in' ? 'Sign in to your project.' : 'Save this room and get the full plan.'}</h2>
      <p class="acct-lede">${mode === 'in' ? 'We email you a code. Your saved project and the detailed plan open as soon as you’re in.' : 'Save the project, get the detailed plan and the presentation PDF, and an i9 specialist’s review.'}</p>
      ${mode === 'in' ? '' : `<ul class="acct-get">${GETS.map(g => `<li><i aria-hidden="true"></i>${esc(g)}</li>`).join('')}</ul>`}
      <p class="acct-proto meta-s"><i aria-hidden="true"></i>Prototype: nothing is sent; no account is created.</p>
      <div class="acct-body">${acctForm(mode)}</div></div>`;
  }
  function closeAcct() { if (dlg && dlg.open) dlg.close(); document.documentElement.classList.remove('acct-open'); if (opener) opener.focus(); }
  function afSubmit(f) {
    const code = $('.af-code', f);
    if (!code.hidden) {
      const ci = $('.af-cin', f), err = $('.af-err2', f), v = ci.value.replace(/\s+/g, '');
      if (!/^\d{6}$/.test(v)) { ci.setAttribute('aria-invalid', 'true'); err.hidden = false; err.textContent = 'Enter the 6 digits from the email.'; ci.focus(); return; }
      const d = f._d || {};
      ACC = { name:(f.dataset.mode === 'in' ? nameFromEmail(d.email) : d.name).slice(0, 80), emailMasked:maskEmail(d.email), id:newId(), staff:STAFF.test(String(d.email).trim()) };
      ACC_ORG = (d.org || '').slice(0, 120); f._d = null; accStore();
      /* PRODUCTION: sign-in through Central, and the project becomes an opportunity in Central (Comercial). */
      const p = saveProject(false);
      render(); closeAcct();
      live(`Signed in as ${ACC.name}. Project saved · ${p.name}.`);
      if (after) { const a = after; after = null; a(); }
      return;
    }
    const err = $('.af-err', f), els = [...f.elements].filter(e => e.closest('.af-det') && e.willValidate);
    els.forEach(e => { e.removeAttribute('aria-invalid'); const fs = e.closest('fieldset'); if (fs) fs.removeAttribute('aria-invalid'); });
    const bad = els.filter(e => !e.checkValidity());
    if (bad.length) { bad.forEach(e => { const fs = e.closest('fieldset.afr'); (fs || e).setAttribute('aria-invalid', 'true'); });
      err.hidden = false; err.textContent = 'Still needed: ' + [...new Set(bad.map(e => FLABEL[e.name] || e.name))].join(', ') + '.'; bad[0].focus(); return; }
    err.hidden = true;
    const d = {}; els.forEach(e => { if (e.type === 'radio') { if (e.checked) d[e.name] = e.value; } else if (e.type === 'checkbox') d[e.name] = e.checked; else d[e.name] = e.value.trim(); });
    f._d = d; $('.af-to', f).textContent = maskEmail(d.email); $('.af-det', f).hidden = true; code.hidden = false; const ci = $('.af-cin', f); ci.value = ''; ci.focus();
    live('Enter the 6-digit sign-in code. Prototype: any 6 digits work.');
  }

  /* ----- the detailed plan (only rendered for a signed-in account) ----- */
  const n1 = v => (Math.round(v * 10) / 10).toFixed(1);
  function detail() {
    const S = PL.state, L = PL.lightCalc();
    const cams = S.cams.map((c, i) => { const v = PL.view(c), ln = c.k === 'lens' ? (P[c.lens] ? P[c.lens].name : c.lens) + (c.crop ? ' · S35' : '') : PL.zoomX(c).toFixed(1) + '×';
      return `<tr><td>${esc(PL.camLab(i))}</td><td>${esc(PL.modelName(c))}</td><td>${n1(c.x)} × ${n1(c.y)} m</td><td>${esc(PL.t('m_' + c.mnt))}</td><td>${Math.round(c.a)}°</td><td>${esc(ln)}</td><td>${n1(v.h)}°</td><td>${esc(PL.runCable(c))} · ${esc(PL.lenTxt(PL.runOf(c)))}</td></tr>`; }).join('');
    /* the dimmer the plan sets for each fixture (auto-dim to the look), or "set on site" without published data */
    const lights = L ? L.fx.map(f => `<tr><td>${esc(f.r)}</td><td>${esc(P[f.id] ? P[f.id].name : f.id)}</td><td>${esc(f.role)}</td><td>${n1(f.x)} × ${n1(f.y)} m · ${n1(f.h)} m high</td><td>${f.dim == null ? 'set on site' : Math.round(f.dim * 100) + ' %'}</td></tr>`).join('') : '';
    return `<div class="pz-det">
      <h3 class="meta"><span class="tally"></span>Camera positions and cable plan</h3>
      <div class="pz-sc"><table><thead><tr><th>Cam</th><th>Model</th><th>Position (x × y)</th><th>Mount</th><th>Pan</th><th>Lens / zoom</th><th>Angle</th><th>Cable to control</th></tr></thead><tbody>${cams}</tbody></table></div>
      <h3 class="meta"><span class="tally"></span>Signal chain</h3>${WZ() && WZ().chain ? WZ().chain() : ''}
      ${lights ? `<h3 class="meta"><span class="tally"></span>Light plan</h3><div class="pz-sc"><table><thead><tr><th></th><th>Fixture</th><th>Role</th><th>Position</th><th>Dimmer · ${esc(L ? ({ soft:'Soft', std:'Standard', tv:'Bright (TV)' })[L.look] : '')} look</th></tr></thead><tbody>${lights}</tbody></table></div>` : ''}
    </div>`;
  }
  function render() {
    const w = WZ(), on = w && w.state.v === 'w' && w.state.s === 8;
    box.hidden = !on; if (!on) return;
    if (!ACC) {
      box.innerHTML = `<div class="gate pz-gate"><p class="gate-t">${icon('lock')}<span>${esc(GATE_T)}</span></p>
        <ul class="pz-locked">${GETS.map((g, i) => `<li><b>${esc(g)}</b>${rd((10 + i * 4) + 'ch')}</li>`).join('')}</ul>
        <div class="gate-a"><button type="button" class="btn sig" data-pz-acct="new">Create free project account</button><button type="button" class="lnk" data-pz-acct="in">I already have an account</button>
          <button type="button" class="btn" data-pz-pdf>Export presentation PDF</button></div></div>`;
      return;
    }
    const a = prjLoad(), cur = a.find(p => p.id === CUR) || a[0]; if (cur) CUR = cur.id;
    box.innerHTML = `<div class="pz-hd"><div><p class="meta acct-ok"><span class="tally"></span>${ACC.staff ? 'i9 staff' : 'Project account'} · ${esc(ACC.emailMasked)}</p>
        <h3 class="pz-name">${esc(cur ? cur.name : roomName())}</h3></div>
        <div class="pz-acts"><button type="button" class="btn sig" data-pz-save>Save project</button><button type="button" class="btn" data-pz-pdf>Export presentation PDF</button>
          ${ACC.staff ? `<button type="button" class="btn" data-pz-new>New project</button><button type="button" class="btn" data-pz-dup>Duplicate</button><button type="button" class="btn" data-pz-ren>Rename</button>` : ''}
          <button type="button" class="lnk" data-pz-out>Sign out</button></div></div>
      ${ACC.staff && a.length ? `<ul class="pz-list" aria-label="Projects">${a.map(p => `<li><button type="button" class="pz-pj${p.id === CUR ? ' on' : ''}" data-pz-open="${p.id}" aria-pressed="${p.id === CUR}"><b>${esc(p.name)}</b><span class="meta-s">${esc(p.id)} · ${esc(p.at || '')}</span></button></li>`).join('')}</ul>` : ''}
      <p class="meta-s pz-crm">In production every project opens an opportunity in Central (Comercial) for the sales team.</p>
      ${detail()}`;
  }

  /* ----- the presentation PDF: a print layout, window.print() ----- */
  /* round 5: the picture quality and the control panel on the cover */
  function qualLine() { const Q = PL.qualOf ? PL.qualOf() : null, pd = PL.prod; if (!Q) return '';
    const pn = pd && pd.sw ? (pd.panel && pd.panel.id && P[pd.panel.id] ? P[pd.panel.id].name : pd.panel && pd.panel.key === 'builtin' ? 'panel built in' : 'no hardware panel') : '';
    return Q.pgm + (Q.sq !== Q.q ? ' (stream ' + Q.st + ')' : '') + (pd && pd.sw && P[pd.sw] ? ' · ' + P[pd.sw].name + (pn ? ' + ' + pn : '') : ''); }
  function presentation() {
    const S = PL.state, w = WZ(), tt = PL.tally(), roll = w && w.rollup ? w.rollup(PL.bom) : null, a = prjLoad(), cur = a.find(p => p.id === CUR);
    const g3 = $('#g3box canvas'); let snap = ''; try { if (g3) snap = g3.toDataURL('image/jpeg', 0.85); } catch (e) {}
    const plan = $('#plan') ? $('#plan').outerHTML.replace(/ id="plan"/, '') : '';
    const GN = { cam:'Cameras & lenses', sw:'Switching & streaming', cab:'Cabling', net:'Network & power', mnt:'Mounts & support', aud:'Audio', lit:'Lighting & control', mon:'Monitoring & intercom', svc:'Services · i9TV' };
    const groups = Object.keys(GN).map(g => { const ls = PL.bom.filter(l => l.g === g && !l.info); if (!ls.length) return '';
      return `<section class="pzp-g"><h3>${GN[g]}</h3><table>${ls.map(l => { const p = l.id && P[l.id]; return `<tr><td>${l.qty}×</td><td>${esc(p ? p.brand + ' ' + p.name : l.name)}${l.spec && !p ? ` <span>${esc(l.spec)}</span>` : ''}</td><td>${l.own ? 'You have this' : p ? usd(p.usd * l.qty) : 'To quote'}</td></tr>`; }).join('')}</table></section>`; }).join('');
    pres.innerHTML = `<div class="pzp-cover"><p class="pzp-k">i9Store · Room plan</p><h1>${esc(cur ? cur.name : roomName())}</h1>
        <p>${esc(roomName())} · ${S.cams.length} cameras · ${esc(qualLine())} · ${esc(new Date().toISOString().slice(0, 10))}</p>
        ${ACC ? `<p>${esc(ACC.name)} · ${esc(ACC.emailMasked)}</p>` : ''}<p class="pzp-tot">${usd(tt.total)} <span>priced lines, before sales tax and shipping · ${tt.quote.length} lines to quote</span></p></div>
      <div class="pzp-pg"><h2>The plan</h2><div class="pzp-plan">${plan}</div>${snap ? `<h2>3D view</h2><img class="pzp-3d" src="${snap}" alt="3D view of the plan">` : ''}</div>
      <div class="pzp-pg"><h2>Signal chain</h2>${w && w.chain ? w.chain() : ''}${PL.lightCalc() ? `<h2>Light plan</h2>${w && w.readouts ? w.readouts(true) : ''}` : ''}</div>
      <div class="pzp-pg"><h2>Parts list</h2>${roll ? `<p class="pzp-roll">${Object.keys(roll).map(k => `${({ cam:'Cameras', prod:'Production', lit:'Lighting & control', cab:'Cables & mounts', svc:'Services · i9TV' })[k]} ${usd(roll[k].tot)}${roll[k].q ? ' + ' + roll[k].q + ' to quote' : ''}`).join(' · ')}</p>` : ''}${groups}
        <p class="pzp-note">Prices are live i9store.com/usa listings, before sales tax and shipping. Lines to quote, services included, are priced by an i9 specialist.</p></div>`;
    return pres;
  }
  function exportPdf() {
    presentation();
    document.body.classList.add('pz-printing');
    const done = () => { document.body.classList.remove('pz-printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    try { window.print(); } catch (e) {}
    setTimeout(done, 1500);
  }

  /* ----- events ----- */
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.pzAcct) { openAcct(b.dataset.pzAcct, b); return; }
    if (b.hasAttribute('data-pz-pdf')) { if (!ACC) openAcct('new', b, exportPdf); else exportPdf(); return; }
    if (b.hasAttribute('data-pz-save')) { const p = saveProject(false); live(`Project saved · ${p.name}.`); render(); return; }
    if (b.hasAttribute('data-pz-new')) { const p = saveProject(true, roomName() + ' · new'); live(`New project · ${p.name}.`); render(); return; }
    if (b.hasAttribute('data-pz-dup')) { const a = prjLoad(), c = a.find(x => x.id === CUR); const p = saveProject(true, (c ? c.name : roomName()) + ' (copy)'); live(`Duplicated · ${p.name}.`); render(); return; }
    if (b.hasAttribute('data-pz-ren')) { const a = prjLoad(), c = a.find(x => x.id === CUR); if (!c) return; const v = (window.prompt('Project name', c.name) || '').trim(); if (v) { c.name = v.slice(0, 60); prjSave(a); render(); } return; }
    if (b.dataset.pzOpen) { const p = prjLoad().find(x => x.id === b.dataset.pzOpen); if (!p) return; CUR = p.id; location.hash = p.h; return; }
    if (b.hasAttribute('data-pz-out')) { ACC = null; accForget(); render(); live('Signed out. The detailed plan is locked again.'); return; }
  });
  document.addEventListener('i9plan:update', () => render());
  document.addEventListener('click', e => { if (e.target.closest('#wz-next, #wz-back, #wz-steps, #to-wiz, #to-adv')) setTimeout(render, 0); });
  window.addEventListener('hashchange', () => setTimeout(render, 30));
  accLoad(); render();
  window.I9ACCT = { get account() { return ACC; }, projects:prjLoad, get current() { return CUR; }, presentation, render };
})();
