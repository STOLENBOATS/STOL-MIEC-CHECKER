/* M.I.E.C. supa.js (auth gate patch 418)
   - Robust finalizeFromUrl(): handles PKCE (?code=), implicit (#access_token) and legacy (?token / token_hash) flows
   - Cleans URL after processing (preserves ?v query if present)
   - Exposes helpers on window.SupaAuth
   Requirements:
     - Load order on pages that use it:
       1) @supabase/supabase-js v2 CDN
       2) js/config.js  (defines SUPABASE_URL, SUPABASE_ANON_KEY)
       3) js/supa.js    (this file)
*/
(function () {
  if (window.__MIEC_SUPA_INIT__) return;
  window.__MIEC_SUPA_INIT__ = true;

  if (typeof window.SUPABASE_URL === "undefined" || typeof window.SUPABASE_ANON_KEY === "undefined") {
    console.error("[auth] Missing SUPABASE_URL / SUPABASE_ANON_KEY. Check js/config.js");
    return;
  }

  // Create client with explicit settings used in this project
  const supa = window.supabase?.createClient
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false, // we handle it manually
        },
      })
    : null;

  if (!supa) {
    console.error("[auth] Supabase client not found. Ensure the CDN script is loaded before supa.js");
    return;
  }

  // ---- utilities ----
  function getVParamOrDefault() {
    const url = new URL(window.location.href);
    return url.searchParams.get("v") || "417"; // keep current project default unless caller forces another
  }

  function hasAuthParamsInUrl() {
    const u = new URL(window.location.href);
    const hash = u.hash || "";
    // PKCE / Recovery / Email change (query param "code")
    if (u.searchParams.has("code")) return true;
    // Legacy token hash variants from templates
    if (u.searchParams.has("token") || u.searchParams.has("token_hash")) return true;
    // Implicit flow puts tokens in the hash
    if (hash.includes("access_token") || hash.includes("refresh_token")) return true;
    return false;
  }

  function parseHashParams() {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    return new URLSearchParams(hash);
  }

  function cleanAuthParamsFromUrl() {
    const url = new URL(window.location.href);
    const v = getVParamOrDefault();
    url.hash = "";
    // Keep only ?v if present
    url.search = v ? `?v=${encodeURIComponent(v)}` : "";
    window.history.replaceState({}, document.title, url.toString());
  }

  async function finalizeFromUrl() {
    const started = Date.now();
    const hadParams = hasAuthParamsInUrl();
    if (!hadParams) return { handled: false, session: null };

    console.groupCollapsed("[auth] finalizeFromUrl");
    try {
      const current = new URL(window.location.href);
      const hashParams = parseHashParams();

      // 1) PKCE style: ?code=...
      if (current.searchParams.has("code") && typeof supa.auth.exchangeCodeForSession === "function") {
        const code = current.searchParams.get("code");
        console.log("[auth] Detected PKCE code in URL. Exchanging for session…");
        const { data, error } = await supa.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[auth] exchangeCodeForSession error:", error);
          cleanAuthParamsFromUrl();
          return { handled: true, error, session: null };
        }
        console.log("[auth] Session established via PKCE.");
        cleanAuthParamsFromUrl();
        return { handled: true, session: data?.session || null };
      }

      // 2) Implicit flow: #access_token & #refresh_token in hash
      if (hashParams.has("access_token") && hashParams.has("refresh_token") && typeof supa.auth.setSession === "function") {
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");
        console.log("[auth] Detected implicit tokens in hash. Setting session…");
        const { data, error } = await supa.auth.setSession({ access_token, refresh_token });
        if (error) {
          console.error("[auth] setSession error:", error);
          cleanAuthParamsFromUrl();
          return { handled: true, error, session: null };
        }
        console.log("[auth] Session established via setSession.");
        cleanAuthParamsFromUrl();
        return { handled: true, session: data?.session || null };
      }

      // 3) Legacy/Template: ?token= / ?token_hash= (verify directly)
      if ((current.searchParams.has("token") || current.searchParams.has("token_hash")) && typeof supa.auth.verifyOtp === "function") {
        const token_hash = current.searchParams.get("token_hash") || current.searchParams.get("token");
        console.log("[auth] Detected token_hash in URL. Verifying…");
        const { data, error } = await supa.auth.verifyOtp({ token_hash, type: "email" }); // 'magiclink' deprecated in JS, use 'email'
        if (error) {
          console.error("[auth] verifyOtp (token_hash) error:", error);
          cleanAuthParamsFromUrl();
          return { handled: true, error, session: null };
        }
        console.log("[auth] Session established via verifyOtp(token_hash).");
        cleanAuthParamsFromUrl();
        return { handled: true, session: data?.session || null };
      }

      // If we got here with params but none matched, still clean to avoid loops.
      console.warn("[auth] Auth params detected but no known handler matched. Cleaning URL to avoid loops.");
      cleanAuthParamsFromUrl();
      const { data } = await supa.auth.getSession();
      return { handled: true, session: data?.session || null };
    } finally {
      console.log("[auth] finalizeFromUrl took", Date.now() - started, "ms");
      console.groupEnd();
    }
  }

  async function loginMagic(email) {
    const redirectTo = new URL("validador.html", window.location.href).toString();
    return await supa.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo,
      },
    });
  }

  async function sendEmailOtp(email) {
    // Sends email with both magic link and 6-digit OTP by default
    return await supa.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
  }

  async function verifyCode(email, code) {
    return await supa.auth.verifyOtp({ email, token: code, type: "email" });
  }

  async function getSession() {
    return await supa.auth.getSession();
  }

  async function logout() {
    try {
      await supa.auth.signOut();
    } finally {
      const url = new URL("login.html", window.location.href);
      const v = getVParamOrDefault();
      if (v) url.searchParams.set("v", v);
      window.location.replace(url.toString());
    }
  }

  // Expose for pages
  window.SupaAuth = {
    hasAuthParamsInUrl,
    finalizeFromUrl,
    loginMagic,
    sendEmailOtp,
    verifyCode,
    getSession,
    logout,
  };

  // Fire a ready event
  document.dispatchEvent(new CustomEvent("supa:ready"));
})();