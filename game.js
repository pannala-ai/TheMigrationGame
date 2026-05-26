// ═══════════════════════════════════════════════════════════
//  Roots & Routes — game.js
//  Real D3 world map + Monopoly-style explicit card drawing
// ═══════════════════════════════════════════════════════════

// ── AP HuG CONCEPTS (Unit 2: Population & Migration) ───────
const CONCEPTS = {
  push:         { name:'Push Factor',             unit:'Unit 2', def:'Conditions forcing emigration — war, poverty, disaster, persecution. Formalized by E.G. Ravenstein (1885) and Everett Lee (1966).' },
  pull:         { name:'Pull Factor',             unit:'Unit 2', def:'Attractive conditions drawing migrants — jobs, safety, family reunification, higher wages, political freedom.' },
  obstacle:     { name:'Intervening Obstacle',    unit:'Unit 2', def:'Physical or political barriers impeding migration: border walls, oceans, visa regimes, detention. From Lee\'s migration model (1966).' },
  chain:        { name:'Chain Migration',         unit:'Unit 2', def:'Later migrants follow pioneer migrants along established routes, using existing diaspora networks and social capital.' },
  forced:       { name:'Forced Migration',        unit:'Unit 2', def:'Involuntary displacement due to conflict, persecution, or disaster. Protected by the 1951 UN Refugee Convention and 1967 Protocol.' },
  settlement:   { name:'Integration & Settlement',unit:'Unit 2', def:'Process of migrants establishing permanent residence and cultural integration in the host society.' },
  remit:        { name:'Remittances',             unit:'Unit 2', def:'Money transferred by migrants to origin families. In 2023, $857 billion was remitted globally — surpassing total foreign aid.' },
  brain:        { name:'Brain Drain',             unit:'Unit 2', def:'Emigration of educated/skilled workers, depleting origin country human capital and slowing economic development.' },
  step:         { name:'Step Migration',          unit:'Unit 2', def:'Moving through progressively larger settlements or regions before reaching final destination (Ravenstein\'s 5th Law).' },
  intervening:  { name:'Intervening Opportunity', unit:'Unit 2', def:'A closer, accessible opportunity that redirects a migrant from their original destination (Samuel Stouffer, 1940).' },
  transnational:{ name:'Transnationalism',        unit:'Unit 3', def:'Migrants maintaining simultaneous social, cultural, and economic ties to both home and host countries.' },
  ravenstein:   { name:'Ravenstein\'s Laws',      unit:'Unit 2', def:'E.G. Ravenstein (1885): migration is mostly rural→urban, moves in stages, mostly short distances, driven by economic motives.' }
};

// ── COUNTRY DATA ────────────────────────────────────────────
const CTRY = {
  mexico:      { name:'Mexico',      code:'MX', type:'origin', lat:23.6,  lon:-102.5, region:'Central America', topoId:484, stat:'4.8M emigrants/year', fact:'Largest source of US immigrants. Economic & gang-violence push.' },
  honduras:    { name:'Honduras',    code:'HN', type:'origin', lat:14.1,  lon:-86.2,  region:'Central America', topoId:340, stat:'1 in 8 born abroad', fact:'Northern Triangle displacement driven by gang violence (MS-13).' },
  syria:       { name:'Syria',       code:'SY', type:'origin', lat:35.0,  lon:38.3,   region:'Middle East',     topoId:760, stat:'6.8M refugees (2024)', fact:'Largest refugee crisis since WWII. Civil war began 2011.' },
  nigeria:     { name:'Nigeria',     code:'NG', type:'origin', lat:9.1,   lon:8.7,    region:'West Africa',     topoId:566, stat:'1.9M in European diaspora', fact:'Brain drain: 75K doctors left since 1990. Boko Haram displacement.' },
  venezuela:   { name:'Venezuela',   code:'VE', type:'origin', lat:7.5,   lon:-66.6,  region:'South America',   topoId:862, stat:'7.7M displaced (2024)', fact:'Largest displacement crisis in Western Hemisphere. Hyperinflation push.' },
  afghanistan: { name:'Afghanistan', code:'AF', type:'origin', lat:33.9,  lon:67.7,   region:'Central Asia',    topoId:4,   stat:'5.7M refugees abroad', fact:'Taliban takeover (2021) triggered mass flight. 3rd largest refugee source.' },
  usa:         { name:'USA',         code:'US', type:'dest',   lat:37.1,  lon:-98.5,  region:'North America',   topoId:840, stat:'50M foreign-born (15%)', fact:'HDI: 0.921. Strong job market, but complex visa system.' },
  canada:      { name:'Canada',      code:'CA', type:'dest',   lat:58.0,  lon:-96.8,  region:'North America',   topoId:124, stat:'21% immigrant population', fact:'HDI: 0.935. Points-based immigration system, world leader in refugees.' },
  germany:     { name:'Germany',     code:'DE', type:'dest',   lat:51.2,  lon:10.5,   region:'Western Europe',  topoId:276, stat:'16M immigrants (19%)', fact:'HDI: 0.942. Took 1M+ Syrian refugees in 2015. Strong asylum system.' },
  sweden:      { name:'Sweden',      code:'SE', type:'dest',   lat:62.0,  lon:15.0,   region:'Northern Europe', topoId:752, stat:'20% foreign-born', fact:'HDI: 0.952. Universal healthcare, generous refugee quota system.' },
  australia:   { name:'Australia',   code:'AU', type:'dest',   lat:-25.0, lon:133.8,  region:'Oceania',         topoId:36,  stat:'30% born abroad', fact:'HDI: 0.946. Skilled migration program. Strict offshore detention policy.' },
  uae:         { name:'UAE',         code:'AE', type:'dest',   lat:23.4,  lon:53.8,   region:'Middle East',     topoId:784, stat:'88% expat workforce', fact:'HDI: 0.890. Economic magnet with no path to citizenship for migrants.' }
};

const FLAG_COLORS = {
  mexico:'#006847', honduras:'#0073CF', syria:'#CE1126',
  nigeria:'#008751', venezuela:'#CF142B', afghanistan:'#009A44'
};
const DEST_W = { canada:10, germany:10, sweden:9, australia:8, usa:7, uae:6 };

// ── ORIGIN ABILITIES ─────────────────────────────────────────
const ORIGIN_BONUS = {
  mexico:      { name:'Family Network', icon:'👨‍👩‍👧', desc:'+1 Stability when arriving at USA or Canada (chain migration).', concept:'chain' },
  honduras:    { name:'Asylum Track',   icon:'🛡️', desc:'Visa denials cost only 1 turn instead of 2 (recognized asylum seeker).', concept:'forced' },
  syria:       { name:'UNHCR Priority', icon:'🌍', desc:'Obstacle "pass" cards grant +1 bonus stability (UN refugee protection).', concept:'forced' },
  nigeria:     { name:'Skills Premium', icon:'🎓', desc:'Pull cards that gain stability give +1 extra (educated migrant — brain drain).', concept:'brain' },
  venezuela:   { name:'Regional Solidarity', icon:'🤝', desc:'Draw 1 extra pull card at each destination, keep the better one.', concept:'chain' },
  afghanistan: { name:'Crisis Recognition', icon:'📋', desc:'Never lose more than 2 stability from a single push card.', concept:'ravenstein' }
};

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
  { icon:'J', title:'Strong Job Market',        effect:3, desc:'Low unemployment. Wages draw migrants from afar. Classic economic pull factor.',        hug:'pull',         redirect:false },
  { icon:'F', title:'Family Already Here',      effect:2, desc:'Relatives provide housing and social networks — the backbone of chain migration.',      hug:'chain',        redirect:false },
  { icon:'H', title:'Free Healthcare',          effect:2, desc:'Universal coverage eases settlement. Countries with public health attract more migrants.',hug:'pull',         redirect:false },
  { icon:'O', title:'Destination Overcrowded',  effect:0, desc:'ARIA occupies this country. No capacity — choose another destination.',                  hug:'intervening',  redirect:true  },
  { icon:'W', title:'High Wages',               effect:3, desc:'Purchasing power far exceeds origin country. The primary pull across all migration eras.', hug:'pull',        redirect:false },
  { icon:'R', title:'Strong Refugee Policy',    effect:2, desc:'Government actively supports newcomers with legal status and integration programs.',      hug:'forced',       redirect:false },
  { icon:'C', title:'Cultural Community',       effect:2, desc:'Established diaspora provides immediate belonging, language support, and job referrals.',  hug:'chain',        redirect:false },
  { icon:'E', title:'Educational Access',       effect:2, desc:'World-class universities open to immigrants. Education as a pull factor (Ravenstein).',  hug:'pull',         redirect:false },
  { icon:'T', title:'Transnational Ties',       effect:2, desc:'You maintain economic and cultural links home. Remittances flow. Dual identity formed.',  hug:'transnational', redirect:false },
  { icon:'I', title:'Intervening Opportunity',  effect:2, desc:'A better option found en route changes your plans. Stouffer\'s Law in action (1940).',   hug:'intervening',  redirect:false },
  { icon:'K', title:'Climate Shock',            effect:0, desc:'Integration is harder than expected. Cultural distance proves a real obstacle.',          hug:'obstacle',     redirect:false },
  { icon:'S', title:'Housing Shortage',         effect:1, desc:'Accommodation scarce but found. Urban pull factors attract more migrants than supply.',   hug:'pull',         redirect:false },
  { icon:'P', title:'Political Stability',      effect:2, desc:'Rule of law and functioning institutions — a profound relief from origin conditions.',    hug:'pull',         redirect:false },
  { icon:'B', title:'Brain Gain',               effect:3, desc:'Your skills are highly valued. Host country gains your human capital — their brain gain.', hug:'brain',        redirect:false }
];

// ── GAME STATE ──────────────────────────────────────────────
let G = {
  turn:1, maxTurns:20, phase:'setup',
  pMigrating:false, bMigrating:false,
  pWait:0, bWait:0,
  conceptsSeen: new Set(),
  pendingObsCard: null,
  p:{ country:null, stab:5, tokens:0, turnsHere:0, visited:[], statsLost:0, statsGained:0, bonus:null, settledIn:[] },
  b:{ country:null, stab:5, tokens:0, turnsHere:0, visited:[], settledIn:[] },
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
  // Crisis mode visual when stability is critical
  const pp=document.getElementById('playerPanel');
  if(p.stab<=2) pp.classList.add('crisis'); else pp.classList.remove('crisis');
  // Progress dots for settlement (need 3 turns at destination)
  const ph=document.getElementById('pTurnsHere');
  if(ph&&CTRY[p.country]?.type==='dest'){
    const dots='●'.repeat(Math.min(p.turnsHere,3))+'○'.repeat(Math.max(0,3-p.turnsHere));
    ph.textContent=p.turnsHere+' '+dots;
  }
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
function setDesc(t,highlight=false){ const el=document.getElementById('phaseDesc'); if(!el) return; el.textContent=t; el.className='phase-desc'+(highlight?' highlight':''); }
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
  // Correctly label special cards
  let typeLabel;
  if(card.redirect) typeLabel='Destination Event';
  else if(deckType==='push') typeLabel='Push Factor';
  else if(deckType==='obs') typeLabel='Obstacle';
  else typeLabel='Pull Factor';

  const eff=card.effect!==undefined?card.effect:(card.sc||0);
  const effHtml=eff!==0?`<div class="c-eff">${eff>0?'+':''}${eff} Stability</div>`:'';
  const concept=CONCEPTS[card.hug];
  const conceptName=concept?.name||'';
  const conceptUnit=concept?.unit||'';
  seeConcept(card.hug);
  return `
    <div class="c-type">${typeLabel}</div>
    <div class="c-icon">${card.icon}</div>
    <div class="c-title">${card.title}</div>
    <div class="c-desc">${card.desc}</div>
    ${effHtml}
    ${conceptName?`<div class="c-concept"><span class="c-unit">${conceptUnit}</span> ${conceptName}</div>`:''}
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
    const ob=ORIGIN_BONUS[k];
    return `<div class="ss-opt" onclick="pickCountry('${k}',this)">
      <div class="ss-flag" style="background:${fc}">${c.code}</div>
      <div class="ss-cname">${c.name}</div>
      <div class="ss-creg">${c.region}</div>
      <div class="ss-stat-line">${c.stat}</div>
      <div class="ss-bonus-lbl">${ob.name}</div>
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
  G.p.country=selCountry; G.p.visited=[selCountry]; G.p.stab=8; G.p.bonus=ORIGIN_BONUS[selCountry];
  G.b.country=botC; G.b.visited=[botC]; G.b.stab=8;
  G.decks.push=shuffle([...PUSH_DECK]);
  G.decks.obs=shuffle([...OBS_DECK]);
  G.decks.pull=shuffle([...PULL_DECK]);
  document.getElementById('startScreen').style.display='none';
  updateP(); updateA(); updatePresence();
  updateDecks();
  const ob=G.p.bonus;
  addLog(`Journey begins from ${CTRY[selCountry].name}.`,'sys');
  addLog(`Origin ability: ${ob.name} — ${ob.desc}`,'pull');
  addLog(`ARIA starts in ${CTRY[botC].name}.`,'sys');
  setAria(`ARIA initialized. Analyzing ${CTRY[botC].name} as origin. 6 destination vectors mapped.`);
  setTimeout(pushPhase, 400);
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
  // Afghanistan bonus: crisis recognition — no single push card can drop you more than 2
  let pEff=pCard.effect;
  if(G.p.visited[0]==='afghanistan'&&pEff<-2){ pEff=-2; addLog(`Crisis Recognition: damage capped at -2.`,'pull'); }
  G.p.stab=clamp(G.p.stab+pEff,0,10);
  if(pEff<0) G.p.statsLost=(G.p.statsLost||0)+Math.abs(pEff);
  G.b.stab=clamp(G.b.stab+bCard.effect,0,10);
  G.pMigrating=pCard.must||G.p.stab<=0;
  G.bMigrating=bCard.must||G.b.stab<=0;
  if(pEff<0) flash('r'); else flash('g');

  // Show both cards with flip animation
  setCards(`
    <div class="card-wrap" id="your-push"></div>
    <div class="card-wrap" id="aria-push"></div>
  `);
  setTimeout(()=>{ revealCard('your-push',pCard,'push','Your Push'); },50);
  setTimeout(()=>{ revealCard('aria-push',bCard,'push',"ARIA's Push"); },250);

  addLog(`Push: "${pCard.title}" (${pEff>=0?'+':''}${pEff} Stability)`,'push');
  addLog(`ARIA push: "${bCard.title}" (${bCard.effect>=0?'+':''}${bCard.effect} Stability)`,'push');
  updateP(); updateA();
  updateDecks();

  const mustNote=G.pMigrating?' You must migrate immediately!':'';
  setDesc(`Your stability: ${G.p.stab}/10.${mustNote} Stay or migrate?`);
  // Dynamic ARIA commentary
  const ariaLines=G.b.tokens>=2?['My third token is within reach. Your chances are diminishing.','Settlement probability: 91%. This is nearly over.']:
    G.b.stab<3?['Stability critical. Recalculating migration vectors.','Crisis protocol. Forced migration sequence initiated.']:
    G.p.tokens>G.b.tokens?['You have an advantage. I am adjusting my strategy.','Unexpected player performance. Recalibrating.']:
    ['Analyzing optimal settlement pathway.','Processing migration patterns.','Calculating route efficiency.'];
  setAria(ariaLines[Math.floor(Math.random()*ariaLines.length)]+` Stability: ${G.b.stab}/10.`);

  setTimeout(decisionPhase, 800);
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
  const atDest=CTRY[G.p.country]?.type==='dest';
  const alreadySettled=atDest&&G.p.settledIn.includes(G.p.country);
  const turnsProgress=atDest&&!alreadySettled?` (${G.p.turnsHere}/3 turns for token)`:'';
  const settledNote=alreadySettled?' Already earned token here — migrate for next one!':'';
  if(alreadySettled){
    setDesc(`Stability: ${G.p.stab}/10. Token already earned in ${CTRY[G.p.country]?.name}. You must migrate to a new destination for the next token!`);
    setActions(`<button class="btn btn-migrate" onclick="goToObstacle()">Migrate to New Country</button>`);
    return;
  }
  setDesc(`Stability: ${G.p.stab}/10.${turnsProgress}${settledNote} Stay or migrate?`);
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

  const origin=G.p.visited[0];
  if(card.pass){
    let bonusSc=card.sc||0;
    // Syria bonus: UN-protected migrants get +1 on all pass cards
    if(origin==='syria'&&bonusSc>=0) bonusSc+=1;
    if(bonusSc){ G.p.stab=clamp(G.p.stab+bonusSc,0,10); updateP(); }
    flash('g');
    setDesc(`"${card.title}" — path is clear! ${card.desc} Choose your destination.`);
    setTimeout(()=>arrivalPhase_P(null), 700);
  } else if(card.eff==='lose_turn'){
    // Honduras/Afghanistan bonus: visa denial costs 1 fewer turn
    let turns=card.val;
    if(origin==='honduras'||origin==='afghanistan') turns=Math.max(1,turns-1);
    G.pWait=turns; G.pMigrating=false;
    flash('r');
    const bonusTxt=(origin==='honduras'||origin==='afghanistan')&&turns<card.val?' (Origin ability reduced wait!)':'';
    setDesc(`"${card.title}" — you lose ${turns} turn(s).${bonusTxt} ${card.desc}`);
    addLog(`Lost ${turns} turn(s).`,'obs');
    setTimeout(()=>{ setActions(`<button class="btn btn-next" onclick="botDecision()">Watch ARIA's Move</button>`); },700);
  } else if(card.eff==='return'){
    G.pMigrating=false; G.p.turnsHere=0;
    flash('r');
    setDesc(`"${card.title}" — returned to ${CTRY[G.p.country]?.name}. ${card.desc}`);
    addLog(`Returned to ${CTRY[G.p.country]?.name}.`,'obs');
    setTimeout(()=>{ setActions(`<button class="btn btn-next" onclick="botDecision()">Watch ARIA's Move</button>`); },700);
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
    // Mexico bonus: +1 stability arriving at North America via chain migration
    const origin=G.p.visited[0];
    if(origin==='mexico'&&(key==='usa'||key==='canada')){
      G.p.stab=clamp(G.p.stab+1,0,10);
      G.p.statsGained=(G.p.statsGained||0)+1;
      addLog(`Family Network bonus: +1 Stability in ${CTRY[key].name}.`,'pull');
    }
    updatePresence();
    pullPhase_P(key);
  });
}

function pullPhase_P(country){
  setPhase('pull');
  setDesc(`You arrived in ${CTRY[country]?.name}! Draw your Pull card to see what opportunity awaits.`,true);
  setActions(`<button class="btn btn-draw-pull" onclick="doPullDraw('${country}')">Draw Pull Card</button>`);
}

function doPullDraw(country){
  setActions('');
  const origin=G.p.visited[0];
  // Venezuela bonus: draw 2 pull cards, keep the better one
  const isVenezuela=origin==='venezuela';
  const card=draw('pull');
  const card2=isVenezuela?draw('pull'):null;
  const chosen=card2&&(card2.effect||0)>(card.effect||0)?card2:card;
  if(card2&&chosen===card2){ G.decks.pull.push(card); } // return worse card
  else if(card2){ G.decks.pull.push(card2); }

  seeConcept(chosen.hug);
  updateDecks();

  const existing=document.getElementById('cardRow').innerHTML;
  setCards(existing+`<div class="card-wrap" id="your-pull"></div>`);
  const pullLbl=isVenezuela?'Pull Factor (Best of 2)':'Pull Factor';
  setTimeout(()=>{ revealCard('your-pull',chosen,'pull',pullLbl); },50);

  if(chosen.redirect && G.b.country===country){
    flash('r');
    addLog(`Overcrowded! ${CTRY[country]?.name} is at capacity. Intervening obstacle forces redirect.`,'obs');
    seeConcept('intervening');
    setDesc(`"${chosen.title}" — destination at capacity. Intervening obstacle — choose another.`);
    setTimeout(()=>arrivalPhase_P(null), 700);
    return;
  }
  let eff=chosen.effect||0;
  // Nigeria bonus: positive pull card effects gain +1
  if(origin==='nigeria'&&eff>0){ eff+=1; addLog(`Skills Premium bonus: +1 extra Stability.`,'pull'); }
  if(eff){ G.p.stab=clamp(G.p.stab+eff,0,10); if(eff>0){G.p.statsGained+=eff; flash('g');} }
  addLog(`Pull in ${CTRY[country]?.name}: "${chosen.title}" (${eff>=0?'+':''}${eff})`,'pull');
  setDesc(`Arrived in ${CTRY[country]?.name}! Pull: "${chosen.title}" (${eff>=0?'+':''}${eff} Stability). Now watch ARIA's move.`);
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
    setAria(`ARIA holds position in ${CTRY[G.b.country]?.name}. Stability: ${G.b.stab}/10. Progress: ${G.b.turnsHere}/3.`);
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
  const pCanSettle=G.p.country&&CTRY[G.p.country]?.type==='dest'&&G.p.turnsHere>=3&&!G.p.settledIn.includes(G.p.country);
  const bCanSettle=G.b.country&&CTRY[G.b.country]?.type==='dest'&&G.b.turnsHere>=3&&!G.b.settledIn.includes(G.b.country);
  if(pCanSettle){
    G.p.tokens++; G.p.turnsHere=0; pSettled=true;
    G.p.settledIn.push(G.p.country);
    G.pMigrating=true; // must move to earn next token at new destination
    seeConcept('settlement');
    addLog(`Settlement token earned in ${CTRY[G.p.country]?.name}! Must migrate next turn. (${G.p.tokens}/3)`,'pull');
    flash('g'); confetti();
  }
  if(bCanSettle){
    G.b.tokens++; G.b.turnsHere=0; bSettled=true;
    G.b.settledIn.push(G.b.country);
    G.bMigrating=true;
    addLog(`ARIA settled in ${CTRY[G.b.country]?.name}! (${G.b.tokens}/3)`,'obs');
  }
  updateP(); updateA(); updatePresence();

  if(G.p.tokens>=3){ endGame('p'); return; }
  if(G.b.tokens>=3){ endGame('b'); return; }
  if(G.turn>=G.maxTurns){ endGame(G.p.tokens>=G.b.tokens?'p':'b'); return; }

  G.turn++;
  const turnsLeft=3-G.p.turnsHere;
  const atDest=G.p.country&&CTRY[G.p.country]?.type==='dest';
  if(pSettled){
    setDesc(`Settlement token earned in ${CTRY[G.p.country]?.name}! (${G.p.tokens}/3) Need ${3-G.p.tokens} more to win.`);
    setActions(`<button class="btn btn-primary" onclick="pushPhase()">Start Turn ${G.turn}</button>`);
  } else if(atDest&&G.p.turnsHere>0){
    setDesc(`Turn ${G.turn-1} complete. ${turnsLeft} more turn${turnsLeft!==1?'s':''} in ${CTRY[G.p.country]?.name} to earn a token.`);
    setActions(`<button class="btn btn-next" onclick="pushPhase()">Start Turn ${G.turn}</button>`);
  } else {
    setDesc(`Turn ${G.turn-1} complete. Reach a destination and stay 3 turns to earn a settlement token.`);
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
