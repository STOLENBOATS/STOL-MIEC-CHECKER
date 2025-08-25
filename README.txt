M.I.E.C. – UI Hotfix (v420)

Ficheiros:
- js/ui-hotfix.js  → força favicon (images/favicon.png), marca [data-cloud] e garante que o botão "Ir para o Validador" abre validador.html?v=418
- validador-favicon-snippet.html → pequeno excerto para colar no <head> do validador.html, caso ainda não tenha o favicon

Como aplicar:
1) Faça upload de js/ui-hotfix.js para a pasta /js do repositório.
2) No login.html, adicione no fim do <head>:
   <script defer src="js/ui-hotfix.js?v=420"></script>
3) (Opcional) No validador.html, adicione no <head> a linha do favicon (conteúdo de validador-favicon-snippet.html). 
   Não altera mais nada do validador.

Depois faça hard refresh (Ctrl/Cmd+F5).
