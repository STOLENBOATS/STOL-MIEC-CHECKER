// Supabase helper (with explicit redirect for magic links)
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
    return client;
  }

  function getConfig(){ return Object.assign({}, cfg); }
  function setConfig(c){ localStorage.setItem(STORE_KEY, JSON.stringify(c||{})); cfg = merge(base, c||{}); client=null; init(); return getConfig(); }
  function clearConfig(){ localStorage.removeItem(STORE_KEY); cfg = base; client=null; init(); return getConfig(); }

  async function getUser(){ if(!ready()) return { user:null }; return await client.auth.getUser(); }

  // Compute a safe redirect URL to this deployed site
  function computeRedirect(){
    const origin = location.origin;                           // e.g. https://stolenboats.github.io
    const base   = location.pathname.replace(/[^\/]*$/, '');  // e.g. /STOL-MIEC-CHECKER/
    return origin + base + 'validador.html';
  }

  async function loginMagic(email){
    if(!ready()) throw new Error('Supabase not configured');
    if(cfg.ALLOW_DOMAIN){
      const d=(email.split('@')[1]||'').toLowerCase();
      if(d!==String(cfg.ALLOW_DOMAIN).toLowerCase()) throw new Error(`Email deve terminar em @${cfg.ALLOW_DOMAIN}`);
    }
    const redirectTo = computeRedirect();
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });
    if(error) throw error;
    return true;
  }

  async function logout(){ if(!ready()) return; await client.auth.signOut(); }

  // Optional helpers used by the app
  async function uploadPhoto(file){
    if(!ready()||!file) return null;
    const bucket=(getConfig().STORAGE_BUCKET)||'photos';
    const name=`${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
    const path=name;
    const { error } = await client.storage.from(bucket).upload(path, file, { upsert:false });
    if(error) throw error;
    const { data: pub } = client.storage.from(bucket).getPublicUrl(path);
    return (pub && pub.publicUrl) || null;
  }

  async function saveHIN(rec){
    if(!ready()) return { skipped:true };
    const { data:{ user } } = await client.auth.getUser();
    if(!user) throw new Error('Não autenticado');
    rec.user_id = user.id; rec.user_email = user.email||null;
    const { error } = await client.from('hin_validations').insert(rec);
    if(error) throw error;
    return true;
  }

  async function listHIN(limit=100){
    if(!ready()) return [];
    const { data, error } = await client.from('hin_validations')
      .select('*').order('created_at',{ascending:false}).limit(limit);
    if(error) throw error;
    return data||[];
  }

  async function saveEngine(rec){
    if(!ready()) return { skipped:true };
    const { data:{ user } } = await client.auth.getUser();
    if(!user) throw new Error('Não autenticado');
    rec.user_id = user.id; rec.user_email = user.email||null;
    const { error } = await client.from('engine_validations').insert(rec);
    if(error) throw error;
    return true;
  }

  async function listEngine(limit=100){
    if(!ready()) return [];
    const { data, error } = await client.from('engine_validations')
      .select('*').order('created_at',{ascending:false}).limit(limit);
    if(error) throw error;
    return data||[];
  }

  return { ready, getClient:()=>init(), getUser, loginMagic, logout,
           uploadPhoto, saveHIN, listHIN, saveEngine, listEngine,
           getConfig, setConfig, clearConfig };
})();