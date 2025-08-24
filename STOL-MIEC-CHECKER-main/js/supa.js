
/* M.I.E.C. supa.js — unified auth + compat alias (v418c) */
(function(){
  if (window.__MIEC_SUPA_INIT__) return; window.__MIEC_SUPA_INIT__ = true;
  if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.error("[auth] Supabase not available or config missing (js/config.js).");
    return;
  }
  const supa = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  function vParam(){ try { return new URL(window.location.href).searchParams.get("v") || ""; } catch(e){ return ""; } }
  function hasAuthParamsInUrl(){
    const u = new URL(window.location.href); const hash = u.hash || "";
    if (u.searchParams.has("code")) return true;
    if (u.searchParams.has("token") || u.searchParams.has("token_hash")) return true;
    if (hash.includes("access_token") || hash.includes("refresh_token")) return true;
    return false;
  }
  function parseHashParams(){ const h = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash; return new URLSearchParams(h); }
  function cleanAuthParamsFromUrl(){
    try{ const u = new URL(window.location.href); const v = vParam(); u.hash=""; u.search = v?("?v="+encodeURIComponent(v)):""; history.replaceState({}, document.title, u.toString()); }catch(e){}
  }
  async function finalizeFromUrl(){
    const had = hasAuthParamsInUrl(); if (!had) return { handled:false, session:null };
    try{
      const url = new URL(window.location.href); const hash = parseHashParams();
      if (url.searchParams.has("code") && typeof supa.auth.exchangeCodeForSession==="function"){
        const code = url.searchParams.get("code");
        const { data, error } = await supa.auth.exchangeCodeForSession(code);
        if (error){ console.error("[auth] exchangeCodeForSession", error); cleanAuthParamsFromUrl(); return { handled:true, error, session:null }; }
        cleanAuthParamsFromUrl(); return { handled:true, session:data?.session||null };
      }
      if (hash.has("access_token") && hash.has("refresh_token") && typeof supa.auth.setSession==="function"){
        const { data, error } = await supa.auth.setSession({ access_token: hash.get("access_token"), refresh_token: hash.get("refresh_token") });
        if (error){ console.error("[auth] setSession", error); cleanAuthParamsFromUrl(); return { handled:true, error, session:null }; }
        cleanAuthParamsFromUrl(); return { handled:true, session:data?.session||null };
      }
      if ((url.searchParams.has("token") || url.searchParams.has("token_hash")) && typeof supa.auth.verifyOtp==="function"){
        const token_hash = url.searchParams.get("token_hash") || url.searchParams.get("token");
        const { data, error } = await supa.auth.verifyOtp({ token_hash, type:"email" });
        if (error){ console.error("[auth] verifyOtp(token_hash)", error); cleanAuthParamsFromUrl(); return { handled:true, error, session:null }; }
        cleanAuthParamsFromUrl(); return { handled:true, session:data?.session||null };
      }
      cleanAuthParamsFromUrl(); const { data } = await supa.auth.getSession(); return { handled:true, session:data?.session||null };
    }catch(e){ console.error(e); return { handled:true, session:null }; }
  }
  async function loginMagic(email){
    const redirectTo = new URL("validador.html", window.location.href).toString();
    return await supa.auth.signInWithOtp({ email, options:{ shouldCreateUser:true, emailRedirectTo: redirectTo } });
  }
  async function sendEmailOtp(email){ return await supa.auth.signInWithOtp({ email, options:{ shouldCreateUser:true } }); }
  async function verifyCode(email, code){ return await supa.auth.verifyOtp({ email, token: code, type:"email" }); }
  async function getSession(){ return await supa.auth.getSession(); }
  async function logout(){ try{ await supa.auth.signOut(); } finally { const u = new URL("login.html", window.location.href); const v = vParam(); if (v) u.searchParams.set("v", v); window.location.replace(u.toString()); } }
  window.SupaAuth = { finalizeFromUrl, loginMagic, sendEmailOtp, verifyCode, getSession, logout };
  if (!window.supa) {
    function pushLS(key, obj){ try{ const arr = JSON.parse(localStorage.getItem(key)||"[]"); arr.unshift(obj); localStorage.setItem(key, JSON.stringify(arr)); }catch(e){ console.warn("[auth] localStorage push failed:", e); } }
    window.supa = {
      ready: () => true,
      loginMagic, sendEmailOtp, sendOtpOnly: sendEmailOtp, verifyCode, getSession,
      getUser: async () => { try{ const { data } = await getSession(); return { user: data?.session?.user || null }; }catch(e){ return { user:null }; } },
      logout,
      saveHIN: async (obj) => { const rec = { ts: Date.now(), win: obj?.hin||obj?.win||"TEST", pre1998: !!obj?.pre1998, ok: obj?.result_ok ?? true, details: Array.isArray(obj?.details)?obj.details.join(" • "):(obj?.details||"diag"), certNumber: obj?.cert||obj?.certNumber||"", certIssuer: obj?.issuer||obj?.certIssuer||"", photo: obj?.photo||null }; pushLS("hist_win", rec); return { ok:true }; },
      saveEngine: async (obj) => { const rec = { ts: Date.now(), brand: obj?.brand||"DIAG", model: obj?.payload?.model||obj?.model||"", sn: obj?.payload?.sn||obj?.sn||"", ok: obj?.result_ok ?? true, details: Array.isArray(obj?.details)?obj.details.join(" • "):(obj?.details||"diag"), photo: obj?.photo||null }; pushLS("hist_motor", rec); return { ok:true }; },
    };
  }
  document.dispatchEvent(new CustomEvent("supa:ready"));
})();
