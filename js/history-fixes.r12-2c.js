/*! MIEC history fixes — r12-2c (drop-in)
 *  - Fixes broken Supabase CDN by adding a fallback loader
 *  - Normalizes header controls on history pages (Voltar / Tema / Thumbs / Sair)
 *  - Adds thumbs size toggle (small/medium)
 *  - Safe to include multiple times; idempotent
 */
(function(){
  if (window.__MIEC_HISTORY_FIXES__) return; // idempotent
  window.__MIEC_HISTORY_FIXES__ = 'r12-2c';

  // ---------- 1) Supabase CDN fallback ----------
  function ensureSupabase(){
    return new Promise((resolve)=>{
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        return resolve(true);
      }
      // Some pages may have a broken CDN URL; add a good one
      var good = document.querySelector('script[data-miec-good-supabase]');
      if (!good) {
        good = document.createElement('script');
        good.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.56.0';
        good.setAttribute('data-miec-good-supabase','1');
        document.head.appendChild(good);
        good.addEventListener('load', ()=> resolve(true));
        good.addEventListener('error', ()=> resolve(false));
      } else {
        resolve(!!(window.supabase && window.supabase.createClient));
      }
      // Safety timeout
      setTimeout(()=> resolve(!!(window.supabase && window.supabase.createClient)), 2500);
    });
  }

  // ---------- 2) Header controls (theme / thumbs / logout) ----------
  function ensureHeaderControls(){
    const appHeader = document.querySelector('.app-header');
    if (!appHeader) return;

    let actions = appHeader.querySelector('.header-actions');
    if (!actions) {
      actions = document.createElement('nav');
      actions.className = 'header-actions';
      appHeader.appendChild(actions);
    }

    // Helper to create a button if not present
    function ensureBtn(id, html, onClick){
      let b = actions.querySelector('#'+id);
      if (!b) {
        b = document.createElement('button');
        b.id = id;
        b.className = id === 'logoutBtn' ? 'btn danger' : (id==='thumbsBtn' ? 'btn' : (id==='themeBtn' ? 'theme-toggle' : 'btn'));
        b.innerHTML = html;
        b.type = 'button';
        actions.appendChild(b);
      } else {
        b.innerHTML = html; // normalize label
      }
      if (onClick) {
        b.onclick = onClick;
      }
      return b;
    }

    // Voltar ao Validador (apenas se não existir link equivalente)
    if (!actions.querySelector('a[href*="validador"]')) {
      const a = document.createElement('a');
      a.className = 'btn';
      a.href = 'validador.html';
      a.textContent = 'Voltar ao Validador';
      a.title = 'Voltar ao Validador';
      actions.prepend(a);
    } else {
      // Evitar duplicados com o mesmo texto
      const btns = [...actions.querySelectorAll('a.btn')].filter(b=>/Voltar ao Validador/i.test(b.textContent||''));
      btns.slice(1).forEach(b=>b.remove());
    }

    // Theme toggle
    const root = document.documentElement;
    const saved = localStorage.getItem('theme') || 'dark';
    root.classList.toggle('theme-light', saved==='light');
    root.classList.toggle('theme-dark', saved!=='light');
    ensureBtn('themeBtn', '🌙/☀️', ()=>{
      const next = root.classList.contains('theme-light') ? 'dark' : 'light';
      root.classList.toggle('theme-light');
      root.classList.toggle('theme-dark');
      localStorage.setItem('theme', next);
    });

    // Thumbs toggle
    function thumbsLabel(){
      return 'Thumbs: ' + (document.body.classList.contains('thumbs-md') ? 'Médias' : 'Pequenas');
    }
    ensureBtn('thumbsBtn', thumbsLabel(), ()=>{
      document.body.classList.toggle('thumbs-md');
      const btn = document.getElementById('thumbsBtn');
      if (btn) btn.textContent = thumbsLabel();
    });

    // Logout
    ensureBtn('logoutBtn', 'Sair', async ()=>{
      try { await (window.supa?.logout?.()); } catch(e){}
      location.replace('login.html?v=418');
    });
  }

  // ---------- 3) Init ----------
  // Run once DOM is ready
  function onReady(cb){ 
    if (document.readyState === 'complete' || document.readyState === 'interactive') cb();
    else document.addEventListener('DOMContentLoaded', cb, { once:true });
  }

  onReady(async function(){
    try {
      await ensureSupabase();
    } catch(e){ /* ignore */ }
    ensureHeaderControls();
    // Console breadcrumb
    try {
      console.log('[history-fixes]', window.__MIEC_HISTORY_FIXES__, {
        supabase_ok: !!(window.supabase && window.supabase.createClient)
      });
    } catch(_) {}
  });
})();