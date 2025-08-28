// js/auto-sync.patch.v1.js
(function(){
  function onLoad(cb){ 
    if (document.readyState === 'complete') cb();
    else window.addEventListener('load', cb, { once:true });
  }
  onLoad(async function boot(){
    let tries = 0;
    while (!(window.MIEC_SYNC && window.MIEC_SYNC.client) && tries < 40){
      await new Promise(r=>setTimeout(r,250)); tries++;
    }
    const sb = window.MIEC_SYNC?.client || window.supabaseClient;
    if (!sb) { console.warn('[auto-sync] sem cliente Supabase'); return; }

    try {
      const { data:{ session } } = await sb.auth.getSession();
      if (session && window.HistoryService?.startAutoSync) HistoryService.startAutoSync();
      sb.auth.onAuthStateChange((_ev, sess)=>{
        if (sess && window.HistoryService?.startAutoSync) HistoryService.startAutoSync();
      });
    } catch(e) { console.warn('[auto-sync] getSession falhou:', e); }

    const hs = window.HistoryService || {};
    if (typeof hs.saveWin === 'function' && !hs.__patched){
      const ow = hs.saveWin.bind(hs), om = hs.saveMotor.bind(hs);
      hs.saveWin   = o => { const r = ow(o);   setTimeout(()=>window.MIEC_SYNC?.pushOutbox().catch(()=>{}), 800); return r; };
      hs.saveMotor = o => { const r = om(o); setTimeout(()=>window.MIEC_SYNC?.pushOutbox().catch(()=>{}), 800); return r; };
      hs.__patched = true;
      console.log('[auto-sync] patched HistoryService save*');
    }
  });
})();