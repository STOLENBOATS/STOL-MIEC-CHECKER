M.I.E.C. — Drop-in r13 sobre r9b
=================================
Data: 2025-09-07
Versão: v4.2.1-auth-min — r13 — 2025-09-07

O que é isto?
-------------
Um *drop-in completo* construído por cima do teu baseline r9b, com:
- HUD de estado (r13)
- Self-tests e boot seguro (fail-fast)
- config.js em modo SANITY (offline, sem Supabase)
- validador.html com bloco SANITY já injetado
- Backup automático: validador.original-r9b.html

Como usar
--------
1) Faz backup do teu diretório atual (se necessário).
2) Extrai este ZIP por cima da tua pasta do projeto.
3) Abre o validador.html — o HUD deve aparecer no canto inferior direito.
4) Quando tudo local estiver OK, editar js/config.js:
   - SUPABASE_URL = "https://SEU-PROJ.supabase.co"
   - SUPABASE_ANON_KEY = "SUA_ANON_KEY"
   - STORAGE_BUCKET = "photos" (por defeito)
   - REQUIRE_AUTH = true (se quiseres ligar login)
   - AUTO_SYNC = true (quando ativar cloud)
