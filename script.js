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
// Use FormSubmit's normal POST, then return to this portfolio.
// This avoids the AJAX request hanging in some browsers/extensions.
// ============================================================
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const submitLabel = document.getElementById('submit-label');
const submitButton = form ? form.querySelector('button[type="submit"]') : null;

if(form){
  const params = new URLSearchParams(window.location.search);

  if(params.get('sent') === '1'){
    if(statusEl){
      statusEl.textContent = 'Thanks! Your message has been sent successfully.';
      statusEl.className = 'form-status is-success';
    }
    if(submitLabel) submitLabel.textContent = 'Message sent';
    window.history.replaceState({}, document.title, window.location.pathname + '#contact');
  }

  form.addEventListener('submit', () => {
    const honey = form.querySelector('input[name="_honey"]');
    if(honey && honey.value) return;

    // FormSubmit redirects back to the portfolio after successful submission.
    // The ?sent=1 flag lets this page show the success message after returning.
    let next = form.querySelector('input[name="_next"]');
    if(!next){
      next = document.createElement('input');
      next.type = 'hidden';
      next.name = '_next';
      form.appendChild(next);
    }
    next.value = window.location.origin + window.location.pathname + '?sent=1#contact';

    if(submitButton) submitButton.disabled = true;
    if(submitLabel) submitLabel.textContent = 'Sending…';
    if(statusEl){
      statusEl.textContent = 'Sending your message…';
      statusEl.className = 'form-status is-sending';
    }
  });
}
