MIEC — Hotfix H1 (injeção pós-submissão)
===============================================
Objetivo: garantir que **as pesquisas atuais** entram nos históricos, mesmo que o validador não esteja a chamar o HistoryService.

Como funciona
- Ouve o submit dos formulários `#winForm` e `#motorForm`.
- Aguarda 200–400 ms para deixar o teu código gravar em `hist_win` / `hist_motor`.
- Lê o **último item** desses arrays e mapeia para o formato canónico.
- Chama `HistoryService.saveWin/saveMotor()` (local + outbox para sync).

Como instalar
1) Coloca o ficheiro em `js/hotfix-history-inject.js`.
2) Em `validador.html`, **depois dos teus scripts atuais** e do `history-service.js`, adiciona:
   <script defer src="js/hotfix-history-inject.js?v=H1"></script>

Sem riscos
- Não mexe no teu validador; só “escuta” e copia o último registo para o formato canónico.
- Se `HistoryService` não existir, não faz nada.
