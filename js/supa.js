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
    try{
      const { data, error } = await client.auth.getSessionFromUrl({ storeSession:true });
      if(!error && data && data.session){
        console.log('[MIEC] Session stored from URL for', data.session.user?.email);
        history.replaceState({}, document.title, location.pathname);
        if(window.MIEC_updateCloudStatus) try{ window.MIEC_updateCloudStatus(); }catch(_){}
      } else if (error && error.name !== 'AuthSessionMissingError'){
        console.warn('[MIEC] getSessionFromUrl:', error);
      }
    }catch(e){ /* ignore if no tokens present */ }
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
    if(cfg.ALLOW_DOMAIN){
      const d=(email.split('@')[1]||'').toLowerCase();
      if(d!==String(cfg.ALLOW_DOMAIN).toLowerCase()) throw new Error(`Email deve terminar em @${cfg.ALLOW_DOMAIN}`);
    }
    const redirectTo = computeRedirect();
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo }});
    if(error) throw error;
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