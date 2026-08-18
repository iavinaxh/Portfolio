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
}
document.addEventListener('scroll', updateProgress, { passive:true });
updateProgress();

// ============================================================
// Mobile nav toggle
// ============================================================
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
if(navToggle && mobileMenu){
  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ============================================================
// Dark / light mode toggle
// ============================================================
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
function currentTheme(){ return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
if(themeToggle){
  themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try{ localStorage.setItem('theme', next); }catch(e){}
  });
}

// ============================================================
// Skills / Tools toggle
// ============================================================
const skillsTabBtn = document.getElementById('skillsTabBtn');
const toolsTabBtn = document.getElementById('toolsTabBtn');
const skillsPanel = document.getElementById('skillsPanel');
const toolsPanel = document.getElementById('toolsPanel');
if(skillsTabBtn && toolsTabBtn && skillsPanel && toolsPanel){
  function showPanel(which){
    const showSkills = which === 'skills';
    skillsTabBtn.classList.toggle('is-active', showSkills);
    toolsTabBtn.classList.toggle('is-active', !showSkills);
    skillsTabBtn.setAttribute('aria-selected', String(showSkills));
    toolsTabBtn.setAttribute('aria-selected', String(!showSkills));
    skillsPanel.hidden = !showSkills;
    toolsPanel.hidden = showSkills;
  }
  skillsTabBtn.addEventListener('click', () => showPanel('skills'));
  toolsTabBtn.addEventListener('click', () => showPanel('tools'));
}

// ============================================================
// Music player — plays a short original synth melody (Web Audio API)
// ============================================================
(function(){
  const playBtn = document.getElementById('playBtn');
  const player = document.getElementById('musicPlayer');
  const progressBar = document.getElementById('playerProgress');
  const timeLabel = document.getElementById('playerTime');
  if(!playBtn || !player) return;

  const iconPlay = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');

  // a small original ascending/descending pentatonic arpeggio
  const notes = [
    261.63, 293.66, 329.63, 392.00, 440.00, 523.25,
    440.00, 392.00, 329.63, 293.66, 261.63, 196.00
  ];
  const noteDur = 1.5;
  const totalDuration = notes.length * noteDur; // 18s

  let audioCtx = null;
  let startedAt = 0;
  let playing = false;
  let rafId = null;
  let ended = true;

  function fmtTime(s){
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function scheduleMelody(ctx, when){
    notes.forEach((freq, i) => {
      const noteStart = when + i * noteDur;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteStart);
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.16, noteStart + 0.05);
      gain.gain.linearRampToValueAtTime(0.12, noteStart + noteDur * 0.5);
      gain.gain.linearRampToValueAtTime(0, noteStart + noteDur * 0.95);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteStart);
      osc.stop(noteStart + noteDur);
    });
  }

  function tick(){
    if(!audioCtx || !playing) return;
    const elapsed = audioCtx.currentTime - startedAt;
    const pct = Math.min(elapsed / totalDuration, 1);
    if(progressBar) progressBar.style.width = (pct * 100) + '%';
    if(timeLabel) timeLabel.textContent = fmtTime(Math.min(elapsed, totalDuration));
    if(pct >= 1){
      stopPlayback(true);
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function startFresh(){
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
    startedAt = audioCtx.currentTime + 0.05;
    scheduleMelody(audioCtx, startedAt);
    ended = false;
    playing = true;
    player.classList.add('is-playing');
    iconPlay.hidden = true;
    iconPause.hidden = false;
    rafId = requestAnimationFrame(tick);
  }

  function pausePlayback(){
    if(!audioCtx) return;
    audioCtx.suspend();
    playing = false;
    player.classList.remove('is-playing');
    iconPlay.hidden = false;
    iconPause.hidden = true;
    if(rafId) cancelAnimationFrame(rafId);
  }

  function resumePlayback(){
    if(!audioCtx) return;
    audioCtx.resume();
    playing = true;
    player.classList.add('is-playing');
    iconPlay.hidden = true;
    iconPause.hidden = false;
    rafId = requestAnimationFrame(tick);
  }

  function stopPlayback(reachedEnd){
    playing = false;
    ended = true;
    player.classList.remove('is-playing');
    iconPlay.hidden = false;
    iconPause.hidden = true;
    if(rafId) cancelAnimationFrame(rafId);
    if(progressBar) progressBar.style.width = reachedEnd ? '100%' : progressBar.style.width;
    if(reachedEnd){
      setTimeout(() => {
        if(progressBar) progressBar.style.width = '0%';
        if(timeLabel) timeLabel.textContent = '0:00';
      }, 350);
    }
    if(audioCtx){
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  }

  function vibrate(pattern){
    if('vibrate' in navigator){
      try{ navigator.vibrate(pattern); }catch(e){}
    }
  }

  function togglePlayback(){
    if(!audioCtx || ended){
      startFresh();
      vibrate(15);
    } else if(playing){
      pausePlayback();
      vibrate(12);
    } else {
      resumePlayback();
      vibrate(15);
    }
  }

  // clicking anywhere on the player (not just the button) toggles play/pause
  player.addEventListener('click', togglePlayback);
})();

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

// ============================================================
// Project modal — click a project card to read more about it
// ============================================================
(function(){
  const modal = document.getElementById('projectModal');
  if(!modal) return;
  const metaEl = document.getElementById('modalMeta');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  const tagsEl = document.getElementById('modalTags');
  const linksEl = document.getElementById('modalLinks');

  const projects = {
    'delhi-ncr': {
      meta: ['Personal project', 'Live'],
      title: 'Delhi NCR Restaurant Finder',
      body: "A focused discovery platform for finding restaurants and cafés across Delhi NCR. Built the search and filtering logic from scratch — cuisine, budget, and locality filters that narrow results instantly without a page reload.\n\nThe goal was to keep it fast and genuinely useful rather than a generic listings clone: sensible defaults, budget-aware recommendations, and a clean venue layout that works well on mobile where most people would actually use it.",
      tags: ['JavaScript', 'Search', 'Filters', 'Vercel'],
      links: [
        { label: 'Open live product', url: 'https://delhi-cafe-hopping.vercel.app/' },
        { label: 'View source', url: 'https://github.com/iavinaxh/delhi-cafe-hopping' }
      ]
    },
    'text-to-image': {
      meta: ['AI + Full Stack', 'Personal'],
      title: 'Text-to-Image AI Web Application',
      body: "A responsive React frontend wired directly into REST APIs and MongoDB, turning text prompts into generated images. I designed the database schema for storing prompts and generation history, and wrote the frontend–backend integration end to end.\n\nA good chunk of the real work was debugging cross-origin API issues between the React client and the generation backend, plus handling slow-response states gracefully so the UI never feels stuck.",
      tags: ['React.js', 'REST APIs', 'MongoDB', 'JavaScript'],
      links: [
        { label: 'View source', url: 'https://github.com/iavinaxh/Text_to_image_generator' }
      ]
    },
    'vehicle-damage': {
      meta: ['AI + Full Stack', 'Academic'],
      title: 'Vehicle Damage Assessment App',
      body: "A full-stack Flask & MySQL application that assesses automobile damage from input data and outputs predictive repair-cost estimates. The interesting engineering problem here was the Python-to-Java JSON gateway connecting the assessment model to the rest of the stack.\n\nI tuned that gateway to keep average response time under 1.5 seconds, which mattered because the app was meant to feel closer to an instant quote than a batch job.",
      tags: ['Flask', 'MySQL', 'Java', 'Python'],
      links: [
        { label: 'View source', url: 'https://github.com/iavinaxh/Vehicle_damage_detection' }
      ]
    },
    'wellness': {
      meta: ['Professional', 'Live'],
      title: 'Wellness Platform — Plugins & Features',
      body: "At Virtual Studio Private Ltd., I build and customize WordPress plugins and full-stack features for the QORI Wellness Dashboard and the HealThyRam platform. This spans everything from plugin logic to integrating third-party APIs into the dashboard.\n\nEvery API workflow gets validated end-to-end in Postman before it ships, and a good part of the role is diagnosing production issues across PHP, JavaScript, SQL and the API layer connecting them.",
      tags: ['WordPress', 'PHP', 'REST APIs'],
      links: [
        { label: 'Read about the role', url: '#experience' }
      ]
    },
    'portfolio': {
      meta: ['Personal', 'Live'],
      title: 'Personal Portfolio Website',
      body: "This site — an editorial, resume-driven portfolio built from scratch with vanilla HTML, CSS and JavaScript, no framework. Every section is generated from my actual résumé data rather than placeholder content.\n\nIt includes a day/night themed hero, a dark/light mode toggle, scroll-triggered reveal animations, and this very modal you're reading right now. Deployed on Vercel, shipped straight from GitHub.",
      tags: ['HTML/CSS', 'JavaScript', 'Vercel'],
      links: [
        { label: 'Open live site', url: 'https://avinash-portfolio-woad.vercel.app/' },
        { label: 'View source', url: 'https://github.com/iavinaxh/Portfolio' }
      ]
    }
  };

  let lastFocused = null;

  function openModal(id){
    const data = projects[id];
    if(!data) return;
    metaEl.innerHTML = data.meta.map(m => `<span>${m}</span>`).join('');
    titleEl.textContent = data.title;
    bodyEl.textContent = data.body;
    tagsEl.innerHTML = data.tags.map(t => `<span>${t}</span>`).join('');
    linksEl.innerHTML = data.links.map(l =>
      `<a href="${l.url}" ${l.url.startsWith('#') ? '' : 'target="_blank" rel="noreferrer"'}>${l.label} <b>↗</b></a>`
    ).join('');

    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.querySelector('.project-modal-close').focus());
  }

  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if(lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.case-study[data-project]').forEach(card => {
    card.addEventListener('click', (e) => {
      if(e.target.closest('a')) return; // let real links behave normally
      if(e.target.closest('.read-more')){
        openModal(card.getAttribute('data-project'));
        return;
      }
      openModal(card.getAttribute('data-project'));
    });
  });

  modal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();
