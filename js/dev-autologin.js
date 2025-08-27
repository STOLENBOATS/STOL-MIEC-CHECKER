// js/dev-autologin.js — DEV autologin sem fricção
// Só corre em DEV (flags/domínios). NÃO usar em produção.
(function(){
  const g = window;
  const cfg = g.MIEC_CONFIG || {};

  function isDevEnabled(){
    if (cfg.DEV_MODE === true) return true;
    // ativar por URL ?dev=1
    if (new URLSearchParams(location.search).get('dev') === '1') return true;
    // ativar por localStorage (MIEC_DEV = "1")
    try { if (localStorage.getItem('MIEC_DEV') === '1') return true; } catch {}
    // ativar em hosts de desenvolvimento
    const host = location.hostname || '';
    if (/^(localhost|127\.0\.0\.1)$/i.test(host)) return true;
    if (/\.(local|lan)$/i.test(host)) return true;
    return false;
  }

  async function waitClient(ms=10000){
    const step = 200; let left = ms;
    while (left > 0){
      if (g.MIEC_SYNC && g.MIEC_SYNC.client) return g.MIEC_SYNC.client;
      if (g.supabaseClient) return g.supabaseClient;
      await new Promise(r=>setTimeout(r, step)); left -= step;
    }
    return null;
  }

  function hideLoginUI(){
    if (cfg.HIDE_LOGIN_IN_DEV){
      const el = document.getElementById('logoutBtn');
      if (el) el.style.display = 'none';
    }
  }

  async function autologin(){
    if (!isDevEnabled()) return; // produção ignora
    const sb = await waitClient(10000);
    if (!sb){ console.warn('[dev-autologin] sem cliente Supabase'); return; }

    try{
      const { data:{ session } } = await sb.auth.getSession();
      if (session){ hideLoginUI(); return; } // já autenticado
    }catch(e){ console.warn('[dev-autologin] getSession falhou:', e); }

    // procurar credenciais
    let email = cfg.DEV_EMAIL, password = cfg.DEV_PASSWORD;
    try {
      const fromLS = JSON.parse(localStorage.getItem('MIEC_DEV_CREDENTIALS') || 'null');
      if (fromLS && fromLS.email && fromLS.password){ email = email || fromLS.email; password = password || fromLS.password; }
    } catch {}

    if (!email || !password){
      console.warn('[dev-autologin] faltam DEV_EMAIL/DEV_PASSWORD (config.js ou localStorage MIEC_DEV_CREDENTIALS).');
      return;
    }

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error){ console.warn('[dev-autologin] falhou login DEV:', error.message); }
    else {
      console.log('[dev-autologin] sessão DEV ativa para', email);
      hideLoginUI();
      try { if (g.HistoryService?.startAutoSync) g.HistoryService.startAutoSync(); } catch {}
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autologin);
  else autologin();
})();