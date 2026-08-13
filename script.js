document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.getElementById('nav');
  const progress=document.getElementById('progress');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateScroll=()=>{
    const max=document.documentElement.scrollHeight-window.innerHeight;
    progress.style.width=(max>0?(window.scrollY/max)*100:0)+'%';
    nav.classList.toggle('scrolled',window.scrollY>30);
  };
  window.addEventListener('scroll',updateScroll,{passive:true});
  updateScroll();

  const reveal=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        reveal.unobserve(entry.target);
      }
    });
  },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));
  if(reduce) document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

  if(!reduce){
    document.querySelectorAll('[data-tilt]').forEach(card=>{
      card.addEventListener('mousemove',event=>{
        const r=card.getBoundingClientRect();
        const x=(event.clientX-r.left)/r.width-.5;
        const y=(event.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(1400px) rotateX(${-y*1.8}deg) rotateY(${x*1.8}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave',()=>{card.style.transform=''});
    });
  }

  const form=document.getElementById('contact-form');
  const status=document.getElementById('form-status');
  const label=document.getElementById('submit-label');
  if(form){
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      status.textContent='Sending…';
      label.textContent='Sending…';
      try{
        const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
        const data=await response.json();
        if(!response.ok||!data.success) throw new Error('Submission failed');
        status.textContent='Message sent. I’ll get back to you soon.';
        form.reset();
      }catch(error){
        status.textContent='Could not send. Please use the email address on the left.';
      }finally{
        label.textContent='Send message';
      }
    });
  }
});