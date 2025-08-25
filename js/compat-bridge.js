/* compat-bridge.js (v419) — ensures window.supa exists immediately */
(function(){
  function install(){
    if (!window.supa) {
      window.supa = {
        loginMagic: (...a)=>window.SupaAuth?window.SupaAuth.loginMagic(...a):Promise.reject(new Error("Auth not ready")),
        sendEmailOtp: (...a)=>window.SupaAuth?window.SupaAuth.sendEmailOtp(...a):Promise.reject(new Error("Auth not ready")),
        sendOtpOnly: (...a)=>window.SupaAuth?window.SupaAuth.sendEmailOtp(...a):Promise.reject(new Error("Auth not ready")),
        verifyCode: (...a)=>window.SupaAuth?window.SupaAuth.verifyCode(...a):Promise.reject(new Error("Auth not ready")),
        getSession: (...a)=>window.SupaAuth?window.SupaAuth.getSession(...a):Promise.resolve({data:null}),
        getUser: async ()=>{ try{ const {data}=await(window.SupaAuth?window.SupaAuth.getSession():Promise.resolve({data:null})); return {user:data?.session?.user||null}; }catch(e){ return {user:null}; } },
        logout: (...a)=>window.SupaAuth?window.SupaAuth.logout(...a):null,
      };
    }
  }
  // install as early as possible
  install();
  document.addEventListener("supa:ready", install);
})();