# Site Instituto Ideia (front-end)

Site institucional + agendamento do Instituto Ideia (coworking psicologico em Uberlandia-MG).
SPA em React que consome a API PHP `ClinicaIdeiaApi`.

Repositorio: `https://github.com/pavarinekristen/FrontSitePsico`
Branches: `main` (producao) e `developer` (homologacao). Trabalho novo entra por `feat/*` -> PR -> `developer` -> `main`.

## Stack

- React 19 + TypeScript
- Vite (build/dev)
- Tailwind CSS
- react-router-dom (`/` e `/admin`)
- lucide-react (icones) e framer-motion (animacoes)
- Lint: oxlint

## Estrutura

```txt
src/
├── assets           imagens e global.css
├── components       secoes da home (Hero, Planos, FAQ, etc.)
├── features/agendamento
│   ├── components   BookingSection, BookingForm, RoomCard, AgendaCalendar
│   └── data         rooms.ts (salas, planos, horarios fallback)
├── hooks            useClipboard
├── layouts          Header (com menu mobile), Footer, MainLayout
├── pages            HomePage, AdminPage
├── services         agendaApi.ts, whatsappService.ts
├── types            sala.ts, agendamento.ts
└── utils            cn.ts, formatDate.ts
```

## Rotas

- `/` — home completa (hero, sobre, beneficios, fluxo, planos, salas, calendario + formulario, servicos, depoimentos, FAQ, contato).
- `/admin` — painel da equipe (sem link no site). Login por **usuario + senha**.

## Painel `/admin`

- Login com usuario e senha (`POST /admin/login` na API); o token de sessao vive **somente em memoria** (recarregar/fechar exige logar de novo).
- Cabecalho mostra "Logado como <usuario>"; sessao expirada volta para o login.
- **Atualiza sozinho a cada 15s** (a dona nao precisa clicar em "Atualizar").
- **Aviso de nova solicitacao**: quando entra uma reserva nova ("Aguardando PIX"), toca 2 bipes (Web Audio, sem arquivo) + mostra um toast na tela + notificacao do navegador (se permitida) + contador na aba. Botao de sino no cabecalho liga/desliga o som. O audio e a permissao sao liberados no gesto de login.
- Secoes: **Aguardando PIX** (com codigo de confirmacao), **planilha do dia** e **Historico**.
- **Historico**: busca por nome, selecao (uma a uma ou "selecionar todos"), excluir selecionados / excluir um / excluir todos (com confirmacao). A exclusao nunca afeta cadastros pendentes/ativos e e auditada na API.
- Acoes por cadastro: confirmar manualmente, editar (nome/WhatsApp/plano) e cancelar (libera o horario).
- **Gerar horarios da agenda**: hoje e feito por chamada admin na API (`POST /admin/slots/generate`), nao ha botao no painel ainda.

## Responsividade

Layout mobile-first (Tailwind). O cabecalho tem **menu hamburger** no celular; o conteudo empilha em coluna unica sem estouro horizontal.

## Integracao com a API (`src/services/agendaApi.ts`)

```env
# dev
VITE_API_BASE_URL=http://127.0.0.1:8091/api
# producao (API em public_html/api)
VITE_API_BASE_URL=/api
```

As chamadas do painel enviam o token de sessao no header `Authorization: Bearer <token>`.
O `.env` do front so contem `VITE_API_BASE_URL` — nenhum segredo vai para o bundle.

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # dev server em http://localhost:5173 (reiniciar se mudar o .env)
npm run build    # gera dist/ (roda tsc + vite build)
npm run lint     # oxlint
npm run preview  # preview do build
```

Depende da API rodando (ver `ClinicaIdeiaApi`).

## Estado atual (producao)

Tudo no ar em **https://clinicaideia.com.br**:

- Site publicado; API em `public_html/api` respondendo em `/api` (PHP 8.2, MySQL da Hostinger).
- Login do painel funcionando (usuario `Nilza`).
- Agenda com horarios gerados (8h-16h, com pausa de almoco) ate 31/12/2026, nas 2 salas.
- Painel com historico (busca/exclusao) e aviso sonoro de nova solicitacao.

Credenciais e dados sensiveis NAO ficam no repositorio (o `.env` de producao vive so no servidor).

## Deploy — como funciona hoje

### API (automatica) — repo `ClinicaPsicoApi`
A API e PHP puro (sem build). Usa o **Git nativo da Hostinger + Webhook**: cada `push` na
`main` faz a Hostinger dar `git pull` sozinha em `public_html/api`. **Ja esta ligado e funcionando.**
Detalhes em `ClinicaIdeiaApi/DEPLOY.md`.

### Site/front (manual por enquanto) — este repo
O site precisa de **build** (`npm run build`), entao nao da pra usar o `git pull` simples.
O deploy automatico por **GitHub Actions** (build + envio por FTP) esta pronto no repo
(`.github/workflows/deploy.yml` + secrets de FTP cadastrados + repo publico), mas **nao roda
porque a conta do GitHub esta bloqueada por billing**. Enquanto isso nao for resolvido, o
front sobe **manualmente** assim:

```bash
# 1. gerar o site (usa .env.production -> VITE_API_BASE_URL=/api)
npm run build

# 2. empacotar o conteudo de dist/ (com o .htaccess) num zip
#    (no Windows, via PowerShell:)
#    Compress-Archive -Path (Get-ChildItem dist -Force | % FullName) -DestinationPath site.zip -Force
```

Depois, no **hPanel -> Gerenciador de Arquivos -> `public_html`**:

1. Apagar o `index.html` e a pasta `assets` antigos (**manter a pasta `api`**).
2. Enviar o zip -> botao direito -> **Extrair**.
3. Apagar o zip; no navegador dar **Ctrl+Shift+R** (ou aba anonima).

> Importante: o build deve rodar com `VITE_API_BASE_URL=/api` vindo de arquivo (`.env.production`),
> nunca passado na linha de comando do Git Bash — la o `/api` vira um caminho do Windows
> (`C:/Program Files/Git/api`) e quebra o site. Por isso o valor fica fixo em `.env.production`.

Quando a conta do GitHub for desbloqueada (billing), o front volta a subir sozinho a cada push
(basta o repo publico + os 4 secrets de FTP, que ja existem): `FTP_SERVER`, `FTP_USERNAME`,
`FTP_PASSWORD`, `FTP_SERVER_DIR` (`/public_html/`).

### `.htaccess` do front (SPA)
O `public/.htaccess` vai junto no build (`dist/.htaccess`) e resolve a rota `/admin` (sem 404 ao
recarregar) e forca HTTPS. Nao precisa cria-lo a mao.

Docs de arquitetura mais detalhadas em `docs/obsidian/`.
