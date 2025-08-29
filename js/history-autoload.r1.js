// history-autoload.r1.js — carrega header+thumbs automaticamente se estiver numa página de histórico
(function(){
  function need(){ return /historico_/i.test(location.pathname) || document.querySelector('.hist-table'); }
  function has(srcSub){ return [...document.scripts].some(s=>s.src.includes(srcSub)); }
  function load(src){ return new Promise(res=>{ const s=document.createElement('script'); s.defer=true; s.src=src; s.onload=res; document.head.appendChild(s); }); }
  if(need()){
    const base = (document.currentScript && document.currentScript.src) ? new URL(document.currentScript.src, location.href) : null;
    const prefix = base ? base.pathname.replace(/\/[^\/]*$/,'/').replace(/^\//,'') : 'js/';
    const mk = (f)=> (base ? new URL(f, base).href : ('js/'+f));
    (async ()=>{
      if(!has('history-header.r1.js'))  await load(mk('history-header.r1.js'));
      if(!has('history-thumbs.r2.js')) await load(mk('history-thumbs.r2.js'));
    })();
  }
})();
