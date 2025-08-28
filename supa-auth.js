/* supa-auth.js (MIEC minimal wrapper v1)
   Requires: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.56.0"></script>
             js/config.js with window.SUPABASE_URL and window.SUPABASE_ANON_KEY
   Exposes:  window.Auth.{magicLink, sendOtp, verifyOtp, finalizeFromUrl, getSession, logout}
*/
(function(){
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('[supa-auth] Missing SUPABASE config on window.');
  }
  const client = window.supabase
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      })
    : null;

  function parseHash() {
    // Parse #access_token=...&refresh_token=... fragment
    const h = (location.hash || '').replace(/^#/, '');
    const p = new URLSearchParams(h);
    return {
      access_token: p.get('access_token'),
      refresh_token: p.get('refresh_token'),
      token_type: p.get('token_type'),
      expires_in: p.get('expires_in'),
      type: p.get('type'),
    };
  }
  function parseQuery() {
    const p = new URLSearchParams(location.search || '');
    return {
      code: p.get('code'),
      token_hash: p.get('token_hash'),
    };
  }
  async function finalizeFromUrl(opts={}) {
    if (!client) throw new Error('Supabase SDK not loaded');
    const { access_token, refresh_token } = parseHash();
    const { code } = parseQuery();
    let changed = false;

    if (access_token && refresh_token) {
      const { data, error } = await client.auth.setSession({ access_token, refresh_token });
      if (error) throw error;
      changed = !!data?.session;
    } else if (code) {
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (error) throw error;
      changed = !!data?.session;
    }

    if (changed || opts.cleanUrl !== false) {
      try {
        const base = location.pathname + (/\?/.test(location.search) ? location.search.replace(/([?#].*)/,'') : '?v=418');
        history.replaceState({}, '', base);
      } catch (_) {}
    }
    return changed;
  }

  async function magicLink(email, redirectTo) {
    if (!client) throw new Error('Supabase SDK not loaded');
    const url = redirectTo || (location.origin + location.pathname.replace(/login\.html.*$/,'') + 'validador.html');
    return client.auth.signInWithOtp({ email, options: { emailRedirectTo: url } });
  }
  async function sendOtp(email, redirectTo) {
    return magicLink(email, redirectTo); // Supabase envia link + código no mesmo email
  }
  async function verifyOtp(email, token) {
    if (!client) throw new Error('Supabase SDK not loaded');
    return client.auth.verifyOtp({ email, token, type: 'email' });
  }
  async function getSession() {
    if (!client) throw new Error('Supabase SDK not loaded');
    return client.auth.getSession();
  }
  async function logout() {
    if (!client) throw new Error('Supabase SDK not loaded');
    try { await client.auth.signOut(); } catch (_) {}
    try { sessionStorage.removeItem('loggedIn'); } catch(_){}
  }

  window.Auth = { magicLink, sendOtp, verifyOtp, finalizeFromUrl, getSession, logout };
  try { document.dispatchEvent(new CustomEvent('supa:ready')); } catch(_){}
})();