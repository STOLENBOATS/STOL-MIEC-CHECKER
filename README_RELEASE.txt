MIEC Release v4.2.1-r1 (clean overlay)
========================================
Este pacote contém apenas os ficheiros a substituir no teu repositório.

Inclui:
- validador.html (limpo, com auto-sync + hooks DEV)
- js/dev-autologin.js (autologin apenas em DEV)
- js/config.dev.js (placeholders DEV; adicionar ao .gitignore)
- js/historico-win.js v1.3
- js/historico-motor.js v1.3

Como aplicar
-----------
1) **Apaga** pastas/ficheiros duplicados antigos se existirem (ex.: subpasta STOL-MIEC-CHECKER-main dentro da raiz).
2) Copia estes ficheiros por cima dos existentes.
3) (Opcional DEV) Edite js/config.dev.js com email/password de teste **ou** use localStorage:
   no Console, execute:
     localStorage.setItem('MIEC_DEV_CREDENTIALS', JSON.stringify({email:'tester@miec.local', password:'SUA_PASSWORD'}));
     localStorage.setItem('MIEC_DEV','1');
   e abra: validador.html?dev=1
4) Hard refresh (Ctrl/Cmd+F5) e teste. Os históricos sobem automaticamente ao Supabase.

Segurança
--------
- NÃO use js/config.dev.js em produção pública com credenciais reais. Adicione ao .gitignore.
