// js/history-probe.v1.js
(function(){
  const OUTBOX_KEY = 'miec_sync_outbox_v1';
  const g = window;
  function q(sel, ctx=document){ return ctx.querySelector(sel); }
  function norm(x){ return (x||'').toString().trim(); }
  function readOutbox(){ try{ return JSON.parse(localStorage.getItem(OUTBOX_KEY)||'[]'); }catch{ return []; } }
  function dump(){
    const o = {
      winForm: !!q('#winForm'),
      winBtn: !!q('#winForm button[type=submit], #winForm .btn.primary'),
      winResult: !!q('#winResult'),
      motorForm: !!q('#motorForm'),
      motorBtn: !!q('#motorForm button[type=submit], #motorForm .btn.primary'),
      motorResult: !!q('#motorResult'),
      outbox_len: readOutbox().length,
      hasHistoryService: !!g.HistoryService,
      hasMIEC_SYNC: !!g.MIEC_SYNC
    };
    console.table(o);
    return o;
  }
  function logEvent(name, data){ try{ console.log('[PROBE]', name, data||''); }catch{} }
  function watch(){
    ['winForm','motorForm'].forEach(id=>{
      const el = document.getElementById(id);
      if (el){ el.addEventListener('submit', e=>logEvent('submit:'+id), {capture:true}); }
    });
    const wb = q('#winForm button[type=submit], #winForm .btn.primary');
    const mb = q('#motorForm button[type=submit], #motorForm .btn.primary');
    wb && wb.addEventListener('click', ()=>logEvent('click:winButton'), {capture:true});
    mb && mb.addEventListener('click', ()=>logEvent('click:motorButton'), {capture:true});
    const wr = q('#winResult'), mr = q('#motorResult');
    if (wr){ new MutationObserver(()=>logEvent('mut:winResult', wr.innerText.slice(0,80))).observe(wr,{childList:true,subtree:true,characterData:true}); }
    if (mr){ new MutationObserver(()=>logEvent('mut:motorResult', mr.innerText.slice(0,80))).observe(mr,{childList:true,subtree:true,characterData:true}); }
    console.log('[PROBE] watchers armed.');
  }
  g.MIEC_PROBE = { dump, outbox(){ return readOutbox(); }, clear(){ localStorage.removeItem(OUTBOX_KEY); console.warn('[PROBE] outbox limpo'); } };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>{ dump(); watch(); }, {once:true});
  else { dump(); watch(); }
})();