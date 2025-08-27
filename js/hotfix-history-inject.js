// MIEC — hotfix-history-inject.js (H1)
// Copia último registo de hist_win / hist_motor para HistoryService após submit.
(function(){
  function parse(v, fb){ try { return JSON.parse(v); } catch { return fb; } }
  const mapWin = (it)=>{
    if(!it) return null;
    const ok = (typeof it.ok === 'boolean') ? it.ok : undefined;
    return {
      ts: it.ts || Date.now(),
      win: (it.win || it.hin || '').toString().toUpperCase(),
      result: it.result || (ok===true ? 'Válido' : ok===false ? 'Inválido' : ''),
      reason: it.reason || it.details || '',
      certificate: it.certificate || it.certNumber || '',
      issuer: it.issuer || it.certIssuer || '',
      photo: it.photo || '',
      version: window.APP_VERSION,
      device: navigator.userAgent
    };
  };
  const mapMotor = (it)=>{
    if(!it) return null;
    const ok = (typeof it.ok === 'boolean') ? it.ok : undefined;
    const ident = it.ident || [it.model, it.code, it.sn, it.serial].filter(Boolean).join(' ').trim();
    return {
      ts: it.ts || Date.now(),
      brand: it.brand || it.marca || '',
      ident,
      result: it.result || (ok===true ? 'Válido' : ok===false ? 'Inválido' : ''),
      reason: it.reason || it.details || '',
      certificate: it.certificate || '',
      issuer: it.issuer || '',
      photo: it.photo || '',
      version: window.APP_VERSION,
      device: navigator.userAgent
    };
  };

  function afterSubmitCopy(key, mapper, saver){
    setTimeout(()=>{
      try {
        const arr = parse(localStorage.getItem(key), []) || [];
        const last = arr[arr.length - 1];
        const row = mapper(last);
        if(row && window.HistoryService && typeof HistoryService[saver] === 'function'){
          HistoryService[saver](row);
          console.debug('[MIEC Hotfix H1]', saver, 'copied from', key, row);
        } else {
          console.debug('[MIEC Hotfix H1] nothing to do (missing data or HistoryService)');
        }
      } catch(e){
        console.warn('[MIEC Hotfix H1] error:', e);
      }
    }, 300);
  }

  function boot(){
    const wf = document.getElementById('winForm');
    if(wf && !wf.__miec_h1){
      wf.__miec_h1 = true;
      wf.addEventListener('submit', function(){ afterSubmitCopy('hist_win', mapWin, 'saveWin'); });
    }
    const mf = document.getElementById('motorForm');
    if(mf && !mf.__miec_h1){
      mf.__miec_h1 = true;
      mf.addEventListener('submit', function(){ afterSubmitCopy('hist_motor', mapMotor, 'saveMotor'); });
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();