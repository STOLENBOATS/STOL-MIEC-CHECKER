MIEC - History Debug r4b
---------------------------

Inclui dois ficheiros:
1) js/history-recorder-failsafe.v2.js
   - Garante gravação mesmo sem HistoryService, escrevendo diretamente no outbox 'miec_sync_outbox_v1'.
   - Depois tenta pushOutbox().

2) js/history-debug-overlay.v1.js
   - Mostra um painel no canto com: estado da sessão, tamanho do outbox e botões (push/pull/sync/ver).
   - Faz wrap ao HistoryService.saveWin/saveMotor para logar as chamadas no console.

Como usar
--------
No validador.html, depois dos recorders e do auto-sync, adicione:
  <script defer src="js/history-recorder-failsafe.v2.js"></script>
  <script defer src="js/history-debug-overlay.v1.js"></script>

Testes
------
- Submeta um HIN/Motor e veja no console mensagens '[failsafe v2] ...' ou '[debug] HistoryService.save*'.
- O painel deve mostrar 'outbox: N'. O botão 'ver' imprime o conteúdo no console.
- Se tiver sessão, use 'sync' para empurrar para o Supabase.
