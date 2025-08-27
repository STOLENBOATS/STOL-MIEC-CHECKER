// history-recorder-motor.js — Pro v2 (ativo)
// Captura submissão do formulário de Motor e grava via HistoryService.saveMotor()
(function(){
  const SEL = {
    form: '#motorForm',
    brand: '#brand',
    resultBox: '#motorResult',
    reasonBox: '#motorForense, .forense, .result, .details',
    photoInput: '#motorPhoto',
    photoPreview: '#motorPreview, .motor-photo-preview img',
    brandFields: '#brandFields'
  };

  function $(s, r=document){ return r.querySelector(s); }
  function text(el){ return (el && (el.innerText||el.textContent)||'').trim(); }
  function val(s){
    const el=$(s); if(!el) return '';
    if('value' in el) return String(el.value||'').trim();
    return text(el);
  }

  function findInBrandFields(names){
    const root = $(SEL.brandFields) || document;
    for(const n of names){
      const el = root.querySelector(`#${n}, input[name="${n}"], [data-field="${n}"]`);
      if(el) return String(('value' in el ? el.value : (el.innerText||el.textContent))||'').trim();
    }
    return '';
  }

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
    return text(el).replace(/\s+/g,' ').trim();
  }

  function buildIdent(){
    const model = findInBrandFields(['yam_model','model','f_model']);
    const sn    = findInBrandFields(['yam_sn','sn','serial','f_serial']);
    const code  = findInBrandFields(['yam_model_code','code','f_code']);
    return [model, code, sn].filter(Boolean).join(' ').trim();
  }

  async function handleSubmit(){
    try{
      const brand = val(SEL.brand);
      const ident = buildIdent();
      if(!brand || !ident) return;
      const payload = {
        ts: Date.now(),
        brand, ident,
        result: detectResult(),
        reason: detectReason(),
        photo: await readPhoto(),
        version: window.APP_VERSION,
        device: navigator.userAgent
      };
      if(window.HistoryService && HistoryService.saveMotor){
        HistoryService.saveMotor(payload);
        console.log('[recorder-motor] salvo:', payload);
      } else {
        console.warn('[recorder-motor] HistoryService não encontrado.');
      }
    }catch(e){ console.warn('[recorder-motor] erro:', e); }
  }

  function boot(){
    const form = $(SEL.form);
    if(!form) return console.warn('[recorder-motor] form não encontrado.');
    if(form.__miec_bound) return;
    form.__miec_bound = true;
    form.addEventListener('submit', ()=> setTimeout(handleSubmit, 250));
    console.log('history-recorder-motor.js ativo.');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();