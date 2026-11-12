const SUBJ={mathematics:'subj_m',reasoning:'subj_r','general-awareness':'subj_g'};
const SRC={original:'source_original','pyq-verified':'source_pyq',official:'source_official'};
const Bank={all:[],
 valid(q){try{return /^[\w.-]+$/.test(q.id)&&SUBJ[q.subject]&&q.q?.en&&q.options?.en?.length===4&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4&&['easy','medium','hard'].includes(q.difficulty)&&SRC[q.source]&&q.topic}catch{return false}},
 async load(){let packs=[];try{packs=(await(await fetch('data/manifest.json')).json()).packs}catch{}
  let out=[];for(const f of packs){try{const d=await(await fetch('data/'+f)).json();out=out.concat(d.questions||d)}catch{console.warn('Pack failed:',f)}}
  out=out.concat(LS.g('imported',[]));const seen=new Set();
  this.all=out.filter(q=>this.valid(q)&&!seen.has(q.id)&&seen.add(q.id))},
 opts(q){const o=q.options[Lang.cur];return o&&o.length===4?o:q.options.en}};
const optsHtml=(q,ch,rev,fn)=>`<div class="opts">${Bank.opts(q).map((o,i)=>`<button class="opt ${rev?(i===q.answer?'ok':i===ch?'bad':''):''}" ${rev?'disabled':`onclick="${fn}${i})"`}><b>${'ABCD'[i]}</b><span>${esc(o)}</span></button>`).join('')}</div>`;

const App={syl:{subjects:[]},f:{subject:'',topic:'',diff:'',q:'',page:0,bm:false},pk:{},
 async init(){await Lang.load();try{this.syl=await(await fetch('data/syllabus.json')).json()}catch{}
  await Bank.load();addEventListener('hashchange',()=>this.render());this.render()},
 topics(s){return this.syl.subjects.filter(x=>!s||x.id===s).flatMap(x=>x.topics.map(o=>({...o,subject:x.id})))},
 tname(id){const o=this.topics().find(x=>x.id===id);return o?pick(o.name):id},
 render(keep){const [r,a,b]=(location.hash.slice(1)||'home').split('/');
  document.body.classList.toggle('exam',r==='exam');
  if(r!=='exam')Timer.stop();
  if(r==='start'){Exam.startMock(a);return}
  const el=$('#main');this.nav(r);
  const V={home:()=>this.home(el),exam:()=>Exam.render(el),syllabus:()=>this.syllabus(el),
   practice:()=>{if(a)Object.assign(this.f,{subject:a,topic:b||'',page:0});this.f.bm=false;this.browse(el,'nav_practice')},
   bank:()=>{this.f.bm=false;this.browse(el,'nav_bank')},mocks:()=>this.mocks(el),
   bookmarks:()=>{this.f.bm=true;this.browse(el,'nav_bookmarks')},results:()=>this.results(el,a),result:()=>this.results(el,a),settings:()=>this.settings(el)};
  (V[r]||V.home)();Lang.apply();if(!keep)window.scrollTo(0,0)},
 nav(r){const L=[['home','nav_home'],['start/CBT-1','nav_cbt1'],['start/CBT-2','nav_cbt2'],['practice','nav_practice'],['syllabus','nav_syllabus'],['bank','nav_bank'],['mocks','nav_mocks'],['bookmarks','nav_bookmarks'],['results','nav_results'],['settings','nav_settings']];
  $('#nav').innerHTML=L.map(([h,k])=>`<a href="#${h}" class="${h.split('/')[0]===r?'on':''}">${t(k)}</a>`).join('')},
 home(el){const ex=LS.g('exam',null),rs=LS.g('results',[]),ps=Object.values(LS.g('pstat',{})),pg=LS.g('prog',{}),tp=this.topics();
  const avg=rs.length?(rs.reduce((s,r)=>s+r.score,0)/rs.length).toFixed(1):'–',pa=ps.length?Math.round(ps.filter(Boolean).length/ps.length*100)+'%':'–';
  const tile=(v,k)=>`<div class="card stat"><b>${v}</b><span>${t(k)}</span></div>`;
  el.innerHTML=`<section class="hero"><h1>${t('app_title')}</h1><p>${t('hero_sub')}</p>
  <div class="row"><a class="btn pri" href="#start/CBT-1">${t('nav_cbt1')}<small>100 Q · 90 min</small></a><a class="btn pri" href="#start/CBT-2">${t('nav_cbt2')}<small>120 Q · 90 min</small></a>
  ${ex?`<button class="btn" onclick="Exam.resume()">${t('resume')}: ${esc(ex.title)}</button>`:''}</div></section>
  <h3>${t('dashboard')}</h3><div class="grid4">${tile(Bank.all.length,'questions_loaded')}${tile(rs.length,'exams_taken')}${tile(avg,'avg_score')}${tile(pa,'practice_acc')}${tile(tp.length?Math.round(tp.filter(x=>pg[x.id]).length/tp.length*100)+'%':'–','syllabus_done')}</div>
  <p class="card note">ℹ️ ${t('disclaimer')}</p>`},
 syllabus(el){const pg=LS.g('prog',{});
  el.innerHTML=`<h2>${t('nav_syllabus')}</h2>`+this.syl.subjects.map(s=>{const d=s.topics.filter(x=>pg[x.id]).length,p=Math.round(d/s.topics.length*100);
   return `<details class="card" open><summary><b>${esc(pick(s.name))}</b> <span class="tag">${p}%</span></summary><div class="bar"><i style="width:${p}%"></i></div>`+
   s.topics.map(x=>{const n=Bank.all.filter(q=>q.topic===x.id).length;return `<div class="trow"><label><input type="checkbox" ${pg[x.id]?'checked':''} onchange="App.prog('${x.id}',this.checked)"> ${esc(pick(x.name))}</label><a href="#practice/${s.id}/${x.id}">${n} ${t('questions')} ›</a></div>`}).join('')+`</details>`}).join('')},
 prog(id,v){const p=LS.g('prog',{});v?p[id]=1:delete p[id];LS.s('prog',p);this.render(true)},
 browse(el,title){const f=this.f,ts=this.topics(f.subject);
  const sel=(id,l,opts)=>`<select id="${id}" aria-label="${l}"><option value="">${l}: ${t('all')}</option>${opts.map(([v,n,c])=>`<option value="${v}" ${c?'selected':''}>${n}</option>`).join('')}</select>`;
  el.innerHTML=`<h2>${t(title)}</h2><div class="card filters"><input id="fq" type="search" placeholder="${t('search')}" value="${esc(f.q)}" aria-label="${t('search')}">
  ${sel('fs',t('subject'),Object.keys(SUBJ).map(k=>[k,t(SUBJ[k]),f.subject===k]))}${sel('ft',t('topic'),ts.map(x=>[x.id,esc(pick(x.name)),f.topic===x.id]))}
  ${sel('fd',t('difficulty'),['easy','medium','hard'].map(k=>[k,t(k),f.diff===k]))}</div><div id="list"></div>`;
  $('#fq').oninput=e=>{f.q=e.target.value;f.page=0;this.list()};
  $('#fs').onchange=e=>{f.subject=e.target.value;f.topic='';f.page=0;this.browse(el,title)};
  $('#ft').onchange=e=>{f.topic=e.target.value;f.page=0;this.list()};
  $('#fd').onchange=e=>{f.diff=e.target.value;f.page=0;this.list()};this.list()},
 list(){const f=this.f,bms=LS.g('bm',[]),s=f.q.toLowerCase();
  const r=Bank.all.filter(q=>(!f.subject||q.subject===f.subject)&&(!f.topic||q.topic===f.topic)&&(!f.diff||q.difficulty===f.diff)&&(!f.bm||bms.includes(q.id))&&(!s||(q.q.en+' '+(q.q.ml||'')).toLowerCase().includes(s)));
  const pages=Math.max(1,Math.ceil(r.length/10));f.page=Math.min(f.page,pages-1);
  $('#list').innerHTML=`<p class="note">${r.length} ${t('questions')}</p>`+(r.slice(f.page*10,f.page*10+10).map(q=>this.card(q,bms)).join('')||`<p>${t('no_results')}</p>`)+
  `<div class="pager"><button class="btn sm" ${f.page?'':'disabled'} onclick="App.pg(-1)">‹ ${t('prev_page')}</button><span>${f.page+1}/${pages}</span><button class="btn sm" ${f.page<pages-1?'':'disabled'} onclick="App.pg(1)">${t('next_page')} ›</button></div>`},
 pg(d){this.f.page+=d;this.list();window.scrollTo(0,0)},
 card(q,bms){const ch=this.pk[q.id],rev=ch!=null,b=bms.includes(q.id);
  return `<article class="card"><div class="meta"><span class="tag">${t(SUBJ[q.subject])}</span><span class="tag">${esc(this.tname(q.topic))}</span><span class="tag d-${q.difficulty}">${t(q.difficulty)}</span><span class="tag src-${q.source}">${t(SRC[q.source])}${q.year?' '+q.year:''}${q.shift?' · '+esc(q.shift):''}</span>
  <button class="bm" onclick="App.bm('${q.id}')" aria-label="${t('bookmark')}" aria-pressed="${b}">${b?'★':'☆'}</button></div>
  <p class="qt">${esc(pick(q.q))}</p>${optsHtml(q,ch,rev,`App.ans('${q.id}',`)}${rev?`<div class="exp"><b>${t('explanation')}:</b> ${esc(pick(q.explanation))}</div>`:''}</article>`},
 ans(id,i){this.pk[id]=i;const q=Bank.all.find(x=>x.id===id),p=LS.g('pstat',{});p[id]=i===q.answer;LS.s('pstat',p);this.list()},
 bm(id){let b=LS.g('bm',[]);b=b.includes(id)?b.filter(x=>x!==id):[...b,id];LS.s('bm',b);this.list()},
 mocks(el){const ts=this.topics();
  el.innerHTML=`<h2>${t('nav_mocks')}</h2><div class="grid2">${['CBT-1','CBT-2'].map(s=>{const c=Exam.cfg[s],have=Bank.all.filter(q=>q.stage?.includes(s)).length;
   return `<div class="card"><h3>${s}</h3><p>${c.m+c.r+c.ga} Q · ${c.min} min<br>${t('subj_g')} ${c.ga} · ${t('subj_m')} ${c.m} · ${t('subj_r')} ${c.r}</p><p class="note">${t('questions_loaded')}: ${have}</p><a class="btn pri" href="#start/${s}">${t('start')}</a></div>`}).join('')}</div>
  <div class="card"><h3>${t('topic_test')}</h3><select id="ts" aria-label="${t('topic')}">${ts.map(x=>`<option value="${x.id}">${esc(pick(x.name))} (${Bank.all.filter(q=>q.topic===x.id).length})</option>`).join('')}</select><br><br>
  <select id="tn"><option>10</option><option>20</option><option>30</option></select><br><br><button class="btn pri" onclick="App.topicTest()">${t('start_test')}</button></div>`},
 topicTest(){const id=$('#ts').value,n=+$('#tn').value,qs=Exam.shuffle(Bank.all.filter(q=>q.topic===id)).slice(0,n);
  Exam.begin({title:this.tname(id),qs,mins:Math.max(5,Math.ceil(qs.length*0.9))})},
 results(el,id){const rs=LS.g('results',[]);
  if(id){const r=rs.find(x=>String(x.date)===id);if(r)return Results.render(r,el)}
  el.innerHTML=`<h2>${t('nav_results')}</h2>`+(rs.map(r=>`<a class="card" style="display:block;color:inherit;text-decoration:none" href="#result/${r.date}"><b>${esc(r.title)}</b> · ${new Date(r.date).toLocaleString()}<br>${t('score')}: <b>${r.score}/${r.max}</b> · ${t('accuracy')}: ${r.acc}%</a>`).join('')||`<p>${t('no_results')}</p>`)},
 settings(el){const imp=LS.g('imported',[]).length;
  el.innerHTML=`<h2>${t('nav_settings')}</h2><div class="card"><h3>${t('language')}</h3><select onchange="Lang.set(this.value)"><option value="en" ${Lang.cur==='en'?'selected':''}>English</option><option value="ml" ${Lang.cur==='ml'?'selected':''}>മലയാളം</option></select></div>
  <div class="card"><h3>${t('import')}</h3><p class="note">${t('import_hint')} (${imp})</p><input type="file" id="impf" accept=".json" aria-label="JSON file"><br><br><textarea id="imp" rows="6" placeholder='[{"id":"...","subject":"..."}]'></textarea><br><br><button class="btn pri" onclick="App.imp()">${t('import')}</button> <p id="impmsg" role="status"></p></div>
  <div class="card"><button class="btn" onclick="App.reset()">${t('reset')}</button></div>`;
  $('#impf').onchange=async e=>{$('#imp').value=await e.target.files[0].text()}},
 async imp(){try{let d=JSON.parse($('#imp').value);d=d.questions||d;if(!Array.isArray(d))throw 0;
   const old=LS.g('imported',[]),ids=new Set([...old,...Bank.all].map(q=>q.id));const add=d.filter(q=>Bank.valid(q)&&!ids.has(q.id)&&ids.add(q.id));
   LS.s('imported',old.concat(add));await Bank.load();$('#impmsg').textContent=`${add.length} ✔ / ${d.length-add.length} ✘`}catch{$('#impmsg').textContent=t('import_error')}},
 reset(){if(confirm(t('reset_confirm'))){['prog','pstat','bm','results','exam','imported'].forEach(k=>localStorage.removeItem(k));location.reload()}}};
