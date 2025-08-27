// historico-win.js — v1.2.1 (order fix: newest first, robust ts)
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
    let tbody = $('#winTbody') || $('#winTable tbody') || document.querySelector('tbody');
    if(!tbody){
      const table = $('#winTable') || document.querySelector('table');
      if(table){ tbody = document.createElement('tbody'); tbody.id = 'winTbody'; table.appendChild(tbody); }
    }
    return tbody;
  }

  function normEntry(e){
    if(!e) return null;
    const ok = typeof e.ok === 'boolean' ? e.ok : undefined;
    const resStr = e.result || (ok === true ? 'Válido' : ok === false ? 'Inválido' : '');
    const reason = e.reason || e.details || e.justification || e.motivo || e.message || '';
    const certificate = e.certificate || e.cert || e.certNumber || '';
    const issuer = e.issuer || e.entidade || e.entity || e.certIssuer || '';

    return { ts: e.ts||e.timestamp||e.date||Date.now(), win: e.win||e.hin||'', result: resStr, reason, certificate, issuer, photo: e.photo||e.foto||'' };
  }

  function migrateToCanon(){
    const CANON = 'miec_history_win';
    const canon = parseMaybe(localStorage.getItem(CANON)) || [];
    const seen = new Set(canon.map(x => `${x.ts}|${x.win}`));
    const keys = ['miec_history_win','winHistory','historicoWIN','history_win','hist_win'];
    for(const k of keys){
      const arr = parseMaybe(localStorage.getItem(k));
      if(Array.isArray(arr)){ for(const raw of arr){ const e = normEntry(raw); if(e && e.win && !seen.has(`${e.ts}|${e.win}`)){ canon.push(e); seen.add(`${e.ts}|${e.win}`);} } }
    }
    try { localStorage.setItem(CANON, JSON.stringify(canon)); } catch {}
    return canon;
  }

  function render(rows){
    const tbody = ensureTbody(); if(!tbody) return;
    const table = tbody.closest('table');
    const cols = table && table.tHead ? table.tHead.rows[0].cells.length : 7;

    if(!rows.length){ tbody.innerHTML = `<tr><td colspan="${cols}" class="cell-muted">Sem registos.</td></tr>`; return; }
    rows.sort((a,b)=> tsNum(b)-tsNum(a)); // NEWEST FIRST

    tbody.innerHTML = rows.map(r => {
      const badge = r.result && /valid|ok|válid/i.test(r.result) ? `<span class="badge ok">${r.result}</span>` : r.result ? `<span class="badge err">${r.result}</span>` : '';
      const img = r.photo ? `<img class="thumb" src="${r.photo}" alt="foto HIN/WIN">` : '';
      const date = new Date(tsNum(r)).toLocaleString('pt-PT');
      const hasCertCol = table && /cert/i.test(table.tHead?.innerText || '');
      const hasIssuerCol = table && /entidade|issuer/i.test(table.tHead?.innerText || '');
      return `<tr>
        <td>${date}</td>
        <td class="wrap"><strong>${r.win||''}</strong></td>
        <td>${badge}</td>
        <td class="wrap">${r.reason||''}</td>
        ${hasCertCol ? `<td class="wrap">${r.certificate||''}</td>` : ''}
        ${hasIssuerCol ? `<td class="wrap">${r.issuer||''}</td>` : ''}
        <td>${img}</td>
      </tr>`;
    }).join('');
  }

  function boot(){ render(migrateToCanon()); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();