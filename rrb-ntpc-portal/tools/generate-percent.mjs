// Generates ORIGINAL bilingual percentage questions. Usage: node tools/generate-percent.mjs 500 001
// Creates data/mathematics/gen-percent-<tag>.json and registers it in data/manifest.json.
import fs from 'fs';
const count=+process.argv[2]||100,tag=process.argv[3]||'001';
let seed=+tag||1;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/2**32;
const ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));const out=[];
for(let i=0;i<count;i++){const p=[5,8,10,12,15,16,20,25,30,35,40,45,60,75][ri(0,13)],base=ri(2,60)*20,ans=p*base/100;
 const set=new Set([ans]);while(set.size<4){const d=ri(1,6)*(rnd()<.5?-1:1);if(ans+d>0)set.add(ans+d)}
 const o=[...set].sort(()=>rnd()-.5),a=o.indexOf(ans);
 out.push({id:`gen-pct-${tag}-${i+1}`,subject:'mathematics',topic:'percentage',stage:['CBT-1','CBT-2'],difficulty:p%10===0?'easy':'medium',source:'original',year:null,shift:null,
  q:{en:`What is ${p}% of ${base}?`,ml:`${base}-ന്റെ ${p}% എത്ര?`},options:{en:o.map(String),ml:o.map(String)},answer:a,
  explanation:{en:`${p}/100 × ${base} = ${ans}.`,ml:`${p}/100 × ${base} = ${ans}.`}})}
const file=`mathematics/gen-percent-${tag}.json`;fs.writeFileSync('data/'+file,JSON.stringify({pack:`gen-percent-${tag}`,questions:out}));
const m=JSON.parse(fs.readFileSync('data/manifest.json','utf8'));if(!m.packs.includes(file))m.packs.push(file);
fs.writeFileSync('data/manifest.json',JSON.stringify(m,null,1));console.log('wrote',file,out.length);
