document.addEventListener('DOMContentLoaded',()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='cinematic.css';document.head.appendChild(css);

  const nav=document.querySelector('.nav'),progress=document.querySelector('.progress'),cursor=document.querySelector('.cursor'),dot=document.querySelector('.cursor-dot');
  const updateScroll=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?scrollY/max*100:0)+'%';nav.classList.toggle('scrolled',scrollY>40)};
  addEventListener('scroll',updateScroll,{passive:true});updateScroll();

  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');reveal.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

  let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px'});
  (function loop(){cx+=(mx-cx)*.14;cy+=(my-cy)*.14;cursor.style.left=cx+'px';cursor.style.top=cy+'px';requestAnimationFrame(loop)})();
  document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.1}px,${(e.clientY-r.top-r.height/2)*.1}px)`});el.addEventListener('mouseleave',()=>el.style.transform='')});
  document.querySelectorAll('[data-tilt]').forEach(card=>{card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1100px) rotateX(${-y*3}deg) rotateY(${x*3}deg) translateY(-3px)`});card.addEventListener('mouseleave',()=>card.style.transform='')});

  const canvas=document.getElementById('ambient'),ctx=canvas.getContext('2d');let pts=[];
  const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight;pts=Array.from({length:Math.min(55,Math.max(18,Math.floor(innerWidth*innerHeight/30000)))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.2+.35}))};
  resize();addEventListener('resize',resize);
  const animate=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>canvas.width)p.vx*=-1;if(p.y<0||p.y>canvas.height)p.vy*=-1;ctx.fillStyle='rgba(215,255,79,.28)';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const a=pts[i],b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<110){ctx.strokeStyle=`rgba(215,255,79,${.07*(1-d/110)})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}requestAnimationFrame(animate)};animate();

  const form=document.getElementById('contact-form'),status=document.getElementById('form-status'),label=document.getElementById('submit-label');
  if(form)form.addEventListener('submit',async e=>{e.preventDefault();status.textContent='Sending message…';label.textContent='Sending…';try{const res=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});const data=await res.json();if(!res.ok||!data.success)throw new Error();status.textContent='Message sent successfully. I’ll get back to you soon.';form.reset()}catch(err){status.textContent='Could not send right now. Please email avisingh21122003@gmail.com directly.'}finally{label.textContent='Send message'}});
});