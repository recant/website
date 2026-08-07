const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const links = [...document.querySelectorAll('nav a[href^="#"]')];
const sections = links
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const observer = new IntersectionObserver((entries) => {
    const current = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!current) return;
    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current.target.id}`);
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: [0.05, 0.2, 0.5] });
  sections.forEach((section) => observer.observe(section));
}
