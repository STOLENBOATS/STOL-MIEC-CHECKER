/* validator-gate.js (v420)
   Purpose: On validador.html, process Supabase tokens FIRST, create/persist session,
   clean the URL, and only then allow the page to proceed (or redirect to login).
   Requires: SupaAuth (we recommend also loading js/auth-boot.js?v=420 before this).
*/
(function(){
  function add(src){
    return new Promise(function(res, rej){
      var s = document.createElement('script'); s.src = src; s.defer = true;
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  async function ensureCore(){
    if (!window.supabase) await add("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.56.0");
    if (!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY)) await add("js/config.js?v=418");
    if (!window.SupaAuth) await add("js/supa.js?v=418");
  }
  async function ready(fnName){
    const t0 = Date.now();
    while (!(window.SupaAuth && window.SupaAuth[fnName]) && Date.now()-t0 < 4000){
      await new Promise(r=>setTimeout(r, 20));
    }
    return !!(window.SupaAuth && window.SupaAuth[fnName]);
  }
  function cleanUrl(){
    try{
      var base = location.pathname + (/\?/.test(location.search) ? location.search : "?v=418");
      history.replaceState({}, "", base);
    }catch(_){}
  }
  async function gate(){
    try{
      await ensureCore();
      if (!await ready("finalizeFromUrl")) throw new Error("auth-not-ready");

      // Always call finalize; it no-ops if no tokens are present
      await window.SupaAuth.finalizeFromUrl({ storeSession: true, persistSession: true });

      cleanUrl();

      // Give Supabase a tiny breath to commit storage
      await new Promise(r=>setTimeout(r, 30));

      let sess = (await window.SupaAuth.getSession()).data?.session;
      if (!sess){
        // try once more in case storage lagged
        await new Promise(r=>setTimeout(r, 220));
        sess = (await window.SupaAuth.getSession()).data?.session;
      }
      if (!sess){
        // No session: go back to login
        location.replace("login.html?v=418");
        return;
      }
      // Session OK → notify and stay
      try{ document.dispatchEvent(new CustomEvent("supa:ready")); }catch(_){}
    }catch(e){
      console.warn("[validator-gate] error:", e);
      // Fallback safe redirect
      try{ cleanUrl(); }catch(_){}
      location.replace("login.html?v=418");
    }
  }

  if (document.readyState === "loading"){
    // Run as early as possible, but after DOM is parseable
    document.addEventListener("DOMContentLoaded", gate, { once:true });
  } else {
    gate();
  }
})();