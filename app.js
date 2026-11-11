const $ = id => document.getElementById(id);
let chosen = 25, remaining = chosen*60, running = false, interval = null;
let sessions = JSON.parse(localStorage.getItem("pf_sessions") || "[]");
const todayKey = () => new Date().toISOString().slice(0,10);
const save = () => localStorage.setItem("pf_sessions", JSON.stringify(sessions));
function paint(){
  const m=String(Math.floor(remaining/60)).padStart(2,"0"), s=String(remaining%60).padStart(2,"0");
  $("time").textContent=`${m}:${s}`;
  $("timerState").textContent=running?"STAY IN THE FLOW":(remaining===0?"SESSION COMPLETE":"READY TO FOCUS");
  $("startBtn").innerHTML=running?"Ⅱ &nbsp; Pause":"▶ &nbsp; Start focus";
  const elapsed=chosen*60-remaining, deg=Math.max(0,Math.min(360,elapsed/(chosen*60)*360));
  $("ring").style.background=`conic-gradient(var(--green) ${deg}deg,#e7eee8 ${deg}deg)`;
  const today=sessions.filter(x=>x.day===todayKey());
  $("todayMinutes").textContent=today.reduce((a,x)=>a+x.minutes,0);
  $("todaySessions").textContent=today.length;
  $("allSessions").textContent=sessions.length;
  $("history").innerHTML=sessions.length?sessions.slice(0,6).map(x=>`<div class="session-row"><div><strong>${escapeHtml(x.subject)}</strong><div class="session-sub">${new Date(x.at).toLocaleString()}</div></div><strong>${x.minutes} min</strong></div>`).join(""):'<div class="history-empty">Your completed sessions will appear here.</div>';
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function stop(){running=false;clearInterval(interval);interval=null;}
function finish(){
  stop();
  sessions.unshift({subject:$("subject").value,minutes:chosen,day:todayKey(),at:Date.now()});
  save(); if("Notification" in window && Notification.permission==="granted") new Notification("Focus session complete",{body:"Nice work. Take a short break."});
  paint();
}
$("startBtn").addEventListener("click",()=>{
  if(running){stop();paint();return;}
  if(remaining===0)remaining=chosen*60;
  running=true;paint();
  interval=setInterval(()=>{remaining--;if(remaining<=0){remaining=0;finish();}else paint();},1000);
});
$("resetBtn").addEventListener("click",()=>{stop();remaining=chosen*60;paint();});
document.querySelectorAll("#presets button").forEach(b=>b.addEventListener("click",()=>{
  if(running)return;chosen=Number(b.dataset.min);remaining=chosen*60;
  document.querySelectorAll("#presets button").forEach(x=>x.classList.toggle("selected",x===b));paint();
}));
$("clearBtn").addEventListener("click",()=>{if(confirm("Clear all saved session history on this device?")){sessions=[];save();paint();}});
$("themeBtn").addEventListener("click",()=>document.body.classList.toggle("dark"));
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
if("Notification" in window && Notification.permission==="default") { /* Ask only when user chooses notifications in a later version. */ }
paint();
