(() => {
  // ---------- Intro: big logo -> header position -> page unrolls top to bottom ----------
  (function intro() {
    const html = document.documentElement;
    const ov = document.querySelector('.intro'), lg = document.querySelector('.intro-logo');
    const target = document.querySelector('.brand img'), txt = document.querySelector('.brand-txt');
    const done = () => { html.classList.remove('intro-on'); ov.remove(); lg.remove(); };
    if (!html.classList.contains('intro-on') || !ov || !lg) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return done();
    ov.style.animation = lg.style.animation = 'none';
    window.scrollTo(0, 0);
    const go = () => {
      requestAnimationFrame(() => lg.classList.add('in'));
      setTimeout(() => {
        const a = lg.getBoundingClientRect(), b = target.getBoundingClientRect();
        lg.style.transition = 'none';
        lg.style.left = a.left + 'px'; lg.style.top = a.top + 'px'; lg.style.width = a.width + 'px';
        lg.style.transform = 'none';
        lg.getBoundingClientRect();
        lg.style.transition = 'transform 1s cubic-bezier(.65,0,.35,1)';
        const k = b.width / a.width;
        lg.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${k})`;
        setTimeout(() => {
          txt.style.opacity = '1';
          ov.style.transition = 'clip-path 1.3s cubic-bezier(.65,0,.35,1)';
          ov.style.clipPath = 'inset(100% 0 0 0)';
          setTimeout(() => { target.style.visibility = 'visible'; lg.style.opacity = '0'; }, 350);
          setTimeout(() => { txt.style.opacity = ''; target.style.visibility = ''; done(); }, 1350);
        }, 1050);
      }, 1300);
    };
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
