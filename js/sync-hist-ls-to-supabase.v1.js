// r6d (same as r6b, with alias hist_hin)
(function(){
  async function getClient(){ if(window.supabase&&window.SUPABASE_URL&&window.SUPABASE_ANON_KEY){ try{return window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY)}catch(e){} } return null; }
  async function getUserId(sb){ try{ const {data:{session}}=await sb.auth.getSession(); return session?.user?.id || null; }catch{return null;}
  }
  function read(k){ try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]} }
  function getSet(k){ try{return new Set(JSON.parse(localStorage.getItem(k)||'[]'))}catch{return new Set()} }
  function setSet(k,s){ try{localStorage.setItem(k, JSON.stringify(Array.from(s)))}catch{} }
  // alias hist_hin -> hist_win
  try{ const hin=localStorage.getItem('hist_hin'); if(hin && !localStorage.getItem('hist_win')) localStorage.setItem('hist_win',hin); }catch{}
  async function pushList(sb,uid,list,table,mapRow,uniqCols){
    const doneKey='synced_'+table, done=getSet(doneKey); let pushed=0;
    for(const it of list){ if(!it || done.has(it.ts)) continue; const row=mapRow(it,uid);
      try{ const { error }=await sb.from(table).upsert(row,{onConflict:uniqCols.join(','), ignoreDuplicates:true}).select('ts');
        if(!error){ done.add(it.ts); pushed++; } else { console.warn('[sync]',table,'erro:',error.message||error); } }
      catch(e){ console.warn('[sync]',table,'falhou',e); } }
    if(pushed) setSet(doneKey,done); return pushed;
  }
  async function syncNow(){
    const sb=await getClient(); if(!sb){ console.warn('[sync] sem supabase client'); return {ok:false}; }
    const uid=await getUserId(sb); if(!uid){ console.warn('[sync] sem sessão'); return {ok:false}; }
    const win=[...read('hist_win'), ...read('hist_hin')];
    const pushedWin=await pushList(sb,uid,win,'history_win',(it,uid)=>({
      user_id:uid, ts:Number(it.ts)||Date.now(), win:it.win||it.hin||'',
      result:(it.ok===false)?'Inválido':'Válido',
      reason: (typeof it.details==='string')?it.details: (Array.isArray(it.details)? it.details.join(' | ') : ''),
      photo: it.photo||'', certificate: it.certNumber||'', issuer: it.certIssuer||'',
      version:'', device:navigator.userAgent.slice(0,190)
    }),['user_id','ts','win']);
    const mot=read('hist_motor');
    const pushedMot=await pushList(sb,uid,mot,'history_motor',(it,uid)=>({
      user_id:uid, ts:Number(it.ts)||Date.now(), brand:it.brand||'', ident:it.sn||it.ident||'',
      result:(it.ok===false)?'Inválido':'Válido',
      reason:(typeof it.details==='string')?it.details:(Array.isArray(it.details)? it.details.join(' | '):''),
      photo:it.photo||'', certificate:'', issuer:'', version:'', device:navigator.userAgent.slice(0,190)
    }),['user_id','ts','brand','ident']);
    return { ok:true, pushedWin, pushedMot };
  }
  let timer=null; function start(){ if(timer) return; timer=setInterval(()=>{ if(document.visibilityState==='visible') syncNow().catch(()=>{}); }, 5000); }
  document.addEventListener('visibilitychange',start,{once:true}); window.addEventListener('load',start,{once:true});
  window.MIEC_SYNC_LS={ syncNow };
})();