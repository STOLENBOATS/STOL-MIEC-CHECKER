/* M.I.E.C. js/config.js — hardfix v418
   Exports Supabase credentials to globals from localStorage (MIEC_CONFIG) or existing consts.
   This must load BEFORE js/supa.js.
*/
(function () {
  try {
    // If developer defined consts somewhere else, promote to window.*
    if (!window.SUPABASE_URL && typeof SUPABASE_URL !== "undefined") window.SUPABASE_URL = SUPABASE_URL;
    if (!window.SUPABASE_ANON_KEY && typeof SUPABASE_ANON_KEY !== "undefined") window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

    // Try to read from localStorage (saved in config.html)
    var cfg = {};
    try { cfg = JSON.parse(localStorage.getItem("MIEC_CONFIG") || "{}"); } catch (e) {}

    if (!window.SUPABASE_URL && cfg.url) window.SUPABASE_URL = cfg.url;
    if (!window.SUPABASE_ANON_KEY && cfg.anonKey) window.SUPABASE_ANON_KEY = cfg.anonKey;

    // Optional extras
    if (cfg.bucket) window.MIEC_BUCKET = cfg.bucket;
    if (cfg.allowDomain) window.MIEC_ALLOW_DOMAIN = cfg.allowDomain;

    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
      console.warn("[config] SUPABASE_URL/ANON_KEY missing — abre config.html e clica 'Guardar'.");
    } else {
      console.log("[config] Supabase config OK (via", cfg.url ? "localStorage" : "globals", ").");
    }
  } catch (e) {
    console.warn("[config] shim failed:", e);
  }
})();