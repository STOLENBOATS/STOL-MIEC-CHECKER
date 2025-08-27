MIEC — Codebooks Live v1
=========================
Carregamento dinâmico de Países (ISO-3166-1) e MIC (fabricantes de casco).

Arquitetura
-----------
- js/codebooks-live.v1.js  → expõe window.MIEC_CODEBOOKS com load(), countryName(), micName()
- data/countries.min.json → fallback local (curto); online usa REST Countries e guarda cache 7 dias
- data/mic.local.json     → seed local de MICs; podes aumentar livremente
- js/hin-rules.patch.v1.1.js → patch do validador HIN que usa MIEC_CODEBOOKS se existir

Integração
----------
1) No <head>, antes do hin-rules, carrega:
   <script defer src="js/codebooks-live.v1.js"></script>

2) Substitui o hin-rules antigo pelo novo v1.1:
   <script defer src="js/hin-rules.patch.v1.1.js"></script>

3) (Opcional) Configurar fontes MIC online (exemplo CSV):
   Antes de carregar codebooks-live.v1.js, define:
   <script>
     window.MIEC_MIC_SOURCES = [
       // Exemplo: CSV gov com colunas MIC, Company
       { type:'csv', url:'https://SEU_URL/MIC.csv', code:'MIC', name:'Company' },
       // Exemplo: JSON plano { "ABC":"Nome", ... }
       { type:'json', url:'https://SEU_URL/mic.json' }
     ];
   </script>

Notas
-----
- Países: obtidos de https://restcountries.com (cache local 7 dias). Se offline, usa fallback local.
- MICs: por omissão usa data/mic.local.json; podes apontar para uma lista oficial e o loader funde os dados.
