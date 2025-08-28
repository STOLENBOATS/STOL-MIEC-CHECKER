// js/history-recorder-failsafe.v2.js
// Failsafe v2: garante gravação MESMO sem HistoryService, escrevendo no outbox local.

(function(){
  function ready(cb){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', cb, {once:true}); else cb(); }
  const OUTBOX_KEY = 'miec_sync_outbox_v1';

  function lsOK(){
    try{ const k='__miec_t__'; localStorage.setItem(k,'1'); localStorage.removeItem(k); return true; }catch{ return false; }
  }
  function writeOutbox(item){
    try{
      const arr = JSON.parse(localStorage.getItem(OUTBOX_KEY)||'[]');
      arr.push(item);
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(arr));
      console.log('[failsafe v2] outbox +1 →', arr.length, item.table||item.type);
      return true;
    }catch(e){
      console.warn('[failsafe v2] não consegui escrever no outbox:', e);
      return false;
    }
  }
  function pickIdent(){
    const bf = document.getElementById('brandFields');
    if (!bf) return '';
    const byId = bf.querySelector('input#ident,input[name=ident]');
    if (byId) return byId.value?.trim()||'';
    const any = Array.from(bf.querySelectorAll('input[type=text],input:not([type])')).map(i=>i.value?.trim()||'').filter(Boolean);
    return any[0]||'';
  }
  function normalize(s){ return (s||'').toString().trim(); }
  function appVersion(){ return (document.querySelector('footer .muted')?.innerText||'').trim() || 'v4.2'; }
  function device(){ try{ return navigator.userAgent.slice(0,190); }catch{ return 'UA'; } }

  function saveWinFS(){
    const win = normalize(document.getElementById('winInput')?.value);
    if (!win) return;
    const resTxt = (document.getElementById('winResult')?.innerText||'').trim();
    const cert   = !!document.getElementById('winCert')?.checked;
    const certN  = normalize(document.getElementById('certNumber')?.value);
    const issuer = normalize(document.getElementById('certIssuer')?.value);
    const payload = {
      ts: Date.now(),
      win, result: resTxt || '—', reason: '',
      photo: '',
      certificate: cert ? (certN||'✔') : '',
      issuer: issuer||'',
      version: appVersion(),
      device: device()
    };
    if (window.HistoryService?.saveWin){
      window.HistoryService.saveWin(payload);
      console.log('[failsafe v2] HistoryService.saveWin chamado.');
    } else if (lsOK()){
      writeOutbox({ table:'history_win', type:'win', ts:payload.ts, row:payload });
    }
    setTimeout(()=> window.MIEC_SYNC?.pushOutbox?.().catch(()=>{}), 500);
  }

  function saveMotorFS(){
    const brand = normalize(document.getElementById('brand')?.value);
    if (!brand) return;
    const ident = pickIdent();
    const resTxt = (document.getElementById('motorResult')?.innerText||'').trim();
    const payload = {
      ts: Date.now(),
      brand, ident,
      result: resTxt || '—', reason: '',
      photo:'', certificate:'', issuer:'',
      version: appVersion(), device: device()
    };
    if (window.HistoryService?.saveMotor){
      window.HistoryService.saveMotor(payload);
      console.log('[failsafe v2] HistoryService.saveMotor chamado.');
    } else if (lsOK()){
      writeOutbox({ table:'history_motor', type:'motor', ts:payload.ts, row:payload });
    }
    setTimeout(()=> window.MIEC_SYNC?.pushOutbox?.().catch(()=>{}), 500);
  }

  ready(function(){
    const wf = document.getElementById('winForm');
    const mf = document.getElementById('motorForm');
    if (wf) { wf.addEventListener('submit', ()=> setTimeout(saveWinFS, 650)); console.log('history-recorder-failsafe.v2(win)'); }
    if (mf) { mf.addEventListener('submit', ()=> setTimeout(saveMotorFS, 650)); console.log('history-recorder-failsafe.v2(motor)'); }
  });
})();