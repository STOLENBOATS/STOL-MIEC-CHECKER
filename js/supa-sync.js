// MIEC — supa-sync.js (Patch #2)
// Sincronização offline-first para históricos usando Supabase
// Requisitos: window.supabase (v2), SUPA_URL, SUPA_KEY e auth ativa (session)

(function(){
  const g = window;
  const cfg = g.MIEC_CONFIG || g;
  const SUPA_URL = cfg.SUPA_URL || cfg.SUPABASE_URL;
  const SUPA_KEY = cfg.SUPA_KEY || cfg.SUPABASE_ANON_KEY;
  const APP_VERSION = cfg.APP_VERSION || 'v4.2.1-auth-min — 2025-08-26';

  let sb = g.supabaseClient;
  if (!sb && g.supabase && SUPA_URL && SUPA_KEY) {
    try { sb = g.supabase.createClient(SUPA_URL, SUPA_KEY); }
    catch(e){ /* ignore */ }
  }

  // No-op if not configured
  function noop(){ return Promise.resolve({ ok:false, reason:'no-supabase' }); }

  const LS = {
    OUTBOX: 'miec_sync_outbox_v1',
    LAST_PULL_AT: 'miec_sync_last_pull_at',
    WIN: 'miec_history_win',
    MOTOR: 'miec_history_motor',
  };

  function parse(v, fallback){
    try { return JSON.parse(v); } catch { return fallback; }
  }
  function save(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  function getUserAgent(){ try { return navigator.userAgent; } catch { return ''; } }

  async function getUserId(){
    if(!sb) return null;
    try {
      const { data: { session } } = await sb.auth.getSession();
      return session?.user?.id || null;
    } catch { return null; }
  }

  function dedupeWins(arr){
    const seen = new Set();
    const out = [];
    for(const e of arr){
      const key = `${e.user_id || ''}|${e.ts || 0}|${(e.win||'').trim()}`;
      if(!seen.has(key)){ seen.add(key); out.push(e); }
    }
    return out;
  }
  function dedupeMotors(arr){
    const seen = new Set();
    const out = [];
    for(const e of arr){
      const key = `${e.user_id || ''}|${e.ts || 0}|${(e.brand||'').trim()}|${(e.ident||'').trim()}`;
      if(!seen.has(key)){ seen.add(key); out.push(e); }
    }
    return out;
  }

  function mergeLocalWins(newRows){
    const cur = parse(localStorage.getItem(LS.WIN), []) || [];
    const merged = dedupeWins([...cur, ...newRows.map(r => ({
      ts: r.ts, win: r.win, result: r.result, reason: r.reason, photo: r.photo,
      version: r.version, device: r.device
    }))]);
    save(LS.WIN, merged);
    return merged;
  }
  function mergeLocalMotors(newRows){
    const cur = parse(localStorage.getItem(LS.MOTOR), []) || [];
    const merged = dedupeMotors([...cur, ...newRows.map(r => ({
      ts: r.ts, brand: r.brand, ident: r.ident, result: r.result, reason: r.reason, photo: r.photo,
      version: r.version, device: r.device
    }))]);
    save(LS.MOTOR, merged);
    return merged;
  }

  async function pullAll(){
    if(!sb) return { ok:false, reason:'no-supabase' };
    const user_id = await getUserId();
    if(!user_id) return { ok:false, reason:'no-session' };

    // opcional: last pull filter (não estritamente necessário)
    const lastPull = parse(localStorage.getItem(LS.LAST_PULL_AT), 0) || 0;

    // fetch wins
    const { data: wins, error: e1 } = await sb
      .from('history_win')
      .select('user_id, ts, win, result, reason, photo, version, device')
      .eq('user_id', user_id);

    if(!e1 && Array.isArray(wins)) mergeLocalWins(wins);

    // fetch motors
    const { data: motors, error: e2 } = await sb
      .from('history_motor')
      .select('user_id, ts, brand, ident, result, reason, photo, version, device')
      .eq('user_id', user_id);

    if(!e2 && Array.isArray(motors)) mergeLocalMotors(motors);

    save(LS.LAST_PULL_AT, Date.now());
    return { ok:true, wins: !!wins && !e1 ? wins.length : 0, motors: !!motors && !e2 ? motors.length : 0 };
  }

  async function pushOutbox(){
    if(!sb) return { ok:false, reason:'no-supabase' };
    const user_id = await getUserId();
    if(!user_id) return { ok:false, reason:'no-session' };

    const outbox = parse(localStorage.getItem(LS.OUTBOX), []) || [];
    if(!outbox.length) return { ok:true, pushed:0 };

    const wins = [];
    const motors = [];
    for(const it of outbox){
      const payload = Object.assign({}, it.payload);
      payload.user_id = user_id;
      if(it.type === 'win') wins.push(payload);
      else if(it.type === 'motor') motors.push(payload);
    }

    let pushed = 0;

    if(wins.length){
      const { error } = await sb.from('history_win').upsert(wins, { onConflict: 'user_id,ts,win' });
      if(!error) pushed += wins.length;
    }
    if(motors.length){
      const { error } = await sb.from('history_motor').upsert(motors, { onConflict: 'user_id,ts,brand,ident' });
      if(!error) pushed += motors.length;
    }

    if(pushed){
      // limpa outbox dos itens que foram enviados
      const remaining = outbox.filter(it => {
        if(it.type === 'win') return false;
        if(it.type === 'motor') return false;
        return true;
      });
      try { localStorage.setItem(LS.OUTBOX, JSON.stringify(remaining)); } catch {}
    }

    return { ok:true, pushed };
  }

  function enqueue(type, payload){
    const outbox = (function(){ try { return JSON.parse(localStorage.getItem(LS.OUTBOX)) || []; } catch { return []; } })();
    outbox.push({ type, payload });
    try { localStorage.setItem(LS.OUTBOX, JSON.stringify(outbox)); } catch {}
  }

  async function syncNow(){
    await pushOutbox();
    await pullAll();
  }

  // Expor API
  g.MIEC_SYNC = {
    isEnabled: !!sb,
    client: sb || null,
    pullAll: sb ? pullAll : noop,
    pushOutbox: sb ? pushOutbox : noop,
    enqueue,
    syncNow: sb ? syncNow : noop
  };
})();