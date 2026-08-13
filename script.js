// ============================================================
// Scroll progress bar
// ============================================================
const progress = document.getElementById('progress');
function updateProgress(){
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const height = h.scrollHeight - h.clientHeight;
  const pct = height > 0 ? (scrolled / height) * 100 : 0;
  if(progress) progress.style.width = pct + '%';
  const nav = document.getElementById('nav');
  if(nav) nav.classList.toggle('scrolled', scrolled > 8);
}
document.addEventListener('scroll', updateProgress, { passive:true });
updateProgress();

// ============================================================
// Mobile nav toggle
// ============================================================
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');
if(navToggle && primaryNav){
  navToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  primaryNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      primaryNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ============================================================
// Scroll reveal
// ============================================================
const revealEls = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.15, rootMargin:'0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// ============================================================
// Contact form
// FormSubmit handles the POST directly. No fetch/CORS layer.
// ============================================================
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const submitLabel = document.getElementById('submit-label');

if(form){
  form.addEventListener('submit', () => {
    const honey = form.querySelector('input[name="_honey"]');
    if(honey && honey.value) return;
    if(submitLabel) submitLabel.textContent = 'Sending…';
    if(statusEl) statusEl.textContent = 'Sending your message…';
  });
}
