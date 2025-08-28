// js/history-recorder-failsafe.v1.js
// Failsafe: se os recorders "oficiais" não dispararem, este garante gravação mínima.
// Lê valores do formulário após o submit e chama HistoryService.save*.

(function(){
  function ready(cb){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', cb); else cb(); }

  function pickIdent(){
    // tenta encontrar um campo "ident" dentro de #brandFields (é dinâmico por marca)
    const bf = document.getElementById('brandFields');
    if (!bf) return '';
    const byId = bf.querySelector('input#ident,input[name=ident]');
    if (byId) return byId.value?.trim()||'';
    // senão, primeiro input de texto com valor
    const any = Array.from(bf.querySelectorAll('input[type=text],input:not([type])')).map(i=>i.value?.trim()||'').filter(Boolean);
    return any[0]||'';
  }

  function normalize(s){ return (s||'').toString().trim(); }

  function saveWinFS(){
    try{
      const win = normalize(document.getElementById('winInput')?.value);
      if (!win) return;
      const resTxt = (document.getElementById('winResult')?.innerText||'').trim();
      const cert  = !!document.getElementById('winCert')?.checked;
      const certN = normalize(document.getElementById('certNumber')?.value);
      const issuer= normalize(document.getElementById('certIssuer')?.value);
      const payload = {
        ts: Date.now(),
        win,
        result: resTxt || '—',
        reason: '',
        photo: '',       // os uploaders reais tratam disto; aqui é failsafe
        certificate: cert ? (certN||'✔') : '',
        issuer: issuer||'',
        version: (document.querySelector('footer .muted')?.innerText||'').trim() || 'v4.2',
        device: navigator.userAgent.slice(0,190)
      };
      if (window.HistoryService?.saveWin){
        window.HistoryService.saveWin(payload);
        console.log('[failsafe] saveWin → outbox');
      } else {
        console.warn('[failsafe] HistoryService.saveWin inexistente');
      }
    }catch(e){ console.warn('[failsafe] saveWin erro', e); }
  }

  function saveMotorFS(){
    try{
      const brand = normalize(document.getElementById('brand')?.value);
      if (!brand) return;
      const ident = pickIdent();
      const resTxt = (document.getElementById('motorResult')?.innerText||'').trim();
      const payload = {
        ts: Date.now(),
        brand, ident,
        result: resTxt || '—',
        reason: '',
        photo: '',
        certificate: '',
        issuer: '',
        version: (document.querySelector('footer .muted')?.innerText||'').trim() || 'v4.2',
        device: navigator.userAgent.slice(0,190)
      };
      if (window.HistoryService?.saveMotor){
        window.HistoryService.saveMotor(payload);
        console.log('[failsafe] saveMotor → outbox');
      } else {
        console.warn('[failsafe] HistoryService.saveMotor inexistente');
      }
    }catch(e){ console.warn('[failsafe] saveMotor erro', e); }
  }

  ready(function(){
    const wf = document.getElementById('winForm');
    const mf = document.getElementById('motorForm');
    if (wf){
      wf.addEventListener('submit', ()=> setTimeout(saveWinFS, 700));
      console.log('history-recorder-failsafe(win) ativo.');
    }
    if (mf){
      mf.addEventListener('submit', ()=> setTimeout(saveMotorFS, 700));
      console.log('history-recorder-failsafe(motor) ativo.');
    }
  });
})();