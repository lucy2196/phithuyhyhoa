(() => {
  // ---------- Intro: big logo, then page reveals (mode 'ring' = from the logo, 'curtain' = top to bottom) ----------
  (function intro() {
    const html = document.documentElement;
    const ov = document.querySelector('.intro'), lg = document.querySelector('.intro-logo');
    const target = document.querySelector('.brand img'), txt = document.querySelector('.brand-txt');
    if (!html.classList.contains('intro-on') || !ov || !lg) return;
    const done = () => { html.classList.remove('intro-on'); ov.remove(); lg.remove(); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !lg.animate) return done();
    const q = new URLSearchParams(location.search).get('intro');
    const mode = q || html.dataset.intro || 'ring';
    ov.style.animation = lg.style.animation = 'none';
    window.scrollTo(0, 0);
    const EASE = 'cubic-bezier(.65,0,.35,1)', OUT = 'cubic-bezier(.22,1,.36,1)';
    const fly = () => {
      const a = lg.getBoundingClientRect(), b = target.getBoundingClientRect();
      const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
      return lg.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx}px,${dy}px) scale(${b.width / a.width})` }],
        { duration: 600, easing: EASE, fill: 'forwards' }).finished;
    };
    const finish = () => { target.style.visibility = 'visible'; txt.style.opacity = '1'; lg.style.opacity = '0'; done(); setTimeout(() => { txt.style.opacity = ''; target.style.visibility = ''; }, 600); };
    const run = async () => {
      await lg.animate([{ opacity: 0, transform: 'scale(.82)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 500, easing: OUT, fill: 'forwards' }).finished;
      await new Promise(r => setTimeout(r, 250));
      if (mode === 'curtain') {
        const f = fly();
        await new Promise(r => setTimeout(r, 450));
        await Promise.all([f, ov.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }],
          { duration: 750, easing: EASE, fill: 'forwards' }).finished]);
      } else {
        // Spread from the logo: a jade ring grows out of the logo and the page is revealed inside it
        await fly();
        const a = target.getBoundingClientRect();
        const cx = a.left + a.width / 2, cy = a.top + a.height / 2, r0 = a.width * 0.5;
        const R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 4;
        const parts = [...document.querySelectorAll('.hdr, main, .ftr, .mbar')].filter(e => e.offsetParent || e === document.querySelector('.hdr'));
        const ring = document.createElement('div'); ring.className = 'intro-ring';
        ring.style.width = ring.style.height = (2 * R) + 'px';
        ring.style.left = (cx - R) + 'px'; ring.style.top = (cy - R) + 'px';
        document.body.appendChild(ring);
        const D = 1000, SPREAD = 'cubic-bezier(.35,0,.2,1)';
        const anims = parts.map(el => {
          const b = el.getBoundingClientRect(), x = cx - b.left, y = cy - b.top;
          return el.animate([{ clipPath: `circle(${r0}px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)` }],
            { duration: D, easing: SPREAD, fill: 'forwards' }).finished;
        });
        anims.push(ring.animate([{ transform: `scale(${r0 / R})` }, { transform: 'scale(1)' }], { duration: D, easing: SPREAD, fill: 'forwards' }).finished);
        ring.animate([{ opacity: 1 }, { opacity: 1, offset: .35 }, { opacity: 0 }], { duration: D, fill: 'forwards' });
        ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' });
        txt.style.opacity = '1';
        await Promise.all(anims);
        parts.forEach(el => el.getAnimations().forEach(x => x.cancel()));
        ring.remove();
      }
      finish();
    };
    const go = () => run().catch(done);
    if (lg.complete) go(); else { lg.onload = go; lg.onerror = done; }
  })();

  const root = document.documentElement;
  const hdr = document.querySelector('.hdr');

  // Header: thin divider + compact brand when scrolled
  const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Desktop dropdowns: open on hover/click, close fast on leave
  const dds = [...document.querySelectorAll('.dd')];
  const tops = dds.map(d => d.querySelector('.nav-a'));
  const closeOthers = keep => dds.forEach(d => { if (d !== keep) d.classList.remove('op'); });
  dds.forEach(dd => {
    let t;
    dd.addEventListener('mouseenter', () => { clearTimeout(t); closeOthers(dd); dd.classList.add('op'); });
    dd.addEventListener('mouseleave', () => { t = setTimeout(() => dd.classList.remove('op'), 60); });
    dd.addEventListener('focusin', () => { closeOthers(dd); dd.classList.add('op'); });
    dd.addEventListener('focusout', e => { if (!dd.contains(e.relatedTarget) && !dd.matches(':hover')) dd.classList.remove('op'); });
    const top = dd.querySelector('.nav-a');
    top.addEventListener('click', e => {
      if (!dd.classList.contains('op')) e.preventDefault();
      tops.forEach(x => x.classList.toggle('act', x === top));
      closeOthers(dd); dd.classList.add('op');
    });
    dd.querySelectorAll('.dpi a').forEach(a => a.addEventListener('click', () => {
      document.querySelectorAll('.dpi a').forEach(x => x.classList.toggle('act', x === a));
      tops.forEach(x => x.classList.toggle('act', x === top));
      dd.classList.remove('op');
    }));
  });
  document.addEventListener('click', e => { if (!e.target.closest('.dd')) closeOthers(null); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeOthers(null); setMenu(false); } });

  // Phone menu
  const btn = document.querySelector('.menu-btn');
  const mnav = document.getElementById('mnav');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  }
  btn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mnav.querySelectorAll('a').forEach(x => x.classList.toggle('act', x === a && !a.classList.contains('btn')));
    setTimeout(() => setMenu(false), 180);
  }));
  window.matchMedia('(min-width: 861px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  // Enable :active feedback on iOS
  document.addEventListener('touchstart', () => {}, { passive: true });
})();
