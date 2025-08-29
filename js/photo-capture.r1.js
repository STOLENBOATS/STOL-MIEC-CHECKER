(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  function setupInput(id){
    const input=document.getElementById(id);
    if(!input) return;
    input.setAttribute('accept','image/*');
    input.setAttribute('capture','environment');
    input.addEventListener('change', async ()=>{
      const f=input.files && input.files[0];
      if(!f) return;
      try{
        const compressed=await downscaleImage(f, {maxW:1600, maxH:1200, quality:0.75});
        const dt=new DataTransfer();
        dt.items.add(new File([compressed], (f.name||'photo').replace(/\\.[a-z0-9]+$/i,'')+'-min.jpg', {type:'image/jpeg'}));
        input.files = dt.files;
        console.log('[photo-capture] comprimido', f.size, '→', dt.files[0].size);
      }catch(e){ console.warn('[photo-capture] falhou compressão:',e); }
    });
  }
  function readFile(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
  async function downscaleImage(file, {maxW=1600,maxH=1200,quality=0.75}={}){
    const dataUrl = await readFile(file);
    const img = await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=dataUrl; });
    let {width:w, height:h} = img;
    const ratio = Math.min(maxW/w, maxH/h, 1);
    const nw = Math.round(w*ratio), nh = Math.round(h*ratio);
    const c=document.createElement('canvas'); c.width=nw; c.height=nh;
    const ctx=c.getContext('2d'); ctx.drawImage(img,0,0,nw,nh);
    const out = await new Promise(res=>c.toBlob(res,'image/jpeg',quality));
    return out;
  }
  ready(()=>{
    setupInput('winPhoto');
    setupInput('motorPhoto');
  });
})();