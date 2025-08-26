// MIEC — history-recorder-win.js v1
(function(){
  const SEL = {
    winInput: ['#winInput','#hinInput','#input-win','input[name="win"]','input[name="hin"]','[data-field="win"]','[data-field="hin"]'],
    validateBtn: ['#btnValidateWin','.btn-validate-win','#btnValidarWIN','button[name="validateWin"]','.validate-win'],
    resultBox: ['#winResult','.win-result','.result-win','.resultado-win'],
    reasonBox: ['#winReason','.win-reason','.interpretation','.details','.justificacao'],
    certificateInput: ['#certNumber','input[name="certificate"]','[data-field="certificate"]'],
    issuerInput: ['#issuer','input[name="issuer"]','[data-field="issuer"]'],
    photoInput: ['#winPhoto','#fotoWin','input[type="file"][name*="win" i]','input[type="file"][accept*="image" i]'],
    photoPreview: ['#winPreview','img#previewWin','.win-photo-preview img','img.preview-win']
  };

  function $(sel, root=document){
    if(!sel) return null;
    if(Array.isArray(sel)){
      for(const s of sel){ const el = root.querySelector(s); if(el) return el; }
      return null;
    }
    return root.querySelector(sel);
  }

  function text(el){ return (el && ('innerText' in el ? el.innerText : el.textContent) || '').trim(); }

  async function readPhotoDataUrl(){
    // Prefer file input
    const fileEl = $(SEL.photoInput);
    if(fileEl && fileEl.files && fileEl.files[0]){
      const file = fileEl.files[0];
      const dataUrl = await fileToDataUrl(file);
      return await compressDataUrl(dataUrl, 1024, 0.85);
    }
    // Fallback: preview <img>
    const img = $(SEL.photoPreview);
    if(img && img.src){
      if(/^data:image\//i.test(img.src)) return img.src;
      // imagens http(s) não serão convertidas aqui (CORS); regressa src tal como está
      return img.src;
    }
    return '';
  }

  function fileToDataUrl(file){
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
        const scale = img.width > maxW ? (maxW / img.width) : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const out = canvas.toDataURL('image/jpeg', quality);
          resolve(out);
        } catch(e){
          resolve(dataUrl); // fallback: mantém original
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  function getWinValue(){
    const el = $(SEL.winInput);
    if(!el) return '';
    const v = ('value' in el ? el.value : text(el)) || '';
    return String(v).trim().toUpperCase();
    // (Deixa como HIN/WIN indiferente)
  }

  function getResult(){
    const box = $(SEL.resultBox);
    const t = text(box).toLowerCase();
    if(/inv[aá]l/i.test(t)) return 'Inválido';
    if(/v[aá]lid/i.test(t)) return 'Válido';
    return (t || '').substring(0, 40) || '';
  }

  function getReason(){
    const r = $(SEL.reasonBox);
    return text(r);
  }

  function valOrText(sel){
    const el = $(sel);
    if(!el) return '';
    return ('value' in el ? el.value : text(el)).trim();
  }

  async function captureAndSave(){
    const win = getWinValue();
    if(!win) return;
    const result = getResult();
    const reason = getReason();
    const certificate = valOrText(SEL.certificateInput);
    const issuer = valOrText(SEL.issuerInput);
    const photo = await readPhotoDataUrl();

    const payload = { ts: Date.now(), win, result, reason, certificate, issuer, photo, version: window.APP_VERSION, device: navigator.userAgent };

    if(window.HistoryService && HistoryService.saveWin){
      HistoryService.saveWin(payload);
    } else {
      // fallback localStorage
      const key = 'miec_history_win';
      let arr = [];
      try { arr = JSON.parse(localStorage.getItem(key)) || []; } catch {}
      arr.push(payload);
      try { localStorage.setItem(key, JSON.stringify(arr)); } catch {}
    }
  }

  // Auto hook on button
  function hook(){
    const btn = $(SEL.validateBtn);
    if(btn && !btn.__miec_hooked){
      btn.__miec_hooked = true;
      btn.addEventListener('click', () => setTimeout(captureAndSave, 300));
    }
  }

  // Manual event hook (if your validator dispatches these)
  document.addEventListener('validation:win:done', async (ev) => {
    const d = ev && ev.detail || {};
    const payload = {
      ts: Date.now(),
      win: (d.win||getWinValue()||'').toUpperCase(),
      result: d.result || getResult(),
      reason: d.reason || getReason(),
      certificate: d.certificate || '',
      issuer: d.issuer || '',
      photo: d.photoDataUrl || await readPhotoDataUrl(),
      version: window.APP_VERSION,
      device: navigator.userAgent
    };
    if(window.HistoryService && HistoryService.saveWin) HistoryService.saveWin(payload);
    else {
      const key = 'miec_history_win';
      let arr = []; try { arr = JSON.parse(localStorage.getItem(key)) || []; } catch {}
      arr.push(payload); try { localStorage.setItem(key, JSON.stringify(arr)); } catch {}
    }
  });

  function boot(){ hook(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();