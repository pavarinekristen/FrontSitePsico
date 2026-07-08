# Deploy do front (Hostinger)

O site é publicado automaticamente pelo GitHub Actions a cada push na `main`:
**build no GitHub → envio do `dist/` por FTPS para a Hostinger.**

## O que já está pronto no repositório
- `.github/workflows/deploy.yml` — build (`npm run build`) + deploy FTPS.
- `public/.htaccess` — vai junto no build (`dist/.htaccess`) e resolve o SPA:
  abrir/atualizar `/admin` direto não dá mais 404. Não mexe na subpasta `/api`.
- Build usa `VITE_API_BASE_URL=/api` (API na mesma hospedagem, em `public_html/api`).

## O que falta (parte Hostinger — só uma vez)
1. hPanel → **Arquivos → Contas FTP**: crie/anote uma conta FTP (host, usuário, senha).
2. GitHub → repo **FrontSitePsico** → **Settings → Secrets and variables → Actions → New repository secret** e cadastre:
   | Secret | Valor |
   |---|---|
   | `FTP_SERVER` | host FTP do hPanel (ex.: `ftp.seudominio.com.br`) |
   | `FTP_USERNAME` | usuário FTP |
   | `FTP_PASSWORD` | senha FTP |
   | `FTP_SERVER_DIR` | pasta do site, com barra no fim (ex.: `/public_html/`) |
3. Rode uma vez: **Actions → Deploy front → Run workflow** (ou faça um push na `main`).

> Enquanto os 4 secrets não existirem, a Action até roda o build mas **falha no envio** — é esperado, não quebra nada.

## Importante
- A API fica em `public_html/api` (deploy próprio, via Git da Hostinger). O deploy do front **não apaga** essa subpasta.
- HTTPS/SSL precisa estar ativo (o `.htaccess` força HTTPS).
