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
// Contact form — progressive enhancement over FormSubmit
// ============================================================
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const submitLabel = document.getElementById('submit-label');

if(form){
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const honey = form.querySelector('input[name="_honey"]');
    if(honey && honey.value){ return; } // bot trap

    submitLabel.textContent = 'Sending…';
    statusEl.textContent = '';

    try{
      const res = await fetch(form.action, {
        method:'POST',
        body:new FormData(form),
        headers:{ 'Accept':'application/json' }
      });
      if(res.ok){
        submitLabel.textContent = 'Send message';
        statusEl.textContent = "Thanks — I'll get back to you soon.";
        form.reset();
      } else {
        throw new Error('Request failed');
      }
    } catch(err){
      submitLabel.textContent = 'Send message';
      statusEl.textContent = 'Something went wrong — email me directly instead.';
    }
  });
}
