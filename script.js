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

  playBtn.addEventListener('click', () => {
    if(!audioCtx || ended){
      startFresh();
    } else if(playing){
      pausePlayback();
    } else {
      resumePlayback();
    }
  });
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
