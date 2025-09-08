// js/sync-bootstrap.js — r13
(function(){
  // Starts HistoryService autosync as soon as there is a Supabase session.
  function startSyncIfReady(){
    try{
      const cfg = window.MIEC_CONFIG || {};
      if (!cfg.AUTO_SYNC) return;
      if (!window.supabase || !window.supabaseClient) return;
      window.supabaseClient.auth.getSession().then(({ data })=>{
        if (data && data.session && window.HistoryService && typeof HistoryService.startAutoSync==='function'){
          try { HistoryService.startAutoSync(); console.log('[sync-bootstrap] AutoSync started'); }
          catch(e){ console.warn('[sync-bootstrap] startAutoSync failed', e); }
        }
      });
    }catch(e){ console.warn('[sync-bootstrap] error', e); }
  }
  // Try at DOM ready and again after auth events
  if (document.readyState === 'complete' || document.readyState === 'interactive') startSyncIfReady();
  else document.addEventListener('DOMContentLoaded', startSyncIfReady);
  // Re-run on auth state changes
  if (window.supabaseClient && window.supabaseClient.auth){
    try {
      window.supabaseClient.auth.onAuthStateChange((_event, _session)=> startSyncIfReady());
    } catch(e){}
  }
})();