// supa-sync.v1.2.js — suporte a certificate/issuer em WIN e MOTOR (via flags)
(function(){
  const g = window;
  const cfg = g.MIEC_CONFIG || g;
  const SUPA_URL = cfg.SUPA_URL || cfg.SUPABASE_URL;
  const SUPA_KEY = cfg.SUPA_KEY || cfg.SUPABASE_ANON_KEY;
  const SYNC_EXTRA_WIN = !!cfg.SYNC_EXTRA_WIN_FIELDS;
  const SYNC_EXTRA_MOTOR = !!cfg.SYNC_EXTRA_MOTOR_FIELDS;

  let sb = g.supabaseClient;
  if (!sb && g.supabase && SUPA_URL && SUPA_KEY) {
    try { sb = g.supabase.createClient(SUPA_URL, SUPA_KEY); } catch(e){}
  }
  function noop(){ return Promise.resolve({ ok:false, reason:'no-supabase' }); }

  const LS = { OUTBOX:'miec_sync_outbox_v1', LAST_PULL_AT:'miec_sync_last_pull_at', WIN:'miec_history_win', MOTOR:'miec_history_motor' };
  const parse = (v,f)=>{ try { return JSON.parse(v); } catch { return f; } };
  const save  = (k,v)=>{ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  async function getUserId(){ if(!sb) return null; try { const { data:{ session } } = await sb.auth.getSession(); return session?.user?.id||null; } catch { return null; } }
  function dedupe(rows,kfn){ const s=new Set(),o=[]; for(const e of rows){ const k=kfn(e); if(!s.has(k)){ s.add(k); o.push(e);} } return o; }

  function mergeLocalWins(rows){
    const cur=parse(localStorage.getItem(LS.WIN),[])||[];
    const norm=rows.map(r=>({ ts:r.ts, win:r.win, result:r.result, reason:r.reason, certificate:r.certificate||'', issuer:r.issuer||'', photo:r.photo, version:r.version, device:r.device }));
    const merged=dedupe([...cur,...norm],x=>`${x.ts}|${x.win}`); save(LS.WIN,merged); return merged;
  }
  function mergeLocalMotors(rows){
    const cur=parse(localStorage.getItem(LS.MOTOR),[])||[];
    const norm=rows.map(r=>({ ts:r.ts, brand:r.brand, ident:r.ident, result:r.result, reason:r.reason, certificate:r.certificate||'', issuer:r.issuer||'', photo:r.photo, version:r.version, device:r.device }));
    const merged=dedupe([...cur,...norm],x=>`${x.ts}|${x.brand}|${x.ident}`); save(LS.MOTOR,merged); return merged;
  }

  async function pullAll(){
    if(!sb) return {ok:false, reason:'no-supabase'};
    const user_id = await getUserId(); if(!user_id) return {ok:false, reason:'no-session'};

    let winCols='user_id, ts, win, result, reason, photo, version, device'; if(SYNC_EXTRA_WIN) winCols+=', certificate, issuer';
    let { data:wins, error:e1 } = await sb.from('history_win').select(winCols).eq('user_id', user_id);
    if (e1 && /column .* does not exist/i.test(e1.message||'')) { ({data:wins} = await sb.from('history_win').select('user_id, ts, win, result, reason, photo, version, device').eq('user_id', user_id)); }
    if(Array.isArray(wins)) mergeLocalWins(wins);

    let motorCols='user_id, ts, brand, ident, result, reason, photo, version, device'; if(SYNC_EXTRA_MOTOR) motorCols+=', certificate, issuer';
    let { data:motors, error:e2 } = await sb.from('history_motor').select(motorCols).eq('user_id', user_id);
    if (e2 && /column .* does not exist/i.test(e2.message||'')) { ({data:motors} = await sb.from('history_motor').select('user_id, ts, brand, ident, result, reason, photo, version, device').eq('user_id', user_id)); }
    if(Array.isArray(motors)) mergeLocalMotors(motors);

    save(LS.LAST_PULL_AT, Date.now()); return { ok:true, wins:wins?.length||0, motors:motors?.length||0 };
  }

  async function pushOutbox(){
    if(!sb) return {ok:false, reason:'no-supabase'};
    const user_id = await getUserId(); if(!user_id) return {ok:false, reason:'no-session'};
    const outbox=parse(localStorage.getItem(LS.OUTBOX),[])||[]; if(!outbox.length) return {ok:true, pushed:0};

    const wins=[], motors=[];
    for(const it of outbox){
      if(it.type==='win'){ const p={...it.payload, user_id}; if(!SYNC_EXTRA_WIN){ delete p.certificate; delete p.issuer; } wins.push(p); }
      else if(it.type==='motor'){ const p={...it.payload, user_id}; if(!SYNC_EXTRA_MOTOR){ delete p.certificate; delete p.issuer; } motors.push(p); }
    }

    let pushed=0;
    if(wins.length){ const { error } = await sb.from('history_win').upsert(wins, { onConflict:'user_id,ts,win' }); if(!error) pushed+=wins.length; }
    if(motors.length){ const { error } = await sb.from('history_motor').upsert(motors, { onConflict:'user_id,ts,brand,ident' }); if(!error) pushed+=motors.length; }

    if(pushed) save(LS.OUTBOX, []);
    return { ok:true, pushed };
  }

  async function syncNow(){ await pushOutbox(); await pullAll(); }

  g.MIEC_SYNC = {
    isEnabled: !!sb, client: sb || null,
    pullAll: sb ? pullAll : noop, pushOutbox: sb ? pushOutbox : noop,
    enqueue: (type,payload)=>{ const ob=parse(localStorage.getItem(LS.OUTBOX),[])||[]; ob.push({type,payload}); save(LS.OUTBOX,ob); },
    syncNow: sb ? syncNow : noop
  };
})();
// injected safe pushOutbox

async function pushOutbox(){
  try{
    const raw = JSON.parse(localStorage.getItem('miec_sync_outbox_v1')||'[]');
    if (!raw.length) return { ok:true, pushed: 0 };
    const { data:userData } = await client.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) return { ok:false, reason:'no-user' };

    const wins = [], motors = [];
    for (const item of raw){
      if (item.type === 'win'){
        wins.push({
          user_id,
          ts: item.ts,
          win: (item.win||'').trim(),
          result: item.result||null,
          reason: item.reason||null,
          photo: item.photo||null,
          certificate: item.certificate||null,
          issuer: item.issuer||null,
          version: item.version||null,
          device: item.device||null,
        });
      }else if (item.type === 'motor'){
        motors.push({
          user_id,
          ts: item.ts,
          brand: (item.brand||'').trim(),
          ident: (item.ident||'').trim(),
          result: item.result||null,
          reason: item.reason||null,
          photo: item.photo||null,
          certificate: item.certificate||null,
          issuer: item.issuer||null,
          version: item.version||null,
          device: item.device||null,
        });
      }
    }

    if (wins.length){
      const { error } = await client.from('history_win').upsert(wins, { onConflict:'user_id,ts,win' });
      if (error) console.warn('[sync] upsert wins error', error);
    }
    if (motors.length){
      const { error } = await client.from('history_motor').upsert(motors, { onConflict:'user_id,ts,brand,ident' });
      if (error) console.warn('[sync] upsert motors error', error);
    }

    localStorage.setItem('miec_sync_outbox_v1', '[]');
    return { ok:true, pushed: wins.length + motors.length };
  }catch(e){
    console.warn('[sync] pushOutbox fail', e);
    return { ok:false, reason: e.message||String(e) };
  }
}

