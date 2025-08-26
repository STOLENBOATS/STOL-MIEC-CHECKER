MIEC — History Recorder v1 (v4.2.1-auth-min)

Objetivo
- Garantir que **as pesquisas atuais** do Validador (WIN/HIN e Motores) ficam registadas imediatamente no histórico e com **fotografia**.
- Não altera a tua lógica de validação; apenas **escuta** os botões/eventos e grava via HistoryService (Patch #2) ou localStorage (fallback).

Como usar
1) Garante que já incluíste (depois do @supabase e do teu config.js, se existirem):
   <script defer src="js/supa-sync.js"></script>
   <script defer src="js/history-service.js"></script>
2) Em `validador.html`, **após os teus scripts atuais** de validação, inclui:
   <script defer src="js/history-recorder-win.js"></script>
   <script defer src="js/history-recorder-motor.js"></script>
3) Ajusta, se necessário, os **selectores** no topo de cada ficheiro para corresponder aos teus IDs/classes.
4) Opcional: dispara manualmente um evento quando terminares a validação (se preferires controlo explícito):
   document.dispatchEvent(new CustomEvent('validation:win:done', {
     detail: { win, result: 'Válido'|'Inválido', reason, photoDataUrl, certificate, issuer }
   }));
   document.dispatchEvent(new CustomEvent('validation:motor:done', {
     detail: { brand, ident, result, reason, photoDataUrl }
   }));

Notas
- As fotos são lidas do <input type="file"> ou de uma imagem de preview; são **comprimidas** para largura máx. 1024 em JPEG ~0.85 para não estourar o localStorage.
- Se o HistoryService não estiver disponível, grava em `miec_history_win` / `miec_history_motor` (a página dos históricos lerá normalmente).
- Totalmente compatível com o Patch #2 (sync Supabase).
