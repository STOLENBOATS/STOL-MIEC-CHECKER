MIEC — App Update v1.4 (Cloud Sync + Históricos + Service)

Inclui tudo para ligar a App ao Supabase e sincronizar históricos.

Arquivos
- js/historico-win.js
- js/historico-motor.js
- js/history-service.js
- js/supa-sync.v1.2.js
- js/history-recorder-win.js   (opcional)
- js/history-recorder-motor.js (opcional)
- js/config.example.js         (preenche com as tuas chaves e renomeia para config.js)
- js/auth-mini.js              (ganchos simples para login e arranque do sync)

Como usar (resumo)
1) Copia `js/config.example.js` para `js/config.js` e edita SUPA_URL/SUPA_KEY.
2) Em cada página que use validação/histórico, garante esta ordem:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script defer src="js/config.js"></script>
   <script defer src="js/supa-sync.v1.2.js"></script>
   <script defer src="js/history-service.js"></script>
   <!-- (opcionais) -->
   <script defer src="js/history-recorder-win.js"></script>
   <script defer src="js/history-recorder-motor.js"></script>
   <script defer src="js/auth-mini.js"></script>
3) Depois do login, o `auth-mini.js` chama `HistoryService.startAutoSync()` e a sincronização arranca.
