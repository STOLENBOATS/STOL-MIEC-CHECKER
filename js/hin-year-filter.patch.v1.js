// js/hin-year-filter.patch.v1.js
(function(){
  const MIN_YEAR = 1998;
  function normalizeYY(v){ const s=String(v||'').trim(); if(!/^\d{1,2}$/.test(s)) return []; const n=Number(s)%100; return [1900+n, 2000+n]; }
  function chooseYear(c){ const a=c.slice().sort((x,y)=>x-y).filter(y=>y>=MIN_YEAR); return a.find(y=>y>=2000) ?? a[0] ?? null; }
  function clean(text){
    if(!text) return text;
    text = text.replace(/\(alternativas([^)]+)\)/gi,(m,list)=>{ const ys=(list.match(/\d{4}/g)||[]).map(Number).filter(y=>y>=MIN_YEAR); return ys.length>1?`(alternativas ${ys.join(' ou ')})`:''; });
    text = text.replace(/(Ano\s+(?:prod\.|modelo)[^<]*?>\s*)<\/td>\s*<td[^>]*>\s*([^<]{1,4})\s*<\/td>/gi,(m,label,yy)=>{
      const cand=normalizeYY(yy).filter(y=>y>=MIN_YEAR); if(!cand.length) return m; const pick=chooseYear(cand);
      return `${label}</td><td>${yy} <span class="muted">→ Provável ${pick}${cand.length>1?' (alternativas '+cand.join(' ou ')+')':''}</span></td>`;
    });
    return text;
  }
  function patchBox(el){ if(!el) return; const h=el.innerHTML; const n=clean(h); if(n!==h) el.innerHTML=n; }
  function go(){ const box=document.getElementById('winForense'); if(box) patchBox(box); document.querySelectorAll('.forense,.result,.card').forEach(e=>{ if(e!==box) patchBox(e); }); }
  function init(){ const f=document.getElementById('winForm'); if(f) f.addEventListener('submit', ()=>setTimeout(go,40)); setTimeout(go,200); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();