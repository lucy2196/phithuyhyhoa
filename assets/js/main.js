(() => {
  // ---------- Intro ----------
  // 1) big logo in the centre  2) logo flies to the header while the brown cover slides up with it,
  //    uncovering the page backgrounds  3) content spreads out from the logo with a jade ring.
  (function intro() {
    const html = document.documentElement;
    const ov = document.querySelector('.intro'), lg = document.querySelector('.intro-logo');
    const target = document.querySelector('.brand img');
    if (!html.classList.contains('intro-on') || !ov || !lg) return;
    const ITEMS = '.nav,.hdr-cta,.menu-btn,.brand-txt,.hero-txt>*,.hero-media,.trust>div,.sec-head,.sec>h2,.card,.note,.story-img,.story-txt>*,.steps>li,.ftr-grid>div,.ftr-copy,.mbar>.btn';
    const done = () => { html.classList.remove('intro-on'); ov.remove(); lg.remove(); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !lg.animate) return done();
    ov.style.animation = lg.style.animation = 'none';
    window.scrollTo(0, 0);
    const MOVE = 'cubic-bezier(.65,0,.35,1)', OUT = 'cubic-bezier(.22,1,.36,1)';
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const run = async () => {
      // 1) logo appears
      await lg.animate([{ opacity: 0, transform: 'scale(.82)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 500, easing: OUT, fill: 'forwards' }).finished;
      await wait(200);
      // 2) logo flies up, brown cover slides up at the same time
      const a = lg.getBoundingClientRect(), b = target.getBoundingClientRect();
      const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
      const FLY = 750;
      await Promise.all([
        lg.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx}px,${dy}px) scale(${b.width / a.width})` }],
          { duration: FLY, easing: MOVE, fill: 'forwards' }).finished,
        ov.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
          { duration: FLY, easing: MOVE, fill: 'forwards' }).finished
      ]);
      // 3) spread from the logo: jade ring + elements appear by distance
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      const R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 4;
      const SPREAD = 1000;
      const ring = document.createElement('div'); ring.className = 'intro-ring';
      ring.style.width = ring.style.height = (2 * R) + 'px';
      ring.style.left = (cx - R) + 'px'; ring.style.top = (cy - R) + 'px';
      document.body.appendChild(ring);
      const anims = [
        ring.animate([{ transform: `scale(${(b.width / 2) / R})`, opacity: 1 }, { transform: 'scale(.55)', opacity: .9, offset: .5 }, { transform: 'scale(1)', opacity: 0 }],
          { duration: SPREAD, easing: 'cubic-bezier(.3,0,.25,1)', fill: 'forwards' }).finished
      ];
      document.querySelectorAll(ITEMS).forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        const ex = Math.min(Math.max(cx, r.left), r.right), ey = Math.min(Math.max(cy, r.top), r.bottom);
        const d = Math.min(1, Math.hypot(ex - cx, ey - cy) / R);
        anims.push(el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
          { duration: 450, delay: d * SPREAD * .75, easing: OUT, fill: 'both' }).finished);
      });
      lg.style.zIndex = '102';
      await Promise.all(anims);
      target.style.visibility = 'visible';
      done();
      ring.remove();
      document.querySelectorAll(ITEMS).forEach(el => el.getAnimations().forEach(x => x.cancel()));
      target.style.visibility = '';
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
