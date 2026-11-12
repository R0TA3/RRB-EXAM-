const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={g(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}},s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{alert('Browser storage full')}}};
const Lang={cur:LS.g('lang','en'),s:{},
 async load(){for(const l of['en','ml'])this.s[l]=await(await fetch('languages/'+l+'.json')).json();this.apply()},
 t(k){return this.s[this.cur]?.[k]??this.s.en?.[k]??k},
 set(l){this.cur=l;LS.s('lang',l);this.apply();window.App&&App.render(true)},
 apply(){document.documentElement.lang=this.cur;const b=$('#langBtn');if(b)b.textContent=this.cur==='en'?'മലയാളം':'English'}};
const t=k=>Lang.t(k);
const pick=o=>o?(o[Lang.cur]||o.en||''):'';
