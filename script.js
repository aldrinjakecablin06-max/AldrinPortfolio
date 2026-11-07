const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Fit: choose the biggest font size at which the current page needs no scrolling
function fit(){
  const p = document.querySelector(".page:not([hidden])");
  if (!p) return;
  let fs = Math.min(30, innerHeight * 0.034);
  while (fs > 9){
    document.documentElement.style.setProperty("--fs", fs + "px");
    if (p.scrollHeight <= p.clientHeight + 1 && p.scrollWidth <= p.clientWidth + 1) break;
    fs -= 0.5;
  }
}

// Simple page router (#home, #personal-information, #education)
const pages = ["home", "personal-information", "education"];
function route(){
  let h = location.hash.slice(1);
  if (!pages.includes(h)) h = "home";
  document.querySelectorAll(".page").forEach(p => p.hidden = p.dataset.page !== h);
  document.querySelectorAll("[data-link]").forEach(a => a.classList.toggle("active", a.dataset.link === h));
  fit();
}
addEventListener("hashchange", route);
addEventListener("resize", fit);
if (document.fonts) document.fonts.ready.then(fit);

// Typing effect (fit is measured with the full name first, so nothing jumps later)
const full = "Aldrin Jake Cablin", el = document.getElementById("typed");
el.textContent = full;
route();
if (!reduce) {
  el.textContent = "";
  let i = 0;
  (function type(){ el.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(type, 90); else fit(); })();
}

// Tilt effect on the profile photo
const photo = document.querySelector(".photo");
if (!reduce) {
  photo.addEventListener("pointermove", e => {
    const r = photo.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    photo.style.setProperty("--ry", (x * 16) + "deg");
    photo.style.setProperty("--rx", (-y * 16) + "deg");
    photo.style.setProperty("--s", 1.04);
  });
  photo.addEventListener("pointerleave", () => {
    photo.style.setProperty("--ry", "0deg");
    photo.style.setProperty("--rx", "0deg");
    photo.style.setProperty("--s", 1);
  });
}

// Starfield + shooting stars
const c = document.getElementById("stars"), ctx = c.getContext("2d");
let W, H, stars = [], shots = [];
function resize(){
  W = c.width = innerWidth; H = c.height = innerHeight;
  stars = Array.from({length: Math.round(W*H/7000)}, () => ({x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.4+.3, p:Math.random()*6.28, s:Math.random()*.02+.005}));
}
addEventListener("resize", resize); resize();
function frame(){
  ctx.clearRect(0,0,W,H);
  for (const s of stars){
    s.p += s.s;
    ctx.globalAlpha = reduce ? .8 : .45 + .55*Math.abs(Math.sin(s.p));
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,6.28); ctx.fill();
  }
  if (!reduce && Math.random() < .006) shots.push({x:Math.random()*W*.8, y:Math.random()*H*.4, l:0});
  shots = shots.filter(s => s.l < 60);
  for (const s of shots){
    s.l++; s.x += 9; s.y += 5;
    const g = ctx.createLinearGradient(s.x,s.y,s.x-90,s.y-50);
    g.addColorStop(0,"rgba(255,255,255,.9)"); g.addColorStop(1,"rgba(255,255,255,0)");
    ctx.globalAlpha = 1 - s.l/60; ctx.strokeStyle = g; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-90,s.y-50); ctx.stroke();
  }
  requestAnimationFrame(frame);
}
frame();
