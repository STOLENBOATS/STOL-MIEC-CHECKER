// historico-win.js — v1.3 (one-time migration + dedupe + newest-first)
(function(){
  function $(s, r=document){ return r.querySelector(s); }
  
function parseMaybe(v){ try { return JSON.parse(v); } catch { return null; } }
function saveLS(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

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

  const CANON_KEY = 'miec_history_win'; const MIG_FLAG='miec_migrated_win_v1'; const IDX_KEY='miec_hist_idx_win';
  function normEntry(e){ if(!e) return null; const ok=typeof e.ok==='boolean'?e.ok:undefined;
    const resStr=e.result||(ok===true?'Válido':ok===false?'Inválido':''); const reason=e.reason||e.details||e.justification||e.motivo||e.message||'';
    const certificate=e.certificate||e.cert||e.certNumber||''; const issuer=e.issuer||e.entidade||e.entity||e.certIssuer||''; const photo=e.photo||e.foto||'';
    const win=e.win||e.hin||''; const ts=e.ts||e.timestamp||e.date||null; return { ts, win, result: resStr, reason, certificate, issuer, photo }; }
  function fp(e){ return `${(e.win||'').toUpperCase()}|${(e.result||'').toLowerCase()}|${(e.reason||'').trim()}|${(e.certificate||'').trim()}|${(e.issuer||'').trim()}|${(e.photo||'').length}`; }
  function migrateOnce(){
    const migrated=localStorage.getItem(MIG_FLAG)==='1'; const canon=parseMaybe(localStorage.getItem(CANON_KEY))||[]; const idx=parseMaybe(localStorage.getItem(IDX_KEY))||{};
    if(migrated){ const out=[]; const seen=new Set(); for(const row of canon){ const n=normEntry(row); if(!n||!n.win) continue; const f=fp(n);
        let t=tsNum(n); if(!t && idx[f]) t=idx[f]; n.ts=t||n.ts||n.timestamp||n.date||0; if(!seen.has(f)){ seen.add(f); out.push(n);} }
      out.sort((a,b)=>tsNum(b)-tsNum(a)); saveLS(CANON_KEY,out); return out; }
    const candidates=[]; for(const k of ['miec_history_win','winHistory','historicoWIN','history_win','hist_win']){ const arr=parseMaybe(localStorage.getItem(k)); if(Array.isArray(arr)){ for(const raw of arr){ const n=normEntry(raw); if(n&&n.win) candidates.push(n); } } }
    const out=[]; const seen=new Set(); for(const n of candidates){ const f=fp(n); if(seen.has(f)) continue; seen.add(f); let t=tsNum(n); if(!t){ t=idx[f]||Date.now(); idx[f]=t; } n.ts=t; out.push(n); }
    out.sort((a,b)=>tsNum(b)-tsNum(a)); saveLS(CANON_KEY,out); saveLS(IDX_KEY,idx); try{ localStorage.setItem(MIG_FLAG,'1'); }catch{} return out; }
  function ensureTbody(){ let tbody=$('#winTbody')||$('#winTable tbody')||document.querySelector('tbody'); if(!tbody){ const table=$('#winTable')||document.querySelector('table'); if(table){ tbody=document.createElement('tbody'); tbody.id='winTbody'; table.appendChild(tbody);} } return tbody; }
  function render(rows){ const tbody=ensureTbody(); if(!tbody) return; const table=tbody.closest('table'); const cols=table&&table.tHead?table.tHead.rows[0].cells.length:7;
    if(!rows.length){ tbody.innerHTML=`<tr><td colspan="${cols}" class="cell-muted">Sem registos.</td></tr>`; return; } rows.sort((a,b)=>tsNum(b)-tsNum(a));
    tbody.innerHTML=rows.map(r=>{ const badge=r.result&&/valid|ok|válid/i.test(r.result)?`<span class="badge ok">${r.result}</span>`:r.result?`<span class="badge err">${r.result}</span>`:'';
      const img=r.photo?`<img class="thumb" src="${r.photo}" alt="foto HIN/WIN">`:''; const date=new Date(tsNum(r)).toLocaleString('pt-PT'); const hasCert=table&&/cert/i.test(table.tHead?.innerText||''); const hasIssuer=table&&/entidade|issuer/i.test(table.tHead?.innerText||'');
      return `<tr><td>${date}</td><td class="wrap"><strong>${(r.win||'')}</strong></td><td>${badge}</td><td class="wrap">${r.reason||''}</td>${hasCert?`<td class="wrap">${r.certificate||''}</td>`:''}${hasIssuer?`<td class="wrap">${r.issuer||''}</td>`:''}<td>${img}</td></tr>`; }).join(''); }
  function boot(){ render(migrateOnce()); } if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();