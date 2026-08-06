const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const workList = document.querySelector('.work-list');
if (workList) {
  const proposal = document.createElement('article');
  proposal.className = 'work-card';
  proposal.innerHTML = `
    <div class="work-index">06</div>
    <div class="work-main">
      <div class="work-topline">
        <p class="meta">2026 · Caltech · Research proposal</p>
      </div>
      <h3>Senescence-selective viral therapy</h3>
      <p class="work-summary">I designed a research proposal for a modular viral therapy aimed at selectively eliminating senescent cells while minimizing effects on non-senescent cells.</p>
      <p class="work-note">The proposal tests three layers of selectivity separately and in combination: uPAR-directed viral entry, GLB1-regulated transgene expression, and gene-silencing payloads targeting senescent-cell anti-apoptotic pathways.</p>
    </div>
  `;
  workList.appendChild(proposal);
}

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
