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
- Mostra cadastros aguardando PIX (com codigo de confirmacao), a planilha do dia e o historico; permite confirmar, editar e cancelar.

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

## Deploy (Hostinger)

1. Ajuste `VITE_API_BASE_URL` para producao e rode `npm run build`.
2. Publique o conteudo de `dist/` na raiz do site.
3. **SPA**: adicione um `.htaccess` na raiz do front redirecionando as requisicoes para `index.html`, senao abrir/atualizar `/admin` direto retorna 404.
4. HTTPS obrigatorio.

Docs de arquitetura mais detalhadas em `docs/obsidian/`.
