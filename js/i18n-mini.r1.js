/*! MIEC i18n-mini.r1.js
   Tradução rápida usando dicionário interno + data-i18n="key".
   Ex:
    <span data-i18n="labels.forense_detail"></span>
    MIEC_I18N.setLang('en'); MIEC_I18N.apply();
*/
(function(){
  const dict = {
    pt: {
      "labels.photo": "Fotografia",
      "labels.optional": "(opcional)",
      "labels.forense_detail": "Detalhe Forense",
      "buttons.validate_motor": "Validar Motor",
      "buttons.validate_hin": "Validar HIN",
      "headers.engine_validation": "Validação Motores",
      "headers.hin_validation": "Validação HIN"
    },
    en: {
      "labels.photo": "Photo",
      "labels.optional": "(optional)",
      "labels.forense_detail": "Forensic Detail",
      "buttons.validate_motor": "Validate Engine",
      "buttons.validate_hin": "Validate HIN",
      "headers.engine_validation": "Engine Validation",
      "headers.hin_validation": "HIN Validation"
    }
  };
  const API = {
    _lang: 'pt',
    setLang(l){ API._lang = (l==='en'?'en':'pt'); },
    t(key){
      return (dict[API._lang] && dict[API._lang][key]) || (dict.pt && dict.pt[key]) || key;
    },
    apply(root){
      root = root || document;
      const nodes = root.querySelectorAll('[data-i18n]');
      nodes.forEach(n=>{
        const k = n.getAttribute('data-i18n');
        if (k) n.textContent = API.t(k);
      });
    }
  };
  window.MIEC_I18N = API;
})();