
# MIEC — Codebook Pack (r1)

Este pacote inclui:
- `data/codebook.json` — Países (ISO-2), fabricantes por MIC (formato UE/CIN), marcas de motores.
- `js/codebooks-live.v1.js` — Loader + helpers `MIEC_CODEBOOKS.*`
- `js/i18n-mini.r1.js` — Tradução rápida por `data-i18n="key"`

## Como integrar

1. **Copiar** `data/` e `js/` para a tua app.
2. No `<head>` do *validador* e dos *históricos* (antes do uso), incluir:
   ```html
   <script defer src="js/codebooks-live.v1.js"></script>
   <script defer src="js/i18n-mini.r1.js"></script>
   ```
3. Depois de `load`/`DOMContentLoaded`:
   ```js
   await MIEC_CODEBOOKS.load();        // carrega data/codebook.json
   const name = MIEC_CODEBOOKS.micName('FR','CNB'); // → string ou null
   ```

## Exemplo: mostrar fabricante (MIC) no forense
```js
const hin = 'FR-CNBZA135A612';
const cc  = hin.slice(0,2).toUpperCase();
const mic = hin.slice(2,5).toUpperCase();
const mf  = MIEC_CODEBOOKS.micName(cc,mic);
if (mf) document.querySelector('#winForense').innerHTML += '<div><b>Fabricante:</b> '+mf+'</div>';
```

## Traduções rápidas
Coloca `data-i18n="labels.forense_detail"` e chama:
```js
MIEC_I18N.setLang('en');   // ou 'pt'
MIEC_I18N.apply();         // aplica às tags com data-i18n
```

> **Importante**: `codebook.json` contém **exemplos**. Substitui pelos teus dados oficiais (chave = `CC|MIC`).
