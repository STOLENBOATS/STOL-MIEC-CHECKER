(function(){
  const CANON_KEY = 'miec_history_win';
  const tbody = document.getElementById('winTbody');

  function parseMaybe(v){ try { return JSON.parse(v); } catch { return null; } }
  function normEntry(e){
    if(!e) return null;
    return {
      ts: e.ts || e.timestamp || e.date || Date.now(),
      win: e.win || e.hin || e.numero || e.number || '',
      result: e.result || e.status || '',
      reason: e.reason || e.justification || e.motivo || e.message || '',
      photo: e.photo || e.foto || e.image || ''
    };
  }

  function migrateToCanon(){
    const canon = parseMaybe(localStorage.getItem(CANON_KEY)) || [];
    const seen = new Set(canon.map(x => `${x.ts}|${x.win}`));

    // 1) Coleções prováveis (arrays)
    const collectionKeys = [
      'miec_history_win', 'winHistory', 'historicoWIN', 'history_win'
    ];
    for(const k of collectionKeys){
      const arr = parseMaybe(localStorage.getItem(k));
      if(Array.isArray(arr)){
        for(const raw of arr){
          const e = normEntry(raw);
          if(e && e.win && !seen.has(`${e.ts}|${e.win}`)){
            canon.push(e); seen.add(`${e.ts}|${e.win}`);
          }
        }
      }
    }

    // 2) Itens soltos no localStorage que pareçam WIN
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(!k) continue;
      if(/win/i.test(k) || /hin/i.test(k)){
        const raw = parseMaybe(localStorage.getItem(k));
        if(raw && typeof raw === 'object'){
          const e = normEntry(raw);
          if(e && e.win && !seen.has(`${e.ts}|${e.win}`)){
            canon.push(e); seen.add(`${e.ts}|${e.win}`);
          }
        }
      }
    }

    localStorage.setItem(CANON_KEY, JSON.stringify(canon));
    return canon;
  }

  function render(rows){
    if(!rows.length){
      tbody.innerHTML = `<tr><td colspan="5" class="cell-muted">Sem registos.</td></tr>`;
      return;
    }
    rows.sort((a,b)=> (b.ts||0)-(a.ts||0));
    tbody.innerHTML = rows.map(r => {
      const badge = r.result && /valid|ok|válid/i.test(r.result)
        ? `<span class="badge ok">${r.result}</span>`
        : r.result ? `<span class="badge err">${r.result}</span>` : '';
      const img = r.photo ? `<img class="thumb" src="${r.photo}" alt="foto WIN">` : '';
      const date = new Date(r.ts).toLocaleString('pt-PT');
      return `<tr>
        <td>${date}</td>
        <td class="wrap"><strong>${r.win||''}</strong></td>
        <td>${badge}</td>
        <td class="wrap">${r.reason||''}</td>
        <td>${img}</td>
      </tr>`;
    }).join('');
  }

  const data = migrateToCanon();
  render(data);
})();