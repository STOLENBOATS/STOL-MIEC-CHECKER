// js/historico-motor.r6.js
(async function(){
  const H = window.MIEC_HIST || {};
  const headers = ['Data','Marca','Ident','Resultado','Justificação','Foto'];
  const tbody = H.ensureTable('histHost', headers);
  function addRow(r){
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${H.fmtTs(r.ts)}</td>
                    <td>${H.esc(r.brand)}</td>
                    <td>${H.esc(r.ident||'')}</td>
                    <td>${H.esc(r.result||'')}</td>
                    <td>${H.esc(r.reason||'')}</td>
                    <td>${H.thumbCell(r.photo)}</td>`;
    tbody.appendChild(tr);
  }
  const sb = await H.getClient();
  let ok=false;
  if (sb){
    const uid = await H.getSessionUserId(sb);
    if (uid){
      try{
        const { data, error } = await sb.from('history_motor')
          .select('ts,brand,ident,result,reason,photo')
          .eq('user_id', uid).order('ts',{ascending:false}).limit(300);
        if (!error && Array.isArray(data)){ data.forEach(addRow); ok=true; }
      }catch(e){ console.warn('[hist-motor] supabase falhou', e); }
    }
  }
  if(!ok){
    const local = H.readLocal(['hist_motor','miec_history_motor_v1','miec_sync_outbox_v1']);
    const rows = [];
    for (const it of local){
      if (!it) continue;
      const row = it.row || it;
      if (row.brand) rows.push({
        ts: row.ts, brand: row.brand, ident: row.ident||row.sn||'',
        result: row.result||(row.ok===false?'Inválido':'Válido'),
        reason: row.reason || (typeof row.details==='string'?row.details: Array.isArray(row.details)? row.details.join(' | ') : ''),
        photo: row.photo||''
      });
    }
    rows.sort((a,b)=> (b.ts||0)-(a.ts||0)).forEach(addRow);
  }
  if (!tbody.children.length){
    const tr=document.createElement('tr');
    const td=document.createElement('td'); td.colSpan=6; td.textContent='Sem registos.';
    tr.appendChild(td); tbody.appendChild(tr);
  }
})();