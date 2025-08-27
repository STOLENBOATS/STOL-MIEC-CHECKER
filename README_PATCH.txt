MIEC — UX & Logic Patch v1
=============================

O que este patch faz
--------------------
1) UI: logo e subtítulo maiores (header), miniaturas com lightbox ao clicar.
2) HIN: aplica regras adicionais sem tocar no teu validador original:
   - Serial (pos. 6–10) **tem de ser alfanumérico** (5 chars).
   - **Ano < 1998** só é aceite **com Certificado de Conformidade** (checkbox + nº/entidade).
   - Mostra país (CC) e fabricante (MIC) se constarem nos codebooks (amostra incluída).
3) Garantia: é *overlay* não intrusivo — não quebra o que já tens.

Ficheiros
---------
- css/styles-override.v1.css      ← overrides seguros (tamanhos + thumb)
- js/lightbox.v1.js               ← zoom ao clicar nas imagens
- js/hin-rules.patch.v1.js        ← regras/annotação HIN (escuta o submit e enriquece o resultado)
- data/countries.min.json         ← amostra de países (pode crescer)
- data/mic.sample.json            ← amostra de MIC (pode crescer)

Como integrar (sem mexer no core)
---------------------------------
1) No <head>, **depois** do teu `css/styles.css`, inclui:
   <link rel="stylesheet" href="css/styles-override.v1.css">

2) No <head>, **depois** do `js/forense-adapter.js` e ANTES de fechar </head>, inclui:
   <script defer src="js/lightbox.v1.js"></script>
   <script defer src="js/hin-rules.patch.v1.js"></script>

3) Faz hard refresh e testa:
   - Introduz um HIN e submete → se o ano < 1998 sem certificado, aparece alerta.
   - Clica numa imagem → abre em overlay.

Notas
-----
- Para o botão "Sair" visível em DEV, garanta no js/config.dev.js: HIDE_LOGIN_IN_DEV: false
- As listas de países/MIC são amostras; depois podemos importar um codebook completo.
