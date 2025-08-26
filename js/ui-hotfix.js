/* ui-hotfix.js (v420) */
(function(){
  function ensureFavicon(){try{var l=document.querySelector('link[rel="icon"]');if(!l){l=document.createElement('link');l.rel='icon';l.type='image/png';document.head.appendChild(l);}var h=l.getAttribute('href')||'';if(!h||h.startsWith('/'))l.setAttribute('href','images/favicon.png');}catch(_){}} 
  function ensureCloudAttr(){try{var el=document.querySelector('[data-cloud],#cloud,#cloudStatus,#cloud-indicator,.cloud-status');if(!el){var n=Array.from(document.querySelectorAll('span,small,b,strong,div'));el=n.find(function(x){return /^(ON|OFF|erro)$/i.test((x.textContent||'').trim());});if(el)el.setAttribute('data-cloud','');}}catch(_){}} 
  function wireValidatorBtn(){try{var ids=['toValidatorBtn','goValidatorBtn','validatorBtn'];var b=null;for(var i=0;i<ids.length;i++){var e=document.getElementById(ids[i]);if(e){b=e;break;}}if(!b){var c=Array.from(document.querySelectorAll('a,button'));b=c.find(function(el){return /validador/i.test((el.textContent||'').trim());});}if(b&&!b.__miecBound){b.__miecBound=true;b.addEventListener('click',function(ev){try{ev.preventDefault();}catch(_){ }location.href='validador.html?v=418';});}}catch(_){}} 
  function init(){ensureFavicon();ensureCloudAttr();wireValidatorBtn();}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init,{once:true});}else{init();}
})();