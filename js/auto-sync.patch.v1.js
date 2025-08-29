/*! auto-sync.patch.v1.js — start auto-sync only when session is present
 *  - waits for MIEC_SYNC.client
 *  - starts HistoryService.startAutoSync() on login and on auth-state change
 *  - pushes outbox shortly after a save (non-blocking)
 *  Idempotent; safe to include on the Validador page only.
 */
(() => {
  if (window.__MIEC_AUTOSYNC_PATCH__) return;
  window.__MIEC_AUTOSYNC_PATCH__ = true;

  const log = (...a)=>console.log("[auto-sync]", ...a);

  function onLoad(cb){
    if (document.readyState === "complete") cb();
    else window.addEventListener("load", cb, { once: true });
  }

  onLoad(async function boot(){
    // wait up to ~10s for client
    let tries = 0;
    while (!(window.MIEC_SYNC && window.MIEC_SYNC.client) && tries < 40) {
      await new Promise(r=>setTimeout(r,250)); tries++;
    }
    const sb = window.MIEC_SYNC?.client || window.supabaseClient;
    if (!sb) return log("no supabase client; abort");

    try {
      const { data:{ session } } = await sb.auth.getSession();
      if (session && window.HistoryService?.startAutoSync) {
        HistoryService.startAutoSync();
        log("auto-sync started (session present).");
      }
      sb.auth.onAuthStateChange((_ev, sess) => {
        if (sess && window.HistoryService?.startAutoSync) {
          HistoryService.startAutoSync();
          log("auto-sync restarted after auth change.");
        }
      });
    } catch(e) {
      console.warn("[auto-sync] getSession failed:", e);
    }

    // post-save gentle push
    const hs = window.HistoryService || {};
    if (typeof hs.saveWin === "function" && !hs.__patched){
      const ow = hs.saveWin.bind(hs);
      const om = hs.saveMotor?.bind(hs);
      hs.saveWin = async (o) => {
        const r = await ow(o);
        setTimeout(()=>window.MIEC_SYNC?.pushOutbox().catch(()=>{}), 600);
        return r;
      };
      if (typeof om === "function") {
        hs.saveMotor = async (o) => {
          const r = await om(o);
          setTimeout(()=>window.MIEC_SYNC?.pushOutbox().catch(()=>{}), 600);
          return r;
        };
      }
      hs.__patched = true;
      log("patched HistoryService save*");
    }
  });
})();
