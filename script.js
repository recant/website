const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const detailsButton = document.querySelector('.details-button');
const details = document.getElementById('proposal-details');

if (detailsButton && details) {
  detailsButton.addEventListener('click', () => {
    const expanded = detailsButton.getAttribute('aria-expanded') === 'true';
    detailsButton.setAttribute('aria-expanded', String(!expanded));
    details.hidden = expanded;
    detailsButton.textContent = expanded ? 'details' : 'hide details';
  });
}

const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const sections = navLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const observer = new IntersectionObserver(entries => {
    const current = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!current) return;

    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${current.target.id}`;
      link.classList.toggle('active', active);
    });
  }, {
    rootMargin: '-25% 0px -60% 0px',
    threshold: [0.05, 0.25, 0.5]
  });

  sections.forEach(section => observer.observe(section));
}
