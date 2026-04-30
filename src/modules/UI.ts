export function initUI(): void {
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('dragstart', e => e.preventDefault());
  document.addEventListener('selectstart', e => {
    if (!['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)) e.preventDefault();
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && ['s','u','p'].includes(e.key.toLowerCase())) e.preventDefault();
  });

  const cur = document.getElementById('cur');
  const curR = document.getElementById('cur-ring');
  if (cur && curR && !window.matchMedia('(hover:none)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = `${mx}px`; cur.style.top = `${my}px`;
    });
    const ringTick = () => {
      rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
      curR.style.left = `${rx}px`; curR.style.top = `${ry}px`;
      requestAnimationFrame(ringTick);
    };
    ringTick();
    document.querySelectorAll('a, button, .collage-item').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-big'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-big'));
    });
  }

  const canvas = document.getElementById('starfield') as HTMLCanvasElement;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const N = Math.min(300, Math.round((window.innerWidth * window.innerHeight) / 4000));
    const stars = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.15 + 0.2, a: Math.random(), da: (Math.random() - 0.5) * 0.007,
      vx: (Math.random() - 0.5) * 0.07, vy: (Math.random() - 0.5) * 0.055,
      col: Math.random() < 0.14 ? `hsl(${180 + Math.random() * 60},75%,80%)` : '#fff'
    }));

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.x = (s.x + s.vx + W) % W; s.y = (s.y + s.vy + H) % H;
        s.a = Math.max(0.04, Math.min(1, s.a + s.da));
        if (s.a <= 0.04 || s.a >= 1) s.da *= -1;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.col; ctx.globalAlpha = s.a; ctx.fill();
        if (s.r > 1) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2.8, 0, Math.PI * 2); ctx.globalAlpha = s.a * 0.12; ctx.fill(); }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    draw();
  }

  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  if (burger && drawer) {
    let open = false;
    const toggle = (state: boolean) => {
      open = state;
      burger.classList.toggle('open', state); drawer.classList.toggle('open', state);
      burger.setAttribute('aria-expanded', String(state));
      document.body.style.overflow = state ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle(!open));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  if (window.IntersectionObserver) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    
    const skillsPanel = document.querySelector('.skills-panel');
    if (skillsPanel) {
      new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          document.querySelectorAll('.skill-bar').forEach(b => { (b as HTMLElement).style.width = `${(b as HTMLElement).dataset.pct}%`; });
          document.querySelectorAll('.skill-pct').forEach(el => {
            const target = +(el as HTMLElement).dataset.val!; let cur = 0;
            const tick = () => { cur = Math.min(target, cur + 2); el.textContent = `${cur}%`; if (cur < target) requestAnimationFrame(tick); };
            setTimeout(tick, 200);
          });
        }
      }, { threshold: 0.35 }).observe(skillsPanel);
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href')!);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}