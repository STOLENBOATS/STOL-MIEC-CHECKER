/* compat-bridge.js (v418)
   Ensures legacy window.supa.* API is present even if pages call it before supa.js finishes booting.
   It proxies to window.SupaAuth once available.
*/
(function(){
  function install(){
    if (!window.supa) {
      window.supa = {
        // Proxies that fail gracefully if SupaAuth not ready
        loginMagic: (...args) => window.SupaAuth ? window.SupaAuth.loginMagic(...args) : Promise.reject(new Error("Auth not ready")),
        sendEmailOtp: (...args) => window.SupaAuth ? window.SupaAuth.sendEmailOtp(...args) : Promise.reject(new Error("Auth not ready")),
        sendOtpOnly: (...args) => window.SupaAuth ? window.SupaAuth.sendEmailOtp(...args) : Promise.reject(new Error("Auth not ready")),
        verifyCode: (...args) => window.SupaAuth ? window.SupaAuth.verifyCode(...args) : Promise.reject(new Error("Auth not ready")),
        getSession: (...args) => window.SupaAuth ? window.SupaAuth.getSession(...args) : Promise.resolve({ data:null }),
        getUser: async () => {
          try { const { data } = await (window.SupaAuth ? window.SupaAuth.getSession() : Promise.resolve({ data: null })); return { user: data?.session?.user || null }; }
          catch (e) { return { user: null }; }
        },
        logout: (...args) => window.SupaAuth ? window.SupaAuth.logout(...args) : null,
      };
    }
  }
  install();
  document.addEventListener("supa:ready", install);
})();