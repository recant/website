(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  // Reveal content as it enters the viewport.
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    reveals.forEach((el) => revealObserver.observe(el));
  }

  // Highlight the active navigation section.
  const navLinks = [...document.querySelectorAll('.nav a')];
  const sectionMap = new Map(
    navLinks
      .map((link) => [document.querySelector(link.getAttribute('href')), link])
      .filter(([section]) => section)
  );

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.remove('active'));
      sectionMap.get(visible.target)?.classList.add('active');
    }, { threshold: [0.15, 0.35, 0.6], rootMargin: '-20% 0px -55% 0px' });
    sectionMap.forEach((_, section) => navObserver.observe(section));
  }

  // Subtle pointer glow and card parallax on precise pointers only.
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = -1000;
    let mouseY = -1000;
    let rafPending = false;

    window.addEventListener('pointermove', (event) => {
      mouseX = event.clientX - 220;
      mouseY = event.clientY - 220;
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);
        rafPending = false;
      });
    });

    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const visual = card.querySelector('.project-visual');
      if (!visual) return;

      card.addEventListener('pointermove', (event) => {
        const rect = visual.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
          visual.style.transform = '';
          return;
        }
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        visual.style.transform = `perspective(900px) rotateX(${(-y * 2.4).toFixed(2)}deg) rotateY(${(x * 2.4).toFixed(2)}deg)`;
      });

      card.addEventListener('pointerleave', () => {
        visual.style.transform = '';
      });
    });
  }

  // Generative network / molecular field in the hero.
  const canvas = document.getElementById('signal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const lab = canvas.parentElement;
  const pointer = { x: 0.5, y: 0.5, active: false };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let nodes = [];
  let frame = 0;

  function resize() {
    const rect = lab.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(24, Math.min(54, Math.round(width * height / 10500)));
    nodes = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      r: index % 9 === 0 ? 2.2 : 1.25,
      accent: index % 11 === 0
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const node of nodes) {
      if (!reduceMotion) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -10) node.x = width + 10;
        if (node.x > width + 10) node.x = -10;
        if (node.y < -10) node.y = height + 10;
        if (node.y > height + 10) node.y = -10;
      }

      if (pointer.active && !reduceMotion) {
        const px = pointer.x * width;
        const py = pointer.y * height;
        const dx = px - node.x;
        const dy = py - node.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 140 && distance > 1) {
          node.x += (dx / distance) * 0.05;
          node.y += (dy / distance) * 0.05;
        }
      }
    }

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > 112) continue;
        const alpha = (1 - distance / 112) * 0.13;
        ctx.strokeStyle = `rgba(200,255,81,${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const node of nodes) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = node.accent ? 'rgba(200,255,81,.9)' : 'rgba(229,234,224,.42)';
      ctx.fill();
      if (node.accent) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200,255,81,.12)';
        ctx.stroke();
      }
    }

    frame = requestAnimationFrame(draw);
  }

  lab.addEventListener('pointermove', (event) => {
    const rect = lab.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width;
    pointer.y = (event.clientY - rect.top) / rect.height;
    pointer.active = true;
  });
  lab.addEventListener('pointerleave', () => { pointer.active = false; });

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(lab);
  resize();
  draw();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
    } else {
      cancelAnimationFrame(frame);
      draw();
    }
  });
})();
