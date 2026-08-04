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
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${visible.target.id}`
        );
      });
    }, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: [0, 0.25, 0.5]
    });

    sections.forEach(section => observer.observe(section));
  }
})();
