---
title: Arquitetura - Instituto Ideia API Agenda
project: ClinicaIdeiaApi
type: arquitetura
stack: PHP 8, PDO MySQL, MariaDB
status: Fluxo completo com confirmacao por codigo
updated: 2026-07-08
---

# Arquitetura - Instituto Ideia API Agenda

## Visao geral

O projeto do Instituto Ideia esta dividido em duas partes:

- `C:\ClinicaPsicologia_Front`: front-end React/Vite do site (inclui o painel `/admin`).
- `C:\ClinicaIdeiaApi`: API PHP/MySQL responsavel por calendario, disponibilidade, pre-reserva (lock), confirmacao por codigo e bloqueio de horarios.

Regra critica do negocio: varias pessoas podem se cadastrar no mesmo dia, mas **nunca pode existir conflito para a mesma sala no mesmo horario**. A concorrencia e resolvida no MySQL com UPDATE atomico.

## Fluxo completo do sistema (atual)

```text
1. Cliente acessa o site e escolhe plano, sala e dia no CALENDARIO visual.
2. Front busca os horarios do dia: GET /api/availability?sala_id=sala1&date=YYYY-MM-DD
   - verde  = livre
   - vermelho = ocupado (lock_temporario, confirmada ou bloqueada_admin)
3. Cliente escolhe horario livre e envia o cadastro.
4. Front chama POST /api/reservations/lock:
   - Slot vira 'lock_temporario' por 30 MINUTOS (atomico no banco)
   - Reserva e criada na tabela `reservas`
   - API gera um CODIGO DE CONFIRMACAO de 6 digitos (aleatorio, unico por reserva)
   - O codigo NUNCA sai na resposta publica: fica escondido no banco
5. WhatsApp abre com os dados + numero da reserva (#XXXXXXXX).
6. Cliente paga o PIX na conversa.
7. Dona faz login no PAINEL /admin (usuario e senha), ve o cadastro
   pendente com o codigo, copia e envia ao cliente pelo WhatsApp.
8. Cliente volta ao site e digita o codigo no painel de resumo.
9. Front chama POST /api/reservations/confirm { reserva_id, codigo }:
   - Codigo certo -> reserva e slot viram 'confirmada' (vermelho permanente)
   - Cliente ve "Reserva confirmada!" na tela
10. Se o codigo nao for usado em 30 min, o lock expira:
    slot volta a 'livre' e a reserva vira 'expirada' automaticamente.
```

## Codigo de confirmacao (como funciona)

- Gerado automaticamente pela API **no momento do lock** (`random_int`, 6 digitos, sempre variando).
- Guardado na coluna `reservas.confirm_code`. Visivel **somente** via `GET /admin/reservations` (exige token admin).
- O cliente so o conhece quando a dona envia pelo WhatsApp (apos o PIX).
- Protecoes:
  - Maximo **5 tentativas erradas** por reserva -> depois bloqueia (HTTP 429).
  - Codigo errado -> HTTP 422.
  - Lock expirado/cancelado -> HTTP 409.
  - Reserva ja confirmada -> tratado como sucesso (idempotente).

## Painel admin (`/admin` no site)

- Rota escondida do front (sem link no menu): `https://dominio.com/admin`.
- Login por **usuario + senha** (`POST /admin/login`), que devolve um token de sessao (12h).
- O token de sessao vive **somente em memoria**: recarregar, fechar a aba ou clicar em "Sair" exige logar de novo. Nada fica salvo no navegador. O cabecalho mostra "Logado como <usuario>".
- Mostra:
  - **Aguardando PIX**: nome, WhatsApp, sala/horario, plano, tempo restante do lock, numero da reserva (#XXXXXXXX) e o **codigo de confirmacao** com botao Copiar. Botoes por cadastro: **Confirmar manualmente** (plano B), **Editar** e **Recusar**.
  - **Cadastros do dia (planilha)**: tabela com horario, sala, cliente, WhatsApp, plano e status. Navegacao por dia (setas, campo de data e botao "Hoje"); dia sem cadastro fica vazio. Linhas ativas tem acoes de editar/cancelar.
  - **Historico recente**: confirmadas, canceladas, expiradas.
- Acoes:
  - **Recusar/Cancelar**: reserva vira `cancelada` e o horario **volta a livre** na agenda (funciona em pendentes e confirmadas).
  - **Editar**: modal para alterar nome, WhatsApp e plano (atualiza reserva + slot; so cadastros ativos).
  - **Confirmar manualmente**: confirma sem codigo (cliente perdeu acesso ao aparelho).
  - Todas pedem confirmacao antes e tem trava contra clique duplo.
- Atualiza sozinho a cada 15 segundos.
- Login/sessao invalida -> API responde 401 e o painel volta para a tela de login.

## Credenciais (o que cada um precisa saber)

| Quem | O que precisa | Onde |
|---|---|---|
| Cliente final | Nada de login. So o codigo de 6 digitos que recebe no WhatsApp apos o PIX | Digita no site |
| Dona/equipe | Usuario + senha do painel /admin | Definidos no `.env` da API (`ADMIN_USERNAME` + hash) |
| Dev/deploy | Credenciais MySQL + `APP_KEY` + `ADMIN_USERNAME`/`ADMIN_PASSWORD_HASH` | `.env` da API (nunca vai pro front) |

O painel usa **login nominal**: `POST /admin/login { username, password }` valida a
credencial e devolve um **token de sessao assinado** (HMAC com `APP_KEY`, valido 12h).
As demais rotas admin exigem `Authorization: Bearer <token>`.

A senha nunca fica em texto no servidor — guarda-se apenas o hash bcrypt
(`ADMIN_PASSWORD_HASH`). Gerar credenciais:

```powershell
C:\ClinicaIdeiaApi\tools\php\php.exe -r "echo bin2hex(random_bytes(32));"          # APP_KEY
C:\ClinicaIdeiaApi\tools\php\php.exe -r "echo password_hash('SUA-SENHA', PASSWORD_DEFAULT);"  # ADMIN_PASSWORD_HASH
```

Sem `APP_KEY` o login fica desabilitado (falha fechado). Login errado -> 401, com
lockout por IP (10 tentativas / 15 min -> 429). Cada login e cada acao sobre dados
de paciente ficam registrados em `audit_log`.

## Linguagens e tecnologias

Front-end: React, TypeScript, Vite, Tailwind CSS.
Back-end: PHP 8.5.8 portatil (`C:\ClinicaIdeiaApi\tools\php`), PDO MySQL, sem framework, camadas Controllers/Services/Repositories/Core.
Banco: MariaDB 12.3.2 local, porta `3317`, banco `clinica_ideia`.

## Banco local de teste

```text
Host: 127.0.0.1 | Porta: 3317
Root: root / root
API:  clinica_api / clinica_api_dev  ->  banco clinica_ideia
```

`.env` atual da API (dev):

```env
APP_ENV=local
APP_DEBUG=true
APP_TIMEZONE=America/Sao_Paulo
API_BASE_PATH=/api
DB_HOST=127.0.0.1
DB_PORT=3317
DB_DATABASE=clinica_ideia
DB_USERNAME=clinica_api
DB_PASSWORD=clinica_api_dev
DB_CHARSET=utf8mb4
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
APP_KEY=<segredo aleatorio para assinar o token de sessao>
ADMIN_USERNAME=Nilza
ADMIN_PASSWORD_HASH=<hash bcrypt da senha do painel>
LOCK_TTL_MINUTES=30
```

Obs: o antigo `ADMIN_TOKEN`/`ADMIN_TOKEN_HASH` (token compartilhado) foi aposentado
em favor do login nominal (`ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH` + `APP_KEY`).

Obs: `LOCK_TTL_MINUTES` subiu de 10 para **30** (tempo real de conversa + PIX + codigo).

## Migracoes

```text
001_schema.sql          salas, agenda_slots, reservas
002_add_reservas.sql    (legado) tabela reservas
003_add_confirm_code.sql  confirm_code CHAR(6) + confirm_attempts em reservas
004_add_created_ip.sql    created_ip VARCHAR(45) + indice (rate limit por IP)
005_add_audit_log.sql     audit_log (trilha de auditoria do painel)
```

## Tabelas principais

### `salas`
`public_id` (sala1, sala2), `numero`, `nome`, `categoria`, `ativa`.

### `agenda_slots`
Um registro = sala + data + horario. `slot_inicio`/`slot_fim` em **UTC**.
Status: `livre` | `lock_temporario` | `confirmada` | `bloqueada_admin`.
Unicidade: `UNIQUE (sala_id, slot_inicio)` — impossivel duplicar horario da mesma sala.

### `reservas`
Cadastro completo criado no lock. Campos novos:

- `confirm_code` CHAR(6): codigo secreto de confirmacao (so visivel no admin).
- `confirm_attempts`: contador de tentativas erradas (bloqueia em 5).
- `created_ip`: IP de origem (rate limit).

Status: `lock_temporario` | `confirmada` | `cancelada` | `expirada`.

### `audit_log`
Trilha de auditoria do painel (LGPD): `username`, `action`, `entity`, `entity_id`,
`meta` (JSON), `ip`, `created_at`. Registra login (sucesso/falha) e cada acao da
equipe sobre reservas/slots (confirmar, cancelar, editar, bloquear, gerar). Leituras
do painel nao sao auditadas (evita ruido do refresh de 15s). Consulta por SQL.

## Endpoints

### Publicos

```text
GET  /api/health
GET  /api/rooms
GET  /api/availability?sala_id=sala1&date=YYYY-MM-DD
POST /api/reservations/lock
     { "slot_id": "...", "cliente_nome": "...", "cliente_whatsapp": "...", "plano": "..." }
     -> retorna reserva_id, slot_id, lock_token, locked_until (NUNCA o codigo)
POST /api/reservations/confirm
     { "reserva_id": "uuid", "codigo": "123456" }
     -> confirma a reserva se o codigo bater
```

### Autenticacao do painel

```text
POST /api/admin/login   { username, password }  ->  { token, username, expires_at }
```

### Admin (header `Authorization: Bearer <token de sessao>` obrigatorio)

```text
GET  /api/admin/reservations           pendentes (com codigo) + historico
GET  /api/admin/reservations/day?date=YYYY-MM-DD  planilha do dia (todos os cadastros)
POST /api/admin/slots/generate         gera slots por sala/periodo/horas
POST /api/admin/reservations/confirm       confirmacao legada (slot_id + lock_token)
POST /api/admin/reservations/confirm-by-id confirmacao manual pela equipe { reserva_id }
                                           (plano B: cliente sem acesso ao aparelho original)
POST /api/admin/reservations/cancel        cancela/recusa { reserva_id } — horario volta a LIVRE
POST /api/admin/reservations/update        edita dados { reserva_id, cliente_nome?, cliente_whatsapp?, plano? }
POST /api/admin/slots/block            bloqueia horario (manutencao etc.)
POST /api/admin/slots/unblock          libera horario
```

## Regra de concorrencia

```sql
UPDATE agenda_slots
SET status = 'lock_temporario', ...
WHERE public_id = :slot_public_id
  AND (status = 'livre'
       OR (status = 'lock_temporario' AND locked_until <= UTC_TIMESTAMP()))
LIMIT 1
```

Duas pessoas no mesmo horario: uma afeta 1 linha, a outra afeta 0 e recebe **409**.
Locks expirados voltam a `livre` automaticamente a cada consulta (`cleanupExpiredLocks`).

## Seguranca implementada

- **SQL injection**: impossivel — 100% prepared statements (`EMULATE_PREPARES=false`).
- **XSS**: React escapa toda saida; nenhum `dangerouslySetInnerHTML`.
- **Autenticacao**: login nominal usuario+senha (bcrypt), token de sessao assinado (HMAC/`APP_KEY`, 12h). Sem `APP_KEY`, login desabilitado (falha fechado).
- **Auditoria (LGPD)**: `audit_log` registra login e acoes da equipe sobre dados de paciente.
- **Timing attack**: `hash_equals` no login e no codigo.
- **Forca bruta**: lockout por IP de 10 tentativas / 15 min (429) no login/admin + atraso de ~350ms por 401; codigo de confirmacao: 5 tentativas por reserva.
- **CORS fail-closed**: sem `*`; so libera origens da allowlist (`CORS_ALLOWED_ORIGINS`).
- **Erros**: stack trace so vai para `storage/logs/app-errors.log`; cliente so recebe detalhes com `APP_ENV=local`.
- **Rate limit de pre-reservas**: maximo **3 locks ativos por IP** -> 429.
- **Segredos fora do front**: bundle verificado — nenhuma chave/senha no JavaScript. So existe `VITE_API_BASE_URL`.
- **`.htaccess` blindado**: forca HTTPS + HSTS, `Permissions-Policy`; nega acesso a `.mysql-data/`, `.git/`, `config/`, `src/`, `database/`, `storage/`, `tools/`, `docs/` e dotfiles; headers `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.
- **Respostas da API**: `Cache-Control: no-store` + `nosniff`.
- **Painel admin**: token de sessao nunca persiste no navegador (somente memoria).
- IDs publicos em UUID (nao enumeraveis).

### Checklist de deploy (Hostinger)

1. HTTPS ativo (certificado gratis da Hostinger).
2. `APP_ENV=production`, `APP_DEBUG=false`.
3. Gerar `APP_KEY` novo + definir `ADMIN_USERNAME` e `ADMIN_PASSWORD_HASH` (bcrypt) no `.env`.
4. `CORS_ALLOWED_ORIGINS` com o dominio real (sem `*`).
5. Banco/usuario/senha proprios de producao.
6. Importar migracoes 001 -> 005 na ordem + seed de salas.
7. Subir so o codigo (nunca `.env`, `.mysql-data/`, `tools/`).

## Comandos locais

```powershell
# MariaDB rodando?
netstat -ano | Select-String -Pattern ':3317'

# Conectar no banco
& 'C:\Program Files\MariaDB 12.3\bin\mysql.exe' --ssl=0 --host=127.0.0.1 --port=3317 --user=clinica_api --password=clinica_api_dev clinica_ideia

# Subir API local (http://127.0.0.1:8091/api/health)
C:\ClinicaIdeiaApi\tools\php\php.exe -S 127.0.0.1:8091 -t public public/index.php

# Login do painel (obter token de sessao)
# POST http://127.0.0.1:8091/api/admin/login  { "username": "Nilza", "password": "..." }

# Gerar slots (exemplo) — usa o token do login acima
# POST http://127.0.0.1:8091/api/admin/slots/generate
# Header: Authorization: Bearer <token de sessao>
# Body: { "sala_id": "sala1", "start_date": "2026-07-08", "end_date": "2026-07-22",
#         "hours": ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"] }
```

Front local: `.env` com `VITE_API_BASE_URL=http://127.0.0.1:8091/api` + `npm run dev`.

## Estado atual (2026-07-08)

- Banco `clinica_ideia` com migracoes 001-005 aplicadas.
- **Login nominal ativo**: usuario `Nilza`, token de sessao (12h), testado ponta a ponta (HTTP): login OK, rota protegida com Bearer, senha errada/sem token -> 401.
- **Auditoria** gravando em `audit_log` (login e acoes da equipe).
- Fluxo de reserva testado: calendario -> lock -> codigo no painel -> confirmacao no site -> slot vermelho permanente.
- Painel /admin: login usuario+senha, codigos, planilha do dia, confirmar manualmente, editar e recusar.
- Front responsivo com menu hamburger no celular; sem estouro horizontal (medido a 390px).
- Codigo em dois repositorios GitHub: `ClinicaPsicoApi` e `FrontSitePsico` (branches `main`/`developer`).
- **Deploy ainda nao feito**: falta `.env` de producao (APP_KEY/credenciais), importar migracoes na Hostinger, `VITE_API_BASE_URL=/api` no build e o `.htaccess` de SPA do front — ver checklist acima.
