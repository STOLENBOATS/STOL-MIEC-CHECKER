// Supabase helper (strong redirect + finalize session from URL)
window.supa = (function(){
  const STORE_KEY='MIEC_CONFIG';
  const read=()=>{ try{ return JSON.parse(localStorage.getItem(STORE_KEY)||'{}') }catch{ return {} } };
  const merge=(a,b)=>Object.assign({},a||{},b||{});
  let base = window.MIEC_CONFIG||{};
  let cfg  = merge(base, read());
  let client = null;

  const ready = ()=> !!init();

  function init(){
    if(!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return null;
    if(client) return client;
    client = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    // Always try to finalize session from URL (hash or query)
    handleRedirect();
    return client;
  }

  async function handleRedirect(){
  // Lê params tanto de ?query como de #hash
  const getParams = () => {
    const qs = location.search && location.search.slice(1);
    const hs = location.hash && location.hash.slice(1);
    const raw = hs || qs || '';
    return new URLSearchParams(raw);
  };

  try {
    const p = getParams();

    // Caso 1: hash com access_token/refresh_token
    if (p.get('access_token') && p.get('refresh_token')) {
      const { data, error } = await client.auth.setSession({
        access_token: p.get('access_token'),
        refresh_token: p.get('refresh_token')
      });
      if (error) console.warn('[MIEC] setSession:', error);
      history.replaceState({}, document.title, location.pathname); // limpa URL
      if (window.MIEC_updateCloudStatus) try { window.MIEC_updateCloudStatus(); } catch(_) {}
      return;
    }

    // Caso 2: magic link com token_hash (v2)
    if (p.get('token_hash')) {
      const type  = p.get('type') || 'magiclink';
      const email = (localStorage.getItem('MIEC_LAST_EMAIL') || '').trim() || undefined;
      const { data, error } = await client.auth.verifyOtp({
        type, token_hash: p.get('token_hash'), email
      });
      if (error) console.warn('[MIEC] verifyOtp:', error);
      history.replaceState({}, document.title, location.pathname);
      if (window.MIEC_updateCloudStatus) try { window.MIEC_updateCloudStatus(); } catch(_) {}
      return;
    }

    // Caso 3: fluxo com ?code=... (OAuth/PKCE)
    if (p.get('code')) {
      const { data, error } = await client.auth.exchangeCodeForSession(p.get('code'));
      if (error) console.warn('[MIEC] exchangeCodeForSession:', error);
      history.replaceState({}, document.title, location.pathname);
      if (window.MIEC_updateCloudStatus) try { window.MIEC_updateCloudStatus(); } catch(_) {}
      return;
    }
  } catch (e) {
    console.warn('[MIEC] handleRedirect error:', e);
  }

  }

  function getConfig(){ return Object.assign({}, cfg); }
  function setConfig(c){ localStorage.setItem(STORE_KEY, JSON.stringify(c||{})); cfg = merge(base, c||{}); client=null; init(); return getConfig(); }
  function clearConfig(){ localStorage.removeItem(STORE_KEY); cfg = base; client=null; init(); return getConfig(); }

  async function getUser(){ if(!ready()) return { user:null }; return await client.auth.getUser(); }

  function computeRedirect(){
    const origin = location.origin;
    const base   = location.pathname.replace(/[^\/]*$/, '');
    return origin + base + 'validador.html';
  }

  async function loginMagic(email){
  if(!ready()) throw new Error('Supabase not configured');

  // guarda para o verifyOtp
  try { localStorage.setItem('MIEC_LAST_EMAIL', String(email||'').trim()); } catch(_) {}

  if(cfg.ALLOW_DOMAIN){
    const d = (email.split('@')[1] || '').toLowerCase();
    if (d !== String(cfg.ALLOW_DOMAIN).toLowerCase())
      throw new Error(`Email deve terminar em @${cfg.ALLOW_DOMAIN}`);
  }

  const redirectTo = computeRedirect(); // normalmente .../validador.html
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
  });
  if (error) throw error;
  return true;
}

  async function logout(){ if(!ready()) return; await client.auth.signOut(); }

  async function saveHIN(rec){
    if(!ready()) return { skipped:true };
    const { data:{ user } } = await client.auth.getUser();
    if(!user) throw new Error('Não autenticado');
    rec.user_id = user.id; rec.user_email = user.email||null;
    const { error } = await client.from('hin_validations').insert(rec);
    if(error) throw error; return true;
  }
  async function listHIN(limit=100){
    if(!ready()) return [];
    const { data, error } = await client.from('hin_validations').select('*').order('created_at',{ascending:false}).limit(limit);
    if(error) throw error; return data||[];
  }
  async function saveEngine(rec){
    if(!ready()) return { skipped:true };
    const { data:{ user } } = await client.auth.getUser();
    if(!user) throw new Error('Não autenticado');
    rec.user_id = user.id; rec.user_email = user.email||null;
    const { error } = await client.from('engine_validations').insert(rec);
    if(error) throw error; return true;
  }
  async function listEngine(limit=100){
    if(!ready()) return [];
    const { data, error } = await client.from('engine_validations').select('*').order('created_at',{ascending:false}).limit(limit);
    if(error) throw error; return data||[];
  }

  return { ready, getClient:()=>init(), getUser, loginMagic, logout,
           saveHIN, listHIN, saveEngine, listEngine,
           getConfig, setConfig, clearConfig };
})();
