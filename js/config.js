// js/config.js — SANITY MODE (r13 drop-in)
window.MIEC_CONFIG = {
  APP_NAME: "M.I.E.C.",
  VERSION: "v4.2.1-auth-min — r13 — 2025-09-07",
  REQUIRE_AUTH: false,
  DEV_MODE: true,
  AUTO_SYNC: false,
  SUPABASE_URL: "https://SEU-PROJ.supabase.co",
  SUPABASE_ANON_KEY: "SUA_ANON_KEY",
  STORAGE_BUCKET: "photos",
  LS_OVERRIDE_KEY: "MIEC_CONFIG_OVERRIDE"
};
// Permitir override via localStorage
try{const ov=localStorage.getItem("MIEC_CONFIG_OVERRIDE"); if(ov) Object.assign(window.MIEC_CONFIG, JSON.parse(ov));}catch(e){console.warn('Override inválido',e)}
