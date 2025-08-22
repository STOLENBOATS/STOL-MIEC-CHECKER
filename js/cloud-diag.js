/* MIEC Cloud diagnostics — status + test record */
(function(){
  const statusEl = document.getElementById('cloudStatus');
  const testBtn  = document.getElementById('cloudTestBtn');
  function setStatus(text, cls){
    if(!statusEl) return; statusEl.textContent = text;
    statusEl.className = (statusEl.className.replace(/\b(ok|bad|warn|muted)\b/g,'') + ' ' + (cls||'')).trim();
  }
  async function updateStatus(){
    try{
      if(!window.supa || !window.supa.ready()){ setStatus('Cloud: OFF', 'bad'); return; }
      const u = await window.supa.getUser();
      if(u && u.user){ setStatus('Cloud: ON — ' + (u.user.email || 'sessão ativa'), 'ok'); }
      else { setStatus('Cloud: ON — sem sessão', 'warn'); }
    }catch(e){ setStatus('Cloud: erro', 'bad'); console.warn(e); }
  }
  async function doTest(){
    try{
      if(!window.supa || !window.supa.ready()) throw new Error('Supabase não configurado (abrir config.html).');
      const { user } = await window.supa.getUser();
      if(!user) throw new Error('Sem sessão. Faça login no topo.');
      const ts = new Date().toISOString();
      await window.supa.saveHIN({hin:'TEST-'+ts,result_ok:true,details:['diag',ts],pre1998:false,cert:false,photo_url:null});
      await window.supa.saveEngine({brand:'DIAG',payload:{ping:true,ts},result_ok:true,details:['diag',ts],photo_url:null});
      alert('✅ Teste gravado. Abra os Históricos para ver.');
      updateStatus();
    }catch(e){ alert('❌ Falha: '+(e.message||e)); }
  }
  if(testBtn){ testBtn.addEventListener('click', doTest); }
  setTimeout(updateStatus, 400);
  window.MIEC_updateCloudStatus = updateStatus;
})();