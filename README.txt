MIEC — Patch #1 (v4.2.1-auth-min — 2025-08-26)

Este patch inclui:
- amostras de páginas para históricos (html_samples/historico_win.html e historico_motor.html)
- JS para migração/visualização do histórico: js/historico-win.js e js/historico-motor.js
- JS para campos dinâmicos do Validador de Motores: js/validador-motor.patch.js (não substitui o teu ficheiro atual automaticamente)
- CSS adicional: css/patch_v4.2.1.css (podes copiar o conteúdo para o teu css/styles.css ou referenciar este ficheiro)

Como aplicar (recomendado, sem sobrescrever a tua base):
1) Compara as amostras em html_samples/ com as tuas páginas atuais e replica os cabeçalhos, tabelas e IDs.
2) Copia js/historico-win.js e js/historico-motor.js para a pasta js/ do projeto e referencia-os nos respetivos HTMLs.
3) Integra js/validador-motor.patch.js: 
   - Podes renomear para validador-motor.js se desejares substituir, OU
   - Importar a seguir ao teu ficheiro atual para experimentar e depois incorporar.
4) Copia o CSS de css/patch_v4.2.1.css para o teu css/styles.css (ou inclui o ficheiro adicional no HTML).
5) Mantém o footer com a versão: v4.2.1-auth-min — 2025-08-26.

Estratégia “base intacta”:
- Nenhum ficheiro existente é sobrescrito automaticamente.
- Podes renomear as amostras *.html e os *.patch.js conforme precisares.
