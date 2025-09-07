// js/config.js — SANITY MODE (r13 drop-in)
window.MIEC_CONFIG = {
  APP_NAME: "M.I.E.C.",
  VERSION: "v4.2.1-auth-min — r13 — 2025-09-07",
  REQUIRE_AUTH: false,
  DEV_MODE: true,
  AUTO_SYNC: true,
  SUPABASE_URL: "https://okmifknkaidblkueiwjn.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbWlma25rYWlkYmxrdWVpd2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTI2MTYsImV4cCI6MjA3MTI4ODYxNn0.hrr7wc-SUb2iQfhS1iWrnnZj2KLql2CyPsooZGo_N5Y",
  STORAGE_BUCKET: "photos",
  LS_OVERRIDE_KEY: "MIEC_CONFIG_OVERRIDE"
};
// Permitir override via localStorage
try{const ov=localStorage.getItem("MIEC_CONFIG_OVERRIDE"); if(ov) Object.assign(window.MIEC_CONFIG, JSON.parse(ov));}catch(e){console.warn('Override inválido',e)}
