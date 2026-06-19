/* ============================================================
   POPLAND · mobile, "Tune your Popie"  (vanilla JS, no build)
   Tabs: Tune (swipe deck) · Tasks · Me
   ============================================================ */

const POP = `<svg class="pip" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><radialGradient id="pg" cx="34%" cy="28%" r="78%">
    <stop offset="0%" stop-color="#ffb39a"/><stop offset="55%" stop-color="#ff5a36"/><stop offset="100%" stop-color="#dc3f1b"/></radialGradient></defs>
  <path d="M50 8c20 0 34 14 34 36 0 26-15 42-34 42S16 70 16 44C16 22 30 8 50 8Z" fill="url(#pg)"/>
  <circle cx="50" cy="6" r="3.4" fill="#2f6e5c"/><rect x="48.6" y="6" width="2.8" height="9" fill="#2f6e5c"/>
  <ellipse cx="39" cy="46" rx="8.5" ry="9.5" fill="#fffdf8"/><ellipse cx="61" cy="46" rx="8.5" ry="9.5" fill="#fffdf8"/>
  <circle cx="40.5" cy="48" r="4" fill="#241a11"/><circle cx="62.5" cy="48" r="4" fill="#241a11"/>
  <circle cx="42" cy="46.6" r="1.3" fill="#fff"/><circle cx="64" cy="46.6" r="1.3" fill="#fff"/>
  <circle cx="31" cy="58" r="4.5" fill="#ff8a6b" opacity=".55"/><circle cx="69" cy="58" r="4.5" fill="#ff8a6b" opacity=".55"/>
  <path d="M42 60q8 7 16 0" stroke="#241a11" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`;
const popMini = px => POP.replace('class="pip"', `class="pip" style="width:${px}px;height:${px}px"`);

/* ---------- the deck: swipe statements + scenario MC ---------- */
const CARDS = [
  { type:'swipe', tag:'Habits',   emoji:'💬', q:'You’d rather text than call, almost always.' },
  { type:'swipe', tag:'Consumer', emoji:'⭐', q:'You read the reviews before most purchases.' },
  { type:'mc',    tag:'Pricing',  q:'A coffee you love raises its price 20%. You…', o:['Switch brands','Cut back but stay','Pay it, no big deal','Stop buying it'] },
  { type:'swipe', tag:'Values',   emoji:'🌱', q:'You’d pay more for a brand that shares your values.' },
  { type:'mc',    tag:'Lifestyle',q:'Free Friday night, the real you?', o:['Out with friends','Cozy at home','A side project','Depends on my mood'] },
  { type:'swipe', tag:'Consumer', emoji:'📱', q:'You’re usually first of your friends to try new tech.' },
  { type:'mc',    tag:'Money',    q:'You find $500 you’d forgotten about. You…', o:['Save it','Treat yourself','Invest it','Pay down debt'] },
  { type:'swipe', tag:'Values',   emoji:'✈️', q:'You prefer experiences over owning more things.' },
  { type:'mc',    tag:'Habits',   q:'New restaurant, you order…', o:['My usual safe pick','The weirdest thing','What’s popular','Ask the server'] },
  { type:'swipe', tag:'Habits',   emoji:'📥', q:'A messy inbox genuinely stresses you out.' },
];
const STOPS = [4, 8];          // show a progress beat after this many answered

const TASKS = [
  { id:'t1', org:'Lumi',       lg:'✦', bg:'#c86b8e', t:'Skincare habits, quick interview', d:'Lumi hand-picked your profile. 6 short questions.', rew:2.00 },
  { id:'t2', org:'Daily Brew', lg:'☕', bg:'#5b3a29', t:'Latte pricing reaction', d:'Popie can answer this from what it knows. Just send it.', rew:0.80 },
  { id:'t3', org:'NorthBank',  lg:'$', bg:'#2f6e5c', t:'Money decision study', d:'How you weigh risk and savings. 5 questions.', rew:2.50 },
];

const PERSONA = {
  values:['Experiences > things','Quietly steers','Consent-first'],
  habits:['Cozy nights in','Adventurous orderer','Texts over calls'],
  interests:['Coffee','Travel','Indie games','Skincare'],
};

/* ---------- state ---------- */
const S = {
  tab:'tune',
  idx:0, answers:{}, fidBase:41, earnings:8.40,
  interAt:null,                 // when set, show the progress beat for this count
  tasks:{},                     // id -> 'acc' | 'dec'
  settings:{ notif:true, autosend:false, private:false },
};

const fidelity = () => Math.min(99, Math.round(S.fidBase + Object.keys(S.answers).length * 3.4));
const avgPerTask = f => Math.max(1, Math.round(2.5 + f * 0.4167));
const openTasks = () => TASKS.filter(t => !S.tasks[t.id]).length;

/* ============================================================ */
function render(){
  document.getElementById('view').innerHTML =
    S.tab==='tune' ? tuneScreen() : S.tab==='tasks' ? tasksScreen() : meScreen();
  renderTabbar();
  postRender();
}
function renderTabbar(){
  const ic = {
    tune:`<path d="M4 7h10M4 12h16M4 17h7"/><circle cx="18" cy="7" r="2.4"/><circle cx="14" cy="17" r="2.4"/>`,
    tasks:`<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 9h6M9 13h6M9 17h3"/>`,
    me:`<circle cx="12" cy="9" r="3.6"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>`,
  };
  const tabs=[['tune','Tune'],['tasks','Tasks'],['me','Me']];
  document.getElementById('tabbar').innerHTML = tabs.map(([k,l])=>`
    <button data-tab="${k}" class="${S.tab===k?'on':''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ic[k]}</svg>
      ${l}${k==='tasks'&&openTasks()?`<span class="badge">${openTasks()}</span>`:''}
    </button>`).join('');
}

/* ---------- HUD ---------- */
function hud(){
  const f=fidelity();
  return `<div class="hud">
    <span class="mini-ring" style="--p:0"><b id="mr">${f}%</b></span>
    <span class="meta"><span class="k">Persona fidelity</span><span class="v" id="mv">~$${avgPerTask(f)} per task</span></span>
    <span class="earn">$${S.earnings.toFixed(2)}</span>
  </div>`;
}

/* ============================================================
   TUNE, the swipe deck
   ============================================================ */
function tuneScreen(){
  if (S.interAt !== null) return hud() + interBeat();
  if (S.idx >= CARDS.length) return hud() + doneBeat();
  const c = CARDS[S.idx];
  const back = CARDS[S.idx+1] ? `<div class="card back"></div>` : '';
  const actions = c.type==='swipe' ? `<div class="swipe-actions">
      <button class="sa-nope" data-swipe="left" aria-label="Not me">✕</button>
      <button class="sa-info" data-skip aria-label="Skip">↷</button>
      <button class="sa-like" data-swipe="right" aria-label="That's me">♥</button>
    </div>` : '';
  return hud() + `<div class="tune">
    <div class="tune-head"><span class="eyebrow">Tune your Popie</span>
      <h1>Is this you?</h1>
      <div class="counter">card ${S.idx+1} of ${CARDS.length}</div></div>
    <div class="deck">${back}${cardHTML(c)}</div>
    ${actions}
  </div>`;
}
function cardHTML(c){
  if (c.type==='swipe'){
    return `<div class="card top swipe-card" data-type="swipe">
      <span class="stamp like">ME</span><span class="stamp nope">NOT ME</span>
      <span class="tag">${c.tag}</span>
      <div class="emoji">${c.emoji}</div>
      <div class="q">${c.q}</div>
      <div class="hint">swipe → if it’s you · ← if it’s not</div>
    </div>`;
  }
  return `<div class="card top mc-card" data-type="mc">
    <span class="tag">${c.tag} · pick one</span>
    <div class="q">${c.q}</div>
    <div class="mc-opts">${c.o.map((o,i)=>`<button class="mc-opt" data-mc="${i}">${o}</button>`).join('')}</div>
  </div>`;
}
function interBeat(){
  const f=fidelity();
  return `<div class="inter fade">
    ${popMini(96)}
    <div class="big">${f}%</div><div class="lbl">persona fidelity</div>
    <div class="gain-bar"><i style="width:0" data-grow="${f}"></i></div>
    <h2>Nice, Popie knows you better.</h2>
    <p>Keep tuning. The higher your fidelity, the more your Popie earns when it works for you.</p>
    <div class="earn-teaser">now ~$${avgPerTask(f)} / task →  $${avgPerTask(Math.min(99,f+20))} at higher fidelity</div>
    <button class="btn btn-primary btn-block" data-continue>Keep tuning →</button>
  </div>`;
}
function doneBeat(){
  const f=fidelity();
  return `<div class="inter fade">
    ${popMini(96)}
    <div class="big">${f}%</div><div class="lbl">persona fidelity</div>
    <div class="gain-bar"><i style="width:0" data-grow="${f}"></i></div>
    <h2>That’s a sharper you.</h2>
    <p>Your Popie is ready to earn. Check Tasks to send it out, or keep tuning anytime to push fidelity higher.</p>
    <div class="earn-teaser">earning power: ~$${avgPerTask(f)} / task</div>
    <button class="btn btn-primary btn-block" data-gotasks>See my tasks (${openTasks()})</button>
    <button class="btn btn-ghost btn-block" style="margin-top:10px" data-restart>Tune more</button>
  </div>`;
}

/* ---------- TASKS ---------- */
function tasksScreen(){
  return `<div class="page fade">
    <h1>Tasks</h1>
    <p class="sub">Businesses want your Popie. Accept to earn, decline anything that’s not for you.</p>
    ${TASKS.map(t=>{
      const st=S.tasks[t.id];
      const body = st ? `<div class="resolved-flag ${st==='acc'?'acc':'dec'}">${st==='acc'?`✓ Accepted, Popie sent · +$${t.rew.toFixed(2)}`:'✕ Declined'}</div>`
        : `<div class="acts">
            <button class="btn btn-ghost" data-decline="${t.id}">Decline</button>
            <button class="btn btn-spruce" data-accept="${t.id}">Accept · $${t.rew.toFixed(2)}</button></div>`;
      return `<div class="mtask ${st?'resolved':''}">
        <div class="row1"><span class="lg" style="background:${t.bg}">${t.lg}</span>
          <span class="who"><span class="o">${t.org}</span><span class="t">${t.t}</span></span>
          <span class="rew">$${t.rew.toFixed(2)}</span></div>
        <div class="d">${t.d}</div>${body}</div>`;
    }).join('')}
  </div>`;
}

/* ---------- ME / settings ---------- */
function meScreen(){
  const f=fidelity();
  const grp=(k,arr,cls='')=>`<div class="kgroup"><span class="kl">${k}</span><div class="kchips">${arr.map(c=>`<span class="chip ${cls}">${c}</span>`).join('')}</div></div>`;
  const set=(key,label,sub,icon)=>`<div class="setrow">
    <span class="si">${icon}</span><span class="st">${label}<small>${sub}</small></span>
    <button class="toggle ${S.settings[key]?'on':''}" data-set="${key}"></button></div>`;
  return `<div class="page fade">
    <div class="me-hero">
      <div class="orb" style="background:radial-gradient(80% 120% at 70% 0%,rgba(232,164,39,.45),transparent 60%),linear-gradient(150deg,#2f6e5c,#234f43)">${popMini(60)}</div>
      <div class="nm">Popie</div>
      <div class="pills"><span class="pill pill-spruce">${f}% fidelity</span><span class="pill pill-gold">~$${avgPerTask(f)}/task</span><span class="pill pill-ink">$${S.earnings.toFixed(2)} earned</span></div>
    </div>
    <div class="me-card"><h3>What Popie knows about you</h3>
      ${grp('Values',PERSONA.values,'t')}${grp('Habits',PERSONA.habits,'t')}${grp('Interests',PERSONA.interests)}
      <button class="btn btn-ghost btn-block" style="margin-top:6px;font-size:14px" data-tab="tune">Tune to improve →</button>
    </div>
    <div class="me-card"><h3>Settings</h3>
      ${set('notif','Push notifications','New tasks & milestones',`🔔`)}
      ${set('autosend','Auto-send Popie','Accept high-match tasks for me',`🤖`)}
      ${set('private','Private mode','Hide profile from new businesses',`🔒`)}
      <div class="setrow"><span class="si">📄</span><span class="st">Your basics<small>Birth date, location, education…</small></span><span style="color:var(--ink-faint)">›</span></div>
    </div>
  </div>`;
}

/* ============================================================
   POST-RENDER: animate rings/bars, attach swipe drag
   ============================================================ */
function postRender(){
  const f=fidelity();
  document.querySelectorAll('.mini-ring').forEach(r=>requestAnimationFrame(()=>r.style.setProperty('--p',f)));
  document.querySelectorAll('[data-grow]').forEach(el=>requestAnimationFrame(()=>{el.style.width=el.dataset.grow+'%';}));
  attachDrag(document.querySelector('.card.top[data-type="swipe"]'));
}
function refreshHud(){
  const f=fidelity();
  const mr=document.getElementById('mr'); if(mr) mr.textContent=`${f}%`;
  const mv=document.getElementById('mv'); if(mv) mv.textContent=`~$${avgPerTask(f)} per task`;
  document.querySelectorAll('.mini-ring').forEach(r=>r.style.setProperty('--p',f));
}

function attachDrag(card){
  if(!card) return;
  const like=card.querySelector('.stamp.like'), nope=card.querySelector('.stamp.nope');
  let sx=0, sy=0, dx=0, dragging=false;
  card.addEventListener('pointerdown', e=>{ dragging=true; sx=e.clientX; sy=e.clientY; card.style.transition='none'; try{card.setPointerCapture(e.pointerId);}catch(_){}});
  card.addEventListener('pointermove', e=>{
    if(!dragging) return;
    dx=e.clientX-sx; const dy=e.clientY-sy;
    card.style.transform=`translate(${dx}px, ${dy*0.25}px) rotate(${dx/18}deg)`;
    const k=Math.min(Math.abs(dx)/100,1);
    if(dx>0){ like.style.opacity=k; nope.style.opacity=0; } else { nope.style.opacity=k; like.style.opacity=0; }
  });
  const end=()=>{
    if(!dragging) return; dragging=false;
    if(dx>90) commitSwipe('right');
    else if(dx<-90) commitSwipe('left');
    else { card.style.transition='transform .25s var(--ease)'; card.style.transform=''; like.style.opacity=0; nope.style.opacity=0; }
    dx=0;
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}
function commitSwipe(dir){
  const card=document.querySelector('.card.top'); if(!card) return;
  const off = dir==='right'? 520 : -520;
  card.style.transition='transform .35s ease, opacity .35s';
  card.style.transform=`translate(${off}px,-40px) rotate(${dir==='right'?22:-22}deg)`;
  card.style.opacity='0';
  setTimeout(()=>answer(dir==='right'?'me':'notme'), 270);
}

/* advance: record answer, bump fidelity, maybe show a progress beat */
function answer(val){
  S.answers[S.idx]=val; S.idx++;
  const n=Object.keys(S.answers).length;
  if (STOPS.includes(n) && S.idx < CARDS.length) S.interAt=n;
  render();
}

/* ============================================================ EVENTS */
document.addEventListener('click', e=>{
  const el=e.target.closest('[data-tab],[data-mc],[data-swipe],[data-skip],[data-continue],[data-gotasks],[data-restart],[data-accept],[data-decline],[data-set]');
  if(!el) return; const d=el.dataset;
  if(d.tab!==undefined){ S.tab=d.tab; S.interAt=null; return render(); }
  if(d.swipe!==undefined){ return commitSwipe(d.swipe); }
  if(d.skip!==undefined){ S.idx++; return render(); }
  if(d.mc!==undefined){
    el.classList.add('picked');
    setTimeout(()=>answer('mc:'+d.mc), 180);
    return;
  }
  if(d.continue!==undefined){ S.interAt=null; return render(); }
  if(d.gotasks!==undefined){ S.tab='tasks'; S.interAt=null; return render(); }
  if(d.restart!==undefined){ S.idx=0; S.answers={}; S.fidBase=Math.min(70,fidelity()); S.interAt=null; return render(); }
  if(d.accept!==undefined){ const t=TASKS.find(x=>x.id===d.accept); S.tasks[d.accept]='acc'; S.earnings+=t.rew; return render(); }
  if(d.decline!==undefined){ S.tasks[d.decline]='dec'; return render(); }
  if(d.set!==undefined){ S.settings[d.set]=!S.settings[d.set]; return render(); }
});

render();
