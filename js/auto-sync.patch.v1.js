/*! auto-sync.patch.v1.js — start auto-sync only when session is present */
(() => {
  if (window.__MIEC_AUTOSYNC_PATCH__) return; window.__MIEC_AUTOSYNC_PATCH__ = true;
  const log=(...a)=>console.log("[auto-sync]",...a);
  function onLoad(cb){ document.readyState==="complete"?cb():addEventListener("load",cb,{once:true}); }
  onLoad(async function(){
    let tries=0;
    while(!(window.MIEC_SYNC&&window.MIEC_SYNC.client)&&tries<40){ await new Promise(r=>setTimeout(r,250)); tries++; }
    const sb = window.MIEC_SYNC?.client || window.supabaseClient;
    if(!sb) return log("no supabase client; abort");
    try{
      const { data:{ session } } = await sb.auth.getSession();
      if(session && window.HistoryService?.startAutoSync){ HistoryService.startAutoSync(); log("auto-sync started."); }
      sb.auth.onAuthStateChange((_e,sess)=>{ if(sess && window.HistoryService?.startAutoSync){ HistoryService.startAutoSync(); log("auto-sync restarted."); }});
    }catch(e){ console.warn("[auto-sync] getSession failed:", e); }
    const hs = window.HistoryService||{};
    if(typeof hs.saveWin==="function" && !hs.__patched){
      const ow=hs.saveWin.bind(hs), om=hs.saveMotor?.bind(hs);
      hs.saveWin = o=>{ const r=ow(o); setTimeout(()=>window.MIEC_SYNC?.pushOutbox().catch(()=>{}),600); return r; };
      if(typeof om==="function"){ hs.saveMotor = o=>{ const r=om(o); setTimeout(()=>window.MIEC_SYNC?.pushOutbox().catch(()=>{}),600); return r; }; }
      hs.__patched=true; log("patched HistoryService save*");
    }
  });
})();
