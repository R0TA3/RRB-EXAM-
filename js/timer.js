const Timer={h:null,
 start(end,tick,done){this.stop();const f=()=>{const r=Math.max(0,Math.round((end-Date.now())/1000));tick(r);if(r<=0){this.stop();done()}};f();this.h=setInterval(f,500)},
 stop(){clearInterval(this.h)},
 fmt(s){return[Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,'0')).join(':')}};
