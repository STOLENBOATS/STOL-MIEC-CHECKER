/* validador-gate.js (v1, minimal & robust)
   Usage: put EARLY in <head> of validador.html, after supabase SDK + config + supa-auth.js
   Debug: add ?debug=1&hold=2000 to URL to see overlay and delay
*/
(function(){
  var Q=new URLSearchParams(location.search),DEBUG=Q.has('debug'),HOLD=parseInt(Q.get('hold')||'0',10)||0;
  function overlay(m){if(!DEBUG)return;var el=document.getElementById('gate-overlay');if(!el){el=document.createElement('div');el.id='gate-overlay';el.style.cssText='position:fixed;z-index:999999;top:8px;right:8px;max-width:60vw;background:#111827;color:#E5E7EB;padding:10px 12px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.25);font:12px/1.45 ui-monospace,Consolas,monospace;white-space:pre-wrap';document.body.appendChild(el);}el.textContent=m;}
  async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
  async function gate(){
    try{
      overlay('gate: finalizeFromUrl…');
      if (!window.Auth || !window.Auth.finalizeFromUrl) throw new Error('auth-not-ready');
      await window.Auth.finalizeFromUrl();
      await sleep(25);
      let sess = (await window.Auth.getSession()).data?.session;
      if (!sess){ await sleep(250); sess = (await window.Auth.getSession()).data?.session; }
      overlay('gate: session ' + (sess ? 'OK' : 'MISSING'));
      if (HOLD){ overlay('gate: hold '+HOLD+'ms'); await sleep(HOLD); }
      if (!sess){ location.replace('login.html?v=418'); return; }
      try{ document.dispatchEvent(new CustomEvent('supa:ready')); }catch(_){}
    }catch(e){
      console.warn('[validador-gate]', e);
      overlay('gate: ERROR ' + (e && e.message || e));
      if (HOLD){ await sleep(HOLD); }
      location.replace('login.html?v=418');
    }
  }
  if (document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', gate, { once:true }); } else { gate(); }
})();