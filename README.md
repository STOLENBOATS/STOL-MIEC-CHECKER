
# MIEC — Codebook Tools (r2)

Inclui:
- `data/codebook.json` : template inicial (com alguns placeholders)
- `tools/manufacturers_cin.template.csv` : modelo CSV para editares numa folha
- `tools/csv-to-codebook.html` : página local que converte o CSV em JSON (mapeamento + índice)

## Fluxo sugerido
1. Preenche o CSV com registos confirmados (fonte, URL, data, status, verified).
2. Abre `tools/csv-to-codebook.html` no browser, cola o CSV e clica **Converter**.
3. **Download JSON** e substitui em `data/codebook.json` (ou funde os blocos `manufacturers_*`).

## Fontes Oficiais / Semioficiais
- UK (MIC): British Marine — pesquisa/atribuição pública.
- US: USCG MIC database — útil para cross-check de fabricantes exportadores.
- NL: HISWA-RECRON — atribuição nacional.
- ES: MITMA — documentação oficial e contactos.
- FR: Ministère de la Transition Écologique — procedimentos (code constructeur).

> Nota: as entradas incluídas como exemplo devem ser **substituídas** por dados confirmados.
