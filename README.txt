MIEC — POC Pack r13
--------------------
Inclui:
- validador.html (substituir)
- js/ocr-hin.poc.v1.js
- js/dossier-forense.poc.v1.js
- js/qrcode.min.js (mini)
- verify.html (verificador: /verify.html?sha=<hash>)
- sql/forensic_dossiers.sql

Como aplicar
1) Copia validador.html, verify.html e pasta js/ para o projeto.
2) Supabase > Storage: cria bucket "dossiers" com leitura pública (Public).
3) (Opcional) Supabase > SQL: corre sql/forensic_dossiers.sql.
4) Hard refresh. No Validador:
   - Seleciona/fotografa HIN → "Ler Foto (OCR • beta)" → auto-preenche HIN.
   - "Gerar Dossier" → descarrega HTML; se storage OK, grava JSON/ficheiros no bucket.
   - Abre verify.html?sha=<hash> → ✅/❌.

Notas
- OCR via CDN (Tesseract.js). Para offline total, depois alojamos worker+traineddata.
- QR minimalista; podes trocar por uma lib maior se quiseres.
