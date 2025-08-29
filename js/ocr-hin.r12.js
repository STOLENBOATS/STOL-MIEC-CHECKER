(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  async function ensureTesseract(){
    if (window.Tesseract) return true;
    try{
      await new Promise((resolve,reject)=>{
        const s=document.createElement('script');
        s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
      });
      return !!window.Tesseract;
    }catch(e){ console.warn('[OCR] Tesseract não disponível:', e); return false; }
  }
  function cleanHIN(s){ if(!s) return ''; s=s.toUpperCase().replace(/[^A-Z0-9]/g,''); s=s.replace(/[IOQ]/g,''); return s; }
  ready(function(){
    const photo=document.getElementById('winPhoto'); const input=document.getElementById('winInput');
    if(!photo||!input) return;
    let btn=document.getElementById('btnOcrHin');
    if(!btn){ btn=document.createElement('button'); btn.id='btnOcrHin'; btn.type='button'; btn.className='btn'; btn.textContent='Ler da foto'; photo.parentElement.appendChild(btn); }
    btn.addEventListener('click', async()=>{
      const file=photo.files&&photo.files[0]; if(!file){ alert('Seleciona primeiro uma fotografia.'); return; }
      const ok=await ensureTesseract(); if(!ok){ alert('OCR indisponível (Tesseract).'); return; }
      try{
        const { data:{ text } } = await Tesseract.recognize(file, 'eng', { tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ' });
        const hints=cleanHIN(text);
        if(hints && hints.length>=8){ input.value=hints; input.dispatchEvent(new Event('input',{bubbles:true})); window.dispatchEvent(new CustomEvent('miec:hin:ocr',{detail:{hin:hints}})); }
        else alert('Não consegui ler o HIN com qualidade suficiente.');
      }catch(e){ console.warn('[OCR] erro:',e); alert('Falhou a leitura OCR.'); }
    });
  });
})(); 
