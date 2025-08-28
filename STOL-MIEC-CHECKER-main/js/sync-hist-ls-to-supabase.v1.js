
// js/sync-hist-ls-to-supabase.v1.js
// Sincroniza localStorage ('hist_win' / 'hist_motor') para Supabase (history_win / history_motor).

(function(){
  async function getClient(){
    try{
      if (window.supabase) return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }catch(e){}
    return null;
  }
  async function getUserId(sb){
    try{ const { data:{ session } } = await sb.auth.getSession(); return session?.user?.id || null; }catch{ return null; }
  }
  function read(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch{ return []; } }
  function write(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch{} }
  function getSet(key){ try{ return new Set(JSON.parse(localStorage.getItem(key)||'[]')); }catch{ return new Set(); } }
  function setSet(key, set){ try{ localStorage.setItem(key, JSON.stringify(Array.from(set))); }catch{} }

  async function pushList(sb, uid, key, table, mapRow, uniqCols){
    const list = read(key);
    const doneKey = 'synced_'+key;
    const done = getSet(doneKey);
    let pushed=0;
    for (const it of list){
      if (!it || done.has(it.ts)) continue;
      const row = mapRow(it, uid);
      try{
        const q = sb.from(table).upsert(row, { onConflict: uniqCols.join(','), ignoreDuplicates:true }).select('ts');
        const { data, error } = await q;
        if (!error){
          done.add(it.ts); pushed++;
        } else {
          console.warn('[sync]', table, 'erro:', error.message||error);
        }
      }catch(e){ console.warn('[sync]', table, 'falhou', e); }
    }
    if (pushed) setSet(doneKey, done);
    return pushed;
  }

  async function syncNow(){
    const sb = await getClient(); if(!sb){ console.warn('[sync] sem supabase client'); return {ok:false}; }
    const uid = await getUserId(sb); if(!uid){ console.warn('[sync] sem sessão'); return {ok:false}; }

    const pushedWin = await pushList(
      sb, uid, 'hist_win', 'history_win',
      (it, uid)=> ({
        user_id: uid,
        ts: Number(it.ts)||Date.now(),
        win: it.win||it.hin||'',
        result: (it.ok===false)?'Inválido':'Válido',
        reason: (typeof it.details==='string')?it.details: (Array.isArray(it.details)? it.details.join(' | ') : ''),
        photo: it.photo||'',
        certificate: it.certNumber||'',
        issuer: it.certIssuer||'',
        version: '',
        device: navigator.userAgent.slice(0,190)
      }),
      ['user_id','ts','win']
    );

    const pushedMot = await pushList(
      sb, uid, 'hist_motor', 'history_motor',
      (it, uid)=> ({
        user_id: uid,
        ts: Number(it.ts)||Date.now(),
        brand: it.brand||'',
        ident: it.sn||it.ident||'',
        result: (it.ok===false)?'Inválido':'Válido',
        reason: (typeof it.details==='string')?it.details: (Array.isArray(it.details)? it.details.join(' | ') : ''),
        photo: it.photo||'',
        certificate: '',
        issuer: '',
        version: '',
        device: navigator.userAgent.slice(0,190)
      }),
      ['user_id','ts','brand','ident']
    );

    return { ok:true, pushedWin, pushedMot };
  }

  // Auto: tenta sincronizar a cada 5s quando a página está visível
  let timer=null;
  function start(){
    if (timer) return;
    timer = setInterval(()=>{
      if (document.visibilityState==='visible') syncNow().catch(()=>{});
    }, 5000);
  }
  document.addEventListener('visibilitychange', start, { once:true });
  window.addEventListener('load', start, { once:true });

  // Expor manual
  window.MIEC_SYNC_LS = { syncNow };
})();
