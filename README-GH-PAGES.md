# GH Pages Unblock Kit

Este pacote cria as condições mínimas para o GitHub Pages voltar a *deployar* o teu site:

1) **Habilita GitHub Actions no repositório**
   - Settings → Actions → General → *Allow all actions and reusable workflows* (ou *Allow local actions only*)
   - (Opcional) Workflow permissions → *Read and write permissions* → Save

2) **Adiciona o workflow de deploy**
   - Copia `.github/workflows/pages.yml` para a raiz do repo (respeitando a pasta `.github/workflows/`)
   - Faz commit na `main`

3) **Desativa Jekyll (não obrigatório, mas recomendado para sites 100% estáticos)**
   - Coloca o ficheiro vazio `.nojekyll` na **raiz** do repo
   - Faz commit

4) **(Opcional) status.html**
   - Coloca `status.html` na raiz e abre `…/status.html` para confirmar o timestamp e a versão do Supabase carregada.

Após o commit, verifica a aba **Actions** — o workflow `Deploy Pages` deve correr e publicar o teu site.
