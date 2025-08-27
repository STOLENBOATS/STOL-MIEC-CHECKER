// historico-motor.js — v1.2.1 (order fix: newest first, robust ts)
(function(){
  function $(s, r=document){ return r.querySelector(s); }
  function parseMaybe(v){ try { return JSON.parse(v); } catch { return null; } }

  
function tsNum(x){
  const t = (x && (x.ts ?? x.timestamp ?? x.date)) || 0;
  if (typeof t === 'number') return t;
  if (typeof t === 'string'){
    const n = Number(t);
    if (!Number.isNaN(n)) return n;
    const d = Date.parse(t);
    if (!Number.isNaN(d)) return d;
  }
  return 0;
}


  function ensureTbody(){
    let tbody = $('#motorTbody') || $('#motorTable tbody') || document.querySelector('tbody');
    if(!tbody){
      const table = $('#motorTable') || document.querySelector('table');
      if(table){ tbody = document.createElement('tbody'); tbody.id = 'motorTbody'; table.appendChild(tbody); }
    }
    return tbody;
  }

  function normEntry(e){
    if(!e) return null;
    const ok = typeof e.ok === 'boolean' ? e.ok : undefined;
    const resStr = e.result || (ok === true ? 'Válido' : ok === false ? 'Inválido' : '');
    const reason = e.reason || e.details || e.justification || e.motivo || e.message || '';
    const ident = e.ident || [e.model, e.code, e.sn, e.serial].filter(Boolean).join(' ').trim();
    return { ts: e.ts||e.timestamp||e.date||Date.now(), brand: e.brand||e.marca||'', ident, result: resStr, reason, photo: e.photo||e.foto||'', certificate: e.certificate||'', issuer: e.issuer||'' };
  }

  function migrateToCanon(){
    const CANON = 'miec_history_motor';
    const canon = parseMaybe(localStorage.getItem(CANON)) || [];
    const seen = new Set(canon.map(x => `${x.ts}|${x.brand}|${x.ident}`));
    const keys = ['miec_history_motor','motorHistory','historicoMOTOR','history_motor','hist_motor'];
    for(const k of keys){
      const arr = parseMaybe(localStorage.getItem(k));
      if(Array.isArray(arr)){ for(const raw of arr){ const e = normEntry(raw); if(e && e.ident && !seen.has(`${e.ts}|${e.brand}|${e.ident}`)){ canon.push(e); seen.add(`${e.ts}|${e.brand}|${e.ident}`);} } }
    }
    try { localStorage.setItem(CANON, JSON.stringify(canon)); } catch {}
    return canon;
  }

  function render(rows){
    const tbody = ensureTbody(); if(!tbody) return;
    const table = tbody.closest('table');
    const cols = table && table.tHead ? table.tHead.rows[0].cells.length : 6;

    if(!rows.length){ tbody.innerHTML = `<tr><td colspan="${cols}" class="cell-muted">Sem registos.</td></tr>`; return; }
    rows.sort((a,b)=> tsNum(b)-tsNum(a)); // NEWEST FIRST

    tbody.innerHTML = rows.map(r => {
      const badge = r.result && /valid|ok|válid/i.test(r.result) ? `<span class="badge ok">${r.result}</span>` : r.result ? `<span class="badge err">${r.result}</span>` : '';
      const img = r.photo ? `<img class="thumb" src="${r.photo}" alt="foto motor">` : '';
      const date = new Date(tsNum(r)).toLocaleString('pt-PT');
      return `<tr>
        <td>${date}</td>
        <td><strong>${r.brand||''}</strong></td>
        <td class="wrap">${r.ident||''}</td>
        <td>${badge}</td>
        <td class="wrap">${r.reason||''}</td>
        <td>${img}</td>
      </tr>`;
    }).join('');
  }

  function boot(){ render(migrateToCanon()); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();