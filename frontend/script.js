
'use strict';
// ══════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════
const PAL=['#5b8dee','#ee5b8d','#2dd4a0','#f0b429','#4eb5f7','#f06e4e','#a856cf','#56cfa8','#cf8a56','#8acf56'];
const ANAMES={fcfs:'FCFS',sjf_np:'SJF',sjf_p:'SRTF',rr:'Round Robin',priority_np:'Priority NP',priority_p:'Priority P'};

const SAMPLES={
  'Default (5 processes)':[
    {id:'1',name:'P1',at:0,bt:8,pr:3,color:PAL[0]},{id:'2',name:'P2',at:1,bt:4,pr:1,color:PAL[1]},
    {id:'3',name:'P3',at:2,bt:9,pr:4,color:PAL[2]},{id:'4',name:'P4',at:3,bt:5,pr:2,color:PAL[3]},
    {id:'5',name:'P5',at:4,bt:2,pr:5,color:PAL[4]}],
  'Starvation Test':[
    {id:'1',name:'P1',at:0,bt:15,pr:5,color:PAL[0]},{id:'2',name:'P2',at:1,bt:3,pr:1,color:PAL[1]},
    {id:'3',name:'P3',at:2,bt:3,pr:1,color:PAL[2]},{id:'4',name:'P4',at:3,bt:3,pr:1,color:PAL[3]},
    {id:'5',name:'P5',at:4,bt:3,pr:1,color:PAL[4]}],
  'CPU Idle Gap':[
    {id:'1',name:'P1',at:0,bt:3,pr:1,color:PAL[0]},{id:'2',name:'P2',at:8,bt:4,pr:2,color:PAL[1]},
    {id:'3',name:'P3',at:15,bt:5,pr:3,color:PAL[2]}]
};

const THEORY={
  fcfs:{name:'First Come First Serve',type:'Non-Preemptive',tc:'O(n log n)',sc:'O(n)',color:'#5b8dee',
    desc:'Simplest scheduling algorithm. Processes execute in arrival order. Once started, runs to completion — no interruption.',
    how:['Sort all processes by arrival time','Pick the first arrived process','Run it to completion (no interruption)','Repeat for remaining processes'],
    pros:['Simple and easy to implement','No starvation — every process eventually runs','Fair in arrival order'],
    cons:['Convoy effect: short processes wait behind long ones','Poor average waiting time','Not suitable for interactive systems'],
    best:'Batch processing with similar-length jobs',worst:'Interactive systems with mixed job lengths',real:'Print queues, simple batch jobs'},
  sjf_np:{name:'Shortest Job First (Non-Preemptive)',type:'Non-Preemptive',tc:'O(n²)',sc:'O(n)',color:'#ee5b8d',
    desc:'Among available processes, the one with shortest burst time is selected. Runs to completion without interruption.',
    how:['At scheduling point, check all arrived processes','Select process with minimum burst time','Run completely without interruption','Re-evaluate when it finishes'],
    pros:['Optimal average waiting time (provably minimum)','Better throughput than FCFS','Reduces convoy effect'],
    cons:['Starvation of long processes','Requires knowing burst time in advance','New short jobs must wait'],
    best:'Batch systems with known burst times',worst:'Interactive systems — long processes starve',real:'Compiler scheduling, database query optimization'},
  sjf_p:{name:'SRTF — Shortest Remaining Time First',type:'Preemptive',tc:'O(n²)',sc:'O(n)',color:'#2dd4a0',
    desc:'Preemptive SJF. When a new process arrives with shorter remaining time than current, CPU is preempted immediately.',
    how:['Every time unit, check all available processes','Select process with minimum remaining burst','If new process is shorter, preempt current','Continue until all processes finish'],
    pros:['Optimal average waiting time among all algorithms','Very responsive to short processes'],
    cons:['Severe starvation for long processes','High context switch overhead','Requires continuous monitoring'],
    best:'Time-sharing systems prioritizing response time',worst:'Long batch jobs — extreme starvation risk',real:'Linux CFS scheduler inspired by this concept'},
  rr:{name:'Round Robin',type:'Preemptive',tc:'O(n)',sc:'O(n)',color:'#f0b429',
    desc:'Each process gets a fixed time quantum in circular order. After quantum expires, process is preempted to end of ready queue.',
    how:['Maintain a circular ready queue','Each process runs for at most 1 quantum','If not finished, goes to end of queue','New arrivals join end of queue'],
    pros:['Fair — equal CPU share for all','Good response time for interactive users','No starvation','Widely used in practice'],
    cons:['Higher average waiting time than SJF','Heavy dependence on quantum size','Too small quantum = too many context switches'],
    best:'Time-sharing and interactive systems (desktop OS)',worst:'Batch systems where turnaround time matters',real:'Windows, Linux, macOS for interactive processes'},
  priority_np:{name:'Priority Scheduling (Non-Preemptive)',type:'Non-Preemptive',tc:'O(n²)',sc:'O(n)',color:'#4eb5f7',
    desc:'Each process has a priority. CPU is given to highest priority (lowest number) available process. Runs to completion.',
    how:['Assign priority to each process','At scheduling point, pick highest priority available','Run to completion without interruption','Ties broken by arrival time'],
    pros:['Important processes get CPU first','Flexible for real-world scenarios','Lower overhead than preemptive'],
    cons:['Starvation of low-priority processes','Priority inversion problems','Priority assignment is subjective'],
    best:'Real-time systems where task importance differs',worst:'Systems with many equal-priority processes',real:'OS kernel tasks, interrupt handling, network QoS'},
  priority_p:{name:'Priority Scheduling (Preemptive)',type:'Preemptive',tc:'O(n²)',sc:'O(n)',color:'#f06e4e',
    desc:'Preemptive priority. If a new higher-priority process arrives, CPU is immediately given to it, preempting the current.',
    how:['At every event, re-evaluate priorities','If new process has higher priority, preempt current','Current process returns to ready queue','Run highest priority at all times'],
    pros:['Critical tasks get CPU immediately','Better response time for high-priority processes'],
    cons:['Worst starvation problem among all algorithms','High context switch overhead','Complex implementation'],
    best:'Hard real-time systems (medical, aerospace)',worst:'General-purpose computing',real:'Windows task priority, Linux nice values, RTOS schedulers'}
};

const QUIZ=[
  // FCFS
  {q:'FCFS algorithm এ processes কোন order এ execute হয়?',opts:['Burst time অনুযায়ী','Arrival time অনুযায়ী','Priority অনুযায়ী','Random order এ'],ans:1,exp:'FCFS — First Come First Serve। যে process আগে আসে সে আগে CPU পায়। Arrival time অনুযায়ী sort করা হয়।',topic:'FCFS'},
  {q:'"Convoy Effect" কোন algorithm এ হয়?',opts:['SJF','Round Robin','FCFS','Priority'],ans:2,exp:'FCFS এ Convoy Effect হয় — একটা বড় process CPU ধরে রাখে, পেছনে অনেক ছোট process অপেক্ষা করে।',topic:'FCFS'},
  {q:'FCFS কোন ধরনের algorithm?',opts:['Preemptive','Non-Preemptive','Both','None'],ans:1,exp:'FCFS Non-Preemptive — একবার process শুরু হলে শেষ না হওয়া পর্যন্ত CPU ছাড়ে না।',topic:'FCFS'},
  // SJF
  {q:'কোন algorithm minimum average waiting time দেয়?',opts:['FCFS','Round Robin','SJF','Priority'],ans:2,exp:'SJF mathematically proven optimal for minimum average waiting time — সবসময় shortest burst টা আগে চালায়।',topic:'SJF'},
  {q:'SJF এর সবচেয়ে বড় practical সমস্যা কী?',opts:['Convoy effect','Burst time জানা যায় না','Starvation','Context switch বেশি'],ans:1,exp:'Real OS এ burst time আগে জানা সম্ভব না — তাই SJF purely theoretical। Prediction দিয়ে approximate করা হয়।',topic:'SJF'},
  {q:'SJF Non-Preemptive এ নতুন shorter process আসলে কী হয়?',opts:['Current process preempt হয়','Current process শেষ হওয়া পর্যন্ত চলে','New process immediately চলে','Error হয়'],ans:1,exp:'Non-Preemptive — current process শেষ না হওয়া পর্যন্ত চলবে। নতুন shorter process পরে chance পাবে।',topic:'SJF'},
  // SRTF
  {q:'SRTF কোন algorithm এর preemptive version?',opts:['FCFS','Priority','SJF','Round Robin'],ans:2,exp:'SRTF = Shortest Remaining Time First = Preemptive SJF। নতুন process এর remaining time কম হলে current process preempt হয়।',topic:'SRTF'},
  {q:'SRTF এ কোন algorithm সবচেয়ে বেশি context switch করে?',opts:['FCFS','SJF NP','Round Robin','SRTF'],ans:3,exp:'SRTF প্রতি time unit এ check করে নতুন process shorter কিনা — তাই সবচেয়ে বেশি context switch হয়।',topic:'SRTF'},
  // Round Robin
  {q:'Round Robin এ quantum অনেক বড় হলে কোন algorithm এর মতো হয়?',opts:['SJF','Priority','SRTF','FCFS'],ans:3,exp:'Quantum > সব burst time হলে প্রতিটা process একবারেই শেষ হয় — exactly FCFS এর মতো।',topic:'Round Robin'},
  {q:'Round Robin এ quantum অনেক ছোট হলে কী সমস্যা হয়?',opts:['Starvation','বেশি context switch overhead','Convoy effect','Deadlock'],ans:1,exp:'Quantum ছোট = বারবার switching = বেশি context switch overhead। CPU বেশিরভাগ সময় switching এ নষ্ট হয়।',topic:'Round Robin'},
  {q:'Interactive OS (Windows, Linux) সাধারণত কোন algorithm use করে?',opts:['FCFS','SJF','Round Robin with Multilevel Queue','Priority NP'],ans:2,exp:'Modern OS Round Robin + Multilevel Feedback Queue use করে — fairness এবং good response time এর জন্য।',topic:'Round Robin'},
  // Priority
  {q:'Priority Scheduling এ lower number মানে কী?',opts:['Lower priority','Higher priority','Same priority','Error'],ans:1,exp:'Convention অনুযায়ী lower number = higher priority। Priority 1 সবার আগে, Priority 5 সবার পরে।',topic:'Priority'},
  {q:'Starvation কী?',opts:['CPU crash','একটা process কখনো CPU পায় না','Memory overflow','Deadlock'],ans:1,exp:'Starvation — low priority বা long process indefinitely wait করে কারণ বারবার higher priority process আসতে থাকে।',topic:'Priority'},
  {q:'Aging technique কী করে?',opts:['Process delete করে','Waiting process এর priority বাড়ায়','CPU speed বাড়ায়','Memory free করে'],ans:1,exp:'Aging — যত বেশি সময় অপেক্ষা করবে priority তত বাড়বে। এতে starvation prevent হয়।',topic:'Priority'},
  // Metrics
  {q:'Turnaround Time = ?',opts:['Finish − Burst','Finish − Arrival','Start − Arrival','Burst + Priority'],ans:1,exp:'TAT = Finish Time − Arrival Time। Process submit থেকে complete হওয়া পর্যন্ত মোট সময়।',topic:'Metrics'},
  {q:'Waiting Time = ?',opts:['TAT − Burst','Finish − Start','Arrival − Start','Burst − TAT'],ans:0,exp:'Waiting Time = Turnaround Time − Burst Time। Process ready queue তে কতক্ষণ অপেক্ষা করেছে।',topic:'Metrics'},
  {q:'Response Time = ?',opts:['Finish − Arrival','First CPU Start − Arrival','TAT − Burst','Burst − Waiting'],ans:1,exp:'Response Time = First CPU allocation − Arrival Time। প্রথমবার CPU পেতে কতক্ষণ লাগল।',topic:'Metrics'},
  {q:'CPU Utilization = ?',opts:['Processes / Time','(Total Burst / Completion) × 100%','Waiting / TAT','Burst / Arrival'],ans:1,exp:'CPU Utilization = (Total CPU Busy Time / Total Completion Time) × 100%। বেশি হলে ভালো।',topic:'Metrics'},
  {q:'Context Switch এ কী হয়?',opts:['Process delete হয়','CPU registers save/restore হয়','Memory clear হয়','New process create হয়'],ans:1,exp:'Context Switch এ OS current process এর CPU state save করে এবং নতুন process এর state restore করে। এই সময় কোনো useful কাজ হয় না।',topic:'Context Switch'},
  {q:'Throughput মানে কী?',opts:['CPU speed','প্রতি unit time এ complete process সংখ্যা','Total waiting time','Average burst time'],ans:1,exp:'Throughput = Number of processes completed / Total time। বেশি throughput = ভালো scheduler।',topic:'Metrics'},
];

// Quiz state - 5 random questions per attempt
let quizPool = [];
function getQuizPool(){
  const shuffled = [...QUIZ].sort(()=>Math.random()-.5);
  return shuffled.slice(0,5);
}


// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let selAlgo='fcfs';
let procs=SAMPLES['Default (5 processes)'].map(p=>({...p}));
let pidCtr=6;
let lastRes=null;
let lastTL=[];
let history=[];
let animIdx=0;
let animPlaying=false;
let animTimer=null;
let quizIdx=0;
let quizSel=null;
let quizAnswered=false;
let quizScore=0;
let quizDone=false;
let activeQuiz=[];
let explainStep=0;

// ══════════════════════════════════════════════
//  THEME
// ══════════════════════════════════════════════
function toggleTheme(){
  const d=document.documentElement;
  const dark=d.getAttribute('data-theme')==='dark';
  d.setAttribute('data-theme',dark?'light':'dark');
  document.getElementById('themeBtn').textContent=dark?'🌞':'🌙';
}

// ══════════════════════════════════════════════
//  DROPDOWNS
// ══════════════════════════════════════════════
// Store original parents for dropdowns
const ddOrigins={};
function initDDOrigins(){
  document.querySelectorAll('.dd-menu').forEach(m=>{
    ddOrigins[m.id]=m.parentElement;
  });
}

function toggleDD(id){
  const el=document.getElementById(id);
  if(!el)return;
  const isHidden=el.classList.contains('hidden');

  // Close all dropdowns first — return them to original parents
  document.querySelectorAll('.dd-menu').forEach(m=>{
    m.classList.add('hidden');
    if(m.parentElement===document.body && ddOrigins[m.id]){
      ddOrigins[m.id].appendChild(m);
    }
  });

  if(!isHidden) return; // was open → now closed, done

  // Find trigger button from stored origin
  const origin=ddOrigins[id];
  const btn=origin?origin.querySelector('button'):null;
  if(!btn)return;

  const rect=btn.getBoundingClientRect();
  // Move to body to escape all stacking contexts
  document.body.appendChild(el);
  el.style.position='fixed';
  el.style.top=(rect.bottom+4)+'px';
  el.style.left=rect.left+'px';
  el.style.zIndex='999999';
  el.style.minWidth=Math.max(220,rect.width)+'px';
  el.classList.remove('hidden');

  // Adjust if off-screen
  setTimeout(()=>{
    const er=el.getBoundingClientRect();
    if(er.right>window.innerWidth) el.style.left=(window.innerWidth-er.width-8)+'px';
    if(er.bottom>window.innerHeight) el.style.top=(rect.top-er.height-4)+'px';
  },0);
}
function closeAllDD(){
  document.querySelectorAll('.dd-menu').forEach(m=>{
    m.classList.add('hidden');
    if(m.parentElement===document.body && ddOrigins[m.id]){
      ddOrigins[m.id].appendChild(m);
    }
  });
}
function setupClickClose(){
  document.addEventListener('click',e=>{
    if(e.target&&!e.target.closest('.dd-wrap')&&!e.target.closest('.dd-menu')){
      closeAllDD();
    }
  });
  window.addEventListener('scroll',closeAllDD,{passive:true});
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', setupClickClose);
} else {
  setupClickClose();
}

function initDropdowns(){
  // Sample
  const sm=document.getElementById('sampleDD');
  sm.innerHTML=Object.entries(SAMPLES).map(([n,d])=>
    `<button class="dd-item" onclick="loadSample('${n}')">${n}<span class="dd-sub">${d.length} processes</span></button>`).join('');
  // Random
  const rm=document.getElementById('randomDD');
  rm.innerHTML=[['Random Mix','random','Mixed random processes'],['Short Bursts','interactive','Fast processes'],['Long Bursts','burst_heavy','Heavy CPU processes'],['Mixed','mixed','Short + Long mix']]
    .map(([l,m,d])=>`<button class="dd-item" onclick="loadRandom('${m}')">${l}<span class="dd-sub">${d}</span></button>`).join('');
}

function loadSample(name){
  procs=SAMPLES[name].map(p=>({...p}));
  pidCtr=procs.length+1;
  renderTable();
  document.getElementById('sampleDD').classList.add('hidden');
}

function loadRandom(mode){
  const n=Math.floor(Math.random()*3)+4;
  procs=[];
  for(let i=0;i<n;i++){
    let at,bt,pr;
    if(mode==='random'){at=Math.floor(Math.random()*10);bt=Math.floor(Math.random()*12)+1;pr=Math.floor(Math.random()*5)+1;}
    else if(mode==='interactive'){at=i*(Math.floor(Math.random()*3)+1);bt=Math.floor(Math.random()*4)+1;pr=Math.floor(Math.random()*3)+1;}
    else if(mode==='burst_heavy'){at=Math.floor(Math.random()*5);bt=Math.floor(Math.random()*18)+5;pr=Math.floor(Math.random()*5)+1;}
    else if(mode==='mixed'){at=Math.floor(Math.random()*8);bt=i%2===0?Math.floor(Math.random()*3)+1:Math.floor(Math.random()*12)+6;pr=Math.floor(Math.random()*5)+1;}
    else{at=i===0?0:Math.floor(Math.random()*3)+1;bt=i===0?Math.floor(Math.random()*8)+10:Math.floor(Math.random()*3)+1;pr=i===0?5:1;}
    procs.push({id:String(i+1),name:`P${i+1}`,at,bt,pr,color:PAL[i%PAL.length]});
  }
  pidCtr=procs.length+1;
  renderTable();
  document.getElementById('randomDD').classList.add('hidden');
}

// ══════════════════════════════════════════════
//  ALGORITHM SELECT
// ══════════════════════════════════════════════
function selectAlgo(algo,btn){
  selAlgo=algo;
  document.querySelectorAll('.algo-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('quantumBox').classList.toggle('hidden',algo!=='rr');
  const showPr=algo.startsWith('priority');
  document.getElementById('agingBox').classList.toggle('hidden',!showPr);
  document.getElementById('prOrderBox').classList.toggle('hidden',!showPr);
  document.getElementById('prHead').classList.toggle('hidden',!showPr);
  document.querySelectorAll('.pr-cell').forEach(c=>c.classList.toggle('hidden',!showPr));
  // Auto-update theory if theory tab is active
  const theoryTab=document.getElementById('tab-theory');
  if(theoryTab&&theoryTab.classList.contains('active')) renderTheory();
  showToast(`⚙ ${ANAMES[algo]} selected`,'info',1500);
}

// ══════════════════════════════════════════════
//  PROCESS CRUD
// ══════════════════════════════════════════════
function addProc(){
  const id=String(pidCtr++);
  procs.push({id,name:`P${id}`,at:0,bt:4,pr:1,color:PAL[(parseInt(id)-1)%PAL.length]});
  renderTable();
}
function removeProc(id){procs=procs.filter(p=>p.id!==id);renderTable();}
function updateProc(id,field,val){const p=procs.find(p=>p.id===id);if(p)p[field]=val;}
function updateColor(id,color){
  const p=procs.find(p=>p.id===id);if(p)p.color=color;
  const b=document.getElementById(`badge-${id}`);
  if(b){b.style.background=color+'22';b.style.color=color;b.style.border=`1px solid ${color}44`;}
}

function renderTable(){
  const showPr=selAlgo.startsWith('priority');
  document.getElementById('prHead').classList.toggle('hidden',!showPr);
  document.getElementById('procBody').innerHTML=procs.map(p=>`
    <tr>
      <td><input type="color" value="${p.color}" onchange="updateColor('${p.id}',this.value)"></td>
      <td><input type="text" value="${p.name}" maxlength="6"
        style="width:56px;text-align:center;background:${p.color}22;color:${p.color};border:1px solid ${p.color}44;border-radius:8px;font-weight:700"
        onchange="updateProc('${p.id}','name',this.value);renderTable()"
        onclick="this.select()"></td>
      <td><input type="number" value="${p.at}" min="0" max="999" onchange="updateProc('${p.id}','at',+this.value)"></td>
      <td><input type="number" value="${p.bt}" min="1" max="999" onchange="updateProc('${p.id}','bt',+this.value)"></td>
      <td class="pr-cell ${showPr?'':'hidden'}"><input type="number" value="${p.pr}" min="1" max="99" onchange="updateProc('${p.id}','pr',+this.value)" style="width:55px"></td>
      <td><button class="del-btn" onclick="removeProc('${p.id}')">✕</button></td>
    </tr>`).join('');
}

// ══════════════════════════════════════════════
//  ALGORITHMS (all run client-side)
// ══════════════════════════════════════════════
function finalize(ps,res,tl,csTime=0){
  // Round all timeline values to avoid floating point issues
  tl=tl.map(s=>({...s,start:Math.round(s.start*1000)/1000,end:Math.round(s.end*1000)/1000}));
  let csCount=0;
  for(let i=1;i<tl.length;i++){
    const a=tl[i-1].pid,b=tl[i].pid;
    if(a!=='idle'&&b!=='idle'&&a!==b&&b!=='cs')csCount++;
  }
  if(csTime>0){
    const ntl=[];let off=0;
    for(let i=0;i<tl.length;i++){
      const seg={...tl[i]};seg.start+=off;seg.end+=off;
      if(i>0){
        const prev=ntl[ntl.length-1];
        if(prev.pid!=='idle'&&seg.pid!=='idle'&&prev.pid!==seg.pid&&seg.pid!=='cs'){
          const cs={pid:'cs',name:'CS',start:prev.end,end:prev.end+csTime,color:'#1a1a3a'};
          seg.start+=csTime;seg.end+=csTime;off+=csTime;ntl.push(cs);
        }
      }
      ntl.push(seg);
    }
    tl=ntl;
    const fm={};tl.forEach(s=>{if(s.pid!=='idle'&&s.pid!=='cs')fm[s.pid]=Math.max(fm[s.pid]||0,s.end);});
    Object.entries(fm).forEach(([pid,ft])=>{if(res[pid])res[pid].finish=ft;});
  }
  ps.forEach(p=>{const r=res[p.id];if(r){r.tat=r.finish-p.at;r.wt=Math.max(0,r.tat-p.bt);}});
  const vals=Object.values(res);
  const maxF=Math.max(...vals.map(r=>r.finish));
  const totB=ps.reduce((s,p)=>s+p.bt,0);
  const n=vals.length;
  return{results:vals,timeline:tl,stats:{
    avgWT:(vals.reduce((s,r)=>s+r.wt,0)/n).toFixed(2),
    avgTAT:(vals.reduce((s,r)=>s+r.tat,0)/n).toFixed(2),
    avgRT:(vals.reduce((s,r)=>s+r.response,0)/n).toFixed(2),
    cpuUtil:((totB/maxF)*100).toFixed(1),
    throughput:(n/maxF).toFixed(4),
    completion:maxF,n,csCount,csOverhead:csCount*csTime
  }};
}
function merge(tl){const m=[];tl.forEach(s=>{const l=m[m.length-1];if(l&&l.pid===s.pid&&l.end===s.start)l.end=s.end;else m.push({...s});});return m;}

function runFCFS(ps,cs=0){
  const sorted=[...ps].sort((a,b)=>a.at-b.at||+a.id-+b.id);
  let t=0;const tl=[],res={};
  sorted.forEach(p=>{
    if(t<p.at){tl.push({pid:'idle',name:'Idle',start:t,end:p.at});t=p.at;}
    res[p.id]={id:p.id,name:p.name,color:p.color,at:p.at,bt:p.bt,pr:p.pr,finish:t+p.bt,response:t-p.at};
    tl.push({pid:p.id,name:p.name,color:p.color,start:t,end:t+p.bt});t+=p.bt;
  });
  return finalize(ps,res,tl,cs);
}
function runSJF(ps,cs=0){
  let t=0;const done=new Set(),tl=[],res={};
  while(done.size<ps.length){
    const av=ps.filter(p=>!done.has(p.id)&&p.at<=t);
    if(!av.length){const nx=ps.filter(p=>!done.has(p.id)).sort((a,b)=>a.at-b.at)[0];tl.push({pid:'idle',name:'Idle',start:t,end:nx.at});t=nx.at;continue;}
    const p=av.sort((a,b)=>a.bt-b.bt||a.at-b.at)[0];
    res[p.id]={id:p.id,name:p.name,color:p.color,at:p.at,bt:p.bt,pr:p.pr,finish:t+p.bt,response:t-p.at};
    tl.push({pid:p.id,name:p.name,color:p.color,start:t,end:t+p.bt});t+=p.bt;done.add(p.id);
  }
  return finalize(ps,res,tl,cs);
}
function runSRTF(ps,cs=0){
  const rem={};ps.forEach(p=>rem[p.id]=p.bt);
  const started={},finished={},tl=[];
  const maxT=Math.max(...ps.map(p=>p.at))+ps.reduce((s,p)=>s+p.bt,0)+1;
  let prev=null,segS=0;
  for(let t=0;t<=maxT;t++){
    if(Object.keys(finished).length===ps.length)break;
    const av=ps.filter(p=>p.at<=t&&!finished[p.id]&&rem[p.id]>0);
    if(!av.length){if(prev){tl.push({pid:prev.id,name:prev.name,color:prev.color,start:segS,end:t});prev=null;}continue;}
    const p=av.sort((a,b)=>rem[a.id]-rem[b.id]||a.at-b.at)[0];
    if(started[p.id]===undefined)started[p.id]=t;
    if(!prev||prev.id!==p.id){if(prev)tl.push({pid:prev.id,name:prev.name,color:prev.color,start:segS,end:t});segS=t;prev=p;}
    rem[p.id]--;
    if(rem[p.id]===0){finished[p.id]=t+1;tl.push({pid:p.id,name:p.name,color:p.color,start:segS,end:t+1});prev=null;segS=t+1;}
  }
  const res={};ps.forEach(p=>{res[p.id]={id:p.id,name:p.name,color:p.color,at:p.at,bt:p.bt,pr:p.pr,
    finish:Math.round(finished[p.id]),response:Math.round(started[p.id])-p.at};});
  return finalize(ps,res,merge(tl),cs);
}
function runRR(ps,q=3,cs=0){
  let t=0;const rem={};ps.forEach(p=>rem[p.id]=p.bt);
  const queue=[],inQ=new Set(),started={},finished={},tl=[];
  const sorted=[...ps].sort((a,b)=>a.at-b.at);let ptr=0;
  while(ptr<sorted.length&&sorted[ptr].at<=t){queue.push(sorted[ptr]);inQ.add(sorted[ptr].id);ptr++;}
  let iter=0;
  while(Object.keys(finished).length<ps.length&&iter++<99999){
    if(!queue.length){if(ptr<sorted.length){const nx=sorted[ptr];tl.push({pid:'idle',name:'Idle',start:t,end:nx.at});t=nx.at;while(ptr<sorted.length&&sorted[ptr].at<=t){queue.push(sorted[ptr]);inQ.add(sorted[ptr].id);ptr++;}}continue;}
    const p=queue.shift();
    if(started[p.id]===undefined)started[p.id]=t;
    const ex=Math.min(q,rem[p.id]);
    tl.push({pid:p.id,name:p.name,color:p.color,start:t,end:t+ex});
    rem[p.id]-=ex;t+=ex;
    while(ptr<sorted.length&&sorted[ptr].at<=t){queue.push(sorted[ptr]);inQ.add(sorted[ptr].id);ptr++;}
    if(rem[p.id]>0)queue.push(p);else finished[p.id]=t;
  }
  const res={};ps.forEach(p=>{res[p.id]={id:p.id,name:p.name,color:p.color,at:p.at,bt:p.bt,pr:p.pr,finish:finished[p.id]||t,response:(started[p.id]||0)-p.at};});
  return finalize(ps,res,tl,cs);
}
function updatePrHint(){
  const order=document.getElementById('prOrder')?.value||'lower_higher';
  const hint=document.getElementById('prOrderHint');
  if(hint) hint.textContent=order==='lower_higher'?'(low=high)':'(high=high)';
}

function getEffectivePr(p){
  const order=document.getElementById('prOrder')?.value||'lower_higher';
  return order==='lower_higher' ? p.pr : (100 - p.pr);
}

function runPriorityNP(ps,aging=false,ar=1,cs=0){
  let t=0;const dynPr={};ps.forEach(p=>dynPr[p.id]=getEffectivePr(p));
  const done=new Set(),tl=[],res={},boosts={};
  while(done.size<ps.length){
    const av=ps.filter(p=>!done.has(p.id)&&p.at<=t);
    if(!av.length){const nx=ps.filter(p=>!done.has(p.id)).sort((a,b)=>a.at-b.at)[0];tl.push({pid:'idle',name:'Idle',start:t,end:nx.at});t=nx.at;continue;}
    const p=av.sort((a,b)=>dynPr[a.id]-dynPr[b.id]||a.at-b.at)[0];
    if(aging)av.filter(x=>x.id!==p.id).forEach(x=>{if(dynPr[x.id]>1){dynPr[x.id]--;boosts[x.id]=(boosts[x.id]||0)+1;}});
    res[p.id]={id:p.id,name:p.name,color:p.color,at:p.at,bt:p.bt,pr:p.pr,finish:t+p.bt,response:t-p.at,boosts:boosts[p.id]||0};
    tl.push({pid:p.id,name:p.name,color:p.color,start:t,end:t+p.bt});t+=p.bt;done.add(p.id);
  }
  return finalize(ps,res,tl,cs);
}
function runPriorityP(ps,aging=false,ar=1,cs=0){
  const rem={};ps.forEach(p=>rem[p.id]=p.bt);
  const dynPr={};ps.forEach(p=>dynPr[p.id]=getEffectivePr(p));
  const started={},finished={},tl=[],boosts={};
  const maxT=Math.max(...ps.map(p=>p.at))+ps.reduce((s,p)=>s+p.bt,0)+1;
  let prev=null,segS=0;
  for(let t=0;t<=maxT;t++){
    if(Object.keys(finished).length===ps.length)break;
    if(aging&&t>0&&t%Math.max(1,ar)===0)ps.forEach(p=>{if(!finished[p.id]&&p.at<=t&&rem[p.id]>0&&dynPr[p.id]>1){dynPr[p.id]--;boosts[p.id]=(boosts[p.id]||0)+1;}});
    const av=ps.filter(p=>p.at<=t&&!finished[p.id]&&rem[p.id]>0);
    if(!av.length){if(prev){tl.push({pid:prev.id,name:prev.name,color:prev.color,start:segS,end:t});prev=null;}continue;}
    const p=av.sort((a,b)=>dynPr[a.id]-dynPr[b.id]||a.at-b.at)[0];
    if(started[p.id]===undefined)started[p.id]=t;
    if(!prev||prev.id!==p.id){if(prev)tl.push({pid:prev.id,name:prev.name,color:prev.color,start:segS,end:t});segS=t;prev=p;}
    rem[p.id]--;
    if(rem[p.id]===0){finished[p.id]=t+1;tl.push({pid:p.id,name:p.name,color:p.color,start:segS,end:t+1});prev=null;segS=t+1;}
  }
  const res={};ps.forEach(p=>{res[p.id]={id:p.id,name:p.name,color:p.color,at:p.at,bt:p.bt,pr:p.pr,
    finish:Math.round(finished[p.id]||0),response:Math.round(started[p.id]||0)-p.at,boosts:boosts[p.id]||0};});
  return finalize(ps,res,merge(tl),cs);
}

function runAlgo(ps,algo){
  const q=+document.getElementById('quantum').value||3;
  const aging=document.getElementById('agingOn').checked;
  const ar=+document.getElementById('agingRate').value||1;
  const cs=+document.getElementById('csTime').value||0;
  switch(algo){
    case 'fcfs':return runFCFS(ps,cs);
    case 'sjf_np':return runSJF(ps,cs);
    case 'sjf_p':return runSRTF(ps,cs);
    case 'rr':return runRR(ps,q,cs);
    case 'priority_np':return runPriorityNP(ps,aging,ar,cs);
    case 'priority_p':return runPriorityP(ps,aging,ar,cs);
  }
}

// ══════════════════════════════════════════════
//  SIMULATE
// ══════════════════════════════════════════════
function simulate(){
  if(!procs.length){showToast('⚠️ Add at least one process!','warn');return;}
  // Validate inputs
  for(const p of procs){
    if(!p.bt||p.bt<=0){showToast(`⚠️ ${p.name}: Burst time must be > 0`,'warn');return;}
    if(p.at<0){showToast(`⚠️ ${p.name}: Arrival time must be ≥ 0`,'warn');return;}
    if(p.pr<1){showToast(`⚠️ ${p.name}: Priority must be ≥ 1`,'warn');return;}
  }
  const {results,timeline,stats}=runAlgo(procs,selAlgo);
  lastRes={results,timeline,stats};lastTL=timeline;
  document.getElementById('resultsSection').classList.remove('hidden');
  document.getElementById('resultsSection').scrollIntoView({behavior:'smooth'});
  const eb=document.getElementById('csvBtn'),pb=document.getElementById('pdfBtn');
  eb.style.opacity='1';eb.style.cursor='pointer';pb.style.opacity='1';pb.style.cursor='pointer';
  showToast(`✅ ${ANAMES[selAlgo]} simulation complete!`,'success');
  renderStats(stats);
  initTabs(results,timeline,stats);
  addHistory(stats);
}

function compareAll(){
  if(!procs.length){alert('Add processes first!');return;}
  if(!lastRes)simulate();
  switchTabByName('compare');
  renderCompare();
}

// ══════════════════════════════════════════════
//  STATS
// ══════════════════════════════════════════════
function animateCount(el, target, suffix='', duration=600){
  const isFloat = String(target).includes('.');
  const num = parseFloat(target);
  const start = performance.now();
  function step(now){
    const p = Math.min((now-start)/duration, 1);
    const ease = 1 - Math.pow(1-p, 3);
    const val = num * ease;
    el.textContent = (isFloat ? val.toFixed(2) : Math.round(val)) + suffix;
    if(p < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

function renderStats(stats){
  const cs=+document.getElementById('csTime').value||0;
  let csHtml='';
  if(stats.csCount>0)csHtml=`<div class="cs-info-bar"><span>⚙ Switches: <b>${stats.csCount}</b></span><span>Overhead: <b>${stats.csOverhead}u</b></span><span>Per switch: <b>${cs}u</b></span></div>`;
  const items=[
    [stats.avgWT,'Avg Waiting','','#ee5b8d'],
    [stats.avgTAT,'Avg Turnaround','','#a07af0'],
    [stats.avgRT,'Avg Response','','#5b8dee'],
    [stats.cpuUtil,'CPU Utilization','%','#2dd4a0'],
    [stats.throughput,'Throughput','','#f0b429'],
    [stats.completion,'Completion','u','#f06e4e']
  ];
  document.getElementById('statsGrid').innerHTML=csHtml+items.map(([v,l,sfx,c])=>
    `<div class="stat-c"><div class="stat-v" style="background:linear-gradient(135deg,${c},${c}88);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text" data-val="${v}" data-sfx="${sfx}">0${sfx}</div><div class="stat-l">${l}</div></div>`
  ).join('');
  // animate counters
  document.querySelectorAll('.stat-v[data-val]').forEach(el=>{
    animateCount(el, el.dataset.val, el.dataset.sfx||'');
  });
}

// ══════════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════════
const TABS=[
  {id:'gantt',label:'Gantt'},{id:'animation',label:'⏯ Anim'},{id:'states',label:'States'},
  {id:'table',label:'Results'},{id:'graph',label:'Graph'},{id:'theory',label:'📖 Theory'},
  {id:'compare',label:'⚖ Compare'},{id:'quiz',label:'🧠 Quiz'},{id:'history',label:'📋 History'}
];

function initTabs(results,timeline,stats){
  document.getElementById('tabsRow').innerHTML=TABS.map(t=>
    `<button class="tab-btn ${t.id==='gantt'?'active':''}" data-tab="${t.id}" onclick="switchTab('${t.id}',this)">${t.label}</button>`).join('');
  document.getElementById('tabContent').innerHTML=TABS.map(t=>
    `<div class="tab-panel ${t.id==='gantt'?'active':''}" id="tab-${t.id}"></div>`).join('');
  renderGantt(timeline,'tab-gantt');
  initAnimation(timeline,results);
  renderStates(results,timeline);
  renderResultTable(results,stats);
  renderGraph(results);
  renderTheory();
  renderCompareEmpty();
  renderQuiz();
  renderHistory();
}

function switchTab(name,btn){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`tab-${name}`).classList.add('active');
  if(name==='quiz') renderQuiz();
  if(name==='compare') renderCompare();
  if(name==='theory') renderTheory();
}

function switchTabByName(name){
  const btn=document.querySelector(`[data-tab="${name}"]`);
  if(btn){btn.click();}
}

// ══════════════════════════════════════════════
//  GANTT
// ══════════════════════════════════════════════
function buildGantt(tl,hlIdx=-1){
  const seen=new Set();const legendItems=[];
  const UNIT=36; // px per time unit

  // Build blocks row
  const blocks=tl.map((seg,i)=>{
    const dur=Math.round((seg.end-seg.start)*100)/100;
    const w=Math.max(44,Math.round(dur*UNIT));
    const isIdle=seg.pid==='idle',isCS=seg.pid==='cs',isHL=i===hlIdx;
    if(!isIdle&&!isCS&&!seen.has(seg.pid)){
      seen.add(seg.pid);
      legendItems.push(`<div class="g-li"><span class="g-dot" style="background:${seg.color}"></span>${seg.name}</div>`);
    }
    const bg=isCS?'#1a1a3a':(isIdle?'var(--s2)':`linear-gradient(135deg,${seg.color}cc,${seg.color}88)`);
    return `<div class="gblock${isIdle?' idle':''}${isCS?' cs-blk':''}${isHL?' hl':''}"
      style="width:${w}px;flex-shrink:0;background:${bg};border-radius:8px 8px 0 0;animation-delay:${i*0.06}s;${!isIdle&&!isCS?`box-shadow:0 2px 14px ${seg.color}44`:''}"
      title="${isIdle?'IDLE':(isCS?'Context Switch':seg.name)}: ${seg.start}→${seg.end}">
      <span style="font-size:${isCS?'.52rem':'.68rem'};font-weight:700">${isIdle?'idle':(isCS?'CS':seg.name)}</span>
      ${!isIdle&&!isCS?`<span style="font-size:.54rem;opacity:.75">${dur}u</span>`:''}
    </div>`;
  }).join('');

  // Build number line — one number at each block boundary (left edge)
  // each number sits at the LEFT edge of its block
  const numLine=tl.map((seg,i)=>{
    const dur=Math.round((seg.end-seg.start)*100)/100;
    const w=Math.max(44,Math.round(dur*UNIT));
    const isLast=i===tl.length-1;
    return `<div style="width:${w}px;flex-shrink:0;position:relative;height:22px">
      <span style="position:absolute;left:0;transform:translateX(-50%);font-size:.6rem;color:var(--dim);white-space:nowrap">${seg.start}</span>
      ${isLast?`<span style="position:absolute;right:0;transform:translateX(50%);font-size:.6rem;color:var(--dim);white-space:nowrap">${seg.end}</span>`:''}
    </div>`;
  }).join('');

  if(tl.some(s=>s.pid==='cs'))legendItems.push(`<div class="g-li"><span class="g-dot" style="background:#1a1a3a;border:1px dashed #333366"></span>CS</div>`);

  return `<div class="gantt-scroll">
    <div style="display:flex;gap:2px;align-items:stretch">${blocks}</div>
    <div style="display:flex;gap:2px;margin-top:4px">${numLine}</div>
  </div>
  <div class="g-legend" style="margin-top:.8rem">${legendItems.join('')}</div>`;
}

function renderGantt(tl,id){document.getElementById(id).innerHTML=buildGantt(tl);}

// ══════════════════════════════════════════════
//  ANIMATION
// ══════════════════════════════════════════════
function initAnimation(tl,results){
  animGanttBuilt=false;
  const cont=document.getElementById('tab-animation');
  cont.innerHTML=`
    <!-- Top bar: controls + progress -->
    <div style="background:var(--s2);border:1px solid var(--bd);border-radius:16px;padding:1rem 1.2rem;margin-bottom:1.2rem">
      
      <!-- Progress bar -->
      <div style="height:3px;background:var(--bd);border-radius:2px;margin-bottom:.9rem;overflow:hidden">
        <div id="animProgress" style="height:100%;width:0%;background:linear-gradient(90deg,var(--acc),var(--acc3));border-radius:2px;transition:width .4s ease"></div>
      </div>

      <!-- Controls row -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.6rem">
        <!-- Playback buttons -->
        <div style="display:flex;align-items:center;gap:.45rem">
          <button onclick="resetAnim()" class="anim-ctrl-btn" title="Reset (R)">⏮</button>
          <button onclick="animStep(-1)" class="anim-ctrl-btn" title="Previous">⏪</button>
          <button onclick="togglePlay()" id="playBtn" class="anim-play-btn">▶</button>
          <button onclick="animStep(1)" class="anim-ctrl-btn" title="Next">⏩</button>
          <span id="animBadge" style="font-family:'JetBrains Mono',monospace;font-size:.68rem;color:var(--dim);margin-left:.3rem;white-space:nowrap">
            Step 1 / ${tl.length}
          </span>
        </div>
        <!-- Speed -->
        <div style="display:flex;align-items:center;gap:.6rem;font-size:.68rem;color:var(--dim)">
          <span>🐇</span>
          <input type="range" min="200" max="1800" value="800" id="animSpeed" oninput="updateAnimSpeed(this)" style="width:80px">
          <span>🐢</span>
          <span id="speedVal" style="font-size:.65rem;color:var(--acc);min-width:52px;font-weight:600">Normal</span>
        </div>
      </div>
    </div>

    <!-- Gantt chart area -->
    <div style="background:var(--s2);border:1px solid var(--bd);border-radius:16px;padding:1rem 1.2rem;margin-bottom:1.2rem">
      <div style="font-size:.6rem;color:var(--dim);text-transform:uppercase;letter-spacing:.12em;font-weight:700;margin-bottom:.8rem">📊 CPU Timeline</div>
      <div id="animGantt"></div>
    </div>

    <!-- Info + Queue -->
    <div id="animBottom" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div id="animInfo"></div>
      <div id="animQueue"></div>
    </div>`;
  animIdx=0;
  renderAnimFrame(0);
}

// ── SMOOTH GANTT ──
let animGanttBuilt = false;

function buildAnimGantt(tl){
  // Build ALL blocks at once, hidden
  const UNIT=36;
  const seen=new Set(); const legendItems=[];
  const blocks = tl.map((seg,i)=>{
    const dur=Math.round((seg.end-seg.start)*100)/100;
    const w=Math.max(44,Math.round(dur*UNIT));
    const isIdle=seg.pid==='idle', isCS=seg.pid==='cs';
    if(!isIdle&&!isCS&&!seen.has(seg.pid)){
      seen.add(seg.pid);
      legendItems.push(`<div class="g-li"><span class="g-dot" style="background:${seg.color}"></span>${seg.name}</div>`);
    }
    const bg=isCS?'#1a1a3a':(isIdle?'var(--s2)':`linear-gradient(135deg,${seg.color}cc,${seg.color}88)`);
    const label = isIdle?'💤':(isCS?'CS':seg.name);
    const timeStr = `${seg.start}→${seg.end}`;
    return `<div class="anim-gblock" data-idx="${i}"
      style="width:${w}px;flex-shrink:0;background:${bg};border-radius:8px 8px 0 0;
      opacity:0;transform:translateY(-10px) scale(.9);
      transition:opacity .3s ease, transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, outline .15s ease, filter .2s ease;"
      title="${isIdle?'IDLE':(isCS?'Context Switch':seg.name)}: ${seg.start}→${seg.end}">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:64px;padding:.4rem;gap:.1rem">
        <span style="font-size:${isCS?'.52rem':'.72rem'};font-weight:800;color:white;letter-spacing:-.01em">${label}</span>
        ${!isIdle&&!isCS?`<span style="font-size:.5rem;color:rgba(255,255,255,.75);font-weight:500">${dur}u</span>`:''}
        <span style="font-size:.48rem;color:rgba(255,255,255,.6)">${timeStr}</span>
      </div>
    </div>`;
  }).join('');

  const numLine = tl.map((seg,i)=>{
    const dur=Math.round((seg.end-seg.start)*100)/100;
    const w=Math.max(44,Math.round(dur*UNIT));
    const isLast=i===tl.length-1;
    const fmt=n=>Number.isInteger(n)?n:(Math.round(n*100)/100);
    return `<div data-num-idx="${i}" style="width:${w}px;flex-shrink:0;position:relative;height:22px;
      opacity:0;transition:opacity .3s ease;">
      <span style="position:absolute;left:0;transform:translateX(-50%);font-size:.6rem;color:var(--dim)">${fmt(seg.start)}</span>
      ${isLast?`<span style="position:absolute;right:0;transform:translateX(50%);font-size:.6rem;color:var(--dim)">${fmt(seg.end)}</span>`:''}
    </div>`;
  }).join('');

  if(tl.some(s=>s.pid==='cs'))legendItems.push(`<div class="g-li"><span class="g-dot" style="background:#1a1a3a;border:1px dashed #333366"></span>CS</div>`);

  return {blocksHtml:blocks, numLineHtml:numLine, legendHtml:legendItems.join('')};
}

function updateAnimGantt(tl, currentIdx){
  const ganttEl = document.getElementById('animGantt');
  if(!ganttEl) return;

  // Build full gantt once
  if(!animGanttBuilt || ganttEl.children.length===0){
    const {blocksHtml, numLineHtml, legendHtml} = buildAnimGantt(tl);
    ganttEl.innerHTML = `
      <div style="overflow-x:auto;padding-bottom:.5rem">
        <div id="animBlockRow" style="display:flex;gap:2px;align-items:flex-end;min-height:68px">${blocksHtml}</div>
        <div id="animNumRow" style="display:flex;gap:2px;margin-top:4px">${numLineHtml}</div>
      </div>
      <div class="g-legend" style="margin-top:.6rem">${legendHtml}</div>`;
    animGanttBuilt = true;
  }

  const seg = tl[currentIdx];
  const isIdle = seg?.pid==='idle';
  const isCS = seg?.pid==='cs';

  tl.forEach((s, i) => {
    const block = ganttEl.querySelector(`[data-idx="${i}"]`);
    const num   = ganttEl.querySelector(`[data-num-idx="${i}"]`);
    if(!block) return;

    if(i < currentIdx){
      // Past blocks — dimmed
      block.style.opacity='0.45';
      block.style.transform='translateY(0) scale(1)';
      block.style.outline='none';
      block.style.filter='brightness(.8) saturate(.6)';
      block.style.zIndex='1';
      if(num) num.style.opacity='0.45';
    } else if(i === currentIdx){
      // CURRENT block — glowing, lifted, labeled
      block.style.opacity='1';
      block.style.transform='translateY(-6px) scale(1.06)';
      block.style.outline=`3px solid ${isIdle?'var(--dim)':(isCS?'#7777cc':s.color||'white')}`;
      block.style.outlineOffset='2px';
      block.style.filter='brightness(1.3) saturate(1.2)';
      block.style.zIndex='10';
      block.style.boxShadow=isIdle?'none':`0 8px 28px ${s.color||'var(--acc)'}66`;
      if(num){num.style.opacity='1';num.style.fontWeight='700';num.style.color='var(--text)';}
    } else {
      // Future blocks — invisible
      block.style.opacity='0';
      block.style.transform='translateY(-10px) scale(.9)';
      block.style.outline='none';
      block.style.filter='none';
      block.style.zIndex='1';
      if(num) num.style.opacity='0';
    }
  });

  // Auto scroll to current block
  const currentBlock = ganttEl.querySelector(`[data-idx="${currentIdx}"]`);
  if(currentBlock){
    currentBlock.scrollIntoView({behavior:'smooth', block:'nearest', inline:'nearest'});
  }
}

function resetAnimGantt(){
  animGanttBuilt = false;
}

function renderAnimFrame(idx){
  const tl=lastTL;if(!tl.length)return;
  idx=Math.max(0,Math.min(idx,tl.length-1));animIdx=idx;

  // Smooth Gantt - reveal blocks progressively
  updateAnimGantt(tl, idx);

  // Smooth progress bar
  const prog=document.getElementById('animProgress');
  if(prog) prog.style.width=((idx+1)/tl.length*100)+'%';

  // Badge - no forced reflow
  const badge=document.getElementById('animBadge');
  if(badge) badge.textContent=`${idx+1} / ${tl.length}`;

  // Play button state
  const pb=document.getElementById('playBtn');
  if(pb){pb.textContent=animPlaying?'⏸':'▶';pb.className=animPlaying?'anim-play-btn playing':'anim-play-btn';}
  const seg=tl[idx];
  const proc=lastRes?.results.find(r=>r.id===seg.pid);
  const isCS=seg.pid==='cs';
  const isIdle=seg.pid==='idle';
  const col=isIdle?'var(--dim)':(isCS?'#7777aa':seg.color);
  const t=seg.start;

  // ── Info Box ──
  const infoEl=document.getElementById('animInfo');
  if(infoEl){infoEl.innerHTML=`
    <div style="display:flex;flex-direction:column;gap:.7rem">
      <!-- Current status -->
      <div style="background:${col}0f;border:1.5px solid ${col}44;border-radius:14px;padding:1rem">
        <div style="font-size:.58rem;color:${col};text-transform:uppercase;letter-spacing:.12em;font-weight:700;margin-bottom:.5rem">
          ${isIdle?'💤 Idle':(isCS?'⚙ Context Switch':'▶ Now Running')}
        </div>
        <div style="font-family:'Outfit',sans-serif;font-size:1.8rem;font-weight:900;color:${col};line-height:1;margin-bottom:.4rem">
          ${isIdle?'—':(isCS?'CS':seg.name)}
        </div>
        <div style="display:flex;align-items:center;gap:.5rem;font-size:.72rem">
          <span style="background:var(--s2);border:1px solid var(--bd);padding:.2rem .6rem;border-radius:100px;color:var(--dim)">t=${seg.start}</span>
          <span style="color:var(--dim)">→</span>
          <span style="background:var(--s2);border:1px solid var(--bd);padding:.2rem .6rem;border-radius:100px;color:var(--dim)">t=${seg.end}</span>
          <span style="color:var(--acc4);font-weight:600">${Math.round((seg.end-seg.start)*100)/100}u</span>
        </div>
        ${isCS?'<div style="font-size:.62rem;color:var(--acc4);margin-top:.5rem;padding:.3rem .6rem;background:rgba(240,180,41,.08);border-radius:6px">Saving/restoring CPU registers</div>':''}
      </div>
      <!-- Process stats -->
      ${proc?`<div style="background:var(--s2);border:1px solid ${seg.color}33;border-radius:14px;padding:1rem">
        <div style="font-size:.58rem;color:var(--dim);text-transform:uppercase;letter-spacing:.12em;font-weight:700;margin-bottom:.7rem">Process Stats</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem">
          ${[['Arrival',proc.at,'var(--dim)'],['Burst',proc.bt,'var(--dim)'],
             ['Finish',proc.finish,'var(--text)'],['Response',proc.response,'#5b8dee'],
             ['Waiting',proc.wt,'#ee5b8d'],['Turnaround',proc.tat,'#a07af0']]
            .map(([l,v,c])=>`<div style="background:var(--s1);border-radius:8px;padding:.4rem .6rem">
              <div style="font-size:.55rem;color:var(--dim);margin-bottom:.1rem">${l}</div>
              <div style="font-size:.82rem;font-weight:700;color:${c}">${v}</div>
            </div>`).join('')}
        </div>
      </div>`:''}
    </div>`; }

  // ── Live Queue ──
  const qEl=document.getElementById('animQueue');
  if(!qEl||!lastRes)return;
  const results=lastRes.results;
  const running=(!isIdle&&!isCS)?seg.pid:null;
  const pcard=(p,state)=>{
    const colors={running:p.color,ready:'var(--acc4)',done:'var(--dim)',waiting:'var(--acc2)',notyet:'var(--bd)'};
    const c=colors[state]||'var(--dim)';
    const isCurr=state==='running';
    return `<div class="proc-card-anim" style="display:inline-flex;flex-direction:column;align-items:center;padding:.35rem .6rem;
      border-radius:9px;border:${isCurr?'2px':'1px'} solid ${c}${isCurr?'':'44'};
      background:${c}${isCurr?'22':'0d'};margin:.18rem;min-width:46px;text-align:center;
      box-shadow:${isCurr?`0 0 16px ${c}66`:''};
      transition:all .4s cubic-bezier(.34,1.56,.64,1)">
      <span style="font-size:.7rem;font-weight:700;color:${c}">${p.name}</span>
      <span style="font-size:.52rem;color:var(--dim);margin-top:.1rem">${p.bt}u</span>
    </div>`;
  };
  const cpuProc=running?procs.find(p=>p.id===running):null;
  const readyProcs=procs.filter(p=>{
    const r=results.find(r=>r.id===p.id);
    return r&&p.at<=t&&(r.finish>t)&&p.id!==running;
  });
  const doneProcs=procs.filter(p=>{
    const r=results.find(r=>r.id===p.id);
    return r&&r.finish<=t;
  });
  const notYet=procs.filter(p=>p.at>t);

  // smooth queue update
  const pct=Math.round((idx/Math.max(tl.length-1,1))*100);
  qEl.innerHTML=`
    <div style="display:flex;flex-direction:column;gap:.7rem">
      <div style="background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:.5rem .8rem;margin-bottom:.2rem">
        <div style="display:flex;justify-content:space-between;font-size:.6rem;color:var(--dim);margin-bottom:.3rem">
          <span>Progress</span><span>${pct}%</span>
        </div>
        <div style="height:4px;background:var(--bd);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--acc),var(--acc3));border-radius:2px;transition:width .4s ease"></div>
        </div>
      </div>
      <div class="${cpuProc?'cpu-running':''}" style="background:rgba(45,212,160,.06);border:1px solid rgba(45,212,160,.25);border-radius:12px;padding:.85rem;transition:all .3s">
        <div style="font-size:.58rem;color:var(--acc3);text-transform:uppercase;letter-spacing:.12em;font-weight:700;margin-bottom:.5rem;display:flex;align-items:center;gap:.4rem">
          <span style="width:7px;height:7px;border-radius:50%;background:${cpuProc?'var(--acc3)':'var(--dim)'};box-shadow:0 0 6px ${cpuProc?'var(--acc3)':'transparent'};transition:all .3s"></span>
          🖥 CPU — t=${seg.start}
        </div>
        ${cpuProc?pcard(cpuProc,'running'):`<span style="font-size:.7rem;color:var(--dim);padding:.2rem .4rem">💤 Idle${isCS?' (Context Switch)':''}</span>`}
      </div>
      <div style="background:rgba(240,180,41,.05);border:1px solid rgba(240,180,41,.2);border-radius:12px;padding:.85rem">
        <div style="font-size:.58rem;color:var(--acc4);text-transform:uppercase;letter-spacing:.12em;font-weight:700;margin-bottom:.5rem">
          📋 Ready Queue (${readyProcs.length})
        </div>
        <div>${readyProcs.length?readyProcs.map(p=>pcard(p,'ready')).join(''):'<span style="font-size:.68rem;color:var(--dim)">Empty</span>'}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
        <div style="background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:.7rem">
          <div style="font-size:.55rem;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">⏳ Not Arrived (${notYet.length})</div>
          <div>${notYet.length?notYet.map(p=>pcard(p,'notyet')).join(''):'<span style="font-size:.65rem;color:var(--dim)">None</span>'}</div>
        </div>
        <div style="background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:.7rem">
          <div style="font-size:.55rem;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">✅ Done (${doneProcs.length})</div>
          <div>${doneProcs.length?doneProcs.map(p=>pcard(p,'done')).join(''):'<span style="font-size:.65rem;color:var(--dim)">None</span>'}</div>
        </div>
      </div>
    </div>`;
}

function animStep(dir){const n=animIdx+dir;if(n<0||n>=lastTL.length)return;renderAnimFrame(n);}
function togglePlay(){
  if(animPlaying){
    clearInterval(animTimer);
    animPlaying=false;
    // Update button via renderAnimFrame
    const pb=document.getElementById('playBtn');
    if(pb){pb.textContent='▶';pb.className='anim-play-btn';}
    return;
  }
  if(animIdx>=lastTL.length-1){animIdx=0;renderAnimFrame(0);}
  animPlaying=true;
  const pb=document.getElementById('playBtn');
  if(pb){pb.textContent='⏸';pb.className='anim-play-btn playing';}
  const spd=+document.getElementById('animSpeed').value||800;
  animTimer=setInterval(()=>{
    if(animIdx>=lastTL.length-1){
      clearInterval(animTimer);
      animPlaying=false;
      const pb=document.getElementById('playBtn');
      if(pb){pb.textContent='▶';pb.className='anim-play-btn';}
      showToast('✅ Animation complete!','success');
      return;
    }
    renderAnimFrame(animIdx+1);
  },spd);
}
function resetAnim(){
  clearInterval(animTimer);
  animPlaying=false;
  animIdx=0;
  animGanttBuilt=false;
  const pb=document.getElementById('playBtn');
  if(pb){pb.textContent='▶';pb.className='anim-play-btn';}
  renderAnimFrame(0);
}
function updateAnimSpeed(el){
  const spd=+el.value;
  const lbl=document.getElementById('speedVal');
  if(lbl){lbl.textContent=spd<=400?'Fast':(spd<=900?'Normal':'Slow');}
  if(animPlaying){
    clearInterval(animTimer);
    animTimer=setInterval(()=>{
      if(animIdx>=lastTL.length-1){
        clearInterval(animTimer);animPlaying=false;
        const pb=document.getElementById('playBtn');
        if(pb){pb.textContent='▶';pb.className='anim-play-btn';}
        return;
      }
      renderAnimFrame(animIdx+1);
    }, spd);
  }
}

// ══════════════════════════════════════════════
//  STATES
// ══════════════════════════════════════════════
const SC2={new:'#5b8dee',ready:'#f0b429',running:'#2dd4a0',waiting:'#ee5b8d',done:'#6b6f9a'};
function sb2(state,lbl){return `<span class="sc" style="background:${SC2[state]}22;color:${SC2[state]};border:1px solid ${SC2[state]}44">${lbl||state.toUpperCase()}</span>`;}

function renderStates(results,tl){
  const el=document.getElementById('tab-states');if(!el)return;
  const SC2={new:'#5b8dee',ready:'#f0b429',running:'#2dd4a0',waiting:'#ee5b8d',done:'#6b6f9a'};

  // State diagram SVG at top
  const states=['NEW','READY','RUNNING','WAITING','DONE'];
  const stateColors=['#5b8dee','#f0b429','#2dd4a0','#ee5b8d','#6b6f9a'];
  const sx=[60,180,320,460,580];
  const sy=40;
  const circles=states.map((s,i)=>`
    <circle cx="${sx[i]}" cy="${sy}" r="28" fill="${stateColors[i]}22" stroke="${stateColors[i]}" stroke-width="2"/>
    <text x="${sx[i]}" y="${sy+5}" text-anchor="middle" font-size="11" fill="${stateColors[i]}" font-weight="700">${s}</text>
  `).join('');
  const arrows=[[0,1,'Admit'],[1,2,'Dispatch'],[2,1,'Preempt'],[2,3,'I/O Wait'],[3,1,'I/O Done'],[2,4,'Finish']];
  const arrowPaths=arrows.map(([from,to,lbl])=>{
    const x1=sx[from]+(to>from?28:-28),x2=sx[to]+(to>from?-28:28);
    const mid=(x1+x2)/2,curve=from===2&&to===1?-25:(from===2&&to===3?25:0);
    const path=curve?`M${x1},${sy} Q${mid},${sy+curve} ${x2},${sy}`:`M${x1},${sy} L${x2},${sy}`;
    return`<path d="${path}" stroke="${stateColors[from]}" stroke-width="1.5" fill="none" opacity=".6" marker-end="url(#arr${from})"/>
    <text x="${mid}" y="${sy+(curve||0)/2-6}" text-anchor="middle" font-size="8" fill="var(--dim)">${lbl}</text>`;
  }).join('');
  const defs=stateColors.map((c,i)=>`<marker id="arr${i}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${c}" opacity=".7"/></marker>`).join('');

  const stateDiagram=`<div style="overflow-x:auto;margin-bottom:1.5rem;background:var(--s2);border:1px solid var(--bd);border-radius:14px;padding:1.2rem">
    <div style="font-size:.62rem;color:var(--dim);text-transform:uppercase;letter-spacing:.12em;font-weight:700;margin-bottom:.8rem">Process State Diagram</div>
    <svg width="650" height="90" viewBox="0 0 650 90" style="overflow:visible;max-width:100%">
      <defs>${defs}</defs>${circles}${arrowPaths}
    </svg>
  </div>`;

  // Process state timelines
  const sb=(state,lbl)=>`<span style="font-size:.62rem;font-weight:600;padding:.18rem .55rem;border-radius:6px;background:${SC2[state]}22;color:${SC2[state]};border:1px solid ${SC2[state]}44">${lbl||state.toUpperCase()}</span>`;
  const arrow=`<span style="color:var(--dim);font-size:.7rem;margin:0 .15rem">→</span>`;

  const rows=procs.map((p,pi)=>{
    const r=results.find(r=>r.id===p.id);if(!r)return'';
    const segs=tl.filter(s=>s.pid===p.id);
    const states=[{s:'new',l:`NEW`},{s:'ready',l:`READY(t=${p.at})`},
      ...segs.flatMap((seg,i)=>[{s:'running',l:`RUN(${seg.start}→${seg.end})`},
        ...(i<segs.length-1?[{s:'waiting',l:'WAIT'}]:[])]),
      {s:'done',l:`DONE(t=${r.finish})`}];
    const chips=states.map((st,i)=>sb(st.s,st.l)+(i<states.length-1?arrow:'')).join('');
    const aging=r.boosts>0?`<span style="background:rgba(240,180,41,.12);color:var(--acc4);border:1px solid rgba(240,180,41,.3);padding:.15rem .55rem;border-radius:100px;font-size:.6rem;margin-left:.4rem">⬆ Aging +${r.boosts}</span>`:'';
    return`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:.9rem 1rem;margin-bottom:.6rem;animation:floatUp .4s ease ${pi*.06}s both">
      <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
        <span style="background:${p.color}22;color:${p.color};border:1px solid ${p.color}44;padding:.25rem .6rem;border-radius:8px;font-weight:700;font-size:.75rem;min-width:36px;text-align:center">${p.name}</span>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:.15rem">${chips}${aging}</div>
      </div>
      <div style="display:flex;gap:1.2rem;margin-top:.6rem;font-size:.67rem;color:var(--dim);flex-wrap:wrap">
        <span>WT: <b style="color:#ee5b8d">${r.wt}</b></span>
        <span>TAT: <b style="color:#a07af0">${r.tat}</b></span>
        <span>Response: <b style="color:#5b8dee">${r.response}</b></span>
        <span>Segments: <b style="color:var(--text)">${segs.length}</b></span>
      </div>
    </div>`;
  }).join('');

  el.innerHTML=stateDiagram+rows;
}


// ══════════════════════════════════════════════
//  QUEUE VIZ
// ══════════════════════════════════════════════
function initQueueViz(results,tl){
  const maxT=Math.max(...results.map(r=>r.finish));
  const qEl=document.getElementById('tab-queue');if(!qEl)return;qEl.innerHTML=`
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap">
      <span style="font-size:.72rem;color:var(--dim)">Time:</span>
      <input type="range" min="0" max="${maxT}" value="0" id="qSlider" oninput="updateQueue(this.value)" style="width:200px">
      <span id="qTimeLbl" style="font-family:'Outfit',sans-serif;font-size:1.3rem;font-weight:700;color:var(--acc)">t = 0</span>
    </div>
    <div class="q-grid">
      <div class="q-box cpu-b"><div class="q-title">🖥 CPU</div><div id="cpuDisp"></div></div>
      <div class="q-box"><div class="q-title">📋 Ready Queue</div><div id="readyDisp"></div></div>
    </div>
    <div class="q-grid" style="margin-top:1rem">
      <div class="q-box"><div class="q-title">⏰ Not Arrived</div><div id="notDisp"></div></div>
      <div class="q-box"><div class="q-title">✅ Done</div><div id="doneDisp"></div></div>
    </div>`;
  updateQueueAt(0,results,tl,maxT);
}

function updateQueue(t){
  if(!lastRes)return;
  document.getElementById('qTimeLbl').textContent=`t = ${t}`;
  updateQueueAt(+t,lastRes.results,lastTL,Math.max(...lastRes.results.map(r=>r.finish)));
}

function updateQueueAt(t,results,tl,maxT){
  const running=tl.find(s=>s.start<=t&&s.end>t&&s.pid!=='idle'&&s.pid!=='cs');
  const pcard=(p,state)=>{const isRun=state==='running';return`<div class="pc" style="background:${p.color}22;color:${p.color};border-color:${isRun?p.color:`${p.color}44`};box-shadow:${isRun?`0 0 18px ${p.color}55`:''}">${p.name}<span class="pc-sub">AT:${p.at} BT:${p.bt}</span></div>`;};
  const cpuEl=document.getElementById('cpuDisp');
  if(running){
    const p2=procs.find(p=>p.id===running.pid);
    const pct=((t-running.start)/(running.end-running.start)*100).toFixed(0);
    cpuEl.innerHTML=`<div style="text-align:center">${p2?pcard(p2,'running'):''}<div class="prog-bar" style="margin-top:.6rem"><div class="prog-fill" style="width:${pct}%;background:${p2?.color||'var(--acc)'}"></div></div><div style="font-size:.62rem;color:var(--dim);margin-top:.3rem">${pct}% complete</div></div>`;
  }else{cpuEl.innerHTML=`<div style="text-align:center;color:var(--dim);padding:1rem;font-size:.78rem">💤 Idle</div>`;}
  const ready=procs.filter(p=>{const r=results.find(r=>r.id===p.id);return r&&p.at<=t&&r.finish>t&&(!running||running.pid!==p.id);});
  const notArr=procs.filter(p=>p.at>t);
  const done=procs.filter(p=>{const r=results.find(r=>r.id===p.id);return r&&r.finish<=t;});
  document.getElementById('readyDisp').innerHTML=ready.length?ready.map(p=>pcard(p,'ready')).join(''):'<span style="color:var(--dim);font-size:.72rem">Empty</span>';
  document.getElementById('notDisp').innerHTML=notArr.length?notArr.map(p=>pcard(p,'not')).join(''):'<span style="color:var(--dim);font-size:.72rem">None</span>';
  document.getElementById('doneDisp').innerHTML=done.length?done.map(p=>pcard(p,'done')).join(''):'<span style="color:var(--dim);font-size:.72rem">None</span>';
}

// ══════════════════════════════════════════════
//  STEP EXPLANATION
// ══════════════════════════════════════════════
function initExplain(results,tl){
  const el=document.getElementById('tab-explain');
  if(!el) return;
  explainStep=0;
  renderExplainFrame(0,results,tl);
}

function explainStepFn(dir){
  const tl=lastTL;
  const n=explainStep+dir;
  if(n<0||n>=tl.length)return;
  explainStep=n;
  renderExplainFrame(n,lastRes?.results,tl);
}

function renderExplainFrame(idx,results,tl){
  tl=tl||lastTL;results=results||lastRes?.results||[];
  if(!tl.length)return;
  const explainEl=document.getElementById('tab-explain');
  if(!explainEl)return;
  const seg=tl[idx];
  const proc=Array.isArray(results)?results.find(r=>r.id===seg.pid):null;
  const isIdle=seg.pid==='idle',isCS=seg.pid==='cs';
  const prevSegs=tl.slice(0,idx).filter(s=>s.pid===seg.pid);
  const isFirst=prevSegs.length===0;
  const dur=seg.end-seg.start;

  let title='',reason='',detail='',formula='',finished=false;
  if(isCS){title='⚙ Context Switch';reason='The OS saves CPU registers of the previous process and restores state of the next.';detail=`Takes ${dur} time unit(s). This is pure overhead — no useful computation happens.`;}
  else if(isIdle){const nx=tl.slice(idx+1).find(s=>s.pid!=='idle'&&s.pid!=='cs');title='💤 CPU Idle';reason=`No process is available. CPU waits for next arrival at t=${nx?.start??'?'}.`;detail='Idle time directly reduces CPU utilization.';}
  else if(proc){
    const rt=seg.start-proc.at;
    if(selAlgo==='fcfs'){reason=isFirst?`${proc.name} arrived first at t=${proc.at}. FCFS executes in arrival order.`:'Continuing — FCFS is non-preemptive, no interruption.';detail=`Burst: ${proc.bt}u. Finish at t=${proc.finish}.`;}
    else if(selAlgo==='sjf_np'){reason=isFirst?`${proc.name} had shortest burst (${proc.bt}u) among processes available at t=${seg.start}.`:'Continuing — SJF non-preemptive runs to completion.';detail=`Minimum burst = ${proc.bt}u among available processes.`;}
    else if(selAlgo==='sjf_p'){const rem=proc.bt-prevSegs.reduce((s,x)=>s+(x.end-x.start),0);reason=`${proc.name} has shortest remaining time (${rem}u) at t=${seg.start}.`;detail=isFirst?`Initial remaining = full burst = ${proc.bt}u.`:`SRTF preempted another process because ${proc.name}'s remaining time is smaller.`;}
    else if(selAlgo==='rr'){reason=isFirst?`${proc.name} arrived and joined the ready queue. Round Robin gives CPU in turn.`:`${proc.name}'s turn in circular queue.`;detail=`Gets up to quantum of time. ${proc.finish<=seg.end?`✅ ${proc.name} finishes here!`:`Returns to back of ready queue after ${dur}u.`}`;}
    else{reason=isFirst?`${proc.name} has priority ${proc.pr} — highest among available processes at t=${seg.start}.`:(selAlgo==='priority_np'?'Continuing — non-preemptive runs to completion.':`${proc.name} still has highest priority.`);detail=`Priority: ${proc.pr}. (Lower = Higher priority)`;}
    title=`▶ ${proc.name} Running`;
    if(isFirst)formula=`Response Time = Start(${seg.start}) − Arrival(${proc.at}) = ${rt}`;
    if(proc.finish<=seg.end){finished=true;}
  }

  const col=isIdle?'var(--dim)':(isCS?'#7777aa':(proc?.color||'var(--acc)'));
  const minimap=tl.map((s,i)=>`<div onclick="explainGoto(${i})" class="explain-mini" style="background:${s.pid==='idle'?'var(--bd)':(s.pid==='cs'?'#1a1a3a':s.color)};opacity:${i===idx?1:.4};outline:${i===idx?'2px solid white':'none'}" title="${s.name||s.pid}: ${s.start}→${s.end}"></div>`).join('');

  if(!explainEl)return;explainEl.innerHTML=`
    <div style="display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;padding:.8rem 1rem;background:var(--s2);border:1px solid var(--bd);border-radius:12px;margin-bottom:1rem">
      <button class="btn btn-ghost" onclick="explainStepFn(-1)" style="padding:.35rem .8rem" ${idx===0?'disabled':''}>◀ Prev</button>
      <button class="btn btn-ghost" onclick="explainStepFn(1)" style="padding:.35rem .8rem" ${idx===tl.length-1?'disabled':''}>Next ▶</button>
      <span style="font-size:.68rem;background:rgba(91,141,238,.1);color:var(--acc);padding:.2rem .7rem;border-radius:100px;border:1px solid rgba(91,141,238,.3)">Step ${idx+1}/${tl.length}</span>
      <div style="overflow-x:auto;display:flex;gap:3px;flex:1">${minimap}</div>
    </div>
    <div style="background:${isIdle?'var(--s2)':(isCS?'rgba(26,26,58,.3)':`${col}11`)};border:1px solid ${isIdle?'var(--bd)':(isCS?'#333366':`${col}44`)};border-radius:12px;padding:1.2rem;margin-bottom:1rem">
      <div style="font-family:'Outfit',sans-serif;font-size:1.2rem;font-weight:700;color:${col};margin-bottom:.3rem">${title||(isIdle?'💤 Idle':seg.name)}</div>
      <div style="font-size:.7rem;color:var(--dim)">t = <b style="color:var(--text)">${seg.start}</b> → <b style="color:var(--text)">${seg.end}</b> (${dur}u)</div>
    </div>
    ${reason?`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:1.1rem;margin-bottom:.8rem"><div style="font-size:.6rem;color:var(--dim);text-transform:uppercase;letter-spacing:.12em;font-weight:700;margin-bottom:.5rem">Why this?</div><p style="font-size:.8rem;color:var(--text);line-height:1.7">${reason}</p></div>`:''}
    ${detail?`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:1.1rem;margin-bottom:.8rem"><div style="font-size:.6rem;color:var(--dim);text-transform:uppercase;letter-spacing:.12em;font-weight:700;margin-bottom:.5rem">Details</div><p style="font-size:.77rem;color:var(--dim);line-height:1.7">${detail}</p></div>`:''}
    ${formula?`<div style="background:rgba(91,141,238,.08);border:1px solid rgba(91,141,238,.3);border-radius:10px;padding:.9rem;margin-bottom:.8rem"><div style="font-size:.6rem;color:var(--acc);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">📐 Formula</div><code style="font-size:.76rem;color:var(--acc)">${formula}</code></div>`:''}
    ${finished&&proc?`<div style="background:rgba(45,212,160,.07);border:1px solid rgba(45,212,160,.3);border-radius:10px;padding:.9rem"><div style="font-size:.62rem;color:var(--acc3);font-weight:700;text-transform:uppercase;margin-bottom:.5rem">✅ Process Completed!</div><div style="font-size:.74rem;color:var(--text);margin-bottom:.25rem"><code style="color:#a07af0">Turnaround = ${proc.finish} − ${proc.at} = ${proc.tat}</code></div><div style="font-size:.74rem;color:var(--text)"><code style="color:#ee5b8d">Waiting = ${proc.tat} − ${proc.bt} = ${proc.wt}</code></div></div>`:''}`;
}

function explainGoto(idx){
  explainStep=idx;
  renderExplainFrame(idx,lastRes?.results,lastTL);
}

// ══════════════════════════════════════════════
//  RESULT TABLE
// ══════════════════════════════════════════════
function renderResultTable(results,stats){
  const showAging=selAlgo.startsWith('priority')&&document.getElementById('agingOn').checked;
  const avg=key=>(results.reduce((s,r)=>s+(r[key]||0),0)/results.length).toFixed(2);
  const rows=results.map(r=>`<tr>
    <td><span class="pbadge" style="background:${r.color}22;color:${r.color};border:1px solid ${r.color}44">${r.name}</span></td>
    <td>${r.at}</td><td>${r.bt}</td><td>${r.finish}</td>
    <td><span class="rbadge" style="background:rgba(160,122,240,.15);color:#a07af0">${r.tat}</span></td>
    <td><span class="rbadge" style="background:rgba(238,91,141,.15);color:#ee5b8d">${r.wt}</span></td>
    <td>${r.response}</td>
    ${showAging?`<td><span class="rbadge" style="background:rgba(240,180,41,.12);color:var(--acc4)">+${r.boosts||0}</span></td>`:''}
  </tr>`).join('');
  const tblEl=document.getElementById('tab-table');if(!tblEl)return;tblEl.innerHTML=`<div class="tbl-wrap"><table><thead><tr><th>Process</th><th>Arrival</th><th>Burst</th><th>Finish</th><th>Turnaround</th><th>Waiting</th><th>Response</th>${showAging?'<th>Aging</th>':''}</tr></thead><tbody>${rows}
  <tr style="background:var(--s2);font-weight:700"><td colspan="4" style="color:var(--acc);font-size:.65rem">AVERAGE</td>
  <td><span class="rbadge" style="background:rgba(160,122,240,.2);color:#a07af0">${avg('tat')}</span></td>
  <td><span class="rbadge" style="background:rgba(238,91,141,.2);color:#ee5b8d">${avg('wt')}</span></td>
  <td>${avg('response')}</td>${showAging?'<td>—</td>':''}</tr>
  </tbody></table></div>`;
}

// ══════════════════════════════════════════════
//  GRAPH
// ══════════════════════════════════════════════
function renderGraph(results){
  const gEl=document.getElementById('tab-graph');if(!gEl)return;
  const n=results.length;
  if(!n){gEl.innerHTML='<p style="text-align:center;color:var(--dim);padding:2rem">No results</p>';return;}

  // ── Tab switcher for graph type ──
  const graphType=gEl.dataset.type||'bar';

  // ── BAR CHART ──
  function makeBar(){
    const series=[
      {key:'wt',color:'#ee5b8d',label:'Waiting'},
      {key:'tat',color:'#5b8dee',label:'Turnaround'},
      {key:'response',color:'#2dd4a0',label:'Response'}
    ];
    const maxV=Math.max(...results.flatMap(r=>series.map(s=>r[s.key]||0)),1);
    const bH=180,bW=26,gap=5,gGap=28,gW=bW*3+gap*2,pad=55;
    const totW=Math.max(480,n*(gW+gGap)+pad+20);
    const grid=[0,.25,.5,.75,1].map(r=>{
      const y=bH*(1-r);
      return `<line x1="${pad}" y1="${y}" x2="${totW}" y2="${y}" stroke="var(--bd)" stroke-width="1" stroke-dasharray="4,3" opacity=".5"/>
      <text x="${pad-6}" y="${y+4}" text-anchor="end" font-size="10" fill="var(--dim)">${Math.round(maxV*r)}</text>`;
    }).join('');
    const bars=results.map((r,gi)=>{
      const x0=pad+gi*(gW+gGap);
      const b=series.map((s,si)=>{
        const val=r[s.key]||0,h=Math.max(0,(val/maxV)*bH),x=x0+si*(bW+gap);
        const d=gi*0.07+si*0.04;
        return `<rect x="${x}" y="${bH-h}" width="${bW}" height="${h}" fill="${s.color}" opacity=".85" rx="5"
          style="animation:barRise .5s cubic-bezier(.34,1.56,.64,1) ${d}s both">
          <title>${r.name} ${s.label}: ${val}</title>
        </rect>
        ${h>14?`<text x="${x+bW/2}" y="${bH-h-4}" text-anchor="middle" font-size="9" fill="${s.color}" font-weight="700">${val}</text>`:''}`;
      }).join('');
      return `<g>${b}
        <text x="${x0+gW/2}" y="${bH+18}" text-anchor="middle" font-size="12" fill="${r.color}" font-weight="700">${r.name}</text>
      </g>`;
    }).join('');
    const avgLines=series.map(s=>{
      const avg=results.reduce((a,r)=>a+(r[s.key]||0),0)/n;
      const y=bH-(avg/maxV)*bH;
      return `<line x1="${pad}" y1="${y}" x2="${totW}" y2="${y}" stroke="${s.color}" stroke-width="1.5" stroke-dasharray="6,3" opacity=".45"/>
      <text x="${totW+3}" y="${y+4}" font-size="9" fill="${s.color}" opacity=".7">avg</text>`;
    }).join('');
    return `<div style="overflow-x:auto;padding:.5rem 0">
      <svg width="${totW+30}" height="${bH+45}" style="overflow:visible">
        <style>@keyframes barRise{from{opacity:0;transform:scaleY(0);transform-origin:bottom}to{opacity:1;transform:scaleY(1)}}</style>
        ${grid}${bars}${avgLines}
      </svg>
    </div>`;
  }

  // ── RADAR/SPIDER CHART ──
  function makeRadar(){
    const metrics=[
      {key:'wt',label:'Waiting',color:'#ee5b8d',better:'lower'},
      {key:'tat',label:'Turnaround',color:'#5b8dee',better:'lower'},
      {key:'response',label:'Response',color:'#2dd4a0',better:'lower'},
    ];
    const cx=160,cy=140,R=100;
    const angles=metrics.map((_,i)=>-Math.PI/2+(2*Math.PI*i/metrics.length));
    const axisLines=metrics.map((m,i)=>{
      const ax=cx+R*Math.cos(angles[i]),ay=cy+R*Math.sin(angles[i]);
      const lx=cx+(R+20)*Math.cos(angles[i]),ly=cy+(R+20)*Math.sin(angles[i]);
      return `<line x1="${cx}" y1="${cy}" x2="${ax}" y2="${ay}" stroke="var(--bd)" stroke-width="1"/>
      <text x="${lx}" y="${ly+4}" text-anchor="middle" font-size="11" fill="${m.color}" font-weight="600">${m.label}</text>`;
    }).join('');
    const circles=[.25,.5,.75,1].map(r=>{
      const pts=angles.map(a=>`${cx+R*r*Math.cos(a)},${cy+R*r*Math.sin(a)}`).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="var(--bd)" stroke-width="1" opacity=".4"/>`;
    }).join('');
    const radarPolygons=results.map((res,ri)=>{
      const maxVals=metrics.map(m=>Math.max(...results.map(r=>r[m.key]||1)));
      const pts=metrics.map((m,i)=>{
        const val=res[m.key]||0;
        const norm=m.better==='lower'?1-(val/maxVals[i]):val/maxVals[i];
        const r=Math.max(0.05,norm)*R;
        return `${cx+r*Math.cos(angles[i])},${cy+r*Math.sin(angles[i])}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="${res.color}33" stroke="${res.color}" stroke-width="2" opacity=".85">
        <title>${res.name}</title>
      </polygon>`;
    }).join('');
    const legend=results.map(r=>`<div style="display:flex;align-items:center;gap:.4rem;font-size:.68rem">
      <span style="width:12px;height:12px;border-radius:3px;background:${r.color}"></span>${r.name}
    </div>`).join('');
    return `<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center">
      <svg width="340" height="290" style="overflow:visible;flex-shrink:0">${circles}${axisLines}${radarPolygons}</svg>
      <div>
        <div style="font-size:.62rem;color:var(--dim);margin-bottom:.6rem;text-transform:uppercase;letter-spacing:.1em">Legend</div>
        <div style="display:flex;flex-direction:column;gap:.4rem">${legend}</div>
        <div style="font-size:.62rem;color:var(--dim);margin-top:1rem;line-height:1.7">★ বাইরে = ভালো<br>ভেতরে = খারাপ<br>(lower is better)</div>
      </div>
    </div>`;
  }

  // ── HORIZONTAL BAR ──
  function makeHBar(){
    const metrics=[
      {key:'wt',label:'Waiting Time',color:'#ee5b8d'},
      {key:'tat',label:'Turnaround Time',color:'#5b8dee'},
      {key:'response',label:'Response Time',color:'#2dd4a0'},
    ];
    return metrics.map(m=>{
      const maxV=Math.max(...results.map(r=>r[m.key]||0),1);
      const rows=results.map((r,i)=>{
        const pct=((r[m.key]||0)/maxV*100).toFixed(1);
        return `<div style="display:flex;align-items:center;gap:.7rem;margin-bottom:.4rem">
          <span style="font-size:.7rem;font-weight:700;color:${r.color};min-width:28px">${r.name}</span>
          <div style="flex:1;height:10px;background:var(--bd);border-radius:5px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${m.color},${m.color}88);border-radius:5px;
              animation:barGrow .6s cubic-bezier(.34,1.56,.64,1) ${i*.07}s both"></div>
          </div>
          <span style="font-size:.7rem;color:${m.color};font-weight:600;min-width:28px;text-align:right">${r[m.key]||0}</span>
        </div>`;
      }).join('');
      const avg=(results.reduce((a,r)=>a+(r[m.key]||0),0)/n).toFixed(2);
      return `<div style="background:var(--s2);border:1px solid ${m.color}33;border-radius:12px;padding:1rem;margin-bottom:.8rem">
        <div style="display:flex;justify-content:space-between;margin-bottom:.7rem">
          <span style="font-size:.65rem;color:${m.color};font-weight:700;text-transform:uppercase;letter-spacing:.08em">${m.label}</span>
          <span style="font-size:.65rem;color:var(--dim)">avg: <b style="color:${m.color}">${avg}</b></span>
        </div>
        ${rows}
      </div>`;
    }).join('');
  }

  // ── Summary stats ──
  const series=[{key:'wt',color:'#ee5b8d',label:'Waiting'},{key:'tat',color:'#5b8dee',label:'Turnaround'},{key:'response',color:'#2dd4a0',label:'Response'}];
  const summaryRows=series.map(s=>{
    const vals=results.map(r=>r[s.key]||0);
    const avg=(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2);
    return `<div style="display:flex;align-items:center;gap:.8rem;padding:.5rem .8rem;background:${s.color}0d;border:1px solid ${s.color}33;border-radius:8px;font-size:.7rem;flex:1;min-width:130px">
      <span style="width:9px;height:9px;border-radius:2px;background:${s.color};flex-shrink:0"></span>
      <span style="color:var(--dim)">${s.label}</span>
      <b style="color:${s.color};margin-left:auto">${avg}</b>
    </div>`;
  }).join('');

  const chartContent=graphType==='hbar'?makeHBar():makeBar();

  gEl.innerHTML=`
    <div style="display:flex;gap:.4rem;margin-bottom:1.2rem;background:var(--s2);padding:.3rem;border-radius:10px;width:fit-content">
      ${[['bar','📊 Bar'],['hbar','📉 Horizontal']].map(([t,l])=>
        `<button onclick="switchGraph('${t}')" style="padding:.35rem .85rem;border-radius:7px;border:none;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:.65rem;font-weight:600;transition:all .2s;background:${graphType===t?'var(--s1)':'transparent'};color:${graphType===t?'var(--text)':'var(--dim)'};box-shadow:${graphType===t?'0 2px 8px rgba(0,0,0,.2)':''}">${l}</button>`
      ).join('')}
    </div>
    ${chartContent}
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem">${summaryRows}</div>`;
}

function switchGraph(type){
  const gEl=document.getElementById('tab-graph');
  if(gEl){gEl.dataset.type=type;renderGraph(lastRes?.results||[]);}
}


// ══════════════════════════════════════════════
//  THEORY
// ══════════════════════════════════════════════
function renderTheory(){
  const th=THEORY[selAlgo];if(!th)return;
  const c=th.color;
  const thEl=document.getElementById('tab-theory');if(!thEl)return;thEl.innerHTML=`
    <div class="theory-header">
      <span class="t-chip" style="background:${c}22;color:${c};border-color:${c}44">${th.type}</span>
      <span class="t-chip" style="background:var(--s2);color:var(--dim);border-color:var(--bd)">Time: ${th.tc}</span>
      <span class="t-chip" style="background:var(--s2);color:var(--dim);border-color:var(--bd)">Space: ${th.sc}</span>
    </div>
    <div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:1.1rem;margin-bottom:1.2rem">
      <div class="t-label" style="color:${c}">📖 Description</div>
      <p style="font-size:.8rem;color:var(--text);line-height:1.75">${th.desc}</p>
    </div>
    <div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:1.1rem;margin-bottom:1.2rem">
      <div class="t-label" style="color:${c}">⚙ How It Works</div>
      <ol class="t-list">${th.how.map(s=>`<li>${s}</li>`).join('')}</ol>
    </div>
    <div class="theory-grid">
      <div class="theory-box" style="background:rgba(45,212,160,.06);border:1px solid rgba(45,212,160,.25)">
        <div class="t-label" style="color:var(--acc3)">✅ Advantages</div>
        <ul class="t-list">${th.pros.map(s=>`<li>${s}</li>`).join('')}</ul>
      </div>
      <div class="theory-box" style="background:rgba(238,91,141,.06);border:1px solid rgba(238,91,141,.25)">
        <div class="t-label" style="color:var(--acc2)">❌ Disadvantages</div>
        <ul class="t-list">${th.cons.map(s=>`<li>${s}</li>`).join('')}</ul>
      </div>
    </div>
    <div class="theory-grid" style="margin-bottom:1.2rem">
      <div class="theory-box" style="background:rgba(45,212,160,.06);border:1px solid rgba(45,212,160,.25)">
        <div class="t-label" style="color:var(--acc3)">✦ Best For</div>
        <p style="font-size:.76rem;color:var(--text)">${th.best}</p>
      </div>
      <div class="theory-box" style="background:rgba(238,91,141,.06);border:1px solid rgba(238,91,141,.25)">
        <div class="t-label" style="color:var(--acc2)">✗ Worst For</div>
        <p style="font-size:.76rem;color:var(--text)">${th.worst}</p>
      </div>
    </div>
    <div style="background:${c}11;border:1px solid ${c}33;border-radius:12px;padding:1rem">
      <div class="t-label" style="color:${c}">🌍 Real World</div>
      <p style="font-size:.76rem;color:var(--text)">${th.real}</p>
    </div>`;
}

// ══════════════════════════════════════════════
//  RECOMMENDATION
// ══════════════════════════════════════════════
function recommendAlgo(ps){
  if(!ps.length)return null;
  const n=ps.length;
  const bts=ps.map(p=>p.bt);
  const avg=bts.reduce((a,b)=>a+b,0)/n;
  const cv=Math.sqrt(bts.reduce((s,b)=>s+Math.pow(b-avg,2),0)/n)/avg;
  const allSame=ps.every(p=>p.at===ps[0].at);
  const prs=ps.map(p=>p.pr);
  const pvAvg=prs.reduce((a,b)=>a+b,0)/n;
  const hasPr=prs.reduce((s,p)=>s+Math.pow(p-pvAvg,2),0)/n>0.5;
  const maxBT=Math.max(...bts),minBT=Math.min(...bts);
  const scores={fcfs:0,sjf_np:0,sjf_p:0,rr:0,priority_np:0,priority_p:0};
  if(cv<0.3)scores.fcfs+=30;if(allSame)scores.fcfs+=10;if(n<=3)scores.fcfs+=15;
  if(cv>0.4)scores.sjf_np+=25;if(maxBT/minBT>3)scores.sjf_np+=20;if(n>=4)scores.sjf_np+=10;
  if(cv>0.5)scores.sjf_p+=25;if(!allSame)scores.sjf_p+=15;if(maxBT/minBT>4)scores.sjf_p+=20;
  if(n>=4)scores.rr+=20;if(!allSame)scores.rr+=10;if(cv>0.3)scores.rr+=15;
  if(hasPr){scores.priority_np+=35;scores.priority_p+=30;}if(!allSame)scores.priority_p+=10;
  const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const best=sorted[0][0];
  const reasons={fcfs:'Processes have similar burst times — FCFS works well with minimal overhead.',sjf_np:`High burst variation (${minBT}–${maxBT}u) — SJF minimizes average waiting time.`,sjf_p:'High burst variation + staggered arrivals — SRTF gives optimal response time.',rr:`${n} processes with varying arrivals benefit from Round Robin fairness.`,priority_np:'Distinct priorities — Priority scheduling ensures important tasks run first.',priority_p:'Distinct priorities + staggered arrivals — Preemptive Priority gives critical tasks immediate CPU.'};
  const warnings=[];
  if(best==='sjf_p'||best==='sjf_np')warnings.push('⚠ SJF/SRTF requires knowing burst times in advance — impractical in real OS');
  if(hasPr&&best.startsWith('priority'))warnings.push('⚠ Enable Aging to prevent low-priority process starvation');
  if(best==='rr')warnings.push('💡 Tune quantum ≈ average burst / 2 for best performance');
  return{best,reason:reasons[best],warnings,scores,stats:{n,avg:avg.toFixed(1),cv:cv.toFixed(2),hasPr,allSame}};
}

function renderRecommend(){
  const rec=recommendAlgo(procs);
  const el=document.getElementById('tab-recommend');
  if(!el) return;
  if(!rec){el.innerHTML=`<div style="text-align:center;padding:2rem;color:var(--dim);font-size:.78rem">Add processes to get a recommendation.</div>`;return;}
  const COLS={fcfs:'#5b8dee',sjf_np:'#ee5b8d',sjf_p:'#2dd4a0',rr:'#f0b429',priority_np:'#4eb5f7',priority_p:'#f06e4e'};
  const c=COLS[rec.best];
  const maxScore=Math.max(...Object.values(rec.scores));
  const bars=Object.entries(rec.scores).map(([a,s])=>{
    const pct=maxScore>0?(s/maxScore)*100:0;
    const isBest=a===rec.best;
    return`<div class="score-bar-wrap"><div style="display:flex;justify-content:space-between;font-size:.7rem;margin-bottom:.22rem"><span style="color:${isBest?COLS[a]:'var(--dim)'};font-weight:${isBest?700:400}">${ANAMES[a]}</span><span style="color:var(--dim)">${s}</span></div><div class="score-bar-track"><div class="score-bar-fill" style="width:${pct}%;background:${isBest?COLS[a]:'var(--bd)'};box-shadow:${isBest?`0 0 8px ${COLS[a]}66`:'none'}"></div></div></div>`;
  }).join('');
  el.innerHTML=`
    <div class="rec-best" style="background:${c}11;border-color:${c}44">
      <div style="font-size:.62rem;color:${c};text-transform:uppercase;letter-spacing:.12em;font-weight:700;margin-bottom:.6rem">✦ Recommended</div>
      <div style="font-family:'Outfit',sans-serif;font-size:1.6rem;font-weight:800;color:${c};margin-bottom:.5rem">${ANAMES[rec.best]}</div>
      <p style="font-size:.79rem;color:var(--text);line-height:1.6;margin-bottom:1rem">${rec.reason}</p>
      <button class="btn" style="background:linear-gradient(135deg,${c},${c}aa);color:white;padding:.55rem 1.2rem;font-size:.75rem" onclick="applyRecommend('${rec.best}')">▶ Use ${ANAMES[rec.best]}</button>
    </div>
    <div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:1rem;margin-bottom:1.2rem">
      <div style="font-size:.62rem;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-bottom:.7rem">Process Analysis</div>
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;font-size:.73rem;color:var(--dim)">
        <span>Processes: <b style="color:var(--text)">${rec.stats.n}</b></span>
        <span>Avg Burst: <b style="color:var(--text)">${rec.stats.avg}</b></span>
        <span>Variation: <b style="color:var(--text)">${rec.stats.cv}</b></span>
        <span>Priorities differ: <b style="color:${rec.stats.hasPr?'var(--acc3)':'var(--acc2)'}">${rec.stats.hasPr?'Yes':'No'}</b></span>
        <span>Same arrival: <b style="color:${rec.stats.allSame?'var(--acc3)':'var(--acc4)'}">${rec.stats.allSame?'Yes':'No'}</b></span>
      </div>
    </div>
    <div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:1rem;margin-bottom:1.2rem">
      <div style="font-size:.62rem;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-bottom:.8rem">Suitability Scores</div>
      ${bars}
    </div>
    ${rec.warnings.map(w=>`<div style="background:rgba(240,180,41,.07);border:1px solid rgba(240,180,41,.3);border-radius:8px;padding:.7rem 1rem;font-size:.74rem;color:var(--acc4);margin-bottom:.5rem">${w}</div>`).join('')}`;
}

function applyRecommend(algo){
  const btn=document.querySelector(`[data-algo="${algo}"]`);
  if(btn)btn.click();
  switchTabByName('gantt');
}

// ══════════════════════════════════════════════
//  COMPARE
// ══════════════════════════════════════════════
function renderCompareEmpty(){
  const el=document.getElementById('tab-compare');
  if(!el)return;
  el.innerHTML=`<div style="text-align:center;padding:3rem">
    <div style="font-size:2.5rem;opacity:.2;margin-bottom:1rem">⚖</div>
    <div style="color:var(--dim);font-size:.78rem;margin-bottom:1.5rem">Click "⚖ Compare All" to compare all algorithms</div>
    <button class="btn btn-g" onclick="compareAll()">⚖ Compare All</button>
  </div>`;
}

function renderCompare(){
  if(!procs.length)return;
  const el=document.getElementById('tab-compare');if(!el)return;
  const COLS={fcfs:'#5b8dee',sjf_np:'#ee5b8d',sjf_p:'#2dd4a0',rr:'#f0b429',priority_np:'#4eb5f7',priority_p:'#f06e4e'};
  const all=Object.keys(ANAMES).map(a=>{
    const {stats}=runAlgo(procs,a);
    return{algo:a,name:ANAMES[a],avgWT:+stats.avgWT,avgTAT:+stats.avgTAT,avgRT:+stats.avgRT,cpuUtil:+stats.cpuUtil,color:COLS[a]};
  });
  const bestWT=Math.min(...all.map(r=>r.avgWT));
  const bestTAT=Math.min(...all.map(r=>r.avgTAT));

  // Cards
  const cards=all.map((r,i)=>{
    const isBest=r.avgWT===bestWT&&r.avgTAT===bestTAT;
    return`<div class="cmp-card" style="${isBest?'border-color:var(--acc3);box-shadow:0 0 20px rgba(45,212,160,.15)':''};animation-delay:${i*.06}s">
      ${isBest?'<span class="best-tag">✦ Best Overall</span>':''}
      <div class="cmp-name" style="color:${r.color}">${r.name}</div>
      ${[['Avg Waiting',r.avgWT.toFixed(2),'#ee5b8d'],['Avg Turnaround',r.avgTAT.toFixed(2),'#a07af0'],
         ['Avg Response',r.avgRT.toFixed(2),'#5b8dee'],['CPU Util',r.cpuUtil.toFixed(1)+'%','#2dd4a0']]
        .map(([l,v,c])=>`<div class="cmp-row">${l}<b style="color:${c}">${v}</b></div>`).join('')}
    </div>`;
  }).join('');

  // Visual bar comparison
  const metrics=[
    {key:'avgWT',label:'Avg Waiting Time',color:'#ee5b8d',better:'lower'},
    {key:'avgTAT',label:'Avg Turnaround',color:'#a07af0',better:'lower'},
    {key:'cpuUtil',label:'CPU Utilization %',color:'#2dd4a0',better:'higher'},
  ];
  const vizBars=metrics.map(m=>{
    const vals=all.map(r=>r[m.key]);
    const maxV=Math.max(...vals)||1;
    const rows=all.map((r,i)=>{
      const pct=(r[m.key]/maxV*100).toFixed(1);
      const isBestBar=m.better==='lower'?r[m.key]===Math.min(...vals):r[m.key]===Math.max(...vals);
      return`<div style="display:flex;align-items:center;gap:.7rem;margin-bottom:.4rem">
        <span style="font-size:.68rem;color:${r.color};font-weight:700;min-width:90px">${r.name}</span>
        <div style="flex:1;height:8px;background:var(--bd);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${isBestBar?m.color:m.color+'66'};border-radius:4px;
            animation:barGrow .6s cubic-bezier(.34,1.56,.64,1) ${i*.07}s both;transition:width .3s"></div>
        </div>
        <span style="font-size:.68rem;color:${isBestBar?m.color:'var(--dim)'};font-weight:${isBestBar?700:400};min-width:40px;text-align:right">${r[m.key].toFixed(2)}${m.key==='cpuUtil'?'%':''}</span>
        ${isBestBar?`<span style="font-size:.58rem;color:${m.color};background:${m.color}18;border:1px solid ${m.color}44;padding:.1rem .4rem;border-radius:100px">★ Best</span>`:'<span style="width:50px"></span>'}
      </div>`;
    }).join('');
    return`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:14px;padding:1.1rem;margin-bottom:.8rem">
      <div style="font-size:.65rem;color:${m.color};font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.8rem">${m.label}</div>
      ${rows}
    </div>`;
  }).join('');

  el.innerHTML=`
    <div style="margin-bottom:1.5rem">
      <div style="font-size:.62rem;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.8rem;font-weight:700">⚖ Visual Comparison</div>
      ${vizBars}
    </div>
    <div style="font-size:.62rem;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.8rem;font-weight:700">📊 Algorithm Cards</div>
    <div class="cmp-grid">${cards}</div>`;
}


// ══════════════════════════════════════════════
//  QUIZ
// ══════════════════════════════════════════════
function renderQuiz(){
  const el=document.getElementById('tab-quiz');if(!el)return;
  // Initialize pool if empty
  if(!activeQuiz.length) activeQuiz=getQuizPool();
  if(quizDone){
    const pct=Math.round(quizScore/activeQuiz.length*100);
    const grade=pct>=90?'🏆 Excellent!':(pct>=70?'🎉 Good Job!':(pct>=50?'📚 Keep Studying!':'💪 Practice More!'));
    el.innerHTML=`<div style="text-align:center;padding:2rem">
      <div style="font-family:'Outfit',sans-serif;font-size:4rem;font-weight:900;background:linear-gradient(135deg,var(--acc),var(--acc3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${pct}%</div>
      <div style="font-family:'Outfit',sans-serif;font-size:1.4rem;font-weight:700;margin-bottom:.5rem">${grade}</div>
      <div style="color:var(--dim);font-size:.8rem;margin-bottom:2rem">Score: ${quizScore} / ${activeQuiz.length} &nbsp;|&nbsp; <span style="color:var(--dim);font-size:.75rem">📚 From 20 question bank</span></div>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:2rem">
        ${[['Correct',quizScore,'var(--acc3)'],['Wrong',activeQuiz.length-quizScore,'var(--acc2)'],['Total',activeQuiz.length,'var(--acc)']].map(([l,v,c])=>`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:1rem 1.5rem;text-align:center"><div style="font-family:'Outfit',sans-serif;font-size:1.5rem;font-weight:700;color:${c}">${v}</div><div style="font-size:.6rem;color:var(--dim);text-transform:uppercase">${l}</div></div>`).join('')}
      </div>
      <button class="btn btn-p" onclick="restartQuiz()">↺ Try Again</button>
    </div>`;
    return;
  }
  const q=activeQuiz[quizIdx];
  const pct=((quizIdx+1)/activeQuiz.length*100);
  const opts=q.opts.map((opt,i)=>{
    let cls='quiz-opt';
    if(quizAnswered){if(i===q.ans)cls+=' correct';else if(i===quizSel&&i!==q.ans)cls+=' wrong';}
    else if(quizSel===i)cls+=' selected';
    const letter=String.fromCharCode(65+i);
    const mark=quizAnswered?(i===q.ans?'✓':(i===quizSel&&i!==q.ans?'✗':'')):'';
    return`<button class="${cls}" onclick="answerQuiz(${i})" ${quizAnswered?'disabled':''}><span class="opt-letter">${letter}</span>${opt}${mark?`<span style="margin-left:auto">${mark}</span>`:''}`;
  }).join('');
  el.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
      <div style="display:flex;align-items:center;gap:.6rem">
        <span style="font-size:.65rem;color:var(--dim);text-transform:uppercase;letter-spacing:.1em">Q${quizIdx+1} / ${activeQuiz.length}</span>
        <span style="background:rgba(91,141,238,.1);color:var(--acc);padding:.18rem .65rem;border-radius:100px;font-size:.63rem;border:1px solid rgba(91,141,238,.3)">📌 ${q.topic}</span>
      </div>
      <div style="display:flex;gap:.6rem;align-items:center">
        <span style="font-size:.7rem;color:var(--acc3)">✓ ${quizScore} correct</span>
        <span style="font-size:.7rem;color:var(--acc2)">✗ ${quizIdx-quizScore+(quizAnswered?0:0)} wrong</span>
      </div>
    </div>
    <div style="height:4px;background:var(--bd);border-radius:2px;margin-bottom:1.5rem;overflow:hidden"><div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--acc),var(--acc3));border-radius:2px;transition:width .3s"></div></div>
    <div style="background:var(--s2);border:1px solid var(--bd);border-radius:14px;padding:1.4rem;margin-bottom:1.2rem"><p style="font-size:.9rem;color:var(--text);line-height:1.7;font-weight:600">${q.q}</p></div>
    <div>${opts}</div>
    ${quizAnswered?`<div style="background:${quizSel===q.ans?'rgba(45,212,160,.07)':'rgba(238,91,141,.07)'};border:1px solid ${quizSel===q.ans?'rgba(45,212,160,.3)':'rgba(238,91,141,.3)'};border-radius:12px;padding:1.1rem;margin-bottom:1rem"><div style="font-size:.62rem;font-weight:700;color:${quizSel===q.ans?'var(--acc3)':'var(--acc2)'};text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem">${quizSel===q.ans?'✓ Correct!':'✗ Incorrect'}</div><p style="font-size:.78rem;color:var(--text);line-height:1.7">${q.exp}</p></div>
    <button class="btn btn-p" onclick="nextQuiz()">${quizIdx>=QUIZ.length-1?'🏁 Results':'Next →'}</button>`:''}`;
}

function answerQuiz(i){
  if(quizAnswered)return;
  quizSel=i;quizAnswered=true;
  if(i===QUIZ[quizIdx].ans)quizScore++;
  renderQuiz();
}
function nextQuiz(){
  if(quizIdx>=activeQuiz.length-1){quizDone=true;renderQuiz();return;}
  quizIdx++;quizSel=null;quizAnswered=false;renderQuiz();
}
function restartQuiz(){
  quizIdx=0;quizSel=null;quizAnswered=false;quizScore=0;quizDone=false;
  activeQuiz=getQuizPool(); // New random 5 questions!
  renderQuiz();
}

// ══════════════════════════════════════════════
//  HISTORY
// ══════════════════════════════════════════════
function addHistory(stats){
  history.unshift({id:Date.now(),time:new Date().toLocaleTimeString(),algo:ANAMES[selAlgo]||selAlgo,n:procs.length,stats,data:{...lastRes}});
  if(history.length>10)history.pop();
  updateHistBadge();
  renderHistory();
}
function updateHistBadge(){} // badge removed with button
function toggleHistory(){} // removed
function renderHistory(){
  const el1=document.getElementById('historyList');
  const el2=document.getElementById('tab-history');
  if(!el1&&!el2)return;
  const html=!history.length?'<p style="text-align:center;padding:2rem;color:var(--dim);font-size:.78rem">No simulations yet.</p>':history.map((h,i)=>`
    <div class="hist-item" onclick="restoreHist(${i})">
      <div class="hist-head"><span class="hist-algo">#${history.length-i} — ${h.algo}</span><span style="font-size:.6rem;color:var(--dim)">${h.time}</span></div>
      <div class="hist-meta"><span>Procs: <b>${h.n}</b></span><span>Avg WT: <b style="color:#ee5b8d">${h.stats.avgWT}</b></span><span>Avg TAT: <b style="color:#a07af0">${h.stats.avgTAT}</b></span><span>CPU: <b style="color:var(--acc3)">${h.stats.cpuUtil}%</b></span></div>
      <div style="font-size:.6rem;color:var(--dim);margin-top:.4rem">Click to restore →</div>
    </div>`).join('');
  if(el1)el1.innerHTML=html;
  if(el2)el2.innerHTML=html;
}
function restoreHist(i){
  const h=history[i];if(!h||!h.data)return;
  lastRes=h.data;lastTL=h.data.timeline;
  renderStats(h.stats);
  initTabs(h.data.results,h.data.timeline,h.stats);
  document.getElementById('resultsSection').classList.remove('hidden');
  document.getElementById('resultsSection').scrollIntoView({behavior:'smooth'});
  showToast(`↺ Restored: ${h.algo}`,'info');
}

// ══════════════════════════════════════════════
//  EXPORT
// ══════════════════════════════════════════════
function exportCSV(){
  if(!lastRes){showToast('⚠️ Run simulation first!','warn');return;}
  let csv='Process,Arrival,Burst,Priority,Finish,Turnaround,Waiting,Response\n';
  lastRes.results.forEach(r=>{csv+=`${r.name},${r.at},${r.bt},${r.pr},${r.finish},${r.tat},${r.wt},${r.response}\n`;});
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`cpu_${selAlgo}.csv`;a.click();
  showToast('📥 CSV exported!','info');
}

function printPDF(){
  if(!lastRes)return;
  const r=lastRes;const csTime=+document.getElementById('csTime').value||0;
  const w=window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CPU Scheduling Report</title>
  <style>body{font-family:Arial,sans-serif;max-width:950px;margin:40px auto;color:#12121e;padding:20px}h1{color:#3d6fd4;font-size:2rem;margin-bottom:.3rem}.sub{color:#6b6f9a;margin-bottom:2rem;font-size:.88rem}.sg{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem}.sb{background:#f0f2ff;border:1px solid #c8cdee;border-radius:10px;padding:1rem;text-align:center}.sv{font-size:1.6rem;font-weight:800;color:#3d6fd4}.sl{font-size:.65rem;color:#6b6f9a;text-transform:uppercase;margin-top:.3rem}table{width:100%;border-collapse:collapse;font-size:.85rem}th{background:#f0f2ff;padding:.6rem 1rem;text-align:left;font-size:.7rem;text-transform:uppercase;color:#6b6f9a;border-bottom:2px solid #c8cdee}td{padding:.6rem 1rem;border-bottom:1px solid #e8e8f0}h2{color:#3d6fd4;font-size:1.1rem;border-bottom:2px solid rgba(61,111,212,.3);padding-bottom:.4rem;margin:2rem 0 1rem}.gf{display:flex;gap:2px;flex-wrap:wrap;margin:1rem 0}.gb{padding:.4rem .8rem;border-radius:6px;font-size:.7rem;font-weight:700;color:white;text-align:center;min-width:44px}.footer{margin-top:3rem;padding-top:1rem;border-top:1px solid #c8cdee;font-size:.72rem;color:#6b6f9a;display:flex;justify-content:space-between}</style></head><body>
  <h1>CPU Scheduling Report</h1>
  <div class="sub">Algorithm: <b>${ANAMES[selAlgo]||selAlgo}</b> &nbsp;|&nbsp; ${new Date().toLocaleString()} &nbsp;|&nbsp; Processes: ${r.stats.n}</div>
  <h2>Statistics</h2>
  <div class="sg">
    <div class="sb"><div class="sv">${r.stats.avgWT}</div><div class="sl">Avg Waiting</div></div>
    <div class="sb"><div class="sv">${r.stats.avgTAT}</div><div class="sl">Avg Turnaround</div></div>
    <div class="sb"><div class="sv">${r.stats.avgRT}</div><div class="sl">Avg Response</div></div>
    <div class="sb"><div class="sv">${r.stats.cpuUtil}%</div><div class="sl">CPU Util</div></div>
    <div class="sb"><div class="sv">${r.stats.throughput}</div><div class="sl">Throughput</div></div>
    <div class="sb"><div class="sv">${r.stats.completion}</div><div class="sl">Completion</div></div>
  </div>
  ${r.stats.csCount>0?`<p style="background:#fff8e6;border:1px solid rgba(240,180,41,.4);border-radius:8px;padding:.8rem 1rem;color:#c07800">⚙ Context Switches: ${r.stats.csCount} × ${csTime}u = <b>${r.stats.csOverhead}u</b> overhead</p>`:''}
  <h2>Gantt Chart</h2>
  <div class="gf">${r.timeline.map(s=>`<div class="gb" style="background:${s.pid==='idle'?'#ccccdd':(s.pid==='cs'?'#333355':s.color)};color:${s.pid==='idle'||s.pid==='cs'?'#555':'white'}">${s.pid==='idle'?'idle':(s.pid==='cs'?'CS':s.name)}<br><small>${s.start}→${s.end}</small></div>`).join('')}</div>
  <h2>Results</h2>
  <table><thead><tr><th>Process</th><th>Arrival</th><th>Burst</th><th>Finish</th><th>Turnaround</th><th>Waiting</th><th>Response</th></tr></thead>
  <tbody>${r.results.map(p=>`<tr><td style="color:${p.color};font-weight:700">${p.name}</td><td>${p.at}</td><td>${p.bt}</td><td>${p.finish}</td><td>${p.tat}</td><td>${p.wt}</td><td>${p.response}</td></tr>`).join('')}
  <tr style="background:#f0f2ff;font-weight:700"><td colspan="4">AVERAGE</td><td>${r.stats.avgTAT}</td><td>${r.stats.avgWT}</td><td>${r.stats.avgRT}</td></tr></tbody></table>
  <div class="footer"><span>CPU Scheduling Simulator v5.0</span><span>${ANAMES[selAlgo]||selAlgo}</span></div>
  </body></html>`);
  w.document.close();setTimeout(()=>w.print(),400);
}

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
renderTable();
initDropdowns();
initDDOrigins();

// ── TOAST SYSTEM ──
function showToast(msg, type='success', duration=2800){
  const tc = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(()=>{
    t.style.animation='toastOut .3s ease both';
    setTimeout(()=>t.remove(), 300);
  }, duration);
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if(e.key==='Enter' && !e.target.matches('textarea,input')) {
    if(procs.length) simulate();
  }
  if(e.key==='Escape') {
    document.querySelectorAll('.dd-menu').forEach(m=>m.classList.add('hidden'));
    if(chatOpen) toggleChat();
  }
});


// ══════════════════════════════════════════════
//  AI CHATBOT (Offline / Rule-Based)
// ══════════════════════════════════════════════
let chatOpen = false;
let chatHistory = [];

// ── Knowledge Base ──────────────────────────
const KB = [
  // FCFS
  { keys:['fcfs','first come','convoy','first come first serve','প্রথম আসা','ফিফো','fifo'],
    ans:`**FCFS (First Come First Serve)**\n\nযে process আগে আসে সে আগে CPU পায় — arrival time অনুযায়ী।\n\n✅ সুবিধা:\n• সহজ implement করা যায়\n• Starvation হয় না\n\n❌ অসুবিধা:\n• Convoy Effect — একটা বড় process সব ছোট process কে আটকে রাখে\n• Average waiting time বেশি\n\n📐 Formula:\nWaiting Time = Start Time − Arrival Time\nTurnaround = Finish − Arrival` },

  // SJF
  { keys:['sjf','shortest job','সবচেয়ে ছোট','শর্টেস্ট'],
    ans:`**SJF (Shortest Job First)**\n\nAvailable processes এর মধ্যে যার burst time সবচেয়ে কম সে আগে CPU পায়।\n\n✅ সুবিধা:\n• Minimum average waiting time (mathematically proven)\n• Convoy effect কম\n\n❌ অসুবিধা:\n• Starvation হতে পারে\n• Burst time আগে জানতে হয় — real OS এ impractical\n\n💡 Non-preemptive — একবার শুরু হলে শেষ না হওয়া পর্যন্ত চলে` },

  // SRTF
  { keys:['srtf','shortest remaining','preemptive sjf','প্রিয়েম্পটিভ'],
    ans:`**SRTF (Shortest Remaining Time First)**\n\nSJF এর preemptive version। প্রতি মুহূর্তে check করে — নতুন process এর remaining time কম হলে current process কে থামিয়ে দেয়।\n\n✅ সুবিধা:\n• সব algorithm এর মধ্যে minimum average waiting time\n• Short process দ্রুত শেষ হয়\n\n❌ অসুবিধা:\n• Long process এর severe starvation\n• Context switch বেশি হয় — overhead বাড়ে` },

  // Round Robin
  { keys:['round robin','rr','quantum','time quantum','রাউন্ড রবিন','কোয়ান্টাম'],
    ans:`**Round Robin (RR)**\n\nসব process কে পালা করে একটা নির্দিষ্ট time (quantum) দেওয়া হয়। Time শেষ হলে পরের process এর পালা।\n\n✅ সুবিধা:\n• সব process fair share পায়\n• Starvation হয় না\n• Interactive system এর জন্য ভালো\n\n❌ অসুবিধা:\n• Quantum ছোট হলে context switch বেশি\n• Quantum বড় হলে FCFS এর মতো হয়ে যায়\n\n💡 Optimal quantum ≈ average burst time এর ৮০%` },

  // Priority
  { keys:['priority','প্রায়োরিটি','অগ্রাধিকার'],
    ans:`**Priority Scheduling**\n\nপ্রতিটা process এর priority number থাকে। সবচেয়ে high priority (lowest number) process আগে চলে।\n\n**Non-Preemptive:** একবার শুরু হলে শেষ পর্যন্ত চলে\n**Preemptive:** নতুন high-priority process আসলে current কে থামায়\n\n✅ সুবিধা:\n• Important process আগে চলে\n\n❌ অসুবিধা:\n• Low priority process এর starvation\n\n💡 Aging দিয়ে starvation prevent করা যায়` },

  // Starvation
  { keys:['starvation','starve','অনাহার','굶','না চলা','কখনো চলে না'],
    ans:`**Starvation (অনাহার)**\n\nযখন একটা process অনেকক্ষণ ধরে CPU পায় না — কারণ বারবার অন্য process এগিয়ে যায়।\n\n🔴 কখন হয়:\n• SJF/SRTF — সবসময় নতুন short process আসতে থাকলে\n• Priority — সবসময় high-priority process আসলে\n\n✅ Solution — **Aging:**\nযত বেশি সময় অপেক্ষা করবে, priority তত বাড়বে। একসময় সবচেয়ে high priority হয়ে CPU পাবে।` },

  // Aging
  { keys:['aging','এজিং','বয়স','priority boost','age'],
    ans:`**Aging**\n\nStarvation prevent করার technique।\n\nযত বেশি সময় একটা process ready queue তে থাকবে, তার priority তত বাড়তে থাকবে।\n\nFomula: নতুন priority = পুরানো priority − (waiting time × aging rate)\n\n✅ ফলাফল:\nLow priority process ও একসময় CPU পায় — starvation হয় না।\n\n💡 এই simulator এ Priority algorithm এ Aging checkbox enable করো!` },

  // Waiting Time
  { keys:['waiting time','wait time','ওয়েটিং','অপেক্ষা','কতক্ষণ অপেক্ষা'],
    ans:`**Waiting Time**\n\nএকটা process ready queue তে কতক্ষণ অপেক্ষা করেছে।\n\n📐 Formula:\nWaiting Time = Turnaround Time − Burst Time\nঅথবা\nWaiting Time = Start Time − Arrival Time (non-preemptive)\n\n✅ ভালো algorithm = কম average waiting time\n\nMinimum waiting time দেয়: **SJF/SRTF**\nFair waiting time দেয়: **Round Robin**` },

  // Turnaround Time
  { keys:['turnaround','tat','টার্নঅ্যারাউন্ড','মোট সময়'],
    ans:`**Turnaround Time (TAT)**\n\nProcess submit করা থেকে শেষ হওয়া পর্যন্ত মোট সময়।\n\n📐 Formula:\nTAT = Finish Time − Arrival Time\n\nঅথবা:\nTAT = Burst Time + Waiting Time\n\n✅ কম TAT মানে ভালো performance\n\n💡 Average TAT = সব process এর TAT এর গড়` },

  // Response Time
  { keys:['response time','রেসপন্স','first response','প্রথম'],
    ans:`**Response Time**\n\nProcess আসার পর প্রথমবার CPU পেতে কতক্ষণ লাগলো।\n\n📐 Formula:\nResponse Time = First CPU Start − Arrival Time\n\n✅ Interactive system এ এটা সবচেয়ে important metric\n\nBest response time দেয়: **Round Robin** (সবাই দ্রুত প্রথম chance পায়)` },

  // CPU Utilization
  { keys:['cpu utilization','cpu util','ব্যবহার','utilization','throughput'],
    ans:`**CPU Utilization & Throughput**\n\n**CPU Utilization:**\nCPU কতটা সময় কাজ করেছে।\n📐 = (Total Burst Time / Completion Time) × 100%\n\n**Throughput:**\nএক unit time এ কতটা process শেষ হয়েছে।\n📐 = Number of Processes / Completion Time\n\n✅ ভালো scheduler = High utilization + High throughput\n\n💡 Idle time কমালে utilization বাড়ে` },

  // Context Switch
  { keys:['context switch','context switching','কনটেক্সট','overhead','সুইচ'],
    ans:`**Context Switch**\n\nএকটা process বন্ধ করে অন্যটা শুরু করার সময় OS যা করে:\n• Current process এর CPU registers save করে\n• নতুন process এর state load করে\n\n⏱ এই সময়টা নষ্ট — কোনো useful কাজ হয় না।\n\n💡 Preemptive algorithms এ বেশি context switch হয়\n• SRTF সবচেয়ে বেশি\n• FCFS সবচেয়ে কম\n\nSimulator এ Context Switch time set করে দেখো!` },

  // Convoy Effect
  { keys:['convoy','কনভয়'],
    ans:`**Convoy Effect**\n\nFCFS এর সবচেয়ে বড় সমস্যা।\n\nযদি একটা বড় process (burst=20) আগে আসে, তাহলে অনেক ছোট process (burst=2,3,4) তার পেছনে আটকে থাকে।\n\nউদাহরণ:\nP1(burst=20) → P2(burst=2) → P3(burst=3)\n\nP2 এবং P3 কে 20 unit অপেক্ষা করতে হবে!\n\n✅ Solution: SJF ব্যবহার করো — ছোট process আগে চলবে` },

  // Compare algorithms
  { keys:['কোনটা ভালো','best algorithm','কোন algorithm','compare','তুলনা','difference','পার্থক্য','vs'],
    ans:`**Algorithm তুলনা:**\n\n| Algorithm | Avg WT | Fairness | Starvation |\n|-----------|--------|----------|------------|\n| FCFS | খারাপ | ✅ | ❌ নেই |\n| SJF | সেরা | ❌ | ⚠️ আছে |\n| SRTF | সেরা | ❌ | ⚠️ আছে |\n| Round Robin | মাঝারি | ✅✅ | ❌ নেই |\n| Priority | পরিবর্তনশীল | ❌ | ⚠️ আছে |\n\n💡 **simulator এ "⚖ Compare All" button click করো** — সব algorithm একসাথে দেখতে পাবে!` },

  // Analyze results
  { keys:['analyze','result দেখো','আমার result','simulation analyze','কেন বেশি','why high','কমাবো'],
    ans_fn: () => {
      if (!lastRes) return `এখনো কোনো simulation চালাওনি!\n\n▶ Simulate button click করো, তারপর আবার জিজ্ঞেস করো।`;
      const r = lastRes.stats;
      const algoName = ANAMES[selAlgo];
      let analysis = `**${algoName} Simulation Analysis:**\n\n`;
      analysis += `• Avg Waiting: **${r.avgWT}** units\n`;
      analysis += `• Avg Turnaround: **${r.avgTAT}** units\n`;
      analysis += `• CPU Utilization: **${r.cpuUtil}%**\n`;
      analysis += `• Completion: **${r.completion}** units\n`;
      if(r.csCount > 0) analysis += `• Context Switches: **${r.csCount}** (${r.csOverhead}u overhead)\n`;
      analysis += `\n`;
      if(+r.avgWT > 10) analysis += `⚠️ Waiting time বেশি — SJF বা SRTF try করো\n`;
      if(+r.cpuUtil < 70) analysis += `⚠️ CPU utilization কম — Idle gap আছে\n`;
      if(+r.cpuUtil >= 90) analysis += `✅ CPU utilization ভালো!\n`;
      if(+r.avgWT <= 5) analysis += `✅ Waiting time অনেক ভালো!\n`;
      if(r.csCount > 5) analysis += `⚠️ Context switch বেশি — preemptive algorithm এ এটা স্বাভাবিক\n`;
      analysis += `\n💡 **"⚖ Compare All"** click করো — দেখবে কোন algorithm এই data তে best!`;
      return analysis;
    }
  },

  // Quantum help
  { keys:['quantum কত','quantum size','কত দেবো','quantum value'],
    ans_fn: () => {
      if (!procs.length) return `Process add করো আগে, তারপর আমি quantum suggest করতে পারবো।`;
      const avg = (procs.reduce((s,p)=>s+p.bt,0)/procs.length).toFixed(1);
      const suggested = Math.max(2, Math.round(procs.reduce((s,p)=>s+p.bt,0)/procs.length * 0.8));
      return `**Round Robin Quantum Advice:**\n\nতোমার processes এর average burst time: **${avg} units**\n\n💡 Suggested quantum: **${suggested} units**\n\nRule: quantum ≈ average burst × 80%\n\n• Quantum খুব ছোট → বেশি context switch → overhead বাড়ে\n• Quantum খুব বড় → FCFS এর মতো হয়ে যায়\n\nSimulator এ quantum ${suggested} দিয়ে RR চালাও!`;
    }
  },

  // What is OS scheduling
  { keys:['scheduling কী','scheduling ki','শিডিউলিং','cpu scheduling কী','what is'],
    ans:`**CPU Scheduling কী?**\n\nOS (Operating System) decide করে কোন process কখন CPU পাবে — এটাই CPU Scheduling।\n\n🔄 **Process States:**\nNEW → READY → RUNNING → WAITING → DONE\n\n**কেন দরকার?**\n• CPU একটা, process অনেক\n• সব process efficiently চালাতে হবে\n• কাউকে বেশিক্ষণ অপেক্ষা করানো যাবে না\n\n**Goals:**\n• CPU utilization maximize করা\n• Waiting time minimize করা\n• Fairness নিশ্চিত করা` },

  // Hello/greeting
  { keys:['hello','hi','হ্যালো','হেই','hey','কেমন','সালাম','আসসালামু'],
    ans:`হ্যালো! 👋 আমি তোমার CPU Scheduling Assistant।\n\nআমি সাহায্য করতে পারবো:\n• 📖 Algorithm theory বোঝাতে\n• 📊 Simulation results analyze করতে\n• 🧮 Formula explain করতে\n• 💡 Best algorithm suggest করতে\n\nযেকোনো প্রশ্ন করো! বাংলা বা English দুটোই চলবে 😊` },

  // Thank you
  { keys:['thanks','ধন্যবাদ','thank you','থ্যাংকস','tnx','thnx'],
    ans:`স্বাগতম! 😊 আরো কিছু জানতে চাইলে জিজ্ঞেস করো।\n\n💡 Quick tips:\n• "⚖ Compare All" — সব algorithm compare\n• "💡 Why?" tab — প্রতিটা step explain\n• "🧠 Quiz" — নিজেকে test করো!` },


  // ── SIMULATOR USAGE ──
  { keys:['how to use','simulator','use করবো','শুরু করবো','start'],
    ans:'**Simulator কীভাবে Use করবো:**\n\nStep 1: Algorithm select করো\nStep 2: Process add করো (Arrival, Burst, Priority)\nStep 3: Simulate button click করো\nStep 4: Gantt, Animation, Results, Graph দেখো\n\nShortcut: Enter = Simulate, Esc = Close' },

  // ── GANTT ──
  { keys:['gantt','গ্যান্ট','chart কী'],
    ans:'**Gantt Chart:** CPU scheduling এর visual timeline।\n\nColored block = process CPU তে চলছে\nBlock width = execution time\nCS block = Context Switch\nidle = CPU খালি\n\nAnimation tab এ step-by-step দেখো!' },

  // ── COMPARE LIVE ──
  { keys:['compare','তুলনা','সব algorithm','compare all'],
    ans_fn: () => {
      if(!lastRes) return 'আগে Simulate করো, তারপর Compare tab এ যাও অথবা Compare All button click করো!';
      const all=Object.keys(ANAMES).map(a=>{const {stats}=runAlgo(procs,a);return{name:ANAMES[a],wt:+stats.avgWT,tat:+stats.avgTAT};});
      const bWT=all.reduce((b,r)=>r.wt<b.wt?r:b);
      return 'Algorithm Comparison:\n'+all.map(r=>'- '+r.name+': WT='+r.wt.toFixed(2)+', TAT='+r.tat.toFixed(2)).join('\n')+'\n\nBest Waiting Time: '+bWT.name+' ('+bWT.wt.toFixed(2)+')';
    }
  },

  // ── CURRENT RESULT ──
  { keys:['result কী','result দেখাও','কী result','আমার result','result show'],
    ans_fn: () => {
      if(!lastRes) return 'এখনো simulation চালাওনি! Simulate button click করো।';
      const r=lastRes.stats;
      return 'Current Results ('+ANAMES[selAlgo]+'):\n\nAvg Waiting: '+r.avgWT+'\nAvg Turnaround: '+r.avgTAT+'\nAvg Response: '+r.avgRT+'\nCPU Utilization: '+r.cpuUtil+'%\nCompletion: '+r.completion+(r.csCount>0?'\nContext Switches: '+r.csCount:'');
    }
  },

  // ── PROCESS FIELDS ──
  { keys:['arrival time','burst time','priority কী','process field','at কী','bt কী'],
    ans:'**Process Table Fields:**\n\nArrival Time: কখন process আসে (0 = শুরু থেকেই)\nBurst Time: CPU তে কতক্ষণ লাগবে\nPriority: কোনটা আগে চলবে (1 = সবার আগে)\n\nProcess name edit করা যায় - P1 তে click করো!' },

  // ── QUANTUM GUIDE ──
  { keys:['quantum','কোয়ান্টাম','time slice'],
    ans_fn: () => {
      if(!procs.length) return 'Process add করো আগে — তারপর optimal quantum suggest করবো।';
      const avg=procs.reduce((s,p)=>s+p.bt,0)/procs.length;
      const sug=Math.max(2,Math.round(avg*0.8));
      return 'Round Robin Quantum Guide:\n\nAverage Burst: '+avg.toFixed(1)+'\nSuggested Quantum: '+sug+'\n\nRule: quantum = avg burst x 80%\nToo small = বেশি context switch\nToo large = FCFS এর মতো হবে';
    }
  },

  // ── TAB GUIDE ──
  { keys:['tab','কোন tab','tab কাজ'],
    ans:'**Tab গুলোর কাজ:**\n\nGantt - CPU timeline chart\nAnim - Step animation + live queue\nStates - Process state diagram\nResults - WT, TAT table\nGraph - Bar/Horizontal/Radar chart\nTheory - Algorithm theory\nCompare - সব algorithm comparison\nQuiz - নিজেকে test করো\nHistory - আগের simulations' },

  // ── EXPORT ──
  { keys:['export','csv','pdf','download','save'],
    ans_fn: () => {
      if(!lastRes) return 'আগে Simulate করো — তারপর Results section এ Export CSV আর PDF Report button দেখবে।';
      return 'Export Options:\n\n- Export CSV: Excel এ open করা যাবে\n- PDF Report: Print বা Save করা যাবে\n\nResults section এর উপরে দুটো button আছে!';
    }
  },

  // ── PREEMPTIVE ──
  { keys:['preemptive','non-preemptive','প্রিয়েম্পটিভ'],
    ans:'**Preemptive vs Non-Preemptive:**\n\nNon-Preemptive: Process শেষ না করা পর্যন্ত CPU ছাড়ে না\n- FCFS, SJF NP, Priority NP\n\nPreemptive: নতুন better process আসলে current কে থামায়\n- SRTF, Round Robin, Priority P\n\nPreemptive = বেশি fair কিন্তু বেশি context switch' },

  // ── REAL OS ──
  { keys:['real os','linux','windows','multilevel','mlfq'],
    ans:'**Real OS Scheduling:**\n\nLinux: CFS (Completely Fair Scheduler) - SRTF inspired\nWindows: Multilevel Feedback Queue - 32 priority levels\nMacOS: Round Robin per priority level\n\nReal OS এ এই 6 algorithm এর combination use হয়।' },

  // ── DEFAULT ──
  { keys:['__default__'],
    ans:'বুঝতে পারিনি। এভাবে জিজ্ঞেস করো:\n\n- "FCFS vs SJF পার্থক্য?"\n- "আমার result দেখাও"\n- "Simulator কীভাবে use করবো?"\n- "Quantum কত দেবো?"\n- "সব algorithm compare করো"\n\nবাংলা বা English দুটোই চলবে!' }
];

function findAnswer(text) {
  const lower = text.toLowerCase();
  for (const item of KB) {
    if (item.keys[0] === '__default__') continue;
    if (item.keys.some(k => lower.includes(k))) {
      if (item.ans_fn) return item.ans_fn();
      return item.ans;
    }
  }
  const def = KB[KB.length-1];
  return def.ans_fn ? def.ans_fn() : def.ans;
}

// ── UI Functions ─────────────────────────────
function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chatPanel').style.display = chatOpen ? 'block' : 'none';
  document.getElementById('chatFab').style.display = chatOpen ? 'none' : 'flex';
  if (chatOpen) setTimeout(()=>document.getElementById('chatInput').focus(), 100);
}

function clearChat() {
  chatHistory = [];
  document.getElementById('chatMessages').innerHTML = `
    <div class="ai-msg">
      <div style="display:flex;gap:.6rem;align-items:flex-start">
        <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--acc),var(--acc3));display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0">🤖</div>
        <div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px 12px 12px 3px;padding:.7rem .9rem;font-size:.76rem;line-height:1.6;color:var(--text);max-width:280px">
          Chat clear হয়ে গেছে! নতুন প্রশ্ন করো 😊
        </div>
      </div>
    </div>`;
}

function addUserMessage(text) {
  const msgs = document.getElementById('chatMessages');
  const safe = text.replace(/[<]/g,'&lt;').replace(/[>]/g,'&gt;');
  msgs.innerHTML += `<div class="user-msg-wrap"><div class="user-bubble">${safe}</div></div>`;
  msgs.scrollTop = msgs.scrollHeight;
}

function addAIMessage(text) {
  const msgs = document.getElementById('chatMessages');
  const typingEl = document.getElementById('typingIndicator');
  if (typingEl) typingEl.remove();
  const formatted = text
    .replace(/[<]/g,'&lt;').replace(/[>]/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\n/g, '<br>');
  msgs.innerHTML += `
    <div class="ai-msg">
      <div style="display:flex;gap:.6rem;align-items:flex-start">
        <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--acc),var(--acc3));display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0">🤖</div>
        <div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px 12px 12px 3px;padding:.7rem .9rem;font-size:.76rem;line-height:1.7;color:var(--text);max-width:290px">${formatted}</div>
      </div>
    </div>`;
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML += `
    <div id="typingIndicator" class="ai-msg">
      <div style="display:flex;gap:.6rem;align-items:flex-start">
        <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--acc),var(--acc3));display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0">🤖</div>
        <div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px 12px 12px 3px;padding:.7rem 1rem;display:flex;gap:4px;align-items:center">
          <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
        </div>
      </div>
    </div>`;
  msgs.scrollTop = msgs.scrollHeight;
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addUserMessage(text);
  showTyping();
  const delay = Math.min(400 + text.length * 8, 1200);
  setTimeout(() => {
    const answer = findAnswer(text);
    addAIMessage(answer);
  }, delay);
}

function sendQuick(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}


// ── INIT ──
renderTable();
initDropdowns();
initDDOrigins();

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if(e.key==='Enter' && !e.target.matches('textarea,input')) {
    if(procs.length) simulate();
  }
  if(e.key==='Escape') {
    closeAllDD();
    if(chatOpen) toggleChat();
  }
});

// ── LOADING SCREEN ──
const loaderSteps = [
  'Loading algorithms...',
  'Preparing scheduler...',
  'Building UI...',
  'Almost ready...',
  'Ready!'
];
let loaderIdx = 0;
function runLoader(){
  const el = document.getElementById('loaderStep');
  if(!el) return;
  const interval = setInterval(()=>{
    if(loaderIdx < loaderSteps.length){
      el.textContent = loaderSteps[loaderIdx++];
    } else {
      clearInterval(interval);
    }
  }, 320);
  setTimeout(()=>{
    const ls = document.getElementById('loadingScreen');
    if(ls) ls.classList.add('fade-out');
    setTimeout(()=>{if(ls)ls.style.display='none';}, 700);
  }, 1900);
}
runLoader();

// ══════════════════════════════════════════════
//  BACKEND API CONNECTION
// ══════════════════════════════════════════════
const API_URL = 'http://localhost:5000/api';

// Simulation শেষে backend এ save করো
async function saveToBackend(algorithm, processes, stats) {
  try {
    const response = await fetch(`${API_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm, processes, stats })
    });
    const data = await response.json();
    if (data.success) {
      showToast('☁️ Simulation saved to server!', 'success', 2000);
    }
  } catch (err) {
    // Backend না চললে silent fail — offline mode এ কাজ করবে
    console.log('Backend not connected, running offline.');
  }
}

// Backend থেকে history load করো
async function loadFromBackend() {
  try {
    const response = await fetch(`${API_URL}/history`);
    const data = await response.json();
    return data.history || [];
  } catch (err) {
    return [];
  }
}
