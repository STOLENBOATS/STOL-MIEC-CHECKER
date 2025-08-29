/*! history-fix.r12-2g.js — deduplica header nas páginas de histórico (mínimo) */
(()=>{
  if(window.__MIEC_HISTORY_FIX__) return; window.__MIEC_HISTORY_FIX__=true;
  const init=()=>{
    const header=document.querySelector('.app-header .header-actions')||document.querySelector('.header-actions');
    if(!header) return;
    const seen=new Set();
    Array.from(header.children).forEach(el=>{
      const t=(el.textContent||'').trim().toLowerCase();
      const k=t+'|'+(el.getAttribute('href')||'')+'|'+(el.id||'');
      if(seen.has(k)) el.remove(); else seen.add(k);
    });
    const themes=document.querySelectorAll('#themeBtn'); if(themes.length>1) themes.forEach((b,i)=>{ if(i) b.remove(); });
    console.log('[history-fix r12-2g] ativo');
  };
  (document.readyState==='loading')?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
