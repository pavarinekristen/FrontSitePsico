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
7. Dona abre o PAINEL /admin no site (token de acesso), ve o cadastro
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
- Pede o **token de acesso** (o mesmo `ADMIN_TOKEN` do `.env` da API).
- O token vive **somente em memoria**: recarregar, fechar a aba ou clicar em "Sair" exige digitar de novo. Nada fica salvo no navegador.
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
- Token errado -> API responde 401 e o painel volta para a tela de senha.

## Tokens e credenciais (o que cada um precisa saber)

| Quem | O que precisa | Onde |
|---|---|---|
| Cliente final | Nada de token. So o codigo de 6 digitos que recebe no WhatsApp apos o PIX | Digita no site |
| Dona/equipe | `ADMIN_TOKEN` (senha do painel /admin) | Definido no `.env` da API |
| Dev/deploy | Credenciais MySQL + `ADMIN_TOKEN` | `.env` da API (nunca vai pro front) |

Local (desenvolvimento): a senha do painel e `dev-admin-token`, mas o `.env`
guarda **apenas o hash SHA-256 dela** (`ADMIN_TOKEN_HASH`) — quem ler o arquivo
nao descobre a senha.

Producao: criar token forte (32+ caracteres, guardado num gerenciador de senhas)
e colocar no `.env` **somente o hash**:

```powershell
C:\ClinicaIdeiaApi\tools\php\php.exe -r "echo hash('sha256', 'SEU-TOKEN-AQUI');"
# resultado vai em ADMIN_TOKEN_HASH=...
```

Regras: com `ADMIN_TOKEN_HASH` presente, `ADMIN_TOKEN` e ignorado; hash malformado
= ninguem entra (falha fechado); modo texto puro ainda existe como fallback, mas
tokens fracos/placeholder sao recusados em producao.

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
# senha do painel (dev): dev-admin-token — abaixo somente o hash dela
ADMIN_TOKEN_HASH=1734d503f6aa6a047c36d113cbad769f719c93784b469b771c4c3e7c63adbefd
LOCK_TTL_MINUTES=30
```

Obs: `LOCK_TTL_MINUTES` subiu de 10 para **30** (tempo real de conversa + PIX + codigo).

## Migracoes

```text
001_schema.sql          salas, agenda_slots, reservas
002_add_reservas.sql    (legado) tabela reservas
003_add_confirm_code.sql  confirm_code CHAR(6) + confirm_attempts em reservas
004_add_created_ip.sql    created_ip VARCHAR(45) + indice (rate limit por IP)
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

### Admin (header `X-Admin-Token` obrigatorio)

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

- **SQL injection**: impossivel — 100% prepared statements.
- **XSS**: React escapa toda saida; nenhum `dangerouslySetInnerHTML`.
- **CSRF**: nao aplicavel — sem cookies; token vai em header custom.
- **Timing attack** no token: `hash_equals`.
- **Forca bruta no token admin**: atraso de ~350ms a cada erro 401.
- **Forca bruta no codigo**: 5 tentativas por reserva -> 429.
- **Token fraco em producao**: API recusa token vazio, placeholder (`troque-este-token`) ou com menos de 16 caracteres quando `APP_ENV=production` (falha fechado).
- **Senha do painel nao fica em texto no servidor**: o `.env` guarda apenas o hash SHA-256 (`ADMIN_TOKEN_HASH`); mesmo quem ler o arquivo nao descobre o token.
- **Rate limit de pre-reservas**: maximo **3 locks ativos por IP** -> 429 (impede travar a agenda inteira).
- **Segredos fora do front**: bundle verificado — nenhum token/senha no JavaScript do site. O token admin so existe no `.env` do servidor.
- **`.htaccess` blindado**: nega acesso direto a `/src`, `/database`, `/storage`, `/tools`, `/docs` e dotfiles (`.env`); headers `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.
- **Respostas da API**: `Cache-Control: no-store` + `nosniff` (nada de codigo em cache).
- **Painel admin**: token nunca persiste no navegador (somente memoria).
- IDs publicos em UUID (nao enumeraveis).

### Checklist de deploy (Hostinger)

1. HTTPS ativo (certificado gratis da Hostinger).
2. Criar token forte (32+ caracteres) e colocar no `.env` apenas o `ADMIN_TOKEN_HASH` (SHA-256).
3. `APP_DEBUG=false`.
4. `CORS_ALLOWED_ORIGINS` com o dominio real (sem `*`).
5. Banco/usuario/senha proprios de producao.
6. Importar migracoes 001 -> 004 na ordem.

## Comandos locais

```powershell
# MariaDB rodando?
netstat -ano | Select-String -Pattern ':3317'

# Conectar no banco
& 'C:\Program Files\MariaDB 12.3\bin\mysql.exe' --ssl=0 --host=127.0.0.1 --port=3317 --user=clinica_api --password=clinica_api_dev clinica_ideia

# Subir API local (http://127.0.0.1:8091/api/health)
C:\ClinicaIdeiaApi\tools\php\php.exe -S 127.0.0.1:8091 -t public public/index.php

# Gerar slots (exemplo)
# POST http://127.0.0.1:8091/api/admin/slots/generate
# Header: X-Admin-Token: dev-admin-token
# Body: { "sala_id": "sala1", "start_date": "2026-07-08", "end_date": "2026-07-22",
#         "hours": ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"] }
```

Front local: `.env` com `VITE_API_BASE_URL=http://127.0.0.1:8091/api` + `npm run dev`.

## Estado atual (2026-07-08)

- Banco `clinica_ideia` com migracoes 001-004 aplicadas.
- 2 salas ativas, 120 slots gerados por sala (08-22/07).
- Fluxo testado de ponta a ponta: calendario -> lock -> codigo no painel -> confirmacao no site -> slot vermelho permanente.
- Rate limit por IP testado (4o lock -> 429).
- Codigo errado testado (422) e limite de tentativas ativo.
- Painel /admin completo: token somente em memoria (hash no .env), codigos,
  planilha do dia com navegacao por data, confirmar manualmente, editar e recusar.
- Cancelamento testado: slot voltou a `livre` na agenda.
- Edicao testada: altera apenas os campos enviados (reserva + slot).
- Deploy fica para depois (aguardando plano VPS) — ver checklist acima.
