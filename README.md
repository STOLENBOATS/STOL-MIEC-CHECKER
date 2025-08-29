# M.I.E.C. — Maritime Identification & Engine Checker

Ferramenta forense para validação de **HIN** (Hull Identification Number) e identificação de **motores**.
Interface bilingue (PT/EN), tema dia/noite, histórico e export.

## Como usar
- Abrir `validador.html` no navegador.
- **HIN**: inserir o código; a ferramenta interpreta campos, resolve anos de produção/modelo e aplica regra **pré-1998** (mostra certificado apenas quando aplicável).
- **Motores**: escolher a marca — aparecem apenas os campos dessa marca. Validação ativa: **Yamaha, Honda, Mercury, Suzuki, Volvo Penta**; restantes em modo **parcial** (campos prontos).  
- **Regras Forenses**: `forense_regras.html` com ajuda por marca.

## Estrutura
```
/
├── validador.html
├── historico_hin.html / historico_motor.html
├── forense_regras.html
├── js/
├── css/
└── assets/
```

## Notas
- O ficheiro `js/validador-win.js` é a versão corrigida fornecida pelo utilizador (agosto 2025-08-20).
- Regra **pré-1998**: apenas dispara se os **anos resolvidos** (produção/modelo) forem < 1998; caso contrário, a opção de certificado permanece oculta.
- Marca → campos dinâmicos: editar em `js/validador-motor.js` no objeto **BRAND_REGISTRY**.

## Licença
A definir pela Polícia Marítima. (por omissão: uso interno)


## GitHub Pages
Este repositório inclui um workflow para publicar o site estático.
- Ao fazer *push* para **main**, o workflow **Deploy GitHub Pages** é executado.
- A página de entrada é **index.html** (redireciona para `validador.html`).

Depois do primeiro push para **main**, vê o separador **Actions** e confirma o *deployment* para obter o URL público.
