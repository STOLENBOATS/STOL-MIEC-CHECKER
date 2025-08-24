function renderWin(){
  const tbody = document.querySelector('#tblWin tbody');
  const list = JSON.parse(localStorage.getItem('hist_win') || '[]');
  tbody.innerHTML = '';
  for(const item of list){
    const tr = document.createElement('tr');
    const dt = new Date(item.ts).toLocaleString();
    tr.innerHTML = `
      <td>${dt}</td>
      <td class="code">${item.win} ${item.pre1998?'<span title="Pré-1998" class="badge warn">⚠️</span>':''}</td>
      <td>${item.ok ? '✅ Válido' : '❌ Inválido'}</td>
      <td>${item.details || ''}</td>
      <td>${item.certNumber || '—'}</td>
      <td>${item.certIssuer || '—'}</td>
      <td>${item.photo ? `<img class="preview-img" src="${item.photo}">` : '—'}</td>
    `;
    tbody.appendChild(tr);
  }
}

function exportCSV(){
  const list = JSON.parse(localStorage.getItem('hist_win') || '[]');
  const rows = [['Data','HIN','Resultado','Justificação','Certificado','Entidade']];
  for(const i of list){
    rows.push([new Date(i.ts).toISOString(), i.win, i.ok?'Valido':'Invalido', (i.details||'').replace(/\n/g,' '), i.certNumber||'', i.certIssuer||'']);
  }
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'historico_win.csv';
  a.click();
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderWin();
  document.getElementById('exportCsv').addEventListener('click', exportCSV);
});
