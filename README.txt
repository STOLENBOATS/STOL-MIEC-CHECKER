MIEC — Patch #2 (Cloud Sync via Supabase) — v4.2.1-auth-min — 2025-08-26

Objetivo
- Manter a base atual intacta (offline-first) e acrescentar sincronização em nuvem (Supabase) para os históricos.
- Quando logado, os registos ficam disponíveis em qualquer dispositivo (portátil/telemóvel).

Conteúdo
- sql/schema.sql → tabelas `history_win` e `history_motor` + RLS + índices únicos para upsert.
- js/supa-sync.js → runtime de sync (pull/merge/push) resiliente e idempotente.
- js/history-service.js → camada única para gravar local + enfileirar sync, com API simples.

Como aplicar (sem quebrar o que já funciona)
1) No Supabase (projeto do MIEC), abre o **SQL Editor** e cola o conteúdo de `sql/schema.sql`. Executa.
2) Garante que as variáveis globais **SUPA_URL** e **SUPA_KEY** já existem (no teu `config.js`). Se preferires, define `window.MIEC_CONFIG` com estas chaves.
3) Em todas as páginas que usam históricos/validador, adiciona estes scripts **após** carregar o `@supabase/supabase-js` e o teu `config.js`:
   <script defer src="js/supa-sync.js?v=1"></script>
   <script defer src="js/history-service.js?v=1"></script>
4) No teu `validador-win.js` e `validador-motor.js`, substitui as gravações diretas no localStorage por chamadas à API:
   // WIN
   HistoryService.saveWin({ ts: Date.now(), win, result, reason, photo, version: APP_VERSION, device: navigator.userAgent });
   // MOTOR
   HistoryService.saveMotor({ ts: Date.now(), brand, ident, result, reason, photo, version: APP_VERSION, device: navigator.userAgent });
5) Opcional: para arrancar o sync logo no load, chama `HistoryService.startAutoSync()` (ou usa o evento de sessão do teu supa-auth).

Notas
- Se não houver sessão/autenticação, tudo continua apenas local (sem erros).
- O sync é “melhor esforço”: tenta **push** (outbox) e **pull** (server→local) com deduplicação.
- Duplicados são evitados por índices únicos (ver `ON CONFLICT` nas tabelas).
- Coluna `photo`: nesta fase guardamos base64 no campo `photo` (simples). Futuro patch pode migrar para **Supabase Storage** e usar `photo_url`.

