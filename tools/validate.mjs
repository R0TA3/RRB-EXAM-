// Usage: node tools/validate.mjs   (validates every pack in data/manifest.json)
import fs from 'fs';
const man=JSON.parse(fs.readFileSync('data/manifest.json','utf8'));
const syl=JSON.parse(fs.readFileSync('data/syllabus.json','utf8'));
const topics=new Map(syl.subjects.flatMap(s=>s.topics.map(t=>[t.id,s.id])));
const ids=new Set();let n=0,err=0;const bad=(f,i,m)=>{err++;console.error(`${f}#${i}: ${m}`)};
for(const f of man.packs){let d;try{d=JSON.parse(fs.readFileSync('data/'+f,'utf8'))}catch(e){bad(f,'-','unreadable/invalid JSON');continue}
 (d.questions||d).forEach((q,i)=>{n++;
  if(!/^[\w.-]+$/.test(q.id||''))return bad(f,i,'bad id');
  if(ids.has(q.id))bad(f,q.id,'duplicate id');ids.add(q.id);
  if(!topics.has(q.topic))bad(f,q.id,'unknown topic '+q.topic);
  else if(topics.get(q.topic)!==q.subject)bad(f,q.id,'topic/subject mismatch');
  if(!['easy','medium','hard'].includes(q.difficulty))bad(f,q.id,'difficulty');
  if(!['original','pyq-verified','official'].includes(q.source))bad(f,q.id,'source');
  if(q.source!=='original'&&!q.reference)bad(f,q.id,'verified/official items need a reference');
  if(!q.q?.en||q.options?.en?.length!==4)bad(f,q.id,'question/options (en)');
  if(q.options?.ml&&q.options.ml.length!==4)bad(f,q.id,'ml options length');
  if(!q.q?.ml)console.warn(`${q.id}: missing Malayalam question (will fall back to English)`);
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)bad(f,q.id,'answer');
  if(!q.explanation?.en)bad(f,q.id,'explanation');
  if(!Array.isArray(q.stage)||!q.stage.length)bad(f,q.id,'stage')})}
console.log(`${n} questions, ${err} errors`);process.exit(err?1:0);
