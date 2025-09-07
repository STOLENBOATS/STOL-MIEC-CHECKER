/* M.I.E.C. js/config.js — hardfix v418c
   Exporta credenciais Supabase para window.* usando:
   - const SUPABASE_URL/SUPABASE_ANON_KEY (se existirem), OU
   - localStorage.MIEC_CONFIG com chaves *legacy* (SUPABASE_URL/SUPABASE_ANON_KEY) OU novas (url/anonKey).
*/
(function () {
  try {
    // 1) Promove consts (se existirem)
    if (!window.SUPABASE_URL && typeof SUPABASE_URL !== "undefined") window.SUPABASE_URL = SUPABASE_URL;
    if (!window.SUPABASE_ANON_KEY && typeof SUPABASE_ANON_KEY !== "undefined") window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

    // 2) Tenta localStorage (MIEC_CONFIG)
    var cfg = {};
    try { cfg = JSON.parse(localStorage.getItem("MIEC_CONFIG") || "{}"); } catch (e) {}

    var url = cfg.url || cfg.SUPABASE_URL;
    var key = cfg.anonKey || cfg.SUPABASE_ANON_KEY;

    if (!window.SUPABASE_URL && url) window.SUPABASE_URL = url;
    if (!window.SUPABASE_ANON_KEY && key) window.SUPABASE_ANON_KEY = key;

    // extras
    window.MIEC_BUCKET = cfg.bucket || cfg.BUCKET || window.MIEC_BUCKET || "photos";
    window.MIEC_ALLOW_DOMAIN = cfg.allowDomain || cfg.ALLOW_DOMAIN || window.MIEC_ALLOW_DOMAIN;

    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
      console.warn("[config] SUPABASE_URL/ANON_KEY missing — abre config.html e clica 'Guardar'.");
    } else {
      console.log("[config] Supabase config OK.");
    }
  } catch (e) {
    console.warn("[config] shim failed:", e);
  }
})();

/* MIEC extras (v418c) — expõe config unificada + flags para o sync */
window.MIEC_CONFIG = Object.assign({}, window.MIEC_CONFIG, {
  SUPA_URL:  window.SUPABASE_URL,
  SUPA_KEY:  window.SUPABASE_ANON_KEY,
  APP_VERSION: 'v4.2.1-auth-min — 2025-08-26',
  SYNC_EXTRA_WIN_FIELDS: true,    // envia/recebe certificate/issuer (WIN)
  SYNC_EXTRA_MOTOR_FIELDS: true   // idem para MOTOR
});

window.supabaseClient = window.supabaseClient || (
  window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, { auth: { persistSession: true } })
    : null
);

