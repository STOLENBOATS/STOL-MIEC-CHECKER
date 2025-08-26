/* login-finalize.js (v1) — finalize Supabase tokens on the login page too
   Usage: place in <head> of login.html, after SDK+config+supa-auth+compat:
     <script defer src="js/login-finalize.js?v=1"></script>
   Debug: add ?debug=1 to URL to see console logs
*/
(function(){
  var DEBUG = new URLSearchParams(location.search).has('debug');
  function log(){ if (DEBUG) try{ console.log.apply(console, ['[login-finalize]'].concat([].slice.call(arguments))); }catch(_){} }
  async function run(){
    try{
      if (window.Auth && window.Auth.finalizeFromUrl){
        log('finalize via Auth.finalizeFromUrl');
        await window.Auth.finalizeFromUrl({ cleanUrl: true });
      } else if (window.supa && window.supa.finalizeFromUrl){
        log('finalize via supa.finalizeFromUrl');
        await window.supa.finalizeFromUrl();
      } else {
        log('Auth not ready yet');
      }
    }catch(e){
      log('error', e && e.message || e);
    }finally{
      try{ window.MIEC_updateCloudStatus && window.MIEC_updateCloudStatus(); }catch(_){}
    }
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run, { once:true });
  } else {
    run();
  }
})();