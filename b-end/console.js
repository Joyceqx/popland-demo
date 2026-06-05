/* ============================================================
   Popland — B-end Console (2026-06-05)
   v1 shell (sidebar: Home · Studies · Chats · Agents +
   past studies / past chats / agent library)
   × v2 logic (sim-first study flow + Behavior Engine + interview).

   Marketing homepage lives separately in index.html.
   Vanilla, no build step. Scripted, not wired to a backend.
   ============================================================ */

const STATE = {
  section: 'home',                  // sidebar highlight: home | studies | chats | agents
  screen: 'home',                   // home|studies|chats|intake|chat|result|pool|interview|synthesis
  fromStudy: false,
  study: {
    rq: "If we launch a fragrance-free retinol night serum at $39, will our core skincare audience buy it — or is $39 a barrier?",
    audience: "Skincare-engaged women, 28–45, US suburban & urban, household income $80k+, ingredient-conscious.",
    context: "We've historically priced serums at $24–29. Clean-beauty positioning. Hypothesis: ingredient-conscious buyers will pay a premium for fragrance-free + clinical retinol.",
    files: [
      { name: "Audience_Persona_2026.pdf",    size: "1.4 MB", type: "pdf" },
      { name: "Brand_Tracker_Q4_2025.xlsx",   size: "820 KB", type: "xls" },
      { name: "Concept_Test_Retinol_2025.pdf",size: "2.1 MB", type: "pdf" },
    ],
  },
  thread: [], beat: 0, typing: false, currentChips: [], proposalShown: false,
  poolFilter: 'all', poolSearch: '', selected: [], prefiltered: false,
  guide: [], asked: [], transcript: {},
};

// ── helpers ─────────────────────────────────────────────────
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = () => $('#app');
function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
let toastTimer;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2400); }
const FT_LABEL = { pdf:'PDF', xls:'XLS', img:'IMG', doc:'DOC' };

// ── agents ──────────────────────────────────────────────────
const PAL = ['#7c3aed','#2563eb','#059669','#db2777','#f59e0b','#0891b2','#9333ea','#e11d48'];
const AGENTS = [
  { id:'a1', name:'Maya R.',  age:34, loc:'Austin, TX',     g:'F',  tags:['Ingredient-led','Repeat buyer'],   fid:0.82, hired:true,  prov:'4 calibration sessions · active 2d ago', quote:'I read every INCI list before I buy.' },
  { id:'a2', name:'Priya N.', age:41, loc:'Chicago, IL',    g:'F',  tags:['Clean-beauty','Prestige buyer'],   fid:0.76, hired:true,  prov:'3 sessions · active 5d ago',            quote:"I'll pay more if the formulation is genuinely better." },
  { id:'a3', name:'Dana K.',  age:29, loc:'Portland, OR',   g:'NB', tags:['Eco-conscious','Clean-beauty'],    fid:0.71, hired:true,  prov:'2 sessions · active 1d ago',            quote:'Fragrance-free is non-negotiable for me.' },
  { id:'a4', name:'Jordan W.',age:38, loc:'Denver, CO',     g:'F',  tags:['Value-seeker','Repeat buyer'],     fid:0.64, hired:true,  prov:'2 sessions · active 1w ago',            quote:'$39 for a serum makes me hesitate.' },
  { id:'a5', name:'Sofia L.', age:27, loc:'Miami, FL',      g:'F',  tags:['First-timer','Prestige buyer'],    fid:0.58, hired:false, prov:'1 session · active 3d ago',             quote:'I buy what my favorite creators recommend.' },
  { id:'a6', name:'Aisha M.', age:45, loc:'Atlanta, GA',    g:'F',  tags:['Sensitive skin','Ingredient-led'], fid:0.69, hired:false, prov:'2 sessions · active 4d ago',            quote:'Retinol scares me a little — I need reassurance.' },
  { id:'a7', name:'Chloe T.', age:31, loc:'Seattle, WA',    g:'F',  tags:['Clean-beauty','Eco-conscious'],    fid:0.55, hired:false, prov:'1 session · active 6d ago',             quote:'I switched to refillable everything last year.' },
  { id:'a8', name:'Nina P.',  age:36, loc:'Boston, MA',     g:'F',  tags:['Prestige buyer','Repeat buyer'],   fid:0.73, hired:true,  prov:'3 sessions · active 2d ago',            quote:'My serum shelf is basically a flex.' },
  { id:'a9', name:'Riya S.',  age:24, loc:'New York, NY',   g:'F',  tags:['First-timer','Value-seeker'],      fid:0.49, hired:false, prov:'1 session · active 1w ago',             quote:"I'm building a routine on a student budget." },
  { id:'a10',name:'Grace H.', age:49, loc:'Phoenix, AZ',    g:'F',  tags:['Sensitive skin','Value-seeker'],   fid:0.52, hired:false, prov:'1 session · active 5d ago',             quote:'Drugstore retinol did nothing for me.' },
  { id:'a11',name:'Lena V.',  age:33, loc:'Minneapolis, MN',g:'F',  tags:['Ingredient-led','Eco-conscious'],  fid:0.67, hired:false, prov:'2 sessions · active 3d ago',            quote:'Show me the clinical study or I scroll past.' },
  { id:'a12',name:'Mei C.',   age:40, loc:'San Jose, CA',   g:'F',  tags:['Prestige buyer','Clean-beauty'],   fid:0.70, hired:true,  prov:'2 sessions · active 4d ago',            quote:'Premium is fine if the brand has a point of view.' },
];
const agentById = id => AGENTS.find(a => a.id === id);
const agentColor = a => PAL[AGENTS.indexOf(a) % PAL.length];
const STUDY_SEGMENT = ['Ingredient-led','Clean-beauty','Eco-conscious'];

// ── mock history ────────────────────────────────────────────
const PAST_STUDIES = [
  { id:'s1', title:'Fragrance-free retinol @ $39', q:'Will our core audience buy a $39 fragrance-free retinol serum?', status:'Calibrating', fid:0.46, date:'Jun 5', live:true },
  { id:'s2', title:'Refill subscription willingness', q:'Would repeat buyers switch to a refill subscription?',       status:'Done',        fid:0.72, date:'May 28' },
  { id:'s3', title:'Gen-Z cleanser scent test',      q:'Which scent direction wins with Gen-Z first-timers?',         status:'Simulated',   fid:0.51, date:'May 21' },
];
const PAST_CHATS = [
  { id:'pc1', agents:['a1'],                 topic:'Retinol concerns & sensitivity',          date:'Jun 2' },
  { id:'pc2', agents:['a1','a2','a4','a8'],  topic:'Reactions to a $39 price point',          date:'May 30' },
  { id:'pc3', agents:['a2'],                 topic:'What makes you switch clean-beauty brands',date:'May 24' },
];

// ── discussion guide + scripted answers ─────────────────────
const DEFAULT_GUIDE = [
  { id:'g1', q:'Would you buy a fragrance-free retinol serum at $39?' },
  { id:'g2', q:"What's the biggest thing that would stop you?" },
  { id:'g3', q:'How does $39 compare to what you usually spend on a serum?' },
  { id:'g4', q:'What would make you trust a new retinol product?' },
];
function answerFor(agent, qid){
  const has = t => agent.tags.includes(t);
  if (qid==='g1'){
    if (has('Value-seeker'))   return "Honestly $39 is a stretch — I'd wait for a deal or a smaller trial size.";
    if (has('Prestige buyer')) return "If the formulation's legit, yes. $39 is fair for a retinol that actually works.";
    if (has('Sensitive skin')) return "Maybe — but only if it's gentle. Retinol and my skin have a history.";
    return "Probably, if it's genuinely fragrance-free and the retinol is well-stabilized.";
  }
  if (qid==='g2'){
    if (has('Value-seeker'))   return "The price. $39 is above my usual serum budget.";
    if (has('Prestige buyer')) return "Weak proof. If it reads as just marketing, I'm out.";
    if (has('Sensitive skin')) return "Irritation. I'd need the strength and to know it's buffered.";
    if (has('Eco-conscious'))  return "Packaging and any hidden fragrance — that kills the repurchase.";
    return "A thin ingredient story. Show me the percentage and the studies.";
  }
  if (qid==='g3'){
    if (has('Value-seeker'))   return "Way more — I normally spend $20–25.";
    if (has('Prestige buyer')) return "About right, even cheaper than my usual $50+ serums.";
    return "A bit higher than my usual $28–32, but not crazy.";
  }
  if (qid==='g4'){
    if (has('Sensitive skin')) return "A sensitive-skin claim I can trust — ideally a patch-test kit.";
    if (has('Prestige buyer')) return "A brand with a clear point of view and derm backing.";
    if (has('Value-seeker'))   return "Reviews from people like me and a money-back guarantee.";
    return "A clear ingredient list with the retinol % and a real clinical reference.";
  }
  return `Given I'm pretty ${agent.tags[0].toLowerCase()}, it depends on whether the product proves itself. ${agent.quote}`;
}

// ============================================================
//  SHELL — sidebar + subnav
// ============================================================
const NAVS = [
  { k:'home',    l:'Home',    ic:'◇' },
  { k:'studies', l:'Studies', ic:'▤' },
  { k:'chats',   l:'Chats',   ic:'▢' },
  { k:'agents',  l:'Agents',  ic:'◑' },
];
function renderSidebar(){
  $('#sidebar').innerHTML = `
    <a class="sb-logo" href="index.html">Popland</a>
    <div class="sb-tag">Research Console</div>
    <button class="sb-new" id="sb-new">+ New study</button>
    <nav class="sb-nav">${NAVS.map(n=>`
      <button class="sb-item ${STATE.section===n.k?'on':''}" data-k="${n.k}"><span class="sb-ic">${n.ic}</span>${n.l}</button>`).join('')}</nav>
    <div class="sb-foot"><div class="sb-user"><span class="sb-ava">JL</span><div><div class="sb-uname">Joyce L.</div><div class="sb-urole">Brand · Popland</div></div></div></div>`;
  $('#sb-new').onclick = () => nav('studies','intake');
  $$('.sb-item').forEach(b => b.onclick = () => {
    const k = b.dataset.k;
    if (k==='home')    nav('home','home');
    if (k==='studies') nav('studies','studies');
    if (k==='chats')   nav('chats','chats');
    if (k==='agents'){ STATE.fromStudy=false; STATE.prefiltered=false; STATE.section='agents'; openPool(); }
  });
}
const STEPS = ['Brief','Refine','Result'];
const STEP_OF = { intake:0, chat:1, result:2 };
function renderSubnav(){
  const n = $('#subnav'); const s = STATE.screen;
  if (s in STEP_OF){
    n.className='subnav stepper';
    const active = STEP_OF[s];
    n.innerHTML = STEPS.map((label,i)=>{ const cls=i<active?'done':i===active?'active':'';
      const line=i<STEPS.length-1?`<div class="step-line ${i<active?'filled':''}"></div>`:'';
      return `<div class="step ${cls}"><span class="num">${i<active?'✓':i+1}</span>${label}</div>${line}`; }).join('');
    return;
  }
  if (['pool','interview','synthesis'].includes(s)){
    n.className='subnav crumbs';
    const list = STATE.fromStudy
      ? [{k:'result',l:'Study result'},{k:'pool',l:'Agent Pool'},{k:'interview',l:'Interview'},{k:'synthesis',l:'Synthesis'}]
      : [{k:'pool',l:'Agent Pool'},{k:'interview',l:'Interview'},{k:'synthesis',l:'Synthesis'}];
    const idx = list.findIndex(c=>c.k===s);
    n.innerHTML = list.slice(0,idx+1).map((c,i)=>{ const last=i===idx;
      return (last?`<span class="crumb on">${c.l}</span>`:`<span class="crumb" data-k="${c.k}">${c.l}</span>`)+(last?'':'<span class="crumb-sep">›</span>'); }).join('');
    $$('.crumb[data-k]').forEach(c=>c.onclick=()=>go(c.dataset.k));
    return;
  }
  n.className='subnav'; n.innerHTML='';
}

// ============================================================
//  HOME — dashboard
// ============================================================
function renderDashboard(){
  const avg = (PAST_STUDIES.reduce((s,x)=>s+x.fid,0)/PAST_STUDIES.length).toFixed(2);
  app().innerHTML = `
  <div class="screen">
    <div class="kicker">Console</div>
    <h1 class="h1">Welcome back, Joyce.</h1>
    <p class="sub">Ask a new question, or pick up where you left off.</p>

    <div class="dash-stats">
      <div class="dstat"><div class="dv">${AGENTS.length}</div><div class="dl">agents calibrated</div></div>
      <div class="dstat"><div class="dv">${AGENTS.filter(a=>a.hired).length}</div><div class="dl">in your roster</div></div>
      <div class="dstat"><div class="dv">${avg}</div><div class="dl">avg study fidelity</div></div>
      <div class="dstat"><div class="dv">41</div><div class="dl">match active segment</div></div>
    </div>

    <div class="dash-cols">
      <div class="dash-col">
        <div class="dc-head"><h3>Recent studies</h3><button class="link" id="all-studies">View all →</button></div>
        ${PAST_STUDIES.map(studyRow).join('')}
      </div>
      <div class="dash-col">
        <div class="dc-head"><h3>Recent chats</h3><button class="link" id="all-chats">View all →</button></div>
        ${PAST_CHATS.map(chatRow).join('')}
      </div>
    </div>
  </div>`;
  $('#all-studies').onclick = () => nav('studies','studies');
  $('#all-chats').onclick   = () => nav('chats','chats');
  bindStudyRows(); bindChatRows();
}

function statusClass(s){ return s==='Done'?'green':s==='Calibrating'?'amber':'blue'; }
function studyRow(st){
  return `<div class="list-row study-row" data-id="${st.id}">
    <div class="lr-main"><div class="lr-title">${esc(st.title)}</div><div class="lr-sub">${esc(st.q)}</div></div>
    <div class="lr-side">
      <span class="status ${statusClass(st.status)}">${st.status}</span>
      <div class="lr-fid"><div class="lr-fid-bar"><div style="width:${Math.round(st.fid*100)}%"></div></div><span>${st.fid.toFixed(2)}</span></div>
      <span class="lr-date">${st.date}</span>
    </div></div>`;
}
function chatRow(c){
  const ags = c.agents.map(agentById);
  const avs = ags.slice(0,4).map(a=>`<span class="cr-av" style="background:${agentColor(a)}">${a.name[0]}</span>`).join('');
  const who = ags.length===1 ? ags[0].name : `${ags.length} agents · focus group`;
  return `<div class="list-row chat-row" data-id="${c.id}">
    <div class="cr-avs">${avs}</div>
    <div class="lr-main"><div class="lr-title">${esc(c.topic)}</div><div class="lr-sub">${who}</div></div>
    <span class="lr-date">${c.date}</span></div>`;
}
function bindStudyRows(){ $$('.study-row').forEach(r=>r.onclick=()=>openStudy(r.dataset.id)); }
function bindChatRows(){ $$('.chat-row').forEach(r=>r.onclick=()=>openChat(r.dataset.id)); }
function openStudy(id){ const st=PAST_STUDIES.find(x=>x.id===id); if(st&&!st.live) toast(`Opening “${st.title}” (demo opens the live study)`);
  STATE.section='studies'; STATE.fromStudy=false; go('result'); }
function openChat(id){ const c=PAST_CHATS.find(x=>x.id===id); STATE.selected=c.agents.slice(); STATE.fromStudy=false; STATE.section='chats'; goInterview(); }

// ============================================================
//  STUDIES list
// ============================================================
function renderStudies(){
  app().innerHTML = `
  <div class="screen">
    <div class="list-head"><div><div class="kicker">Studies</div><h1 class="h1">Your studies</h1>
      <p class="sub" style="margin-bottom:0">Every study is a simulation you can return to, escalate, and re-run.</p></div>
      <button class="btn btn-primary" id="new-study">+ New study</button></div>
    <div class="list-wrap">${PAST_STUDIES.map(studyRow).join('')}</div>
  </div>`;
  $('#new-study').onclick = () => nav('studies','intake');
  bindStudyRows();
}

// ============================================================
//  CHATS list
// ============================================================
function renderChats(){
  app().innerHTML = `
  <div class="screen">
    <div class="list-head"><div><div class="kicker">Chats</div><h1 class="h1">Your chats</h1>
      <p class="sub" style="margin-bottom:0">Conversations with agents — one-on-one or as a focus group.</p></div>
      <button class="btn btn-primary" id="new-chat">+ New chat</button></div>
    <div class="list-wrap">${PAST_CHATS.map(chatRow).join('')}</div>
  </div>`;
  $('#new-chat').onclick = () => { STATE.fromStudy=false; STATE.prefiltered=false; STATE.section='agents'; openPool(); };
  bindChatRows();
}

// ============================================================
//  STUDY FLOW — Brief
// ============================================================
function renderIntake(){
  const s = STATE.study;
  app().innerHTML = `
  <div class="screen">
    <div class="kicker">New study</div>
    <h1 class="h1">What do you want to learn?</h1>
    <p class="sub">Tell your research agent the question, who it's about, and anything you already know. It'll turn this into a study you can run in minutes — no survey panel, no recruiting.</p>
    <div class="agent-band"><div class="agent-ava">P</div>
      <div><div class="who">POP · your research agent</div>
        <div class="say">Drop in your brief below. I'll read it (plus any files you attach), then we'll shape the study together before I run anything.</div></div></div>
    <div class="card form-card">
      <div class="field"><label>Research question <span class="req">*</span></label>
        <textarea id="f-rq">${esc(s.rq)}</textarea></div>
      <div class="field"><label>Target audience <span class="req">*</span></label>
        <textarea id="f-aud">${esc(s.audience)}</textarea></div>
      <div class="field"><label>Context <span class="hint">— optional, but it sharpens the result</span></label>
        <textarea id="f-ctx">${esc(s.context)}</textarea></div>
      <div class="field"><label>Supporting files <span class="hint">— audience personas, past research, brand decks</span></label>
        <div class="drop" id="drop"><div class="ic">📎</div><div class="big">Drop files or click to upload</div>
          <div class="small">PDF · XLSX · CSV · PNG — used to ground the simulation in what you already know</div></div>
        <div class="file-list" id="file-list">${renderFiles()}</div></div>
    </div>
    <div class="row-end"><button class="btn btn-ghost" id="cancel">Cancel</button>
      <button class="btn btn-primary" id="to-chat">Continue — talk to POP <span class="arr">→</span></button></div>
  </div>`;
  $('#drop').onclick = () => { STATE.study.files.push({name:`Upload_${STATE.study.files.length+1}.pdf`,size:"1.0 MB",type:"pdf"});
    $('#file-list').innerHTML=renderFiles(); bindFileRemovers(); toast('File attached'); };
  bindFileRemovers();
  $('#cancel').onclick = () => nav('studies','studies');
  $('#to-chat').onclick = () => {
    STATE.study.rq=$('#f-rq').value.trim()||STATE.study.rq;
    STATE.study.audience=$('#f-aud').value.trim()||STATE.study.audience;
    STATE.study.context=$('#f-ctx').value.trim(); goChat();
  };
}
function renderFiles(){ return STATE.study.files.map((f,i)=>`
  <div class="file-chip"><div class="ft ${f.type}">${FT_LABEL[f.type]||'FILE'}</div>
    <div><div class="fn">${esc(f.name)}</div><div class="fs">${f.size}</div></div><div class="x" data-i="${i}">×</div></div>`).join(''); }
function bindFileRemovers(){ $$('#file-list .x').forEach(x=>x.onclick=()=>{ STATE.study.files.splice(+x.dataset.i,1);
  $('#file-list').innerHTML=renderFiles(); bindFileRemovers(); }); }

// ── Refine (chat) ───────────────────────────────────────────
const BEATS = [
  { text:`Thanks — I've read your brief and the three files you shared (persona, brand tracker, last retinol concept test).<br><br>Before I design the study, one thing to pin down 👇 Are we testing <strong>willingness-to-pay at exactly $39</strong> — a clean go / no-go — or <strong>price sensitivity across a range</strong> so we can find the sweet spot?`,
    chips:["Just $39 — go / no-go","Test a range, $29–$49"] },
  { text:`Makes sense. And whose decision matters most — your <strong>existing repeat buyers</strong>, or <strong>first-time shoppers</strong>?`,
    chips:["Existing repeat buyers","Both — weight existing higher"] },
  { text:`Perfect. Here's the study I'd run — take a look 👇`, proposal:true },
];
function goChat(){ STATE.screen='chat'; STATE.thread=[]; STATE.beat=0; STATE.typing=false;
  STATE.currentChips=[]; STATE.proposalShown=false; render(); playAgentBeat(0); }
function playAgentBeat(i){ STATE.typing=true; STATE.currentChips=[]; renderChat();
  setTimeout(()=>{ STATE.typing=false; const b=BEATS[i];
    STATE.thread.push({role:'agent',html:b.text,proposal:!!b.proposal});
    STATE.currentChips=b.chips||[]; if(b.proposal) STATE.proposalShown=true; renderChat(); },850); }
function userSay(text){ if(STATE.proposalShown){toast('Hit “Confirm & run” to simulate');return;}
  STATE.thread.push({role:'me',html:esc(text)}); STATE.currentChips=[]; renderChat();
  STATE.beat++; if(BEATS[STATE.beat]) setTimeout(()=>playAgentBeat(STATE.beat),260); }
function renderChat(){
  if(STATE.screen!=='chat') return; const s=STATE.study;
  const msgs=STATE.thread.map(m=>{ const ava=m.role==='agent'?'P':'JL';
    const body=m.proposal?m.html+proposalCard():m.html;
    return `<div class="msg ${m.role}"><div class="ava">${ava}</div><div class="bubble">${body}</div></div>`; }).join('');
  const typing=STATE.typing?`<div class="msg agent"><div class="ava">P</div><div class="bubble typing"><span></span><span></span><span></span></div></div>`:'';
  const chips=STATE.currentChips.length?`<div class="chips">${STATE.currentChips.map(c=>`<button class="chip-s" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>`:'';
  app().innerHTML=`
  <div class="screen chat-wrap">
    <aside class="context-rail"><div class="card rail-card">
      <h4>Your brief</h4>
      <div class="rail-item"><div class="l">Research question</div><div class="v">${esc(s.rq)}</div></div>
      <div class="rail-item"><div class="l">Target audience</div><div class="v">${esc(s.audience)}</div></div>
      ${s.context?`<div class="rail-item"><div class="l">Context</div><div class="v">${esc(s.context)}</div></div>`:''}
      <div class="rail-item"><div class="l">Files</div><div class="rail-files">${s.files.map(f=>`
        <div class="rail-file"><span class="ft ${f.type}" style="display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;">${FT_LABEL[f.type]}</span>${esc(f.name)}</div>`).join('')}</div></div>
    </div></aside>
    <section class="chat-col"><div class="thread" id="thread">${msgs}${typing}</div>
      <div class="composer">${chips}<div class="composer-bar"><textarea id="composer-in" rows="1" placeholder="Reply to POP…"></textarea>
        <button class="send-btn" id="send">↑</button></div></div></section>
  </div>`;
  $$('.chip-s').forEach(b=>b.onclick=()=>userSay(b.dataset.c));
  const ta=$('#composer-in'); const send=()=>{const v=ta.value.trim();if(v)userSay(v);};
  $('#send').onclick=send;
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
  ta.addEventListener('input',()=>{ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,120)+'px';});
  const conf=$('#p-confirm'); if(conf) conf.onclick=runSimulation;
  const adj=$('#p-adjust'); if(adj) adj.onclick=()=>toast('In the full build you’d refine the study here');
  const th=$('#thread'); if(th) th.lastElementChild?.scrollIntoView({behavior:'smooth',block:'end'});
}
function proposalCard(){ return `
  <div class="proposal"><div class="ph"><div class="t">Proposed study</div><div class="h">Fragrance-free retinol @ $39 — purchase-intent read</div></div>
    <div class="pb">
      <div class="prow"><div class="pl">Objective</div><div class="pv">Estimate purchase intent for a $39 fragrance-free retinol serum among your ingredient-conscious core, and locate the price barrier.</div></div>
      <div class="prow"><div class="pl">Outcome</div><div class="pv"><span class="tagline"><span class="mintag">Purchase intent @ $39</span><span class="mintag">Price-sensitivity curve</span></span></div></div>
      <div class="prow"><div class="pl">Audience</div><div class="pv"><span class="tagline"><span class="mintag p">Ingredient-conscious</span><span class="mintag p">Women 28–45</span><span class="mintag p">HHI $80k+</span><span class="mintag p">Repeat buyers</span></span></div></div>
      <div class="prow"><div class="pl">Method</div><div class="pv">Behavior Engine simulation — <span class="em">GSS open data</span> + your uploads + Popland's <span class="em">proprietary causal graph</span>.</div></div>
      <div class="prow"><div class="pl">Sample</div><div class="pv">~1,200 synthetic respondents · <strong>41 calibrated</strong> to this exact segment.</div></div>
      <div class="prow"><div class="pl">You'll get</div><div class="pv">Purchase-intent %, confidence band, key drivers, a <strong>fidelity score</strong>, and a recommended next step.</div></div>
    </div>
    <div class="pf"><button class="btn btn-primary" id="p-confirm">Confirm &amp; run simulation <span class="arr">→</span></button>
      <button class="btn btn-ghost" id="p-adjust">Adjust</button></div></div>`; }

// ── Simulation → Result ─────────────────────────────────────
const SIM_STEPS = ["Matching your audience to graph constructs","Pulling priors from GSS open data","Grounding on your 3 uploaded files","Running 1,200 synthetic respondents through the causal graph","Scoring fidelity & confidence"];
function runSimulation(){
  const ov=document.createElement('div'); ov.className='sim-overlay';
  ov.innerHTML=`<div class="sim-box"><div class="spin"></div><h3>Running simulation</h3>
    <div class="ssub">Combining open data, your context, and Popland's causal graph</div>
    <div class="sim-steps">${SIM_STEPS.map((s,i)=>`<div class="sim-step" id="sim-${i}"><span class="tick">${i+1}</span>${s}</div>`).join('')}</div></div>`;
  document.body.appendChild(ov);
  SIM_STEPS.forEach((_,i)=>setTimeout(()=>{const el=$('#sim-'+i,ov); if(el){el.classList.add('on');el.querySelector('.tick').textContent='✓';}},350+i*430));
  setTimeout(()=>{ov.remove(); STATE.section='studies'; go('result');},350+SIM_STEPS.length*430+500);
}

// ── Result ──────────────────────────────────────────────────
const DRIVERS = [
  { name:"Ingredient-consciousness",          dir:"pos", label:"+ Strong",   w:78 },
  { name:"Clean-beauty / fragrance-free fit", dir:"pos", label:"+ Moderate", w:62 },
  { name:"Price sensitivity @ $39",           dir:"neg", label:"– Moderate", w:55 },
  { name:"Brand prestige / equity",           dir:"pos", label:"+ Moderate", w:48 },
  { name:"Novel concept (retinol newness)",   dir:"unc", label:"~ Uncertain",w:40 },
];
function renderResult(){
  app().innerHTML=`
  <div class="screen">
    <div class="kicker">Simulation result · Behavior Engine</div>
    <h1 class="h1">Here's what we expect</h1>
    <p class="sub">A first read from simulation — grounded, fast, and honest about how far to trust it.</p>
    <div class="result-grid">
      <div class="card headline">
        <div class="q">“If we launch a fragrance-free retinol serum at $39, will our core audience buy it?”</div>
        <div class="bignum"><div class="pct">58%</div><div class="lab">predicted purchase intent<br>at <strong>$39</strong>, next 12 months</div></div>
        <div class="band"><div class="brange">Confidence band · 49%–67%</div>
          <div class="band-track"><div class="band-fill" style="left:49%;width:18%"></div><div class="band-point" style="left:58%"></div></div></div>
        <div class="metrics">
          <div class="metric fid"><div class="mt">Fidelity</div><div class="mv">0.46</div><div class="meter"><div style="width:46%"></div></div>
            <div class="mnote">Moderate — 41 agents calibrated to this exact segment.</div></div>
          <div class="metric conf"><div class="mt">Confidence</div><div class="mv">Medium</div><div class="meter"><div style="width:58%"></div></div>
            <div class="mnote">±9% — widened by the novel $39 concept.</div></div>
        </div>
      </div>
      <div class="card panel"><h3>What's driving it</h3><div class="psub">Top factors from the causal graph for this audience</div>
        ${DRIVERS.map(d=>`<div class="driver"><div class="dtop"><span class="dname">${d.name}</span><span class="ddir ${d.dir}">${d.label}</span></div>
          <div class="dbar-track"><div class="dbar ${d.dir}" style="width:${d.w}%"></div></div></div>`).join('')}</div>
    </div>
    <div class="reco"><div class="rt">⚠︎ How far to trust this</div>
      <p>Directional buy-signal, but treat it as a <strong>hypothesis, not a verdict</strong> — fidelity is only <strong>0.46</strong> (41 agents match this segment, and a $39 fragrance-free retinol is novel territory).</p>
      <div class="lift"><b>To raise it →</b> interview matching agents. Their answers re-calibrate the graph, so your next simulation is more accurate.</div></div>
    <div class="result-actions">
      <button class="btn btn-primary" id="to-esc">Interview agents to raise fidelity <span class="arr">→</span></button>
      <button class="btn btn-ghost" id="export">Export report</button>
      <button class="btn btn-ghost" id="back-studies">← All studies</button></div>
  </div>`;
  $('#to-esc').onclick=()=>{ STATE.fromStudy=true; STATE.prefiltered=true; STATE.section='agents'; openPool(); };
  $('#export').onclick=()=>toast('Report exported (demo)');
  $('#back-studies').onclick=()=>nav('studies','studies');
}

// (escalation screen removed — the Result links straight into the Agent Pool)

// ============================================================
//  AGENT POOL
// ============================================================
function openPool(){
  if (STATE.prefiltered){
    STATE.poolFilter='segment';
    STATE.selected=AGENTS.filter(a=>a.tags.some(t=>STUDY_SEGMENT.includes(t))).sort((x,y)=>y.fid-x.fid).slice(0,3).map(a=>a.id);
  } else { STATE.poolFilter='all'; STATE.selected=[]; }
  STATE.poolSearch=''; STATE.screen='pool'; render();
}
function poolAgents(){
  let list=AGENTS.slice();
  if(STATE.poolFilter==='mine')    list=list.filter(a=>a.hired);
  if(STATE.poolFilter==='segment') list=list.filter(a=>a.tags.some(t=>STUDY_SEGMENT.includes(t)));
  if(STATE.poolSearch.trim()){ const q=STATE.poolSearch.toLowerCase();
    list=list.filter(a=>(a.name+a.loc+a.tags.join(' ')+a.quote).toLowerCase().includes(q)); }
  return list.sort((x,y)=>y.fid-x.fid);
}
function renderPool(){
  const list=poolAgents();
  const banner=STATE.prefiltered?`<div class="pool-banner"><span class="pb-ic">🎯</span>
    <span>Pre-filtered to your study's segment — <strong>${STUDY_SEGMENT.join(' · ')}</strong>. Top matches are pre-selected; your study questions are loaded as the guide. Their answers re-calibrate your graph and raise the simulation's accuracy.</span></div>`:'';
  const filters=[{k:'all',l:'All agents'},{k:'mine',l:'My roster'},...(STATE.prefiltered?[{k:'segment',l:'Study segment'}]:[])];
  app().innerHTML=`
  <div class="screen">
    <div class="pool-head"><div class="kicker">Agent Pool</div>
      <h1 class="h1">${STATE.fromStudy?'Interview your segment':'Find the people you want'}</h1>
      <p class="sub" style="margin-bottom:0">Filter or search the pool, then talk to one agent or run a discussion guide across many.</p></div>
    ${banner}
    <div class="pool-toolbar">
      <div class="search"><span class="si">⌕</span><input id="pool-search" type="text" placeholder="Semantic search — e.g. “price-sensitive, won't pay premium”" value="${esc(STATE.poolSearch)}"/></div>
      <div class="fchips">${filters.map(f=>`<button class="fchip ${STATE.poolFilter===f.k?'on':''}" data-k="${f.k}">${f.l}</button>`).join('')}</div></div>
    <div class="pool-grid">${list.map(agentCard).join('')||`<div class="empty">No agents match — try a broader search.</div>`}</div>
    <div class="select-bar ${STATE.selected.length?'show':''}">
      <span class="sb-count">${STATE.selected.length} selected${STATE.selected.length===1?' · 1:1 chat':STATE.selected.length>1?' · focus group':''}</span>
      <div class="sb-avatars">${STATE.selected.slice(0,6).map(id=>{const a=agentById(id);return `<span class="sb-av" style="background:${agentColor(a)}">${a.name[0]}</span>`;}).join('')}</div>
      <button class="btn btn-primary" id="to-interview" ${STATE.selected.length?'':'disabled'}>Interview ${STATE.selected.length||''} <span class="arr">→</span></button></div>
  </div>`;
  $('#pool-search').addEventListener('input',e=>{ STATE.poolSearch=e.target.value;
    $('.pool-grid').innerHTML=poolAgents().map(agentCard).join('')||`<div class="empty">No agents match — try a broader search.</div>`; bindCards(); });
  $$('.fchip').forEach(c=>c.onclick=()=>{ STATE.poolFilter=c.dataset.k; renderPool(); });
  bindCards();
  const ti=$('#to-interview'); if(ti) ti.onclick=()=>{ if(STATE.selected.length) goInterview(); };
  function bindCards(){ $$('.agent-card').forEach(card=>card.onclick=()=>{ const id=card.dataset.id;
    STATE.selected=STATE.selected.includes(id)?STATE.selected.filter(x=>x!==id):[...STATE.selected,id]; renderPool(); }); }
}
function agentCard(a){
  const sel=STATE.selected.includes(a.id); const fidPct=Math.round(a.fid*100);
  return `<div class="agent-card ${sel?'sel':''}" data-id="${a.id}">
    <div class="ac-check">${sel?'✓':''}</div>${a.hired?'<div class="ac-hired">In roster</div>':''}
    <div class="ac-top"><div class="ac-ava" style="background:${agentColor(a)}">${a.name[0]}</div>
      <div><div class="ac-name">${a.name}</div><div class="ac-meta">${a.age} · ${a.loc} · ${a.g}</div></div></div>
    <div class="ac-quote">“${esc(a.quote)}”</div>
    <div class="ac-tags">${a.tags.map(t=>`<span class="mintag ${tagClass(t)}">${t}</span>`).join('')}</div>
    <div class="ac-foot"><div class="ac-fid"><div class="ac-fid-meter"><div style="width:${fidPct}%"></div></div><span>Fidelity ${a.fid.toFixed(2)}</span></div>
      <div class="ac-prov">${esc(a.prov)}</div></div></div>`;
}
function tagClass(t){ if(STUDY_SEGMENT.includes(t))return'g'; if(['Value-seeker','First-timer','Sensitive skin'].includes(t))return''; return'p'; }

// ============================================================
//  INTERVIEW
// ============================================================
function goInterview(){
  STATE.guide=DEFAULT_GUIDE.slice(); STATE.asked=[]; STATE.transcript={};
  STATE.selected.forEach(id=>STATE.transcript[id]={});
  STATE.section = STATE.fromStudy ? 'studies' : 'chats';
  STATE.screen='interview'; render();
}
function ask(qid,qtext){ if(!STATE.asked.find(a=>a.qid===qid)) STATE.asked.push({qid,q:qtext});
  STATE.selected.forEach(id=>{STATE.transcript[id][qid]=answerFor(agentById(id),qid);}); renderInterview(); }
function runGuide(){ STATE.guide.forEach((g,i)=>setTimeout(()=>ask(g.id,g.q),i*520)); }
function renderInterview(){
  if(STATE.screen!=='interview') return;
  const agents=STATE.selected.map(agentById);
  const guideList=STATE.guide.map(g=>{ const done=STATE.asked.find(a=>a.qid===g.id);
    return `<div class="gq ${done?'done':''}" data-qid="${g.id}"><span class="gq-ck">${done?'✓':''}</span><span>${esc(g.q)}</span></div>`; }).join('');
  const blocks=STATE.asked.length?STATE.asked.map(qa=>`
    <div class="qblock"><div class="qb-q">${esc(qa.q)}</div>
      <div class="qb-answers">${agents.map(a=>`<div class="ans"><div class="ans-ava" style="background:${agentColor(a)}">${a.name[0]}</div>
        <div class="ans-body"><div class="ans-name">${a.name} <span class="ans-fid">${a.fid.toFixed(2)}</span></div>
          <div class="ans-text">${esc(STATE.transcript[a.id][qa.id]||'…')}</div></div></div>`).join('')}</div></div>`).join('')
    : `<div class="iv-empty"><div class="ie-ic">💬</div><div class="ie-t">${agents.length>1?`${agents.length} agents in the room`:`${agents[0].name} is ready`}</div>
        <div class="ie-s">Ask a single question below, or run the full discussion guide.</div></div>`;
  app().innerHTML=`
  <div class="screen iv-wrap">
    <aside class="iv-rail">
      <div class="card rail-card"><h4>Panel · ${agents.length}</h4>
        <div class="iv-panel">${agents.map(a=>`<div class="iv-p"><span class="iv-p-av" style="background:${agentColor(a)}">${a.name[0]}</span>
          <div><div class="iv-p-name">${a.name}</div><div class="iv-p-meta">${a.age} · ${a.loc}</div></div></div>`).join('')}</div></div>
      <div class="card rail-card"><h4>Discussion guide</h4><div class="guide-list">${guideList}</div>
        <button class="btn btn-soft" id="run-guide" style="width:100%;justify-content:center;margin-top:12px">▶ Run full guide</button></div>
    </aside>
    <section class="iv-col"><div class="iv-stream" id="iv-stream">${blocks}</div>
      <div class="composer"><div class="composer-bar"><textarea id="iv-in" rows="1" placeholder="Ask the panel a question…"></textarea>
        <button class="send-btn" id="iv-send">↑</button></div></div>
      ${STATE.asked.length?`<div class="iv-actions"><button class="btn btn-primary" id="to-syn">Synthesize ${STATE.asked.length} question${STATE.asked.length>1?'s':''} → <span class="arr">↳</span></button></div>`:''}
    </section>
  </div>`;
  $('#run-guide').onclick=runGuide;
  $$('.gq').forEach(g=>g.onclick=()=>{ const gq=STATE.guide.find(x=>x.id===g.dataset.qid); if(gq) ask(gq.id,gq.q); });
  const ta=$('#iv-in'); const send=()=>{const v=ta.value.trim();if(!v)return; ask('c'+STATE.asked.length,v);};
  $('#iv-send').onclick=send;
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
  ta.addEventListener('input',()=>{ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,120)+'px';});
  const syn=$('#to-syn'); if(syn) syn.onclick=()=>go('synthesis');
  const st=$('#iv-stream'); if(st) st.lastElementChild?.scrollIntoView({behavior:'smooth',block:'end'});
}

// ============================================================
//  SYNTHESIS
// ============================================================
const THEMES = [
  { t:'Price is the main friction — for value-seekers', tag:'neg', body:'$39 lands above the usual serum budget for value-led buyers; several would wait for a deal or a smaller trial size.', who:a=>a.tags.includes('Value-seeker') },
  { t:'Prestige & ingredient-led buyers will pay $39 — if proof is strong', tag:'pos', body:'For prestige and ingredient-led segments, $39 reads as fair or even cheap, conditional on a credible formulation story.', who:a=>a.tags.includes('Prestige buyer')||a.tags.includes('Ingredient-led') },
  { t:'Sensitive-skin reassurance is the unlock for retinol', tag:'unc', body:'Retinol newness raises hesitation; a sensitive-skin claim, buffered strength, or patch-test kit would de-risk trial.', who:a=>a.tags.includes('Sensitive skin') },
];
function renderSynthesis(){
  const agents=STATE.selected.map(agentById);
  const cards=THEMES.map(th=>{ const q=agents.find(th.who)||agents[0];
    const quote=STATE.transcript[q.id]?.g2||STATE.transcript[q.id]?.g1||q.quote;
    return `<div class="card theme"><div class="th-top"><span class="th-tag ${th.tag}"></span><span class="th-t">${th.t}</span></div>
      <p class="th-body">${th.body}</p>
      <div class="th-quote"><span class="tq-av" style="background:${agentColor(q)}">${q.name[0]}</span>
        <div><div class="tq-text">“${esc(quote)}”</div><div class="tq-who">${q.name} · ${q.loc}</div></div></div></div>`; }).join('');
  const liftBlock=STATE.fromStudy?`
    <div class="card lift-card"><div class="lc-head">Fidelity lift</div>
      <div class="lc-row"><span>Before</span><div class="lc-bar"><div style="width:46%;background:linear-gradient(90deg,#c4b5fd,#7c3aed)"></div></div><b>0.46</b></div>
      <div class="lc-row"><span>After ${agents.length} interview${agents.length>1?'s':''}</span><div class="lc-bar"><div style="width:71%;background:linear-gradient(90deg,#6ee7b7,#059669)"></div></div><b>0.71</b></div>
      <p class="lc-note">These ${agents.length} interviews re-calibrated the graph on your soft spots. <strong>Re-run the simulation</strong> to update the $39 forecast.</p>
      <button class="btn btn-primary" id="rerun" style="width:100%;justify-content:center;margin-top:6px">Re-run simulation with new signal <span class="arr">↻</span></button></div>`:'';
  app().innerHTML=`
  <div class="screen">
    <div class="kicker">Synthesis · ${STATE.asked.length} questions · ${agents.length} agents</div>
    <h1 class="h1">What we heard</h1>
    <p class="sub">Themes pulled across the panel, each grounded in a real agent's words. ${STATE.fromStudy?'This signal feeds straight back into your study.':''}</p>
    <div class="syn-grid">
      <div class="syn-main">${cards}
        <div class="reco" style="margin-top:4px"><div class="rt">→ Recommendation</div>
          <p>Lead with <strong>clinical proof + fragrance-free</strong> to win ingredient-led and prestige buyers at $39. To disarm the price objection from value-seekers, test a <strong>smaller trial size</strong> or an intro offer. Retinol newness needs an explicit <strong>sensitive-skin reassurance</strong>.</p></div></div>
      <div class="syn-side">${liftBlock}
        <div class="result-actions" style="flex-direction:column">
          <button class="btn btn-ghost" id="back-iv" style="justify-content:center">← Back to interview</button>
          <button class="btn btn-ghost" id="home3" style="justify-content:center">Home</button></div></div>
    </div>
  </div>`;
  const rr=$('#rerun'); if(rr) rr.onclick=()=>{ toast('Re-running with calibrated signal…'); runSimulation(); };
  $('#back-iv').onclick=()=>{ STATE.screen='interview'; render(); };
  $('#home3').onclick=()=>nav('home','home');
}

// ── router ──────────────────────────────────────────────────
function nav(section, screen){ STATE.section=section; STATE.screen=screen; render(); }
function go(screen){ STATE.screen=screen; render(); }
function render(){
  renderSidebar(); renderSubnav();
  ({ home:renderDashboard, studies:renderStudies, chats:renderChats,
     intake:renderIntake, chat:renderChat, result:renderResult,
     pool:renderPool, interview:renderInterview, synthesis:renderSynthesis
   }[STATE.screen] || renderDashboard)();
  const sc=$('.console-main'); if(sc) sc.scrollTo({top:0,behavior:'smooth'});
}
render();
