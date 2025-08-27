MIEC — App Bundle v1.5 (Indispensável)
===========================================
Tudo o que precisas para a App registar históricos (com foto) e sincronizar com o Supabase, evitando o erro de quota.

Inclui
- js/supa-sync.v1.2.js        → Sync (WIN+MOTOR), suporta certificate/issuer via flags.
- js/history-service.js        → API local + outbox → chama o sync.
- js/ls-guard.js               → evita QuotaExceededError (limita tamanho dos hist_*).
- js/cleanup-history.js        → higieniza hist_* no load.
- js/hotfix-history-inject.js  → se o teu validador só gravar em hist_*, copia p/ formato canónico e envia p/ cloud.
- js/historico-win.js          → renderer tolerante (lê hist_win + miec_history_win, com foto).
- js/historico-motor.js        → renderer tolerante (lê hist_motor + miec_history_motor, com foto).
- js/config.example.js         → copia para config.js e preenche SUPA_URL/SUPA_KEY.

Como instalar
1) Copia tudo para a pasta `js/` do teu projeto.
2) No `<head>` do **validador.html**, antes dos recorders, garante esta ordem:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script defer src="js/config.js"></script>
   <script defer src="js/supa-sync.v1.2.js"></script>
   <script defer src="js/history-service.js"></script>
   <script defer src="js/ls-guard.js?v=1"></script>
   <script defer src="js/cleanup-history.js?v=1"></script>
   <script defer src="js/hotfix-history-inject.js?v=H1"></script>
   <!-- já existiam -->
   <script defer src="js/history-recorder-win.js"></script>
   <script defer src="js/history-recorder-motor.js"></script>
3) Em `historico_*.html`, só precisas de carregar os respectivos `historico-*.js` (já estavam, substitui pelos desta pasta).
4) Cria `js/config.js` a partir do exemplo e preenche SUPA_URL/SUPA_KEY. Ativa as flags se quiseres enviar certificate/issuer:
   window.MIEC_CONFIG = {
     SUPA_URL: 'https://<project>.supabase.co',
     SUPA_KEY: '<anon-key>',
     APP_VERSION: 'v4.2.1-auth-min — 2025-08-26',
     SYNC_EXTRA_WIN_FIELDS: true,
     SYNC_EXTRA_MOTOR_FIELDS: true
   };

Teste rápido
- Faz 1 validação WIN/MOTOR com foto.
- Verifica no histórico local e no Supabase (Table Editor). Se quiseres, força:  await MIEC_SYNC.syncNow()
