// historico-win.js — v1.2 (tolerante + mapeamento 'hist_win') — MIEC
(function(){
  function $(s, r=document){ return r.querySelector(s); }
  function parseMaybe(v){ try { return JSON.parse(v); } catch { return null; } }

  function ensureTbody(){
    let tbody = $('#winTbody') || $('#winTable tbody') || document.querySelector('tbody');
    if(!tbody){
      const table = $('#winTable') || document.querySelector('table');
      if(table){
        tbody = document.createElement('tbody');
        tbody.id = 'winTbody';
        table.appendChild(tbody);
      }
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
    return {
      ts: e.ts || e.timestamp || e.date || Date.now(),
      win: e.win || e.hin || e.numero || e.number || '',
      result: resStr, reason, certificate, issuer,
      photo: e.photo || e.foto || e.image || ''
    };
  }

  function migrateToCanon(){
    const CANON_KEY = 'miec_history_win';
    const canon = parseMaybe(localStorage.getItem(CANON_KEY)) || [];
    const seen = new Set(canon.map(x => `${x.ts}|${x.win}`));
    const collectionKeys = ['miec_history_win','winHistory','historicoWIN','history_win','hist_win'];
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
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(!k) continue;
      if(/win|hin/i.test(k)){
        const raw = parseMaybe(localStorage.getItem(k));
        if(raw && typeof raw === 'object'){
          const e = normEntry(raw);
          if(e && e.win && !seen.has(`${e.ts}|${e.win}`)){
            canon.push(e); seen.add(`${e.ts}|${e.win}`);
          }
        }
      }
    }
    try { localStorage.setItem(CANON_KEY, JSON.stringify(canon)); } catch {}
    return canon;
  }

  function render(rows){
    const tbody = ensureTbody();
    if(!tbody) return;
    const table = tbody.closest('table');
    const cols = table && table.tHead ? table.tHead.rows[0].cells.length : 7;
    if(!rows.length){
      tbody.innerHTML = `<tr><td colspan="${cols}" class="cell-muted">Sem registos.</td></tr>`;
      return;
    }
    rows.sort((a,b)=> (b.ts||0)-(a.ts||0));
    tbody.innerHTML = rows.map(r => {
      const badge = r.result && /valid|ok|válid/i.test(r.result)
        ? `<span class="badge ok">${r.result}</span>`
        : r.result ? `<span class="badge err">${r.result}</span>` : '';
      const img = r.photo ? `<img class="thumb" src="${r.photo}" alt="foto HIN/WIN">` : '';
      const date = new Date(r.ts).toLocaleString('pt-PT');
      const hasCertCol = table && /cert/i.test(table.tHead.innerText || '');
      const hasIssuerCol = table && /entidade|issuer/i.test(table.tHead.innerText || '');
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
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();