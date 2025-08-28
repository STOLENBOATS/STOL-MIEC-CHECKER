// js/history-debug-overlay.v1.js
// Painel de debug: mostra sessão, outbox, e dá botões (push/pull/sync).
// Também "wrapa" o HistoryService para logar as chamadas.

(function(){
  const OUTBOX_KEY = 'miec_sync_outbox_v1';
  function readOutbox(){ try{ return JSON.parse(localStorage.getItem(OUTBOX_KEY)||'[]'); }catch{ return []; } }
  function byId(id){ return document.getElementById(id); }
  function el(tag, cls, html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
  function css(){ return `.miec-debug{position:fixed;right:8px;bottom:8px;background:#111;color:#fff;padding:10px 12px;border-radius:10px;font:12px/1.3 system-ui,Segoe UI,Arial;z-index:99999;box-shadow:0 12px 30px rgba(0,0,0,.45);} .miec-debug b{font-weight:600} .miec-debug button{margin:2px 4px;padding:4px 8px;border-radius:6px;border:1px solid #333;background:#222;color:#fff;cursor:pointer} .miec-debug .row{margin:4px 0} .miec-debug .ok{color:#6f6} .miec-debug .err{color:#f66}`; }
  function mount(){
    if (byId('miecDebug')) return;
    const style=el('style'); style.textContent=css(); document.head.appendChild(style);
    const box=el('div','miec-debug'); box.id='miecDebug';
    box.innerHTML = `
      <div class="row"><b>DEBUG</b> • outbox: <span id="dbgCount">0</span></div>
      <div class="row">sessão: <span id="dbgSess" class="err">off</span></div>
      <div class="row">
        <button id="dbgPush">push</button>
        <button id="dbgPull">pull</button>
        <button id="dbgSync">sync</button>
        <button id="dbgShow">ver</button>
      </div>`;
    document.body.appendChild(box);
    byId('dbgPush').onclick = ()=> window.MIEC_SYNC?.pushOutbox?.();
    byId('dbgPull').onclick = ()=> window.MIEC_SYNC?.pullAll?.();
    byId('dbgSync').onclick = ()=> window.MIEC_SYNC?.syncNow?.();
    byId('dbgShow').onclick = ()=> { console.log('[debug outbox]', readOutbox()); alert('Veja a consola para o outbox.'); };
  }
  function wrapHistory(){
    const HS = window.HistoryService; if(!HS) return;
    if (HS.__wrapped) return;
    ['saveWin','saveMotor'].forEach(fn=>{
      if (typeof HS[fn]==='function'){
        const orig = HS[fn].bind(HS);
        HS[fn] = (o)=>{ console.log('[debug] HistoryService.'+fn, o); try{ return orig(o); } finally { setTimeout(()=>update(),300); } }
      }
    });
    HS.__wrapped = true;
  }
  async function update(){
    const cnt = readOutbox().length;
    const cEl = byId('dbgCount'); if (cEl) cEl.textContent=String(cnt);
    try{
      const sb = window.MIEC_SYNC?.client || window.supabaseClient;
      let ok=false;
      if (sb){ const r = await sb.auth.getSession(); ok=!!r?.data?.session; }
      const sEl = byId('dbgSess'); if (sEl){ sEl.textContent = ok?'on':'off'; sEl.className = ok?'ok':'err'; }
    }catch{}
  }
  function boot(){
    mount(); wrapHistory(); update();
    setInterval(update, 2000);
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();