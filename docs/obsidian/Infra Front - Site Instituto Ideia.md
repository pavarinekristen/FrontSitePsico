---
title: Infra Front - Site Instituto Ideia
project: ClinicaPsicologia_Front
type: arquitetura
stack: React, TypeScript, Vite, Tailwind CSS
status: Integrado a API propria com calendario e confirmacao por codigo
updated: 2026-07-08
---

# Infra Front - Site Instituto Ideia

## Visão Geral

Front-end do site do Instituto Ideia: captação, calendário de disponibilidade em tempo real, pré-reserva com bloqueio automático de horário e **confirmação por código** após o PIX.

> Nota: a versão antiga usava Google Forms/Sheets e não tinha banco próprio.
> Isso foi substituído pela API própria (`C:\ClinicaIdeiaApi`). Este documento reflete o estado atual.

Promessa do produto agora:

```text
O site pré-reserva o horário na hora (30 min).
Após o PIX, o cliente confirma no próprio site com o código enviado pela equipe.
```

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | React 19 |
| Linguagem | TypeScript |
| Build tool | Vite |
| Estilo | Tailwind CSS |
| Ícones | lucide-react |
| Animações | framer-motion |
| Roteamento | react-router-dom (`/` e `/admin`) |
| Integração | API PHP própria + WhatsApp |

## Estrutura De Pastas

```text
src
├── assets              imagens e global.css
├── components          seções visuais da home (Hero, Planos, FAQ, etc.)
├── features
│   └── agendamento
│       ├── components  BookingSection, BookingForm, RoomCard, AgendaCalendar
│       └── data        rooms.ts (salas, planos, horários fallback)
├── hooks               useClipboard
├── layouts             Header, Footer, MainLayout
├── pages               HomePage, AdminPage
├── services            agendaApi.ts, whatsappService.ts
├── types               sala.ts, agendamento.ts
└── utils               cn.ts, formatDate.ts
```

## Rotas

```text
/        Home completa (hero, sobre, benefícios, fluxo, planos, salas,
         calendário + formulário, serviços, depoimentos, FAQ, contato)
/admin   Painel da equipe (escondido — sem link no site)
```

## Integração com a API (`src/services/agendaApi.ts`)

Variável de ambiente (`.env`):

```env
# dev
VITE_API_BASE_URL=http://127.0.0.1:8091/api
# produção (API em public_html/api)
VITE_API_BASE_URL=/api
```

Funções:

- `getAvailability(salaId, date)` — slots do dia (verde/vermelho).
- `lockSlot(payload)` — trava o horário por 30 min e cria a reserva.
- `confirmReservation(reservaId, codigo)` — confirma com o código de 6 dígitos.
- `adminLogin(username, password)` — faz login no painel; retorna `{ token, username, expires_at }`.
- `getAdminReservations(token)` — lista pendentes (com código) + histórico.
- `getAdminDayReservations(token, date)` — cadastros de um dia (planilha).
- `adminConfirmReservation(token, reservaId)` — confirmação manual.
- `adminCancelReservation(token, reservaId)` — cancela/recusa (libera o horário).
- `adminUpdateReservation(token, reservaId, changes)` — edita nome/WhatsApp/plano.

As funções admin enviam o token de sessão no header `Authorization: Bearer <token>`.

## Calendário (`AgendaCalendar.tsx`)

- Calendário mensal no padrão visual do site (dia selecionado azul, hoje com anel amarelo).
- Dias passados desabilitados; não navega para meses anteriores (fuso America/Sao_Paulo).
- Ao escolher o dia, o front busca a disponibilidade real na API.
- Grade de horários: **verde = livre**, **vermelho = ocupado** (Em espera/Reservado), azul = selecionado. Legenda incluída.
- Sem API (offline), cai em "Modo local" com horários padrão apenas informativos.

## Fluxo do Cliente (`BookingForm.tsx`)

```text
1. Escolhe plano, sala e dia no calendário -> horários reais da API.
2. Preenche nome e WhatsApp, escolhe horário livre e envia.
3. Front chama POST /reservations/lock:
   - horário fica bloqueado 30 min (vermelho para todo mundo)
   - abre o WhatsApp com resumo + nº da reserva (#XXXXXXXX)
4. Painel de resumo mostra "Já recebeu o código? Digite aqui".
5. Cliente paga o PIX; equipe envia o código de 6 dígitos.
6. Cliente digita o código -> "✓ Reserva confirmada!" e a agenda atualiza.
```

Detalhes:

- A reserva pendente fica salva no `sessionStorage` (`ideia-reserva-pendente`):
  se a pessoa trocar de aba para o WhatsApp e voltar, o campo de código continua lá.
  Some ao fechar a aba, e o `lock_token` NÃO é persistido (reduz exposição a XSS).
- Conflito de horário (outra pessoa travou antes) -> mensagem clara + agenda recarregada.
- Código errado/expirado -> mensagem de erro da API exibida no painel.

## Painel Admin (`AdminPage.tsx`)

- URL: `/admin` (sem link em lugar nenhum do site).
- Login: **usuário + senha** (`POST /admin/login` na API); erro -> 401. O cabeçalho
  mostra "Logado como <usuário>".
- **Segurança: o token de sessão vive somente em memória.** Recarregar, fechar a aba,
  navegar para fora ou clicar em "Sair" exige logar de novo. Nada é salvo no navegador;
  sessão expirada (12h) volta para a tela de login.
- Mostra:
  - **Aguardando PIX**: cliente, WhatsApp, sala/horário, plano, tempo restante,
    nº da reserva e o **código de confirmação** em destaque com botão Copiar.
    Botões por cadastro: **Confirmar manualmente**, **Editar** e **Recusar**.
  - **Cadastros do dia**: planilha com Horário, Sala, Cliente, WhatsApp, Plano,
    Status e Ações. Navegação por dia (setas ◀ ▶, campo de data, botão "Hoje").
    Dia sem cadastros -> "Nenhum cadastro neste dia".
  - **Histórico recente**: confirmadas / canceladas / expiradas.
- Ações da equipe:
  - **Recusar/Cancelar** (card pendente ou linha da planilha): pede confirmação;
    a reserva vira cancelada e o horário **volta a ficar livre** no calendário.
    Funciona também em reservas já confirmadas (desistência).
  - **Editar**: modal com Nome, WhatsApp e Plano (dropdown dos 4 planos);
    salva só o que mudou. Disponível para cadastros pendentes e confirmados.
  - **Confirmar manualmente**: plano B quando o cliente não consegue digitar
    o código (ex.: voltou em outro aparelho).
  - Trava de "processando": impossível disparar duas ações ao mesmo tempo.
- Auto-atualiza a cada 15 segundos; botão Atualizar manual.

## WhatsApp (`whatsappService.ts`)

Número atual: `553499710952` (exibido como +55 34 9971-0952).

Mensagem gerada no cadastro:

```text
Olá! Quero verificar disponibilidade no Instituto Ideia.

• Plano desejado: ...
• Sala: ...
• Data: ...
• Horário: ...
• Nome: ...
• WhatsApp: ...
• Reserva: #XXXXXXXX

O horário já está pré-reservado para mim. Após o PIX, por favor me envie
o código de confirmação para eu finalizar no site. Obrigado(a)!
```

O nº `#XXXXXXXX` (8 primeiros caracteres do UUID) é o mesmo que aparece
no painel admin — serve para a equipe achar o cadastro certo.

## Segurança do Front

- **Nenhum segredo no bundle**: verificado — senhas e chaves nunca aparecem no
  JavaScript do site. Só existe `VITE_API_BASE_URL`.
- Login: usuário + senha validados na API; o token de sessão fica só em memória e
  é enviado no header `Authorization: Bearer`.
- Reserva pendente em `sessionStorage` sem o `lock_token` (menor exposição a XSS).
- O código de confirmação nunca chega ao front antes da hora: a API não o
  retorna na resposta pública do lock.
- React escapa todo conteúdo (sem XSS); links externos com `noopener,noreferrer`.
- A rota `/admin` escondida NÃO é a proteção — a proteção real é o login
  validado no servidor a cada requisição.

## Experiência Visual

Hero com lâmpada interativa (corda clicável liga/apaga a página) —
`HeroSection.tsx`, estado em `HomePage.tsx`. Identidade: azul `#1A3E8B`,
navy `#0F2657`, amarelo `#FFC20E`, fontes Fredoka + Nunito Sans.

Responsivo (mobile-first Tailwind): sem estouro horizontal no celular e o
cabeçalho (`Header.tsx`) tem **menu hamburger** que abre os links de navegação
em telas pequenas (some no desktop).

## Comandos

```bash
npm install      # instalar
npm run dev      # http://127.0.0.1:5173 (reiniciar se mudar o .env)
npm run build    # gera dist/
npm run lint     # oxlint
npm run preview  # preview do build
```

Dependência local: API rodando em `http://127.0.0.1:8091` (ver doc da API).

## Deploy

- Build: `npm run build` -> publicar `dist/`.
- Hostinger: front em `public_html/`, API em `public_html/api/`,
  com `VITE_API_BASE_URL=/api` no build.
- SPA: configurar fallback de rotas para `index.html`
  (senão `/admin` dá 404 ao acessar direto). **Ainda pendente** — criar `.htaccess` do front.
- HTTPS obrigatório (token de sessão trafega em header).

## Riscos Atuais

| Risco | Impacto | Mitigação |
|---|---|---|
| Lock expira antes do PIX (30 min) | Médio | Cliente cadastra de novo; TTL ajustável no .env da API |
| Cliente troca de aba e perde o resumo | Baixo | Reserva pendente restaurada via sessionStorage |
| Alguém tentar adivinhar o código | Baixo | 5 tentativas por reserva -> bloqueio (API) |
| Esquecer `APP_KEY`/credenciais no deploy | Alto | Sem `APP_KEY` o login fica desabilitado (falha fechado); senha só em hash bcrypt |

## Próximos Passos

- Deploy (aguardando plano VPS): criar `.htaccess` do front (fallback SPA para
  `/admin`), rebuild com `VITE_API_BASE_URL=/api`, gerar token forte + hash.
- Countdown visível do lock no site do cliente.
- Notificação para a equipe a cada novo cadastro (e-mail/WhatsApp).
- Geração automática/periódica de slots futuros (hoje é manual via API).
- Área logada para psicólogos recorrentes (longo prazo).
- Pagamento PIX automático (longo prazo).
