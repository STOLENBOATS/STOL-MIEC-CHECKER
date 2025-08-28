// js/history-recorder-catchall.v1.js
// "Catch-all" recorder: grava mesmo que submit não dispare.
// Observa mudanças nos resultados e cliques nos botões.

(function(){
  const OUTBOX_KEY = 'miec_sync_outbox_v1';
  function ready(cb){ if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', cb, {once:true}); else cb(); }
  function normalize(s){ return (s||'').toString().trim(); }
  function appVersion(){ return (document.querySelector('footer .muted')?.innerText||'').trim() || 'v4.2'; }
  function device(){ try{ return navigator.userAgent.slice(0,190); }catch{ return 'UA'; } }
  function lsOK(){ try{ const k='__t__'; localStorage.setItem(k,'1'); localStorage.removeItem(k); return true; }catch{ return false; } }
  function pickIdent(){
    const bf = document.getElementById('brandFields');
    if (!bf) return '';
    const byId = bf.querySelector('input#ident,input[name=ident]');
    if (byId) return normalize(byId.value);
    const any = Array.from(bf.querySelectorAll('input[type=text],input:not([type])')).map(i=>normalize(i.value)).filter(Boolean);
    return any[0]||'';
  }
  function writeOutbox(item){
    try{
      const arr = JSON.parse(localStorage.getItem(OUTBOX_KEY)||'[]'); arr.push(item);
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(arr));
      console.log('[catchall] outbox +1', item.table, '→', arr.length);
    }catch(e){ console.warn('[catchall] outbox fail', e); }
  }
  function push(){ try{ window.MIEC_SYNC?.pushOutbox?.(); }catch{} }

  function harvestWin(){
    const win = normalize(document.getElementById('winInput')?.value);
    if (!win) return null;
    const resTxt = normalize(document.getElementById('winResult')?.innerText)||'—';
    const cert   = !!document.getElementById('winCert')?.checked;
    const certN  = normalize(document.getElementById('certNumber')?.value);
    const issuer = normalize(document.getElementById('certIssuer')?.value);
    return {
      ts: Date.now(),
      win, result: resTxt, reason:'', photo:'',
      certificate: cert ? (certN||'✔') : '',
      issuer: issuer||'',
      version: appVersion(), device: device()
    };
  }
  function harvestMotor(){
    const brand = normalize(document.getElementById('brand')?.value);
    if (!brand) return null;
    const ident = pickIdent();
    const resTxt = normalize(document.getElementById('motorResult')?.innerText)||'—';
    return {
      ts: Date.now(),
      brand, ident, result: resTxt, reason:'', photo:'', certificate:'', issuer:'',
      version: appVersion(), device: device()
    };
  }

  // Guard debounce
  let lastWin='', lastMotor='';
  function changedWin(){
    const r = normalize(document.getElementById('winResult')?.innerText);
    if (r && r !== lastWin){ lastWin = r; return true; } return false;
  }
  function changedMotor(){
    const r = normalize(document.getElementById('motorResult')?.innerText);
    if (r && r !== lastMotor){ lastMotor = r; return true; } return false;
  }

  function saveWin(){
    const row = harvestWin(); if(!row) return;
    if (window.HistoryService?.saveWin) { window.HistoryService.saveWin(row); console.log('[catchall] HS.saveWin'); }
    else if (lsOK()) writeOutbox({ table:'history_win', type:'win', ts:row.ts, row });
    push();
  }
  function saveMotor(){
    const row = harvestMotor(); if(!row) return;
    if (window.HistoryService?.saveMotor) { window.HistoryService.saveMotor(row); console.log('[catchall] HS.saveMotor'); }
    else if (lsOK()) writeOutbox({ table:'history_motor', type:'motor', ts:row.ts, row });
    push();
  }

  function observeResults(){
    const wr = document.getElementById('winResult');
    const mr = document.getElementById('motorResult');
    const mo = new MutationObserver(()=>{
      if (changedWin()) { console.log('[catchall] winResult changed'); setTimeout(saveWin, 150); }
      if (changedMotor()) { console.log('[catchall] motorResult changed'); setTimeout(saveMotor, 150); }
    });
    if (wr) mo.observe(wr, {childList:true, subtree:true, characterData:true});
    if (mr) mo.observe(mr, {childList:true, subtree:true, characterData:true});
  }

  function hookButtons(){
    const wb = document.querySelector('#winForm button[type=submit], #winForm .btn.primary');
    const mb = document.querySelector('#motorForm button[type=submit], #motorForm .btn.primary');
    if (wb) wb.addEventListener('click', ()=> setTimeout(()=>{ console.log('[catchall] win click'); saveWin(); }, 700), {capture:true});
    if (mb) mb.addEventListener('click', ()=> setTimeout(()=>{ console.log('[catchall] motor click'); saveMotor(); }, 700), {capture:true});
  }

  ready(function(){
    console.log('history-recorder-catchall.v1 ativo.');
    observeResults();
    hookButtons();
  });
})();
