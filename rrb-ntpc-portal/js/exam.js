/* CBT engine. Nothing in this UI reveals answers/marks until finish(). */
const Exam={st:null,
 cfg:{'CBT-1':{ga:40,m:30,r:30,min:90},'CBT-2':{ga:50,m:35,r:35,min:90}},
 shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a},
 startMock(stage){const c=this.cfg[stage];if(!c){location.hash='#home';return}
  const by=s=>this.shuffle(Bank.all.filter(q=>q.subject===s&&(q.stage||[]).includes(stage)));
  const qs=[...by('mathematics').slice(0,c.m),...by('reasoning').slice(0,c.r),...by('general-awareness').slice(0,c.ga)];
  this.begin({title:stage,qs,mins:c.min,need:c.m+c.r+c.ga})},
 begin({title,qs,mins,need}){if(!qs.length){alert(t('no_results'));location.hash='#home';return}
  this.st={title,qs,mins,need:need||qs.length,ans:{},marked:{},seen:{0:1},idx:0,end:Date.now()+mins*60000};this.save();
  if(location.hash==='#exam')App.render();else location.hash='#exam'},
 save(){LS.s('exam',this.st)},
 resume(){if(LS.g('exam',null)){this.st=null;location.hash='#exam'}},
 render(el){if(!this.st)this.st=LS.g('exam',null);const s=this.st;if(!s){location.hash='#home';return}
  el.innerHTML=`<div class="ebar"><b>${esc(s.title)}</b><span class="timer" id="tm" role="timer">--:--:--</span>
  <span><button class="btn sm" onclick="Lang.set(Lang.cur==='en'?'ml':'en')">${Lang.cur==='en'?'മലയാളം':'English'}</button> <button class="btn sm pri" onclick="Exam.ask()">${t('finish')}</button></span></div>
  ${s.qs.length<s.need?`<p class="warn">${t('shortfall').replace('{a}',s.qs.length).replace('{b}',s.need)}</p>`:''}<div id="eb"></div>`;
  Timer.start(s.end,r=>{const e=$('#tm');if(e){e.textContent=Timer.fmt(r);e.classList.toggle('low',r<300)}},()=>this.finish());
  this.paint()},
 paint(){const s=this.st,q=s.qs[s.idx],n=s.qs.length,a=s.ans[s.idx];
  let na=0,nm=0,nv=0,nn=0;s.qs.forEach((_,i)=>{const A=s.ans[i]!=null;if(A)na++;if(s.marked[i])nm++;if(!s.seen[i])nv++;else if(!A)nn++});
  const subs=[...new Set(s.qs.map(x=>x.subject))];
  $('#eb').innerHTML=`<div class="tabs">${subs.map(k=>`<button class="${q.subject===k?'on':''}" onclick="Exam.go(${s.qs.findIndex(x=>x.subject===k)})">${t(SUBJ[k])}</button>`).join('')}</div>
  <div class="elay"><section class="card"><div class="meta"><b>${t('q')} ${s.idx+1} / ${n}</b><span class="tag">${t(SUBJ[q.subject])}</span></div>
  <p class="qt">${esc(pick(q.q))}</p>
  <div class="opts">${Bank.opts(q).map((o,i)=>`<button class="opt ${a===i?'sel':''}" onclick="Exam.sel(${i})" aria-pressed="${a===i}"><b>${'ABCD'[i]}</b><span>${esc(o)}</span></button>`).join('')}</div>
  <div class="acts"><button class="btn" onclick="Exam.go(${Math.max(0,s.idx-1)})">‹ ${t('prev')}</button>
  <button class="btn" onclick="Exam.clear()">${t('clear')}</button>
  <button class="btn" onclick="Exam.markNext()">${t('mark_next')}</button>
  <button class="btn pri" onclick="Exam.go(${Math.min(n-1,s.idx+1)})">${t('save_next')} ›</button></div></section>
  <aside class="card pal"><div class="leg"><span>🟩 ${t('answered')}: ${na}</span><span>🟥 ${t('not_answered')}: ${nn}</span><span>⬜ ${t('not_visited')}: ${nv}</span><span>🟣 ${t('marked')}: ${nm}</span></div>
  <div class="pg">${s.qs.map((_,i)=>{const A=s.ans[i]!=null,M=s.marked[i];const c=(M?'pm ':'')+(A?'pa':s.seen[i]?'pn':'');return`<button class="pb ${c} ${i===s.idx?'cur':''}" onclick="Exam.go(${i})" aria-label="Q${i+1}">${i+1}</button>`}).join('')}</div></aside></div>`},
 go(i){this.st.idx=i;this.st.seen[i]=1;this.save();this.paint();window.scrollTo(0,0)},
 sel(i){this.st.ans[this.st.idx]=i;this.save();this.paint()},
 clear(){delete this.st.ans[this.st.idx];this.save();this.paint()},
 markNext(){this.st.marked[this.st.idx]=1;this.go(Math.min(this.st.qs.length-1,this.st.idx+1))},
 ask(){const s=this.st,n=s.qs.length,a=Object.keys(s.ans).length,m=Object.keys(s.marked).length;
  const d=document.createElement('div');d.className='modal';
  d.innerHTML=`<div class="card" role="dialog" aria-modal="true"><h3>${t('confirm_submit')}</h3><p>${t('answered')}: ${a} · ${t('not_answered')}: ${n-a} · ${t('marked')}: ${m}</p>
  <div class="row"><button class="btn" onclick="this.closest('.modal').remove()">${t('cancel')}</button><button class="btn pri" onclick="Exam.finish()">${t('yes_submit')}</button></div></div>`;document.body.append(d)},
 finish(){if(!this.st)return;document.querySelectorAll('.modal').forEach(m=>m.remove());Timer.stop();
  const r=Results.compute(this.st),h=LS.g('results',[]);h.unshift(r);LS.s('results',h.slice(0,10));
  localStorage.removeItem('exam');this.st=null;location.hash='#result/'+r.date}};
