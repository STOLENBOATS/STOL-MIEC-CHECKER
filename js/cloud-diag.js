/* M.I.E.C. cloud-diag.js — v418e
   Shows Cloud: ON when Supabase SDK + config are present and SupaAuth responds.
   Independent of login status (session may be null). */

(function(){
  function findEl(){
    return document.querySelector('[data-cloud]')
        || document.querySelector('#cloud')
        || document.querySelector('#cloudStatus')
        || document.querySelector('#cloud-indicator')
        || document.querySelector('.cloud-status');
  }
  function render(on){
    const el = findEl();
    if (!el) return;
    el.textContent = on ? 'ON' : 'OFF';
    el.classList.toggle('ok', !!on);
    el.setAttribute('aria-label', on ? 'Cloud online' : 'Cloud offline');
  }

  async function probe(){
    try{
      if (!window.supabase) throw new Error('sdk');
      if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) throw new Error('config');
      const t0 = Date.now();
      while (!(window.SupaAuth && window.SupaAuth.getSession) && Date.now() - t0 < 3000) {
        await new Promise(r => setTimeout(r, 20));
      }
      if (!(window.SupaAuth && window.SupaAuth.getSession)) throw new Error('auth-not-ready');
      await window.SupaAuth.getSession();
      render(true);
    } catch(e){
      render(false);
    }
  }

  render(false);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    probe();
  } else {
    document.addEventListener('DOMContentLoaded', probe, { once: true });
  }
  document.addEventListener('supa:ready', probe);
  window.addEventListener('online', probe);
  window.addEventListener('offline', probe);
})();