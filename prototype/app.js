/* ============================================================
   POPLAND · consumer website (vanilla JS, no build step)
   Pages: Home · Your Pop · Explore · Tasks · Earnings · Deep Talk
   Agent: Pop (user-nameable)
   ============================================================ */

const POP = `<svg class="pip" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><radialGradient id="pg" cx="34%" cy="28%" r="78%">
    <stop offset="0%" stop-color="#ffb39a"/><stop offset="55%" stop-color="#ff5a36"/><stop offset="100%" stop-color="#dc3f1b"/>
  </radialGradient></defs>
  <path d="M50 8c20 0 34 14 34 36 0 26-15 42-34 42S16 70 16 44C16 22 30 8 50 8Z" fill="url(#pg)"/>
  <circle cx="50" cy="6" r="3.4" fill="#2f6e5c"/><rect x="48.6" y="6" width="2.8" height="9" fill="#2f6e5c"/>
  <ellipse cx="39" cy="46" rx="8.5" ry="9.5" fill="#fffdf8"/><ellipse cx="61" cy="46" rx="8.5" ry="9.5" fill="#fffdf8"/>
  <circle cx="40.5" cy="48" r="4" fill="#241a11"/><circle cx="62.5" cy="48" r="4" fill="#241a11"/>
  <circle cx="42" cy="46.6" r="1.3" fill="#fff"/><circle cx="64" cy="46.6" r="1.3" fill="#fff"/>
  <circle cx="31" cy="58" r="4.5" fill="#ff8a6b" opacity=".55"/><circle cx="69" cy="58" r="4.5" fill="#ff8a6b" opacity=".55"/>
  <path d="M42 60q8 7 16 0" stroke="#241a11" stroke-width="2.6" fill="none" stroke-linecap="round"/>
</svg>`;
const popMini = px => POP.replace('class="pip"', `class="pip" style="width:${px}px;height:${px}px"`);
const AVATARS = [
  'radial-gradient(80% 120% at 70% 0%, rgba(232,164,39,.45), transparent 60%), linear-gradient(150deg,#2f6e5c,#234f43)',
  'linear-gradient(150deg,#ff8a5c,#dc3f1b)',
  'linear-gradient(150deg,#8b6cff,#6b3fd0)',
  'linear-gradient(150deg,#eab23a,#c97f12)',
  'linear-gradient(150deg,#4a8fd8,#245fb0)',
  'linear-gradient(150deg,#e36f9e,#c4477b)',
];
const popName = () => S.popName || 'Pop';
const orb = (px,extra='') => `<div class="orb" style="width:${px}px;height:${px}px;background:${AVATARS[S.popAvatar||0]};${extra}">${popMini(Math.round(px*0.66))}</div>`;

/* ---------- content ---------- */
const DEMO = [
  { k:'dob',    label:'Date of birth',           type:'date' },
  { k:'sex',    label:'Sex / Gender',            type:'select', opts:['Female','Male','Non-binary','Prefer to self-describe'] },
  { k:'loc',    label:'Location (City / ZIP)',   type:'text',   ph:'e.g. Palo Alto, CA' },
  { k:'race',   label:'Race / Ethnicity',        type:'select', opts:['White','Black or African American','Hispanic or Latino','Asian','Native American','Pacific Islander','Two or more','Other'] },
  { k:'edu',    label:'Highest education',        type:'select', opts:['Less than high school','High school','Some college','Associate','Bachelor’s','Master’s','Doctorate / Professional'] },
  { k:'work',   label:'Employment / Occupation', type:'text',   ph:'e.g. Product manager' },
  { k:'income', label:'Household income',         type:'select', opts:['Under $25k','$25–50k','$50–75k','$75–100k','$100–150k','$150k+'] },
  { k:'marital',label:'Marital status',          type:'select', opts:['Single','Partnered','Married','Divorced','Widowed'] },
];
const INTERVIEW = [
  { q:"It’s Friday night. The real you?",            tag:'unwinds by',      cat:'Habits',   o:['Out with friends','Quiet night in','Heads-down on a project','Depends on my mood'] },
  { q:"A shiny new gadget drops. You…",              tag:'with new things', cat:'Consumer', o:['Pre-order day one','Wait for the reviews','Wait for the price to drop','I don’t really do gadgets'] },
  { q:"Your money, in one line:",                    tag:'money is for',    cat:'Values',   o:['Save for security','Spend on experiences','Invest for growth','Treat myself, often'] },
  { q:"A brand you use raises prices 20%. You…",     tag:'when prices rise', cat:'Consumer', o:['Switch right away','Grumble but stay','Honestly won’t notice','Depends if I love it'] },
  { q:"New restaurant — you order…",                 tag:'ordering food',   cat:'Habits',   o:['My safe usual','The weirdest thing on the menu','Whatever’s popular','Ask the server to pick'] },
  { q:"When the group can’t decide, you…",           tag:'in a group',      cat:'Values',   o:['Take charge','Go with the flow','Quietly steer it','Stay out of it'] },
  { q:"Sharing your data for rewards feels…",        tag:'on privacy',      cat:'Values',   o:['Totally fine','Fine if anonymized','Only with clear consent','I’d rather not'] },
  { q:"Mornings, you’re…",                           tag:'mornings',        cat:'Habits',   o:['Up at dawn, ready','A few snoozes','Not a morning person','Depends on my sleep'] },
];
const CONN = [
  { k:'linkedin',  n:'LinkedIn',             d:'Work history, skills, industry',  bg:'#0A66C2', mark:'in', lift:'+8%', mode:'link' },
  { k:'instagram', n:'Instagram',            d:'Tastes, places, lifestyle',       bg:'linear-gradient(45deg,#f09433,#dc2743,#bc1888)', mark:'◉', lift:'+6%', mode:'link' },
  { k:'facebook',  n:'Facebook',             d:'Social graph & interests',        bg:'#1877F2', mark:'f', lift:'+5%', mode:'link' },
  { k:'survey',    n:'Past survey / report', d:'Share a link or screenshot (PDF, image)', bg:'#2F6E5C', mark:'⤓', lift:'+5%', mode:'upload' },
];
const MBTI_TYPES = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
const TIERS = [ {min:0,name:'Warming up'},{min:40,name:'Eligible'},{min:60,name:'Trusted'},{min:80,name:'High-fidelity'},{min:92,name:'Top 5%'} ];

const ALIGN = [
  { q:'A coffee you love raises its price 20%. You…', o:['Switch brands','Cut back but stay','Pay it, no big deal','Stop buying it'] },
  { q:'Choosing a vacation, you prioritize…',         o:['Relaxation','Adventure','Culture & food','Lowest budget'] },
  { q:'For an $80 purchase you usually…',             o:['Buy on impulse','Skim a review or two','Research thoroughly','Sleep on it'] },
  { q:'Your ideal weekend leans…',                    o:['Social & out','Cozy at home','Productive projects','Outdoors & active'] },
  { q:'An “eco-friendly” label makes you…',           o:['Much more likely to buy','A bit more likely','No difference','Skeptical'] },
  { q:'New tech gadgets — you’re usually…',           o:['First to try','Early-ish','Wait and see','Last to adopt'] },
  { q:'Dining out, you…',                             o:['Order your usual','Try something new','Ask for a recommendation','Pick the popular dish'] },
  { q:'If money got tight, the subscription you’d keep…', o:['Streaming','Music','Fitness / health','News / learning'] },
  { q:'A friend asks for honest feedback. You…',      o:['Give it straight','Soften it a lot','Focus on positives','Avoid the topic'] },
];
/* 3rd item in each batch: Pop states who it thinks you are → you rate 1–5 + give feedback */
const ALIGN_STMTS = [
  'Pop thinks you value experiences over owning more things.',
  'Pop reads you as price-conscious, but loyal to brands you love.',
  'Pop sees you as a curious early adopter who still checks the reviews.',
  'Pop thinks you lead quietly — steering a group without taking over.',
  'Pop believes you guard your privacy and want clear consent.',
];

const DEEP = [
  { q:'When you picture “enough” money, what does it buy you?', o:['Peace of mind','Time freedom','Helping family','Bigger risks'], pop:1, why:'You lean toward autonomy and experiences over accumulation.' },
  { q:'A decision you regret — was it acting too fast or too slow?', o:['Too fast','Too slow','Neither','Both, often'], pop:1, why:'Your answers suggest you deliberate, sometimes past the moment.' },
  { q:'What would actually make you leave a brand you love?', o:['Price hikes','Values mismatch','A better option','Bad service'], pop:1, why:'You said you’d pay more for value-aligned brands.' },
  { q:'In a group, the role you naturally slip into…', o:['The driver','The glue','The skeptic','The quiet observer'], pop:1, why:'You tend to steer gently rather than take charge.' },
  { q:'After a brutal week, you recharge by…', o:['Treating yourself','Rest & quiet','Being with people','Starting something new'], pop:1, why:'You seem to refill inwardly more than outwardly.' },
  { q:'A risk you’d take if no one judged you…', o:['Quit and travel','Start a business','Move abroad','Stay — I’m happy'], pop:1, why:'You value security, but crave one bold project.' },
  { q:'What do you quietly want people to notice about you?', o:['My taste','My work','My kindness','My independence'], pop:3, why:'Your choices point to prizing independence.' },
  { q:'Honest feedback to a friend — how do you give it?', o:['Straight','Gently','Mostly positive','I avoid it'], pop:0, why:'You said you give it straight.' },
  { q:'The purchase that says the most about you?', o:['Books / learning','Travel','Tech','Home & comfort'], pop:1, why:'Experiences edge out objects for you.' },
  { q:'Ten years out, success looks like…', o:['Financial freedom','Mastery at my craft','Strong relationships','Adventure & novelty'], pop:2, why:'Relationships rank high in how you describe yourself.' },
];

/* mode: 'open' = send Pop or do it yourself · 'apply' = selective, sign up to be considered */
const OPPS = [
  { id:'o1', org:'Daily Brew',   lg:'☕', bg:'#5b3a29', vt:'Brand pricing', mode:'open',  title:'Would a $0.75 latte price bump make you switch?', reward:0.80, time:'2 min', match:92 },
  { id:'o2', org:'Lumi',         lg:'✦', bg:'#c86b8e', vt:'CPG · skincare', mode:'apply', title:'React to three new serum concepts', reward:1.10, time:'4 min', match:78 },
  { id:'o3', org:'PixelForge',   lg:'◆', bg:'#3a4ec8', vt:'Gaming',        mode:'open',  title:'Rate a new level-difficulty curve', reward:0.55, time:'3 min', match:85 },
  { id:'o4', org:'NorthBank',    lg:'$', bg:'#2f6e5c', vt:'Finance',       mode:'apply', title:'Attitudes toward automatic retirement savings', reward:1.40, time:'6 min', match:71 },
  { id:'o5', org:'Metro Transit',lg:'⊕', bg:'#d98a2b', vt:'Civic',         mode:'open',  title:'Park vs. parking — vote on a city block', reward:0.30, time:'2 min', match:88 },
  { id:'o6', org:'Verde Foods',  lg:'❧', bg:'#4f8a3a', vt:'CPG · food',    mode:'open',  title:'Would you buy a plant-based version of your usual snack?', reward:0.65, time:'3 min', match:81 },
];
/* invitations: mode 'direct' (Pop can answer from what it knows) or 'input' (needs your answers first) */
const INVITES = [
  { id:'t1', org:'Lumi',      lg:'✦', bg:'#c86b8e', mode:'input',  title:'Skincare habits interview', desc:'Lumi hand-picked your profile. They want details Pop doesn’t fully know yet.', reward:2.00 },
  { id:'t2', org:'NorthBank', lg:'$', bg:'#2f6e5c', mode:'direct', title:'Financial decision-making study', desc:'Pop already knows enough to represent you here — send it straight over.', reward:2.50 },
];
const FLOW = {
  o1:[ {q:'At $4.95 for your usual latte, you…',o:['Buy as always','Buy less often','Switch to drip coffee','Go somewhere else']},
       {q:'What would keep you loyal?',o:['Loyalty perks','Better taste','Nothing — price wins','Convenience']} ],
  o2:[ {q:'How often do you try new skincare?',o:['Rarely, I’m loyal','When something runs out','Often','Only on a rec']},
       {q:'A serum costs 2× your usual. You…',o:['Skip it','Buy if reviews rave','Buy if ingredients justify','Splurge']} ],
  o3:[ {q:'You hit a hard level 4 times. You…',o:['Keep grinding','Look up a guide','Lower difficulty','Quit the game']},
       {q:'What makes a game “fair”?',o:['Skill always wins','Some luck is fine','Generous checkpoints','Tough but learnable']} ],
  o4:[ {q:'Auto 5% retirement deduction feels…',o:['Smart, opt me in','Fine if I can opt out','Too much now','I’d rather choose']},
       {q:'Found $1,000. You…',o:['Save it','Invest it','Treat yourself','Pay down debt']} ],
  o5:[ {q:'This city block should become…',o:['A pocket park','More parking','Mixed — a bit of both','Housing']},
       {q:'How do you usually get around?',o:['Drive','Transit','Bike / walk','Rideshare']} ],
  o6:[ {q:'A plant-based version of your snack?',o:['Definitely try it','If it tastes the same','If it’s cheaper','Stick with original']},
       {q:'“Plant-based” on a label makes you…',o:['More likely to buy','No difference','Slightly skeptical','Avoid it']} ],
  t1:[ {q:'How often do you change skincare products?',o:['Rarely — I’m loyal','When something runs out','Often — I love trying','Only on a recommendation']},
       {q:'What makes you switch a brand?',o:['Price','Ingredients','A friend’s rec','An ad / influencer']},
       {q:'Where do you buy skincare?',o:['Drugstore','Sephora / Ulta','Online / DTC','Wherever’s cheapest']},
       {q:'Fragrance in skincare?',o:['Love it','Don’t care','Prefer fragrance-free','Avoid it']},
       {q:'Your skincare goal right now?',o:['Anti-aging','Acne / clarity','Hydration','Just maintain']},
       {q:'A 2× price serum with great reviews?',o:['Skip','Maybe','Probably buy','Definitely buy']} ],
};
const taskMeta = id => INVITES.find(t=>t.id===id) || OPPS.find(o=>o.id===id);

const ACTIVITY = [
  { t:`<b>Pop</b> answered Daily Brew’s pricing question on your behalf`, time:'2h' },
  { t:`<b>Lumi</b> invited you to a skincare interview — $2.00`, time:'1d', action:{label:'Accept', flow:'t1'} },
  { t:`You reached <b>Trusted</b> fidelity — higher-paying tasks unlocked`, time:'2d' },
  { t:`<b>Pop</b> voted “pocket park” in a city-planning sandbox`, time:'3d' },
];
const WALLET = [
  { t:'Daily Brew pricing study',  d:'Today · via Pop',      amt:'+$0.80' },
  { t:'City-planning vote',        d:'3 days ago · via Pop', amt:'+$0.30' },
  { t:'Skincare concept panel',    d:'Last week',            amt:'+$1.10' },
  { t:'Calibration bonus',         d:'Last week · fidelity', amt:'+$0.50' },
];

/* ---------- state ---------- */
const S = {
  page:'home', buildView:'overview',
  popName:'Pop', popAvatar:0,
  // seeded so a returning user's Pop already has a personality (placeholder data)
  demo:{ dob:'1997-04-12', sex:'Female', loc:'Palo Alto, CA', race:'Asian', edu:'Master’s', work:'Product manager', income:'$100–150k', marital:'Single' },
  answers:{ 0:1, 1:1, 2:1, 3:1, 4:1, 5:2, 6:2, 7:1 },
  interests:['Specialty coffee','Travel','Indie games','Skincare','Hiking & trails'],
  qIndex:0, interviewEdit:false, connected:{}, links:{}, mbti:'',
  align:{}, alignOffset:0, alignBatch:{}, alignStmtIdx:0, alignStmtRate:0, alignStmtNote:'', alignStmts:{}, alignJustSubmitted:false,
  deepIdx:0, deepAns:{}, deepRate:{}, deepNote:{}, deepRecording:false,
  exploreTab:'recommended', tasksTab:'invites', autoExplore:false,
  saved:{}, sent:{}, applied:{}, completed:{},
  flow:null, flowIdx:0, flowAns:{}, flowDone:false, flowReturn:'tasks',
  earnings:12.80,
};

/* ---------- fidelity + earnings ---------- */
function fidelity(){
  let f = 18;
  f += Object.values(S.demo).filter(Boolean).length * 3;
  f += Object.keys(S.answers).length * 4;
  const w = { linkedin:8, instagram:6, facebook:5, survey:5 };
  for (const k in S.connected) if (S.connected[k]) f += (w[k]||5);
  if (S.mbti) f += 7;
  f += Object.keys(S.align).length * 2;
  f += Object.keys(S.alignStmts).length * 2;
  f += Object.keys(S.deepAns).length * 3;
  f += Object.keys(S.completed).length * 3;
  return Math.min(99, Math.round(f));
}
const avgPerTask = f => Math.max(1, Math.round(2.5 + f * 0.4167));
const MILESTONES = [30,50,70,90,99];
const nextMilestone = f => MILESTONES.find(m => m > f) || null;
const activeTier = f => { let t = TIERS[0]; for (const x of TIERS) if (f >= x.min) t = x; return t; };
function ringNote(f){
  const avg = avgPerTask(f); const m = nextMilestone(f);
  if (!m) return `At <b>${f}%</b> fidelity, ${popName()} earns about <b>$${avg}</b> per task — the top of the range.`;
  return `At <b>${f}%</b> fidelity, ${popName()} earns about <b>$${avg}</b> per task on average. Reach <b>${m}%</b> and that rises to about <b>$${avgPerTask(m)}</b>.`;
}
const demoPct = () => Math.round(Object.values(S.demo).filter(Boolean).length / DEMO.length * 100);
const intDone = () => Object.keys(S.answers).length;
const intPct  = () => Math.round(intDone() / INTERVIEW.length * 100);
const intComplete = () => intDone() === INTERVIEW.length;
const connCount = () => Object.values(S.connected).filter(Boolean).length + (S.mbti?1:0);
const connPct = () => Math.round(connCount() / (CONN.length+1) * 100);
const openInvites = () => INVITES.filter(t => !S.completed[t.id]).length;
const hasProfile = () => Object.values(S.demo).filter(Boolean).length > 0 || intDone() > 0;
const deepDone = () => Object.keys(S.deepAns).length;

/* ============================================================
   RENDER
   ============================================================ */
let _lastKey = '';
function render(){
  const key = S.page + '|' + S.buildView + '|' + (S.flow||'');
  const y = window.scrollY;
  renderSidebar(); renderMain(); postRender();
  if (key === _lastKey) window.scrollTo(0, y); else window.scrollTo(0, 0);
  _lastKey = key;
}

function renderSidebar(){
  const f = fidelity();
  const nav = [
    ['home','Home', `<path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/>`],
    ['build','Your Pop', `<circle cx="12" cy="9" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/>`],
    ['explore','Explore', `<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>`],
    ['tasks','Tasks', `<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h4"/>`],
    ['earnings','Earnings', `<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"/>`],
  ];
  const cur = S.page==='deeptalk' ? 'build' : S.page;
  document.getElementById('sidebar').innerHTML = `
    <div class="sb-brand"><span class="mark"></span><span class="name">Pop<span>land</span></span></div>
    <nav class="sb-nav">
      ${nav.map(([k,l,ic]) => `<button data-nav="${k}" class="${cur===k?'on':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ic}</svg>
        ${l}${k==='tasks'&&openInvites()?`<span class="badge">${openInvites()}</span>`:''}</button>`).join('')}
    </nav>
    <div class="sb-foot">
      <button class="sb-fid" data-nav="build" data-bview="overview">
        <span class="mini-ring" style="--p:0"><b id="sbMiniNum">${f}%</b></span>
        <span class="t"><span class="k">${popName()} · fidelity</span><span class="v" id="sbTier">${activeTier(f).name} · ~$${avgPerTask(f)}/task</span></span>
      </button>
      <div class="sb-user"><span class="av">J</span><span class="who"><span class="n">Joyce</span><span class="b">$${S.earnings.toFixed(2)} earned</span></span></div>
    </div>`;
}

function renderMain(){
  const m = document.getElementById('main');
  if (S.flow) { m.innerHTML = flowPage(); return; }
  m.innerHTML = ({ home:homePage, build:buildPage, explore:explorePage, tasks:tasksPage, earnings:earningsPage, deeptalk:deepTalkPage })[S.page]();
}
function ringHTML(f){ return `<div class="ring" style="--p:0"><div><div class="num" id="ringNum">${f}<small>%</small></div><div class="cap">Fidelity</div></div></div>`; }
function nextGoalInner(f){
  const m = nextMilestone(f);
  if (!m) return `<span class="ng-k">Top tier reached</span><span class="ng-v">~$${avgPerTask(f)}/task — the best your Pop earns</span>`;
  return `<span class="ng-k">Next goal</span><span class="ng-v">Reach <b>${m}%</b> → about <b>$${avgPerTask(m)}</b>/task</span><span class="ng-bar"><i style="width:${Math.round(f/m*100)}%"></i></span>`;
}
function fidPanel(f, withGrowth){
  return `<aside class="fid-panel">
    <div class="card ring-card">${ringHTML(f)}<p class="ring-note" id="ringNote">${ringNote(f)}</p>
      <div class="next-goal" id="nextGoal">${nextGoalInner(f)}</div></div>
    ${withGrowth ? `<div class="card growth-card"><div class="gh">${popName()}’s growth path</div><div class="growth small">${growthPath(f).join('')}</div></div>` : ''}
  </aside>`;
}

/* ---------- HOME ---------- */
function homePage(){
  const f = fidelity();
  const cards = [
    { t:'Add your basics', p:'Standard demographics — the research backbone of your Pop.', pct:demoPct(), lift:'foundation', cta:demoPct()?'Continue':'Start', ic:`<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/><path d="M8 4v16"/>` },
    { t:'Finish your interview', p:'8 quick taps on your values, habits and taste.', pct:intPct(), lift:'+32% fidelity', cta:intDone()?'Continue':'Start', ic:`<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>` },
    { t:'Link what you have', p:'LinkedIn, Instagram, MBTI, past surveys — link or screenshot.', pct:connPct(), lift:'+ up to 31%', cta:connCount()?'Add more':'Connect', ic:`<path d="M9 12a3 3 0 0 0 3 3l3-3a3 3 0 0 0-3-3"/><path d="M15 12a3 3 0 0 0-3-3l-3 3a3 3 0 0 0 3 3"/>` },
  ];
  const done = cards.filter(c=>c.pct===100).length;
  return `<div class="stagger">
    <section class="hello">
      <div><h1>Welcome back, Joyce.</h1>
        <p>Build a second you — an agent that answers questions for businesses, with your permission. The better it knows you, the more it earns <em class="muted">while you rest.</em></p></div>
      <div class="pip-hi">${popMini(48)}<span>I’m <b>${popName()}</b>, your agent. Teach me, and I’ll go earn for you.</span></div>
    </section>

    <div class="tasks-head"><h2>Set up your Pop</h2><span class="c">(${cards.length - done} of ${cards.length} left)</span></div>
    <div class="task-cards">
      ${cards.map(c => `<div class="tcard ${c.pct===100?'done':''}">
        <span class="tc-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${c.ic}</svg></span>
        <h3>${c.t}</h3><p>${c.p}</p>
        <div class="prog"><span class="bar"><i data-w="${c.pct}"></i></span><span class="pct">${c.pct}%</span></div>
        <div class="tc-foot"><span class="lift">${c.lift}</span>
          <button class="btn btn-primary btn-sm" data-nav="build" data-bview="${c.pct===100?'overview':'edit'}">${c.pct===100?'Review':c.cta}</button></div>
      </div>`).join('')}
    </div>

    <div class="home-grid">
      <div class="card activity">
        <h2 style="font-family:'Fraunces',serif;font-weight:700;font-size:19px;margin-bottom:6px">Your Pop’s activity</h2>
        ${ACTIVITY.map(a=>`<div class="act"><span class="dot"></span><span class="t">${a.t}</span>
          ${a.action?`<button class="act-btn" data-flowstart="${a.action.flow}">${a.action.label}</button>`:''}
          <span class="time">${a.time}</span></div>`).join('')}
        <div class="spacer"></div>
        <button class="btn btn-ghost btn-sm" data-nav="explore">Explore opportunities →</button>
      </div>
      <div class="card fid-panel ring-card">
        <span class="eyebrow">Agent fidelity</span>
        ${ringHTML(f)}
        <p class="ring-note" id="ringNote">${ringNote(f)}</p>
        <button class="btn btn-spruce btn-block" style="margin-top:14px" data-nav="build" data-bview="overview">Raise your fidelity</button>
      </div>
    </div>
    <div class="spacer"></div>
  </div>`;
}

/* ============================================================
   YOUR POP  (overview ↔ edit)
   ============================================================ */
function buildPage(){ return S.buildView==='edit' ? buildEdit() : buildOverview(); }

function buildOverview(){
  const f = fidelity();
  return `<div class="stagger">
    <div class="page-head"><span class="eyebrow">Your Pop · lives here</span>
      <h1 class="display">Meet <em>${popName()}</em> — the second you.</h1>
      <p>This is ${popName()}’s home: who it knows you to be, and where you keep sharpening it. Edit anything, anytime.</p></div>
    <div class="build-grid">
      <div>
        <div class="sect pop-hero">
          ${orb(96)}
          <div class="info"><div class="nm">${popName()}</div>
            <div class="vibe">${popVibe(f)}</div>
            <div class="row"><span class="pill pill-spruce">${activeTier(f).name}</span><span class="pill pill-gold">~$${avgPerTask(f)} / task</span><span class="pill pill-ink">${f}% fidelity</span></div></div>
          <button class="edit" data-bview="edit">✎ Edit setup</button>
        </div>

        <div class="sect">
          <div class="sect-head"><span class="n" style="background:rgba(36,26,17,.08);color:var(--ink)">i</span>
            <span class="meta"><span class="t">What ${popName()} knows about you</span><span class="d">An objective summary of your basics</span></span>
            <button class="lift" style="cursor:pointer;border:0;background:none;color:var(--persimmon-d);font-weight:700" data-bview="edit">Edit</button></div>
          ${profileStatement()}
        </div>

        ${sectAlignment()}
      </div>
      ${fidPanel(f, true)}
    </div>
    <div class="spacer"></div>
  </div>`;
}
function popVibe(f){
  if (!hasProfile()) return `${popName()} is brand new — teach it your basics to give it a personality.`;
  const bits = [];
  if (S.answers[3]!==undefined) bits.push(['price-sensitive','sticky-but-grumbly','price-insensitive','selectively loyal'][S.answers[3]]);
  if (S.answers[2]!==undefined) bits.push(['security-minded','experience-driven','a growth investor','self-rewarding'][S.answers[2]]);
  if (S.answers[1]!==undefined) bits.push(['an early adopter','a careful researcher','a deal-waiter','gadget-indifferent'][S.answers[1]]);
  return bits.length ? `${popName()} reads you as <b>${bits.join('</b>, <b>')}</b> — and gets sharper every time you align.` : `${popName()} is learning your patterns — try a few alignment checks below.`;
}
function profileStatement(){
  const d = S.demo;
  if (!hasProfile()) return `<div class="empty-pop">Your Pop is just getting started.<br><button class="btn btn-primary btn-sm" style="margin-top:12px" data-bview="edit">Add your basics</button></div>`;
  const seg = [];
  if (d.dob){ const y=parseInt(String(d.dob).slice(0,4)); if(y) seg.push(`a <b>${2026-y}</b>-year-old`); }
  if (d.sex && d.sex!=='Prefer to self-describe') seg.push(`<b>${d.sex.toLowerCase()}</b>`);
  if (d.work) seg.push(`<b>${d.work}</b>`);
  const parts = [];
  if (seg.length) parts.push(`You’re ${seg.join(' ')}`);
  if (d.loc) parts.push(`based in <b>${d.loc}</b>`);
  let s = parts.join(' ') + (parts.length?'. ':'');
  const seg2 = [];
  if (d.edu) seg2.push(`<b>${d.edu}</b>`);
  if (d.income) seg2.push(`household income <b>${d.income}</b>`);
  if (d.marital) seg2.push(`<b>${d.marital.toLowerCase()}</b>`);
  if (seg2.length) s += `Education: ${seg2.join('; ')}.`;
  return `<p class="statement">${s || 'Your basics are partly filled — add more in Edit setup.'}</p>${knowsBlock()}`;
}
function knowsBlock(){
  const labels = { Values:'Core values', Habits:'Habits & routine', Consumer:'Consumer style' };
  const groups = { Values:[], Habits:[], Consumer:[] };
  INTERVIEW.forEach((q,i)=>{ if (S.answers[i]!==undefined && groups[q.cat]) groups[q.cat].push(q.o[S.answers[i]]); });
  let html = '<div class="knows">';
  for (const k of ['Values','Habits','Consumer']){
    if (groups[k].length) html += `<div class="kgroup"><span class="kl">${labels[k]}</span><div class="kchips">${groups[k].map(c=>`<span class="chip-fact t">${c}</span>`).join('')}</div></div>`;
  }
  if (S.interests && S.interests.length) html += `<div class="kgroup"><span class="kl">Interests</span><div class="kchips">${S.interests.map(c=>`<span class="chip-fact">${c}</span>`).join('')}</div></div>`;
  return html + '</div>';
}
function growthPath(f){
  const miles = [
    { t:'Pop created', done:true, s:'day one' },
    { t:'Basics added', done:demoPct()===100, s:`${demoPct()}%` },
    { t:'Interview complete', done:intComplete(), s:`${intDone()}/8` },
    { t:'First resource linked', done:connCount()>0, s:connCount()?`${connCount()} linked`:'—' },
    { t:'Deep talk with Pop', done:deepDone()>0, s:deepDone()?`${deepDone()} done`:'—' },
    { t:'Reach Trusted (60%)', done:f>=60, s:`${f}%` },
  ];
  return miles.map(m=>`<div class="milerow ${m.done?'done':''}"><span class="mt">${m.t}</span><span class="ms">${m.done?'✓ ':''}${m.s}</span></div>`);
}

/* ---- perspective alignment: answer 3, then Submit ---- */
function sectAlignment(){
  const head = `<div class="sect-head"><span class="n" style="background:var(--persimmon)">★</span>
    <span class="meta"><span class="t">Perspective alignment</span><span class="d">${Object.keys(S.align).length + Object.keys(S.alignStmts).length} checks done so far</span></span>
    <span class="lift">+6% / round</span></div>`;
  if (S.alignJustSubmitted){
    return `<div class="sect">${head}
      <div class="align-done"><div class="ck">✓</div><div><b>Nice — submitted.</b> <span class="muted">${popName()} just got sharper. Come back anytime for three fresh checks.</span></div></div>
      <div class="align-foot"><button class="btn btn-spruce btn-sm" data-alignrefresh>Refresh 3 new questions</button>
        <button class="btn btn-ghost btn-sm" data-deepstart>🗣 Have a deep talk with ${popName()} →</button></div></div>`;
  }
  const mc = [0,1].map(k => (S.alignOffset+k) % ALIGN.length);
  const mcCards = mc.map((i,n) => {
    const item = ALIGN[i]; const pick = S.alignBatch[i];
    return `<div class="al-q"><div class="qx"><span class="qn">${n+1}</span>${item.q}</div>
      <div class="al-opts">${item.o.map((o,oi)=>`<button class="al-opt ${pick===oi?'picked':''}" data-alignbatch="${i}" data-opt="${oi}">${o}</button>`).join('')}</div></div>`;
  }).join('');
  const stmt = ALIGN_STMTS[S.alignStmtIdx % ALIGN_STMTS.length];
  const dots = [1,2,3,4,5].map(n=>`<i class="${S.alignStmtRate>=n?'on':''}" data-alignstmtrate="${n}">${n}</i>`).join('');
  const stmtCard = `<div class="al-q stmt"><div class="qx"><span class="qn">3</span>${stmt}</div>
    <div class="rate-label">How accurate is that, 1–5?</div>
    <div class="rate">${dots}</div>
    <textarea rows="2" placeholder="Tell ${popName()} why — what did it get right or wrong? (optional)" data-alignstmtnote>${S.alignStmtNote||''}</textarea></div>`;
  const ready = mc.every(i => S.alignBatch[i]!==undefined) && S.alignStmtRate>0;
  const cnt = mc.filter(i=>S.alignBatch[i]!==undefined).length + (S.alignStmtRate>0?1:0);
  return `<div class="sect">${head}
    <p class="muted" style="font-size:13.5px;margin:-8px 0 16px">Two quick picks, then rate how well ${popName()} reads you. Submit all three together — each round sharpens your agent.</p>
    ${mcCards}${stmtCard}
    <div class="align-foot">
      <button class="btn btn-primary btn-sm ${ready?'':'is-disabled'}" data-alignsubmit>${ready?'Submit · +6%':`Answer all 3 (${cnt}/3)`}</button>
      <button class="btn btn-ghost btn-sm" data-deepstart>🗣 Have a deep talk with ${popName()} →</button>
    </div></div>`;
}

/* ---- edit / setup ---- */
function buildEdit(){
  return `<div class="stagger">
    <div class="edit-bar"><button class="back" data-bview="overview">← Back to your Pop</button><span class="eyebrow">One-time setup</span></div>
    <div class="page-head"><h1 class="display">Set up <em>${popName()}.</em></h1>
      <p>Name your agent, then teach it who you are. You only do this once — afterwards it lives on your Pop page, editable anytime.</p></div>
    <div class="build-grid">
      <div>
        ${sectNameAvatar()}
        ${sectDemographics()}
        ${sectInterview()}
        ${sectResources()}
        <button class="btn btn-primary btn-block btn-lg" style="margin-top:6px" data-bview="overview">Done — view your Pop</button>
      </div>
      ${fidPanel(fidelity(), false)}
    </div>
    <div class="spacer"></div>
  </div>`;
}
function sectNameAvatar(){
  return `<div class="sect">
    <div class="sect-head"><span class="n" style="background:var(--gold)">0</span>
      <span class="meta"><span class="t">Name your Pop</span><span class="d">Give your agent a name and a face</span></span></div>
    <div class="namepick">
      ${orb(72)}
      <div class="np-fields">
        <div class="field" style="margin:0"><label>Agent name</label>
          <input data-popname type="text" placeholder="Pop" value="${S.popName||''}" maxlength="18"></div>
        <div class="avatars">${AVATARS.map((g,i)=>`<button class="av-tile ${S.popAvatar===i?'on':''}" data-popavatar="${i}" style="background:${g}">${popMini(20)}</button>`).join('')}</div>
      </div>
    </div></div>`;
}
function sectHead(n,title,desc,pct,lift,liftId){
  const ok = pct===100;
  return `<div class="sect-head"><span class="n ${ok?'ok':''}">${ok?'✓':n}</span>
    <span class="meta"><span class="t">${title}</span><span class="d">${desc}</span></span>
    <span class="lift" ${liftId?`id="${liftId}"`:''}>${ok?'done':lift}</span></div>`;
}
function sectDemographics(){
  const fields = DEMO.map(field => {
    const val = S.demo[field.k] || '';
    let input;
    if (field.type==='select') input = `<select data-demo="${field.k}"><option value="" ${!val?'selected':''} disabled>Select…</option>${field.opts.map(o=>`<option ${o===val?'selected':''}>${o}</option>`).join('')}</select>`;
    else input = `<input data-demo="${field.k}" type="${field.type}" placeholder="${field.ph||''}" value="${val}">`;
    return `<div class="field ${val?'filled':''}"><label>${field.label}</label>${input}</div>`;
  }).join('');
  return `<div class="sect">${sectHead(1,'Your basics','Standard demographics for grounding your agent',demoPct(),'foundation','demoLift')}<div class="fgrid">${fields}</div></div>`;
}
function sectInterview(){
  let body;
  if (intComplete() && !S.interviewEdit){
    body = interviewSummary();
  } else if (S.interviewEdit || !intComplete()) {
    const i = Math.min(S.qIndex, INTERVIEW.length-1); const q = INTERVIEW[i];
    body = `<div class="q fade"><div class="qnum">QUESTION ${i+1} / ${INTERVIEW.length}</div><div class="qtext">${q.q}</div>
      <div class="opts-grid">${q.o.map((o,oi)=>`<button class="opt ${S.answers[i]===oi?'picked':''}" data-q="${i}" data-opt="${oi}">${o}</button>`).join('')}</div>
      <div class="qdots">${INTERVIEW.map((_,k)=>`<i class="${k===i?'on':''} ${S.answers[k]!==undefined?'done':''}" data-qjump="${k}"></i>`).join('')}</div>
      ${intComplete()?`<div style="margin-top:14px"><button class="btn btn-ghost btn-sm" data-intdone>Done editing</button></div>`:''}</div>`;
  }
  return `<div class="sect">${sectHead(2,'Quick interview','8 taps on values, habits & taste',intPct(),'+32%')}${body}</div>`;
}
function interviewSummary(){
  const quotes = INTERVIEW.map((q,i)=>`<div class="qrow"><span class="qk">${q.tag}</span><span class="qv">“${q.o[S.answers[i]]}”</span></div>`).join('');
  return `<div class="int-summary fade">
    <p class="statement" style="margin-bottom:14px">${popVibe(fidelity())}</p>
    <div class="qlist">${quotes}</div>
    <p class="muted" style="font-size:12.5px;margin:12px 0 14px">This is how ${popName()} reads your values — in your own words. Something off?</p>
    <button class="btn btn-ghost btn-sm" data-intedit>✎ Edit my answers</button>
  </div>`;
}
function sectResources(){
  const rows = CONN.map(c => {
    const on = S.connected[c.k];
    const action = c.mode==='link'
      ? (on ? `<button class="cbtn" data-conn="${c.k}">Linked ✓</button>` : `<input class="link-in" placeholder="paste profile link" data-link="${c.k}"><button class="cbtn" data-conn="${c.k}">Link</button>`)
      : (on ? `<button class="cbtn" data-conn="${c.k}">Added ✓</button>` : `<button class="cbtn" data-conn="${c.k}">Upload / link</button>`);
    return `<div class="conn ${on?'linked':''}"><span class="logo" style="background:${c.bg}">${c.mark}</span>
      <span class="meta"><span class="t">${c.n}</span><span class="d">${on?`<b>Connected · ${c.lift} fidelity</b>`:c.d}</span></span>
      <span class="acts">${action}</span></div>`;
  }).join('');
  const mbti = `<div class="conn ${S.mbti?'linked':''}"><span class="logo" style="background:linear-gradient(135deg,#7a5cff,#b06bff)">16</span>
    <span class="meta"><span class="t">MBTI result</span><span class="d">${S.mbti?`<b>${S.mbti} · +7% fidelity</b>`:'Anchor your personality type'}</span></span>
    <span class="acts"><select data-mbti style="font:inherit;font-weight:700;font-size:12.5px;padding:9px 11px;border-radius:100px;border:1px solid var(--line);background:var(--paper-2);color:var(--ink)">
      <option value="" ${!S.mbti?'selected':''}>Type</option>${MBTI_TYPES.map(t=>`<option ${t===S.mbti?'selected':''}>${t}</option>`).join('')}</select></span></div>`;
  const shield = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 4-3 7-8 9-5-2-8-5-8-9V6Z"/></svg>`;
  return `<div class="sect">${sectHead(3,'Other resources','Bring data you already have — by link or screenshot',connPct(),'+ up to 31%')}
    ${rows}${mbti}<div class="consent">${shield}<span>You authorize each source. Data is de-identified, used only to calibrate your agent, and you can revoke anytime.</span></div></div>`;
}

/* ============================================================
   DEEP TALK — separate page
   ============================================================ */
function deepTalkPage(){
  const total = DEEP.length;
  const idx = S.deepIdx;
  const finished = idx >= total;
  if (finished){
    return `<div class="deep">
      <div class="deep-head"><button class="back" data-deepend>← Back to your Pop</button><span class="deep-count">${total} of ${total} · talk complete</span></div>
      <div class="deep-final fade">${orb(96)}<h1>That was a real talk.</h1>
        <p>You worked through ${total} deep questions with ${popName()}. Each one pushed your fidelity up — ${popName()} understands you a lot better now.</p>
        <button class="btn btn-primary" data-deepend>See your Pop</button></div></div>`;
  }
  const q = DEEP[idx];
  const a = S.deepAns[idx];
  const answered = a!==undefined;
  const matched = answered && a===q.pop;
  const dots = [1,2,3,4,5].map(n=>`<i class="${(S.deepRate[idx]||0)>=n?'on':''}" data-deeprate="${n}">${n}</i>`).join('');
  const canEnd = idx < total-1; // last question shows "Finish" instead
  return `<div class="deep">
    <div class="deep-head"><button class="back" data-deepend>← Save & exit</button>
      <span class="deep-count">Question ${idx+1} of ${total}${idx>=total-1?' · last one':''}</span></div>

    <div class="deep-body">
      <div class="deep-ask"><div class="da-orb">${orb(46)}</div>
        <div class="da-bubble"><span class="who">${popName()} asks</span>${q.q}</div></div>

      ${!answered ? `<div class="deep-opts fade">${q.o.map((o,oi)=>`<button class="deep-opt" data-deepans="${oi}">${o}</button>`).join('')}</div>`
      : `<div class="fade">
          <div class="deep-compare">
            <div class="cmp you"><div class="who">Your answer</div><div class="ans">${q.o[a]}</div></div>
            <div class="cmp pop"><div class="who">${popMini(16)} ${popName()} guessed</div><div class="ans">${q.o[q.pop]}</div></div>
          </div>
          <div class="deep-reason"><b>${popName()}’s reasoning:</b> ${q.why}</div>
          <div class="verdict ${matched?'match':'miss'}">${matched?'✓ Pop read you right':'✕ Pop missed — your feedback recalibrates it'}</div>

          <div class="rate-label">How well did ${popName()} capture you?</div>
          <div class="rate">${dots}</div>

          <div class="fb">
            <textarea rows="2" placeholder="Tell ${popName()} why — the more honest, the smarter it gets…" data-deepnote="${idx}">${S.deepNote[idx]||''}</textarea>
            <button class="mic ${S.deepRecording?'rec':''}" data-deepvoice title="Voice feedback">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
            </button>
          </div>
          ${S.deepRecording?`<div class="rec-note fade">● Listening… <span class="muted">(demo — tap mic to stop)</span></div>`:''}

          <div class="deep-foot">
            ${idx>=total-1
              ? `<button class="btn btn-primary" data-deepend>Finish talk</button>`
              : `<button class="btn btn-primary" data-deepnext>Next question →</button>`}
            ${canEnd?`<button class="btn btn-ghost btn-sm" data-deepend>End talk</button>`:''}
          </div>
        </div>`}
    </div>
    <div class="deep-prog"><i style="width:${Math.round((idx + (answered?1:0))/total*100)}%"></i></div>
  </div>`;
}

/* ---------- EXPLORE ---------- */
function explorePage(){
  const tabs = [['recommended','Recommended'],['all','All opportunities'],['saved','Saved']];
  let list = OPPS;
  if (S.exploreTab==='saved') list = OPPS.filter(o=>S.saved[o.id]);
  if (S.exploreTab==='recommended') list = [...OPPS].sort((a,b)=>b.match-a.match);
  return `<div class="stagger">
    <div class="page-head"><span class="eyebrow">Explore · sent by businesses</span>
      <h1 class="display">Find work for <em>${popName()}.</em></h1>
      <p>Businesses post questions they’ll pay to have answered. Send your agent, do it yourself, or sign up for selective studies — if they pick you, you’re in. All matched to how well ${popName()} knows you.</p></div>
    <div class="toolbar">
      <div class="tabs">${tabs.map(([k,l])=>`<button class="${S.exploreTab===k?'on':''}" data-exploretab="${k}">${l}</button>`).join('')}</div>
      <span class="auto">Let ${popName()} auto-explore<button class="toggle ${S.autoExplore?'on':''}" data-auto></button></span>
    </div>
    ${S.autoExplore?`<div class="card fade" style="margin-bottom:18px;display:flex;align-items:center;gap:12px;background:rgba(47,110,92,.06);border-color:rgba(47,110,92,.25)">${popMini(40)}<span style="font-size:13.5px"><b style="color:var(--spruce)">Auto-explore is on.</b> ${popName()} will accept high-match tasks for you and report back. You keep final say on anything sensitive.</span></div>`:''}
    ${list.length?`<div class="opp-grid">${list.map(oppCard).join('')}</div>`:`<p class="muted center" style="padding:40px">No saved opportunities yet.</p>`}
    <div class="spacer"></div>
  </div>`;
}
function oppCard(o){
  const sent = S.sent[o.id], saved = S.saved[o.id], applied = S.applied[o.id];
  const heart = `<svg viewBox="0 0 24 24" width="20" height="20" fill="${saved?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21z"/></svg>`;
  const tag = o.mode==='apply' ? `<span class="opp-tag apply">Selective · sign up to be considered</span>` : `<span class="opp-tag open">Open · start anytime</span>`;
  let acts;
  if (o.mode==='apply'){
    acts = applied
      ? `<span class="sent-flag">✓ Signed up — ${o.org} will notify you if you’re picked</span>`
      : `<button class="btn btn-primary btn-sm" data-oppapply="${o.id}">Sign up</button>
         <button class="save ${saved?'on':''}" data-oppsave="${o.id}" title="Save">${heart}</button>`;
  } else {
    acts = sent
      ? `<span class="sent-flag">${popMini(22)} ${popName()} handled this · +$${o.reward.toFixed(2)}</span>`
      : `<button class="btn btn-spruce btn-sm" data-oppsend="${o.id}">Send ${popName()}</button>
         <button class="btn btn-ghost btn-sm" data-flowstart="${o.id}">Do it myself</button>
         <button class="save ${saved?'on':''}" data-oppsave="${o.id}" title="Save">${heart}</button>`;
  }
  return `<div class="opp ${(sent||applied)?'sent':''}">
    <div class="top"><span class="org"><span class="lg" style="background:${o.bg}">${o.lg}</span>
      <span class="oi"><span class="nm">${o.org}</span><span class="vt">${o.vt}</span></span></span>
      <span class="pill pill-spruce">${o.match}% match</span></div>
    <h3>${o.title}</h3>
    ${tag}
    <div class="meta"><span class="m reward">Reward&nbsp;<b>$${o.reward.toFixed(2)}</b></span><span class="m">Time&nbsp;<b>${o.time}</b></span></div>
    <div class="acts">${acts}</div>
  </div>`;
}

/* ---------- TASKS ---------- */
function tasksPage(){
  const completedList = [
    ...INVITES.filter(t=>S.completed[t.id]).map(t=>({org:t.org,bg:t.bg,lg:t.lg,title:t.title,amt:t.reward,via:t.mode==='direct'?'via Pop':'by you'})),
    ...OPPS.filter(o=>S.completed[o.id]||S.sent[o.id]).map(o=>({org:o.org,bg:o.bg,lg:o.lg,title:o.title,amt:o.reward,via:S.sent[o.id]?'via Pop':'by you'})),
  ];
  const tabs = [['invites',`Invitations${openInvites()?` <span class="badge">${openInvites()}</span>`:''}`],['completed',`Completed (${completedList.length})`]];
  let body;
  if (S.tasksTab==='invites'){
    body = INVITES.map(t => {
      if (S.completed[t.id]) return `<div class="invite done"><span class="lg" style="background:${t.bg}">${t.lg}</span>
        <div class="body"><div class="org">${t.org}</div><h3>${t.title}</h3></div>
        <div class="right"><span class="completed">✓ Completed</span><span class="muted" style="font-size:12px">earned $${t.reward.toFixed(2)}</span></div></div>`;
      const direct = t.mode==='direct';
      const flag = direct
        ? `<span class="mode-flag ok">✓ Pop can answer this directly</span>`
        : `<span class="mode-flag input">✎ Needs a little input from you first</span>`;
      const btn = direct
        ? `<button class="btn btn-spruce btn-sm" data-invitesend="${t.id}">Send ${popName()}</button>`
        : `<button class="btn btn-primary btn-sm" data-flowstart="${t.id}">Add input &amp; send</button>`;
      return `<div class="invite"><span class="lg" style="background:${t.bg}">${t.lg}</span>
        <div class="body"><div class="org">${t.org} · invited you</div><h3>${t.title}</h3><p>${t.desc}</p>${flag}</div>
        <div class="right"><span class="reward">$${t.reward.toFixed(2)}</span>${btn}</div></div>`;
    }).join('');
  } else {
    body = completedList.length ? completedList.map(c=>`<div class="invite done"><span class="lg" style="background:${c.bg}">${c.lg}</span>
      <div class="body"><div class="org">${c.org}${c.via?' · '+c.via:''}</div><h3>${c.title}</h3></div>
      <div class="right"><span class="completed">✓ Done</span><span class="muted" style="font-size:12px">+$${(c.amt||0).toFixed(2)}</span></div></div>`).join('')
      : `<p class="muted center" style="padding:40px">Nothing completed yet — accept an invitation or send ${popName()} from Explore.</p>`;
  }
  return `<div class="stagger">
    <div class="page-head"><span class="eyebrow">Tasks</span>
      <h1 class="display">Invitations <em>just for you.</em></h1>
      <p>Businesses can invite your profile directly. Some, ${popName()} can answer on its own; others need a little input from you first — then your upgraded Pop goes with the answers.</p></div>
    <div class="subtabs">${tabs.map(([k,l])=>`<button class="${S.tasksTab===k?'on':''}" data-taskstab="${k}">${l}</button>`).join('')}</div>
    ${body}<div class="spacer"></div>
  </div>`;
}

/* ---------- TASK / OPP FLOW ---------- */
function flowPage(){
  const meta = taskMeta(S.flow); const qs = FLOW[S.flow] || [];
  if (S.flowDone){
    return `<div class="flow flow-success fade">${orb(90)}
      <h1>Sent. Nice work.</h1><div class="amt">+$${meta.reward.toFixed(2)}</div>
      <p>A calibrated copy of ${popName()} — tuned to you — is on its way to <b>${meta.org}</b>.</p>
      <button class="btn btn-primary" data-flowexit>Back to ${S.flowReturn==='explore'?'Explore':S.flowReturn==='home'?'Home':'Tasks'}</button></div>`;
  }
  const i = S.flowIdx; const q = qs[i]; const pct = Math.round(i/qs.length*100);
  return `<div class="flow fade">
    <div class="flow-head"><div class="org">${meta.org}</div><h1>${meta.title}</h1>
      <div class="pay">Earn $${meta.reward.toFixed(2)} · ${qs.length} questions</div>
      <p class="flow-intro">Before ${popName()} heads to ${meta.org}, we need a little input from you — answer these so your agent represents you accurately.</p></div>
    <div class="progress"><i style="width:${pct}%"></i></div>
    <div class="q"><div class="qnum">QUESTION ${i+1} / ${qs.length}</div><div class="qtext">${q.q}</div>
      <div class="opts-grid">${q.o.map((o,oi)=>`<button class="opt ${S.flowAns[i]===oi?'picked':''}" data-flowopt="${oi}">${o}</button>`).join('')}</div></div>
    <div style="text-align:center;margin-top:22px"><button class="btn btn-ghost btn-sm" data-flowexit>Cancel</button></div>
  </div>`;
}

/* ---------- EARNINGS ---------- */
function earningsPage(){
  const f = fidelity();
  const extra = [...OPPS.filter(o=>S.sent[o.id]||S.completed[o.id]).map(o=>({t:o.title,d:(S.sent[o.id]?'via Pop':'by you'),amt:'+$'+o.reward.toFixed(2)})),
                 ...INVITES.filter(t=>S.completed[t.id]).map(t=>({t:t.title,d:t.org,amt:'+$'+t.reward.toFixed(2)}))];
  const list = [...extra, ...WALLET];
  const next = TIERS.find(t=>t.min>f);
  return `<div class="stagger">
    <div class="page-head"><span class="eyebrow">Earnings</span><h1 class="display">Earned <em>while you rest.</em></h1></div>
    <div class="earn-hero">
      <div class="card big"><div class="label">Available balance</div><div class="amt">$${S.earnings.toFixed(2)}</div><button class="btn btn-primary btn-sm">Cash out</button></div>
      <div class="card"><div class="label">Earning power</div><div class="amt" style="font-size:38px;color:var(--spruce)">~$${avgPerTask(f)}<small>/task</small></div>
        <p class="muted" style="font-size:13px">at ${f}% fidelity · ${activeTier(f).name}. ${next?`Reach <b>${next.name}</b> (${next.min}%) for about $${avgPerTask(next.min)}/task.`:'You’re at the top tier.'}</p></div>
    </div>
    <h2 style="font-family:'Fraunces',serif;font-weight:700;font-size:20px;margin-bottom:6px">Recent payouts</h2>
    <div class="card">${list.map(p=>`<div class="payout">
      <span class="ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
      <span class="meta"><span class="t">${p.t}</span><span class="d">${p.d}</span></span><span class="amt">${p.amt}</span></div>`).join('')}</div>
    <p class="center muted" style="font-size:12.5px;margin-top:16px;max-width:52ch;margin-left:auto;margin-right:auto">Payouts grow with your Pop’s fidelity and the scarcity of your profile.</p>
    <div class="spacer"></div>
  </div>`;
}

/* ============================================================
   POST-RENDER + live refresh
   ============================================================ */
function postRender(){
  const f = fidelity();
  document.querySelectorAll('.ring').forEach(r => requestAnimationFrame(()=>r.style.setProperty('--p', f)));
  document.querySelectorAll('.mini-ring').forEach(r => requestAnimationFrame(()=>r.style.setProperty('--p', f)));
  document.querySelectorAll('[data-w]').forEach(el => requestAnimationFrame(()=>{ el.style.width = el.dataset.w + '%'; }));
}
function refreshFidelityUI(){
  const f = fidelity();
  document.querySelectorAll('.ring').forEach(r => r.style.setProperty('--p', f));
  document.querySelectorAll('.mini-ring').forEach(r => r.style.setProperty('--p', f));
  const num = document.getElementById('ringNum'); if (num) num.innerHTML = `${f}<small>%</small>`;
  const sb = document.getElementById('sbMiniNum'); if (sb) sb.textContent = `${f}%`;
  const st = document.getElementById('sbTier'); if (st) st.textContent = `${activeTier(f).name} · ~$${avgPerTask(f)}/task`;
  const note = document.getElementById('ringNote'); if (note) note.innerHTML = ringNote(f);
  const ng = document.getElementById('nextGoal'); if (ng) ng.innerHTML = nextGoalInner(f);
  const dl = document.getElementById('demoLift'); if (dl) dl.textContent = demoPct()===100 ? 'done' : 'foundation';
}

/* ============================================================
   EVENTS
   ============================================================ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-nav],[data-bview],[data-popavatar],[data-q],[data-qjump],[data-intedit],[data-intdone],[data-conn],[data-mbti],[data-alignbatch],[data-alignstmtrate],[data-alignsubmit],[data-alignrefresh],[data-deepstart],[data-deepans],[data-deeprate],[data-deepnext],[data-deepend],[data-deepvoice],[data-exploretab],[data-auto],[data-taskstab],[data-oppsave],[data-oppsend],[data-oppapply],[data-invitesend],[data-flowstart],[data-flowopt],[data-flowexit]');
  if (!el) return; const d = el.dataset;

  if (d.nav !== undefined)        { S.flow=null; S.page=d.nav; if(d.nav==='build') S.buildView=d.bview||'overview'; return render(); }
  if (d.bview !== undefined)      { S.page='build'; S.buildView=d.bview; S.flow=null; return render(); }
  if (d.popavatar !== undefined)  { S.popAvatar=+d.popavatar; return render(); }
  if (d.q !== undefined)          { S.answers[+d.q]=+d.opt; if(+d.q===S.qIndex && S.qIndex<INTERVIEW.length-1) S.qIndex++; if(intComplete()) S.interviewEdit=false; return render(); }
  if (d.qjump !== undefined)      { S.qIndex=+d.qjump; return render(); }
  if (d.intedit !== undefined)    { S.interviewEdit=true; S.qIndex=0; return render(); }
  if (d.intdone !== undefined)    { S.interviewEdit=false; return render(); }
  if (d.conn !== undefined)       { S.connected[d.conn]=!S.connected[d.conn]; return render(); }
  if (d.alignbatch !== undefined) { S.alignBatch[+d.alignbatch]=+d.opt; return render(); }
  if (d.alignstmtrate !== undefined) { S.alignStmtRate=+d.alignstmtrate; return render(); }
  if (d.alignsubmit !== undefined){
    const mc=[0,1].map(k=>(S.alignOffset+k)%ALIGN.length);
    if (!(mc.every(i=>S.alignBatch[i]!==undefined) && S.alignStmtRate>0)) return;
    mc.forEach(i=>{ S.align[i]={you:S.alignBatch[i]}; });
    S.alignStmts[S.alignStmtIdx]={rate:S.alignStmtRate, note:S.alignStmtNote};
    S.alignOffset=(S.alignOffset+2)%ALIGN.length; S.alignStmtIdx=(S.alignStmtIdx+1)%ALIGN_STMTS.length;
    S.alignBatch={}; S.alignStmtRate=0; S.alignStmtNote=''; S.alignJustSubmitted=true; return render();
  }
  if (d.alignrefresh !== undefined){ S.alignJustSubmitted=false; return render(); }
  if (d.deepstart !== undefined)  { S.page='deeptalk'; return render(); }
  if (d.deepans !== undefined)    { S.deepAns[S.deepIdx]=+d.deepans; return render(); }
  if (d.deeprate !== undefined)   { S.deepRate[S.deepIdx]=+d.deeprate; return render(); }
  if (d.deepnext !== undefined)   { S.deepIdx=Math.min(DEEP.length, S.deepIdx+1); S.deepRecording=false; return render(); }
  if (d.deepvoice !== undefined)  { S.deepRecording=!S.deepRecording; return render(); }
  if (d.deepend !== undefined)    { S.page='build'; S.buildView='overview'; S.deepRecording=false; if(S.deepAns[S.deepIdx]!==undefined && S.deepIdx<DEEP.length) S.deepIdx++; return render(); }
  if (d.exploretab !== undefined) { S.exploreTab=d.exploretab; return render(); }
  if (d.auto !== undefined)       { S.autoExplore=!S.autoExplore; return render(); }
  if (d.taskstab !== undefined)   { S.tasksTab=d.taskstab; return render(); }
  if (d.oppsave !== undefined)    { S.saved[d.oppsave]=!S.saved[d.oppsave]; return render(); }
  if (d.oppsend !== undefined)    { const o=taskMeta(d.oppsend); S.sent[d.oppsend]=true; S.earnings+=o.reward; return render(); }
  if (d.oppapply !== undefined)   { S.applied[d.oppapply]=true; return render(); }
  if (d.invitesend !== undefined) { const t=taskMeta(d.invitesend); S.completed[d.invitesend]=true; S.earnings+=t.reward; S.flow=d.invitesend; S.flowDone=true; S.flowReturn='tasks'; return render(); }
  if (d.flowstart !== undefined)  { S.flow=d.flowstart; S.flowIdx=0; S.flowAns={}; S.flowDone=false; S.flowReturn=S.page; return render(); }
  if (d.flowopt !== undefined){
    const qs=FLOW[S.flow]; S.flowAns[S.flowIdx]=+d.flowopt;
    if (S.flowIdx < qs.length-1) S.flowIdx++;
    else if (!S.completed[S.flow]){ S.completed[S.flow]=true; S.earnings+=taskMeta(S.flow).reward; S.flowDone=true; }
    else S.flowDone=true;
    return render();
  }
  if (d.flowexit !== undefined)   { S.page=S.flowReturn||'tasks'; S.flow=null; S.flowDone=false; return render(); }
});

function onField(e){
  const f = e.target.closest('[data-demo]');
  if (f){ S.demo[f.dataset.demo]=e.target.value; f.closest('.field')?.classList.toggle('filled', !!e.target.value); refreshFidelityUI(); return; }
  const pn = e.target.closest('[data-popname]');
  if (pn){ S.popName=e.target.value; return; }
  const m = e.target.closest('[data-mbti]');
  if (m){ S.mbti=e.target.value; render(); return; }
  const lk = e.target.closest('[data-link]');
  if (lk){ S.links[lk.dataset.link]=e.target.value; return; }
  const sn = e.target.closest('[data-alignstmtnote]');
  if (sn){ S.alignStmtNote=e.target.value; return; }
  const dn = e.target.closest('[data-deepnote]');
  if (dn){ S.deepNote[+dn.dataset.deepnote]=e.target.value; return; }
}
document.addEventListener('input', onField);
document.addEventListener('change', onField);

/* ---------- boot ---------- */
render();
