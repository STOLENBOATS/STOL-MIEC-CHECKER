/* ui-hotfix.js (v420)
   - Forces favicon to 'images/favicon.png' to avoid /favicon.ico 404
   - Ensures cloud indicator element has [data-cloud] so cloud-diag can flip ON
   - Wires the "Ir para o Validador" button to open validador.html?v=418
*/
(function(){
  function ensureFavicon(){
    try{
      var link = document.querySelector('link[rel="icon"]');
      if (!link){ link = document.createElement('link'); link.rel='icon'; link.type='image/png'; document.head.appendChild(link); }
      var href = link.getAttribute('href') || '';
      if (!href || href.startsWith('/')) link.setAttribute('href','images/favicon.png');
    }catch(_){}
  }
  function ensureCloudAttr(){
    try{
      var el = document.querySelector('[data-cloud],#cloud,#cloudStatus,#cloud-indicator,.cloud-status');
      if (!el){
        var nodes = Array.from(document.querySelectorAll('span,small,b,strong,div'));
        el = nodes.find(function(n){ return /^(ON|OFF|erro)$/i.test((n.textContent||'').trim()); });
        if (el) el.setAttribute('data-cloud','');
      }
    }catch(_){}
  }
  function wireValidatorBtn(){
    try{
      var ids = ['toValidatorBtn','goValidatorBtn','validatorBtn'];
      var btn = null;
      for (var i=0;i<ids.length;i++){ var e=document.getElementById(ids[i]); if(e){btn=e;break;} }
      if (!btn){
        var candidates = Array.from(document.querySelectorAll('a,button'));
        btn = candidates.find(function(el){ return /validador/i.test((el.textContent||'').trim()); });
      }
      if (btn && !btn.__miecBound){
        btn.__miecBound = true;
        btn.addEventListener('click', function(ev){
          try{ ev.preventDefault(); }catch(_){}
          location.href = 'validador.html?v=418';
        });
      }
    }catch(_){}
  }
  function init(){
    ensureFavicon();
    ensureCloudAttr();
    wireValidatorBtn();
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();