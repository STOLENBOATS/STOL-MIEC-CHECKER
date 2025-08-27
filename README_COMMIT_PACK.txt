MIEC — Commit Pack r3
=======================

Objetivo: facilitar um único commit/drag&drop p/ GitHub com tudo o que pediste já integrado.

Inclui:
- css/styles-override.v1.css  → header maior + thumbs + lightbox shell
- js/lightbox.v1.js           → zoom ao clicar nas imagens
- js/codebooks-live.v1.js     → codebooks dinâmicos (países + MIC)
- js/hin-rules.patch.v1.1.js  → regras HIN (serial alfanum., <1998 exige certificado, anotação país/MIC)
- js/hin-year-filter.patch.v1.js → remove alternativas <1998 renderizadas
- data/countries.min.json, data/mic.local.json, data/mic.all.json → codebooks
- validador.html (atualizado com includes)
- historico_win.html & historico_motor.html (com CSS override + lightbox)

Como usar:
1) Extrai este ZIP na **raiz do repositório** e aceita substituir ficheiros.
2) Faz hard refresh no browser.
3) Testa:
   - HIN com ano “14” → mostra 2014 (sem 1914 como alternativa).
   - Headers maiores em validador e históricos.
   - Imagens pequenas com zoom ao clicar.
