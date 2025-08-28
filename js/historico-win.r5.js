// js/historico-win.r5.js — robust loader for HIN history
(async function(){
  const H = window.MIEC_HIST || {};
  const headers = ['Data','HIN','Resultado','Justificação','Entidade','Foto'];
  const tbody = H.ensureTable('histHost', headers);
  function addRow(r){
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${H.fmtTs(r.ts)}</td>
                    <td>${H.esc(r.win)}</td>
                    <td>${H.esc(r.result||'')}</td>
                    <td>${H.esc(r.reason||'')}</td>
                    <td>${H.esc(r.issuer||'')}</td>
                    <td>${H.thumbCell(r.photo)}</td>`;
    tbody.appendChild(tr);
  }
  // 1) Try Supabase
  const sb = await H.getClient();
  let ok=false;
  if (sb){
    const uid = await H.getSessionUserId(sb);
    if (uid){
      try{
        const { data, error } = await sb.from('history_win')
          .select('ts,win,result,reason,photo,issuer')
          .eq('user_id', uid)
          .order('ts',{ascending:false})
          .limit(300);
        if (!error && Array.isArray(data)){
          data.forEach(addRow); ok=true;
        }
      }catch(e){ console.warn('[hist-win] supabase falhou', e); }
    }
  }
  // 2) Fallback: local caches
  if(!ok){
    const local = H.readLocal(['miec_history_win_v1','miec_sync_outbox_v1']);
    const rows = [];
    for (const it of local){
      if (it && (it.table==='history_win' || it.win)){
        const r = it.row || it; rows.push(r);
      }
    }
    rows.sort((a,b)=> (b.ts||0)-(a.ts||0)).forEach(addRow);
  }
  if (!tbody.children.length){
    const tr=document.createElement('tr');
    const td=document.createElement('td'); td.colSpan=6; td.textContent='Sem registos.';
    tr.appendChild(td); tbody.appendChild(tr);
  }
})();