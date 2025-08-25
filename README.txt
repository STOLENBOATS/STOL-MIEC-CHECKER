Validador Early Gate (v420)

Ficheiros:
- js/validator-gate.js  → processa os tokens da URL, cria/persiste a sessão, limpa a URL e só depois deixa a página continuar (senão volta ao login).
- head-snippet.html     → bloco para inserir no <head> do validador.html, o mais cedo possível.

Como aplicar:
1) Faça upload de js/validator-gate.js para a pasta /js do repositório.
2) No validador.html, INSIRA no <head>, idealmente antes de outros scripts, o conteúdo de head-snippet.html:
   <link rel="icon" ...>
   <script defer src="js/auth-boot.js?v=420"></script>
   <script defer src="js/validator-gate.js?v=420"></script>

Notas:
- O gate chama sempre SupaAuth.finalizeFromUrl(...). Se não houver tokens, é no-op.
- Em caso de sessão ausente após o processamento, redireciona para login.html?v=418.
- Usa auth-boot.js para garantir SDK/config/supa se por algum motivo não tiverem sido carregados.
