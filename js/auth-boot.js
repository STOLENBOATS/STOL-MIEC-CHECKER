/* js/auth-boot.js (v420)
   Guarantees Supabase SDK, config, SupaAuth (supa.js) and a legacy window.supa alias.
   Use it EARLY in <head>, before your page scripts.
*/
(function(){
  function add(src){
    return new Promise(function(res, rej){
      var s = document.createElement('script');
      s.src = src; s.defer = true; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function ensureAlias(){
    if (!window.supa) {
      window.supa = {
        loginMagic: (...a)=>window.SupaAuth?window.SupaAuth.loginMagic(...a):Promise.reject(new Error("Auth not ready")),
        sendEmailOtp: (...a)=>window.SupaAuth?window.SupaAuth.sendEmailOtp(...a):Promise.reject(new Error("Auth not ready")),
        sendOtpOnly: (...a)=>window.SupaAuth?window.SupaAuth.sendEmailOtp(...a):Promise.reject(new Error("Auth not ready")),
        verifyCode: (...a)=>window.SupaAuth?window.SupaAuth.verifyCode(...a):Promise.reject(new Error("Auth not ready")),
        getSession: (...a)=>window.SupaAuth?window.SupaAuth.getSession(...a):Promise.resolve({data:null}),
        getUser: async ()=>{ try{ const {data}=await(window.SupaAuth?window.SupaAuth.getSession():Promise.resolve({data:null})); return {user:data?.session?.user||null}; } catch(e){ return {user:null}; } },
        logout: (...a)=>window.SupaAuth?window.SupaAuth.logout(...a):null,
      };
    }
  }
  (async function run(){
    try{
      // 1) SDK
      if (!window.supabase){
        await add("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.56.0");
      }
      // 2) Config (exposes window.SUPABASE_URL / window.SUPABASE_ANON_KEY)
      if (!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY)){
        await add("js/config.js?v=418");
      }
      // 3) Core auth (defines window.SupaAuth)
      if (!window.SupaAuth){
        await add("js/supa.js?v=418");
      }
      // 4) Legacy alias
      ensureAlias();
      // Notify readiness
      try{ document.dispatchEvent(new CustomEvent("supa:ready")); }catch(_){}
    } catch(e){
      console.warn("[auth-boot] failed:", e);
      ensureAlias();
    }
  })();
})();