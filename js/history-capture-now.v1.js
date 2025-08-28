// js/history-capture-now.v1.js
(function(){
  function $(sel, ctx=document){ return ctx.querySelector(sel); }
  function val(id){ const e=$(id); return (e && (e.value||'')).toString().trim(); }
  function txt(id){ const e=$(id); return (e && (e.innerText||e.textContent)||'').toString().trim(); }
  function appVersion(){ return (document.querySelector('footer .muted')?.innerText||'').trim() || 'v4.2'; }
  function device(){ try{ return navigator.userAgent.slice(0,190); }catch{ return 'UA'; } }
  const OUTBOX_KEY = 'miec_sync_outbox_v1';

  function writeOutbox(table, row){
    try{
      const arr = JSON.parse(localStorage.getItem(OUTBOX_KEY)||'[]');
      arr.push({ table, type: table.includes('motor')?'motor':'win', ts: row.ts, row });
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(arr));
      console.log('[capture-now] outbox +1', table, '→', arr.length, row);
    }catch(e){ console.warn('[capture-now] outbox fail', e); }
  }
  function pickIdent(){
    const bf = $('#brandFields'); if(!bf) return '';
    const by = bf.querySelector('input#ident,input[name=ident]'); if(by) return (by.value||'').trim();
    const any = Array.from(bf.querySelectorAll('input[type=text],input:not([type])')).map(i=>i.value?.trim()||'').filter(Boolean);
    return any[0]||'';
  }

  function saveWinNow(){
    const win = val('#winInput'); if(!win) return;
    const payload = {
      ts: Date.now(),
      win,
      result: txt('#winResult') || '—',
      reason: '',
      photo: '',
      certificate: $('#winCert')?.checked ? (val('#certNumber')||'✔') : '',
      issuer: val('#certIssuer'),
      version: appVersion(),
      device: device()
    };
    if (window.HistoryService?.saveWin){
      window.HistoryService.saveWin(payload);
      console.log('[capture-now] HistoryService.saveWin(payload)');
    } else {
      writeOutbox('history_win', payload);
    }
    setTimeout(()=> window.MIEC_SYNC?.pushOutbox?.().catch(()=>{}), 500);
  }

  function saveMotorNow(){
    const brand = val('#brand'); if(!brand) return;
    const payload = {
      ts: Date.now(),
      brand, ident: pickIdent(),
      result: txt('#motorResult') || '—',
      reason: '', photo:'', certificate:'', issuer:'',
      version: appVersion(), device: device()
    };
    if (window.HistoryService?.saveMotor){
      window.HistoryService.saveMotor(payload);
      console.log('[capture-now] HistoryService.saveMotor(payload)');
    } else {
      writeOutbox('history_motor', payload);
    }
    setTimeout(()=> window.MIEC_SYNC?.pushOutbox?.().catch(()=>{}), 500);
  }

  function arm(){
    const winBtn = document.querySelector('#winForm button[type=submit], #winForm .btn.primary');
    const motBtn = document.querySelector('#motorForm button[type=submit], #motorForm .btn.primary');
    if (winBtn && !winBtn.__cap){
      winBtn.__cap = true;
      winBtn.addEventListener('click', ()=> setTimeout(saveWinNow, 900), {capture:true});
      console.log('[capture-now] ligado no botão WIN');
    }
    if (motBtn && !motBtn.__cap){
      motBtn.__cap = true;
      motBtn.addEventListener('click', ()=> setTimeout(saveMotorNow, 900), {capture:true});
      console.log('[capture-now] ligado no botão MOTOR');
    }
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', arm, {once:true}); else arm();
})();