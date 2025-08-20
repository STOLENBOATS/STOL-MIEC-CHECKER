// Robust HIN history loader with Supabase fallback and safe event bindings
(async function(){
  const $ = (s)=>document.querySelector(s);
  const on = (el, ev, fn)=>{ if(el) el.addEventListener(ev, fn, false); };

  // Elements (be permissive with ids/classes)
  const tbody = $('#historyBody') || document.querySelector('table tbody') || document.body;
  const exportBtn = $('#exportCsv') || $('#exportCsvWin') || document.querySelector('[data-action="export-csv"]');

  // Fetch data (Supabase → fallback localStorage)
  let rows = [];
  if (window.supa && window.supa.ready()){
    try { rows = await window.supa.listHIN(500); }
    catch(e){ console.warn('Supabase listHIN falhou:', e); rows = []; }
  } else {
    try { rows = JSON.parse(localStorage.getItem('winHistory') || '[]'); }
    catch(e){ rows = []; }
  }

  // Normalize shape
  rows = (rows || []).map(r => ({
    created_at: r.created_at || r.date || new Date().toISOString(),
    hin: r.hin || r.win || '',
    result_ok: !!(r.result_ok ?? r.ok),
    details: Array.isArray(r.details) ? r.details : (r.reason ? [r.reason] : []),
    photo_url: r.photo_url || (r.photo && r.photo.url) || ''
  }));

  // Render
  function fmtDate(iso){
    try{
      const d = new Date(iso);
      return d.toLocaleString('pt-PT');
    }catch(_){ return iso || ''; }
  }

  function rowHTML(r){
    const reason = (r.details && r.details.length) ? r.details.join(' • ') : '';
    const photo = r.photo_url ? `<a href="${r.photo_url}" target="_blank">foto</a>` : '<span class="muted">—</span>';
    return `<tr>
      <td>${fmtDate(r.created_at)}</td>
      <td>${r.hin || '—'}</td>
      <td>${r.result_ok ? '<span class="pill ok">Válido</span>' : '<span class="pill bad">Inválido</span>'}</td>
      <td>${reason}</td>
      <td>${photo}</td>
      <td class="thumb">${r.photo_url ? `<img src="${r.photo_url}" alt="miniatura">` : ''}</td>
    </tr>`;
  }

  function render(){
    if(!tbody) return;
    const html = rows.map(rowHTML).join('') || `<tr><td colspan="6" class="muted">Sem registos.</td></tr>`;
    tbody.innerHTML = html;
  }

  function exportCSV(){
    const head = ['Data/Date','HIN','Resultado/Result','Justificação/Reason','Foto/Photo'];
    const lines = [head.join(';')];
    rows.forEach(r=>{
      lines.push([
        fmtDate(r.created_at).replace(/;/g, ','),
        (r.hin||'').replace(/;/g, ','),
        r.result_ok ? 'Valido' : 'Invalido',
        ((r.details||[]).join(' | ') || '').replace(/;/g, ','),
        (r.photo_url||'')
      ].join(';'));
    });
    const blob = new Blob([lines.join('\\n')], {type: 'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'historico-hin.csv';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  }

  // Initial render + bind (safe)
  render();
  on(exportBtn, 'click', exportCSV);
})();