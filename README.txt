Validador Early Gate (v420b, com debug/hold)

Ficheiros:
- js/validator-gate.js → processa tokens, cria/persiste sessão, limpa URL e só então prossegue; se falhar, envia para login.html?v=418.
- head-snippet.html → bloco para pôr no <head> do validador.html, o mais cedo possível.

Debug:
- Adiciona ?debug=1 para overlay/logs (ex.: validador.html?debug=1).
- Adiciona ?hold=2000 para "congelar" 2s e permitir ver o estado.
- Podes combinar (ex.: validador.html?debug=1&hold=2500).

Dicas:
- Mantém este <script> acima de quaisquer scripts que possam redirecionar.
- Não precisa de auth-boot; o gate carrega SDK/config/supa se não estiverem presentes.
