(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const detailsButton = document.querySelector('.details-button');
  const details = document.getElementById('proposal-details');
  if (detailsButton && details) {
    detailsButton.addEventListener('click', () => {
      const expanded = detailsButton.getAttribute('aria-expanded') === 'true';
      detailsButton.setAttribute('aria-expanded', String(!expanded));
      details.hidden = expanded;
      detailsButton.textContent = expanded ? 'More details' : 'Hide details';
    });
  }

  const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: [0.1, 0.35, 0.6]
    });

    sections.forEach(section => observer.observe(section));
  }

  const startButton = document.getElementById('reaction-start');
  const area = document.getElementById('reaction-area');
  const status = document.getElementById('reaction-status');
  const lastTimeEl = document.getElementById('last-time');
  const bestTimeEl = document.getElementById('best-time');

  if (!startButton || !area || !status || !lastTimeEl || !bestTimeEl) return;

  let timeoutId = null;
  let startTime = null;
  let state = 'idle';
  let bestTime = null;

  function setAreaState(nextState, label) {
    area.classList.remove('is-idle', 'is-waiting', 'is-ready', 'is-too-soon');
    area.classList.add(`is-${nextState}`);
    area.textContent = label;
    state = nextState;
  }

  function resetToIdle() {
    clearTimeout(timeoutId);
    timeoutId = null;
    startTime = null;
    setAreaState('idle', 'wait…');
    status.textContent = 'Press start, then wait for green.';
  }

  startButton.addEventListener('click', () => {
    clearTimeout(timeoutId);
    startTime = null;
    setAreaState('waiting', 'wait for green');
    status.textContent = 'Get ready…';

    const delay = 1200 + Math.random() * 2400;
    timeoutId = window.setTimeout(() => {
      startTime = performance.now();
      setAreaState('ready', 'click!');
      status.textContent = 'Now.';
    }, delay);
  });

  area.addEventListener('click', () => {
    if (state === 'waiting') {
      clearTimeout(timeoutId);
      timeoutId = null;
      setAreaState('too-soon', 'too soon');
      status.textContent = 'Too early. Press start to try again.';
      return;
    }

    if (state === 'ready' && startTime !== null) {
      const reactionTime = Math.round(performance.now() - startTime);
      lastTimeEl.textContent = `${reactionTime} ms`;

      if (bestTime === null || reactionTime < bestTime) {
        bestTime = reactionTime;
        bestTimeEl.textContent = `${bestTime} ms`;
      }

      setAreaState('idle', 'again?');
      status.textContent = `Reaction time: ${reactionTime} ms. Press start to play again.`;
      startTime = null;
    }
  });

  resetToIdle();
})();
