MIEC — Históricos + HistoryService Fix v1.3 (v4.2.1-auth-min)

Inclui:
1) **Históricos v1.2** (já com leitura de `hist_win` / `hist_motor` e mapeamentos, incluindo FOTO):
   - js/historico-win.js
   - js/historico-motor.js
2) **HistoryService v1.1** (WIN passa a aceitar `certificate` e `issuer`).
3) **Opcional (Cloud Sync)** — suporte a `certificate/issuer` no Supabase:
   - js/supa-sync.v1.1.js (usa flag de configuração para não partir quem ainda não migrou schema)
   - sql/schema_delta.sql (adiciona colunas `certificate` e `issuer` a `history_win`).

Como aplicar (seguro e incremental)
A) **Sempre** (offline/local + compatível com Patch #2):
   - Substitui: `js/historico-win.js`, `js/historico-motor.js`, `js/history-service.js`.
   - (sem mexer no teu validador)
B) **Se quiseres sincronizar também `certificate/issuer` para a cloud**:
   1. No Supabase, corre `sql/schema_delta.sql` (adiciona colunas).
   2. Troca o ficheiro de sync para `js/supa-sync.v1.1.js` (ou renomeia para `supa-sync.js`).
   3. Em `config.js`, ativa a flag:
      ```js
      window.MIEC_CONFIG = {
        ...,
        SYNC_EXTRA_WIN_FIELDS: true
      };
      ```

Notas
- Se **não** aplicares o delta SQL nem ativares a flag, o sync continua a funcionar como antes (sem enviar/receber `certificate/issuer`). Os históricos locais continuam a exibir esses campos normalmente.
