const NAV={BUILD:'N.A.V 2.2.2 FALLBACK',STORAGE:{SESSION:'nav_session',WIN_HISTORY:'winHistory',MOTOR_HISTORY:'motorHistory'},THEME_KEY:'nav_theme'};

// --- MIEC globals shim (v418b): expose Supabase URL/KEY on window ---
(function(){
  try{
    // From existing globals/constants if present
    if (!window.SUPABASE_URL && typeof SUPABASE_URL !== "undefined") { window.SUPABASE_URL = SUPABASE_URL; }
    if (!window.SUPABASE_ANON_KEY && typeof SUPABASE_ANON_KEY !== "undefined") { window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY; }

    // From localStorage (MIEC_CONFIG) if still missing
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
      const conf = JSON.parse(localStorage.getItem("MIEC_CONFIG") || "{}");
      if (conf.url && !window.SUPABASE_URL) window.SUPABASE_URL = conf.url;
      if (conf.anonKey && !window.SUPABASE_ANON_KEY) window.SUPABASE_ANON_KEY = conf.anonKey;
    }
  }catch(e){ console.warn("[config] shim failed", e); }
})();
