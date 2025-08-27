// auth-mini.js — cria uma pequena API e arranca o sync após login
(function(){
  const g = window;
  if(!g.supabase || !g.MIEC_CONFIG){ console.warn('Supabase JS ou MIEC_CONFIG em falta.'); return; }

  // Se já existir, reaproveita
  g.supabaseClient = g.supabaseClient || g.supabase.createClient(g.MIEC_CONFIG.SUPA_URL, g.MIEC_CONFIG.SUPA_KEY);

  const sb = g.supabaseClient;

  async function init(){
    const { data:{ session } } = await sb.auth.getSession();
    if(session && g.HistoryService && g.HistoryService.startAutoSync){
      g.HistoryService.startAutoSync();
    }
    sb.auth.onAuthStateChange((_event, session) => {
      if(session && g.HistoryService && g.HistoryService.startAutoSync){
        g.HistoryService.startAutoSync();
      }
    });
  }

  async function signIn(email, password){ return sb.auth.signInWithPassword({ email, password }); }
  async function signOut(){ return sb.auth.signOut(); }
  async function getSession(){ return (await sb.auth.getSession()).data.session; }

  g.MIEC_AUTH = { init, signIn, signOut, getSession };
  // arranque automático
  init();
})();