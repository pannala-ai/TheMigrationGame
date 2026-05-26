// ═══════════════════════════════════════════════════════════
//  Roots & Routes — game.js
//  Real D3 world map + Monopoly-style explicit card drawing
// ═══════════════════════════════════════════════════════════

// ── AP HuG CONCEPTS ────────────────────────────────────────
const CONCEPTS = {
  push:      { name:'Push Factor (Ravenstein)', def:'Conditions forcing people to leave their origin — war, poverty, disaster, persecution.' },
  pull:      { name:'Pull Factor',              def:'Attractive conditions drawing migrants to destinations — jobs, safety, family, stability.' },
  obstacle:  { name:'Intervening Obstacle',     def:'Physical or political barriers impeding migration: borders, seas, visa regimes, walls.' },
  chain:     { name:'Chain Migration',          def:'Later migrants follow pioneer migrants along established routes using existing social networks.' },
  forced:    { name:'Forced Migration / Refugee', def:'Involuntary displacement due to conflict or disaster. Governed by the 1951 UN Refugee Convention.' },
  settlement:{ name:'Integration & Settlement', def:'Process of migrants establishing permanent residence and becoming part of the host society.' },
  remit:     { name:'Remittances',              def:'Money sent by migrants to origin countries — often exceeds foreign aid flows globally.' },
  brain:     { name:'Brain Drain',              def:'Emigration of skilled workers, depleting origin country human capital.' }
};

// ── COUNTRY DATA — lat/lon for D3 + topoId for map highlight
const CTRY = {
  mexico:      { name:'Mexico',      code:'MX', type:'origin', lat:23.6,  lon:-102.5, col:'#e07030', region:'Central America', topoId:484 },
  honduras:    { name:'Honduras',    code:'HN', type:'origin', lat:14.1,  lon:-86.2,  col:'#e07030', region:'Central America', topoId:340 },
  syria:       { name:'Syria',       code:'SY', type:'origin', lat:35.0,  lon:38.3,   col:'#e07030', region:'Middle East',     topoId:760 },
  nigeria:     { name:'Nigeria',     code:'NG', type:'origin', lat:9.1,   lon:8.7,    col:'#e07030', region:'West Africa',     topoId:566 },
  venezuela:   { name:'Venezuela',   code:'VE', type:'origin', lat:7.5,   lon:-66.6,  col:'#e07030', region:'South America',   topoId:862 },
  afghanistan: { name:'Afghanistan', code:'AF', type:'origin', lat:33.9,  lon:67.7,   col:'#e07030', region:'Central Asia',    topoId:4   },
  usa:         { name:'USA',         code:'US', type:'dest',   lat:37.1,  lon:-98.5,  col:'#0ecbb8', region:'North America',   topoId:840 },
  canada:      { name:'Canada',      code:'CA', type:'dest',   lat:58.0,  lon:-96.8,  col:'#0ecbb8', region:'North America',   topoId:124 },
  germany:     { name:'Germany',     code:'DE', type:'dest',   lat:51.2,  lon:10.5,   col:'#0ecbb8', region:'Western Europe',  topoId:276 },
  sweden:      { name:'Sweden',      code:'SE', type:'dest',   lat:62.0,  lon:15.0,   col:'#0ecbb8', region:'Northern Europe', topoId:752 },
  australia:   { name:'Australia',   code:'AU', type:'dest',   lat:-25.0, lon:133.8,  col:'#0ecbb8', region:'Oceania',         topoId:36  },
  uae:         { name:'UAE',         code:'AE', type:'dest',   lat:23.4,  lon:53.8,   col:'#0ecbb8', region:'Middle East',     topoId:784 }
};

const FLAG_COLORS = {
  mexico:'#006847', honduras:'#0073CF', syria:'#CE1126',
  nigeria:'#008751', venezuela:'#CF142B', afghanistan:'#009A44'
};
const DEST_W = { canada:10, germany:10, sweden:9, australia:8, usa:7, uae:6 };

// ── CARD DECKS ──────────────────────────────────────────────
const PUSH_DECK = [
  { icon:'D', title:'Drought Devastates Crops',   effect:-2, desc:'Farmland fails. Livelihoods collapse.',         hug:'push',   must:false },
  { icon:'P', title:'Political Persecution',      effect:-2, desc:'Dissidents imprisoned. Fear pervades.',          hug:'push',   must:false },
  { icon:'V', title:'Gang Violence Surge',        effect:-2, desc:'Extortion and murder rise unchecked.',           hug:'push',   must:false },
  { icon:'E', title:'Factory Closure',            effect:-1, desc:'Unemployment surges as industry fails.',         hug:'push',   must:false },
  { icon:'N', title:'Natural Disaster',           effect:-3, desc:'Earthquake destroys homes and infrastructure.',  hug:'forced', must:false },
  { icon:'H', title:'Hyperinflation',             effect:-2, desc:'Savings become worthless overnight.',            hug:'push',   must:false },
  { icon:'C', title:'Government Corruption',      effect:-1, desc:'Institutions crumble. Services collapse.',       hug:'push',   must:false },
  { icon:'W', title:'Water Scarcity Crisis',      effect:-1, desc:'Aquifers depleted. Tension rises.',              hug:'push',   must:false },
  { icon:'X', title:'Ethnic Conflict Erupts',     effect:-2, desc:'Intercommunal violence displaces thousands.',    hug:'forced', must:false },
  { icon:'I', title:'Infrastructure Collapses',   effect:-1, desc:'Roads, power, hospitals — all failing.',         hug:'push',   must:false },
  { icon:'R', title:'Remittance Arrives',         effect: 2, desc:'Money from relatives abroad stabilizes you.',    hug:'remit',  must:false },
  { icon:'S', title:'Ceasefire Holds',            effect: 1, desc:'Armed conflict pauses. Relief agencies arrive.', hug:'forced', must:false },
  { icon:'F', title:'Crop Failure',               effect:-2, desc:'Harvest lost. Food insecurity looms.',           hug:'push',   must:false },
  { icon:'W', title:'Civil War',                  effect:-3, desc:'Armed factions seize control. You must flee.',   hug:'forced', must:true  }
];
const OBS_DECK = [
  { icon:'V', title:'Visa Denied',         eff:'lose_turn', val:1, sc:0,  desc:'Application rejected. Forced to wait.',              hug:'obstacle', pass:false },
  { icon:'S', title:'Safe Passage',        eff:'pass',      val:0, sc:0,  desc:'The route is clear. You travel freely.',             hug:'obstacle', pass:true  },
  { icon:'B', title:'Border Wall',         eff:'reroute',   val:0, sc:0,  desc:'Physical barrier forces a detour.',                  hug:'obstacle', pass:false },
  { icon:'S', title:'Smuggler Route',      eff:'pass',      val:0, sc:-1, desc:'Dangerous, but effective. Arrive weakened.',          hug:'obstacle', pass:true  },
  { icon:'D', title:'Detained at Border',  eff:'lose_turn', val:2, sc:0,  desc:'Held in processing. Long wait ahead.',                hug:'obstacle', pass:false },
  { icon:'A', title:'Papers Approved',     eff:'pass',      val:0, sc:1,  desc:'Documents clear. Bonus stability on arrival.',        hug:'obstacle', pass:true  },
  { icon:'O', title:'Ocean Too Dangerous', eff:'block',     val:0, sc:0,  desc:'Storm season. No ocean crossing this turn.',          hug:'obstacle', pass:false },
  { icon:'A', title:'Asylum Granted',      eff:'pass',      val:0, sc:1,  desc:'Legal protection secured. Move freely.',              hug:'forced',   pass:true  },
  { icon:'L', title:'Language Barrier',    eff:'pass',      val:0, sc:-1, desc:'You arrive but struggle to integrate.',               hug:'obstacle', pass:true  },
  { icon:'R', title:'Refugee Camp',        eff:'lose_turn', val:1, sc:0,  desc:'Wait in temporary shelter before continuing.',        hug:'forced',   pass:false },
  { icon:'P', title:'Border Patrol',       eff:'return',    val:0, sc:0,  desc:'Caught and returned to origin country.',              hug:'obstacle', pass:false },
  { icon:'U', title:'Underground Network', eff:'pass',      val:0, sc:0,  desc:'Hidden network provides secret safe passage.',        hug:'chain',    pass:true  }
];
const PULL_DECK = [
  { icon:'J', title:'Strong Job Market',     effect:3, desc:'Low unemployment. Wages draw migrants from afar.',       hug:'pull',     redirect:false },
  { icon:'F', title:'Family Already Here',   effect:2, desc:'Relatives provide housing and networks on arrival.',     hug:'chain',    redirect:false },
  { icon:'H', title:'Free Healthcare',        effect:2, desc:'Universal coverage eases the burden of settling.',       hug:'pull',     redirect:false },
  { icon:'O', title:'Overcrowded',            effect:0, desc:'No capacity. You must choose another destination.',      hug:'obstacle', redirect:true  },
  { icon:'W', title:'High Wages',             effect:3, desc:'Purchasing power vastly exceeds origin country.',        hug:'pull',     redirect:false },
  { icon:'R', title:'Refugee Policy',         effect:2, desc:'Government actively supports newcomers.',                hug:'forced',   redirect:false },
  { icon:'C', title:'Cultural Community',     effect:2, desc:'Diaspora provides immediate belonging and support.',     hug:'chain',    redirect:false },
  { icon:'E', title:'Educational Access',     effect:1, desc:'World-class universities open to immigrants.',           hug:'pull',     redirect:false },
  { icon:'K', title:'Cold Climate Shock',     effect:1, desc:'Integration slower than expected. Difficult adjustment.',hug:'obstacle', redirect:false },
  { icon:'S', title:'Housing Shortage',       effect:1, desc:'Accommodation scarce. You find something, barely.',      hug:'obstacle', redirect:false },
  { icon:'P', title:'Political Stability',    effect:2, desc:'Rule of law and functioning institutions — a relief.',   hug:'pull',     redirect:false },
  { icon:'L', title:'Remote, Low Demand',     effect:1, desc:'Work exists but isolation is significant.',              hug:'pull',     redirect:false }
];

// ── GAME STATE ──────────────────────────────────────────────
let G = {
  turn:1, maxTurns:20, phase:'setup',
  pMigrating:false, bMigrating:false,
  pWait:0, bWait:0,
  conceptsSeen: new Set(),
  pendingObsCard: null,
  p:{ country:null, stab:5, tokens:0, turnsHere:0, visited:[], statsLost:0, statsGained:0 },
  b:{ country:null, stab:5, tokens:0, turnsHere:0, visited:[] },
  decks:{ push:[], obs:[], pull:[] },
  log:[]
};

// ── D3 MAP STATE ────────────────────────────────────────────
let projection, pathFn, mapSvg, worldData, mapReady = false;

// ── UTILITIES ───────────────────────────────────────────────
const clamp = (v,lo,hi) => Math.max(lo, Math.min(hi, v));
function shuffle(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}; return b; }
function draw(deck){
  if(!G.decks[deck].length) G.decks[deck]=shuffle(deck==='push'?[...PUSH_DECK]:deck==='obs'?[...OBS_DECK]:[...PULL_DECK]);
  return G.decks[deck].pop();
}
function seeConcept(k){ if(k&&CONCEPTS[k]&&!G.conceptsSeen.has(k)){ G.conceptsSeen.add(k); renderConcepts(); } }
function renderConcepts(){
  const el=document.getElementById('cList');
  if(el) el.innerHTML=[...G.conceptsSeen].map(k=>`<div class="ctag">${CONCEPTS[k].name}</div>`).join('');
}
function addLog(msg,type='sys'){
  G.log.unshift({msg,type});
  if(G.log.length>60) G.log.pop();
  const el=document.getElementById('logEntries');
  if(el) el.innerHTML=G.log.slice(0,10).map(e=>`<div class="le le-${e.type}">${e.msg}</div>`).join('');
}
function stabClass(v){ return v>=6?'':'mid'+( v>=3?'':' low') }
function stabCls(v){ return v>=6?'':v>=3?'mid':'low' }
function flash(t){
  const el=document.getElementById('flashOverlay');
  el.className=t==='r'?'fr':'fg';
  el.style.opacity='1';
  setTimeout(()=>el.style.opacity='0',320);
}

// ── UI UPDATERS ─────────────────────────────────────────────
function updateP(){
  const p=G.p, c=CTRY[p.country]||{};
  document.getElementById('pAvatar').textContent=c.code||'—';
  document.getElementById('pLoc').textContent=(c.name||'—').toUpperCase();
  const pct=clamp(p.stab/10*100,0,100);
  const bar=document.getElementById('pStabFill');
  bar.style.width=pct+'%'; bar.className='stab-fill '+stabCls(p.stab);
  document.getElementById('pStabNum').textContent=p.stab+'/10';
  for(let i=0;i<3;i++){const t=document.getElementById('pt'+i);t.className='tok'+(i<p.tokens?' on':'');t.textContent=i<p.tokens?'★':''}
  document.getElementById('pTurnsHere').textContent=p.turnsHere;
  document.getElementById('pCountries').textContent=p.visited.length;
  document.getElementById('pVisited').textContent=p.visited.map(k=>CTRY[k]?.name).join(' → ')||'—';
}
function updateA(){
  const b=G.b, c=CTRY[b.country]||{};
  document.getElementById('aAvatar').textContent=c.code||'AI';
  document.getElementById('aLoc').textContent=(c.name||'AUTOMATED AGENT').toUpperCase();
  const pct=clamp(b.stab/10*100,0,100);
  const bar=document.getElementById('aStabFill');
  bar.style.width=pct+'%'; bar.className='stab-fill aria-stab '+stabCls(b.stab);
  document.getElementById('aStabNum').textContent=b.stab+'/10';
  for(let i=0;i<3;i++){const t=document.getElementById('at'+i);t.className='tok'+(i<b.tokens?' on':'');t.textContent=i<b.tokens?'★':''}
  document.getElementById('aTurnsHere').textContent=b.turnsHere;
  document.getElementById('aCountries').textContent=b.visited.length;
  document.getElementById('aVisited').textContent=b.visited.map(k=>CTRY[k]?.name).join(' → ')||'—';
}
function setPhase(name, cls){
  G.phase=name;
  const pill=document.getElementById('phasePill');
  const labels={push:'Push Phase',obstacle:'Obstacle',arrival:'Choose Destination',pull:'Pull Factor',aria:"ARIA's Turn",settlement:'Settlement',end:'Game Over'};
  pill.textContent='◆ '+(labels[name]||name);
  pill.className='phase-pill '+(cls||name);
}
function setDesc(t){ document.getElementById('phaseDesc').textContent=t; }
function setAria(t){ document.getElementById('ariaText').textContent=t; }
function setCards(html){ document.getElementById('cardRow').innerHTML=html; }
function setActions(html){ document.getElementById('actionBtns').innerHTML=html; }
function updateDecks(){
  document.getElementById('pushCnt').textContent=G.decks.push.length||12;
  document.getElementById('obsCnt').textContent=G.decks.obs.length||12;
  document.getElementById('pullCnt').textContent=G.decks.pull.length||12;
}
function updatePresence(){
  if(!mapReady) return;
  document.querySelectorAll('.pr-ring').forEach(e=>e.style.display='none');
  if(G.p.country){ const el=document.getElementById('pr-p-'+G.p.country); if(el)el.style.display=''; }
  if(G.b.country){ const el=document.getElementById('pr-b-'+G.b.country); if(el)el.style.display=''; }
  // Highlight country paths
  d3.selectAll('.country-path').classed('player-loc',false).classed('aria-loc',false);
  if(G.p.country&&CTRY[G.p.country]){
    d3.selectAll('.country-path').filter(d=>d&&d.id===CTRY[G.p.country].topoId).classed('player-loc',true);
  }
  if(G.b.country&&CTRY[G.b.country]){
    d3.selectAll('.country-path').filter(d=>d&&d.id===CTRY[G.b.country].topoId).classed('aria-loc',true);
  }
}

// ── CARD HTML BUILDER ───────────────────────────────────────
function cardInnerHTML(card, deckType){
  const typeLabel=deckType==='push'?'Push Factor':deckType==='obs'?'Obstacle':'Pull Factor';
  const eff=card.effect!==undefined?card.effect:(card.sc||0);
  const effHtml=eff!==0?`<div class="c-eff">${eff>0?'+':''}${eff} Stability</div>`:'';
  const conceptName=CONCEPTS[card.hug]?.name.split('(')[0].trim()||'';
  seeConcept(card.hug);
  return `
    <div class="c-type">${typeLabel}</div>
    <div class="c-icon">${card.icon}</div>
    <div class="c-title">${card.title}</div>
    <div class="c-desc">${card.desc}</div>
    ${effHtml}
    ${conceptName?`<div class="c-concept">${conceptName}</div>`:''}
  `;
}

function cardHTML(card, deckType){
  const cls=deckType==='push'?'push-c':deckType==='obs'?'obs-c':'pull-c';
  seeConcept(card.hug);
  return `<div class="c-face ${cls}">${cardInnerHTML(card,deckType)}</div>`;
}

function revealCard(containerId, card, deckType, label){
  const backCls=deckType==='push'?'push-back-d':deckType==='obs'?'obs-back-d':'pull-back-d';
  const faceCls=deckType==='push'?'push-c':deckType==='obs'?'obs-c':'pull-c';
  const el=document.getElementById(containerId);
  if(!el) return;
  // Step 1: show face-down card back
  el.innerHTML=`
    <div class="card-lbl">${label}</div>
    <div class="card-face ${backCls} card-is-back">R&amp;R</div>`;
  // Step 2: after delay, swap to card face with reveal animation
  setTimeout(()=>{
    const el2=document.getElementById(containerId);
    if(!el2) return;
    el2.innerHTML=`
      <div class="card-lbl">${label}</div>
      <div class="card-face ${faceCls} card-is-front">${cardInnerHTML(card,deckType)}</div>`;
  },700);
}

// ── D3 MAP INIT ─────────────────────────────────────────────
function initMap(){
  const container=document.getElementById('mapContainer');
  // Guard: wait for layout to calculate real dimensions
  if(!container||!container.clientWidth){
    setTimeout(initMap,60); return;
  }
  const W=container.clientWidth, H=container.clientHeight;
  mapSvg=d3.select('#worldMap');
  mapSvg.attr('width',W).attr('height',H);

  projection=d3.geoNaturalEarth1()
    .scale(Math.min(W/6.2, H/3.1))
    .translate([W/2, H/2+20]);
  pathFn=d3.geoPath().projection(projection);

  Object.keys(CTRY).forEach(k=>{
    const c=CTRY[k];
    const [x,y]=projection([c.lon,c.lat]);
    c.svgX=x; c.svgY=y;
  });

  mapSvg.append('rect').attr('width',W).attr('height',H).attr('class','ocean-bg');

  // Always build routes and nodes immediately — game is playable without world topojson
  buildRoutes();
  buildNodes();
  mapSvg.append('circle').attr('id','mdot-p').attr('r',5.5).attr('class','mdot').attr('cx',0).attr('cy',0);
  mapSvg.append('circle').attr('id','mdot-b').attr('r',5.5).attr('class','mdot').attr('cx',0).attr('cy',0);

  mapReady=true;
  buildStartScreen();

  // Load world topojson in background (visual enhancement — game works either way)
  const CDN_URLS=[
    'https://cdn.jsdelivr.net/npm/world-atlas@2/world-110m.json',
    'https://unpkg.com/world-atlas@2/world-110m.json'
  ];
  function tryLoadWorld(i){
    if(i>=CDN_URLS.length) return;
    d3.json(CDN_URLS[i]).then(world=>{
      const countries=topojson.feature(world,world.objects.countries);
      // Insert country layer BELOW routes and nodes
      const routesNode=document.getElementById('routes');
      const cg=mapSvg.insert('g',()=>routesNode);
      cg.selectAll('.country-path')
        .data(countries.features).enter().append('path')
        .attr('class','country-path').attr('d',pathFn).attr('data-id',d=>d.id);
      mapSvg.insert('path',()=>routesNode).datum(d3.geoGraticule()()).attr('class','graticule').attr('d',pathFn);
      mapSvg.insert('path',()=>routesNode)
        .datum({type:'LineString',coordinates:[[-180,0],[180,0]]})
        .attr('class','equator-line').attr('d',pathFn);
      countries.features.forEach(f=>{
        const key=Object.keys(CTRY).find(k=>CTRY[k].topoId===f.id);
        if(key) d3.select(`[data-id="${f.id}"]`).classed(CTRY[key].type==='origin'?'game-orig':'game-dest',true);
      });
      [['NORTH AMERICA',-100,45],['SOUTH AMERICA',-60,-15],['EUROPE',15,55],
       ['AFRICA',20,0],['ASIA',90,50],['AUSTRALIA',135,-30]].forEach(([lbl,lon,lat])=>{
        const [x,y]=projection([lon,lat]);
        mapSvg.insert('text',()=>routesNode).attr('class','map-label').attr('x',x).attr('y',y).text(lbl);
      });
      worldData=world;
      updatePresence();
    }).catch(()=>tryLoadWorld(i+1));
  }
  tryLoadWorld(0);
}

function buildRoutes(){
  const routes=[
    ['mexico','usa'],['mexico','canada'],['honduras','usa'],
    ['venezuela','usa'],['venezuela','canada'],
    ['syria','germany'],['syria','sweden'],['syria','australia'],
    ['nigeria','germany'],['nigeria','sweden'],['nigeria','uae'],
    ['afghanistan','uae'],['afghanistan','germany'],['afghanistan','australia']
  ];
  const rg=mapSvg.append('g').attr('id','routes').attr('opacity','0.9');
  routes.forEach(([a,b])=>{
    const ca=CTRY[a], cb=CTRY[b];
    if(!ca?.svgX||!cb?.svgX) return;
    const mx=(ca.svgX+cb.svgX)/2, my=Math.min(ca.svgY,cb.svgY)-30-Math.abs(cb.svgX-ca.svgX)*0.06;
    rg.append('path')
      .attr('class','route-line route-p')
      .attr('d',`M ${ca.svgX},${ca.svgY} Q ${mx},${my} ${cb.svgX},${cb.svgY}`);
  });
}

function buildNodes(){
  const ng=mapSvg.append('g').attr('id','cnodes');
  Object.entries(CTRY).forEach(([key,c])=>{
    const isO=c.type==='origin';
    const x=c.svgX, y=c.svgY;
    const g=ng.append('g').attr('class','game-node '+(isO?'node-origin':'node-dest')).attr('id','cn-'+key);

    // Presence rings
    g.append('circle').attr('cx',x).attr('cy',y).attr('r',15).attr('class','pr-ring pr-p').attr('id','pr-p-'+key).style('display','none');
    g.append('circle').attr('cx',x).attr('cy',y).attr('r',18).attr('class','pr-ring pr-b').attr('id','pr-b-'+key).style('display','none');
    // Glow
    g.append('circle').attr('cx',x).attr('cy',y).attr('r',12).attr('class','node-glow');
    // Ring
    g.append('circle').attr('cx',x).attr('cy',y).attr('r',8).attr('class','node-ring').attr('fill','none');
    // Dot
    g.append('circle').attr('cx',x).attr('cy',y).attr('r',4.5).attr('class','node-dot');
    // Label
    const lw=c.name.length*4+10;
    g.append('rect').attr('x',x-lw/2).attr('y',y+11).attr('width',lw).attr('height',11).attr('rx',2).attr('class','node-lbg');
    g.append('text').attr('x',x).attr('y',y+19.5).attr('class','node-lbl').text(c.name);
  });
}

// ── MIGRATION ANIMATION ─────────────────────────────────────
function animMove(fromKey, toKey, dotId, cb){
  const f=CTRY[fromKey], t=CTRY[toKey];
  if(!f?.svgX||!t?.svgX){ cb&&cb(); return; }
  const dot=document.getElementById(dotId);
  if(!dot){ cb&&cb(); return; }
  const cx=(f.svgX+t.svgX)/2, cy=Math.min(f.svgY,t.svgY)-30-Math.abs(t.svgX-f.svgX)*0.07;
  dot.style.opacity='1';
  const dur=800, start=performance.now();
  function step(ts){
    const u=Math.min((ts-start)/dur,1);
    const bx=(1-u)*(1-u)*f.svgX+2*(1-u)*u*cx+u*u*t.svgX;
    const by=(1-u)*(1-u)*f.svgY+2*(1-u)*u*cy+u*u*t.svgY;
    dot.setAttribute('cx',bx); dot.setAttribute('cy',by);
    if(u<1) requestAnimationFrame(step);
    else{ dot.style.opacity='0'; cb&&cb(); }
  }
  requestAnimationFrame(step);
}

// ── DESTINATION MAP HIGHLIGHT ────────────────────────────────
function highlightDests(active, blockKey=''){
  d3.selectAll('.country-path').classed('dest-available',false).on('click',null);
  if(!active) return;
  Object.entries(CTRY).filter(([k,c])=>c.type==='dest'&&k!==blockKey).forEach(([key,c])=>{
    d3.selectAll('.country-path').filter(d=>d&&d.id===c.topoId)
      .classed('dest-available',true)
      .on('click',()=>chooseP(key));
  });
}

// ── CONFETTI ─────────────────────────────────────────────────
const CVS=document.getElementById('confettiCanvas');
const CTX=CVS.getContext('2d');
CVS.width=window.innerWidth; CVS.height=window.innerHeight;
window.addEventListener('resize',()=>{CVS.width=window.innerWidth;CVS.height=window.innerHeight});
let parts=[];
function confetti(){
  const cols=['#ff9f0a','#ffd60a','#0a84ff','#ff453a','#30d158','#bf5af2'];
  for(let i=0;i<130;i++) parts.push({
    x:Math.random()*CVS.width, y:Math.random()*CVS.height*.45,
    vx:(Math.random()-.5)*3.8, vy:Math.random()*2.8+0.8,
    w:Math.random()*8+3, h:Math.random()*4+2,
    col:cols[Math.floor(Math.random()*cols.length)],
    rot:Math.random()*Math.PI*2, rv:(Math.random()-.5)*.14, life:1
  });
  animParts();
}
let pRAF=null;
function animParts(){
  if(pRAF) cancelAnimationFrame(pRAF);
  CTX.clearRect(0,0,CVS.width,CVS.height);
  parts=parts.filter(p=>p.life>0.01);
  parts.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy; p.rot+=p.rv; p.life-=0.011; p.vy+=0.045;
    CTX.save(); CTX.globalAlpha=p.life; CTX.translate(p.x,p.y); CTX.rotate(p.rot);
    CTX.fillStyle=p.col; CTX.fillRect(-p.w/2,-p.h/2,p.w,p.h); CTX.restore();
  });
  if(parts.length) pRAF=requestAnimationFrame(animParts);
  else CTX.clearRect(0,0,CVS.width,CVS.height);
}

// ── START SCREEN ─────────────────────────────────────────────
const ORIGINS=['mexico','honduras','syria','nigeria','venezuela','afghanistan'];
let selCountry=null;
function buildStartScreen(){
  const g=document.getElementById('ssGrid');
  g.innerHTML=ORIGINS.map(k=>{
    const c=CTRY[k];
    const fc=FLAG_COLORS[k]||'#444';
    return `<div class="ss-opt" onclick="pickCountry('${k}',this)">
      <div class="ss-flag" style="background:${fc}">${c.code}</div>
      <div class="ss-cname">${c.name}</div>
      <div class="ss-creg">${c.region}</div>
    </div>`;
  }).join('');
}
function pickCountry(k,el){
  selCountry=k;
  document.querySelectorAll('.ss-opt').forEach(e=>e.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('startBtn').disabled=false;
}
function startGame(){
  if(!selCountry) return;
  const bots=ORIGINS.filter(k=>k!==selCountry);
  const botC=bots[Math.floor(Math.random()*bots.length)];
  G.p.country=selCountry; G.p.visited=[selCountry]; G.p.stab=8;
  G.b.country=botC; G.b.visited=[botC]; G.b.stab=8;
  G.decks.push=shuffle([...PUSH_DECK]);
  G.decks.obs=shuffle([...OBS_DECK]);
  G.decks.pull=shuffle([...PULL_DECK]);
  document.getElementById('startScreen').style.display='none';
  updateP(); updateA(); updatePresence();
  updateDecks();
  addLog(`Journey begins. You: ${CTRY[selCountry].name}. ARIA: ${CTRY[botC].name}.`,'sys');
  setTimeout(pushPhase, 300);
}

// ═══════════════════════════════════════════════════════════
//  TURN FLOW — Monopoly-style explicit actions
// ═══════════════════════════════════════════════════════════

function pushPhase(){
  if(G.phase==='end') return;
  setPhase('push');
  document.getElementById('turnNum').textContent=G.turn;
  setCards('');

  if(G.pWait>0){
    G.pWait--;
    // Still draw and apply ARIA's push even when player waits
    const bCard=draw('push');
    G.b.stab=clamp(G.b.stab+bCard.effect,0,10);
    G.bMigrating=bCard.must||G.b.stab<=0;
    addLog(`Waiting — ${G.pWait} turns left.`,'sys');
    addLog(`ARIA push: "${bCard.title}" (${bCard.effect} stab)`,'push');
    updateA();
    setDesc(`You are waiting this turn. ARIA takes their move.`);
    setActions(`<button class="btn btn-next" onclick="botDecision()">Watch ARIA's Move</button>`);
    return;
  }

  setDesc(`Turn ${G.turn}: Draw your Push card to see what conditions you face this turn.`);
  setActions(`<button class="btn btn-draw-push" onclick="doPushDraw()">Draw Push Card</button>`);
}

function doPushDraw(){
  setActions('');
  const pCard=draw('push');
  const bCard=draw('push');
  G.p.stab=clamp(G.p.stab+pCard.effect,0,10);
  if(pCard.effect<0) G.p.statsLost=(G.p.statsLost||0)+Math.abs(pCard.effect);
  G.b.stab=clamp(G.b.stab+bCard.effect,0,10);
  G.pMigrating=pCard.must||G.p.stab<=0;
  G.bMigrating=bCard.must||G.b.stab<=0;
  if(pCard.effect<0) flash('r'); else flash('g');

  // Show both cards with flip animation
  setCards(`
    <div class="card-wrap" id="your-push"></div>
    <div class="card-wrap" id="aria-push"></div>
  `);
  setTimeout(()=>{ revealCard('your-push',pCard,'push','Your Push'); },50);
  setTimeout(()=>{ revealCard('aria-push',bCard,'push',"ARIA's Push"); },250);

  addLog(`Push: "${pCard.title}" (${pCard.effect} stab)`,'push');
  addLog(`ARIA push: "${bCard.title}" (${bCard.effect} stab)`,'push');
  updateP(); updateA();
  updateDecks();

  const mustNote=G.pMigrating?' You must migrate!':'';
  setDesc(`Your stability: ${G.p.stab}/10.${mustNote} What will you do?`);
  setAria(`ARIA stability: ${G.b.stab}/10. ${G.b.stab<3?'Migration threshold reached.':'Holding position.'}`);

  setTimeout(decisionPhase, 700);
}

function waitTurn(){
  setDesc(`You are waiting this turn. ARIA takes their turn.`);
  setActions(`<button class="btn btn-next" onclick="botDecision()">Watch ARIA's Move</button>`);
}

function decisionPhase(){
  if(G.pMigrating){
    setDesc(`Stability critical — you must migrate now. Choose where to go.`);
    setActions(`<button class="btn btn-migrate" onclick="goToObstacle()">Migrate Now</button>`);
    return;
  }
  setDesc(`Stability: ${G.p.stab}/10. Stay in ${CTRY[G.p.country]?.name} or move to a destination country?`);
  setActions(`
    <button class="btn btn-stay" onclick="stayDecision()">Stay Here</button>
    <button class="btn btn-migrate" onclick="goToObstacle()">Migrate</button>
  `);
}

function stayDecision(){
  G.pMigrating=false;
  // Staying at a destination earns community roots (+1 stability)
  if(CTRY[G.p.country]?.type==='dest'){
    G.p.stab=clamp(G.p.stab+1,0,10);
    G.p.statsGained=(G.p.statsGained||0)+1;
    addLog(`Staying in ${CTRY[G.p.country]?.name}. +1 Stability.`,'pull');
  } else {
    addLog(`Staying in ${CTRY[G.p.country]?.name}.`,'sys');
  }
  setActions('');
  setDesc(`You stay in ${CTRY[G.p.country]?.name}. Watching ARIA's move...`);
  updateP();
  setTimeout(botDecision, 350);
}

function goToObstacle(){
  setPhase('obstacle');
  setDesc(`Draw an Obstacle card to see what stands between you and your destination.`);
  setActions(`<button class="btn btn-draw-obs" onclick="doObstacleDraw()">Draw Obstacle Card</button>`);
}

function doObstacleDraw(){
  setActions('');
  const card=draw('obs');
  G.pendingObsCard=card;
  addLog(`Obstacle: "${card.title}"`,'obs');
  seeConcept(card.hug);

  // Keep existing push cards, add obstacle card
  const pushCards=document.getElementById('cardRow').innerHTML;
  setCards(pushCards+`<div class="card-wrap" id="your-obs"></div>`);
  setTimeout(()=>{ revealCard('your-obs',card,'obs','Obstacle'); },50);
  updateDecks();

  if(card.pass){
    if(card.sc){ G.p.stab=clamp(G.p.stab+card.sc,0,10); updateP(); }
    flash('g');
    setDesc(`"${card.title}" — path is clear! ${card.desc} Now choose your destination.`);
    setTimeout(()=>arrivalPhase_P(null), 700);
  } else if(card.eff==='lose_turn'){
    G.pWait=card.val; G.pMigrating=false;
    flash('r');
    setDesc(`"${card.title}" — you lose ${card.val} turn(s). ${card.desc}`);
    addLog(`Lost ${card.val} turn(s).`,'obs');
    setTimeout(()=>{ setActions(`<button class="btn btn-next" onclick="botDecision()">Watch ARIA's Move</button>`); },600);
  } else if(card.eff==='return'){
    G.pMigrating=false; G.p.turnsHere=0;
    flash('r');
    setDesc(`"${card.title}" — returned to ${CTRY[G.p.country]?.name}. ${card.desc}`);
    addLog(`Returned to ${CTRY[G.p.country]?.name}.`,'obs');
    setTimeout(()=>{ setActions(`<button class="btn btn-next" onclick="botDecision()">Watch ARIA's Move</button>`); },600);
  } else {
    flash('r');
    setDesc(`"${card.title}" — ${card.desc} Choose an available destination.`);
    setTimeout(()=>arrivalPhase_P(card.eff), 700);
  }
}

function arrivalPhase_P(obstType){
  setPhase('arrival');
  G.pMigrating=true;
  let destKeys=Object.keys(CTRY).filter(k=>CTRY[k].type==='dest');
  if(obstType==='block') destKeys=destKeys.filter(k=>k!=='australia');

  // Highlight available countries on the real map
  highlightDests(true, obstType==='block'?'australia':'');

  const dbtns=destKeys.map(k=>`<button class="d-btn" onclick="chooseP('${k}')">${CTRY[k].name}</button>`).join('');
  setDesc(`Choose your destination. Click a country on the map or use the buttons below.`);
  setActions(`<div id="destGrid">${dbtns}</div>`);
}

function chooseP(key){
  highlightDests(false);
  setActions('');
  setDesc(`Migrating to ${CTRY[key]?.name}...`);
  const from=G.p.country;
  addLog(`Migrating: ${CTRY[from]?.name} → ${CTRY[key]?.name}`,'sys');
  animMove(from, key, 'mdot-p', ()=>{
    G.p.country=key; G.p.turnsHere=0; G.pMigrating=true;
    if(!G.p.visited.includes(key)) G.p.visited.push(key);
    updatePresence();
    pullPhase_P(key);
  });
}

function pullPhase_P(country){
  setPhase('pull');
  setDesc(`You have arrived in ${CTRY[country]?.name}! Draw a Pull card to see what awaits you.`);
  setActions(`<button class="btn btn-draw-pull" onclick="doPullDraw('${country}')">Draw Pull Card</button>`);
}

function doPullDraw(country){
  setActions('');
  const card=draw('pull');
  seeConcept(card.hug);
  updateDecks();

  const existing=document.getElementById('cardRow').innerHTML;
  setCards(existing+`<div class="card-wrap" id="your-pull"></div>`);
  setTimeout(()=>{ revealCard('your-pull',card,'pull','Pull Factor'); },50);

  if(card.redirect && G.b.country===country){
    flash('r');
    addLog(`Overcrowded! ${CTRY[country]?.name} is full. Redirect!`,'sys');
    seeConcept('obstacle');
    setDesc(`"${card.title}" — destination overcrowded. You must choose again.`);
    setTimeout(()=>arrivalPhase_P(null), 700);
    return;
  }
  const eff=card.effect||0;
  if(eff){ G.p.stab=clamp(G.p.stab+eff,0,10); if(eff>0){G.p.statsGained+=eff; flash('g');} }
  addLog(`Pull in ${CTRY[country]?.name}: "${card.title}" (${eff>=0?'+':''}${eff})`,'pull');
  setDesc(`Arrived in ${CTRY[country]?.name}! Pull: "${card.title}" (${eff>=0?'+':''}${eff} Stability). Now watch ARIA's move.`);
  updateP();
  setTimeout(()=>{ setActions(`<button class="btn btn-teal" onclick="botDecision()">ARIA's Turn</button>`); },700);
}

// ── BOT AI ──────────────────────────────────────────────────
function botDecision(){
  setPhase('aria');
  setActions('');
  setCards(''); // clear player cards; ARIA's cards will appear here
  setDesc(`ARIA is calculating their migration strategy...`);
  document.getElementById('ariaBubble').classList.add('on');
  setTimeout(botAct, 400+Math.random()*250);
}

function botAct(){
  document.getElementById('ariaBubble').classList.remove('on');
  if(G.bWait>0){
    G.bWait--;
    addLog(`ARIA waiting (${G.bWait} turns remain).`,'sys');
    setAria(`ARIA in holding pattern. Stability: ${G.b.stab}/10.`);
    setDesc(`ARIA is waiting. Processing settlement...`);
    G.bMigrating=false;
    setTimeout(settlement,400);
    return;
  }
  const shouldMove=G.bMigrating||G.b.stab<3||Math.random()<0.35;
  if(!shouldMove){
    addLog(`ARIA stays in ${CTRY[G.b.country]?.name}.`,'sys');
    setAria(`ARIA holds position in ${CTRY[G.b.country]?.name}. Stability: ${G.b.stab}/10. Progress: ${G.b.turnsHere}/2.`);
    setDesc(`ARIA stays in ${CTRY[G.b.country]?.name}. Processing settlement...`);
    setTimeout(settlement, 400);
    return;
  }
  G.bMigrating=true;
  const obs=draw('obs');
  addLog(`ARIA obstacle: "${obs.title}"`,'obs');
  setAria(`ARIA drew: "${obs.title}". ${obs.pass?'Passable — migrating.':'Blocked.'}`);
  setDesc(`ARIA obstacle: "${obs.title}" — ${obs.desc}`);
  // Show ARIA's obstacle card
  setCards(`<div class="card-wrap" id="a-obs-c"></div>`);
  setTimeout(()=>revealCard('a-obs-c',obs,'obs',"ARIA Obstacle"),50);
  updateDecks();
  if(!obs.pass){
    if(obs.eff==='lose_turn') G.bWait=obs.val;
    if(obs.eff==='return') G.b.turnsHere=0;
    G.bMigrating=false;
    setTimeout(settlement, 900);
    return;
  }
  if(obs.sc) G.b.stab=clamp(G.b.stab+obs.sc,0,10);
  const dest=botPickDest();
  const from=G.b.country;
  addLog(`ARIA → ${CTRY[dest]?.name}.`,'sys');
  setDesc(`ARIA migrates to ${CTRY[dest]?.name}...`);
  setAria(`ARIA migrates to ${CTRY[dest]?.name} (strategic weight: ${DEST_W[dest]}).`);
  setTimeout(()=>animMove(from, dest, 'mdot-b', ()=>{
    G.b.country=dest; G.b.turnsHere=0;
    if(!G.b.visited.includes(dest)) G.b.visited.push(dest);
    updatePresence();
    const pc=draw('pull'); const eff=pc.effect||0;
    G.b.stab=clamp(G.b.stab+eff,0,10);
    addLog(`ARIA pull: "${pc.title}" (${eff>=0?'+':''}${eff})`,'pull');
    setDesc(`ARIA arrived in ${CTRY[dest]?.name}. Pull: "${pc.title}". Processing settlement...`);
    setAria(`ARIA pull in ${CTRY[dest]?.name}: "${pc.title}" (${eff>=0?'+':''}${eff}). Stability: ${G.b.stab}/10.`);
    // Show ARIA's pull card
    const existing=document.getElementById('cardRow').innerHTML;
    setCards(existing+`<div class="card-wrap" id="a-pull-c"></div>`);
    setTimeout(()=>revealCard('a-pull-c',pc,'pull',"ARIA Pull"),50);
    updateA(); updateDecks();
    setTimeout(settlement, 900);
  }),800);
}

function botPickDest(){
  const opts=Object.keys(CTRY).filter(k=>CTRY[k].type==='dest');
  const ws=opts.map(k=>({k,w:Math.max(1,(DEST_W[k]||5)-(k===G.b.country?5:0)-(k===G.p.country?2:0))}));
  const tot=ws.reduce((s,x)=>s+x.w,0);
  let r=Math.random()*tot;
  for(const {k,w} of ws){ r-=w; if(r<=0) return k; }
  return opts[0];
}

// ── SETTLEMENT CHECK ─────────────────────────────────────────
function settlement(){
  setPhase('settlement');
  if(!G.pMigrating&&!G.pWait) G.p.turnsHere++;
  if(!G.bMigrating&&!G.bWait) G.b.turnsHere++;
  G.pMigrating=false; G.bMigrating=false;

  let pSettled=false, bSettled=false;
  if(G.p.country&&CTRY[G.p.country]?.type==='dest'&&G.p.turnsHere>=2){
    G.p.tokens++; G.p.turnsHere=0; pSettled=true;
    seeConcept('settlement');
    addLog(`Settlement token earned in ${CTRY[G.p.country]?.name}!`,'pull');
    flash('g'); confetti();
  }
  if(G.b.country&&CTRY[G.b.country]?.type==='dest'&&G.b.turnsHere>=2){
    G.b.tokens++; G.b.turnsHere=0; bSettled=true;
    addLog(`ARIA token earned in ${CTRY[G.b.country]?.name}.`,'sys');
  }
  updateP(); updateA(); updatePresence();

  if(G.p.tokens>=3){ endGame('p'); return; }
  if(G.b.tokens>=3){ endGame('b'); return; }
  if(G.turn>=G.maxTurns){ endGame(G.p.tokens>=G.b.tokens?'p':'b'); return; }

  G.turn++;
  if(pSettled){
    setDesc(`Token earned in ${CTRY[G.p.country]?.name}! (${G.p.tokens}/3) Get 2 more tokens to win!`);
    setActions(`<button class="btn btn-primary" onclick="pushPhase()">Start Turn ${G.turn}</button>`);
  } else {
    setDesc(`Turn ${G.turn-1} complete. Ready for next turn?`);
    setActions(`<button class="btn btn-next" onclick="pushPhase()">Start Turn ${G.turn}</button>`);
  }
}

// ── GAME OVER ────────────────────────────────────────────────
function endGame(winner){
  setPhase('end');
  const isW=winner==='p';
  const screen=document.getElementById('overScreen');
  screen.style.display='flex';
  document.getElementById('ovTitle').textContent=isW?'Victory':'Journey\'s End';
  document.getElementById('ovTitle').style.color=isW?'var(--gold2)':'#7ea8e0';
  document.getElementById('ovSub').textContent=isW
    ?`You earned ${G.p.tokens} settlement token${G.p.tokens!==1?'s':''} and found a new home. Your journey through the migration system is complete.`
    :`ARIA settled with ${G.b.tokens} token${G.b.tokens!==1?'s':''} against your ${G.p.tokens}. Migration is never simple — or swift.`;
  if(isW) confetti();

  document.getElementById('ovGrid').innerHTML=`
    <div class="ov-card">
      <div class="ov-ch">Your Statistics</div>
      <div class="ov-stat">
        Countries visited: <strong style="color:var(--gold2)">${G.p.visited.length}</strong><br>
        Settlement tokens: <strong style="color:var(--gold2)">${G.p.tokens}/3</strong><br>
        Stability lost: <strong style="color:#ff9080">${G.p.statsLost||'—'}</strong><br>
        Stability gained: <strong style="color:#6adda0">${G.p.statsGained||'—'}</strong><br>
        Turns played: <strong>${G.turn}</strong><br>
        Route: ${G.p.visited.map(k=>CTRY[k]?.name).join(' → ')}
      </div>
    </div>
    <div class="ov-card">
      <div class="ov-ch">Concepts Encountered</div>
      ${[...G.conceptsSeen].map(k=>{ const c=CONCEPTS[k]; return c?`<div class="concept-entry"><div class="ce-name">${c.name}</div><div class="ce-def">${c.def}</div></div>`:''; }).join('')}
    </div>`;

  const origin=CTRY[G.p.visited[0]];
  const dests=G.p.visited.slice(1).map(k=>CTRY[k]?.name).filter(Boolean);
  const terms=[...G.conceptsSeen].map(k=>CONCEPTS[k]?.name).filter(Boolean);
  document.getElementById('ovSumm').innerHTML=`
    <div class="ov-summ-h">What This Game Demonstrated</div>
    Starting in ${origin?.name||'your origin country'}, you experienced the push-pull model of migration first described by E.G. Ravenstein in 1885 and formalized by Everett Lee in 1966.
    ${dests.length?`Your journey through ${dests.join(', ')} illustrated how intervening obstacles — border walls, visa denials, dangerous seas — shape migration paths.`:''}
    The ${terms.length} geographic concepts you encountered — ${terms.slice(0,4).join(', ')}${terms.length>4?' and more':''} — form the vocabulary of migration geography studied worldwide.`;
}

// ── MISC ─────────────────────────────────────────────────────
function toggleConcepts(){
  const el=document.getElementById('cList');
  const arr=document.getElementById('cArrow');
  if(!el) return;
  const open=el.style.display==='block';
  el.style.display=open?'none':'block';
  if(arr) arr.textContent=open?'+':'−';
}

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener('load', ()=>setTimeout(initMap, 50));
