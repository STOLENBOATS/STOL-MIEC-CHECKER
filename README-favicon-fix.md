# Favicon fix (evitar 404 no domínio raiz)

**O problema:** algumas páginas estavam com `<link rel="icon" href="/favicon.ico">` (barra inicial), o que faz o browser pedir `https://stolenboats.github.io/favicon.ico` (fora do teu repositório) e dá 404.

**Solução rápida (recomendada):**
1. Coloca `images/favicon.png` na raiz do teu repo (está incluído neste patch).
2. Em cada HTML, certifica-te que tens no `<head>` uma destas linhas **(sem barra inicial)**:
   
   ```html
   <link rel="icon" type="image/png" href="images/favicon.png" />
   ```

3. Se não quiseres editar os HTMLs agora, podes adicionar um `<script defer>` com este conteúdo (runtime fix):
   ```html
   <script>
   (function(){try{
     var link=document.querySelector('link[rel="icon"]');
     if(!link){link=document.createElement('link');link.rel='icon';link.type='image/png';document.head.appendChild(link);}
     if(!link.href || link.getAttribute('href').startsWith('/')){link.type='image/png';link.setAttribute('href','images/favicon.png');}
   }catch(e){}})();
   </script>
   ```

**Dica:** Se preferires `.ico`, coloca `favicon.ico` em `images/` e aponta para `images/favicon.ico`. Evita `href="/favicon.ico"`.
