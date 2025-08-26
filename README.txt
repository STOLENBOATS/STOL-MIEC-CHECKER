MIEC — Históricos Fix v1.1 (v4.2.1-auth-min)

Objetivo
- Corrigir erro "Cannot set properties of null (setting 'innerHTML')" quando o JS corre antes do DOM ou quando os IDs diferem.
- Tornar os scripts dos históricos (WIN e Motores) tolerantes a IDs e à ordem de carregamento.

Como aplicar
1) Substituir os ficheiros do projeto por estes:
   - js/historico-win.js
   - js/historico-motor.js
2) Garante que os <script> têm `defer` OU são carregados depois da tabela.
3) Manter as colunas das tabelas como já tens. Os scripts procuram automaticamente o <tbody> e criam-no se faltar.
4) (Opcional) Os scripts aceitam campos extra (ex.: certificate/issuer no WIN). Se as colunas não existirem, apenas ficam vazias.

Compatibilidade
- Mantém chaves canónicas do localStorage: `miec_history_win` e `miec_history_motor` (com migração tolerante de chaves antigas).
- Compatível com o Patch #2 (cloud sync): continua a ler o localStorage (após o pull).

