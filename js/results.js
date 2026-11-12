const Results={
 compute(st){const per={};let c=0,w=0,u=0;
  st.qs.forEach((q,i)=>{const p=per[q.subject]??={c:0,w:0,u:0,n:0};p.n++;const a=st.ans[i];
   if(a==null){u++;p.u++}else if(a===q.answer){c++;p.c++}else{w++;p.w++}});
  const sc=(c,w)=>+(c-w/3).toFixed(2);
  Object.values(per).forEach(p=>{p.score=sc(p.c,p.w);p.acc=p.c+p.w?Math.round(p.c/(p.c+p.w)*100):0});
  return{title:st.title,date:Date.now(),n:st.qs.length,c,w,u,score:sc(c,w),max:st.qs.length,acc:c+w?Math.round(c/(c+w)*100):0,per,qs:st.qs,ans:st.ans}},
 render(r,el){
  const tile=(v,k)=>`<div class="card stat"><b>${v}</b><span>${t(k)}</span></div>`;
  const rows=Object.entries(r.per).map(([k,p])=>`<tr><td>${t(SUBJ[k])}</td><td>${p.n}</td><td>${p.c}</td><td>${p.w}</td><td>${p.u}</td><td>${p.score}</td><td>${p.acc}%</td></tr>`).join('');
  el.innerHTML=`<h2>${esc(r.title)} — ${t('result')}</h2>
  <div class="grid4">${tile(r.score+' / '+r.max,'score')}${tile(r.acc+'%','accuracy')}${tile(r.c,'correct')}${tile(r.w,'wrong')}${tile(r.u,'unanswered')}</div>
  <p class="note">+1 / −⅓ / 0</p>
  <h3>${t('subject_wise')}</h3><div class="card scroll"><table><tr><th></th><th>#</th><th>✔</th><th>✘</th><th>–</th><th>${t('score')}</th><th>${t('accuracy')}</th></tr>${rows}</table></div>
  <h3>${t('review')}</h3>`+r.qs.map((q,i)=>{const a=r.ans[i],o=Bank.opts(q);
   const st=a==null?'unanswered':a===q.answer?'correct':'wrong';
   return `<article class="card"><div class="meta"><b>Q${i+1}</b><span class="tag">${t(SUBJ[q.subject])}</span><span class="tag">${t(st)}</span><span class="tag src-${q.source}">${t(SRC[q.source])}${q.year?' '+q.year:''}</span></div>
   <p class="qt">${esc(pick(q.q))}</p>${optsHtml(q,a,true)}
   <p>${t('your_answer')}: <b>${a==null?'—':'ABCD'[a]}</b> · ${t('correct_answer')}: <b>${'ABCD'[q.answer]}. ${esc(o[q.answer])}</b></p>
   <div class="exp"><b>${t('explanation')}:</b> ${esc(pick(q.explanation))}</div></article>`}).join('')}};
