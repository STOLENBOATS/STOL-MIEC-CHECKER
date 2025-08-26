/* noauth-dev.js (v1) — DEV-ONLY bypass for validador
   - Stubs SupaAuth so the page pensa que está autenticada
   - Marca Cloud: ON (se existir [data-cloud]/#cloud)
   - Desliga sozinho se URL tiver ?auth=on
   USO: incluir no <head> do validador.html:
     <script defer src="js/noauth-dev.js?v=1"></script>
*/
(function(){
  if (new URLSearchParams(location.search).get('auth') === 'on') return; // escape hatch

  // Cloud indicator → ON
  function markCloudOn(){
    var el = document.querySelector('[data-cloud]')||document.getElementById('cloud')||document.getElementById('cloudStatus');
    if (el){ el.textContent = 'ON'; el.classList.add('ok'); el.setAttribute('aria-label','Cloud online'); }
  }

  // Stub minimal SupaAuth API
  var fakeEmail = (localStorage.getItem('miec_dev_email') || 'dev@miec.local');
  window.SupaAuth = {
    async getSession(){ return { data:{ session:{ user:{ email: fakeEmail, id:'dev-user' }, access_token:'dev', token_type:'bearer'} } }; },
    async finalizeFromUrl(){ return; },
    async loginMagic(){ return { data:{}, error:null }; },
    async sendEmailOtp(){ return { data:{}, error:null }; },
    async verifyCode(){ return { data:{}, error:null }; },
    async logout(){ localStorage.removeItem('miec_dev_email'); return { data:{}, error:null }; },
  };

  // Legacy alias (se código antigo usar window.supa.*)
  if (!window.supa){
    window.supa = {
      ready: ()=>true,
      getUser: async ()=>({ user: { email: fakeEmail } }),
      finalizeFromUrl: async ()=>{},
      loginMagic: async ()=>({}), sendEmailOtp: async ()=>({}), verifyCode: async ()=>({}), logout: async ()=>({})
    };
  }

  // Dispara sinal de "auth pronta"
  try{ document.dispatchEvent(new CustomEvent('supa:ready')); }catch(_){}

  // Marca cloud ON após DOM
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', markCloudOn, { once:true });
  } else {
    markCloudOn();
  }

  // Aviso na consola
  console.warn('[noauth-dev] ATENÇÃO: bypass ativo (DEV). Acrescente ?auth=on para desativar temporariamente.');
})();