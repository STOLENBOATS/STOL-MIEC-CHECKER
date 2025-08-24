function renderMotor(){
  const tbody = document.querySelector('#tblMotor tbody');
  const list = JSON.parse(localStorage.getItem('hist_motor') || '[]');
  tbody.innerHTML = '';
  for(const item of list){
    const tr = document.createElement('tr');
    const dt = new Date(item.ts).toLocaleString();
    tr.innerHTML = `
      <td>${dt}</td>
      <td>${item.brand||''}</td>
      <td class="code">${item.model||''}</td>
      <td class="code">${item.sn||''}</td>
      <td>${item.ok ? '✅ Válido' : '❌ Inválido'}</td>
      <td>${item.details || ''}</td>
      <td>${item.photo ? `<img class="preview-img" src="${item.photo}">` : '—'}</td>
    `;
    tbody.appendChild(tr);
  }
}

function exportCSV(){
  const list = JSON.parse(localStorage.getItem('hist_motor') || '[]');
  const rows = [['Data','Marca','Modelo','NSerie','Resultado','Justificação']];
  for(const i of list){
    rows.push([new Date(i.ts).toISOString(), i.brand||'', i.model||'', i.sn||'', i.ok?'Valido':'Invalido', (i.details||'').replace(/\n/g,' ')]);
  }
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'historico_motor.csv';
  a.click();
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderMotor();
  document.getElementById('exportCsv').addEventListener('click', exportCSV);
});
