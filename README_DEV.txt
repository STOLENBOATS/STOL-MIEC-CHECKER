MIEC — Dev Autologin Pack v1.0
=================================
Este pack permite testar a app sem ter de clicar "Login". Em DEV, a app entra automaticamente num utilizador de teste e o sync funciona.

Arquivos:
- js/dev-autologin.js            ← script de autologin (carregar no validador.html)
- config.dev.example.js          ← exemplo de ficheiro local com flags/credenciais (NÃO commitar)
- README_DEV.txt                 ← estes passos

Como ativar (2 minutos)
-----------------------
1) Crie/valide um utilizador de teste no Supabase (Auth → Users), ex: tester@miec.local com password.
2) Escolha UMA das formas de fornecer credenciais DEV:
   a) LocalStorage (rápido, sem mexer no repo):
      No console do navegador:
        localStorage.setItem('MIEC_DEV_CREDENTIALS', JSON.stringify({ email:'tester@miec.local', password:'SUA_PASSWORD' }));
        localStorage.setItem('MIEC_DEV','1');   // ativa DEV também
   b) Ficheiro local (não commitar):
      - Copie config.dev.example.js para js/config.dev.js
      - Edite DEV_EMAIL/DEV_PASSWORD
      - Adicione js/config.dev.js ao .gitignore
      - No <head> do validador, carregue este ficheiro DEPOIS de js/config.js:
          <script defer src="js/config.dev.js"></script>

3) No validador.html, adicione DEPOIS de history-service.js:
     <script defer src="js/dev-autologin.js"></script>
   (Mantenha o bloco de AUTO-SYNC que já existe.)

4) Em DEV, pode ativar também por URL:
     https://.../validador.html?dev=1
   ou por flag:
     localStorage.setItem('MIEC_DEV','1');

5) Produção: desativar autologin
   - Remover a tag <script src="js/dev-autologin.js"> do HTML, OU
   - Colocar DEV_MODE:false e limpar MIEC_DEV no localStorage:
       localStorage.removeItem('MIEC_DEV');
