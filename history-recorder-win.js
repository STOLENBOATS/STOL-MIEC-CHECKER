// history-recorder-win.js — Pro v2 (ativo)
// Captura submissão do formulário de HIN e grava via HistoryService.saveWin()
(function(){
  const SEL = {
    form: '#winForm',
    input: '#winInput',
    resultBox: '#winResult',
    reasonBox: '#winForense, .forense, .result, .details',
    certNumber: '#certNumber',
    certIssuer: '#certIssuer',
    photoInput: '#winPhoto',
    photoPreview: '#winPreview, .win-photo-preview img'
  };

  function $(s, r=document){ return r.querySelector(s); }
  function val(s){ const el=$(s); if(!el) return ''; return ('value' in el ? el.value : (el.innerText||el.textContent||'')).trim(); }
  function text(el){ return (el && (el.innerText||el.textContent)||'').trim(); }

  async function fileToDataUrl(file){
    return new Promise((res, rej)=>{
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  function compressDataUrl(dataUrl, maxW=1024, quality=0.85){
    return new Promise((resolve)=>{
      if(!/^data:image\//i.test(dataUrl)) return resolve(dataUrl);
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxW ? (maxW/img.width) : 1;
        const w = Math.round(img.width*scale), h=Math.round(img.height*scale);
        const c = document.createElement('canvas'); c.width=w; c.height=h;
        const ctx = c.getContext('2d'); ctx.drawImage(img,0,0,w,h);
        try { resolve(c.toDataURL('image/jpeg', quality)); } catch(e){ resolve(dataUrl); }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }
  async function readPhoto(){
    const fileEl = $(SEL.photoInput);
    if(fileEl && fileEl.files && fileEl.files[0]){
      const d = await fileToDataUrl(fileEl.files[0]);
      return await compressDataUrl(d, 1024, 0.85);
    }
    const prev = $(SEL.photoPreview);
    if(prev && prev.src) return prev.src;
    return '';
  }
  function detectResult(){
    const t = text($(SEL.resultBox)).toLowerCase();
    if(/inv[aá]l/.test(t)) return 'Inválido';
    if(/v[aá]lid/.test(t)) return 'Válido';
    return t.slice(0,80);
  }
  function detectReason(){
    const el = $(SEL.reasonBox);
    if(!el) return '';
    const raw = text(el);
    return raw.replace(/\s+/g,' ').trim();
  }

  async function handleSubmit(){
    try{
      const win = val(SEL.input).toUpperCase();
      if(!win) return;
      const payload = {
        ts: Date.now(),
        win,
        result: detectResult(),
        reason: detectReason(),
        certificate: val(SEL.certNumber),
        issuer: val(SEL.certIssuer),
        photo: await readPhoto(),
        version: window.APP_VERSION,
        device: navigator.userAgent
      };
      if(window.HistoryService && HistoryService.saveWin){
        HistoryService.saveWin(payload);
        console.log('[recorder-win] salvo:', payload);
      } else {
        console.warn('[recorder-win] HistoryService não encontrado.');
      }
    }catch(e){
      console.warn('[recorder-win] erro:', e);
    }
  }

  function boot(){
    const form = $(SEL.form);
    if(!form) return console.warn('[recorder-win] form não encontrado.');
    if(form.__miec_bound) return;
    form.__miec_bound = true;
    form.addEventListener('submit', ()=> setTimeout(handleSubmit, 250));
    console.log('history-recorder-win.js ativo.');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();