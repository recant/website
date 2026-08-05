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
