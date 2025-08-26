/* compat-bridge.js (v1)
   Bridges existing window.supa.* calls to window.Auth.* to avoid changing your code.
*/
(function(){
  function ensure(){
    if (!window.supa) window.supa = {};
    const A = window.Auth || {};
    const map = {
      loginMagic: 'magicLink',
      sendEmailOtp: 'sendOtp',
      verifyCode: 'verifyOtp',
      finalizeFromUrl: 'finalizeFromUrl',
      getSession: 'getSession',
      logout: 'logout',
    };
    Object.keys(map).forEach((k)=>{
      const fn = map[k];
      window.supa[k] = function(){ return (A[fn]||(()=>Promise.reject(new Error('Auth not ready')))).apply(A, arguments); };
    });
    window.supa.getUser = async function(){
      try { const { data } = await (A.getSession ? A.getSession() : { data:null }); return { user: data?.session?.user || null }; }
      catch(e){ return { user:null }; }
    };
    window.supa.ready = ()=>!!window.Auth;
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ensure, { once:true });
  } else {
    ensure();
  }
  document.addEventListener('supa:ready', ensure);
})();