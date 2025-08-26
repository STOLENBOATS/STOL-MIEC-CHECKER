// supa-sync.v1.1.js — suporte opcional a certificate/issuer (WIN)
// Ativa via MIEC_CONFIG.SYNC_EXTRA_WIN_FIELDS = true após aplicar schema_delta.sql
(function(){
  const g = window;
  const cfg = g.MIEC_CONFIG || g;
  const SUPA_URL = cfg.SUPA_URL || cfg.SUPABASE_URL;
  const SUPA_KEY = cfg.SUPA_KEY || cfg.SUPABASE_ANON_KEY;
  const APP_VERSION = cfg.APP_VERSION || 'v4.2.1-auth-min — 2025-08-26';
  const SYNC_EXTRA = !!cfg.SYNC_EXTRA_WIN_FIELDS;

  let sb = g.supabaseClient;
  if (!sb && g.supabase && SUPA_URL && SUPA_KEY) {
    try { sb = g.supabase.createClient(SUPA_URL, SUPA_KEY); } catch(e){}
  }

  function noop(){ return Promise.resolve({ ok:false, reason:'no-supabase' }); }

  const LS = {
    OUTBOX: 'miec_sync_outbox_v1',
    LAST_PULL_AT: 'miec_sync_last_pull_at',
    WIN: 'miec_history_win',
    MOTOR: 'miec_history_motor',
  };

  function parse(v, fallback){ try { return JSON.parse(v); } catch { return fallback; } }
  function save(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

  async function getUserId(){
    if(!sb) return null;
    try {
      const { data: { session } } = await sb.auth.getSession();
      return session?.user?.id || null;
    } catch { return null; }
  }

  function dedupe(rows, keyFn){
    const seen = new Set(), out = [];
    for(const e of rows){
      const k = keyFn(e);
      if(!seen.has(k)){ seen.add(k); out.push(e); }
    }
    return out;
  }

  function mergeLocalWins(newRows){
    const cur = parse(localStorage.getItem(LS.WIN), []) || [];
    const normalized = newRows.map(r => ({
      ts: r.ts, win: r.win, result: r.result, reason: r.reason,
      certificate: r.certificate || '', issuer: r.issuer || '',
      photo: r.photo, version: r.version, device: r.device
    }));
    const merged = dedupe([...cur, ...normalized], (x)=>`${x.ts}|${x.win}`);
    save(LS.WIN, merged);
    return merged;
  }
  function mergeLocalMotors(newRows){
    const cur = parse(localStorage.getItem(LS.MOTOR), []) || [];
    const merged = dedupe([...cur, ...newRows.map(r => ({
      ts: r.ts, brand: r.brand, ident: r.ident, result: r.result, reason: r.reason, photo: r.photo,
      version: r.version, device: r.device
    }))], (x)=>`${x.ts}|${x.brand}|${x.ident}`);
    save(LS.MOTOR, merged);
    return merged;
  }

  async function pullAll(){
    if(!sb) return { ok:false, reason:'no-supabase' };
    const user_id = await getUserId();
    if(!user_id) return { ok:false, reason:'no-session' };

    const winCols = 'user_id, ts, win, result, reason, photo, version, device' + (SYNC_EXTRA ? ', certificate, issuer' : '');
    const { data: wins, error: e1 } = await sb.from('history_win').select(winCols).eq('user_id', user_id);
    if(!e1 && Array.isArray(wins)) mergeLocalWins(wins);

    const { data: motors, error: e2 } = await sb
      .from('history_motor')
      .select('user_id, ts, brand, ident, result, reason, photo, version, device')
      .eq('user_id', user_id);
    if(!e2 && Array.isArray(motors)) mergeLocalMotors(motors);

    save(LS.LAST_PULL_AT, Date.now());
    return { ok:true, wins: wins?.length||0, motors: motors?.length||0 };
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
      if(it.type === 'win'){
        const p = Object.assign({}, it.payload, { user_id });
        if(!SYNC_EXTRA){ delete p.certificate; delete p.issuer; }
        wins.push(p);
      } else if(it.type === 'motor'){
        motors.push(Object.assign({}, it.payload, { user_id }));
      }
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
      const remaining = outbox.filter(it => false); // todos enviados nesta versão
      save(LS.OUTBOX, remaining);
    }
    return { ok:true, pushed };
  }

  async function syncNow(){
    await pushOutbox();
    await pullAll();
  }

  g.MIEC_SYNC = {
    isEnabled: !!sb,
    client: sb || null,
    pullAll: sb ? pullAll : noop,
    pushOutbox: sb ? pushOutbox : noop,
    enqueue: (type, payload)=>{
      const outbox = parse(localStorage.getItem(LS.OUTBOX), []) || [];
      outbox.push({ type, payload });
      save(LS.OUTBOX, outbox);
    },
    syncNow: sb ? syncNow : noop
  };
})();