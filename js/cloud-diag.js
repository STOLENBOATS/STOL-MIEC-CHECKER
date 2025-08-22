/* MIEC Cloud diagnostics — status + test record buttons */
(function(){
  function $(s){ return document.querySelector(s); }
  const statusEl = document.getElementById('cloudStatus');
  const testBtn  = document.getElementById('cloudTestBtn');

  function setStatus(text, cls){
    if(!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = (statusEl.className.replace(/\b(ok|bad|warn|muted)\b/g,'') + ' ' + (cls||'')).trim();
  }

  async function updateStatus(){
    try{
      if(!window.supa || !window.supa.ready()){ setStatus('Cloud: OFF', 'bad'); return; }
      const u = await window.supa.getUser();
      if(u && u.user){
        setStatus('Cloud: ON — ' + (u.user.email || 'sessão ativa'), 'ok');
      }else{
        setStatus('Cloud: ON — sem sessão', 'warn');
      }
    }catch(e){
      console.warn('status error', e);
      setStatus('Cloud: erro', 'bad');
    }
  }

  async function doTest(){
    try{
      if(!window.supa || !window.supa.ready()) throw new Error('Supabase não configurado (abra config.html e guarde URL/Key).');
      const { user } = await window.supa.getUser();
      if(!user) throw new Error('Sem sessão. Faça login no topo (email + Entrar).');
      const ts = new Date().toISOString();
      const details = ['diagnostic ping', ts];
      // write HIN
      await window.supa.saveHIN({
        hin: 'TEST-' + ts,
        result_ok: true,
        details: details,
        pre1998: false,
        cert: false,
        photo_url: null
      });
      // write Engine
      await window.supa.saveEngine({
        brand: 'DIAG',
        payload: { ping: true, ts },
        result_ok: true,
        details: details,
        photo_url: null
      });
      alert('✅ Teste gravado.\nAbra "Histórico HIN" e "Histórico Motores" para confirmar.');
      updateStatus();
    }catch(e){
      console.error(e);
      alert('❌ Falha no teste: ' + (e.message||e));
    }
  }

  // wire
  if(testBtn){ testBtn.addEventListener('click', doTest); }
  setTimeout(updateStatus, 400);
  window.MIEC_updateCloudStatus = updateStatus; // opcional
})();