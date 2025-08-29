// validador-fixes.r1.js — remove artefacto "/1" do título motores se existir
(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  ready(()=>{
    const h2s=[...document.querySelectorAll('h2')].filter(h=>/Validação\s+Motores/i.test(h.textContent));
    h2s.forEach(h=>{
      [...h.childNodes].forEach(n=>{ if(n.nodeType===3 && /\/\s*1/.test(n.nodeValue)) n.nodeValue=n.nodeValue.replace(/\/\s*1/g,''); });
    });
  });
})();
